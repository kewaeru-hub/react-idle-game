// src/hooks/useQuests.js
// Daily & Weekly quest system with rerolls, clan quests, and upgrades
import { useState, useCallback, useEffect, useRef } from 'react';
import { ACTIONS, THIEVING_TARGETS } from '../data/gameData';

// Skills that can have quests
const QUEST_SKILLS = [
  'mining', 'woodcutting', 'fishing', 'cooking', 'smithing',
  'crafting', 'herblore', 'farming', 'foraging', 'prayer',
  'agility', 'combat', 'thieving'
];

// Map combat categories to approximate combat level requirements
const COMBAT_LEVEL_MAP = {
  beginner: 1, easy: 15, moderate: 50, hard: 80, extreme: 105
};

// Get all available actions for a given skill
function getActionsForSkill(skill) {
  if (skill === 'thieving') {
    return THIEVING_TARGETS.map(t => ({
      id: t.id,
      name: t.name,
      reqLvl: t.reqLvl,
      skill: 'thieving'
    }));
  }

  if (skill === 'combat') {
    return Object.entries(ACTIONS)
      .filter(([, a]) => a.skill === 'combat' && !a.isFightCave)
      .map(([id, a]) => ({
        id,
        name: a.name,
        reqLvl: COMBAT_LEVEL_MAP[a.category] || 1,
        skill: 'combat'
      }));
  }

  return Object.entries(ACTIONS)
    .filter(([, a]) => a.skill === skill && a.reqLvl !== undefined)
    .map(([id, a]) => ({
      id,
      name: a.name,
      reqLvl: a.reqLvl,
      skill: a.skill
    }));
}

// Skill emoji map for quest display
const SKILL_ICONS = {
  mining: '⛏️', woodcutting: '🪓', fishing: '🎣', cooking: '🍳',
  smithing: '🔨', crafting: '✂️', herblore: '🧪', farming: '🌱',
  foraging: '🌿', prayer: '🙏', agility: '🏃', combat: '⚔️', thieving: '🗝️'
};

// Generate a single quest
function generateQuest(type, skills, existingQuestActionIds = []) {
  const availableSkills = QUEST_SKILLS.filter(skill => {
    const level = skills[skill]?.level || 1;
    // For combat, check any combat skill
    if (skill === 'combat') {
      return (skills.attack?.level || 1) >= 1;
    }
    return level >= 1;
  });

  if (availableSkills.length === 0) return null;

  // Try up to 30 times to find a unique quest
  for (let attempt = 0; attempt < 30; attempt++) {
    const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];

    // For combat, use the highest combat skill level
    let playerLevel;
    if (skill === 'combat') {
      playerLevel = Math.max(
        skills.attack?.level || 1,
        skills.strength?.level || 1,
        skills.defence?.level || 1,
        skills.ranged?.level || 1,
        skills.magic?.level || 1
      );
    } else {
      playerLevel = skills[skill]?.level || 1;
    }

    // Level range for quest actions
    let minLevel, maxLevel, targetMin, targetMax;
    if (type === 'daily') {
      minLevel = Math.max(1, playerLevel - 15);
      maxLevel = playerLevel + 2;
      targetMin = 15;
      targetMax = 30;
    } else {
      minLevel = Math.max(1, playerLevel - 5);
      maxLevel = playerLevel + 5;
      targetMin = 200;
      targetMax = 300;
    }

    const actions = getActionsForSkill(skill).filter(a =>
      a.reqLvl >= minLevel && a.reqLvl <= maxLevel
    );

    if (actions.length === 0) continue;

    const action = actions[Math.floor(Math.random() * actions.length)];

    // Check for duplicates (same action ID)
    if (existingQuestActionIds.includes(action.id)) continue;

    const target = Math.floor(Math.random() * (targetMax - targetMin + 1)) + targetMin;

    // Reward: coins proportional to action level and amount
    const rewardCoins = type === 'daily'
      ? Math.floor(action.reqLvl * 50 + target * 10)
      : Math.floor(action.reqLvl * 200 + target * 5);

    // Bonus XP reward in the quest's skill
    const rewardXp = type === 'daily'
      ? Math.floor(action.reqLvl * 20 + target * 5)
      : Math.floor(action.reqLvl * 100 + target * 10);

    // Quest verb based on skill
    let verb = 'Complete';
    if (skill === 'mining') verb = 'Mine';
    else if (skill === 'woodcutting') verb = 'Chop';
    else if (skill === 'fishing') verb = 'Fish';
    else if (skill === 'cooking') verb = 'Cook';
    else if (skill === 'smithing') verb = 'Smith';
    else if (skill === 'crafting') verb = 'Craft';
    else if (skill === 'herblore') verb = 'Brew';
    else if (skill === 'farming') verb = 'Grow';
    else if (skill === 'foraging') verb = 'Forage';
    else if (skill === 'prayer') verb = 'Bury';
    else if (skill === 'agility') verb = 'Run';
    else if (skill === 'combat') verb = 'Kill';
    else if (skill === 'thieving') verb = 'Pickpocket';

    return {
      id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      skill,
      actionId: action.id,
      actionName: action.name,
      verb,
      target,
      progress: 0,
      completed: false,
      claimed: false,
      reward: { coins: rewardCoins, xp: rewardXp, xpSkill: skill },
      generatedAt: Date.now()
    };
  }

  return null;
}

