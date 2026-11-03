import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { NotificationItem, AccountType } from '../types';
import {
  Bell,
  Check,
  Trash2,
  CalendarCheck,
  AlertTriangle,
  Sparkles,
  Filter,
  Send,
  Smartphone,
  BookOpen,
  GraduationCap,
  Megaphone,
  CheckCheck,
  PlusCircle,
  X,
  Layers,
} from 'lucide-react';

export const Notifications: React.FC = () => {
  const { db, currentAccount, sendNotificationWithPush, canManageAccounts } = useSchool();
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  
  // Modal state for dispatching announcements
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState<'ANNOUNCEMENT' | 'EXAM' | 'ATTENDANCE' | 'HOMEWORK' | 'GRADE' | 'TIMETABLE' | 'SYSTEM'>('ANNOUNCEMENT');
  const [newTargetRole, setNewTargetRole] = useState<'ALL' | AccountType>('PARENT');
  const [sending, setSending] = useState(false);

  if (!db) return null;

  const allNotifications = db.notifications || [];

  // Filter based on user role isolation
  const roleFilteredNotifs = allNotifications.filter((n) => {
    if (currentAccount.role === 'PRINCIPAL') return true;
    if (currentAccount.role === 'PARENT') {
      // Parents only see notifications for their linked students, targetParentId, or targetRole ALL / PARENT
      if (n.targetParentId && n.targetParentId === currentAccount.id) return true;
      if (n.targetStudentId && currentAccount.linkedStudentIds?.includes(n.targetStudentId)) return true;
      if (n.targetRole === 'ALL' || n.targetRole === 'PARENT') return true;
      return false;
    }
    if (currentAccount.role === 'TEACHER') {
      return n.targetRole === 'ALL' || n.targetRole === 'TEACHER';
    }
    return true;
  });

  const filteredNotifs = roleFilteredNotifs.filter(
    (n) => filterCategory === 'ALL' || n.category === filterCategory
  );

  const unreadCount = roleFilteredNotifs.filter((n) => !n.read).length;

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    setSending(true);
    await sendNotificationWithPush({
      title: newTitle,
      body: newBody,
      category: newCategory,
      targetRole: newTargetRole,
    });
    setSending(false);
    setIsSendModalOpen(false);
    setNewTitle('');
    setNewBody('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-700" />
            <h2 className="text-xl font-bold text-slate-900">مركز الإشعارات والتنبيهات المدرسية الفورية</h2>
            {unreadCount > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                {unreadCount} غير مقروء
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            متابعة إشعارات الغياب، تبليغات الامتحانات، نُشر الدرجات، والتعليمات الرسمية لإدارة المدرسة
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManageAccounts && (
            <button
              onClick={() => setIsSendModalOpen(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Megaphone className="w-4 h-4" />
              إرسال إشعار عام للأولياء
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
        <button
          onClick={() => setFilterCategory('ALL')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            filterCategory === 'ALL'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          الكل ({roleFilteredNotifs.length})
        </button>
        <button
          onClick={() => setFilterCategory('ATTENDANCE')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
            filterCategory === 'ATTENDANCE'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
          الغياب والحضور
        </button>
        <button
          onClick={() => setFilterCategory('GRADE')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
            filterCategory === 'GRADE'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
          الدرجات والنتائج
        </button>
        <button
          onClick={() => setFilterCategory('EXAM')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
            filterCategory === 'EXAM'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          الامتحانات
        </button>
        <button
          onClick={() => setFilterCategory('HOMEWORK')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
            filterCategory === 'HOMEWORK'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          الواجبات البيتية
        </button>
        <button
          onClick={() => setFilterCategory('ANNOUNCEMENT')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
            filterCategory === 'ANNOUNCEMENT'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 text-teal-600" />
          التبليغات العامة
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
              n.read
                ? 'bg-white border-slate-200 opacity-90'
                : 'bg-emerald-50/40 border-emerald-200 ring-1 ring-emerald-500/20 shadow-2xs'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  n.category === 'EXAM'
                    ? 'bg-amber-100 text-amber-800'
                    : n.category === 'ATTENDANCE'
                    ? 'bg-blue-100 text-blue-800'
                    : n.category === 'GRADE'
                    ? 'bg-purple-100 text-purple-800'
                    : n.category === 'HOMEWORK'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-teal-100 text-teal-800'
                }`}
              >
                {n.category === 'EXAM' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : n.category === 'ATTENDANCE' ? (
                  <CalendarCheck className="w-5 h-5" />
                ) : n.category === 'GRADE' ? (
                  <GraduationCap className="w-5 h-5" />
                ) : n.category === 'HOMEWORK' ? (
                  <BookOpen className="w-5 h-5" />
                ) : (
                  <Megaphone className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">{n.title}</h3>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-mono rounded-md">
                    {n.targetRole === 'ALL' ? 'للجميع' : n.targetRole === 'PARENT' ? 'لأولياء الأمور' : 'للكادر التدريسي'}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{n.body}</p>
                
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-2">
                  <span>{n.timestamp}</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-emerald-600" />
                    تم الإرسال إشعار فوري للهاتف 📱
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredNotifs.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-700">لا توجد إشعارات في هذا التصنيف</h3>
            <p className="text-xs text-slate-500 mt-1">سيتم تلقي التنبيهات المدرسية فور صدورها.</p>
          </div>
        )}
      </div>

      {/* Send General Announcement Modal */}
      {isSendModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-emerald-700" />
                إصدار وتعميم إشعار فوري للهاتف
              </h3>
              <button
                onClick={() => setIsSendModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  عنوان الإشعار
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تبليغ موعد اجتماع مجلس الآباء والمعلمين"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  نص التبليغ المباشر
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="اكتب نص الرسالة التي ستظهر على شاشة القفل في هواتف الأولياء..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تصنيف التنبيه
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-medium"
                  >
                    <option value="ANNOUNCEMENT">تبليغ عام</option>
                    <option value="EXAM">امتحانات ورسائل عاجلة</option>
                    <option value="HOMEWORK">واجبات وتعليمات</option>
                    <option value="SYSTEM">نظام ومواعيد</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الفئة المستهدفة
                  </label>
                  <select
                    value={newTargetRole}
                    onChange={(e) => setNewTargetRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-medium"
                  >
                    <option value="PARENT">أولياء الأمور فقط</option>
                    <option value="TEACHER">الكادر التدريسي</option>
                    <option value="ALL">الجميع دون استثناء</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSendModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'جاري البث...' : 'إرسال للهواتف الآن 📱'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
