import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { ShieldCheck, Clock, FileText, CheckCircle2, AlertOctagon, User } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const { db, canViewAuditLog } = useSchool();

  if (!db) return null;

  if (!canViewAuditLog) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <AlertOctagon className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="font-bold text-base text-slate-800">صلاحية وصول مقيدة</h3>
        <p className="text-xs text-slate-500 mt-1">
          سجل التدقيق الإداري للعمليات الحساسة مخصص لمدير المدرسة فقط وفق تعليمات الأمان المعتمدة.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-700" />
            <h2 className="text-xl font-bold text-slate-900">سجل التدقيق الإداري للعمليات الحساسة</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            توثيق رقمي غير قابل للتعديل لجميع العمليات الإدارية: رصد الدرجات، تسجيل ونقل الطلاب، وتعديل الجداول
          </p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
              <tr>
                <th className="py-3 px-4">التوقيت والتاريخ</th>
                <th className="py-3 px-4">نوع العملية</th>
                <th className="py-3 px-4">المنفّذ والصفة</th>
                <th className="py-3 px-4">تفاصيل الإجراء الإداري</th>
                <th className="py-3 px-4 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {db.auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <span className="bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{log.performedBy}</div>
                    <div className="text-[10px] text-slate-400">
                      {log.role === 'PRINCIPAL'
                        ? 'المدير'
                        : log.role === 'TEACHER'
                        ? 'معلم'
                        : log.role === 'INSTRUCTOR'
                        ? 'مدرّس'
                        : 'مستخدم'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 leading-relaxed max-w-md">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      موثق رسمياً
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
