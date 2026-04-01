import React, { useState } from 'react';

export default function CraftingView({ ACTIONS, skills, inventory, startAction, currentAction }) {
  const [activeTab, setActiveTab] = useState('Ranged Armor');

  // Filter alle Crafting acties
  const craftingActions = Object.entries(ACTIONS).filter(([_, data]) => data.skill === 'crafting');

  // Slimme categorie check voor Crafting
  const getCategory = (rewardKey) => {
    if (rewardKey.includes('arrow')) return 'Ammo';
    if (rewardKey.includes('hat') || rewardKey.includes('robe') || rewardKey.includes('skirt')) return 'Magic Armor';
    return 'Ranged Armor'; // De rest is leather/hides
  };

  // Groepeer de acties
  const groupedActions = { Ammo: [], 'Ranged Armor': [], 'Magic Armor': [] };
  craftingActions.forEach(([key, action]) => {
    const rewardKey = Object.keys(action.reward)[0];
    const category = getCategory(rewardKey);
    if (groupedActions[category]) groupedActions[category].push([key, action]);
  });

  return (
    <div className="skill-view">
      <h2 style={{ color: '#fff', borderBottom: '2px solid #208b76', paddingBottom: '10px', marginBottom: '20px' }}>Crafting (Lv. {skills.crafting.level})</h2>
      
      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {Object.keys(groupedActions).map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '8px 16px', backgroundColor: activeTab === tab ? '#208b76' : '#111920', 
              color: '#fff', border: '1px solid #2a3b4c', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' 
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Acties Grid */}
      <div className="skilling-action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
        {groupedActions[activeTab].map(([key, action]) => {
          const isUnlocked = skills.crafting.level >= action.reqLvl;
          const isDoing = currentAction === key;
          
          return (
            <div key={key} className="card" style={{ opacity: isUnlocked ? 1 : 0.5, border: isDoing ? '2px solid #4affd4' : '1px solid #2a3b4c' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: isUnlocked ? '#fff' : '#e74c3c' }}>{action.name}</h3>
                <span style={{ fontSize: '12px', color: '#7b95a6' }}>Lv. {action.reqLvl}</span>
              </div>
              
              <div style={{ backgroundColor: '#0b1014', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '12px' }}>
                <p style={{ margin: '0 0 5px 0', color: '#c5d3df' }}>⏱️ {((action.baseTime || 1800) / 1000).toFixed(1)}s | ⭐ {action.xp} XP</p>
                <div style={{ color: '#7b95a6' }}>
                  Cost: {Object.entries(action.cost).map(([cKey, cVal]) => (
                    <span key={cKey} style={{ color: (inventory[cKey] || 0) >= cVal ? '#2ecc71' : '#e74c3c', marginLeft: '5px' }}>
                      {cVal}x {cKey.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => startAction(key)} 
                disabled={!isUnlocked}
                style={{ 
                  width: '100%', padding: '10px', fontWeight: 'bold', borderRadius: '4px', border: 'none', cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  backgroundColor: isDoing ? '#b33a3a' : (isUnlocked ? '#208b76' : '#2a3b4c'), color: '#fff'
                }}
              >
                {isDoing ? 'Stop Crafting' : 'Craft'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}