"use client";

import { useState } from "react";
import { Save, Lock, Mail, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { changePassword, updateProfileName } from "@/app/actions/auth";

export default function AccountForm({ userData }: any) {
  const [loading, setLoading] = useState(false);
  const [showFields, setShowFields] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [name, setName] = useState(userData.name || "");

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await changePassword(formData);

    if (res.error) {
      setMsg({ type: "error", text: res.error });
    } else {
      setMsg({ type: "success", text: res.success! });
      setShowFields(false);
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  };

  const handleNameUpdate = async () => {
    setLoading(true);
    await updateProfileName(name);
    setMsg({ type: "success", text: "Ime profila je ažurirano." });
    setLoading(false);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      
      {/* SEKCIJA: OSNOVNO */}
      <div className="bg-card border border-border p-8 space-y-6">
        <h3 className="font-black text-xs uppercase tracking-widest italic text-primary border-b border-border pb-3">Profil Korisnika</h3>
        
        <div className="space-y-5">
          <div className="space-y-1.5 opacity-60">
            <label className="text-[9px] font-black uppercase tracking-widest italic">E-mail Adresa profila</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-muted border border-border text-xs font-mono">
               <Mail size={14} /> {userData.email}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest italic text-muted-foreground">Odgovorno lice</label>
            <div className="flex gap-2">
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-background border border-border px-4 py-3 outline-none focus:border-primary text-sm font-bold uppercase transition-all"
                />
                <button 
                  onClick={handleNameUpdate}
                  className="bg-slate-900 text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all"
                >
                  Ažuriraj
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* SEKCIJA: SIGURNOST */}
      <div className="bg-card border border-border p-8 space-y-6">
        <div className="flex justify-between items-center border-b border-border pb-3">
            <h3 className="font-black text-xs uppercase tracking-widest italic text-primary">Sigurnosni Protokol</h3>
            {!showFields && (
                <button 
                  onClick={() => setShowFields(true)}
                  className="text-[9px] font-black text-primary uppercase border border-primary px-3 py-1 hover:bg-primary hover:text-white transition-all"
                >
                    Promeni Lozinku
                </button>
            )}
        </div>
        
        {showFields ? (
            <form onSubmit={handlePasswordChange} className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-muted-foreground italic">Trenutna lozinka</label>
                    <input name="oldPassword" type="password" required className="w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 relative">
                        <label className="text-[9px] font-black uppercase text-muted-foreground italic">Nova lozinka</label>
                        <input 
                          name="newPassword" 
                          type={showPass ? "text" : "password"} 
                          required 
                          className="w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-primary" 
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-9 text-slate-500 hover:text-primary">
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-muted-foreground italic">Potvrda nove lozinke</label>
                        <input name="confirmPassword" type={showPass ? "text" : "password"} required className="w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
                    </div>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                   Uslov: Minimum 10 karaktera, jedno veliko slovo i jedan broj.
                </div>

                <div className="flex gap-2">
                    <button type="submit" disabled={loading} className="flex-1 bg-primary text-white py-3 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={14} /> : <Lock size={14} />} Potvrdi Promenu
                    </button>
                    <button type="button" onClick={() => setShowFields(false)} className="px-6 py-3 border border-border text-[10px] font-black uppercase tracking-widest hover:bg-muted">Odustani</button>
                </div>
            </form>
        ) : (
            <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                Vaša lozinka je kriptovana AES-256 standardom. Za promenu pristupa kliknite na dugme iznad.
            </p>
        )}
      </div>

      {/* FEEDBACK PORUKE */}
      {msg && (
        <div className={`p-4 flex items-center gap-3 border font-black text-[10px] uppercase tracking-widest animate-in zoom-in-95 ${
            msg.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
        }`}>
            {msg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {msg.text}
        </div>
      )}
    </div>
  );
}