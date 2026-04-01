import React from 'react';

export default function QuestModal() {
  const quests = [
    { name: "Cooked Shrimp", progress: 5, goal: 20, reward: "500 Coins" },
    { name: "Slay Goblins", progress: 12, goal: 50, reward: "Bronze Platebody" }
  ];

  return (
    <div className="quest-list">
      {quests.map(q => (
        <div key={q.name} className="card" style={{marginBottom: '10px', background: '#152029'}}>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <strong>{q.name}</strong>
            <span style={{color:'#4affd4'}}>{q.progress} / {q.goal}</span>
          </div>
          <div className="progress-container" style={{height:'10px', marginTop:'5px'}}>
            <div className="progress-bar" style={{width: `${(q.progress/q.goal)*100}%`}}></div>
          </div>
          <small style={{color:'#7b95a6'}}>Reward: {q.reward}</small>
        </div>
      ))}
    </div>
  );
}