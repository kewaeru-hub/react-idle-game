import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Components
import Sidebar from './components/Sidebar';
import CombatView from './components/CombatView';
import FightCaveView from './components/FightCaveView';
import SkillingView from './components/SkillingView';
import InfusionView from './components/InfusionView';
import FloatingBar from './components/FloatingBar';
import PetNotificationDisplay from './components/PetNotificationDisplay';
import AnalyticsModal from './components/AnalyticsModal';
import QuestModal from './components/QuestModal';
import ProfileView from './components/ProfileView';
import InventoryView from './components/InventoryView';
import SlayerView from './components/SlayerView';
import ShopView from './components/ShopView';
import UpgradeModal from './components/UpgradeModal';
import LevelUpToast from './components/LevelUpToast';
import TopBar from './components/TopBar';
import VictoryModal from './components/VictoryModal';
import ClanView from './components/ClanView';
import MarketView from './components/MarketView';
import WelcomeBackModal from './components/WelcomeBackModal';
import ThievingView from './components/ThievingView';
import bgImage from './assets/Backgrounds/bg-farm.jpg';
import lavaBg from './assets/Backgrounds/LavaCave_Background.png';

// Data & Helpers
import { ARMOR, SKILL_LIST, WEAPONS, ACTIONS, AMMO, ITEMS, SLAYER_MASTERS, THIEVING_TARGETS, POTION_EFFECTS, PRAYER_BOOK, ITEM_IMAGES, PETS, TOOL_SKILLS, TOOL_DROP_HOURS, PET_DROP_HOURS, calculateCombatLevel } from './data/gameData';
import { getRequiredXp, getSkillingSpeedMultiplier } from './utils/gameHelpers';
import { monsters as fightCaveMonsters, waves as fightCaveWaves } from './data/fightCaveData';

// Custom Hooks
import { useXpSystem } from './hooks/useXpSystem';
import { useCombat } from './hooks/useCombat';
import { useSkilling } from './hooks/useSkilling';
import { useEquipment } from './hooks/useEquipment';
import { useShop } from './hooks/useShop';
import { useCloudSave } from './hooks/useCloudSave';
import { useFightCave } from './hooks/useFightCave';
import { useClan } from './hooks/useClan';
import { useMarket } from './hooks/useMarket';
import { useSlayer } from './hooks/useSlayer';
import { useQuests } from './hooks/useQuests';

