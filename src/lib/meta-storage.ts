// Persistent meta-progression for The Bloodbound Ascendants

import { ASPECTS, RACES } from "./game-data";

export type RunStats = {
  floor: number;
  kills: number;
  bossKills: number;
  gold: number;
  shards: number;
  turns: number;
  tier: number;
  cause: string;
};

export type MetaState = {
  totalShards: number;
  totalRuns: number;
  totalKills: number;
  deepestFloor: number;
  highestTier: number;
  unlockedRaces: string[];
  unlockedAspects: string[];
  lastRun: RunStats | null;
};

const KEY = "bloodbound.meta";
const DEFAULT_RACES = ["human", "fae", "umbralborn", "elf"];
const DEFAULT_ASPECTS = ["ruin", "veils", "echoes", "oaths"];

// shards required to unlock the next race/aspect
const RACE_UNLOCK_COSTS = [4, 7, 10, 14, 18];
const ASPECT_UNLOCK_COSTS = [5, 9, 13, 18, 24, 30];

export function defaultMeta(): MetaState {
  return {
    totalShards: 0,
    totalRuns: 0,
    totalKills: 0,
    deepestFloor: 0,
    highestTier: 1,
    unlockedRaces: [...DEFAULT_RACES],
    unlockedAspects: [...DEFAULT_ASPECTS],
    lastRun: null,
  };
}

export function loadMeta(): MetaState {
  if (typeof window === "undefined") return defaultMeta();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultMeta();
    const parsed = JSON.parse(raw) as MetaState;
    return { ...defaultMeta(), ...parsed };
  } catch {
    return defaultMeta();
  }
}

export function saveMeta(m: MetaState) {
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch {}
}

export function recordRun(stats: RunStats): MetaState {
  const m = loadMeta();
  m.totalRuns += 1;
  m.totalKills += stats.kills;
  m.totalShards += stats.shards;
  m.deepestFloor = Math.max(m.deepestFloor, stats.floor);
  m.highestTier = Math.max(m.highestTier, stats.tier);
  m.lastRun = stats;
  saveMeta(m);
  return m;
}

export function isRaceUnlocked(id: string): boolean {
  return loadMeta().unlockedRaces.includes(id);
}
export function isAspectUnlocked(id: string): boolean {
  return loadMeta().unlockedAspects.includes(id);
}

export function nextUnlock(m: MetaState):
  | { kind: "race" | "aspect"; id: string; name: string; cost: number }
  | null {
  const lockedRace = RACES.find((r) => !m.unlockedRaces.includes(r.id));
  const lockedAspect = ASPECTS.find((a) => !m.unlockedAspects.includes(a.id));
  const raceCost = lockedRace
    ? RACE_UNLOCK_COSTS[Math.min(RACE_UNLOCK_COSTS.length - 1, m.unlockedRaces.length - DEFAULT_RACES.length)]
    : Infinity;
  const aspectCost = lockedAspect
    ? ASPECT_UNLOCK_COSTS[Math.min(ASPECT_UNLOCK_COSTS.length - 1, m.unlockedAspects.length - DEFAULT_ASPECTS.length)]
    : Infinity;
  if (!lockedRace && !lockedAspect) return null;
  if (raceCost <= aspectCost && lockedRace) {
    return { kind: "race", id: lockedRace.id, name: lockedRace.name, cost: raceCost };
  }
  if (lockedAspect) {
    return { kind: "aspect", id: lockedAspect.id, name: lockedAspect.name, cost: aspectCost };
  }
  return null;
}

export function purchaseUnlock(): { meta: MetaState; unlocked: { kind: string; name: string } | null } {
  const m = loadMeta();
  const u = nextUnlock(m);
  if (!u || m.totalShards < u.cost) return { meta: m, unlocked: null };
  m.totalShards -= u.cost;
  if (u.kind === "race") m.unlockedRaces.push(u.id);
  else m.unlockedAspects.push(u.id);
  saveMeta(m);
  return { meta: m, unlocked: { kind: u.kind, name: u.name } };
}
