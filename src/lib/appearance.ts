// Cosmetic appearance customization for an Ascendant's bloodline vessel.
// Purely visual: tints, hair, eyes, scars, markings and aura applied over the
// race portrait.

export type Appearance = {
  /** Complexion / hide tone option id. */
  complexion: string;
  /** Body silhouette descriptor id. */
  build: string;
  /** Hairstyle / crown descriptor id. */
  hair: string;
  /** Eye shape + cast id. */
  eyes: string;
  /** Scar pattern id. */
  scar: string;
  /** Ritual marking overlay id. */
  marking: string;
  /** Aura glow id. */
  aura: string;
  /** Free-text description the player writes. */
  note: string;
};

export type ComplexionOption = {
  id: string;
  label: string;
  hint: string;
  /** CSS filter applied to the portrait image. */
  filter: string;
  /** Swatch color for the picker. */
  swatch: string;
};

export const COMPLEXIONS: ComplexionOption[] = [
  { id: "ashen", label: "Ashen", hint: "Grave-pale, corpse-cool", filter: "saturate(0.55) brightness(1.08) contrast(1.02)", swatch: "oklch(0.82 0.02 260)" },
  { id: "umbral", label: "Umbral", hint: "Shadow-steeped", filter: "saturate(0.8) brightness(0.78) hue-rotate(-18deg)", swatch: "oklch(0.35 0.05 285)" },
  { id: "ember", label: "Ember", hint: "Coal-warm, forge-lit", filter: "saturate(1.25) hue-rotate(-16deg) brightness(1.03)", swatch: "oklch(0.66 0.16 45)" },
  { id: "bronze", label: "Bronze", hint: "Sun-scored metal", filter: "saturate(1.1) hue-rotate(-6deg) sepia(0.18)", swatch: "oklch(0.6 0.1 70)" },
  { id: "verdant", label: "Verdant", hint: "Mire-green, root-fed", filter: "saturate(1.1) hue-rotate(55deg)", swatch: "oklch(0.55 0.11 150)" },
  { id: "glacial", label: "Glacial", hint: "Blue-veined frost", filter: "saturate(0.95) hue-rotate(150deg) brightness(1.02)", swatch: "oklch(0.72 0.08 230)" },
  { id: "sanguine", label: "Sanguine", hint: "Blood beneath the skin", filter: "saturate(1.3) hue-rotate(-30deg)", swatch: "oklch(0.48 0.17 20)" },
  { id: "violet", label: "Violet", hint: "Arcane-stained", filter: "saturate(1.15) hue-rotate(35deg)", swatch: "oklch(0.6 0.16 300)" },
];

export const BUILDS: { id: string; label: string; hint: string }[] = [
  { id: "lithe", label: "Lithe", hint: "Whip-thin, quiet-footed" },
  { id: "wiry", label: "Wiry", hint: "Corded, tireless" },
  { id: "broad", label: "Broad", hint: "Shoulders like a door" },
  { id: "towering", label: "Towering", hint: "Head bowed under lintels" },
  { id: "gaunt", label: "Gaunt", hint: "More bone than meat" },
  { id: "hulking", label: "Hulking", hint: "Built like siege equipment" },
  { id: "compact", label: "Compact", hint: "Low, dense, hard to move" },
  { id: "willowy", label: "Willowy", hint: "Long-limbed, unhurried" },
];

