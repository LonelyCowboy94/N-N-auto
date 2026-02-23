"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Save, Plus, Trash2, Loader2, User, Car, 
  MessageSquare, MapPin, Phone, Gauge, ChevronLeft, 
  Wrench, Settings 
} from "lucide-react";
import { updateWorkOrder } from "@/app/actions/work-orders";
import { useRouter } from "next/navigation";

// --- POMOĆNE KOMPONENTE ---
const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <h3 className="text-primary font-black uppercase text-[10px] tracking-[0.2em] italic border-b border-border pb-2 flex items-center gap-2">
    <Icon size={14} /> {title}
  </h3>
);

const SharpInput = ({ icon: Icon, label, ...props }: any) => (
  <div className="space-y-1 w-full text-left">
    {label && <label className="block text-[8px] font-black uppercase text-muted-foreground ml-1">{label}</label>}
    <div className="relative w-full">
      {Icon && <Icon className="absolute left-3 top-3 text-muted-foreground" size={14} />}
      <input 
        {...props} 
        className={`w-full bg-background border border-border rounded-none px-3 py-2.5 text-sm outline-none focus:border-primary transition-all text-foreground font-medium placeholder:text-slate-700 ${Icon ? 'pl-10' : ''}`} 
      />
    </div>
  </div>
);

