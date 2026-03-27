# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Organika's Food — D2C e-commerce for natural dehydrated vegetable powders (Beetroot, Carrot, Coriander Leaf, Curry Leaves). Ships Pan-India & Internationally.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Styling:** Tailwind CSS 4
- **Backend:** Supabase (Auth, PostgreSQL, Storage)
- **Hosting:** Vercel
- **State:** Zustand (cart), React Context (auth)
- **Animations:** Framer Motion
- **Icons:** lucide-react

## Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

### Auth Flow
- `src/context/AuthContext.tsx` — Supabase auth state (user, role, signOut)
- `src/lib/supabase.ts` — Two clients: `supabase` (anon, browser) and `getSupabaseAdmin()` (service role, server-only)
- Roles: `admin` | `customer` — stored in `profiles` table, checked via RLS
- Google OAuth + email/password + password reset flow

### Data Layer
- `src/data/products.ts` — Static product data (hardcoded, not from Supabase yet for the 4 products)
- `src/lib/supabase-products.ts` — Supabase product CRUD (admin uses this)
- `src/lib/supabase-orders.ts` — Order creation, fetching, status updates
- `src/lib/supabase-coupons.ts` — Coupon CRUD + validation + usage tracking

### Database Tables (Supabase)
- `products` — name, slug, sizes (JSON), prices, discount_percent, image_src
- `profiles` — user_id, role (admin/customer)
- `orders` — order_number, items (JSON), delivery (JSON), totals, status, payment
- `coupons` — code, discount_type (percentage/flat), discount_value, is_active, unlimited_use
- `coupon_usage` — tracks per-user coupon usage

### Key Patterns
- Product images: Supabase Storage bucket `product-images` (public) or `/public/images/products/`
- Admin dashboard: `src/app/admin/AdminDashboard.tsx` — tabs for Products & Coupons
- Shipping: Flat ₹60 (shipping logic to be updated)
- WhatsApp: `WHATSAPP_NUMBER` in constants, `getWhatsAppUrl()` in utils
- Order flow: Cart → Checkout (COD) → WhatsApp admin notify → Order confirmation page

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=    # Optional, defaults to 919834845240
RESEND_API_KEY=                 # For order email notifications
```

## Important Notes
- "Maharashtra" references in about/sourcing content are intentional (authentic branding)
- Guest checkout supported (user_id nullable on orders)
- Admin access: user must have `role: 'admin'` in profiles table
- Supabase RLS policies enforce access control — admin operations use service role client
