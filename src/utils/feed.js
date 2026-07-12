import { buildRecentHistorySnapshots } from "./history.js";
import { getStageLabelFromAge, isRouteRelevantForStage } from "./lifeStages.js";

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function formatKeyLabel(value) {
  const labels = {
    mathClub: "Math Club",
    scienceClub: "Science Club",
    studentGov: "Student Government",
    basketball: "Basketball",
    soccer: "Soccer",
    football: "Football",
    band: "Band",
    choir: "Choir",
    popular: "Popular Kids",
    athletes: "Athletes",
    nerds: "Science Club",
    artists: "Artists",
    musicians: "Music Scene",
    rebels: "Rebels",
    loners: "Loners",
  };

  return labels[value] || value;
}

export function getRouteAvailability(life) {
  return {
    profile: isRouteRelevantForStage("profile", life),
    relationships: isRouteRelevantForStage("relationships", life),
    occupation: isRouteRelevantForStage("occupation", life),
    activities: isRouteRelevantForStage("activities", life),
    assets: isRouteRelevantForStage("assets", life),
    timeline: isRouteRelevantForStage("timeline", life),
  };
}

export function canAccessRoute(life, route) {
  if (!route || route === "home" || route === "settings") return true;
  const availability = getRouteAvailability(life);
  return availability[route] !== false;
}

function buildQuickChips(life) {
  const availability = getRouteAvailability(life);
  const chips = [
    { id: "social", label: "Social", route: "relationships" },
    { id: "occupation", label: "Occupation", route: "occupation" },
    { id: "activities", label: "Activities", route: "activities" },
  ];

  return chips.filter((chip) => availability[chip.route]);
}

function buildActionCards(life) {
  const availability = getRouteAvailability(life);
  const cards = [];

  if (life.intelligence < 50) {
    cards.push({
      id: "intelligence",
      eyebrow: "Growth",
      title: "Sharpen your mind",
      summary: availability.occupation
        ? "Your intelligence is low enough that school effort would pay off right now."
        : "This story is still in its earliest chapter. Keep checking in on your profile as it opens up.",
      primary: availability.occupation
        ? { label: "Open occupation", type: "route", route: "occupation" }
        : { label: "Open profile", type: "route", route: "profile" },
    });
  }

  if (life.stress >= 35) {
    cards.push({
      id: "stress",
      eyebrow: "Balance",
      title: "Lower your stress",
      summary: availability.activities
        ? "Stress is climbing. A recovery-focused choice would help steady the year."
        : "Stress is climbing, but this chapter is still narrow. Relationships are the strongest outlet right now.",
      primary: availability.activities
        ? { label: "Open activities", type: "route", route: "activities" }
        : { label: "Open social", type: "route", route: "relationships" },
    });
  }

  const lowBondPerson = [...(life.relationships || [])]
    .filter((person) => typeof person.bond === "number")
    .sort((a, b) => a.bond - b.bond)[0];

  if (lowBondPerson && lowBondPerson.bond < 55) {
    cards.push({
      id: "bond",
      eyebrow: "Connection",
      title: "Repair a relationship",
      summary: `${lowBondPerson.firstName} ${lowBondPerson.lastName} feels a little distant right now. A check-in could help.`,
      primary: {
        label: "Open social",
        type: "route",
        route: "relationships",
        focus: {
          section: lowBondPerson.relationshipStatus === "family"
            ? "family"
            : lowBondPerson.relationshipStatus === "friend"
              ? "friends"
              : ["dating", "engaged", "married"].includes(lowBondPerson.relationshipStatus)
                ? "romance"
                : "school",
          personId: lowBondPerson.id,
        },
      },
    });
  }

  if (life.happiness < 55) {
    cards.push({
      id: "happiness",
      eyebrow: "Mood",
      title: "Lift your mood",
      summary: availability.activities
        ? "A self-care move or social reset could change the feel of this chapter."
        : "Your mood is slipping. The people in your world are the strongest lever right now.",
      primary: availability.activities
        ? { label: "Open activities", type: "route", route: "activities" }
        : { label: "Open social", type: "route", route: "relationships" },
    });
  }

  if (cards.length === 0) {
    cards.push({
      id: "momentum",
      eyebrow: "Momentum",
      title: "Keep this life moving",
      summary: "Your core stats are stable. Focus on the strongest system available this year.",
      primary: availability.occupation
        ? { label: "Open occupation", type: "route", route: "occupation" }
        : { label: "Open profile", type: "route", route: "profile" },
    });
  }

  return cards.slice(0, 3);
}

