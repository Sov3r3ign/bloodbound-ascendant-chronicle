// Bloodbound Ascendants — dungeon engine (procedural roguelike core)
// Expanded: status effects, traps, shrines, chests, equipment, sanctuary floors,
// narrative events, and run statistics.

export type TileKind = "wall" | "floor" | "door" | "stairs" | "shrine" | "trap" | "chest";
export type Tile = { kind: TileKind; seen: boolean; visible: boolean; revealed?: boolean };

export type StatusKey = "bleed" | "burn" | "poison" | "blessed" | "rooted";
export type StatusMap = Partial<Record<StatusKey, number>>;

export type Weapon = { name: string; die: number; bonus: number; tag?: "bleed" | "burn" | "vorpal" };
export type Armor = { name: string; ac: number; dr: number };
export type Trinket = { name: string; effect: string; heal?: number; xpMult?: number; focusRegen?: number };

export type Equipment = {
  weapon: Weapon | null;
  armor: Armor | null;
  trinket: Trinket | null;
};

export type BossPhase = {
  threshold: number; // fraction of maxHp; trigger when hp drops below this
  name: string;
  line: string;
  atkDelta?: number;
  bonusDelta?: number;
  acDelta?: number;
  healFrac?: number;
  burnPlayer?: number;
  bleedPlayer?: number;
};

export type Monster = {
  id: number;
  x: number;
  y: number;
  name: string;
  glyph: string;
  tone: "blood" | "ember" | "arcane" | "bone";
  hp: number;
  maxHp: number;
  atk: number;
  bonus: number;
  ac: number;
  xp: number;
  awake: boolean;
  rootedFor: number;
  statuses: StatusMap;
  desc: string;
  seenByPlayer: boolean;
  boss?: boolean;
  phases?: BossPhase[];
  phaseIndex?: number;
};

export type Item = {
  id: number;
  x: number;
  y: number;
  kind: "potion" | "elixir" | "gold" | "shard" | "weapon" | "armor" | "trinket";
  amount: number;
  weapon?: Weapon;
  armor?: Armor;
  trinket?: Trinket;
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
  equipment: Equipment;
  statuses: StatusMap;
};

export type LogEntry = { t: "narrative" | "roll" | "system" | "combat" | "loot" | "event"; m: string };

export type RunCounters = {
  kills: number;
  bossKills: number;
  damageDealt: number;
  damageTaken: number;
  goldEarned: number;
  shardsEarned: number;
};

export type Cause = "claws" | "trap" | "fate" | "boss" | "unknown";

export type ShopOffer = {
  id: string;
  label: string;
  desc: string;
  cost: number;
  kind: "weapon" | "armor" | "trinket" | "potions" | "elixirs" | "heal" | "shield";
  payload?: Weapon | Armor | Trinket | number;
};

export type GameState = {
  width: number;
  height: number;
  tiles: Tile[][];
  monsters: Monster[];
  items: Item[];
  player: Player;
  floor: number;
  turn: number;
  log: LogEntry[];
  attention: number;
  status: "playing" | "dead" | "ascended";
  lastDice: { value: number; outcome: string; label: string } | null;
  flashes: { x: number; y: number; kind: "hit" | "miss" | "heal" | "event"; text: string; id: number }[];
  isSanctuary: boolean;
  shop: ShopOffer[] | null;
  counters: RunCounters;
  cause: Cause;
  shakeUntil: number;
  visitedRooms: Set<number>;
  biomeId: BiomeId;
};

export type BiomeId = "catacombs" | "foundry" | "veiled" | "mire";
export type Biome = {
  id: BiomeId;
  name: string;
  subtitle: string;
  tone: "bone" | "ember" | "arcane" | "blood";
  accentClass: string;
  narratives: string[];
  monsters: string[];
  bossName: string;
};

export const BIOMES: Biome[] = [
  {
    id: "catacombs",
    name: "The Catacombs of Aethryn",
    subtitle: "Crypts beneath a fallen kingdom.",
    tone: "bone",
    accentClass: "text-bone",
    narratives: [
      "Bone-dust drifts in slow shafts of grey light. The dead lean in to listen.",
      "Reliquary niches yawn empty. Whatever was stored here let itself out.",
      "Marble saints weep something darker than water.",
    ],
    monsters: ["Murk Lurker", "Bone Cur", "Tomb Wight", "Marrow Knight"],
    bossName: "Throne of Maggots",
  },
  {
    id: "foundry",
    name: "The Ember Foundry",
    subtitle: "Forge-halls of the smith-kings.",
    tone: "ember",
    accentClass: "text-ember",
    narratives: [
      "Coals breathe in the dark. The bellows pump without hands.",
      "Slag rivers cool into glyphs you almost recognise.",
      "Iron sweats in the heat. So do you.",
    ],
    monsters: ["Ember Wraith", "Forge-Burnt Husk", "Slag Acolyte", "Marrow Knight"],
    bossName: "Heart of the Mire",
  },
  {
    id: "veiled",
    name: "The Veiled Halls",
    subtitle: "Mirror-archives of a forgotten court.",
    tone: "arcane",
    accentClass: "text-arcane",
    narratives: [
      "Mirrors line the corridor. Your reflection arrives a step late.",
      "Velvet ropes cordon nothing. The court is still in session, somewhere behind you.",
      "Chandeliers burn cold. Each candle is a sealed name.",
    ],
    monsters: ["Shade Stalker", "Hollow Scribe", "Mirror Stalker", "Blood Acolyte"],
    bossName: "The Veiled Sovereign",
  },
  {
    id: "mire",
    name: "The Blood Mire",
    subtitle: "The dungeon's living root.",
    tone: "blood",
    accentClass: "text-blood",
    narratives: [
      "The floor is warm. The floor is breathing.",
      "Black roots drink from puddles that move when you don't look.",
      "Everything here remembers being eaten.",
    ],
    monsters: ["Blood Acolyte", "Mire-Thrall", "Ember Wraith", "Marrow Knight"],
    bossName: "Heart of the Mire",
  },
];

