export type AccountType = 'PRINCIPAL' | 'TEACHER' | 'INSTRUCTOR' | 'PARENT';

export type StageType = 'PRIMARY' | 'INTERMEDIATE' | 'SECONDARY' | string;

export type BranchType = 'GENERAL' | 'SCIENTIFIC' | 'LITERARY' | 'VOCATIONAL' | string;

export type YearStatus = 'ACTIVE' | 'ARCHIVED' | 'PLANNED';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export type StudentAcademicStatus = 'ACTIVE' | 'PROMOTED' | 'REPEATING' | 'REMEDIAL' | 'DEFERRED' | 'DROPPED';

export interface SchoolStage {
  id: string;
  name: string; // e.g. "المرحلة الابتدائية", "المرحلة المتوسطة", "المرحلة الإعدادية"
  code: string; // e.g. "PRIMARY", "INTERMEDIATE", "SECONDARY"
  order: number;
  requiresBranch: boolean;
}

export interface SchoolBranch {
  id: string;
  name: string; // e.g. "الفرع العلمي", "الفرع الأدبي", "الفرع المهني"
  code: string; // e.g. "SCIENTIFIC", "LITERARY", "VOCATIONAL"
  stageCode: string; // e.g. "SECONDARY"
}

export interface StudentTransferRecord {
  id: string;
  studentId: string;
  fromClass: string;
  toClass: string;
  date: string;
  reason: string;
  academicYear: string;
}

export interface StaffAllocation {
  id: string;
  teacherId: string;
  teacherName: string;
  stage: string;
  gradeLevel: string;
  section: string;
  subject: string;
  specialization: string;
  academicYear: string;
}

export interface UserAccount {
  id: string;
  fullName: string;
  role: AccountType;
  email: string;
  phone: string;
  passwordHash?: string;
  status: AccountStatus;
  avatar?: string;
  assignedClassIds?: string[]; // For Teachers & Instructors
  assignedSubjects?: string[]; // For Instructors & Teachers
  linkedStudentIds?: string[]; // For Parents
  permissions?: {
    canEditGrades?: boolean;
    canTakeAttendance?: boolean;
    canCreateHomework?: boolean;
    canWriteLessonPlans?: boolean;
    canManageParents?: boolean;
  };
  lastLogin?: string;
  createdAt?: string;
}

export interface Teacher {
  id: string;
  name: string; // Stored clean or formatted with «أ.»
  type: 'TEACHER' | 'INSTRUCTOR'; // معلم (ابتدائي) أو مدرس (ثانوي/إعدادي)
  specialization: string;
  qualification?: string; // e.g. بكالوريوس تربية، ماجستير، دبلوم، دكتوراه
  teachableSubjects?: string[];
  phone: string;
  email: string;
  classes: string;
  weeklyQuotas: number;
  createdAt: string;
}

export interface Student {
  id: string;
  fullName: string;
  stage: StageType;
  gradeLevel: string;
  section: string;
  branch?: BranchType;
  parentName: string;
  parentPhone: string;
  birthDate: string;
  academicYear: string;
  enrollmentNumber: string;
  enrollmentDate?: string;
  academicStatus?: StudentAcademicStatus;
  documentsCount?: number;
  notes?: string;
  transferHistory?: StudentTransferRecord[];
}

export interface Parent {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  occupation?: string;
  address?: string;
  linkedStudentIds: string[];
}

export interface StudentParentRelation {
  id: string;
  studentId: string;
  parentId: string;
  relationType: 'FATHER' | 'MOTHER' | 'GUARDIAN';
}

export interface Classroom {
  id: string;
  stage: StageType;
  level: string;
  section: string;
  branch?: BranchType;
  supervisorId: string;
  studentCount: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  stage: StageType;
  branch?: BranchType;
  weeklyHours: number;
}

export interface Specialization {
  id: string;
  title: string;
  category: 'HUMANITIES' | 'SCIENCES' | 'LANGUAGES' | 'RELIGION' | 'ART_SPORT';
}

export interface AcademicYearRecord {
  id: string;
  yearName: string; // e.g. "2024 - 2025"
  startDate: string; // e.g. "2024-09-15"
  endDate: string; // e.g. "2025-06-30"
  status: YearStatus; // ACTIVE, ARCHIVED, PLANNED
  notes?: string;
}

