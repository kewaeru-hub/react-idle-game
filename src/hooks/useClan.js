import { useState, useCallback } from 'react';

// Fake clans for browsing
const BROWSE_CLANS = [
  {
    name: 'Warriors Guild',
    level: 8,
    memberCount: 5,
    maxMembers: 20,
    recruitment: { open: true, message: 'Warriors Guild — Active clan seeking brave adventurers!' },
    leader: 'IronMike',
    totalLevel: 2340,
    avgCombatLevel: 72
  },
  {
    name: 'Shadow Legends',
    level: 12,
    memberCount: 14,
    maxMembers: 20,
    recruitment: { open: true, message: 'Top 10 clan looking for skilled players! Min combat level 50.' },
    leader: 'DarkBlade',
    totalLevel: 5120,
    avgCombatLevel: 95
  },
  {
    name: 'Noob Nation',
    level: 3,
    memberCount: 8,
    maxMembers: 20,
    recruitment: { open: true, message: 'Friendly clan for beginners! No requirements, just have fun!' },
    leader: 'NewbKing',
    totalLevel: 890,
    avgCombatLevel: 25
  },
  {
    name: 'Iron Academy',
    level: 6,
    memberCount: 11,
    maxMembers: 20,
    recruitment: { open: true, message: 'Ironman-focused clan. We teach efficient skilling methods.' },
    leader: 'FeFeGuy',
    totalLevel: 3200,
    avgCombatLevel: 58
  },
  {
    name: 'Lava Runners',
    level: 15,
    memberCount: 18,
    maxMembers: 20,
    recruitment: { open: false, message: 'Invite only — must have completed Lava Cave.' },
    leader: 'HotStep',
    totalLevel: 7800,
    avgCombatLevel: 110
  }
];

