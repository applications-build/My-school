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
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface Props {
  onNavigate: (tabId: string) => void;
}

export const Dashboard: React.FC<Props> = ({ onNavigate }) => {
  const { db, currentAccount } = useSchool();

  if (!db) return null;

  // Primary school metric computations
  const totalStudents = db.students.length;
  const totalStaff = db.teachers.length;
  const totalClasses = db.classes.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = db.attendance.filter((a) => a.date === todayStr);
  const presentCount = todayAttendance.filter((a) => a.status === 'PRESENT').length;
  const attendanceRate =
    todayAttendance.length > 0
      ? Math.round((presentCount / todayAttendance.length) * 100)
      : 96;

  // Average Grade Calculation
  const validGrades = db.grades.filter((g) => g.finalExam !== undefined || g.midYear !== undefined);
  const avgGrade =
    validGrades.length > 0
      ? Math.round(
          validGrades.reduce((sum, g) => sum + (g.finalExam || g.midYear || 0), 0) / validGrades.length
        )
      : 91;

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
      {/* Hero Welcome Banner (Cleaned as requested: No academic year, No directorate, No ministerial code) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 md:p-8 shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight mb-2 text-wrap-balance">
            أهلاً وسهلاً بك، {formatDisplayName(currentAccount.fullName, currentAccount.role)}
          </h1>
          <p className="text-emerald-100/90 text-xs md:text-sm leading-relaxed mb-4">
            نظام «مدرستي» لإدارة المدرسة الابتدائية، تحضير الدروس، رصد الدرجات، وسجلات الحضور والغياب اليومية.
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl font-bold">
              نوع الحساب:{' '}
              {currentAccount.role === 'PRINCIPAL'
                ? 'المدير'
                : currentAccount.role === 'TEACHER'
                ? 'الأستاذ / المعلم'
                : 'ولي أمر التلميذ'}
            </span>
            <span className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl">
              {db.schoolInfo.name}
            </span>
          </div>
        </div>

        {/* Decorative subtle background crest motif */}
        <div className="absolute left-4 bottom-2 opacity-10 pointer-events-none hidden md:block">
          <GraduationCap className="w-48 h-48 text-white" />
        </div>
      </div>

      {/* Parent Specific Spotlight if logged in as Parent */}
      {currentAccount.role === 'PARENT' && (
        <div className="bg-white border border-amber-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
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
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
                    {activeChild.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      بطاقة متابعة التلميذ: {activeChild.fullName}
                    </h3>
                    <div className="text-xs text-slate-500">
                      {activeChild.gradeLevel} · الشعبة ({activeChild.section})
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-500">نسبة الحضور التراكمية</div>
                  <div className="text-xl font-extrabold text-emerald-800 mt-1">
                    {childAttendance.length > 0
                      ? Math.round(
                          (childAttendance.filter((a) => a.status === 'PRESENT').length /
                            childAttendance.length) *
                            100
                        )
                      : 100}
                    %
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-500">عدد أيام الغياب المسجلة</div>
                  <div className="text-xl font-extrabold text-rose-800 mt-1">
                    {childAttendance.filter((a) => a.status === 'ABSENT').length} يوم
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-500">معدل درجات المواد</div>
                  <div className="text-xl font-extrabold text-indigo-800 mt-1">
                    {childGrades.length > 0
                      ? Math.round(
                          childGrades.reduce(
                            (acc, curr) => acc + (curr.finalExam || curr.midYear || curr.month1 || 0),
                            0
                          ) / childGrades.length
                        )
                      : 94}
                    %
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-slate-500">
              لم يتم ربط تلميذ بهذا الحساب بعد.
            </div>
          )}
        </div>
      )}

      {/* Primary School KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => onNavigate('students')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs cursor-pointer hover:border-emerald-500 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600">إجمالي التلاميذ</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalStudents}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">مسجلين في الصفوف الابتدائية</div>
        </div>

        <div
          onClick={() => onNavigate('staff')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs cursor-pointer hover:border-emerald-500 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600">الكادر التدريسي</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalStaff}</div>
          <div className="text-[11px] text-indigo-700 mt-1 font-medium">معلم وأستاذ بالمدرسة</div>
        </div>

        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs cursor-pointer hover:border-emerald-500 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600">نسبة الحضور اليوم</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800 font-mono">{attendanceRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">تحديث سجل اليوم الفعلي</div>
        </div>

        <div
          onClick={() => onNavigate('classes')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs cursor-pointer hover:border-emerald-500 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600">الصفوف والشعب</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalClasses}</div>
          <div className="text-[11px] text-purple-700 mt-1 font-medium">الأول إلى السادس الابتدائي</div>
        </div>
      </div>

      {/* Pass / Fail / Remedial Indicators */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 mb-3">
          مؤشرات نتائج الامتحانات الابتدائية:
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="text-slate-600 text-[11px]">نسبة النجاح والارتقاء</div>
            <div className="text-xl font-extrabold text-emerald-800 font-mono mt-1">
              {db.students.length > 0
                ? Math.round(
                    (db.students.filter((s) => s.academicStatus === 'PROMOTED' || !s.academicStatus).length /
                      db.students.length) *
                      100
                  )
                : 100}%
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">تلاميذ ناجحون</div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <div className="text-slate-600 text-[11px]">مكمل للدور الثاني</div>
            <div className="text-xl font-extrabold text-amber-800 font-mono mt-1">
              {db.students.filter((s) => s.academicStatus === 'REMEDIAL').length}
            </div>
            <div className="text-[10px] text-amber-700 mt-0.5 font-medium">امتحانات الإكمال</div>
          </div>

          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
            <div className="text-slate-600 text-[11px]">رسوب وإعادة سنة</div>
            <div className="text-xl font-extrabold text-rose-800 font-mono mt-1">
              {db.students.filter((s) => s.academicStatus === 'REPEATING').length}
            </div>
            <div className="text-[10px] text-rose-700 mt-0.5 font-medium">إعادة الصف</div>
          </div>
        </div>
      </div>

      {/* Quick Actions (Tailored without removed components) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 mb-3">
              الإجراءات والعمليات السريعة ({currentAccount.role === 'PRINCIPAL' ? 'صلاحيات الإدارة' : currentAccount.role === 'PARENT' ? 'متابعة التلميذ' : 'مهام التدريس'})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(currentAccount.role === 'PRINCIPAL' || currentAccount.role === 'TEACHER') && (
                <button
                  onClick={() => onNavigate('attendance')}
                  className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-right group"
                >
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 group-hover:scale-105 transition-transform">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">رصد الحضور والغياب اليومي</div>
                    <div className="text-[11px] text-slate-500">تسجيل حضور التلاميذ وتدوين التأخر</div>
                  </div>
                </button>
              )}

              {(currentAccount.role === 'PRINCIPAL' || currentAccount.role === 'TEACHER') && (
                <button
                  onClick={() => onNavigate('grades')}
                  className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-right group"
                >
                  <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800 group-hover:scale-105 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">سجل الدرجات والامتحانات</div>
                    <div className="text-[11px] text-slate-500">الفصل الأول، نصف السنة، والفصل الثاني</div>
                  </div>
                </button>
              )}

              {currentAccount.role === 'TEACHER' && (
                <button
                  onClick={() => onNavigate('lesson-plans')}
                  className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-right group"
                >
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">دفتر التحضير الإلكتروني</div>
                    <div className="text-[11px] text-slate-500">إعداد خطة الدرس وتعيين واجبات التلاميذ</div>
                  </div>
                </button>
              )}

              {currentAccount.role === 'PRINCIPAL' && (
                <button
                  onClick={() => onNavigate('staff')}
                  className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-right group"
                >
                  <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-800 group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">إدارة الكادر التعليمي</div>
                    <div className="text-[11px] text-slate-500">تعيين المعلمين والشعب والمواد</div>
                  </div>
                </button>
              )}

              <button
                onClick={() => onNavigate('timetable')}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-right group"
              >
                <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800 group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">الجدول الأسبوعي للحصص</div>
                  <div className="text-[11px] text-slate-500">توزيع الحصص والشاغر والعطل المدرسية</div>
                </div>
              </button>

              <button
                onClick={() => onNavigate('studio')}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-right group"
              >
                <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">شهادات التقدير والتفوق</div>
                  <div className="text-[11px] text-slate-500">قوالب احترافية قابلة للتعديل والطباعة على الهاتف</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Today's Timetable Snapshot */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">حصص اليوم في الجدول</h2>
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
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800">الحصة {slot.period}: </span>
                    <span className="text-emerald-700 font-semibold">{slot.subject}</span>
                    <div className="text-[10px] text-slate-500">{slot.gradeLevel} ({slot.section})</div>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    {slot.slotType === 'VACANT'
                      ? 'شاغر'
                      : slot.slotType === 'HOLIDAY'
                      ? 'عطلة'
                      : formatTeacherName(slot.teacherName)}
                  </div>
                </div>
              ))}
              {db.timetables.length === 0 && (
                <div className="py-6 text-center text-slate-500 text-xs">
                  لم يتم توزيع الحصص في الجدول الأسبوعي بعد.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
