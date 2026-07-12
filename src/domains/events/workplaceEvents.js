// Workplace Events - Social dynamics at work
// 11.11.2025 - v1.02.0: Phase 5A - Workplace Ecosystem
// 5 workplace events triggered by various conditions

import { randInt, randChoice, deepClone } from "../../utils/random.js";
import { addHistory } from "../../core/gameState.js";
import { getCoworkerByPersonality, getRandomCoworker } from "../coworkers.js";

// Event IDs from roadmap
export const WORKPLACE_EVENTS = {
  WORK_GOSSIP_01: "WORK_GOSSIP_01",
  WORK_ROMANCE_02: "WORK_ROMANCE_02",
  WORK_MENTOR_03: "WORK_MENTOR_03",
  WORK_CONTROVERSY_04: "WORK_CONTROVERSY_04",
  WORK_RETREAT_05: "WORK_RETREAT_05"
};

// 11.11.2025 - v1.02.0: Promotion rumors (gossip event)
export function triggerPromotionGossip(life) {
  const updated = deepClone(life);

  if (!updated.fullTimeJob?.coworkers || updated.fullTimeJob.coworkers.length === 0) {
    return null; // No event if no coworkers
  }

  // Find gossip coworker or use random
  const gossiper = getCoworkerByPersonality(updated, "gossip") || getRandomCoworker(updated);

  if (!gossiper) return null;

  const performance = updated.fullTimeJob.performance || 50;

  if (performance >= 70) {
    // Positive gossip - you're up for promotion
    addHistory(updated, `${gossiper.firstName} told me everyone's been talking about my great work. Promotion rumors are spreading!`);
    updated.stress = Math.min(100, updated.stress + randInt(5, 10)); // Nervous excitement
    updated.happiness = Math.min(100, updated.happiness + randInt(5, 10));

    // Random bond changes with coworkers
    updated.fullTimeJob.coworkers.forEach(c => {
      if (Math.random() < 0.3) {
        if (c.personality === "rival") {
          c.bond = Math.max(0, c.bond - randInt(5, 10)); // Rivals get jealous
        } else {
          c.bond = Math.min(100, c.bond + randInt(2, 5)); // Others are supportive
        }
      }
    });
  } else {
    // Negative gossip - people think you're underperforming
    addHistory(updated, `${gossiper.firstName} mentioned people have been questioning my work lately. That stings...`);
    updated.stress = Math.min(100, updated.stress + randInt(10, 15));
    updated.happiness = Math.max(0, updated.happiness - randInt(5, 10));
    gossiper.bond = Math.max(0, gossiper.bond - randInt(3, 7));
  }

  return {
    updated,
    eventId: WORKPLACE_EVENTS.WORK_GOSSIP_01,
    message: `Office gossip is spreading about your performance.`
  };
}

// 11.11.2025 - v1.02.0: Office romance opportunity
export function triggerOfficeRomance(life) {
  const updated = deepClone(life);

  if (!updated.fullTimeJob?.coworkers || updated.fullTimeJob.coworkers.length === 0) {
    return null;
  }

  // Only trigger if single or dating (not married)
  if (updated.spouse) {
    return null;
  }

  // Find romantic interest coworker
  const romantic = getCoworkerByPersonality(updated, "romantic");

  if (!romantic || romantic.bond < 50) {
    return null; // Need decent bond
  }

  const attraction = updated.attractiveness || 50;

  if (attraction >= 60) {
    addHistory(updated, `I've been spending late nights at the office with ${romantic.firstName}. There's definitely chemistry here...`);
    romantic.bond = Math.min(100, romantic.bond + randInt(10, 20));
    updated.stress = Math.min(100, updated.stress + randInt(5, 10)); // Exciting but stressful
    updated.happiness = Math.min(100, updated.happiness + randInt(10, 15));

    // Risk: other coworkers notice (20% chance)
    if (Math.random() < 0.2) {
      const gossiper = getCoworkerByPersonality(updated, "gossip");
      if (gossiper) {
        addHistory(updated, `${gossiper.firstName} noticed the chemistry between me and ${romantic.firstName}. Word is getting around...`);
        updated.stress = Math.min(100, updated.stress + randInt(5, 10));
      }
    }
  } else {
    addHistory(updated, `${romantic.firstName} seems interested in me, but I'm not sure how to handle it at work.`);
    updated.stress = Math.min(100, updated.stress + randInt(5, 8));
  }

  return {
    updated,
    eventId: WORKPLACE_EVENTS.WORK_ROMANCE_02,
    message: `Office romance is brewing...`
  };
}

