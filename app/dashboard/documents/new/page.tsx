"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Plus, Trash2, Loader2, User, Car, MessageSquare, MapPin, Phone, Gauge, History, Zap } from "lucide-react";
import { searchCustomers, getCustomerVehicles } from "@/app/actions/customers";
import { createWorkOrder } from "@/app/actions/work-orders";
import { getShopSettings } from "@/app/actions/shop"; 

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
        className={`w-full bg-background border border-border rounded-none px-3 py-2.5 text-sm outline-none focus:border-primary transition-all text-foreground font-medium placeholder:text-slate-700 ${Icon ? 'pl-10' : ''} ${props.className || ""}`} 
      />
    </div>
  </div>
);

export default function NewWorkOrder() {
  const [loading, setLoading] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  
  // --- STATE ---
  const [customer, setCustomer] = useState({ id: "", name: "", phone: "", address: "" });
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [customerVehicles, setCustomerVehicles] = useState<any[]>([]);
  const [showVehicles, setShowVehicles] = useState(false);
  const [note, setNote] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [vehicle, setVehicle] = useState({ 
    id: "", makeModel: "", plates: "", year: "", vin: "",
    displacement: "", fuelType: "Dizel", kw: "", hp: "", mileage: "" 
  });

  const customerRef = useRef<HTMLDivElement>(null);
  const vehicleRef = useRef<HTMLDivElement>(null);

  // --- LOGIKA ZA POREZ ---
  useEffect(() => {
    async function fetchSettings() {
      const shop = await getShopSettings();
      if (shop) setTaxRate(shop.taxRate || 0);
    }
    fetchSettings();
  }, []);

  const netTotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const vatTotal = netTotal * (taxRate / 100);
  const grossTotal = netTotal + vatTotal;

  // --- LOGIKA ZA KLIK VAN POLJA (Hiding suggestions) ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Ako klik nije unutar customerRef-a, skloni klijente
      if (customerRef.current && !customerRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
      // Ako klik nije unutar vehicleRef-a, skloni vozila
      if (vehicleRef.current && !vehicleRef.current.contains(event.target as Node)) {
        setShowVehicles(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- kW / KS DVOSMERNA LOGIKA ---
  const handleKwChange = (val: string) => {
    const num = parseFloat(val);
    setVehicle({ ...vehicle, kw: val, hp: !isNaN(num) ? Math.round(num * 1.35962).toString() : "" });
  };

  const handleHpChange = (val: string) => {
    const num = parseFloat(val);
    setVehicle({ ...vehicle, hp: val, kw: !isNaN(num) ? Math.round(num / 1.35962).toString() : "" });
  };

  // --- PRETRAGA KLIJENATA ---
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (customer.name.length > 1 && !customer.id) {
        const res = await searchCustomers(customer.name);
        setSuggestions(res);
      } else { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [customer.name, customer.id]);

  const handleSelectCustomer = async (c: any) => {
    setCustomer({ id: c.id, name: c.name, phone: c.phone || "", address: c.address || "" });
    setSuggestions([]);
    const vData = await getCustomerVehicles(c.id);
    setCustomerVehicles(vData);
    if (vData.length > 0) setShowVehicles(true);
  };

  const handleSelectVehicle = (v: any) => {
    const [kw, hp] = (v.power || "").split("/");
    setVehicle({
      id: v.id, makeModel: `${v.make} ${v.model}`, plates: v.plateNumber,
      year: v.year || "", vin: v.vin || "", displacement: v.displacement || "",
      fuelType: v.fuelType || "Dizel", kw: kw || "", hp: hp || "", mileage: ""
    });
    setShowVehicles(false);
  };

  const addItem = (type: "PART" | "SERVICE") => {
    setItems([...items, { id: crypto.randomUUID(), type, description: "", quantity: 1, price: 0 }]);
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = async () => {
    if (!customer.name || !vehicle.makeModel || !vehicle.plates) {
      alert("Ime, Model i Registracija su obavezni.");
      return;
    }
    setLoading(true);
    try {
      const res = await createWorkOrder({
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        vehicleId: vehicle.id,
        vehicleData: { 
            ...vehicle, 
            power: vehicle.kw && vehicle.hp ? `${vehicle.kw}/${vehicle.hp}` : "" 
        },
        note,
        mileage: vehicle.mileage,
        items,
        totalAmount: netTotal
      });
      if (res.success) window.location.href = "/dashboard/documents";
      else { alert(res.error); setLoading(false); }
    } catch (e) { setLoading(false); }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-background text-foreground min-h-screen">
      
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Novi Radni Nalog</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">Sistem za digitalno servisiranje v1.3</p>
        </div>
        <button onClick={handleSave} disabled={loading} className="bg-primary text-white px-8 py-3 font-black text-xs uppercase tracking-widest active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center gap-2 transition-all">
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Sačuvaj nalog
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEVA KOLONA */}
        <div className="space-y-8">
          
          <section className="space-y-4" ref={customerRef}>
            <SectionTitle icon={User} title="I - Podaci o klijentu" />
            <div className="relative">
              <SharpInput 
                value={customer.name} 
                onChange={(e: any) => { setCustomer({...customer, name: e.target.value, id: ""}); setCustomerVehicles([]); }} 
                placeholder="Ime i prezime / Firma" 
              />
              {suggestions.length > 0 && (
                <div className="absolute z-50 w-full bg-card border border-border shadow-2xl mt-0">
                  {suggestions.map(c => (
                    <div key={c.id} onClick={() => handleSelectCustomer(c)} className="p-3 hover:bg-primary hover:text-white cursor-pointer text-sm border-b border-border last:border-0 transition-colors uppercase font-bold">{c.name}</div>
                  ))}
                </div>
              )}
            </div>
            <SharpInput icon={Phone} value={customer.phone} onChange={(e: any) => setCustomer({...customer, phone: e.target.value})} placeholder="Telefon" />
            <SharpInput icon={MapPin} value={customer.address} onChange={(e: any) => setCustomer({...customer, address: e.target.value})} placeholder="Adresa klijenta" />
          </section>

          <section className="space-y-4" ref={vehicleRef}>
            <SectionTitle icon={Car} title="II - Podaci o vozilu" />
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 relative">
                <SharpInput 
                  value={vehicle.makeModel} 
                  onFocus={() => customer.id && customerVehicles.length > 0 && setShowVehicles(true)}
                  onChange={(e: any) => setVehicle({...vehicle, makeModel: e.target.value, id: ""})} 
                  placeholder="Marka i model" 
                />
                {showVehicles && customerVehicles.length > 0 && (
                  <div className="absolute z-40 w-full bg-slate-900 border border-primary shadow-2xl mt-0">
                    <div className="bg-primary text-[8px] text-white px-2 py-1 font-black uppercase italic">Vozila u bazi:</div>
                    {customerVehicles.map(v => (
                      <div key={v.id} onClick={() => handleSelectVehicle(v)} className="p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-0 text-white">
                        <p className="font-bold uppercase italic text-xs">{v.make} {v.model} ({v.plateNumber})</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <SharpInput value={vehicle.plates} onChange={(e: any) => setVehicle({...vehicle, plates: e.target.value})} placeholder="Registracija" />
              <SharpInput value={vehicle.year} onChange={(e: any) => setVehicle({...vehicle, year: e.target.value})} placeholder="Godište" />
              
              <SharpInput icon={Gauge} type="number" value={vehicle.mileage} onChange={(e: any) => setVehicle({...vehicle, mileage: e.target.value})} placeholder="Kilometraža (KM)" className="col-span-2 font-black italic" />
              <SharpInput value={vehicle.vin} onChange={(e: any) => setVehicle({...vehicle, vin: e.target.value})} placeholder="VIN (Broj šasije)" className="col-span-2 font-mono" />
              
              <SharpInput icon={History} type="text" value={vehicle.displacement} onChange={(e: any) => setVehicle({...vehicle, displacement: e.target.value})} placeholder="Zapremina (ccm)" />
              
              <div className="w-full">
                <select 
                    value={vehicle.fuelType} 
                    onChange={(e) => setVehicle({...vehicle, fuelType: e.target.value})}
                    className="w-full bg-background border border-border px-3 py-2.5 text-sm outline-none focus:border-primary text-foreground font-medium"
                >
                    <option value="Dizel">Dizel</option>
                    <option value="Benzin">Benzin</option>
                    <option value="Gas">Benzin + Gas</option>
                    <option value="Hibrid">Hibrid</option>
                    <option value="Struja">Električni</option>
                </select>
              </div>

              <div className="relative">
                <input type="number" value={vehicle.kw} onChange={(e) => handleKwChange(e.target.value)} className="w-full bg-background border border-border px-3 py-2.5 text-sm outline-none focus:border-primary text-foreground" placeholder="kW" />
                <span className="absolute right-2 top-3 text-[9px] font-black opacity-40 uppercase">kW</span>
              </div>
              <div className="relative">
                <input type="number" value={vehicle.hp} onChange={(e) => handleHpChange(e.target.value)} className="w-full bg-background border border-border px-3 py-2.5 text-sm outline-none focus:border-primary text-foreground" placeholder="ks" />
                <span className="absolute right-2 top-3 text-[9px] font-black opacity-40 uppercase">ks</span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <SectionTitle icon={MessageSquare} title="III - Napomena / Opis kvara" />
            <textarea 
              value={note} onChange={(e) => setNote(e.target.value)} 
              placeholder="Unesite primedbe klijenta..." 
              className="w-full bg-background border border-border rounded-none px-4 py-3 text-sm outline-none focus:border-primary transition-colors text-foreground min-h-32 resize-none italic" 
            />
          </section>
        </div>

        {/* DESNA KOLONA: TABELA STAVKI */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-[10px] uppercase font-bold tracking-wider">
              <thead className="bg-muted text-muted-foreground border-b border-border text-left">
                <tr><th className="px-4 py-4 w-16 italic">Tip</th><th className="px-4 py-4">Opis stavke</th><th className="px-4 py-4 w-20 text-center">Kol.</th><th className="px-4 py-4 w-28 text-right">Cena</th><th className="px-4 py-4 w-24 text-right">Iznos</th><th className="px-4 py-4 w-10"></th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className={`px-4 py-3 text-[9px] font-black italic ${item.type === 'PART' ? 'text-orange-500' : 'text-primary'}`}>{item.type}</td>
                    <td className="px-4 py-3"><input value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} className="w-full bg-transparent outline-none text-foreground focus:text-primary font-bold" placeholder="Opis..." /></td>
                    <td className="px-4 py-3"><input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value))} className="w-full bg-transparent outline-none text-center font-mono" /></td>
                    <td className="px-4 py-3"><input type="number" value={item.price} onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value))} className="w-full bg-transparent outline-none text-right font-mono" /></td>
                    <td className="px-4 py-3 text-right text-muted-foreground font-mono">{(item.quantity * item.price).toLocaleString('sr-RS', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-center"><button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-muted-foreground hover:text-red-500"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-3 bg-muted/20 border-t border-border flex gap-2">
              <button onClick={() => addItem("PART")} className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-[10px] font-black uppercase tracking-tighter transition-all hover:opacity-90">Dodaj Deo</button>
              <button onClick={() => addItem("SERVICE")} className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-[10px] font-black uppercase tracking-tighter transition-all hover:opacity-90">Dodaj Uslugu</button>
            </div>
          </div>

          {/* TOTAL REKAPITULACIJA */}
          <div className="bg-card border-2 border-primary border-dashed p-8 space-y-4 shadow-xl relative overflow-hidden">
             <div className="absolute left-0 top-0 h-full w-1 bg-primary"></div>
             
             <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Finansijski presek</p>
                    <div className="text-[10px] font-bold text-muted-foreground space-y-0.5 uppercase tracking-tighter">
                        <p>Osnovica (Neto): {netTotal.toLocaleString('sr-RS')} RSD</p>
                        {taxRate > 0 && <p>PDV ({taxRate}%): {vatTotal.toLocaleString('sr-RS')} RSD</p>}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ukupno za naplatu</p>
                    <span className="text-6xl font-black italic tracking-tighter leading-none text-foreground">{grossTotal.toLocaleString('sr-RS', { minimumFractionDigits: 2 })}</span>
                    <span className="ml-3 text-sm text-primary font-black uppercase italic">RSD</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}