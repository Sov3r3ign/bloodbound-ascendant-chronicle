import murkLurker from "@/assets/beasts/murk-lurker.jpg";
import boneCur from "@/assets/beasts/bone-cur.jpg";
import shadeStalker from "@/assets/beasts/shade-stalker.jpg";
import bloodAcolyte from "@/assets/beasts/blood-acolyte.jpg";
import emberWraith from "@/assets/beasts/ember-wraith.jpg";
import marrowKnight from "@/assets/beasts/marrow-knight.jpg";
import throneOfMaggots from "@/assets/beasts/throne-of-maggots.jpg";
import veiledSovereign from "@/assets/beasts/veiled-sovereign.jpg";
import heartOfMire from "@/assets/beasts/heart-of-mire.jpg";

export const BEAST_IMAGES: Record<string, string> = {
  "Murk Lurker": murkLurker,
  "Bone Cur": boneCur,
  "Shade Stalker": shadeStalker,
  "Blood Acolyte": bloodAcolyte,
  "Ember Wraith": emberWraith,
  "Marrow Knight": marrowKnight,
  "Throne of Maggots": throneOfMaggots,
  "The Veiled Sovereign": veiledSovereign,
  "Heart of the Mire": heartOfMire,
};

export function beastImage(name: string): string | undefined {
  return BEAST_IMAGES[name];
}
