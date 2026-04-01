# TOOLBOX SYSTEM — Implementation Instructions

## Overview

When a player clicks "Claim Now" on the tool banner in SkillingView, the banner is **replaced** by a permanent **Toolbox Panel**. This panel contains:

1. **Left side:** An upgradeable toolbox with slots that store tools for that skill
2. **Right side:** Two rare drop previews — the bronze tool and the skilling pet — each showing `<0.01%` drop rate

---

## 1. New State: `toolboxes`

### File: `src/App.jsx`

**Add new state** next to the existing `claimedTools` state (line ~70):

```js
const [toolboxes, setToolboxes] = useState({});
```

The `toolboxes` state is an object keyed by skill name. Each entry:

```js
toolboxes = {
  woodcutting: {
    level: 0,         // 0-4, upgrade level
    slots: [null]     // array of tool item IDs or null (empty slot)
  },
  mining: {
    level: 0,
    slots: [null]
  }
  // ... etc, created per skill on first claim
}
```

### Toolbox Level Definitions (use as a constant or inline):

```js
const TOOLBOX_LEVELS = [
  { maxTierIndex: 1, slotCount: 1, label: 'Bronze – Iron' },      // level 0 (default after claim)
  { maxTierIndex: 2, slotCount: 1, label: 'Bronze – Steel' },     // level 1
  { maxTierIndex: 3, slotCount: 2, label: 'Bronze – Alloy' },     // level 2
  { maxTierIndex: 4, slotCount: 3, label: 'Bronze – Apex' },      // level 3
  { maxTierIndex: 5, slotCount: 4, label: 'Bronze – Nova' },      // level 4 (max)
];
```

Where `maxTierIndex` maps to `TOOL_SKILLS[skill].tiers[index]`:
- 0 = bronze, 1 = iron, 2 = steel, 3 = alloy, 4 = apex, 5 = nova

So at level 0, tools with tier index 0 (bronze) and 1 (iron) can be stored.

---

## 2. Modify `claimToolCallback`

### File: `src/App.jsx` (line ~98)

Replace the current `claimToolCallback` with:

```js
const claimToolCallback = (skill) => {
  if (!TOOL_SKILLS[skill]) return;

  const ironToolTier = 1; // iron = index 1
  const toolId = TOOL_SKILLS[skill].tiers[ironToolTier];

  // Add iron tool to inventory
  setInventory(prev => ({
    ...prev,
    [toolId]: (prev[toolId] || 0) + 1
  }));

  // Mark as claimed
  setClaimedTools(prev => ({
    ...prev,
    [skill]: true
  }));

  // Initialize toolbox for this skill with the iron tool auto-stored
  setToolboxes(prev => ({
    ...prev,
    [skill]: {
      level: 0,
      slots: [toolId]  // Iron tool auto-stored in first slot
    }
  }));
};
```

---

## 3. New Callback: `upgradeToolbox`

### File: `src/App.jsx` (add after `claimToolCallback`)

```js
const upgradeToolbox = (skill) => {
  const box = toolboxes[skill];
  if (!box || box.level >= 4) return; // Already max level

  const cost = 1; // 1 coin per upgrade (for now)
  if ((inventory.coins || 0) < cost) return; // Not enough coins

  setInventory(prev => ({
    ...prev,
    coins: (prev.coins || 0) - cost
  }));

  const TOOLBOX_LEVELS = [
    { slotCount: 1 },  // level 0
    { slotCount: 1 },  // level 1
    { slotCount: 2 },  // level 2
    { slotCount: 3 },  // level 3
    { slotCount: 4 },  // level 4
  ];

  const newLevel = box.level + 1;
  const newSlotCount = TOOLBOX_LEVELS[newLevel].slotCount;

  setToolboxes(prev => {
    const currentSlots = [...(prev[skill]?.slots || [])];
    // Expand slots array if needed
    while (currentSlots.length < newSlotCount) {
      currentSlots.push(null);
    }
    return {
      ...prev,
      [skill]: {
        level: newLevel,
        slots: currentSlots
      }
    };
  });
};
```

