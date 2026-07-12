// Clique/Alumni Reunion Events - Extend school cliques into adult life
// 11.11.2025 - v1.05.0: Phase 5B - Network origin events
// 5 events triggered by network connections from school days

import { randInt, randChoice, deepClone } from "../../utils/random.js";
import { addHistory } from "../../core/gameState.js";

// Event IDs from roadmap
export const CLIQUE_EVENTS = {
  CLQ_REUNION_01: "CLQ_REUNION_01",
  CLQ_MANAGER_02: "CLQ_MANAGER_02",
  CLQ_RIVAL_03: "CLQ_RIVAL_03",
  CLQ_ROMANCE_04: "CLQ_ROMANCE_04",
  CLQ_NOSTALGIA_05: "CLQ_NOSTALGIA_05"
};

// 11.11.2025 - v1.05.0: Get classmates with network origins
function getNetworkClassmates(life) {
  return life.relationships.filter(p =>
    p.networkOrigin && p.networkOrigin.startsWith("classmate_")
  );
}

// 11.11.2025 - v1.05.0: Get classmates from specific clique network
function getCliqueNetwork(life, cliqueKey) {
  return life.relationships.filter(p =>
    p.networkOrigin === `classmate_${cliqueKey}`
  );
}

// 11.11.2025 - v1.05.0: CLQ_REUNION_01 - High school reunion invitation (age 25+)
export function triggerReunionInvite(life) {
  const updated = deepClone(life);

  // Requirements: age 25+, has classmates with network origins
  if (updated.age < 25) return null;

  const networkClassmates = getNetworkClassmates(updated);
  if (networkClassmates.length === 0) return null;

  // Pick random classmate from network
  const oldFriend = randChoice(networkClassmates);
  const cliqueKey = oldFriend.networkOrigin.replace("classmate_", "");

  addHistory(updated, `I got an invitation to my high school reunion! ${oldFriend.firstName} ${oldFriend.lastName} from the ${cliqueKey} crowd will be there.`);

  // Attending reunion effects
  const attendees = getCliqueNetwork(updated, cliqueKey);

  // Boost bonds with old network
  attendees.forEach(classmate => {
    classmate.bond = Math.min(100, classmate.bond + randInt(10, 20));
  });

  // Happiness from nostalgia
  updated.happiness = Math.min(100, updated.happiness + randInt(10, 15));

  // Stress from social anxiety (varies by clique)
  let stressGain = randInt(5, 10);
  if (cliqueKey === "popular") stressGain = Math.floor(stressGain * 0.7); // Popular kids = less stress
  if (cliqueKey === "loners") stressGain = Math.floor(stressGain * 1.5); // Loners = more stress

  updated.stress = Math.min(100, updated.stress + stressGain);

  return {
    updated,
    eventId: CLIQUE_EVENTS.CLQ_REUNION_01,
    message: `High school reunion - reconnected with the ${cliqueKey} network!`
  };
}

// 11.11.2025 - v1.05.0: CLQ_MANAGER_02 - Old friend is now talent manager
export function triggerTalentManagerOffer(life) {
  const updated = deepClone(life);

  // Requirements: age 22+, has fame 30+, has network classmates
  if (updated.age < 22 || updated.fame < 30) return null;

  const networkClassmates = getNetworkClassmates(updated);
  if (networkClassmates.length === 0) return null;

  // More likely if from popular/artsy cliques
  const preferredNetworks = networkClassmates.filter(c =>
    c.networkOrigin.includes("popular") || c.networkOrigin.includes("artsy")
  );

  const potentialManager = preferredNetworks.length > 0
    ? randChoice(preferredNetworks)
    : randChoice(networkClassmates);

  const cliqueKey = potentialManager.networkOrigin.replace("classmate_", "");

  addHistory(updated, `${potentialManager.firstName} ${potentialManager.lastName} from my ${cliqueKey} days reached out! They're a talent manager now and want to represent me.`);

  // Boost fame velocity through network
  updated.fame = Math.min(100, updated.fame + randInt(5, 10));

  // Boost bond
  potentialManager.bond = Math.min(100, potentialManager.bond + randInt(15, 25));

  // Happiness from old friend success
  updated.happiness = Math.min(100, updated.happiness + randInt(5, 10));

  return {
    updated,
    eventId: CLIQUE_EVENTS.CLQ_MANAGER_02,
    message: `Old ${cliqueKey} friend offers to be your talent manager!`
  };
}

// 11.11.2025 - v1.05.0: CLQ_RIVAL_03 - Rival gets promoted before you
export function triggerRivalPromotion(life) {
  const updated = deepClone(life);

  // Requirements: age 23+, has full-time job, has network classmates
  if (updated.age < 23 || !updated.fullTimeJob) return null;

  const networkClassmates = getNetworkClassmates(updated);
  if (networkClassmates.length === 0) return null;

  // Pick any classmate to be the rival
  const rival = randChoice(networkClassmates);
  const cliqueKey = rival.networkOrigin.replace("classmate_", "");

  addHistory(updated, `I saw on social media that ${rival.firstName} ${rival.lastName} from the ${cliqueKey} group just got promoted to senior management. Feeling competitive...`);

  // Stress from comparison
  updated.stress = Math.min(100, updated.stress + randInt(10, 20));

  // Happiness decreases from jealousy
  updated.happiness = Math.max(0, updated.happiness - randInt(5, 10));

  // But also motivates performance boost
  if (updated.fullTimeJob.performance) {
    updated.fullTimeJob.performance = Math.min(100, updated.fullTimeJob.performance + randInt(5, 10));
    addHistory(updated, `Their success motivated me to work harder.`);
  }

  return {
    updated,
    eventId: CLIQUE_EVENTS.CLQ_RIVAL_03,
    message: `Old classmate's success sparks competitive motivation.`
  };
}