/** Hairstyle / head-crown. `css` paints a soft crown layer over the portrait. */
export const HAIRSTYLES: { id: string; label: string; hint: string; css: string | null }[] = [
  { id: "shorn", label: "Shorn", hint: "Scalp bare to the grave-ink", css: null },
  {
    id: "long",
    label: "Long & Loose",
    hint: "Unbound, dungeon-tangled",
    css: "linear-gradient(180deg, oklch(0.14 0.02 40 / 62%) 0%, oklch(0.14 0.02 40 / 30%) 34%, transparent 58%)",
  },
  {
    id: "braids",
    label: "Warrior Braids",
    hint: "Bound tight, bead-weighted",
    css: "repeating-linear-gradient(92deg, oklch(0.16 0.03 50 / 58%) 0 3px, transparent 3px 8px), linear-gradient(180deg, oklch(0.15 0.02 40 / 55%) 0%, transparent 42%)",
  },
  {
    id: "topknot",
    label: "Topknot",
    hint: "Shaved sides, one hard knot",
    css: "radial-gradient(ellipse at 50% 4%, oklch(0.14 0.02 40 / 75%) 0%, transparent 32%), linear-gradient(180deg, oklch(0.14 0.02 40 / 40%) 0%, transparent 26%)",
  },
  {
    id: "horned",
    label: "Crowned Horns",
    hint: "Keratin, scale or bone",
    css: "conic-gradient(from 210deg at 22% 10%, oklch(0.85 0.04 90 / 45%) 0deg 18deg, transparent 18deg), conic-gradient(from 110deg at 78% 10%, oklch(0.85 0.04 90 / 45%) 0deg 18deg, transparent 18deg)",
  },
  {
    id: "mane",
    label: "Beast Mane",
    hint: "Thick, bristling, alive",
    css: "repeating-radial-gradient(circle at 50% 0%, oklch(0.18 0.04 60 / 52%) 0 6px, transparent 6px 13px)",
  },
  {
    id: "ashveil",
    label: "Ash Veil",
    hint: "Hair whitened by the deep",
    css: "linear-gradient(180deg, oklch(0.92 0.01 90 / 40%) 0%, transparent 46%)",
  },
];

/** Eye shape + cast. `css` paints a faint ocular glow band. */
export const EYES: { id: string; label: string; hint: string; css: string | null }[] = [
  { id: "plain", label: "Mortal", hint: "Ordinary, and hiding it well", css: null },
  {
    id: "hooded",
    label: "Hooded",
    hint: "Heavy-lidded, unimpressed",
    css: "linear-gradient(180deg, transparent 26%, oklch(0.10 0.02 285 / 40%) 33%, transparent 40%)",
  },
  {
    id: "wide",
    label: "Wide-Set",
    hint: "Sees too much of the room",
    css: "radial-gradient(ellipse at 36% 34%, oklch(0.92 0.03 90 / 28%) 0%, transparent 12%), radial-gradient(ellipse at 64% 34%, oklch(0.92 0.03 90 / 28%) 0%, transparent 12%)",
  },
  {
    id: "slit",
    label: "Slit-Pupil",
    hint: "Reptile-narrow in torchlight",
    css: "radial-gradient(ellipse at 38% 34%, oklch(0.8 0.19 90 / 46%) 0%, transparent 9%), radial-gradient(ellipse at 62% 34%, oklch(0.8 0.19 90 / 46%) 0%, transparent 9%)",
  },
  {
    id: "emberlit",
    label: "Ember-Lit",
    hint: "Two coals that never cool",
    css: "radial-gradient(ellipse at 38% 34%, oklch(0.72 0.19 45 / 62%) 0%, transparent 11%), radial-gradient(ellipse at 62% 34%, oklch(0.72 0.19 45 / 62%) 0%, transparent 11%)",
  },
  {
    id: "voidblack",
    label: "Void-Black",
    hint: "Sclera drowned, no white left",
    css: "radial-gradient(ellipse at 38% 34%, oklch(0.05 0 0 / 80%) 0%, transparent 12%), radial-gradient(ellipse at 62% 34%, oklch(0.05 0 0 / 80%) 0%, transparent 12%)",
  },
  {
    id: "milkblind",
    label: "Milk-Blind",
    hint: "One clouded, both still watching",
    css: "radial-gradient(ellipse at 38% 34%, oklch(0.95 0.01 90 / 62%) 0%, transparent 10%)",
  },
  {
    id: "arcane",
    label: "Arcane Bright",
    hint: "Violet light with no source",
    css: "radial-gradient(ellipse at 38% 34%, oklch(0.72 0.2 300 / 58%) 0%, transparent 12%), radial-gradient(ellipse at 62% 34%, oklch(0.72 0.2 300 / 58%) 0%, transparent 12%)",
  },
];

