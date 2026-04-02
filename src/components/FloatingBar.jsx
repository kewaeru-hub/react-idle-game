import React from 'react';

export default function FloatingBar({ activeAction, ACTIONS, progress, stopAction, setScreen, screen, xpDrops = [], combatStyle, combatState }) {
  if (!activeAction) return null;
  const data = ACTIONS[activeAction];
  if (!data) return null;

  if (screen === data.skill) return null;

  // Determine display name: for combat show the combat style, otherwise the skill name
  const skillDisplay = data.skill === 'combat' && combatStyle
    ? combatStyle.charAt(0).toUpperCase() + combatStyle.slice(1)
    : data.skill
      ? data.skill.charAt(0).toUpperCase() + data.skill.slice(1)
      : 'Active';

  const isCombat = data.skill === 'combat';
  const enemyHpPercent = combatState && combatState.enemyMaxHp > 0 
    ? (combatState.enemyHp / combatState.enemyMaxHp) * 100 
    : 0;

  return (
    <div className="floating-bar" style={{
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      backgroundColor: '#111920',
      padding: '15px', 
      borderRadius: '8px', 
      border: '2px solid #208b76', 
      zIndex: 99999,
      display: 'flex', 
      flexDirection: 'column', 
      gap: '10px', 
      minWidth: '220px', 
      boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
    }}>
      
    {/* --- XP DROPS ZONE (ONDER ELKAAR & MET ICONEN) --- */}
    <div style={{
      position: 'absolute',
      left: '-65px', // Iets meer ruimte naar links voor het icoon
      top: '10px', // Begin iets hoger
      display: 'flex',
      flexDirection: 'column', // <--- ZET ZE ONDER ELKAAR
      alignItems: 'flex-start', // Uitlijnen aan de linkerkant
      pointerEvents: 'none',
      zIndex: 999999,
      gap: '4px' // Ruimte tussen de drops onder elkaar
    }}>
      {xpDrops.map(drop => {
        // Icoon bepalen op basis van skill
        const icons = {
          woodcutting: '🌲', mining: '🪨', fishing: '🐟', cooking: '🍳', 
          smithing: '🔨', crafting: '🎨', slayer: '💀', hitpoints: '❤️',
          attack: '⚔️', strength: '💪', defence: '🛡️', ranged: '🏹', magic: '🔮'
        };
        
        // We hebben geen xOffset meer nodig omdat ze onder elkaar staan
        return (
          <div key={drop.id} style={{
            fontSize: '12px', // Iets kleiner font voor compactheid onder elkaar
            fontWeight: 'bold', 
            color: drop.skill === 'hitpoints' ? '#ff4d4d' : '#2ecc71',
            textShadow: '1px 1px 3px black',
            animation: 'floatUpMini 1.5s ease-out forwards',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            position: 'relative' // Zorg dat ze goed in de flexbox vallen
          }}>
            <span>{icons[drop.skill] || '⭐'}</span>
            <span>+{Math.floor(drop.amount)}</span>
          </div>
        );
      })}
    </div>
      <div className="floating-bar-title" style={{ fontSize: '14px', fontWeight: 'bold', color: '#2ecc71', textAlign: 'center' }}>
        {skillDisplay}: {data.name}
      </div>

      <div style={{ position: 'relative', marginBottom: '5px' }}>
        <div style={{
          position: 'absolute',
          top: '-14px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 'clamp(10px, 2vw, 13px)',
          color: '#ffffff',
          fontWeight: 'bold',
          textShadow: '0 0 3px rgba(0,0,0,0.8)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          display: isCombat && combatState ? 'block' : 'none'
        }}>
          {Math.ceil(combatState?.enemyHp || 0)}/{Math.ceil(combatState?.enemyMaxHp || 1)}
        </div>
        <div className="floating-bar-progress" style={{ width: '100%', height: '5px', background: '#0b1014', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ 
            width: isCombat ? `${enemyHpPercent}%` : `${progress}%`, 
            height: '100%', 
            background: isCombat ? '#d32f2f' : '#2ecc71',
            transition: (isCombat || progress > 2) ? 'width 0.1s linear' : 'none' 
          }}></div>
        </div>
      </div>

      <div className="floating-bar-btns" style={{ display: 'flex', gap: '10px' }}>
        <button className="btn-stop" style={{ flex: 1, padding: '8px', fontSize: '12px' }} onClick={stopAction}>Stop Task</button>
        <button className="top-btn" style={{ flex: 1, padding: '8px', fontSize: '12px', backgroundColor: '#3498db' }} 
                onClick={() => setScreen(data.skill)}>Return</button>
      </div>
    </div>
  );
}