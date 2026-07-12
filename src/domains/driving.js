import { deepClone, randChoice } from "../utils/random.js";

function addDrivingHistory(lifeObj, text) {
  const age = Number(lifeObj.age || 0);
  if (!lifeObj.history) lifeObj.history = {};
  if (!lifeObj.history[age]) lifeObj.history[age] = [];
  lifeObj.history[age].unshift(text);
}

function clampChance(value) {
  return Math.max(0.15, Math.min(0.92, Number(value || 0)));
}

export function ensureDrivingState(lifeObj) {
  if (!lifeObj.licenses || typeof lifeObj.licenses !== "object") {
    lifeObj.licenses = {};
  }
  if (!lifeObj.promptState || typeof lifeObj.promptState !== "object") {
    lifeObj.promptState = {};
  }
  return lifeObj.licenses;
}

export function shouldOfferDrivingTest(life) {
  return Number(life?.age || 0) === 16 && !life?.licenses?.drivers && !life?.promptState?.drivingTestOffered;
}

export function canRetryDrivingTest(life) {
  return Number(life?.age || 0) >= 16 && !life?.licenses?.drivers;
}

function drivingChance(life) {
  const intelligence = Number(life.intelligence || 50);
  const stress = Number(life.stress || 0);
  const practice = Number(life.licenses?.drivingPractice || 0);
  return clampChance(0.38 + intelligence / 250 - stress / 260 + practice * 0.08 + Math.random() * 0.12);
}

export function takeDrivingTest(life) {
  const updated = deepClone(life);
  ensureDrivingState(updated);
  updated.promptState.drivingTestOffered = true;
  updated.promptState.drivingTestResolved = true;

  if (Number(updated.age || 0) < 16) {
    return {
      updated,
      actionResult: {
        title: "Too early",
        message: "Driving tests unlock at 16 in this pass.",
      },
    };
  }

  if (updated.licenses.drivers) {
    return {
      updated,
      actionResult: {
        title: "Already licensed",
        message: "You already have a driver's license.",
      },
    };
  }

  const passed = Math.random() < drivingChance(updated);
  if (passed) {
    updated.licenses.drivers = true;
    updated.happiness = Math.min(100, Number(updated.happiness || 0) + 8);
    updated.stress = Math.max(0, Number(updated.stress || 0) - 2);
    addDrivingHistory(updated, "I passed my driving test and got my license. The world felt bigger immediately.");
    return {
      updated,
      actionResult: {
        title: "Driving test passed",
        message: "The nerves were loud, but the examiner signed off. You can drive now.",
        changes: ["Driver's license", "+8 Happiness", "-2 Stress"],
        callout: "Car ownership is still a future system, but the license flag is now part of this life.",
      },
    };
  }

  updated.stress = Math.min(100, Number(updated.stress || 0) + 5);
  addDrivingHistory(updated, randChoice([
    "I failed the driving test. Parallel parking chose violence.",
    "I took the driving test and did not pass. The examiner was polite, which somehow made it worse.",
    "The driving test got away from me. I can retry after more practice.",
  ]));
  return {
    updated,
    actionResult: {
      title: "Driving test failed",
      message: "It did not break your way this time, but nothing permanent happened.",
      changes: ["+5 Stress"],
      callout: "You can retry later through Activities. Parent driving practice can help.",
    },
  };
}

export function skipDrivingTest(life) {
  const updated = deepClone(life);
  ensureDrivingState(updated);
  updated.promptState.drivingTestOffered = true;
  updated.promptState.drivingTestResolved = true;
  addDrivingHistory(updated, "I skipped the driving test for now. The option is still out there.");
  return {
    updated,
    actionResult: {
      title: "Not yet",
      message: "You decided the license could wait.",
      callout: "A retry action is available later in Activities.",
    },
  };
}

export function getDrivingPractice(life) {
  return Number(life?.licenses?.drivingPractice || 0);
}
