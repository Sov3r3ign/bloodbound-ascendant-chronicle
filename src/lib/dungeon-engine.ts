// Bloodbound Ascendants — dungeon engine (procedural roguelike core)

export type TileKind = "wall" | "floor" | "door" | "stairs";
export type Tile = { kind: TileKind; seen: boolean; visible: boolean };

export type Monster = {
  id: number;
  x: number;
  y: number;
  name: string;
  glyph: string;
  tone: "blood" | "ember" | "arcane" | "bone";
  hp: number;
  maxHp: number;
  atk: number; // damage die max
  bonus: number; // to-hit
  ac: number;
  xp: number;
  awake: boolean;
  rootedFor: number;
  boss?: boolean;
};

export type Item = {
  id: number;
  x: number;
  y: number;
  kind: "potion" | "elixir" | "gold" | "shard";
  amount: number;
};

export type Player = {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  focus: number;
  maxFocus: number;
  ac: number;
  atkBonus: number;
  weaponDie: number;
  shield: number;
  buffTurns: number;
  buffDmg: number;
  xp: number;
  tier: number;
  gold: number;
  shards: number;
  potions: number;
  elixirs: number;
};

export type LogEntry = { t: "narrative" | "roll" | "system" | "combat" | "loot"; m: string };

export type GameState = {
  width: number;
  height: number;
  tiles: Tile[][]; // [y][x]
  monsters: Monster[];
  items: Item[];
  player: Player;
  floor: number;
  turn: number;
  log: LogEntry[];
  attention: number;
  status: "playing" | "dead" | "ascended";
  lastDice: { value: number; outcome: string; label: string } | null;
  flashes: { x: number; y: number; kind: "hit" | "miss" | "heal"; text: string; id: number }[];
};

export const TIER_XP = [0, 100, 300, 700, 1500, 3000, 6000];
export const TIER_NAMES = ["Stirring", "Awakened", "Ascendant", "Sovereign", "Mythic", "Transcendent"];

// ---- RNG (deterministic-ish) ----
let rngSeed = Date.now() >>> 0;
export function seed(n: number) { rngSeed = n >>> 0 || 1; }
export function rand() {
  // mulberry32
  rngSeed = (rngSeed + 0x6D2B79F5) >>> 0;
  let t = rngSeed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export const ri = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
export const roll = (sides: number) => 1 + Math.floor(rand() * sides);

// ---- Player creation from stored character ----
export function makePlayer(vitals: { vigor: number; focus: number; resolve: number }): Player {
  return {
    x: 0, y: 0,
    hp: vitals.vigor * 5,
    maxHp: vitals.vigor * 5,
    focus: vitals.focus * 3,
    maxFocus: vitals.focus * 3,
    ac: 10 + Math.floor(vitals.resolve / 4),
    atkBonus: Math.floor(vitals.vigor / 3),
    weaponDie: 6,
    shield: 0,
    buffTurns: 0,
    buffDmg: 0,
    xp: 0,
    tier: 1,
    gold: 0,
    shards: 0,
    potions: 2,
    elixirs: 1,
  };
}

// ---- Dungeon generation ----
type Room = { x: number; y: number; w: number; h: number };

export function generateDungeon(width: number, height: number, floor: number, player: Player): GameState {
  const tiles: Tile[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({ kind: "wall" as TileKind, seen: false, visible: false }))
  );

  const rooms: Room[] = [];
  const targetRooms = 6 + Math.min(4, floor);
  let tries = 0;
  while (rooms.length < targetRooms && tries < 300) {
    tries++;
    const w = ri(4, 8);
    const h = ri(3, 6);
    const x = ri(1, width - w - 2);
    const y = ri(1, height - h - 2);
    const r = { x, y, w, h };
    if (rooms.some((o) => overlaps(o, r, 1))) continue;
    rooms.push(r);
    carveRoom(tiles, r);
  }

  // connect rooms with L corridors
  for (let i = 1; i < rooms.length; i++) {
    const a = centerOf(rooms[i - 1]);
    const b = centerOf(rooms[i]);
    if (rand() < 0.5) {
      carveH(tiles, a.x, b.x, a.y);
      carveV(tiles, a.y, b.y, b.x);
    } else {
      carveV(tiles, a.y, b.y, a.x);
      carveH(tiles, a.x, b.x, b.y);
    }
  }

  // place player in first room
  const start = centerOf(rooms[0]);
  player.x = start.x;
  player.y = start.y;

  // stairs in last room
  const end = centerOf(rooms[rooms.length - 1]);
  tiles[end.y][end.x].kind = "stairs";

  // monsters in non-first rooms
  const monsters: Monster[] = [];
  const items: Item[] = [];
  let nextId = 1;

  const isBossFloor = floor % 3 === 0;
  for (let i = 1; i < rooms.length; i++) {
    const room = rooms[i];
    const count = ri(1, 2) + (floor >= 2 ? 1 : 0);
    for (let k = 0; k < count; k++) {
      const mx = ri(room.x, room.x + room.w - 1);
      const my = ri(room.y, room.y + room.h - 1);
      if (mx === end.x && my === end.y) continue;
      monsters.push(makeMonster(nextId++, mx, my, floor, false));
    }
    if (rand() < 0.45) {
      const ix = ri(room.x, room.x + room.w - 1);
      const iy = ri(room.y, room.y + room.h - 1);
      if (!(ix === end.x && iy === end.y)) items.push(makeItem(nextId++, ix, iy));
    }
  }

  if (isBossFloor) {
    monsters.push(makeMonster(nextId++, end.x, end.y - 1 >= 0 ? end.y - 1 : end.y, floor, true));
  }

  const state: GameState = {
    width, height, tiles, monsters, items, player,
    floor, turn: 0,
    log: [
      { t: "system", m: `Descended to Floor ${floor}.` },
      { t: "narrative", m: floorNarrative(floor) },
    ],
    attention: 1 + Math.min(8, floor),
    status: "playing",
    lastDice: null,
    flashes: [],
  };
  recomputeFOV(state);
  return state;
}

