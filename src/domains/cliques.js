// Cliques system - School social hierarchies
// 11.11.2025 - Phase 2.2: Social dynamics and popularity mechanics

import { randInt, randChoice, deepClone } from "../utils/random.js";
import { addHistory } from "../core/gameState.js";

// 11.11.2025 - Clique definitions with stat requirements and benefits
export const CLIQUES = {
  popular: {
    name: "Popular Kids",
    emoji: "⭐",
    description: "The social elite. Everyone knows their name.",
    requirements: {
      attractiveness: 70,
      happiness: 60,
    },
    popularityBonus: 30,
    stressImpact: 15,
    benefits: "High popularity, social influence, dating opportunities",
  },
  jocks: {
    name: "Jocks",
    emoji: "🏆",
    description: "The athletic powerhouses. Gym is their temple.",
    requirements: {
      athleticism: 60,
      health: 65,
    },
    popularityBonus: 20,
    stressImpact: 20,
    benefits: "Athletic respect, team loyalty, physical strength",
  },
  nerds: {
    name: "Nerds",
    emoji: "🤓",
    description: "The academically gifted. Library dwellers.",
    requirements: {
      intelligence: 75,
    },
    popularityBonus: -10,
    stressImpact: 10,
    benefits: "Academic excellence, study groups, college prep",
  },
  artsy: {
    name: "Artsy Kids",
    emoji: "🎨",
    description: "The creative souls. Band room is home.",
    requirements: {
      musical: 50,
    },
    popularityBonus: 5,
    stressImpact: 5,
    benefits: "Creative expression, artistic community, unique identity",
  },
  rebels: {
    name: "Rebels",
    emoji: "🎸",
    description: "The rule breakers. Detention regulars.",
    requirements: {
      stress: 60, // High stress kids become rebels
    },
    popularityBonus: 10,
    stressImpact: -5, // Actually reduces stress by defying norms
    benefits: "Independence, fearless reputation, street cred",
  },
  goths: {
    name: "Goths",
    emoji: "🖤",
    description: "The dark aesthetics. Misunderstood poets.",
    requirements: {
      happiness: 0, // Low happiness
    },
    popularityBonus: -5,
    stressImpact: -10,
    benefits: "Authentic self-expression, tight-knit community, artistic outlet",
  },
  loners: {
    name: "Loners",
    emoji: "🚶",
    description: "The independent spirits. Solo lunch champions.",
    requirements: {}, // Default fallback
    popularityBonus: -15,
    stressImpact: -15, // Low stress from minimal social pressure
    benefits: "Peace and quiet, self-reliance, no drama",
  },
  // 11.19.2025 - Greek life cliques for university
  fraternity: {
    name: "Fraternity", // Will be dynamically named (e.g., "Alpha Kappa")
    emoji: "🍺",
    description: "Greek life brotherhood. Parties, networking, and lifelong connections.",
    requirements: {
      age: 18,
      universitystudent: true, // Must be in college
      money: 500, // Initial dues
    },
    annualCost: 500, // Yearly dues
    popularityBonus: 25,
    stressImpact: 10,
    benefits: "Social network, career connections, leadership opportunities, parties",
    universityOnly: true,
  },
  sorority: {
    name: "Sorority", // Will be dynamically named (e.g., "Delta Gamma")
    emoji: "👯",
    description: "Greek life sisterhood. Social events, philanthropy, and sisterly bonds.",
    requirements: {
      age: 18,
      universitystudent: true, // Must be in college
      money: 500, // Initial dues
    },
    annualCost: 500, // Yearly dues
    popularityBonus: 25,
    stressImpact: 10,
    benefits: "Social network, career connections, leadership opportunities, philanthropy",
    universityOnly: true,
  },
};

