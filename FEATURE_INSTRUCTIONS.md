# Feature Implementation Instructions — Idle Clash

Dit document bevat gedetailleerde instructies voor het implementeren van 8 features. Lees elke sectie volledig voordat je begint. De volgorde is belangrijk — sommige features overlappen.

**Project:** React + Vite v8.0.2  
**Locatie:** `src/` map  
**Build:** `npx vite build`  
**Stijl:** Inline styles + CSS in `src/App.css` en `src/styles/InfusionView.css`  
**Kleurenpalet:** Dark theme — `#111920` (bg), `#202a33` (card), `#0b1014` (darker), `#2a3b4c` (borders), `#4affd4` (accent), `#208b76` (primary), `#c5d3df` (text), `#7b95a6` (muted)

---

## FEATURE 1: Slayer "Fight Monster" knop laten werken

### Probleem
In `SlayerView.jsx` regel ~72 staat een knop:
```jsx
<button style={{...}}>⚔️ Fight {currentTask.monsterKey}</button>
```
Deze knop heeft **geen `onClick` handler**. Hij moet de speler direct naar combat navigeren en het gevecht met het juiste monster starten.

### Oplossing

**Stap 1:** Voeg `setScreen` en `startCombat` toe als props aan SlayerView:

In `App.jsx` waar SlayerView wordt gerenderd (zoek `<SlayerView`), voeg toe:
```jsx
<SlayerView
  slayer={slayer}
  skills={skills}
  SLAYER_MASTERS={SLAYER_MASTERS}
  inventory={inventory}
  setInventory={setInventory}
  setScreen={setScreen}         // NIEUW
  startCombat={startCombat}     // NIEUW
/>
```

**Stap 2:** Update de function signature in `SlayerView.jsx`:
```jsx
export default function SlayerView({ 
  slayer, skills, SLAYER_MASTERS, inventory, setInventory,
  setScreen, startCombat  // NIEUW
}) {
```

**Stap 3:** Geef de knop een onClick handler:
```jsx
<button 
  onClick={() => {
    startCombat(currentTask.monsterKey);  // Start het gevecht met het juiste monster
    setScreen('combat');                   // Navigeer naar combat view
  }}
  style={{ padding: '10px 30px', backgroundColor: '#208b76', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
>
  ⚔️ Fight {currentTask.monsterKey}
</button>
```

**Belangrijk:** `currentTask.monsterKey` bevat waarden zoals `'fight_chicken'`, `'fight_cow'` etc. Dit zijn action IDs die `startCombat(id)` accepteert (zie App.jsx `startCombat` functie). De functie `startCombat` doet al `setActiveAction(id)` en `combat.seedCombat(id, ...)`.

**Speciaal geval:** Als `currentTask.monsterKey === 'lava_cave'` (Konar boss tasks), moet `setScreen('combat')` ook werken — `startCombat('lava_cave')` schakelt automatisch naar FightCave mode via `startFightCave()`.

---

## FEATURE 2: Slayer Task Completed Popup

### Beschrijving
Wanneer een slayer task voltooid is, moet er een popup verschijnen linksboven (bij de andere notificaties) met "Task Completed". De popup moet donkergrijs zijn.

### Huidige situatie
In `useSlayer.js` regel ~47-53, wanneer `killsCompleted >= killsNeeded`:
```javascript
if (newCompleted >= prev.killsNeeded) {
  // Task complete!
  const master = SLAYER_MASTERS.find(m => m.id === prev.masterId);
  if (master) {
    setSlayerPoints(p => p + master.points);
    setConsecutive(c => c + 1);
  }
  return null; // Clear current task — HIER MOETEN WE DE POPUP TRIGGEREN
}
```

De `recordKill` functie in `useSlayer.js` wordt momenteel **nergens aangeroepen** vanuit het combat systeem. Dit moet ook gefixt worden!

### Oplossing

