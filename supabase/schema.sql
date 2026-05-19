create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  memo text,
  status text not null default 'draft',
  slide_count integer not null default 5,
  include_cover boolean not null default true,
  include_cta boolean not null default true,
  ai_model text,
  ai_input jsonb,
  ai_output jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists slides (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  slide_order integer not null,
  slide_type text not null,
  title text not null,
  subtitle text,
  body text,
  hook text,
  bullets jsonb,
  image_mode text not null default 'single',
  image_url text,
  image_urls jsonb,
  image_query text,
  image_source_url text,
  source_label text,
  layout_settings jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists image_candidates (
  id uuid primary key default gen_random_uuid(),
  slide_id uuid not null references slides(id) on delete cascade,
  image_url text not null,
  thumbnail_url text,
  source_url text,
  source_label text,
  width integer,
  height integer,
  score numeric,
  is_selected boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists generated_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  asset_type text not null,
  file_name text not null,
  file_url text,
  storage_path text,
  created_at timestamptz not null default now()
);
