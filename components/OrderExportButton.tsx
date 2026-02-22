"use client";

import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileDown, Loader2 } from "lucide-react";
import { WorkOrderPDF } from "./WorkOrderPDF";

export default function OrderExportButton({ data }: { data: any }) {
  const [isClient, setIsClient] = useState(false);

  // useEffect se izvršava samo u browseru
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Dok smo na serveru, prikazujemo obično dugme koje ne radi ništa
  if (!isClient) {
    return (
      <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-widest rounded cursor-wait">
        <FileDown size={14} /> Priprema...
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<WorkOrderPDF {...data} />}
      fileName={`Radni-Nalog-${data.order.number}.pdf`}
      className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-[10px] uppercase tracking-widest transition-all rounded shadow-sm border border-slate-200"
    >
      {({ loading }) => (
        loading ? (
          <><Loader2 className="animate-spin" size={14} /> Generišem...</>
        ) : (
          <><FileDown size={14} /> Export PDF</>
        )
      )}
    </PDFDownloadLink>
  );
}