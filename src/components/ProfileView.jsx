import React, { useState, useMemo } from 'react';

const CATEGORY_ORDER = ['beginner', 'easy', 'moderate', 'hard', 'extreme', 'bosses'];
const CATEGORY_COLORS = {
  beginner: '#2ecc71',
  easy: '#27ae60',
  moderate: '#f1c40f',
  hard: '#e67e22',
  extreme: '#e74c3c',
  bosses: '#9b59b6'
};

function formatTime(ms) {
  const totalSecs = Math.floor(ms / 1000);
  if (totalSecs < 60) return `${totalSecs}s`;
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m`;
}

export default function ProfileView({ skills, inventory, user, claimAllTools, claimedTools = {}, TOOL_SKILLS = {}, monsterStats = {}, ACTIONS = {}, ITEM_IMAGES = {} }) {
  const [showToolPopup, setShowToolPopup] = useState(false);
  const [showCongratsPopup, setShowCongratsPopup] = useState(false);
  const [showCollectionLog, setShowCollectionLog] = useState(false);
  const [selectedMonster, setSelectedMonster] = useState(null);

  // Group combat monsters by category
  const monstersByCategory = useMemo(() => {
    const groups = {};
    CATEGORY_ORDER.forEach(cat => { groups[cat] = []; });
    try {
      if (ACTIONS && typeof ACTIONS === 'object') {
        Object.entries(ACTIONS).forEach(([id, data]) => {
          if (data && data.skill === 'combat' && data.category && !data.isFightCave) {
            const cat = data.category;
            if (groups[cat]) groups[cat].push({ id, ...data });
          }
        });
      }
    } catch (e) {
      console.error('Error grouping monsters:', e);
    }
    return groups;
  }, [ACTIONS]);

  // Bereken totalen
  const totalLevel = Object.values(skills).reduce((sum, s) => sum + s.level, 0);
  const totalXp = Math.floor(Object.values(skills).reduce((sum, s) => sum + s.xp, 0));
  
  // Bereken huidge offline uren
  const currentOfflineHours = 12 + (inventory?.offlineHoursUpgrade || 0);
  
  // Get username from user metadata or email
  const username = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Speler';

  // Check if all tools are already claimed
  const allToolsClaimed = Object.keys(TOOL_SKILLS).length > 0 && Object.keys(TOOL_SKILLS).every(skill => claimedTools[skill]);

  return (
    <div className="profile-grid">
      {/* LINKER KOLOM: Info & Boosts */}
      <div className="profile-col-left">
        <div className="card" style={{ margin: 0 }}>
          <h3 style={{ borderBottom: '1px solid #2a3b4c', paddingBottom: '10px', marginBottom: '10px' }}>User info</h3>
          <p style={{ color: '#c5d3df', marginBottom: '5px' }}>Username: <strong>{username}</strong></p>
          <p style={{ color: '#c5d3df', marginBottom: '5px' }}>Game mode: <strong>Standard</strong></p>
          <p style={{ color: '#c5d3df', marginBottom: '5px' }}>Offline time: <strong>{currentOfflineHours}h / 24h</strong></p>
          <button className="top-btn" onClick={() => { setShowCollectionLog(true); setSelectedMonster(null); }} style={{ width: '100%', marginTop: '10px', backgroundColor: '#208b76' }}>Collection log</button>
        </div>

        <div className="card" style={{ margin: 0 }}>
          <h3 style={{ borderBottom: '1px solid #2a3b4c', paddingBottom: '10px', marginBottom: '10px' }}>Active boosts</h3>
          <p style={{ color: '#7b95a6', fontSize: '13px' }}>No active boosts.</p>
        </div>

        {/* Claim Tools - Separate card that disappears after claiming */}
        {!allToolsClaimed && (
          <div className="card" style={{ margin: 0, border: '2px solid #4affd4', backgroundColor: 'rgba(26, 58, 45, 0.5)' }}>
            <h3 style={{ color: '#4affd4', borderBottom: '1px solid #2a3b4c', paddingBottom: '10px', marginBottom: '10px' }}>🧰 Starter Tools</h3>
            <p style={{ color: '#c5d3df', fontSize: '12px', marginBottom: '12px' }}>Claim a free bronze tool for every skill to get started!</p>
            <button
              onClick={() => setShowToolPopup(true)}
              style={{
                width: '100%',
                padding: '10px 16px',
                backgroundColor: '#4affd4',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#2ecc71'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = '#4affd4'; }}
            >
              Claim Free Tools
            </button>
          </div>
        )}
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

      {/* CLAIM TOOLS POPUP */}
      {showToolPopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1001
        }}
        onClick={() => setShowToolPopup(false)}
        >
          <div style={{
            backgroundColor: '#111920',
            border: '1px solid #2a3b4c',
            borderRadius: '10px',
            padding: 'clamp(14px, 2vw, 24px)',
            maxWidth: '480px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(8px, 1.5vw, 16px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: '#F1FAEE', margin: 0, fontSize: 'clamp(16px, 2.5vw, 20px)', textAlign: 'center' }}>🧰 Claim Your Starter Tools</h2>
            
            <div style={{ backgroundColor: '#0b1014', borderRadius: '8px', padding: 'clamp(10px, 1.5vw, 16px)', border: '1px solid #2a3b4c' }}>
              <h4 style={{ color: '#f1c40f', margin: '0 0 10px 0', fontSize: 'clamp(12px, 1.5vw, 14px)' }}>How do tools work?</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>⚒️</span>
                  <p style={{ color: '#c5d3df', margin: 0, fontSize: 'clamp(11px, 1.3vw, 12px)', lineHeight: '1.5' }}>
                    While skilling, every action has a chance to <strong style={{ color: '#4affd4' }}>drop a tool</strong> for that skill. Better tools give a speed bonus!
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>🔧</span>
                  <p style={{ color: '#c5d3df', margin: 0, fontSize: 'clamp(11px, 1.3vw, 12px)', lineHeight: '1.5' }}>
                    Tools can be <strong style={{ color: '#f1c40f' }}>upgraded</strong> by combining two of the same tier into the next tier. Bronze → Iron → Steel → Alloy → Apex → Nova.
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>🧰</span>
                  <p style={{ color: '#c5d3df', margin: 0, fontSize: 'clamp(11px, 1.3vw, 12px)', lineHeight: '1.5' }}>
                    Each skill has a <strong style={{ color: '#4affd4' }}>toolbox</strong> to store your tools. Upgrade your toolbox for <strong style={{ color: '#f1c40f' }}>extra slots</strong> to keep spare tools for future upgrades.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#1a3a2d', borderRadius: '8px', padding: '12px', border: '1px solid #208b76', textAlign: 'center' }}>
              <p style={{ color: '#4affd4', margin: '0 0 4px 0', fontSize: '13px', fontWeight: 'bold' }}>
                🎁 Claim 1 free Bronze tool for each skill!
              </p>
              <p style={{ color: '#7b95a6', margin: 0, fontSize: '11px' }}>
                Each tool will be placed in its respective skill toolbox automatically.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowToolPopup(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#2a3b4c',
                  color: '#c5d3df',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (claimAllTools) claimAllTools();
                  setShowToolPopup(false);
                  setShowCongratsPopup(true);
                }}
                style={{
                  flex: 2,
                  padding: '10px',
                  backgroundColor: '#4affd4',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2ecc71'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#4affd4'}
              >
                🧰 Claim Now!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONGRATS POPUP */}
      {showCongratsPopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1002
        }}
        onClick={() => setShowCongratsPopup(false)}
        >
          <div style={{
            backgroundColor: '#111920',
            border: '2px solid #4affd4',
            borderRadius: '12px',
            padding: 'clamp(16px, 2.5vw, 28px)',
            maxWidth: '340px',
            width: '85%',
            maxHeight: '90vh',
            textAlign: 'center',
            boxShadow: '0 0 40px rgba(74, 255, 212, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <span style={{ fontSize: '36px' }}>🎉</span>
            <h3 style={{ color: '#4affd4', margin: 0, fontSize: 'clamp(16px, 2.5vw, 20px)' }}>Congratulations!</h3>
            <p style={{ color: '#c5d3df', margin: 0, fontSize: 'clamp(12px, 1.5vw, 14px)', lineHeight: '1.6' }}>
              Your tools can be found in your <strong style={{ color: '#f1c40f' }}>Toolbox</strong>.<br />Happy skilling! ⛏️
            </p>
            <button
              onClick={() => setShowCongratsPopup(false)}
              style={{
                marginTop: '4px',
                padding: '10px 24px',
                backgroundColor: '#4affd4',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2ecc71'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4affd4'}
            >
              Let's go!
            </button>
          </div>
        </div>
      )}

      {/* COLLECTION LOG POPUP */}
      {showCollectionLog && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1001
        }}
        onClick={() => setShowCollectionLog(false)}
        >
          <div style={{
            backgroundColor: '#111920',
            border: '1px solid #2a3b4c',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '750px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #2a3b4c', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h2 style={{ color: '#F1FAEE', margin: 0, fontSize: '18px' }}>📜 Collection Log</h2>
              <button onClick={() => setShowCollectionLog(false)} style={{ background: 'none', border: 'none', color: '#7b95a6', fontSize: '22px', cursor: 'pointer', padding: '0 4px' }}>✕</button>
            </div>

            {/* Body: Left category list + Right detail */}
            <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {/* Left sidebar - Monster list by category */}
              <div style={{ width: '220px', minWidth: '180px', borderRight: '1px solid #2a3b4c', overflowY: 'auto', flexShrink: 0, padding: '8px 0' }}>
                {CATEGORY_ORDER.map(cat => {
                  const monsters = (monstersByCategory && monstersByCategory[cat]) || [];
                  if (monsters.length === 0) return null;
                  return (
                    <div key={cat} style={{ marginBottom: '4px' }}>
                      <div style={{
                        padding: '6px 14px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        color: CATEGORY_COLORS[cat] || '#7b95a6',
                        letterSpacing: '0.5px'
                      }}>
                        {cat}
                      </div>
                      {monsters.map(m => {
                        const stats = monsterStats[m.id];
                        const hasKills = stats && stats.kills > 0;
                        const isSelected = selectedMonster === m.id;
                        return (
                          <div
                            key={m.id}
                            onClick={() => setSelectedMonster(m.id)}
                            style={{
                              padding: '6px 14px 6px 20px',
                              fontSize: '13px',
                              cursor: 'pointer',
                              color: isSelected ? '#fff' : hasKills ? '#c5d3df' : '#4a5a6a',
                              backgroundColor: isSelected ? 'rgba(32, 139, 118, 0.3)' : 'transparent',
                              borderLeft: isSelected ? '3px solid #4affd4' : '3px solid transparent',
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <span>{m.name}</span>
                            {hasKills && <span style={{ fontSize: '10px', color: '#4affd4', fontWeight: 'bold' }}>{stats.kills}</span>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Right detail panel */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                {!selectedMonster ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#7b95a6', gap: '8px' }}>
                    <span style={{ fontSize: '32px' }}>📋</span>
                    <p style={{ margin: 0, fontSize: '14px' }}>Select a monster to view stats</p>
                  </div>
                ) : (() => {
                  if (!ACTIONS || !selectedMonster) return null;
                  const mData = ACTIONS[selectedMonster];
                  const stats = monsterStats[selectedMonster] || { kills: 0, loot: {}, timeMs: 0 };
                  if (!mData) return null;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Monster header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {mData.reward && ITEM_IMAGES[Object.keys(mData.reward)[0]] && (
                          <img src={ITEM_IMAGES[Object.keys(mData.reward)[0]]} alt={mData.name} style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
                        )}
                        <div>
                          <h3 style={{ color: '#fff', margin: '0 0 4px 0', fontSize: '18px' }}>{mData.name}</h3>
                          <span style={{ fontSize: '11px', color: CATEGORY_COLORS[mData.category] || '#7b95a6', textTransform: 'uppercase', fontWeight: 'bold' }}>
                            {mData.category}
                          </span>
                        </div>
                      </div>

                      {/* Stats overview */}
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 100px', backgroundColor: '#0b1014', borderRadius: '8px', padding: '12px', border: '1px solid #2a3b4c', textAlign: 'center' }}>
                          <div style={{ fontSize: '22px', color: '#4affd4', fontWeight: 'bold' }}>{stats.kills.toLocaleString()}</div>
                          <div style={{ fontSize: '11px', color: '#7b95a6', marginTop: '2px' }}>Total Kills</div>
                        </div>
                        <div style={{ flex: '1 1 100px', backgroundColor: '#0b1014', borderRadius: '8px', padding: '12px', border: '1px solid #2a3b4c', textAlign: 'center' }}>
                          <div style={{ fontSize: '22px', color: '#f1c40f', fontWeight: 'bold' }}>{formatTime(stats.timeMs)}</div>
                          <div style={{ fontSize: '11px', color: '#7b95a6', marginTop: '2px' }}>Total Time</div>
                        </div>
                        <div style={{ flex: '1 1 100px', backgroundColor: '#0b1014', borderRadius: '8px', padding: '12px', border: '1px solid #2a3b4c', textAlign: 'center' }}>
                          <div style={{ fontSize: '22px', color: '#e67e22', fontWeight: 'bold' }}>
                            {stats.kills > 0 ? (stats.timeMs / stats.kills / 1000).toFixed(1) + 's' : '-'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#7b95a6', marginTop: '2px' }}>Avg Kill Time</div>
                        </div>
                      </div>

                      {/* Loot received */}
                      <div>
                        <h4 style={{ color: '#c5d3df', margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid #2a3b4c', paddingBottom: '6px' }}>
                          🎒 Loot Received
                        </h4>
                        {Object.keys(stats.loot).length === 0 ? (
                          <p style={{ color: '#4a5a6a', fontSize: '13px', margin: 0 }}>No loot recorded yet.</p>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                            {Object.entries(stats.loot)
                              .sort(([, a], [, b]) => b - a)
                              .map(([itemKey, count]) => (
                                <div key={itemKey} style={{
                                  display: 'flex', alignItems: 'center', gap: '8px',
                                  backgroundColor: '#0b1014', borderRadius: '6px', padding: '8px 10px',
                                  border: '1px solid #1a2a3a'
                                }}>
                                  {ITEM_IMAGES[itemKey] ? (
                                    <img src={ITEM_IMAGES[itemKey]} alt={itemKey} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                  ) : (
                                    <span style={{ fontSize: '16px' }}>📦</span>
                                  )}
                                  <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontSize: '12px', color: '#c5d3df', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                      {itemKey.replace(/_/g, ' ')}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#4affd4', fontWeight: 'bold' }}>
                                      {count >= 1000 ? (count / 1000).toFixed(1) + 'k' : count.toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}