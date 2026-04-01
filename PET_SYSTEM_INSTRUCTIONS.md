# 🐾 Pet System Implementation Instructions

## Overview
Add 12 equippable pets, one per skill, each with a unique passive buff. Only 1 pet can be equipped at a time via the existing `pet` slot in `EquipmentGrid.jsx`. Pets are items in the player's inventory that can be equipped/unequipped like armor.

---

## PHASE 1: Data & Images (`src/data/gameData.js`)

### 1A. Add pet images to ITEM_IMAGES
Add these entries to the `ITEM_IMAGES` object (next to existing image mappings):

```js
woodcutting_pet: '/src/assets/Pets/woodcutting_pet.png',
fishing_pet: '/src/assets/Pets/fishing_pet.png',
mining_pet: '/src/assets/Pets/mining_pet.png',
foraging_pet: '/src/assets/Pets/foraging_pet.png',
cooking_pet: '/src/assets/Pets/cooking_pet.png',
smithing_pet: '/src/assets/Pets/smithing_pet.png',
crafting_pet: '/src/assets/Pets/crafting_pet.png',
herblore_pet: '/src/assets/Pets/herblore_pet.png',
thieving_pet: '/src/assets/Pets/thieving_pet.png',
farming_pet: '/src/assets/Pets/farming_pet.png',
agility_pet: '/src/assets/Pets/agility_pet.png',
slayer_pet: '/src/assets/Pets/slayer_pet.png',
```

### 1B. Create PETS data export
Add a new exported constant `PETS` in `gameData.js`:

```js
export const PETS = {
  woodcutting_pet: {
    name: 'Beaver',
    skill: 'woodcutting',
    equipSlot: 'pet',
    desc: '10% chance to receive an extra log when woodcutting.',
    perk: 'extraLog',
    perkChance: 0.10,
  },
  fishing_pet: {
    name: 'Heron',
    skill: 'fishing',
    equipSlot: 'pet',
    desc: '+20% chance to find treasure chests while fishing.',
    perk: 'treasureBoost',
    perkValue: 0.20, // multiplier: existing chance * 1.20
  },
  mining_pet: {
    name: 'Rock Golem',
    skill: 'mining',
    equipSlot: 'pet',
    desc: '5% chance per mine action that the ore auto-smelts into a bar.',
    perk: 'autoSmelt',
    perkChance: 0.05,
  },
  foraging_pet: {
    name: 'Tanuki',
    skill: 'foraging',
    equipSlot: 'pet',
    desc: 'Reduces foraging time by 1 second.',
    perk: 'foragingSpeed',
    perkValue: 1000, // ms to subtract from baseTime
  },
  cooking_pet: {
    name: 'Rocky Raccoon',
    skill: 'cooking',
    equipSlot: 'pet',
    desc: '50% chance to cook 3 fish at once (costs 3 raw fish).',
    perk: 'batchCook',
    perkChance: 0.50,
    perkMultiplier: 3,
  },
  smithing_pet: {
    name: 'Smithy',
    skill: 'smithing',
    equipSlot: 'pet',
    desc: '5% chance to save 1 bar when smithing.',
    perk: 'barSave',
    perkChance: 0.05,
  },
  crafting_pet: {
    name: 'Chameleon',
    skill: 'crafting',
    equipSlot: 'pet',
    desc: 'Weaves cloth from flax without consuming flax from inventory.',
    perk: 'freeFlax',
  },
  herblore_pet: {
    name: 'Herbi',
    skill: 'herblore',
    equipSlot: 'pet',
    desc: '10% chance to brew a second potion without extra resources.',
    perk: 'doubleBrew',
    perkChance: 0.10,
  },
  thieving_pet: {
    name: 'Raccoon',
    skill: 'thieving',
    equipSlot: 'pet',
    desc: '50% chance to still steal loot even when getting stunned.',
    perk: 'stunSteal',
    perkChance: 0.50,
  },
  farming_pet: {
    name: 'Mole',
    skill: 'farming',
    equipSlot: 'pet',
    desc: 'Once per day, activate the Mole Timer: farming is 100% faster for 30 minutes.',
    perk: 'moleTimer',
    perkDuration: 30 * 60 * 1000, // 30 min in ms
    perkCooldown: 24 * 60 * 60 * 1000, // 24 hours in ms
  },
  agility_pet: {
    name: 'Squirrel',
    skill: 'agility',
    equipSlot: 'pet',
    desc: '5% chance to instantly complete an agility course.',
    perk: 'instantCourse',
    perkChance: 0.05,
  },
  slayer_pet: {
    name: 'Crawling Hand',
    skill: 'slayer',
    equipSlot: 'pet',
    desc: 'Fights alongside you during slayer tasks. Hits 0-2 damage with 3-tick attack speed.',
    perk: 'slayerCompanion',
    perkMinHit: 0,
    perkMaxHit: 2,
    perkSpeedTicks: 3,
  },
};
```

