import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  SchoolDatabase,
  AccountType,
  UserAccount,
  Teacher,
  Student,
  Classroom,
  AttendanceRecord,
  GradeRecord,
  LessonPlan,
  TimetableEntry,
  AuditLogEntry,
  SchoolStage,
  SchoolBranch,
  StudentAcademicStatus,
  StudentTransferRecord,
  StaffAllocation,
  CurriculumEdition,
  SubjectPlan,
  LessonProgressLog,
  ExamWeightConfig,
  CalculationRulesConfig,
  GradeAuditHistory,
  ExamApprovalStatus,
  StudentCumulativeRecord,
  LessonExecutionStatus,
  Homework,
  HomeworkSubmission,
  AcademicCalendarEvent,
  NotificationItem,
  DevicePushToken,
  NotificationPreferences,
  OfficialReportTemplate,
  BackupSnapshot,
  formatTeacherName,
} from '../types';
import {
  fetchSchoolData,
  saveSchoolData,
  logAuditEvent,
  registerDevicePushToken,
  sendPushNotification,
  saveNotificationPreferences,
  createBackupSnapshot,
  restoreBackupSnapshot,
  transitionAcademicYear,
  factoryResetSchoolData,
} from '../services/api';

// Role accounts representing each of the 4 required types
export const DEMO_ACCOUNTS: Record<'PRINCIPAL' | 'TEACHER' | 'PARENT', UserAccount> = {
  PRINCIPAL: {
    id: 'u-principal',
    fullName: 'مدير المدرسة',
    role: 'PRINCIPAL',
    email: 'principal@iqschool.edu',
    phone: '07700000000',
    status: 'ACTIVE',
  },
  TEACHER: {
    id: 't-1',
    fullName: 'علي حسين الكاظمي',
    role: 'TEACHER', // المعلم / الأستاذ (المدارس الابتدائية)
    email: 'teacher@iqschool.edu',
    phone: '07700000001',
    status: 'ACTIVE',
    assignedClassIds: ['c-1', 'c-2'],
    assignedSubjects: ['قواعد اللغة العربية', 'التربية الإسلامية'],
  },
  PARENT: {
    id: 'u-parent',
    fullName: 'محمد عبد الله العبيدي',
    role: 'PARENT', // ولي أمر الطالب
    email: 'parent@iqschool.edu',
    phone: '07700000003',
    status: 'ACTIVE',
    linkedStudentIds: [],
  },
};

interface SchoolContextType {
  db: SchoolDatabase | null;
  loading: boolean;
  error: string | null;
  currentAccount: UserAccount;
  setCurrentAccount: (acc: UserAccount) => void;
  logout: () => void;
  switchRole: (role: AccountType) => void;
  activeAcademicYear: string;
  setActiveAcademicYear: (year: string) => void;
  syncStatus: 'synced' | 'saving' | 'offline' | 'error';
  lastSynced: string;
  isOnline: boolean;
  factoryReset: () => Promise<boolean>;
  deleteGrade: (id: string) => Promise<void>;
  // Permissions
  canManageAccounts: boolean;
  canManageStaff: boolean;
  canEditClasses: boolean;
  canViewAuditLog: boolean;
  canEditGrades: boolean;
  canTakeAttendance: boolean;
  canWriteLessonPlan: boolean;
  isParentView: boolean;
  // Actions
  addAccount: (acc: Omit<UserAccount, 'id'>) => Promise<void>;
  updateAccount: (id: string, updates: Partial<UserAccount>) => Promise<void>;
  suspendAccount: (id: string, status: 'ACTIVE' | 'SUSPENDED') => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  resetPassword: (id: string, newPass: string) => Promise<void>;
  linkParentStudent: (parentId: string, studentIds: string[]) => Promise<void>;
  addStage: (stage: { name: string; code: string; order: number; requiresBranch: boolean }) => Promise<void>;
  addBranch: (branch: { name: string; code: string; stageCode: string }) => Promise<void>;
  transferStudentSection: (studentId: string, targetSection: string, reason: string) => Promise<void>;
  promoteStudentAcademicStatus: (studentId: string, status: StudentAcademicStatus, nextGradeLevel?: string) => Promise<void>;
  allocateStaffSubject: (allocation: Omit<StaffAllocation, 'id'>) => Promise<void>;
  deallocateStaffSubject: (id: string) => Promise<void>;
  addTeacher: (teacher: Omit<Teacher, 'id' | 'createdAt'>) => Promise<void>;
  updateTeacher: (id: string, updates: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addClass: (cls: Omit<Classroom, 'id'>) => Promise<void>;
  updateClass: (id: string, updates: Partial<Classroom>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  recordAttendance: (record: Omit<AttendanceRecord, 'id' | 'time'>) => Promise<void>;
  recordAttendanceBatch: (records: Array<Omit<AttendanceRecord, 'id' | 'time'>>) => Promise<void>;
  registerPushToken: (token: string, platform: 'ANDROID' | 'IOS' | 'WEB') => Promise<void>;
  sendNotificationWithPush: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  getUserNotificationPreferences: (userId: string) => NotificationPreferences;
  recordGrade: (grade: Omit<GradeRecord, 'id' | 'updatedAt'>) => Promise<void>;
  updateGrade: (id: string, updates: Partial<GradeRecord>) => Promise<void>;
  addLessonPlan: (plan: Omit<LessonPlan, 'id' | 'createdAt'>) => Promise<void>;
  deleteLessonPlan: (id: string) => Promise<void>;
  updateTimetableSlot: (slot: TimetableEntry) => Promise<void>;
  addCurriculumEdition: (edition: Omit<CurriculumEdition, 'id'>) => Promise<void>;
  updateCurriculumEdition: (id: string, updates: Partial<CurriculumEdition>) => Promise<void>;
  importCurriculumEditions: (editions: CurriculumEdition[]) => Promise<void>;
  createSubjectPlan: (plan: Omit<SubjectPlan, 'id' | 'updatedAt'>) => Promise<void>;
  logLessonProgress: (planId: string, lessonId: string, periodsSpent?: number, notes?: string) => Promise<void>;
  updateExamWeightConfig: (id: string, updates: Partial<ExamWeightConfig>) => Promise<void>;
  updateCalculationRules: (rules: Partial<CalculationRulesConfig>) => Promise<void>;
  recordGradeWithWorkflow: (gradeData: Partial<GradeRecord>, auditReason?: string) => Promise<void>;
  updateGradeApprovalStatus: (gradeId: string, newStatus: ExamApprovalStatus) => Promise<void>;
  bulkImportGrades: (grades: Partial<GradeRecord>[]) => Promise<void>;
  addDetailedHomework: (hw: Omit<Homework, 'id' | 'createdAt'>) => Promise<void>;
  updateHomeworkSubmission: (homeworkId: string, submission: HomeworkSubmission) => Promise<void>;
  addDetailedLessonPlan: (plan: Omit<LessonPlan, 'id' | 'createdAt'>) => Promise<void>;
  updateLessonPlanExecution: (id: string, executionStatus: LessonExecutionStatus, executedPortion?: string, remainingPortion?: string) => Promise<void>;
  addPrincipalLessonFeedback: (id: string, feedback: string) => Promise<void>;
  addCalendarEvent: (event: Omit<AcademicCalendarEvent, 'id'>) => Promise<void>;
  addOfficialTemplate: (tmpl: Omit<OfficialReportTemplate, 'id' | 'createdAt'>) => Promise<void>;
  updateOfficialTemplate: (id: string, updates: Partial<OfficialReportTemplate>) => Promise<void>;
  deleteOfficialTemplate: (id: string) => Promise<void>;
  approveOfficialTemplate: (id: string, isApproved: boolean) => Promise<void>;
  createNewAcademicYear: (newYearName: string, startDate?: string, endDate?: string, notes?: string) => Promise<void>;
  createIndependentBackup: (notes?: string) => Promise<void>;
  restoreIndependentBackup: (filename: string) => Promise<void>;
  triggerManualSync: () => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'madrasati_auth_session';
const CURRENT_ACCOUNT_KEY = 'madrasati_current_account';
const OFFLINE_DB_KEY = 'madrasati_offline_db';
const PENDING_SYNC_KEY = 'madrasati_pending_sync';

export const SchoolProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial cached DB if available so app renders immediately
  const [db, setDb] = useState<SchoolDatabase | null>(() => {
    try {
      const cached = localStorage.getItem(OFFLINE_DB_KEY) || localStorage.getItem('madrasati_offline_backup');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.schoolInfo) return parsed;
      }
    } catch {}
    return null;
  });

