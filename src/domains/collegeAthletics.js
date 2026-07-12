// College Athletics System
// 11.19.2025 - NIL era recruitment, rankings, transfers, draft decisions

import { randInt, randChoice, deepClone } from "../utils/random.js";
import { addHistory } from "../core/gameState.js";

// ========== COLLEGE PROGRAMS ==========

export const COLLEGE_PROGRAMS = {
  basketball: {
    tier1: [
      { name: "Durham Blue Devils", market: "large", coaching: "elite", playingTime: "low", team: "elite", nil: [50000, 150000] },
      { name: "Kentucky Wildcats", market: "large", coaching: "elite", playingTime: "medium", team: "elite", nil: [45000, 140000] },
      { name: "Carolina Tar Heels", market: "large", coaching: "elite", playingTime: "medium", team: "elite", nil: [40000, 130000] },
      { name: "Kansas Jayhawks", market: "medium", coaching: "elite", playingTime: "medium", team: "elite", nil: [35000, 120000] },
    ],
    tier2: [
      { name: "UCLA Bruins", market: "large", coaching: "good", playingTime: "medium", team: "good", nil: [30000, 100000] },
      { name: "Spokane Bulldogs", market: "medium", coaching: "elite", playingTime: "high", team: "good", nil: [25000, 90000] },
      { name: "Michigan State Spartans", market: "medium", coaching: "good", playingTime: "high", team: "good", nil: [20000, 80000] },
    ],
    tier3: [
      { name: "Southern Cal Trojans", market: "large", coaching: "average", playingTime: "high", team: "average", nil: [15000, 60000] },
      { name: "Arizona Wildcats", market: "medium", coaching: "good", playingTime: "high", team: "average", nil: [12000, 50000] },
      { name: "Memphis Tigers", market: "medium", coaching: "average", playingTime: "high", team: "average", nil: [10000, 40000] },
    ]
  },
  football: {
    tier1: [
      { name: "Alabama Crimson Tide", market: "large", coaching: "elite", playingTime: "low", team: "elite", nil: [60000, 200000] },
      { name: "Georgia Bulldogs", market: "large", coaching: "elite", playingTime: "medium", team: "elite", nil: [55000, 190000] },
      { name: "Ohio State Buckeyes", market: "large", coaching: "elite", playingTime: "medium", team: "elite", nil: [50000, 180000] },
      { name: "Southern Cal Trojans", market: "large", coaching: "elite", playingTime: "medium", team: "elite", nil: [45000, 170000] },
    ],
    tier2: [
      { name: "Texas Longhorns", market: "large", coaching: "good", playingTime: "medium", team: "good", nil: [35000, 120000] },
      { name: "Michigan Wolverines", market: "medium", coaching: "elite", playingTime: "high", team: "good", nil: [30000, 110000] },
      { name: "Penn State Nittany Lions", market: "medium", coaching: "good", playingTime: "high", team: "good", nil: [25000, 100000] },
    ],
    tier3: [
      { name: "Oregon Ducks", market: "medium", coaching: "good", playingTime: "high", team: "average", nil: [20000, 80000] },
      { name: "Florida State Bears", market: "medium", coaching: "average", playingTime: "high", team: "average", nil: [15000, 70000] },
      { name: "Miami Hurricanes", market: "large", coaching: "average", playingTime: "high", team: "average", nil: [15000, 65000] },
    ]
  }
};

// ========== HIGH SCHOOL RANKINGS ==========

export function calculateHSRanking(life, sport) {
  const athleticism = life.athleticism || 50;
  const sportExp = life.extracurricularDetails?.[sport]?.experience || 0;
  const influence = life.influence || 0;
  const fame = life.fame || 0;

  // Calculate ranking score
  let score = 0;
  score += athleticism * 2; // 0-200
  score += sportExp; // 0-100
  score += influence; // 0-100
  score += fame; // 0-100

  // Total possible: 500

  if (score >= 400) return "5-Star (National Phenom)";
  if (score >= 320) return "4-Star (All-American)";
  if (score >= 240) return "3-Star (All-State)";
  if (score >= 160) return "2-Star (All-Conference)";
  return "Unranked";
}