export function biomeForFloor(floor: number): Biome {
  if (floor <= 3) return BIOMES[0];
  if (floor <= 6) return BIOMES[1];
  if (floor <= 9) return BIOMES[2];
  return BIOMES[3];
}


export const TIER_XP = [0, 100, 300, 700, 1500, 3000, 6000];
export const TIER_NAMES = ["Stirring", "Awakened", "Ascendant", "Sovereign", "Mythic", "Transcendent"];

// ---- RNG ----
let rngSeed = Date.now() >>> 0;
export function seed(n: number) { rngSeed = n >>> 0 || 1; }
export function rand() {
  rngSeed = (rngSeed + 0x6D2B79F5) >>> 0;
  let t = rngSeed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export const ri = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
export const roll = (sides: number) => 1 + Math.floor(rand() * sides);

// ---- Equipment pool ----
const WEAPONS: Weapon[] = [
  { name: "Whisperfang Dagger", die: 6, bonus: 2, tag: "bleed" },
  { name: "Sundering Maul",     die: 10, bonus: 1 },
  { name: "Cinder-Etched Blade",die: 8, bonus: 2, tag: "burn" },
  { name: "Obsidian Saber",     die: 8, bonus: 3 },
  { name: "Vorpal Edge",        die: 10, bonus: 3, tag: "vorpal" },
  { name: "Marrow Spear",       die: 8, bonus: 4 },
];

const ARMORS: Armor[] = [
  { name: "Tattered Robes",      ac: 1, dr: 0 },
  { name: "Boiled Leathers",     ac: 2, dr: 1 },
  { name: "Chitin Carapace",     ac: 3, dr: 1 },
  { name: "Bone-Plated Harness", ac: 3, dr: 2 },
  { name: "Veiled Aegis",        ac: 4, dr: 2 },
];

const TRINKETS: Trinket[] = [
  { name: "Charm of Banked Coals", effect: "+1 HP regen per turn out of combat", heal: 1 },
  { name: "Scholar's Sigil",       effect: "+25% XP from kills", xpMult: 1.25 },
  { name: "Whispering Pendant",    effect: "+1 Focus regen per turn", focusRegen: 1 },
  { name: "Crow's Eye Locket",     effect: "+50% XP from kills", xpMult: 1.5 },
];

function pickWeapon(floor: number): Weapon {
  const tier = Math.min(WEAPONS.length - 1, Math.floor(floor / 2));
  return { ...WEAPONS[ri(0, tier)] };
}
function pickArmor(floor: number): Armor {
  const tier = Math.min(ARMORS.length - 1, Math.floor(floor / 2));
  return { ...ARMORS[ri(0, tier)] };
}
function pickTrinket(): Trinket {
  return { ...TRINKETS[ri(0, TRINKETS.length - 1)] };
}

// ---- Player creation ----
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
    gold: 15,
    shards: 0,
    potions: 3,
    elixirs: 2,
    equipment: {
      weapon: { name: "Wayfarer's Shortblade", die: 6, bonus: 1 },
      armor: { name: "Travel Leathers", ac: 1, dr: 0 },
      trinket: { name: "Wanderer's Token", effect: "+1 HP regen per turn out of combat", heal: 1 },
    },
    statuses: {},
  };
}


// ---- Dungeon generation ----
type Room = { x: number; y: number; w: number; h: number; visited?: boolean };

