// 杰個願望的資料庫：正式站用 Neon（HTTP 查詢，適合 serverless），本機測試用 PGlite。
// 資料表第一次連線時自動建立（IF NOT EXISTS），不需要另外跑 migration。
import { neon } from "@neondatabase/serverless";
import { wishConfig } from "./config";

export type Row = Record<string, unknown>;
export type Query = (text: string, params?: unknown[]) => Promise<Row[]>;

const SCHEMA = [
  `create table if not exists wishes (
    id text primary key,
    type text not null check (type in ('encouragement', 'wish', 'message', 'proposal')),
    title text,
    content text not null,
    topic text,
    district text,
    display_name text,
    visibility text not null check (visibility in ('public', 'team_only')),
    moderation_status text not null check (moderation_status in ('approved', 'rejected', 'hidden')),
    moderation_reason text,
    response_status text not null default 'none' check (response_status in ('none', 'received', 'replied', 'tracking', 'updated')),
    like_count integer not null default 0,
    report_count integer not null default 0,
    reports_cleared_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,
  `alter table wishes add column if not exists sticker text`,
  `create index if not exists wishes_public_created on wishes (created_at desc) where moderation_status = 'approved' and visibility = 'public'`,
  `create index if not exists wishes_created on wishes (created_at desc)`,
  `create table if not exists wish_replies (
    id text primary key,
    wish_id text not null references wishes (id) on delete cascade,
    content text not null,
    link_url text,
    link_label text,
    created_at timestamptz not null default now()
  )`,
  `create index if not exists wish_replies_wish on wish_replies (wish_id, created_at)`,
  `create table if not exists wish_likes (
    wish_id text not null references wishes (id) on delete cascade,
    visitor_id text not null,
    ip_hash text not null,
    created_at timestamptz not null default now(),
    primary key (wish_id, visitor_id)
  )`,
  `create index if not exists wish_likes_ip on wish_likes (wish_id, ip_hash)`,
  `create table if not exists wish_reports (
    wish_id text not null references wishes (id) on delete cascade,
    visitor_id text not null,
    ip_hash text not null,
    reason text not null,
    created_at timestamptz not null default now(),
    primary key (wish_id, visitor_id)
  )`,
  `create table if not exists wish_moderation_logs (
    id bigint generated always as identity primary key,
    wish_id text not null,
    action text not null,
    note text,
    created_at timestamptz not null default now()
  )`,
  `create index if not exists wish_logs_wish on wish_moderation_logs (wish_id, created_at desc)`,
  `create table if not exists wish_rate (
    bucket text not null,
    ip_hash text not null,
    created_at timestamptz not null default now()
  )`,
  `create index if not exists wish_rate_lookup on wish_rate (bucket, ip_hash, created_at)`,
];

let ready: Promise<Query> | null = null;

/** 取得查詢函式；第一次呼叫時連線並建立資料表 */
export function db(): Promise<Query> {
  ready ??= connect().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

async function connect(): Promise<Query> {
  const cfg = wishConfig();
  let query: Query;
  if (cfg.db === "neon" && cfg.databaseUrl) {
    const sql = neon(cfg.databaseUrl);
    query = (text, params = []) => sql.query(text, params) as Promise<Row[]>;
  } else if (cfg.db === "pglite") {
    // 只有本機測試會走到這裡；不讓打包工具追蹤這個套件，正式站的函式不會帶上它
    const name = "@electric-sql/pglite";
    const { PGlite } = await import(/* turbopackIgnore: true */ /* webpackIgnore: true */ name);
    const pg = new PGlite();
    query = async (text, params = []) => (await pg.query(text, params)).rows as Row[];
  } else {
    throw new Error("杰個願望還沒有設定資料庫（DATABASE_URL）");
  }
  for (const statement of SCHEMA) await query(statement);
  return query;
}
