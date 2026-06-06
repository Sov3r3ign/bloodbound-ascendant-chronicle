import catacombs from "@/assets/biomes/catacombs.jpg";
import foundry from "@/assets/biomes/foundry.jpg";
import veiled from "@/assets/biomes/veiled.jpg";
import mire from "@/assets/biomes/mire.jpg";
import type { BiomeId } from "@/lib/dungeon-engine";

export const BIOME_IMAGES: Record<BiomeId, string> = {
  catacombs,
  foundry,
  veiled,
  mire,
};

export function biomeImage(id: BiomeId): string {
  return BIOME_IMAGES[id];
}
