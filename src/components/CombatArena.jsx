import React from 'react';
import useCombatEngine from '../hooks/useCombatEngine';

export default function CombatArena({ allies: initialAllies = [], enemies: initialEnemies = [], children }) {
  const {
    allies,
    enemies,
    playerTargetId,
    setPlayerTarget,
    queuePlayerAction,
    status,
  } = useCombatEngine(initialAllies, initialEnemies);

  const attackProgress = (entity) => {
    const ticks = entity.currentTickCount || 0;
    const denom = Math.max(1, entity.attackSpeedTicks || 1);
    return Math.min(100, Math.round((ticks / denom) * 100));
  };

  return (
    <div className="combat-arena" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <div className="allies" style={{ flex: 1 }}>
        {allies.map(a => (
          <div key={a.id} className="entity ally" style={{ padding: 8, marginBottom: 8, background: '#142027', borderRadius: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ color: '#fff' }}>{a.name}</strong>
              <span style={{ color: '#fff' }}>{a.hp}/{a.maxHp}</span>
            </div>
            <div style={{ height: 8, background: '#0b0c10', borderRadius: 4, overflow: 'hidden', marginTop: 6 }}>
              <div style={{ width: `${Math.round((a.hp / a.maxHp) * 100)}%`, height: '100%', background: '#66FCF1' }} />
            </div>
            <div style={{ height: 6, background: '#051017', borderRadius: 4, overflow: 'hidden', marginTop: 6 }}>
              <div style={{ width: `${attackProgress(a)}%`, height: '100%', background: '#a0fffa' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="arena-center" style={{ width: 280, textAlign: 'center' }}>
        <div style={{ marginBottom: 8, color: '#8a9ba8' }}>Status: {status}</div>
        {/* Render children and inject queuePlayerAction prop */}
        <div>
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, { queuePlayerAction });
            }
            return child;
          })}
        </div>
      </div>

      <div className="enemies" style={{ flex: 1 }}>
        {enemies.map(e => (
          <div key={e.id} onClick={() => setPlayerTarget(e.id)} className={`entity enemy ${playerTargetId === e.id ? 'targeted' : ''}`} style={{ padding: 8, marginBottom: 8, background: playerTargetId === e.id ? '#2b1f2f' : '#171b21', borderRadius: 6, cursor: 'pointer', border: playerTargetId === e.id ? '2px solid #66FCF1' : '2px solid transparent' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ color: '#fff' }}>{e.name}</strong>
              <span style={{ color: '#fff' }}>{e.hp}/{e.maxHp}</span>
            </div>
            <div style={{ height: 8, background: '#0b0c10', borderRadius: 4, overflow: 'hidden', marginTop: 6 }}>
              <div style={{ width: `${Math.round((e.hp / e.maxHp) * 100)}%`, height: '100%', background: '#ff4d4d' }} />
            </div>
            <div style={{ height: 6, background: '#051017', borderRadius: 4, overflow: 'hidden', marginTop: 6 }}>
              <div style={{ width: `${attackProgress(e)}%`, height: '100%', background: '#ffc20a' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
