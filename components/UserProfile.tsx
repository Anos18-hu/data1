
import React, { useState } from 'react';
import { UserAccount } from '../constants/users';
import { User, ShieldCheck, Mail, IdCard, Calendar, X, LogOut, Settings, Save, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface UserProfileProps {
  user: UserAccount;
  onClose: () => void;
  onLogout: () => void;
  onUpdate: (updatedUser: UserAccount) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onClose, onLogout, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserAccount>({ ...user });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من البيانات
    if (!formData.fullName.trim() || !formData.email.includes('@')) {
      setMessage({ type: 'error', text: 'يرجى التأكد من صحة الاسم والبريد الإلكتروني' });
      return;
    }

    // محاكاة تغيير كلمة المرور إذا تم إدخال بيانات
    if (passwords.new) {
      if (passwords.new !== passwords.confirm) {
        setMessage({ type: 'error', text: 'كلمة المرور الجديدة غير متطابقة' });
        return;
      }
      if (passwords.current !== user.password) {
        setMessage({ type: 'error', text: 'كلمة المرور الحالية غير صحيحة' });
        return;
      }
      formData.password = passwords.new;
    }

    onUpdate(formData);
    setMessage({ type: 'success', text: 'تم تحديث البيانات بنجاح' });
    setTimeout(() => {
      setIsEditing(false);
      setMessage(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/20 transform animate-scale-up">
        
        {/* Header */}
        <div className="h-24 bg-gradient-to-r from-blue-700 to-indigo-800 relative">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"
          >
            <X size={20} />
          </button>
          <div className="absolute -bottom-10 right-8">
             <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-white relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-50 flex items-center justify-center">
                   <User size={48} className="text-blue-600" />
                </div>
             </div>
          </div>
        </div>

        <div className="px-8 pt-14 pb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-800">{isEditing ? 'تعديل الحساب' : user.fullName}</h2>
              <p className="text-blue-600 font-bold text-xs">{user.position}</p>
            </div>
            {!isEditing && (
              <button 
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
              >
                <Settings size={14} />
                تعديل الإعدادات
              </button>
            )}
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-slide-down ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="text-xs font-bold">{message.text}</span>
            </div>
          )}

          {!isEditing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={<ShieldCheck size={18} />} label="نوع الصلاحية" value={user.role === 'admin' ? 'مدير نظام' : 'مستخدم'} color="blue" />
                <InfoCard icon={<IdCard size={18} />} label="الرقم الوظيفي" value={user.employeeId} color="indigo" />
              </div>
              <InfoCard icon={<Mail size={18} />} label="البريد الإلكتروني المهني" value={user.email} color="purple" fullWidth />
              <InfoCard icon={<Calendar size={18} />} label="تاريخ تسجيل الحساب" value={user.joinDate} color="teal" fullWidth />
              
              <div className="pt-6 border-t mt-6 flex gap-3">
                <button 
                  type="button"
                  onClick={onLogout}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 active:scale-95"
                >
                  <LogOut size={18} />
                  تسجيل الخروج
                </button>
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all active:scale-95"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4 animate-fade-in">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 mr-2 uppercase">الاسم الكامل</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 mr-2 uppercase">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t mt-4">
                <h4 className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Lock size={14} className="text-orange-500" />
                  تغيير كلمة المرور (اختياري)
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <input 
                    type="password" 
                    placeholder="كلمة المرور الحالية" 
                    className="w-full p-3 bg-orange-50/30 border border-orange-100 rounded-xl outline-none text-xs"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="password" 
                      placeholder="الجديدة" 
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-xs"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    />
                    <input 
                      type="password" 
                      placeholder="تأكيد الجديدة" 
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-xs"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all"
                >
                  <Save size={18} />
                  حفظ الإعدادات
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  fullWidth?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value, color, fullWidth }) => (
  <div className={`flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100/50 transition-colors ${fullWidth ? 'w-full' : ''}`}>
    <div className={`p-2 bg-white rounded-lg shadow-sm text-${color}-600`}>
      {icon}
    </div>
    <div>
      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-xs font-bold text-gray-700">{value}</p>
    </div>
  </div>
);

export default UserProfile;