// 11.11.2025 - v1.02.0: Mentor offers guidance
export function triggerMentorship(life) {
  const updated = deepClone(life);

  if (!updated.fullTimeJob?.coworkers) {
    return null;
  }

  // Find mentor
  const mentor = getCoworkerByPersonality(updated, "mentor");

  if (!mentor || mentor.bond < 40) {
    return null; // Need some bond first
  }

  const managerQuality = updated.fullTimeJob.manager?.quality || "average";

  if (managerQuality === "excellent") {
    // Great manager + mentor = amazing growth
    addHistory(updated, `${mentor.firstName} praised my performance and offered to mentor me. My manager agreed enthusiastically!`);
    updated.fullTimeJob.performance = Math.min(100, (updated.fullTimeJob.performance || 50) + randInt(10, 20));
    mentor.bond = Math.min(100, mentor.bond + randInt(15, 25));
    updated.happiness = Math.min(100, updated.happiness + randInt(10, 15));
    updated.stress = Math.max(0, updated.stress - randInt(5, 10));
  } else if (managerQuality === "poor") {
    // Poor manager blocks mentorship
    addHistory(updated, `${mentor.firstName} wanted to mentor me, but my manager shut it down. Frustrating...`);
    mentor.bond = Math.min(100, mentor.bond + randInt(5, 10));
    updated.stress = Math.min(100, updated.stress + randInt(10, 15));
    updated.fullTimeJob.manager.bond = Math.max(0, updated.fullTimeJob.manager.bond - randInt(5, 10));
  } else {
    // Average manager allows it
    addHistory(updated, `${mentor.firstName} offered to mentor me. This could really help my career!`);
    updated.fullTimeJob.performance = Math.min(100, (updated.fullTimeJob.performance || 50) + randInt(5, 12));
    mentor.bond = Math.min(100, mentor.bond + randInt(10, 15));
    updated.happiness = Math.min(100, updated.happiness + randInt(5, 10));
  }

  return {
    updated,
    eventId: WORKPLACE_EVENTS.WORK_MENTOR_03,
    message: `Your mentor offers guidance.`
  };
}

// 11.11.2025 - v1.02.0: Manager takes credit for your work
export function triggerCreditSteal(life) {
  const updated = deepClone(life);

  if (!updated.fullTimeJob) {
    return null;
  }

  const performance = updated.fullTimeJob.performance || 50;
  const managerQuality = updated.fullTimeJob.manager?.quality || "average";

  // Only trigger if high performance + poor/average manager
  if (performance < 75 || managerQuality === "excellent") {
    return null;
  }

  if (managerQuality === "poor") {
    // Poor manager definitely steals credit
    addHistory(updated, `My manager took credit for my project in front of the entire team. I'm furious.`);
    updated.stress = Math.min(100, updated.stress + randInt(20, 30));
    updated.happiness = Math.max(0, updated.happiness - randInt(15, 25));
    updated.fullTimeJob.manager.bond = Math.max(0, updated.fullTimeJob.manager.bond - randInt(20, 30));
    updated.morale = Math.max(0, (updated.morale || 50) - randInt(10, 20));

    // Coworkers sympathize
    if (updated.fullTimeJob.coworkers) {
      updated.fullTimeJob.coworkers.forEach(c => {
        if (c.personality !== "rival") {
          c.bond = Math.min(100, c.bond + randInt(5, 10));
        }
      });
    }
  } else {
    // Average manager accidentally takes credit
    addHistory(updated, `My manager mentioned my project but made it sound like their idea. Not sure if it was intentional...`);
    updated.stress = Math.min(100, updated.stress + randInt(10, 15));
    updated.fullTimeJob.manager.bond = Math.max(0, updated.fullTimeJob.manager.bond - randInt(5, 10));
  }

  return {
    updated,
    eventId: WORKPLACE_EVENTS.WORK_CONTROVERSY_04,
    message: `Your manager takes credit for your work.`
  };
}

// 11.11.2025 - v1.02.0: Company retreat event
export function triggerCompanyRetreat(life) {
  const updated = deepClone(life);

  if (!updated.fullTimeJob?.coworkers || updated.fullTimeJob.coworkers.length === 0) {
    return null;
  }

  addHistory(updated, `Our company hosted an off-site retreat. Team building exercises and bonding time!`);

  // Stress reduction
  updated.stress = Math.max(0, updated.stress - randInt(10, 20));
  updated.happiness = Math.min(100, updated.happiness + randInt(5, 15));

  // Bond increase with all coworkers
  updated.fullTimeJob.coworkers.forEach(c => {
    c.bond = Math.min(100, c.bond + randInt(5, 15));
    c.morale = Math.min(100, c.morale + randInt(5, 10));
  });

  // Manager bond also improves
  if (updated.fullTimeJob.manager) {
    updated.fullTimeJob.manager.bond = Math.min(100, updated.fullTimeJob.manager.bond + randInt(5, 10));
  }

  // Small performance boost from morale
  updated.fullTimeJob.performance = Math.min(100, (updated.fullTimeJob.performance || 50) + randInt(3, 8));

  return {
    updated,
    eventId: WORKPLACE_EVENTS.WORK_RETREAT_05,
    message: `Company retreat boosts team morale!`
  };
}

// 11.11.2025 - v1.02.0: Check and trigger workplace events (called yearly)
export function checkWorkplaceEvents(life) {
  if (!life.fullTimeJob) {
    return life;
  }

  // Random event selection (20% chance for any event per year)
  if (Math.random() > 0.2) {
    return life;
  }

  const events = [
    triggerPromotionGossip,
    triggerOfficeRomance,
    triggerMentorship,
    triggerCreditSteal,
    triggerCompanyRetreat
  ];

  const selectedEvent = randChoice(events);
  const result = selectedEvent(life);

  return result ? result.updated : life;
}
