-- Supabase Database Schema
-- This file documents the current database schema for the Resonate application

-- ============================================
-- EXTENSIONS
-- ============================================

-- Enable the Vector Extension (Crucial for AI memory)
create extension if not exists vector;

-- ============================================
-- TABLES
-- ============================================

-- 1. Profiles Table (Links to Supabase Auth)
-- Stores user profile information linked to Supabase Auth users
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text,
  onboarding_completed boolean default false not null
);

-- 2. Identities Table (Stores the active identity_json)
-- Stores user identity configurations and versions
create table identities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  name text, -- Human-readable name for the identity (e.g., "Work Persona", "Personal Blog")
  identity_json jsonb not null, -- The core structured object
  is_active boolean default true,
  version_number int default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Transformations Table (Logs for Analytics & History)
-- Stores transformation history and analytics data
create table transformations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  input_text text,
  raw_llm_output text,
  final_output text,
  alignment_score numeric(3,1),
  processing_time_ms int,
  model_used text default 'gpt-4o-mini',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Identity Versions Table
-- Stores version history for identity configurations
create table identity_versions (
  id uuid default uuid_generate_v4() primary key,
  identity_id uuid references identities(id) on delete cascade not null,
  identity_json jsonb not null,
  change_summary text, -- Optional: "Manual Edit" or "AI Refinement"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Memories Table
-- Stores user memories with vector embeddings for AI-powered retrieval
create table memories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  content text not null,
  embedding vector(1536), -- Stores the OpenAI vector representation
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically create profile when user signs up
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

-- Function to safely switch the active persona
-- Switches the active identity by deactivating all identities for a user
-- and then activating the specified identity
create or replace function switch_active_identity(
  p_identity_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
as $$
begin
  -- Verify the identity belongs to the user
  if not exists (
    select 1 from identities 
    where id = p_identity_id and user_id = p_user_id
  ) then
    raise exception 'Identity not found or does not belong to user';
  end if;

  -- 1. Set ALL identities for this user to inactive
  update identities
  set is_active = false
  where user_id = p_user_id;

  -- 2. Set the TARGET identity to active
  update identities
  set is_active = true
  where id = p_identity_id and user_id = p_user_id;
end;
$$;

-- Function to save identity version on update
-- This function runs automatically whenever the 'identities' table changes
create or replace function save_identity_version()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into identity_versions (identity_id, identity_json, created_at)
  values (new.id, new.identity_json, now());
  return new;
end;
$$;

-- Function for semantic memory search (vector similarity)
-- Used by the transform API to find relevant memories
create or replace function match_memories(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
returns table (
  id uuid,
  content text,
  similarity float
)
language plpgsql
security definer
as $$
begin
  return query
  select
    memories.id,
    memories.content,
    1 - (memories.embedding <=> query_embedding) as similarity
  from memories
  where memories.user_id = p_user_id
    and memories.is_active = true
    and 1 - (memories.embedding <=> query_embedding) > match_threshold
  order by memories.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to call handle_new_user when a new user is created
-- This ensures every new user automatically gets a profile entry
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to save identity version on insert or update
-- Automatically saves a version whenever an identity is inserted or updated
create trigger on_identity_update
  after insert or update on identities
  for each row
  execute function save_identity_version();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table identities enable row level security;
alter table transformations enable row level security;
alter table identity_versions enable row level security;
alter table memories enable row level security;

-- ============================================
-- PROFILES POLICIES
-- Users can only view and update their own profile
-- INSERT is handled by the handle_new_user() trigger with SECURITY DEFINER
-- ============================================

create policy "profiles_select_own"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================
-- IDENTITIES POLICIES
-- Users have full CRUD on their own identities
-- ============================================

create policy "identities_select_own"
  on identities for select
  using (auth.uid() = user_id);

create policy "identities_insert_own"
  on identities for insert
  with check (auth.uid() = user_id);

create policy "identities_update_own"
  on identities for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "identities_delete_own"
  on identities for delete
  using (auth.uid() = user_id);

-- ============================================
-- TRANSFORMATIONS POLICIES
-- Users can view and insert their own transformations
-- No update/delete needed - transformations are immutable logs
-- ============================================

create policy "transformations_select_own"
  on transformations for select
  using (auth.uid() = user_id);

create policy "transformations_insert_own"
  on transformations for insert
  with check (auth.uid() = user_id);

-- ============================================
-- IDENTITY_VERSIONS POLICIES
-- Users can view versions of their own identities
-- INSERT is handled by the save_identity_version() trigger with SECURITY DEFINER
-- DELETE cascades from identities table
-- ============================================

create policy "identity_versions_select_own"
  on identity_versions for select
  using (
    exists (
      select 1 from identities
      where identities.id = identity_versions.identity_id
      and identities.user_id = auth.uid()
    )
  );

-- ============================================
-- MEMORIES POLICIES
-- Users have full CRUD on their own memories
-- ============================================

create policy "memories_select_own"
  on memories for select
  using (auth.uid() = user_id);

create policy "memories_insert_own"
  on memories for insert
  with check (auth.uid() = user_id);

create policy "memories_update_own"
  on memories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "memories_delete_own"
  on memories for delete
  using (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Index for faster identity lookups by user
create index if not exists idx_identities_user_id on identities(user_id);
create index if not exists idx_identities_user_active on identities(user_id, is_active);

-- Index for faster transformation lookups by user
create index if not exists idx_transformations_user_id on transformations(user_id);
create index if not exists idx_transformations_created_at on transformations(user_id, created_at desc);

-- Index for faster identity version lookups
create index if not exists idx_identity_versions_identity_id on identity_versions(identity_id);

-- Index for faster memory lookups by user
create index if not exists idx_memories_user_id on memories(user_id);
create index if not exists idx_memories_user_active on memories(user_id, is_active);

-- HNSW index for vector similarity search (much faster than IVFFlat for small-medium datasets)
create index if not exists idx_memories_embedding on memories 
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);