// 11.11.2025 - Determine clique based on stats and activities
export function assignClique(life) {
  const updated = deepClone(life);

  // Check extracurriculars first - they override stat-based assignment
  if (updated.extracurriculars && updated.extracurriculars.length > 0) {
    const activities = updated.extracurriculars;

    // Sports = Jocks
    if (activities.includes("basketball") || activities.includes("soccer") || activities.includes("football")) {
      updated.clique = "jocks";
      addHistory(updated, "I'm running with the jocks now. Athletic respect earned.");
      return updated;
    }

    // Band/Choir = Artsy
    if (activities.includes("band") || activities.includes("choir")) {
      updated.clique = "artsy";
      addHistory(updated, "I'm part of the artsy crowd. Creative vibes all around.");
      return updated;
    }

    // Math/Science = Nerds
    if (activities.includes("mathClub") || activities.includes("scienceClub")) {
      updated.clique = "nerds";
      addHistory(updated, "I'm hanging with the nerds now. Brainpower recognized.");
      return updated;
    }

    // Student Gov = Popular (leadership path)
    if (activities.includes("studentGov")) {
      updated.clique = "popular";
      addHistory(updated, "I'm rolling with the popular kids now. Social status unlocked.");
      return updated;
    }
  }

  // Stat-based assignment if no activities
  const stats = {
    intelligence: updated.intelligence || 50,
    attractiveness: updated.attractiveness || 50,
    athleticism: updated.athleticism || 30,
    musical: updated.musical || 30,
    health: updated.health || 70,
    happiness: updated.happiness || 70,
    stress: updated.stress || 20,
  };

  // Check each clique's requirements
  if (stats.attractiveness >= 70 && stats.happiness >= 60) {
    updated.clique = "popular";
    addHistory(updated, "I naturally fell in with the popular kids. Charisma recognized.");
  } else if (stats.athleticism >= 60 && stats.health >= 65) {
    updated.clique = "jocks";
    addHistory(updated, "My athletic ability put me with the jocks. Respect earned.");
  } else if (stats.intelligence >= 75) {
    updated.clique = "nerds";
    addHistory(updated, "My brains got me into the nerd circle. Academic excellence noted.");
  } else if (stats.musical >= 50) {
    updated.clique = "artsy";
    addHistory(updated, "I found my place with the artsy kids. Creativity welcomed.");
  } else if (stats.stress >= 60) {
    updated.clique = "rebels";
    addHistory(updated, "I started running with the rebels. Rules are meant to be bent.");
  } else if (stats.happiness <= 40) {
    updated.clique = "goths";
    addHistory(updated, "I gravitated toward the goth crowd. Darkness understood.");
  } else {
    updated.clique = "loners";
    addHistory(updated, "I'm keeping to myself. Lone wolf status achieved.");
  }

  return updated;
}

// 11.11.2025 - Calculate popularity based on clique membership
export function calculatePopularityWithClique(life) {
  let popularity = 50; // Base popularity

  // Add clique bonus
  if (life.clique && CLIQUES[life.clique]) {
    popularity += CLIQUES[life.clique].popularityBonus;
  }

  // Add stat bonuses
  popularity += Math.floor((life.attractiveness || 50) * 0.3);
  popularity += Math.floor((life.happiness || 70) * 0.1);

  // Extracurricular bonuses
  if (life.extracurriculars && life.extracurriculars.length > 0) {
    popularity += life.extracurriculars.length * 5;
  }

  // Friends bonus
  const friends = life.relationships?.filter(r => r.relationshipStatus === "friend") || [];
  popularity += friends.length * 2;

  return Math.min(100, Math.max(0, popularity));
}