/** Scar patterns — cut, burned, bitten. */
export const SCARS: { id: string; label: string; hint: string; css: string | null }[] = [
  { id: "none", label: "Unscarred", hint: "So far", css: null },
  {
    id: "cheek",
    label: "Cheek Slash",
    hint: "One clean line, badly stitched",
    css: "linear-gradient(118deg, transparent 44%, oklch(0.62 0.12 20 / 55%) 45%, transparent 46.5%)",
  },
  {
    id: "crossed",
    label: "Crossed Cuts",
    hint: "Two blades, two occasions",
    css: "linear-gradient(118deg, transparent 40%, oklch(0.62 0.12 20 / 50%) 41%, transparent 42%), linear-gradient(-118deg, transparent 52%, oklch(0.62 0.12 20 / 50%) 53%, transparent 54%)",
  },
  {
    id: "burn",
    label: "Burn Map",
    hint: "Forge-spatter across one side",
    css: "radial-gradient(ellipse at 74% 46%, oklch(0.55 0.13 40 / 45%) 0%, transparent 34%)",
  },
  {
    id: "bite",
    label: "Bite Ring",
    hint: "Something closed its jaws and let go",
    css: "repeating-conic-gradient(from 0deg at 66% 58%, oklch(0.55 0.14 20 / 42%) 0deg 6deg, transparent 6deg 20deg)",
  },
  {
    id: "ladder",
    label: "Ladder Scars",
    hint: "Rungs cut for every death survived",
    css: "repeating-linear-gradient(180deg, transparent 0 9px, oklch(0.6 0.12 20 / 38%) 9px 10px)",
  },
  {
    id: "throat",
    label: "Throat Line",
    hint: "The cut that should have finished it",
    css: "linear-gradient(180deg, transparent 62%, oklch(0.58 0.15 20 / 55%) 63.5%, transparent 65%)",
  },
];

export const MARKINGS: { id: string; label: string; hint: string; css: string | null }[] = [
  { id: "none", label: "Unmarked", hint: "The blood keeps its secrets", css: null },
  {
    id: "runes",
    label: "Runework",
    hint: "Sigils burned into the skin",
    css: "repeating-linear-gradient(115deg, oklch(0.7 0.18 285 / 26%) 0 2px, transparent 2px 11px)",
  },
  {
    id: "scars",
    label: "Ritual Scars",
    hint: "Cut, salted, cut again",
    css: "repeating-linear-gradient(-40deg, oklch(0.5 0.17 20 / 24%) 0 1px, transparent 1px 14px)",
  },
  {
    id: "veins",
    label: "Bright Veins",
    hint: "Light moving under the surface",
    css: "radial-gradient(ellipse at 40% 30%, oklch(0.75 0.16 300 / 30%) 0%, transparent 62%)",
  },
  {
    id: "soot",
    label: "Soot Paint",
    hint: "Ash pressed into the face",
    css: "linear-gradient(180deg, oklch(0.15 0.02 40 / 45%) 0%, transparent 45%)",
  },
];

export const AURAS: { id: string; label: string; hint: string; ring: string | null }[] = [
  { id: "none", label: "None", hint: "Nothing follows you", ring: null },
  { id: "arcane", label: "Arcane Halo", hint: "Violet corona", ring: "0 0 24px oklch(0.7 0.18 285 / 55%)" },
  { id: "grave", label: "Gravelight", hint: "Cold bone-white", ring: "0 0 24px oklch(0.9 0.03 90 / 45%)" },
  { id: "ember", label: "Emberwake", hint: "Smouldering orange", ring: "0 0 24px oklch(0.68 0.17 45 / 55%)" },
  { id: "blood", label: "Bloodmist", hint: "A red that hums", ring: "0 0 24px oklch(0.5 0.19 20 / 55%)" },
];

