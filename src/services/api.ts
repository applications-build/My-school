import { SchoolDatabase, AuditLogEntry } from '../types';

// Default initial fallback school data if server is unreachable and no offline cache exists
const INITIAL_FALLBACK_SCHOOL_DATA: SchoolDatabase = {
  schoolInfo: {
    name: 'مدرسة الرافدين النموذجية',
    directorate: 'المديرية العامة لتربية بغداد / الرصافة الأولى',
    principal: 'مدير المدرسة',
    schoolCode: 'IQ-BGD-2024-889',
    academicYear: '2024 - 2025',
    semester: 'الفصل الدراسي الأول',
    phone: '07700000000',
    address: 'بغداد - شارع فلسطين - محلة 505',
  },
  currentAcademicYear: '2024 - 2025',
  availableYears: [
    { id: 'ay-2023', yearName: '2023 - 2024', startDate: '2023-09-15', endDate: '2024-06-30', status: 'ARCHIVED', notes: 'العام الدراسي السفير المكتمل' },
    { id: 'ay-2024', yearName: '2024 - 2025', startDate: '2024-09-22', endDate: '2025-06-30', status: 'ACTIVE', notes: 'العام الدراسي الحالي والنشط' },
    { id: 'ay-2025', yearName: '2025 - 2026', startDate: '2025-09-15', endDate: '2026-06-30', status: 'PLANNED', notes: 'عام الخطة المستقبلية' },
  ],
  accounts: [
    {
      id: 'u-principal',
      fullName: 'مدير المدرسة',
      role: 'PRINCIPAL',
      email: 'principal@iqschool.edu',
      phone: '07700000000',
      status: 'ACTIVE',
    },
  ],
  classes: [],
  subjects: [
    { id: 'sub-1', name: 'التربية الإسلامية', code: 'ISL-101', stage: 'PRIMARY', weeklyHours: 2 },
    { id: 'sub-2', name: 'قواعد اللغة العربية', code: 'ARB-101', stage: 'PRIMARY', weeklyHours: 4 },
    { id: 'sub-3', name: 'الرياضيات', code: 'MTH-101', stage: 'PRIMARY', weeklyHours: 4 },
    { id: 'sub-4', name: 'العلوم', code: 'SCI-101', stage: 'PRIMARY', weeklyHours: 3 },
    { id: 'sub-5', name: 'اللغة الإنكليزية', code: 'ENG-101', stage: 'PRIMARY', weeklyHours: 3 },
    { id: 'sub-6', name: 'الاجتماعيات', code: 'SOC-101', stage: 'PRIMARY', weeklyHours: 2 },
  ],
  specializations: [],
  curricula: [],
  curriculumEditions: [],
  subjectPlans: [],
  lessonProgressLogs: [],
  examWeightConfigs: [],
  calculationRules: { passingMinGrade: 50, maxRemedialSubjectsCount: 3, allow49RoundingTo50: true, absentGradeValue: 'ZERO', annualEffortFormula: 'AVG_MONTHS' },
  academicCalendarEvents: [],
  gradeAuditLogs: [],
  studentCumulativeRecords: [],
  teachers: [],
  students: [],
  parents: [],
  studentParentRelations: [],
  attendance: [],
  grades: [],
  homework: [],
  lessonPlans: [],
  timetables: [],
  notifications: [],
  auditLogs: [],
  stages: [
    { id: 'stg-1', name: 'المرحلة الابتدائية', code: 'PRIMARY', order: 1, requiresBranch: false },
  ],
  branches: [
    { id: 'br-4', name: 'الفرع العام', code: 'GENERAL', stageCode: 'PRIMARY' },
  ],
  staffAllocations: [],
  studentTransfers: [],
  backupSnapshots: [],
  devicePushTokens: [],
  notificationPreferences: [],
  officialTemplates: [],
};

// Helper for safe JSON parsing from response
async function safeParseJsonResponse<T>(res: Response, fallback: T): Promise<T> {
  try {
    const text = await res.text();
    if (!text || text.trim().startsWith('<')) {
      console.warn('Received HTML response instead of JSON. Status:', res.status);
      return fallback;
    }
    return JSON.parse(text);
  } catch (err) {
    console.warn('Error parsing JSON response:', err);
    return fallback;
  }
}

export async function fetchSchoolData(): Promise<SchoolDatabase> {
  try {
    const res = await fetch('/api/school-data');
    if (!res.ok) {
      throw new Error(`HTTP status ${res.status}`);
    }
    const text = await res.text();
    if (!text || text.trim().startsWith('<')) {
      throw new Error('Server returned HTML response instead of valid JSON');
    }
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object' || !data.schoolInfo) {
      throw new Error('Invalid school database structure');
    }
    // Cache to localStorage for offline resilience
    localStorage.setItem('madrasati_offline_backup', JSON.stringify(data));
    return data;
  } catch (error) {
    console.warn('Using local fallback storage due to fetch/parsing issue:', error);
    const cached = localStorage.getItem('madrasati_offline_backup');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.schoolInfo) {
          return parsed;
        }
      } catch (cacheErr) {
        console.warn('Cached data invalid:', cacheErr);
      }
    }
    return INITIAL_FALLBACK_SCHOOL_DATA;
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
    return await safeParseJsonResponse(res, { success: true, timestamp: new Date().toISOString() });
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
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemRole, modelName }),
    });

    if (!res.ok) {
      const err = await safeParseJsonResponse(res, {});
      throw new Error((err as any)?.error || `خطأ في الخادم (${res.status})`);
    }

    return await safeParseJsonResponse(res, { reply: 'المساعد الذكي غير متاح حالياً.' });
  } catch (err: any) {
    throw new Error(err?.message || 'تعذر التواصل مع خدمة الذكاء الاصطناعي');
  }
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
  try {
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, size, type, title }),
    });

    if (!res.ok) {
      const err = await safeParseJsonResponse(res, {});
      throw new Error((err as any)?.error || 'فشل توليد الوسيلة التعليمية');
    }

    return await safeParseJsonResponse(res, {
      success: false,
      imageUrl: '',
      resolution: size,
      model: 'fallback',
    });
  } catch (err: any) {
    throw new Error(err?.message || 'فشل توليد الصورة');
  }
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
    return await safeParseJsonResponse(res, { success: false });
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
    return await safeParseJsonResponse(res, { success: false });
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
    return await safeParseJsonResponse(res, { success: false });
  } catch (e) {
    console.warn('Failed to save notification preferences:', e);
    return { success: false };
  }
}

export async function fetchBackupSnapshots(): Promise<any[]> {
  try {
    const res = await fetch('/api/backups');
    const data = await safeParseJsonResponse(res, { snapshots: [] });
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
    return await safeParseJsonResponse(res, { success: false });
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
    return await safeParseJsonResponse(res, { success: false });
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
    return await safeParseJsonResponse(res, { success: false });
  } catch (e) {
    console.warn('Failed to transition academic year:', e);
    return { success: false };
  }
}

export async function factoryResetSchoolData(): Promise<{ success: boolean; data?: SchoolDatabase; message?: string }> {
  try {
    const res = await fetch('/api/factory-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await safeParseJsonResponse<{ success: boolean; data?: SchoolDatabase; message?: string }>(res, { success: false });
    if (result.success && result.data) {
      localStorage.setItem('madrasati_offline_backup', JSON.stringify(result.data));
      localStorage.setItem('madrasati_offline_db', JSON.stringify(result.data));
      localStorage.removeItem('madrasati_pending_sync');
      return result;
    }
    return result;
  } catch (error) {
    console.error('Factory reset error:', error);
    throw error;
  }
}