function floorNarrative(f: number) {
  const lines = [
    "The torches lean toward you. The dungeon has noticed.",
    "Damp glyphs pulse on the walls. Something below is humming.",
    "The air thickens. A heartbeat that is not yours grows louder.",
    "Bones crackle underfoot. The corridor exhales.",
    "Veins of obsidian shimmer. The dungeon dreams of you.",
  ];
  return lines[(f - 1) % lines.length];
}

function overlaps(a: Room, b: Room, pad = 0) {
  return !(
    a.x + a.w + pad < b.x ||
    b.x + b.w + pad < a.x ||
    a.y + a.h + pad < b.y ||
    b.y + b.h + pad < a.y
  );
}
function centerOf(r: Room) { return { x: Math.floor(r.x + r.w / 2), y: Math.floor(r.y + r.h / 2) }; }
function carveRoom(tiles: Tile[][], r: Room) {
  for (let y = r.y; y < r.y + r.h; y++)
    for (let x = r.x; x < r.x + r.w; x++) tiles[y][x].kind = "floor";
}
function carveH(tiles: Tile[][], x1: number, x2: number, y: number) {
  const [a, b] = [Math.min(x1, x2), Math.max(x1, x2)];
  for (let x = a; x <= b; x++) if (tiles[y]?.[x]) tiles[y][x].kind = "floor";
}
function carveV(tiles: Tile[][], y1: number, y2: number, x: number) {
  const [a, b] = [Math.min(y1, y2), Math.max(y1, y2)];
  for (let y = a; y <= b; y++) if (tiles[y]?.[x]) tiles[y][x].kind = "floor";
}

