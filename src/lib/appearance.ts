// Cosmetic appearance customization for an Ascendant's bloodline vessel.
// Purely visual: tints, markings and aura applied over the race portrait.

export type Appearance = {
  /** Complexion / hide tone option id. */
  complexion: string;
  /** Body silhouette descriptor id. */
  build: string;
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

export function defaultAppearance(): Appearance {
  return { complexion: "ashen", build: "wiry", marking: "none", aura: "none", note: "" };
}

export function normalizeAppearance(a?: Partial<Appearance> | null): Appearance {
  const d = defaultAppearance();
  if (!a) return d;
  return {
    complexion: COMPLEXIONS.some((c) => c.id === a.complexion) ? a.complexion! : d.complexion,
    build: BUILDS.some((b) => b.id === a.build) ? a.build! : d.build,
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

export function auraShadow(a?: Appearance | null): string | null {
  if (!a) return null;
  return AURAS.find((x) => x.id === a.aura)?.ring ?? null;
}

export function appearanceSummary(a?: Appearance | null): string {
  if (!a) return "—";
  const parts = [
    BUILDS.find((b) => b.id === a.build)?.label,
    COMPLEXIONS.find((c) => c.id === a.complexion)?.label,
  ].filter(Boolean);
  const mark = MARKINGS.find((m) => m.id === a.marking);
  if (mark && mark.id !== "none") parts.push(mark.label);
  const aura = AURAS.find((x) => x.id === a.aura);
  if (aura && aura.id !== "none") parts.push(aura.label);
  return parts.join(" · ");
}
