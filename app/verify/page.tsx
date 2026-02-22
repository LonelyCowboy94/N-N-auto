// app/verify/page.tsx
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  if (!token) redirect("/?error=InvalidToken");

  const [user] = await db.select().from(users).where(eq(users.verificationToken, token));

  if (!user) redirect("/?error=TokenNotFound");

  // USPEH: Verifikujemo i brišemo token
  await db.update(users)
    .set({ 
      emailVerified: new Date(), 
      verificationToken: null 
    })
    .where(eq(users.id, user.id));

  redirect("/?success=Verified");
}