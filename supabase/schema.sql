-- MentorForge AI Supabase Schema
-- Create these tables in your Supabase project's SQL Editor

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  semester INTEGER,
  target_role TEXT,
  learning_style TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Weaknesses Table
CREATE TABLE IF NOT EXISTS public.weaknesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'moderate', 'minor')),
  occurrences INTEGER DEFAULT 1,
  last_seen TEXT NOT NULL,
  description TEXT NOT NULL,
  code_steps JSONB NOT NULL,
  fix TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tech Stack Mastery Table
CREATE TABLE IF NOT EXISTS public.tech_stack_mastery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  stack_name TEXT NOT NULL,
  node_name TEXT NOT NULL,
  mastery_level TEXT NOT NULL CHECK (mastery_level IN ('strong', 'average', 'weak')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stack_name, node_name)
);

-- 4. Teaching Sessions Table
CREATE TABLE IF NOT EXISTS public.teaching_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  session_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Chat History Table
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
-- Assuming authenticated users can only access their own data
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.weaknesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_stack_mastery DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teaching_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history DISABLE ROW LEVEL SECURITY;

-- Note: For a real app with Auth, you would add policies here like:
-- CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- DUMMY DATA FOR DEMONSTRATION PURPOSES
-- For local testing without real auth, we'll insert a dummy user
-- -----------------------------------------------------------------------------

INSERT INTO public.profiles (user_id, name, semester, target_role, learning_style)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Demo Student', 6, 'Full Stack Developer', 'Visual')
ON CONFLICT (user_id) DO NOTHING;

-- Insert Tech Stack Mastery Data
INSERT INTO public.tech_stack_mastery (user_id, stack_name, node_name, mastery_level)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'MERN Stack', 'React', 'strong'),
  ('00000000-0000-0000-0000-000000000000', 'MERN Stack', 'Node.js', 'average'),
  ('00000000-0000-0000-0000-000000000000', 'MERN Stack', 'MongoDB', 'weak'),
  ('00000000-0000-0000-0000-000000000000', 'MERN Stack', 'Express', 'average')
ON CONFLICT DO NOTHING;

-- Insert Weaknesses Data
INSERT INTO public.weaknesses (user_id, title, category, severity, occurrences, last_seen, description, code_steps, fix)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'Off-by-one error in two-pointer', 'Two Pointers', 'critical', 7, '2 hours ago', 'You consistently use `left < right` instead of `left <= right`, missing the case where both pointers converge on the target element.', '[{"line": 1, "code": "function twoSum(arr, target) {", "isError": false, "explanation": "Function signature is correct."}, {"line": 2, "code": "  let left = 0, right = arr.length - 1;", "isError": false, "explanation": "Pointers initialized correctly."}, {"line": 3, "code": "  while (left < right) {  // ❌ BUG HERE", "isError": true, "explanation": "Should be `left <= right`. When left === right, you skip checking the last remaining element."}, {"line": 4, "code": "    const sum = arr[left] + arr[right];", "isError": false, "explanation": "Sum calculation is fine."}, {"line": 5, "code": "    if (sum === target) return [left, right];", "isError": false, "explanation": "Return is correct."}, {"line": 6, "code": "    if (sum < target) left++;", "isError": false, "explanation": "Left pointer moves correctly."}, {"line": 7, "code": "    else right--;", "isError": false, "explanation": "Right pointer moves correctly."}, {"line": 8, "code": "  }", "isError": false, "explanation": ""}, {"line": 9, "code": "  return [-1, -1];", "isError": false, "explanation": "Fallback is fine, but you reach it prematurely due to the off-by-one."}]'::jsonb, 'Change `while (left < right)` to `while (left <= right)` to ensure you check the element when both pointers meet.'),
  ('00000000-0000-0000-0000-000000000000', 'Wrong recursion base case', 'Recursion', 'critical', 5, 'Yesterday', 'You forget to handle the `n === 0` case in recursive functions, causing infinite recursion and stack overflow.', '[{"line": 1, "code": "function factorial(n) {", "isError": false, "explanation": "Function signature is correct."}, {"line": 2, "code": "  if (n === 1) return 1;  // ❌ BUG HERE", "isError": true, "explanation": "Only checks n===1. What happens when n===0? It recurses forever: factorial(0) → factorial(-1) → ..."}, {"line": 3, "code": "  return n * factorial(n - 1);", "isError": false, "explanation": "Recursive call is correct, but without the right base case it never terminates for n=0."}, {"line": 4, "code": "}", "isError": false, "explanation": ""}]'::jsonb, 'Change `if (n === 1)` to `if (n <= 1)` or add an explicit `if (n === 0) return 1` check before.');
