# Lohiya Suppliers

A full-stack B2B e-commerce platform for industrial abrasives, cutting tools, and repair services.

Built with data and business categories from [lohiyas.com](https://lohiyas.com/) — Metal Industry, Wood Industry, and Book Repair services.

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS 4
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** SQLite (dev) — swap to PostgreSQL for production
- **Auth:** NextAuth.js with credentials provider
- **Charts:** Recharts

## Features

### Storefront
- Modern responsive homepage with hero, industry categories, featured products
- Product catalog with search, filters, and sorting
- Product detail pages with specifications
- Shopping cart (localStorage persistence)
- Checkout with multiple payment methods
- User registration & login (B2B with GST support)
- Contact form with inquiry types (Bulk Order, Repair, Quote)
- Newsletter subscription
- About page

### Admin Dashboard
- **Dashboard** — Revenue stats, low stock alerts, recent orders, inquiries
- **Products** — Full CRUD, stock management, featured toggles
- **Categories** — View all product categories
- **Orders** — List, detail view, status updates
- **Customers** — B2B customer management with order history
- **Inquiries** — Contact form management with status workflow
- **Coupons** — Discount code management
- **Banners** — Homepage banner management
- **Subscribers** — Newsletter list
- **Analytics** — Revenue charts, top products
- **Reports** — Inventory value, low stock, revenue by status
- **Settings** — Site config, shipping, tax, contact info

## Quick Start

```bash
# Install dependencies
npm install

# Set up database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

| Role     | Email                        | Password     |
|----------|------------------------------|--------------|
| Admin    | admin@lohiyasuppliers.com    | admin123     |
| Customer | customer@example.com         | customer123  |

Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

## Production Deployment

1. Change `NEXTAUTH_SECRET` in `.env`
2. Switch database to PostgreSQL in `prisma/schema.prisma`
3. Run `npx prisma migrate deploy`
4. Deploy to Vercel, Railway, or any Node.js host

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── (store)/          # Public storefront pages
│   ├── admin/            # Admin dashboard
│   └── api/              # API routes
├── components/
│   ├── admin/            # Admin UI components
│   ├── layout/           # Header, Footer
│   └── products/         # Product components
├── context/              # Cart context
├── lib/                  # Prisma, auth, utils
└── types/                # TypeScript types
```

## License

Private — Lohiya Suppliers © 2026
