import Link from "next/link";
import { Wrench, FileText, BarChart3, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 bg-white border-b">
        <div className="flex items-center gap-2 font-bold text-2xl text-blue-600">
          <Wrench size={28} />
          <span>N&N Auto</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600">
            Prijava
          </Link>
          <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Registruj radnju
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-6xl mx-auto px-8 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6">
          Sve za tvoju automehaničarsku radnju na <span className="text-blue-600">jednom mestu</span>.
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          Digitalni radni nalozi, automatsko generisanje ponuda i računa. 
          Organizuj svoj servis i fokusiraj se na popravke, a ne na papire.
        </p>
        <Link href="/register" className="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200">
          Započni besplatno
        </Link>
      </header>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 py-16 grid md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<FileText className="text-blue-600" size={32} />}
          title="Radni Nalozi"
          description="Kreiraj profesionalne radne naloge koje klijenti mogu da potpišu direktno na tabletu ili štampaj na licu mesta."
        />
        <FeatureCard 
          icon={<BarChart3 className="text-blue-600" size={32} />}
          title="Ponude i Računi"
          description="Jednim klikom pretvori ponudu u radni nalog, a nalog u račun. Brzo i bez grešaka."
        />
        <FeatureCard 
          icon={<CheckCircle2 className="text-blue-600" size={32} />}
          title="Istorija Servisa"
          description="Svaki auto ima svoju digitalnu knjižicu. Znaj tačno šta je rađeno pre dve godine na bilo kom vozilu."
        />
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}