import type { BiomeId, GameState } from "./dungeon-engine";
import { applySagaDelta, type Saga, type SagaDelta } from "./saga";

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
  saga?: SagaDelta;
  /** Optional racial variant overrides keyed by race id. */
  raceVariant?: Partial<Record<string, Partial<FloorChoice>>>;
};

export type FloorEvent = {
  id: string;
  title: string;
  npc?: string;
  prompt: string;
  /** Optional prompt overrides keyed by race id. */
  racePrompt?: Partial<Record<string, string>>;
  choices: [FloorChoice, FloorChoice];
  requires?: (s: Saga) => boolean;
  /** If set, only these races can see this event. */
  requiresRace?: string[];
  /** Higher = more likely to be chosen when multiple match. */
  weight?: number;
};

// ----- Floor intros (atmospheric paragraph) -----
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

export function pickFloorIntro(biomeId: BiomeId, floor: number, saga: Saga): string {
  const base = FLOOR_INTROS[biomeId][(floor - 1) % FLOOR_INTROS[biomeId].length];
  const rep = saga.rep[biomeId] ?? 0;
  if (rep >= 2) return base + " The biome itself seems to lean toward you, recognising a friend.";
  if (rep <= -2) return base + " The walls watch you with the particular attention reserved for those who have given offence.";
  return base;
}

// ----- Race-aware resolution helpers -----
export function resolveChoiceForRace(
  choice: FloorChoice,
  raceId?: string,
): FloorChoice {
  if (!raceId || !choice.raceVariant?.[raceId]) return choice;
  const variant = choice.raceVariant[raceId]!;
  return {
    ...choice,
    label: variant.label ?? choice.label,
    hint: variant.hint ?? choice.hint,
    outcome: variant.outcome ?? choice.outcome,
    effect: { ...choice.effect, ...variant.effect },
    saga: variant.saga ?? choice.saga,
  };
}

export function resolveEventForRace(
  event: FloorEvent,
  raceId?: string,
): FloorEvent {
  const prompt = (raceId && event.racePrompt?.[raceId]) ?? event.prompt;
  const choices = event.choices.map((c) => resolveChoiceForRace(c, raceId)) as [
    FloorChoice,
    FloorChoice,
  ];
  return { ...event, prompt, choices };
}

