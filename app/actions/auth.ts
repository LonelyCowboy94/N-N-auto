"use server"
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

export async function changePassword(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) return { error: "Niste ulogovani." };

  const oldPassword = formData.get("oldPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  try {
    // 1. Pronađi korisnika u bazi
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    // 2. Proveri staru lozinku
    const isOldCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isOldCorrect) {
      return { error: "Trenutna lozinka nije ispravna." };
    }

    // 3. Validacija nove lozinke (10+ chars, Uppercase, Number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/;
    if (!passwordRegex.test(newPassword)) {
      return { error: "Nova lozinka ne ispunjava uslove sigurnosti." };
    }

    // 4. Hesiraj novu lozinku i upiši u bazu
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users)
      .set({ password: hashedNewPassword })
      .where(eq(users.id, userId));

    revalidatePath("/dashboard/settings");
    return { success: "Lozinka je uspešno promenjena!" };
  } catch (e: any) {
    return { error: "Greška na serveru." };
  }
}

export async function updateProfileName(name: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  await db.update(users).set({ name }).where(eq(users.id, userId));
  revalidatePath("/dashboard/settings");
  return { success: true };
}