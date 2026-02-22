"use client";

import { useState } from "react";
import { registerUser } from "@/app/actions/register";
import Link from "next/link";
import { Wrench, Loader2, Eye, EyeOff, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react";

// --- POMOĆNA KOMPONENTA ---
const CustomInput = ({ label, name, type = "text", placeholder, value, error, onChange }: any) => (
  <div className="space-y-1 text-left">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative">
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3.5 bg-slate-50 border rounded-lg outline-none transition-all ${
          error ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-2 focus:ring-blue-500 focus:bg-white"
        }`}
      />
      {error && <AlertCircle className="absolute right-3 top-4 text-red-500" size={18} />}
    </div>
    {error && <p className="text-[11px] font-medium text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">{error}</p>}
  </div>
);

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    shopName: "",
    address: "",
    city: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep1 = () => {
    let newErrors: { [key: string]: string } = {};
    if (!formData.shopName.trim()) newErrors.shopName = "Naziv servisa je obavezan";
    if (!formData.address.trim()) newErrors.address = "Adresa je obavezna";
    if (!formData.city.trim()) newErrors.city = "Grad je obavezan";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    let newErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = "Email je obavezan";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Unesite ispravnu email adresu";
    if (!formData.password) newErrors.password = "Lozinka je obavezna";
    else if (formData.password.length < 6) newErrors.password = "Minimum 6 karaktera";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Lozinke se ne podudaraju";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    const result = await registerUser(data);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      setLoading(false);
    } else {
      setMessage({ type: "success", text: result.success || "Uspešno!" });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-10 text-white relative">
            <div className="flex items-center gap-3 mb-2">
                <Wrench className="text-blue-400" size={24} />
                <span className="font-bold tracking-tight text-xl uppercase">N&N Auto</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Registruj nalog</h2>
            <p className="text-slate-400 text-sm mt-1">Digitalizuj svoj servis danas.</p>
            <div className="absolute bottom-0 left-0 h-1.5 bg-blue-500 transition-all duration-700 ease-in-out" style={{ width: `${(step / 2) * 100}%` }} />
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit} noValidate>
            
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <CustomInput 
                  label="Naziv servisa" 
                  name="shopName" 
                  placeholder="npr. Servis Petrović" 
                  value={formData.shopName}
                  error={errors.shopName}
                  onChange={handleChange}
                />
                <CustomInput 
                  label="Adresa" 
                  name="address" 
                  placeholder="Knez Mihailova 1" 
                  value={formData.address}
                  error={errors.address}
                  onChange={handleChange}
                />
                <CustomInput 
                  label="Mesto / Grad" 
                  name="city" 
                  placeholder="Beograd" 
                  value={formData.city}
                  error={errors.city}
                  onChange={handleChange}
                />
                <button 
                  type="button" 
                  onClick={() => validateStep1() && setStep(2)} 
                  className="w-full flex items-center justify-center gap-2 py-4.5 px-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 mt-4 active:scale-95"
                >
                  Nastavi dalje <ChevronRight size={20} />
                </button>
              </div>
            )}

            {step === 2 && !message && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <CustomInput 
                  label="Email adresa" 
                  name="email" 
                  type="email"
                  placeholder="majstor@gmail.com" 
                  value={formData.email}
                  error={errors.email}
                  onChange={handleChange}
                />
                
                <div className="relative space-y-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Lozinka</label>
                  <div className="relative">
                    <input 
                      name="password" 
                      type={showPass ? "text" : "password"} 
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3.5 bg-slate-50 border rounded-lg outline-none transition-all ${
                        errors.password ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      }`}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[11px] font-medium text-red-500 ml-1">{errors.password}</p>}
                </div>

                <CustomInput 
                  label="Potvrda lozinke" 
                  name="confirmPassword" 
                  type={showPass ? "text" : "password"}
                  value={formData.confirmPassword}
                  error={errors.confirmPassword}
                  onChange={handleChange}
                />

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 px-4 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <ChevronLeft size={18} /> Nazad
                  </button>
                  <button type="submit" disabled={loading} className="flex-2 py-4 px-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:scale-95">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Završi prijavu"}
                  </button>
                </div>
              </div>
            )}

            {message && (
              <div className={`p-10 rounded-4xl text-center space-y-5 animate-in zoom-in-95 duration-300 ${message.type === "success" ? "bg-green-50" : "bg-red-50"}`}>
                {message.type === "success" ? (
                  <>
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white shadow-xl shadow-green-200">
                        <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-2xl font-extrabold text-green-900 tracking-tight">Skoro gotovo!</h3>
                    <p className="text-green-700 leading-relaxed font-medium">{message.text}</p>
                    <Link href="/login" className="inline-block px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-md mt-4">Idi na prijavu</Link>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                    <h3 className="text-xl font-bold text-red-900">Došlo je do greške</h3>
                    <p className="text-red-700 font-medium">{message.text}</p>
                    <button onClick={() => setMessage(null)} className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold mt-4">Pokušaj ponovo</button>
                  </>
                )}
              </div>
            )}
          </form>

          {!message && (
            <p className="text-center text-sm text-slate-500 mt-10">
              Već koristiš N&N Auto?{" "}
              <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4 decoration-2">Prijavi se</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}