import { useEffect, useRef, useState } from 'react';

// OSRS-style damage calculation.
// Attack Roll vs Defence Roll → Hit Chance → Max Hit → Damage
// Returns { damage, baseDamage, prayerBonus, prayerBlocked }
function computeDamage(attacker, defender, prayersRef, slayerBonus = 1.0, isPlayerAttack = false, attackerType = 'melee') {
  const activePrayers = prayersRef.current || {};
  const MISS = { damage: 0, baseDamage: 0, prayerBonus: 0, prayerBlocked: 0 };

  // --- Prayer effects ---
  let offensiveBuff = 1.0;
  let defensiveMult = 1.0;

  if (isPlayerAttack) {
    const offEntry = Object.entries(activePrayers).find(([pid]) => pid.startsWith('dmg_'));
    if (offEntry) {
      const val = offEntry[1];
      offensiveBuff = (typeof val === 'object' && val.buff) ? val.buff : 1.15;
    }
  } else {
    const typeMap = { melee: 'melee_def', ranged: 'range_def', range: 'range_def', magic: 'mage_def' };
    const defType = typeMap[attackerType] || '';
    if (defType) {
      const defEntry = Object.entries(activePrayers).find(([pid, val]) => {
        if (!pid.startsWith('anti_')) return false;
        const pType = typeof val === 'object' ? val.type : '';
        return pType === defType;
      });
      if (defEntry) {
        const val = defEntry[1];
        defensiveMult = (typeof val === 'object' && val.block != null) ? val.block : 0.6;
      }
    }
  }

  // --- OSRS Accuracy: Attack Roll vs Defence Roll ---
  let attackRoll, defenceRoll;

  if (isPlayerAttack) {
    // Player attacks monster
    const style = attacker.combatStyle || 'attack';
    let accLevel, equipAttBonus;

    if (style === 'ranged') {
      accLevel = attacker.rangedLevel || attacker.att || 1;
      equipAttBonus = (attacker.weaponAtt || 0) + (attacker.armorRangedAcc || 0);
    } else if (style === 'magic') {
      accLevel = attacker.magicLevel || attacker.att || 1;
      equipAttBonus = (attacker.weaponAtt || 0) + (attacker.armorMagicAcc || 0);
    } else {
      // melee (attack/strength/defence styles)
      accLevel = attacker.attackLevel || attacker.att || 1;
      equipAttBonus = (attacker.weaponAtt || 0) + (attacker.armorAccuracy || 0);
    }

    const effectiveAttLevel = accLevel + 8;
    attackRoll = effectiveAttLevel * (Math.max(0, equipAttBonus) + 64);

    // Monster defence roll — defBonus acts as combined level+bonus
    const defBonuses = defender.defBonus || { melee: defender.def || 0, ranged: defender.def || 0, magic: defender.def || 0 };
    let monsterDefBonus;
    if (style === 'ranged') monsterDefBonus = defBonuses.ranged || 0;
    else if (style === 'magic') monsterDefBonus = defBonuses.magic || 0;
    else monsterDefBonus = defBonuses.melee || 0;

    defenceRoll = (monsterDefBonus + 9) * 64;

  } else {
    // Monster attacks player
    const monsterType = attacker.type || 'melee';
    const offAtts = attacker.offAtt || { melee: attacker.att || 1, ranged: 0, magic: 0 };
    let monsterAttBonus;
    if (monsterType === 'ranged' || monsterType === 'range') monsterAttBonus = offAtts.ranged || 0;
    else if (monsterType === 'magic') monsterAttBonus = offAtts.magic || 0;
    else monsterAttBonus = offAtts.melee || 0;

    attackRoll = (monsterAttBonus + 9) * 64;

    // Player defence roll — uses defence level + armor bonuses
    const playerDefLevel = defender.defenceLevel || defender.def || 1;
    const effectiveDefLevel = playerDefLevel + 8;
    let equipDefBonus;
    if (monsterType === 'ranged' || monsterType === 'range') equipDefBonus = defender.armorRangedDef || 0;
    else if (monsterType === 'magic') equipDefBonus = defender.armorMagicDef || 0;
    else equipDefBonus = defender.armorDefence || 0;

    defenceRoll = effectiveDefLevel * (Math.max(0, equipDefBonus) + 64);
  }

  // --- OSRS Hit Chance ---
  let hitChance;
  if (attackRoll > defenceRoll) {
    hitChance = 1 - (defenceRoll + 2) / (2 * (attackRoll + 1));
  } else {
    hitChance = attackRoll / (2 * (defenceRoll + 1));
  }
  hitChance = Math.min(0.95, Math.max(0.05, hitChance));

  if (Math.random() >= hitChance) return MISS;

  // Agility dodge check (player defending only)
  if (!isPlayerAttack && defender.dodgeChance && defender.dodgeChance > 0) {
    if (Math.random() < defender.dodgeChance) return MISS;
  }

  // --- OSRS Max Hit ---
  let maxHit;
  if (isPlayerAttack) {
    const style = attacker.combatStyle || 'attack';
    let strLevel, strBonus;

    if (style === 'ranged') {
      strLevel = attacker.rangedLevel || 1;
      strBonus = attacker.ammoRangedStr || 0;
    } else if (style === 'magic') {
      strLevel = attacker.magicLevel || 1;
      strBonus = attacker.weaponStr || 0;
    } else {
      // melee
      strLevel = attacker.strengthLevel || attacker.str || 1;
      strBonus = attacker.weaponStr || 0;
    }

    const effectiveStrLevel = strLevel + 8;
    maxHit = Math.max(1, Math.floor(0.5 + effectiveStrLevel * (strBonus + 64) / 640));
  } else {
    // Monster max hit — derived from str stat
    const monsterStr = attacker.str || 1;
    maxHit = Math.max(1, Math.floor(0.5 + (monsterStr + 8) * 64 / 640));
  }

  // --- Roll damage + apply prayer & slayer ---
  const rawHit = Math.floor(Math.random() * (maxHit + 1));
  const withSlayer = Math.floor(rawHit * slayerBonus);
  const withPrayer = isPlayerAttack
    ? Math.floor(withSlayer * offensiveBuff)
    : Math.max(0, Math.floor(withSlayer * defensiveMult));

  const prayerBonus = isPlayerAttack && offensiveBuff > 1.0 ? Math.max(0, withPrayer - withSlayer) : 0;
  const prayerBlocked = !isPlayerAttack && defensiveMult < 1.0 ? Math.max(0, withSlayer - withPrayer) : 0;

  return { damage: withPrayer, baseDamage: withSlayer, prayerBonus, prayerBlocked };
}

