import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { TimetableEntry, formatTeacherName } from '../types';
import { Calendar, Clock, Edit2, Filter, ShieldAlert } from 'lucide-react';

export const Timetable: React.FC = () => {
  const { db, canManageStaff, updateTimetableSlot } = useSchool();
  const [selectedClassId, setSelectedClassId] = useState<string>('c-5'); // Default: السادس العلمي أ
  const [editingSlot, setEditingSlot] = useState<TimetableEntry | null>(null);

  const [formData, setFormData] = useState({
    subject: '',
    teacherName: '',
  });

  if (!db) return null;

  const currentClass = db.classes.find((c) => c.id === selectedClassId) || db.classes[0];
  const days: ('الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس')[] = [
    'الأحد',
    'الإثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
  ];
  const periods = [1, 2, 3, 4, 5, 6];

  const handleOpenEdit = (entry: TimetableEntry) => {
    setEditingSlot(entry);
    setFormData({
      subject: entry.subject,
      teacherName: entry.teacherName.replace(/^أ\.\s*/, ''),
    });
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    // Strict formatting: add «أ.»
    const formattedTeacher = formatTeacherName(formData.teacherName);

    await updateTimetableSlot({
      ...editingSlot,
      subject: formData.subject,
      teacherName: formattedTeacher,
    });
    setEditingSlot(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">جدول الحصص الأسبوعي المدرسي</h2>
          <p className="text-xs text-slate-500 mt-1">
            تنظيم الحصص الدراسية وتوزيع المواد والكادر التدريسي المعتمد (مع سابقة «أ.» الإلزامية)
          </p>
        </div>

        {/* Class Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs shadow-xs">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              {db.classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.level} ({cls.section})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Conflict Detection Engine Callouts */}
      {(() => {
        const teacherConflicts: Array<{ teacherName: string; day: string; period: number; classes: string[] }> = [];
        const slotMap: Record<string, TimetableEntry[]> = {};

        // Group slots by Day + Period + TeacherName
        db.timetables.forEach((slot) => {
          if (!slot.teacherName) return;
          const cleanTeacher = formatTeacherName(slot.teacherName);
          const key = `${slot.day}-p${slot.period}-${cleanTeacher}`;
          if (!slotMap[key]) slotMap[key] = [];
          slotMap[key].push(slot);
        });

        Object.entries(slotMap).forEach(([key, slots]) => {
          if (slots.length > 1) {
            const first = slots[0];
            const classNames = slots.map((s) => `${s.gradeLevel} (${s.section})`);
            teacherConflicts.push({
              teacherName: formatTeacherName(first.teacherName),
              day: first.day,
              period: first.period,
              classes: classNames,
            });
          }
        });

        if (teacherConflicts.length === 0) return null;

        return (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 text-xs text-amber-900 shadow-2xs">
            <div className="font-bold text-amber-950 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <span>تنبيه آلي: كشف تعارض الحصص والكادر في الجدول المدرسي</span>
            </div>
            <div className="space-y-1 pr-7">
              {teacherConflicts.map((c, idx) => (
                <div key={idx} className="bg-white/80 p-2 rounded-lg border border-amber-200">
                  ⚠️ المدرّس <strong className="text-amber-950">{c.teacherName}</strong> معين لأكثر من شعبة في نفس الوقت يوم <strong>{c.day}</strong> (الحصة {c.period}): الشعب المقيدة [{c.classes.join('، ')}]
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Timetable Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
              <tr>
                <th className="py-3 px-4 border-l border-slate-200 text-right w-28">اليوم / الحصة</th>
                {periods.map((p) => (
                  <th key={p} className="py-3 px-3 border-l border-slate-200">
                    <div>الحصة {p}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {p === 1
                        ? '08:00 - 08:45'
                        : p === 2
                        ? '08:50 - 09:35'
                        : p === 3
                        ? '09:40 - 10:25'
                        : p === 4
                        ? '10:45 - 11:30'
                        : p === 5
                        ? '11:35 - 12:20'
                        : '12:25 - 01:10'}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {days.map((day) => (
                <tr key={day} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 border-l border-slate-200 font-bold text-right text-slate-900 bg-slate-50/40">
                    {day}
                  </td>
                  {periods.map((p) => {
                    const slot = db.timetables.find(
                      (t) =>
                        t.day === day &&
                        t.period === p &&
                        t.gradeLevel === currentClass.level &&
                        t.section === currentClass.section
                    );

                    return (
                      <td key={p} className="py-3 px-2 border-l border-slate-200 relative group">
                        {slot ? (
                          <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-100 flex flex-col items-center justify-center">
                            <span className="font-bold text-slate-900">{slot.subject}</span>
                            {/* Strictly formatted with «أ.» */}
                            <span className="text-[10px] text-emerald-800 font-medium mt-0.5">
                              {formatTeacherName(slot.teacherName)}
                            </span>
                            {canManageStaff && (
                              <button
                                onClick={() => handleOpenEdit(slot)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-500 hover:text-emerald-700 mt-1"
                                title="تعديل الحصة"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="text-slate-300 text-[11px] py-3">شاغرة</div>
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
              <div>
                <label className="block font-bold text-slate-700 mb-1">المادة الدراسية:</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  أستاذ المادة (سيتم إرفاق «أ.» تلقائياً):
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    أ.
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.teacherName}
                    onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                    className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  حفظ التعديل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
