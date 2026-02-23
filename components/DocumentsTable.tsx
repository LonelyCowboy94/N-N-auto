"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, Search, Edit2, Loader2 } from "lucide-react";
import { deleteWorkOrder } from "@/app/actions/work-orders";

export default function DocumentsTable({ initialOrders }: { initialOrders: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = initialOrders.filter(o => 
    o.number.toLowerCase().includes(search.toLowerCase()) ||
    o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.vehiclePlates.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (e: React.MouseEvent, id: string, number: string) => {
    e.stopPropagation(); // Stopira router.push ka pregledu
    if (confirm(`Da li ste sigurni da želite da OBRIŠETE radni nalog br. ${number}?`)) {
      setDeletingId(id);
      const res = await deleteWorkOrder(id);
      if (res.error) alert(res.error);
      setDeletingId(null);
    }
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Stopira router.push ka pregledu
    // Vodi nas na stranicu za izmenu
    router.push(`/dashboard/documents/${id}/edit`);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-xl group">
        <Search className="absolute left-3 top-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
        <input 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pretraži po broju, imenu ili tablicama..."
          className="w-full bg-card/85 border border-border rounded-none pl-11 pr-4 py-3 text-sm outline-none focus:border-primary transition-all text-foreground"
        />
      </div>

      <div className="border border-border bg-card/50 backdrop-blur-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border">
              <th className="px-6 py-4">Broj naloga</th>
              <th className="px-6 py-4">Klijent</th>
              <th className="px-6 py-4">Vozilo</th>
              <th className="px-6 py-4">Datum</th>
              <th className="px-6 py-4 text-right">Iznos</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Upravljanje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((order) => (
              <tr 
                key={order.id} 
                onClick={() => router.push(`/dashboard/documents/${order.id}`)}
                className="hover:bg-muted/20 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background border border-slate-800 text-blue-500">
                      <FileText size={18} />
                    </div>
                    <span className="font-black text-sm tracking-tighter italic uppercase text-foreground">
                        {order.number}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 font-bold text-sm uppercase text-foreground">
                  {order.customerName}
                </td>
                <td className="px-6 py-5">
                  <div className="text-[10px] font-black uppercase">
                    <p className="text-foreground">{order.vehicleModel}</p>
                    <p className="text-blue-500 underline underline-offset-2">{order.vehiclePlates}</p>
                  </div>
                </td>
                <td className="px-6 py-5 text-xs font-bold text-muted-foreground">
                  {order.date?.toLocaleDateString('sr-RS')}
                </td>
                <td className="px-6 py-5 text-right font-black text-foreground">
                  {order.total?.toLocaleString('sr-RS', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-5 text-center">
                  <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-tighter border ${
                    order.status === 'otvoren' ? 'border-blue-500/50 text-blue-500 bg-blue-500/5' : 'border-green-500/50 text-green-500 bg-green-500/5'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    {/* DUGME ZA EDIT */}
                    <button 
                      onClick={(e) => handleEdit(e, order.id)}
                      className="p-2.5 bg-background border border-border text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-90"
                      title="Izmeni nalog"
                    >
                      <Edit2 size={16} />
                    </button>

                    {/* DUGME ZA BRISANJE */}
                    <button 
                      onClick={(e) => handleDelete(e, order.id, order.number)}
                      disabled={deletingId === order.id}
                      className="p-2.5 bg-background border border-border text-muted-foreground hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-90 disabled:opacity-50"
                      title="Obriši nalog"
                    >
                      {deletingId === order.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-20 text-center text-muted-foreground italic text-sm">
            Nema pronađenih dokumenata u bazi.
          </div>
        )}
      </div>
    </div>
  );
}