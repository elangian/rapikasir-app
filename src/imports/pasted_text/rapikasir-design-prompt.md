# RapiKasir — Figma Design Prompt

> Paste prompt ini ke Figma agent. Pastikan skill brutalist-skill, taste-skill,
> dan impeccable-full sudah terpasang sebelum menjalankan prompt ini.

---

## PROMPT

You are a senior product designer and UI/UX strategist. Design a complete
web application called **RapiKasir** — a SaaS POS (Point of Sale) system
for Indonesian UMKM (small-medium businesses).

Apply brutalist-skill, taste-skill, impeccable-visual-1, 
impeccable-visual-2, impeccable-motion, and impeccable-layout skills.
Reference: brand.md, audit.md, critique.md, polish.md from 
impeccable-visual-1 — colorize.md, typeset.md, bolder.md from 
impeccable-visual-2 — animate.md, delight.md, craft.md from 
impeccable-motion — layout.md, clarify.md, onboard.md from 
impeccable-layout.

---

## PRODUCT CONTEXT

**Product:** RapiKasir — Digital POS system, web-based & responsive
**Tagline:** Catat transaksi, kelola usaha lebih rapi.
**Model:** SaaS Freemium (Free → Trial Pro → Pro → Business)
**Target users:**
- Primary: UMKM owners (warung makan, kantin, kedai kopi, toko kelontong,
  laundry, toko ATK, boutique kecil, toko retail rumahan)
- Secondary: Gen Z entrepreneurs starting their first business

**Audience for this design:**
This will be shown to TWO audiences simultaneously:
1. Investors (40-60 yo): need to feel trust, credibility, clarity,
   and professional competence
2. Gen Z founders & users: need to feel modern, bold, and non-generic

---

## DESIGN CONCEPT: "Premium Brutalism"

A refined take on brutalism — bold structure and visual confidence of
brutalism, but executed with a premium palette that reads as credible
and trustworthy to investors. Reference: Vercel, Linear, Loom.

NOT raw/chaotic brutalism. NOT corporate-flat SaaS. The middle ground.

---

## COLOR SYSTEM — "Forest Premium"

Use this exact palette. Do not substitute:

- **Background primary:** #F7F5F0 (warm off-white, NOT pure white)
- **Brand primary:** #0D3320 (deep forest green — growth, local, UMKM)
- **Brand secondary:** #1A5C38 (mid green, for hover states and accents)
- **Accent bold:** #F5A623 (amber — energy, transactions, CTAs)
- **Accent danger:** #D94F3D (for low stock alerts, errors)
- **Accent success:** #2D9E6B (for positive metrics, completed transactions)
- **Text primary:** #1A1A1A (near-black, NOT pure black)
- **Text secondary:** #6B6B6B (for labels, captions)
- **Border default:** #1A1A1A (dark borders — brutalist signature)
- **Card background:** #FFFFFF (pure white cards on warm background)
- **Block accent 1:** #FFF3D6 (amber tint — highlight blocks)
- **Block accent 2:** #E8F4EE (green tint — positive metric blocks)

---

## TYPOGRAPHY

- **Display/Hero heading:** Plus Jakarta Sans Bold or Sora Bold
  (strong, geometric, Indonesian startup feel — NOT Inter for headings)
- **Section headings:** Plus Jakarta Sans SemiBold
- **Body text:** Inter Regular — clean and readable for data-heavy UI
- **Metrics/Numbers:** Plus Jakarta Sans Bold, larger size, prominent
- **Labels/Captions:** Inter Regular, #6B6B6B
- **Font sizes:** Don't be shy — make headings large and punchy

---

## LAYOUT RULES

- **Dashboard:** Bento grid layout — variable block sizes (1x1, 1x2, 2x1, 2x2)
  that group related metrics and features. NOT stacked vertical cards.
- **Sidebar:** Fixed left sidebar, 240px, collapsible to 64px
- **Card style:** White cards, 2px solid #1A1A1A border,
  box-shadow: 4px 4px 0px #1A1A1A (offset brutalist shadow on key cards)
- **Border radius:** 6px max — slightly square, NOT rounded-xl everywhere
- **Spacing:** Generous — breathing room is premium
- **Buttons:** Solid filled, high contrast, 4-6px border-radius,
  bold label text, 2px dark border

---

## FEATURE TIERS — show tier badges on locked features

### FREE — "Gratis, untuk mulai digitalisasi"
- Max 30 products
- Max 100 transactions/month
- Basic transaction recording (kasir)
- Basic stock management (view only)
- No monthly reports
- No gross profit (laba kotor)
- No net profit (laba bersih)
- No export Excel/PDF
- No multi-user
- No multi-branch
- Basic support

### TRIAL PRO — "Coba gratis 1 bulan"
- Max 300 products
- Higher transaction limit
- Monthly reports ✓
- Gross profit (laba kotor) ✓
- Net profit (laba bersih) — limited
- Export Excel/PDF ✓
- No multi-user
- No multi-branch
- Basic support

### PRO — Rp 25.000/bulan — "Untuk UMKM aktif"
- Max 500 products
- Unlimited transactions
- Monthly reports ✓
- Gross profit (laba kotor) ✓
- Net profit (laba bersih) ✓
- Export Excel/PDF ✓
- Multi-user — limited (2 users)
- No multi-branch
- Standard support

