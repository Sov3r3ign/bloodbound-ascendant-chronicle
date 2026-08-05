import { useEffect, useState } from "react";

const KEY = "bloodbound.prologue.seen";

const CHAPTERS: { title: string; body: string }[] = [
  {
    title: "I · The Weakest Rank",
    body:
      "When the black seam split the sky over AETHRYNDOR, gates began to open — and the world sorted its people by how much the gates feared them. Sovereign, Ascendant, Bound, Dross. You were measured at fourteen and stamped DROSS: the lowest rank, the porter grade, the ones sent in first because the guilds count them cheaply.",
  },
  {
    title: "II · The Floor You Did Not Leave",
    body:
      "Your party took a low-tier gate for a low-tier fee. It was not a low-tier gate. You remember the sound the ceiling made when it stopped being a ceiling, and the guild-captain's face as he sealed the door behind him with you on the wrong side. You bled out on cold stone with nineteen strangers, alone, unranked, unmourned.",
  },
  {
    title: "III · The Voice Beneath",
    body:
      "You did not die. Something under the floor — older than the gates, older than the guilds — opened one eye and found you interesting. 'You have no talent,' it said, almost kindly. 'So I will lend you mine. Every thing that falls before you is a debt owed to you. Collect it.' Your blood answered. It has been answering ever since.",
  },
  {
    title: "IV · The Bloodbound",
    body:
      "This is the ASCENDANT'S curse and gift: the dead you leave behind do not stay behind. Their strength settles into your marrow — a fraction of every kill, a shard of every Sovereign. You do not level as others level. You inherit. And with each inheritance the thing beneath the floor leans a little closer, watching what you become.",
  },
  {
    title: "V · Solo Descent",
    body:
      "No party will take you. No guild will insure you. You go down alone, floor by floor, because alone is the only way the debt pays out undivided. Somewhere below the last floor sits the throne of VRAEKHAL, the Hunger Beneath — and the only mortal it has ever bothered to name is you. Forge your bloodline. Bind your aspect. Begin the climb downward.",
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
