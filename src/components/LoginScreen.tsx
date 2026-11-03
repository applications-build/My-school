import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { AccountType, formatTeacherName, UserAccount } from '../types';
import { ShieldCheck, GraduationCap, Users, LogIn, Lock, Phone, User, Building, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

interface Props {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const { setCurrentAccount, db } = useSchool();
  const [selectedRole, setSelectedRole] = useState<'PRINCIPAL' | 'TEACHER' | 'PARENT'>('PRINCIPAL');
  
  // Fields
  const [fullName, setFullName] = useState('علي محمد حسن');
  const [phone, setPhone] = useState('07701234567');
  const [password, setPassword] = useState('123456');
  const [schoolName, setSchoolName] = useState(db?.schoolInfo?.name || 'مدرسة النور الابتدائية للبنين');
  const [studentName, setStudentName] = useState('حيدر أحمد عباس');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = (role: 'PRINCIPAL' | 'TEACHER' | 'PARENT') => {
    setSelectedRole(role);
    setErrorMessage('');
    setSuccessMessage('');

    if (role === 'PRINCIPAL') {
      const pAcc = db?.accounts?.find((a) => a.role === 'PRINCIPAL');
      setFullName(pAcc?.fullName || 'علي محمد حسن');
      setPhone(pAcc?.phone || '07701234567');
      setPassword('123456');
      setSchoolName(db?.schoolInfo?.name || 'مدرسة النور الابتدائية للبنين');
    } else if (role === 'TEACHER') {
      const firstTeacher = db?.teachers?.[0];
      setFullName(firstTeacher ? formatTeacherName(firstTeacher.fullName || firstTeacher.name) : 'أحمد جاسم كاظم');
      setPhone(firstTeacher?.phone || '07801234561');
      setPassword('');
    } else if (role === 'PARENT') {
      const firstStudent = db?.students?.[0];
      setFullName(firstStudent?.parentName || 'أحمد عباس جبر');
      setPhone(firstStudent?.parentPhone || '07705551122');
      setStudentName(firstStudent?.fullName || 'حيدر أحمد عباس');
      setPassword('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      setErrorMessage('يرجى إدخال الاسم الثلاثي كاملاً');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('يرجى إدخال رقم هاتف مفعّل به واتساب للتواصل المدرسي');
      return;
    }

    if (selectedRole === 'PRINCIPAL') {
      if (!schoolName.trim()) {
        setErrorMessage('يرجى كتابة اسم المدرسة الابتدائية');
        return;
      }
      if (!password || password.length < 4) {
        setErrorMessage('كلمة المرور يجب ألا تقل عن 4 رموز');
        return;
      }
    }

    if (selectedRole === 'PARENT') {
      if (!studentName.trim()) {
        setErrorMessage('يرجى كتابة اسم التلميذ الثلاثي كما هو مسجل في المدرسة');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        role: selectedRole,
        fullName: fullName.trim(),
        phone: phone.trim(),
      };

      if (selectedRole === 'PRINCIPAL') {
        payload.password = password;
        payload.schoolName = schoolName.trim();
      } else if (selectedRole === 'PARENT') {
        payload.studentName = studentName.trim();
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'تعذر تسجيل الدخول. يرجى التأكد من صحة البيانات.');
        setIsSubmitting(false);
        return;
      }

      if (data.account) {
        if (selectedRole === 'PRINCIPAL' && schoolName.trim() && db) {
          db.schoolInfo.name = schoolName.trim();
        }
        setSuccessMessage('تم التحقق بنجاح! جاري الانتقال...');
        setTimeout(() => {
          setCurrentAccount(data.account);
          setIsSubmitting(false);
          onLoginSuccess();
        }, 300);
      }
    } catch (err) {
      // Offline fallback handling
      console.warn('Offline login verification', err);
      if (selectedRole === 'PRINCIPAL') {
        if (password === '123456' || password.length >= 4) {
          if (schoolName.trim() && db) {
            db.schoolInfo.name = schoolName.trim();
          }
          const acc: UserAccount = db?.accounts?.find((a) => a.role === 'PRINCIPAL') || {
            id: 'acc-principal-1',
            fullName: fullName.trim(),
            email: 'principal@iqschool.edu',
            phone: phone.trim(),
            role: 'PRINCIPAL',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
          };
          setCurrentAccount(acc);
          onLoginSuccess();
          return;
        } else {
          setErrorMessage('كلمة المرور غير صحيحة.');
          setIsSubmitting(false);
          return;
        }
      }

      if (selectedRole === 'TEACHER') {
        const found = db?.teachers?.find(
          (t) =>
            (t.fullName?.trim().toLowerCase() === fullName.trim().toLowerCase() ||
             t.name?.trim().toLowerCase() === fullName.trim().toLowerCase()) &&
            t.phone.trim() === phone.trim()
        );
        if (found) {
          const acc: UserAccount = db?.accounts?.find((a) => a.phone === found.phone || a.fullName === found.fullName) || {
            id: 'acc-teacher-' + found.id,
            fullName: formatTeacherName(found.fullName || found.name),
            email: found.email,
            phone: found.phone,
            role: 'TEACHER',
            assignedSubjects: [found.specialization],
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
          };
          setCurrentAccount(acc);
          onLoginSuccess();
          return;
        } else {
          setErrorMessage('لم يتم العثور على أستاذ مسجل بهذا الاسم ورقم الهاتف في كادر المدرسة.');
          setIsSubmitting(false);
          return;
        }
      }

      if (selectedRole === 'PARENT') {
        const foundStudent = db?.students?.find(
          (s) => s.fullName.trim().toLowerCase() === studentName.trim().toLowerCase()
        );
        if (foundStudent) {
          const acc: UserAccount = {
            id: 'acc-parent-' + foundStudent.id,
            fullName: fullName.trim(),
            email: 'parent.' + foundStudent.id + '@iqschool.edu',
            phone: phone.trim(),
            role: 'PARENT',
            linkedStudentIds: [foundStudent.id],
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
          };
          setCurrentAccount(acc);
          onLoginSuccess();
          return;
        } else {
          setErrorMessage('لم يتم العثور على تلميذ مسجل بهذا الاسم الثلاثي في المدرسة.');
          setIsSubmitting(false);
          return;
        }
      }

      setIsSubmitting(false);
    }
  };

  const roleConfigs = [
    {
      type: 'PRINCIPAL' as const,
      title: 'مدير المدرسة',
      sub: 'إدارة، اعتماد، وضبط المدرسة',
      icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
    },
    {
      type: 'TEACHER' as const,
      title: 'الأستاذ / المعلم',
      sub: 'تحضير الدروس ورصد الدرجات',
      icon: <GraduationCap className="w-5 h-5 text-emerald-600" />,
    },
    {
      type: 'PARENT' as const,
      title: 'ولي أمر التلميذ',
      sub: 'متابعة الدفتر والدرجات والغياب',
      icon: <Users className="w-5 h-5 text-amber-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-3 sm:p-4 text-right">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 sm:p-6 text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md p-1 border border-white/20 mx-auto mb-3 shadow-lg flex items-center justify-center">
            <img
              src="/assets/aistudio/image_a8766003.png"
              alt="شعار مدرستي"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">نظام مدرستي الرقمي</h2>
          <p className="text-xs text-emerald-100/90 mt-1 font-medium">
            بوابة الإدارة الابتدائية الذكية الموحدة
          </p>
          {db?.schoolInfo?.name && (
            <div className="inline-block mt-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[11px] font-bold text-emerald-100 border border-white/20">
              {db.schoolInfo.name}
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Role selector chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              اختر صفة الدخول:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {roleConfigs.map((rc) => {
                const isSelected = selectedRole === rc.type;
                return (
                  <button
                    key={rc.type}
                    type="button"
                    onClick={() => handleRoleSelect(rc.type)}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-600/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="p-1.5 rounded-xl bg-white shadow-2xs border border-slate-200/60 shrink-0">
                      {rc.icon}
                    </div>
                    <div className="text-[11px] font-bold leading-tight">{rc.title}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Notice for Role Requirements */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {selectedRole === 'PRINCIPAL' && 'للمدير: أدخل اسمك ورقم هاتفك وكلمة السر واسم مدرستك لحفظه بالنظام.'}
              {selectedRole === 'TEACHER' && 'للأستاذ: اكتب اسمك الثلاثي ورقم هاتفك المسجلين لدى الإدارة لتسجيل الدخول الفوري.'}
              {selectedRole === 'PARENT' && 'لولي الأمر: اكتب اسمك ورقمك واسم ابنك التلميذ الثلاثي للربط بسجل درجاته وحضوره.'}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* School Name (for Principal only) */}
            {selectedRole === 'PRINCIPAL' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المدرسة الابتدائية:</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="مثال: مدرسة النور الابتدائية للبنين"
                    className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {selectedRole === 'PRINCIPAL' && 'الاسم الثلاثي لمدير المدرسة:'}
                {selectedRole === 'TEACHER' && 'الاسم الثلاثي للأستاذ / المعلم:'}
                {selectedRole === 'PARENT' && 'الاسم الثلاثي لولي الأمر:'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="الاسم الثلاثي واللقب"
                  className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-xs"
                />
              </div>
            </div>

            {/* Student Name (for Parent only) */}
            {selectedRole === 'PARENT' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الابن / التلميذ الثلاثي المسجل بالمدرسة:</label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="مثال: حيدر أحمد عباس"
                    className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Phone Number (WhatsApp enabled) */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                رقم الهاتف (مفعّل به واتساب):
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XXXXXXXXX"
                  dir="ltr"
                  className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-xs font-mono text-right"
                />
              </div>
            </div>

            {/* Password (for Principal only) */}
            {selectedRole === 'PRINCIPAL' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">كلمة المرور الإدارية:</label>
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
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <span>جاري التحقق والدخول...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>دخول إلى النظام</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center text-[10px] text-slate-500 leading-relaxed">
            تسجيل آمن وسريع عبر الهواتف الذكية مع الربط التلقائي بسجلات المدرسة الابتدائية.
          </div>
        </div>
      </div>
    </div>
  );
};
