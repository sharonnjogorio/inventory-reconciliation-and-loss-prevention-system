# Smart Loss Control (SLC)

> An AI-powered inventory reconciliation and loss prevention system for cooking oil retailers and distributors.

**Live App:** [https://smartlosscontrol.netlify.app](https://smartlosscontrol.netlify.app)

Built as a Women Techsters Capstone Project — Smart Loss Control helps small retail businesses track sales in real time, detect inventory shrinkage through automated spot checks, and maintain accurate stock records even in low-connectivity environments.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [User Roles](#user-roles)
- [Offline Support](#offline-support)
- [PWA Installation](#pwa-installation)

---

## Overview

Smart Loss Control is a Progressive Web App (PWA) with two distinct user experiences:

- **Owner** — Business analytics, inventory management, staff oversight, and alert monitoring from a desktop-friendly dashboard with a collapsible sidebar.
- **Staff** — A mobile-first point-of-sale (POS) interface for recording sales, performing bulk oil conversions, and completing AI-triggered stock spot checks.

The system is built for environments where internet connectivity may be unreliable. Sales and audit data are stored locally in IndexedDB and automatically synced to the backend when a connection is restored.

---

## Features

### Owner
- **Dashboard** — Health score, daily sales metrics, low-stock alerts, top-selling products, and quick actions
- **Inventory** — View all products with stock levels, identify low-stock items, and edit quantities inline
- **Add Stock** — Select from the product catalog and record incoming stock with a sticky form panel
- **Alerts** — Filterable list of inventory deviations with severity levels and estimated financial loss
- **Analytics** — Sales trends and inventory turnover charts (Recharts)
- **Staff Management** — Link new staff via QR code, view active and removed staff members
- **Sales Activity** — Paginated transaction history with date/staff/product filters
- **Settings** — Edit shop info and configure alert preferences

### Staff
- **POS Sales Dashboard** — Product grid with a slide-in cart drawer, session stats, and real-time totals
- **Bulk Decant** — Oil conversion tool for large-container to small-bottle operations
- **AI Quick Count** — Randomly triggered spot-check overlay that compares declared stock against physical counts and logs variances
- **Offline Sales** — Sales recorded offline are queued in IndexedDB and synced automatically when back online

### Authentication
- PIN-based login for owners and staff
- Phone number + OTP verification on owner registration
- QR code device-linking for staff onboarding
- 12-hour session expiry with PIN recovery flow

---

## Tech Stack

| Category | Library / Tool |
|---|---|
| UI Framework | React 19 |
| Routing | React Router 7 |
| State Management | Zustand |
| Build Tool | Vite 7 |
| Offline Storage | Dexie (IndexedDB) |
| HTTP Client | Axios |
| PWA / Service Worker | vite-plugin-pwa + Workbox |
| QR Code Scanning | html5-qrcode |
| QR Code Generation | qrcode |
| Charts | Recharts |
| Styling | CSS Modules |

**Backend API:** Hosted on Render — `https://smart-loss-control-backend.onrender.com`

---

## Project Structure

The codebase follows a **feature-based architecture**. Owner and staff functionality live in `src/features/` as self-contained modules with their own pages and components. Shared UI lives in `src/components/`.

```
src/
│
├── features/
│   ├── owner/
│   │   ├── pages/
│   │   │   ├── OwnerDashboard/       # Main dashboard with metrics & alerts
│   │   │   ├── OwnerLogin/           # PIN login
│   │   │   ├── OwnerCreatePin/       # PIN setup after registration
│   │   │   ├── OwnerForgetPin/       # PIN recovery
│   │   │   ├── Register/             # Shop registration form
│   │   │   ├── VerifyPhone/          # OTP verification
│   │   │   ├── Inventory/            # Stock overview + inline edit modal
│   │   │   ├── AddStock/             # Add new inventory via product tiles
│   │   │   ├── ProductCatalog/       # Full product catalog management
│   │   │   ├── Alerts/               # Inventory deviation alerts
│   │   │   ├── SalesActivity/        # Transaction history with filters
│   │   │   ├── AnalyticDashboard/    # Charts and sales trends
│   │   │   ├── ManageStaff/          # Staff list, linking, and removal
│   │   │   ├── StaffQRCode/          # Generate QR code for staff onboarding
│   │   │   └── Settings/             # Shop info and alert preferences
│   │   └── components/
│   │       ├── AlertCard/            # Individual alert display card
│   │       └── AlertDetailsModal/    # Alert detail popup
│   │
│   └── staff/
│       ├── pages/
│       │   ├── StaffLanding/         # Entry screen with options
│       │   ├── StaffPhone/           # Phone number entry
│       │   ├── StaffScan/            # QR scanner for device linking
│       │   ├── StaffPIN/             # PIN entry keypad
│       │   ├── DeviceLinked/         # Confirmation screen after QR scan
│       │   ├── SalesDashboard/       # POS interface with cart drawer
│       │   └── BulkDecant/           # Bulk oil conversion tool
│       └── components/
│           ├── PINKeypad/            # Reusable 4-digit PIN keypad
│           └── QuickCountOverlay/    # AI-triggered spot-check modal
│
├── pages/
│   └── LandingPage/                  # Public marketing landing page
│
├── components/
│   ├── navbar/                       # Owner sidebar + public navbar
│   ├── HeroSection/                  # Landing page hero section
│   ├── ScrollToTop.jsx               # Scroll reset on route change
│   ├── card/
│   │   ├── AnalyticCard/             # Chart + activity cards
│   │   ├── FeatureCard/              # Landing page feature highlight
│   │   ├── MetricCard/               # Dashboard metric display
│   │   └── ProductCard/              # Product display card
│   ├── common/
│   │   └── InstallPrompt/            # PWA install banner
│   └── ui/
│       ├── badge/                    # Status badge primitive
│       ├── button/                   # Button primitive
│       ├── card/                     # Card container primitive
│       ├── input/                    # Input field primitive
│       └── modal/                    # Modal primitive
│
├── context/
│   ├── CartContext.js                # Cart state context
│   └── CartProvider.jsx              # Cart context provider
│
├── store/
│   └── useAuthStore.js               # Zustand auth state (persisted)
│
├── services/
│   ├── api.js                        # Axios instance with base URL + auth headers
│   ├── db.js                         # Dexie IndexedDB schema
│   ├── index.js                      # Barrel export for all API modules
│   ├── offlineSync.js                # Offline queue management & sync logic
│   ├── quickCountTrigger.js          # AI spot-check trigger logic
│   └── endpoints/
│       ├── auth.js                   # Register, OTP, PIN, login
│       ├── inventory.js              # Stock CRUD
│       ├── sales.js                  # Record and fetch sales
│       ├── alerts.js                 # Alert retrieval
│       ├── audit.js                  # Audit log submission
│       ├── dashboard.js              # Dashboard summary data
│       ├── reports.js                # Report generation
│       ├── shops.js                  # Shop profile
│       ├── skus.js                   # Product SKU catalog
│       ├── ai.js                     # AI service integration
│       └── notifications.js          # Push notification endpoints
│
└── assets/
    ├── image/                        # Product images, logo, hero images
    └── icon/                         # SVG icon set
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone <repo-url>
cd "Capstone Project"
npm install
```

### Running the App

```bash
npm run dev
```

Opens at `http://localhost:5174`. The dev server is exposed on the local network (`--host`), useful for testing on a mobile device.

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=https://smart-loss-control-backend.onrender.com
```

All Vite environment variables must be prefixed with `VITE_` to be accessible in the client bundle.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server (port 5174) |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across all source files |

---

## User Roles

### Owner Flow
1. Register with full name, shop name, and phone number
2. Verify phone via 4-digit OTP
3. Create a 4-digit PIN
4. Log in at `/owner/login` and access the full dashboard

### Staff Flow
1. Navigate to the staff entry point at `/staff`
2. Scan the QR code provided by the owner to link the device
3. Enter phone number and 4-digit PIN
4. Access the POS sales dashboard at `/staff/sales`

---

## Offline Support

Smart Loss Control is built offline-first:

- **IndexedDB (Dexie)** stores inventory, pending sales, audit logs, and session data locally
- **Offline sales** are added to a `pending_sales` table and synced when connectivity returns
- **Auto-sync** runs every 30 seconds when online; a manual sync button is available on the staff dashboard
- **Service Worker (Workbox)** caches static assets and uses a NetworkFirst strategy (10-second timeout) for API calls, falling back to cache when offline
- The staff dashboard shows a real-time online/offline indicator and a pending-sync counter

---

## PWA Installation

Smart Loss Control can be installed as a native-like app on Android, iOS, and desktop:

- On mobile, tap **Add to Home Screen** from the browser menu or use the in-app install prompt
- App name: **Smart Loss Control** | Short name: **SLC**
- Theme colour: `#E29A5C`
