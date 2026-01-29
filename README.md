# Finance Tracker

A modern, full-stack personal finance management application with AI-powered insights. Track expenses, manage budgets, set savings goals, and receive personalized financial advice powered by Google Gemini AI.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Features

- **Expense Tracking** - Log and categorize expenses with multiple payment methods
- **Budget Management** - Set category-based or overall budgets with customizable alert thresholds
- **Savings Goals** - Create and track progress towards financial goals with deadlines
- **AI-Powered Insights** - Get personalized financial tips and advice from Google Gemini AI
- **Interactive AI Chat** - Chat with an AI financial advisor about your spending habits
- **Reports & Analytics** - Visualize spending patterns with interactive charts
- **Data Export** - Export your financial data to CSV or PDF formats

### User Experience

- **Dark/Light Theme** - Toggle between themes with system preference support
- **Responsive Design** - Fully responsive UI for desktop, tablet, and mobile
- **Real-time Updates** - Instant feedback on all financial operations
- **Toast Notifications** - Non-intrusive notifications for user actions
- **Category Management** - Create custom categories with icons and colors

### Security

- **Secure Authentication** - Email/password and OAuth authentication via Supabase
- **Row Level Security** - Database-level security ensuring data isolation
- **JWT Token Authentication** - Secure API access with automatic token refresh

## Tech Stack

### Frontend

| Technology        | Version | Purpose                         |
| ----------------- | ------- | ------------------------------- |
| Next.js           | 14.x    | React framework with App Router |
| React             | 18.x    | UI library                      |
| TypeScript        | 5.x     | Type safety                     |
| Styled Components | 6.x     | CSS-in-JS styling               |
| React Hook Form   | 7.x     | Form management                 |
| Zod               | 3.x     | Schema validation               |
| Recharts          | 2.x     | Data visualization              |
| Lucide React      | 0.3x    | Icon library                    |
| date-fns          | 3.x     | Date utilities                  |

### Backend

| Technology   | Version | Purpose              |
| ------------ | ------- | -------------------- |
| Python       | 3.11+   | Programming language |
| FastAPI      | 0.109+  | Web framework        |
| Uvicorn      | 0.27+   | ASGI server          |
| Pydantic     | 2.x     | Data validation      |
| google-genai | 1.x     | Google Gemini AI SDK |

### Database & Auth

| Technology         | Purpose                              |
| ------------------ | ------------------------------------ |
| Supabase           | PostgreSQL database & authentication |
| Row Level Security | Data isolation per user              |

## Screenshots

<details>
<summary>Click to view screenshots</summary>

### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

### Expenses

![Expenses](docs/screenshots/expenses.png)

### Budgets

![Budgets](docs/screenshots/budgets.png)

### AI Insights

![AI Insights](docs/screenshots/insights.png)

</details>

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18.0 or higher
- **Python** 3.11 or higher
- **npm** or **yarn**
- **Git**

You'll also need accounts for:

