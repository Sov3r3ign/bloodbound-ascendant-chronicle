export type Race = {
  id: string;
  name: string;
  sigil: string;
  tagline: string;
  traits: string[];
  lore: string;
};

export type Aspect = {
  id: string;
  name: string;
  sigil: string;
  tagline: string;
  passive: string;
  active: string;
  ultimate: string;
  color: "arcane" | "blood" | "ember" | "bone";
};

export type Resonance = {
  id: string;
  name: string;
  benefit: string;
  cost: string;
  attention: number; // 1-3
};

export const RACES: Race[] = [
  {
    id: "human",
    name: "Human",
    sigil: "✦",
    tagline: "Adaptable. Ambitious. Unbroken.",
    traits: ["Adaptive Heritage", "Versatile Skill", "Resilient Will"],
    lore: "The youngest bloodline, but the fastest to ascend. What they lack in inheritance, they reclaim with hunger.",
  },
  {
    id: "dragonborn",
    name: "Dragonborn",
    sigil: "𖣘",
    tagline: "Scales of the first flame.",
    traits: ["Elemental Authority", "Minor Elemental Resistance", "Strong Presence"],
    lore: "Heirs of slain wyrms. The first roar still echoes in their throats.",
  },
  {
    id: "fae",
    name: "Fae-Blooded",
    sigil: "❋",
    tagline: "Half here. Half elsewhere.",
    traits: ["Heightened Magical Affinity", "Enhanced Perception", "Fast Reflexes"],
    lore: "Their blood remembers the Verdant Court. Iron stings. Mirrors lie.",
  },
  {
    id: "umbralborn",
    name: "Umbralborn",
    sigil: "☾",
    tagline: "Children of the unlit hour.",
    traits: ["Shadow Affinity", "Enhanced Stealth", "Darkvision"],
    lore: "Born during eclipses, raised between candles. The dark is not their enemy.",
  },
  {
    id: "giant",
    name: "Giant",
    sigil: "⌬",
    tagline: "Mountains learned to walk.",
    traits: ["Titanic Frame", "Crushing Strength", "Stoic Endurance"],
    lore: "The last of the old gods' siblings. Slow to anger. Slower to fall.",
  },
  {
    id: "crocman",
    name: "Crocman",
    sigil: "▼",
    tagline: "Swamp-kin. Patient hunter.",
    traits: ["Armored Hide", "Death Roll", "Amphibious"],
    lore: "Risen from the black marshes. Their grin is rarely a smile.",
  },
  {
    id: "beastkin",
    name: "Beastkin",
    sigil: "✶",
    tagline: "Two souls. One hunt.",
    traits: ["Feral Senses", "Predator Reflex", "Pack Instinct"],
    lore: "When the moon is right, the inner beast leads.",
  },
  {
    id: "dwarf",
    name: "Dwarf",
    sigil: "⬢",
    tagline: "Forged in deep places.",
    traits: ["Stone Lineage", "Master Smith", "Toxin Ward"],
    lore: "They remember every grudge — and every vein of ore.",
  },
  {
    id: "elf",
    name: "Elf",
    sigil: "❈",
    tagline: "Long memory. Longer aim.",
    traits: ["Arcane Memory", "Keen Sight", "Graceful Step"],
    lore: "Centuries pass; they merely blink.",
  },
];

