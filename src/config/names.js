// Name databases by origin and gender
// 11.11.2025 - Updated to include Japan and Spain names

export const firstNames = {
  USA: {
    Male: ['Liam', 'Noah', 'Ethan', 'Mason', 'James', 'Michael', 'William', 'Alexander', 'Benjamin', 'Jacob'],
    Female: ['Emma', 'Olivia', 'Ava', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn'],
  },
  UK: {
    Male: ['Oliver', 'George', 'Harry', 'Jack', 'Jacob', 'Thomas', 'Oscar', 'William', 'James', 'Charlie'],
    Female: ['Amelia', 'Isla', 'Ava', 'Emily', 'Ella', 'Olivia', 'Poppy', 'Lily', 'Sophie', 'Grace'],
  },
  // 11.11.2025 - Added Japan names
  Japan: {
    Male: ['Haruto', 'Yuto', 'Sota', 'Ren', 'Kaito', 'Minato', 'Riku', 'Hiroto', 'Yuki', 'Takeshi'],
    Female: ['Yui', 'Hina', 'Sakura', 'Aoi', 'Rin', 'Akari', 'Yuna', 'Mei', 'Honoka', 'Nanami'],
  },
  // 11.11.2025 - Added Spain names
  Spain: {
    Male: ['Alejandro', 'Pablo', 'Manuel', 'Antonio', 'David', 'Carlos', 'Javier', 'Daniel', 'Francisco', 'Miguel'],
    Female: ['Lucía', 'María', 'Carmen', 'Isabel', 'Ana', 'Elena', 'Sara', 'Laura', 'Paula', 'Sofía'],
  },
};

export const lastNames = {
  USA: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Wilson'],
  UK: ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Robinson', 'Wright'],
  // 11.11.2025 - Added Japan surnames
  Japan: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato'],
  // 11.11.2025 - Added Spain surnames
  Spain: ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín'],
};

export function getFirstName(origin, gender) {
  if (gender && firstNames[origin] && firstNames[origin][gender]) {
    return firstNames[origin][gender];
  }
  // Fallback for legacy code without gender
  const names = firstNames[origin] || firstNames.USA;
  if (names.Male && names.Female) {
    return [...names.Male, ...names.Female];
  }
  return names;
}

export function getLastName(origin) {
  return lastNames[origin] || lastNames.USA;
}
