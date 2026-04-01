import React from 'react';

export default function VictoryModal({ ACTIONS, fightCaveVictory, setFightCaveVictory }) {
  if (!fightCaveVictory) return null;

  return (
    <div className="popup-overlay" onClick={() => setFightCaveVictory(false)}>
      <div className="popup-box victory-popup" onClick={e => e.stopPropagation()}>
        <h2>Congratulations!</h2>
        <p>You completed the Lava Cave!</p>
        <div className="victory-loot">
          <h3>Rewards:</h3>
          <ul>
            {Object.entries(ACTIONS.lava_cave.reward).map(([item, amount]) => (
              <li key={item}>{amount}x {item.replace('_', ' ')}</li>
            ))}
          </ul>
        </div>
        <button onClick={() => setFightCaveVictory(false)}>Close</button>
      </div>
    </div>
  );
}