export interface CurriculumLesson {
  id: string;
  lessonNumber: number;
  title: string;
  pageNumber?: number;
  estimatedPeriods: number;
}

export interface CurriculumChapter {
  id: string;
  chapterNumber: number;
  title: string;
  lessons: CurriculumLesson[];
}

export interface CurriculumEdition {
  id: string;
  subjectName: string;
  bookTitle: string;
  stage: StageType;
  gradeLevel: string;
  branch?: BranchType;
  issuingBody: string; // e.g. "وزارة التربية - المديرية العامة للمناهج"
  editionYear: string; // e.g. "2024"
  editionNumber: string; // e.g. "الطبعة الثامنة 2024"
  approvalDate: string;
  status: 'ACTIVE' | 'PREVIOUS' | 'ARCHIVED';
  academicYear: string; // Year approved for
  pdfUrl?: string;
  totalPages?: number;
  chapters: CurriculumChapter[];
}

export interface SubjectPlan {
  id: string;
  curriculumEditionId: string;
  stage: StageType;
  gradeLevel: string;
  section: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  academicYear: string;
  targetCompletionDate?: string;
  completedLessonIds: string[];
  inProgressLessonId?: string;
  notes?: string;
  updatedAt: string;
}

export interface LessonProgressLog {
  id: string;
  subjectPlanId: string;
  lessonId: string;
  chapterTitle: string;
  lessonTitle: string;
  executedByTeacherId: string;
  executedByTeacherName: string;
  gradeLevel: string;
  section: string;
  executionDate: string;
  periodsSpent: number;
  notes?: string;
}

export interface Curriculum {
  id: string;
  subjectName: string;
  editionYear: string;
  authoringBody: string; // e.g. "وزارة التربية العراقية - المديرية العامة للمناهج"
  pdfUrl?: string;
}

export interface DevicePushToken {
  id: string;
  userId: string;
  userRole: AccountType;
  token: string;
  platform: 'ANDROID' | 'IOS' | 'WEB';
  enabled: boolean;
  lastActive: string;
}

export interface NotificationPreferences {
  userId: string;
  absenceAlerts: boolean;
  tardinessAlerts: boolean;
  newGradeAlerts: boolean;
  homeworkAlerts: boolean;
  timetableAlerts: boolean;
  announcementAlerts: boolean;
  adminMandatoryAlerts: boolean; // Always true
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  gradeLevel: string;
  section: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'EARLY_EXIT';
  notes: string;
  recordedBy: string;
  time: string;
  consecutiveAbsences?: number;
}

export type ExamType =
  | 'DAILY'
  | 'MONTHLY_1'
  | 'MONTHLY_2'
  | 'MID_YEAR'
  | 'MONTHLY_3'
  | 'MONTHLY_4'
  | 'FINAL_EXAM'
  | 'ORAL'
  | 'PRACTICAL'
  | 'ACTIVITY';

export type ExamApprovalStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED';

export interface GradeAuditHistory {
  id: string;
  gradeRecordId: string;
  examType: string;
  previousValue: number | null;
  newValue: number;
  modifiedBy: string;
  modifiedRole: string;
  reason: string;
  timestamp: string;
}

export interface ExamWeightConfig {
  id: string;
  stageCode: string; // PRIMARY, INTERMEDIATE, SECONDARY
  gradeLevel?: string;
  dailyWeight: number; // e.g. 10%
  monthlyWeight: number; // e.g. 30%
  midYearWeight: number; // e.g. 30%
  finalExamWeight: number; // e.g. 30%
  oralPracticalWeight?: number;
  activityWeight?: number;
  maxGrade: number; // Default 100
  passingGrade: number; // Default 50
  roundingRule: 'ROUND_HALF_UP' | 'ROUND_UP' | 'FLOOR';
  autoPassRemedialThreshold?: number; // e.g. 49.5 rounded to 50
}

export interface CalculationRulesConfig {
  passingMinGrade: number;
  maxRemedialSubjectsCount: number;
  allow49RoundingTo50: boolean;
  absentGradeValue: 'ZERO' | 'INCOMPLETE' | 'EXCUSED';
  annualEffortFormula: 'AVG_MONTHS' | 'WEIGHTED';
}