// ---- Monsters ----
const MONSTERS: Omit<Monster, "id" | "x" | "y" | "awake" | "rootedFor">[] = [
  { name: "Murk Lurker",    glyph: "g", tone: "arcane", hp: 8,  maxHp: 8,  atk: 4, bonus: 2, ac: 11, xp: 25 },
  { name: "Bone Cur",       glyph: "c", tone: "bone",   hp: 12, maxHp: 12, atk: 5, bonus: 3, ac: 12, xp: 35 },
  { name: "Shade Stalker",  glyph: "s", tone: "arcane", hp: 14, maxHp: 14, atk: 6, bonus: 4, ac: 13, xp: 45 },
  { name: "Blood Acolyte",  glyph: "a", tone: "blood",  hp: 18, maxHp: 18, atk: 7, bonus: 4, ac: 13, xp: 60 },
  { name: "Ember Wraith",   glyph: "w", tone: "ember",  hp: 16, maxHp: 16, atk: 8, bonus: 5, ac: 14, xp: 70 },
  { name: "Marrow Knight",  glyph: "K", tone: "bone",   hp: 26, maxHp: 26, atk: 9, bonus: 5, ac: 15, xp: 90 },
];

const BOSSES: Omit<Monster, "id" | "x" | "y" | "awake" | "rootedFor">[] = [
  { name: "Throne of Maggots",   glyph: "Ψ", tone: "blood",  hp: 60,  maxHp: 60,  atk: 10, bonus: 6, ac: 15, xp: 300, boss: true },
  { name: "The Veiled Sovereign",glyph: "Ω", tone: "arcane", hp: 110, maxHp: 110, atk: 14, bonus: 7, ac: 16, xp: 500, boss: true },
  { name: "Heart of the Mire",   glyph: "Φ", tone: "ember",  hp: 180, maxHp: 180, atk: 18, bonus: 9, ac: 17, xp: 900, boss: true },
];

function makeMonster(id: number, x: number, y: number, floor: number, boss: boolean): Monster {
  if (boss) {
    const b = BOSSES[Math.min(BOSSES.length - 1, Math.floor((floor - 1) / 3))];
    return { ...b, id, x, y, awake: true, rootedFor: 0 };
  }
  const pool = MONSTERS.slice(0, Math.min(MONSTERS.length, 2 + floor));
  const base = pool[ri(0, pool.length - 1)];
  const lvl = Math.max(0, floor - 1);
  return {
    ...base,
    id, x, y,
    hp: base.hp + lvl * 2,
    maxHp: base.maxHp + lvl * 2,
    atk: base.atk + Math.floor(lvl / 2),
    bonus: base.bonus + Math.floor(lvl / 2),
    awake: false,
    rootedFor: 0,
  };
}

function makeItem(id: number, x: number, y: number): Item {
  const r = rand();
  if (r < 0.4) return { id, x, y, kind: "potion", amount: 1 };
  if (r < 0.55) return { id, x, y, kind: "elixir", amount: 1 };
  if (r < 0.9) return { id, x, y, kind: "gold", amount: ri(5, 25) };
  return { id, x, y, kind: "shard", amount: 1 };
}

// ---- Field of view (simple radius + line-of-sight) ----
const FOV_RADIUS = 7;
export function recomputeFOV(s: GameState) {
  for (let y = 0; y < s.height; y++)
    for (let x = 0; x < s.width; x++) s.tiles[y][x].visible = false;
  for (let dy = -FOV_RADIUS; dy <= FOV_RADIUS; dy++) {
    for (let dx = -FOV_RADIUS; dx <= FOV_RADIUS; dx++) {
      if (dx * dx + dy * dy > FOV_RADIUS * FOV_RADIUS) continue;
      const tx = s.player.x + dx;
      const ty = s.player.y + dy;
      if (tx < 0 || ty < 0 || tx >= s.width || ty >= s.height) continue;
      if (lineOfSight(s, s.player.x, s.player.y, tx, ty)) {
        s.tiles[ty][tx].visible = true;
        s.tiles[ty][tx].seen = true;
      }
    }
  }
  // wake monsters in view
  for (const m of s.monsters) {
    if (s.tiles[m.y][m.x].visible) m.awake = true;
  }
}