// 11.11.2025 - v1.05.0: CLQ_ROMANCE_04 - Rekindle romance at reunion
export function triggerRekindledRomance(life) {
  const updated = deepClone(life);

  // Requirements: age 25+, single or dating (not married), has network classmates, attractiveness 50+
  if (updated.age < 25 || updated.spouse || updated.attractiveness < 50) return null;

  const networkClassmates = getNetworkClassmates(updated);
  if (networkClassmates.length === 0) return null;

  // Pick classmate with decent bond
  const eligibleClassmates = networkClassmates.filter(c => c.bond >= 40);
  if (eligibleClassmates.length === 0) return null;

  const oldFlame = randChoice(eligibleClassmates);
  const cliqueKey = oldFlame.networkOrigin.replace("classmate_", "");

  addHistory(updated, `At a reunion event, I reconnected with ${oldFlame.firstName} ${oldFlame.lastName} from the ${cliqueKey} days. The chemistry is still there...`);

  // Boost bond significantly
  oldFlame.bond = Math.min(100, oldFlame.bond + randInt(20, 35));

  // Chance to start dating (if high bond)
  if (oldFlame.bond >= 70 && !updated.partner && Math.random() < 0.6) {
    oldFlame.relationshipStatus = "dating";
    updated.partner = oldFlame.id;
    addHistory(updated, `We decided to give it another shot. We're dating now!`);
    updated.happiness = Math.min(100, updated.happiness + randInt(15, 25));
  } else {
    // Just friendship rekindled
    oldFlame.relationshipStatus = "friend";
    updated.happiness = Math.min(100, updated.happiness + randInt(10, 15));
  }

  // Small stress from emotional vulnerability
  updated.stress = Math.min(100, updated.stress + randInt(5, 8));

  return {
    updated,
    eventId: CLIQUE_EVENTS.CLQ_ROMANCE_04,
    message: `Rekindled connection with old ${cliqueKey} classmate!`
  };
}

// 11.11.2025 - v1.05.0: CLQ_NOSTALGIA_05 - Scroll through old photos
export function triggerNostalgiaScroll(life) {
  const updated = deepClone(life);

  // Requirements: age 30+, has network classmates
  if (updated.age < 30) return null;

  const networkClassmates = getNetworkClassmates(updated);
  if (networkClassmates.length === 0) return null;

  // Get player's former clique if they have one
  const playerFormerClique = updated.formerClique;

  if (playerFormerClique) {
    const { CLIQUES } = require("../cliques.js");
    const cliqueData = CLIQUES[playerFormerClique];
    const cliqueName = cliqueData ? cliqueData.name : playerFormerClique;

    addHistory(updated, `I spent the evening scrolling through old photos from my ${cliqueName} days. So many memories...`);
  } else {
    addHistory(updated, `I found some old school photos online. Nostalgia hit hard looking at familiar faces.`);
  }

  // Random classmates mentioned
  const featuredClassmates = [];
  for (let i = 0; i < Math.min(3, networkClassmates.length); i++) {
    const classmate = networkClassmates[i];
    featuredClassmates.push(`${classmate.firstName} ${classmate.lastName}`);
  }

  if (featuredClassmates.length > 0) {
    addHistory(updated, `Saw photos with ${featuredClassmates.join(", ")}. Wonder what they're up to now.`);
  }

  // Emotional effects
  updated.happiness = Math.min(100, updated.happiness + randInt(5, 12));
  updated.stress = Math.max(0, updated.stress - randInt(5, 10)); // Nostalgia is relaxing

  // Small bond boost to randomly featured classmates
  featuredClassmates.forEach(() => {
    const classmate = randChoice(networkClassmates);
    classmate.bond = Math.min(100, classmate.bond + randInt(2, 5));
  });

  return {
    updated,
    eventId: CLIQUE_EVENTS.CLQ_NOSTALGIA_05,
    message: `Nostalgic trip through old school memories.`
  };
}

// 11.11.2025 - v1.05.0: Check and trigger clique events (called yearly)
export function checkCliqueEvents(life) {
  // Random event selection (15% chance for any event per year)
  if (Math.random() > 0.15) {
    return life;
  }

  const events = [
    triggerReunionInvite,
    triggerTalentManagerOffer,
    triggerRivalPromotion,
    triggerRekindledRomance,
    triggerNostalgiaScroll
  ];

  const selectedEvent = randChoice(events);
  const result = selectedEvent(life);

  return result ? result.updated : life;
}
