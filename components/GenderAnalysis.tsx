
import React, { useMemo, useState } from 'react';
import { Student, SubjectStats } from '../types';
import { calculateAverage, analyzeSubject, exportToExcel } from '../utils/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Users2, TrendingUp, Download, Filter, Percent, Award, UserCheck, Table as TableIcon } from 'lucide-react';

interface GenderAnalysisProps {
  students: Student[];
  subjects: string[];
}

const LEVELS_ORDER = [
  'السنة الأولى متوسط',
  'السنة الثانية متوسط',
  'السنة الثالثة متوسط',
  'السنة الرابعة متوسط'
];

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

const GenderAnalysis: React.FC<GenderAnalysisProps> = ({ students, subjects }) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const levels = useMemo(() => Array.from(new Set(students.map(s => s.level))), [students]);

  const stats = useMemo(() => {
    const averageKey = subjects.length > 0 ? subjects[subjects.length - 1] : '';
    const filtered = selectedLevel === 'all' ? students : students.filter(s => s.level === selectedLevel);
    
    const males = filtered.filter(s => s.gender === 'ذكر');
    const females = filtered.filter(s => s.gender === 'أنثى');

    const getAvg = (list: Student[]) => {
      const avgs = list.map(s => typeof s.grades[averageKey] === 'number' ? s.grades[averageKey] : 0);
      return calculateAverage(avgs as number[]);
    };

    const maleAvg = getAvg(males);
    const femaleAvg = getAvg(females);

    const malePassCount = males.filter(s => (s.grades[averageKey] ?? 0) >= 10).length;
    const femalePassCount = females.filter(s => (s.grades[averageKey] ?? 0) >= 10).length;

    const malePassRate = males.length > 0 ? (malePassCount / males.length) * 100 : 0;
    const femalePassRate = females.length > 0 ? (femalePassCount / females.length) * 100 : 0;

    // إحصائيات توزيع الجنس حسب المستويات
    const institutionLevelBreakdown = LEVELS_ORDER.map(levelName => {
      const levelStudents = students.filter(s => s.level === levelName);
      const total = levelStudents.length;
      
      const levelFemales = levelStudents.filter(s => s.gender === 'أنثى');
      const levelMales = levelStudents.filter(s => s.gender === 'ذكر');
      
      const fCount = levelFemales.length;
      const mCount = levelMales.length;

      const fPassed = levelFemales.filter(s => (s.grades[averageKey] ?? 0) >= 10).length;
      const mPassed = levelMales.filter(s => (s.grades[averageKey] ?? 0) >= 10).length;
      
      return {
        levelName,
        femaleCount: fCount,
        femalePerc: total > 0 ? (fCount / total) * 100 : 0,
        femalePassed: fPassed,
        femalePassedPerc: fCount > 0 ? (fPassed / fCount) * 100 : 0,
        maleCount: mCount,
        malePerc: total > 0 ? (mCount / total) * 100 : 0,
        malePassed: mPassed,
        malePassedPerc: mCount > 0 ? (mPassed / mCount) * 100 : 0,
        total
      };
    }).filter(l => l.total > 0);

    const grandTotalStudents = students.length;
    const grandFemales = students.filter(s => s.gender === 'أنثى');
    const grandMales = students.filter(s => s.gender === 'ذكر');

    const grandFPassed = grandFemales.filter(s => (s.grades[averageKey] ?? 0) >= 10).length;
    const grandMPassed = grandMales.filter(s => (s.grades[averageKey] ?? 0) >= 10).length;

    const institutionTotals = {
      femaleCount: grandFemales.length,
      femalePerc: grandTotalStudents > 0 ? (grandFemales.length / grandTotalStudents) * 100 : 0,
      femalePassed: grandFPassed,
      femalePassedPerc: grandFemales.length > 0 ? (grandFPassed / grandFemales.length) * 100 : 0,
      maleCount: grandMales.length,
      malePerc: grandTotalStudents > 0 ? (grandMales.length / grandTotalStudents) * 100 : 0,
      malePassed: grandMPassed,
      malePassedPerc: grandMales.length > 0 ? (grandMPassed / grandMales.length) * 100 : 0,
      total: grandTotalStudents
    };

    // إحصائيات المواد المقارنة
    const subjectComparison = OFFICIAL_ORDER.map(offName => {
      const rawKey = matchSubject(offName, subjects);
      if (!rawKey) return null;

      const maleStats = analyzeSubject(males, rawKey, 0);
      const femaleStats = analyzeSubject(females, rawKey, 0);

      return {
        name: offName,
        maleAvg: maleStats.average,
        femaleAvg: femaleStats.average,
        malePassCount: maleStats.countAbove10,
        femalePassCount: femaleStats.countAbove10,
        malePassRate: maleStats.passPercentage,
        femalePassRate: femaleStats.passPercentage,
        gap: maleStats.average - femaleStats.average
      };
    }).filter(Boolean);

    return {
      maleCount: males.length,
      femaleCount: females.length,
      maleAvg,
      femaleAvg,
      malePassRate,
      femalePassRate,
      subjectComparison,
      institutionLevelBreakdown,
      institutionTotals
    };
  }, [students, selectedLevel, subjects]);

  const handleExport = () => {
    const data = stats.subjectComparison.map(s => ({
      'المادة': s!.name,
      'متوسط الذكور': s!.maleAvg.toFixed(2),
      'متوسط الإناث': s!.femaleAvg.toFixed(2),
      'عدد ذكور ≥ 10': s!.malePassCount,
      'عدد إناث ≥ 10': s!.femalePassCount,
      'نسبة نجاح الذكور': `${s!.malePassRate.toFixed(1)}%`,
      'نسبة نجاح الإناث': `${s!.femalePassRate.toFixed(1)}%`,
      'الفجوة': s!.gap.toFixed(2)
    }));
    exportToExcel(data, 'تحليل_النتائج_حسب_الجنس', 'تحليل النتائج حسب الجنس');
  };

  const handleExportBreakdown = () => {
    const data = stats.institutionLevelBreakdown.map(l => ({
      'المستوى التعليمي': l.levelName,
      'إناث (العدد)': l.femaleCount,
      'إناث (%)': l.femalePerc.toFixed(1),
      'إناث ناجحات (≥ 10)': l.femalePassed,
      'إناث ناجحات (%)': l.femalePassedPerc.toFixed(1),
      'ذكور (العدد)': l.maleCount,
      'ذكور (%)': l.malePerc.toFixed(1),
      'ذكور ناجحون (≥ 10)': l.malePassed,
      'ذكور ناجحون (%)': l.malePassedPerc.toFixed(1)
    }));
    data.push({
      'المستوى التعليمي': 'المجموع الكلي',
      'إناث (العدد)': stats.institutionTotals.femaleCount,
      'إناث (%)': stats.institutionTotals.femalePerc.toFixed(1),
      'إناث ناجحات (≥ 10)': stats.institutionTotals.femalePassed,
      'إناث ناجحات (%)': stats.institutionTotals.femalePassedPerc.toFixed(1),
      'ذكور (العدد)': stats.institutionTotals.maleCount,
      'ذكور (%)': stats.institutionTotals.malePerc.toFixed(1),
      'ذكور ناجحون (≥ 10)': stats.institutionTotals.malePassed,
      'ذكور ناجحون (%)': stats.institutionTotals.malePassedPerc.toFixed(1)
    });
    exportToExcel(data, 'توزيع_الجنس_والنجاح_حسب_المستوى', 'توزيع الجنس بالمؤسسة');
  };

  const chartData = [
    { name: 'الذكور', العدد: stats.maleCount, المعدل: stats.maleAvg.toFixed(2), النجاح: stats.malePassRate.toFixed(1) },
    { name: 'الإناث', العدد: stats.femaleCount, المعدل: stats.femaleAvg.toFixed(2), النجاح: stats.femalePassRate.toFixed(1) },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* الفلتر */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 print:hidden">
        <Filter className="text-pink-600" size={20} />
        <span className="font-bold text-sm">تصفية نتائج الأداء حسب المستوى:</span>
        <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-pink-500">
          <option value="all">كل المستويات</option>
          {levels.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* بطاقات الإحصاء المقارن */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-r-4 border-blue-500 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-xs mb-1">توزيع العدد (للمستوى المختار)</p>
            <div className="flex gap-4">
              <div><span className="text-2xl font-black text-blue-600">{stats.maleCount}</span> <span className="text-[10px] text-gray-400">ذكر</span></div>
              <div><span className="text-2xl font-black text-pink-600">{stats.femaleCount}</span> <span className="text-[10px] text-gray-400">أنثى</span></div>
            </div>
          </div>
          <Users2 className="text-gray-200" size={40} />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-r-4 border-purple-500 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-xs mb-1">متوسط المعدل الفصلي</p>
            <div className="flex gap-4">
              <div className="text-center"><p className="text-lg font-bold text-blue-700">{stats.maleAvg.toFixed(2)}</p><p className="text-[9px] text-gray-400">ذكور</p></div>
              <div className="text-center"><p className="text-lg font-bold text-pink-700">{stats.femaleAvg.toFixed(2)}</p><p className="text-[9px] text-gray-400">إناث</p></div>
            </div>
          </div>
          <TrendingUp className="text-gray-200" size={40} />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-r-4 border-green-500 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-xs mb-1">نسبة النجاح العامة</p>
            <div className="flex gap-4">
              <div className="text-center"><p className="text-lg font-bold text-blue-800">{stats.malePassRate.toFixed(1)}%</p><p className="text-[9px] text-gray-400">ذكور</p></div>
              <div className="text-center"><p className="text-lg font-bold text-pink-800">{stats.femalePassRate.toFixed(1)}%</p><p className="text-[9px] text-gray-400">إناث</p></div>
            </div>
          </div>
          <Percent className="text-gray-200" size={40} />
        </div>
      </div>

      {/* جدول الإحصاءات العامة المحدث */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <TableIcon size={24} className="text-orange-500" />
            الإحصاءات العامة لتوزيع الجنس والنجاح بالمؤسسة
          </h3>
          <button onClick={handleExportBreakdown} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-2 shadow hover:bg-green-700">
            <Download size={16} /> تصدير Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse border border-black text-[11px]">
            <thead>
              <tr className="bg-[#fde6d2] text-gray-900 font-bold">
                <th rowSpan={2} className="p-3 border border-black w-[150px]">المستوى التعليمي</th>
                <th colSpan={4} className="p-2 border border-black bg-pink-100/50">إناث</th>
                <th colSpan={4} className="p-2 border border-black bg-blue-100/50">ذكور</th>
              </tr>
              <tr className="bg-[#fde6d2] text-gray-900 font-bold text-[10px]">
                <th className="p-2 border border-black">العدد</th>
                <th className="p-2 border border-black">%</th>
                <th className="p-2 border border-black bg-green-50">ناجحات ≥ 10</th>
                <th className="p-2 border border-black bg-green-50">% النجاح</th>
                <th className="p-2 border border-black">العدد</th>
                <th className="p-2 border border-black">%</th>
                <th className="p-2 border border-black bg-green-50">ناجحون ≥ 10</th>
                <th className="p-2 border border-black bg-green-50">% النجاح</th>
              </tr>
            </thead>
            <tbody>
              {stats.institutionLevelBreakdown.map((l, idx) => (
                <tr key={idx} className="bg-white text-gray-800 font-medium">
                  <td className="p-3 border border-black text-right pr-4 font-bold">{l.levelName}</td>
                  <td className="p-2 border border-black">{l.femaleCount}</td>
                  <td className="p-2 border border-black">{l.femalePerc.toFixed(1)}%</td>
                  <td className="p-2 border border-black bg-green-50/30 font-bold text-pink-700">{l.femalePassed}</td>
                  <td className="p-2 border border-black bg-green-50/30 font-bold text-pink-700">{l.femalePassedPerc.toFixed(1)}%</td>
                  <td className="p-2 border border-black">{l.maleCount}</td>
                  <td className="p-2 border border-black">{l.malePerc.toFixed(1)}%</td>
                  <td className="p-2 border border-black bg-green-50/30 font-bold text-blue-700">{l.malePassed}</td>
                  <td className="p-2 border border-black bg-green-50/30 font-bold text-blue-700">{l.malePassedPerc.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#fde6d2] text-gray-900 font-bold">
                <td className="p-3 border border-black text-right pr-4">المجموع الكلي</td>
                <td className="p-2 border border-black">{stats.institutionTotals.femaleCount}</td>
                <td className="p-2 border border-black">{stats.institutionTotals.femalePerc.toFixed(1)}%</td>
                <td className="p-2 border border-black font-black text-pink-800">{stats.institutionTotals.femalePassed}</td>
                <td className="p-2 border border-black font-black text-pink-800">{stats.institutionTotals.femalePassedPerc.toFixed(1)}%</td>
                <td className="p-2 border border-black">{stats.institutionTotals.maleCount}</td>
                <td className="p-2 border border-black">{stats.institutionTotals.malePerc.toFixed(1)}%</td>
                <td className="p-2 border border-black font-black text-blue-800">{stats.institutionTotals.malePassed}</td>
                <td className="p-2 border border-black font-black text-blue-800">{stats.institutionTotals.malePassedPerc.toFixed(1)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:hidden">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><Award size={20} className="text-blue-500" />مقارنة نسب النجاح والمعدلات</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="النجاح" fill="#10b981" radius={[4, 4, 0, 0]} name="نسبة النجاح %" />
                <Bar dataKey="المعدل" fill="#6366f1" radius={[4, 4, 0, 0]} name="المعدل العام" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><UserCheck size={20} className="text-pink-500" />توزيع التلاميذ حسب الجنس</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'الذكور', value: stats.maleCount },
                    { name: 'الإناث', value: stats.femaleCount }
                  ]}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#ec4899" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* جدول المقارنة التفصيلي */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h3 className="text-xl font-bold text-gray-800">مقارنة أداء الجنسين حسب المواد (للمستوى المختار)</h3>
          <button onClick={handleExport} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-2 shadow hover:bg-green-700 transition-all">
            <Download size={16} /> تصدير التقرير
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-[10px]">
            <thead>
              <tr className="bg-gray-100 text-gray-900 border-b-2 border-gray-200 font-bold">
                <th className="p-3 border text-right">المادة التعليمية</th>
                <th className="p-3 border bg-blue-50 text-blue-800">متوسط الذكور</th>
                <th className="p-3 border bg-pink-50 text-pink-800">متوسط الإناث</th>
                <th className="p-3 border bg-blue-100 text-blue-900">عدد ذكور ≥ 10</th>
                <th className="p-3 border bg-pink-100 text-pink-900">عدد إناث ≥ 10</th>
                <th className="p-3 border bg-blue-50 text-blue-800">نجاح الذكور %</th>
                <th className="p-3 border bg-pink-50 text-pink-800">نجاح الإناث %</th>
                <th className="p-3 border bg-gray-50">فجوة الأداء</th>
              </tr>
            </thead>
            <tbody>
              {stats.subjectComparison.map((s, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 border text-right font-bold">{s!.name}</td>
                  <td className="p-3 border font-medium">{s!.maleAvg.toFixed(2)}</td>
                  <td className="p-3 border font-medium">{s!.femaleAvg.toFixed(2)}</td>
                  <td className="p-3 border text-blue-700 font-bold">{s!.malePassCount}</td>
                  <td className="p-3 border text-pink-700 font-bold">{s!.femalePassCount}</td>
                  <td className="p-3 border text-blue-600 font-bold">{s!.malePassRate.toFixed(1)}%</td>
                  <td className="p-3 border text-pink-600 font-bold">{s!.femalePassRate.toFixed(1)}%</td>
                  <td className={`p-3 border font-black ${s!.gap > 0 ? 'text-blue-600' : 'text-pink-600'}`}>
                    {s!.gap > 0 ? `+${s!.gap.toFixed(2)}` : s!.gap.toFixed(2)}
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

export default GenderAnalysis;
