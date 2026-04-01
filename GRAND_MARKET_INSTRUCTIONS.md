# 🏪 Grand Market — Implementation Instructions

> **Doel:** Bouw een online marketplace waar spelers items kunnen kopen en verkopen via aanbiedingen (offers). Dit document bevat alle stappen zodat een ander model dit volledig kan implementeren.

---

## 📐 Design Reference

De Grand Market is geïnspireerd op een GE-achtige marketplace met:
- **Live Trading Hub** (links) — prijsgrafiek van een geselecteerd item
- **Popular Items** (rechtsboven) — grid met populaire items + prijswijziging
- **My Trade Offers** (midden) — actieve koop/verkoop-aanbiedingen van de speler
- **Live Order Book Feed** (linksonder) — scrollend log van recente trades
- **Market Slots** — gelimiteerd aantal gelijktijdige offers (begint met 3, max 6)

---

## 🎨 Design System (VERPLICHT)

### CSS Variabelen (gebruik altijd)
```
--bg-deep: #0B0C10         (Void Charcoal — page background)
--bg-panel: #1F2833        (Slate Navy — panel backgrounds)
--text-primary: #F1FAEE    (Off-White — hoofdtekst)
--text-muted: #8a9ba8      (gedempte tekst)
--ui-idle: #45A29E          (Muted Teal — borders, subtiele accenten)
--cta-primary: #66FCF1      (Electric Cyan — knoppen, titels, highlights)
--cta-monetize: #E66100     (Oranje — premium/speciale knoppen)
--cta-alert: #FF1744        (Rood — waarschuwingen, annuleren)
--rarity-common: #BBBBBB
--rarity-uncommon: #228833
--rarity-rare: #1A85FF
--rarity-epic: #AA3377
--rarity-legendary: #FFC20A
```

### Glassmorphism Card (hoofdpaneel)
```css
background-color: rgba(31, 40, 51, 0.75);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
padding: 20px;
border-radius: 12px;
border: 1px solid rgba(69, 162, 158, 0.4);
box-shadow: 0 12px 32px 0 rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.1);
```

### Subpaneel / Inner Card
```css
background: rgba(10, 14, 20, 0.7);
border: 1px solid rgba(102, 252, 241, 0.15);
border-radius: 12px;
padding: 16px;
backdrop-filter: blur(10px);
transition: all 0.3s ease;
```

### Fonts
- **Titels:** font-family: 'Carter One', cursive
- **Body tekst:** font-family: 'Nunito', sans-serif

### Knoppen
- **Primaire knop:** achtergrond `#66FCF1`, tekst `#0B0C10`, hover glow `box-shadow: 0 0 15px rgba(102,252,241,0.4)`
- **Disabled knop:** achtergrond `#333`, tekst `#666`, cursor `not-allowed`, opacity `0.5`
- **Rode/Cancel knop:** border `1px solid #FF1744`, tekst `#FF1744`, hover vult rood
- **Groene/Success knop:** achtergrond `#2ecc71`

### Kleurregels voor inline styles
⚠️ **BELANGRIJK:** Gebruik NOOIT `var(--text-primary)` in inline React styles! Gebruik altijd vaste hex waarden: `#F1FAEE`, `#66FCF1`, etc. CSS variabelen werken alleen in CSS bestanden.

---

## 📁 Bestandsstructuur

Er moeten de volgende bestanden aangemaakt/gewijzigd worden:

| Bestand | Actie |
|---------|-------|
| `src/hooks/useMarket.js` | **NIEUW** — Hook met alle market state & logica |
| `src/components/MarketView.jsx` | **NIEUW** — Volledige market UI component |
| `src/App.css` | **WIJZIGEN** — Market-specifieke CSS classes toevoegen |
| `src/components/TopBar.jsx` | **WIJZIGEN** — Grand Market knop functioneel maken |
| `src/App.jsx` | **WIJZIGEN** — MarketView importeren, useMarket hook aansluiten, routing toevoegen |
| `src/hooks/useSaveLoad.js` | **WIJZIGEN** — Market data meenemen in save/load |

---

## 📋 STAP 1: `src/hooks/useMarket.js` (NIEUW BESTAND)

### Structuur
Maak een custom hook die de volgende state beheert:

