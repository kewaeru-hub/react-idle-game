import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { calculateOfflineProgress } from '../utils/offlineProgress';
import { SLAYER_MASTERS } from '../data/gameData';

const getLocalSaveKey = (userId) => {
  return userId ? `idleScape_save_v1_${userId}` : 'idleScape_save_v1';
};

export function useCloudSave(
  userId,
  skillsRef,
  inventoryRef,
  equipment,
  combatStyle,
  quickPrayers,
  clan,
  setSkills,
  setInventory,
  setEquipment,
  setCombatStyle,
  setQuickPrayers,
  setClan,
  marketRef,
  setMarketOffers,
  setMarketSlots,
  setOrderHistory,
  activeAction,
  setActiveAction,
  ACTIONS, WEAPONS, ARMOR, AMMO, PETS, ITEMS,
  TOOL_SKILLS, TOOL_DROP_HOURS, PET_DROP_HOURS,
  claimedTools, setClaimedTools,
  toolboxes, setToolboxes,
  addXp,
  setOfflineProgress,
  inventoryOrderRef, setInventoryOrder,
  slayerRef, setSlayerCurrentTask, setSlayerPoints, setSlayerConsecutive,
  stopAction,
  monsterStatsRef, setMonsterStats,
  questRef, questHook
) {
  const saveInProgress = useRef(false);
  const hasLoaded = useRef({});

  // Helper: check if user has loaded (per userId)
  const userHasLoaded = (uid) => {
    return hasLoaded.current[uid] === true;
  };

  // Helper: mark user as loaded
  const markUserAsLoaded = (uid) => {
    hasLoaded.current[uid] = true;
  };

  // Helper: bouw het game-state object (zelfde structuur als de oude localStorage save)
  const buildGameState = useCallback(() => {
    const { enchanting, ...cleanSkills } = skillsRef.current; // remove legacy skill
    return {
      skills: cleanSkills,
      inventory: inventoryRef.current,
      equipment,
      combatStyle,
      quickPrayers,
      claimedTools,
      toolboxes,
      inventoryOrder: inventoryOrderRef?.current || [],
      clan,
      market: marketRef?.current || null,
      slayer: slayerRef?.current || null,
      monsterStats: monsterStatsRef?.current || {},
      quests: questRef?.current || null,
      lastSaveTimestamp: Date.now(),
      activeAction
    };
  }, [equipment, combatStyle, quickPrayers, claimedTools, toolboxes, clan, activeAction]);

  // Helper: pas een parsed save toe op alle state setters
  const applySave = useCallback((parsed) => {
    try {
      // FIRST: Stop any active action from previous account
      if (stopAction) stopAction();

      let loadedInventory = inventoryRef.current;
      let loadedEquipment = equipment;
      let loadedSkills = {};

      if (parsed.skills) {
        const { enchanting, ...cleanSkills } = parsed.skills; // remove legacy skill
        setSkills(prev => ({ ...prev, ...cleanSkills }));
        loadedSkills = cleanSkills;
      }
      if (parsed.inventory) { setInventory(parsed.inventory); loadedInventory = parsed.inventory; }
      if (parsed.equipment) { setEquipment(parsed.equipment); loadedEquipment = parsed.equipment; }
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
      if (parsed.slayer) {
        if (setSlayerCurrentTask) setSlayerCurrentTask(parsed.slayer.currentTask || null);
        if (typeof parsed.slayer.slayerPoints === 'number' && setSlayerPoints) setSlayerPoints(parsed.slayer.slayerPoints);
        if (typeof parsed.slayer.consecutive === 'number' && setSlayerConsecutive) setSlayerConsecutive(parsed.slayer.consecutive);
      }

      // Restore quest state
      if (parsed.quests && questHook) {
        if (parsed.quests.dailyQuests) questHook.setDailyQuests(parsed.quests.dailyQuests);
        if (parsed.quests.weeklyQuests) questHook.setWeeklyQuests(parsed.quests.weeklyQuests);
        if (parsed.quests.clanDailyQuests) questHook.setClanDailyQuests(parsed.quests.clanDailyQuests);
        if (parsed.quests.clanWeeklyQuests) questHook.setClanWeeklyQuests(parsed.quests.clanWeeklyQuests);
        if (typeof parsed.quests.dailyRerolls === 'number') questHook.setDailyRerolls(parsed.quests.dailyRerolls);
        if (typeof parsed.quests.weeklyRerolls === 'number') questHook.setWeeklyRerolls(parsed.quests.weeklyRerolls);
        if (parsed.quests.lastDailyReset) questHook.setLastDailyReset(parsed.quests.lastDailyReset);
        if (parsed.quests.lastWeeklyReset) questHook.setLastWeeklyReset(parsed.quests.lastWeeklyReset);
      }

      // Offline progressie berekening
      if (parsed.lastSaveTimestamp && parsed.activeAction && ACTIONS) {
        const offlineData = calculateOfflineProgress(
          parsed.lastSaveTimestamp,
          parsed.activeAction,
          loadedSkills,
          loadedEquipment,
          loadedInventory,
          ACTIONS, WEAPONS, ARMOR, AMMO, PETS, ITEMS,
          TOOL_SKILLS, TOOL_DROP_HOURS, PET_DROP_HOURS,
          parsed.toolboxes || toolboxes,
          parsed.combatStyle || 'attack'
        );
        if (offlineData) {
          setInventory(offlineData.newInventory);
          if (addXp) addXp(offlineData.skill, offlineData.totalXp);
          // Combat also gives hitpoints XP
          if (offlineData.isCombat && offlineData.hpXp && addXp) {
            addXp('hitpoints', offlineData.hpXp);
          }
          // Update monsterStats with offline combat kills
          if (offlineData.isCombat && offlineData.monsterStatsUpdate && setMonsterStats) {
            setMonsterStats(prev => {
              const updated = { ...prev };
              Object.entries(offlineData.monsterStatsUpdate).forEach(([monsterId, stats]) => {
                const existing = updated[monsterId] || { kills: 0, loot: {}, timeMs: 0 };
                updated[monsterId] = {
                  kills: existing.kills + stats.kills,
                  loot: {
                    ...existing.loot,
                    ...Object.entries(stats.loot || {}).reduce((acc, [k, v]) => {
                      acc[k] = (existing.loot?.[k] || 0) + v;
                      return acc;
                    }, {})
                  },
                  timeMs: existing.timeMs + stats.timeMs
                };
              });
              return updated;
            });
          }
          
          // Apply offline kills to slayer task if applicable
          if (offlineData.isCombat && offlineData.totalActions > 0) {
            const savedTask = parsed.slayer?.currentTask;
            if (savedTask && parsed.activeAction === savedTask.monsterKey) {
              const newCompleted = savedTask.killsCompleted + offlineData.totalActions;
              if (newCompleted >= savedTask.killsNeeded) {
                // Task completed during offline! Award points
                const master = SLAYER_MASTERS.find(m => m.id === savedTask.masterId);
                if (master && setSlayerPoints) setSlayerPoints(p => p + master.points);
                if (setSlayerConsecutive) setSlayerConsecutive(c => c + 1);
                if (setSlayerCurrentTask) setSlayerCurrentTask(null); // Clear completed task
              } else {
                // Task not yet complete, update kills count
                if (setSlayerCurrentTask) setSlayerCurrentTask({ ...savedTask, killsCompleted: newCompleted });
              }
            }
          }
          if (setOfflineProgress) setOfflineProgress(offlineData);
        }
      } else if (parsed.lastSaveTimestamp && !parsed.activeAction) {
        const minutesAway = Math.floor((Date.now() - parsed.lastSaveTimestamp) / 60000);
        if (minutesAway >= 2 && setOfflineProgress) {
          setOfflineProgress({ noTask: true, minutesAway });
        }
      }

      console.log('Save loaded successfully!');
    } catch (e) {
      console.error('Save corrupt:', e);
    }
  }, [stopAction]);

  // ===== A. LADEN BIJ OPSTARTEN =====
  useEffect(() => {
    if (!userId || userHasLoaded(userId)) return;
    markUserAsLoaded(userId);

    const loadSave = async () => {
      let cloudParsed = null;
      let localParsed = null;

      // 1. Probeer cloud save te laden
      try {
        const { data, error } = await supabase
          .from('game_saves')
          .select('save_data')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error('Cloud load failed:', error);
        }
        if (data) {
          cloudParsed = data.save_data;
        }
      } catch (e) {
        console.error('Cloud load error:', e);
      }

      // 2. Probeer localStorage te laden
      try {
        const localRaw = localStorage.getItem(getLocalSaveKey(userId));
        if (localRaw) {
          localParsed = JSON.parse(localRaw);
        }
      } catch (e) {
        console.error('Local save corrupt:', e);
      }

      // 3. Gebruik de nieuwste save (vergelijk timestamps)
      let parsed = null;
      if (cloudParsed && localParsed) {
        const cloudTime = cloudParsed.lastSaveTimestamp || 0;
        const localTime = localParsed.lastSaveTimestamp || 0;
        parsed = cloudTime >= localTime ? cloudParsed : localParsed;
        console.log(`Using ${cloudTime >= localTime ? 'cloud' : 'local'} save (cloud: ${new Date(cloudTime).toLocaleString()}, local: ${new Date(localTime).toLocaleString()})`);
      } else {
        parsed = cloudParsed || localParsed;
      }

      if (!parsed) {
        console.log('New player — no save found');
        return;
      }

      applySave(parsed);
    };

    loadSave();
  }, [userId]);

  // ===== B. AUTO-SAVE ELKE 10 SECONDEN (Cloud + Local) =====
  useEffect(() => {
    if (!userId) return;

    const saveInterval = setInterval(async () => {
      if (saveInProgress.current) return;
      saveInProgress.current = true;

      const gameState = buildGameState();

      // Altijd naar localStorage schrijven (snel, betrouwbaar)
      try {
        localStorage.setItem(getLocalSaveKey(userId), JSON.stringify(gameState));
      } catch (e) {
        console.error('Local save failed:', e);
      }

      // Cloud save via Edge Function (server-side validation)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          console.error('No auth session');
          saveInProgress.current = false;
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-game`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ save_data: gameState })
          }
        );

        const result = await response.json();
        if (!result.success) {
          console.error('Save rejected:', result.errors || result.error);
        }
      } catch (e) {
        console.error('Cloud save error:', e);
      }

      saveInProgress.current = false;
    }, 10000);

    return () => clearInterval(saveInterval);
  }, [userId, buildGameState]);

  // ===== C. SAVE BIJ TAB SLUITEN (alleen localStorage — altijd betrouwbaar) =====
  useEffect(() => {
    if (!userId) return;

    const handleBeforeUnload = () => {
      const gameState = buildGameState();
      try {
        localStorage.setItem(getLocalSaveKey(userId), JSON.stringify(gameState));
      } catch (e) {
        // Ignore
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [userId, buildGameState]);

  // ===== D. FORCE SAVE (for logout, etc.) =====
  const forceSave = useCallback(async () => {
    const gameState = buildGameState();

    // Always save to localStorage first (fast, reliable)
    try {
      localStorage.setItem(getLocalSaveKey(userId), JSON.stringify(gameState));
    } catch (e) {
      console.error('Local save failed:', e);
    }

    // Then try cloud save
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-game`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ save_data: gameState })
          }
        );
      }
    } catch (e) {
      console.error('Cloud save error during forceSave:', e);
    }
  }, [userId, buildGameState]);

  // ===== E. HARD RESET =====
  const hardResetGame = async () => {
    if (!window.confirm('Are you sure you want to completely wipe your save? This cannot be undone!')) return;

    // Verwijder cloud save
    try {
      const { error } = await supabase
        .from('game_saves')
        .delete()
        .eq('user_id', userId);
      if (error) console.error('Cloud reset failed:', error);
    } catch (e) {
      console.error('Cloud reset error:', e);
    }

    // Verwijder local save
    localStorage.removeItem(getLocalSaveKey(userId));

    window.location.reload();
  };

  return { hardResetGame, forceSave };
}