export function assignHSRanking(life, sport) {
  const updated = deepClone(life);

  if (life.age !== 17 && life.age !== 18) return updated; // Only Jr/Sr year

  const ranking = calculateHSRanking(life, sport);

  if (!updated.hsAthletics) updated.hsAthletics = {};
  updated.hsAthletics.ranking = ranking;
  updated.hsAthletics.sport = sport;

  const rankingMessages = {
    "5-Star (National Phenom)": [
      `🏆 I was ranked as a 5-STAR ${sport === "basketball" ? "basketball" : "football"} recruit! National media is covering my games.`,
      `🏆 ESPN ranked me as a TOP 10 recruit in the nation! My highlight reels are going viral.`,
    ],
    "4-Star (All-American)": [
      `⭐ I made ALL-AMERICAN status! Major colleges are calling my phone non-stop.`,
      `⭐ I'm a 4-star recruit! College coaches are showing up to every game.`,
    ],
    "3-Star (All-State)": [
      `🎖️ I made ALL-STATE! Regional colleges are reaching out with scholarship offers.`,
      `🎖️ 3-star rating! I'm getting serious interest from D1 programs.`,
    ],
    "2-Star (All-Conference)": [
      `📊 I made ALL-CONFERENCE! Some smaller colleges are interested.`,
      `📊 2-star recruit. I might have a shot at college ${sport}.`,
    ],
    "Unranked": []
  };

  const messages = rankingMessages[ranking];
  if (messages && messages.length > 0) {
    addHistory(updated, randChoice(messages));
    updated.fame = Math.min(100, updated.fame + randInt(5, 20));
  }

  return updated;
}

// ========== COLLEGE RECRUITMENT ==========

export function checkCollegeRecruitment(life) {
  // Must be age 18 (senior year) and team captain
  if (life.age !== 18) return null;

  // Check if team captain in basketball or football
  const basketballExp = life.extracurricularDetails?.basketball?.experience || 0;
  const footballExp = life.extracurricularDetails?.football?.experience || 0;

  const isBasketballCaptain = basketballExp >= 100 && life.extracurriculars?.includes("basketball");
  const isFootballCaptain = footballExp >= 100 && life.extracurriculars?.includes("football");

  if (!isBasketballCaptain && !isFootballCaptain) return null;

  const sport = isBasketballCaptain ? "basketball" : "football";

  // Calculate which tier programs are interested
  const athleticism = life.athleticism || 50;
  const sportExp = life.extracurricularDetails?.[sport]?.experience || 0;
  const influence = life.influence || 0;
  const fame = life.fame || 0;

  const totalScore = athleticism * 2 + sportExp + influence + fame;

  let availableTiers = [];

  if (totalScore >= 400) {
    // 5-star: All tiers available
    availableTiers = ["tier1", "tier2", "tier3"];
  } else if (totalScore >= 320) {
    // 4-star: Tier 1 + Tier 2
    availableTiers = ["tier1", "tier2", "tier3"];
  } else if (totalScore >= 240) {
    // 3-star: Tier 2 + Tier 3
    availableTiers = ["tier2", "tier3"];
  } else if (totalScore >= 160) {
    // 2-star: Tier 3 only
    availableTiers = ["tier3"];
  } else {
    return null; // Not good enough for D1
  }

  return {
    sport,
    availableTiers,
    totalScore
  };
}

