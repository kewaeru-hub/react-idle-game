import React from 'react';

export default function ActionProgressBar({ activeAction, ACTIONS, progress, stopAction }) {
  const data = ACTIONS[activeAction];

  return (
    <div className="action-progress-bar" style={{ padding: '15px 30px', background: '#111920', borderBottom: '1px solid #2a3b4c' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ color: '#4affd4', fontWeight: 'bold' }}>Active task: {data?.name}</span>
        <button className="btn-stop" onClick={stopAction}>Stop</button>
      </div>
      <div style={{ position: 'relative', height: '20px', backgroundColor: '#0b1014', borderRadius: '4px', overflow: 'hidden', border: '1px solid #2a3b4c' }}>
        <div style={{ width: `${Math.min(100, progress)}%`, height: '100%', backgroundColor: '#2ecc71', transition: 'width 0.05s linear' }}></div>
      </div>
    </div>
  );
}