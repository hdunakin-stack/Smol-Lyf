// Early Childhood Events (Ages 0-5)
// 11.13.2025 - v1.07.0: Infant and toddler life events

import { randInt, randChoice, deepClone } from "../../utils/random.js";
import { addHistory } from "../../core/gameState.js";

// ========== INFANT EVENTS (0-2) ==========

export function firstVaccination(life) {
  const updated = deepClone(life);

  // Find parents
  const mother = updated.relationships?.find(r => r.relation === "Mother");
  const father = updated.relationships?.find(r => r.relation === "Father");

  const messages = [
    "I got my first vaccination. I cried a lot, but my parents comforted me.",
    "Vaccination day. The needle hurt, but I got a sticker afterwards!",
    "My first shots at the doctor. I was brave... mostly."
  ];

  addHistory(updated, randChoice(messages));

  // Parent bond changes based on their relationship
  if (mother) {
    const motherBondChange = randInt(1, 3);
    mother.bond = Math.min(100, mother.bond + motherBondChange);
  }

  if (father) {
    const fatherBondChange = randInt(1, 3);
    father.bond = Math.min(100, father.bond + fatherBondChange);
  }

  return updated;
}

export function sharingToys(life) {
  const updated = deepClone(life);

  const outcome = Math.random();

  if (outcome < 0.5) {
    // Shared nicely
    const shareMessages = [
      "I shared my toys with another kid at daycare. We had fun together!",
      "I let another toddler play with my favorite toy. Mom said I was very kind.",
      "I played nicely and shared my blocks. Everyone was happy."
    ];
    addHistory(updated, randChoice(shareMessages));
    updated.happiness = Math.min(100, updated.happiness + randInt(3, 8));
  } else {
    // Didn't share, tantrum
    const tantrumMessages = [
      "I refused to share my toys. I threw a tantrum and had to sit in timeout.",
      "Another kid tried to take my toy. I screamed and wouldn't let go.",
      "I got in trouble for not sharing. I didn't care - it's MY toy!"
    ];
    addHistory(updated, randChoice(tantrumMessages));
    updated.happiness = Math.max(0, updated.happiness - randInt(2, 5));

    // Parents slightly stressed
    const mother = updated.relationships?.find(r => r.relation === "Mother");
    const father = updated.relationships?.find(r => r.relation === "Father");

    if (mother) mother.bond = Math.max(0, mother.bond - randInt(1, 3));
    if (father) father.bond = Math.max(0, father.bond - randInt(1, 3));
  }

  return updated;
}

export function earlyWalkingTalking(life) {
  const updated = deepClone(life);

  const milestone = randChoice(["walking", "talking"]);

  if (milestone === "walking") {
    const walkMessages = [
      "I took my first steps! My parents were so excited they nearly cried.",
      "I walked across the room all by myself. Everyone clapped for me!",
      "I can walk now! No more crawling for me."
    ];
    addHistory(updated, randChoice(walkMessages));
  } else {
    const talkMessages = [
      "I said my first word today! My parents won't stop talking about it.",
      "I can talk now! I keep repeating the same words over and over.",
      "I'm learning to speak. My parents think everything I say is amazing."
    ];
    addHistory(updated, randChoice(talkMessages));
  }

  // Parents very happy - big bond boost
  const mother = updated.relationships?.find(r => r.relation === "Mother");
  const father = updated.relationships?.find(r => r.relation === "Father");

  if (mother) mother.bond = Math.min(100, mother.bond + randInt(5, 10));
  if (father) father.bond = Math.min(100, father.bond + randInt(5, 10));

  updated.happiness = Math.min(100, updated.happiness + randInt(5, 12));

  return updated;
}

export function parentReactionEvent(life) {
  const updated = deepClone(life);

  const mother = updated.relationships?.find(r => r.relation === "Mother");
  const father = updated.relationships?.find(r => r.relation === "Father");

  if (!mother && !father) return updated;

  const reactionType = randChoice(["calm", "overprotective", "absentMinded"]);
  const parent = mother || father;
  const parentName = parent.firstName;
  const parentRelation = parent.relation.toLowerCase();

  switch (reactionType) {
    case "calm": {
      const calmMessages = [
        `My ${parentRelation} ${parentName} handled a situation calmly today. I felt safe.`,
        `${parentName} was patient with me when I made a mess. I felt loved.`,
        `My ${parentRelation} stayed calm even when I was fussy. Soothing presence.`
      ];
      addHistory(updated, randChoice(calmMessages));
      parent.bond = Math.min(100, parent.bond + randInt(3, 7));
      updated.happiness = Math.min(100, updated.happiness + randInt(2, 5));
      break;
    }

    case "overprotective": {
      const overprotectiveMessages = [
        `My ${parentRelation} ${parentName} wouldn't let me explore. Too protective.`,
        `${parentName} hovered over me constantly today. I felt smothered.`,
        `My ${parentRelation} panicked when I bumped my head lightly. Overreacting.`
      ];
      addHistory(updated, randChoice(overprotectiveMessages));
      parent.bond = Math.min(100, parent.bond + randInt(1, 3));
      updated.happiness = Math.max(0, updated.happiness - randInt(1, 4));
      break;
    }

    case "absentMinded": {
      const absentMessages = [
        `My ${parentRelation} ${parentName} seemed distracted today. Didn't pay much attention to me.`,
        `${parentName} forgot about my snack time. I was hungry and cranky.`,
        `My ${parentRelation} was on their phone a lot. I felt ignored.`
      ];
      addHistory(updated, randChoice(absentMessages));
      parent.bond = Math.max(0, parent.bond - randInt(2, 5));
      updated.happiness = Math.max(0, updated.happiness - randInt(3, 6));
      break;
    }
  }

  return updated;
}