export function generateCollegeOffers(life, recruitmentData) {
  const { sport, availableTiers } = recruitmentData;
  const programs = COLLEGE_PROGRAMS[sport];

  const offers = [];

  // Generate 2-4 offers from available tiers
  const numOffers = randInt(2, 4);

  for (let i = 0; i < numOffers; i++) {
    const tier = randChoice(availableTiers);
    const schoolOptions = programs[tier];
    const school = randChoice(schoolOptions);

    // Don't offer same school twice
    if (!offers.find(o => o.name === school.name)) {
      offers.push({
        ...school,
        tier,
        nilAmount: randInt(school.nil[0], school.nil[1])
      });
    }
  }

  return offers;
}

// ========== ACCEPT COLLEGE OFFER ==========

export function acceptCollegeOffer(life, offer) {
  const updated = deepClone(life);

  updated.collegeAthlete = {
    sport: updated.hsAthletics?.sport || "basketball",
    school: offer.name,
    market: offer.market,
    coaching: offer.coaching,
    playingTime: offer.playingTime,
    team: offer.team,
    nilDeal: offer.nilAmount,
    year: 1, // Freshman
    stats: {
      points: 0,
      performance: 50
    },
    injuryHistory: [],
    redshirted: false
  };

  // Set occupation to student-athlete
  updated.occupation = `University Student (${offer.name} ${offer.sport === "basketball" ? "Basketball" : "Football"})`;
  updated.education = "Bachelor's Degree (In Progress)";

  addHistory(updated, `🏀 I committed to ${offer.name}! NIL deal: $${offer.nilAmount.toLocaleString()}/year. Time to compete at the highest level.`);

  updated.fame = Math.min(100, updated.fame + randInt(10, 25));
  updated.happiness = Math.min(100, updated.happiness + randInt(20, 35));

  return updated;
}

// ========== COLLEGE SEASON PROGRESSION ==========

export function progressCollegeSeason(life) {
  const updated = deepClone(life);

  if (!updated.collegeAthlete) return updated;

  const athlete = updated.collegeAthlete;
  const athleticism = updated.athleticism || 50;

  // Calculate season performance
  let seasonPerformance = 50;

  // Coaching impact
  if (athlete.coaching === "elite") seasonPerformance += 15;
  else if (athlete.coaching === "good") seasonPerformance += 8;

  // Playing time impact
  if (athlete.playingTime === "high") seasonPerformance += 10;
  else if (athlete.playingTime === "medium") seasonPerformance += 5;

  // Athleticism impact
  seasonPerformance += Math.floor(athleticism / 5);

  // Random variation
  seasonPerformance += randInt(-10, 20);
  seasonPerformance = Math.max(0, Math.min(100, seasonPerformance));

  athlete.stats.performance = seasonPerformance;

  // NIL income
  updated.money += athlete.nilDeal;

  // Progress to next year
  athlete.year += 1;

  // Season recap
  if (seasonPerformance >= 80) {
    addHistory(updated, `🏆 DOMINANT SEASON at ${athlete.school}! Earned $${athlete.nilDeal.toLocaleString()} from NIL. Draft stock rising.`);
    updated.fame = Math.min(100, updated.fame + randInt(10, 20));
    updated.athleticism = Math.min(100, updated.athleticism + randInt(3, 8));
  } else if (seasonPerformance >= 60) {
    addHistory(updated, `✅ Solid season at ${athlete.school}. Earned $${athlete.nilDeal.toLocaleString()} from NIL. Improving every game.`);
    updated.fame = Math.min(100, updated.fame + randInt(5, 12));
    updated.athleticism = Math.min(100, updated.athleticism + randInt(1, 5));
  } else if (seasonPerformance >= 40) {
    addHistory(updated, `📊 Average season at ${athlete.school}. Earned $${athlete.nilDeal.toLocaleString()} from NIL. Need to step it up.`);
    updated.fame = Math.min(100, updated.fame + randInt(1, 5));
  } else {
    addHistory(updated, `😓 Struggled this season at ${athlete.school}. Earned $${athlete.nilDeal.toLocaleString()} from NIL. Might need to transfer.`);
    updated.stress = Math.min(100, updated.stress + randInt(15, 25));
  }

  // Check for injury (5% chance)
  if (Math.random() < 0.05) {
    const injuries = ["ACL tear", "broken ankle", "shoulder injury", "concussion"];
    const injury = randChoice(injuries);
    athlete.injuryHistory.push({ year: athlete.year, injury });
    addHistory(updated, `🚑 INJURED! I suffered a ${injury}. Season-ending. This is devastating.`);
    updated.health = Math.max(0, updated.health - randInt(20, 40));
    updated.stress = Math.min(100, updated.stress + randInt(30, 50));
  }

  // Draft eligibility check (age 19+ for NBA, 21+ for NFL)
  if (athlete.sport === "basketball" && updated.age >= 19 && athlete.year >= 2) {
    updated.draftEligible = true;
  } else if (athlete.sport === "football" && updated.age >= 21 && athlete.year >= 3) {
    updated.draftEligible = true;
  }

  return updated;
}

