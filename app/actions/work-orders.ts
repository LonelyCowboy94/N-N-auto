"use server"
import { db } from "@/db";
import { workOrders, workOrderItems, customers, vehicles } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 1. KREIRANJE NOVOG NALOGA
export async function createWorkOrder(data: any) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  const shopId = (session?.user as any).shopId;

  try {
    // A. REŠAVANJE KLIJENTA
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

    // B. REŠAVANJE VOZILA (Smart Logic - No Duplicates)
    let vehicleId = data.vehicleId;
    const plates = data.vehicleData.plates.toUpperCase().trim();

    if (!vehicleId) {
      const [existingVehicle] = await db.select()
        .from(vehicles)
        .where(and(eq(vehicles.plateNumber, plates), eq(vehicles.shopId, shopId)));

      if (existingVehicle) {
        vehicleId = existingVehicle.id;
        await db.update(vehicles).set({
            vin: data.vehicleData.vin || existingVehicle.vin,
            year: data.vehicleData.year || existingVehicle.year,
            displacement: data.vehicleData.displacement || existingVehicle.displacement,
            power: data.vehicleData.power || existingVehicle.power,
            fuelType: data.vehicleData.fuelType || existingVehicle.fuelType,
        }).where(eq(vehicles.id, vehicleId));
      } else {
        const [newVeh] = await db.insert(vehicles).values({
          make: data.vehicleData.makeModel.split(' ')[0] || "Nepoznato",
          model: data.vehicleData.makeModel.split(' ').slice(1).join(' ') || "Nepoznato",
          plateNumber: plates,
          vin: data.vehicleData.vin,
          year: data.vehicleData.year,
          displacement: data.vehicleData.displacement,
          power: data.vehicleData.power,
          fuelType: data.vehicleData.fuelType,
          customerId,
          shopId
        }).returning();
        vehicleId = newVeh.id;
      }
    }

    // C. GENERISANJE BROJA NALOGA
    const lastOrder = await db.query.workOrders.findFirst({
      where: eq(workOrders.shopId, shopId),
      orderBy: [desc(workOrders.number)]
    });
    let nextNumber = lastOrder ? (parseInt(lastOrder.number) + 1).toString().padStart(5, '0') : "00001";

    // D. UPIS RADNOG NALOGA
    const [order] = await db.insert(workOrders).values({
      number: nextNumber,
      customerId,
      vehicleId,
      shopId,
      note: data.note,
      mileage: Number(data.mileage) || 0,
      totalAmount: data.totalAmount,
      status: "otvoren"
    }).returning();

    // E. UPIS STAVKI
    if (data.items.length > 0) {
      await db.insert(workOrderItems).values(
        data.items.map((i: any) => ({
          workOrderId: order.id,
          type: i.type,
          description: i.description,
          quantity: Number(i.quantity),
          price: Number(i.price),
          total: Number(i.quantity) * Number(i.price)
        }))
      );
    }

    revalidatePath("/dashboard/documents");
    revalidatePath("/dashboard/vehicles");
    return { success: true, id: order.id };
  } catch (e: any) {
    console.error(e);
    return { error: e.message };
  }
}

// 2. AŽURIRANJE POSTOJEĆEG NALOGA (EDIT)
export async function updateWorkOrder(id: string, data: any) {
    const session = await getServerSession(authOptions);
    const shopId = (session?.user as any).shopId;
  
    try {
      // A. Ažuriraj podatke o klijentu (ako su promenjeni u edit formi)
      await db.update(customers)
        .set({ name: data.customerName, phone: data.customerPhone, address: data.customerAddress })
        .where(eq(customers.id, data.customerId));
  
      // B. Ažuriraj tehničke podatke vozila
      await db.update(vehicles)
        .set({
          vin: data.vehicleData.vin,
          year: data.vehicleData.year,
          displacement: data.vehicleData.displacement,
          power: data.vehicleData.power,
          fuelType: data.vehicleData.fuelType
        })
        .where(eq(vehicles.id, data.vehicleId));
  
      // C. Ažuriraj glavni nalog
      await db.update(workOrders)
        .set({
          note: data.note,
          mileage: Number(data.mileage),
          totalAmount: data.totalAmount,
        })
        .where(and(eq(workOrders.id, id), eq(workOrders.shopId, shopId)));
  
      // D. SINHRONIZACIJA STAVKI: Brišemo sve stare i upisujemo trenutno stanje iz forme
      await db.delete(workOrderItems).where(eq(workOrderItems.workOrderId, id));
  
      if (data.items.length > 0) {
        await db.insert(workOrderItems).values(
          data.items.map((i: any) => ({
            workOrderId: id,
            type: i.type,
            description: i.description,
            quantity: Number(i.quantity),
            price: Number(i.price),
            total: Number(i.quantity) * Number(i.price)
          }))
        );
      }
  
      revalidatePath("/dashboard/documents");
      revalidatePath(`/dashboard/documents/${id}`);
      revalidatePath("/dashboard/vehicles");
      return { success: true };
    } catch (e: any) {
      return { error: e.message };
    }
}

// 3. OSTALE POMOĆNE AKCIJE
export async function updateOrderStatus(id: string, newStatus: string) {
  try {
    await db.update(workOrders).set({ status: newStatus }).where(eq(workOrders.id, id));
    revalidatePath(`/dashboard/documents/${id}`);
    revalidatePath("/dashboard/documents");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function completeWorkOrder(id: string) {
  try {
    await db.update(workOrders).set({ status: "završen" }).where(eq(workOrders.id, id));
    revalidatePath(`/dashboard/documents/${id}`);
    revalidatePath("/dashboard/documents");
    revalidatePath("/dashboard/stats");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteWorkOrder(id: string) {
  const session = await getServerSession(authOptions);
  const shopId = (session?.user as any).shopId;
  try {
    await db.delete(workOrderItems).where(eq(workOrderItems.workOrderId, id));
    await db.delete(workOrders).where(and(eq(workOrders.id, id), eq(workOrders.shopId, shopId)));
    revalidatePath("/dashboard/documents");
    revalidatePath("/dashboard/stats");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}