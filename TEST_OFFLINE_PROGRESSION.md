## OFFLINE PROGRESSION SYSTEM - TEST SCENARIO

### ✅ Test 1: Save/Load met Timestamp en ActiveAction
**Wat testen:**
1. Start game, ga naar Woodcutting (wc_spruce)
2. Start de actie, wacht ~2 seconden
3. Refresh pagina (F5)
4. Check console: zien dat `lastSaveTimestamp` en `activeAction: 'wc_spruce'` zijn opgeslagen
5. **Expected:** Game laadt, activeAction is nog steeds 'wc_spruce' (maar actie is niet restarted)

### ✅ Test 2: Offline Progress Berekening (1 minuut offline)
**Wat testen:**
1. Start Woodcutting (spruce = 3.2 ticks = 1920ms per log)
2. Open DevTools (F12), ga naar Console
3. Voer uit: `localStorage.removeItem('idleScape_save_v1'); localStorage.setItem('idleScape_save_v1', JSON.stringify({...JSON.parse(localStorage.getItem('idleScape_save_v1') || '{}'), lastSaveTimestamp: Date.now() - 60000})); location.reload();`
4. **Expected:** 
   - Welcome Back Modal verschijnt
   - Toont: "You were away for 0h 1m"
   - Toont: "1x Spruce Tree completed" (60000ms / 1920ms = ~31 acties, maar we zetten het op 1 minuut)
   - Toont: "+31 Woodcutting XP gained" of iets dergelijks
   - Toont: "31x spruce_log" in items

### ✅ Test 3: Offline Progress met Resource Depletion
**Wat testen:**
1. Start Fishing (Raw Shrimp = je hebt maar 5)
2. Stel offline tijd in op 30 minuten
3. **Expected:**
   - Modal toont aantal shrimp verkregen (~5 minuten werk)
   - Modal toont waarschuwing: "Stopped early: ran out of resources"
   - Inventory heeft 0 shrimp

### ✅ Test 4: Offline Uren Upgrade
**Wat testen:**
1. Ga naar Shop > Account Upgrades
2. Check "Offline Time" blok: moet zeggen "12h / 24h" (offlineHoursUpgrade: 0)
3. Koop upgrade (200k gp) → moet nu zeggen "13h / 24h"
4. Herhaal totaal 6x → moet "18h / 24h" zeggen
5. Refresh pagina → offlineHoursUpgrade moet 6 zijn in inventory
6. Probeer 7e keer kopen → knop moet disabled zijn, tekst "✓ Maximum offline time unlocked!"

### ✅ Test 5: Max Offline Cap
**Wat testen:**
1. Stel offlineHoursUpgrade: 6
2. Start actie, zet offline tijd op 48 uur
3. Refresh
4. **Expected:**
   - Modal toont max 18 uren werk (niet 48)
   - Berekening: (12 + 6) * 3600000 = 18 uur max

### ✅ Test 6: Speed Multiplier in Offline Calc
**Wat testen:**
1. Equip iets met speed boost (als je het hebt)
2. Start skilling action
3. Zet offline time op 10 minuten
4. Refresh
5. **Expected:**
   - XP gained moet meer zijn dan zonder gear (speed multiplier werkt)

### ⚠️ Known Limitations (voor toekomst):
- Level-ups tijdens offline progressie worden NIET meegeteld voor speed berekening
- Combat actions geven geen offline progress (design choice)
- Prayers/buffs worden niet meegeteld in simulatie
- Geen anti-cheat check (dat is Supabase feature voor later)

---

## Quick Debug Commands (Console)

```js
// Zie huidge offline progressie data:
console.log(JSON.parse(localStorage.getItem('idleScape_save_v1')).lastSaveTimestamp);

// Stel offline tijd in op X minuten:
const minutes = 30;
const key = 'idleScape_save_v1';
const data = JSON.parse(localStorage.getItem(key));
data.lastSaveTimestamp = Date.now() - (minutes * 60000);
localStorage.setItem(key, JSON.stringify(data));
location.reload();

// Zie huidge offlineHoursUpgrade:
console.log(JSON.parse(localStorage.getItem('idleScape_save_v1')).inventory.offlineHoursUpgrade);

// Wis offline progress modal:
// Zet offlineProgress state op null (in React DevTools)
```
