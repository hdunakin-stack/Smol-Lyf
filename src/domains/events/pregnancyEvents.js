// Accidental Pregnancy Events
// 11.15.2025 - v1.07.0: Pregnancy consequence engine

import { randInt, randChoice, deepClone } from "../../utils/random.js";
import { addHistory } from "../../core/gameState.js";

// ========== PREGNANCY TRIGGER ==========

export function checkForPregnancy(life) {
  // Only check if sexually active and has romantic partner
  if (life.age < 16) return null;

  const partner = life.relationships?.find(
    r => r.relationshipStatus === "dating" ||
        r.relationshipStatus === "engaged" ||
        r.relationshipStatus === "married"
  );

  if (!partner) return null;

  // Base pregnancy chance: 5% per year if sexually active
  // Reduced if on birth control (not implemented yet, but can be added)
  const pregnancyChance = 0.05;

  if (Math.random() < pregnancyChance) {
    return {
      pregnant: true,
      partnerId: partner.id,
      partnerName: partner.firstName
    };
  }

  return null;
}

// ========== PREGNANCY DECISION OUTCOMES ==========

export function keepBaby(life, partnerId) {
  const updated = deepClone(life);
  const partner = updated.relationships?.find(r => r.id === partnerId);

  if (!partner) return updated;

  const partnerBond = partner.bond || 50;

  // Partner reaction based on bond and relationship status
  if (partner.relationshipStatus === "married") {
    // Married: generally positive
    if (partnerBond >= 60) {
      addHistory(updated, `${partner.firstName} and I are having a baby! We're both excited to start a family together.`);
      partner.bond = Math.min(100, partner.bond + randInt(10, 20));
      updated.happiness = Math.min(100, updated.happiness + randInt(15, 25));
    } else {
      addHistory(updated, `${partner.firstName} and I are having a baby. Things are tense between us, but we'll make it work.`);
      partner.bond = Math.min(100, partner.bond + randInt(2, 8));
      updated.happiness = Math.min(100, updated.happiness + randInt(5, 12));
      updated.stress = Math.min(100, updated.stress + randInt(10, 18));
    }
  } else if (partner.relationshipStatus === "engaged") {
    // Engaged: mostly positive, some stress
    if (partnerBond >= 50) {
      addHistory(updated, `${partner.firstName} and I are having a baby! We're moving up the wedding and preparing for parenthood.`);
      partner.bond = Math.min(100, partner.bond + randInt(8, 15));
      updated.happiness = Math.min(100, updated.happiness + randInt(10, 20));
      updated.stress = Math.min(100, updated.stress + randInt(8, 15));
    } else {
      addHistory(updated, `${partner.firstName} and I are having a baby. This wasn't the plan, but we're committed.`);
      partner.bond = Math.min(100, partner.bond + randInt(3, 10));
      updated.happiness = Math.min(100, updated.happiness + randInt(3, 10));
      updated.stress = Math.min(100, updated.stress + randInt(15, 25));
    }
  } else {
    // Dating: mixed reactions, higher stress
    if (partnerBond >= 60) {
      addHistory(updated, `${partner.firstName} and I are having a baby. It's unexpected, but we're in this together.`);
      partner.bond = Math.min(100, partner.bond + randInt(5, 12));
      updated.happiness = Math.min(100, updated.happiness + randInt(5, 15));
      updated.stress = Math.min(100, updated.stress + randInt(20, 30));
    } else if (partnerBond >= 40) {
      addHistory(updated, `${partner.firstName} and I are having a baby. I'm scared about how this will change things.`);
      partner.bond = Math.min(100, partner.bond + randInt(0, 8));
      updated.happiness = Math.max(0, updated.happiness - randInt(5, 15));
      updated.stress = Math.min(100, updated.stress + randInt(25, 35));
    } else {
      addHistory(updated, `${partner.firstName} and I are having a baby. Our relationship is rocky and I'm terrified.`);
      partner.bond = Math.max(0, partner.bond - randInt(5, 15));
      updated.happiness = Math.max(0, updated.happiness - randInt(10, 20));
      updated.stress = Math.min(100, updated.stress + randInt(30, 45));
    }
  }

  // Mark as pending birth (will trigger birth event next year)
  if (!updated.pendingBirth) {
    updated.pendingBirth = {
      partnerId: partnerId,
      dueNextYear: true
    };
  }

  return updated;
}

