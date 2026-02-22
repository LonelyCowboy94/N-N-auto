"use client";

import { Printer, FileDown } from "lucide-react";

export default function OrderPrintActions() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex gap-2 no-print"> {/* no-print klasa krije dugmad na papiru */}
      <button 
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 border border-slate-800 hover:bg-slate-800 font-bold text-[10px] uppercase tracking-widest transition-all"
      >
        <Printer size={14} /> Štampaj / PDF
      </button>
    </div>
  );
}