---

## 4. New Callback: `storeToolInBox`

### File: `src/App.jsx` (add after `upgradeToolbox`)

This stores a tool from inventory into a toolbox slot. Only the correct skill's tools can go in.

```js
const storeToolInBox = (skill, slotIndex, toolId) => {
  if (!TOOL_SKILLS[skill]) return;
  const box = toolboxes[skill];
  if (!box) return;

  // Check tool belongs to this skill
  const skillTiers = TOOL_SKILLS[skill].tiers;
  if (!skillTiers.includes(toolId)) return;

  // Check tool tier is allowed at current level
  const TOOLBOX_LEVELS = [
    { maxTierIndex: 1 }, // level 0: bronze-iron
    { maxTierIndex: 2 }, // level 1: bronze-steel
    { maxTierIndex: 3 }, // level 2: bronze-alloy
    { maxTierIndex: 4 }, // level 3: bronze-apex
    { maxTierIndex: 5 }, // level 4: bronze-nova
  ];
  const tierIndex = skillTiers.indexOf(toolId);
  if (tierIndex > TOOLBOX_LEVELS[box.level].maxTierIndex) return;

  // Check slot is valid
  if (slotIndex < 0 || slotIndex >= box.slots.length) return;

  // Check player has the tool in inventory
  if ((inventory[toolId] || 0) < 1) return;

  // If slot already has a tool, return it to inventory first
  const existingTool = box.slots[slotIndex];

  setInventory(prev => {
    const n = { ...prev };
    n[toolId] = (n[toolId] || 0) - 1; // Remove new tool from inventory
    if (existingTool) {
      n[existingTool] = (n[existingTool] || 0) + 1; // Return old tool to inventory
    }
    return n;
  });

  setToolboxes(prev => {
    const newSlots = [...(prev[skill]?.slots || [])];
    newSlots[slotIndex] = toolId;
    return {
      ...prev,
      [skill]: {
        ...prev[skill],
        slots: newSlots
      }
    };
  });
};
```

---

## 5. Pass New Props to SkillingView

### File: `src/App.jsx` (line ~418, the SkillingView JSX)

Add these props to the `<SkillingView>` component:

```jsx
<SkillingView
  screen={screen} ACTIONS={ACTIONS} skills={skills}
  activeAction={activeAction} startAction={startAction} startCombat={startCombat}
  stopAction={stopAction} getItemCount={getItemCount}
  quickPrayers={quickPrayers} setQuickPrayers={setQuickPrayers}
  progress={progress} getRequiredXp={getRequiredXp}
  claimToolCallback={claimToolCallback} claimedTools={claimedTools}
  toolboxes={toolboxes} upgradeToolbox={upgradeToolbox} storeToolInBox={storeToolInBox}
  inventory={inventory}
  getActualActionTime={...}
/>
```

New props to add: `toolboxes`, `upgradeToolbox`, `storeToolInBox`, `inventory`

---

## 6. Update SkillingView Component

### File: `src/components/SkillingView.jsx`

### 6a. Update function signature (line ~5)

Add the new props:

```jsx
export default function SkillingView({
  screen, ACTIONS, skills, activeAction, startAction, startCombat, stopAction, getItemCount,
  quickPrayers, setQuickPrayers, getActualActionTime, progress, getRequiredXp,
  claimToolCallback, claimedTools = {},
  toolboxes = {}, upgradeToolbox, storeToolInBox, inventory = {}
}) {
```

### 6b. Add TOOLBOX_LEVELS constant (inside the component, before the return)

```js
const TOOLBOX_LEVELS = [
  { maxTierIndex: 1, slotCount: 1, label: 'Bronze – Iron',  upgradeCost: 1 },
  { maxTierIndex: 2, slotCount: 1, label: 'Bronze – Steel', upgradeCost: 1 },
  { maxTierIndex: 3, slotCount: 2, label: 'Bronze – Alloy', upgradeCost: 1 },
  { maxTierIndex: 4, slotCount: 3, label: 'Bronze – Apex',  upgradeCost: 1 },
  { maxTierIndex: 5, slotCount: 4, label: 'Bronze – Nova',  upgradeCost: null }, // max, no further upgrade
];
```