```javascript
import { useState, useCallback } from 'react';

export function useMarket() {
  const [marketOffers, setMarketOffers] = useState([]);
  const [marketSlots, setMarketSlots] = useState(3); // begint met 3, max 6
  const [orderHistory, setOrderHistory] = useState([]);
  const [marketScreen, setMarketScreen] = useState('overview'); // 'overview' | 'buy' | 'sell'
  
  // ... functies hier
  
  return {
    marketOffers, setMarketOffers,
    marketSlots, setMarketSlots,
    orderHistory, setOrderHistory,
    marketScreen, setMarketScreen,
    createBuyOffer,
    createSellOffer,
    cancelOffer,
    collectOffer,
    collectAllOffers,
    processMarketTick
  };
}
```

### State Objecten

**marketOffer object:**
```javascript
{
  id: Date.now() + Math.random(),    // uniek ID
  type: 'buy' | 'sell',              // koop of verkoop
  itemId: 'iron_ore',               // item key uit ITEMS
  quantity: 100,                     // totaal gewenste hoeveelheid
  pricePerItem: 20,                 // prijs per stuk in coins
  fulfilled: 0,                     // hoeveel al verhandeld
  totalCost: 2000,                  // quantity * pricePerItem
  status: 'active' | 'completed' | 'cancelled',
  createdAt: Date.now(),
  collectedCoins: 0,                // opgehaalde coins (bij sell)
  collectedItems: 0                 // opgehaalde items (bij buy)
}
```

**orderHistory entry:**
```javascript
{
  id: Date.now() + Math.random(),
  type: 'buy' | 'sell',
  itemId: 'iron_ore',
  quantity: 10,
  pricePerItem: 20,
  timestamp: Date.now()
}
```

### Functies (allemaal als useCallback met `[]` dependency array!)

⚠️ **KRITIEK PATROON:** Gebruik ALTIJD functional updates (`setState(prev => ...)`) binnen useCallback met lege deps `[]`. Direct state lezen uit de closure is STALE en veroorzaakt bugs. Dit is hetzelfde patroon als in `useClan.js`.

#### `createBuyOffer(itemId, quantity, pricePerItem, setInventory)`
1. Check inside `setMarketOffers(prev => ...)` of er genoeg vrije slots zijn (count active offers < marketSlots)
2. Bereken `totalCost = quantity * pricePerItem`
3. Check via `setInventory` of speler genoeg coins heeft — trek coins af
4. Voeg nieuw offer object toe aan array
5. Simuleer direct een deel van de fulfillment (zie `processMarketTick` logica)

#### `createSellOffer(itemId, quantity, pricePerItem, setInventory)`
1. Check slots beschikbaar
2. Check via `setInventory` of speler genoeg van het item heeft — trek items af
3. Voeg nieuw sell offer toe

#### `cancelOffer(offerId, setInventory)`
1. Vind offer in de lijst
2. Als type === 'buy': geef resterende coins terug (`(quantity - fulfilled) * pricePerItem`)
3. Als type === 'sell': geef resterende items terug (`quantity - fulfilled`)
4. Markeer offer als 'cancelled'

#### `collectOffer(offerId, setInventory)`
1. Vind het offer
2. Als type === 'buy': geef verzamelde items aan inventory (`collectedItems`)
3. Als type === 'sell': geef verzamelde coins aan inventory (`collectedCoins`)
4. Reset `collectedItems`/`collectedCoins` naar 0
5. Als offer volledig fulfilled + alles collected → verwijder uit lijst

#### `collectAllOffers(setInventory)`
1. Loop door alle offers met `collectedItems > 0` of `collectedCoins > 0`
2. Voeg alles toe aan inventory
3. Verwijder volledig afgeronde offers

#### `processMarketTick()`
Dit simuleert de "markt" die offers vervult. Roep aan vanuit een `useEffect` interval in App.jsx (elke 3-5 seconden).

Logica per actief offer:
```javascript
// Simuleer dat de markt langzaam orders vervult
const remaining = offer.quantity - offer.fulfilled;
if (remaining <= 0) return offer;

// Random fill: 1-15% van remaining per tick
const fillPercent = 0.01 + Math.random() * 0.14;
const fillAmount = Math.max(1, Math.floor(remaining * fillPercent));
const actualFill = Math.min(fillAmount, remaining);

// Update offer
newOffer.fulfilled += actualFill;
if (offer.type === 'buy') {
  newOffer.collectedItems += actualFill;
} else {
  newOffer.collectedCoins += actualFill * offer.pricePerItem;
}

// Check completion
if (newOffer.fulfilled >= newOffer.quantity) {
  newOffer.status = 'completed';
}

// Voeg toe aan orderHistory
```

### Market Slot Upgrades
Voeg een functie toe om extra slots te kopen:

