// Random utility functions

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
