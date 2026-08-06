// Boss-specific pre-fight cinematics: staged dialogue beats, telegraphed
// mechanics, and an arena HUD theme per boss.

export type CinematicBeat = {
  /** Small caption above the line (stage direction / speaker). */
  speaker: string;
  /** The line itself — narration or boss dialogue. */
  line: string;
  /** Optional visual treatment key for the still. */
  shot?: "wide" | "close" | "black";
};

export type Telegraph = {
  /** When it fires, in plain language. */
  cue: string;
  /** What it does. */
  effect: string;
  /** How to answer it. */
  counter: string;
};

export type BossTheme = {
  /** Tailwind text colour class for arena accents. */
  accent: string;
  /** Tailwind border colour class. */
  border: string;
  /** Tailwind background wash class. */
  wash: string;
  /** CSS gradient used for the arena vignette overlay. */
  vignette: string;
  /** Short banner shown in the in-game HUD while in this arena. */
  banner: string;
};

export type BossIntro = {
  name: string;
  epithet: string;
  /** Rank/threat label shown in the cinematic. */
  threat: string;
  beats: CinematicBeat[];
  telegraphs: Telegraph[];
  theme: BossTheme;
};

export const BOSS_INTROS: Record<string, BossIntro> = {
  "Throne of Maggots": {
    name: "Throne of Maggots",
    epithet: "The Seat That Ate Its King",
    threat: "APEX · CATACOMBS",
    beats: [
      {
        shot: "black",
        speaker: "THE DOORS CLOSE BEHIND YOU",
        line: "The antechamber seals with the soft, final sound of a coffin lid finding its groove. Bone-dust settles. Nothing in this room has hurried in three hundred years.",
      },
      {
        shot: "wide",
        speaker: "THE CHAMBER",
        line: "A throne of fused corpses sits at the far end, backed by a rose window of ribs. The crown on it moves — not metal, but a slow, seething mass of white.",
      },
      {
        shot: "close",
        speaker: "THRONE OF MAGGOTS",
        line: "\"Another porter. They always send the ones nobody counts.\" The voice comes from every mouth in the throne at once, slightly out of time with itself.",
      },
      {
        shot: "close",
        speaker: "THRONE OF MAGGOTS",
        line: "\"Sit with me a while. Everyone does, eventually. The only choice you have left is how much of you is still awake when you do.\"",
      },
      {
        shot: "wide",
        speaker: "YOU DRAW",
        line: "You answer the only way the dungeon has ever accepted an answer.",
      },
    ],
    telegraphs: [
      { cue: "Below two-thirds health", effect: "The crown bursts — a bleeding tide washes over you", counter: "Keep a potion in reach; bleed stacks while you stand still" },
      { cue: "Below one-third health", effect: "The throne stands on bone-arms: harder to hit, hits harder", counter: "Burn your strongest skills before it rises" },
      { cue: "Always", effect: "It fights from a seated pool of grave-rot; it never retreats", counter: "Strike, step out, strike — do not trade turn-for-turn" },
    ],
    theme: {
      accent: "text-bone",
      border: "border-bone/60",
      wash: "bg-bone/5",
      vignette: "radial-gradient(ellipse at 50% 35%, transparent 30%, oklch(0.12 0.02 90 / 70%) 90%)",
      banner: "THE SEAT THAT ATE ITS KING",
    },
  },

  "The Veiled Sovereign": {
    name: "The Veiled Sovereign",
    epithet: "Seven Robes Over Nothing",
    threat: "APEX · VEILED HALLS",
    beats: [
      {
        shot: "black",
        speaker: "THE MIRRORS GO DARK",
        line: "Every reflection in the hall turns away from you at once — a courtly, coordinated snub. Only the far doors keep your face.",
      },
      {
        shot: "wide",
        speaker: "THE COURT",
        line: "The arena is a ballroom with the dancers removed. Seven robes stand at its centre, layered over a shape that refuses to be there.",
      },
      {
        shot: "close",
        speaker: "THE VEILED SOVEREIGN",
        line: "\"You have been announced. Not by me — by the room. It has been saying your name since the third floor, and you never once turned around.\"",
      },
      {
        shot: "close",
        speaker: "THE VEILED SOVEREIGN",
        line: "\"I will remove one veil for each truth you take from me. When the last comes off, you will finally see what has been wearing this dungeon.\"",
      },
      {
        shot: "wide",
        speaker: "THE FLOOR TILTS",
        line: "The chandeliers dim to candle-stubs. The court, invisible and enormous, leans in to watch.",
      },
    ],
    telegraphs: [
      { cue: "Below two-thirds health", effect: "A veil falls — its strikes land from angles you cannot see; accuracy and guard rise", counter: "Fight with your back to a pillar; do not chase it into open floor" },
      { cue: "Below one-third health", effect: "The last veil tears: heavy damage spike and it reclaims part of its health", counter: "Save burst damage for this window or the fight resets on you" },
      { cue: "Always", effect: "Mirror-work: it punishes predictable movement patterns", counter: "Vary your approach lane between exchanges" },
    ],
    theme: {
      accent: "text-arcane",
      border: "border-arcane/60",
      wash: "bg-arcane/5",
      vignette: "radial-gradient(ellipse at 50% 40%, transparent 28%, oklch(0.10 0.06 300 / 72%) 90%)",
      banner: "SEVEN ROBES OVER NOTHING",
    },
  },

  "Heart of the Mire": {
    name: "Heart of the Mire",
    epithet: "The Beat Beneath Every Floor",
    threat: "APEX · BLOOD MIRE",
    beats: [
      {
        shot: "black",
        speaker: "THE FLOOR STOPS BREATHING",
        line: "For the first time since you entered the mire, the ground is still. It is holding its breath, and so, without deciding to, are you.",
      },
      {
        shot: "wide",
        speaker: "THE ROOT-CHAMBER",
        line: "A cavern of black roots woven into a cage, and inside it a vast ember beating slow and orange. Every pulse pushes hot air past your teeth.",
      },
      {
        shot: "close",
        speaker: "HEART OF THE MIRE",
        line: "\"I remember you smaller. I remember you carrying other people's iron up other people's stairs. I remember you dying, and I remember declining it.\"",
      },
      {
        shot: "close",
        speaker: "HEART OF THE MIRE",
        line: "\"Everything you have taken on the way down, you took from me. Kill me and you inherit the debt as well as the strength. Still coming?\"",
      },
      {
        shot: "wide",
        speaker: "THE CAGE OPENS",
        line: "The roots peel back like fingers from a fist. The ember swells until the chamber is one long, red exhale.",
      },
    ],
    telegraphs: [
      { cue: "Below two-thirds health", effect: "Roots lash from the floor — sustained bleed and drained air", counter: "Break line with the pillars; do not stand in open mud" },
      { cue: "Below one-third health", effect: "Final pulse: attack and guard surge together", counter: "Enter this phase above half health with a potion banked" },
      { cue: "Always", effect: "Its damage grows with every memory it rewrites — long fights favour it", counter: "Commit to burst windows; attrition loses here" },
    ],
    theme: {
      accent: "text-blood",
      border: "border-blood/60",
      wash: "bg-blood/5",
      vignette: "radial-gradient(ellipse at 50% 45%, transparent 25%, oklch(0.12 0.10 20 / 74%) 90%)",
      banner: "THE BEAT BENEATH EVERY FLOOR",
    },
  },
};

export function bossIntroFor(bossName: string): BossIntro | null {
  return BOSS_INTROS[bossName] ?? null;
}
