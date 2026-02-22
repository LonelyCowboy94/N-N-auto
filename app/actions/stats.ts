"use server"
import { db } from "@/db";
import { workOrders, expenses, customers, vehicles } from "@/db/schema";
import { eq, and, sql, gte, lte, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getMonthlyStats(month: number, year: number) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  const shopId = (session.user as any).shopId;

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  // 1. Prihodi (Zatvoreni nalozi)
  const revenueRes = await db.select({ total: sql<number>`sum(${workOrders.totalAmount})` })
    .from(workOrders)
    .where(and(
        eq(workOrders.shopId, shopId), 
        eq(workOrders.status, "završen"), 
        gte(workOrders.dateEntry, startDate), 
        lte(workOrders.dateEntry, endDate)
    ));

  // 2. Troškovi
  const costs = await db.select().from(expenses)
    .where(and(eq(expenses.shopId, shopId), gte(expenses.createdAt, startDate), lte(expenses.createdAt, endDate)))
    .orderBy(desc(expenses.createdAt));

  // 3. Posete (Svi nalozi u mesecu)
  const visitsRes = await db.select({ count: sql<number>`count(*)` })
    .from(workOrders)
    .where(and(eq(workOrders.shopId, shopId), gte(workOrders.dateEntry, startDate), lte(workOrders.dateEntry, endDate)));

  // 4. Novi Klijenti u tom mesecu
  const newCustomersRes = await db.select({ count: sql<number>`count(*)` })
    .from(customers)
    .where(and(eq(customers.shopId, shopId), gte(customers.createdAt, startDate), lte(customers.createdAt, endDate)));

  // 5. Nova Vozila u tom mesecu
  const newVehiclesRes = await db.select({ count: sql<number>`count(*)` })
    .from(vehicles)
    .where(and(eq(vehicles.shopId, shopId), gte(vehicles.createdAt, startDate), lte(vehicles.createdAt, endDate)));

  const totalRevenue = Number(revenueRes[0]?.total || 0);
  const totalExpenses = costs.reduce((acc, curr) => acc + curr.amount, 0);

  return {
    revenue: totalRevenue,
    expenseTotal: totalExpenses,
    profit: totalRevenue - totalExpenses,
    visits: Number(visitsRes[0]?.count || 0),
    newCustomers: Number(newCustomersRes[0]?.count || 0),
    newVehicles: Number(newVehiclesRes[0]?.count || 0),
    expensesList: JSON.parse(JSON.stringify(costs)) // Siguran prenos datuma
  };
}

export async function addExpense(description: string, amount: number, category: string) {
  const session = await getServerSession(authOptions);
  const shopId = (session?.user as any).shopId;
  await db.insert(expenses).values({ description, amount, category, shopId });
  revalidatePath("/dashboard/stats");
  return { success: true };
}

export async function deleteExpense(id: string) {
  await db.delete(expenses).where(eq(expenses.id, id));
  revalidatePath("/dashboard/stats");
  return { success: true };
}