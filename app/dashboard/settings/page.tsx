// app/dashboard/settings/page.tsx
import { db } from "@/db";
import { shops } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const shopId = (session?.user as any)?.shopId;

  // Povuci podatke iz baze za inicijalni value
  const [shopData] = await db.select().from(shops).where(eq(shops.id, shopId));

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Podešavanja radnje</h1>
        <p className="text-slate-500 mt-1">Ovi podaci će se prikazivati u zaglavlju svakog ponude i računa.</p>
      </header>

      <SettingsForm initialData={shopData} />
    </div>
  );
}