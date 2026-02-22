"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Car, User, Calendar, ChevronRight } from "lucide-react";

export default function VehiclesTable({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = initialData.filter(v => {
    const s = search.toLowerCase();
    return (
      v.make.toLowerCase().includes(s) || 
      v.model.toLowerCase().includes(s) || 
      v.plateNumber.toLowerCase().includes(s) ||
      (v.year && v.year.toString().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      <div className="relative group max-w-xl">
        <Search className="absolute left-3 top-3.5 text-muted-foreground group-focus-within:text-primary" size={18} />
        <input 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pretraži po vozilu, tablicama ili godištu..."
          className="w-full bg-card border border-border rounded-none pl-11 pr-4 py-3 text-sm outline-none focus:border-primary transition-all text-foreground"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((v) => (
          <div 
            key={v.id} 
            onClick={() => router.push(`/dashboard/vehicles/${v.id}`)}
            className="bg-card border border-border p-5 hover:border-primary cursor-pointer transition-all group relative overflow-hidden"
          >
            {/* Dekorativna ikona u pozadini */}
            <Car className="absolute -right-4 -bottom-4 text-muted/10 group-hover:text-primary/5 transition-colors" size={100} />
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-black text-lg uppercase italic tracking-tighter text-foreground group-hover:text-primary transition-colors">
                  {v.make} {v.model}
                </h3>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <Calendar size={10} /> Godište: {v.year || '---'}
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-2 py-1 text-white font-mono text-xs uppercase tracking-tighter">
                {v.plateNumber}
              </div>
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-muted flex items-center justify-center text-muted-foreground">
                  <User size={12} />
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-tight">
                  {v.customer?.name}
                </span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}