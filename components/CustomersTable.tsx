"use client";

import { useState } from "react";
import { Search, User, Edit2, Trash2, X, Save, Plus, Loader2 } from "lucide-react";
import { saveCustomer, deleteCustomer } from "@/app/actions/customers";

export default function CustomersTable({ initialData }: { initialData: any[] }) {
  const [search, setSearch] = useState("");
  const [modalData, setModalData] = useState<any>(null); // null = zatvoren, {} = novo, {id...} = edit
  const [loading, setLoading] = useState(false);

  const filtered = initialData.filter(c => {
    const s = search.toLowerCase();
    return c.name.toLowerCase().includes(s) || (c.phone && c.phone.includes(s));
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await saveCustomer(modalData);
    if (res.success) setModalData(null);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative group flex-1 max-w-xl">
          <Search className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretraži klijente..."
            className="w-full bg-card border border-border rounded-none pl-11 pr-4 py-3 text-sm outline-none focus:border-primary transition-all"
          />
        </div>
        <button 
          onClick={() => setModalData({ name: "", phone: "", address: "" })}
          className="bg-primary text-white px-6 py-3 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={16} /> Dodaj Klijenta
        </button>
      </div>

      <div className="border border-border bg-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border">
              <th className="px-6 py-4">Klijent</th>
              <th className="px-6 py-4">Vozni park</th>
              <th className="px-6 py-4 text-right">Akcije</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-background border border-border flex items-center justify-center text-primary">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase text-foreground leading-none mb-1">{c.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{c.phone || '---'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    {c.vehicles?.filter((v:any) => v.make !== "Nepoznato").map((v: any) => (
                      <div key={v.id} className="bg-background border border-border p-2 flex flex-col min-w-30">
                        <span className="text-[9px] font-black text-primary uppercase italic">{v.make} {v.model}</span>
                        <span className="text-[10px] font-mono text-foreground mt-1 tracking-tighter uppercase">{v.plateNumber}</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                   <div className="flex justify-end gap-2">
                      <button onClick={() => setModalData(c)} className="p-2 border border-border hover:bg-primary hover:text-white transition-all text-muted-foreground">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={async () => confirm("Obrisati?") && await deleteCustomer(c.id)} className="p-2 border border-border hover:bg-red-600 hover:text-white text-muted-foreground transition-all">
                        <Trash2 size={14} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h3 className="text-xl font-black uppercase italic tracking-tighter">
                {modalData.id ? "Izmeni Klijenta" : "Novi Klijent"}
              </h3>
              <button onClick={() => setModalData(null)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Ime i prezime / Firma</label>
                <input 
                  required
                  value={modalData.name} 
                  onChange={(e) => setModalData({...modalData, name: e.target.value})}
                  className="w-full bg-background border border-border px-3 py-3 outline-none focus:border-primary text-foreground" 
                />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Telefon</label>
                <input 
                  value={modalData.phone} 
                  onChange={(e) => setModalData({...modalData, phone: e.target.value})}
                  className="w-full bg-background border border-border px-3 py-3 outline-none focus:border-primary text-foreground" 
                />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Adresa</label>
                <input 
                  value={modalData.address} 
                  onChange={(e) => setModalData({...modalData, address: e.target.value})}
                  className="w-full bg-background border border-border px-3 py-3 outline-none focus:border-primary text-foreground" 
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setModalData(null)} className="flex-1 border border-border py-3 text-xs font-bold uppercase hover:bg-muted transition-colors">Odustani</button>
                <button type="submit" disabled={loading} className="flex-1 bg-primary text-white py-3 text-xs font-bold uppercase hover:bg-blue-700 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Sačuvaj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}