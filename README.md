<div align="center">
  <img src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=200&h=200" alt="The Digital Grill Logo" width="120" style="border-radius: 50%;">
  <h1>🍔 The Digital Grill</h1>
  <p><strong>A Modern, Self-Service Restaurant Ordering Kiosk Website</strong></p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#folder-structure">Folder Structure</a>
  </p>
</div>

---

## 📖 Overview

**The Digital Grill** is a lightning-fast, highly interactive Single Page Application (SPA) designed to replicate the sleek, frictionless touchscreen kiosks used in modern fast-casual restaurants (like McDonald's or Taco Bell).

Built with **pure Vanilla JavaScript** and **TailwindCSS**, it features a beautiful animated interface, dynamic item customizations, a fully functioning cart system, and real-time integration with **Supabase** for live menu syncing and order storage.

---

## ✨ Key Features

- **📱 True Kiosk Experience:** No login, no sign-up. Customers walk up, tap, and order.
- **⚡ Single Page Application (SPA):** Seamless, instant transitions between the Menu, Cart, Checkout, and Confirmation screens using custom hash routing.
- **☁️ Supabase PostgreSQL Backend:**
  - **Live Menu:** Fetches all 20 menu items directly from the database on startup.
  - **Order Logging:** Saves completed orders (including custom add-ons and dynamic pricing) to the cloud.
- **🎨 Premium UI/UX:** High-resolution food imagery, smooth micro-animations (hovering cards, pulsing cart badges), glassmorphic elements, and beautiful Material icons.
- **🍔 Customization Engine:** Users can select dynamic add-ons (e.g., +₹40 for Extra Cheese) directly from an animated modal.
- **💳 Payment Simulation:** A beautifully designed loading state simulates credit card processing.
- **📱 Responsive Layout:** Converts the Category Sidebar into a native-feeling horizontal scroll bar on mobile devices to save screen space.

---

## 🛠️ Tech Stack

<details>
<summary>Click to view the technologies used in this project</summary>

- **Frontend Core:** HTML5, CSS3, ES6+ JavaScript (Vanilla)
- **Styling:** TailwindCSS (via CDN) + Custom utility CSS
- **Backend / Database:** [Supabase](https://supabase.com/) & PostgreSQL
- **Database Client:** `@supabase/supabase-js`
- **Iconography:** Google Material Symbols (Outlined)
- **Local Dev Server:** Node.js `serve` package

</details>

---

## 🚀 Getting Started

To run this Digital Kiosk locally, you'll need the database schema loaded into your Supabase project and a local server to handle the JavaScript ES modules.

### Prerequisites

1.  [Node.js](https://nodejs.org/) installed on your machine.
2.  A free account on [Supabase](https://supabase.com/).

### Setup Instructions

#### 1. Configure the Database
- Log in to your Supabase project dashboard.
- Navigate to the **SQL Editor**.
- Copy the entire contents of the `supabase_schema.sql` file provided in this repository.
- Paste it into a new query and click **Run**.
  _This will automatically generate the `menu_items`, `orders`, and `order_items` tables, apply public access policies, and seed the menu with 20 items (prices in INR)._

#### 2. Run the Kiosk Locally
- Clone or download this repository to your local machine.
- Open your terminal and navigate to the project directory:
  ```bash
  cd path/to/kiosk-folder
  ```
- Start a local development server using `npx`:
  ```bash
  npx serve .
  ```
- Your terminal will output a local network address (typically `http://localhost:3000`).
- Open that URL in your favorite web browser and start ordering! 🎉

---

## 📁 Folder Structure

```text
📦 Kiosk Project
 ┣ 📜 index.html           # The main entry layout and structural UI
 ┣ 📜 styles.css           # Custom CSS (animations, components, scrollbars)
 ┣ 📜 app.js               # SPA router logic, Cart state, UI rendering functions
 ┣ 📜 data.js              # Fallback menu dataset (loaded if Supabase fails)
 ┣ 📜 supabase.js          # Supabase client config and database fetch/insert functions
 ┣ 📜 supabase_schema.sql  # SQL definitions for the PostgreSQL backend
 ┣ 📜 package.json         # Simple script configuration for local dev
 ┗ 📜 README.md            # This documentation file
```

---

<div align="center">
  <p><i>Taste the future of ordering. Developed with ❤️ and Vanilla JS.</i></p>
</div>