#### `purchaseMarketSlot(setInventory)`
- Kosten: `slot 4 = 50.000 coins`, `slot 5 = 150.000`, `slot 6 = 500.000`
- Check coins, trek af, verhoog `marketSlots`

---

## 📋 STAP 2: `src/components/MarketView.jsx` (NIEUW BESTAND)

### Props
```jsx
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
  purchaseMarketSlot,
  ITEM_IMAGES,
  ITEMS
})
```

### Layout Structuur

De component is gewrapped in een enkele outer `<div className="card">` (net als ClanView/ShopView). GEEN dubbele `.card` wrappers!

```
┌─────────────────────────────────────────────────────────────┐
│  ⚖️ Grand Market                           💰 X coins      │
│  [Overview] [Sell Offers] [Trading History]                 │
├───────────────────────────┬─────────────────────────────────┤
│                           │                                 │
│   📊 Live Trading Hub     │   🔥 Popular Items              │
│   (prijsgrafiek)          │   (grid met items)              │
│                           │                                 │
├───────────────────────────┼─────────────────────────────────┤
│                           │                                 │
│   📋 My Trade Offers      │   📜 Live Order Book Feed       │
│   [Collect All]           │   (scrollend log)               │
│   [+ Koop] [+ Verkoop]   │                                 │
│   (offer slots)           │                                 │
│                           │                                 │
└───────────────────────────┴─────────────────────────────────┘
```

### Gedetailleerde UI Secties

#### A. Header
```jsx
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
  <h1 style={{ color: '#66FCF1', fontFamily: "'Carter One', cursive" }}>⚖️ Grand Market</h1>
  <span style={{ fontSize: '18px', color: '#f1c40f', fontWeight: 'bold' }}>
    💰 {inventory.coins?.toLocaleString() || 0} gp
  </span>
</div>
```

#### B. Tab Navigatie
Drie tabs: **Overview**, **Sell Offers**, **Trading History**

Gebruik hetzelfde tabpatroon als ShopView:
```jsx
<div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #2a3b4c', paddingBottom: '15px' }}>
  {['overview', 'sell', 'history'].map(tab => (
    <button key={tab}
      onClick={() => setMarketScreen(tab)}
      style={{
        padding: '8px 20px',
        background: marketScreen === tab ? '#208b76' : '#152029',
        color: 'white', border: 'none', borderRadius: '4px',
        cursor: 'pointer', fontWeight: 'bold',
        textTransform: 'capitalize'
      }}
    >{tab === 'overview' ? '📊 Overview' : tab === 'sell' ? '💰 Sell Offers' : '📜 Trading History'}</button>
  ))}
</div>
```

#### C. Overview Tab — Layout (2 kolommen)
```jsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
  {/* Linker kolom */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    {/* Live Trading Hub */}
    {/* My Trade Offers */}
  </div>
  
  {/* Rechter kolom */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    {/* Popular Items */}
    {/* Live Order Book Feed */}
  </div>
</div>
```

#### D. Live Trading Hub Panel
Een subpaneel met:
- Titel: `<h3 style={{ color: '#66FCF1', marginBottom: '20px' }}>📊 Live Trading Hub</h3>`
- Een item selector dropdown (laat speler een item kiezen om de "prijs" van te zien)
- Een simpele CSS "grafiek" — geen echte chart library nodig. Gebruik een flexbox met verticale bars:

```jsx
// Simpele bar chart met 24 uur "data" (random gegenereerd)
const [selectedChartItem, setSelectedChartItem] = useState('iron_ore');
const [chartData] = useState(() => 
  Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    price: Math.floor(ITEMS[selectedChartItem]?.value * (0.7 + Math.random() * 0.6))
  }))
);

// Render als verticale bars
<div style={{ display: 'flex', alignItems: 'flex-end', height: '120px', gap: '2px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
  {chartData.map((d, i) => {
    const maxPrice = Math.max(...chartData.map(x => x.price));
    const heightPercent = (d.price / maxPrice) * 100;
    return (
      <div key={i} style={{
        flex: 1, height: `${heightPercent}%`,
        background: 'linear-gradient(to top, #45A29E, #66FCF1)',
        borderRadius: '2px 2px 0 0',
        minWidth: '4px'
      }} title={`${d.hour}:00 - ${d.price} gp`} />
    );
  })}
</div>
```

- Onder de grafiek: huidige prijs, 24h wijziging als percentage (groen/rood)

#### E. Popular Items Panel
Grid van 6-8 populaire items:

