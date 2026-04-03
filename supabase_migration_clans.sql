-- ============================================
-- Clan System: Online Supabase-based
-- ============================================

-- Clans table (core clan data for discovery/browsing)
CREATE TABLE IF NOT EXISTS clans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  leader_name TEXT NOT NULL DEFAULT 'Unknown',
  level INTEGER NOT NULL DEFAULT 1,
  member_count INTEGER NOT NULL DEFAULT 1,
  max_members INTEGER NOT NULL DEFAULT 20,
  recruitment_open BOOLEAN NOT NULL DEFAULT true,
  recruitment_message TEXT NOT NULL DEFAULT 'Welcome to our clan!',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clans_name ON clans(name);
CREATE INDEX IF NOT EXISTS idx_clans_leader ON clans(leader_id);
CREATE INDEX IF NOT EXISTS idx_clans_recruitment ON clans(recruitment_open);

-- Clan members table (tracks which users are in which clan)
CREATE TABLE IF NOT EXISTS clan_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL DEFAULT 'Unknown',
  rank TEXT NOT NULL DEFAULT 'Recruit' CHECK (rank IN ('Recruit', 'Member', 'Officer', 'Leader')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id) -- A user can only be in one clan at a time
);

CREATE INDEX IF NOT EXISTS idx_clan_members_clan ON clan_members(clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_members_user ON clan_members(user_id);

-- Clan join requests table
CREATE TABLE IF NOT EXISTS clan_join_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL DEFAULT 'Unknown',
  total_level INTEGER NOT NULL DEFAULT 1,
  combat_level INTEGER NOT NULL DEFAULT 1,
  message TEXT DEFAULT '',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(clan_id, user_id) -- One request per user per clan
);

CREATE INDEX IF NOT EXISTS idx_clan_join_requests_clan ON clan_join_requests(clan_id);

-- Enable Row Level Security
ALTER TABLE clans ENABLE ROW LEVEL SECURITY;
ALTER TABLE clan_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clan_join_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clans
-- Anyone can read clans (for browsing)
CREATE POLICY "Anyone can view clans" ON clans
  FOR SELECT USING (true);

-- Authenticated users can create clans
CREATE POLICY "Authenticated users can create clans" ON clans
  FOR INSERT WITH CHECK (auth.uid() = leader_id);

-- Leaders can update their own clan
CREATE POLICY "Leaders can update own clan" ON clans
  FOR UPDATE USING (auth.uid() = leader_id);

-- Leaders can delete their own clan
CREATE POLICY "Leaders can delete own clan" ON clans
  FOR DELETE USING (auth.uid() = leader_id);

-- RLS Policies for clan_members
-- Anyone can read members (to see who's in a clan)
CREATE POLICY "Anyone can view clan members" ON clan_members
  FOR SELECT USING (true);

-- Users can insert themselves as members
CREATE POLICY "Users can join clans" ON clan_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete themselves (leave), leaders can delete anyone in their clan
CREATE POLICY "Users can leave clans" ON clan_members
  FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM clan_members cm
      WHERE cm.clan_id = clan_members.clan_id
      AND cm.user_id = auth.uid()
      AND cm.rank = 'Leader'
    )
  );

-- Leaders/Officers can update member ranks
CREATE POLICY "Leaders can update members" ON clan_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clan_members cm
      WHERE cm.clan_id = clan_members.clan_id
      AND cm.user_id = auth.uid()
      AND cm.rank IN ('Leader', 'Officer')
    )
  );

-- RLS Policies for clan_join_requests
-- Clan leaders/officers can view requests for their clan
CREATE POLICY "Clan leaders can view requests" ON clan_join_requests
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM clan_members cm
      WHERE cm.clan_id = clan_join_requests.clan_id
      AND cm.user_id = auth.uid()
      AND cm.rank IN ('Leader', 'Officer')
    )
  );

-- Users can create join requests
CREATE POLICY "Users can create join requests" ON clan_join_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own requests, leaders can delete any for their clan
CREATE POLICY "Users and leaders can delete requests" ON clan_join_requests
  FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM clan_members cm
      WHERE cm.clan_id = clan_join_requests.clan_id
      AND cm.user_id = auth.uid()
      AND cm.rank = 'Leader'
    )
  );

-- ============================================
-- Trigger: Auto-update member_count on clans
-- ============================================
CREATE OR REPLACE FUNCTION update_clan_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE clans SET member_count = (
      SELECT COUNT(*) FROM clan_members WHERE clan_id = NEW.clan_id
    ) WHERE id = NEW.clan_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE clans SET member_count = (
      SELECT COUNT(*) FROM clan_members WHERE clan_id = OLD.clan_id
    ) WHERE id = OLD.clan_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER clan_member_count_trigger
AFTER INSERT OR DELETE ON clan_members
FOR EACH ROW EXECUTE FUNCTION update_clan_member_count();
