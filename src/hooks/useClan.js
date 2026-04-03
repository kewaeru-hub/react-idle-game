import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_UPGRADES = {
  skillingSpeed: { level: 0, maxLevel: 5, costPerLevel: 200, effectPerLevel: 2, label: 'Skilling Speed', description: '+2% skilling speed per level', icon: '⚡' },
  xpBoost: { level: 0, maxLevel: 5, costPerLevel: 250, effectPerLevel: 3, label: 'XP Boost', description: '+3% XP gain per level', icon: '📈' },
  potionDuration: { level: 0, maxLevel: 5, costPerLevel: 300, effectPerLevel: 5, label: 'Potion Duration', description: '+5% longer potion effects per level', icon: '🧪' },
  partyDamage: { level: 0, maxLevel: 3, costPerLevel: 500, effectPerLevel: 4, label: 'Party Damage', description: '+4% damage with 2+ clan members in party', icon: '⚔️' },
  enemyRespawn: { level: 0, maxLevel: 5, costPerLevel: 150, effectPerLevel: 3, label: 'Enemy Respawn', description: '-3% enemy death timer per level', icon: '💀' },
  vaultExpansion: { level: 0, maxLevel: 8, costPerLevel: 100, effectPerLevel: 5, label: 'Vault Expansion', description: '+5 vault slots per level (max 50)', icon: '🏦' }
};