function lineOfSight(s: GameState, x0: number, y0: number, x1: number, y1: number) {
  // bresenham; walls block (except the endpoint itself)
  let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0, y = y0;
  while (true) {
    if (x === x1 && y === y1) return true;
    if (!(x === x0 && y === y0) && s.tiles[y][x].kind === "wall") return false;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
}

// ---- Helpers ----
function walkable(s: GameState, x: number, y: number) {
  if (x < 0 || y < 0 || x >= s.width || y >= s.height) return false;
  const k = s.tiles[y][x].kind;
  return k === "floor" || k === "door" || k === "stairs";
}
function monsterAt(s: GameState, x: number, y: number) {
  return s.monsters.find((m) => m.x === x && m.y === y && m.hp > 0);
}
function pushLog(s: GameState, e: LogEntry) {
  s.log = [e, ...s.log].slice(0, 80);
}
function flash(s: GameState, x: number, y: number, kind: "hit" | "miss" | "heal", text: string) {
  s.flashes = [...s.flashes, { x, y, kind, text, id: Date.now() + Math.random() }].slice(-12);
}

// ---- Player actions ----
export type MoveDir = "n" | "s" | "e" | "w" | "wait";
const DELTA: Record<Exclude<MoveDir, "wait">, [number, number]> = {
  n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0],
};

export function step(s: GameState, dir: MoveDir): GameState {
  if (s.status !== "playing") return s;
  const next = clone(s);
  if (dir === "wait") {
    if (!enemyInSight(next)) {
      next.player.hp = Math.min(next.player.maxHp, next.player.hp + 1);
      pushLog(next, { t: "narrative", m: "You steady your breath. The dungeon listens." });
    } else {
      pushLog(next, { t: "system", m: "You hold position." });
    }
    return endTurn(next);
  }
  const [dx, dy] = DELTA[dir];
  const tx = next.player.x + dx;
  const ty = next.player.y + dy;
  const target = monsterAt(next, tx, ty);
  if (target) {
    attackMonster(next, target);
    return endTurn(next);
  }
  if (!walkable(next, tx, ty)) {
    pushLog(next, { t: "system", m: "The wall holds." });
    return next;
  }
  next.player.x = tx;
  next.player.y = ty;
  // pick up items on this tile
  const here = next.items.filter((i) => i.x === tx && i.y === ty);
  for (const it of here) pickUp(next, it);
  next.items = next.items.filter((i) => !(i.x === tx && i.y === ty));
  // stairs?
  if (next.tiles[ty][tx].kind === "stairs") {
    pushLog(next, { t: "system", m: `You descend to Floor ${next.floor + 1}.` });
    next.status = "ascended";
    return next;
  }
  return endTurn(next);
}

function pickUp(s: GameState, it: Item) {
  if (it.kind === "potion") { s.player.potions++; pushLog(s, { t: "loot", m: "Picked up a Crimson Draught." }); }
  else if (it.kind === "elixir") { s.player.elixirs++; pushLog(s, { t: "loot", m: "Picked up a Focus Elixir." }); }
  else if (it.kind === "gold") { s.player.gold += it.amount; pushLog(s, { t: "loot", m: `Found ${it.amount} obols.` }); }
  else if (it.kind === "shard") { s.player.shards++; pushLog(s, { t: "loot", m: "Found a Bloodbound Shard." }); }
}

function attackMonster(s: GameState, m: Monster) {
  const die = roll(20);
  const total = die + s.player.atkBonus;
  const crit = die === 20;
  const fumble = die === 1;
  s.lastDice = { value: die, outcome: crit ? "Critical Success" : fumble ? "Critical Failure" : die >= 15 ? "Great Success" : die >= 8 ? "Success" : "Failure", label: `Strike vs ${m.name}` };
  if (fumble) {
    pushLog(s, { t: "roll", m: `Strike · d20 → 1 — your blade slips.` });
    flash(s, m.x, m.y, "miss", "MISS");
    return;
  }
  if (crit || total >= m.ac) {
    let dmg = roll(s.player.weaponDie) + s.player.atkBonus + (s.player.buffDmg > 0 ? s.player.buffDmg : 0);
    if (crit) dmg *= 2;
    m.hp -= dmg;
    pushLog(s, { t: "combat", m: `${crit ? "CRIT " : ""}You hit ${m.name} for ${dmg}.` });
    flash(s, m.x, m.y, "hit", `-${dmg}`);
    if (m.hp <= 0) {
      pushLog(s, { t: "combat", m: `${m.name} crumbles. +${m.xp} XP.` });
      gainXP(s, m.xp);
      if (m.boss) { s.player.gold += 100; pushLog(s, { t: "loot", m: "The boss drops 100 obols." }); }
    }
  } else {
    pushLog(s, { t: "combat", m: `Your strike (${total}) glances off ${m.name}'s guard (${m.ac}).` });
    flash(s, m.x, m.y, "miss", "MISS");
  }
}

