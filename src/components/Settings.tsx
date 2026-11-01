import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { AcademicYearRecord, BackupSnapshot } from '../types';
import {
  Settings as SettingsIcon,
  Calendar,
  Download,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Archive,
  RefreshCw,
  AlertTriangle,
  Smartphone,
  Lock,
  Battery,
  Zap,
  FolderArchive,
  Database,
  ArrowRightLeft,
  FileCheck,
  HardDrive,
  History,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const {
    db,
    activeAcademicYear,
    setActiveAcademicYear,
    currentAccount,
    updateNotificationPreferences,
    getUserNotificationPreferences,
    registerPushToken,
    sendNotificationWithPush,
    createNewAcademicYear,
    createIndependentBackup,
    restoreIndependentBackup,
  } = useSchool();

  const [isAddYearOpen, setIsAddYearOpen] = useState(false);
  const [newYearForm, setNewYearForm] = useState({
    yearName: '2025 - 2026',
    startDate: '2025-09-15',
    endDate: '2026-06-30',
    notes: 'العام الدراسي الجديد المقترح',
  });

  const [backupNotesInput, setBackupNotesInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Notification Preference Toggles
  const currentPrefs = getUserNotificationPreferences(currentAccount?.id || 'u-principal');
  const [notifPrefs, setNotifPrefs] = useState(currentPrefs);

  if (!db) return null;

  const backupSnapshots = db.backupSnapshots || [];
  const availableYears = db.availableYears || [];

  const handleTogglePref = async (key: keyof typeof notifPrefs) => {
    if (key === 'adminMandatoryAlerts') return;
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    await updateNotificationPreferences(updated);
    showStatus('تم حفظ تفضيلات الإشعارات الفورية بنجاح.');
  };

  const handleTestMobilePush = async () => {
    const simulatedToken = `fcm-token-${currentAccount.id}-${Date.now()}`;
    await registerPushToken(simulatedToken, 'ANDROID');

    await sendNotificationWithPush({
      title: '📱 إشعار تجريبي من نظام مدرستي',
      body: 'هذا إشعار تجريبي للتأكد من وصول التنبيهات المباشرة إلى شاشة الهاتف وقفل الشاشة بنجاح.',
      category: 'SYSTEM',
      targetRole: currentAccount.role,
      targetUserId: currentAccount.id,
    });

    showStatus('تم إرسال إشعار تجريبي للهاتف بنجاح! تفقد مركز الإشعارات وشاشة القفل.');
  };

  const handleAddAcademicYear = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    await createNewAcademicYear(
      newYearForm.yearName,
      newYearForm.startDate,
      newYearForm.endDate,
      newYearForm.notes
    );
    setActionLoading(false);
    setIsAddYearOpen(false);
    showStatus(`تم الانتقال وتفعيل السنة الدراسية الجديدة (${newYearForm.yearName}) بنجاح وأرشفة السجلات السابقة.`);
  };

  const handleCreateSnapshot = async () => {
    setActionLoading(true);
    const notesText = backupNotesInput.trim() || 'نسخة احتياطية سحابية يدوية بطلب المستخدم';
    await createIndependentBackup(notesText);
    setBackupNotesInput('');
    setActionLoading(false);
    showStatus('تم إنشاء النسخة الاحتياطية المستقلة بنجاح وحفظها في مجلد backups/ على الخادم.');
  };

  const handleRestoreSnapshot = async (filename: string) => {
    if (
      !window.confirm(
        `هل أنت تأكد من استعادة كافة بيانات المدرسة من النسخة الاحتياطية (${filename})؟ سيتم أخذ نسخة احتياطية آمنة تلقائياً قبل الاستعادة.`
      )
    ) {
      return;
    }

    setActionLoading(true);
    await restoreIndependentBackup(filename);
    setActionLoading(false);
  };

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Export JSON Backup file to local disk
  const handleExportBackup = () => {
    const jsonStr = JSON.stringify(db, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Madrasati_Backup_${activeAcademicYear.replace(/\s+/g, '')}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showStatus('تم تصدير النسخة الاحتياطية وتنزيل الملف بنجاح.');
  };

  // Import JSON Restore
  const handleImportRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.schoolInfo && parsed.teachers && parsed.students) {
          await fetch('/api/school-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsed),
          });
          window.location.reload();
        } else {
          alert('ملف النسخة الاحتياطية غير متوافق مع هيكلية النظام.');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-emerald-700" />
          <h2 className="text-xl font-bold text-slate-900">إعدادات النظام متعدد السنوات والنسخ الاحتياطي المستقل</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          إدارة أرشيف السنوات الدراسية، أخذ نسخ احتياطية مستقلة عن قاعدة البيانات، واستعادة بيانات الأعوام السابقة
        </p>
      </div>

      {statusMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 font-bold shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Multi-Academic-Year Engine Management */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-700" />
              <span>نظام السنوات الدراسية المتعددة والأرشيف (Multi-Academic-Year Engine)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              يتيح التطبيق حفظ تاريخ وسجلات كل طالب، درجاته، تحضير المعلمين، والمناهج عبر السنوات دون فقدان أي بيانات
            </p>
          </div>

          <button
            onClick={() => setIsAddYearOpen(true)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            الانتقال وتفعيل سنة جديدة
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableYears.map((ay, idx) => {
            const isActive = ay.yearName === activeAcademicYear || ay.status === 'ACTIVE';

            return (
              <div
                key={ay.id || idx}
                className={`p-4 rounded-xl border text-right transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20 shadow-2xs'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900 font-mono">{ay.yearName}</span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-emerald-200 text-emerald-900'
                          : ay.status === 'ARCHIVED'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isActive ? 'السنة النشطة الحالية' : ay.status === 'ARCHIVED' ? 'سنة مؤرشفة محفوطة' : 'عام مخطط'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 my-2 font-mono">
                    <div>بداية الدوام: {ay.startDate}</div>
                    <div>ختام العام: {ay.endDate}</div>
                  </div>

                  {ay.notes && (
                    <div className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                      {ay.notes}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200/60 mt-3 flex justify-end">
                  {!isActive && (
                    <button
                      onClick={() => setActiveAcademicYear(ay.yearName)}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-emerald-50 text-slate-800 font-bold text-[11px] rounded-lg shadow-2xs"
                    >
                      عرض بيانات هذا العام
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Independent Dual Backup System Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-indigo-700" />
              <span>نظام النسخ الاحتياطي المستقل المزدوج (Independent Snapshot System)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              حفظ وتوثيق نسخ احتياطية زمنية مستقلة في مجلد أمان الخادم (`/backups`) بجانب قاعدة البيانات لحماية السجلات المدرسية
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="ملاحظات حول النسخة..."
              value={backupNotesInput}
              onChange={(e) => setBackupNotesInput(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-48 focus:outline-none focus:border-indigo-600"
            />
            <button
              onClick={handleCreateSnapshot}
              disabled={actionLoading}
              className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-4 h-4" />
              أخذ نسخة احتياطية مستقلة الآن
            </button>
          </div>
        </div>

        {/* List of Independent Backup Snapshots */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" />
            <span>سجل النسخ الاحتياطية المحفوظة في خادم المدرسة ({backupSnapshots.length} نسخة):</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {backupSnapshots.map((snap) => (
              <div key={snap.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-xs truncate max-w-[200px]" title={snap.filename}>
                      {snap.filename}
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-md">
                      {Math.round((snap.sizeBytes || 1024) / 1024)} KB
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    التاريخ: {snap.createdAt} · العام: {snap.academicYear}
                  </div>

                  <p className="text-[11px] text-slate-700 mt-1 italic">
                    "{snap.notes}"
                  </p>

                  <div className="text-[10px] text-slate-500 font-mono mt-2 flex items-center gap-2">
                    <span>الطلاب: {snap.counts?.students || 0}</span>
                    <span>·</span>
                    <span>الدرجات: {snap.counts?.grades || 0}</span>
                    <span>·</span>
                    <span>التحضير: {snap.counts?.lessonPlans || 0}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <a
                    href={`/api/backups/download/${snap.filename}`}
                    download
                    className="text-indigo-700 font-bold text-[11px] hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    تنزيل الملف
                  </a>

                  <button
                    onClick={() => handleRestoreSnapshot(snap.filename)}
                    className="px-3 py-1 bg-white border border-slate-300 hover:bg-rose-50 hover:border-rose-300 text-slate-800 font-bold text-[10px] rounded-lg shadow-2xs"
                  >
                    استعادة هذه النسخة
                  </button>
                </div>
              </div>
            ))}

            {backupSnapshots.length === 0 && (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 col-span-2">
                <HardDrive className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">انقر على "أخذ نسخة احتياطية مستقلة الآن" لبدء حفظ لقطة أمان لأرشيف المدرسة.</p>
              </div>
            )}
          </div>
        </div>

        {/* Local Export & Import Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900">تنزيل نسخة احتياطية إلى الجهاز الشخصي:</div>
            <p className="text-slate-600 leading-relaxed">
              تنزيل ملف JSON مباشر يتضمن كافة سجلات الطلاب والدرجات للعام {activeAcademicYear}.
            </p>
            <button
              onClick={handleExportBackup}
              className="mt-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              تنزيل الملف المباشر (JSON)
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900">رفع ملف نسخة احتياطية محلية:</div>
            <p className="text-slate-600 leading-relaxed">
              رفع واستعادة ملف JSON من قرص التخزين المحلي في حالة الصيانة أو الطوارئ.
            </p>
            <label className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-xl cursor-pointer shadow-2xs">
              <Upload className="w-4 h-4 text-slate-600" />
              <span>رفع واستعادة الملف المحلي</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportRestore}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Push Notifications Settings Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-700" />
              <span>تفضيلات الإشعارات الفورية على الهواتف الذكية (Push Notifications)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              التحكم في أنواع التنبيهات المدرسية التي تظهر على شاشة الهاتف وشاشة القفل للمستخدم الحالي
            </p>
          </div>

          <button
            onClick={handleTestMobilePush}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 shrink-0"
          >
            <Zap className="w-4 h-4 text-emerald-300" />
            اختبار إرسال إشعار فوري
          </button>
        </div>

        {/* Toggles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">تنبيهات الغياب المباشر</div>
              <div className="text-[11px] text-slate-500 mt-0.5">إرسال إشعار فوري لولي الأمر فور تسجيل غياب الطالب</div>
            </div>
            <button
              onClick={() => handleTogglePref('absenceAlerts')}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                notifPrefs.absenceAlerts ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                  notifPrefs.absenceAlerts ? 'translate-x-[-20px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">تنبيهات التأخر عن الدوام</div>
              <div className="text-[11px] text-slate-500 mt-0.5">تنبيه ولي الأمر عند تأخر الطالب عن الحصة الأولى</div>
            </div>
            <button
              onClick={() => handleTogglePref('tardinessAlerts')}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                notifPrefs.tardinessAlerts ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                  notifPrefs.tardinessAlerts ? 'translate-x-[-20px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">إعلان الدرجات والنتائج</div>
              <div className="text-[11px] text-slate-500 mt-0.5">إشعار عند اعتماد وإعلان نتائج الامتحانات الشهرية</div>
            </div>
            <button
              onClick={() => handleTogglePref('newGradeAlerts')}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                notifPrefs.newGradeAlerts ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                  notifPrefs.newGradeAlerts ? 'translate-x-[-20px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">تنبيهات الواجبات البيتية</div>
              <div className="text-[11px] text-slate-500 mt-0.5">إشعار عند نشر واجب بيتي جديد من المعلم</div>
            </div>
            <button
              onClick={() => handleTogglePref('homeworkAlerts')}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                notifPrefs.homeworkAlerts ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                  notifPrefs.homeworkAlerts ? 'translate-x-[-20px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Add Year & Transition Modal */}
      {isAddYearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-right space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-700" />
              <span>الانتقال وتفعيل سنة دراسية جديدة</span>
            </h3>

            <form onSubmit={handleAddAcademicYear} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم السنة الدراسية الجديدة:</label>
                <input
                  type="text"
                  required
                  value={newYearForm.yearName}
                  onChange={(e) => setNewYearForm({ ...newYearForm, yearName: e.target.value })}
                  placeholder="2025 - 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ المباشرة:</label>
                  <input
                    type="date"
                    required
                    value={newYearForm.startDate}
                    onChange={(e) => setNewYearForm({ ...newYearForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ نهاية العام:</label>
                  <input
                    type="date"
                    required
                    value={newYearForm.endDate}
                    onChange={(e) => setNewYearForm({ ...newYearForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات السنة:</label>
                <input
                  type="text"
                  value={newYearForm.notes}
                  onChange={(e) => setNewYearForm({ ...newYearForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[11px] leading-relaxed">
                ℹ️ سيقوم النظام آلياً بأرشفة العام الدراسي المنقضي وأخذ نسخة احتياطية آمنة قبل وبعد التفعيل.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddYearOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
                >
                  تفعيل العام الجديد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
