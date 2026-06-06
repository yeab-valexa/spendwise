-- Spendwise database schema
-- Run this once in your Supabase project:  Dashboard → SQL Editor → paste → Run

create table if not exists public.transactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('expense', 'loan')),
  amount     numeric not null check (amount > 0),
  currency   text not null,
  note       text not null default '',
  person     text,                 -- for loans: who you lent to
  category   text,                 -- for expenses
  date       date not null default current_date,
  settled    boolean not null default false,  -- for loans: repaid?
  created_at timestamptz not null default now()
);

-- Row-level security: every user can only see and modify their own rows.
alter table public.transactions enable row level security;

drop policy if exists "Users manage own transactions" on public.transactions;
create policy "Users manage own transactions"
  on public.transactions
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date desc);
