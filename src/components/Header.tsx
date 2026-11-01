import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { formatDisplayName } from '../types';
import { Database, UserCheck, Calendar, ShieldCheck, GraduationCap, Users } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenRoleModal: () => void;
  onOpenSyncModal: () => void;
}

export const Header: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenRoleModal,
  onOpenSyncModal,
}) => {
  const { db, currentAccount, activeAcademicYear, setActiveAcademicYear } = useSchool();

  const getRoleBadge = () => {
    switch (currentAccount.role) {
      case 'PRINCIPAL':
        return { label: 'المدير العام', icon: <ShieldCheck className="w-3.5 h-3.5" />, color: 'bg-indigo-100 text-indigo-800' };
      case 'TEACHER':
        return { label: 'معلم ابتدائي', icon: <GraduationCap className="w-3.5 h-3.5" />, color: 'bg-emerald-100 text-emerald-800' };
      case 'INSTRUCTOR':
        return { label: 'مدرّس ثانوي/إعدادي', icon: <UserCheck className="w-3.5 h-3.5" />, color: 'bg-blue-100 text-blue-800' };
      case 'PARENT':
        return { label: 'ولي أمر طالب', icon: <Users className="w-3.5 h-3.5" />, color: 'bg-amber-100 text-amber-800' };
    }
  };

  const badge = getRoleBadge();
  const formattedName = formatDisplayName(currentAccount.fullName, currentAccount.role);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-200 overflow-hidden shadow-xs shrink-0 flex items-center justify-center">
              <img
                src="/assets/aistudio/image_a8766003.png"
                alt="شعار مدرستي"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 whitespace-nowrap">مدرستي</span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs font-semibold text-emerald-800 hidden sm:inline whitespace-nowrap">
                  {db?.schoolInfo?.name || 'مدرسة الرافدين النموذجية'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 hidden md:block">
                جمهورية العراق · وزارة التربية
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Clean single line typography) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {[
              { id: 'dashboard', label: 'لوحة التحكم' },
              { id: 'classes', label: 'الشعب والمراحل' },
              { id: 'staff', label: 'الكادر التدريسي' },
              { id: 'students', label: 'الطلاب وأولياء الأمور' },
              { id: 'attendance', label: 'الغياب والحضور' },
              { id: 'grades', label: 'الدرجات والامتحانات' },
              { id: 'lesson-plans', label: 'التحضير والواجبات' },
              { id: 'timetable', label: 'الجدول الأسبوعي' },
              { id: 'chatbot', label: 'المساعد الذكي' },
              { id: 'studio', label: 'استوديو الوسائل' },
              ...(currentAccount.role === 'PRINCIPAL' ? [{ id: 'audit', label: 'سجل التدقيق' }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Actions & Current Account */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Academic Year Selector */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={activeAcademicYear}
                onChange={(e) => setActiveAcademicYear(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                aria-label="السنة الدراسية"
              >
                {(db?.availableYears || [
                  { id: 'ay-2023', yearName: '2023 - 2024', status: 'ARCHIVED' },
                  { id: 'ay-2024', yearName: '2024 - 2025', status: 'ACTIVE' },
                  { id: 'ay-2025', yearName: '2025 - 2026', status: 'PLANNED' },
                ]).map((ay: any) => (
                  <option key={ay.id || ay.yearName} value={ay.yearName}>
                    {ay.yearName} {ay.status === 'ACTIVE' || ay.yearName === activeAcademicYear ? '(الحالي)' : ay.status === 'ARCHIVED' ? '(أرشيف)' : '(مستقبلي)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Cloud Sync Status Button */}
            <button
              onClick={onOpenSyncModal}
              title="حالة المزامنة السحابية و Firebase"
              className="p-2 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* Role Switcher Pill */}
            <button
              onClick={onOpenRoleModal}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-right shadow-xs"
            >
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                  {formattedName}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <span>{badge.label}</span>
                  <span className="text-emerald-600 font-bold">· تبديل</span>
                </div>
              </div>
            </button>
          </div>

        </div>

        {/* Mobile Subnav Tab bar */}
        <div className="lg:hidden flex items-center overflow-x-auto py-2 gap-1 border-t border-slate-100 scrollbar-none">
          {[
            { id: 'dashboard', label: 'لوحة التحكم' },
            { id: 'classes', label: 'الشعب' },
            { id: 'staff', label: 'الكادر التدريسي' },
            { id: 'students', label: 'الطلاب' },
            { id: 'attendance', label: 'الغياب' },
            { id: 'grades', label: 'الدرجات' },
            { id: 'lesson-plans', label: 'التحضير' },
            { id: 'timetable', label: 'الجدول' },
            { id: 'chatbot', label: 'المساعد الذكي' },
            { id: 'studio', label: 'الاستوديو' },
            ...(currentAccount.role === 'PRINCIPAL' ? [{ id: 'audit', label: 'التدقيق' }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-700 text-white font-bold'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