**Stap 1:** Maak `slayer.recordKill` aanroepbaar vanuit combat. In `App.jsx`, zoek waar het combat systeem enemy kills afhandelt. Dit zit in de `useCombatEngine.js` hook of in de `onAllEnemiesDead` callback in `startCombat`. Je moet bij elke enemy kill `slayer.recordKill(monsterKey)` aanroepen. De `monsterKey` is de `activeAction` (bijv. `'fight_chicken'`).

In `App.jsx` moet je de `startCombat` functie aanpassen (regel 453) zodat de `onAllEnemiesDead` callback ook `slayer.recordKill` aanroept. Het HUIDIGE code is:
```javascript
const startCombat = (id) => {
  console.log('[App] startCombat', id);
  setActiveAction(id);
  setProgress(0);
  resetSession();

  if (id === 'lava_cave') {
    startFightCave();
  } else {
    setFightCaveActive(false);
    let callbacks;
    callbacks = {
      onAllEnemiesDead: () => {
        // Enemy died — re-seed the same enemy after a short delay (respawn)
        setTimeout(() => combat.seedCombat(id, null, callbacks), 1200);
      },
      onPlayerDead: stopAction
    };
    combat.seedCombat(id, null, callbacks);
  }
};
```

Wijzig naar:
```javascript
const startCombat = (id) => {
  console.log('[App] startCombat', id);
  setActiveAction(id);
  setProgress(0);
  resetSession();

  if (id === 'lava_cave') {
    startFightCave();
  } else {
    setFightCaveActive(false);
    let callbacks;
    callbacks = {
      onAllEnemiesDead: () => {
        // NIEUW: Record kill voor slayer task
        slayer.recordKill(id);
        // Enemy died — re-seed the same enemy after a short delay (respawn)
        setTimeout(() => combat.seedCombat(id, null, callbacks), 1200);
      },
      onPlayerDead: stopAction
    };
    combat.seedCombat(id, null, callbacks);
  }
};
```

**Stap 2:** Voeg een slayer task completion notification systeem toe. Er zijn twee benaderingen:

**Optie A (Aanbevolen):** Gebruik het bestaande `PetNotificationDisplay` systeem. Voeg een nieuw notification type toe.

**Optie B:** Maak een nieuw state + component. Voeg in App.jsx toe:
```jsx
const [slayerTaskComplete, setSlayerTaskComplete] = useState(null);
```

Pas `useSlayer.js` aan om een callback te accepteren. Het HUIDIGE function signature is:
```javascript
export function useSlayer(SLAYER_MASTERS, ACTIONS) {
```

Wijzig naar:
```javascript
export function useSlayer(SLAYER_MASTERS, ACTIONS, onTaskComplete) {
```

Dan in de `recordKill` functie (regel ~43), wanneer task klaar is:
```javascript
export function useSlayer(SLAYER_MASTERS, ACTIONS, onTaskComplete) {
  // ... in recordKill, wanneer task klaar is:
  if (newCompleted >= prev.killsNeeded) {
    const master = SLAYER_MASTERS.find(m => m.id === prev.masterId);
    if (master) {
      setSlayerPoints(p => p + master.points);
      setConsecutive(c => c + 1);
      // NIEUW: Trigger completion callback
      if (onTaskComplete) {
        onTaskComplete({
          monsterKey: prev.monsterKey,
          killsNeeded: prev.killsNeeded,
          points: master.points,
          masterName: master.name
        });
      }
    }
    return null;
  }
```

**Stap 3:** Maak de popup component of voeg hem inline toe in App.jsx:
```jsx
{slayerTaskComplete && (
  <div style={{
    position: 'fixed',
    top: '80px',
    left: '20px',
    backgroundColor: 'rgba(40, 44, 52, 0.95)',  // Donkergrijs
    border: '2px solid #4affd4',
    borderRadius: '8px',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#4affd4',
    textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
    zIndex: 99998,
    animation: 'petPerkFloatIn 3s ease-out forwards',
    backdropFilter: 'blur(4px)'
  }}>
    <span style={{ fontSize: '24px' }}>💀</span>
    <div>
      <div style={{ fontSize: '11px', color: '#7b95a6', textTransform: 'uppercase' }}>Slayer Task Complete!</div>
      <div style={{ fontSize: '13px', color: '#4affd4' }}>
        {slayerTaskComplete.killsNeeded}x {slayerTaskComplete.monsterKey.replace('fight_', '').replace(/_/g, ' ')} — +{slayerTaskComplete.points} pts
      </div>
    </div>
  </div>
)}
```

