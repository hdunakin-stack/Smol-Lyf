// NPC generation functions
// 11.19.2025 - Added appearance generation for all NPCs

import { randInt, randChoice } from "../utils/random.js";
import { getFirstName, getLastName } from "../config/names.js";
import { generateSimpleAppearance } from "../domains/characterAppearance.js";

export function generateNPC(relation, parentAge, origin, lastName, gender) {
  const npcGender = gender || (relation === "Mother" ? "Female" : relation === "Father" ? "Male" : (Math.random() < 0.5 ? "Male" : "Female"));
  const firstNameArr = getFirstName(origin, npcGender);
  const firstName = randChoice(firstNameArr);
  const age = relation === "Mother" || relation === "Father" ? parentAge : randInt(0, 18);

  return {
    id: Date.now() + Math.random(),
    firstName,
    lastName,
    relation,
    age,
    occupation: relation === "Mother" || relation === "Father"
      ? randChoice(["Teacher", "Nurse", "Engineer", "Bartender", "Truck Driver"])
      : null,
    bond: 100,
    relationshipStatus: "family",
    appearance: generateSimpleAppearance(npcGender, { age }), // 11.19.2025 - NPC appearance
  };
}

export function generateClassmate(origin, playerAge) {
  const classmateGender = Math.random() < 0.5 ? "Male" : "Female";
  const firstNameArr = getFirstName(origin, classmateGender);
  const lastNameArr = getLastName(origin);
  const firstName = randChoice(firstNameArr);
  const lastName = randChoice(lastNameArr);

  // 11.11.2025 - Assign cliques to classmates (ages 12+)
  let clique = null;
  let networkOrigin = null; // 11.11.2025 - v1.05.0: Network origin for adult life

  if (playerAge >= 12) {
    const cliqueOptions = ["popular", "jocks", "nerds", "artsy", "rebels", "goths", "loners"];
    clique = randChoice(cliqueOptions);
    // 11.11.2025 - v1.05.0: Tag with network origin (persists after graduation)
    networkOrigin = `classmate_${clique}`;
  }

  return {
    id: Date.now() + Math.random(),
    firstName,
    lastName,
    relation: "Classmate",
    age: playerAge,
    occupation: null,
    bond: randInt(20, 60),
    relationshipStatus: "acquaintance",
    clique, // 11.11.2025 - Classmate's clique affiliation
    networkOrigin, // 11.11.2025 - v1.05.0: Network origin tag (e.g., "classmate_popular")
    appearance: generateSimpleAppearance(classmateGender, { age: playerAge }), // 11.19.2025 - Classmate appearance
  };
}
