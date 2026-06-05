import { ASPECTS, RACES } from "./game-data";

export type Gender = "male" | "female" | "other";

export type StoredCharacter = {
  name: string;
  gender: Gender;
  raceId: string;
  aspectId: string;
  resonanceIds: string[];
  vitals: { vigor: number; focus: number; resolve: number };
};

const KEY = "bloodbound.character";

export function saveCharacter(c: StoredCharacter) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {}
}

export function loadCharacter(): StoredCharacter {
  if (typeof window === "undefined") return defaultCharacter();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultCharacter();
    const parsed = JSON.parse(raw) as StoredCharacter;
    if (!parsed?.name || !parsed.raceId || !parsed.aspectId) return defaultCharacter();
    if (!parsed.gender) parsed.gender = "other";
    return parsed;
  } catch {
    return defaultCharacter();
  }
}

export function defaultCharacter(): StoredCharacter {
  return {
    name: "Wanderer of the Hollow Crown",
    gender: "other",
    raceId: RACES[0].id,
    aspectId: ASPECTS[0].id,
    resonanceIds: ["wounded"],
    vitals: { vigor: 6, focus: 6, resolve: 6 },
  };
}
