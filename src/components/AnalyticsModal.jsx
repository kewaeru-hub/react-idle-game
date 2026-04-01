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

  // --- 2. MATH ---
  let accLevel = safeCombatStyle === 'ranged' ? skills.ranged?.level : safeCombatStyle === 'magic' ? skills.magic?.level : skills.attack?.level;
  let strLevel = safeCombatStyle === 'ranged' ? skills.ranged?.level : safeCombatStyle === 'magic' ? skills.magic?.level : skills.strength?.level;

  let attBonus = ((accLevel || 1) + (weapon.att || 0)) * activeBuff;
  let pMaxHit = Math.floor(((strLevel || 1) + (weapon.str || 0)) / 3) + 1;
  pMaxHit = Math.floor(pMaxHit * activeBuff); 

  const enemyDef = isCombat && data.enemy ? data.enemy.def : 1;
  const pHitChance = Math.min(95, Math.max(10, (attBonus / (attBonus + enemyDef)) * 100));
  const pDps = isCombat && weapon.speedTicks > 0 ? (pHitChance / 100) * (pMaxHit / 2) / (weapon.speedTicks * 0.6) : 0;

  const timePerAction = isCombat && data.enemy ? weapon.speedTicks * 0.6 : (data.baseTime || 1800) / 1000;
  const actionsPerHour = timePerAction > 0 ? (3600 / timePerAction) : 0;
  const simXpPerHour = isCombat ? (pDps * 3600 * 4) : (actionsPerHour * (data.xp || 0)); 

  // --- 3. REAL-TIME ---
  const secondsElapsed = sessionStats?.startTime ? (Date.now() - sessionStats.startTime) / 1000 : 0;
  const rtXpPerHour = secondsElapsed > 0 ? (sessionStats.xpGained / secondsElapsed) * 3600 : 0;
  const rtActionsPerHour = secondsElapsed > 0 ? (sessionStats.actionsCompleted / secondsElapsed) * 3600 : 0;
  const rtDps = secondsElapsed > 0 ? (sessionStats.xpGained / 4) / secondsElapsed : 0;

  // --- 4. ENEMY ---
  let eHitChance = 0, eMaxHit = 0, eDps = 0;
  if (isCombat && data.enemy) {
    eHitChance = Math.min(99, Math.max(1, (data.enemy.att / (data.enemy.att + (skills.defence?.level || 1))) * 100));
    eMaxHit = data.enemy.str;
    let block = data.enemy.type === 'melee' ? activeBlock.melee : data.enemy.type === 'range' ? activeBlock.range : activeBlock.mage;
    eDps = (eHitChance / 100) * (eMaxHit / 2) / (data.enemy.speedTicks * 0.6) * block;
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