import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { RuneFrame } from "@/components/RuneFrame";
import { InfoTip } from "@/components/InfoTip";
import { RacePortrait, GenderIcon } from "@/components/RacePortrait";
import { saveCharacter, type Gender } from "@/lib/character-storage";
import { loadMeta } from "@/lib/meta-storage";
import {
  ASPECTS,
  RACES,
  RESONANCES,
  TIERS,
  VITAL_MAX,
  VITAL_MIN,
  VITAL_TOTAL,
} from "@/lib/game-data";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Forge an Ascendant — Bloodbound" },
      { name: "description", content: "Choose your bloodline, bind an aspect, accept your resonances, and allocate your vital measures." },
      { property: "og:title", content: "Forge an Ascendant" },
      { property: "og:description", content: "Begin your ascension." },
    ],
  }),
  component: Forge,
});

type Vitals = { vigor: number; focus: number; resolve: number };

const STEPS = ["Identity", "Bloodline", "Aspect", "Resonance", "Vitals", "Oath"] as const;

function Forge() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("other");
  const [raceId, setRaceId] = useState<string | null>(null);
  const [aspectId, setAspectId] = useState<string | null>(null);
  const [resonanceIds, setResonanceIds] = useState<string[]>([]);
  const [vitals, setVitals] = useState<Vitals>({ vigor: 6, focus: 6, resolve: 6 });

  const race = RACES.find((r) => r.id === raceId) ?? null;
  const aspect = ASPECTS.find((a) => a.id === aspectId) ?? null;
  const remaining = VITAL_TOTAL - vitals.vigor - vitals.focus - vitals.resolve;
  const attention = resonanceIds.reduce((sum, id) => sum + (RESONANCES.find((r) => r.id === id)?.attention ?? 0), 0);

  const canAdvance = useMemo(() => {
    switch (step) {
      case 0: return name.trim().length >= 2;
      case 1: return !!raceId;
      case 2: return !!aspectId;
      case 3: return resonanceIds.length >= 1 && resonanceIds.length <= 3;
      case 4: return remaining === 0;
      default: return true;
    }
  }, [step, name, raceId, aspectId, resonanceIds, remaining]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Stepper */}
        <Stepper step={step} onStep={setStep} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="min-h-[60vh]">
            {step === 0 && <IdentityStep name={name} setName={setName} gender={gender} setGender={setGender} />}
            {step === 1 && <BloodlineStep raceId={raceId} setRaceId={setRaceId} gender={gender} />}
            {step === 2 && <AspectStep aspectId={aspectId} setAspectId={setAspectId} />}
            {step === 3 && (
              <ResonanceStep
                resonanceIds={resonanceIds}
                setResonanceIds={setResonanceIds}
              />
            )}
            {step === 4 && <VitalsStep vitals={vitals} setVitals={setVitals} remaining={remaining} />}
            {step === 5 && (
              <OathStep
                name={name}
                race={race?.name ?? "—"}
                aspect={aspect?.name ?? "—"}
                resonanceCount={resonanceIds.length}
                attention={attention}
              />
            )}

            <div className="mt-10 flex items-center justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="rounded-sm border border-border px-6 py-2 font-display text-xs tracking-widest text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                ← BACK
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => canAdvance && setStep((s) => s + 1)}
                  disabled={!canAdvance}
                  className="rounded-sm border border-arcane/40 bg-gradient-arcane px-8 py-2 font-display text-xs tracking-[0.3em] text-bone shadow-rune disabled:opacity-30"
                >
                  CONTINUE →
                </button>
              ) : (
                <Link
                  to="/dungeon"
                  onClick={() => {
                    if (raceId && aspectId) {
                      saveCharacter({ name: name.trim(), gender, raceId, aspectId, resonanceIds, vitals });
                    }
                  }}
                  className="rounded-sm border border-ember/50 bg-gradient-to-r from-ember/80 to-blood/80 px-8 py-2 font-display text-xs tracking-[0.3em] text-background shadow-arcane"
                >
                  DESCEND →
                </Link>
              )}
            </div>
          </div>

          {/* Live Character Sheet */}
          <CharacterSheet
            name={name}
            gender={gender}
            raceId={raceId}
            race={race?.name ?? null}
            raceSigil={race?.sigil}
            aspect={aspect?.name ?? null}
            aspectSigil={aspect?.sigil}
            aspectColor={aspect?.color}
            vitals={vitals}
            resonanceIds={resonanceIds}
            attention={attention}
          />
        </div>
      </div>
    </div>
  );
}

