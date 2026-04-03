import React, { useState, useEffect } from 'react';
import { formatDuration } from '../utils/gameHelpers';

export default function ClanView({
  clan,
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
  inventory,
  setInventory,
  ITEM_IMAGES,
  skills,
  quests,
  setClan,
  addXp,
  getBrowseClans,
  requestJoinClan,
  reviewJoinRequest,
  user,
  clanJoinRequests,
  loadJoinRequests
}) {
  const [createClanName, setCreateClanName] = useState('');
  const [joinClanName, setJoinClanName] = useState('');
  const [showBrowsePopup, setShowBrowsePopup] = useState(false);
  const [browseClansList, setBrowseClansList] = useState([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [invitePlayerName, setInvitePlayerName] = useState('');
  const [recruitmentMessage, setRecruitmentMessage] = useState(clan?.recruitment?.message || 'Welcome to our clan!');
  
  // Vault deposit modal
  const [selectedVaultItem, setSelectedVaultItem] = useState(null);
  const [vaultDepositQuantity, setVaultDepositQuantity] = useState(1);

  // Load join requests when manage tab is opened
  useEffect(() => {
    if (clanScreen === 'manage' && loadJoinRequests) {
      loadJoinRequests();
    }
  }, [clanScreen, loadJoinRequests]);

  // Handle create clan
  const handleCreateClan = async () => {
    if (!createClanName.trim()) {
      alert('Please enter a clan name!');
      return;
    }
    const result = await createClan(createClanName, inventory, setInventory);
    if (result) {
      setCreateClanName('');
    }
  };

  // Handle join clan by name
  const handleJoinClan = async () => {
    if (!joinClanName.trim()) {
      alert('Please enter a clan name!');
      return;
    }
    setJoinLoading(true);
    const result = await joinClan(joinClanName, skills);
    if (result) {
      setJoinClanName('');
    }
    setJoinLoading(false);
  };

  // Handle opening browse popup
  const handleOpenBrowse = async () => {
    setShowBrowsePopup(true);
    setBrowseLoading(true);
    const clans = await getBrowseClans();
    setBrowseClansList(clans || []);
    setBrowseLoading(false);
  };

  // Format item name from id
  const formatItemName = (id) => {
    const names = {
      raw_shrimp: 'Raw Shrimp',
      cooked_shrimp: 'Cooked Shrimp',
      bones: 'Bones',
      bronze_scimitar: 'Bronze Scimitar',
      bronze_bow: 'Bronze Bow',
      bronze_staff: 'Bronze Staff',
      prayer_potion: 'Prayer Potion'
    };
    return names[id] || id.replace(/_/g, ' ').charAt(0).toUpperCase() + id.slice(1);
  };

  const playerMember = clan ? clan.members[0] : null;

  // === NO CLAN VIEW ===
  if (!clan) {
    return (
      <div className="card" style={{ padding: '40px', width: '100%' }}>
        <div className="clan-no-clan">
          <h1 style={{ marginBottom: '10px' }}>⚔️ Clan System</h1>
          <p style={{ color: '#8899aa', marginBottom: '30px' }}>
            Team up with other players, complete challenges, and unlock exclusive rewards
          </p>

          {/* Benefits Grid */}
          <div className="clan-benefits-grid">
            <div className="clan-benefit-card">
              <div className="clan-benefit-icon">👥</div>
              <div className="clan-benefit-title">Clan Members</div>
              <div className="clan-benefit-desc">Team up with other players. See who's online and what they're doing.</div>
            </div>

            <div className="clan-benefit-card">
              <div className="clan-benefit-icon">🏆</div>
              <div className="clan-benefit-title">Clan Quests</div>
              <div className="clan-benefit-desc">Complete group challenges to earn Clan Credits for upgrades.</div>
            </div>

            <div className="clan-benefit-card">
              <div className="clan-benefit-icon">🏦</div>
              <div className="clan-benefit-title">Clan Vault</div>
              <div className="clan-benefit-desc">Shared storage — deposit & withdraw items with your clanmates.</div>
            </div>

            <div className="clan-benefit-card">
              <div className="clan-benefit-icon">🏠</div>
              <div className="clan-benefit-title">Clan House</div>
              <div className="clan-benefit-desc">Upgrade your clan's headquarters for exclusive bonuses. (Coming Soon)</div>
            </div>

            <div className="clan-benefit-card">
              <div className="clan-benefit-icon">📊</div>
              <div className="clan-benefit-title">Leaderboards</div>
              <div className="clan-benefit-desc">Compete with other clans for glory and rewards. (Coming Soon)</div>
            </div>

            <div className="clan-benefit-card">
              <div className="clan-benefit-icon">⚡</div>
              <div className="clan-benefit-title">Clan Perks</div>
              <div className="clan-benefit-desc">Unlock XP boosts, drop bonuses, and more. (Coming Soon)</div>
            </div>
          </div>

          {/* Action Boxes */}
          <div className="clan-actions">
            <div className="clan-action-box">
              <h3 style={{ marginTop: 0, color: '#66FCF1' }}>Create Clan</h3>
              <p style={{ fontSize: '0.85rem', color: '#8899aa', marginBottom: '12px' }}>
                Found your own clan for <span style={{ color: '#FFD700' }}>💰 100,000</span> coins.
              </p>
              <input
                type="text"
                placeholder="Clan name"
                value={createClanName}
                onChange={(e) => setCreateClanName(e.target.value)}
              />
              <button
                className="btn-action"
                onClick={handleCreateClan}
                disabled={inventory.coins < 100000}
                style={{
                  opacity: inventory.coins < 100000 ? 0.5 : 1,
                  cursor: inventory.coins < 100000 ? 'not-allowed' : 'pointer'
                }}
              >
                Create Clan (💰 100,000)
              </button>
              <div style={{ fontSize: '0.75rem', color: '#8899aa', marginTop: '8px' }}>
                Your coins: {inventory.coins?.toLocaleString() || 0}
              </div>
            </div>

            <div className="clan-action-box">
              <h3 style={{ marginTop: 0, color: '#66FCF1' }}>Join Clan</h3>
              <p style={{ fontSize: '0.85rem', color: '#8899aa', marginBottom: '12px' }}>
                Enter a clan name to join, or browse available clans.
              </p>
              <input
                type="text"
                placeholder="Clan name"
                value={joinClanName}
                onChange={(e) => setJoinClanName(e.target.value)}
              />
              <button
                className="btn-action"
                onClick={handleJoinClan}
                disabled={joinLoading}
                style={{ width: '100%', marginBottom: '8px', opacity: joinLoading ? 0.6 : 1 }}
              >
                {joinLoading ? 'Joining...' : 'Join Clan'}
              </button>
              <button
                className="btn-action"
                onClick={handleOpenBrowse}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(102,252,241,0.4)',
                  color: '#66FCF1'
                }}
              >
                🔍 Browse Clans
              </button>
            </div>
          </div>

          {/* Browse Clans Popup */}
          {showBrowsePopup && (
            <div style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }} onClick={() => setShowBrowsePopup(false)}>
              <div style={{
                backgroundColor: '#111920', border: '2px solid #208b76', borderRadius: '12px',
                width: '500px', maxWidth: '90vw', maxHeight: '80vh', padding: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.8)', overflowY: 'auto'
              }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #2a3b4c', paddingBottom: '12px' }}>
                  <h3 style={{ margin: 0, color: '#66FCF1' }}>🔍 Browse Clans</h3>
                  <button onClick={() => setShowBrowsePopup(false)} style={{ padding: '4px 10px', background: 'none', border: '1px solid #555', color: '#aaa', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {browseLoading ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#8899aa' }}>Loading clans...</div>
                  ) : browseClansList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#8899aa' }}>No clans found. Be the first to create one!</div>
                  ) : browseClansList.map(c => (
                    <div key={c.id || c.name} style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(102,252,241,0.2)',
                      borderRadius: '8px',
                      padding: '12px',
                      transition: 'border-color 0.2s'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div>
                          <span style={{ fontWeight: 600, color: '#F1FAEE', fontSize: '14px' }}>{c.name}</span>
                          <span style={{ fontSize: '11px', color: '#8899aa', marginLeft: '8px' }}>⭐ Lv. {c.level}</span>
                        </div>
                        <span style={{ fontSize: '12px', color: c.recruitment.open ? '#4caf50' : '#ff1744' }}>
                          {c.recruitment.open ? '🟢 Open' : '🔴 Closed'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#7b95a6', marginBottom: '6px' }}>
                        👥 {c.memberCount}/{c.maxMembers} members · 👑 {c.leader}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8899aa', fontStyle: 'italic', marginBottom: '8px' }}>
                        "{c.recruitment.message}"
                      </div>
                      {c.recruitment.open && (
                        <button
                          className="btn-action"
                          onClick={async () => { 
                            const result = await joinClan(c.name, skills); 
                            if (result) setShowBrowsePopup(false); 
                          }}
                          style={{ padding: '6px 16px', fontSize: '12px', width: '100%' }}
                        >
                          Join {c.name}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === CLAN HUB VIEW ===
  return (
    <div className="card" style={{ padding: '20px', width: '100%' }}>
      {/* Header */}
      <div className="clan-hub-header">
        <div className="clan-hub-stats">
          <div>
            <div style={{ fontSize: '0.85rem', color: '#8899aa' }}>Clan</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 600, color: '#66FCF1' }}>{clan.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#8899aa' }}>Level</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 600, color: '#66FCF1' }}>⭐ {clan.level}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#8899aa' }}>Credits</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 600, color: '#FFD700' }}>💎 {clan.credits}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#8899aa' }}>Members</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 600, color: '#66FCF1' }}>{clan.members.length}</div>
          </div>
        </div>
        <button className="top-btn btn-wipe" onClick={leaveClan}>Leave Clan</button>
      </div>

      {/* Tab Bar */}
      <div className="clan-tab-bar">
        <button
          className={`clan-tab ${clanScreen === 'overview' ? 'active' : ''}`}
          onClick={() => setClanScreen('overview')}
        >
          👥 Members
        </button>
        <button
          className={`clan-tab ${clanScreen === 'quests' ? 'active' : ''}`}
          onClick={() => setClanScreen('quests')}
        >
          🏆 Quests
        </button>
        <button
          className={`clan-tab ${clanScreen === 'vault' ? 'active' : ''}`}
          onClick={() => setClanScreen('vault')}
        >
          🏦 Vault
        </button>
        <button
          className={`clan-tab ${clanScreen === 'upgrades' ? 'active' : ''}`}
          onClick={() => setClanScreen('upgrades')}
        >
          ⬆️ Upgrades
        </button>
        {playerMember && ['Leader', 'Officer'].includes(playerMember.rank) && (
          <button
            className={`clan-tab ${clanScreen === 'manage' ? 'active' : ''}`}
            onClick={() => setClanScreen('manage')}
          >
            ⚙️ Manage
          </button>
        )}
      </div>

      {/* TAB: MEMBERS */}
      {clanScreen === 'overview' && (
        <div>
          <h3 style={{ marginTop: '0', color: '#66FCF1' }}>Clan Members</h3>
          <div className="clan-members-table">
            {clan.members.map((member, idx) => (
              <div key={idx} className="clan-member-row">
                <div style={{ width: '24px', display: 'flex', alignItems: 'center' }}>
                  <span
                    className="online-dot"
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: member.online ? '#4caf50' : '#555'
                    }}
                    title={member.online ? 'Online' : 'Offline'}
                  ></span>
                </div>

                <div style={{ flex: 1, minWidth: '100px' }}>
                  <strong>{member.name}</strong>
                </div>

                <div>
                  <span
                    className="clan-rank-badge"
                    style={{
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor:
                        member.rank === 'Leader'
                          ? 'rgba(255, 215, 0, 0.2)'
                          : member.rank === 'Officer'
                          ? 'rgba(102, 252, 241, 0.2)'
                          : member.rank === 'Member'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(255, 255, 255, 0.05)',
                      color:
                        member.rank === 'Leader'
                          ? '#ffd700'
                          : member.rank === 'Officer'
                          ? '#66FCF1'
                          : member.rank === 'Member'
                          ? '#ccc'
                          : '#888'
                    }}
                  >
                    {member.rank}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: '120px', textAlign: 'right', color: '#8899aa', fontSize: '0.9rem' }}>
                  {member.activity}
                </div>

                <div style={{ minWidth: '80px', textAlign: 'right', color: '#8899aa', fontSize: '0.85rem' }}>
                  {formatDuration(member.activityStart)}
                </div>

                {/* Action buttons - only for leader and not self */}
                {playerMember && playerMember.rank === 'Leader' && idx !== 0 && (
                  <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
                    <button
                      onClick={() => promoteMember(idx)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        backgroundColor: 'rgba(102, 252, 241, 0.2)',
                        border: '1px solid #66FCF1',
                        color: '#66FCF1',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title="Promote"
                    >
                      ⬆️
                    </button>
                    <button
                      onClick={() => demoteMember(idx)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        backgroundColor: 'rgba(255, 215, 0, 0.2)',
                        border: '1px solid #ffd700',
                        color: '#ffd700',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title="Demote"
                    >
                      ⬇️
                    </button>
                    <button
                      onClick={() => kickMember(idx)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        backgroundColor: 'rgba(255, 23, 68, 0.2)',
                        border: '1px solid #ff1744',
                        color: '#ff1744',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title="Kick"
                    >
                      ❌
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Clan Skill Levels */}
          {skills && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ color: '#66FCF1', marginBottom: '12px' }}>📊 Clan Skill Levels</h3>
              <p style={{ fontSize: '0.8rem', color: '#8899aa', marginBottom: '12px' }}>
                Average skill levels across all clan members
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '6px'
              }}>
                {(() => {
                  const SKILL_EMOJIS = {
                    attack: '⚔️', strength: '💪', defence: '🛡️', hitpoints: '❤️',
                    prayer: '🙏', ranged: '🏹', magic: '🔮', mining: '⛏️',
                    woodcutting: '🪓', fishing: '🎣', cooking: '🍳', smithing: '🔨',
                    crafting: '✂️', herblore: '🧪', farming: '🌱', foraging: '🌿',
                    agility: '🏃', slayer: '💀', thieving: '🗝️'
                  };
                  const memberCount = clan.members.length;
                  return Object.entries(skills)
                    .filter(([skill]) => SKILL_EMOJIS[skill])
                    .map(([skill, data]) => {
                      const playerLevel = data.level || 1;
                      // Simulate other member levels (random around player level ±15)
                      let totalLevel = playerLevel;
                      for (let i = 1; i < memberCount; i++) {
                        const fakeLevel = Math.max(1, Math.min(99, playerLevel + Math.floor((Math.random() - 0.5) * 30)));
                        totalLevel += fakeLevel;
                      }
                      const avgLevel = Math.round(totalLevel / memberCount);

                      return (
                        <div key={skill} style={{
                          background: 'rgba(0,0,0,0.25)',
                          border: '1px solid rgba(102, 252, 241, 0.15)',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ fontSize: '14px' }}>{SKILL_EMOJIS[skill]}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: '0.7rem',
                              color: '#8899aa',
                              textTransform: 'capitalize'
                            }}>{skill}</div>
                            <div style={{
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              color: '#F1FAEE'
                            }}>Avg: {avgLevel}</div>
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: QUESTS */}
      {clanScreen === 'quests' && (
        <div>
          {/* Personal Clan Daily Quests */}
          {quests && (
            <>
              <h3 style={{ marginTop: '0', marginBottom: '12px', color: '#66FCF1' }}>📅 Clan Group Quests Daily</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '24px' }}>
                {(quests.clanDailyQuests || []).length === 0 ? (
                  <div style={{ color: '#555', fontSize: '13px', padding: '12px', textAlign: 'center' }}>No clan daily quests yet. Check back after the next reset!</div>
                ) : (quests.clanDailyQuests || []).map(quest => {
                  const progressPerc = Math.min(100, (quest.progress / quest.target) * 100);
                  return (
                    <div key={quest.id} style={{
                      background: quest.claimed ? 'rgba(76, 175, 80, 0.1)' : quest.completed ? 'rgba(102, 252, 241, 0.08)' : 'rgba(0, 0, 0, 0.25)',
                      border: `1px solid ${quest.claimed ? 'rgba(76, 175, 80, 0.4)' : quest.completed ? 'rgba(102, 252, 241, 0.5)' : 'rgba(69, 162, 158, 0.3)'}`,
                      borderRadius: '8px', padding: '12px 14px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#F1FAEE' }}>
                          {quest.verb} {quest.target.toLocaleString()}x {quest.actionName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {quest.reward?.clanCredits && <span style={{ fontSize: '12px', color: '#FFD700' }}>💎 {quest.reward.clanCredits}</span>}
                          {quest.reward?.coins && <span style={{ fontSize: '12px', color: '#FFD700' }}>💰 {quest.reward.coins.toLocaleString()}</span>}
                        </div>
                      </div>
                      <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(11,12,16,0.8)', overflow: 'hidden', marginBottom: '6px' }}>
                        <div style={{ height: '100%', width: `${progressPerc}%`, background: quest.completed ? '#4caf50' : '#66FCF1', borderRadius: '3px', transition: 'width 0.3s' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#8899aa' }}>{quest.progress.toLocaleString()} / {quest.target.toLocaleString()} ({Math.round(progressPerc)}%)</span>
                        {quest.completed && !quest.claimed && (
                          <button onClick={() => quests.claimClanQuestReward?.(quest.id, setClan)} style={{ padding: '4px 12px', fontSize: '12px', fontWeight: 700, background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Claim!</button>
                        )}
                        {quest.claimed && <span style={{ fontSize: '12px', color: '#4caf50', fontWeight: 600 }}>✓ Claimed</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <h3 style={{ marginTop: '0', marginBottom: '12px', color: '#66FCF1' }}>📆 Clan Group Quests Weekly</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '24px' }}>
                {(quests.clanWeeklyQuests || []).length === 0 ? (
                  <div style={{ color: '#555', fontSize: '13px', padding: '12px', textAlign: 'center' }}>No clan weekly quests yet. Check back after the next reset!</div>
                ) : (quests.clanWeeklyQuests || []).map(quest => {
                  const progressPerc = Math.min(100, (quest.progress / quest.target) * 100);
                  return (
                    <div key={quest.id} style={{
                      background: quest.claimed ? 'rgba(76, 175, 80, 0.1)' : quest.completed ? 'rgba(102, 252, 241, 0.08)' : 'rgba(0, 0, 0, 0.25)',
                      border: `1px solid ${quest.claimed ? 'rgba(76, 175, 80, 0.4)' : quest.completed ? 'rgba(102, 252, 241, 0.5)' : 'rgba(69, 162, 158, 0.3)'}`,
                      borderRadius: '8px', padding: '12px 14px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#F1FAEE' }}>
                          {quest.verb} {quest.target.toLocaleString()}x {quest.actionName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {quest.reward?.clanCredits && <span style={{ fontSize: '12px', color: '#FFD700' }}>💎 {quest.reward.clanCredits}</span>}
                          {quest.reward?.coins && <span style={{ fontSize: '12px', color: '#FFD700' }}>💰 {quest.reward.coins.toLocaleString()}</span>}
                        </div>
                      </div>
                      <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(11,12,16,0.8)', overflow: 'hidden', marginBottom: '6px' }}>
                        <div style={{ height: '100%', width: `${progressPerc}%`, background: quest.completed ? '#4caf50' : '#66FCF1', borderRadius: '3px', transition: 'width 0.3s' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#8899aa' }}>{quest.progress.toLocaleString()} / {quest.target.toLocaleString()} ({Math.round(progressPerc)}%)</span>
                        {quest.completed && !quest.claimed && (
                          <button onClick={() => quests.claimClanQuestReward?.(quest.id, setClan)} style={{ padding: '4px 12px', fontSize: '12px', fontWeight: 700, background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Claim!</button>
                        )}
                        {quest.claimed && <span style={{ fontSize: '12px', color: '#4caf50', fontWeight: 600 }}>✓ Claimed</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}


        </div>
      )}

      {/* TAB: VAULT */}
      {clanScreen === 'vault' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#66FCF1' }}>🏦 Clan Vault</h3>
            <span style={{ color: '#8899aa', fontSize: '0.85rem' }}>
              {clan.vault.reduce((sum, v) => sum + v.amount, 0)} items | {clan.vaultSlots || 10} slots
            </span>
          </div>

          {/* Rank warning */}
          {playerMember && !['Leader', 'Officer'].includes(playerMember.rank) && (
            <div style={{
              background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.3)',
              borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#ff1744', fontSize: '0.85rem'
            }}>
              🔒 Your rank ({playerMember.rank}) cannot withdraw items from the vault.
            </div>
          )}

          <div className="clan-vault-grid">
            {/* LEFT SIDE: Player Inventory */}
            <div className="clan-vault-deposit">
              <h4 style={{ marginTop: 0, marginBottom: '16px', color: '#F1FAEE' }}>📤 Your Inventory</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(inventory)
                  .filter(([key, count]) => count > 0 && key !== 'coins' && key !== 'maxSlots' && key !== 'slayer_points')
                  .map(([key, count]) => {
                    const itemImage = ITEM_IMAGES?.[key];
                    return (
                      <div
                        key={key}
                        onClick={() => {
                          setSelectedVaultItem(key);
                          setVaultDepositQuantity(1);
                        }}
                        title={`Click to deposit ${formatItemName(key)}`}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          // Right-click: deposit all
                          depositToVault(key, count, inventory, setInventory);
                        }}
                        style={{
                          width: '54px', height: '54px', backgroundColor: '#0b1014',
                          border: '1px solid #2a3b4c', borderRadius: '8px',
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          justifyContent: 'center', cursor: 'pointer', position: 'relative',
                          transition: 'border 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4affd4'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2a3b4c'}
                      >
                        {itemImage ? (
                          <img src={itemImage} alt={key} style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '10px', color: '#c5d3df', textAlign: 'center', lineHeight: '1.1' }}>
                            {key.replace(/_/g, ' ').substring(0, 7)}
                          </span>
                        )}
                        <span style={{
                          position: 'absolute', bottom: '2px', right: '4px', fontSize: '9px',
                          color: '#4affd4', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.6)',
                          padding: '1px 3px', borderRadius: '2px'
                        }}>
                          {count >= 1000 ? (count/1000).toFixed(1) + 'k' : count}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* RIGHT SIDE: Clan Vault Grid */}
            <div className="clan-vault-withdraw">
              <h4 style={{ marginTop: 0, marginBottom: '16px', color: '#F1FAEE' }}>📥 Clan Vault</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Array.from({ length: clan.vaultSlots || 10 }).map((_, index) => {
                  const vaultItem = clan.vault && clan.vault.length > index ? clan.vault[index] : null;
                  const canWithdraw = ['Leader', 'Officer'].includes(playerMember?.rank);

                  if (vaultItem) {
                    const itemImage = ITEM_IMAGES?.[vaultItem.id];
                    return (
                      <div
                        key={vaultItem.id}
                        onClick={() => canWithdraw && withdrawFromVault(vaultItem.id, 1, inventory, setInventory)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          if (canWithdraw) withdrawFromVault(vaultItem.id, vaultItem.amount, inventory, setInventory);
                        }}
                        title={canWithdraw
                          ? `Click: withdraw 1 ${vaultItem.name} | Right-click: withdraw all`
                          : `${vaultItem.name} (×${vaultItem.amount}) — Rank too low to withdraw`
                        }
                        style={{
                          width: '54px', height: '54px', backgroundColor: '#0b1014',
                          border: `1px solid ${canWithdraw ? '#2a3b4c' : 'rgba(255,23,68,0.3)'}`,
                          borderRadius: '8px', display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          cursor: canWithdraw ? 'pointer' : 'not-allowed',
                          position: 'relative', transition: 'border 0.2s',
                          opacity: canWithdraw ? 1 : 0.7
                        }}
                        onMouseEnter={(e) => { if (canWithdraw) e.currentTarget.style.borderColor = '#4affd4'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = canWithdraw ? '#2a3b4c' : 'rgba(255,23,68,0.3)'; }}
                      >
                        {itemImage ? (
                          <img src={itemImage} alt={vaultItem.id} style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '10px', color: '#c5d3df', textAlign: 'center', lineHeight: '1.1' }}>
                            {vaultItem.name.substring(0, 7)}
                          </span>
                        )}
                        <span style={{
                          position: 'absolute', bottom: '2px', right: '4px', fontSize: '9px',
                          color: '#66FCF1', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.6)',
                          padding: '1px 3px', borderRadius: '2px'
                        }}>
                          ×{vaultItem.amount}
                        </span>
                      </div>
                    );
                  }

                  // Empty slot
                  return (
                    <div key={`empty-${index}`} style={{
                      width: '54px', height: '54px', backgroundColor: '#0b1014',
                      border: '1px dashed rgba(102, 252, 241, 0.15)', borderRadius: '8px'
                    }} />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: UPGRADES */}
      {clanScreen === 'upgrades' && (
        <div>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#66FCF1' }}>⬆️ Clan Upgrades</h3>
          <p style={{ color: '#8899aa', fontSize: '0.85rem', marginBottom: '20px' }}>
            Spend Clan Credits (💎 {clan?.credits || 0}) to unlock permanent boosts for all members.
          </p>
          {playerMember && !['Officer', 'Leader'].includes(playerMember.rank) && (
            <div style={{
              background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.3)',
              borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#ff1744', fontSize: '0.85rem'
            }}>
              🔒 Only Officers and Leaders can purchase clan upgrades. Your rank: <strong>{playerMember.rank}</strong>
            </div>
          )}
          {clan?.upgrades ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {Object.entries(clan.upgrades).map(([key, upgrade]) => {
              const cost = upgrade.costPerLevel * (upgrade.level + 1);
              const isMaxed = upgrade.level >= upgrade.maxLevel;
              const canAfford = clan.credits >= cost;
              const canPurchase = playerMember && ['Officer', 'Leader'].includes(playerMember.rank);
              const totalEffect = upgrade.level * upgrade.effectPerLevel;

              return (
                <div key={key} className="clan-upgrade-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{upgrade.icon}</div>
                      <div style={{ fontWeight: 600, color: '#66FCF1' }}>{upgrade.label}</div>
                      <div style={{ fontSize: '0.8rem', color: '#8899aa', marginTop: '4px' }}>{upgrade.description}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#8899aa' }}>Level</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 600, color: isMaxed ? '#4caf50' : '#66FCF1' }}>
                        {upgrade.level}/{upgrade.maxLevel}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{
                    height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)',
                    marginBottom: '12px', overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%', width: `${(upgrade.level / upgrade.maxLevel) * 100}%`,
                      background: isMaxed ? '#4caf50' : 'var(--cta-primary)', transition: 'width 0.3s'
                    }} />
                  </div>

                  {totalEffect > 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#4caf50', marginBottom: '8px' }}>
                      Current bonus: +{totalEffect}%
                    </div>
                  )}

                  {isMaxed ? (
                    <div style={{ textAlign: 'center', color: '#4caf50', fontWeight: 600, fontSize: '0.9rem' }}>
                      ✓ Maxed Out
                    </div>
                  ) : (
                    <button
                      className="btn-action"
                      onClick={() => purchaseUpgrade(key)}
                      disabled={!canAfford || !canPurchase}
                      style={{
                        width: '100%', padding: '8px',
                        opacity: (canAfford && canPurchase) ? 1 : 0.5,
                        cursor: (canAfford && canPurchase) ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {!canPurchase ? '🔒 Officer+ Only' : `Upgrade — 💎 ${cost}`}
                    </button>
                  )}
                </div>
              );
            })}
            </div>
          ) : (
            <div style={{ color: '#8899aa', textAlign: 'center', padding: '20px' }}>Loading upgrades...</div>
          )}
        </div>
      )}

      {/* TAB: MANAGE */}
      {clanScreen === 'manage' && (
        <div style={{ minHeight: '300px' }}>
          {['Leader', 'Officer'].includes(playerMember?.rank) ? (
            <>
              <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#66FCF1' }}>⚙️ Clan Management</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Invite Player */}
            <div className="clan-manage-card">
              <h4 style={{ marginTop: 0, marginBottom: '12px', color: '#F1FAEE' }}>👤 Invite Player</h4>
              <p style={{ color: '#8899aa', fontSize: '0.85rem', marginBottom: '12px' }}>
                Send a clan invite to a player by name.
              </p>
              <input
                type="text"
                placeholder="Player name"
                value={invitePlayerName}
                onChange={(e) => setInvitePlayerName(e.target.value)}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(102, 252, 241, 0.3)',
                  color: '#fff', marginBottom: '12px'
                }}
              />
              <button className="btn-action" onClick={() => {
                if (inviteMember(invitePlayerName)) setInvitePlayerName('');
              }} style={{ width: '100%' }}>
                Send Invite
              </button>
            </div>

            {/* Recruitment */}
            <div className="clan-manage-card">
              <h4 style={{ marginTop: 0, marginBottom: '12px', color: '#F1FAEE' }}>📢 Recruitment</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ color: '#8899aa', fontSize: '0.85rem' }}>Open Recruitment</span>
                <div
                  onClick={() => updateRecruitment(!(clan.recruitment?.open), clan.recruitment?.message || '')}
                  style={{
                    width: '44px', height: '24px', borderRadius: '12px',
                    backgroundColor: clan.recruitment?.open ? '#66FCF1' : '#333',
                    cursor: 'pointer', position: 'relative', transition: 'all 0.3s'
                  }}
                >
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    backgroundColor: '#fff', position: 'absolute', top: '3px',
                    left: clan.recruitment?.open ? '22px' : '4px',
                    transition: 'left 0.3s'
                  }} />
                </div>
                <span style={{ color: clan.recruitment?.open ? '#4caf50' : '#ff1744', fontWeight: 600, fontSize: '0.85rem' }}>
                  {clan.recruitment?.open ? 'ON' : 'OFF'}
                </span>
              </div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#8899aa', marginBottom: '6px' }}>
                Recruitment Message
              </label>
              <textarea
                value={recruitmentMessage}
                onChange={(e) => setRecruitmentMessage(e.target.value)}
                rows={3}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(102, 252, 241, 0.3)',
                  color: '#fff', resize: 'vertical', marginBottom: '12px',
                  fontFamily: 'inherit'
                }}
              />
              <button className="btn-action" onClick={() => {
                updateRecruitment(clan.recruitment.open, recruitmentMessage);
                alert('Recruitment message updated!');
              }} style={{ width: '100%' }}>
                Save Message
              </button>
            </div>

            {/* Join Requests - from Supabase */}
            <div className="clan-manage-card" style={{ gridColumn: '1 / -1' }}>
              <h4 style={{ marginTop: 0, marginBottom: '12px', color: '#F1FAEE' }}>
                📨 Join Requests
                {(clanJoinRequests || []).length > 0 && (
                  <span style={{ 
                    background: '#e74c3c', color: 'white', borderRadius: '50%',
                    width: '20px', height: '20px', fontSize: '11px', fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    marginLeft: '8px', verticalAlign: 'middle'
                  }}>
                    {(clanJoinRequests || []).length}
                  </span>
                )}
              </h4>
              {(clanJoinRequests || []).length === 0 ? (
                <p style={{ color: '#555', fontSize: '13px' }}>No pending join requests.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(clanJoinRequests || []).map((req) => (
                    <div key={req.id} style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(102,252,241,0.2)',
                      borderRadius: '8px',
                      padding: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, color: '#F1FAEE', fontSize: '14px' }}>👤 {req.username}</span>
                        <span style={{ fontSize: '11px', color: '#7b95a6' }}>
                          {new Date(req.requested_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#8899aa', marginBottom: '4px' }}>
                        📊 Total Level: <strong style={{ color: '#66FCF1' }}>{req.total_level}</strong> · ⚔️ Combat: <strong style={{ color: '#f1c40f' }}>{req.combat_level}</strong>
                      </div>
                      {req.message && (
                        <div style={{ fontSize: '12px', color: '#7b95a6', fontStyle: 'italic', marginBottom: '8px' }}>
                          "{req.message}"
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => reviewJoinRequest(req.id, true)}
                          style={{
                            flex: 1, padding: '6px', fontSize: '12px', fontWeight: 700,
                            background: '#4caf50', color: 'white', border: 'none',
                            borderRadius: '4px', cursor: 'pointer'
                          }}
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => reviewJoinRequest(req.id, false)}
                          style={{
                            flex: 1, padding: '6px', fontSize: '12px', fontWeight: 700,
                            background: '#e74c3c', color: 'white', border: 'none',
                            borderRadius: '4px', cursor: 'pointer'
                          }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>
            </>
          ) : (
            <div style={{ 
              background: 'rgba(255, 23, 68, 0.1)', 
              border: '1px solid rgba(255, 23, 68, 0.3)',
              borderRadius: '8px', 
              padding: '20px', 
              textAlign: 'center',
              color: '#ff1744', 
              fontSize: '1rem',
              marginTop: '20px'
            }}>
              🔒 Only Leaders can manage the clan. Your rank: <strong>{playerMember?.rank || 'Unknown'}</strong>
            </div>
          )}
        </div>
      )}

      {/* VAULT DEPOSIT MODAL */}
      {selectedVaultItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }} onClick={() => setSelectedVaultItem(null)}>
          <div style={{
            backgroundColor: '#111920', border: '2px solid #208b76', borderRadius: '8px', 
            width: '340px', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.8)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2a3b4c', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>Deposit to Vault</h3>
              <span style={{ color: '#4affd4' }}>Have: {inventory[selectedVaultItem]}</span>
            </div>

            <div style={{ backgroundColor: '#0b1014', padding: '12px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px', color: '#c5d3df', textAlign: 'center' }}>
              {formatItemName(selectedVaultItem)}
            </div>

            {/* Slider & Knoppen */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <input 
                  type="range" min="1" max={inventory[selectedVaultItem] || 1} value={vaultDepositQuantity} 
                  onChange={(e) => setVaultDepositQuantity(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#4affd4', cursor: 'pointer' }}
                />
                <button 
                  onClick={() => setVaultDepositQuantity(inventory[selectedVaultItem] || 1)}
                  style={{ padding: '4px 10px', backgroundColor: '#182b2a', border: '1px solid #208b76', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                >
                  MAX
                </button>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button onClick={() => setVaultDepositQuantity(prev => Math.max(1, prev - 1))} style={{ padding: '8px 12px', backgroundColor: '#0b1014', border: '1px solid #2a3b4c', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                <input 
                  type="number" min="1" max={inventory[selectedVaultItem] || 1} value={vaultDepositQuantity}
                  onChange={(e) => { let val = parseInt(e.target.value, 10); if (isNaN(val) || val < 1) val = 1; if (val > inventory[selectedVaultItem]) val = inventory[selectedVaultItem]; setVaultDepositQuantity(val); }}
                  style={{ flex: 1, padding: '8px', backgroundColor: '#182b2a', border: '1px solid #208b76', color: 'white', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}
                />
                <button onClick={() => setVaultDepositQuantity(prev => Math.min(inventory[selectedVaultItem] || 1, prev + 1))} style={{ padding: '8px 12px', backgroundColor: '#0b1014', border: '1px solid #2a3b4c', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
              </div>
            </div>

            {/* Knoppen */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => {
                  depositToVault(selectedVaultItem, vaultDepositQuantity, inventory, setInventory);
                  setSelectedVaultItem(null);
                }}
                style={{ padding: '12px', backgroundColor: '#208b76', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Deposit {vaultDepositQuantity}×
              </button>
              <button onClick={() => setSelectedVaultItem(null)} style={{ padding: '10px', backgroundColor: '#2a3b4c', color: '#c5d3df', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
