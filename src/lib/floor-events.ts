import type { BiomeId, GameState } from "./dungeon-engine";

export type FloorChoiceEffect = {
  hp?: number;
  focus?: number;
  gold?: number;
  shards?: number;
  shield?: number;
  ac?: number;
  atkBonus?: number;
  buffDmg?: number;
  buffTurns?: number;
  potions?: number;
  elixirs?: number;
};

export type FloorChoice = {
  label: string;
  hint?: string;
  outcome: string;
  effect: FloorChoiceEffect;
};

export type FloorEvent = {
  id: string;
  title: string;
  npc?: string;
  prompt: string;
  choices: [FloorChoice, FloorChoice];
};

// Biome intro flavor — paragraph shown alongside the floor description.
export const FLOOR_INTROS: Record<BiomeId, string[]> = {
  catacombs: [
    "You step from the stair into a cathedral of bones. Reliquaries line the walls, each labelled in a script that crawls when you read it. The air tastes of old incense and older grief.",
    "A nave of carved skulls watches you arrive. Somewhere far below, a choir hums a single sustained note. It has been holding it for centuries.",
    "Cold stone, colder silence. The Catacombs accept you the way a tomb accepts a coin — without comment.",
  ],
  foundry: [
    "Heat slaps you as the stair ends. The Ember Foundry stretches out in red-lit aisles: anvils larger than men, forges that have not gone cold since the smith-kings fell.",
    "You descend into a furnace-cathedral. Rivers of slag map paths the old smiths walked. The bellows wheeze on their own.",
    "Iron-scent and ash. Every breath here is borrowed from a fire someone forgot to bank.",
  ],
  veiled: [
    "Mirrors stand floor-to-ceiling along the corridor, each holding a court that is not yours. The Veiled Halls received you before you arrived; the velvet ropes were already moved aside.",
    "A long gallery of dark glass. Candle-flames burn without heat, naming things that should not be named aloud. You curtsey without meaning to.",
    "Silk and silence. The court of the Sovereign is still in session — you are simply late to the audience.",
  ],
  mire: [
    "The stair ends in water that is not quite water. Black roots drink from the steps. The Blood Mire breathes around you, slow and patient, as if you were the meal arriving.",
    "Hot, wet dark. The walls beat with a tide that matches your own pulse, and then slowly — politely — overtakes it.",
    "You have descended into the dungeon's own heart. The floor is warm. The floor is listening.",
  ],
};

// Story / NPC events per biome. Choices have small mechanical effects.
const EVENTS: Record<BiomeId, FloorEvent[]> = {
  catacombs: [
    {
      id: "cat-ossuary-keeper",
      title: "The Ossuary Keeper",
      npc: "A bone-thin figure in faded vestments",
      prompt:
        "An old keeper rises from amid the relics. 'Each bone here has a name,' he rasps. 'Speak yours — leave a coin — and the dead may answer.'",
      choices: [
        {
          label: "Pay 15 obols for a blessing",
          hint: "−15 gold · +6 HP · +4 Focus",
          outcome: "He drops your coin into a skull's open mouth. Warmth, briefly, in your chest.",
          effect: { gold: -15, hp: 6, focus: 4 },
        },
        {
          label: "Spit on the floor and walk on",
          hint: "+2 ATK · +1 buff round · a curse, perhaps",
          outcome: "The keeper laughs without humour. 'The dead remember rudeness too.' Your knuckles whiten on your weapon.",
          effect: { buffDmg: 2, buffTurns: 4 },
        },
      ],
    },
    {
      id: "cat-weeping-saint",
      title: "The Weeping Saint",
      prompt:
        "A marble saint weeps black water onto a basin. The water glints like a promise — or a contract.",
      choices: [
        {
          label: "Drink",
          hint: "+8 HP · +1 shield",
          outcome: "It tastes of iron and old apologies. You feel steadied.",
          effect: { hp: 8, shield: 1 },
        },
        {
          label: "Pry a tear-bead loose",
          hint: "+1 shard · −3 HP",
          outcome: "The saint's stone hand grips your wrist for an instant. You leave with the bead and a thin cut.",
          effect: { shards: 1, hp: -3 },
        },
      ],
    },
  ],

  foundry: [
    {
      id: "fo-soot-prophet",
      title: "The Soot Prophet",
      npc: "A child shape, all ash, with cinder-bright eyes",
      prompt:
        "A small figure crouches by a cold forge, drawing futures in the ash. 'Pick a coal,' she says. 'One burns. One sings.'",
      choices: [
        {
          label: "Take the singing coal",
          hint: "+1 ATK bonus",
          outcome: "It hums against your palm and sinks beneath your skin. Your strikes feel surer.",
          effect: { atkBonus: 1 },
        },
        {
          label: "Take the burning coal",
          hint: "−4 HP · +2 shards",
          outcome: "It scars your hand on the way into your pocket. Two bloodbound shards stay behind in the ash.",
          effect: { hp: -4, shards: 2 },
        },
      ],
    },
    {
      id: "fo-bellows-pact",
      title: "The Bellows-Pact",
      prompt:
        "A forge ignites at your approach. A voice in the flame: 'Feed me, and I will arm you. Refuse, and I will remember.'",
      choices: [
        {
          label: "Feed it 20 obols",
          hint: "−20 gold · +2 buff DMG · 6 turns",
          outcome: "Your weapon edge glows briefly orange. The forge sighs, satisfied.",
          effect: { gold: -20, buffDmg: 2, buffTurns: 6 },
        },
        {
          label: "Refuse",
          hint: "+1 elixir scavenged from the rubble",
          outcome: "The fire dims. You find a focus elixir in the ashpit on your way past — unrelated, surely.",
          effect: { elixirs: 1 },
        },
      ],
    },
  ],

  veiled: [
    {
      id: "ve-mirror-twin",
      title: "Your Reflection, Late",
      prompt:
        "Your reflection arrives in the mirror a full breath after you do. It tilts its head and offers — politely — to trade.",
      choices: [
        {
          label: "Trade a memory for a boon",
          hint: "−6 Focus · +2 AC · 1 potion",
          outcome: "Something small leaves you. You will not notice what until much later.",
          effect: { focus: -6, ac: 2, potions: 1 },
        },
        {
          label: "Look away",
          hint: "+1 Focus regen (mild)",
          outcome: "You refuse the mirror's eye. The corridor exhales. You feel clearer, somehow.",
          effect: { focus: 4 },
        },
      ],
    },
    {
      id: "ve-court-herald",
      title: "The Pale Herald",
      npc: "A herald in colourless silks, holding a folded writ",
      prompt:
        "'The Sovereign sees you,' the herald says. 'Bow, and be remembered kindly. Refuse, and be remembered.'",
      choices: [
        {
          label: "Bow",
          hint: "+10 HP · +1 shield",
          outcome: "Soft applause from nowhere. The court has noted you — for now, fondly.",
          effect: { hp: 10, shield: 1 },
        },
        {
          label: "Stand",
          hint: "+1 ATK · +3 buff DMG · 3 turns",
          outcome: "The herald's smile thins to a wire. 'As you wish.' Anger sharpens you.",
          effect: { atkBonus: 1, buffDmg: 3, buffTurns: 3 },
        },
      ],
    },
  ],

  mire: [
    {
      id: "mi-root-mother",
      title: "The Root-Mother",
      npc: "A woman-shape grown through with black roots",
      prompt:
        "She does not move when you approach. 'Give me blood,' she says, 'and I will give you back what the dungeon took.'",
      choices: [
        {
          label: "Give 8 HP of blood",
          hint: "−8 HP · +2 shards · +1 potion",
          outcome: "She drinks. The roots flush red, then settle. She presses gifts into your hand.",
          effect: { hp: -8, shards: 2, potions: 1 },
        },
        {
          label: "Refuse and pass",
          hint: "+1 buff DMG · 8 turns",
          outcome: "Her gaze follows you. You walk on with a slow, cold fury that lasts.",
          effect: { buffDmg: 1, buffTurns: 8 },
        },
      ],
    },
    {
      id: "mi-heart-pulse",
      title: "The Heart's Pulse",
      prompt:
        "The mire-floor swells beneath you in a single, deliberate beat. Something vast notices.",
      choices: [
        {
          label: "Press your palm to the floor",
          hint: "+12 HP · −4 Focus",
          outcome: "Heat floods up your arm. Your wounds close — and something old learns your shape.",
          effect: { hp: 12, focus: -4 },
        },
        {
          label: "Step quickly off",
          hint: "+2 shield · +1 AC",
          outcome: "You move on unnoticed. Caution settles around you like armour.",
          effect: { shield: 2, ac: 1 },
        },
      ],
    },
  ],
};

