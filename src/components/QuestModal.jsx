import React, { useState, useEffect } from 'react';

function formatTime(ms) {
  if (ms <= 0) return '0s';
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

const SKILL_ICONS = {
  mining: '⛏️', woodcutting: '🪓', fishing: '🎣', cooking: '🍳',
  smithing: '🔨', crafting: '✂️', herblore: '🧪', farming: '🌱',
  foraging: '🌿', prayer: '🙏', agility: '🏃', combat: '⚔️', thieving: '🗝️'
};

function QuestCard({ quest, onReroll, canReroll, onClaim, setInventory, addXp, isClan = false, onClanClaim, setClan }) {
  const progressPerc = Math.min(100, (quest.progress / quest.target) * 100);
  const isComplete = quest.completed;
  const isClaimed = quest.claimed;

  return (
    <div style={{
      background: isClaimed ? 'rgba(76, 175, 80, 0.1)' : isComplete ? 'rgba(102, 252, 241, 0.08)' : 'rgba(0, 0, 0, 0.25)',
      border: `1px solid ${isClaimed ? 'rgba(76, 175, 80, 0.4)' : isComplete ? 'rgba(102, 252, 241, 0.5)' : 'rgba(69, 162, 158, 0.3)'}`,
      borderRadius: '8px',
      padding: '12px 14px',
      position: 'relative',
      transition: 'all 0.2s'
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ fontSize: '16px' }}>{SKILL_ICONS[quest.skill] || '📋'}</span>
            <span style={{
              fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
              color: isClan ? '#FFD700' : '#8899aa',
              background: isClan ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255,255,255,0.05)',
              padding: '2px 8px', borderRadius: '4px'
            }}>
              {isClan ? '👥 Clan ' : ''}{quest.skill}
            </span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#F1FAEE' }}>
            {quest.verb} {quest.target.toLocaleString()}x {quest.actionName}
          </div>
        </div>

        {/* Reroll button */}
        {!isClan && !isComplete && !isClaimed && canReroll && (
          <button
            onClick={onReroll}
            title="Reroll quest"
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '4px', padding: '4px 8px', cursor: 'pointer',
              color: '#8899aa', fontSize: '12px', transition: 'all 0.2s',
              flexShrink: 0
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#66FCF1'; e.currentTarget.style.color = '#66FCF1'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#8899aa'; }}
          >
            🔄
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div style={{
        height: '6px', borderRadius: '3px',
        background: 'rgba(11, 12, 16, 0.8)',
        overflow: 'hidden', marginBottom: '8px'
      }}>
        <div style={{
          height: '100%',
          width: `${progressPerc}%`,
          background: isComplete ? '#4caf50' : 'var(--cta-primary)',
          borderRadius: '3px',
          transition: 'width 0.3s ease',
          boxShadow: isComplete ? '0 0 8px rgba(76,175,80,0.5)' : '0 0 8px rgba(102,252,241,0.3)'
        }} />
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '12px', color: '#8899aa' }}>
          {quest.progress.toLocaleString()} / {quest.target.toLocaleString()}
          <span style={{ marginLeft: '6px', color: isComplete ? '#4caf50' : '#666' }}>
            ({Math.round(progressPerc)}%)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Reward display */}
          <span style={{ fontSize: '12px', color: '#FFD700' }}>
            💰 {(quest.reward.coins || 0).toLocaleString()}
          </span>
          {quest.reward.xp && !isClan && (
            <span style={{ fontSize: '12px', color: 'var(--cta-primary)' }}>
              +{quest.reward.xp.toLocaleString()} XP
            </span>
          )}
          {quest.reward.clanCredits && (
            <span style={{ fontSize: '12px', color: '#FFD700' }}>
              💎 {quest.reward.clanCredits}
            </span>
          )}

          {/* Claim button */}
          {isComplete && !isClaimed && (
            <button
              onClick={() => {
                if (isClan) {
                  onClanClaim?.(quest.id, setClan);
                } else {
                  onClaim?.(quest.id, setInventory, addXp);
                }
              }}
              style={{
                padding: '4px 12px', fontSize: '12px', fontWeight: 700,
                background: '#4caf50', color: 'white', border: 'none',
                borderRadius: '4px', cursor: 'pointer',
                boxShadow: '0 0 8px rgba(76,175,80,0.3)'
              }}
            >
              Claim!
            </button>
          )}
          {isClaimed && (
            <span style={{ fontSize: '12px', color: '#4caf50', fontWeight: 600 }}>✓ Claimed</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QuestModal({
  quests, close, setInventory, addXp,
  clan, setClan
}) {
  const [activeTab, setActiveTab] = useState('daily');
  const [timer, setTimer] = useState({ daily: 0, weekly: 0 });

  const {
    dailyQuests, weeklyQuests,
    clanDailyQuests, clanWeeklyQuests,
    dailyRerolls, weeklyRerolls,
    maxDailyRerolls, maxWeeklyRerolls,
    rerollDailyQuest, rerollWeeklyQuest,
    claimQuestReward, claimClanQuestReward,
    getTimeUntilDailyReset, getTimeUntilWeeklyReset,
    hasQuestUpgrade,
    maxDailyQuests, maxWeeklyQuests
  } = quests;

  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer({
        daily: getTimeUntilDailyReset(),
        weekly: getTimeUntilWeeklyReset()
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [getTimeUntilDailyReset, getTimeUntilWeeklyReset]);

  const tabs = [
    { id: 'daily', label: '📅 Daily', count: dailyQuests.filter(q => q.completed && !q.claimed).length },
    { id: 'weekly', label: '📆 Weekly', count: weeklyQuests.filter(q => q.completed && !q.claimed).length },
  ];

  if (clan) {
    tabs.push(
      { id: 'clan_daily', label: '👥 Clan Daily', count: clanDailyQuests.filter(q => q.completed && !q.claimed).length },
      { id: 'clan_weekly', label: '👥 Clan Weekly', count: clanWeeklyQuests.filter(q => q.completed && !q.claimed).length }
    );
  }

  let currentQuests = [];
  let currentRerolls = 0;
  let maxRerolls = 0;
  let rerollFn = null;
  let isClanTab = false;
  let resetTime = 0;
  let resetLabel = '';
  let lockedSlots = 0;

  switch (activeTab) {
    case 'daily':
      currentQuests = dailyQuests;
      currentRerolls = dailyRerolls;
      maxRerolls = maxDailyRerolls;
      rerollFn = rerollDailyQuest;
      resetTime = timer.daily;
      resetLabel = 'Daily Reset';
      lockedSlots = hasQuestUpgrade ? 0 : (10 - (maxDailyQuests || 6));
      break;
    case 'weekly':
      currentQuests = weeklyQuests;
      currentRerolls = weeklyRerolls;
      maxRerolls = maxWeeklyRerolls;
      rerollFn = rerollWeeklyQuest;
      resetTime = timer.weekly;
      resetLabel = 'Weekly Reset';
      lockedSlots = hasQuestUpgrade ? 0 : (6 - (maxWeeklyQuests || 4));
      break;
    case 'clan_daily':
      currentQuests = clanDailyQuests;
      isClanTab = true;
      resetTime = timer.daily;
      resetLabel = 'Daily Reset';
      break;
    case 'clan_weekly':
      currentQuests = clanWeeklyQuests;
      isClanTab = true;
      resetTime = timer.weekly;
      resetLabel = 'Weekly Reset';
      break;
  }

  const completedCount = currentQuests.filter(q => q.completed).length;
  const claimedCount = currentQuests.filter(q => q.claimed).length;

  return (
    <div style={{ minWidth: '340px', maxWidth: '600px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid var(--ui-idle)', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0, color: 'var(--cta-primary)', fontSize: '20px' }}>📋 Quests</h2>
        <button onClick={close} className="close-btn" style={{ padding: '4px 10px', background: 'none', border: '1px solid #555', color: '#aaa', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '15px', overflowX: 'auto', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: 600, transition: 'all 0.2s', position: 'relative',
              background: activeTab === tab.id ? 'var(--cta-primary)' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab.id ? '#000' : '#8899aa'
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: '#4caf50', color: 'white', borderRadius: '50%',
                width: '16px', height: '16px', fontSize: '10px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Info bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '12px', padding: '8px 12px',
        background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '12px',
        flexWrap: 'wrap', gap: '6px'
      }}>
        <div style={{ color: '#8899aa' }}>
          {completedCount}/{currentQuests.length} Complete
          {claimedCount > 0 && <span style={{ color: '#4caf50' }}> ({claimedCount} claimed)</span>}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!isClanTab && (
            <span style={{ color: currentRerolls > 0 ? 'var(--cta-primary)' : '#555' }}>
              🔄 {currentRerolls}/{maxRerolls}
            </span>
          )}
          <span style={{ color: '#FFD700' }}>
            ⏰ {resetLabel}: {formatTime(resetTime)}
          </span>
        </div>
      </div>

      {!hasQuestUpgrade && !isClanTab && (
        <div style={{
          background: 'rgba(230, 97, 0, 0.1)', border: '1px solid rgba(230, 97, 0, 0.3)',
          borderRadius: '6px', padding: '8px 12px', marginBottom: '12px',
          fontSize: '12px', color: '#e66100'
        }}>
          🔓 Buy the <strong>Quest Upgrade</strong> in the General Store for more quests & rerolls!
        </div>
      )}

      {/* Quest list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
        {currentQuests.length === 0 && lockedSlots === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>
            No quests available. Check back after the reset!
          </div>
        ) : (
          <>
            {currentQuests.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#555' }}>
                No quests available. Check back after the reset!
              </div>
            )}
            {currentQuests.map((quest, index) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                canReroll={!isClanTab && currentRerolls > 0}
                onReroll={() => rerollFn?.(index)}
                onClaim={claimQuestReward}
                onClanClaim={claimClanQuestReward}
                setInventory={setInventory}
                addXp={addXp}
                isClan={isClanTab}
                setClan={setClan}
              />
            ))}
            {lockedSlots > 0 && Array.from({ length: lockedSlots }, (_, i) => (
              <div key={`locked-${i}`} style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '16px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: 0.5
              }}>
                <span style={{ fontSize: '18px' }}>🔒</span>
                <span style={{ fontSize: '13px', color: '#555', fontWeight: 600 }}>
                  Locked — Buy Quest Upgrade to unlock
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}