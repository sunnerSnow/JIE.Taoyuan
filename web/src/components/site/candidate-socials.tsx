import { site } from "@/lib/site";

type Social = (typeof site.candidate.socials)[number];

/**
 * 候選人本人的社群帳號（另開新視窗）。本站是非官方網站，這些連結讓讀者直接看候選人自己的說法。
 * 一排細線圓框的圖示鈕（滑過的填色動態在 globals.css 的 .social-btn）；compact 用在首頁首屏、探索頁這類空間小的地方，預設是頁尾的大一號。
 */
export function CandidateSocials({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const name = site.candidate.name;
  return (
    <div className={`flex flex-wrap items-center ${compact ? "gap-1.5" : "gap-3"} ${className}`}>
      <p className={`font-black ${compact ? "mr-0.5 text-[12.5px] text-ink-soft" : "w-full text-[13.5px] tracking-[0.06em] text-ink"}`}>
        {compact ? "追蹤" : `追蹤${name}本人的帳號`}
      </p>
      <ul aria-label={`${name}的社群帳號`} className={`flex flex-wrap ${compact ? "gap-1.5" : "gap-2.5"}`}>
        {site.candidate.socials.map((s) => (
          <li key={s.key}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" title={`${name}的 ${s.name}`} className={`social-btn ${compact ? "h-9 w-9" : "h-11 w-11"}`}>
              <span className="social-fill" aria-hidden="true" />
              <span className="social-out" aria-hidden="true">
                <SocialIcon social={s} className={compact ? "h-[18px] w-[18px]" : "h-5 w-5"} />
              </span>
              <span className="social-in" aria-hidden="true">
                <SocialIcon social={s} className={compact ? "h-[18px] w-[18px]" : "h-5 w-5"} />
              </span>
              <span className="sr-only">
                {s.name}（{name}的帳號，另開新視窗）
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 單色的線條圖示（用 currentColor），只求一眼認得出來，不是各平台的官方標誌檔 */
function SocialIcon({ social, className }: { social: Social; className: string }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg viewBox="0 0 24 24" className={className}>
      {social.key === "threads" && (
        <path {...stroke} d="M16.2 11.3c-.4-2.7-2-4-4.3-4-2.6 0-4.3 1.9-4.3 4.7s1.7 4.7 4.3 4.7c1.9 0 3.4-1 3.4-2.7 0-2.3-2.7-2.8-5-2.3M18.6 17.6A8.5 8.5 0 1 1 20.5 12" />
      )}
      {social.key === "instagram" && (
        <>
          <rect {...stroke} x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle {...stroke} cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
        </>
      )}
      {social.key === "facebook" && <path {...stroke} d="M15.5 4.5h-1.8a3.6 3.6 0 0 0-3.6 3.6V20M7.5 11h7.5" />}
      {social.key === "youtube" && (
        <>
          <rect {...stroke} x="2.5" y="5.5" width="19" height="13" rx="4" />
          <path fill="currentColor" d="M10 9.3v5.4l4.6-2.7z" />
        </>
      )}
      {social.key === "line" && (
        <path
          {...stroke}
          d="M12 4.2c-4.9 0-8.8 3.1-8.8 7 0 3.5 3.1 6.4 7.3 6.9.6.1.7.4.6.9l-.2 1.4c0 .3.2.6.7.4 1.6-.7 9.2-5 9.2-9.6 0-3.9-3.9-7-8.8-7z"
        />
      )}
    </svg>
  );
}
