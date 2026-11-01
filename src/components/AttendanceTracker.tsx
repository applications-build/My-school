import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { formatDisplayName } from '../types';
import { CalendarCheck, CheckCircle2, XCircle, Clock, AlertCircle, Calendar, Save, Filter } from 'lucide-react';

export const AttendanceTracker: React.FC = () => {
  const { db, canTakeAttendance, currentAccount, recordAttendance } = useSchool();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClassId, setSelectedClassId] = useState<string>('c-1');
  const [notesState, setNotesState] = useState<Record<string, string>>({});

  if (!db) return null;

  const selectedClass = db.classes.find((c) => c.id === selectedClassId) || db.classes[0];
  const studentsInClass = db.students.filter(
    (s) => s.gradeLevel === selectedClass?.level && s.section === selectedClass?.section
  );

  // Map existing records for the selected date
  const recordsMap: Record<string, { status: string; notes: string; recordedBy: string }> = {};
  db.attendance
    .filter((a) => a.date === selectedDate)
    .forEach((a) => {
      recordsMap[a.studentId] = {
        status: a.status,
        notes: a.notes,
        recordedBy: a.recordedBy,
      };
    });

  const handleStatusChange = async (studentId: string, studentName: string, status: any) => {
    if (!canTakeAttendance) return;
    const notes = notesState[studentId] || recordsMap[studentId]?.notes || '';
    const recordedByName = formatDisplayName(currentAccount.fullName, currentAccount.role);

    await recordAttendance({
      studentId,
      studentName,
      gradeLevel: selectedClass?.level || '',
      section: selectedClass?.section || 'أ',
      date: selectedDate,
      status,
      notes,
      recordedBy: recordedByName,
    });
  };

  const handleNotesBlur = async (studentId: string, studentName: string) => {
    const status = recordsMap[studentId]?.status || 'PRESENT';
    const notes = notesState[studentId] || '';
    const recordedByName = formatDisplayName(currentAccount.fullName, currentAccount.role);

    await recordAttendance({
      studentId,
      studentName,
      gradeLevel: selectedClass?.level || '',
      section: selectedClass?.section || 'أ',
      date: selectedDate,
      status: status as any,
      notes,
      recordedBy: recordedByName,
    });
  };

  // Class stats
  const totalInClass = studentsInClass.length;
  const presentCount = studentsInClass.filter(
    (s) => recordsMap[s.id]?.status === 'PRESENT'
  ).length;
  const absentCount = studentsInClass.filter(
    (s) => recordsMap[s.id]?.status === 'ABSENT'
  ).length;
  const excusedCount = studentsInClass.filter(
    (s) => recordsMap[s.id]?.status === 'EXCUSED' || recordsMap[s.id]?.status === 'LATE'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">سجل الحضور والغياب اليومي</h2>
          <p className="text-xs text-slate-500 mt-1">
            رصد حضور وغياب الطلاب وتوثيق الملاحظات والأعذار الرسمية للشعب المدرسية
          </p>
        </div>

        {/* Date and Class Selector Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs shadow-xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>

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

      {/* Attendance KPI Cards for the selected class & date */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 mb-1">إجمالي طلاب الشعبة</div>
          <div className="text-xl font-bold text-slate-900 font-mono">{totalInClass}</div>
        </div>
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 shadow-xs">
          <div className="text-[11px] text-emerald-700 font-medium mb-1">الحاضرون اليوم</div>
          <div className="text-xl font-bold text-emerald-800 font-mono">{presentCount}</div>
        </div>
        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 shadow-xs">
          <div className="text-[11px] text-rose-700 font-medium mb-1">الغياب غير المبرر</div>
          <div className="text-xl font-bold text-rose-800 font-mono">{absentCount}</div>
        </div>
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 shadow-xs">
          <div className="text-[11px] text-amber-700 font-medium mb-1">المتأخرون والمجازون</div>
          <div className="text-xl font-bold text-amber-800 font-mono">{excusedCount}</div>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">رقم القيد</th>
                <th className="py-3 px-4">اسم الطالب</th>
                <th className="py-3 px-4 text-center">حالة الحضور</th>
                <th className="py-3 px-4">ملاحظات العذر / سبب الغياب</th>
                <th className="py-3 px-4">الراصد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {studentsInClass.map((student) => {
                const rec = recordsMap[student.id];
                const currentStatus = rec?.status || 'PRESENT';

                return (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">
                      {student.enrollmentNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {student.fullName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          disabled={!canTakeAttendance}
                          onClick={() => handleStatusChange(student.id, student.fullName, 'PRESENT')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                            currentStatus === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          حاضر
                        </button>
                        <button
                          type="button"
                          disabled={!canTakeAttendance}
                          onClick={() => handleStatusChange(student.id, student.fullName, 'ABSENT')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                            currentStatus === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          غائب
                        </button>
                        <button
                          type="button"
                          disabled={!canTakeAttendance}
                          onClick={() => handleStatusChange(student.id, student.fullName, 'LATE')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                            currentStatus === 'LATE'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          متأخر
                        </button>
                        <button
                          type="button"
                          disabled={!canTakeAttendance}
                          onClick={() => handleStatusChange(student.id, student.fullName, 'EXCUSED')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                            currentStatus === 'EXCUSED'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          مجاز
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        disabled={!canTakeAttendance}
                        placeholder={canTakeAttendance ? 'تدوين عذر طبي أو ملاحظة...' : 'لا توجد ملاحظات'}
                        value={
                          notesState[student.id] !== undefined
                            ? notesState[student.id]
                            : rec?.notes || ''
                        }
                        onChange={(e) =>
                          setNotesState({ ...notesState, [student.id]: e.target.value })
                        }
                        onBlur={() => handleNotesBlur(student.id, student.fullName)}
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-600 disabled:bg-transparent disabled:border-transparent"
                      />
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {rec?.recordedBy || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {studentsInClass.length === 0 && (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-700">لا يوجد طلاب مقيدون في هذه الشعبة</h3>
          <p className="text-xs text-slate-500 mt-1">يرجى تسجيل طلاب في شعبة {selectedClass.level} أولاً.</p>
        </div>
      )}
    </div>
  );
};
