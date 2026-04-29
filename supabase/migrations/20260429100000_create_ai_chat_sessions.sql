-- AI chat sessions: one session per user per wedding (can have multiple over time)
create table public.ai_chat_sessions (
  id          uuid        not null default gen_random_uuid(),
  wedding_id  uuid        not null references public.weddings (id) on delete cascade,
  user_id     uuid        not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint  ai_chat_sessions_pkey primary key (id)
);

create index idx_ai_chat_sessions_wedding_user
  on public.ai_chat_sessions (wedding_id, user_id, created_at desc);

-- AI chat messages: stores full Anthropic content blocks as JSONB so tool_use
-- and tool_result blocks survive across turns (fixes context loss between requests)
create table public.ai_chat_messages (
  id          uuid        not null default gen_random_uuid(),
  session_id  uuid        not null references public.ai_chat_sessions (id) on delete cascade,
  role        text        not null check (role in ('user', 'assistant')),
  content     jsonb       not null,
  created_at  timestamptz not null default now(),
  constraint  ai_chat_messages_pkey primary key (id)
);

create index idx_ai_chat_messages_session
  on public.ai_chat_messages (session_id, created_at asc);

-- RLS: users can only access their own sessions and messages
alter table public.ai_chat_sessions enable row level security;
alter table public.ai_chat_messages  enable row level security;

create policy "ai_chat_sessions_rw_owner"
  on public.ai_chat_sessions
  to authenticated
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "ai_chat_messages_rw_owner"
  on public.ai_chat_messages
  to authenticated
  using (
    session_id in (
      select id from public.ai_chat_sessions where user_id = auth.uid()
    )
  )
  with check (
    session_id in (
      select id from public.ai_chat_sessions where user_id = auth.uid()
    )
  );

-- Auto-update updated_at on sessions when messages are inserted
create or replace function public.touch_ai_chat_session()
returns trigger language plpgsql as $$
begin
  update public.ai_chat_sessions
  set updated_at = now()
  where id = new.session_id;
  return new;
end;
$$;

create trigger trg_touch_ai_chat_session
  after insert on public.ai_chat_messages
  for each row execute function public.touch_ai_chat_session();
