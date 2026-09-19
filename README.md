# LedgerX

**A simple, full-stack personal finance ledger for tracking everyday spending, savings, and money you lend or borrow.**

LedgerX is a personal finance management application built with React, Node.js, and Upstash Redis. It brings everyday financial tracking into one place without trying to turn a simple ledger into an overly complicated financial platform.

You can record expenses, create savings goals, keep track of money lent or borrowed, manage people connected to your transactions, and view reports that help you understand where your money is going.

The application is designed to run locally during development and can be deployed to Vercel with Upstash Redis as the backend datastore.

---

## Features

### Dashboard

A quick overview of your financial activity, including:

* Current net position
* Total income and expenses tracked by the application
* Savings progress
* Lending and borrowing balances
* Spending trends
* Category-wise spending breakdown
* Quick actions for common tasks

### Expense Tracking

Keep a record of everyday expenses with:

* Amount
* Category
* Description
* Date
* Recurring expense status
* Monthly filtering
* Category filtering

Expenses are organized by month to keep queries and reporting straightforward.

### Savings Goals

Create and track savings goals with:

* Target amount
* Current saved amount
* Target date
* Goal category/icon
* Visual progress tracking

Savings goals can be updated as you make progress towards them.

### Lending & Borrowing Ledger

Keep track of money you have lent to or borrowed from other people.

Each record can include:

* Person
* Amount
* Description
* Date
* Due date
* Status

Entries can be marked as settled once the transaction is completed, while overdue entries are highlighted for easier follow-up.

### People

Maintain a simple list of people associated with your financial records and view their overall balance.

### Reports

Understand your spending through visual reports including:

* Spending trends
* Category breakdowns
* Cumulative spending
* Category-wise totals

### Authentication

LedgerX uses JWT-based authentication with password hashing through `bcryptjs`.

Each user's financial data is isolated using user-specific Redis keys.

### Multi-Currency Support

The application currently supports:

* INR
* USD
* EUR
* GBP
* AED

### Responsive Interface

The frontend is designed to work across desktop and mobile screen sizes, with a collapsible navigation sidebar for smaller screens.

---

## Tech Stack

LedgerX keeps the stack relatively small and uses technologies that work well together.

| Area           | Technology                                                  |
| -------------- | ----------------------------------------------------------- |
| Frontend       | React 18                                                    |
| Routing        | React Router 6                                              |
| Charts         | Recharts                                                    |
| Icons          | Lucide React                                                |
| Styling        | CSS / CSS Variables                                         |
| Backend        | Node.js                                                     |
| API            | Express locally / Vercel Serverless Functions in production |
| Database       | Upstash Redis                                               |
| Authentication | JWT + bcryptjs                                              |
| Build Tool     | Vite 5                                                      |
| Deployment     | Vercel                                                      |

---

## Architecture

At a high level, LedgerX follows a simple frontend → API → database architecture.

```text
┌──────────────────────┐
│      React App       │
│   Vite + React 18    │
└──────────┬───────────┘
           │
           │ HTTP / JSON
           ▼
┌──────────────────────┐
│      API Layer       │
│ Node.js / Serverless │
│ Functions on Vercel  │
└──────────┬───────────┘
           │
           │ REST
           ▼
┌──────────────────────┐
│     Upstash Redis    │
│  User-scoped data    │
└──────────────────────┘
```

Authentication is handled at the API layer. Protected requests include a JWT in the `Authorization` header, and the API uses the authenticated user's ID when accessing financial data.

This keeps users isolated from one another while allowing the application to remain lightweight.

---

## Project Structure

