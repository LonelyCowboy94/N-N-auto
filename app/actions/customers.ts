"use server"
import { db } from "@/db";
import { customers, vehicles } from "@/db/schema";
import { eq, ilike, and, or } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Tvoja postojeća akcija za auto-suggest na nalogu
export async function searchCustomers(query: string) {
  const session = await getServerSession(authOptions);
  const shopId = (session?.user as any).shopId;
  if (!query || query.length < 2) return [];

  return await db.select().from(customers)
    .where(and(eq(customers.shopId, shopId), ilike(customers.name, `%${query}%`)))
    .limit(5);
}

export async function getCustomerVehicles(customerId: string) {
  const session = await getServerSession(authOptions);
  const shopId = (session?.user as any).shopId;

  if (!customerId) return [];

  return await db.select().from(vehicles)
    .where(and(
      eq(vehicles.customerId, customerId),
      eq(vehicles.shopId, shopId)
    ));
}

// Nova akcija za povlačenje svih klijenata sa njihovim vozilima
export async function getCustomersList() {
  const session = await getServerSession(authOptions);
  const shopId = (session?.user as any).shopId;

  // Koristimo query.findMany jer je najelegantniji za relacije (with vehicles)
  return await db.query.customers.findMany({
    where: eq(customers.shopId, shopId),
    with: {
      vehicles: true
    },
    orderBy: (customers, { desc }) => [desc(customers.id)]
  });
}

export async function saveCustomer(data: any) {
  const session = await getServerSession(authOptions);
  const shopId = (session?.user as any).shopId;

  try {
    if (data.id) {
      // EDIT
      await db.update(customers)
        .set({ name: data.name, phone: data.phone, address: data.address })
        .where(and(eq(customers.id, data.id), eq(customers.shopId, shopId)));
    } else {
      // NEW
      await db.insert(customers).values({
        name: data.name,
        phone: data.phone,
        address: data.address,
        shopId
      });
    }
    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

// Akcija za ručnu izmenu podataka (npr. pogrešio si telefon pri pisanju naloga)
export async function updateCustomer(id: string, data: any) {
    const session = await getServerSession(authOptions);
    const shopId = (session?.user as any).shopId;

    await db.update(customers)
        .set(data)
        .where(and(eq(customers.id, id), eq(customers.shopId, shopId)));
    
    revalidatePath("/dashboard/customers");
    return { success: true };
}

export async function deleteCustomer(id: string) {
  const session = await getServerSession(authOptions);
  const shopId = (session?.user as any).shopId;

  try {
    // Prvo brišemo vozila klijenta (zbog stranog ključa)
    await db.delete(vehicles).where(and(eq(vehicles.customerId, id), eq(vehicles.shopId, shopId)));
    // Zatim brišemo klijenta
    await db.delete(customers).where(and(eq(customers.id, id), eq(customers.shopId, shopId)));
    
    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}