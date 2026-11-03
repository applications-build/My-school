import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  CurriculumEdition,
  CurriculumChapter,
  CurriculumLesson,
  SubjectPlan,
  formatTeacherName,
} from '../types';
import {
  BookOpen,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  Search,
  Filter,
  BarChart3,
  User,
  Calendar,
  Sparkles,
  Award,
  Upload,
  Download,
  Check,
  Eye,
  ShieldCheck,
} from 'lucide-react';

export const CurriculumManager: React.FC = () => {
  const {
    db,
    currentAccount,
    addCurriculumEdition,
    updateCurriculumEdition,
    importCurriculumEditions,
    createSubjectPlan,
    logLessonProgress,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'plans' | 'dashboard'>('dashboard');

  // Filters for Database view
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedEditionId, setExpandedEditionId] = useState<string | null>('cur-ed-ar-6');

  // New Edition Form state
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newStage, setNewStage] = useState('PRIMARY');
  const [newGradeLevel, setNewGradeLevel] = useState('الصف السادس الابتدائي');
  const [newBranch, setNewBranch] = useState('GENERAL');
  const [newEditionYear, setNewEditionYear] = useState('2024');
  const [newEditionNumber, setNewEditionNumber] = useState('الطبعة الأولى 2024');
  const [newIssuingBody, setNewIssuingBody] = useState('وزارة التربية - المديرية العامة للمناهج');
  const [newApprovalDate, setNewApprovalDate] = useState('2024-08-15');
  const [newTotalPages, setNewTotalPages] = useState('160');
  const [newPdfUrl, setNewPdfUrl] = useState('');
  const [formChapters, setFormChapters] = useState<
    { title: string; lessons: { title: string; pageNumber: number; estimatedPeriods: number }[] }[]
  >([
    {
      title: 'الفصل الأول: البداية والتأسيس',
      lessons: [
        { title: 'الدرس الأول: مدخل وتعريف', pageNumber: 5, estimatedPeriods: 3 },
        { title: 'الدرس الثاني: المفاهيم الأساسية', pageNumber: 15, estimatedPeriods: 4 },
      ],
    },
  ]);

  // Plan creation modal
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedEditionForPlan, setSelectedEditionForPlan] = useState<string>('');
  const [planGradeLevel, setPlanGradeLevel] = useState('');
  const [planSection, setPlanSection] = useState('أ');
  const [planTeacherId, setPlanTeacherId] = useState('');
  const [planTargetDate, setPlanTargetDate] = useState('2025-05-20');

  // Lesson Logging modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logPlanId, setLogPlanId] = useState<string>('');
  const [logLessonId, setLogLessonId] = useState<string>('');
  const [logPeriodsSpent, setLogPeriodsSpent] = useState<number>(3);
  const [logNotes, setLogNotes] = useState<string>('');

  const editions = db?.curriculumEditions || [];
  const subjectPlans = db?.subjectPlans || [];
  const lessonLogs = db?.lessonProgressLogs || [];
  const teachers = db?.teachers || [];
  const accounts = db?.accounts || [];
  const currentYear = db?.currentAcademicYear || '2024 - 2025';

  const isPrincipal = currentAccount.role === 'PRINCIPAL';
  const isTeacher = currentAccount.role === 'TEACHER' || currentAccount.role === 'INSTRUCTOR';

  // Helper to calculate completion statistics for a Subject Plan
  const getPlanStats = (plan: SubjectPlan) => {
    const edition = editions.find((e) => e.id === plan.curriculumEditionId);
    if (!edition) {
      return {
        totalLessons: 0,
        completedLessons: 0,
        percentage: 0,
        totalPeriods: 0,
        completedPeriods: 0,
        statusLabel: 'غير محدد',
        statusColor: 'bg-slate-100 text-slate-700',
      };
    }

    let allLessons: CurriculumLesson[] = [];
    (edition.chapters || []).forEach((ch) => {
      allLessons = [...allLessons, ...(ch.lessons || [])];
    });

    const totalLessons = allLessons.length;
    const completedIds = plan.completedLessonIds || [];
    const completedLessonsCount = completedIds.length;

    let totalPeriods = 0;
    let completedPeriods = 0;

    allLessons.forEach((l) => {
      totalPeriods += l.estimatedPeriods || 1;
      if (completedIds.includes(l.id)) {
        completedPeriods += l.estimatedPeriods || 1;
      }
    });

    const percentage = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

    let statusLabel = 'ضمن الخطة الرسمية';
    let statusColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';

    if (percentage < 30) {
      statusLabel = 'متأخر عن الخطة الزمنية';
      statusColor = 'bg-rose-100 text-rose-800 border-rose-300';
    } else if (percentage < 70) {
      statusLabel = 'جارٍ التنفيذ المنتظم';
      statusColor = 'bg-amber-100 text-amber-800 border-amber-300';
    } else if (percentage >= 90) {
      statusLabel = 'إنجاز متقدم / شارفت على الانتهاء';
      statusColor = 'bg-blue-100 text-blue-800 border-blue-300';
    }

    return {
      edition,
      allLessons,
      totalLessons,
      completedLessonsCount,
      percentage,
      totalPeriods,
      completedPeriods,
      statusLabel,
      statusColor,
    };
  };

  // Add Chapter to Form
  const handleAddChapter = () => {
    setFormChapters([
      ...formChapters,
      {
        title: `الفصل ${formChapters.length + 1}: عنوان الفصل`,
        lessons: [{ title: 'الدرس 1', pageNumber: 1, estimatedPeriods: 3 }],
      },
    ]);
  };

  // Add Lesson to Form Chapter
  const handleAddLesson = (chapterIndex: number) => {
    const updated = [...formChapters];
    const currentLessonsCount = updated[chapterIndex].lessons.length;
    updated[chapterIndex].lessons.push({
      title: `الدرس ${currentLessonsCount + 1}`,
      pageNumber: 1,
      estimatedPeriods: 3,
    });
    setFormChapters(updated);
  };

  // Submit New Edition
  const handleSaveEdition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName || !newBookTitle) return;

    const chapters: CurriculumChapter[] = formChapters.map((ch, chIdx) => ({
      id: `ch-custom-${Date.now()}-${chIdx}`,
      chapterNumber: chIdx + 1,
      title: ch.title,
      lessons: ch.lessons.map((les, lIdx) => ({
        id: `les-custom-${Date.now()}-${chIdx}-${lIdx}`,
        lessonNumber: lIdx + 1,
        title: les.title,
        pageNumber: les.pageNumber,
        estimatedPeriods: les.estimatedPeriods,
      })),
    }));

    await addCurriculumEdition({
      subjectName: newSubjectName,
      bookTitle: newBookTitle,
      stage: newStage,
      gradeLevel: newGradeLevel,
      branch: newBranch,
      issuingBody: newIssuingBody,
      editionYear: newEditionYear,
      editionNumber: newEditionNumber,
      approvalDate: newApprovalDate,
      status: 'ACTIVE',
      academicYear: currentYear,
      totalPages: Number(newTotalPages) || 150,
      pdfUrl: newPdfUrl || 'https://example.com/curriculum/official-book.pdf',
      chapters,
    });

    // Reset Form
    setNewSubjectName('');
    setNewBookTitle('');
    setActiveTab('dashboard');
  };

  // Import Ministry Bulk Simulation
  const handleSimulateImport = async () => {
    const imported: CurriculumEdition[] = [
      {
        id: `cur-ed-imp-${Date.now()}-1`,
        subjectName: 'الرياضيات',
        bookTitle: 'الرياضيات للصف الخامس الابتدائي',
        stage: 'PRIMARY',
        gradeLevel: 'الصف الخامس الابتدائي',
        branch: 'GENERAL',
        issuingBody: 'وزارة التربية - المديرية العامة للمناهج (استيراد حكومي)',
        editionYear: '2024',
        editionNumber: 'الطبعة السادسة 2024',
        approvalDate: '2024-08-18',
        status: 'ACTIVE',
        academicYear: currentYear,
        totalPages: 210,
        pdfUrl: 'https://example.com/math-primary-5.pdf',
        chapters: [
          {
            id: `ch-imp-1`,
            chapterNumber: 1,
            title: 'الفصل الأول: الأعداد ضمن الملايين والعمليات عليها',
            lessons: [
              { id: `les-imp-1`, lessonNumber: 1, title: 'القيمة المكانية للأعداد الكبيرة', pageNumber: 8, estimatedPeriods: 4 },
              { id: `les-imp-2`, lessonNumber: 2, title: 'جمع وطرح الأعداد الكبيرة', pageNumber: 20, estimatedPeriods: 5 },
            ],
          },
        ],
      },
    ];

    await importCurriculumEditions(imported);
    setActiveTab('dashboard');
  };

  // Submit Subject Plan
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditionForPlan || !planGradeLevel || !planTeacherId) return;

    const edition = editions.find((e) => e.id === selectedEditionForPlan);
    const teacherObj = accounts.find((a) => a.id === planTeacherId) || teachers.find((t) => t.id === planTeacherId);
    const teacherName = teacherObj ? formatTeacherName((teacherObj as any).fullName || (teacherObj as any).name) : 'أ. كادر مخصص';

    await createSubjectPlan({
      curriculumEditionId: selectedEditionForPlan,
      stage: edition?.stage || 'PRIMARY',
      gradeLevel: planGradeLevel,
      section: planSection,
      subjectName: edition?.subjectName || 'مادة دراسية',
      teacherId: planTeacherId,
      teacherName,
      academicYear: currentYear,
      targetCompletionDate: planTargetDate,
      completedLessonIds: [],
    });

    setIsPlanModalOpen(false);
  };

  // Filter Editions
  const filteredEditions = editions.filter((ed) => {
    const matchesStage = selectedStage === 'ALL' || ed.stage === selectedStage;
    const matchesSearch =
      ed.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ed.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ed.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>نظام المناهج والكتب الرسمية - وزارة التربية العراقية</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">إدارة المناهج والخطط الدراسية ونسب الإنجاز</h1>
            <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl">
              تتبع مفصل لإصدارات الكتب الرسمية، إدخال الخطط السنوية، ومتابعة نسبة الإنجاز الفعلي لكل صف وشعبة ومعلم بدون استبدال الإصدارات التاريخية.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>تخصيص خطة مادة لشعبة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>لوحة متابعة إنجاز المنهج</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'plans'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>الخطط الدراسية للشعب ({subjectPlans.length})</span>
        </button>
      </div>

      {/* TAB 1: SYLLABUS COMPLETION DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metric Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">عدد المناهج المعتمدة</p>
                <p className="text-2xl font-black text-slate-900">{editions.length}</p>
                <p className="text-[11px] text-emerald-700 font-semibold mt-1">طبعات رسمية صادرة</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">الخطط الدراسية النشطة</p>
                <p className="text-2xl font-black text-slate-900">{subjectPlans.length}</p>
                <p className="text-[11px] text-blue-700 font-semibold mt-1">موزعة على الصفوف والشعب</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-700">
                <Layers className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">معدل الإنجاز العام للمدرسة</p>
                <p className="text-2xl font-black text-emerald-700">
                  {subjectPlans.length > 0
                    ? Math.round(
                        subjectPlans.reduce((acc, p) => acc + getPlanStats(p).percentage, 0) /
                          subjectPlans.length
                      )
                    : 0}
                  %
                </p>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">حسب المنهج الزمني</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-800">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">الدروس الشارحة الموثقة</p>
                <p className="text-2xl font-black text-amber-700">{lessonLogs.length}</p>
                <p className="text-[11px] text-amber-800 font-semibold mt-1">سجل تنفيذ يومي للمعلمين</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Section Progress Comparison Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-700" />
                  <span>نسب إنجاز المناهج حسب المادة والشعبة والمعلم</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  مقارنة فورية للتقدم الفعلي في شرح الدروس المقررة بين الشعب المخلتفة والمعلمين
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {subjectPlans.map((plan) => {
                const stats = getPlanStats(plan);
                const isMyPlan =
                  currentAccount.id === plan.teacherId ||
                  currentAccount.fullName.includes(plan.teacherName.replace(/^أ\.\s*/, ''));

                return (
                  <div
                    key={plan.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isMyPlan
                        ? 'border-emerald-300 bg-emerald-50/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-slate-900">{plan.subjectName}</span>
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                            {plan.gradeLevel} - شعبة ({plan.section})
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${stats.statusColor}`}>
                            {stats.statusLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                          <span className="flex items-center gap-1 font-semibold text-emerald-800">
                            <User className="w-3.5 h-3.5" />
                            <span>المعلم المكلف: {plan.teacherName}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>معدل الإنجاز المطلوب بحلول: {plan.targetCompletionDate || 'نهاية السنة'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Lesson Logger Trigger for assigned teacher or admin */}
                      {(isTeacher || isPrincipal) && (
                        <button
                          onClick={() => {
                            setLogPlanId(plan.id);
                            setIsLogModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>تسجيل إنجاز درس</span>
                        </button>
                      )}
                    </div>

                    {/* Progress Bar & Details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700">
                          تم شرح {stats.completedLessonsCount} من أصل {stats.totalLessons} درس مقرر ({stats.completedPeriods} من أصل {stats.totalPeriods} حصة)
                        </span>
                        <span className="text-emerald-700 font-extrabold text-sm">{stats.percentage}%</span>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200/80 p-0.5">
                        <div
                          className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-500 shadow-xs"
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>

                      {/* Quick Lesson Breakdown Pills */}
                      <div className="pt-3 flex flex-wrap items-center gap-1.5">
                        {(stats.allLessons || []).slice(0, 8).map((les) => {
                          const isDone = (plan.completedLessonIds || []).includes(les.id);
                          return (
                            <span
                              key={les.id}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ${
                                isDone
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {isDone ? (
                                <Check className="w-3 h-3 text-emerald-700" />
                              ) : (
                                <Clock className="w-3 h-3 text-slate-400" />
                              )}
                              <span>
                                م{les.lessonNumber}: {les.title} ({les.estimatedPeriods} حصص)
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Lesson Progress Execution Log */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>سجل الحصص المشروحة والإنجاز اليومي</span>
            </h3>

            {lessonLogs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">لم يتم تسجيل أي درس بعد.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">تاريخ التنفيذ</th>
                      <th className="p-3">الصف والشعبة</th>
                      <th className="p-3">الفصل والدراسة</th>
                      <th className="p-3">الدرس المشروح</th>
                      <th className="p-3">المعلم المنفذ</th>
                      <th className="p-3">الحصص</th>
                      <th className="p-3">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lessonLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-semibold text-slate-900">{log.executionDate}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-800">
                            {log.gradeLevel} - {log.section}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-600">{log.chapterTitle}</td>
                        <td className="p-3 font-bold text-emerald-800">{log.lessonTitle}</td>
                        <td className="p-3 text-slate-800 font-semibold">{log.executedByTeacherName}</td>
                        <td className="p-3 font-bold text-slate-700">{log.periodsSpent} حصة</td>
                        <td className="p-3 text-slate-500">{log.notes || 'لا يوجد'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}



      {/* TAB 3: SUBJECT PLANS */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">الخطط الدراسية السنوية الموزعة</h3>
                <p className="text-xs text-slate-500">ربط المنهج بالصف والشعبة والكادر التدريسي المعتمد</p>
              </div>

              <button
                onClick={() => setIsPlanModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء خطة مادة جديدة</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">المادة والصف</th>
                    <th className="p-3">الشعبة</th>
                    <th className="p-3">المعلم المكلف</th>
                    <th className="p-3">الكتاب المعتمد</th>
                    <th className="p-3">تاريخ الإنجاز المتوقع</th>
                    <th className="p-3">نسبة الإنجاز</th>
                    <th className="p-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjectPlans.map((plan) => {
                    const stats = getPlanStats(plan);
                    return (
                      <tr key={plan.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900">
                          {plan.subjectName} - {plan.gradeLevel}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">
                            شعبة ({plan.section})
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-emerald-800">{plan.teacherName}</td>
                        <td className="p-3 text-slate-600">{stats.edition?.bookTitle || 'منهج أساسي'}</td>
                        <td className="p-3 font-medium text-slate-600">{plan.targetCompletionDate || 'مفتوح'}</td>
                        <td className="p-3 font-extrabold text-emerald-700">{stats.percentage}%</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${stats.statusColor}`}>
                            {stats.statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



      {/* PLAN CREATION MODAL */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">تخصيص خطة مادة دراسية لشعبة</h3>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر كتاب المنهج الرسمي *</label>
                <select
                  required
                  value={selectedEditionForPlan}
                  onChange={(e) => setSelectedEditionForPlan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="">اختر المنهج...</option>
                  {editions.map((ed) => (
                    <option key={ed.id} value={ed.id}>
                      {ed.bookTitle} ({ed.gradeLevel}) - {ed.editionNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الصف الدراسي *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: الصف السادس الابتدائي"
                    value={planGradeLevel}
                    onChange={(e) => setPlanGradeLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الشعبة *</label>
                  <input
                    type="text"
                    required
                    placeholder="أ، ب، ج..."
                    value={planSection}
                    onChange={(e) => setPlanSection(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المعلم/المدرس المكلف *</label>
                <select
                  required
                  value={planTeacherId}
                  onChange={(e) => setPlanTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="">اختر المعلم من الكادر...</option>
                  {accounts
                    .filter((a) => a.role === 'TEACHER' || a.role === 'INSTRUCTOR')
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {formatTeacherName(acc.fullName)} ({acc.role === 'TEACHER' ? 'معلم' : 'مدرس'})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ إكمال المنهج المستهدف</label>
                <input
                  type="date"
                  value={planTargetDate}
                  onChange={(e) => setPlanTargetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs"
                >
                  حفظ وتخصيص الخطة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LESSON PROGRESS LOGGING MODAL */}
      {isLogModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">توثيق وتسجيل إنجاز درس</h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر الدرس المشروح من المنهج المقرر *</label>
                <select
                  value={logLessonId}
                  onChange={(e) => setLogLessonId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="">اختر الدرس...</option>
                  {(() => {
                    const plan = subjectPlans.find((p) => p.id === logPlanId);
                    if (!plan) return null;
                    const edition = editions.find((e) => e.id === plan.curriculumEditionId);
                    if (!edition) return null;

                    return (edition.chapters || []).map((ch) => (
                      <optgroup key={ch.id} label={ch.title}>
                        {(ch.lessons || []).map((l) => (
                          <option key={l.id} value={l.id}>
                            م{l.lessonNumber}: {l.title} ({l.estimatedPeriods} حصص)
                          </option>
                        ))}
                      </optgroup>
                    ));
                  })()}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">عدد الحصص المستغرقة</label>
                <input
                  type="number"
                  value={logPeriodsSpent}
                  onChange={(e) => setLogPeriodsSpent(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات الدرس أو التمارين المسندة</label>
                <textarea
                  rows={3}
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="مثال: تم إكمال شرح المفهوم وإعطاء الواجب البيتي صفحة 22..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!logPlanId || !logLessonId) return;
                    await logLessonProgress(logPlanId, logLessonId, logPeriodsSpent, logNotes);
                    setIsLogModalOpen(false);
                  }}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs"
                >
                  تسجيل الدرس كمكتمل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
