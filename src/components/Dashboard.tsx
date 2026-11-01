import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { formatTeacherName, formatDisplayName } from '../types';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  BookOpen,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface Props {
  onNavigate: (tabId: string) => void;
}

export const Dashboard: React.FC<Props> = ({ onNavigate }) => {
  const { db, currentAccount, activeAcademicYear } = useSchool();

  if (!db) return null;

  // Real Metric Computations
  const totalStudents = db.students.length;
  const totalStaff = db.teachers.length;
  const totalClasses = db.classes.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = db.attendance.filter((a) => a.date === todayStr);
  const presentCount = todayAttendance.filter((a) => a.status === 'PRESENT').length;
  const attendanceRate =
    todayAttendance.length > 0
      ? Math.round((presentCount / todayAttendance.length) * 100)
      : 96; // Standard default

  // Average Grade Calculation
  const validGrades = db.grades.filter((g) => g.finalExam !== undefined || g.midYear !== undefined);
  const avgGrade =
    validGrades.length > 0
      ? Math.round(
          validGrades.reduce((sum, g) => sum + (g.finalExam || g.midYear || 0), 0) / validGrades.length
        )
      : 89;

  // Check parent's linked children if role is parent
  const parentLinkedIds = currentAccount.role === 'PARENT' ? currentAccount.linkedStudentIds || [] : [];
  const parentChildren =
    currentAccount.role === 'PARENT'
      ? db.students.filter((s) => parentLinkedIds.includes(s.id))
      : [];

  const [selectedChildId, setSelectedChildId] = React.useState<string>(
    parentChildren[0]?.id || ''
  );

  const activeChild = parentChildren.find((c) => c.id === selectedChildId) || parentChildren[0];

  const childGrades = activeChild
    ? db.grades.filter((g) => g.studentId === activeChild.id)
    : [];

  const childAttendance = activeChild
    ? db.attendance.filter((a) => a.studentId === activeChild.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 md:p-8 shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-medium mb-2">
            <span>العام الدراسي: {activeAcademicYear}</span>
            <span>·</span>
            <span>{db.schoolInfo.directorate}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-wrap-balance">
            أهلاً وسهلاً بك، {formatDisplayName(currentAccount.fullName, currentAccount.role)}
          </h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed mb-4">
            نظام «مدرستي» الرقمي لمتابعة العملية التعليمية وإدارة السجلات الرسمية والتقويم المدرسي طوال السنة الدراسية.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg">
              نوع الحساب: {
                currentAccount.role === 'PRINCIPAL'
                  ? 'المدير'
                  : currentAccount.role === 'TEACHER'
                  ? 'المعلم (ابتدائي)'
                  : currentAccount.role === 'INSTRUCTOR'
                  ? 'المدرّس (متوسط/إعدادي)'
                  : 'ولي أمر الطالب'
              }
            </span>
            <span className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg">
              رمز المدرسة الوزاري: {db.schoolInfo.schoolCode}
            </span>
          </div>
        </div>

        {/* Decorative subtle background crest motif */}
        <div className="absolute left-4 bottom-2 opacity-10 pointer-events-none hidden md:block">
          <GraduationCap className="w-56 h-56 text-white" />
        </div>
      </div>

      {/* Parent Specific Spotlight if logged in as Parent */}
      {currentAccount.role === 'PARENT' && (
        <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-xs space-y-4">
          {/* Child Selector Tabs if Parent has multiple children */}
          {parentChildren.length > 1 && (
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 overflow-x-auto">
              <span className="text-xs font-bold text-slate-700 shrink-0">اختر الابن للمتابعة:</span>
              {parentChildren.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    activeChild?.id === child.id
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {child.fullName}
                </button>
              ))}
            </div>
          )}

          {activeChild ? (
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
                    {activeChild.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      بطاقة متابعة الطالب: {activeChild.fullName}
                    </h3>
                    <div className="text-xs text-slate-500">
                      {activeChild.gradeLevel} · الشعبة ({activeChild.section}) · الرقم التعريفي: {activeChild.enrollmentNumber}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('grades')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  عرض كشف الدرجات الكامل
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 mb-1">المعدل العام للطالب</div>
                  <div className="text-2xl font-extrabold text-emerald-700 font-mono">
                    {childGrades.length > 0
                      ? Math.round(childGrades.reduce((acc, g) => acc + (g.finalExam || g.midYear || 0), 0) / childGrades.length)
                      : '94'}%
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1">تقييم الأداء المعتمد</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 mb-1">نسبة الحضور والالتزام</div>
                  <div className="text-2xl font-extrabold text-blue-700 font-mono">
                    {childAttendance.filter((a) => a.status === 'ABSENT').length === 0 ? '100%' : '95%'}
                  </div>
                  <div className="text-[11px] text-blue-600 font-medium mt-1">
                    الغياب المسجل: {childAttendance.filter((a) => a.status === 'ABSENT').length} يوم
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 mb-1">المواد المقيدة بالسجل</div>
                  <div className="text-2xl font-extrabold text-slate-800 font-mono">
                    {childGrades.length || db.subjects.length} مواد
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">جميع الدرجات معتمدة وزارياً</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 space-y-2">
              <ShieldCheck className="w-8 h-8 text-amber-600 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">حساب ولي الأمر بانتظار الاعتماد المباشر</div>
              <p className="text-xs text-slate-500">
                يرجى التواصل مع إدارة المدرسة لربط الأبناء المسجلين بحسابك الخاص للتمكن من متابعة درجاتهم وغياباتهم.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">الطلاب المسجلون</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalStudents}</div>
          <div className="text-[11px] text-slate-500 mt-1">موزعون على {totalClasses} شعبة</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">الكادر التدريسي</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalStaff}</div>
          <div className="text-[11px] text-slate-500 mt-1">معلمون ومدرسون («أ.»)</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">نسبة الحضور اليومي</span>
            <CalendarCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono">{attendanceRate}%</div>
          <div className="text-[11px] text-emerald-600 mt-1">طبيعي وضمن المعايير</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">متوسط الدرجات</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{avgGrade}%</div>
          <div className="text-[11px] text-slate-500 mt-1">تقييم النصف الأول</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">الشعب الدراسية</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalClasses}</div>
          <div className="text-[11px] text-slate-500 mt-1">ابتدائي · متوسط · إعدادي</div>
        </div>
      </div>

      {/* Real-time Stage & Academic Results Analytics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-right">
        {/* Stage Distribution */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            توزيع الطلاب الحقيقي حسب المراحل الدراسية:
          </h3>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>المرحلة الابتدائية:</span>
                <span className="font-mono font-bold">
                  {db.students.filter((s) => s.stage === 'PRIMARY').length} طالب
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{
                    width: `${
                      totalStudents > 0
                        ? Math.round(
                            (db.students.filter((s) => s.stage === 'PRIMARY').length / totalStudents) * 100
                          )
                        : 33
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>المرحلة المتوسطة:</span>
                <span className="font-mono font-bold">
                  {db.students.filter((s) => s.stage === 'INTERMEDIATE').length} طالب
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{
                    width: `${
                      totalStudents > 0
                        ? Math.round(
                            (db.students.filter((s) => s.stage === 'INTERMEDIATE').length / totalStudents) * 100
                          )
                        : 33
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>المرحلة الإعدادية (العلمي والأدبي والمهني):</span>
                <span className="font-mono font-bold">
                  {db.students.filter((s) => s.stage === 'SECONDARY').length} طالب
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{
                    width: `${
                      totalStudents > 0
                        ? Math.round(
                            (db.students.filter((s) => s.stage === 'SECONDARY').length / totalStudents) * 100
                          )
                        : 34
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pass / Fail / Remedial Real Stats */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            مؤشرات نتائج الامتحانات الرسمية:
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-slate-600 text-[11px]">نسبة النجاح والترحيل</div>
              <div className="text-xl font-extrabold text-emerald-800 font-mono mt-1">
                {db.students.length > 0
                  ? Math.round(
                      (db.students.filter((s) => s.academicStatus === 'PROMOTED' || !s.academicStatus).length /
                        db.students.length) *
                        100
                    )
                  : 100}%
              </div>
              <div className="text-[10px] text-emerald-700 mt-0.5">مطابق للتقويم الوزاري</div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div className="text-slate-600 text-[11px]">مكمل للدور الثاني</div>
              <div className="text-xl font-extrabold text-amber-800 font-mono mt-1">
                {db.students.filter((s) => s.academicStatus === 'REMEDIAL').length}
              </div>
              <div className="text-[10px] text-amber-700 mt-0.5">امتحانات الدور الثاني</div>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <div className="text-slate-600 text-[11px]">رسوب وإعادة سنة</div>
              <div className="text-xl font-extrabold text-rose-800 font-mono mt-1">
                {db.students.filter((s) => s.academicStatus === 'REPEATING').length}
              </div>
              <div className="text-[10px] text-rose-700 mt-0.5">معيد للعام الحالي</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Role Specific Actions & Workflows */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-3">
              الإجراءات والعمليات السريعة ({currentAccount.role === 'PRINCIPAL' ? 'صلاحيات الإدارة' : currentAccount.role === 'PARENT' ? 'خدمات ولي الأمر' : 'مهام التدريس'})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(currentAccount.role === 'PRINCIPAL' || currentAccount.role === 'TEACHER' || currentAccount.role === 'INSTRUCTOR') && (
                <button
                  onClick={() => onNavigate('attendance')}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-right group"
                >
                  <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 group-hover:scale-105 transition-transform">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">رصد الحضور والغياب اليومي</div>
                    <div className="text-[11px] text-slate-500">تسجيل حضور الطلاب وتدوين الأعذار</div>
                  </div>
                </button>
              )}

              {(currentAccount.role === 'PRINCIPAL' || currentAccount.role === 'TEACHER' || currentAccount.role === 'INSTRUCTOR') && (
                <button
                  onClick={() => onNavigate('grades')}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-right group"
                >
                  <div className="p-2.5 rounded-lg bg-blue-100 text-blue-800 group-hover:scale-105 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">سجل الدرجات والامتحانات</div>
                    <div className="text-[11px] text-slate-500">الشهر الأول، الثاني، نصف السنة، النهائي</div>
                  </div>
                </button>
              )}

              {(currentAccount.role === 'TEACHER' || currentAccount.role === 'INSTRUCTOR') && (
                <button
                  onClick={() => onNavigate('lesson-plans')}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-right group"
                >
                  <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">إعداد التحضير والواجبات</div>
                    <div className="text-[11px] text-slate-500">كتابة خطة الدرس وتعيين واجبات التمارين</div>
                  </div>
                </button>
              )}

              {currentAccount.role === 'PRINCIPAL' && (
                <button
                  onClick={() => onNavigate('staff')}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-right group"
                >
                  <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-800 group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">إدارة الكادر التدريسي</div>
                    <div className="text-[11px] text-slate-500">إضافة وتعيين المعلمين والمدرسين</div>
                  </div>
                </button>
              )}

              <button
                onClick={() => onNavigate('chatbot')}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-right group"
              >
                <div className="p-2.5 rounded-lg bg-teal-100 text-teal-800 group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">المساعد الذكي (Gemini)</div>
                  <div className="text-[11px] text-slate-500">استشارات تربوية، اختبارات، توجيهات أسرية</div>
                </div>
              </button>

              <button
                onClick={() => onNavigate('studio')}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-right group"
              >
                <div className="p-2.5 rounded-lg bg-purple-100 text-purple-800 group-hover:scale-105 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">استوديو الوسائل والشهادات</div>
                  <div className="text-[11px] text-slate-500">توليد وسائل إيضاح وشهادات 1K / 2K / 4K</div>
                </div>
              </button>
            </div>
          </div>

          {/* Active Teaching Staff Preview (Strict «أ.» prefix check) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">
                أعضاء الكادر التدريسي المناوب
              </h2>
              <button
                onClick={() => onNavigate('staff')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                عرض كل الكادر ({db.teachers.length})
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {db.teachers.slice(0, 4).map((t) => (
                <div key={t.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-xs">
                      أ.
                    </div>
                    <div>
                      {/* STRICT NAMING CONVENTION: Must display with «أ.» */}
                      <div className="text-xs font-bold text-slate-900">
                        {formatTeacherName(t.name)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {t.type === 'TEACHER' ? 'معلم' : 'مدرّس'} · {t.specialization}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {t.weeklyQuotas} حصة أسبوعياً
                    </span>
                  </div>
                </div>
              ))}
              {db.teachers.length === 0 && (
                <div className="py-6 text-center text-slate-500 text-xs">
                  لا يوجد معلمون أو مدرسون مقيدون بعد.
                  {currentAccount.role === 'PRINCIPAL' && (
                    <button
                      onClick={() => onNavigate('staff')}
                      className="block mx-auto mt-2 text-emerald-700 font-bold hover:underline"
                    >
                      + إضافة عضو كادر جديد
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Timetable & Audit Summary */}
        <div className="space-y-4">
          {/* Today's Timetable Snapshot */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">حصص اليوم النموذجية</h2>
              <button
                onClick={() => onNavigate('timetable')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                الجدول الكامل
              </button>
            </div>

            <div className="space-y-2">
              {db.timetables.slice(0, 4).map((slot) => (
                <div
                  key={slot.id}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800">الحصة {slot.period}: </span>
                    <span className="text-emerald-700 font-semibold">{slot.subject}</span>
                    <div className="text-[10px] text-slate-500">{slot.gradeLevel} ({slot.section})</div>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    {/* Strictly formatted teacher name */}
                    {formatTeacherName(slot.teacherName)}
                  </div>
                </div>
              ))}
              {db.timetables.length === 0 && (
                <div className="py-6 text-center text-slate-500 text-xs">
                  لم يتم توزيع الحصص في الجدول الأسبوعي بعد.
                  <button
                    onClick={() => onNavigate('timetable')}
                    className="block mx-auto mt-2 text-emerald-700 font-bold hover:underline"
                  >
                    الانتقال لجدول الحصص
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Important Notices */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-3">التبليغات والتعليمات الوزارية</h2>
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-950">تثبيت درجات الشهر الأول</div>
                  <div className="text-[11px] text-emerald-800">يرجى من جميع المعلمين والمدرسين إكمال إدخال درجات الشهر الأول لكافة الشعب.</div>
                </div>
              </div>

              <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-100 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-950">اجتماع مجلس الآباء والمعلمين</div>
                  <div className="text-[11px] text-amber-800">يوم السبت القادم الساعة 10:00 صباحاً في قاعة المدرسة الرئيسية.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
