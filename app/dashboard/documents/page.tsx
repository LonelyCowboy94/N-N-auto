import { db } from "@/db";
import { workOrders, customers, vehicles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Plus } from "lucide-react";
import DocumentsTable from "@/components/DocumentsTable";

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions);
  const shopId = (session?.user as any).shopId;

  const allOrders = await db
    .select({
      id: workOrders.id,
      number: workOrders.number,
      status: workOrders.status,
      date: workOrders.dateEntry,
      total: workOrders.totalAmount,
      customerName: customers.name,
      vehicleModel: vehicles.model,
      vehiclePlates: vehicles.plateNumber,
    })
    .from(workOrders)
    .innerJoin(customers, eq(workOrders.customerId, customers.id))
    .innerJoin(vehicles, eq(workOrders.vehicleId, vehicles.id))
    .where(eq(workOrders.shopId, shopId))
    .orderBy(desc(workOrders.dateEntry));

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Dokumentacija</h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Lista svih radnih naloga i računa</p>
        </div>
        <Link 
          href="/dashboard/documents/new" 
          className="bg-primary text-white px-6 py-3 font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus size={18} className="inline mr-2" /> Novi radni nalog
        </Link>
      </div>

      <DocumentsTable initialOrders={allOrders} />
    </div>
  );
}