```jsx
const popularItems = ['iron_ore', 'coal_ore', 'cooked_shrimp', 'oak_log', 'bronze_bar', 'steel_bar', 'raw_lobster', 'yew_log'];
```

Per item toon:
- Item image (uit `ITEM_IMAGES[itemId]`) of emoji fallback
- Item naam (uit `ITEMS[itemId].name`)
- "Huidige prijs" (= `ITEMS[itemId].value` ± random variance)
- Percentage wijziging badge (groen bij positief, rood bij negatief)
- Volume indicator (random getal)

Gebruik grid layout: `display: grid, gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px'`

Per item card:
```jsx
<div style={{
  background: 'rgba(10, 14, 20, 0.7)',
  border: '1px solid rgba(102, 252, 241, 0.15)',
  borderRadius: '12px',
  padding: '12px',
  display: 'flex', alignItems: 'center', gap: '10px',
  cursor: 'pointer',
  transition: 'all 0.3s ease'
}}>
  {ITEM_IMAGES[itemId] ? (
    <img src={ITEM_IMAGES[itemId]} alt="" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
  ) : (
    <div style={{ width: '36px', height: '36px', background: '#1F2833', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
  )}
  <div style={{ flex: 1 }}>
    <div style={{ color: '#F1FAEE', fontWeight: 'bold', fontSize: '13px' }}>{ITEMS[itemId]?.name}</div>
    <div style={{ color: '#f1c40f', fontSize: '12px' }}>{price} gp</div>
  </div>
  <span style={{ color: change >= 0 ? '#2ecc71' : '#FF1744', fontSize: '12px', fontWeight: 'bold' }}>
    {change >= 0 ? '▲' : '▼'} {Math.abs(change)}%
  </span>
</div>
```

#### F. My Trade Offers Panel

Titel + knoppen header:
```jsx
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
  <h3 style={{ color: '#66FCF1' }}>📋 My Trade Offers</h3>
  <div style={{ display: 'flex', gap: '8px' }}>
    <button onClick={() => collectAllOffers(setInventory)}
      style={{ padding: '6px 12px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
    >Collect All</button>
  </div>
</div>

<div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
  <span style={{ color: '#8a9ba8', fontSize: '13px' }}>
    Slots: {activeOffersCount}/{marketSlots} in gebruik
  </span>
</div>
```

Onder de header twee knoppen om een nieuw offer te maken:
```jsx
<div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
  <button onClick={() => setShowBuyModal(true)}
    disabled={activeOffers.length >= marketSlots}
    style={{
      flex: 1, padding: '10px', border: '1px solid #2ecc71', background: 'transparent',
      color: '#2ecc71', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
    }}
  >+ Create Buy Offer</button>
  <button onClick={() => setShowSellModal(true)}
    disabled={activeOffers.length >= marketSlots}
    style={{
      flex: 1, padding: '10px', border: '1px solid #E66100', background: 'transparent',
      color: '#E66100', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
    }}
  >+ Create Sell Offer</button>
</div>
```

Daarna de offer slots renderen:

```jsx
{/* Actieve offers */}
{marketOffers.filter(o => o.status !== 'cancelled').map(offer => (
  <div key={offer.id} className="market-offer-card">
    {/* Offer card content — zie CSS sectie */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px' }}>
      {/* Item image */}
      {ITEM_IMAGES[offer.itemId] ? (
        <img src={ITEM_IMAGES[offer.itemId]} alt="" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
      ) : (
        <div style={{ width: '42px', height: '42px', background: '#1F2833', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📦</div>
      )}
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#F1FAEE', fontWeight: 'bold' }}>
            {ITEMS[offer.itemId]?.name || offer.itemId}
          </span>
          <span style={{ color: offer.type === 'buy' ? '#2ecc71' : '#E66100', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>
            {offer.type}
          </span>
        </div>
        
        {/* Progress bar */}
        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '4px', height: '6px', marginTop: '6px' }}>
          <div style={{
            width: `${(offer.fulfilled / offer.quantity) * 100}%`,
            height: '100%',
            background: offer.type === 'buy' ? '#2ecc71' : '#E66100',
            borderRadius: '4px',
            transition: 'width 0.5s ease'
          }} />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px', color: '#8a9ba8' }}>
          <span>{offer.fulfilled}/{offer.quantity} items</span>
          <span>{offer.pricePerItem.toLocaleString()} gp each</span>
        </div>
      </div>
      
      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {(offer.collectedItems > 0 || offer.collectedCoins > 0) && (
          <button onClick={() => collectOffer(offer.id, setInventory)}
            style={{ padding: '4px 10px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
          >Collect</button>
        )}
        {offer.status === 'active' && (
          <button onClick={() => cancelOffer(offer.id, setInventory)}
            style={{ padding: '4px 10px', background: 'transparent', color: '#FF1744', border: '1px solid #FF1744', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
          >Cancel</button>
        )}
      </div>
    </div>
  </div>
))}

{/* Lege slots tonen */}
{Array.from({ length: Math.max(0, marketSlots - marketOffers.filter(o => o.status === 'active' || o.status === 'completed').length) }).map((_, i) => (
  <div key={`empty-${i}`} style={{
    background: 'rgba(10, 14, 20, 0.4)',
    border: '1px dashed rgba(102, 252, 241, 0.15)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    color: '#8a9ba8',
    fontSize: '13px'
  }}>
    Empty Slot
  </div>
))}
```

