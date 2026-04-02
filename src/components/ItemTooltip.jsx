import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ITEMS, ITEM_IMAGES, PETS, WEAPONS, ARMOR, AMMO } from '../data/gameData';

// Built-in item data lookup so tooltip works anywhere without getItemData prop
function builtInLookup(key) {
  if (!key) return null;
  if (WEAPONS && WEAPONS[key]) return { ...WEAPONS[key], equipSlot: 'weapon' };
  if (AMMO && AMMO[key]) return { ...AMMO[key], equipSlot: 'ammo' };
  if (ARMOR && ARMOR[key]) return { ...ARMOR[key] };
  if (PETS && PETS[key]) return { ...PETS[key], ...(ITEMS[key] || {}), type: 'pet', equipSlot: 'pet' };
  if (ITEMS && ITEMS[key]) return { ...ITEMS[key], type: 'resource' };
  return { name: key.replace(/_/g, ' '), type: 'unknown' };
}

export default function ItemTooltip({ itemKey, count, getItemData, children }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  const tooltipRef = useRef(null);
  const longPressTimer = useRef(null);

  if (!itemKey) return children;

  const handleMouseEnter = (e) => {
    setShow(true);
    updatePosition(e);
  };

  const handleMouseMove = (e) => {
    updatePosition(e);
  };

  const updatePosition = (e) => {
    const rect = tooltipRef.current?.getBoundingClientRect();
    const tw = rect ? rect.width : 260;
    const th = rect ? rect.height : 180;
    const gap = 10;
    const cx = e.clientX;
    const cy = e.clientY;
    const vw = window.innerWidth;
    let x = cx - tw / 2;
    let y = cy - th - gap;
    if (x < 5) x = 5;
    if (x + tw > vw - 5) x = vw - tw - 5;
    if (y < 5) y = 5;
    setPos({ x, y });
  };

  const handleMouseLeave = () => setShow(false);

  // --- Touch support (long-press) ---
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      const rect = tooltipRef.current?.getBoundingClientRect();
      const tw = rect ? rect.width : 260;
      const th = rect ? rect.height : 180;
      const gap = 10;
      const cx = touch.clientX;
      const cy = touch.clientY;
      const vw = window.innerWidth;
      let x = cx - tw / 2;
      let y = cy - th - gap;
      if (x < 5) x = 5;
      if (x + tw > vw - 5) x = vw - tw - 5;
      if (y < 5) y = cy + 20;
      setPos({ x, y });
      setShow(true);
    }, 400);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setTimeout(() => setShow(false), 1500);
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const data = getItemData ? getItemData(itemKey) : builtInLookup(itemKey);
  if (!data) return children;

  const baseValue = data.value || (ITEMS[itemKey]?.value) || 0;

  // Helper voor getalnotatie met punten
  function formatNumber(n) {
    return n.toLocaleString('nl-NL');
  }
  const hasStats = data.damage || data.str || data.accuracy || data.att ||
                   data.defence || data.rangedStr || data.rangedAcc || data.rangedDef ||
                   data.magicStr || data.magicAcc || data.magicDef;
  const isEquipment = !!data.equipSlot && data.equipSlot !== 'pet';

  const formatStat = (val) => {
    if (!val && val !== 0) return <span style={{ color: '#556b7a' }}>–</span>;
    const color = val > 0 ? '#2ecc71' : val < 0 ? '#e74c3c' : '#7b95a6';
    return <span style={{ color }}>{val > 0 ? `+${val}` : val}</span>;
  };

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      style={{ display: 'contents' }}
    >
      {children}
      {show && createPortal(
        <div ref={tooltipRef} style={{
          position: 'fixed',
          left: pos.x + 'px',
          top: pos.y + 'px',
          backgroundColor: '#1a2530',
          border: '1px solid #2a3b4c',
          borderRadius: '6px',
          padding: '10px 14px',
          minWidth: '220px',
          maxWidth: '300px',
          zIndex: 999999,
          pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.7)',
          fontSize: '12px',
          color: '#c5d3df'
        }}>
          {/* Header: Image + Name + Qty */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #2a3b4c', paddingBottom: '8px' }}>
            {ITEM_IMAGES[itemKey] && (
              <img src={ITEM_IMAGES[itemKey]} alt={data.name} style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
            )}
            <div>
              <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px' }}>{data.name}</div>
              <div style={{ fontSize: '11px', color: '#7b95a6' }}>x{count || 0}</div>
            </div>
          </div>

          {/* Stats block (for equipment) */}
          {isEquipment && hasStats && (
            <div style={{ marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px' }}>
              {/* Melee */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>🗡️</span>
                <span>STR: {formatStat(data.damage || data.str || 0)} | ACC: {formatStat(data.accuracy || data.att || 0)} | DEF: {formatStat(data.defence || 0)}</span>
              </div>
              {/* Ranged */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: (data.rangedStr || data.rangedAcc || data.rangedDef) ? '#c5d3df' : '#556b7a' }}>
                <span>🏹</span>
                <span>STR: {formatStat(data.rangedStr || 0)} | ACC: {formatStat(data.rangedAcc || 0)} | DEF: {formatStat(data.rangedDef || 0)}</span>
              </div>
              {/* Magic */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: (data.magicStr || data.magicAcc || data.magicDef) ? '#c5d3df' : '#556b7a' }}>
                <span>🧙</span>
                <span>STR: {formatStat(data.magicStr || 0)} | ACC: {formatStat(data.magicAcc || 0)} | DEF: {formatStat(data.magicDef || 0)}</span>
              </div>
            </div>
          )}

          {/* Required level */}
          {data.reqLvl && (
            <div style={{ fontSize: '11px', color: '#4affd4', marginBottom: '6px' }}>
              ⚔️ Lvl {data.reqLvl}
            </div>
          )}

          {/* Description (non-equipment, non-pet items) */}
          {!isEquipment && data.equipSlot !== 'pet' && data.desc && (
            <div style={{ fontSize: '11px', color: '#c5d3df', marginBottom: '6px', lineHeight: '1.4' }}>
              {data.desc}
            </div>
          )}

          {/* Pet perk description */}
          {data.equipSlot === 'pet' && data.desc && (
            <div style={{ fontSize: '11px', color: '#c5d3df', marginBottom: '6px', lineHeight: '1.4' }}>
              {data.desc}
            </div>
          )}

          {/* Speed boost (tools) */}
          {data.speedBoosts && (
            <div style={{ fontSize: '11px', color: '#f1c40f', marginBottom: '6px' }}>
              ⚡ Speed: +{(Object.values(data.speedBoosts)[0] * 100).toFixed(0)}%
            </div>
          )}

          {/* Price row */}
          <div style={{
            display: 'flex', gap: '10px',
            backgroundColor: '#111920',
            padding: '6px 8px',
            borderRadius: '4px',
            marginTop: '4px',
            fontSize: '11px'
          }}>
            <span style={{ color: '#f1c40f' }}>🏪 🪙 {formatNumber(baseValue)}</span>
            <span style={{ color: '#7b95a6' }}>🤝 🪙 B: {formatNumber(Math.floor(baseValue * 1.1))} | S: {formatNumber(Math.floor(baseValue * 1.8))}</span>
          </div>
        </div>, document.body
      )}
    </div>
  );
}
