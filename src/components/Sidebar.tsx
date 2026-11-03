import React from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  LayoutDashboard,
  Layers,
  GraduationCap,
  Users,
  CalendarCheck,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  ShieldCheck,
  Bell,
  User,
  Settings,
  LogOut,
  KeyRound,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab, onLogout }) => {
  const { currentAccount } = useSchool();

  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'classes', label: 'الصفوف والشعب', icon: <Layers className="w-4 h-4" /> },
    { id: 'staff', label: 'الكادر التدريسي', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'students', label: 'التلاميذ وأولياء الأمور', icon: <Users className="w-4 h-4" /> },
    { id: 'attendance', label: 'الغياب والحضور', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'grades', label: 'الدرجات والامتحانات', icon: <Award className="w-4 h-4" /> },
    { id: 'lesson-plans', label: 'دفتر التحضير والواجبات', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'curriculum', label: 'إدارة المناهج والخطط', icon: <BookOpen className="w-4 h-4 text-emerald-400" /> },
    { id: 'timetable', label: 'الجدول الأسبوعي', icon: <Calendar className="w-4 h-4" /> },
    { id: 'studio', label: 'الشهادات والوسائل التعليمية', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
    { id: 'notifications', label: 'الإشعارات والتنبيهات', icon: <Bell className="w-4 h-4" /> },
    { id: 'profile', label: 'الملف الشخصي', icon: <User className="w-4 h-4" /> },
    { id: 'settings', label: 'إعدادات النظام والسنوات', icon: <Settings className="w-4 h-4" /> },
    ...(currentAccount.role === 'PRINCIPAL'
      ? [
          { id: 'accounts', label: 'إدارة الحسابات والصلاحيات', icon: <KeyRound className="w-4 h-4 text-emerald-400" /> },
          { id: 'audit', label: 'سجل التدقيق الإداري', icon: <ShieldCheck className="w-4 h-4" /> },
        ]
      : []),
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 border-l border-slate-800 flex flex-col justify-between shrink-0 hidden lg:flex min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
          قائمة النظام المدرسية
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-right ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</div>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {onLogout && (
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 rounded-xl text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      )}
    </aside>
  );
};
