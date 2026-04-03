import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useChat(userId, username, clanId) {
  const [messages, setMessages] = useState({ general: [], clan: [], friends: [] });
  const [activeTab, setActiveTab] = useState('general');
  const [isOpen, setIsOpen] = useState(false);
  const channelRef = useRef(null);
  const clanChannelRef = useRef(null);

  // Subscribe to general chat
  useEffect(() => {
    if (!userId) return;

    // Load recent messages
    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('channel', 'general')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data) {
          setMessages(prev => ({ ...prev, general: data.reverse() }));
        }
      } catch (err) {
        console.error('[Chat] Load error:', err);
      }
    };

    loadMessages();

    // Subscribe to real-time messages
    const channel = supabase
      .channel('chat-general')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: 'channel=eq.general'
      }, (payload) => {
        setMessages(prev => ({
          ...prev,
          general: [...prev.general.slice(-99), payload.new]
        }));
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [userId]);

  // Subscribe to clan chat
  useEffect(() => {
    if (!userId || !clanId) return;

    const loadClanMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('channel', 'clan')
          .eq('clan_id', clanId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data) {
          setMessages(prev => ({ ...prev, clan: data.reverse() }));
        }
      } catch (err) {
        console.error('[Chat] Clan load error:', err);
      }
    };

    loadClanMessages();

    const clanChannel = supabase
      .channel(`chat-clan-${clanId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `clan_id=eq.${clanId}`
      }, (payload) => {
        if (payload.new.channel === 'clan') {
          setMessages(prev => ({
            ...prev,
            clan: [...prev.clan.slice(-99), payload.new]
          }));
        }
      })
      .subscribe();

    clanChannelRef.current = clanChannel;

    return () => {
      if (clanChannelRef.current) {
        supabase.removeChannel(clanChannelRef.current);
      }
    };
  }, [userId, clanId]);

  // Send message
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || !userId || !username) return false;

    const channel = activeTab;
    if (channel === 'friends') return false; // Not implemented yet

    const messageData = {
      user_id: userId,
      username: username,
      message: text.trim().substring(0, 200),
      channel: channel,
      clan_id: channel === 'clan' ? clanId : null
    };

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData);

      if (error) {
        console.error('[Chat] Send error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[Chat] Send error:', err);
      return false;
    }
  }, [userId, username, activeTab, clanId]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    messages,
    activeTab,
    setActiveTab,
    isOpen,
    setIsOpen,
    toggleChat,
    sendMessage
  };
}
