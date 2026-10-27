import { Penguin } from "./penguin";

/** 企鵝阿爸＋對話框 */
export function PenguinSays({
  children,
  pose = "wave",
  className = "",
  bubbleClassName = "",
  penguinClassName = "h-28 w-24",
  side = "left",
}: {
  children: React.ReactNode;
  pose?: "wave" | "point" | "stand";
  className?: string;
  bubbleClassName?: string;
  penguinClassName?: string;
  side?: "left" | "right";
}) {
  return (
    <figure className={`flex items-end gap-2 ${side === "right" ? "flex-row-reverse" : ""} ${className}`}>
      <Penguin pose={pose} className={`shrink-0 ${penguinClassName}`} />
      <blockquote
        className={`relative mb-8 rounded-[20px] border-2 border-ink bg-paper px-4 py-3 text-[15px] font-bold leading-relaxed shadow-[0_5px_0_#BFE0CF] ${bubbleClassName}`}
      >
        <svg
          viewBox="0 0 20 16"
          className={`absolute -bottom-[13px] h-4 w-5 ${side === "right" ? "right-6 -scale-x-100" : "left-5"}`}
          aria-hidden="true"
        >
          <path d="M1 0c2 6 1 11-1 15 6-2 12-7 15-15" fill="#FFFDF7" stroke="#193A42" strokeWidth={2} strokeLinejoin="round" />
        </svg>
        <figcaption className="sr-only">企鵝阿爸說：</figcaption>
        {children}
      </blockquote>
    </figure>
  );
}
