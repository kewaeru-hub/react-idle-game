import React from 'react';
import { getRequiredXp } from '../utils/gameHelpers';

export default function TopBar({ inventory, screen, skills, setScreen, setActivePopup, hardResetGame, signOut, user }) {
  return (
    <header className="topbar">
      {/* LEFT SIDE - ONLY PROFILE & NAV BUTTONS */}
      <div className="topbar-left">
        {/* Round Profile Icon */}
        <div
          className={`profile-circle ${screen === 'profile' ? 'active' : ''}`}
          onClick={() => setScreen('profile')}
          title="Profile"
        >👤</div>

        {/* Nav Buttons */}
        <button className={`topbar-nav-btn ${screen === 'inventory' ? 'active' : ''}`} onClick={() => setScreen('inventory')} title="Inventory">🎒</button>
        <button className={`topbar-nav-btn ${screen === 'clan' ? 'active' : ''}`} onClick={() => setScreen('clan')} title="Clan">🛡️</button>
        <button className={`topbar-nav-btn ${screen === 'shop' ? 'active' : ''}`} onClick={() => setScreen('shop')} title="General Store">💰</button>
        <button className={`topbar-nav-btn ${screen === 'market' ? 'active' : ''}`} onClick={() => setScreen('market')} title="Grand Market">⚖️</button>
      </div>

      {/* CENTER - GOLD & COMBAT STATS */}
      <div className="topbar-center">
        {/* Gold Pill */}
        <div className="gold-pill">
          <span>💰</span>
          <span className="gold-amount">{inventory.coins?.toLocaleString() || 0}</span>
        </div>

        {/* Combat Stats (only on combat screen) */}
        {screen === 'combat' && (
          <div className="combat-stats-row">
            {['attack','strength','defence','ranged','magic','prayer','hitpoints','agility'].map(s => {
              const curLevel = skills[s]?.level || 1;
              const curXp = Math.floor(skills[s].xp || 0);
              const reqXp = getRequiredXp(curLevel + 1);
              const baseXp = getRequiredXp(curLevel);
              const progressPerc = Math.min(100, ((curXp - baseXp) / (reqXp - baseXp)) * 100);
              const icons = { attack:'🗡️', strength:'💪', defence:'🛡️', ranged:'🏹', magic:'🔮', prayer:'✨', hitpoints:'❤️', agility:'👟' };
              const hoverText = `${curXp.toLocaleString()} / ${reqXp.toLocaleString()} XP`;
              return (
                <div key={s} title={hoverText} className="combat-stat-icon">
                  <span className="stat-emoji">{icons[s]}</span>
                  <span className="stat-level">{curLevel}</span>
                  <div className="stat-xp-bar">
                    <div className="stat-xp-fill" style={{
                      width: `${progressPerc}%`,
                      backgroundColor: s === 'prayer' ? '#64b5f6' : (s === 'hitpoints' ? '#ff4d4d' : '#4affd4')
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="topbar-right">
        <button className="top-btn" onClick={() => setActivePopup('Quests')}>Quests</button>
        <button className="top-btn" onClick={() => setActivePopup('Analytics')}>Analytics</button>
        <button className="top-btn btn-wipe" onClick={hardResetGame}>Wipe Save</button>
        {signOut && <button className="top-btn" onClick={signOut} title={user?.email}>🚪</button>}
      </div>
    </header>
  );
}
