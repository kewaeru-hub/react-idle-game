import React, { useState, useMemo } from 'react';
import { ITEMS, ITEM_IMAGES } from '../data/gameData';
import ItemTooltip from './ItemTooltip';

export default function MarketView({
  inventory,
  setInventory,
  marketOffers,
  marketSlots,
  orderHistory,
  marketScreen,
  setMarketScreen,
  createBuyOffer,
  createSellOffer,
  cancelOffer,
  collectOffer,
  collectAllOffers,
  purchaseMarketSlot
}) {
  // Modals
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showPopularItemModal, setShowPopularItemModal] = useState(false);
  const [popularItemModalMode, setPopularItemModalMode] = useState('buy'); // 'buy' or 'sell'
  const [modalItemId, setModalItemId] = useState('');
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalPrice, setModalPrice] = useState(0);
  const [selectedChartItem, setSelectedChartItem] = useState('iron_ore');
  const [buyModalSearch, setBuyModalSearch] = useState('');
  const [sellModalSearch, setSellModalSearch] = useState('');
  const [chartItemSearch, setChartItemSearch] = useState('');

  // Popular items list
  const popularItems = ['iron_ore', 'coal_ore', 'cooked_shrimp', 'oak_log', 'bronze_bar', 'steel_bar', 'raw_lobster', 'yew_log'];

  // Generated chart data (simulated)
  const chartData = useMemo(() => 
    Array.from({ length: 24 }, (_, i) => {
      const baseValue = ITEMS[selectedChartItem]?.value || 100;
      return {
        hour: i,
        price: Math.floor(baseValue * (0.7 + Math.random() * 0.6))
      };
    }), [selectedChartItem]
  );

  // Popular items dengan simulated data
  const popularItemsWithData = useMemo(() => {
    return popularItems.map(itemId => {
      const baseValue = ITEMS[itemId]?.value || 100;
      const currentPrice = Math.floor(baseValue * (0.85 + Math.random() * 0.3));
      const prevPrice = Math.floor(baseValue * (0.8 + Math.random() * 0.35));
      const change = Math.round(((currentPrice - prevPrice) / prevPrice) * 100);
      const volume = Math.floor(100 + Math.random() * 900);
      return { itemId, currentPrice, change, volume };
    });
  }, []);

  const activeOffers = marketOffers.filter(o => o.status === 'active' || o.status === 'completed');
  const maxChartPrice = Math.max(...chartData.map(d => d.price));

  // Filtered items for search
  const filteredBuyItems = useMemo(() => {
    if (!buyModalSearch) return Object.entries(ITEMS).filter(([k]) => k !== 'coins').slice(0, 8);
    return Object.entries(ITEMS)
      .filter(([k, v]) => k !== 'coins' && (k.toLowerCase().includes(buyModalSearch.toLowerCase()) || v.name.toLowerCase().includes(buyModalSearch.toLowerCase())))
      .slice(0, 15);
  }, [buyModalSearch]);

  const filteredSellItems = useMemo(() => {
    if (!sellModalSearch) return Object.entries(inventory).filter(([k, v]) => k !== 'coins' && k !== 'maxSlots' && v > 0 && ITEMS[k]).slice(0, 8);
    return Object.entries(inventory)
      .filter(([k, v]) => k !== 'coins' && k !== 'maxSlots' && v > 0 && ITEMS[k] && (k.toLowerCase().includes(sellModalSearch.toLowerCase()) || ITEMS[k].name.toLowerCase().includes(sellModalSearch.toLowerCase())))
      .slice(0, 15);
  }, [sellModalSearch, inventory]);

  const filteredChartItems = useMemo(() => {
    if (!chartItemSearch) return [];
    return Object.entries(ITEMS)
      .filter(([k, v]) => k !== 'coins' && (k.toLowerCase().includes(chartItemSearch.toLowerCase()) || v.name.toLowerCase().includes(chartItemSearch.toLowerCase())))
      .slice(0, 15);
  }, [chartItemSearch]);

  const handleOpenBuyModal = () => {
    setModalItemId('');
    setModalQuantity(1);
    setModalPrice(0);
    setBuyModalSearch('');
    setShowBuyModal(true);
  };

  const handleOpenSellModal = () => {
    setModalItemId('');
    setModalQuantity(1);
    setModalPrice(0);
    setSellModalSearch('');
    setShowSellModal(true);
  };

  const handleCreateBuy = () => {
    if (!modalItemId || modalQuantity < 1 || modalPrice < 1) return;
    createBuyOffer(modalItemId, modalQuantity, modalPrice, setInventory);
    setShowBuyModal(false);
    setModalItemId('');
    setModalQuantity(1);
    setModalPrice(0);
  };

  const handleCreateSell = () => {
    if (!modalItemId || modalQuantity < 1 || modalPrice < 1) return;
    createSellOffer(modalItemId, modalQuantity, modalPrice, setInventory);
    setShowSellModal(false);
    setModalItemId('');
    setModalQuantity(1);
    setModalPrice(0);
  };

  const handleItemSelect = (itemId) => {
    setModalItemId(itemId);
    setModalPrice(ITEMS[itemId]?.value || 0);
  };

  const handleOpenPopularItemModal = (itemId, initialMode = 'buy') => {
    setModalItemId(itemId);
    setModalQuantity(1);
    setModalPrice(ITEMS[itemId]?.value || 0);
    setPopularItemModalMode(initialMode);
    setShowPopularItemModal(true);
  };

  return (
    <div className="card market-card">
      {/* HEADER */}
      <div className="market-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h1 style={{ color: '#66FCF1', fontFamily: "'Carter One', cursive", marginBottom: 0 }}>⚖️ Grand Market</h1>
        <span style={{ fontSize: '18px', color: '#f1c40f', fontWeight: 'bold' }}>
          💰 {inventory.coins?.toLocaleString() || 0} gp
        </span>
      </div>

      {/* TABS */}
      <div className="market-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #2a3b4c', paddingBottom: '15px' }}>
        {[
          { key: 'overview', label: '📊 Overview' },
          { key: 'sell', label: '💰 Sell Offers' },
          { key: 'history', label: '📜 Trading History' }
        ].map(tab => (
          <button
            key={tab.key}
            className="market-tab-btn"
            onClick={() => setMarketScreen(tab.key)}
            style={{
              padding: '8px 20px',
              background: marketScreen === tab.key ? '#208b76' : '#152029',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {marketScreen === 'overview' && (
        <div className="market-overview-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* LIVE TRADING HUB */}
            <div className="market-section">
              <h3 style={{ color: '#F1FAEE', marginBottom: '16px', fontFamily: "'Carter One', cursive" }}>📊 Live Trading Hub</h3>
              
              <label style={{ color: '#F1FAEE', display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: 'bold' }}>
                Select Item
              </label>
              <div style={{ position: 'relative', marginBottom: '14px' }}>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={chartItemSearch}
                  onChange={e => setChartItemSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#111920',
                    color: 'white',
                    border: '1px solid rgba(102, 252, 241, 0.3)',
                    borderRadius: '6px',
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '13px'
                  }}
                />
                {chartItemSearch && filteredChartItems.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#111920',
                    border: '1px solid rgba(102, 252, 241, 0.3)',
                    borderTop: 'none',
                    borderRadius: '0 0 6px 6px',
                    maxHeight: '150px',
                    overflowY: 'auto',
                    zIndex: 10
                  }}>
                    {filteredChartItems.map(([id, item]) => (
                      <div
                        key={id}
                        onClick={() => {
                          setSelectedChartItem(id);
                          setChartItemSearch('');
                        }}
                        style={{
                          padding: '8px 12px',
                          color: '#F1FAEE',
                          cursor: 'pointer',
                          borderBottom: '1px solid rgba(102, 252, 241, 0.1)',
                          transition: 'background 0.2s',
                          fontSize: '13px'
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(102, 252, 241, 0.15)'}
                        onMouseLeave={e => e.target.style.background = 'transparent'}
                      >
                        {item.name}
                      </div>
                    ))}
                  </div>
                )}
                {!chartItemSearch && (
                  <div style={{
                    fontSize: '12px',
                    color: '#8a9ba8',
                    marginTop: '4px'
                  }}>
                    Huidige: {ITEMS[selectedChartItem]?.name || selectedChartItem}
                  </div>
                )}
              </div>

              {/* CHART */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                height: '120px',
                gap: '2px',
                padding: '10px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                marginBottom: '14px'
              }}>
                {chartData.map((d, i) => {
                  const heightPercent = (d.price / maxChartPrice) * 100;
                  return (
                    <div
                      key={i}
                      className="market-chart-bar"
                      style={{
                        height: `${heightPercent}%`,
                        background: 'linear-gradient(to top, #45A29E, #66FCF1)',
                        minWidth: '4px'
                      }}
                      title={`${d.hour}:00 — ${d.price} gp`}
                    />
                  );
                })}
              </div>

              {/* PRICE INFO */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '6px',
                fontSize: '13px'
              }}>
                <span style={{ color: '#8a9ba8' }}>Current Price:</span>
                <div>
                  <span style={{ color: '#f1c40f', fontWeight: 'bold', marginRight: '10px' }}>
                    {ITEMS[selectedChartItem]?.value || 0} gp
                  </span>
                  <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>↑ 5.2%</span>
                </div>
              </div>
            </div>

            {/* MY TRADE OFFERS */}
            <div className="market-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: '#F1FAEE', marginBottom: 0, fontFamily: "'Carter One', cursive" }}>📋 My Trade Offers</h3>
                <button
                  onClick={() => collectAllOffers(setInventory)}
                  disabled={!activeOffers.some(o => o.collectedItems > 0 || o.collectedCoins > 0)}
                  style={{
                    padding: '6px 12px',
                    background: !activeOffers.some(o => o.collectedItems > 0 || o.collectedCoins > 0) ? '#333' : '#2ecc71',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: !activeOffers.some(o => o.collectedItems > 0 || o.collectedCoins > 0) ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    opacity: !activeOffers.some(o => o.collectedItems > 0 || o.collectedCoins > 0) ? 0.5 : 1
                  }}
                >
                  Collect All
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <span style={{ color: '#8a9ba8', fontSize: '13px' }}>
                  Slots: {activeOffers.length}/{marketSlots}
                </span>
              </div>

              {/* CREATE BUTTONS */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                <button
                  onClick={handleOpenBuyModal}
                  disabled={activeOffers.length >= marketSlots}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #2ecc71',
                    background: 'transparent',
                    color: '#2ecc71',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: activeOffers.length >= marketSlots ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    opacity: activeOffers.length >= marketSlots ? 0.5 : 1
                  }}
                >
                  + Create Buy Offer
                </button>
                <button
                  onClick={handleOpenSellModal}
                  disabled={activeOffers.length >= marketSlots}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #E66100',
                    background: 'transparent',
                    color: '#E66100',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: activeOffers.length >= marketSlots ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    opacity: activeOffers.length >= marketSlots ? 0.5 : 1
                  }}
                >
                  + Create Sell Offer
                </button>
              </div>

              {/* OFFERS */}
              {activeOffers.length === 0 ? (
                <div style={{
                  background: 'rgba(10, 14, 20, 0.4)',
                  border: '1px dashed rgba(102, 252, 241, 0.15)',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center',
                  color: '#8a9ba8',
                  fontSize: '13px'
                }}>
                  No active offers. Create one to get started!
                </div>
              ) : (
                activeOffers.map(offer => (
                  <div key={offer.id} className="market-offer-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px' }}>
                      {ITEM_IMAGES[offer.itemId] ? (
                        <ItemTooltip itemKey={offer.itemId} count={inventory[offer.itemId] || 0}>
                          <img src={ITEM_IMAGES[offer.itemId]} alt="" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
                        </ItemTooltip>
                      ) : (
                        <div style={{
                          width: '42px',
                          height: '42px',
                          background: '#1F2833',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px'
                        }}>
                          📦
                        </div>
                      )}

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#F1FAEE', fontWeight: 'bold', fontSize: '14px' }}>
                            {ITEMS[offer.itemId]?.name || offer.itemId}
                          </span>
                          <span
                            style={{
                              color: offer.type === 'buy' ? '#2ecc71' : '#E66100',
                              fontWeight: 'bold',
                              fontSize: '11px',
                              textTransform: 'uppercase'
                            }}
                          >
                            {offer.type}
                          </span>
                        </div>

                        {/* PROGRESS BAR */}
                        <div style={{
                          background: 'rgba(0,0,0,0.3)',
                          borderRadius: '4px',
                          height: '6px',
                          marginTop: '6px'
                        }}>
                          <div
                            style={{
                              width: `${(offer.fulfilled / offer.quantity) * 100}%`,
                              height: '100%',
                              background: offer.type === 'buy' ? '#2ecc71' : '#E66100',
                              borderRadius: '4px',
                              transition: 'width 0.5s ease'
                            }}
                          />
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: '4px',
                          fontSize: '11px',
                          color: '#8a9ba8'
                        }}>
                          <span>{offer.fulfilled}/{offer.quantity}</span>
                          <span>{offer.pricePerItem.toLocaleString()} gp each</span>
                        </div>
                      </div>

                      {/* BUTTONS */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {(offer.collectedItems > 0 || offer.collectedCoins > 0) && (
                          <button
                            onClick={() => collectOffer(offer.id, setInventory)}
                            style={{
                              padding: '4px 10px',
                              background: '#2ecc71',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '10px',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            Collect
                          </button>
                        )}
                        {offer.status === 'active' && (
                          <button
                            onClick={() => cancelOffer(offer.id, setInventory)}
                            style={{
                              padding: '4px 10px',
                              background: 'transparent',
                              color: '#FF1744',
                              border: '1px solid #FF1744',
                              borderRadius: '4px',
                              fontSize: '10px',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* EMPTY SLOTS */}
              {Array.from({ length: Math.max(0, marketSlots - activeOffers.length) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  style={{
                    background: 'rgba(10, 14, 20, 0.4)',
                    border: '1px dashed rgba(102, 252, 241, 0.15)',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    color: '#8a9ba8',
                    fontSize: '13px',
                    marginBottom: '10px'
                  }}
                >
                  Empty Slot
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* POPULAR ITEMS */}
            <div className="market-section">
              <h3 style={{ color: '#F1FAEE', marginBottom: '14px', fontFamily: "'Carter One', cursive" }}>🔥 Popular Items</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {popularItemsWithData.map(item => (
                  <div 
                    key={item.itemId} 
                    className="market-popular-item"
                    onClick={() => handleOpenPopularItemModal(item.itemId, 'buy')}
                    style={{ cursor: 'pointer' }}
                  >
                    {ITEM_IMAGES[item.itemId] ? (
                      <ItemTooltip itemKey={item.itemId} count={inventory[item.itemId] || 0}>
                        <img src={ITEM_IMAGES[item.itemId]} alt="" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                      </ItemTooltip>
                    ) : (
                      <div style={{
                        width: '36px',
                        height: '36px',
                        background: '#1F2833',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        📦
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#F1FAEE', fontWeight: 'bold', fontSize: '12px' }}>
                        {ITEMS[item.itemId]?.name}
                      </div>
                      <div style={{ color: '#f1c40f', fontSize: '11px' }}>{item.currentPrice} gp</div>
                    </div>
                    <span style={{
                      color: item.change >= 0 ? '#2ecc71' : '#FF1744',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* LIVE ORDER BOOK FEED */}
            <div className="market-section">
              <h3 style={{ color: '#F1FAEE', marginBottom: '14px', fontFamily: "'Carter One', cursive" }}>📜 Live Order Book</h3>
              <div className="market-order-feed" style={{
                maxHeight: '300px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {orderHistory.length === 0 ? (
                  <div style={{ color: '#8a9ba8', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
                    No recent trades
                  </div>
                ) : (
                  orderHistory.slice().reverse().slice(0, 50).map(entry => (
                    <div
                      key={entry.id}
                      className="market-history-row"
                    >
                      <span style={{
                        color: entry.type === 'buy' ? '#2ecc71' : '#E66100',
                        fontWeight: 'bold',
                        minWidth: '50px'
                      }}>
                        {entry.type.toUpperCase()}
                      </span>
                      <span style={{ color: '#F1FAEE', flex: 1, marginLeft: '8px' }}>
                        {ITEMS[entry.itemId]?.name || entry.itemId}
                      </span>
                      <span style={{ color: '#8a9ba8' }}>x{entry.quantity}</span>
                      <span style={{ color: '#f1c40f', fontWeight: 'bold', marginLeft: '8px', minWidth: '90px', textAlign: 'right' }}>
                        {(entry.quantity * entry.pricePerItem).toLocaleString()} gp
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SELL OFFERS TAB */}
      {marketScreen === 'sell' && (
        <div className="market-section">
          <h3 style={{ color: '#F1FAEE', marginBottom: '16px' }}>💰 My Sell Offers</h3>
          <div>
            {marketOffers.filter(o => o.type === 'sell').length === 0 ? (
              <div style={{ color: '#8a9ba8', fontSize: '13px', padding: '20px', textAlign: 'center' }}>
                No sell offers yet
              </div>
            ) : (
              marketOffers.filter(o => o.type === 'sell').map(offer => (
                <div key={offer.id} className="market-offer-card">
                  <div style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ color: '#F1FAEE', fontWeight: 'bold' }}>
                        {ITEMS[offer.itemId]?.name}
                      </span>
                      <span style={{ color: '#E66100' }}>{offer.pricePerItem.toLocaleString()} gp each</span>
                    </div>
                    <div style={{
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '4px',
                      height: '8px'
                    }}>
                      <div style={{
                        width: `${(offer.fulfilled / offer.quantity) * 100}%`,
                        height: '100%',
                        background: '#E66100',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#8a9ba8'
                    }}>
                      <span>{offer.fulfilled}/{offer.quantity}</span>
                      <span>Coins: {offer.collectedCoins.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TRADING HISTORY TAB */}
      {marketScreen === 'history' && (
        <div className="market-section">
          <h3 style={{ color: '#F1FAEE', marginBottom: '16px' }}>📜 Trading History</h3>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {orderHistory.length === 0 ? (
              <div style={{ color: '#8a9ba8', fontSize: '13px', padding: '20px', textAlign: 'center' }}>
                No trades yet
              </div>
            ) : (
              orderHistory.slice().reverse().map(entry => (
                <div key={entry.id} className="market-history-row">
                  <span style={{
                    color: entry.type === 'buy' ? '#2ecc71' : '#E66100',
                    fontWeight: 'bold'
                  }}>
                    {entry.type.toUpperCase()}
                  </span>
                  <span style={{ color: '#F1FAEE', flex: 1, marginLeft: '8px' }}>
                    {ITEMS[entry.itemId]?.name}
                  </span>
                  <span style={{ color: '#8a9ba8' }}>x{entry.quantity}</span>
                  <span style={{ color: '#f1c40f', fontWeight: 'bold', marginLeft: '8px' }}>
                    {(entry.quantity * entry.pricePerItem).toLocaleString()} gp
                  </span>
                  <span style={{ color: '#555', fontSize: '11px', marginLeft: '12px' }}>
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* BUY OFFER MODAL */}
      {showBuyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(11, 12, 16, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }} onClick={() => setShowBuyModal(false)}>
          <div className="card" style={{ maxWidth: '450px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#66FCF1', marginBottom: '20px', fontFamily: "'Carter One', cursive" }}>🛒 Create Buy Offer</h2>

            <label style={{ color: '#F1FAEE', display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
              Item
            </label>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Search items..."
                value={buyModalSearch}
                onChange={e => setBuyModalSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#111920',
                  color: 'white',
                  border: '1px solid rgba(102, 252, 241, 0.3)',
                  borderRadius: '8px',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '14px'
                }}
              />
              {buyModalSearch && filteredBuyItems.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#111920',
                  border: '1px solid rgba(102, 252, 241, 0.3)',
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 10
                }}>
                  {filteredBuyItems.map(([id, item]) => (
                    <div
                      key={id}
                      onClick={() => {
                        handleItemSelect(id);
                        setBuyModalSearch('');
                      }}
                      style={{
                        padding: '10px',
                        color: '#F1FAEE',
                        cursor: 'pointer',
                        borderBottom: '1px solid rgba(102, 252, 241, 0.1)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.target.style.background = 'rgba(102, 252, 241, 0.15)'}
                      onMouseLeave={e => e.target.style.background = 'transparent'}
                    >
                      {item.name} <span style={{ color: '#8a9ba8', fontSize: '12px' }}>(base: {item.value} gp)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {modalItemId && (
              <div style={{
                background: 'rgba(102, 252, 241, 0.15)',
                border: '1px solid rgba(102, 252, 241, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                {ITEM_IMAGES[modalItemId] ? (
                  <img src={ITEM_IMAGES[modalItemId]} alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                ) : (
                  <div style={{ fontSize: '20px' }}>📦</div>
                )}
                <div>
                  <div style={{ color: '#F1FAEE', fontWeight: 'bold', fontSize: '14px' }}>
                    {ITEMS[modalItemId]?.name}
                  </div>
                  <div style={{ color: '#8a9ba8', fontSize: '12px' }}>
                    Base price: {ITEMS[modalItemId]?.value} gp
                  </div>
                </div>
              </div>
            )}

            <label style={{ color: '#F1FAEE', display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
              Quantity
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
              <button
                onClick={() => setModalQuantity(q => Math.max(1, q - 1))}
                style={{
                  padding: '8px 14px',
                  background: '#1a2630',
                  color: '#66FCF1',
                  border: '1px solid #2a3b4c',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={modalQuantity}
                onChange={e => setModalQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: '80px',
                  textAlign: 'center',
                  background: '#111920',
                  color: 'white',
                  border: '1px solid #2a3b4c',
                  padding: '8px',
                  borderRadius: '4px',
                  fontFamily: 'Nunito, sans-serif'
                }}
              />
              <button
                onClick={() => setModalQuantity(q => q + 1)}
                style={{
                  padding: '8px 14px',
                  background: '#1a2630',
                  color: '#66FCF1',
                  border: '1px solid #2a3b4c',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                +
              </button>
            </div>

            <label style={{ color: '#F1FAEE', display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
              Price per item (gp)
            </label>
            <input
              type="number"
              min="1"
              value={modalPrice}
              onChange={e => setModalPrice(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: '100%',
                padding: '10px',
                background: '#111920',
                color: 'white',
                border: '1px solid rgba(102, 252, 241, 0.3)',
                borderRadius: '8px',
                marginBottom: '16px',
                fontFamily: 'Nunito, sans-serif'
              }}
            />

            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#8a9ba8' }}>Total:</span>
              <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>
                {(modalQuantity * modalPrice).toLocaleString()} gp
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowBuyModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  color: '#FF1744',
                  border: '1px solid #FF1744',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBuy}
                disabled={!modalItemId || modalQuantity < 1 || modalPrice < 1}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: !modalItemId ? '#333' : '#2ecc71',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: !modalItemId ? 'not-allowed' : 'pointer',
                  opacity: !modalItemId ? 0.5 : 1
                }}
              >
                Place Buy Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SELL OFFER MODAL */}
      {showSellModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(11, 12, 16, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }} onClick={() => setShowSellModal(false)}>
          <div className="card" style={{ maxWidth: '450px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#66FCF1', marginBottom: '20px', fontFamily: "'Carter One', cursive" }}>💰 Create Sell Offer</h2>

            <label style={{ color: '#F1FAEE', display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
              Item
            </label>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Search items in inventory..."
                value={sellModalSearch}
                onChange={e => setSellModalSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#111920',
                  color: 'white',
                  border: '1px solid rgba(102, 252, 241, 0.3)',
                  borderRadius: '8px',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '14px'
                }}
              />
              {sellModalSearch && filteredSellItems.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#111920',
                  border: '1px solid rgba(102, 252, 241, 0.3)',
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 10
                }}>
                  {filteredSellItems.map(([id, qty]) => (
                    <div
                      key={id}
                      onClick={() => {
                        handleItemSelect(id);
                        setSellModalSearch('');
                      }}
                      style={{
                        padding: '10px',
                        color: '#F1FAEE',
                        cursor: 'pointer',
                        borderBottom: '1px solid rgba(102, 252, 241, 0.1)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.target.style.background = 'rgba(102, 252, 241, 0.15)'}
                      onMouseLeave={e => e.target.style.background = 'transparent'}
                    >
                      {ITEMS[id]?.name || id} <span style={{ color: '#8a9ba8', fontSize: '12px' }}>(x{qty})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {modalItemId && (
              <div style={{
                background: 'rgba(102, 252, 241, 0.15)',
                border: '1px solid rgba(102, 252, 241, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                {ITEM_IMAGES[modalItemId] ? (
                  <img src={ITEM_IMAGES[modalItemId]} alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                ) : (
                  <div style={{ fontSize: '20px' }}>📦</div>
                )}
                <div>
                  <div style={{ color: '#F1FAEE', fontWeight: 'bold', fontSize: '14px' }}>
                    {ITEMS[modalItemId]?.name}
                  </div>
                  <div style={{ color: '#8a9ba8', fontSize: '12px' }}>
                    In inventory: x{inventory[modalItemId] || 0}
                  </div>
                </div>
              </div>
            )}

            <label style={{ color: '#F1FAEE', display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
              Quantity
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
              <button
                onClick={() => setModalQuantity(q => Math.max(1, q - 1))}
                style={{
                  padding: '8px 14px',
                  background: '#1a2630',
                  color: '#66FCF1',
                  border: '1px solid #2a3b4c',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={modalQuantity}
                onChange={e => setModalQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: '80px',
                  textAlign: 'center',
                  background: '#111920',
                  color: 'white',
                  border: '1px solid #2a3b4c',
                  padding: '8px',
                  borderRadius: '4px',
                  fontFamily: 'Nunito, sans-serif'
                }}
              />
              <button
                onClick={() => setModalQuantity(q => q + 1)}
                style={{
                  padding: '8px 14px',
                  background: '#1a2630',
                  color: '#66FCF1',
                  border: '1px solid #2a3b4c',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                +
              </button>
              {modalItemId && (
                <button
                  onClick={() => setModalQuantity(inventory[modalItemId] || 1)}
                  style={{
                    padding: '8px 12px',
                    background: '#208b76',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                >
                  MAX
                </button>
              )}
            </div>

            <label style={{ color: '#F1FAEE', display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
              Price per item (gp)
            </label>
            <input
              type="number"
              min="1"
              value={modalPrice}
              onChange={e => setModalPrice(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: '100%',
                padding: '10px',
                background: '#111920',
                color: 'white',
                border: '1px solid rgba(102, 252, 241, 0.3)',
                borderRadius: '8px',
                marginBottom: '16px',
                fontFamily: 'Nunito, sans-serif'
              }}
            />

            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#8a9ba8' }}>Total:</span>
              <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>
                {(modalQuantity * modalPrice).toLocaleString()} gp
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowSellModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  color: '#FF1744',
                  border: '1px solid #FF1744',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSell}
                disabled={!modalItemId || modalQuantity < 1 || modalPrice < 1}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: !modalItemId ? '#333' : '#E66100',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: !modalItemId ? 'not-allowed' : 'pointer',
                  opacity: !modalItemId ? 0.5 : 1
                }}
              >
                Place Sell Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPULAR ITEM MODAL */}
      {showPopularItemModal && modalItemId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(11, 12, 16, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }} onClick={() => setShowPopularItemModal(false)}>
          <div className="card" style={{ maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
            {/* ITEM DISPLAY */}
            <div style={{
              background: 'rgba(102, 252, 241, 0.15)',
              border: '1px solid rgba(102, 252, 241, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {ITEM_IMAGES[modalItemId] ? (
                <img src={ITEM_IMAGES[modalItemId]} alt="" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
              ) : (
                <div style={{ fontSize: '28px' }}>📦</div>
              )}
              <div>
                <div style={{ color: '#F1FAEE', fontWeight: 'bold', fontSize: '16px' }}>
                  {ITEMS[modalItemId]?.name}
                </div>
                <div style={{ color: '#8a9ba8', fontSize: '13px' }}>
                  Base price: {ITEMS[modalItemId]?.value} gp
                </div>
              </div>
            </div>

            {/* MODE TABS */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={() => setPopularItemModalMode('buy')}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: popularItemModalMode === 'buy' ? '#2ecc71' : '#1a2630',
                  color: popularItemModalMode === 'buy' ? 'white' : '#2ecc71',
                  border: '1px solid #2ecc71',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🛒 Create Buy Offer
              </button>
              <button
                onClick={() => setPopularItemModalMode('sell')}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: popularItemModalMode === 'sell' ? '#E66100' : '#1a2630',
                  color: popularItemModalMode === 'sell' ? 'white' : '#E66100',
                  border: '1px solid #E66100',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                💰 Create Sell Offer
              </button>
            </div>

            {/* QUANTITY */}
            <label style={{ color: '#F1FAEE', display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
              Quantity
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
              <button
                onClick={() => setModalQuantity(q => Math.max(1, q - 1))}
                style={{
                  padding: '8px 14px',
                  background: '#1a2630',
                  color: '#66FCF1',
                  border: '1px solid #2a3b4c',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={modalQuantity}
                onChange={e => setModalQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: '80px',
                  textAlign: 'center',
                  background: '#111920',
                  color: 'white',
                  border: '1px solid #2a3b4c',
                  padding: '8px',
                  borderRadius: '4px',
                  fontFamily: 'Nunito, sans-serif'
                }}
              />
              <button
                onClick={() => setModalQuantity(q => q + 1)}
                style={{
                  padding: '8px 14px',
                  background: '#1a2630',
                  color: '#66FCF1',
                  border: '1px solid #2a3b4c',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                +
              </button>
              {popularItemModalMode === 'sell' && modalItemId && inventory[modalItemId] > 0 && (
                <button
                  onClick={() => setModalQuantity(inventory[modalItemId] || 1)}
                  style={{
                    padding: '8px 12px',
                    background: '#208b76',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                >
                  MAX
                </button>
              )}
            </div>

            {/* PRICE */}
            <label style={{ color: '#F1FAEE', display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
              Price per item (gp)
            </label>
            <input
              type="number"
              min="1"
              value={modalPrice}
              onChange={e => setModalPrice(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: '100%',
                padding: '10px',
                background: '#111920',
                color: 'white',
                border: '1px solid rgba(102, 252, 241, 0.3)',
                borderRadius: '8px',
                marginBottom: '16px',
                fontFamily: 'Nunito, sans-serif'
              }}
            />

            {/* TOTAL */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#8a9ba8' }}>Total:</span>
              <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>
                {(modalQuantity * modalPrice).toLocaleString()} gp
              </span>
            </div>

            {/* BUTTONS */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowPopularItemModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  color: '#FF1744',
                  border: '1px solid #FF1744',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (popularItemModalMode === 'buy') {
                    handleCreateBuy();
                  } else {
                    handleCreateSell();
                  }
                  setShowPopularItemModal(false);
                }}
                disabled={!modalItemId || modalQuantity < 1 || modalPrice < 1}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: !modalItemId ? '#333' : (popularItemModalMode === 'buy' ? '#2ecc71' : '#E66100'),
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: !modalItemId ? 'not-allowed' : 'pointer',
                  opacity: !modalItemId ? 0.5 : 1
                }}
              >
                {popularItemModalMode === 'buy' ? 'Place Buy Offer' : 'Place Sell Offer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