export interface GradeRecord {
  id: string;
  studentId: string;
  studentName?: string;
  gradeLevel: string;
  section: string;
  subject: string;
  academicYear: string;
  dailyScore?: number;
  month1: number;
  month2: number;
  midYear: number;
  month3?: number;
  month4?: number;
  oralScore?: number;
  practicalScore?: number;
  activityScore?: number;
  annualEffort?: number;
  finalExam?: number;
  totalGrade?: number;
  status: 'PASS' | 'FAIL' | 'REMEDIAL' | 'ABSENT' | 'INCOMPLETE';
  approvalStatus: ExamApprovalStatus;
  recordedBy: string;
  approvedBy?: string;
  approvalDate?: string;
  notes?: string;
  auditHistory?: GradeAuditHistory[];
  updatedAt: string;
}

export interface CumulativeYearEntry {
  academicYear: string;
  gradeLevel: string;
  section: string;
  stage: string;
  branch?: string;
  subjectGrades: GradeRecord[];
  totalScore: number;
  gpaAverage: number;
  failedSubjectsCount: number;
  annualStatus: 'PROMOTED' | 'REPEATING' | 'REMEDIAL' | 'DEFERRED' | 'DROPPED';
  attendanceDaysPresent: number;
  attendanceDaysAbsent: number;
  principalRemarks?: string;
  transfers?: StudentTransferRecord[];
}

export interface StudentCumulativeRecord {
  studentId: string;
  studentFullName: string;
  enrollmentNumber: string;
  academicYearsHistory: CumulativeYearEntry[];
}

export type LessonExecutionStatus =
  | 'FULLY_EXPLAINED'
  | 'PARTIALLY_EXPLAINED'
  | 'NOT_EXPLAINED'
  | 'POSTPONED';

export interface HomeworkSubmission {
  studentId: string;
  studentName: string;
  status: 'SUBMITTED' | 'PENDING' | 'EXCELLENT' | 'NEEDS_REVISION';
  submissionDate?: string;
  teacherRemarks?: string;
}

export interface Homework {
  id: string;
  teacherId?: string;
  assignedBy: string;
  academicYear: string;
  gradeLevel: string;
  section: string;
  subject: string;
  title: string;
  details: string;
  curriculumPages?: string;
  dueDate: string;
  attachmentUrl?: string;
  studentSubmissions?: HomeworkSubmission[];
  createdAt: string;
}

export interface LessonPlan {
  id: string;
  teacherId: string;
  teacherName: string;
  academicYear: string;
  stage?: StageType;
  gradeLevel: string;
  section: string;
  subject: string;
  curriculumEditionId?: string;
  curriculumChapterId?: string;
  curriculumLessonId?: string;
  bookPageRange?: string;
  date: string;
  periodNumber: number; // 1 to 6
  chapterTitle: string;
  topic: string; // عنوان الدرس
  objectives: string; // الأهداف التعليمية
  introduction?: string; // التمهيد والإثارة
  teachingAids?: string; // الوسائل التعليمية
  teachingSteps?: string; // خطوات الشرح
  classroomActivities?: string; // الأنشطة الصفية
  homework: string; // الواجب البيتي
  assessmentQuestions?: string; // التقويم والأسئلة
  executionStatus: LessonExecutionStatus;
  executedPortion?: string;
  remainingPortion?: string;
  principalFeedback?: string;
  principalFeedbackDate?: string;
  notes: string;
  createdAt: string;
}

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'SCHOOL_DAY' | 'NATIONAL_HOLIDAY' | 'RELIGIOUS_HOLIDAY' | 'EXAM_PERIOD' | 'TEACHER_LEAVE';
  notes?: string;
}

