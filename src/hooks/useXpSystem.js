// src/hooks/useXpSystem.js
import { useState } from 'react';
import { getRequiredXp } from '../utils/gameHelpers';

export function useXpSystem(initialSkills, triggerLevelUp) {
  const [skills, setSkills] = useState(initialSkills);

  const addXp = (skill, amount) => {
    setSkills(prev => {
      // Kopieer de huidige skills
      let newSkills = { ...prev };
      if (!newSkills[skill]) return newSkills;

      // Maak een diepe kopie van de specifieke skill die we updaten
      newSkills[skill] = { ...newSkills[skill] };
      newSkills[skill].xp += amount;

      let leveledUp = false;
      let currentLevel = newSkills[skill].level;

      // Blijf levelen zolang de XP hoger is dan de eis voor het VOLGENDE level
      while (newSkills[skill].xp >= getRequiredXp(currentLevel + 1)) {
        currentLevel++;
        leveledUp = true;
      }

      if (leveledUp) {
        newSkills[skill].level = currentLevel;
        // Trigger de visuele popup (functie komt uit App.jsx)
        setTimeout(() => triggerLevelUp(skill, currentLevel), 0);
      }

      return newSkills;
    });
  };

  return [skills, addXp, setSkills];
}