// Activities domain - stage-aware actions and popup results

import { randInt, randChoice, deepClone } from "../utils/random.js";
import { addHistory } from "../core/gameState.js";
import { getContentStage } from "../utils/contentStage.js";
import { canRetryDrivingTest, takeDrivingTest } from "./driving.js";

function createActivityResult(title, message, changes = [], callout = "") {
  return {
    title,
    message,
    changes,
    callout,
  };
}

function clamp(value) {
  return Math.max(0, Math.min(100, Number(value || 0)));
}

function changeStat(updated, stat, delta) {
  updated[stat] = clamp(Number(updated[stat] || 0) + delta);
}

function formatDelta(stat, delta) {
  const label = stat.charAt(0).toUpperCase() + stat.slice(1);
  return `${delta > 0 ? "+" : ""}${delta} ${label}`;
}

function applyStatChanges(updated, changes) {
  const labels = [];
  changes.forEach(({ stat, delta }) => {
    changeStat(updated, stat, delta);
    labels.push(formatDelta(stat, delta));
  });
  return labels;
}

function ensureActionLimits(updated) {
  if (!updated.actionLimits) updated.actionLimits = {};
  if (typeof updated.actionLimits.activities !== "number") updated.actionLimits.activities = 0;
  if (!updated.actionLimits.activityImpactCounts) updated.actionLimits.activityImpactCounts = {};
  return updated.actionLimits.activityImpactCounts;
}

function canApplyImpact(updated, type) {
  const bucket = ensureActionLimits(updated);
  return Number(bucket[type] || 0) < 3;
}

function recordImpact(updated, type) {
  const bucket = ensureActionLimits(updated);
  bucket[type] = Number(bucket[type] || 0) + 1;
}

function createNoImpactResult(type) {
  const labels = {
    run: "run",
    long_run: "long run",
    sprint_work: "sprint session",
    cardio: "cardio session",
    weightlift: "lifting session",
    gym: "gym session",
    pray: "prayer routine",
    meditate: "meditation session",
    journal: "journal entry",
    massage: "massage",
    watch_youtube: "video spiral",
    youtube_cooking: "cooking tutorial",
    youtube_funny: "funny video break",
    youtube_fitness: "fitness video",
    learn_skill: "learning sprint",
  };

  return createActivityResult(
    "You still did it",
    `Another ${labels[type] || "routine"} fit the story, but it is not changing your stats much anymore this year.`,
    [],
    "You can keep doing it for flavor, but the real gains from repeating the same move have mostly leveled off for this age."
  );
}

function resultWithCappedImpact(updated, type, title, message, statChanges, historyText, callout = "") {
  if (!canApplyImpact(updated, type)) {
    addHistory(updated, historyText);
    return createNoImpactResult(type);
  }

  const changes = applyStatChanges(updated, statChanges);
  recordImpact(updated, type);
  addHistory(updated, historyText);
  return createActivityResult(title, message, changes, callout);
}

function getParent(updated) {
  return (updated.relationships || []).find((person) => person.relation === "Mother" || person.relation === "Father");
}

function getPetName() {
  return randChoice(["Mochi", "Bean", "Nova", "Pickle", "Sunny", "Blue", "Pepper", "Milo"]);
}