// 11.11.2025 - Clique interaction events
export function handleCliqueInteraction(life, action) {
  const updated = deepClone(life);

  if (!updated.clique || !CLIQUES[updated.clique]) {
    addHistory(updated, "I'm not part of any clique yet.");
    return updated;
  }

  const clique = CLIQUES[updated.clique];

  switch (action) {
    case "hangOut": {
      updated.happiness = Math.min(100, updated.happiness + randInt(5, 10));
      updated.stress = Math.max(0, updated.stress - randInt(3, 8));

      const hangOutEvents = {
        popular: [
          "I hung out with the popular kids at the mall. Social capital gained.",
          "I went to a party with the popular crowd. Everyone knew my name.",
          "I grabbed lunch with the popular kids. Status maintained.",
        ],
        jocks: [
          "I hung out with the jocks after practice. Brotherhood strengthened.",
          "I played pickup basketball with the team. Athletic bond deepened.",
          "I went to watch the game with the jocks. Team spirit alive.",
        ],
        nerds: [
          "I studied with the nerds at the library. Knowledge shared.",
          "I hung out with the smart kids. Intellectual conversation flowed.",
          "I joined a study group with the nerds. Grades will thank me.",
        ],
        artsy: [
          "I jammed with the artsy kids. Creative energy flowing.",
          "I hung out at the art room. Inspiration everywhere.",
          "I went to an indie concert with the artsy crowd. Vibes immaculate.",
        ],
        rebels: [
          "I hung out with the rebels behind the school. Rules optional.",
          "I skipped class with the rebel crew. Freedom tasted sweet.",
          "I caused some harmless mischief with the rebels. Legends made.",
        ],
        goths: [
          "I hung out with the goths at the cemetery. Darkness embraced.",
          "I listened to dark music with the goth kids. Melancholy shared.",
          "I wrote poetry with the goths. Pain understood.",
        ],
        loners: [
          "I spent time alone. Peace and quiet achieved.",
          "I kept to myself today. Solitude appreciated.",
          "I did my own thing. Independence maintained.",
        ],
      };

      addHistory(updated, randChoice(hangOutEvents[updated.clique]));
      break;
    }

    case "skipClass": {
      if (updated.clique === "nerds") {
        addHistory(updated, "I tried to skip class but the nerds wouldn't let me. Peer pressure for good grades.");
        return updated;
      }

      updated.stress = Math.max(0, updated.stress - randInt(5, 12));
      updated.happiness = Math.min(100, updated.happiness + randInt(3, 7));
      updated.intelligence = Math.max(0, updated.intelligence - randInt(2, 5));

      const skipEvents = [
        "I skipped class with my clique. Freedom tastes rebellious.",
        "I ditched school with the crew. Living dangerously.",
        "I cut class. The administration is not pleased.",
      ];
      addHistory(updated, randChoice(skipEvents));
      break;
    }

    case "throwParty": {
      if (updated.clique === "popular" || updated.clique === "rebels") {
        updated.happiness = Math.min(100, updated.happiness + randInt(10, 20));
        updated.stress = Math.min(100, updated.stress + randInt(5, 10));
        updated.fame = Math.min(100, updated.fame + randInt(5, 15));

        addHistory(updated, "I threw an epic party. Everyone showed up. Legendary status achieved.");
      } else {
        addHistory(updated, "I tried to throw a party but not many people showed up. Awkward.");
        updated.happiness = Math.max(0, updated.happiness - randInt(5, 10));
      }
      break;
    }

    case "changeClique": {
      // Allow changing cliques with stat/activity alignment
      addHistory(updated, "I'm thinking about switching cliques. My activities and stats will determine where I fit.");
      return assignClique(updated);
    }
  }

  return updated;
}

