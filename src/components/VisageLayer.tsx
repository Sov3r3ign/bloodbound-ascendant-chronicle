import type { Appearance } from "@/lib/appearance";

/**
 * Draws the player's chosen visage as actual features (hair, horns, eyes,
 * scars, ritual marks, shoulders) over the bloodline portrait — instead of
 * flat gradient washes. Everything is drawn in a 0 0 100 100 space with the
 * face centred around (50, 34).
 */

const HAIR = "oklch(0.16 0.03 45)";
const HAIR_LIGHT = "oklch(0.93 0.01 90)";
const BONE = "oklch(0.88 0.04 85)";
const SCAR = "oklch(0.62 0.13 20)";

function Hair({ id }: { id: string }) {
  switch (id) {
    case "long":
      return (
        <g>
          <path d="M28 32 C28 14, 72 14, 72 32 L72 24 C72 12, 28 12, 28 24 Z" fill={HAIR} />
          <path d="M29 24 C22 34, 22 56, 26 72 L34 70 C30 54, 31 36, 34 26 Z" fill={HAIR} opacity="0.92" />
          <path d="M71 24 C78 34, 78 56, 74 72 L66 70 C70 54, 69 36, 66 26 Z" fill={HAIR} opacity="0.92" />
        </g>
      );
    case "ashveil":
      return (
        <g>
          <path d="M28 32 C28 14, 72 14, 72 32 L72 24 C72 12, 28 12, 28 24 Z" fill={HAIR_LIGHT} opacity="0.85" />
          <path d="M29 24 C22 34, 22 54, 26 70 L34 68 C30 52, 31 36, 34 26 Z" fill={HAIR_LIGHT} opacity="0.7" />
          <path d="M71 24 C78 34, 78 54, 74 70 L66 68 C70 52, 69 36, 66 26 Z" fill={HAIR_LIGHT} opacity="0.7" />
        </g>
      );
    case "braids":
      return (
        <g>
          <path d="M28 30 C28 13, 72 13, 72 30 L72 23 C72 11, 28 11, 28 23 Z" fill={HAIR} />
          {[32, 68].map((x, i) => (
            <g key={i}>
              {[30, 38, 46, 54, 62].map((y, j) => (
                <ellipse key={j} cx={x + (j % 2 ? 1.2 : -1.2)} cy={y} rx="3.4" ry="4.2" fill={HAIR} opacity="0.95" />
              ))}
              <circle cx={x} cy="66" r="2" fill={BONE} opacity="0.8" />
            </g>
          ))}
        </g>
      );
    case "topknot":
      return (
        <g>
          <path d="M34 26 C36 16, 64 16, 66 26 L66 22 C64 14, 36 14, 34 22 Z" fill={HAIR} />
          <ellipse cx="50" cy="13" rx="7" ry="5.5" fill={HAIR} />
          <path d="M50 10 C57 4, 62 6, 60 11" stroke={HAIR} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
    case "horned":
      return (
        <g fill="none" stroke={BONE} strokeWidth="4.2" strokeLinecap="round">
          <path d="M34 20 C26 14, 22 6, 27 2" opacity="0.9" />
          <path d="M66 20 C74 14, 78 6, 73 2" opacity="0.9" />
        </g>
      );
    case "mane":
      return (
        <g fill={HAIR}>
          {Array.from({ length: 13 }).map((_, i) => {
            const a = Math.PI * (1.08 + (i / 12) * 0.84);
            const cx = 50 + Math.cos(a) * 22;
            const cy = 34 + Math.sin(a) * 26;
            return (
              <path
                key={i}
                d={`M${cx} ${cy} l${Math.cos(a) * 9} ${Math.sin(a) * 9} l3 3 z`}
                opacity="0.85"
                transform={`rotate(${(i - 6) * 4} ${cx} ${cy})`}
              />
            );
          })}
          <path d="M30 30 C30 15, 70 15, 70 30 L70 24 C70 13, 30 13, 30 24 Z" opacity="0.9" />
        </g>
      );
    case "shorn":
    default:
      return <path d="M31 28 C33 17, 67 17, 69 28" stroke={HAIR} strokeWidth="2.5" fill="none" opacity="0.45" />;
  }
}

function Eyes({ id }: { id: string }) {
  const spread = id === "wide" ? 10.5 : 8;
  const left = 50 - spread;
  const right = 50 + spread;
  const y = 34;

  const iris: Record<string, string> = {
    plain: "oklch(0.28 0.03 60)",
    hooded: "oklch(0.26 0.03 60)",
    wide: "oklch(0.32 0.04 70)",
    slit: "oklch(0.78 0.18 90)",
    emberlit: "oklch(0.72 0.19 45)",
    voidblack: "oklch(0.06 0 0)",
    milkblind: "oklch(0.95 0.01 90)",
    arcane: "oklch(0.72 0.2 300)",
  };
  const color = iris[id] ?? iris.plain;
  const glow = id === "emberlit" || id === "arcane" || id === "slit";

  const Eye = ({ cx, blind }: { cx: number; blind?: boolean }) => (
    <g>
      <path
        d={`M${cx - 5.4} ${y} q5.4 -4.6 10.8 0 q-5.4 4.6 -10.8 0 z`}
        fill={blind ? "oklch(0.95 0.01 90)" : "oklch(0.92 0.01 90)"}
        opacity="0.92"
      />
      {!blind && (
        <>
          <circle cx={cx} cy={y} r="2.5" fill={color} opacity={id === "voidblack" ? 0.95 : 0.9} />
          {id === "slit" ? (
            <ellipse cx={cx} cy={y} rx="0.7" ry="2.2" fill="oklch(0.06 0 0)" />
          ) : (
            <circle cx={cx} cy={y} r="1.1" fill="oklch(0.06 0 0)" opacity="0.85" />
          )}
        </>
      )}
      {glow && <circle cx={cx} cy={y} r="5.2" fill={color} opacity="0.28" />}
      {id === "hooded" && (
        <path d={`M${cx - 6} ${y - 1.6} q6 -3.4 12 0`} stroke="oklch(0.14 0.02 285)" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.75" />
      )}
      <path d={`M${cx - 5.6} ${y - 4.6} q5.6 -2.4 11.2 0`} stroke="oklch(0.12 0.02 40)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
    </g>
  );

  return (
    <g>
      <Eye cx={left} blind={id === "milkblind"} />
      <Eye cx={right} />
    </g>
  );
}

function Scar({ id }: { id: string }) {
  const s = { stroke: SCAR, strokeWidth: 1.5, fill: "none", strokeLinecap: "round" as const, opacity: 0.85 };
  switch (id) {
    case "cheek":
      return (
        <g {...s}>
          <path d="M60 26 L66 46" />
          {[30, 34, 38, 42].map((y, i) => (
            <path key={i} d={`M${60.5 + (y - 30) * 0.3 - 2} ${y} l4 -1.6`} strokeWidth="1" />
          ))}
        </g>
      );
    case "crossed":
      return (
        <g {...s}>
          <path d="M38 24 L60 46" />
          <path d="M60 24 L38 46" />
        </g>
      );
    case "burn":
      return (
        <g>
          <path d="M62 28 q10 6 8 18 q-8 4 -12 -4 q-2 -10 4 -14 z" fill="oklch(0.55 0.13 40)" opacity="0.4" />
          <path d="M64 32 q6 4 4 12" stroke="oklch(0.62 0.14 40)" strokeWidth="1" fill="none" opacity="0.7" />
        </g>
      );
    case "bite":
      return (
        <g>
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <circle key={i} cx={58 + Math.cos(a) * 12} cy={40 + Math.sin(a) * 12} r="1.3" fill={SCAR} opacity="0.75" />;
          })}
        </g>
      );
    case "ladder":
      return (
        <g {...s}>
          <path d="M36 26 L36 50" strokeWidth="1" opacity="0.5" />
          {[28, 33, 38, 43, 48].map((y) => (
            <path key={y} d={`M31 ${y} L41 ${y}`} />
          ))}
        </g>
      );
    case "throat":
      return <path d="M36 60 q14 6 28 0" stroke={SCAR} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.9" />;
    default:
      return null;
  }
}