// ========== TRANSFER PORTAL ==========

export function enterTransferPortal(life) {
  const updated = deepClone(life);

  if (!updated.collegeAthlete) {
    addHistory(updated, "I'm not a college athlete.");
    return updated;
  }

  updated.inTransferPortal = true;
  addHistory(updated, `📝 I entered the transfer portal. Time to explore new opportunities.`);

  return updated;
}

export function transferToSchool(life, newOffer) {
  const updated = deepClone(life);

  const oldSchool = updated.collegeAthlete.school;

  updated.collegeAthlete.school = newOffer.name;
  updated.collegeAthlete.market = newOffer.market;
  updated.collegeAthlete.coaching = newOffer.coaching;
  updated.collegeAthlete.playingTime = newOffer.playingTime;
  updated.collegeAthlete.team = newOffer.team;
  updated.collegeAthlete.nilDeal = newOffer.nilAmount;

  updated.occupation = `University Student (${newOffer.name} ${updated.collegeAthlete.sport === "basketball" ? "Basketball" : "Football"})`;
  updated.inTransferPortal = false;

  addHistory(updated, `🔄 TRANSFERRED from ${oldSchool} to ${newOffer.name}! New NIL: $${newOffer.nilAmount.toLocaleString()}/year.`);

  updated.fame = Math.min(100, updated.fame + randInt(5, 15));

  return updated;
}

// ========== DRAFT DECISIONS ==========

export function declarForDraft(life) {
  const updated = deepClone(life);

  if (!updated.collegeAthlete || !updated.draftEligible) {
    addHistory(updated, "I'm not eligible for the draft yet.");
    return updated;
  }

  updated.declaredForDraft = true;
  addHistory(updated, `🎯 I declared for the ${updated.collegeAthlete.sport === "basketball" ? "NBA" : "NFL"} Draft! No turning back now.`);

  // This will be handled by special careers system
  return updated;
}

export function stayInCollege(life) {
  const updated = deepClone(life);

  if (!updated.draftEligible) return updated;

  updated.draftEligible = false;
  addHistory(updated, `📚 I decided to stay in college for another year. Education and development first.`);

  updated.happiness = Math.min(100, updated.happiness + randInt(5, 15));

  return updated;
}

// ========== REDSHIRT YEAR ==========

export function redshirt(life) {
  const updated = deepClone(life);

  if (!updated.collegeAthlete || updated.collegeAthlete.redshirted) {
    addHistory(updated, "Already redshirted.");
    return updated;
  }

  updated.collegeAthlete.redshirted = true;
  // Don't increment year
  updated.collegeAthlete.year -= 1;

  addHistory(updated, `🩹 I'm redshirting this year. Extra year of eligibility preserved. Time to heal and develop.`);

  updated.health = Math.min(100, updated.health + randInt(15, 30));
  updated.athleticism = Math.min(100, updated.athleticism + randInt(2, 5));

  return updated;
}