export default function useCombatEngine() {
  // === STATE: Single snapshot object, one re-render per tick ===
  const [snapshot, setSnapshot] = useState({
    allies: [],
    enemies: [],
    status: 'idle', // 'idle' | 'running'
    tickNumber: 0,
    respawnTicksLeft: 0
  });

  // === REFS: Tick loop reads ONLY from these ===
  const alliesRef = useRef([]);
  const enemiesRef = useRef([]);
  const targetRef = useRef(null);
  const prayersRef = useRef({});
  const actionQueueRef = useRef([]);
  const callbacksRef = useRef({});
  const tickNumberRef = useRef(0);
  const intervalRef = useRef(null);
  const statusRef = useRef('idle');
  const slayerBonusRef = useRef(1.0);
  const respawnTicksLeftRef = useRef(0);       // Countdown ticks until enemy respawns
  const respawnTemplateRef = useRef(null);      // Snapshot of enemy to respawn
  const RESPAWN_TICKS = 4;                       // 4 ticks = 2.4 seconds
  const prayerPointsRef = useRef(0);            // Current prayer points
  const maxPrayerPointsRef = useRef(0);         // Max prayer points
  const reSeededRef = useRef(false);            // Guard: true when seed() called mid-tick

  // === runTick: The critical 600ms function ===
  const runTick = () => {
    try {
      // Step 1: Clone local copies
      const localAllies = (alliesRef.current || []).map(a => ({ ...a }));
      const localEnemies = (enemiesRef.current || []).map(e => ({ ...e }));

      // Step 2: Process action queue
      const toggledThisTick = new Set(); // Track toggled prayers for flicking
      const actions = actionQueueRef.current.splice(0); // Drain queue
      actions.forEach(action => {
        if (action.type === 'EAT') {
          const { heal = 0, targetId = 'player' } = action;
          const target = localAllies.find(a => a.id === targetId);
          if (target && target.hp > 0) {
            target.hp = Math.min(target.maxHp, target.hp + heal);
          }
        }
        if (action.type === 'TOGGLE_PRAYER') {
          const { prayerId } = action;
          if (!prayerId) {
            prayersRef.current = {};
          } else {
            toggledThisTick.add(prayerId);
            const isCurrentlyActive = !!prayersRef.current[prayerId];
            if (isCurrentlyActive) {
              // Deactivating — just remove it
              const next = { ...prayersRef.current };
              delete next[prayerId];
              prayersRef.current = next;
            } else {
              // Activating — enforce mutual exclusion
              const isOffensive = prayerId.startsWith('dmg_');
              const isDefensive = prayerId.startsWith('anti_');
              if (prayerPointsRef.current <= 0) return; // Can't activate with 0 prayer
              const next = { ...prayersRef.current };

              // Turn off other prayers in the same category
              Object.keys(next).forEach(pid => {
                if (pid.startsWith('__')) return; // Skip internal keys like __lastPotionRestore
                if (isOffensive && pid.startsWith('dmg_')) delete next[pid];
                if (isDefensive && pid.startsWith('anti_')) delete next[pid];
              });

              next[prayerId] = { drain: action.drain || 0.1, buff: action.buff || 1.0, block: action.block, type: action.prayerType || '' };
              prayersRef.current = next;
            }
          }
        }
        if (action.type === 'POTION') {
          const { potionType } = action;
          if (potionType === 'prayer_potion') {
            const restoreAmount = 25;
            prayerPointsRef.current = Math.min(maxPrayerPointsRef.current, prayerPointsRef.current + restoreAmount);
            callbacksRef.current.onPotionDrink?.(restoreAmount);
          }
        }
      });

      // Step 2.5: Drain prayer for active prayers (drains during respawn too)
      // Prayers toggled this tick are skipped (OSRS-style prayer flicking)
      const activePrayers = prayersRef.current || {};
      let totalDrain = 0;
      Object.entries(activePrayers).forEach(([pid, val]) => {
        if (toggledThisTick.has(pid)) return; // Flicked this tick — no drain
        const drain = typeof val === 'object' ? (val.drain || 0) : (typeof val === 'number' ? val : 0);
        if (drain > 0) totalDrain += drain;
      });
      if (totalDrain > 0 && prayerPointsRef.current > 0) {
        prayerPointsRef.current = Math.max(0, prayerPointsRef.current - totalDrain);
        callbacksRef.current.onPrayerDrain?.(totalDrain);
        if (prayerPointsRef.current <= 0) {
          prayersRef.current = {};
        }
      }

      // Step 3: Handle respawn countdown
      if (respawnTicksLeftRef.current > 0) {
        respawnTicksLeftRef.current -= 1;

        if (respawnTicksLeftRef.current <= 0 && respawnTemplateRef.current) {
          // Respawn: restore enemy from template
          const tpl = respawnTemplateRef.current;
          localEnemies.forEach((e, i) => {
            if (tpl[i]) {
              e.hp = tpl[i].maxHp;
              e.maxHp = tpl[i].maxHp;
              e.currentTickCount = 0;
            }
          });
          respawnTemplateRef.current = null;
          // Reset player attack tick so attack starts fresh
          localAllies.forEach(a => { if (a.hp > 0) a.currentTickCount = 0; });
        }

        // During respawn: still commit state so UI updates countdown
        alliesRef.current = localAllies;
        enemiesRef.current = localEnemies;
        tickNumberRef.current += 1;

        setSnapshot({
          allies: localAllies,
          enemies: localEnemies,
          status: statusRef.current,
          tickNumber: tickNumberRef.current,
          respawnTicksLeft: respawnTicksLeftRef.current
        });
        return; // Skip combat during respawn
      }

      // Step 4: Increment tick counters for alive entities
      localAllies.forEach(a => {
        if (a.hp > 0) a.currentTickCount = (a.currentTickCount || 0) + 1;
      });
      localEnemies.forEach(e => {
        if (e.hp > 0) e.currentTickCount = (e.currentTickCount || 0) + 1;
      });

      // Step 5: Process ally attacks
      localAllies.forEach(ally => {
        if (ally.hp <= 0) return;
        const ticks = ally.currentTickCount || 0;
        const attackSpeed = ally.attackSpeedTicks || 4;
        if (attackSpeed <= ticks) {
          // Find target: match targetRef first, else first alive enemy
          let target = localEnemies.find(e => e.id === targetRef.current && e.hp > 0);
          if (!target) target = localEnemies.find(e => e.hp > 0);
          if (!target) return;

          const dmgResult = computeDamage(ally, target, prayersRef, slayerBonusRef.current, true);
          const dmg = dmgResult.damage;
          const actualDamage = Math.min(dmg, target.hp); // Don't overkill for XP
          console.log('[ENGINE] Player attacks', target.id, target.name, 'for', dmg, 'dmg (actual: ' + actualDamage + '). Tick:', tickNumberRef.current);
          target.hp = Math.max(0, target.hp - dmg);
          ally.currentTickCount = 0;

          // Apply pending attack speed change (from weapon swap) after hit
          if (ally.pendingAttackSpeed != null) {
            ally.attackSpeedTicks = ally.pendingAttackSpeed;
            delete ally.pendingAttackSpeed;
          }

          // Cap baseDamage + prayerBonus so their sum doesn't exceed actualDamage
          let cappedBase = Math.min(dmgResult.baseDamage, actualDamage);
          let cappedPrayerBonus = Math.max(0, actualDamage - cappedBase);

          // Fire callback with actual damage dealt (for XP) + prayer info
          callbacksRef.current.onHit?.(ally.id, target.id, actualDamage, { baseDamage: cappedBase, prayerBonus: cappedPrayerBonus, prayerBlocked: 0 });
          if (target.hp <= 0) {
            callbacksRef.current.onKill?.(target);
          }
        }
      });

      // Step 6: Process enemy attacks
      localEnemies.forEach(enemy => {
        if (enemy.hp <= 0) return;
        const ticks = enemy.currentTickCount || 0;
        const attackSpeed = enemy.attackSpeedTicks || 4;
        if (attackSpeed <= ticks) {
          // Find target: first alive ally
          const target = localAllies.find(a => a.hp > 0);
          if (!target) return;

          const dmgResult = computeDamage(enemy, target, prayersRef, slayerBonusRef.current, false, enemy.type || 'melee');
          const dmg = dmgResult.damage;
          target.hp = Math.max(0, target.hp - dmg);
          enemy.currentTickCount = 0;

          // Prayer-eater special: drain 5 prayer on successful hit
          if (enemy.type === 'prayer-eater' && dmg > 0) {
            prayerPointsRef.current = Math.max(0, prayerPointsRef.current - 5);
            callbacksRef.current.onPrayerDrain?.(5);
            if (prayerPointsRef.current <= 0) {
              prayersRef.current = {};
            }
          }

          // Fire callback with prayer info
          callbacksRef.current.onHit?.(enemy.id, target.id, dmg, { baseDamage: dmgResult.baseDamage, prayerBonus: 0, prayerBlocked: dmgResult.prayerBlocked });
          if (target.hp <= 0) {
            callbacksRef.current.onKill?.(target);
          }
        }
      });

      // Step 7: Check for all-dead states
      const allAlliesDead = !localAllies.some(a => a.hp > 0);
      const allEnemiesDead = !localEnemies.some(e => e.hp > 0);

      // Step 8: If all enemies dead, start respawn countdown
      if (allEnemiesDead && localEnemies.length > 0) {
        respawnTemplateRef.current = localEnemies.map(e => ({ ...e }));
        respawnTicksLeftRef.current = RESPAWN_TICKS;
        callbacksRef.current.onAllEnemiesDead?.();
      }

      // Step 9: Commit to refs and state — but SKIP if seed() was called during a callback
      if (reSeededRef.current) {
        reSeededRef.current = false;
      } else {
        alliesRef.current = localAllies;
        enemiesRef.current = localEnemies;
        tickNumberRef.current += 1;

        setSnapshot({
          allies: localAllies,
          enemies: localEnemies,
          status: statusRef.current,
          tickNumber: tickNumberRef.current,
          respawnTicksLeft: respawnTicksLeftRef.current
        });

        // Step 10: Fire player-dead callback
        if (allAlliesDead && localAllies.length > 0) {
          callbacksRef.current.onPlayerDead?.();
        }

        // Step 11: Fire onTick callback (for auto-eat etc.)
        if (!allAlliesDead) {
          callbacksRef.current.onTick?.(localAllies, localEnemies, tickNumberRef.current);
        }
      }
    } catch (err) {
      console.error('[useCombatEngine] runTick error:', err);
    }
  };

  // === Seed: Initialize the engine with entities and callbacks ===
  const seed = (incomingAllies = [], incomingEnemies = [], callbacks = {}) => {
    try {
      // Deep clone and normalize
      const normalizeEntity = (e) => ({
        ...e,
        id: e.id || Math.random().toString(36),
        hp: e.hp || e.currentHp || e.maxHp || 10,
        maxHp: e.maxHp || e.hp || 10,
        att: e.att || 1,
        str: e.str || 1,
        def: e.def || 0,
        weaponAtt: e.weaponAtt || 0,
        weaponStr: e.weaponStr || 0,
        attackSpeedTicks: e.attackSpeedTicks || e.speedTicks || e.attackSpeed || 4,
        currentTickCount: 0
      });

      const clonedAllies = (incomingAllies || []).map(normalizeEntity);
      const clonedEnemies = (incomingEnemies || []).map(normalizeEntity);

      reSeededRef.current = true;

      alliesRef.current = clonedAllies;
      enemiesRef.current = clonedEnemies;
      callbacksRef.current = callbacks;
      tickNumberRef.current = 0;
      targetRef.current = null;
      actionQueueRef.current = [];
      prayersRef.current = {};
      respawnTicksLeftRef.current = 0;
      respawnTemplateRef.current = null;

      // Commit initial snapshot
      setSnapshot({
        allies: clonedAllies,
        enemies: clonedEnemies,
        status: statusRef.current,
        tickNumber: 0,
        respawnTicksLeft: 0
      });

      // Auto-start if there are enemies
      if (clonedEnemies.length > 0 && statusRef.current !== 'running') {
        start();
      }
    } catch (err) {
      console.error('[useCombatEngine] seed error:', err);
    }
  };

  // === Start: Begin the 600ms tick loop ===
  const start = () => {
    if (intervalRef.current) return; // Already running
    statusRef.current = 'running';
    intervalRef.current = setInterval(runTick, 600);
    setSnapshot(prev => ({ ...prev, status: 'running' }));
  };

  // === Stop: End the tick loop ===
  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    statusRef.current = 'idle';
    setSnapshot(prev => ({ ...prev, status: 'idle' }));
  };

  // === Queue an action for the next tick ===
  const queueAction = (action) => {
    if (action) {
      actionQueueRef.current.push(action);
    }
  };

  // === Set the current target ===
  const setTarget = (enemyId) => {
    targetRef.current = enemyId;
  };

  // === Update an ally's stats (for weapon swap during combat) ===
  const updateAlly = (allyId, newStats) => {
    const allies = alliesRef.current || [];
    const idx = allies.findIndex(a => a.id === allyId);
    if (idx < 0) return;
    const { attackSpeedTicks, ...otherStats } = newStats;
    const updated = { ...allies[idx], ...otherStats };
    // Queue attack speed change — only applies after the next hit
    if (attackSpeedTicks != null && attackSpeedTicks !== allies[idx].attackSpeedTicks) {
      updated.pendingAttackSpeed = attackSpeedTicks;
    }
    allies[idx] = updated;
    alliesRef.current = [...allies];
    setSnapshot(prev => ({
      ...prev,
      allies: alliesRef.current.map(a => ({ ...a }))
    }));
  };

  // === Set prayer points (called when combat starts) ===
  const initPrayer = (current, max) => {
    prayerPointsRef.current = current;
    maxPrayerPointsRef.current = max;
  };

  // === Cleanup on unmount ===
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // === Return snapshot + methods ===
  return {
    allies: snapshot.allies,
    enemies: snapshot.enemies,
    status: snapshot.status,
    tickNumber: snapshot.tickNumber,
    respawnTicksLeft: snapshot.respawnTicksLeft || 0,
    target: targetRef.current,
    prayers: prayersRef.current,
    seed,
    start,
    stop,
    queueAction,
    setTarget,
    updateAlly,
    getAllies: () => alliesRef.current,
    getEnemies: () => enemiesRef.current,
    setSlayerBonus: (bonus) => { slayerBonusRef.current = bonus; },
    initPrayer
  };
}