function addPetRelationship(updated) {
  const existingPet = (updated.relationships || []).find((person) => person.relation === "Pet");
  if (existingPet) {
    existingPet.bond = Math.min(100, Number(existingPet.bond || 60) + randInt(5, 12));
    return { name: existingPet.firstName, existing: true };
  }

  const petName = getPetName();
  if (!updated.relationships) updated.relationships = [];
  updated.relationships.push({
    id: `pet-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    firstName: petName,
    lastName: "",
    relation: "Pet",
    age: randInt(0, 6),
    occupation: "Pet",
    bond: randInt(55, 85),
    relationshipStatus: "pet",
  });

  return { name: petName, existing: false };
}

function getActiveSchoolSport(updated) {
  return (updated.extracurriculars || []).find((activity) => ["basketball", "soccer", "football"].includes(activity));
}

function appendSportTraining(updated, actionResult, focus) {
  if (!actionResult?.changes?.length) return;
  const sport = getActiveSchoolSport(updated);
  if (!sport) return;

  if (!updated.extracurricularDetails) updated.extracurricularDetails = {};
  if (!updated.extracurricularDetails[sport]) {
    updated.extracurricularDetails[sport] = { progress: 40, teammates: [], position: "Member" };
  }

  const labels = {
    basketball: "Basketball",
    soccer: "Soccer",
    football: "Football",
  };
  const details = updated.extracurricularDetails[sport];
  const progressGain = focus === "strength" ? randInt(1, 3) : randInt(2, 5);
  const conditioningGain = focus === "endurance" ? randInt(4, 8) : randInt(2, 5);
  details.progress = Math.min(100, Number(details.progress || 0) + progressGain);
  details.conditioning = Math.min(100, Number(details.conditioning || 35) + conditioningGain);
  actionResult.changes.push(`+${progressGain} ${labels[sport]} Progress`);
  actionResult.changes.push(`+${conditioningGain} Conditioning`);
  if (!actionResult.callout) {
    actionResult.callout = `${labels[sport]} conditioning improved because training now feeds school sports.`;
  }
}

function lockResult(label, ageCopy) {
  return createActivityResult(
    "Not available yet",
    `${label} is not on the table in this chapter.`,
    [],
    ageCopy || "This action unlocks later as the life gets more independence."
  );
}

const ACTIVITY_GROUPS = [
  {
    key: "early",
    title: "Early life",
    minAge: 0,
    maxAge: 4,
    actions: [
      { type: "cry_food", label: "Cry for food" },
      { type: "seek_attention", label: "Ask for attention" },
      { type: "babble", label: "Practice babbling" },
      { type: "try_walking", label: "Try walking" },
      { type: "make_mess", label: "Make a mess" },
      { type: "ask_snack", label: "Ask for a snack", minAge: 2 },
      { type: "potty_practice", label: "Practice potty training", minAge: 2 },
      { type: "resist_nap", label: "Resist nap time", minAge: 2 },
    ],
  },
  {
    key: "mindBody",
    title: "Mind and body",
    minAge: 5,
    actions: [
      { type: "run", label: "Go for a run" },
      { type: "long_run", label: "Long run", minAge: 10 },
      { type: "sprint_work", label: "Sprint work", minAge: 10 },
      { type: "cardio", label: "Cardio", minAge: 10 },
      { type: "gym", label: "Go to the gym", minAge: 12 },
      { type: "weightlift", label: "Weightlift", minAge: 14 },
      { type: "recovery_walk", label: "Take a recovery walk" },
      { type: "pray", label: "Pray" },
      { type: "meditate", label: "Meditate" },
      { type: "journal", label: "Journal" },
      { type: "doctor_checkup", label: "Go to a checkup", minAge: 18 },
      { type: "health_kick", label: "Start a health kick", minAge: 60 },
      { type: "massage", label: "Get a massage", minAge: 18, modal: "massage" },
    ],
  },
  {
    key: "mind",
    title: "Mind",
    minAge: 5,
    actions: [
      { type: "watch_youtube", label: "Watch YouTube" },
      { type: "youtube_cooking", label: "Cooking tutorial" },
      { type: "youtube_funny", label: "Funny video compilation" },
      { type: "youtube_fitness", label: "Fitness video" },
      { type: "watch_tv", label: "Watch TV" },
      { type: "learn_skill", label: "Learn something new" },
      { type: "daydream_future", label: "Daydream about the future" },
      { type: "legacy_reflection", label: "Reflect on your legacy", minAge: 60 },
    ],
  },
  {
    key: "shopping",
    title: "Shopping",
    minAge: 8,
    actions: [
      { type: "shop_outfit", label: "Buy a new outfit" },
      { type: "browse_car", label: "Shop for a car", minAge: 15 },
      { type: "driving_test_retry", label: "Take driving test", minAge: 16 },
      { type: "adopt_pet", label: "Look for a pet", minAge: 8 },
      { type: "browse_home", label: "Look at homes", minAge: 18 },
      { type: "downsize_home", label: "Consider downsizing", minAge: 60 },
    ],
  },
  {
    key: "cosmetics",
    title: "Cosmetic enhancements",
    minAge: 18,
    actions: [
      { type: "cosmetic_consult", label: "See a cosmetic doctor" },
      { type: "cosmetic_botox", label: "Get botox ($500)" },
      { type: "cosmetic_lipfiller", label: "Get lip filler ($600)" },
      { type: "cosmetic_tummytuck", label: "Get a tummy tuck ($8,000)" },
      { type: "cosmetic_ozempic", label: "Get on a GLP-1 ($1,200)" },
      { type: "cosmetic_plasticsurgery", label: "Get plastic surgery ($15,000)" },
    ],
  },
];

export function getActivityGroups(life) {
  const age = Number(life?.age || 0);

  return ACTIVITY_GROUPS
    .filter((group) => age >= Number(group.minAge || 0) && (group.maxAge == null || age <= group.maxAge))
    .map((group) => ({
      ...group,
      actions: group.actions.filter((action) => {
        if (action.type === "driving_test_retry" && life?.licenses?.drivers) return false;
        return age >= Number(action.minAge || 0) && (action.maxAge == null || age <= action.maxAge);
      }),
    }))
    .filter((group) => group.actions.length);
}

export function handleActivity(life, type, customPrice) {
  const updated = deepClone(life);
  ensureActionLimits(updated);

  let actionResult = null;
  const age = Number(updated.age || 0);
  const stage = getContentStage(age);

  switch (type) {
    case "cry_food": {
      const parent = getParent(updated);
      const fed = Math.random() < 0.85 || Number(updated.happiness || 0) < 45;
      if (fed) {
        if (parent) parent.bond = Math.min(100, Number(parent.bond || 60) + randInt(2, 5));
        actionResult = resultWithCappedImpact(
          updated,
          type,
          "Needs met",
          parent ? `${parent.firstName} figured out what you needed and fed you.` : "Someone finally figured out what you needed.",
          [
            { stat: "happiness", delta: randInt(3, 7) },
            { stat: "stress", delta: -randInt(1, 4) },
          ],
          parent ? `I cried for food, and ${parent.firstName} fed me.` : "I cried for food and got fed."
        );
      } else {
        actionResult = resultWithCappedImpact(
          updated,
          type,
          "Still hungry",
          "The message did not land right away, and the room got louder before it got better.",
          [
            { stat: "happiness", delta: -randInt(2, 5) },
            { stat: "stress", delta: randInt(2, 6) },
          ],
          "I cried for food, but nobody understood me right away."
        );
      }
      break;
    }

    case "seek_attention": {
      const parent = getParent(updated);
      if (parent) parent.bond = Math.min(100, Number(parent.bond || 60) + randInt(2, 6));
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "Attention secured",
        parent ? `${parent.firstName} gave you the kind of attention that made the world feel smaller and safer.` : "You got held, rocked, and noticed.",
        [
          { stat: "happiness", delta: randInt(4, 9) },
          { stat: "stress", delta: -randInt(1, 4) },
        ],
        parent ? `I reached for ${parent.firstName}, and they held me close.` : "I asked for attention in the only way I knew how."
      );
      break;
    }

    case "babble": {
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "Tiny conversation",
        randChoice([
          "You made a string of sounds that almost sounded intentional.",
          "The babble got dramatic enough that everyone treated it like a speech.",
          "You practiced sounds until one of them started feeling repeatable.",
        ]),
        [
          { stat: "intelligence", delta: randInt(1, 3) },
          { stat: "happiness", delta: randInt(1, 4) },
        ],
        "I practiced babbling. The room acted like I had made a major announcement."
      );
      break;
    }

    case "try_walking": {
      const stumble = Math.random() < 0.25;
      actionResult = resultWithCappedImpact(
        updated,
        type,
        stumble ? "Almost had it" : "A brave attempt",
        stumble ? "You tried to move like a person with places to be, then folded back onto the floor." : "You balanced for a second longer than expected. Everyone noticed.",
        [
          { stat: "athleticism", delta: stumble ? 1 : randInt(2, 4) },
          { stat: "happiness", delta: stumble ? -1 : randInt(2, 6) },
          { stat: "health", delta: stumble ? -1 : 1 },
        ],
        stumble ? "I tried walking and immediately sat down with authority." : "I practiced walking. The room went quiet, then exploded."
      );
      break;
    }

    case "make_mess": {
      const parent = getParent(updated);
      if (parent) parent.bond = Math.max(0, Number(parent.bond || 60) - randInt(1, 3));
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "A creative disaster",
        "Something spilled, something smeared, and somehow you looked proud of the whole scene.",
        [
          { stat: "happiness", delta: randInt(2, 6) },
          { stat: "intelligence", delta: 1 },
        ],
        "I made a mess and learned that cause and effect can be very entertaining.",
        parent ? `${parent.firstName} was not thrilled, but the discovery felt important.` : ""
      );
      break;
    }

    case "ask_snack": {
      const parent = getParent(updated);
      const success = Math.random() < 0.72;
      if (parent) parent.bond = Math.min(100, Number(parent.bond || 60) + (success ? 2 : -1));
      actionResult = resultWithCappedImpact(
        updated,
        type,
        success ? "Snack approved" : "Snack denied",
        success ? "The snack request worked. Negotiation entered the story early." : "The snack request was denied with insulting confidence.",
        [
          { stat: "happiness", delta: success ? randInt(3, 7) : -randInt(1, 4) },
          { stat: "stress", delta: success ? -1 : randInt(1, 3) },
        ],
        success ? "I asked for a snack and got one." : "I asked for a snack and was told dinner was soon."
      );
      break;
    }

    case "potty_practice": {
      const success = Math.random() < 0.58;
      actionResult = resultWithCappedImpact(
        updated,
        type,
        success ? "Potty eureka" : "Practice round",
        success ? "The timing finally clicked. Everyone acted like you had solved a household mystery." : "The attempt was not clean, but the routine is starting to make more sense.",
        [
          { stat: "intelligence", delta: success ? randInt(2, 4) : 1 },
          { stat: "happiness", delta: success ? randInt(3, 7) : -1 },
          { stat: "stress", delta: success ? -randInt(1, 3) : randInt(1, 3) },
        ],
        success ? "I had a potty-training breakthrough." : "Potty training stayed complicated today."
      );
      break;
    }

    case "resist_nap": {
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "Nap rebellion",
        "You fought sleep like it owed you money, then got overtired enough to regret the victory.",
        [
          { stat: "happiness", delta: randInt(1, 4) },
          { stat: "stress", delta: randInt(2, 5) },
        ],
        "I resisted nap time. Nobody truly won."
      );
      break;
    }

    case "run": {
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "Run complete",
        "You got your body moving and cleared your head a little.",
        [
          { stat: "health", delta: randInt(1, 3) },
          { stat: "stress", delta: -randInt(2, 5) },
        ],
        "I went for a run. Endorphins flooded in."
      );
      appendSportTraining(updated, actionResult, "endurance");
      break;
    }

    case "long_run": {
      const injury = Math.random() < 0.04 && Number(updated.health || 100) < 45;
      actionResult = resultWithCappedImpact(
        updated,
        type,
        injury ? "Run cut short" : "Long run complete",
        injury ? "You pushed too far and came home with a sore knee. Nothing dramatic, just annoying." : "The miles stacked up and your head felt clearer by the end.",
        [
          { stat: "health", delta: injury ? -2 : randInt(2, 4) },
          { stat: "athleticism", delta: injury ? 0 : randInt(1, 3) },
          { stat: "stress", delta: injury ? 1 : -randInt(3, 7) },
        ],
        injury ? "I pushed a long run too hard and had to ease up." : "I went for a long run and found a steadier rhythm.",
        "Minor exercise injuries are rare and usually stay small unless health is already low."
      );
      if (!injury) appendSportTraining(updated, actionResult, "endurance");
      break;
    }

    case "sprint_work": {
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "Sprint work done",
        "Short bursts, burning lungs, and a little proof that effort can feel sharp instead of endless.",
        [
          { stat: "athleticism", delta: randInt(2, 5) },
          { stat: "health", delta: randInt(1, 2) },
          { stat: "stress", delta: randInt(0, 2) },
        ],
        "I did sprint work. It was brutal in a useful way."
      );
      appendSportTraining(updated, actionResult, "speed");
      break;
    }

    case "cardio": {
      const strain = Math.random() < 0.03 && Number(updated.health || 100) < 50;
      actionResult = resultWithCappedImpact(
        updated,
        type,
        strain ? "Cardio backed off" : "Cardio complete",
        strain ? "You felt a minor strain and cut the session short before it became a problem." : "The steady work improved your engine without turning the day into drama.",
        [
          { stat: "health", delta: strain ? -1 : randInt(1, 3) },
          { stat: "athleticism", delta: strain ? 0 : randInt(1, 3) },
          { stat: "stress", delta: strain ? 1 : -randInt(1, 4) },
        ],
        strain ? "I cut cardio short after a minor strain." : "I did cardio and built a little more endurance.",
        "Minor strains stay rare and non-derailing."
      );
      if (!strain) appendSportTraining(updated, actionResult, "endurance");
      break;
    }

    case "gym": {
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "Gym session finished",
        "The work felt worth it. Your body and confidence both got a lift.",
        [
          { stat: "health", delta: randInt(2, 5) },
          { stat: "attractiveness", delta: randInt(1, 2) },
          { stat: "stress", delta: -randInt(3, 7) },
        ],
        "I went to the gym. Gains acquired."
      );
      appendSportTraining(updated, actionResult, "strength");
      break;
    }

    case "weightlift": {
      const tweak = Math.random() < 0.05 && Number(updated.health || 100) < 55;
      actionResult = resultWithCappedImpact(
        updated,
        type,
        tweak ? "Form check needed" : "Weights moved",
        tweak ? "You tweaked something and had to back off. It felt like a warning, not a catastrophe." : "The session made you feel sturdier, more focused, and a little harder to shake.",
        [
          { stat: "athleticism", delta: tweak ? 1 : randInt(2, 4) },
          { stat: "health", delta: tweak ? -2 : randInt(1, 3) },
          { stat: "attractiveness", delta: tweak ? 0 : 1 },
          { stat: "stress", delta: tweak ? 2 : -randInt(1, 4) },
        ],
        tweak ? "I lifted weights with bad form and felt it later." : "I lifted weights and felt stronger leaving than arriving."
      );
      if (!tweak) appendSportTraining(updated, actionResult, "strength");
      break;
    }

    case "recovery_walk": {
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "Walk complete",
        "No grand transformation, just fresh air and a little distance from the noise.",
        [
          { stat: "health", delta: 1 },
          { stat: "happiness", delta: randInt(1, 4) },
          { stat: "stress", delta: -randInt(2, 6) },
        ],
        "I took a quiet walk and reset a little."
      );
      break;
    }

    case "pray": {
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "A calmer moment",
        "You gave yourself a little spiritual breathing room.",
        [
          { stat: "happiness", delta: randInt(5, 10) },
          { stat: "stress", delta: -randInt(3, 8) },
        ],
        "I prayed. Peace had a little room to land."
      );
      break;
    }

    case "meditate": {
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "Meditation helped",
        "You slowed the noise down and found a little balance.",
        [
          { stat: "happiness", delta: randInt(3, 6) },
          { stat: "stress", delta: -randInt(5, 10) },
        ],
        "I meditated. Inner peace located."
      );
      break;
    }

    case "journal": {
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "Thoughts organized",
        "The page did not solve everything, but it made the story feel less tangled.",
        [
          { stat: "intelligence", delta: randInt(1, 3) },
          { stat: "stress", delta: -randInt(2, 6) },
          { stat: "happiness", delta: randInt(0, 3) },
        ],
        "I journaled and made sense of the year in my own words."
      );
      break;
    }

    case "doctor_checkup": {
      if (age < 18) {
        actionResult = lockResult("Doctor visits", "Adult checkups unlock at 18. Childhood health moments happen through family and yearly events.");
        break;
      }
      const cost = randInt(80, 180);
      if (updated.money < cost) {
        addHistory(updated, "I thought about a checkup but could not afford it.");
        actionResult = createActivityResult("Checkup delayed", "The appointment made sense, but the money was not there.", [], "Healthcare choices stay light in this pass and will expand later.");
        break;
      }
      updated.money -= cost;
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "Checkup complete",
        "Nothing dramatic came out of it, which was the best possible outcome.",
        [
          { stat: "health", delta: randInt(2, 5) },
          { stat: "stress", delta: -randInt(1, 4) },
        ],
        `I went to a checkup and paid $${cost}.`
      );
      actionResult.changes.unshift(`-$${cost}`);
      break;
    }

    case "health_kick": {
      if (age < 60) {
        actionResult = lockResult("Health kick", "This version is tuned for elder chapters. Younger lives can use exercise and recovery actions.");
        break;
      }
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "Health kick started",
        "You decided the next chapter should still have movement in it.",
        [
          { stat: "health", delta: randInt(3, 7) },
          { stat: "athleticism", delta: randInt(1, 3) },
          { stat: "stress", delta: -randInt(2, 5) },
        ],
        "I started taking my health seriously again."
      );
      break;
    }

    case "massage": {
      const cost = customPrice || randInt(50, 105);
      if (age < 18) {
        actionResult = lockResult("Massage", "Massages unlock at 18. Younger chapters have simpler recovery actions.");
      } else if (updated.money >= cost) {
        updated.money -= cost;
        actionResult = resultWithCappedImpact(
          updated,
          type,
          "Massage booked",
          "The session left you looser, lighter, and a little happier.",
          [
            { stat: "happiness", delta: randInt(10, 15) },
            { stat: "stress", delta: -randInt(10, 20) },
          ],
          `I got a massage for $${cost}. Blissful relaxation achieved.`
        );
        actionResult.changes.unshift(`-$${cost}`);
      } else {
        actionResult = createActivityResult("Couldn't book it", "The massage sounded great, but the money wasn't there.", [], "You need a little more cash before this kind of reset is on the table.");
        addHistory(updated, "I tried to get a massage but couldn't afford it.");
      }
      break;
    }

    case "watch_youtube":
    case "youtube_cooking":
    case "youtube_funny":
    case "youtube_fitness":
    case "watch_tv": {
      const configs = {
        watch_youtube: {
          title: "Algorithm spiral",
          message: "One video became several. Some of it was useful, some of it was just noise.",
          changes: [
            { stat: "happiness", delta: randInt(1, 4) },
            { stat: "stress", delta: -randInt(0, 3) },
          ],
          history: "I watched videos online and lost track of time.",
        },
        youtube_cooking: {
          title: "Cooking tutorial watched",
          message: "The recipe looked possible enough that future-you might actually try it.",
          changes: [
            { stat: "intelligence", delta: randInt(1, 3) },
            { stat: "happiness", delta: randInt(1, 3) },
          ],
          history: "I watched a cooking tutorial and learned a small kitchen trick.",
        },
        youtube_funny: {
          title: "Mood lifted",
          message: "The compilation was dumb in exactly the right way.",
          changes: [
            { stat: "happiness", delta: randInt(3, 7) },
            { stat: "stress", delta: -randInt(1, 5) },
          ],
          history: "I watched funny videos and laughed harder than expected.",
        },
        youtube_fitness: {
          title: "Fitness rabbit hole",
          message: "You watched enough form breakdowns to feel slightly more capable.",
          changes: [
            { stat: "athleticism", delta: randInt(1, 3) },
            { stat: "intelligence", delta: 1 },
          ],
          history: "I watched fitness videos and picked up a few training ideas.",
        },
        watch_tv: {
          title: "TV break",
          message: "You let someone else's drama carry the hour for a while.",
          changes: [
            { stat: "happiness", delta: randInt(1, 5) },
            { stat: "stress", delta: -randInt(1, 4) },
          ],
          history: "I watched TV and checked out for a bit.",
        },
      };
      const config = configs[type];
      actionResult = resultWithCappedImpact(updated, type, config.title, config.message, config.changes, config.history);
      break;
    }

    case "learn_skill": {
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "Skill seed planted",
        "You picked a topic and stayed with it long enough for the first little click to happen.",
        [
          { stat: "intelligence", delta: randInt(2, 5) },
          { stat: "happiness", delta: randInt(1, 3) },
          { stat: "stress", delta: randInt(0, 2) },
        ],
        "I learned something new on purpose."
      );
      break;
    }

    case "daydream_future": {
      const dreams = age < 12
        ? ["artist", "scientist", "athlete", "detective", "teacher", "singer"]
        : ["doctor", "politician", "designer", "founder", "performer", "detective", "quiet rich person"];
      const dream = randChoice(dreams);
      if (!updated.careerDaydreams) updated.careerDaydreams = {};
      updated.careerDaydreams[dream] = Number(updated.careerDaydreams[dream] || 0) + 1;
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "Future imagined",
        `For a minute, being a ${dream} felt weirdly possible.`,
        [
          { stat: "happiness", delta: randInt(2, 6) },
          { stat: "intelligence", delta: 1 },
        ],
        `I daydreamed about becoming a ${dream}.`
      );
      break;
    }

    case "legacy_reflection": {
      if (age < 60) {
        actionResult = lockResult("Legacy reflection", "This reflection unlocks in elder chapters.");
        break;
      }
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "Legacy considered",
        "You looked back without fully deciding whether the story made sense yet.",
        [
          { stat: "happiness", delta: randInt(1, 5) },
          { stat: "stress", delta: -randInt(1, 5) },
          { stat: "intelligence", delta: randInt(1, 2) },
        ],
        "I thought about what this life is leaving behind."
      );
      break;
    }

    case "shop_outfit": {
      const cost = age < 18 ? randInt(25, 80) : randInt(80, 240);
      if (updated.money < cost) {
        actionResult = createActivityResult("Outfit stayed on the rack", "You found something that fit the fantasy, but the cash did not match.", [], "Wardrobe inventory comes later; for now this is a style and story beat.");
        addHistory(updated, "I wanted a new outfit but couldn't afford it.");
        break;
      }
      updated.money -= cost;
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "New outfit energy",
        "The look changed how you carried yourself for the rest of the day.",
        [
          { stat: "attractiveness", delta: randInt(2, 5) },
          { stat: "happiness", delta: randInt(2, 6) },
        ],
        `I bought a new outfit for $${cost}.`
      );
      actionResult.changes.unshift(`-$${cost}`);
      break;
    }

    case "browse_car": {
      if (age < 15) {
        actionResult = lockResult("Car shopping", "Car browsing unlocks around the teen years.");
        break;
      }
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "Car fantasy unlocked",
        "You browsed listings and quietly started picturing a version of life with keys in hand.",
        [
          { stat: "happiness", delta: randInt(1, 4) },
          { stat: "stress", delta: randInt(0, 2) },
        ],
        "I browsed cars and imagined the freedom."
      );
      break;
    }

    case "driving_test_retry": {
      if (!canRetryDrivingTest(updated)) {
        actionResult = updated.licenses?.drivers
          ? createActivityResult("Already licensed", "You already have a driver's license.")
          : lockResult("Driving test", "Driving tests unlock at 16.");
        break;
      }
      const result = takeDrivingTest(updated);
      Object.assign(updated, result.updated);
      actionResult = result.actionResult;
      break;
    }

    case "adopt_pet": {
      if (age < 8) {
        actionResult = lockResult("Pet search", "Pet hooks start around childhood, when the relationship can mean more in the story.");
        break;
      }
      const cost = age < 18 ? 0 : randInt(50, 250);
      if (cost && updated.money < cost) {
        actionResult = createActivityResult("Pet search paused", "The idea was sweet, but the setup costs were not there yet.", [], "Pets are lightweight relationship hooks in this pass.");
        addHistory(updated, "I looked for a pet but couldn't make it happen yet.");
        break;
      }
      if (cost) updated.money -= cost;
      const pet = addPetRelationship(updated);
      actionResult = createActivityResult(
        pet.existing ? "Pet time" : "Pet joined the story",
        pet.existing ? `${pet.name} got extra attention and seemed thrilled about it.` : `${pet.name} is now part of the household orbit.`,
        [cost ? `-$${cost}` : null, "+Pet Bond"].filter(Boolean),
        "Pets are simple relationship entries for now. A full pet-care system can build on this later."
      );
      addHistory(updated, pet.existing ? `I spent time with ${pet.name}.` : `I brought home a pet named ${pet.name}.`);
      break;
    }

    case "browse_home": {
      if (age < 18) {
        actionResult = lockResult("Homes", "Home shopping unlocks in adulthood.");
        break;
      }
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "Home boards opened",
        "You looked at places you could not quite afford yet and a few you might one day reach.",
        [
          { stat: "happiness", delta: randInt(1, 4) },
          { stat: "stress", delta: randInt(1, 4) },
          { stat: "intelligence", delta: 1 },
        ],
        "I looked at homes and started imagining a bigger life.",
        "Full housing ownership is still a future system."
      );
      break;
    }

    case "downsize_home": {
      if (age < 60) {
        actionResult = lockResult("Downsizing", "This choice is meant for elder chapters.");
        break;
      }
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "A simpler setup",
        "You considered what life would feel like with fewer rooms, fewer things, and less upkeep.",
        [
          { stat: "stress", delta: -randInt(2, 6) },
          { stat: "happiness", delta: randInt(0, 3) },
        ],
        "I thought about downsizing and making life simpler."
      );
      break;
    }

    case "cosmetic_consult": {
      if (age < 18) {
        actionResult = lockResult("Cosmetic consults", "Cosmetic medical choices unlock at 18+.");
        break;
      }
      const cost = randInt(100, 250);
      if (updated.money < cost) {
        actionResult = createActivityResult("Consult delayed", "The appointment sounded interesting, but the money said no.", [], "Cosmetic choices are simplified game fiction, not advice.");
        addHistory(updated, "I considered a cosmetic consultation but couldn't afford it.");
        break;
      }
      updated.money -= cost;
      actionResult = resultWithCappedImpact(
        updated,
        type,
        "Options discussed",
        "The consult gave you possibilities without forcing a decision today.",
        [
          { stat: "happiness", delta: randInt(1, 4) },
          { stat: "stress", delta: randInt(0, 3) },
        ],
        `I paid $${cost} for a cosmetic consultation.`,
        "This stays non-graphic and choice-driven."
      );
      actionResult.changes.unshift(`-$${cost}`);
      break;
    }

    case "cosmetic_botox": {
      if (age < 18) {
        actionResult = lockResult("Botox", "Cosmetic procedures unlock at 18+.");
      } else if (updated.money >= 500) {
        const gain = randInt(3, 7);
        updated.money -= 500;
        updated.attractiveness = Math.min(100, Number(updated.attractiveness || 0) + gain);
        actionResult = createActivityResult("Fresh touch-up", "You made the appointment and liked the result.", ["-$500", `+${gain} Attractiveness`], "Cosmetic choices are simplified game fiction, not advice.");
        addHistory(updated, "I got botox. A subtle touch-up changed the mirror a little.");
      } else {
        actionResult = createActivityResult("Not enough money", "Botox was on the list, but your wallet shut the idea down.");
        addHistory(updated, "I tried to get botox but couldn't afford it.");
      }
      break;
    }

    case "cosmetic_lipfiller": {
      if (age < 18) {
        actionResult = lockResult("Lip filler", "Cosmetic procedures unlock at 18+.");
      } else if (updated.money >= 600) {
        const gain = randInt(2, 5);
        updated.money -= 600;
        updated.attractiveness = Math.min(100, Number(updated.attractiveness || 0) + gain);
        actionResult = createActivityResult("Appointment done", "The result made your look feel a little more intentional.", ["-$600", `+${gain} Attractiveness`], "Cosmetic choices are simplified game fiction, not advice.");
        addHistory(updated, "I got lip filler. The look shifted.");
      } else {
        actionResult = createActivityResult("Not enough money", "The appointment had to wait.");
        addHistory(updated, "I tried to get lip filler but couldn't afford it.");
      }
      break;
    }

    case "cosmetic_tummytuck": {
      if (age < 18) {
        actionResult = lockResult("Tummy tuck", "Cosmetic procedures unlock at 18+.");
      } else if (updated.money >= 8000) {
        const gain = randInt(5, 10);
        updated.money -= 8000;
        updated.attractiveness = Math.min(100, Number(updated.attractiveness || 0) + gain);
        updated.stress = Math.min(100, Number(updated.stress || 0) + randInt(3, 8));
        actionResult = createActivityResult("Recovery begins", "The procedure changed your silhouette and gave the year a recovery arc.", ["-$8,000", `+${gain} Attractiveness`, "+Stress"], "Cosmetic choices are simplified game fiction, not advice.");
        addHistory(updated, "I got a tummy tuck. Recovery became part of the chapter.");
      } else {
        actionResult = createActivityResult("Not enough money", "The idea stayed out of reach financially.");
        addHistory(updated, "I tried to get a tummy tuck but couldn't afford it.");
      }
      break;
    }

    case "cosmetic_ozempic": {
      if (age < 18) {
        actionResult = lockResult("GLP-1", "GLP-1 cosmetic/weight-loss choices unlock at 18+ in this game.");
      } else if (updated.money >= 1200) {
        const attractivenessGain = randInt(4, 8);
        const healthShift = Math.random() < 0.6 ? randInt(0, 2) : -randInt(2, 5);
        updated.money -= 1200;
        updated.attractiveness = Math.min(100, Number(updated.attractiveness || 0) + attractivenessGain);
        updated.health = clamp(Number(updated.health || 0) + healthShift);
        actionResult = createActivityResult(
          "Prescription started",
          "The change was not instant, but it started shaping how you felt in your body.",
          ["-$1,200", `+${attractivenessGain} Attractiveness`, formatDelta("Health", healthShift)],
          "Cosmetic and medical choices are simplified game fiction, not advice."
        );
        addHistory(updated, "I got on a GLP-1. My body story shifted.");
      } else {
        actionResult = createActivityResult("Not enough money", "The prescription stayed out of reach financially.");
        addHistory(updated, "I tried to get on a GLP-1 but couldn't afford it.");
      }
      break;
    }

    case "cosmetic_plasticsurgery": {
      if (age < 18) {
        actionResult = lockResult("Plastic surgery", "Cosmetic procedures unlock at 18+.");
      } else if (updated.money >= 15000) {
        const gain = randInt(10, 20);
        updated.money -= 15000;
        updated.attractiveness = Math.min(100, Number(updated.attractiveness || 0) + gain);
        updated.stress = Math.min(100, Number(updated.stress || 0) + randInt(8, 15));
        actionResult = createActivityResult("Transformation complete", "The decision was expensive, visible, and emotionally louder than expected.", ["-$15,000", `+${gain} Attractiveness`, "+Stress"], "Cosmetic choices are simplified game fiction, not advice.");
        addHistory(updated, "I got plastic surgery. The mirror changed in a major way.");
      } else {
        actionResult = createActivityResult("Not enough money", "The transformation stayed in the fantasy folder.");
        addHistory(updated, "I tried to get plastic surgery but couldn't afford it.");
      }
      break;
    }

    default:
      actionResult = createActivityResult("Nothing happened", "That action is not wired into this chapter yet.", [], `Stage: ${stage}`);
      break;
  }

  return {
    updated,
    actionResult,
  };
}
