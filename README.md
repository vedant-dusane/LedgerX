# LedgerX — Personal Finance Ledger

A full-stack personal finance management app with Redis backend, React frontend, and one-click Vercel deployment.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- An [Upstash](https://upstash.com) account (free tier is enough)

### Step 1 — Clone & Install

```bash
cd ledgerx
npm install
```

### Step 2 — Set up Upstash Redis (replaces local Redis)

> **You do NOT need to install Redis locally.** This app uses Upstash — a serverless Redis service that works over HTTP. It has a generous free tier.

1. Go to [https://upstash.com](https://upstash.com) and create a free account
2. Click **Create Database**
3. Choose a name (e.g. `ledgerx`), select a region close to you, click Create
4. In the database dashboard, copy:
   - **REST URL** (looks like `https://xxxxx.upstash.io`)
   - **REST Token** (a long string starting with `AX...`)

### Step 3 — Configure Environment

Edit the `.env.local` file in the project root:

```env
UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
JWT_SECRET=any-long-random-string-you-make-up
```

> For `JWT_SECRET`, just type any long random string like `myapp_super_secret_key_2024_random_xyz`

### Step 4 — Run the App

You need **two terminals**:

**Terminal 1 — API server:**
```bash
npm run dev:api
```
This starts the backend at `http://localhost:3001`

**Terminal 2 — Frontend:**
```bash
npm run dev
```
This starts the frontend at `http://localhost:5173`

Open `http://localhost:5173` in your browser. Register an account and start using the app!

---

## ☁️ Deploy to Vercel (Production)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial LedgerX"
git remote add origin https://github.com/YOUR_USER/ledgerx.git
git push -u origin main
```

### Step 2 — Import to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repository
3. Vercel auto-detects it as a Vite project — no config needed

### Step 3 — Add Upstash Integration
1. In Vercel dashboard → your project → **Integrations**
2. Search for **Upstash** and click Connect
3. Select your Upstash database
4. Vercel automatically injects `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

### Step 4 — Add JWT Secret
In Vercel → Settings → Environment Variables, add:
```
JWT_SECRET = your_long_random_secret_string
```

### Step 5 — Deploy
Click **Deploy** — your app will be live at `https://your-project.vercel.app`

---

## 📁 Project Structure

```
ledgerx/
├── api/                          # Vercel Serverless Functions (Node.js)
│   ├── _redis.js                 # Upstash Redis client singleton
│   ├── _auth.js                  # JWT verification helper
│   ├── auth/
│   │   ├── register.js           # POST /api/auth/register
│   │   ├── login.js              # POST /api/auth/login
│   │   └── me.js                 # GET /api/auth/me
│   ├── expenses/
│   │   └── index.js              # GET/POST/DELETE /api/expenses
│   ├── savings/
│   │   └── index.js              # GET/POST/PUT/DELETE /api/savings
│   ├── ledger/
│   │   └── index.js              # GET/POST/PUT/DELETE /api/ledger
│   ├── people/
│   │   └── index.js              # GET/POST/DELETE /api/people
│   └── reports/
│       └── summary.js            # GET /api/reports/summary
│
├── src/                          # React Frontend
│   ├── main.jsx                  # Entry point
│   ├── App.jsx                   # Router + Auth guards
│   ├── index.css                 # Global design system
│   ├── context/
│   │   └── AuthContext.jsx       # Global auth state
│   ├── lib/
│   │   └── api.js                # API client (all fetch calls)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx        # App shell (sidebar + navbar)
│   │   │   └── Layout.css
│   │   └── ui/
│   │       ├── UI.jsx            # Reusable components (Button, Modal, Card...)
│   │       └── UI.css
│   └── pages/
│       ├── LoginPage.jsx
│       ├── RegisterPage.jsx
│       ├── AuthPage.css
│       ├── Dashboard.jsx         # Overview + charts
│       ├── Dashboard.css
│       ├── ExpensesPage.jsx      # Expense tracking
│       ├── SavingsPage.jsx       # Savings goals
│       ├── LedgerPage.jsx        # Lend/borrow tracking
│       ├── PeoplePage.jsx        # Contact management
│       ├── ReportsPage.jsx       # Analytics & charts
│       ├── Reports.css
│       └── ListPage.css          # Shared page styles
│
├── public/
│   └── favicon.svg
├── dev-server.js                 # Local Express server (mirrors Vercel)
├── vite.config.js                # Vite + API proxy
├── vercel.json                   # Vercel routing config
├── .env.local                    # Local environment variables (DO NOT COMMIT)
├── .env.example                  # Template for environment variables
└── package.json
```

---

## 🗄️ Redis Data Schema

All data is stored per-user using prefixed keys:

| Key Pattern | Type | Contents |
|---|---|---|
| `user:{id}` | String (JSON) | User profile (name, email, hashed password, currency) |
| `user:email:{email}` | String | Maps email → user ID for login lookup |
| `user:{id}:expenses:{YYYY-MM}` | String (JSON Array) | Monthly expense entries |
| `user:{id}:savings` | String (JSON Array) | All savings goals |
| `user:{id}:ledger` | String (JSON Array) | All lend/borrow records |
| `user:{id}:people` | String (JSON Array) | Contact list |

### Example: Expense Entry
```json
{
  "id": "uuid-v4",
  "amount": 450.00,
  "category": "Food & Dining",
  "description": "Dinner at Barbeque Nation",
  "date": "2024-12-15",
  "isRecurring": false,
  "createdAt": "2024-12-15T18:30:00.000Z"
}
```

### Example: Ledger Entry
```json
{
  "id": "uuid-v4",
  "type": "lent",
  "personName": "Ravi Kumar",
  "amount": 5000,
  "description": "Helped with rent",
  "date": "2024-12-01",
  "dueDate": "2024-12-31",
  "status": "pending",
  "createdAt": "2024-12-01T10:00:00.000Z"
}
```

---

## 🔌 API Reference

All protected routes require `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT token |
| GET | `/api/auth/me` | Get current user profile |

### Expenses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/expenses?month=YYYY-MM` | List expenses for a month |
| GET | `/api/expenses` | List all expenses |
| POST | `/api/expenses` | Create expense |
| DELETE | `/api/expenses?id=X&month=YYYY-MM` | Delete expense |

### Savings
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/savings` | List all goals |
| POST | `/api/savings` | Create goal |
| PUT | `/api/savings` | Update goal amount |
| DELETE | `/api/savings?id=X` | Delete goal |

### Ledger
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/ledger` | List all entries |
| POST | `/api/ledger` | Create entry |
| PUT | `/api/ledger` | Settle entry (update status) |
| DELETE | `/api/ledger?id=X` | Delete entry |

### People
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/people` | List contacts |
| POST | `/api/people` | Add contact |
| DELETE | `/api/people?id=X` | Remove contact |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/summary` | Dashboard summary with charts data |

---

## ✨ Features

- **Dashboard** — Net position banner, stat cards, spending trends, category pie chart, quick actions
- **Expenses** — Add/delete expenses by category, filter by month and category, category breakdown sidebar
- **Savings Goals** — Create goals with icons and target dates, track progress with visual bars
- **Ledger** — Track lends and borrows, mark overdue entries, settle with one click
- **People** — Contact book with balance summary per person
- **Reports** — Bar chart, pie chart, cumulative area chart, full category table
- **Authentication** — JWT-based, 7-day sessions
- **Multi-currency** — INR, USD, EUR, GBP, AED
- **Responsive** — Works on mobile (collapsible sidebar)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Recharts, Lucide Icons |
| Styling | Pure CSS with CSS variables (no Tailwind) |
| Backend | Node.js Serverless Functions (Vercel) |
| Database | Upstash Redis (HTTP-based, serverless-compatible) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Build | Vite 5 |
| Deployment | Vercel |

