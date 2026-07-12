// Relationships domain - social interactions, branches, and bonds

import { randInt, randChoice, deepClone } from "../utils/random.js";
import { addHistory } from "../core/gameState.js";
import { addStudyMomentum, applyGradeDelta } from "./schoolProgress.js";
import { ensureDrivingState } from "./driving.js";

const familyActivities = {
  Mother: [
    "went to the movies",
    "took me to the mall",
    "cooked dinner together",
    "went for a walk in the park",
    "had a heart-to-heart talk",
  ],
  Father: [
    "went to the movies",
    "taught me how to fix something around the house",
    "went for a walk",
    "played basketball together",
    "grilled dinner in the backyard",
  ],
  "Younger Sibling": [
    "played video games together",
    "went to the park",
    "watched cartoons together",
    "built a blanket fort",
  ],
  Sibling: [
    "played video games together",
    "went to the park",
    "watched cartoons together",
    "built a blanket fort",
  ],
};

export const ROMANCE_STATES = [
  "crush",
  "romantic-interest",
  "hookup",
  "talking",
  "fwb",
  "dating",
  "committed",
  "engaged",
  "married",
  "affair",
  "ex",
];

export const DATING_APP_BRANDS = ["Fringe", "Findr"];

function clampStat(value) {
  return Math.max(0, Math.min(100, Number(value || 0)));
}

function changeStat(updated, stat, delta) {
  updated[stat] = clampStat(Number(updated[stat] || 0) + delta);
}

function formatDelta(label, delta) {
  return `${delta > 0 ? "+" : ""}${delta} ${label}`;
}

function ensureRelationshipMeta(person) {
  if (!person.relationshipMeta) {
    person.relationshipMeta = {
      romanceState: null,
      romanceHistory: [],
      channels: [],
    };
  }

  if (!person.relationshipMeta.romanceHistory) {
    person.relationshipMeta.romanceHistory = [];
  }
  if (!person.relationshipMeta.channels) {
    person.relationshipMeta.channels = [];
  }

  return person.relationshipMeta;
}

function setRomanceState(person, romanceState) {
  const meta = ensureRelationshipMeta(person);
  meta.romanceState = romanceState;
  if (!meta.romanceHistory.includes(romanceState)) {
    meta.romanceHistory.push(romanceState);
  }
}

function createActionResult({ title, person, message, changes = [], callout = null }) {
  return {
    title,
    name: person ? `${person.firstName} ${person.lastName || ""}`.trim() : null,
    message,
    changes,
    callout,
  };
}

function ensureActionLimits(updated) {
  if (!updated.actionLimits) updated.actionLimits = {};
  if (!updated.actionLimits.relationshipInteractions) updated.actionLimits.relationshipInteractions = {};
  return updated.actionLimits.relationshipInteractions;
}

function getInteractionCount(updated, key) {
  return Number(ensureActionLimits(updated)[key] || 0);
}

function incrementInteraction(updated, key) {
  const bucket = ensureActionLimits(updated);
  bucket[key] = Number(bucket[key] || 0) + 1;
}

function isParent(person) {
  return person?.relation === "Mother" || person?.relation === "Father";
}

function isFamily(person) {
  return isParent(person) || String(person?.relation || "").includes("Sibling") || person?.relationshipStatus === "family";
}

function isRomantic(person) {
  return ["dating", "engaged", "married", "committed", "talking", "romantic-interest"].includes(person?.relationshipStatus);
}

function applyBond(person, delta) {
  person.bond = clampStat(Number(person.bond || 0) + delta);
  return delta;
}

function applyStats(updated, statChanges) {
  return statChanges.map(({ stat, label, delta }) => {
    changeStat(updated, stat, delta);
    return formatDelta(label, delta);
  });
}

function findPerson(updated, selectedPerson) {
  const id = selectedPerson?.id;
  if (!id) return selectedPerson ? { ...selectedPerson } : null;

  const directPools = [
    updated.relationships,
    updated.classmates,
    updated.fullTimeJob?.coworkers,
    updated.fullTimeJob?.manager ? [updated.fullTimeJob.manager] : null,
  ].filter(Boolean);

  for (const pool of directPools) {
    const found = pool.find((person) => person.id === id);
    if (found) return found;
  }

  if (updated.extracurricularDetails) {
    const detailKeys = Object.keys(updated.extracurricularDetails);
    for (const key of detailKeys) {
      const teammates = updated.extracurricularDetails[key]?.teammates;
      const found = teammates?.find((person) => person.id === id);
      if (found) return found;
    }
  }

  if (!updated.relationships) updated.relationships = [];
  const fallback = { ...selectedPerson };
  updated.relationships.push(fallback);
  return fallback;
}

function syncPersonCopies(updated, person) {
  if (!person?.id) return;
  const syncList = (list) => (list || []).map((entry) => (entry.id === person.id ? { ...entry, ...person } : entry));

  updated.relationships = syncList(updated.relationships);
  updated.classmates = syncList(updated.classmates);

  if (updated.fullTimeJob?.coworkers) {
    updated.fullTimeJob.coworkers = syncList(updated.fullTimeJob.coworkers);
  }
  if (updated.fullTimeJob?.manager?.id === person.id) {
    updated.fullTimeJob.manager = { ...updated.fullTimeJob.manager, ...person };
  }

  if (updated.extracurricularDetails) {
    Object.keys(updated.extracurricularDetails).forEach((key) => {
      const details = updated.extracurricularDetails[key];
      if (details?.teammates) {
        details.teammates = syncList(details.teammates);
      }
    });
  }
}

function ensureRelationshipEntry(updated, person) {
  if (!updated.relationships) updated.relationships = [];
  const exists = updated.relationships.find((entry) => entry.id === person.id);
  if (!exists) updated.relationships.push({ ...person });
}

function blockedResult(updated, person, title, message, callout = null) {
  syncPersonCopies(updated, person);
  return {
    updated,
    actionResult: createActionResult({ title, person, message, callout }),
  };
}

function completeInteraction(updated, person, actionKey, payload) {
  syncPersonCopies(updated, person);
  incrementInteraction(updated, person.id);
  if (actionKey) incrementInteraction(updated, `${actionKey}_${person.id}`);

  return {
    updated,
    actionResult: createActionResult({ person, ...payload }),
  };
}