export function generateDungeon(width: number, height: number, floor: number, player: Player): GameState {
  const sanctuary = floor > 1 && floor % 4 === 0;
  const tiles: Tile[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({ kind: "wall" as TileKind, seen: false, visible: false }))
  );

  const rooms: Room[] = [];
  const targetRooms = sanctuary ? 3 : 6 + Math.min(4, floor);
  let tries = 0;
  while (rooms.length < targetRooms && tries < 300) {
    tries++;
    const w = sanctuary ? ri(5, 7) : ri(4, 8);
    const h = sanctuary ? ri(4, 6) : ri(3, 6);
    const x = ri(1, width - w - 2);
    const y = ri(1, height - h - 2);
    const r = { x, y, w, h };
    if (rooms.some((o) => overlaps(o, r, 1))) continue;
    rooms.push(r);
    carveRoom(tiles, r);
  }

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

  const start = centerOf(rooms[0]);
  player.x = start.x;
  player.y = start.y;

  const end = centerOf(rooms[rooms.length - 1]);
  tiles[end.y][end.x].kind = "stairs";

  const monsters: Monster[] = [];
  const items: Item[] = [];
  let nextId = 1;

  if (sanctuary) {
    // Place shrine in mid room, chest in last (besides stairs)
    const mid = centerOf(rooms[1]);
    tiles[mid.y][mid.x].kind = "shrine";
    // chest in a corner of last room (not on stairs)
    const lr = rooms[rooms.length - 1];
    for (let dy = 0; dy < lr.h; dy++) {
      for (let dx = 0; dx < lr.w; dx++) {
        const cx = lr.x + dx;
        const cy = lr.y + dy;
        if (cx === end.x && cy === end.y) continue;
        if (tiles[cy][cx].kind === "floor") {
          tiles[cy][cx].kind = "chest";
          dy = lr.h; break;
        }
      }
    }
  } else {
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
        if (!(ix === end.x && iy === end.y)) items.push(makeItem(nextId++, ix, iy, floor));
      }
      // chance for a chest
      if (rand() < 0.15 + Math.min(0.2, floor * 0.02)) {
        const cx = ri(room.x, room.x + room.w - 1);
        const cy = ri(room.y, room.y + room.h - 1);
        if (tiles[cy][cx].kind === "floor" && !(cx === end.x && cy === end.y)) {
          tiles[cy][cx].kind = "chest";
        }
      }
      // shrine appears rarely
      if (rand() < 0.08) {
        const sx = ri(room.x, room.x + room.w - 1);
        const sy = ri(room.y, room.y + room.h - 1);
        if (tiles[sy][sx].kind === "floor") tiles[sy][sx].kind = "shrine";
      }
    }

    // traps in corridors (not in rooms, not on stairs)
    const trapCount = Math.min(6, 1 + Math.floor(floor / 2));
    let placed = 0;
    let attempts = 0;
    while (placed < trapCount && attempts < 200) {
      attempts++;
      const tx = ri(1, width - 2);
      const ty = ri(1, height - 2);
      if (tiles[ty][tx].kind !== "floor") continue;
      if (tx === end.x && ty === end.y) continue;
      if (tx === start.x && ty === start.y) continue;
      // not in a room (only corridor floors)
      if (rooms.some((r) => tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h)) continue;
      tiles[ty][tx].kind = "trap";
      placed++;
    }

    if (isBossFloor) {
      monsters.push(makeMonster(nextId++, end.x, end.y - 1 >= 0 ? end.y - 1 : end.y, floor, true));
    }
  }

  const biome = biomeForFloor(floor);
  const state: GameState = {
    width, height, tiles, monsters, items, player,
    floor, turn: 0,
    log: [
      { t: "system", m: sanctuary ? `You enter the Sanctuary at Floor ${floor}.` : `Descended to Floor ${floor} — ${biome.name}.` },
      { t: "narrative", m: sanctuary ? "Quiet. A shrine glimmers. Coin and oath buy passage here." : biomeNarrative(biome, floor) },
    ],
    attention: sanctuary ? 0 : 1 + Math.min(8, floor),
    status: "playing",
    lastDice: null,
    flashes: [],
    isSanctuary: sanctuary,
    shop: sanctuary ? makeShop(floor) : null,
    counters: state_counters_zero(),
    cause: "unknown",
    shakeUntil: 0,
    visitedRooms: new Set([0]),
    biomeId: biome.id,
  };
  recomputeFOV(state);
  return state;
}

function state_counters_zero(): RunCounters {
  return { kills: 0, bossKills: 0, damageDealt: 0, damageTaken: 0, goldEarned: 0, shardsEarned: 0 };
}

function makeShop(floor: number): ShopOffer[] {
  return [
    {
      id: "w",
      label: "Bind a Weapon",
      desc: "A blade chooses you.",
      cost: 40 + floor * 5,
      kind: "weapon",
      payload: pickWeapon(floor + 1),
    },
    {
      id: "a",
      label: "Don Armor",
      desc: "Hide for your hide.",
      cost: 35 + floor * 5,
      kind: "armor",
      payload: pickArmor(floor + 1),
    },
    {
      id: "t",
      label: "Trinket of Note",
      desc: "Small thing. Loud whisper.",
      cost: 50 + floor * 5,
      kind: "trinket",
      payload: pickTrinket(),
    },
    {
      id: "p",
      label: "Crimson Draughts ×3",
      desc: "Restore vigor in pinch.",
      cost: 30,
      kind: "potions",
      payload: 3,
    },
    {
      id: "e",
      label: "Focus Elixirs ×2",
      desc: "Sharpen the mind.",
      cost: 25,
      kind: "elixirs",
      payload: 2,
    },
    {
      id: "h",
      label: "Sanctuary Rest",
      desc: "Restore HP and Focus to full.",
      cost: 20 + floor * 3,
      kind: "heal",
    },
  ];
}

function biomeNarrative(b: Biome, floor: number): string {
  return b.narratives[(floor - 1) % b.narratives.length];
}


const ROOM_EVENTS = [
  "A cold thought brushes past — not yours.",
  "Old chains rattle, though nothing moves.",
  "You taste copper. The wall is sweating.",
  "Somewhere distant, a door closes that you did not open.",
  "A child's laugh. Cut short.",
  "The torches dim a moment, then catch.",
];

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
type MonsterTemplate = Omit<Monster, "id" | "x" | "y" | "awake" | "rootedFor" | "statuses" | "seenByPlayer">;

