import { useMemo } from "react";
import type { GameState, Monster } from "@/lib/dungeon-engine";
import { tacticalEdge } from "@/lib/dungeon-engine";

/** Isometric tile metrics. */
const TW = 34; // diamond width
const TH = 17; // diamond height
const ZH = 15; // wall extrusion height

const BOX_H = TH + ZH;
const pct = (v: number) => `${(v / BOX_H) * 100}%`;

const CLIP_TOP = `polygon(50% 0, 100% ${pct(TH / 2)}, 50% ${pct(TH)}, 0 ${pct(TH / 2)})`;
const CLIP_LEFT = `polygon(0 ${pct(TH / 2)}, 50% ${pct(TH)}, 50% 100%, 0 ${pct(TH / 2 + ZH)})`;
const CLIP_RIGHT = `polygon(50% ${pct(TH)}, 100% ${pct(TH / 2)}, 100% ${pct(TH / 2 + ZH)}, 50% 100%)`;

function iso(x: number, y: number) {
  return { sx: (x - y) * (TW / 2), sy: (x + y) * (TH / 2) };
}

type TileSkin = { top: string; left: string; right: string; raised: boolean };

function skinFor(kind: string, visible: boolean): TileSkin {
  switch (kind) {
    case "wall":
      return { top: "color-mix(in oklab, var(--muted) 55%, transparent)", left: "color-mix(in oklab, var(--background) 92%, transparent)", right: "color-mix(in oklab, var(--muted) 22%, transparent)", raised: true };
    case "stairs":
      return { top: "color-mix(in oklab, var(--arcane) 35%, transparent)", left: "color-mix(in oklab, var(--arcane) 18%, transparent)", right: "color-mix(in oklab, var(--arcane) 10%, transparent)", raised: false };
    case "shrine":
      return { top: "color-mix(in oklab, var(--arcane) 28%, transparent)", left: "", right: "", raised: false };
    case "chest":
      return { top: "color-mix(in oklab, var(--ember) 25%, transparent)", left: "", right: "", raised: false };
    case "trap":
      return { top: visible ? "color-mix(in oklab, var(--blood) 28%, transparent)" : "var(--card)", left: "", right: "", raised: false };
    case "npc":
      return { top: "color-mix(in oklab, var(--bone) 18%, transparent)", left: "", right: "", raised: false };
    default:
      return { top: visible ? "var(--card)" : "color-mix(in oklab, var(--card) 55%, transparent)", left: "", right: "", raised: false };
  }
}

function tokenTone(tone: string, boss?: boolean) {
  if (boss) return "text-blood text-glow animate-flicker";
  return tone === "blood" ? "text-blood" : tone === "ember" ? "text-ember" : tone === "arcane" ? "text-arcane" : "text-bone";
}

