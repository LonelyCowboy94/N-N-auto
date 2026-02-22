import { getVehicleWithHistory } from "@/app/actions/vehicles";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, FileText, History, Gauge, Fuel, Zap, User } from "lucide-react";
import DeleteVehicleButton from "@/components/DeleteVehicleButton";

export default async function VehicleHistoryPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const vehicle = await getVehicleWithHistory(id);

  if (!vehicle) return notFound();

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* HEADER SA AKCIJAMA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vehicles" className="p-2 border border-border hover:bg-muted transition-colors bg-card shadow-sm">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-foreground leading-none">
              Istorija: <span className="text-primary">{vehicle.plateNumber}</span>
            </h1>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
              <User size={12} className="text-primary" />
              {vehicle.customer ? vehicle.customer.name : 'Nema vlasnika'} — {vehicle.make} {vehicle.model} ({vehicle.year})
            </p>
          </div>
        </div>

        <DeleteVehicleButton id={vehicle.id} plateNumber={vehicle.plateNumber} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEVA KOLONA: TEHNIČKI KARTON */}
        <div className="lg:col-span-1 space-y-4">
           <div className="bg-card border border-border p-6 space-y-6 shadow-sm border-t-4 border-t-primary">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic flex items-center gap-2">
                 <Zap size={14} /> Tehnički podaci
              </h4>
              <div className="space-y-4">
                <Detail icon={<Gauge size={14}/>} label="Šasija (VIN)" value={vehicle.vin} isMono />
                <Detail icon={<Zap size={14}/>} label="Snaga (kW/KS)" value={vehicle.power} />
                <Detail icon={<History size={14}/>} label="Zapremina" value={vehicle.displacement ? `${vehicle.displacement} ccm` : null} />
                <Detail icon={<Fuel size={14}/>} label="Vrsta goriva" value={vehicle.fuelType} />
              </div>
           </div>
        </div>

        {/* DESNA KOLONA: LISTA SVIH NALOGA */}
        <div className="lg:col-span-3 space-y-5">
          <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] italic text-muted-foreground">
            <History size={18} className="text-primary" /> Hronološki pregled radova
          </h4>
          
          <div className="grid grid-cols-1 gap-3">
            {(vehicle as any).workOrders && (vehicle as any).workOrders.length > 0 ? (
              (vehicle as any).workOrders.map((order: any) => (
                <Link 
                  key={order.id} 
                  href={`/dashboard/documents/${order.id}`}
                  className="block bg-card border border-border p-5 hover:border-primary transition-all group shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-5">
                      <div className="p-3 bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all border border-border">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase italic tracking-tighter text-foreground">Radni Nalog #{order.number}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                          Datum: {new Date(order.dateEntry).toLocaleDateString('sr-RS')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg text-foreground italic tracking-tighter">
                         {order.totalAmount?.toLocaleString('sr-RS')} <small className="text-[10px] not-italic text-slate-500">RSD</small>
                      </p>
                      <span className={`text-[9px] font-black uppercase tracking-widest border px-2 py-0.5 mt-1 inline-block ${
                          order.status === 'otvoren' ? 'border-blue-500 text-blue-500' : 'border-green-600 text-green-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-20 border border-dashed border-border text-center text-muted-foreground italic text-sm bg-card/20">
                Nema zabeleženih servisnih intervencija za ovo vozilo.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ icon, label, value, isMono = false }: { icon: any, label: string, value: string | null, isMono?: boolean }) {
  return (
    <div className="group">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
         {icon}
         <p className="text-[8px] font-black uppercase tracking-widest">{label}</p>
      </div>
      <p className={`text-xs font-black text-foreground uppercase border-b border-border/50 pb-1 ${isMono ? 'font-mono tracking-widest text-[11px]' : ''}`}>
        {value || '---'}
      </p>
    </div>
  );
}