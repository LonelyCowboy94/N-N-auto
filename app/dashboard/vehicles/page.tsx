import { getVehiclesList } from "@/app/actions/vehicles";
import VehiclesTable from "@/components/VehiclesTable";

export default async function VehiclesPage() {
  const data = await getVehiclesList();

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Vozni Park</h1>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">
          Pregled svih registrovanih vozila u sistemu
        </p>
      </div>

      <VehiclesTable initialData={data} />
    </div>
  );
}