#### G. Live Order Book Feed Panel
Scrollend log van recente trades (uit `orderHistory`):

```jsx
<div style={{ maxHeight: '300px', overflowY: 'auto' }}>
  {orderHistory.slice().reverse().slice(0, 50).map(entry => (
    <div key={entry.id} style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 12px',
      borderBottom: '1px solid rgba(102, 252, 241, 0.08)',
      fontSize: '12px'
    }}>
      <span style={{ color: entry.type === 'buy' ? '#2ecc71' : '#E66100', fontWeight: 'bold' }}>
        {entry.type.toUpperCase()}
      </span>
      <span style={{ color: '#F1FAEE' }}>{ITEMS[entry.itemId]?.name}</span>
      <span style={{ color: '#8a9ba8' }}>x{entry.quantity}</span>
      <span style={{ color: '#f1c40f' }}>{(entry.quantity * entry.pricePerItem).toLocaleString()} gp</span>
      <span style={{ color: '#555', fontSize: '11px' }}>
        {new Date(entry.timestamp).toLocaleTimeString()}
      </span>
    </div>
  ))}
</div>
```

#### H. Buy/Sell Modal
Maak een modal (popup-overlay) voor het aanmaken van offers. Gebruik hetzelfde overlay-patroon als de bestaande popups:

```jsx
// State in MarketView:
const [showBuyModal, setShowBuyModal] = useState(false);
const [showSellModal, setShowSellModal] = useState(false);
const [modalItemId, setModalItemId] = useState('');
const [modalQuantity, setModalQuantity] = useState(1);
const [modalPrice, setModalPrice] = useState(0);
```

