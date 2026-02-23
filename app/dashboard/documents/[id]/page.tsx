import { db } from "@/db";
import { workOrders, workOrderItems, customers, vehicles, shops } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ChevronLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import OrderPrintActions from "@/components/OrderPrintView";
import { completeWorkOrder } from "@/app/actions/work-orders";
import { ShopHeader, CustomerAndNote, VehicleTable } from "./components";

export default async function OrderDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  // 1. Podaci
  const [order] = await db.select().from(workOrders).where(eq(workOrders.id, id));
  if (!order) return notFound();

  const [shop] = await db.select().from(shops).where(eq(shops.id, order.shopId));
  const [customer] = await db.select().from(customers).where(eq(customers.id, order.customerId));
  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, order.vehicleId));
  const items = await db.select().from(workOrderItems).where(eq(workOrderItems.workOrderId, id));

  // 2. Matematika i Porez
  const taxRate = shop.taxRate || 0;
  const parts = items.filter(i => i.type === 'PART');
  const services = items.filter(i => i.type === 'SERVICE');

  const sumParts = parts.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
  const sumServices = services.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
  
  const netAmount = sumParts + sumServices;
  const vatAmount = netAmount * (taxRate / 100);
  const grossAmount = netAmount + vatAmount;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 lg:p-10 print:p-0 print:bg-white transition-colors">
      
      {/* TOOLSBAR */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden px-2">
        <Link href="/dashboard/documents" className="text-slate-500 hover:text-blue-600 flex items-center gap-2 text-xs font-bold uppercase transition-colors">
          <ChevronLeft size={16} /> Lista dokumenata
        </Link>
        <div className="flex gap-3">
          <OrderPrintActions />
         
          {order.status !== 'završen' && (
            <form action={async () => { "use server"; await completeWorkOrder(id); }}>
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md font-bold text-xs uppercase shadow-md hover:bg-green-700 transition-all">
                    <CheckCircle size={14} className="inline mr-2"/> Završi nalog
                </button>
            </form>
          )}
        </div>
      </div>

      {/* A4 FORMAT */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white text-black p-[15mm] shadow-2xl print:shadow-none print:p-0 print:m-0 flex flex-col font-sans border border-slate-200 print:border-none relative">
        
        <ShopHeader shop={shop} />

        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold uppercase tracking-tighter italic">Radni Nalog br. {order.number}</h2>
            <p className="text-[10px] uppercase font-black mt-1 tracking-[0.4em] text-slate-500 print:text-black">tehnička dokumentacija servisa</p>
        </div>

        <div className="grid grid-cols-4 border border-black text-[10px] mb-6 divide-x divide-black bg-slate-100/50">
            <div className="p-2"><p className="text-slate-500 font-bold mb-1 uppercase text-[7px]">Broj naloga</p><p className="font-bold text-sm">{order.number}</p></div>
            <div className="p-2"><p className="text-slate-500 font-bold mb-1 uppercase text-[7px]">Datum prijema</p><p className="font-bold text-sm">{order.dateEntry?.toLocaleDateString('sr-RS')}</p></div>
            <div className="p-2"><p className="text-slate-500 font-bold mb-1 uppercase text-[7px]">Status</p><p className="font-black uppercase text-blue-600 text-sm">{order.status}</p></div>
            <div className="p-2"><p className="text-slate-500 font-bold mb-1 uppercase text-[7px]">Administrator</p><p className="font-bold text-sm">Sistem</p></div>
        </div>

        {/* 1. VLASNIK I NAPOMENA */}
        <CustomerAndNote customer={customer} note={order.note} />

        {/* 2. TABELA VOZILA */}
        <VehicleTable vehicle={vehicle} order={order} />

        {/* 3. STAVKE */}
        <div className="space-y-6 mb-10">
            <div className="border border-black">
                <div className="bg-slate-800/30 text-black border-b p-2 text-[9px] font-black uppercase tracking-widest">I - Materijal i ugrađeni delovi</div>
                <table className="w-full text-[10px] border-collapse">
                    <thead>
                        <tr className="bg-slate-100 border-b border-black text-left">
                            <th className="p-2 border-r border-black w-10 text-center">RB</th>
                            <th className="p-2 border-r border-black">Naziv / Šifra</th>
                            <th className="p-2 border-r border-black w-14 text-center">Kol.</th>
                            <th className="p-2 border-r border-black w-28 text-right">Cena</th>
                            <th className="p-2 w-32 text-right">Vrednost</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                        {parts.map((item, idx) => (
                            <tr key={item.id}>
                                <td className="p-2 border-r border-black text-center">{idx + 1}</td>
                                <td className="p-2 border-r border-black uppercase font-medium">{item.description}</td>
                                <td className="p-2 border-r border-black text-center">{item.quantity}</td>
                                <td className="p-2 border-r border-black text-right font-mono">{item.price.toLocaleString('sr-RS', { minimumFractionDigits: 2 })}</td>
                                <td className="p-2 text-right font-mono font-bold">{(item.quantity * item.price).toLocaleString('sr-RS', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="border border-black">
                <div className="bg-slate-800/30 text-black border-b p-2 text-[9px] font-black uppercase tracking-widest">II - Opis izvršenih radova / Usluge</div>
                <table className="w-full text-[10px] border-collapse">
                    <tbody className="divide-y divide-black">
                        {services.map((item, idx) => (
                            <tr key={item.id}>
                                <td className="p-2 border-r border-black w-10 text-center">{idx + 1}</td>
                                <td className="p-2 border-r border-black uppercase font-medium">{item.description}</td>
                                <td className="p-2 border-r border-black w-14 text-center">{item.quantity}</td>
                                <td className="p-2 border-r border-black w-28 text-right font-mono">{item.price.toLocaleString('sr-RS', { minimumFractionDigits: 2 })}</td>
                                <td className="p-2 text-right font-mono font-bold">{(item.quantity * item.price).toLocaleString('sr-RS', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* FINANSIJSKI DEO I POTPISI */}
        <div className="mt-auto border-t-2 border-black pt-6">
            <div className="flex justify-between items-start mb-16">
               {/* PRAVNE NAPOMENE I USLOVI - ORIGINALNI STIL IZ REDA */}
<div className="text-[7.2px] max-w-[65%] leading-normal text-slate-700 print:text-black italic pr-10 text-justify">
  <span className="font-bold not-italic uppercase tracking-tight">Naručilac je saglasan:</span>{' '}
  <span className="font-bold not-italic">1.)</span> Da se izvrše navedeni potrebni radovi{' '}
  <span className="font-bold not-italic">2.)</span> Da se izvrše i obave i oni nepredvidivi radovi koji su neophodni za izvršenje naručenih radova.{' '}
  <span className="font-bold not-italic">3.)</span> Da se izvršeni radovi i ugrađeni delovi naplate po važećim cenama servisa{' '}
  <span className="font-bold not-italic">4.)</span> Da rok završetka radova može da bude produžen u slučaju nedostatka rezervnih delova, dodatnih problema ili više sile{' '}
  <span className="font-bold not-italic">5.)</span> Da po preuzimanju vozila podigne stare delove, u protivnom isti će biti uništeni{' '}
  <span className="font-bold not-italic">6.)</span> Da isplati vrednost popravke pre preuzimanja vozila{' '}
  <span className="font-bold not-italic">7.)</span> Da svoje vozilo preuzme najkasnije u roku od 3 dana od završetka popravke, u protivnom se naplaćuje 2h od vrednosti norma sata rada za svaki naredni dan.{' '}
  <span className="font-bold not-italic">8.)</span> U slučaju spora nadležan je Sud u sedištu auto servisa.
</div>
                
                {/* DINAMIČKI POREZ */}
                <div className="w-[65mm] space-y-1 bg-slate-100/50 p-4 border border-black shadow-none">
                  <div className="flex justify-between text-[9px] font-bold uppercase text-slate-500">
                    <span>OSNOVICA (NETO):</span>
                    <span className="text-black font-mono">{netAmount.toLocaleString('sr-RS', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  {taxRate > 0 && (
                    <div className="flex justify-between text-[9px] font-bold uppercase text-slate-500 border-b border-slate-300 pb-1">
                      <span>PDV ({taxRate}%):</span>
                      <span className="text-black font-mono">{vatAmount.toLocaleString('sr-RS', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-black uppercase italic tracking-tighter">
                        {taxRate > 0 ? "UKUPNO:" : "ZA NAPLATU:"}
                    </span>
                    <p className="text-[24px] font-mono tracking-tighter leading-none">
                        {grossAmount.toLocaleString('sr-RS', { minimumFractionDigits: 2 })}<small className="text-[9px] not-italic ml-1 font-bold">RSD</small>
                    </p>
                  </div>
                </div>
            </div>

            <div className="hidden print:grid grid-cols-3 gap-20 text-center mt-10 font-bold uppercase text-[8px]">
                <div className="border-t border-black pt-2">Odgovorno lice servisa</div>
                <div className="border-t border-black pt-2">Naručilac radova (potpis)</div>
                <div className="border-t border-black pt-2">Vozilo preuzeo</div>
            </div>
        </div>
      </div>
    </div>
  );
}