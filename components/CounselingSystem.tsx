
import React, { useState, useMemo, useEffect } from 'react';
import { Student, CounselingCase, CaseType, CaseStatus, ReferralSource, CommitteeDecision, FollowUpSession } from '../types';
import { 
  HeartHandshake, 
  PlusCircle, 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  FileText, 
  Printer, 
  Save, 
  Archive, 
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  UserPlus,
  MessageSquare,
  History,
  Activity,
  UserCheck,
  Check,
  User,
  Edit2
} from 'lucide-react';

interface CounselingSystemProps {
  students: Student[];
}

enum SubTab {
  DASHBOARD = 'dashboard',
  REGISTRATION = 'registration',
  COMMITTEE = 'committee',
  LIST = 'list'
}

const CounselingSystem: React.FC<CounselingSystemProps> = ({ students }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>(SubTab.DASHBOARD);
  const [cases, setCases] = useState<CounselingCase[]>(() => {
    const saved = localStorage.getItem('counseling_cases');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchName, setSearchName] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualLevel, setManualLevel] = useState('السنة الأولى متوسط');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [useManualEntry, setUseManualEntry] = useState(students.length === 0);

  const [newCase, setNewCase] = useState<Partial<CounselingCase>>({
    type: 'تربوية',
    referralSource: 'أستاذ',
    status: 'قيد الدراسة',
    referralReason: '',
    description: ''
  });

  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('counseling_cases', JSON.stringify(cases));
  }, [cases]);

  // Statistics
  const stats = useMemo(() => {
    const activeCases = cases.filter(c => !c.isArchived);
    return {
      total: activeCases.length,
      underStudy: activeCases.filter(c => c.status === 'قيد الدراسة').length,
      underFollowUp: activeCases.filter(c => c.status === 'متابعة نشطة').length,
      resolved: activeCases.filter(c => c.status === 'تم الحل').length,
      referred: activeCases.filter(c => c.status === 'محالة لجهة خارجية').length,
      psychological: activeCases.filter(c => c.type === 'نفسية').length,
      educational: activeCases.filter(c => c.type === 'تربوية').length,
      behavioral: activeCases.filter(c => c.type === 'سلوكية').length,
      social: activeCases.filter(c => c.type === 'اجتماعية').length,
    };
  }, [cases]);

  const handleRegisterCase = (e: React.FormEvent) => {
    e.preventDefault();
    
    let studentName = '';
    let level = '';
    let section = '';
    let studentId = '';

    if (useManualEntry) {
      if (!manualName.trim()) {
        alert("⚠️ يرجى إدخال اسم التلميذ.");
        return;
      }
      studentName = manualName.trim();
      level = manualLevel;
      section = 'يدوي';
      studentId = `man-${Date.now()}`;
    } else {
      if (!selectedStudent) {
        alert("⚠️ يرجى اختيار تلميذ من القائمة أولاً.");
        return;
      }
      studentName = selectedStudent.name;
      level = selectedStudent.level;
      section = selectedStudent.section;
      studentId = selectedStudent.id;
    }

    if (!newCase.referralReason || newCase.referralReason.trim() === '') {
      alert("⚠️ يرجى كتابة سبب الإحالة أو موضوع المشكلة.");
      return;
    }

    const caseData: CounselingCase = {
      id: `case-${Date.now()}`,
      studentId,
      studentName,
      level,
      section,
      type: (newCase.type as CaseType) || 'تربوية',
      referralSource: (newCase.referralSource as ReferralSource) || 'أستاذ',
      referralReason: newCase.referralReason.trim(),
      description: (newCase.description || '').trim(),
      status: 'قيد الدراسة',
      createdAt: new Date().toISOString().split('T')[0],
      decisions: [],
      sessions: [],
      isArchived: false
    };

    setCases(prev => [caseData, ...prev]);
    
    // Reset form
    setSelectedStudent(null);
    setManualName('');
    setNewCase({ 
      type: 'تربوية', 
      referralSource: 'أستاذ', 
      status: 'قيد الدراسة',
      referralReason: '',
      description: ''
    });
    setSearchName('');
    setActiveSubTab(SubTab.LIST);
  };

  const addDecision = (caseId: string, decision: Partial<CommitteeDecision>) => {
    const newDecision: CommitteeDecision = {
      id: `dec-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      decisionText: decision.decisionText || '',
      interventionType: decision.interventionType || 'وقائي',
      expectedDuration: decision.expectedDuration || ''
    };

    setCases(prev => prev.map(c => 
      c.id === caseId ? { ...c, decisions: [...c.decisions, newDecision], status: 'متابعة نشطة' } : c
    ));
  };

  const addSession = (caseId: string, session: Partial<FollowUpSession>) => {
    const newSession: FollowUpSession = {
      id: `sess-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      observations: session.observations || '',
      progress: session.progress || 'استقرار'
    };

    setCases(prev => prev.map(c => 
      c.id === caseId ? { ...c, sessions: [...c.sessions, newSession] } : c
    ));
  };

  const updateStatus = (caseId: string, status: CaseStatus) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, status } : c));
  };

  const archiveCase = (caseId: string) => {
    if (window.confirm("هل أنت متأكد من أرشفة هذه الحالة؟ سيتم إخفاؤها من القائمة النشطة.")) {
      setCases(prev => prev.map(c => c.id === caseId ? { ...c, isArchived: true } : c));
    }
  };

  const activeCasesList = useMemo(() => cases.filter(c => !c.isArchived), [cases]);

  return (
    <div className="space-y-6 animate-fade-in text-right" dir="rtl">
      {/* 1. إحصائيات علوية بارزة (لجنة الإرشاد والمتابعة) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-blue-600 flex items-center justify-between group hover:scale-[1.02] transition-all">
          <div>
            <p className="text-gray-500 text-xs font-bold mb-1">إجمالي الحالات</p>
            <h3 className="text-3xl font-black text-blue-900">{stats.total}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><ClipboardList size={28} /></div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-red-600 flex items-center justify-between group hover:scale-[1.02] transition-all">
          <div>
            <p className="text-red-600 text-xs font-bold mb-1">حالات قيد المتابعة</p>
            <h3 className="text-3xl font-black text-red-900">{stats.underFollowUp}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl"><Activity size={28} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-orange-500 flex items-center justify-between group hover:scale-[1.02] transition-all">
          <div>
            <p className="text-orange-600 text-xs font-bold mb-1">حالات قيد الدراسة</p>
            <h3 className="text-3xl font-black text-orange-900">{stats.underStudy}</h3>
          </div>
          <div className="p-3 bg-orange-50 text-orange-500 rounded-xl"><Clock size={28} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-green-600 flex items-center justify-between group hover:scale-[1.02] transition-all">
          <div>
            <p className="text-green-600 text-xs font-bold mb-1">حالات تم حلها</p>
            <h3 className="text-3xl font-black text-green-900">{stats.resolved}</h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><UserCheck size={28} /></div>
        </div>
      </div>

      {/* Header & Navigation */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl shadow-inner">
              <HeartHandshake size={32} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800">منظومة الإرشاد المدرسي والمتابعة</h2>
              <p className="text-xs text-gray-500 font-medium italic">آلية تجسيد الإرشاد في مرحلة التعليم المتوسط - القرار 242/2013</p>
            </div>
          </div>
          <div className="flex gap-2 print:hidden">
            <button 
              onClick={() => setActiveSubTab(SubTab.REGISTRATION)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow hover:bg-red-700 transition-all"
            >
              <PlusCircle size={18} />
              إحالة تلميذ جديد
            </button>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex gap-2 mt-8 p-1 bg-gray-50 rounded-xl border border-gray-100 print:hidden">
          <button 
            onClick={() => setActiveSubTab(SubTab.DASHBOARD)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${activeSubTab === SubTab.DASHBOARD ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutDashboard size={18} />
            اللوحة العامة
          </button>
          <button 
            onClick={() => setActiveSubTab(SubTab.LIST)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${activeSubTab === SubTab.LIST ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ClipboardList size={18} />
            سجل الحالات
          </button>
          <button 
            onClick={() => setActiveSubTab(SubTab.COMMITTEE)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${activeSubTab === SubTab.COMMITTEE ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Users size={18} />
            أعمال اللجنة
          </button>
        </div>
      </div>

      {activeSubTab === SubTab.DASHBOARD && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Clock size={20} className="text-red-600" />
                آخر الحالات الواردة للجنة
              </h3>
              <div className="space-y-4">
                {activeCasesList.slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-red-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-10 rounded-full ${
                        c.type === 'نفسية' ? 'bg-red-500' : 
                        c.type === 'تربوية' ? 'bg-blue-500' : 'bg-orange-500'
                      }`}></div>
                      <div>
                        <p className="font-bold text-gray-800">{c.studentName}</p>
                        <p className="text-[10px] text-gray-500">{c.level} | <span className="text-red-600 font-bold">{c.type}</span></p>
                      </div>
                    </div>
                    <div className="text-left">
                       <span className={`px-3 py-1 bg-white border text-[10px] rounded-full font-bold shadow-sm ${c.status === 'متابعة نشطة' ? 'text-red-600 border-red-100' : 'text-gray-600 border-gray-100'}`}>{c.status}</span>
                    </div>
                  </div>
                ))}
                {activeCasesList.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <History size={48} className="mx-auto mb-2 opacity-20" />
                    <p>لا توجد سجلات حالياً</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-800">
                <AlertCircle size={20} className="text-red-500" />
                توزيع نوع المشكلات
              </h3>
              <div className="space-y-4">
                {[
                   { label: 'نفسية', count: stats.psychological, color: 'bg-red-500' },
                   { label: 'تربوية', count: stats.educational, color: 'bg-blue-500' },
                   { label: 'سلوكية', count: stats.behavioral, color: 'bg-orange-500' },
                   { label: 'اجتماعية', count: stats.social, color: 'bg-green-500' }
                ].map(item => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                       <span>{item.label}</span>
                       <span>{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                       <div 
                        className={`${item.color} h-2 rounded-full`} 
                        style={{ width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%` }}
                       ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === SubTab.REGISTRATION && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-4xl mx-auto animate-fade-in">
          <div className="flex items-center gap-4 mb-8 pb-4 border-b">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <UserPlus size={28} />
            </div>
            <div>
               <h3 className="text-xl font-black text-gray-800">تسجيل ملف إرشاد ومتابعة</h3>
               <p className="text-xs text-gray-500 font-medium">فتح ملف جديد لتلميذ محال للجنة الإرشاد</p>
            </div>
          </div>

          <div className="mb-8 flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
            <button 
              onClick={() => setUseManualEntry(false)}
              disabled={students.length === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${!useManualEntry ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 disabled:opacity-50'}`}
            >
              <Search size={14} /> البحث في التلاميذ
            </button>
            <button 
              onClick={() => setUseManualEntry(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${useManualEntry ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}
            >
              <Edit2 size={14} /> إدخال بيانات يدوياً
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700">1. بيانات التلميذ المعني</label>
              
              {!useManualEntry ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="ابحث بالاسم..." 
                      className="w-full pr-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                    />
                  </div>
                  
                  {searchName.length > 2 && (
                    <div className="max-h-40 overflow-y-auto border rounded-xl bg-white shadow-lg custom-scrollbar absolute z-10 w-[350px]">
                      {students.filter(s => s.name.includes(searchName)).map(s => (
                        <div 
                          key={s.id} 
                          onClick={() => { setSelectedStudent(s); setSearchName(''); }}
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b text-sm transition-colors flex justify-between items-center"
                        >
                          <span className="font-bold">{s.name}</span>
                          <span className="text-[10px] text-gray-400">{s.level}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedStudent && (
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center justify-between animate-fade-in">
                      <div>
                        <p className="font-bold text-green-900 flex items-center gap-2">
                           <Check size={16} /> {selectedStudent.name}
                        </p>
                        <p className="text-[10px] text-green-700">{selectedStudent.level} - قسم {selectedStudent.section}</p>
                      </div>
                      <button onClick={() => setSelectedStudent(null)} className="text-[10px] text-red-500 font-bold hover:underline">تغيير</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="ادخل الاسم الكامل..." 
                      className="w-full pr-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                    />
                  </div>
                  <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    value={manualLevel}
                    onChange={(e) => setManualLevel(e.target.value)}
                  >
                    <option value="السنة الأولى متوسط">السنة الأولى متوسط</option>
                    <option value="السنة الثانية متوسط">السنة الثانية متوسط</option>
                    <option value="السنة الثالثة متوسط">السنة الثالثة متوسط</option>
                    <option value="السنة الرابعة متوسط">السنة الرابعة متوسط</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-4">
               <label className="block text-sm font-bold text-gray-700">2. تصنيف نوع الحالة</label>
               <div className="grid grid-cols-2 gap-2">
                  {['تربوية', 'سلوكية', 'نفسية', 'اجتماعية', 'أخرى'].map((type) => (
                    <button 
                      key={type}
                      onClick={() => setNewCase({ ...newCase, type: type as CaseType })}
                      className={`p-2 text-[11px] rounded-lg border font-bold transition-all ${newCase.type === type ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                    >
                      {type}
                    </button>
                  ))}
               </div>
            </div>
          </div>

          <form onSubmit={handleRegisterCase} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">جهة الإحالة</label>
                <select 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={newCase.referralSource}
                  onChange={(e) => setNewCase({ ...newCase, referralSource: e.target.value as ReferralSource })}
                >
                  <option value="أستاذ">أستاذ المادة / الرئيسي</option>
                  <option value="إدارة">إدارة المؤسسة</option>
                  <option value="ولي أمر">طلب من ولي الأمر</option>
                  <option value="تلقائي">حالة مكتشفة تلقائياً</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">سبب الإحالة الرئيسي (موضوع المشكلة) *</label>
                <input 
                  type="text" 
                  placeholder="مثال: تراجع النتائج، سلوك عدواني..."
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={newCase.referralReason || ''}
                  onChange={(e) => setNewCase({ ...newCase, referralReason: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">ملاحظات إضافية وتفاصيل (اختياري)</label>
              <textarea 
                rows={3}
                placeholder="اكتب هنا أي تفاصيل إضافية..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={newCase.description || ''}
                onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button 
                type="button" 
                onClick={() => setActiveSubTab(SubTab.DASHBOARD)}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                إلغاء العملية
              </button>
              <button 
                type="submit" 
                className="px-8 py-3 bg-red-600 text-white rounded-xl font-black shadow-lg hover:bg-red-700 transition-all transform active:scale-95 flex items-center gap-2"
              >
                <Save size={20} />
                تثبيت الحالة في السجل الآن
              </button>
            </div>
          </form>
        </div>
      )}

      {activeSubTab === SubTab.LIST && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap justify-between items-center print:hidden gap-4">
             <div className="flex items-center gap-2 text-gray-500">
               <ClipboardList size={20} />
               <span className="text-sm font-bold">إجمالي السجل النشط: {activeCasesList.length}</span>
             </div>
             <div className="relative w-full md:w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="ابحث في سجل الحالات..." 
                  className="w-full pr-9 p-2 text-xs bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setSearchName(e.target.value)}
                />
             </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {activeCasesList.filter(c => c.studentName.includes(searchName)).length > 0 ? (
              activeCasesList.filter(c => c.studentName.includes(searchName)).map(c => (
                <div key={c.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-red-400 transition-all group">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-black shadow-inner">
                        {c.studentName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-gray-800">{c.studentName}</h4>
                        <p className="text-xs text-gray-500 font-medium">تاريخ الإحالة: {c.createdAt} | المستوى: {c.level}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${
                        c.type === 'نفسية' ? 'bg-red-50 text-red-600 border-red-200' :
                        c.type === 'تربوية' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        'bg-orange-50 text-orange-600 border-orange-200'
                      }`}>
                        {c.type}
                      </span>
                      <span className={`px-3 py-1 text-[10px] rounded-full font-bold border ${c.status === 'متابعة نشطة' ? 'bg-red-600 text-white shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {c.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-dashed text-sm text-gray-700 leading-relaxed">
                    <p className="font-bold text-gray-500 text-[10px] mb-1 uppercase tracking-wider">الموضوع الرئيسي للحالة:</p>
                    {c.referralReason}
                  </div>

                  <div className="mt-6 pt-4 border-t flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                       <div className="flex -space-x-2">
                          {c.sessions.length > 0 && <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white" title="جلسات متابعة">{c.sessions.length}</span>}
                          {c.decisions.length > 0 && <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white" title="قرارات اللجنة">{c.decisions.length}</span>}
                       </div>
                       <span className="text-[10px] text-gray-400">آخر تحديث: {c.sessions.length > 0 ? c.sessions[c.sessions.length-1].date : c.createdAt}</span>
                    </div>
                    
                    <div className="flex gap-2 print:hidden">
                      <button 
                        onClick={() => setActiveCaseId(activeCaseId === c.id ? null : c.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-700 text-[10px] font-bold rounded-lg hover:bg-red-100 flex items-center gap-1 transition-colors"
                      >
                        <Activity size={12} />
                        إدارة المتابعة
                      </button>
                      <button 
                        onClick={() => archiveCase(c.id)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        أرشفة
                      </button>
                      <button 
                        className="p-1.5 bg-yellow-50 text-yellow-700 rounded-lg shadow-sm hover:bg-yellow-100"
                        onClick={() => window.print()}
                      >
                        <Printer size={16} />
                      </button>
                    </div>
                  </div>

                  {activeCaseId === c.id && (
                    <div className="mt-8 p-6 bg-white border-2 border-red-50 rounded-2xl animate-fade-in space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h5 className="font-black text-gray-800 flex items-center gap-2">
                            <Users size={16} className="text-red-600" />
                            قرارات لجنة المتابعة
                          </h5>
                          <div className="space-y-3">
                            {c.decisions.map(d => (
                              <div key={d.id} className="p-3 bg-red-50 rounded-xl text-xs relative border border-red-100">
                                <span className="absolute left-3 top-3 text-[9px] font-mono text-red-400">{d.date}</span>
                                <p className="font-bold text-red-900 mb-1">[{d.interventionType}]</p>
                                <p className="text-gray-700">{d.decisionText}</p>
                              </div>
                            ))}
                            <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed">
                               <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase">إضافة قرار لجنة جديد:</p>
                               <div className="space-y-2">
                                 <textarea 
                                    placeholder="اكتب هنا نص القرار المعتمد..." 
                                    className="w-full p-3 text-[10px] border rounded-xl outline-none shadow-inner focus:ring-1 focus:ring-red-400"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.value) {
                                        e.preventDefault();
                                        addDecision(c.id, { decisionText: e.currentTarget.value });
                                        e.currentTarget.value = '';
                                      }
                                    }}
                                 ></textarea>
                               </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h5 className="font-black text-gray-800 flex items-center gap-2">
                            <History size={16} className="text-green-600" />
                            سجل جلسات المتابعة
                          </h5>
                          <div className="space-y-3">
                            {c.sessions.map(s => (
                              <div key={s.id} className="p-3 bg-green-50 rounded-xl text-xs relative border border-green-100">
                                <span className="absolute left-3 top-3 text-[9px] font-mono text-green-400">{s.date}</span>
                                <p className="font-bold text-green-900 mb-1">تطور الحالة: {s.progress}</p>
                                <p className="text-gray-700">{s.observations}</p>
                              </div>
                            ))}
                            <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed">
                               <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase">تسجيل ملاحظة متابعة:</p>
                               <div className="space-y-2">
                                 <textarea 
                                    placeholder="اكتب خلاصة الجلسة..." 
                                    className="w-full p-3 text-[10px] border rounded-xl outline-none shadow-inner focus:ring-1 focus:ring-green-400"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.value) {
                                        e.preventDefault();
                                        addSession(c.id, { observations: e.currentTarget.value, progress: 'استقرار' });
                                        e.currentTarget.value = '';
                                      }
                                    }}
                                 ></textarea>
                               </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t flex flex-wrap justify-between items-center gap-4">
                         <div className="flex flex-wrap gap-2 items-center">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">تحديث الحالة:</p>
                            {['قيد الدراسة', 'متابعة نشطة', 'تم الحل', 'محالة لجهة خارجية'].map(st => (
                              <button 
                                key={st}
                                onClick={() => updateStatus(c.id, st as CaseStatus)}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${c.status === st ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                              >
                                {st}
                              </button>
                            ))}
                         </div>
                         <button onClick={() => setActiveCaseId(null)} className="text-[10px] text-red-600 font-bold hover:underline">إخفاء لوحة التحكم</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="mb-4 text-gray-200 flex justify-center"><ClipboardList size={64} /></div>
                <h3 className="text-xl font-bold text-gray-400">لا توجد سجلات حالياً</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === SubTab.COMMITTEE && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-8 animate-fade-in">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div className="flex items-center gap-3">
               <div className="p-3 bg-red-100 text-red-600 rounded-xl shadow-inner">
                 <Users size={32} />
               </div>
               <h3 className="text-2xl font-black">أعمال لجنة الإرشاد والمتابعة</h3>
             </div>
             <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg font-bold text-sm shadow hover:bg-yellow-600">
               <Printer size={18} />
               طباعة محضر الاجتماع
             </button>
           </div>

           <div className="p-6 bg-red-50 border-r-4 border-red-500 rounded-xl space-y-2">
              <p className="text-sm font-bold text-red-900">إحصائيات اجتماعات اللجنة:</p>
              <p className="text-xs text-red-800 opacity-80 leading-relaxed">
                يوجد حالياً <span className="font-black text-lg underline text-red-600">{stats.underFollowUp}</span> تلميذ قيد المتابعة النشطة، بينما ينتظر <span className="font-black text-lg underline text-orange-600">{stats.underStudy}</span> تلميذ دراسة ملفاتهم.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="space-y-4">
                 <h4 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                   <UserCheck size={18} className="text-blue-600" /> أعضاء اللجنة الحاضرون
                 </h4>
                 <div className="space-y-2">
                    {['رئيس المؤسسة', 'مستشار التوجيه', 'الأخصائي النفسي', 'أساتذة القسم المعنيين'].map(role => (
                      <div key={role} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:bg-white hover:border-red-200 transition-all">
                         <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center group-hover:border-red-500 transition-colors">
                            <div className="w-2 h-2 bg-transparent group-hover:bg-red-500 rounded-full"></div>
                         </div>
                         <span className="text-xs font-bold text-gray-600">{role}</span>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="space-y-4">
                 <h4 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                   <ClipboardList size={18} className="text-orange-600" /> جدول الأعمال
                 </h4>
                 <div className="p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                    <MessageSquare size={48} className="text-gray-300 mb-4" />
                    <p className="text-xs text-gray-600 font-bold">دراسة وضعية التلاميذ المتعثرين وتفعيل خطط المتابعة.</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CounselingSystem;
