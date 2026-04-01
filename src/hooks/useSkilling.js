import { useEffect } from 'react';
import { getSkillingSpeedMultiplier, getActivePet } from '../utils/gameHelpers';
import { PETS, ITEMS, TOOL_SKILLS, TOOL_DROP_HOURS, PET_DROP_HOURS } from '../data/gameData';

export function useSkilling(activeAction, ACTIONS, skills, equipment, inventoryRef, setProgress, setInventory, addXp, triggerXpDrop, setSessionStats, stopAction, WEAPONS, ARMOR, AMMO, triggerPetNotification, TOOL_SKILLS, TOOL_DROP_HOURS, toolboxes, onToolDropped) {
  useEffect(() => {
    if (!activeAction || !ACTIONS[activeAction] || ACTIONS[activeAction].skill === 'combat' || ACTIONS[activeAction].skill === 'thieving') {
      return;
    }

    const data = ACTIONS[activeAction];
    const baseMs = data.baseTime || 1800;
    
    // Pet speed bonus
    const autoToolboxUpgrade = inventoryRef.current?.autoToolboxUpgrade || 0;
    let actualTimeMs = baseMs * getSkillingSpeedMultiplier(data.skill, skills, equipment, WEAPONS, ARMOR, AMMO, ITEMS, toolboxes, autoToolboxUpgrade);
    
    // Foraging pet: subtract 1 second
    const pet = getActivePet(equipment, PETS);
    // Get petId by finding which key matches this pet object
    const petId = pet ? Object.keys(PETS).find(key => PETS[key] === pet) : null;
    if (pet?.perk === 'foragingSpeed' && data.skill === 'foraging') {
      actualTimeMs = Math.max(500, actualTimeMs - pet.perkValue); // minimum 0.5s
    }

    // DIRECTE CHECK: Hebben we überhaupt wel spullen om te beginnen?
    const startInv = inventoryRef.current;
    if (data.cost) {
      const canStart = Object.entries(data.cost).every(([k, v]) => (startInv[k] || 0) >= v);
      if (!canStart) { stopAction(); return; }
    }

    // HIER BEGINT DE MAGIE: We slaan de exacte starttijd op
    let actionStartTime = Date.now();

    const skillingInterval = setInterval(() => {
      const currentInv = inventoryRef.current;
      
      // Check OF we deze ronde kunnen voltooien
      const hasResources = !data.cost || Object.entries(data.cost).every(([k, v]) => (currentInv[k] || 0) >= v);
      
      if (!hasResources) {
        stopAction(); // Stop direct als er geen grondstoffen zijn
        return;
      }

      // RESET direct de starttijd voor de volgende visuele loop
      actionStartTime = Date.now();
      setProgress(0); // Visuele reset naar 0

      // Voer de actie uit
      const petSkill = pet?.skill;
      const isRelevantPet = petSkill === data.skill;

      setInventory(prev => {
        let n = {...prev};

        // === CRAFTING PET: Free craft (5% chance no resources consumed) ===
        if (isRelevantPet && pet.perk === 'freeCraft' && Math.random() < pet.perkChance) {
          // Skip all resource consumption, just give rewards
          Object.entries(data.reward).forEach(([k, v]) => n[k] = (n[k] || 0) + v);
          if (triggerPetNotification) triggerPetNotification(petId, pet.name, 'Crafted for free!');
        }
        // === COOKING PET: Batch cook ===
        else if (isRelevantPet && pet.perk === 'batchCook' && Math.random() < pet.perkChance) {
          const multi = pet.perkMultiplier;
          if (data.cost) {
            const canBatch = Object.entries(data.cost).every(([k, v]) => (n[k] || 0) >= v * multi);
            if (canBatch) {
              Object.entries(data.cost).forEach(([k, v]) => n[k] -= v * multi);
              Object.entries(data.reward).forEach(([k, v]) => n[k] = (n[k] || 0) + v * multi);
              if (triggerPetNotification) triggerPetNotification(petId, pet.name, `Cooked x${multi} at once!`);
            } else {
              if (data.cost) Object.entries(data.cost).forEach(([k, v]) => n[k] -= v);
              Object.entries(data.reward).forEach(([k, v]) => n[k] = (n[k] || 0) + v);
            }
          }
        }
        // === SMITHING PET: Gain +1 bar ===
        else if (isRelevantPet && pet.perk === 'barSave' && Math.random() < pet.perkChance) {
          // Find which bar type is being used/made
          let barToGain = null;
          
          // Check reward first (for smelting)
          if (data.reward) {
            Object.entries(data.reward).forEach(([k, v]) => {
              if (k.includes('bar')) {
                barToGain = k;
              }
            });
          }
          
          // If not in reward, check cost (for smithing)
          if (!barToGain && data.cost) {
            Object.entries(data.cost).forEach(([k, v]) => {
              if (k.includes('bar')) {
                barToGain = k;
              }
            });
          }
          
          // Perform normal action
          if (data.cost) Object.entries(data.cost).forEach(([k, v]) => n[k] -= v);
          Object.entries(data.reward).forEach(([k, v]) => n[k] = (n[k] || 0) + v);
          
          // Add +1 extra bar of the type being processed
          if (barToGain) {
            n[barToGain] = (n[barToGain] || 0) + 1;
          }
          
          if (triggerPetNotification) triggerPetNotification(petId, pet.name, 'Gained +1 bar!');
        }
        // === HERBLORE PET: Double brew ===
        else if (isRelevantPet && pet.perk === 'doubleBrew' && Math.random() < pet.perkChance) {
          if (data.cost) Object.entries(data.cost).forEach(([k, v]) => n[k] -= v);
          Object.entries(data.reward).forEach(([k, v]) => n[k] = (n[k] || 0) + v * 2);
          if (triggerPetNotification) triggerPetNotification(petId, pet.name, 'Brewed 2 potions!');
        }
        // === WOODCUTTING PET: Extra log ===
        else if (isRelevantPet && pet.perk === 'extraLog' && Math.random() < pet.perkChance) {
          if (data.cost) Object.entries(data.cost).forEach(([k, v]) => n[k] -= v);
          Object.entries(data.reward).forEach(([k, v]) => n[k] = (n[k] || 0) + v * 2);
          if (triggerPetNotification) triggerPetNotification(petId, pet.name, 'Got an extra log!');
        }
        // === MINING PET: Auto-smelt ===
        else if (isRelevantPet && pet.perk === 'autoSmelt' && Math.random() < pet.perkChance) {
          if (data.cost) Object.entries(data.cost).forEach(([k, v]) => n[k] -= v);
          const oreToBar = {
            copper_ore: 'bronze_bar', tin_ore: 'bronze_bar',
            iron_ore: 'iron_bar', coal_ore: 'steel_bar',
            alloy_ore: 'alloy_bar', apex_ore: 'apex_bar',
            nova_ore: 'nova_bar',
          };
          Object.entries(data.reward).forEach(([k, v]) => {
            const barKey = oreToBar[k];
            if (barKey) {
              n[barKey] = (n[barKey] || 0) + v;
            } else {
              n[k] = (n[k] || 0) + v;
            }
          });
          if (triggerPetNotification) triggerPetNotification(petId, pet.name, 'Auto-smelted ore to bar!');
        }
        // === AGILITY PET: Instant course ===
        else if (isRelevantPet && pet.perk === 'instantCourse' && Math.random() < pet.perkChance) {
          if (data.cost) Object.entries(data.cost).forEach(([k, v]) => n[k] -= v);
          Object.entries(data.reward).forEach(([k, v]) => n[k] = (n[k] || 0) + v);
          if (triggerPetNotification) triggerPetNotification(petId, pet.name, 'Instant course complete!');
          
          // Queue an extra immediate action after this one completes
          setTimeout(() => {
            const nextInv = inventoryRef.current;
            const canDoExtra = !data.cost || Object.entries(data.cost).every(([k, v]) => (nextInv[k] || 0) >= v);
            if (canDoExtra) {
              setInventory(prev => {
                let extra = {...prev};
                if (data.cost) Object.entries(data.cost).forEach(([k, v]) => extra[k] -= v);
                Object.entries(data.reward).forEach(([k, v]) => extra[k] = (extra[k] || 0) + v);
                return extra;
              });
              addXp(data.skill, data.xp);
              triggerXpDrop(data.skill, data.xp, false);
              setSessionStats(prev => ({
                ...prev,
                actionsCompleted: prev.actionsCompleted + 1,
                itemsGained: prev.itemsGained + (data.reward ? 1 : 0)
              }));
            }
          }, 50);
        }
        // === DEFAULT: No pet / pet not relevant ===
        else {
          if (data.cost) Object.entries(data.cost).forEach(([k, v]) => n[k] -= v);
          Object.entries(data.reward).forEach(([k, v]) => n[k] = (n[k] || 0) + v);
        }
        
        // === TOOL DROP: Bronze tool drops (1 per 20 hours of skilling) ===
        if (TOOL_SKILLS[data.skill]) {
          const baseTimeSeconds = (data.baseTime || 1800) / 1000; // Convert ms to seconds
          const dropChancePerAction = baseTimeSeconds / (TOOL_DROP_HOURS * 3600); // 20 hours = 72000 seconds
          if (Math.random() < dropChancePerAction) {
            const bronzeToolTier = 0; // First tier is bronze
            const toolId = TOOL_SKILLS[data.skill].tiers[bronzeToolTier];
            n[toolId] = (n[toolId] || 0) + 1;
            
            // Call callback to try auto-store in toolbox
            if (onToolDropped) {
              onToolDropped(data.skill, toolId);
            }
            
            if (triggerPetNotification) {
              triggerPetNotification(toolId, '⚒️ Tool Drop', `You found a ${ITEMS[toolId]?.name}!`, 'tool_drop');
            }
          }
        }

        // === PET DROP: Skilling pet drops (1 per 600 hours of skilling) ===
        if (data.skill && data.skill !== 'combat' && data.skill !== 'prayer' && data.skill !== 'infusion') {
          const baseTimeSeconds = (data.baseTime || 1800) / 1000;
          const petDropChance = baseTimeSeconds / (PET_DROP_HOURS * 3600); // 600 hours = 2,160,000 seconds
          if (Math.random() < petDropChance) {
            const skillingPetId = `${data.skill}_pet`;
            if (PETS[skillingPetId]) {
              n[skillingPetId] = (n[skillingPetId] || 0) + 1;
              if (triggerPetNotification) {
                triggerPetNotification(skillingPetId, PETS[skillingPetId].name, `You found the ${PETS[skillingPetId].name} pet!`, 'pet_drop');
              }
            }
          }
        }
        
        // EXTRA CHECK VOOR VOLGENDE RONDE: 
        if (data.cost) {
          const hasMore = Object.entries(data.cost).every(([k, v]) => (n[k] || 0) >= v);
          if (!hasMore) {
            setTimeout(() => stopAction(), 50); 
          }
        }
        
        return n;
      });

      addXp(data.skill, data.xp); 
      triggerXpDrop(data.skill, data.xp, false);
      setSessionStats(prev => ({
        ...prev,
        actionsCompleted: prev.actionsCompleted + 1,
        itemsGained: prev.itemsGained + (data.reward ? 1 : 0)
      }));
    }, actualTimeMs);

    // DE VISUELE UPDATE (Kijkt naar de klok, niet naar hoeveel ticks er zijn geweest)
    const progressInterval = setInterval(() => {
      const timePassed = Date.now() - actionStartTime;
      let currentProgress = (timePassed / actualTimeMs) * 100;

      // Zorg dat hij niet over de 100% heen schiet als de browser even hapert
      if (currentProgress >= 100) {
        currentProgress = 100;
      }

      setProgress(currentProgress);
    }, 50); // Zelfs als de browser dit vertraagt naar 1000ms, is de berekening nog steeds perfect.

    return () => { 
      clearInterval(skillingInterval); 
      clearInterval(progressInterval); 
    };
  }, [activeAction, equipment, skills]);
}
