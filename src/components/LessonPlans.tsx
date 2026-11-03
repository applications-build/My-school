import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  LessonPlan,
  Homework,
  LessonExecutionStatus,
  formatTeacherName,
} from '../types';
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  ChevronDown,
  ChevronUp,
  User,
  Layers,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Send,
  Upload,
  Download,
  Filter,
  CheckCheck,
  CalendarDays,
  ShieldCheck,
  Eye,
  Award,
  AlertTriangle,
  FolderArchive,
} from 'lucide-react';

export const LessonPlans: React.FC = () => {
  const {
    db,
    currentAccount,
    addDetailedLessonPlan,
    updateLessonPlanExecution,
    addPrincipalLessonFeedback,
    addDetailedHomework,
    updateHomeworkSubmission,
    addCalendarEvent,
    activeAcademicYear,
  } = useSchool();

  const [activeSubTab, setActiveSubTab] = useState<'binder' | 'supervision' | 'homework' | 'calendar' | 'archive'>('binder');

  // Filter State
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Preparation Form Modal State
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [selectedCurriculumEditionId, setSelectedCurriculumEditionId] = useState<string>('');
  const [selectedCurriculumLessonId, setSelectedCurriculumLessonId] = useState<string>('');

  const [prepGradeLevel, setPrepGradeLevel] = useState('الصف السادس الابتدائي');
  const [prepSection, setPrepSection] = useState('أ');
  const [prepSubject, setPrepSubject] = useState('قواعد اللغة العربية');
  const [prepDate, setPrepDate] = useState(new Date().toISOString().split('T')[0]);
  const [prepPeriodNumber, setPrepPeriodNumber] = useState<number>(1);
  const [prepChapterTitle, setPrepChapterTitle] = useState('الفصل الأول: القواعد النحوية');
  const [prepTopic, setPrepTopic] = useState('النكرة والمعرفة');
  const [prepBookPageRange, setPrepBookPageRange] = useState('صفحة 5 إلى صفحة 12');
  const [prepObjectives, setPrepObjectives] = useState('أن يتعرف الطالب على الفرق بين الاسم النكرة والاسم المعرفة ويستخرجها من النص.');
  const [prepIntroduction, setPrepIntroduction] = useState('عرض أمثلة واقعية على السبورة وتحديد الأسماء الدالة على معين.');
  const [prepTeachingAids, setPrepTeachingAids] = useState('السبورة الذكية، البطاقات التوضيحية، الكتاب الرسمي.');
  const [prepTeachingSteps, setPrepTeachingSteps] = useState('1. قراءة النص العراقي\n2. استخراج الأسماء الدالة على معرفة\n3. بيان القاعدة التأسيسية.');
  const [prepClassroomActivities, setPrepClassroomActivities] = useState('حل التدريب الأول في الدفتر الصفي بمشاركة الطلاب.');
  const [prepHomework, setPrepHomework] = useState('حل التمرين الثاني ص 14 في دفتر الواجب البيتي.');
  const [prepAssessmentQuestions, setPrepAssessmentQuestions] = useState('ما هي علامات الاسم المعرفة؟ مثل لجملة فيها اسم نكرة.');
  const [prepNotes, setPrepNotes] = useState('');

  // Execution Status Modal
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [activePlanForExecution, setActivePlanForExecution] = useState<LessonPlan | null>(null);
  const [execStatus, setExecStatus] = useState<LessonExecutionStatus>('FULLY_EXPLAINED');
  const [executedPortion, setExecutedPortion] = useState('');
  const [remainingPortion, setRemainingPortion] = useState('');

  // Principal Feedback Modal
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [activePlanForFeedback, setActivePlanForFeedback] = useState<LessonPlan | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Homework Modal
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [hwTitle, setHwTitle] = useState('');
  const [hwSubject, setHwSubject] = useState('قواعد اللغة العربية');
  const [hwGradeLevel, setHwGradeLevel] = useState('الصف السادس الابتدائي');
  const [hwSection, setHwSection] = useState('أ');
  const [hwDueDate, setHwDueDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [hwDetails, setHwDetails] = useState('');
  const [hwPages, setHwPages] = useState('صفحة 14 تمرين 2');

  // Calendar Event Modal
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calTitle, setCalTitle] = useState('');
  const [calDate, setCalDate] = useState(new Date().toISOString().split('T')[0]);
  const [calType, setCalType] = useState<'SCHOOL_DAY' | 'NATIONAL_HOLIDAY' | 'RELIGIOUS_HOLIDAY' | 'EXAM_PERIOD' | 'TEACHER_LEAVE'>('NATIONAL_HOLIDAY');
  const [calNotes, setCalNotes] = useState('');

  // Print view target
  const [printPlan, setPrintPlan] = useState<LessonPlan | null>(null);

  if (!db) return null;

  const lessonPlans = db.lessonPlans || [];
  const homeworkList = db.homework || [];
  const editions = db.curriculumEditions || [];
  const calendarEvents = db.academicCalendarEvents || [];
  const students = db.students || [];
  const classes = db.classes || [];
  const accounts = db.accounts || [];

  const isPrincipal = currentAccount.role === 'PRINCIPAL';
  const isTeacher = currentAccount.role === 'TEACHER' || currentAccount.role === 'INSTRUCTOR';
  const isParent = currentAccount.role === 'PARENT';

  // Handle selecting lesson from curriculum
  const handleSelectCurriculumLesson = (editionId: string, lessonId: string) => {
    setSelectedCurriculumEditionId(editionId);
    setSelectedCurriculumLessonId(lessonId);

    const edition = editions.find((e) => e.id === editionId);
    if (!edition) return;

    setPrepSubject(edition.subjectName);
    setPrepGradeLevel(edition.gradeLevel);

    for (const ch of edition.chapters || []) {
      const les = ch.lessons?.find((l) => l.id === lessonId);
      if (les) {
        setPrepChapterTitle(ch.title);
        setPrepTopic(les.title);
        setPrepBookPageRange(`صفحة ${les.pageNumber || 1}`);
        break;
      }
    }
  };

  const handleSavePreparation = async (e: React.FormEvent) => {
    e.preventDefault();

    await addDetailedLessonPlan({
      teacherId: currentAccount.id,
      teacherName: formatTeacherName(currentAccount.fullName),
      academicYear: activeAcademicYear,
      stage: 'PRIMARY',
      gradeLevel: prepGradeLevel,
      section: prepSection,
      subject: prepSubject,
      curriculumEditionId: selectedCurriculumEditionId,
      curriculumLessonId: selectedCurriculumLessonId,
      bookPageRange: prepBookPageRange,
      date: prepDate,
      periodNumber: prepPeriodNumber,
      chapterTitle: prepChapterTitle,
      topic: prepTopic,
      objectives: prepObjectives,
      introduction: prepIntroduction,
      teachingAids: prepTeachingAids,
      teachingSteps: prepTeachingSteps,
      classroomActivities: prepClassroomActivities,
      homework: prepHomework,
      assessmentQuestions: prepAssessmentQuestions,
      executionStatus: 'FULLY_EXPLAINED',
      notes: prepNotes,
    });

    setIsPrepModalOpen(false);
  };

  const handleSaveHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle || !hwSubject) return;

    await addDetailedHomework({
      teacherId: currentAccount.id,
      assignedBy: formatTeacherName(currentAccount.fullName),
      academicYear: activeAcademicYear,
      gradeLevel: hwGradeLevel,
      section: hwSection,
      subject: hwSubject,
      title: hwTitle,
      details: hwDetails,
      curriculumPages: hwPages,
      dueDate: hwDueDate,
    });

    setIsHomeworkModalOpen(false);
    setHwTitle('');
    setHwDetails('');
  };

  const handleSaveCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calTitle) return;

    await addCalendarEvent({
      title: calTitle,
      date: calDate,
      type: calType,
      notes: calNotes,
    });

    setIsCalendarModalOpen(false);
    setCalTitle('');
  };

  // Filtered Lesson Plans
  const filteredPlans = lessonPlans.filter((lp) => {
    const matchesClass = selectedClass === 'ALL' || `${lp.gradeLevel} - ${lp.section}` === selectedClass;
    const matchesSubject = selectedSubject === 'ALL' || lp.subject === selectedSubject;
    const matchesTeacher = selectedTeacherId === 'ALL' || lp.teacherId === selectedTeacherId;
    const matchesSearch =
      lp.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lp.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lp.subject.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesClass && matchesSubject && matchesTeacher && matchesSearch;
  });

  // Check if date is a holiday
  const isDateHoliday = (checkDate: string) => {
    return calendarEvents.find(
      (ev) => ev.date === checkDate && (ev.type === 'NATIONAL_HOLIDAY' || ev.type === 'RELIGIOUS_HOLIDAY')
    );
  };

  return (
    <div className="space-y-6">
      {/* Printable Ministry Notebook Overlay */}
      {printPlan && (
        <div className="fixed inset-0 bg-white z-50 p-8 overflow-y-auto text-slate-900 print:p-0">
          <div className="max-w-4xl mx-auto space-y-6 border-4 border-slate-900 p-8 rounded-2xl bg-white shadow-2xl print:border-2">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-600">جمهورية العراق - وزارة التربية</p>
                <p className="text-xs font-bold text-slate-600">{db.schoolInfo.directorate}</p>
                <h1 className="text-xl font-black">{db.schoolInfo.name}</h1>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-300 mx-auto mb-1">
                  <img src="/assets/aistudio/image_a8766003.png" alt="أيقونة مدرستي" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs font-black">دفتر التحضير اليومي الإلكتروني</p>
              </div>
              <div className="text-left space-y-1 text-xs font-bold">
                <p>العام الدراسي: {printPlan.academicYear}</p>
                <p>التاريخ: {printPlan.date}</p>
                <p>الحصة: {printPlan.periodNumber}</p>
              </div>
            </div>

            {/* Preparation Details Table */}
            <div className="grid grid-cols-2 gap-4 text-xs font-bold border border-slate-300 p-4 rounded-xl bg-slate-50">
              <p>المدرس/المعلم: <span className="text-emerald-800">{printPlan.teacherName}</span></p>
              <p>المادة: <span className="text-emerald-800">{printPlan.subject}</span></p>
              <p>الصف والشعبة: <span className="text-slate-900">{printPlan.gradeLevel} - شعبة ({printPlan.section})</span></p>
              <p>صفحات الكتاب: <span className="text-slate-900">{printPlan.bookPageRange || 'حسب المنهج المقرر'}</span></p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="border border-slate-300 p-3 rounded-xl">
                <h4 className="font-extrabold text-slate-900 mb-1 text-sm border-b pb-1">الفصل وعنوان الدرس:</h4>
                <p className="font-bold text-emerald-800">{printPlan.chapterTitle} - {printPlan.topic}</p>
              </div>

              <div className="border border-slate-300 p-3 rounded-xl">
                <h4 className="font-extrabold text-slate-900 mb-1 text-sm border-b pb-1">الأهداف التعليمية (معرفية، وجدانية، مهارية):</h4>
                <p className="whitespace-pre-line text-slate-800">{printPlan.objectives}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-300 p-3 rounded-xl">
                  <h4 className="font-extrabold text-slate-900 mb-1 text-sm border-b pb-1">التمهيد والإثارة:</h4>
                  <p className="text-slate-800">{printPlan.introduction || 'شرح تمهيدي متكامل'}</p>
                </div>
                <div className="border border-slate-300 p-3 rounded-xl">
                  <h4 className="font-extrabold text-slate-900 mb-1 text-sm border-b pb-1">الوسائل التعليمية:</h4>
                  <p className="text-slate-800">{printPlan.teachingAids || 'السبورة والكتاب والوسائل الإيضاحية'}</p>
                </div>
              </div>

              <div className="border border-slate-300 p-3 rounded-xl">
                <h4 className="font-extrabold text-slate-900 mb-1 text-sm border-b pb-1">خطوات الشرح والخطوات التدريسية:</h4>
                <p className="whitespace-pre-line text-slate-800">{printPlan.teachingSteps || 'العرض والتطبيق المفصل'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-300 p-3 rounded-xl">
                  <h4 className="font-extrabold text-slate-900 mb-1 text-sm border-b pb-1">الأنشطة الصفية:</h4>
                  <p className="text-slate-800">{printPlan.classroomActivities || 'تدريبات وحلول على السبورة'}</p>
                </div>
                <div className="border border-slate-300 p-3 rounded-xl">
                  <h4 className="font-extrabold text-slate-900 mb-1 text-sm border-b pb-1">الواجب البيتي:</h4>
                  <p className="text-slate-800 font-bold text-emerald-800">{printPlan.homework}</p>
                </div>
              </div>

              {printPlan.principalFeedback && (
                <div className="border-2 border-emerald-500 bg-emerald-50/50 p-3 rounded-xl">
                  <h4 className="font-extrabold text-emerald-900 mb-1 text-sm">توجيه وملاحظة المدير الإدارية:</h4>
                  <p className="text-emerald-800 font-bold">{printPlan.principalFeedback} ({printPlan.principalFeedbackDate})</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-300 text-xs font-bold print:hidden">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة المستند الرسمي</span>
              </button>

              <button
                onClick={() => setPrintPlan(null)}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>دفتر التحضير اليومي الإلكتروني - وزارة التربية العراقية</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">دفتر التحضير والواجبات المنزلية والتقويم</h1>
          <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl">
            نظام متكامل يربط تحضير المعلم اليومي بالمنهج العراقي، تسجيل ما تم شرحه بالفعل، متابعة الإدارة والتأخير عن الخطة، وإبلاغ أولياء الأمور بالواجبات.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {(isTeacher || isPrincipal) && (
            <button
              onClick={() => setIsPrepModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إعداد تحضير درس جديد</span>
            </button>
          )}

          {(isTeacher || isPrincipal) && (
            <button
              onClick={() => setIsHomeworkModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all active:scale-95 backdrop-blur-md"
            >
              <FileText className="w-4 h-4" />
              <span>إضافة واجب بيتي</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('binder')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'binder' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>دفتر تحضير الدروس اليومي ({lessonPlans.length})</span>
        </button>

        {isPrincipal && (
          <button
            onClick={() => setActiveSubTab('supervision')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'supervision' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>لوحة متابعة وتوجيهات المدير</span>
          </button>
        )}

        <button
          onClick={() => setActiveSubTab('homework')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'homework' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>نظام الواجبات المنزلية ({homeworkList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'calendar' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>التقويم المدرسي والعطل</span>
        </button>

        <button
          onClick={() => setActiveSubTab('archive')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'archive' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FolderArchive className="w-4 h-4" />
          <span>أرشيف السنوات الدراسية</span>
        </button>
      </div>

      {/* SUB-TAB 1: LESSON PREPARATION BINDER */}
      {activeSubTab === 'binder' && (
        <div className="space-y-6">
          {/* Controls & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="ابحث باسم المدرس، عنوان الدرس، أو المادة..."
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
                {['قواعد اللغة العربية', 'الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء', 'اللغة الإنكليزية', 'التربية الإسلامية'].map(
                  (sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* Lesson Preparation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlans.length === 0 ? (
              <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">لا توجد تحضيرات دروس مطابقة للخيار الحالي.</p>
              </div>
            ) : (
              filteredPlans.map((plan) => {
                const holiday = isDateHoliday(plan.date);

                return (
                  <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                    {/* Top Row Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-sm text-slate-900">{plan.topic}</h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            الحصة {plan.periodNumber}
                          </span>
                          {holiday && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>صادف عطلة رسمية</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          المعلم: <span className="font-bold text-emerald-800">{plan.teacherName}</span> | مادة: {plan.subject} ({plan.gradeLevel} - شعبة {plan.section})
                        </p>
                      </div>
                    </div>

                    {/* Section Breakdown Details */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-700">الفصل والوحدة: </span>
                        <span className="text-slate-900 font-medium">{plan.chapterTitle}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">صفحات المنهج الرسمي: </span>
                        <span className="text-slate-900 font-bold text-emerald-800">{plan.bookPageRange || 'محدد من الكتاب'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">الأهداف التعليمية: </span>
                        <p className="text-slate-800 bg-slate-50 p-2 rounded-xl mt-1 text-[11px] leading-relaxed">
                          {plan.objectives}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">الواجب البيتي: </span>
                        <span className="font-bold text-emerald-800">{plan.homework}</span>
                      </div>
                    </div>

                    {/* Execution Status Badge & Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500">حالة الشرح:</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            plan.executionStatus === 'FULLY_EXPLAINED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : plan.executionStatus === 'PARTIALLY_EXPLAINED'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {plan.executionStatus === 'FULLY_EXPLAINED'
                            ? 'تم شرح الدرس بالكامل'
                            : plan.executionStatus === 'PARTIALLY_EXPLAINED'
                            ? 'تم شرح جزء فقط'
                            : 'لم يتم الشرح / مؤجل'}
                        </span>
                      </div>

                      {(isTeacher || isPrincipal) && (
                        <button
                          onClick={() => {
                            setActivePlanForExecution(plan);
                            setExecStatus(plan.executionStatus);
                            setExecutedPortion(plan.executedPortion || '');
                            setRemainingPortion(plan.remainingPortion || '');
                            setIsExecutionModalOpen(true);
                          }}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shrink-0"
                        >
                          تحديث ما تم شرحه
                        </button>
                      )}
                    </div>

                    {/* Principal Administrative Feedback Callout */}
                    {plan.principalFeedback && (
                      <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1">
                        <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-700" />
                          <span>توجيه وملاحظة المدير الإدارية ({plan.principalFeedbackDate}):</span>
                        </div>
                        <p className="text-emerald-800 font-medium">{plan.principalFeedback}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PRINCIPAL SUPERVISION DASHBOARD */}
      {activeSubTab === 'supervision' && isPrincipal && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>متابعة الإدارة والتأكد من الالتزام بالخطة الدراسية</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                مشاهدة دفاتر تحضير المعلمين، البحث حسب المادة والصف، وتوجيه ملاحظات دون التعديل على نص المدرس
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900 text-slate-200 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3">التاريخ والحصة</th>
                    <th className="p-3">المدرس والمادة</th>
                    <th className="p-3">الصف والشعبة</th>
                    <th className="p-3">عنوان الدرس</th>
                    <th className="p-3">حالة التنفيذ</th>
                    <th className="p-3">توجيه الإدارة</th>
                    <th className="p-3">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lessonPlans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-800">
                        {plan.date} (حصة {plan.periodNumber})
                      </td>
                      <td className="p-3 font-bold text-emerald-800">
                        {plan.teacherName} - {plan.subject}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-800">
                          {plan.gradeLevel} - {plan.section}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900">{plan.topic}</td>
                      <td className="p-3 font-bold text-slate-700">
                        {plan.executionStatus === 'FULLY_EXPLAINED' ? 'تم بالكامل' : 'جزئي/مؤجل'}
                      </td>
                      <td className="p-3 font-medium text-emerald-800">{plan.principalFeedback || 'لا يوجد'}</td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setActivePlanForFeedback(plan);
                            setFeedbackText(plan.principalFeedback || '');
                            setIsFeedbackModalOpen(true);
                          }}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all"
                        >
                          إضافة توجيه
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: HOMEWORK SYSTEM */}
      {activeSubTab === 'homework' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-700" />
                  <span>نظام الواجبات المنزلية ومتابعة ولي الأمر</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  إسناد الواجبات من كتاب المنهج العراقي، تحديد موعد التسليم، ومتابعة إنجاز الطالب
                </p>
              </div>

              {(isTeacher || isPrincipal) && (
                <button
                  onClick={() => setIsHomeworkModalOpen(true)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  + واجب جديد
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {homeworkList.map((hw) => (
                <div key={hw.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{hw.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        المادة: <span className="font-bold text-emerald-800">{hw.subject}</span> ({hw.gradeLevel} - شعبة {hw.section})
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px]">
                      تاريخ التسليم: {hw.dueDate}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{hw.details}</p>

                  {hw.curriculumPages && (
                    <div className="text-xs font-bold text-emerald-800 bg-emerald-100/60 p-2 rounded-xl">
                      الصفحات المقررة: {hw.curriculumPages}
                    </div>
                  )}

                  <div className="pt-2 text-xs font-bold text-slate-500 flex items-center justify-between">
                    <span>بواسطة المعلم: {hw.assignedBy}</span>
                    <span className="text-emerald-700">متاح في بوابة ولي الأمر</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: ACADEMIC CALENDAR */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-emerald-700" />
                  <span>التقويم المدرسي والعطل والأيام الرسمية</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ربط التحضير والدوام الرسمي بجدول العطل الرسمية لوزارة التربية
                </p>
              </div>

              {isPrincipal && (
                <button
                  onClick={() => setIsCalendarModalOpen(true)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all"
                >
                  + إضافة حدث للتقويم
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {calendarEvents.map((ev) => (
                <div key={ev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">{ev.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ev.type === 'NATIONAL_HOLIDAY' || ev.type === 'RELIGIOUS_HOLIDAY'
                          ? 'bg-amber-500 text-white'
                          : ev.type === 'EXAM_PERIOD'
                          ? 'bg-rose-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {ev.type === 'NATIONAL_HOLIDAY'
                        ? 'عطلة رسمية'
                        : ev.type === 'RELIGIOUS_HOLIDAY'
                        ? 'عطلة دينية'
                        : ev.type === 'EXAM_PERIOD'
                        ? 'فترة امتحانات'
                        : 'يوم دوام'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-600">التاريخ: {ev.date}</p>
                  <p className="text-xs text-slate-500">{ev.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NEW LESSON PREPARATION MODAL */}
      {isPrepModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <h3 className="text-base font-bold text-slate-900">إعداد تحضير درس إلكتروني جديد</h3>

            <form onSubmit={handleSavePreparation} className="space-y-4 text-xs">
              {/* Select Lesson from Curriculum Database */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <label className="block font-bold text-emerald-900">الربط المباشر بالمنهج العراقي المعتمد *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={selectedCurriculumEditionId}
                    onChange={(e) => setSelectedCurriculumEditionId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="">اختر كتاب المنهج...</option>
                    {editions.map((ed) => (
                      <option key={ed.id} value={ed.id}>
                        {ed.bookTitle} ({ed.gradeLevel})
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedCurriculumLessonId}
                    onChange={(e) => handleSelectCurriculumLesson(selectedCurriculumEditionId, e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="">اختر الدرس من الكتاب...</option>
                    {(() => {
                      const ed = editions.find((e) => e.id === selectedCurriculumEditionId);
                      if (!ed) return null;
                      return (ed.chapters || []).map((ch) => (
                        <optgroup key={ch.id} label={ch.title}>
                          {(ch.lessons || []).map((l) => (
                            <option key={l.id} value={l.id}>
                              م{l.lessonNumber}: {l.title} (ص {l.pageNumber})
                            </option>
                          ))}
                        </optgroup>
                      ));
                    })()}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الصف والشعبة *</label>
                  <input
                    type="text"
                    required
                    value={`${prepGradeLevel} - شعبة (${prepSection})`}
                    onChange={(e) => setPrepGradeLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الدرس *</label>
                  <input
                    type="date"
                    required
                    value={prepDate}
                    onChange={(e) => setPrepDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الحصة *</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={prepPeriodNumber}
                    onChange={(e) => setPrepPeriodNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان الدرس *</label>
                <input
                  type="text"
                  required
                  value={prepTopic}
                  onChange={(e) => setPrepTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الأهداف التعليمية *</label>
                <textarea
                  rows={2}
                  required
                  value={prepObjectives}
                  onChange={(e) => setPrepObjectives(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التمهيد والإثارة</label>
                  <input
                    type="text"
                    value={prepIntroduction}
                    onChange={(e) => setPrepIntroduction(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الوسائل التعليمية</label>
                  <input
                    type="text"
                    value={prepTeachingAids}
                    onChange={(e) => setPrepTeachingAids(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">خطوات الشرح والخطوات التدريسية</label>
                <textarea
                  rows={3}
                  value={prepTeachingSteps}
                  onChange={(e) => setPrepTeachingSteps(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الأنشطة الصفية</label>
                  <input
                    type="text"
                    value={prepClassroomActivities}
                    onChange={(e) => setPrepClassroomActivities(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الواجب البيتي المقرر</label>
                  <input
                    type="text"
                    value={prepHomework}
                    onChange={(e) => setPrepHomework(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPrepModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs"
                >
                  حفظ في دفتر التحضير
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE EXECUTION STATUS MODAL */}
      {isExecutionModalOpen && activePlanForExecution && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">تسجيل ما تم شرحه بالفعل</h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">حالة الشرح *</label>
                <select
                  value={execStatus}
                  onChange={(e) => setExecStatus(e.target.value as LessonExecutionStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  <option value="FULLY_EXPLAINED">تم شرح الدرس بالكامل</option>
                  <option value="PARTIALLY_EXPLAINED">تم شرح جزء من الدرس فقط</option>
                  <option value="NOT_EXPLAINED">لم يتم شرح الدرس</option>
                  <option value="POSTPONED">تم تأجيل الدرس لحصة قادمة</option>
                </select>
              </div>

              {execStatus === 'PARTIALLY_EXPLAINED' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الجزء المنجز الشرح فيه</label>
                    <input
                      type="text"
                      placeholder="مثل: المفهوم الأول وحل التمرين 1"
                      value={executedPortion}
                      onChange={(e) => setExecutedPortion(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الجزء المتبقي للحصة القادمة</label>
                    <input
                      type="text"
                      placeholder="مثل: التمرين الثاني ص 18"
                      value={remainingPortion}
                      onChange={(e) => setRemainingPortion(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExecutionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await updateLessonPlanExecution(
                      activePlanForExecution.id,
                      execStatus,
                      executedPortion,
                      remainingPortion
                    );
                    setIsExecutionModalOpen(false);
                  }}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs"
                >
                  تأكيد وحفظ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINCIPAL FEEDBACK MODAL */}
      {isFeedbackModalOpen && activePlanForFeedback && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">توجيه ملاحظة إدارية على التحضير</h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">نص الملاحظة أو طلب استكمال التحضير *</label>
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="مثال: يرجى إضافة تفاصيل الأنشطة الصفية وتكثيف التمهيد المسبق..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await addPrincipalLessonFeedback(activePlanForFeedback.id, feedbackText);
                    setIsFeedbackModalOpen(false);
                  }}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs"
                >
                  إرسال التوجيه
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW HOMEWORK MODAL */}
      {isHomeworkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">إضافة واجب بيتي للطلاب</h3>

            <form onSubmit={handleSaveHomework} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان الواجب البيتي *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حل تمارين النكرة والمعرفة"
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الصف والشعبة</label>
                  <input
                    type="text"
                    value={`${hwGradeLevel} - ${hwSection}`}
                    onChange={(e) => setHwGradeLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ التسليم *</label>
                  <input
                    type="date"
                    required
                    value={hwDueDate}
                    onChange={(e) => setHwDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الصفحات والتمرينات من الكتاب</label>
                <input
                  type="text"
                  value={hwPages}
                  onChange={(e) => setHwPages(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تفاصيل وملاحظات الإنجاز</label>
                <textarea
                  rows={3}
                  value={hwDetails}
                  onChange={(e) => setHwDetails(e.target.value)}
                  placeholder="مثال: كتابة الحل بوضوح في دفتر الواجب البيتي بخط واضح..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsHomeworkModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs"
                >
                  نشر الواجب البيتي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CALENDAR EVENT MODAL */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">إضافة حدث للتقويم المدرسي والعطل</h3>

            <form onSubmit={handleSaveCalendarEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان الحدث أو العطلة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عطلة المولد النبوي الشريف"
                  value={calTitle}
                  onChange={(e) => setCalTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التاريخ *</label>
                  <input
                    type="date"
                    required
                    value={calDate}
                    onChange={(e) => setCalDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع الحدث</label>
                  <select
                    value={calType}
                    onChange={(e) => setCalType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="NATIONAL_HOLIDAY">عطلة رسمية</option>
                    <option value="RELIGIOUS_HOLIDAY">عطلة دينية</option>
                    <option value="EXAM_PERIOD">امتحانات</option>
                    <option value="SCHOOL_DAY">يوم دوام مخصص</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCalendarModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs"
                >
                  إدراج في التقويم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