### 1C. Add pets to ITEMS
Add each pet to the `ITEMS` object so the inventory system recognizes them:

```js
woodcutting_pet: { name: 'Beaver', value: 0, equipSlot: 'pet' },
fishing_pet: { name: 'Heron', value: 0, equipSlot: 'pet' },
mining_pet: { name: 'Rock Golem', value: 0, equipSlot: 'pet' },
foraging_pet: { name: 'Tanuki', value: 0, equipSlot: 'pet' },
cooking_pet: { name: 'Rocky Raccoon', value: 0, equipSlot: 'pet' },
smithing_pet: { name: 'Smithy', value: 0, equipSlot: 'pet' },
crafting_pet: { name: 'Chameleon', value: 0, equipSlot: 'pet' },
herblore_pet: { name: 'Herbi', value: 0, equipSlot: 'pet' },
thieving_pet: { name: 'Raccoon', value: 0, equipSlot: 'pet' },
farming_pet: { name: 'Mole', value: 0, equipSlot: 'pet' },
agility_pet: { name: 'Squirrel', value: 0, equipSlot: 'pet' },
slayer_pet: { name: 'Crawling Hand', value: 0, equipSlot: 'pet' },
```

---

## PHASE 2: Equipment System (`src/hooks/useEquipment.js`)

### 2A. Import PETS
At line 2, add `PETS` to the import:

```js
import { WEAPONS, ARMOR, AMMO, ITEMS, PETS } from '../data/gameData';
```

### 2B. Update toggleEquip to recognize pets
In `toggleEquip`, the item lookup on line 10 currently is:
```js
const itemData = WEAPONS[itemKey] || ARMOR[itemKey] || AMMO[itemKey] || ITEMS[itemKey];
```

Change to:
```js
const itemData = WEAPONS[itemKey] || ARMOR[itemKey] || AMMO[itemKey] || PETS[itemKey] || ITEMS[itemKey];
```

This ensures pets are found and their `equipSlot: 'pet'` is used for slot assignment.

---

## PHASE 3: Helper for active pet (`src/utils/gameHelpers.js`)

### 3A. Add getActivePet helper
Add this function at the bottom of `gameHelpers.js`:

```js
/**
 * Returns the PETS data for the currently equipped pet, or null.
 */
export const getActivePet = (equipment, PETS) => {
  const petKey = equipment?.pet;
  return petKey ? (PETS[petKey] || null) : null;
};
```

---

## PHASE 4: Skilling Engine Pet Perks (`src/hooks/useSkilling.js`)

This is the **core logic**. The `useSkilling` hook handles all non-combat, non-thieving skills. Currently it does:
1. Check resources → 2. Wait `actualTimeMs` → 3. Deduct cost, add reward, give XP → repeat

### 4A. Import PETS and getActivePet
```js
import { PETS } from '../data/gameData';
import { getSkillingSpeedMultiplier, getActivePet } from '../utils/gameHelpers';
```

### 4B. Pass `equipment` to useSkilling
The hook already receives `equipment` as a parameter. Good.

### 4C. Implement pet perks in the interval callback

**The current `setInventory` block (inside `setInterval`) is approximately:**
```js
setInventory(prev => {
  let n = {...prev};
  if (data.cost) Object.entries(data.cost).forEach(([k,v]) => n[k] -= v);
  Object.entries(data.reward).forEach(([k,v]) => n[k] = (n[k]||0)+v);
  // ... resource check for next round
  return n;
});
```

