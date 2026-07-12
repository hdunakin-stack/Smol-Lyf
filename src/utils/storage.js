// Storage utilities for saving/loading lives

import { normalizeAppearance } from "../domains/characterAppearance.js";

function buildFallbackLifeId(life, index = 0) {
  const namePart = [life?.firstName, life?.lastName].filter(Boolean).join("-").toLowerCase() || "life";
  const cityPart = String(life?.city || "unknown").replace(/\s+/g, "-").toLowerCase();
  return `legacy-${namePart}-${cityPart}-${life?.age || 0}-${index}`;
}

function normalizeLife(life, index = 0) {
  const normalizedLife = {
    ...life,
    lifeId: life?.lifeId || buildFallbackLifeId(life, index),
  };

  if (life?.appearance) {
    normalizedLife.appearance = normalizeAppearance(life.appearance, {
      gender: life.gender || "Female",
      age: life.age ?? 25,
    });
  }

  return normalizedLife;
}

function normalizeLives(lives) {
  if (!Array.isArray(lives)) return [];
  return lives.map((life, index) => normalizeLife(life, index));
}

export function saveLifeToStorage(life, allLives) {
  try {
    const normalizedLife = normalizeLife(life);
    const lives = normalizeLives(allLives || []);
    const existingIndex = lives.findIndex((savedLife) => savedLife.lifeId === normalizedLife.lifeId);

    if (existingIndex >= 0) {
      lives[existingIndex] = normalizedLife;
    } else {
      lives.push(normalizedLife);
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('smollyfe_lives', JSON.stringify(lives));
    }
    return lives;
  } catch (e) {
    console.error('Failed to save life:', e);
    return allLives || [];
  }
}

export function loadLivesFromStorage() {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('smollyfe_lives');
      const lives = saved ? normalizeLives(JSON.parse(saved)) : [];
      localStorage.setItem('smollyfe_lives', JSON.stringify(lives));
      return lives;
    }
    return [];
  } catch (e) {
    console.error('Failed to load lives:', e);
    return [];
  }
}

export function deleteLifeFromStorage(lifeId, allLives) {
  try {
    const lives = normalizeLives(allLives).filter((life) => life.lifeId !== lifeId);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('smollyfe_lives', JSON.stringify(lives));
    }
    return lives;
  } catch (e) {
    console.error('Failed to delete life:', e);
    return allLives;
  }
}
