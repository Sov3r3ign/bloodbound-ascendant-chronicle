import type { BiomeId } from "./dungeon-engine";

export type Saga = {
  flags: Record<string, boolean>;
  rep: Record<BiomeId, number>;
  blessings: { id: string; name: string; desc: string }[];
  curses: { id: string; name: string; desc: string }[];
};

export type SagaDelta = {
  setFlags?: string[];
  rep?: Partial<Record<BiomeId, number>>;
  addBlessing?: { id: string; name: string; desc: string };
  addCurse?: { id: string; name: string; desc: string };
};

export function emptySaga(): Saga {
  return {
    flags: {},
    rep: { catacombs: 0, foundry: 0, veiled: 0, mire: 0 },
    blessings: [],
    curses: [],
  };
}

export function applySagaDelta(s: Saga, d: SagaDelta | undefined): Saga {
  if (!d) return s;
  const next: Saga = {
    flags: { ...s.flags },
    rep: { ...s.rep },
    blessings: s.blessings.slice(),
    curses: s.curses.slice(),
  };
  if (d.setFlags) for (const f of d.setFlags) next.flags[f] = true;
  if (d.rep) {
    for (const k of Object.keys(d.rep) as BiomeId[]) {
      next.rep[k] = (next.rep[k] ?? 0) + (d.rep[k] ?? 0);
    }
  }
  if (d.addBlessing && !next.blessings.some((b) => b.id === d.addBlessing!.id)) {
    next.blessings.push(d.addBlessing);
  }
  if (d.addCurse && !next.curses.some((c) => c.id === d.addCurse!.id)) {
    next.curses.push(d.addCurse);
  }
  return next;
}
