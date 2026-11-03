import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { TimetableEntry, formatTeacherName } from '../types';
import {
  Calendar,
  Clock,
  Edit2,
  Filter,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  Coffee,
  Sun,
  Lock,
} from 'lucide-react';

export const Timetable: React.FC = () => {
  const { db, canManageStaff, currentAccount, updateTimetableSlot } = useSchool();
  
  // Parent student isolation
  const isParent = currentAccount.role === 'PARENT';
  const isPrincipal = currentAccount.role === 'PRINCIPAL';

  // Find linked student for parent
  const firstLinkedId = currentAccount.linkedStudentIds?.[0];
  const linkedStudent = isParent && firstLinkedId
    ? db?.students?.find((s) => s.id === firstLinkedId)
    : null;

  const defaultClassId = linkedStudent
    ? db?.classes?.find((c) => c.level === linkedStudent.gradeLevel && c.section === linkedStudent.section)?.id || db?.classes?.[0]?.id || ''
    : db?.classes?.[0]?.id || '';

  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId);
  const [editingSlot, setEditingSlot] = useState<TimetableEntry | null>(null);

  // Class period duration set by Principal (default 40 mins)
  const [periodDuration, setPeriodDuration] = useState<number>(40);
  const [schoolStartTime, setSchoolStartTime] = useState<string>('08:00');

  const [slotType, setSlotType] = useState<'REGULAR' | 'VACANT' | 'HOLIDAY'>('REGULAR');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [formData, setFormData] = useState({
    subject: 'التربية الإسلامية والقرآن الكريم',
    teacherName: '',
  });

  if (!db) return null;

  // Selected class
  const currentClass = isParent && linkedStudent
    ? db.classes.find((c) => c.level === linkedStudent.gradeLevel && c.section === linkedStudent.section) || db.classes[0]
    : db.classes.find((c) => c.id === selectedClassId) || db.classes[0];

  const days: ('الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس')[] = [
    'الأحد',
    'الإثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
  ];
  const periods = [1, 2, 3, 4, 5, 6];

  // Dynamically calculate period times based on periodDuration & startTime
  const calculatePeriodTime = (pIndex: number) => {
    const [startH, startM] = schoolStartTime.split(':').map(Number);
    const startMinutes = (startH || 8) * 60 + (startM || 0);
    // Period takes `periodDuration` minutes + 5 min break between periods, 15 min after 3rd
    let accumulated = (pIndex - 1) * (periodDuration + 5);
    if (pIndex > 3) accumulated += 10; // recess
    const fromM = startMinutes + accumulated;
    const toM = fromM + periodDuration;

    const fmt = (m: number) => {
      const h = Math.floor(m / 60) % 24;
      const min = m % 60;
      return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    };

    return `${fmt(fromM)} - ${fmt(toM)}`;
  };

  const handleOpenEdit = (entry: TimetableEntry) => {
    setEditingSlot(entry);
    setSlotType(entry.slotType || 'REGULAR');
    const matchedTeacher = db.teachers.find(
      (t) => formatTeacherName(t.name) === formatTeacherName(entry.teacherName)
    );
    setSelectedTeacherId(matchedTeacher ? matchedTeacher.id : db.teachers[0]?.id || '');
    setFormData({
      subject: entry.subject,
      teacherName: entry.teacherName.replace(/^أ\.\s*/, ''),
    });
  };

  const handleTeacherChange = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    const teacher = db.teachers.find((t) => t.id === teacherId);
    if (teacher) {
      setFormData({
        subject: teacher.specialization || formData.subject,
        teacherName: teacher.name.replace(/^أ\.\s*/, ''),
      });
    }
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    let finalSubject = formData.subject;
    let finalTeacher = formatTeacherName(formData.teacherName);

    if (slotType === 'VACANT') {
      finalSubject = 'شاغر';
      finalTeacher = 'لا يوجد أستاذ (شاغر)';
    } else if (slotType === 'HOLIDAY') {
      finalSubject = 'عطلة رسمية';
      finalTeacher = '–';
    }

    await updateTimetableSlot({
      ...editingSlot,
      subject: finalSubject,
      teacherName: finalTeacher,
      slotType: slotType,
      periodDurationMinutes: periodDuration,
    });
    setEditingSlot(null);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">جدول الحصص الأسبوعي</h2>
          <p className="text-xs text-slate-500 mt-1">
            {isParent
              ? `جدول الحصص المعتمد للتلميذ: ${linkedStudent?.fullName || 'التلميذ'} (${currentClass?.level} - شعبة ${currentClass?.section})`
              : 'تنظيم الحصص المدرسية وربط الأساتذة بموادهم وتحديد الشواغر والعطل'}
          </p>
        </div>

        {/* Class Filter & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Duration Setter (Principal Only) */}
          {isPrincipal && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-950">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>مدة الحصة:</span>
              <select
                value={periodDuration}
                onChange={(e) => setPeriodDuration(Number(e.target.value))}
                className="bg-white border border-emerald-300 rounded-lg px-2 py-1 text-xs font-bold text-emerald-900 cursor-pointer focus:outline-none"
              >
                <option value={35}>35 دقيقة</option>
                <option value={40}>40 دقيقة (المعتمد)</option>
                <option value={45}>45 دقيقة</option>
                <option value={50}>50 دقيقة</option>
              </select>
            </div>
          )}

          {/* Class Filter (Hidden or locked for Parents) */}
          {!isParent ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs shadow-2xs">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {db.classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.level} ({cls.section})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>{currentClass?.level} - شعبة ({currentClass?.section})</span>
            </div>
          )}
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead className="bg-slate-900 text-slate-200 border-b border-slate-800 font-bold">
              <tr>
                <th className="py-3 px-4 border-l border-slate-800 text-right w-28 text-xs">اليوم / الحصة</th>
                {periods.map((p) => (
                  <th key={p} className="py-3 px-3 border-l border-slate-800 min-w-[110px]">
                    <div className="text-xs">الحصة {p}</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5" dir="ltr">
                      {calculatePeriodTime(p)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {days.map((day) => (
                <tr key={day} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 border-l border-slate-100 font-bold text-right text-slate-900 bg-slate-50/80">
                    {day}
                  </td>
                  {periods.map((p) => {
                    const slot = db.timetables.find(
                      (t) =>
                        t.day === day &&
                        t.period === p &&
                        t.gradeLevel === currentClass?.level &&
                        t.section === currentClass?.section
                    );

                    const isVacant = slot?.slotType === 'VACANT' || slot?.subject === 'شاغر';
                    const isHoliday = slot?.slotType === 'HOLIDAY' || slot?.subject === 'عطلة رسمية';

                    return (
                      <td key={p} className="py-2.5 px-2 border-l border-slate-100 relative group">
                        {slot ? (
                          <div
                            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center min-h-[64px] transition-all ${
                              isVacant
                                ? 'bg-slate-50 border-slate-200 text-slate-500'
                                : isHoliday
                                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                                : 'bg-emerald-50/70 border-emerald-100 text-emerald-950'
                            }`}
                          >
                            <span className="font-bold text-xs truncate max-w-[100px]">
                              {isVacant ? 'شاغر' : isHoliday ? 'عطلة' : slot.subject}
                            </span>
                            <span className="text-[10px] opacity-80 font-medium mt-0.5 truncate max-w-[100px]">
                              {isVacant ? 'شاغر' : isHoliday ? 'عطلة رسمية' : formatTeacherName(slot.teacherName)}
                            </span>
                            {canManageStaff && !isParent && (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(slot)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-500 hover:text-emerald-700 mt-1 rounded bg-white shadow-2xs"
                                title="تعديل الحصة"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="text-slate-300 text-[11px] py-4">شاغر</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Slot Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in duration-150 text-right">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
              تعديل حصة: يوم {editingSlot.day} - الحصة {editingSlot.period}
            </h3>

            <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
              {/* Slot Type Picker */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع الحصة:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSlotType('REGULAR')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all ${
                      slotType === 'REGULAR'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    مادة دراسية
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlotType('VACANT')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all ${
                      slotType === 'VACANT'
                        ? 'bg-slate-200 border-slate-400 text-slate-900 ring-2 ring-slate-400/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    شاغر
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlotType('HOLIDAY')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all ${
                      slotType === 'HOLIDAY'
                        ? 'bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    عطلة
                  </button>
                </div>
              </div>

              {slotType === 'REGULAR' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      ربط الأستاذ (يتم جلب مادته المخصصة تلقائياً):
                    </label>
                    <select
                      value={selectedTeacherId}
                      onChange={(e) => handleTeacherChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      {db.teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {formatTeacherName(t.name)} ({t.specialization})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">المادة الدراسية المقررة:</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </>
              )}

              {slotType === 'VACANT' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs">
                  سيتم تعيين هذه الحصة كـ (شاغر) دون إسناد أستاذ.
                </div>
              )}

              {slotType === 'HOLIDAY' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                  سيتم تسجيل هذه الحصة كـ (عطلة رسمية).
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
                >
                  حفظ وتثبيت الحصة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
