import { getCustomersList } from "@/app/actions/customers";
import CustomersTable from "@/components/CustomersTable";

export default async function CustomersPage() {
  const data = await getCustomersList();

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Baza Klijenata</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">
             Evidencija vlasnika i servisiranih vozila
          </p>
        </div>
      </div>
      <CustomersTable initialData={data} />
    </div>
  );
}