function Marking({ id }: { id: string }) {
  switch (id) {
    case "runes":
      return (
        <g stroke="oklch(0.74 0.18 290)" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.9">
          <path d="M46 20 L50 15 L54 20 M50 15 L50 23" />
          <path d="M36 40 L36 48 M33 44 L39 44" />
          <path d="M64 40 L64 48 M61 48 L67 44" />
        </g>
      );
    case "scars":
      return (
        <g stroke={SCAR} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.8">
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M40 ${44 + i * 5} l10 4 l10 -4`} />
          ))}
        </g>
      );
    case "veins":
      return (
        <g stroke="oklch(0.78 0.17 300)" strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.8">
          <path d="M50 12 L50 22 M50 16 L44 21 M50 18 L57 24" />
          <path d="M34 34 L28 40 M34 34 L30 30" />
          <path d="M66 34 L72 40 M66 34 L70 30" />
        </g>
      );
    case "soot":
      return (
        <g>
          <rect x="28" y="28" width="44" height="11" rx="3" fill="oklch(0.12 0.02 40)" opacity="0.55" />
          <path d="M50 40 L50 52" stroke="oklch(0.12 0.02 40)" strokeWidth="4" opacity="0.4" strokeLinecap="round" />
        </g>
      );
    default:
      return null;
  }
}

const SHOULDER_WIDTH: Record<string, number> = {
  lithe: 26,
  willowy: 27,
  wiry: 29,
  gaunt: 25,
  compact: 33,
  broad: 36,
  towering: 34,
  hulking: 40,
};

function Shoulders({ id }: { id: string }) {
  const w = SHOULDER_WIDTH[id] ?? 30;
  return (
    <path
      d={`M${50 - w} 100 q${w * 0.25} -22 ${w} -26 q${w * 0.75} 4 ${w} 26 z`}
      fill="oklch(0.10 0.02 285)"
      opacity="0.42"
    />
  );
}

export function VisageLayer({
  appearance,
  className = "",
}: {
  appearance?: Appearance | null;
  className?: string;
}) {
  if (!appearance) return null;
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <Shoulders id={appearance.build} />
      <Hair id={appearance.hair} />
      <Eyes id={appearance.eyes} />
      <Marking id={appearance.marking} />
      <Scar id={appearance.scar} />
    </svg>
  );
}
