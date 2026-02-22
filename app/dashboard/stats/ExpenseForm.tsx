"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { addExpense } from "@/app/actions/stats";

export default function ExpenseForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "Opšte",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    setLoading(true);
    try {
      await addExpense(
        formData.description, 
        Number(formData.amount), 
        formData.category
      );
      // Resetuj formu nakon uspešnog slanja
      setFormData({ description: "", amount: "", category: "Opšte" });
    } catch (error) {
      console.error("Greška pri dodavanju troška:", error);
      alert("Došlo je do greške.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-card/50 backdrop-blur-md border border-border p-6 space-y-5 shadow-xl"
    >
      <div className="space-y-1.5">
        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
          Naziv troška
        </label>
        <input 
          required 
          value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value})} 
          className="w-full bg-background border border-border px-3 py-2.5 text-xs outline-none focus:border-primary text-foreground transition-all rounded-none" 
          placeholder="npr. Isplata dnevnica"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
          Iznos (RSD)
        </label>
        <input 
          required 
          type="number" 
          value={formData.amount} 
          onChange={e => setFormData({...formData, amount: e.target.value})} 
          className="w-full bg-background border border-border px-3 py-2.5 text-xs outline-none focus:border-primary text-foreground font-mono rounded-none" 
          placeholder="0.00"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
          Kategorija rashoda
        </label>
        <select 
          value={formData.category} 
          onChange={e => setFormData({...formData, category: e.target.value})} 
          className="w-full bg-background border border-border px-3 py-2.5 text-xs outline-none cursor-pointer text-foreground rounded-none"
        >
          <option value="Opšte">Opšte</option>
          <option value="Zarade radnika">Zarade radnika</option>
          <option value="Režije">Režije (Struja/Voda/Net)</option>
          <option value="Kirija">Kirija</option>
          <option value="Nabavka">Nabavka Delova</option>
          <option value="Marketing">Marketing / Reklame</option>
        </select>
      </div>

      <button 
        disabled={loading} 
        className="w-full bg-primary text-white py-4 font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Plus size={14} />
        )} 
        Evidentiraj Rashod
      </button>
    </form>
  );
}