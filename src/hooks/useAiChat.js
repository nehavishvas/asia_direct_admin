import { useCallback, useEffect, useState } from 'react';
import {
  getAiContext,
  getAiHistory,
  createAiSession,
  sendAiMessage,
} from '../api/aiChat';

const sessionKey = (userId) => `ai-chat-session:${userId}`;

export function useAiChat({ userId }) {
  const [sessionId, setSessionId] = useState(() => {
    try {
      return localStorage.getItem(sessionKey(userId)) || null;
    } catch {
      return null;
    }
  });
  const [messages, setMessages] = useState([]);
  const [topics, setTopics] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  const persistSession = useCallback(
    (sid) => {
      setSessionId(sid || null);
      try {
        if (sid) {
          localStorage.setItem(sessionKey(userId), sid);
        } else {
          localStorage.removeItem(sessionKey(userId));
        }
      } catch {}
    },
    [userId]
  );

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (!userId) return;
      setBooting(true);
      try {
        const ctx = await getAiContext(userId);
        if (!cancelled && ctx.success) {
          setUser(ctx.user);
          setTopics(ctx.topics || []);
        }

        let stored = null;
        try {
          stored = localStorage.getItem(sessionKey(userId));
        } catch {}

        const hist = await getAiHistory(userId, stored);
        if (cancelled) return;

        if (hist.success && hist.messages?.length) {
          persistSession(hist.sessionId);
          setMessages(
            hist.messages.map((m) => ({
              role: m.role,
              content: m.content,
              data: m.data || null,
            }))
          );
        } else {
          persistSession(null);
          setMessages([]);
        }
      } catch (err) {
        console.error('Error booting AI chat session:', err);
      } finally {
        if (!cancelled) setBooting(false);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, [userId, persistSession]);

  const ensureSession = useCallback(async () => {
    if (sessionId) return sessionId;
    const hist = await getAiHistory(userId, null);
    if (hist.success && hist.sessionId) {
      persistSession(hist.sessionId);
      return hist.sessionId;
    }
    const created = await createAiSession(userId);
    if (created.success && created.sessionId) {
      persistSession(created.sessionId);
      return created.sessionId;
    }
    const fallback = `u${userId}-${Date.now().toString(36)}`;
    persistSession(fallback);
    return fallback;
  }, [sessionId, userId, persistSession]);

  const send = useCallback(
    async (text) => {
      const message = String(text || '').trim();
      if (!message || !userId) return;

      const sid = await ensureSession();
      setMessages((prev) => [...prev, { role: 'user', content: message }]);
      setLoading(true);
      try {
        const data = await sendAiMessage({ userId, sessionId: sid, message });
        if (!data.success) {
          setMessages((prev) => [
            ...prev,
            { role: 'system', content: data.message || 'Request failed' },
          ]);
          return;
        }
        if (data.sessionId) persistSession(data.sessionId);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply, data: data.data || null },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { role: 'system', content: err.message || 'Network error' },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [userId, ensureSession, persistSession]
  );

  const newChat = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await createAiSession(userId);
      if (data.success && data.sessionId) {
        persistSession(data.sessionId);
        setMessages([]);
      }
    } catch (err) {
      console.error('Error starting new chat session:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, persistSession]);

  return {
    user,
    topics,
    messages,
    loading,
    booting,
    sessionId,
    send,
    newChat,
  };
}
