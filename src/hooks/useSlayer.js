import { useState, useCallback } from 'react';

export function useSlayer(SLAYER_MASTERS, ACTIONS, onTaskComplete) {
  const [currentTask, setCurrentTask] = useState(null); // { masterId, monsterKey, killsNeeded, killsCompleted }
  const [slayerPoints, setSlayerPoints] = useState(0);
  const [consecutive, setConsecutive] = useState(0); // Consecutive tasks from same master

  // Get task from master
  const getTask = useCallback((masterId) => {
    const master = SLAYER_MASTERS.find(m => m.id === masterId);
    if (!master) return null;

    // Can't assign boss tasks unless unlocked
    if (master.requiresUnlock && slayerPoints < 200) {
      return null;
    }

    // Pick random monster from master's list
    const monsterKey = master.monsters[Math.floor(Math.random() * master.monsters.length)];
    const killsNeeded = Math.floor(
      Math.random() * (master.taskRange[1] - master.taskRange[0] + 1) + master.taskRange[0]
    );

    return {
      masterId,
      monsterKey,
      killsNeeded,
      killsCompleted: 0
    };
  }, [SLAYER_MASTERS, slayerPoints]);

  // Accept task
  const acceptTask = useCallback((masterId) => {
    const task = getTask(masterId);
    if (!task) return false;
    setCurrentTask(task);
    return true;
  }, [getTask]);

  // Complete kill (called when monster dies)
  const recordKill = useCallback((monsterKey) => {
    setCurrentTask(prev => {
      if (!prev || prev.monsterKey !== monsterKey) return prev;
      const newCompleted = prev.killsCompleted + 1;
      if (newCompleted >= prev.killsNeeded) {
        // Task complete!
        const master = SLAYER_MASTERS.find(m => m.id === prev.masterId);
        if (master) {
          setSlayerPoints(p => p + master.points);
          setConsecutive(c => c + 1);
          if (onTaskComplete) {
            onTaskComplete({
              monsterKey: prev.monsterKey,
              killsNeeded: prev.killsNeeded,
              points: master.points,
              masterName: master.name
            });
          }
        }
        return null; // Clear current task
      }
      return {
        ...prev,
        killsCompleted: newCompleted
      };
    });
  }, [SLAYER_MASTERS]);

  // Cancel task (costs 30 points)
  const cancelTask = useCallback(() => {
    if (slayerPoints < 30) return false;
    setSlayerPoints(p => p - 30);
    setCurrentTask(null);
    setConsecutive(0);
    return true;
  }, [slayerPoints]);

  // Auto complete task (for testing / offline progression, if needed)
  const autoCompleteTask = useCallback(() => {
    if (!currentTask) return false;
    const master = SLAYER_MASTERS.find(m => m.id === currentTask.masterId);
    if (!master) return false;
    setSlayerPoints(p => p + master.points);
    setConsecutive(c => c + 1);
    setCurrentTask(null);
    return true;
  }, [currentTask, SLAYER_MASTERS]);

  return {
    currentTask,
    slayerPoints,
    consecutive,
    acceptTask,
    recordKill,
    cancelTask,
    autoCompleteTask,
    setCurrentTask,
    setSlayerPoints,
    setConsecutive
  };
}