export default function EditOrderForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Inicijalizacija stanja
  const [customer, setCustomer] = useState(initialData.customer);
  const [items, setItems] = useState(initialData.items);
  const [note, setNote] = useState(initialData.note || "");
  const [vehicle, setVehicle] = useState({ 
    id: initialData.vehicle.id,
    makeModel: `${initialData.vehicle.make} ${initialData.vehicle.model}`,
    plates: initialData.vehicle.plateNumber,
    year: initialData.vehicle.year || "",
    vin: initialData.vehicle.vin || "",
    displacement: initialData.vehicle.displacement || "",
    fuelType: initialData.vehicle.fuelType || "Dizel",
    kw: initialData.vehicle.power?.split('/')[0] || "",
    hp: initialData.vehicle.power?.split('/')[1] || "",
    mileage: initialData.mileage?.toString() || "" 
  });

  // kW <-> KS konverzija
  const handleKwChange = (val: string) => {
    const num = parseFloat(val);
    setVehicle({ ...vehicle, kw: val, hp: !isNaN(num) ? Math.round(num * 1.35962).toString() : "" });
  };

  const handleHpChange = (val: string) => {
    const num = parseFloat(val);
    setVehicle({ ...vehicle, hp: val, kw: !isNaN(num) ? Math.round(num / 1.35962).toString() : "" });
  };

  // Dodavanje stavke (Dopunjeno za tip)
  const addItem = (type: "PART" | "SERVICE") => {
    setItems([...items, { id: crypto.randomUUID(), type, description: "", quantity: 1, price: 0 }]);
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map((item: any) => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateTotal = () => items.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0);

  const handleUpdate = async () => {
    setLoading(true);
    const powerString = `${vehicle.kw}/${vehicle.hp}`;
    const res = await updateWorkOrder(initialData.id, {
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      vehicleId: vehicle.id,
      vehicleData: { ...vehicle, power: powerString },
      note,
      mileage: vehicle.mileage,
      items,
      totalAmount: calculateTotal()
    });

    if (res.success) {
      window.location.href = `/dashboard/documents/${initialData.id}`;
    } else {
      alert(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 bg-background text-foreground min-h-screen">
      
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 border border-border hover:bg-muted transition-all active:scale-95">
            <ChevronLeft size={20}/>
          </button>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Izmena Naloga #{initialData.number}</h1>
        </div>
        <button onClick={handleUpdate} disabled={loading} className="bg-primary text-white px-8 py-3 font-black text-xs uppercase tracking-widest active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Sačuvaj Izmene
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEVO: KLIJENT I VOZILO */}
        <div className="space-y-8">
          <section className="space-y-4">
            <SectionTitle icon={User} title="I - Naručilac" />
            <SharpInput value={customer.name} onChange={(e: any) => setCustomer({...customer, name: e.target.value})} placeholder="Ime i prezime" />
            <SharpInput icon={Phone} value={customer.phone} onChange={(e: any) => setCustomer({...customer, phone: e.target.value})} placeholder="Telefon" />
          </section>

          <section className="space-y-4">
            <SectionTitle icon={Car} title="II - Vozilo" />
            <div className="grid grid-cols-2 gap-3">
              <SharpInput value={vehicle.makeModel} onChange={(e: any) => setVehicle({...vehicle, makeModel: e.target.value})} className="col-span-2" placeholder="Marka i model" />
              <SharpInput value={vehicle.plates} onChange={(e: any) => setVehicle({...vehicle, plates: e.target.value})} placeholder="Registracija" />
              <SharpInput value={vehicle.year} onChange={(e: any) => setVehicle({...vehicle, year: e.target.value})} placeholder="Godište" />
              <SharpInput icon={Gauge} type="number" value={vehicle.mileage} onChange={(e: any) => setVehicle({...vehicle, mileage: e.target.value})} placeholder="Kilometraža" className="col-span-2" />
              <SharpInput value={vehicle.vin} onChange={(e: any) => setVehicle({...vehicle, vin: e.target.value})} className="col-span-2 font-mono" placeholder="VIN" />
              <div className="relative"><input type="number" value={vehicle.kw} onChange={(e) => handleKwChange(e.target.value)} className="w-full bg-background border border-border px-3 py-2.5 text-sm outline-none focus:border-primary text-foreground" placeholder="kW" /><span className="absolute right-2 top-3 text-[9px] font-black opacity-40 uppercase">kW</span></div>
              <div className="relative"><input type="number" value={vehicle.hp} onChange={(e) => handleHpChange(e.target.value)} className="w-full bg-background border border-border px-3 py-2.5 text-sm outline-none focus:border-primary text-foreground" placeholder="ks" /><span className="absolute right-2 top-3 text-[9px] font-black opacity-40 uppercase">ks</span></div>
            </div>
          </section>

          <section className="space-y-4">
            <SectionTitle icon={MessageSquare} title="III - Napomena" />
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-background border border-border px-4 py-3 text-sm min-h-32 resize-none italic outline-none focus:border-primary text-foreground" />
          </section>
        </div>

        {/* DESNO: TABELA STAVKI */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-[10px] uppercase font-bold tracking-wider">
              <thead className="bg-muted text-muted-foreground border-b border-border text-left">
                <tr>
                  <th className="px-4 py-4 w-16">Tip</th>
                  <th className="px-4 py-4">Opis stavke</th>
                  <th className="px-4 py-4 w-20 text-center">Kol.</th>
                  <th className="px-4 py-4 w-28 text-right">Cena</th>
                  <th className="px-4 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className={`px-4 py-3 text-[9px] font-black italic ${item.type === 'PART' ? 'text-orange-500' : 'text-primary'}`}>
                        {item.type}
                    </td>
                    <td className="px-4 py-3">
                        <input value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} className="w-full bg-transparent outline-none text-foreground focus:text-primary font-bold" />
                    </td>
                    <td className="px-4 py-3">
                        <input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value))} className="w-full bg-transparent outline-none text-center font-mono" />
                    </td>
                    <td className="px-4 py-3">
                        <input type="number" value={item.price} onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value))} className="w-full bg-transparent outline-none text-right font-mono" />
                    </td>
                    <td className="px-4 py-3 text-center">
                        <button onClick={() => setItems(items.filter((i: any) => i.id !== item.id))} className="text-muted-foreground hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* DUGMAD ZA DODAVANJE (Ažurirano) */}
            <div className="p-3 bg-muted/20 border-t border-border flex gap-2">
              <button onClick={() => addItem("PART")} className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-[10px] font-black uppercase tracking-tighter hover:opacity-90 transition-all">
                <Plus size={12} /> Dodaj Deo
              </button>
              <button onClick={() => addItem("SERVICE")} className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-[10px] font-black uppercase tracking-tighter hover:opacity-90 transition-all">
                <Plus size={12} /> Dodaj Rad/Uslugu
              </button>
            </div>
          </div>

          <div className="bg-card border-2 border-primary border-dashed p-10 flex justify-between items-center text-foreground font-black italic shadow-xl">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Ukupan iznos</p>
                <p className="text-[9px] text-muted-foreground uppercase not-italic font-bold opacity-60">Proračun uključuje sve izmene</p>
             </div>
             <div className="text-right">
                <span className="text-6xl tracking-tighter">{calculateTotal().toLocaleString('sr-RS', { minimumFractionDigits: 2 })}</span>
                <span className="ml-3 text-sm text-primary uppercase tracking-widest">RSD</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}