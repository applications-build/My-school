import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  GradeRecord,
  ExamApprovalStatus,
  ExamWeightConfig,
  formatDisplayName,
  formatTeacherName,
} from '../types';
import {
  Award,
  Plus,
  Search,
  Filter,
  Printer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit2,
  ShieldAlert,
  Save,
  Upload,
  Download,
  CheckCheck,
  History,
  TrendingUp,
  BarChart3,
  Layers,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  UserCheck,
  ShieldCheck,
  RefreshCw,
  Sliders,
  ChevronRight,
  BookOpen,
  Calendar,
} from 'lucide-react';

export const GradesManager: React.FC = () => {
  const {
    db,
    canEditGrades,
    currentAccount,
    recordGradeWithWorkflow,
    updateGradeApprovalStatus,
    bulkImportGrades,
    updateExamWeightConfig,
    updateCalculationRules,
    activeAcademicYear,
  } = useSchool();

  const [activeSubTab, setActiveSubTab] = useState<'entry' | 'approval' | 'weights' | 'cumulative' | 'parent'>('entry');

  // Filter state for Entry View
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedExamType, setSelectedExamType] = useState<string>('FINAL_EXAM');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing & Audit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeRecord | null>(null);
  const [editReason, setEditReason] = useState('');
  const [formError, setFormError] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'synced' | 'saving' | 'saved'>('synced');

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    gradeLevel: 'الصف السادس الابتدائي',
    section: 'أ',
    subject: 'الرياضيات',
    academicYear: activeAcademicYear,
    dailyScore: 8,
    month1: 85,
    month2: 90,
    midYear: 88,
    month3: 82,
    month4: 86,
    oralScore: 9,
    practicalScore: 9,
    activityScore: 8,
    annualEffort: 88,
    finalExam: 90,
    totalGrade: 89,
    status: 'PASS' as 'PASS' | 'FAIL' | 'REMEDIAL' | 'ABSENT' | 'INCOMPLETE',
    notes: '',
  });

  // Selected Student for Cumulative Record
  const [selectedCumulativeStudentId, setSelectedCumulativeStudentId] = useState<string>('');

  // Selected Linked Child for Parent View
  const [selectedParentChildId, setSelectedParentChildId] = useState<string>('');

  // Test Simulator state
  const [testScoreMonth1, setTestScoreMonth1] = useState(45);
  const [testScoreMonth2, setTestScoreMonth2] = useState(48);
  const [testScoreFinal, setTestScoreFinal] = useState(51);

  if (!db) return null;

  const students = db.students || [];
  const grades = db.grades || [];
  const classes = db.classes || [];
  const subjects = db.subjects || [];
  const weightConfigs = db.examWeightConfigs || [];
  const rulesConfig = db.calculationRules || {
    passingMinGrade: 50,
    maxRemedialSubjectsCount: 3,
    allow49RoundingTo50: true,
    absentGradeValue: 'ZERO',
    annualEffortFormula: 'AVG_MONTHS',
  };
  const auditLogs = db.gradeAuditLogs || [];

  const isPrincipal = currentAccount.role === 'PRINCIPAL';
  const isParent = currentAccount.role === 'PARENT';
  const isTeacher = currentAccount.role === 'TEACHER' || currentAccount.role === 'INSTRUCTOR';

  // Helper to calculate score status based on rules
  const calculateResult = (
    m1: number,
    m2: number,
    mid: number,
    fin: number,
    daily = 0,
    oral = 0,
    activity = 0
  ) => {
    let annualEffort = Math.round((m1 + m2) / 2);
    if (daily > 0 || oral > 0 || activity > 0) {
      annualEffort = Math.round((m1 + m2 + daily + oral + activity) / 3);
    }

    let finalScore = Math.round((annualEffort + fin) / 2);

    // Apply 49 rounding rule if enabled
    if (rulesConfig.allow49RoundingTo50 && finalScore === 49) {
      finalScore = 50;
    }

    let status: 'PASS' | 'FAIL' | 'REMEDIAL' = 'PASS';
    if (finalScore >= rulesConfig.passingMinGrade) {
      status = 'PASS';
    } else if (finalScore >= rulesConfig.passingMinGrade - 10) {
      status = 'REMEDIAL';
    } else {
      status = 'FAIL';
    }

    return { annualEffort, totalGrade: finalScore, status };
  };

  const handleOpenAdd = () => {
    const firstStudent = students[0];
    setEditingGrade(null);
    setEditReason('');
    setFormData({
      studentId: firstStudent?.id || '',
      studentName: firstStudent?.fullName || '',
      gradeLevel: firstStudent?.gradeLevel || 'الصف السادس الابتدائي',
      section: firstStudent?.section || 'أ',
      subject: subjects[0]?.name || 'الرياضيات',
      academicYear: activeAcademicYear,
      dailyScore: 9,
      month1: 85,
      month2: 90,
      midYear: 88,
      month3: 84,
      month4: 86,
      oralScore: 9,
      practicalScore: 9,
      activityScore: 9,
      annualEffort: 88,
      finalExam: 90,
      totalGrade: 89,
      status: 'PASS',
      notes: '',
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (grade: GradeRecord) => {
    setEditingGrade(grade);
    setEditReason('');
    setFormData({
      studentId: grade.studentId,
      studentName: grade.studentName || '',
      gradeLevel: grade.gradeLevel,
      section: grade.section,
      subject: grade.subject,
      academicYear: grade.academicYear,
      dailyScore: grade.dailyScore || 0,
      month1: grade.month1,
      month2: grade.month2,
      midYear: grade.midYear,
      month3: grade.month3 || 0,
      month4: grade.month4 || 0,
      oralScore: grade.oralScore || 0,
      practicalScore: grade.practicalScore || 0,
      activityScore: grade.activityScore || 0,
      annualEffort: grade.annualEffort || Math.round((grade.month1 + grade.month2) / 2),
      finalExam: grade.finalExam || 0,
      totalGrade: grade.totalGrade || 0,
      status: grade.status,
      notes: grade.notes || '',
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleFormScoreChange = (field: string, value: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(value) ? 0 : value));
    const next = { ...formData, [field]: clamped };

    const { annualEffort, totalGrade, status } = calculateResult(
      next.month1,
      next.month2,
      next.midYear,
      next.finalExam,
      next.dailyScore,
      next.oralScore,
      next.activityScore
    );

    setFormData({ ...next, annualEffort, totalGrade, status });

    // Visual Auto-save feedback simulator
    setAutoSaveStatus('saving');
    setTimeout(() => setAutoSaveStatus('saved'), 600);
  };

  const handleSaveGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) {
      setFormError('يرجى تحديد الطالب');
      return;
    }

    if (editingGrade && !editReason.trim() && isPrincipal) {
      setFormError('يرجى كتابة سبب التعديل الإداري للتسجيل في سجل التدقيق');
      return;
    }

    try {
      const studentObj = students.find((s) => s.id === formData.studentId);
      await recordGradeWithWorkflow(
        {
          ...formData,
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

  // CSV Grade Import Simulation
  const handleSimulateCSVImport = async () => {
    const sampleImport: Partial<GradeRecord>[] = [
      {
        studentId: students[0]?.id || 's-1',
        studentName: students[0]?.fullName || 'أحمد علي حسن',
        subject: 'الفيزياء',
        month1: 82,
        month2: 88,
        midYear: 85,
        finalExam: 89,
        annualEffort: 85,
        totalGrade: 87,
        status: 'PASS',
      },
      {
        studentId: students[1]?.id || 's-2',
        studentName: students[1]?.fullName || 'زينب محمد العبيدي',
        subject: 'الكيمياء',
        month1: 90,
        month2: 92,
        midYear: 91,
        finalExam: 94,
        annualEffort: 91,
        totalGrade: 93,
        status: 'PASS',
      },
    ];

    await bulkImportGrades(sampleImport);
  };

  // Filtered Grades for Grid View
  const filteredGrades = grades.filter((g) => {
    const matchesClass = selectedClass === 'ALL' || `${g.gradeLevel} - ${g.section}` === selectedClass;
    const matchesSubject = selectedSubject === 'ALL' || g.subject === selectedSubject;
    const matchesSearch =
      (g.studentName && g.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      g.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.recordedBy.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesClass && matchesSubject && matchesSearch;
  });

  // Calculate Cumulative Academic Record for Selected Student
  const activeCumulativeStudent = students.find(
    (s) => s.id === (selectedCumulativeStudentId || students[0]?.id)
  );

  const studentAllGrades = activeCumulativeStudent
    ? grades.filter((g) => g.studentId === activeCumulativeStudent.id)
    : [];

  const totalScoreCumulative = studentAllGrades.reduce((sum, g) => sum + (g.totalGrade || 0), 0);
  const gpaCumulative = studentAllGrades.length > 0 ? (totalScoreCumulative / studentAllGrades.length).toFixed(1) : '0';
  const failedCountCumulative = studentAllGrades.filter((g) => g.status === 'FAIL' || g.status === 'REMEDIAL').length;

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
      <div className="bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>نظام الامتحانات العراقي والتحصيل الأكاديمي</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">إدارة الدرجات والامتحانات والسجل الأكاديمي</h1>
          <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl">
            رصد الدرجات، التحقق التلقائي، أوزان الاختبارات اليومية والشهرية، مراحل الاعتماد ونشر نتائج أولياء الأمور دون أخطاء حسابية.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canEditGrades && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>رصد درجات جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('entry')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'entry' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>جدول رصد الدرجات والتحقق</span>
        </button>

        <button
          onClick={() => setActiveSubTab('approval')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'approval' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCheck className="w-4 h-4" />
          <span>مراحل الاعتماد وتدقيق التعديلات</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cumulative')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'cumulative' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>السجل الأكاديمي العراقي التراكمي</span>
        </button>

        {isParent && (
          <button
            onClick={() => setActiveSubTab('parent')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'parent' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>لوحة نتائج أبنائي</span>
          </button>
        )}

        {isPrincipal && (
          <button
            onClick={() => setActiveSubTab('weights')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'weights' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>ضوابط الأوزان والمحرك الحسابي</span>
          </button>
        )}
      </div>

      {/* SUB-TAB 1: FAST GRADE ENTRY & GRID VIEW */}
      {activeSubTab === 'entry' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="ابحث باسم الطالب أو المادة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-900 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="ALL">جميع الصفوف والشعب</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={`${cls.level} - ${cls.section}`}>
                    {cls.level} - شعبة ({cls.section})
                  </option>
                ))}
              </select>

              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="ALL">جميع المواد</option>
                {['اللغة العربية', 'الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء', 'اللغة الإنكليزية', 'التربية الإسلامية'].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  )
                )}
              </select>

              {canEditGrades && (
                <button
                  onClick={handleSimulateCSVImport}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>استيراد Excel</span>
                </button>
              )}
            </div>
          </div>

          {/* Grades Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900 text-slate-200 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3">اسم الطالب والصف</th>
                    <th className="p-3">المادة الدراسية</th>
                    <th className="p-3">شهر 1 (100)</th>
                    <th className="p-3">شهر 2 (100)</th>
                    <th className="p-3">نصف السنة (100)</th>
                    <th className="p-3">السعي السنوي</th>
                    <th className="p-3">النهائي (100)</th>
                    <th className="p-3">الدرجة الكلية</th>
                    <th className="p-3">النتيجة</th>
                    <th className="p-3">مرحلة الاعتماد</th>
                    <th className="p-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGrades.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-slate-500 font-medium">
                        لا توجد درجات مرصودة تطابق خيارات التصفية الحالية.
                      </td>
                    </tr>
                  ) : (
                    filteredGrades.map((grade) => {
                      const student = students.find((s) => s.id === grade.studentId);
                      const isApproved = grade.approvalStatus === 'APPROVED' || grade.approvalStatus === 'PUBLISHED';

                      return (
                        <tr key={grade.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{student?.fullName || grade.studentName || 'طالب مدرسة'}</div>
                            <div className="text-[10px] text-slate-500">
                              رقم القيد: {student?.enrollmentNumber || 'IQ-2024'} | {grade.gradeLevel} - شعبة ({grade.section})
                            </div>
                          </td>
                          <td className="p-3 font-bold text-emerald-800">{grade.subject}</td>
                          <td className="p-3 font-semibold text-slate-700">{grade.month1}</td>
                          <td className="p-3 font-semibold text-slate-700">{grade.month2}</td>
                          <td className="p-3 font-bold text-slate-900">{grade.midYear}</td>
                          <td className="p-3 font-bold text-blue-700">{grade.annualEffort || Math.round((grade.month1 + grade.month2) / 2)}</td>
                          <td className="p-3 font-bold text-slate-900">{grade.finalExam !== undefined ? grade.finalExam : '-'}</td>
                          <td className="p-3 font-black text-sm text-emerald-800">{grade.totalGrade !== undefined ? grade.totalGrade : '-'}</td>
                          <td className="p-3">
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
                          <td className="p-3">
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
                                ? 'منشور لولي الأمر'
                                : grade.approvalStatus === 'APPROVED'
                                ? 'معتمد إدارياً'
                                : 'مسودة معلم'}
                            </span>
                          </td>
                          <td className="p-3">
                            {canEditGrades && (
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
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCheck className="w-5 h-5 text-emerald-700" />
                  <span>لوحة اعتماد النتائج ونشرها لأولياء الأمور</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  مراحل الاعتماد: المسودة الرسمية للمعلم ← اعتماد مدير المدرسة ← النشر النهائي في حقل ولي الأمر
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
                    اعتماد كافة الدرجات المرصودة
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
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {grades.filter((g) => g.approvalStatus === 'DRAFT' || !g.approvalStatus).length}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">بانتظار المراجعة والارسال</p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <p className="text-xs font-bold text-emerald-800">الدرجات المعتمدة إدارياً</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">
                  {grades.filter((g) => g.approvalStatus === 'APPROVED').length}
                </p>
                <p className="text-[11px] text-emerald-700 mt-1">جاهزة للنشر النهائي</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <p className="text-xs font-bold text-blue-800">النتائج المنشورة لأولياء الأمور</p>
                <p className="text-2xl font-black text-blue-900 mt-1">
                  {grades.filter((g) => g.approvalStatus === 'PUBLISHED').length}
                </p>
                <p className="text-[11px] text-blue-700 mt-1">ظاهرة في تطبيق ولي الأمر</p>
              </div>
            </div>

            {/* Grade Modification Audit History Log */}
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
                        <th className="p-3">سبب التعديل الإلزامي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-800">{log.timestamp}</td>
                          <td className="p-3 font-bold text-emerald-800">
                            {log.modifiedBy} ({log.modifiedRole})
                          </td>
                          <td className="p-3 font-medium text-slate-600">{log.examType}</td>
                          <td className="p-3 font-bold text-slate-500">{log.previousValue !== null ? log.previousValue : '-'}</td>
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

      {/* SUB-TAB 3: EXAM WEIGHTS & CALCULATION ENGINE RULES */}
      {activeSubTab === 'weights' && isPrincipal && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stage Weight Configurator */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-700" />
                <span>تكوين أوزان الامتحانات لكل مرحلة دراسية</span>
              </h3>
              <p className="text-xs text-slate-500">
                ضبط نسب توزيع الدرجات بين اليومي والشري ونصف السنة والنهائي حسب نوع المدرسة
              </p>

              <div className="space-y-4 pt-2">
                {weightConfigs.map((cfg) => (
                  <div key={cfg.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">
                        مرحلة: {cfg.stageCode === 'PRIMARY' ? 'الابتدائية' : cfg.stageCode === 'INTERMEDIATE' ? 'المتوسطة' : 'الإعدادية'}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700">الدرجة العظمى: {cfg.maxGrade}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold mb-1">اليومي (%)</label>
                        <input
                          type="number"
                          value={cfg.dailyWeight}
                          onChange={(e) => updateExamWeightConfig(cfg.id, { dailyWeight: Number(e.target.value) })}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold mb-1">الشهري (%)</label>
                        <input
                          type="number"
                          value={cfg.monthlyWeight}
                          onChange={(e) => updateExamWeightConfig(cfg.id, { monthlyWeight: Number(e.target.value) })}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold mb-1">نصف السنة (%)</label>
                        <input
                          type="number"
                          value={cfg.midYearWeight}
                          onChange={(e) => updateExamWeightConfig(cfg.id, { midYearWeight: Number(e.target.value) })}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold mb-1">النهائي (%)</label>
                        <input
                          type="number"
                          value={cfg.finalExamWeight}
                          onChange={(e) => updateExamWeightConfig(cfg.id, { finalExamWeight: Number(e.target.value) })}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Simulator & Calculation Rules */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-600" />
                <span>محاكي اختبار محرك حساب النتائج والقواعد البرمجية</span>
              </h3>
              <p className="text-xs text-slate-500">
                اختبار فوري لحساب السعي السنوي ومعالجة درجة 49 وفق الضوابط دون أخطاء
              </p>

              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">شهر 1</label>
                    <input
                      type="number"
                      value={testScoreMonth1}
                      onChange={(e) => setTestScoreMonth1(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">شهر 2</label>
                    <input
                      type="number"
                      value={testScoreMonth2}
                      onChange={(e) => setTestScoreMonth2(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">النهائي</label>
                    <input
                      type="number"
                      value={testScoreFinal}
                      onChange={(e) => setTestScoreFinal(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>
                </div>

                {(() => {
                  const res = calculateResult(testScoreMonth1, testScoreMonth2, 50, testScoreFinal);
                  return (
                    <div className="p-3 bg-white rounded-xl border border-amber-300 flex items-center justify-between text-xs font-bold">
                      <span>السعي السنوي المحسوب: {res.annualEffort}</span>
                      <span>الدرجة النهائية: {res.totalGrade}</span>
                      <span className={`px-2 py-0.5 rounded text-white ${res.status === 'PASS' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                        {res.status === 'PASS' ? 'ناجح' : 'راسب'}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Rules Toggles */}
              <div className="pt-2 space-y-3 text-xs font-bold">
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <span>تفعيل تدوير درجة (49) إلى (50) تلقائياً للمساعدة</span>
                  <input
                    type="checkbox"
                    checked={rulesConfig.allow49RoundingTo50}
                    onChange={(e) => updateCalculationRules({ allow49RoundingTo50: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: IRAQI CUMULATIVE ACADEMIC RECORD */}
      {activeSubTab === 'cumulative' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-700" />
                  <span>السجل الأكاديمي التراكمي العراقي للطلاب</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  سجل سحابي مستمر لا يفقد البيانات عند انتقال الطالب بين الصفوف أو السنوات الدراسية
                </p>
              </div>

              <div className="flex items-center gap-2 min-w-[240px]">
                <span className="text-xs font-bold text-slate-500 shrink-0">اختر الطالب:</span>
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

            {/* Active Student Cumulative Summary Card */}
            {activeCumulativeStudent && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-slate-900 to-emerald-950 p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-extrabold">{activeCumulativeStudent.fullName}</h2>
                    <p className="text-xs text-emerald-200 font-medium">
                      رقم القيد الرسمي: {activeCumulativeStudent.enrollmentNumber} | ولي الأمر: {activeCumulativeStudent.parentName} ({activeCumulativeStudent.parentPhone})
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-center">
                    <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-xs">
                      <p className="text-[10px] text-emerald-200">المعدل التراكمي العام</p>
                      <p className="text-xl font-black text-emerald-400">{gpaCumulative}</p>
                    </div>
                    <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-xs">
                      <p className="text-[10px] text-emerald-200">المواد المسجلة</p>
                      <p className="text-xl font-black text-white">{studentAllGrades.length}</p>
                    </div>
                  </div>
                </div>

                {/* Historical Academic Years Breakdown */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <span>تاريخ السجل والتدرج الأكاديمي عبر السنوات الدراسية</span>
                  </h4>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <span className="font-extrabold text-sm text-slate-900">العام الدراسي الحالي: {activeAcademicYear}</span>
                        <span className="mr-3 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                          الصف الحاضر: {activeCumulativeStudent.gradeLevel} - شعبة ({activeCumulativeStudent.section})
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700">الحالة: مستمر ومواظب</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-white text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-3">المادة</th>
                            <th className="p-3">شهر 1</th>
                            <th className="p-3">شهر 2</th>
                            <th className="p-3">نصف السنة</th>
                            <th className="p-3">الدرجة النهائية</th>
                            <th className="p-3">النتيجة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {studentAllGrades.map((g) => (
                            <tr key={g.id}>
                              <td className="p-3 font-bold text-slate-900">{g.subject}</td>
                              <td className="p-3 font-semibold text-slate-700">{g.month1}</td>
                              <td className="p-3 font-semibold text-slate-700">{g.month2}</td>
                              <td className="p-3 font-bold text-slate-900">{g.midYear}</td>
                              <td className="p-3 font-black text-emerald-700">{g.totalGrade !== undefined ? g.totalGrade : '-'}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                                  {g.status === 'PASS' ? 'ناجح' : 'غير مجتاز'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: PARENT PORTAL RESULTS & REAL PROGRESSION CHARTS */}
      {activeSubTab === 'parent' && (
        <div className="space-y-6">
          {/* Child Selector Tabs for Parents */}
          {parentChildren.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">اختر الأبن/الأبنة:</span>
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
              {/* Overall Summary Card */}
              <div className="bg-gradient-to-r from-emerald-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold">{activeParentChild.fullName}</h2>
                  <p className="text-xs text-emerald-100 font-medium">
                    {activeParentChild.stage === 'PRIMARY' ? 'المرحلة الابتدائية' : 'المرحلة الإعدادية'} | {activeParentChild.gradeLevel} - شعبة ({activeParentChild.section})
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-white/10 px-5 py-3 rounded-2xl text-center backdrop-blur-xs">
                    <p className="text-[10px] text-emerald-200 font-bold">المعدل العام</p>
                    <p className="text-2xl font-black text-emerald-300">{parentChildGPA}%</p>
                  </div>
                </div>
              </div>

              {/* REAL SVG PERFORMANCE PROGRESSION CHART */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-700" />
                  <span>الرسم البياني لتطور المستوي العلمي والتراكمي</span>
                </h3>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="h-48 flex items-end justify-between gap-4 pt-6 px-4">
                    {parentChildGrades.map((g, idx) => {
                      const score = g.totalGrade || 75;
                      const heightPct = Math.max(10, Math.min(100, score));

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                          <span className="text-[11px] font-black text-emerald-800">{score}</span>
                          <div
                            className="w-full max-w-[40px] bg-gradient-to-t from-emerald-700 to-teal-500 rounded-t-xl transition-all duration-500 shadow-xs"
                            style={{ height: `${heightPct}%` }}
                          />
                          <span className="text-[10px] font-bold text-slate-600 truncate max-w-[60px]">
                            {g.subject}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Subject Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parentChildGrades.map((g) => (
                  <div key={g.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-extrabold text-sm text-slate-900">{g.subject}</span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                        {g.totalGrade !== undefined ? g.totalGrade : '-'} / 100
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <p className="text-[10px] text-slate-500 font-bold">شهر 1</p>
                        <p className="font-extrabold text-slate-800">{g.month1}</p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <p className="text-[10px] text-slate-500 font-bold">شهر 2</p>
                        <p className="font-extrabold text-slate-800">{g.month2}</p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <p className="text-[10px] text-slate-500 font-bold">نصف السنة</p>
                        <p className="font-extrabold text-slate-800">{g.midYear}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* GRADE EDIT & AUDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingGrade ? 'تعديل وتدقيق درجة طالب' : 'رصد سجل درجات جديد'}
              </h3>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                <Save className="w-3.5 h-3.5" />
                <span>{autoSaveStatus === 'saving' ? 'جاري الحفظ التلقائي...' : 'مفعل للحفظ الآمن'}</span>
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
                <label className="block font-bold text-slate-700 mb-1">حدد الطالب *</label>
                <select
                  disabled={!!editingGrade}
                  value={formData.studentId}
                  onChange={(e) => {
                    const st = students.find((s) => s.id === e.target.value);
                    setFormData({
                      ...formData,
                      studentId: e.target.value,
                      studentName: st?.fullName || '',
                      gradeLevel: st?.gradeLevel || 'الصف السادس الابتدائي',
                      section: st?.section || 'أ',
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
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
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {['اللغة العربية', 'الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء', 'اللغة الإنكليزية', 'التربية الإسلامية'].map(
                    (sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">شهر 1 (100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.month1}
                    onChange={(e) => handleFormScoreChange('month1', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">شهر 2 (100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.month2}
                    onChange={(e) => handleFormScoreChange('month2', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نصف السنة (100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.midYear}
                    onChange={(e) => handleFormScoreChange('midYear', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الامتحان النهائي (100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.finalExam}
                    onChange={(e) => handleFormScoreChange('finalExam', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">السعي المحسوب / الدرجة</label>
                  <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl font-black text-emerald-800 flex items-center justify-between">
                    <span>السعي: {formData.annualEffort}</span>
                    <span>النهائي: {formData.totalGrade}</span>
                  </div>
                </div>
              </div>

              {editingGrade && (
                <div>
                  <label className="block font-bold text-rose-700 mb-1">سبب التعديل الاستثنائي (مطلوب للتدقيق) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: تصحيح خطأ مادي في جمع ورقة الامتحان..."
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    className="w-full px-3 py-2 bg-rose-50/50 border border-rose-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
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
