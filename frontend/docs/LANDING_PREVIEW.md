# HYRE Landing — Visual Preview Guide

Branch: `feature/next-gen-landing`

## Run locally

From repository root:

```bash
git checkout feature/next-gen-landing
npm install
cd frontend && npm install && cd ..
npm run dev
```

Or frontend only:

```bash
cd frontend
npm install
npm run dev
```

Open: **http://localhost:3000**

## Routes

| URL | Content |
|-----|---------|
| `/` | Marketing landing (this redesign) |
| `/login` | Auth (middleware public route) |
| `/register` | Sign up (middleware public route) |

## Capture screenshots

```bash
cd frontend
npm run dev   # in another terminal
node ../scripts/capture-landing.mjs
```

Output: `artifacts/screenshots/`

## Sections checklist

- [x] Navbar (sticky blur)
- [x] Hero (parallax mockup)
- [x] Trust strip
- [x] Features (bento)
- [x] How it works (timeline)
- [x] Product preview (dashboard)
- [x] Testimonials
- [x] Pricing
- [x] Final CTA
- [x] Footer

## Do not merge

Review this branch via PR preview before merging into `dev`.
