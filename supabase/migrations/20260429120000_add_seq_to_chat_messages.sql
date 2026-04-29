-- Add explicit sequence column to guarantee message ordering within a session.
-- Batch inserts get the same created_at timestamp, making order non-deterministic.
alter table public.ai_chat_messages
  add column if not exists seq integer not null default 0;

-- Backfill existing rows with their position within each session
with numbered as (
  select id,
    (row_number() over (partition by session_id order by created_at) - 1)::integer as rn
  from public.ai_chat_messages
)
update public.ai_chat_messages m
set seq = n.rn
from numbered n
where m.id = n.id;
