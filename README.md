# CreatorOS AI — Creator-Brand Collaboration Platform

A modern, full-stack operating system for creator-brand partnerships, structured campaign briefs, deliverable approvals, and invoice status tracking.

---

## Architecture & Monorepo Structure

```
├── client/                     # Frontend (React 18, Vite, TypeScript, Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # AppShell, Sidebar, TopBar, MobileNav
│   │   │   └── ui/             # Button, Input, Select, Textarea, Card, Badge, Modal,
│   │   │                       # Tabs, Table, Avatar, Skeleton, EmptyState, ThemeToggle
│   │   ├── context/            # ThemeContext (dark/light), ToastContext (notifications)
│   │   ├── pages/              # LandingPage, LoginPage, RegisterPage, DashboardPage, NotFound
│   │   ├── services/           # Type-safe API client (GET /api/health)
│   │   ├── lib/                # Class utilities (cn / clsx / tailwind-merge)
│   │   ├── styles/             # Tailwind directives & CSS variables
│   │   ├── App.tsx             # React Router routing & TanStack Query provider
│   │   └── main.tsx            # React application entry
│   ├── .env.example            # Client environment variables template
│   ├── tailwind.config.ts      # Custom brand palette, typography, shadows, dark mode
│   └── vite.config.ts          # Vite build configuration with API reverse proxy
│
├── server/                     # Backend API (Node.js, Express, TypeScript, Mongoose, Zod)
│   ├── src/
│   │   ├── config/             # Mongoose db connection, Zod-validated env config
│   │   ├── controllers/        # Health check controller
│   │   ├── middleware/         # Central error handler, Zod request validator
│   │   ├── models/             # User model schema (Phase 0 placeholder for Phase 1 auth)
│   │   ├── routes/             # Health routes & main API index
│   │   ├── services/           # System diagnostics and health status service
│   │   ├── utils/              # AppError operational errors class, structured logger
│   │   ├── app.ts              # Express application factory with CORS
│   │   └── server.ts           # Server bootstrap and graceful shutdown handler
│   ├── .env.example            # Server environment variables template
│   └── tsconfig.json           # Server TypeScript configuration
│
├── package.json                # Monorepo workspaces & concurrent script runner
├── .gitignore                  # Git ignore rules protecting .env and build files
├── .env.example                # Root environment reference
└── README.md                   # Quickstart and developer documentation
```

---

## Tech Stack

### Client
- **Framework:** React 18 + Vite + TypeScript
- **Styling & Design System:** Tailwind CSS with custom palette (Violet `brand`, Coral `accent`, Slate `surface`), dark mode support (`class`), and consistent radius/shadow tokens
- **Typography:** Plus Jakarta Sans & Inter
- **Routing:** React Router DOM (v6)
- **Data Fetching:** TanStack Query (`@tanstack/react-query`)
- **Icons:** Lucide React (`lucide-react`)
- **Utilities:** `clsx`, `tailwind-merge`

### Server
- **Runtime:** Node.js (v18+) + Express + TypeScript
- **Database:** MongoDB with Mongoose ODM (gracefully handles offline DB with degraded status)
- **Validation:** Zod schema validation
- **Dev Runner:** `tsx` for fast TypeScript compilation and hot-reloading
- **Error Handling:** Central operational error handling (`AppError`), Mongoose error translation, Zod error normalization

---

## Quickstart

### Prerequisites
- Node.js `v18.x` or higher (`v24.x` tested)
- npm `v9.x` or higher (`v12.x` tested)
- MongoDB (optional for Phase 0; server boots and serves health metrics even if DB is offline)

### 1. Install Dependencies

You can install all dependencies from the root monorepo or individually:

```bash
# From the root directory:
npm run install:all
```

Or install separately:
```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Configure Environment Variables

Both apps include `.env.example` templates. Default development values are pre-configured:

```bash
# Server environment (.env)
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/creatoros
JWT_SECRET=super_secret_creatoros_development_jwt_key_32bytes
JWT_EXPIRES_IN=7d

# Client environment (.env)
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Run Development Servers

#### Option A: Run Both Simultaneously (Recommended)
From the root directory:
```bash
npm run dev
```
This runs the Express API server on `http://localhost:5000` and the Vite client on `http://localhost:5173` concurrently.

#### Option B: Run Individually
In separate terminal tabs:

**Terminal 1 (Server):**
```bash
cd server
npm run dev
```

**Terminal 2 (Client):**
```bash
cd client
npm run dev
```

---

## Available Endpoints & Routes

### Backend API
- `GET /` — API identification and status
- `GET /api/health` — Detailed health check (returns status, uptime, database connection state, heap memory usage)

### Frontend Application
- `/` — Production-grade SaaS Landing Page (Hero, Features, Workflow, Role tabs, AI Tools, Footer)
- `/login` — Sign in placeholder with design system inputs
- `/register` — Workspace registration with role selector (Creator, Brand, Freelancer, Agency)
- `/dashboard` — App shell with collapsible sidebar, top bar, dark mode toggle, live backend health badge, interactive modal, metric cards, deliverables table, and toast notification tester

---

## Building for Production

To compile and produce production bundles:

```bash
# From root
npm run build

# Or individually
cd server && npm run build
cd client && npm run build
```

---

## Phase 0 Foundation Deliverables Check

- [x] Monorepo scaffold (`/client` and `/server`)
- [x] Express app with `GET /api/health`, central error handler, CORS, Mongoose connection, and modular structure
- [x] Distinctive brand palette (deep violet + warm coral accent, not default blue)
- [x] Dark mode support with persistent toggle and system preference detection
- [x] 13 Reusable UI components: Button, Input, Select, Textarea, Card, Badge, Modal, Tabs, Table, Avatar, Skeleton loader, EmptyState, Toast
- [x] Responsive App Shell with collapsible sidebar, top bar, and mobile navigation drawer
- [x] Authentic SaaS landing page with zero lorem ipsum and zero fake statistics/testimonials
- [x] Secrets segregated in `.env` and `.env.example` with `.env` in `.gitignore`
- [x] Clean TypeScript builds (`tsc`) without any compiler or lint errors

