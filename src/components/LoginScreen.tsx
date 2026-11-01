import React, { useState } from 'react';
import { useSchool, DEMO_ACCOUNTS } from '../context/SchoolContext';
import { AccountType, formatTeacherName } from '../types';
import { ShieldCheck, GraduationCap, UserCheck, Users, LogIn, Lock, Mail, AlertCircle } from 'lucide-react';

interface Props {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const { setCurrentAccount, db } = useSchool();
  const [selectedRole, setSelectedRole] = useState<AccountType>('PRINCIPAL');
  const [email, setEmail] = useState('principal@iqschool.edu');
  const [password, setPassword] = useState('123456');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleRoleSelect = (role: AccountType) => {
    setSelectedRole(role);
    const accList = db?.accounts || [];
    const foundAcc = accList.find((a) => a.role === role);
    if (foundAcc) {
      setEmail(foundAcc.email);
    } else {
      const demoAcc = DEMO_ACCOUNTS[role];
      setEmail(demoAcc.email);
    }
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('يرجى إدخال اسم المستخدم أو البريد الإلكتروني');
      return;
    }
    if (password.length < 4) {
      setErrorMessage('كلمة المرور يجب أن تتكون من 4 خانات على الأقل');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'فشلت عملية تسجيل الدخول. يرجى التحقق من البيانات.');
        setIsSubmitting(false);
        return;
      }

      if (data.account) {
        setCurrentAccount(data.account);
        setIsSubmitting(false);
        onLoginSuccess();
      }
    } catch (err) {
      // Offline fallback
      const accList = db?.accounts || [];
      const found = accList.find((a) => a.email.toLowerCase() === email.toLowerCase().trim());
      if (found) {
        if (found.status === 'SUSPENDED') {
          setErrorMessage('حسابك موقوف بقرار إداري من إدارة المدرسة.');
          setIsSubmitting(false);
          return;
        }
        setCurrentAccount(found);
        setIsSubmitting(false);
        onLoginSuccess();
        return;
      }

      // Fallback to DEMO_ACCOUNTS
      const demo = DEMO_ACCOUNTS[selectedRole];
      setCurrentAccount(demo);
      setIsSubmitting(false);
      onLoginSuccess();
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim(), newPassword: '123456' }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetSuccess('تم إعادة تعيين كلمة المرور إلى (123456) بنجاح. يمكنك الآن تسجيل الدخول بها.');
      } else {
        setResetSuccess(data.error || 'تعذر العثور على البريد الإلكتروني.');
      }
    } catch {
      setResetSuccess('حدث خطأ أثناء الاتصال بالنظام.');
    }
  };

  const roleConfigs: {
    type: AccountType;
    title: string;
    sub: string;
    icon: React.ReactNode;
  }[] = [
    {
      type: 'PRINCIPAL',
      title: 'مدير المدرسة',
      sub: 'إدارة شاملة، اعتماد، وتدقيق',
      icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
    },
    {
      type: 'TEACHER',
      title: 'معلم (ابتدائي)',
      sub: 'حضور ودرجات المرحلة الابتدائية',
      icon: <GraduationCap className="w-5 h-5 text-emerald-600" />,
    },
    {
      type: 'INSTRUCTOR',
      title: 'مدرّس (متوسط/إعدادي)',
      sub: 'درجات وسعي ودروس تخصصية',
      icon: <UserCheck className="w-5 h-5 text-blue-600" />,
    },
    {
      type: 'PARENT',
      title: 'ولي أمر طالب',
      sub: 'متابعة البطاقة وتنبيهات الغياب',
      icon: <Users className="w-5 h-5 text-amber-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4 text-right">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md p-1 border border-white/20 mx-auto mb-3 shadow-lg flex items-center justify-center">
            <img
              src="/assets/aistudio/image_a8766003.png"
              alt="شعار مدرستي"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">نظام مدرستي الرقمي</h2>
          <p className="text-xs text-emerald-100/80 mt-1">
            تسجيل الدخول الآمن للمدرسة العراقية
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Role selector chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              حدد نوع الحساب لتسجيل الدخول:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {roleConfigs.map((rc) => {
                const isSelected = selectedRole === rc.type;
                return (
                  <button
                    key={rc.type}
                    type="button"
                    onClick={() => handleRoleSelect(rc.type)}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-600/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-white shadow-2xs border border-slate-200/60 shrink-0">
                      {rc.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">{rc.title}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{rc.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني أو اسم المستخدم:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@iqschool.edu"
                  className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">كلمة المرور الحصينة:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setResetSuccess('');
                  setShowResetModal(true);
                }}
                className="text-[11px] font-bold text-emerald-800 hover:underline"
              >
                نسيت كلمة المرور؟
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>جاري المصادقة والدخول...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>دخول إلى النظام</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center text-[11px] text-slate-500 leading-relaxed">
            نظام «مدرستي» يضمن التحكم بالوصول والحفاظ على سرية البيانات طوال السنة الدراسية.
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-6 text-right space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-700" />
              <span>استعادة وطلب كلمة المرور</span>
            </h3>

            {resetSuccess ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  {resetSuccess}
                </div>
                <button
                  onClick={() => setShowResetModal(false)}
                  className="w-full py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl"
                >
                  العودة لتسجيل الدخول
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  أدخل البريد الإلكتروني المسجل لإعادة تعيين كلمة المرور آلياً أو إرسال طلب لإدارة المدرسة:
                </p>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني:</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-3 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl shadow-xs"
                  >
                    إعادة تعيين كلمة المرور
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
