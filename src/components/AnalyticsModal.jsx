import React, { useState, useEffect } from 'react';
import { PRAYER_BOOK } from '../data/gameData';

export default function AnalyticsModal({ 
  activeAction, ACTIONS, skills, prayers = {}, combatStyle = 'attack', 
  sessionStats, getCurrentWeapon, resetSession
}) {
  
  // 1. States bovenaan
  const [isRealTime, setIsRealTime] = useState(false);
  const [renderTick, setRenderTick] = useState(0);

  // 2. De ticker die zorgt dat cijfers live veranderen
  useEffect(() => {
    let interval;
    if (isRealTime) {
      interval = setInterval(() => {
        setRenderTick(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRealTime]);

  // 3. De checks
  if (!activeAction || !ACTIONS[activeAction]) {
    return <p style={{color: 'white', padding: '20px'}}>No active task to calculate.</p>;
  }

  const data = ACTIONS[activeAction];
  const isCombat = data.skill === 'combat';
  const weapon = getCurrentWeapon() || { name: 'Unarmed', att: 0, str: 0, speedTicks: 5, type: 'melee' };
  const safeCombatStyle = combatStyle || 'attack';

  // --- 1. PRAYER MATH ---
  let activeBuff = 1.0;
  let activeBlock = { melee: 1.0, range: 1.0, mage: 1.0 };
  let pietyActive = false;

  Object.keys(prayers || {}).forEach(pid => {
    if (prayers[pid]) {
      const pData = PRAYER_BOOK.find(p => p.id === pid);
      if (pData) {
        if (pData.buff) { activeBuff = Math.max(activeBuff, pData.buff); pietyActive = true; }
        if (pData.block !== undefined) {
          if (pData.type === 'melee_def') activeBlock.melee = pData.block;
          if (pData.type === 'range_def') activeBlock.range = pData.block;
          if (pData.type === 'mage_def') activeBlock.mage = pData.block;
        }
      }
    }
  });

  // --- 2. MATH (OSRS-style) ---
  let accLevel = safeCombatStyle === 'ranged' ? skills.ranged?.level : safeCombatStyle === 'magic' ? skills.magic?.level : skills.attack?.level;
  let strLevel = safeCombatStyle === 'ranged' ? skills.ranged?.level : safeCombatStyle === 'magic' ? skills.magic?.level : skills.strength?.level;

  const effectiveAttLevel = (accLevel || 1) + 8;
  const equipAttBonus = Math.max(0, weapon.att || 0);
  const attackRoll = effectiveAttLevel * (equipAttBonus + 64);

  // Monster defence roll (OSRS style)
  const enemyDefBonuses = isCombat && data.enemy?.defBonus ? data.enemy.defBonus : { melee: 0, ranged: 0, magic: 0 };
  const monsterDefBonus = safeCombatStyle === 'ranged' ? (enemyDefBonuses.ranged || 0) : safeCombatStyle === 'magic' ? (enemyDefBonuses.magic || 0) : (enemyDefBonuses.melee || 0);
  const defenceRoll = (monsterDefBonus + 9) * 64;

  let pHitChance;
  if (attackRoll > defenceRoll) {
    pHitChance = (1 - (defenceRoll + 2) / (2 * (attackRoll + 1))) * 100;
  } else {
    pHitChance = (attackRoll / (2 * (defenceRoll + 1))) * 100;
  }
  pHitChance = Math.min(95, Math.max(5, pHitChance));

  // OSRS max hit
  const effectiveStrLevel = (strLevel || 1) + 8;
  const strBonus = safeCombatStyle === 'ranged' ? 0 : (weapon.str || 0);
  let pMaxHit = Math.max(1, Math.floor(0.5 + effectiveStrLevel * (strBonus + 64) / 640));
  pMaxHit = Math.floor(pMaxHit * activeBuff);

  const pDps = isCombat && weapon.speedTicks > 0 ? (pHitChance / 100) * (pMaxHit / 2) / (weapon.speedTicks * 0.6) : 0;

  const timePerAction = isCombat && data.enemy ? weapon.speedTicks * 0.6 : (data.baseTime || 1800) / 1000;
  const actionsPerHour = timePerAction > 0 ? (3600 / timePerAction) : 0;
  const simXpPerHour = isCombat ? (pDps * 3600 * 4) : (actionsPerHour * (data.xp || 0)); 

  // --- 3. REAL-TIME ---
  const secondsElapsed = sessionStats?.startTime ? (Date.now() - sessionStats.startTime) / 1000 : 0;
  const rtXpPerHour = secondsElapsed > 0 ? (sessionStats.xpGained / secondsElapsed) * 3600 : 0;
  const rtActionsPerHour = secondsElapsed > 0 ? (sessionStats.actionsCompleted / secondsElapsed) * 3600 : 0;
  const rtDps = secondsElapsed > 0 ? (sessionStats.xpGained / 4) / secondsElapsed : 0;

  // --- 4. ENEMY (OSRS-style) ---
  let eHitChance = 0, eMaxHit = 0, eDps = 0;
  if (isCombat && data.enemy) {
    const monsterType = data.enemy.type || 'melee';
    const offAtts = data.enemy.offAtt || { melee: 0, ranged: 0, magic: 0 };
    const monsterAttBonus = monsterType === 'ranged' ? (offAtts.ranged || 0) : monsterType === 'magic' ? (offAtts.magic || 0) : (offAtts.melee || 0);
    const eAttackRoll = (monsterAttBonus + 9) * 64;
    const playerDefLevel = (skills.defence?.level || 1) + 8;
    const eDefenceRoll = playerDefLevel * 64;
    if (eAttackRoll > eDefenceRoll) {
      eHitChance = (1 - (eDefenceRoll + 2) / (2 * (eAttackRoll + 1))) * 100;
    } else {
      eHitChance = (eAttackRoll / (2 * (eDefenceRoll + 1))) * 100;
    }
    eHitChance = Math.min(99, Math.max(1, eHitChance));
    eMaxHit = Math.max(1, Math.floor(0.5 + (data.enemy.str + 8) * 64 / 640));
    let block = monsterType === 'melee' ? activeBlock.melee : monsterType === 'range' || monsterType === 'ranged' ? activeBlock.range : activeBlock.mage;
    eDps = (eHitChance / 100) * (eMaxHit / 2) / ((data.enemy.speedTicks || 4) * 0.6) * block;
  }

  return (
    <div className="analytics-container">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #2a3b4c', paddingBottom: '10px' }}>
        <button style={{ background: !isRealTime ? '#208b76' : '#152029', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setIsRealTime(false)}>Simulated Stats</button>
        <button style={{ background: isRealTime ? '#208b76' : '#152029', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setIsRealTime(true)}>Real-time Stats</button>
      </div>

      <div className="dps-modal-content">
        {isCombat ? (
          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="dps-column" style={{ flex: 1, backgroundColor: '#111920', padding: '15px', borderRadius: '6px', border: '1px solid #2a3b4c' }}>
              <h3 style={{ color: '#4affd4', marginBottom: '10px' }}>Your Stats</h3>
              <p className="dps-stat">Hit chance: <strong style={{ color: 'white' }}>{pHitChance.toFixed(2)}%</strong></p>
              <p className="dps-stat">Max hit: <strong style={{ color: 'white' }}>{pMaxHit}</strong></p>
              <p className="dps-stat">DPS: <strong style={{ color: 'white' }}>{!isRealTime ? pDps.toFixed(2) : rtDps.toFixed(2)}</strong></p>
              <br/>
              <p className="dps-stat">XP p/h: <strong style={{ color: 'white' }}>{!isRealTime ? Math.floor(simXpPerHour).toLocaleString() : Math.floor(rtXpPerHour).toLocaleString()}</strong></p>
            </div>
            <div className="dps-column" style={{ flex: 1, backgroundColor: '#111920', padding: '15px', borderRadius: '6px', border: '1px solid #2a3b4c' }}>
              <h3 style={{ color: '#ff4d4d', marginBottom: '10px' }}>Enemy Stats</h3>
              <p className="dps-stat">Max hit: <strong style={{ color: 'white' }}>{eMaxHit}</strong></p>
              <p className="dps-stat">DPS: <strong style={{ color: 'white' }}>{eDps.toFixed(2)}</strong></p>
            </div>
          </div>
        ) : (
          <div className="skilling-stats">
            <div className="dps-column" style={{ width: '100%', backgroundColor: '#111920', padding: '15px', borderRadius: '6px', border: '1px solid #2a3b4c' }}>
              <h3 style={{ color: '#4affd4', marginBottom: '10px' }}>Skilling Analysis</h3>
              <p className="dps-stat">Completions/h: <strong style={{ color: 'white' }}>{Math.floor(!isRealTime ? actionsPerHour : rtActionsPerHour).toLocaleString()}</strong></p>
              <p className="dps-stat">Experience/h: <strong style={{ color: 'white' }}>{Math.floor(!isRealTime ? simXpPerHour : rtXpPerHour).toLocaleString()}</strong></p>
            </div>
          </div>
        )}
      </div>
      
      {resetSession && (
        <button className="btn-stop" style={{ width: '100%', marginTop: '20px' }} onClick={resetSession}>
          Reset Session Stats
        </button>
      )}
    </div>
  );
}