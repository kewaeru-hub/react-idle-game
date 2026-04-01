import React from 'react';

export default function ProfileView({ skills, inventory }) {
  // Bereken totalen
  const totalLevel = Object.values(skills).reduce((sum, s) => sum + s.level, 0);
  const totalXp = Math.floor(Object.values(skills).reduce((sum, s) => sum + s.xp, 0));
  
  // Bereken huidge offline uren
  const currentOfflineHours = 12 + (inventory?.offlineHoursUpgrade || 0);

  return (
    <div className="profile-grid">
      {/* LINKER KOLOM: Info & Boosts */}
      <div className="profile-col-left">
        <div className="card" style={{ margin: 0 }}>
          <h3 style={{ borderBottom: '1px solid #2a3b4c', paddingBottom: '10px', marginBottom: '10px' }}>User info</h3>
          <p style={{ color: '#c5d3df', marginBottom: '5px' }}>Username: <strong>Speler</strong></p>
          <p style={{ color: '#c5d3df', marginBottom: '5px' }}>Game mode: <strong>Standard</strong></p>
          <p style={{ color: '#c5d3df', marginBottom: '5px' }}>Offline time: <strong>{currentOfflineHours}h / 24h</strong></p>
          <button className="top-btn" style={{ width: '100%', marginTop: '10px', backgroundColor: '#208b76' }}>Collection log</button>
        </div>

        <div className="card" style={{ margin: 0 }}>
          <h3 style={{ borderBottom: '1px solid #2a3b4c', paddingBottom: '10px', marginBottom: '10px' }}>Active boosts</h3>
          <p style={{ color: '#7b95a6', fontSize: '13px' }}>No active boosts.</p>
        </div>
      </div>

      {/* RECHTER KOLOM: Skills overzicht */}
      <div className="profile-col-right">
        <div className="card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a3b4c', paddingBottom: '10px' }}>
            <h3>Skills</h3>
            <span style={{ color: '#7b95a6' }}>Total level: <strong style={{color: 'white'}}>{totalLevel}</strong> ({totalXp.toLocaleString()} xp)</span>
          </div>
          
          <div className="skills-container">
            {Object.entries(skills).map(([name, data]) => (
              <div key={name} className="skill-badge">
                <span>{name}</span>
                <strong>Lv. {data.level}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}