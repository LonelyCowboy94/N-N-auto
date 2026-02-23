import { db } from "@/db";
import {
  workOrders,
  workOrderItems,
  customers,
  vehicles,
  shops,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ChevronLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import OrderPrintActions from "@/components/OrderPrintView";
import { completeWorkOrder } from "@/app/actions/work-orders";

export default async function OrderDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  // 1. Povlačenje podataka
  const [order] = await db
    .select()
    .from(workOrders)
    .where(eq(workOrders.id, id));
  if (!order) return notFound();

  const [shop] = await db
    .select()
    .from(shops)
    .where(eq(shops.id, order.shopId));
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, order.customerId));
  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, order.vehicleId));
  const items = await db
    .select()
    .from(workOrderItems)
    .where(eq(workOrderItems.workOrderId, id));

  // 2. Filtriranje i Kalkulacije
  const parts = items.filter((i) => i.type === "PART");
  const services = items.filter((i) => i.type === "SERVICE");

  const sumParts = parts.reduce(
    (acc, curr) => acc + curr.quantity * curr.price,
    0,
  );
  const sumServices = services.reduce(
    (acc, curr) => acc + curr.quantity * curr.price,
    0,
  );

  const netAmount = sumParts + sumServices;
  const vatAmount = netAmount * 0.2;
  const grossAmount = netAmount + vatAmount;

  const pdfData = { order, shop, customer, vehicle, items };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 lg:p-10 print:p-0 print:bg-white transition-colors">
      {/* ALATI (Hidden on Print) */}
      <div className="max-w-[210mm] mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden px-2">
        <Link
          href="/dashboard/documents"
          className="text-slate-500 hover:text-blue-600 flex items-center gap-2 text-xs font-bold uppercase transition-colors"
        >
          <ChevronLeft size={16} /> Nazad na dokumentaciju
        </Link>
        <div className="flex flex-wrap gap-3">
          <OrderPrintActions />
          {order.status !== "završen" && (
            <form
              action={async () => {
                "use server";
                await completeWorkOrder(id);
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-bold text-xs uppercase shadow-md hover:bg-green-700 transition-all active:scale-95"
              >
                <CheckCircle size={14} /> Završi nalog
              </button>
            </form>
          )}
        </div>
      </div>

      {/* GLAVNI DOKUMENT (A4 Format) */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white text-black p-[15mm] shadow-2xl print:shadow-none print:p-0 print:m-0 flex flex-col font-sans border border-slate-200 print:border-none relative overflow-hidden">
        {/* ZAGLAVLJE FIRME */}
        <div className="flex justify-between items-start mb-10 border-b-2 border-black pb-8">
          {/* LOGO (Smanjen na 1/4 širine) */}
          <div className="w-1/4 relative h-24 bg-transparent print:bg-transparent">
            {shop.logoUrl && (
              <Image
                src={shop.logoUrl}
                alt="Logo"
                fill
                className="object-contain object-left print:mix-blend-multiply"
                priority
              />
            )}
          </div>

          {/* PODACI O SERVISU (Aligment desno) */}
          <div className="w-3/4 text-right">
            <h1 className="text-2xl font-black uppercase leading-none mb-2 tracking-tighter">
              {shop.name}
            </h1>
            <div className="text-[10px] space-y-0.5 font-medium text-slate-800 print:text-black">
              <p>
                {shop.address}, {shop.city}
              </p>
              <p>Tel: {shop.phone || "---"}</p>
              <p>{shop.emailShop || "---"}</p>
              <div className="pt-2 font-bold text-black border-t border-slate-200 print:border-black mt-2 inline-block ml-auto">
                <p>
                  PIB: {shop.pib} | MB: {shop.maticniBroj}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* NASLOV NALOGA */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold uppercase tracking-tighter italic">
            Radni Nalog br. {order.number}
          </h2>
          <p className="text-[10px] uppercase font-black mt-1 tracking-[0.4em] text-slate-400 print:text-black">
            auto-mehaničarska usluga
          </p>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-4 border border-black text-[10px] mb-8 divide-x divide-black bg-slate-50/30">
          <div className="p-2">
            <p className="text-slate-400 font-bold mb-1 uppercase text-[7px]">
              Broj dokumenta
            </p>
            <p className="font-bold text-sm">{order.number}</p>
          </div>
          <div className="p-2">
            <p className="text-slate-400 font-bold mb-1 uppercase text-[7px]">
              Datum otvaranja
            </p>
            <p className="font-bold text-sm">
              {order.dateEntry?.toLocaleDateString("sr-RS")}
            </p>
          </div>
          <div className="p-2">
            <p className="text-slate-400 font-bold mb-1 uppercase text-[7px]">
              Status
            </p>
            <p className="font-black uppercase text-blue-600 text-sm">
              {order.status}
            </p>
          </div>
          <div className="p-2">
            <p className="text-slate-400 font-bold mb-1 uppercase text-[7px]">
              Administrator
            </p>
            <p className="font-bold text-sm">Sistem</p>
          </div>
        </div>

        {/* NARUČILAC I VOZILO */}
        <div className="grid grid-cols-2 border border-black mb-10 divide-x divide-black">
          <div className="p-5 space-y-1">
            <p className="text-[8px] font-black uppercase text-slate-400 mb-1 tracking-widest">
              Naručilac radova
            </p>
            <p className="text-lg font-black uppercase leading-none">
              {customer.name}
            </p>
            <p className="text-[11px] text-slate-700">{customer.address}</p>
            <p className="text-[11px] font-bold pt-2">
              Kontakt: {customer.phone}
            </p>
          </div>
          <div className="p-5 bg-slate-50/30">
            <p className="text-[8px] font-black uppercase text-slate-400 mb-2 tracking-widest">
              Identifikacija vozila
            </p>
            <div className="grid grid-cols-2 gap-4 text-[10px]">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[7px]">
                  Vozilo:
                </span>
                <p className="font-black uppercase text-sm">
                  {vehicle.make} {vehicle.model}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[7px]">
                  Registracija:
                </span>
                <p className="font-black uppercase underline underline-offset-4 text-sm">
                  {vehicle.plateNumber}
                </p>
              </div>
              <div className="col-span-2 mt-2">
                <span className="text-slate-400 font-bold uppercase text-[7px]">
                  Tehnički detalji (VIN | Snaga | Zapremina | Gorivo)
                </span>
                <p className="font-mono font-bold tracking-tight text-[11px] mt-1 border-t border-slate-200 pt-1">
                  {vehicle.vin} | {vehicle.power} | {vehicle.displacement} ccm |{" "}
                  {vehicle.fuelType}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TABELA I: DELOVI */}
        <div className="mb-6">
          <div className="border border-black">
            <div className="bg-slate-800 text-white p-2 text-[9px] font-black uppercase tracking-widest">
              I - Rezervni delovi i materijal
            </div>
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="border-b border-black text-left bg-slate-200">
                  <th className="p-2 border-r border-black w-10 text-center">
                    RB
                  </th>
                  <th className="p-2 border-r border-black">
                    Naziv / Opis stavke
                  </th>
                  <th className="p-2 border-r border-black w-14 text-center">
                    Kol.
                  </th>
                  <th className="p-2 border-r border-black w-28 text-right">
                    Cena
                  </th>
                  <th className="p-2 w-32 text-right">Vrednost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {parts.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="p-2 border-r border-black text-center">
                      {idx + 1}
                    </td>
                    <td className="p-2 border-r border-black uppercase font-medium">
                      {item.description}
                    </td>
                    <td className="p-2 border-r border-black text-center">
                      {item.quantity}
                    </td>
                    <td className="p-2 border-r border-black text-right font-mono">
                      {item.price.toLocaleString("sr-RS", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2 text-right font-mono font-bold">
                      {(item.quantity * item.price).toLocaleString("sr-RS", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 border-t border-black">
                <tr className="font-black uppercase text-[9px]">
                  <td
                    colSpan={4}
                    className="p-2 border-r border-black text-right"
                  >
                    Ukupno delovi (Neto):
                  </td>
                  <td className="p-2 text-right font-mono text-xs">
                    {sumParts.toLocaleString("sr-RS", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* TABELA II: USLUGE */}
        <div className="mb-10">
          <div className="border border-black">
            <div className="bg-slate-800 text-white p-2 text-[9px] font-black uppercase tracking-widest">
              II - Servisne usluge i rad
            </div>
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="border-b border-black text-left bg-slate-200">
                  <th className="p-2 border-r border-black w-10 text-center">
                    RB
                  </th>
                  <th className="p-2 border-r border-black">
                    Opis servisne usluge
                  </th>
                  <th className="p-2 border-r border-black w-14 text-center">
                    Kol.
                  </th>
                  <th className="p-2 border-r border-black w-28 text-right">
                    Cena
                  </th>
                  <th className="p-2 w-32 text-right">Vrednost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {services.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="p-2 border-r border-black text-center">
                      {idx + 1}
                    </td>
                    <td className="p-2 border-r border-black uppercase font-medium">
                      {item.description}
                    </td>
                    <td className="p-2 border-r border-black text-center">
                      {item.quantity}
                    </td>
                    <td className="p-2 border-r border-black text-right font-mono">
                      {item.price.toLocaleString("sr-RS", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2 text-right font-mono font-bold">
                      {(item.quantity * item.price).toLocaleString("sr-RS", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 border-t border-black">
                <tr className="font-black uppercase text-[9px]">
                  <td
                    colSpan={4}
                    className="p-2 border-r border-black text-right"
                  >
                    Ukupno rad (Neto):
                  </td>
                  <td className="p-2 text-right font-mono text-xs">
                    {sumServices.toLocaleString("sr-RS", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* REKAPITULACIJA I PDV */}
        <div className="mt-auto border-t-2 border-black pt-6">
          <div className="flex justify-between items-start mb-16">
            <div className="text-[7.5px] max-w-[50%] leading-tight text-slate-700 italic pr-10 space-y-1 print:text-black">
              <p className="font-bold not-italic">NAPOMENA:</p>
              <p>
                Naručilac je saglasan: 1.) Da se izvrše navedeni radovi. 2.) Da
                se izvrše i obave nepredvidivi radovi koji su neophodni za
                izvršenje naručenih radova.
              </p>
              <p>
                3.) Da se izvršeni radovi naplate po važećim cenama servisa. 4.)
                Da rok završetka radova može biti produžen usled nedostatka
                delova na tržištu.
              </p>
            </div>

            {/* FINANSIJSKI OBRAČUN */}
            <div className="w-[60mm] space-y-1 bg-slate-50 p-3 border border-black shadow-sm">
              <div className="flex justify-between text-[9px] font-bold uppercase text-slate-500 print:text-black">
                <span>OSNOVICA (NETO):</span>
                <span className="text-black font-mono">
                  {netAmount.toLocaleString("sr-RS", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-[9px] font-bold uppercase text-slate-500 print:text-black border-b border-slate-300 pb-1">
                <span>PDV:</span>
                <span className="text-black font-mono">
                  0.00
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[12px] font-black uppercase italic tracking-tighter">
                  UKUPNO:
                </span>
                <div className="text-right">
                  <p className="text-2xl font-mono tracking-tighter leading-none">
                    {netAmount.toLocaleString("sr-RS", {
                      minimumFractionDigits: 2,
                    })}
                    <span className="text-[9px] not-italic ml-1 font-bold">
                      RSD
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* POTPISI */}
          <div className="hidden print:grid grid-cols-3 gap-20 text-center mt-10">
            <div className="border-t border-black pt-2">
              <p className="text-[8px] font-black uppercase tracking-widest">
                Odgovorno lice
              </p>
            </div>
            <div className="border-t border-black pt-2">
              <p className="text-[8px] font-black uppercase tracking-widest">
                Naručilac radova (potpis)
              </p>
            </div>
            <div className="border-t border-black pt-2">
              <p className="text-[8px] font-black uppercase tracking-widest">
                Vozilo preuzeo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
