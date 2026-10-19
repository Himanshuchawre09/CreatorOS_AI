# CreatorOS AI — Creator-Brand Collaboration Platform

A full-stack, enterprise-grade operating system designed for creator-brand partnerships. CreatorOS AI streamlines the end-to-end collaboration lifecycle: structured campaign briefs, discovery, collaboration proposals, legal agreements, Kanban workspace execution, secure content deliverable review, invoice status tracking, self-reported performance analytics, and Gemini-powered creator intelligence.

---

## Architecture & Monorepo Structure

```
├── client/                     # Frontend (React 18, Vite, TypeScript, Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # ProtectedRoute, PublicOnlyRoute, RoleRoute
│   │   │   ├── collaboration/  # SendRequestModal
│   │   │   ├── common/         # ErrorBoundary (accessible crash fallback)
│   │   │   ├── layout/         # AppShell, Sidebar, TopBar, MobileNav, navigation config
│   │   │   ├── profile/        # PortfolioManager (CRUD media items)
│   │   │   └── ui/             # Button, Input, Select, Textarea, Card, Badge, Modal,
│   │   │                       # Tabs, Table, Avatar, Skeleton, EmptyState, ThemeToggle
│   │   ├── context/            # AuthContext, RoleContext, ThemeContext, ToastContext
│   │   ├── pages/              # 26 page components (Dashboard, Campaigns, Contracts, Tasks,
│   │   │                       # ContentReview, Invoices, Calendar, Analytics, Reviews,
│   │   │                       # AiAssistant, Admin, Discover, Profile, etc.)
│   │   ├── services/           # Type-safe API client with fetcher utilities
│   │   ├── lib/                # Class utilities (cn / clsx / tailwind-merge)
│   │   ├── styles/             # Tailwind directives & CSS variables
│   │   ├── App.tsx             # React Router routing & TanStack Query provider
│   │   └── main.tsx            # React application entry
│   ├── .env.example            # Client environment variables template
│   ├── tailwind.config.ts      # Custom brand palette, typography, shadows, dark mode
│   └── vite.config.ts          # Vite build configuration with reverse proxy
│
├── server/                     # Backend API (Node.js, Express, TypeScript, Mongoose, Zod)
│   ├── src/
│   │   ├── config/             # Mongoose db connection, Zod-validated env config
│   │   ├── controllers/        # Health, Auth, Profiles, Campaigns, Requests, Contracts,
│   │   │                       # Tasks, Submissions, Notifications, Messages, Invoices,
│   │   │                       # Calendar, Analytics, Reviews, AI, and Admin controllers
│   │   ├── middleware/         # Authenticate (JWT cookie), Authorize (roles), RateLimiter,
│   │   │                       # Central error handler, Zod request validator
│   │   ├── models/             # 16 Mongoose models & schemas
│   │   ├── routes/             # Express API routes
│   │   ├── scripts/            # seedAdmin.ts, seedDemo.ts (guarded seed utilities)
│   │   ├── services/           # ai.service.ts (Gemini + MockProvider), health service
│   │   ├── utils/              # AppError operational errors class, structured logger
│   │   ├── app.ts              # Express application factory with Helmet & CORS
│   │   └── server.ts           # Server bootstrap and graceful shutdown handler
│   ├── tests/                  # 12 Vitest integration test suites with Supertest & mongodb-memory-server
│   ├── .env.example            # Server environment variables template
│   └── tsconfig.json           # Server TypeScript configuration
│
├── testing/                    # Test evidence, scenario matrix & Postman collections
├── package.json                # Monorepo workspaces & concurrent script runner
├── .gitattributes              # Consistent LF line-ending normalization
├── .gitignore                  # Git ignore rules protecting .env and build files
├── PROGRESS.md                 # Granular phase-by-phase implementation checklist
└── README.md                   # Full system documentation and operational guide
```

---

## Tech Stack

### Client
- **Framework:** React 18 + Vite + TypeScript
- **Styling & Design System:** Tailwind CSS with custom palette (Violet `brand`, Coral `accent`, Slate `surface`), accessible light/dark mode support, responsive mobile navigation (390px+ width verified)
- **Data Fetching:** TanStack Query (`@tanstack/react-query`) with stale-while-revalidate caching
- **Visualization:** Recharts (`recharts` + `react-is`) for self-reported campaign performance analytics
- **Icons:** Lucide React (`lucide-react`)
- **Error Handling:** React `ErrorBoundary` with reset mechanism and accessible fallback UI