export function IsoDungeon({
  game,
  onCellClick,
  height = 460,
}: {
  game: GameState;
  onCellClick: (x: number, y: number) => void;
  height?: number;
}) {
  const player = iso(game.player.x, game.player.y);

  const cells = useMemo(() => {
    const out: { x: number; y: number }[] = [];
    for (let y = 0; y < game.height; y++) {
      for (let x = 0; x < game.width; x++) {
        if (game.tiles[y][x].seen) out.push({ x, y });
      }
    }
    return out;
  }, [game.tiles, game.width, game.height, game.turn, game.floor]);

  return (
    <div className="relative overflow-hidden rounded-sm bg-black/80 ring-1 ring-arcane/20" style={{ height }}>
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          transform: `translate3d(${-player.sx}px, ${-player.sy - 20}px, 0)`,
          transition: "transform 140ms ease-out",
        }}
      >
        {cells.map(({ x, y }) => {
          const tile = game.tiles[y][x];
          const { sx, sy } = iso(x, y);
          const skin = skinFor(tile.kind, tile.visible);
          const dim = tile.visible ? 1 : 0.42;
          const lift = skin.raised ? ZH : 0;
          const adjacent = Math.abs(x - game.player.x) + Math.abs(y - game.player.y) === 1;

          return (
            <div
              key={`t-${x}-${y}`}
              onClick={() => onCellClick(x, y)}
              className={adjacent && tile.kind !== "wall" ? "cursor-pointer" : undefined}
              style={{
                position: "absolute",
                left: sx - TW / 2,
                top: sy - TH / 2 - lift,
                width: TW,
                height: BOX_H,
                zIndex: x + y,
                opacity: dim,
              }}
            >
              <div style={{ position: "absolute", inset: 0, clipPath: CLIP_TOP, background: skin.top }} />
              {skin.raised && (
                <>
                  <div style={{ position: "absolute", inset: 0, clipPath: CLIP_LEFT, background: skin.left }} />
                  <div style={{ position: "absolute", inset: 0, clipPath: CLIP_RIGHT, background: skin.right }} />
                </>
              )}
              {!skin.raised && (
                <div
                  style={{ position: "absolute", inset: 0, clipPath: CLIP_TOP }}
                  className="ring-0 border-0"
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      clipPath: CLIP_TOP,
                      boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--border) 35%, transparent)",
                    }}
                  />
                </div>
              )}
              {adjacent && tile.visible && tile.kind !== "wall" && (
                <div
                  className="animate-pulse"
                  style={{ position: "absolute", inset: 0, clipPath: CLIP_TOP, background: "color-mix(in oklab, var(--arcane) 18%, transparent)" }}
                />
              )}
            </div>
          );
        })}

        {/* Static tile markers (stairs, shrine, chest, trap) */}
        {cells.map(({ x, y }) => {
          const tile = game.tiles[y][x];
          const marker =
            tile.kind === "stairs" ? { g: ">", c: "text-arcane text-glow" }
            : tile.kind === "shrine" ? { g: "▲", c: "text-arcane text-glow animate-flicker" }
            : tile.kind === "chest" ? { g: "⌂", c: "text-ember text-glow-ember" }
            : tile.kind === "trap" && (tile.visible || tile.revealed) ? { g: "×", c: "text-blood" }
            : null;
          if (!marker) return null;
          const { sx, sy } = iso(x, y);
          return (
            <div
              key={`m-${x}-${y}`}
              className={`pointer-events-none absolute font-mono text-[13px] leading-none ${marker.c}`}
              style={{ left: sx - 6, top: sy - 12, zIndex: x + y + 1, opacity: tile.visible ? 1 : 0.5 }}
            >
              {marker.g}
            </div>
          );
        })}

        {/* Items */}
        {game.items.map((it) => {
          const tile = game.tiles[it.y]?.[it.x];
          if (!tile?.visible) return null;
          const { sx, sy } = iso(it.x, it.y);
          const g =
            it.kind === "potion" ? { g: "!", c: "text-blood" }
            : it.kind === "elixir" ? { g: "?", c: "text-arcane" }
            : it.kind === "shard" ? { g: "◇", c: "text-bone text-glow" }
            : it.kind === "gold" ? { g: "$", c: "text-ember" }
            : it.kind === "weapon" ? { g: "/", c: "text-bone" }
            : it.kind === "armor" ? { g: "[", c: "text-bone" }
            : { g: "○", c: "text-arcane" };
          return (
            <div
              key={`i-${it.id}`}
              className={`pointer-events-none absolute font-mono text-[13px] leading-none ${g.c}`}
              style={{ left: sx - 4, top: sy - 14, zIndex: it.x + it.y + 2 }}
            >
              {g.g}
            </div>
          );
        })}

        {/* NPCs */}
        {game.npcs.map((n) => {
          const tile = game.tiles[n.y]?.[n.x];
          if (!tile?.visible) return null;
          const { sx, sy } = iso(n.x, n.y);
          return (
            <Token key={`n-${n.id}`} sx={sx} sy={sy} z={n.x + n.y + 3} glyph={n.glyph} className={`${tokenTone(n.tone)} animate-flicker`} title={`${n.name} — bump to speak`} />
          );
        })}

        {/* Monsters */}
        {game.monsters.map((m) => {
          const tile = game.tiles[m.y]?.[m.x];
          if (!tile?.visible || m.hp <= 0) return null;
          const { sx, sy } = iso(m.x, m.y);
          const edge = tacticalEdge(game, m);
          return (
            <div key={`f-${m.id}`} style={{ position: "absolute", left: sx, top: sy, zIndex: m.x + m.y + 4 }}>
              <div
                className={`absolute -translate-x-1/2 font-mono text-[15px] leading-none ${tokenTone(m.tone, m.boss)}`}
                style={{ top: -22 }}
                title={`${m.name} · ${m.hp}/${m.maxHp}`}
              >
                {m.glyph}
              </div>
              {/* shadow */}
              <div
                className="absolute"
                style={{
                  left: -TW / 4, top: -TH / 4, width: TW / 2, height: TH / 2,
                  borderRadius: "50%", background: "color-mix(in oklab, var(--background) 70%, transparent)", filter: "blur(1px)",
                }}
              />
              {m.hp < m.maxHp && (
                <div className="absolute h-[3px] w-6 -translate-x-1/2 bg-border/70" style={{ top: -30 }}>
                  <div className="h-full bg-blood" style={{ width: `${(m.hp / m.maxHp) * 100}%` }} />
                </div>
              )}
              {(m.winding ?? 0) > 0 && (
                <div className="absolute -translate-x-1/2 whitespace-nowrap rounded-sm border border-ember/70 bg-ember/20 px-1 font-display text-[8px] tracking-[0.2em] text-ember animate-pulse" style={{ top: -44 }}>
                  WIND-UP
                </div>
              )}
              {edge.flank && (m.winding ?? 0) === 0 && (
                <div className="absolute -translate-x-1/2 whitespace-nowrap font-display text-[8px] tracking-[0.2em] text-arcane" style={{ top: -44 }}>
                  CORNERED
                </div>
              )}
            </div>
          );
        })}

        {/* Player */}
        <div style={{ position: "absolute", left: player.sx, top: player.sy, zIndex: game.player.x + game.player.y + 5, transition: "left 140ms, top 140ms" }}>
          <div
            className="absolute"
            style={{
              left: -TW / 4, top: -TH / 4, width: TW / 2, height: TH / 2,
              borderRadius: "50%", background: "color-mix(in oklab, var(--background) 75%, transparent)", filter: "blur(1px)",
            }}
          />
          <div className="absolute -translate-x-1/2 font-mono text-[16px] leading-none text-bone text-glow" style={{ top: -24 }}>
            @
          </div>
        </div>

        {/* Floating flashes */}
        {game.flashes.slice(-8).map((f) => {
          const { sx, sy } = iso(f.x, f.y);
          const c =
            f.kind === "hit" ? "text-blood" : f.kind === "heal" ? "text-bone" : f.kind === "event" ? "text-ember" : "text-muted-foreground";
          return (
            <div
              key={f.id}
              className={`pointer-events-none absolute animate-float-up font-display text-[11px] tracking-widest ${c}`}
              style={{ left: sx, top: sy - 34, zIndex: 9999 }}
            >
              {f.text}
            </div>
          );
        })}
      </div>

      {/* light + fog */}
      <div className="pointer-events-none absolute inset-0 fog-vignette" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 player-halo"
        style={{ width: 260, height: 200, transform: "translate(-50%, -60%)" }}
      />
    </div>
  );
}

function Token({ sx, sy, z, glyph, className, title }: { sx: number; sy: number; z: number; glyph: string; className?: string; title?: string }) {
  return (
    <div style={{ position: "absolute", left: sx, top: sy, zIndex: z }} title={title}>
      <div
        className="absolute"
        style={{ left: -TW / 4, top: -TH / 4, width: TW / 2, height: TH / 2, borderRadius: "50%", background: "color-mix(in oklab, var(--background) 70%, transparent)", filter: "blur(1px)" }}
      />
      <div className={`absolute -translate-x-1/2 font-mono text-[15px] leading-none ${className ?? ""}`} style={{ top: -22 }}>
        {glyph}
      </div>
    </div>
  );
}

export type { Monster };
