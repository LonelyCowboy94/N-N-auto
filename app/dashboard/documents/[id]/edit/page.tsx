import { db } from "@/db";
import { workOrders, customers, vehicles, workOrderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import EditOrderForm from "./EditOrderForm";

export default async function EditOrderPage(props: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await props.params;

  const [order] = await db.select().from(workOrders).where(eq(workOrders.id, id));
  if (!order) return notFound();

  const [customer] = await db.select().from(customers).where(eq(customers.id, order.customerId));
  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, order.vehicleId));
  const items = await db.select().from(workOrderItems).where(eq(workOrderItems.workOrderId, id));

  const initialData = {
    ...order,
    customer,
    vehicle,
    items
  };

  return (
    <div className="p-6 lg:p-10">
      <EditOrderForm initialData={initialData} />
    </div>
  );
}