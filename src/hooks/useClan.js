import { useState, useCallback } from 'react';

export function useClan() {
  const [clan, setClan] = useState(null);
  const [clanScreen, setClanScreen] = useState('overview');

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
      recruitment: { open: true, message: 'Welcome to our clan! We are looking for active players.' }
    };

    setClan(newClan);
    setInventory(prev => ({ ...prev, coins: prev.coins - 100000 }));
    setClanScreen('overview');
    return true;
  }, []);

  // Join clan by name (hardcoded: only "Warriors Guild" is joinable)
  const joinClan = useCallback((clanName) => {
    if (clanName.toLowerCase() !== 'warriors guild') {
      alert('Clan not found!');
      return false;
    }

    const fakeMembers = [
      { name: 'IronMike', rank: 'Officer', activity: 'Mining', activityStart: Date.now() - 300000, online: true },
      { name: 'xX_Slayer_Xx', rank: 'Member', activity: 'Combat', activityStart: Date.now() - 120000, online: true },
      { name: 'SkillQueen', rank: 'Member', activity: 'Woodcutting', activityStart: Date.now() - 600000, online: false },
      { name: 'NoobMaster69', rank: 'Recruit', activity: 'Idle', activityStart: Date.now() - 60000, online: true },
    ];

    const newClan = {
      name: 'Warriors Guild',
      level: 8,
      credits: 2450,
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
      members: [
        { name: 'You', rank: 'Recruit', activity: 'Idle', activityStart: Date.now(), online: true },
        ...fakeMembers
      ],
      vault: [
        { id: 'bronze_scimitar', name: 'Bronze Scimitar', amount: 5 },
        { id: 'raw_shrimp', name: 'Raw Shrimp', amount: 127 },
        { id: 'prayer_potion', name: 'Prayer Potion', amount: 8 }
      ],
      vaultSlots: 20,
      quests: [
        { id: 'q1', title: 'Collective Mining', description: 'Mine 500 ores as a clan', target: 500, progress: 342, reward: 50, claimed: false },
        { id: 'q2', title: 'Slay Together', description: 'Defeat 200 enemies as a clan', target: 200, progress: 156, reward: 75, claimed: false },
        { id: 'q3', title: 'Gold Rush', description: 'Earn 50,000 coins collectively', target: 50000, progress: 47320, reward: 100, claimed: false },
        { id: 'q4', title: 'Skill Grinders', description: 'Gain 10,000 total XP as a clan', target: 10000, progress: 10000, reward: 60, claimed: true },
        { id: 'q5', title: 'Lava Conquerors', description: 'Complete 3 Lava Cave runs', target: 3, progress: 1, reward: 200, claimed: false }
      ],
      upgrades: {
        skillingSpeed: { level: 2, maxLevel: 5, costPerLevel: 200, effectPerLevel: 2, label: 'Skilling Speed', description: '+2% skilling speed per level', icon: '⚡' },
        xpBoost: { level: 1, maxLevel: 5, costPerLevel: 250, effectPerLevel: 3, label: 'XP Boost', description: '+3% XP gain per level', icon: '📈' },
        potionDuration: { level: 0, maxLevel: 5, costPerLevel: 300, effectPerLevel: 5, label: 'Potion Duration', description: '+5% longer potion effects per level', icon: '🧪' },
        partyDamage: { level: 0, maxLevel: 3, costPerLevel: 500, effectPerLevel: 4, label: 'Party Damage', description: '+4% damage with 2+ clan members in party', icon: '⚔️' },
        enemyRespawn: { level: 1, maxLevel: 5, costPerLevel: 150, effectPerLevel: 3, label: 'Enemy Respawn', description: '-3% enemy death timer per level', icon: '💀' },
        vaultExpansion: { level: 2, maxLevel: 8, costPerLevel: 100, effectPerLevel: 5, label: 'Vault Expansion', description: '+5 vault slots per level (max 50)', icon: '🏦' }
      },
      recruitment: { open: true, message: 'Warriors Guild — Active clan seeking brave adventurers!' }
    };

    setClan(newClan);
    setClanScreen('overview');
    return true;
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
      const updated = { ...prev };
      const member = updated.members[memberIndex];
      
      const rankHierarchy = ['Recruit', 'Member', 'Officer', 'Leader'];
      const currentIndex = rankHierarchy.indexOf(member.rank);
      
      if (currentIndex < rankHierarchy.length - 1) {
        member.rank = rankHierarchy[currentIndex + 1];
      }
      
      return updated;
    });
  }, []);

  // Demote member (opposite of promote)
  const demoteMember = useCallback((memberIndex) => {
    setClan(prev => {
      if (!prev || memberIndex === 0) return prev; // Can't demote yourself as leader
      const updated = { ...prev };
      const member = updated.members[memberIndex];
      
      const rankHierarchy = ['Recruit', 'Member', 'Officer', 'Leader'];
      const currentIndex = rankHierarchy.indexOf(member.rank);
      
      if (currentIndex > 0) {
        member.rank = rankHierarchy[currentIndex - 1];
      }
      
      return updated;
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
    updateRecruitment
  };
}
