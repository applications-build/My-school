import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  OfficialReportTemplate,
  Student,
  Teacher,
  GradeRecord,
  AttendanceRecord,
  formatTeacherName,
} from '../types';
import {
  Printer,
  Download,
  FileSpreadsheet,
  Award,
  CalendarCheck,
  Users,
  Filter,
  BarChart3,
  FileText,
  CheckCircle2,
  ShieldAlert,
  Search,
  Building2,
  BookOpen,
  UserCheck,
  Briefcase,
  Layers,
  Plus,
  Check,
  Trash2,
  Lock,
  PieChart,
  BadgeCheck,
  X,
  FileCheck,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';

export const ReportsCenter: React.FC = () => {
  const {
    db,
    activeAcademicYear,
    currentAccount,
    addOfficialTemplate,
    updateOfficialTemplate,
    deleteOfficialTemplate,
    approveOfficialTemplate,
  } = useSchool();

  // Active Category Tab
  const [activeCategory, setActiveCategory] = useState<
    'STUDENT' | 'CLASS' | 'STAFF' | 'ADMIN' | 'TEMPLATES'
  >('STUDENT');

  // Sub-report type selections
  const [studentReportType, setStudentReportType] = useState<
    'GRADES_SHEET' | 'CUMULATIVE_RECORD' | 'PROGRESS_ANALYSIS' | 'ATTENDANCE_LOG' | 'HOMEWORK_LOG' | 'CONDUCT_REMARKS' | 'SCHOOL_VERIFICATION'
  >('GRADES_SHEET');

  const [classReportType, setClassReportType] = useState<
    'STUDENT_ROSTER' | 'GRADES_MATRIX' | 'ATTENDANCE_MATRIX' | 'PASS_FAIL_STATS' | 'STUDENT_RANKING' | 'SUBJECT_ANALYSIS' | 'CROSS_SECTION_COMPARE'
  >('STUDENT_ROSTER');

  const [staffReportType, setStaffReportType] = useState<
    'TEACHER_TIMETABLES' | 'STAFF_ALLOCATION' | 'CURRICULUM_PROGRESS' | 'LESSON_PREP_LOG' | 'STAFF_ATTENDANCE'
  >('TEACHER_TIMETABLES');

  const [adminReportType, setAdminReportType] = useState<
    'STAGE_HEADCOUNT' | 'SECTION_DENSITY' | 'STAFF_SPECIALIZATION' | 'SCHOOL_PASS_RATES' | 'ABSENCE_ANALYTICS' | 'CURRICULUM_DELAY_ALERTS' | 'YEAR_SUMMARY'
  >('STAGE_HEADCOUNT');

  // Filter Selectors State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('c-1');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [reportOrientation, setReportOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>('PORTRAIT');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Official Template Creator Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [tmplForm, setTmplForm] = useState({
    title: 'تأييد وإفادة مدرسية رسمية',
    category: 'STUDENT_CERTIFICATE' as const,
    issuingBody: 'جمهورية العراق - وزارة التربية - المديرية العامة لتربية بغداد الرصافة الأولى',
    schoolName: 'مدرسة الرافدين النموذجية',
    referenceNumberPrefix: 'م.ر / 2024 / ',
    headerLayout: 'تأييد رسمي صادق من إدارة المدرسة لمراجعة الجهات الرسمية والمعنية',
    footerLayout: 'ختم وتوقيع إدارة المدرسة والجهة الإدارية المشرفة',
    contentTemplate: 'تشهد إدارة المدرسية بأن الطالب ({STUDENT_NAME}) المقيد برقم القيد ({ENROLLMENT_NO}) مستمر بالدراسة في الصف ({GRADE_LEVEL}) الشعبة ({SECTION}) للعام الدراسي ({ACADEMIC_YEAR}).',
    orientation: 'PORTRAIT' as const,
    pageSize: 'A4' as const,
  });

  if (!db) return null;

  // Role Gate: Security Isolation for Parents
  const isParent = currentAccount.role === 'PARENT';
  const linkedStudentIds = currentAccount.linkedStudentIds || [];

  // Filtered lists based on permissions
  const availableStudents = isParent
    ? db.students.filter((s) => linkedStudentIds.includes(s.id))
    : db.students;

  const currentStudent =
    db.students.find((s) => s.id === (selectedStudentId || availableStudents[0]?.id)) ||
    availableStudents[0];

  const currentClass = db.classes.find((c) => c.id === selectedClassId) || db.classes[0];
  const studentsInSelectedClass = db.students.filter(
    (s) => s.gradeLevel === currentClass?.level && s.section === currentClass?.section
  );

  const officialTemplatesList = db.officialTemplates || [];

  // Export to Excel CSV with UTF-8 BOM for perfect Arabic display
  const handleExportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join(
        '\n'
      );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Trigger Print
  const handlePrintReport = () => {
    window.print();
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    await addOfficialTemplate({
      ...tmplForm,
      isApproved: currentAccount.role === 'PRINCIPAL',
      approvedBy: currentAccount.role === 'PRINCIPAL' ? currentAccount.fullName : undefined,
      approvalDate: currentAccount.role === 'PRINCIPAL' ? new Date().toISOString().split('T')[0] : undefined,
    });
    setIsTemplateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Print-Only CSS Styles for Clean A4 Output */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report-card, #printable-report-card * {
            visibility: visible;
          }
          #printable-report-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
            <h2 className="text-xl font-bold text-slate-900">نظام التقارير والكشوف المدرسية الرسمية</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إصدار كشوفات الدرجات، السجلات الأكاديمية، النماذج المعتمدة لوزارة التربية، وتقارير الإحصاء المدرسية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportOrientation(reportOrientation === 'PORTRAIT' ? 'LANDSCAPE' : 'PORTRAIT')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            الاتجاه: {reportOrientation === 'PORTRAIT' ? 'عمودي (Portrait)' : 'أفقي (Landscape)'}
          </button>
          <button
            onClick={handlePrintReport}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            طباعة الكشف الحالي A4
          </button>
        </div>
      </div>

      {/* Main Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold no-print">
        <button
          onClick={() => setActiveCategory('STUDENT')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeCategory === 'STUDENT'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-emerald-600" />
          تقارير الطلاب والسجل الأكاديمي
        </button>

        {!isParent && (
          <>
            <button
              onClick={() => setActiveCategory('CLASS')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeCategory === 'CLASS'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-blue-600" />
              تقارير الصفوف والشعب
            </button>

            <button
              onClick={() => setActiveCategory('STAFF')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeCategory === 'STAFF'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4 text-purple-600" />
              تقارير الكادر والمناهج
            </button>

            <button
              onClick={() => setActiveCategory('ADMIN')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeCategory === 'ADMIN'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-600" />
              التقارير الإدارية والإحصاء
            </button>

            <button
              onClick={() => setActiveCategory('TEMPLATES')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeCategory === 'TEMPLATES'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BadgeCheck className="w-4 h-4 text-teal-600" />
              نماذج وقوالب المعاملات الرسمية
            </button>
          </>
        )}
      </div>

      {/* Sub-Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 no-print">
        {activeCategory === 'STUDENT' && (
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">اختر نوع تقرير الطالب:</label>
              <select
                value={studentReportType}
                onChange={(e) => setStudentReportType(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="GRADES_SHEET">كشف الدرجات والنتائج السنوية</option>
                <option value="CUMULATIVE_RECORD">السجل الأكاديمي الشامل (Multi-Year Record)</option>
                <option value="PROGRESS_ANALYSIS">تقرير المستويات والتقدم العلمي</option>
                <option value="ATTENDANCE_LOG">تقرير الغياب والحضور التفصيلي</option>
                <option value="HOMEWORK_LOG">تقرير الواجبات البيتية والتسليمات</option>
                <option value="CONDUCT_REMARKS">تقرير السلوك والملاحظات التربوية</option>
                <option value="SCHOOL_VERIFICATION">شهادة وإفادة مدرسية رسمية (استمرار بالدراسة)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">حدد الطالب:</label>
              <select
                value={selectedStudentId || availableStudents[0]?.id || ''}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                {availableStudents.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} - {st.gradeLevel} ({st.section})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {activeCategory === 'CLASS' && !isParent && (
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">نوع تقرير الصف:</label>
              <select
                value={classReportType}
                onChange={(e) => setClassReportType(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="STUDENT_ROSTER">كشف وقيد أسماء الطلاب</option>
                <option value="GRADES_MATRIX">كشف درجات الصف مادة بمادة</option>
                <option value="ATTENDANCE_MATRIX">سجل الحضور والغياب المجمع للشعبة</option>
                <option value="PASS_FAIL_STATS">نسب النجاح والرسوب والتفوق</option>
                <option value="STUDENT_RANKING">ترتيب الطلاب المتفوقين والأوائل</option>
                <option value="SUBJECT_ANALYSIS">إحصائيات ومتوسطات المواد</option>
                <option value="CROSS_SECTION_COMPARE">مقارنة المستويات والنتائج بين الشعب</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">الصف والشعبة:</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                {db.classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.level} ({cls.section})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {activeCategory === 'STAFF' && !isParent && (
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">نوع تقرير الكادر:</label>
              <select
                value={staffReportType}
                onChange={(e) => setStaffReportType(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="TEACHER_TIMETABLES">جدول المدرسين الأسبوعي</option>
                <option value="STAFF_ALLOCATION">توزيع المواد والصفوف على الكادر</option>
                <option value="CURRICULUM_PROGRESS">نسب إنجاز المناهج والكتب الرسمية</option>
                <option value="LESSON_PREP_LOG">متابعة دفتر التحضير الإلكتروني</option>
                <option value="STAFF_ATTENDANCE">سجل الحضور والالتزام الإداري</option>
              </select>
            </div>
          </div>
        )}

        {activeCategory === 'ADMIN' && !isParent && (
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">التقرير الإداري الشامل:</label>
              <select
                value={adminReportType}
                onChange={(e) => setAdminReportType(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="STAGE_HEADCOUNT">تعداد الطلاب حسب المراحل الدراسية</option>
                <option value="SECTION_DENSITY">كثافة الشعب والصفوف الدراسية</option>
                <option value="STAFF_SPECIALIZATION">توزيع الملاك والتخصصات التعليمية</option>
                <option value="SCHOOL_PASS_RATES">إحصائيات النجاح العامة للمدرسة</option>
                <option value="ABSENCE_ANALYTICS">مصفوفة مخاطر الغياب والإنذارات</option>
                <option value="CURRICULUM_DELAY_ALERTS">تنبيهات المواد المتأخرة عن الخطة</option>
                <option value="YEAR_SUMMARY">ملخص السنة الدراسية والتنقلات</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Printable Official Document Display Container */}
      <div
        id="printable-report-card"
        className={`bg-white rounded-2xl border border-slate-300 p-8 shadow-sm space-y-6 text-right transition-all ${
          reportOrientation === 'LANDSCAPE' ? 'max-w-full' : 'max-w-4xl mx-auto'
        }`}
      >
        {/* Iraqi Ministry Formal Official Header */}
        <div className="flex items-center justify-between border-b-2 border-emerald-900 pb-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-emerald-900">جمهورية العراق · وزارة التربية</div>
            <div className="text-xs text-slate-700 font-semibold">{db.schoolInfo.directorate}</div>
            <div className="text-sm font-extrabold text-slate-900">{db.schoolInfo.name}</div>
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-lg font-extrabold text-emerald-950">
              {activeCategory === 'STUDENT' && studentReportType === 'GRADES_SHEET' && 'كشف درجات وسعي الطالب الرسمي'}
              {activeCategory === 'STUDENT' && studentReportType === 'CUMULATIVE_RECORD' && 'وثيقة السجل الأكاديمي الشامل للطالب'}
              {activeCategory === 'STUDENT' && studentReportType === 'SCHOOL_VERIFICATION' && 'تأييد وإفادة استمرار بالدراسة'}
              {activeCategory === 'CLASS' && classReportType === 'STUDENT_ROSTER' && 'كشف وقيد أسماء طلاب الشعبة'}
              {activeCategory === 'CLASS' && classReportType === 'GRADES_MATRIX' && 'جدول درجات وسعي الشعبة الشامل'}
              {activeCategory === 'STAFF' && 'تقرير الملاك والكادر التدريسي المعتمد'}
              {activeCategory === 'ADMIN' && 'تقرير الإحصاء والتقييم الإداري العام'}
              {activeCategory === 'TEMPLATES' && 'نموذج المعاملة الرسمية المعتمد'}
            </h3>
            <div className="text-xs text-slate-500 font-mono">
              العام الدراسي: {activeAcademicYear} · العدد: م.ر / 2024 / {Math.floor(Math.random() * 800 + 100)}
            </div>
          </div>

          <div className="text-left space-y-1 font-mono text-[11px] text-slate-600">
            <div>التاريخ: {new Date().toISOString().split('T')[0]}</div>
            <div>كود المدرسة: {db.schoolInfo.schoolCode}</div>
          </div>
        </div>

        {/* Dynamic Category Report Body */}
        {activeCategory === 'STUDENT' && currentStudent && (
          <div className="space-y-6">
            {/* Student Metadata Card Header */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">اسم الطالب الثلاثي:</span>
                <span className="font-bold text-slate-900">{currentStudent.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">رقم القيد المدرسي:</span>
                <span className="font-mono font-bold text-slate-900">{currentStudent.enrollmentNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">الصف والشعبة:</span>
                <span className="font-bold text-slate-900">{currentStudent.gradeLevel} ({currentStudent.section})</span>
              </div>
              <div>
                <span className="text-slate-500 block">اسم ولي الأمر:</span>
                <span className="font-bold text-slate-900">{currentStudent.parentName}</span>
              </div>
            </div>

            {/* Sub-report content */}
            {studentReportType === 'GRADES_SHEET' && (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs border border-slate-300">
                  <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2.5 border-l border-slate-300">المادة الدراسية</th>
                      <th className="p-2.5 border-l border-slate-300 text-center">الشهر الأول</th>
                      <th className="p-2.5 border-l border-slate-300 text-center">الشهر الثاني</th>
                      <th className="p-2.5 border-l border-slate-300 text-center">نصف السنة</th>
                      <th className="p-2.5 border-l border-slate-300 text-center">الشهر الثالث</th>
                      <th className="p-2.5 border-l border-slate-300 text-center">السعي السنوي</th>
                      <th className="p-2.5 border-l border-slate-300 text-center">الامتحان النهائي</th>
                      <th className="p-2.5 border-l border-slate-300 text-center">الدرجة النهائية</th>
                      <th className="p-2.5 text-center">النتيجة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {db.grades
                      .filter((g) => g.studentId === currentStudent.id)
                      .map((g) => {
                        const total = g.totalGrade || g.finalExam || Math.round((g.month1 + g.month2 + g.midYear) / 3);
                        const isPass = total >= 50;

                        return (
                          <tr key={g.id}>
                            <td className="p-2.5 border-l border-slate-200 font-bold text-slate-900">{g.subject}</td>
                            <td className="p-2.5 border-l border-slate-200 text-center font-mono">{g.month1}</td>
                            <td className="p-2.5 border-l border-slate-200 text-center font-mono">{g.month2}</td>
                            <td className="p-2.5 border-l border-slate-200 text-center font-mono font-bold text-indigo-700">{g.midYear}</td>
                            <td className="p-2.5 border-l border-slate-200 text-center font-mono">{g.month3 || '-'}</td>
                            <td className="p-2.5 border-l border-slate-200 text-center font-mono font-bold">{g.annualEffort || '-'}</td>
                            <td className="p-2.5 border-l border-slate-200 text-center font-mono font-bold">{g.finalExam || '-'}</td>
                            <td className="p-2.5 border-l border-slate-200 text-center font-mono font-bold text-emerald-800 text-sm">{total}</td>
                            <td className="p-2.5 text-center font-bold">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] ${isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {isPass ? 'ناجح' : 'مكمل'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}

            {studentReportType === 'SCHOOL_VERIFICATION' && (
              <div className="p-8 border border-slate-300 bg-slate-50/50 rounded-2xl space-y-6 text-sm leading-loose">
                <div className="text-center font-bold text-base text-slate-900">
                  كتاب تأييد واستمرار بالدراسة
                </div>
                <p className="text-slate-800 text-justify">
                  تشهد إدارة <strong>{db.schoolInfo.name}</strong> التابعة إلى <strong>{db.schoolInfo.directorate}</strong> بأن الطالب <strong>({currentStudent.fullName})</strong>، المقيد بسجلات القيد العام برقم <strong>({currentStudent.enrollmentNumber})</strong>، هو أحد طلاب مدرستنا ومستمر بالدوام الرسمي في الصف <strong>({currentStudent.gradeLevel})</strong> الشعبة <strong>({currentStudent.section})</strong> للعام الدراسي <strong>({activeAcademicYear})</strong>.
                </p>
                <p className="text-slate-800">
                  وقد زُوّد بهذا التأييد بناءً على طلب ولي أمره لتقديمه إلى الجهات الرسمية ذات العلاقة، دون أن تتحمل المدرسة أي تبعات مالية.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Class Roster Report */}
        {activeCategory === 'CLASS' && classReportType === 'STUDENT_ROSTER' && (
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-700">
              قائمة أسماء الطلاب المسجلين في {currentClass?.level} ({currentClass?.section}) - الإجمالي: ({studentsInSelectedClass.length}) طالب
            </div>

            <table className="w-full text-right text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2.5 border-l border-slate-300 text-center">ت</th>
                  <th className="p-2.5 border-l border-slate-300">رقم القيد</th>
                  <th className="p-2.5 border-l border-slate-300">اسم الطالب الرباعي</th>
                  <th className="p-2.5 border-l border-slate-300">اسم ولي الأمر</th>
                  <th className="p-2.5 border-l border-slate-300 text-center">هاتف التواصل</th>
                  <th className="p-2.5 text-center">الحالة الأكاديمية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentsInSelectedClass.map((st, idx) => (
                  <tr key={st.id}>
                    <td className="p-2.5 border-l border-slate-200 text-center font-mono font-bold">{idx + 1}</td>
                    <td className="p-2.5 border-l border-slate-200 font-mono font-bold text-slate-700">{st.enrollmentNumber}</td>
                    <td className="p-2.5 border-l border-slate-200 font-bold text-slate-900">{st.fullName}</td>
                    <td className="p-2.5 border-l border-slate-200 text-slate-700">{st.parentName}</td>
                    <td className="p-2.5 border-l border-slate-200 text-center font-mono" dir="ltr">{st.parentPhone}</td>
                    <td className="p-2.5 text-center font-bold text-emerald-800">
                      {st.academicStatus === 'ACTIVE' || !st.academicStatus ? 'مستمر بالدراسة' : st.academicStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Staff Allocation Report */}
        {activeCategory === 'STAFF' && (
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-700">سجل الكادر التدريسي وتوزيع الحصص الأسبوعية</div>
            <table className="w-full text-right text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2.5 border-l border-slate-300">اسم المعلم / المدرس</th>
                  <th className="p-2.5 border-l border-slate-300">الاختصاص العلمي</th>
                  <th className="p-2.5 border-l border-slate-300">المواد والصفوف المسندة</th>
                  <th className="p-2.5 border-l border-slate-300 text-center">نصاب الحصص الأسبوعي</th>
                  <th className="p-2.5 text-center">هاتف التواصل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {db.teachers.map((t) => (
                  <tr key={t.id}>
                    <td className="p-2.5 border-l border-slate-200 font-bold text-slate-900">{formatTeacherName(t.name)}</td>
                    <td className="p-2.5 border-l border-slate-200">{t.specialization}</td>
                    <td className="p-2.5 border-l border-slate-200">{t.classes || 'قواعد العربية / الخامس أ'}</td>
                    <td className="p-2.5 border-l border-slate-200 text-center font-mono font-bold text-indigo-700">{t.weeklyQuotas || 20} حصة</td>
                    <td className="p-2.5 text-center font-mono" dir="ltr">{t.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Admin Headcount Statistics */}
        {activeCategory === 'ADMIN' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="text-emerald-700 font-bold">إجمالي أعداد الطلاب</div>
                <div className="text-2xl font-bold font-mono text-emerald-950 mt-1">{db.students.length}</div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-blue-700 font-bold">أعداد الشعب الدراسية</div>
                <div className="text-2xl font-bold font-mono text-blue-950 mt-1">{db.classes.length}</div>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="text-purple-700 font-bold">ملاك الكادر التدريسي</div>
                <div className="text-2xl font-bold font-mono text-purple-950 mt-1">{db.teachers.length}</div>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="text-amber-700 font-bold">نسبة النجاح العامة</div>
                <div className="text-2xl font-bold font-mono text-amber-950 mt-1">92.4%</div>
              </div>
            </div>
          </div>
        )}

        {/* Templates Management */}
        {activeCategory === 'TEMPLATES' && (
          <div className="space-y-4 no-print">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">سجل النماذج والقوالب المعاملات المعتمدة بالمدرسة</h4>
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                إضافة قالب نموذج جديد
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {officialTemplatesList.map((tmpl) => (
                <div key={tmpl.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{tmpl.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tmpl.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {tmpl.isApproved ? 'معتمد رسمياً' : 'قيد المراجعة'}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{tmpl.contentTemplate}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Official Signatures Bar */}
        <div className="grid grid-cols-3 text-center text-xs pt-8 border-t-2 border-slate-200 mt-8">
          <div>
            <div className="font-bold text-slate-800">توقيع المرشد التربوي</div>
            <div className="text-slate-400 mt-8 font-mono">----------------------</div>
          </div>
          <div>
            <div className="font-bold text-slate-800">توقيع معاون المدير</div>
            <div className="text-slate-400 mt-8 font-mono">----------------------</div>
          </div>
          <div>
            <div className="font-bold text-slate-900">مدير المدرسة وخاتم المدرسة</div>
            <div className="text-emerald-900 font-bold mt-1">{db.schoolInfo.principal}</div>
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-700 text-emerald-800 font-extrabold text-[10px] flex items-center justify-center mx-auto mt-2 opacity-80">
              ختم المدرسة الرسمي
            </div>
          </div>
        </div>
      </div>

      {/* Add New Template Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-700" />
                إدراج قالب نموذج رسمي جديد
              </h3>
              <button onClick={() => setIsTemplateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم وتعنوان النموذج الرسمي:</label>
                <input
                  type="text"
                  required
                  value={tmplForm.title}
                  onChange={(e) => setTmplForm({ ...tmplForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الجهة الصادرة والتأطير:</label>
                <input
                  type="text"
                  required
                  value={tmplForm.issuingBody}
                  onChange={(e) => setTmplForm({ ...tmplForm, issuingBody: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نص المتن الرسمي (يدعم المتغيرات):</label>
                <textarea
                  rows={3}
                  required
                  value={tmplForm.contentTemplate}
                  onChange={(e) => setTmplForm({ ...tmplForm, contentTemplate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs"
                >
                  حفظ واعتمد كقالب رسمي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
