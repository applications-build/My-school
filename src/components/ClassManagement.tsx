import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Classroom, formatTeacherName } from '../types';
import { Layers, Plus, Users, UserCheck, Edit2, Trash2, ShieldAlert, CheckCircle2 } from 'lucide-react';

const PRIMARY_GRADES = [
  'الصف الأول الابتدائي',
  'الصف الثاني الابتدائي',
  'الصف الثالث الابتدائي',
  'الصف الرابع الابتدائي',
  'الصف الخامس الابتدائي',
  'الصف السادس الابتدائي',
];

export const ClassManagement: React.FC = () => {
  const { db, canEditClasses, addClass, updateClass, deleteClass, transferStudentSection, promoteStudentAcademicStatus } = useSchool();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Classroom | null>(null);

  // Transfer Form State
  const [transferForm, setTransferForm] = useState({
    studentId: '',
    targetSection: 'ب',
    reason: 'إعادة توزيع أعداد الشعب بقرار إدارة المدرسة',
  });

  // Promote Form State
  const [promoteForm, setPromoteForm] = useState({
    studentId: '',
    status: 'PROMOTED' as any,
    nextGradeLevel: 'الصف الثاني الابتدائي',
  });

  const [formData, setFormData] = useState({
    stage: 'PRIMARY' as const,
    level: PRIMARY_GRADES[0],
    section: 'أ',
    supervisorId: '',
    studentCount: 25,
  });

  const [statusMessage, setStatusMessage] = useState('');

  if (!db) return null;

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormData({
      stage: 'PRIMARY',
      level: PRIMARY_GRADES[0],
      section: 'أ',
      supervisorId: db.teachers[0]?.id || '',
      studentCount: 25,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: Classroom) => {
    setEditingClass(cls);
    setFormData({
      stage: 'PRIMARY',
      level: cls.level,
      section: cls.section,
      supervisorId: cls.supervisorId || (db.teachers[0]?.id || ''),
      studentCount: cls.studentCount,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (classId: string, level: string, section: string) => {
    const ok = window.confirm(`هل أنت متأكد من حذف الشعبة (${level} - شعبة ${section})؟`);
    if (!ok) return;

    try {
      await deleteClass(classId);
      setStatusMessage(`تم حذف الشعبة (${level} - شعبة ${section}) بنجاح.`);
      setTimeout(() => setStatusMessage(''), 3500);
    } catch (err) {
      alert('حدث خطأ أثناء محاولة حذف الشعبة.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await updateClass(editingClass.id, {
          stage: 'PRIMARY',
          level: formData.level,
          section: formData.section,
          supervisorId: formData.supervisorId,
          studentCount: formData.studentCount,
        });
        setStatusMessage('تم تحديث بيانات الشعبة وتثبيت مشرف الصف بنجاح.');
      } else {
        await addClass({
          stage: 'PRIMARY',
          level: formData.level,
          section: formData.section,
          supervisorId: formData.supervisorId,
          studentCount: formData.studentCount,
        });
        setStatusMessage('تم استحداث الشعبة وتعيين مشرف الصف بنجاح.');
      }
      setIsModalOpen(false);
      setTimeout(() => setStatusMessage(''), 3500);
    } catch (err) {
      alert('حدث خطأ أثناء حفظ الشعبة');
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferForm.studentId) return;
    await transferStudentSection(transferForm.studentId, transferForm.targetSection, transferForm.reason);
    setIsTransferModalOpen(false);
    setStatusMessage('تم إجراء نقل الطالب بين الشعب وتسجيل السجل التاريخي.');
    setTimeout(() => setStatusMessage(''), 3500);
  };

  const handlePromoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteForm.studentId) return;
    await promoteStudentAcademicStatus(promoteForm.studentId, promoteForm.status, promoteForm.nextGradeLevel);
    setIsPromoteModalOpen(false);
    setStatusMessage('تم تحديث النتيجة الأكاديمية والارتقاء للصف التالي.');
    setTimeout(() => setStatusMessage(''), 3500);
  };

  // Only primary classes
  const primaryClasses = db.classes.filter(
    (c) => c.stage === 'PRIMARY' || !c.stage || c.level.includes('الابتدائي')
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">صفوف وشعب المدرسة الابتدائية</h2>
          <p className="text-xs text-slate-500 mt-1">
            تنظيم صفوف وشعب المرحلة الابتدائية (من الأول إلى السادس الابتدائي) وتعيين المشرفين ونقل التلاميذ
          </p>
        </div>

        {canEditClasses ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (db.students[0]) {
                  setTransferForm({ ...transferForm, studentId: db.students[0].id });
                }
                setIsTransferModalOpen(true);
              }}
              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-bold border border-indigo-200 flex items-center gap-1.5 transition-colors"
            >
              <span>نقل تلميذ بين الشعب</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (db.students[0]) {
                  setPromoteForm({ ...promoteForm, studentId: db.students[0].id });
                }
                setIsPromoteModalOpen(true);
              }}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 flex items-center gap-1.5 transition-colors"
            >
              <span>ترحيل النتائج السنوية</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              استحداث شعبة جديدة
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>صلاحية إدارة الصفوف والشعب مخصصة للمدير</span>
          </div>
        )}
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Stage Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-950">المرحلة الابتدائية المعتمدة</div>
            <div className="text-[11px] text-emerald-800">
              إجمالي الشعب المسجلة بالمدرسة: {primaryClasses.length} شعبة
            </div>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {primaryClasses.map((cls) => {
          const supervisor = db.teachers.find((t) => t.id === cls.supervisorId);
          const supervisorName = supervisor
            ? formatTeacherName(supervisor.name)
            : cls.supervisorName
            ? formatTeacherName(cls.supervisorName)
            : 'غير معين';

          const enrolledStudents = db.students.filter(
            (s) => s.gradeLevel === cls.level && s.section === cls.section
          );

          return (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-sm">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{cls.level}</h3>
                      <div className="text-xs text-slate-500">
                        الشعبة: <span className="font-bold text-emerald-700 font-mono">({cls.section})</span>
                      </div>
                    </div>
                  </div>

                  {/* Edit and Delete Buttons */}
                  {canEditClasses && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cls)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="تعديل الشعبة"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cls.id, cls.level, cls.section)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="حذف الشعبة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>مشرف الصف: <strong className="text-slate-800 font-bold">{supervisorName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>عدد التلاميذ المقيدين: <strong className="text-slate-800 font-mono">{enrolledStudents.length || cls.studentCount} تلميذاً</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>المرحلة الابتدائية</span>
                <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md">سجل نشط</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in duration-150 text-right">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
              {editingClass ? 'تعديل بيانات الشعبة الابتدائية' : 'استحداث شعبة ابتدائية جديدة'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الصف الابتدائي:</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  {PRIMARY_GRADES.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رمز الشعبة:</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    placeholder="أ، ب، ج..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">السعة الاستيعابية:</label>
                  <input
                    type="number"
                    min="10"
                    max="60"
                    value={formData.studentCount}
                    onChange={(e) => setFormData({ ...formData, studentCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مشرف الصف (من الكادر التعليمي):</label>
                <select
                  value={formData.supervisorId}
                  onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="">-- اختر معلماً كمشرف للصف --</option>
                  {db.teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {formatTeacherName(t.name)} ({t.specialization})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  يتم حفظ اسم المشرف تلقائياً في قاعدة البيانات فور الضغط على حفظ.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {editingClass && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      handleDelete(editingClass.id, editingClass.level, editingClass.section);
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-1 font-bold"
                    title="حذف هذه الشعبة"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف الشعبة</span>
                  </button>
                )}
                <div className="flex items-center gap-2 mr-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
                  >
                    {editingClass ? 'حفظ التعديلات وتثبيت المشرف' : 'تأكيد الاستحداث'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Section Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs text-right">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
              نقل تلميذ بين الشعب الدراسية
            </h3>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر التلميذ:</label>
                <select
                  value={transferForm.studentId}
                  onChange={(e) => setTransferForm({ ...transferForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {db.students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} - {s.gradeLevel} الشعبة ({s.section})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الشعبة المستهدفة بعد النقل:</label>
                <select
                  value={transferForm.targetSection}
                  onChange={(e) => setTransferForm({ ...transferForm, targetSection: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="أ">الشعبة (أ)</option>
                  <option value="ب">الشعبة (ب)</option>
                  <option value="ج">الشعبة (ج)</option>
                  <option value="د">الشعبة (د)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">سبب النقل والملاحظات الإدارية:</label>
                <input
                  type="text"
                  required
                  value={transferForm.reason}
                  onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl shadow-xs"
                >
                  تأكيد النقل وحفظ السجل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      {isPromoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs text-right">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
              ترحيل النتيجة الأكاديمية والارتقاء
            </h3>

            <form onSubmit={handlePromoteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر التلميذ:</label>
                <select
                  value={promoteForm.studentId}
                  onChange={(e) => setPromoteForm({ ...promoteForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {db.students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} - {s.gradeLevel} الشعبة ({s.section})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">النتيجة المعتمدة:</label>
                <select
                  value={promoteForm.status}
                  onChange={(e) => setPromoteForm({ ...promoteForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="PROMOTED">ناجح ومرحّل للصف الأعلى</option>
                  <option value="REPEATING">راسب ويعيد السنة الدراسية</option>
                  <option value="REMEDIAL">مكمل للدور الثاني</option>
                  <option value="DEFERRED">مؤجل للسنة القادمة</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الصف المستهدف للعام القادم:</label>
                <select
                  value={promoteForm.nextGradeLevel}
                  onChange={(e) => setPromoteForm({ ...promoteForm, nextGradeLevel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {PRIMARY_GRADES.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                  <option value="المرحلة المتوسطة">المرحلة المتوسطة (متخرج من الابتدائي)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPromoteModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xs"
                >
                  تأكيد الترحيل والحفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
