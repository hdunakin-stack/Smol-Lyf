import { deepClone, randChoice, randInt } from "../utils/random.js";
import { addHistory } from "../core/gameState.js";

function clampStat(value) {
  return Math.max(0, Math.min(100, Number(value || 0)));
}

function ensureFlags(updated) {
  if (!updated.identityFlags) {
    updated.identityFlags = {};
  }
  if (!updated.promptState) {
    updated.promptState = {};
  }
}

function buildSource(kind, person, extra = {}) {
  return {
    kind,
    person,
    score: clampStat(person?.bond || 45),
    ...extra,
  };
}

function getTeamContext(life) {
  const activityKey = (life.extracurriculars || []).find((activity) => {
    const details = life.extracurricularDetails?.[activity];
    return details?.teammates?.length;
  });
  if (!activityKey) return null;

  return {
    activityKey,
    people: life.extracurricularDetails?.[activityKey]?.teammates || [],
    label:
      activityKey === "basketball" ? "basketball team"
        : activityKey === "soccer" ? "soccer team"
          : activityKey === "football" ? "football team"
            : activityKey === "tennis" ? "tennis team"
              : activityKey === "wrestling" ? "wrestling team"
                : activityKey === "band" ? "band"
                  : activityKey === "choir" ? "choir"
                    : activityKey,
  };
}

function getSourcePools(life) {
  const schoolPool = (life.classmates || []).map((person) => buildSource("school", person, { context: "school" }));
  const workPool = [
    ...(life.fullTimeJob?.coworkers || []).map((person) => buildSource("coworker", person, { context: "work" })),
    ...(life.fullTimeJob?.manager?.id ? [buildSource("manager", life.fullTimeJob.manager, { context: "work" })] : []),
  ];
  const teamContext = getTeamContext(life);
  const teamPool = (teamContext?.people || []).map((person) => buildSource("team", person, { context: teamContext.label, activityKey: teamContext.activityKey }));
  const socialPool = (life.relationships || [])
    .filter((person) => !["family", "married", "engaged"].includes(person.relationshipStatus))
    .map((person) => buildSource("social", person, { context: person.relation || person.relationshipStatus }));

  return {
    schoolPool,
    workPool,
    teamPool,
    socialPool,
  };
}

function chooseFromPool(pool, preferLowerBond = false) {
  if (!pool.length) return null;
  if (!preferLowerBond) return randChoice(pool);
  const sorted = [...pool].sort((a, b) => Number(a.score || 0) - Number(b.score || 0));
  return randChoice(sorted.slice(0, Math.min(3, sorted.length)));
}

function buildPrompt(id, source, config) {
  if (!source?.person) return null;
  return {
    id,
    category: config.category,
    context: source.context,
    title: config.title(source.person, source),
    person: source.person,
    question: config.question(source.person, source),
    tone: config.tone || "neutral",
    choices: config.choices,
  };
}

