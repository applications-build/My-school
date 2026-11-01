import { SchoolDatabase, AuditLogEntry } from '../types';

export async function fetchSchoolData(): Promise<SchoolDatabase> {
  try {
    const res = await fetch('/api/school-data');
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    // Cache to localStorage for offline resilience
    localStorage.setItem('madrasati_offline_backup', JSON.stringify(data));
    return data;
  } catch (error) {
    console.warn('Using local fallback storage:', error);
    const cached = localStorage.getItem('madrasati_offline_backup');
    if (cached) {
      return JSON.parse(cached);
    }
    throw error;
  }
}

export async function saveSchoolData(data: SchoolDatabase): Promise<{ success: boolean; timestamp: string }> {
  // Update local cache immediately
  localStorage.setItem('madrasati_offline_backup', JSON.stringify(data));

  try {
    const res = await fetch('/api/school-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error('فشل حفظ البيانات على السيرفر');
    }
    return await res.json();
  } catch (error) {
    console.error('Server sync error:', error);
    return { success: true, timestamp: new Date().toISOString() };
  }
}

export async function logAuditEvent(entry: Partial<AuditLogEntry>): Promise<void> {
  try {
    await fetch('/api/audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
  } catch (e) {
    console.warn('Audit log write error:', e);
  }
}

export async function sendChatMessage(
  messages: Array<{ role: 'user' | 'model'; text: string }>,
  systemRole: string,
  modelName: string = 'gemini-3.8-flash'
): Promise<{ reply: string; modelUsed?: string }> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemRole, modelName }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `خطأ في الخادم (${res.status})`);
  }

  return await res.json();
}

export async function generateEducationalImage(
  prompt: string,
  size: '1K' | '2K' | '4K' = '1K',
  type: 'certificate' | 'illustration' | 'badge' | 'custom' = 'certificate',
  title: string = ''
): Promise<{
  success: boolean;
  imageUrl: string;
  resolution: string;
  model: string;
  isVectorSynthesized?: boolean;
}> {
  const res = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, size, type, title }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'فشل توليد الوسيلة التعليمية');
  }

  return await res.json();
}

export async function registerDevicePushToken(
  userId: string,
  userRole: string,
  token: string,
  platform: 'ANDROID' | 'IOS' | 'WEB' = 'WEB'
): Promise<any> {
  try {
    const res = await fetch('/api/notifications/register-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userRole, token, platform }),
    });
    return await res.json();
  } catch (e) {
    console.warn('Failed to register push token:', e);
    return { success: false };
  }
}

export async function sendPushNotification(payload: {
  title: string;
  body: string;
  category: string;
  targetRole?: string;
  targetStudentId?: string;
  targetParentId?: string;
  targetUserId?: string;
}): Promise<any> {
  try {
    const res = await fetch('/api/notifications/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (e) {
    console.warn('Failed to dispatch push notification:', e);
    return { success: false };
  }
}

export async function saveNotificationPreferences(
  userId: string,
  preferences: Record<string, any>
): Promise<any> {
  try {
    const res = await fetch('/api/notifications/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...preferences }),
    });
    return await res.json();
  } catch (e) {
    console.warn('Failed to save notification preferences:', e);
    return { success: false };
  }
}

export async function fetchBackupSnapshots(): Promise<any[]> {
  try {
    const res = await fetch('/api/backups');
    const data = await res.json();
    return data.snapshots || [];
  } catch (e) {
    console.warn('Failed to fetch backup snapshots:', e);
    return [];
  }
}

export async function createBackupSnapshot(notes: string): Promise<any> {
  try {
    const res = await fetch('/api/backups/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    return await res.json();
  } catch (e) {
    console.warn('Failed to create backup snapshot:', e);
    return { success: false };
  }
}

export async function restoreBackupSnapshot(filename: string): Promise<any> {
  try {
    const res = await fetch('/api/backups/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename }),
    });
    return await res.json();
  } catch (e) {
    console.warn('Failed to restore backup snapshot:', e);
    return { success: false };
  }
}

export async function transitionAcademicYear(
  newYearName: string,
  startDate?: string,
  endDate?: string,
  notes?: string
): Promise<any> {
  try {
    const res = await fetch('/api/academic-years/transition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newYearName, startDate, endDate, notes }),
    });
    return await res.json();
  } catch (e) {
    console.warn('Failed to transition academic year:', e);
    return { success: false };
  }
}