### Server
- **Runtime:** Node.js (v18+) + Express + TypeScript
- **Database:** MongoDB with Mongoose ODM (offline-tolerant boot)
- **Validation:** Zod schema validation for all request bodies (`.strict()`) and query parameters
- **Authentication:** JWT stored in httpOnly, SameSite=Lax, Secure cookies; bcrypt (cost factor 12)
- **Security:** Helmet headers, CORS credentials protection, strict rate limiting on authentication routes
- **File Uploads:** Multer with disk storage outside web root, file signature (magic byte) verification, and authenticated participant-only streaming endpoint
- **AI Engine:** Google Gemini API (`@google/generative-ai`) with deterministic MockProvider fallback
- **Testing:** Vitest + Supertest + `mongodb-memory-server` (126+ automated tests)

---

## Quickstart

### Prerequisites
- Node.js `v18.x` or higher (`v24.x` verified)
- npm `v9.x` or higher
- MongoDB instance (local or MongoDB Atlas connection string)

### 1. Install Dependencies
From the repository root:
```bash
npm run install:all
```
Or install separately:
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment Variables

Create `.env` in `/server` and `/client` based on the respective `.env.example` templates:

#### Server (`server/.env`)
```bash
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/creatoros
JWT_SECRET=super_secret_creatoros_development_jwt_key_32bytes_min
JWT_EXPIRES_IN=7d

# Optional: Google Gemini AI API key (MockProvider is used automatically if omitted)
GEMINI_API_KEY=

# Seed Scripts Configuration
ADMIN_EMAIL=admin@creatoros.internal
ADMIN_PASSWORD=AdminSecurePass123!
DEMO_PASSWORD=DemoPassword123!
```

#### Client (`client/.env`)
```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Database Seeding (Optional)
Seed an initial administrative account and rich sample workspace demo data:
```bash
cd server

# Create or verify the admin user (never prints passwords)
npm run seed:admin

# Populate demo creators, brands, campaigns, contracts, and collaboration workflows
npm run seed:demo
```
> **Security Guard:** `seed:demo` is strictly blocked in production environments (`NODE_ENV=production`) and requires `DEMO_PASSWORD` to be explicitly defined.

### 4. Run Development Servers
From the root directory:
```bash
npm run dev
```
- Client runs on `http://localhost:5173`
- Server API runs on `http://localhost:5000`

---

## Available Scripts

| Command | Working Directory | Description |
|---|---|---|
| `npm run dev` | Root | Concurrently runs backend API and frontend Vite server |
| `npm run build` | Root | Compiles TypeScript and builds production bundles for both client and server |
| `npm test` | Root / `server` | Runs all 12 Vitest backend test suites with Supertest and in-memory MongoDB |
| `npm run test:coverage` | `server` | Generates detailed code coverage reports with Vitest |
| `npm run seed:admin` | `server` | Seeds initial admin account from `ADMIN_EMAIL` and `ADMIN_PASSWORD` |
| `npm run seed:demo` | `server` | Seeds realistic demo accounts, campaigns, contracts, and deliverables |

---

## Feature Status Table

