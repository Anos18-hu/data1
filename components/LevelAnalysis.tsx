
import React, { useMemo } from 'react';
import { Student } from '../types';
import { calculateAverage, exportToExcel } from '../utils/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, Award, AlertCircle, Download, Printer, Percent, BookOpen, Layers, BarChart3 } from 'lucide-react';

interface LevelAnalysisProps {
  students: Student[];
  subjects: string[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#2563eb', '#22c55e', '#16a34a', '#15803d'];

const LEVELS_ORDER = [
  'السنة الأولى متوسط',
  'السنة الثانية متوسط',
  'السنة الثالثة متوسط',
  'السنة الرابعة متوسط'
];

const LevelAnalysis: React.FC<LevelAnalysisProps> = ({ students, subjects }) => {
  
  const stats = useMemo(() => {
    // تحديد مفتاح العمود الأخير (المعدل الفصلي)
    const averageKey = subjects.length > 0 ? subjects[subjects.length - 1] : '';

    // استخدام القيمة المباشرة من العمود الأخير كمعدل للتلميذ
    const studentAverages = students.map(s => {
      const val = s.grades[averageKey];
      return typeof val === 'number' ? val : 0;
    });

    const totalStudents = students.length;
    const globalAverage = calculateAverage(studentAverages);
    const passedCount = studentAverages.filter(avg => avg >= 10).length;
    const failedCount = totalStudents - passedCount;
    const successPercentage = totalStudents > 0 ? (passedCount / totalStudents) * 100 : 0;

    // توزيع المعدلات العام (للمخطط البياني)
    const distribution = [
      { name: 'اقل من 8', value: studentAverages.filter(v => v < 8).length },
      { name: '8.00-8.99', value: studentAverages.filter(v => v >= 8 && v < 9).length },
      { name: '9.00-9.99', value: studentAverages.filter(v => v >= 9 && v < 10).length },
      { name: '10.00-11.99', value: studentAverages.filter(v => v >= 10 && v < 12).length },
      { name: '12.00-13.99', value: studentAverages.filter(v => v >= 12 && v < 14).length },
      { name: '14.00-15.99', value: studentAverages.filter(v => v >= 14 && v < 16).length },
      { name: '16.00-17.99', value: studentAverages.filter(v => v >= 16 && v < 18).length },
      { name: '18.00 فما فوق', value: studentAverages.filter(v => v >= 18).length },
    ];

    const levelsSummary = LEVELS_ORDER.map(levelName => {
      const levelStudents = students.filter(s => s.level === levelName);
      
      // الحصول على المعدلات لهذا المستوى من العمود الأخير
      const levelAverages = levelStudents.map(s => {
        const val = s.grades[averageKey];
        return typeof val === 'number' ? val : 0;
      });

      const females = levelStudents.filter(s => s.gender === 'أنثى').length;
      const amazigh = levelStudents.filter(s => (s.grades['اللغة الأمازيغية'] ?? 0) > 0).length;
      const art = levelStudents.filter(s => (s.grades['التربية التشكيلية'] ?? 0) > 0).length;
      const music = levelStudents.filter(s => (s.grades['التربية الموسيقية'] ?? 0) > 0).length;
      
      const passed = levelAverages.filter(avg => avg >= 10).length;

      // توزيع المعدلات لهذا المستوى تحديداً (مطابق للفئات المطلوبة)
      const levelDistribution = {
        below8: levelAverages.filter(v => v < 8).length,
        v8to9: levelAverages.filter(v => v >= 8 && v < 9).length,
        v9to10: levelAverages.filter(v => v >= 9 && v < 10).length,
        v10to12: levelAverages.filter(v => v >= 10 && v < 12).length,
        v12to14: levelAverages.filter(v => v >= 12 && v < 14).length,
        v14to16: levelAverages.filter(v => v >= 14 && v < 16).length,
        v16to18: levelAverages.filter(v => v >= 16 && v < 18).length,
        above18: levelAverages.filter(v => v >= 18).length,
      };

      return {
        name: levelName,
        total: levelStudents.length,
        females,
        amazigh,
        art,
        music,
        passed,
        distribution: levelDistribution
      };
    }).filter(l => l.total > 0);

    const grandTotals = levelsSummary.reduce((acc, curr) => ({
      total: acc.total + curr.total,
      females: acc.females + curr.females,
      amazigh: acc.amazigh + curr.amazigh,
      art: acc.art + curr.art,
      music: acc.music + curr.music,
      passed: acc.passed + curr.passed,
      distribution: {
        below8: acc.distribution.below8 + curr.distribution.below8,
        v8to9: acc.distribution.v8to9 + curr.distribution.v8to9,
        v9to10: acc.distribution.v9to10 + curr.distribution.v9to10,
        v10to12: acc.distribution.v10to12 + curr.distribution.v10to12,
        v12to14: acc.distribution.v12to14 + curr.distribution.v12to14,
        v14to16: acc.distribution.v14to16 + curr.distribution.v14to16,
        v16to18: acc.distribution.v16to18 + curr.distribution.v16to18,
        above18: acc.distribution.above18 + curr.distribution.above18,
      }
    }), { 
      total: 0, females: 0, amazigh: 0, art: 0, music: 0, passed: 0,
      distribution: { below8: 0, v8to9: 0, v9to10: 0, v10to12: 0, v12to14: 0, v14to16: 0, v16to18: 0, above18: 0 }
    });

    const honorRoll = [...students]
      .map(s => {
        const val = s.grades[averageKey];
        const avg = typeof val === 'number' ? val : 0;
        return { name: s.name, average: avg, level: s.level };
      })
      .sort((a, b) => b.average - a.average)
      .slice(0, 10);

    return {
      totalStudents, globalAverage, passedCount, failedCount, successPercentage,
      distribution, levelsSummary, grandTotals, honorRoll
    };
  }, [students, subjects]);

  const handleExportSummary = () => {
    const data = stats.levelsSummary.map(l => ({
      'المستوى التعليمي': l.name,
      'العدد الإجمالي للتلاميذ': l.total,
      'منهم الإناث': l.females,
      'يدرسون الأمازيغية': l.amazigh,
      'يدرسون التشكيلية': l.art,
      'يدرسون الموسيقية': l.music,
      'الناجحون (≥ 10)': l.passed
    }));
    data.push({
      'المستوى التعليمي': 'المجموع الكلي',
      'العدد الإجمالي للتلاميذ': stats.grandTotals.total,
      'منهم الإناث': stats.grandTotals.females,
      'يدرسون الأمازيغية': stats.grandTotals.amazigh,
      'يدرسون التشكيلية': stats.grandTotals.art,
      'يدرسون الموسيقية': stats.grandTotals.music,
      'الناجحون (≥ 10)': stats.grandTotals.passed
    });
    exportToExcel(data, 'ملخص_النتائج_حسب_المستوى', 'ملخص نتائج المستويات');
  };

  const handleExportDistribution = () => {
    const data = stats.levelsSummary.map(l => ({
      'المستوى التعليمي': l.name,
      'اقل من 8': l.distribution.below8,
      '8.00-8.99': l.distribution.v8to9,
      '9.00-9.99': l.distribution.v9to10,
      '10.00-11.99': l.distribution.v10to12,
      '12.00-13.99': l.distribution.v12to14,
      '14.00-15.99': l.distribution.v14to16,
      '16.00-17.99': l.distribution.v16to18,
      '18.00 فما فوق': l.distribution.above18
    }));
    data.push({
      'المستوى التعليمي': 'المجموع الكلي',
      'اقل من 8': stats.grandTotals.distribution.below8,
      '8.00-8.99': stats.grandTotals.distribution.v8to9,
      '9.00-9.99': stats.grandTotals.distribution.v9to10,
      '10.00-11.99': stats.grandTotals.distribution.v10to12,
      '12.00-13.99': stats.grandTotals.distribution.v12to14,
      '14.00-15.99': stats.grandTotals.distribution.v14to16,
      '16.00-17.99': stats.grandTotals.distribution.v16to18,
      '18.00 فما فوق': stats.grandTotals.distribution.above18
    });
    exportToExcel(data, 'توزيع_المعدلات_حسب_المستوى', 'توزيع معدلات المستويات');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. ملخص النتائج العام */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Layers size={24} className="text-blue-600" />
            ملخص النتائج حسب المستوى التعليمي
          </h3>
          <div className="flex gap-2">
            <button onClick={handleExportSummary} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm shadow flex items-center gap-2">
              <Download size={16} /> تصدير Excel
            </button>
            <button onClick={() => window.print()} className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm shadow flex items-center gap-2">
              <Printer size={16} /> طباعة
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-900 print:bg-gray-200 print:text-black font-bold text-xs">
                <th className="p-4 border border-gray-300 print:border-black w-1/4">المستوى التعليمي</th>
                <th className="p-4 border border-gray-300 print:border-black">العدد الإجمالي للتلاميذ</th>
                <th className="p-4 border border-gray-300 print:border-black">منهم الإناث</th>
                <th className="p-4 border border-gray-300 print:border-black">يدرسون الأمازيغية</th>
                <th className="p-4 border border-gray-300 print:border-black">يدرسون التشكيلية</th>
                <th className="p-4 border border-gray-300 print:border-black">يدرسون الموسيقية</th>
                <th className="p-4 border border-gray-300 print:border-black bg-orange-50 print:bg-gray-100">المتحصلين على معدل ≥ 10</th>
              </tr>
            </thead>
            <tbody>
              {stats.levelsSummary.map((level, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors text-sm">
                  <td className="p-4 border border-gray-300 print:border-black font-bold text-right pr-6">{level.name}</td>
                  <td className="p-4 border border-gray-300 print:border-black">{level.total}</td>
                  <td className="p-4 border border-gray-300 print:border-black">{level.females}</td>
                  <td className="p-4 border border-gray-300 print:border-black">{level.amazigh}</td>
                  <td className="p-4 border border-gray-300 print:border-black">{level.art}</td>
                  <td className="p-4 border border-gray-300 print:border-black">{level.music}</td>
                  <td className="p-4 border border-gray-300 print:border-black font-bold text-blue-700 bg-orange-50/30">{level.passed}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-200 print:bg-gray-300 font-extrabold text-red-600 text-sm">
                <td className="p-4 border border-gray-300 print:border-black text-right pr-6">المجموع</td>
                <td className="p-4 border border-gray-300 print:border-black">{stats.grandTotals.total}</td>
                <td className="p-4 border border-gray-300 print:border-black">{stats.grandTotals.females}</td>
                <td className="p-4 border border-gray-300 print:border-black">{stats.grandTotals.amazigh}</td>
                <td className="p-4 border border-gray-300 print:border-black">{stats.grandTotals.art}</td>
                <td className="p-4 border border-gray-300 print:border-black">{stats.grandTotals.music}</td>
                <td className="p-4 border border-gray-300 print:border-black text-blue-900 bg-orange-100">{stats.grandTotals.passed}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 2. جدول توزيع المعدلات حسب المستوى بناءً على المعدل الفصلي المستخرج مباشرة */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 size={24} className="text-orange-600" />
            توزيع المعدلات حسب المستويات التعليمية (المعدل الفصلي)
          </h3>
          <button onClick={handleExportDistribution} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm shadow flex items-center gap-2">
            <Download size={16} /> تصدير Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-900 print:bg-gray-100 font-bold text-[10px]">
                <th className="p-3 border border-gray-300 print:border-black w-1/5">المستوى التعليمي</th>
                <th className="p-3 border border-gray-300 print:border-black">اقل من 8</th>
                <th className="p-3 border border-gray-300 print:border-black">8.00-8.99</th>
                <th className="p-3 border border-gray-300 print:border-black">9.00-9.99</th>
                <th className="p-3 border border-gray-300 print:border-black">10.00-11.99</th>
                <th className="p-3 border border-gray-300 print:border-black">12.00-13.99</th>
                <th className="p-3 border border-gray-300 print:border-black">14.00-15.99</th>
                <th className="p-3 border border-gray-300 print:border-black">16.00-17.99</th>
                <th className="p-3 border border-gray-300 print:border-black">18.00 فما فوق</th>
              </tr>
            </thead>
            <tbody>
              {stats.levelsSummary.map((level, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors text-xs`}>
                  <td className="p-3 border border-gray-300 print:border-black font-bold text-right pr-4">{level.name}</td>
                  <td className="p-3 border border-gray-300 print:border-black text-red-600 font-bold">{level.distribution.below8}</td>
                  <td className="p-3 border border-gray-300 print:border-black text-orange-600">{level.distribution.v8to9}</td>
                  <td className="p-3 border border-gray-300 print:border-black text-yellow-600">{level.distribution.v9to10}</td>
                  <td className="p-3 border border-gray-300 print:border-black text-blue-600">{level.distribution.v10to12}</td>
                  <td className="p-3 border border-gray-300 print:border-black text-blue-700">{level.distribution.v12to14}</td>
                  <td className="p-3 border border-gray-300 print:border-black text-green-600">{level.distribution.v14to16}</td>
                  <td className="p-3 border border-gray-300 print:border-black text-green-700">{level.distribution.v16to18}</td>
                  <td className="p-3 border border-gray-300 print:border-black text-green-900 font-extrabold">{level.distribution.above18}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-200 print:bg-gray-300 font-extrabold text-xs">
                <td className="p-3 border border-gray-300 print:border-black text-right pr-4">المجموع الكلي</td>
                <td className="p-3 border border-gray-300 print:border-black text-red-700">{stats.grandTotals.distribution.below8}</td>
                <td className="p-3 border border-gray-300 print:border-black">{stats.grandTotals.distribution.v8to9}</td>
                <td className="p-3 border border-gray-300 print:border-black">{stats.grandTotals.distribution.v9to10}</td>
                <td className="p-3 border border-gray-300 print:border-black text-blue-800">{stats.grandTotals.distribution.v10to12}</td>
                <td className="p-3 border border-gray-300 print:border-black">{stats.grandTotals.distribution.v12to14}</td>
                <td className="p-3 border border-gray-300 print:border-black text-green-800">{stats.grandTotals.distribution.v14to16}</td>
                <td className="p-3 border border-gray-300 print:border-black">{stats.grandTotals.distribution.v16to18}</td>
                <td className="p-3 border border-gray-300 print:border-black text-green-900">{stats.grandTotals.distribution.above18}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 3. إحصائيات عامة ومخططات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:hidden">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Users size={24} /></div>
          <div><p className="text-gray-500 text-xs">إجمالي التلاميذ</p><p className="text-2xl font-black">{stats.totalStudents}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl text-green-600"><TrendingUp size={24} /></div>
          <div><p className="text-gray-500 text-xs">المعدل العام</p><p className="text-2xl font-black">{stats.globalAverage.toFixed(2)}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-xl text-purple-600"><Award size={24} /></div>
          <div><p className="text-gray-500 text-xs">نسبة النجاح</p><p className="text-2xl font-black">{stats.successPercentage.toFixed(1)}%</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-xl text-orange-600"><Percent size={24} /></div>
          <div><p className="text-gray-500 text-xs">عدد الناجحين</p><p className="text-2xl font-black">{stats.passedCount}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-8 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />
            منحنى توزيع المعدلات العام
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.distribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 500 }} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" name="عدد التلاميذ" radius={[6, 6, 0, 0]}>
                  {stats.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Award size={20} className="text-yellow-500" />
            لوحة الشرف (أفضل 10)
          </h3>
          <div className="space-y-4">
            {stats.honorRoll.length > 0 ? stats.honorRoll.map((student, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:scale-[1.02] transition-transform cursor-default">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-yellow-400 text-white' : 
                    idx === 1 ? 'bg-gray-300 text-white' : 
                    idx === 2 ? 'bg-orange-400 text-white' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-800 truncate max-w-[120px]">{student.name}</span>
                    <span className="text-[9px] text-gray-400">{student.level}</span>
                  </div>
                </div>
                <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                  {student.average.toFixed(2)}
                </span>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-400 italic text-sm">لا توجد بيانات متاحة</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelAnalysis;
