import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Student, StageType } from '../types';
import { Users, UserPlus, Search, Phone, Calendar, BookOpen, Trash2, Edit2, ShieldAlert, Award } from 'lucide-react';

export const StudentDirectory: React.FC = () => {
  const { db, canManageStaff, addStudent, updateStudent, deleteStudent, activeAcademicYear } = useSchool();
  const [stageFilter, setStageFilter] = useState<'ALL' | StageType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    stage: 'PRIMARY' as StageType,
    gradeLevel: 'الصف السادس الابتدائي',
    section: 'أ',
    parentName: '',
    parentPhone: '0770',
    birthDate: '2013-05-10',
    academicYear: activeAcademicYear,
    enrollmentNumber: `IQ-${Date.now().toString().slice(-4)}`,
    notes: '',
  });

  if (!db) return null;

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      fullName: '',
      stage: 'PRIMARY',
      gradeLevel: 'الصف السادس الابتدائي',
      section: 'أ',
      parentName: '',
      parentPhone: '0770',
      birthDate: '2013-05-10',
      academicYear: activeAcademicYear,
      enrollmentNumber: `IQ-${Date.now().toString().slice(-4)}`,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      stage: student.stage,
      gradeLevel: student.gradeLevel,
      section: student.section,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      birthDate: student.birthDate,
      academicYear: student.academicYear,
      enrollmentNumber: student.enrollmentNumber,
      notes: student.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      await updateStudent(editingStudent.id, formData);
    } else {
      await addStudent(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف قيد الطالب ${name}؟`)) {
      await deleteStudent(id);
    }
  };

  const filteredStudents = db.students.filter((s) => {
    const matchesStage = stageFilter === 'ALL' || s.stage === stageFilter;
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.enrollmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">سجل الطلاب وأولياء الأمور</h2>
          <p className="text-xs text-slate-500 mt-1">
            بيانات الطلاب المقيدين رسمياً وربطهم بأولياء الأمور مع أرقام القيد المعتمدة (دون سابقة «أ.»)
          </p>
        </div>

        {canManageStaff ? (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            تسجيل طالب جديد
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>تسجيل وتعديل بيانات الطلاب متاح لإدارة المدرسة</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1 w-full sm:w-auto p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setStageFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              stageFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            الكل ({db.students.length})
          </button>
          <button
            onClick={() => setStageFilter('PRIMARY')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              stageFilter === 'PRIMARY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            الابتدائي
          </button>
          <button
            onClick={() => setStageFilter('INTERMEDIATE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              stageFilter === 'INTERMEDIATE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            المتوسط
          </button>
          <button
            onClick={() => setStageFilter('SECONDARY')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              stageFilter === 'SECONDARY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            الإعدادي
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث باسم الطالب أو ولي الأمر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">رقم القيد</th>
                <th className="py-3 px-4">اسم الطالب الثلاثي</th>
                <th className="py-3 px-4">المرحلة والصف</th>
                <th className="py-3 px-4">الشعبة</th>
                <th className="py-3 px-4">ولي أمر الطالب</th>
                <th className="py-3 px-4">هاتف التواصل</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-600">
                    {student.enrollmentNumber}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {/* NO «أ.» prefix for students */}
                    <button
                      onClick={() => setSelectedStudentForView(student)}
                      className="hover:text-emerald-700 hover:underline text-right"
                    >
                      {student.fullName}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{student.gradeLevel}</td>
                  <td className="py-3 px-4 font-bold text-emerald-800 font-mono">
                    ({student.section})
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {/* NO «أ.» prefix for parents */}
                    {student.parentName}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600" dir="ltr">
                    {student.parentPhone}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedStudentForView(student)}
                        title="عرض الملف"
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] text-slate-700 font-medium"
                      >
                        الملف
                      </button>
                      {canManageStaff && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(student)}
                            title="تعديل"
                            className="p-1 text-slate-400 hover:text-blue-600 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id, student.fullName)}
                            title="حذف"
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredStudents.length === 0 && (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-700">لا يوجد طلاب مطابقون للبحث</h3>
          <p className="text-xs text-slate-500 mt-1">تأكد من كلمات البحث أو قم بتسجيل طالب جديد.</p>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
              {editingStudent ? 'تعديل قيد الطالب' : 'تسجيل طالب جديد في النظام'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الطالب الرباعي واللقب:</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="مثال: جعفر علي حيدر عبد الله"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block font-bold text-slate-700 mb-1">الصف والشعبة:</label>
                  <div className="grid grid-cols-3 gap-1">
                    <input
                      type="text"
                      required
                      value={formData.gradeLevel}
                      onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                      placeholder="الصف..."
                      className="col-span-2 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      required
                      maxLength={2}
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      placeholder="شعبة"
                      className="px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم ولي الأمر الثلاثي:</label>
                  <input
                    type="text"
                    required
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="مثال: علي حيدر عبد الله"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">هاتف ولي الأمر:</label>
                  <input
                    type="tel"
                    required
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ التولد:</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم القيد المدرسي:</label>
                  <input
                    type="text"
                    value={formData.enrollmentNumber}
                    onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات إضافية (سلوكية / صحية):</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات صحية أو تفوق دراسي أو مواهب..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
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
                  {editingStudent ? 'حفظ التعديلات' : 'تأكيد التسجيل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student View Profile Modal */}
      {selectedStudentForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                  {selectedStudentForView.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{selectedStudentForView.fullName}</h3>
                  <div className="text-xs text-slate-500">
                    رقم القيد: {selectedStudentForView.enrollmentNumber} · {selectedStudentForView.gradeLevel} ({selectedStudentForView.section})
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForView(null)}
                className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg"
              >
                إغلاق
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-500 block">ولي الأمر:</span>
                  <strong className="text-slate-800 font-bold">{selectedStudentForView.parentName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">هاتف التواصل:</span>
                  <strong className="text-slate-800 font-mono" dir="ltr">{selectedStudentForView.parentPhone}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">تاريخ التولد:</span>
                  <strong className="text-slate-800 font-mono">{selectedStudentForView.birthDate}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">الحالة الأكاديمية:</span>
                  <strong className="text-emerald-700 font-bold">
                    {selectedStudentForView.academicStatus === 'PROMOTED'
                      ? 'ناجح ومرحّل'
                      : selectedStudentForView.academicStatus === 'REPEATING'
                      ? 'راسب ويعيد السنة'
                      : selectedStudentForView.academicStatus === 'REMEDIAL'
                      ? 'مكمل لدور الثاني'
                      : selectedStudentForView.academicStatus === 'DEFERRED'
                      ? 'مؤجل'
                      : selectedStudentForView.academicStatus === 'DROPPED'
                      ? 'منقطع'
                      : 'طالب مقيد بنجاح'}
                  </strong>
                </div>
              </div>

              {selectedStudentForView.transferHistory && selectedStudentForView.transferHistory.length > 0 && (
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1.5">
                  <span className="font-bold text-indigo-900 block">سجل التنقلات والترقية الأكاديمية:</span>
                  {selectedStudentForView.transferHistory.map((tr) => (
                    <div key={tr.id} className="text-[11px] text-indigo-800 flex items-center justify-between bg-white/80 p-2 rounded-lg border border-indigo-100">
                      <span>من {tr.fromClass} إلى {tr.toClass} ({tr.reason})</span>
                      <span className="font-mono text-indigo-600">{tr.date}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedStudentForView.notes && (
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-900 block mb-0.5">ملاحظات ملف الطالب:</span>
                  <span className="text-emerald-800">{selectedStudentForView.notes}</span>
                </div>
              )}

              {/* Quick Grades Glance */}
              <div>
                <div className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  درجات الطالب المسجلة:
                </div>
                <div className="space-y-1.5">
                  {db.grades
                    .filter((g) => g.studentId === selectedStudentForView.id)
                    .map((g) => (
                      <div
                        key={g.id}
                        className="p-2 bg-slate-50 rounded-lg flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-slate-800">{g.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">نصف السنة: {g.midYear || '-'}</span>
                          <span className="font-bold text-emerald-700 font-mono">
                            النهائي: {g.finalExam || g.totalGrade || '-'}
                          </span>
                        </div>
                      </div>
                    ))}
                  {db.grades.filter((g) => g.studentId === selectedStudentForView.id).length === 0 && (
                    <div className="text-slate-400 text-center py-2">لا توجد درجات مقيدة بعد.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
