import React, { useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SplashScreen } from './components/SplashScreen';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { ClassManagement } from './components/ClassManagement';
import { StaffManagement } from './components/StaffManagement';
import { StudentDirectory } from './components/StudentDirectory';
import { AttendanceTracker } from './components/AttendanceTracker';
import { GradesManager } from './components/GradesManager';
import { LessonPlans } from './components/LessonPlans';
import { CurriculumManager } from './components/CurriculumManager';
import { Timetable } from './components/Timetable';
import { Notifications } from './components/Notifications';
import { Profile } from './components/Profile';
import { Settings } from './components/Settings';
import { DatabaseTester } from './components/DatabaseTester';
import { AuditLogViewer } from './components/AuditLogViewer';
import { ImageGenStudio } from './components/ImageGenStudio';
import { AccountManagement } from './components/AccountManagement';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { FirebaseSyncModal } from './components/FirebaseSyncModal';
import {
  LayoutDashboard,
  CalendarCheck,
  Award,
  BookOpen,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

function AppContent() {
  const { loading, error, db, logout } = useSchool();

  // Persist session so page refresh doesn't log the user out
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const session = localStorage.getItem('madrasati_auth_session');
      return !!session;
    } catch {
      return false;
    }
  });

  // Only show splash on fresh first load if user is not authenticated
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      const session = localStorage.getItem('madrasati_auth_session');
      const seen = sessionStorage.getItem('madrasati_splash_seen');
      if (session || seen) return false;
    } catch {}
    return true;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [tabHistory, setTabHistory] = useState<string[]>(['dashboard']);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  const navigateTo = (tab: string) => {
    if (tab === activeTab) return;
    setTabHistory((prev) => [...prev, tab]);
    setActiveTab(tab);
  };

  const handleBack = () => {
    if (tabHistory.length > 1) {
      const nextHistory = [...tabHistory];
      nextHistory.pop();
      const previousTab = nextHistory[nextHistory.length - 1];
      setTabHistory(nextHistory);
      setActiveTab(previousTab);
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
  };

  if (showSplash) {
    return (
      <SplashScreen
        appName="مدرستي"
        schoolName={db?.schoolInfo?.name || 'مدرسة الرافدين النموذجية الابتدائية'}
        onFinish={() => {
          sessionStorage.setItem('madrasati_splash_seen', 'true');
          setShowSplash(false);
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg mb-4 border border-slate-200 animate-pulse">
          <img
            src="/assets/aistudio/image_a8766003.png"
            alt="أيقونة مدرستي"
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-lg font-bold text-slate-800">جاري الاتصال بنظام «مدرستي»...</h2>
        <p className="text-xs text-slate-500 mt-1">تحميل السجلات وقواعد البيانات المدرسية السحابية</p>
        <div className="w-32 h-1 bg-slate-200 rounded-full mt-4 overflow-hidden">
          <div className="w-1/2 h-full bg-emerald-600 rounded-full animate-indeterminate" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 max-w-md w-full">
          <AlertCircle className="w-10 h-10 mx-auto mb-2 text-red-600" />
          <h2 className="text-base font-bold text-slate-900 mb-1">تعذر تحميل بيانات المدرسة</h2>
          <p className="text-xs text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs hover:bg-emerald-800"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col text-slate-900 overflow-x-hidden">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={navigateTo}
        canGoBack={tabHistory.length > 1}
        onBack={handleBack}
        onLogout={handleLogout}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto flex items-start">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={navigateTo}
          onLogout={handleLogout}
        />

        {/* Main Viewport Container */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-20 lg:pb-8 min-w-0">
          {activeTab === 'dashboard' && <Dashboard onNavigate={(t) => navigateTo(t)} />}
          {activeTab === 'classes' && <ClassManagement />}
          {activeTab === 'staff' && <StaffManagement />}
          {activeTab === 'students' && <StudentDirectory />}
          {activeTab === 'attendance' && <AttendanceTracker />}
          {activeTab === 'grades' && <GradesManager />}
          {activeTab === 'lesson-plans' && <LessonPlans />}
          {activeTab === 'curriculum' && <CurriculumManager />}
          {activeTab === 'timetable' && <Timetable />}
          {activeTab === 'notifications' && <Notifications />}
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'settings' && <Settings />}
          {activeTab === 'tester' && <DatabaseTester />}
          {activeTab === 'studio' && <ImageGenStudio />}
          {activeTab === 'accounts' && <AccountManagement />}
          {activeTab === 'audit' && <AuditLogViewer />}
        </main>
      </div>

      {/* Floating Mobile Bottom Action Strip */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => navigateTo('dashboard')}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] ${
            activeTab === 'dashboard' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>الرئيسية</span>
        </button>

        <button
          onClick={() => navigateTo('attendance')}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] ${
            activeTab === 'attendance' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <CalendarCheck className="w-5 h-5" />
          <span>الغياب</span>
        </button>

        <button
          onClick={() => navigateTo('grades')}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] ${
            activeTab === 'grades' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Award className="w-5 h-5" />
          <span>الدرجات</span>
        </button>

        <button
          onClick={() => navigateTo('lesson-plans')}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] ${
            activeTab === 'lesson-plans' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>التحضير</span>
        </button>

        <button
          onClick={() => setIsRoleModalOpen(true)}
          className="flex flex-col items-center gap-1 p-1 text-[11px] text-emerald-800 font-bold"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>الحساب</span>
        </button>
      </div>

      {/* Modals */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />
      <FirebaseSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <SchoolProvider>
      <AppContent />
    </SchoolProvider>
  );
}
