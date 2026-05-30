import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { RuneFrame } from "@/components/RuneFrame";
import { ASPECTS, RACES, TIERS } from "@/lib/game-data";
import { loadCharacter, type StoredCharacter } from "@/lib/character-storage";
import {
  generateDungeon,
  makePlayer,
  powerFor,
  quaffElixir,
  quaffPotion,
  step,
  TIER_NAMES,
  TIER_XP,
  usePower,
  type GameState,
  type MoveDir,
} from "@/lib/dungeon-engine";

export const Route = createFileRoute("/dungeon")({
  head: () => ({
    meta: [
      { title: "The Dungeon — Bloodbound" },
      { name: "description", content: "Descend into a procedurally-living dungeon. Fight, ascend, survive." },
      { property: "og:title", content: "Enter the Dungeon" },
      { property: "og:description", content: "The dungeon does not sleep." },
    ],
  }),
  component: DungeonPage,
});

const GRID_W = 32;
const GRID_H = 20;
const CELL = 22; // px

function DungeonPage() {
  const [character, setCharacter] = useState<StoredCharacter | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load character + start
  useEffect(() => {
    const c = loadCharacter();
    setCharacter(c);
    const p = makePlayer(c.vitals);
    setGame(generateDungeon(GRID_W, GRID_H, 1, p));
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (!game || !character) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      const map: Record<string, MoveDir> = {
        arrowup: "n", w: "n", k: "n",
        arrowdown: "s", s: "s", j: "s",
        arrowleft: "w", a: "w", h: "w",
        arrowright: "e", d: "e", l: "e",
        ".": "wait", " ": "wait",
      };
      if (map[k]) {
        e.preventDefault();
        setGame((g) => (g ? step(g, map[k]) : g));
      } else if (k === "1") { e.preventDefault(); setGame((g) => (g ? quaffPotion(g) : g)); }
      else if (k === "2") { e.preventDefault(); setGame((g) => (g ? quaffElixir(g) : g)); }
      else if (k === "3" || k === "q") {
        e.preventDefault();
        setGame((g) => (g && character ? usePower(g, character.aspectId) : g));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [game, character]);

  // Advance floor when ascended
  useEffect(() => {
    if (!game || !character) return;
    if (game.status === "ascended") {
      const t = setTimeout(() => {
        const nextFloor = game.floor + 1;
        const p = { ...game.player, x: 0, y: 0 };
        setGame(generateDungeon(GRID_W, GRID_H, nextFloor, p));
      }, 600);
      return () => clearTimeout(t);
    }
  }, [game, character]);

  if (!character || !game) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center font-display tracking-widest text-arcane animate-flicker">
          AWAKENING THE DUNGEON…
        </div>
      </div>
    );
  }

  const race = RACES.find((r) => r.id === character.raceId);
  const aspect = ASPECTS.find((a) => a.id === character.aspectId);
  const power = powerFor(character.aspectId);
  const xpForNext = TIER_XP[Math.min(game.player.tier, TIER_XP.length - 1)] ?? 9999;
  const xpForPrev = TIER_XP[Math.max(0, game.player.tier - 1)];
  const xpProgress = game.player.tier >= 6 ? 100 : Math.min(100, Math.round(((game.player.xp - xpForPrev) / (xpForNext - xpForPrev)) * 100));

  const onCellClick = (x: number, y: number) => {
    if (game.status !== "playing") return;
    const dx = x - game.player.x;
    const dy = y - game.player.y;
    if (Math.abs(dx) + Math.abs(dy) !== 1) return;
    const dir: MoveDir = dx === 1 ? "e" : dx === -1 ? "w" : dy === 1 ? "s" : "n";
    setGame((g) => (g ? step(g, dir) : g));
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-[1500px] px-4 py-6">
        {/* HUD top */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-display text-[10px] tracking-[0.4em] text-arcane">FLOOR {romanize(game.floor)}</div>
            <h1 className="font-display text-2xl md:text-3xl text-glow">{character.name}</h1>
            <div className="mt-0.5 font-serif text-sm italic text-muted-foreground">
              {race?.name} · {aspect?.name}
            </div>
          </div>
          <AttentionMeter value={game.attention} turn={game.turn} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[260px_1fr_320px]">
          {/* Vitals + inventory */}
          <RuneFrame className="p-4">
            <div className="font-display text-[10px] tracking-[0.4em] text-arcane">VITALS</div>
            <Bar label="VIGOR" value={game.player.hp} max={game.player.maxHp} tone="blood" />
            <Bar label="FOCUS" value={game.player.focus} max={game.player.maxFocus} tone="arcane" />
            {game.player.shield > 0 && (
              <div className="mt-1 font-display text-[10px] tracking-widest text-bone">SHIELD · {game.player.shield}</div>
            )}
            {game.player.buffDmg > 0 && (
              <div className="mt-1 font-display text-[10px] tracking-widest text-ember">+{game.player.buffDmg} DMG · {game.player.buffTurns}t</div>
            )}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
              <Stat label="AC" v={game.player.ac} />
              <Stat label="ATK+" v={game.player.atkBonus} />
              <Stat label="d" v={game.player.weaponDie} prefix="1d" />
            </div>

            <div className="mt-4 font-display text-[10px] tracking-[0.4em] text-arcane">INVENTORY</div>
            <ul className="mt-2 space-y-1.5 text-xs">
              <Inv label="Crimson Draught" qty={game.player.potions} hint="[1] heal 18" />
              <Inv label="Focus Elixir" qty={game.player.elixirs} hint="[2] +10 focus" />
              <Inv label="Obols" qty={game.player.gold} />
              <Inv label="Bloodbound Shards" qty={game.player.shards} />
            </ul>

            <div className="mt-4 rounded-sm border border-arcane/30 bg-arcane/5 p-3">
              <div className="font-display text-[10px] tracking-widest text-arcane">ASPECT POWER · [Q]</div>
              <div className="mt-1 font-display text-sm tracking-wider text-bone">{power.label}</div>
              <div className="mt-0.5 font-serif text-[11px] italic text-muted-foreground">{power.desc}</div>
              <div className="mt-1 font-mono text-[10px] text-ember">Cost · {power.cost} Focus</div>
            </div>
          </RuneFrame>

          {/* Map */}
          <RuneFrame className="p-3" ref={undefined}>
            <div className="mb-2 flex items-center justify-between">
              <div className="font-display text-[10px] tracking-[0.4em] text-arcane">DUNGEON</div>
              <div className="hidden gap-3 text-[10px] font-display tracking-widest text-muted-foreground md:flex">
                <span><span className="text-arcane">@</span> YOU</span>
                <span><span className="text-blood">g/c/s</span> FOES</span>
                <span><span className="text-ember">!</span> POTION</span>
                <span><span className="text-bone">$</span> LOOT</span>
                <span><span className="text-arcane">&gt;</span> STAIRS</span>
              </div>
            </div>
            <div
              ref={containerRef}
              className="relative mx-auto select-none overflow-hidden rounded-sm bg-black/60 ring-1 ring-arcane/20"
              style={{ width: GRID_W * CELL, maxWidth: "100%", aspectRatio: `${GRID_W} / ${GRID_H}` }}
            >
              <DungeonGrid game={game} onCellClick={onCellClick} />
              {/* overlays */}
              {game.status === "dead" && (
                <Overlay
                  title="You Have Fallen"
                  subtitle="The dungeon drinks deep."
                  cta="RISE AGAIN"
                  onClick={() => {
                    const p = makePlayer(character.vitals);
                    setGame(generateDungeon(GRID_W, GRID_H, 1, p));
                  }}
                />
              )}
              {game.status === "ascended" && (
                <Overlay title="The Stair Opens" subtitle={`Floor ${game.floor + 1} awaits…`} />
              )}
            </div>

            {/* Action bar */}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <ActionBtn label="ATTACK / MOVE" hint="↑↓←→ · WASD" />
              <ActionBtn label="WAIT" hint="SPACE · ." onClick={() => setGame((g) => g ? step(g, "wait") : g)} />
              <ActionBtn label="POTION" hint="[1]" disabled={game.player.potions === 0} onClick={() => setGame((g) => g ? quaffPotion(g) : g)} />
              <ActionBtn label="ELIXIR" hint="[2]" disabled={game.player.elixirs === 0} onClick={() => setGame((g) => g ? quaffElixir(g) : g)} />
              <ActionBtn label={power.label} hint="[Q]" disabled={game.player.focus < power.cost} onClick={() => setGame((g) => g ? usePower(g, character.aspectId) : g)} accent />
            </div>
          </RuneFrame>

          {/* Log + ascension */}
          <RuneFrame className="flex flex-col p-4">
            <div className="font-display text-[10px] tracking-[0.4em] text-arcane">CHRONICLE</div>
            {game.lastDice && (
              <div className="mt-2 rounded-sm border border-arcane/40 bg-background/60 p-2 text-center">
                <div className="font-display text-[10px] tracking-widest text-arcane">D20 · {game.lastDice.label}</div>
                <div className="font-display text-3xl text-glow text-bone">{game.lastDice.value}</div>
                <div className="font-display text-[10px] tracking-widest text-ember">{game.lastDice.outcome.toUpperCase()}</div>
              </div>
            )}
            <ol className="mt-3 max-h-[55vh] flex-1 space-y-1.5 overflow-y-auto pr-1">
              {game.log.map((entry, i) => (
                <li
                  key={i}
                  className={`rounded-sm border-l-2 px-2.5 py-1.5 text-[12px] leading-snug ${
                    entry.t === "narrative" ? "border-arcane/60 bg-arcane/5 font-serif italic text-foreground/90" :
                    entry.t === "combat" ? "border-blood/60 bg-blood/5 font-mono text-blood" :
                    entry.t === "loot" ? "border-ember/60 bg-ember/5 font-mono text-ember" :
                    entry.t === "roll" ? "border-arcane/40 bg-arcane/5 font-mono text-arcane" :
                    "border-border bg-card/40 font-display tracking-wider text-muted-foreground"
                  }`}
                >
                  {entry.m}
                </li>
              ))}
            </ol>
          </RuneFrame>
        </div>

        {/* Ascension tracker */}
        <RuneFrame className="mt-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-[10px] tracking-[0.4em] text-arcane">ASCENSION</div>
              <div className="mt-1 font-display text-lg tracking-widest text-bone">
                TIER {romanize(game.player.tier)} — {(TIER_NAMES[game.player.tier - 1] ?? "Mortal").toUpperCase()} BLOOD
              </div>
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              XP {game.player.xp} {game.player.tier < 6 && `/ ${xpForNext}`}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-6 gap-1.5">
            {TIERS.map((t) => (
              <div
                key={t.id}
                className={`h-2 rounded-full transition-all ${
                  t.id < game.player.tier ? "bg-arcane shadow-[0_0_10px_oklch(0.72_0.16_295)]" :
                  t.id === game.player.tier ? "bg-gradient-to-r from-arcane to-ember" :
                  "bg-border/60"
                }`}
                style={t.id === game.player.tier ? { backgroundSize: `${xpProgress}% 100%`, backgroundRepeat: "no-repeat" } : undefined}
              />
            ))}
          </div>
        </RuneFrame>

        <div className="mt-6 text-center font-display text-[10px] tracking-[0.4em] text-muted-foreground">
          <Link to="/create" className="hover:text-arcane">◆ FORGE A NEW ASCENDANT ◆</Link>
        </div>
      </div>
    </div>
  );
}

// ---------- Map renderer ----------

function DungeonGrid({ game, onCellClick }: { game: GameState; onCellClick: (x: number, y: number) => void }) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${game.width}, ${CELL}px)`,
        gridTemplateRows: `repeat(${game.height}, ${CELL}px)`,
      }}
    >
      {Array.from({ length: game.height }).map((_, y) =>
        Array.from({ length: game.width }).map((_, x) => {
          const tile = game.tiles[y][x];
          const isPlayer = game.player.x === x && game.player.y === y;
          const monster = tile.visible ? game.monsters.find((m) => m.x === x && m.y === y && m.hp > 0) : undefined;
          const item = tile.visible ? game.items.find((i) => i.x === x && i.y === y) : undefined;
          const adjacent = !isPlayer && Math.abs(x - game.player.x) + Math.abs(y - game.player.y) === 1;

          let glyph = "";
          let tone = "text-muted-foreground/30";
          let bg = "bg-black/80";

          if (tile.seen) {
            if (tile.kind === "wall") {
              bg = "bg-shadow/70";
              glyph = "";
            } else if (tile.kind === "stairs") {
              bg = "bg-arcane/15";
              glyph = ">";
              tone = "text-arcane text-glow";
            } else {
              bg = tile.visible ? "bg-card/70" : "bg-card/30";
              glyph = "·";
              tone = "text-muted-foreground/40";
            }
          }

          if (tile.visible) {
            if (item) {
              glyph = item.kind === "potion" ? "!" : item.kind === "elixir" ? "?" : item.kind === "shard" ? "◇" : "$";
              tone = item.kind === "potion" ? "text-blood" : item.kind === "elixir" ? "text-arcane" : item.kind === "shard" ? "text-bone text-glow" : "text-ember";
            }
            if (monster) {
              glyph = monster.glyph;
              tone = monster.boss
                ? "text-blood text-glow animate-flicker"
                : monster.tone === "blood" ? "text-blood"
                : monster.tone === "ember" ? "text-ember"
                : monster.tone === "arcane" ? "text-arcane"
                : "text-bone";
            }
            if (isPlayer) {
              glyph = "@";
              tone = "text-bone text-glow";
            }
          }

          const dimUnseen = tile.seen && !tile.visible ? "opacity-50" : "";
          const hl = adjacent && tile.visible && tile.kind !== "wall" ? "ring-1 ring-arcane/40 cursor-pointer hover:bg-arcane/20" : "";

          return (
            <div
              key={`${x}-${y}`}
              onClick={() => onCellClick(x, y)}
              className={`relative flex items-center justify-center font-mono text-[14px] leading-none ${bg} ${tone} ${dimUnseen} ${hl}`}
              style={{ width: CELL, height: CELL }}
              title={monster ? `${monster.name} · ${monster.hp}/${monster.maxHp}` : item ? item.kind : undefined}
            >
              {glyph}
              {monster && monster.hp < monster.maxHp && tile.visible && (
                <div className="absolute -bottom-0 left-0.5 right-0.5 h-0.5 bg-border/70">
                  <div className="h-full bg-blood" style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }} />
                </div>
              )}
            </div>
          );
        })
      )}
      {/* damage flashes */}
      {game.flashes.slice(-5).map((f) => (
        <div
          key={f.id}
          className={`pointer-events-none absolute font-display text-xs font-bold animate-float-up ${
            f.kind === "hit" ? "text-blood" : f.kind === "heal" ? "text-ember" : "text-muted-foreground"
          }`}
          style={{ left: f.x * CELL + CELL / 2, top: f.y * CELL - 4, transform: "translateX(-50%)" }}
        >
          {f.text}
        </div>
      ))}
    </div>
  );
}

// ---------- HUD bits ----------

function Bar({ label, value, max, tone }: { label: string; value: number; max: number; tone: "blood" | "arcane" | "ember" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color = tone === "blood" ? "bg-gradient-blood" : tone === "arcane" ? "bg-gradient-arcane" : "bg-gradient-rune";
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between font-display text-[10px] tracking-widest">
        <span className={`text-${tone}`}>{label}</span>
        <span className="font-mono text-foreground/80">{value}/{max}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-border/60">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Stat({ label, v, prefix = "" }: { label: string; v: number; prefix?: string }) {
  return (
    <div className="rounded-sm border border-border/60 bg-background/40 p-1.5">
      <div className="font-display text-[9px] tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-base text-bone">{prefix}{v}</div>
    </div>
  );
}

function Inv({ label, qty, hint }: { label: string; qty: number; hint?: string }) {
  return (
    <li className="flex items-center justify-between rounded-sm border border-border/40 bg-card/40 px-2 py-1.5">
      <div>
        <div className="font-display text-[11px] tracking-wider text-bone">{label}</div>
        {hint && <div className="font-mono text-[9px] text-muted-foreground">{hint}</div>}
      </div>
      <div className={`font-mono text-sm ${qty > 0 ? "text-arcane" : "text-muted-foreground/50"}`}>×{qty}</div>
    </li>
  );
}

function ActionBtn({ label, hint, onClick, disabled, accent }: { label: string; hint: string; onClick?: () => void; disabled?: boolean; accent?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || !onClick}
      className={`flex flex-1 items-center justify-between gap-3 rounded-sm border px-3 py-2 text-left transition-all disabled:opacity-30 ${
        accent ? "border-ember/50 bg-ember/10 hover:bg-ember/20" : "border-border bg-card/60 hover:border-arcane"
      }`}
    >
      <span className={`font-display text-[11px] tracking-widest ${accent ? "text-ember" : "text-bone"}`}>{label}</span>
      <span className="font-mono text-[10px] text-muted-foreground">{hint}</span>
    </button>
  );
}

function AttentionMeter({ value, turn }: { value: number; turn: number }) {
  const pct = Math.min(100, (value / 10) * 100);
  return (
    <div className="w-full max-w-xs">
      <div className="flex items-center justify-between font-display text-[10px] tracking-[0.3em]">
        <span className="text-arcane">DUNGEON ATTENTION</span>
        <span className="text-blood">{value}/10 · T{turn}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-border/60">
        <div className="h-full bg-gradient-blood transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Overlay({ title, subtitle, cta, onClick }: { title: string; subtitle: string; cta?: string; onClick?: () => void }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-background/85 backdrop-blur-sm">
      <div className="text-center">
        <div className="font-display text-3xl text-glow text-bone">{title}</div>
        <div className="mt-2 font-serif italic text-muted-foreground">{subtitle}</div>
        {cta && (
          <button
            onClick={onClick}
            className="mt-6 rounded-sm border border-arcane/40 bg-gradient-arcane px-6 py-2 font-display text-xs tracking-[0.3em] text-bone shadow-arcane"
          >
            {cta}
          </button>
        )}
      </div>
    </div>
  );
}

function romanize(n: number) {
  const r = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return r[n - 1] ?? String(n);
}
