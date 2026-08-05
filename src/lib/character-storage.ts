import { ASPECTS, RACES } from "./game-data";
import { defaultAppearance, normalizeAppearance, type Appearance } from "./appearance";

export type Gender = "male" | "female";

export type StoredCharacter = {
  name: string;
  gender: Gender;
  raceId: string;
  aspectId: string;
  resonanceIds: string[];
  appearance?: Appearance;
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
    if (!parsed.gender) parsed.gender = "male";
    parsed.appearance = normalizeAppearance(parsed.appearance);
    return parsed;
  } catch {
    return defaultCharacter();
  }
}

export function defaultCharacter(): StoredCharacter {
  return {
    name: "Wanderer of the Hollow Crown",
    gender: "male",
    raceId: RACES[0].id,
    aspectId: ASPECTS[0].id,
    resonanceIds: ["wounded"],
    appearance: defaultAppearance(),
    vitals: { vigor: 6, focus: 6, resolve: 6 },
  };
}
