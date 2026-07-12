// Extracurricular activities domain
// 11.11.2025 - Enhanced activity limits and stress management

import { randInt, deepClone, randChoice } from "../utils/random.js";
import { addHistory } from "../core/gameState.js";

function createActionResult(title, message, changes = [], callout = "") {
  return {
    title,
    message,
    changes,
    callout,
  };
}

const ACTIVITY_LABELS = {
  basketball: "Basketball",
  soccer: "Soccer",
  football: "Football",
  tennis: "Tennis",
  wrestling: "Wrestling",
  band: "Band",
  choir: "Choir",
  mathClub: "Math Club",
  scienceClub: "Science Club",
  studentGov: "Student Government",
};

function getActionBucket(life, activity) {
  if (!life.actionLimits) {
    life.actionLimits = {};
  }

  if (!life.actionLimits.activityActions) {
    life.actionLimits.activityActions = {};
  }

  if (!life.actionLimits.activityActions[activity]) {
    life.actionLimits.activityActions[activity] = {};
  }

  return life.actionLimits.activityActions[activity];
}

export function generateTryout(type) {
  const tryouts = {
    basketball: {
      title: "Try out for the Basketball Team",
      description: "The school basketball team is holding tryouts. Time to show what I've got.",
      activity: "basketball",
      skillRequired: "athleticism",
    },
    soccer: {
      title: "Try out for the Soccer Team",
      description: "The school soccer team is holding tryouts. Conditioning and field vision matter here.",
      activity: "soccer",
      skillRequired: "athleticism",
    },
    football: {
      title: "Try out for the Football Team",
      description: "The school football team is holding tryouts. Let's see if I can make the cut.",
      activity: "football",
      skillRequired: "athleticism",
    },
    tennis: {
      title: "Try out for the Tennis Team",
      description: "The school tennis team is looking for focused, disciplined players.",
      activity: "tennis",
      skillRequired: "athleticism",
    },
    wrestling: {
      title: "Try out for the Wrestling Team",
      description: "The wrestling room is intense. Let's see if I can hold up.",
      activity: "wrestling",
      skillRequired: "athleticism",
    },
    band: {
      title: "Audition for the Band",
      description: "The school band is looking for new members. Time to show my musical talent.",
      activity: "band",
      skillRequired: "musical",
    },
    choir: {
      title: "Audition for the Choir",
      description: "The school choir is holding auditions. Let's see if my voice is good enough.",
      activity: "choir",
      skillRequired: "voice",
    },
    mathClub: {
      title: "Join Math Club",
      description: "The math club is always looking for new members. No tryout needed!",
      activity: "mathClub",
      skillRequired: null,
    },
    scienceClub: {
      title: "Join Science Club",
      description: "The science club welcomes anyone interested in discovery.",
      activity: "scienceClub",
      skillRequired: null,
    },
    studentGov: {
      title: "Join Student Government",
      description: "Student government is looking for passionate leaders.",
      activity: "studentGov",
      skillRequired: null,
    },
  };

  return tryouts[type];
}

const STRESS_VALUES = {
  basketball: 25,
  soccer: 22,
  football: 30,
  tennis: 18,
  wrestling: 24,
  band: 15,
  choir: 10,
  mathClub: 8,
  scienceClub: 10,
  studentGov: 12,
};

