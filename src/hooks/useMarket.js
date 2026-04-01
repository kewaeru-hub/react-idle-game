import { useState, useCallback } from 'react';

export function useMarket() {
  const [marketOffers, setMarketOffers] = useState([]);
  const [marketSlots, setMarketSlots] = useState(3); // begint met 3, max 6
  const [orderHistory, setOrderHistory] = useState([]);
  const [marketScreen, setMarketScreen] = useState('overview'); // 'overview' | 'sell' | 'history'

  // ============================================
  // CREATE BUY OFFER
  // ============================================
  const createBuyOffer = useCallback((itemId, quantity, pricePerItem, setInventory) => {
    setMarketOffers(prev => {
      const activeOffers = prev.filter(o => o.status === 'active' || o.status === 'completed');
      
      // Check slot beschikbaarheid
      if (activeOffers.length >= marketSlots) {
        alert('No available market slots!');
        return prev;
      }

      // Check coins in inventory
      const totalCost = quantity * pricePerItem;
      // We moeten via setInventory checken, maar hier kunnen we het inventory object niet direct lezen
      // Workaround: we accept coins via functional update in setInventory
      
      // Maak nieuw offer
      const newOffer = {
        id: Date.now() + Math.random(),
        type: 'buy',
        itemId,
        quantity,
        pricePerItem,
        fulfilled: 0,
        totalCost,
        status: 'active',
        createdAt: Date.now(),
        collectedItems: 0,
        collectedCoins: 0
      };

      // Trek coins af uit inventory
      setInventory(inv => {
        const currentCoins = inv.coins || 0;
        if (currentCoins >= totalCost) {
          return { ...inv, coins: currentCoins - totalCost };
        } else {
          alert('Not enough coins!');
          return inv;
        }
      });

      return [...prev, newOffer];
    });
  }, [marketSlots]);

  // ============================================
  // CREATE SELL OFFER
  // ============================================
  const createSellOffer = useCallback((itemId, quantity, pricePerItem, setInventory) => {
    setMarketOffers(prev => {
      const activeOffers = prev.filter(o => o.status === 'active' || o.status === 'completed');
      
      // Check slots
      if (activeOffers.length >= marketSlots) {
        alert('No available market slots!');
        return prev;
      }

      // Check items in inventory
      setInventory(inv => {
        const itemCount = inv[itemId] || 0;
        if (itemCount >= quantity) {
          // Trek items af
          return { ...inv, [itemId]: itemCount - quantity };
        } else {
          alert('Not enough items!');
          return inv;
        }
      });

      const newOffer = {
        id: Date.now() + Math.random(),
        type: 'sell',
        itemId,
        quantity,
        pricePerItem,
        fulfilled: 0,
        totalCost: quantity * pricePerItem,
        status: 'active',
        createdAt: Date.now(),
        collectedItems: 0,
        collectedCoins: 0
      };

      return [...prev, newOffer];
    });
  }, [marketSlots]);

  // ============================================
  // CANCEL OFFER
  // ============================================
  const cancelOffer = useCallback((offerId, setInventory) => {
    setMarketOffers(prev => {
      const offer = prev.find(o => o.id === offerId);
      if (!offer) return prev;

      const restingQuantity = offer.quantity - offer.fulfilled;

      // Geef resterende items/coins terug
      if (offer.type === 'buy') {
        // Geef coins terug
        const coinRefund = restingQuantity * offer.pricePerItem;
        setInventory(inv => ({
          ...inv,
          coins: (inv.coins || 0) + coinRefund
        }));
      } else {
        // Geef items terug
        setInventory(inv => ({
          ...inv,
          [offer.itemId]: (inv[offer.itemId] || 0) + restingQuantity
        }));
      }

      // Mark as cancelled
      return prev.map(o => 
        o.id === offerId ? { ...o, status: 'cancelled' } : o
      );
    });
  }, []);

  // ============================================
  // COLLECT OFFER
  // ============================================
  const collectOffer = useCallback((offerId, setInventory) => {
    setMarketOffers(prev => {
      const offer = prev.find(o => o.id === offerId);
      if (!offer) return prev;

      // Geef items/coins aan inventory
      if (offer.type === 'buy') {
        // Geef collected items
        setInventory(inv => ({
          ...inv,
          [offer.itemId]: (inv[offer.itemId] || 0) + offer.collectedItems
        }));
      } else {
        // Geef collected coins
        setInventory(inv => ({
          ...inv,
          coins: (inv.coins || 0) + offer.collectedCoins
        }));
      }

      // Reset collected counters
      const updated = prev.map(o => 
        o.id === offerId ? { ...o, collectedItems: 0, collectedCoins: 0 } : o
      );

      // Verwijder voltooid offers
      return updated.filter(o => !(o.fulfilled >= o.quantity && o.collectedItems === 0 && o.collectedCoins === 0));
    });
  }, []);

  // ============================================
  // COLLECT ALL OFFERS
  // ============================================
  const collectAllOffers = useCallback((setInventory) => {
    setMarketOffers(prev => {
      const toCollect = prev.filter(o => o.collectedItems > 0 || o.collectedCoins > 0);

      // Verzamel alles
      toCollect.forEach(offer => {
        if (offer.type === 'buy') {
          setInventory(inv => ({
            ...inv,
            [offer.itemId]: (inv[offer.itemId] || 0) + offer.collectedItems
          }));
        } else {
          setInventory(inv => ({
            ...inv,
            coins: (inv.coins || 0) + offer.collectedCoins
          }));
        }
      });

      // Reset en verwijder voltooid
      return prev
        .map(o => {
          if (o.collectedItems > 0 || o.collectedCoins > 0) {
            return { ...o, collectedItems: 0, collectedCoins: 0 };
          }
          return o;
        })
        .filter(o => !(o.fulfilled >= o.quantity && o.collectedItems === 0 && o.collectedCoins === 0));
    });
  }, []);

  // ============================================
  // PROCESS MARKET TICK (simulatie)
  // ============================================
  const processMarketTick = useCallback(() => {
    setMarketOffers(prev => 
      prev.map(offer => {
        if (offer.status !== 'active') return offer;

        const remaining = offer.quantity - offer.fulfilled;
        if (remaining <= 0) return offer;

        // Random fill: 1-15% per tick
        const fillPercent = 0.01 + Math.random() * 0.14;
        const fillAmount = Math.max(1, Math.floor(remaining * fillPercent));
        const actualFill = Math.min(fillAmount, remaining);

        const newOffer = {
          ...offer,
          fulfilled: offer.fulfilled + actualFill
        };

        // Update collected coins/items
        if (offer.type === 'buy') {
          newOffer.collectedItems = offer.collectedItems + actualFill;
        } else {
          newOffer.collectedCoins = offer.collectedCoins + (actualFill * offer.pricePerItem);
        }

        // Check completion
        if (newOffer.fulfilled >= newOffer.quantity) {
          newOffer.status = 'completed';
        }

        // Voeg toe aan order history
        setOrderHistory(hist => [
          ...hist,
          {
            id: Date.now() + Math.random(),
            type: offer.type,
            itemId: offer.itemId,
            quantity: actualFill,
            pricePerItem: offer.pricePerItem,
            timestamp: Date.now()
          }
        ]);

        return newOffer;
      })
    );
  }, []);

  // ============================================
  // PURCHASE MARKET SLOT
  // ============================================
  const purchaseMarketSlot = useCallback((setInventory) => {
    setMarketSlots(prev => {
      if (prev >= 6) {
        alert('Maximum 6 market slots!');
        return prev;
      }

      // Costs: slot 4 = 50k, slot 5 = 150k, slot 6 = 500k
      const slotCosts = {
        4: 50000,
        5: 150000,
        6: 500000
      };
      const cost = slotCosts[prev + 1];

      // Check coins
      setInventory(inv => {
        if ((inv.coins || 0) >= cost) {
          return { ...inv, coins: inv.coins - cost };
        } else {
          alert(`Need ${cost.toLocaleString()} coins!`);
          return inv;
        }
      });

      return prev + 1;
    });
  }, []);

  return {
    marketOffers,
    setMarketOffers,
    marketSlots,
    setMarketSlots,
    orderHistory,
    setOrderHistory,
    marketScreen,
    setMarketScreen,
    createBuyOffer,
    createSellOffer,
    cancelOffer,
    collectOffer,
    collectAllOffers,
    purchaseMarketSlot,
    processMarketTick
  };
}
