
import React, { useState, useMemo, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import StudentAnalysis from './components/StudentAnalysis';
import SubjectAnalysis from './components/SubjectAnalysis';
import CategoryAnalysis from './components/CategoryAnalysis';
import RepeaterAnalysis from './components/RepeaterAnalysis';
import RemedialAnalysis from './components/RemedialAnalysis';
import LevelAnalysis from './components/LevelAnalysis';
import GenderAnalysis from './components/GenderAnalysis';
import OfficialExamsAnalysis from './components/OfficialExamsAnalysis';
import QuarterlyReport from './components/QuarterlyReport';
import ReportsCenter from './components/ReportsCenter';
import Downloads from './components/Downloads';
import CounselingSystem from './components/CounselingSystem';
import OrientationPredictions from './components/OrientationPredictions';
import UserProfile from './components/UserProfile';
import UserManagement from './components/UserManagement'; 
import Login from './components/Login';
import { Student } from './types';
import { UserAccount, USERS_DATA } from './constants/users';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  GraduationCap, 
  PlusCircle, 
  Trash2, 
  LayoutDashboard, 
  DownloadCloud, 
  ClipboardList, 
  AlertTriangle, 
  Users2, 
  LogOut, 
  ShieldCheck, 
  User as UserIcon, 
  Layers, 
  HeartHandshake,
  ArrowRightCircle,
  Compass,
  UserCircle,
  Briefcase,
  Settings,
  PieChart,
  Target
} from 'lucide-react';

enum Tab {
  LEVEL = 'level',
  STUDENTS = 'students',
  SUBJECTS = 'subjects',
  CATEGORIES = 'categories',
  GENDER = 'gender',
  REPEATERS = 'repeaters',
  REMEDIAL = 'remedial',
  OFFICIAL_EXAMS = 'official_exams',
  COUNSELING = 'counseling',
  ORIENTATION = 'orientation',
  REPORTS_HUB = 'reports_hub',
  DOWNLOADS = 'downloads',
  USER_MANAGEMENT = 'user_management'
}

