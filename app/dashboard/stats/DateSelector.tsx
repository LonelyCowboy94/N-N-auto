"use client";
import { useRouter } from "next/navigation";

export default function DateSelector({ currentMonth, currentYear }: any) {
  const router = useRouter();

  const updateUrl = (month: number, year: number) => {
    router.push(`/dashboard/stats?month=${month}&year=${year}`);
  };

  return (
    <div className="flex border border-border p-1 bg-card">
      <select 
        value={currentMonth} 
        onChange={(e) => updateUrl(Number(e.target.value), currentYear)}
        className="bg-transparent text-[10px] font-black uppercase p-2 outline-none cursor-pointer"
      >
        {["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"].map((m, i) => <option key={m} value={i}>{m}</option>)}
      </select>
      <select 
        value={currentYear} 
        onChange={(e) => updateUrl(currentMonth, Number(e.target.value))}
        className="bg-transparent text-[10px] font-black uppercase p-2 outline-none border-l border-border cursor-pointer"
      >
        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}