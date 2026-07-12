import { showIncome } from "../domains/occupationGating.js";

function formatCurrency(amount) {
  return `$${Math.round(Number(amount || 0)).toLocaleString()}`;
}

export function getIncomeSnapshot(life) {
  const entries = [];

  if (showIncome(life)) {
    entries.push({
      key: "freelance",
      title: "Freelance gigs",
      detail: life.age >= 12
        ? "Flexible side cash is available when you want quick work."
        : "Not available yet.",
    });
  }

  if (life.partTimeJob) {
    entries.push({
      key: "partTime",
      title: life.partTimeJob.title,
      detail: `${formatCurrency(life.partTimeJob.hourlyPay)}/hr · ${life.partTimeJob.hoursPerWeek} hrs/week`,
    });
  }

  if (life.fullTimeJob) {
    entries.push({
      key: "fullTime",
      title: life.fullTimeJob.title,
      detail: `${formatCurrency(life.fullTimeJob.salary)}/year`,
    });
  }

  if (life.specialCareer) {
    entries.push({
      key: "special",
      title: life.specialCareer.title,
      detail: `${formatCurrency(life.specialCareer.income)}/year`,
    });
  }

  return entries;
}

export function getObligationsSnapshot(life) {
  const obligations = [];

  if (life.studentDebt && life.studentDebt > 0) {
    obligations.push({
      key: "studentDebt",
      title: "Student debt",
      detail: formatCurrency(life.studentDebt),
    });
  }

  if (life.greekLife?.annualCost) {
    obligations.push({
      key: "greekLife",
      title: `${life.greekLife.name} dues`,
      detail: `${formatCurrency(life.greekLife.annualCost)}/year`,
    });
  }

  return obligations;
}

export function getFinancialStory(life) {
  const money = Number(life.money || 0);
  const incomeSources = getIncomeSnapshot(life).filter((entry) => entry.key !== "freelance");
  const obligations = getObligationsSnapshot(life);

  if (life.age < 12 && money < 100) {
    return "Money is still a simple background detail in this chapter. Most of this life is being shaped by family and routine.";
  }

  if (!incomeSources.length && !obligations.length && money < 500) {
    return "Finances are still light. Cash is limited, but there are not many responsibilities pulling on it yet.";
  }

  if (incomeSources.length && !obligations.length) {
    return "This life is starting to build real financial momentum. Income is coming in, and the money story is getting more interesting.";
  }

  if (obligations.length && !incomeSources.length) {
    return "Responsibilities are starting to show up before income has fully caught up. The next chapter may need more structure.";
  }

  return "Money is starting to carry real weight now. Income, obligations, and bigger decisions are beginning to shape this story together.";
}

export function getAssetArchiveSummary(life) {
  if (!life.workHistory?.length) return [];

  return life.workHistory.slice(-3).reverse().map((entry, index) => ({
    key: `${entry.title}-${index}`,
    title: entry.title,
    detail:
      entry.yearsWorked !== undefined
        ? `${entry.yearsWorked} year${entry.yearsWorked === 1 ? "" : "s"} worked`
        : entry.shiftsWorked !== undefined
        ? `${entry.shiftsWorked} shifts worked`
        : "Past work experience",
  }));
}
