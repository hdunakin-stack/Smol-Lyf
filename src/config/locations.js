// Location databases by origin
// 11.11.2025 - Updated to include Japan and Spain, focused on 5 major cities

export const cities = {
  USA: ['New York City, USA', 'Los Angeles, USA'],
  UK: ['London, UK'],
  Japan: ['Tokyo, Japan'],
  Spain: ['Madrid, Spain'],
};

// 11.11.2025 - Origin display names for character creation
export const ORIGIN_NAMES = {
  USA: "United States",
  UK: "United Kingdom",
  Japan: "Japan",
  Spain: "Spain",
};

export function getCityByOrigin(origin) {
  return cities[origin] || cities.USA;
}
