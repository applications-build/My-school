import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { formatDisplayName, formatTeacherName } from '../types';
import { User, ShieldCheck, Mail, Phone, Calendar, Key, CheckCircle2, GraduationCap, Users } from 'lucide-react';

export const Profile: React.FC = () => {
  const { currentAccount, activeAcademicYear, db } = useSchool();
  const [phone, setPhone] = useState(currentAccount.phone);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const displayName = formatDisplayName(currentAccount.fullName, currentAccount.role);

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const getRoleLabel = () => {
    switch (currentAccount.role) {
      case 'PRINCIPAL':
        return 'مدير المدرسة (صلاحية كاملة)';
      case 'TEACHER':
        return 'معلم / معلمة (المرحلة الابتدائية - «أ.»)';
      case 'INSTRUCTOR':
        return 'مدرّس / مدرّسة (المرحلة المتوسطة والإعدادية - «أ.»)';
      case 'PARENT':
        return 'ولي أمر طالب (متابعة البطاقة فورياً)';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">الملف الشخصي وإعدادات الحساب</h2>
        <p className="text-xs text-slate-500 mt-1">
          بيانات الحساب الحالي، الصلاحيات الممنوحة، ووسائل التواصل المعتمدة بالنظام
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-emerald-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {displayName.charAt(0)}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">{displayName}</h3>
            <div className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1 rounded-full inline-block">
              {getRoleLabel()}
            </div>
            <div className="text-[11px] text-slate-500">
              المدرسة: {db?.schoolInfo.name || 'مدرسة الرافدين النموذجية'} · العام الدراسي: {activeAcademicYear}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSavePhone} className="space-y-4 text-xs">
          <h4 className="font-bold text-slate-900 text-sm">تفاصيل الاتصال والحساب:</h4>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>تم تحديث بيانات الاتصال بنجاح.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني المعتمد:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={currentAccount.email}
                  className="w-full pr-9 pl-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">رقم الهاتف للتواصل:</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              حفظ بيانات التواصل
            </button>
          </div>
        </form>

        {/* Permissions Summary Box */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>نطاق الصلاحيات الحالية لمستخدم الحساب:</span>
          </div>
          <ul className="list-disc list-inside text-slate-600 space-y-1 pr-2">
            {currentAccount.role === 'PRINCIPAL' && (
              <>
                <li>إدارة شاملة للكادر التدريسي والشعب والطلاب.</li>
                <li>اعتماد الدرجات النهائية والجداول المدرسية.</li>
                <li>إمكانية الوصول لسجل التدقيق الإداري والنسخ الاحتياطي.</li>
              </>
            )}
            {(currentAccount.role === 'TEACHER' || currentAccount.role === 'INSTRUCTOR') && (
              <>
                <li>تطبيق سابقة «أ.» الإلزامية قبل الاسم في كافة الواجهات.</li>
                <li>رصد الحضور والغياب لصفوف المواد المخصصة.</li>
                <li>تسجيل درجات الامتحانات الشهرية والسعي وإعداد التحضير والواجبات.</li>
              </>
            )}
            {currentAccount.role === 'PARENT' && (
              <>
                <li>قراءة آمنة لبطاقة نتائج الأبناء فور صدورها.</li>
                <li>تلقي إشعارات الغياب والتأخر والواجبات اليومية.</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