export const ASPECTS: Aspect[] = [
  {
    id: "ruin",
    name: "Aspect of Ruin",
    sigil: "✷",
    tagline: "Destruction. Overwhelming force.",
    passive: "Devastator — every kill increases damage of the next attack.",
    active: "Cataclysm Strike — heavy AoE that shatters armor.",
    ultimate: "World-Ender — channel a localized apocalypse.",
    color: "blood",
  },
  {
    id: "veils",
    name: "Aspect of Veils",
    sigil: "☽",
    tagline: "Stealth. Speed. Deception.",
    passive: "Unseen Step — first attack from stealth is always a Great Success.",
    active: "Cut the Thread — silent execute on low-HP foes.",
    ultimate: "Hundred Knives — strike every enemy you have marked tonight.",
    color: "arcane",
  },
  {
    id: "echoes",
    name: "Aspect of Echoes",
    sigil: "✺",
    tagline: "Magic. Memory. Ancient knowledge.",
    passive: "Remembered Spell — repeat your last cast at half Focus.",
    active: "Mind of the Archive — read a foe's weakness.",
    ultimate: "Speak the True Name — strip an enemy of one ability forever.",
    color: "arcane",
  },
  {
    id: "oaths",
    name: "Aspect of Oaths",
    sigil: "✜",
    tagline: "Protection. Sacrifice. Defense.",
    passive: "Oathbond — share damage with sworn ally.",
    active: "Tower Vow — immovable for one round.",
    ultimate: "Last Stand — refuse death if an oath remains unbroken.",
    color: "bone",
  },
  {
    id: "dominion",
    name: "Aspect of Dominion",
    sigil: "✦",
    tagline: "Authority. Leadership. Battlefield control.",
    passive: "Crown's Voice — allies gain +2 to rolls within 6m.",
    active: "Command: Strike — order an ally's free attack.",
    ultimate: "Throne of War — claim the battlefield; all allies refresh abilities.",
    color: "ember",
  },
  {
    id: "chains",
    name: "Aspect of Chains",
    sigil: "⛓",
    tagline: "Binding. Crowd control.",
    passive: "Tether — marked enemies cannot flee.",
    active: "Soul Manacle — root and silence.",
    ultimate: "Prison of Names — bind all enemies in a 10m sphere.",
    color: "arcane",
  },
  {
    id: "embers",
    name: "Aspect of Embers",
    sigil: "✸",
    tagline: "Persistence. Survival. Rebirth.",
    passive: "Banked Coals — heal slowly while out of combat.",
    active: "Phoenix Flare — burst heal, ignite enemies.",
    ultimate: "Re-Ignition — return to life once per dungeon.",
    color: "ember",
  },
  {
    id: "primordial",
    name: "Aspect of the Primordial",
    sigil: "⟁",
    tagline: "Mutation. Instinct. Monstrous power.",
    passive: "Atavism — bonuses scale with missing HP.",
    active: "Carnal Shape — temporarily transform.",
    ultimate: "Apex Form — become the dungeon's apex predator.",
    color: "blood",
  },
  {
    id: "boundstar",
    name: "Aspect of the Bound Star",
    sigil: "✪",
    tagline: "Fate. Coincidence. Impossible timing.",
    passive: "Threadwalker — reroll one failed check per scene.",
    active: "Wager of Stars — gamble a stat for a boon.",
    ultimate: "Inevitable Hour — declare an outcome before rolling.",
    color: "ember",
  },
  {
    id: "fury",
    name: "Aspect of Fury",
    sigil: "✖",
    tagline: "Rage-fueled precision. Berserker assassin.",
    passive: "Red Focus — Critical Success threshold lowered while bleeding.",
    active: "Hemorrhage — every hit stacks bleed.",
    ultimate: "Crimson Trance — every action is a critical for one round.",
    color: "blood",
  },
];

export const RESONANCES: Resonance[] = [
  { id: "wounded", name: "Blood Awakens When Wounded", benefit: "+3 damage below half HP", cost: "Bleed triggers more often", attention: 2 },
  { id: "whispers", name: "Dungeon Whispers Secrets", benefit: "Reveal one hidden room per floor", cost: "Resolve checks at Disadvantage near Boss Rooms", attention: 3 },
  { id: "delay", name: "Death Delays Its Claim", benefit: "Once per dungeon, refuse a killing blow", cost: "Permanent scar; -1 Vigor max after use", attention: 3 },
  { id: "scars", name: "Scars Grant Strength", benefit: "+1 Vigor each time you fall and rise", cost: "Healing magic is half-effective", attention: 2 },
  { id: "warps", name: "Presence Warps Weak Magic", benefit: "Adjacent enemies' spells fizzle on 1-5", cost: "Allies' minor spells also fizzle", attention: 2 },
  { id: "corruption", name: "Smells Corruption Before It Appears", benefit: "Foresee ambushes one round early", cost: "Cannot rest near corruption", attention: 1 },
  { id: "remembers", name: "Remembers Things Never Lived", benefit: "Speak any dead language", cost: "Random vision events drain Focus", attention: 1 },
  { id: "unsettles", name: "Presence Unsettles Crowds", benefit: "+2 Intimidate in social scenes", cost: "Merchants charge more; NPCs flee", attention: 1 },
];

export const TIERS = [
  { id: 1, name: "Stirring Blood", desc: "The first pulse. Faint awareness of the bond." },
  { id: 2, name: "Awakened Blood", desc: "The bloodline answers. Latent traits surface." },
  { id: 3, name: "Ascendant Blood", desc: "Power becomes will. Rivals take notice." },
  { id: 4, name: "Sovereign Blood", desc: "You bend the dungeon's attention." },
  { id: 5, name: "Mythic Blood", desc: "Legends begin to mention your name." },
  { id: 6, name: "Transcendent Blood", desc: "You are no longer entirely mortal." },
];

export const VITAL_TOTAL = 18;
export const VITAL_MIN = 3;
export const VITAL_MAX = 10;
