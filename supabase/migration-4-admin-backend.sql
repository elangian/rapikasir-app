-- REVIEW ONLY: apply to isolated staging after architecture approval.
-- Requires migration 3. Apply before deploying the admin Edge Function.
-- No memberships are created; only an explicitly approved operator may grant one.
begin;
create schema if not exists rapikasir_private;
revoke all on schema rapikasir_private from public, anon, authenticated;

create table if not exists rapikasir_private.admin_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role = 'admin'),
  enabled boolean not null default true,
  granted_at timestamptz not null default now()
);
create table if not exists rapikasir_private.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null,
  store_id uuid not null,
  action text not null check (action = 'set_store_tier'),
  previous_tier text not null,
  next_tier text not null,
  reason text not null check (length(trim(reason)) between 8 and 500),
  created_at timestamptz not null default now()
);
create index if not exists admin_audit_actor_time on rapikasir_private.admin_audit_log(actor_id, created_at desc);
alter table rapikasir_private.admin_memberships enable row level security;
alter table rapikasir_private.admin_audit_log enable row level security;
revoke all on rapikasir_private.admin_memberships, rapikasir_private.admin_audit_log from public, anon, authenticated, service_role;

-- These RPCs are callable ONLY by the trusted server. Actor ID must come from
-- Auth.getUser(token) verification in the Edge Function, never request payloads.
create or replace function public.admin_list_stores(p_actor_id uuid, p_offset integer default 0, p_limit integer default 50)
returns table (id uuid, store_name text, owner_name text, category_label text, tier text, onboarded boolean, created_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from rapikasir_private.admin_memberships m where m.user_id = p_actor_id and m.role = 'admin' and m.enabled) then
    raise exception 'Admin access denied' using errcode = '42501';
  end if;
  if p_offset is null or p_limit is null or p_offset < 0 or p_offset > 10000 or p_limit < 1 or p_limit > 100 then
    raise exception 'Invalid pagination' using errcode = '22023';
  end if;
  return query select s.id,s.store_name,s.owner_name,s.category_label,s.tier,s.onboarded,s.created_at
    from public.stores s order by s.id offset p_offset limit p_limit;
end;
$$;

create or replace function public.admin_set_store_tier(p_actor_id uuid, p_store_id uuid, p_tier text, p_reason text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare previous text; event_id uuid;
begin
  -- Serialize actions by actor, including rate-limit checks and role revocation.
  perform 1 from rapikasir_private.admin_memberships m where m.user_id = p_actor_id and m.role = 'admin' and m.enabled for update;
  if not found then raise exception 'Admin access denied' using errcode = '42501'; end if;
  if p_tier is null or p_tier not in ('FREE','TRIAL','PRO','BUSINESS') or p_reason is null or length(trim(p_reason)) not between 8 and 500 then
    raise exception 'Invalid tier or reason' using errcode = '22023';
  end if;
  if (select count(*) from rapikasir_private.admin_audit_log a where a.actor_id = p_actor_id and a.created_at > now() - interval '1 minute') >= 30 then
    raise exception 'Admin rate limit reached' using errcode = 'P4290';
  end if;
  select s.tier into previous from public.stores s where s.id = p_store_id for update;
  if not found then raise exception 'Store not found' using errcode = 'P0002'; end if;
  update public.stores set tier = p_tier where id = p_store_id;
  insert into rapikasir_private.admin_audit_log(actor_id,store_id,action,previous_tier,next_tier,reason)
    values (p_actor_id,p_store_id,'set_store_tier',previous,p_tier,trim(p_reason)) returning id into event_id;
  return jsonb_build_object('storeId',p_store_id,'tier',p_tier,'auditId',event_id);
end;
$$;
revoke all on function public.admin_list_stores(uuid,integer,integer) from public, anon, authenticated;
revoke all on function public.admin_set_store_tier(uuid,uuid,text,text) from public, anon, authenticated;
grant execute on function public.admin_list_stores(uuid,integer,integer) to service_role;
grant execute on function public.admin_set_store_tier(uuid,uuid,text,text) to service_role;
commit;
