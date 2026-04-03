import React, { useState, useEffect, useRef } from 'react';
import { PRAYER_BOOK, ITEM_IMAGES } from '../data/gameData';
import EquipmentGrid from './EquipmentGrid';


export default function CombatView({ 
  activeAction, ACTIONS, playerHp, maxHp, playerPrayer, maxPrayer, 
  combatState, prayers = {}, prayerQueue, togglePrayer, eatFood, drinkPotion, 
  getItemCount, stopAction, getCurrentWeapon, xpDrops = [], quickPrayers = [],
  combatStyle, setCombatStyle, availableCombatStyles, equipment, WEAPONS, ARMOR, AMMO,
  slayerTask, combatLog = [], setScreen, combatLevel = 0, username = 'Player'
}) {
  const data = ACTIONS[activeAction];
  const weapon = getCurrentWeapon() || { speedTicks: 5 };

  const getIcon = (skill) => {
    if (skill === 'dodge') return '💨';
    if (skill === 'splash') return '🛡️';
    if (skill === 'miss') return '⚔️';
    if (skill === 'hitpoints') return '❤️';
    if (skill === 'magic') return '🔮';
    if (skill === 'ranged') return '🏹';
    return '⚔️';
  };

  const getItemData = (itemKey) => {
    if (!itemKey) return null;
    return WEAPONS[itemKey] || ARMOR[itemKey] || AMMO[itemKey];
  };

  const isQueued = (t) => prayerQueue ? prayerQueue[t] !== prayers[t] : false;

  // --- EQUIPMENT TOGGLE ---
  const [showEquipment, setShowEquipment] = useState(false);

  // --- COMBAT LOG ---
  const logContainerRef = useRef(null);
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [combatLog]);

  // --- DAMAGE DROPS (floating enemy damage numbers) ---
  const [dmgDrops, setDmgDrops] = useState([]);
  const prevLogLenRef = useRef(combatLog.length);
  useEffect(() => {
    if (combatLog.length > prevLogLenRef.current) {
      const newEntries = combatLog.slice(prevLogLenRef.current);
      const enemyHits = newEntries.filter(e => e.type === 'enemy_hit' && e.damage > 0);
      enemyHits.forEach(entry => {
        const id = entry.id || Date.now() + Math.random();
        setDmgDrops(prev => [...prev, { id, damage: entry.damage }]);
        setTimeout(() => setDmgDrops(prev => prev.filter(d => d.id !== id)), 1500);
      });
    }
    prevLogLenRef.current = combatLog.length;
  }, [combatLog]);

  const formatLogEntry = (entry) => {
    switch (entry.type) {
      case 'player_hit': {
        let line = `⚔️ You hit ${entry.target} for ${entry.damage}`;
        if (entry.prayerBonus > 0) line += ` (${entry.baseDamage}+${entry.prayerBonus} 🙏)`;
        line += ` (+${entry.xpAmount} ${entry.xpSkill} xp)`;
        return line;
      }
      case 'player_miss': return `💨 You missed ${entry.target}`;
      case 'enemy_hit': {
        let line = `🩸 ${entry.attacker} hits you for ${entry.damage}`;
        if (entry.prayerBlocked > 0) line += ` (${entry.baseDamage}-${entry.prayerBlocked} 🙏)`;
        return line;
      }
      case 'enemy_miss': return `🛡️ ${entry.attacker} missed you`;
      case 'kill': return `💀 ${entry.target} killed!`;
      default: return '';
    }
  };
  const getLogColor = (type) => {
    if (type === 'player_hit') return '#4affd4';
    if (type === 'player_miss') return '#7b95a6';
    if (type === 'enemy_hit') return '#e74c3c';
    if (type === 'enemy_miss') return '#7b95a6';
    if (type === 'kill') return '#f1c40f';
    return '#c5d3df';
  };

  // --- UI TIMER (25 FPS) ---
  const lastTickStamp = useRef(Date.now());
  const prevCombatState = useRef(combatState);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 40);
    return () => clearInterval(interval);
  }, []);

  if (combatState.playerTick !== prevCombatState.current.playerTick || 
      combatState.enemyTick !== prevCombatState.current.enemyTick || 
      combatState.isRespawning !== prevCombatState.current.isRespawning ||
      combatState.respawnTicksLeft !== prevCombatState.current.respawnTicksLeft) {
    lastTickStamp.current = Date.now();
    prevCombatState.current = combatState;
  }

  const elapsed = (now - lastTickStamp.current) / 1000;
  const isRespawning = combatState.isRespawning;

  // --- WISKUNDE VOOR BALKJES ---
  const pTotal = weapon.speedTicks * 0.6;
  let pPct = isRespawning ? 0 : Math.min(100, Math.max(0, ((combatState.playerTick * 0.6 + elapsed) / pTotal) * 100));

  const eTotal = (data?.enemy?.speedTicks || 5) * 0.6;
  let ePct = isRespawning ? 0 : Math.min(100, Math.max(0, ((combatState.enemyTick * 0.6 + elapsed) / eTotal) * 100));

  const RESPAWN_TICKS = 4;
  let rPct = 0;
  if (isRespawning) {
    const ticksElapsed = RESPAWN_TICKS - (combatState.respawnTicksLeft || 0);
    rPct = Math.min(100, Math.max(0, ((ticksElapsed * 0.6 + elapsed) / (RESPAWN_TICKS * 0.6)) * 100));
  }

  return (
    <div className="combat-layout-wrapper" style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', marginTop: '10px' }}>  
      
      {/* --- SPELER KANT --- */}
      <div className="card combat-player-card" style={{ flex: 1, maxWidth: '350px', backgroundColor: '#202a33', position: 'relative' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>👤 {username} <span style={{ fontSize: '14px', color: '#f1c40f', fontWeight: 'normal' }}>(Lv. {combatLevel})</span></h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn-stop" onClick={() => setScreen && setScreen('profile')} title="Back to Profile">←</button>
            <button className="btn-stop" onClick={stopAction}>✕</button>
          </div>
        </div>

        {/* COMBAT STYLE SELECTOR */}
        <div className="combat-style-selector" style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label className="combat-label" style={{ fontSize: '14px', color: '#c5d3df', marginRight: '10px' }}>Combat Style:</label>
            <select 
              value={combatStyle} 
              onChange={(e) => setCombatStyle(e.target.value)}
              style={{
                backgroundColor: '#111920',
                color: '#c5d3df',
                border: '1px solid #2a3b4c',
                borderRadius: '4px',
                padding: '5px 10px',
                fontSize: '14px'
              }}
            >
              {availableCombatStyles.map(style => (
                <option key={style} value={style}>
                  {style === 'attack' ? 'Attack' : 
                   style === 'strength' ? 'Strength' : 
                   style === 'defence' ? 'Defence' : 
                   style === 'ranged' ? 'Ranged' : 
                   style === 'magic' ? 'Magic' : style}
                </option>
              ))}
            </select>
          </div>
          {slayerTask && slayerTask.monsterKey === activeAction && (
            <span style={{
              fontSize: '12px',
              color: '#4affd4',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              💀 {slayerTask.killsCompleted}/{slayerTask.killsNeeded}
            </span>
          )}
        </div>

        {/* EQUIPMENT TOGGLE */}
        <button 
          onClick={() => setShowEquipment(prev => !prev)}
          style={{
            width: '100%',
            padding: '6px',
            marginBottom: '10px',
            backgroundColor: '#111920',
            color: '#c5d3df',
            border: '1px solid #2a3b4c',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          {showEquipment ? '▼ Equipment' : '▶ Equipment'}
        </button>
        {showEquipment && (
          <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#111920', borderRadius: '6px', border: '1px solid #2a3b4c' }}>
            <div style={{ marginBottom: '10px' }}>
              <EquipmentGrid
                equipment={equipment}
                equipmentAmounts={{}}
                ITEM_IMAGES={ITEM_IMAGES}
                getItemData={getItemData}
                onSlotClick={null}
                gridClassName="combat-equip-grid"
              />
            </div>
          </div>
        )}
        
        {/* HP BALK */}
        <div className="combat-bar" style={{ position: 'relative', height: '24px', backgroundColor: '#111920', borderRadius: '4px', overflow: 'hidden', border: '1px solid #2a3b4c' }}>
          <div style={{ width: `${(playerHp / maxHp) * 100}%`, height: '100%', backgroundColor: '#e74c3c', transition: 'width 0.3s ease-in-out' }}></div>
          <span className="combat-bar-text" style={{ position: 'absolute', top: 0, left: 0, width: '100%', textAlign: 'center', fontSize: '13px', lineHeight: '24px', color: 'white', textShadow: '1px 1px 2px black', fontWeight: 'bold' }}>HP: {playerHp} / {maxHp}</span>
        </div>

        {/* PRAYER BALK */}
        <div className="combat-bar" style={{ position: 'relative', height: '24px', backgroundColor: '#111920', borderRadius: '4px', overflow: 'hidden', border: '1px solid #2a3b4c', marginTop: '8px' }}>
          <div style={{ width: `${(playerPrayer / maxPrayer) * 100}%`, height: '100%', backgroundColor: '#64b5f6', transition: 'width 0.3s ease-in-out' }}></div>
          <span className="combat-bar-text" style={{ position: 'absolute', top: 0, left: 0, width: '100%', textAlign: 'center', fontSize: '13px', lineHeight: '24px', color: 'white', textShadow: '1px 1px 2px black', fontWeight: 'bold' }}>Prayer: {Math.floor(playerPrayer)} / {maxPrayer}</span>
        </div>

        {/* ATTACK SPEED BALK (Zonder tekst) */}
        <div className="combat-bar" style={{ position: 'relative', height: '24px', backgroundColor: '#111920', borderRadius: '4px', overflow: 'hidden', border: '1px solid #2a3b4c', marginTop: '8px', opacity: isRespawning ? 0.5 : 1 }}>
          <div style={{ width: `${pPct}%`, height: '100%', backgroundColor: '#f39c12' }}></div>
        </div>
        
        {/* QUICK PRAYERS BOX */}
        <div style={{ marginTop: '20px', backgroundColor: '#111920', border: '1px solid #2a3b4c', borderRadius: '6px', padding: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {quickPrayers.map((pid, idx) => {
            if (!pid) return (
              <div 
                key={idx} 
                style={{
                  width: '52px',
                  height: '52px',
                  backgroundColor: '#0b1014',
                  border: '1px dashed #2a3b4c',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.3,
                  cursor: 'not-allowed',
                  color: '#556b7a',
                  fontSize: '24px'
                }}
                title="Empty slot"
              >
                +
              </div>
            );
            const pData = PRAYER_BOOK.find(p => p.id === pid);
            if (!pData) return null;

            return (
              <button 
                key={idx}
                className={`prayer-btn-icon ${prayers[pid] ? 'active' : ''}`}
                onClick={() => togglePrayer(pid)}
                style={{
                  opacity: isQueued(pid) ? 0.7 : 1,
                  filter: isQueued(pid) ? 'brightness(0.8)' : 'none',
                  transition: 'all 0.1s'
                }}
                title={`${pData.name}\n${pData.desc}\nDrain: ${(pData.drain / 0.6).toFixed(1)}/sec`}
              >
                {pData.icon}
              </button>
            )
          })}
        </div>

        {/* FOOD & POTIONS */}
        <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
          <button className="food-btn" onClick={() => eatFood('cooked_shrimp', 3)} disabled={getItemCount('cooked_shrimp') < 1} style={{flex: 1}}>🦐 Shrimp ({getItemCount('cooked_shrimp')})</button>
          <button 
            className="food-btn" 
            style={{backgroundColor: '#8e44ad', flex: 1}} 
            onClick={() => drinkPotion('prayer_potion')}
            disabled={getItemCount('prayer_potion') < 1}
          >
            🧪 Prayer Pot ({getItemCount('prayer_potion')})
          </button>
        </div>
      </div>

      {/* --- XP DROPS (gap between player and log) --- */}
      <div className="combat-xp-drops-column" style={{ position: 'relative', width: '40px', flexShrink: 0, pointerEvents: 'none' }}>
        <div className="xp-drop-container" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 100 }}>
          {xpDrops.map(drop => {
            let dropText = drop.amount;
            if (drop.skill === 'splash') dropText = 'Splash';
            if (drop.skill === 'miss') dropText = '0';
            if (drop.skill === 'dodge') dropText = 'Dodge';
            return (
              <div key={drop.id} className={`xp-drop ${drop.pietyActive ? 'piety' : 'normal'}`} style={{ color: drop.skill === 'splash' ? '#3498db' : drop.skill === 'dodge' ? '#2ecc71' : '', whiteSpace: 'nowrap' }}>
                {getIcon(drop.skill)} {dropText}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- COMBAT LOG --- */}
      <div className="card combat-log-card" style={{ 
        flex: '1 1 200px', 
        maxWidth: '260px', 
        minWidth: '180px',
        backgroundColor: '#111920', 
        border: '1px solid #2a3b4c', 
        borderRadius: '6px', 
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '640px'
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#c5d3df', fontSize: '13px', textAlign: 'center', borderBottom: '1px solid #2a3b4c', paddingBottom: '6px' }}>
          ⚔️ Combat Log
        </h4>
        <div ref={logContainerRef} style={{ flex: 1, overflowY: 'auto', fontSize: '12px', lineHeight: '1.6' }}>
          {combatLog.length === 0 ? (
            <div style={{ color: '#7b95a6', textAlign: 'center', marginTop: '20px' }}>Waiting for combat...</div>
          ) : (
            combatLog.map((entry, i) => (
              <div key={i} style={{ color: getLogColor(entry.type), padding: '2px 0', borderBottom: '1px solid #1a252e' }}>
                {formatLogEntry(entry)}
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- DMG DROPS (gap between log and enemy) --- */}
      <div className="combat-dmg-drops-column" style={{ position: 'relative', width: '40px', flexShrink: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 100 }}>
          {dmgDrops.map(drop => (
            <div key={drop.id} className="dmg-drop" style={{ whiteSpace: 'nowrap' }}>
              🩸 {drop.damage}
            </div>
          ))}
        </div>
      </div>

      {/* --- VIJAND KANT --- */}
      <div className="card combat-enemy-card" style={{ flex: '0 0 auto', width: '350px', backgroundColor: '#202a33', position: 'relative' }}>
        {isRespawning ? (
          /* Death timer countdown */
          <>
            <h3 style={{ margin: '0 0 15px 0', opacity: 0.5 }}>
              👹 {data?.name || 'Unknown'} <span style={{fontSize: '14px', color: '#7b95a6'}}>(Lvl {data?.reqLvl})</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
              <span style={{ fontSize: '40px', marginBottom: '10px', opacity: 0.4 }}>💀</span>
              <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#f1c40f', fontFamily: 'monospace' }}>
                {((combatState.respawnTicksLeft || 0) * 0.6).toFixed(1)}s
              </span>
              <span style={{ fontSize: '11px', color: '#7b95a6', marginTop: '4px' }}>Respawning...</span>
            </div>
            {/* Respawn progress bar */}
            <div className="combat-bar" style={{ position: 'relative', height: '24px', backgroundColor: '#111920', borderRadius: '4px', overflow: 'hidden', border: '1px solid #2a3b4c' }}>
              <div style={{ width: `${rPct}%`, height: '100%', backgroundColor: '#f1c40f', transition: 'width 0.15s linear' }}></div>
            </div>
          </>
        ) : (
          /* Normal enemy display */
          <>
            <h3 style={{ margin: '0 0 15px 0' }}>
              👹 {data?.name || 'Unknown'} <span style={{fontSize: '14px', color: '#7b95a6'}}>(Lvl {data?.reqLvl})</span>
            </h3>
            
            <div className="combat-bar" style={{ position: 'relative', height: '24px', backgroundColor: '#111920', borderRadius: '4px', overflow: 'hidden', border: '1px solid #2a3b4c' }}>
              <div style={{ width: `${(combatState.enemyHp / (data?.enemy?.hp || 1)) * 100}%`, height: '100%', backgroundColor: '#e74c3c', transition: 'width 0.3s ease-in-out' }}></div>
              <span className="combat-bar-text" style={{ position: 'absolute', top: 0, left: 0, width: '100%', textAlign: 'center', fontSize: '13px', lineHeight: '24px', color: 'white', textShadow: '1px 1px 2px black', fontWeight: 'bold' }}>HP: {combatState.enemyHp} / {data?.enemy?.hp}</span>
            </div>

            <div className="combat-bar" style={{ position: 'relative', height: '24px', backgroundColor: '#111920', borderRadius: '4px', overflow: 'hidden', border: '1px solid #2a3b4c', marginTop: '8px' }}>
              <div style={{ width: `${ePct}%`, height: '100%', backgroundColor: '#f39c12' }}></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}