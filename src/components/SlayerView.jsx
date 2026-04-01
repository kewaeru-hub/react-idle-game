import React, { useState } from 'react';

export default function SlayerView({ 
  slayer, skills, SLAYER_MASTERS, inventory, setInventory,
  setScreen, startCombat
}) {
  const [activeTab, setActiveTab] = useState('assignment');
  const slayerPoints = slayer.slayerPoints || 0;
  const currentTask = slayer.currentTask;

  const SHOP_ITEMS = [
    { id: 'cancel', name: 'Cancel Task', cost: 30, desc: 'Cancel your current task at your Master.', type: 'action', icon: '❌' },
    { id: 'konar_unlock', name: 'Unlock Konar', cost: 200, desc: 'Unlock the legendary boss master Konar for boss tasks.', type: 'unlock', icon: '👑' },
    { id: 'slayer_supply_crate', name: 'Slayer Supply Crate', cost: 100, desc: 'Contains random supplies (Loot table coming soon).', type: 'item', icon: '📦' },
    { id: 'auto_completer', name: 'Auto Completer', cost: 1000, desc: 'Automatically gets a new task upon completion and starts combat.', type: 'unlock', icon: '⚙️' },
    { id: 'extended_assignments', name: 'Extended Assignments', cost: 5000, desc: 'Makes tasks for Slayer-only monsters significantly longer.', type: 'unlock', icon: '📜' },
    { id: 'herblore_bag', name: 'Herblore Bag', cost: 2000, desc: 'Stores all your Herblore supplies to save inventory space.', type: 'unlock', icon: '🌿' },
    { id: 'seed_bag', name: 'Seed Bag', cost: 2000, desc: 'Stores all your Farming seeds to save inventory space.', type: 'unlock', icon: '🌱' }
  ];

  const maxHp = skills.hitpoints?.level || 10;

  return (
    <div className="slayer-view" style={{ marginTop: '10px' }}>
      
      {/* HEADER & PUNTEN */}
      <div className="slayer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', backgroundColor: '#111920', borderRadius: '4px', border: '1px solid #2a3b4c', padding: '5px' }}>
          <button
            onClick={() => setActiveTab('assignment')}
            style={{ padding: '8px 15px', backgroundColor: activeTab === 'assignment' ? '#208b76' : 'transparent', color: activeTab === 'assignment' ? 'white' : '#c5d3df', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Assignment
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            style={{ padding: '8px 15px', backgroundColor: activeTab === 'shop' ? '#208b76' : 'transparent', color: activeTab === 'shop' ? 'white' : '#c5d3df', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Rewards Shop
          </button>
        </div>
        
        <span style={{ color: '#f1c40f', fontWeight: 'bold', backgroundColor: '#152029', padding: '8px 15px', borderRadius: '4px', border: '1px solid #2a3b4c', fontSize: '16px' }}>
          ⭐ {slayerPoints} pts
        </span>
      </div>

      {/* --- TAB: ASSIGNMENT --- */}
      {activeTab === 'assignment' && (
        <>
          {currentTask ? (
            <div className="card" style={{ backgroundColor: '#1a2b25', borderColor: '#208b76', textAlign: 'center', padding: '25px' }}>
              <h4 style={{ color: '#4affd4', margin: '0 0 10px 0' }}>Current Task</h4>
              <p style={{ color: 'white', fontSize: '20px', margin: '0 0 15px 0' }}>
                Defeat <strong>{currentTask.killsNeeded - currentTask.killsCompleted}</strong> more <strong>{currentTask.monsterKey}</strong>
              </p>
              <div style={{ marginBottom: '10px', backgroundColor: '#111920', height: '15px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(currentTask.killsCompleted / currentTask.killsNeeded) * 100}%`, backgroundColor: '#2ecc71', height: '100%' }}></div>
              </div>
              <p style={{ fontSize: '13px', color: '#7b95a6', marginBottom: '20px' }}>
                Progress: {currentTask.killsCompleted} / {currentTask.killsNeeded}
              </p>
              <button 
                onClick={() => {
                  startCombat(currentTask.monsterKey);
                  setScreen('combat');
                }}
                style={{ padding: '10px 30px', backgroundColor: '#208b76', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ⚔️ Fight {currentTask.monsterKey.replace('fight_', '').replace(/_/g, ' ')}
              </button>
            </div>
          ) : (
            <div className="card" style={{ backgroundColor: '#152029', textAlign: 'center', color: '#7b95a6', padding: '30px' }}>
              <p>You do not have an active Slayer task.</p>
              <p>Visit a Slayer Master below to get a new assignment!</p>
            </div>
          )}

          <h3 style={{ marginTop: '30px', marginBottom: '15px', borderBottom: '1px solid #2a3b4c', paddingBottom: '10px' }}>Slayer Masters</h3>
          
          <div className="slayer-masters" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {SLAYER_MASTERS.map(master => {
              const canUse = maxHp >= master.reqHp;
              const isLocked = master.requiresUnlock && slayerPoints < 200;
              return (
                <div key={master.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: canUse && !isLocked ? 1 : 0.6, backgroundColor: '#202a33' }}>
                  <div>
                    <strong style={{ fontSize: '16px', color: canUse ? 'white' : '#7b95a6' }}>{master.name}</strong>
                    <div style={{ fontSize: '12px', color: '#7b95a6', marginTop: '4px' }}>
                      <span style={{ color: canUse ? '#2ecc71' : '#e74c3c' }}>Requires HP: {master.reqHp}</span> | 
                      <span style={{ color: '#f1c40f', marginLeft: '5px' }}>Reward: {master.points} pts</span>
                      {isLocked && <span style={{ color: '#e74c3c', marginLeft: '5px' }}>| Requires 200+ pts</span>}
                    </div>
                    <div style={{ fontSize: '11px', color: '#556b7a', marginTop: '4px' }}>Target: {master.desc}</div>
                  </div>
                  
                  <button 
                    style={{ padding: '8px 20px', border: 'none', borderRadius: '4px', cursor: (currentTask || !canUse || isLocked) ? 'not-allowed' : 'pointer', backgroundColor: currentTask || !canUse || isLocked ? '#2a3b4c' : '#208b76', color: currentTask || !canUse || isLocked ? '#7b95a6' : 'white', fontWeight: 'bold' }}
                    onClick={() => slayer.acceptTask(master.id)}
                    disabled={currentTask !== null || !canUse || isLocked}
                  >
                    {currentTask ? 'Task Active' : !canUse ? 'HP too low' : isLocked ? 'Locked' : 'Get Task'}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* --- TAB: REWARDS SHOP --- */}
      {activeTab === 'shop' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {SHOP_ITEMS.map(item => {
            const canAfford = slayerPoints >= item.cost;
            const isOwned = item.type === 'unlock' && inventory[item.id] === 1;

            return (
              <div key={item.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isOwned ? '#1a2b25' : '#202a33', border: isOwned ? '1px solid #2ecc71' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ fontSize: '24px', backgroundColor: '#111920', padding: '10px', borderRadius: '8px' }}>
                    {item.icon}
                  </div>
                  <div>
                    <strong style={{ color: 'white', fontSize: '16px' }}>{item.name}</strong>
                    <div style={{ fontSize: '12px', color: '#4affd4', marginTop: '4px' }}>{item.desc}</div>
                    {item.type === 'item' && inventory[item.id] > 0 && (
                      <div style={{ fontSize: '11px', color: '#7b95a6', marginTop: '4px' }}>Owned: {inventory[item.id]}</div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                  <span style={{ color: canAfford && !isOwned ? '#f1c40f' : '#e74c3c', fontWeight: 'bold' }}>
                    {item.cost} pts
                  </span>
                  
                  {item.id === 'cancel' ? (
                    <button 
                      style={{ padding: '8px 20px', border: 'none', borderRadius: '4px', backgroundColor: !currentTask || !canAfford ? '#2a3b4c' : '#e74c3c', color: !currentTask || !canAfford ? '#7b95a6' : 'white', fontWeight: 'bold', cursor: !currentTask || !canAfford ? 'not-allowed' : 'pointer' }}
                      onClick={() => slayer.cancelTask()} 
                      disabled={!currentTask || !canAfford}
                    >
                      Cancel
                    </button>
                  ) : (
                    <button 
                      style={{ padding: '8px 20px', border: 'none', borderRadius: '4px', backgroundColor: isOwned ? '#2a3b4c' : !canAfford ? '#34495e' : '#208b76', color: isOwned || !canAfford ? '#7b95a6' : 'white', fontWeight: 'bold', cursor: isOwned || !canAfford ? 'not-allowed' : 'pointer' }}
                      onClick={() => {
                        if (canAfford && !isOwned) {
                          if (item.type === 'unlock') {
                            setInventory(prev => ({ ...prev, [item.id]: 1 }));
                            slayer.setSlayerPoints(slayerPoints - item.cost);
                          } else {
                            setInventory(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
                            slayer.setSlayerPoints(slayerPoints - item.cost);
                          }
                        }
                      }}
                      disabled={!canAfford || isOwned}
                    >
                      {isOwned ? 'Owned' : 'Buy'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
