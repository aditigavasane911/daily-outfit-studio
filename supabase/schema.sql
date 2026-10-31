-- ==========================================================
-- Rewear Radar / Daily Outfit Studio — PostgreSQL Database Schema
-- Run this in your Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==========================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  sizes text default '',
  favorite_colors text[] default array['Midnight Spruce', 'Earthy Sage', 'Warm Sand', 'Flame Orange']::text[],
  budget text default 'Under ₹3,000 per piece',
  style_note text default 'Quiet, earthy, easy to move in.',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Function and trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Garments Table
create table if not exists public.garments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid() not null,
  name text not null,
  category text not null check (category in ('tops', 'bottoms', 'outerwear', 'shoes', 'accessories')),
  color_name text not null,
  color_hex text not null,
  size text default '',
  brand text,
  fabric text,
  seasons text[] default '{}',
  formality text default 'casual' check (formality in ('casual', 'smart', 'formal')),
  image_url text,
  favorite boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists idx_garments_user_id on public.garments(user_id);
create index if not exists idx_garments_category on public.garments(category);
create index if not exists idx_garments_favorite on public.garments(favorite);

-- Enable RLS on garments
alter table public.garments enable row level security;

-- Garments Policies
create policy "Users can view their own garments"
  on public.garments for select
  using (auth.uid() = user_id);

create policy "Users can insert their own garments"
  on public.garments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own garments"
  on public.garments for update
  using (auth.uid() = user_id);

create policy "Users can delete their own garments"
  on public.garments for delete
  using (auth.uid() = user_id);

-- 3. Saved Outfits Table
create table if not exists public.saved_outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid() not null,
  score numeric default 0,
  reasons text[] default '{}',
  matched_palette_id integer,
  piece_ids uuid[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_saved_outfits_user_id on public.saved_outfits(user_id);

-- Enable RLS on saved_outfits
alter table public.saved_outfits enable row level security;

-- Saved Outfits Policies
create policy "Users can view their own saved outfits"
  on public.saved_outfits for select
  using (auth.uid() = user_id);

create policy "Users can insert their own saved outfits"
  on public.saved_outfits for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own saved outfits"
  on public.saved_outfits for delete
  using (auth.uid() = user_id);

-- 4. Storage Bucket for Garment Images (Optional)
insert into storage.buckets (id, name, public)
values ('garments', 'garments', true)
on conflict (id) do nothing;

create policy "Public Access to Garment Images"
  on storage.objects for select
  using (bucket_id = 'garments');

create policy "Authenticated users can upload garment images"
  on storage.objects for insert
  with check (bucket_id = 'garments' and auth.role() = 'authenticated');

create policy "Users can update/delete their own garment images"
  on storage.objects for delete
  using (bucket_id = 'garments' and auth.uid() = owner);