const MONSTER_LIB: Record<string, MonsterTemplate> = {
  // Catacombs
  "Murk Lurker":    { name: "Murk Lurker",    glyph: "g", tone: "arcane", hp: 8,  maxHp: 8,  atk: 4, bonus: 2, ac: 11, xp: 25, desc: "A hunched, ink-skinned thing that drips shadow. Its eyes are two slow-blinking coals. It hates light and remembers faces." },
  "Bone Cur":       { name: "Bone Cur",       glyph: "c", tone: "bone",   hp: 12, maxHp: 12, atk: 5, bonus: 3, ac: 12, xp: 35, desc: "Stitched together from kennel-bones and bridle leather. It still wags the stump of a tail before it lunges." },
  "Tomb Wight":     { name: "Tomb Wight",     glyph: "t", tone: "bone",   hp: 16, maxHp: 16, atk: 6, bonus: 3, ac: 12, xp: 50, desc: "A linen-wrapped corpse that hums the funeral hymn sung over its body. Its grip is dry and absolute." },
  "Marrow Knight":  { name: "Marrow Knight",  glyph: "K", tone: "bone",   hp: 26, maxHp: 26, atk: 9, bonus: 5, ac: 15, xp: 90, desc: "A bone-plated revenant cradling a notched greatsword. It bows once, formally, before it tries to halve you." },

  // Foundry
  "Ember Wraith":      { name: "Ember Wraith",      glyph: "w", tone: "ember", hp: 16, maxHp: 16, atk: 8, bonus: 5, ac: 14, xp: 70, desc: "A drifting wound of flame and ash. Its passage chars the stones. Burns linger long after the blow lands." },
  "Forge-Burnt Husk":  { name: "Forge-Burnt Husk",  glyph: "h", tone: "ember", hp: 22, maxHp: 22, atk: 7, bonus: 4, ac: 13, xp: 75, desc: "A smith fused to his anvil — half iron, half scream. Each step rings like a hammer falling." },
  "Slag Acolyte":      { name: "Slag Acolyte",      glyph: "a", tone: "blood", hp: 20, maxHp: 20, atk: 8, bonus: 5, ac: 13, xp: 80, desc: "Robes of cooling slag, eyes of molten copper. Its prayers are spoken in the language of bellows." },

  // Veiled Halls
  "Shade Stalker":  { name: "Shade Stalker",  glyph: "s", tone: "arcane", hp: 18, maxHp: 18, atk: 7, bonus: 5, ac: 14, xp: 60, desc: "A silhouette that walks a half-second behind itself. Strikes from where you weren't looking. Smells of cold iron." },
  "Hollow Scribe":  { name: "Hollow Scribe",  glyph: "S", tone: "arcane", hp: 22, maxHp: 22, atk: 9, bonus: 6, ac: 14, xp: 95, desc: "Inkless quills scratch on parchment skin. It records your death before you die it." },
  "Mirror Stalker": { name: "Mirror Stalker", glyph: "M", tone: "arcane", hp: 26, maxHp: 26, atk: 10, bonus: 6, ac: 15, xp: 110, desc: "Your face, very nearly. The flaws are wrong in instructive ways. It studies you while it kills you." },
  "Blood Acolyte":  { name: "Blood Acolyte",  glyph: "a", tone: "blood",  hp: 22, maxHp: 22, atk: 9, bonus: 5, ac: 13, xp: 80, desc: "Robed in arterial red, mouth sewn into a smile. Whispers your true name back at you, slightly wrong each time." },

  // Mire
  "Mire-Thrall":    { name: "Mire-Thrall",    glyph: "m", tone: "blood",  hp: 30, maxHp: 30, atk: 11, bonus: 6, ac: 14, xp: 130, desc: "Mud-drowned, root-stitched, faithful. Its loyalty is to the heartbeat below the floor." },
};

const BOSS_LIB: Record<string, MonsterTemplate> = {
  "Throne of Maggots":   { name: "Throne of Maggots",    glyph: "Ψ", tone: "blood",  hp: 60,  maxHp: 60,  atk: 10, bonus: 6, ac: 15, xp: 300, boss: true, desc: "A throne of fused corpses, ruled by the squirming crown atop it. The chamber's air tastes of warm copper and wet wool." },
  "The Veiled Sovereign":{ name: "The Veiled Sovereign", glyph: "Ω", tone: "arcane", hp: 130, maxHp: 130, atk: 14, bonus: 7, ac: 16, xp: 500, boss: true, desc: "Seven robes layered over nothing. Where its face should be, the dungeon's own ceiling looks down at you, surprised." },
  "Heart of the Mire":   { name: "Heart of the Mire",    glyph: "Φ", tone: "ember",  hp: 200, maxHp: 200, atk: 18, bonus: 9, ac: 17, xp: 900, boss: true, desc: "A vast, slow ember beating in a cage of black roots. Every pulse rewrites a memory you were certain of." },
};

const BOSS_PHASES: Record<string, BossPhase[]> = {
  "Throne of Maggots": [
    { threshold: 0.66, name: "Crown Splits",   line: "The crown of maggots bursts — a tide of squirming hunger pours toward you.", atkDelta: 2, bleedPlayer: 3 },
    { threshold: 0.33, name: "Throne Rises",   line: "The throne lurches upright on a forest of bone-arms. It will not sit again.", atkDelta: 3, bonusDelta: 1, acDelta: 1 },
  ],
  "The Veiled Sovereign": [
    { threshold: 0.66, name: "Veils Fall",     line: "One veil falls. The room dims. Its strikes arrive from where you weren't.", bonusDelta: 2, acDelta: 1 },
    { threshold: 0.33, name: "Sovereign Unmasked", line: "The last veil tears. The ceiling looks back — and screams.", atkDelta: 4, bonusDelta: 1, healFrac: 0.15 },
  ],
  "Heart of the Mire": [
    { threshold: 0.66, name: "Roots Constrict", line: "Black roots lash from the floor, drinking the room's air. Your skin remembers being eaten.", atkDelta: 2, bleedPlayer: 4 },
    { threshold: 0.33, name: "Heart Ignites",  line: "The ember-heart blazes white. The cage of roots becomes a furnace.", atkDelta: 4, bonusDelta: 2, burnPlayer: 4, healFrac: 0.1 },
  ],
};

function makeMonster(id: number, x: number, y: number, floor: number, boss: boolean): Monster {
  const biome = biomeForFloor(floor);
  if (boss) {
    const b = BOSS_LIB[biome.bossName];
    // Bosses scale with depth too
    const bossLvl = Math.max(0, floor - 3);
    return {
      ...b,
      id, x, y,
      hp: b.hp + bossLvl * 6,
      maxHp: b.maxHp + bossLvl * 6,
      atk: b.atk + Math.floor(bossLvl / 2),
      bonus: b.bonus + Math.floor(bossLvl / 3),
      awake: true, rootedFor: 0, statuses: {}, seenByPlayer: false,
    };
  }
  const pool = biome.monsters;
  const base = MONSTER_LIB[pool[ri(0, pool.length - 1)]];
  // Steeper difficulty: hp +3/floor, atk +1/2 floors, bonus +1/3 floors, ac +1/4 floors
  const lvl = Math.max(0, floor - 1);
  return {
    ...base,
    id, x, y,
    hp: base.hp + lvl * 3,
    maxHp: base.maxHp + lvl * 3,
    atk: base.atk + Math.floor(lvl / 2),
    bonus: base.bonus + Math.floor(lvl / 3),
    ac: base.ac + Math.floor(lvl / 4),
    xp: Math.round(base.xp * (1 + lvl * 0.15)),
    awake: false,
    rootedFor: 0,
    statuses: {},
    seenByPlayer: false,
  };
}

