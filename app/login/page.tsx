"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Wrench, Loader2, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";

// --- Pomoćna komponenta za inpute (izmeštena radi fokusa) ---
const LoginInput = ({ label, name, type = "text", placeholder, icon: Icon, error, value, onChange }: any) => (
  <div className="space-y-1.5 text-left">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className={`absolute left-4 top-3.5 transition-colors ${error ? "text-red-500" : "text-slate-400 group-focus-within:text-blue-500"}`}>
        <Icon size={18} />
      </div>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-11 pr-4 py-3 border rounded-xl outline-none transition-all ${
          error 
            ? "border-red-500 bg-red-50 ring-1 ring-red-500" 
            : "border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent"
        }`}
      />
      {error && <AlertCircle className="absolute right-3 top-3.5 text-red-500" size={18} />}
    </div>
    {error && <p className="text-[11px] font-medium text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">{error}</p>}
  </div>
);

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Čistimo grešku dok korisnik kuca
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    setServerError("");
  };

  const validate = () => {
    let newErrors: { email?: string; password?: string } = {};
    if (!formData.email.trim()) newErrors.email = "Email je obavezan";
    if (!formData.password) newErrors.password = "Lozinka je obavezna";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");

    const res = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    if (res?.error) {
      if (res.error.includes("potvrditi email")) {
        setServerError("Nalog nije verifikovan. Proverite svoj email.");
      } else {
        setServerError("Pogrešna email adresa ili lozinka.");
      }
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header (Isti stil kao na registraciji) */}
        <div className="bg-slate-900 p-8 text-white relative text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
                <Wrench className="text-white" size={20} />
            </div>
            <span className="font-bold tracking-tight text-xl uppercase italic">N&N Auto</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Prijava na sistem</h2>
          <p className="text-slate-400 text-sm mt-1">Upravljajte svojim servisom digitalno.</p>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
            <div className="h-full bg-blue-500 w-1/4"></div>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            <LoginInput 
              label="Email adresa" 
              name="email" 
              type="email" 
              placeholder="vlasnik@servis.rs" 
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <div className="space-y-1.5 relative">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                Lozinka
              </label>
              <div className="relative group text-left">
                <div className={`absolute left-4 top-3.5 transition-colors ${errors.password ? "text-red-500" : "text-slate-400 group-focus-within:text-blue-500"}`}>
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-12 py-3 border rounded-xl outline-none transition-all ${
                    errors.password 
                      ? "border-red-500 bg-red-50 ring-1 ring-red-500" 
                      : "border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  }`}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] font-medium text-red-500 ml-1">{errors.password}</p>}
            </div>

            {serverError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-semibold animate-in fade-in zoom-in-95 duration-200 flex items-center justify-center gap-2">
                <AlertCircle size={16} />
                {serverError}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-100 disabled:opacity-50 mt-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Prijavi se"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Nemate nalog za servis?{" "}
              <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4 decoration-2">
                Započnite ovde
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}