export function attemptTryout(life, tryoutData) {
  const updated = deepClone(life);
  let actionResult = null;

  if (!updated.extracurriculars) {
    updated.extracurriculars = [];
  }
  if (!updated.extracurricularDetails) {
    updated.extracurricularDetails = {};
  }

  const { activity, skillRequired } = tryoutData;

  // 11.11.2025 - Updated activity limits: Club+Club+Sport OR Club+Club+Club OR Sport OR Job+Sport OR Job+2Clubs
  const sports = ["basketball", "soccer", "football", "tennis", "wrestling"];
  const currentSports = updated.extracurriculars.filter((a) => sports.includes(a));
  const currentClubs = updated.extracurriculars.filter((a) => !sports.includes(a));
  const isMajorSport = sports.includes(activity);
  const hasJob = updated.partTimeJob !== null && updated.partTimeJob !== undefined;

  // Calculate total commitment load
  const totalActivities = currentSports.length + currentClubs.length;

  // Allowed combinations:
  // - Club + Club + Sport (2 clubs + 1 sport)
  // - Club + Club + Club (3 clubs, no sport)
  // - Sport alone (1 sport)
  // - Job + Sport (job + 1 sport)
  // - Job + 2 Clubs (job + 2 clubs)

  if (hasJob) {
    // With a job, can only do: Sport OR 2 Clubs
    if (isMajorSport && currentSports.length >= 1) {
      addHistory(updated, "I already have a job and a sport. I can't take on another sport!");
      return {
        updated,
        actionResult: createActionResult("Too much on your plate", "A job and a sport are already enough to carry this year.", [], "Something would have to give before adding another major commitment."),
      };
    }
    if (!isMajorSport && currentClubs.length >= 2) {
      addHistory(updated, "I already have a job and 2 clubs. That's all I can handle!");
      return {
        updated,
        actionResult: createActionResult("You hit your limit", "There isn't much room left for another group this year.", [], "The schedule already feels full."),
      };
    }
    if (isMajorSport && currentClubs.length > 0) {
      addHistory(updated, "With a job, I can't do both a sport and clubs. Too much commitment!");
      return {
        updated,
        actionResult: createActionResult("Schedule conflict", "This mix of commitments is already too heavy to stack further.", [], "Work is already cutting into what you can realistically carry."),
      };
    }
    if (!isMajorSport && currentSports.length > 0) {
      addHistory(updated, "With a job and a sport, I can't join clubs. I'm already maxed out!");
      return {
        updated,
        actionResult: createActionResult("Already maxed out", "Between work and your current commitments, there isn't room for another club.", []),
      };
    }
  } else {
    // Without a job, more flexibility
    if (isMajorSport) {
      // Trying to join a sport
      if (currentSports.length >= 1) {
        addHistory(updated, "I can't play 2 major sports at once. Too much commitment!");
        return {
          updated,
          actionResult: createActionResult("One team is enough", "A second major sport would stretch this chapter too thin.", []),
        };
      }
      if (currentClubs.length >= 3) {
        addHistory(updated, "I'm already in 3 clubs. I can't add a sport on top of that!");
        return {
          updated,
          actionResult: createActionResult("No room left", "The calendar is already packed with club commitments.", []),
        };
      }
    } else {
      // Trying to join a club
      if (currentSports.length >= 1 && currentClubs.length >= 2) {
        addHistory(updated, "I already have a sport and 2 clubs. I can't add another club!");
        return {
          updated,
          actionResult: createActionResult("This year is already full", "A sport and two clubs are enough for one chapter.", []),
        };
      }
      if (currentSports.length === 0 && currentClubs.length >= 3) {
        addHistory(updated, "I'm already in 3 clubs. That's my limit without a sport!");
        return {
          updated,
          actionResult: createActionResult("You're at capacity", "Three clubs is already a full schedule for this year.", []),
        };
      }
    }
  }

  // 11.11.2025 - Enhanced stress checking with detailed warnings
  const activityStress = STRESS_VALUES[activity] || 10;
  const totalStress = updated.stress + activityStress;
  const jobStress = hasJob ? 15 : 0; // Jobs add base stress
  const totalCommitmentStress = updated.stress + activityStress + jobStress;

  // Stress-based blocking with detailed feedback
  if (totalStress > 85) {
    const stressWarnings = [
      "I'm way too stressed to take on another commitment. I need to chill out first.",
      "My schedule is already overwhelming. Adding this would break me.",
      "I can barely handle what's on my plate now. This would be too much.",
    ];
    addHistory(updated, randChoice(stressWarnings));
    return {
      updated,
      actionResult: createActionResult("Too overwhelmed to add more", "You wanted to say yes, but the stress load is already too high.", [], "A calmer year would make room for this later."),
    };
  }

  // Warning for high stress (70-85) but allow joining
  if (totalStress > 70) {
    const warnings = [
      "I joined, but my schedule is getting really packed. I need to watch my stress.",
      "This is a lot to handle. I hope I can keep up with everything.",
      "My schedule is overbooked now. I might regret this later.",
    ];
    addHistory(updated, randChoice(warnings));
  }

  // Check if already in this activity
  if (updated.extracurriculars.includes(activity)) {
    addHistory(updated, `I'm already part of ${activity}!`);
    return {
      updated,
      actionResult: createActionResult("Already involved", `You're already part of ${tryoutData.title.replace(/^(Try out for the |Audition for the |Join )/i, "").trim()}.`, []),
    };
  }

  // Handle skill-based tryouts
  if (skillRequired) {
    const skillLevel = updated[skillRequired] || randInt(10, 50);
    const threshold = skillRequired === "athleticism" ? 30 : 20;

    if (skillLevel >= threshold || Math.random() < 0.7) {
      // Success
      updated.extracurriculars.push(activity);
      updated.stress = Math.min(100, updated.stress + activityStress);

      // 11.11.2025 - Enhanced activity details with progress tracking
      updated.extracurricularDetails[activity] = {
        progress: randInt(40, 60), // Renamed from teamPerformance for clarity
        teammates: [],
        position: "Member", // For sports: Member, Starting, Captain. For clubs: Member, Officer, President
      };

      if (activity === "basketball") {
        addHistory(updated, "I tried out for my school's basketball team, and I actually made it onto the team!");
        updated.athleticism = Math.min(100, (updated.athleticism || 40) + randInt(5, 10));
        actionResult = createActionResult("Basketball tryout success", "You made the team and a new commitment just opened up.", ["Joined Basketball", "+Athleticism"], "Team practices and school pressure will now start shaping the story.");
      } else if (activity === "soccer") {
        addHistory(updated, "I tried out for my school's soccer team and made the roster.");
        updated.athleticism = Math.min(100, (updated.athleticism || 40) + randInt(5, 10));
        actionResult = createActionResult("Soccer tryout success", "You made the team and stepped into a faster, more conditioning-heavy school arc.", ["Joined Soccer", "+Athleticism"], "Cardio, sprint work, and teammate moments can now shape the season.");
      } else if (activity === "football") {
        addHistory(updated, "I tried out for my school's football team, and I made the cut!");
        updated.athleticism = Math.min(100, (updated.athleticism || 40) + randInt(5, 10));
        actionResult = createActionResult("Football tryout success", "You made the team and the chapter just got more intense.", ["Joined Football", "+Athleticism"], "Expect coaches, teammates, and bigger physical demands.");
      } else if (activity === "tennis") {
        addHistory(updated, "I tried out for the tennis team and earned a spot.");
        updated.athleticism = Math.min(100, (updated.athleticism || 40) + randInt(4, 8));
        actionResult = createActionResult("Tennis tryout success", "You made the team and added a steadier athletic lane to the year.", ["Joined Tennis", "+Athleticism"]);
      } else if (activity === "wrestling") {
        addHistory(updated, "I tried out for wrestling and made the roster.");
        updated.athleticism = Math.min(100, (updated.athleticism || 40) + randInt(5, 9));
        actionResult = createActionResult("Wrestling tryout success", "You made the team and signed up for a more demanding athletic chapter.", ["Joined Wrestling", "+Athleticism"]);
      } else if (activity === "band") {
        addHistory(updated, "I auditioned for the band and got in! My musical journey begins.");
        updated.musical = Math.min(100, (updated.musical || 30) + randInt(5, 10));
        actionResult = createActionResult("Band audition success", "You got in. Music is now part of how this life moves.", ["Joined Band", "+Musical"], "Practice and group dynamics can now create new story beats.");
      } else if (activity === "choir") {
        addHistory(updated, "I auditioned for choir and made it! My voice has potential.");
        updated.voice = Math.min(100, (updated.voice || 30) + randInt(5, 10));
        actionResult = createActionResult("Choir audition success", "You made it into choir and found a new outlet.", ["Joined Choir", "+Voice"], "This can start opening up social and performance moments.");
      }
    } else {
      // Failure
      if (sports.includes(activity)) {
        addHistory(updated, `I tried out for the ${activity} team but didn't make it. Maybe next year.`);
        actionResult = createActionResult("Tryout missed", `You went for ${ACTIVITY_LABELS[activity] || activity}, but it didn't break your way this year.`, [], "You can always circle back after getting stronger.");
      } else {
        addHistory(updated, `I auditioned for ${activity} but wasn't selected. That stings.`);
        actionResult = createActionResult("Audition missed", "You showed up for it, but the answer was no this time.", [], "A little more work could change the next attempt.");
      }
    }
  } else {
    // Clubs have no tryout
    updated.extracurriculars.push(activity);
    updated.stress = Math.min(100, updated.stress + activityStress);

    // 11.11.2025 - Enhanced activity details with progress tracking
    updated.extracurricularDetails[activity] = {
      progress: randInt(40, 60), // Renamed from teamPerformance
      teammates: [],
      position: "Member", // For clubs: Member, Treasurer, VP, President
    };

    if (activity === "mathClub") {
      addHistory(updated, "I joined the math club. Time to flex those brain muscles.");
      updated.intelligence = Math.min(100, updated.intelligence + randInt(3, 7));
      actionResult = createActionResult("Joined Math Club", "You signed up and gave this year a more academic edge.", ["Joined Math Club", "+Intelligence"]);
    } else if (activity === "scienceClub") {
      addHistory(updated, "I joined the science club. Experimentation awaits.");
      updated.intelligence = Math.min(100, updated.intelligence + randInt(3, 7));
      actionResult = createActionResult("Joined Science Club", "You stepped into a more curious, discovery-driven lane.", ["Joined Science Club", "+Intelligence"]);
    } else if (activity === "studentGov") {
      addHistory(updated, "I joined student government. Politics begins here.");
      updated.leadership = Math.min(100, (updated.leadership || 30) + randInt(5, 10));
      actionResult = createActionResult("Joined Student Government", "You stepped into a more visible role at school.", ["Joined Student Government", "+Leadership"]);
    }
  }

  return {
    updated,
    actionResult,
  };
}

