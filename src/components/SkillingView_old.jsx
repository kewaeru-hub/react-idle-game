import React, { useState, useEffect } from 'react';
import { PRAYER_BOOK, ITEM_IMAGES, TOOL_SKILLS, ITEMS, PETS } from '../data/gameData'; 
import { getRequiredXp } from '../utils/gameHelpers';

export default function SkillingView({ 
  screen, ACTIONS, skills, activeAction, startAction, startCombat, stopAction, getItemCount,
  quickPrayers, setQuickPrayers, getActualActionTime, progress, getRequiredXp, claimToolCallback, claimedTools = {},
  toolboxes = {}, upgradeToolbox, storeToolInBox, inventory = {}
}) {
  const screenActions = Object.entries(ACTIONS).filter(([k, v]) => v.skill === screen);

  const TABS = {
    combat: ['beginner', 'easy', 'moderate', 'hard', 'extreme', 'bosses'],
    cooking: ['fish', 'meat'],
    smithing: ['bars', 'weapons', 'armor'],
    infusion: ['scimitars', 'bows', 'staffs', 'tools'],
    crafting: ['ranged armor', 'magic armor', 'ammo'],
    prayer: ['burying', 'prayer_book'],
    farming: ['produce', 'herbs'],
    herblore: ['cleaning', 'brewing', 'super']
  };

  const screenTabs = TABS[screen] || [];
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    if (screenTabs.length > 0) setActiveTab(screenTabs[0]);
    else setActiveTab('');
  }, [screen]);

  const toggleQuickPrayer = (prayerId) => {
    if (quickPrayers.includes(prayerId)) {
      setQuickPrayers(prev => { let n = [...prev]; n[n.indexOf(prayerId)] = null; return n; });
    } else {
      if (!quickPrayers.includes(null)) { alert("Your Quick Bar is full! Click a prayer in your bar to remove it."); return; }
      setQuickPrayers(prev => { let n = [...prev]; n[n.indexOf(null)] = prayerId; return n; });
    }
  };

  const getCategory = (key, action) => {
    if (action.category) return action.category;
    if (screen === 'smithing') {
      if (key.includes('bar')) return 'bars';
      if (key.includes('helmet') || key.includes('body') || key.includes('legs')) return 'armor';
      return 'weapons';
    }
    if (screen === 'infusion') {
      if (key.includes('scimitar')) return 'scimitars';
      if (key.includes('bow')) return 'bows';
      if (key.includes('staff')) return 'staffs';
      if (key.includes('axe')) return 'tools';
      if (key.includes('rod')) return 'tools';
      if (key.includes('pickaxe')) return 'tools';
      if (key.includes('pan')) return 'tools';
      if (key.includes('hammer')) return 'tools';
      if (key.includes('needle')) return 'tools';
      if (key.includes('pestle')) return 'tools';
      if (key.includes('spade')) return 'tools';
      if (key.includes('sickle')) return 'tools';
      if (key.includes('lockpick')) return 'tools';
      if (key.includes('boots')) return 'tools';
      return 'armor';
    }
    if (screen === 'crafting') {
      if (key.includes('arrow')) return 'ammo';
      if (key.includes('hat') || key.includes('robe') || key.includes('skirt')) return 'magic armor';
      return 'ranged armor';
    }
    return 'general';
  };

// Filter de acties op basis van de geselecteerde tab
  const filteredActions = screenTabs.length > 0
    ? screenActions.filter(([k, v]) => {
        if (screen === 'prayer') return v.category === activeTab || (!v.category && activeTab === 'burying');
        if (screen === 'combat') {
          if (activeTab === 'bosses') return false; // Bosses zijn niet in ACTIONS
          return v.category === activeTab;
        }
        if (screen === 'cooking') return v.category === activeTab;
        return getCategory(k, v) === activeTab;
      })
    : screenActions;

  const displayActions = [...filteredActions].sort((a, b) => a[1].reqLvl - b[1].reqLvl);

