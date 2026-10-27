// 企鵝阿爸：導覽角色的暫代插畫（原創線稿）。
// 規格書要求沿用既有角色識別並取得授權；拿到正式素材後只要替換這個元件。

const INK = "#193A42";
const BODY = "#2E5560";
const BELLY = "#FFFDF7";
const SUN = "#F5D45E";
const TEAL = "#477D73";
const BLUSH = "#F2B39B";

type Pose = "wave" | "point" | "stand";

export function Penguin({ pose = "wave", className, title }: { pose?: Pose; className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 132 156"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <g strokeLinejoin="round" strokeLinecap="round" stroke={INK} strokeWidth={3}>
        <ellipse cx="62" cy="148" rx="36" ry="5.5" fill={INK} opacity={0.12} stroke="none" />
        <path d="M40 134c-6 10 2 13 9 13h10c5 0 5-6 1-10z" fill={SUN} />
        <path d="M84 134c6 10-2 13-9 13H65c-5 0-5-6-1-10z" fill={SUN} />
        <path d="M27 72c-14 28-10 48-4 56 6 5 11-1 11-6 0-20 2-34 6-44z" fill={BODY} />
        <path d="M62 12C32 12 21 42 21 74c0 38 13 66 41 66s41-28 41-66c0-32-11-62-41-62z" fill={BODY} />
        <path d="M62 50C42 50 36 74 36 96c0 26 10 37 26 37s26-11 26-37c0-22-6-46-26-46z" fill={BELLY} />
        <path d="M37 52c-3-18 9-27 25-19 16-8 28 1 25 19-4 11-15 12-25 7-10 5-21 4-25-7z" fill={BELLY} />
        <path d="M58 64h8l-1.5 4 4.5 20-7 7-7-7 4.5-20z" fill={TEAL} strokeWidth={2.5} />
        <ellipse cx="40" cy="60" rx="4.5" ry="2.6" fill={BLUSH} stroke="none" />
        <ellipse cx="84" cy="60" rx="4.5" ry="2.6" fill={BLUSH} stroke="none" />
        <circle cx="51" cy="45" r="3.8" fill={INK} stroke="none" />
        <circle cx="73" cy="45" r="3.8" fill={INK} stroke="none" />
        <circle cx="52.4" cy="43.6" r="1.2" fill="#fff" stroke="none" />
        <circle cx="74.4" cy="43.6" r="1.2" fill="#fff" stroke="none" />
        <circle cx="51" cy="45" r="9.5" fill="none" strokeWidth={2.6} />
        <circle cx="73" cy="45" r="9.5" fill="none" strokeWidth={2.6} />
        <path d="M60.5 44.5h3" fill="none" strokeWidth={2.6} />
        <path d="M55 56c5-3.6 9-3.6 14 0-4 7.4-10 7.4-14 0z" fill={SUN} strokeWidth={2.6} />
        {pose === "wave" && (
          <g className="penguin-wave" style={{ transformOrigin: "98px 76px", animation: "wave-hand 2.6s ease-in-out infinite" }}>
            <path d="M97 78c14-6 22-24 22-40-4-6-11-3-13 3-3 14-9 22-15 26z" fill={BODY} />
          </g>
        )}
        {pose === "point" && <path d="M98 74c12 0 24 4 30 10-1 6-8 7-12 4-6-3-12-4-19-3z" fill={BODY} />}
        {pose === "stand" && <path d="M97 72c14 28 10 48 4 56-6 5-11-1-11-6 0-20-2-34-6-44z" fill={BODY} />}
      </g>
    </svg>
  );
}
