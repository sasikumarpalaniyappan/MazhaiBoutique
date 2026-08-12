create extension if not exists pgcrypto;

create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  session_id text,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists ai_chat_messages_created_at_idx
  on public.ai_chat_messages(created_at desc);

create index if not exists ai_chat_messages_session_id_idx
  on public.ai_chat_messages(session_id);

alter table public.ai_chat_messages enable row level security;

create policy "Allow service role to manage ai chat messages"
on public.ai_chat_messages
for all
using (true)
with check (true);
