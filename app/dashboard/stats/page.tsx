import { getMonthlyStats } from "@/app/actions/stats";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import DateSelector from "./DateSelector";
import ExpenseForm from "./ExpenseForm";
import DeleteExpenseButton from "./DeleteExpenseButton";

export default async function StatsPage(props: { 
  searchParams: Promise<{ month?: string; year?: string }> 
}) {
  const sParams = await props.searchParams;
  
  const now = new Date();
  const currentMonth = sParams.month ? parseInt(sParams.month) : now.getMonth();
  const currentYear = sParams.year ? parseInt(sParams.year) : now.getFullYear();

  const data = await getMonthlyStats(currentMonth, currentYear);

  return (
    <div className="p-6 lg:p-10 space-y-10">
      {/* HEADER SA DROPDOWN-OM (Client) */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Arhiva i Rashodi</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1 italic">Financial monitoring system v1.0</p>
        </div>
        <DateSelector currentMonth={currentMonth} currentYear={currentYear} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
           {/* KPI KARTICE (Renderuju se na serveru) */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KpiCard label="Ukupan Prihod" value={data.revenue} color="text-green-500" />
              <KpiCard label="Mesečni Rashodi" value={data.expenseTotal} color="text-red-500" />
              <KpiCard label="Profit" value={data.profit} color="text-foreground" highlight />
           </div>

           {/* TABELA RASHODA */}
           <div className="bg-card/50 backdrop-blur-md border border-border overflow-hidden">
              <table className="w-full text-left text-[10px] font-bold uppercase tracking-tight">
                 <thead className="bg-muted text-muted-foreground border-b border-border">
                    <tr>
                       <th className="px-6 py-4">Opis rashoda</th>
                       <th className="px-6 py-4">Kategorija</th>
                       <th className="px-6 py-4 text-right">Iznos</th>
                       <th className="px-6 py-4 text-right"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border text-foreground">
                    {data.expensesList.map((ex: any) => (
                      <tr key={ex.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-black">{ex.description}</td>
                        <td className="px-6 py-4 opacity-60">{ex.category}</td>
                        <td className="px-6 py-4 text-right font-black italic">{ex.amount.toLocaleString()} RSD</td>
                        <td className="px-6 py-4 text-right">
                           {/* DUGME ZA BRISANJE (Client) */}
                           <DeleteExpenseButton id={ex.id} />
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
              {data.expensesList.length === 0 && (
                <div className="p-20 text-center text-muted-foreground italic text-xs lowercase">Nema evidentiranih troškova za ovaj period.</div>
              )}
           </div>
        </div>

        {/* FORMA ZA UNOS (Client) */}
        <div className="space-y-4">
           <h3 className="text-xs font-black uppercase tracking-widest italic flex items-center gap-2"><Wallet size={16} className="text-primary"/> Evidencija</h3>
           <ExpenseForm />
        </div>
      </div>
    </div>
  );
}

// Lokalna komponenta za kartice (ne treba joj 'use client')
function KpiCard({ label, value, color, highlight }: any) {
  return (
    <div className={`bg-card/30 backdrop-blur-md border p-6 space-y-1 ${highlight ? 'border-primary border-2' : 'border-border'}`}>
      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
      <p className={`text-2xl font-black italic tracking-tighter ${color}`}>{value.toLocaleString()} RSD</p>
    </div>
  );
}