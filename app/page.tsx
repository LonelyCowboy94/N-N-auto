"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Wrench, Mail, Lock, Eye, EyeOff, Loader2, 
  AlertCircle, ChevronRight, ChevronLeft, CheckCircle2, ShieldCheck 
} from "lucide-react";
import { registerUser } from "@/app/actions/register";

// --- ULTRA OŠTRI INPUT ---
const SharpInput = ({ label, name, type = "text", placeholder, icon: Icon, error, value, onChange }: any) => (
  <div className="space-y-1 text-left">
    <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest ml-0.5">{label}</label>
    <div className="relative group">
      {Icon && <Icon className={`absolute left-3 top-3.5 transition-colors ${error ? "text-red-500" : "text-slate-500 group-focus-within:text-blue-500"}`} size={16} />}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-10' : 'px-4'} pr-4 py-3 bg-slate-950/60 border border-white/10 text-white outline-none focus:border-blue-500 transition-all text-sm rounded-none placeholder:text-slate-600 ${error ? 'border-red-500' : ''}`}
      />
    </div>
    {error && <p className="text-[10px] font-bold text-red-500 mt-1">{error}</p>}
  </div>
);

export default function LandingPage() {
  const [view, setView] = useState<"login" | "register">("login");
  const [regStep, setRegStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "", password: "", shopName: "", address: "", city: "", confirmPassword: ""
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Validacija lozinke (10 karaktera, 1 veliko slovo, 1 broj)
  const isPasswordValid = (pass: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/;
    return regex.test(pass);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setServerError("");
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email: formData.email, password: formData.password, redirect: false });
    if (res?.error) {
      setServerError("Podaci nisu ispravni ili nalog nije aktiviran.");
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid(formData.password)) {
      setErrors({ password: "Lozinka ne ispunjava kriterijume sigurnosti." });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Lozinke se ne podudaraju." });
      return;
    }

    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    
    const result = await registerUser(data);
    
    if (result.error) {
      setServerError(result.error);
      setLoading(false);
    } else {
      setMessage("Aktivacioni link je poslat! Proverite vašu email poštu (inbox/spam) i potvrdite registraciju pre prijave.");
      setLoading(false);
    }
  };

  return (
    <main 
      className="relative min-h-screen w-full bg-[#020617] flex flex-col overflow-hidden"
      style={{ backgroundImage: "url('/home-bg2.png')", backgroundSize: 'cover', backgroundPosition: 'left center', backgroundRepeat: 'no-repeat' }}
    >
      <div className="absolute inset-0 bg-[#020617]/60 shadow-[inset_0_-50px_400px_-10px_rgba(0,0,0,0.8)] z-0" />

      {/* HEADER */}
      <header className="relative z-20 flex items-center justify-between px-10 py-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 shadow-[0_0_20px_#2563eb]">
            <Wrench className="text-white" size={22} />
          </div>
          <span className="text-2xl font-black text-white italic uppercase tracking-tighter">N&N Auto</span>
        </div>
        <nav className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
           <Link href="#" className="hover:text-blue-500 transition-colors">Sistem</Link>
           <Link href="#" className="hover:text-blue-500 transition-colors">Podrška</Link>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center lg:justify-between max-w-7xl mx-auto w-full px-10 gap-20 py-10">
        
        {/* LEVO: BRANDING */}
        <div className="flex-1 space-y-4 text-left select-none animate-in fade-in slide-in-from-left-10 duration-700">
          <h2 className="text-blue-500 font-black uppercase text-xs tracking-[0.5em] italic">Najbolji softver u Srbiji</h2>
          <h1 className="text-7xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter uppercase italic">
            DIGITALNI<br />
            <span className="text-blue-600">SERVIS.</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-sm font-medium leading-relaxed opacity-80">
            Sve što tvojoj radnji treba u jednoj aplikaciji. Od naloga do statistike.
          </p>
        </div>

        {/* DESNO: 3D CARD CONTAINER */}
        <div className="w-full max-w-105 perspective-2000 min-h-full flex items-center">
          <div className={`relative w-full -top-5 preserve-3d transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${view === "register" ? "rotate-y-180" : ""}`}>
            
            {/* --- FRONT: LOGIN --- */}
            <div className="absolute inset-0 backface-hidden p-12 flex flex-col justify-center rounded-none">
              <div className="space-y-8">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Prijava</h3>
                  <div className="w-12 h-1 bg-blue-600"></div>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <SharpInput label="E-mail adresa" name="email" icon={Mail} value={formData.email} onChange={handleChange} />
                  <div className="relative">
                    <SharpInput label="Lozinka" name="password" type={showPass ? "text" : "password"} icon={Lock} value={formData.password} onChange={handleChange} />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-9 text-slate-500 hover:text-white transition-colors">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {serverError && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 p-2 border-l-2 border-red-500">{serverError}</p>}
                  <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-700 transition-all shadow-[0_10px_20px_rgba(37,99,235,0.3)] disabled:opacity-50">
                    {loading ? <Loader2 className="animate-spin m-auto" size={18} /> : "Prijavi se na sistem"}
                  </button>
                </form>

                <button onClick={() => setView("register")} className="w-full text-center text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors border-t border-white/5 pt-6">
                  Nemaš nalog? Registruj radnju →
                </button>
              </div>
            </div>

            {/* --- BACK: REGISTER --- */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 p-10 flex flex-col justify-center">
              {message ? (
                <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-green-500/20 border border-green-500 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <ShieldCheck size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Skoro gotovo!</h3>
                    <p className="text-slate-300 text-sm font-medium leading-relaxed">{message}</p>
                  </div>
                  <button onClick={() => {setView("login"); setMessage(null);}} className="w-full py-4 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/5 transition-all">Nazad na prijavu</button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Registracija</h3>
                    <span className="text-[10px] font-black text-blue-500 uppercase">Step {regStep}/2</span>
                  </div>

                  <form onSubmit={regStep === 1 ? (e) => { e.preventDefault(); if(formData.shopName && formData.address) setRegStep(2); } : handleRegister} className="space-y-4">
                    {regStep === 1 ? (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <SharpInput label="Naziv servisa" name="shopName" placeholder="npr. Servis Petrović" value={formData.shopName} onChange={handleChange} />
                        <SharpInput label="Adresa servisa" name="address" placeholder="Ulica i broj" value={formData.address} onChange={handleChange} />
                        <SharpInput label="Grad / Mesto" name="city" placeholder="Beograd" value={formData.city} onChange={handleChange} />
                        <button type="submit" className="w-full bg-white/5 text-white py-4 font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all border border-white/10">
                          Nastavi dalje <ChevronRight className="inline ml-1" size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <SharpInput label="Email vlasnika" name="email" type="email" placeholder="vas@mail.com" icon={Mail} value={formData.email} onChange={handleChange} />
                        <div>
                          <SharpInput label="Lozinka" name="password" type="password" placeholder="Minimum 10 karaktera" icon={Lock} value={formData.password} onChange={handleChange} error={errors.password} />
                          {/* Indikator sigurnosti lozinke */}
                          <div className="flex gap-2 mt-2 px-1">
                            <div className={`h-1 flex-1 ${formData.password.length >= 10 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                            <div className={`h-1 flex-1 ${/[A-Z]/.test(formData.password) ? 'bg-blue-500' : 'bg-slate-700'}`} />
                            <div className={`h-1 flex-1 ${/\d/.test(formData.password) ? 'bg-blue-500' : 'bg-slate-700'}`} />
                          </div>
                          <p className="text-[8px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">Uslov: 10+ karaktera, Veliko slovo, Broj</p>
                        </div>
                        <SharpInput label="Potvrdi lozinku" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
                        <div className="flex gap-2 pt-2">
                          <button type="button" onClick={() => setRegStep(1)} className="flex-1 bg-white/5 text-white py-4 font-black uppercase text-[10px] border border-white/5">Nazad</button>
                          <button 
                            type="submit" 
                            disabled={loading || !isPasswordValid(formData.password)} 
                            className="flex-2 bg-blue-600 text-white py-4 font-black uppercase text-xs tracking-widest hover:bg-blue-700 shadow-xl disabled:opacity-30 disabled:grayscale transition-all"
                          >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : "Završi prijavu"}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                  <button onClick={() => setView("login")} className="w-full text-center text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Otkaži i vrati se</button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <footer className="relative z-20 p-10 text-center border-t border-white/5">
         <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.8em]">N&N Auto — Digitalno srce tvoje radnje v1.0</p>
      </footer>
    </main>
  );
}