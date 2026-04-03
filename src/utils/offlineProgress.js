import { getSkillingSpeedMultiplier, getActivePet } from './gameHelpers';
import { FOOD_HEALS } from '../data/gameData';

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
  toolboxes,
  combatStyle = 'attack'
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
  if (actionData.skill === 'combat') {
    return calculateOfflineCombat(cappedMs, activeAction, actionData, skills, equipment, inventory, WEAPONS, ARMOR, AMMO, PETS, ITEMS, combatStyle);
  }
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

/**
 * Statistical offline combat progression.
 * Simulates combat tick-by-tick using OSRS-style formulas.
 * If auto-eat is active, automatically eats food each tick when HP is low.
 * Stops if: player dies, time runs out, or food runs out (with auto-eat).
 */
function calculateOfflineCombat(
  cappedMs, activeAction, actionData, skills, equipment, inventory,
  WEAPONS, ARMOR, AMMO, PETS, ITEMS, savedCombatStyle = 'attack'
) {
  const enemy = actionData.enemy;
  if (!enemy) return null;

  // --- Player stats ---
  const weapon = equipment?.weapon ? (WEAPONS[equipment.weapon] || {}) : {};
  const armorSlots = ['head', 'body', 'legs', 'shield'];
  let armorAccuracy = 0, armorRangedAcc = 0, armorMagicAcc = 0;
  let armorDefence = 0, armorRangedDef = 0, armorMagicDef = 0;
  armorSlots.forEach(slot => {
    const armorId = equipment?.[slot];
    const armor = armorId ? (ARMOR[armorId] || null) : null;
    if (armor) {
      armorAccuracy += armor.accuracy || 0;
      armorRangedAcc += armor.rangedAcc || 0;
      armorMagicAcc += armor.magicAcc || 0;
      armorDefence += armor.defence || 0;
      armorRangedDef += armor.rangedDef || 0;
      armorMagicDef += armor.magicDef || 0;
    }
  });

  const ammoId = equipment?.ammo;
  const ammoRangedStr = ammoId ? (AMMO[ammoId]?.rangedStr || 0) : 0;

  // Determine combat style: use saved style, but verify it's valid for weapon type
  let combatStyle = savedCombatStyle;
  // If ranged/magic weapon override to ranged/magic (user can't use melee styles with these weapons)
  if (weapon.type === 'ranged') combatStyle = 'ranged';
  else if (weapon.type === 'magic') combatStyle = 'magic';
  // else: melee weapon — use saved style (can be 'attack', 'strength', or 'defence')

  const maxHp = skills.hitpoints?.level || 10;
  const attackLevel = skills.attack?.level || 1;
  const strengthLevel = skills.strength?.level || 1;
  const defenceLevel = skills.defence?.level || 1;
  const rangedLevel = skills.ranged?.level || 1;
  const magicLevel = skills.magic?.level || 1;
  const agilityLevel = skills.agility?.level || 1;
  const dodgeChance = agilityLevel * 0.002;

  // --- Enemy stats ---
  const enemyHp = enemy.hp || 1;
  const enemyStr = enemy.str || 1;
  const enemySpeed = enemy.speedTicks || 4;
  const enemyType = enemy.type || 'melee';
  const enemyOffAtt = enemy.offAtt || { melee: enemy.att || 1, ranged: 0, magic: 0 };
  const enemyDefBonus = enemy.defBonus || { melee: enemy.def || 0, ranged: enemy.def || 0, magic: enemy.def || 0 };
  const playerSpeed = weapon.speedTicks || 4;

  // --- Hit chance calculation (OSRS-style) ---
  function calcHitChance(attackRoll, defenceRoll) {
    let hc;
    if (attackRoll > defenceRoll) {
      hc = 1 - (defenceRoll + 2) / (2 * (attackRoll + 1));
    } else {
      hc = attackRoll / (2 * (defenceRoll + 1));
    }
    return Math.min(0.95, Math.max(0.05, hc));
  }

  // Player attack roll
  let playerAccLevel, playerEquipAttBonus;
  if (combatStyle === 'ranged') {
    playerAccLevel = rangedLevel;
    playerEquipAttBonus = (weapon.att || 0) + armorRangedAcc;
  } else if (combatStyle === 'magic') {
    playerAccLevel = magicLevel;
    playerEquipAttBonus = (weapon.att || 0) + armorMagicAcc;
  } else {
    playerAccLevel = attackLevel;
    playerEquipAttBonus = (weapon.att || 0) + armorAccuracy;
  }
  const playerAttackRoll = (playerAccLevel + 8) * (Math.max(0, playerEquipAttBonus) + 64);

  // Monster defence roll against player
  let monsterDefBonus;
  if (combatStyle === 'ranged') monsterDefBonus = enemyDefBonus.ranged || 0;
  else if (combatStyle === 'magic') monsterDefBonus = enemyDefBonus.magic || 0;
  else monsterDefBonus = enemyDefBonus.melee || 0;
  const monsterDefenceRoll = (monsterDefBonus + 9) * 64;

  const playerHitChance = calcHitChance(playerAttackRoll, monsterDefenceRoll);

  // Player max hit
  let playerStrLevel, playerStrBonus;
  if (combatStyle === 'ranged') {
    playerStrLevel = rangedLevel;
    playerStrBonus = ammoRangedStr;
  } else if (combatStyle === 'magic') {
    playerStrLevel = magicLevel;
    playerStrBonus = weapon.str || 0;
  } else {
    playerStrLevel = strengthLevel;
    playerStrBonus = weapon.str || 0;
  }
  const playerMaxHit = Math.max(1, Math.floor(0.5 + (playerStrLevel + 8) * (playerStrBonus + 64) / 640));

  // Monster attack roll against player
  let monsterAttBonus;
  if (enemyType === 'ranged' || enemyType === 'range') monsterAttBonus = enemyOffAtt.ranged || 0;
  else if (enemyType === 'magic') monsterAttBonus = enemyOffAtt.magic || 0;
  else monsterAttBonus = enemyOffAtt.melee || 0;
  const monsterAttackRoll = (monsterAttBonus + 9) * 64;

  // Player defence roll
  const effectiveDefLevel = defenceLevel + 8;
  let playerEquipDefBonus;
  if (enemyType === 'ranged' || enemyType === 'range') playerEquipDefBonus = armorRangedDef;
  else if (enemyType === 'magic') playerEquipDefBonus = armorMagicDef;
  else playerEquipDefBonus = armorDefence;
  const playerDefenceRoll = effectiveDefLevel * (Math.max(0, playerEquipDefBonus) + 64);

  const monsterHitChance = calcHitChance(monsterAttackRoll, playerDefenceRoll);
  const monsterMaxHit = Math.max(1, Math.floor(0.5 + (enemyStr + 8) * 64 / 640));

  // --- Auto-eat config ---
  const hasAutoEat = !!(inventory.autoEatUpgrade);
  const eatThreshold = hasAutoEat ? (inventory.autoEatThreshold || 50) : 0;
  const RESPAWN_TICKS = 4;
  const TICK_MS = 600;

  // Build food list from inventory (ordered by inventoryOrder if possible, else by key)
  let simulatedInventory = { ...inventory };
  let foodList = []; // [{key, heal}]
  const rebuildFoodList = () => {
    foodList = [];
    for (const key of Object.keys(simulatedInventory)) {
      if ((simulatedInventory[key] || 0) > 0 && FOOD_HEALS[key]) {
        foodList.push({ key, heal: FOOD_HEALS[key] });
      }
    }
  };
  rebuildFoodList();

  // --- Tick-by-tick simulation ---
  const totalTicks = Math.floor(cappedMs / TICK_MS);
  let playerHp = maxHp;
  let currentEnemyHp = enemyHp;
  let playerTickCount = 0;
  let enemyTickCount = 0;
  let respawnTicks = 0;
  let totalKills = 0;
  let totalXp = 0;
  let died = false;
  let itemsGained = {};
  let foodConsumed = {};
  let ateThisTick = false;

  for (let tick = 0; tick < totalTicks; tick++) {
    ateThisTick = false;

    // Handle respawn
    if (respawnTicks > 0) {
      respawnTicks--;
      if (respawnTicks <= 0) {
        currentEnemyHp = enemyHp;
        playerTickCount = 0;
        enemyTickCount = 0;
      }
      continue;
    }

    // Increment tick counters
    playerTickCount++;
    enemyTickCount++;

    // Player attacks
    if (playerTickCount >= playerSpeed) {
      playerTickCount = 0;
      if (currentEnemyHp > 0 && Math.random() < playerHitChance) {
        // Dodge doesn't apply to player attacks
        const dmg = Math.floor(Math.random() * playerMaxHit) + 1;
        const actual = Math.min(dmg, currentEnemyHp);
        currentEnemyHp -= actual;

        // XP: combat style + hitpoints
        totalXp += actual * 4; // combat style xp
        // (hitpoints xp is actual * 1.33 but we track main skill only)
      }
    }

    // Enemy attacks
    if (currentEnemyHp > 0 && enemyTickCount >= enemySpeed) {
      enemyTickCount = 0;
      if (Math.random() < monsterHitChance) {
        // Dodge check
        if (!(dodgeChance > 0 && Math.random() < dodgeChance)) {
          const dmg = Math.floor(Math.random() * monsterMaxHit) + 1;
          playerHp = Math.max(0, playerHp - dmg);
        }
      }
    }

    // Auto-eat after enemy attacks
    if (hasAutoEat && eatThreshold > 0 && playerHp > 0 && playerHp < maxHp) {
      const hpPercent = (playerHp / maxHp) * 100;
      if (hpPercent < eatThreshold && !ateThisTick) {
        // Find first food
        let ate = false;
        for (const food of foodList) {
          if ((simulatedInventory[food.key] || 0) > 0) {
            simulatedInventory[food.key]--;
            if (simulatedInventory[food.key] <= 0) delete simulatedInventory[food.key];
            playerHp = Math.min(maxHp, playerHp + food.heal);
            foodConsumed[food.key] = (foodConsumed[food.key] || 0) + 1;
            ate = true;
            ateThisTick = true;
            break;
          }
        }
        if (!ate) {
          // No food left — rebuild and check
          rebuildFoodList();
          if (foodList.length === 0) {
            // No food at all, continue without eating
          }
        }
      }
    }

    // Check player death
    if (playerHp <= 0) {
      died = true;
      break;
    }

    // Check enemy death
    if (currentEnemyHp <= 0) {
      totalKills++;
      // Award loot
      if (actionData.reward) {
        Object.entries(actionData.reward).forEach(([k, v]) => {
          simulatedInventory[k] = (simulatedInventory[k] || 0) + v;
          itemsGained[k] = (itemsGained[k] || 0) + v;
        });
      }
      // Start respawn
      respawnTicks = RESPAWN_TICKS;
      rebuildFoodList();
    }
  }

  if (totalKills === 0) return null;

  // Calculate total combat XP (main style xp + hitpoints xp)
  const hpXp = Math.floor(totalXp * 1.33 / 4); // hitpoints gets 1.33 per damage

  return {
    totalActions: totalKills,
    totalXp,
    hpXp,
    skill: combatStyle === 'ranged' ? 'ranged' : combatStyle === 'magic' ? 'magic' : combatStyle,
    actionName: actionData.name,
    itemsGained,
    foodConsumed,
    newInventory: simulatedInventory,
    offlineMinutes: Math.floor(cappedMs / 60000),
    offlineHours: Math.floor(cappedMs / 3600000),
    died,
    isCombat: true,
    monsterStatsUpdate: {
      [activeAction]: {
        kills: totalKills,
        loot: itemsGained,
        timeMs: cappedMs
      }
    },
    petName: null,
    petPerk: null,
    petProcs: 0
  };
}
