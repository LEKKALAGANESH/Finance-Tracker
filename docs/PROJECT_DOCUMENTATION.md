# Finance Tracker - Complete Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Directory Structure](#directory-structure)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Frontend Architecture](#frontend-architecture)
7. [Backend Architecture](#backend-architecture)
8. [Environment Variables](#environment-variables)
9. [Features](#features)
10. [Installation & Setup](#installation--setup)
11. [Data Flow](#data-flow)
12. [Security](#security)
13. [Testing](#testing)

---

## Project Overview

**Finance Tracker** is a modern personal finance management application with AI-powered insights. It helps users track expenses, manage budgets, set savings goals, and receive personalized financial advice through Google Gemini AI integration.

### Key Highlights

- Full-stack application with Next.js frontend and FastAPI backend
- Real-time expense tracking and budget monitoring
- AI-powered financial insights and chat assistant
- Secure authentication with Supabase Auth
- Dark/Light theme support
- Responsive design for all devices
- Export reports to CSV/PDF

---

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend Framework** | Next.js 14 (App Router) | 14.2.35 |
| **Frontend UI** | React 18 | 18.x |
| **Styling** | Styled Components | 6.1.8 |
| **Form Management** | React Hook Form | 7.51.0 |
| **Validation** | Zod | 3.22.4 |
| **Charts** | Recharts | 2.12.0 |
| **Icons** | Lucide React | 0.363.0 |
| **Date Utilities** | date-fns | 3.6.0 |
| **Backend Framework** | FastAPI | 0.109.0+ |
| **ASGI Server** | Uvicorn | 0.27.0+ |
| **Database** | PostgreSQL (Supabase) | - |
| **Database SDK** | Supabase Python | 2.3.0+ |
| **Authentication** | Supabase Auth + JWT | - |
| **AI Integration** | Google Gemini | 0.3.0+ |
| **Configuration** | Pydantic Settings | 2.1.0+ |
| **Testing (Frontend)** | Jest + React Testing Library | 29.7.0 |
| **Testing (Backend)** | Pytest | 8.1.1 |

---

## Directory Structure

```
finance-tracker/
├── frontend/                      # Next.js 14 Application
│   ├── public/                    # Static assets
│   │   ├── icon.svg              # App icon
│   │   └── manifest.json         # PWA manifest
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   │   ├── (auth)/           # Auth pages group
│   │   │   │   ├── login/        # Login page
│   │   │   │   └── register/     # Register page
│   │   │   ├── (dashboard)/      # Dashboard pages group
│   │   │   │   ├── dashboard/    # Main dashboard
│   │   │   │   ├── expenses/     # Expense management
│   │   │   │   ├── budgets/      # Budget management
│   │   │   │   ├── goals/        # Goals tracking
│   │   │   │   ├── insights/     # AI insights
│   │   │   │   ├── reports/      # Reports & analytics
│   │   │   │   └── settings/     # User settings
│   │   │   ├── auth/             # OAuth callback
│   │   │   ├── layout.tsx        # Root layout
│   │   │   ├── page.tsx          # Landing page
│   │   │   └── globals.css       # Global CSS
│   │   ├── components/           # React components
│   │   │   ├── ui/               # Reusable UI components
│   │   │   │   ├── Button/
│   │   │   │   ├── Card/
│   │   │   │   ├── Input/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Select/
│   │   │   │   ├── Loader/
│   │   │   │   └── EmptyState/
│   │   │   ├── layout/           # Layout components
│   │   │   │   ├── Header/
│   │   │   │   ├── Sidebar/
│   │   │   │   └── MobileNav/
│   │   │   ├── dashboard/        # Dashboard widgets
│   │   │   │   ├── StatCard/
│   │   │   │   ├── SpendingChart/
│   │   │   │   └── RecentTransactions/
│   │   │   └── categories/       # Category components
│   │   ├── context/              # React Context providers
│   │   │   ├── AuthContext.tsx
│   │   │   ├── ThemeContext.tsx
│   │   │   └── ToastContext.tsx
│   │   ├── lib/                  # Utilities & helpers
│   │   │   ├── api.ts            # API client
│   │   │   ├── constants.ts      # App constants
│   │   │   ├── utils.ts          # Utility functions
│   │   │   ├── validations.ts    # Zod schemas
│   │   │   ├── registry.tsx      # Styled-components SSR
│   │   │   └── supabase/         # Supabase clients
│   │   │       ├── client.ts
│   │   │       ├── server.ts
│   │   │       └── middleware.ts
│   │   ├── styles/               # Styling
│   │   │   ├── theme.ts          # Theme definitions
│   │   │   ├── GlobalStyles.ts
│   │   │   └── mixins.ts
│   │   ├── types/                # TypeScript types
│   │   │   ├── expense.ts
│   │   │   ├── budget.ts
│   │   │   ├── goal.ts
│   │   │   └── insight.ts
│   │   └── middleware.ts         # Auth middleware
│   ├── package.json
│   ├── next.config.js
│   └── jest.config.js
│
├── backend/                       # FastAPI Application
│   ├── app/
│   │   ├── main.py               # App entry point
│   │   ├── config.py             # Configuration
│   │   ├── api/
│   │   │   ├── deps.py           # Dependencies
│   │   │   └── v1/               # API v1 routes
│   │   │       ├── router.py
│   │   │       ├── expenses.py
│   │   │       ├── budgets.py
│   │   │       ├── goals.py
│   │   │       ├── insights.py
│   │   │       ├── reports.py
│   │   │       └── categories.py
│   │   ├── models/               # Pydantic models
│   │   │   ├── common.py
│   │   │   ├── expense.py
│   │   │   ├── budget.py
│   │   │   ├── goal.py
│   │   │   ├── insight.py
│   │   │   └── report.py
│   │   ├── services/             # Business logic
│   │   │   ├── expense_service.py
│   │   │   ├── budget_service.py
│   │   │   ├── goal_service.py
│   │   │   ├── insight_service.py
│   │   │   ├── category_service.py
│   │   │   └── report_service.py
│   │   └── core/                 # Core utilities
│   │       ├── supabase.py
│   │       ├── gemini.py
│   │       ├── security.py
│   │       └── exceptions.py
│   ├── venv/                     # Virtual environment
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── pytest.ini
│
├── supabase/                      # Database
│   └── migrations/
│       └── 001_initial_schema.sql
│
└── docs/                          # Documentation
    └── PROJECT_DOCUMENTATION.md
```

---

## Database Schema

### Entity Relationship Diagram

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
                 │    │ created_at  │       │ receipt_url │  │
                 │    └─────────────┘       │ created_at  │  │
                 │                          │ updated_at  │  │
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

### Tables Detail

#### profiles
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, REFERENCES auth.users |
| full_name | TEXT | - |
| avatar_url | TEXT | - |
| currency | TEXT | DEFAULT 'USD' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

#### categories
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | REFERENCES auth.users, NULL for defaults |
| name | TEXT | NOT NULL |
| icon | TEXT | NOT NULL (emoji) |
| color | TEXT | NOT NULL (hex) |
| type | TEXT | CHECK ('expense', 'income') |
| is_default | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

#### expenses
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | NOT NULL, REFERENCES auth.users |
| category_id | UUID | NOT NULL, REFERENCES categories |
| amount | DECIMAL(12,2) | CHECK (amount > 0) |
| description | TEXT | NOT NULL |
| date | DATE | NOT NULL |
| payment_method | TEXT | NOT NULL |
| receipt_url | TEXT | - |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

#### budgets
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | NOT NULL, REFERENCES auth.users |
| category_id | UUID | REFERENCES categories (NULL = overall) |
| amount | DECIMAL(12,2) | CHECK (amount > 0) |
| period | TEXT | CHECK ('weekly', 'monthly', 'yearly') |
| start_date | DATE | NOT NULL |
| alert_threshold | INTEGER | DEFAULT 80, CHECK (1-100) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

#### goals
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | NOT NULL, REFERENCES auth.users |
| name | TEXT | NOT NULL |
| target_amount | DECIMAL(12,2) | CHECK (> 0) |
| current_amount | DECIMAL(12,2) | DEFAULT 0, CHECK (>= 0) |
| deadline | DATE | NOT NULL |
| icon | TEXT | NOT NULL (emoji) |
| color | TEXT | NOT NULL (hex) |
| status | TEXT | DEFAULT 'active', CHECK ('active', 'completed', 'cancelled') |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### Default Categories (Pre-seeded)

**Expense Categories:**
| Name | Icon | Color |
|------|------|-------|
| Food & Dining | :hamburger: | #f97316 |
| Transportation | :car: | #3b82f6 |
| Shopping | :shopping_bags: | #ec4899 |
| Entertainment | :clapper: | #8b5cf6 |
| Bills & Utilities | :mobile_phone: | #ef4444 |
| Health | :pill: | #10b981 |
| Education | :books: | #06b6d4 |
| Groceries | :shopping_cart: | #84cc16 |
| Travel | :airplane: | #f59e0b |
| Other | :package: | #6b7280 |

**Income Categories:**
| Name | Icon | Color |
|------|------|-------|
| Salary | :moneybag: | #10b981 |
| Freelance | :briefcase: | #3b82f6 |
| Investments | :chart_with_upwards_trend: | #8b5cf6 |
| Other Income | :dollar: | #6b7280 |

### Row Level Security (RLS)

All tables have RLS enabled ensuring users can only access their own data:

```sql
-- Example: Expenses policy
CREATE POLICY "Users can view own expenses" ON expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own expenses" ON expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## API Endpoints

### Base URL: `/api/v1`

### Authentication
All endpoints require JWT token: `Authorization: Bearer {token}`

### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expenses` | List expenses (paginated, filterable) |
| POST | `/expenses` | Create new expense |
| GET | `/expenses/{id}` | Get single expense |
| PUT | `/expenses/{id}` | Update expense |
| DELETE | `/expenses/{id}` | Delete expense |

**Query Parameters for GET /expenses:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `start_date` - Filter from date
- `end_date` - Filter to date
- `category_id` - Filter by category
- `min_amount` - Minimum amount
- `max_amount` - Maximum amount
- `search` - Search in description

### Budgets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/budgets` | List all budgets |
| POST | `/budgets` | Create budget |
| PUT | `/budgets/{id}` | Update budget |
| DELETE | `/budgets/{id}` | Delete budget |
| GET | `/budgets/status` | Get budgets with spending status |

### Goals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/goals` | List all goals |
| POST | `/goals` | Create goal |
| PUT | `/goals/{id}` | Update goal |
| DELETE | `/goals/{id}` | Delete goal |
| POST | `/goals/{id}/contribute` | Add contribution |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List user + default categories |
| POST | `/categories` | Create custom category |
| PUT | `/categories/{id}` | Update custom category |
| DELETE | `/categories/{id}` | Delete custom category |

### AI Insights

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/insights/summary` | Get spending summary |
| GET | `/insights/tips` | Get AI-generated tips |
| POST | `/insights/chat` | Chat with AI advisor |
| GET | `/insights/predictions` | Get spending predictions |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/monthly` | Monthly spending report |
| GET | `/reports/category` | Category breakdown |
| GET | `/reports/export` | Export as CSV/PDF |

---

## Frontend Architecture

### Pages Structure

```
/ .......................... Landing page (public)
/login ..................... Login page
/register .................. Registration page
/dashboard ................. Main dashboard with stats
/expenses .................. Expense list with filters
/expenses/add .............. Add new expense form
/expenses/[id] ............. Edit expense form
/budgets ................... Budget management
/goals ..................... Goals tracking
/insights .................. AI insights & chat
/reports ................... Reports & analytics
/settings .................. User settings
```

### Component Architecture

```
App
├── AuthProvider (authentication state)
│   ├── ThemeProvider (light/dark theme)
│   │   ├── ToastProvider (notifications)
│   │   │   ├── Header
│   │   │   │   ├── ThemeToggle
│   │   │   │   ├── NotificationBell
│   │   │   │   └── UserMenu
│   │   │   ├── Sidebar
│   │   │   │   ├── Logo
│   │   │   │   ├── NavItems
│   │   │   │   └── SignOutButton
│   │   │   └── Page Content
│   │   │       ├── Dashboard
│   │   │       │   ├── StatCards (4x)
│   │   │       │   ├── SpendingChart
│   │   │       │   └── RecentTransactions
│   │   │       ├── Expenses
│   │   │       │   ├── FilterBar
│   │   │       │   ├── ExpenseTable
│   │   │       │   └── Pagination
│   │   │       ├── Budgets
│   │   │       │   ├── BudgetGrid
│   │   │       │   └── BudgetModal
│   │   │       └── Goals
│   │   │           ├── GoalsGrid
│   │   │           └── ContributeModal
```

### UI Components

| Component | Variants/Props |
|-----------|---------------|
| Button | primary, secondary, outline, ghost, danger; sizes: sm, md, lg |
| Card | default, outlined, elevated, glass; hoverable |
| Input | With label, error, hint, icons |
| Select | Standard dropdown with options |
| Modal | Configurable size, title, close handler |
| Loader | Spinner with optional text, fullScreen |
| EmptyState | Icon, title, description, action button |

### Context Providers

**AuthContext**
- `user` - Current user object
- `session` - Supabase session
- `signIn()` - Email/password login
- `signUp()` - Registration
- `signOut()` - Logout
- `signInWithGoogle()` - OAuth login

**ThemeContext**
- `theme` - 'light' | 'dark'
- `toggleTheme()` - Switch theme
- Persists to localStorage
- Respects system preference

**ToastContext**
- `success(message)` - Success notification
- `error(message)` - Error notification
- `info(message)` - Info notification

### Utility Functions

```typescript
// lib/utils.ts
formatCurrency(amount, currency?)  // $1,234.56
formatNumber(number)               // 1,234
formatPercentage(value)           // 85%
formatDate(date, format?)         // Jan 15, 2024
getDateRange(period)              // { start, end }
calculatePercentage(part, total)  // 85
debounce(fn, delay)               // Debounced function
```

### Validation Schemas

```typescript
// lib/validations.ts
loginSchema        // email, password
registerSchema     // email, password, confirmPassword, fullName
expenseSchema      // amount, category_id, description, date, payment_method
budgetSchema       // amount, category_id, period, alert_threshold
goalSchema         // name, target_amount, deadline, icon, color
categorySchema     // name, icon, color, type
```

---

## Backend Architecture

### Application Structure

```python
# main.py - Entry Point
app = FastAPI(title="Finance Tracker API")
app.add_middleware(CORSMiddleware, ...)
app.include_router(api_router, prefix="/api/v1")
```

### Service Layer Pattern

Each feature has a dedicated service class:

```python
# services/expense_service.py
class ExpenseService:
    def __init__(self, db: Client, user_id: str):
        self.db = db
        self.user_id = user_id

    async def list_expenses(self, filters: ExpenseFilters) -> List[Expense]:
        ...

    async def create_expense(self, data: ExpenseCreate) -> Expense:
        ...
```

### Dependency Injection

```python
# api/deps.py
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    # Verify JWT with Supabase
    ...

async def get_db() -> Client:
    return get_supabase_client()

# Usage in endpoints
@router.get("/expenses")
async def list_expenses(
    user: User = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    service = ExpenseService(db, user.id)
    return await service.list_expenses()
```

### AI Integration

```python
# core/gemini.py
model = genai.GenerativeModel('gemini-1.5-flash')

async def generate_insight(prompt: str, context: dict) -> str:
    response = model.generate_content(
        f"Context: {context}\n\nPrompt: {prompt}"
    )
    return response.text

async def chat_with_ai(messages: List[dict], context: dict) -> str:
    chat = model.start_chat(history=messages)
    response = chat.send_message(context)
    return response.text
```

### Error Handling

```python
# core/exceptions.py
class NotFoundException(HTTPException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=404, detail=detail)

class BadRequestException(HTTPException):
    def __init__(self, detail: str = "Bad request"):
        super().__init__(status_code=400, detail=detail)

# Usage
if not expense:
    raise NotFoundException("Expense not found")
```

---

## Environment Variables

### Frontend (.env.local)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)

```env
# Application
APP_NAME=Finance Tracker API
DEBUG=false
API_PREFIX=/api/v1

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# AI
GEMINI_API_KEY=your-gemini-api-key

# CORS
CORS_ORIGINS=http://localhost:3000
```

---

## Features

### 1. Expense Tracking
- Log expenses with category, amount, date, description
- Multiple payment methods (cash, credit, debit, UPI, etc.)
- Advanced filtering and search
- Pagination for large datasets
- Receipt URL attachment support

### 2. Budget Management
- Create budgets per category or overall
- Weekly, monthly, or yearly periods
- Configurable alert thresholds (default 80%)
- Visual progress indicators
- Real-time budget status updates

### 3. Savings Goals
- Set goals with target amount and deadline
- Track progress with visual indicators
- Add contributions toward goals
- Auto-complete when target reached
- Days remaining countdown

### 4. AI-Powered Insights
- Spending summaries and trends
- Personalized saving tips from Gemini AI
- Interactive chat with financial advisor
- Spending predictions based on history
- Category-wise analysis

### 5. Reports & Analytics
- Monthly spending reports
- Category breakdown charts
- Export to CSV for spreadsheets
- Export to PDF for records
- Date range filtering

### 6. User Experience
- Dark and light themes
- Responsive design (mobile-first)
- Smooth animations and transitions
- Toast notifications
- Empty states with helpful actions
- Loading skeletons

---

## Installation & Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- Supabase account
- Google AI Studio account (for Gemini API)

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your credentials

# Run development server
uvicorn app.main:app --reload

# Run with specific host/port
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Database Setup

1. Create a new Supabase project
2. Go to SQL Editor
3. Run the migration file: `supabase/migrations/001_initial_schema.sql`
4. Copy your project URL and keys to environment files

---

## Data Flow

### Authentication Flow

```
1. User enters credentials
2. Frontend sends to Supabase Auth
3. Supabase validates & returns JWT
4. Frontend stores token in session
5. Token sent with all API requests
6. Backend verifies token with Supabase
7. User ID extracted for data access
```

### Expense Creation Flow

```
1. User fills expense form
2. Frontend validates with Zod schema
3. POST request to /api/v1/expenses
4. Backend verifies JWT token
5. ExpenseService creates in database
6. Category info joined in response
7. Frontend updates local state
8. Toast notification shown
```

### Budget Monitoring Flow

```
1. Frontend requests /budgets/status
2. BudgetService fetches budgets
3. For each budget, calculates:
   - Period date range
   - Total expenses in period
   - Spent amount, remaining, percentage
   - Alert status (near/over threshold)
4. Returns enriched budget data
5. Frontend displays progress bars
6. Color-coded warnings shown
```

### AI Insights Flow

```
1. User opens Insights page
2. Frontend fetches spending data
3. Data sent to /insights/tips
4. InsightService prepares context
5. Gemini AI generates personalized tips
6. Tips parsed into structured format
7. Displayed with priority icons
```

---

## Security

### Authentication
- JWT-based authentication via Supabase
- Tokens verified on every request
- Automatic token refresh handling

### Authorization
- Row Level Security (RLS) on all tables
- Users can only access their own data
- Service key used only in backend

### Data Protection
- HTTPS enforced in production
- Passwords hashed by Supabase Auth
- Sensitive data not logged

### API Security
- CORS configured for frontend origin
- Input validation with Pydantic
- SQL injection prevented by Supabase SDK

---

## Testing

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Backend Tests

```bash
cd backend

# Activate virtual environment first

# Run all tests
pytest

# Verbose output
pytest -v

# Coverage report
pytest --cov=app

# Specific test file
pytest tests/test_expenses.py
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

---

## License

This project is for educational and personal use.

---

## Support

For issues and questions, please open an issue in the repository.
