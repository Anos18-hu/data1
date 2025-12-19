
import React, { useMemo, useState, useEffect } from 'react';
import { Student } from '../types';
import { calculateAverage, exportToExcel, analyzeSubject } from '../utils/analytics';
import { FileText, Download, Printer, TrendingUp, Users, Award, Percent, BarChart3, Star, AlertTriangle, CheckCircle2, ClipboardList, Info, Users2, Calendar, Target, Settings, Save, Edit3, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface QuarterlyReportProps {
  students: Student[];
  subjects: string[];
}

enum SubTab {
  STATS = 'stats',
  ACTIVITIES = 'activities'
}

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6'];

const LEVELS_ORDER = [
  'السنة الأولى متوسط',
  'السنة الثانية متوسط',
  'السنة الثالثة متوسط',
  'السنة الرابعة متوسط'
];

const QuarterlyReport: React.FC<QuarterlyReportProps> = ({ students, subjects }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>(SubTab.STATS);
  const [isEditing, setIsEditing] = useState(false);
  const averageKey = subjects.length > 0 ? subjects[subjects.length - 1] : '';

  // --- إدارة بيانات الجداول التفاعلية ---
  const [interventionData, setInterventionData] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('report_intervention');
    return saved ? JSON.parse(saved) : {};
  });

  const [parentsData, setParentsData] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('report_parents');
    return saved ? JSON.parse(saved) : {};
  });

  const [pedagogicalData, setPedagogicalData] = useState<any[]>(() => {
    const saved = localStorage.getItem('report_pedagogical');
    return saved ? JSON.parse(saved) : [{}, {}, {}];
  });

  const [councilsData, setCouncilsData] = useState<any[]>(() => {
    const saved = localStorage.getItem('report_councils');
    return saved ? JSON.parse(saved) : [{}, {}, {}, {}, {}];
  });

  // حفظ البيانات عند التغيير
  useEffect(() => {
    localStorage.setItem('report_intervention', JSON.stringify(interventionData));
    localStorage.setItem('report_parents', JSON.stringify(parentsData));
    localStorage.setItem('report_pedagogical', JSON.stringify(pedagogicalData));
    localStorage.setItem('report_councils', JSON.stringify(councilsData));
  }, [interventionData, parentsData, pedagogicalData, councilsData]);

  const reportStats = useMemo(() => {
    if (students.length === 0) return null;

    const allAverages = students.map(s => s.grades[averageKey] || 0);
    const globalAvg = calculateAverage(allAverages);
    const passedCount = allAverages.filter(v => v >= 10).length;
    const successRate = (passedCount / students.length) * 100;

    const levelStats = LEVELS_ORDER.map(level => {
      const levelStudents = students.filter(s => s.level === level);
      if (levelStudents.length === 0) return null;
      const avgs = levelStudents.map(s => s.grades[averageKey] || 0);
      const passed = avgs.filter(v => v >= 10).length;
      return {
        name: level.replace('السنة ', '').replace(' متوسط', ''),
        fullName: level,
        total: levelStudents.length,
        avg: calculateAverage(avgs),
        passRate: (passed / levelStudents.length) * 100
      };
    }).filter((l): l is { name: string; fullName: string; total: number; avg: number; passRate: number } => l !== null);

    const subjectStatsList = subjects.filter(s => s !== averageKey).map(sub => {
      const stats = analyzeSubject(students, sub, 0);
      return { name: sub, passRate: stats.passPercentage };
    }).sort((a, b) => b.passRate - a.passRate);

    const topSubjects = subjectStatsList.slice(0, 3);
    const bottomSubjects = [...subjectStatsList].reverse().slice(0, 3);

    const distribution = [
      { name: 'تعثر (<10)', value: students.length - passedCount, fill: '#ef4444' },
      { name: 'نجاح (≥10)', value: passedCount, fill: '#10b981' }
    ];

    const bestLevelName = levelStats.length > 0 
      ? [...levelStats].sort((a, b) => b.passRate - a.passRate)[0].name 
      : '-';

    return { globalAvg, successRate, levelStats, topSubjects, bottomSubjects, distribution, total: students.length, bestLevelName };
  }, [students, subjects, averageKey]);

  const handleExport = () => {
    if (!reportStats) return;
    const data = reportStats.levelStats.map(l => ({
      'المستوى': l.fullName,
      'إجمالي التلاميذ': l.total,
      'متوسط المستوى': l.avg.toFixed(2),
      'نسبة النجاح': `${l.passRate.toFixed(1)}%`
    }));
    exportToExcel(data, 'التقرير_الفصلي_المؤسسة_2025', 'ملخص المستويات التعليمية');
  };

  const updateIntervention = (level: string, field: string, value: string) => {
    setInterventionData(prev => ({
      ...prev,
      [level]: { ...prev[level], [field]: value }
    }));
  };

  const updateParents = (level: string, field: string, value: string) => {
    setParentsData(prev => ({
      ...prev,
      [level]: { ...prev[level], [field]: value }
    }));
  };

  const updatePedagogical = (index: number, field: string, value: string) => {
    const newData = [...pedagogicalData];
    newData[index] = { ...newData[index], [field]: value };
    setPedagogicalData(newData);
  };

  const updateCouncils = (index: number, field: string, value: string) => {
    const newData = [...councilsData];
    newData[index] = { ...newData[index], [field]: value };
    setCouncilsData(newData);
  };

  if (!reportStats) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header for Print */}
      <div className="hidden print:block border-b-4 border-double border-black pb-4 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div className="text-right text-[10px]">
            <p>وزارة التربية الوطنية</p>
            <p>مديرية التربية لولاية ............</p>
            <p>متوسطة ...........................</p>
          </div>
          <div className="text-center font-bold">
            <p>الجمهورية الجزائرية الديمقراطية الشعبية</p>
          </div>
          <div className="text-left text-[10px]">
            <p>السنة الدراسية: 2024 / 2025</p>
            <p>الفصل الدراسي: الأول</p>
          </div>
        </div>
        <h1 className="text-2xl font-black text-center uppercase tracking-widest mt-4">تقرير النشاطات الفصلية - مرحلة التعليم المتوسط</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
              <FileText size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">مركز التقارير الفصلي</h2>
              <p className="text-xs text-gray-500">إحصائيات الأداء وسجل النشاطات المنجزة</p>
            </div>
          </div>
          <div className="flex gap-2">
            {activeSubTab === SubTab.ACTIVITIES && (
              <button 
                onClick={() => setIsEditing(!isEditing)} 
                className={`flex items-center gap-2 px-4 py-2 ${isEditing ? 'bg-red-100 text-red-600' : 'bg-blue-600 text-white'} rounded-lg text-sm font-bold shadow transition-all`}
              >
                {isEditing ? <><XCircle size={16} /> إلغاء التعديل</> : <><Edit3 size={16} /> تعديل السجل</>}
              </button>
            )}
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold shadow hover:bg-green-700">
              <Download size={16} /> تصدير البيانات
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-bold shadow hover:bg-yellow-600">
              <Printer size={16} /> طباعة التقرير
            </button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
          <button 
            onClick={() => setActiveSubTab(SubTab.STATS)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-bold transition-all ${
              activeSubTab === SubTab.STATS ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 size={18} />
            الإحصائيات العامة
          </button>
          <button 
            onClick={() => setActiveSubTab(SubTab.ACTIVITIES)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-bold transition-all ${
              activeSubTab === SubTab.ACTIVITIES ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ClipboardList size={18} />
            سجل النشاطات (الجداول الرسمية)
          </button>
        </div>
      </div>

      {activeSubTab === SubTab.STATS ? (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:hidden">
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <Users className="text-blue-600 mb-2" size={24} />
              <p className="text-gray-600 text-xs">تعداد المؤسسة</p>
              <h4 className="text-3xl font-black text-blue-900">{reportStats.total}</h4>
            </div>
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
              <TrendingUp className="text-green-600 mb-2" size={24} />
              <p className="text-gray-600 text-xs">المعدل العام للمؤسسة</p>
              <h4 className="text-3xl font-black text-green-900">{reportStats.globalAvg.toFixed(2)}</h4>
            </div>
            <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
              <Percent className="text-purple-600 mb-2" size={24} />
              <p className="text-gray-600 text-xs">نسبة النجاح العامة</p>
              <h4 className="text-3xl font-black text-purple-900">{reportStats.successRate.toFixed(1)}%</h4>
            </div>
            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
              <Star className="text-orange-600 mb-2" size={24} />
              <p className="text-gray-600 text-xs">المستوى المتصدر</p>
              <h4 className="text-xl font-black text-orange-900 truncate">
                {reportStats.bestLevelName}
              </h4>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:hidden">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="text-blue-600" size={20} />
                مقارنة نسب النجاح حسب المستويات
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportStats.levelStats}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} unit="%" />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Bar dataKey="passRate" name="نسبة النجاح" radius={[4, 4, 0, 0]}>
                      {reportStats.levelStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center">
              <h3 className="text-lg font-bold mb-6 w-full flex items-center gap-2">
                <Star className="text-yellow-500" size={20} />
                توزيع نتائج المؤسسة (كلي)
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportStats.distribution}
                      cx="50%" cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {reportStats.distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-6 mt-4">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#10b981] rounded-full"></div>
                    <span className="text-xs font-bold text-gray-600">ناجحون: {reportStats.successRate.toFixed(1)}%</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#ef4444] rounded-full"></div>
                    <span className="text-xs font-bold text-gray-600">متعثرون: {(100 - reportStats.successRate).toFixed(1)}%</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold mb-6">تفاصيل المستويات التعليمية</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-white font-bold text-sm">
                    <th className="p-4 border">المستوى التعليمي</th>
                    <th className="p-4 border">التعداد</th>
                    <th className="p-4 border">متوسط الفصل</th>
                    <th className="p-4 border">نسبة النجاح</th>
                    <th className="p-4 border">التقييم العام</th>
                  </tr>
                </thead>
                <tbody>
                  {reportStats.levelStats.map((l, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4 border font-bold text-right pr-6">{l.fullName}</td>
                      <td className="p-4 border">{l.total}</td>
                      <td className="p-4 border font-bold text-blue-600">{l.avg.toFixed(2)}</td>
                      <td className={`p-4 border font-black ${l.passRate >= 60 ? 'text-green-600' : 'text-red-600'}`}>{l.passRate.toFixed(1)}%</td>
                      <td className="p-4 border text-xs italic">
                        {l.passRate >= 70 ? 'أداء متميز' : l.passRate >= 50 ? 'أداء متوسط' : 'يتطلب خطة علاجية'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12 animate-fade-in">
          {/* 1. قطاع التدخل */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <Target size={20} />
                </div>
                <h3 className="text-lg font-black text-gray-800">قطاع التدخل</h3>
              </div>
              {isEditing && (
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-xs font-bold animate-pulse">
                  وضع التعديل نشط
                </div>
              )}
            </div>
            <div className="mb-4 bg-gray-50 p-3 rounded-lg flex items-start gap-2 border border-gray-100 text-[10px] text-gray-600 print:hidden">
              <Info size={14} className="mt-0.5 text-blue-500" />
              <span>ملاحظة: تملأ الخانات بعدد التلاميذ وليس عدد الأفواج.</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-2 border-black text-[10px]">
                <thead>
                  <tr className="bg-[#fbbf24] text-black font-bold">
                    <th className="p-2 border-2 border-black w-12">الرقم</th>
                    <th className="p-2 border-2 border-black w-24">المؤسسة</th>
                    <th className="p-2 border-2 border-black w-32">المستوى</th>
                    <th className="p-2 border-2 border-black w-24">عدد المقابلات</th>
                    <th className="p-2 border-2 border-black">الموضوع</th>
                    <th className="p-2 border-2 border-black">الهدف</th>
                    <th className="p-2 border-2 border-black">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {LEVELS_ORDER.map((level, i) => {
                    const data = interventionData[level] || {};
                    return (
                      <tr key={i} className="bg-white">
                        {i === 0 && <td rowSpan={5} className="p-2 border-2 border-black text-center font-bold bg-gray-50">1</td>}
                        {i === 0 && <td rowSpan={5} className="p-2 border-2 border-black text-center text-[10px] font-bold bg-gray-50">المتوسطة</td>}
                        <td className="p-2 border-2 border-black text-right font-bold bg-yellow-50">{level}</td>
                        <td className="p-2 border-2 border-black">
                          {isEditing ? (
                            <input 
                              type="number" 
                              className="w-full h-full p-1 bg-blue-50 focus:bg-white outline-none text-center"
                              value={data.interviewsCount || ''}
                              onChange={(e) => updateIntervention(level, 'interviewsCount', e.target.value)}
                            />
                          ) : (data.interviewsCount || '')}
                        </td>
                        <td className="p-2 border-2 border-black">
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              className="w-full h-full p-1 bg-blue-50 focus:bg-white outline-none resize-none"
                              value={data.topic || ''}
                              onChange={(e) => updateIntervention(level, 'topic', e.target.value)}
                            />
                          ) : (data.topic || '')}
                        </td>
                        <td className="p-2 border-2 border-black">
                           {isEditing ? (
                            <textarea 
                              rows={2}
                              className="w-full h-full p-1 bg-blue-50 focus:bg-white outline-none resize-none"
                              value={data.goal || ''}
                              onChange={(e) => updateIntervention(level, 'goal', e.target.value)}
                            />
                          ) : (data.goal || '')}
                        </td>
                        <td className="p-2 border-2 border-black">
                           {isEditing ? (
                            <textarea 
                              rows={2}
                              className="w-full h-full p-1 bg-blue-50 focus:bg-white outline-none resize-none"
                              value={data.actions || ''}
                              onChange={(e) => updateIntervention(level, 'actions', e.target.value)}
                            />
                          ) : (data.actions || '')}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#fbbf24] font-bold h-10">
                    <td colSpan={2} className="p-2 border-2 border-black text-center">المجموع</td>
                    <td className="p-2 border-2 border-black text-center">
                      {/* Fix: Added explicit typing for sum and item to avoid unknown type errors */}
                      {Object.values(interventionData).reduce((sum: number, item: any) => sum + (parseInt(item.interviewsCount) || 0), 0)}
                    </td>
                    <td className="p-2 border-2 border-black"></td>
                    <td className="p-2 border-2 border-black"></td>
                    <td className="p-2 border-2 border-black"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. إعلام الأولياء */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
             <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center">
                <Users2 size={20} />
              </div>
              <h3 className="text-lg font-black text-gray-800">إعلام الأولياء</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-2 border-black text-[10px]">
                <thead>
                  <tr className="bg-[#fef3c7] text-[#991b1b] font-bold">
                    <th className="p-3 border-2 border-black w-24">المؤسسة</th>
                    <th className="p-3 border-2 border-black w-32">المستوى</th>
                    <th className="p-3 border-2 border-black w-24">إعلام فردي</th>
                    <th className="p-3 border-2 border-black w-24">إعلام جماعي</th>
                    <th className="p-3 border-2 border-black">الموضوع</th>
                    <th className="p-3 border-2 border-black">الأهداف</th>
                  </tr>
                </thead>
                <tbody>
                  {LEVELS_ORDER.map((level, i) => {
                    const data = parentsData[level] || {};
                    return (
                      <tr key={i} className="bg-white">
                        {i === 0 && <td rowSpan={5} className="p-2 border-2 border-black bg-gray-50 text-center font-bold">المتوسطة</td>}
                        <td className="p-3 border-2 border-black text-right font-bold bg-[#bfdbfe]/30">{level}</td>
                        <td className="p-3 border-2 border-black">
                           {isEditing ? (
                            <input 
                              type="number" 
                              className="w-full h-full p-1 bg-pink-50 focus:bg-white outline-none text-center"
                              value={data.individual || ''}
                              onChange={(e) => updateParents(level, 'individual', e.target.value)}
                            />
                          ) : (data.individual || '')}
                        </td>
                        <td className="p-3 border-2 border-black">
                           {isEditing ? (
                            <input 
                              type="number" 
                              className="w-full h-full p-1 bg-pink-50 focus:bg-white outline-none text-center"
                              value={data.collective || ''}
                              onChange={(e) => updateParents(level, 'collective', e.target.value)}
                            />
                          ) : (data.collective || '')}
                        </td>
                        <td className="p-3 border-2 border-black">
                           {isEditing ? (
                            <textarea 
                              rows={2}
                              className="w-full h-full p-1 bg-pink-50 focus:bg-white outline-none resize-none"
                              value={data.topic || ''}
                              onChange={(e) => updateParents(level, 'topic', e.target.value)}
                            />
                          ) : (data.topic || '')}
                        </td>
                        <td className="p-3 border-2 border-black">
                           {isEditing ? (
                            <textarea 
                              rows={2}
                              className="w-full h-full p-1 bg-pink-50 focus:bg-white outline-none resize-none"
                              value={data.goal || ''}
                              onChange={(e) => updateParents(level, 'goal', e.target.value)}
                            />
                          ) : (data.goal || '')}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#bfdbfe] font-bold h-10">
                    <td className="p-2 border-2 border-black text-center">المجموع</td>
                    <td className="p-2 border-2 border-black text-center">
                      {/* Fix: Added explicit typing for sum and item to avoid unknown type errors */}
                      {Object.values(parentsData).reduce((sum: number, item: any) => sum + (parseInt(item.individual) || 0), 0)}
                    </td>
                    <td className="p-2 border-2 border-black text-center">
                      {/* Fix: Added explicit typing for sum and item to avoid unknown type errors */}
                      {Object.values(parentsData).reduce((sum: number, item: any) => sum + (parseInt(item.collective) || 0), 0)}
                    </td>
                    <td className="p-2 border-2 border-black"></td>
                    <td className="p-2 border-2 border-black"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. اللجنة البيداغوجية */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
             <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">
                <Settings size={20} />
              </div>
              <h3 className="text-lg font-black text-[#1d4ed8]">اللجنة البيداغوجية</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-2 border-black text-[11px]">
                <thead>
                  <tr className="bg-[#6ee7b7] text-black font-bold">
                    <th className="p-4 border-2 border-black">نوع النشاط</th>
                    <th className="p-4 border-2 border-black">الفترة</th>
                    <th className="p-4 border-2 border-black">الوسائل</th>
                    <th className="p-4 border-2 border-black">الأهداف</th>
                  </tr>
                </thead>
                <tbody>
                  {pedagogicalData.map((data, i) => (
                    <tr key={i} className="h-12">
                      <td className="p-2 border-2 border-black">
                        {isEditing ? (
                            <input 
                              className="w-full h-full p-1 bg-teal-50 focus:bg-white outline-none"
                              value={data.type || ''}
                              onChange={(e) => updatePedagogical(i, 'type', e.target.value)}
                            />
                          ) : (data.type || '')}
                      </td>
                      <td className="p-2 border-2 border-black">
                        {isEditing ? (
                            <input 
                              className="w-full h-full p-1 bg-teal-50 focus:bg-white outline-none"
                              value={data.period || ''}
                              onChange={(e) => updatePedagogical(i, 'period', e.target.value)}
                            />
                          ) : (data.type || '')}
                      </td>
                      <td className="p-2 border-2 border-black">
                        {isEditing ? (
                            <textarea 
                              rows={1}
                              className="w-full h-full p-1 bg-teal-50 focus:bg-white outline-none resize-none"
                              value={data.tools || ''}
                              onChange={(e) => updatePedagogical(i, 'tools', e.target.value)}
                            />
                          ) : (data.tools || '')}
                      </td>
                      <td className="p-2 border-2 border-black">
                        {isEditing ? (
                            <textarea 
                              rows={1}
                              className="w-full h-full p-1 bg-teal-50 focus:bg-white outline-none resize-none"
                              value={data.goals || ''}
                              onChange={(e) => updatePedagogical(i, 'goals', e.target.value)}
                            />
                          ) : (data.goals || '')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. المجالس */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
             <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                <Calendar size={20} />
              </div>
              <h3 className="text-lg font-black text-[#7e22ce]">المجالس</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-2 border-black text-[10px]">
                <thead>
                  <tr className="bg-[#fef08a] text-black font-bold">
                    <th className="p-3 border-2 border-black w-12">الرقم</th>
                    <th className="p-3 border-2 border-black w-24">المؤسسة</th>
                    <th className="p-3 border-2 border-black w-32">نوع المجلس</th>
                    <th className="p-3 border-2 border-black w-24">الفترة</th>
                    <th className="p-3 border-2 border-black">الموضوع</th>
                    <th className="p-3 border-2 border-black">الأهداف</th>
                  </tr>
                </thead>
                <tbody>
                  {councilsData.map((data, i) => (
                    <tr key={i} className="h-12 bg-white">
                      {i === 0 && <td rowSpan={5} className="p-2 border-2 border-black text-center font-bold bg-gray-50">{i + 1}</td>}
                      {i === 0 && <td rowSpan={5} className="p-2 border-2 border-black bg-gray-50"></td>}
                      <td className="p-2 border-2 border-black">
                        {isEditing ? (
                            <input 
                              className="w-full h-full p-1 bg-purple-50 focus:bg-white outline-none"
                              value={data.type || ''}
                              onChange={(e) => updateCouncils(i, 'type', e.target.value)}
                            />
                          ) : (data.type || '')}
                      </td>
                      <td className="p-2 border-2 border-black">
                        {isEditing ? (
                            <input 
                              className="w-full h-full p-1 bg-purple-50 focus:bg-white outline-none"
                              value={data.period || ''}
                              onChange={(e) => updateCouncils(i, 'period', e.target.value)}
                            />
                          ) : (data.period || '')}
                      </td>
                      <td className="p-2 border-2 border-black">
                        {isEditing ? (
                            <textarea 
                              rows={1}
                              className="w-full h-full p-1 bg-purple-50 focus:bg-white outline-none resize-none"
                              value={data.topic || ''}
                              onChange={(e) => updateCouncils(i, 'topic', e.target.value)}
                            />
                          ) : (data.topic || '')}
                      </td>
                      <td className="p-2 border-2 border-black">
                        {isEditing ? (
                            <textarea 
                              rows={1}
                              className="w-full h-full p-1 bg-purple-50 focus:bg-white outline-none resize-none"
                              value={data.goals || ''}
                              onChange={(e) => updateCouncils(i, 'goals', e.target.value)}
                            />
                          ) : (data.goals || '')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* Signature Section for Print */}
      <div className="hidden print:flex justify-between items-start mt-12 px-12 pb-20">
         <div className="text-center">
            <p className="font-bold mb-16 underline">مصلحة التوجيه المدرسي:</p>
            <p className="text-xs">................................</p>
         </div>
         <div className="text-center">
            <p className="font-bold mb-16 underline">توقيع السيد المدير:</p>
            <p className="text-xs">................................</p>
         </div>
      </div>

      {isEditing && (
        <div className="fixed bottom-10 left-10 z-50 animate-bounce print:hidden">
          <button 
            onClick={() => { setIsEditing(false); window.scrollTo(0, 0); }}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-4 rounded-full shadow-2xl font-black text-lg hover:bg-green-700 active:scale-95 transition-all"
          >
            <Save size={24} /> حفظ التغييرات الآن
          </button>
        </div>
      )}
    </div>
  );
};

export default QuarterlyReport;
