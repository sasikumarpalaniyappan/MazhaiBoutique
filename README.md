# Mazhai Boutique

Mazhai Boutique is a Next.js storefront with product browsing, cart, wishlist, checkout, auth, and an admin dashboard.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Firebase Setup

Local development uses public Firebase variables from [.env.local](.env.local). The project also supports Netlify build-time environment variables through [netlify.toml](netlify.toml).

Required variables:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## Deployment

The app is configured for Netlify with the Next.js plugin. Build with `npm run build` and publish the `.next` output.