export function askPartnerForTermination(life, partnerId) {
  const updated = deepClone(life);
  const partner = updated.relationships?.find(r => r.id === partnerId);

  if (!partner) return updated;

  const partnerBond = partner.bond || 50;

  // Partner's response based on bond and values
  const agreeChance = partnerBond >= 60 ? 0.7 : partnerBond >= 40 ? 0.4 : 0.2;

  if (Math.random() < agreeChance) {
    // Partner agrees
    addHistory(updated, `I talked to ${partner.firstName} about not keeping the baby. After a difficult conversation, we agreed it's the right choice for us.`);

    partner.bond = Math.max(0, partner.bond - randInt(5, 15));
    updated.stress = Math.min(100, updated.stress + randInt(20, 35));
    updated.happiness = Math.max(0, updated.happiness - randInt(10, 20));

    // Pregnancy resolved
    updated.pendingBirth = null;
  } else {
    // Partner refuses
    if (partnerBond >= 40) {
      addHistory(updated, `I asked ${partner.firstName} about termination, but they want to keep the baby. We're having serious arguments about this.`);
      partner.bond = Math.max(0, partner.bond - randInt(15, 25));
    } else {
      addHistory(updated, `${partner.firstName} was furious when I suggested termination. Our relationship is hanging by a thread.`);
      partner.bond = Math.max(0, partner.bond - randInt(25, 40));

      // High chance of breakup if bond drops too low
      if (partner.bond < 20) {
        partner.relationshipStatus = "ex";
        addHistory(updated, `${partner.firstName} broke up with me over this. They said they can't be with someone who doesn't want the baby.`);
      }
    }

    updated.stress = Math.min(100, updated.stress + randInt(30, 45));
    updated.happiness = Math.max(0, updated.happiness - randInt(15, 30));

    // Still pregnant, must make another choice
    updated.pendingBirth = {
      partnerId: partnerId,
      dueNextYear: true,
      partnerRefusedTermination: true
    };
  }

  return updated;
}

export function denyPaternity(life, partnerId) {
  const updated = deepClone(life);
  const partner = updated.relationships?.find(r => r.id === partnerId);

  if (!partner) return updated;

  // Catastrophic relationship damage
  addHistory(updated, `I told ${partner.firstName} the baby isn't mine. They're devastated and furious. Everything is falling apart.`);

  partner.bond = Math.max(0, partner.bond - randInt(40, 60));
  partner.relationshipStatus = "ex";

  updated.happiness = Math.max(0, updated.happiness - randInt(25, 40));
  updated.stress = Math.min(100, updated.stress + randInt(40, 55));

  // Reputation damage if famous
  if (updated.fame && updated.fame > 20) {
    updated.fame = Math.max(0, updated.fame - randInt(15, 30));
    addHistory(updated, `News of me denying paternity has damaged my public image. People are calling me heartless.`);
  }

  // Pregnancy resolved (partner handles alone)
  updated.pendingBirth = null;

  return updated;
}

