import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { FloorChoice } from "@/lib/floor-events";
import { getNpcTemplate } from "@/lib/npcs";

type Props = {
  templateId: string;
  onChoice: (choice: FloorChoice) => void;
  onClose: () => void;
};

const TONE_CLASS: Record<string, { accent: string; border: string; glow: string }> = {
  blood: { accent: "text-blood", border: "border-blood/60", glow: "text-glow" },
  ember: { accent: "text-ember", border: "border-ember/60", glow: "text-glow-ember" },
  arcane: { accent: "text-arcane", border: "border-arcane/60", glow: "text-glow" },
  bone: { accent: "text-bone", border: "border-bone/60", glow: "text-glow" },
};

export function NpcDialogueModal({ templateId, onChoice, onClose }: Props) {
  const tpl = getNpcTemplate(templateId);
  const [resolved, setResolved] = useState<FloorChoice | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (resolved) { e.preventDefault(); e.stopPropagation(); onClose(); }
      } else if (e.key === "Enter" || e.key === " ") {
        if (resolved) { e.preventDefault(); e.stopPropagation(); onClose(); }
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [resolved, onClose]);

  if (!tpl) return null;
  if (typeof document === "undefined") return null;

  const t = TONE_CLASS[tpl.tone] ?? TONE_CLASS.bone;

  const pick = (c: FloorChoice) => {
    setResolved(c);
    onChoice(c);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Encounter: ${tpl.name}`}
    >
      <div className={`relative w-full max-w-xl my-auto flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden rounded-sm border ${t.border} bg-card shadow-rune`}>
        <div className={`border-b ${t.border} px-6 py-4 text-center shrink-0`}>
          <div className={`font-display text-[10px] tracking-[0.5em] ${t.accent} animate-flicker`}>◆ AN ENCOUNTER ◆</div>
          <h2 className={`mt-1 font-display text-2xl tracking-widest ${t.accent} ${t.glow}`}>{tpl.name.toUpperCase()}</h2>
          <div className="mt-0.5 font-serif text-xs italic text-muted-foreground">{tpl.npc}</div>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1">
          <p className="font-serif text-sm italic leading-relaxed text-foreground/90">{tpl.prompt}</p>

          {!resolved ? (
            <div className="mt-5 grid gap-2">
              {tpl.choices.map((c, i) => (
                <button
                  key={i}
                  onClick={() => pick(c)}
                  className={`group rounded-sm border ${t.border} bg-background/40 px-3 py-2 text-left transition-colors hover:bg-white/5`}
                >
                  <div className={`font-display text-xs tracking-widest ${t.accent} group-hover:${t.glow}`}>
                    {c.label.toUpperCase()}
                  </div>
                  {c.hint && (
                    <div className="mt-0.5 font-mono text-[10px] text-ember">{c.hint}</div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-sm border border-ember/40 bg-ember/5 p-3">
              <div className="font-display text-[10px] tracking-widest text-ember">OUTCOME</div>
              <p className="mt-1 font-serif text-sm italic text-foreground/90">{resolved.outcome}</p>
            </div>
          )}
        </div>

        <div className="border-t border-border/60 px-6 py-4 shrink-0">
          <button
            onClick={onClose}
            disabled={!resolved}
            className={`w-full rounded-sm border ${t.border} bg-white/5 px-4 py-2 font-display text-xs tracking-[0.4em] ${t.accent} transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40`}
            autoFocus
          >
            {resolved ? "MOVE ON — [SPACE]" : "CHOOSE YOUR ANSWER"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