function gainXP(s: GameState, xp: number) {
  s.player.xp += xp;
  while (s.player.tier < 6 && s.player.xp >= TIER_XP[s.player.tier]) {
    s.player.tier++;
    s.player.maxHp += 8;
    s.player.maxFocus += 4;
    s.player.atkBonus += 1;
    s.player.hp = s.player.maxHp;
    s.player.focus = s.player.maxFocus;
    pushLog(s, { t: "system", m: `ASCENSION — Tier ${s.player.tier}: ${TIER_NAMES[s.player.tier - 1]} Blood.` });
  }
}

function enemyInSight(s: GameState) {
  return s.monsters.some((m) => m.hp > 0 && s.tiles[m.y][m.x].visible);
}

function endTurn(s: GameState): GameState {
  s.monsters = s.monsters.filter((m) => m.hp > 0);
  // monster turns
  for (const m of s.monsters) {
    if (m.rootedFor > 0) { m.rootedFor--; continue; }
    const dx = s.player.x - m.x;
    const dy = s.player.y - m.y;
    const dist = Math.abs(dx) + Math.abs(dy);
    if (!m.awake && dist > FOV_RADIUS) continue;
    if (dist === 1) {
      // attack
      const die = roll(20);
      const total = die + m.bonus;
      if (die === 1) {
        pushLog(s, { t: "combat", m: `${m.name} stumbles.` });
        continue;
      }
      const targetAC = s.player.ac + (s.player.shield > 0 ? 2 : 0);
      if (die === 20 || total >= targetAC) {
        let dmg = roll(m.atk);
        if (s.player.shield > 0) {
          const absorbed = Math.min(s.player.shield, dmg);
          s.player.shield -= absorbed;
          dmg -= absorbed;
        }
        s.player.hp -= dmg;
        pushLog(s, { t: "combat", m: `${m.name} strikes you for ${dmg}.` });
        flash(s, s.player.x, s.player.y, "hit", `-${dmg}`);
      } else {
        pushLog(s, { t: "combat", m: `${m.name} misses (${total} vs ${targetAC}).` });
      }
    } else {
      // greedy step toward player along walkable cardinal direction
      stepMonsterToward(s, m);
    }
  }
  s.turn++;
  if (s.player.buffTurns > 0) {
    s.player.buffTurns--;
    if (s.player.buffTurns === 0) s.player.buffDmg = 0;
  }
  if (s.player.hp <= 0) {
    s.player.hp = 0;
    s.status = "dead";
    pushLog(s, { t: "system", m: "Your blood pools at the dungeon's lips. You have fallen." });
  }
  recomputeFOV(s);
  return s;
}

