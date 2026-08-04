// NPC dialogue templates for the dungeon.
// These reuse FloorChoice / FloorChoiceEffect from floor-events so that
// `applyFloorChoice` handles the state mutation identically.

import type { BiomeId } from "./dungeon-engine";
import { resolveChoiceForRace, type FloorChoice } from "./floor-events";

export type NpcTone = "blood" | "ember" | "arcane" | "bone";

export type NpcTemplate = {
  id: string;
  name: string;
  glyph: string;
  tone: NpcTone;
  /** Short flavor line under the name in the modal. */
  npc: string;
  /** Opening prompt spoken by the NPC. */
  prompt: string;
  /** Optional prompt overrides keyed by race id. */
  racePrompt?: Partial<Record<string, string>>;
  /** 2–4 choices. Reuses FloorChoice for effect + saga mutations. */
  choices: FloorChoice[];
  /** If set, restrict to these biomes. Otherwise available anywhere. */
  biomes?: BiomeId[];
  /** Minimum floor before this NPC can appear. */
  minFloor?: number;
};

export function resolveNpcTemplateForRace(
  tpl: NpcTemplate,
  raceId?: string,
): NpcTemplate {
  if (!raceId) return tpl;
  const prompt = tpl.racePrompt?.[raceId] ?? tpl.prompt;
  const choices = tpl.choices.map((c) => resolveChoiceForRace(c, raceId));
  return { ...tpl, prompt, choices };
}