Zorg voor auto-dismiss na 3-4 seconden:
```javascript
if (onTaskComplete) {
  onTaskComplete(data);
  setTimeout(() => onTaskComplete(null), 4000);
}
```

---

## FEATURE 3: Slayer Counter in CombatView

### Beschrijving
In CombatView moet een counter zichtbaar zijn die de voortgang van de huidige slayer task toont: `x/x monsters`.

### Oplossing

**Stap 1:** Geef `slayer` (of `slayer.currentTask`) als prop door aan CombatView in App.jsx. Zoek de `<CombatView` tag (regel ~639) met de bestaande props en voeg toe:
```jsx
<CombatView 
  activeAction={activeAction} ACTIONS={ACTIONS} 
  playerHp={combat.playerHp} maxHp={maxHp} 
  playerPrayer={playerPrayer} maxPrayer={maxPrayer} 
  combatState={combat.combatState} prayers={combat.prayers} 
  prayerQueue={combat.prayerQueue} togglePrayer={combat.togglePrayer} 
  eatFood={(item, heal) => combat.eatFood(item, heal, setInventory)} 
  drinkPotion={(item) => combat.drinkPotion(item, setInventory)}
  getItemCount={getItemCount} stopAction={stopAction} 
  getCurrentWeapon={getCurrentWeapon} xpDrops={xpDrops} 
  quickPrayers={quickPrayers}
  combatStyle={combatStyle}
  setCombatStyle={setCombatStyle}
  availableCombatStyles={getAvailableCombatStyles()}
  equipment={equipment}
  WEAPONS={WEAPONS}
  ARMOR={ARMOR}
  AMMO={AMMO}
  slayerTask={slayer.currentTask}  // NIEUW
/>
```

**Stap 2:** In `CombatView.jsx`, voeg de prop toe aan de function signature:
```jsx
export default function CombatView({ 
  // ... bestaande props ...,
  slayerTask  // NIEUW
}) {
```

**Stap 3:** Voeg de counter toe in de player card, direct onder de header (na de "Player" h3 en "Leave Combat" button div):
```jsx
{/* SLAYER TASK COUNTER */}
{slayerTask && slayerTask.monsterKey === activeAction && (
  <div style={{
    backgroundColor: '#1a2b25',
    border: '1px solid #208b76',
    borderRadius: '4px',
    padding: '6px 10px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px'
  }}>
    <span style={{ color: '#7b95a6' }}>💀 Slayer Task</span>
    <span style={{ color: '#4affd4', fontWeight: 'bold' }}>
      {slayerTask.killsCompleted} / {slayerTask.killsNeeded}
    </span>
  </div>
)}
```

**Plaatsing:** Direct na het `<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>` blok met de Player header. Vergelijk het `activeAction` (bijv. `'fight_chicken'`) met `slayerTask.monsterKey` om te checken of we het juiste monster aan het vechten zijn.

---

## FEATURE 4: Thieving Toolbox toevoegen

### Probleem
ThievingView heeft geen toolbox terwijl TOOL_SKILLS.thieving WEL gedefinieerd is met lockpick tiers. De toolbox props worden niet doorgegeven vanuit App.jsx.

### Huidige situatie
- `gameData.js` regel 18: `thieving: { icon: '🔓', name: 'Thieving Lockpick', tiers: ['bronze_lockpick', ...] }`
- `ThievingView.jsx` krijgt GEEN toolbox-gerelateerde props
- `SkillingView.jsx` heeft een complete `renderToolboxPanel()` functie die we als voorbeeld kunnen gebruiken

### Oplossing

