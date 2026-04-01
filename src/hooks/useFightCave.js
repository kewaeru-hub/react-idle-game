import { useState, useRef } from 'react';
import { monsters as fightCaveMonsters, waves as fightCaveWaves } from '../data/fightCaveData';
import { ACTIONS } from '../data/gameData';

export function useFightCave(combat, setInventory, stopAction, setPlayerPrayer, playerPrayer, maxPrayer) {
  const [fightCaveActive, setFightCaveActive] = useState(false);
  const [fightCaveWaveIndex, setFightCaveWaveIndex] = useState(0);
  const [activeWave, setActiveWave] = useState(0);
  const [fightCaveVictory, setFightCaveVictory] = useState(false);
  const fightCaveWaveIndexRef = useRef(0);

  const buildWaveMonsters = (waveIndex) => {
    const waveData = fightCaveWaves[waveIndex];
    if (!waveData) return [];
    const waveMonsters = [];
    let monsterCounter = 1;

    for (const monsterGroup of waveData.monsters) {
      for (let i = 0; i < monsterGroup.count; i++) {
        const monsterType = monsterGroup.type;
        const monsterStats = fightCaveMonsters[monsterType] || { hp: 1, attackSpeed: 5, def: 0, offensiveStats: { attack: 1, magic: 1, ranged: 1 }};
        const displayName = monsterType === 'prayer-eater' ? 'Blub' : monsterType === 'zed' ? 'Zak' : (monsterType.charAt(0).toUpperCase() + monsterType.slice(1));
        waveMonsters.push({
          name: displayName,
          type: monsterType,
          hp: monsterStats.hp,
          maxHp: monsterStats.hp,
          currentHp: monsterStats.hp,
          attackSpeed: monsterStats.attackSpeed,
          currentEnemyTick: 0,
          def: monsterStats.def,
          offensiveStats: monsterStats.offensiveStats
        });
        monsterCounter++;
      }
    }

    return waveMonsters;
  };

  const startFightCave = () => {
    // Fight cave: seed with all wave monsters, provide callbacks for wave advancement
    setFightCaveActive(true);
    setActiveWave(1);
    setFightCaveWaveIndex(0);
    fightCaveWaveIndexRef.current = 0;

    const waveMonsters = buildWaveMonsters(0);
    let callbacks;
    callbacks = {
      onAllEnemiesDead: () => {
        // Wave advancement logic: move to next wave or victory
        const nextWaveIndex = fightCaveWaveIndexRef.current + 1;
        
        if (nextWaveIndex < fightCaveWaves.length) {
          // More waves exist - seed next wave
          fightCaveWaveIndexRef.current = nextWaveIndex;
          setFightCaveWaveIndex(nextWaveIndex);
          setActiveWave(nextWaveIndex + 1);
          const nextWaveMonsters = buildWaveMonsters(nextWaveIndex);
          combat.seedCombat('lava_cave', nextWaveMonsters, callbacks);
        } else {
          // Victory - all waves complete
          setFightCaveActive(false);
          setFightCaveVictory(true);
          setInventory(prev => {
            let n = {...prev};
            Object.entries(ACTIONS.lava_cave.reward).forEach(([k,v]) => n[k] = (n[k]||0)+v);
            return n;
          });
          stopAction();
        }
      },
      onPrayerDrain: (amount) => {
        setPlayerPrayer(prev => Math.max(0, prev - amount));
      },
      onPotionDrink: (amount) => {
        setPlayerPrayer(prev => Math.min(maxPrayer, prev + amount));
      },
      onPlayerDead: stopAction
    };
    
    combat.seedCombat('lava_cave', waveMonsters, callbacks);
    combat.engine.initPrayer(playerPrayer, maxPrayer);
  };

  const changeFightCaveTarget = (enemyIndex) => {
    // Set the engine target to the clicked monster
    const enemyId = `m-${enemyIndex}`;
    combat.engine.setTarget(enemyId);
  };

  return {
    fightCaveActive, setFightCaveActive,
    fightCaveWaveIndex, activeWave,
    fightCaveVictory, setFightCaveVictory,
    buildWaveMonsters, startFightCave, changeFightCaveTarget
  };
}
