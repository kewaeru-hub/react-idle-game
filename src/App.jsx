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
import { ARMOR, SKILL_LIST, WEAPONS, ACTIONS, AMMO, ITEMS, SLAYER_MASTERS, THIEVING_TARGETS, POTION_EFFECTS, PRAYER_BOOK, ITEM_IMAGES, PETS, TOOL_SKILLS, TOOL_DROP_HOURS, PET_DROP_HOURS } from './data/gameData';
import { getRequiredXp, getSkillingSpeedMultiplier } from './utils/gameHelpers';
import { monsters as fightCaveMonsters, waves as fightCaveWaves } from './data/fightCaveData';

// Custom Hooks
import { useXpSystem } from './hooks/useXpSystem';
import { useCombat } from './hooks/useCombat';
import { useSkilling } from './hooks/useSkilling';
import { useEquipment } from './hooks/useEquipment';
import { useShop } from './hooks/useShop';
import { useAuth } from './hooks/useAuth';
import { useCloudSave } from './hooks/useCloudSave';
import AuthScreen from './components/AuthScreen';
import { useFightCave } from './hooks/useFightCave';
import { useClan } from './hooks/useClan';
import { useMarket } from './hooks/useMarket';
import { useSlayer } from './hooks/useSlayer';

export default function App() {
  // --- 0. AUTH ---
  const { user, loading: authLoading, signUp, signIn, signOut } = useAuth();

  // --- 1. BASIC STATE ---
  const [screen, setScreen] = useState('profile'); 
  const [activePopup, setActivePopup] = useState(null); 
  const [activeAction, setActiveAction] = useState(null);
  const [progress, setProgress] = useState(0); 
  const [combatStyle, setCombatStyle] = useState('attack');
  const [inventory, setInventory] = useState({ coins: 0, bones: 0, raw_shrimp: 0, cooked_shrimp: 5, prayer_potion: 5, shortbow: 1, wooden_staff: 1, bronze_bow: 1, bronze_scimitar: 1, bronze_staff: 1, maxSlots: 35, offlineHoursUpgrade: 0, woodcutting_pet: 1, fishing_pet: 1, mining_pet: 1, foraging_pet: 1, cooking_pet: 1, smithing_pet: 1, crafting_pet: 1, herblore_pet: 1, thieving_pet: 1, farming_pet: 1, agility_pet: 1, slayer_pet: 1 });
  const [offlineProgress, setOfflineProgress] = useState(null);

  // Refs
  const inventoryRef = useRef(inventory);

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

  // Refs
  const combatRef = useRef(null);
  const playerPrayerRef = useRef(playerPrayer);
  const inventoryOrderRef = useRef(inventoryOrder);

  useEffect(() => { inventoryRef.current = inventory; }, [inventory]);
  useEffect(() => { playerPrayerRef.current = playerPrayer; }, [playerPrayer]);
  useEffect(() => { inventoryOrderRef.current = inventoryOrder; }, [inventoryOrder]);

  // Sync inventoryOrder: remove items that no longer exist, append new items at end
  useEffect(() => {
    const exclude = new Set(['coins', 'maxSlots', 'slayer_points', 'offlineHoursUpgrade']);
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

    const ironToolTier = 1; // iron = index 1
    const toolId = TOOL_SKILLS[skill].tiers[ironToolTier];

    // Mark as claimed
    setClaimedTools(prev => ({
      ...prev,
      [skill]: true
    }));

    // Initialize toolbox for this skill with the iron tool auto-stored (NOT in inventory)
    setToolboxes(prev => ({
      ...prev,
      [skill]: {
        level: 0,
        slots: [toolId]  // Iron tool auto-stored in first slot
      }
    }));
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

  const combat = useCombat(
    activeAction, ACTIONS, skills, { maxHp, maxPrayer }, 
    combatStyle, setInventory, addXp, triggerXpDrop, stopAction, getCurrentWeapon, slayerTask, equipment
  );

  useEffect(() => { combatRef.current = combat; }, [combat]);

  // Fight cave system
  const { fightCaveActive, setFightCaveActive, fightCaveWaveIndex, activeWave, fightCaveVictory, setFightCaveVictory, startFightCave, changeFightCaveTarget } = useFightCave(
    combat, setInventory, stopAction, setPlayerPrayer, playerPrayer, maxPrayer
  );

  const startCombat = (id) => {
    console.log('[App] startCombat', id);
    setActiveAction(id);
    setProgress(0);
    resetSession();
    combat.clearCombatLog();

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
        startCombat('lava_cave');
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
      startCombat(activeAction);
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
    combat.engine.updateAlly('player', {
      attackSpeedTicks: weapon.speedTicks || 4,
      weaponAtt: weapon.att || 0,
      weaponStr: weapon.str || 0
    });
  }, [equipment.weapon]);

  // Update engine when combat style changes during combat (don't reset attack tick)
  useEffect(() => {
    if (!activeAction || !ACTIONS[activeAction] || ACTIONS[activeAction].skill !== 'combat') return;
    if (!combat?.engine?.updateAlly) return;
    const accLevel = combatStyle === 'ranged' ? (skills.ranged?.level || 1) : combatStyle === 'magic' ? (skills.magic?.level || 1) : (skills.attack?.level || 1);
    const strLevel = combatStyle === 'ranged' ? (skills.ranged?.level || 1) : combatStyle === 'magic' ? (skills.magic?.level || 1) : (skills.strength?.level || 1);
    combat.engine.updateAlly('player', {
      att: accLevel,
      str: strLevel
    });
  }, [combatStyle]);

  // Skilling engine
  useSkilling(activeAction, ACTIONS, skills, equipment, inventoryRef, setProgress, setInventory, addXp, triggerXpDrop, setSessionStats, stopAction, WEAPONS, ARMOR, AMMO, triggerPetNotification, TOOL_SKILLS, TOOL_DROP_HOURS, toolboxes, onToolDropped);

  // Slayer system
  const [slayerTaskComplete, setSlayerTaskComplete] = useState(null);
  const handleSlayerTaskComplete = (data) => {
    setSlayerTaskComplete(data);
    setTimeout(() => setSlayerTaskComplete(null), 4000);
  };
  const slayer = useSlayer(SLAYER_MASTERS, ACTIONS, handleSlayerTaskComplete);

  // Shop functions
  const { sellItemToShop, buyItemFromShop, buyUpgrade, buyOfflineUpgrade, buyAutoToolUpgrade } = useShop(setInventory, inventory);

  // Clan system
  const { clan, clanScreen, setClanScreen, setClan, createClan, joinClan, leaveClan, promoteMember, demoteMember, kickMember, depositToVault, withdrawFromVault, claimQuestReward, upgradeClanHouse, purchaseUpgrade, inviteMember, updateRecruitment } = useClan();

  // Refs for clan
  const clanRef = useRef(clan);
  useEffect(() => { clanRef.current = clan; }, [clan]);

  // Market system
  const { marketOffers, setMarketOffers, marketSlots, setMarketSlots, orderHistory, setOrderHistory, marketScreen, setMarketScreen, createBuyOffer, createSellOffer, cancelOffer, collectOffer, collectAllOffers, purchaseMarketSlot, processMarketTick } = useMarket();

  // Ref for market save/load
  const marketRef = useRef({ marketOffers, marketSlots, orderHistory });
  useEffect(() => { marketRef.current = { marketOffers, marketSlots, orderHistory }; }, [marketOffers, marketSlots, orderHistory]);

  // Save/Load system (Cloud + Local hybrid)
  const { hardResetGame } = useCloudSave(user?.id, skillsRef, inventoryRef, equipment, combatStyle, quickPrayers, clanRef.current, setSkills, setInventory, setEquipment, setCombatStyle, setQuickPrayers, setClan, marketRef, setMarketOffers, setMarketSlots, setOrderHistory, activeAction, setActiveAction, ACTIONS, WEAPONS, ARMOR, AMMO, PETS, ITEMS, TOOL_SKILLS, TOOL_DROP_HOURS, PET_DROP_HOURS, claimedTools, setClaimedTools, toolboxes, setToolboxes, addXp, setOfflineProgress, inventoryOrderRef, setInventoryOrder);

  // Market simulation tick (elke 4 seconden)
  useEffect(() => {
    const marketInterval = setInterval(() => {
      processMarketTick();
    }, 4000);
    return () => clearInterval(marketInterval);
  }, [processMarketTick]);

  // Only use Lava background when the player actually started the lava cave
  const useLavaBg = activeAction === 'lava_cave' && screen === 'combat' && fightCaveActive;

  // Auth gate — show login screen if not authenticated
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e17', color: '#4affd4', fontSize: '24px' }}>
        <span style={{ fontSize: '48px', marginRight: '16px' }}>⚔️</span> Loading...
      </div>
    );
  }
  if (!user) {
    return <AuthScreen onSignIn={signIn} onSignUp={signUp} />;
  }

  return (
    <div className="app-layout" style={{ backgroundImage: `url(${useLavaBg ? lavaBg : bgImage})` }}>
      <LevelUpToast levelUps={levelUps} activeAction={activeAction} ACTIONS={ACTIONS} screen={screen} />

      <div className="main-area">
        <TopBar inventory={inventory} screen={screen} skills={skills} setScreen={setScreen} setActivePopup={setActivePopup} hardResetGame={hardResetGame} signOut={signOut} user={user} />

        <div className="main-body">
        <Sidebar screen={screen} setScreen={setScreen} skills={skills} />

        <main className="content-area">
          {screen === 'profile' && <ProfileView skills={skills} inventory={inventory} />}
          {screen === 'inventory' && <InventoryView inventory={inventory} ARMOR={ARMOR} equipment={equipment} equipmentAmounts={equipmentAmounts} WEAPONS={WEAPONS} AMMO={AMMO} toggleEquip={toggleEquip} combatStyle={combatStyle} setCombatStyle={setCombatStyle} sellItemToShop={sellItemToShop} setActivePopup={setActivePopup} depositToVault={depositToVault} clan={clan} setInventory={setInventory} inventoryOrder={inventoryOrder} setInventoryOrder={setInventoryOrder} />}
          {screen === 'shop' && <ShopView inventory={inventory} buyItem={buyItemFromShop} buyUpgrade={buyUpgrade} buyOfflineUpgrade={buyOfflineUpgrade} buyAutoToolUpgrade={buyAutoToolUpgrade} />}
          {screen === 'clan' && (
            <ClanView 
              clan={clan} clanScreen={clanScreen} setClanScreen={setClanScreen}
              createClan={createClan} joinClan={joinClan} leaveClan={leaveClan}
              promoteMember={promoteMember} demoteMember={demoteMember} kickMember={kickMember}
              depositToVault={depositToVault} withdrawFromVault={withdrawFromVault}
              claimQuestReward={claimQuestReward} upgradeClanHouse={upgradeClanHouse}
              purchaseUpgrade={purchaseUpgrade} inviteMember={inviteMember} updateRecruitment={updateRecruitment}
              inventory={inventory} setInventory={setInventory} ITEM_IMAGES={ITEM_IMAGES}
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

      <FloatingBar activeAction={activeAction} ACTIONS={ACTIONS} progress={progress} stopAction={stopAction} setScreen={setScreen} screen={screen} xpDrops={xpDrops} />
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
            {activePopup === 'Quests' && <QuestModal />}
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

      <VictoryModal ACTIONS={ACTIONS} fightCaveVictory={fightCaveVictory} setFightCaveVictory={setFightCaveVictory} />
    </div>
  );
}