-- ============================================================
-- Love Days — Supabase スキーマ
-- Supabase Dashboard > SQL Editor に貼り付けて実行してください
-- ============================================================

-- ストレージバケット（写真用・公開）
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "authenticated can upload photos"
  on storage.objects for insert
  with check (bucket_id = 'photos' and auth.role() = 'authenticated');

create policy "public can read photos"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "authenticated can delete photos"
  on storage.objects for delete
  using (bucket_id = 'photos' and auth.role() = 'authenticated');

-- ============================================================
-- テーブル
-- ============================================================

create table if not exists couples (
  id            uuid primary key default gen_random_uuid(),
  invite_code   varchar(9) unique not null,
  start_date    date not null,
  partner1_name varchar(50) not null,
  partner2_name varchar(50) not null,
  partner1_id   uuid references auth.users not null,
  partner2_id   uuid references auth.users,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists messages (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid references couples on delete cascade not null,
  text        text not null,
  from_name   varchar(50) not null,
  author_id   uuid references auth.users not null,
  created_at  timestamptz default now()
);

create table if not exists photos (
  id             uuid primary key default gen_random_uuid(),
  couple_id      uuid references couples on delete cascade not null,
  storage_path   text not null,
  caption        text,
  uploaded_by    uuid references auth.users not null,
  created_at     timestamptz default now()
);

create table if not exists time_capsules (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid references couples on delete cascade not null,
  title       varchar(100) not null,
  open_date   date not null,
  is_opened   boolean default false,
  created_by  uuid references auth.users not null,
  created_at  timestamptz default now()
);

create table if not exists capsule_messages (
  id                 uuid primary key default gen_random_uuid(),
  capsule_id         uuid references time_capsules on delete cascade not null,
  author_id          uuid references auth.users not null,
  author_name        varchar(50) not null,
  message_text       text,
  photo_storage_path text,
  is_sealed          boolean default false,
  sealed_at          timestamptz,
  created_at         timestamptz default now()
);

-- ============================================================
-- Row Level Security 有効化
-- ============================================================

alter table couples          enable row level security;
alter table messages         enable row level security;
alter table photos           enable row level security;
alter table time_capsules    enable row level security;
alter table capsule_messages enable row level security;

-- ============================================================
-- couples ポリシー
-- ============================================================

create policy "couple members can read"
  on couples for select
  using (partner1_id = auth.uid() or partner2_id = auth.uid());

create policy "authenticated can create couple"
  on couples for insert
  with check (partner1_id = auth.uid());

create policy "couple members can update"
  on couples for update
  using (partner1_id = auth.uid() or partner2_id = auth.uid());

-- ============================================================
-- messages ポリシー
-- ============================================================

create policy "couple members can read messages"
  on messages for select
  using (
    couple_id in (
      select id from couples
      where partner1_id = auth.uid() or partner2_id = auth.uid()
    )
  );

create policy "couple members can insert messages"
  on messages for insert
  with check (
    couple_id in (
      select id from couples
      where partner1_id = auth.uid() or partner2_id = auth.uid()
    )
    and author_id = auth.uid()
  );

create policy "authors can delete messages"
  on messages for delete
  using (author_id = auth.uid());

-- ============================================================
-- photos ポリシー
-- ============================================================

create policy "couple members can read photos"
  on photos for select
  using (
    couple_id in (
      select id from couples
      where partner1_id = auth.uid() or partner2_id = auth.uid()
    )
  );

create policy "couple members can insert photos"
  on photos for insert
  with check (
    couple_id in (
      select id from couples
      where partner1_id = auth.uid() or partner2_id = auth.uid()
    )
    and uploaded_by = auth.uid()
  );

create policy "uploaders can delete photos"
  on photos for delete
  using (uploaded_by = auth.uid());

-- ============================================================
-- time_capsules ポリシー
-- ============================================================

create policy "couple members can read capsules"
  on time_capsules for select
  using (
    couple_id in (
      select id from couples
      where partner1_id = auth.uid() or partner2_id = auth.uid()
    )
  );

create policy "couple members can create capsules"
  on time_capsules for insert
  with check (
    couple_id in (
      select id from couples
      where partner1_id = auth.uid() or partner2_id = auth.uid()
    )
    and created_by = auth.uid()
  );

create policy "couple members can update capsules"
  on time_capsules for update
  using (
    couple_id in (
      select id from couples
      where partner1_id = auth.uid() or partner2_id = auth.uid()
    )
  );

create policy "capsule creators can delete"
  on time_capsules for delete
  using (created_by = auth.uid());

-- ============================================================
-- capsule_messages ポリシー
-- ============================================================

create policy "couple members can read capsule messages"
  on capsule_messages for select
  using (
    capsule_id in (
      select tc.id from time_capsules tc
      join couples c on c.id = tc.couple_id
      where c.partner1_id = auth.uid() or c.partner2_id = auth.uid()
    )
  );

create policy "authors can insert capsule messages"
  on capsule_messages for insert
  with check (
    author_id = auth.uid()
    and capsule_id in (
      select tc.id from time_capsules tc
      join couples c on c.id = tc.couple_id
      where c.partner1_id = auth.uid() or c.partner2_id = auth.uid()
    )
  );

create policy "authors can update own capsule messages"
  on capsule_messages for update
  using (author_id = auth.uid());

-- ============================================================
-- events テーブル
-- ============================================================

create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid references couples on delete cascade not null,
  title       varchar(200) not null,
  date        date not null,
  time_of_day time,
  location    varchar(200),
  memo        text,
  category    varchar(20) not null default 'その他',
  created_by  uuid references auth.users not null,
  created_at  timestamptz default now()
);

alter table events enable row level security;

create policy "couple members can read events"
  on events for select
  using (
    couple_id in (
      select id from couples
      where partner1_id = auth.uid() or partner2_id = auth.uid()
    )
  );

create policy "couple members can insert events"
  on events for insert
  with check (
    couple_id in (
      select id from couples
      where partner1_id = auth.uid() or partner2_id = auth.uid()
    )
    and created_by = auth.uid()
  );

create policy "couple members can update events"
  on events for update
  using (
    couple_id in (
      select id from couples
      where partner1_id = auth.uid() or partner2_id = auth.uid()
    )
  );

create policy "couple members can delete events"
  on events for delete
  using (
    couple_id in (
      select id from couples
      where partner1_id = auth.uid() or partner2_id = auth.uid()
    )
  );

-- ============================================================
-- join_couple RPC（招待コードで参加）
-- ============================================================

create or replace function join_couple(p_invite_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_couple couples;
begin
  select * into v_couple
  from couples
  where invite_code = upper(p_invite_code)
    and partner2_id is null
  limit 1;

  if not found then
    raise exception 'invite_code_not_found';
  end if;

  if v_couple.partner1_id = auth.uid() then
    raise exception 'cannot_join_own_couple';
  end if;

  update couples
  set partner2_id = auth.uid(), updated_at = now()
  where id = v_couple.id;

  select * into v_couple from couples where id = v_couple.id;
  return row_to_json(v_couple);
end;
$$;