```text
ledgerx/
│
├── api/
│   ├── _auth.js
│   ├── _redis.js
│   │
│   ├── auth/
│   │   ├── login.js
│   │   ├── me.js
│   │   └── register.js
│   │
│   ├── expenses/
│   │   └── index.js
│   │
│   ├── savings/
│   │   └── index.js
│   │
│   ├── ledger/
│   │   └── index.js
│   │
│   ├── people/
│   │   └── index.js
│   │
│   └── reports/
│       └── summary.js
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── lib/
│   │   └── api.js
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ExpensesPage.jsx
│   │   ├── SavingsPage.jsx
│   │   ├── LedgerPage.jsx
│   │   ├── PeoplePage.jsx
│   │   └── ReportsPage.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── public/
├── dev-server.js
├── vite.config.js
├── vercel.json
├── package.json
├── .env.example
└── README.md
```

### A quick guide to the important directories

**`src/pages/`**
Contains the main application screens.

**`src/components/`**
Reusable UI and layout components.

**`src/context/`**
Global React state such as authentication.

**`src/lib/`**
Shared application utilities, including the API client.

**`api/`**
Backend API endpoints. These become serverless functions when deployed through Vercel.

**`dev-server.js`**
Provides the local API server used during development.

---

# Getting Started

## Prerequisites

Before running LedgerX locally, make sure you have:

* Node.js 18 or later
* npm
* An Upstash Redis database

You do **not** need to install Redis locally. LedgerX communicates with Upstash Redis through its REST API.

---

## 1. Clone the repository

```bash
git clone https://github.com/<your-username>/ledgerx.git
cd ledgerx
```

Install dependencies:

```bash
npm install
```

---

## 2. Create an Upstash Redis database

Create a Redis database through Upstash and obtain its REST credentials.

You will need:

```text
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

Keep the token private. It should never be committed to the repository.

---

## 3. Configure environment variables

Create a `.env.local` file in the project root.

```env
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
JWT_SECRET=your-long-random-secret
```

You can use `.env.example` as the starting point for your local configuration.

### Environment variables

| Variable                   | Purpose                                   |
| -------------------------- | ----------------------------------------- |
| `UPSTASH_REDIS_REST_URL`   | Upstash Redis REST endpoint               |
| `UPSTASH_REDIS_REST_TOKEN` | Authentication token for Redis            |
| `JWT_SECRET`               | Secret used to sign authentication tokens |

Never commit `.env.local` or any file containing real credentials.

---

## 4. Start the development servers

LedgerX currently uses separate processes for the frontend and local API.

### Terminal 1 — API

```bash
npm run dev:api
```

The local API will run on:

```text
http://localhost:3001
```

### Terminal 2 — Frontend

```bash
npm run dev
```

The Vite development server will run on:

```text
http://localhost:5173
```

Open the frontend in your browser:

```text
http://localhost:5173
```

You can now create an account and start using LedgerX.

---

# Production Deployment

LedgerX is designed to deploy to Vercel with Upstash Redis.

## 1. Push the project to GitHub

```bash
git init
git add .
git commit -m "Initial LedgerX setup"
git branch -M main
git remote add origin https://github.com/<your-username>/ledgerx.git
git push -u origin main
```

## 2. Import the repository into Vercel

Create a new project in Vercel and import the GitHub repository.

Vercel should detect the Vite-based project automatically.

## 3. Configure Upstash

Connect your Upstash database through the project's environment/integration configuration.

The application requires:

```text
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

## 4. Add the JWT secret

Add the following environment variable in Vercel:

```text
JWT_SECRET
```

Use a strong, randomly generated secret in production.

## 5. Deploy

Once the environment variables are configured, deploy the project.

Vercel will build the frontend and expose the API routes as serverless functions.

---

# Data Model

LedgerX stores data in Redis using user-scoped keys.

The general structure is:

```text
user:{id}
user:email:{email}

user:{id}:expenses:{YYYY-MM}
user:{id}:savings
user:{id}:ledger
user:{id}:people
```

This structure keeps each user's records separated and also allows expenses to be queried by month.

For example:

```text
user:123:expenses:2026-09
```

contains the expenses recorded by user `123` during September 2026.

### Expense

