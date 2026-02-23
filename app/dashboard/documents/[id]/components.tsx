import Image from "next/image";

// 1. ZAGLAVLJE FIRME
export const ShopHeader = ({ shop }: { shop: any }) => (
  <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
    <div className="w-1/4 relative h-28 ml-8 mt-1 bg-transparent print:bg-transparent">
      {shop.logoUrl && (
        <Image src={shop.logoUrl} alt="Logo" fill className="object-contain object-left print:mix-blend-multiply" priority unoptimized />
      )}
    </div>
    <div className="w-3/4 text-right mr-5 mt-1">
      <h1 className="text-xl font-black uppercase leading-none mb-2 tracking-tighter">{shop.name}</h1>
      <div className="text-[12px] space-y-0.5 font-medium text-slate-800 print:text-black">
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
  <div className="grid grid-cols-2 border border-black mb-3 divide-x divide-black">
    <div className="p-5 space-y-1">
      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest print:text-slate-600">Vlasnik / Naručilac radova</p>
      <p className="text-lg font-bold leading-none">{customer.name}</p>
      <p className="text-[12px] text-slate-700 print:text-black">{customer.address}</p>
      <p className="text-[12px] font-bold pt-2">Kontakt: {customer.phone}</p>
    </div>
    <div className="p-5 bg-slate-50/30">
      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest print:text-slate-600">Napomena / Opis kvara</p>
      <p className="text-[12px] leading-relaxed italic text-slate-800 print:text-black whitespace-pre-wrap">
        {note || "Nema dodatnih napomena."}
      </p>
    </div>
  </div>
);

// 3. TABELA VOZILA
export const VehicleTable = ({ vehicle, order }: { vehicle: any, order: any }) => (
  <div className="border border-black mb-3 overflow-hidden">
    <div className="bg-slate-200 p-1.5 border-b border-black text-[9px] font-black uppercase tracking-widest">Podaci o vozilu</div>
    <table className="w-full text-[10px] border-collapse">
      <thead className="bg-slate-50 border-b border-black text-left uppercase font-bold text-[8px] text-slate-500 print:text-black">
        <tr>
          <th className="p-2 border-r border-black">Marka i Model</th>
          <th className="p-2 border-r border-black w-24 text-center">Tablice</th>
          <th className="p-2 border-r border-black w-20 text-center">Godište</th>
          <th className="p-2 border-r border-black w-20 text-center">Kilometraža</th>
          <th className="p-2">Tehnički detalji (VIN | Motor | Snaga)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="p-2 border-r font-bold border-black uppercase text-[12px]">{vehicle.make} {vehicle.model}</td>
          <td className="p-2 border-r italic font-mono border-black uppercase underline text-center text-[12px]">{vehicle.plateNumber}</td>
          <td className="p-2 border-r border-black text-center text-[12px]">{vehicle.year || '---'}</td>
          <td className="p-2 border-r border-black text-center text-[12px] font-mono">
  {order.mileage 
    ? order.mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") 
    : '---'}
</td>
          <td className="p-2 font-mono text-[12px] tracking-tighter">
            {vehicle.vin} | {vehicle.displacement}ccm | {vehicle.power}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);