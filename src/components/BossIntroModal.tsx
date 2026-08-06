import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { beastImage } from "@/lib/beast-images";
import { bossIntroFor } from "@/lib/boss-intros";

type Props = {
  bossName: string;
  level: number;
  onClose: () => void;
};

export function BossIntroModal({ bossName, level, onClose }: Props) {
  const intro = bossIntroFor(bossName);
  const [i, setI] = useState(0);
  const [showTelegraphs, setShowTelegraphs] = useState(false);

  const beats = intro?.beats ?? [];
  const last = i >= beats.length - 1;

  const advance = () => {
    if (!intro) return onClose();
    if (!last) setI((n) => n + 1);
    else if (!showTelegraphs) setShowTelegraphs(true);
    else onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (e.key === "Escape") onClose();
        else advance();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  });

  if (!intro || typeof document === "undefined") return null;

  const beat = beats[Math.min(i, beats.length - 1)];
  const img = beastImage(bossName);
  const t = intro.theme;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-start sm:items-center justify-center overflow-y-auto bg-black/95 p-3 sm:p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={`${intro.name} — pre-fight`}
    >
      <div className={`relative my-auto w-full max-w-2xl overflow-hidden rounded-sm border bg-card shadow-deep ${t.border}`}>
        {/* Cinematic still */}
        <div className="relative h-44 overflow-hidden border-b border-border/50 sm:h-64">
          {img && (
            <img
              src={img}
              alt={intro.name}
              width={1024}
              height={640}
              className="h-full w-full object-cover transition-all duration-700"
              style={{
                transform: beat.shot === "close" ? "scale(1.35)" : beat.shot === "black" ? "scale(1.05)" : "scale(1)",
                opacity: beat.shot === "black" ? 0.18 : 0.75,
                objectPosition: "center 35%",
              }}
            />
          )}
          <div className="pointer-events-none absolute inset-0" style={{ background: t.vignette }} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent" />

          {/* letterbox bars */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-background/90" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-background/90" />

          <div className="absolute inset-x-0 bottom-7 px-5 text-center">
            <div className={`font-mono text-[9px] tracking-[0.45em] ${t.accent}`}>{intro.threat}</div>
            <h2 className={`mt-0.5 font-display text-2xl tracking-widest text-glow sm:text-3xl ${t.accent} animate-flicker`}>
              {intro.name.toUpperCase()}
            </h2>
            <div className="font-serif text-[11px] italic text-muted-foreground">
              {intro.epithet} · LEVEL {level}
            </div>
          </div>
        </div>

        <div className={`px-5 py-5 sm:px-7 ${t.wash}`}>
          {!showTelegraphs ? (
            <div key={i} className="animate-float-up">
              <div className={`font-display text-[10px] tracking-[0.4em] ${t.accent}`}>{beat.speaker}</div>
              <p className="mt-2 min-h-[5.5rem] font-serif text-sm italic leading-relaxed text-foreground/90 sm:text-base">
                {beat.line}
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                {beats.map((_, n) => (
                  <span
                    key={n}
                    className={`h-1 flex-1 rounded-full transition-colors ${n <= i ? "bg-current opacity-80" : "bg-border opacity-40"} ${t.accent}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="animate-float-up">
              <div className={`font-display text-[10px] tracking-[0.4em] ${t.accent}`}>TELEGRAPHED MECHANICS</div>
              <p className="mt-1 font-serif text-[11px] italic text-muted-foreground">
                What it will do, and when. Read it once — the arena does not pause again.
              </p>
              <div className="mt-3 grid gap-2">
                {intro.telegraphs.map((tg, n) => (
                  <div key={n} className={`rounded-sm border bg-background/40 p-3 ${t.border}`}>
                    <div className={`font-mono text-[10px] tracking-widest ${t.accent}`}>⚑ {tg.cue.toUpperCase()}</div>
                    <div className="mt-1 font-serif text-sm text-foreground/90">{tg.effect}</div>
                    <div className="mt-1 font-mono text-[10px] text-ember">COUNTER — {tg.counter}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={advance}
              autoFocus
              className={`flex-1 rounded-sm border px-4 py-2.5 font-display text-xs tracking-[0.4em] transition-colors hover:text-glow ${t.border} ${t.accent} bg-background/40 hover:bg-background/70`}
            >
              {showTelegraphs ? "ENTER THE ARENA — [SPACE]" : last ? "READ ITS TELLS — [SPACE]" : "CONTINUE — [SPACE]"}
            </button>
            {!showTelegraphs && (
              <button
                onClick={() => setShowTelegraphs(true)}
                className="rounded-sm border border-border/60 px-4 py-2.5 font-mono text-[10px] tracking-widest text-muted-foreground transition-colors hover:border-border hover:text-bone"
              >
                SKIP CINEMATIC
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
