import { deepClone, randChoice, randInt } from "../utils/random.js";
import { generateNPC } from "../core/npc.js";
import { generateSimpleAppearance } from "./characterAppearance.js";

export const PERSONALITY_TYPES = {
  mentor: {
    name: "Mentor",
    emoji: "M",
    description: "Supportive and helpful. Boosts your performance.",
    bondModifier: 1.2,
    positiveEvents: ["mentorAdvice", "performanceBoost"],
    traits: ["helpful", "wise", "patient"],
  },
  rival: {
    name: "Rival",
    emoji: "R",
    description: "Competitive and ambitious. Challenges you.",
    bondModifier: 0.7,
    positiveEvents: ["rivalMotivation"],
    negativeEvents: ["rivalSabotage", "creditSteal"],
    traits: ["ambitious", "competitive", "critical"],
  },
  friend: {
    name: "Friend",
    emoji: "F",
    description: "Easy-going and sociable. Great for morale.",
    bondModifier: 1.5,
    positiveEvents: ["lunchTogether", "coffeeChat", "afterWorkHangout"],
    traits: ["friendly", "sociable", "supportive"],
  },
  gossip: {
    name: "Gossip",
    emoji: "G",
    description: "Knows everyone's business. Source of office drama.",
    bondModifier: 1.0,
    positiveEvents: ["usefulGossip"],
    negativeEvents: ["spreadRumor", "leakSecret"],
    traits: ["talkative", "curious", "dramatic"],
  },
  neutral: {
    name: "Neutral",
    emoji: "N",
    description: "Professional and distant. Minds their own business.",
    bondModifier: 0.9,
    positiveEvents: ["professionalHelp"],
    traits: ["professional", "quiet", "reserved"],
  },
  romantic: {
    name: "Romantic Interest",
    emoji: "L",
    description: "Attracted to you. Could lead to romance or drama.",
    bondModifier: 1.3,
    positiveEvents: ["flirtation", "dateInvite"],
    negativeEvents: ["awkwardRejection", "jealousy"],
    traits: ["charming", "attractive", "interested"],
  },
};

function pushHistory(life, message) {
  if (!life.history) {
    life.history = {};
  }
  if (!life.history[life.age]) {
    life.history[life.age] = [];
  }
  life.history[life.age].unshift(message);
}

function getCoworkerList(life) {
  if (!life.fullTimeJob) {
    return null;
  }
  if (!Array.isArray(life.fullTimeJob.coworkers)) {
    return null;
  }
  return life.fullTimeJob.coworkers;
}

export function generateCoworkers(life, jobTier = 1) {
  const count = randInt(3, 6);
  const coworkers = [];
  const personalities = ["neutral", "neutral", "friend", "gossip"];

  if (jobTier <= 2) {
    personalities.push("mentor");
  }

  if (jobTier >= 2 || life.intelligence > 70) {
    personalities.push("rival");
  }

  if (!life.spouse && Math.random() < 0.2) {
    personalities.push("romantic");
  }

  for (let i = 0; i < count; i += 1) {
    const personalityKey = randChoice(personalities);
    const personality = PERSONALITY_TYPES[personalityKey];
    const npc = generateNPC(life.age + randInt(-5, 5));
    const coworkerGender = Math.random() < 0.5 ? "Male" : "Female";
    const gender = npc.gender || coworkerGender;

    coworkers.push({
      id: `coworker_${Date.now()}_${i}`,
      firstName: npc.firstName,
      lastName: npc.lastName,
      age: npc.age,
      gender,
      personality: personalityKey,
      personalityEmoji: personality.emoji,
      personalityName: personality.name,
      bond: randInt(20, 50),
      morale: randInt(40, 80),
      relationshipStatus: "coworker",
      relation: "Coworker",
      traits: personality.traits,
      performanceLevel: randInt(50, 90),
      yearsAtCompany: randInt(0, jobTier * 3),
      lastInteraction: null,
      appearance: generateSimpleAppearance(gender, { age: npc.age || life.age }),
    });
  }

  return coworkers;
}

