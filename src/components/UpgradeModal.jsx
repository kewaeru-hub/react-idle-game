import React, { useState } from 'react';

export default function UpgradeModal({ inventory, buyUpgrade, close }) {
  const [upgradeAmount, setUpgradeAmount] = useState(1); // Dit is nu het aantal LOSSE slots

  const currentSlots = inventory.maxSlots || 35;
  const isMaxed = currentSlots >= 300;
  const maxPossibleSlots = 300 - currentSlots;

  // 1. Bereken hoeveel LOSSE slots de speler maximaal kan betalen
  let maxAffordableSlots = 0;
  let cumulativeCost = 0;
  
  for (let i = 0; i < maxPossibleSlots; i++) {
    // Om de 5 slots stijgt de 'tier', wat de prijs met 14.75% verhoogt
    const tier = Math.floor(((currentSlots + i) - 35) / 5);
    const nextCost = Math.floor(5000 * Math.pow(1.1, tier));

    if (cumulativeCost + nextCost <= (inventory.coins || 0)) {
      cumulativeCost += nextCost;
      maxAffordableSlots++;
    } else {
      break;
    }
  }

  const sliderMax = Math.max(1, maxAffordableSlots);
  const safeUpgradeAmount = Math.max(1, Math.min(upgradeAmount, sliderMax));

  // 2. Bereken de exacte prijs voor de gekozen hoeveelheid slots
  let selectedTotalCost = 0;
  for (let i = 0; i < safeUpgradeAmount; i++) {
    const tier = Math.floor(((currentSlots + i) - 35) / 5);
    selectedTotalCost += Math.floor(5000 * Math.pow(1.1, tier));
  }

  const canAfford = (inventory.coins || 0) >= selectedTotalCost && maxAffordableSlots > 0;

  return (
    <div className="analytics-container" style={{ minWidth: '350px' }}>
      <h2 style={{ color: '#4affd4', marginBottom: '10px', borderBottom: '1px solid #2a3b4c', paddingBottom: '10px' }}>
        🎒 Inventory Expansion
      </h2>
      
      {isMaxed ? (
        <p style={{ color: '#2ecc71', textAlign: 'center', padding: '20px', fontWeight: 'bold' }}>You have reached the maximum inventory size (300 slots)!</p>
      ) : (
        <>
          <p style={{ color: '#c5d3df', marginBottom: '20px' }}>
            Current capacity: <strong style={{ color: 'white' }}>{currentSlots} / 300</strong>
          </p>

          <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>+{safeUpgradeAmount} Slots</span>
              <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>Cost: {selectedTotalCost.toLocaleString()} gp</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
              <button onClick={() => setUpgradeAmount(Math.max(1, upgradeAmount - 1))} style={{ background: '#1a2630', color: '#4affd4', border: '1px solid #2a3b4c', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
              <input type="number" min="1" max={sliderMax} value={upgradeAmount} onChange={e => setUpgradeAmount(Math.max(1, Math.min(sliderMax, parseInt(e.target.value) || 1)))} style={{ width: '60px', textAlign: 'center', background: '#111920', color: 'white', border: '1px solid #2a3b4c', padding: '8px', borderRadius: '4px', fontWeight: 'bold' }} />
              <button onClick={() => setUpgradeAmount(Math.min(sliderMax, upgradeAmount + 1))} style={{ background: '#1a2630', color: '#4affd4', border: '1px solid #2a3b4c', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
              <button onClick={() => setUpgradeAmount(Math.max(1, maxAffordableSlots))} style={{ background: '#208b76', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>MAX</button>
            </div>
            
            <input type="range" min="1" max={sliderMax} value={upgradeAmount} onChange={e => setUpgradeAmount(parseInt(e.target.value) || 1)} style={{ width: '100%', accentColor: '#4affd4', cursor: 'pointer', marginTop: '15px' }} />
          </div>

          <button 
            onClick={() => { buyUpgrade(selectedTotalCost, safeUpgradeAmount); setUpgradeAmount(1); }}
            disabled={!canAfford}
            style={{ width: '100%', padding: '12px', background: canAfford ? '#2ecc71' : '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: canAfford ? 'pointer' : 'not-allowed', fontWeight: 'bold', opacity: canAfford ? 1 : 0.5 }}
          >
            Buy {safeUpgradeAmount} Slots
          </button>
        </>
      )}

      <button onClick={close} style={{ width: '100%', marginTop: '10px', padding: '10px', backgroundColor: '#152029', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
    </div>
  );
}