function relationshipStatusLabel(person) {
  if (person.relationshipStatus === "friend") return "Friend";
  if (person.relationshipStatus === "dating") return "Dating";
  if (person.relationshipStatus === "engaged") return "Engaged";
  if (person.relationshipStatus === "married") return "Married";
  if (person.relationshipStatus === "romantic-interest") return "Crush";
  return "Acquaintance";
}

function canSpend(updated, amount) {
  return Number(updated.money || 0) >= amount;
}

export function handleInteraction(life, selectedPerson, action) {
  const updated = deepClone(life);
  ensureActionLimits(updated);

  const person = findPerson(updated, selectedPerson);
  if (!person) return updated;

  const age = Number(updated.age || 0);
  const generalCount = getInteractionCount(updated, person.id);
  const isRoutineEarlyAction = ["reachAttention", "babbleAt", "showToy", "askFood"].includes(action);

  if (generalCount >= 5 && !isRoutineEarlyAction) {
    addHistory(updated, `I tried to interact with ${person.firstName}, but we have already done enough this year.`);
    return blockedResult(
      updated,
      person,
      "Enough for this year",
      `${person.firstName} needs a little space before this relationship can shift again.`,
      "You can still keep the story moving by aging up or focusing somewhere else."
    );
  }

  switch (action) {
    case "reachAttention": {
      const gain = applyBond(person, randInt(3, 7));
      const changes = applyStats(updated, [
        { stat: "happiness", label: "Happiness", delta: randInt(3, 7) },
        { stat: "stress", label: "Stress", delta: -randInt(1, 4) },
      ]);
      addHistory(updated, `I reached for ${person.firstName}, and they gave me attention.`);
      return completeInteraction(updated, person, action, {
        title: "Attention found",
        message: `${person.firstName} understood the tiny signal and stayed close for a while.`,
        changes: [formatDelta("Bond", gain), ...changes],
      });
    }

    case "babbleAt": {
      const gain = applyBond(person, randInt(1, 4));
      const changes = applyStats(updated, [
        { stat: "intelligence", label: "Intelligence", delta: randInt(1, 2) },
        { stat: "happiness", label: "Happiness", delta: randInt(1, 4) },
      ]);
      addHistory(updated, `I babbled at ${person.firstName} like I had important news.`);
      return completeInteraction(updated, person, action, {
        title: "Tiny conversation",
        message: `${person.firstName} listened like every sound meant something.`,
        changes: [formatDelta("Bond", gain), ...changes],
      });
    }

    case "showToy": {
      const gain = applyBond(person, randInt(2, 5));
      changeStat(updated, "happiness", randInt(2, 5));
      addHistory(updated, `I showed ${person.firstName} my toy. It felt like sharing treasure.`);
      return completeInteraction(updated, person, action, {
        title: "Toy showcase",
        message: `${person.firstName} played along and treated the toy like serious business.`,
        changes: [formatDelta("Bond", gain), "+Happiness"],
      });
    }

    case "spendTime": {
      let activity = "spent quality time together";
      if (isFamily(person)) {
        const activities = familyActivities[person.relation] || ["spent quality time together"];
        activity = randChoice(activities);
        addHistory(updated, `My ${String(person.relation || "family").toLowerCase()} and I ${activity}.`);
      } else if (person.relation === "Pet") {
        activity = "played around the house";
        addHistory(updated, `${person.firstName} and I ${activity}.`);
      } else {
        addHistory(updated, `I spent quality time with ${person.firstName} ${person.lastName || ""}.`.trim());
      }

      const bondGain = applyBond(person, randInt(3, 8));
      return completeInteraction(updated, person, action, {
        title: "Time well spent",
        message: isFamily(person)
          ? `You and your ${String(person.relation || "family").toLowerCase()} had a grounded, easy moment together.`
          : `${person.firstName} seemed genuinely glad you made time for them.`,
        changes: [formatDelta("Bond", bondGain)],
        callout: "Consistent attention is one of the easiest ways to deepen a connection.",
      });
    }

    case "compliment": {
      if (isFamily(person) || age < 5) {
        return blockedResult(updated, person, "Not the right lane", "This compliment action is meant for peers and older social scenes.");
      }
      const compliment = randChoice([
        "Your style is incredible.",
        "You always know how to make people laugh.",
        "I really admire your confidence.",
        "You have such a good heart.",
      ]);
      const bondGain = applyBond(person, randInt(5, 10));
      addHistory(updated, `I complimented ${person.firstName}: "${compliment}"`);
      return completeInteraction(updated, person, action, {
        title: "Compliment landed",
        message: `${person.firstName} took it well and the vibe got lighter.`,
        changes: [formatDelta("Bond", bondGain)],
        callout: `You told them: "${compliment}"`,
      });
    }

    case "giveGift": {
      if (age < 8) {
        return blockedResult(updated, person, "Too young for gifts", "Gift giving unlocks once this life has a little more independence.");
      }
      const gifts = ["flowers", "chocolates", "a handwritten note", "a small bracelet", "their favorite snack"];
      const gift = randChoice(gifts);
      const cost = randInt(10, 30);
      if (!canSpend(updated, cost)) {
        addHistory(updated, `I tried to buy ${person.firstName} a gift but could not afford it.`);
        return completeInteraction(updated, person, action, {
          title: "Gift idea, bad timing",
          message: `You wanted to do something thoughtful for ${person.firstName}, but the money just was not there.`,
          callout: "Nothing changed, but the thought still counts for the story.",
        });
      }

      updated.money -= cost;
      const bondGain = applyBond(person, randInt(8, 15));
      addHistory(updated, `I gave ${person.firstName} ${gift}. It cost $${cost}.`);
      return completeInteraction(updated, person, action, {
        title: "Gift delivered",
        message: `${person.firstName} appreciated the gesture and noticed the effort.`,
        changes: [`-$${cost}`, formatDelta("Bond", bondGain)],
        callout: `You gave them ${gift}.`,
      });
    }

    case "befriend": {
      if (isFamily(person) || age < 5) {
        return blockedResult(updated, person, "Friendship already defined", "This relationship is shaped by family or early life, not a formal befriend attempt.");
      }
      if (person.relationshipStatus !== "acquaintance" && person.relationshipStatus !== "classmate") {
        const gain = applyBond(person, randInt(3, 7));
        addHistory(updated, `I tried to deepen my friendship with ${person.firstName}.`);
        return completeInteraction(updated, person, action, {
          title: "Connection deepened",
          message: `${person.firstName} already knows you. The bond still got a little warmer.`,
          changes: [formatDelta("Bond", gain)],
        });
      }

      const baseBond = Number(person.bond || 20);
      const attractionBonus = Number(updated.attractiveness || 50) / 10;
      const intelligenceBonus = Number(updated.intelligence || 50) / 20;
      const successChance = Math.min(95, baseBond + attractionBonus + intelligenceBonus);
      const success = Math.random() * 100 < successChance;

      if (success) {
        person.relationshipStatus = "friend";
        applyBond(person, 15);
        ensureRelationshipEntry(updated, person);
        const successMessages = [
          `${person.firstName} said they wanted to be friends a while ago. We are friends now!`,
          `${person.firstName} smiled and said, "Let's be friends." We bonded instantly.`,
          `${person.firstName} agreed enthusiastically. Friendship unlocked.`,
        ];
        const message = randChoice(successMessages);
        addHistory(updated, message);
        incrementInteraction(updated, person.id);
        syncPersonCopies(updated, person);
        return {
          updated,
          befriendResult: {
            success: true,
            person: {
              firstName: person.firstName,
              lastName: person.lastName,
              clique: person.clique,
              cliqueName: person.cliqueName,
            },
            message,
          },
        };
      }

      applyBond(person, -2);
      const failureMessages = [
        `${person.firstName} didn't find me interesting and declined my follow request.`,
        `${person.firstName} looked uncomfortable and said, "Maybe later."`,
        `${person.firstName} politely declined. I guess we need more time.`,
        `${person.firstName} said, "I don't really know you that well yet."`,
      ];
      const message = randChoice(failureMessages);
      addHistory(updated, message);
      incrementInteraction(updated, person.id);
      syncPersonCopies(updated, person);
      return {
        updated,
        befriendResult: {
          success: false,
          person: {
            firstName: person.firstName,
            lastName: person.lastName,
            clique: person.clique,
            cliqueName: person.cliqueName,
          },
          message,
        },
      };
    }

    case "askBestFriend": {
      if (person.relationshipStatus !== "friend") {
        return blockedResult(updated, person, "Not close enough", "Best-friend energy needs an actual friendship first.");
      }
      const success = Number(person.bond || 0) >= 65 || Math.random() < 0.45;
      if (success) {
        const meta = ensureRelationshipMeta(person);
        meta.bestFriend = true;
        const gain = applyBond(person, randInt(6, 12));
        addHistory(updated, `${person.firstName} and I decided we are best friends now.`);
        return completeInteraction(updated, person, action, {
          title: "Best friends",
          message: `${person.firstName} was into it. The friendship feels more official now.`,
          changes: [formatDelta("Bond", gain), "Best friend"],
        });
      }
      const loss = applyBond(person, -randInt(1, 4));
      addHistory(updated, `${person.firstName} dodged the best-friend label for now.`);
      return completeInteraction(updated, person, action, {
        title: "Too soon",
        message: `${person.firstName} likes you, but the label felt a little intense right now.`,
        changes: [formatDelta("Bond", loss)],
      });
    }

    case "playOutside": {
      const gain = applyBond(person, randInt(4, 9));
      const changes = applyStats(updated, [
        { stat: "happiness", label: "Happiness", delta: randInt(3, 8) },
        { stat: "athleticism", label: "Athleticism", delta: randInt(1, 3) },
      ]);
      addHistory(updated, `${person.firstName} and I played outside until we were tired.`);
      return completeInteraction(updated, person, action, {
        title: "Outside was worth it",
        message: "The hangout felt simple, real, and easy to remember.",
        changes: [formatDelta("Bond", gain), ...changes],
      });
    }

    case "askGoToHouse": {
      if (age < 5 || age > 13 || isFamily(person)) {
        return blockedResult(updated, person, "Not available", "House hangout asks are for child and preteen friendship arcs.");
      }
      const success = Number(person.bond || 0) >= 38 || Math.random() < 0.58;
      const bondDelta = success ? randInt(4, 9) : -randInt(1, 4);
      const happinessDelta = success ? randInt(2, 6) : -randInt(0, 2);
      applyBond(person, bondDelta);
      if (happinessDelta) changeStat(updated, "happiness", happinessDelta);
      addHistory(updated, success ? `I asked to go to ${person.firstName}'s house and they were into it.` : `I asked to go to ${person.firstName}'s house, but it did not come together.`);
      return completeInteraction(updated, person, action, {
        title: success ? "Hangout lined up" : "Not this time",
        message: success ? `${person.firstName} seemed excited to hang out after school.` : `${person.firstName} did not fully bite on the idea this time.`,
        changes: [
          formatDelta("Bond", bondDelta),
          happinessDelta ? formatDelta("Happiness", happinessDelta) : null,
        ].filter(Boolean),
        callout: success ? "Childhood social arcs fit better as hangouts than dates." : null,
      });
    }

    case "studyTogether": {
      const gain = applyBond(person, randInt(3, 7));
      const changes = applyStats(updated, [
        { stat: "intelligence", label: "Intelligence", delta: randInt(2, 5) },
        { stat: "stress", label: "Stress", delta: randInt(0, 3) },
      ]);
      const gradeDelta = applyGradeDelta(updated, randInt(1, 4), "studyTogether");
      addStudyMomentum(updated, 1);
      addHistory(updated, `${person.firstName} and I studied together.`);
      return completeInteraction(updated, person, action, {
        title: "Study session",
        message: `${person.firstName} helped the work feel a little less lonely.`,
        changes: [formatDelta("Bond", gain), ...changes, gradeDelta ? formatDelta("Grade", gradeDelta) : null].filter(Boolean),
      });
    }

    case "tellDream": {
      const gain = applyBond(person, randInt(2, 6));
      changeStat(updated, "happiness", randInt(1, 4));
      addHistory(updated, `I told ${person.firstName} what I want my future to look like.`);
      return completeInteraction(updated, person, action, {
        title: "Dream shared",
        message: `${person.firstName} listened closely enough that the dream felt less imaginary.`,
        changes: [formatDelta("Bond", gain), "+Happiness"],
      });
    }

    case "takeToDinner": {
      if (age < 18 || !isFamily(person)) {
        return blockedResult(updated, person, "Dinner can wait", "Taking family out to dinner is an adult family action.");
      }
      const cost = randInt(45, 140);
      if (!canSpend(updated, cost)) {
        addHistory(updated, `I wanted to take ${person.firstName} to dinner but could not afford it.`);
        return completeInteraction(updated, person, action, {
          title: "Dinner delayed",
          message: "The thought was there, but the money was not.",
        });
      }
      updated.money -= cost;
      const gain = applyBond(person, randInt(8, 16));
      changeStat(updated, "happiness", randInt(4, 8));
      addHistory(updated, `I took ${person.firstName} out for dinner. It cost $${cost}.`);
      return completeInteraction(updated, person, action, {
        title: "Dinner together",
        message: "The meal made the family bond feel cared for instead of assumed.",
        changes: [`-$${cost}`, formatDelta("Bond", gain), "+Happiness"],
      });
    }

    case "familyDinner": {
      if (!isFamily(person)) {
        return blockedResult(updated, person, "Family only", "This action is for family relationships.");
      }
      const gain = applyBond(person, randInt(5, 12));
      const changes = applyStats(updated, [
        { stat: "happiness", label: "Happiness", delta: randInt(4, 9) },
        { stat: "stress", label: "Stress", delta: -randInt(1, 4) },
      ]);
      addHistory(updated, `${person.firstName} and I had a family dinner that felt grounding.`);
      return completeInteraction(updated, person, action, {
        title: "Family dinner",
        message: "Nothing flashy happened. That was the point.",
        changes: [formatDelta("Bond", gain), ...changes],
      });
    }

    case "nostalgicCall": {
      if (age < 60) {
        return blockedResult(updated, person, "Not yet", "Nostalgic calls are tuned for elder chapters.");
      }
      const gain = applyBond(person, randInt(4, 10));
      const changes = applyStats(updated, [
        { stat: "happiness", label: "Happiness", delta: randInt(2, 6) },
        { stat: "stress", label: "Stress", delta: -randInt(1, 5) },
      ]);
      addHistory(updated, `${person.firstName} and I talked about old memories.`);
      return completeInteraction(updated, person, action, {
        title: "Old memories",
        message: "The call made the past feel close without fully swallowing the present.",
        changes: [formatDelta("Bond", gain), ...changes],
      });
    }

    case "sillyFace":
    case "tellJoke":
    case "playfulTease":
    case "sendMeme": {
      const labels = {
        sillyFace: "Silly face",
        tellJoke: "Joke landed",
        playfulTease: "Tease landed",
        sendMeme: "Meme sent",
      };
      const risk = action === "playfulTease" ? 0.2 : 0.1;
      const landed = Math.random() > risk || Number(person.bond || 0) >= 60;
      const bondDelta = landed ? randInt(2, 7) : -randInt(1, 5);
      applyBond(person, bondDelta);
      changeStat(updated, "happiness", landed ? randInt(1, 5) : -1);
      addHistory(updated, landed ? `${person.firstName} laughed with me.` : `My joke with ${person.firstName} did not quite land.`);
      return completeInteraction(updated, person, action, {
        title: labels[action],
        message: landed ? `${person.firstName} laughed and the moment loosened up.` : `${person.firstName} did not hate it, but the timing was off.`,
        changes: [formatDelta("Bond", bondDelta), landed ? "+Happiness" : "-Happiness"],
      });
    }

    case "postTogether": {
      if (age < 12) {
        return blockedResult(updated, person, "Too early", "Posting together starts in the preteen and teen social era.");
      }
      const gain = applyBond(person, randInt(2, 7));
      const fameGain = Math.random() < 0.25 ? 1 : 0;
      changeStat(updated, "happiness", randInt(1, 5));
      if (fameGain) changeStat(updated, "fame", fameGain);
      addHistory(updated, `${person.firstName} and I posted together. People noticed a little.`);
      return completeInteraction(updated, person, action, {
        title: "Post went up",
        message: "The post gave the friendship a tiny public footprint.",
        changes: [formatDelta("Bond", gain), "+Happiness", fameGain ? "+1 Fame" : null].filter(Boolean),
      });
    }

    case "talkCrush": {
      if (age < 5 || age > 13 || isFamily(person)) {
        return blockedResult(updated, person, "Not the right chapter", "This PG crush talk is for childhood and preteen social arcs.");
      }
      setRomanceState(person, "crush");
      const gain = applyBond(person, randInt(2, 6));
      changeStat(updated, "happiness", randInt(2, 5));
      addHistory(updated, `I talked with ${person.firstName} about a school crush. It felt innocent and huge.`);
      return completeInteraction(updated, person, action, {
        title: "Crush talk",
        message: "The conversation stayed PG, but it still felt like a big deal.",
        changes: [formatDelta("Bond", gain), "+Happiness", "Crush noted"],
      });
    }

    case "askSupervisedDate": {
      if (age < 12 || age > 13 || isFamily(person)) {
        return blockedResult(updated, person, "Not available", "Supervised date asks are for preteen chapters only.");
      }
      const success = Number(person.bond || 0) >= 55 && Math.random() < 0.7;
      setRomanceState(person, "crush");
      const delta = success ? randInt(4, 9) : -randInt(1, 4);
      const happinessDelta = success ? randInt(2, 5) : -randInt(0, 2);
      const stressDelta = success ? 0 : randInt(1, 4);
      applyBond(person, delta);
      if (happinessDelta) changeStat(updated, "happiness", happinessDelta);
      if (stressDelta) changeStat(updated, "stress", stressDelta);
      addHistory(updated, success ? `I asked about a supervised date with ${person.firstName}, and it actually worked.` : `I asked about a supervised date with ${person.firstName}, but the adults shut it down.`);
      return completeInteraction(updated, person, action, {
        title: success ? "Supervised date approved" : "Supervised date denied",
        message: success ? "It stayed innocent, awkward, and age-appropriate." : "Nobody was mean about it, but the answer was no.",
        changes: [
          formatDelta("Bond", delta),
          happinessDelta ? formatDelta("Happiness", happinessDelta) : null,
          stressDelta ? formatDelta("Stress", stressDelta) : null,
        ].filter(Boolean),
        callout: "Childhood romance stays PG in this build.",
      });
    }

    case "askOnDate": {
      if (age < 13 || isFamily(person)) {
        return blockedResult(updated, person, "Too early", "Dating actions unlock in the teen chapter, with stricter limits before adulthood.");
      }
      if (person.relationshipStatus === "acquaintance" || person.relationshipStatus === "friend" || person.relationshipStatus === "romantic-interest") {
        if (Number(person.bond || 0) >= 60) {
          person.relationshipStatus = "dating";
          setRomanceState(person, "dating");
          const gain = applyBond(person, 10);
          addHistory(updated, `I asked ${person.firstName} on a date. They said yes. We are dating now.`);
          ensureRelationshipEntry(updated, person);
          return completeInteraction(updated, person, action, {
            title: "Date accepted",
            message: `${person.firstName} said yes. This connection just shifted into something romantic.`,
            changes: [formatDelta("Bond", gain), "Status: Dating"],
            callout: age < 18 ? "Teen romance stays implied and age-appropriate." : "A new romance arc is now in play.",
          });
        }
        const loss = applyBond(person, -5);
        addHistory(updated, `I asked ${person.firstName} on a date. They politely declined.`);
        return completeInteraction(updated, person, action, {
          title: "Date declined",
          message: `${person.firstName} passed for now, but it did not turn into a disaster.`,
          changes: [formatDelta("Bond", loss)],
          callout: "The chemistry is not there yet. More time together could still change the story.",
        });
      }

      if (person.relationshipStatus === "dating") {
        const gain = applyBond(person, randInt(5, 10));
        changeStat(updated, "happiness", randInt(3, 7));
        addHistory(updated, `${person.firstName} and I went on a date.`);
        return completeInteraction(updated, person, action, {
          title: "Date night",
          message: "The date gave the relationship a little more momentum.",
          changes: [formatDelta("Bond", gain), "+Happiness"],
        });
      }
      break;
    }

    case "teenDate": {
      if (age < 13 || age >= 18 || !isRomantic(person)) {
        return blockedResult(updated, person, "Teen date unavailable", "This action only applies to active teen romance arcs.");
      }
      const gain = applyBond(person, randInt(4, 9));
      const changes = applyStats(updated, [
        { stat: "happiness", label: "Happiness", delta: randInt(3, 8) },
        { stat: "stress", label: "Stress", delta: randInt(0, 2) },
      ]);
      addHistory(updated, `${person.firstName} and I went on a teen date. It stayed innocent but intense.`);
      return completeInteraction(updated, person, action, {
        title: "Teen date",
        message: "It was awkward, sweet, and dramatic in the way teen things can be.",
        changes: [formatDelta("Bond", gain), ...changes],
        callout: "Teen romance stays non-explicit.",
      });
    }

    case "messAround": {
      if (age < 14 || age >= 18 || !isRomantic(person)) {
        return blockedResult(updated, person, "Not available", "This implied teen action only appears for active teen romance arcs.");
      }
      const gain = applyBond(person, randInt(2, 6));
      const changes = applyStats(updated, [
        { stat: "happiness", label: "Happiness", delta: randInt(1, 5) },
        { stat: "stress", label: "Stress", delta: randInt(1, 4) },
      ]);
      addHistory(updated, `${person.firstName} and I got closer, but kept things private and age-appropriate.`);
      return completeInteraction(updated, person, action, {
        title: "Private moment",
        message: "The relationship got a little more intense without the story needing details.",
        changes: [formatDelta("Bond", gain), ...changes],
        callout: "This stays implied and TV-14.",
      });
    }

    case "defineRelationship": {
      if (age < 13 || isFamily(person)) {
        return blockedResult(updated, person, "Not available", "Defining romance unlocks from the teen chapter onward.");
      }
      const success = Number(person.bond || 0) >= 55 || Math.random() < 0.35;
      if (success) {
        person.relationshipStatus = "dating";
        setRomanceState(person, age >= 18 ? "committed" : "dating");
        const gain = applyBond(person, randInt(4, 10));
        ensureRelationshipEntry(updated, person);
        addHistory(updated, `${person.firstName} and I defined what we are. It feels more official now.`);
        return completeInteraction(updated, person, action, {
          title: "Relationship defined",
          message: `${person.firstName} wanted clarity too.`,
          changes: [formatDelta("Bond", gain), `Status: ${relationshipStatusLabel(person)}`],
        });
      }
      const loss = applyBond(person, -randInt(2, 6));
      const stressDelta = randInt(2, 6);
      changeStat(updated, "stress", stressDelta);
      addHistory(updated, `${person.firstName} was not ready to define the relationship.`);
      return completeInteraction(updated, person, action, {
        title: "No label yet",
        message: "The conversation did not end everything, but it made the uncertainty louder.",
        changes: [formatDelta("Bond", loss), formatDelta("Stress", stressDelta)],
      });
    }

    case "vacationInvite": {
      if (age < 18 || !isRomantic(person)) {
        return blockedResult(updated, person, "Vacation can wait", "Vacation invites are adult relationship actions.");
      }
      const cost = randInt(800, 2500);
      if (!canSpend(updated, cost)) {
        addHistory(updated, `I wanted to take ${person.firstName} on vacation but could not afford it.`);
        return completeInteraction(updated, person, action, {
          title: "Vacation idea parked",
          message: "The fantasy was nice. The bank account disagreed.",
        });
      }
      updated.money -= cost;
      const gain = applyBond(person, randInt(8, 18));
      const changes = applyStats(updated, [
        { stat: "happiness", label: "Happiness", delta: randInt(8, 16) },
        { stat: "stress", label: "Stress", delta: -randInt(5, 12) },
      ]);
      addHistory(updated, `${person.firstName} and I took a vacation together. It cost $${cost}.`);
      return completeInteraction(updated, person, action, {
        title: "Vacation booked",
        message: "The trip gave the relationship room away from normal pressure.",
        changes: [`-$${cost}`, formatDelta("Bond", gain), ...changes],
      });
    }

    case "propose": {
      if (age < 18) {
        return blockedResult(updated, person, "Too young", "Marriage actions are locked until 18.");
      }
      if (person.relationshipStatus === "dating" && Number(person.bond || 0) >= 80) {
        person.relationshipStatus = "engaged";
        setRomanceState(person, "engaged");
        person.bond = 100;
        addHistory(updated, `I proposed to ${person.firstName}. They said yes. We are engaged.`);
        return completeInteraction(updated, person, action, {
          title: "Proposal accepted",
          message: `${person.firstName} said yes.`,
          changes: ["Bond 100", "Status: Engaged"],
        });
      }
      const loss = applyBond(person, -10);
      addHistory(updated, `I proposed to ${person.firstName}, but they were not ready yet.`);
      return completeInteraction(updated, person, action, {
        title: "Not ready",
        message: `${person.firstName} was not ready for that step.`,
        changes: [formatDelta("Bond", loss)],
      });
    }

    case "marry": {
      if (age < 18) {
        return blockedResult(updated, person, "Too young", "Marriage actions are locked until 18.");
      }
      if (person.relationshipStatus === "engaged") {
        person.relationshipStatus = "married";
        person.relation = "Spouse";
        setRomanceState(person, "married");
        person.bond = 100;
        addHistory(updated, `${person.firstName} and I got married. We are officially family now.`);
        return completeInteraction(updated, person, action, {
          title: "Married",
          message: `${person.firstName} is now part of the family structure.`,
          changes: ["Bond 100", "Status: Married"],
        });
      }
      return blockedResult(updated, person, "Not engaged", "Marriage requires an engagement first.");
    }

    case "biteSlobber": {
      const loss = applyBond(person, -randInt(1, 5));
      const changes = applyStats(updated, [
        { stat: "happiness", label: "Happiness", delta: randInt(1, 4) },
        { stat: "stress", label: "Stress", delta: randInt(1, 4) },
      ]);
      addHistory(updated, `I bit or slobbered on ${person.firstName}. Reactions were mixed.`);
      return completeInteraction(updated, person, action, {
        title: "Tiny chaos",
        message: `${person.firstName} did not know whether to laugh or escape.`,
        changes: [formatDelta("Bond", loss), ...changes],
      });
    }

    case "argue": {
      const argueKey = `argue_${person.id}`;
      if (getInteractionCount(updated, argueKey) >= 3) {
        addHistory(updated, `I've argued with ${person.firstName} too much this year. I need to cool off.`);
        return blockedResult(updated, person, "Too much arguing", "This relationship needs time before another fight can matter.");
      }

      const neutral = Math.random() < 0.3;
      if (neutral) {
        changeStat(updated, "stress", randInt(3, 8));
        addHistory(updated, `${person.firstName} and I had a disagreement, but it fizzled out.`);
        return completeInteraction(updated, person, "argue", {
          title: "Minor disagreement",
          message: "The argument circled for a while, then ran out of fuel.",
          changes: ["+Stress"],
        });
      }

      const highBond = Number(person.bond || 0) >= 45;
      const bondLoss = highBond ? -randInt(5, 10) : -randInt(12, 22);
      applyBond(person, bondLoss);
      const changes = applyStats(updated, [
        { stat: "stress", label: "Stress", delta: highBond ? randInt(8, 15) : randInt(15, 25) },
        { stat: "happiness", label: "Happiness", delta: highBond ? -randInt(2, 6) : -randInt(8, 15) },
      ]);
      if (!isFamily(person) && isRomantic(person) && person.bond < 25 && Math.random() < 0.45) {
        person.relationshipStatus = "ex";
        setRomanceState(person, "ex");
        addHistory(updated, `After that argument, ${person.firstName} and I broke up.`);
      } else {
        addHistory(updated, `${person.firstName} and I had a tense argument.`);
      }
      return completeInteraction(updated, person, "argue", {
        title: "That got tense",
        message: `${person.firstName} and you got into it. The air feels heavier now.`,
        changes: [formatDelta("Bond", bondLoss), ...changes],
        callout: "The long-term fallout will keep playing out in your story.",
      });
    }

    case "insult": {
      const insult = randChoice([
        "Your taste is terrible.",
        "You talk too much.",
        "Nobody asked for your opinion.",
        "You are embarrassing yourself.",
      ]);
      const bondLoss = -randInt(10, 20);
      applyBond(person, bondLoss);
      addHistory(updated, `I insulted ${person.firstName}: "${insult}"`);
      return completeInteraction(updated, person, action, {
        title: "That landed badly",
        message: `${person.firstName} did not take the shot well.`,
        changes: [formatDelta("Bond", bondLoss)],
        callout: `You said: "${insult}"`,
      });
    }

    case "bully":
    case "cyberbully": {
      if (isFamily(person) || age < 5) {
        return blockedResult(updated, person, "Not available", "This malicious action is for peer social arcs.");
      }
      const publicHit = action === "cyberbully" ? randInt(1, 4) : 0;
      const bondLoss = -randInt(15, 28);
      applyBond(person, bondLoss);
      const changes = applyStats(updated, [
        { stat: "happiness", label: "Happiness", delta: -randInt(2, 8) },
        { stat: "stress", label: "Stress", delta: randInt(4, 12) },
      ]);
      if (publicHit) changeStat(updated, "fame", publicHit);
      addHistory(updated, action === "cyberbully" ? `I cyberbullied ${person.firstName}. It made the social scene uglier.` : `I bullied ${person.firstName}. It felt meaner than powerful.`);
      return completeInteraction(updated, person, action, {
        title: action === "cyberbully" ? "Online cruelty" : "Cruel choice",
        message: action === "cyberbully" ? "The post got attention, but not the kind that makes a life better." : `${person.firstName} looked smaller after it, and the moment stuck.`,
        changes: [formatDelta("Bond", bondLoss), ...changes, publicHit ? `+${publicHit} Fame` : null].filter(Boolean),
        callout: "Malicious choices can shape darker storylines without guaranteeing rewards.",
      });
    }

    case "stealSmall": {
      if (age < 5) {
        return blockedResult(updated, person, "Too young", "Stealing choices start in childhood.");
      }
      const caught = Math.random() < 0.45;
      const amount = randInt(5, age < 18 ? 35 : 120);
      if (!caught) updated.money = Number(updated.money || 0) + amount;
      const bondDelta = caught ? -randInt(12, 22) : -randInt(2, 8);
      applyBond(person, bondDelta);
      changeStat(updated, "stress", caught ? randInt(8, 16) : randInt(2, 6));
      addHistory(updated, caught ? `I tried to steal from ${person.firstName}, but got caught.` : `I stole something small around ${person.firstName} and got away with it.`);
      return completeInteraction(updated, person, action, {
        title: caught ? "Caught stealing" : "Got away with it",
        message: caught ? `${person.firstName} noticed, and trust took a hit.` : "It worked this time, which might be the dangerous part.",
        changes: [caught ? null : `+$${amount}`, formatDelta("Bond", bondDelta), "+Stress"].filter(Boolean),
      });
    }

    case "sabotage": {
      if (age < 18 || isFamily(person)) {
        return blockedResult(updated, person, "Not available", "Sabotage is an adult peer/work/social action.");
      }
      const works = Math.random() < 0.45;
      const bondDelta = works ? -randInt(10, 18) : -randInt(20, 35);
      applyBond(person, bondDelta);
      const changes = applyStats(updated, [
        { stat: "stress", label: "Stress", delta: works ? randInt(4, 10) : randInt(12, 22) },
        { stat: "influence", label: "Influence", delta: works ? randInt(1, 4) : -randInt(1, 3) },
      ]);
      addHistory(updated, works ? `I quietly sabotaged ${person.firstName}. It worked, but it felt ugly.` : `I tried to sabotage ${person.firstName}, and it backfired.`);
      return completeInteraction(updated, person, action, {
        title: works ? "Sabotage worked" : "Sabotage backfired",
        message: works ? "The darker path moved the board, but it left residue." : `${person.firstName} saw enough to know something was off.`,
        changes: [formatDelta("Bond", bondDelta), ...changes],
      });
    }

    case "askFood":
    case "askSnack": {
      if (!isParent(person)) {
        return blockedResult(updated, person, "Wrong person", "Food requests in early life are parent or guardian interactions.");
      }
      const success = Math.random() < (action === "askFood" ? 0.9 : 0.7);
      const bondDelta = success ? randInt(1, 4) : -randInt(1, 3);
      applyBond(person, bondDelta);
      changeStat(updated, "happiness", success ? randInt(2, 6) : -randInt(1, 4));
      addHistory(updated, success ? `I asked ${person.firstName} for food and got it.` : `I asked ${person.firstName} for a snack and got denied.`);
      return completeInteraction(updated, person, action, {
        title: success ? "Request handled" : "Request denied",
        message: success ? `${person.firstName} came through.` : `${person.firstName} said no this time.`,
        changes: [formatDelta("Bond", bondDelta), success ? "+Happiness" : "-Happiness"],
      });
    }

    case "askMoney": {
      if (!isParent(person)) {
        return blockedResult(updated, person, "Wrong person", "Money requests are parent interactions for now.");
      }
      const askKey = `askMoney_${person.id}`;
      if (getInteractionCount(updated, askKey) >= 3) {
        addHistory(updated, `I've already asked my ${String(person.relation).toLowerCase()} for money too many times this year.`);
        return blockedResult(updated, person, "Money ask capped", "You have already pushed this money ask enough this year.");
      }

      const parentMoney = person.occupation ? 500 : 100;
      const giveChance = Number(person.bond || 0) >= 60 ? 0.7 : 0.3;
      if (Math.random() < giveChance) {
        const amount = randInt(20, Math.min(100, parentMoney));
        updated.money = Number(updated.money || 0) + amount;
        const loss = applyBond(person, -randInt(2, 5));
        addHistory(updated, `I asked my ${String(person.relation).toLowerCase()} for money. They gave me $${amount}.`);
        return completeInteraction(updated, person, action, {
          title: "They came through",
          message: `Your ${String(person.relation).toLowerCase()} helped you out with a little cash.`,
          changes: [`+$${amount}`, formatDelta("Bond", loss)],
          callout: "Support helps, even when it comes with a little guilt.",
        });
      }
      const denial = randChoice([
        `My ${String(person.relation).toLowerCase()} said, "Money doesn't grow on trees."`,
        `My ${String(person.relation).toLowerCase()} looked at me and said, "You think I'm made of money?"`,
        `My ${String(person.relation).toLowerCase()} sighed and said, "Times are tough for everyone."`,
      ]);
      const loss = applyBond(person, -randInt(1, 3));
      addHistory(updated, denial);
      return completeInteraction(updated, person, action, {
        title: "Money request denied",
        message: denial,
        changes: [formatDelta("Bond", loss)],
        callout: "No money changed hands this time.",
      });
    }

    case "askAllowance": {
      if (!isParent(person) || age < 8 || age >= 18) {
        return blockedResult(updated, person, "Allowance unavailable", "Allowance asks are for school-age lives.");
      }
      const outcome = randChoice(["clean", "grades", "no"]);
      if (outcome === "no") {
        const loss = applyBond(person, -randInt(1, 3));
        addHistory(updated, `${person.firstName} said money does not grow on trees.`);
        return completeInteraction(updated, person, action, {
          title: "Allowance denied",
          message: `${person.firstName} said money does not grow on trees.`,
          changes: [formatDelta("Bond", loss)],
        });
      }
      const amount = randInt(5, 25);
      updated.money = Number(updated.money || 0) + amount;
      const gain = applyBond(person, randInt(1, 4));
      if (!updated.progressFlags) updated.progressFlags = {};
      updated.progressFlags.allowanceDeal = { age, parentId: person.id, type: outcome };
      const gradeDelta = outcome === "grades" ? applyGradeDelta(updated, 1, "allowanceDeal") : 0;
      if (outcome === "grades") addStudyMomentum(updated, 2);
      addHistory(updated, outcome === "clean" ? `${person.firstName} gave me allowance after I agreed to clean up more.` : `${person.firstName} gave me allowance but expects better grades.`);
      return completeInteraction(updated, person, action, {
        title: outcome === "clean" ? "Allowance deal" : "Grade-based allowance",
        message: outcome === "clean" ? "The money came with a chore expectation." : "The money came with academic pressure attached.",
        changes: [`+$${amount}`, formatDelta("Bond", gain), gradeDelta ? formatDelta("Grade", gradeDelta) : null].filter(Boolean),
        callout: outcome === "clean" ? "Cleaning is a simple story beat for now." : "The grade expectation now nudges school progress directly.",
      });
    }

    case "askPhone": {
      if (!isParent(person) || age < 10 || age >= 18) {
        return blockedResult(updated, person, "Phone ask unavailable", "Phone requests are for preteen and teen chapters.");
      }
      const success = Number(person.bond || 0) >= 55 && (Number(updated.intelligence || 0) >= 45 || Math.random() < 0.45);
      if (success) {
        if (!updated.assetsLite) updated.assetsLite = {};
        updated.assetsLite.phone = true;
        const gain = applyBond(person, randInt(1, 4));
        addHistory(updated, `${person.firstName} agreed to get me a phone. My social world just got bigger.`);
        return completeInteraction(updated, person, action, {
          title: "Phone unlocked",
          message: "The answer was yes. The social world suddenly feels wider.",
          changes: [formatDelta("Bond", gain), "Phone"],
        });
      }
      const loss = applyBond(person, -randInt(1, 4));
      const stressDelta = randInt(1, 4);
      changeStat(updated, "stress", stressDelta);
      addHistory(updated, `${person.firstName} said I am not ready for a phone yet.`);
      return completeInteraction(updated, person, action, {
        title: "Phone denied",
        message: `${person.firstName} said not yet.`,
        changes: [formatDelta("Bond", loss), formatDelta("Stress", stressDelta)],
      });
    }

    case "askCar": {
      if (!isParent(person) || age < 15 || age >= 22) {
        return blockedResult(updated, person, "Car ask unavailable", "Car and permit conversations unlock in the older teen chapter.");
      }
      const success = Number(person.bond || 0) >= 70 && Math.random() < 0.45;
      if (success) {
        if (!updated.assetsLite) updated.assetsLite = {};
        updated.assetsLite.carHelpPromised = true;
        const gain = applyBond(person, randInt(2, 5));
        addHistory(updated, `${person.firstName} agreed to help me think about a car when the time is right.`);
        return completeInteraction(updated, person, action, {
          title: "Car conversation opened",
          message: "No keys yet, but the door cracked open.",
          changes: [formatDelta("Bond", gain), "+Happiness"],
          callout: "Full vehicle ownership is a future system.",
        });
      }
      const loss = applyBond(person, -randInt(1, 4));
      const stressDelta = randInt(1, 4);
      changeStat(updated, "stress", stressDelta);
      addHistory(updated, `${person.firstName} shut down the car conversation for now.`);
      return completeInteraction(updated, person, action, {
        title: "Car ask denied",
        message: `${person.firstName} was not ready to even entertain it.`,
        changes: [formatDelta("Bond", loss), formatDelta("Stress", stressDelta)],
      });
    }

    case "askDrivingPractice": {
      if (!isParent(person) || age < 15 || updated.licenses?.drivers) {
        return blockedResult(updated, person, "Practice unavailable", "Driving practice is for older teens who do not have a license yet.");
      }
      ensureDrivingState(updated);
      const success = Number(person.bond || 0) >= 45 || Math.random() < 0.45;
      if (success) {
        updated.licenses.drivingPractice = Math.min(5, Number(updated.licenses.drivingPractice || 0) + 1);
        const bondGain = applyBond(person, randInt(2, 5));
        changeStat(updated, "stress", -randInt(1, 3));
        addHistory(updated, `${person.firstName} took me driving for practice. The next test feels less impossible.`);
        return completeInteraction(updated, person, action, {
          title: "Driving practice",
          message: `${person.firstName} gave you a little time behind the wheel.`,
          changes: [formatDelta("Bond", bondGain), "+Driving Practice", "-Stress"],
          callout: "Driving practice improves future test odds.",
        });
      }
      const loss = applyBond(person, -randInt(1, 3));
      addHistory(updated, `${person.firstName} said driving practice would have to wait.`);
      return completeInteraction(updated, person, action, {
        title: "Practice delayed",
        message: `${person.firstName} was not ready to hand over the keys yet.`,
        changes: [formatDelta("Bond", loss)],
      });
    }

    case "askHelp": {
      if (!isParent(person) || age < 5 || age >= 18) {
        return blockedResult(updated, person, "Help unavailable", "School help is a parent action during school years.");
      }
      if (Number(person.bond || 0) >= 50 && Math.random() < 0.8) {
        const bondGain = applyBond(person, randInt(3, 7));
        const changes = applyStats(updated, [
          { stat: "intelligence", label: "Intelligence", delta: randInt(3, 8) },
          { stat: "happiness", label: "Happiness", delta: randInt(5, 10) },
        ]);
        const gradeDelta = applyGradeDelta(updated, randInt(2, 5), "parentHelp");
        addStudyMomentum(updated, 1);
        addHistory(updated, `My ${String(person.relation).toLowerCase()} helped me with homework.`);
        return completeInteraction(updated, person, action, {
          title: "Homework help paid off",
          message: "You got real help and the time together landed well.",
          changes: [formatDelta("Bond", bondGain), ...changes, gradeDelta ? formatDelta("Grade", gradeDelta) : null].filter(Boolean),
        });
      }
      const denial = randChoice([
        `My ${String(person.relation).toLowerCase()} said, "I'm too busy right now."`,
        `My ${String(person.relation).toLowerCase()} said, "You need to try figuring it out first."`,
        `My ${String(person.relation).toLowerCase()} looked exhausted and said, "Not today, I'm sorry."`,
      ]);
      addHistory(updated, denial);
      return completeInteraction(updated, person, action, {
        title: "No help this time",
        message: denial,
        callout: "You will have to push through this one on your own.",
      });
    }

    case "askHangout": {
      const success = Number(person.bond || 0) >= 40 || Math.random() < 0.5;
      const delta = success ? randInt(3, 8) : -randInt(1, 4);
      applyBond(person, delta);
      addHistory(updated, success ? `${person.firstName} agreed to hang out.` : `${person.firstName} dodged my hangout invite.`);
      return completeInteraction(updated, person, action, {
        title: success ? "Hangout planned" : "Invite dodged",
        message: success ? `${person.firstName} seemed open to spending time.` : "The invite did not crash, but it did not land either.",
        changes: [formatDelta("Bond", delta)],
      });
    }

    default:
      syncPersonCopies(updated, person);
      return {
        updated,
        actionResult: createActionResult({
          title: "Nothing happened",
          person,
          message: "That interaction is not wired into this chapter yet.",
        }),
      };
  }

  syncPersonCopies(updated, person);
  incrementInteraction(updated, person.id);
  return updated;
}

export function sortRelationships(relationships) {
  const categories = {
    lover: [],
    family: [],
    pets: [],
    friends: [],
    exes: [],
    acquaintances: [],
  };

  (relationships || []).forEach((person) => {
    if (["married", "dating", "engaged", "committed", "talking", "romantic-interest"].includes(person.relationshipStatus)) {
      categories.lover.push(person);
    } else if (person.relationshipStatus === "family") {
      categories.family.push(person);
    } else if (person.relation === "Pet" || person.relationshipStatus === "pet") {
      categories.pets.push(person);
    } else if (person.relationshipStatus === "friend") {
      categories.friends.push(person);
    } else if (person.relationshipStatus === "ex") {
      categories.exes.push(person);
    } else {
      categories.acquaintances.push(person);
    }
  });

  return [
    ...categories.lover,
    ...categories.family,
    ...categories.pets,
    ...categories.friends,
    ...categories.exes,
    ...categories.acquaintances,
  ];
}
