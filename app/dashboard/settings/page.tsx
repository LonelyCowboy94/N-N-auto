import { db } from "@/db";
import { shops, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SettingsTabs from "./SettingsTabs";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const shopId = (session?.user as any)?.shopId;
  const userId = (session?.user as any)?.id;

  const [shopData] = await db.select().from(shops).where(eq(shops.id, shopId));
  const [userData] = await db.select().from(users).where(eq(users.id, userId));

  return (
    // Uklonjen max-w-6xl i mx-auto, dodata puna širina
    <div className="p-6 lg:p-12 w-full space-y-8"> 
      <header className="border-b border-border pb-6">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-foreground">Sistemska Podešavanja</h1>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] mt-1 italic opacity-70">
           Konfiguracija servisa i administracija naloga
        </p>
      </header>

      {/* Tabs će sada ispuniti sav prostor desno od sidebara */}
      <SettingsTabs shopData={shopData} userData={userData} />
    </div>
  );
}