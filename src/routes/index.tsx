import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { HowToPlayModal } from "@/components/HowToPlayModal";
import { isMuted, setMuted, sfx, unlockSfx } from "@/lib/sfx";
import { loadMeta, saveMeta, defaultMeta } from "@/lib/meta-storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Bloodbound Ascendants — Main Menu" },
      { name: "description", content: "Forge a Bloodbound Ascendant, raid living dungeons, and bend fate in a narrative-driven dark fantasy RPG." },
      { property: "og:title", content: "The Bloodbound Ascendants" },
      { property: "og:description", content: "Forge a Bloodbound Ascendant, raid living dungeons, and bend fate." },
    ],
  }),
  component: MainMenu,
});

const SPLASH_KEY = "bloodbound.splash.seen";

function MainMenu() {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(false);
  const [splashStage, setSplashStage] = useState<0 | 1 | 2 | 3>(0);
  const [howto, setHowto] = useState(false);
  const [options, setOptions] = useState(false);

  const hasSave = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      return !!localStorage.getItem("bloodbound.character") || !!loadMeta().lastRun;
    } catch {
      return false;
    }
  }, [options]); // recompute after possible reset

  // Splash on first visit
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (!sessionStorage.getItem(SPLASH_KEY)) {
        setShowSplash(true);
        sessionStorage.setItem(SPLASH_KEY, "1");
        const t1 = setTimeout(() => setSplashStage(1), 500);
        const t2 = setTimeout(() => setSplashStage(2), 1600);
        const t3 = setTimeout(() => setSplashStage(3), 2800);
        const t4 = setTimeout(() => setShowSplash(false), 4200);
        return () => { [t1, t2, t3, t4].forEach(clearTimeout); };
      }
    } catch {}
  }, []);

  function onNew() {
    sfx("ui");
    // fresh run: keep meta shards, clear character so forge starts clean
    try { localStorage.removeItem("bloodbound.character"); } catch {}
    navigate({ to: "/create" });
  }
  function onLoad() {
    if (!hasSave) return;
    sfx("ui");
    navigate({ to: "/dungeon" });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-arcane opacity-20 blur-3xl animate-rune" />
        <div className="absolute right-[10%] top-[20%] h-40 w-40 rounded-full bg-blood/20 blur-3xl" />
        <div className="absolute left-[8%] bottom-[15%] h-56 w-56 rounded-full bg-ember/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />
      </div>

      {/* Menu */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-3 font-display text-[10px] tracking-[0.6em] text-arcane animate-fade-in">
          ⋄  AETHRYNDOR  ⋄
        </div>
        <h1 className="font-display text-4xl leading-tight text-glow sm:text-6xl md:text-7xl animate-fade-in">
          THE BLOODBOUND
          <br />
          <span className="text-arcane">ASCENDANTS</span>
        </h1>
        <div className="mx-auto mt-5 flex items-center gap-3 text-arcane/60">
          <span className="h-px w-16 bg-arcane/40" />
          <span className="animate-flicker">✦</span>
          <span className="h-px w-16 bg-arcane/40" />
        </div>
        <p className="mt-6 max-w-lg font-serif text-sm italic text-muted-foreground sm:text-base">
          "The dungeon is awake — and it has been waiting for someone exactly like you."
        </p>

        <nav className="mt-12 flex w-full max-w-sm flex-col gap-3">
          <MenuButton primary onClick={onNew} label="NEW GAME" hint="Forge a fresh Ascendant" />
          <MenuButton
            onClick={onLoad}
            disabled={!hasSave}
            label="LOAD GAME"
            hint={hasSave ? "Resume your last descent" : "No saved run found"}
          />
          <MenuButton onClick={() => { sfx("ui"); setOptions(true); }} label="OPTIONS" hint="Sound & progression" />
          <MenuButton onClick={() => { sfx("ui"); setHowto(true); }} label="INFO" hint="How to play & primer" />
          <Link
            to="/codex"
            onClick={() => sfx("ui")}
            className="mt-2 font-display text-[10px] tracking-[0.4em] text-muted-foreground hover:text-arcane transition-colors"
          >
            OPEN THE CODEX →
          </Link>
        </nav>

        <div className="mt-14 font-display text-[9px] tracking-[0.4em] text-muted-foreground/60">
          ◆ v1 · A LIVING-DUNGEON RPG ◆
        </div>
      </div>

      {/* Splash */}
      {showSplash && <TitleSplash stage={splashStage} onSkip={() => setShowSplash(false)} />}

      {/* Info modal */}
      <HowToPlayModal open={howto} onClose={() => setHowto(false)} />

      {/* Options modal */}
      {options && <OptionsModal onClose={() => setOptions(false)} />}
    </div>
  );
}

