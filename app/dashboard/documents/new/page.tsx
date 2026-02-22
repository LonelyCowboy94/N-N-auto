"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Plus, Trash2, FileDown, Loader2, User, Car } from "lucide-react";
import { searchCustomers, getCustomerVehicles } from "@/app/actions/customers";
import { createWorkOrder } from "@/app/actions/work-orders";

export default function NewWorkOrder() {
  // --- STATE-OVI ---
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({ id: "", name: "", phone: "", address: "" });
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [customerVehicles, setCustomerVehicles] = useState<any[]>([]);
  const [showVehicles, setShowVehicles] = useState(false);
  const [vehicle, setVehicle] = useState({ 
    id: "", makeModel: "", plates: "", year: "", vin: "",
    displacement: "", fuelType: "Dizel", kw: "", hp: "" 
  });
  const [items, setItems] = useState<any[]>([]);

  // --- REF-OVI ZA DETEKCIJU KLIKA VAN MENIJA ---
  const customerRef = useRef<HTMLDivElement>(null);
  const vehicleRef = useRef<HTMLDivElement>(null);

  // --- LOGIKA ZA SKRIVANJE NA KLIK SA STRANE ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (customerRef.current && !customerRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
      if (vehicleRef.current && !vehicleRef.current.contains(event.target as Node)) {
        setShowVehicles(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- kW / KS KONVERZIJA ---
  const handleKwChange = (val: string) => {
    const kw = parseFloat(val);
    setVehicle({ ...vehicle, kw: val, hp: !isNaN(kw) ? Math.round(kw * 1.35962).toString() : "" });
  };

  const handleHpChange = (val: string) => {
    const hp = parseFloat(val);
    setVehicle({ ...vehicle, hp: val, kw: !isNaN(hp) ? Math.round(hp / 1.35962).toString() : "" });
  };

  // --- PRETRAGA KLIJENATA ---
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (customer.name.length > 1 && !customer.id) {
        const res = await searchCustomers(customer.name);
        setSuggestions(res);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [customer.name, customer.id]);

  const handleSelectCustomer = async (c: any) => {
    setCustomer({ id: c.id, name: c.name, phone: c.phone || "", address: c.address || "" });
    setSuggestions([]);
    const vehicles = await getCustomerVehicles(c.id);
    setCustomerVehicles(vehicles);
    if (vehicles.length > 0) setShowVehicles(true);
  };

  const handleSelectVehicle = (v: any) => {
    const [kw, hp] = (v.power || "").split("/");
    setVehicle({
      id: v.id, makeModel: `${v.make} ${v.model}`, plates: v.plateNumber,
      year: v.year || "", vin: v.vin || "", displacement: v.displacement || "",
      fuelType: v.fuelType || "Dizel", kw: kw || "", hp: hp || ""
    });
    setShowVehicles(false);
  };

  // --- STAVKE NALOGA ---
  const addItem = (type: "PART" | "SERVICE") => {
    setItems([...items, { id: crypto.randomUUID(), type, description: "", quantity: 1, price: 0 }]);
  };
  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const calculateTotal = () => items.reduce((acc, item) => acc + (item.quantity * item.price), 0);

  // --- ČUVANJE ---
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await createWorkOrder({
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        vehicleId: vehicle.id,
        vehicleData: { ...vehicle, power: `${vehicle.kw}/${vehicle.hp}` },
        items,
        totalAmount: calculateTotal()
      });
      if (res.success) window.location.href = "/dashboard/documents";
      else { alert(res.error); setLoading(false); }
    } catch (e) { console.error(e); setLoading(false); }
  };

  const inputClass = "w-full bg-background border border-border rounded-none px-3 py-2 text-sm outline-none focus:border-primary transition-colors text-foreground font-medium";

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-background text-foreground min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Novi Radni Nalog</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">Sistem za digitalno servisiranje</p>
        </div>
        <button onClick={handleSave} disabled={loading} className="bg-primary text-white px-8 py-3 font-black text-xs uppercase tracking-widest active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Sačuvaj nalog
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-8">
          {/* SEKCIJA KLIJENT */}
          <section className="space-y-4" ref={customerRef}>
            <h3 className="text-primary font-black uppercase text-[10px] tracking-[0.2em] italic border-b border-border pb-2 flex items-center gap-2">
              <User size={14} /> I - Naručilac
            </h3>
            <div className="relative">
              <input 
                value={customer.name}
                onChange={(e) => { setCustomer({...customer, name: e.target.value, id: ""}); setCustomerVehicles([]); }}
                className={inputClass} placeholder="Ime i prezime / Firma" 
              />
              {suggestions.length > 0 && (
                <div className="absolute z-50 w-full bg-card border border-border shadow-2xl mt-0">
                  {suggestions.map(c => (
                    <div key={c.id} onClick={() => handleSelectCustomer(c)} className="p-3 hover:bg-primary hover:text-white cursor-pointer text-sm border-b border-border last:border-0 transition-colors">
                      <p className="font-bold uppercase">{c.name}</p>
                      <p className="text-[10px] opacity-70">{c.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input value={customer.phone} onChange={(e) => setCustomer({...customer, phone: e.target.value})} className={inputClass} placeholder="Telefon" />
            <input value={customer.address} onChange={(e) => setCustomer({...customer, address: e.target.value})} className={inputClass} placeholder="Adresa" />
          </section>

          {/* SEKCIJA VOZILO */}
          <section className="space-y-4" ref={vehicleRef}>
            <h3 className="text-primary font-black uppercase text-[10px] tracking-[0.2em] italic border-b border-border pb-2 flex items-center gap-2">
              <Car size={14} /> II - Vozilo
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 relative">
                <input 
                  value={vehicle.makeModel}
                  onFocus={() => customer.id && customerVehicles.length > 0 && setShowVehicles(true)}
                  onChange={(e) => setVehicle({...vehicle, makeModel: e.target.value, id: ""})}
                  className={inputClass} placeholder="Marka i model" 
                />
                {showVehicles && customerVehicles.length > 0 && (
                  <div className="absolute z-40 w-full bg-slate-900 border border-primary shadow-2xl mt-0 max-h-60 overflow-auto">
                    <div className="bg-primary px-3 py-1 text-[8px] font-black text-white uppercase tracking-widest">Prethodna vozila klijenta:</div>
                    {customerVehicles.map(v => (
                      <div key={v.id} onClick={() => handleSelectVehicle(v)} className="p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-0">
                        <div className="flex justify-between items-center text-white">
                          <p className="font-bold uppercase italic">{v.make} {v.model}</p>
                          <p className="text-[10px] font-mono text-primary">{v.plateNumber}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input value={vehicle.plates} onChange={(e) => setVehicle({...vehicle, plates: e.target.value})} className={inputClass} placeholder="Registracija" />
              <input value={vehicle.year} onChange={(e) => setVehicle({...vehicle, year: e.target.value})} className={inputClass} placeholder="Godište" />
              <input value={vehicle.vin} onChange={(e) => setVehicle({...vehicle, vin: e.target.value})} className={`${inputClass} col-span-2 font-mono uppercase`} placeholder="VIN (Broj šasije)" />
              <input type="number" value={vehicle.displacement} onChange={(e) => setVehicle({...vehicle, displacement: e.target.value})} className={inputClass} placeholder="ccm" />
              <select value={vehicle.fuelType} onChange={(e) => setVehicle({...vehicle, fuelType: e.target.value})} className={inputClass}>
                <option value="Dizel">Dizel</option>
                <option value="Benzin">Benzin</option>
                <option value="Gas">Gas</option>
                <option value="Hibrid">Hibrid</option>
                <option value="Struja">Struja</option>
              </select>
              <div className="relative">
                <input type="number" value={vehicle.kw} onChange={(e) => handleKwChange(e.target.value)} className={inputClass} placeholder="kW" />
                <span className="absolute right-2 top-2 text-[9px] font-black text-muted-foreground uppercase opacity-50">kW</span>
              </div>
              <div className="relative">
                <input type="number" value={vehicle.hp} onChange={(e) => handleHpChange(e.target.value)} className={inputClass} placeholder="ks" />
                <span className="absolute right-2 top-2 text-[9px] font-black text-muted-foreground uppercase opacity-50">ks</span>
              </div>
            </div>
          </section>
        </div>

        {/* DESNO: TABELA STAVKI */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-[10px] uppercase font-bold tracking-wider">
              <thead className="bg-muted text-muted-foreground border-b border-border text-left">
                <tr>
                  <th className="px-4 py-3 w-16">Tip</th>
                  <th className="px-4 py-3">Opis stavke</th>
                  <th className="px-4 py-3 w-20 text-center">Kol.</th>
                  <th className="px-4 py-3 w-28 text-right">Cena</th>
                  <th className="px-4 py-3 w-24 text-right">Iznos</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className={`px-4 py-3 text-[9px] font-black italic ${item.type === 'PART' ? 'text-orange-500' : 'text-primary'}`}>{item.type}</td>
                    <td className="px-4 py-3"><input value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} className="w-full bg-transparent outline-none text-foreground focus:text-primary font-bold" placeholder="Opis..." /></td>
                    <td className="px-4 py-3"><input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value))} className="w-full bg-transparent outline-none text-center" /></td>
                    <td className="px-4 py-3"><input type="number" value={item.price} onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value))} className="w-full bg-transparent outline-none text-right font-mono" /></td>
                    <td className="px-4 py-3 text-right text-muted-foreground font-mono">{(item.quantity * item.price).toLocaleString('sr-RS', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-center"><button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-muted-foreground hover:text-red-500"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-3 bg-muted/20 border-t border-border flex gap-2">
              <button onClick={() => addItem("PART")} className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-[10px] font-black uppercase tracking-tighter">
                <Plus size={12} /> Dodaj Deo
              </button>
              <button onClick={() => addItem("SERVICE")} className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-[10px] font-black uppercase tracking-tighter">
                <Plus size={12} /> Dodaj Uslugu
              </button>
            </div>
          </div>

          <div className="bg-card border-2 border-primary border-dashed p-8 flex justify-between items-center relative overflow-hidden">
             <div className="absolute left-0 top-0 h-full w-1 bg-primary"></div>
             <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Ukupan iznos</p>
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Bez uračunatog poreza</p>
             </div>
             <div className="text-right">
                <span className="text-6xl font-black italic tracking-tighter text-foreground leading-none">{calculateTotal().toLocaleString('sr-RS', { minimumFractionDigits: 2 })}</span>
                <span className="ml-3 text-sm text-primary font-black uppercase italic tracking-widest">RSD</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}