"use client";

import { useState, useEffect } from "react";
import { getMonthlyStats, addExpense, deleteExpense } from "@/app/actions/stats";
import { TrendingUp, TrendingDown, DollarSign, Plus, Trash2, Loader2, Wallet } from "lucide-react";

export default function StatsPage() {
  const [date, setDate] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newExp, setNewExp] = useState({ description: "", amount: "", category: "Opšte" });

  const loadData = async () => {
    setLoading(true);
    const res = await getMonthlyStats(date.month, date.year);
    setData(res);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [date]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.description || !newExp.amount) return;
    await addExpense(newExp.description, Number(newExp.amount), newExp.category);
    setNewExp({ description: "", amount: "", category: "Opšte" });
    loadData();
  };

  if (loading && !data) return <div className="p-20 text-center font-black italic animate-pulse text-primary tracking-[0.5em]">UČITAVANJE IZVEŠTAJA...</div>;

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-background">
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Arhiva i Rashodi</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">Kompletna finansijska kontrola</p>
        </div>
        <div className="flex border border-border p-1 bg-card">
           <select value={date.month} onChange={(e) => setDate({...date, month: Number(e.target.value)})} className="bg-transparent text-[10px] font-black uppercase p-2 outline-none">
              {["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"].map((m, i) => <option key={m} value={i}>{m}</option>)}
           </select>
           <select value={date.year} onChange={(e) => setDate({...date, year: Number(e.target.value)})} className="bg-transparent text-[10px] font-black uppercase p-2 outline-none border-l border-border">
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEVA KOLONA: KPI I LISTA */}
        <div className="lg:col-span-2 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border p-6"><p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Ukupan Prihod</p><p className="text-2xl font-black italic text-green-500">{data.revenue.toLocaleString()} RSD</p></div>
              <div className="bg-card border border-border p-6"><p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Mesečni Rashodi</p><p className="text-2xl font-black italic text-red-500">{data.expenseTotal.toLocaleString()} RSD</p></div>
              <div className="bg-card border-2 border-primary p-6"><p className="text-[8px] font-black text-primary uppercase mb-1 tracking-widest">Neto Profit</p><p className="text-2xl font-black italic text-foreground">{data.profit.toLocaleString()} RSD</p></div>
           </div>

           <div className="bg-card border border-border overflow-hidden shadow-sm">
              <table className="w-full text-left text-[10px] font-bold uppercase">
                 <thead className="bg-muted text-muted-foreground border-b border-border">
                    <tr>
                       <th className="px-6 py-4">Opis rashoda</th>
                       <th className="px-6 py-4">Kategorija</th>
                       <th className="px-6 py-4 text-right">Iznos</th>
                       <th className="px-6 py-4 text-right">Akcija</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border text-foreground">
                    {data.expensesList.map((ex: any) => (
                      <tr key={ex.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4">{ex.description}</td>
                        <td className="px-6 py-4"><span className="border border-border px-2 py-0.5 text-[8px]">{ex.category}</span></td>
                        <td className="px-6 py-4 text-right font-black">{ex.amount.toLocaleString()} RSD</td>
                        <td className="px-6 py-4 text-right">
                           <button onClick={async () => { if(confirm("Obrisati?")) { await deleteExpense(ex.id); loadData(); } }} className="text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* DESNA KOLONA: FORMA */}
        <div className="space-y-4">
           <h3 className="text-xs font-black uppercase tracking-widest italic flex items-center gap-2"><Wallet size={16} className="text-primary"/> Evidencija Rashoda</h3>
           <form onSubmit={handleAddExpense} className="bg-card border border-border p-6 space-y-4 shadow-xl">
              <div className="space-y-1">
                 <label className="text-[8px] font-black uppercase text-muted-foreground">Naziv troška</label>
                 <input required value={newExp.description} onChange={e => setNewExp({...newExp, description: e.target.value})} className="w-full bg-background border border-border p-2.5 text-xs outline-none focus:border-primary" placeholder="npr. Isplata dnevnica"/>
              </div>
              <div className="space-y-1">
                 <label className="text-[8px] font-black uppercase text-muted-foreground">Iznos (RSD)</label>
                 <input required type="number" value={newExp.amount} onChange={e => setNewExp({...newExp, amount: e.target.value})} className="w-full bg-background border border-border p-2.5 text-xs outline-none focus:border-primary font-mono" placeholder="0.00"/>
              </div>
              <div className="space-y-1">
                 <label className="text-[8px] font-black uppercase text-muted-foreground">Kategorija</label>
                 <select value={newExp.category} onChange={e => setNewExp({...newExp, category: e.target.value})} className="w-full bg-background border border-border p-2.5 text-xs outline-none cursor-pointer">
                    <option value="Opšte">Opšte</option>
                    <option value="Zarade radnika">Zarade radnika</option>
                    <option value="Režije">Režije (Struja/Voda/Net)</option>
                    <option value="Kirija">Kirija</option>
                    <option value="Nabavka">Nabavka Delova</option>
                    <option value="Marketing">Marketing / Reklame</option>
                 </select>
              </div>
              <button disabled={loading} className="w-full bg-primary text-white py-4 font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                 {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Evidentiraj Rashod
              </button>
           </form>
        </div>
      </div>
    </div>
  );
}