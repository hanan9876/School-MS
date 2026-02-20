const STORAGE_KEY = 'schoolms_complaints_v1';

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function getComplaints() {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const list = safeParse(raw, []);
  return Array.isArray(list) ? list : [];
}

export function saveComplaints(list) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function createComplaint({ studentId, studentName, title, description }) {
  const now = new Date().toISOString();
  const complaint = {
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    studentId: studentId || '',
    studentName: studentName || '',
    title: title || '',
    description: description || '',
    status: 'pending', // 'pending' | 'action_taken'
    adminAction: '',
    createdAt: now,
    updatedAt: now,
  };

  const list = getComplaints();
  saveComplaints([complaint, ...list]);
  return complaint;
}

export function updateComplaint(id, patch) {
  const list = getComplaints();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  const updated = {
    ...list[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  const next = [...list];
  next[idx] = updated;
  saveComplaints(next);
  return updated;
}

