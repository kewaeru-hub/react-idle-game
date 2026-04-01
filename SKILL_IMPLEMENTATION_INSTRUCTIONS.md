# 🎮 SKILL IMPLEMENTATIE INSTRUCTIES — Idle Clash

> Dit document bevat **stap-voor-stap instructies** om de volgende skills te implementeren:
> Enchanting verwijderen, Thieving, Farming, Herblore, Slayer (rework), en Agility.
> 
> **Lees het hele document door voordat je begint.** De stappen bouwen op elkaar voort.

---

## 📋 OVERZICHT VAN ALLE STAPPEN

| Stap | Skill | Samenvatting |
|------|-------|-------------|
| 0 | Enchanting | Volledig verwijderen uit de codebase |
| 1 | Agility | Idle acties + dodge chance (0.2% per level) in combat |
| 2 | Thieving | Targets bestelen met stun-kans, succesrate display |
| 3 | Farming | Seeds planten → 5x opbrengst, lange groeitijd |
| 4 | Herblore | Cleaning (snel) + Brewing (traag) → Potions met combat boosts |
| 5 | Slayer | 5 masters + boss master, slayer shop, auto-complete, task cancel |
| 6 | Integratie | Potion effects in combat, dodge in combat, alle wiring in App.jsx |

---

## STAP 0: ENCHANTING VERWIJDEREN

### 0A. `src/data/gameData.js` — SKILL_LIST
Verwijder `'enchanting'` uit de array:
```js
// WAS:
export const SKILL_LIST = ['attack', 'strength', 'defence', 'ranged', 'magic', 'hitpoints', 'combat', 'slayer', 'prayer', 'woodcutting', 'fishing', 'cooking', 'mining', 'smithing', 'infusion', 'thieving', 'enchanting', 'farming', 'foraging', 'herblore', 'crafting', 'agility'];

// WORDT:
export const SKILL_LIST = ['attack', 'strength', 'defence', 'ranged', 'magic', 'hitpoints', 'combat', 'slayer', 'prayer', 'woodcutting', 'fishing', 'cooking', 'mining', 'smithing', 'infusion', 'thieving', 'farming', 'foraging', 'herblore', 'crafting', 'agility'];
```

### 0B. `src/components/Sidebar.jsx` — SKILLS array
Verwijder het enchanting object:
```js
// VERWIJDER DEZE REGEL:
{ id: 'enchanting', icon: '✨' },
```

### 0C. Zoek in de hele codebase
Zoek met ctrl+shift+F naar `enchanting` en verwijder elke resterende referentie. Er zouden geen ACTIONS of andere data voor enchanting moeten bestaan, maar dubbelcheck het.

---

## STAP 1: AGILITY

Agility is de simpelste skill: idle acties die agility XP geven, plus een passieve dodge chance in combat.

### 1A. `src/data/gameData.js` — Nieuwe ITEMS toevoegen
Voeg onderaan het `ITEMS` object toe (vóór de `};` afsluithaakje):
```js
  // Agility Rewards
  mark_of_grace: { name: 'Mark of Grace', value: 25 },
  agility_ticket: { name: 'Agility Ticket', value: 100 },
```

### 1B. `src/data/gameData.js` — Nieuwe ACTIONS toevoegen
Voeg onderaan het `ACTIONS` object toe (vóór de `};` afsluithaakje):
```js
  // --- AGILITY ---
  agility_gnome_course: { skill: 'agility', name: 'Gnome Course', ticks: 8.0, xp: 8, reqLvl: 1, reward: { mark_of_grace: 1 } },
  agility_draynor_course: { skill: 'agility', name: 'Draynor Course', ticks: 9.5, xp: 16, reqLvl: 10, reward: { mark_of_grace: 1 } },
  agility_varrock_course: { skill: 'agility', name: 'Varrock Course', ticks: 10.2, xp: 28, reqLvl: 20, reward: { mark_of_grace: 1 } },
  agility_canifis_course: { skill: 'agility', name: 'Canifis Course', ticks: 11.0, xp: 42, reqLvl: 35, reward: { mark_of_grace: 2 } },
  agility_falador_course: { skill: 'agility', name: 'Falador Course', ticks: 12.5, xp: 58, reqLvl: 50, reward: { mark_of_grace: 2 } },
  agility_seers_course: { skill: 'agility', name: 'Seers Course', ticks: 13.0, xp: 78, reqLvl: 60, reward: { mark_of_grace: 3 } },
  agility_rellekka_course: { skill: 'agility', name: 'Rellekka Course', ticks: 14.5, xp: 102, reqLvl: 70, reward: { mark_of_grace: 3 } },
  agility_ardougne_course: { skill: 'agility', name: 'Ardougne Course', ticks: 15.0, xp: 135, reqLvl: 80, reward: { mark_of_grace: 4, agility_ticket: 1 } },
  agility_prif_course: { skill: 'agility', name: 'Prifddinas Course', ticks: 16.5, xp: 168, reqLvl: 90, reward: { mark_of_grace: 5, agility_ticket: 2 } },
```

### 1C. `src/components/SkillingView.jsx` — Agility info banner
In de return statement van SkillingView, **vóór** het `{/* ACTIE GRID */}` comment, voeg een speciale banner toe die alleen bij agility verschijnt:

```jsx
      {/* AGILITY DODGE INFO */}
      {screen === 'agility' && (
        <div className="card" style={{ backgroundColor: '#1a2520', border: '1px solid #208b76', padding: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ color: '#4affd4', margin: '0 0 5px 0' }}>⚡ Dodge Chance</h4>
            <p style={{ color: '#c5d3df', margin: 0, fontSize: '13px' }}>
              You gain <strong style={{ color: '#f1c40f' }}>0.2%</strong> dodge chance per Agility level.
            </p>
          </div>
          <div style={{ textAlign: 'center', backgroundColor: '#111920', padding: '10px 20px', borderRadius: '8px', border: '1px solid #2a3b4c' }}>
            <div style={{ color: '#f1c40f', fontSize: '24px', fontWeight: 'bold' }}>{(currentLevel * 0.2).toFixed(1)}%</div>
            <div style={{ color: '#7b95a6', fontSize: '11px' }}>Current Dodge</div>
          </div>
        </div>
      )}
```

### 1D. `src/hooks/useCombatEngine.js` — Dodge mechanic
In de `computeDamage` functie, **vlak na** `if (Math.random() >= hitChance) return 0; // Miss`, voeg toe:

```js
  // Agility dodge check (defender only if player)
  if (defender.dodgeChance && defender.dodgeChance > 0) {
    if (Math.random() < defender.dodgeChance) return 0; // Dodged!
  }
```

### 1E. `src/hooks/useCombat.js` — dodgeChance aan player meegeven
In de `seedCombat` functie, in het `allies` array waar de player wordt gedefinieerd, voeg `dodgeChance` toe:

```js
    const agilityLevel = skills.agility?.level || 1;
    const dodgeChance = agilityLevel * 0.002; // 0.2% per level = 0.002

    const allies = [{
      id: 'player',
      name: 'Player',
      hp: currentHp,
      maxHp: playerStats?.maxHp || 10,
      att: accLevel,
      str: strLevel,
      weaponAtt: weapon.att || 0,
      weaponStr: weapon.str || 0,
      attackSpeedTicks: weapon.speedTicks || 4,
      currentTickCount: 0,
      dodgeChance: dodgeChance   // <-- NIEUW
    }];
```

---

## STAP 2: THIEVING

Thieving is **NIET** een standaard SkillingView skill. Het heeft een uniek mechanisme: een kans om gestunned te worden (= geen loot + tijdverlies). Daarom heeft het een **eigen component** nodig, vergelijkbaar met hoe SlayerView werkt.

### 2A. `src/data/gameData.js` — Nieuwe ITEMS toevoegen
Voeg toe aan het `ITEMS` object:
```js
  // Thieving Loot
  stolen_coins: { name: 'Stolen Coins', value: 1 },
  gold_ring: { name: 'Gold Ring', value: 50 },
  silver_necklace: { name: 'Silver Necklace', value: 80 },
  gem_bag: { name: 'Gem Bag', value: 200 },
  lockpick: { name: 'Lockpick', value: 15 },
  treasury_note: { name: 'Treasury Note', value: 500 },
```

