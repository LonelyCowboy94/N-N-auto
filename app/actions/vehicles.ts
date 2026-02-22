"use server"
import { db } from "@/db";
import { vehicles, workOrders, workOrderItems, customers } from "@/db/schema";
import { eq, and, asc, desc, inArray } from "drizzle-orm"; // Dodato and, inArray
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getVehiclesList() {
  const session = await getServerSession(authOptions);
  const shopId = (session?.user as any).shopId;

  return await db.query.vehicles.findMany({
    where: eq(vehicles.shopId, shopId),
    with: { customer: true },
    orderBy: [asc(vehicles.make), asc(vehicles.model)]
  });
}

export async function getVehicleWithHistory(vehicleId: string) {
  const session = await getServerSession(authOptions);
  const shopId = (session?.user as any).shopId;

  return await db.query.vehicles.findFirst({
    where: and(eq(vehicles.id, vehicleId), eq(vehicles.shopId, shopId)),
    with: {
      customer: true,
      workOrders: {
        orderBy: [desc(workOrders.dateEntry)]
      }
    }
  });
}

export async function deleteVehicle(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  const shopId = (session.user as any).shopId;

  try {
    // 1. Pronađi sve naloge za ovo vozilo
    const orders = await db.select({ id: workOrders.id })
      .from(workOrders)
      .where(and(eq(workOrders.vehicleId, id), eq(workOrders.shopId, shopId)));

    const orderIds = orders.map(o => o.id);

    // 2. Obriši stavke i naloge ako postoje
    if (orderIds.length > 0) {
      await db.delete(workOrderItems).where(inArray(workOrderItems.workOrderId, orderIds));
      await db.delete(workOrders).where(inArray(workOrders.id, orderIds));
    }

    // 3. Obriši vozilo
    await db.delete(vehicles).where(and(eq(vehicles.id, id), eq(vehicles.shopId, shopId)));

    revalidatePath("/dashboard/vehicles");
    return { success: true };
  } catch (e: any) {
    console.error(e);
    return { error: e.message };
  }
}