// 11.11.2025 - Try to join a different clique
export function tryJoinClique(life, targetClique, approach) {
  const updated = deepClone(life);

  if (!CLIQUES[targetClique]) {
    addHistory(updated, "That clique doesn't exist.");
    return updated;
  }

  if (updated.clique === targetClique) {
    addHistory(updated, `I'm already part of the ${CLIQUES[targetClique].name}.`);
    return updated;
  }

  const target = CLIQUES[targetClique];
  const currentClique = updated.clique ? CLIQUES[updated.clique] : null;

  // Calculate success chance based on stats and approach
  let successChance = 30; // Base 30% chance

  // Check if user meets requirements
  const stats = {
    intelligence: updated.intelligence || 50,
    attractiveness: updated.attractiveness || 50,
    athleticism: updated.athleticism || 30,
    musical: updated.musical || 30,
    health: updated.health || 70,
    happiness: updated.happiness || 70,
    stress: updated.stress || 20,
  };

  // Add bonus if requirements are met
  let meetsRequirements = true;
  if (target.requirements) {
    for (const [stat, value] of Object.entries(target.requirements)) {
      if (stats[stat] < value) {
        meetsRequirements = false;
        successChance -= 20; // Penalty for not meeting requirements
      } else {
        successChance += 15; // Bonus for meeting requirements
      }
    }
  }

  // 11.11.2025 - Social bonding bonus: having friends in target clique increases success
  let friendsInClique = [];
  let friendBonus = 0;
  if (updated.classmates) {
    friendsInClique = updated.classmates.filter(
      (c) => c.clique === targetClique && (c.relationshipStatus === "friend" || c.bond >= 70)
    );
    friendBonus = friendsInClique.length * 10; // +10% per friend in clique
    successChance += friendBonus;

    if (friendBonus > 0) {
      console.log(`Social bonus: ${friendBonus}% from ${friendsInClique.length} friends in ${target.name}`);
    }
  }

  switch (approach) {
    case "hangOut": {
      // Start hanging out - lower barrier, builds bond gradually
      successChance += 20;
      const hangOutRoll = Math.random() * 100;

      if (hangOutRoll < successChance) {
        updated.happiness = Math.min(100, updated.happiness + randInt(3, 7));
        let message = `I started hanging out with the ${target.name}. They seem cool with me being around.`;
        if (friendBonus > 0) {
          message += ` My friends in the group vouched for me.`;
        }
        addHistory(updated, message);
      } else {
        updated.happiness = Math.max(0, updated.happiness - randInt(2, 5));
        updated.stress = Math.min(100, updated.stress + randInt(3, 6));
        addHistory(updated, `I tried hanging out with the ${target.name}, but they weren't very welcoming. Awkward.`);
      }
      break;
    }

    case "askJoin": {
      // Direct ask to join - higher barrier but immediate result
      const askRoll = Math.random() * 100;

      if (askRoll < successChance) {
        updated.clique = targetClique;
        updated.happiness = Math.min(100, updated.happiness + randInt(10, 15));
        let message = `I asked to join the ${target.name} and they accepted me! I'm one of them now.`;
        if (friendBonus > 0) {
          message += ` Having friends in the group definitely helped.`;
        }
        addHistory(updated, message);

        // Leave old clique
        if (currentClique) {
          addHistory(updated, `I left the ${currentClique.name} behind.`);
        }
      } else {
        updated.happiness = Math.max(0, updated.happiness - randInt(5, 10));
        updated.stress = Math.min(100, updated.stress + randInt(5, 10));

        if (!meetsRequirements) {
          addHistory(updated, `I asked to join the ${target.name}, but they said I don't fit their vibe. Rejection stings.`);
        } else {
          addHistory(updated, `I asked to join the ${target.name}, but they turned me down. Not cool enough, I guess.`);
        }
      }
      break;
    }

    case "makeFun": {
      // Make fun of them - social attack, reduces their influence but damages reputation
      updated.happiness = Math.min(100, updated.happiness + randInt(2, 5));
      updated.stress = Math.max(0, updated.stress - randInt(2, 4));

      const makeFunEvents = [
        `I made fun of the ${target.name} in front of everyone. They're not happy with me, but my friends laughed.`,
        `I roasted the ${target.name} pretty hard. Social dynamics shifted.`,
        `I called out the ${target.name} for being lame. Bold move, risky consequences.`,
      ];

      addHistory(updated, randChoice(makeFunEvents));

      // Chance of retaliation
      if (Math.random() < 0.4) {
        updated.stress = Math.min(100, updated.stress + randInt(5, 12));
        addHistory(updated, `The ${target.name} clapped back hard. I got embarrassed in front of everyone.`);
      }
      break;
    }
  }

  return updated;
}

