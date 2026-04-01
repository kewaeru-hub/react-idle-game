import { getSkillingSpeedMultiplier, getActivePet } from './gameHelpers';

/**
 * Berekent en simuleert offline progressie
 * @param {number} lastSaveTimestamp - Timestamp van laatste save
 * @param {string} activeAction - De actie die de speler deed
 * @param {object} skills - Huidge skill levels/xp
 * @param {object} equipment - Uitgerust equipment
 * @param {object} inventory - Huidge inventory
 * @param {object} ACTIONS - Alle mogelijke acties
 * @param {object} WEAPONS - Weapon data
 * @param {object} ARMOR - Armor data
 * @param {object} AMMO - Ammo data
 * @param {object} PETS - Pet data
 * @returns {object|null} Offline progress data of null
 */
export function calculateOfflineProgress(
  lastSaveTimestamp,
  activeAction,
  skills,
  equipment,
  inventory,
  ACTIONS,
  WEAPONS,
  ARMOR,
  AMMO,
  PETS,
  ITEMS,
  TOOL_SKILLS,
  TOOL_DROP_HOURS,
  PET_DROP_HOURS,
  toolboxes
) {
  // 1. Bereken offline tijd
  const offlineMs = Date.now() - lastSaveTimestamp;
  const maxOfflineMs = (12 + (inventory.offlineHoursUpgrade || 0)) * 3600000; // 12 + upgrade uren in ms
  const cappedMs = Math.min(offlineMs, maxOfflineMs);

  // 2. Als minder dan 1 minuut → geen progressie tonen
  if (cappedMs < 60000) return null;

  // 3. Als geen actie of combat → geen progressie
  if (!activeAction || !ACTIONS[activeAction]) return null;
  const actionData = ACTIONS[activeAction];
  if (actionData.skill === 'combat') return null;
  // Skip thieving for offline simulation — thieving uses its own target loop
  // and the placeholder `thieving` action may lack `reward`/`cost` fields.
  if (actionData.skill === 'thieving') return null;

  // 4. Bereken action tijd in ms
  const baseMs = actionData.baseTime || 1800;
  let actualTimeMs = baseMs * getSkillingSpeedMultiplier(
    actionData.skill,
    skills,
    equipment,
    WEAPONS,
    ARMOR,
    AMMO,
    ITEMS,
    toolboxes,
    inventory?.autoToolboxUpgrade
  );

  // 4.5. Pet speed bonus (bijv. foraging pet: -1 seconde)
  const pet = getActivePet(equipment, PETS);
  const isRelevantPet = pet && pet.skill === actionData.skill;
  if (isRelevantPet && pet.perk === 'foragingSpeed') {
    actualTimeMs = Math.max(500, actualTimeMs - (pet.perkValue || 1000)); // minimum 0.5s
  }

  // 5. Simuleer acties in een loop
  let remainingMs = cappedMs;
  let simulatedInventory = { ...inventory };
  let totalXp = 0;
  let totalActions = 0;
  let itemsGained = {};
  let petProcs = 0;
  const petName = (isRelevantPet && pet) ? pet.name : null;
  const petPerk = (isRelevantPet && pet) ? pet.perk : null;

  while (remainingMs >= actualTimeMs) {
    // Check of speler genoeg resources heeft voor deze actie
    if (actionData.cost) {
      const canAfford = Object.entries(actionData.cost).every(
        ([item, qty]) => (simulatedInventory[item] || 0) >= qty
      );
      if (!canAfford) break; // Stop als niet genoeg resources
    }

    // === APPLY PET BONUSSES ===
    let resourceCost = actionData.cost ? { ...actionData.cost } : {};
    let actionReward = actionData.reward ? { ...actionData.reward } : {};

    // === CRAFTING PET: Free craft (5% chance) ===
    if (isRelevantPet && pet.perk === 'freeCraft' && Math.random() < pet.perkChance) {
      // No resources consumed
      resourceCost = {};
      petProcs++;
    }
    // === COOKING PET: Batch cook (50% chance to cook 3x) ===
    else if (isRelevantPet && pet.perk === 'batchCook' && Math.random() < pet.perkChance) {
      const multi = pet.perkMultiplier || 3;
      const canBatch = Object.entries(actionData.cost || {}).every(
        ([item, qty]) => (simulatedInventory[item] || 0) >= qty * multi
      );
      if (canBatch) {
        // Multiply both cost and reward
        Object.keys(resourceCost).forEach(item => {
          resourceCost[item] *= multi;
        });
        Object.keys(actionReward).forEach(item => {
          actionReward[item] *= multi;
        });
        petProcs++;
      }
    }
    // === SMITHING PET: 5% chance +1 bar ===
    else if (isRelevantPet && pet.perk === 'barSave' && Math.random() < pet.perkChance) {
      let barToGain = null;
      Object.keys(actionReward).forEach(item => {
        if (item.includes('bar')) barToGain = item;
      });
      if (!barToGain) {
        Object.keys(resourceCost).forEach(item => {
          if (item.includes('bar')) barToGain = item;
        });
      }
      if (barToGain) {
        actionReward[barToGain] = (actionReward[barToGain] || 0) + 1;
        petProcs++;
      }
    }
    // === HERBLORE PET: 10% chance double brew ===
    else if (isRelevantPet && pet.perk === 'doubleBrew' && Math.random() < pet.perkChance) {
      Object.keys(actionReward).forEach(item => {
        actionReward[item] *= 2;
      });
      petProcs++;
    }
    // === WOODCUTTING PET: 10% chance extra log ===
    else if (isRelevantPet && pet.perk === 'extraLog' && Math.random() < pet.perkChance) {
      Object.keys(actionReward).forEach(item => {
        actionReward[item] *= 2;
      });
      petProcs++;
    }
    // === MINING PET: 5% chance auto-smelt ===
    else if (isRelevantPet && pet.perk === 'autoSmelt' && Math.random() < pet.perkChance) {
      const oreToBar = {
        copper_ore: 'bronze_bar', tin_ore: 'bronze_bar',
        iron_ore: 'iron_bar', coal_ore: 'steel_bar',
        alloy_ore: 'alloy_bar', apex_ore: 'apex_bar',
        nova_ore: 'nova_bar',
      };
      const newReward = {};
      Object.entries(actionReward).forEach(([item, qty]) => {
        const barKey = oreToBar[item];
        if (barKey) {
          newReward[barKey] = (newReward[barKey] || 0) + qty;
        } else {
          newReward[item] = qty;
        }
      });
      actionReward = newReward;
      petProcs++;
    }
    // === AGILITY PET: 5% chance instant course ===
    // (Voor offline: gewoon normale rewards, geen extra actie mogelijk)
    else if (isRelevantPet && pet.perk === 'instantCourse' && Math.random() < pet.perkChance) {
      // Geen extra effect voor offline simulation
      petProcs++;
    }
    // === FISHING PET: +20% kans op treasure chests ===
    // (Dit zouden extra rewards moeten zijn, maar vereenvoudigd voor offline)
    else if (isRelevantPet && pet.perk === 'treasureBoost') {
      // Voor offline: voeg extra rewards toe gebaseerd op kans
      if (Math.random() < pet.perkValue) {
        Object.keys(actionReward).forEach(item => {
          actionReward[item] = Math.floor(actionReward[item] * 1.2); // +20% bonus
        });
        petProcs++;
      }
    }

    // Trek kosten af
    if (resourceCost) {
      Object.entries(resourceCost).forEach(([item, qty]) => {
        simulatedInventory[item] = (simulatedInventory[item] || 0) - qty;
      });
    }

    // Voeg rewards toe
    Object.entries(actionReward).forEach(([item, qty]) => {
      simulatedInventory[item] = (simulatedInventory[item] || 0) + qty;
      itemsGained[item] = (itemsGained[item] || 0) + qty;
    });

    // === TOOL DROP: Bronze tool drops (1 per 20 hours of skilling) ===
    if (TOOL_SKILLS && TOOL_SKILLS[actionData.skill]) {
      const baseTimeSeconds = (actionData.baseTime || 1800) / 1000; // Convert ms to seconds
      const dropChancePerAction = baseTimeSeconds / ((TOOL_DROP_HOURS || 20) * 3600); // 20 hours = 72000 seconds
      if (Math.random() < dropChancePerAction) {
        const bronzeToolTier = 0; // First tier is bronze
        const toolId = TOOL_SKILLS[actionData.skill].tiers[bronzeToolTier];
        
        // Try to auto-store in toolbox (offline simulation)
        const box = toolboxes[actionData.skill];
        let toolStored = false;
        if (box) {
          const TOOLBOX_LEVELS = [
            { maxTierIndex: 1 },
            { maxTierIndex: 2 },
            { maxTierIndex: 3 },
            { maxTierIndex: 4 },
            { maxTierIndex: 5 },
          ];
          const skillTiers = TOOL_SKILLS[actionData.skill].tiers;
          const tierIndex = skillTiers.indexOf(toolId);
          const isAllowed = tierIndex <= TOOLBOX_LEVELS[box.level || 0].maxTierIndex;
          
          if (isAllowed) {
            // Find first empty slot
            const emptySlotIdx = (box.slots || []).findIndex(s => s === null);
            if (emptySlotIdx !== -1) {
              // Store in toolbox
              box.slots[emptySlotIdx] = toolId;
              itemsGained[toolId] = (itemsGained[toolId] || 0) + 1;
              toolStored = true;
            }
          }
        }
        
        // Fallback: add to inventory if toolbox doesn't exist or is full
        if (!toolStored) {
          simulatedInventory[toolId] = (simulatedInventory[toolId] || 0) + 1;
          itemsGained[toolId] = (itemsGained[toolId] || 0) + 1;
        }
      }
    }

    // === PET DROP: Skilling pet drops (1 per 600 hours of skilling) ===
    if (actionData.skill && actionData.skill !== 'combat' && actionData.skill !== 'prayer' && actionData.skill !== 'infusion') {
      const baseTimeSeconds = (actionData.baseTime || 1800) / 1000;
      const petDropChance = baseTimeSeconds / ((PET_DROP_HOURS || 600) * 3600); // 600 hours = 2,160,000 seconds
      if (Math.random() < petDropChance) {
        const skillingPetId = `${actionData.skill}_pet`;
        if (PETS[skillingPetId]) {
          simulatedInventory[skillingPetId] = (simulatedInventory[skillingPetId] || 0) + 1;
          itemsGained[skillingPetId] = (itemsGained[skillingPetId] || 0) + 1;
        }
      }
    }

    totalXp += actionData.xp;
    totalActions++;
    remainingMs -= actualTimeMs;
  }

  // 6. Als geen acties voltooid → return null
  if (totalActions === 0) return null;

  return {
    totalActions,
    totalXp,
    skill: actionData.skill,
    actionName: actionData.name,
    itemsGained,
    newInventory: simulatedInventory,
    offlineMinutes: Math.floor(cappedMs / 60000),
    offlineHours: Math.floor(cappedMs / 3600000),
    resourcesDepleted: !Object.entries(actionData.cost || {}).every(
      ([item, qty]) => (simulatedInventory[item] || 0) >= qty
    ),
    petName,
    petPerk,
    petProcs
  };
}