function Stepper({ step, onStep }: { step: number; onStep: (s: number) => void }) {
  return (
    <ol className="flex flex-wrap items-center gap-2">
      {STEPS.map((label, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <li key={label} className="flex items-center gap-2">
            <button
              onClick={() => i <= step && onStep(i)}
              className={`flex items-center gap-2 rounded-sm border px-3 py-1.5 font-display text-[10px] tracking-[0.25em] transition-all ${
                active
                  ? "border-arcane bg-arcane/20 text-arcane shadow-rune"
                  : done
                  ? "border-arcane/40 text-arcane/70"
                  : "border-border text-muted-foreground"
              }`}
            >
              <span className="font-mono">{String(i + 1).padStart(2, "0")}</span>
              <span>{label.toUpperCase()}</span>
            </button>
            {i < STEPS.length - 1 && <span className="text-arcane/30">─</span>}
          </li>
        );
      })}
    </ol>
  );
}

function IdentityStep({
  name,
  setName,
  gender,
  setGender,
}: {
  name: string;
  setName: (s: string) => void;
  gender: Gender;
  setGender: (g: Gender) => void;
}) {
  const options: { id: Gender; label: string; hint: string }[] = [
    { id: "male", label: "Male", hint: "He · Him" },
    { id: "female", label: "Female", hint: "She · Her" },
    { id: "other", label: "Other", hint: "They · Them · Beyond" },
  ];
  return (
    <RuneFrame className="p-10 animate-float-up">
      <Eyebrow>I · The Naming</Eyebrow>
      <h2 className="mt-3 font-display text-3xl text-glow">What name will the dungeon learn?</h2>
      <p className="mt-3 font-serif italic text-muted-foreground">
        A name is a thread. Pull it, and the dungeon pulls back.
      </p>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Veyra of the Hollow Crown"
        className="mt-8 w-full rounded-sm border border-border bg-input/40 px-4 py-3 font-display text-xl tracking-wider text-bone outline-none focus:border-arcane focus:shadow-rune"
        maxLength={48}
      />

      <div className="mt-8">
        <div className="flex items-center gap-2 font-display text-[10px] tracking-[0.4em] text-arcane">
          VESSEL · GENDER
          <InfoTip title="Vessel" size={11}>
            How your ascendant carries themselves in the world. Purely
            cosmetic — affects portrait, pronouns, and how NPCs address you.
          </InfoTip>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {options.map((o) => {
            const active = o.id === gender;
            return (
              <button
                key={o.id}
                onClick={() => setGender(o.id)}
                className={`flex items-center gap-3 rounded-sm border p-3 text-left transition-all ${
                  active ? "border-arcane bg-arcane/10 shadow-arcane" : "border-border bg-card/60 hover:border-arcane/50"
                }`}
              >
                <GenderIcon gender={o.id} size={18} />
                <div>
                  <div className="font-display text-xs tracking-widest text-bone">{o.label.toUpperCase()}</div>
                  <div className="font-serif text-[11px] italic text-muted-foreground">{o.hint}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </RuneFrame>
  );
}

function BloodlineStep({ raceId, setRaceId, gender }: { raceId: string | null; setRaceId: (id: string) => void; gender: Gender }) {
  const unlocked = typeof window !== "undefined" ? loadMeta().unlockedRaces : RACES.map((r) => r.id);
  const race = RACES.find((r) => r.id === raceId);
  return (
    <div className="animate-float-up space-y-6">
      <div>
        <Eyebrow>II · The Bloodline</Eyebrow>
        <h2 className="mt-3 flex items-center gap-2 font-display text-3xl text-glow">
          Whose blood runs in you?
          <InfoTip title="Bloodlines" size={16}>
            Your ancestral heritage. Each bloodline grants three innate traits that
            color how you fight, perceive, and endure. Some are locked until you
            earn shards from the dungeon.
          </InfoTip>
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {RACES.map((r) => {
          const active = r.id === raceId;
          const isLocked = !unlocked.includes(r.id);
          return (
            <button
              key={r.id}
              onClick={() => !isLocked && setRaceId(r.id)}
              disabled={isLocked}
              className={`group relative rounded-sm border p-4 text-left transition-all ${
                isLocked ? "border-border/40 bg-card/30 opacity-50 cursor-not-allowed" :
                active
                  ? "border-arcane bg-arcane/10 shadow-arcane"
                  : "border-border bg-card/60 hover:border-arcane/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-base tracking-widest text-bone">{r.name}</div>
                  <div className="font-serif text-xs italic text-muted-foreground">{r.tagline}</div>
                </div>
                <span className={`text-2xl ${active ? "text-arcane text-glow animate-flicker" : "text-arcane/60"}`}>{r.sigil}</span>
              </div>
              {isLocked && (
                <div className="mt-2 font-display text-[9px] tracking-[0.3em] text-blood">⛓ LOCKED — EARN SHARDS</div>
              )}
            </button>
          );
        })}
      </div>
      {race && (
        <RuneFrame className="p-6">
          <Eyebrow>Codex Entry</Eyebrow>
          <h3 className="mt-2 font-display text-xl text-bone">{race.name}</h3>
          <p className="mt-2 font-serif italic text-muted-foreground">{race.lore}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {race.traits.map((t) => (
              <span key={t} className="rounded-sm border border-arcane/30 bg-arcane/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-arcane">{t}</span>
            ))}
          </div>
        </RuneFrame>
      )}
    </div>
  );
}

function AspectStep({ aspectId, setAspectId }: { aspectId: string | null; setAspectId: (id: string) => void }) {
  const unlocked = typeof window !== "undefined" ? loadMeta().unlockedAspects : ASPECTS.map((a) => a.id);
  const aspect = ASPECTS.find((a) => a.id === aspectId);
  return (
    <div className="animate-float-up space-y-6">
      <div>
        <Eyebrow>III · The Aspect</Eyebrow>
        <h2 className="mt-3 flex items-center gap-2 font-display text-3xl text-glow">
          Which truth bends to you?
          <InfoTip title="Aspects" size={16}>
            Your bound power — the metaphysical truth you have made a pact with.
            Each Aspect grants a Passive (always on), an Active (tactical), and
            an Ultimate (scene-defining). Choose what you want to become.
          </InfoTip>
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {ASPECTS.map((a) => {
          const active = a.id === aspectId;
          const isLocked = !unlocked.includes(a.id);
          return (
            <button
              key={a.id}
              onClick={() => !isLocked && setAspectId(a.id)}
              disabled={isLocked}
              className={`group rounded-sm border p-4 text-left transition-all ${
                isLocked ? "border-border/40 bg-card/30 opacity-50 cursor-not-allowed" :
                active ? "border-arcane bg-arcane/10 shadow-arcane" : "border-border bg-card/60 hover:border-arcane/50"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <div className="font-display text-base tracking-widest text-bone">{a.name}</div>
                <span className={`text-2xl text-${a.color} ${active ? "text-glow animate-flicker" : ""}`}>{a.sigil}</span>
              </div>
              <div className="mt-1 font-serif text-xs italic text-muted-foreground">{a.tagline}</div>
              {isLocked && (
                <div className="mt-2 font-display text-[9px] tracking-[0.3em] text-blood">⛓ LOCKED — EARN SHARDS</div>
              )}
            </button>
          );
        })}
      </div>
      {aspect && (
        <RuneFrame className="p-6">
          <Eyebrow>Aspect Doctrine</Eyebrow>
          <h3 className="mt-2 font-display text-xl text-bone">{aspect.name}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Doctrine label="Passive" value={aspect.passive} />
            <Doctrine label="Active" value={aspect.active} />
            <Doctrine label="Ultimate" value={aspect.ultimate} accent />
          </div>
        </RuneFrame>
      )}
    </div>
  );
}

function Doctrine({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-sm border border-border/70 bg-background/40 p-3">
      <div className={`font-display text-[10px] tracking-widest ${accent ? "text-ember" : "text-arcane"}`}>{label.toUpperCase()}</div>
      <div className="mt-1 font-serif text-sm">{value}</div>
    </div>
  );
}

function ResonanceStep({
  resonanceIds,
  setResonanceIds,
}: {
  resonanceIds: string[];
  setResonanceIds: (ids: string[]) => void;
}) {
  const toggle = (id: string) => {
    if (resonanceIds.includes(id)) {
      setResonanceIds(resonanceIds.filter((x) => x !== id));
    } else if (resonanceIds.length < 3) {
      setResonanceIds([...resonanceIds, id]);
    }
  };
  return (
    <div className="animate-float-up space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <Eyebrow>IV · The Resonance</Eyebrow>
          <h2 className="mt-3 flex items-center gap-2 font-display text-3xl text-glow">
            What does the dungeon feel in you?
            <InfoTip title="Resonances" size={16}>
              Hungers and quirks the dungeon notices in you. Each grants a Boon
              and exacts a Cost, and raises Dungeon Attention — the more dots,
              the harder it watches. Pick 1–3.
            </InfoTip>
          </h2>
          <p className="mt-2 font-serif italic text-muted-foreground">Choose 1 to 3. Each pulls the gaze closer.</p>
        </div>
        <div className="font-mono text-sm text-arcane">{resonanceIds.length}/3</div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {RESONANCES.map((r) => {
          const active = resonanceIds.includes(r.id);
          return (
            <button
              key={r.id}
              onClick={() => toggle(r.id)}
              className={`flex items-start gap-4 rounded-sm border p-4 text-left transition-all ${
                active ? "border-arcane bg-arcane/10 shadow-arcane" : "border-border bg-card/60 hover:border-arcane/50"
              }`}
            >
              <div className="mt-1 flex flex-col gap-0.5">
                {[1, 2, 3].map((i) => (
                  <span key={i} className={`h-1.5 w-1.5 rounded-full ${i <= r.attention ? "bg-blood" : "bg-border"}`} />
                ))}
              </div>
              <div className="flex-1">
                <div className="font-display text-sm tracking-wider text-bone">{r.name}</div>
                <div className="mt-1 text-xs"><span className="text-arcane">Boon · </span><span className="text-muted-foreground">{r.benefit}</span></div>
                <div className="text-xs"><span className="text-blood">Cost · </span><span className="text-muted-foreground">{r.cost}</span></div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VitalsStep({
  vitals,
  setVitals,
  remaining,
}: {
  vitals: Vitals;
  setVitals: (v: Vitals) => void;
  remaining: number;
}) {
  const set = (k: keyof Vitals, v: number) => {
    const clamped = Math.max(VITAL_MIN, Math.min(VITAL_MAX, v));
    const proposed = { ...vitals, [k]: clamped };
    const used = proposed.vigor + proposed.focus + proposed.resolve;
    if (used <= VITAL_TOTAL) setVitals(proposed);
  };
  return (
    <div className="animate-float-up space-y-6">
      <div>
        <Eyebrow>V · The Vitals</Eyebrow>
        <h2 className="mt-3 flex items-center gap-2 font-display text-3xl text-glow">
          Measure your becoming.
          <InfoTip title="The Three Pillars" size={16}>
            Your character rests on three pillars.
            <span className="mt-1 block"><span className="text-blood">Vigor</span> — flesh, stamina, how much punishment you survive.</span>
            <span className="block"><span className="text-arcane">Focus</span> — magical capacity, concentration, control of your Aspect.</span>
            <span className="block"><span className="text-ember">Resolve</span> — willpower against fear, madness, and the dungeon's whispers.</span>
          </InfoTip>
        </h2>
        <p className="mt-2 font-serif italic text-muted-foreground">
          Distribute {VITAL_TOTAL} points across Vigor, Focus, and Resolve. Min {VITAL_MIN}. Max {VITAL_MAX}.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <VitalCard label="Vigor" desc="Health · Stamina · Durability" value={vitals.vigor} onChange={(v) => set("vigor", v)} tone="blood" />
        <VitalCard label="Focus" desc="Magic · Concentration · Control" value={vitals.focus} onChange={(v) => set("focus", v)} tone="arcane" />
        <VitalCard label="Resolve" desc="Will · Corruption · Fear" value={vitals.resolve} onChange={(v) => set("resolve", v)} tone="ember" />
      </div>
      <div className="text-center font-display text-sm tracking-widest">
        REMAINING <span className={`text-2xl ${remaining === 0 ? "text-arcane text-glow" : "text-ember"}`}>{remaining}</span>
      </div>
    </div>
  );
}

function VitalCard({
  label,
  desc,
  value,
  onChange,
  tone,
}: {
  label: string;
  desc: string;
  value: number;
  onChange: (v: number) => void;
  tone: "blood" | "arcane" | "ember";
}) {
  return (
    <RuneFrame className="p-5">
      <div className="font-display text-xs tracking-widest text-muted-foreground">{label.toUpperCase()}</div>
      <div className={`mt-2 font-display text-5xl text-${tone} text-glow`}>{value}</div>
      <div className="mt-1 font-serif text-xs italic text-muted-foreground">{desc}</div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          onClick={() => onChange(value - 1)}
          className="h-8 w-8 rounded-sm border border-border font-display text-lg hover:border-arcane"
        >−</button>
        <div className="flex-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
            <div className={`h-full bg-${tone}`} style={{ width: `${(value / VITAL_MAX) * 100}%` }} />
          </div>
        </div>
        <button
          onClick={() => onChange(value + 1)}
          className="h-8 w-8 rounded-sm border border-border font-display text-lg hover:border-arcane"
        >+</button>
      </div>
    </RuneFrame>
  );
}

function OathStep({
  name,
  race,
  aspect,
  resonanceCount,
  attention,
}: {
  name: string;
  race: string;
  aspect: string;
  resonanceCount: number;
  attention: number;
}) {
  return (
    <RuneFrame glow className="p-10 text-center animate-float-up">
      <Eyebrow>VI · The Oath</Eyebrow>
      <h2 className="mt-3 font-display text-3xl text-glow">Speak it, and it is binding.</h2>
      <blockquote className="mx-auto mt-8 max-w-xl font-serif text-lg italic leading-relaxed text-foreground/90">
        "I, <span className="text-arcane">{name || "Nameless"}</span>, of the <span className="text-arcane">{race}</span> blood,
        bound to the <span className="text-arcane">{aspect}</span>, accept {resonanceCount} resonance{resonanceCount === 1 ? "" : "s"},
        and offer the dungeon <span className="text-blood">{attention}</span> measure{attention === 1 ? "" : "s"} of its attention.
        Let what answers, answer."
      </blockquote>
      <div className="mt-8 inline-flex items-center gap-2 font-display text-[10px] tracking-[0.4em] text-muted-foreground">
        TIER I · STIRRING BLOOD · INITIATED
        <InfoTip title="Ascension Tiers" size={12}>
          Your bond with the dungeon deepens in stages. Each Tier unlocks deeper
          power and draws sharper attention.
          {TIERS.map((t) => (
            <span key={t.id} className="mt-1 block">
              <span className="text-arcane">Tier {t.id} · {t.name}</span> — {t.desc}
            </span>
          ))}
        </InfoTip>
      </div>
    </RuneFrame>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="font-display text-[10px] tracking-[0.4em] text-arcane">{children}</div>;
}

function CharacterSheet({
  name,
  race,
  raceSigil,
  aspect,
  aspectSigil,
  aspectColor,
  vitals,
  resonanceIds,
  attention,
}: {
  name: string;
  race: string | null;
  raceSigil?: string;
  aspect: string | null;
  aspectSigil?: string;
  aspectColor?: "arcane" | "blood" | "ember" | "bone";
  vitals: Vitals;
  resonanceIds: string[];
  attention: number;
}) {
  return (
    <aside className="sticky top-24 self-start">
      <RuneFrame className="p-5">
        <div className="text-center">
          <div className="font-display text-[10px] tracking-[0.4em] text-arcane">CHARACTER SHEET</div>
          <div className="mt-3 font-display text-xl tracking-wider text-bone min-h-[1.75rem]">{name || "—"}</div>
          <div className="inline-flex items-center justify-center gap-1.5 font-serif text-xs italic text-muted-foreground">
            Tier I · Stirring Blood
            <InfoTip title="Ascension Tiers" size={11}>
              Six tiers of bond with the dungeon — from Stirring Blood to
              Transcendent. Each step deepens your power and the dungeon's
              gaze.
              {TIERS.map((t) => (
                <span key={t.id} className="mt-1 block">
                  <span className="text-arcane">Tier {t.id} · {t.name}</span> — {t.desc}
                </span>
              ))}
            </InfoTip>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <SheetSlot label="Bloodline" value={race} sigil={raceSigil} />
          <SheetSlot label="Aspect" value={aspect} sigil={aspectSigil} tone={aspectColor} />
        </div>

        <div className="mt-5">
          <SheetLabel>Vital Measures</SheetLabel>
          <div className="mt-2 space-y-2">
            <Bar label="Vigor" value={vitals.vigor} max={VITAL_MAX} tone="blood" />
            <Bar label="Focus" value={vitals.focus} max={VITAL_MAX} tone="arcane" />
            <Bar label="Resolve" value={vitals.resolve} max={VITAL_MAX} tone="ember" />
          </div>
        </div>

        <div className="mt-5">
          <SheetLabel>Resonances · {resonanceIds.length}</SheetLabel>
          <div className="mt-2 space-y-1 text-xs">
            {resonanceIds.length === 0 && <div className="font-serif italic text-muted-foreground">none yet</div>}
            {resonanceIds.map((id) => {
              const r = RESONANCES.find((x) => x.id === id)!;
              return <div key={id} className="font-serif text-foreground/90">· {r.name}</div>;
            })}
          </div>
        </div>

        <div className="mt-5">
          <SheetLabel>Dungeon Attention</SheetLabel>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-border/60">
              <div className="h-full bg-gradient-blood transition-all" style={{ width: `${Math.min(100, (attention / 9) * 100)}%` }} />
            </div>
            <div className="font-mono text-sm text-blood">{attention}</div>
          </div>
          <div className="mt-1 font-serif text-[11px] italic text-muted-foreground">
            {attention === 0 && "Unnoticed."}
            {attention >= 1 && attention <= 2 && "A whisper turns toward you."}
            {attention >= 3 && attention <= 4 && "Something watches the door."}
            {attention >= 5 && attention <= 6 && "Hunters are dispatched."}
            {attention >= 7 && "The dungeon names you."}
          </div>
        </div>
      </RuneFrame>
    </aside>
  );
}

function SheetSlot({ label, value, sigil, tone = "arcane" }: { label: string; value: string | null; sigil?: string; tone?: "arcane" | "blood" | "ember" | "bone" }) {
  return (
    <div className="rounded-sm border border-border/70 bg-background/40 p-3">
      <div className="font-display text-[9px] tracking-widest text-muted-foreground">{label.toUpperCase()}</div>
      <div className="mt-1 flex items-center gap-2">
        <span className={`text-lg text-${tone}`}>{sigil || "·"}</span>
        <span className="font-display text-xs tracking-wider text-bone">{value || "—"}</span>
      </div>
    </div>
  );
}

function SheetLabel({ children }: { children: React.ReactNode }) {
  return <div className="font-display text-[10px] tracking-[0.3em] text-arcane">{children}</div>;
}

function Bar({ label, value, max, tone }: { label: string; value: number; max: number; tone: "blood" | "arcane" | "ember" }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-display tracking-widest text-muted-foreground">{label.toUpperCase()}</span>
        <span className="font-mono text-foreground/80">{value}/{max}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border/60">
        <div className={`h-full bg-${tone}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}
