import React from 'react';
import ItemTooltip from './ItemTooltip';

export default function EquipmentGrid({
  equipment = {},
  equipmentAmounts = {},
  ITEM_IMAGES = {},
  getItemData,
  onSlotClick,
  smallSlots = ['pet', 'earrings', 'pocket'],
  gridClassName = 'combat-equip-grid',
  smallClassWrapperStyle = {},
}) {
  const renderSlot = (slotId, label, isSmall = false) => {
    const equippedItem = equipment[slotId];
    const itemImage = ITEM_IMAGES[equippedItem];
    const count = slotId === 'ammo' ? (equipmentAmounts?.ammo || 1) : 1;

    const slot = (
      <div
        key={slotId}
        onClick={() => onSlotClick && onSlotClick(slotId)}
        className={`equip-slot ${isSmall ? 'small' : ''}`}
        style={{ cursor: equippedItem ? 'pointer' : 'default' }}
      >
        {equippedItem ? (
          <>
            {itemImage ? (
              <img src={itemImage} alt={equippedItem} style={{ width: '90%', height: '90%', objectFit: 'contain', pointerEvents: 'none' }} />
            ) : (
              <strong style={{ fontSize: isSmall ? '11px' : '13px', color: '#fff' }}>{getItemData ? (getItemData(equippedItem)?.name || '').substring(0,3).toUpperCase() : equippedItem}</strong>
            )}
            {slotId === 'ammo' && (
              <span className="ammo-counter">{
                equipmentAmounts?.ammo >= 1000 ? (equipmentAmounts.ammo / 1000).toFixed(1) + 'k' : (equipmentAmounts?.ammo || 0)
              }</span>
            )}
          </>
        ) : (
          <span className="equip-label">{label}</span>
        )}
      </div>
    );

    if (equippedItem) {
      return (
        <ItemTooltip itemKey={equippedItem} count={count} getItemData={getItemData}>
          {slot}
        </ItemTooltip>
      );
    }
    return slot;
  };

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
      <div className="equip-small-column">
        {renderSlot('pet', 'Pet', true)}
        {renderSlot('tool', 'Tool', true)}
        {renderSlot('earrings', 'Ears', true)}
        {renderSlot('pocket', 'Pocket', true)}
      </div>

      <div>
        <div className={gridClassName}>
          <div style={{ gridColumn: '2 / 3', gridRow: '1 / 2' }}>{renderSlot('head', 'Head')}</div>
          <div style={{ gridColumn: '1 / 2', gridRow: '2 / 3' }}>{renderSlot('cape', 'Cape')}</div>
          <div style={{ gridColumn: '2 / 3', gridRow: '2 / 3' }}>{renderSlot('neck', 'Neck')}</div>
          <div style={{ gridColumn: '3 / 4', gridRow: '2 / 3' }}>{renderSlot('ammo', 'Ammo')}</div>

          <div style={{ gridColumn: '1 / 2', gridRow: '3 / 4' }}>{renderSlot('weapon', 'Weapon')}</div>
          <div style={{ gridColumn: '2 / 3', gridRow: '3 / 4' }}>{renderSlot('body', 'Body')}</div>
          <div style={{ gridColumn: '3 / 4', gridRow: '3 / 4' }}>{renderSlot('shield', 'Shield')}</div>

          <div style={{ gridColumn: '2 / 3', gridRow: '4 / 5' }}>{renderSlot('legs', 'Legs')}</div>
          <div style={{ gridColumn: '1 / 2', gridRow: '5 / 6' }}>{renderSlot('hands', 'Gloves')}</div>
          <div style={{ gridColumn: '2 / 3', gridRow: '5 / 6' }}>{renderSlot('feet', 'Boots')}</div>
          <div style={{ gridColumn: '3 / 4', gridRow: '5 / 6' }}>{renderSlot('ring', 'Ring')}</div>
        </div>
      </div>
    </div>
  );
}