// Huidige Skill Data
  const currentLevel = skills[screen]?.level || 1;
  const currentXp = Math.floor(skills[screen]?.xp || 0);
  
  // XP Benodigdheden
  const currentLevelStartXP = getRequiredXp ? getRequiredXp(currentLevel) : 0;
  const nextLevelTotalXP = getRequiredXp ? getRequiredXp(currentLevel + 1) : 100;

  // Hoeveel XP we in DIT specifieke level al hebben gehaald, en nog moeten halen
  const xpGainedThisLevel = Math.max(0, currentXp - currentLevelStartXP);
  const xpNeededThisLevel = nextLevelTotalXP - currentLevelStartXP;
  
  // De balk vult zich op basis van de voortgang binnen dit ene level
  const xpPercentage = Math.min(100, (xpGainedThisLevel / xpNeededThisLevel) * 100);

  // ==========================================
  // --- 1. SPECIALE PRAYER BOOK WEERGAVE ---
  // ==========================================
  if (screen === 'prayer' && activeTab === 'prayer_book') {
    return (
      <div style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', marginBottom: '20px', overflowX: 'auto', backgroundColor: '#111920', borderRadius: '4px', border: '1px solid #2a3b4c' }}>
          {screenTabs.map(tab => (
            <button
              key={tab} onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '12px 15px', backgroundColor: activeTab === tab ? '#208b76' : 'transparent',
                color: activeTab === tab ? 'white' : '#c5d3df', border: 'none', cursor: 'pointer',
                fontWeight: activeTab === tab ? 'bold' : 'normal', textTransform: 'capitalize', whiteSpace: 'nowrap'
              }}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="card" style={{ backgroundColor: '#152029', border: '1px solid #f1c40f', marginBottom: '20px' }}>
          <h3 style={{ color: '#f1c40f', margin: '0 0 10px 0', fontSize: '16px' }}>Your Quick Prayers</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            {quickPrayers.map((pid, idx) => {
              const pData = pid ? PRAYER_BOOK.find(p => p.id === pid) : null;
              return (
                <div key={idx} onClick={() => pid ? toggleQuickPrayer(pid) : null}
                  style={{ flex: 1, height: '60px', backgroundColor: '#111920', border: '1px dashed #2a3b4c', borderRadius: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: pid ? 'pointer' : 'default' }}
                >
                  {pData ? <><span style={{ fontSize: '20px' }}>{pData.icon}</span><span style={{ fontSize: '11px', color: '#4affd4', fontWeight: 'bold' }}>{pData.name.split(' ')[0]}</span></> : <span style={{ color: '#556b7a', fontSize: '12px' }}>Empty Slot</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {PRAYER_BOOK.map(prayer => {
            const hasLevel = currentLevel >= prayer.reqLvl;
            const isSelected = quickPrayers.includes(prayer.id);
            return (
              <div key={prayer.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: hasLevel ? 1 : 0.5, backgroundColor: isSelected ? '#1a2b25' : '#202a33', border: isSelected ? '1px solid #2ecc71' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ fontSize: '24px', backgroundColor: '#111920', padding: '10px', borderRadius: '8px' }}>{hasLevel ? prayer.icon : '🔒'}</div>
                  <div>
                    <strong style={{ color: hasLevel ? 'white' : '#7b95a6' }}>{prayer.name}</strong>
                    <div style={{ fontSize: '12px', color: '#7b95a6', marginTop: '4px' }}><span style={{ color: '#4affd4' }}>{prayer.desc}</span> | Drain: {(prayer.drain / 0.6).toFixed(1)}/sec</div>
                  </div>
                </div>
                {hasLevel && <button className={isSelected ? "btn-stop" : "btn-action"} onClick={() => toggleQuickPrayer(prayer.id)} style={{ minWidth: '90px' }}>{isSelected ? 'Remove' : 'Add'}</button>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // --- 2. DE NIEUWE MELVOR-STYLE WEERGAVE ---
  // ==========================================

  // Render toolbox panel
  const toolboxPanel = TOOL_SKILLS[screen] && (() => {
    const TOOLBOX_LEVELS = [
      { maxTierIndex: 1, slotCount: 1, label: 'Bronze – Iron',  upgradeCost: 1 },
      { maxTierIndex: 2, slotCount: 1, label: 'Bronze – Steel', upgradeCost: 1 },
      { maxTierIndex: 3, slotCount: 2, label: 'Bronze – Alloy', upgradeCost: 1 },
      { maxTierIndex: 4, slotCount: 3, label: 'Bronze – Apex',  upgradeCost: 1 },
      { maxTierIndex: 5, slotCount: 4, label: 'Bronze – Nova',  upgradeCost: null },
    ];

    const skillData = TOOL_SKILLS[screen];
    const box = toolboxes[screen];
    const isClaimed = claimedTools[screen];

    // UNCLAIMED: Show claim banner
    if (!isClaimed) {
      return (
        <div style={{ backgroundColor: '#1a3a2d', border: '2px solid #4affd4', borderRadius: '6px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ color: '#4affd4', margin: '0 0 4px 0', fontSize: '13px' }}>🧰 Free Tool Claim</h4>
            <p style={{ color: '#7b95a6', margin: 0, fontSize: '11px' }}>Claim a free bronze {skillData.name} tool</p>
          </div>
          <button
            onClick={() => claimToolCallback && claimToolCallback(screen)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4affd4',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '12px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2dd9b8'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#4affd4'}
          >
            Claim Now
          </button>
        </div>
      );
    }

    // CLAIMED: Show toolbox panel
    const level = box?.level || 0;
    const levelData = TOOLBOX_LEVELS[level];
    const slots = box?.slots || [null];
    const isMaxLevel = level >= 4;
    const upgradeCost = levelData.upgradeCost;
    const canAffordUpgrade = !isMaxLevel && (inventory.coins || 0) >= (upgradeCost || 0);
    const bronzeToolId = skillData.tiers[0];
    const petId = `${screen}_pet`;
    const petData = PETS[petId];

    return (
      <div style={{
        backgroundColor: '#111920',
        border: '1px solid #2a3b4c',
        borderRadius: '6px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Toolbox Header */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: 'var(--text-primary)', margin: '0', fontSize: '14px' }}>
              🧰 Toolbox
            </h3>
            <span style={{ color: '#7b95a6', fontSize: '11px', fontWeight: 'normal' }}>
              Lv. {level}{isMaxLevel ? ' (MAX)' : ''}
            </span>
          </div>

          {/* Upgrade Button */}
          {!isMaxLevel && (
            <button
              onClick={() => upgradeToolbox && upgradeToolbox(screen)}
              disabled={!canAffordUpgrade}
              style={{
                padding: '4px 8px',
                backgroundColor: canAffordUpgrade ? '#f1c40f' : '#2a3b4c',
                color: canAffordUpgrade ? '#000' : '#556b7a',
                border: 'none',
                borderRadius: '4px',
                cursor: canAffordUpgrade ? 'pointer' : 'default',
                fontWeight: 'bold',
                fontSize: '10px',
                whiteSpace: 'nowrap'
              }}
            >
              ⬆ Up
            </button>
          )}
        </div>
        <p style={{ color: '#7b95a6', margin: '0', fontSize: '10px' }}>
          {levelData.label}
        </p>

        {/* Toolbox Slots */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
          {slots.map((storedToolId, idx) => {
            const toolItem = storedToolId ? ITEMS[storedToolId] : null;
            const toolImg = storedToolId ? ITEM_IMAGES[storedToolId] : null;

            return (
              <div
                key={idx}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  backgroundColor: '#0b1014',
                  border: storedToolId ? '1px solid #208b76' : '1px dashed #2a3b4c',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  cursor: 'default'
                }}
                title={toolItem ? `${toolItem.name}\n+${((Object.values(toolItem.speedBoosts || {})[0] || 0) * 100).toFixed(0)}% speed` : 'Empty Slot'}
              >
                {storedToolId ? (
                  <>
                    {toolImg ? (
                      <img src={toolImg} alt={toolItem?.name} style={{ maxWidth: '32px', maxHeight: '32px', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '18px' }}>{skillData.icon}</span>
                    )}
                    <span style={{ fontSize: '8px', color: '#4affd4', fontWeight: 'bold', marginTop: '2px', textAlign: 'center' }}>
                      {toolItem?.name?.split(' ')[0]}
                    </span>
                  </>
                ) : (
                  <span style={{ color: '#556b7a', fontSize: '16px' }}>+</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Tools in inventory that can be stored */}
        {(() => {
          const allowedTierMax = levelData.maxTierIndex;
          const availableTools = skillData.tiers
            .filter((tid, tierIdx) => tierIdx <= allowedTierMax && (inventory[tid] || 0) > 0)
            .map(tid => ({ id: tid, item: ITEMS[tid], count: inventory[tid] || 0 }));

          const emptySlotIdx = slots.findIndex(s => s === null);

          if (availableTools.length === 0 || emptySlotIdx === -1) return null;

          return (
            <div>
              <p style={{ color: '#7b95a6', fontSize: '9px', margin: '0 0 4px 0' }}>From inventory:</p>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {availableTools.map(t => (
                  <button
                    key={t.id}
                    onClick={() => storeToolInBox && storeToolInBox(screen, emptySlotIdx, t.id)}
                    style={{
                      padding: '3px 6px',
                      backgroundColor: '#1a2b25',
                      border: '1px solid #208b76',
                      borderRadius: '3px',
                      color: '#4affd4',
                      fontSize: '9px',
                      cursor: 'pointer'
                    }}
                    title={`${t.item?.name} (x${t.count})`}
                  >
                    {t.item?.name?.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Rare Drops */}
        <div style={{ borderTop: '1px solid #2a3b4c', paddingTop: '8px', display: 'flex', gap: '8px', justifyContent: 'space-around' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            {ITEM_IMAGES[bronzeToolId] ? (
              <img src={ITEM_IMAGES[bronzeToolId]} alt="Bronze Tool" style={{ width: '28px', height: '28px', objectFit: 'contain', opacity: 0.7 }} />
            ) : (
              <span style={{ fontSize: '20px', opacity: 0.7 }}>{skillData.icon}</span>
            )}
            <span style={{ fontSize: '8px', color: 'var(--text-primary)', fontWeight: 'bold' }}>&lt;0.01%</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            {ITEM_IMAGES[petId] ? (
              <img src={ITEM_IMAGES[petId]} alt={petData?.name || 'Pet'} style={{ width: '28px', height: '28px', objectFit: 'contain', opacity: 0.7 }} />
            ) : (
              <span style={{ fontSize: '20px', opacity: 0.7 }}>🐾</span>
            )}
            <span style={{ fontSize: '8px', color: 'var(--text-primary)', fontWeight: 'bold' }}>&lt;0.01%</span>
          </div>
        </div>
      </div>
    );
  })();

  return (
    <div style={{ marginTop: '0px', display: 'flex', gap: '20px' }}>
      
      {/* LEFT SIDE: Main content */}
      <div style={{ flex: 1 }}>
        {/* HEADER (Level & XP Bar) */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
            <h1 style={{ margin: 0, textTransform: 'capitalize', fontSize: '24px', color: '#fff' }}>{screen}</h1>
            <span style={{ fontSize: '16px', color: '#c5d3df' }}>Level: <strong style={{color: '#fff'}}>{currentLevel}</strong></span>
          <span style={{ fontSize: '14px', color: '#c5d3df' }}>Experience: <strong style={{color: '#fff'}}>{currentXp.toLocaleString()}</strong> / {nextLevelTotalXP.toLocaleString()}</span>
        </div>
          
          {/* Dunne groene XP balk bovenaan */}
          <div style={{ height: '12px', backgroundColor: '#111920', borderRadius: '6px', overflow: 'hidden', border: '1px solid #2a3b4c' }}>
            <div style={{ width: `${xpPercentage}%`, height: '100%', backgroundColor: '#4affd4', transition: 'width 0.3s ease-in-out' }}></div>
          </div>
        </div>
                  <h3 style={{ color: '#4affd4', margin: '0 0 5px 0' }}>🎁 Claim Your {skillData.name}</h3>
                  <p style={{ color: '#c5d3df', margin: 0, fontSize: '13px' }}>
                    Get a free Iron {skillData.name} to boost your {screen} speed by 4%!
                  </p>
                </div>
                <button
                  onClick={() => claimToolCallback && claimToolCallback(screen)}
                  style={{
                    padding: '10px 25px',
                    backgroundColor: '#4affd4',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    marginLeft: '15px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2dd9b8'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#4affd4'}
                >
                  Claim Now
                </button>
              </div>
            );
          }

          // CLAIMED: Show toolbox panel
          const level = box?.level || 0;
          const levelData = TOOLBOX_LEVELS[level];
          const slots = box?.slots || [null];
          const isMaxLevel = level >= 4;
          const upgradeCost = levelData.upgradeCost;
          const canAffordUpgrade = !isMaxLevel && (inventory.coins || 0) >= (upgradeCost || 0);
          const bronzeToolId = skillData.tiers[0]; // bronze tool for drop preview
          const petId = `${screen}_pet`;
          const petData = PETS[petId];

          // Render toolbox panel
          const toolboxPanel = (
            <div style={{
              backgroundColor: '#111920',
              border: '1px solid #2a3b4c',
              borderRadius: '6px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              minWidth: '180px'
            }}>
              {/* Toolbox Header */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ color: 'var(--text-primary)', margin: '0', fontSize: '14px' }}>
                    🧰 Toolbox
                  </h3>
                  <span style={{ color: '#7b95a6', fontSize: '11px', fontWeight: 'normal' }}>
                    Lv. {level}{isMaxLevel ? ' (MAX)' : ''}
                  </span>
                </div>

                {/* Upgrade Button */}
                {!isMaxLevel && (
                  <button
                    onClick={() => upgradeToolbox && upgradeToolbox(screen)}
                    disabled={!canAffordUpgrade}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: canAffordUpgrade ? '#f1c40f' : '#2a3b4c',
                      color: canAffordUpgrade ? '#000' : '#556b7a',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: canAffordUpgrade ? 'pointer' : 'default',
                      fontWeight: 'bold',
                      fontSize: '10px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    ⬆ Up
                  </button>
                )}
              </div>
              <p style={{ color: '#7b95a6', margin: '0', fontSize: '10px' }}>
                {levelData.label}
              </p>

              {/* Toolbox Slots */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {slots.map((storedToolId, idx) => {
                  const toolItem = storedToolId ? ITEMS[storedToolId] : null;
                  const toolImg = storedToolId ? ITEM_IMAGES[storedToolId] : null;

                  return (
                    <div
                      key={idx}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        backgroundColor: '#0b1014',
                        border: storedToolId ? '1px solid #208b76' : '1px dashed #2a3b4c',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        cursor: 'default'
                      }}
                      title={toolItem ? `${toolItem.name}\n+${((Object.values(toolItem.speedBoosts || {})[0] || 0) * 100).toFixed(0)}% speed` : 'Empty Slot'}
                    >
                      {storedToolId ? (
                        <>
                          {toolImg ? (
                            <img src={toolImg} alt={toolItem?.name} style={{ maxWidth: '32px', maxHeight: '32px', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ fontSize: '18px' }}>{skillData.icon}</span>
                          )}
                          <span style={{ fontSize: '8px', color: '#4affd4', fontWeight: 'bold', marginTop: '2px', textAlign: 'center' }}>
                            {toolItem?.name?.split(' ')[0]}
                          </span>
                        </>
                      ) : (
                        <span style={{ color: '#556b7a', fontSize: '16px' }}>+</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Tools in inventory that can be stored */}
              {(() => {
                const allowedTierMax = levelData.maxTierIndex;
                const availableTools = skillData.tiers
                  .filter((tid, tierIdx) => tierIdx <= allowedTierMax && (inventory[tid] || 0) > 0)
                  .map(tid => ({ id: tid, item: ITEMS[tid], count: inventory[tid] || 0 }));

                const emptySlotIdx = slots.findIndex(s => s === null);

                if (availableTools.length === 0 || emptySlotIdx === -1) return null;

                return (
                  <div>
                    <p style={{ color: '#7b95a6', fontSize: '9px', margin: '0 0 4px 0' }}>From inventory:</p>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {availableTools.map(t => (
                        <button
                          key={t.id}
                          onClick={() => storeToolInBox && storeToolInBox(screen, emptySlotIdx, t.id)}
                          style={{
                            padding: '3px 6px',
                            backgroundColor: '#1a2b25',
                            border: '1px solid #208b76',
                            borderRadius: '3px',
                            color: '#4affd4',
                            fontSize: '9px',
                            cursor: 'pointer'
                          }}
                          title={`${t.item?.name} (x${t.count})`}
                        >
                          {t.item?.name?.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Rare Drops */}
              <div style={{ borderTop: '1px solid #2a3b4c', paddingTop: '8px', display: 'flex', gap: '8px', justifyContent: 'space-around' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  {ITEM_IMAGES[bronzeToolId] ? (
                    <img src={ITEM_IMAGES[bronzeToolId]} alt="Bronze Tool" style={{ width: '28px', height: '28px', objectFit: 'contain', opacity: 0.7 }} />
                  ) : (
                    <span style={{ fontSize: '20px', opacity: 0.7 }}>{skillData.icon}</span>
                  )}
                  <span style={{ fontSize: '8px', color: 'var(--text-primary)', fontWeight: 'bold' }}>&lt;0.01%</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  {ITEM_IMAGES[petId] ? (
                    <img src={ITEM_IMAGES[petId]} alt={petData?.name || 'Pet'} style={{ width: '28px', height: '28px', objectFit: 'contain', opacity: 0.7 }} />
                  ) : (
                    <span style={{ fontSize: '20px', opacity: 0.7 }}>🐾</span>
                  )}
                  <span style={{ fontSize: '8px', color: 'var(--text-primary)', fontWeight: 'bold' }}>&lt;0.01%</span>
                </div>
              </div>
            </div>
          );
        })();

        {/* TABS */}
        {screenTabs.length > 0 && (
          <div style={{ display: 'flex', marginBottom: '20px', overflowX: 'auto', backgroundColor: '#111920', borderRadius: '4px', border: '1px solid #2a3b4c' }}>
            {screenTabs.map(tab => (
              <button
                key={tab} onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: '12px 15px', backgroundColor: activeTab === tab ? '#208b76' : 'transparent', 
                  color: activeTab === tab ? 'white' : '#c5d3df', border: 'none', cursor: 'pointer',
                  fontWeight: activeTab === tab ? 'bold' : 'normal', textTransform: 'capitalize', whiteSpace: 'nowrap'
                }}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}      {/* AGILITY DODGE INFO */}
      {screen === 'agility' && (
        <div className="card" style={{ backgroundColor: '#1a2520', border: '1px solid #208b76', padding: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ color: '#4affd4', margin: '0 0 5px 0' }}>⚡ Dodge Chance</h4>
            <p style={{ color: '#c5d3df', margin: 0, fontSize: '13px' }}>
              You gain <strong style={{ color: '#f1c40f' }}>0.2%</strong> dodge chance per Agility level.
            </p>
          </div>
          <div style={{ textAlign: 'center', backgroundColor: '#111920', padding: '10px 20px', borderRadius: '8px', border: '1px solid #2a3b4c' }}>
            <div style={{ color: '#f1c40f', fontSize: '24px', fontWeight: 'bold' }}>{(currentLevel * 0.2).toFixed(1)}%</div>
            <div style={{ color: '#7b95a6', fontSize: '11px' }}>Current Dodge</div>
          </div>
        </div>
      )}

      {/* BOSSES TAB SPECIAL VIEW */}
      {screen === 'combat' && activeTab === 'bosses' && (
        <div style={{ marginTop: '10px' }}>
          <div className="card lava-cave-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <h2 style={{ color: '#f39c12', margin: '0 0 15px 0', fontSize: '24px' }}>🔥 LAVA CAVE</h2>
            <p style={{ color: '#c5d3df', marginBottom: '10px' }}>Face waves of increasingly powerful enemies. Can you survive all 15 waves?</p>
            <p style={{ color: '#7b95a6', fontSize: '14px', margin: '0 0 15px 0' }}>
              Enemies: Blub, Archer, Mage, Zak | Difficulty: Hard
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-action btn-lava-cave" onClick={() => startCombat('lava_cave')} style={{ padding: '15px 30px', fontSize: '16px', fontWeight: 'bold', width: '25%', backgroundColor: '#f39c12', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#e67e22'} onMouseLeave={(e) => e.target.style.backgroundColor = '#f39c12'}>
                🔥 Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIE GRID */}
      {screen === 'combat' && activeTab === 'bosses' ? null : displayActions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#111920', borderRadius: '6px', border: '1px dashed #2a3b4c' }}>
          <p style={{ color: '#7b95a6', margin: 0 }}>This category is currently empty.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' }}>
          {displayActions.map(([id, data]) => {
            const hasLevel = currentLevel >= data.reqLvl;
            const isActive = activeAction === id;
            
            // Zoek welk item deze actie oplevert voor de Qty counter
            const rewardKey = data.reward ? Object.keys(data.reward)[0] : null;
            const qty = rewardKey ? getItemCount(rewardKey) : 0;
            const actionTimeSecs = getActualActionTime ? (getActualActionTime(id) / 1000).toFixed(1) : ((data.baseTime || 1800) / 1000).toFixed(1);

            return (
          <div 
            key={id} 
            onClick={() => {
              if (!hasLevel) return;

              // Check of we materialen hebben (als de actie kosten heeft)
              const hasResources = !data.cost || Object.entries(data.cost).every(([k, v]) => getItemCount(k) >= v);

              if (isActive) {
                stopAction();
              } else {
                if (!hasResources) {
                  // Optioneel: alert("You don't have the required materials!");
                  return; 
                }
                data.skill === 'combat' ? startCombat(id) : startAction(id);
              }
            }}
            style={{ 
              position: 'relative',
              borderRadius: '6px',
              padding: '20px 15px 30px 15px',
              textAlign: 'center',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '160px',
              transition: 'all 0.3s ease',
              
              // 1. ACHTERGROND
              backgroundColor: isActive 
                ? '#163231' // Actief groen
                : !hasLevel 
                  ? '#0b1014' // Locked
                  : getItemCount(rewardKey) >= 0 && (!data.cost || Object.entries(data.cost).every(([k, v]) => getItemCount(k) >= v))
                    ? '#111920' // Beschikbaar
                    : '#1a1010', // Geen resources (donkerrood tintje)

              // 2. BORDER & GLOED (Box Shadow)
              border: isActive 
                ? '1px solid #4affd4' 
                : !hasLevel 
                  ? '1px solid #2a3b4c' 
                  : Object.entries(data.cost || {}).every(([k, v]) => getItemCount(k) >= v)
                    ? '1px solid #208b76' // Beschikbaar border
                    : '1px solid #b33a3a', // Geen resources border

              boxShadow: isActive 
                ? '0 0 10px rgba(74, 255, 212, 0.2)' 
                : (hasLevel && data.cost && !Object.entries(data.cost).every(([k, v]) => getItemCount(k) >= v))
                  ? 'inset 0 0 15px rgba(231, 76, 60, 0.15)' // Subtiele rode gloed binnenin als resources op zijn
                  : 'none',

              // 3. INTERACTIE
              cursor: (hasLevel && (!data.cost || Object.entries(data.cost).every(([k, v]) => getItemCount(k) >= v))) ? 'pointer' : 'default',
              opacity: hasLevel ? 1 : 0.7 // Alleen te laag level maken we echt een beetje dof
            }}
              >
                {/* LOCKED OVERLAY */}
                {!hasLevel && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(11, 16, 20, 0.85)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    zIndex: 10
                  }}>
                    <span style={{ color: '#c5d3df', fontSize: '13px', fontWeight: 'bold' }}>Task unlocks at</span>
                    <span style={{ color: '#4affd4', fontSize: '18px', fontWeight: 'bold' }}>level {data.reqLvl}</span>
                  </div>
                )}

                {/* KAART INHOUD */}
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#fff' }}>{data.name}</h3>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#7b95a6' }}>Level requirement: {data.reqLvl}</p>
                <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#c5d3df' }}>
                  {data.xp} XP / {actionTimeSecs} Seconds
                </p>

                {/* ICOON (Afbeelding of Emoji) */}
                <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', filter: hasLevel ? 'none' : 'grayscale(100%) opacity(0.5)' }}>
                  {rewardKey && ITEM_IMAGES[rewardKey] ? (
                    <img src={ITEM_IMAGES[rewardKey]} alt={rewardKey} style={{ maxHeight: '80px', maxWidth: '80px', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '32px' }}>
                      {data.skill === 'mining' ? '🪨' : data.skill === 'woodcutting' ? '🌲' : data.skill === 'fishing' ? '🐟' : data.skill === 'smithing' ? '🔨' : data.skill === 'crafting' ? '🎨' : '📦'}
                    </span>
                  )}
                </div>

                {/* QTY COUNTER */}
                {rewardKey && (
                  <div style={{ position: 'absolute', bottom: '15px', right: '15px', fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>
                    Qty: {qty >= 1000 ? (qty/1000).toFixed(1) + 'k' : qty}
                  </div>
                )}

                {/* KOSTEN (Als het crafting/smithing is) - toon kleine icons met aantallen */}
                {data.cost && (
                  <div style={{ position: 'absolute', bottom: '12px', left: '4px', display: 'flex', gap: '1px', alignItems: 'center' }}>
                    {Object.entries(data.cost).map(([cKey, cVal]) => {
                      const img = ITEM_IMAGES[cKey];
                      const available = getItemCount(cKey);
                      const hasEnough = available >= cVal;
                      return (
                        <div key={cKey} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px', position: 'relative' }}>
                          <div style={{ position: 'relative', width: '36px', height: '28px' }}>
                            {/* Required qty - small, overlapping, semi-transparent */}
                            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.55)', padding: '2px 6px', borderRadius: '6px', fontSize: '11px', color: hasEnough ? '#2ecc71' : '#e74c3c', zIndex: 3 }}>
                              {cVal}x
                            </div>

                            <div style={{ width: '36px', height: '28px', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${hasEnough ? '#2ecc71' : '#b33a3a'}`, background: '#0b1014' }}>
                              {img ? (
                                <img src={img} alt={cKey} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
                              ) : (
                                <span style={{ fontSize: '14px', color: hasEnough ? '#2ecc71' : '#b33a3a' }}>{cKey.replace(/_/g,' ').slice(0,3)}</span>
                              )}
                            </div>

                            {/* Available qty badge (bottom-right of the image) */}
                            <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', fontSize: '10px', background: 'rgba(0,0,0,0.6)', padding: '2px 5px', borderRadius: '6px', color: '#4affd4', fontWeight: 'bold', zIndex: 4 }}>
                              {available >= 1000 ? (available / 1000).toFixed(1) + 'k' : available}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* RODE ACTIE PROGRESS BALK (Onderin) */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '8px', backgroundColor: '#0b1014' }}>
                  <div style={{ 
                    width: isActive ? `${progress}%` : '0%', 
                    height: '100%', 
                    backgroundColor: '#2ecc71', 
                    transition: isActive && progress > 5 ? 'width 0.1s linear' : 'none' 
                  }}></div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}