function averageBond(people) {
  if (!people.length) return null;
  return Math.round(people.reduce((sum, person) => sum + Number(person.bond || 0), 0) / people.length);
}

function summarizeSocialHealth(label, people) {
  const average = averageBond(people);
  if (average == null) {
    return {
      id: label.toLowerCase(),
      label,
      value: "Quiet",
      summary: `No major ${label.toLowerCase()} arc is active right now.`,
      score: null,
    };
  }

  let value = "Steady";
  if (average >= 75) value = "Thriving";
  else if (average < 45) value = "Shaky";

  return {
    id: label.toLowerCase(),
    label,
    value,
    summary: `${people.length} ${people.length === 1 ? "connection" : "connections"} in play.`,
    score: average,
  };
}

function buildDynamicGroupPillar(life) {
  const coworkers = life.fullTimeJob?.coworkers || [];
  const isTeamLife = life.extracurriculars?.some((activity) => ["basketball", "soccer", "football", "tennis", "wrestling"].includes(activity));
  const isMusicGroup = life.extracurriculars?.find((activity) => ["band", "choir"].includes(activity));

  if (isTeamLife) {
    const sport = life.extracurriculars.find((activity) => ["basketball", "soccer", "football", "tennis", "wrestling"].includes(activity));
    const teamDetails = life.extracurricularDetails?.[sport];
    const teamSize = teamDetails?.teammates?.length || 0;
    return {
      id: "team",
      label: "Team",
      value: teamDetails?.progress >= 70 ? "Building" : "Early days",
      summary: teamSize
        ? `${teamSize} teammates are shaping this chapter.`
        : `${formatKeyLabel(sport)} is becoming part of daily life.`,
      score: teamDetails?.progress || null,
    };
  }

  if (life.fullTimeJob || life.partTimeJob || coworkers.length > 0) {
    return {
      id: "work",
      label: "Work",
      value: Number(life.stress || 0) >= 45 ? "Demanding" : "Steady",
      summary: coworkers.length
        ? `${coworkers.length} work connections are in orbit right now.`
        : "Work is starting to shape how this life feels day to day.",
      score: coworkers.length ? averageBond(coworkers) : null,
    };
  }

  if (isMusicGroup) {
    return {
      id: isMusicGroup,
      label: formatKeyLabel(isMusicGroup),
      value: "Active",
      summary: `${formatKeyLabel(isMusicGroup)} is part of the social world shaping this year.`,
      score: life.extracurricularDetails?.[isMusicGroup]?.progress || null,
    };
  }

  if (life.clique || life.greekLife) {
    return {
      id: "group",
      label: "Group",
      value: "Active",
      summary: `${life.greekLife?.name || formatKeyLabel(life.clique)} is now part of the social picture.`,
      score: null,
    };
  }

  return null;
}

function buildSocialOverview(life) {
  const relationships = life.relationships || [];
  const family = relationships.filter((person) => person.relationshipStatus === "family");
  const romance = relationships.filter((person) => ["dating", "engaged", "married"].includes(person.relationshipStatus));
  const friends = relationships.filter((person) => person.relationshipStatus === "friend");
  const dynamicGroup = buildDynamicGroupPillar(life);

  const overview = [
    summarizeSocialHealth("Family", family),
    summarizeSocialHealth("Romance", romance),
    summarizeSocialHealth("Friends", friends),
  ];

  if (dynamicGroup) overview.push(dynamicGroup);

  return overview
    .sort((a, b) => {
      const scoreA = typeof a.score === "number" ? a.score : -1;
      const scoreB = typeof b.score === "number" ? b.score : -1;
      return scoreB - scoreA;
    })
    .slice(0, 3);
}

export function buildLifeFeed(life) {
  return {
    quickChips: buildQuickChips(life),
    actions: buildActionCards(life),
    socialOverview: buildSocialOverview(life),
    recentHistory: buildRecentHistorySnapshots(life.history, 4),
    stageLabel: getStageLabelFromAge(life.age),
  };
}
