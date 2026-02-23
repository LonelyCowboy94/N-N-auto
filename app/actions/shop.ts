"use server"
import { db } from "@/db";
import { shops } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function getShopSettings() {
  const session = await getServerSession(authOptions);
  const shopId = (session?.user as any)?.shopId;

  if (!shopId) return null;

  const [shop] = await db
    .select()
    .from(shops)
    .where(eq(shops.id, shopId));

  return shop || null;
}

// 1. Čuvanje svih tekstualnih podataka
export async function updateShopSettings(formData: FormData) {
  const session = await getServerSession(authOptions);
  const shopId = (session?.user as any)?.shopId;
  if (!shopId) throw new Error("Unauthorized");

  const data = {
    name: formData.get("name") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    pib: formData.get("pib") as string,
    maticniBroj: formData.get("maticniBroj") as string,
    phone: formData.get("phone") as string,
    emailShop: formData.get("emailShop") as string,
    theme: formData.get("theme") as string,
    // NOVO: Pretvaramo string iz forme u broj za bazu
    taxRate: Number(formData.get("taxRate") || 0), 
  };

  try {
    await db.update(shops).set(data).where(eq(shops.id, shopId));
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

// 2. Čuvanje novog logotipa + BRISANJE STAROG
export async function updateShopLogo(newUrl: string) {
  const session = await getServerSession(authOptions);
  const shopId = (session?.user as any)?.shopId;

  if (!shopId) return { error: "Unauthorized" };

  try {
    // A. Pronađi trenutni logo u bazi
    const [currentShop] = await db.select({ logoUrl: shops.logoUrl })
      .from(shops)
      .where(eq(shops.id, shopId));

    // B. Ako postoji stari logo, obriši ga sa UploadThing-a
    if (currentShop?.logoUrl) {
      // URL format: https://utfs.io/f/FILE_KEY
      const fileKey = currentShop.logoUrl.split("/f/")[1];
      if (fileKey) {
        await utapi.deleteFiles(fileKey);
      }
    }

    // C. Upis novog URL-a u bazu
    await db.update(shops).set({ logoUrl: newUrl }).where(eq(shops.id, shopId));

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (e: any) {
    console.error("Greška pri zameni logotipa:", e);
    return { error: "Došlo je do greške na serveru." };
  }
}