const SANCTUARY_EVENT: FloorEvent = {
  id: "sanc-keeper",
  title: "The Sanctuary Keeper",
  npc: "A robed figure tending a single, steady lamp",
  prompt:
    "'You bleed into my floor,' the keeper observes mildly. 'Rest a moment. The dungeon will keep — it always does.'",
  choices: [
    {
      label: "Accept the keeper's tea",
      hint: "+6 HP · +6 Focus",
      outcome: "The tea is bitter and warm. You feel briefly mortal, in a good way.",
      effect: { hp: 6, focus: 6 },
    },
    {
      label: "Trade a story for coin",
      hint: "+12 gold · +1 shard",
      outcome: "You tell the keeper of something you saw below. He pays in coin and quiet listening.",
      effect: { gold: 12, shards: 1 },
    },
  ],
};

export function pickFloorIntro(biomeId: BiomeId, floor: number): string {
  const pool = FLOOR_INTROS[biomeId];
  return pool[(floor - 1) % pool.length];
}

export function pickFloorEvent(
  biomeId: BiomeId,
  floor: number,
  isSanctuary: boolean,
): FloorEvent | null {
  if (isSanctuary) return SANCTUARY_EVENT;
  if (floor === 1) return null; // first descent is just the intro
  // 70% chance of an event each new floor
  if (Math.random() > 0.7) return null;
  const pool = EVENTS[biomeId];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function applyFloorChoice(game: GameState, choice: FloorChoice): GameState {
  const e = choice.effect;
  const p = { ...game.player, statuses: { ...game.player.statuses }, equipment: game.player.equipment };
  if (e.hp) p.hp = Math.max(1, Math.min(p.maxHp, p.hp + e.hp));
  if (e.focus) p.focus = Math.max(0, Math.min(p.maxFocus, p.focus + e.focus));
  if (e.gold) p.gold = Math.max(0, p.gold + e.gold);
  if (e.shards) p.shards = Math.max(0, p.shards + e.shards);
  if (e.shield) p.shield = Math.max(0, p.shield + e.shield);
  if (e.ac) p.ac = p.ac + e.ac;
  if (e.atkBonus) p.atkBonus = p.atkBonus + e.atkBonus;
  if (e.buffDmg) p.buffDmg = Math.max(p.buffDmg, e.buffDmg);
  if (e.buffTurns) p.buffTurns = Math.max(p.buffTurns, e.buffTurns);
  if (e.potions) p.potions = Math.max(0, p.potions + e.potions);
  if (e.elixirs) p.elixirs = Math.max(0, p.elixirs + e.elixirs);

  return {
    ...game,
    player: p,
    log: [...game.log, { t: "event", m: choice.outcome }],
  };
}
