import { useEffect, useState } from "react";

const KEY = "bloodbound.prologue.seen";

const CHAPTERS: { title: string; body: string }[] = [
  {
    title: "I · The World That Was",
    body:
      "Long before the first dungeon drew breath, there was AETHRYNDOR — a continent of nine cradles, where bloodlines were not metaphor but inheritance written in marrow. Dragons made pacts with mountains. The fae bartered with mirrors. Giants slept under cities that mistook them for hills.",
  },
  {
    title: "II · The Sundering",
    body:
      "The Sovereigns of Aethryndor grew vain. They tried to bind a god of endings into a coin, and the coin bit back. The sky cracked along a single black seam, and from that seam fell the First Dungeon — not built, but born. It ate three kingdoms before anyone learned its name: VRAEKHAL, the Hunger Beneath.",
  },
  {
    title: "III · The Bloodbound",
    body:
      "Vraekhal did not kill all who entered. Some it changed. Their blood began to sing — to answer the dungeon, to remember it. These are the ASCENDANTS: mortals whose lineage the dark recognizes, and challenges, and rewards. Every floor they survive, the dungeon learns them better. Every gift they accept, it watches more closely.",
  },
  {
    title: "IV · Your Pact",
    body:
      "You are the latest to feel the call. The Sovereigns are long dust; only the Ascendants stand between Aethryndor and the second seam. Forge your bloodline. Bind your aspect. Accept the resonance that finds you. The dungeon is awake — and it has been waiting for someone exactly like you.",
  },
];

export function PrologueModal() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  function close() {
    try { localStorage.setItem(KEY, "1"); } catch {}
    setOpen(false);
  }

  if (!open) return null;
  const chapter = CHAPTERS[page];
  const isLast = page === CHAPTERS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm px-4 py-8 animate-in fade-in duration-500"
      role="dialog"
      aria-modal="true"
      aria-label="The Chronicle of Aethryndor"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-arcane opacity-20 blur-3xl animate-rune" />
      </div>

      <div className="relative w-full max-w-2xl rounded-sm border border-arcane/40 bg-card/95 shadow-arcane">
        <div className="border-b border-border/60 px-8 py-5 text-center">
          <div className="font-display text-[10px] tracking-[0.5em] text-arcane">THE CHRONICLE OF</div>
          <div className="mt-2 font-display text-3xl tracking-[0.3em] text-glow">AETHRYNDOR</div>
        </div>

        <div className="px-8 py-8 min-h-[280px]">
          <h2 className="font-display text-sm tracking-[0.3em] text-arcane">{chapter.title.toUpperCase()}</h2>
          <p className="mt-5 font-serif text-base leading-relaxed text-foreground/90 italic">
            {chapter.body}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border/60 px-8 py-5">
          <div className="flex items-center gap-2">
            {CHAPTERS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-sm transition-all ${
                  i === page ? "bg-arcane shadow-[0_0_8px_oklch(0.7_0.18_280)]" : i < page ? "bg-arcane/40" : "bg-border"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={close}
              className="font-display text-[10px] tracking-[0.3em] text-muted-foreground hover:text-foreground"
            >
              SKIP
            </button>
            {!isLast ? (
              <button
                onClick={() => setPage((p) => p + 1)}
                className="rounded-sm border border-arcane/40 bg-gradient-arcane px-6 py-2 font-display text-xs tracking-[0.3em] text-bone shadow-arcane hover:scale-[1.02] transition-transform"
              >
                CONTINUE →
              </button>
            ) : (
              <button
                onClick={close}
                className="rounded-sm border border-blood/50 bg-blood/20 px-6 py-2 font-display text-xs tracking-[0.3em] text-bone hover:bg-blood/30"
              >
                ACCEPT THE PACT
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
