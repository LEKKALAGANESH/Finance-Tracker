-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id),
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    date DATE NOT NULL,
    payment_method TEXT NOT NULL,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    alert_threshold INTEGER DEFAULT 80 CHECK (alert_threshold >= 1 AND alert_threshold <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(12, 2) DEFAULT 0 CHECK (current_amount >= 0),
    deadline DATE NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insights cache table
CREATE TABLE IF NOT EXISTS insights_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL,
    content JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights_cache ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Categories policies
CREATE POLICY "Users can view own and default categories" ON categories
    FOR SELECT USING (auth.uid() = user_id OR is_default = TRUE);

CREATE POLICY "Users can create own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id AND is_default = FALSE);

CREATE POLICY "Users can delete own categories" ON categories
    FOR DELETE USING (auth.uid() = user_id AND is_default = FALSE);

-- Expenses policies
CREATE POLICY "Users can view own expenses" ON expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own expenses" ON expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
    FOR DELETE USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can view own budgets" ON budgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own budgets" ON budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON budgets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON budgets
    FOR DELETE USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals" ON goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
    FOR DELETE USING (auth.uid() = user_id);

-- Insights cache policies
CREATE POLICY "Users can view own insights" ON insights_cache
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own insights" ON insights_cache
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default categories
INSERT INTO categories (user_id, name, icon, color, type, is_default) VALUES
    (NULL, 'Food & Dining', '🍔', '#f97316', 'expense', TRUE),
    (NULL, 'Transportation', '🚗', '#3b82f6', 'expense', TRUE),
    (NULL, 'Shopping', '🛍️', '#ec4899', 'expense', TRUE),
    (NULL, 'Entertainment', '🎬', '#8b5cf6', 'expense', TRUE),
    (NULL, 'Bills & Utilities', '📱', '#ef4444', 'expense', TRUE),
    (NULL, 'Health', '💊', '#10b981', 'expense', TRUE),
    (NULL, 'Education', '📚', '#06b6d4', 'expense', TRUE),
    (NULL, 'Groceries', '🛒', '#84cc16', 'expense', TRUE),
    (NULL, 'Travel', '✈️', '#f59e0b', 'expense', TRUE),
    (NULL, 'Other', '📦', '#6b7280', 'expense', TRUE),
    (NULL, 'Salary', '💰', '#10b981', 'income', TRUE),
    (NULL, 'Freelance', '💼', '#3b82f6', 'income', TRUE),
    (NULL, 'Investments', '📈', '#8b5cf6', 'income', TRUE),
    (NULL, 'Other Income', '💵', '#6b7280', 'income', TRUE)
ON CONFLICT DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
