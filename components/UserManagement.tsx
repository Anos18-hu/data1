
import React, { useState } from 'react';
import { UserAccount } from '../constants/users';
import { 
  UserPlus, 
  Users, 
  UserX, 
  UserCheck, 
  ShieldCheck, 
  Trash2,
  Settings,
  Mail,
  Key
} from 'lucide-react';

interface UserManagementProps {
  users: UserAccount[];
  onUpdateUsers: (newUsers: UserAccount[]) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onUpdateUsers }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState<Partial<UserAccount>>({
    role: 'user',
    isActive: true,
    joinDate: new Date().toISOString().split('T')[0]
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password || !newUser.fullName) {
      alert("يرجى ملء الحقول الأساسية (الاسم، المستخدم، كلمة المرور)");
      return;
    }

    if (users.find(u => u.username === newUser.username)) {
      alert("اسم المستخدم موجود مسبقاً");
      return;
    }

    const account: UserAccount = {
      ...newUser as UserAccount,
      employeeId: `EMP-${Date.now().toString().slice(-4)}`,
      email: newUser.email || `${newUser.username}@edu-analytics.dz`,
      position: newUser.position || 'موظف'
    };

    onUpdateUsers([account, ...users]);
    setNewUser({ role: 'user', isActive: true, joinDate: new Date().toISOString().split('T')[0] });
    setShowAddForm(false);
  };

  const toggleUserStatus = (username: string) => {
    if (username === 'admin') return;
    const updated = users.map(u => {
      if (u.username === username) return { ...u, isActive: !u.isActive };
      return u;
    });
    onUpdateUsers(updated);
  };

  const deleteUser = (username: string) => {
    if (username === 'admin') return;
    if (window.confirm("هل أنت متأكد من حذف هذا الحساب نهائياً؟")) {
      onUpdateUsers(users.filter(u => u.username !== username));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-right" dir="rtl">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800">إدارة مستخدمي النظام</h2>
            <p className="text-[10px] text-gray-400 font-bold">التحكم في صلاحيات الوصول والحسابات</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <UserPlus size={18} />
          {showAddForm ? 'إلغاء' : 'إضافة مستخدم جديد'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-indigo-50 animate-slide-down">
          <h3 className="text-lg font-black mb-6 text-indigo-900 flex items-center gap-2">
            <Settings size={20} /> بيانات الحساب الجديد
          </h3>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 mr-2">الاسم الكامل</label>
              <input 
                type="text" required
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                value={newUser.fullName || ''}
                onChange={e => setNewUser({...newUser, fullName: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 mr-2">اسم المستخدم</label>
              <input 
                type="text" required
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                value={newUser.username || ''}
                onChange={e => setNewUser({...newUser, username: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 mr-2">كلمة المرور</label>
              <input 
                type="password" required
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                value={newUser.password || ''}
                onChange={e => setNewUser({...newUser, password: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 mr-2">نوع الصلاحية</label>
              <select 
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-sm"
                value={newUser.role}
                onChange={e => setNewUser({...newUser, role: e.target.value as any})}
              >
                <option value="user">مستخدم عادي</option>
                <option value="admin">مسؤول نظام</option>
              </select>
            </div>
            <div className="md:col-span-2 flex items-end">
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black shadow-lg hover:bg-indigo-700 transition-all">
                إنشاء وتفعيل الحساب
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.username} className={`bg-white p-6 rounded-3xl border-2 transition-all ${user.isActive ? 'border-gray-50 shadow-sm' : 'border-red-100 bg-red-50/20 grayscale opacity-70'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${user.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                  {user.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-800">{user.fullName}</h4>
                  <p className="text-[9px] text-gray-400 font-bold">{user.position}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-md text-[8px] font-black ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                {user.role}
              </span>
            </div>
            
            <div className="space-y-2 py-4 border-t border-gray-50">
               <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold">
                 <Mail size={12} /> {user.email}
               </div>
               <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold">
                 <Key size={12} /> {user.username}
               </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
              <button 
                onClick={() => toggleUserStatus(user.username)}
                disabled={user.username === 'admin'}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${user.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-600 text-white hover:bg-red-700'}`}
              >
                {user.isActive ? <><UserCheck size={14} /> نشط</> : <><UserX size={14} /> معطل</>}
              </button>
              {user.username !== 'admin' && (
                <button onClick={() => deleteUser(user.username)} className="text-red-300 hover:text-red-600 transition-colors">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
