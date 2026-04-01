import React, { useState, useEffect } from 'react';
import { PRAYER_BOOK, ITEM_IMAGES, TOOL_SKILLS, ITEMS, PETS } from '../data/gameData'; 
import { getRequiredXp } from '../utils/gameHelpers';
import ItemTooltip from './ItemTooltip';

export default function SkillingView({ 
  screen, ACTIONS, skills, activeAction, startAction, startCombat, stopAction, getItemCount,
  quickPrayers, setQuickPrayers, getActualActionTime, progress, getRequiredXp, claimToolCallback, claimedTools = {},
  toolboxes = {}, upgradeToolbox, storeToolInBox, inventory = {}, toggleEquip, equipment = {}, equipToolFromBox,
  infuseTool
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedToolForUpgrade, setSelectedToolForUpgrade] = useState(null);
  const [showEquipPopup, setShowEquipPopup] = useState(false);
  const [dontShowEquipPopup, setDontShowEquipPopup] = useState(() => {
    try { return localStorage.getItem('dontShowEquipPopup') === 'true'; } catch { return false; }
  });

  useEffect(() => {
    if (screenTabs.length > 0) setActiveTab(screenTabs[0]);
    else setActiveTab('');
    setShowUpgradeModal(false);
    setSelectedToolForUpgrade(null);
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
      if (key.includes('axe') || key.includes('rod') || key.includes('pickaxe') || key.includes('pan') || 
          key.includes('hammer') || key.includes('needle') || key.includes('pestle') || key.includes('spade') || 
          key.includes('sickle') || key.includes('lockpick') || key.includes('boots')) return 'tools';
      return 'armor';
    }
    if (screen === 'crafting') {
      if (key.includes('arrow')) return 'ammo';
      if (key.includes('hat') || key.includes('robe') || key.includes('skirt')) return 'magic armor';
      return 'ranged armor';
    }
    return 'general';
  };

  const filteredActions = screenTabs.length > 0
    ? screenActions.filter(([k, v]) => {
        if (screen === 'prayer') return v.category === activeTab || (!v.category && activeTab === 'burying');
        if (screen === 'combat') {
          if (activeTab === 'bosses') return false;
          return v.category === activeTab;
        }
        if (screen === 'cooking') return v.category === activeTab;
        return getCategory(k, v) === activeTab;
      })
    : screenActions;

  const displayActions = [...filteredActions].sort((a, b) => a[1].reqLvl - b[1].reqLvl);

  const currentLevel = skills[screen]?.level || 1;
  const currentXp = Math.floor(skills[screen]?.xp || 0);
  const currentLevelStartXP = getRequiredXp ? getRequiredXp(currentLevel) : 0;
  const nextLevelTotalXP = getRequiredXp ? getRequiredXp(currentLevel + 1) : 100;
  const xpGainedThisLevel = Math.max(0, currentXp - currentLevelStartXP);
  const xpNeededThisLevel = nextLevelTotalXP - currentLevelStartXP;
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
  // --- 2. TOOLBOX PANEL (Rechts) ---
  // ==========================================
  const renderToolboxPanel = () => {
    if (!TOOL_SKILLS[screen]) return null;

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

    if (!isClaimed) {
      return (
        <div style={{ backgroundColor: '#1a3a2d', border: '2px solid #4affd4', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px', height: 'fit-content' }}>
          <h4 style={{ color: '#4affd4', margin: '0', fontSize: '13px' }}>🧰 Free Tool</h4>
          <p style={{ color: '#7b95a6', margin: 0, fontSize: '11px' }}>Claim a free bronze {skillData.name} tool</p>
          <button
            onClick={() => claimToolCallback && claimToolCallback(screen)}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#4affd4',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '11px'
            }}
          >
            Claim
          </button>
        </div>
      );
    }

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
      <div className="toolbox-panel" style={{
        backgroundColor: '#111920',
        border: '1px solid #2a3b4c',
        borderRadius: '6px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: '180px',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: 'var(--text-primary)', margin: '0', fontSize: '14px' }}>🧰 Toolbox</h3>
            <span style={{ color: '#7b95a6', fontSize: '11px' }}>Lv. {level}{isMaxLevel ? ' (MAX)' : ''}</span>
          </div>
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
        <p style={{ color: '#7b95a6', margin: '0', fontSize: '10px' }}>{levelData.label}</p>

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

        {/* Equip Tool Button - verborgen als autoToolboxUpgrade gekocht */}
        {!inventory.autoToolboxUpgrade && (() => {
          const slots = toolboxes[screen]?.slots || [];
          const bestTool = slots.reduce((best, toolId) => {
            if (!toolId || !ITEMS[toolId]?.speedBoosts?.[screen]) return best;
            const boost = ITEMS[toolId].speedBoosts[screen];
            if (!best || boost > (ITEMS[best]?.speedBoosts?.[screen] || 0)) return toolId;
            return best;
          }, null);
          if (!bestTool) return null;

          const bestToolBoost = ITEMS[bestTool]?.speedBoosts?.[screen] || 0;
          const equippedBoost = equipment?.tool ? (ITEMS[equipment.tool]?.speedBoosts?.[screen] || 0) : 0;
          const alreadyBestOrBetter = equippedBoost >= bestToolBoost && equippedBoost > 0;

          return (
            <button
              onClick={() => {
                if (!dontShowEquipPopup) {
                  setShowEquipPopup(true);
                }
                if (equipToolFromBox && bestTool && !alreadyBestOrBetter) {
                  equipToolFromBox(screen, bestTool);
                }
              }}
              disabled={alreadyBestOrBetter}
              style={{
                padding: '6px 10px',
                backgroundColor: alreadyBestOrBetter ? '#2a3b4c' : '#208b76',
                color: alreadyBestOrBetter ? '#556b7a' : '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: alreadyBestOrBetter ? 'default' : 'pointer',
                fontWeight: 'bold',
                fontSize: '11px',
                width: '100%'
              }}
            >
              {alreadyBestOrBetter ? '✓ Tool Equipped' : '⚔️ Equip Best Tool'}
            </button>
          );
        })()}

        {/* Upgrade Tool Button */}
        {skillData.tiers.length > 1 && (
          <button
            onClick={() => setShowUpgradeModal(true)}
            style={{
              padding: '6px 10px',
              backgroundColor: '#f1c40f',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '11px',
              width: '100%'
            }}
          >
            🔧 Upgrade Tool
          </button>
        )}

        <div className="toolbox-droprate-row" style={{ borderTop: '1px solid #2a3b4c', paddingTop: '8px', display: 'flex', gap: '8px', justifyContent: 'space-around' }}>
          <div className="toolbox-droprate-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            {ITEM_IMAGES[bronzeToolId] ? (
              <img className="toolbox-droprate-img" src={ITEM_IMAGES[bronzeToolId]} alt="Bronze Tool" style={{ width: '36px', height: '36px', objectFit: 'contain', opacity: 0.7 }} />
            ) : (
              <span style={{ fontSize: '24px', opacity: 0.7 }}>{skillData.icon}</span>
            )}
            <span style={{ fontSize: '8px', color: 'var(--text-primary)', fontWeight: 'bold' }}>&lt;0.01%</span>
          </div>

          <div className="toolbox-droprate-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            {ITEM_IMAGES[petId] ? (
              <img className="toolbox-droprate-img" src={ITEM_IMAGES[petId]} alt={petData?.name || 'Pet'} style={{ width: '36px', height: '36px', objectFit: 'contain', opacity: 0.7 }} />
            ) : (
              <span style={{ fontSize: '24px', opacity: 0.7 }}>🐾</span>
            )}
            <span style={{ fontSize: '8px', color: 'var(--text-primary)', fontWeight: 'bold' }}>&lt;0.001%</span>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // --- 3. DE NIEUWE MELVOR-STYLE WEERGAVE ---
  // ==========================================
  return (
    <div className="skilling-layout" style={{ marginTop: '0px', display: 'flex', gap: '20px' }}>
      
      {/* LEFT SIDE: Main content */}
      <div className="skilling-content" style={{ flex: 1 }}>
        {/* HEADER (Level & XP Bar) */}
        <div className="skilling-header" style={{ marginBottom: '25px' }}>
          <div className="skilling-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
            <h1 className="skilling-title" style={{ margin: 0, textTransform: 'capitalize', fontSize: '24px', color: '#fff' }}>{screen}</h1>
            <span className="skilling-level" style={{ fontSize: '16px', color: '#c5d3df' }}>Level: <strong style={{color: '#fff'}}>{currentLevel}</strong></span>
            <span className="skilling-xp" style={{ fontSize: '14px', color: '#c5d3df' }}>Experience: <strong style={{color: '#fff'}}>{currentXp.toLocaleString()}</strong> / {nextLevelTotalXP.toLocaleString()}</span>
          </div>
          <div className="skilling-xp-bar" style={{ height: '12px', backgroundColor: '#111920', borderRadius: '6px', overflow: 'hidden', border: '1px solid #2a3b4c' }}>
            <div style={{ width: `${xpPercentage}%`, height: '100%', backgroundColor: '#4affd4', transition: 'width 0.3s ease-in-out' }}></div>
          </div>
        </div>

        {/* TABS */}
        {screenTabs.length > 0 && (
          <div className="skilling-tabs" style={{ display: 'flex', marginBottom: '20px', overflowX: 'auto', backgroundColor: '#111920', borderRadius: '4px', border: '1px solid #2a3b4c' }}>
            {screenTabs.map(tab => (
              <button
                key={tab} onClick={() => setActiveTab(tab)}
                className="skilling-tab-btn"
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
        )}

        {/* AGILITY DODGE INFO */}
        {screen === 'agility' && (
          <div className="card" style={{ backgroundColor: '#1a2520', border: '1px solid #208b76', padding: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ color: '#4affd4', margin: '0 0 5px 0' }}>⚡ Dodge Chance</h4>
              <p style={{ color: '#c5d3df', margin: 0, fontSize: '13px' }}>You gain <strong style={{ color: '#f1c40f' }}>0.2%</strong> dodge chance per Agility level.</p>
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
              <p style={{ color: '#7b95a6', fontSize: '14px', margin: '0 0 15px 0' }}>Enemies: Blub, Archer, Mage, Zak | Difficulty: Hard</p>
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
          <div className="skilling-action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' }}>
            {displayActions.map(([id, data]) => {
              const hasLevel = currentLevel >= data.reqLvl;
              const isActive = activeAction === id;
              const rewardKey = data.reward ? Object.keys(data.reward)[0] : null;
              const qty = rewardKey ? getItemCount(rewardKey) : 0;
              const actionTimeSecs = getActualActionTime ? (getActualActionTime(id) / 1000).toFixed(1) : ((data.baseTime || 1800) / 1000).toFixed(1);

              return (
          <div 
            key={id}
            className="skilling-action-card"
            onClick={() => {
              if (!hasLevel) return;
              const hasResources = !data.cost || Object.entries(data.cost).every(([k, v]) => getItemCount(k) >= v);
              if (isActive) {
                stopAction();
              } else {
                if (!hasResources) return; 
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
              backgroundColor: isActive 
                ? '#163231' 
                : !hasLevel 
                  ? '#0b1014' 
                  : getItemCount(rewardKey) >= 0 && (!data.cost || Object.entries(data.cost).every(([k, v]) => getItemCount(k) >= v))
                    ? '#111920' 
                    : '#1a1010',
              border: isActive 
                ? '1px solid #4affd4' 
                : !hasLevel 
                  ? '1px solid #2a3b4c' 
                  : Object.entries(data.cost || {}).every(([k, v]) => getItemCount(k) >= v)
                    ? '1px solid #208b76' 
                    : '1px solid #b33a3a',
              boxShadow: isActive 
                ? '0 0 10px rgba(74, 255, 212, 0.2)' 
                : (hasLevel && data.cost && !Object.entries(data.cost).every(([k, v]) => getItemCount(k) >= v))
                  ? 'inset 0 0 15px rgba(231, 76, 60, 0.15)' 
                  : 'none',
              cursor: (hasLevel && (!data.cost || Object.entries(data.cost).every(([k, v]) => getItemCount(k) >= v))) ? 'pointer' : 'default',
              opacity: hasLevel ? 1 : 0.7 
            }}
              >
                {!hasLevel && (
                  <div className="action-card-locked" style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(11, 16, 20, 0.85)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    zIndex: 10
                  }}>
                    <span className="locked-text" style={{ color: '#c5d3df', fontSize: '13px', fontWeight: 'bold' }}>Task unlocks at</span>
                    <span className="locked-level" style={{ color: '#4affd4', fontSize: '18px', fontWeight: 'bold' }}>level {data.reqLvl}</span>
                  </div>
                )}

                <h3 className="action-card-name" style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#fff' }}>{data.name}</h3>
                <p className="action-card-meta" style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#7b95a6' }}>Level requirement: {data.reqLvl}</p>
                <p className="action-card-meta" style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#c5d3df' }}>
                  {data.xp} XP / {actionTimeSecs} Seconds
                </p>

                <div className="action-card-icon-area" style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', filter: hasLevel ? 'none' : 'grayscale(100%) opacity(0.5)' }}>
                  {rewardKey && ITEM_IMAGES[rewardKey] ? (
                    <ItemTooltip itemKey={rewardKey} count={qty}>
                      <img className="action-card-img" src={ITEM_IMAGES[rewardKey]} alt={rewardKey} style={{ maxHeight: '80px', maxWidth: '80px', objectFit: 'contain' }} />
                    </ItemTooltip>
                  ) : (
                    <span style={{ fontSize: '32px' }}>
                      {data.skill === 'mining' ? '🪨' : data.skill === 'woodcutting' ? '🌲' : data.skill === 'fishing' ? '🐟' : data.skill === 'smithing' ? '🔨' : data.skill === 'crafting' ? '🎨' : '📦'}
                    </span>
                  )}
                </div>

                {rewardKey && (
                  <div className="action-card-qty" style={{ position: 'absolute', bottom: '15px', right: '15px', fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>
                    Qty: {qty >= 1000 ? (qty/1000).toFixed(1) + 'k' : qty}
                  </div>
                )}

                {data.cost && (
                  <div className="action-card-cost" style={{ position: 'absolute', bottom: '12px', left: '4px', display: 'flex', gap: '1px', alignItems: 'center' }}>
                    {Object.entries(data.cost).map(([cKey, cVal]) => {
                      const img = ITEM_IMAGES[cKey];
                      const available = getItemCount(cKey);
                      const hasEnough = available >= cVal;
                      return (
                        <div key={cKey} className="cost-badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px', position: 'relative' }}>
                          <div className="cost-badge-inner" style={{ position: 'relative', width: '36px', height: '28px' }}>
                            <div className="cost-badge-count" style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.55)', padding: '2px 6px', borderRadius: '6px', fontSize: '11px', color: hasEnough ? '#2ecc71' : '#e74c3c', zIndex: 3 }}>
                              {cVal}x
                            </div>

                            <ItemTooltip itemKey={cKey} count={available}>
                            <div className="cost-badge-icon" style={{ width: '36px', height: '28px', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${hasEnough ? '#2ecc71' : '#b33a3a'}`, background: '#0b1014' }}>
                              {img ? (
                                <img src={img} alt={cKey} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
                              ) : (
                                <span style={{ fontSize: '14px', color: hasEnough ? '#2ecc71' : '#b33a3a' }}>{cKey.replace(/_/g,' ').slice(0,3)}</span>
                              )}
                            </div>
                            </ItemTooltip>

                            <div className="cost-badge-avail" style={{ position: 'absolute', bottom: '-6px', right: '-6px', fontSize: '10px', background: 'rgba(0,0,0,0.6)', padding: '2px 5px', borderRadius: '6px', color: '#4affd4', fontWeight: 'bold', zIndex: 4 }}>
                              {available >= 1000 ? (available / 1000).toFixed(1) + 'k' : available}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

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

      {/* RIGHT SIDE: Toolbox */}
      <div className="skilling-toolbox-wrapper" style={{ position: 'relative' }}>
        {renderToolboxPanel()}

        {/* Upgrade Tool Modal */}
        {showUpgradeModal && TOOL_SKILLS[screen] && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowUpgradeModal(false)}
          >
            <div style={{
              backgroundColor: '#111920',
              border: '1px solid #2a3b4c',
              borderRadius: '8px',
              padding: '20px',
              maxWidth: '450px',
              width: '90%',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ color: 'var(--text-primary)', margin: '0', fontSize: '18px' }}>🔧 Upgrade Tool</h2>
              
              {(() => {
                const TOOLBOX_LEVELS = [
                  { maxTierIndex: 1, slotCount: 1, label: 'Bronze – Iron',  upgradeCost: 1 },
                  { maxTierIndex: 2, slotCount: 1, label: 'Bronze – Steel', upgradeCost: 1 },
                  { maxTierIndex: 3, slotCount: 2, label: 'Bronze – Alloy', upgradeCost: 1 },
                  { maxTierIndex: 4, slotCount: 3, label: 'Bronze – Apex',  upgradeCost: 1 },
                  { maxTierIndex: 5, slotCount: 4, label: 'Bronze – Nova',  upgradeCost: null },
                ];

                const skillData = TOOL_SKILLS[screen];
                const level = (toolboxes[screen]?.level || 0);
                const levelData = TOOLBOX_LEVELS[level];

                if (!skillData) {
                  return <p style={{ color: '#7b95a6', margin: '0', fontSize: '12px' }}>No tools available for this skill</p>;
                }

                // Tel tools in toolbox slots + equipment mee
                const toolboxSlots = toolboxes[screen]?.slots || [];
                const getToolCount = (tid) => {
                  const invCount = inventory[tid] || 0;
                  const boxCount = toolboxSlots.filter(s => s === tid).length;
                  const equippedCount = equipment?.tool === tid ? 1 : 0;
                  return invCount + boxCount + equippedCount;
                };

                // Bepaal welke upgrade-indices getoond moeten worden (Set om duplicaten te voorkomen)
                const showIndices = new Set();

                // Regel 1: Vind de EERSTE tool die ik NIET heb → toon de upgrade ernaartoe
                for (let i = 0; i < skillData.tiers.length; i++) {
                  if (getToolCount(skillData.tiers[i]) === 0 && i > 0) {
                    // i is de eerste tier die ik niet heb, upgrade = tier[i-1] → tier[i]
                    showIndices.add(i - 1);
                    break;
                  }
                }

                // Regel 2: Elke tool waarvan ik 2+ heb → toon die upgrade ook
                for (let i = 0; i < skillData.tiers.length - 1; i++) {
                  if (getToolCount(skillData.tiers[i]) >= 2) {
                    showIndices.add(i);
                  }
                }

                // Bouw de upgrade-lijst op basis van showIndices
                const upgrades = [];
                for (const i of [...showIndices].sort((a, b) => a - b)) {
                  const fromId = skillData.tiers[i];
                  const toId = skillData.tiers[i + 1];
                  const fromTool = ITEMS[fromId];
                  const toTool = ITEMS[toId];
                  const currentCount = getToolCount(fromId);

                  // Zoek de infusion action die dit upgrade doet
                  const upgradeActionKey = Object.keys(ACTIONS).find(k =>
                    ACTIONS[k].skill === 'infusion' &&
                    ACTIONS[k].reward &&
                    Object.keys(ACTIONS[k].reward).includes(toId)
                  );
                  const upgradeAction = upgradeActionKey ? ACTIONS[upgradeActionKey] : null;
                  if (!upgradeAction?.cost) continue;

                  const costEntries = Object.entries(upgradeAction.cost);
                  const toolCostEntry = costEntries.find(([k]) => k === fromId);
                  const barCostEntry = costEntries.find(([k]) => k !== fromId);

                  const neededTools = toolCostEntry ? toolCostEntry[1] : 2;
                  const barItemId = barCostEntry ? barCostEntry[0] : null;
                  const neededBars = barCostEntry ? barCostEntry[1] : 200;
                  const barCount = barItemId ? (inventory[barItemId] || 0) : 0;
                  const canAfford = currentCount >= neededTools && barCount >= neededBars;

                  upgrades.push({ fromId, toId, fromTool, toTool, currentCount, neededTools, barItemId, neededBars, barCount, canAfford });
                }

                return (
                  <>
                    <p style={{ color: '#7b95a6', margin: '0', fontSize: '12px' }}>Select a tool to infuse to the next tier:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                    {upgrades.length === 0 && (
                      <p style={{ color: '#556b7a', fontSize: '11px', gridColumn: 'span 3', textAlign: 'center', margin: '20px 0' }}>No upgrades available at this toolbox level.</p>
                    )}
                    {upgrades.map(({ fromId, toId, fromTool, toTool, barItemId, barCount, canAfford, currentCount: count, neededTools: tools, neededBars: bars }) => {
                      const toolId = fromId;
                      const currentTool = fromTool;
                      const nextTool = toTool;
                      const currentCount = count;
                      const neededTools = tools;
                      const neededBars = bars;

                      return (
                        <div key={toolId} style={{
                          backgroundColor: '#0b1014',
                          border: `1px solid ${canAfford ? '#208b76' : '#b33a3a'}`,
                          borderRadius: '6px',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          aspectRatio: '1',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40px' }}>
                              {ITEM_IMAGES[toId] ? (
                                <img src={ITEM_IMAGES[toId]} alt={nextTool?.name} style={{ maxWidth: '40px', maxHeight: '40px', objectFit: 'contain' }} />
                              ) : (
                                <span style={{ fontSize: '28px' }}>{skillData.icon}</span>
                              )}
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>{nextTool?.name}</div>
                              <div style={{ color: '#7b95a6', fontSize: '9px' }}>from {currentTool?.name}</div>
                            </div>
                          </div>

                          {/* Cost Badges */}
                          <div style={{ display: 'flex', gap: '4px', fontSize: '9px' }}>
                            {/* Tool cost */}
                            <div style={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '2px',
                              backgroundColor: '#1a2b25',
                              border: `1px solid ${currentCount >= neededTools ? '#2ecc71' : '#b33a3a'}`,
                              borderRadius: '3px',
                              padding: '4px'
                            }}>
                              <span style={{ color: currentCount >= neededTools ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>{neededTools}x</span>
                              {ITEM_IMAGES[toolId] && (
                                <img src={ITEM_IMAGES[toolId]} alt={currentTool?.name} style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                              )}
                              <span style={{ color: '#4affd4' }}>{currentCount}</span>
                            </div>

                            {/* Bar cost */}
                            {barItemId && (
                              <div style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '2px',
                                backgroundColor: '#1a2b25',
                                border: `1px solid ${barCount >= neededBars ? '#2ecc71' : '#b33a3a'}`,
                                borderRadius: '3px',
                                padding: '4px'
                              }}>
                                <span style={{ color: barCount >= neededBars ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>{neededBars}x</span>
                                {ITEM_IMAGES[barItemId] ? (
                                  <img src={ITEM_IMAGES[barItemId]} alt={ITEMS[barItemId]?.name} style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                                ) : (
                                  <span style={{ color: '#7b95a6' }}>⬜</span>
                                )}
                                <span style={{ color: '#4affd4' }}>{barCount >= 1000 ? (barCount/1000).toFixed(1) + 'k' : barCount}</span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              if (infuseTool) {
                                const success = infuseTool(screen, fromId, toId, neededTools, barItemId, neededBars);
                                if (!success) return;
                              }
                            }}
                            disabled={!canAfford}
                            style={{
                              padding: '5px 8px',
                              backgroundColor: canAfford ? '#4affd4' : '#2a3b4c',
                              color: canAfford ? '#000' : '#556b7a',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: canAfford ? 'pointer' : 'default',
                              fontWeight: 'bold',
                              fontSize: '10px'
                            }}
                          >
                            Infuse
                          </button>
                        </div>
                      );
                    })}
                    </div>
                  </>
                );
              })()}

              <button
                onClick={() => setShowUpgradeModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2a3b4c',
                  color: '#c5d3df',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Equip Tool Popup */}
        {showEquipPopup && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1001
          }}
          onClick={() => setShowEquipPopup(false)}
          >
            <div style={{
              backgroundColor: '#111920',
              border: '1px solid #2a3b4c',
              borderRadius: '8px',
              padding: '20px',
              maxWidth: '400px',
              width: '90%',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ color: '#4affd4', margin: 0, fontSize: '16px' }}>⚔️ Tool Equipped!</h3>
              <p style={{ color: '#c5d3df', margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                Your best tool has been equipped manually. Did you know you can unlock <strong style={{ color: '#f1c40f' }}>Auto Tool Equip</strong> in the <strong style={{ color: '#4affd4' }}>General Store → Account Upgrades</strong>?
              </p>
              <p style={{ color: '#7b95a6', margin: 0, fontSize: '12px' }}>
                This upgrade automatically uses the best tool in your toolbox while skilling — no need to equip manually!
              </p>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  checked={dontShowEquipPopup}
                  onChange={(e) => {
                    setDontShowEquipPopup(e.target.checked);
                    try { localStorage.setItem('dontShowEquipPopup', e.target.checked ? 'true' : 'false'); } catch {}
                  }}
                  style={{ accentColor: '#4affd4', width: '16px', height: '16px' }}
                />
                <span style={{ color: '#7b95a6', fontSize: '12px' }}>Don't show this again</span>
              </label>
              <button
                onClick={() => setShowEquipPopup(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#208b76',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                Got it!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