export interface TimetableEntry {
  id: string;
  day: 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس';
  period: number; // 1 to 6
  gradeLevel: string;
  section: string;
  subject: string;
  teacherName: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  category: 'ANNOUNCEMENT' | 'EXAM' | 'ATTENDANCE' | 'HOMEWORK' | 'GRADE' | 'TIMETABLE' | 'SYSTEM';
  targetRole: 'ALL' | AccountType;
  targetStudentId?: string;
  targetParentId?: string;
  targetUserId?: string;
  pushStatus?: 'DELIVERED' | 'SIMULATED_PUSH_SENT' | 'PENDING' | 'FAILED';
  deviceToken?: string;
  read: boolean;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  category: 'GRADES' | 'ATTENDANCE' | 'STAFF' | 'STUDENT_RECORD' | 'TIMETABLE' | 'ACADEMIC_YEAR' | 'ADMIN' | 'SYSTEM';
  performedBy: string;
  role: string;
  details: string;
  timestamp: string;
}

export interface SchoolInfo {
  name: string;
  directorate: string;
  principal: string;
  schoolCode: string;
  academicYear: string;
  semester: string;
  phone: string;
  address: string;
}

export interface OfficialReportTemplate {
  id: string;
  title: string;
  category: 'STUDENT_CERTIFICATE' | 'ACADEMIC_STATEMENT' | 'CLASS_ROSTER' | 'OFFICIAL_LETTER' | 'GRADES_MATRIX';
  issuingBody: string; // e.g. "جمهورية العراق - وزارة التربية - المديرية العامة لتربية بغداد الرصافة الأولى"
  schoolName: string;
  referenceNumberPrefix: string; // e.g. "م.ر / 2024 /"
  headerLayout: string;
  footerLayout: string;
  contentTemplate: string;
  stampImageUrl?: string;
  headerLogoUrl?: string;
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  pageSize: 'A4' | 'LETTER';
  isApproved: boolean; // "معتمد رسمياً من قبل مدير المدرسة"
  approvedBy?: string;
  approvalDate?: string;
  createdAt: string;
}

export interface BackupSnapshot {
  id: string;
  filename: string;
  createdAt: string;
  academicYear: string;
  sizeBytes: number;
  notes: string;
  isAutoSnapshot: boolean;
  counts: {
    students: number;
    teachers: number;
    grades: number;
    attendance: number;
    lessonPlans: number;
  };
}

export interface SchoolDatabase {
  schoolInfo: SchoolInfo;
  currentAcademicYear: string;
  availableYears: AcademicYearRecord[];
  accounts?: UserAccount[];
  stages?: SchoolStage[];
  branches?: SchoolBranch[];
  classes: Classroom[];
  subjects: Subject[];
  specializations: Specialization[];
  curricula: Curriculum[];
  curriculumEditions?: CurriculumEdition[];
  subjectPlans?: SubjectPlan[];
  lessonProgressLogs?: LessonProgressLog[];
  teachers: Teacher[];
  students: Student[];
  parents: Parent[];
  studentParentRelations: StudentParentRelation[];
  staffAllocations?: StaffAllocation[];
  studentTransfers?: StudentTransferRecord[];
  attendance: AttendanceRecord[];
  grades: GradeRecord[];
  examWeightConfigs?: ExamWeightConfig[];
  calculationRules?: CalculationRulesConfig;
  gradeAuditLogs?: GradeAuditHistory[];
  studentCumulativeRecords?: StudentCumulativeRecord[];
  homework: Homework[];
  lessonPlans: LessonPlan[];
  academicCalendarEvents?: AcademicCalendarEvent[];
  timetables: TimetableEntry[];
  notifications: NotificationItem[];
  devicePushTokens?: DevicePushToken[];
  notificationPreferences?: NotificationPreferences[];
  officialTemplates?: OfficialReportTemplate[];
  backupSnapshots?: BackupSnapshot[];
  auditLogs: AuditLogEntry[];
}

/**
 * Strict Naming Convention Rule:
 * Add «أ.» before any teacher or instructor name.
 * DO NOT add «أ.» to students, parents, or principals.
 */
export function formatTeacherName(name: string): string {
  if (!name) return '';
  const trimmed = name.trim();
  const clean = trimmed
    .replace(/^(أ\.\s*)+/gi, '')
    .replace(/^(أ\s*\/\s*)+/gi, '')
    .replace(/^(أستاذ|أستاذة)\s+/gi, '')
    .trim();
  return `أ. ${clean}`;
}

export function formatDisplayName(personName: string, role: AccountType): string {
  if (role === 'TEACHER' || role === 'INSTRUCTOR') {
    return formatTeacherName(personName);
  }
  return personName;
}
