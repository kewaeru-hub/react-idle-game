import { useState, useRef } from 'react';
import { WEAPONS, ARMOR, AMMO, ITEMS, PETS } from '../data/gameData';

export function useEquipment(initialEquipment, initialAmounts, inventoryRef, setInventory, setCombatStyle, skillsRef) {
  const [equipment, setEquipment] = useState(initialEquipment);
  const [equipmentAmounts, setEquipmentAmounts] = useState(initialAmounts);

  const toggleEquip = (itemKey, amount = null) => {
    const itemData = WEAPONS[itemKey] || ARMOR[itemKey] || AMMO[itemKey] || PETS[itemKey] || ITEMS[itemKey];
    if (!itemData) return;

    let slot = itemData.equipSlot;
    if (WEAPONS[itemKey]) slot = 'weapon';
    if (AMMO[itemKey]) slot = 'ammo';
    if (!slot) return;

    // Level requirement check
    if (itemData.reqLvl && itemData.reqSkill && skillsRef?.current) {
      const playerLevel = skillsRef.current[itemData.reqSkill]?.level || 1;
      if (playerLevel < itemData.reqLvl) return;
    }

    const isAmmo = slot === 'ammo';
    const currentlyEquipped = equipment[slot];

    const isAddingMoreAmmo = currentlyEquipped === itemKey && isAmmo && amount !== null;
    const isUnequipping = currentlyEquipped === itemKey && !isAddingMoreAmmo;

    // Haal de meest actuele inventory op via de Ref (zo zijn we altijd safe)
    const currentInv = inventoryRef.current;
    const available = currentInv[itemKey] || 0;

    if (isAddingMoreAmmo) {
      // 1. BIJVULLEN (Geen geneste states meer!)
      const toAdd = Math.min(amount, available);
      
      // Update Ammo apart
      setEquipmentAmounts(prev => ({ ...prev, ammo: prev.ammo + toAdd }));
      
      // Update Inventory apart
      setInventory(prevInv => {
        const newInv = { ...prevInv };
        newInv[itemKey] -= toAdd;
        if (newInv[itemKey] <= 0) delete newInv[itemKey]; 
        return newInv;
      });
    } 
    else if (isUnequipping) {
      // 2. UNEQUIP 
      const returnAmount = isAmmo ? (equipmentAmounts.ammo || 0) : 1;
      
      if (isAmmo) setEquipmentAmounts(prev => ({ ...prev, ammo: 0 }));

      setInventory(prevInv => {
        const newInv = { ...prevInv };
        newInv[itemKey] = (newInv[itemKey] || 0) + returnAmount;
        return newInv;
      });
    } 
    else {
      // 3. EQUIP / SWAP 
      if (isAmmo) {
        const toEquip = amount ? Math.min(amount, available) : available;

        setEquipmentAmounts(prev => ({ ...prev, ammo: toEquip }));

        setInventory(prevInv => {
          const newInv = { ...prevInv };
          if (currentlyEquipped) {
            newInv[currentlyEquipped] = (newInv[currentlyEquipped] || 0) + (equipmentAmounts.ammo || 0);
          }
          newInv[itemKey] -= toEquip;
          if (newInv[itemKey] <= 0) delete newInv[itemKey]; 
          return newInv;
        });
      } else {
        // Normale items
        setInventory(prevInv => {
          const newInv = { ...prevInv };
          if (newInv[itemKey] > 0) newInv[itemKey] -= 1;
          if (currentlyEquipped) newInv[currentlyEquipped] = (newInv[currentlyEquipped] || 0) + 1;
          return newInv;
        });
      }
    }

    setEquipment(prevEq => ({
      ...prevEq,
      [slot]: isUnequipping ? null : itemKey
    }));

    if (slot === 'weapon') {
      if (isUnequipping) {
        setCombatStyle('attack'); 
      } else {
        const type = itemData.type;
        if (type === 'melee') setCombatStyle('attack');
        if (type === 'ranged') setCombatStyle('ranged');
        if (type === 'magic') setCombatStyle('magic');
      }
    }
  };

  return { equipment, setEquipment, equipmentAmounts, setEquipmentAmounts, toggleEquip };
}