export function useClan() {
  const [clan, setClan] = useState(null);
  const [clanScreen, setClanScreen] = useState('overview');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentJoinRequest, setSentJoinRequest] = useState(null); // Track if player has a pending request

  // Create clan for 100,000 coins
  const createClan = useCallback((clanName, inventory, setInventory) => {
    if (inventory.coins < 100000) {
      alert('You need 100,000 coins to create a clan!');
      return false;
    }

    const newClan = {
      name: clanName,
      level: 1,
      credits: 0,
      createdAt: Date.now(),
      members: [
        { name: 'You', rank: 'Leader', activity: 'Idle', activityStart: Date.now(), online: true }
      ],
      vault: [],
      vaultSlots: 10,
      quests: [
        { id: 'q1', title: 'Collective Mining', description: 'Mine 500 ores as a clan', target: 500, progress: 0, reward: 50, claimed: false },
        { id: 'q2', title: 'Slay Together', description: 'Defeat 200 enemies as a clan', target: 200, progress: 0, reward: 75, claimed: false },
        { id: 'q3', title: 'Gold Rush', description: 'Earn 50,000 coins collectively', target: 50000, progress: 0, reward: 100, claimed: false },
        { id: 'q4', title: 'Skill Grinders', description: 'Gain 10,000 total XP as a clan', target: 10000, progress: 0, reward: 60, claimed: false },
        { id: 'q5', title: 'Lava Conquerors', description: 'Complete 3 Lava Cave runs', target: 3, progress: 0, reward: 200, claimed: false }
      ],
      upgrades: {
        skillingSpeed: { level: 0, maxLevel: 5, costPerLevel: 200, effectPerLevel: 2, label: 'Skilling Speed', description: '+2% skilling speed per level', icon: '⚡' },
        xpBoost: { level: 0, maxLevel: 5, costPerLevel: 250, effectPerLevel: 3, label: 'XP Boost', description: '+3% XP gain per level', icon: '📈' },
        potionDuration: { level: 0, maxLevel: 5, costPerLevel: 300, effectPerLevel: 5, label: 'Potion Duration', description: '+5% longer potion effects per level', icon: '🧪' },
        partyDamage: { level: 0, maxLevel: 3, costPerLevel: 500, effectPerLevel: 4, label: 'Party Damage', description: '+4% damage with 2+ clan members in party', icon: '⚔️' },
        enemyRespawn: { level: 0, maxLevel: 5, costPerLevel: 150, effectPerLevel: 3, label: 'Enemy Respawn', description: '-3% enemy death timer per level', icon: '💀' },
        vaultExpansion: { level: 0, maxLevel: 8, costPerLevel: 100, effectPerLevel: 5, label: 'Vault Expansion', description: '+5 vault slots per level (max 50)', icon: '🏦' }
      },
      recruitment: { open: true, message: 'Welcome to our clan! We are looking for active players.' },
      joinRequests: [
        { playerName: 'RuneNewbie', totalLevel: 45, combatLevel: 12, requestedAt: Date.now() - 3600000, message: 'Hey, looking for an active clan to learn with!' },
        { playerName: 'SwordMaster', totalLevel: 320, combatLevel: 68, requestedAt: Date.now() - 7200000, message: 'Experienced player, 8h+ daily playtime.' }
      ]
    };

    setClan(newClan);
    setInventory(prev => ({ ...prev, coins: prev.coins - 100000 }));
    setClanScreen('overview');
    return true;
  }, []);

  // Join clan by name (now supports browsing — accepts open clans or sends request)
  const joinClan = useCallback((clanName, playerSkills) => {
    const browseClan = BROWSE_CLANS.find(c => c.name.toLowerCase() === clanName.toLowerCase());
    if (!browseClan) {
      alert('Clan not found!');
      return false;
    }

    if (!browseClan.recruitment.open) {
      alert('This clan is not accepting new members right now.');
      return false;
    }

    if (browseClan.memberCount >= browseClan.maxMembers) {
      alert('This clan is full!');
      return false;
    }

    // Simulate joining — create the clan locally
    const fakeMembers = [];
    if (clanName.toLowerCase() === 'warriors guild') {
      fakeMembers.push(
        { name: 'IronMike', rank: 'Officer', activity: 'Mining', activityStart: Date.now() - 300000, online: true },
        { name: 'xX_Slayer_Xx', rank: 'Member', activity: 'Combat', activityStart: Date.now() - 120000, online: true },
        { name: 'SkillQueen', rank: 'Member', activity: 'Woodcutting', activityStart: Date.now() - 600000, online: false },
        { name: 'NoobMaster69', rank: 'Recruit', activity: 'Idle', activityStart: Date.now() - 60000, online: true }
      );
    } else {
      // Generate some fake members based on clan size
      const fakeNames = ['Aragon', 'Zelda99', 'PvPGod', 'ChillVibes', 'RuneKnight', 'MageX', 'BowMaster', 'TankDude'];
      for (let i = 0; i < Math.min(browseClan.memberCount - 1, fakeNames.length); i++) {
        fakeMembers.push({
          name: fakeNames[i],
          rank: i === 0 ? 'Officer' : 'Member',
          activity: ['Mining', 'Combat', 'Fishing', 'Idle', 'Woodcutting'][Math.floor(Math.random() * 5)],
          activityStart: Date.now() - Math.floor(Math.random() * 600000),
          online: Math.random() > 0.4
        });
      }
    }

    const newClan = {
      name: browseClan.name,
      level: browseClan.level,
      credits: clanName.toLowerCase() === 'warriors guild' ? 2450 : Math.floor(browseClan.level * 200),
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      members: [
        { name: 'You', rank: 'Recruit', activity: 'Idle', activityStart: Date.now(), online: true },
        ...fakeMembers
      ],
      vault: clanName.toLowerCase() === 'warriors guild' ? [
        { id: 'bronze_scimitar', name: 'Bronze Scimitar', amount: 5 },
        { id: 'raw_shrimp', name: 'Raw Shrimp', amount: 127 },
        { id: 'prayer_potion', name: 'Prayer Potion', amount: 8 }
      ] : [],
      vaultSlots: 10 + browseClan.level,
      quests: [
        { id: 'q1', title: 'Collective Mining', description: 'Mine 500 ores as a clan', target: 500, progress: Math.floor(Math.random() * 500), reward: 50, claimed: false },
        { id: 'q2', title: 'Slay Together', description: 'Defeat 200 enemies as a clan', target: 200, progress: Math.floor(Math.random() * 200), reward: 75, claimed: false },
        { id: 'q3', title: 'Gold Rush', description: 'Earn 50,000 coins collectively', target: 50000, progress: Math.floor(Math.random() * 50000), reward: 100, claimed: false },
        { id: 'q4', title: 'Skill Grinders', description: 'Gain 10,000 total XP as a clan', target: 10000, progress: Math.floor(Math.random() * 10000), reward: 60, claimed: false },
        { id: 'q5', title: 'Lava Conquerors', description: 'Complete 3 Lava Cave runs', target: 3, progress: Math.floor(Math.random() * 3), reward: 200, claimed: false }
      ],
      upgrades: {
        skillingSpeed: { level: Math.min(5, Math.floor(browseClan.level / 3)), maxLevel: 5, costPerLevel: 200, effectPerLevel: 2, label: 'Skilling Speed', description: '+2% skilling speed per level', icon: '⚡' },
        xpBoost: { level: Math.min(5, Math.floor(browseClan.level / 4)), maxLevel: 5, costPerLevel: 250, effectPerLevel: 3, label: 'XP Boost', description: '+3% XP gain per level', icon: '📈' },
        potionDuration: { level: 0, maxLevel: 5, costPerLevel: 300, effectPerLevel: 5, label: 'Potion Duration', description: '+5% longer potion effects per level', icon: '🧪' },
        partyDamage: { level: 0, maxLevel: 3, costPerLevel: 500, effectPerLevel: 4, label: 'Party Damage', description: '+4% damage with 2+ clan members in party', icon: '⚔️' },
        enemyRespawn: { level: Math.min(5, Math.floor(browseClan.level / 3)), maxLevel: 5, costPerLevel: 150, effectPerLevel: 3, label: 'Enemy Respawn', description: '-3% enemy death timer per level', icon: '💀' },
        vaultExpansion: { level: Math.min(8, Math.floor(browseClan.level / 2)), maxLevel: 8, costPerLevel: 100, effectPerLevel: 5, label: 'Vault Expansion', description: '+5 vault slots per level (max 50)', icon: '🏦' }
      },
      recruitment: browseClan.recruitment,
      joinRequests: []
    };

    setClan(newClan);
    setSentJoinRequest(null);
    setClanScreen('overview');
    return true;
  }, []);

  // Send a join request to a clan (for clans that require approval)
  const requestJoinClan = useCallback((clanName, playerName, playerStats) => {
    if (sentJoinRequest) {
      alert('You already have a pending join request!');
      return false;
    }
    const browseClan = BROWSE_CLANS.find(c => c.name.toLowerCase() === clanName.toLowerCase());
    if (!browseClan) {
      alert('Clan not found!');
      return false;
    }
    setSentJoinRequest({
      clanName: browseClan.name,
      sentAt: Date.now(),
      playerName: playerName || 'You',
      playerStats
    });
    alert(`Join request sent to ${browseClan.name}! The leader will review your application.`);
    return true;
  }, [sentJoinRequest]);

  // Review a join request (Leader only) — accept or reject
  const reviewJoinRequest = useCallback((requestIndex, accept) => {
    setClan(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      const requests = [...(updated.joinRequests || [])];
      const request = requests[requestIndex];
      if (!request) return prev;

      if (accept) {
        // Add the player as a Recruit
        updated.members = [...updated.members, {
          name: request.playerName,
          rank: 'Recruit',
          activity: 'Idle',
          activityStart: Date.now(),
          online: Math.random() > 0.5
        }];
      }

      requests.splice(requestIndex, 1);
      updated.joinRequests = requests;
      return updated;
    });
  }, []);

  // Get browsable clans
  const getBrowseClans = useCallback(() => {
    return BROWSE_CLANS;
  }, []);

  // Leave clan
  const leaveClan = useCallback(() => {
    if (window.confirm('Are you sure you want to leave this clan?')) {
      setClan(null);
      setClanScreen('overview');
    }
  }, []);

  // Promote member (Recruit → Member → Officer → Leader)
  const promoteMember = useCallback((memberIndex) => {
    setClan(prev => {
      if (!prev || memberIndex === 0) return prev; // Can't promote yourself as leader
      const rankHierarchy = ['Recruit', 'Member', 'Officer', 'Leader'];
      const member = prev.members[memberIndex];
      const currentIndex = rankHierarchy.indexOf(member.rank);
      
      if (currentIndex >= rankHierarchy.length - 1) return prev;
      
      return {
        ...prev,
        members: prev.members.map((m, i) =>
          i === memberIndex ? { ...m, rank: rankHierarchy[currentIndex + 1] } : m
        )
      };
    });
  }, []);

  // Demote member (opposite of promote)
  const demoteMember = useCallback((memberIndex) => {
    setClan(prev => {
      if (!prev || memberIndex === 0) return prev; // Can't demote yourself as leader
      const rankHierarchy = ['Recruit', 'Member', 'Officer', 'Leader'];
      const member = prev.members[memberIndex];
      const currentIndex = rankHierarchy.indexOf(member.rank);
      
      if (currentIndex <= 0) return prev;
      
      return {
        ...prev,
        members: prev.members.map((m, i) =>
          i === memberIndex ? { ...m, rank: rankHierarchy[currentIndex - 1] } : m
        )
      };
    });
  }, []);

  // Kick member
  const kickMember = useCallback((memberIndex) => {
    if (memberIndex === 0) {
      alert('You cannot kick yourself!');
      return;
    }

    setClan(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        members: prev.members.filter((_, i) => i !== memberIndex)
      };
    });
  }, []);

  // Deposit item to vault
  const depositToVault = useCallback((itemId, amount, inventory, setInventory) => {
    if (amount <= 0) return false;

    const itemCount = inventory[itemId] || 0;
    if (itemCount < amount) {
      alert('You do not have enough of this item!');
      return false;
    }

    console.log(`[DEPOSIT] Depositing ${amount}x ${itemId}`);

    setClan(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      
      // Find existing item in vault or create new
      const existingItem = updated.vault.find(v => v.id === itemId);
      if (existingItem) {
        console.log(`[DEPOSIT] Item exists: ${existingItem.amount} → ${existingItem.amount + amount}`);
        existingItem.amount += amount;
      } else {
        // Try to find item name from common items (fallback)
        const itemNames = {
          raw_shrimp: 'Raw Shrimp',
          cooked_shrimp: 'Cooked Shrimp',
          bronze_scimitar: 'Bronze Scimitar',
          bronze_bow: 'Bronze Bow',
          bronze_staff: 'Bronze Staff',
          prayer_potion: 'Prayer Potion',
          bones: 'Bones',
          bronze_bar: 'Bronze Bar'
        };
        console.log(`[DEPOSIT] Creating new item with ${amount}`);
        updated.vault.push({
          id: itemId,
          name: itemNames[itemId] || itemId.replace(/_/g, ' '),
          amount: amount
        });
      }
      
      return updated;
    });

    console.log(`[DEPOSIT] Inventory: ${itemCount} → ${itemCount - amount}`);
    setInventory(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) - amount
    }));

    console.log(`[DEPOSIT] Done!`);
    return true;
  }, []);

  // Withdraw item from vault (only if rank permits)
  const withdrawFromVault = useCallback((itemId, amount, inventory, setInventory) => {
    setClan(prev => {
      if (!prev) return prev;

      // Check if player rank permits (Leader/Officer only)
      const playerMember = prev.members[0]; // "You" is always index 0
      if (!['Leader', 'Officer'].includes(playerMember?.rank)) {
        alert('Your rank does not permit vault withdrawals!');
        return prev;
      }

      const vaultItem = prev.vault.find(v => v.id === itemId);
      if (!vaultItem || vaultItem.amount < amount) {
        alert('Not enough items in vault!');
        return prev;
      }

      const updated = { ...prev };
      const item = updated.vault.find(v => v.id === itemId);
      
      if (item) {
        item.amount -= amount;
        if (item.amount <= 0) {
          updated.vault = updated.vault.filter(v => v.id !== itemId);
        }
      }
      
      return updated;
    });

    setInventory(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + amount
    }));

    return true;
  }, []);

  // Claim quest reward
  const claimQuestReward = useCallback((questId) => {
    setClan(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      const quest = updated.quests.find(q => q.id === questId);
      
      if (quest && quest.progress >= quest.target && !quest.claimed) {
        quest.claimed = true;
        updated.credits += quest.reward;
      }
      
      return updated;
    });
  }, []);

  // Upgrade clan house (placeholder)
  const upgradeClanHouse = useCallback((upgradeId) => {
    alert('🏗️ Clan House upgrades coming soon!');
  }, []);

  // Purchase upgrade with clan credits
  const purchaseUpgrade = useCallback((upgradeKey) => {
    setClan(prev => {
      if (!prev) return prev;
      const upgrade = prev.upgrades[upgradeKey];
      if (!upgrade || upgrade.level >= upgrade.maxLevel) {
        alert('This upgrade is already at max level!');
        return prev;
      }
      const cost = upgrade.costPerLevel * (upgrade.level + 1);
      if (prev.credits < cost) {
        alert(`Not enough credits! Need ${cost} 💎`);
        return prev;
      }
      const updated = { ...prev, credits: prev.credits - cost };
      updated.upgrades = { ...updated.upgrades };
      updated.upgrades[upgradeKey] = { ...upgrade, level: upgrade.level + 1 };
      
      // If vault expansion, increase vaultSlots
      if (upgradeKey === 'vaultExpansion') {
        updated.vaultSlots = Math.min(50, updated.vaultSlots + upgrade.effectPerLevel);
      }
      
      return updated;
    });
  }, []);

  // Invite a member to clan
  const inviteMember = useCallback((playerName) => {
    if (!playerName.trim()) {
      alert('Please enter a player name!');
      return false;
    }
    setClan(prev => {
      if (!prev) return prev;
      // Check if player already in clan
      if (prev.members.some(m => m.name.toLowerCase() === playerName.toLowerCase())) {
        alert('This player is already in the clan!');
        return prev;
      }
      return {
        ...prev,
        members: [...prev.members, {
          name: playerName,
          rank: 'Recruit',
          activity: 'Idle',
          activityStart: Date.now(),
          online: Math.random() > 0.5
        }]
      };
    });
    return true;
  }, []);

  // Update recruitment settings
  const updateRecruitment = useCallback((open, message) => {
    setClan(prev => {
      if (!prev) return prev;
      return { ...prev, recruitment: { open, message } };
    });
  }, []);

  return {
    clan,
    setClan,
    clanScreen,
    setClanScreen,
    createClan,
    joinClan,
    leaveClan,
    promoteMember,
    demoteMember,
    kickMember,
    depositToVault,
    withdrawFromVault,
    claimQuestReward,
    upgradeClanHouse,
    purchaseUpgrade,
    inviteMember,
    updateRecruitment,
    getBrowseClans,
    requestJoinClan,
    reviewJoinRequest,
    pendingRequests,
    setPendingRequests,
    sentJoinRequest,
    setSentJoinRequest
  };
}