export function practiceActivity(life, activity) {
  const updated = deepClone(life);

  if (!updated.extracurricularDetails || !updated.extracurricularDetails[activity]) {
    return updated;
  }

  const details = updated.extracurricularDetails[activity];
  const performanceGain = randInt(3, 8);
  details.progress = Math.min(100, Number(details.progress || details.teamPerformance || 0) + performanceGain);

  if (["basketball", "soccer", "football", "tennis", "wrestling"].includes(activity)) {
    updated.athleticism = Math.min(100, (updated.athleticism || 40) + randInt(2, 5));
    addHistory(updated, `I practiced hard with the ${activity} team. My skills are improving.`);
  } else if (activity === "band") {
    updated.musical = Math.min(100, (updated.musical || 30) + randInt(2, 5));
    addHistory(updated, "I practiced with the band. My musical abilities are growing.");
  } else if (activity === "choir") {
    updated.voice = Math.min(100, (updated.voice || 30) + randInt(2, 5));
    addHistory(updated, "I practiced with the choir. My voice is getting stronger.");
  } else if (activity === "mathClub") {
    updated.intelligence = Math.min(100, updated.intelligence + randInt(2, 4));
    addHistory(updated, "I worked hard in math club. My analytical skills are sharpening.");
  } else if (activity === "scienceClub") {
    updated.intelligence = Math.min(100, updated.intelligence + randInt(2, 4));
    addHistory(updated, "I dedicated time to science club. My research skills are developing.");
  } else if (activity === "studentGov") {
    updated.leadership = Math.min(100, (updated.leadership || 30) + randInt(2, 5));
    addHistory(updated, "I put in work for student government. My leadership skills are improving.");
  }

  updated.stress = Math.min(100, updated.stress + randInt(3, 8));

  return updated;
}