**Replace with this pet-aware version:**

```js
// Check pet perk BEFORE inventory update
const pet = getActivePet(equipment, PETS);
const petSkill = pet?.skill;
const isRelevantPet = petSkill === data.skill;

setInventory(prev => {
  let n = {...prev};

  // === CRAFTING PET: Free flax ===
  // If crafting pet is equipped and action costs flax, skip flax cost
  if (isRelevantPet && pet.perk === 'freeFlax' && data.cost?.flax) {
    if (data.cost) {
      Object.entries(data.cost).forEach(([k, v]) => {
        if (k !== 'flax') n[k] -= v;
      });
    }
  }
  // === COOKING PET: Batch cook ===
  else if (isRelevantPet && pet.perk === 'batchCook' && Math.random() < pet.perkChance) {
    // Multiply both cost and reward by 3
    const multi = pet.perkMultiplier;
    if (data.cost) {
      // Check if we have enough for the multiplied cost
      const canBatch = Object.entries(data.cost).every(([k, v]) => (n[k] || 0) >= v * multi);
      if (canBatch) {
        Object.entries(data.cost).forEach(([k, v]) => n[k] -= v * multi);
        Object.entries(data.reward).forEach(([k, v]) => n[k] = (n[k] || 0) + v * multi);
      } else {
        // Not enough for batch, do normal
        if (data.cost) Object.entries(data.cost).forEach(([k, v]) => n[k] -= v);
        Object.entries(data.reward).forEach(([k, v]) => n[k] = (n[k] || 0) + v);
      }
    }
  }
  // === SMITHING PET: Save 1 bar ===
  else if (isRelevantPet && pet.perk === 'barSave' && Math.random() < pet.perkChance) {
    if (data.cost) {
      Object.entries(data.cost).forEach(([k, v]) => {
        // Save 1 of any bar-type ingredient
        if (k.includes('bar') && v > 1) {
          n[k] -= (v - 1); // Save 1 bar
        } else {
          n[k] -= v;
        }
      });
    }
    Object.entries(data.reward).forEach(([k, v]) => n[k] = (n[k] || 0) + v);
  }
  // === HERBLORE PET: Double brew ===
  else if (isRelevantPet && pet.perk === 'doubleBrew' && Math.random() < pet.perkChance) {
    if (data.cost) Object.entries(data.cost).forEach(([k, v]) => n[k] -= v);
    // Double the reward
    Object.entries(data.reward).forEach(([k, v]) => n[k] = (n[k] || 0) + v * 2);
  }
  // === WOODCUTTING PET: Extra log ===
  else if (isRelevantPet && pet.perk === 'extraLog' && Math.random() < pet.perkChance) {
    if (data.cost) Object.entries(data.cost).forEach(([k, v]) => n[k] -= v);
    // Double the reward (extra log)
    Object.entries(data.reward).forEach(([k, v]) => n[k] = (n[k] || 0) + v * 2);
  }
  // === MINING PET: Auto-smelt ===
  else if (isRelevantPet && pet.perk === 'autoSmelt' && Math.random() < pet.perkChance) {
    if (data.cost) Object.entries(data.cost).forEach(([k, v]) => n[k] -= v);
    // Convert ore reward to bar. Mapping:
    const oreToBar = {
      copper_ore: 'bronze_bar', tin_ore: 'bronze_bar',
      iron_ore: 'iron_bar', coal: 'steel_bar',
      mithril_ore: 'mithril_bar', adamantite_ore: 'adamantite_bar',
      runite_ore: 'runite_bar', luminite_ore: 'luminite_bar',
      orichalcite_ore: 'orichalcite_bar', drakolith_ore: 'drakolith_bar',
      necrite_ore: 'necrite_bar', phasmatite_ore: 'phasmatite_bar',
    };
    Object.entries(data.reward).forEach(([k, v]) => {
      const barKey = oreToBar[k];
      if (barKey) {
        n[barKey] = (n[barKey] || 0) + v; // give bar instead of ore
      } else {
        n[k] = (n[k] || 0) + v; // fallback: normal reward
      }
    });
  }
  // === DEFAULT: No pet / pet not relevant ===
  else {
    if (data.cost) Object.entries(data.cost).forEach(([k, v]) => n[k] -= v);
    Object.entries(data.reward).forEach(([k, v]) => n[k] = (n[k] || 0) + v);
  }

  // EXTRA CHECK VOOR VOLGENDE RONDE (existing logic):
  if (data.cost) {
    const hasMore = Object.entries(data.cost).every(([k, v]) => (n[k] || 0) >= v);
    if (!hasMore) {
      setTimeout(() => stopAction(), 50);
    }
  }
  return n;
});
```

