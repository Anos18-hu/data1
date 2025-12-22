
import React, { useState } from 'react';
import { Lock, User, LogIn, GraduationCap, AlertCircle, ShieldAlert } from 'lucide-react';
import { UserAccount } from '../constants/users';

interface LoginProps {
  onLogin: (user: UserAccount) => void;
  users: UserAccount[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<{ type: 'auth' | 'status', text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  // Note: users list is passed via props from App.tsx (single source of truth).

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      const normalized = username.trim().toLowerCase();
      const foundUser = users.find(
        u => u.username.trim().toLowerCase() === normalized && u.password === password
      );

      if (foundUser) {
        if (foundUser.isActive === false) {
          setError({ type: 'status', text: 'عذراً، هذا الحساب معطل حالياً من قبل المسؤول.' });
          setLoading(false);
          return;
        }
        onLogin(foundUser);
      } else {
        setError({ type: 'auth', text: 'خطأ في اسم المستخدم أو كلمة المرور.' });
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 animate-fade-in relative z-10 text-right" dir="rtl">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-white/20 rounded-2xl mb-4 shadow-inner">
            <GraduationCap size={48} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">نظام تحليل البيانات</h1>
          <p className="text-blue-200 text-sm">أدخل بيانات الاعتماد للمتابعة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-blue-100 text-xs font-bold mr-1">اسم المستخدم</label>
            <div className="relative group">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-white transition-colors">
                <User size={18} />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pr-12 pl-4 text-white placeholder-blue-300/50 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-blue-100 text-xs font-bold mr-1">كلمة المرور</label>
            <div className="relative group">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-white transition-colors">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pr-12 pl-4 text-white placeholder-blue-300/50 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all font-bold"
              />
            </div>
          </div>

          {error && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 animate-shake border ${error.type === 'status' ? 'bg-orange-500/20 border-orange-500/50 text-orange-100' : 'bg-red-500/20 border-red-500/50 text-red-100'}`}>
              {error.type === 'status' ? <ShieldAlert size={20} /> : <AlertCircle size={20} />}
              <span className="text-[11px] font-bold leading-relaxed">{error.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-blue-900 font-black py-4 rounded-2xl shadow-xl hover:bg-blue-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-blue-900/30 border-t-blue-900 rounded-full animate-spin"></div>
            ) : (
              <>
                <span>دخول النظام</span>
                <LogIn size={20} className="group-hover:translate-x-1 transition-transform rotate-180" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
