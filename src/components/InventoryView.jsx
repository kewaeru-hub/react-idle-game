import React, { useState } from 'react';
// ZORG DAT ITEMS HIER GEÏMPORTEERD WORDT VOOR DE PRIJZEN:
import { ITEMS, ITEM_IMAGES, PETS } from '../data/gameData'; 
import EquipmentGrid from './EquipmentGrid';
import ItemTooltip from './ItemTooltip';

export default function InventoryView({ inventory, equipment, equipmentAmounts, WEAPONS, AMMO, ARMOR, toggleEquip, sellItemToShop, setActivePopup, depositToVault, clan, setInventory, inventoryOrder = [], setInventoryOrder }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [showSellConfirm, setShowSellConfirm] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  // Helper om data te vinden
  const getItemData = (key) => {
    if (!key) return null;
    if (WEAPONS && WEAPONS[key]) return { ...WEAPONS[key], equipSlot: 'weapon' };
    if (AMMO && AMMO[key]) return { ...AMMO[key], equipSlot: 'ammo' };
    if (ARMOR && ARMOR[key]) return { ...ARMOR[key] };
    
    // Check PETS for pet descriptions
    if (PETS && PETS[key]) return { ...PETS[key], ...ITEMS[key], type: 'pet' };
    
    // Kijk of het item in onze ITEMS lijst staat (voor prijzen en resources)
    if (ITEMS && ITEMS[key]) return { ...ITEMS[key], type: 'resource' };
    
    if (key.includes('pet')) return { name: key, type: 'pet' };
    if (key.includes('ear')) return { name: key, type: 'jewelry' };
    if (key.includes('ring')) return { name: key, type: 'jewelry' };
    if (key.includes('pocket')) return { name: key, type: 'pocket' };

    return { name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), type: 'resource', value: 0 };
  };

  const handleRightClick = (e, key) => {
    e.preventDefault();
    const itemData = getItemData(key);
    
    if (itemData && itemData.equipSlot) {
      // Als het munitie is, sturen we het VOLLEDIGE aantal uit de rugzak mee.
      // Omdat we een 'amount' meesturen, weet App.jsx dat hij moet "Bijvullen" in plaats van "Afdoen".
      if (itemData.equipSlot === 'ammo') {
        toggleEquip(key, inventory[key]); 
      } else {
        // Gewone wapens en bepantsering werken nog steeds als een aan/uit knop
        toggleEquip(key);
      }
    }
  };

  const openModal = (key) => {
    setSelectedItem(key);
    setModalQuantity(1);
    setShowSellConfirm(false);
  };

  const handleEquipFromModal = () => {
    toggleEquip(selectedItem, modalQuantity);
    setSelectedItem(null);
  };

  const items = Object.entries(inventory).filter(([key, count]) => count > 0 && key !== 'coins' && key !== 'slayer_points');

  // --- UITGEBREIDE STATS BEREKENING ---
  const totals = { mStr: 0, mAcc: 0, mDef: 0, rStr: 0, rAcc: 0, rDef: 0, aStr: 0, aAcc: 0, aDef: 0 };
  Object.values(equipment).forEach(itemKey => {
    const data = getItemData(itemKey);
    if (data) {
      totals.mStr += data.damage || data.str || 0;
      totals.mAcc += data.accuracy || data.att || 0;
      totals.mDef += data.defence || 0;
      
      totals.rStr += data.rangedStr || 0;
      totals.rAcc += data.rangedAcc || 0;
      totals.rDef += data.rangedDef || 0;
      
      totals.aStr += data.magicStr || 0; 
      totals.aAcc += data.magicAcc || 0;
      totals.aDef += data.magicDef || 0;
    }
  });

