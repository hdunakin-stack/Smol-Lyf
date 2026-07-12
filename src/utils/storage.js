// Storage utilities for saving/loading lives

import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalizeAppearance } from "../domains/characterAppearance.js";

const STORAGE_KEY = "smollyfe_lives";

function hasLocalStorage() {
  return typeof localStorage !== "undefined" && localStorage !== null;
}

async function persistLives(lives) {
  const serialized = JSON.stringify(lives);
  if (hasLocalStorage()) {
    localStorage.setItem(STORAGE_KEY, serialized);
    return;
  }
  await AsyncStorage.setItem(STORAGE_KEY, serialized);
}

async function readPersistedLives() {
  if (hasLocalStorage()) {
    return localStorage.getItem(STORAGE_KEY);
  }
  return AsyncStorage.getItem(STORAGE_KEY);
}

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

    persistLives(lives).catch((error) => {
      console.error("Failed to persist life:", error);
    });
    return lives;
  } catch (e) {
    console.error("Failed to save life:", e);
    return allLives || [];
  }
}

export async function loadLivesFromStorage() {
  try {
    const saved = await readPersistedLives();
    const lives = saved ? normalizeLives(JSON.parse(saved)) : [];
    await persistLives(lives);
    return lives;
  } catch (e) {
    console.error("Failed to load lives:", e);
    return [];
  }
}

export function deleteLifeFromStorage(lifeId, allLives) {
  try {
    const lives = normalizeLives(allLives).filter((life) => life.lifeId !== lifeId);
    persistLives(lives).catch((error) => {
      console.error("Failed to persist deletion:", error);
    });
    return lives;
  } catch (e) {
    console.error("Failed to delete life:", e);
    return allLives;
  }
}