### 6c. Add imports at top of file

Add to the existing import from `gameData.js`:

```js
import { PRAYER_BOOK, ITEM_IMAGES, TOOL_SKILLS, ITEMS, PETS } from '../data/gameData';
```

### 6d. Replace the CLAIM TOOL BANNER section

Find this block (approximately line 230-250 in SkillingView.jsx):

```jsx
{/* CLAIM TOOL BANNER */}
{TOOL_SKILLS[screen] && !claimedTools[screen] && (
  <div style={{ backgroundColor: '#1a3a2d', border: '2px solid #4affd4', ... }}>
    ...Claim Now button...
  </div>
)}
```

Replace the **entire** claim tool banner block with the following. This shows the claim banner if NOT claimed, and the toolbox panel if claimed:

```jsx
{/* TOOLBOX PANEL (replaces claim banner after claiming) */}
{TOOL_SKILLS[screen] && (
  (() => {
    const skillData = TOOL_SKILLS[screen];
    const box = toolboxes[screen];
    const isClaimed = claimedTools[screen];

    // UNCLAIMED: Show claim banner
    if (!isClaimed) {
      return (
        <div style={{ backgroundColor: '#1a3a2d', border: '2px solid #4affd4', borderRadius: '6px', padding: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: '#4affd4', margin: '0 0 5px 0' }}>🎁 Claim Your {skillData.name}</h3>
            <p style={{ color: '#c5d3df', margin: 0, fontSize: '13px' }}>
              Get a free Iron {skillData.name} to boost your {screen} speed by 4%!
            </p>
          </div>
          <button
            onClick={() => claimToolCallback && claimToolCallback(screen)}
            style={{
              padding: '10px 25px',
              backgroundColor: '#4affd4',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              marginLeft: '15px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2dd9b8'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#4affd4'}
          >
            Claim Now
          </button>
        </div>
      );
    }

    // CLAIMED: Show toolbox panel
    const level = box?.level || 0;
    const levelData = TOOLBOX_LEVELS[level];
    const slots = box?.slots || [null];
    const isMaxLevel = level >= 4;
    const upgradeCost = levelData.upgradeCost;
    const canAffordUpgrade = !isMaxLevel && (inventory.coins || 0) >= (upgradeCost || 0);
    const bronzeToolId = skillData.tiers[0]; // bronze tool for drop preview
    const petId = `${screen}_pet`;
    const petData = PETS[petId];

    return (
      <div style={{
        backgroundColor: '#111920',
        border: '1px solid #2a3b4c',
        borderRadius: '6px',
        padding: '15px',
        marginBottom: '20px',
        display: 'flex',
        gap: '20px',
        alignItems: 'stretch'
      }}>

        {/* === LEFT SIDE: TOOLBOX === */}
        <div style={{ flex: 1 }}>
          {/* Toolbox Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <h3 style={{ color: '#4affd4', margin: '0 0 3px 0', fontSize: '15px' }}>
                🧰 {screen.charAt(0).toUpperCase() + screen.slice(1)} Toolbox
                <span style={{ color: '#7b95a6', fontSize: '12px', fontWeight: 'normal', marginLeft: '8px' }}>
                  Lv. {level}{isMaxLevel ? ' (MAX)' : ''}
                </span>
              </h3>
              <p style={{ color: '#7b95a6', margin: 0, fontSize: '11px' }}>
                Accepts: {levelData.label}
              </p>
            </div>

            {/* Upgrade Button */}
            {!isMaxLevel && (
              <button
                onClick={() => upgradeToolbox && upgradeToolbox(screen)}
                disabled={!canAffordUpgrade}
                style={{
                  padding: '6px 14px',
                  backgroundColor: canAffordUpgrade ? '#f1c40f' : '#2a3b4c',
                  color: canAffordUpgrade ? '#000' : '#556b7a',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: canAffordUpgrade ? 'pointer' : 'default',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  whiteSpace: 'nowrap'
                }}
              >
                ⬆ Upgrade ({upgradeCost} 🪙)
              </button>
            )}
          </div>

          {/* Toolbox Slots */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {slots.map((storedToolId, idx) => {
              const toolItem = storedToolId ? ITEMS[storedToolId] : null;
              const toolImg = storedToolId ? ITEM_IMAGES[storedToolId] : null;

              return (
                <div
                  key={idx}
                  style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: '#0b1014',
                    border: storedToolId ? '1px solid #208b76' : '1px dashed #2a3b4c',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    cursor: 'default'
                  }}
                  title={toolItem ? `${toolItem.name}\n+${((Object.values(toolItem.speedBoosts || {})[0] || 0) * 100).toFixed(0)}% speed` : 'Empty Slot'}
                >
                  {storedToolId ? (
                    <>
                      {toolImg ? (
                        <img src={toolImg} alt={toolItem?.name} style={{ maxWidth: '44px', maxHeight: '44px', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '24px' }}>{skillData.icon}</span>
                      )}
                      <span style={{ fontSize: '9px', color: '#4affd4', fontWeight: 'bold', marginTop: '2px' }}>
                        {toolItem?.name?.split(' ')[0]}
                      </span>
                    </>
                  ) : (
                    <span style={{ color: '#556b7a', fontSize: '20px' }}>+</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tools in inventory that can be stored */}
          {(() => {
            // Find tools in inventory that belong to this skill and are allowed at current level
            const allowedTierMax = levelData.maxTierIndex;
            const availableTools = skillData.tiers
              .filter((tid, tierIdx) => tierIdx <= allowedTierMax && (inventory[tid] || 0) > 0)
              .map(tid => ({ id: tid, item: ITEMS[tid], count: inventory[tid] || 0 }));

            // Find first empty slot index
            const emptySlotIdx = slots.findIndex(s => s === null);

            if (availableTools.length === 0 || emptySlotIdx === -1) return null;

            return (
              <div style={{ marginTop: '8px' }}>
                <p style={{ color: '#7b95a6', fontSize: '11px', margin: '0 0 4px 0' }}>Store from inventory:</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {availableTools.map(t => (
                    <button
                      key={t.id}
                      onClick={() => storeToolInBox && storeToolInBox(screen, emptySlotIdx, t.id)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#1a2b25',
                        border: '1px solid #208b76',
                        borderRadius: '4px',
                        color: '#4affd4',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {ITEM_IMAGES[t.id] ? (
                        <img src={ITEM_IMAGES[t.id]} alt={t.item?.name} style={{ width: '16px', height: '16px' }} />
                      ) : (
                        <span>{skillData.icon}</span>
                      )}
                      {t.item?.name} (x{t.count})
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* === RIGHT SIDE: RARE DROPS PREVIEW === */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          borderLeft: '1px solid #2a3b4c',
          paddingLeft: '20px',
          minWidth: '80px'
        }}>
          <p style={{ color: '#7b95a6', fontSize: '10px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rare Drops</p>

          {/* Bronze Tool Drop */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            {ITEM_IMAGES[bronzeToolId] ? (
              <img src={ITEM_IMAGES[bronzeToolId]} alt="Bronze Tool" style={{ width: '36px', height: '36px', objectFit: 'contain', opacity: 0.8 }} />
            ) : (
              <span style={{ fontSize: '28px', opacity: 0.8 }}>{skillData.icon}</span>
            )}
            <span style={{ fontSize: '10px', color: '#e74c3c', fontWeight: 'bold' }}>&lt;0.01%</span>
          </div>

          {/* Skilling Pet Drop */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            {ITEM_IMAGES[petId] ? (
              <img src={ITEM_IMAGES[petId]} alt={petData?.name || 'Pet'} style={{ width: '36px', height: '36px', objectFit: 'contain', opacity: 0.8 }} />
            ) : (
              <span style={{ fontSize: '28px', opacity: 0.8 }}>🐾</span>
            )}
            <span style={{ fontSize: '10px', color: '#e74c3c', fontWeight: 'bold' }}>&lt;0.01%</span>
          </div>
        </div>

      </div>
    );
  })()
)}
```