function stepMonsterToward(s: GameState, m: Monster) {
  const candidates: Array<[number, number]> = [];
  const dx = s.player.x - m.x;
  const dy = s.player.y - m.y;
  // prefer the dominant axis
  const order: Array<[number, number]> = [];
  if (Math.abs(dx) >= Math.abs(dy)) {
    order.push([Math.sign(dx), 0], [0, Math.sign(dy)], [0, -Math.sign(dy)], [-Math.sign(dx), 0]);
  } else {
    order.push([0, Math.sign(dy)], [Math.sign(dx), 0], [-Math.sign(dx), 0], [0, -Math.sign(dy)]);
  }
  for (const [ox, oy] of order) {
    if (ox === 0 && oy === 0) continue;
    const nx = m.x + ox;
    const ny = m.y + oy;
    if (!walkable(s, nx, ny)) continue;
    if (nx === s.player.x && ny === s.player.y) continue;
    if (s.monsters.some((o) => o.id !== m.id && o.hp > 0 && o.x === nx && o.y === ny)) continue;
    candidates.push([nx, ny]);
  }
  if (candidates.length) {
    const [nx, ny] = candidates[0];
    m.x = nx; m.y = ny;
  }
}

// ---- Inventory / powers ----
export function quaffPotion(s: GameState): GameState {
  if (s.status !== "playing" || s.player.potions <= 0) return s;
  const next = clone(s);
  next.player.potions--;
  const heal = Math.min(next.player.maxHp - next.player.hp, 18);
  next.player.hp += heal;
  pushLog(next, { t: "system", m: `You drink the Crimson Draught. +${heal} HP.` });
  flash(next, next.player.x, next.player.y, "heal", `+${heal}`);
  return endTurn(next);
}
export function quaffElixir(s: GameState): GameState {
  if (s.status !== "playing" || s.player.elixirs <= 0) return s;
  const next = clone(s);
  next.player.elixirs--;
  const restore = Math.min(next.player.maxFocus - next.player.focus, 10);
  next.player.focus += restore;
  pushLog(next, { t: "system", m: `The elixir burns clean. +${restore} Focus.` });
  return endTurn(next);
}

export type AspectPower = {
  id: string;
  label: string;
  desc: string;
  cost: number;
};

const POWERS: Record<string, AspectPower> = {
  ruin:      { id: "ruin",       label: "CATACLYSM",      desc: "8 dmg to all adjacent foes.", cost: 4 },
  veils:     { id: "veils",      label: "CUT THE THREAD", desc: "Execute an adjacent foe ≤ 8 HP.", cost: 3 },
  echoes:    { id: "echoes",     label: "MIND SPIKE",     desc: "12 dmg to nearest visible foe.", cost: 5 },
  oaths:     { id: "oaths",      label: "TOWER VOW",      desc: "Gain 12 shield for 5 turns.", cost: 3 },
  dominion:  { id: "dominion",   label: "COMMAND STRIKE", desc: "16 dmg to an adjacent foe.", cost: 5 },
  chains:    { id: "chains",     label: "SOUL MANACLE",   desc: "Root all adjacent foes for 3 turns.", cost: 3 },
  embers:    { id: "embers",     label: "PHOENIX FLARE",  desc: "Heal 20 HP.", cost: 4 },
  primordial:{ id: "primordial", label: "CARNAL SHAPE",   desc: "+6 damage for 3 turns.", cost: 4 },
  boundstar: { id: "boundstar",  label: "WAGER OF STARS", desc: "Flip fate: double gold or take 6 dmg.", cost: 2 },
  fury:      { id: "fury",       label: "HEMORRHAGE",     desc: "10 dmg to adjacent foe, ignores armor.", cost: 3 },
};

export function powerFor(aspectId: string): AspectPower {
  return POWERS[aspectId] ?? POWERS.ruin;
}