export const NPC_TEMPLATES: NpcTemplate[] = [
  // ── Catacombs ───────────────────────────────────────────────
  {
    id: "npc-bone-scribe",
    name: "The Bone Scribe",
    glyph: "&",
    tone: "bone",
    npc: "A hooded scholar copying names off a wall of skulls.",
    prompt:
      "'Every skull here has a story. I take dictation.' The scribe glances up. 'Trade one of yours — a memory, a coin, a drop of blood — and I'll teach you a syllable that hurts.'",
    biomes: ["catacombs"],
    minFloor: 2,
    choices: [
      {
        label: "Give a memory (-3 Focus)",
        hint: "+2 buff DMG · 6 turns",
        outcome: "The scribe writes something into a tiny ledger. You forget what you gave. The word she teaches you settles like a splinter behind your teeth.",
        effect: { focus: -3, buffDmg: 2, buffTurns: 6 },
      },
      {
        label: "Pay 12 obols",
        hint: "-12 gold · +1 shard · +4 HP",
        outcome: "She pockets the coins with a bone-white smile. 'Owed is owed.' A shard drops into your palm, warm from her hand.",
        effect: { gold: -12, shards: 1, hp: 4 },
      },
      {
        label: "Refuse politely",
        hint: "no cost",
        outcome: "The scribe nods and returns to her ledger. 'Another time, then.' The dead go on being named without you.",
        effect: {},
      },
    ],
  },
  {
    id: "npc-mendicant",
    name: "The Ash Mendicant",
    glyph: "&",
    tone: "ember",
    npc: "A beggar in cracked ceramic robes, cupped hands full of dust.",
    prompt:
      "'Coin for the fire, wanderer.' The dust in his hands glows faintly. 'Or take some — it is only ash, but it remembers being hot.'",
    biomes: ["catacombs", "foundry"],
    minFloor: 2,
    choices: [
      {
        label: "Drop 8 obols in his hands",
        hint: "-8 gold · +1 elixir · +2 shield",
        outcome: "The mendicant closes his fists over the coins. Warmth spreads into your bones. He presses a small phial into your palm.",
        effect: { gold: -8, elixirs: 1, shield: 2 },
      },
      {
        label: "Scoop up a handful of ash",
        hint: "+3 buff DMG · 5 turns · -2 HP",
        outcome: "The ash burns you the moment you touch it — clean, hungry, useful. You breathe out smoke.",
        effect: { hp: -2, buffDmg: 3, buffTurns: 5 },
      },
      {
        label: "Walk past",
        hint: "no cost",
        outcome: "He says nothing as you go. The dust in his hands does not stop glowing.",
        effect: {},
      },
    ],
  },

  // ── Foundry ─────────────────────────────────────────────────
  {
    id: "npc-tinker-widow",
    name: "The Tinker Widow",
    glyph: "&",
    tone: "ember",
    npc: "A stooped smith at a cooling forge, tools in mourning-black cloth.",
    prompt:
      "She tests your weapon's edge with a callused thumb. 'I can put a scream into it, for a price. The scream will be yours the first time you use it.'",
    biomes: ["foundry"],
    minFloor: 2,
    choices: [
      {
        label: "Pay 20 obols to hone",
        hint: "-20 gold · +1 atk bonus (permanent)",
        outcome: "Sparks fly. The widow works in silence. When she hands the weapon back, it is heavier and quieter — waiting.",
        effect: { gold: -20, atkBonus: 1 },
      },
      {
        label: "Trade 2 elixirs for armor bracing",
        hint: "-2 elixirs · +1 AC (permanent)",
        outcome: "She melts the elixirs into a lacquer and paints it along your armor's seams. It hardens into something like a second skin.",
        effect: { elixirs: -2, ac: 1 },
      },
      {
        label: "Ask her story",
        hint: "+1 potion · brief kindness",
        outcome: "She tells you about a son who went down and did not come up. When she is done she gives you a phial of red. 'For someone who might.'",
        effect: { potions: 1 },
      },
    ],
  },

  // ── Veiled Halls ────────────────────────────────────────────
  {
    id: "npc-mirror-page",
    name: "The Mirror Page",
    glyph: "&",
    tone: "arcane",
    npc: "A child in silver livery, holding a folded velvet card.",
    prompt:
      "The page bows. 'The Sovereign has noted your descent. She sends a favour — or a lesson. Choose which you would owe.'",
    biomes: ["veiled"],
    minFloor: 2,
    choices: [
      {
        label: "Accept the favour",
        hint: "+8 HP · +6 Focus · owe the court",
        outcome: "The page presses two fingers to your forehead. Cold silver light fills the corridor and then is gone. Something in you now bows when it should not.",
        effect: { hp: 8, focus: 6 },
      },
      {
        label: "Accept the lesson",
        hint: "+2 AC · +2 atk bonus · a mark that will be answered",
        outcome: "The page smiles the smile of a much older thing. 'Very good.' Your posture changes. You are, briefly, more dangerous than you were.",
        effect: { ac: 2, atkBonus: 2 },
      },
      {
        label: "Refuse the card",
        hint: "+2 shards · displeasure",
        outcome: "The page bows again, deeper this time, and turns away without a word. You find two shards in your pocket you did not put there.",
        effect: { shards: 2 },
      },
    ],
  },

  // ── Blood Mire ──────────────────────────────────────────────
  {
    id: "npc-drowned-oracle",
    name: "The Drowned Oracle",
    glyph: "&",
    tone: "blood",
    npc: "A woman standing waist-deep in dark water that isn't there.",
    prompt:
      "She speaks without opening her mouth. 'I saw your death, wanderer. Twice. Would you like to change one of them?'",
    biomes: ["mire"],
    minFloor: 3,
    choices: [
      {
        label: "Bleed for foresight",
        hint: "-6 HP · +2 shards · +1 potion",
        outcome: "You draw your own blood into the water that isn't there. It laps at your wrist and takes. In return, three small mercies fall into your palm.",
        effect: { hp: -6, shards: 2, potions: 1 },
      },
      {
        label: "Trade a memory of daylight",
        hint: "-4 Focus · +3 buff DMG · 8 turns",
        outcome: "You describe morning to her. When you are done you cannot quite picture it anymore. Something in your grip goes tight and hot.",
        effect: { focus: -4, buffDmg: 3, buffTurns: 8 },
      },
      {
        label: "Say nothing and step back",
        hint: "+2 shield",
        outcome: "The oracle watches you leave. 'The other death, then,' she says. You do not ask what she means.",
        effect: { shield: 2 },
      },
    ],
  },

  // ── Any biome (wanderers) ───────────────────────────────────
  {
    id: "npc-lost-ascendant",
    name: "A Lost Ascendant",
    glyph: "&",
    tone: "bone",
    npc: "A wounded figure in armor that looks like yours but older.",
    prompt:
      "They lift their head. 'You made it further than I did.' A cracked laugh. 'Take what you can carry. It didn't help me.'",
    minFloor: 3,
    choices: [
      {
        label: "Take their potions",
        hint: "+2 potions · +6 gold",
        outcome: "They watch you loot them without complaint. When you look up to thank them, they are already gone.",
        effect: { potions: 2, gold: 6 },
      },
      {
        label: "Give them your last potion",
        hint: "-1 potion · +2 shards · a kindness remembered",
        outcome: "You press the phial into their hand. They swallow, breathe, and press two shards into yours. 'The dungeon watches. It saw that.'",
        effect: { potions: -1, shards: 2 },
      },
      {
        label: "Ask what killed them",
        hint: "+2 atk bonus · +2 AC · 4 turns of buff DMG",
        outcome: "They tell you, in detail, exactly where the blow will come from. You listen. You will remember. Your stance changes.",
        effect: { atkBonus: 2, ac: 2, buffDmg: 2, buffTurns: 4 },
      },
    ],
  },
  {
    id: "npc-coin-broker",
    name: "The Coin Broker",
    glyph: "&",
    tone: "ember",
    npc: "A neat little man behind a folding table stacked with obols.",
    prompt:
      "'Shards to coin, coin to shards, favour to either. Standard rates. No haggling — the dungeon audits me.'",
    minFloor: 2,
    choices: [
      {
        label: "Sell 1 shard for coin",
        hint: "-1 shard · +30 gold",
        outcome: "The broker snaps his ledger shut. The coin appears without him having reached for it.",
        effect: { shards: -1, gold: 30 },
      },
      {
        label: "Buy 1 shard with coin",
        hint: "-40 gold · +1 shard",
        outcome: "He counts the coins, bites one, and slides a shard across the table. It hums faintly against your palm.",
        effect: { gold: -40, shards: 1 },
      },
      {
        label: "Buy 2 potions",
        hint: "-16 gold · +2 potions",
        outcome: "He pulls two phials from beneath the table. 'Fresh. From an ascendant who no longer needs them.'",
        effect: { gold: -16, potions: 2 },
      },
      {
        label: "Move on",
        hint: "no cost",
        outcome: "'Suit yourself.' He is not looking up as you leave.",
        effect: {},
      },
    ],
  },
];

/** Pick an NPC template for a floor, filtered by biome + min floor. */
export function pickNpcTemplate(biomeId: BiomeId, floor: number, raceId?: string): NpcTemplate | null {
  const pool = NPC_TEMPLATES.filter((t) => {
    if (t.minFloor && floor < t.minFloor) return false;
    if (t.biomes && !t.biomes.includes(biomeId)) return false;
    return true;
  });
  if (pool.length === 0) return null;
  const tpl = pool[Math.floor(Math.random() * pool.length)];
  return resolveNpcTemplateForRace(tpl, raceId);
}

export function getNpcTemplate(id: string, raceId?: string): NpcTemplate | undefined {
  const tpl = NPC_TEMPLATES.find((t) => t.id === id);
  if (!tpl) return undefined;
  return resolveNpcTemplateForRace(tpl, raceId);
}