### 2B. `src/data/gameData.js` — THIEVING_TARGETS data
Voeg deze **nieuwe export** toe ONDER het ACTIONS object (dit is een apart object, NIET in ACTIONS):

```js
// ==========================================
// --- THIEVING TARGETS ---
// ==========================================
export const THIEVING_TARGETS = [
  {
    id: 'pickpocket_farmer',
    name: 'Farmer',
    icon: '🧑‍🌾',
    reqLvl: 1,
    xp: 8,
    baseStunChance: 0.65,    // 65% kans op stun bij lvl 1
    stunDurationMs: 3000,     // 3 seconden stun
    actionTimeMs: 2400,       // 2.4s per attempt
    reward: { coins: 9 },
    desc: 'A simple farmer. Easy pickings.'
  },
  {
    id: 'pickpocket_warrior',
    name: 'Warrior',
    icon: '⚔️',
    reqLvl: 10,
    xp: 18,
    baseStunChance: 0.70,
    stunDurationMs: 3500,
    actionTimeMs: 2600,
    reward: { coins: 18, lockpick: 1 },
    desc: 'A trained warrior. Watch out for his reflexes.'
  },
  {
    id: 'pickpocket_rogue',
    name: 'Rogue',
    icon: '🗡️',
    reqLvl: 20,
    xp: 30,
    baseStunChance: 0.72,
    stunDurationMs: 3500,
    actionTimeMs: 2800,
    reward: { coins: 30, lockpick: 2 },
    desc: 'A fellow thief. He knows all the tricks.'
  },
  {
    id: 'steal_bakery_stall',
    name: 'Bakery Stall',
    icon: '🍞',
    reqLvl: 25,
    xp: 35,
    baseStunChance: 0.55,
    stunDurationMs: 4000,
    actionTimeMs: 3200,
    reward: { coins: 20 },
    desc: 'Swipe goods from the bakery stall.'
  },
  {
    id: 'pickpocket_guard',
    name: 'Guard',
    icon: '💂',
    reqLvl: 35,
    xp: 48,
    baseStunChance: 0.75,
    stunDurationMs: 4000,
    actionTimeMs: 3000,
    reward: { coins: 45, gold_ring: 1 },
    desc: 'City guards carry decent coin purses.'
  },
  {
    id: 'steal_gem_stall',
    name: 'Gem Stall',
    icon: '💎',
    reqLvl: 45,
    xp: 60,
    baseStunChance: 0.65,
    stunDurationMs: 4500,
    actionTimeMs: 3400,
    reward: { coins: 35, silver_necklace: 1 },
    desc: 'A stall full of sparkling gems.'
  },
  {
    id: 'pickpocket_paladin',
    name: 'Paladin',
    icon: '🛡️',
    reqLvl: 55,
    xp: 80,
    baseStunChance: 0.78,
    stunDurationMs: 4500,
    actionTimeMs: 3200,
    reward: { coins: 80, gold_ring: 1, chaos_rune: 2 },
    desc: 'Holy warriors with heavy purses.'
  },
  {
    id: 'pickpocket_knight',
    name: 'Knight of Ardougne',
    icon: '🏰',
    reqLvl: 65,
    xp: 105,
    baseStunChance: 0.80,
    stunDurationMs: 5000,
    actionTimeMs: 3000,
    reward: { coins: 120, gold_ring: 1 },
    desc: 'Knights are wealthy targets, but very alert.'
  },
  {
    id: 'steal_bank_chest',
    name: 'Bank Vault',
    icon: '🏦',
    reqLvl: 75,
    xp: 135,
    baseStunChance: 0.82,
    stunDurationMs: 5500,
    actionTimeMs: 4000,
    reward: { coins: 200, gem_bag: 1 },
    desc: 'Break into a bank vault. High risk, high reward.'
  },
  {
    id: 'steal_outpost_treasury',
    name: 'Outpost Treasury',
    icon: '🏴',
    reqLvl: 85,
    xp: 170,
    baseStunChance: 0.85,
    stunDurationMs: 6000,
    actionTimeMs: 4500,
    reward: { coins: 350, treasury_note: 1, gem_bag: 1 },
    desc: 'The most guarded treasure. Only masters dare.'
  },
];
```

### 2C. Nieuwe component: `src/components/ThievingView.jsx`
Maak dit **complete** component aan. Het beheert zijn eigen idle loop in plaats van `useSkilling` te gebruiken, omdat het stun-logica nodig heeft.

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { getRequiredXp } from '../utils/gameHelpers';

