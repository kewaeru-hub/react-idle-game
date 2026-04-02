import React from 'react';
import { ITEMS, WEAPONS, ARMOR, AMMO, PETS } from '../data/gameData';

export default function WelcomeBackModal({ offlineProgress, onClose }) {
  if (!offlineProgress) return null;

  // Special case: no task was active when player left
  if (offlineProgress.noTask) {
    return (
      <div className="popup-overlay" onClick={onClose}>
        <div className="popup-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ color: '#f1c40f', marginBottom: '10px' }}>💤 Welcome Back!</h1>
            <p style={{ color: '#c5d3df', fontSize: '16px', margin: '5px 0' }}>
              You were away for <strong style={{ color: '#f1c40f' }}>{Math.floor(offlineProgress.minutesAway / 60)}h {offlineProgress.minutesAway % 60}m</strong>
            </p>
          </div>

          <div style={{ backgroundColor: 'rgba(241, 196, 15, 0.1)', borderRadius: '6px', padding: '15px', marginBottom: '15px', border: '1px solid rgba(241, 196, 15, 0.3)' }}>
            <h3 style={{ color: '#f1c40f', marginTop: 0, marginBottom: '10px' }}>💡 Tip: Earn XP While Offline!</h3>
            <p style={{ color: '#c5d3df', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
              You didn't have an active task when you logged out. Start any skilling action (Woodcutting, Mining, Fishing, etc.) before closing the game and you'll earn XP and items while you're away!
            </p>
          </div>

          <button onClick={onClose} style={{
            width: '100%', padding: '12px', backgroundColor: '#208b76', color: 'white',
            border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer'
          }}>
            Got it!
          </button>
        </div>
      </div>
    );
  }

  const getItemName = (itemId) => {
    return (ITEMS[itemId] || WEAPONS[itemId] || ARMOR[itemId] || AMMO[itemId] || {}).name || itemId;
  };

  const formatSkillName = (skill) => {
    return skill.charAt(0).toUpperCase() + skill.slice(1);
  };

  const getPetPerkDescription = (perk, procs) => {
    const descriptions = {
      extraLog: `doubled your log yield ${procs}x`,
      treasureBoost: `boosted treasure chance ${procs}x`,
      autoSmelt: `auto-smelted ores into bars ${procs}x`,
      foragingSpeed: `sped up every foraging action`,
      batchCook: `batch-cooked ×3 servings ${procs}x`,
      barSave: `saved you +1 extra bar ${procs}x`,
      freeCraft: `crafted for free ${procs}x`,
      doubleBrew: `double-brewed potions ${procs}x`,
      instantCourse: `instantly completed courses ${procs}x`,
    };
    return descriptions[perk] || `activated ${procs}x`;
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#4affd4', marginBottom: '10px' }}>👋 Welcome Back!</h1>
          <p style={{ color: '#c5d3df', fontSize: '16px', margin: '5px 0' }}>
            You were away for <strong style={{ color: '#2ecc71' }}>{offlineProgress.offlineHours}h {offlineProgress.offlineMinutes % 60}m</strong>
          </p>
        </div>

        <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '15px', marginBottom: '15px' }}>
          <h3 style={{ color: '#f1c40f', marginTop: 0, marginBottom: '10px' }}>📊 Offline Progress</h3>
          
          <div style={{ color: '#c5d3df', fontSize: '14px', lineHeight: '1.8', marginBottom: '10px' }}>
            <div>✓ <strong>{offlineProgress.totalActions}x</strong> {offlineProgress.actionName} {offlineProgress.isCombat ? 'killed' : 'completed'}</div>
            <div>✓ <strong style={{ color: '#2ecc71' }}>+{Math.floor(offlineProgress.totalXp)} {formatSkillName(offlineProgress.skill)}</strong> XP gained</div>
            {offlineProgress.isCombat && offlineProgress.hpXp > 0 && (
              <div>✓ <strong style={{ color: '#2ecc71' }}>+{Math.floor(offlineProgress.hpXp)} Hitpoints</strong> XP gained</div>
            )}
          </div>

          {Object.keys(offlineProgress.itemsGained).length > 0 && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #2a3b4c' }}>
              <h4 style={{ color: '#4affd4', marginTop: 0, marginBottom: '8px' }}>🎁 Items Gained:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {Object.entries(offlineProgress.itemsGained).map(([itemId, qty]) => (
                  <div key={itemId} style={{ fontSize: '13px', color: '#c5d3df' }}>
                    {qty}x {getItemName(itemId)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {offlineProgress.resourcesDepleted && (
            <div style={{ marginTop: '12px', padding: '10px', backgroundColor: 'rgba(220, 53, 69, 0.2)', borderRadius: '4px', borderLeft: '3px solid #dc3545', fontSize: '13px', color: '#ff6b6b' }}>
              ⚠️ Stopped early: ran out of resources
            </div>
          )}

          {offlineProgress.isCombat && offlineProgress.foodConsumed && Object.keys(offlineProgress.foodConsumed).length > 0 && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #2a3b4c' }}>
              <h4 style={{ color: '#e67e22', marginTop: 0, marginBottom: '8px' }}>🍖 Food Consumed:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {Object.entries(offlineProgress.foodConsumed).map(([itemId, qty]) => (
                  <div key={itemId} style={{ fontSize: '13px', color: '#c5d3df' }}>
                    {qty}x {getItemName(itemId)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {offlineProgress.died && (
            <div style={{ marginTop: '12px', padding: '10px', backgroundColor: 'rgba(220, 53, 69, 0.2)', borderRadius: '4px', borderLeft: '3px solid #dc3545', fontSize: '13px', color: '#ff6b6b' }}>
              💀 You died during offline combat! Progress was saved up to your last kill.
            </div>
          )}

          {offlineProgress.petName && offlineProgress.petProcs > 0 && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #2a3b4c' }}>
              <h4 style={{ color: '#e67e22', marginTop: 0, marginBottom: '8px' }}>🐾 Pet Bonus:</h4>
              <div style={{ fontSize: '13px', color: '#c5d3df' }}>
                <strong style={{ color: '#f39c12' }}>{offlineProgress.petName}</strong> {getPetPerkDescription(offlineProgress.petPerk, offlineProgress.petProcs)}
              </div>
            </div>
          )}

          {offlineProgress.petName && offlineProgress.petPerk === 'foragingSpeed' && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #2a3b4c' }}>
              <h4 style={{ color: '#e67e22', marginTop: 0, marginBottom: '8px' }}>🐾 Pet Bonus:</h4>
              <div style={{ fontSize: '13px', color: '#c5d3df' }}>
                <strong style={{ color: '#f39c12' }}>{offlineProgress.petName}</strong> {getPetPerkDescription(offlineProgress.petPerk, 0)}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Collect Rewards
        </button>
      </div>
    </div>
  );
}
