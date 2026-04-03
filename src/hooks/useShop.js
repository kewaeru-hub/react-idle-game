import { WEAPONS, ARMOR, AMMO, ITEMS } from '../data/gameData';

export function useShop(setInventory, inventory) {
  // Functie 1: Verkopen (aangeroepen vanuit de ItemModal in Inventory)
  const sellItemToShop = (itemId, amountToSell) => {
    setInventory(prev => {
      const currentQty = prev[itemId] || 0;
      
      // Check direct in de huidge state of we genoeg hebben
      if (currentQty >= amountToSell) {
        const itemData = ITEMS[itemId] || WEAPONS[itemId] || ARMOR[itemId] || AMMO[itemId] || {};
        const valuePerUnit = itemData.value || 1;

        return {
          ...prev,
          [itemId]: currentQty - amountToSell,
          coins: (prev.coins || 0) + (valuePerUnit * amountToSell)
        };
      }
      
      // Niet genoeg items? Doe niks.
      return prev; 
    });
  };

  // Functie 2: Kopen (aangeroepen vanuit de ShopView)
  const buyItemFromShop = (itemId, costPerUnit, amount) => {
    const totalCost = costPerUnit * amount;
    if ((inventory.coins || 0) >= totalCost) {
      setInventory(prev => ({
        ...prev,
        coins: prev.coins - totalCost,
        [itemId]: (prev[itemId] || 0) + amount
      }));
    }
  };

  // Functie 3: Upgrades kopen
  const buyUpgrade = (cost, extraSlots) => {
    if ((inventory.coins || 0) >= cost) {
      setInventory(prev => ({
        ...prev,
        coins: prev.coins - cost,
        maxSlots: (prev.maxSlots || 35) + extraSlots
      }));
    }
  };

  // Functie 4: Offline uren upgrade kopen
  const buyOfflineUpgrade = (cost) => {
    if ((inventory.coins || 0) >= cost) {
      setInventory(prev => ({
        ...prev,
        coins: prev.coins - cost,
        offlineHoursUpgrade: (prev.offlineHoursUpgrade || 0) + 1
      }));
    }
  };

  // Functie 5: Auto Toolbox upgrade kopen (beste tool in toolbox wordt automatisch gebruikt)
  const buyAutoToolUpgrade = (cost) => {
    if ((inventory.coins || 0) >= cost) {
      setInventory(prev => ({
        ...prev,
        coins: prev.coins - cost,
        autoToolboxUpgrade: 1
      }));
    }
  };

  // Functie 6: Auto Eat upgrade kopen
  const buyAutoEat = (cost) => {
    if ((inventory.coins || 0) >= cost) {
      setInventory(prev => ({
        ...prev,
        coins: prev.coins - cost,
        autoEatUpgrade: 1
      }));
    }
  };

  // Functie 7: Quest Upgrade kopen (meer quests & rerolls)
  const buyQuestUpgrade = (cost) => {
    if ((inventory.coins || 0) >= cost) {
      setInventory(prev => ({
        ...prev,
        coins: prev.coins - cost,
        questUpgrade: 1
      }));
    }
  };

  // Functie 8: Market Analytics Upgrade kopen
  const buyMarketAnalytics = (cost) => {
    if ((inventory.coins || 0) >= cost) {
      setInventory(prev => ({
        ...prev,
        coins: prev.coins - cost,
        marketAnalyticsUpgrade: 1
      }));
    }
  };

  return { sellItemToShop, buyItemFromShop, buyUpgrade, buyOfflineUpgrade, buyAutoToolUpgrade, buyAutoEat, buyQuestUpgrade, buyMarketAnalytics };
}