const PROMPT_BUILDERS = [
  {
    id: "school-identity-question",
    category: "school-personal",
    available: (pools) => pools.schoolPool.length,
    build: (life, pools) => buildPrompt("school-identity-question", chooseFromPool(pools.schoolPool, true), {
      category: "school-personal",
      title: (person) => `${person.firstName} asked something personal`,
      question: (person) => `${person.firstName} asked if you were into guys, girls, or both.`,
      choices: [
        { id: "straight", label: "I'm straight", tone: "honest" },
        { id: "gay", label: "I'm gay", tone: "honest" },
        { id: "bisexual", label: "I'm bisexual", tone: "honest" },
        { id: "figuring-out", label: "I'm still figuring it out", tone: "figuring-it-out" },
        { id: "back-off", label: "Back off", tone: "aggressive" },
      ],
    }),
  },
  {
    id: "school-peer-pressure",
    category: "school-pressure",
    available: (pools) => pools.schoolPool.length,
    build: (life, pools) => buildPrompt("school-peer-pressure", chooseFromPool(pools.schoolPool, true), {
      category: "school-pressure",
      title: (person) => `${person.firstName} tried to pull you into the scene`,
      question: (person) => `${person.firstName} asked why you've been keeping to yourself instead of hanging around after school.`,
      choices: [
        { id: "join-in", label: "Say you'll come around more", tone: "honest" },
        { id: "play-cool", label: "Play it cool", tone: "evasive" },
        { id: "ask-why", label: "Ask what they mean", tone: "curious" },
        { id: "snap", label: "Get irritated", tone: "aggressive" },
      ],
    }),
  },
  {
    id: "team-culture",
    category: "team-pressure",
    available: (pools) => pools.teamPool.length,
    build: (life, pools) => buildPrompt("team-culture", chooseFromPool(pools.teamPool, true), {
      category: "team-pressure",
      title: (person, source) => `${person.firstName} tested the team vibe`,
      question: (person, source) => `${person.firstName} asked if you were really all-in on the ${source.context}, or just passing through.`,
      choices: [
        { id: "all-in", label: "Say you're locked in", tone: "honest" },
        { id: "lighten-up", label: "Keep it light", tone: "evasive" },
        { id: "feel-it-out", label: "Say you're still figuring it out", tone: "figuring-it-out" },
        { id: "push-back", label: "Tell them to relax", tone: "aggressive" },
      ],
    }),
  },
  {
    id: "coworker-boundary",
    category: "work-personal",
    available: (pools, life) => Number(life.age || 0) >= 18 && pools.workPool.length,
    build: (life, pools) => buildPrompt("coworker-boundary", chooseFromPool(pools.workPool, true), {
      category: "work-personal",
      title: (person) => `${person.firstName} crossed into personal territory`,
      question: (person) => `${person.firstName} asked whether you were seeing anyone, then kept the conversation hanging there a little too long.`,
      choices: [
        { id: "answer-cleanly", label: "Answer plainly", tone: "honest" },
        { id: "sidestep", label: "Sidestep it", tone: "evasive" },
        { id: "tease-back", label: "Ask why they want to know", tone: "curious" },
        { id: "shut-down", label: "Shut it down", tone: "aggressive" },
      ],
    }),
  },
  {
    id: "attraction-ambiguity",
    category: "social-attraction",
    available: (pools) => pools.socialPool.length || pools.schoolPool.length,
    build: (life, pools) => {
      const pool = pools.socialPool.length ? pools.socialPool : pools.schoolPool;
      return buildPrompt("attraction-ambiguity", chooseFromPool(pool, true), {
        category: "social-attraction",
        title: (person) => `${person.firstName} put a little meaning behind the moment`,
        question: (person) => `${person.firstName} asked whether the vibe between you was just friendly, or maybe something more.`,
        choices: [
          { id: "just-friends", label: "Keep it friendly", tone: "evasive" },
          { id: "be-open", label: "Admit there's a vibe", tone: "honest" },
          { id: "not-sure", label: "Say you're not sure yet", tone: "figuring-it-out" },
          { id: "deflect", label: "Turn it into a joke", tone: "curious" },
        ],
      });
    },
  },
  {
    id: "clique-boundary",
    category: "group-pressure",
    available: (pools, life) => Boolean(life.clique) && (pools.schoolPool.length || pools.socialPool.length),
    build: (life, pools) => {
      const pool = pools.socialPool.length ? pools.socialPool : pools.schoolPool;
      return buildPrompt("clique-boundary", chooseFromPool(pool, true), {
        category: "group-pressure",
        title: (person) => `${person.firstName} pushed the social line a little`,
        question: (person) => `${person.firstName} asked whether you were really with the group, or just floating around when it was convenient.`,
        choices: [
          { id: "ride-with-group", label: "Say you're in it for real", tone: "honest" },
          { id: "keep-loose", label: "Keep it loose", tone: "evasive" },
          { id: "push-back", label: "Say you don't owe anyone that", tone: "aggressive" },
          { id: "ask-what-they-mean", label: "Ask what they want from you", tone: "curious" },
        ],
      });
    },
  },
  {
    id: "manager-pressure",
    category: "work-pressure",
    available: (pools, life) => Number(life.age || 0) >= 18 && pools.workPool.some((source) => source.kind === "manager"),
    build: (life, pools) => {
      const managerSource = pools.workPool.find((source) => source.kind === "manager");
      return buildPrompt("manager-pressure", managerSource, {
        category: "work-pressure",
        title: (person) => `${person.firstName} put more weight on the job`,
        question: (person) => `${person.firstName} hinted that people who want bigger opportunities need to prove they can be available without a lot of excuses.`,
        choices: [
          { id: "lean-in", label: "Say you're ready for more", tone: "honest" },
          { id: "draw-line", label: "Say you need balance too", tone: "curious" },
          { id: "nod-and-move", label: "Just nod and move on", tone: "evasive" },
          { id: "resent-it", label: "Push back hard", tone: "aggressive" },
        ],
      });
    },
  },
];