  const [loading, setLoading] = useState<boolean>(!db);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Load persisted user account across page refreshes
  const [currentAccount, setCurrentAccountState] = useState<UserAccount>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_ACCOUNT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.fullName && parsed.role) return parsed;
      }
      const session = localStorage.getItem(AUTH_STORAGE_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed?.account?.fullName && parsed?.account?.role) return parsed.account;
      }
    } catch (e) {
      console.warn('Session parse error:', e);
    }
    return DEMO_ACCOUNTS.PRINCIPAL;
  });

  const setCurrentAccount = (acc: UserAccount) => {
    setCurrentAccountState(acc);
    try {
      localStorage.setItem(CURRENT_ACCOUNT_KEY, JSON.stringify(acc));
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ account: acc, timestamp: Date.now() }));
    } catch (e) {
      console.warn('Failed to save session account:', e);
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(CURRENT_ACCOUNT_KEY);
    sessionStorage.removeItem('madrasati_splash_seen');
    setCurrentAccountState(DEMO_ACCOUNTS.PRINCIPAL);
  };

  const [activeAcademicYear, setActiveAcademicYear] = useState<string>('2024 - 2025');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline' | 'error'>('synced');
  const [lastSynced, setLastSynced] = useState<string>('الآن');

  // Load database on mount and listen to network online / offline events
  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        if (!db) setLoading(true);
        const data = await fetchSchoolData();
        if (isMounted) {
          setDb(data);
          setActiveAcademicYear(data.currentAcademicYear || '2024 - 2025');
          setSyncStatus('synced');
          setLastSynced(new Date().toLocaleTimeString('ar-IQ'));
          localStorage.setItem(OFFLINE_DB_KEY, JSON.stringify(data));
        }
      } catch (err: any) {
        if (isMounted) {
          if (!db) {
            setError(err.message || 'حدث خطأ أثناء تحميل بيانات المدرسة');
          }
          setSyncStatus('offline');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    init();

    // Listen to real-time network status changes
    const handleOnline = async () => {
      setIsOnline(true);
      setSyncStatus('saving');
      try {
        const hasPending = localStorage.getItem(PENDING_SYNC_KEY);
        if (hasPending) {
          const cached = localStorage.getItem(OFFLINE_DB_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            await saveSchoolData(parsed);
            localStorage.removeItem(PENDING_SYNC_KEY);
          }
        } else {
          const latest = await fetchSchoolData();
          if (isMounted) setDb(latest);
        }
        setSyncStatus('synced');
        setLastSynced(new Date().toLocaleTimeString('ar-IQ'));
      } catch {
        setSyncStatus('synced');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Internal helper to persist state locally and remotely with audit log
  const commitDbChange = async (newDb: SchoolDatabase, auditAction?: string, auditDetails?: string) => {
    // 1. Instantly update React state
    setDb(newDb);
    
    // 2. Instantly persist to local storage cache for offline resilience
    try {
      localStorage.setItem(OFFLINE_DB_KEY, JSON.stringify(newDb));
      localStorage.setItem('madrasati_offline_backup', JSON.stringify(newDb));
    } catch (e) {
      console.warn('LocalStorage offline cache error:', e);
    }

    if (auditAction) {
      const actorName =
        currentAccount.role === 'TEACHER' || currentAccount.role === 'INSTRUCTOR'
          ? formatTeacherName(currentAccount.fullName)
          : currentAccount.fullName;

      const newLog: AuditLogEntry = {
        id: `log-${Date.now()}`,
        action: auditAction,
        category: 'ADMIN',
        performedBy: actorName,
        role: currentAccount.role,
        details: auditDetails || '',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      newDb.auditLogs = [newLog, ...(newDb.auditLogs || [])];
      logAuditEvent(newLog).catch(() => {});
    }

    // 3. Save to backend immediately if online, or queue if offline
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      setSyncStatus('saving');
      try {
        await saveSchoolData(newDb);
        localStorage.removeItem(PENDING_SYNC_KEY);
        setSyncStatus('synced');
        setLastSynced(new Date().toLocaleTimeString('ar-IQ'));
      } catch (err) {
        console.warn('Server sync error, queued offline:', err);
        localStorage.setItem(PENDING_SYNC_KEY, 'true');
        setSyncStatus('offline');
      }
    } else {
      localStorage.setItem(PENDING_SYNC_KEY, 'true');
      setSyncStatus('offline');
    }
  };

  // Factory Reset: Completely zero out and reset all records to factory clean state
  const factoryReset = async (): Promise<boolean> => {
    setSyncStatus('saving');
    try {
      const res = await factoryResetSchoolData();
      if (res.success && res.data) {
        setDb(res.data);
        localStorage.removeItem(PENDING_SYNC_KEY);
        localStorage.setItem(OFFLINE_DB_KEY, JSON.stringify(res.data));
        localStorage.setItem('madrasati_offline_backup', JSON.stringify(res.data));
        setSyncStatus('synced');
        setLastSynced(new Date().toLocaleTimeString('ar-IQ'));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Factory reset failed:', err);
      setSyncStatus('error');
      return false;
    }
  };

  const switchRole = (role: AccountType) => {
    const accList = db?.accounts || [];
    const matchedAcc = accList.find((a) => a.role === role && a.status === 'ACTIVE');
    const acc = matchedAcc || (DEMO_ACCOUNTS as Record<string, UserAccount>)[role] || DEMO_ACCOUNTS.PRINCIPAL;
    setCurrentAccount(acc);
    // Log role switch
    logAuditEvent({
      action: 'تبديل الحساب النشط',
      category: 'SYSTEM',
      performedBy: acc.fullName,
      role: acc.role,
      details: `تم الانتقال إلى واجهة وصلاحيات: ${
        role === 'PRINCIPAL'
          ? 'المدير'
          : role === 'TEACHER'
          ? 'المعلم'
          : role === 'INSTRUCTOR'
          ? 'المدرّس'
          : 'ولي أمر الطالب'
      }`,
    });
  };

  // RBAC Permission Gates
  const canManageAccounts = currentAccount.role === 'PRINCIPAL';
  const canManageStaff = currentAccount.role === 'PRINCIPAL';
  const canEditClasses = currentAccount.role === 'PRINCIPAL';
  const canViewAuditLog = currentAccount.role === 'PRINCIPAL';
  const canEditGrades = currentAccount.role === 'PRINCIPAL' || currentAccount.role === 'TEACHER' || currentAccount.role === 'INSTRUCTOR';
  const canTakeAttendance = currentAccount.role === 'PRINCIPAL' || currentAccount.role === 'TEACHER' || currentAccount.role === 'INSTRUCTOR';
  const canWriteLessonPlan = currentAccount.role === 'TEACHER' || currentAccount.role === 'INSTRUCTOR';
  const isParentView = currentAccount.role === 'PARENT';

  // Account Management Actions
  const addAccount = async (accData: Omit<UserAccount, 'id'>) => {
    if (!db || !canManageAccounts) return;
    const newAcc: UserAccount = {
      ...accData,
      id: `acc-${Date.now()}`,
      status: accData.status || 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = {
      ...db,
      accounts: [newAcc, ...(db.accounts || [])],
    };
    await commitDbChange(
      updated,
      'إصدار حساب مستخدم جديد',
      `إنشاء حساب (${newAcc.fullName}) بنوع صلاحية [${newAcc.role}] وببريد (${newAcc.email})`
    );
  };

  const updateAccount = async (id: string, updates: Partial<UserAccount>) => {
    if (!db || !canManageAccounts) return;
    const updated = {
      ...db,
      accounts: (db.accounts || []).map((acc) => (acc.id === id ? { ...acc, ...updates } : acc)),
    };
    await commitDbChange(updated, 'تعديل بيانات حساب', `تعديل صلاحيات وسجل الحساب رقم ${id}`);
  };

  const suspendAccount = async (id: string, status: 'ACTIVE' | 'SUSPENDED') => {
    if (!db || !canManageAccounts) return;
    const target = (db.accounts || []).find((a) => a.id === id);
    const updated = {
      ...db,
      accounts: (db.accounts || []).map((acc) => (acc.id === id ? { ...acc, status } : acc)),
    };
    await commitDbChange(
      updated,
      status === 'SUSPENDED' ? 'إيقاف حساب مستخدم' : 'تفعيل حساب مستخدم',
      `تم تغيير حالة حساب (${target ? target.fullName : id}) إلى [${status === 'SUSPENDED' ? 'موقوف إدارياً' : 'نشط'}]`
    );
  };

  const deleteAccount = async (id: string) => {
    if (!db || !canManageAccounts) return;
    const target = (db.accounts || []).find((a) => a.id === id);
    const updated = {
      ...db,
      accounts: (db.accounts || []).filter((acc) => acc.id !== id),
    };
    await commitDbChange(
      updated,
      'حذف حساب نهائياً',
      `تم حذف حساب (${target ? target.fullName : id}) من السجلات الإدارية`
    );
  };

  const resetPassword = async (id: string, newPass: string) => {
    if (!db || !canManageAccounts) return;
    const target = (db.accounts || []).find((a) => a.id === id);
    const updated = {
      ...db,
      accounts: (db.accounts || []).map((acc) => (acc.id === id ? { ...acc, passwordHash: newPass } : acc)),
    };
    await commitDbChange(
      updated,
      'إعادة تعيين كلمة المرور',
      `تحديث كلمة المرور لحساب (${target ? target.fullName : id})`
    );
  };

  const linkParentStudent = async (parentId: string, studentIds: string[]) => {
    if (!db || !canManageAccounts) return;
    const target = (db.accounts || []).find((a) => a.id === parentId);
    const updated = {
      ...db,
      accounts: (db.accounts || []).map((acc) =>
        acc.id === parentId ? { ...acc, linkedStudentIds: studentIds } : acc
      ),
    };
    await commitDbChange(
      updated,
      'تعديل ربط الأبناء بحساب ولي الأمر',
      `ربط (${studentIds.length}) طلاب بحساب ولي الأمر (${target ? target.fullName : parentId})`
    );
  };

  // Stage & Branch Actions
  const addStage = async (stageData: { name: string; code: string; order: number; requiresBranch: boolean }) => {
    if (!db || !canManageStaff) return;
    const newStage: SchoolStage = {
      id: `stg-${Date.now()}`,
      ...stageData,
    };
    const updated = {
      ...db,
      stages: [...(db.stages || []), newStage],
    };
    await commitDbChange(updated, 'إضافة مرحلة دراسية جديدة', `استحداث مرحلة (${newStage.name}) في النظام`);
  };

  const addBranch = async (branchData: { name: string; code: string; stageCode: string }) => {
    if (!db || !canManageStaff) return;
    const newBranch: SchoolBranch = {
      id: `br-${Date.now()}`,
      ...branchData,
    };
    const updated = {
      ...db,
      branches: [...(db.branches || []), newBranch],
    };
    await commitDbChange(updated, 'إضافة فرع دراسي جديد', `استحداث فرع (${newBranch.name}) للمرحلة الإعدادية`);
  };

  // Student Section Transfer & Academic Promotion
  const transferStudentSection = async (studentId: string, targetSection: string, reason: string) => {
    if (!db || !canManageStaff) return;
    const student = db.students.find((s) => s.id === studentId);
    if (!student) return;

    const transferRec: StudentTransferRecord = {
      id: `tr-${Date.now()}`,
      studentId,
      fromClass: `${student.gradeLevel} (${student.section})`,
      toClass: `${student.gradeLevel} (${targetSection})`,
      date: new Date().toISOString().split('T')[0],
      reason: reason || 'تعديل الشعبة بقرار إداري',
      academicYear: activeAcademicYear,
    };

    const updated = {
      ...db,
      students: db.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              section: targetSection,
              transferHistory: [transferRec, ...(s.transferHistory || [])],
            }
          : s
      ),
      studentTransfers: [transferRec, ...(db.studentTransfers || [])],
    };

    await commitDbChange(
      updated,
      'نقل طالب بين الشعب',
      `نقل الطالب (${student.fullName}) من الشعبة (${student.section}) إلى الشعبة (${targetSection}) - السبب: ${reason}`
    );
  };

  const promoteStudentAcademicStatus = async (
    studentId: string,
    status: StudentAcademicStatus,
    nextGradeLevel?: string
  ) => {
    if (!db || !canManageStaff) return;
    const student = db.students.find((s) => s.id === studentId);
    if (!student) return;

    const updated = {
      ...db,
      students: db.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              academicStatus: status,
              gradeLevel: nextGradeLevel || s.gradeLevel,
            }
          : s
      ),
    };

    await commitDbChange(
      updated,
      'ترحيل/تحديث النتيجة الأكاديمية للطالب',
      `تحديث حالة الطالب (${student.fullName}) إلى [${status}] - الصف الحالي: (${nextGradeLevel || student.gradeLevel})`
    );
  };

  // Staff Allocation Actions
  const allocateStaffSubject = async (allocationData: Omit<StaffAllocation, 'id'>) => {
    if (!db || !canManageStaff) return;
    const newAllocation: StaffAllocation = {
      id: `alloc-${Date.now()}`,
      ...allocationData,
    };
    const updated = {
      ...db,
      staffAllocations: [newAllocation, ...(db.staffAllocations || [])],
    };
    await commitDbChange(
      updated,
      'توزيع جدول الكادر التدريسي',
      `تخصيص مادة (${newAllocation.subject}) للمدرس (${newAllocation.teacherName}) في ${newAllocation.gradeLevel} الشعبة (${newAllocation.section})`
    );
  };

  const deallocateStaffSubject = async (id: string) => {
    if (!db || !canManageStaff) return;
    const updated = {
      ...db,
      staffAllocations: (db.staffAllocations || []).filter((a) => a.id !== id),
    };
    await commitDbChange(updated, 'إلغاء تخصيص مادة لكادر', `إلغاء تخصيص المادة رقم ${id}`);
  };

  // Teacher Management
  const addTeacher = async (teacherData: Omit<Teacher, 'id' | 'createdAt'>) => {
    if (!db || !canManageStaff) return;
    const cleanName = teacherData.name.replace(/^أ\.\s*/, '');
    const newTeacher: Teacher = {
      ...teacherData,
      id: `t-${Date.now()}`,
      name: cleanName,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = {
      ...db,
      teachers: [newTeacher, ...db.teachers],
    };
    await commitDbChange(updated, 'إضافة عضو كادر تدريسي', `إضافة ${formatTeacherName(newTeacher.name)} وتعيين اختصاص ${newTeacher.specialization}`);
  };

  const updateTeacher = async (id: string, updates: Partial<Teacher>) => {
    if (!db || !canManageStaff) return;
    const updated = {
      ...db,
      teachers: db.teachers.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    };
    await commitDbChange(updated, 'تعديل بيانات تدريسي', `تعديل سجل التدريسي رقم ${id}`);
  };

  const deleteTeacher = async (id: string) => {
    if (!db || !canManageStaff) return;
    const target = db.teachers.find((t) => t.id === id);
    const updated = {
      ...db,
      teachers: db.teachers.filter((t) => t.id !== id),
      accounts: (db.accounts || []).filter((a) => a.id !== id && a.phone !== target?.phone),
      classes: db.classes.map((c) => c.supervisorId === id ? { ...c, supervisorId: '', supervisorName: '' } : c),
    };
    await commitDbChange(updated, 'حذف معلم من السجلات', `تم حذف المعلم ${target ? formatTeacherName(target.name) : id}`);
  };

  // Student Management
  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    if (!db || !canManageStaff) return;
    const newStudent: Student = {
      ...studentData,
      id: `s-${Date.now()}`,
    };
    const updated = {
      ...db,
      students: [newStudent, ...db.students],
    };
    await commitDbChange(updated, 'تسجيل طالب جديد', `تسجيل الطالب ${newStudent.fullName} في ${newStudent.gradeLevel} الشعبة ${newStudent.section}`);
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    if (!db || !canManageStaff) return;
    const updated = {
      ...db,
      students: db.students.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    };
    await commitDbChange(updated, 'تعديل سجل طالب', `تعديل بيانات الطالب رقم ${id}`);
  };

  const deleteStudent = async (id: string) => {
    if (!db || !canManageStaff) return;
    const target = db.students.find((s) => s.id === id);
    const updated = {
      ...db,
      students: db.students.filter((s) => s.id !== id),
      grades: db.grades.filter((g) => g.studentId !== id),
      attendance: db.attendance.filter((a) => a.studentId !== id),
      studentParentRelations: (db.studentParentRelations || []).filter((r) => r.studentId !== id),
    };
    await commitDbChange(updated, 'حذف سجل طالب', `شطب الطالب ${target ? target.fullName : id} من القيود المدرسية`);
  };

  // Class Management
  const addClass = async (cls: Omit<Classroom, 'id'>) => {
    if (!db || !canEditClasses) return;
    const supervisor = cls.supervisorId ? db.teachers.find((t) => t.id === cls.supervisorId) : undefined;
    const newCls: Classroom = {
      ...cls,
      stage: 'PRIMARY',
      supervisorName: supervisor ? formatTeacherName(supervisor.name) : cls.supervisorName || '',
      id: `c-${Date.now()}`,
    };
    const updated = {
      ...db,
      classes: [...db.classes, newCls],
    };
    await commitDbChange(updated, 'استحداث شعبة دراسية', `إضافة ${newCls.level} الشعبة (${newCls.section})`);
  };

  const updateClass = async (id: string, updates: Partial<Classroom>) => {
    if (!db || !canEditClasses) return;
    const supervisor = updates.supervisorId ? db.teachers.find((t) => t.id === updates.supervisorId) : undefined;
    const supervisorName = supervisor ? formatTeacherName(supervisor.name) : updates.supervisorName;
    const updated = {
      ...db,
      classes: db.classes.map((c) => (c.id === id ? { ...c, ...updates, ...(supervisorName !== undefined ? { supervisorName } : {}) } : c)),
    };
    await commitDbChange(updated, 'تعديل بيانات شعبة', `تعديل الشعبة رقم ${id}`);
  };

  const deleteClass = async (id: string) => {
    if (!db || !canEditClasses) return;
    const target = db.classes.find((c) => c.id === id);
    const updated = {
      ...db,
      classes: db.classes.filter((c) => c.id !== id),
      timetables: db.timetables.filter((t) => {
        if (t.classId && t.classId === id) return false;
        if (target && t.gradeLevel === target.level && t.section === target.section) return false;
        return true;
      }),
    };
    await commitDbChange(updated, 'حذف شعبة دراسية', `حذف ${target ? `${target.level} (${target.section})` : id}`);
  };

  const deleteGrade = async (id: string) => {
    if (!db || !canEditGrades) return;
    const target = db.grades.find((g) => g.id === id);
    const updated = {
      ...db,
      grades: db.grades.filter((g) => g.id !== id),
    };
    await commitDbChange(updated, 'مسح درجات مادة', `مسح سجل درجات المادة ${target ? target.subject : id}`);
  };

  // Helper to calculate consecutive absences for a student
  const getStudentConsecutiveAbsences = (studentId: string, currentDate: string, currentStatus: string, existingAttendance: AttendanceRecord[]): number => {
    if (currentStatus !== 'ABSENT') return 0;
    // Get all records for this student excluding current date, sorted descending by date
    const studentHistory = existingAttendance
      .filter((a) => a.studentId === studentId && a.date !== currentDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let count = 1; // Current absence
    for (const item of studentHistory) {
      if (item.status === 'ABSENT') {
        count++;
      } else {
        break; // Sequence broken
      }
    }
    return count;
  };

  // Push Token & Notification Functions
  const registerPushToken = async (token: string, platform: 'ANDROID' | 'IOS' | 'WEB' = 'WEB') => {
    if (!currentAccount) return;
    await registerDevicePushToken(currentAccount.id, currentAccount.role, token, platform);
    if (db) {
      const existing = db.devicePushTokens || [];
      const updated = [
        {
          id: `tok-${Date.now()}`,
          userId: currentAccount.id,
          userRole: currentAccount.role,
          token,
          platform,
          enabled: true,
          lastActive: new Date().toISOString().replace('T', ' ').substring(0, 19),
        },
        ...existing.filter((t) => t.token !== token),
      ];
      setDb({ ...db, devicePushTokens: updated });
    }
  };

  const sendNotificationWithPush = async (notifData: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    if (!db) return;
    const newNotif: NotificationItem = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      read: false,
      pushStatus: 'DELIVERED',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    const updated = {
      ...db,
      notifications: [newNotif, ...(db.notifications || [])],
    };

    await commitDbChange(updated, 'إرسال إشعار فوري للهاتف', `إرسال [${newNotif.category}] بعنوان: ${newNotif.title}`);
    await sendPushNotification({
      title: newNotif.title,
      body: newNotif.body,
      category: newNotif.category,
      targetRole: newNotif.targetRole,
      targetStudentId: newNotif.targetStudentId,
      targetParentId: newNotif.targetParentId,
      targetUserId: newNotif.targetUserId,
    });
  };

  const updateNotificationPreferences = async (prefs: Partial<NotificationPreferences>) => {
    if (!currentAccount || !db) return;
    const updatedPref: NotificationPreferences = {
      userId: currentAccount.id,
      absenceAlerts: prefs.absenceAlerts ?? true,
      tardinessAlerts: prefs.tardinessAlerts ?? true,
      newGradeAlerts: prefs.newGradeAlerts ?? true,
      homeworkAlerts: prefs.homeworkAlerts ?? true,
      timetableAlerts: prefs.timetableAlerts ?? true,
      announcementAlerts: prefs.announcementAlerts ?? true,
      adminMandatoryAlerts: true,
    };

    const existingList = db.notificationPreferences || [];
    const filtered = existingList.filter((p) => p.userId !== currentAccount.id);
    const updated = {
      ...db,
      notificationPreferences: [updatedPref, ...filtered],
    };

    await commitDbChange(updated);
    await saveNotificationPreferences(currentAccount.id, updatedPref);
  };

  const getUserNotificationPreferences = (userId: string): NotificationPreferences => {
    const found = db?.notificationPreferences?.find((p) => p.userId === userId);
    if (found) return found;
    return {
      userId,
      absenceAlerts: true,
      tardinessAlerts: true,
      newGradeAlerts: true,
      homeworkAlerts: true,
      timetableAlerts: true,
      announcementAlerts: true,
      adminMandatoryAlerts: true,
    };
  };

  // Attendance Actions
  const recordAttendance = async (record: Omit<AttendanceRecord, 'id' | 'time'>) => {
    if (!db || !canTakeAttendance) return;
    await recordAttendanceBatch([record]);
  };

  const recordAttendanceBatch = async (records: Array<Omit<AttendanceRecord, 'id' | 'time'>>) => {
    if (!db || !canTakeAttendance || records.length === 0) return;

    let currentAttendanceList = [...db.attendance];
    let newGeneratedNotifications: NotificationItem[] = [];

    for (const rec of records) {
      const consec = getStudentConsecutiveAbsences(rec.studentId, rec.date, rec.status, currentAttendanceList);

      const newRec: AttendanceRecord = {
        ...rec,
        id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
        consecutiveAbsences: consec,
      };

      // Filter existing record for student & date
      currentAttendanceList = currentAttendanceList.filter(
        (a) => !(a.studentId === rec.studentId && a.date === rec.date)
      );
      currentAttendanceList.unshift(newRec);

      // Trigger automatic Parent Notification if ABSENT, LATE, or EARLY_EXIT
      if (rec.status === 'ABSENT' || rec.status === 'LATE' || rec.status === 'EARLY_EXIT') {
        let title = '';
        let body = '';

        if (rec.status === 'ABSENT') {
          title = `إشعار غياب طالب: ${rec.studentName}`;
          body = `تم تسجيل غياب الطالب (${rec.studentName}) عن الدوام اليوم (${rec.date}).`;
          if (consec >= 3) {
            body += ` ⚠️ تنبيه هام: هذا هو غياب الطالب لليوم الـ (${consec}) على التوالي. يرجى مراجعة إدارة المدرسة.`;
          } else {
            body += ` يرجى تزويد الإدارة برقعة الإجازة الرسمية.`;
          }
        } else if (rec.status === 'LATE') {
          title = `إشعار تأخر طالب: ${rec.studentName}`;
          body = `تم تسجيل وصول متأخر للطالب (${rec.studentName}) اليوم (${rec.date}).`;
        } else if (rec.status === 'EARLY_EXIT') {
          title = `إشعار خروج مبكر: ${rec.studentName}`;
          body = `تم تسجيل خروج مبكر للطالب (${rec.studentName}) من المدرسة اليوم (${rec.date}).`;
        }

        const notif: NotificationItem = {
          id: `notif-att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          title,
          body,
          category: 'ATTENDANCE',
          targetRole: 'PARENT',
          targetStudentId: rec.studentId,
          pushStatus: 'DELIVERED',
          read: false,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        newGeneratedNotifications.push(notif);

        // Send to backend push dispatcher async
        sendPushNotification({
          title,
          body,
          category: 'ATTENDANCE',
          targetRole: 'PARENT',
          targetStudentId: rec.studentId,
        });
      }
    }

    const updated = {
      ...db,
      attendance: currentAttendanceList,
      notifications: [...newGeneratedNotifications, ...(db.notifications || [])],
    };

    const countText = records.length === 1 ? `للطالب ${records[0].studentName}` : `لعدد (${records.length}) طلاب`;
    await commitDbChange(
      updated,
      'رصد حضور وغياب شامل',
      `تم رصد سجلات الحضور والغياب والإشعارات الفورية ${countText}`
    );
  };

  // Grades
  const recordGrade = async (gradeData: Omit<GradeRecord, 'id' | 'updatedAt'>) => {
    if (!db || !canEditGrades) return;
    const newGrade: GradeRecord = {
      ...gradeData,
      id: `g-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    // Replace if exists for student + subject
    const filtered = db.grades.filter(
      (g) => !(g.studentId === gradeData.studentId && g.subject === gradeData.subject)
    );
    const updated = {
      ...db,
      grades: [newGrade, ...filtered],
    };
    const student = db.students.find((s) => s.id === gradeData.studentId);
    await commitDbChange(
      updated,
      'تثبيت درجات الامتحان',
      `رصد درجات مادة ${gradeData.subject} للطالب ${student ? student.fullName : gradeData.studentId}`
    );
  };

  const updateGrade = async (id: string, updates: Partial<GradeRecord>) => {
    if (!db || !canEditGrades) return;
    const updated = {
      ...db,
      grades: db.grades.map((g) => (g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : g)),
    };
    await commitDbChange(updated, 'تعديل درجات طالب', `تعديل سجل الدرجات رقم ${id}`);
  };

  // Lesson Plans
  const addLessonPlan = async (planData: Omit<LessonPlan, 'id' | 'createdAt'>) => {
    if (!db || !canWriteLessonPlan) return;
    const newPlan: LessonPlan = {
      ...planData,
      id: `lp-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = {
      ...db,
      lessonPlans: [newPlan, ...db.lessonPlans],
    };
    await commitDbChange(updated, 'إضافة خطة درس يومية', `إعداد خطة ${newPlan.subject}: ${newPlan.topic}`);
  };

  const deleteLessonPlan = async (id: string) => {
    if (!db) return;
    const updated = {
      ...db,
      lessonPlans: db.lessonPlans.filter((lp) => lp.id !== id),
    };
    await commitDbChange(updated, 'حذف خطة درس', `حذف الخطة اليومية رقم ${id}`);
  };

  // Timetable
  const updateTimetableSlot = async (slot: TimetableEntry) => {
    if (!db || !canManageStaff) return;
    const filtered = db.timetables.filter((t) => t.id !== slot.id);
    const updated = {
      ...db,
      timetables: [...filtered, slot],
    };
    await commitDbChange(updated, 'تحديث جدول الحصص', `تعديل حصة يوم ${slot.day} - الحصة ${slot.period}`);
  };

  // Curriculum Actions
  const addCurriculumEdition = async (editionData: Omit<CurriculumEdition, 'id'>) => {
    if (!db) return;
    const newEdition: CurriculumEdition = {
      ...editionData,
      id: `cur-ed-${Date.now()}`,
    };
    const updated = {
      ...db,
      curriculumEditions: [newEdition, ...(db.curriculumEditions || [])],
    };
    await commitDbChange(updated, 'إضافة كتاب/منهج دراسي جديد', `اعتماد كتاب: ${newEdition.bookTitle} - ${newEdition.editionNumber}`);
  };

  const updateCurriculumEdition = async (id: string, updates: Partial<CurriculumEdition>) => {
    if (!db) return;
    const updated = {
      ...db,
      curriculumEditions: (db.curriculumEditions || []).map((ed) => (ed.id === id ? { ...ed, ...updates } : ed)),
    };
    await commitDbChange(updated, 'تحديث بيانات المنهج', `تعديل المنهج رقم ${id}`);
  };

  const importCurriculumEditions = async (editions: CurriculumEdition[]) => {
    if (!db) return;
    const existing = db.curriculumEditions || [];
    const updated = {
      ...db,
      curriculumEditions: [...editions, ...existing],
    };
    await commitDbChange(updated, 'استيراد مناهج دراسية رسمية', `تم استيراد ${editions.length} منهج دراسي`);
  };

  const createSubjectPlan = async (planData: Omit<SubjectPlan, 'id' | 'updatedAt'>) => {
    if (!db) return;
    const newPlan: SubjectPlan = {
      ...planData,
      id: `sp-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    const updated = {
      ...db,
      subjectPlans: [newPlan, ...(db.subjectPlans || [])],
    };
    await commitDbChange(updated, 'إنشاء خطة مادة دراسية', `خطة مادة ${newPlan.subjectName} للصف ${newPlan.gradeLevel} شعبة ${newPlan.section}`);
  };

  const logLessonProgress = async (planId: string, lessonId: string, periodsSpent = 1, notes = '') => {
    if (!db) return;
    const plan = (db.subjectPlans || []).find((p) => p.id === planId);
    if (!plan) return;

    const edition = (db.curriculumEditions || []).find((e) => e.id === plan.curriculumEditionId);
    let chapterTitle = 'الفصل الأول';
    let lessonTitle = 'درس جديد';

    if (edition) {
      for (const ch of edition.chapters || []) {
        const foundLes = ch.lessons?.find((l) => l.id === lessonId);
        if (foundLes) {
          chapterTitle = ch.title;
          lessonTitle = foundLes.title;
          break;
        }
      }
    }

    const currentCompleted = plan.completedLessonIds || [];
    const isAlreadyCompleted = currentCompleted.includes(lessonId);
    const updatedCompleted = isAlreadyCompleted ? currentCompleted : [...currentCompleted, lessonId];

    const updatedPlans = (db.subjectPlans || []).map((p) =>
      p.id === planId
        ? {
            ...p,
            completedLessonIds: updatedCompleted,
            updatedAt: new Date().toISOString().split('T')[0],
          }
        : p
    );

    const newLog: LessonProgressLog = {
      id: `log-les-${Date.now()}`,
      subjectPlanId: planId,
      lessonId,
      chapterTitle,
      lessonTitle,
      executedByTeacherId: currentAccount.id,
      executedByTeacherName: formatTeacherName(currentAccount.fullName),
      gradeLevel: plan.gradeLevel,
      section: plan.section,
      executionDate: new Date().toISOString().split('T')[0],
      periodsSpent,
      notes,
    };

    const updated = {
      ...db,
      subjectPlans: updatedPlans,
      lessonProgressLogs: [newLog, ...(db.lessonProgressLogs || [])],
    };

    await commitDbChange(
      updated,
      'تسجيل إنجاز درس في المنهج',
      `تم شرح وتسجيل درس "${lessonTitle}" لمادة ${plan.subjectName} شعبة ${plan.section}`
    );
  };

  // Exam Weight Configuration & Rules
  const updateExamWeightConfig = async (id: string, updates: Partial<ExamWeightConfig>) => {
    if (!db) return;
    const updatedConfigs = (db.examWeightConfigs || []).map((cfg) =>
      cfg.id === id ? { ...cfg, ...updates } : cfg
    );
    const updated = {
      ...db,
      examWeightConfigs: updatedConfigs,
    };
    await commitDbChange(updated, 'تعديل أوزان الامتحانات', `تعديل ضوابط وأوزان امتحانات المرحلة رقم ${id}`);
  };

  const updateCalculationRules = async (rules: Partial<CalculationRulesConfig>) => {
    if (!db) return;
    const updated = {
      ...db,
      calculationRules: { ...(db.calculationRules || { passingMinGrade: 50, maxRemedialSubjectsCount: 3, allow49RoundingTo50: true, absentGradeValue: 'ZERO', annualEffortFormula: 'AVG_MONTHS' }), ...rules },
    };
    await commitDbChange(updated, 'تحديث قواعد حساب النتائج', `تحديث شروط النجاح والرسوب وقواعد المعالجة الوزارية`);
  };

  // Workflow Grade Recording with Audit History & Approval Stages
  const recordGradeWithWorkflow = async (gradeData: Partial<GradeRecord>, auditReason?: string) => {
    if (!db) return;

    const existingIndex = db.grades.findIndex(
      (g) => g.studentId === gradeData.studentId && g.subject === gradeData.subject && g.academicYear === (gradeData.academicYear || activeAcademicYear)
    );

    let auditEntries: GradeAuditHistory[] = [];
    let updatedGrade: GradeRecord;

    if (existingIndex >= 0) {
      const existing = db.grades[existingIndex];
      if (auditReason) {
        const auditItem: GradeAuditHistory = {
          id: `audit-grd-${Date.now()}`,
          gradeRecordId: existing.id,
          examType: 'تعديل درجات',
          previousValue: existing.totalGrade || null,
          newValue: gradeData.totalGrade || existing.totalGrade || 0,
          modifiedBy: currentAccount.fullName,
          modifiedRole: currentAccount.role,
          reason: auditReason,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        auditEntries = [auditItem, ...(existing.auditHistory || [])];
      } else {
        auditEntries = existing.auditHistory || [];
      }

      updatedGrade = {
        ...existing,
        ...gradeData,
        auditHistory: auditEntries,
        updatedAt: new Date().toISOString().split('T')[0],
      };
    } else {
      updatedGrade = {
        id: `grd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        studentId: gradeData.studentId || '',
        studentName: gradeData.studentName || '',
        gradeLevel: gradeData.gradeLevel || '',
        section: gradeData.section || 'أ',
        subject: gradeData.subject || '',
        academicYear: gradeData.academicYear || activeAcademicYear,
        month1: gradeData.month1 || 0,
        month2: gradeData.month2 || 0,
        midYear: gradeData.midYear || 0,
        month3: gradeData.month3,
        month4: gradeData.month4,
        dailyScore: gradeData.dailyScore,
        oralScore: gradeData.oralScore,
        practicalScore: gradeData.practicalScore,
        activityScore: gradeData.activityScore,
        annualEffort: gradeData.annualEffort,
        finalExam: gradeData.finalExam,
        totalGrade: gradeData.totalGrade,
        status: gradeData.status || 'PASS',
        approvalStatus: gradeData.approvalStatus || 'DRAFT',
        recordedBy: formatTeacherName(currentAccount.fullName),
        notes: gradeData.notes || '',
        auditHistory: [],
        updatedAt: new Date().toISOString().split('T')[0],
      };
    }

    const newGradesList = existingIndex >= 0
      ? db.grades.map((g, idx) => (idx === existingIndex ? updatedGrade : g))
      : [updatedGrade, ...db.grades];

    const updated = {
      ...db,
      grades: newGradesList,
      gradeAuditLogs: auditReason
        ? [
            {
              id: `log-aud-${Date.now()}`,
              gradeRecordId: updatedGrade.id,
              examType: 'تعديل درجات',
              previousValue: existingIndex >= 0 ? db.grades[existingIndex].totalGrade || null : null,
              newValue: updatedGrade.totalGrade || 0,
              modifiedBy: currentAccount.fullName,
              modifiedRole: currentAccount.role,
              reason: auditReason,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            },
            ...(db.gradeAuditLogs || []),
          ]
        : db.gradeAuditLogs,
    };

    const student = db.students.find((s) => s.id === gradeData.studentId);
    await commitDbChange(
      updated,
      'تثبيت/تعديل الدرجات الشاملة',
      `تسجيل درجات مادة ${gradeData.subject} للطالب ${student ? student.fullName : gradeData.studentId}`
    );
  };

  const updateGradeApprovalStatus = async (gradeId: string, newStatus: ExamApprovalStatus) => {
    if (!db) return;
    const updatedGrades = db.grades.map((g) =>
      g.id === gradeId
        ? {
            ...g,
            approvalStatus: newStatus,
            approvedBy: newStatus === 'APPROVED' || newStatus === 'PUBLISHED' ? currentAccount.fullName : g.approvedBy,
            approvalDate: newStatus === 'APPROVED' || newStatus === 'PUBLISHED' ? new Date().toISOString().split('T')[0] : g.approvalDate,
          }
        : g
    );

    const updated = {
      ...db,
      grades: updatedGrades,
    };

    await commitDbChange(updated, 'تغيير مرحلة اعتماد الدرجة', `تعديل حالة الاعتماد للدرجة رقم ${gradeId} إلى [${newStatus}]`);
  };

  const bulkImportGrades = async (importedGrades: Partial<GradeRecord>[]) => {
    if (!db) return;
    let currentList = [...db.grades];

    importedGrades.forEach((item) => {
      if (!item.studentId || !item.subject) return;
      const existingIdx = currentList.findIndex(
        (g) => g.studentId === item.studentId && g.subject === item.subject && g.academicYear === (item.academicYear || activeAcademicYear)
      );

      const record: GradeRecord = {
        id: existingIdx >= 0 ? currentList[existingIdx].id : `grd-imp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        studentId: item.studentId,
        studentName: item.studentName || '',
        gradeLevel: item.gradeLevel || 'الصف السادس الابتدائي',
        section: item.section || 'أ',
        subject: item.subject,
        academicYear: item.academicYear || activeAcademicYear,
        month1: Number(item.month1) || 0,
        month2: Number(item.month2) || 0,
        midYear: Number(item.midYear) || 0,
        finalExam: item.finalExam !== undefined ? Number(item.finalExam) : undefined,
        annualEffort: item.annualEffort !== undefined ? Number(item.annualEffort) : undefined,
        totalGrade: item.totalGrade !== undefined ? Number(item.totalGrade) : undefined,
        status: item.status || 'PASS',
        approvalStatus: 'DRAFT',
        recordedBy: formatTeacherName(currentAccount.fullName),
        notes: item.notes || 'مستوردة عبر شيت Excel',
        updatedAt: new Date().toISOString().split('T')[0],
      };

      if (existingIdx >= 0) {
        currentList[existingIdx] = { ...currentList[existingIdx], ...record };
      } else {
        currentList.push(record);
      }
    });

    const updated = {
      ...db,
      grades: currentList,
    };

    await commitDbChange(updated, 'استيراد درجات جماعي Excel', `تم استيراد ${importedGrades.length} سجل درجات من ملف شيت Excel`);
  };

  const addDetailedHomework = async (hwData: Omit<Homework, 'id' | 'createdAt'>) => {
    if (!db) return;
    const newHw: Homework = {
      ...hwData,
      id: `hw-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      teacherId: currentAccount.id,
      assignedBy: formatTeacherName(currentAccount.fullName),
      studentSubmissions: [],
    };
    const updated = {
      ...db,
      homework: [newHw, ...(db.homework || [])],
    };
    await commitDbChange(updated, 'إضافة واجب بيتي للطلاب', `واجب مادة ${newHw.subject}: ${newHw.title}`);
  };

  const updateHomeworkSubmission = async (homeworkId: string, submission: HomeworkSubmission) => {
    if (!db) return;
    const updatedHw = (db.homework || []).map((hw) => {
      if (hw.id !== homeworkId) return hw;
      const currentSubs = hw.studentSubmissions || [];
      const existingIdx = currentSubs.findIndex((s) => s.studentId === submission.studentId);
      let nextSubs = [...currentSubs];
      if (existingIdx >= 0) {
        nextSubs[existingIdx] = { ...nextSubs[existingIdx], ...submission };
      } else {
        nextSubs.push(submission);
      }
      return { ...hw, studentSubmissions: nextSubs };
    });

    const updated = {
      ...db,
      homework: updatedHw,
    };
    await commitDbChange(updated, 'تقييم تسليم الواجب البيتي', `تعديل تقييم الواجب للطالب ${submission.studentName}`);
  };

  const addDetailedLessonPlan = async (planData: Omit<LessonPlan, 'id' | 'createdAt'>) => {
    if (!db) return;
    const newPlan: LessonPlan = {
      ...planData,
      id: `lp-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      teacherId: currentAccount.id,
      teacherName: formatTeacherName(currentAccount.fullName),
    };
    const updated = {
      ...db,
      lessonPlans: [newPlan, ...(db.lessonPlans || [])],
    };
    await commitDbChange(updated, 'إضافة تحضير درس إلكتروني', `إعداد تحضير مادة ${newPlan.subject}: ${newPlan.topic}`);
  };

  const updateLessonPlanExecution = async (
    id: string,
    executionStatus: LessonExecutionStatus,
    executedPortion?: string,
    remainingPortion?: string
  ) => {
    if (!db) return;
    const updatedPlans = (db.lessonPlans || []).map((lp) =>
      lp.id === id
        ? {
            ...lp,
            executionStatus,
            executedPortion: executedPortion || lp.executedPortion,
            remainingPortion: remainingPortion || lp.remainingPortion,
          }
        : lp
    );

    const updated = {
      ...db,
      lessonPlans: updatedPlans,
    };

    await commitDbChange(updated, 'تحديث تنفيذ الشرح للدرس', `تعديل حالة التنفيذ لدرس رقم ${id} إلى [${executionStatus}]`);
  };

  const addPrincipalLessonFeedback = async (id: string, feedback: string) => {
    if (!db) return;
    const updatedPlans = (db.lessonPlans || []).map((lp) =>
      lp.id === id
        ? {
            ...lp,
            principalFeedback: feedback,
            principalFeedbackDate: new Date().toISOString().split('T')[0],
          }
        : lp
    );

    const updated = {
      ...db,
      lessonPlans: updatedPlans,
    };

    await commitDbChange(updated, 'إضافة توجيه إداري للتحضير', `إضافة ملاحظة المدير على تحضير رقم ${id}`);
  };

  const addCalendarEvent = async (eventData: Omit<AcademicCalendarEvent, 'id'>) => {
    if (!db) return;
    const newEvent: AcademicCalendarEvent = {
      ...eventData,
      id: `cal-${Date.now()}`,
    };
    const updated = {
      ...db,
      academicCalendarEvents: [newEvent, ...(db.academicCalendarEvents || [])],
    };

    await commitDbChange(updated, 'إضافة حدث للتقويم المدرسي', `إدراج حدث: ${newEvent.title} بتاريخ ${newEvent.date}`);
  };

  const addOfficialTemplate = async (tmplData: Omit<OfficialReportTemplate, 'id' | 'createdAt'>) => {
    if (!db) return;
    const newTmpl: OfficialReportTemplate = {
      ...tmplData,
      id: `tmpl-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = {
      ...db,
      officialTemplates: [newTmpl, ...(db.officialTemplates || [])],
    };
    await commitDbChange(updated, 'إضافة قالب نموذج رسمي', `استحداث قالب تقرير: ${newTmpl.title}`);
  };

  const updateOfficialTemplate = async (id: string, updates: Partial<OfficialReportTemplate>) => {
    if (!db) return;
    const updated = {
      ...db,
      officialTemplates: (db.officialTemplates || []).map((t) => (t.id === id ? { ...t, ...updates } : t)),
    };
    await commitDbChange(updated, 'تحديث قالب نموذج رسمي', `تعديل القالب رقم ${id}`);
  };

  const deleteOfficialTemplate = async (id: string) => {
    if (!db) return;
    const updated = {
      ...db,
      officialTemplates: (db.officialTemplates || []).filter((t) => t.id !== id),
    };
    await commitDbChange(updated, 'حذف قالب نموذج رسمي', `حذف القالب رقم ${id}`);
  };

  const approveOfficialTemplate = async (id: string, isApproved: boolean) => {
    if (!db) return;
    const updated = {
      ...db,
      officialTemplates: (db.officialTemplates || []).map((t) =>
        t.id === id
          ? {
              ...t,
              isApproved,
              approvedBy: isApproved ? currentAccount.fullName : undefined,
              approvalDate: isApproved ? new Date().toISOString().split('T')[0] : undefined,
            }
          : t
      ),
    };
    await commitDbChange(updated, isApproved ? 'اعتماد نموذج رسمي' : 'إلغاء اعتماد نموذج رسمي', `تغيير حالة اعتماد القالب رقم ${id}`);
  };

  const createNewAcademicYear = async (
    newYearName: string,
    startDate?: string,
    endDate?: string,
    notes?: string
  ) => {
    if (!db) return;
    setSyncStatus('saving');
    const res = await transitionAcademicYear(newYearName, startDate, endDate, notes);
    if (res.success) {
      setActiveAcademicYear(newYearName);
      const reloadedData = await fetchSchoolData();
      setDb(reloadedData);
      setSyncStatus('synced');
      setLastSynced(new Date().toLocaleTimeString('ar-IQ'));
    } else {
      setSyncStatus('error');
    }
  };

  const createIndependentBackup = async (notes = 'نسخة احتياطية مستقلة يدوية') => {
    if (!db) return;
    setSyncStatus('saving');
    const res = await createBackupSnapshot(notes);
    if (res.success) {
      const reloadedData = await fetchSchoolData();
      setDb(reloadedData);
      setSyncStatus('synced');
      setLastSynced(new Date().toLocaleTimeString('ar-IQ'));
    } else {
      setSyncStatus('error');
    }
  };

  const restoreIndependentBackup = async (filename: string) => {
    if (!db) return;
    setSyncStatus('saving');
    const res = await restoreBackupSnapshot(filename);
    if (res.success) {
      window.location.reload();
    } else {
      setSyncStatus('error');
    }
  };

  const triggerManualSync = async () => {
    if (!db) return;
    setSyncStatus('saving');
    try {
      await saveSchoolData(db);
      setSyncStatus('synced');
      setLastSynced(new Date().toLocaleTimeString('ar-IQ'));
    } catch {
      setSyncStatus('error');
    }
  };

  return (
    <SchoolContext.Provider
      value={{
        db,
        loading,
        error,
        currentAccount,
        setCurrentAccount,
        logout,
        switchRole,
        activeAcademicYear,
        setActiveAcademicYear,
        syncStatus,
        lastSynced,
        isOnline,
        factoryReset,
        deleteGrade,
        canManageAccounts,
        canManageStaff,
        canEditClasses,
        canViewAuditLog,
        canEditGrades,
        canTakeAttendance,
        canWriteLessonPlan,
        isParentView,
        addAccount,
        updateAccount,
        suspendAccount,
        deleteAccount,
        resetPassword,
        linkParentStudent,
        addStage,
        addBranch,
        transferStudentSection,
        promoteStudentAcademicStatus,
        allocateStaffSubject,
        deallocateStaffSubject,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addStudent,
        updateStudent,
        deleteStudent,
        addClass,
        updateClass,
        deleteClass,
        recordAttendance,
        recordAttendanceBatch,
        registerPushToken,
        sendNotificationWithPush,
        updateNotificationPreferences,
        getUserNotificationPreferences,
        recordGrade,
        updateGrade,
        addLessonPlan,
        deleteLessonPlan,
        updateTimetableSlot,
        addCurriculumEdition,
        updateCurriculumEdition,
        importCurriculumEditions,
        createSubjectPlan,
        logLessonProgress,
        updateExamWeightConfig,
        updateCalculationRules,
        recordGradeWithWorkflow,
        updateGradeApprovalStatus,
        bulkImportGrades,
        addDetailedHomework,
        updateHomeworkSubmission,
        addDetailedLessonPlan,
        updateLessonPlanExecution,
        addPrincipalLessonFeedback,
        addCalendarEvent,
        addOfficialTemplate,
        updateOfficialTemplate,
        deleteOfficialTemplate,
        approveOfficialTemplate,
        createNewAcademicYear,
        createIndependentBackup,
        restoreIndependentBackup,
        triggerManualSync,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