Modal template (voor zowel buy als sell):
```jsx
{(showBuyModal || showSellModal) && (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(11, 12, 16, 0.9)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 999
  }} onClick={() => { setShowBuyModal(false); setShowSellModal(false); }}>
    <div className="card" style={{ maxWidth: '450px', width: '90%' }} onClick={e => e.stopPropagation()}>
      <h2 style={{ color: '#66FCF1', marginBottom: '20px' }}>
        {showBuyModal ? '🛒 Create Buy Offer' : '💰 Create Sell Offer'}
      </h2>
      
      {/* Item Selector */}
      <label style={{ color: '#F1FAEE', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Item</label>
      {showBuyModal ? (
        // Bij buy: dropdown met ALLE items uit ITEMS
        <select value={modalItemId} onChange={e => { setModalItemId(e.target.value); setModalPrice(ITEMS[e.target.value]?.value || 0); }}
          style={{ width: '100%', padding: '10px', background: '#111920', color: 'white', border: '1px solid rgba(102,252,241,0.3)', borderRadius: '8px', marginBottom: '16px' }}>
          <option value="">-- Kies een item --</option>
          {Object.entries(ITEMS).filter(([k]) => k !== 'coins').map(([id, item]) => (
            <option key={id} value={id}>{item.name} (base: {item.value} gp)</option>
          ))}
        </select>
      ) : (
        // Bij sell: alleen items die speler IN INVENTORY heeft (quantity > 0)
        <select value={modalItemId} onChange={e => { setModalItemId(e.target.value); setModalPrice(ITEMS[e.target.value]?.value || 0); }}
          style={{ width: '100%', padding: '10px', background: '#111920', color: 'white', border: '1px solid rgba(102,252,241,0.3)', borderRadius: '8px', marginBottom: '16px' }}>
          <option value="">-- Kies een item --</option>
          {Object.entries(inventory)
            .filter(([k, v]) => k !== 'coins' && k !== 'maxSlots' && v > 0 && ITEMS[k])
            .map(([id, qty]) => (
              <option key={id} value={id}>{ITEMS[id].name} (x{qty})</option>
            ))}
        </select>
      )}
      
      {/* Quantity */}
      <label style={{ color: '#F1FAEE', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Quantity</label>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
        <button onClick={() => setModalQuantity(q => Math.max(1, q - 1))}
          style={{ padding: '8px 14px', background: '#1a2630', color: '#66FCF1', border: '1px solid #2a3b4c', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
        <input type="number" min="1" value={modalQuantity}
          onChange={e => setModalQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          style={{ width: '80px', textAlign: 'center', background: '#111920', color: 'white', border: '1px solid #2a3b4c', padding: '8px', borderRadius: '4px' }} />
        <button onClick={() => setModalQuantity(q => q + 1)}
          style={{ padding: '8px 14px', background: '#1a2630', color: '#66FCF1', border: '1px solid #2a3b4c', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
        {showSellModal && modalItemId && (
          <button onClick={() => setModalQuantity(inventory[modalItemId] || 1)}
            style={{ padding: '8px 12px', background: '#208b76', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>MAX</button>
        )}
      </div>
      
      {/* Price per item */}
      <label style={{ color: '#F1FAEE', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Price per item (gp)</label>
      <input type="number" min="1" value={modalPrice}
        onChange={e => setModalPrice(Math.max(1, parseInt(e.target.value) || 1))}
        style={{ width: '100%', padding: '10px', background: '#111920', color: 'white', border: '1px solid rgba(102,252,241,0.3)', borderRadius: '8px', marginBottom: '16px' }} />
      
      {/* Totaal */}
      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#8a9ba8' }}>Total:</span>
        <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>
          {(modalQuantity * modalPrice).toLocaleString()} gp
        </span>
      </div>
      
      {/* Knoppen */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => { setShowBuyModal(false); setShowSellModal(false); }}
          style={{ flex: 1, padding: '12px', background: 'transparent', color: '#FF1744', border: '1px solid #FF1744', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={() => {
          if (showBuyModal) {
            createBuyOffer(modalItemId, modalQuantity, modalPrice, setInventory);
          } else {
            createSellOffer(modalItemId, modalQuantity, modalPrice, setInventory);
          }
          setShowBuyModal(false);
          setShowSellModal(false);
          setModalItemId('');
          setModalQuantity(1);
          setModalPrice(0);
        }}
          disabled={!modalItemId || modalQuantity < 1 || modalPrice < 1}
          style={{
            flex: 1, padding: '12px',
            background: !modalItemId ? '#333' : (showBuyModal ? '#2ecc71' : '#E66100'),
            color: 'white', border: 'none', borderRadius: '8px',
            fontWeight: 'bold', cursor: !modalItemId ? 'not-allowed' : 'pointer',
            opacity: !modalItemId ? 0.5 : 1
          }}>
          {showBuyModal ? 'Place Buy Offer' : 'Place Sell Offer'}
        </button>
      </div>
    </div>
  </div>
)}
```

#### I. Sell Offers Tab
Toont alleen sell offers van de speler met meer detail — grotere cards, uitgebreide statistieken.

#### J. Trading History Tab
Toont `orderHistory` in een tabelformaat met filters (all/buy/sell).

---

## 📋 STAP 3: CSS Toevoegen aan `src/App.css`

Voeg de volgende classes toe **onderaan** App.css (na de bestaande clan CSS):

```css
/* ============================================ */
/* GRAND MARKET                                 */
/* ============================================ */

.market-offer-card {
  background: rgba(10, 14, 20, 0.7);
  border: 1px solid rgba(102, 252, 241, 0.15);
  border-radius: 12px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.market-offer-card:hover {
  border-color: rgba(102, 252, 241, 0.35);
  box-shadow: 0 4px 15px rgba(102, 252, 241, 0.1);
}

.market-popular-item {
  background: rgba(10, 14, 20, 0.7);
  border: 1px solid rgba(102, 252, 241, 0.15);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.market-popular-item:hover {
  border-color: rgba(102, 252, 241, 0.35);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 252, 241, 0.1);
}

.market-section {
  background: rgba(10, 14, 20, 0.5);
  border: 1px solid rgba(102, 252, 241, 0.12);
  border-radius: 12px;
  padding: 20px;
}

.market-chart-bar {
  flex: 1;
  border-radius: 2px 2px 0 0;
  min-width: 4px;
  transition: height 0.3s ease;
}

.market-chart-bar:hover {
  opacity: 0.8;
  box-shadow: 0 0 8px rgba(102, 252, 241, 0.3);
}

.market-history-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(102, 252, 241, 0.08);
  font-size: 12px;
  transition: background 0.2s ease;
}

.market-history-row:hover {
  background: rgba(102, 252, 241, 0.05);
}

.market-empty-slot {
  background: rgba(10, 14, 20, 0.4);
  border: 1px dashed rgba(102, 252, 241, 0.15);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  color: #8a9ba8;
  font-size: 13px;
  margin-bottom: 10px;
}

/* Order book feed scrollbar */
.market-order-feed::-webkit-scrollbar {
  width: 6px;
}
.market-order-feed::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
.market-order-feed::-webkit-scrollbar-thumb {
  background: rgba(102, 252, 241, 0.3);
  border-radius: 3px;
}
.market-order-feed::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 252, 241, 0.5);
}
```

