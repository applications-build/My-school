import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { UserAccount, AccountType, AccountStatus, formatTeacherName } from '../types';
import {
  ShieldCheck,
  UserPlus,
  Search,
  Lock,
  UserX,
  UserCheck,
  Key,
  Trash2,
  Edit,
  Link,
  Users,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  X,
} from 'lucide-react';

export const AccountManagement: React.FC = () => {
  const { db, currentAccount, addAccount, updateAccount, suspendAccount, deleteAccount, resetPassword, linkParentStudent } = useSchool();
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  const [selectedAcc, setSelectedAcc] = useState<UserAccount | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Form State for New Account
  const [formState, setFormState] = useState<{
    fullName: string;
    email: string;
    phone: string;
    role: AccountType;
    password: string;
    assignedClassIds: string[];
    assignedSubjects: string[];
    linkedStudentIds: string[];
  }>({
    fullName: '',
    email: '',
    phone: '07700000000',
    role: 'TEACHER',
    password: '123456',
    assignedClassIds: [],
    assignedSubjects: [],
    linkedStudentIds: [],
  });

  // Password reset state
  const [newPasswordInput, setNewPasswordInput] = useState('123456');

  if (!db) return null;

  const accounts = db.accounts || [];

  // Filtered accounts
  const filteredAccounts = accounts.filter((acc) => {
    const matchesRole = roleFilter === 'ALL' || acc.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || acc.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      acc.fullName.toLowerCase().includes(q) ||
      acc.email.toLowerCase().includes(q) ||
      acc.phone.includes(q);
    return matchesRole && matchesStatus && matchesQuery;
  });

  const handleOpenAddModal = () => {
    setFormState({
      fullName: '',
      email: '',
      phone: '07700000000',
      role: 'TEACHER',
      password: '123456',
      assignedClassIds: [],
      assignedSubjects: [],
      linkedStudentIds: [],
    });
    setIsAddModalOpen(true);
  };

  const handleAddAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.fullName.trim() || !formState.email.trim()) return;

    await addAccount({
      fullName: formState.fullName,
      email: formState.email,
      phone: formState.phone,
      role: formState.role,
      passwordHash: formState.password,
      status: 'ACTIVE',
      assignedClassIds: formState.assignedClassIds,
      assignedSubjects: formState.assignedSubjects,
      linkedStudentIds: formState.linkedStudentIds,
    });

    setIsAddModalOpen(false);
    setStatusMessage('تم إنشاء الحساب وتجهيز الصلاحيات بنجاح.');
    setTimeout(() => setStatusMessage(''), 3500);
  };

  const handleToggleStatus = async (acc: UserAccount) => {
    const newStatus: AccountStatus = acc.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await suspendAccount(acc.id, newStatus);
    setStatusMessage(`تم ${newStatus === 'SUSPENDED' ? 'إيقاف' : 'تفعيل'} حساب ${acc.fullName} بنجاح.`);
    setTimeout(() => setStatusMessage(''), 3500);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAcc || !newPasswordInput) return;

    await resetPassword(selectedAcc.id, newPasswordInput);
    setIsResetModalOpen(false);
    setSelectedAcc(null);
    setStatusMessage('تم إعادة تعيين كلمة المرور بنجاح.');
    setTimeout(() => setStatusMessage(''), 3500);
  };

  const handleDeleteAccountConfirm = async (acc: UserAccount) => {
    if (confirm(`هل أنت تأكد من حذف حساب (${acc.fullName}) نهائياً من النظام؟`)) {
      await deleteAccount(acc.id);
      setStatusMessage('تم حذف الحساب من النظام.');
      setTimeout(() => setStatusMessage(''), 3500);
    }
  };

  const handleSaveParentLinks = async (parentId: string, studentIds: string[]) => {
    await linkParentStudent(parentId, studentIds);
    setIsLinkModalOpen(false);
    setSelectedAcc(null);
    setStatusMessage('تم تحديث ربط الأبناء بحساب ولي الأمر بنجاح.');
    setTimeout(() => setStatusMessage(''), 3500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-right">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-700" />
            <h2 className="text-xl font-bold text-slate-900">إدارة الحسابات والمصادقة والتحكم بالوصول</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إنشاء، تعديل، إيقاف، وحذف الحسابات المدرسية مع ربط أولياء الأمور بالأبناء وتخصيص الصلاحيات.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة حساب مستخدم جديد</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، البريد أو الهاتف..."
              className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            >
              <option value="ALL">جميع أنواع الحسابات</option>
              <option value="PRINCIPAL">مدير المدرسة</option>
              <option value="TEACHER">الأستاذ / المعلم (ابتدائي)</option>
              <option value="PARENT">ولي أمر تلميذ</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            >
              <option value="ALL">جميع الحالات (نشط وموقوف)</option>
              <option value="ACTIVE">الحسابات النشطة فقط</option>
              <option value="SUSPENDED">الحسابات الموقوفة إدارياً</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accounts List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((acc) => {
          const isStaff = acc.role === 'TEACHER' || acc.role === 'INSTRUCTOR';
          const displayName = isStaff ? formatTeacherName(acc.fullName) : acc.fullName;
          const isSuspended = acc.status === 'SUSPENDED';

          return (
            <div
              key={acc.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                isSuspended ? 'border-rose-300 bg-rose-50/20 opacity-80' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Status Badges Header */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      acc.role === 'PRINCIPAL'
                        ? 'bg-indigo-100 text-indigo-800'
                        : acc.role === 'TEACHER'
                        ? 'bg-emerald-100 text-emerald-800'
                        : acc.role === 'INSTRUCTOR'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {acc.role === 'PRINCIPAL'
                      ? 'مدير المدرسة'
                      : acc.role === 'TEACHER'
                      ? 'معلم (ابتدائي)'
                      : acc.role === 'INSTRUCTOR'
                      ? 'مدرّس (ثانوي)'
                      : 'ولي أمر طالب'}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isSuspended ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isSuspended ? (
                      <>
                        <UserX className="w-3 h-3 text-rose-600" />
                        <span>موقوف إدارياً</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        <span>نشط</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Name & Account Details */}
                <h3 className="font-bold text-sm text-slate-900 leading-snug">{displayName}</h3>
                <p className="text-xs font-mono text-slate-500 mt-1">{acc.email}</p>
                <p className="text-xs text-slate-500 mt-0.5">الهاتف: {acc.phone}</p>

                {/* Role Specific Tags */}
                {isStaff && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-[11px]">
                    {acc.assignedClassIds && acc.assignedClassIds.length > 0 && (
                      <div className="text-slate-600 truncate">
                        الصفوف المسندة: {acc.assignedClassIds.join(', ')}
                      </div>
                    )}
                    {acc.assignedSubjects && acc.assignedSubjects.length > 0 && (
                      <div className="text-slate-600 truncate">
                        المواد المكلف بها: {acc.assignedSubjects.join('، ')}
                      </div>
                    )}
                  </div>
                )}

                {acc.role === 'PARENT' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                    <span>الأبناء المرتبطون:</span>
                    <span className="font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {(acc.linkedStudentIds || []).length} طالب
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                <button
                  onClick={() => handleToggleStatus(acc)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 ${
                    isSuspended
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                  }`}
                >
                  {isSuspended ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>تفعيل</span>
                    </>
                  ) : (
                    <>
                      <UserX className="w-3.5 h-3.5" />
                      <span>إيقاف</span>
                    </>
                  )}
                </button>

                {acc.role === 'PARENT' && (
                  <button
                    onClick={() => {
                      setSelectedAcc(acc);
                      setIsLinkModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold border border-amber-200 flex items-center gap-1"
                  >
                    <Link className="w-3.5 h-3.5" />
                    <span>ربط الأبناء</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedAcc(acc);
                    setNewPasswordInput('123456');
                    setIsResetModalOpen(true);
                  }}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-1"
                  title="إعادة تعيين كلمة المرور"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>كلمة المرور</span>
                </button>

                {acc.id !== currentAccount.id && (
                  <button
                    onClick={() => handleDeleteAccountConfirm(acc)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    title="حذف الحساب"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredAccounts.length === 0 && (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
          <Users className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-700">لا توجد حسابات تطابق معايير البحث والفلترة الحالية</p>
          <p className="text-xs">جرّب تغيير نوع الحساب أو إلغاء تصفية البحث.</p>
        </div>
      )}

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-700" />
                <span>إصدار حساب مستخدم جديد وتحديد الصلاحية</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAccountSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المستخدم الثلاثي:</label>
                <input
                  type="text"
                  required
                  value={formState.fullName}
                  onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                  placeholder="الاسم الكامل"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع الحساب والصلاحية المتاحة:</label>
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl font-bold text-emerald-900 text-xs">
                    الأستاذ / المعلم (ابتدائي)
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    * صلاحية المدير تقتصر على إضافة حسابات الكادر التدريسي فقط، ويتم دخول أولياء الأمور تلقائياً عبر مطابقة اسم التلميذ.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف الرسمي:</label>
                  <input
                    type="text"
                    required
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني للوجين:</label>
                  <input
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    placeholder="user@iqschool.edu"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">كلمة المرور الأولية:</label>
                  <input
                    type="text"
                    required
                    value={formState.password}
                    onChange={(e) => setFormState({ ...formState, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs"
                >
                  إنشاء وتفعيل الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && selectedAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-right">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-3 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-700" />
              <span>إعادة تعيين كلمة المرور لحساب {selectedAcc.fullName}</span>
            </h3>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">كلمة المرور الجديدة:</label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setSelectedAcc(null);
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold shadow-xs"
                >
                  تأكيد الحفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Children Modal for Parent */}
      {isLinkModalOpen && selectedAcc && (
        <ParentStudentLinkModal
          parentAccount={selectedAcc}
          students={db.students || []}
          onClose={() => {
            setIsLinkModalOpen(false);
            setSelectedAcc(null);
          }}
          onSave={(studentIds) => handleSaveParentLinks(selectedAcc.id, studentIds)}
        />
      )}
    </div>
  );
};

// Sub-component for linking students to parent account
const ParentStudentLinkModal: React.FC<{
  parentAccount: UserAccount;
  students: any[];
  onClose: () => void;
  onSave: (linkedStudentIds: string[]) => void;
}> = ({ parentAccount, students, onClose, onSave }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(parentAccount.linkedStudentIds || []);
  const [filterQuery, setFilterQuery] = useState('');

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.gradeLevel.includes(filterQuery) ||
      s.section.includes(filterQuery)
  );

  const toggleStudent = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 text-right space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Link className="w-5 h-5 text-amber-600" />
            <span>ربط الأبناء بحساب ولي الأمر ({parentAccount.fullName})</span>
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600">
          اختر الطلاب المراد ربطهم بهذا الحساب بشكل آمن. لن يستطيع ولي الأمر مشاهدة أي درجات أو غيابات خارج هذه القائمة.
        </p>

        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="تصفية باسم الطالب أو الصف..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
        />

        <div className="max-h-60 overflow-y-auto space-y-2 p-1 border border-slate-200 rounded-xl bg-slate-50">
          {filteredStudents.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">لا يوجد طلاب مسجلون في السجلات الحالية</div>
          ) : (
            filteredStudents.map((s) => {
              const isChecked = selectedIds.includes(s.id);
              return (
                <label
                  key={s.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="font-bold">{s.fullName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {s.gradeLevel} - الشعبة ({s.section})
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleStudent(s.id)}
                    className="w-4 h-4 text-emerald-600 rounded-md border-slate-300"
                  />
                </label>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-bold">المحدد: {selectedIds.length} طالب</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              إلغاء
            </button>
            <button
              onClick={() => onSave(selectedIds)}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
            >
              حفظ وتطبيق الربط
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