function makeItem(id: number, x: number, y: number, floor: number): Item {
  const r = rand();
  if (r < 0.35) return { id, x, y, kind: "potion", amount: 1 };
  if (r < 0.50) return { id, x, y, kind: "elixir", amount: 1 };
  if (r < 0.78) return { id, x, y, kind: "gold", amount: ri(5, 25) };
  if (r < 0.88) return { id, x, y, kind: "shard", amount: 1 };
  // equipment drop
  const eq = rand();
  if (eq < 0.45) return { id, x, y, kind: "weapon", amount: 1, weapon: pickWeapon(floor) };
  if (eq < 0.85) return { id, x, y, kind: "armor", amount: 1, armor: pickArmor(floor) };
  return { id, x, y, kind: "trinket", amount: 1, trinket: pickTrinket() };
}

// ---- FOV ----
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
  for (const m of s.monsters) {
    if (s.tiles[m.y][m.x].visible) {
      m.awake = true;
      if (!m.seenByPlayer) {
        m.seenByPlayer = true;
        pushLog(s, { t: "event", m: `${m.boss ? "⚜ " : "▲ "}You behold ${m.name}${m.boss ? ", a Sovereign of this floor" : ""}. ${m.desc}` });
      }
    }
  }
}

function lineOfSight(s: GameState, x0: number, y0: number, x1: number, y1: number) {
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
  return k === "floor" || k === "door" || k === "stairs" || k === "shrine" || k === "trap" || k === "chest";
}
function monsterAt(s: GameState, x: number, y: number) {
  return s.monsters.find((m) => m.x === x && m.y === y && m.hp > 0);
}
function pushLog(s: GameState, e: LogEntry) {
  s.log = [e, ...s.log].slice(0, 100);
}
function flash(s: GameState, x: number, y: number, kind: "hit" | "miss" | "heal" | "event", text: string) {
  s.flashes = [...s.flashes, { x, y, kind, text, id: Date.now() + Math.random() }].slice(-16);
}
function shake(s: GameState, ms: number) {
  s.shakeUntil = Date.now() + ms;
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
      const regen = 1 + (next.player.equipment.trinket?.heal ?? 0);
      next.player.hp = Math.min(next.player.maxHp, next.player.hp + regen);
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

  // pick up items
  const here = next.items.filter((i) => i.x === tx && i.y === ty);
  for (const it of here) pickUp(next, it);
  next.items = next.items.filter((i) => !(i.x === tx && i.y === ty));

  // tile triggers
  const tile = next.tiles[ty][tx];
  if (tile.kind === "trap") {
    triggerTrap(next, tx, ty);
  } else if (tile.kind === "chest") {
    openChest(next, tx, ty);
  } else if (tile.kind === "shrine") {
    // shrines remain — player invokes them via action
    pushLog(next, { t: "event", m: "A shrine pulses with violet light. Stand and pray to invoke it." });
  } else if (tile.kind === "stairs") {
    pushLog(next, { t: "system", m: `You descend to Floor ${next.floor + 1}.` });
    next.status = "ascended";
    return next;
  }

  // narrative chance on entering an unvisited room area (simple heuristic)
  if (rand() < 0.04 && !next.isSanctuary) {
    pushLog(next, { t: "event", m: ROOM_EVENTS[ri(0, ROOM_EVENTS.length - 1)] });
  }

  return endTurn(next);
}

function triggerTrap(s: GameState, x: number, y: number) {
  s.tiles[y][x].kind = "floor";
  s.tiles[y][x].revealed = true;
  // Reflex save: d20 + atkBonus vs DC 12
  const dc = 12 + Math.floor(s.floor / 2);
  const die = roll(20);
  const total = die + s.player.atkBonus;
  const saved = die !== 1 && (die === 20 || total >= dc);
  s.lastDice = {
    value: die,
    outcome: saved ? (die === 20 ? "Critical Save" : "Reflex Save") : (die === 1 ? "Critical Failure" : "Failed Save"),
    label: `Reflex vs Trap · DC ${dc}`,
  };
  pushLog(s, { t: "roll", m: `Reflex · d20 → ${die} (+${s.player.atkBonus}) vs DC ${dc} — ${saved ? "averted" : "sprung"}.` });
  if (saved) {
    pushLog(s, { t: "event", m: "You sense the wire and freeze. The trap clicks empty." });
    return;
  }
  const r = rand();
  if (r < 0.35) {
    const dmg = ri(4, 8) + Math.floor(s.floor / 2);
    const taken = applyDR(s, dmg);
    s.player.hp -= taken;
    s.counters.damageTaken += taken;
    shake(s, 350);
    flash(s, x, y, "hit", `-${taken}`);
    pushLog(s, { t: "event", m: `Spike trap! You take ${taken} damage.` });
    if (s.player.hp <= 0) s.cause = "trap";
  } else if (r < 0.6) {
    s.player.statuses.bleed = Math.max(s.player.statuses.bleed ?? 0, 4);
    flash(s, x, y, "hit", "BLEED");
    pushLog(s, { t: "event", m: "A wire bites your ankle. You begin to bleed (4 turns)." });
  } else if (r < 0.8) {
    s.player.statuses.burn = Math.max(s.player.statuses.burn ?? 0, 3);
    flash(s, x, y, "hit", "BURN");
    pushLog(s, { t: "event", m: "Hidden glyph flares — embers cling to you (3 turns)." });
  } else {
    s.player.statuses.poison = Math.max(s.player.statuses.poison ?? 0, 5);
    flash(s, x, y, "hit", "POISON");
    pushLog(s, { t: "event", m: "A green hiss. Poison seeps in (5 turns)." });
  }
}

