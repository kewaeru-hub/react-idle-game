-- ============================================================
-- SUPABASE MIGRATION: Chat System
-- Description: Creates the chat_messages table for the in-game
--   chat system with General, Clan, and Friends channels.
-- ============================================================

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) <= 200),
  channel TEXT NOT NULL DEFAULT 'general' CHECK (channel IN ('general', 'clan', 'friends')),
  clan_id UUID REFERENCES clans(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by channel
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel, created_at DESC);

-- Index for clan-specific messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_clan ON chat_messages(clan_id, created_at DESC) WHERE clan_id IS NOT NULL;

-- Auto-delete old messages (keep last 7 days)
-- Run this as a cron job or scheduled function
-- DELETE FROM chat_messages WHERE created_at < now() - interval '7 days';

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read general chat
CREATE POLICY "Anyone can read general chat" ON chat_messages
  FOR SELECT USING (channel = 'general');

-- Clan members can read their own clan chat
CREATE POLICY "Clan members can read clan chat" ON chat_messages
  FOR SELECT USING (
    channel = 'clan' AND 
    clan_id IN (
      SELECT clan_id FROM clan_members WHERE user_id = auth.uid()
    )
  );

-- Authenticated users can insert messages
CREATE POLICY "Authenticated users can send messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
