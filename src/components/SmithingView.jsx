import React, { useState } from 'react';
import { ITEM_IMAGES } from '../data/gameData';

export default function SmithingView({ ACTIONS, skills, inventory, startAction, currentAction }) {
  const [activeTab, setActiveTab] = useState('Bars');

  // Filter alle Smithing acties
  const smithingActions = Object.entries(ACTIONS).filter(([_, data]) => data.skill === 'smithing');

  // Slimme functie om acties in categorieën te verdelen
  const getCategory = (rewardKey) => {
    if (rewardKey.includes('bar')) return 'Bars';
    if (rewardKey.includes('helmet') || rewardKey.includes('body') || rewardKey.includes('legs')) return 'Armor';
    return 'Weapons'; // Alles wat geen bar of armor is, is een wapen (swords, daggers etc)
  };

  // Groepeer de acties
  const groupedActions = { Bars: [], Weapons: [], Armor: [] };
  smithingActions.forEach(([key, action]) => {
    const rewardKey = Object.keys(action.reward)[0];
    const category = getCategory(rewardKey);
    if (groupedActions[category]) groupedActions[category].push([key, action]);
  });

  return (
    <div className="skill-view">
      <h2 style={{ color: '#fff', borderBottom: '2px solid #208b76', paddingBottom: '10px', marginBottom: '20px' }}>Smithing (Lv. {skills.smithing.level})</h2>
      
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
          const isUnlocked = skills.smithing.level >= action.reqLvl;
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
                {isDoing ? 'Stop Smithing' : 'Smith'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}