export function dropActivity(life, activity) {
  const updated = deepClone(life);

  if (updated.extracurriculars) {
    updated.extracurriculars = updated.extracurriculars.filter(a => a !== activity);
  }

  if (updated.extracurricularDetails && updated.extracurricularDetails[activity]) {
    const stressRelief = STRESS_VALUES[activity] || 10;
    updated.stress = Math.max(0, updated.stress - stressRelief);
    delete updated.extracurricularDetails[activity];
  }

  addHistory(updated, `I quit ${activity}. That frees up some time.`);

  return updated;
}

export function generateTeammates(origin, activity, count, gender = "Male") {
  const { getFirstName, getLastName } = require("../config/names.js");
  const { randInt, randChoice } = require("../utils/random.js");

  const teammates = [];
  const lastNameArr = getLastName(origin);

  for (let i = 0; i < count; i++) {
    const genderNames = getFirstName(origin, gender);
    teammates.push({
      id: Date.now() + Math.random() + i,
      firstName: randChoice(genderNames),
      lastName: randChoice(lastNameArr),
      skill: randInt(30, 90),
      bond: randInt(20, 60),
    });
  }

  return teammates;
}

// 11.11.2025 - Activity interaction functions for Occupation view
export function handleActivityAction(life, activity, action) {
  const updated = deepClone(life);
  let actionResult = null;

  if (!updated.extracurriculars.includes(activity)) {
    addHistory(updated, `I'm not part of ${activity}!`);
    return {
      updated,
      actionResult: createActionResult("Not part of that group", "You need to join first before this action makes sense.", []),
    };
  }

  const details = updated.extracurricularDetails[activity];
  if (!details) {
    return { updated, actionResult };
  }

  const actionBucket = getActionBucket(updated, activity);
  const currentCount = actionBucket[action] || 0;
  const maxByAction = {
    practice: 1,
    studyFilm: 1,
    takeItEasy: 1,
    talkToCoach: 1,
    organizeEvent: 1,
  };
  const actionLimit = maxByAction[action] || 1;

  if (currentCount >= actionLimit) {
    addHistory(updated, `I already pushed ${ACTIVITY_LABELS[activity] || activity} in that direction this year. Nothing much shifted.`);
    return {
      updated,
      actionResult: createActionResult(
        "Nothing new came from it",
        "You've already leaned on this same move enough for one year.",
        [],
        "Try a different angle or let another year create new momentum."
      ),
    };
  }

  actionBucket[action] = currentCount + 1;

  const activityNames = {
    basketball: "Basketball Team",
    soccer: "Soccer Team",
    football: "Football Team",
    tennis: "Tennis Team",
    wrestling: "Wrestling Team",
    band: "Band",
    choir: "Choir",
    mathClub: "Math Club",
    scienceClub: "Science Club",
    studentGov: "Student Government",
  };

  const isSport = ["basketball", "soccer", "football", "tennis", "wrestling"].includes(activity);
  const isClub = !isSport;

  switch (action) {
    case "practice": {
      // 11.11.2025 - v1.00.11: Check practice limit (1x per year)
      if ((updated.actionLimits.extracurricularPractice || 0) >= 1) {
        addHistory(updated, `I already worked extra hard this year. I need to pace myself.`);
        return updated;
      }

      // Practice harder - increase progress and athleticism/skills
      const progressGain = randInt(5, 15);
      details.progress = Math.min(100, details.progress + progressGain);
      updated.stress = Math.min(100, updated.stress + randInt(3, 8));
      updated.actionLimits.extracurricularPractice = (updated.actionLimits.extracurricularPractice || 0) + 1;

      if (isSport) {
        updated.athleticism = Math.min(100, (updated.athleticism || 40) + randInt(2, 5));
        const events = [
          `I put in extra practice for ${activityNames[activity]}. My skills are improving!`,
          `I stayed after practice to work on my game. The coach noticed my dedication.`,
          `I pushed myself hard at ${activityNames[activity]} practice. I'm getting better.`,
        ];
        addHistory(updated, randChoice(events));
        actionResult = createActionResult("Extra work paid off", `${activityNames[activity]} got a stronger push this year.`, [`+${progressGain} Progress`, "+Athleticism"]);
      } else {
        updated.intelligence = Math.min(100, updated.intelligence + randInt(1, 4));
        if (activity === "studentGov") {
          updated.influence = Math.min(100, (updated.influence || 0) + randInt(2, 5));
        }
        const events = [
          `I put in extra work for ${activityNames[activity]}. Making progress!`,
          `I dedicated more time to ${activityNames[activity]}. It's paying off.`,
        ];
        addHistory(updated, randChoice(events));
        actionResult = createActionResult("The effort landed", `${activityNames[activity]} is starting to feel more serious.`, [`+${progressGain} Progress`]);
      }
      break;
    }

    case "studyFilm": {
      // 11.11.2025 - Study film for sports - athleticism and intelligence boost
      if (isSport) {
        details.progress = Math.min(100, details.progress + randInt(8, 15));
        updated.athleticism = Math.min(100, (updated.athleticism || 40) + randInt(3, 7));
        updated.intelligence = Math.min(100, updated.intelligence + randInt(2, 4));
        updated.stress = Math.min(100, updated.stress + randInt(2, 5));

        const filmEvents = [
          `I studied game film for hours. My tactical understanding improved dramatically.`,
          `I analyzed plays and learned from the pros. IQ gains unlocked.`,
          `I spent time watching film. My game sense is sharper now.`,
          `The coach showed me film of my performance. I see what I need to improve.`,
        ];
        addHistory(updated, randChoice(filmEvents));
        actionResult = createActionResult("Film study paid off", "You got sharper without taking another physical beating.", ["+Progress", "+Athleticism", "+Intelligence"]);
      }
      break;
    }

    case "takeItEasy": {
      // Take it easy - reduce stress but risk losing progress
      updated.stress = Math.max(0, updated.stress - randInt(5, 10));
      const progressLoss = randInt(3, 10);
      details.progress = Math.max(0, details.progress - progressLoss);

      if (Math.random() < 0.3) {
        // Coach/leader notices
        if (isSport) {
          const warnings = [
            `I slacked off at ${activityNames[activity]} practice. The coach pulled me aside for a talk.`,
            `I didn't give it my all today. My teammates noticed.`,
            `I took it easy at practice. The coach wasn't happy.`,
          ];
          addHistory(updated, randChoice(warnings));
        } else {
          addHistory(updated, `I didn't put in much effort for ${activityNames[activity]} this week. Falling behind.`);
        }
      } else {
        addHistory(updated, `I took it easy with ${activityNames[activity]}. Sometimes you need a break.`);
      }
      actionResult = createActionResult("You eased off a little", "The pressure dropped, but the pace did too.", [`-${progressLoss} Progress`]);
      break;
    }

    case "talkToCoach":
      // Talk to coach/leader
      if (isSport) {
        if (details.progress >= 70) {
          const promotions = [
            `I talked to the coach about getting more playing time. They're considering it!`,
            `The coach praised my improvement. I might be moving up to starting lineup soon.`,
            `I had a good conversation with the coach. They see my potential.`,
          ];
          addHistory(updated, randChoice(promotions));
          details.progress = Math.min(100, details.progress + randInt(3, 8));
          actionResult = createActionResult("That conversation helped", "The coach sees more upside in you now.", ["+Progress"]);
        } else {
          addHistory(updated, `I talked to the coach. They gave me tips on how to improve my game.`);
          details.progress = Math.min(100, details.progress + randInt(1, 5));
          actionResult = createActionResult("You got useful feedback", "The conversation gave you a clearer sense of what to work on.", ["+Progress"]);
        }
      } else {
        if (activity === "studentGov") {
          if (details.progress >= 70 && details.position === "Member") {
            details.position = "Treasurer";
            updated.influence = Math.min(100, (updated.influence || 0) + 10);
            addHistory(updated, `I was promoted to Treasurer in Student Government! More responsibility ahead.`);
            actionResult = createActionResult("Promotion earned", "Student Government trusted you with more responsibility.", ["New position: Treasurer", "+Influence"]);
          } else if (details.progress >= 85 && details.position === "Treasurer") {
            details.position = "Vice President";
            updated.influence = Math.min(100, (updated.influence || 0) + 15);
            addHistory(updated, `I was elected Vice President of Student Government! This is huge.`);
            actionResult = createActionResult("Promotion earned", "You moved into a bigger leadership role at school.", ["New position: Vice President", "+Influence"]);
          } else if (details.progress >= 95 && details.position === "Vice President") {
            details.position = "President";
            updated.influence = Math.min(100, (updated.influence || 0) + 20);
            updated.fame = Math.min(100, updated.fame + 10);
            addHistory(updated, `I'm now President of Student Government! The school looks to me for leadership.`);
            actionResult = createActionResult("Leadership breakthrough", "You reached the top of Student Government.", ["New position: President", "+Influence", "+Fame"]);
          } else {
            addHistory(updated, `I talked to the Student Government advisor. They encouraged me to keep working hard.`);
            actionResult = createActionResult("Advisor check-in", "You got a little guidance and stayed on the radar.", ["+Progress"]);
          }
        } else {
          addHistory(updated, `I talked to the ${activityNames[activity]} leader about my involvement.`);
          details.progress = Math.min(100, details.progress + randInt(2, 6));
          actionResult = createActionResult("Leader check-in", "A quick conversation helped clarify your place in the group.", ["+Progress"]);
        }
      }
      break;

    case "organizeEvent":
      // Student Gov specific - organize school events
      if (activity === "studentGov") {
        const eventGain = randInt(10, 20);
        details.progress = Math.min(100, details.progress + eventGain);
        updated.influence = Math.min(100, (updated.influence || 0) + randInt(5, 10));
        updated.stress = Math.min(100, updated.stress + randInt(5, 12));

        const events = [
          `I organized a school pep rally. It was a huge success!`,
          `I planned a school trip. Everyone had a great time.`,
          `I organized a charity fundraiser for the school. We raised a lot of money!`,
          `I coordinated a school dance. It was the event of the year!`,
        ];
        addHistory(updated, randChoice(events));
        actionResult = createActionResult("You ran the point on something real", "The event boosted your visibility and made the work feel concrete.", ["+Progress", "+Influence"]);
      }
      break;
  }

  return {
    updated,
    actionResult,
  };
}
