const STORAGE_KEY = 'schoolms_notices_v1';

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function getNotices() {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const list = safeParse(raw, []);
  return Array.isArray(list) ? list : [];
}

export function saveNotices(list) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function createNotice({ title, description, icon }) {
  const now = new Date().toISOString();

  const notice = {
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    title: title || '',
    description: description || '',
    icon: icon || '📢',
    createdAt: now,
    updatedAt: now,
  };

  const list = getNotices();
  saveNotices([notice, ...list]);
  return notice;
}

export function updateNotice(id, patch) {
  const list = getNotices();
  const idx = list.findIndex((n) => n.id === id);
  if (idx === -1) return null;

  const updated = {
    ...list[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  const next = [...list];
  next[idx] = updated;
  saveNotices(next);
  return updated;
}

export function deleteNotice(id) {
  const list = getNotices();
  const next = list.filter((n) => n.id !== id);
  saveNotices(next);
}