export default function ThievingView({
  skills, activeAction, setActiveAction, addXp, triggerXpDrop,
  setInventory, setSessionStats, THIEVING_TARGETS, stopAction, progress, setProgress
}) {
  const [stunned, setStunned] = useState(false);
  const [stunTimer, setStunTimer] = useState(0);
  const [lastResult, setLastResult] = useState(null); // 'success' | 'stunned' | null
  const intervalRef = useRef(null);
  const stunTimeoutRef = useRef(null);
  const actionStartRef = useRef(null);

  const thievingLevel = skills.thieving?.level || 1;
  const agilityLevel = skills.agility?.level || 1;
  const currentXp = Math.floor(skills.thieving?.xp || 0);
  const currentLevelStartXP = getRequiredXp(thievingLevel);
  const nextLevelTotalXP = getRequiredXp(thievingLevel + 1);
  const xpGainedThisLevel = Math.max(0, currentXp - currentLevelStartXP);
  const xpNeededThisLevel = nextLevelTotalXP - currentLevelStartXP;
  const xpPercentage = Math.min(100, (xpGainedThisLevel / xpNeededThisLevel) * 100);

  // Bereken success rate voor een target
  const getSuccessRate = (target) => {
    // Formule: base stun chance wordt verminderd door thieving en agility levels
    // Elke thieving level boven requirement verlaagt stun kans met 1.5%
    // Elke agility level verlaagt stun kans met 0.3%
    const levelBonus = Math.max(0, thievingLevel - target.reqLvl) * 0.015;
    const agilityBonus = agilityLevel * 0.003;
    const stunChance = Math.max(0.05, target.baseStunChance - levelBonus - agilityBonus);
    return Math.min(0.95, 1 - stunChance);
  };

  // Start thieving een target
  const startThieving = (targetId) => {
    if (stunned) return;
    if (activeAction === targetId) {
      stopAction();
      return;
    }
    setActiveAction(targetId);
    setProgress(0);
    setLastResult(null);
  };

  // Idle loop voor actief target
  useEffect(() => {
    // Alleen actief als het actieve action een thieving target is
    const target = THIEVING_TARGETS.find(t => t.id === activeAction);
    if (!target || stunned) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    actionStartRef.current = Date.now();

    // Progress visuele update
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - actionStartRef.current;
      const pct = Math.min(100, (elapsed / target.actionTimeMs) * 100);
      setProgress(pct);
    }, 50);

    // Actie uitvoeren interval
    intervalRef.current = setInterval(() => {
      const successRate = getSuccessRate(target);
      const roll = Math.random();

      if (roll < successRate) {
        // SUCCES
        setLastResult('success');
        setInventory(prev => {
          const n = { ...prev };
          Object.entries(target.reward).forEach(([k, v]) => {
            n[k] = (n[k] || 0) + v;
          });
          return n;
        });
        addXp('thieving', target.xp);
        triggerXpDrop('thieving', target.xp, false);
        setSessionStats(prev => ({
          ...prev,
          actionsCompleted: prev.actionsCompleted + 1,
          itemsGained: prev.itemsGained + 1
        }));
      } else {
        // GESTUNNED
        setLastResult('stunned');
        setStunned(true);
        setProgress(0);

        // Stun timer
        const stunStart = Date.now();
        const stunInterval = setInterval(() => {
          const remaining = target.stunDurationMs - (Date.now() - stunStart);
          setStunTimer(Math.max(0, remaining));
        }, 100);

        stunTimeoutRef.current = setTimeout(() => {
          clearInterval(stunInterval);
          setStunned(false);
          setStunTimer(0);
          setLastResult(null);
          actionStartRef.current = Date.now(); // Reset voor volgende poging
        }, target.stunDurationMs);
      }

      actionStartRef.current = Date.now();
      setProgress(0);
    }, target.actionTimeMs);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(progressInterval);
    };
  }, [activeAction, stunned]);

  // Cleanup bij unmount of stop
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (stunTimeoutRef.current) clearTimeout(stunTimeoutRef.current);
    };
  }, []);

  return (
    <div style={{ marginTop: '0px' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#fff' }}>Thieving</h1>
          <span style={{ fontSize: '16px', color: '#c5d3df' }}>Level: <strong style={{ color: '#fff' }}>{thievingLevel}</strong></span>
          <span style={{ fontSize: '14px', color: '#c5d3df' }}>Experience: <strong style={{ color: '#fff' }}>{currentXp.toLocaleString()}</strong> / {nextLevelTotalXP.toLocaleString()}</span>
        </div>
        <div style={{ height: '12px', backgroundColor: '#111920', borderRadius: '6px', overflow: 'hidden', border: '1px solid #2a3b4c' }}>
          <div style={{ width: `${xpPercentage}%`, height: '100%', backgroundColor: '#4affd4', transition: 'width 0.3s ease-in-out' }}></div>
        </div>
      </div>

      {/* STUN OVERLAY */}
      {stunned && (
        <div className="card" style={{ backgroundColor: '#2a1010', border: '1px solid #e74c3c', padding: '15px', marginBottom: '15px', textAlign: 'center' }}>
          <h4 style={{ color: '#e74c3c', margin: '0 0 5px 0' }}>💫 Stunned!</h4>
          <p style={{ color: '#c5d3df', margin: 0, fontSize: '14px' }}>
            You were caught! Wait <strong style={{ color: '#f1c40f' }}>{(stunTimer / 1000).toFixed(1)}s</strong> before trying again.
          </p>
        </div>
      )}

      {/* TARGET GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
        {THIEVING_TARGETS.map(target => {
          const hasLevel = thievingLevel >= target.reqLvl;
          const isActive = activeAction === target.id;
          const successRate = getSuccessRate(target);

          return (
            <div
              key={target.id}
              onClick={() => hasLevel && !stunned && startThieving(target.id)}
              style={{
                position: 'relative',
                borderRadius: '6px',
                padding: '20px 15px 35px 15px',
                textAlign: 'center',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '180px',
                transition: 'all 0.3s ease',
                backgroundColor: isActive ? '#163231' : !hasLevel ? '#0b1014' : '#111920',
                border: isActive ? '1px solid #4affd4' : !hasLevel ? '1px solid #2a3b4c' : '1px solid #208b76',
                boxShadow: isActive ? '0 0 10px rgba(74, 255, 212, 0.2)' : 'none',
                cursor: hasLevel && !stunned ? 'pointer' : 'default',
                opacity: hasLevel ? 1 : 0.7
              }}
            >
              {/* LOCKED OVERLAY */}
              {!hasLevel && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(11, 16, 20, 0.85)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                  zIndex: 10
                }}>
                  <span style={{ color: '#c5d3df', fontSize: '13px', fontWeight: 'bold' }}>Unlocks at</span>
                  <span style={{ color: '#4affd4', fontSize: '18px', fontWeight: 'bold' }}>level {target.reqLvl}</span>
                </div>
              )}

              {/* ICON */}
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>{target.icon}</div>

              {/* NAME & DESC */}
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#fff' }}>{target.name}</h3>
              <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#7b95a6' }}>{target.desc}</p>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#c5d3df' }}>
                {target.xp} XP / {(target.actionTimeMs / 1000).toFixed(1)}s
              </p>

              {/* SUCCESS RATE */}
              {hasLevel && (
                <div style={{ marginTop: 'auto', marginBottom: '10px' }}>
                  <div style={{ fontSize: '13px', color: '#7b95a6', marginBottom: '4px' }}>Success Rate</div>
                  <div style={{
                    fontSize: '20px', fontWeight: 'bold',
                    color: successRate >= 0.8 ? '#2ecc71' : successRate >= 0.5 ? '#f1c40f' : '#e74c3c'
                  }}>
                    {(successRate * 100).toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '10px', color: '#556b7a', marginTop: '2px' }}>
                    Thieving Lv. & Agility Lv. reduce stun chance
                  </div>
                </div>
              )}

              {/* REWARD PREVIEW */}
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '5px', fontSize: '11px', color: '#4affd4' }}>
                {Object.entries(target.reward).map(([k, v]) => (
                  <span key={k}>{v}x {k.replace(/_/g, ' ')}</span>
                ))}
              </div>

              {/* PROGRESS BAR */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '8px', backgroundColor: '#0b1014' }}>
                <div style={{
                  width: isActive && !stunned ? `${progress}%` : '0%',
                  height: '100%',
                  backgroundColor: '#2ecc71',
                  transition: isActive && progress > 5 ? 'width 0.1s linear' : 'none'
                }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 2D. `src/data/gameData.js` — Export THIEVING_TARGETS
Zorg dat de nieuwe export `THIEVING_TARGETS` bovenaan geïmporteerd kan worden. De export staat al in het bestand als je stap 2B hebt gedaan.

### 2E. `src/App.jsx` — ThievingView integreren
1. **Import** bovenaan:
```js
import ThievingView from './components/ThievingView';
```

2. **Import THIEVING_TARGETS** bij je gameData import:
```js
import { ARMOR, SKILL_LIST, WEAPONS, ACTIONS, AMMO, ITEMS, SLAYER_MASTERS, PRAYER_BOOK, ITEM_IMAGES, THIEVING_TARGETS } from './data/gameData';
```

3. **Render** in de main content area. Voeg `'thieving'` toe aan de exclusielijst en render ThievingView apart:
```jsx
{/* In de screen exclusion check, voeg 'thieving' toe: */}
{screen !== 'profile' && screen !== 'inventory' && screen !== 'slayer' && screen !== 'shop' && screen !== 'clan' && screen !== 'market' && screen !== 'thieving' && (
  // ... bestaande SkillingView/CombatView code
)}

{/* Thieving apart renderen: */}
{screen === 'thieving' && (
  <div className="card" style={{ padding: '20px', width: '100%' }}>
    <ThievingView
      skills={skills}
      activeAction={activeAction}
      setActiveAction={setActiveAction}
      addXp={addXp}
      triggerXpDrop={triggerXpDrop}
      setInventory={setInventory}
      setSessionStats={setSessionStats}
      THIEVING_TARGETS={THIEVING_TARGETS}
      stopAction={stopAction}
      progress={progress}
      setProgress={setProgress}
    />
  </div>
)}
```

---

## STAP 3: FARMING

Farming gebruikt het standaard SkillingView systeem (ACTIONS + useSkilling), maar met langere actietijden en 5x opbrengst per seed.

### 3A. `src/data/gameData.js` — Nieuwe ITEMS toevoegen
Voeg toe aan het `ITEMS` object. **Let op:** sommige seeds bestaan al (potato_seed, herb_seed etc.). Voeg alleen de NIEUWE toe:

```js
  // Farming Seeds (NIEUW)
  tomato_seed: { name: 'Tomato Seed', value: 3 },
  cabbage_seed: { name: 'Cabbage Seed', value: 4 },
  strawberry_seed: { name: 'Strawberry Seed', value: 8 },
  sweetcorn_seed: { name: 'Sweetcorn Seed', value: 12 },
  snape_grass_seed: { name: 'Snape Grass Seed', value: 20 },
  ranarr_seed: { name: 'Ranarr Seed', value: 120 },
  snapdragon_seed: { name: 'Snapdragon Seed', value: 300 },
  torstol_seed: { name: 'Torstol Seed', value: 800 },

  // Farming Produce (NIEUW)
  potato: { name: 'Potato', value: 4 },
  tomato: { name: 'Tomato', value: 6 },
  cabbage: { name: 'Cabbage', value: 8 },
  strawberry: { name: 'Strawberry', value: 15 },
  sweetcorn: { name: 'Sweetcorn', value: 25 },
  snape_grass: { name: 'Snape Grass', value: 40 },
  grimy_guam: { name: 'Grimy Guam', value: 15 },
  grimy_ranarr: { name: 'Grimy Ranarr', value: 150 },
  grimy_snapdragon: { name: 'Grimy Snapdragon', value: 400 },
  grimy_torstol: { name: 'Grimy Torstol', value: 1000 },
```

> **BELANGRIJK:** De bestaande `guam_leaf`, `ranarr_weed`, `snapdragon`, `torstol` items worden de **clean** versies. De farming produce is de **grimy** versie die eerst gecleaned moet worden via Herblore (Stap 4).

### 3B. `src/data/gameData.js` — Farming ACTIONS
Voeg toe aan het `ACTIONS` object. Farming geeft 5x produce per seed en heeft lange actietijden:

```js
  // --- FARMING (Produce) ---
  farm_potato: { skill: 'farming', name: 'Potato', ticks: 15.0, xp: 12, reqLvl: 1, category: 'produce', cost: { potato_seed: 1 }, reward: { potato: 5 } },
  farm_tomato: { skill: 'farming', name: 'Tomato', ticks: 17.0, xp: 20, reqLvl: 10, category: 'produce', cost: { tomato_seed: 1 }, reward: { tomato: 5 } },
  farm_cabbage: { skill: 'farming', name: 'Cabbage', ticks: 19.0, xp: 30, reqLvl: 20, category: 'produce', cost: { cabbage_seed: 1 }, reward: { cabbage: 5 } },
  farm_strawberry: { skill: 'farming', name: 'Strawberry', ticks: 21.0, xp: 42, reqLvl: 30, category: 'produce', cost: { strawberry_seed: 1 }, reward: { strawberry: 5 } },
  farm_sweetcorn: { skill: 'farming', name: 'Sweetcorn', ticks: 23.0, xp: 58, reqLvl: 40, category: 'produce', cost: { sweetcorn_seed: 1 }, reward: { sweetcorn: 5 } },
  farm_snape_grass: { skill: 'farming', name: 'Snape Grass', ticks: 25.0, xp: 78, reqLvl: 55, category: 'produce', cost: { snape_grass_seed: 1 }, reward: { snape_grass: 5 } },

  // --- FARMING (Herbs) - These give grimy herbs that need to be cleaned via Herblore ---
  farm_guam: { skill: 'farming', name: 'Guam', ticks: 20.0, xp: 18, reqLvl: 9, category: 'herbs', cost: { herb_seed: 1 }, reward: { grimy_guam: 5 } },
  farm_ranarr: { skill: 'farming', name: 'Ranarr', ticks: 26.0, xp: 55, reqLvl: 32, category: 'herbs', cost: { ranarr_seed: 1 }, reward: { grimy_ranarr: 5 } },
  farm_snapdragon: { skill: 'farming', name: 'Snapdragon', ticks: 30.0, xp: 95, reqLvl: 62, category: 'herbs', cost: { snapdragon_seed: 1 }, reward: { grimy_snapdragon: 5 } },
  farm_torstol: { skill: 'farming', name: 'Torstol', ticks: 35.0, xp: 145, reqLvl: 85, category: 'herbs', cost: { torstol_seed: 1 }, reward: { grimy_torstol: 5 } },
```

### 3C. `src/components/SkillingView.jsx` — Farming tabs
In het `TABS` object, voeg toe:
```js
    farming: ['produce', 'herbs'],
```

### 3D. Monster drops aanpassen
Zorg dat sommige monsters nu ook farming seeds droppen. Dit staat voor een deel al in de data (goblin dropt `potato_seed`, orc dropt `watermelon_seed`, etc.), maar je kunt meer toevoegen door de `reward` objecten van bestaande monsters uit te breiden. **Voorbeelden** (pas de bestaande fight_ entries aan):

- `fight_goblin` reward: voeg `tomato_seed: 1` toe
- `fight_orc` reward: voeg `cabbage_seed: 1` toe
- `fight_druid` reward: voeg `ranarr_seed: 1` toe (ipv herb_seed)
- `fight_giant` reward: voeg `strawberry_seed: 1` toe
- `fight_green_dragon` reward: voeg `sweetcorn_seed: 1` toe
- `fight_red_dragon` reward: voeg `snapdragon_seed: 1` toe
- `fight_black_dragon` reward: voeg `torstol_seed: 1` toe

---

## STAP 4: HERBLORE

Herblore heeft twee tabs: **Cleaning** (snel, zet grimy → clean) en **Brewing** (traag, maakt potions).

### 4A. `src/data/gameData.js` — Herblore ITEMS
Voeg toe aan het `ITEMS` object:

```js
  // Clean Herbs (cleaning output — guam_leaf, ranarr_weed, snapdragon, torstol bestaan AL)
  // Geen nieuwe items nodig voor clean herbs, we gebruiken de bestaande items.

  // Potions (NIEUW)
  combat_potion: { name: 'Combat Potion', value: 200 },
  super_combat_potion: { name: 'Super Combat Potion', value: 800 },
  ranged_potion: { name: 'Ranged Potion', value: 200 },
  super_ranged_potion: { name: 'Super Ranged Potion', value: 800 },
  magic_potion: { name: 'Magic Potion', value: 200 },
  super_magic_potion: { name: 'Super Magic Potion', value: 800 },
  // prayer_potion bestaat al
  respawn_potion: { name: 'Respawn Potion', value: 350 },
  gathering_potion: { name: 'Gathering Potion', value: 300 },
  stamina_potion: { name: 'Stamina Potion', value: 250 },

  // Super potion catalyst
  dragon_scale: { name: 'Dragon Scale', value: 500 },
```

> **Dragon Scale** dropt van draken. Voeg `dragon_scale: 1` toe aan de rewards van `fight_green_dragon`, `fight_red_dragon`, en `fight_black_dragon`.

### 4B. `src/data/gameData.js` — Herblore ACTIONS
Voeg toe aan het `ACTIONS` object:

```js
  // --- HERBLORE: CLEANING (Snel - grimy → clean) ---
  clean_guam: { skill: 'herblore', name: 'Clean Guam', ticks: 1.5, xp: 3, reqLvl: 1, category: 'cleaning', cost: { grimy_guam: 1 }, reward: { guam_leaf: 1 } },
  clean_ranarr: { skill: 'herblore', name: 'Clean Ranarr', ticks: 1.5, xp: 8, reqLvl: 25, category: 'cleaning', cost: { grimy_ranarr: 1 }, reward: { ranarr_weed: 1 } },
  clean_snapdragon: { skill: 'herblore', name: 'Clean Snapdragon', ticks: 1.5, xp: 12, reqLvl: 59, category: 'cleaning', cost: { grimy_snapdragon: 1 }, reward: { snapdragon: 1 } },
  clean_torstol: { skill: 'herblore', name: 'Clean Torstol', ticks: 1.5, xp: 16, reqLvl: 75, category: 'cleaning', cost: { grimy_torstol: 1 }, reward: { torstol: 1 } },

  // --- HERBLORE: BREWING (Traag - herbs + secundair ingredient → potion) ---
  brew_combat_potion: { skill: 'herblore', name: 'Combat Potion', ticks: 10.0, xp: 45, reqLvl: 5, category: 'brewing', cost: { guam_leaf: 1, potato: 1 }, reward: { combat_potion: 1 } },
  brew_ranged_potion: { skill: 'herblore', name: 'Ranged Potion', ticks: 10.0, xp: 50, reqLvl: 12, category: 'brewing', cost: { guam_leaf: 1, cabbage: 1 }, reward: { ranged_potion: 1 } },
  brew_magic_potion: { skill: 'herblore', name: 'Magic Potion', ticks: 10.0, xp: 55, reqLvl: 18, category: 'brewing', cost: { guam_leaf: 1, snape_grass: 1 }, reward: { magic_potion: 1 } },
  brew_prayer_potion: { skill: 'herblore', name: 'Prayer Potion', ticks: 12.0, xp: 65, reqLvl: 30, category: 'brewing', cost: { ranarr_weed: 1, snape_grass: 1 }, reward: { prayer_potion: 1 } },
  brew_stamina_potion: { skill: 'herblore', name: 'Stamina Potion', ticks: 10.0, xp: 60, reqLvl: 35, category: 'brewing', cost: { ranarr_weed: 1, strawberry: 1 }, reward: { stamina_potion: 1 } },
  brew_gathering_potion: { skill: 'herblore', name: 'Gathering Potion', ticks: 12.0, xp: 72, reqLvl: 45, category: 'brewing', cost: { snapdragon: 1, sweetcorn: 1 }, reward: { gathering_potion: 1 } },
  brew_respawn_potion: { skill: 'herblore', name: 'Respawn Potion', ticks: 14.0, xp: 85, reqLvl: 55, category: 'brewing', cost: { snapdragon: 1, tomato: 1 }, reward: { respawn_potion: 1 } },

  // --- HERBLORE: SUPER POTIONS (Vereisen gewone potion + torstol + dragon_scale) ---
  brew_super_combat: { skill: 'herblore', name: 'Super Combat Potion', ticks: 18.0, xp: 150, reqLvl: 70, category: 'super', cost: { combat_potion: 1, torstol: 1, dragon_scale: 1 }, reward: { super_combat_potion: 1 } },
  brew_super_ranged: { skill: 'herblore', name: 'Super Ranged Potion', ticks: 18.0, xp: 150, reqLvl: 72, category: 'super', cost: { ranged_potion: 1, torstol: 1, dragon_scale: 1 }, reward: { super_ranged_potion: 1 } },
  brew_super_magic: { skill: 'herblore', name: 'Super Magic Potion', ticks: 18.0, xp: 150, reqLvl: 76, category: 'super', cost: { magic_potion: 1, torstol: 1, dragon_scale: 1 }, reward: { super_magic_potion: 1 } },
```

### 4C. `src/components/SkillingView.jsx` — Herblore tabs
In het `TABS` object, voeg toe:
```js
    herblore: ['cleaning', 'brewing', 'super'],
```

### 4D. Potion effects — Hoe ze werken in combat

De potions moeten **drinkbaar** zijn tijdens combat, net als food/prayer potions. Dit vereist aanpassingen in meerdere bestanden.

#### Potion Effect Data — `src/data/gameData.js`
Voeg een nieuwe export toe:

```js
// ==========================================
// --- POTION EFFECTS ---
// ==========================================
export const POTION_EFFECTS = {
  combat_potion: {
    name: 'Combat Potion',
    boosts: { attack: 5, strength: 5 },       // +5 att/str levels
    duration: 120,                              // 120 seconden (200 ticks)
    icon: '⚔️'
  },
  super_combat_potion: {
    name: 'Super Combat Potion',
    boosts: { attack: 10, strength: 10, defence: 5 },  // +10/+10/+5
    duration: 180,
    icon: '⚔️'
  },
  ranged_potion: {
    name: 'Ranged Potion',
    boosts: { ranged: 6 },
    duration: 120,
    icon: '🏹'
  },
  super_ranged_potion: {
    name: 'Super Ranged Potion',
    boosts: { ranged: 12, defence: 5 },
    duration: 180,
    icon: '🏹'
  },
  magic_potion: {
    name: 'Magic Potion',
    boosts: { magic: 6 },
    duration: 120,
    icon: '🔮'
  },
  super_magic_potion: {
    name: 'Super Magic Potion',
    boosts: { magic: 12, defence: 5 },
    duration: 180,
    icon: '🔮'
  },
  respawn_potion: {
    name: 'Respawn Potion',
    effect: 'reduce_respawn',
    value: 0.5,                                // Halveert respawn timer
    duration: 180,
    icon: '⏱️'
  },
  gathering_potion: {
    name: 'Gathering Potion',
    effect: 'sell_chance',
    value: 0.20,                               // 20% kans op sell price
    duration: 180,
    icon: '💰'
  },
  stamina_potion: {
    name: 'Stamina Potion',
    effect: 'speed_boost',
    value: 0.10,                               // 10% sneller skilling
    duration: 120,
    icon: '⚡'
  }
};
```

#### Potion Drinking in Combat — `src/hooks/useCombat.js`
Pas de `drinkPotion` functie aan zodat het meer potions ondersteunt. Momenteel behandelt het alleen prayer potions. Breid het uit:

```js
  const drinkPotion = (potionId, inventorySetter) => {
    if (!inventorySetter) return false;
    const currentInv = inventorySetter === setInventory ? undefined : null; // We use the setter pattern
    
    inventorySetter(prev => {
      if ((prev[potionId] || 0) <= 0) return prev;
      const n = { ...prev };
      n[potionId] -= 1;
      return n;
    });

    if (potionId === 'prayer_potion') {
      engine.queueAction({ type: 'POTION', potionType: 'prayer_potion' });
    }
    // Combat/Ranged/Magic potions boost the player's combat stats
    // Dit wordt afgehandeld via een activePotion state in App.jsx (zie stap 6)
    return true;
  };
```

> **BELANGRIJK:** De volledige potion effect integratie (stat boosts, timers, etc.) wordt in **Stap 6** afgehandeld omdat het meerdere bestanden raakt.

---

## STAP 5: SLAYER REWORK

De SlayerView component bestaat al, maar is **niet verbonden** met App.jsx. We moeten:
1. Slayer task logica bouwen
2. Boss master toevoegen (unlockable via shop)
3. Auto-complete functionaliteit
4. Cancel task voor 30 points
5. Alles wiren in App.jsx

### 5A. `src/data/gameData.js` — SLAYER_MASTERS uitbreiden

Vervang de bestaande `SLAYER_MASTERS` array:

```js
export const SLAYER_MASTERS = [
  {
    id: 'master_1', name: 'Turael', tier: 'beginner', reqHp: 10, points: 5,
    desc: 'Beginner monsters',
    taskRange: [15, 30], // min-max kill count
    monsters: ['fight_chicken', 'fight_cow', 'fight_goblin', 'fight_snake', 'fight_wolf', 'fight_bear']
  },
  {
    id: 'master_2', name: 'Vannaka', tier: 'easy', reqHp: 25, points: 10,
    desc: 'Easy monsters',
    taskRange: [30, 60],
    monsters: ['fight_zombie', 'fight_scorpion', 'fight_druid', 'fight_orc', 'fight_crocodile', 'fight_giant', 'fight_green_dragon']
  },
  {
    id: 'master_3', name: 'Chaeldar', tier: 'moderate', reqHp: 40, points: 15,
    desc: 'Moderate monsters',
    taskRange: [40, 80],
    monsters: ['fight_ghost', 'fight_red_spider', 'fight_swamp_lizard', 'fight_demon', 'fight_demonic_scorpion', 'fight_red_dragon']
  },
  {
    id: 'master_4', name: 'Nieve', tier: 'hard', reqHp: 60, points: 20,
    desc: 'Hard monsters',
    taskRange: [50, 100],
    monsters: ['fight_vampire', 'fight_werewolf', 'fight_demonic_zombie', 'fight_dark_warrior', 'fight_black_dragon']
  },
  {
    id: 'master_5', name: 'Duradel', tier: 'extreme', reqHp: 80, points: 25,
    desc: 'Extreme monsters',
    taskRange: [60, 120],
    monsters: ['fight_wyvern', 'fight_demonic_giant', 'fight_abyssal_demon', 'fight_chaos_elemental', 'fight_death_knight']
  },
  {
    id: 'master_boss', name: 'Konar', tier: 'boss', reqHp: 0, points: 35,
    desc: 'Boss tasks (requires unlock)',
    requiresUnlock: true,
    taskRange: [5, 15],
    monsters: ['lava_cave'] // Kan uitgebreid worden met meer bosses
  }
];
```

### 5B. Slayer logica — `src/hooks/useSlayer.js` (NIEUW BESTAND)
Maak een nieuwe hook die alle slayer logica afhandelt:

```js
// src/hooks/useSlayer.js
import { useState, useEffect, useRef } from 'react';

export function useSlayer(skills, inventory, setInventory, activeAction, ACTIONS, SLAYER_MASTERS, startCombat, setScreen) {
  const [slayerTask, setSlayerTask] = useState(null);
  const [slayerStats, setSlayerStats] = useState({
    tasksCompleted: 0,
    totalKills: 0
  });

  const slayerTaskRef = useRef(slayerTask);
  useEffect(() => { slayerTaskRef.current = slayerTask; }, [slayerTask]);

  const maxHp = skills.hitpoints?.level || 10;
  const slayerPoints = inventory.slayer_points || 0;
  const hasAutoComplete = inventory.auto_completer === 1;
  const hasBossMaster = inventory.boss_master_unlock === 1;

  // Genereer een random task van een master
  const getSlayerTask = (master) => {
    if (slayerTask) return; // Al een task actief

    // Boss master check
    if (master.requiresUnlock && !hasBossMaster) return;

    // HP requirement check
    if (maxHp < master.reqHp) return;

    // Random monster selecteren uit master's pool
    const randomMonster = master.monsters[Math.floor(Math.random() * master.monsters.length)];
    const monsterData = ACTIONS[randomMonster];
    if (!monsterData) return;

    // Random kill count binnen master's range
    const [min, max] = master.taskRange;
    const amount = Math.floor(Math.random() * (max - min + 1)) + min;

    setSlayerTask({
      masterId: master.id,
      masterName: master.name,
      monsterId: randomMonster,
      monsterName: monsterData.name,
      amount: amount,
      progress: 0,
      points: master.points
    });
  };

  // Cancel task voor 30 points
  const cancelSlayerTask = () => {
    if (!slayerTask) return;
    if (slayerPoints < 30) return;

    setInventory(prev => ({
      ...prev,
      slayer_points: (prev.slayer_points || 0) - 30
    }));
    setSlayerTask(null);
  };

  // Koop een slayer shop item
  const buySlayerItem = (itemId, cost, isUnlock) => {
    if (slayerPoints < cost) return;

    setInventory(prev => {
      const n = { ...prev };
      n.slayer_points = (n.slayer_points || 0) - cost;

      if (isUnlock) {
        n[itemId] = 1; // Permanent unlock
      } else if (itemId === 'cancel') {
        // Cancel wordt apart afgehandeld
        return prev;
      } else {
        n[itemId] = (n[itemId] || 0) + 1;
      }
      return n;
    });
  };

  // Track kills — roep dit aan wanneer een monster sterft in combat
  const onMonsterKilled = (monsterId) => {
    const task = slayerTaskRef.current;
    if (!task) return;
    if (task.monsterId !== monsterId) return;

    const newProgress = task.progress + 1;

    if (newProgress >= task.amount) {
      // Task voltooid!
      setInventory(prev => ({
        ...prev,
        slayer_points: (prev.slayer_points || 0) + task.points
      }));
      setSlayerStats(prev => ({
        tasksCompleted: prev.tasksCompleted + 1,
        totalKills: prev.totalKills + task.amount
      }));

      // Auto-complete: direct nieuwe task ophalen
      if (hasAutoComplete) {
        const master = SLAYER_MASTERS.find(m => m.id === task.masterId);
        if (master) {
          // Kleine delay voor UX
          setTimeout(() => {
            setSlayerTask(null);
            setTimeout(() => {
              getSlayerTask(master);
              // Na nieuwe task, start automatisch combat met het nieuwe monster
              const newTask = slayerTaskRef.current;
              if (newTask) {
                startCombat(newTask.monsterId);
                setScreen('combat');
              }
            }, 200);
          }, 500);
          return;
        }
      }

      setSlayerTask(null);
    } else {
      setSlayerTask(prev => prev ? { ...prev, progress: newProgress } : null);
    }
  };

  return {
    slayerTask,
    setSlayerTask,
    slayerStats,
    setSlayerStats,
    getSlayerTask,
    cancelSlayerTask,
    buySlayerItem,
    onMonsterKilled,
    maxHp,
    hasBossMaster,
    hasAutoComplete
  };
}
```

### 5C. `src/components/SlayerView.jsx` — Updaten

Vervang de volledige SlayerView met deze versie die boss master en auto-complete ondersteunt:

```jsx
import React, { useState } from 'react';

export default function SlayerView({
  slayerTask, getSlayerTask, cancelSlayerTask, buySlayerItem,
  SLAYER_MASTERS, maxHp, startCombat, setScreen, inventory,
  hasBossMaster, hasAutoComplete, slayerStats
}) {
  const [activeTab, setActiveTab] = useState('assignment');
  const slayerPoints = inventory.slayer_points || 0;

  const SHOP_ITEMS = [
    { id: 'cancel', name: 'Cancel Task', cost: 30, desc: 'Cancel your current slayer task.', type: 'action', icon: '❌' },
    { id: 'auto_completer', name: 'Auto Completer', cost: 1000, desc: 'Automatically gets and starts a new task upon completion. Enables fully idle slayer!', type: 'unlock', icon: '⚙️' },
    { id: 'boss_master_unlock', name: 'Boss Master: Konar', cost: 500, desc: 'Unlocks the Boss Slayer Master. Assigns boss tasks for 35 points each.', type: 'unlock', icon: '👹' },
    { id: 'slayer_supply_crate', name: 'Slayer Supply Crate', cost: 100, desc: 'Contains random supplies.', type: 'item', icon: '📦' },
    { id: 'extended_assignments', name: 'Extended Assignments', cost: 5000, desc: 'Doubles the kill count for all tasks (more XP and loot per task).', type: 'unlock', icon: '📜' },
    { id: 'herblore_bag', name: 'Herblore Bag', cost: 2000, desc: 'Stores all your Herblore supplies to save inventory space.', type: 'unlock', icon: '🌿' },
    { id: 'seed_bag', name: 'Seed Bag', cost: 2000, desc: 'Stores all your Farming seeds to save inventory space.', type: 'unlock', icon: '🌱' }
  ];

  return (
    <div style={{ marginTop: '10px' }}>

      {/* HEADER & PUNTEN */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', backgroundColor: '#111920', borderRadius: '4px', border: '1px solid #2a3b4c', padding: '5px' }}>
          <button
            onClick={() => setActiveTab('assignment')}
            style={{ padding: '8px 15px', backgroundColor: activeTab === 'assignment' ? '#208b76' : 'transparent', color: activeTab === 'assignment' ? 'white' : '#c5d3df', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Assignment
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            style={{ padding: '8px 15px', backgroundColor: activeTab === 'shop' ? '#208b76' : 'transparent', color: activeTab === 'shop' ? 'white' : '#c5d3df', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Rewards Shop
          </button>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {hasAutoComplete && (
            <span style={{ color: '#2ecc71', fontSize: '12px', backgroundColor: '#1a2b25', padding: '5px 10px', borderRadius: '4px', border: '1px solid #2ecc71' }}>
              ⚙️ Auto-Complete ON
            </span>
          )}
          <span style={{ color: '#f1c40f', fontWeight: 'bold', backgroundColor: '#152029', padding: '8px 15px', borderRadius: '4px', border: '1px solid #2a3b4c', fontSize: '16px' }}>
            ⭐ {slayerPoints} pts
          </span>
        </div>
      </div>

      {/* --- TAB: ASSIGNMENT --- */}
      {activeTab === 'assignment' && (
        <>
          {/* HUIDIGE TAAK */}
          {slayerTask ? (
            <div className="card" style={{ backgroundColor: '#1a2b25', borderColor: '#208b76', textAlign: 'center', padding: '25px' }}>
              <h4 style={{ color: '#4affd4', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Task</h4>
              <p style={{ color: 'white', fontSize: '20px', margin: '0 0 5px 0' }}>
                Defeat <strong>{slayerTask.amount - slayerTask.progress}</strong> more <strong>{slayerTask.monsterName}s</strong>
              </p>
              <p style={{ fontSize: '12px', color: '#7b95a6', margin: '0 0 15px 0' }}>
                Assigned by: {slayerTask.masterName} | Reward: {slayerTask.points} pts
              </p>
              <div style={{ marginBottom: '10px', backgroundColor: '#111920', height: '15px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(slayerTask.progress / slayerTask.amount) * 100}%`, height: '100%', backgroundColor: '#2ecc71', transition: 'width 0.3s' }}></div>
              </div>
              <p style={{ fontSize: '13px', color: '#7b95a6', marginBottom: '20px' }}>
                Progress: {slayerTask.progress} / {slayerTask.amount}
              </p>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  className="btn-action"
                  style={{ padding: '10px 30px', fontSize: '16px' }}
                  onClick={() => { startCombat(slayerTask.monsterId); setScreen('combat'); }}
                >
                  ⚔️ Fight {slayerTask.monsterName}
                </button>
                <button
                  className="btn-stop"
                  style={{ padding: '10px 20px', fontSize: '14px', opacity: slayerPoints >= 30 ? 1 : 0.5 }}
                  onClick={cancelSlayerTask}
                  disabled={slayerPoints < 30}
                  title={slayerPoints < 30 ? 'Need 30 slayer points' : 'Cancel task for 30 pts'}
                >
                  ❌ Cancel (30 pts)
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ backgroundColor: '#152029', textAlign: 'center', color: '#7b95a6', padding: '30px' }}>
              <p style={{ margin: '0 0 5px 0' }}>You do not have an active Slayer task.</p>
              <p style={{ margin: 0 }}>Visit a Slayer Master below to get a new assignment!</p>
            </div>
          )}

          {/* STATS */}
          <div style={{ display: 'flex', gap: '10px', margin: '15px 0' }}>
            <div className="card" style={{ flex: 1, textAlign: 'center', padding: '10px', backgroundColor: '#111920' }}>
              <div style={{ color: '#4affd4', fontSize: '20px', fontWeight: 'bold' }}>{slayerStats?.tasksCompleted || 0}</div>
              <div style={{ color: '#7b95a6', fontSize: '12px' }}>Tasks Completed</div>
            </div>
            <div className="card" style={{ flex: 1, textAlign: 'center', padding: '10px', backgroundColor: '#111920' }}>
              <div style={{ color: '#f1c40f', fontSize: '20px', fontWeight: 'bold' }}>{slayerPoints}</div>
              <div style={{ color: '#7b95a6', fontSize: '12px' }}>Slayer Points</div>
            </div>
          </div>

          {/* SLAYER MASTERS */}
          <h3 style={{ marginTop: '20px', marginBottom: '15px', borderBottom: '1px solid #2a3b4c', paddingBottom: '10px', color: 'var(--text-primary)' }}>Slayer Masters</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {SLAYER_MASTERS.map(master => {
              const canUse = maxHp >= master.reqHp;
              const isLocked = master.requiresUnlock && !hasBossMaster;

              return (
                <div key={master.id} className="card" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  opacity: (canUse && !isLocked) ? 1 : 0.6,
                  backgroundColor: isLocked ? '#1a1520' : '#202a33',
                  border: isLocked ? '1px solid #8b5cf6' : 'none'
                }}>
                  <div>
                    <strong style={{ fontSize: '16px', color: (canUse && !isLocked) ? 'white' : '#7b95a6' }}>
                      {master.name} {isLocked && '🔒'}
                    </strong>
                    <div style={{ fontSize: '12px', color: '#7b95a6', marginTop: '4px' }}>
                      <span style={{ color: canUse ? '#2ecc71' : '#e74c3c' }}>Requires HP: {master.reqHp}</span> |
                      <span style={{ color: '#f1c40f', marginLeft: '5px' }}>Reward: {master.points} pts</span> |
                      <span style={{ color: '#4affd4', marginLeft: '5px' }}>Tasks: {master.taskRange[0]}-{master.taskRange[1]} kills</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#556b7a', marginTop: '4px' }}>
                      {isLocked ? 'Purchase "Boss Master: Konar" from the Rewards Shop to unlock' : master.desc}
                    </div>
                  </div>

                  <button
                    className={(slayerTask || !canUse || isLocked) ? "btn-stop" : "btn-action"}
                    style={(slayerTask || !canUse || isLocked) ? { backgroundColor: '#2a3b4c', cursor: 'not-allowed' } : {}}
                    onClick={() => getSlayerTask(master)}
                    disabled={slayerTask !== null || !canUse || isLocked}
                  >
                    {slayerTask ? 'Task Active' : isLocked ? 'Locked' : !canUse ? 'HP too low' : 'Get Task'}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* --- TAB: REWARDS SHOP --- */}
      {activeTab === 'shop' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {SHOP_ITEMS.map(item => {
            const canAfford = slayerPoints >= item.cost;
            const isOwned = item.type === 'unlock' && inventory[item.id] === 1;

            return (
              <div key={item.id} className="card" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                backgroundColor: isOwned ? '#1a2b25' : '#202a33',
                border: isOwned ? '1px solid #2ecc71' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ fontSize: '24px', backgroundColor: '#111920', padding: '10px', borderRadius: '8px' }}>
                    {item.icon}
                  </div>
                  <div>
                    <strong style={{ color: 'white', fontSize: '16px' }}>{item.name}</strong>
                    <div style={{ fontSize: '12px', color: '#4affd4', marginTop: '4px' }}>{item.desc}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                  <span style={{ color: canAfford && !isOwned ? '#f1c40f' : '#e74c3c', fontWeight: 'bold' }}>
                    {item.cost} pts
                  </span>

                  {item.id === 'cancel' ? (
                    <button
                      className="btn-stop"
                      onClick={cancelSlayerTask}
                      disabled={!slayerTask || !canAfford}
                      style={{ opacity: !slayerTask || !canAfford ? 0.5 : 1, cursor: !slayerTask || !canAfford ? 'not-allowed' : 'pointer' }}
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      className={isOwned ? "btn-stop" : "btn-action"}
                      onClick={() => buySlayerItem(item.id, item.cost, item.type === 'unlock')}
                      disabled={!canAfford || isOwned}
                      style={{
                        backgroundColor: isOwned ? '#2a3b4c' : !canAfford ? '#34495e' : '',
                        color: isOwned || !canAfford ? '#7b95a6' : 'white',
                        cursor: isOwned || !canAfford ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isOwned ? 'Owned' : 'Buy'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

### 5D. Slayer kill tracking — In `src/hooks/useCombat.js`
De `onKill` callback in `seedCombat` moet slayer progress updaten. Voeg een `onSlayerKill` parameter toe aan `useCombat`:

```js
// In de seedCombat callbacks:
onKill: (killed) => {
  if (killed.id !== 'player') {
    // Award loot
    const data = ACTIONS[actionId];
    if (data && data.reward && !data.isFightCave) {
      setInventory(prev => {
        const n = { ...prev };
        Object.entries(data.reward).forEach(([k, v]) => {
          n[k] = (n[k] || 0) + v;
        });
        return n;
      });
    }

    // Slayer XP (als het een slayer task monster is)
    // De actionId (bv 'fight_zombie') wordt doorgegeven aan onSlayerKill
    if (onSlayerKill) onSlayerKill(actionId);
  }
  if (appCallbacks?.onKill) appCallbacks.onKill(killed);
},
```

> `onSlayerKill` is de `onMonsterKilled` functie van `useSlayer`. Deze wordt als parameter meegegeven aan `useCombat` vanuit App.jsx (zie stap 6).

---

## STAP 6: INTEGRATIE IN App.jsx

Dit is de belangrijkste stap — hier verbinden we alles.

### 6A. Imports toevoegen aan `src/App.jsx`
```js
// Bovenaan bij imports:
import ThievingView from './components/ThievingView';
import { useSlayer } from './hooks/useSlayer';
import { ARMOR, SKILL_LIST, WEAPONS, ACTIONS, AMMO, ITEMS, SLAYER_MASTERS, PRAYER_BOOK, ITEM_IMAGES, THIEVING_TARGETS, POTION_EFFECTS } from './data/gameData';
```

### 6B. Slayer Hook initialiseren
Na de shop hook, voeg toe:
```js
  // Slayer system
  const {
    slayerTask, setSlayerTask, slayerStats, setSlayerStats,
    getSlayerTask, cancelSlayerTask, buySlayerItem, onMonsterKilled,
    maxHp: slayerMaxHp, hasBossMaster, hasAutoComplete
  } = useSlayer(skills, inventory, setInventory, activeAction, ACTIONS, SLAYER_MASTERS, startCombat, setScreen);
```

> **Let op:** `maxHp` bestaat al. De slayer hook geeft zijn eigen `maxHp` terug met alias `slayerMaxHp`, maar je kunt ook gewoon de bestaande `maxHp` const gebruiken en die doorgeven.

### 6C. useCombat aanpassen
Pas de `useCombat` aanroep aan zodat `onMonsterKilled` beschikbaar is:

In `useCombat.js`, voeg `onSlayerKill` als **laatste parameter** toe aan de functie:
```js
export function useCombat(
  activeAction, ACTIONS, skills, playerStats,
  combatStyle, setInventory, addXp, triggerXpDrop, stopAction, getCurrentWeapon,
  onSlayerKill  // <-- NIEUW
) {
```

En in `App.jsx`, pas de useCombat aanroep aan:
```js
  const combat = useCombat(
    activeAction, ACTIONS, skills, { maxHp, maxPrayer },
    combatStyle, setInventory, addXp, triggerXpDrop, stopAction, getCurrentWeapon,
    onMonsterKilled  // <-- NIEUW: van useSlayer
  );
```

### 6D. Active Potions State
Voeg toe aan App.jsx state:
```js
  const [activePotions, setActivePotions] = useState({}); // { combat_potion: { expiresAt: timestamp }, ... }
```

> **Potion timer systeem:**
> Wanneer een speler een potion drinkt, sla de expiry op. Gebruik een `useEffect` met een interval om verlopen potions te verwijderen.
> De daadwerkelijke stat boosts worden berekend in de combat engine door de `allies` stats aan te passen wanneer een potion actief is.
> Dit is een **complexere feature** die je het beste in een aparte `usePotions.js` hook kunt bouwen. De basis werking:

```js
// Vereenvoudigd concept:
const drinkCombatPotion = (potionId) => {
  const effect = POTION_EFFECTS[potionId];
  if (!effect) return;
  if ((inventory[potionId] || 0) <= 0) return;

  // Potion verbruiken
  setInventory(prev => ({ ...prev, [potionId]: prev[potionId] - 1 }));

  // Effect activeren
  setActivePotions(prev => ({
    ...prev,
    [potionId]: { expiresAt: Date.now() + (effect.duration * 1000), ...effect }
  }));
};

// In een useEffect: verwijder verlopen potions
useEffect(() => {
  const interval = setInterval(() => {
    setActivePotions(prev => {
      const now = Date.now();
      const next = {};
      Object.entries(prev).forEach(([k, v]) => {
        if (v.expiresAt > now) next[k] = v;
      });
      return next;
    });
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

### 6E. SlayerView renderen in App.jsx
Voeg toe in de render:

```jsx
{screen === 'slayer' && (
  <div className="card" style={{ padding: '20px', width: '100%' }}>
    <SlayerView
      slayerTask={slayerTask}
      getSlayerTask={getSlayerTask}
      cancelSlayerTask={cancelSlayerTask}
      buySlayerItem={buySlayerItem}
      SLAYER_MASTERS={SLAYER_MASTERS}
      maxHp={maxHp}
      startCombat={startCombat}
      setScreen={setScreen}
      inventory={inventory}
      hasBossMaster={hasBossMaster}
      hasAutoComplete={hasAutoComplete}
      slayerStats={slayerStats}
    />
  </div>
)}
```

### 6F. ThievingView renderen
Zoals beschreven in Stap 2E.

### 6G. Save/Load aanpassen
In `useSaveLoad.js`, zorg dat de volgende states ook opgeslagen en geladen worden:
- `slayerTask`
- `slayerStats`
- `activePotions` (optioneel, potions verlopen sowieso)

Voeg aan de save functie toe:
```js
localStorage.setItem('slayerTask', JSON.stringify(slayerTask));
localStorage.setItem('slayerStats', JSON.stringify(slayerStats));
```

En aan de load functie:
```js
const savedSlayerTask = localStorage.getItem('slayerTask');
if (savedSlayerTask) setSlayerTask(JSON.parse(savedSlayerTask));

const savedSlayerStats = localStorage.getItem('slayerStats');
if (savedSlayerStats) setSlayerStats(JSON.parse(savedSlayerStats));
```

> **Belangrijk:** De `setSlayerTask` en `setSlayerStats` moeten als parameters aan `useSaveLoad` worden doorgegeven.

---

## 📝 SAMENVATTING CHECKLIST

### Nieuwe bestanden:
- [ ] `src/hooks/useSlayer.js`
- [ ] `src/components/ThievingView.jsx`

### Aangepaste bestanden:
- [ ] `src/data/gameData.js` — SKILL_LIST, ITEMS, ACTIONS, SLAYER_MASTERS, THIEVING_TARGETS (nieuw), POTION_EFFECTS (nieuw)
- [ ] `src/components/Sidebar.jsx` — enchanting verwijderen
- [ ] `src/components/SkillingView.jsx` — agility banner, farming tabs, herblore tabs
- [ ] `src/components/SlayerView.jsx` — volledige update
- [ ] `src/hooks/useCombatEngine.js` — dodge mechanic
- [ ] `src/hooks/useCombat.js` — dodgeChance, onSlayerKill, potion support
- [ ] `src/App.jsx` — imports, hooks, renders, state

### Nieuwe data exports:
- [ ] `THIEVING_TARGETS` (array)
- [ ] `POTION_EFFECTS` (object)

### Nieuwe items in ITEMS:
- [ ] Agility: `mark_of_grace`, `agility_ticket`
- [ ] Thieving: `stolen_coins`, `gold_ring`, `silver_necklace`, `gem_bag`, `lockpick`, `treasury_note`
- [ ] Farming: seeds (`tomato_seed`, `cabbage_seed`, etc.), produce (`potato`, `tomato`, etc.), grimy herbs
- [ ] Herblore: potions (`combat_potion`, `super_combat_potion`, etc.), `dragon_scale`

### Features per skill:
- [ ] **Enchanting**: volledig verwijderd
- [ ] **Agility**: 9 courses, dodge chance display, dodge in combat engine
- [ ] **Thieving**: 10 targets, stun mechanic, success rate based on thieving+agility level
- [ ] **Farming**: 10 crops (6 produce + 4 herbs), 5x output, tabs (produce/herbs)
- [ ] **Herblore**: 4 cleaning actions, 7 brewing actions, 3 super potions, tabs (cleaning/brewing/super)
- [ ] **Slayer**: 6 masters (incl boss), task system, auto-complete, cancel (30pts), shop, kill tracking

---

## ⚠️ VOLGORDE VAN IMPLEMENTATIE

**Doe het in deze exacte volgorde om compilatiefouten te voorkomen:**

1. **Stap 0** (Enchanting verwijderen) — Onafhankelijk
2. **Stap 1** (Agility) — Voegt dodge toe aan combat, geen dependencies
3. **Stap 3** (Farming) — Onafhankelijk, produceert items voor Herblore
4. **Stap 4** (Herblore) — Vereist Farming items (grimy herbs)
5. **Stap 2** (Thieving) — Onafhankelijk maar gebruikt agility level
6. **Stap 5 + 6** (Slayer + Integratie) — Laatste stap, verbindt alles

**Na elke stap:** Start de dev server (`npm run dev`) en controleer op fouten.

---

## 🔄 MONSTER DROPS UPDATES SAMENVATTING

Pas deze monster rewards aan in het `ACTIONS` object:

| Monster | Toevoegen aan reward |
|---------|---------------------|
| `fight_goblin` | `tomato_seed: 1` |
| `fight_druid` | `ranarr_seed: 1` (vervang `herb_seed: 1`) |
| `fight_orc` | `cabbage_seed: 1, strawberry_seed: 1` |
| `fight_giant` | `sweetcorn_seed: 1, snape_grass_seed: 1` |
| `fight_green_dragon` | `sweetcorn_seed: 1, dragon_scale: 1` |
| `fight_red_dragon` | `snapdragon_seed: 1, dragon_scale: 1` |
| `fight_black_dragon` | `torstol_seed: 1, dragon_scale: 1` |

---

*Einde instructies. Begin bij Stap 0 en werk je weg naar Stap 6.*
