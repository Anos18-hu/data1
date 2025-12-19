
import React, { useState, useMemo } from 'react';
import { Student, SubjectStats } from '../types';
import { analyzeSubject, calculateAverage, exportToExcel } from '../utils/analytics';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell,
  Legend,
  LineChart,
  Line,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { 
  Download, 
  Printer, 
  Filter, 
  FileText, 
  BarChart3, 
  ArrowLeftRight, 
  Target, 
  LayoutGrid,
  Zap,
  Activity,
  Maximize2,
  Trophy,
  AlertTriangle,
  Grid3X3,
  TrendingUp
} from 'lucide-react';

interface SubjectAnalysisProps {
  students: Student[];
  subjects: string[];
}

const OFFICIAL_ORDER = [
  "اللغة العربية", "اللغة الأمازيغية", "الرياضيات", "اللغة الفرنسية", "اللغة الإنجليزية",
  "التربية الإسلامية", "التاريخ والجغرافيا", "التربية المدنية", "ع الفيزيائية والتكنولوجيا",
  "ع الطبيعة والحياة", "التربية التشكيلية", "التربية الموسيقية", "ت البدنية والرياضية",
  "المعلوماتية", "معدل الفصل 1"
];

const matchSubject = (officialName: string, rawSubjects: string[]): string | undefined => {
  return rawSubjects.find(raw => {
    const r = raw.trim();
    if (officialName === "اللغة العربية") return r.includes("العربية") || r === "اللغة عربية";
    if (officialName === "اللغة الأمازيغية") return r.includes("الأمازيغية") || r.includes("أمازيغية");
    if (officialName === "الرياضيات") return r.includes("الرياضيات") || r === "رياضيات";
    if (officialName === "اللغة الفرنسية") return r.includes("الفرنسية") || r === "لغة فرنسية";
    if (officialName === "اللغة الإنجليزية") return r.includes("الإنجليزية") || r.includes("انجليزية");
    if (officialName === "التربية الإسلامية") return r.includes("الإسلامية") || r === "تربية إسلامية";
    if (officialName === "التاريخ والجغرافيا") return r.includes("التاريخ") || r.includes("جغرافيا");
    if (officialName === "التربية المدنية") return r.includes("المدنية") || r === "تربية مدنية";
    if (officialName === "ع الفيزيائية والتكنولوجيا") return r.includes("فيزياء") || r.includes("فيزيائية") || r.includes("تكنولوجيا");
    if (officialName === "ع الطبيعة والحياة") return r.includes("طبيعة") || r.includes("طبيعية") || r.includes("الحياة");
    if (officialName === "التربية التشكيلية") return r.includes("تشكيلية");
    if (officialName === "التربية الموسيقية") return r.includes("موسيقية");
    if (officialName === "ت البدنية والرياضية") return r.includes("بدنية") || r.includes("رياضية");
    if (officialName === "المعلوماتية") return r.includes("معلوماتية");
    if (officialName === "معدل الفصل 1") return r.includes("معدل الفصل");
    return false;
  });
};

