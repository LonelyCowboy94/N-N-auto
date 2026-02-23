import { getVehicleWithHistory } from "@/app/actions/vehicles";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, FileText, History, Gauge, 
  Fuel, Zap, User, AlertTriangle, ArrowUpRight 
} from "lucide-react";
import DeleteVehicleButton from "@/components/DeleteVehicleButton";

export default async function VehicleHistoryPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const vehicle = await getVehicleWithHistory(id);

  if (!vehicle) return notFound();

  // --- LOGIKA ZA KILOMETRAŽU ---
  const orders = (vehicle as any).workOrders || [];
  
  // 1. Poslednja uneta kilometraža (nalozi su sortirani DESC po datumu, pa je prvi najnoviji)
  const lastMileage = orders.length > 0 ? orders[0].mileage : null;

  // 2. Provera nepravilnosti (da li je ikada upisana manja KM od prethodne hronološki)
  let hasMileageIssue = false;
  if (orders.length > 1) {
    for (let i = 0; i < orders.length - 1; i++) {
      // Pošto su sortirani DESC (novi ka starim), 
      // orders[i] (noviji) ne sme biti manji od orders[i+1] (stariji)
      if (orders[i].mileage && orders[i+1].mileage && orders[i].mileage < orders[i+1].mileage) {
        hasMileageIssue = true;
        break;
      }
    }
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-background text-foreground min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vehicles" className="p-2 border border-border hover:bg-muted transition-colors bg-card shadow-sm group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
              Vozilo: <span className="text-primary">{vehicle.plateNumber}</span>
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
              <div className="space-y-5">
                <Detail icon={<Gauge size={14}/>} label="Šasija (VIN)" value={vehicle.vin} isMono />
                <Detail icon={<Zap size={14}/>} label="Snaga (kW/KS)" value={vehicle.power} />
                <Detail icon={<History size={14}/>} label="Zapremina" value={vehicle.displacement ? `${vehicle.displacement} ccm` : null} />
                <Detail icon={<Fuel size={14}/>} label="Vrsta goriva" value={vehicle.fuelType} />
                
                {/* POSLEDNJA KM SA ALARMOM */}
                <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <Gauge size={14} />
                        <p className="text-[8px] font-black uppercase tracking-widest">Poslednja KM</p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-black text-foreground">
                            {lastMileage ? `${lastMileage.toLocaleString()} KM` : '---'}
                        </p>
                        {hasMileageIssue && (
                            <div className="flex items-center gap-1 text-red-500 animate-pulse">
                                <AlertTriangle size={10} />
                                <span className="text-[9px] font-bold uppercase">Nepravilnost sa kilometražom</span>
                            </div>
                        )}
                    </div>
                </div>
              </div>
           </div>
        </div>

        {/* DESNA KOLONA: HRONOLOGIJA NALOGA */}
        <div className="lg:col-span-3 space-y-5">
          <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] italic text-muted-foreground">
            <History size={18} className="text-primary" /> Hronološki pregled radova
          </h4>
          
          <div className="grid grid-cols-1 gap-3">
            {orders.length > 0 ? (
              orders.map((order: any) => (
                <Link 
                  key={order.id} 
                  href={`/dashboard/documents/${order.id}`}
                  className="block bg-card border border-border p-5 hover:border-primary transition-all group shadow-sm relative overflow-hidden"
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-5">
                      <div className="p-3 bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all border border-border">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                            <p className="font-black text-sm uppercase italic tracking-tighter text-foreground">Radni Nalog #{order.number}</p>
                            <span className="text-[10px] font-mono font-black text-primary bg-primary/5 px-2 py-0.5 border border-primary/20">
                                {order.mileage?.toLocaleString()} KM
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                          Datum: {new Date(order.dateEntry).toLocaleDateString('sr-RS')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg text-foreground italic tracking-tighter">
                         {order.totalAmount?.toLocaleString('sr-RS')} <small className="text-[10px] not-italic text-muted-foreground">RSD</small>
                      </p>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest border px-2 py-0.5 ${
                            order.status === 'otvoren' ? 'border-blue-500 text-blue-500' : 'border-green-600 text-green-600'
                        }`}>
                            {order.status}
                        </span>
                        <ArrowUpRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
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

// --- POMOĆNA KOMPONENTA ZA TEHNIČKE DETALJE ---
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