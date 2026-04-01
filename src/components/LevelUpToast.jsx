import React from 'react';

export default function LevelUpToast({ levelUps, activeAction, ACTIONS, screen }) {
  return levelUps.map(lu => {
    const currentActionData = activeAction ? ACTIONS[activeAction] : null;
    const isTrainingThisSkillRightNow = currentActionData && screen === currentActionData.skill;
    
    // Als we NIET naar de training kijken, of in een menu zitten -> Subtle
    const isSubtle = !isTrainingThisSkillRightNow || ['inventory', 'shop', 'profile'].includes(screen);

    const baseStyle = {
      position: 'fixed',
      bottom: activeAction ? '120px' : '40px', 
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#111920',
      border: '2px solid #208b76',
      padding: '10px 25px',
      borderRadius: '50px',
      zIndex: isSubtle ? 1000000 : 1000001,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
      color: 'white',
      pointerEvents: 'none',
      animation: 'slideUpSubtle 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards'
    };

    return (
      <div key={lu.id} className="levelup-toast" style={baseStyle}>
        <span className="levelup-toast-icon" style={{ fontSize: '20px' }}>🎉</span>
        <span className="levelup-toast-text" style={{ fontWeight: 'bold', fontSize: '15px', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#4affd4', textTransform: 'capitalize' }}>{lu.skill}</span> level {lu.level}!
        </span>
      </div>
    );
  });
}