function openChest(s: GameState, x: number, y: number) {
  s.tiles[y][x].kind = "floor";
  const r = rand();
  if (r < 0.45) {
    const w = pickWeapon(s.floor + 1);
    equip(s, "weapon", w);
    pushLog(s, { t: "loot", m: `Chest yields ${w.name} (1d${w.die}+${w.bonus}${w.tag ? `, ${w.tag}` : ""}). Equipped.` });
  } else if (r < 0.8) {
    const a = pickArmor(s.floor + 1);
    equip(s, "armor", a);
    pushLog(s, { t: "loot", m: `Chest yields ${a.name} (+${a.ac} AC, ${a.dr} DR). Equipped.` });
  } else {
    const t = pickTrinket();
    equip(s, "trinket", t);
    pushLog(s, { t: "loot", m: `Chest yields ${t.name}. ${t.effect}. Equipped.` });
  }
  flash(s, x, y, "event", "★");
}

export function invokeShrine(s: GameState): GameState {
  if (s.status !== "playing") return s;
  if (s.tiles[s.player.y][s.player.x].kind !== "shrine") {
    const np = clone(s);
    pushLog(np, { t: "system", m: "No shrine within reach." });
    return np;
  }
  const next = clone(s);
  next.tiles[next.player.y][next.player.x].kind = "floor";
  const die = roll(20);
  next.lastDice = {
    value: die,
    outcome: die === 20 ? "Auspicious" : die >= 15 ? "Favored" : die >= 8 ? "Indifferent" : die === 1 ? "Cursed" : "Bleak",
    label: "Fate · Shrine Invocation",
  };
  pushLog(next, { t: "roll", m: `Fate · d20 → ${die} as you press your palm to the shrine.` });
  const r = die / 20;
  if (r < 0.4) {
    const heal = Math.floor(next.player.maxHp * 0.5);
    const real = Math.min(next.player.maxHp - next.player.hp, heal);
    next.player.hp += real;
    flash(next, next.player.x, next.player.y, "heal", `+${real}`);
    pushLog(next, { t: "event", m: `The shrine answers — half your wounds knit. +${real} HP.` });
  } else if (r < 0.7) {
    next.player.statuses.blessed = 12;
    pushLog(next, { t: "event", m: "Blessed — +2 to strikes for 12 turns." });
    flash(next, next.player.x, next.player.y, "event", "BLESSED");
  } else if (r < 0.9) {
    next.player.maxHp += 4;
    next.player.hp += 4;
    pushLog(next, { t: "event", m: "Boon of Stone — +4 Max HP, permanently." });
  } else {
    next.player.shards += 1;
    next.counters.shardsEarned += 1;
    pushLog(next, { t: "event", m: "The shrine pays a Bloodbound Shard." });
  }
  return endTurn(next);
}

function equip(s: GameState, slot: "weapon" | "armor" | "trinket", v: Weapon | Armor | Trinket) {
  if (slot === "weapon") {
    const oldBonus = s.player.equipment.weapon?.bonus ?? 0;
    s.player.equipment.weapon = v as Weapon;
    s.player.weaponDie = (v as Weapon).die;
    s.player.atkBonus = Math.max(0, s.player.atkBonus - oldBonus) + (v as Weapon).bonus;
  } else if (slot === "armor") {
    const oldAc = s.player.equipment.armor?.ac ?? 0;
    s.player.equipment.armor = v as Armor;
    s.player.ac = s.player.ac - oldAc + (v as Armor).ac;
  } else {
    s.player.equipment.trinket = v as Trinket;
  }
}

function applyDR(s: GameState, dmg: number): number {
  const dr = s.player.equipment.armor?.dr ?? 0;
  return Math.max(0, dmg - dr);
}

function pickUp(s: GameState, it: Item) {
  if (it.kind === "potion") { s.player.potions++; pushLog(s, { t: "loot", m: "Picked up a Crimson Draught." }); }
  else if (it.kind === "elixir") { s.player.elixirs++; pushLog(s, { t: "loot", m: "Picked up a Focus Elixir." }); }
  else if (it.kind === "gold") { s.player.gold += it.amount; s.counters.goldEarned += it.amount; pushLog(s, { t: "loot", m: `Found ${it.amount} obols.` }); }
  else if (it.kind === "shard") { s.player.shards++; s.counters.shardsEarned++; pushLog(s, { t: "loot", m: "Found a Bloodbound Shard." }); }
  else if (it.kind === "weapon" && it.weapon) {
    const w = it.weapon;
    equip(s, "weapon", w);
    pushLog(s, { t: "loot", m: `Equipped ${w.name} (1d${w.die}+${w.bonus}${w.tag ? `, ${w.tag}` : ""}).` });
  } else if (it.kind === "armor" && it.armor) {
    const a = it.armor;
    equip(s, "armor", a);
    pushLog(s, { t: "loot", m: `Equipped ${a.name} (+${a.ac} AC, ${a.dr} DR).` });
  } else if (it.kind === "trinket" && it.trinket) {
    const t = it.trinket;
    equip(s, "trinket", t);
    pushLog(s, { t: "loot", m: `Equipped ${t.name}. ${t.effect}.` });
  }
}