const App: React.FC = () => {
  const [allUsers, setAllUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('system_users');
    return saved ? JSON.parse(saved) : USERS_DATA;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('currentUser');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.COUNSELING);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [forceEnter, setForceEnter] = useState(false);

  useEffect(() => {
    localStorage.setItem('system_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.username === updatedUser.username ? updatedUser : u));
  };

  const handleDataLoaded = (newStudents: Student[], newSubjects: string[]) => {
    setStudents(prev => {
      const existingKeys = new Set(prev.map(s => `${s.name}-${s.level}-${s.section}`));
      const filteredNew = newStudents.filter(s => !existingKeys.has(`${s.name}-${s.level}-${s.section}`));
      return [...prev, ...filteredNew];
    });
    setSubjects(prev => Array.from(new Set([...prev, ...newSubjects])));
    setShowAddModal(false);
    setForceEnter(false);
  };

  const handleLogout = () => {
    if (window.confirm("هل تريد تسجيل الخروج؟")) {
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      sessionStorage.clear();
      setActiveTab(Tab.COUNSELING);
      setForceEnter(false);
    }
  };

  const handleClearData = () => {
    if (window.confirm("هل أنت متأكد من مسح كافة البيانات؟ سيتم حذف جميع التلاميذ المستوردين.")) {
      setStudents([]);
      setSubjects([]);
      setForceEnter(false);
      // إذا كان المستخدم في تبويب يعتمد على البيانات، نرجعه للإرشاد
      if (![Tab.COUNSELING, Tab.ORIENTATION, Tab.USER_MANAGEMENT].includes(activeTab)) {
        setActiveTab(Tab.COUNSELING);
      }
    }
  };

  const uniqueSectionsCount = useMemo(() => {
    const sectionKeys = new Set(students.map(s => `${s.level}-${s.section}`));
    return sectionKeys.size;
  }, [students]);

  const hasData = students.length > 0;

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} users={allUsers} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      {showProfile && (
        <UserProfile 
          user={currentUser} 
          onClose={() => setShowProfile(false)} 
          onLogout={handleLogout} 
          onUpdate={handleUpdateUser} 
        />
      )}

      <header className="bg-blue-900 text-white shadow-lg print:hidden">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <GraduationCap size={32} />
            <div>
              <h1 className="text-xl font-bold">نظام تحليل البيانات</h1>
              <div className="text-[10px] text-blue-200 font-bold flex items-center gap-1">
                <UserCircle size={10} /> {currentUser.fullName} ({currentUser.role})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {hasData && (
              <div className="hidden md:flex gap-4 items-center bg-black/20 px-4 py-1.5 rounded-xl border border-white/10 ml-4">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-300" />
                  <div className="flex flex-col leading-none">
                    <span className="text-sm font-black">{students.length}</span>
                    <span className="text-[8px] opacity-70">تلميذ</span>
                  </div>
                </div>
                <div className="w-px h-6 bg-white/10"></div>
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-blue-300" />
                  <div className="flex flex-col leading-none">
                    <span className="text-sm font-black">{uniqueSectionsCount}</span>
                    <span className="text-[8px] opacity-70">قسم</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <button onClick={() => setShowAddModal(true)} className="bg-green-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-all shadow shadow-green-900/20 flex items-center gap-2">
                <PlusCircle size={14} /> إضافة ملفات
              </button>
              {currentUser.role === 'admin' && (
                <button 
                  onClick={() => setActiveTab(Tab.USER_MANAGEMENT)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === Tab.USER_MANAGEMENT ? 'bg-indigo-600' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  <Settings size={14} /> إدارة الحسابات
                </button>
              )}
              <button onClick={() => setShowProfile(true)} className="bg-white/10 px-4 py-2 rounded-lg text-xs font-bold hover:bg-white/20 transition-all border border-white/10">حسابي</button>
              <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition-all shadow shadow-red-900/20">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {!hasData && !forceEnter && activeTab !== Tab.USER_MANAGEMENT ? (
          <div className="text-center p-12 bg-white rounded-3xl shadow-xl max-w-xl mx-auto border-2 border-blue-50 animate-fade-in">
            <LayoutDashboard size={60} className="mx-auto mb-6 text-blue-200" />
            <h2 className="text-2xl font-black mb-4 text-gray-800">أهلاً بك في نظام التحليل</h2>
            <p className="text-gray-500 mb-8 text-sm">يرجى رفع ملفات كشوف النقاط (Excel) لبدء التحليل، أو الدخول المباشر لاستخدام أنظمة الإرشاد.</p>
            <div className="flex gap-4">
              <button onClick={() => setForceEnter(true)} className="flex-1 bg-gray-800 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-black transition-all">الدخول المباشر</button>
              <div className="flex-1"><FileUpload onDataLoaded={handleDataLoaded} /></div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 mb-8 no-print pb-4 border-b">
              <button onClick={() => setActiveTab(Tab.COUNSELING)} className={`px-4 py-2.5 rounded-xl font-black text-xs border-2 transition-all flex items-center gap-2 ${activeTab === Tab.COUNSELING ? 'bg-red-600 text-white border-red-600 shadow-lg' : 'bg-white border-red-100 text-red-600'}`}>
                <HeartHandshake size={16} /> الإرشاد المدرسي
              </button>
              <button onClick={() => setActiveTab(Tab.ORIENTATION)} className={`px-4 py-2.5 rounded-xl font-black text-xs border-2 transition-all flex items-center gap-2 ${activeTab === Tab.ORIENTATION ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white border-indigo-100 text-indigo-600'}`}>
                <Compass size={16} /> توقعات التوجيه
              </button>
              <button onClick={() => setActiveTab(Tab.REPORTS_HUB)} className={`px-4 py-2.5 rounded-xl font-black text-xs border-2 transition-all flex items-center gap-2 ${activeTab === Tab.REPORTS_HUB ? 'bg-orange-600 text-white border-orange-600 shadow-lg' : 'bg-white border-orange-100 text-orange-600'}`}>
                <Briefcase size={16} /> مركز التقارير
              </button>
              
              <div className="w-px h-8 bg-gray-200 mx-2 self-center"></div>

              <button onClick={() => setActiveTab(Tab.LEVEL)} className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all ${activeTab === Tab.LEVEL ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>المستويات</button>
              <button onClick={() => setActiveTab(Tab.STUDENTS)} className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all ${activeTab === Tab.STUDENTS ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>المتابعة الفردية</button>
              <button onClick={() => setActiveTab(Tab.SUBJECTS)} className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all ${activeTab === Tab.SUBJECTS ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>المواد</button>
              <button onClick={() => setActiveTab(Tab.CATEGORIES)} className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all ${activeTab === Tab.CATEGORIES ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>الفئات</button>
              <button onClick={() => setActiveTab(Tab.GENDER)} className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all ${activeTab === Tab.GENDER ? 'bg-pink-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>الجنس</button>
              <button onClick={() => setActiveTab(Tab.REPEATERS)} className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all ${activeTab === Tab.REPEATERS ? 'bg-red-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>المعيدين</button>
              <button onClick={() => setActiveTab(Tab.REMEDIAL)} className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all ${activeTab === Tab.REMEDIAL ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>المستدركين</button>
              <button onClick={() => setActiveTab(Tab.OFFICIAL_EXAMS)} className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all ${activeTab === Tab.OFFICIAL_EXAMS ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>BEM</button>
              <button onClick={() => setActiveTab(Tab.DOWNLOADS)} className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center gap-2 ${activeTab === Tab.DOWNLOADS ? 'bg-teal-700 text-white shadow-md' : 'bg-white text-teal-700 border-teal-100 hover:bg-teal-50'}`}>
                <DownloadCloud size={14} /> التحميلات
              </button>

              {hasData && (
                <button 
                  onClick={handleClearData} 
                  className="px-4 py-2.5 rounded-xl font-bold text-xs border border-red-200 text-red-500 hover:bg-red-50 transition-all mr-auto flex items-center gap-2"
                  title="مسح كافة البيانات المرفوعة للبدء من جديد"
                >
                  <Trash2 size={14} /> مسح البيانات
                </button>
              )}
            </div>

            <div className="min-h-[500px]">
              {activeTab === Tab.USER_MANAGEMENT && currentUser.role === 'admin' && <UserManagement users={allUsers} onUpdateUsers={setAllUsers} />}
              {activeTab === Tab.COUNSELING && <CounselingSystem students={students} />}
              {activeTab === Tab.ORIENTATION && <OrientationPredictions students={students} subjects={subjects} onDataLoaded={handleDataLoaded} />}
              {activeTab === Tab.REPORTS_HUB && <ReportsCenter students={students} subjects={subjects} />}
              {activeTab === Tab.DOWNLOADS && <Downloads students={students} subjects={subjects} />}
              
              {hasData ? (
                <>
                  {activeTab === Tab.LEVEL && <LevelAnalysis students={students} subjects={subjects} />}
                  {activeTab === Tab.STUDENTS && <StudentAnalysis students={students} subjects={subjects} />}
                  {activeTab === Tab.SUBJECTS && <SubjectAnalysis students={students} subjects={subjects} />}
                  {activeTab === Tab.CATEGORIES && <CategoryAnalysis students={students} subjects={subjects} />}
                  {activeTab === Tab.GENDER && <GenderAnalysis students={students} subjects={subjects} />}
                  {activeTab === Tab.REPEATERS && <RepeaterAnalysis students={students} subjects={subjects} />}
                  {activeTab === Tab.REMEDIAL && <RemedialAnalysis students={students} subjects={subjects} />}
                  {activeTab === Tab.OFFICIAL_EXAMS && <OfficialExamsAnalysis students={students} subjects={subjects} />}
                </>
              ) : (
                activeTab !== Tab.COUNSELING && activeTab !== Tab.ORIENTATION && activeTab !== Tab.REPORTS_HUB && activeTab !== Tab.DOWNLOADS && activeTab !== Tab.USER_MANAGEMENT && (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 animate-pulse">
                    <AlertTriangle size={64} className="text-orange-400 mb-4" />
                    <h3 className="text-xl font-black text-gray-800">هذا القسم يتطلب بيانات</h3>
                    <p className="text-gray-500 mt-2 text-sm">يرجى رفع ملفات كشوف النقاط لتفعيل التحليلات الإحصائية.</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </main>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl relative bg-white rounded-3xl p-6 shadow-2xl">
            <button onClick={() => setShowAddModal(false)} className="absolute -top-12 left-0 text-white font-black bg-red-600 px-4 py-2 rounded-xl shadow-lg hover:bg-red-700 transition-all">إغلاق النافذة [X]</button>
            <FileUpload onDataLoaded={handleDataLoaded} isAppending={true} />
          </div>
        </div>
      )}

      <footer className="bg-white border-t py-6 print:hidden">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">جميع الحقوق محفوظة &copy; 2025 - عمار بولطيف</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
