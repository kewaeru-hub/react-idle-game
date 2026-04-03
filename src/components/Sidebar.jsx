import React from 'react';

export default function Sidebar({ screen, setScreen, skills, activeAction, ACTIONS, combatLevel = 0 }) {
  const isCombatActive = activeAction && ACTIONS?.[activeAction]?.skill === 'combat' && screen === 'combat';
  const SKILLS = [
    { id: 'combat',     icon: '⚔️' },
    { id: 'prayer',     icon: '🙏' },
    { id: 'woodcutting', icon: '🪓' },
    { id: 'fishing',    icon: '🐟' },
    { id: 'cooking',    icon: '🍳' },
    { id: 'mining',     icon: '⛏️' },
    { id: 'smithing',   icon: '🔨' },
    { id: 'infusion',   icon: '🔮' },
    { id: 'farming',    icon: '🌾' },
    { id: 'foraging',   icon: '🍃' },
    { id: 'herblore',   icon: '🧪' },
    { id: 'crafting',   icon: '🎨' },
    { id: 'slayer',     icon: '💀' },
    { id: 'agility',    icon: '👟' },
    { id: 'thieving',   icon: '🗡️' },
  ];

  return (
    <div className={`sidebar-wrapper ${isCombatActive ? 'hide-in-combat' : ''}`}>
      <div className="sidebar-label">Skill Hub</div>
      <nav className="sidebar sidebar-view-text">
        {SKILLS.map(({ id, icon }) => {
          const isActive = screen === id;
          return (
            <div
              key={id}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setScreen(id)}
            >
              <span className="sidebar-item-icon">{icon}</span>
              <span className="sidebar-item-name">
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </span>
              <small className="sidebar-item-level">
                Lv.{id === 'combat' ? combatLevel : (skills[id]?.level || 1)}
              </small>
              {isActive && <span className="sidebar-item-check">✓</span>}
            </div>
          );
        })}
      </nav>
    </div>
  );
}