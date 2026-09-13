/**
 * Level Progression System (20 Tailored Levels + Procedural Generator)
 * Rotation patterns: "constant", "sinusoid", "stutter", "reversal"
 */
const LEVELS = [
  // --- TIER 1: THE OAK WOODS (Stages 1-5) ---
  {
    level: 1,
    type: "normal",
    bossTitle: null,
    targetTheme: "wood",
    knivesRequired: 5,
    preSetKnives: [],
    obstacles: [],
    apples: [1.2],
    rotationSpeed: 1.4,
    rotationPattern: "constant"
  },
  {
    level: 2,
    type: "normal",
    bossTitle: null,
    targetTheme: "wood",
    knivesRequired: 6,
    preSetKnives: [0.8],
    obstacles: [],
    apples: [2.8],
    rotationSpeed: 1.7,
    rotationPattern: "constant"
  },
  {
    level: 3,
    type: "normal",
    bossTitle: null,
    targetTheme: "wood",
    knivesRequired: 7,
    preSetKnives: [0.5, 3.2],
    obstacles: [],
    apples: [1.8, 4.5],
    rotationSpeed: 1.8,
    rotationPattern: "sinusoid"
  },
  {
    level: 4,
    type: "normal",
    bossTitle: null,
    targetTheme: "wood",
    knivesRequired: 8,
    preSetKnives: [1.0, 3.8],
    obstacles: [],
    apples: [2.2],
    rotationSpeed: 2.2,
    rotationPattern: "stutter"
  },
  {
    level: 5,
    type: "boss",
    bossTitle: "THE GIANT LEMON",
    targetTheme: "lemon",
    knivesRequired: 9,
    preSetKnives: [],
    obstacles: [{ type: "spike", angle: 0 }],
    apples: [1.5, 3.0, 4.5],
    rotationSpeed: 2.4,
    rotationPattern: "sinusoid"
  },

  // --- TIER 2: IRON FORGE (Stages 6-10) ---
  {
    level: 6,
    type: "normal",
    bossTitle: null,
    targetTheme: "wood",
    knivesRequired: 7,
    preSetKnives: [1.2, 4.2],
    obstacles: [],
    apples: [2.5],
    rotationSpeed: -2.0,
    rotationPattern: "constant"
  },
  {
    level: 7,
    type: "normal",
    bossTitle: null,
    targetTheme: "wood",
    knivesRequired: 8,
    preSetKnives: [0.6, 2.7, 4.8],
    obstacles: [],
    apples: [1.4, 3.8],
    rotationSpeed: 2.2,
    rotationPattern: "reversal"
  },
  {
    level: 8,
    type: "normal",
    bossTitle: null,
    targetTheme: "wood",
    knivesRequired: 8,
    preSetKnives: [1.0, 3.5],
    obstacles: [{ type: "spike", angle: 5.2 }],
    apples: [2.0],
    rotationSpeed: 2.5,
    rotationPattern: "stutter"
  },
  {
    level: 9,
    type: "normal",
    bossTitle: null,
    targetTheme: "wood",
    knivesRequired: 9,
    preSetKnives: [0.4, 2.0, 4.0],
    obstacles: [],
    apples: [1.0, 5.0],
    rotationSpeed: 2.8,
    rotationPattern: "sinusoid"
  },
  {
    level: 10,
    type: "boss",
    bossTitle: "THE GOLDEN SHIELD",
    targetTheme: "shield",
    knivesRequired: 10,
    preSetKnives: [0.8],
    obstacles: [{ type: "spike", angle: 2.8 }, { type: "spike", angle: 4.8 }],
    apples: [1.8, 3.8, 5.8],
    rotationSpeed: 2.6,
    rotationPattern: "stutter"
  },

  // --- TIER 3: CHARRED VAULTS (Stages 11-15) ---
  {
    level: 11,
    type: "normal",
    bossTitle: null,
    targetTheme: "wood",
    knivesRequired: 8,
    preSetKnives: [0.5, 2.2, 3.8, 5.2],
    obstacles: [],
    apples: [1.3],
    rotationSpeed: -2.4,
    rotationPattern: "reversal"
  },
  {
    level: 12,
    type: "normal",
    bossTitle: null,
    targetTheme: "wood",
    knivesRequired: 9,
    preSetKnives: [0.7, 2.5, 4.3],
    obstacles: [{ type: "spike", angle: 5.8 }],
    apples: [1.6, 3.5],
    rotationSpeed: 2.7,
    rotationPattern: "stutter"
  },
  {
    level: 13,
    type: "normal",
    bossTitle: null,
    targetTheme: "wood",
    knivesRequired: 9,
    preSetKnives: [0.3, 1.8, 3.4, 4.9],
    obstacles: [],
    apples: [2.6],
    rotationSpeed: 2.9,
    rotationPattern: "sinusoid"
  },
  {
    level: 14,
    type: "normal",
    bossTitle: null,
    targetTheme: "wood",
    knivesRequired: 10,
    preSetKnives: [0.5, 2.0, 3.5, 5.0],
    obstacles: [{ type: "spike", angle: 1.2 }],
    apples: [4.2],
    rotationSpeed: 3.0,
    rotationPattern: "reversal"
  },
  {
    level: 15,
    type: "boss",
    bossTitle: "THE SWISS CHEESE",
    targetTheme: "cheese",
    knivesRequired: 11,
    preSetKnives: [1.0, 4.0],
    obstacles: [{ type: "spike", angle: 2.5 }, { type: "spike", angle: 5.5 }],
    apples: [0.2, 3.2, 4.8],
    rotationSpeed: 3.2,
    rotationPattern: "reversal"
  },

  // --- TIER 4: GRAND CITADEL (Stages 16-20) ---
  {
    level: 16,
    type: "normal",
    bossTitle: null,
    targetTheme: "wood",
    knivesRequired: 10,
    preSetKnives: [0.4, 1.8, 3.2, 4.6],
    obstacles: [{ type: "spike", angle: 6.0 }],
    apples: [2.4, 5.2],
    rotationSpeed: 3.2,
    rotationPattern: "constant"
  },
  {
    level: 17,
    type: "normal",
    bossTitle: null,
    targetTheme: "wood",
    knivesRequired: 10,
    preSetKnives: [0.2, 1.4, 2.8, 4.2, 5.4],
    obstacles: [],
    apples: [3.5],
    rotationSpeed: 3.4,
    rotationPattern: "sinusoid"
  },
  {
    level: 18,
    type: "normal",
    bossTitle: null,
    targetTheme: "wood",
    knivesRequired: 11,
    preSetKnives: [0.5, 1.9, 3.3, 4.7],
    obstacles: [{ type: "spike", angle: 0.1 }, { type: "spike", angle: 2.6 }],
    apples: [1.2, 5.8],
    rotationSpeed: 3.5,
    rotationPattern: "stutter"
  },
  {
    level: 19,
    type: "normal",
    bossTitle: null,
    targetTheme: "wood",
    knivesRequired: 11,
    preSetKnives: [0.3, 1.5, 2.7, 3.9, 5.1],
    obstacles: [{ type: "spike", angle: 6.1 }],
    apples: [2.1],
    rotationSpeed: 3.6,
    rotationPattern: "reversal"
  },
  {
    level: 20,
    type: "boss",
    bossTitle: "THE GRAND COMPASS",
    targetTheme: "compass",
    knivesRequired: 12,
    preSetKnives: [0.6, 3.6],
    obstacles: [{ type: "spike", angle: 1.8 }, { type: "spike", angle: 4.8 }, { type: "spike", angle: 5.9 }],
    apples: [0.0, 2.7, 4.2],
    rotationSpeed: 3.8,
    rotationPattern: "stutter"
  }
];