**Stap 1:** Geef toolbox props door aan ThievingView in App.jsx. Zoek `<ThievingView` (regel ~597). De HUIDIGE props zijn:
```jsx
<ThievingView
  skills={skills} activeAction={activeAction} setActiveAction={setActiveAction}
  addXp={addXp}
  triggerXpDrop={triggerXpDrop}
  setInventory={setInventory}
  setSessionStats={setSessionStats}
  THIEVING_TARGETS={THIEVING_TARGETS}
  stopAction={stopAction}
  progress={progress}
  setProgress={setProgress}
  equipment={equipment}
  triggerPetNotification={triggerPetNotification}
/>
```

Voeg de volgende props toe (ze worden al gebruikt door SkillingView dus ze bestaan in App.jsx scope):
```jsx
<ThievingView
  skills={skills} activeAction={activeAction} setActiveAction={setActiveAction}
  addXp={addXp}
  triggerXpDrop={triggerXpDrop}
  setInventory={setInventory}
  setSessionStats={setSessionStats}
  THIEVING_TARGETS={THIEVING_TARGETS}
  stopAction={stopAction}
  progress={progress}
  setProgress={setProgress}
  equipment={equipment}
  triggerPetNotification={triggerPetNotification}
  claimToolCallback={claimToolCallback}   // NIEUW
  claimedTools={claimedTools}             // NIEUW
  toolboxes={toolboxes}                   // NIEUW
  upgradeToolbox={upgradeToolbox}         // NIEUW
  storeToolInBox={storeToolInBox}         // NIEUW
  inventory={inventory}                   // NIEUW (setInventory bestond al)
  equipToolFromBox={equipToolFromBox}     // NIEUW
  infuseTool={infuseTool}                 // NIEUW
  toggleEquip={toggleEquip}              // NIEUW
/>
```

**Stap 2:** In `ThievingView.jsx`, voeg de nieuwe props toe aan de function signature en importeer benodigde data:
```jsx
import { getRequiredXp, getActivePet } from '../utils/gameHelpers';
import { PETS, ITEMS, ITEM_IMAGES, TOOL_SKILLS } from '../data/gameData';
```

**Stap 3:** Kopieer de `renderToolboxPanel()` functie uit `SkillingView.jsx` (regels 196-400 ongeveer) naar ThievingView. De functie gebruikt `screen` als key — in ThievingView is dat altijd `'thieving'`. Vervang alle referenties naar `screen` met `'thieving'`.

**Stap 4:** Pas de ThievingView return layout aan. Momenteel is het:
```jsx
<div className="thieving-view">
  {/* HEADER */}
  {/* STUN OVERLAY */}
  {/* TARGET GRID */}
</div>
```

Maak het een flex layout zoals SkillingView:
```jsx
<div className="thieving-view" style={{ display: 'flex', gap: '20px' }}>
  <div style={{ flex: 1 }}>
    {/* HEADER */}
    {/* STUN OVERLAY */}
    {/* TARGET GRID */}
  </div>
  
  {/* RIGHT SIDE: Toolbox */}
  <div className="skilling-toolbox-wrapper" style={{ position: 'relative' }}>
    {renderToolboxPanel()}
  </div>
</div>
```

---

## FEATURE 5: Toolbox landscape fixes

### 5A: Tool image even groot als pet image
In de toolbox droprate row (onderaan de toolbox), worden tool en pet images naast elkaar getoond. Beiden gebruiken `className="toolbox-droprate-img"` met inline `width: '36px', height: '36px'`. In compact mode (landscape) worden deze door CSS verkleind naar `24px`.

Het probleem is dat de **tool image** kleiner lijkt dan de **pet image**. Dit komt doordat sommige tool images intern meer padding/whitespace hebben.

**Fix:** Zorg dat beide images exact dezelfde container en sizing krijgen. In `SkillingView.jsx` regels ~384-404, de `.toolbox-droprate-item` divs zijn identiek qua structuur. Controleer:

1. In `App.css` bij de compact media query (max-width: 1024px), zoek `.toolbox-droprate-img`:
```css
.toolbox-droprate-img {
  width: 24px !important;
  height: 24px !important;
}
```
Pas dit aan naar een grotere, gelijke maat:
```css
.toolbox-droprate-img {
  width: 32px !important;
  height: 32px !important;
}
```

Of maak de tool image groter en de pet image kleiner, afhankelijk van hoe het er nu uitziet. Test visueel.

### 5B: Pet droprate tekst wijzigen
In `SkillingView.jsx`, zoek de twee `.toolbox-droprate-item` divs (rond regel 384-404). De pet droprate toont momenteel `<0.01%`. Wijzig dit naar `<0.001%`:

Zoek:
```jsx
<span style={{ fontSize: '8px', color: 'var(--text-primary)', fontWeight: 'bold' }}>&lt;0.01%</span>
```
Er zijn 2 instances — de **tweede** is voor de pet. Wijzig alleen de pet instance naar:
```jsx
<span style={{ fontSize: '8px', color: 'var(--text-primary)', fontWeight: 'bold' }}>&lt;0.001%</span>
```

### 5C: "Claim free tool" knop even breed als toolbox
De claim tool knop zit in de unclaimed toolbox state (SkillingView.jsx ~regels 215-230). De container div heeft `minWidth: '180px'` maar de button heeft geen `width: '100%'`.

Fix: voeg `width: '100%'` toe aan de button style:
```jsx
<button
  onClick={() => claimToolCallback && claimToolCallback(screen)}
  style={{
    width: '100%',           // NIEUW
    padding: '8px 12px',
    backgroundColor: '#4affd4',
    color: '#000',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '11px'
  }}
>
  Claim
</button>
```

---

## FEATURE 6: Infusion Tab volledig herontwerpen

### Beschrijving
De InfusionView moet herstructureerd worden zodat:
1. De layout meer lijkt op andere SkillingViews (grid van action cards)
2. De "Extend view" knop verdwijnt — alle items zijn direct zichtbaar
3. Nette weergave per weapon categorie (Scimitars, Bows, Staffs)

### Huidige situatie
- `InfusionView.jsx` groepeert acties in `compact` (2 kolommen) en `expanded` (3 kolommen) met een extend knop
- CSS in `styles/InfusionView.css`
- De card layout is al vrij goed (gebruikt `infusion-action-card` class met cost badges)

### Oplossing

**Stap 1:** Verwijder de extend/collapse logica uit `InfusionView.jsx`:
- Verwijder de `expandedTypes` state en `toggleExpanded` functie
- In `renderTypeSection`, render ALLE acties in één grid (geen split tussen common/advanced)
- Verwijder de extend button wrapper en extend-btn volledig

**Stap 2:** Vereenvoudig `renderTypeSection`:
```jsx
const renderTypeSection = (typeKey, typeLabel, actions) => {
  if (actions.length === 0) return null;
  return (
    <div key={typeKey} className="type-section">
      <h3 className="type-label">{typeLabel}</h3>
      <div className="skilling-action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' }}>
        {actions.map(({ action, actionId }) =>
          renderActionCard(action, actionId)
        )}
      </div>
    </div>
  );
};
```

Dit gebruikt `skilling-action-grid` net als de andere views, met `auto-fill` zodat het responsief is.

**Stap 3:** Update `InfusionView.css`:
- Verwijder `.actions-grid.compact` en `.actions-grid.expanded` regels
- Verwijder `.extend-btn` en `.extend-button-wrapper` regels
- Houd `.infusion-action-card` en cost display CSS

**Stap 4:** Zorg dat de category sort alle tiers toont, gesorteerd op level requirement:
```jsx
// In getActionsByType, na het vullen van organized, sorteer per reqLvl
Object.keys(organized.weapons).forEach(type => {
  organized.weapons[type].sort((a, b) => a.action.reqLvl - b.action.reqLvl);
});
```

---

## FEATURE 7: Hover Info Box voor alle items

