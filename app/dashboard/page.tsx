import { getCurrentMonthStats } from "@/app/actions/dashboard";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Plus, ArrowUpRight, ClipboardList } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const stats = await getCurrentMonthStats();
  const currentMonthName = new Date().toLocaleString('sr-RS', { month: 'long' });

  return (
    <div className="p-6 lg:p-10 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-border pb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Komandna Tabla</h1>
          <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
             Status za <span className="underline">{currentMonthName} {new Date().getFullYear()}</span>
          </p>
        </div>
        <Link href="/dashboard/documents/new" className="bg-primary text-white px-8 py-3 font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
          <Plus size={18} /> Novi radni nalog
        </Link>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiSmall label="Mesečni Prihod" value={stats.revenue} icon={<TrendingUp size={16}/>} color="text-green-500" />
        <KpiSmall label="Mesečni Troškovi" value={stats.expenses} icon={<TrendingDown size={16}/>} color="text-red-500" />
        <KpiSmall label="Čist Profit" value={stats.profit} icon={<DollarSign size={16}/>} color="text-blue-500" highlight />
        <KpiSmall label="Broj Poseta" value={stats.visits} icon={<ClipboardList size={16}/>} color="text-foreground" noCurrency />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-card border border-border p-8 border-l-4 border-l-primary space-y-4 shadow-sm">
            <h3 className="font-black uppercase italic text-sm tracking-widest">Brzi presek</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
                U tekućem mesecu ostvaren je profit od <span className="text-foreground font-bold">{stats.profit.toLocaleString()} RSD</span>. 
                Savetujemo proveru neizmirenih troškova i zatvaranje otvorenih naloga radi preciznije statistike.
            </p>
            <div className="pt-4">
                <Link href="/dashboard/stats" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:underline">
                    Detaljna analitika i rashodi <ArrowUpRight size={14} />
                </Link>
            </div>
         </div>
      </div>
    </div>
  );
}

function KpiSmall({ label, value, icon, color, highlight, noCurrency }: any) {
  return (
    <div className={`bg-card border border-border p-5 space-y-1 ${highlight ? 'border-primary' : ''}`}>
      <div className={`flex items-center gap-2 ${color} opacity-80`}>
        {icon}
        <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xl font-black italic tracking-tighter text-foreground">
        {value.toLocaleString()} {noCurrency ? '' : 'RSD'}
      </p>
    </div>
  );
}