---

## 📋 STAP 4: TopBar.jsx Wijzigen

**Bestand:** `src/components/TopBar.jsx`

De Grand Market knop bestaat al op **regel 20** maar is een placeholder met `alert()`.

**Wijzig van:**
```jsx
<button className="topbar-nav-btn" onClick={() => alert('Grand Market is currently in development!')} title="Grand Market">⚖️</button>
```

**Wijzig naar:**
```jsx
<button className={`topbar-nav-btn ${screen === 'market' ? 'active' : ''}`} onClick={() => setScreen('market')} title="Grand Market">⚖️</button>
```

---

## 📋 STAP 5: App.jsx Wijzigen

### 5A. Import toevoegen
Bovenaan bij de component imports, voeg toe:
```javascript
import MarketView from './components/MarketView';
```

Bij de hook imports, voeg toe:
```javascript
import { useMarket } from './hooks/useMarket';
```

### 5B. Hook aanroepen
Na de `useClan()` aanroep (rond regel 207), voeg toe:
```javascript
// Market system
const { marketOffers, setMarketOffers, marketSlots, setMarketSlots, orderHistory, setOrderHistory, marketScreen, setMarketScreen, createBuyOffer, createSellOffer, cancelOffer, collectOffer, collectAllOffers, purchaseMarketSlot, processMarketTick } = useMarket();
```

### 5C. Market Ref voor save/load
Na `const clanRef = useRef(clan);`:
```javascript
const marketRef = useRef({ marketOffers, marketSlots, orderHistory });
useEffect(() => { marketRef.current = { marketOffers, marketSlots, orderHistory }; }, [marketOffers, marketSlots, orderHistory]);
```

### 5D. Market tick interval
Na de useSaveLoad aanroep, voeg een effect toe:
```javascript
// Market simulation tick (elke 4 seconden)
useEffect(() => {
  const marketInterval = setInterval(() => {
    processMarketTick();
  }, 4000);
  return () => clearInterval(marketInterval);
}, [processMarketTick]);
```

### 5E. Screen routing toevoegen
In de `<main className="content-area">` sectie, voeg toe na het `screen === 'clan'` blok:

```jsx
{screen === 'market' && (
  <MarketView
    inventory={inventory}
    setInventory={setInventory}
    marketOffers={marketOffers}
    marketSlots={marketSlots}
    orderHistory={orderHistory}
    marketScreen={marketScreen}
    setMarketScreen={setMarketScreen}
    createBuyOffer={createBuyOffer}
    createSellOffer={createSellOffer}
    cancelOffer={cancelOffer}
    collectOffer={collectOffer}
    collectAllOffers={collectAllOffers}
    purchaseMarketSlot={purchaseMarketSlot}
    ITEM_IMAGES={ITEM_IMAGES}
    ITEMS={ITEMS}
  />
)}
```

### 5F. Screen exclusion bijwerken
De catch-all conditie voor combat/skilling views bevat een lange reeks `screen !== ...` checks. Voeg `screen !== 'market'` toe:

**Wijzig van:**
```jsx
{screen !== 'profile' && screen !== 'inventory' && screen !== 'slayer' && screen !== 'shop' && screen !== 'clan' && (
```

**Wijzig naar:**
```jsx
{screen !== 'profile' && screen !== 'inventory' && screen !== 'slayer' && screen !== 'shop' && screen !== 'clan' && screen !== 'market' && (
```

---

## 📋 STAP 6: useSaveLoad.js Wijzigen

### 6A. Parameters uitbreiden
**Wijzig de functie signature van:**
```javascript
export function useSaveLoad(skillsRef, inventoryRef, equipment, combatStyle, quickPrayers, clan, setSkills, setInventory, setEquipment, setCombatStyle, setQuickPrayers, setClan)
```

