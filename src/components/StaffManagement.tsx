import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Teacher, formatTeacherName } from '../types';
import {
  GraduationCap,
  UserPlus,
  Search,
  Phone,
  Mail,
  BookOpen,
  Clock,
  Trash2,
  Edit2,
  ShieldAlert,
  Calendar,
  FileText,
  BadgeCheck,
} from 'lucide-react';

const PRIMARY_SUBJECTS = [
  'التربية الإسلامية والقرآن الكريم',
  'اللغة العربية وقواعدها',
  'اللغة الإنكليزية',
  'الرياضيات',
  'العلوم العامة',
  'الاجتماعيات (تاريخ وجغرافيا ووطنية)',
  'التربية الفنية والنشيد',
  'التربية الرياضية والصحية',
  'الحاسوب وتكنولوجيا التعليم',
];

export const StaffManagement: React.FC = () => {
  const {
    db,
    canManageStaff,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    allocateStaffSubject,
    activeAcademicYear,
  } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    specialization: PRIMARY_SUBJECTS[0],
    qualification: 'بكالوريوس تربية ابتدائية',
    phone: '0770',
    email: '',
    classesList: [] as string[],
    weeklyQuotas: 16,
    employmentType: 'ملاك دائم' as 'ملاك دائم' | 'عقد',
    appointmentDate: new Date().toISOString().split('T')[0],
    registrationNumber: '',
  });

  // Allocation Form State
  const [allocationForm, setAllocationForm] = useState({
    teacherId: '',
    gradeLevel: 'الصف الأول الابتدائي',
    section: 'أ',
    subject: PRIMARY_SUBJECTS[0],
  });

  const [formError, setFormError] = useState('');

  if (!db) return null;

  // Available classes in primary school
  const availableClasses = db.classes.map((c) => `${c.level} (${c.section})`);

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      specialization: PRIMARY_SUBJECTS[0],
      qualification: 'بكالوريوس تربية ابتدائية',
      phone: '0770',
      email: '',
      classesList: availableClasses.slice(0, 2),
      weeklyQuotas: 16,
      employmentType: 'ملاك دائم',
      appointmentDate: new Date().toISOString().split('T')[0],
      registrationNumber: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    // Parse classes into array
    const parsedClasses = teacher.classes
      ? teacher.classes.split('،').map((s) => s.trim()).filter(Boolean)
      : [];

    setFormData({
      name: teacher.name.replace(/^أ\.\s*/, ''),
      specialization: teacher.specialization || PRIMARY_SUBJECTS[0],
      qualification: teacher.qualification || 'بكالوريوس تربية ابتدائية',
      phone: teacher.phone,
      email: teacher.email || '',
      classesList: parsedClasses,
      weeklyQuotas: teacher.weeklyQuotas || 16,
      employmentType: teacher.employmentType || 'ملاك دائم',
      appointmentDate: teacher.appointmentDate || '2021-09-01',
      registrationNumber: teacher.registrationNumber || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const toggleClassSelection = (clsName: string) => {
    setFormData((prev) => {
      const exists = prev.classesList.includes(clsName);
      if (exists) {
        return { ...prev, classesList: prev.classesList.filter((c) => c !== clsName) };
      } else {
        return { ...prev, classesList: [...prev.classesList, clsName] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('يرجى إدخال اسم المعلم كاملاً');
      return;
    }

    try {
      const classesFormatted = formData.classesList.join('، ');
      const payload: any = {
        name: formData.name.trim(),
        type: 'TEACHER',
        specialization: formData.specialization,
        qualification: formData.qualification,
        phone: formData.phone.trim(),
        email: formData.email.trim() || `${formData.phone.trim()}@iqschool.edu`,
        classes: classesFormatted,
        weeklyQuotas: formData.weeklyQuotas,
        employmentType: formData.employmentType,
        appointmentDate: formData.appointmentDate,
        registrationNumber: formData.registrationNumber.trim() || undefined,
      };

      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, payload);
      } else {
        await addTeacher(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const formatted = formatTeacherName(name);
    if (window.confirm(`هل أنت متأكد من حذف الأستاذ ${formatted} من سجلات الكادر التدريسي؟`)) {
      await deleteTeacher(id);
    }
  };

  const handleAllocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = db.teachers.find((t) => t.id === allocationForm.teacherId);
    if (!teacher) return;

    await allocateStaffSubject({
      teacherId: teacher.id,
      teacherName: formatTeacherName(teacher.name),
      stage: 'المرحلة الابتدائية',
      gradeLevel: allocationForm.gradeLevel,
      section: allocationForm.section,
      subject: allocationForm.subject,
      specialization: teacher.specialization,
      academicYear: activeAcademicYear,
    });

    setIsAllocationModalOpen(false);
  };

  const filteredTeachers = db.teachers.filter((t) => {
    const formatted = formatTeacherName(t.name);
    return (
      formatted.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.classes.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 text-right">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">سجل وتوزيع الكادر التعليمي</h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة المعلمين والأساتذة بالمدرسة الابتدائية وتوزيع المواد والأنصبة الأسبوعية
          </p>
        </div>

        {canManageStaff ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (db.teachers[0]) {
                  setAllocationForm({
                    teacherId: db.teachers[0].id,
                    gradeLevel: 'الصف الأول الابتدائي',
                    section: 'أ',
                    subject: PRIMARY_SUBJECTS[0],
                  });
                }
                setIsAllocationModalOpen(true);
              }}
              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-bold border border-indigo-200 flex items-center gap-1.5 transition-colors"
            >
              <span>توزيع المناهج والحصص</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              إضافة معلّم / أستاذ جديد
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>صلاحية إضافة وتعديل الكادر مخصصة لمدير المدرسة</span>
          </div>
        )}
      </div>

      {/* Search and Summary Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <BadgeCheck className="w-4 h-4 text-emerald-600" />
          <span>إجمالي أعضاء الكادر التعليمي بالمدرسة: ({db.teachers.length}) معلماً وأستاذاً</span>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم أو المادة أو الصف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((t) => {
          const displayName = formatTeacherName(t.name);

          return (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-sm">
                      أ.
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{displayName}</h3>
                      <div className="text-xs text-emerald-800 font-medium">
                        معلم · {t.specialization}
                      </div>
                    </div>
                  </div>

                  {canManageStaff && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(t)}
                        title="تعديل بيانات المعلم"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id, t.name)}
                        title="حذف المعلم"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>الصفوف والشعب: <strong className="text-slate-800">{t.classes || 'لم تعين بعد'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>النصاب الأسبوعي: <strong className="text-slate-800 font-mono">{t.weeklyQuotas} حصة</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span dir="ltr" className="font-mono text-emerald-700 font-semibold">{t.phone}</span>
                  </div>
                  {t.registrationNumber && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>رقم القيد الإداري: <strong className="font-mono text-slate-800">{t.registrationNumber}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {t.appointmentDate ? `تاريخ التعيين: ${t.appointmentDate}` : `تاريخ القيد: ${t.createdAt}`}
                </span>
                <span className={`px-2 py-0.5 rounded-md font-semibold ${
                  t.employmentType === 'عقد'
                    ? 'bg-amber-50 text-amber-800'
                    : 'bg-emerald-50 text-emerald-800'
                }`}>
                  {t.employmentType || 'ملاك دائم'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTeachers.length === 0 && (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-700">لا يوجد معلمون مطابقون للبحث</h3>
          <p className="text-xs text-slate-500 mt-1">تأكد من كلمات البحث أو قم بإضافة معلم جديد.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
              {editingTeacher ? 'تعديل بيانات المعلم / الأستاذ' : 'إضافة معلم جديد إلى كادر المدرسة'}
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  الاسم الكامل (يُرفق به لقب «أ.» تلقائياً بالنظام):
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
                    placeholder="مثال: أحمد جاسم كاظم"
                    className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-xs"
                  />
                </div>
              </div>

              {/* Specialization Dropdown */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  مادة الاختصاص في المرحلة الابتدائية:
                </label>
                <select
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  {PRIMARY_SUBJECTS.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employment Type and Appointment Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع التعيين:</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="ملاك دائم">ملاك دائم</option>
                    <option value="عقد">عقد وزاري</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ التعيين أو المباشرة:</label>
                  <input
                    type="date"
                    required
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Phone and Registration Number */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف (واتساب):</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="07XXXXXXXXX"
                    dir="ltr"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-right"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم القيد (اختياري):</label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="مثال: Q-2024-55"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Multi-Select Checkboxes for Assigned Classes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  الصفوف والشعب المخصصة للأستاذ (اختر الشعب المقررة):
                </label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                  {availableClasses.map((clsName) => {
                    const isChecked = formData.classesList.includes(clsName);
                    return (
                      <label
                        key={clsName}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-all text-xs ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleClassSelection(clsName)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="truncate">{clsName}</span>
                      </label>
                    );
                  })}
                  {availableClasses.length === 0 && (
                    <div className="text-slate-400 text-xs col-span-2 text-center py-2">
                      يرجى إضافة شعب في صفحة الصفوف والشعب أولاً.
                    </div>
                  )}
                </div>
                {formData.classesList.length > 0 && (
                  <div className="mt-1 text-[11px] text-emerald-700 font-semibold truncate">
                    المحدد: {formData.classesList.join('، ')}
                  </div>
                )}
              </div>

              {/* Weekly Quotas */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">النصاب الأسبوعي (عدد الحصص):</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.weeklyQuotas}
                  onChange={(e) => setFormData({ ...formData, weeklyQuotas: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              {/* Actions with prominent Delete Button in Edit mode */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {editingTeacher && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      handleDelete(editingTeacher.id, editingTeacher.name);
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-1 font-bold"
                    title="حذف هذا المعلم نهائياً"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف المعلم</span>
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
                    {editingTeacher ? 'حفظ التعديلات' : 'إضافة إلى السجل'}
                  </button>
                </div>
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
              توزيع وتخصيص المناهج على المعلمين
            </h3>

            <form onSubmit={handleAllocationSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر المعلم:</label>
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
                  <label className="block font-bold text-slate-700 mb-1">الصف الابتدائي:</label>
                  <select
                    value={allocationForm.gradeLevel}
                    onChange={(e) => setAllocationForm({ ...allocationForm, gradeLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {['الصف الأول الابتدائي', 'الصف الثاني الابتدائي', 'الصف الثالث الابتدائي', 'الصف الرابع الابتدائي', 'الصف الخامس الابتدائي', 'الصف السادس الابتدائي'].map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الشعبة:</label>
                  <select
                    value={allocationForm.section}
                    onChange={(e) => setAllocationForm({ ...allocationForm, section: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold"
                  >
                    <option value="أ">أ</option>
                    <option value="ب">ب</option>
                    <option value="ج">ج</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المادة المكلف بها:</label>
                <select
                  value={allocationForm.subject}
                  onChange={(e) => setAllocationForm({ ...allocationForm, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {PRIMARY_SUBJECTS.map((subj) => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
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