### 4D. Foraging pet speed bonus
The foraging pet reduces action time by 1 second. This needs to modify `actualTimeMs` calculation.

**Current code:**
```js
const actualTimeMs = baseMs * getSkillingSpeedMultiplier(data.skill, skills, equipment, WEAPONS, ARMOR, AMMO);
```

**Change to:**
```js
let actualTimeMs = baseMs * getSkillingSpeedMultiplier(data.skill, skills, equipment, WEAPONS, ARMOR, AMMO);

// Foraging pet: subtract 1 second
const pet = getActivePet(equipment, PETS);
if (pet?.perk === 'foragingSpeed' && data.skill === 'foraging') {
  actualTimeMs = Math.max(500, actualTimeMs - pet.perkValue); // minimum 0.5s
}

// Farming pet: Mole Timer active → 50% faster (100% speed boost = halved time)
if (pet?.perk === 'moleTimer' && data.skill === 'farming') {
  // Check if moleTimer is active (stored in a ref or state, see Phase 6)
  // This will be handled via a moleTimerActive flag passed to useSkilling
}
```

### 4E. Agility pet instant completion
The agility pet gives 5% chance to instantly complete. This should happen at the **START** of each action cycle. Inside the `setInterval` callback, BEFORE the normal completion logic:

```js
// Agility pet: 5% instant completion
if (isRelevantPet && pet?.perk === 'instantCourse' && Math.random() < pet.perkChance) {
  // The action already completed (we're in the interval callback), so no extra logic needed.
  // The "instant" means the NEXT action should fire immediately.
  // Set the next interval to fire after just 50ms instead of the full time.
  // Implementation: After giving rewards, reset actionStartTime and skip waiting.
}
```

**Better approach for agility:** After the `setInterval` fires and gives rewards, roll for instant. If it procs, use `clearInterval` + immediately re-trigger with a tiny delay:

```js
// After XP/reward handling in the setInterval callback:
if (isRelevantPet && pet?.perk === 'instantCourse') {
  if (Math.random() < pet.perkChance) {
    // Instant proc: reset timer to fire again in 50ms
    clearInterval(skillingInterval);
    // The useEffect will re-run because we'll force it via a state update
    // OR: recursively call the action handler immediately
  }
}
```

**Simplest implementation:** Instead of messing with intervals, apply the agility pet at the `actualTimeMs` calculation level. On each completion, roll 5% → if proc, set `actionStartTime = Date.now() - actualTimeMs + 50` so the next tick fires almost instantly. This way the existing interval doesn't need to change.

---

## PHASE 5: Thieving Pet Perk (`src/components/ThievingView.jsx`)

### 5A. Import PETS
```js
import { PETS } from '../data/gameData';
import { getActivePet } from '../utils/gameHelpers';
```

### 5B. Pass `equipment` as prop
ThievingView needs access to `equipment` to check the pet. In `App.jsx`, add `equipment={equipment}` to the ThievingView props (around line 303).

### 5C. Modify the stun logic
In the `intervalRef.current = setInterval(...)` block (around line 75), the current stun branch is:

```js
} else {
  // GESTUNNED
  if (isMountedRef.current) {
    setLastResult('stunned');
    setStunned(true);
    setProgress(0);
    // ... stun timer ...
  }
}
```

