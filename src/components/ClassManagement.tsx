import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Classroom, StageType, formatTeacherName } from '../types';
import { Layers, Plus, Users, UserCheck, Edit2, ShieldAlert } from 'lucide-react';

export const ClassManagement: React.FC = () => {
  const { db, canEditClasses, addClass, updateClass, transferStudentSection, promoteStudentAcademicStatus } = useSchool();
  const [activeTab, setActiveTab] = useState<'CLASSES' | 'STAGES' | 'TRANSFERS'>('CLASSES');
  const [activeStage, setActiveStage] = useState<'ALL' | StageType>('ALL');
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
    nextGradeLevel: 'الصف السادس العلمي',
  });

  const [formData, setFormData] = useState({
    stage: 'PRIMARY' as StageType,
    level: 'الصف السادس الابتدائي',
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
      level: 'الصف السادس الابتدائي',
      section: 'أ',
      supervisorId: db.teachers[0]?.id || '',
      studentCount: 25,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: Classroom) => {
    setEditingClass(cls);
    setFormData({
      stage: cls.stage,
      level: cls.level,
      section: cls.section,
      supervisorId: cls.supervisorId,
      studentCount: cls.studentCount,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      await updateClass(editingClass.id, formData);
    } else {
      await addClass(formData);
    }
    setIsModalOpen(false);
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
    setStatusMessage('تم تحديث النتيجة الأكاديمية والترقية للصف الدراسي.');
    setTimeout(() => setStatusMessage(''), 3500);
  };

  const filteredClasses = db.classes.filter(
    (c) => activeStage === 'ALL' || c.stage === activeStage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">إدارة المراحل والشعب والتنقلات الدراسية</h2>
          <p className="text-xs text-slate-500 mt-1">
            تنظيم الشعب الدراسية، نقل الطلاب بين الشعب، وترحيل النتائج الأكاديمية وفق قواعد وزارة التربية
          </p>
        </div>

        {canEditClasses ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (db.students[0]) {
                  setTransferForm({ ...transferForm, studentId: db.students[0].id });
                }
                setIsTransferModalOpen(true);
              }}
              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-bold border border-indigo-200 flex items-center gap-1.5 transition-colors"
            >
              <span>نقل طالب بين الشعب</span>
            </button>

            <button
              onClick={() => {
                if (db.students[0]) {
                  setPromoteForm({ ...promoteForm, studentId: db.students[0].id });
                }
                setIsPromoteModalOpen(true);
              }}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 flex items-center gap-1.5 transition-colors"
            >
              <span>ترحيل وتسجيل الحالات</span>
            </button>

            <button
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
            <span>صلاحية إدارة المراحل والشعب مخصصة للمدير</span>
          </div>
        )}
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Stage Filter */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          onClick={() => setActiveStage('ALL')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeStage === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          كافة المراحل ({db.classes.length})
        </button>
        <button
          onClick={() => setActiveStage('PRIMARY')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeStage === 'PRIMARY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          المرحلة الابتدائية
        </button>
        <button
          onClick={() => setActiveStage('INTERMEDIATE')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeStage === 'INTERMEDIATE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          المرحلة المتوسطة
        </button>
        <button
          onClick={() => setActiveStage('SECONDARY')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeStage === 'SECONDARY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          المرحلة الإعدادية (العلمي والأدبي)
        </button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((cls) => {
          const supervisor = db.teachers.find((t) => t.id === cls.supervisorId);
          // Strictly format supervisor teacher name
          const supervisorName = supervisor ? formatTeacherName(supervisor.name) : 'غير معين';
          const enrolledStudents = db.students.filter(
            (s) => s.gradeLevel === cls.level && s.section === cls.section
          );

          return (
            <div
              key={cls.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-sm">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{cls.level}</h3>
                      <div className="text-xs text-slate-500">
                        الشعبة: <span className="font-bold text-emerald-700 font-mono">({cls.section})</span>
                      </div>
                    </div>
                  </div>

                  {canEditClasses && (
                    <button
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="تعديل الشعبة"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>مشرف الشعبة: <strong className="text-slate-800">{supervisorName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>عدد الطلاب المقيدين: <strong className="text-slate-800 font-mono">{enrolledStudents.length || cls.studentCount} طالباً</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  {cls.stage === 'PRIMARY'
                    ? 'التعليم الابتدائي'
                    : cls.stage === 'INTERMEDIATE'
                    ? 'التعليم المتوسط'
                    : 'التعليم الإعدادي'}
                </span>
                <span className="text-emerald-700 font-medium">سجلات نشطة</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
              {editingClass ? 'تعديل بيانات الشعبة' : 'استحداث شعبة دراسية جديدة'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">المرحلة الدراسية:</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value as StageType })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="PRIMARY">المرحلة الابتدائية</option>
                  <option value="INTERMEDIATE">المرحلة المتوسطة</option>
                  <option value="SECONDARY">المرحلة الإعدادية</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الصف الدراسي:</label>
                <input
                  type="text"
                  required
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  placeholder="مثال: الصف السادس العلمي، الصف الثالث المتوسط"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">السعة الاستيعابية:</label>
                  <input
                    type="number"
                    min="10"
                    max="50"
                    value={formData.studentCount}
                    onChange={(e) => setFormData({ ...formData, studentCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مشرف الشعبة (من الكادر التدريسي):</label>
                <select
                  value={formData.supervisorId}
                  onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  {db.teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {formatTeacherName(t.name)} ({t.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  {editingClass ? 'حفظ التعديلات' : 'تأكيد الاستحداث'}
                </button>
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
              نقل طالب بين الشعب الدراسية
            </h3>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر الطالب:</label>
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

      {/* Promotion and Academic Status Modal */}
      {isPromoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs text-right">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
              ترحيل النتيجة الأكاديمية وحالة الطالب
            </h3>

            <form onSubmit={handlePromoteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر الطالب:</label>
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
                <label className="block font-bold text-slate-700 mb-1">النتيجة والحالة المعتمدة:</label>
                <select
                  value={promoteForm.status}
                  onChange={(e) => setPromoteForm({ ...promoteForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="PROMOTED">ناجح ومرحّل للصف الأعلى</option>
                  <option value="REPEATING">راسب ويعيد السنة الدراسية</option>
                  <option value="REMEDIAL">مكمل لدور الثاني</option>
                  <option value="DEFERRED">مؤجل للسنة القادمة</option>
                  <option value="DROPPED">منقطع عن الدراسة</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الصف المستهدف للعام القادم:</label>
                <input
                  type="text"
                  required
                  value={promoteForm.nextGradeLevel}
                  onChange={(e) => setPromoteForm({ ...promoteForm, nextGradeLevel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
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
                  تأكيد الترحيل والحالة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