- [Supabase](https://supabase.com) - Database and authentication
- [Google AI Studio](https://aistudio.google.com) - Gemini API key

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/finance-tracker.git
cd finance-tracker
```

#### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your credentials (see Environment Variables section)
```

#### 3. Backend Setup

```bash
# Navigate to backend directory
cd ../backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your credentials (see Environment Variables section)
```

### Database Setup

1. Create a new project at [supabase.com](https://supabase.com)

2. Go to **SQL Editor** in your Supabase dashboard

3. Copy and run the contents of `supabase/migrations/001_initial_schema.sql`

4. Get your API keys from **Project Settings > API**:
   - `Project URL` - Your Supabase URL
   - `anon public` - Anonymous key for frontend
   - `service_role` - Service key for backend (keep secret!)

### Running the Application

#### Start the Backend

```bash
cd backend
# Activate virtual environment if not already active
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

#### Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## Project Structure

```
finance-tracker/
├── frontend/                       # Next.js 14 Application
│   ├── public/                     # Static assets
│   │   ├── icon.svg               # App icon
│   │   └── manifest.json          # PWA manifest
│   ├── src/
│   │   ├── app/                   # App Router pages
│   │   │   ├── (auth)/            # Authentication pages
│   │   │   │   ├── login/         # Login page
│   │   │   │   └── register/      # Registration page
│   │   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   │   ├── dashboard/     # Main dashboard
│   │   │   │   ├── expenses/      # Expense management
│   │   │   │   ├── budgets/       # Budget management
│   │   │   │   ├── goals/         # Savings goals
│   │   │   │   ├── insights/      # AI insights
│   │   │   │   ├── reports/       # Reports & export
│   │   │   │   └── settings/      # User settings
│   │   │   ├── auth/              # OAuth callbacks
│   │   │   ├── layout.tsx         # Root layout
│   │   │   └── page.tsx           # Landing page
│   │   ├── components/            # React components
│   │   │   ├── ui/                # Reusable UI components
│   │   │   ├── layout/            # Layout components
│   │   │   ├── dashboard/         # Dashboard widgets
│   │   │   ├── expenses/          # Expense components
│   │   │   ├── budgets/           # Budget components
│   │   │   ├── goals/             # Goal components
│   │   │   ├── insights/          # Insight components
│   │   │   ├── reports/           # Report components
│   │   │   └── categories/        # Category components
│   │   ├── context/               # React Context providers
│   │   │   ├── AuthContext.tsx    # Authentication state
│   │   │   ├── ThemeContext.tsx   # Theme management
│   │   │   └── ToastContext.tsx   # Notifications
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── lib/                   # Utilities & helpers
│   │   │   ├── supabase/          # Supabase client config
│   │   │   ├── api.ts             # API client
│   │   │   ├── utils.ts           # Helper functions
│   │   │   └── validations.ts     # Zod schemas
│   │   ├── styles/                # Theme & global styles
│   │   └── types/                 # TypeScript definitions
│   ├── __tests__/                 # Frontend tests
│   ├── package.json
│   ├── next.config.js
│   └── tsconfig.json
│
├── backend/                        # FastAPI Application
│   ├── app/
│   │   ├── main.py                # Application entry point
│   │   ├── config.py              # Configuration management
│   │   ├── api/                   # API routes
│   │   │   ├── deps.py            # Dependencies (auth, db)
│   │   │   └── v1/                # API version 1
│   │   │       ├── router.py      # Main router
│   │   │       ├── expenses.py    # Expense endpoints
│   │   │       ├── budgets.py     # Budget endpoints
│   │   │       ├── goals.py       # Goal endpoints
│   │   │       ├── insights.py    # AI insight endpoints
│   │   │       ├── reports.py     # Report endpoints
│   │   │       └── categories.py  # Category endpoints
│   │   ├── models/                # Pydantic models
│   │   ├── services/              # Business logic layer
│   │   │   ├── expense_service.py
│   │   │   ├── budget_service.py
│   │   │   ├── goal_service.py
│   │   │   ├── insight_service.py
│   │   │   ├── report_service.py
│   │   │   └── category_service.py
│   │   └── core/                  # Core utilities
│   │       ├── supabase.py        # Supabase client
│   │       ├── gemini.py          # Gemini AI client
│   │       ├── security.py        # Security utilities
│   │       └── exceptions.py      # Custom exceptions
│   ├── tests/                     # Backend tests
│   ├── requirements.txt           # Production dependencies
│   ├── requirements-dev.txt       # Development dependencies
│   └── pytest.ini                 # Pytest configuration
│
├── supabase/                       # Database
│   └── migrations/
│       └── 001_initial_schema.sql # Database schema
│
├── docs/                           # Documentation
│   ├── API_REFERENCE.md
│   ├── PROJECT_DOCUMENTATION.md
│   └── QUICK_START.md
│
├── .gitignore
└── README.md
```

## Environment Variables

### Frontend (`frontend/.env.local`)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`backend/.env`)

```env
# Application
APP_NAME=Finance Tracker API
DEBUG=true
API_PREFIX=/api/v1

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-key

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:3000,https://your-domain.com
```

## API Reference

### Base URL

```
http://localhost:8000/api/v1
```

### Authentication

All endpoints require JWT authentication via Bearer token:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Expenses

| Method | Endpoint         | Description                           |
| ------ | ---------------- | ------------------------------------- |
| GET    | `/expenses`      | List expenses (paginated, filterable) |
| POST   | `/expenses`      | Create new expense                    |
| GET    | `/expenses/{id}` | Get expense by ID                     |
| PUT    | `/expenses/{id}` | Update expense                        |
| DELETE | `/expenses/{id}` | Delete expense                        |

**Query Parameters for GET `/expenses`:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `start_date` - Filter from date (YYYY-MM-DD)
- `end_date` - Filter to date (YYYY-MM-DD)
- `category_id` - Filter by category UUID
- `min_amount` - Minimum amount
- `max_amount` - Maximum amount
- `search` - Search in description

#### Budgets

| Method | Endpoint          | Description                      |
| ------ | ----------------- | -------------------------------- |
| GET    | `/budgets`        | List all budgets                 |
| POST   | `/budgets`        | Create budget                    |
| PUT    | `/budgets/{id}`   | Update budget                    |
| DELETE | `/budgets/{id}`   | Delete budget                    |
| GET    | `/budgets/status` | Get budgets with spending status |

#### Goals

| Method | Endpoint                 | Description              |
| ------ | ------------------------ | ------------------------ |
| GET    | `/goals`                 | List all goals           |
| POST   | `/goals`                 | Create goal              |
| PUT    | `/goals/{id}`            | Update goal              |
| DELETE | `/goals/{id}`            | Delete goal              |
| POST   | `/goals/{id}/contribute` | Add contribution to goal |

#### Categories

| Method | Endpoint           | Description                    |
| ------ | ------------------ | ------------------------------ |
| GET    | `/categories`      | List user + default categories |
| POST   | `/categories`      | Create custom category         |
| PUT    | `/categories/{id}` | Update custom category         |
| DELETE | `/categories/{id}` | Delete custom category         |

#### AI Insights

| Method | Endpoint                | Description                     |
| ------ | ----------------------- | ------------------------------- |
| GET    | `/insights/summary`     | Get spending summary            |
| GET    | `/insights/tips`        | Get AI-generated financial tips |
| POST   | `/insights/chat`        | Chat with AI financial advisor  |
| GET    | `/insights/predictions` | Get spending predictions        |

#### Reports

| Method | Endpoint            | Description             |
| ------ | ------------------- | ----------------------- |
| GET    | `/reports/monthly`  | Monthly spending report |
| GET    | `/reports/category` | Category breakdown      |
| GET    | `/reports/export`   | Export data (CSV/PDF)   |

### Interactive API Documentation

When running the backend, visit `http://localhost:8000/docs` for interactive Swagger documentation.

## Database Schema

### Entity Relationship

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   profiles  │       │  categories │       │   expenses  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK,FK)  │──┐    │ id (PK)     │───────│ id (PK)     │
│ full_name   │  │    │ user_id(FK) │       │ user_id(FK) │──┐
│ avatar_url  │  │    │ name        │       │ category_id │  │
│ currency    │  │    │ icon        │       │ amount      │  │
│ created_at  │  │    │ color       │       │ description │  │
│ updated_at  │  │    │ type        │       │ date        │  │
└─────────────┘  │    │ is_default  │       │ payment_m.. │  │
                 │    │ created_at  │       │ created_at  │  │
                 │    └─────────────┘       │ updated_at  │  │
                 │                          └─────────────┘  │
                 │                                           │
                 │    ┌─────────────┐       ┌─────────────┐  │
                 │    │   budgets   │       │    goals    │  │
                 │    ├─────────────┤       ├─────────────┤  │
                 └────│ id (PK)     │       │ id (PK)     │──┘
                      │ user_id(FK) │       │ user_id(FK) │
                      │ category_id │       │ name        │
                      │ amount      │       │ target_amt  │
                      │ period      │       │ current_amt │
                      │ start_date  │       │ deadline    │
                      │ alert_thres │       │ icon        │
                      │ created_at  │       │ color       │
                      │ updated_at  │       │ status      │
                      └─────────────┘       │ created_at  │
                                            │ updated_at  │
                                            └─────────────┘
```

### Tables

| Table            | Description                                        |
| ---------------- | -------------------------------------------------- |
| `profiles`       | User profile data (extends Supabase auth.users)    |
| `categories`     | Expense/income categories (default + user-created) |
| `expenses`       | User expense records                               |
| `budgets`        | Category-based budget tracking                     |
| `goals`          | Savings goals with progress tracking               |
| `insights_cache` | Cached AI-generated insights                       |

## Testing

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Backend Tests

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run with coverage report
pytest --cov=app

# Run specific test file
pytest tests/test_expenses.py
```

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Set the root directory to `frontend`
4. Add environment variables in Vercel dashboard
5. Deploy

### Backend (Railway/Render)

1. Push your code to GitHub
2. Create a new project in [Railway](https://railway.app) or [Render](https://render.com)
3. Connect your repository
4. Set the root directory to `backend`
5. Add environment variables
6. Deploy with start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Database (Supabase)

Your Supabase project is already cloud-hosted. Ensure your production environment variables point to your Supabase project.

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**

2. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Commit your changes**

   ```bash
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## License

MIT License

Copyright (c) 2024 Finance Tracker

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