### Beschrijving
Wanneer de speler met de muis over een item hovert (in inventory, shop, of elders), moet er een tooltip verschijnen:
- **Items met stats** (wapens, armor): Toon naam, qty, stats per combat type (Melee STR/ACC/DEF, Ranged, Magic), required level, shop prijs + GE Buy/Sell prijs (zie screenshot "Red coat")
- **Items zonder stats** (potions, resources): Toon naam, qty, beschrijving, shop prijs + GE Buy/Sell prijs (zie screenshot "Potion of negotiation")

### Huidige situatie
Items in InventoryView tonen GEEN hover tooltip. Er is een click-to-open modal die item details toont (InventoryView.jsx regels 305-490). De `getItemData()` helper haalt stats op uit WEAPONS, ARMOR, AMMO, PETS, en ITEMS.

### Oplossing

**Stap 1:** Maak een herbruikbaar `ItemTooltip` component (`src/components/ItemTooltip.jsx`):

```jsx
import React, { useState, useRef, useEffect } from 'react';
import { ITEMS, ITEM_IMAGES, PETS } from '../data/gameData';

export default function ItemTooltip({ itemKey, count, getItemData, children }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  const tooltipRef = useRef(null);

  const handleMouseEnter = (e) => {
    setShow(true);
    updatePosition(e);
  };

  const handleMouseMove = (e) => {
    updatePosition(e);
  };

  const updatePosition = (e) => {
    // Positie tooltip rechts van de cursor, met boundary checking
    const x = e.clientX + 15;
    const y = e.clientY - 10;
    setPos({ x, y });
  };

  const handleMouseLeave = () => setShow(false);

  if (!itemKey) return children;

  const data = getItemData(itemKey);
  if (!data) return children;

  const baseValue = data.value || ITEMS[itemKey]?.value || 0;
  const hasStats = data.damage || data.str || data.accuracy || data.att || 
                   data.defence || data.rangedStr || data.rangedAcc || data.rangedDef ||
                   data.magicStr || data.magicAcc || data.magicDef;
  const isEquipment = !!data.equipSlot && data.equipSlot !== 'pet';

  const formatStat = (label, val) => {
    if (!val && val !== 0) return `${label}: –`;
    const color = val > 0 ? '#2ecc71' : val < 0 ? '#e74c3c' : '#7b95a6';
    return <span>{label}: <span style={{ color }}>{val > 0 ? `+${val}` : val}</span></span>;
  };

  return (
    <div 
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'contents' }}
    >
      {children}
      {show && (
        <div ref={tooltipRef} style={{
          position: 'fixed',
          left: pos.x + 'px',
          top: pos.y + 'px',
          backgroundColor: '#1a2530',
          border: '1px solid #2a3b4c',
          borderRadius: '6px',
          padding: '10px 14px',
          minWidth: '220px',
          maxWidth: '300px',
          zIndex: 100000,
          pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.7)',
          fontSize: '12px',
          color: '#c5d3df'
        }}>
          {/* Header: Image + Name + Qty */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #2a3b4c', paddingBottom: '8px' }}>
            {ITEM_IMAGES[itemKey] && (
              <img src={ITEM_IMAGES[itemKey]} alt={data.name} style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
            )}
            <div>
              <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px' }}>{data.name}</div>
              <div style={{ fontSize: '11px', color: '#7b95a6' }}>x{count || 0}</div>
            </div>
          </div>

          {/* Stats block (voor equipment) */}
          {isEquipment && hasStats && (
            <div style={{ marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px' }}>
              {/* Melee */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>🗡️</span>
                <span>STR: {formatStat('', data.damage || data.str || 0)} | ACC: {formatStat('', data.accuracy || data.att || 0)} | DEF: {formatStat('', data.defence || 0)}</span>
              </div>
              {/* Ranged */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: (data.rangedStr || data.rangedAcc || data.rangedDef) ? '#c5d3df' : '#556b7a' }}>
                <span>🏹</span>
                <span>STR: {formatStat('', data.rangedStr || 0)} | ACC: {formatStat('', data.rangedAcc || 0)} | DEF: {formatStat('', data.rangedDef || 0)}</span>
              </div>
              {/* Magic */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: (data.magicStr || data.magicAcc || data.magicDef) ? '#c5d3df' : '#556b7a' }}>
                <span>🧙</span>
                <span>STR: {formatStat('', data.magicStr || 0)} | ACC: {formatStat('', data.magicAcc || 0)} | DEF: {formatStat('', data.magicDef || 0)}</span>
              </div>
            </div>
          )}

          {/* Required level (indien van toepassing) */}
          {data.reqLvl && (
            <div style={{ fontSize: '11px', color: '#4affd4', marginBottom: '6px' }}>
              ⚔️ Lvl {data.reqLvl}
            </div>
          )}

          {/* Beschrijving (voor niet-equipment items) */}
          {!isEquipment && data.desc && (
            <div style={{ fontSize: '11px', color: '#c5d3df', marginBottom: '6px', lineHeight: '1.4' }}>
              {data.desc}
            </div>
          )}

          {/* Pet perk beschrijving */}
          {data.equipSlot === 'pet' && data.desc && (
            <div style={{ fontSize: '11px', color: '#c5d3df', marginBottom: '6px', lineHeight: '1.4' }}>
              {data.desc}
            </div>
          )}

          {/* Speed boost (tools) */}
          {data.speedBoosts && (
            <div style={{ fontSize: '11px', color: '#f1c40f', marginBottom: '6px' }}>
              ⚡ Speed: +{(Object.values(data.speedBoosts)[0] * 100).toFixed(0)}%
            </div>
          )}

          {/* Prijs regel */}
          <div style={{
            display: 'flex', gap: '10px', 
            backgroundColor: '#111920', 
            padding: '6px 8px', 
            borderRadius: '4px',
            marginTop: '4px',
            fontSize: '11px'
          }}>
            <span style={{ color: '#f1c40f' }}>🏪 🪙 {baseValue}</span>
            <span style={{ color: '#7b95a6' }}>🤝 🪙 B: {Math.floor(baseValue * 1.1)} | S: {Math.floor(baseValue * 1.8)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Stap 2:** Wrap inventory items met ItemTooltip. In `InventoryView.jsx`, bij het renderen van gevulde slots (regel ~193), wrap de slot div:
```jsx
<ItemTooltip itemKey={itemKey} count={count} getItemData={getItemData}>
  <div className="inv-slot-item inv-slot-filled" ...>
    {/* bestaande content */}
  </div>