---

## 7. Pet Drop Rate Constant

### File: `src/data/gameData.js`

Add below `TOOL_DROP_HOURS`:

```js
export const PET_DROP_HOURS = 600; // 1 skilling pet per 600 hours of skilling
```

---

## 8. Pet Drop Logic in useSkilling

### File: `src/hooks/useSkilling.js`

### 8a. Update import (line 3):

```js
import { PETS, ITEMS, TOOL_SKILLS, TOOL_DROP_HOURS, PET_DROP_HOURS } from '../data/gameData';
```

### 8b. Add pet drop logic after the tool drop block (after line ~188)

Find the existing tool drop block:
```js
// === TOOL DROP: Bronze tool drops (1 per 20 hours of skilling) ===
if (TOOL_SKILLS[data.skill]) {
  ...
}
```

Add this **immediately after** the closing `}` of the tool drop block:

```js
// === PET DROP: Skilling pet drops (1 per 600 hours of skilling) ===
if (data.skill && data.skill !== 'combat' && data.skill !== 'prayer' && data.skill !== 'infusion') {
  const baseTimeSeconds = (data.baseTime || 1800) / 1000;
  const petDropChance = baseTimeSeconds / (PET_DROP_HOURS * 3600); // 600 hours = 2,160,000 seconds
  if (Math.random() < petDropChance) {
    const skillingPetId = `${data.skill}_pet`;
    if (PETS[skillingPetId]) {
      n[skillingPetId] = (n[skillingPetId] || 0) + 1;
      if (triggerPetNotification) {
        triggerPetNotification(skillingPetId, PETS[skillingPetId].name, `You found the ${PETS[skillingPetId].name} pet!`);
      }
    }
  }
}
```