### BUSINESS — Rp 75.000/bulan — "Untuk UMKM berkembang"
- Unlimited products
- Unlimited transactions
- Monthly reports ✓
- Gross profit (laba kotor) ✓
- Net profit (laba bersih) ✓ (detailed)
- Export Excel/PDF ✓ (full, custom date range)
- Multi-user ✓ full (roles: owner, kasir, manajer)
- Multi-branch ✓
- Priority support

---

## SCREENS TO DESIGN (in this order)

### SCREEN 1 — Dashboard (start here)

Bento grid layout. Hero area shows today's performance at a glance.

**Bento blocks:**
- [2x1] Hero metric: Total revenue today (large number, amber accent,
  trend vs yesterday as percentage)
- [1x1] Transaction count today (with mini sparkline)
- [1x1] Active products count
- [2x1] Top 5 selling products — horizontal mini bar chart
- [1x1] Low stock alert — list of products with stock < 5
  (red accent, badge count)
- [2x1] Recent transactions table — last 8 transactions
  (time, item name, total, payment method badge)
- [1x1] Quick action: "+ Transaksi Baru" (amber CTA button, large)
- [1x1] Quick action: "+ Tambah Produk" (outline button)

**Sidebar navigation items:**
- Dashboard (active state)
- Transaksi
- Produk
- Stok
- Laporan
- Pengaturan
- Paket & Upgrade (amber highlight — upsell anchor)
- User avatar + store name at bottom

**Header bar:**
- Store name / selector (for Business tier: branch switcher)
- Search bar
- Notification bell (badge for low stock alerts)
- User avatar + dropdown

**Tier indicator:** Show current plan badge in sidebar
(e.g., "Paket FREE" with amber "Upgrade" pill button)

---

### SCREEN 2 — Transaksi / POS Screen

Split-layout: product catalog on left, cart on right.

**Left panel (product catalog):**
- Search/filter bar
- Category filter tabs (pills/chips)
- Product grid — cards with: product image placeholder, name,
  price, stock badge
- Locked products (Free tier) show tier lock overlay with
  "Upgrade ke Pro" tooltip on hover

**Right panel (cart/checkout):**
- Cart items list with quantity controls (+/-)
- Subtotal
- Discount input (Pro & Business only — locked for Free)
- Payment method selector: Cash, Transfer, QRIS
  (QRIS badge: "Business" tier lock for Free)
- Total amount (large, prominent)
- "Proses Transaksi" button — full width, amber, bold

---

### SCREEN 3 — Laporan (Reports)

Show tier gating prominently here — this is the main upsell screen.

**Free tier view:**
- Shows blurred/locked monthly report with overlay:
  "Fitur ini tersedia di Paket Pro"
  Amber CTA: "Upgrade Sekarang — Rp 25.000/bulan"

**Pro/Business tier view:**
- Date range picker (custom for Business, monthly for Pro)
- KPI cards row: Total Revenue, Total Transactions,
  Gross Profit (Laba Kotor), Net Profit (Laba Bersih)
- Revenue trend line chart (30 days)
- Top products table
- Export button: "Export Excel" / "Export PDF"
  (Export locked for Free — show lock icon)

---

### SCREEN 4 — Pricing / Paket Page

This is investor-facing — make it feel premium and conversion-optimized.

**Layout:** 4 pricing cards side by side (or 2x2 on narrower viewports)

**Each card shows:**
- Plan name + tagline
- Price (large, prominent)
- "Mulai Sekarang" or "Coba Gratis" CTA button
- Feature list with ✓ and ✗ (or lock icons)

**Pro card:** Highlighted with green border + "Paling Populer" badge
**Business card:** Premium feel with dark (#0D3320) background, white text

**Feature comparison table below cards** — full breakdown of all
features across tiers (use the tier table from the brief above)

---

### SCREEN 5 — Produk (Product Management)

- Table view: product name, category, price, stock, status
- Tier limit indicator: "23 dari 30 produk digunakan" (Free tier,
  progress bar turning red as limit approaches)
- "Tambah Produk" button (disabled + tooltip when limit reached)
- Edit / Delete actions per row
- Search + filter by category

---

## INTERACTION NOTES (for export to code)

- Hover on bento cards: border-color shifts to amber, slight elevation
- Button active state: scale(0.97), 160ms ease-out
- Sidebar collapse: smooth 200ms ease-out transition
- Tier lock overlay: appear on hover with 150ms fade
- Low stock badge: subtle pulse animation (not distracting)
- Transitions: 150-200ms ease-out only — this is a working tool,
  not a marketing site. Speed matters for cashiers.
- No decorative loading animations that slow down the POS workflow

---

## WHAT TO AVOID — STRICTLY

- Blue/purple gradient hero sections (too generic SaaS)
- All cards with same border-radius (rounded-xl everywhere)
- Thin gray box-shadow: 0 1px 3px rgba(0,0,0,0.1) on all cards
- "Three features in a row" generic sections
- Pure white background (#FFFFFF as page background)
- Inter font for BOTH headings and body (no contrast)
- Dashboard that looks like a free Tailwind admin template
- Pastel color palette
- Glassmorphism (overused in 2024-2025)
- Flat, lifeless button styles with no visual weight

---

## OUTPUT INSTRUCTIONS

1. Start with **Screen 1 — Dashboard** at 1440px wide desktop
2. Use auto-layout and components for all repeated elements
3. Create a basic design token set (colors, typography, spacing)
   before building screens
4. After Dashboard, ask which screen to design next
5. All text should be in Indonesian (Bahasa Indonesia)
6. Use realistic placeholder data (Indonesian store names, IDR prices,
   Indonesian product names like "Kopi Susu", "Nasi Goreng", etc.)