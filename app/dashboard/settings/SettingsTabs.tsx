"use client";

import { useState } from "react";
import { Building2, UserCog, ShieldCheck } from "lucide-react";
import SettingsForm from "./SettingsForm"; // Tvoja postojeća forma za firmu
import AccountForm from "./AccountForm";

export default function SettingsTabs({ shopData, userData }: any) {
  const [activeTab, setActiveTab] = useState("firma");

  const tabs = [
    { id: "firma", label: "Podaci Firme", icon: Building2 },
    { id: "account", label: "Moj Nalog", icon: UserCog },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-10 items-start">
      
      {/* LEVA STRANA: NAVIGACIJA */}
      <aside className="w-full md:w-64 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all border ${
                activeTab === tab.id 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                : "bg-card/30 border-border text-muted-foreground hover:border-primary hover:text-foreground"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
        
        <div className="mt-10 p-4 bg-blue-500/5 border border-blue-500/20">
           <div className="flex items-center gap-2 text-blue-500 mb-2">
              <ShieldCheck size={14} />
              <span className="text-[8px] font-black uppercase tracking-widest">Sistem Sigurnosti</span>
           </div>
           <p className="text-[10px] text-muted-foreground leading-relaxed italic">
              Svi podaci su enkriptovani i vidljivi samo administratoru servisa.
           </p>
        </div>
      </aside>

      {/* DESNA STRANA: SADRŽAJ (FORME) */}
      <main className="flex-1 w-full animate-in fade-in slide-in-from-right-4 duration-300">
        {activeTab === "firma" ? (
          <SettingsForm initialData={shopData} />
        ) : (
          <AccountForm userData={userData} />
        )}
      </main>
    </div>
  );
}