export function interactWithCoworker(life, coworkerId, action) {
  const updated = deepClone(life);
  const coworkers = getCoworkerList(updated);

  if (!coworkers) {
    return updated;
  }

  const coworker = coworkers.find((entry) => entry.id === coworkerId);
  if (!coworker) {
    return updated;
  }

  const personality = PERSONALITY_TYPES[coworker.personality] || PERSONALITY_TYPES.neutral;

  if (action === "chat") {
    const bondGain = randInt(3, 8) * personality.bondModifier;
    coworker.bond = Math.min(100, coworker.bond + bondGain);
    coworker.morale = Math.min(100, coworker.morale + randInt(2, 5));
    updated.stress = Math.max(0, updated.stress - randInt(1, 3));
    pushHistory(updated, randChoice([
      `I had a nice chat with ${coworker.firstName} during break.`,
      `${coworker.firstName} and I talked about work and life.`,
      `I bonded with ${coworker.firstName} over coffee.`,
    ]));
  } else if (action === "askAdvice") {
    if (coworker.personality === "mentor" && coworker.bond >= 40) {
      updated.fullTimeJob.performance = Math.min(100, (updated.fullTimeJob.performance || 50) + randInt(5, 10));
      coworker.bond = Math.min(100, coworker.bond + randInt(5, 10));
      pushHistory(updated, `${coworker.firstName} gave me valuable career advice. My performance improved!`);
    } else if (coworker.bond >= 30) {
      updated.fullTimeJob.performance = Math.min(100, (updated.fullTimeJob.performance || 50) + randInt(2, 5));
      coworker.bond = Math.min(100, coworker.bond + randInt(3, 6));
      pushHistory(updated, `${coworker.firstName} shared some helpful tips.`);
    } else {
      coworker.bond = Math.max(0, coworker.bond - randInt(1, 3));
      pushHistory(updated, `${coworker.firstName} seemed too busy to help.`);
    }
  } else if (action === "collaborate") {
    const collaborationSuccess = Math.random() < 0.7;
    if (collaborationSuccess) {
      updated.fullTimeJob.performance = Math.min(100, (updated.fullTimeJob.performance || 50) + randInt(8, 15));
      coworker.bond = Math.min(100, coworker.bond + randInt(10, 15));
      coworker.morale = Math.min(100, coworker.morale + randInt(5, 10));
      updated.stress = Math.min(100, updated.stress + randInt(5, 10));
      pushHistory(updated, `${coworker.firstName} and I successfully completed a major project together!`);
    } else {
      coworker.bond = Math.max(0, coworker.bond - randInt(5, 10));
      updated.stress = Math.min(100, updated.stress + randInt(10, 15));
      pushHistory(updated, `The project with ${coworker.firstName} did not go well. Things were tense.`);
    }
  } else if (action === "compliment") {
    const bondBoost = randInt(5, 12) * personality.bondModifier;
    coworker.bond = Math.min(100, coworker.bond + bondBoost);
    coworker.morale = Math.min(100, coworker.morale + randInt(5, 10));
    pushHistory(updated, `I complimented ${coworker.firstName} on their work. They appreciated it!`);
  } else if (action === "gossip") {
    if (coworker.personality === "gossip") {
      coworker.bond = Math.min(100, coworker.bond + randInt(8, 15));
      updated.stress = Math.max(0, updated.stress - randInt(3, 7));
      pushHistory(updated, `${coworker.firstName} and I caught up on all the office drama.`);
    } else if (coworker.personality === "neutral" || coworker.personality === "mentor") {
      coworker.bond = Math.max(0, coworker.bond - randInt(3, 8));
      pushHistory(updated, `${coworker.firstName} did not seem interested in gossip.`);
    } else {
      coworker.bond = Math.min(100, coworker.bond + randInt(3, 7));
      pushHistory(updated, `${coworker.firstName} and I talked about our coworkers.`);
    }
  } else if (action === "ignore") {
    coworker.bond = Math.max(0, coworker.bond - randInt(2, 5));
    coworker.morale = Math.max(0, coworker.morale - randInt(1, 3));
    if (coworker.personality === "rival") {
      pushHistory(updated, `I kept my distance from ${coworker.firstName}. They seemed to notice.`);
    }
  }

  coworker.lastInteraction = updated.age;
  return updated;
}

export function processCoworkerEvents(life) {
  const updated = deepClone(life);
  const coworkers = getCoworkerList(updated);

  if (!coworkers) {
    return updated;
  }

  updated.fullTimeJob.coworkers = coworkers.filter((coworker) => {
    if (Math.random() < 0.1) {
      pushHistory(updated, `${coworker.firstName} ${coworker.lastName} left the company.`);
      return false;
    }
    return true;
  });

  if (updated.fullTimeJob.coworkers.length < 6 && Math.random() < 0.2) {
    const generated = generateCoworkers(updated, updated.fullTimeJob.tier || 1);
    if (generated.length > 0) {
      const newCoworker = generated[0];
      updated.fullTimeJob.coworkers.push(newCoworker);
      pushHistory(updated, `${newCoworker.firstName} ${newCoworker.lastName} joined our team!`);
    }
  }

  updated.fullTimeJob.coworkers.forEach((coworker) => {
    if (!coworker.lastInteraction || (updated.age - coworker.lastInteraction) > 1) {
      coworker.bond = Math.max(0, coworker.bond - randInt(2, 5));
    }
  });

  return updated;
}

export function getCoworkerByPersonality(life, personalityType) {
  const coworkers = getCoworkerList(life);
  if (!coworkers) {
    return null;
  }
  return coworkers.find((coworker) => coworker.personality === personalityType) || null;
}

export function getRandomCoworker(life) {
  const coworkers = getCoworkerList(life);
  if (!coworkers || coworkers.length === 0) {
    return null;
  }
  return randChoice(coworkers);
}
