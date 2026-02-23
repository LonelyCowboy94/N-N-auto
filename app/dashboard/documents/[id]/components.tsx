import Image from "next/image";

// 1. ZAGLAVLJE FIRME
export const ShopHeader = ({ shop }: { shop: any }) => (
  <div className="flex justify-between items-start mb-10 border-b-2 border-black pb-8">
    <div className="w-1/4 relative h-24 bg-transparent print:bg-transparent">
      {shop.logoUrl && (
        <Image src={shop.logoUrl} alt="Logo" fill className="object-contain object-left print:mix-blend-multiply" priority unoptimized />
      )}
    </div>
    <div className="w-3/4 text-right">
      <h1 className="text-2xl font-black uppercase leading-none mb-2 tracking-tighter">{shop.name}</h1>
      <div className="text-[10px] space-y-0.5 font-medium text-slate-800 print:text-black">
        <p>{shop.address}, {shop.city}</p>
        <p>Tel: {shop.phone || '---'}</p>
        <p>{shop.emailShop || '---'}</p>
        <div className="pt-2 font-bold text-black border-t border-slate-200 print:border-black mt-2 inline-block ml-auto">
          <p>PIB: {shop.pib} | MB: {shop.maticniBroj}</p>
        </div>
      </div>
    </div>
  </div>
);

// 2. VLASNIK I NAPOMENA (SPLIT)
export const CustomerAndNote = ({ customer, note }: { customer: any, note: string | null }) => (
  <div className="grid grid-cols-2 border border-black mb-6 divide-x divide-black">
    <div className="p-5 space-y-1">
      <p className="text-[8px] font-black uppercase text-slate-400 mb-1 tracking-widest print:text-slate-600">Vlasnik / Naručilac radova</p>
      <p className="text-lg font-black uppercase leading-none">{customer.name}</p>
      <p className="text-[11px] text-slate-700 print:text-black">{customer.address}</p>
      <p className="text-[11px] font-bold pt-2">Kontakt: {customer.phone}</p>
    </div>
    <div className="p-5 bg-slate-50/30">
      <p className="text-[8px] font-black uppercase text-slate-400 mb-2 tracking-widest print:text-slate-600">Napomena / Opis kvara</p>
      <p className="text-[11px] leading-relaxed italic text-slate-800 print:text-black whitespace-pre-wrap">
        {note || "Nema dodatnih napomena."}
      </p>
    </div>
  </div>
);

// 3. TABELA VOZILA SA KILOMETRAŽOM
export const VehicleTable = ({ vehicle, order }: { vehicle: any, order: any }) => (
  <div className="border border-black mb-8 overflow-hidden">
    <div className="bg-slate-100 p-1.5 border-b border-black text-[9px] font-black uppercase tracking-widest">Identifikacija vozila i trenutno stanje</div>
    <table className="w-full text-[10px] border-collapse">
      <thead className="bg-slate-50 border-b border-black text-left uppercase font-bold text-[8px] text-slate-500 print:text-black">
        <tr>
          <th className="p-2 border-r border-black">Marka i Model</th>
          <th className="p-2 border-r border-black w-24 text-center">Tablice</th>
          <th className="p-2 border-r border-black w-20 text-center">Godište</th>
          <th className="p-2 border-r border-black w-32 text-center text-black font-black">Kilometraža</th>
          <th className="p-2">Tehnički detalji (VIN | Motor | Snaga)</th>
        </tr>
      </thead>
      <tbody>
        <tr className="font-bold">
          <td className="p-2 border-r border-black uppercase text-sm">{vehicle.make} {vehicle.model}</td>
          <td className="p-2 border-r border-black uppercase underline text-center text-sm">{vehicle.plateNumber}</td>
          <td className="p-2 border-r border-black text-center text-sm">{vehicle.year || '---'}</td>
          <td className="p-2 border-r border-black text-center text-sm font-black italic">{order.mileage?.toLocaleString() || '---'} KM</td>
          <td className="p-2 font-mono text-[10px] tracking-tighter">
            {vehicle.vin} | {vehicle.displacement}ccm | {vehicle.power}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);