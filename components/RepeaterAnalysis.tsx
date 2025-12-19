import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { calculateAverage, exportToExcel } from '../utils/analytics';
import { Download, Printer, UserX, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface RepeaterAnalysisProps {
  students: Student[];
  subjects: string[];
}

const RepeaterAnalysis: React.FC<RepeaterAnalysisProps> = ({ students, subjects }) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');

  const levels = useMemo(() => Array.from(new Set(students.map(s => s.level))), [students]);
  const sections = useMemo(() => {
    const relevantStudents = selectedLevel === 'all' ? students : students.filter(s => s.level === selectedLevel);
    return Array.from(new Set(relevantStudents.map(s => s.section))).sort();
  }, [students, selectedLevel]);

  const analysisData = useMemo(() => {
    const repeaters = students.filter(s => {
      const isRep = s.isRepeater;
      const levelMatch = selectedLevel === 'all' || s.level === selectedLevel;
      const sectionMatch = selectedSection === 'all' || s.section === selectedSection;
      return isRep && levelMatch && sectionMatch;
    }).map(s => {
      const grades = Object.values(s.grades).filter((g): g is number => typeof g === 'number');
      const average = calculateAverage(grades);
      return { ...s, average, isPassingNow: average >= 10 };
    }).sort((a, b) => a.average - b.average);

    const totalRepeaters = repeaters.length;
    const passingRepeaters = repeaters.filter(s => s.isPassingNow).length;
    const improvementRate = totalRepeaters > 0 ? (passingRepeaters / totalRepeaters) * 100 : 0;

    return { repeaters, totalRepeaters, passingRepeaters, failingRepeaters: totalRepeaters - passingRepeaters, improvementRate };
  }, [students, selectedLevel, selectedSection]);

  const chartData = [
    { name: 'تحسن', value: analysisData.passingRepeaters, fill: '#22c55e' },
    { name: 'تعثر', value: analysisData.failingRepeaters, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center print:hidden">
        <div className="flex items-center gap-2 text-red-600 font-bold"><Filter size={18} /><span>تصفية المعيدين:</span></div>
        <select value={selectedLevel} onChange={(e) => {setSelectedLevel(e.target.value); setSelectedSection('all');}} className="p-2 border border-gray-300 rounded-lg text-sm">
           <option value="all">كل المستويات</option>
           {levels.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="p-2 border border-gray-300 rounded-lg text-sm">
           <option value="all">كل الأقسام</option>
           {sections.map(s => <option key={s} value={s}>القسم {s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <div className="bg-white p-6 rounded-xl shadow-sm border-r-4 border-blue-500">
           <p className="text-gray-500 text-sm">عدد المعيدين</p>
           <h3 className="text-3xl font-bold">{analysisData.totalRepeaters}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-r-4 border-green-500">
           <p className="text-gray-500 text-sm">تحسنت نتائجهم</p>
           <h3 className="text-3xl font-bold text-green-600">{analysisData.passingRepeaters}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-r-4 border-red-500">
           <p className="text-gray-500 text-sm">نسبة التحسن</p>
           <h3 className="text-3xl font-bold text-red-600">{analysisData.improvementRate.toFixed(1)}%</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 print:p-0 print:border-none">
          <div className="flex justify-between items-center mb-6 print:hidden">
            <h3 className="text-xl font-bold text-gray-800">قائمة المعيدين المصفاة</h3>
            <button onClick={() => window.print()} className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm">طباعة</button>
          </div>
          <table className="w-full text-right border-collapse text-sm">
            <thead><tr className="bg-gray-100 print:bg-gray-200"><th className="p-3 border">الاسم واللقب</th><th className="p-3 border">القسم</th><th className="p-3 border">المعدل</th><th className="p-3 border">الوضعية</th></tr></thead>
            <tbody>{analysisData.repeaters.map(s => (
              <tr key={s.id} className="border-b"><td className="p-3 font-medium">{s.name}</td><td className="p-3 text-center">{s.section}</td><td className={`p-3 font-bold text-center ${s.isPassingNow ? 'text-green-600' : 'text-red-600'}`}>{s.average.toFixed(2)}</td><td className="p-3 text-center">{s.isPassingNow ? 'تحسن' : 'تعثر'}</td></tr>
            ))}</tbody>
          </table>
          {analysisData.totalRepeaters === 0 && <p className="text-center py-10 text-gray-500">لا يوجد معيدون في هذه الفئة</p>}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 print:hidden h-fit">
           <h3 className="text-lg font-bold mb-6">مؤشر التحسن</h3>
           <div className="h-[250px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
        </div>
      </div>
    </div>
  );
};

export default RepeaterAnalysis;