| Area / Module | Feature Description | Status | Implementation Details |
|---|---|---|---|
| **0. Auth & Authorization** | Cookie-based JWT auth, bcrypt cost 12, role-based middleware (`creator`, `brand`, `freelancer`, `talentManager`, `admin`), suspended status check | **Implemented** | Authenticate & authorize middleware, strict rate limiting, 403 on suspended, SameSite=Lax cookie |
| **1. Profiles & Discovery** | Multi-role profiles, creator discovery with search & filter, portfolio item CRUD, "self-reported" metrics | **Implemented** | Text search index, follower/engagement filters, sanitization, owner-only edits |
| **2. Campaigns** | Brand campaign management (title, brief, goals, deliverables, budget, deadline, legal status machine) | **Implemented** | Brand CRUD, public open campaigns for creators, status validation |
| **3. Collaboration Requests** | Two-way requests: Brand to Creator invitation, Creator to Open Campaign application | **Implemented** | Strict state machine (`pending` -> `accepted` \| `rejected` \| `withdrawn`), duplicate prevention |
| **4. Contracts** | Auto-generated legal agreement upon request acceptance, dual-signature flow, legal disclaimer | **Implemented** | Dual-signing flow (`draft` -> `sent` -> `signed`), "Simple agreement record, not legal advice" footer |
| **5. Tasks & Workspace** | Kanban board per collaboration (`todo`, `doing`, `review`, `done`), assignee management | **Implemented** | Participant-guarded routes, drag/reorder support, real-time board updates |
| **6. Content Review** | File submission with magic-byte verification, private streaming route, revision feedback loop | **Implemented** | 25MB cap, random disk filenames, non-public streaming endpoint, version history |
| **7. Notifications & Messages** | Event-driven notification dropdown with unread badge; 10s polling chat per collaboration | **Implemented** | Participant-only chat thread, 1,000 char cap, read/unread states, zero websockets |
| **8. Invoices & Payments** | Invoice status tracking (`draft`, `sent`, `paid`, `overdue`), issuer marking, tracking label | **Implemented** | "Tracking only; no payments are processed here" disclaimer, auto notification triggers |
| **9. Calendar, Analytics, Reviews** | Content calendar CRUD, self-reported KPI entry (views, reach, clicks, engagement), 1-5 star mutual reviews | **Implemented** | Recharts bar charts, single review per collaboration participant, average ratings |
| **10. AI Assistant** | 5 Gemini tools (recommendations, price estimates, pitch emails, analytics summary, content plan) | **Implemented** | Server-side Gemini API with MockProvider fallback, 10s timeout, "Demo mode" indicator |
| **11. Role Dashboards & Admin** | Dedicated dashboards for all 4 roles; Admin panel (user search, suspend/reactivate, hide profiles) | **Implemented** | 100% real DB data, zero fake stats, admin-only routes with `authorize('admin')` |
| **12. Resilience & Testing** | React ErrorBoundary, accessible 404 page, 126+ automated Vitest tests, Postman collection | **Implemented** | Strict Zod validation, operator injection prevention, complete test evidence |

---

## Security & Architectural Principles

1. **Backend Role & Ownership Enforcement:**
   - Client-side navigation guards provide user experience convenience only; every single API endpoint independently validates identity via `authenticate` and verifies roles/ownership via `authorize`.
   - Suspended accounts are immediately rejected with HTTP 403 on all protected endpoints.

2. **Strict Input Sanitization & Injection Defense:**
   - Every request body is validated using Zod schemas with `.strict()`, rejecting unannounced fields (`user`, `_id`, `role`, etc.).
   - Query parameters are explicitly coerced to primitives, blocking MongoDB operator injection attacks such as `?q[$ne]=test` (returns HTTP 400).
   - Regex search terms are escaped to prevent catastrophic backtracking or arbitrary expression execution.

3. **Secure File Storage & Private Delivery:**
   - File uploads are validated by content magic numbers (file signature header analysis), not just client-supplied MIME types or extensions.
   - Files are stored in an unexposed `uploads/` directory on disk using cryptographically secure random names.
   - Files are served exclusively through authenticated, role-authorized streaming routes (`GET /api/submissions/:id/file`) verifying collaboration participation.

4. **Production Stack Safety:**
   - The central Express error handler hides stack traces in test and production environments (`NODE_ENV !== 'development'`), providing sanitized error messages.
   - Passwords and sensitive secrets are never logged in console output, returned in API payloads, or committed to version control.

5. **Honest Platform Boundaries:**
   - **No Financial Escrow:** Payment functionality provides invoice status tracking only.
   - **No Legal Verification Claims:** Agreement contracts and AI drafts display transparent disclaimers: *"Simple agreement record, not legal advice."*
   - **Self-Reported Metrics:** All audience follower counts and campaign reach numbers are explicitly designated as self-reported data.

---

## Known Limitations

- **Mock AI Mode:** When a valid `GEMINI_API_KEY` is not present in the server environment, the AI Assistant operates via a deterministic, in-memory `MockProvider` (highlighted by an honest "Demo Mode" badge in the UI).
- **Polling vs WebSockets:** Real-time messaging and notifications utilize lightweight 10-second polling rather than persistent WebSocket connections, ensuring compatibility with standard serverless and containerized deployments without persistent socket overhead.
- **Self-Reported Analytics:** Performance metrics (views, reach, clicks, engagement) are manually logged by creators rather than synchronized via live third-party platform OAuth APIs (YouTube Data API, Meta Graph API).
- **Payment Processing:** CreatorOS tracks invoice statuses (`draft`, `sent`, `paid`, `overdue`) for project accounting; it does not process live credit card transactions, ACH payouts, or hold funds in escrow.
