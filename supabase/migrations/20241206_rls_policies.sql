-- Migration: Add comprehensive RLS policies
-- Date: 2024-12-06
-- Description: Drops existing RLS policies and creates new comprehensive policies for all tables

-- ============================================
-- STEP 1: DROP EXISTING POLICIES
-- ============================================

-- Drop profiles policies (if exist)
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "profiles_select_own" on profiles;
drop policy if exists "profiles_update_own" on profiles;

-- Drop identities policies (if exist)
drop policy if exists "Users can view own identities" on identities;
drop policy if exists "Users can insert own identities" on identities;
drop policy if exists "Users can update own identities" on identities;
drop policy if exists "Users can delete own identities" on identities;
drop policy if exists "identities_select_own" on identities;
drop policy if exists "identities_insert_own" on identities;
drop policy if exists "identities_update_own" on identities;
drop policy if exists "identities_delete_own" on identities;

-- Drop transformations policies (if exist)
drop policy if exists "transformations_select_own" on transformations;
drop policy if exists "transformations_insert_own" on transformations;

-- Drop identity_versions policies (if exist)
drop policy if exists "Users can view versions of their identities" on identity_versions;
drop policy if exists "identity_versions_select_own" on identity_versions;

-- Drop memories policies (if exist)
drop policy if exists "Users can see their own memories" on memories;
drop policy if exists "Users can insert their own memories" on memories;
drop policy if exists "Users can delete their own memories" on memories;
drop policy if exists "memories_select_own" on memories;
drop policy if exists "memories_insert_own" on memories;
drop policy if exists "memories_update_own" on memories;
drop policy if exists "memories_delete_own" on memories;

-- ============================================
-- STEP 2: ENABLE RLS ON ALL TABLES
-- ============================================

alter table profiles enable row level security;
alter table identities enable row level security;
alter table transformations enable row level security;
alter table identity_versions enable row level security;
alter table memories enable row level security;

-- ============================================
-- STEP 3: CREATE NEW POLICIES
-- ============================================

-- PROFILES POLICIES
-- Users can only view and update their own profile
-- INSERT is handled by the handle_new_user() trigger with SECURITY DEFINER

create policy "profiles_select_own"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- IDENTITIES POLICIES
-- Users have full CRUD on their own identities

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

-- TRANSFORMATIONS POLICIES
-- Users can view and insert their own transformations
-- No update/delete needed - transformations are immutable logs

create policy "transformations_select_own"
  on transformations for select
  using (auth.uid() = user_id);

create policy "transformations_insert_own"
  on transformations for insert
  with check (auth.uid() = user_id);

-- IDENTITY_VERSIONS POLICIES
-- Users can view versions of their own identities
-- INSERT is handled by the save_identity_version() trigger with SECURITY DEFINER
-- DELETE cascades from identities table

create policy "identity_versions_select_own"
  on identity_versions for select
  using (
    exists (
      select 1 from identities
      where identities.id = identity_versions.identity_id
      and identities.user_id = auth.uid()
    )
  );

-- MEMORIES POLICIES
-- Users have full CRUD on their own memories

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
-- STEP 4: UPDATE FUNCTIONS WITH SECURITY DEFINER
-- ============================================

-- Update switch_active_identity to include ownership verification
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

-- Ensure save_identity_version has SECURITY DEFINER
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

-- Ensure handle_new_user has SECURITY DEFINER
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

-- Create match_memories function for semantic memory search
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
-- STEP 5: CREATE PERFORMANCE INDEXES
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
-- Note: This may take a moment to build if you have existing memories
create index if not exists idx_memories_embedding on memories 
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);