// ---- Bloodline presets ----------------------------------------------------
// Curated, ready-made looks per race. Purely a shortcut: every field stays
// editable afterwards.

export type VisagePreset = {
  id: string;
  label: string;
  hint: string;
  patch: Partial<Appearance>;
};

const GENERIC_PRESETS: VisagePreset[] = [
  { id: "gen-porter", label: "Rank-Dross Porter", hint: "Shorn, scarred, forgettable", patch: { complexion: "ashen", build: "wiry", hair: "shorn", eyes: "plain", scar: "cheek", marking: "none", aura: "none" } },
  { id: "gen-veteran", label: "Deep Veteran", hint: "Ladder scars and a dead stare", patch: { complexion: "bronze", build: "broad", hair: "topknot", eyes: "hooded", scar: "ladder", marking: "soot", aura: "none" } },
  { id: "gen-touched", label: "Dungeon-Touched", hint: "Something answered when it shouldn't", patch: { complexion: "umbral", build: "gaunt", hair: "ashveil", eyes: "voidblack", scar: "throat", marking: "veins", aura: "arcane" } },
];

export const RACE_PRESETS: Record<string, VisagePreset[]> = {
  human: [
    { id: "human-porter", label: "Guild Porter", hint: "Under-fed, over-loaded, still standing", patch: { complexion: "ashen", build: "wiry", hair: "shorn", eyes: "plain", scar: "cheek", marking: "none", aura: "none" } },
    { id: "human-swordhand", label: "Hired Swordhand", hint: "Braided, bronzed, paid by the floor", patch: { complexion: "bronze", build: "broad", hair: "braids", eyes: "hooded", scar: "crossed", marking: "none", aura: "none" } },
    { id: "human-revenant", label: "Returned One", hint: "Died once. Came back wrong-eyed", patch: { complexion: "ashen", build: "gaunt", hair: "ashveil", eyes: "milkblind", scar: "throat", marking: "veins", aura: "grave" } },
  ],
  dragonborn: [
    { id: "drg-emberscale", label: "Emberscale", hint: "Forge-hot hide, coal eyes", patch: { complexion: "ember", build: "hulking", hair: "horned", eyes: "emberlit", scar: "burn", marking: "none", aura: "ember" } },
    { id: "drg-ashwyrm", label: "Ash Wyrm", hint: "Cooled scale, old fire", patch: { complexion: "bronze", build: "towering", hair: "horned", eyes: "slit", scar: "ladder", marking: "soot", aura: "none" } },
    { id: "drg-firstborn", label: "Firstborn Heir", hint: "Gold-cast, unbearably proud", patch: { complexion: "ember", build: "broad", hair: "mane", eyes: "slit", scar: "none", marking: "runes", aura: "ember" } },
  ],
  fae: [
    { id: "fae-exile", label: "Court Exile", hint: "Named out of the halls", patch: { complexion: "glacial", build: "willowy", hair: "long", eyes: "arcane", scar: "none", marking: "veins", aura: "arcane" } },
    { id: "fae-thorn", label: "Thornsworn", hint: "Bark-veined, mire-fed", patch: { complexion: "verdant", build: "lithe", hair: "braids", eyes: "wide", scar: "bite", marking: "runes", aura: "none" } },
    { id: "fae-hollow", label: "Hollow Glamour", hint: "Beautiful, and not there", patch: { complexion: "violet", build: "willowy", hair: "ashveil", eyes: "voidblack", scar: "none", marking: "veins", aura: "arcane" } },
  ],
  umbralborn: [
    { id: "umb-shade", label: "Shade-Kept", hint: "Lit from nowhere", patch: { complexion: "umbral", build: "lithe", hair: "shorn", eyes: "voidblack", scar: "none", marking: "runes", aura: "arcane" } },
    { id: "umb-nightcut", label: "Nightcut", hint: "Knife-work in the dark", patch: { complexion: "umbral", build: "wiry", hair: "topknot", eyes: "hooded", scar: "crossed", marking: "soot", aura: "none" } },
    { id: "umb-eclipse", label: "Eclipse-Marked", hint: "Grave-white hair, void eyes", patch: { complexion: "umbral", build: "gaunt", hair: "ashveil", eyes: "voidblack", scar: "throat", marking: "veins", aura: "grave" } },
  ],
  giant: [
    { id: "gia-stonekin", label: "Stonekin", hint: "Quarry-shouldered", patch: { complexion: "ashen", build: "hulking", hair: "braids", eyes: "hooded", scar: "ladder", marking: "scars", aura: "none" } },
    { id: "gia-frostborn", label: "Frostborn", hint: "Blue-veined, slow to anger", patch: { complexion: "glacial", build: "towering", hair: "mane", eyes: "wide", scar: "cheek", marking: "none", aura: "grave" } },
    { id: "gia-breaker", label: "Wall-Breaker", hint: "Burn-mapped and unbothered", patch: { complexion: "bronze", build: "hulking", hair: "shorn", eyes: "emberlit", scar: "burn", marking: "soot", aura: "ember" } },
  ],
  crocman: [
    { id: "croc-mirewader", label: "Mire-Wader", hint: "Green hide, patient jaws", patch: { complexion: "verdant", build: "broad", hair: "shorn", eyes: "slit", scar: "bite", marking: "none", aura: "none" } },
    { id: "croc-bloodfed", label: "Blood-Fed", hint: "Fat on the deep floors", patch: { complexion: "sanguine", build: "hulking", hair: "horned", eyes: "slit", scar: "crossed", marking: "scars", aura: "blood" } },
    { id: "croc-drybank", label: "Dry-Bank Elder", hint: "Sun-scored, scar-laddered", patch: { complexion: "bronze", build: "towering", hair: "shorn", eyes: "hooded", scar: "ladder", marking: "runes", aura: "none" } },
  ],
  beastkin: [
    { id: "bst-maned", label: "Maned Hunter", hint: "All bristle and appetite", patch: { complexion: "bronze", build: "wiry", hair: "mane", eyes: "slit", scar: "bite", marking: "none", aura: "none" } },
    { id: "bst-nightpelt", label: "Nightpelt", hint: "Black-furred, quiet-footed", patch: { complexion: "umbral", build: "lithe", hair: "mane", eyes: "wide", scar: "cheek", marking: "soot", aura: "none" } },
    { id: "bst-scarred", label: "Pit-Scarred", hint: "Won too many fights to count", patch: { complexion: "sanguine", build: "broad", hair: "braids", eyes: "emberlit", scar: "ladder", marking: "scars", aura: "blood" } },
  ],
  dwarf: [
    { id: "dwf-forgehand", label: "Forgehand", hint: "Soot in every crease", patch: { complexion: "bronze", build: "compact", hair: "braids", eyes: "hooded", scar: "burn", marking: "soot", aura: "ember" } },
    { id: "dwf-deepdelver", label: "Deep Delver", hint: "Grave-pale from years under", patch: { complexion: "ashen", build: "compact", hair: "topknot", eyes: "wide", scar: "cheek", marking: "runes", aura: "none" } },
    { id: "dwf-oathbound", label: "Oathbound", hint: "Runes cut, not written", patch: { complexion: "bronze", build: "broad", hair: "braids", eyes: "plain", scar: "crossed", marking: "runes", aura: "grave" } },
  ],
  elf: [
    { id: "elf-archivist", label: "Hall Archivist", hint: "Ink-fingered, cold-eyed", patch: { complexion: "ashen", build: "willowy", hair: "long", eyes: "arcane", scar: "none", marking: "runes", aura: "arcane" } },
    { id: "elf-bladesinger", label: "Bladesinger", hint: "Braided for war, not court", patch: { complexion: "glacial", build: "lithe", hair: "braids", eyes: "hooded", scar: "cheek", marking: "none", aura: "none" } },
    { id: "elf-fallen", label: "Fallen Sentinel", hint: "Left the light on purpose", patch: { complexion: "violet", build: "willowy", hair: "ashveil", eyes: "voidblack", scar: "throat", marking: "veins", aura: "arcane" } },
  ],
};

