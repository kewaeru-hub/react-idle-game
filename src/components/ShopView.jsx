import React, { useState } from 'react';
import { SHOP_STOCK, ITEMS, ITEM_IMAGES } from '../data/gameData';
import ItemTooltip from './ItemTooltip'; 

export default function ShopView({ inventory, buyItem, buyUpgrade, buyOfflineUpgrade, buyAutoToolUpgrade, buyAutoEat }) {
  const [activeTab, setActiveTab] = useState('items');
  const [purchaseAmounts, setPurchaseAmounts] = useState({});
  const [upgradeAmount, setUpgradeAmount] = useState(1);

  const setAmount = (id, amount) => setPurchaseAmounts(prev => ({ ...prev, [id]: amount }));

  // Inventory upgrade wiskunde
  const currentSlots = inventory.maxSlots || 35;
  const upgradesBought = (currentSlots - 35) / 5;
  const upgradeCost = Math.floor(2500 * Math.pow(1.135, upgradesBought)); 
  const isMaxed = currentSlots >= 300;
  const canAffordUpgrade = (inventory.coins || 0) >= upgradeCost;

  // Offline upgrade wiskunde
  const OFFLINE_UPGRADE_COSTS = [200_000, 1_000_000, 3_000_000, 8_000_000, 20_000_000, 50_000_000];
  const offlineHoursTier = inventory.offlineHoursUpgrade || 0;
  const offlineIsMaxed = offlineHoursTier >= 6;
  const offlineUpgradeCost = OFFLINE_UPGRADE_COSTS[offlineHoursTier] || 0;
  const canAffordOfflineUpgrade = (inventory.coins || 0) >= offlineUpgradeCost && !offlineIsMaxed;
  const currentOfflineHours = 12 + offlineHoursTier;

  return (
    <div className="card shop-view">
      <div className="shop-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h1 className="shop-title" style={{ color: '#4affd4' }}>General Store</h1>
        <span className="shop-gold" style={{ fontSize: '18px', color: '#f1c40f', fontWeight: 'bold' }}>💰 {inventory.coins?.toLocaleString() || 0} gp</span>
      </div>

      {/* TABS MENU */}
      <div className="shop-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #2a3b4c', paddingBottom: '15px' }}>
        <button 
          onClick={() => setActiveTab('items')}
          style={{ padding: '8px 20px', background: activeTab === 'items' ? '#208b76' : '#152029', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >Store Items</button>
        <button 
          onClick={() => setActiveTab('upgrades')}
          style={{ padding: '8px 20px', background: activeTab === 'upgrades' ? '#208b76' : '#152029', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >Account Upgrades</button>
      </div>
      
      {/* TAB 1: ITEMS */}
      {activeTab === 'items' && (
        <div style={{ display: 'grid', gap: '15px' }}>
          {SHOP_STOCK.map(item => {
            const itemData = ITEMS[item.id] || { name: item.id };
            const amountToBuy = purchaseAmounts[item.id] || 1;
            const totalCost = item.cost * amountToBuy;
            
            const maxAffordable = Math.floor((inventory.coins || 0) / item.cost);
            const sliderMax = Math.max(1, maxAffordable);
            const canAfford = (inventory.coins || 0) >= totalCost;

            return (
              <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'row', gap: '15px', padding: '15px', backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center' }}>
                {/* Item Image */}
                {ITEM_IMAGES[item.id] && (
                  <ItemTooltip itemKey={item.id} count={inventory[item.id] || 0}>
                    <img src={ITEM_IMAGES[item.id]} alt={item.id} style={{ width: '50px', height: '50px', objectFit: 'contain', flexShrink: 0 }} />
                  </ItemTooltip>
                )}
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '16px', textTransform: 'capitalize' }}>{itemData.name}</div>
                      <div style={{ fontSize: '12px', color: '#f1c40f' }}>Cost: {item.cost.toLocaleString()} gp per item</div>
                    </div>
                    <button 
                      onClick={() => buyItem(item.id, item.cost, amountToBuy)} 
                      disabled={!canAfford}
                      style={{ padding: '8px 15px', backgroundColor: canAfford ? '#2ecc71' : '#dc3545', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: canAfford ? 'pointer' : 'not-allowed', opacity: canAfford ? 1 : 0.5 }}
                    >Buy ({totalCost.toLocaleString()})</button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                    <button onClick={() => setAmount(item.id, Math.max(1, amountToBuy - 1))} style={{ background: '#1a2630', color: '#4affd4', border: '1px solid #2a3b4c', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                    <input type="number" min="1" max={sliderMax} value={amountToBuy} onChange={e => setAmount(item.id, Math.max(1, Math.min(sliderMax, parseInt(e.target.value) || 1)))} style={{ width: '70px', textAlign: 'center', background: '#111920', color: 'white', border: '1px solid #2a3b4c', padding: '8px', borderRadius: '4px', fontWeight: 'bold' }} />
                    <button onClick={() => setAmount(item.id, Math.min(sliderMax, amountToBuy + 1))} style={{ background: '#1a2630', color: '#4affd4', border: '1px solid #2a3b4c', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                    <button onClick={() => setAmount(item.id, Math.max(1, maxAffordable))} style={{ background: '#208b76', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>MAX</button>
                    <input type="range" min="1" max={sliderMax} value={amountToBuy} onChange={e => setAmount(item.id, parseInt(e.target.value) || 1)} style={{ flex: 1, maxWidth: '150px', marginLeft: '10px', accentColor: '#4affd4', cursor: 'pointer' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: UPGRADES */}
      {activeTab === 'upgrades' && (
        <div style={{ display: 'grid', gap: '15px' }}>
          <div className="card" style={{ padding: '20px', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '5px' }}>🎒 Inventory Expansion</h3>
                <p style={{ color: '#c5d3df', fontSize: '14px' }}>
                  Current capacity: <strong style={{color: isMaxed ? '#2ecc71' : 'white'}}>{currentSlots} / 300</strong>
                </p>
              </div>
            </div>

            {!isMaxed && (() => {
              // Wiskunde voor de aankoop (Per Slot)
              const maxPossibleSlots = 300 - currentSlots;
              let maxAffordableSlots = 0;
              let cumulativeCost = 0;
              
              for (let i = 0; i < maxPossibleSlots; i++) {
                const tier = Math.floor(((currentSlots + i) - 35) / 5);
                const nextCost = Math.floor(5000 * Math.pow(1.1, tier));
                if (cumulativeCost + nextCost <= (inventory.coins || 0)) {
                  cumulativeCost += nextCost; 
                  maxAffordableSlots++;
                } else break;
              }
              
              const sliderMax = Math.max(1, maxAffordableSlots);
              const safeUpgradeAmount = Math.max(1, Math.min(upgradeAmount, sliderMax));
              
              let selectedTotalCost = 0;
              for (let i = 0; i < safeUpgradeAmount; i++) {
                const tier = Math.floor(((currentSlots + i) - 35) / 5);
                selectedTotalCost += Math.floor(5000 * Math.pow(1.1, tier));
              }
              
              const canAfford = (inventory.coins || 0) >= selectedTotalCost && maxAffordableSlots > 0;

              return (
                <div style={{ borderTop: '1px solid #2a3b4c', paddingTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <span style={{ fontWeight: 'bold' }}>Buy +{safeUpgradeAmount} Slots</span>
                    <button 
                      onClick={() => { buyUpgrade(selectedTotalCost, safeUpgradeAmount); setUpgradeAmount(1); }}
                      disabled={!canAfford}
                      style={{ padding: '8px 20px', background: canAfford ? '#2ecc71' : '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: canAfford ? 'pointer' : 'not-allowed', fontWeight: 'bold', opacity: canAfford ? 1 : 0.5 }}
                    >Buy ({selectedTotalCost.toLocaleString()} gp)</button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button onClick={() => setUpgradeAmount(Math.max(1, upgradeAmount - 1))} style={{ background: '#1a2630', color: '#4affd4', border: '1px solid #2a3b4c', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                    <input type="number" min="1" max={sliderMax} value={upgradeAmount} onChange={e => setUpgradeAmount(Math.max(1, Math.min(sliderMax, parseInt(e.target.value) || 1)))} style={{ width: '60px', textAlign: 'center', background: '#111920', color: 'white', border: '1px solid #2a3b4c', padding: '8px', borderRadius: '4px', fontWeight: 'bold' }} />
                    <button onClick={() => setUpgradeAmount(Math.min(sliderMax, upgradeAmount + 1))} style={{ background: '#1a2630', color: '#4affd4', border: '1px solid #2a3b4c', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                    <button onClick={() => setUpgradeAmount(Math.max(1, maxAffordableSlots))} style={{ background: '#208b76', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>MAX</button>
                    <input type="range" min="1" max={sliderMax} value={upgradeAmount} onChange={e => setUpgradeAmount(parseInt(e.target.value) || 1)} style={{ flex: 1, maxWidth: '200px', marginLeft: '10px', accentColor: '#4affd4', cursor: 'pointer' }} />
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Offline Time Upgrade - APART KAARTJE */}
          <div className="card" style={{ padding: '20px', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '5px' }}>⏰ Offline Time</h3>
                <p style={{ color: '#c5d3df', fontSize: '14px', marginBottom: 0 }}>
                  Current limit: <strong style={{color: offlineIsMaxed ? '#2ecc71' : 'white'}}>{currentOfflineHours}h / 24h</strong>
                </p>
              </div>
            </div>

            {!offlineIsMaxed ? (
              <div style={{ borderTop: '1px solid #2a3b4c', paddingTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', color: 'white' }}>Offline Time Upgrade ({offlineHoursTier}/6)</span>
                    <p style={{ fontSize: '12px', color: '#c5d3df', margin: '5px 0 0 0' }}>+1 hour offline progression</p>
                  </div>
                  <button 
                    onClick={() => buyOfflineUpgrade(offlineUpgradeCost)}
                    disabled={!canAffordOfflineUpgrade}
                    style={{ padding: '8px 20px', background: canAffordOfflineUpgrade ? '#2ecc71' : '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: canAffordOfflineUpgrade ? 'pointer' : 'not-allowed', fontWeight: 'bold', opacity: canAffordOfflineUpgrade ? 1 : 0.5 }}
                  >Buy ({offlineUpgradeCost.toLocaleString()} gp)</button>
                </div>
              </div>
            ) : (
              <div style={{ borderTop: '1px solid #2a3b4c', paddingTop: '15px', textAlign: 'center' }}>
                <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>✓ Maximum offline time unlocked!</span>
              </div>
            )}
          </div>

          {/* Auto Toolbox Upgrade */}
          <div className="card" style={{ padding: '20px', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '5px' }}>🧰 Auto Tool Equip</h3>
                <p style={{ color: '#c5d3df', fontSize: '14px', marginBottom: 0 }}>
                  Automatically uses the best tool in your toolbox while skilling. No need to manually equip!
                </p>
              </div>
            </div>
            {!(inventory.autoToolboxUpgrade) ? (() => {
              const cost = 100_000;
              const canAfford = (inventory.coins || 0) >= cost;
              return (
                <div style={{ borderTop: '1px solid #2a3b4c', paddingTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 'bold', color: 'white' }}>Auto Tool Equip</span>
                      <p style={{ fontSize: '12px', color: '#c5d3df', margin: '5px 0 0 0' }}>Best toolbox tool speed bonus applied automatically</p>
                    </div>
                    <button
                      onClick={() => buyAutoToolUpgrade(cost)}
                      disabled={!canAfford}
                      style={{ padding: '8px 20px', background: canAfford ? '#2ecc71' : '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: canAfford ? 'pointer' : 'not-allowed', fontWeight: 'bold', opacity: canAfford ? 1 : 0.5 }}
                    >Buy ({cost.toLocaleString()} gp)</button>
                  </div>
                </div>
              );
            })() : (
              <div style={{ borderTop: '1px solid #2a3b4c', paddingTop: '15px', textAlign: 'center' }}>
                <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>✓ Auto Tool Equip unlocked!</span>
              </div>
            )}
          </div>

          {/* Auto Eat Upgrade */}
          <div className="card" style={{ padding: '20px', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '5px' }}>🍖 Auto Eat</h3>
                <p style={{ color: '#c5d3df', fontSize: '14px', marginBottom: 0 }}>
                  Automatically eats food from your inventory during combat when your HP drops below a chosen threshold.
                </p>
              </div>
            </div>
            {!(inventory.autoEatUpgrade) ? (() => {
              const cost = 250_000;
              const canAfford = (inventory.coins || 0) >= cost;
              return (
                <div style={{ borderTop: '1px solid #2a3b4c', paddingTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 'bold', color: 'white' }}>Auto Eat</span>
                      <p style={{ fontSize: '12px', color: '#c5d3df', margin: '5px 0 0 0' }}>Set your eat threshold before each fight</p>
                    </div>
                    <button
                      onClick={() => buyAutoEat(cost)}
                      disabled={!canAfford}
                      style={{ padding: '8px 20px', background: canAfford ? '#2ecc71' : '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: canAfford ? 'pointer' : 'not-allowed', fontWeight: 'bold', opacity: canAfford ? 1 : 0.5 }}
                    >Buy ({cost.toLocaleString()} gp)</button>
                  </div>
                </div>
              );
            })() : (
              <div style={{ borderTop: '1px solid #2a3b4c', paddingTop: '15px', textAlign: 'center' }}>
                <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>✓ Auto Eat unlocked!</span>
              </div>
            )}
          </div>
        </div>
      )}        
    </div>
  );
}