import React from 'react';
import { ITEM_IMAGES } from '../data/gameData';

const NOTIF_STYLES = {
  perk: {
    bg: 'rgba(26, 58, 46, 0.95)',
    border: '#2ecc71',
    color: '#2ecc71',
    labelColor: '#7fbf8f',
    shadow: 'rgba(46, 204, 113, 0.3)',
    fallbackIcon: '🐾',
    animation: 'petPerkFloatIn 2s ease-out forwards',
  },
  tool_drop: {
    bg: 'rgba(58, 46, 16, 0.95)',
    border: '#f1c40f',
    color: '#f1c40f',
    labelColor: '#c9a84c',
    shadow: 'rgba(241, 196, 15, 0.35)',
    fallbackIcon: '⚒️',
    animation: 'petPerkFloatIn 4s ease-out forwards',
  },
  pet_drop: {
    bg: 'rgba(50, 26, 70, 0.95)',
    border: '#a855f7',
    color: '#a855f7',
    labelColor: '#c084fc',
    shadow: 'rgba(168, 85, 247, 0.35)',
    fallbackIcon: '🐾',
    animation: 'petPerkFloatIn 4s ease-out forwards',
  },
  warning: {
    bg: 'rgba(70, 30, 20, 0.95)',
    border: '#e74c3c',
    color: '#e74c3c',
    labelColor: '#f1948a',
    shadow: 'rgba(231, 76, 60, 0.35)',
    fallbackIcon: '⚠️',
    animation: 'petPerkFloatIn 3s ease-out forwards',
  },
};

const getLabel = (notif) => {
  switch (notif.type) {
    case 'tool_drop': return 'RARE DROP';
    case 'pet_drop': return 'PET DROP!';
    case 'warning': return '⚠️ WARNING';
    default: return `${notif.petName} Perk`;
  }
};

export default function PetNotificationDisplay({ petNotifications = [] }) {
  return (
    <div className="pet-notification-container" style={{
      position: 'fixed',
      top: '80px',
      left: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pointerEvents: 'none',
      zIndex: 99998
    }}>
      {petNotifications.map((notif) => {
        const s = NOTIF_STYLES[notif.type] || NOTIF_STYLES.perk;
        return (
          <div
            key={notif.id}
            className="pet-notification"
            style={{
              backgroundColor: s.bg,
              border: `2px solid ${s.border}`,
              borderRadius: '8px',
              padding: '10px 15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: s.color,
              textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
              boxShadow: `0 4px 12px ${s.shadow}`,
              animation: s.animation,
              backdropFilter: 'blur(4px)'
            }}>
              {notif.petId && ITEM_IMAGES[notif.petId] ? (
                <img 
                  src={ITEM_IMAGES[notif.petId]} 
                  alt={notif.petName}
                  className="pet-notification-img"
                  style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                />
              ) : (
                <span style={{ fontSize: '24px' }}>{s.fallbackIcon}</span>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '12px', color: s.labelColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {getLabel(notif)}
                </div>
                <div style={{ fontSize: '13px', color: s.color }}>
                  {notif.perkEffect}
                </div>
              </div>
            </div>
          );
      })}
    </div>
  );
}
