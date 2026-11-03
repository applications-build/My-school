import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { formatDisplayName } from '../types';
import {
  Menu,
  X,
  ChevronRight,
  LogOut,
  Calendar,
  ShieldCheck,
  GraduationCap,
  Users,
  LayoutDashboard,
  School,
  UserCheck,
  CalendarCheck,
  Award,
  BookOpen,
  Clock,
  Sparkles,
  Bell,
  Settings as SettingsIcon,
  User,
  KeyRound,
  FileSpreadsheet,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  canGoBack: boolean;
  onBack: () => void;
  onLogout: () => void;
  onOpenRoleModal: () => void;
}

export const Header: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  canGoBack,
  onBack,
  onLogout,
  onOpenRoleModal,
}) => {
  const { db, currentAccount, activeAcademicYear, setActiveAcademicYear } = useSchool();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getRoleBadge = () => {
    switch (currentAccount.role) {
      case 'PRINCIPAL':
        return { label: 'مدير المدرسة', icon: <ShieldCheck className="w-3.5 h-3.5" />, color: 'bg-indigo-100 text-indigo-800' };
      case 'TEACHER':
        return { label: 'الأستاذ / المعلم', icon: <GraduationCap className="w-3.5 h-3.5" />, color: 'bg-emerald-100 text-emerald-800' };
      case 'PARENT':
        return { label: 'ولي أمر التلميذ', icon: <Users className="w-3.5 h-3.5" />, color: 'bg-amber-100 text-amber-800' };
      default:
        return { label: 'مستخدم', icon: <User className="w-3.5 h-3.5" />, color: 'bg-slate-100 text-slate-800' };
    }
  };

  const badge = getRoleBadge();
  const formattedName = formatDisplayName(currentAccount.fullName, currentAccount.role);

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard className="w-4 h-4 text-emerald-600" /> },
    { id: 'classes', label: 'الصفوف والشعب', icon: <School className="w-4 h-4 text-blue-600" /> },
    { id: 'staff', label: 'الكادر التدريسي', icon: <UserCheck className="w-4 h-4 text-indigo-600" /> },
    { id: 'students', label: 'التلاميذ وأولياء الأمور', icon: <Users className="w-4 h-4 text-amber-600" /> },
    { id: 'attendance', label: 'الغياب والحضور', icon: <CalendarCheck className="w-4 h-4 text-emerald-600" /> },
    { id: 'grades', label: 'الدرجات والامتحانات', icon: <Award className="w-4 h-4 text-rose-600" /> },
    { id: 'lesson-plans', label: 'دفتر التحضير والواجبات', icon: <BookOpen className="w-4 h-4 text-teal-600" /> },
    { id: 'timetable', label: 'الجدول الأسبوعي', icon: <Clock className="w-4 h-4 text-sky-600" /> },
    { id: 'studio', label: 'الشهادات والوسائل التعليمية', icon: <Sparkles className="w-4 h-4 text-purple-600" /> },
    { id: 'notifications', label: 'الإشعارات الفورية (WhatsApp & Push)', icon: <Bell className="w-4 h-4 text-amber-500" /> },
    { id: 'profile', label: 'الملف الشخصي', icon: <User className="w-4 h-4 text-slate-600" /> },
    ...(currentAccount.role === 'PRINCIPAL'
      ? [
          { id: 'accounts', label: 'إدارة الحسابات والصلاحيات', icon: <KeyRound className="w-4 h-4 text-indigo-700" /> },
          { id: 'settings', label: 'إعدادات المدرسة', icon: <SettingsIcon className="w-4 h-4 text-slate-600" /> },
          { id: 'audit', label: 'سجل التدقيق الإداري', icon: <FileSpreadsheet className="w-4 h-4 text-slate-500" /> },
        ]
      : []),
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            
            {/* Right: Back Button & School Brand */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Functional Step Back Button */}
              <button
                type="button"
                onClick={onBack}
                disabled={!canGoBack}
                title={canGoBack ? 'الرجوع خطوة للوراء' : 'لا توجد صفحة سابقة'}
                className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
                  canGoBack
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 cursor-pointer shadow-2xs'
                    : 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed opacity-50'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* School Logo & Title */}
              <div
                onClick={() => handleSelectTab('dashboard')}
                className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 border border-slate-200 overflow-hidden shadow-xs shrink-0 flex items-center justify-center">
                  <img
                    src="/assets/aistudio/image_a8766003.png"
                    alt="شعار مدرستي"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">مدرستي</span>
                    <span className="text-xs text-slate-300 hidden sm:inline">|</span>
                    <span className="text-xs font-bold text-emerald-800 hidden sm:inline truncate max-w-[180px] md:max-w-xs">
                      {db?.schoolInfo?.name || 'مدرسة النور الابتدائية'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 hidden md:block">
                    جمهورية العراق · وزارة التربية
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Current active page indicator for mobile */}
            <div className="text-xs font-bold text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-lg truncate max-w-[120px] sm:max-w-none">
              {menuItems.find((m) => m.id === activeTab)?.label || 'الصفحة'}
            </div>

            {/* Left: Single Menu Icon Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl shadow-xs transition-all font-bold text-xs"
                title="فتح القائمة الرئيسية"
              >
                <Menu className="w-5 h-5" />
                <span className="hidden sm:inline">القائمة الرئيسية</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Unified Sliding Menu Drawer (containing all links + logout) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col text-right z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-gradient-to-l from-emerald-800 to-teal-900 text-white flex items-center justify-between border-b border-emerald-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 p-1 border border-white/20 flex items-center justify-center shrink-0">
                  <img
                    src="/assets/aistudio/image_a8766003.png"
                    alt="مدرستي"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">نظام مدرستي</h3>
                  <p className="text-[11px] text-emerald-100 truncate max-w-[200px]">
                    {db?.schoolInfo?.name || 'مدرسة النور الابتدائية'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Account Card inside Menu */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200">
                  {badge.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-slate-900 truncate">
                    {formattedName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {badge.label}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenRoleModal();
                }}
                className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50 rounded-lg shrink-0 transition-colors shadow-2xs"
              >
                تبديل الدور
              </button>
            </div>

            {/* Academic Year Selection */}
            <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>العام الدراسي:</span>
              </div>
              <select
                value={activeAcademicYear}
                onChange={(e) => setActiveAcademicYear(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none"
              >
                {(db?.availableYears || [
                  { id: 'ay-2024', yearName: '2024 - 2025', status: 'ACTIVE' },
                ]).map((ay: any) => (
                  <option key={ay.id || ay.yearName} value={ay.yearName}>
                    {ay.yearName}
                  </option>
                ))}
              </select>
            </div>

            {/* Menu Links Navigation List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                صفحات وأقسام النظام
              </div>
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition-all font-semibold text-xs ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200 shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs shrink-0">
                      {item.icon}
                    </div>
                    <span className="flex-1">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer: Integrated Logout Button */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
                className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-2xs"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span>تسجيل الخروج من النظام</span>
              </button>
              <div className="text-center text-[10px] text-slate-400">
                مدرستي · الإصدار 2.5 للمدارس الابتدائية
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
