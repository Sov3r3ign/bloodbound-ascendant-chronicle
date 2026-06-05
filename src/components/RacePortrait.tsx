import {
  User,
  Flame,
  Sparkles,
  Moon,
  Mountain,
  Skull,
  PawPrint,
  Hammer,
  Leaf,
  Mars,
  Venus,
  Asterisk,
  type LucideIcon,
} from "lucide-react";

export type Gender = "male" | "female" | "other";

const RACE_ICONS: Record<string, LucideIcon> = {
  human: User,
  dragonborn: Flame,
  fae: Sparkles,
  umbralborn: Moon,
  giant: Mountain,
  crocman: Skull,
  beastkin: PawPrint,
  dwarf: Hammer,
  elf: Leaf,
};

const GENDER_ICONS: Record<Gender, LucideIcon> = {
  male: Mars,
  female: Venus,
  other: Asterisk,
};

const GENDER_TONE: Record<Gender, string> = {
  male: "text-arcane border-arcane/50",
  female: "text-blood border-blood/50",
  other: "text-ember border-ember/50",
};

export function RacePortrait({
  raceId,
  gender,
  size = 96,
  tone = "arcane",
  active = false,
}: {
  raceId: string | null;
  gender: Gender;
  size?: number;
  tone?: "arcane" | "blood" | "ember" | "bone";
  active?: boolean;
}) {
  const Icon = (raceId && RACE_ICONS[raceId]) || User;
  const GIcon = GENDER_ICONS[gender];
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full border bg-gradient-to-b from-card to-background/40 ${
        active ? "border-arcane shadow-arcane animate-flicker" : "border-border/70"
      }`}
      style={{ width: size, height: size }}
    >
      <Icon className={`text-${tone}`} size={Math.round(size * 0.5)} strokeWidth={1.4} />
      <span
        className={`absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border bg-background ${GENDER_TONE[gender]}`}
        title={gender}
      >
        <GIcon size={12} strokeWidth={2} />
      </span>
    </div>
  );
}

export function GenderIcon({ gender, size = 14 }: { gender: Gender; size?: number }) {
  const G = GENDER_ICONS[gender];
  return <G size={size} className={GENDER_TONE[gender].split(" ")[0]} />;
}