**Naar:**
```javascript
export function useSaveLoad(skillsRef, inventoryRef, equipment, combatStyle, quickPrayers, clan, setSkills, setInventory, setEquipment, setCombatStyle, setQuickPrayers, setClan, marketRef, setMarketOffers, setMarketSlots, setOrderHistory)
```

### 6B. Load sectie uitbreiden
Na `if (parsed.clan && setClan) setClan(parsed.clan);` voeg toe:
```javascript
if (parsed.market) {
  if (parsed.market.marketOffers && setMarketOffers) setMarketOffers(parsed.market.marketOffers);
  if (parsed.market.marketSlots && setMarketSlots) setMarketSlots(parsed.market.marketSlots);
  if (parsed.market.orderHistory && setOrderHistory) setOrderHistory(parsed.market.orderHistory);
}
```

### 6C. Save sectie uitbreiden
In het auto-save interval, voeg `market` toe aan het gameState object:
```javascript
const gameState = {
  skills: skillsRef.current,
  inventory: inventoryRef.current,
  equipment,
  combatStyle,
  quickPrayers,
  clan,
  market: marketRef?.current || null
};
```

### 6D. Dependency array bijwerken
Voeg niets toe aan de dependency array — `marketRef` is een ref en verandert niet. De auto-save pakt automatisch de laatste waarde op via `marketRef.current`.

### 6E. App.jsx useSaveLoad aanroep bijwerken
**Wijzig van:**
```javascript
const { hardResetGame } = useSaveLoad(skillsRef, inventoryRef, equipment, combatStyle, quickPrayers, clanRef.current, setSkills, setInventory, setEquipment, setCombatStyle, setQuickPrayers, setClan);
```

**Naar:**
```javascript
const { hardResetGame } = useSaveLoad(skillsRef, inventoryRef, equipment, combatStyle, quickPrayers, clanRef.current, setSkills, setInventory, setEquipment, setCombatStyle, setQuickPrayers, setClan, marketRef, setMarketOffers, setMarketSlots, setOrderHistory);
```

---

## ⚠️ Veelvoorkomende Fouten (VOORKOM DEZE!)

1. **GEEN dubbele `.card` wrappers** — MarketView wordt gerouteerd in een `<main>` zonder wrapper. Het component zelf moet een `<div className="card">` als root hebben. Voeg NOOIT een extra `.card` wrapper eromheen.

2. **Functional state updates** — Alle useCallback functies in useMarket.js moeten `[]` als dependency array hebben en `setState(prev => ...)` gebruiken. NOOIT direct state lezen in de callback body.

3. **Geen `var()` in inline styles** — Gebruik altijd vaste hex kleuren (`#F1FAEE`, `#66FCF1`, etc.) in React inline style objecten.

4. **StrictMode is VERWIJDERD** — Er is geen StrictMode meer in main.jsx. Maak geen code die dubbel uitvoeren compenseert.

5. **ITEMS structuur** — Items hebben alleen `{ name, value }` — geen `image` property. Gebruik `ITEM_IMAGES[itemId]` apart voor afbeeldingen. Niet alle items hebben images.

6. **Coins zijn in inventory** — Coins staan in `inventory.coins`, niet als aparte state.

7. **Screen routing** — De "catch-all" conditie voor combat/skilling MOET `screen !== 'market'` bevatten, anders wordt MarketView samen met CombatView gerenderd.

---

## 🧪 Test Checklist

Na implementatie, controleer:

- [ ] Grand Market knop in TopBar werkt (navigeert naar market screen)
- [ ] Grand Market knop krijgt `active` class wanneer op market scherm
- [ ] Overview tab toont alle 4 panelen (Trading Hub, Popular Items, My Offers, Order Book)
- [ ] "Create Buy Offer" opent modal met item dropdown, quantity, price
- [ ] "Create Sell Offer" toont alleen items die in inventory zitten
- [ ] Offers worden langzaam vervuld (elke 4 seconden)
- [ ] "Collect" knop verschijnt wanneer er items/coins klaarstaan
- [ ] "Collect All" verzamelt alles in één keer
- [ ] "Cancel" geeft resterende coins/items terug
- [ ] Lege slots tonen "Empty Slot" placeholder
- [ ] Order Book Feed toont recente trades met timestamps
- [ ] Sell Offers tab werkt
- [ ] Trading History tab werkt
- [ ] Market data wordt opgeslagen en geladen (refresh test)
- [ ] Geen console errors
- [ ] Styling past bij de rest van de app (glassmorphism, juiste kleuren)
