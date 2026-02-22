"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteVehicle } from "@/app/actions/vehicles";

export default function DeleteVehicleButton({ id, plateNumber }: { id: string, plateNumber: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirm(`PAŽNJA: Brišete vozilo ${plateNumber} i svu njegovu istoriju servisa. Ova akcija je nepovratna. Nastaviti?`)) {
      setLoading(true);
      const res = await deleteVehicle(id);
      if (res.success) {
        window.location.href = "/dashboard/vehicles";
      } else {
        alert("Greška: " + res.error);
        setLoading(false);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 border border-red-900/30 text-red-500 hover:bg-red-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
    >
      {loading ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
      Obriši vozilo
    </button>
  );
}