function attackMonster(s: GameState, m: Monster) {
  const die = roll(20);
  const blessed = (s.player.statuses.blessed ?? 0) > 0 ? 2 : 0;
  const total = die + s.player.atkBonus + blessed;
  const crit = die === 20;
  const fumble = die === 1;
  s.lastDice = {
    value: die,
    outcome: crit ? "Critical Success" : fumble ? "Critical Failure" : die >= 15 ? "Great Success" : die >= 8 ? "Success" : "Failure",
    label: `Strike vs ${m.name}`,
  };
  const mods = s.player.atkBonus + blessed;
  if (fumble) {
    pushLog(s, { t: "roll", m: `Strike · d20 → 1 (+${mods}) vs AC ${m.ac} — your blade slips.` });
    flash(s, m.x, m.y, "miss", "MISS");
    return;
  }
  pushLog(s, { t: "roll", m: `Strike · d20 → ${die} (+${mods}) = ${total} vs ${m.name} AC ${m.ac}.` });
  if (crit || total >= m.ac) {
    const dmgDie = roll(s.player.weaponDie);
    let dmg = dmgDie + s.player.atkBonus + (s.player.buffDmg > 0 ? s.player.buffDmg : 0);
    if (crit) dmg *= 2;
    m.hp -= dmg;
    s.counters.damageDealt += dmg;
    pushLog(s, { t: "combat", m: `${crit ? "CRIT! " : ""}Damage · 1d${s.player.weaponDie} → ${dmgDie} (+${s.player.atkBonus}${s.player.buffDmg ? `+${s.player.buffDmg}` : ""})${crit ? " ×2" : ""} = ${dmg} to ${m.name}.` });
    flash(s, m.x, m.y, "hit", `-${dmg}`);
    // weapon tag procs
    const tag = s.player.equipment.weapon?.tag;
    if (tag === "bleed" && rand() < 0.5) {
      m.statuses.bleed = Math.max(m.statuses.bleed ?? 0, 3);
      flash(s, m.x, m.y, "hit", "BLEED");
    } else if (tag === "burn" && rand() < 0.5) {
      m.statuses.burn = Math.max(m.statuses.burn ?? 0, 3);
      flash(s, m.x, m.y, "hit", "BURN");
    } else if (tag === "vorpal" && crit) {
      m.hp = 0;
      pushLog(s, { t: "combat", m: `VORPAL — ${m.name} undone.` });
    }
    if (m.hp <= 0) {
      pushLog(s, { t: "combat", m: `${m.name} crumbles. +${m.xp} XP.` });
      const xpMult = s.player.equipment.trinket?.xpMult ?? 1;
      gainXP(s, Math.round(m.xp * xpMult));
      s.counters.kills++;
      if (m.boss) {
        s.counters.bossKills++;
        s.player.gold += 100;
        s.counters.goldEarned += 100;
        s.player.shards += 1;
        s.counters.shardsEarned += 1;
        pushLog(s, { t: "loot", m: "Boss falls — 100 obols and a Shard wrest free." });
      }
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
  // status effects on player (start of turn end)
  applyStatusesToPlayer(s);
  if (s.player.hp <= 0) {
    s.player.hp = 0;
    s.status = "dead";
    if (s.cause === "unknown") s.cause = "claws";
    pushLog(s, { t: "system", m: "Your blood pools at the dungeon's lips. You have fallen." });
    recomputeFOV(s);
    return s;
  }

  s.monsters = s.monsters.filter((m) => m.hp > 0);
  for (const m of s.monsters) {
    applyStatusesToMonster(s, m);
    if (m.hp <= 0) continue;
    if (m.rootedFor > 0) { m.rootedFor--; continue; }
    if ((m.statuses.rooted ?? 0) > 0) continue;
    const dx = s.player.x - m.x;
    const dy = s.player.y - m.y;
    const dist = Math.abs(dx) + Math.abs(dy);
    if (!m.awake && dist > FOV_RADIUS) continue;
    if (dist === 1) {
      const die = roll(20);
      const total = die + m.bonus;
      if (die === 1) { pushLog(s, { t: "combat", m: `${m.name} stumbles.` }); continue; }
      const targetAC = s.player.ac + (s.player.shield > 0 ? 2 : 0);
      if (die === 20 || total >= targetAC) {
        let dmg = roll(m.atk);
        if (s.player.shield > 0) {
          const absorbed = Math.min(s.player.shield, dmg);
          s.player.shield -= absorbed;
          dmg -= absorbed;
        }
        dmg = applyDR(s, dmg);
        s.player.hp -= dmg;
        s.counters.damageTaken += dmg;
        if (dmg > 0) shake(s, 220);
        pushLog(s, { t: "combat", m: `${m.name} strikes you for ${dmg}.` });
        flash(s, s.player.x, s.player.y, "hit", `-${dmg}`);
        if (s.player.hp <= 0) s.cause = m.boss ? "boss" : "claws";
      } else {
        pushLog(s, { t: "combat", m: `${m.name} misses (${total} vs ${targetAC}).` });
      }
    } else {
      stepMonsterToward(s, m);
    }
  }
  s.monsters = s.monsters.filter((m) => m.hp > 0);
  s.turn++;
  if (s.player.buffTurns > 0) {
    s.player.buffTurns--;
    if (s.player.buffTurns === 0) s.player.buffDmg = 0;
  }
  // trinket focus regen out of combat
  if (!enemyInSight(s) && s.player.equipment.trinket?.focusRegen) {
    s.player.focus = Math.min(s.player.maxFocus, s.player.focus + s.player.equipment.trinket.focusRegen);
  }
  if (s.player.hp <= 0) {
    s.player.hp = 0;
    s.status = "dead";
    if (s.cause === "unknown") s.cause = "claws";
    pushLog(s, { t: "system", m: "Your blood pools at the dungeon's lips. You have fallen." });
  }
  decayStatuses(s.player.statuses);
  recomputeFOV(s);
  return s;
}

function applyStatusesToPlayer(s: GameState) {
  if ((s.player.statuses.bleed ?? 0) > 0) {
    const d = applyDR(s, 2);
    s.player.hp -= d;
    s.counters.damageTaken += d;
    flash(s, s.player.x, s.player.y, "hit", `-${d}`);
  }
  if ((s.player.statuses.burn ?? 0) > 0) {
    const d = applyDR(s, 3);
    s.player.hp -= d;
    s.counters.damageTaken += d;
    flash(s, s.player.x, s.player.y, "hit", `-${d}`);
  }
  if ((s.player.statuses.poison ?? 0) > 0) {
    s.player.hp -= 1;
    s.counters.damageTaken += 1;
  }
}

function applyStatusesToMonster(s: GameState, m: Monster) {
  if ((m.statuses.bleed ?? 0) > 0) { m.hp -= 3; flash(s, m.x, m.y, "hit", "-3"); }
  if ((m.statuses.burn ?? 0) > 0) { m.hp -= 4; flash(s, m.x, m.y, "hit", "-4"); }
  if (m.hp <= 0) {
    pushLog(s, { t: "combat", m: `${m.name} succumbs to its wounds. +${m.xp} XP.` });
    const xpMult = s.player.equipment.trinket?.xpMult ?? 1;
    gainXP(s, Math.round(m.xp * xpMult));
    s.counters.kills++;
  } else {
    decayStatuses(m.statuses);
  }
}

function decayStatuses(map: StatusMap) {
  for (const k of Object.keys(map) as StatusKey[]) {
    const v = map[k] ?? 0;
    if (v <= 1) delete map[k];
    else map[k] = v - 1;
  }
}

function stepMonsterToward(s: GameState, m: Monster) {
  const dx = s.player.x - m.x;
  const dy = s.player.y - m.y;
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
    m.x = nx; m.y = ny;
    return;
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

export type AspectPower = { id: string; label: string; desc: string; cost: number };

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
  fury:      { id: "fury",       label: "HEMORRHAGE",     desc: "10 dmg + bleed to adjacent foe.", cost: 3 },
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
      shake(next, 250);
      break;
    }
    case "veils": {
      const t = adj.find((m) => m.hp <= 8);
      if (!t) { pushLog(next, { t: "system", m: "No weakened foe within reach." }); return next; }
      t.hp = 0; gainXP(next, t.xp); next.counters.kills++;
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
      if (t.hp <= 0) { gainXP(next, t.xp); next.counters.kills++; }
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
      if (t.hp <= 0) { gainXP(next, t.xp); next.counters.kills++; }
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
        const g = ri(20, 60); next.player.gold += g; next.counters.goldEarned += g;
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
      t.statuses.bleed = Math.max(t.statuses.bleed ?? 0, 4);
      pushLog(next, { t: "combat", m: `HEMORRHAGE — ${t.name} bleeds.` });
      if (t.hp <= 0) { gainXP(next, t.xp); next.counters.kills++; }
      break;
    }
  }
  return endTurn(next);
}

