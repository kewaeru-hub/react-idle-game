import React from 'react';
import { ITEM_IMAGES } from '../data/gameData';
import { getRequiredXp } from '../utils/gameHelpers';
import ItemTooltip from './ItemTooltip';

const InfusionView = ({
  ACTIONS,
  skills,
  activeAction,
  startAction,
  stopAction,
  getItemCount,
  getActualActionTime,
  progress,
}) => {

  // Organize actions by weapon/armor/tool type
  const getActionsByType = () => {
    const organized = {
      weapons: {
        scimitars: [],
        bows: [],
        staffs: [],
      },
    };

    Object.entries(ACTIONS).forEach(([actionId, action]) => {
      if (action.skill !== 'infusion') return;

      // Weapons only
      if (action.category === 'scimitars') {
        organized.weapons.scimitars.push({ action, actionId });
      } else if (action.category === 'bows') {
        organized.weapons.bows.push({ action, actionId });
      } else if (action.category === 'staffs') {
        organized.weapons.staffs.push({ action, actionId });
      }
    });

    // Sort by tier (common first, then alloy, apex, nova)
    const getTierOrder = (actionId) => {
      const rewardItem = Object.keys(ACTIONS[actionId].reward)[0];
      if (['bronze', 'iron', 'steel', 'rune'].some((t) => rewardItem.includes(t))) return 0;
      if (rewardItem.includes('alloy')) return 1;
      if (rewardItem.includes('apex')) return 2;
      if (rewardItem.includes('nova')) return 3;
      return 4;
    };

    Object.keys(organized).forEach((tab) => {
      Object.keys(organized[tab]).forEach((type) => {
        organized[tab][type].sort((a, b) => getTierOrder(a.actionId) - getTierOrder(b.actionId));
      });
    });

    return organized;
  };

  const renderActionCard = (action, actionId) => {
    // Get both items from cost
    const costItems = Object.entries(action.cost);
    const barItem = costItems.find(([item]) => item.includes('bar'));
    const equipItem = costItems.find(([item]) => !item.includes('bar'));

    const equipItemName = equipItem?.[0];
    const equipQty = equipItem?.[1];
    const barItemName = barItem?.[0];
    const barQty = barItem?.[1];

    const equipCount = getItemCount(equipItemName);
    const barCount = getItemCount(barItemName);
    const canAfford = equipCount >= equipQty && barCount >= barQty;
    // getActualActionTime in App returns milliseconds; ensure we pass the actionId
    // and convert to seconds for display (fallback to ticks * 600ms if missing)
    const actualMs = getActualActionTime ? getActualActionTime(actionId) : (action.baseTime || 1800);
    const actualSecs = actualMs / 1000;

    const isActive = activeAction === actionId;
    const rewardItem = Object.keys(action.reward)[0];
    const rewardCount = getItemCount(rewardItem);

    return (
      <div
        key={actionId}
        onClick={() => {
          if (isActive) {
            stopAction();
          } else {
            if (!canAfford) return;
            startAction(actionId);
          }
        }}
        className={`infusion-action-card card ${isActive ? 'active' : ''} ${canAfford ? 'affordable' : 'unaffordable'}`}
      >
        {/* Title */}
        <h3 className="card-name">{action.name}</h3>
        <p className="card-meta">
          Level requirement: {action.reqLvl}
        </p>
        <p className="card-time">
          {action.xp} XP / {actualSecs.toFixed(1)}s
        </p>

        {/* Main icon display */}
        <div className="card-icon-container">
          {ITEM_IMAGES[equipItemName] && (
            <ItemTooltip itemKey={equipItemName} count={equipCount}>
              <img
                src={ITEM_IMAGES[equipItemName]}
                alt={equipItemName}
                className="card-icon-main"
              />
            </ItemTooltip>
          )}
          <span className="icon-arrow">→</span>
          {ITEM_IMAGES[rewardItem] && (
            <ItemTooltip itemKey={rewardItem} count={rewardCount}>
              <img
                src={ITEM_IMAGES[rewardItem]}
                alt={rewardItem}
                className="card-icon-main"
              />
            </ItemTooltip>
          )}
        </div>

        {/* Qty Counter (bottom right) */}
        {rewardItem && (
          <div className="card-qty">
            Qty: {rewardCount >= 1000 ? (rewardCount / 1000).toFixed(1) + 'k' : rewardCount}
          </div>
        )}

        {/* Cost display (bottom left, like SkillingView) */}
        <div className="cost-display">
          {/* Equipment item cost */}
          {ITEM_IMAGES[equipItemName] && (
            <div className={`cost-item-badge ${equipCount < equipQty ? 'unaffordable' : ''}`}>
              <div className="cost-required">
                {equipQty}x
              </div>
              <ItemTooltip itemKey={equipItemName} count={equipCount}>
                <div className="cost-icon-box">
                  <img
                    src={ITEM_IMAGES[equipItemName]}
                    alt={equipItemName}
                    className="cost-icon"
                  />
                </div>
              </ItemTooltip>
              <div className="cost-available">
                {equipCount >= 1000 ? (equipCount / 1000).toFixed(1) + 'k' : equipCount}
              </div>
            </div>
          )}

          {/* Bar cost */}
          {ITEM_IMAGES[barItemName] && (
            <div className={`cost-item-badge ${barCount < barQty ? 'unaffordable' : ''}`}>
              <div className="cost-required">
                {barQty}x
              </div>
              <ItemTooltip itemKey={barItemName} count={barCount}>
                <div className="cost-icon-box">
                  <img
                    src={ITEM_IMAGES[barItemName]}
                    alt={barItemName}
                    className="cost-icon"
                  />
                </div>
              </ItemTooltip>
              <div className="cost-available">
                {barCount >= 1000 ? (barCount / 1000).toFixed(1) + 'k' : barCount}
              </div>
            </div>
          )}
        </div>

        {/* Progress bar (match SkillingView style) */}
        {isActive && (
          <div className="progress-bar-wrapper">
            <div
              className="progress-fill"
              style={{ width: isActive ? `${progress}%` : '0%', transition: isActive && progress > 5 ? 'width 0.1s linear' : 'none' }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderTypeSection = (typeKey, typeLabel, actions) => {
    if (actions.length === 0) return null;
    return (
      <div key={typeKey} className="type-section">
        <h3 className="type-label">{typeLabel}</h3>
        <div className="skilling-action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' }}>
          {actions.map(({ action, actionId }) =>
            renderActionCard(action, actionId)
          )}
        </div>
      </div>
    );
  };

  const organized = getActionsByType();
  const currentData = organized.weapons;

  // --- Skill header (copy from SkillingView) ---
  const infusionLevel = skills?.infusion?.level || 1;
  const infusionXp = Math.floor(skills?.infusion?.xp || 0);
  const infusionLevelStartXp = getRequiredXp ? getRequiredXp(infusionLevel) : 0;
  const infusionNextLevelTotal = getRequiredXp ? getRequiredXp(infusionLevel + 1) : infusionLevelStartXp + 100;
  const infusionXpGainedThisLevel = Math.max(0, infusionXp - infusionLevelStartXp);
  const infusionXpNeededThisLevel = infusionNextLevelTotal - infusionLevelStartXp;
  const infusionXpPct = Math.min(100, (infusionXpNeededThisLevel > 0 ? (infusionXpGainedThisLevel / infusionXpNeededThisLevel) * 100 : 100));

  return (
    <div className="infusion-view">
      {/* Header (Skill name, level, experience + thin XP bar) */}
      <div className="skilling-header" style={{ marginBottom: '25px' }}>
        <div className="skilling-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
          <h1 className="skilling-title" style={{ margin: 0, textTransform: 'capitalize', fontSize: '24px', color: '#fff' }}>Infusion</h1>
          <span className="skilling-level" style={{ fontSize: '16px', color: '#c5d3df' }}>Level: <strong style={{color: '#fff'}}>{infusionLevel}</strong></span>
          <span className="skilling-xp" style={{ fontSize: '14px', color: '#c5d3df' }}>Experience: <strong style={{color: '#fff'}}>{infusionXp.toLocaleString()}</strong> / {infusionNextLevelTotal.toLocaleString()}</span>
        </div>

        <div className="skilling-xp-bar" style={{ height: '12px', backgroundColor: '#111920', borderRadius: '6px', overflow: 'hidden', border: '1px solid #2a3b4c' }}>
          <div style={{ width: `${infusionXpPct}%`, height: '100%', backgroundColor: '#4affd4', transition: 'width 0.3s ease-in-out' }}></div>
        </div>
      </div>

      {/* Content */}
      <div className="infusion-content">
        {renderTypeSection('scimitars', 'Scimitars', currentData.scimitars)}
        {renderTypeSection('bows', 'Bows', currentData.bows)}
        {renderTypeSection('staffs', 'Staffs', currentData.staffs)}
      </div>
    </div>
  );
};

export default InfusionView;
