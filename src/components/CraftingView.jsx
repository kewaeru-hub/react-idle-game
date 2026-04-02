import React, { useState } from 'react';

const RANGED_SETS = ['Leather', 'Green', 'Black', 'Other'];
const MAGIC_SETS = ['Apprentice', 'Wizard', 'Mystic'];

export default function CraftingView({ ACTIONS, skills, inventory, startAction, currentAction }) {
  const [activeTab, setActiveTab] = useState('Ranged Armor');
  const [rangedSubTab, setRangedSubTab] = useState('Leather');
  const [magicSubTab, setMagicSubTab] = useState('Apprentice');

  // Filter alle Crafting acties
  const craftingActions = Object.entries(ACTIONS).filter(([_, data]) => data.skill === 'crafting');

  // Categorie check voor Crafting
  const getCategory = (rewardKey) => {
    if (rewardKey.includes('arrow')) return 'Ammo';
    if (rewardKey.startsWith('apprentice_') || rewardKey.startsWith('wizard_') || rewardKey.startsWith('mystic_')) return 'Magic Armor';
    return 'Ranged Armor';
  };

  const getRangedSet = (rewardKey) => {
    if (rewardKey.startsWith('green_leather_')) return 'Green';
    if (rewardKey.startsWith('black_leather_')) return 'Black';
    if (rewardKey.startsWith('leather_')) return 'Leather';
    return 'Other';
  };

  const getMagicSet = (rewardKey) => {
    if (rewardKey.startsWith('apprentice_')) return 'Apprentice';
    if (rewardKey.startsWith('wizard_')) return 'Wizard';
    if (rewardKey.startsWith('mystic_')) return 'Mystic';
    return 'Other';
  };

  // Groepeer de acties
  const groupedActions = { Ammo: [], 'Ranged Armor': [], 'Magic Armor': [] };
  craftingActions.forEach(([key, action]) => {
    const rewardKey = Object.keys(action.reward)[0];
    const category = getCategory(rewardKey);
    if (groupedActions[category]) groupedActions[category].push([key, action]);
  });

  // Determine which sub-tabs have items
  const availableRangedSets = RANGED_SETS.filter(set =>
    groupedActions['Ranged Armor'].some(([_, action]) => getRangedSet(Object.keys(action.reward)[0]) === set)
  );
  const availableMagicSets = MAGIC_SETS.filter(set =>
    groupedActions['Magic Armor'].some(([_, action]) => getMagicSet(Object.keys(action.reward)[0]) === set)
  );

  // Filter by sub-tab
  const hasSubTabs = (activeTab === 'Ranged Armor' && availableRangedSets.length > 0) ||
                     (activeTab === 'Magic Armor' && availableMagicSets.length > 0);
  const subTabs = activeTab === 'Ranged Armor' ? availableRangedSets : activeTab === 'Magic Armor' ? availableMagicSets : [];
  const activeSubTab = activeTab === 'Ranged Armor' ? rangedSubTab : magicSubTab;
  const setActiveSubTab = activeTab === 'Ranged Armor' ? setRangedSubTab : setMagicSubTab;
  const getSetFn = activeTab === 'Ranged Armor' ? getRangedSet : getMagicSet;

  let displayActions = groupedActions[activeTab] || [];
  if (hasSubTabs) {
    displayActions = displayActions.filter(([_, action]) => getSetFn(Object.keys(action.reward)[0]) === activeSubTab);
  }

  return (
    <div className="skill-view">
      <h2 style={{ color: '#fff', borderBottom: '2px solid #208b76', paddingBottom: '10px', marginBottom: '20px' }}>Crafting (Lv. {skills.crafting.level})</h2>
      
      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: hasSubTabs ? '10px' : '20px' }}>
        {Object.keys(groupedActions).map(tab => (
          <button 
            key={tab} 
            onClick={() => {
              setActiveTab(tab);
              if (tab === 'Ranged Armor') setRangedSubTab(availableRangedSets[0] || 'Leather');
              if (tab === 'Magic Armor') setMagicSubTab(availableMagicSets[0] || 'Apprentice');
            }}
            style={{ 
              padding: '8px 16px', backgroundColor: activeTab === tab ? '#208b76' : '#111920', 
              color: '#fff', border: '1px solid #2a3b4c', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' 
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Armor Set Sub-Tabs */}
      {hasSubTabs && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {subTabs.map(set => (
            <button 
              key={set} 
              onClick={() => setActiveSubTab(set)}
              style={{ 
                padding: '5px 12px', 
                backgroundColor: activeSubTab === set ? '#2a3b4c' : 'transparent', 
                color: activeSubTab === set ? '#4affd4' : '#7b95a6',
                border: activeSubTab === set ? '1px solid #4affd4' : '1px solid #1a2a3a', 
                borderRadius: '4px', 
                cursor: 'pointer', 
                fontSize: '12px',
                fontWeight: activeSubTab === set ? 'bold' : 'normal',
                transition: 'all 0.2s ease'
              }}
            >
              {set}
            </button>
          ))}
        </div>
      )}

      {/* Acties Grid */}
      <div className="skilling-action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
        {displayActions.map(([key, action]) => {
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