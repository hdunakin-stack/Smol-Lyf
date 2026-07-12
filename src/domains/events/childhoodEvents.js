// Childhood Events (Ages 5-11)
// 11.13.2025 - v1.07.0: Elementary school childhood events

import { randInt, randChoice, deepClone } from "../../utils/random.js";
import { addHistory } from "../../core/gameState.js";

// ========== CAREER DAYDREAM EVENTS ==========

export function daydreamCareer(life) {
  const updated = deepClone(life);

  const careers = [
    { name: "doctor", career: "doctor", stat: "intelligence", boost: 2 },
    { name: "basketball player", career: "nba", stat: "athleticism", boost: 2 },
    { name: "football player", career: "nfl", stat: "athleticism", boost: 2 },
    { name: "singer", career: "singer", stat: "attractiveness", boost: 2 },
    { name: "teacher", career: "teacher", stat: "intelligence", boost: 2 },
    { name: "astronaut", career: "scientist", stat: "intelligence", boost: 3 },
    { name: "artist", career: "artist", stat: "attractiveness", boost: 2 },
    { name: "police officer", career: "police", stat: "health", boost: 2 }
  ];

  const dream = randChoice(careers);

  const messages = [
    `I daydreamed about being a ${dream.name} when I grow up. That would be so cool!`,
    `I told my teacher I want to be a ${dream.name}. She said I should follow my dreams.`,
    `I imagined myself as a ${dream.name}. I can't wait to grow up!`,
    `I spent recess pretending to be a ${dream.name}. It felt amazing.`
  ];

  addHistory(updated, randChoice(messages));

  // Store the daydream for future career success boost
  if (!updated.careerDaydreams) updated.careerDaydreams = {};
  updated.careerDaydreams[dream.career] = (updated.careerDaydreams[dream.career] || 0) + dream.boost;

  updated.happiness = Math.min(100, updated.happiness + randInt(5, 10));

  return updated;
}

// ========== EARLY TALENT SPARK ==========

export function talentSpark(life) {
  const updated = deepClone(life);

  const talents = [
    {
      type: "drawing",
      messages: [
        "I drew a picture that my teacher put on the wall! Everyone said it was really good.",
        "I love drawing. I spent all afternoon making art.",
        "My parents noticed I'm good at drawing. They got me a sketchbook!"
      ],
      activity: "band",
      stat: "attractiveness",
      boost: 3
    },
    {
      type: "running",
      messages: [
        "I was the fastest kid in gym class today! I love running.",
        "I beat everyone in the race at recess. I'm really fast!",
        "Coach said I'm a natural runner. That made me so happy."
      ],
      activity: "football",
      stat: "athleticism",
      boost: 3
    },
    {
      type: "writing",
      messages: [
        "I wrote a story that my teacher loved. She read it to the whole class!",
        "I enjoy writing in my journal. I have so many ideas.",
        "My creative writing assignment got an A+. I'm good at this!"
      ],
      activity: "none",
      stat: "intelligence",
      boost: 3
    },
    {
      type: "math",
      messages: [
        "I solved a hard math problem before anyone else. I felt smart!",
        "Math is my favorite subject. Numbers just make sense to me.",
        "I helped other kids with their math homework. The teacher was impressed."
      ],
      activity: "mathClub",
      stat: "intelligence",
      boost: 3
    },
    {
      type: "singing",
      messages: [
        "I sang a solo in music class. Everyone clapped!",
        "My teacher said I have a beautiful voice. I love to sing.",
        "I was picked to sing at the school assembly. I can't wait!"
      ],
      activity: "choir",
      stat: "attractiveness",
      boost: 3
    }
  ];

  const talent = randChoice(talents);

  addHistory(updated, randChoice(talent.messages));

  // Store talent for future activity tryout boost
  if (!updated.earlyTalents) updated.earlyTalents = [];
  if (!updated.earlyTalents.includes(talent.activity)) {
    updated.earlyTalents.push(talent.activity);
  }

  // Small stat boost
  updated[talent.stat] = Math.min(100, updated[talent.stat] + talent.boost);
  updated.happiness = Math.min(100, updated.happiness + randInt(8, 15));

  return updated;
}

// ========== TEACHER FEEDBACK ==========

export function teacherFeedback(life) {
  const updated = deepClone(life);

  const feedbackType = Math.random();

  if (feedbackType < 0.4) {
    // Positive feedback
    const positiveMessages = [
      "My teacher praised me for my hard work in class. I felt proud!",
      "I got a gold star on my homework. The teacher said 'Great job!'",
      "My teacher told my parents I'm doing really well in school. They were happy.",
      "I answered a question correctly and the teacher smiled at me. I felt smart."
    ];
    addHistory(updated, randChoice(positiveMessages));
    updated.happiness = Math.min(100, updated.happiness + randInt(8, 15));
    updated.intelligence = Math.min(100, updated.intelligence + randInt(1, 3));

    // Parents pleased
    const mother = updated.relationships?.find(r => r.relation === "Mother");
    const father = updated.relationships?.find(r => r.relation === "Father");

    if (mother) mother.bond = Math.min(100, mother.bond + randInt(2, 5));
    if (father) father.bond = Math.min(100, father.bond + randInt(2, 5));
  }
  else if (feedbackType < 0.7) {
    // Neutral feedback
    const neutralMessages = [
      "My teacher said I'm doing fine in class. Nothing special, just okay.",
      "Report card day. My grades are average. Parents seem content.",
      "Teacher conference went fine. No complaints, no praise."
    ];
    addHistory(updated, randChoice(neutralMessages));
  }
  else {
    // Negative feedback
    const negativeMessages = [
      "My teacher said I daydream too much in class. I need to pay attention.",
      "I got in trouble for talking during class. My parents weren't happy.",
      "My teacher sent a note home about my behavior. I'm in trouble now.",
      "I didn't do well on my test. The teacher wants me to try harder."
    ];
    addHistory(updated, randChoice(negativeMessages));
    updated.happiness = Math.max(0, updated.happiness - randInt(5, 12));
    updated.stress = Math.min(100, updated.stress + randInt(5, 10));

    // Parents concerned
    const mother = updated.relationships?.find(r => r.relation === "Mother");
    const father = updated.relationships?.find(r => r.relation === "Father");

    if (mother) mother.bond = Math.max(0, mother.bond - randInt(1, 4));
    if (father) father.bond = Math.max(0, father.bond - randInt(1, 4));
  }

  return updated;
}

