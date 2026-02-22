"use server"
import { db } from "@/db";
import { workOrders, workOrderItems, customers, vehicles } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createWorkOrder(data: any) {
  const session = await getServerSession(authOptions);
  const shopId = (session?.user as any).shopId;

  try {
    // 1. KLIJENT (Ako nema ID, napravi novog)
    let customerId = data.customerId;
    if (!customerId) {
      const [newCust] = await db.insert(customers).values({
        name: data.customerName,
        phone: data.customerPhone,
        address: data.customerAddress,
        shopId
      }).returning();
      customerId = newCust.id;
    }

    // 2. VOZILO (Ako je nova registracija, napravi novo)
    const [newVeh] = await db.insert(vehicles).values({
  make: data.vehicleData.makeModel.split(' ')[0] || "Nepoznato",
  model: data.vehicleData.makeModel.split(' ').slice(1).join(' ') || "Nepoznato",
  plateNumber: data.vehicleData.plates,
  vin: data.vehicleData.vin,
  year: data.vehicleData.year,
  displacement: data.vehicleData.displacement,
  power: data.vehicleData.power,
  fuelType: data.vehicleData.fuelType,
  customerId,
  shopId
}).returning();

    // 3. BROJ NALOGA
    const lastOrder = await db.query.workOrders.findFirst({
      where: eq(workOrders.shopId, shopId),
      orderBy: [desc(workOrders.number)]
    });
    
    // Logika za generisanje (00001 -> 00002)
    let nextNumber = "00001";
    if (lastOrder) {
      let num = parseInt(lastOrder.number) + 1;
      nextNumber = num.toString().padStart(5, '0');
    }

    // 4. INSERT NALOGA
    const [order] = await db.insert(workOrders).values({
      number: nextNumber,
      customerId,
      vehicleId: newVeh.id,
      shopId,
      totalAmount: data.totalAmount,
      status: "otvoren"
    }).returning();

    // 5. INSERT STAVKI
    if (data.items.length > 0) {
      await db.insert(workOrderItems).values(
        data.items.map((i: any) => ({
          workOrderId: order.id,
          type: i.type,
          description: i.description,
          quantity: i.quantity,
          price: i.price,
          total: i.quantity * i.price
        }))
      );
    }

    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateOrderStatus(id: string, newStatus: string) {
  try {
    await db.update(workOrders)
      .set({ status: newStatus })
      .where(eq(workOrders.id, id));
    revalidatePath(`/dashboard/documents/${id}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function completeWorkOrder(id: string) {
  try {
    await db.update(workOrders)
      .set({ status: "završen" })
      .where(eq(workOrders.id, id));
    
    revalidatePath(`/dashboard/documents/${id}`);
    revalidatePath("/dashboard/documents");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteWorkOrder(id: string) {
  const session = await getServerSession(authOptions);
  const shopId = (session?.user as any).shopId;

  try {
    // 1. Prvo brišemo stavke (delove i usluge) zbog stranog ključa
    await db.delete(workOrderItems).where(eq(workOrderItems.workOrderId, id));
    
    // 2. Brišemo sam nalog (proveravamo shopId radi sigurnosti)
    await db.delete(workOrders).where(
      and(
        eq(workOrders.id, id),
        eq(workOrders.shopId, shopId)
      )
    );

    revalidatePath("/dashboard/documents");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}