export function ghostPartner(life, partnerId) {
  const updated = deepClone(life);
  const partner = updated.relationships?.find(r => r.id === partnerId);

  if (!partner) return updated;

  // Extreme cowardice - worst outcome
  addHistory(updated, `I couldn't handle the pregnancy news. I blocked ${partner.firstName} and disappeared. I hate myself for this.`);

  partner.relationshipStatus = "ex";
  partner.bond = 0;

  updated.happiness = Math.max(0, updated.happiness - randInt(30, 50));
  updated.stress = Math.min(100, updated.stress + randInt(45, 60));

  // Reputation damage if famous
  if (updated.fame && updated.fame > 20) {
    updated.fame = Math.max(0, updated.fame - randInt(20, 40));
    addHistory(updated, `${partner.firstName} went public about me abandoning them pregnant. My reputation is destroyed.`);
  }

  // Chance of family finding out and being disappointed
  const mother = updated.relationships?.find(r => r.relation === "Mother");
  const father = updated.relationships?.find(r => r.relation === "Father");

  if (mother && Math.random() < 0.7) {
    mother.bond = Math.max(0, mother.bond - randInt(20, 35));
    addHistory(updated, `My mother found out what I did. She's ashamed of me.`);
  }

  if (father && Math.random() < 0.7) {
    father.bond = Math.max(0, father.bond - randInt(20, 35));
    addHistory(updated, `My father found out I ghosted ${partner.firstName}. He's disgusted with me.`);
  }

  // Pregnancy resolved (partner handles alone)
  updated.pendingBirth = null;

  return updated;
}

export function coParent(life, partnerId) {
  const updated = deepClone(life);
  const partner = updated.relationships?.find(r => r.id === partnerId);

  if (!partner) return updated;

  const partnerBond = partner.bond || 50;

  // Co-parenting: mature but not romantic
  if (partner.relationshipStatus === "dating") {
    partner.relationshipStatus = "ex";
  }

  if (partnerBond >= 50) {
    addHistory(updated, `${partner.firstName} and I decided to co-parent. We're not together romantically, but we'll raise this child together.`);
    partner.bond = Math.min(100, partner.bond + randInt(5, 15));
    updated.happiness = Math.min(100, updated.happiness + randInt(5, 15));
    updated.stress = Math.min(100, updated.stress + randInt(15, 25));
  } else {
    addHistory(updated, `${partner.firstName} and I are trying to co-parent, but there's a lot of tension between us.`);
    partner.bond = Math.max(0, partner.bond - randInt(5, 12));
    updated.happiness = Math.max(0, updated.happiness - randInt(5, 15));
    updated.stress = Math.min(100, updated.stress + randInt(25, 35));
  }

  // Mark as pending birth
  updated.pendingBirth = {
    partnerId: partnerId,
    dueNextYear: true,
    coParenting: true
  };

  return updated;
}

export function tryToMakeItWork(life, partnerId) {
  const updated = deepClone(life);
  const partner = updated.relationships?.find(r => r.id === partnerId);

  if (!partner) return updated;

  const partnerBond = partner.bond || 50;

  // Committing to the relationship
  if (partner.relationshipStatus === "dating" && partnerBond >= 60) {
    // Dating -> Engaged
    partner.relationshipStatus = "engaged";
    addHistory(updated, `${partner.firstName} and I are having a baby. We got engaged and we're committed to making this work.`);
    partner.bond = Math.min(100, partner.bond + randInt(10, 20));
    updated.happiness = Math.min(100, updated.happiness + randInt(10, 20));
    updated.stress = Math.min(100, updated.stress + randInt(15, 25));
  } else if (partner.relationshipStatus === "dating" && partnerBond >= 40) {
    // Dating, lower bond - stay together but stressed
    addHistory(updated, `${partner.firstName} and I are having a baby. We're staying together and hoping for the best.`);
    partner.bond = Math.min(100, partner.bond + randInt(3, 10));
    updated.happiness = Math.min(100, updated.happiness + randInt(0, 10));
    updated.stress = Math.min(100, updated.stress + randInt(25, 35));
  } else if (partner.relationshipStatus === "dating") {
    // Dating, low bond - forced together, high stress
    addHistory(updated, `${partner.firstName} and I are having a baby. We're trying to stay together but it feels forced.`);
    partner.bond = Math.max(0, partner.bond - randInt(5, 15));
    updated.happiness = Math.max(0, updated.happiness - randInt(10, 20));
    updated.stress = Math.min(100, updated.stress + randInt(30, 45));
  } else if (partner.relationshipStatus === "engaged") {
    // Engaged - accelerate wedding
    partner.relationshipStatus = "married";
    addHistory(updated, `${partner.firstName} and I got married quickly because of the baby. It's a whirlwind, but we're committed.`);
    partner.bond = Math.min(100, partner.bond + randInt(8, 18));
    updated.happiness = Math.min(100, updated.happiness + randInt(10, 20));
    updated.stress = Math.min(100, updated.stress + randInt(10, 20));
  } else {
    // Already married
    addHistory(updated, `${partner.firstName} and I are having a baby. We're committed to making our family work.`);
    partner.bond = Math.min(100, partner.bond + randInt(10, 20));
    updated.happiness = Math.min(100, updated.happiness + randInt(12, 22));
    updated.stress = Math.min(100, updated.stress + randInt(10, 18));
  }

  // Mark as pending birth
  updated.pendingBirth = {
    partnerId: partnerId,
    dueNextYear: true
  };

  return updated;
}

