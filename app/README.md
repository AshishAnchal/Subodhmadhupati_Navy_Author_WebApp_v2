# Subodhmadhupati — Navy Author Website (v2)

React + Vite frontend, Node/Express API, and a built-in **admin panel**.

## What's new
- **Hero fixed** – the name no longer runs over the portrait. The hero is now a 3-column grid (text · portrait · quote) that stacks on mobile. The large heading shows `Subodhmadhupati`; the `.sahityka` suffix appears only in the logo/footer and can be changed or hidden in Admin → Site settings.
- **Separate pages**: `/journal`, `/blog`, `/stories`, `/poetry`, plus `/books`, `/gallery`, `/about`, `/contact`, `/search`. Each journal/blog/story/poem has its own page (`/journal/my-entry`).
- **Admin panel** at `/admin`: manage Journal, Blog, Stories, Poetry, Books (price, cover), Gallery, site text/portrait/social links, contact messages, newsletter subscribers (CSV export) and paid orders. Image upload included.
- Multi-book cart; prices are always taken from the server.
- Data is saved in `server/data/db.json`; uploads in `server/uploads/` (back both up).

## Checkout & Cash on Delivery
- `/checkout` collects name, mobile, address and PIN code, then lets the customer choose **Cash on Delivery** or **Pay online** (Razorpay, only shown once keys are set).
- Admin → Site settings → *Checkout*: switch COD on/off and add an optional COD charge.
- Admin → Orders: see customer and address, filter COD/online, set status (new → confirmed → shipped → delivered), and mark cash as collected.

## Site map & SEO
- `/sitemap.xml` is generated automatically (all pages + every published entry) and `/robots.txt` points to it. Set `SITE_URL` in `server/.env` to your real domain before launch, then submit `https://yourdomain/sitemap.xml` in Google Search Console.
- `/sitemap` is a readable site map page for visitors, linked from the footer.

## Run locally
```bash
# API
cd server
copy .env.example .env      # (Mac/Linux: cp)
# edit .env: set ADMIN_PASSWORD and SESSION_SECRET (long random text)
npm install
npm run dev

# Website (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```
Admin: http://localhost:5173/admin — sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD` from `.env`. The admin stays disabled until you replace the `change_me` placeholders.

## Deploy as one server
```bash
cd client && npm run build
cd ../server && npm install && npm start     # serves the site + API on PORT
```
Use HTTPS in production (the admin password travels in the login request). Set `CLIENT_URL` to your domain.

## Writing tips
Blank line = new paragraph · `## ` heading · `> ` quote. Poems keep your line breaks.

## Before launch
- Set the real contact email, social links and book details in the admin.
- Razorpay needs your own keys in `server/.env`; test with test keys first. Delivery address collection is handled in Razorpay settings.
- `db.json` is a simple file store, fine for a single author site. Move to a database if traffic grows.
- The hero sea background loads from Unsplash; replace with your own image if you prefer.
