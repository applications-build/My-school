import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck, GraduationCap, ArrowLeft } from 'lucide-react';

interface Props {
  onFinish: () => void;
  appName?: string;
  schoolName?: string;
}

export const SplashScreen: React.FC<Props> = ({ onFinish, appName = 'مدرستي', schoolName = 'مدرسة الرافدين النموذجية' }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(onFinish, 600);
    }, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white p-6 transition-opacity duration-500 ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center text-center max-w-sm animate-in zoom-in-95 duration-500">
        {/* App Logo Emblem */}
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-3xl bg-emerald-800/80 p-1 border-2 border-emerald-400/40 shadow-2xl overflow-hidden flex items-center justify-center backdrop-blur-md">
            <img
              src="/assets/aistudio/image_a8766003.png"
              alt="شعار مدرستي"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 bg-amber-500 rounded-xl shadow-lg border border-amber-300/40 text-slate-950">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-emerald-100 font-sans">
          {appName}
        </h1>
        <p className="text-xs text-emerald-300/90 font-medium mb-4">
          النظام الرقمي المتكامل لإدارة المدارس العراقية
        </p>
        <div className="text-[11px] text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full mb-8">
          {schoolName} · جمهورية العراق
        </div>

        {/* Loading Spinner / Progress */}
        <div className="flex items-center gap-2 text-xs text-emerald-200">
          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span>جاري تهيئة النظام وقواعد البيانات...</span>
        </div>

        <button
          onClick={() => {
            setFade(true);
            setTimeout(onFinish, 300);
          }}
          className="mt-8 text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>تخطي الانتظار</span>
          <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
        </button>
      </div>
    </div>
  );
};
