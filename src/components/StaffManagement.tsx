import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Teacher, formatTeacherName } from '../types';
import { GraduationCap, UserPlus, Search, Phone, Mail, BookOpen, Clock, Trash2, Edit2, ShieldAlert } from 'lucide-react';

export const StaffManagement: React.FC = () => {
  const { db, canManageStaff, addTeacher, updateTeacher, deleteTeacher, allocateStaffSubject, deallocateStaffSubject, activeAcademicYear } = useSchool();
  const [filterType, setFilterType] = useState<'ALL' | 'TEACHER' | 'INSTRUCTOR'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Allocation Form State
  const [allocationForm, setAllocationForm] = useState({
    teacherId: '',
    stage: 'المرحلة الثانوية',
    gradeLevel: 'الصف السادس العلمي',
    section: 'أ',
    subject: 'الفيزياء',
    specialization: 'العلوم الطبيعية',
  });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'TEACHER' as 'TEACHER' | 'INSTRUCTOR',
    specialization: '',
    qualification: 'بكالوريوس تربية',
    phone: '',
    email: '',
    classes: '',
    weeklyQuotas: 16,
  });

  const [formError, setFormError] = useState('');

  if (!db) return null;

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      type: 'TEACHER',
      specialization: '',
      qualification: 'بكالوريوس تربية',
      phone: '0770',
      email: '',
      classes: '',
      weeklyQuotas: 16,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name.replace(/^أ\.\s*/, ''),
      type: teacher.type,
      specialization: teacher.specialization,
      qualification: teacher.qualification || 'بكالوريوس تربية',
      phone: teacher.phone,
      email: teacher.email,
      classes: teacher.classes,
      weeklyQuotas: teacher.weeklyQuotas,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('يرجى إدخال اسم المعلم أو المدرس كاملاً');
      return;
    }
    if (!formData.specialization.trim()) {
      setFormError('يرجى تحديد مادة الاختصاص التدريسي');
      return;
    }

    try {
      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, formData);
      } else {
        await addTeacher(formData);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleAllocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = db.teachers.find((t) => t.id === allocationForm.teacherId);
    if (!teacher) return;

    await allocateStaffSubject({
      teacherId: teacher.id,
      teacherName: formatTeacherName(teacher.name),
      stage: allocationForm.stage,
      gradeLevel: allocationForm.gradeLevel,
      section: allocationForm.section,
      subject: allocationForm.subject,
      specialization: allocationForm.specialization || teacher.specialization,
      academicYear: activeAcademicYear,
    });

    setIsAllocationModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    const formatted = formatTeacherName(name);
    if (window.confirm(`هل أنت متأكد من حذف ${formatted} من سجلات الكادر التدريسي؟`)) {
      await deleteTeacher(id);
    }
  };

  const filteredTeachers = db.teachers.filter((t) => {
    const matchesFilter = filterType === 'ALL' || t.type === filterType;
    const formatted = formatTeacherName(t.name);
    const matchesSearch =
      formatted.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.classes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 text-right">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">سجل وتوزيع الكادر التدريسي</h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة الكادر التدريسي وتوزيع المواد والصفوف حسب الاختصاص والمؤهل العلمي (مع سابقة «أ.» الإلزامية)
          </p>
        </div>

        {canManageStaff ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (db.teachers[0]) {
                  setAllocationForm({
                    ...allocationForm,
                    teacherId: db.teachers[0].id,
                    subject: db.subjects[0]?.name || 'الفيزياء',
                  });
                }
                setIsAllocationModalOpen(true);
              }}
              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-bold border border-indigo-200 flex items-center gap-1.5 transition-colors"
            >
              <span>توزيع المناهج والكادر</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              إضافة تدريسي جديد
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>صلاحية إضافة وتعديل الكادر مخصصة لمدير المدرسة</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        {/* Interactive Segmented Filter Controls */}
        <div className="flex items-center gap-1 w-full sm:w-auto p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterType === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل ({db.teachers.length})
          </button>
          <button
            onClick={() => setFilterType('TEACHER')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterType === 'TEACHER'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المعلمون (ابتدائي)
          </button>
          <button
            onClick={() => setFilterType('INSTRUCTOR')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterType === 'INSTRUCTOR'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المدرسون (متوسط وإعدادي)
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم أو المادة أو الشعبة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((t) => {
          // Strictly format name with «أ.»
          const displayName = formatTeacherName(t.name);

          return (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-sm">
                      أ.
                    </div>
                    <div>
                      {/* CRITICAL: Must show «أ.» */}
                      <h3 className="font-bold text-sm text-slate-900">{displayName}</h3>
                      <div className="text-xs text-emerald-800 font-medium">
                        {t.type === 'TEACHER' ? 'معلم / معلمة' : 'مدرّس / مدرّسة'} · {t.specialization}
                      </div>
                    </div>
                  </div>

                  {canManageStaff && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(t)}
                        title="تعديل"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id, t.name)}
                        title="حذف"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>الصفوف والشعب: <strong className="text-slate-800">{t.classes || 'لم تعين'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>النصاب الأسبوعي: <strong className="text-slate-800 font-mono">{t.weeklyQuotas} حصة</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span dir="ltr" className="font-mono">{t.phone}</span>
                  </div>
                  {t.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-[11px]">{t.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>تاريخ التعيين: {t.createdAt}</span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  ملاك رسمي
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTeachers.length === 0 && (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-700">لا يوجد تدريسيون مطابقون</h3>
          <p className="text-xs text-slate-500 mt-1">تأكد من كلمات البحث أو قم بإضافة تدريسي جديد.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
              {editingTeacher ? 'تعديل بيانات التدريسي' : 'إضافة عضو كادر تدريسي جديد'}
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  الاسم الكامل (سيتم إرفاق «أ.» تلقائياً في كافة الواجهات):
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    أ.
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: أحمد كريم الموسوي"
                    className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التصنيف الوظيفي:</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 text-xs"
                  >
                    <option value="TEACHER">معلم (ابتدائي)</option>
                    <option value="INSTRUCTOR">مدرّس (متوسط / إعدادي)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">مادة الاختصاص:</label>
                  <input
                    type="text"
                    required
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="مثال: الرياضيات، الفيزياء"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف:</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0770..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">النصاب الأسبوعي (حصص):</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.weeklyQuotas}
                    onChange={(e) => setFormData({ ...formData, weeklyQuotas: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الصفوف والشعب المسندة:</label>
                <input
                  type="text"
                  value={formData.classes}
                  onChange={(e) => setFormData({ ...formData, classes: e.target.value })}
                  placeholder="مثال: السادس العلمي أ، الخامس العلمي ب"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 text-xs"
                />
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
                  {editingTeacher ? 'حفظ التعديلات' : 'إضافة إلى السجل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Staff Allocation Modal */}
      {isAllocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs text-right">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
              توزيع وتخصيص المناهج على التدريسيين
            </h3>

            <form onSubmit={handleAllocationSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر عضو الكادر التدريسي:</label>
                <select
                  value={allocationForm.teacherId}
                  onChange={(e) => setAllocationForm({ ...allocationForm, teacherId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {db.teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {formatTeacherName(t.name)} ({t.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الصف الدراسي:</label>
                  <input
                    type="text"
                    required
                    value={allocationForm.gradeLevel}
                    onChange={(e) => setAllocationForm({ ...allocationForm, gradeLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الشعبة:</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={allocationForm.section}
                    onChange={(e) => setAllocationForm({ ...allocationForm, section: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المادة المكلف بها:</label>
                <input
                  type="text"
                  required
                  value={allocationForm.subject}
                  onChange={(e) => setAllocationForm({ ...allocationForm, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAllocationModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl shadow-xs"
                >
                  تأكيد التخصيص
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
