import { useRef, useState, type MouseEvent } from "react";
import {
  User,
  Mars,
  Venus,
  Eye,
  EyeOff,
  type LucideIcon,
} from "lucide-react";
import { RACE_IMAGES } from "@/lib/race-images";
import {
  auraShadow,
  overlayLayers,
  portraitFilter,
  type Appearance,
} from "@/lib/appearance";


export type Gender = "male" | "female";

const GENDER_ICONS: Record<Gender, LucideIcon> = {
  male: Mars,
  female: Venus,
};

const GENDER_TONE: Record<Gender, string> = {
  male: "text-arcane border-arcane/50",
  female: "text-blood border-blood/50",
};

export function RacePortrait({
  raceId,
  gender,
  size = 96,
  active = false,
  appearance,
}: {
  raceId: string | null;
  gender: Gender;
  size?: number;
  tone?: "arcane" | "blood" | "ember" | "bone";
  active?: boolean;
  appearance?: Appearance | null;
}) {
  const img = raceId ? RACE_IMAGES[raceId] : undefined;
  const GIcon = GENDER_ICONS[gender];
  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full border bg-gradient-to-b from-card to-background/40 ${
        active ? "border-arcane shadow-arcane animate-flicker" : "border-border/70"
      }`}
      style={{
        width: size,
        height: size,
        boxShadow: auraShadow(appearance) ?? undefined,
      }}
    >
      {img ? (
        <img
          src={img}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
          style={{
            objectPosition: "center 20%",
            filter: portraitFilter(appearance),
          }}
        />
      ) : (
        <User className="text-arcane" size={Math.round(size * 0.5)} strokeWidth={1.4} />
      )}
      {markingLayer(appearance) && (
        <span
          className="pointer-events-none absolute inset-0"
          style={{ background: markingLayer(appearance)! }}
        />
      )}
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

/**
 * Large full-bleed race preview with hover-parallax and a togglable
 * gender-sigil overlay. Use in the forge / character sheet for a hero card.
 */
export function RacePreview({
  raceId,
  gender,
  height = 360,
  className = "",
  label,
  appearance,
}: {
  raceId: string | null;
  gender: Gender;
  height?: number;
  className?: string;
  label?: string;
  appearance?: Appearance | null;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, sx: 1 });
  const [showSigil, setShowSigil] = useState(true);

  const img = raceId ? RACE_IMAGES[raceId] : undefined;
  const GIcon = GENDER_ICONS[gender];
  const tone = GENDER_TONE[gender];

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: px, y: py, sx: 1.08 });
  };
  const onLeave = () => setTilt({ x: 0, y: 0, sx: 1 });

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`relative w-full overflow-hidden rounded-lg border border-border/70 rune-border shadow-deep ${className}`}
      style={{ height, perspective: 900, boxShadow: auraShadow(appearance) ?? undefined }}
    >
      {img ? (
        <img
          src={img}
          alt={label ?? ""}
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          style={{
            transform: `scale(${tilt.sx}) translate3d(${tilt.x * -18}px, ${tilt.y * -14}px, 0) rotateX(${tilt.y * -4}deg) rotateY(${tilt.x * 6}deg)`,
            transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
            objectPosition: "center 18%",
            filter: portraitFilter(appearance),
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <User className="text-arcane/60" size={Math.round(height * 0.35)} strokeWidth={1.2} />
        </div>
      )}

      {/* atmospheric wash + vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 10%, transparent 40%, oklch(0.08 0.02 285 / 55%) 85%), linear-gradient(180deg, transparent 55%, oklch(0.08 0.02 285 / 85%) 100%)",
        }}
      />

      {markingLayer(appearance) && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: markingLayer(appearance)! }}
        />
      )}

      {/* gender sigil overlay (toggleable) */}
      {showSigil && (
        <span
          className={`pointer-events-none absolute right-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-full border bg-background/60 backdrop-blur-sm animate-float-up ${tone}`}
        >
          <GIcon size={22} strokeWidth={2} />
        </span>
      )}

      {/* label */}
      {label && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
          <div className="font-display text-lg tracking-widest text-bone text-glow">
            {label}
          </div>
        </div>
      )}

      {/* toggle */}
      <button
        type="button"
        onClick={() => setShowSigil((v) => !v)}
        aria-label={showSigil ? "Hide gender sigil" : "Show gender sigil"}
        className="absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/60 text-muted-foreground backdrop-blur-sm transition hover:text-bone hover:border-arcane/60"
      >
        {showSigil ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}