export function presetsForRace(raceId?: string | null): VisagePreset[] {
  if (!raceId) return GENERIC_PRESETS;
  return RACE_PRESETS[raceId] ?? GENERIC_PRESETS;
}

export function defaultAppearance(): Appearance {
  return {
    complexion: "ashen",
    build: "wiry",
    hair: "shorn",
    eyes: "plain",
    scar: "none",
    marking: "none",
    aura: "none",
    note: "",
  };
}

export function normalizeAppearance(a?: Partial<Appearance> | null): Appearance {
  const d = defaultAppearance();
  if (!a) return d;
  return {
    complexion: COMPLEXIONS.some((c) => c.id === a.complexion) ? a.complexion! : d.complexion,
    build: BUILDS.some((b) => b.id === a.build) ? a.build! : d.build,
    hair: HAIRSTYLES.some((h) => h.id === a.hair) ? a.hair! : d.hair,
    eyes: EYES.some((e) => e.id === a.eyes) ? a.eyes! : d.eyes,
    scar: SCARS.some((s) => s.id === a.scar) ? a.scar! : d.scar,
    marking: MARKINGS.some((m) => m.id === a.marking) ? a.marking! : d.marking,
    aura: AURAS.some((x) => x.id === a.aura) ? a.aura! : d.aura,
    note: typeof a.note === "string" ? a.note.slice(0, 240) : d.note,
  };
}

