import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { shops } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ThemeProvider } from "@/components/ThemeProvider";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  const [shop] = await db.select().from(shops)
    .where(eq(shops.id, (session?.user as any).shopId));

  const themeFromDb = shop?.theme || "light";

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme={themeFromDb} 
      forcedTheme={themeFromDb} 
    >
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}