// 11.11.2025 - Random clique events (triggered on age up)
export function triggerRandomCliqueEvent(life) {
  const updated = deepClone(life);

  if (!updated.clique || Math.random() > 0.3) {
    return updated; // 30% chance of event
  }

  const events = {
    popular: [
      "Drama erupted in the popular clique. Social politics are exhausting.",
      "I got invited to an exclusive popular kids party. Status elevated.",
      "Someone in the popular crowd started a rumor about me. Stress increased.",
    ],
    jocks: [
      "The jocks threw me a surprise celebration after our big win. Brotherhood strong.",
      "Got into a friendly competition with another jock. Rivalry established.",
      "Practice was brutal today. The jocks pushed me to my limits.",
    ],
    nerds: [
      "The nerds invited me to a study marathon. Brain gains incoming.",
      "I won the school science fair with my nerd friends. Academic glory achieved.",
      "The nerds got bullied today. I stood up for them.",
    ],
    artsy: [
      "The artsy kids invited me to showcase my work. Creative validation received.",
      "We had a jam session that went all night. Pure artistic flow.",
      "The art teacher praised our group project. Recognition earned.",
    ],
    rebels: [
      "The rebels got caught pulling a prank. I narrowly avoided detention.",
      "We pulled off an epic senior prank. School legend status unlocked.",
      "The principal is cracking down on the rebels. Heat is on.",
    ],
    goths: [
      "The goths threw a dark poetry reading. Melancholy shared.",
      "Someone called the goth crowd weird. We don't care what they think.",
      "I bonded with the goths over shared darkness. Understanding deepened.",
    ],
    loners: [
      "I spent lunch alone. Peaceful solitude maintained.",
      "Someone tried to include me in their group. I politely declined.",
      "I enjoyed another quiet day. No drama, no stress.",
    ],
  };

  addHistory(updated, randChoice(events[updated.clique]));

  // Apply random stat changes based on event
  const roll = Math.random();
  if (roll < 0.3) {
    updated.happiness = Math.min(100, updated.happiness + randInt(3, 8));
  } else if (roll < 0.5) {
    updated.stress = Math.min(100, updated.stress + randInt(3, 8));
  }

  return updated;
}

// ========== PHASE 5B: NETWORK INFLUENCE MECHANICS ==========
// 11.11.2025 - v1.05.0: Adult network benefits from school cliques

// Get count of network connections from specific clique
export function getNetworkCount(life, cliqueKey) {
  if (!life.relationships) return 0;

  return life.relationships.filter(p =>
    p.networkOrigin === `classmate_${cliqueKey}` &&
    p.bond >= 40 // Only count decent relationships
  ).length;
}

// Get total network strength across all cliques
export function getTotalNetworkStrength(life) {
  if (!life.relationships) return 0;

  const networkConnections = life.relationships.filter(p =>
    p.networkOrigin && p.networkOrigin.startsWith("classmate_") &&
    p.bond >= 40
  );

  // Weight by bond level
  return networkConnections.reduce((total, person) => {
    return total + (person.bond / 100);
  }, 0);
}

// 11.11.2025 - v1.05.0: Calculate fame boost from popular network
export function getPopularNetworkFameBoost(life) {
  const popularCount = getNetworkCount(life, "popular");
  // Each popular connection = +2% fame growth
  return popularCount * 0.02;
}

// 11.11.2025 - v1.05.0: Calculate career boost from nerd network
export function getNerdNetworkCareerBoost(life) {
  const nerdCount = getNetworkCount(life, "nerds");
  // Each nerd connection = +3% career performance in tech/academia
  return nerdCount * 0.03;
}

// 11.11.2025 - v1.05.0: Calculate jock network athletics boost
export function getJockNetworkBoost(life) {
  const jockCount = getNetworkCount(life, "jocks");
  // Each jock connection = +2% health/athleticism gains
  return jockCount * 0.02;
}