// ========== PLAYGROUND SOCIAL EVENTS ==========

export function playgroundEvent(life) {
  const updated = deepClone(life);

  const eventType = randChoice(["friend", "bully", "leadership", "excluded"]);

  switch (eventType) {
    case "friend": {
      const friendMessages = [
        "I made a new friend at recess! We played tag together.",
        "A kid shared their snack with me at lunch. We're friends now!",
        "I had so much fun playing with my friends today. Recess is the best!"
      ];
      addHistory(updated, randChoice(friendMessages));
      updated.happiness = Math.min(100, updated.happiness + randInt(10, 18));
      updated.attractiveness = Math.min(100, updated.attractiveness + randInt(1, 3));
      break;
    }

    case "bully": {
      const bullyMessages = [
        "An older kid picked on me at recess. I felt scared.",
        "Someone made fun of me on the playground. It hurt my feelings.",
        "A bully pushed me down today. I ran to the teacher crying."
      ];
      addHistory(updated, randChoice(bullyMessages));
      updated.happiness = Math.max(0, updated.happiness - randInt(10, 20));
      updated.stress = Math.min(100, updated.stress + randInt(10, 18));
      break;
    }

    case "leadership": {
      const leaderMessages = [
        "I organized a game at recess and everyone wanted to play! I felt like a leader.",
        "Kids followed my ideas during group time. I'm good at this!",
        "I helped settle an argument between friends. They listened to me."
      ];
      addHistory(updated, randChoice(leaderMessages));
      updated.happiness = Math.min(100, updated.happiness + randInt(12, 20));
      updated.intelligence = Math.min(100, updated.intelligence + randInt(1, 3));
      updated.attractiveness = Math.min(100, updated.attractiveness + randInt(2, 4));
      break;
    }

    case "excluded": {
      const excludedMessages = [
        "Nobody wanted to play with me at recess. I sat alone.",
        "I tried to join a game but they said 'no.' I felt left out.",
        "I ate lunch by myself today. Everyone else had friends."
      ];
      addHistory(updated, randChoice(excludedMessages));
      updated.happiness = Math.max(0, updated.happiness - randInt(12, 20));
      updated.stress = Math.min(100, updated.stress + randInt(8, 15));
      break;
    }
  }

  return updated;
}

// ========== FAMILY QUALITY TIME ==========

export function familyTime(life) {
  const updated = deepClone(life);

  const mother = updated.relationships?.find(r => r.relation === "Mother");
  const father = updated.relationships?.find(r => r.relation === "Father");

  if (!mother && !father) return null;

  const activities = [
    {
      type: "trip",
      messages: [
        "My family went on a trip together! We had so much fun.",
        "We went to the zoo as a family. I saw so many cool animals!",
        "Family road trip! We sang songs in the car and played games."
      ]
    },
    {
      type: "gamenight",
      messages: [
        "We had family game night. Everyone laughed and had fun together.",
        "We played board games as a family. I won one round!",
        "Family game night was awesome. We stayed up late playing."
      ]
    },
    {
      type: "cooking",
      messages: [
        "I helped cook dinner with my family. I felt important!",
        "We made cookies together as a family. I got to lick the spoon!",
        "My parents let me help make breakfast. It was fun working together."
      ]
    }
  ];

  const activity = randChoice(activities);
  addHistory(updated, randChoice(activity.messages));

  if (mother) mother.bond = Math.min(100, mother.bond + randInt(5, 10));
  if (father) father.bond = Math.min(100, father.bond + randInt(5, 10));

  updated.happiness = Math.min(100, updated.happiness + randInt(15, 25));
  updated.stress = Math.max(0, updated.stress - randInt(5, 12));

  return updated;
}

// ========== EVENT TRIGGER ==========

export function triggerChildhoodEvent(life) {
  // Only trigger for ages 5-11
  if (life.age < 5 || life.age >= 12) return null;

  // 25% chance per year (slightly higher than infant events)
  if (Math.random() > 0.25) return null;

  const eventPool = [
    daydreamCareer,
    talentSpark,
    teacherFeedback,
    playgroundEvent,
    familyTime
  ];

  const selectedEvent = randChoice(eventPool);
  const result = selectedEvent(life);

  // familyTime can return null if no parents
  return result || life;
}