function MenuButton({
  onClick, label, hint, primary, disabled,
}: {
  onClick: () => void;
  label: string;
  hint?: string;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative w-full rounded-sm border px-6 py-3.5 font-display tracking-[0.35em] transition-all
        ${disabled
          ? "cursor-not-allowed border-border/40 bg-card/30 text-muted-foreground/40"
          : primary
            ? "border-arcane/50 bg-gradient-arcane text-bone shadow-arcane hover:scale-[1.02]"
            : "border-border bg-card/50 text-foreground/90 hover:border-arcane/60 hover:bg-arcane/10 hover:text-arcane"}`}
    >
      <span className="text-sm">{label}</span>
      {hint && (
        <span className={`mt-1 block font-serif text-[10px] italic tracking-normal ${disabled ? "text-muted-foreground/40" : "text-muted-foreground group-hover:text-foreground/80"}`}>
          {hint}
        </span>
      )}
      {!disabled && (
        <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-arcane opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">◆</span>
      )}
    </button>
  );
}

function TitleSplash({ stage, onSkip }: { stage: 0 | 1 | 2 | 3; onSkip: () => void }) {
  useEffect(() => {
    unlockSfx();
    if (stage === 1) sfx("shrine");
    if (stage === 2) sfx("ascend");
  }, [stage]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      onClick={onSkip}
      className="fixed inset-0 z-[200] flex cursor-pointer items-center justify-center overflow-hidden bg-background"
      role="dialog"
      aria-label="Title splash"
    >
      {/* pulsing rune halo */}
      <div className={`pointer-events-none absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-arcane blur-3xl transition-opacity duration-[1200ms] ${stage >= 1 ? "opacity-40" : "opacity-0"}`} />
      <div className={`pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blood/40 blur-3xl transition-opacity duration-[1200ms] ${stage >= 2 ? "opacity-70" : "opacity-0"}`} />

      <div className="relative flex flex-col items-center px-6 text-center">
        <div
          className={`font-display text-6xl text-arcane transition-all duration-[900ms] ${stage >= 1 ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-75"}`}
          style={{ textShadow: "0 0 40px oklch(0.7 0.18 280 / 0.8)" }}
        >
          ✦
        </div>
        <h1
          className={`mt-6 font-display text-4xl leading-tight tracking-[0.15em] transition-all duration-[1200ms] sm:text-6xl md:text-7xl ${stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ textShadow: "0 0 24px oklch(0.7 0.18 280 / 0.6)" }}
        >
          <span className="text-bone">THE BLOODBOUND</span>
          <br />
          <span className="text-arcane">ASCENDANTS</span>
        </h1>
        <div className={`mt-8 font-display text-[10px] tracking-[0.5em] text-muted-foreground transition-opacity duration-700 ${stage >= 3 ? "opacity-100" : "opacity-0"}`}>
          — CLICK ANYWHERE TO CONTINUE —
        </div>
      </div>
    </div>,
    document.body,
  );
}

function OptionsModal({ onClose }: { onClose: () => void }) {
  const [muted, setMutedState] = useState<boolean>(() => (typeof window !== "undefined" ? isMuted() : false));
  const [confirmRun, setConfirmRun] = useState(false);
  const [confirmMeta, setConfirmMeta] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  function toast(m: string) {
    setFlash(m);
    setTimeout(() => setFlash(null), 1800);
  }

  function toggleMute() {
    const v = !muted;
    setMuted(v);
    setMutedState(v);
    if (!v) sfx("ui");
  }

  function resetRun() {
    try {
      localStorage.removeItem("bloodbound.character");
    } catch {}
    setConfirmRun(false);
    toast("Current run cleared.");
  }

  function resetMeta() {
    try {
      localStorage.removeItem("bloodbound.character");
      saveMeta(defaultMeta());
    } catch {}
    setConfirmMeta(false);
    toast("All progression erased.");
  }

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto bg-background/95 px-4 py-8 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Options"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-sm border border-arcane/40 bg-card/95 shadow-arcane"
      >
        <div className="border-b border-border/60 px-6 py-4 text-center">
          <div className="font-display text-[10px] tracking-[0.5em] text-arcane">SETTINGS</div>
          <div className="mt-2 font-display text-2xl tracking-[0.3em] text-glow">OPTIONS</div>
        </div>

        <div className="space-y-5 px-6 py-6">
          {/* Audio */}
          <section>
            <div className="mb-2 font-display text-[10px] tracking-[0.4em] text-arcane">AUDIO</div>
            <div className="flex items-center justify-between rounded-sm border border-border bg-background/40 px-4 py-3">
              <div>
                <div className="font-display text-xs tracking-[0.2em]">MASTER SOUND</div>
                <div className="font-serif text-[11px] italic text-muted-foreground">
                  {muted ? "The dungeon is silent." : "The dungeon hums with hunger."}
                </div>
              </div>
              <button
                onClick={toggleMute}
                className={`rounded-sm border px-4 py-2 font-display text-[10px] tracking-[0.3em] transition-colors ${
                  muted ? "border-border text-muted-foreground hover:text-foreground" : "border-arcane/50 bg-arcane/20 text-bone"
                }`}
              >
                {muted ? "MUTED" : "ON"}
              </button>
            </div>
          </section>

          {/* Progression */}
          <section>
            <div className="mb-2 font-display text-[10px] tracking-[0.4em] text-blood">PROGRESSION</div>
            <div className="space-y-2">
              <button
                onClick={() => setConfirmRun(true)}
                className="w-full rounded-sm border border-border bg-background/40 px-4 py-3 text-left transition-colors hover:border-ember/50 hover:bg-ember/10"
              >
                <div className="font-display text-xs tracking-[0.2em] text-ember">RESET CURRENT RUN</div>
                <div className="font-serif text-[11px] italic text-muted-foreground">Clears the forged Ascendant. Shards & unlocks kept.</div>
              </button>
              <button
                onClick={() => setConfirmMeta(true)}
                className="w-full rounded-sm border border-border bg-background/40 px-4 py-3 text-left transition-colors hover:border-blood/60 hover:bg-blood/10"
              >
                <div className="font-display text-xs tracking-[0.2em] text-blood">RESET ALL PROGRESSION</div>
                <div className="font-serif text-[11px] italic text-muted-foreground">Erases every shard, unlock, and memory. Cannot be undone.</div>
              </button>
            </div>
          </section>
        </div>

        <div className="flex justify-end border-t border-border/60 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-sm border border-arcane/40 bg-gradient-arcane px-6 py-2 font-display text-xs tracking-[0.3em] text-bone shadow-arcane hover:scale-[1.02] transition-transform"
          >
            CLOSE
          </button>
        </div>

        {flash && (
          <div className="pointer-events-none absolute inset-x-0 -bottom-10 text-center font-display text-[10px] tracking-[0.3em] text-arcane">
            {flash}
          </div>
        )}
      </div>

      {(confirmRun || confirmMeta) && (
        <div
          onClick={(e) => { e.stopPropagation(); }}
          className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
        >
          <div className="w-full max-w-sm rounded-sm border border-blood/50 bg-card p-6 text-center shadow-arcane">
            <div className="font-display text-[10px] tracking-[0.5em] text-blood">CONFIRM</div>
            <div className="mt-3 font-display text-lg tracking-[0.2em]">
              {confirmRun ? "DISCARD THE ASCENDANT?" : "ERASE EVERYTHING?"}
            </div>
            <p className="mt-3 font-serif text-sm italic text-muted-foreground">
              {confirmRun
                ? "The dungeon will forget your name. Your shards remain."
                : "Every ascension, every shard, every unlock — undone. There is no coming back."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => { setConfirmRun(false); setConfirmMeta(false); }}
                className="rounded-sm border border-border px-5 py-2 font-display text-[10px] tracking-[0.3em] text-muted-foreground hover:text-foreground"
              >
                CANCEL
              </button>
              <button
                onClick={confirmRun ? resetRun : resetMeta}
                className="rounded-sm border border-blood/60 bg-blood/20 px-5 py-2 font-display text-[10px] tracking-[0.3em] text-bone hover:bg-blood/30"
              >
                {confirmRun ? "DISCARD" : "ERASE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
