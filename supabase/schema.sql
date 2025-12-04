-- Supabase Database Schema
-- This file documents the current database schema for the Identity Preserver application

-- 1. Profiles Table (Links to Supabase Auth)
-- Stores user profile information linked to Supabase Auth users
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text
);

-- 2. Identities Table (Stores the active identity_json)
-- Stores user identity configurations and versions
create table identities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  identity_json jsonb not null, -- The core structured object [cite: 103]
  is_active boolean default true,
  version_number int default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Transformations Table (Logs for Analytics & History) [cite: 232]
-- Stores transformation history and analytics data
create table transformations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  input_text text,
  raw_llm_output text, -- [cite: 234]
  final_output text,   -- [cite: 235]
  alignment_score numeric(3,1), -- [cite: 236]
  processing_time_ms int, -- [cite: 237]
  model_used text default 'gpt-4o-mini',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Function to automatically create profile when user signs up
-- This function is triggered when a new user is created in auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$ language plpgsql security definer;

-- 5. Trigger to call the function when a new user is created
-- This ensures every new user automatically gets a profile entry
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Enable Row Level Security on profiles table
alter table profiles enable row level security;

-- 7. Policy: Users can read their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- 8. Policy: Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