// ========== BIRTH EVENT ==========

export function handleBirth(life) {
  const updated = deepClone(life);

  if (!updated.pendingBirth || !updated.pendingBirth.dueNextYear) {
    return updated;
  }

  const partner = updated.relationships?.find(r => r.id === updated.pendingBirth.partnerId);
  const partnerName = partner ? partner.firstName : "my ex";

  // Generate baby
  const babyGender = randChoice(["Son", "Daughter"]);
  const babyFirstName = babyGender === "Son" ?
    randChoice(["Liam", "Noah", "Oliver", "Elijah", "James", "William", "Benjamin", "Lucas", "Henry", "Alexander"]) :
    randChoice(["Emma", "Olivia", "Ava", "Isabella", "Sophia", "Charlotte", "Mia", "Amelia", "Harper", "Evelyn"]);

  const baby = {
    id: `child_${Date.now()}_${Math.random()}`,
    firstName: babyFirstName,
    lastName: updated.lastName,
    relation: babyGender,
    age: 0,
    bond: 100,
    relationshipStatus: "family"
  };

  if (!updated.relationships) updated.relationships = [];
  updated.relationships.push(baby);

  // Birth announcement
  if (updated.pendingBirth.coParenting) {
    addHistory(updated, `${partnerName} and I welcomed ${babyFirstName} into the world. We're co-parenting and doing our best.`);
  } else if (partner && (partner.relationshipStatus === "married" || partner.relationshipStatus === "engaged")) {
    addHistory(updated, `${partnerName} and I welcomed our ${babyGender.toLowerCase()} ${babyFirstName}! Our family is complete.`);
  } else if (partner) {
    addHistory(updated, `My ${babyGender.toLowerCase()} ${babyFirstName} was born. ${partnerName} and I are navigating parenthood together.`);
  } else {
    addHistory(updated, `I became a parent to ${babyFirstName}. Raising a child alone is harder than I imagined.`);
  }

  // Happiness and stress adjustments
  updated.happiness = Math.min(100, updated.happiness + randInt(15, 30));
  updated.stress = Math.min(100, updated.stress + randInt(20, 35));

  // Clear pending birth
  updated.pendingBirth = null;

  return updated;
}

// ========== MAIN PREGNANCY TRIGGER (called during age-up) ==========

export function triggerPregnancySystem(life) {
  // Check if birth is pending from last year
  if (life.pendingBirth && life.pendingBirth.dueNextYear) {
    return handleBirth(life);
  }

  // Check for new pregnancy
  const pregnancyResult = checkForPregnancy(life);

  if (pregnancyResult && pregnancyResult.pregnant) {
    // Set flag to show modal (handled in App.js)
    const updated = deepClone(life);
    updated.showPregnancyModal = true;
    updated.pregnancyPartner = {
      id: pregnancyResult.partnerId,
      name: pregnancyResult.partnerName
    };
    return updated;
  }

  return null;
}
