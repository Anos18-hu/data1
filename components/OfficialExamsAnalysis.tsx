
import React, { useMemo } from 'react';
import { Student } from '../types';
import { calculateAverage, exportToExcel } from '../utils/analytics';
import { ClipboardCheck, TrendingUp, Users, Award, Percent, Download, Printer, AlertTriangle, CheckCircle2, BarChart3, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface OfficialExamsAnalysisProps {
  students: Student[];
  subjects: string[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#2563eb', '#22c55e', '#16a34a', '#15803d'];

const OfficialExamsAnalysis: React.FC<OfficialExamsAnalysisProps> = ({ students, subjects }) => {
  const averageKey = subjects.length > 0 ? subjects[subjects.length - 1] : '';

  const bemCandidates = useMemo(() => {
    return students.filter(s => s.level.includes('الرابعة') || s.level.includes('4'));
  }, [students]);

  const borderlineStudents = useMemo(() => {
    return bemCandidates.filter(s => {
      const avg = s.grades[averageKey] || 0;
      return avg >= 9 && avg < 10;
    });
  }, [bemCandidates, averageKey]);

  const stats = useMemo(() => {
    const total = bemCandidates.length;
    if (total === 0) return null;

    const avgs = bemCandidates.map(s => typeof s.grades[averageKey] === 'number' ? s.grades[averageKey] : 0);
    
    const passed = avgs.filter(v => v >= 10).length;
    const borderline = avgs.filter(v => v >= 9 && v < 10).length;
    const successRate = (passed / total) * 100;
    const potentialRate = ((passed + borderline) / total) * 100;

    const highPerformers = bemCandidates
      .map(s => ({ name: s.name, average: typeof s.grades[averageKey] === 'number' ? s.grades[averageKey] : 0, section: s.section }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 15);

    const distribution = [
      { name: 'اقل من 8', value: avgs.filter(v => v < 8).length },
      { name: '8.00-8.99', value: avgs.filter(v => v >= 8 && v < 9).length },
      { name: '9.00-9.99', value: avgs.filter(v => v >= 9 && v < 10).length },
      { name: '10.00-11.99', value: avgs.filter(v => v >= 10 && v < 12).length },
      { name: '12.00-13.99', value: avgs.filter(v => v >= 12 && v < 14).length },
      { name: '14.00-15.99', value: avgs.filter(v => v >= 14 && v < 16).length },
      { name: '16.00 فما فوق', value: avgs.filter(v => v >= 16).length },
    ];

    return { total, passed, borderline, successRate, potentialRate, distribution, highPerformers };
  }, [bemCandidates, averageKey]);

  const handleExportCandidates = () => {
    if (!stats) return;
    const data = bemCandidates.map(s => ({
      'الاسم واللقب': s.name,
      'القسم': s.section,
      'المعدل الفصلي': (s.grades[averageKey] || 0).toFixed(2),
      'الوضعية': (s.grades[averageKey] || 0) >= 10 ? 'ناجح' : (s.grades[averageKey] || 0) >= 9 ? 'قريب جداً (استدراك ممكن)' : 'متعثر'
    })).sort((a, b) => parseFloat(b['المعدل الفصلي']) - parseFloat(a['المعدل الفصلي']));
    exportToExcel(data, 'قائمة_مترشحي_BEM_2025', 'قائمة المترشحين BEM');
  };

  const handleExportStats = () => {
    if (!stats) return;
    const summaryData = [
      { 'البيان': 'إجمالي المترشحين', 'القيمة': stats.total },
      { 'البيان': 'الناجحون حالياً', 'القيمة': stats.passed },
      { 'البيان': 'فئة الاستدراك (9-10)', 'القيمة': stats.borderline },
      { 'البيان': 'نسبة النجاح الحالية', 'القيمة': `${stats.successRate.toFixed(1)}%` },
      { 'البيان': 'نسبة النجاح الممكنة', 'القيمة': `${stats.potentialRate.toFixed(1)}%` },
    ];
    
    const distributionData = stats.distribution.map(d => ({
      'الفئة': d.name,
      'عدد التلاميذ': d.value,
      'النسبة المئوية': `${((d.value / stats.total) * 100).toFixed(1)}%`
    }));

    exportToExcel([...summaryData, { 'البيان': '', 'القيمة': '' }, ...distributionData], 'إحصائيات_BEM_2025', 'إحصائيات BEM');
  };

  const handleExportBorderline = () => {
    const data = borderlineStudents.map(s => {
      const avg = s.grades[averageKey] || 0;
      return {
        'الاسم واللقب': s.name,
        'القسم': s.section,
        'المعدل الحالي': avg.toFixed(2),
        'النقص عن المعدل 10': (10 - avg).toFixed(2)
      };
    });
    exportToExcel(data, 'قائمة_الفرصة_الأخيرة_BEM', 'فئة الاستدراك');
  };

  if (bemCandidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-4">
        <AlertTriangle size={64} className="text-orange-300" />
        <p className="text-xl font-bold">لا توجد بيانات لمستوى السنة الرابعة متوسط (BEM)</p>
        <p className="text-sm">يرجى رفع ملفات كشوف نقاط السنة الرابعة لتفعيل هذا التبويب.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="text-indigo-600" size={32} />
            <div>
              <h3 className="text-xl font-bold text-gray-800">توقعات شهادة التعليم المتوسط</h3>
              <p className="text-xs text-gray-500">إحصائيات خاصة بمترشحي السنة الرابعة متوسط للدورة الحالية</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <button 
              onClick={handleExportCandidates} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow hover:bg-blue-700 transition-all"
              title="تصدير قائمة التلاميذ مع معدلاتهم"
            >
              <Download size={14} /> تصدير القائمة
            </button>
            <button 
              onClick={handleExportStats} 
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow hover:bg-indigo-700 transition-all"
              title="تصدير الأرقام الإحصائية والتوزيع"
            >
              <FileSpreadsheet size={14} /> تصدير الإحصائيات
            </button>
            <button 
              onClick={() => window.print()} 
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg text-xs font-bold shadow hover:bg-yellow-600 transition-all"
            >
              <Printer size={14} /> طباعة التقرير
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 transition-transform hover:scale-[1.02]">
            <Users className="text-indigo-600 mb-2" size={24} />
            <p className="text-gray-600 text-xs">إجمالي المترشحين</p>
            <h4 className="text-3xl font-black text-indigo-900">{stats?.total}</h4>
          </div>
          <div className="bg-green-50 p-6 rounded-2xl border border-green-100 transition-transform hover:scale-[1.02]">
            <CheckCircle2 className="text-green-600 mb-2" size={24} />
            <p className="text-gray-600 text-xs">الناجحون حالياً</p>
            <h4 className="text-3xl font-black text-green-900">{stats?.passed}</h4>
          </div>
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 transition-transform hover:scale-[1.02]">
            <TrendingUp className="text-blue-600 mb-2" size={24} />
            <p className="text-gray-600 text-xs">نسبة النجاح الحالية</p>
            <h4 className="text-3xl font-black text-blue-900">{stats?.successRate.toFixed(1)}%</h4>
          </div>
          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 transition-transform hover:scale-[1.02]">
            <Percent className="text-orange-600 mb-2" size={24} />
            <p className="text-gray-600 text-xs">النجاح الممكن (بمعدل 9)</p>
            <h4 className="text-3xl font-black text-orange-900">{stats?.potentialRate.toFixed(1)}%</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="text-indigo-600" size={20} />
              منحنى توزيع المعدلات للمترشحين
            </h4>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.distribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stats?.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Award className="text-yellow-500" size={20} />
            نخبة المترشحين (Top 15)
          </h4>
          <div className="space-y-3 overflow-y-auto max-h-[350px] custom-scrollbar pr-1">
            {stats?.highPerformers.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-indigo-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${idx < 3 ? 'bg-yellow-400 text-white shadow-sm' : 'bg-indigo-100 text-indigo-600'}`}>
                    {idx + 1}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold truncate max-w-[120px]">{s.name}</span>
                    <span className="text-[9px] text-gray-400 font-medium">قسم: {s.section}</span>
                  </div>
                </div>
                <span className="text-xs font-black text-indigo-600 bg-white border border-indigo-100 px-3 py-1 rounded-lg">
                  {s.average.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-lg font-bold flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={20} />
            فئة "الفرصة الأخيرة" (بين 9.00 و 9.99)
          </h4>
          {borderlineStudents.length > 0 && (
            <button 
              onClick={handleExportBorderline} 
              className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-[10px] font-bold hover:bg-orange-200 transition-all print:hidden"
            >
              <Download size={12} /> تصدير الفئة
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="bg-orange-50 text-orange-900 font-bold border-b border-orange-200">
                <th className="p-3">الاسم واللقب</th>
                <th className="p-3 text-center">القسم</th>
                <th className="p-3 text-center">المعدل الحالي</th>
                <th className="p-3 text-center">النقص عن 10.00</th>
              </tr>
            </thead>
            <tbody>
              {borderlineStudents.map(s => {
                const avg = s.grades[averageKey] || 0;
                return (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-orange-50/20 transition-colors">
                    <td className="p-3 font-medium">{s.name}</td>
                    <td className="p-3 text-center">{s.section}</td>
                    <td className="p-3 text-center font-bold text-orange-600">{avg.toFixed(2)}</td>
                    <td className="p-3 text-center text-red-500 font-mono">{(10 - avg).toFixed(2)}</td>
                  </tr>
                );
              })}
              {borderlineStudents.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400 italic">لا يوجد تلاميذ في هذه الفئة حالياً.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OfficialExamsAnalysis;