// ========== TODDLER EVENTS (2-5) ==========

export function pottyTraining(life) {
  const updated = deepClone(life);

  const success = Math.random() < 0.6; // 60% success rate

  if (success) {
    const successMessages = [
      "I used the potty all by myself! My parents were so proud of me.",
      "No more diapers! I'm a big kid now.",
      "Potty training is going great. I'm getting the hang of this!"
    ];
    addHistory(updated, randChoice(successMessages));
    updated.happiness = Math.min(100, updated.happiness + randInt(5, 10));

    const mother = updated.relationships?.find(r => r.relation === "Mother");
    const father = updated.relationships?.find(r => r.relation === "Father");

    if (mother) mother.bond = Math.min(100, mother.bond + randInt(2, 5));
    if (father) father.bond = Math.min(100, father.bond + randInt(2, 5));
  } else {
    const struggleMessages = [
      "Potty training isn't going well. I had an accident today.",
      "I missed the potty again. My parents are getting frustrated.",
      "This potty thing is hard. I don't get it yet."
    ];
    addHistory(updated, randChoice(struggleMessages));
    updated.happiness = Math.max(0, updated.happiness - randInt(2, 5));
    updated.stress = Math.min(100, updated.stress + randInt(3, 8));
  }

  return updated;
}

export function preschoolSharing(life) {
  const updated = deepClone(life);

  const outcome = Math.random();

  if (outcome < 0.6) {
    // Made a friend
    const friendMessages = [
      "I made a friend at preschool today! We played together all afternoon.",
      "I shared my crayons with a kid at preschool. We became friends!",
      "Preschool was fun today. I have a new friend now."
    ];
    addHistory(updated, randChoice(friendMessages));
    updated.happiness = Math.min(100, updated.happiness + randInt(8, 15));
  } else {
    // Conflict
    const conflictMessages = [
      "I got into a fight over a toy at preschool. The teacher made us both sit in timeout.",
      "Another kid pushed me at preschool. I cried and wanted to go home.",
      "Preschool was rough today. Some kids weren't nice to me."
    ];
    addHistory(updated, randChoice(conflictMessages));
    updated.happiness = Math.max(0, updated.happiness - randInt(5, 10));
    updated.stress = Math.min(100, updated.stress + randInt(5, 12));
  }

  return updated;
}

export function parentComparison(life) {
  const updated = deepClone(life);

  const mother = updated.relationships?.find(r => r.relation === "Mother");
  const father = updated.relationships?.find(r => r.relation === "Father");

  if (!mother && !father) return updated;

  const parent = mother || father;
  const comparison = randChoice(["ahead", "behind", "average"]);

  switch (comparison) {
    case "ahead": {
      const aheadMessages = [
        `My ${parent.relation.toLowerCase()} said I'm ahead of other kids my age. I felt special.`,
        `${parent.firstName} thinks I'm very advanced for my age. That made me happy.`,
        `My ${parent.relation.toLowerCase()} bragged about me to their friends. I'm doing great!`
      ];
      addHistory(updated, randChoice(aheadMessages));
      parent.bond = Math.min(100, parent.bond + randInt(3, 7));
      updated.happiness = Math.min(100, updated.happiness + randInt(5, 10));
      break;
    }

    case "behind": {
      const behindMessages = [
        `My ${parent.relation.toLowerCase()} compared me to other kids. I'm 'behind.' I felt bad.`,
        `${parent.firstName} seems worried that I'm not developing fast enough.`,
        `My ${parent.relation.toLowerCase()} said I need to 'catch up' to other kids. That hurt.`
      ];
      addHistory(updated, randChoice(behindMessages));
      parent.bond = Math.max(0, parent.bond - randInt(2, 5));
      updated.happiness = Math.max(0, updated.happiness - randInt(5, 10));
      updated.stress = Math.min(100, updated.stress + randInt(5, 10));
      break;
    }

    case "average": {
      const averageMessages = [
        `My ${parent.relation.toLowerCase()} said I'm developing normally. Just average.`,
        `${parent.firstName} seems content with how I'm growing up. Nothing special, nothing wrong.`,
        `My ${parent.relation.toLowerCase()} thinks I'm doing fine for my age.`
      ];
      addHistory(updated, randChoice(averageMessages));
      parent.bond = Math.min(100, parent.bond + randInt(1, 3));
      break;
    }
  }

  return updated;
}

// ========== EVENT TRIGGER ==========

export function triggerEarlyChildhoodEvent(life) {
  // Only trigger for ages 0-5
  if (life.age > 5) return null;

  // 20% chance per year
  if (Math.random() > 0.20) return null;

  let eventPool = [];

  // Age 0-2 (Infants)
  if (life.age <= 2) {
    eventPool = [
      firstVaccination,
      sharingToys,
      earlyWalkingTalking,
      parentReactionEvent
    ];
  }
  // Age 2-5 (Toddlers)
  else {
    eventPool = [
      pottyTraining,
      preschoolSharing,
      parentComparison,
      sharingToys
    ];
  }

  const selectedEvent = randChoice(eventPool);
  return selectedEvent(life);
}
