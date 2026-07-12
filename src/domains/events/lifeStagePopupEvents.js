// Stage-based yearly popup events

import { randInt, randChoice, deepClone } from "../../utils/random.js";
import { addHistory } from "../../core/gameState.js";
import { getContentStage } from "../../utils/contentStage.js";

function clamp(value) {
  return Math.max(0, Math.min(100, Number(value || 0)));
}

function changeStat(updated, stat, delta) {
  updated[stat] = clamp(Number(updated[stat] || 0) + delta);
}

function formatDelta(label, delta) {
  return `${delta > 0 ? "+" : ""}${delta} ${label}`;
}

function getFamily(updated) {
  return randChoice((updated.relationships || []).filter((person) => person.relationshipStatus === "family")) || null;
}

function getFriend(updated) {
  return randChoice((updated.relationships || []).filter((person) => person.relationshipStatus === "friend")) || null;
}

function getRomance(updated) {
  return randChoice((updated.relationships || []).filter((person) => ["dating", "engaged", "married", "committed"].includes(person.relationshipStatus))) || null;
}

function addPet(updated) {
  const existing = (updated.relationships || []).find((person) => person.relation === "Pet" || person.relationshipStatus === "pet");
  if (existing) {
    existing.bond = Math.min(100, Number(existing.bond || 60) + randInt(4, 10));
    return existing;
  }

  const pet = {
    id: `pet-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    firstName: randChoice(["Mochi", "Bean", "Nova", "Sunny", "Blue", "Pepper"]),
    lastName: "",
    relation: "Pet",
    age: randInt(0, 8),
    occupation: "Pet",
    bond: randInt(50, 80),
    relationshipStatus: "pet",
  };
  if (!updated.relationships) updated.relationships = [];
  updated.relationships.push(pet);
  return pet;
}

function applyEvent(updated, event) {
  const eventPerson = event.createPet ? addPet(updated) : event.person;
  const changes = [];
  (event.stats || []).forEach(({ stat, label, delta }) => {
    changeStat(updated, stat, delta);
    changes.push(formatDelta(label, delta));
  });

  if (eventPerson?.id) {
    const person = (updated.relationships || []).find((entry) => entry.id === eventPerson.id);
    if (person && event.bondDelta) {
      person.bond = clamp(Number(person.bond || 0) + event.bondDelta);
      changes.unshift(formatDelta("Bond", event.bondDelta));
    }
  }

  if (event.history) addHistory(updated, event.history);

  return {
    updated,
    actionResult: {
      title: event.title,
      name: eventPerson ? `${eventPerson.firstName} ${eventPerson.lastName || ""}`.trim() : null,
      message: event.message,
      changes,
      callout: event.callout || null,
    },
  };
}

function infantEvents(updated) {
  const family = getFamily(updated);
  return [
    {
      title: "Kitchen light memory",
      person: family,
      message: family ? `${family.firstName} carried you through a quiet room while the house settled around you.` : "A quiet room, warm light, and a steady rhythm became one of the year's small anchors.",
      history: family ? `${family.firstName} carried me around the house until I calmed down.` : "I calmed down in the warm kitchen light.",
      bondDelta: family ? randInt(2, 5) : 0,
      stats: [
        { stat: "happiness", label: "Happiness", delta: randInt(2, 6) },
        { stat: "stress", label: "Stress", delta: -randInt(1, 3) },
      ],
    },
    {
      title: "First big laugh",
      person: family,
      message: "A ridiculous sound got the first real laugh of the year out of you.",
      history: "I laughed hard at a silly sound. Everyone replayed it all day.",
      bondDelta: family ? randInt(2, 6) : 0,
      stats: [{ stat: "happiness", label: "Happiness", delta: randInt(4, 8) }],
    },
    {
      title: "Rough night",
      person: family,
      message: "Sleep did not cooperate, and the whole house felt it by morning.",
      history: "I had a rough night and kept everyone awake.",
      bondDelta: family ? -randInt(1, 3) : 0,
      stats: [
        { stat: "stress", label: "Stress", delta: randInt(2, 6) },
        { stat: "happiness", label: "Happiness", delta: -randInt(1, 4) },
      ],
    },
    {
      title: "Tiny eureka",
      message: "You figured out that making a sound could make people appear.",
      history: "I learned that certain sounds make people rush over.",
      stats: [
        { stat: "intelligence", label: "Intelligence", delta: randInt(1, 3) },
        { stat: "happiness", label: "Happiness", delta: randInt(1, 4) },
      ],
    },
  ];
}

function toddlerEvents(updated) {
  const family = getFamily(updated);
  return [
    {
      title: "Independent streak",
      person: family,
      message: "You insisted on doing a simple thing alone, then got furious when it was hard.",
      history: "I insisted on doing it myself and immediately regretted how hard it was.",
      bondDelta: family ? randInt(0, 3) : 0,
      stats: [
        { stat: "intelligence", label: "Intelligence", delta: randInt(1, 3) },
        { stat: "stress", label: "Stress", delta: randInt(1, 4) },
      ],
    },
    {
      title: "Snack negotiation",
      person: family,
      message: family ? `${family.firstName} tried to hold the line on snacks. You tried to hold the line on volume.` : "Snack politics got serious.",
      history: "I negotiated for a snack with toddler-level intensity.",
      bondDelta: family ? randInt(-2, 3) : 0,
      stats: [{ stat: "happiness", label: "Happiness", delta: randInt(-2, 5) }],
    },
    {
      title: "Potty breakthrough",
      message: "The routine finally clicked for one clean, celebrated moment.",
      history: "Potty training clicked for a moment. Everyone celebrated like it was a graduation.",
      stats: [
        { stat: "intelligence", label: "Intelligence", delta: randInt(2, 4) },
        { stat: "happiness", label: "Happiness", delta: randInt(3, 7) },
      ],
    },
    {
      title: "Toy standoff",
      message: "Sharing sounded nice in theory. In practice, the toy stayed in your hands.",
      history: "I got into a toy standoff and refused to share.",
      stats: [
        { stat: "stress", label: "Stress", delta: randInt(2, 5) },
        { stat: "happiness", label: "Happiness", delta: -randInt(1, 4) },
      ],
    },
  ];
}

function childEvents(updated) {
  const friend = getFriend(updated) || randChoice(updated.classmates || []);
  return [
    {
      title: "Lunch table opening",
      person: friend,
      message: friend ? `${friend.firstName} waved you over at lunch. It made school feel less enormous.` : "A small lunch table moment made school feel less enormous.",
      history: friend ? `${friend.firstName} waved me over at lunch.` : "Someone waved me over at lunch.",
      bondDelta: friend ? randInt(2, 6) : 0,
      stats: [{ stat: "happiness", label: "Happiness", delta: randInt(3, 7) }],
    },
    {
      title: "Phone envy",
      message: "Someone showed up with a phone, and suddenly the future had a screen in it.",
      history: "A classmate had a phone, and I wanted one immediately.",
      stats: [
        { stat: "happiness", label: "Happiness", delta: randInt(-2, 3) },
        { stat: "stress", label: "Stress", delta: randInt(1, 4) },
      ],
      callout: "Phone requests are available through parent interactions later in childhood.",
    },
    {
      title: "Teacher noticed",
      message: "A teacher noticed the effort instead of only the result.",
      history: "My teacher noticed that I was trying, not just whether I was right.",
      stats: [
        { stat: "intelligence", label: "Intelligence", delta: randInt(1, 4) },
        { stat: "happiness", label: "Happiness", delta: randInt(2, 6) },
      ],
    },
    {
      title: "Playground politics",
      message: "The rules of the game changed halfway through, and so did the social weather.",
      history: "Playground politics got weird during a game.",
      stats: [
        { stat: "stress", label: "Stress", delta: randInt(1, 5) },
        { stat: "intelligence", label: "Intelligence", delta: 1 },
      ],
    },
    {
      title: "House invite",
      person: friend,
      message: friend ? `${friend.firstName} asked if you wanted to come over after school. It felt like a real friendship milestone.` : "A classmate invited you over after school, and it made the friendship thing feel more real.",
      history: friend ? `${friend.firstName} invited me over after school.` : "A classmate invited me over after school.",
      bondDelta: friend ? randInt(3, 7) : 0,
      stats: [{ stat: "happiness", label: "Happiness", delta: randInt(3, 7) }],
      callout: "Childhood social arcs now lean into hangouts instead of dates.",
    },
  ];
}

function preteenEvents(updated) {
  const friend = getFriend(updated) || randChoice(updated.classmates || []);
  return [
    {
      title: "Group chat gravity",
      person: friend,
      message: friend ? `${friend.firstName} pulled you into a group chat. It felt exciting and slightly dangerous.` : "A group chat formed and immediately started shaping the year.",
      history: friend ? `${friend.firstName} added me to a group chat.` : "I got pulled into a group chat.",
      bondDelta: friend ? randInt(1, 5) : 0,
      stats: [
        { stat: "happiness", label: "Happiness", delta: randInt(2, 6) },
        { stat: "stress", label: "Stress", delta: randInt(1, 4) },
      ],
    },
    {
      title: "Allowance pressure",
      message: "Money started feeling less imaginary once everyone wanted snacks, games, and little upgrades.",
      history: "I started thinking about allowance and all the small things I wanted.",
      stats: [{ stat: "stress", label: "Stress", delta: randInt(1, 4) }],
      callout: "Allowance requests are available through parent interactions.",
    },
    {
      title: "Crush rumor",
      person: friend,
      message: "Someone said someone's name too loudly, and the whole room suddenly had opinions.",
      history: "A crush rumor made the school day feel louder than usual.",
      bondDelta: friend ? randInt(-2, 4) : 0,
      stats: [
        { stat: "happiness", label: "Happiness", delta: randInt(-1, 4) },
        { stat: "stress", label: "Stress", delta: randInt(2, 6) },
      ],
      callout: "Preteen romance stays PG.",
    },
    {
      title: "Skill spark",
      message: "You found a topic online and stayed curious longer than expected.",
      history: "I found something online that made me want to learn more.",
      stats: [
        { stat: "intelligence", label: "Intelligence", delta: randInt(2, 5) },
        { stat: "happiness", label: "Happiness", delta: randInt(1, 4) },
      ],
    },
    {
      title: "Friend invite",
      person: friend,
      message: friend ? `${friend.firstName} asked you to come over, and the invite suddenly made school feel more personal.` : "A friend invited you over, and it changed the feel of the week.",
      history: friend ? `${friend.firstName} invited me over after school.` : "A friend invited me over after school.",
      bondDelta: friend ? randInt(2, 6) : 0,
      stats: [{ stat: "happiness", label: "Happiness", delta: randInt(2, 6) }],
    },
  ];
}

function teenEvents(updated) {
  const friend = getFriend(updated) || randChoice(updated.classmates || []);
  return [
    {
      title: "Dream said out loud",
      person: friend,
      message: friend ? `${friend.firstName} asked what you actually want to become, and the answer felt less casual than expected.` : "Someone asked what you actually want to become.",
      history: friend ? `${friend.firstName} asked about my future, and I answered honestly.` : "I told someone what I want my future to look like.",
      bondDelta: friend ? randInt(2, 6) : 0,
      stats: [
        { stat: "happiness", label: "Happiness", delta: randInt(2, 6) },
        { stat: "stress", label: "Stress", delta: randInt(0, 3) },
      ],
    },
    {
      title: "Car fantasy",
      message: "A set of keys in someone else's hand made independence feel close enough to bother you.",
      history: "I started thinking seriously about cars and freedom.",
      stats: [
        { stat: "happiness", label: "Happiness", delta: randInt(1, 4) },
        { stat: "stress", label: "Stress", delta: randInt(1, 4) },
      ],
    },
    {
      title: "Social media heat",
      message: "A post did better than expected, and the attention felt good until it felt like pressure.",
      history: "A social media post got more attention than expected.",
      stats: [
        { stat: "fame", label: "Fame", delta: 1 },
        { stat: "stress", label: "Stress", delta: randInt(1, 5) },
      ],
    },
    {
      title: "Late-night study push",
      message: "You tried to force a better grade through sheer stubbornness.",
      history: "I stayed up late trying to pull my grades in the right direction.",
      stats: [
        { stat: "intelligence", label: "Intelligence", delta: randInt(2, 5) },
        { stat: "stress", label: "Stress", delta: randInt(2, 6) },
      ],
    },
  ];
}

function youngAdultEvents(updated) {
  const romance = getRomance(updated);
  const friend = getFriend(updated);
  return [
    {
      title: "Dinner invitation",
      person: romance || friend,
      message: romance ? `${romance.firstName} wanted a real date night, not just another casual hang.` : friend ? `${friend.firstName} wanted to catch up over dinner.` : "A dinner invite made the week feel more social.",
      history: romance ? `${romance.firstName} and I talked about a real dinner date.` : friend ? `${friend.firstName} and I planned dinner.` : "I considered saying yes to a dinner invite.",
      bondDelta: romance || friend ? randInt(2, 6) : 0,
      stats: [{ stat: "happiness", label: "Happiness", delta: randInt(2, 6) }],
    },
    {
      title: "Apartment daydream",
      message: "You looked at listings and started measuring your current life against a cleaner version of it.",
      history: "I looked at homes and apartments I might want one day.",
      stats: [
        { stat: "happiness", label: "Happiness", delta: randInt(1, 4) },
        { stat: "stress", label: "Stress", delta: randInt(1, 4) },
      ],
      callout: "Full housing ownership is a future system.",
    },
    {
      title: "Outfit reset",
      message: "A new look crossed your mind, less as vanity and more as a way to become someone on purpose.",
      history: "I thought about changing my look.",
      stats: [
        { stat: "attractiveness", label: "Attractiveness", delta: randInt(1, 3) },
        { stat: "happiness", label: "Happiness", delta: randInt(1, 4) },
      ],
    },
    {
      title: "Burnout whisper",
      message: "Nothing collapsed, but your body clearly asked for a slower day.",
      history: "I felt burnout creeping in and knew I needed to slow down.",
      stats: [
        { stat: "stress", label: "Stress", delta: randInt(2, 6) },
        { stat: "health", label: "Health", delta: -randInt(0, 2) },
      ],
    },
  ];
}

function adultEvents(updated) {
  const family = getFamily(updated);
  const romance = getRomance(updated);
  return [
    {
      title: "Parent dinner thought",
      person: family,
      message: family ? `You thought about taking ${family.firstName} out and being the one who handles the bill for once.` : "You thought about taking family out and being the steady one for once.",
      history: family ? `I thought about taking ${family.firstName} out to dinner.` : "I thought about taking family out to dinner.",
      bondDelta: family ? randInt(1, 4) : 0,
      stats: [{ stat: "happiness", label: "Happiness", delta: randInt(1, 4) }],
    },
    {
      title: "Relationship temperature check",
      person: romance,
      message: romance ? `${romance.firstName} seemed to want more clarity about where this is going.` : "The relationship side of life felt quiet enough to notice.",
      history: romance ? `${romance.firstName} and I had a quiet relationship temperature check.` : "I noticed how quiet romance has been lately.",
      bondDelta: romance ? randInt(-1, 4) : 0,
      stats: [{ stat: "stress", label: "Stress", delta: randInt(0, 4) }],
    },
    {
      title: "Cosmetic curiosity",
      message: "You caught yourself wondering what you would change if money and judgment were not part of it.",
      history: "I caught myself thinking about cosmetic changes.",
      stats: [
        { stat: "happiness", label: "Happiness", delta: randInt(-1, 3) },
        { stat: "stress", label: "Stress", delta: randInt(0, 3) },
      ],
      callout: "Cosmetic choices are available in Activities for adults.",
    },
    {
      title: "Pet-shaped quiet",
      createPet: true,
      message: "A pet drifted into the emotional center of the house for a while.",
      history: "A pet became part of the quieter side of my life.",
      bondDelta: randInt(3, 8),
      stats: [
        { stat: "happiness", label: "Happiness", delta: randInt(3, 7) },
        { stat: "stress", label: "Stress", delta: -randInt(1, 5) },
      ],
      callout: "Pets are lightweight relationship hooks in this pass.",
    },
  ];
}

function elderEvents(updated) {
  const family = getFamily(updated);
  const pet = (updated.relationships || []).find((person) => person.relation === "Pet" || person.relationshipStatus === "pet");
  return [
    {
      title: "Doctor visit resistance",
      message: "A checkup sounded sensible, which somehow made it easier to avoid.",
      history: "I resisted scheduling a doctor's visit even though I knew I should.",
      stats: [
        { stat: "stress", label: "Stress", delta: randInt(1, 5) },
        { stat: "health", label: "Health", delta: -randInt(0, 2) },
      ],
    },
    {
      title: "Health kick",
      message: "You decided the next chapter still deserves movement, even if the pace has changed.",
      history: "I started a small health kick and tried to move more.",
      stats: [
        { stat: "health", label: "Health", delta: randInt(2, 5) },
        { stat: "stress", label: "Stress", delta: -randInt(1, 4) },
      ],
    },
    {
      title: "Family memory loop",
      person: family,
      message: family ? `${family.firstName} brought up an old story you had almost forgotten.` : "An old family memory came back with surprising force.",
      history: family ? `${family.firstName} reminded me of an old family story.` : "An old family story came back to me.",
      bondDelta: family ? randInt(2, 6) : 0,
      stats: [{ stat: "happiness", label: "Happiness", delta: randInt(2, 6) }],
    },
    {
      title: "Companion quiet",
      person: pet,
      createPet: !pet,
      message: "The quiet felt less empty with a small companion nearby.",
      history: "A pet kept me company during a quiet stretch.",
      bondDelta: randInt(4, 9),
      stats: [
        { stat: "happiness", label: "Happiness", delta: randInt(3, 8) },
        { stat: "stress", label: "Stress", delta: -randInt(2, 6) },
      ],
    },
    {
      title: "Legacy question",
      message: "You wondered which parts of the story people will remember and which parts only mattered because you lived them.",
      history: "I wondered what this life will leave behind.",
      stats: [
        { stat: "happiness", label: "Happiness", delta: randInt(-1, 4) },
        { stat: "intelligence", label: "Intelligence", delta: randInt(1, 3) },
      ],
    },
  ];
}

export function triggerLifeStagePopupEvent(life) {
  const updated = deepClone(life);
  if (!updated.promptState) updated.promptState = {};
  if (updated.promptState.lastLifeStagePopupAge === updated.age) return null;

  const stage = getContentStage(updated.age);
  const chanceByStage = {
    infant: 0.32,
    toddler: 0.34,
    child: 0.36,
    preteen: 0.36,
    teen: 0.34,
    youngAdult: 0.3,
    adult: 0.26,
    elder: 0.36,
  };

  if (Math.random() > (chanceByStage[stage] || 0.3)) return null;

  const eventPools = {
    infant: infantEvents,
    toddler: toddlerEvents,
    child: childEvents,
    preteen: preteenEvents,
    teen: teenEvents,
    youngAdult: youngAdultEvents,
    adult: adultEvents,
    elder: elderEvents,
  };

  const buildPool = eventPools[stage] || adultEvents;
  const event = randChoice(buildPool(updated));
  updated.promptState.lastLifeStagePopupAge = updated.age;
  return applyEvent(updated, event);
}
