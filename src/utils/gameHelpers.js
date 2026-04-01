// src/utils/gameHelpers.js

/**
 * Berekent de benodigde XP voor een specifiek level
 * Gebruikt jouw unieke curve (~39m voor level 99)
 */
export const getRequiredXp = (level) => {
  if (level <= 1) return 0;
  
  let currentStepXp = 83;
  let totalCumulativeXp = 0;

  for (let i = 1; i < level; i++) {
    totalCumulativeXp += currentStepXp;

    let percentage = 10; 
    if (i >= 10) {
      percentage = 10 + (Math.floor(i / 10) * 0.5);
    }

    currentStepXp = Math.floor(currentStepXp * (1 + (percentage / 100)));
  }

  return Math.floor(totalCumulativeXp);
};

/**
 * Berekent de snelheid multiplier op basis van gear en level
 */
export const getSkillingSpeedMultiplier = (skillName, skills, equipment, WEAPONS, ARMOR, AMMO, ITEMS, toolboxes, autoToolboxUpgrade) => {
  let totalBoost = 0;

  // 1. Gear Boosts (including tools)
  // speedBoosts are stored as decimals (0.04 = 4%), multiply by 100 to match level boost format
  Object.values(equipment).forEach(itemKey => {
    const item = WEAPONS[itemKey] || ARMOR[itemKey] || AMMO[itemKey] || (ITEMS ? ITEMS[itemKey] : null);
    if (item?.speedBoosts?.[skillName]) totalBoost += item.speedBoosts[skillName] * 100;
  });

  // 1b. Auto Toolbox: als upgrade gekocht, gebruik beste tool uit toolbox
  if (autoToolboxUpgrade && toolboxes && toolboxes[skillName]) {
    const slots = toolboxes[skillName].slots || [];
    let bestToolBoost = 0;
    slots.forEach(toolId => {
      if (toolId && ITEMS && ITEMS[toolId]?.speedBoosts?.[skillName]) {
        bestToolBoost = Math.max(bestToolBoost, ITEMS[toolId].speedBoosts[skillName] * 100);
      }
    });
    // Alleen toevoegen als het meer is dan wat al via equipment komt
    const equippedToolBoost = Object.values(equipment).reduce((best, itemKey) => {
      const item = ITEMS ? ITEMS[itemKey] : null;
      if (item?.speedBoosts?.[skillName]) return Math.max(best, item.speedBoosts[skillName] * 100);
      return best;
    }, 0);
    if (bestToolBoost > equippedToolBoost) {
      totalBoost += (bestToolBoost - equippedToolBoost);
    }
  }

  // 2. Level Boosts (1% per 10 levels, 10% op lvl 99+)
  const currentLevel = skills[skillName]?.level || 1;
  let levelBoost = Math.floor(currentLevel / 10);
  if (currentLevel >= 99) levelBoost = 10;

  totalBoost += levelBoost;

  // Converteer naar multiplier (bijv. 0.88 voor 12% boost)
  return Math.max(0.2, 1 - (totalBoost / 100));
};

/**
 * Formatteert een startTimestamp naar een leesbare duurstring
 * Voorbeeld: "2h 30m", "45m", "12s"
 */
export const formatDuration = (startTimestamp) => {
  const diff = Date.now() - startTimestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
};

/**
 * Returns the PETS data for the currently equipped pet, or null.
 */
export const getActivePet = (equipment, PETS) => {
  const petKey = equipment?.pet;
  return petKey ? (PETS[petKey] || null) : null;
};