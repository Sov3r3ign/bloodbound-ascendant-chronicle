import { MainMenuButton } from "@/components/MainMenuButton";
import { createFileRoute, Link } from "@tanstack/react-router";
import { RuneFrame } from "@/components/RuneFrame";
import { ASPECTS, RACES, RESONANCES, TIERS } from "@/lib/game-data";

export const Route = createFileRoute("/codex")({
  head: () => ({
    meta: [
      { title: "Codex — The Bloodbound Ascendants" },
      { name: "description", content: "Bloodlines, aspects, resonances, and ascension tiers of Aethryndor." },
      { property: "og:title", content: "Codex — The Bloodbound Ascendants" },
      { property: "og:description", content: "Bloodlines, aspects, resonances, and ascension tiers." },
    ],
  }),
  component: Codex,
});

function Codex() {
  return (
    <div className="min-h-screen">
      <MainMenuButton />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-arcane blur-3xl opacity-30 animate-rune" />
          <div className="absolute left-1/4 bottom-0 h-40 w-40 rounded-full bg-blood/30 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 pb-16 pt-16 text-center">
          <div className="mb-6 font-display text-xs tracking-[0.5em] text-arcane">A LIVING-DUNGEON RPG</div>
          <h1 className="text-glow font-display text-5xl leading-tight md:text-7xl">
            THE BLOODBOUND
            <br />
            <span className="text-arcane">ASCENDANTS</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl font-serif text-lg italic text-muted-foreground md:text-xl">
            "The dungeon does not sleep. It watches. It remembers. And when your blood begins to sing, it answers — with hunger."
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/create"
              className="group inline-flex items-center gap-3 rounded-sm border border-arcane/40 bg-gradient-arcane px-8 py-3 font-display text-sm tracking-[0.3em] text-bone shadow-arcane transition-all hover:scale-[1.02]"
            >
              FORGE AN ASCENDANT <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-sm border border-border bg-card/60 px-8 py-3 font-display text-sm tracking-[0.3em] text-foreground/90 hover:border-arcane/60"
            >
              ← MAIN MENU
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <SectionTitle eyebrow="The Pact" title="Four Pillars of the Bound" />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { sigil: "✦", title: "Bloodline", desc: "Race-tied passives that echo through every ascension." },
            { sigil: "✺", title: "Aspect", desc: "A soul-class that defines how you bend the world." },
            { sigil: "☾", title: "Resonance", desc: "Soul mutations — boons that the dungeon notices." },
            { sigil: "✜", title: "Ascension", desc: "Six tiers of becoming. Each one rewrites you." },
          ].map((p) => (
            <RuneFrame key={p.title} className="p-6">
              <div className="text-3xl text-arcane animate-flicker">{p.sigil}</div>
              <h3 className="mt-4 font-display text-lg tracking-widest">{p.title}</h3>
              <p className="mt-2 font-serif text-sm text-muted-foreground">{p.desc}</p>
            </RuneFrame>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <SectionTitle eyebrow="Codex I" title="The Nine Bloodlines" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RACES.map((r) => (
            <RuneFrame key={r.id} className="group p-5 transition-all hover:-translate-y-0.5 hover:shadow-arcane">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg tracking-widest text-bone">{r.name}</h3>
                  <p className="font-serif text-sm italic text-muted-foreground">{r.tagline}</p>
                </div>
                <span className="text-2xl text-arcane group-hover:text-glow">{r.sigil}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.traits.map((t) => (
                  <span key={t} className="rounded-sm border border-arcane/30 bg-arcane/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-arcane">
                    {t}
                  </span>
                ))}
              </div>
            </RuneFrame>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <SectionTitle eyebrow="Codex II" title="The Ten Aspects" />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {ASPECTS.map((a) => (
            <RuneFrame key={a.id} className="p-5">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-lg tracking-widest">{a.name}</h3>
                <span className={`text-2xl text-${a.color}`}>{a.sigil}</span>
              </div>
              <p className="mt-1 font-serif text-sm italic text-muted-foreground">{a.tagline}</p>
              <dl className="mt-4 space-y-2 text-sm">
                <Row k="Passive" v={a.passive} />
                <Row k="Active" v={a.active} />
                <Row k="Ultimate" v={a.ultimate} accent />
              </dl>
            </RuneFrame>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <SectionTitle eyebrow="Codex III" title="Resonances — The Dungeon Notices" />
        <p className="mx-auto mt-4 max-w-2xl text-center font-serif italic text-muted-foreground">
          Every gift you accept tightens the gaze of the dungeon. Wear too many, and it sends its finest hunters.
        </p>
        <div className="mt-10 grid gap-3 md:grid-cols-2">
          {RESONANCES.map((r) => (
            <div key={r.id} className="parchment flex items-start gap-4 rounded-sm border border-border p-4">
              <AttentionPips count={r.attention} />
              <div className="flex-1">
                <div className="font-display text-sm tracking-wider text-bone">{r.name}</div>
                <div className="mt-1 text-xs"><span className="text-arcane">Boon · </span><span className="text-muted-foreground">{r.benefit}</span></div>
                <div className="text-xs"><span className="text-blood">Cost · </span><span className="text-muted-foreground">{r.cost}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <SectionTitle eyebrow="Codex IV" title="Ascension Tiers" />
        <ol className="mt-10 relative border-l border-arcane/30 pl-8">
          {TIERS.map((t) => (
            <li key={t.id} className="mb-8 last:mb-0">
              <span className="absolute -left-3 mt-1 grid h-6 w-6 place-items-center rounded-full bg-background ring-1 ring-arcane text-arcane font-display text-xs">{t.id}</span>
              <h3 className="font-display tracking-widest text-bone">TIER {romanize(t.id)} — {t.name.toUpperCase()}</h3>
              <p className="mt-1 font-serif italic text-muted-foreground">{t.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="border-t border-border/60 py-8 text-center font-display text-xs tracking-[0.3em] text-muted-foreground">
        ◆ THE BLOODBOUND ASCENDANTS ◆ A LIVING-DUNGEON RPG ◆
      </footer>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-[10px] tracking-[0.5em] text-arcane">{eyebrow}</div>
      <h2 className="mt-3 font-display text-3xl md:text-4xl text-glow">{title}</h2>
      <div className="mx-auto mt-4 flex items-center justify-center gap-2 text-arcane/60">
        <span className="h-px w-12 bg-arcane/40" />
        <span>✦</span>
        <span className="h-px w-12 bg-arcane/40" />
      </div>
    </div>
  );
}

function Row({ k, v, accent = false }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex gap-3">
      <dt className={`shrink-0 font-display text-[10px] tracking-widest ${accent ? "text-ember" : "text-arcane"} w-16 pt-1`}>{k.toUpperCase()}</dt>
      <dd className="font-serif text-sm text-foreground/90">{v}</dd>
    </div>
  );
}

function AttentionPips({ count }: { count: number }) {
  return (
    <div className="mt-1 flex flex-col items-center gap-0.5" title={`Dungeon attention: ${count}`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={`block h-1.5 w-1.5 rounded-full ${i <= count ? "bg-blood shadow-[0_0_6px_oklch(0.5_0.2_18)]" : "bg-border"}`} />
      ))}
    </div>
  );
}

function romanize(n: number) {
  return ["I", "II", "III", "IV", "V", "VI"][n - 1] ?? String(n);
}