```json
{
  "id": "uuid",
  "amount": 450,
  "category": "Food & Dining",
  "description": "Dinner",
  "date": "2026-09-15",
  "isRecurring": false,
  "createdAt": "2026-09-15T18:30:00.000Z"
}
```

### Ledger Entry

```json
{
  "id": "uuid",
  "type": "lent",
  "personName": "Ravi Kumar",
  "amount": 5000,
  "description": "Rent",
  "date": "2026-09-01",
  "dueDate": "2026-09-30",
  "status": "pending",
  "createdAt": "2026-09-01T10:00:00.000Z"
}
```

---

# API Overview

The frontend communicates with the backend through REST endpoints.

Protected endpoints require:

```http
Authorization: Bearer <token>
```

| Resource       | Endpoint               | Operations                    |
| -------------- | ---------------------- | ----------------------------- |
| Authentication | `/api/auth/*`          | Register, login, current user |
| Expenses       | `/api/expenses`        | List, create, delete          |
| Savings        | `/api/savings`         | List, create, update, delete  |
| Ledger         | `/api/ledger`          | List, create, update, delete  |
| People         | `/api/people`          | List, create, delete          |
| Reports        | `/api/reports/summary` | Financial summary             |

For implementation details, request validation, and response formats, refer to the corresponding files under `api/`.

---

# Development Notes

### Frontend

Most application UI lives under:

```text
src/
```

Pages should generally handle page-level composition, while reusable UI should live under:

```text
src/components/
```

API calls are centralized through:

```text
src/lib/api.js
```

This keeps request handling out of individual components where possible.

### Backend

Backend endpoints are organized by resource:

```text
api/
├── auth/
├── expenses/
├── savings/
├── ledger/
├── people/
└── reports/
```

Shared Redis and authentication functionality lives in:

```text
api/_redis.js
api/_auth.js
```

---

# Security

LedgerX handles personal financial information, so environment configuration and authentication secrets should be treated carefully.

A few important rules:

* Never commit `.env.local`.
* Never expose `UPSTASH_REDIS_REST_TOKEN` to the frontend.
* Use a strong `JWT_SECRET` in production.
* Do not hard-code credentials in source files.
* Keep authentication checks on the server.
* Validate and authorize API requests before accessing user data.

LedgerX is a personal finance tracking application and is **not intended to provide financial, investment, tax, or legal advice**.

---

# Contributing

Contributions are welcome.

If you want to work on LedgerX:

1. Fork the repository.
2. Create a branch for your change.

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Test the application locally.
5. Commit your changes with a clear message.

```bash
git commit -m "Add expense category filtering"
```

6. Push the branch.

```bash
git push origin feature/your-feature
```

7. Open a pull request with a short explanation of what changed and why.

For larger changes, it is useful to open an issue first so the approach can be discussed before implementation.

---

# Common Issues

### The frontend loads but API requests fail

Make sure the API server is running:

```bash
npm run dev:api
```

Also check that your `.env.local` contains valid Upstash credentials.

### Redis requests are failing

Verify:

```text
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

and make sure the Upstash database is active.

### Authentication is not working

Check that `JWT_SECRET` is present in the environment used by the API.

If you change the secret while testing locally, existing JWTs will no longer be valid and you may need to log in again.

---

# Scripts

The main development commands are:

```bash
npm install
npm run dev
npm run dev:api
```

Check `package.json` for the complete list of available scripts.

---

# Roadmap

Some areas that can be explored as LedgerX evolves:

* Recurring expense automation
* Better transaction search and filtering
* Import/export of financial data
* More detailed financial reports
* Budget planning
* Improved mobile experience
* Notifications and reminders
* Additional currency support
* Automated testing
* More granular API validation and error handling

The roadmap is intentionally flexible and may change as the application develops.

---

## Built With

LedgerX was built as a practical full-stack project to explore modern React development, REST APIs, serverless deployment, authentication, and Redis-based data storage.

**React · Vite · Node.js · Upstash Redis · Vercel**