---

## 9. Pet Drop in Offline Progression

### File: `src/utils/offlineProgress.js`

### 9a. Add `PET_DROP_HOURS` to the function signature

Find the function parameters and add `PET_DROP_HOURS` next to `TOOL_DROP_HOURS`.

### 9b. Add `PET_DROP_HOURS` import/pass-through

In `src/App.jsx`, update the import:
```js
import { ..., TOOL_DROP_HOURS, PET_DROP_HOURS } from './data/gameData';
```

And pass it to `useSaveLoad` and `calculateOfflineProgress`.

In `src/hooks/useSaveLoad.js`, add `PET_DROP_HOURS` to the signature and pass it to `calculateOfflineProgress`.

### 9c. Add pet drop logic in offline simulation

In `offlineProgress.js`, inside the simulation loop, add after the tool drop block:

```js
// Pet drop (same logic as live)
if (actionData.skill && actionData.skill !== 'combat' && actionData.skill !== 'prayer' && actionData.skill !== 'infusion') {
  const baseTimeSeconds = (actionData.baseTime || 1800) / 1000;
  const petDropChance = baseTimeSeconds / ((PET_DROP_HOURS || 600) * 3600);
  if (Math.random() < petDropChance) {
    const skillingPetId = `${actionData.skill}_pet`;
    simulatedInventory[skillingPetId] = (simulatedInventory[skillingPetId] || 0) + 1;
  }
}
```

---

## 10. Save/Load `toolboxes`

### File: `src/hooks/useSaveLoad.js`

### 10a. Add `toolboxes` and `setToolboxes` to function signature

After `claimedTools, setClaimedTools`, add `toolboxes, setToolboxes`.

### 10b. Load toolboxes

After `if (parsed.claimedTools && setClaimedTools) setClaimedTools(parsed.claimedTools);` add:

```js
if (parsed.toolboxes && setToolboxes) setToolboxes(parsed.toolboxes);
```

