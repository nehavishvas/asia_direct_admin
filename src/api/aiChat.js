const getApiBase = () => {
  const url = process.env.REACT_APP_BASE_URL_AICHATT || '';
  return url.replace(/['"]/g, '').trim();
};

const API_BASE = getApiBase();

export async function getAiContext(userId) {
  const res = await fetch(
    `${API_BASE}/api/ai-chat/context?user_id=${encodeURIComponent(userId)}`
  );
  return res.json();
}

export async function getAiHistory(userId, sessionId) {
  let url = `${API_BASE}/api/ai-chat/history?user_id=${encodeURIComponent(userId)}`;
  if (sessionId) url += `&session_id=${encodeURIComponent(sessionId)}`;
  const res = await fetch(url);
  return res.json();
}

export async function createAiSession(userId) {
  const res = await fetch(`${API_BASE}/api/ai-chat/new-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: Number(userId) }),
  });
  return res.json();
}

export async function sendAiMessage({ userId, sessionId, message }) {
  const res = await fetch(`${API_BASE}/api/ai-chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: Number(userId),
      session_id: sessionId,
      message,
    }),
  });
  return res.json();
}
