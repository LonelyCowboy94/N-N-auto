"use server"
import { db } from "@/db";
import { workOrders, expenses, customers, vehicles } from "@/db/schema";
import { eq, and, sql, gte, lte } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getCurrentMonthStats() {
  const session = await getServerSession(authOptions);
  const shopId = (session?.user as any).shopId;

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // 1. Prihod tekućeg meseca
  const revenueRes = await db.select({ total: sql<number>`sum(${workOrders.totalAmount})` })
    .from(workOrders)
    .where(and(
      eq(workOrders.shopId, shopId),
      eq(workOrders.status, "završen"),
      gte(workOrders.dateEntry, firstDay),
      lte(workOrders.dateEntry, lastDay)
    ));

  // 2. Troškovi tekućeg meseca
  const expensesRes = await db.select({ total: sql<number>`sum(${expenses.amount})` })
    .from(expenses)
    .where(and(
      eq(expenses.shopId, shopId),
      gte(expenses.createdAt, firstDay),
      lte(expenses.createdAt, lastDay)
    ));

  // 3. Broj poseta (Nalozi kreirani u ovom mesecu)
  const visitsRes = await db.select({ count: sql<number>`count(*)` })
    .from(workOrders)
    .where(and(eq(workOrders.shopId, shopId), gte(workOrders.dateEntry, firstDay), lte(workOrders.dateEntry, lastDay)));

  return {
    revenue: Number(revenueRes[0]?.total || 0),
    expenses: Number(expensesRes[0]?.total || 0),
    visits: Number(visitsRes[0]?.count || 0),
    profit: Number(revenueRes[0]?.total || 0) - Number(expensesRes[0]?.total || 0)
  };
}