// Get the start of today (midnight UTC)
function getStartOfDayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).getTime();
}

// Get the start of this week (Monday midnight UTC)
function getStartOfWeekUTC() {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? 6 : day - 1; // days since Monday
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
  return monday.getTime();
}

export function useQuests(skills, inventory) {
  const [dailyQuests, setDailyQuests] = useState([]);
  const [weeklyQuests, setWeeklyQuests] = useState([]);
  const [clanDailyQuests, setClanDailyQuests] = useState([]);
  const [clanWeeklyQuests, setClanWeeklyQuests] = useState([]);
  const [dailyRerolls, setDailyRerolls] = useState(6);
  const [weeklyRerolls, setWeeklyRerolls] = useState(4);
  const [lastDailyReset, setLastDailyReset] = useState(null);
  const [lastWeeklyReset, setLastWeeklyReset] = useState(null);

  const hasQuestUpgrade = !!(inventory?.questUpgrade);
  const maxDailyQuests = hasQuestUpgrade ? 10 : 6;
  const maxWeeklyQuests = hasQuestUpgrade ? 6 : 4;
  const maxDailyRerolls = hasQuestUpgrade ? 10 : 6;
  const maxWeeklyRerolls = hasQuestUpgrade ? 8 : 4;

  // Expand quests when quest upgrade is purchased mid-day
  const prevHasUpgradeRef = useRef(hasQuestUpgrade);
  useEffect(() => {
    const wasUpgraded = !prevHasUpgradeRef.current && hasQuestUpgrade;
    prevHasUpgradeRef.current = hasQuestUpgrade;
    if (wasUpgraded) {
      // Expand daily quests from 6 to 10
      setDailyQuests(prev => {
        if (prev.length >= 10) return prev;
        const existingActionIds = prev.map(q => q.actionId);
        const additional = [];
        for (let i = prev.length; i < 10; i++) {
          const quest = generateQuest('daily', skills, [...existingActionIds, ...additional.map(q => q.actionId)]);
          if (quest) additional.push(quest);
        }
        return [...prev, ...additional];
      });
      // Expand weekly quests from 4 to 6
      setWeeklyQuests(prev => {
        if (prev.length >= 6) return prev;
        const existingActionIds = [...dailyQuests.map(q => q.actionId), ...prev.map(q => q.actionId)];
        const additional = [];
        for (let i = prev.length; i < 6; i++) {
          const quest = generateQuest('weekly', skills, [...existingActionIds, ...additional.map(q => q.actionId)]);
          if (quest) additional.push(quest);
        }
        return [...prev, ...additional];
      });
      // Grant extra rerolls
      setDailyRerolls(prev => Math.max(prev, 10));
      setWeeklyRerolls(prev => Math.max(prev, 8));
    }
  }, [hasQuestUpgrade, skills, dailyQuests]);

  // Generate all daily quests
  const generateDailyQuests = useCallback((clanMemberCount = 0) => {
    const quests = [];
    const existingActionIds = [];
    for (let i = 0; i < maxDailyQuests; i++) {
      const quest = generateQuest('daily', skills, existingActionIds);
      if (quest) {
        quests.push(quest);
        existingActionIds.push(quest.actionId);
      }
    }
    setDailyQuests(quests);
    setDailyRerolls(maxDailyRerolls);
    setLastDailyReset(Date.now());

    // Generate clan daily quests (mirrors player quests with multiplied targets)
    if (clanMemberCount > 0) {
      const clanQuests = quests.map(q => ({
        ...q,
        id: `clan_${q.id}`,
        target: q.target * clanMemberCount * 2,
        progress: 0,
        completed: false,
        claimed: false,
        isClan: true,
        reward: {
          coins: q.reward.coins * 3,
          clanCredits: Math.floor(q.reward.coins / 50) + 5
        }
      }));
      setClanDailyQuests(clanQuests);
    }
  }, [skills, maxDailyQuests, maxDailyRerolls]);

  // Generate all weekly quests
  const generateWeeklyQuests = useCallback((clanMemberCount = 0) => {
    const quests = [];
    const existingActionIds = dailyQuests.map(q => q.actionId); // avoid overlap with dailies
    for (let i = 0; i < maxWeeklyQuests; i++) {
      const quest = generateQuest('weekly', skills, existingActionIds);
      if (quest) {
        quests.push(quest);
        existingActionIds.push(quest.actionId);
      }
    }
    setWeeklyQuests(quests);
    setWeeklyRerolls(maxWeeklyRerolls);
    setLastWeeklyReset(Date.now());

    // Generate clan weekly quests
    if (clanMemberCount > 0) {
      const clanQuests = quests.map(q => ({
        ...q,
        id: `clan_${q.id}`,
        target: q.target * clanMemberCount * 2,
        progress: 0,
        completed: false,
        claimed: false,
        isClan: true,
        reward: {
          coins: q.reward.coins * 3,
          clanCredits: Math.floor(q.reward.coins / 100) + 10
        }
      }));
      setClanWeeklyQuests(clanQuests);
    }
  }, [skills, maxWeeklyQuests, maxWeeklyRerolls, dailyQuests]);

  // Reroll a daily quest
  const rerollDailyQuest = useCallback((index) => {
    if (dailyRerolls <= 0) return false;
    const existingActionIds = dailyQuests
      .filter((_, i) => i !== index)
      .filter(q => !q.completed) // completed quests can reappear
      .map(q => q.actionId);

    const newQuest = generateQuest('daily', skills, existingActionIds);
    if (!newQuest) return false;

    setDailyQuests(prev => {
      const updated = [...prev];
      updated[index] = newQuest;
      return updated;
    });
    setDailyRerolls(prev => prev - 1);
    return true;
  }, [dailyRerolls, dailyQuests, skills]);

  // Reroll a weekly quest
  const rerollWeeklyQuest = useCallback((index) => {
    if (weeklyRerolls <= 0) return false;
    const existingActionIds = weeklyQuests
      .filter((_, i) => i !== index)
      .filter(q => !q.completed)
      .map(q => q.actionId);

    const newQuest = generateQuest('weekly', skills, existingActionIds);
    if (!newQuest) return false;

    setWeeklyQuests(prev => {
      const updated = [...prev];
      updated[index] = newQuest;
      return updated;
    });
    setWeeklyRerolls(prev => prev - 1);
    return true;
  }, [weeklyRerolls, weeklyQuests, skills]);

  // Record quest progress for a given action
  const recordQuestProgress = useCallback((actionId, amount = 1) => {
    setDailyQuests(prev => prev.map(q => {
      if (q.actionId === actionId && !q.completed) {
        const newProgress = Math.min(q.target, q.progress + amount);
        return { ...q, progress: newProgress, completed: newProgress >= q.target };
      }
      return q;
    }));

    setWeeklyQuests(prev => prev.map(q => {
      if (q.actionId === actionId && !q.completed) {
        const newProgress = Math.min(q.target, q.progress + amount);
        return { ...q, progress: newProgress, completed: newProgress >= q.target };
      }
      return q;
    }));

    // Also track clan quest progress
    setClanDailyQuests(prev => prev.map(q => {
      if (q.actionId === actionId && !q.completed) {
        const newProgress = Math.min(q.target, q.progress + amount);
        return { ...q, progress: newProgress, completed: newProgress >= q.target };
      }
      return q;
    }));

    setClanWeeklyQuests(prev => prev.map(q => {
      if (q.actionId === actionId && !q.completed) {
        const newProgress = Math.min(q.target, q.progress + amount);
        return { ...q, progress: newProgress, completed: newProgress >= q.target };
      }
      return q;
    }));
  }, []);

  // Claim a personal quest reward
  const claimQuestReward = useCallback((questId, setInventory, addXp) => {
    let quest = dailyQuests.find(q => q.id === questId) || weeklyQuests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return false;

    // Apply rewards
    if (setInventory && quest.reward.coins) {
      setInventory(prev => ({
        ...prev,
        coins: (prev.coins || 0) + quest.reward.coins
      }));
    }
    if (addXp && quest.reward.xp && quest.reward.xpSkill) {
      addXp(quest.reward.xpSkill === 'combat' ? 'hitpoints' : quest.reward.xpSkill, quest.reward.xp);
    }

    // Mark as claimed
    const updater = q => q.id === questId ? { ...q, claimed: true } : q;
    if (quest.type === 'daily') {
      setDailyQuests(prev => prev.map(updater));
    } else {
      setWeeklyQuests(prev => prev.map(updater));
    }
    return true;
  }, [dailyQuests, weeklyQuests]);

  // Claim a clan quest reward
  const claimClanQuestReward = useCallback((questId, setClan) => {
    let quest = clanDailyQuests.find(q => q.id === questId) || clanWeeklyQuests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return false;

    // Add clan credits
    if (setClan && quest.reward.clanCredits) {
      setClan(prev => prev ? { ...prev, credits: (prev.credits || 0) + quest.reward.clanCredits } : prev);
    }

    const updater = q => q.id === questId ? { ...q, claimed: true } : q;
    if (quest.type === 'daily') {
      setClanDailyQuests(prev => prev.map(updater));
    } else {
      setClanWeeklyQuests(prev => prev.map(updater));
    }
    return true;
  }, [clanDailyQuests, clanWeeklyQuests]);

  // Check if quests need resetting (daily = new day, weekly = new week)
  const checkResets = useCallback((clanMemberCount = 0) => {
    const todayStart = getStartOfDayUTC();
    const weekStart = getStartOfWeekUTC();

    let didReset = false;

    if (!lastDailyReset || lastDailyReset < todayStart) {
      generateDailyQuests(clanMemberCount);
      didReset = true;
    }
    if (!lastWeeklyReset || lastWeeklyReset < weekStart) {
      generateWeeklyQuests(clanMemberCount);
      didReset = true;
    }

    return didReset;
  }, [lastDailyReset, lastWeeklyReset, generateDailyQuests, generateWeeklyQuests]);

  // Force-generate clan quests when joining/creating a clan mid-day
  const ensureClanQuests = useCallback((clanMemberCount) => {
    if (clanMemberCount <= 0) return;
    // Only generate if clan quests are empty but personal quests exist
    setClanDailyQuests(prev => {
      if (prev.length > 0) return prev; // Already have clan daily quests
      // Generate from existing daily quests
      const clanQuests = dailyQuests.map(q => ({
        ...q,
        id: `clan_${q.id}`,
        target: q.target * clanMemberCount * 2,
        progress: 0,
        completed: false,
        claimed: false,
        isClan: true,
        reward: {
          coins: q.reward.coins * 3,
          clanCredits: Math.floor(q.reward.coins / 50) + 5
        }
      }));
      return clanQuests;
    });
    setClanWeeklyQuests(prev => {
      if (prev.length > 0) return prev; // Already have clan weekly quests
      const clanQuests = weeklyQuests.map(q => ({
        ...q,
        id: `clan_${q.id}`,
        target: q.target * clanMemberCount * 2,
        progress: 0,
        completed: false,
        claimed: false,
        isClan: true,
        reward: {
          coins: q.reward.coins * 3,
          clanCredits: Math.floor(q.reward.coins / 100) + 10
        }
      }));
      return clanQuests;
    });
  }, [dailyQuests, weeklyQuests]);

  // Time until next reset
  const getTimeUntilDailyReset = () => {
    const now = Date.now();
    const tomorrow = getStartOfDayUTC() + 24 * 60 * 60 * 1000;
    return Math.max(0, tomorrow - now);
  };

  const getTimeUntilWeeklyReset = () => {
    const now = Date.now();
    const nextWeek = getStartOfWeekUTC() + 7 * 24 * 60 * 60 * 1000;
    return Math.max(0, nextWeek - now);
  };

  return {
    dailyQuests, weeklyQuests,
    clanDailyQuests, clanWeeklyQuests,
    dailyRerolls, weeklyRerolls,
    maxDailyRerolls, maxWeeklyRerolls,
    maxDailyQuests, maxWeeklyQuests,
    hasQuestUpgrade,
    generateDailyQuests, generateWeeklyQuests,
    ensureClanQuests,
    rerollDailyQuest, rerollWeeklyQuest,
    recordQuestProgress,
    claimQuestReward, claimClanQuestReward,
    checkResets,
    getTimeUntilDailyReset, getTimeUntilWeeklyReset,
    // Setters for save/load
    setDailyQuests, setWeeklyQuests,
    setClanDailyQuests, setClanWeeklyQuests,
    setDailyRerolls, setWeeklyRerolls,
    setLastDailyReset, setLastWeeklyReset,
    lastDailyReset, lastWeeklyReset,
    SKILL_ICONS
  };
}
