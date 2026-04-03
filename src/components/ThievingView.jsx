import React, { useState, useEffect, useRef } from 'react';
import { getRequiredXp, getActivePet } from '../utils/gameHelpers';
import { PETS, ITEMS, ITEM_IMAGES, TOOL_SKILLS } from '../data/gameData';

export default function ThievingView({
  skills, activeAction, setActiveAction, addXp, triggerXpDrop,
  setInventory, setSessionStats, THIEVING_TARGETS, stopAction, progress, setProgress, equipment, triggerPetNotification,
  claimToolCallback, claimedTools = {}, toolboxes = {}, upgradeToolbox, storeToolInBox,
  inventory = {}, equipToolFromBox, infuseTool, toggleEquip, onActionComplete
}) {
  const [activeTarget, setActiveTarget] = useState(null); // Separate state for thieving target
  const [stunned, setStunned] = useState(false);
  const [stunTimer, setStunTimer] = useState(0);
  const [lastResult, setLastResult] = useState(null); // 'success' | 'stunned' | null
  const [petSaved, setPetSaved] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showEquipPopup, setShowEquipPopup] = useState(false);
  const [dontShowEquipPopup, setDontShowEquipPopup] = useState(() => {
    try { return localStorage.getItem('dontShowEquipPopup') === 'true'; } catch { return false; }
  });
  const intervalRef = useRef(null);
  const stunTimeoutRef = useRef(null);
  const stunIntervalRef = useRef(null);
  const actionStartRef = useRef(null);
  const isMountedRef = useRef(true);
  const activeTargetRef = useRef(null);
  const didMountRef = useRef(false);

  const thievingLevel = skills.thieving?.level || 1;
  const agilityLevel = skills.agility?.level || 1;
  const currentXp = Math.floor(skills.thieving?.xp || 0);
  const currentLevelStartXP = getRequiredXp(thievingLevel);
  const nextLevelTotalXP = getRequiredXp(thievingLevel + 1);
  const xpGainedThisLevel = Math.max(0, currentXp - currentLevelStartXP);
  const xpNeededThisLevel = nextLevelTotalXP - currentLevelStartXP;
  const xpPercentage = Math.min(100, (xpGainedThisLevel / xpNeededThisLevel) * 100);

  // Bereken success rate voor een target
  const getSuccessRate = (target) => {
    const levelBonus = Math.max(0, thievingLevel - target.reqLvl) * 0.015;
    const agilityBonus = agilityLevel * 0.003;
    const stunChance = Math.max(0.05, target.baseStunChance - levelBonus - agilityBonus);
    return Math.min(0.95, 1 - stunChance);
  };

  // Start thieving een target
  const startThieving = (targetId) => {
    if (stunned) return;
    if (activeTarget === targetId) {
      // Toggle off — stop alles
      stopAction();
      if (stunIntervalRef.current) clearInterval(stunIntervalRef.current);
      if (stunTimeoutRef.current) clearTimeout(stunTimeoutRef.current);
      setActiveTarget(null);
      setStunned(false);
      setStunTimer(0);
      setLastResult(null);
      setPetSaved(false);
      return;
    }
    // Stop elke lopende actie (combat, mining, etc.) voordat thieving start
    stopAction();
    setActiveTarget(targetId);
    setActiveAction('thieving');  // Set activeAction so FloatingBar shows progress
    setProgress(0);
    setLastResult(null);
  };

  // Idle loop voor actief target
  useEffect(() => {
    const target = THIEVING_TARGETS.find(t => t.id === activeTarget);
    if (!target || stunned) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    actionStartRef.current = Date.now();

    // Progress visuele update
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - actionStartRef.current;
      const pct = Math.min(100, (elapsed / target.actionTimeMs) * 100);
      setProgress(pct);
    }, 50);

    // Actie uitvoeren interval
    intervalRef.current = setInterval(() => {
      if (!isMountedRef.current || !activeTarget) return;
      
      const successRate = getSuccessRate(target);
      const roll = Math.random();

      if (roll < successRate) {
        // SUCCES
        if (isMountedRef.current) {
          setLastResult('success');
          setInventory(prev => {
            const n = { ...prev };
            Object.entries(target.reward).forEach(([k, v]) => {
              n[k] = (n[k] || 0) + v;
            });
            
            // === TOOL DROP for Thieving: Bronze lockpick drops (same as other skills) ===
            if (TOOL_SKILLS['thieving']) {
              const baseTimeSeconds = (target.actionTimeMs || 1800) / 1000; // Convert ms to seconds
              const TOOL_DROP_HOURS = 20; // Same as other skills
              const dropChancePerAction = baseTimeSeconds / (TOOL_DROP_HOURS * 3600); // 20 hours = 72000 seconds
              if (Math.random() < dropChancePerAction) {
                const bronzeToolTier = 0; // First tier is bronze lockpick
                const toolId = TOOL_SKILLS['thieving'].tiers[bronzeToolTier];
                
                // Try to auto-store in toolbox or add to inventory
                const box = toolboxes['thieving'];
                let toolStored = false;
                if (box) {
                  const TOOLBOX_LEVELS = [
                    { maxTierIndex: 1 },
                    { maxTierIndex: 2 },
                    { maxTierIndex: 3 },
                    { maxTierIndex: 4 },
                    { maxTierIndex: 5 },
                  ];
                  const skillTiers = TOOL_SKILLS['thieving'].tiers;
                  const tierIndex = skillTiers.indexOf(toolId);
                  const isAllowed = tierIndex <= TOOLBOX_LEVELS[box.level || 0].maxTierIndex;
                  
                  if (isAllowed) {
                    const emptySlotIdx = (box.slots || []).findIndex(s => s === null);
                    if (emptySlotIdx !== -1) {
                      box.slots[emptySlotIdx] = toolId;
                      toolStored = true;
                    }
                  }
                }
                
                if (!toolStored) {
                  n[toolId] = (n[toolId] || 0) + 1;
                }
                
                if (triggerPetNotification) {
                  triggerPetNotification(toolId, '⚒️ Tool Drop', `You found a ${ITEMS[toolId]?.name}!`, 'tool_drop');
                }
              }
            }
            
            return n;
          });
          addXp('thieving', target.xp);
          triggerXpDrop('thieving', target.xp, false);
          setSessionStats(prev => ({
            ...prev,
            actionsCompleted: prev.actionsCompleted + 1,
            itemsGained: prev.itemsGained + 1
          }));
          if (onActionComplete) onActionComplete(target.id);
        }
      } else {
        // GESTUNNED
        if (isMountedRef.current) {
          // Check if pet can save with stunSteal perk
          const pet = getActivePet(equipment, PETS);
          const petId = pet ? Object.keys(PETS).find(key => PETS[key] === pet) : null;
          const petStealsLoot = pet?.perk === 'stunSteal' && Math.random() < pet.perkChance;

          if (petStealsLoot) {
            // Pet saves the loot despite being stunned
            setLastResult('stunned');
            setPetSaved(true);
            setInventory(prev => {
              const n = { ...prev };
              Object.entries(target.reward).forEach(([k, v]) => {
                n[k] = (n[k] || 0) + v;
              });
              
              // === TOOL DROP for Thieving: Bronze lockpick drops (same as other skills) ===
              if (TOOL_SKILLS['thieving']) {
                const baseTimeSeconds = (target.actionTimeMs || 1800) / 1000; // Convert ms to seconds
                const TOOL_DROP_HOURS = 20; // Same as other skills
                const dropChancePerAction = baseTimeSeconds / (TOOL_DROP_HOURS * 3600); // 20 hours = 72000 seconds
                if (Math.random() < dropChancePerAction) {
                  const bronzeToolTier = 0; // First tier is bronze lockpick
                  const toolId = TOOL_SKILLS['thieving'].tiers[bronzeToolTier];
                  
                  // Try to auto-store in toolbox or add to inventory
                  const box = toolboxes['thieving'];
                  let toolStored = false;
                  if (box) {
                    const TOOLBOX_LEVELS = [
                      { maxTierIndex: 1 },
                      { maxTierIndex: 2 },
                      { maxTierIndex: 3 },
                      { maxTierIndex: 4 },
                      { maxTierIndex: 5 },
                    ];
                    const skillTiers = TOOL_SKILLS['thieving'].tiers;
                    const tierIndex = skillTiers.indexOf(toolId);
                    const isAllowed = tierIndex <= TOOLBOX_LEVELS[box.level || 0].maxTierIndex;
                    
                    if (isAllowed) {
                      const emptySlotIdx = (box.slots || []).findIndex(s => s === null);
                      if (emptySlotIdx !== -1) {
                        box.slots[emptySlotIdx] = toolId;
                        toolStored = true;
                      }
                    }
                  }
                  
                  if (!toolStored) {
                    n[toolId] = (n[toolId] || 0) + 1;
                  }
                  
                  if (triggerPetNotification) {
                    triggerPetNotification(toolId, '⚒️ Tool Drop', `You found a ${ITEMS[toolId]?.name}!`, 'tool_drop');
                  }
                }
              }
              
              return n;
            });
            addXp('thieving', target.xp);
            triggerXpDrop('thieving', target.xp, false);
            if (triggerPetNotification) triggerPetNotification(petId, pet.name, 'Stole despite stun!');
            setSessionStats(prev => ({
              ...prev,
              actionsCompleted: prev.actionsCompleted + 1,
              itemsGained: prev.itemsGained + 1
            }));
            if (onActionComplete) onActionComplete(target.id);
          } else {
            setLastResult('stunned');
            setPetSaved(false);
          }

          setStunned(true);
          setProgress(0);

          const stunStart = Date.now();
          stunIntervalRef.current = setInterval(() => {
            const remaining = target.stunDurationMs - (Date.now() - stunStart);
            if (isMountedRef.current) setStunTimer(Math.max(0, remaining));
          }, 50);

          stunTimeoutRef.current = setTimeout(() => {
            if (stunIntervalRef.current) clearInterval(stunIntervalRef.current);
            stunIntervalRef.current = null;
            if (isMountedRef.current) {
              setStunned(false);
              setStunTimer(0);
              setLastResult(null);
              setPetSaved(false);
              actionStartRef.current = Date.now();
            }
          }, target.stunDurationMs);
        }
      }

      actionStartRef.current = Date.now();
      if (isMountedRef.current) setProgress(0);
    }, target.actionTimeMs);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(progressInterval);
    };
  }, [activeTarget, stunned]);

  // Cleanup bij unmount of stop
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (stunTimeoutRef.current) clearTimeout(stunTimeoutRef.current);
      if (stunIntervalRef.current) clearInterval(stunIntervalRef.current);
      // Do NOT clear `activeAction` here. Keeping thieving active while the
      // component is unmounted (e.g. when the player navigates away) ensures
      // the action continues and the FloatingBar can be shown. The engine's
      // lifecycle is tied to this mounted component; App renders it hidden
      // instead of unmounting to keep thieving running.
    };
  }, []);

  // Track activeTarget in a ref
  useEffect(() => { activeTargetRef.current = activeTarget; }, [activeTarget]);

  // === MUTUAL EXCLUSION ===
  // Als een andere skill activeAction overneemt, stop de thieving engine.
  // Dit voorkomt dat 2 skills tegelijk draaien.
  useEffect(() => {
    if (activeAction !== 'thieving' && activeTarget) {
      // Een andere skill is gestart — stop thieving
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (stunTimeoutRef.current) clearTimeout(stunTimeoutRef.current);
      if (stunIntervalRef.current) clearInterval(stunIntervalRef.current);
      setActiveTarget(null);
      setStunned(false);
      setStunTimer(0);
      setLastResult(null);
      setPetSaved(false);
    }
  }, [activeAction]);

  // Clear activeAction when activeTarget becomes null, but ONLY if thieving
  // was still the active action (niet als een andere skill het al overnam).
  // Skip initial mount (activeTarget starts as null).
  useEffect(() => {
    if (!didMountRef.current) { didMountRef.current = true; return; }
    if (!activeTarget && activeAction === 'thieving') {
      setActiveAction(null);
      setProgress(0);
      setLastResult(null);
      setStunned(false);
      setStunTimer(0);
      setPetSaved(false);
    }
  }, [activeTarget]);

  // ==========================================
  // --- TOOLBOX PANEL (Rechts) ---
  // ==========================================
  const ACTIONS_DATA = {}; // Not needed for thieving toolbox infuse
  const renderToolboxPanel = () => {
    const screen = 'thieving';
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

        {/* Equip Tool Button */}
        {!inventory.autoToolboxUpgrade && (() => {
          const boxSlots = toolboxes[screen]?.slots || [];
          const bestTool = boxSlots.reduce((best, toolId) => {
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

  return (
    <div className="thieving-view" style={{ marginTop: '0px', display: 'flex', gap: '20px' }}>
      <div style={{ flex: 1 }}>

      {/* HEADER */}
      <div className="skilling-header" style={{ marginBottom: '25px' }}>
        <div className="skilling-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
          <h1 className="skilling-title" style={{ margin: 0, fontSize: '24px', color: '#fff' }}>Thieving</h1>
          <span className="skilling-level" style={{ fontSize: '16px', color: '#c5d3df' }}>Level: <strong style={{ color: '#fff' }}>{thievingLevel}</strong></span>
          <span className="skilling-xp" style={{ fontSize: '14px', color: '#c5d3df' }}>Experience: <strong style={{ color: '#fff' }}>{currentXp.toLocaleString()}</strong> / {nextLevelTotalXP.toLocaleString()}</span>
        </div>
        <div className="skilling-xp-bar" style={{ height: '12px', backgroundColor: '#111920', borderRadius: '6px', overflow: 'hidden', border: '1px solid #2a3b4c' }}>
          <div style={{ width: `${xpPercentage}%`, height: '100%', backgroundColor: '#4affd4', transition: 'width 0.3s ease-in-out' }}></div>
        </div>
      </div>

      {/* STUN OVERLAY */}
      {stunned && (
        <div className="card" style={{
          backgroundColor: petSaved ? '#1a3a2e' : '#2a1010',
          border: petSaved ? '1px solid #2ecc71' : '1px solid #e74c3c',
          padding: '15px',
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          {petSaved ? (
            <>
              <h4 style={{ color: '#2ecc71', margin: '0 0 5px 0' }}>🦝 Pet Saved You!</h4>
              <p style={{ color: '#c5d3df', margin: 0, fontSize: '14px' }}>
                Your pet stole the loot despite the stun! Wait <strong style={{ color: '#f1c40f' }}>{(stunTimer / 1000).toFixed(1)}s</strong> before trying again.
              </p>
            </>
          ) : (
            <>
              <h4 style={{ color: '#e74c3c', margin: '0 0 5px 0' }}>💫 Stunned!</h4>
              <p style={{ color: '#c5d3df', margin: 0, fontSize: '14px' }}>
                You were caught! Wait <strong style={{ color: '#f1c40f' }}>{(stunTimer / 1000).toFixed(1)}s</strong> before trying again.
              </p>
            </>
          )}
        </div>
      )}

      {/* TARGET GRID */}
      <div className="skilling-action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
        {THIEVING_TARGETS.map(target => {
          const hasLevel = thievingLevel >= target.reqLvl;
          const isActive = activeTarget === target.id;
          const successRate = getSuccessRate(target);

          return (
            <div
              key={target.id}
              className="skilling-action-card"
              onClick={() => hasLevel && !stunned && startThieving(target.id)}
              style={{
                position: 'relative',
                borderRadius: '6px',
                padding: '20px 15px 35px 15px',
                textAlign: 'center',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '180px',
                transition: 'all 0.3s ease',
                backgroundColor: isActive ? '#163231' : !hasLevel ? '#0b1014' : '#111920',
                border: isActive ? '1px solid #4affd4' : !hasLevel ? '1px solid #2a3b4c' : '1px solid #208b76',
                boxShadow: isActive ? '0 0 10px rgba(74, 255, 212, 0.2)' : 'none',
                cursor: hasLevel && !stunned ? 'pointer' : 'default',
                opacity: hasLevel ? 1 : 0.7
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
                  <span style={{ color: '#c5d3df', fontSize: '13px', fontWeight: 'bold' }}>Unlocks at</span>
                  <span style={{ color: '#4affd4', fontSize: '18px', fontWeight: 'bold' }}>level {target.reqLvl}</span>
                </div>
              )}

              {/* ICON */}
              <div className="action-card-icon-area" style={{ fontSize: '36px', marginBottom: '8px' }}>{target.icon}</div>

              {/* NAME & DESC */}
              <h3 className="action-card-name" style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#fff' }}>{target.name}</h3>
              <p className="action-card-meta" style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#7b95a6' }}>{target.desc}</p>
              <p className="action-card-meta" style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#c5d3df' }}>
                {target.xp} XP / {(target.actionTimeMs / 1000).toFixed(1)}s
              </p>

              {/* SUCCESS RATE */}
              {hasLevel && (
                <div style={{ marginTop: 'auto', marginBottom: '10px' }}>
                  <div style={{ fontSize: '13px', color: '#7b95a6', marginBottom: '4px' }}>Success Rate</div>
                  <div style={{
                    fontSize: '20px', fontWeight: 'bold',
                    color: successRate >= 0.8 ? '#2ecc71' : successRate >= 0.5 ? '#f1c40f' : '#e74c3c'
                  }}>
                    {(successRate * 100).toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '10px', color: '#556b7a', marginTop: '2px' }}>
                    Thieving Lv. & Agility Lv. reduce stun chance
                  </div>
                </div>
              )}

              {/* REWARD PREVIEW */}
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '5px', fontSize: '11px', color: '#4affd4' }}>
                {Object.entries(target.reward).map(([k, v]) => (
                  <span key={k}>{v}x {k.replace(/_/g, ' ')}</span>
                ))}
              </div>

              {/* PROGRESS BAR */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '8px', backgroundColor: '#0b1014' }}>
                <div style={{
                  width: isActive && !stunned ? `${progress}%` : '0%',
                  height: '100%',
                  backgroundColor: '#2ecc71',
                  transition: isActive && progress > 5 ? 'width 0.1s linear' : 'none'
                }}></div>
              </div>
            </div>
          );
        })}
      </div>
      </div>

      {/* TOOLBOX PANEL (right side) */}
      <div className="skilling-toolbox-wrapper" style={{ minWidth: '180px', maxWidth: '200px' }}>
        {renderToolboxPanel()}
      </div>

      {/* UPGRADE MODAL */}
      {showUpgradeModal && (() => {
        const screen = 'thieving';
        const skillData = TOOL_SKILLS[screen];
        if (!skillData) return null;
        const tiers = skillData.tiers;

        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999
          }} onClick={() => setShowUpgradeModal(false)}>
            <div style={{
              backgroundColor: '#111920', border: '1px solid #2a3b4c',
              borderRadius: '8px', padding: '20px', maxWidth: '340px', width: '90%'
            }} onClick={e => e.stopPropagation()}>
              <h3 style={{ color: '#4affd4', margin: '0 0 12px 0', fontSize: '16px' }}>
                🔧 Upgrade Tool
              </h3>
              <p style={{ color: '#7b95a6', fontSize: '11px', margin: '0 0 12px 0' }}>
                Combine tools to upgrade to the next tier.
              </p>

              {tiers.slice(0, -1).map((tierId, idx) => {
                const nextTierId = tiers[idx + 1];
                const currentItem = ITEMS[tierId];
                const nextItem = ITEMS[nextTierId];
                const box = toolboxes[screen];
                const boxSlots = box?.slots || [];

                const boxCount = boxSlots.filter(s => s === tierId).length;
                const invCount = inventory[tierId] || 0;
                const totalCount = boxCount + invCount;
                const needed = 3;
                const canUpgrade = totalCount >= needed;

                return (
                  <div key={tierId} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px', backgroundColor: '#0b1014', borderRadius: '6px',
                    marginBottom: '8px', border: '1px solid #2a3b4c'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {ITEM_IMAGES[tierId] ? (
                        <img src={ITEM_IMAGES[tierId]} alt={currentItem?.name} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '20px' }}>{skillData.icon}</span>
                      )}
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                          {currentItem?.name} → {nextItem?.name}
                        </div>
                        <div style={{ fontSize: '9px', color: totalCount >= needed ? '#4affd4' : '#7b95a6' }}>
                          {totalCount} / {needed}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (infuseTool) infuseTool(screen, tierId, nextTierId, needed);
                      }}
                      disabled={!canUpgrade}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: canUpgrade ? '#f1c40f' : '#2a3b4c',
                        color: canUpgrade ? '#000' : '#556b7a',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: canUpgrade ? 'pointer' : 'default',
                        fontWeight: 'bold',
                        fontSize: '10px'
                      }}
                    >
                      Upgrade
                    </button>
                  </div>
                );
              })}

              <button
                onClick={() => setShowUpgradeModal(false)}
                style={{
                  marginTop: '8px', width: '100%', padding: '8px',
                  backgroundColor: '#2a3b4c', color: '#c5d1d8', border: 'none',
                  borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        );
      })()}

      {/* EQUIP POPUP */}
      {showEquipPopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999
        }} onClick={() => setShowEquipPopup(false)}>
          <div style={{
            backgroundColor: '#111920', border: '1px solid #2a3b4c',
            borderRadius: '8px', padding: '16px', maxWidth: '260px', textAlign: 'center'
          }} onClick={e => e.stopPropagation()}>
            <p style={{ color: '#4affd4', margin: '0 0 8px 0', fontSize: '13px' }}>
              ✅ Best tool equipped!
            </p>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="checkbox" checked={dontShowEquipPopup} onChange={e => setDontShowEquipPopup(e.target.checked)} />
              <span style={{ color: '#7b95a6', fontSize: '11px' }}>Don't show again</span>
            </label>
            <button
              onClick={() => setShowEquipPopup(false)}
              style={{
                marginTop: '10px', padding: '6px 20px',
                backgroundColor: '#208b76', color: '#fff', border: 'none',
                borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