export default function App({ user, signOut }) {
  // --- 1. BASIC STATE ---
  const [screen, setScreen] = useState('profile'); 
  const [activePopup, setActivePopup] = useState(null); 
  const [activeAction, setActiveAction] = useState(null);
  const [progress, setProgress] = useState(0); 
  const [combatStyle, setCombatStyle] = useState('attack');
  const [inventory, setInventory] = useState({ coins: 0, bones: 0, raw_shrimp: 0, cooked_shrimp: 5, prayer_potion: 5, bronze_bow: 1, bronze_scimitar: 1, bronze_staff: 1, maxSlots: 35, offlineHoursUpgrade: 0, woodcutting_pet: 1, fishing_pet: 1, mining_pet: 1, foraging_pet: 1, cooking_pet: 1, smithing_pet: 1, crafting_pet: 1, herblore_pet: 1, thieving_pet: 1, farming_pet: 1, agility_pet: 1, slayer_pet: 1 });
  const [offlineProgress, setOfflineProgress] = useState(null);
  const [autoEatThreshold, setAutoEatThreshold] = useState(50);
  const [showCombatPopup, setShowCombatPopup] = useState(false);
  const [pendingCombatId, setPendingCombatId] = useState(null);

  // Sync autoEatThreshold from inventory on load
  useEffect(() => {
    if (inventory.autoEatThreshold != null) {
      setAutoEatThreshold(inventory.autoEatThreshold);
    }
  }, []);

  // Refs
  const inventoryRef = useRef(inventory);
  const autoEatThresholdRef = useRef(autoEatThreshold);
  useEffect(() => { autoEatThresholdRef.current = autoEatThreshold; }, [autoEatThreshold]);

  const { equipment, setEquipment, equipmentAmounts, setEquipmentAmounts, toggleEquip } = useEquipment(
    { weapon: null }, { ammo: 0 }, inventoryRef, setInventory, setCombatStyle
  );

  const [slayerTask, setSlayerTask] = useState(null);
  const [levelUps, setLevelUps] = useState([]);
  const [xpDrops, setXpDrops] = useState([]);
  const [petNotifications, setPetNotifications] = useState([]);
  const [sessionStats, setSessionStats] = useState({ startTime: null, xpGained: 0, itemsGained: 0, actionsCompleted: 0 });
  const [quickPrayers, setQuickPrayers] = useState(['dmg_5', 'anti_melee_40', 'anti_range_40', 'anti_mage_40']);
  const [playerPrayer, setPlayerPrayer] = useState(10);
  const [claimedTools, setClaimedTools] = useState({});
  const [toolboxes, setToolboxes] = useState({});
  const [inventoryOrder, setInventoryOrder] = useState([]);
  const [monsterStats, setMonsterStats] = useState({});

  // Refs
  const combatRef = useRef(null);
  const playerPrayerRef = useRef(playerPrayer);
  const inventoryOrderRef = useRef(inventoryOrder);
  const monsterStatsRef = useRef(monsterStats);

  useEffect(() => { inventoryRef.current = inventory; }, [inventory]);
  useEffect(() => { playerPrayerRef.current = playerPrayer; }, [playerPrayer]);
  useEffect(() => { inventoryOrderRef.current = inventoryOrder; }, [inventoryOrder]);
  useEffect(() => { monsterStatsRef.current = monsterStats; }, [monsterStats]);

  // Sync inventoryOrder: remove items that no longer exist, append new items at end
  useEffect(() => {
    const exclude = new Set(['coins', 'maxSlots', 'slayer_points', 'offlineHoursUpgrade', 'autoEatUpgrade', 'autoEatThreshold', 'autoToolboxUpgrade']);
    const activeItems = Object.keys(inventory).filter(k => !exclude.has(k) && inventory[k] > 0);
    const activeSet = new Set(activeItems);
    setInventoryOrder(prev => {
      const newOrder = prev.map(k => {
        if (k === null) return null;          // preserve gap
        if (activeSet.has(k)) return k;       // item still exists
        return null;                          // item gone → becomes gap
      });
      // Find new items not already in the order
      const existingSet = new Set(newOrder.filter(k => k !== null));
      const newItems = activeItems.filter(k => !existingSet.has(k));
      // Insert new items into first available null slots, or append
      for (const item of newItems) {
        const gapIdx = newOrder.indexOf(null);
        if (gapIdx !== -1) {
          newOrder[gapIdx] = item;
        } else {
          newOrder.push(item);
        }
      }
      // Trim trailing nulls
      while (newOrder.length > 0 && newOrder[newOrder.length - 1] === null) {
        newOrder.pop();
      }
      // Check if anything actually changed
      if (newOrder.length === prev.length && newOrder.every((v, i) => v === prev[i])) return prev;
      return newOrder;
    });
  }, [inventory]);

  // --- 2. HANDLERS ---
  const triggerLevelUp = (skill, level) => {
    const id = Date.now() + Math.random();
    setLevelUps(prev => [...prev, { id, skill, level }]);
    setTimeout(() => setLevelUps(prev => prev.filter(lu => lu.id !== id)), 3500);
  };

  const triggerXpDrop = (skill, amount, pietyActive) => {
    const id = Date.now() + Math.random();
    setXpDrops(prev => [...prev, { id, skill, amount: Math.floor(amount), pietyActive }]);
    setTimeout(() => setXpDrops(prev => prev.filter(drop => drop.id !== id)), 1500);
  };

  const triggerPetNotification = (petId, petName, perkEffect, type = 'perk') => {
    const id = Date.now() + Math.random();
    const duration = type === 'perk' ? 2000 : 4000; // Rare drops stay longer
    setPetNotifications(prev => [...prev, { id, petId, petName, perkEffect, type }]);
    setTimeout(() => setPetNotifications(prev => prev.filter(notif => notif.id !== id)), duration);
  };

  const claimToolCallback = (skill) => {
    if (!TOOL_SKILLS[skill]) return;

    const bronzeToolTier = 0; // bronze = index 0
    const toolId = TOOL_SKILLS[skill].tiers[bronzeToolTier];

    // Mark as claimed
    setClaimedTools(prev => ({
      ...prev,
      [skill]: true
    }));

    // Initialize toolbox for this skill with the bronze tool auto-stored (NOT in inventory)
    setToolboxes(prev => ({
      ...prev,
      [skill]: {
        level: 0,
        slots: [toolId]  // Bronze tool auto-stored in first slot
      }
    }));
  };

  const claimAllTools = () => {
    const newClaimedTools = {};
    const newToolboxes = {};
    Object.entries(TOOL_SKILLS).forEach(([skill, data]) => {
      if (!claimedTools[skill]) {
        newClaimedTools[skill] = true;
        newToolboxes[skill] = {
          level: 0,
          slots: [data.tiers[0]]  // Bronze tool in first slot
        };
      }
    });
    setClaimedTools(prev => ({ ...prev, ...newClaimedTools }));
    setToolboxes(prev => ({ ...prev, ...newToolboxes }));
  };

  const upgradeToolbox = (skill) => {
    const box = toolboxes[skill];
    if (!box || box.level >= 4) return; // Already max level

    const cost = 1; // 1 coin per upgrade (for now)
    if ((inventory.coins || 0) < cost) return; // Not enough coins

    setInventory(prev => ({
      ...prev,
      coins: (prev.coins || 0) - cost
    }));

    const TOOLBOX_LEVELS = [
      { slotCount: 1 },  // level 0
      { slotCount: 1 },  // level 1
      { slotCount: 2 },  // level 2
      { slotCount: 3 },  // level 3
      { slotCount: 4 },  // level 4
    ];

    const newLevel = box.level + 1;
    const newSlotCount = TOOLBOX_LEVELS[newLevel].slotCount;

    setToolboxes(prev => {
      const currentSlots = [...(prev[skill]?.slots || [])];
      // Expand slots array if needed
      while (currentSlots.length < newSlotCount) {
        currentSlots.push(null);
      }
      return {
        ...prev,
        [skill]: {
          level: newLevel,
          slots: currentSlots
        }
      };
    });
  };

  // Helper: Try to auto-store a bronze tool in toolbox
  // Returns { success: bool, destination: 'toolbox' | 'inventory' | null, slotIndex: number | null }
  const tryAutoStoreToolInToolbox = (skill, toolId) => {
    if (!TOOL_SKILLS[skill]) return { success: false, destination: null, slotIndex: null };
    
    const box = toolboxes[skill];
    if (!box) return { success: false, destination: null, slotIndex: null };

    // Check tool belongs to this skill
    const skillTiers = TOOL_SKILLS[skill].tiers;
    if (!skillTiers.includes(toolId)) return { success: false, destination: null, slotIndex: null };

    // Check tool tier is allowed at current level (bronze is always allowed)
    const TOOLBOX_LEVELS = [
      { maxTierIndex: 1 }, // level 0: bronze-iron
      { maxTierIndex: 2 }, // level 1: bronze-steel
      { maxTierIndex: 3 }, // level 2: bronze-alloy
      { maxTierIndex: 4 }, // level 3: bronze-apex
      { maxTierIndex: 5 }, // level 4: bronze-nova
    ];
    const tierIndex = skillTiers.indexOf(toolId);
    const isAllowed = tierIndex <= TOOLBOX_LEVELS[box.level].maxTierIndex;
    if (!isAllowed) return { success: false, destination: null, slotIndex: null };

    // Find first empty slot in toolbox
    const emptySlotIdx = box.slots.findIndex(s => s === null);
    if (emptySlotIdx !== -1) {
      // There's an empty slot — we can store it automatically
      return { success: true, destination: 'toolbox', slotIndex: emptySlotIdx };
    }

    // Toolbox is full, tool goes to inventory
    return { success: true, destination: 'inventory', slotIndex: null };
  };

  // Callback: When a bronze tool drops during skilling
  // Try to auto-store it in the toolbox, otherwise it stays in inventory
  const onToolDropped = (skill, toolId) => {
    const result = tryAutoStoreToolInToolbox(skill, toolId);
    
    if (result.destination === 'toolbox') {
      // Auto-store in toolbox
      setToolboxes(prev => {
        const newSlots = [...(prev[skill]?.slots || [])];
        newSlots[result.slotIndex] = toolId;
        return {
          ...prev,
          [skill]: {
            ...prev[skill],
            slots: newSlots
          }
        };
      });
      
      // Remove from inventory after storing
      setInventory(prev => ({
        ...prev,
        [toolId]: (prev[toolId] || 0) - 1
      }));
      
      // Notify player
      if (triggerPetNotification) {
        triggerPetNotification(toolId, '⚒️ Tool Stored', `${ITEMS[toolId]?.name} stored in toolbox!`, 'tool_drop');
      }
    }
    // If destination is 'inventory', tool stays in inventory (default behavior)
  };

  const storeToolInBox = (skill, slotIndex, toolId) => {
    if (!TOOL_SKILLS[skill]) return;
    const box = toolboxes[skill];
    if (!box) return;

    // Check tool belongs to this skill
    const skillTiers = TOOL_SKILLS[skill].tiers;
    if (!skillTiers.includes(toolId)) return;

    // Check tool tier is allowed at current level
    const TOOLBOX_LEVELS = [
      { maxTierIndex: 1 }, // level 0: bronze-iron
      { maxTierIndex: 2 }, // level 1: bronze-steel
      { maxTierIndex: 3 }, // level 2: bronze-alloy
      { maxTierIndex: 4 }, // level 3: bronze-apex
      { maxTierIndex: 5 }, // level 4: bronze-nova
    ];
    const tierIndex = skillTiers.indexOf(toolId);
    if (tierIndex > TOOLBOX_LEVELS[box.level].maxTierIndex) return;

    // Check slot is valid
    if (slotIndex < 0 || slotIndex >= box.slots.length) return;

    // Check player has the tool in inventory
    if ((inventory[toolId] || 0) < 1) return;

    // If slot already has a tool, return it to inventory first
    const existingTool = box.slots[slotIndex];

    setInventory(prev => {
      const n = { ...prev };
      n[toolId] = (n[toolId] || 0) - 1; // Remove new tool from inventory
      if (existingTool) {
        n[existingTool] = (n[existingTool] || 0) + 1; // Return old tool to inventory
      }
      return n;
    });

    setToolboxes(prev => {
      const newSlots = [...(prev[skill]?.slots || [])];
      newSlots[slotIndex] = toolId;
      return {
        ...prev,
        [skill]: {
          ...prev[skill],
          slots: newSlots
        }
      };
    });
  };

  // Equip tool directly from toolbox — bypasses inventory entirely
  // Old equipped tool goes back into its own skill's toolbox if possible
  const equipToolFromBox = (skill, toolId) => {
    const box = toolboxes[skill];
    if (!box) return;
    const slotIdx = box.slots.indexOf(toolId);
    if (slotIdx === -1) return;

    const currentlyEquipped = equipment.tool;

    // Find which skill-toolbox the old tool belongs to, and an empty slot there
    let oldToolSkill = null;
    let oldToolSlotIdx = -1;
    if (currentlyEquipped) {
      for (const [sk, data] of Object.entries(TOOL_SKILLS)) {
        if (data.tiers.includes(currentlyEquipped) && toolboxes[sk]) {
          oldToolSkill = sk;
          // Find an empty slot in that toolbox
          const slots = toolboxes[sk].slots;
          // Prefer the slot that's about to free up if same skill
          if (sk === skill && slotIdx < slots.length) {
            oldToolSlotIdx = slotIdx;
          } else {
            oldToolSlotIdx = slots.indexOf(null);
          }
          break;
        }
      }
    }

    setToolboxes(prev => {
      const updated = { ...prev };

      // Remove new tool from its slot
      const newSlots = [...(updated[skill]?.slots || [])];
      newSlots[slotIdx] = null;
      updated[skill] = { ...updated[skill], slots: newSlots };

      // Put old tool back in its toolbox if we found a slot
      if (currentlyEquipped && oldToolSkill && oldToolSlotIdx >= 0) {
        const targetSlots = oldToolSkill === skill
          ? newSlots  // Same skill — reuse the array we already modified
          : [...(updated[oldToolSkill]?.slots || [])];
        targetSlots[oldToolSlotIdx] = currentlyEquipped;
        if (oldToolSkill === skill) {
          updated[skill] = { ...updated[skill], slots: targetSlots };
        } else {
          updated[oldToolSkill] = { ...updated[oldToolSkill], slots: targetSlots };
        }
      }

      return updated;
    });

    // Fallback: if old tool had no toolbox slot, send to inventory
    // But first check if inventory has room (item already stacks, or a free slot exists)
    if (currentlyEquipped && (oldToolSkill === null || oldToolSlotIdx < 0)) {
      const usedSlots = Object.keys(inventory).filter(k => k !== 'maxSlots' && k !== 'offlineHoursUpgrade' && inventory[k] > 0).length;
      const alreadyInInventory = (inventory[currentlyEquipped] || 0) > 0;
      if (!alreadyInInventory && usedSlots >= (inventory.maxSlots || 35)) {
        // No room anywhere — abort the swap so the tool isn't lost
        triggerPetNotification(null, '', 'Inventory & toolbox are full! Free up space first.', 'warning');
        return;
      }
      setInventory(prev => ({
        ...prev,
        [currentlyEquipped]: (prev[currentlyEquipped] || 0) + 1
      }));
    }

    // Directly set equipment — no inventory needed
    setEquipment(prev => ({ ...prev, tool: toolId }));
  };

  // Infuse tool: consume tools (from inventory + toolbox + equipment) + bars, produce upgraded tool into toolbox
  const infuseTool = (skill, fromId, toId, neededTools, barItemId, neededBars) => {
    const box = toolboxes[skill];
    if (!box) return false;

    // Count available from-tools across inventory, toolbox and equipment
    const invCount = inventory[fromId] || 0;
    const boxSlots = box.slots || [];
    const boxCount = boxSlots.filter(s => s === fromId).length;
    const equippedCount = equipment.tool === fromId ? 1 : 0;
    const totalCount = invCount + boxCount + equippedCount;
    const barCount = barItemId ? (inventory[barItemId] || 0) : 0;

    // Check affordability
    if (totalCount < neededTools || (barItemId && barCount < neededBars)) return false;

    // Calculate how many to take from each source (inventory first, then toolbox, then equipment)
    let remaining = neededTools;
    let toTakeFromInv = Math.min(invCount, remaining);
    remaining -= toTakeFromInv;
    let toTakeFromBox = Math.min(boxCount, remaining);
    remaining -= toTakeFromBox;
    let toTakeFromEquip = Math.min(equippedCount, remaining);

    // If consuming equipped tool, unequip it
    if (toTakeFromEquip > 0) {
      setEquipment(prev => ({ ...prev, tool: null }));
    }

    // Update inventory: remove from-tools + bars
    setInventory(prev => {
      const n = { ...prev };
      if (toTakeFromInv > 0) {
        n[fromId] = (n[fromId] || 0) - toTakeFromInv;
        if (n[fromId] <= 0) delete n[fromId];
      }
      if (barItemId && neededBars > 0) {
        n[barItemId] = (n[barItemId] || 0) - neededBars;
        if (n[barItemId] <= 0) delete n[barItemId];
      }
      return n;
    });

    // Update toolbox: remove from-tools from slots, place result in first freed/empty slot
    setToolboxes(prev => {
      const updated = { ...prev };
      const newSlots = [...(updated[skill]?.slots || [])];

      // Remove from-tools from toolbox slots
      let removed = 0;
      let firstFreedSlot = -1;
      for (let i = 0; i < newSlots.length && removed < toTakeFromBox; i++) {
        if (newSlots[i] === fromId) {
          newSlots[i] = null;
          if (firstFreedSlot === -1) firstFreedSlot = i;
          removed++;
        }
      }

      // Place the new tool in the first available slot (freed slot or any empty)
      let targetSlot = firstFreedSlot >= 0 ? firstFreedSlot : newSlots.indexOf(null);
      if (targetSlot >= 0) {
        newSlots[targetSlot] = toId;
      } else {
        // No empty slot — tool goes to inventory instead (handled below)
      }

      updated[skill] = { ...updated[skill], slots: newSlots };
      return updated;
    });

    // If no toolbox slot was available, add result to inventory as fallback
    const emptySlotExists = boxSlots.filter(s => s === fromId).length > 0 || boxSlots.includes(null);
    if (!emptySlotExists) {
      setInventory(prev => ({ ...prev, [toId]: (prev[toId] || 0) + 1 }));
    }

    return true;
  };

  const stopAction = () => {
    // stop engine if available
    try { if (combatRef.current && combatRef.current.stopAction) combatRef.current.stopAction(); } catch (e) {}
    setActiveAction(null);
    setProgress(0);
  };
  const resetSession = () => setSessionStats({ startTime: Date.now(), xpGained: 0, itemsGained: 0, actionsCompleted: 0 });
  const getItemCount = (i) => inventory[i] || 0;
  const getCurrentWeapon = () => WEAPONS[equipment.weapon] || { name: 'Unarmed', att: 0, str: 0, speedTicks: 5, type: 'melee' };

  const getAvailableCombatStyles = () => {
    const weapon = getCurrentWeapon();
    const styles = [];
    
    if (weapon.type === 'melee' || weapon.type === undefined) {
      styles.push('attack', 'strength', 'defence');
    }
    if (weapon.type === 'ranged') {
      styles.push('ranged');
    }
    if (weapon.type === 'magic') {
      styles.push('magic');
    }
    
    return styles;
  };

  // --- 3. ENGINES (Via Hooks) ---
  const [skills, coreAddXp, setSkills] = useXpSystem(
    SKILL_LIST.reduce((acc, s) => ({ 
      ...acc, 
      [s]: { 
        level: ['hitpoints', 'prayer'].includes(s) ? 10 : 1, 
        xp: ['hitpoints', 'prayer'].includes(s) ? 1120 : 0 
      } 
    }), {}),
    triggerLevelUp
  );

  const skillsRef = useRef(skills);
  useEffect(() => { skillsRef.current = skills; }, [skills]);

  // Initialize playerPrayer with actual skill level when skills become available
  useEffect(() => {
    if (skills.prayer?.level && playerPrayer === 10) {
      setPlayerPrayer(skills.prayer.level);
    }
  }, [skills.prayer?.level]);

  //We vangen de XP op en tellen het direct bij de Analytics (Real-time) stats op!
  const addXp = (skill, amount) => {
    coreAddXp(skill, amount);
    setSessionStats(prev => ({ ...prev, xpGained: prev.xpGained + amount }));
  };

  const maxHp = skills.hitpoints?.level || 10;
  const maxPrayer = skills.prayer?.level || 10;
  
  // Calculate combat level from component skills
  const combatLevel = calculateCombatLevel(
    skills.attack?.level || 1,
    skills.strength?.level || 1,
    skills.defence?.level || 1,
    skills.hitpoints?.level || 10,
    skills.prayer?.level || 10,
    skills.ranged?.level || 1,
    skills.magic?.level || 1
  );

  const combat = useCombat(
    activeAction, ACTIONS, skills, { maxHp, maxPrayer }, 
    combatStyle, setInventory, addXp, triggerXpDrop, stopAction, getCurrentWeapon, slayerTask, equipment,
    autoEatThresholdRef, inventoryRef, inventoryOrderRef
  );

  useEffect(() => { combatRef.current = combat; }, [combat]);

  // Fight cave system
  const { fightCaveActive, setFightCaveActive, fightCaveWaveIndex, activeWave, fightCaveVictory, setFightCaveVictory, startFightCave, changeFightCaveTarget } = useFightCave(
    combat, setInventory, stopAction, setPlayerPrayer, playerPrayer, maxPrayer
  );

  const combatStartTime = useRef(null);

  const startCombat = (id) => {
    // If auto-eat is unlocked and not lava cave, show popup for threshold
    if (inventory.autoEatUpgrade && id !== 'lava_cave') {
      setPendingCombatId(id);
      setShowCombatPopup(true);
      return;
    }
    actuallyStartCombat(id);
  };

  const actuallyStartCombat = (id) => {
    console.log('[App] startCombat', id);
    setActiveAction(id);
    setProgress(0);
    resetSession();
    combat.clearCombatLog();
    combatStartTime.current = Date.now();

    if (id === 'lava_cave') {
      startFightCave();
    } else {
      // Regular combat: seed with single enemy, respawn on death
      setFightCaveActive(false);
      const callbacks = {
        onPlayerDead: stopAction,
        onPrayerDrain: (amount) => {
          setPlayerPrayer(prev => Math.max(0, prev - amount));
        },
        onPotionDrink: (amount) => {
          setPlayerPrayer(prev => Math.min(maxPrayer, prev + amount));
        },
        onAllEnemiesDead: () => {
          slayer.recordKill(id);
          // Award slayer XP if this monster is the active slayer task
          if (slayer.currentTask && slayer.currentTask.monsterKey === id) {
            const enemyData = ACTIONS[id]?.enemy;
            const slayerXp = enemyData?.hp || 10;
            addXp('slayer', slayerXp);
            triggerXpDrop('slayer', slayerXp);
          }
          // Quest progress: record combat kill
          questRecordRef.current(id);
          // Track monster stats: kills, loot, time
          const actionData = ACTIONS[id];
          const killTimeMs = combatStartTime.current ? Date.now() - combatStartTime.current : 0;
          combatStartTime.current = Date.now(); // reset for next kill
          setMonsterStats(prev => {
            const existing = prev[id] || { kills: 0, loot: {}, timeMs: 0 };
            const newLoot = { ...existing.loot };
            if (actionData && actionData.reward) {
              Object.entries(actionData.reward).forEach(([k, v]) => {
                newLoot[k] = (newLoot[k] || 0) + v;
              });
            }
            return {
              ...prev,
              [id]: {
                kills: existing.kills + 1,
                loot: newLoot,
                timeMs: existing.timeMs + killTimeMs
              }
            };
          });
        }
      };
      
      combat.seedCombat(id, null, callbacks);
      combat.engine.initPrayer(playerPrayerRef.current, maxPrayer);
    }
  };

  const startAction = (id) => { setActiveAction(id); setProgress(0); resetSession(); };

  // Auto-resume combat if save loaded an active combat action but engine is idle
  const hasResumedCombat = useRef(false);
  useEffect(() => {
    if (hasResumedCombat.current) return;
    if (!activeAction) return;
    // Only handle combat actions
    if (activeAction === 'lava_cave') {
      // Lava cave: re-seed fight cave
      const enemies = combat.engine?.getEnemies?.() || [];
      if (!enemies.some(e => e.hp > 0)) {
        hasResumedCombat.current = true;
        console.log('[App] Auto-resuming lava cave');
        actuallyStartCombat('lava_cave');
      }
      return;
    }
    const action = ACTIONS[activeAction];
    if (!action || action.skill !== 'combat') return;
    // Check if engine has no enemies (not seeded yet)
    const enemies = combat.engine?.getEnemies?.() || [];
    const hasAliveEnemies = enemies.some(e => e.hp > 0);
    if (!hasAliveEnemies) {
      hasResumedCombat.current = true;
      console.log('[App] Auto-resuming combat for', activeAction);
      actuallyStartCombat(activeAction);
    }
  }, [activeAction]);

  // Auto-adjust combat style when weapon changes
  useEffect(() => {
    const availableStyles = getAvailableCombatStyles();
    if (!availableStyles.includes(combatStyle)) {
      setCombatStyle(availableStyles[0] || 'attack');
    }
  }, [equipment.weapon]);

  // Update engine when weapon changes during combat
  useEffect(() => {
    if (!activeAction || !ACTIONS[activeAction] || ACTIONS[activeAction].skill !== 'combat') return;
    if (!combat?.engine?.updateAlly) return;
    const weapon = getCurrentWeapon();
    // Recalculate armor bonuses
    const armorSlots = ['head', 'body', 'legs', 'shield'];
    let armorAccuracy = 0, armorRangedAcc = 0, armorMagicAcc = 0;
    let armorDefence = 0, armorRangedDef = 0, armorMagicDef = 0;
    armorSlots.forEach(slot => {
      const armorId = equipment?.[slot];
      const armor = armorId ? ARMOR[armorId] : null;
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
    combat.engine.updateAlly('player', {
      attackSpeedTicks: weapon.speedTicks || 4,
      weaponAtt: weapon.att || 0,
      weaponStr: weapon.str || 0,
      ammoRangedStr,
      armorAccuracy, armorRangedAcc, armorMagicAcc,
      armorDefence, armorRangedDef, armorMagicDef
    });
  }, [equipment.weapon, equipment.head, equipment.body, equipment.legs, equipment.shield, equipment.ammo]);

  // Update engine when combat style changes during combat (don't reset attack tick)
  useEffect(() => {
    if (!activeAction || !ACTIONS[activeAction] || ACTIONS[activeAction].skill !== 'combat') return;
    if (!combat?.engine?.updateAlly) return;
    combat.engine.updateAlly('player', {
      combatStyle,
      attackLevel: skills.attack?.level || 1,
      strengthLevel: skills.strength?.level || 1,
      defenceLevel: skills.defence?.level || 1,
      rangedLevel: skills.ranged?.level || 1,
      magicLevel: skills.magic?.level || 1
    });
  }, [combatStyle]);

  // Skilling engine
  useSkilling(activeAction, ACTIONS, skills, equipment, inventoryRef, setProgress, setInventory, addXp, triggerXpDrop, setSessionStats, stopAction, WEAPONS, ARMOR, AMMO, triggerPetNotification, TOOL_SKILLS, TOOL_DROP_HOURS, toolboxes, onToolDropped, (actionId) => questRecordRef.current(actionId));

  // Slayer system
  const [slayerTaskComplete, setSlayerTaskComplete] = useState(null);
  const handleSlayerTaskComplete = (data) => {
    setSlayerTaskComplete(data);
    setTimeout(() => setSlayerTaskComplete(null), 4000);
  };
  const slayer = useSlayer(SLAYER_MASTERS, ACTIONS, handleSlayerTaskComplete);

  // Ref for slayer save/load
  const slayerRef = useRef({ currentTask: slayer.currentTask, slayerPoints: slayer.slayerPoints, consecutive: slayer.consecutive });
  useEffect(() => { slayerRef.current = { currentTask: slayer.currentTask, slayerPoints: slayer.slayerPoints, consecutive: slayer.consecutive }; }, [slayer.currentTask, slayer.slayerPoints, slayer.consecutive]);

  // Shop functions
  const { sellItemToShop, buyItemFromShop, buyUpgrade, buyOfflineUpgrade, buyAutoToolUpgrade, buyAutoEat, buyQuestUpgrade } = useShop(setInventory, inventory);

  // Quest system
  const quests = useQuests(skills, inventory);

  // Quest progress: on combat kill
  const questRecordRef = useRef(quests.recordQuestProgress);
  useEffect(() => { questRecordRef.current = quests.recordQuestProgress; }, [quests.recordQuestProgress]);

  // Quest ref for save/load
  const questRef = useRef(null);
  useEffect(() => {
    questRef.current = {
      dailyQuests: quests.dailyQuests,
      weeklyQuests: quests.weeklyQuests,
      clanDailyQuests: quests.clanDailyQuests,
      clanWeeklyQuests: quests.clanWeeklyQuests,
      dailyRerolls: quests.dailyRerolls,
      weeklyRerolls: quests.weeklyRerolls,
      lastDailyReset: quests.lastDailyReset,
      lastWeeklyReset: quests.lastWeeklyReset
    };
  }, [quests.dailyQuests, quests.weeklyQuests, quests.clanDailyQuests, quests.clanWeeklyQuests, quests.dailyRerolls, quests.weeklyRerolls, quests.lastDailyReset, quests.lastWeeklyReset]);

  // Clan system
  const { clan, clanScreen, setClanScreen, setClan, createClan, joinClan, leaveClan, promoteMember, demoteMember, kickMember, depositToVault, withdrawFromVault, claimQuestReward, upgradeClanHouse, purchaseUpgrade, inviteMember, updateRecruitment, getBrowseClans, requestJoinClan, reviewJoinRequest } = useClan();

  // Refs for clan
  const clanRef = useRef(clan);
  useEffect(() => { clanRef.current = clan; }, [clan]);

  // Check daily/weekly resets & generate quests on load (must be after useClan so clan is defined)
  const clanMemberCount = clan?.members?.length || 0;
  useEffect(() => {
    quests.checkResets(clanMemberCount);
  }, [clanMemberCount]);

  // When joining/creating a clan mid-day, ensure clan quests are generated immediately
  const prevClanRef = useRef(clan);
  useEffect(() => {
    const wasClanless = !prevClanRef.current;
    const hasClanNow = !!clan;
    prevClanRef.current = clan;
    if (wasClanless && hasClanNow && clanMemberCount > 0) {
      quests.ensureClanQuests(clanMemberCount);
    }
  }, [clan, clanMemberCount]);

  // Market system (online, Supabase-based)
  const marketUsername = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Player';
  const { marketOffers, setMarketOffers, marketSlots, setMarketSlots, orderHistory, setOrderHistory, marketScreen, setMarketScreen, createBuyOffer, createSellOffer, cancelOffer, collectOffer, collectAllOffers, purchaseMarketSlot, processMarketTick, allOffers, priceSummary, loading: marketLoading } = useMarket(user?.id, marketUsername);

  // Ref for market save/load
  const marketRef = useRef({ marketOffers, marketSlots, orderHistory });
  useEffect(() => { marketRef.current = { marketOffers, marketSlots, orderHistory }; }, [marketOffers, marketSlots, orderHistory]);

  // Save/Load system (Cloud + Local hybrid)
  const { hardResetGame, forceSave } = useCloudSave(user?.id, skillsRef, inventoryRef, equipment, combatStyle, quickPrayers, clanRef.current, setSkills, setInventory, setEquipment, setCombatStyle, setQuickPrayers, setClan, marketRef, setMarketOffers, setMarketSlots, setOrderHistory, activeAction, setActiveAction, ACTIONS, WEAPONS, ARMOR, AMMO, PETS, ITEMS, TOOL_SKILLS, TOOL_DROP_HOURS, PET_DROP_HOURS, claimedTools, setClaimedTools, toolboxes, setToolboxes, addXp, setOfflineProgress, inventoryOrderRef, setInventoryOrder, slayerRef, slayer.setCurrentTask, slayer.setSlayerPoints, slayer.setConsecutive, stopAction, monsterStatsRef, setMonsterStats, questRef, quests);

  // Wrap signOut to force save first
  const handleSignOut = async () => {
    await forceSave();
    signOut();
  };

  // Market simulation tick (elke 4 seconden)
  useEffect(() => {
    const marketInterval = setInterval(() => {
      processMarketTick();
    }, 4000);
    return () => clearInterval(marketInterval);
  }, [processMarketTick]);

  // Only use Lava background when the player actually started the lava cave
  const useLavaBg = activeAction === 'lava_cave' && screen === 'combat' && fightCaveActive;

  return (
    <div className="app-layout" style={{ backgroundImage: `url(${useLavaBg ? lavaBg : bgImage})` }}>
      <LevelUpToast levelUps={levelUps} activeAction={activeAction} ACTIONS={ACTIONS} screen={screen} />

      <div className="main-area">
        <TopBar inventory={inventory} screen={screen} skills={skills} setScreen={setScreen} setActivePopup={setActivePopup} hardResetGame={hardResetGame} signOut={handleSignOut} user={user} />

        <div className="main-body">
        <Sidebar screen={screen} setScreen={setScreen} skills={skills} activeAction={activeAction} ACTIONS={ACTIONS} combatLevel={combatLevel} />

        <main className="content-area">
          {screen === 'profile' && <ProfileView skills={skills} inventory={inventory} user={user} claimAllTools={claimAllTools} claimedTools={claimedTools} TOOL_SKILLS={TOOL_SKILLS} monsterStats={monsterStats} ACTIONS={ACTIONS} ITEM_IMAGES={ITEM_IMAGES} combatLevel={combatLevel} />}
          {screen === 'inventory' && <InventoryView inventory={inventory} ARMOR={ARMOR} equipment={equipment} equipmentAmounts={equipmentAmounts} WEAPONS={WEAPONS} AMMO={AMMO} toggleEquip={toggleEquip} combatStyle={combatStyle} setCombatStyle={setCombatStyle} sellItemToShop={sellItemToShop} setActivePopup={setActivePopup} depositToVault={depositToVault} clan={clan} setInventory={setInventory} inventoryOrder={inventoryOrder} setInventoryOrder={setInventoryOrder} />}
          {screen === 'shop' && <ShopView inventory={inventory} buyItem={buyItemFromShop} buyUpgrade={buyUpgrade} buyOfflineUpgrade={buyOfflineUpgrade} buyAutoToolUpgrade={buyAutoToolUpgrade} buyAutoEat={buyAutoEat} buyQuestUpgrade={buyQuestUpgrade} />}
          {screen === 'clan' && (
            <ClanView 
              clan={clan} clanScreen={clanScreen} setClanScreen={setClanScreen}
              createClan={createClan} joinClan={joinClan} leaveClan={leaveClan}
              promoteMember={promoteMember} demoteMember={demoteMember} kickMember={kickMember}
              depositToVault={depositToVault} withdrawFromVault={withdrawFromVault}
              claimQuestReward={claimQuestReward} upgradeClanHouse={upgradeClanHouse}
              purchaseUpgrade={purchaseUpgrade} inviteMember={inviteMember} updateRecruitment={updateRecruitment}
              inventory={inventory} setInventory={setInventory} ITEM_IMAGES={ITEM_IMAGES}
              skills={skills}
              quests={quests}
              setClan={setClan}
              addXp={addXp}
              getBrowseClans={getBrowseClans}
              requestJoinClan={requestJoinClan}
              reviewJoinRequest={reviewJoinRequest}
              user={user}
            />
          )}

          {screen === 'market' && (
            <MarketView
              inventory={inventory}
              setInventory={setInventory}
              marketOffers={marketOffers}
              marketSlots={marketSlots}
              orderHistory={orderHistory}
              marketScreen={marketScreen}
              setMarketScreen={setMarketScreen}
              createBuyOffer={createBuyOffer}
              createSellOffer={createSellOffer}
              cancelOffer={cancelOffer}
              collectOffer={collectOffer}
              collectAllOffers={collectAllOffers}
              purchaseMarketSlot={purchaseMarketSlot}
              ITEM_IMAGES={ITEM_IMAGES}
              ITEMS={ITEMS}
              allOffers={allOffers}
              priceSummary={priceSummary}
              marketLoading={marketLoading}
              userId={user?.id}
            />
          )}

          {screen === 'slayer' && (
            <div className="card" style={{ padding: '20px', width: '100%' }}>
              <SlayerView
                slayer={slayer}
                skills={skills}
                SLAYER_MASTERS={SLAYER_MASTERS}
                inventory={inventory}
                setInventory={setInventory}
                setScreen={setScreen}
                startCombat={startCombat}
              />
            </div>
          )}

          {/* Keep ThievingView mounted so the engine continues when navigating away. */}
          <div className="card" style={{ padding: '20px', width: '100%', display: screen === 'thieving' ? 'block' : 'none' }}>
            <ThievingView
              skills={skills} activeAction={activeAction} setActiveAction={setActiveAction}
              addXp={addXp}
              triggerXpDrop={triggerXpDrop}
              setInventory={setInventory}
              setSessionStats={setSessionStats}
              THIEVING_TARGETS={THIEVING_TARGETS}
              stopAction={stopAction}
              progress={progress}
              setProgress={setProgress}
              equipment={equipment}
              triggerPetNotification={triggerPetNotification}
              claimToolCallback={claimToolCallback}
              claimedTools={claimedTools}
              toolboxes={toolboxes}
              upgradeToolbox={upgradeToolbox}
              storeToolInBox={storeToolInBox}
              inventory={inventory}
              equipToolFromBox={equipToolFromBox}
              infuseTool={infuseTool}
              toggleEquip={toggleEquip}
              onActionComplete={(actionId) => questRecordRef.current(actionId)}
            />
          </div>

          {screen !== 'profile' && screen !== 'inventory' && screen !== 'slayer' && screen !== 'shop' && screen !== 'clan' && screen !== 'market' && screen !== 'thieving' && (
            <div className="card" style={{ padding: '20px', width: '100%' }}>
              {activeAction && ACTIONS[activeAction].skill === 'combat' && screen === 'combat' ? (
                fightCaveActive ? (
                  <FightCaveView 
                    activeAction={activeAction} ACTIONS={ACTIONS} 
                    playerHp={combat.playerHp} maxHp={maxHp} 
                    playerPrayer={playerPrayer} maxPrayer={maxPrayer} 
                    combatState={combat.combatState} prayers={combat.prayers} 
                    prayerQueue={combat.prayerQueue} togglePrayer={combat.togglePrayer} 
                    eatFood={(item, heal) => combat.eatFood(item, heal, setInventory)} 
                    drinkPotion={(item) => combat.drinkPotion(item, setInventory)}
                    getItemCount={getItemCount} stopAction={stopAction} 
                    getCurrentWeapon={getCurrentWeapon} xpDrops={xpDrops} 
                    quickPrayers={quickPrayers}
                    startCombat={startCombat}
                    activeWave={activeWave}
                    engine={combat.engine}
                    combatStyle={combatStyle}
                    setCombatStyle={setCombatStyle}
                    availableCombatStyles={getAvailableCombatStyles()}
                    equipment={equipment}
                    WEAPONS={WEAPONS}
                    ARMOR={ARMOR}
                    AMMO={AMMO}
                    combatLog={combat.combatLog}
                    username={user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Player'}
                  />
                ) : (
                  <CombatView 
                    activeAction={activeAction} ACTIONS={ACTIONS} 
                    playerHp={combat.playerHp} maxHp={maxHp} 
                    playerPrayer={playerPrayer} maxPrayer={maxPrayer} 
                    combatState={combat.combatState} prayers={combat.prayers} 
                    prayerQueue={combat.prayerQueue} togglePrayer={combat.togglePrayer} 
                    eatFood={(item, heal) => combat.eatFood(item, heal, setInventory)} 
                    drinkPotion={(item) => combat.drinkPotion(item, setInventory)}
                    getItemCount={getItemCount} stopAction={stopAction} 
                    getCurrentWeapon={getCurrentWeapon} xpDrops={xpDrops} 
                    quickPrayers={quickPrayers}
                    combatStyle={combatStyle}
                    setCombatStyle={setCombatStyle}
                    availableCombatStyles={getAvailableCombatStyles()}
                    equipment={equipment}
                    WEAPONS={WEAPONS}
                    ARMOR={ARMOR}
                    AMMO={AMMO}
                    slayerTask={slayer.currentTask}
                    combatLog={combat.combatLog}
                    setScreen={setScreen}
                    combatLevel={combatLevel}
                    username={user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Player'}
                  />
                )
              ) : screen === 'infusion' ? (
                <InfusionView 
                  ACTIONS={ACTIONS} skills={skills} 
                  activeAction={activeAction} startAction={startAction} 
                  stopAction={stopAction} getItemCount={getItemCount} 
                  progress={progress}
                  getActualActionTime={(id) => {
                    const action = ACTIONS[id];
                    if (!action) return 0;
                    let actualTime = (action.baseTime || 1800) * getSkillingSpeedMultiplier(action.skill, skills, equipment, WEAPONS, ARMOR, AMMO, ITEMS, toolboxes, inventory.autoToolboxUpgrade);
                    // Foraging pet: subtract 1 second
                    const pet = equipment?.pet ? PETS?.[equipment.pet] : null;
                    if (pet?.perk === 'foragingSpeed' && action.skill === 'foraging') {
                      actualTime = Math.max(500, actualTime - (pet.perkValue || 1000));
                    }
                    return actualTime;
                  }}
                />
              ) : (
                <SkillingView 
                  screen={screen} ACTIONS={ACTIONS} skills={skills} 
                  activeAction={activeAction} startAction={startAction} startCombat={startCombat} 
                  stopAction={stopAction} getItemCount={getItemCount} 
                  quickPrayers={quickPrayers} setQuickPrayers={setQuickPrayers} 
                  progress={progress} getRequiredXp={getRequiredXp}
                  claimToolCallback={claimToolCallback} claimedTools={claimedTools}
                  toolboxes={toolboxes} upgradeToolbox={upgradeToolbox} storeToolInBox={storeToolInBox}
                  inventory={inventory} toggleEquip={toggleEquip} equipment={equipment} equipToolFromBox={equipToolFromBox}
                  infuseTool={infuseTool}
                  combatLevel={combatLevel}
                  getActualActionTime={(id) => {
                    const action = ACTIONS[id];
                    if (!action) return 0;
                    let actualTime = (action.baseTime || 1800) * getSkillingSpeedMultiplier(action.skill, skills, equipment, WEAPONS, ARMOR, AMMO, ITEMS, toolboxes, inventory.autoToolboxUpgrade);
                    // Foraging pet: subtract 1 second
                    const pet = equipment?.pet ? PETS?.[equipment.pet] : null;
                    if (pet?.perk === 'foragingSpeed' && action.skill === 'foraging') {
                      actualTime = Math.max(500, actualTime - (pet.perkValue || 1000));
                    }
                    return actualTime;
                  }}
                />
              )}
            </div>
          )}
        </main>
        </div>
      </div>

      <FloatingBar activeAction={activeAction} ACTIONS={ACTIONS} progress={progress} stopAction={stopAction} setScreen={setScreen} screen={screen} xpDrops={xpDrops} combatStyle={combatStyle} combatState={combat.combatState} />
      <PetNotificationDisplay petNotifications={petNotifications} />

      {/* Slayer Task Complete Popup */}
      {slayerTaskComplete && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '20px',
          backgroundColor: 'rgba(40, 44, 52, 0.95)',
          border: '2px solid #4affd4',
          borderRadius: '8px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#4affd4',
          textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          zIndex: 99998,
          animation: 'petPerkFloatIn 3s ease-out forwards',
          backdropFilter: 'blur(4px)'
        }}>
          <span style={{ fontSize: '24px' }}>💀</span>
          <div>
            <div style={{ fontSize: '11px', color: '#7b95a6', textTransform: 'uppercase' }}>Slayer Task Complete!</div>
            <div style={{ fontSize: '13px', color: '#4affd4' }}>
              {slayerTaskComplete.killsNeeded}x {slayerTaskComplete.monsterKey.replace('fight_', '').replace(/_/g, ' ')} — +{slayerTaskComplete.points} pts
            </div>
          </div>
        </div>
      )}

      <WelcomeBackModal offlineProgress={offlineProgress} onClose={() => setOfflineProgress(null)} />

      {activePopup && (
        <div className="popup-overlay" onClick={() => setActivePopup(null)}>
          <div className="popup-box" onClick={e => e.stopPropagation()}>
            {activePopup === 'Quests' && <QuestModal quests={quests} close={() => setActivePopup(null)} setInventory={setInventory} addXp={addXp} clan={clan} setClan={setClan} />}
            {activePopup === 'Upgrades' && <UpgradeModal inventory={inventory} buyUpgrade={buyUpgrade} close={() => setActivePopup(null)} />}
            {activePopup === 'Analytics' && (
              <AnalyticsModal 
                activeAction={activeAction} ACTIONS={ACTIONS} skills={skills} 
                sessionStats={sessionStats} setSessionStats={setSessionStats} resetSession={resetSession}
                prayers={combat.prayers} combatStyle={combatStyle} getCurrentWeapon={getCurrentWeapon} 
              />
            )}
          </div>
        </div>
      )}

      {/* Auto-Eat Combat Start Popup */}
      {showCombatPopup && pendingCombatId && (
        <div className="popup-overlay" onClick={() => { setShowCombatPopup(false); setPendingCombatId(null); }}>
          <div className="popup-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: '25px', textAlign: 'center' }}>
            <h2 style={{ color: '#4affd4', marginBottom: '15px' }}>⚔️ Combat Settings</h2>
            <p style={{ color: '#c5d3df', fontSize: '14px', marginBottom: '20px' }}>
              Fighting: <strong style={{ color: 'white', textTransform: 'capitalize' }}>{ACTIONS[pendingCombatId]?.name || pendingCombatId.replace('fight_', '').replace(/_/g, ' ')}</strong>
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#4affd4', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                🍖 Auto Eat Threshold: {autoEatThreshold}% HP
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={autoEatThreshold}
                onChange={e => setAutoEatThreshold(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#4affd4', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#7b95a6', marginTop: '5px' }}>
                <span>Off (0%)</span>
                <span>100%</span>
              </div>
              <p style={{ fontSize: '12px', color: '#7b95a6', marginTop: '8px' }}>
                {autoEatThreshold === 0
                  ? 'Auto eat is disabled — you must eat manually.'
                  : `Auto eats food when HP drops below ${autoEatThreshold}%.`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => { setShowCombatPopup(false); setPendingCombatId(null); }}
                style={{ padding: '10px 25px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >Cancel</button>
              <button
                onClick={() => {
                  setShowCombatPopup(false);
                  const id = pendingCombatId;
                  setPendingCombatId(null);
                  // Persist threshold in inventory for save/load
                  setInventory(prev => ({ ...prev, autoEatThreshold }));
                  actuallyStartCombat(id);
                }}
                style={{ padding: '10px 25px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >Start Fight!</button>
            </div>
          </div>
        </div>
      )}

      <VictoryModal ACTIONS={ACTIONS} fightCaveVictory={fightCaveVictory} setFightCaveVictory={setFightCaveVictory} />
    </div>
  );
}