export function useClan(userId, username) {
  const [clan, setClan] = useState(null);
  const [clanScreen, setClanScreen] = useState('overview');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentJoinRequest, setSentJoinRequest] = useState(null);
  const [clanJoinRequests, setClanJoinRequests] = useState([]);

  const userIdRef = useRef(userId);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  // Create clan for 100,000 coins
  const createClan = useCallback(async (clanName, inventory, setInventory) => {
    if (inventory.coins < 100000) {
      alert('You need 100,000 coins to create a clan!');
      return false;
    }

    if (!userId) {
      alert('You need to be logged in to create a clan!');
      return false;
    }

    try {
      // Check if user is already in a clan
      const { data: existingMember } = await supabase
        .from('clan_members')
        .select('clan_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingMember) {
        alert('You are already in a clan!');
        return false;
      }

      // Check if clan name taken
      const { data: existing } = await supabase
        .from('clans')
        .select('id')
        .ilike('name', clanName.trim())
        .maybeSingle();

      if (existing) {
        alert('A clan with this name already exists!');
        return false;
      }

      // Create clan in Supabase
      const { data: newClanData, error: createErr } = await supabase
        .from('clans')
        .insert({
          name: clanName.trim(),
          leader_id: userId,
          leader_name: username || 'Unknown',
          level: 1,
          member_count: 1,
          recruitment_open: true,
          recruitment_message: 'Welcome to our clan! We are looking for active players.'
        })
        .select()
        .single();

      if (createErr) {
        console.error('[Clan] Failed to create:', createErr);
        alert('Failed to create clan. Please try again.');
        return false;
      }

      // Add self as leader in clan_members
      await supabase.from('clan_members').insert({
        clan_id: newClanData.id,
        user_id: userId,
        username: username || 'Unknown',
        rank: 'Leader'
      });

      // Create local clan state
      const newClan = {
        id: newClanData.id,
        name: clanName.trim(),
        level: 1,
        credits: 0,
        createdAt: Date.now(),
        members: [
          { name: 'You', rank: 'Leader', activity: 'Idle', activityStart: Date.now(), online: true }
        ],
        vault: [],
        vaultSlots: 10,
        quests: [],
        upgrades: JSON.parse(JSON.stringify(DEFAULT_UPGRADES)),
        recruitment: { open: true, message: 'Welcome to our clan! We are looking for active players.' },
        joinRequests: []
      };

      setClan(newClan);
      setInventory(prev => ({ ...prev, coins: prev.coins - 100000 }));
      setClanScreen('overview');
      return true;
    } catch (err) {
      console.error('[Clan] Create error:', err);
      alert('Failed to create clan. Please try again.');
      return false;
    }
  }, [userId, username]);

  // Join clan by name (looks up real clans in Supabase)
  const joinClan = useCallback(async (clanName, playerSkills) => {
    if (!userId) {
      alert('You need to be logged in to join a clan!');
      return false;
    }

    try {
      // Check if already in a clan
      const { data: existingMember } = await supabase
        .from('clan_members')
        .select('clan_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingMember) {
        alert('You are already in a clan! Leave your current clan first.');
        return false;
      }

      // Look up clan in Supabase
      const { data: clanData, error } = await supabase
        .from('clans')
        .select('*')
        .ilike('name', clanName.trim())
        .maybeSingle();

      if (!clanData || error) {
        alert('Clan not found!');
        return false;
      }

      if (!clanData.recruitment_open) {
        alert('This clan is not accepting new members right now.');
        return false;
      }

      if (clanData.member_count >= clanData.max_members) {
        alert('This clan is full!');
        return false;
      }

      // Add self as member in Supabase
      const { error: joinErr } = await supabase
        .from('clan_members')
        .insert({
          clan_id: clanData.id,
          user_id: userId,
          username: username || 'Unknown',
          rank: 'Recruit'
        });

      if (joinErr) {
        console.error('[Clan] Failed to join:', joinErr);
        if (joinErr.code === '23505') {
          alert('You are already in a clan!');
        } else {
          alert('Failed to join clan. Please try again.');
        }
        return false;
      }

      // Fetch real members
      const { data: members } = await supabase
        .from('clan_members')
        .select('*')
        .eq('clan_id', clanData.id)
        .order('joined_at', { ascending: true });

      const memberList = (members || []).map(m => ({
        name: m.user_id === userId ? 'You' : m.username,
        rank: m.rank,
        activity: 'Idle',
        activityStart: Date.now(),
        online: m.user_id === userId,
        supabaseUserId: m.user_id
      }));

      // Put "You" first
      const youIdx = memberList.findIndex(m => m.name === 'You');
      if (youIdx > 0) {
        const [you] = memberList.splice(youIdx, 1);
        memberList.unshift(you);
      }

      // Create local clan state
      const localClan = {
        id: clanData.id,
        name: clanData.name,
        level: clanData.level || 1,
        credits: 0,
        createdAt: new Date(clanData.created_at).getTime(),
        members: memberList,
        vault: [],
        vaultSlots: 10,
        quests: [],
        upgrades: JSON.parse(JSON.stringify(DEFAULT_UPGRADES)),
        recruitment: { open: clanData.recruitment_open, message: clanData.recruitment_message },
        joinRequests: []
      };

      setClan(localClan);
      setSentJoinRequest(null);
      setClanScreen('overview');
      return true;
    } catch (err) {
      console.error('[Clan] Join error:', err);
      alert('Failed to join clan. Please try again.');
      return false;
    }
  }, [userId, username]);

  // Send a join request to a clan
  const requestJoinClan = useCallback(async (clanName, playerName, playerStats) => {
    if (!userId) return false;
    if (sentJoinRequest) {
      alert('You already have a pending join request!');
      return false;
    }

    try {
      // Find the clan
      const { data: clanData } = await supabase
        .from('clans')
        .select('id, name')
        .ilike('name', clanName.trim())
        .maybeSingle();

      if (!clanData) {
        alert('Clan not found!');
        return false;
      }

      const { error } = await supabase
        .from('clan_join_requests')
        .insert({
          clan_id: clanData.id,
          user_id: userId,
          username: playerName || username || 'Unknown',
          total_level: playerStats?.totalLevel || 1,
          combat_level: playerStats?.combatLevel || 1,
          message: playerStats?.message || ''
        });

      if (error) {
        if (error.code === '23505') {
          alert('You already have a pending request to this clan!');
        } else {
          alert('Failed to send join request.');
        }
        return false;
      }

      setSentJoinRequest({ clanName: clanData.name, sentAt: Date.now() });
      alert(`Join request sent to ${clanData.name}! The leader will review your application.`);
      return true;
    } catch (err) {
      console.error('[Clan] Request error:', err);
      return false;
    }
  }, [userId, username, sentJoinRequest]);

  // Review a join request (Leader/Officer) — accept or reject
  const reviewJoinRequest = useCallback(async (requestId, accept) => {
    if (!clan?.id || !userId) return;

    try {
      const { data: request } = await supabase
        .from('clan_join_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (!request) return;

      if (accept) {
        // Add to clan_members
        const { error: addErr } = await supabase.from('clan_members').insert({
          clan_id: clan.id,
          user_id: request.user_id,
          username: request.username,
          rank: 'Recruit'
        });

        if (!addErr) {
          // Add to local clan state
          setClan(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              members: [...prev.members, {
                name: request.username,
                rank: 'Recruit',
                activity: 'Idle',
                activityStart: Date.now(),
                online: false,
                supabaseUserId: request.user_id
              }]
            };
          });
        }
      }

      // Delete the request
      await supabase
        .from('clan_join_requests')
        .delete()
        .eq('id', requestId);

      // Refresh join requests
      setClanJoinRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('[Clan] Review request error:', err);
    }
  }, [clan, userId]);

  // Load join requests from Supabase
  const loadJoinRequests = useCallback(async () => {
    if (!clan?.id) return;
    try {
      const { data, error } = await supabase
        .from('clan_join_requests')
        .select('*')
        .eq('clan_id', clan.id)
        .order('requested_at', { ascending: false });

      if (!error && data) {
        setClanJoinRequests(data);
      }
    } catch (err) {
      console.error('[Clan] Failed to load join requests:', err);
    }
  }, [clan?.id]);

  // Get browsable clans from Supabase
  const getBrowseClans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('clans')
        .select('*')
        .order('member_count', { ascending: false })
        .limit(30);

      if (error || !data) return [];

      return data.map(c => ({
        id: c.id,
        name: c.name,
        level: c.level,
        memberCount: c.member_count,
        maxMembers: c.max_members,
        recruitment: { open: c.recruitment_open, message: c.recruitment_message },
        leader: c.leader_name,
        totalLevel: 0,
        avgCombatLevel: 0
      }));
    } catch (err) {
      console.error('[Clan] Browse error:', err);
      return [];
    }
  }, []);

  // Leave clan
  const leaveClan = useCallback(async () => {
    if (!window.confirm('Are you sure you want to leave this clan?')) return;

    if (userId && clan?.id) {
      try {
        // Remove from Supabase
        await supabase
          .from('clan_members')
          .delete()
          .eq('user_id', userId);

        // If last member, delete the clan
        const { data: remaining } = await supabase
          .from('clan_members')
          .select('id')
          .eq('clan_id', clan.id);

        if (!remaining || remaining.length === 0) {
          await supabase.from('clans').delete().eq('id', clan.id);
        }
      } catch (err) {
        console.error('[Clan] Leave error:', err);
      }
    }

    setClan(null);
    setClanScreen('overview');
  }, [userId, clan]);

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
  const updateRecruitment = useCallback(async (open, message) => {
    setClan(prev => {
      if (!prev) return prev;
      return { ...prev, recruitment: { open, message } };
    });

    // Also update in Supabase
    if (clan?.id) {
      try {
        await supabase
          .from('clans')
          .update({ recruitment_open: open, recruitment_message: message })
          .eq('id', clan.id);
      } catch (err) {
        console.error('[Clan] Update recruitment error:', err);
      }
    }
  }, [clan?.id]);

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
    setSentJoinRequest,
    clanJoinRequests,
    loadJoinRequests
  };
}
