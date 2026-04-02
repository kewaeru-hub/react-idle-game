import { useEffect } from 'react';
import { calculateOfflineProgress } from '../utils/offlineProgress';

const SAVE_KEY = 'idleScape_save_v1';

export function useSaveLoad(skillsRef, inventoryRef, equipment, combatStyle, quickPrayers, clan, setSkills, setInventory, setEquipment, setCombatStyle, setQuickPrayers, setClan, marketRef, setMarketOffers, setMarketSlots, setOrderHistory, activeAction, setActiveAction, ACTIONS, WEAPONS, ARMOR, AMMO, PETS, ITEMS, TOOL_SKILLS, TOOL_DROP_HOURS, PET_DROP_HOURS, claimedTools, setClaimedTools, toolboxes, setToolboxes, addXp, setOfflineProgress, inventoryOrderRef, setInventoryOrder, monsterStatsRef, setMonsterStats) {
  // A. Laden bij opstarten (draait 1 keer)
  useEffect(() => {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        let loadedInventory = inventoryRef.current;
        let loadedEquipment = equipment;
        let loadedSkills = {};
        
        if (parsed.skills) {
          // Merge saved skills into current/default skills so newly added skills
          // (e.g. 'infusion') are not lost when loading an older save.
          setSkills(prev => ({ ...prev, ...parsed.skills }));
          loadedSkills = parsed.skills;
        }
        if (parsed.inventory) {
          setInventory(parsed.inventory);
          loadedInventory = parsed.inventory;
        }
        if (parsed.equipment) {
          setEquipment(parsed.equipment);
          loadedEquipment = parsed.equipment;
        }
        if (parsed.combatStyle) setCombatStyle(parsed.combatStyle);
        if (parsed.quickPrayers) setQuickPrayers(parsed.quickPrayers);
        if (parsed.claimedTools && setClaimedTools) setClaimedTools(parsed.claimedTools);
        if (parsed.toolboxes && setToolboxes) setToolboxes(parsed.toolboxes);
        if (parsed.clan && setClan) setClan(parsed.clan);
        if (parsed.inventoryOrder && setInventoryOrder) setInventoryOrder(parsed.inventoryOrder);
        if (parsed.monsterStats && setMonsterStats) setMonsterStats(parsed.monsterStats);
        if (parsed.market) {
          if (parsed.market.marketOffers && setMarketOffers) setMarketOffers(parsed.market.marketOffers);
          if (parsed.market.marketSlots && setMarketSlots) setMarketSlots(parsed.market.marketSlots);
          if (parsed.market.orderHistory && setOrderHistory) setOrderHistory(parsed.market.orderHistory);
        }
        if (parsed.activeAction && setActiveAction) setActiveAction(parsed.activeAction);
        if (parsed.lastSaveTimestamp) window.lastSaveTimestamp = parsed.lastSaveTimestamp;
        
        // Bereken offline progressie
        if (parsed.lastSaveTimestamp && parsed.activeAction && ACTIONS) {
          const offlineData = calculateOfflineProgress(
            parsed.lastSaveTimestamp,
            parsed.activeAction,
            loadedSkills,
            loadedEquipment,
            loadedInventory,
            ACTIONS,
            WEAPONS,
            ARMOR,
            AMMO,
            PETS,
            ITEMS,
            TOOL_SKILLS,
            TOOL_DROP_HOURS,
            PET_DROP_HOURS,
            parsed.toolboxes || toolboxes
          );
          
          if (offlineData) {
            // Update inventory en add XP
            setInventory(offlineData.newInventory);
            if (addXp) addXp(offlineData.skill, offlineData.totalXp);
            
            // Sla offline progressie data op voor modal
            if (setOfflineProgress) setOfflineProgress(offlineData);
          }
        } else if (parsed.lastSaveTimestamp && !parsed.activeAction) {
          // Player was logged out WITHOUT an active task
          const timeDiffMs = Date.now() - parsed.lastSaveTimestamp;
          const minutesAway = Math.floor(timeDiffMs / (1000 * 60));
          // Only show if player was away for at least 2 minutes
          if (minutesAway >= 2 && setOfflineProgress) {
            setOfflineProgress({ noTask: true, minutesAway });
          }
        }
        
        console.log("Save loaded successfully!");
      } catch (e) {
        console.error("Save file corrupt", e);
      }
    }
  }, []); // Lege array zorgt dat dit alleen bij refresh/opstarten draait

  // B. Auto-Save (Elke 5 seconden op de achtergrond)
  useEffect(() => {
    const saveInterval = setInterval(() => {
      const gameState = {
        // We gebruiken de refs hier zodat de timer niet reset bij elke XP drop
        skills: skillsRef.current,
        inventory: inventoryRef.current,
        equipment,
        combatStyle,
        quickPrayers,
        claimedTools,
        toolboxes,
        inventoryOrder: inventoryOrderRef?.current || [],
        monsterStats: monsterStatsRef?.current || {},
        clan,
        market: marketRef?.current || null,
        lastSaveTimestamp: Date.now(),
        activeAction: activeAction
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    }, 5000); 

    return () => clearInterval(saveInterval);
  }, [equipment, combatStyle, quickPrayers, claimedTools, toolboxes, clan, activeAction]); 

  // C. Noodknop: Reset Save
  const hardResetGame = () => {
    if(window.confirm("Are you sure you want to completely wipe your save? This cannot be undone!")) {
      localStorage.removeItem(SAVE_KEY);
      window.location.reload(); // Herlaad de pagina vers
    }
  };

  return { hardResetGame };
}