export function usePower(s: GameState, aspectId: string): GameState {
  if (s.status !== "playing") return s;
  const power = powerFor(aspectId);
  if (s.player.focus < power.cost) {
    const np = clone(s);
    pushLog(np, { t: "system", m: "Not enough Focus." });
    return np;
  }
  const next = clone(s);
  next.player.focus -= power.cost;
  const adj = next.monsters.filter((m) => m.hp > 0 && Math.abs(m.x - next.player.x) + Math.abs(m.y - next.player.y) === 1);
  switch (aspectId) {
    case "ruin": {
      if (!adj.length) { pushLog(next, { t: "system", m: "Nothing adjacent to shatter." }); return next; }
      for (const m of adj) { m.hp -= 8; flash(next, m.x, m.y, "hit", "-8"); if (m.hp <= 0) gainXP(next, m.xp); }
      pushLog(next, { t: "combat", m: `CATACLYSM — ${adj.length} foes struck.` });
      break;
    }
    case "veils": {
      const t = adj.find((m) => m.hp <= 8);
      if (!t) { pushLog(next, { t: "system", m: "No weakened foe within reach." }); return next; }
      t.hp = 0; gainXP(next, t.xp);
      pushLog(next, { t: "combat", m: `CUT THE THREAD — ${t.name} silenced.` });
      flash(next, t.x, t.y, "hit", "X");
      break;
    }
    case "echoes": {
      const visible = next.monsters.filter((m) => m.hp > 0 && next.tiles[m.y][m.x].visible);
      if (!visible.length) { pushLog(next, { t: "system", m: "No mind to pierce." }); return next; }
      visible.sort((a, b) => dist(a, next.player) - dist(b, next.player));
      const t = visible[0];
      t.hp -= 12; flash(next, t.x, t.y, "hit", "-12");
      pushLog(next, { t: "combat", m: `MIND SPIKE — ${t.name} reels.` });
      if (t.hp <= 0) gainXP(next, t.xp);
      break;
    }
    case "oaths": {
      next.player.shield = 12;
      next.player.buffTurns = 5;
      pushLog(next, { t: "combat", m: "TOWER VOW — you become unmoved." });
      flash(next, next.player.x, next.player.y, "heal", "+12 SHD");
      break;
    }
    case "dominion": {
      if (!adj.length) { pushLog(next, { t: "system", m: "Command falls on empty air." }); return next; }
      const t = adj[0]; t.hp -= 16; flash(next, t.x, t.y, "hit", "-16");
      pushLog(next, { t: "combat", m: `COMMAND STRIKE — ${t.name} crumples.` });
      if (t.hp <= 0) gainXP(next, t.xp);
      break;
    }
    case "chains": {
      if (!adj.length) { pushLog(next, { t: "system", m: "No chains for empty space." }); return next; }
      for (const m of adj) { m.rootedFor = 3; flash(next, m.x, m.y, "miss", "ROOT"); }
      pushLog(next, { t: "combat", m: `SOUL MANACLE — ${adj.length} bound.` });
      break;
    }
    case "embers": {
      const heal = Math.min(next.player.maxHp - next.player.hp, 20);
      next.player.hp += heal;
      pushLog(next, { t: "system", m: `PHOENIX FLARE — +${heal} HP.` });
      flash(next, next.player.x, next.player.y, "heal", `+${heal}`);
      break;
    }
    case "primordial": {
      next.player.buffDmg = 6;
      next.player.buffTurns = 3;
      pushLog(next, { t: "combat", m: "CARNAL SHAPE — your fangs lengthen." });
      break;
    }
    case "boundstar": {
      if (rand() < 0.5) {
        const g = ri(20, 60); next.player.gold += g;
        pushLog(next, { t: "loot", m: `WAGER WON — +${g} obols.` });
      } else {
        next.player.hp -= 6; flash(next, next.player.x, next.player.y, "hit", "-6");
        pushLog(next, { t: "combat", m: "WAGER LOST — the stars demand blood." });
      }
      break;
    }
    case "fury": {
      const t = adj[0];
      if (!t) { pushLog(next, { t: "system", m: "No throat in reach." }); return next; }
      t.hp -= 10; flash(next, t.x, t.y, "hit", "-10");
      pushLog(next, { t: "combat", m: `HEMORRHAGE — ${t.name} bleeds.` });
      if (t.hp <= 0) gainXP(next, t.xp);
      break;
    }
  }
  return endTurn(next);
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function clone(s: GameState): GameState {
  return {
    ...s,
    tiles: s.tiles.map((row) => row.map((t) => ({ ...t }))),
    monsters: s.monsters.map((m) => ({ ...m })),
    items: s.items.map((i) => ({ ...i })),
    player: { ...s.player },
    log: s.log.slice(),
    flashes: s.flashes.slice(),
  };
}
