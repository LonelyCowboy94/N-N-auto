"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Car,
  FileText,
  Settings,
  LogOut,
  Wrench,
  Menu,
  X,
  ChartNoAxesCombined,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Kontrolna tabla", href: "/dashboard" },
  { icon: Users, label: "Klijenti", href: "/dashboard/customers" },
  { icon: Car, label: "Vozila", href: "/dashboard/vehicles" },
  { icon: FileText, label: "Dokumenti", href: "/dashboard/documents" },
  { icon: ChartNoAxesCombined, label: "Statistika", href: "/dashboard/stats" },
  { icon: Settings, label: "Podešavanja", href: "/dashboard/settings" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Dugme za mobilni (prikazuje se samo na < 1024px) */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden print:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay za mobilni (zatvara meni klikom van njega) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Glavni Sidebar */}
      <aside
        className={`
        fixed lg:sticky top-0 left-0 z-40
        h-screen w-72 bg-slate-950 text-slate-400
        transform transition-transform duration-300 ease-in-out
        border-r border-slate-800 flex flex-col print:hidden
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Logo deo */}
        <div className="p-6 mb-2">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
              <Wrench className="text-white" size={18} />
            </div>
            <span className="font-bold text-white text-lg tracking-tight uppercase italic">
              N&N Auto
            </span>
          </div>
        </div>

        {/* Navigacija */}
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)} // Zatvori na mobilnom kad se klikne
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all group
                  ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-900 hover:text-slate-200"
                  }
                `}
              >
                <item.icon
                  size={18}
                  className={
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:text-blue-400"
                  }
                />
                <span className="text-[14px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / User deo */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            <LogOut size={18} />
            Odjavi se
          </button>
        </div>
      </aside>
    </>
  );
}
