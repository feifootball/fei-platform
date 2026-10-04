create table if not exists public.diagnostic_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  submission_version text not null default '1.0.0',
  scoring_contract_version text not null default '1.0.0',
  objective_evidence jsonb not null default '[]'::jsonb,
  writing_task_id text not null,
  writing_response text not null,
  speaking_task_id text not null,
  speaking_audio_path text,
  speaking_media_type text,
  speaking_duration_seconds integer,
  status text not null default 'pending_evaluation'
    check (status in (
      'pending_evaluation',
      'human_review_required',
      'evaluated'
    )),
  created_at timestamptz not null default now(),
  submitted_at timestamptz not null default now()
);

create table if not exists public.diagnostic_production_evaluations (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.diagnostic_attempts(id) on delete cascade,
  skill text not null check (skill in ('writing', 'speaking')),
  version integer not null default 1 check (version > 0),
  evaluation_status text not null check (evaluation_status in (
    'assessed',
    'insufficient_evidence',
    'technical_unassessable',
    'pending_evaluation',
    'evaluation_error'
  )),
  evaluation_payload jsonb not null,
  evaluator_type text not null check (evaluator_type in (
    'human',
    'imported_model',
    'fixture'
  )),
  evaluator_id text,
  scoring_contract_version text not null default '1.0.0',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (attempt_id, skill, version)
);

create table if not exists public.diagnostic_results (
  attempt_id uuid primary key references public.diagnostic_attempts(id) on delete cascade,
  status text not null check (status in (
    'ready',
    'pending_production_evaluation',
    'human_review_required'
  )),
  level text check (level in ('A2', 'B1', 'B2', 'C1')),
  reason text not null,
  objective_evidence jsonb not null,
  objective_correct integer not null,
  objective_total integer not null,
  production_points integer,
  total_points integer,
  max_points integer not null,
  scoring_contract_version text not null default '1.0.0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists diagnostic_attempts_user_created_idx
  on public.diagnostic_attempts (user_id, created_at desc);

create index if not exists diagnostic_evaluations_attempt_skill_idx
  on public.diagnostic_production_evaluations (attempt_id, skill, version desc);

create index if not exists diagnostic_evaluations_created_by_idx
  on public.diagnostic_production_evaluations (created_by)
  where created_by is not null;

alter table public.diagnostic_attempts enable row level security;
alter table public.diagnostic_production_evaluations enable row level security;
alter table public.diagnostic_results enable row level security;

revoke all on table
  public.diagnostic_attempts,
  public.diagnostic_production_evaluations,
  public.diagnostic_results
from public, anon, authenticated;

grant usage on schema public to authenticated, service_role;
grant select, insert on table public.diagnostic_attempts to authenticated;
grant select on table
  public.diagnostic_production_evaluations,
  public.diagnostic_results
to authenticated;
grant all on table
  public.diagnostic_attempts,
  public.diagnostic_production_evaluations,
  public.diagnostic_results
to service_role;

drop policy if exists "Users can insert their own diagnostic attempts"
  on public.diagnostic_attempts;
create policy "Users can insert their own diagnostic attempts"
  on public.diagnostic_attempts
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own diagnostic attempts"
  on public.diagnostic_attempts;
create policy "Users can read their own diagnostic attempts"
  on public.diagnostic_attempts
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own production evaluations"
  on public.diagnostic_production_evaluations;
create policy "Users can read their own production evaluations"
  on public.diagnostic_production_evaluations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.diagnostic_attempts attempts
      where attempts.id = attempt_id
        and attempts.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can read their own diagnostic results"
  on public.diagnostic_results;
create policy "Users can read their own diagnostic results"
  on public.diagnostic_results
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.diagnostic_attempts attempts
      where attempts.id = attempt_id
        and attempts.user_id = (select auth.uid())
    )
  );

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'diagnostic-speaking',
  'diagnostic-speaking',
  false,
  15728640,
  array[
    'audio/webm',
    'audio/mp4',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'audio/x-m4a'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload their own diagnostic audio"
  on storage.objects;
create policy "Users can upload their own diagnostic audio"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'diagnostic-speaking'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can read their own diagnostic audio"
  on storage.objects;
create policy "Users can read their own diagnostic audio"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'diagnostic-speaking'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete failed diagnostic audio uploads"
  on storage.objects;
create policy "Users can delete failed diagnostic audio uploads"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'diagnostic-speaking'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
