import Link from "next/link";
import { Suspense } from "react";
import { AdminLogin } from "@/components/wish/admin-client";
import { AdminWishCard, reasonLabel } from "@/components/wish/admin-wish";
import { wishConfig } from "@/lib/wish/config";
import { topicLabel, typeLabel, WISH_TYPES, type ModerationStatus } from "@/lib/wish/options";
import { isAdmin } from "@/lib/wish/security";
import { ADMIN_PAGE_SIZE, adminList, adminStats, type AdminQuery } from "@/lib/wish/store";
import { logout } from "./actions";

export default function AdminWishesPage({ searchParams }: PageProps<"/admin/wishes">) {
  return (
    <Suspense fallback={<p className="font-bold">載入中…</p>}>
      <AdminWishes searchParams={searchParams} />
    </Suspense>
  );
}

type SearchParams = Record<string, string | string[] | undefined>;

function parseAdmin(sp: SearchParams): AdminQuery {
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string).trim() : "");
  const status = one("status");
  const visibility = one("visibility");
  const page = Number(one("page"));
  return {
    status: status === "approved" || status === "rejected" || status === "hidden" ? (status as ModerationStatus) : null,
    visibility: visibility === "public" || visibility === "team_only" ? visibility : null,
    type: WISH_TYPES.find((t) => t.key === one("type"))?.key ?? null,
    reported: one("reported") === "1",
    q: one("q").slice(0, 40),
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

function adminHref(a: AdminQuery, patch: Partial<AdminQuery>) {
  const next = { ...a, page: 1, ...patch };
  const p = new URLSearchParams();
  if (next.status) p.set("status", next.status);
  if (next.visibility) p.set("visibility", next.visibility);
  if (next.type) p.set("type", next.type);
  if (next.reported) p.set("reported", "1");
  if (next.q) p.set("q", next.q);
  if (next.page > 1) p.set("page", String(next.page));
  const qs = p.toString();
  return qs ? `/admin/wishes?${qs}` : "/admin/wishes";
}

const select = "rounded-full border-2 border-edge bg-paper px-3 py-2 text-[14px] font-bold";

async function AdminWishes({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const cfg = wishConfig();
  if (!cfg.admin) {
    return <p className="rounded-2xl bg-sun-soft px-5 py-4 font-bold">後台還沒有設定：需要資料庫（DATABASE_URL）、WISH_SECRET（32 字以上）與 ADMIN_PASSWORD（12 字以上）。</p>;
  }
  if (!(await isAdmin())) {
    return (
      <>
        <h1 className="text-center text-[24px] font-black tracking-[0.08em]">登入後台</h1>
        <AdminLogin />
      </>
    );
  }

  const a = parseAdmin(await searchParams);
  const [stats, list] = await Promise.all([adminStats(), adminList(a)]);
  const t = stats.totals;
  const tiles: { label: string; n: number; href: string }[] = [
    { label: "全部留言", n: t.total, href: adminHref(a, { status: null, visibility: null, reported: false }) },
    { label: "公開中", n: t.public, href: adminHref(a, { status: "approved", visibility: "public", reported: false }) },
    { label: "只給團隊", n: t.team_only, href: adminHref(a, { status: "approved", visibility: "team_only", reported: false }) },
    { label: "自動擋下", n: t.rejected, href: adminHref(a, { status: "rejected", visibility: null, reported: false }) },
    { label: "已下架", n: t.hidden, href: adminHref(a, { status: "hidden", visibility: null, reported: false }) },
    { label: "公開中有檢舉", n: t.reported, href: adminHref(a, { status: "approved", visibility: null, reported: true }) },
  ];
  const pages = Math.max(1, Math.ceil(list.total / ADMIN_PAGE_SIZE));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[24px] font-black tracking-[0.08em]">留言管理</h1>
        <form action={logout}>
          <button type="submit" className="btn btn-sm">
            登出
          </button>
        </form>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((x) => (
          <li key={x.label}>
            <Link href={x.href} className="block rounded-2xl border-2 border-edge bg-paper px-4 py-3 hover:bg-mint">
              <span className="block text-[13px] font-bold text-ink-soft">{x.label}</span>
              <span className="font-display text-[26px] leading-tight">{x.n}</span>
            </Link>
          </li>
        ))}
      </ul>

      <details className="mt-4 rounded-2xl border-2 border-edge bg-paper px-5 py-3">
        <summary className="cursor-pointer text-[15px] font-black">統計（不含自動擋下與已下架）</summary>
        <div className="mt-3 grid gap-5 text-[14px] sm:grid-cols-2 lg:grid-cols-4">
          <Breakdown title="類型" rows={stats.byType.map((r) => ({ label: typeLabel(r.key), n: r.n }))} />
          <Breakdown title="議題" rows={stats.byTopic.map((r) => ({ label: topicLabel(r.key) || "未選", n: r.n }))} />
          <Breakdown title="行政區" rows={stats.byDistrict.map((r) => ({ label: r.key || "未選", n: r.n }))} />
          <Breakdown title="自動擋下的原因" rows={stats.byReason.map((r) => ({ label: reasonLabel(r.key) || "未記錄", n: r.n }))} />
        </div>
        {stats.top.length > 0 && (
          <div className="mt-4 text-[14px]">
            <h2 className="font-black">最多人認同</h2>
            <ol className="mt-1 list-decimal space-y-1 pl-5">
              {stats.top.map((w) => (
                <li key={w.id}>
                  <Link href={`/admin/wishes/${w.id}`} className="link-ink">
                    {w.title ?? w.content.slice(0, 30)}
                  </Link>{" "}
                  （{w.likeCount}）
                </li>
              ))}
            </ol>
          </div>
        )}
      </details>

      <form action="/admin/wishes" className="mt-6 flex flex-wrap items-end gap-2">
        <select name="status" defaultValue={a.status ?? ""} className={select} aria-label="審核狀態">
          <option value="">全部狀態</option>
          <option value="approved">公開中／只給團隊</option>
          <option value="rejected">自動擋下</option>
          <option value="hidden">已下架</option>
        </select>
        <select name="visibility" defaultValue={a.visibility ?? ""} className={select} aria-label="公開方式">
          <option value="">全部公開方式</option>
          <option value="public">公開</option>
          <option value="team_only">只給團隊</option>
        </select>
        <select name="type" defaultValue={a.type ?? ""} className={select} aria-label="類型">
          <option value="">全部類型</option>
          {WISH_TYPES.map((x) => (
            <option key={x.key} value={x.key}>
              {x.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 px-2 text-[14px] font-bold">
          <input type="checkbox" name="reported" value="1" defaultChecked={a.reported} className="h-4 w-4 accent-teal-deep" />
          有檢舉
        </label>
        <input type="search" name="q" defaultValue={a.q} placeholder="關鍵字或留言代碼" className={`${select} min-w-48 flex-1`} aria-label="關鍵字" />
        <button type="submit" className="btn btn-sm btn-ink">
          篩選
        </button>
      </form>

      <p className="mt-4 text-[14px] font-bold text-ink-soft">共 {list.total} 則</p>
      <ul className="mt-3 space-y-4">
        {list.items.map((w) => (
          <li key={w.id}>
            <AdminWishCard wish={w} />
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <nav className="mt-6 flex flex-wrap gap-2" aria-label="分頁">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={adminHref(a, { page: p })} aria-current={p === a.page ? "page" : undefined} className={`btn btn-sm ${p === a.page ? "btn-ink" : ""}`}>
              {p}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}

function Breakdown({ title, rows }: { title: string; rows: { label: string; n: number }[] }) {
  return (
    <div>
      <h2 className="font-black">{title}</h2>
      {rows.length ? (
        <ul className="mt-1 space-y-0.5">
          {rows.map((r) => (
            <li key={r.label} className="flex justify-between gap-3">
              <span>{r.label}</span>
              <span className="font-display">{r.n}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-ink-soft">還沒有資料</p>
      )}
    </div>
  );
}