// ----- Events: branching, with follow-ups gated by saga.flags -----
const EVENTS: Record<BiomeId, FloorEvent[]> = {
  catacombs: [
    // — Opening event
    {
      id: "cat-ossuary-keeper",
      title: "The Ossuary Keeper",
      npc: "A bone-thin figure in faded vestments",
      prompt:
        "An old keeper rises from amid the relics. 'Each bone here has a name,' he rasps. 'Speak yours — leave a coin — and the dead may answer.'",
      racePrompt: {
        umbralborn:
          "The keeper does not rise. He simply tilts his head into shadow and exhales. 'One of the dark-born. The dead here will speak to you differently — if you let them.'",
        human:
          "The keeper studies you with something like curiosity. 'Young blood. The dead have not learned your name yet — but they are listening. Pay the toll, or dare their silence.'",
        giant:
          "The keeper has to crane his neck. 'Mountain's child in a house of bones. The dead do not fear size, but they respect the weight of old stone.'",
      },
      requires: (s) => !s.flags.cat_keeper_met,
      choices: [
        {
          label: "Pay 15 obols for a blessing",
          hint: "−15 gold · +6 HP · +4 Focus · favour with the dead",
          outcome: "He drops your coin into a skull's open mouth. Warmth, briefly, in your chest. 'The bones know your name now.'",
          effect: { gold: -15, hp: 6, focus: 4 },
          saga: {
            setFlags: ["cat_keeper_met", "cat_keeper_paid"],
            rep: { catacombs: 1 },
            addBlessing: {
              id: "bone-favour",
              name: "Bone-Favour",
              desc: "The Catacombs' dead remember you kindly.",
            },
          },
          raceVariant: {
            umbralborn: {
              hint: "−10 gold · +8 HP · +6 Focus · the shadows pay your toll",
              outcome: "The shadows under your cloak spill a few obols forward. The keeper does not touch them. 'The dark has already counted you.'",
              effect: { gold: -10, hp: 8, focus: 6 },
            },
            giant: {
              hint: "−20 gold · +8 HP · +6 Focus · +1 shield · the keeper is impressed",
              outcome: "You drop a fistful of coin that rings like a hammer. The keeper bows lower than usual. 'Old stone pays old debts.'",
              effect: { gold: -20, hp: 8, focus: 6, shield: 1 },
            },
          },
        },
        {
          label: "Spit on the floor and walk on",
          hint: "+2 buff DMG (4 turns) · the keeper will not forget",
          outcome: "The keeper laughs without humour. 'The dead remember rudeness too.' Your knuckles whiten on your weapon.",
          effect: { buffDmg: 2, buffTurns: 4 },
          saga: {
            setFlags: ["cat_keeper_met", "cat_spat"],
            rep: { catacombs: -1 },
          },
          raceVariant: {
            giant: {
              label: "Crush a femur underfoot and walk on",
              hint: "+3 buff DMG (4 turns) · the dead will remember brutality",
              outcome: "The bone snaps like dry twig. The keeper does not flinch. 'The mountain has spoken,' he whispers. 'The mountain will be answered.'",
              effect: { buffDmg: 3, buffTurns: 4 },
            },
          },
        },
      ],
    },
    // — Follow-up: the keeper returns angry
    {
      id: "cat-keeper-return",
      title: "The Keeper Returns",
      npc: "The same bone-thin keeper, no longer patient",
      prompt:
        "He waits in your path with three relic-bone wards already lit. 'I gave you a chance to be remembered well,' he says. 'Now choose again — and pay properly.'",
      requires: (s) => s.flags.cat_spat && !s.flags.cat_keeper_resolved,
      weight: 3,
      choices: [
        {
          label: "Apologise — pay 30 obols",
          hint: "−30 gold · clears the grudge",
          outcome: "He pockets the coin slowly. 'The bones will forget. Eventually.' The wards gutter out.",
          effect: { gold: -30 },
          saga: { setFlags: ["cat_keeper_resolved"], rep: { catacombs: 1 } },
        },
        {
          label: "Refuse him a second time",
          hint: "−5 HP from a binding ward · Keeper's Mark (curse)",
          outcome: "A bone-ward strikes you across the ribs. The mark settles deep, faint and humming. 'Carry it,' he says, 'until you mean an apology.'",
          effect: { hp: -5 },
          saga: {
            setFlags: ["cat_keeper_resolved", "cat_keeper_cursed"],
            rep: { catacombs: -1 },
            addCurse: {
              id: "keepers-mark",
              name: "Keeper's Mark",
              desc: "The Catacombs' dead are watching for an unpaid debt.",
            },
          },
        },
      ],
    },
    // — Standard saint event
    {
      id: "cat-weeping-saint",
      title: "The Weeping Saint",
      prompt: "A marble saint weeps black water onto a basin. The water glints like a promise — or a contract.",
      racePrompt: {
        fae:
          "The saint turns her face toward you before you speak. Her tears slow, as if the Verdant Court still has some courtesy left to teach the dead.",
        umbralborn:
          "The black water parts around your shadow. The saint does not weep harder or softer — but she weeps for you, specifically.",
      },
      requires: (s) => !s.flags.cat_saint_met,
      choices: [
        {
          label: "Drink",
          hint: "+8 HP · +1 shield",
          outcome: "It tastes of iron and old apologies. You feel steadied.",
          effect: { hp: 8, shield: 1 },
          saga: { setFlags: ["cat_saint_met", "cat_drank_tears"], rep: { catacombs: 1 } },
          raceVariant: {
            fae: {
              hint: "+10 HP · +2 Focus · +1 shield · the court's courtesy",
              outcome: "The water tastes of moonlit gardens half-remembered. Something in you brightens, briefly, like a door left ajar.",
              effect: { hp: 10, focus: 2, shield: 1 },
            },
            umbralborn: {
              hint: "+8 HP · +4 Focus · +1 shield · the dark drinks first",
              outcome: "Your shadow sips before your lips touch the basin. The saint's tears warm you in places light cannot reach.",
              effect: { hp: 8, focus: 4, shield: 1 },
            },
          },
        },
        {
          label: "Pry a tear-bead loose",
          hint: "+1 shard · −3 HP · the saint remembers",
          outcome: "The saint's stone hand grips your wrist for an instant. You leave with the bead and a thin cut.",
          effect: { shards: 1, hp: -3 },
          saga: { setFlags: ["cat_saint_met", "cat_pried"], rep: { catacombs: -2 } },
          raceVariant: {
            fae: {
              hint: "+2 shards · −2 HP · the saint weeps for your exile",
              outcome: "The bead comes free too easily. The saint's hand does not stop you — she only weeps faster, as if mourning another lost courtier.",
              effect: { shards: 2, hp: -2 },
            },
          },
        },
      ],
    },
    // — Follow-up if you stole from the saint
    {
      id: "cat-saint-debt",
      title: "The Saint's Debt",
      prompt:
        "The marble saint stands in your way this time — she has walked here from her plinth. Her hand is open. She does not weep now.",
      requires: (s) => s.flags.cat_pried && !s.flags.cat_saint_paid,
      weight: 3,
      choices: [
        {
          label: "Return the bead — pay 1 shard",
          hint: "−1 shard · +10 HP · forgiveness",
          outcome: "She closes her fingers around the bead. Her stone face softens into something almost grateful. You feel mended.",
          effect: { shards: -1, hp: 10 },
          saga: {
            setFlags: ["cat_saint_paid"],
            rep: { catacombs: 2 },
            addBlessing: {
              id: "saints-pardon",
              name: "Saint's Pardon",
              desc: "Forgiven by the weeping saint.",
            },
          },
        },
        {
          label: "Shoulder past her",
          hint: "−6 HP from her stone grip",
          outcome: "Her hand closes on your shoulder hard enough to bruise bone. She lets you pass, but her eyes follow.",
          effect: { hp: -6 },
          saga: { setFlags: ["cat_saint_paid"], rep: { catacombs: -1 } },
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
      racePrompt: {
        dragonborn:
          "The ash-child looks up and grins with too many teeth. 'Wyrm-blood. You do not need my coal — you carry one in your throat. But I will offer anyway.'",
        dwarf:
          "She straightens when she sees you. 'Stone-blood. Cousin of coal and ore. The forge already knows your name.'",
      },
      requires: (s) => !s.flags.fo_prophet_met,
      choices: [
        {
          label: "Take the singing coal",
          hint: "+1 ATK bonus · she will offer again",
          outcome: "It hums against your palm and sinks beneath your skin. Your strikes feel surer.",
          effect: { atkBonus: 1 },
          saga: { setFlags: ["fo_prophet_met", "fo_singing_coal"], rep: { foundry: 1 } },
          raceVariant: {
            dragonborn: {
              hint: "+2 ATK bonus · the old fire answers yours",
              outcome: "The coal does not sink into skin — it rises to meet the ember in your blood. For a moment your shadow has wings.",
              effect: { atkBonus: 2 },
            },
            dwarf: {
              hint: "+1 ATK bonus · +1 AC · the old smiths approve",
              outcome: "The coal rings like a struck anvil when you close your fist. Your armor's seams tighten of their own accord.",
              effect: { atkBonus: 1, ac: 1 },
            },
          },
        },
        {
          label: "Take the burning coal",
          hint: "−4 HP · +2 shards",
          outcome: "It scars your hand on the way into your pocket. Two bloodbound shards stay behind in the ash.",
          effect: { hp: -4, shards: 2 },
          saga: { setFlags: ["fo_prophet_met", "fo_burning_coal"] },
          raceVariant: {
            dragonborn: {
              hint: "−1 HP · +3 shards · the fire knows kin",
              outcome: "The coal burns, but barely. It is polite to its own kind. Three shards glitter in the ash where two should be.",
              effect: { hp: -1, shards: 3 },
            },
          },
        },
      ],
    },
    // — Follow-up: the prophet returns
    {
      id: "fo-prophet-return",
      title: "The Prophet, Again",
      npc: "The ash-child, eyes a little brighter now",
      prompt:
        "She is sitting on the same dead forge, as if she walked here on the same step you did. 'The coal still sings,' she says. 'Will you let it bring its choir?'",
      requires: (s) => s.flags.fo_singing_coal && !s.flags.fo_choir,
      weight: 3,
      choices: [
        {
          label: "Yes — let the choir come",
          hint: "+1 ATK · +1 shard · marked by the foundry",
          outcome: "Heat blooms inside your chest. You hear, for one moment, a great many voices agreeing.",
          effect: { atkBonus: 1, shards: 1 },
          saga: {
            setFlags: ["fo_choir"],
            rep: { foundry: 2 },
            addBlessing: {
              id: "coal-choir",
              name: "Coal-Choir",
              desc: "The Foundry's old fires sing through your strikes.",
            },
          },
        },
        {
          label: "No — quench the coal",
          hint: "−1 ATK · +20 gold returned to you",
          outcome: "She nods, sad and small. The hum inside you dies. A handful of obols rolls from the cold forge, as if in apology.",
          effect: { atkBonus: -1, gold: 20 },
          saga: { setFlags: ["fo_choir"] },
        },
      ],
    },
    {
      id: "fo-bellows-pact",
      title: "The Bellows-Pact",
      prompt:
        "A forge ignites at your approach. A voice in the flame: 'Feed me, and I will arm you. Refuse, and I will remember.'",
      racePrompt: {
        dwarf:
          "A forge ignites at your approach, but the voice in the flame is gentler. 'Stone-blood,' it murmurs. 'You know the old bargain. Feed me, and I will arm you as I armed your fathers.'",
        dragonborn:
          "The flame roars up in greeting. 'Wyrm-blood!' the voice crackles. 'You are fire wearing flesh. Take my gift, or teach me your hunger.'",
      },
      requires: (s) => !s.flags.fo_bellows_met,
      choices: [
        {
          label: "Feed it 20 obols",
          hint: "−20 gold · +2 buff DMG · 6 turns",
          outcome: "Your weapon edge glows briefly orange. The forge sighs, satisfied.",
          effect: { gold: -20, buffDmg: 2, buffTurns: 6 },
          saga: { setFlags: ["fo_bellows_met", "fo_bellows_fed"], rep: { foundry: 1 } },
          raceVariant: {
            dwarf: {
              hint: "−15 gold · +3 buff DMG · 6 turns · the forge remembers kin",
              outcome: "The flame drinks your coin and leaves your weapon singing with heat. 'Well fed,' it says. 'As your grandsires fed me.'",
              effect: { gold: -15, buffDmg: 3, buffTurns: 6 },
            },
            dragonborn: {
              hint: "−10 gold · +2 buff DMG · 8 turns · the fire shares its temper",
              outcome: "The forge takes less from you than from others. It recognizes a kindred hunger. Your blade keeps its heat longer.",
              effect: { gold: -10, buffDmg: 2, buffTurns: 8 },
            },
          },
        },
        {
          label: "Refuse",
          hint: "+1 elixir from the rubble · the forge will remember",
          outcome: "The fire dims. You find a focus elixir in the ashpit on your way past — unrelated, surely.",
          effect: { elixirs: 1 },
          saga: { setFlags: ["fo_bellows_met", "fo_refused_bellows"], rep: { foundry: -1 } },
          raceVariant: {
            dwarf: {
              label: "Refuse with a smith's apology",
              hint: "+1 elixir · the forge is disappointed, not angry",
              outcome: "You bow to the flame the old way. It dims, but does not curse. 'A dwarf who does not forge,' it sighs. 'Still, you know respect.'",
              effect: { elixirs: 1 },
              saga: { setFlags: ["fo_bellows_met"], rep: { foundry: 0 } },
            },
          },
        },
      ],
    },
    {
      id: "fo-forge-remembers",
      title: "The Forge Remembers",
      prompt:
        "Every forge on this floor lights at once as you pass. The flame-voice speaks again, smaller now. 'I told you I would remember.'",
      requires: (s) => s.flags.fo_refused_bellows && !s.flags.fo_forge_resolved,
      weight: 3,
      choices: [
        {
          label: "Pay tribute — 15 gold",
          hint: "−15 gold · clears the grudge",
          outcome: "The forges gutter, one by one. 'A late apology is still an apology.'",
          effect: { gold: -15 },
          saga: { setFlags: ["fo_forge_resolved"], rep: { foundry: 1 } },
        },
        {
          label: "Walk through the heat",
          hint: "−6 HP · Forge-Brand (curse)",
          outcome: "The air burns you on the way past. A glyph sears itself onto your forearm — small, livid, patient.",
          effect: { hp: -6 },
          saga: {
            setFlags: ["fo_forge_resolved"],
            addCurse: {
              id: "forge-brand",
              name: "Forge-Brand",
              desc: "The Ember Foundry's flames have your measure.",
            },
          },
        },
      ],
    },
  ],

  veiled: [
    {
      id: "ve-fae-exile",
      title: "The Exile's Welcome",
      npc: "A fae noble in moth-eaten finery, half-gone to shadow",
      prompt:
        "A figure steps from behind a pillar and bows with the old, precise grace of the Verdant Court. 'Sister. Brother. Kin. The Sovereign has no love for our kind, but I remember the green. Let me remind you, before the Halls make you forget.'",
      requiresRace: ["fae"],
      requires: (s) => !s.flags.ve_fae_exile_met,
      choices: [
        {
          label: "Accept the memory",
          hint: "+8 Focus · +1 shard · Verdant Memory blessing",
          outcome:
            "The noble presses a moth-wing to your brow. For a moment you smell leaves, not dust. 'Do not let the Halls rewrite you,' they whisper.",
          effect: { focus: 8, shards: 1 },
          saga: {
            setFlags: ["ve_fae_exile_met"],
            rep: { veiled: 1 },
            addBlessing: {
              id: "verdant-memory",
              name: "Verdant Memory",
              desc: "The Verdant Court still whispers to you in the Halls.",
            },
          },
        },
        {
          label: "Refuse — the Halls are your home now",
          hint: "+2 AC · +1 ATK · no blessing",
          outcome:
            "The noble's smile is sad and proud. 'Then become something the Sovereign cannot own,' they say, and dissolve into shadow.",
          effect: { ac: 2, atkBonus: 1 },
          saga: { setFlags: ["ve_fae_exile_met"], rep: { veiled: -1 } },
        },
      ],
    },
    {
      id: "ve-mirror-twin",
      title: "Your Reflection, Late",
      prompt:
        "Your reflection arrives in the mirror a full breath after you do. It tilts its head and offers — politely — to trade.",
      racePrompt: {
        fae:
          "Your reflection arrives before you do, this time. It curtsies — or bows — with court-perfect grace. 'Cousin,' it says. 'The Verdant Court taught you better than to trade with glass.'",
        elf:
          "The mirror does not hold your reflection at first. When it does, the image is too still, too patient. 'Long-lived,' it murmurs. 'You have memories worth more than most.'",
      },
      requires: (s) => !s.flags.ve_mirror_met,
      choices: [
        {
          label: "Trade a memory for a boon",
          hint: "−6 Focus · +2 AC · 1 potion",
          outcome: "Something small leaves you. You will not notice what until much later.",
          effect: { focus: -6, ac: 2, potions: 1 },
          saga: { setFlags: ["ve_mirror_met", "ve_traded_memory"] },
          raceVariant: {
            fae: {
              hint: "−4 Focus · +3 AC · 2 potions · the court's own bargain",
              outcome: "Your reflection smiles with all your teeth. 'A fair trade, cousin. The court would be proud.'",
              effect: { focus: -4, ac: 3, potions: 2 },
            },
            elf: {
              hint: "−8 Focus · +3 AC · 2 potions · a century's small sorrow",
              outcome: "You trade a memory of a summer you cannot place. The mirror pays well for things you had too many of.",
              effect: { focus: -8, ac: 3, potions: 2 },
            },
          },
        },
        {
          label: "Look away",
          hint: "+4 Focus · the court approves",
          outcome: "You refuse the mirror's eye. The corridor exhales. You feel clearer, somehow.",
          effect: { focus: 4 },
          saga: { setFlags: ["ve_mirror_met"], rep: { veiled: 1 } },
          raceVariant: {
            fae: {
              hint: "+6 Focus · the court approves deeply",
              outcome: "Your reflection fades, disappointed. The Verdant Court has taught you its oldest lesson: never give glass your name.",
              effect: { focus: 6 },
            },
          },
        },
      ],
    },
    {
      id: "ve-mirror-final",
      title: "The Mirror's Final Trade",
      prompt:
        "Your reflection is waiting for you in every mirror on the floor at once. 'One more,' it mouths. 'A name, this time. And then we are even.'",
      requires: (s) => s.flags.ve_traded_memory && !s.flags.ve_mirror_final,
      weight: 3,
      choices: [
        {
          label: "Give it a name — yours, perhaps",
          hint: "+2 shards · Hollow-Name (curse)",
          outcome: "The mirrors take it gladly. You feel a small lightness where the name used to weigh.",
          effect: { shards: 2 },
          saga: {
            setFlags: ["ve_mirror_final"],
            addCurse: {
              id: "hollow-name",
              name: "Hollow-Name",
              desc: "Something of you walks the Veiled Halls as a stranger now.",
            },
          },
        },
        {
          label: "Smash the nearest mirror",
          hint: "−4 HP shards · the court is appalled · the mirror is silent",
          outcome: "Glass opens your knuckles. Every other mirror on the floor cracks at the same time. The corridor is, at last, quiet.",
          effect: { hp: -4 },
          saga: { setFlags: ["ve_mirror_final"], rep: { veiled: -2 } },
        },
      ],
    },
    {
      id: "ve-court-herald",
      title: "The Pale Herald",
      npc: "A herald in colourless silks, holding a folded writ",
      prompt:
        "'The Sovereign sees you,' the herald says. 'Bow, and be remembered kindly. Refuse, and be remembered.'",
      racePrompt: {
        fae:
          "The herald's composure cracks for half a heartbeat. 'A child of the Verdant Court,' it breathes. 'The Sovereign will be most interested. Bow, and be welcomed as kin. Refuse, and be claimed as a curiosity.'",
        elf:
          "The herald studies your ears, your stillness. 'Long-lived,' it says, with something like envy. 'The Sovereign has a fondness for patience. Bow, and be seated near the throne.'",
      },
      requires: (s) => !s.flags.ve_herald_met,
      choices: [
        {
          label: "Bow",
          hint: "+10 HP · +1 shield · the court warms",
          outcome: "Soft applause from nowhere. The court has noted you — for now, fondly.",
          effect: { hp: 10, shield: 1 },
          saga: { setFlags: ["ve_herald_met", "ve_bowed"], rep: { veiled: 2 } },
          raceVariant: {
            fae: {
              hint: "+12 HP · +2 shield · +1 Focus · welcomed as kin",
              outcome: "The herald bows lower than it bowed to you. 'The Sovereign greets a cousin of the old courts.'",
              effect: { hp: 12, shield: 2, focus: 1 },
            },
            elf: {
              hint: "+10 HP · +2 shield · +1 shard · patience rewarded",
              outcome: "'The Sovereign admires those who outlast,' the herald says, pressing a shard into your palm like a seat-token.",
              effect: { hp: 10, shield: 2, shards: 1 },
            },
          },
        },
        {
          label: "Stand",
          hint: "+1 ATK · +3 buff DMG (3 turns) · the court is offended",
          outcome: "The herald's smile thins to a wire. 'As you wish.' Anger sharpens you.",
          effect: { atkBonus: 1, buffDmg: 3, buffTurns: 3 },
          saga: { setFlags: ["ve_herald_met", "ve_refused_bow"], rep: { veiled: -2 } },
          raceVariant: {
            fae: {
              hint: "+1 ATK · +4 buff DMG (3 turns) · the court is offended by kinship denied",
              outcome: "'To refuse once is pride,' the herald hisses. 'To refuse kinship is insult.' The insult burns in your blood like a battle-song.",
              effect: { atkBonus: 1, buffDmg: 4, buffTurns: 3 },
            },
          },
        },
      ],
    },
    {
      id: "ve-herald-return",
      title: "The Herald Returns, Armed",
      npc: "The pale herald, this time with two silent guards",
      prompt:
        "He does not speak. He simply holds out a writ. The seal is the Sovereign's. The penalty for refusal is already written.",
      requires: (s) => s.flags.ve_refused_bow && !s.flags.ve_herald_resolved,
      weight: 3,
      choices: [
        {
          label: "Kneel and accept the writ",
          hint: "+1 AC · clears the offence",
          outcome: "You kneel. He nods, almost kindly. 'You learn,' he says, and is gone.",
          effect: { ac: 1 },
          saga: { setFlags: ["ve_herald_resolved"], rep: { veiled: 1 } },
        },
        {
          label: "Tear the writ in half",
          hint: "−8 HP from his guards · Sovereign's Notice (curse)",
          outcome: "The guards strike once each, with terrible grace, and withdraw. The herald gathers the torn writ as if it were a relic.",
          effect: { hp: -8 },
          saga: {
            setFlags: ["ve_herald_resolved"],
            rep: { veiled: -2 },
            addCurse: {
              id: "sovereigns-notice",
              name: "Sovereign's Notice",
              desc: "You are on the Sovereign's list — and near the top.",
            },
          },
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
      racePrompt: {
        beastkin:
          "The roots still as you approach. The Root-Mother's head turns, though her body does not. 'Feral heart,' she whispers. 'You smell of honest hunger. Give me blood, and I will give you back the wild the dungeon stole.'",
        crocman:
          "The mire itself seems to bow. 'Child of the river-mud,' she says. 'You know the old bargain: blood for blood, scale for root. Give, and I will make you a swamp-king.'",
      },
      requires: (s) => !s.flags.mi_mother_met,
      choices: [
        {
          label: "Give 8 HP of blood",
          hint: "−8 HP · +2 shards · +1 potion · she will remember",
          outcome: "She drinks. The roots flush red, then settle. She presses gifts into your hand.",
          effect: { hp: -8, shards: 2, potions: 1 },
          saga: { setFlags: ["mi_mother_met", "mi_gave_blood"], rep: { mire: 2 } },
          raceVariant: {
            beastkin: {
              hint: "−6 HP · +3 shards · +2 potions · the wild accepts your offering",
              outcome: "She drinks less from you than from others. 'A small offering from a feral heart is worth more,' she says. The gifts are richer.",
              effect: { hp: -6, shards: 3, potions: 2 },
            },
            crocman: {
              hint: "−6 HP · +2 shards · +1 potion · +1 elixir · the mire welcomes its own",
              outcome: "The roots do not pierce you — they coil, almost affectionately. 'Swallow this,' she says, pressing a muddy elixir into your claws.",
              effect: { hp: -6, shards: 2, potions: 1, elixirs: 1 },
            },
          },
        },
        {
          label: "Refuse and pass",
          hint: "+1 buff DMG (8 turns) · she does not forget refusal",
          outcome: "Her gaze follows you. You walk on with a slow, cold fury that lasts.",
          effect: { buffDmg: 1, buffTurns: 8 },
          saga: { setFlags: ["mi_mother_met", "mi_refused_mother"], rep: { mire: -1 } },
        },
      ],
    },
    {
      id: "mi-root-mother-return",
      title: "The Root-Mother Calls You Back",
      npc: "The same woman, the roots fuller now, deeper red",
      prompt:
        "She is woven a little further into the mire than before. 'You were kind once,' she murmurs. 'Be kind again, and I will be kinder still.'",
      requires: (s) => s.flags.mi_gave_blood && !s.flags.mi_mother_returned,
      weight: 3,
      choices: [
        {
          label: "Give another 10 HP",
          hint: "−10 HP · +2 max HP · Mire-Blessed",
          outcome: "She drinks slowly this time, almost tenderly. Something in you regrows a little larger than before.",
          effect: { hp: -10 },
          saga: {
            setFlags: ["mi_mother_returned"],
            rep: { mire: 2 },
            addBlessing: {
              id: "mire-blessed",
              name: "Mire-Blessed",
              desc: "The Blood Mire counts you as one of its own.",
            },
          },
        },
        {
          label: "Withhold this time",
          hint: "+1 elixir · small disappointment",
          outcome: "She nods. 'A debt is a debt for both of us,' she says, and is the mire again.",
          effect: { elixirs: 1 },
          saga: { setFlags: ["mi_mother_returned"] },
        },
      ],
    },
    {
      id: "mi-heart-pulse",
      title: "The Heart's Pulse",
      prompt: "The mire-floor swells beneath you in a single, deliberate beat. Something vast notices.",
      racePrompt: {
        beastkin:
          "The mire-floor swells beneath you in a single, deliberate beat. Something vast notices — and then, strangely, settles. It smells kinship in your blood.",
        umbralborn:
          "The mire-floor swells beneath you, and the darkness in your shadow swells with it. For one heartbeat, you and the dungeon share the same pulse.",
      },
      requires: (s) => !s.flags.mi_heart_met,
      choices: [
        {
          label: "Press your palm to the floor",
          hint: "+12 HP · −4 Focus · the dungeon learns your shape",
          outcome: "Heat floods up your arm. Your wounds close — and something old learns your shape.",
          effect: { hp: 12, focus: -4 },
          saga: { setFlags: ["mi_heart_met", "mi_pressed_palm"], rep: { mire: 1 } },
          raceVariant: {
            beastkin: {
              hint: "+14 HP · −2 Focus · the dungeon accepts you as kin",
              outcome: "The pulse does not examine you — it welcomes you. Your blood answers the mire's blood.",
              effect: { hp: 14, focus: -2 },
            },
            umbralborn: {
              hint: "+12 HP · +2 Focus · the dark and the mire trade secrets",
              outcome: "Your shadow drinks the pulse before your skin touches it. You feel the dungeon's attention pass on, satisfied.",
              effect: { hp: 12, focus: 2 },
            },
          },
        },
        {
          label: "Step quickly off",
          hint: "+2 shield · +1 AC",
          outcome: "You move on unnoticed. Caution settles around you like armour.",
          effect: { shield: 2, ac: 1 },
          saga: { setFlags: ["mi_heart_met"] },
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

export function pickFloorEvent(
  biomeId: BiomeId,
  floor: number,
  isSanctuary: boolean,
  saga: Saga,
  raceId?: string,
): FloorEvent | null {
  if (isSanctuary) return SANCTUARY_EVENT;
  if (floor === 1) return null;
  const pool = EVENTS[biomeId].filter((e) => {
    if (e.requires && !e.requires(saga)) return false;
    if (e.requiresRace && (!raceId || !e.requiresRace.includes(raceId))) return false;
    return true;
  });
  if (pool.length === 0) return null;

  // Follow-up events (those with weight) ALWAYS fire when eligible.
  const followups = pool.filter((e) => e.weight && e.weight > 1);
  if (followups.length > 0) {
    return followups[Math.floor(Math.random() * followups.length)];
  }

  // Otherwise 70% chance of a fresh event.
  if (Math.random() > 0.7) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function applyFloorChoice(
  game: GameState,
  saga: Saga,
  choice: FloorChoice,
): { game: GameState; saga: Saga } {
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
    game: {
      ...game,
      player: p,
      log: [...game.log, { t: "event", m: choice.outcome }],
    },
    saga: applySagaDelta(saga, choice.saga),
  };
}