export function generateNpcPrompt(life) {
  if (!life || Number(life.age || 0) < 12) return null;
  if (life.promptState?.lastPromptAge === life.age) return null;

  const pools = getSourcePools(life);
  const available = PROMPT_BUILDERS.filter((builder) => builder.available(pools, life));
  if (!available.length) return null;

  const weighted = available.flatMap((builder) => {
    if (builder.category === "school-pressure" || builder.category === "team-pressure" || builder.category === "work-personal") {
      return [builder, builder];
    }
    return [builder];
  });

  const prompt = randChoice(weighted).build(life, pools);
  return prompt || null;
}

function writeHistoryForPrompt(updated, prompt, choiceId) {
  const name = prompt?.person?.firstName || "Someone";
  const variants = {
    "school-identity-question": {
      straight: `${name} asked something personal about my identity, and I answered honestly.`,
      gay: `${name} asked something personal about my identity, and I answered honestly.`,
      bisexual: `${name} asked something personal about my identity, and I answered honestly.`,
      "figuring-out": `${name} asked something personal, and I said I was still figuring it out.`,
      "back-off": `${name} pushed a personal question and I shut it down fast.`,
    },
    "school-peer-pressure": {
      "join-in": `${name} called me out for keeping to myself, and I said I'd show up more.`,
      "play-cool": `${name} asked why I'd been distant after school, and I played it off.`,
      "ask-why": `${name} asked why I kept my distance, and I pushed the conversation further instead.`,
      snap: `${name} tried to pull me into the social scene, and I got irritated.`,
    },
    "team-culture": {
      "all-in": `${name} asked how serious I was about the team, and I said I was all-in.`,
      "lighten-up": `${name} checked whether I was serious about the team, and I kept things light.`,
      "feel-it-out": `${name} asked whether I was really all-in, and I admitted I'm still figuring it out.`,
      "push-back": `${name} questioned my commitment to the team, and I pushed back.`,
    },
    "coworker-boundary": {
      "answer-cleanly": `${name} asked a personal question at work, and I answered plainly.`,
      sidestep: `${name} got personal at work, and I kept the answer vague.`,
      "tease-back": `${name} asked a personal question at work, and I tossed it back with a smirk.`,
      "shut-down": `${name} crossed a line at work, and I shut the conversation down.`,
    },
    "attraction-ambiguity": {
      "just-friends": `${name} asked what the vibe between us meant, and I kept it friendly.`,
      "be-open": `${name} asked what the vibe between us meant, and I admitted there might be something there.`,
      "not-sure": `${name} asked what the vibe between us meant, and I said I wasn't sure yet.`,
      deflect: `${name} asked if there was something more between us, and I dodged it with a joke.`,
    },
    "clique-boundary": {
      "ride-with-group": `${name} questioned how real I was with the group, and I said I was genuinely in it.`,
      "keep-loose": `${name} pushed me about the group vibe, and I kept the answer loose.`,
      "push-back": `${name} tried to turn group energy into a loyalty test, and I pushed back.`,
      "ask-what-they-mean": `${name} questioned my place in the group, and I made them explain themselves.`,
    },
    "manager-pressure": {
      "lean-in": `${name} hinted I needed to prove myself more at work, and I leaned into it.`,
      "draw-line": `${name} pushed harder on work expectations, and I said I needed some balance too.`,
      "nod-and-move": `${name} hinted I needed to be more available at work, and I let the comment slide by.`,
      "resent-it": `${name} pushed harder on work expectations, and I pushed back too strongly.`,
    },
  };

  const entry = variants[prompt?.id]?.[choiceId];
  if (entry) addHistory(updated, entry);
}