</ItemTooltip>
```

**Stap 3:** Voeg de tooltip ook toe aan ShopView items en eventueel CombatView equipment slots.

**Let op:** De tooltip moet NIET verschijnen op mobile/touch devices. Voeg een check toe:
```jsx
const isTouchDevice = 'ontouchstart' in window;
if (isTouchDevice) return children; // Geen tooltip op touch
```

**Boundary checking:** De tooltip moet niet buiten het scherm vallen. Voeg een useEffect toe die de positie corrigeert als de tooltip buiten de viewport zou vallen.

---

## FEATURE 8: Popup voor geen offline task

### Beschrijving
Als de speler inlogt maar er was GEEN actieve task (activeAction was null bij het opslaan), toon een popup die de speler informeert dat hij XP kan verdienen door een task aan te zetten voor het uitloggen.

### Huidige situatie
In `useSaveLoad.js` regel ~47-63 wordt offline progressie berekend. De conditie is:
```javascript
// Bereken offline progressie
if (parsed.lastSaveTimestamp && parsed.activeAction && ACTIONS) {
  const offlineData = calculateOfflineProgress(
    parsed.lastSaveTimestamp,
    parsed.activeAction,
    // ... parameters ...
  );
  if (offlineData) {
    setInventory(offlineData.newInventory);
    if (addXp) addXp(offlineData.skill, offlineData.totalXp);
    if (setOfflineProgress) setOfflineProgress(offlineData);
  }
}
// Daarna NIETS — als parsed.activeAction null is, wordt er helemaal niets gedaan
```

### Oplossing

**Stap 1:** Voeg een else-branch toe in `useSaveLoad.js` (na het bestaande if-block op regel ~47):
```javascript
// Bereken offline progressie
if (parsed.lastSaveTimestamp && parsed.activeAction && ACTIONS) {
  // ... bestaande offline progress code ...
} else if (parsed.lastSaveTimestamp && !parsed.activeAction) {
  // Speler was uitgelogd ZONDER actieve task
  const timeDiffMs = Date.now() - parsed.lastSaveTimestamp;
  const minutesAway = Math.floor(timeDiffMs / (1000 * 60));
  // Alleen tonen als speler minstens 2 minuten weg was
  if (minutesAway >= 2 && setOfflineProgress) {
    setOfflineProgress({ noTask: true, minutesAway });
  }
}
```

**Stap 2:** In `WelcomeBackModal.jsx`, check voor het `noTask` geval BOVENAAN de component (na de `if (!offlineProgress) return null;` check):
```jsx
export default function WelcomeBackModal({ offlineProgress, onClose }) {
  if (!offlineProgress) return null;

  // NIEUW: Speciaal geval — geen task was actief
  if (offlineProgress.noTask) {
    return (
      <div className="popup-overlay" onClick={onClose}>
        <div className="popup-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ color: '#f1c40f', marginBottom: '10px' }}>💤 Welcome Back!</h1>
            <p style={{ color: '#c5d3df', fontSize: '16px', margin: '5px 0' }}>
              You were away for <strong style={{ color: '#f1c40f' }}>{Math.floor(offlineProgress.minutesAway / 60)}h {offlineProgress.minutesAway % 60}m</strong>
            </p>
          </div>

          <div style={{ backgroundColor: 'rgba(241, 196, 15, 0.1)', borderRadius: '6px', padding: '15px', marginBottom: '15px', border: '1px solid rgba(241, 196, 15, 0.3)' }}>
            <h3 style={{ color: '#f1c40f', marginTop: 0, marginBottom: '10px' }}>💡 Tip: Earn XP While Offline!</h3>
            <p style={{ color: '#c5d3df', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
              You didn't have an active task when you logged out. Start any skilling action (Woodcutting, Mining, Fishing, etc.) before closing the game and you'll earn XP and items while you're away!
            </p>
          </div>

          <button onClick={onClose} style={{
            width: '100%', padding: '12px', backgroundColor: '#208b76', color: 'white',
            border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer'
          }}>
            Got it!
          </button>
        </div>
      </div>
    );
  }

  // ... bestaande WelcomeBackModal code voor normale offline progress ...
}
```

**Alternatief:** Je kunt ook een `localStorage` flag opslaan zodat de popup maar 1 keer getoond wordt:
```javascript
const hasSeenNoTaskTip = localStorage.getItem('hasSeenNoTaskTip');
if (!hasSeenNoTaskTip && minutesAway >= 2) {
  // Toon popup
}
// Bij sluiten:
localStorage.setItem('hasSeenNoTaskTip', 'true');
```

Maar het is wellicht beter om de popup ELKE keer te tonen als de speler vergeet een task aan te zetten — als reminder.

---

## Samenvatting implementatie-volgorde

1. **Feature 1** (Slayer Fight knop) — Klein, snel, onafhankelijk
2. **Feature 2** (Slayer completion popup) — Vereist Feature 1 (recordKill aanroep)
3. **Feature 3** (Slayer counter in CombatView) — Onafhankelijk, klein
4. **Feature 4** (Thieving toolbox) — Middelgroot, kopieer patroon uit SkillingView
5. **Feature 5** (Toolbox landscape fixes) — Klein CSS + tekst fixes
6. **Feature 6** (Infusion redesign) — Middelgroot, refactor bestaand component
7. **Feature 7** (Hover tooltips) — Groot, nieuw component + integratie op meerdere plekken
8. **Feature 8** (No-task popup) — Klein, aanpassing aan bestaand systeem

**Build testen:** Na elke feature `npx vite build` draaien om te verifiëren dat er geen fouten zijn.