export function portraitFilter(a?: Appearance | null): string | undefined {
  if (!a) return undefined;
  return COMPLEXIONS.find((c) => c.id === a.complexion)?.filter;
}

export function markingLayer(a?: Appearance | null): string | null {
  if (!a) return null;
  return MARKINGS.find((m) => m.id === a.marking)?.css ?? null;
}

/** All cosmetic overlay layers, painted back-to-front over the portrait. */
export function overlayLayers(a?: Appearance | null): string[] {
  if (!a) return [];
  return [
    HAIRSTYLES.find((h) => h.id === a.hair)?.css ?? null,
    EYES.find((e) => e.id === a.eyes)?.css ?? null,
    SCARS.find((s) => s.id === a.scar)?.css ?? null,
    MARKINGS.find((m) => m.id === a.marking)?.css ?? null,
  ].filter((x): x is string => !!x);
}

export function auraShadow(a?: Appearance | null): string | null {
  if (!a) return null;
  return AURAS.find((x) => x.id === a.aura)?.ring ?? null;
}

export function appearanceSummary(a?: Appearance | null): string {
  if (!a) return "—";
  const parts = [
    BUILDS.find((b) => b.id === a.build)?.label,
    COMPLEXIONS.find((c) => c.id === a.complexion)?.label,
  ].filter(Boolean) as string[];
  const hair = HAIRSTYLES.find((h) => h.id === a.hair);
  if (hair) parts.push(`${hair.label} hair`);
  const eyes = EYES.find((e) => e.id === a.eyes);
  if (eyes && eyes.id !== "plain") parts.push(`${eyes.label} eyes`);
  const scar = SCARS.find((s) => s.id === a.scar);
  if (scar && scar.id !== "none") parts.push(scar.label);
  const mark = MARKINGS.find((m) => m.id === a.marking);
  if (mark && mark.id !== "none") parts.push(mark.label);
  const aura = AURAS.find((x) => x.id === a.aura);
  if (aura && aura.id !== "none") parts.push(aura.label);
  return parts.join(" · ");
}