// Equipment grid handled by shared component `EquipmentGrid`

  const formatStat = (val) => {
    if (!val) return null;
    return <strong style={{ color: val > 0 ? '#2ecc71' : '#e74c3c' }}>{val > 0 ? `+${val}` : val}</strong>;
  };

  // Helper voor de geselecteerde item in de modal
  const selectedItemData = getItemData(selectedItem);
  const baseValue = selectedItemData?.value || 1;
  const totalSellValue = baseValue * modalQuantity;
  const maxSlots = inventory.maxSlots || 35;

  // Display order: use inventoryOrder directly (includes nulls for gaps)
  const displayOrder = inventoryOrder;

  // Drag & drop handlers
  const handleDragStart = (e, idx) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    // Make drag image semi-transparent
    if (e.currentTarget) {
      e.dataTransfer.setDragImage(e.currentTarget, 42, 42);
    }
  };
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIdx !== idx) setDragOverIdx(idx);
  };
  const handleDragLeave = () => {
    setDragOverIdx(null);
  };
  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    setDragOverIdx(null);
    if (dragIdx === null || dragIdx === targetIdx || !setInventoryOrder) return;
    if (targetIdx >= maxSlots) return; // Can't drop into locked slots
    setInventoryOrder(prev => {
      const newOrder = [...prev];
      // Extend array if needed to reach targetIdx
      while (newOrder.length <= targetIdx) newOrder.push(null);
      const dragKey = newOrder[dragIdx];
      const targetKey = newOrder[targetIdx]; // null if empty slot
      if (!dragKey) return prev; // nothing to drag
      if (targetKey) {
        // Swap: put target where drag was, put drag where target was
        newOrder[dragIdx] = targetKey;
        newOrder[targetIdx] = dragKey;
      } else {
        // Move to empty slot: put null in old position, put item in new position
        newOrder[dragIdx] = null;
        newOrder[targetIdx] = dragKey;
      }
      // Trim trailing nulls
      while (newOrder.length > 0 && newOrder[newOrder.length - 1] === null) {
        newOrder.pop();
      }
      return newOrder;
    });
    setDragIdx(null);
  };
  const handleDragEnd = () => {
    setDragIdx(null);
    setDragOverIdx(null);
  };
  
    return (
    <div className="inventory-container" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center' }}>
      
      {/* --- INVENTORY GRID --- */}
      <div className="card inventory-card" style={{ flex: '2 1 400px', maxWidth: '920px' }}>
        
        {/* VERNIEUWDE HEADER MET UPGRADE KNOP */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', /* Zorgt dat het netjes breekt als het NIET past */
          gap: '10px', 
          borderBottom: '1px solid #2a3b4c', 
          paddingBottom: '10px', 
          marginBottom: '15px' 
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, whiteSpace: 'nowrap' }}>Inventory</h2>
            <span style={{ fontSize: '14px', color: '#7b95a6', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              {maxSlots} / 300 slots
            </span>
            
            {maxSlots < 300 && (
              <button 
                onClick={() => setActivePopup('Upgrades')}
                style={{ 
                  background: '#208b76', color: 'white', border: 'none', 
                  padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', 
                  fontWeight: 'bold', fontSize: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  whiteSpace: 'nowrap' /* Zorgt dat "+ Upgrade" nooit op 2 regels komt */
                }}
              >
                + Upgrade
              </button>
            )}
          </div>
          
          {/* Flex-shrink op 0 zorgt dat de coins NIET in elkaar worden gedrukt */}
          <span style={{ fontSize: '18px', color: '#f1c40f', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}>
            💰 {inventory.coins?.toLocaleString() || 0} gp
          </span>
        </div>
        
        <div className="inventory-slots-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '0 4px' }}>
          {Array.from({ length: 300 }).map((_, index) => {
            const isLocked = index >= maxSlots;
            const itemKey = index < displayOrder.length ? displayOrder[index] : undefined;
            const count = (itemKey && itemKey !== null) ? (inventory[itemKey] || 0) : 0;

            // 1. RODE SLOT VAKJE (Te koop)
            if (isLocked) {
              return (
                <div key={`locked-${index}`} className="inv-slot-item inv-slot-locked" style={{ width: '85px', height: '85px', background: 'rgba(220, 53, 69, 0.1)', border: '1px solid rgba(220, 53, 69, 0.4)', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <span style={{ fontSize: '20px', opacity: 0.3 }}>🔒</span>
                </div>
              );
            }

            // 2. GEVULD VAKJE (Draggable!)
            if (itemKey && count > 0) {
              const itemImage = ITEM_IMAGES[itemKey];
              const isDragging = dragIdx === index;
              const isDragOver = dragOverIdx === index;
              return (
                <ItemTooltip key={itemKey} itemKey={itemKey} count={count} getItemData={getItemData}>
                <div 
                  className="inv-slot-item inv-slot-filled"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => openModal(itemKey)}
                  onContextMenu={(e) => handleRightClick(e, itemKey)}
                  style={{
                    width: '85px', height: '85px', backgroundColor: '#0b1014',
                    border: isDragOver ? '2px solid #4affd4' : '1px solid #2a3b4c',
                    borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', 
                    justifyContent: 'center', cursor: 'grab', position: 'relative', transition: 'border 0.15s, opacity 0.15s, transform 0.15s',
                    overflow: 'hidden',
                    opacity: isDragging ? 0.4 : 1,
                    transform: isDragOver ? 'scale(1.05)' : 'scale(1)'
                  }}
                  onMouseEnter={(e) => { if (dragIdx === null) e.currentTarget.style.borderColor = '#4affd4'; }}
                  onMouseLeave={(e) => { if (dragIdx === null) e.currentTarget.style.borderColor = '#2a3b4c'; }}
                >
                  {itemImage ? (
                    <img src={itemImage} alt={itemKey} style={{ width: '90%', height: '90%', objectFit: 'contain', pointerEvents: 'none' }} />
                  ) : (
                    <span style={{ fontSize: '11px', color: '#c5d3df', textAlign: 'center', lineHeight: '1.1', pointerEvents: 'none' }}>
                      {itemKey.replace(/_/g, ' ').substring(0, 8)}..
                    </span>
                  )}
                  <span style={{ position: 'absolute', bottom: '2px', right: '4px', fontSize: '10px', color: '#4affd4', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.6)', padding: '2px 4px', borderRadius: '2px', pointerEvents: 'none' }}>
                    {count >= 1000 ? (count/1000).toFixed(1) + 'k' : count}
                  </span>
                </div>
                </ItemTooltip>
              );
            }

            // 3. LEEG BESCHIKBAAR VAKJE (Drop target)
            return (
              <div 
                key={`empty-${index}`}
                className="inv-slot-item inv-slot-empty"
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                style={{ 
                  width: '85px', 
                  height: '85px', 
                  backgroundColor: '#0b1014',
                  border: dragOverIdx === index ? '2px solid #4affd4' : '1px solid #2a3b4c',
                  borderRadius: '8px', 
                  cursor: 'default',
                  transition: 'border 0.15s, transform 0.15s',
                  transform: dragOverIdx === index ? 'scale(1.05)' : 'scale(1)'
                }}
              ></div>
            );
          })}
        </div>
      </div>

      {/* --- EQUIPMENT UI --- */}
      <div className="card equipment-view equipment-card" style={{ flex: '0 1 350px', backgroundColor: '#111920', padding: '20px' }}>
        <h2 style={{ borderBottom: '1px solid #2a3b4c', paddingBottom: '10px', marginBottom: '20px' }}>Equipment</h2>

        <EquipmentGrid
          equipment={equipment}
          equipmentAmounts={equipmentAmounts}
          ITEM_IMAGES={ITEM_IMAGES}
          getItemData={getItemData}
          onSlotClick={(slotId) => {
            const itemKey = equipment[slotId];
            if (!itemKey) return;
            // ammo uses counts; when equipping via UI we prefer toggle logic
            if (slotId === 'ammo') {
              toggleEquip(itemKey, equipmentAmounts?.ammo || 0);
            } else {
              toggleEquip(itemKey);
            }
          }}
        />

        {/* --- UITGEBREIDE EQUIPMENT BONUSES --- */}
        <h3 style={{ color: '#fff', marginBottom: '10px', fontSize: '15px' }}>Equipment bonuses</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ backgroundColor: '#163231', padding: '10px 15px', borderRadius: '6px', display: 'flex', alignItems: 'center', border: '1px solid #1f423f' }}>
            <span style={{ marginRight: '10px', fontSize: '16px' }}>🗡️</span>
            <span style={{ color: '#c5d3df', fontSize: '11px', letterSpacing: '0.2px' }}>
              STR: <strong style={{color: 'white'}}>{totals.mStr}</strong> | ACC: <strong style={{color: 'white'}}>{totals.mAcc}</strong> | DEF: <strong style={{color: 'white'}}>{totals.mDef}</strong>
            </span>
          </div>
          <div style={{ backgroundColor: '#163231', padding: '10px 15px', borderRadius: '6px', display: 'flex', alignItems: 'center', border: '1px solid #1f423f' }}>
            <span style={{ marginRight: '10px', fontSize: '16px' }}>🏹</span>
            <span style={{ color: '#c5d3df', fontSize: '11px', letterSpacing: '0.2px' }}>
              STR: <strong style={{color: 'white'}}>{totals.rStr}</strong> | ACC: <strong style={{color: 'white'}}>{totals.rAcc}</strong> | DEF: <strong style={{color: 'white'}}>{totals.rDef}</strong>
            </span>
          </div>
          <div style={{ backgroundColor: '#163231', padding: '10px 15px', borderRadius: '6px', display: 'flex', alignItems: 'center', border: '1px solid #1f423f' }}>
            <span style={{ marginRight: '10px', fontSize: '16px' }}>🧙</span>
            <span style={{ color: '#c5d3df', fontSize: '11px', letterSpacing: '0.2px' }}>
              STR: <strong style={{color: 'white'}}>{totals.aStr}</strong> | ACC: <strong style={{color: 'white'}}>{totals.aAcc}</strong> | DEF: <strong style={{color: 'white'}}>{totals.aDef}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* --- ITEM MODAL (POPUP + DYNAMISCHE STATS & SELLING) --- */}
      {selectedItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }} onClick={() => setSelectedItem(null)}>
          <div style={{
            backgroundColor: '#111920', border: '2px solid #208b76', borderRadius: '8px', 
            width: '340px', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.8)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2a3b4c', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>{selectedItemData?.name}</h3>
              <span style={{ color: '#4affd4' }}>Bank: {inventory[selectedItem]}</span>
            </div>

            {/* Prijs Informatie (Nieuw!) */}
            <div style={{ display: 'flex', gap: '15px', backgroundColor: '#16242e', padding: '8px', borderRadius: '4px', marginBottom: '15px', fontSize: '13px' }}>
              <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>🏪 {baseValue} gp</span>
              <span style={{ color: '#7b95a6' }}>🤝 B: {Math.floor(baseValue * 1.1)} | S: {Math.floor(baseValue * 1.8)}</span>
            </div>

            {/* Item Image */}
            {ITEM_IMAGES[selectedItem] && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                <img src={ITEM_IMAGES[selectedItem]} alt={selectedItemData?.name} style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
              </div>
            )}

            {/* Item Properties */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', fontSize: '11px' }}>
              {selectedItemData?.maxAmount === 1 && (
                <span style={{ backgroundColor: '#1a4d4a', color: '#4affd4', padding: '4px 8px', borderRadius: '3px', fontWeight: 'bold' }}>⚠️ Unique (Max 1)</span>
              )}
              {selectedItemData?.tradeable === false && (
                <span style={{ backgroundColor: '#4d2a1a', color: '#ff9344', padding: '4px 8px', borderRadius: '3px', fontWeight: 'bold' }}>🔒 Untradeable</span>
              )}
            </div>
            
            {/* DYNAMISCH STATS BLOK */}
            <div style={{ backgroundColor: '#0b1014', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '12px', color: '#c5d3df' }}>
              {/* Pet Info */}
              {selectedItemData?.equipSlot === 'pet' && selectedItemData?.desc ? (
                <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#163231', borderRadius: '4px', borderLeft: '3px solid #4affd4', color: '#fff' }}>
                  <p style={{ margin: '0', lineHeight: '1.4' }}>{selectedItemData.desc}</p>
                </div>
              ) : null}

              {/* Melee Stats */}
              {(selectedItemData?.damage || selectedItemData?.accuracy || selectedItemData?.defence || selectedItemData?.str || selectedItemData?.att) ? (
                <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🗡️ Melee</span>
                  <span>
                    STR: {formatStat(selectedItemData.damage || selectedItemData.str)} | ACC: {formatStat(selectedItemData.accuracy || selectedItemData.att)} | DEF: {formatStat(selectedItemData.defence)}
                  </span>
                </div>
              ) : null}

              {/* Ranged Stats */}
              {(selectedItemData?.rangedStr || selectedItemData?.rangedAcc || selectedItemData?.rangedDef) ? (
                <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🏹 Ranged</span>
                  <span>
                    STR: {formatStat(selectedItemData.rangedStr)} | ACC: {formatStat(selectedItemData.rangedAcc)} | DEF: {formatStat(selectedItemData.rangedDef)}
                  </span>
                </div>
              ) : null}

              {/* Magic Stats */}
              {(selectedItemData?.magicStr || selectedItemData?.magicAcc || selectedItemData?.magicDef) ? (
                <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🧙 Magic</span>
                  <span>
                    STR: {formatStat(selectedItemData.magicStr)} | ACC: {formatStat(selectedItemData.magicAcc)} | DEF: {formatStat(selectedItemData.magicDef)}
                  </span>
                </div>
              ) : null}

              {/* Speed */}
              {selectedItemData?.speedTicks ? (
                <div style={{ borderTop: '1px solid #2a3b4c', paddingTop: '5px', marginTop: '5px' }}>
                  ⚡ Speed: <strong style={{color: 'white'}}>{(selectedItemData.speedTicks * 0.6).toFixed(2)}s</strong>
                </div>
              ) : null}

              {/* Fallback */}
              {!selectedItemData?.equipSlot && !selectedItemData?.speedTicks && !selectedItemData?.desc && (
                <p style={{ margin: '5px 0', color: '#7b95a6' }}>No stats.</p>
              )}
            </div>

            {/* Slider & Knoppen - Hidden for maxAmount: 1 items */}
            {selectedItemData?.maxAmount !== 1 && (
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <input 
                  type="range" min="1" max={inventory[selectedItem] || 1} value={modalQuantity} 
                  onChange={(e) => { setModalQuantity(Number(e.target.value)); setShowSellConfirm(false); }}
                  style={{ flex: 1, accentColor: '#4affd4', cursor: 'pointer' }}
                />
                <button 
                  onClick={() => { setModalQuantity(inventory[selectedItem] || 1); setShowSellConfirm(false); }}
                  style={{ padding: '4px 10px', backgroundColor: '#182b2a', border: '1px solid #208b76', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                >
                  MAX
                </button>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button onClick={() => { setModalQuantity(prev => Math.max(1, prev - 1)); setShowSellConfirm(false); }} style={{ padding: '8px 12px', backgroundColor: '#0b1014', border: '1px solid #2a3b4c', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                <input 
                  type="number" min="1" max={inventory[selectedItem] || 1} value={modalQuantity}
                  onChange={(e) => { let val = parseInt(e.target.value, 10); if (isNaN(val) || val < 1) val = 1; if (val > inventory[selectedItem]) val = inventory[selectedItem]; setModalQuantity(val); setShowSellConfirm(false); }}
                  style={{ flex: 1, padding: '8px', backgroundColor: '#182b2a', border: '1px solid #208b76', color: 'white', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}
                />
                <button onClick={() => { setModalQuantity(prev => Math.min(inventory[selectedItem] || 1, prev + 1)); setShowSellConfirm(false); }} style={{ padding: '8px 12px', backgroundColor: '#0b1014', border: '1px solid #2a3b4c', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
              </div>
            </div>
            )}

            {/* Knoppen Groep */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              
              {/* Verkoop Knop (Nieuw!) */}
                      {selectedItemData?.equipSlot && (
              <button 
                onClick={handleEquipFromModal}
                style={{ padding: '10px', backgroundColor: '#208b76', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Equip
              </button>
              )}
              
              <button 
                onClick={() => {
                  if (totalSellValue >= 10000 && !showSellConfirm) {
                    setShowSellConfirm(true);
                    return;
                  }
                  sellItemToShop(selectedItem, modalQuantity);
                  setSelectedItem(null);
                  setShowSellConfirm(false);
                }}
                disabled={baseValue <= 0}
                style={{ 
                  padding: '12px', backgroundColor: baseValue > 0 ? (showSellConfirm ? '#e74c3c' : '#c0392b') : '#2a3b4c', 
                  color: baseValue > 0 ? 'white' : '#7b95a6', border: 'none', borderRadius: '4px', 
                  cursor: baseValue > 0 ? 'pointer' : 'not-allowed', fontWeight: 'bold',
                  animation: showSellConfirm ? 'none' : 'none'
                }}
              >
                {showSellConfirm 
                  ? `⚠️ Confirm sell for ${totalSellValue.toLocaleString()} gp?` 
                  : `Sell for ${totalSellValue.toLocaleString()} gp`}
              </button>
              {showSellConfirm && (
                <button
                  onClick={() => setShowSellConfirm(false)}
                  style={{
                    padding: '8px', backgroundColor: '#2a3b4c',
                    color: '#c5d3df', border: '1px solid #556b7a', borderRadius: '4px',
                    cursor: 'pointer', fontSize: '12px'
                  }}
                >
                  Cancel
                </button>
              )}
                
              <div style={{ display: 'flex', gap: '8px' }}>
                {!selectedItemData?.tradeable !== false && (
                <button 
                  onClick={() => {
                    if (!clan) {
                      alert('You are not in a clan!');
                      return;
                    }
                    depositToVault(selectedItem, modalQuantity, inventory, setInventory);
                    setSelectedItem(null);
                  }}
                  disabled={!clan}
                  style={{ 
                    flex: 1, padding: '8px', backgroundColor: clan ? '#16242e' : '#2a3b4c', 
                    color: clan ? '#7b95a6' : '#555', border: 'none', borderRadius: '4px', 
                    fontSize: '11px', cursor: clan ? 'pointer' : 'not-allowed'
                  }}
                >
                  To Clan Vault
                </button>
                )}
                <button style={{ flex: 1, padding: '8px', backgroundColor: '#16242e', color: '#7b95a6', border: 'none', borderRadius: '4px', fontSize: '11px' }}>To Player</button>
              </div>
              
              <button onClick={() => setSelectedItem(null)} style={{ padding: '10px', backgroundColor: '#2a3b4c', color: '#c5d3df', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}