import React from 'react';
import { useSchool, DEMO_ACCOUNTS } from '../context/SchoolContext';
import { AccountType, formatTeacherName } from '../types';
import { ShieldCheck, UserCheck, GraduationCap, Users, X, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentAccount, switchRole } = useSchool();

  if (!isOpen) return null;

  const rolesList: {
    type: AccountType;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    permissions: string[];
  }[] = [
    {
      type: 'PRINCIPAL',
      title: 'المدير',
      description: 'إدارة المدرسة بكامل الصلاحيات، اعتماد الدرجات، إدارة الكادر، وسجلات التدقيق.',
      icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
      color: 'border-indigo-200 bg-indigo-50/50 hover:border-indigo-400',
      permissions: ['إدارة الكادر التدريسي والشعب', 'سجل التدقيق الإداري الحساس', 'أرشفة ونقل السنوات الدراسية', 'اعتماد الجداول والدرجات'],
    },
    {
      type: 'TEACHER',
      title: 'المعلم / المعلمة (المدارس الابتدائية)',
      description: 'مخصص للمرحلة الابتدائية: رصد الحضور، تسجيل درجات التقويم والامتحانات، والتحضير اليومي.',
      icon: <GraduationCap className="w-5 h-5 text-emerald-600" />,
      color: 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400',
      permissions: ['إضافة «أ.» تلقائياً قبل الاسم', 'رصد غياب صفوف وشعب المرحلة الابتدائية', 'تسجيل درجات نصف السنة والنهائي', 'كتابة التحضير والواجبات اليومية'],
    },
    {
      type: 'INSTRUCTOR',
      title: 'المدرّس / المدرسة (المدارس المتوسطة والإعدادية)',
      description: 'مخصص للمرحلتين المتوسطة والإعدادية: إدارة درجات المواد التخصصية، السعي السنوي، والامتحانات الشهرية.',
      icon: <UserCheck className="w-5 h-5 text-blue-600" />,
      color: 'border-blue-200 bg-blue-50/50 hover:border-blue-400',
      permissions: ['إضافة «أ.» تلقائياً قبل الاسم', 'رصد الامتحانات الشهرية والسعي التخصصي', 'إعداد خطط الدروس والواجبات الإعدادية', 'دفتر الدرجات والملاحظات السلوكية'],
    },
    {
      type: 'PARENT',
      title: 'ولي أمر الطالب',
      description: 'متابعة الأبناء الملتحقين بالمدرسة، الاطلاع على الدرجات والغياب اليومي والواجبات.',
      icon: <Users className="w-5 h-5 text-amber-600" />,
      color: 'border-amber-200 bg-amber-50/50 hover:border-amber-400',
      permissions: ['الاطلاع الفوري على بطاقة درجات الأبناء', 'متابعة إشعارات الغياب والتأخر اليومي', 'معرفة جدول الحصص والتحضير والواجبات', 'صلاحيات قراءة آمنة فقط (بدون «أ.»)'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">تبديل نوع الحساب والصلاحيات</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              يتيح النظام اختبار وتطبيق الصلاحيات المستقلة لكل حساب من الحسابات الأربعة المعتمدة
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-5">
          {rolesList.map((r) => {
            const isSelected = currentAccount.role === r.type;
            const demoAcc = DEMO_ACCOUNTS[r.type];
            const displayName =
              r.type === 'TEACHER' || r.type === 'INSTRUCTOR'
                ? formatTeacherName(demoAcc.fullName)
                : demoAcc.fullName;

            return (
              <div
                key={r.type}
                onClick={() => {
                  switchRole(r.type);
                  onClose();
                }}
                className={`cursor-pointer rounded-xl border p-4 transition-all text-right relative flex flex-col justify-between ${
                  isSelected ? 'border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/40' : r.color
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-white shadow-xs border border-slate-200/60">
                        {r.icon}
                      </div>
                      <span className="font-bold text-sm text-slate-900">{r.title}</span>
                    </div>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        <Check className="w-3.5 h-3.5" />
                        الحساب الحالي
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-800 mb-1">
                    المستخدم التجريبي: {displayName}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {r.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/50">
                  <div className="text-[11px] font-medium text-slate-500 mb-1">أبرز الصلاحيات:</div>
                  <ul className="text-[11px] text-slate-700 space-y-0.5">
                    {r.permissions.map((p, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <span className="text-emerald-600 text-xs">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
          <span>نظام مدرستي يلتزم بقاعدة عدم إضافة «أ.» للمدير أو الطلاب أو أولياء الأمور وحصرها بالكادر التدريسي فقط.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
