"use server";
import { db } from "@/db";
import { users, shops } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { resend } from "@/lib/resend";
import { randomUUID } from "crypto";

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const shopName = formData.get("shopName") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;

  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existing.length > 0) return { error: "Email je već u upotrebi." };

    const hashedPassword = await bcrypt.hash(password, 10);
    const myToken = randomUUID();

    const [newShop] = await db
      .insert(shops)
      .values({
        name: shopName,
        address: address,
        city: city,
      })
      .returning();

    await db.insert(users).values({
      email,
      password: hashedPassword,
      shopId: newShop.id,
      verificationToken: myToken,
    });

    const verifyUrl = `${process.env.NEXTAUTH_URL}/verify?token=${myToken}`;
    await resend.emails.send({
      from: "N&N Auto <onboarding@resend.dev>",
      to: email,
      subject: "Potvrdi svoj nalog - N&N Auto",
      html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; }
          .header { background-color: #0f172a; padding: 40px; text-align: center; }
          .logo { color: #3b82f6; font-size: 24px; font-weight: bold; font-style: italic; text-transform: uppercase; letter-spacing: 2px; }
          .content { padding: 40px; color: #1e293b; line-height: 1.6; }
          .welcome { font-size: 22px; font-weight: bold; color: #0f172a; margin-bottom: 20px; }
          .button-container { padding: 30px 0; text-align: center; }
          .button { background-color: #3b82f6; color: #ffffff !important; padding: 16px 32px; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; }
          .footer { padding: 30px; background-color: #f1f5f9; color: #64748b; font-size: 12px; text-align: center; }
          .divider { border-top: 1px solid #e2e8f0; margin: 30px 0; }
          .link-alt { font-size: 11px; color: #94a3b8; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">N&N Auto</div>
          </div>
          <div class="content">
            <div class="welcome">Dobrodošli u tim, ${shopName}!</div>
            <p>Uspešno ste registrovali svoj nalog na <strong>N&N Auto</strong> platformi za digitalno upravljanje servisom.</p>
            <p>Sada je preostalo još samo da potvrdite vašu email adresu kako biste aktivirali sve funkcije sistema, uključujući radne naloge i analitiku.</p>
            
            <div class="button-container">
              <a href="${verifyUrl}" class="button">Potvrdi nalog</a>
            </div>

            <p>Nakon potvrde, moći ćete da podesite PIB, logo i ostale podatke vaše radnje u sekciji "Podešavanja".</p>
            
            <div class="divider"></div>
            
            <p style="font-size: 13px;">Ukoliko dugme ne radi, iskopirajte sledeći link u vaš browser:</p>
            <p class="link-alt">${verifyUrl}</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} N&N Auto System. Sva prava zadržana.</p>
            <p>Ovaj mejl je poslat automatski, molimo vas da ne odgovarate na njega.</p>
          </div>
        </div>
      </body>
    </html>
  `,
    });

    return { success: "Molimo Vas dovršite potvrdu naloga na vašem emailu." };
  } catch (e: any) {
    console.error(e);
    return { error: "Došlo je do greške na serveru." };
  }
}
