// src/hooks/useMarket.js
// Grand Market — Fully online Supabase-based player trading
import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useMarket(userId, username) {
  const [marketOffers, setMarketOffers] = useState([]);
  const [marketSlots, setMarketSlots] = useState(3);
  const [orderHistory, setOrderHistory] = useState([]);
  const [marketScreen, setMarketScreen] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [allOffers, setAllOffers] = useState([]); // All active offers on the market (from all players)
  const [priceSummary, setPriceSummary] = useState({}); // Price data per item

  const subscriptionRef = useRef(null);
  const userIdRef = useRef(userId);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  // ============================================
  // HELPERS
  // ============================================
  function mapOfferFromDb(row) {
    return {
      id: row.id,
      userId: row.user_id,
      username: row.username,
      type: row.type,
      itemId: row.item_id,
      quantity: row.quantity,
      pricePerItem: row.price_per_item,
      fulfilled: row.fulfilled,
      totalCost: row.quantity * row.price_per_item,
      status: row.status,
      createdAt: new Date(row.created_at).getTime(),
      collectedItems: row.collected_items,
      collectedCoins: row.collected_coins
    };
  }

  function mapHistoryFromDb(row) {
    return {
      id: row.id,
      type: row.buyer_id === userIdRef.current ? 'buy' : 'sell',
      buyerName: row.buyer_name,
      sellerName: row.seller_name,
      itemId: row.item_id,
      quantity: row.quantity,
      pricePerItem: row.price_per_item,
      totalPrice: row.total_price,
      timestamp: new Date(row.traded_at).getTime()
    };
  }

  // ============================================
  // LOAD USER DATA ON MOUNT
  // ============================================
  useEffect(() => {
    if (!userId) return;

    const loadUserMarketData = async () => {
      setLoading(true);
      try {
        // Load user's own offers
        const { data: offers, error: offersErr } = await supabase
          .from('market_offers')
          .select('*')
          .eq('user_id', userId)
          .in('status', ['active', 'completed'])
          .order('created_at', { ascending: false });

        if (!offersErr && offers) {
          setMarketOffers(offers.map(mapOfferFromDb));
        }

        // Load user's market slots
        const { data: slotsData, error: slotsErr } = await supabase
          .from('market_slots')
          .select('slots')
          .eq('user_id', userId)
          .single();

        if (!slotsErr && slotsData) {
          setMarketSlots(slotsData.slots);
        } else {
          // Create default slots record
          await supabase.from('market_slots').upsert({ user_id: userId, slots: 3 });
          setMarketSlots(3);
        }

        // Load recent trade history (global)
        const { data: history, error: histErr } = await supabase
          .from('market_history')
          .select('*')
          .order('traded_at', { ascending: false })
          .limit(100);

        if (!histErr && history) {
          setOrderHistory(history.map(mapHistoryFromDb));
        }

        // Load all active offers (for browsing)
        const { data: allActive, error: allErr } = await supabase
          .from('market_offers')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(200);

        if (!allErr && allActive) {
          setAllOffers(allActive.map(mapOfferFromDb));
        }

        // Load price summaries
        const { data: prices, error: priceErr } = await supabase
          .from('market_price_summary')
          .select('*');

        if (!priceErr && prices) {
          const priceMap = {};
          prices.forEach(p => { priceMap[p.item_id] = p; });
          setPriceSummary(priceMap);
        }
      } catch (err) {
        console.error('[Market] Failed to load:', err);
      }
      setLoading(false);
    };

    loadUserMarketData();
  }, [userId]);

  // ============================================
  // REALTIME SUBSCRIPTION
  // ============================================
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('market_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'market_offers' }, (payload) => {
        const offer = payload.new ? mapOfferFromDb(payload.new) : null;
        const oldOffer = payload.old ? payload.old : null;

        if (payload.eventType === 'INSERT') {
          if (offer && offer.status === 'active') {
            setAllOffers(prev => [offer, ...prev]);
          }
          if (offer && offer.userId === userIdRef.current) {
            setMarketOffers(prev => {
              if (prev.find(o => o.id === offer.id)) return prev;
              return [offer, ...prev];
            });
          }
        } else if (payload.eventType === 'UPDATE') {
          if (offer) {
            setAllOffers(prev => prev.map(o => o.id === offer.id ? offer : o).filter(o => o.status === 'active'));
            if (offer.userId === userIdRef.current) {
              setMarketOffers(prev => prev.map(o => o.id === offer.id ? offer : o));
            }
          }
        } else if (payload.eventType === 'DELETE') {
          const deletedId = oldOffer?.id;
          if (deletedId) {
            setAllOffers(prev => prev.filter(o => o.id !== deletedId));
            setMarketOffers(prev => prev.filter(o => o.id !== deletedId));
          }
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'market_history' }, (payload) => {
        const entry = payload.new ? mapHistoryFromDb(payload.new) : null;
        if (entry) {
          setOrderHistory(prev => [entry, ...prev].slice(0, 100));
        }
      })
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [userId]);

  // ============================================
  // REFRESH MY OFFERS (after matching)
  // ============================================
  const refreshMyOffers = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('market_offers')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'completed'])
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMarketOffers(data.map(mapOfferFromDb));
    }
  }, [userId]);

  // ============================================
  // CREATE BUY OFFER
  // ============================================
  const createBuyOffer = useCallback(async (itemId, quantity, pricePerItem, setInventory) => {
    if (!userId) return;

    const activeOffers = marketOffers.filter(o => o.status === 'active' || o.status === 'completed');
    if (activeOffers.length >= marketSlots) {
      alert('No available market slots!');
      return;
    }

    const totalCost = quantity * pricePerItem;

    // Deduct coins locally first
    let hadEnough = false;
    setInventory(inv => {
      if ((inv.coins || 0) >= totalCost) {
        hadEnough = true;
        return { ...inv, coins: inv.coins - totalCost };
      }
      return inv;
    });

    await new Promise(r => setTimeout(r, 50));
    if (!hadEnough) {
      alert('Not enough coins!');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('market_offers')
        .insert({
          user_id: userId,
          username: username || 'Unknown',
          type: 'buy',
          item_id: itemId,
          quantity,
          price_per_item: pricePerItem,
          fulfilled: 0,
          collected_items: 0,
          collected_coins: 0,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('[Market] Failed to create buy offer:', error);
        setInventory(inv => ({ ...inv, coins: (inv.coins || 0) + totalCost }));
        alert('Failed to create buy offer. Coins refunded.');
        return;
      }

      const newOffer = mapOfferFromDb(data);
      setMarketOffers(prev => [newOffer, ...prev]);

      // Trigger server-side matching
      try {
        await supabase.rpc('match_market_offers', { p_offer_id: data.id });
        await refreshMyOffers();
      } catch (matchErr) {
        console.warn('[Market] Matching failed (may not have matching offers):', matchErr);
      }
    } catch (err) {
      console.error('[Market] Buy offer error:', err);
      setInventory(inv => ({ ...inv, coins: (inv.coins || 0) + totalCost }));
    }
  }, [userId, username, marketOffers, marketSlots, refreshMyOffers]);

  // ============================================
  // CREATE SELL OFFER
  // ============================================
  const createSellOffer = useCallback(async (itemId, quantity, pricePerItem, setInventory) => {
    if (!userId) return;

    const activeOffers = marketOffers.filter(o => o.status === 'active' || o.status === 'completed');
    if (activeOffers.length >= marketSlots) {
      alert('No available market slots!');
      return;
    }

    let hadEnough = false;
    setInventory(inv => {
      const itemCount = inv[itemId] || 0;
      if (itemCount >= quantity) {
        hadEnough = true;
        return { ...inv, [itemId]: itemCount - quantity };
      }
      return inv;
    });

    await new Promise(r => setTimeout(r, 50));
    if (!hadEnough) {
      alert('Not enough items!');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('market_offers')
        .insert({
          user_id: userId,
          username: username || 'Unknown',
          type: 'sell',
          item_id: itemId,
          quantity,
          price_per_item: pricePerItem,
          fulfilled: 0,
          collected_items: 0,
          collected_coins: 0,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('[Market] Failed to create sell offer:', error);
        setInventory(inv => ({ ...inv, [itemId]: (inv[itemId] || 0) + quantity }));
        alert('Failed to create sell offer. Items refunded.');
        return;
      }

      const newOffer = mapOfferFromDb(data);
      setMarketOffers(prev => [newOffer, ...prev]);

      try {
        await supabase.rpc('match_market_offers', { p_offer_id: data.id });
        await refreshMyOffers();
      } catch (matchErr) {
        console.warn('[Market] Matching failed:', matchErr);
      }
    } catch (err) {
      console.error('[Market] Sell offer error:', err);
      setInventory(inv => ({ ...inv, [itemId]: (inv[itemId] || 0) + quantity }));
    }
  }, [userId, username, marketOffers, marketSlots, refreshMyOffers]);

  // ============================================
  // CANCEL OFFER
  // ============================================
  const cancelOffer = useCallback(async (offerId, setInventory) => {
    const offer = marketOffers.find(o => o.id === offerId);
    if (!offer) return;

    const remaining = offer.quantity - offer.fulfilled;

    try {
      const { error } = await supabase
        .from('market_offers')
        .update({ status: 'cancelled' })
        .eq('id', offerId)
        .eq('user_id', userId);

      if (error) {
        console.error('[Market] Failed to cancel offer:', error);
        return;
      }

      // Refund remaining items/coins
      if (offer.type === 'buy') {
        const coinRefund = remaining * offer.pricePerItem;
        setInventory(inv => ({
          ...inv,
          coins: (inv.coins || 0) + coinRefund
        }));
      } else {
        setInventory(inv => ({
          ...inv,
          [offer.itemId]: (inv[offer.itemId] || 0) + remaining
        }));
      }

      // Also collect any pending items/coins
      if (offer.type === 'buy' && offer.collectedItems > 0) {
        setInventory(inv => ({
          ...inv,
          [offer.itemId]: (inv[offer.itemId] || 0) + offer.collectedItems
        }));
      } else if (offer.type === 'sell' && offer.collectedCoins > 0) {
        setInventory(inv => ({
          ...inv,
          coins: (inv.coins || 0) + offer.collectedCoins
        }));
      }

      setMarketOffers(prev => prev.filter(o => o.id !== offerId));
    } catch (err) {
      console.error('[Market] Cancel error:', err);
    }
  }, [marketOffers, userId]);

  // ============================================
  // COLLECT OFFER
  // ============================================
  const collectOffer = useCallback(async (offerId, setInventory) => {
    const offer = marketOffers.find(o => o.id === offerId);
    if (!offer) return;

    try {
      if (offer.type === 'buy' && offer.collectedItems > 0) {
        setInventory(inv => ({
          ...inv,
          [offer.itemId]: (inv[offer.itemId] || 0) + offer.collectedItems
        }));
      } else if (offer.type === 'sell' && offer.collectedCoins > 0) {
        setInventory(inv => ({
          ...inv,
          coins: (inv.coins || 0) + offer.collectedCoins
        }));
      }

      await supabase
        .from('market_offers')
        .update({ collected_items: 0, collected_coins: 0 })
        .eq('id', offerId)
        .eq('user_id', userId);

      setMarketOffers(prev => {
        const updated = prev.map(o =>
          o.id === offerId ? { ...o, collectedItems: 0, collectedCoins: 0 } : o
        );
        return updated.filter(o =>
          !(o.fulfilled >= o.quantity && o.collectedItems === 0 && o.collectedCoins === 0)
        );
      });
    } catch (err) {
      console.error('[Market] Collect error:', err);
    }
  }, [marketOffers, userId]);

  // ============================================
  // COLLECT ALL OFFERS
  // ============================================
  const collectAllOffers = useCallback(async (setInventory) => {
    const toCollect = marketOffers.filter(o => o.collectedItems > 0 || o.collectedCoins > 0);
    if (toCollect.length === 0) return;

    for (const offer of toCollect) {
      if (offer.type === 'buy' && offer.collectedItems > 0) {
        setInventory(inv => ({
          ...inv,
          [offer.itemId]: (inv[offer.itemId] || 0) + offer.collectedItems
        }));
      } else if (offer.type === 'sell' && offer.collectedCoins > 0) {
        setInventory(inv => ({
          ...inv,
          coins: (inv.coins || 0) + offer.collectedCoins
        }));
      }
    }

    for (const offer of toCollect) {
      await supabase
        .from('market_offers')
        .update({ collected_items: 0, collected_coins: 0 })
        .eq('id', offer.id)
        .eq('user_id', userId);
    }

    setMarketOffers(prev => {
      return prev
        .map(o => {
          if (toCollect.find(c => c.id === o.id)) {
            return { ...o, collectedItems: 0, collectedCoins: 0 };
          }
          return o;
        })
        .filter(o => !(o.fulfilled >= o.quantity && o.collectedItems === 0 && o.collectedCoins === 0));
    });
  }, [marketOffers, userId]);

  // ============================================
  // PURCHASE MARKET SLOT
  // ============================================
  const purchaseMarketSlot = useCallback(async (setInventory) => {
    if (marketSlots >= 6) {
      alert('Maximum 6 market slots!');
      return;
    }

    const slotCosts = { 4: 50000, 5: 150000, 6: 500000 };
    const cost = slotCosts[marketSlots + 1];
    if (!cost) return;

    let hadEnough = false;
    setInventory(inv => {
      if ((inv.coins || 0) >= cost) {
        hadEnough = true;
        return { ...inv, coins: inv.coins - cost };
      }
      alert(`Need ${cost.toLocaleString()} coins!`);
      return inv;
    });

    await new Promise(r => setTimeout(r, 50));
    if (!hadEnough) return;

    const newSlots = marketSlots + 1;

    try {
      const { error } = await supabase
        .from('market_slots')
        .upsert({ user_id: userId, slots: newSlots });

      if (error) {
        console.error('[Market] Failed to upgrade slots:', error);
        setInventory(inv => ({ ...inv, coins: (inv.coins || 0) + cost }));
        return;
      }

      setMarketSlots(newSlots);
    } catch (err) {
      console.error('[Market] Slot upgrade error:', err);
      setInventory(inv => ({ ...inv, coins: (inv.coins || 0) + cost }));
    }
  }, [marketSlots, userId]);

  // ============================================
  // PROCESS MARKET TICK — refreshes data from server
  // ============================================
  const processMarketTick = useCallback(async () => {
    if (!userId) return;
    await refreshMyOffers();
  }, [userId, refreshMyOffers]);

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
    processMarketTick,
    // New online-specific exports
    allOffers,
    priceSummary,
    loading,
    refreshMyOffers
  };
}
