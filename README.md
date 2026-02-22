# 🚗 N&N Auto

### ⚙️ Professional Auto Shop Management SaaS

A modern, high-performance web application designed to **digitize automechanic workflows**, manage service history, and track business finances in real time.

---

## 🌐 Live Concept

> Built as a scalable **multi-tenant SaaS platform** for auto repair shops.

---

## 🖼️ Preview

### Dashboard
![Dashboard Preview](https://via.placeholder.com/1200x600?text=N%26N+Auto+Dashboard)

### Work Order (A4 Print)
![Work Order Preview](https://via.placeholder.com/1200x600?text=Work+Order+A4+View)

---

## 🧰 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL (Neon) |
| ORM | Drizzle ORM |
| Auth | NextAuth.js |
| Styling | Tailwind CSS v4 |
| Storage | UploadThing |
| Emails | Resend |
| Icons | Lucide React |

---

## ✨ Core Features

### 📋 Smart Work Orders

- A4-optimized digital service sheets
- Automatic VAT (20%) and totals calculation
- Real-time kW ⇄ HP conversion
- Printable & PDF export ready
- Status tracking: **Open → Completed**

---

### 📊 Business Analytics

- Monthly revenue dashboard
- Expense tracking system
- Profit & growth insights
- Customer visit metrics

---

### 👥 CRM System

- Customer & vehicle database
- Complete service history
- Global smart search
- Digital service book

---

### 🎨 Branding & UX

- Custom shop logo upload
- Persistent Dark / Light mode
- Professional industrial UI design

---

### 🔐 Security & SaaS Architecture

- Multi-tenant database structure
- Shop-level data isolation
- Server-side session validation
- Protected dashboard routing

---

## 🏗️ System Architecture


Multi-Tenant Model:

Users → Shop → Customers → Vehicles → Work Orders → Expenses


Each entity is securely linked via **shopId**, ensuring full tenant separation.

---

## 📂 Project Structure


app/
├── actions/ # Server logic
├── api/ # API routes
├── dashboard/ # Protected pages
│ ├── documents/
│ ├── customers/
│ ├── vehicles/
│ └── stats/
└── verify/ # Email verification

components/
db/
lib/
middleware.ts


---

## 🚀 Getting Started

### 1️⃣ Clone repo

```bash
git clone https://github.com/youruser/nn-auto.git
cd nn-auto
2️⃣ Install dependencies
npm install
3️⃣ Setup environment variables

Create .env:

DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
RESEND_API_KEY=
UPLOADTHING_TOKEN=
4️⃣ Sync database
npx drizzle-kit push
5️⃣ Run dev server
npm run dev
📈 Future Roadmap

Online booking system

Invoice payment tracking

Mobile responsive app mode

Mechanic performance analytics

Automated reminders (SMS/Email)

📝 License

MIT License

❤️ About

Built with passion to modernize traditional auto repair businesses and bring them into the digital era.

⭐ If you like this project, consider giving it a star!