// src/hooks/useCombat.js
// Thin adapter over useCombatEngine. No feedback loops.
import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import useCombatEngine from './useCombatEngine';
import { getActivePet } from '../utils/gameHelpers';
import { PRAYER_BOOK } from '../data/gameData';

export function useCombat(
  activeAction,
  ACTIONS,
  skills,
  playerStats,
  combatStyle,
  setInventory,
  addXp,
  triggerXpDrop,
  stopAction,
  getCurrentWeapon,
  slayerTask,
  equipment
) {
  // === Initialize engine (no params) ===
  const engine = useCombatEngine();

  // Keep a ref to combatStyle so callbacks always read the latest value
  const combatStyleRef = useRef(combatStyle);
  useEffect(() => { combatStyleRef.current = combatStyle; }, [combatStyle]);

  // === Combat Log ===
  const combatLogRef = useRef([]);
  const [combatLog, setCombatLog] = useState([]);
  const addLogEntry = useCallback((entry) => {
    const newEntry = { id: Date.now() + Math.random(), timestamp: Date.now(), ...entry };
    combatLogRef.current = [...combatLogRef.current.slice(-99), newEntry];
    setCombatLog([...combatLogRef.current]);
  }, []);
  const clearCombatLog = useCallback(() => {
    combatLogRef.current = [];
    setCombatLog([]);
  }, []);

  // === seedCombat: The entry point to start a fight ===
  const seedCombat = (actionId, waveMonsters = null, appCallbacks = null) => {
    const weapon = getCurrentWeapon() || {};
    const accLevel = combatStyle === 'ranged' ? (skills.ranged?.level || 1) : combatStyle === 'magic' ? (skills.magic?.level || 1) : (skills.attack?.level || 1);
    const strLevel = combatStyle === 'ranged' ? (skills.ranged?.level || 1) : combatStyle === 'magic' ? (skills.magic?.level || 1) : (skills.strength?.level || 1);
    const agilityLevel = skills.agility?.level || 1;
    const dodgeChance = agilityLevel * 0.002; // 0.2% per level = 0.002

    // Check if we're on a slayer task and have the slayer pet equipped
    let slayerBonus = 1.0;
    if (slayerTask) {
      const activePet = getActivePet(equipment);
      if (activePet && activePet.perk === 'slayerBonus') {
        slayerBonus = 1 + (activePet.perkValue || 0.05); // Default 5% bonus
      }
    }
    engine.setSlayerBonus(slayerBonus);

    // Preserve player HP between wave transitions (unless dead)
    const currentAllies = engine.getAllies ? engine.getAllies() : engine.allies;
    const currentPlayer = currentAllies.find(a => a.id === 'player');
    const currentHp = currentPlayer && currentPlayer.hp > 0 ? currentPlayer.hp : (playerStats?.maxHp || 10);

    const allies = [{
      id: 'player',
      name: 'Player',
      hp: currentHp,
      maxHp: playerStats?.maxHp || 10,
      att: accLevel,
      str: strLevel,
      weaponAtt: weapon.att || 0,
      weaponStr: weapon.str || 0,
      attackSpeedTicks: weapon.speedTicks || 4,
      currentTickCount: 0,
      dodgeChance: dodgeChance
    }];

    let enemies;
    if (waveMonsters && waveMonsters.length > 0) {
      enemies = waveMonsters.map((m, i) => ({
        id: `m-${i}`,
        name: m.name,
        hp: m.hp || m.currentHp || 1,
        maxHp: m.hp || m.currentHp || 1,
        att: m.offensiveStats?.attack || m.att || 1,
        str: m.offensiveStats?.attack || m.str || 1,
        def: m.def || 0,
        attackSpeedTicks: m.attackSpeed || m.speedTicks || 4,
        currentTickCount: 0,
        type: m.type
      }));
    } else {
      const e = ACTIONS[actionId]?.enemy;
      if (!e) return;
      enemies = [{
        id: 'e-0',
        name: ACTIONS[actionId]?.name || e.name || 'Enemy',
        hp: e.hp,
        maxHp: e.hp,
        att: e.att || 1,
        str: e.str || 1,
        def: e.def || 0,
        attackSpeedTicks: e.speedTicks || 4,
        currentTickCount: 0,
        type: e.type
      }];
    }

    const callbacks = {
      onHit: (attackerId, defenderId, damage, prayerInfo) => {
        // Look up entity names for combat log — use ref getters for live data
        const allEntities = [...(engine.getAllies?.() || []), ...(engine.getEnemies?.() || [])];
        const getEntityName = (id) => {
          if (id === 'player') return 'You';
          return allEntities.find(e => e.id === id)?.name || 'Enemy';
        };

        if (attackerId === 'player') {
          const style = combatStyleRef.current;
          const xpAmount = Math.floor(damage * 4);
          addXp && addXp(style, xpAmount);
          addXp && addXp('hitpoints', Math.floor(damage * 1.33));
          triggerXpDrop && triggerXpDrop(style, damage, false);
          addLogEntry({
            type: damage > 0 ? 'player_hit' : 'player_miss',
            target: getEntityName(defenderId),
            damage,
            xpSkill: style,
            xpAmount,
            baseDamage: prayerInfo?.baseDamage ?? damage,
            prayerBonus: prayerInfo?.prayerBonus || 0
          });
        } else {
          addLogEntry({
            type: damage > 0 ? 'enemy_hit' : 'enemy_miss',
            attacker: getEntityName(attackerId),
            damage,
            baseDamage: prayerInfo?.baseDamage ?? damage,
            prayerBlocked: prayerInfo?.prayerBlocked || 0
          });
        }
        // Call app-provided callback if exists
        if (appCallbacks?.onHit) appCallbacks.onHit(attackerId, defenderId, damage);
      },
      onKill: (killed) => {
        if (killed.id !== 'player') {
          addLogEntry({ type: 'kill', target: killed.name || 'Enemy' });
          // Award loot for regular combat (not fight cave)
          const data = ACTIONS[actionId];
          if (data && data.reward && !data.isFightCave) {
            setInventory(prev => {
              const n = { ...prev };
              Object.entries(data.reward).forEach(([k, v]) => {
                n[k] = (n[k] || 0) + v;
              });
              return n;
            });
          }
        }
        // Call app-provided callback if exists
        if (appCallbacks?.onKill) appCallbacks.onKill(killed);
      },
      onAllEnemiesDead: () => {
        // Call app-provided callback if exists (handles wave advancement for fight-cave)
        if (appCallbacks?.onAllEnemiesDead) appCallbacks.onAllEnemiesDead();
      },
      onPrayerDrain: (amount) => {
        // Drain prayer points
        if (appCallbacks?.onPrayerDrain) appCallbacks.onPrayerDrain(amount);
      },
      onPotionDrink: (amount) => {
        // Restore prayer points
        if (appCallbacks?.onPotionDrink) appCallbacks.onPotionDrink(amount);
      },
      onPlayerDead: () => {
        stopAction && stopAction();
        // Call app-provided callback if exists (handles respawn for regular combat)
        if (appCallbacks?.onPlayerDead) appCallbacks.onPlayerDead();
      }
    };

    engine.seed(allies, enemies, callbacks);
  };
  // === Derived combatState from engine (computed, not stored) ===
  const combatState = useMemo(() => {
    const player = engine.allies.find(a => a.id === 'player');
    const firstEnemy = engine.enemies.find(e => e.hp > 0) || engine.enemies[0];
    return {
      enemyHp: firstEnemy?.hp || 0,
      enemyMaxHp: firstEnemy?.maxHp || 1,
      enemySpeed: firstEnemy?.attackSpeedTicks || 4,
      playerTick: player?.currentTickCount || 0,
      enemyTick: firstEnemy?.currentTickCount || 0,
      isRespawning: engine.respawnTicksLeft > 0,
      respawnTicksLeft: engine.respawnTicksLeft || 0,
      enemy: firstEnemy || null
    };
  }, [engine.allies, engine.enemies, engine.respawnTicksLeft]);

  // === Derived playerHp from engine ===
  const playerHp = useMemo(() => {
    const player = engine.allies.find(a => a.id === 'player');
    return player?.hp || playerStats?.maxHp || 10;
  }, [engine.allies, playerStats]);

  // === eatFood: Queue an EAT action (max 1 per tick, blocked at full HP) ===
  const lastEatTick = useRef(-1);
  const eatFood = (item, healAmount, inventorySetter) => {
    if (!inventorySetter) return false;
    // Block eating at full HP
    const player = engine.allies.find(a => a.id === 'player');
    if (player && player.hp >= player.maxHp) return false;
    // Max 1 food per tick
    if (engine.tickNumber === lastEatTick.current) return false;
    lastEatTick.current = engine.tickNumber;
    // Deduct from inventory
    inventorySetter(prev => {
      if ((prev[item] || 0) < 1) return prev;
      const n = { ...prev };
      n[item] = (n[item] || 0) - 1;
      if (n[item] <= 0) delete n[item];
      return n;
    });
    // Queue the heal in engine
    engine.queueAction({ type: 'EAT', heal: healAmount, targetId: 'player' });
    return true;
  };

  // === drinkPotion: Queue a POTION action (max 1 per tick) ===
  const lastPotionTick = useRef(-1);
  const drinkPotion = (potionType, inventorySetter) => {
    if (!inventorySetter) return false;
    // Max 1 potion per tick
    if (engine.tickNumber === lastPotionTick.current) return false;
    lastPotionTick.current = engine.tickNumber;
    // Deduct from inventory
    inventorySetter(prev => {
      if ((prev[potionType] || 0) < 1) return prev;
      const n = { ...prev };
      n[potionType] = (n[potionType] || 0) - 1;
      if (n[potionType] <= 0) delete n[potionType];
      return n;
    });
    // Queue potion in engine
    engine.queueAction({ type: 'POTION', potionType });
    return true;
  };

  // === togglePrayer: Queue a TOGGLE_PRAYER action with drain rate ===
  const togglePrayer = (prayerId) => {
    const prayer = prayerId ? PRAYER_BOOK.find(p => p.id === prayerId) : null;
    engine.queueAction({ type: 'TOGGLE_PRAYER', prayerId, drain: prayer?.drain || 0.1, buff: prayer?.buff || 1.0, block: prayer?.block, prayerType: prayer?.type || '' });
  };

  // === Return clean interface ===
  return {
    combatState,
    playerHp,
    engine,
    seedCombat,
    eatFood,
    drinkPotion,
    togglePrayer,
    combatLog,
    clearCombatLog,
    // For backwards compatibility
    prayers: engine.prayers,
    setPlayerHp: () => { /* no-op */ },
    playerPrayer: playerStats?.maxPrayer || 10,
    setPlayerPrayer: () => { /* no-op */ },
    prayerQueue: null,
    setPrayerQueue: () => { /* no-op */ },
    stopAction: () => engine.stop()
  };
}