// 11.11.2025 - v1.05.0: Calculate artsy network creativity boost
export function getArtsyNetworkBoost(life) {
  const artsyCount = getNetworkCount(life, "artsy");
  // Each artsy connection = +2% musical/creative gains
  return artsyCount * 0.02;
}

// 11.11.2025 - v1.05.0: Apply all network influence bonuses
export function applyNetworkInfluence(life) {
  const updated = deepClone(life);

  // Fame boost from popular network
  const fameBoost = getPopularNetworkFameBoost(updated);
  if (fameBoost > 0 && updated.fame > 0) {
    const bonus = Math.floor(updated.fame * fameBoost);
    if (bonus > 0) {
      updated.fame = Math.min(100, updated.fame + bonus);
    }
  }

  // Career boost from nerd network (if in tech/academic job)
  const careerBoost = getNerdNetworkCareerBoost(updated);
  if (careerBoost > 0 && updated.fullTimeJob) {
    const techJobs = ["softwareEngineer", "dataScientist", "professor"];
    if (techJobs.includes(updated.fullTimeJob.key)) {
      const bonus = Math.floor(updated.fullTimeJob.performance * careerBoost);
      if (bonus > 0) {
        updated.fullTimeJob.performance = Math.min(100, updated.fullTimeJob.performance + bonus);
      }
    }
  }

  return updated;
}

// 11.19.2025 - Greek Life System for University
// Simplified to just 2 options per gender
export function generateGreekOrganizations(life) {
  const fraternityNames = ["Alpha Kappa", "Beta Sigma"];
  const sororityNames = ["Delta Gamma", "Kappa Kappa"];

  const names = life.gender === "Male" ? fraternityNames : sororityNames;

  return {
    org1: {
      name: names[0],
      type: life.gender === "Male" ? "fraternity" : "sorority",
      emoji: life.gender === "Male" ? "🍺" : "👯",
      cost: randInt(400, 600),
      reputation: randChoice(["party-focused", "academic-focused", "service-focused", "athletic-focused"]),
    },
    org2: {
      name: names[1],
      type: life.gender === "Male" ? "fraternity" : "sorority",
      emoji: life.gender === "Male" ? "🍺" : "👯",
      cost: randInt(400, 600),
      reputation: randChoice(["party-focused", "academic-focused", "service-focused", "athletic-focused"]),
    }
  };
}

export function joinGreekLife(life, orgChoice) {
  const updated = deepClone(life);

  // Check if in university
  const isInCollege = updated.occupation && updated.occupation.includes("University Student");
  if (!isInCollege) {
    addHistory(updated, "I need to be in university to join Greek life.");
    return updated;
  }

  // Check age
  if (updated.age < 18) {
    addHistory(updated, "I'm too young to join Greek life.");
    return updated;
  }

  // Check if already in Greek life
  if (updated.greekLife) {
    addHistory(updated, `I'm already in ${updated.greekLife.name}. Can't join another organization.`);
    return updated;
  }

  // Get organizations
  if (!updated.greekOrganizations) {
    updated.greekOrganizations = generateGreekOrganizations(updated);
  }

  const org = updated.greekOrganizations[orgChoice];

  // Check money
  if (updated.money < org.cost) {
    // Try to bill parents or add to student loans
    const mother = updated.relationships?.find(r => r.relation === "Mother");
    const father = updated.relationships?.find(r => r.relation === "Father");
    const parentBond = Math.max(mother?.bond || 0, father?.bond || 0);

    if (parentBond >= 60 && Math.random() < 0.7) {
      // Parents pay
      addHistory(updated, `${mother?.firstName || father?.firstName} agreed to pay my Greek life dues ($${org.cost}). They support my college experience.`);
      if (mother) mother.bond = Math.min(100, mother.bond + 3);
      if (father) father.bond = Math.min(100, father.bond + 3);
    } else if (updated.studentDebt !== undefined) {
      // Add to student loans
      updated.studentDebt += org.cost;
      addHistory(updated, `I couldn't afford ${org.name} dues, so I added $${org.cost} to my student loans.`);
      updated.stress = Math.min(100, updated.stress + 5);
    } else {
      addHistory(updated, `I can't afford the $${org.cost} dues for ${org.name}.`);
      return updated;
    }
  } else {
    updated.money -= org.cost;
  }

  // Join Greek life
  updated.greekLife = {
    name: org.name,
    type: org.type,
    emoji: org.emoji,
    annualCost: org.cost,
    reputation: org.reputation,
    yearsActive: 0,
  };

  updated.clique = org.type; // Set clique to fraternity or sorority

  const messages = [
    `${org.emoji} I pledged ${org.name}! Greek life begins. Annual dues: $${org.cost}.`,
    `${org.emoji} I joined ${org.name}! Brotherhood/Sisterhood unlocked. This is going to be legendary.`,
    `${org.emoji} ${org.name} accepted me! I'm officially Greek now. Dues: $${org.cost}/year.`,
  ];

  addHistory(updated, randChoice(messages));
  updated.happiness = Math.min(100, updated.happiness + randInt(10, 20));
  updated.stress = Math.min(100, updated.stress + randInt(5, 15));

  return updated;
}

