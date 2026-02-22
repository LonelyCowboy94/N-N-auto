"use client";

import { useState } from "react";
import { updateShopSettings, updateShopLogo } from "@/app/actions/shop"; 
import { Image as ImageIcon, Moon, Sun, MapPin, Loader2, CheckCircle } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";

export default function SettingsForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(initialData.theme || "light");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("theme", theme);

    try {
      await updateShopSettings(formData);
      alert("Podešavanja su sačuvana!");
    } catch (err) {
      alert("Greška pri čuvanju.");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, defaultValue, placeholder }: any) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-muted-foreground uppercase ml-1 tracking-widest italic">{label}</label>
      <input 
        name={name} 
        defaultValue={defaultValue} 
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-background border border-border rounded-none focus:border-primary outline-none transition-all text-foreground" 
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* KOLONA 1: OSNOVNI I KONTAKT */}
        <div className="space-y-6">
            <div className="bg-card border border-border p-6 shadow-sm space-y-5">
                <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-primary italic border-b border-border pb-3 mb-4">I - Osnovni podaci servisa</h3>
                <InputField label="Naziv servisa" name="name" defaultValue={initialData.name} />
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="PIB" name="pib" defaultValue={initialData.pib} />
                    <InputField label="Matični broj" name="maticniBroj" defaultValue={initialData.maticniBroj} />
                </div>
            </div>

            <div className="bg-card border border-border p-6 shadow-sm space-y-5">
                <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-primary italic border-b border-border pb-3 mb-4">II - Kontakt i Lokacija</h3>
                <InputField label="Adresa" name="address" defaultValue={initialData.address} />
                <InputField label="Grad" name="city" defaultValue={initialData.city} />
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="Telefon" name="phone" defaultValue={initialData.phone} />
                    <InputField label="Email servisa" name="emailShop" defaultValue={initialData.emailShop} />
                </div>
            </div>
        </div>

        {/* KOLONA 2: LOGO I TEMA */}
        <div className="space-y-6">
            <div className="bg-card border border-border p-6 shadow-sm">
                <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-primary italic border-b border-border pb-3 mb-4">III - Vizuelni identitet (Logo)</h3>
                
                <div className="flex flex-col items-center justify-center border border-dashed border-border p-8 bg-muted/20 min-h-50">
                    {initialData.logoUrl ? (
                        <div className="mb-6 group relative">
                            <img src={initialData.logoUrl} alt="Logo" className="h-24 w-auto object-contain" />
                            <div className="mt-2 text-[9px] font-bold text-center text-muted-foreground uppercase tracking-widest">Aktuelni logo</div>
                        </div>
                    ) : (
                        <ImageIcon size={48} className="text-muted-foreground/20 mb-4" />
                    )}

                    <UploadButton
                        endpoint="shopLogo"
                        onClientUploadComplete={async (res) => {
                            if (res?.[0]) {
                                await updateShopLogo(res[0].url);
                                router.refresh(); // Osvežava podatke u initialData
                                alert("Logo uspešno učitan!");
                            }
                        }}
                        onUploadError={(error: Error) => alert(`Greška: ${error.message}`)}
                        appearance={{
                            button: "bg-slate-900 dark:bg-primary text-white font-black uppercase text-[10px] tracking-widest px-8 py-3 rounded-none shadow-xl",
                            allowedContent: "text-[9px] font-bold text-muted-foreground uppercase mt-2"
                        }}
                        content={{
                            button({ ready }) { return ready ? "PROMENI LOGO" : "MOMENAT..."; }
                        }}
                    />
                </div>
            </div>

            <div className="bg-card border border-border p-6 shadow-sm">
                <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-primary italic border-b border-border pb-3 mb-4">IV - Izgled sistema</h3>
                <div className="flex bg-muted p-1 border border-border">
                    <button 
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 font-black text-[10px] uppercase tracking-widest transition-all ${
                        theme === 'light' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
                    }`}
                    >
                    <Sun size={14} /> Svetla tema
                    </button>
                    <button 
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 font-black text-[10px] uppercase tracking-widest transition-all ${
                        theme === 'dark' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
                    }`}
                    >
                    <Moon size={14} /> Tamna tema
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-border">
        <button 
          type="submit" 
          disabled={loading}
          className="flex items-center gap-2 px-12 py-4 bg-primary text-white font-black uppercase text-xs tracking-[0.2em] hover:opacity-90 transition-all shadow-2xl shadow-primary/20 active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
          Sačuvaj sva podešavanja
        </button>
      </div>
    </form>
  );
}