# 🍔 The Digital Grill — Self-Service Kiosk

> A premium self-service restaurant ordering kiosk built with Vanilla JavaScript and Supabase.  
> Inspired by modern fast-casual kiosks like McDonald's, Taco Bell, and Zomato Kiosk.

---

## 📖 Overview

**The Digital Grill** is a fully-functional, cloud-connected **Single Page Application (SPA)** that simulates a real restaurant self-ordering kiosk. Customers can browse the menu, customize their items, apply promo codes, choose a payment method, and receive an order confirmation — all without reloading the page.

The backend is powered by **Supabase (PostgreSQL)**, which stores and serves the live menu and persists completed orders in real-time.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🛒 **Full Cart System** | Add items, adjust quantities, remove items |
| 🎛️ **Item Customization** | Dynamic add-ons with live price updates (e.g., +₹40 Extra Cheese) |
| 📝 **Special Instructions** | Add a note per item ("less spicy", "no onions", "extra sauce") |
| 🏷️ **Promo Codes** | `WELCOME10`, `FESTIVE20`, `FLAT50` discount codes |
| 💳 **Payment Simulation** | Cash, UPI, Card, Loyalty Points, Pay at Counter |
| ☁️ **Supabase Backend** | Live menu from PostgreSQL, orders saved to cloud  |
| 📋 **Order History** | Every order is persisted with itemized breakdown and notes |
| 📱 **Responsive Design** | Works on desktop, tablet, and mobile |
| ⚡ **SPA Routing** | Instant page transitions using hash routing |
| 🎨 **Premium UI** | Micro-animations, glassmorphism, Material Icons |

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla ES6+ JavaScript
- **Styling:** TailwindCSS (CDN) + Custom CSS (`styles.css`)
- **Backend:** [Supabase](https://supabase.com/) — PostgreSQL database
- **Icons:** Google Material Symbols
- **Local Server:** Node.js `serve`

---

## 🚀 Running Locally

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/KIOSK.git
cd KIOSK
```

### 2. Set Up the Database

The Supabase project is already configured with a live connection. However, if you want to run your own instance:

1. Create a free project at [supabase.com](https://supabase.com)
2. Open the **SQL Editor** in your Supabase dashboard
3. Paste and run the contents of `supabase_schema.sql`  
   _(This creates the tables and seeds the full menu with 20 items)_
4. Update `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `supabase.js`

### 3. Start the Local Server

```bash
npx serve .
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

> No `npm install` needed — the project uses CDN libraries only.

---

## 📁 Project Structure

```
📦 KIOSK/
 ┣ 📜 index.html          — Page layout, all screens (Home, Menu, Cart, Checkout, Confirmation)
 ┣ 📜 app.js              — SPA router, cart logic, all UI rendering functions
 ┣ 📜 data.js             — Local fallback menu (used if Supabase is unavailable)
 ┣ 📜 supabase.js         — Supabase client + fetch/insert helpers
 ┣ 📜 styles.css          — Custom animations, card styles, scrollbars
 ┣ 📜 supabase_schema.sql — PostgreSQL table definitions + seed data
 ┣ 📜 package.json        — Dev server script
 ┗ 📁 images/             — Local food images (fallback for CDN-blocked photos)
```

---

## 🗄️ Database Schema

Three tables in Supabase PostgreSQL:

| Table | Purpose |
|---|---|
| `menu_items` | Stores all 20 menu items with pricing, images, and customizations |
| `orders` | Records each completed order with customer info and totals |
| `order_items` | Line-item breakdown for each order |

Row-Level Security (RLS) is enabled — public read for menu, public insert for orders.

---

## 🎯 How It Works

1. **On load** — App connects to Supabase and fetches the live menu
2. **Menu page** — Items rendered dynamically, filterable by category or search
3. **Item click** — Opens customization modal with add-on checkboxes and live price preview
4. **Cart** — Persists in memory, supports promo code discounts (5% GST + ₹30 service fee applied)
5. **Checkout** — Customer fills name, phone, selects dine-in or takeaway
6. **Payment** — Simulated processing screen with animated progress bar
7. **Confirmation** — Order number displayed, order saved to Supabase

---

## 🏷️ Promo Codes

| Code | Discount |
|---|---|
| `WELCOME10` | 10% off subtotal |
| `FESTIVE20` | 20% off subtotal |
| `FLAT50` | Flat ₹50 off |