export function payGreekLifeDues(life) {
  const updated = deepClone(life);

  if (!updated.greekLife) return updated;

  const cost = updated.greekLife.annualCost;

  // Check if still in university
  const isInCollege = updated.occupation && updated.occupation.includes("University Student");
  if (!isInCollege) {
    // Graduated or left college - leave Greek life
    addHistory(updated, `I'm no longer in ${updated.greekLife.name} since I left university.`);
    updated.greekLife = null;
    if (updated.clique === "fraternity" || updated.clique === "sorority") {
      updated.clique = null;
    }
    return updated;
  }

  // Try to pay dues
  if (updated.money >= cost) {
    updated.money -= cost;
    updated.greekLife.yearsActive += 1;
    addHistory(updated, `${updated.greekLife.emoji} Paid ${updated.greekLife.name} dues ($${cost}). Another year of brotherhood/sisterhood.`);
  } else {
    // Try to bill parents or add to loans
    const mother = updated.relationships?.find(r => r.relation === "Mother");
    const father = updated.relationships?.find(r => r.relation === "Father");
    const parentBond = Math.max(mother?.bond || 0, father?.bond || 0);

    if (parentBond >= 50 && Math.random() < 0.5) {
      // Parents pay
      updated.greekLife.yearsActive += 1;
      addHistory(updated, `My parents covered my ${updated.greekLife.name} dues ($${cost}) this year.`);
    } else if (updated.studentDebt !== undefined) {
      // Add to loans
      updated.studentDebt += cost;
      updated.greekLife.yearsActive += 1;
      addHistory(updated, `I added ${updated.greekLife.name} dues ($${cost}) to my student loans.`);
      updated.stress = Math.min(100, updated.stress + 5);
    } else {
      // Can't pay - kicked out
      addHistory(updated, `${updated.greekLife.emoji} I couldn't pay my ${updated.greekLife.name} dues. I was removed from the organization.`);
      updated.greekLife = null;
      if (updated.clique === "fraternity" || updated.clique === "sorority") {
        updated.clique = null;
      }
      updated.happiness = Math.max(0, updated.happiness - randInt(15, 25));
      updated.stress = Math.min(100, updated.stress + randInt(10, 20));
    }
  }

  return updated;
}

export function quitGreekLife(life) {
  const updated = deepClone(life);

  if (!updated.greekLife) {
    addHistory(updated, "I'm not in any Greek organization.");
    return updated;
  }

  const orgName = updated.greekLife.name;
  addHistory(updated, `I left ${orgName}. Greek life wasn't for me.`);

  updated.greekLife = null;
  if (updated.clique === "fraternity" || updated.clique === "sorority") {
    updated.clique = null;
  }

  updated.stress = Math.max(0, updated.stress - 15);

  return updated;
}