### 10c. Save toolboxes

In the auto-save `gameState` object, add:

```js
toolboxes,
```

(right after `claimedTools,`)

### 10d. Add to dependency array

In the `useEffect` dependency array for auto-save, add `toolboxes` next to `claimedTools`.

### File: `src/App.jsx`

Update the `useSaveLoad(...)` call to pass `toolboxes, setToolboxes` after `claimedTools, setClaimedTools`.

---

## 11. Summary of All File Changes

| File | Changes |
|------|---------|
| `src/data/gameData.js` | Add `PET_DROP_HOURS = 600` constant |
| `src/App.jsx` | Add `toolboxes`/`setToolboxes` state; add `upgradeToolbox` callback; add `storeToolInBox` callback; modify `claimToolCallback` to init toolbox; pass new props to SkillingView; pass toolboxes to useSaveLoad; import PET_DROP_HOURS |
| `src/components/SkillingView.jsx` | Add new props to signature; add `ITEMS`, `PETS` to imports; replace claim banner with toolbox panel + rare drops UI; add `TOOLBOX_LEVELS` constant |
| `src/hooks/useSkilling.js` | Import `PET_DROP_HOURS`; add pet drop logic after tool drop block |
| `src/hooks/useSaveLoad.js` | Add `toolboxes`/`setToolboxes` to signature; add load/save/dependency for toolboxes; add `PET_DROP_HOURS` pass-through |
| `src/utils/offlineProgress.js` | Add `PET_DROP_HOURS` to signature; add pet drop simulation in offline loop |

---

## 12. Key Data References

### TOOL_SKILLS structure (from gameData.js):
```js
TOOL_SKILLS = {
  woodcutting: { icon: '🪓', name: 'Woodcutting Axe', tiers: ['bronze_axe','iron_axe','steel_axe','alloy_axe','apex_axe','nova_axe'] },
  fishing:     { icon: '🎣', name: 'Fishing Rod',     tiers: ['bronze_rod','iron_rod','steel_rod','alloy_rod','apex_rod','nova_rod'] },
  // ... 11 skills total
}
```

### PETS (matching pet IDs by skill):
```
woodcutting_pet, fishing_pet, mining_pet, foraging_pet, cooking_pet,
smithing_pet, crafting_pet, herblore_pet, thieving_pet, farming_pet, agility_pet
```

### ITEM_IMAGES for pets:
```js
ITEM_IMAGES[`${screen}_pet`]  // e.g., ITEM_IMAGES['woodcutting_pet']
```

### Coins: `inventory.coins`

### Tool items structure:
```js
ITEMS['bronze_axe'] = { name: 'Bronze Axe', value: 50, equipSlot: 'tool', speedBoosts: { woodcutting: 0.02 } }
```

---

## 13. Visual Layout Description

```
┌─────────────────────────────────────────────────────────────┐
│  LEFT SIDE (flex: 1)                   │  RIGHT SIDE (80px) │
│                                        │                    │
│  🧰 Woodcutting Toolbox  Lv. 0        │    Rare Drops      │
│  Accepts: Bronze – Iron               │                    │
│              [⬆ Upgrade (1 🪙)]       │   [bronze_axe]     │
│                                        │    <0.01%          │
│  ┌──────┐ ┌──────┐ ┌──────┐          │                    │
│  │ Iron │ │  +   │ │  +   │          │   [beaver_pet]     │
│  │ Axe  │ │      │ │      │          │    <0.01%          │
│  └──────┘ └──────┘ └──────┘          │                    │
│  (slots shown based on level)          │                    │
│                                        │                    │
│  Store from inventory:                 │                    │
│  [🪓 Bronze Axe (x2)]                 │                    │
│  [🪓 Iron Axe (x1)]                   │                    │
│                                        │                    │
└─────────────────────────────────────────────────────────────┘
```

At level 0, only 1 slot is shown. After upgrades, more slots appear.
The "Store from inventory" section only shows if there are eligible tools in inventory AND empty slots available.