// ---- Shop ----
export function buyOffer(s: GameState, offerId: string): GameState {
  if (!s.shop) return s;
  const offer = s.shop.find((o) => o.id === offerId);
  if (!offer) return s;
  if (s.player.gold < offer.cost) {
    const np = clone(s);
    pushLog(np, { t: "system", m: "Not enough obols." });
    return np;
  }
  const next = clone(s);
  next.player.gold -= offer.cost;
  switch (offer.kind) {
    case "weapon": equip(next, "weapon", offer.payload as Weapon); pushLog(next, { t: "loot", m: `Bound to ${(offer.payload as Weapon).name}.` }); break;
    case "armor":  equip(next, "armor", offer.payload as Armor);  pushLog(next, { t: "loot", m: `Donned ${(offer.payload as Armor).name}.` }); break;
    case "trinket":equip(next, "trinket", offer.payload as Trinket);pushLog(next, { t: "loot", m: `Bound ${(offer.payload as Trinket).name}.` }); break;
    case "potions":next.player.potions += offer.payload as number; pushLog(next, { t: "loot", m: `Bought ${offer.payload} Crimson Draughts.` }); break;
    case "elixirs":next.player.elixirs += offer.payload as number; pushLog(next, { t: "loot", m: `Bought ${offer.payload} Focus Elixirs.` }); break;
    case "heal":   next.player.hp = next.player.maxHp; next.player.focus = next.player.maxFocus; pushLog(next, { t: "system", m: "Restored to full vitality." }); flash(next, next.player.x, next.player.y, "heal", "FULL"); break;
    case "shield": next.player.shield += 10; pushLog(next, { t: "system", m: "Warded by sanctuary." }); break;
  }
  // remove one-shot offers so they can't be re-bought
  if (offer.kind === "weapon" || offer.kind === "armor" || offer.kind === "trinket" || offer.kind === "heal") {
    next.shop = next.shop!.filter((o) => o.id !== offerId);
  }
  return next;
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function clone(s: GameState): GameState {
  return {
    ...s,
    tiles: s.tiles.map((row) => row.map((t) => ({ ...t }))),
    monsters: s.monsters.map((m) => ({ ...m, statuses: { ...m.statuses } })),
    items: s.items.map((i) => ({ ...i })),
    player: { ...s.player, equipment: { ...s.player.equipment }, statuses: { ...s.player.statuses } },
    log: s.log.slice(),
    flashes: s.flashes.slice(),
    counters: { ...s.counters },
    shop: s.shop ? s.shop.slice() : null,
    visitedRooms: new Set(s.visitedRooms),
  };
}