function applyToMatchingPeople(updated, sourceId, updater) {
  const apply = (person) => updater({ ...person });

  updated.relationships = (updated.relationships || []).map((person) => (person.id === sourceId ? apply(person) : person));
  updated.classmates = (updated.classmates || []).map((person) => (person.id === sourceId ? apply(person) : person));

  if (updated.fullTimeJob?.coworkers) {
    updated.fullTimeJob.coworkers = updated.fullTimeJob.coworkers.map((person) => (person.id === sourceId ? apply(person) : person));
  }
  if (updated.fullTimeJob?.manager?.id === sourceId) {
    updated.fullTimeJob.manager = apply(updated.fullTimeJob.manager);
  }

  if (updated.extracurricularDetails) {
    Object.keys(updated.extracurricularDetails).forEach((key) => {
      const details = updated.extracurricularDetails[key];
      if (details?.teammates) {
        details.teammates = details.teammates.map((person) => (person.id === sourceId ? apply(person) : person));
      }
    });
  }
}

export function resolveNpcPrompt(life, prompt, choiceId) {
  const updated = deepClone(life);
  ensureFlags(updated);

  const sourceId = prompt?.person?.id;
  let bondDelta = 0;
  let happinessDelta = 0;
  let stressDelta = 0;
  let message = "The moment passed and left a small shift behind.";
  let callout = null;

  switch (prompt?.id) {
    case "school-identity-question":
      if (["straight", "gay", "bisexual"].includes(choiceId)) {
        updated.identityFlags.orientation = choiceId;
        bondDelta = randInt(1, 3);
        happinessDelta = randInt(0, 2);
        message = `${prompt.person.firstName} took the answer in stride, and the moment felt a little more real than awkward.`;
        callout = "You answered plainly and let the story define itself a little more clearly.";
      } else if (choiceId === "figuring-out") {
        updated.identityFlags.orientation = updated.identityFlags.orientation || "figuring-out";
        bondDelta = 1;
        stressDelta = -1;
        message = `You left the answer open-ended, and ${prompt.person.firstName} did not push harder.`;
        callout = "Some answers can stay unresolved until the story catches up to them.";
      } else {
        bondDelta = -3;
        stressDelta = 2;
        message = `The mood turned sharp fast, and ${prompt.person.firstName} backed off.`;
        callout = "You shut the conversation down, but the tension lingered.";
      }
      break;

    case "school-peer-pressure":
      if (choiceId === "join-in") {
        bondDelta = 2;
        happinessDelta = 1;
        message = `${prompt.person.firstName} seemed glad you met the moment halfway.`;
        callout = "A little social effort can soften the edges of a school year.";
      } else if (choiceId === "play-cool") {
        message = "You let the conversation drift without giving away much.";
      } else if (choiceId === "ask-why") {
        bondDelta = 1;
        message = `The conversation got more honest once ${prompt.person.firstName} had to explain what they meant.`;
      } else {
        bondDelta = -2;
        stressDelta = 1;
        message = "The answer landed colder than you meant it to.";
      }
      break;

    case "team-culture":
      if (choiceId === "all-in") {
        bondDelta = 2;
        happinessDelta = 1;
        message = `${prompt.person.firstName} looked satisfied once you made it clear you were committed.`;
      } else if (choiceId === "lighten-up") {
        message = "You kept the pressure low and let the team energy stay casual.";
      } else if (choiceId === "feel-it-out") {
        bondDelta = 1;
        stressDelta = -1;
        message = `${prompt.person.firstName} backed off once you admitted you were still feeling things out.`;
      } else {
        bondDelta = -2;
        stressDelta = 2;
        message = "The exchange got tense and left a little friction behind.";
      }
      break;

    case "coworker-boundary":
      if (choiceId === "answer-cleanly") {
        bondDelta = 1;
        message = `${prompt.person.firstName} took the answer and moved on without making it weirder.`;
      } else if (choiceId === "sidestep") {
        message = "You kept your privacy intact without making a scene.";
      } else if (choiceId === "tease-back") {
        bondDelta = 1;
        happinessDelta = 1;
        message = "You turned the moment playful enough to keep it from getting awkward.";
      } else {
        bondDelta = -2;
        stressDelta = 1;
        message = "You made the boundary clear, and the room got a little colder after that.";
      }
      break;

    case "attraction-ambiguity":
      if (choiceId === "just-friends") {
        message = "You kept the tone friendly and easy to live with.";
      } else if (choiceId === "be-open") {
        bondDelta = 2;
        happinessDelta = 1;
        message = `${prompt.person.firstName} looked relieved that you didn't dodge the vibe entirely.`;
        callout = "The story left a little more room for romance to develop later.";
      } else if (choiceId === "not-sure") {
        bondDelta = 1;
        message = "You left the answer open, and the tension stayed more interesting than awkward.";
      } else {
        message = "The moment survived as a joke, even if it never really got answered.";
      }
      break;

    case "clique-boundary":
      if (choiceId === "ride-with-group") {
        bondDelta = 2;
        happinessDelta = 1;
        message = `${prompt.person.firstName} seemed reassured that you are not just orbiting the group from a distance.`;
      } else if (choiceId === "keep-loose") {
        message = "You kept your footing casual and refused to turn the moment into a loyalty test.";
      } else if (choiceId === "ask-what-they-mean") {
        bondDelta = 1;
        message = `Once ${prompt.person.firstName} had to explain themselves, the whole thing felt less loaded.`;
      } else {
        bondDelta = -2;
        stressDelta = 1;
        message = "The conversation got sharper than it needed to, and the group energy cooled off a bit.";
      }
      break;

    case "manager-pressure":
      if (choiceId === "lean-in") {
        bondDelta = 2;
        stressDelta = 1;
        message = `${prompt.person.firstName} seemed to like the answer, even if it quietly raised the pressure on you.`;
      } else if (choiceId === "draw-line") {
        bondDelta = 1;
        message = "You kept the conversation professional while still protecting your own pace.";
      } else if (choiceId === "nod-and-move") {
        message = "You let the hint pass by without giving it much more weight.";
      } else {
        bondDelta = -2;
        stressDelta = 2;
        message = "The exchange ended with more friction than clarity.";
      }
      break;

    default:
      message = "The moment passed and the connection shifted a little.";
      break;
  }

  if (sourceId) {
    applyToMatchingPeople(updated, sourceId, (person) => ({
      ...person,
      bond: clampStat(Number(person.bond || 0) + bondDelta),
    }));
  }

  updated.happiness = clampStat(Number(updated.happiness || 0) + happinessDelta);
  updated.stress = clampStat(Number(updated.stress || 0) + stressDelta);
  updated.promptState.lastPromptAge = updated.age;
  updated.promptState.lastPromptId = prompt?.id || null;

  writeHistoryForPrompt(updated, prompt, choiceId);

  const changes = [
    bondDelta > 0 ? `+${bondDelta} Bond` : null,
    bondDelta < 0 ? `${bondDelta} Bond` : null,
    happinessDelta > 0 ? `+${happinessDelta} Happiness` : null,
    happinessDelta < 0 ? `${happinessDelta} Happiness` : null,
    stressDelta > 0 ? `+${stressDelta} Stress` : null,
    stressDelta < 0 ? `${stressDelta} Stress` : null,
  ].filter(Boolean);

  return {
    updated,
    actionResult: {
      title: prompt.title,
      name: prompt.person ? `${prompt.person.firstName} ${prompt.person.lastName}` : null,
      message,
      changes,
      callout,
    },
  };
}
