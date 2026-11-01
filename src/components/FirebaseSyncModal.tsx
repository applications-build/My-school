import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { Database, Cloud, RefreshCw, CheckCircle2, ShieldCheck, FileCode, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseSyncModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { syncStatus, lastSynced, triggerManualSync } = useSchool();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in zoom-in duration-150 text-right">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">حالة قاعدة البيانات والمزامنة السحابية</h3>
              <p className="text-xs text-slate-500">متابعة اتصال البيانات ومخطط Firebase Firestore</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 my-5 text-sm">
          {/* Active Status */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
              <div>
                <div className="font-bold text-slate-800">
                  قاعدة بيانات المدرسة السحابية (School Cloud DB)
                </div>
                <div className="text-xs text-slate-500">
                  الحالة: متصلة ونشطة · آخر مزامنة: {lastSynced} ({syncStatus === 'synced' ? 'متزامنة' : syncStatus})
                </div>
              </div>
            </div>
            <button
              onClick={triggerManualSync}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-700 shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              مزامنة فورية
            </button>
          </div>

          {/* Firebase Schema & Rules Readiness */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              تكامل Firebase Firestore البرمجي:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-emerald-900">مخطط الكيانات الجاهز</div>
                  <div className="text-emerald-700 text-[11px]">تم بناء ملف firebase-blueprint.json لكافة الجداول والكيانات المدرسية.</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-emerald-900">قواعد الأمان المحصنة</div>
                  <div className="text-emerald-700 text-[11px]">تمت كتابة firestore.rules وفق نظام الصلاحيات ومبدأ Zero-Trust.</div>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-amber-50/80 border border-amber-200/70 rounded-lg p-3 leading-relaxed">
              <div className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-amber-700" />
                خطوات ربط مشروع Firebase الخارجي عند الرغبة:
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-800">
                <li>إنشاء مشروع في منصة Google Firebase وإضافة تطبيق Web.</li>
                <li>تفعيل Cloud Firestore وتفعيل Authentication (حسابات Google).</li>
                <li>إضافة ملف الإعداد <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">firebase-applet-config.json</code> بمجلد المشروع.</li>
                <li>تطبيق القواعد الجاهزة من ملف <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">firestore.rules</code>.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            حسناً، فهمت
          </button>
        </div>
      </div>
    </div>
  );
};