/**
 * Retrieves level config or generates procedural infinite progression
 */
function getLevelConfig(stageNumber) {
  if (stageNumber <= LEVELS.length) {
    return LEVELS[stageNumber - 1];
  }

  // Procedural infinite level generator
  const isBoss = stageNumber % 5 === 0;
  const themes = ["lemon", "shield", "cheese", "compass"];
  const theme = isBoss ? themes[Math.floor((stageNumber / 5) % themes.length)] : "wood";
  const patterns = ["constant", "sinusoid", "stutter", "reversal"];
  const pattern = patterns[stageNumber % patterns.length];

  const knives = Math.min(14, 8 + Math.floor(stageNumber / 4));
  const presetCount = Math.min(6, 2 + Math.floor(stageNumber / 6));
  const preSetKnives = [];
  for (let i = 0; i < presetCount; i++) {
    preSetKnives.push(i * (Math.PI * 2 / presetCount) + Math.random() * 0.3);
  }

  const obstacleCount = isBoss ? 2 : (stageNumber > 15 ? 1 : 0);
  const obstacles = [];
  for (let i = 0; i < obstacleCount; i++) {
    obstacles.push({ type: "spike", angle: (i + 0.5) * (Math.PI * 2 / obstacleCount) });
  }

  return {
    level: stageNumber,
    type: isBoss ? "boss" : "normal",
    bossTitle: isBoss ? `ANCIENT TITAN MK-${stageNumber}` : null,
    targetTheme: theme,
    knivesRequired: knives,
    preSetKnives: preSetKnives,
    obstacles: obstacles,
    apples: [Math.random() * Math.PI * 2],
    rotationSpeed: 2.8 + Math.min(2.0, (stageNumber - 20) * 0.08),
    rotationPattern: pattern
  };
}
