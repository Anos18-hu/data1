
import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import QuarterlyReport from './QuarterlyReport';
import { 
  FileText, 
  Trophy, 
  Users, 
  BarChart4, 
  FileCheck, 
  Printer, 
  ChevronLeft, 
  LayoutDashboard,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';

interface ReportsCenterProps {
  students: Student[];
  subjects: string[];
}

type ReportType = 'dashboard' | 'quarterly' | 'honor_roll' | 'council_minutes' | 'institution_stats';

const ReportsCenter: React.FC<ReportsCenterProps> = ({ students, subjects }) => {
  const [activeReport, setActiveReport] = useState<ReportType>('dashboard');
  const [selectedLevel, setSelectedLevel] = useState<string>('السنة الأولى متوسط');

  const levels = useMemo(() => Array.from(new Set(students.map(s => s.level))), [students]);
  const averageKey = subjects.length > 0 ? subjects[subjects.length - 1] : '';

  // بيانات لوحة شرف المستوى المختار
  const honorRoll = useMemo(() => {
    return students
      .filter(s => s.level === selectedLevel)
      .map(s => ({
        name: s.name,
        avg: s.grades[averageKey] || 0,
        section: s.section
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 10);
  }, [students, selectedLevel, averageKey]);

  const reportCards = [
    {
      id: 'quarterly',
      title: 'التقرير الفصلي الموحد',
      description: 'التقرير الرسمي الشامل الذي يتضمن إحصائيات المستويات ونشاطات اللجنة والمجالس.',
      icon: <FileText className="text-blue-600" size={32} />,
      color: 'blue'
    },
    {
      id: 'honor_roll',
      title: 'قوائم التفوق والتشجيع',
      description: 'استخراج لوحة الشرف آلياً للتلاميذ المتفوقين حسب المستوى أو القسم.',
      icon: <Trophy className="text-yellow-500" size={32} />,
      color: 'yellow'
    },
    {
      id: 'council_minutes',
      title: 'نموذج محضر مجلس القسم',
      description: 'مسودة آلية لمحضر اجتماع مجلس القسم تتضمن ملخص النتائج والتوصيات.',
      icon: <Users className="text-purple-600" size={32} />,
      color: 'purple'
    },
    {
      id: 'institution_stats',
      title: 'بطاقة أداء المؤسسة',
      description: 'تقرير موجز في صفحة واحدة يلخص كافة مؤشرات النجاح والتعثر بالمؤسسة.',
      icon: <BarChart4 className="text-green-600" size={32} />,
      color: 'green'
    }
  ];

  if (activeReport === 'quarterly') {
    return (
      <div className="animate-fade-in">
        <button 
          onClick={() => setActiveReport('dashboard')}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-all print:hidden"
        >
          <ChevronLeft size={16} className="rotate-180" /> العودة لمركز التقارير
        </button>
        <QuarterlyReport students={students} subjects={subjects} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {activeReport === 'dashboard' && (
        <>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                <LayoutDashboard size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-800">مركز التقارير الشامل</h2>
                <p className="text-sm text-gray-500 font-bold">بوابة استخراج كافة الوثائق الرسمية والإحصائية بنقرة واحدة</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
              <Calendar className="text-blue-600" size={20} />
              <span className="text-xs font-black text-gray-600">السنة الدراسية: 2024 / 2025</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportCards.map((card) => (
              <button 
                key={card.id}
                onClick={() => setActiveReport(card.id as ReportType)}
                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-right group hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col h-full"
              >
                <div className="mb-6 bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  {card.icon}
                </div>
                <h3 className="text-lg font-black text-gray-800 mb-3 group-hover:text-blue-600">{card.title}</h3>
                <p className="text-xs text-gray-500 font-bold leading-relaxed mb-6">{card.description}</p>
                <div className="mt-auto flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                  فتح القالب <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>

          <div className="bg-blue-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
             <div className="relative z-10 max-w-xl">
               <h3 className="text-xl font-black mb-2 flex items-center gap-3">
                 <ShieldCheck size={28} className="text-blue-300" />
                 التوافق مع الرقمنة والقرارات الرسمية
               </h3>
               <p className="text-xs text-blue-100 font-bold leading-relaxed opacity-80">
                 تم تصميم كافة القوالب في هذا المركز لتطابق الجداول الرسمية المعتمدة من طرف وزارة التربية الوطنية، مع إضافة تحليلات بيداغوجية لمساعدة المستشارين في اتخاذ القرارات.
               </p>
             </div>
             <div className="relative z-10 flex gap-4">
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 text-center w-24">
                  <p className="text-2xl font-black">04</p>
                  <p className="text-[10px] opacity-60">قوالب نشطة</p>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 text-center w-24">
                  <p className="text-2xl font-black">100%</p>
                  <p className="text-[10px] opacity-60">دقة البيانات</p>
                </div>
             </div>
             <FileText className="absolute -bottom-10 -right-10 text-white opacity-5" size={240} />
          </div>
        </>
      )}

      {activeReport === 'honor_roll' && (
        <div className="space-y-6 animate-fade-in">
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center print:hidden">
              <div className="flex items-center gap-4">
                 <button onClick={() => setActiveReport('dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-all"><ChevronLeft size={20} className="rotate-180" /></button>
                 <h3 className="text-xl font-black flex items-center gap-3"><Trophy className="text-yellow-500" size={24} /> قائمة التفوق والتشجيع</h3>
              </div>
              <div className="flex items-center gap-3">
                 <select 
                  value={selectedLevel} 
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black outline-none"
                 >
                   {levels.map(l => <option key={l} value={l}>{l}</option>)}
                 </select>
                 <button onClick={() => window.print()} className="p-3 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-black transition-all">
                   <Printer size={20} />
                 </button>
              </div>
           </div>

           <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-200">
              <div className="text-center mb-12 border-b-2 border-dashed border-gray-100 pb-8">
                 <div className="inline-block p-4 bg-yellow-50 text-yellow-600 rounded-3xl mb-4">
                    <Award size={48} />
                 </div>
                 <h2 className="text-3xl font-black text-gray-800 mb-2">لوحة شرف المؤسسة</h2>
                 <p className="text-sm font-bold text-gray-500">{selectedLevel} - الفصل الدراسي الأول</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {honorRoll.map((student, idx) => (
                  <div key={idx} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-2xl border-2 border-gray-100 transition-all hover:scale-[1.01] hover:bg-white hover:border-yellow-200 group">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-md ${
                        idx === 0 ? 'bg-yellow-400 text-white' : 
                        idx === 1 ? 'bg-gray-400 text-white' : 
                        idx === 2 ? 'bg-orange-400 text-white' : 'bg-white text-gray-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-lg font-black text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-400 font-bold">القسم: {student.section}</p>
                      </div>
                    </div>
                    <div className="text-center">
                       <p className="text-2xl font-black text-blue-600">{student.avg.toFixed(2)}</p>
                       <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">المعدل الفصلي</p>
                    </div>
                    <div className="hidden md:block">
                       <span className={`px-4 py-2 rounded-xl text-[10px] font-black ${
                          student.avg >= 16 ? 'bg-yellow-100 text-yellow-700' : 
                          student.avg >= 14 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                       }`}>
                          {student.avg >= 16 ? 'امتياز' : student.avg >= 14 ? 'تهنئة' : 'تشجيع'}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}

      {(activeReport === 'council_minutes' || activeReport === 'institution_stats') && (
        <div className="bg-white p-20 rounded-3xl shadow-sm border border-gray-100 text-center animate-fade-in">
           <FileCheck size={64} className="mx-auto text-blue-200 mb-6" />
           <h3 className="text-2xl font-black text-gray-800 mb-4">قالب قيد التطوير</h3>
           <p className="text-sm text-gray-500 font-bold max-w-md mx-auto leading-relaxed">
             نحن نعمل حالياً على إضافة الذكاء الاصطناعي لهذا التقرير ليقوم بكتابة التوصيات والملاحظات آلياً بناءً على نتائج القسم. سيتم تفعيله في التحديث القادم.
           </p>
           <button 
            onClick={() => setActiveReport('dashboard')}
            className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all"
           >
             العودة للمركز
           </button>
        </div>
      )}
    </div>
  );
};

export default ReportsCenter;