**Change to:**
```js
} else {
  // GESTUNNED
  if (isMountedRef.current) {
    // Thieving pet: 50% chance to still steal even when stunned
    const pet = getActivePet(equipment, PETS);
    if (pet?.perk === 'stunSteal' && Math.random() < pet.perkChance) {
      // Still give loot despite being stunned
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
    }

    // Still get stunned regardless
    setLastResult('stunned');
    setStunned(true);
    setProgress(0);
    // ... existing stun timer code unchanged ...
  }
}
```

---

## PHASE 6: Farming Pet — Mole Timer

### 6A. State in App.jsx
Add state for the mole timer:

```js
const [moleTimerActive, setMoleTimerActive] = useState(false);
const [moleTimerCooldown, setMoleTimerCooldown] = useState(0); // timestamp when last used
```

### 6B. Mole Timer activation function
```js
const activateMoleTimer = () => {
  const pet = getActivePet(equipment, PETS);
  if (!pet || pet.perk !== 'moleTimer') return;

  const now = Date.now();
  const lastUsed = moleTimerCooldown;
  if (now - lastUsed < pet.perkCooldown) return; // still on cooldown

  setMoleTimerActive(true);
  setMoleTimerCooldown(now);

  setTimeout(() => {
    setMoleTimerActive(false);
  }, pet.perkDuration); // 30 minutes
};
```

### 6C. Apply speed boost in useSkilling
Pass `moleTimerActive` to `useSkilling`. In the time calculation:

```js
if (pet?.perk === 'moleTimer' && data.skill === 'farming' && moleTimerActive) {
  actualTimeMs = actualTimeMs * 0.5; // 100% faster = half the time
}
```

### 6D. UI: Mole Timer button
In `SkillingView.jsx`, when `screen === 'farming'`, show a "🐀 Activate Mole Timer" button (similar to the existing agility dodge info card). Show cooldown remaining if on cooldown.

### 6E. Save/Load
Save `moleTimerCooldown` in the save data so the 24-hour cooldown persists across sessions.

---

## PHASE 7: Slayer Pet — Combat Companion

### 7A. Integrate into combat engine
The slayer pet fights alongside during slayer tasks. In `useCombatEngine.js` or `useCombat.js`:

- Check if `equipment.pet === 'slayer_pet'` AND the current fight is a slayer task
- Add a separate attack timer for the pet (3-tick speed = 1800ms intervals)
- Each pet attack deals `Math.floor(Math.random() * 3)` damage (0, 1, or 2)
- Pet damage is applied directly to the monster HP

### 7B. How to determine if it's a slayer task
Check if the current `activeAction` corresponds to a slayer task monster. The slayer system should already track this. If `slayer.currentTask` is active and the monster being fought matches the task monster, the pet should attack.

---

## PHASE 8: Pet Info Boxes in UI

### 8A. SkillingView — Show active pet buff info
In `SkillingView.jsx`, add an info box similar to the agility dodge card. When the equipped pet matches the current screen skill, show:

```jsx
{/* PET BUFF INFO */}
{pet && pet.skill === screen && (
  <div className="card" style={{
    backgroundColor: '#1a2520', border: '1px solid #f1c40f',
    padding: '15px', marginBottom: '15px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <img src={ITEM_IMAGES[equipment.pet]} alt={pet.name}
        style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
      <div>
        <h4 style={{ color: '#f1c40f', margin: '0 0 5px 0' }}>🐾 {pet.name} — Active</h4>
        <p style={{ color: '#c5d3df', margin: 0, fontSize: '13px' }}>{pet.desc}</p>
      </div>
    </div>
  </div>
)}
```

Import `PETS` and `ITEM_IMAGES` in SkillingView, and pass `equipment` as a prop from App.jsx.

### 8B. ThievingView — Show thieving pet info
Same pattern, but inside ThievingView's header section.

### 8C. InventoryView — Pet tooltip
When hovering over a pet in inventory, show its buff description in the item tooltip.

---

## PHASE 9: Ore-to-Bar Mapping for Mining Pet

You need to verify the actual ore and bar keys in `gameData.js`. Search for all mining actions and their reward keys, then search for all smithing actions and their cost keys (bars). Create an accurate `oreToBar` mapping. Example pattern from the existing data:

```
Mining action: mine_copper → reward: { copper_ore: 1 }
Smithing action: smelt_bronze → cost: { copper_ore: 1, tin_ore: 1 } → reward: { bronze_bar: 1 }
```

