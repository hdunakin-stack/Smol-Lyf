import { getStageLabelFromAge } from "./lifeStages.js";

function normalizeText(text) {
  return String(text || "")
    .replace(/The year slides by with background character energy\./gi, "Nothing really happened this year.")
    .replace(/I survived another trip around the sun\./gi, "Another year passed in the blur of early childhood.")
    .replace(/^[\-\u2022]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function clamp(text, max = 120) {
  const value = normalizeText(text);
  if (value.length <= max) return value;
  return `${value.slice(0, max - 3).trim()}...`;
}

function inferTags(text) {
  const lower = normalizeText(text).toLowerCase();
  const tags = [];

  if (/(mother|father|sibling|parents|family|married|baby)/.test(lower)) tags.push("Family");
  if (/(school|classmates|study|teacher|grade|report card|graduat)/.test(lower)) tags.push("School");
  if (/(date|boyfriend|girlfriend|marry|proposal|kiss|love)/.test(lower)) tags.push("Relationship");
  if (/(job|career|work|salary|promotion)/.test(lower)) tags.push("Career");
  if (/(money|\$|loan|tuition)/.test(lower)) tags.push("Finance");
  if (/(club|team|basketball|soccer|football|band|choir|activity)/.test(lower)) tags.push("Activity");
  if (/(born|first|joined|finished|won|offer|accepted|graduat)/.test(lower)) tags.push("Milestone");

  return tags.slice(0, 2);
}

function analyzeEvents(events) {
  const buckets = {
    family: 0,
    romance: 0,
    schoolWork: 0,
    milestone: 0,
    conflict: 0,
    wins: 0,
    losses: 0,
    chaos: 0,
    quiet: 0,
  };

  events.forEach((event) => {
    const lower = normalizeText(event).toLowerCase();

    if (/(mother|father|sibling|parents|family|baby|married|home)/.test(lower)) buckets.family += 1;
    if (/(date|dating|boyfriend|girlfriend|engaged|married|kiss|love|romance|proposal|cheat|affair|hookup)/.test(lower)) buckets.romance += 1;
    if (/(school|classmate|teacher|study|homework|grade|report card|academ|job|work|career|promotion|salary|tuition|university|college)/.test(lower)) buckets.schoolWork += 1;
    if (/(first |started|joined|accepted|graduat|born|promoted|engaged|married|had a baby|offer|finished|entered)/.test(lower)) buckets.milestone += 1;
    if (/(argu|fight|declined|decline|rejected|reject|insult|broke up|awkward|tense|drama|conflict|stole|cheat|affair|screaming)/.test(lower)) buckets.conflict += 1;
    if (/(won|accepted|promoted|passed|helped|grew|improved|stronger|friendship unlocked|gave me \$|yes!|came through)/.test(lower)) buckets.wins += 1;
    if (/(lost|fired|declined|rejected|could not afford|broke up|denied|failed|didn't make it|hanging by a thread)/.test(lower)) buckets.losses += 1;
    if (/(messy|chaos|wild|scandal|dramatic|spiral|blowup|brutal|massive fight)/.test(lower)) buckets.chaos += 1;
    if (/(nothing really happened|same old same old|quiet year passed|not much changed|year passed without much changing)/.test(lower)) buckets.quiet += 1;
  });

  return buckets;
}

function getDominantBuckets(buckets) {
  return Object.entries(buckets)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);
}

function buildSummary(cleanEvents, buckets) {
  const dominant = getDominantBuckets(buckets);
  const hasManyEvents = cleanEvents.length >= 4;

  if (!dominant.length || (buckets.quiet > 0 && cleanEvents.length <= 2 && buckets.milestone === 0 && buckets.conflict === 0)) {
    return {
      summaryLine: "A quiet chapter. Not much changed, but life kept moving.",
      summarySupport: "The year stayed small, steady, and easy to skim.",
    };
  }

  if (buckets.milestone >= 2 && buckets.family >= 1) {
    return {
      summaryLine: "This year was all about firsts, family, and a chapter taking shape.",
      summarySupport: "Big early moments gave the year its identity.",
    };
  }

  if (buckets.conflict >= 2 && (buckets.losses >= 1 || buckets.chaos >= 1)) {
    return {
      summaryLine: "A messy year of conflict, setbacks, and emotional swings.",
      summarySupport: "Tension kept spilling into the rest of the year.",
    };
  }

  if (buckets.schoolWork >= 2 && buckets.wins >= 1) {
    return {
      summaryLine: "Big momentum this year, with progress, pressure, and visible growth.",
      summarySupport: "School or work started steering the story in a stronger direction.",
    };
  }

  if (buckets.romance >= 1 && buckets.conflict >= 1) {
    return {
      summaryLine: "Emotions ran hot this year, with romance and tension colliding.",
      summarySupport: "Connections mattered, even when they got complicated.",
    };
  }

  if (buckets.family >= 2 && buckets.wins >= 1) {
    return {
      summaryLine: "Family shaped this year more than anything else.",
      summarySupport: "The strongest moments stayed close to home.",
    };
  }

  if (buckets.schoolWork >= 2) {
    return {
      summaryLine: "This year leaned into structure, learning, and forward motion.",
      summarySupport: "The chapter felt defined by responsibilities and routine.",
    };
  }

  if (buckets.wins >= 2) {
    return {
      summaryLine: "A strong year with a few meaningful wins stacked together.",
      summarySupport: "Momentum built quietly across the chapter.",
    };
  }

  if (buckets.losses >= 2) {
    return {
      summaryLine: "This chapter felt heavier, with more setbacks than easy wins.",
      summarySupport: "The year demanded patience more than celebration.",
    };
  }

  if (hasManyEvents) {
    return {
      summaryLine: "A packed year with a lot happening at once.",
      summarySupport: "Several moments pulled the story in different directions.",
    };
  }

  return {
    summaryLine: "A small but meaningful chapter moved the story forward.",
    summarySupport: "Even a lighter year still left a mark.",
  };
}

export function buildAgeSnapshot(age, events) {
  const cleanEvents = (Array.isArray(events) ? events : [])
    .map(normalizeText)
    .filter(Boolean);

  if (cleanEvents.length === 0) return null;

  const buckets = analyzeEvents(cleanEvents);
  const { summaryLine, summarySupport } = buildSummary(cleanEvents, buckets);
  const featuredEvent = clamp(cleanEvents[0], 145);
  const supportingEvents = cleanEvents.slice(0, 2).map((event) => clamp(event, 120));
  const remainingEvents = cleanEvents.slice(2).map((event) => clamp(event, 160));

  return {
    age: Number(age),
    stageLabel: getStageLabelFromAge(age),
    count: cleanEvents.length,
    summaryLine,
    summarySupport,
    featuredEvent,
    supportingEvents,
    remainingEvents,
    overflowCount: Math.max(0, cleanEvents.length - 3),
    tags: inferTags(featuredEvent),
    allEvents: cleanEvents,
  };
}

export function buildHistorySnapshots(history) {
  if (!history || typeof history !== "object") return [];

  return Object.keys(history)
    .sort((a, b) => Number(b) - Number(a))
    .map((age) => buildAgeSnapshot(age, history[age]))
    .filter(Boolean);
}

export function buildRecentHistorySnapshots(history, limit = 4) {
  return buildHistorySnapshots(history).slice(0, limit);
}
