import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  GradeRecord,
  formatDisplayName,
  formatTeacherName,
} from '../types';
import {
  Award,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Save,
  Upload,
  CheckCheck,
  History,
  BarChart3,
  BookOpen,
  Calendar,
  Lock,
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

const renderScore = (val: number | undefined | null) => {
  if (val === undefined || val === null || isNaN(val)) return '–';
  return val;
};

export const GradesManager: React.FC = () => {
  const {
    db,
    canEditGrades,
    currentAccount,
    recordGradeWithWorkflow,
    updateGradeApprovalStatus,
    bulkImportGrades,
    activeAcademicYear,
  } = useSchool();

  const [activeSubTab, setActiveSubTab] = useState<'entry' | 'approval' | 'cumulative' | 'parent'>('entry');

  // Filter state for Entry View
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing & Audit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeRecord | null>(null);
  const [editReason, setEditReason] = useState('');
  const [formError, setFormError] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'synced' | 'saving' | 'saved'>('synced');

  // Teacher Profile & Subject Restriction
  const isPrincipal = currentAccount.role === 'PRINCIPAL';
  const isParent = currentAccount.role === 'PARENT';
  const isTeacher = currentAccount.role === 'TEACHER';

  const teacherProfile = db?.teachers?.find((t) => t.id === currentAccount.id || t.phone === currentAccount.phone || t.fullName === currentAccount.fullName);
  const teacherAssignedSubject = teacherProfile?.specialization || currentAccount.assignedSubjects?.[0] || PRIMARY_SUBJECTS[0];

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    gradeLevel: 'الصف الأول الابتدائي',
    section: 'أ',
    subject: isTeacher ? teacherAssignedSubject : PRIMARY_SUBJECTS[0],
    academicYear: activeAcademicYear,
    month1: 85 as number | undefined,
    month2: 90 as number | undefined,
    firstHalfAverage: 88 as number | undefined,
    midYear: 88 as number | undefined,
    month3: 84 as number | undefined,
    month4: 86 as number | undefined,
    secondHalfAverage: 85 as number | undefined,
    finalExam: 90 as number | undefined,
    totalGrade: 89 as number | undefined,
    status: 'PASS' as 'PASS' | 'FAIL' | 'REMEDIAL' | 'ABSENT' | 'INCOMPLETE',
    notes: '',
  });

  // Selected Student for Cumulative Record
  const [selectedCumulativeStudentId, setSelectedCumulativeStudentId] = useState<string>('');

  // Selected Linked Child for Parent View
  const [selectedParentChildId, setSelectedParentChildId] = useState<string>('');

  if (!db) return null;

  const students = db.students || [];
  const grades = db.grades || [];
  const classes = db.classes || [];
  const auditLogs = db.gradeAuditLogs || [];

  const handleOpenAdd = () => {
    const firstStudent = students[0];
    const initialSubject = isTeacher ? teacherAssignedSubject : PRIMARY_SUBJECTS[0];
    setEditingGrade(null);
    setEditReason('');
    const m1 = 85;
    const m2 = 90;
    const fAvg = Math.round((m1 + m2) / 2);
    const m3 = 84;
    const m4 = 86;
    const sAvg = Math.round((m3 + m4) / 2);
    const fin = 90;
    const tot = Math.round((fAvg + sAvg + fin) / 3);

    setFormData({
      studentId: firstStudent?.id || '',
      studentName: firstStudent?.fullName || '',
      gradeLevel: firstStudent?.gradeLevel || 'الصف الأول الابتدائي',
      section: firstStudent?.section || 'أ',
      subject: initialSubject,
      academicYear: activeAcademicYear,
      month1: m1,
      month2: m2,
      firstHalfAverage: fAvg,
      midYear: 88,
      month3: m3,
      month4: m4,
      secondHalfAverage: sAvg,
      finalExam: fin,
      totalGrade: tot,
      status: tot >= 50 ? 'PASS' : 'FAIL',
      notes: '',
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (grade: GradeRecord) => {
    if (isTeacher && grade.subject !== teacherAssignedSubject) {
      alert(`بصفتك معلماً، مصرح لك فقط بتعديل درجات مادتك المخصصة (${teacherAssignedSubject}).`);
      return;
    }

    setEditingGrade(grade);
    setEditReason('');
    const fAvg = grade.firstHalfAverage ?? (grade.month1 !== undefined && grade.month2 !== undefined ? Math.round((grade.month1 + grade.month2) / 2) : undefined);
    const sAvg = grade.secondHalfAverage ?? (grade.month3 !== undefined && grade.month4 !== undefined ? Math.round((grade.month3 + grade.month4) / 2) : undefined);

    setFormData({
      studentId: grade.studentId,
      studentName: grade.studentName || '',
      gradeLevel: grade.gradeLevel,
      section: grade.section,
      subject: isTeacher ? teacherAssignedSubject : grade.subject,
      academicYear: grade.academicYear,
      month1: grade.month1,
      month2: grade.month2,
      firstHalfAverage: fAvg,
      midYear: grade.midYear,
      month3: grade.month3,
      month4: grade.month4,
      secondHalfAverage: sAvg,
      finalExam: grade.finalExam,
      totalGrade: grade.totalGrade,
      status: grade.status,
      notes: grade.notes || '',
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleScoreFieldChange = (field: 'month1' | 'month2' | 'midYear' | 'month3' | 'month4' | 'finalExam', valStr: string) => {
    const val = valStr === '' ? undefined : Math.max(0, Math.min(100, Number(valStr)));
    const updated = { ...formData, [field]: val };

    // Recompute first half average: (month1 + month2) / 2
    let fAvg: number | undefined = undefined;
    if (updated.month1 !== undefined && updated.month2 !== undefined) {
      fAvg = Math.round((updated.month1 + updated.month2) / 2);
    } else if (updated.month1 !== undefined) {
      fAvg = updated.month1;
    } else if (updated.month2 !== undefined) {
      fAvg = updated.month2;
    }

    // Recompute second half average: (month3 + month4) / 2
    let sAvg: number | undefined = undefined;
    if (updated.month3 !== undefined && updated.month4 !== undefined) {
      sAvg = Math.round((updated.month3 + updated.month4) / 2);
    } else if (updated.month3 !== undefined) {
      sAvg = updated.month3;
    } else if (updated.month4 !== undefined) {
      sAvg = updated.month4;
    }

    // Total grade calculation
    let total: number | undefined = undefined;
    const parts = [fAvg, updated.midYear, sAvg, updated.finalExam].filter((x) => x !== undefined) as number[];
    if (parts.length > 0) {
      total = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
      if (total === 49) total = 50; // Iraqi humanitarian assistance rule
    }

    const st: 'PASS' | 'FAIL' | 'REMEDIAL' = total !== undefined ? (total >= 50 ? 'PASS' : total >= 40 ? 'REMEDIAL' : 'FAIL') : 'PASS';

    setFormData({
      ...updated,
      firstHalfAverage: fAvg,
      secondHalfAverage: sAvg,
      totalGrade: total,
      status: st,
    });

    setAutoSaveStatus('saving');
    setTimeout(() => setAutoSaveStatus('saved'), 400);
  };

  const handleSaveGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) {
      setFormError('يرجى تحديد التلميذ');
      return;
    }

    if (editingGrade && !editReason.trim() && isPrincipal) {
      setFormError('يرجى كتابة سبب التعديل الإداري للتسجيل في سجل التدقيق');
      return;
    }

    try {
      const studentObj = students.find((s) => s.id === formData.studentId);
      const subjectToSave = isTeacher ? teacherAssignedSubject : formData.subject;

      await recordGradeWithWorkflow(
        {
          ...formData,
          subject: subjectToSave,
          studentName: studentObj?.fullName || formData.studentName,
          approvalStatus: editingGrade ? editingGrade.approvalStatus : 'DRAFT',
        },
        editReason
      );
      setIsEditModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ أثناء حفظ السجل');
    }
  };

  const handleSimulateCSVImport = async () => {
    const subj = isTeacher ? teacherAssignedSubject : 'الرياضيات';
    const sampleImport: Partial<GradeRecord>[] = [
      {
        studentId: students[0]?.id || 's-1',
        studentName: students[0]?.fullName || 'حيدر أحمد عباس',
        subject: subj,
        month1: 85,
        month2: 90,
        firstHalfAverage: 88,
        midYear: 86,
        month3: 88,
        month4: 92,
        secondHalfAverage: 90,
        finalExam: 90,
        totalGrade: 89,
        status: 'PASS',
      },
    ];
    await bulkImportGrades(sampleImport);
  };

  // Filtered Grades for Grid View
  const filteredGrades = grades.filter((g) => {
    const matchesClass = selectedClass === 'ALL' || `${g.gradeLevel} - ${g.section}` === selectedClass;
    const matchesSubject =
      isTeacher
        ? g.subject === teacherAssignedSubject
        : selectedSubject === 'ALL' || g.subject === selectedSubject;

    const matchesSearch =
      (g.studentName && g.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      g.subject.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesClass && matchesSubject && matchesSearch;
  });

  // Cumulative Record
  const activeCumulativeStudent = students.find(
    (s) => s.id === (selectedCumulativeStudentId || students[0]?.id)
  );
  const studentAllGrades = activeCumulativeStudent
    ? grades.filter((g) => g.studentId === activeCumulativeStudent.id)
    : [];
  const totalScoreCumulative = studentAllGrades.reduce((sum, g) => sum + (g.totalGrade || 0), 0);
  const gpaCumulative = studentAllGrades.length > 0 ? (totalScoreCumulative / studentAllGrades.length).toFixed(1) : '0';

  // Parent Linked Children Filter
  const linkedStudentIds = currentAccount.linkedStudentIds || [];
  const parentChildren = students.filter((s) => linkedStudentIds.includes(s.id));
  const activeParentChild = parentChildren.find(
    (c) => c.id === (selectedParentChildId || parentChildren[0]?.id)
  ) || parentChildren[0] || students[0];

  const parentChildGrades = activeParentChild
    ? grades.filter((g) => g.studentId === activeParentChild.id)
    : [];

  const parentChildGPA =
    parentChildGrades.length > 0
      ? (parentChildGrades.reduce((sum, g) => sum + (g.totalGrade || 0), 0) / parentChildGrades.length).toFixed(1)
      : '0';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>نظام رصد الدرجات والامتحانات للمرحلة الابتدائية</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">سجل الدرجات والتحصيل الأكاديمي</h1>
          <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
            {isTeacher
              ? `أهلاً بك أستاذ. أنت مخول حصرياً برصد درجات مادتك التخصصية: (${teacherAssignedSubject}).`
              : 'رصد درجات الفصل الأول والنصف الثاني ونصف السنة والنهائي مع الاحتساب التلقائي للمعدلات.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canEditGrades && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>رصد درجات تلميذ</span>
            </button>
          )}
        </div>
      </div>

      {/* Teacher Role Subject Notice Pill */}
      {isTeacher && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 font-bold">
          <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>المادة المخصصة لرصدك الأكاديمي: <span className="underline decoration-emerald-500 underline-offset-4">{teacherAssignedSubject}</span></span>
        </div>
      )}

      {/* Sub-Tab Navigation (Without weights subtab) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('entry')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'entry' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>جدول رصد الدرجات الابتدائية</span>
        </button>

        <button
          onClick={() => setActiveSubTab('approval')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'approval' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCheck className="w-4 h-4" />
          <span>مراحل الاعتماد والتدقيق</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cumulative')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'cumulative' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>السجل التراكمي للتلميذ</span>
        </button>

        {isParent && (
          <button
            onClick={() => setActiveSubTab('parent')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'parent' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>لوحة نتائج ابني</span>
          </button>
        )}
      </div>

      {/* SUB-TAB 1: FAST GRADE ENTRY & GRID VIEW */}
      {activeSubTab === 'entry' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="ابحث باسم التلميذ أو المادة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-900 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="ALL">جميع الصفوف والشعب</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={`${cls.level} - ${cls.section}`}>
                    {cls.level} - شعبة ({cls.section})
                  </option>
                ))}
              </select>

              {!isTeacher && (
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="ALL">جميع المواد</option>
                  {PRIMARY_SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}

              {canEditGrades && (
                <button
                  onClick={handleSimulateCSVImport}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>استيراد Excel</span>
                </button>
              )}
            </div>
          </div>

          {/* Grades Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900 text-slate-200 font-bold border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="p-3">اسم التلميذ والصف</th>
                    <th className="p-3">المادة</th>
                    <th className="p-2.5 text-center">شهر 1</th>
                    <th className="p-2.5 text-center">شهر 2</th>
                    <th className="p-2.5 text-center bg-slate-800 text-emerald-300">معدل النصف الأول</th>
                    <th className="p-2.5 text-center">نصف السنة</th>
                    <th className="p-2.5 text-center">ش1 بعد نصف السنة</th>
                    <th className="p-2.5 text-center">ش2 بعد نصف السنة</th>
                    <th className="p-2.5 text-center bg-slate-800 text-teal-300">معدل النصف الثاني</th>
                    <th className="p-2.5 text-center">النهائي</th>
                    <th className="p-2.5 text-center font-black">الدرجة الكلية</th>
                    <th className="p-2.5 text-center">النتيجة</th>
                    <th className="p-2.5 text-center">الاعتماد</th>
                    <th className="p-2.5 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGrades.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="p-8 text-center text-slate-500 font-medium">
                        لا توجد درجات مرصودة تطابق خيارات التصفية الحالية.
                      </td>
                    </tr>
                  ) : (
                    filteredGrades.map((grade) => {
                      const student = students.find((s) => s.id === grade.studentId);
                      const fAvg = grade.firstHalfAverage ?? (grade.month1 !== undefined && grade.month2 !== undefined ? Math.round((grade.month1 + grade.month2) / 2) : undefined);
                      const sAvg = grade.secondHalfAverage ?? (grade.month3 !== undefined && grade.month4 !== undefined ? Math.round((grade.month3 + grade.month4) / 2) : undefined);

                      return (
                        <tr key={grade.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{student?.fullName || grade.studentName || 'تلميذ مدرسة'}</div>
                            <div className="text-[10px] text-slate-500">
                              {grade.gradeLevel} - شعبة ({grade.section})
                            </div>
                          </td>
                          <td className="p-3 font-bold text-emerald-800">{grade.subject}</td>
                          <td className="p-2.5 text-center font-semibold text-slate-700">{renderScore(grade.month1)}</td>
                          <td className="p-2.5 text-center font-semibold text-slate-700">{renderScore(grade.month2)}</td>
                          <td className="p-2.5 text-center font-extrabold text-emerald-800 bg-emerald-50/60">{renderScore(fAvg)}</td>
                          <td className="p-2.5 text-center font-bold text-slate-900">{renderScore(grade.midYear)}</td>
                          <td className="p-2.5 text-center font-semibold text-slate-700">{renderScore(grade.month3)}</td>
                          <td className="p-2.5 text-center font-semibold text-slate-700">{renderScore(grade.month4)}</td>
                          <td className="p-2.5 text-center font-extrabold text-teal-800 bg-teal-50/60">{renderScore(sAvg)}</td>
                          <td className="p-2.5 text-center font-bold text-slate-900">{renderScore(grade.finalExam)}</td>
                          <td className="p-2.5 text-center font-black text-sm text-emerald-800">{renderScore(grade.totalGrade)}</td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                grade.status === 'PASS'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : grade.status === 'REMEDIAL'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {grade.status === 'PASS' ? 'ناجح' : grade.status === 'REMEDIAL' ? 'إكمال' : 'راسب'}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                grade.approvalStatus === 'PUBLISHED'
                                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                                  : grade.approvalStatus === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              {grade.approvalStatus === 'PUBLISHED'
                                ? 'منشور'
                                : grade.approvalStatus === 'APPROVED'
                                ? 'معتمد'
                                : 'مسودة'}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            {canEditGrades && (!isTeacher || grade.subject === teacherAssignedSubject) && (
                              <button
                                onClick={() => handleOpenEdit(grade)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
                                title="تعديل أو تدقيق الدرجة"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GRADE APPROVAL WORKFLOW */}
      {activeSubTab === 'approval' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCheck className="w-5 h-5 text-emerald-700" />
                  <span>لوحة اعتماد النتائج ونشرها لأولياء الأمور</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  مراحل الاعتماد: مسودة المعلم ← اعتماد المدير ← النشر لولي الأمر
                </p>
              </div>

              {isPrincipal && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      grades.forEach((g) => updateGradeApprovalStatus(g.id, 'APPROVED'));
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    اعتماد كافة الدرجات
                  </button>
                  <button
                    onClick={() => {
                      grades.forEach((g) => updateGradeApprovalStatus(g.id, 'PUBLISHED'));
                    }}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    نشر النتائج لأولياء الأمور
                  </button>
                </div>
              )}
            </div>

            {/* Approval Progress Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500">مسودات المعلمين</p>
                <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {grades.filter((g) => g.approvalStatus === 'DRAFT' || !g.approvalStatus).length}
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <p className="text-xs font-bold text-emerald-800">الدرجات المعتمدة إدارياً</p>
                <p className="text-2xl font-black text-emerald-900 mt-1 font-mono">
                  {grades.filter((g) => g.approvalStatus === 'APPROVED').length}
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <p className="text-xs font-bold text-blue-800">النتائج المنشورة لأولياء الأمور</p>
                <p className="text-2xl font-black text-blue-900 mt-1 font-mono">
                  {grades.filter((g) => g.approvalStatus === 'PUBLISHED').length}
                </p>
              </div>
            </div>

            {/* Audit History Log */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-amber-600" />
                <span>سجل تدقيق وتتبع تعديلات الدرجات المعتمدة ({auditLogs.length})</span>
              </h4>

              {auditLogs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">لم يتم تسجيل أي تعديل استثنائي على الدرجات المعتمدة.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">التاريخ والوقت</th>
                        <th className="p-3">الجهة المعدلة</th>
                        <th className="p-3">نوع العملية</th>
                        <th className="p-3">الدرجة السابقة</th>
                        <th className="p-3">الدرجة الجديدة</th>
                        <th className="p-3">سبب التعديل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-800">{log.timestamp}</td>
                          <td className="p-3 font-bold text-emerald-800">{log.modifiedBy} ({log.modifiedRole})</td>
                          <td className="p-3 font-medium text-slate-600">{log.examType}</td>
                          <td className="p-3 font-bold text-slate-500">{renderScore(log.previousValue)}</td>
                          <td className="p-3 font-black text-emerald-700">{log.newValue}</td>
                          <td className="p-3 text-slate-700 font-medium">{log.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CUMULATIVE RECORD */}
      {activeSubTab === 'cumulative' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-700" />
                  <span>السجل الأكاديمي التراكمي للتلميذ</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  سجل دائم يحتفظ بنتائج التلميذ طوال سنوات دراسته الابتدائية
                </p>
              </div>

              <div className="flex items-center gap-2 min-w-[240px]">
                <span className="text-xs font-bold text-slate-500 shrink-0">اختر التلميذ:</span>
                <select
                  value={selectedCumulativeStudentId || students[0]?.id || ''}
                  onChange={(e) => setSelectedCumulativeStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.gradeLevel})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeCumulativeStudent && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-slate-900 to-emerald-950 p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-extrabold">{activeCumulativeStudent.fullName}</h2>
                    <p className="text-xs text-emerald-200 font-medium">
                      ولي الأمر: {activeCumulativeStudent.parentName} ({activeCumulativeStudent.parentPhone})
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-center">
                    <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-xs">
                      <p className="text-[10px] text-emerald-200">المعدل العام</p>
                      <p className="text-xl font-black text-emerald-400">{gpaCumulative}%</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">المادة</th>
                        <th className="p-3 text-center">شهر 1</th>
                        <th className="p-3 text-center">شهر 2</th>
                        <th className="p-3 text-center">معدل النصف الأول</th>
                        <th className="p-3 text-center">نصف السنة</th>
                        <th className="p-3 text-center">ش1 بعد نصف السنة</th>
                        <th className="p-3 text-center">ش2 بعد نصف السنة</th>
                        <th className="p-3 text-center">معدل النصف الثاني</th>
                        <th className="p-3 text-center">الدرجة النهائية</th>
                        <th className="p-3 text-center">النتيجة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {studentAllGrades.map((g) => {
                        const fAvg = g.firstHalfAverage ?? (g.month1 !== undefined && g.month2 !== undefined ? Math.round((g.month1 + g.month2) / 2) : undefined);
                        const sAvg = g.secondHalfAverage ?? (g.month3 !== undefined && g.month4 !== undefined ? Math.round((g.month3 + g.month4) / 2) : undefined);

                        return (
                          <tr key={g.id}>
                            <td className="p-3 font-bold text-slate-900">{g.subject}</td>
                            <td className="p-3 text-center font-semibold text-slate-700">{renderScore(g.month1)}</td>
                            <td className="p-3 text-center font-semibold text-slate-700">{renderScore(g.month2)}</td>
                            <td className="p-3 text-center font-extrabold text-emerald-800 bg-emerald-50/50">{renderScore(fAvg)}</td>
                            <td className="p-3 text-center font-bold text-slate-900">{renderScore(g.midYear)}</td>
                            <td className="p-3 text-center font-semibold text-slate-700">{renderScore(g.month3)}</td>
                            <td className="p-3 text-center font-semibold text-slate-700">{renderScore(g.month4)}</td>
                            <td className="p-3 text-center font-extrabold text-teal-800 bg-teal-50/50">{renderScore(sAvg)}</td>
                            <td className="p-3 text-center font-black text-emerald-700">{renderScore(g.totalGrade)}</td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                                {g.status === 'PASS' ? 'ناجح' : 'راسب'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PARENT PORTAL */}
      {activeSubTab === 'parent' && (
        <div className="space-y-6">
          {parentChildren.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">اختر التلميذ:</span>
              {parentChildren.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedParentChildId(child.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeParentChild?.id === child.id ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {child.fullName} ({child.gradeLevel})
                </button>
              ))}
            </div>
          )}

          {activeParentChild && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold">{activeParentChild.fullName}</h2>
                  <p className="text-xs text-emerald-100 font-medium">
                    المرحلة الابتدائية | {activeParentChild.gradeLevel} - شعبة ({activeParentChild.section})
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-white/10 px-5 py-3 rounded-2xl text-center backdrop-blur-xs">
                    <p className="text-[10px] text-emerald-200 font-bold">المعدل العام</p>
                    <p className="text-2xl font-black text-emerald-300">{parentChildGPA}%</p>
                  </div>
                </div>
              </div>

              {/* Subject Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parentChildGrades.map((g) => {
                  const fAvg = g.firstHalfAverage ?? (g.month1 !== undefined && g.month2 !== undefined ? Math.round((g.month1 + g.month2) / 2) : undefined);
                  const sAvg = g.secondHalfAverage ?? (g.month3 !== undefined && g.month4 !== undefined ? Math.round((g.month3 + g.month4) / 2) : undefined);

                  return (
                    <div key={g.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="font-extrabold text-sm text-slate-900">{g.subject}</span>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                          {renderScore(g.totalGrade)} / 100
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <p className="text-[10px] text-slate-500 font-bold">شهر 1</p>
                          <p className="font-extrabold text-slate-800">{renderScore(g.month1)}</p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <p className="text-[10px] text-slate-500 font-bold">شهر 2</p>
                          <p className="font-extrabold text-slate-800">{renderScore(g.month2)}</p>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                          <p className="text-[10px] text-emerald-700 font-bold">معدل النصف 1</p>
                          <p className="font-extrabold text-emerald-900">{renderScore(fAvg)}</p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <p className="text-[10px] text-slate-500 font-bold">نصف السنة</p>
                          <p className="font-extrabold text-slate-800">{renderScore(g.midYear)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <p className="text-[10px] text-slate-500 font-bold">ش1 بعد نصف السنة</p>
                          <p className="font-extrabold text-slate-800">{renderScore(g.month3)}</p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <p className="text-[10px] text-slate-500 font-bold">ش2 بعد نصف السنة</p>
                          <p className="font-extrabold text-slate-800">{renderScore(g.month4)}</p>
                        </div>
                        <div className="p-2 bg-teal-50 rounded-xl border border-teal-200">
                          <p className="text-[10px] text-teal-700 font-bold">معدل النصف 2</p>
                          <p className="font-extrabold text-teal-900">{renderScore(sAvg)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* GRADE EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-8 text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingGrade ? 'تعديل وتدقيق درجة تلميذ' : 'رصد سجل درجات جديد'}
              </h3>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                <Save className="w-3.5 h-3.5" />
                <span>{autoSaveStatus === 'saving' ? 'جاري الاحتساب...' : 'جاهز للحفظ'}</span>
              </div>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveGradeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">حدد التلميذ *</label>
                <select
                  disabled={!!editingGrade}
                  value={formData.studentId}
                  onChange={(e) => {
                    const st = students.find((s) => s.id === e.target.value);
                    setFormData({
                      ...formData,
                      studentId: e.target.value,
                      studentName: st?.fullName || '',
                      gradeLevel: st?.gradeLevel || 'الصف الأول الابتدائي',
                      section: st?.section || 'أ',
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.gradeLevel} - شعبة {s.section})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المادة الدراسية *</label>
                {isTeacher ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-bold flex items-center justify-between">
                    <span>{teacherAssignedSubject}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">(مادتك المقررة حصرياً)</span>
                  </div>
                ) : (
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {PRIMARY_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* First Half */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800">درجات النصف الأول:</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">شهر 1</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="–"
                      value={formData.month1 ?? ''}
                      onChange={(e) => handleScoreFieldChange('month1', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">شهر 2</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="–"
                      value={formData.month2 ?? ''}
                      onChange={(e) => handleScoreFieldChange('month2', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-800 mb-1">معدل النصف الأول</label>
                    <div className="px-2.5 py-1.5 bg-emerald-100 border border-emerald-300 rounded-xl font-black text-center text-emerald-900">
                      {renderScore(formData.firstHalfAverage)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mid Year Exam */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">امتحان نصف السنة (100):</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="–"
                    value={formData.midYear ?? ''}
                    onChange={(e) => handleScoreFieldChange('midYear', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الامتحان النهائي (100):</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="–"
                    value={formData.finalExam ?? ''}
                    onChange={(e) => handleScoreFieldChange('finalExam', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-emerald-800"
                  />
                </div>
              </div>

              {/* Second Half */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800">درجات النصف الثاني (بعد نصف السنة):</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">ش1 بعد نصف السنة</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="–"
                      value={formData.month3 ?? ''}
                      onChange={(e) => handleScoreFieldChange('month3', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">ش2 بعد نصف السنة</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="–"
                      value={formData.month4 ?? ''}
                      onChange={(e) => handleScoreFieldChange('month4', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-teal-800 mb-1">معدل النصف الثاني</label>
                    <div className="px-2.5 py-1.5 bg-teal-100 border border-teal-300 rounded-xl font-black text-center text-teal-900">
                      {renderScore(formData.secondHalfAverage)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculated Total and Status */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-950">
                <span>الدرجة الكلية المحسوبة: <strong className="text-sm font-black">{renderScore(formData.totalGrade)}</strong></span>
                <span className={`px-2.5 py-1 rounded-xl text-white ${formData.status === 'PASS' ? 'bg-emerald-700' : 'bg-rose-700'}`}>
                  {formData.status === 'PASS' ? 'ناجح' : 'إكمال / غير مجتاز'}
                </span>
              </div>

              {editingGrade && isPrincipal && (
                <div>
                  <label className="block font-bold text-rose-700 mb-1">سبب التعديل الإداري (مطلوب للتدقيق) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: تصحيح خطأ مادي في جمع ورقة الامتحان..."
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    className="w-full px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs"
                >
                  حفظ السجل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
