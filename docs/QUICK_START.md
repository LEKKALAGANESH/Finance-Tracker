# Finance Tracker - Quick Start Guide

Get up and running with Finance Tracker in minutes.

## Prerequisites

- Node.js 18 or higher
- Python 3.11 or higher
- A Supabase account (free tier works)
- A Google AI Studio account (for Gemini API)

---

## Step 1: Clone & Install

```bash
# Navigate to project
cd finance-tracker

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

---

## Step 2: Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready
3. Go to **SQL Editor** in the dashboard
4. Copy the contents of `supabase/migrations/001_initial_schema.sql`
5. Paste and run the SQL to create tables and seed data
6. Go to **Settings > API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

---

## Step 3: Setup Google Gemini

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

---

## Step 4: Configure Environment

### Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend

Create `backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGINS=http://localhost:3000
```

---

## Step 5: Run the Application

### Terminal 1 - Backend

```bash
cd backend
.\venv\Scripts\activate  # Windows
uvicorn app.main:app --reload
```

Backend will be available at: `http://localhost:8000`

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:3000`

---

## Step 6: Create Your Account

1. Open `http://localhost:3000` in your browser
2. Click "Get Started" or "Sign Up"
3. Create an account with email and password
4. You'll be redirected to the dashboard

---

## You're Ready!

Start by:
1. Adding your first expense
2. Creating a monthly budget
3. Setting a savings goal
4. Checking out AI Insights

---

## Common Issues

### "Categories not loading"
- Make sure you ran the database migration
- Check that default categories were seeded

### "uvicorn not found"
- Ensure virtual environment is activated
- Run: `pip install uvicorn[standard]`

### "CORS error"
- Check that `CORS_ORIGINS` in backend `.env` matches your frontend URL
- Restart the backend server after changing

### "Supabase connection failed"
- Verify your Supabase URL and keys are correct
- Check that the project is active (not paused)

---

## Next Steps

- Read the full [Project Documentation](./PROJECT_DOCUMENTATION.md)
- Check the [API Reference](./API_REFERENCE.md)
- Explore the codebase structure