const SubjectAnalysis: React.FC<SubjectAnalysisProps> = ({ students, subjects }) => {
  const [activeTab, setActiveTab] = useState<'official' | 'comparative'>('official');
  const [compSubMode, setCompSubMode] = useState<'by_subject' | 'matrix' | 'consistency'>('by_subject');
  const [selectedLevel, setSelectedLevel] = useState<string>('السنة الأولى متوسط');
  const [selectedSubject, setSelectedSubject] = useState<string>(OFFICIAL_ORDER[0]);

  const levels = useMemo(() => Array.from(new Set(students.map(s => s.level))), [students]);
  const levelStudents = useMemo(() => students.filter(s => s.level === selectedLevel), [students, selectedLevel]);
  const sections = useMemo(() => Array.from(new Set(levelStudents.map(s => s.section))).sort(), [levelStudents]);

  // 1. بيانات مقارنة مادة واحدة عبر الأقسام
  const crossSectionData = useMemo(() => {
    const rawKey = matchSubject(selectedSubject, subjects);
    if (!rawKey) return [];

    return sections.map(sec => {
      const sectionStudents = levelStudents.filter(s => s.section === sec);
      const grades = sectionStudents.map(s => s.grades[rawKey]).filter(g => typeof g === 'number') as number[];
      const avg = calculateAverage(grades);
      const passRate = grades.length > 0 ? (grades.filter(g => g >= 10).length / grades.length) * 100 : 0;
      
      // حساب الانحراف المعياري للقسم في هذه المادة
      const squareDiffs = grades.map(g => Math.pow(g - avg, 2));
      const variance = calculateAverage(squareDiffs);
      const stdDev = Math.sqrt(variance);
      const cv = avg !== 0 ? (stdDev / avg) * 100 : 0;

      return {
        section: `قسم ${sec}`,
        average: Number(avg.toFixed(2)),
        passRate: Number(passRate.toFixed(1)),
        cv: Number(cv.toFixed(1)),
        count: grades.length
      };
    });
  }, [levelStudents, selectedSubject, subjects, sections]);

  const levelSubjectAverage = useMemo(() => {
    if (crossSectionData.length === 0) return 0;
    return calculateAverage(crossSectionData.map(d => d.average));
  }, [crossSectionData]);

  // 2. بيانات مصفوفة الأداء الكاملة (Heatmap Data)
  const performanceMatrix = useMemo(() => {
    const matrix: any[] = [];
    OFFICIAL_ORDER.slice(0, -1).forEach(officialSub => {
      const rawKey = matchSubject(officialSub, subjects);
      if (!rawKey) return;

      const row: any = { subject: officialSub };
      sections.forEach(sec => {
        const secGrades = levelStudents.filter(s => s.section === sec)
          .map(s => s.grades[rawKey])
          .filter(g => typeof g === 'number') as number[];
        row[sec] = secGrades.length > 0 ? calculateAverage(secGrades) : 0;
      });
      matrix.push(row);
    });
    return matrix;
  }, [levelStudents, subjects, sections]);

  // 3. التحليل الإحصائي الرسمي (التبويب الأول)
  const allSubjectsStats = useMemo(() => {
    const allGrades = levelStudents.flatMap(s => Object.values(s.grades)).filter(g => typeof g === 'number');
    const globalAverage = calculateAverage(allGrades);

    return OFFICIAL_ORDER.map(officialName => {
      const rawKey = matchSubject(officialName, subjects);
      if (!rawKey) return null;
      const stats = analyzeSubject(levelStudents, rawKey, globalAverage);
      return { ...stats, displayName: officialName };
    }).filter(Boolean) as (SubjectStats & { displayName: string })[];
  }, [levelStudents, subjects]);

  const handleExportTable = () => {
    const exportData = allSubjectsStats.map(stats => ({
      'المواد التعليمية': stats.displayName,
      'عدد المتحصلين على معدل ≥ 10': stats.countAbove10,
      'نسبة عدد المتحصلين على معدل ≥ 10': `${stats.passPercentage.toFixed(1)}%`,
      'معدل المادة': stats.average.toFixed(2)
    }));
    exportToExcel(exportData, `تحليل_المواد_${selectedLevel}`, 'تحليل نتائج المواد');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Navigation Header */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-4 print:hidden">
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-inner w-full lg:w-auto overflow-x-auto">
          <button 
            onClick={() => setActiveTab('official')}
            className={`whitespace-nowrap flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'official' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutGrid size={16} /> النتائج الرسمية
          </button>
          <button 
            onClick={() => setActiveTab('comparative')}
            className={`whitespace-nowrap flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'comparative' ? 'bg-white text-orange-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ArrowLeftRight size={16} /> التحليل المقارن المتقدم
          </button>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-grow">
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select 
              value={selectedLevel} 
              onChange={(e) => setSelectedLevel(e.target.value)} 
              className="w-full pr-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all appearance-none"
            >
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <button onClick={handleExportTable} className="p-3 bg-green-50 text-green-600 rounded-xl border border-green-100 hover:bg-green-100 transition-all shadow-sm">
            <Download size={20} />
          </button>
          <button onClick={() => window.print()} className="p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg">
            <Printer size={20} />
          </button>
        </div>
      </div>

      {activeTab === 'official' && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-fade-in">
          <div className="flex justify-between items-center mb-8 print:hidden">
            <h3 className="text-xl font-black text-gray-800 flex items-center gap-3">
              <FileText className="text-blue-600" size={26} />
              جدول التحليل الإحصائي الرسمي ({selectedLevel})
            </h3>
          </div>
          <div className="overflow-x-auto border-2 border-black rounded-3xl overflow-hidden shadow-xl">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th rowSpan={2} className="p-5 border border-gray-700 font-black text-sm w-1/3">المواد التعليمية</th>
                  <th colSpan={2} className="p-3 border border-gray-700 bg-yellow-500 text-gray-900 font-black text-xs uppercase tracking-wider">إحصائيات النجاح</th>
                  <th className="p-3 border border-gray-700 bg-blue-600 text-white font-black text-xs">متوسط المستوى</th>
                </tr>
                <tr className="bg-yellow-400">
                  <th className="p-2 border border-black/10 text-[10px] font-black text-gray-900">عدد الناجحين ≥ 10</th>
                  <th className="p-2 border border-black/10 text-[10px] font-black text-gray-900">نسبة النجاح %</th>
                  <th className="p-2 border border-black/10"></th>
                </tr>
              </thead>
              <tbody>
                {allSubjectsStats.map((stats, idx) => (
                  <tr key={stats.displayName} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/50 transition-colors group`}>
                    <td className="p-5 border border-gray-100 font-bold text-right pr-8 text-sm text-gray-700 group-hover:text-blue-700">{stats.displayName}</td>
                    <td className="p-5 border border-gray-100 text-lg font-black text-gray-900">{stats.countAbove10}</td>
                    <td className="p-5 border border-gray-100 text-lg font-black text-gray-900">{stats.passPercentage.toFixed(1)}%</td>
                    <td className="p-5 border border-gray-100 font-black text-2xl text-blue-700 bg-blue-50/20">{stats.average.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'comparative' && (
        <div className="space-y-6 animate-fade-in">
          {/* Sub-Tabs for Comparative Analysis */}
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 overflow-x-auto print:hidden">
            {[
              { id: 'by_subject', label: 'مقارنة مادة واحدة', icon: <Target size={16} /> },
              { id: 'matrix', label: 'مصفوفة الأداء العام', icon: <Grid3X3 size={16} /> },
              { id: 'consistency', label: 'تحليل ثبات النتائج', icon: <Activity size={16} /> }
            ].map(sub => (
              <button 
                key={sub.id}
                onClick={() => setCompSubMode(sub.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black transition-all ${compSubMode === sub.id ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {sub.icon}
                {sub.label}
              </button>
            ))}
          </div>

          {compSubMode === 'by_subject' && (
            <div className="space-y-6">
              {/* Subject Selector */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-3 mr-2">اختر المادة المراد تحليلها عبر كافة الأقسام:</p>
                <div className="flex flex-wrap gap-2">
                  {OFFICIAL_ORDER.slice(0, -1).map(sub => (
                    <button 
                      key={sub}
                      onClick={() => setSelectedSubject(sub)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold border-2 transition-all ${selectedSubject === sub ? 'bg-orange-600 text-white border-orange-600 shadow-lg scale-105' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-white'}`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
                    <BarChart3 className="text-orange-600" size={24} />
                    مقارنة أداء الأقسام في مادة {selectedSubject}
                  </h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={crossSectionData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="section" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 800 }} />
                        <YAxis domain={[0, 20]} axisLine={false} tickLine={false} />
                        <RechartsTooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }} />
                        <Legend verticalAlign="top" align="right" height={36}/>
                        <ReferenceLine y={levelSubjectAverage} label={{ position: 'right', value: 'متوسط المستوى', fill: '#f97316', fontSize: 10, fontWeight: 900 }} stroke="#f97316" strokeDasharray="5 5" />
                        <Bar dataKey="average" name="متوسط المادة" radius={[8, 8, 0, 0]}>
                          {crossSectionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.average >= levelSubjectAverage ? '#f97316' : '#9ca3af'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white p-8 rounded-3xl shadow-xl">
                    <Trophy className="text-yellow-400 mb-4" size={32} />
                    <h4 className="text-lg font-black mb-1">القسم المتصدر</h4>
                    {crossSectionData.length > 0 && (
                      <>
                        <p className="text-3xl font-black mb-3">{[...crossSectionData].sort((a,b) => b.average - a.average)[0].section}</p>
                        <p className="text-xs text-blue-100 leading-relaxed font-bold opacity-80 italic">
                          حقق هذا القسم أعلى متوسط في {selectedSubject} بمعدل {[...crossSectionData].sort((a,b) => b.average - a.average)[0].average}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                    <h4 className="text-sm font-black text-gray-400 uppercase mb-4 tracking-widest">تحليل الفجوة</h4>
                    <div className="space-y-3">
                      {crossSectionData.map((item, idx) => {
                        const diff = item.average - levelSubjectAverage;
                        return (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <span className="text-xs font-black text-gray-700">{item.section}</span>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${diff >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {diff >= 0 ? '+' : ''}{diff.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {compSubMode === 'matrix' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h3 className="text-xl font-black text-gray-800 flex items-center gap-3">
                  <Grid3X3 className="text-orange-600" size={24} />
                  مصفوفة الأداء الحرارية (مقارنة شاملة)
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-100 rounded"></div> <span className="text-[10px] font-bold text-gray-400">دون 10</span>
                  <div className="w-3 h-3 bg-orange-100 rounded"></div> <span className="text-[10px] font-bold text-gray-400">10-12</span>
                  <div className="w-3 h-3 bg-green-100 rounded"></div> <span className="text-[10px] font-bold text-gray-400">12+</span>
                </div>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-inner">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-4 border-b border-gray-100 text-right text-xs font-black text-gray-400">المادة / القسم</th>
                      {sections.map(sec => (
                        <th key={sec} className="p-4 border-b border-gray-100 text-xs font-black text-gray-900">قسم {sec}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {performanceMatrix.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-all">
                        <td className="p-4 border-b border-gray-100 text-right text-[11px] font-black text-gray-700 bg-gray-50/30">{row.subject}</td>
                        {sections.map(sec => {
                          const val = row[sec];
                          const colorClass = val < 10 ? 'bg-red-100 text-red-700' : val < 12 ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700';
                          return (
                            <td key={sec} className={`p-4 border border-gray-100 text-xs font-black ${colorClass}`}>
                              {val.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-start gap-3">
                <Zap size={18} className="text-blue-600 mt-1" />
                <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                  هذه المصفوفة تسمح لك باكتشاف الأنماط فوراً. الألوان المحمرة توضح المواد أو الأقسام التي تحتاج لتدخل عاجل، بينما توضح الخضراء مراكز التميز في هذا المستوى التعليمي.
                </p>
              </div>
            </div>
          )}

          {compSubMode === 'consistency' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
                    <Activity className="text-blue-600" size={24} />
                    تحليل تذبذب النتائج (معامل الاختلاف CV)
                  </h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={crossSectionData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="section" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 900 }} />
                        <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '15px' }} />
                        <Bar dataKey="cv" name="معامل التذبذب %" radius={[0, 8, 8, 0]}>
                          {crossSectionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.cv > 30 ? '#ef4444' : entry.cv > 20 ? '#f59e0b' : '#3b82f6'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex justify-between text-[10px] font-black">
                    <span className="text-blue-600">ثبات عالٍ (أقل من 20%)</span>
                    <span className="text-orange-500">تذبذب متوسط (20-30%)</span>
                    <span className="text-red-500">تذبذب حاد (فوق 30%)</span>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-3">
                    <AlertTriangle className="text-orange-500" size={20} />
                    لماذا يهمنا "ثبات النتائج"؟
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                      <p className="text-xs font-black text-orange-900 mb-1">القسم المتذبذب حاداً (Red):</p>
                      <p className="text-[10px] text-orange-700 leading-relaxed font-bold">
                        يعني وجود تفاوت صارخ بين تلاميذ القسم (نخبة متفوقة جداً مقابل فئة متعثرة جداً). يحتاج هذا القسم إلى "تعليم متمايز" (Differentiated Instruction).
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <p className="text-xs font-black text-blue-900 mb-1">القسم الثابت (Blue):</p>
                      <p className="text-[10px] text-blue-700 leading-relaxed font-bold">
                        يعني تقارب مستويات التلاميذ. إذا كان المتوسط عالياً، فالقسم متفوق ككتلة واحدة، وإذا كان منخفضاً فالقسم كله يحتاج لدعم جماعي.
                      </p>
                    </div>
                    <div className="pt-4 border-t flex flex-col items-center">
                       <p className="text-[10px] text-gray-400 font-bold mb-4 uppercase">معدل التذبذب في مادة {selectedSubject}</p>
                       <div className="flex gap-1">
                          {crossSectionData.map(d => (
                             <div key={d.section} className="flex flex-col items-center">
                                <div className="w-8 bg-gray-100 rounded-t-lg relative" style={{ height: '60px' }}>
                                   <div className={`absolute bottom-0 w-full rounded-t-lg ${d.cv > 30 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ height: `${d.cv}%` }}></div>
                                </div>
                                <span className="text-[8px] font-bold mt-1">{d.section}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubjectAnalysis;
