import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { RuneFrame } from "@/components/RuneFrame";
import { ASPECTS, RACES, TIERS } from "@/lib/game-data";
import { loadCharacter, type StoredCharacter } from "@/lib/character-storage";
import {
  biomeForFloor,
  buyOffer,
  generateDungeon,
  invokeShrine,
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
  type ShopOffer,
  type StatusKey,
} from "@/lib/dungeon-engine";
import { loadMeta, nextUnlock, purchaseUnlock, recordRun, type MetaState } from "@/lib/meta-storage";
import { beastImage } from "@/lib/beast-images";
import { FloorIntroModal } from "@/components/FloorIntroModal";
import { applyFloorChoice, type FloorChoice } from "@/lib/floor-events";
import { emptySaga, type Saga } from "@/lib/saga";
import { sfx, isMuted, toggleMuted } from "@/lib/sfx";
import { LevelUpBurst } from "@/components/LevelUpBurst";
import { Volume2, VolumeX, Swords, Hourglass, FlaskConical, Beaker, Sparkles, Flame } from "lucide-react";

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
const CELL = 22;

function DungeonPage() {
  const [character, setCharacter] = useState<StoredCharacter | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [meta, setMeta] = useState<MetaState | null>(null);
  const [shaking, setShaking] = useState(false);
  const lastShakeRef = useRef(0);
  const recordedRef = useRef(false);
  const seenBeastsRef = useRef<Set<string>>(new Set());
  const [encounterQueue, setEncounterQueue] = useState<{ name: string; level: number }[]>([]);
  const [floorIntro, setFloorIntro] = useState<{ floor: number; isSanctuary: boolean } | null>(null);
  const [saga, setSaga] = useState<Saga>(() => emptySaga());
  const lastIntroFloorRef = useRef<number>(-1);
  const prevRef = useRef<{
    hp: number; tier: number; floor: number; kills: number; bossKills: number;
    gold: number; shards: number; potions: number; elixirs: number; shield: number;
    status: GameState["status"]; logLen: number; turn: number;
  } | null>(null);
  const [levelBurst, setLevelBurst] = useState<number | null>(null);
  const [combo, setCombo] = useState<{ n: number; lastTurn: number }>({ n: 0, lastTurn: -99 });
  const [muted, setMutedState] = useState<boolean>(() => isMuted());

  // Show floor intro modal whenever we arrive on a new floor
  useEffect(() => {
    if (!game) return;
    if (game.floor === lastIntroFloorRef.current) return;
    lastIntroFloorRef.current = game.floor;
    setFloorIntro({ floor: game.floor, isSanctuary: game.isSanctuary });
  }, [game?.floor]);

  // Trigger reveal portrait only when the beast is in melee proximity (engagement)
  useEffect(() => {
    if (!game) return;
    const px = game.player.x;
    const py = game.player.y;
    const newly: { name: string; level: number }[] = [];
    for (const m of game.monsters) {
      if (m.hp <= 0) continue;
      if (!beastImage(m.name)) continue;
      const dist = Math.max(Math.abs(m.x - px), Math.abs(m.y - py));
      if (dist > 1) continue;
      if (seenBeastsRef.current.has(m.name)) continue;
      seenBeastsRef.current.add(m.name);
      const level = m.boss ? Math.max(game.floor, 3) + 2 : game.floor;
      newly.push({ name: m.name, level });
    }
    if (newly.length) setEncounterQueue((q) => [...q, ...newly]);
  }, [game]);

  const currentEncounter = encounterQueue[0];


  // Load character + start
  useEffect(() => {
    const c = loadCharacter();
    setCharacter(c);
    const p = makePlayer(c.vitals);
    setGame(generateDungeon(GRID_W, GRID_H, 1, p));
    setMeta(loadMeta());
  }, []);

  // Trigger screen shake when engine reports new shake
  useEffect(() => {
    if (!game) return;
    if (game.shakeUntil > lastShakeRef.current) {
      lastShakeRef.current = game.shakeUntil;
      setShaking(true);
      const t = setTimeout(() => setShaking(false), 350);
      return () => clearTimeout(t);
    }
  }, [game?.shakeUntil]);

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
      else if (k === "q") { e.preventDefault(); setGame((g) => (g && character ? usePower(g, character.aspectId) : g)); }
      else if (k === "r") { e.preventDefault(); setGame((g) => (g ? invokeShrine(g) : g)); }
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
      }, 700);
      return () => clearTimeout(t);
    }
    if (game.status === "dead" && !recordedRef.current) {
      recordedRef.current = true;
      const m = recordRun({
        floor: game.floor,
        kills: game.counters.kills,
        bossKills: game.counters.bossKills,
        gold: game.counters.goldEarned,
        shards: game.counters.shardsEarned,
        turns: game.turn,
        tier: game.player.tier,
        cause: game.cause,
      });
      setMeta(m);
    }
    if (game.status === "playing") recordedRef.current = false;
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
  const onShrine = game.tiles[game.player.y][game.player.x].kind === "shrine";

  const onCellClick = (x: number, y: number) => {
    if (game.status !== "playing") return;
    const dx = x - game.player.x;
    const dy = y - game.player.y;
    if (Math.abs(dx) + Math.abs(dy) !== 1) return;
    const dir: MoveDir = dx === 1 ? "e" : dx === -1 ? "w" : dy === 1 ? "s" : "n";
    setGame((g) => (g ? step(g, dir) : g));
  };

  const restart = () => {
    const p = makePlayer(character.vitals);
    setSaga(emptySaga());
    lastIntroFloorRef.current = -1;
    setGame(generateDungeon(GRID_W, GRID_H, 1, p));
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        {/* HUD top */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className={`font-display text-[10px] tracking-[0.4em] ${biomeForFloor(game.floor).accentClass}`}>
              {game.isSanctuary ? "SANCTUARY · " : ""}FLOOR {romanize(game.floor)} · {biomeForFloor(game.floor).name.toUpperCase()}
            </div>
            <h1 className="font-display text-2xl md:text-3xl text-glow">{character.name}</h1>
            <div className="mt-0.5 font-serif text-sm italic text-muted-foreground">
              {race?.name} · {aspect?.name} <span className="text-muted-foreground/60">·</span> <span className="italic">{biomeForFloor(game.floor).subtitle}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <AttentionMeter value={game.attention} turn={game.turn} sanctuary={game.isSanctuary} />
            {meta && (
              <div className="font-mono text-[10px] text-muted-foreground">
                META · ◇{meta.totalShards} shards · deepest F{meta.deepestFloor} · {meta.totalRuns} runs
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr_320px]">
          {/* Left column: vitals + equipment */}
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

            <StatusBadges statuses={game.player.statuses} />

            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
              <Stat label="AC" v={game.player.ac} />
              <Stat label="ATK+" v={game.player.atkBonus} />
              <Stat label="DIE" v={game.player.weaponDie} prefix="d" />
            </div>

            <div className="mt-4 font-display text-[10px] tracking-[0.4em] text-arcane">EQUIPMENT</div>
            <ul className="mt-2 space-y-1.5 text-xs">
              <EqRow slot="WEAPON" v={
                game.player.equipment.weapon
                  ? `${game.player.equipment.weapon.name} · 1d${game.player.equipment.weapon.die}+${game.player.equipment.weapon.bonus}${game.player.equipment.weapon.tag ? " · " + game.player.equipment.weapon.tag : ""}`
                  : "Bare fists"
              } />
              <EqRow slot="ARMOR" v={
                game.player.equipment.armor
                  ? `${game.player.equipment.armor.name} · +${game.player.equipment.armor.ac} AC · ${game.player.equipment.armor.dr} DR`
                  : "Unarmored"
              } />
              <EqRow slot="TRINKET" v={
                game.player.equipment.trinket
                  ? `${game.player.equipment.trinket.name} · ${game.player.equipment.trinket.effect}`
                  : "None"
              } />
            </ul>

            <div className="mt-4 font-display text-[10px] tracking-[0.4em] text-arcane">ADVENTURER'S BAG</div>
            <ul className="mt-2 space-y-1.5 text-xs">
              <Inv label="Crimson Draught" qty={game.player.potions} hint="[1] heal 18" />
              <Inv label="Focus Elixir" qty={game.player.elixirs} hint="[2] +10 focus" />
              <Inv label="Obols" qty={game.player.gold} />
              <Inv label="Bloodbound Shards" qty={game.player.shards} />
            </ul>


            {(saga.blessings.length > 0 || saga.curses.length > 0) && (
              <>
                <div className="mt-4 font-display text-[10px] tracking-[0.4em] text-arcane">SAGA</div>
                <ul className="mt-2 space-y-1.5 text-xs">
                  {saga.blessings.map((b) => (
                    <li key={b.id} className="rounded-sm border border-ember/40 bg-ember/5 px-2 py-1">
                      <div className="font-display text-[10px] tracking-widest text-ember">✦ {b.name.toUpperCase()}</div>
                      <div className="mt-0.5 font-serif text-[11px] italic text-muted-foreground">{b.desc}</div>
                    </li>
                  ))}
                  {saga.curses.map((c) => (
                    <li key={c.id} className="rounded-sm border border-blood/40 bg-blood/5 px-2 py-1">
                      <div className="font-display text-[10px] tracking-widest text-blood">✖ {c.name.toUpperCase()}</div>
                      <div className="mt-0.5 font-serif text-[11px] italic text-muted-foreground">{c.desc}</div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="mt-4 rounded-sm border border-arcane/30 bg-arcane/5 p-3">
              <div className="font-display text-[10px] tracking-widest text-arcane">ASPECT POWER · [Q]</div>
              <div className="mt-1 font-display text-sm tracking-wider text-bone">{power.label}</div>
              <div className="mt-0.5 font-serif text-[11px] italic text-muted-foreground">{power.desc}</div>
              <div className="mt-1 font-mono text-[10px] text-ember">Cost · {power.cost} Focus</div>
            </div>
          </RuneFrame>

          {/* Map */}
          <RuneFrame className="p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="font-display text-[10px] tracking-[0.4em] text-arcane">
                {game.isSanctuary ? "THE SANCTUARY" : "THE DUNGEON"}
              </div>
              <div className="hidden gap-3 text-[10px] font-display tracking-widest text-muted-foreground md:flex">
                <span><span className="text-arcane">@</span> YOU</span>
                <span><span className="text-blood">g/c/s</span> FOES</span>
                <span><span className="text-ember">!</span> POTION</span>
                <span><span className="text-bone">◇</span> SHARD</span>
                <span><span className="text-arcane">▲</span> SHRINE</span>
                <span><span className="text-ember">⌂</span> CHEST</span>
                <span><span className="text-blood">×</span> TRAP</span>
                <span><span className="text-arcane">&gt;</span> STAIRS</span>
              </div>
            </div>
            <div
              className={`relative mx-auto select-none overflow-hidden rounded-sm bg-black/60 ring-1 ring-arcane/20 ${shaking ? "animate-shake" : ""}`}
              style={{ width: GRID_W * CELL, maxWidth: "100%", aspectRatio: `${GRID_W} / ${GRID_H}` }}
            >
              <DungeonGrid game={game} onCellClick={onCellClick} />
              {/* fog vignette */}
              <div className="pointer-events-none absolute inset-0 fog-vignette" />
              {/* player halo */}
              <div
                className="pointer-events-none absolute player-halo"
                style={{
                  width: CELL * 7,
                  height: CELL * 7,
                  left: game.player.x * CELL + CELL / 2 - (CELL * 7) / 2,
                  top: game.player.y * CELL + CELL / 2 - (CELL * 7) / 2,
                  transition: "left 0.12s linear, top 0.12s linear",
                }}
              />

              {/* overlays */}
              {game.status === "dead" && meta && (
                <DeathSummary game={game} meta={meta} character={character} onRestart={() => { recordedRef.current = false; restart(); }} onMeta={() => setMeta(loadMeta())} />
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
              {onShrine && (
                <ActionBtn label="INVOKE SHRINE" hint="[R]" onClick={() => setGame((g) => g ? invokeShrine(g) : g)} accent />
              )}
            </div>

            {/* Shop appears under map on sanctuary floors */}
            {game.isSanctuary && game.shop && game.status === "playing" && (
              <ShopPanel
                offers={game.shop}
                gold={game.player.gold}
                onBuy={(id) => setGame((g) => g ? buyOffer(g, id) : g)}
              />
            )}
          </RuneFrame>

          {/* Right column: foes + dice + log */}
          <RuneFrame className="flex flex-col p-4">
            <FoesInSight game={game} />
            <div className="mt-3 font-display text-[10px] tracking-[0.4em] text-arcane">CHRONICLE</div>
            {game.lastDice && (
              <div key={game.lastDice.value + "-" + game.turn} className="mt-2 rounded-sm border border-arcane/40 bg-background/60 p-2 text-center">
                <div className="font-display text-[10px] tracking-widest text-arcane">D20 · {game.lastDice.label}</div>
                <div className="font-display text-3xl text-glow text-bone animate-dice-pop">{game.lastDice.value}</div>
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
                    entry.t === "event" ? "border-bone/50 bg-bone/5 font-serif italic text-bone" :
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
              <span className="ml-3 text-blood">⚔ {game.counters.kills} kills</span>
              <span className="ml-3 text-ember">◎ {game.counters.goldEarned} earned</span>
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

      {currentEncounter && (
        <BeastEncounterModal
          name={currentEncounter.name}
          level={currentEncounter.level}
          desc={game.monsters.find((m) => m.name === currentEncounter.name)?.desc ?? ""}
          isBoss={!!game.monsters.find((m) => m.name === currentEncounter.name)?.boss}
          onClose={() => setEncounterQueue((q) => q.slice(1))}
        />
      )}

      {floorIntro && (
        <FloorIntroModal
          floor={floorIntro.floor}
          isSanctuary={floorIntro.isSanctuary}
          saga={saga}
          onChoice={(c: FloorChoice) => {
            setGame((g) => {
              if (!g) return g;
              const res = applyFloorChoice(g, saga, c);
              setSaga(res.saga);
              return res.game;
            });
          }}
          onClose={() => setFloorIntro(null)}
        />
      )}
    </div>
  );
}

// ---------- Beast Encounter Modal ----------
function BeastEncounterModal({ name, level, desc, isBoss, onClose }: { name: string; level: number; desc: string; isBoss: boolean; onClose: () => void }) {
  const img = beastImage(name);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);
  if (!img) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Encounter: ${name}`}
    >
      <div
        className="relative max-w-lg w-full overflow-hidden rounded-sm border border-arcane/60 bg-card shadow-rune"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-square w-full overflow-hidden">
          <img
            src={img}
            alt={name}
            width={1024}
            height={1024}
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
          <div className="absolute left-0 right-0 top-3 text-center">
            <div className={`font-display text-[10px] tracking-[0.5em] ${isBoss ? "text-blood" : "text-arcane"} animate-flicker`}>
              {isBoss ? "◆ A SOVEREIGN FOE APPEARS ◆" : "◆ A NEW BEAST APPEARS ◆"}
            </div>
          </div>
          <div className="absolute right-3 top-10 flex flex-col items-center rounded-sm border border-ember/50 bg-background/80 px-2.5 py-1.5 shadow-rune">
            <div className="font-display text-[8px] tracking-[0.3em] text-ember">LVL</div>
            <div className="font-display text-xl leading-none text-glow-ember text-ember">{level}</div>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl tracking-widest text-bone text-glow">{name.toUpperCase()}</h2>
            <span className={`shrink-0 font-display text-[10px] tracking-widest ${isBoss ? "text-blood" : "text-arcane"}`}>
              {isBoss ? "BOSS" : "BEAST"} · LVL {level}
            </span>
          </div>
          <p className="mt-3 font-serif text-sm italic leading-relaxed text-foreground/85">{desc}</p>
          <button
            onClick={onClose}
            className="mt-5 w-full rounded-sm border border-arcane/50 bg-arcane/10 px-4 py-2 font-display text-xs tracking-[0.4em] text-arcane transition-colors hover:bg-arcane/20 hover:text-glow"
            autoFocus
          >
            FACE IT — [SPACE]
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Map renderer ----------


function DungeonGrid({ game, onCellClick }: { game: GameState; onCellClick: (x: number, y: number) => void }) {
  return (
    <div
      className="relative grid"
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
            } else if (tile.kind === "stairs") {
              bg = "bg-arcane/15";
              glyph = ">";
              tone = "text-arcane text-glow";
            } else if (tile.kind === "shrine") {
              bg = "bg-arcane/20";
              glyph = "▲";
              tone = "text-arcane text-glow animate-flicker";
            } else if (tile.kind === "chest") {
              bg = "bg-ember/15";
              glyph = "⌂";
              tone = "text-ember text-glow-ember";
            } else if (tile.kind === "trap") {
              if (tile.visible) {
                bg = "bg-blood/15";
                glyph = "×";
                tone = "text-blood";
              } else {
                bg = "bg-card/70";
                glyph = "·";
                tone = "text-muted-foreground/40";
              }
            } else {
              bg = tile.visible ? "bg-card/70" : "bg-card/30";
              glyph = "·";
              tone = "text-muted-foreground/40";
            }
          }

          if (tile.visible) {
            if (item) {
              if (item.kind === "potion") { glyph = "!"; tone = "text-blood"; }
              else if (item.kind === "elixir") { glyph = "?"; tone = "text-arcane"; }
              else if (item.kind === "shard") { glyph = "◇"; tone = "text-bone text-glow"; }
              else if (item.kind === "gold") { glyph = "$"; tone = "text-ember"; }
              else if (item.kind === "weapon") { glyph = "/"; tone = "text-bone text-glow-ember"; }
              else if (item.kind === "armor") { glyph = "["; tone = "text-bone text-glow-ember"; }
              else if (item.kind === "trinket") { glyph = "○"; tone = "text-arcane text-glow"; }
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
              title={
                monster ? `${monster.name} · ${monster.hp}/${monster.maxHp}${monsterStatusText(monster.statuses)}`
                  : item ? itemTitle(item)
                  : tile.kind === "shrine" ? "Shrine — invoke with [R]"
                  : tile.kind === "chest" ? "Chest — step onto it"
                  : undefined
              }
            >
              {glyph}
              {monster && monster.hp < monster.maxHp && tile.visible && (
                <div className="absolute -bottom-0 left-0.5 right-0.5 h-0.5 bg-border/70">
                  <div className="h-full bg-blood" style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }} />
                </div>
              )}
              {monster && tile.visible && hasStatuses(monster.statuses) && (
                <div className="absolute -top-0.5 left-0.5 right-0.5 flex gap-0.5">
                  {(monster.statuses.bleed ?? 0) > 0 && <span className="h-0.5 flex-1 bg-blood" />}
                  {(monster.statuses.burn ?? 0) > 0 && <span className="h-0.5 flex-1 bg-ember" />}
                </div>
              )}
            </div>
          );
        })
      )}
      {/* damage flashes */}
      {game.flashes.slice(-8).map((f) => (
        <div
          key={f.id}
          className={`pointer-events-none absolute font-display text-xs font-bold animate-float-out ${
            f.kind === "hit" ? "text-blood" : f.kind === "heal" ? "text-ember" : f.kind === "event" ? "text-arcane text-glow" : "text-muted-foreground"
          }`}
          style={{ left: f.x * CELL + CELL / 2, top: f.y * CELL - 2, transform: "translateX(-50%)" }}
        >
          {f.text}
        </div>
      ))}
    </div>
  );
}

// ---------- Foes in Sight ----------
function FoesInSight({ game }: { game: GameState }) {
  const foes = game.monsters.filter((m) => m.hp > 0 && game.tiles[m.y]?.[m.x]?.visible);
  if (foes.length === 0) {
    return (
      <div className="rounded-sm border border-border/60 bg-card/40 p-3 text-center">
        <div className="font-display text-[10px] tracking-[0.4em] text-muted-foreground">FOES IN SIGHT</div>
        <div className="mt-1 font-serif text-[11px] italic text-muted-foreground/70">The dark holds its breath.</div>
      </div>
    );
  }
  const toneClass = (t: string) =>
    t === "blood" ? "text-blood border-blood/50" :
    t === "ember" ? "text-ember border-ember/50" :
    t === "bone" ? "text-bone border-bone/50" :
    "text-arcane border-arcane/50";
  return (
    <div className="space-y-2">
      <div className="font-display text-[10px] tracking-[0.4em] text-blood">FOES IN SIGHT · {foes.length}</div>
      {foes.slice(0, 4).map((m) => {
        const adjacent =
          Math.abs(m.x - game.player.x) + Math.abs(m.y - game.player.y) === 1;
        return (
          <div
            key={m.id}
            className={`rounded-sm border bg-background/60 p-2 ${toneClass(m.tone)} ${adjacent ? "shadow-rune" : ""}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-lg leading-none">{m.glyph}</span>
                <span className="truncate font-display text-xs tracking-widest">
                  {m.boss ? "⚜ " : ""}{m.name.toUpperCase()}
                </span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">AC {m.ac}</span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border/60">
              <div
                className="h-full bg-blood transition-all"
                style={{ width: `${Math.max(0, (m.hp / m.maxHp) * 100)}%` }}
              />
            </div>
            <div className="mt-0.5 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
              <span>{m.hp}/{m.maxHp} HP</span>
              <span>1d{m.atk} ATK · +{m.bonus}</span>
            </div>
            <p className="mt-1.5 font-serif text-[11px] italic leading-snug text-foreground/80">
              {m.desc}
            </p>
            {hasStatuses(m.statuses) && (
              <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                {monsterStatusText(m.statuses).replace(/^ · /, "")}
              </div>
            )}
            {adjacent && (
              <div className="mt-1 font-display text-[9px] tracking-[0.3em] text-blood animate-flicker">
                ADJACENT — STRIKE TO ATTACK
              </div>
            )}
          </div>
        );
      })}
      {foes.length > 4 && (
        <div className="text-center font-mono text-[10px] text-muted-foreground">
          + {foes.length - 4} more lurking…
        </div>
      )}
    </div>
  );
}

function hasStatuses(s: { [k: string]: number | undefined }) {
  return !!(s.bleed || s.burn || s.poison);
}
function monsterStatusText(s: { [k: string]: number | undefined }) {
  const parts: string[] = [];
  if (s.bleed) parts.push(`bleed ${s.bleed}`);
  if (s.burn) parts.push(`burn ${s.burn}`);
  if (s.poison) parts.push(`poison ${s.poison}`);
  return parts.length ? ` · ${parts.join(", ")}` : "";
}
function itemTitle(it: { kind: string; weapon?: { name: string }; armor?: { name: string }; trinket?: { name: string } }) {
  if (it.weapon) return `Weapon — ${it.weapon.name}`;
  if (it.armor) return `Armor — ${it.armor.name}`;
  if (it.trinket) return `Trinket — ${it.trinket.name}`;
  return it.kind;
}

// ---------- Status badges ----------
const STATUS_META: Record<StatusKey, { label: string; tone: string }> = {
  bleed:   { label: "BLEED",   tone: "text-blood border-blood/50 bg-blood/10" },
  burn:    { label: "BURN",    tone: "text-ember border-ember/50 bg-ember/10" },
  poison:  { label: "POISON",  tone: "text-arcane border-arcane/50 bg-arcane/10" },
  blessed: { label: "BLESSED", tone: "text-bone border-bone/50 bg-bone/10" },
  rooted:  { label: "ROOTED",  tone: "text-arcane border-arcane/50 bg-arcane/10" },
};
function StatusBadges({ statuses }: { statuses: { [k: string]: number | undefined } }) {
  const active = (Object.keys(statuses) as StatusKey[]).filter((k) => (statuses[k] ?? 0) > 0);
  if (!active.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {active.map((k) => (
        <span key={k} className={`rounded-sm border px-1.5 py-0.5 font-display text-[9px] tracking-widest ${STATUS_META[k].tone}`}>
          {STATUS_META[k].label} · {statuses[k]}
        </span>
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

function EqRow({ slot, v }: { slot: string; v: string }) {
  return (
    <li className="rounded-sm border border-border/40 bg-card/40 px-2 py-1.5">
      <div className="font-display text-[9px] tracking-widest text-arcane">{slot}</div>
      <div className="font-serif text-[11px] text-foreground/90">{v}</div>
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

function AttentionMeter({ value, turn, sanctuary }: { value: number; turn: number; sanctuary: boolean }) {
  const pct = Math.min(100, (value / 10) * 100);
  return (
    <div className="w-full max-w-xs">
      <div className="flex items-center justify-between font-display text-[10px] tracking-[0.3em]">
        <span className={sanctuary ? "text-arcane" : "text-arcane"}>{sanctuary ? "QUIET HOLDS" : "DUNGEON ATTENTION"}</span>
        <span className="text-blood">{value}/10 · T{turn}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-border/60">
        <div className={`h-full ${sanctuary ? "bg-gradient-arcane" : "bg-gradient-blood"} transition-all`} style={{ width: `${pct}%` }} />
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

// ---------- Shop ----------

function ShopPanel({ offers, gold, onBuy }: { offers: ShopOffer[]; gold: number; onBuy: (id: string) => void }) {
  return (
    <div className="mt-4 rounded-sm border border-arcane/40 bg-arcane/5 p-4">
      <div className="flex items-center justify-between">
        <div className="font-display text-[10px] tracking-[0.4em] text-arcane">THE SANCTUARY MERCHANT</div>
        <div className="font-mono text-xs text-ember">PURSE · {gold} obols</div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {offers.map((o) => {
          const can = gold >= o.cost;
          const subtitle = o.kind === "weapon" && o.payload && typeof o.payload === "object"
            ? `${(o.payload as { name: string }).name}`
            : o.kind === "armor" && o.payload && typeof o.payload === "object"
            ? `${(o.payload as { name: string }).name}`
            : o.kind === "trinket" && o.payload && typeof o.payload === "object"
            ? `${(o.payload as { name: string }).name}`
            : o.desc;
          return (
            <button
              key={o.id}
              onClick={() => can && onBuy(o.id)}
              disabled={!can}
              className={`text-left rounded-sm border p-3 transition-all disabled:opacity-40 ${
                can ? "border-border bg-card/60 hover:border-arcane" : "border-border bg-card/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-display text-[11px] tracking-widest text-bone">{o.label}</div>
                <div className="font-mono text-[11px] text-ember">{o.cost}</div>
              </div>
              <div className="mt-1 font-serif text-[11px] italic text-muted-foreground">{subtitle}</div>
              {o.kind === "weapon" && o.payload && typeof o.payload === "object" && "die" in (o.payload as object) && (
                <div className="mt-1 font-mono text-[10px] text-arcane">
                  1d{(o.payload as { die: number }).die}+{(o.payload as { bonus: number }).bonus}
                  {(o.payload as { tag?: string }).tag ? ` · ${(o.payload as { tag: string }).tag}` : ""}
                </div>
              )}
              {o.kind === "armor" && o.payload && typeof o.payload === "object" && "ac" in (o.payload as object) && (
                <div className="mt-1 font-mono text-[10px] text-arcane">
                  +{(o.payload as { ac: number }).ac} AC · {(o.payload as { dr: number }).dr} DR
                </div>
              )}
              {o.kind === "trinket" && o.payload && typeof o.payload === "object" && "effect" in (o.payload as object) && (
                <div className="mt-1 font-mono text-[10px] text-arcane">{(o.payload as { effect: string }).effect}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Death summary ----------

function DeathSummary({
  game, meta, character, onRestart, onMeta,
}: {
  game: GameState;
  meta: MetaState;
  character: StoredCharacter;
  onRestart: () => void;
  onMeta: () => void;
}) {
  const unlock = useMemo(() => nextUnlock(meta), [meta]);
  const causeText = useMemo(() => {
    switch (game.cause) {
      case "boss": return "Felled by a Sovereign of the Deep.";
      case "trap": return "Felled by the dungeon's hidden teeth.";
      case "claws": return "Felled in the press of claws and steel.";
      case "fate": return "Felled by the Wager of Stars.";
      default: return "Felled.";
    }
  }, [game.cause]);

  const claim = () => {
    const r = purchaseUnlock();
    if (r.unlocked) onMeta();
  };

  return (
    <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-background/90 backdrop-blur-sm p-4">
      <div className="max-w-md w-full rounded-sm border border-blood/50 bg-card/80 p-6 shadow-deep">
        <div className="text-center">
          <div className="font-display text-[10px] tracking-[0.4em] text-blood">CHRONICLE END</div>
          <h2 className="mt-2 font-display text-3xl text-glow text-bone">You Have Fallen</h2>
          <p className="mt-2 font-serif italic text-muted-foreground">{causeText}</p>
          <p className="mt-1 font-serif italic text-arcane">{character.name}</p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <StatBlock label="FLOOR" value={`${game.floor}`} tone="text-arcane" />
          <StatBlock label="TIER" value={`${romanize(game.player.tier)}`} tone="text-bone" />
          <StatBlock label="TURNS" value={`${game.turn}`} tone="text-muted-foreground" />
          <StatBlock label="KILLS" value={`${game.counters.kills}`} tone="text-blood" />
          <StatBlock label="BOSSES" value={`${game.counters.bossKills}`} tone="text-blood" />
          <StatBlock label="OBOLS" value={`${game.counters.goldEarned}`} tone="text-ember" />
          <StatBlock label="SHARDS" value={`◇${game.counters.shardsEarned}`} tone="text-bone" />
          <StatBlock label="DEALT" value={`${game.counters.damageDealt}`} tone="text-blood" />
          <StatBlock label="TAKEN" value={`${game.counters.damageTaken}`} tone="text-arcane" />
        </div>

        {/* Meta totals */}
        <div className="mt-5 rounded-sm border border-arcane/30 bg-arcane/5 p-3 text-center">
          <div className="font-display text-[10px] tracking-[0.4em] text-arcane">YOUR ASHES PERSIST</div>
          <div className="mt-2 font-mono text-xs text-muted-foreground">
            ◇ {meta.totalShards} shards · {meta.totalRuns} runs · deepest F{meta.deepestFloor}
          </div>
          {unlock ? (
            <div className="mt-3">
              <div className="font-display text-[10px] tracking-widest text-bone">
                NEXT UNLOCK · {unlock.kind === "race" ? "BLOODLINE" : "ASPECT"}
              </div>
              <div className="mt-1 font-serif italic text-foreground/90">{unlock.name}</div>
              <button
                onClick={claim}
                disabled={meta.totalShards < unlock.cost}
                className="mt-2 rounded-sm border border-ember/50 bg-ember/10 px-4 py-1.5 font-display text-[10px] tracking-widest text-ember disabled:opacity-40"
              >
                CLAIM · ◇{unlock.cost}
              </button>
            </div>
          ) : (
            <div className="mt-2 font-serif italic text-arcane">All bloodlines and aspects are yours.</div>
          )}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onRestart}
            className="flex-1 rounded-sm border border-arcane/40 bg-gradient-arcane px-4 py-2 font-display text-[11px] tracking-[0.3em] text-bone shadow-arcane"
          >
            RISE AGAIN
          </button>
          <Link
            to="/create"
            className="flex-1 rounded-sm border border-border bg-card/60 px-4 py-2 text-center font-display text-[11px] tracking-[0.3em] text-foreground/90 hover:border-arcane"
          >
            NEW ASCENDANT
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-sm border border-border/60 bg-background/40 p-2">
      <div className="font-display text-[9px] tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-display text-lg ${tone}`}>{value}</div>
    </div>
  );
}

function romanize(n: number) {
  const r = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];
  return r[n - 1] ?? String(n);
}