The mining pet should map each ore to its corresponding smelted bar. If an ore is used in multiple bars (like coal → steel), pick the primary one.

---

## PHASE 10: Fishing Pet — Treasure Chest Mechanic

**NOTE:** There is currently NO treasure chest mechanic in fishing. The fishing pet adds "+20% chance to find treasure chests." This means you need to:

1. **Create the treasure chest mechanic first:**
   - Add `treasure_chest` to `ITEMS` with appropriate value
   - Add an image for treasure chests to `ITEM_IMAGES`
   - In `useSkilling.js`, for fishing actions, add a rare drop roll:
     ```js
     // Base treasure chest chance during fishing
     const baseTreasureChance = 0.01; // 1% base
     let treasureChance = baseTreasureChance;
     if (isRelevantPet && pet?.perk === 'treasureBoost') {
       treasureChance *= (1 + pet.perkValue); // 1% * 1.20 = 1.2%
     }
     if (data.skill === 'fishing' && Math.random() < treasureChance) {
       n['treasure_chest'] = (n['treasure_chest'] || 0) + 1;
     }
     ```
   
2. **Add treasure chest opening mechanic** (optional, or just make it a valuable sellable item)

---

## IMPORTANT TECHNICAL NOTES

### Mutual Exclusion
Only 1 pet can be equipped at a time. The existing equipment system handles this — the `pet` slot can only hold one item, and swapping returns the old pet to inventory.

### State Dependencies in useSkilling
The `useSkilling` hook has `[activeAction, equipment, skills]` as useEffect dependencies. Since `equipment` is already a dependency, **equipping/unequipping a pet will automatically restart the skilling interval** with the new pet perk. No extra work needed.

### ORE_TO_BAR mapping
Check `gameData.js` carefully. Search for all keys containing `_ore` and `_bar` to build the correct mapping. The mining actions' reward keys and the smithing actions' cost keys will tell you the exact relationships.

### Crafting Pet special case
The crafting pet makes the `flax` cost 0 for actions that require flax. The current `data.cost` for those actions likely has `{ flax: X }`. The pet should skip deducting flax but still deduct any other costs and still give the normal reward.

### Testing checklist
For each pet, test:
1. ✅ Pet appears in inventory
2. ✅ Pet can be equipped in the pet slot (shows image)
3. ✅ Pet can be unequipped (returns to inventory)
4. ✅ Only 1 pet at a time (swapping works)
5. ✅ Pet buff only works when equipped
6. ✅ Pet buff only applies to its own skill
7. ✅ Info box appears on the skill screen when pet is active
8. ✅ The specific perk mechanic works correctly
9. ✅ Save/Load preserves the equipped pet

### How to give pets to players for testing
Add pets to the starting inventory in `App.jsx` line 53:
```js
const [inventory, setInventory] = useState({
  coins: 0, bones: 0, ...,
  woodcutting_pet: 1, fishing_pet: 1, mining_pet: 1, // etc.
});
```

Or add them to the shop in `gameData.js` `SHOP_ITEMS`.

---

## FILE CHANGE SUMMARY

| File | Changes |
|------|---------|
| `src/data/gameData.js` | Add `PETS` export, add pets to `ITEMS`, add images to `ITEM_IMAGES` |
| `src/hooks/useEquipment.js` | Import `PETS`, add to item lookup chain |
| `src/utils/gameHelpers.js` | Add `getActivePet()` helper |
| `src/hooks/useSkilling.js` | Import `PETS`/`getActivePet`, add all pet perk logic in the interval callback |
| `src/components/ThievingView.jsx` | Import `PETS`/`getActivePet`, add `equipment` prop, add stunSteal perk logic |
| `src/components/SkillingView.jsx` | Import `PETS`/`ITEM_IMAGES`, add `equipment` prop, add pet info boxes |
| `src/App.jsx` | Pass `equipment` to ThievingView/SkillingView, add mole timer state, add `moleTimerActive` to useSkilling |
| `src/hooks/useCombat.js` or `useCombatEngine.js` | Add slayer pet companion attack logic |
