
import React, { useMemo, useState } from 'react';
import { Student } from '../types';
import { exportToExcel } from '../utils/analytics';
import { Compass, UserCheck, AlertCircle, Download, Printer, Filter, PieChart as PieIcon, History, UploadCloud, Database, Layers, Settings, CheckCircle2, Calendar, Table as TableIcon, Users, ArrowUpRight, Percent, User, CalendarDays } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import FileUpload from './FileUpload';

interface OrientationPredictionsProps {
  students: Student[];
  subjects: string[];
  onDataLoaded: (students: Student[], subjects: string[]) => void;
}

type CalculationMode = 'y4_only' | 'y3_y4_weighted';

const COLORS = ['#4f46e5', '#ec4899', '#f59e0b'];

const OrientationPredictions: React.FC<OrientationPredictionsProps> = ({ students, subjects, onDataLoaded }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [calcMode, setCalcMode] = useState<CalculationMode>('y3_y4_weighted');
  
  const availableLevels = useMemo(() => Array.from(new Set(students.map(s => s.level))), [students]);
  
  const [selectedLevel, setSelectedLevel] = useState<string>(() => {
    if (availableLevels.includes('السنة الرابعة متوسط')) return 'السنة الرابعة متوسط';
    return availableLevels[0] || '';
  });

  const getSubjectGrade = (student: Student, subjectName: string): number => {
    const studentGrades = student.grades;
    const gradeKey = Object.keys(studentGrades).find(k => {
      const key = k.trim();
      if (subjectName === "الرياضيات") return key.includes("الرياضيات") || key === "رياضيات";
      if (subjectName === "العلوم") return key.includes("طبيعة") || key.includes("طبيعية") || key.includes("الحياة") || key.includes("ع.ط.ح");
      if (subjectName === "الفيزياء") return key.includes("فيزياء") || key.includes("فيزيائية") || key.includes("تكنولوجيا") || key.includes("ع.ف.ت");
      if (subjectName === "العربية") return key.includes("العربية") || key === "اللغة عربية";
      if (subjectName === "الفرنسية") return key.includes("الفرنسية") || key === "لغة فرنسية";
      if (subjectName === "الإنجليزية") return key.includes("الإنجليزية") || key.includes("انجليزية");
      if (subjectName === "الاجتماعيات") return key.includes("التاريخ") || key.includes("جغرافيا") || key.includes("ت.ج");
      return false;
    });
    return gradeKey ? (studentGrades[gradeKey] || 0) : 0;
  };

  const getWeightedSubjectGrade = (studentName: string, subjectName: string, gradeY4: number) => {
    if (calcMode === 'y3_y4_weighted') {
      const studentY3 = students.find(s => s.name === studentName && s.level === 'السنة الثالثة متوسط');
      if (studentY3) {
        const gradeY3 = getSubjectGrade(studentY3, subjectName);
        return (gradeY3 + gradeY4 * 2) / 3;
      }
    }
    return gradeY4;
  };

  const orientationData = useMemo(() => {
    const filtered = students.filter(s => s.level === selectedLevel);
    
    const results = filtered.map(s => {
      const grades = s.grades;
      const gradeKeys = Object.keys(grades);
      const lastColumnKey = gradeKeys[gradeKeys.length - 1];
      const currentYearAvg = grades[lastColumnKey] || 0;

      const mathW = getWeightedSubjectGrade(s.name, 'الرياضيات', getSubjectGrade(s, 'الرياضيات'));
      const scienceW = getWeightedSubjectGrade(s.name, 'العلوم', getSubjectGrade(s, 'العلوم'));
      const physicsW = getWeightedSubjectGrade(s.name, 'الفيزياء', getSubjectGrade(s, 'الفيزياء'));
      const arabicW = getWeightedSubjectGrade(s.name, 'العربية', getSubjectGrade(s, 'العربية'));
      const frenchW = getWeightedSubjectGrade(s.name, 'الفرنسية', getSubjectGrade(s, 'الفرنسية'));
      const englishW = getWeightedSubjectGrade(s.name, 'الإنجليزية', getSubjectGrade(s, 'الإنجليزية'));
      const historyW = getWeightedSubjectGrade(s.name, 'الاجتماعيات', getSubjectGrade(s, 'الاجتماعيات'));

      const scienceGroupAvg = (mathW * 4 + scienceW * 4 + physicsW * 4 + arabicW * 2) / 14;
      const artsGroupAvg = (arabicW * 5 + frenchW * 4 + englishW * 3 + historyW * 2) / 14;

      const hasHistory = students.some(prev => prev.name === s.name && prev.level === 'السنة الثالثة متوسط');

      let prediction = 'غير معني';
      if (currentYearAvg < 10) {
        prediction = 'استدراك / إعادة';
      } else {
        if (scienceGroupAvg >= artsGroupAvg + 0.5) {
          prediction = 'جذع مشترك علوم وتكنولوجيا';
        } else if (artsGroupAvg >= scienceGroupAvg + 0.5) {
          prediction = 'جذع مشترك آداب';
        } else {
          prediction = scienceGroupAvg >= artsGroupAvg ? 'علوم (توجيه مرن)' : 'آداب (توجيه مرن)';
        }
      }

      return {
        ...s,
        currentYearAvg,
        scienceGroupAvg,
        artsGroupAvg,
        prediction,
        hasHistory
      };
    });

    const total = results.length;
    const successfulCount = results.filter(r => r.currentYearAvg >= 10).length;
    
    const stats = {
      science: results.filter(r => r.prediction.includes('علوم')).length,
      scienceMale: results.filter(r => r.prediction.includes('علوم') && r.gender === 'ذكر').length,
      scienceFemale: results.filter(r => r.prediction.includes('علوم') && r.gender === 'أنثى').length,
      
      arts: results.filter(r => r.prediction.includes('آداب')).length,
      artsMale: results.filter(r => r.prediction.includes('آداب') && r.gender === 'ذكر').length,
      artsFemale: results.filter(r => r.prediction.includes('آداب') && r.gender === 'أنثى').length,
      
      remedial: results.filter(r => r.prediction === 'استدراك / إعادة').length,
      remedialMale: results.filter(r => r.prediction === 'استدراك / إعادة' && r.gender === 'ذكر').length,
      remedialFemale: results.filter(r => r.prediction === 'استدراك / إعادة' && r.gender === 'أنثى').length,
      
      total,
      successfulCount,
      successfulMale: results.filter(r => r.currentYearAvg >= 10 && r.gender === 'ذكر').length,
      successfulFemale: results.filter(r => r.currentYearAvg >= 10 && r.gender === 'أنثى').length,
      successRate: total > 0 ? (successfulCount / total) * 100 : 0
    };

    return { results, stats };
  }, [students, selectedLevel, calcMode]);

  const chartData = [
    { name: 'علوم وتكنولوجيا', value: orientationData.stats.science },
    { name: 'آداب ولغات', value: orientationData.stats.arts },
    { name: 'غير معني حالياً', value: orientationData.stats.remedial }
  ];

  const handleExport = () => {
    const data = orientationData.results.map(r => ({
      'اسم التلميذ': r.name,
      'الجنس': r.gender,
      'تاريخ الميلاد': r.birthDate || '',
      'القسم': r.section,
      'معدل السنة 4': r.currentYearAvg.toFixed(2),
      'معدل العلوم (مرجح)': r.scienceGroupAvg.toFixed(2),
      'معدل الآداب (مرجح)': r.artsGroupAvg.toFixed(2),
      'التوجيه المقترح': r.prediction
    }));
    exportToExcel(data, `توقعات_التوجيه_المفصلة_${selectedLevel}`, 'توقعات التوجيه');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* قسم الإحصائيات العلوية */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg">
              <Compass size={32} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800">نظام الإحصاء والتوجيه المرجح</h2>
              <p className="text-xs text-gray-500 font-bold">تحليل دقيق لمسارات التلاميذ الناجحين (معدل ≥ 10)</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 print:hidden">
            <button 
              onClick={() => setShowUpload(!showUpload)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${showUpload ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <UploadCloud size={14} />
              {showUpload ? 'إلغاء الرفع' : 'رفع نتائج السنة 3'}
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold shadow hover:bg-green-700">
              <Download size={14} /> تصدير Excel
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-indigo-900 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-800">
              <Printer size={14} /> طباعة
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center gap-6 print:hidden">
           <div className="text-sm font-black text-gray-700 flex items-center gap-2">
              <Settings className="text-indigo-500" size={18} /> نمط الحساب:
           </div>
           <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full md:w-auto border border-gray-200">
              <button 
                onClick={() => setCalcMode('y4_only')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black transition-all ${calcMode === 'y4_only' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                السنة 4 فقط
              </button>
              <button 
                onClick={() => setCalcMode('y3_y4_weighted')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black transition-all ${calcMode === 'y3_y4_weighted' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                الدمج المرجح (3م+4م)
              </button>
           </div>
           <div className="flex-1 text-[10px] bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 font-bold flex items-center gap-2">
             <CheckCircle2 size={16} className="text-blue-500" />
             يتم حساب "معدل المجموعة" المرجح (معامل 14) للتلاميذ الناجحين فقط.
           </div>
        </div>

        {showUpload && (
          <div className="mt-6 p-6 bg-indigo-50/50 rounded-2xl border-2 border-dashed border-indigo-200 animate-slide-down">
            <FileUpload onDataLoaded={(newSts, newSubs) => { onDataLoaded(newSts, newSubs); setShowUpload(false); }} isAppending={true} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:grid-cols-1">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
            <h3 className="text-md font-bold mb-4 flex items-center gap-2 text-gray-800 border-b pb-2">
              <PieIcon size={18} className="text-indigo-600" />
              توزيع التوجيه
            </h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%" cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                    <UserCheck size={18} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-600">إجمالي الناجحين</span>
                </div>
                <span className="text-lg font-black text-green-700">{orientationData.stats.successfulCount}</span>
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                    <Percent size={18} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-600">نسبة النجاح العامة</span>
                </div>
                <span className="text-lg font-black text-indigo-700">{orientationData.stats.successRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
             <div className="relative z-10">
               <h4 className="text-sm font-bold opacity-90 mb-4 border-b border-white/20 pb-2 flex items-center gap-2">
                 <History size={16} /> معايير التوجيه
               </h4>
               <div className="space-y-3">
                 <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                    <p className="text-[10px] mb-1 text-indigo-200 font-bold uppercase tracking-wider">مجموعة العلوم (14):</p>
                    <p className="font-bold text-[10px] leading-relaxed">رياضيات(4)، علوم(4)، فيزياء(4)، عربية(2)</p>
                 </div>
                 <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                    <p className="text-[10px] mb-1 text-pink-200 font-bold uppercase tracking-wider">مجموعة الآداب (14):</p>
                    <p className="font-bold text-[10px] leading-relaxed">عربية(5)، فرنسية(4)، إنجليزية(3)، اجتماعيات(2)</p>
                 </div>
               </div>
             </div>
             <Compass className="absolute -bottom-10 -right-10 opacity-10 text-white" size={180} />
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
             <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800 mb-6 border-b pb-4">
               <TableIcon size={20} className="text-indigo-600" />
               تفاصيل توزيع التوجيه المتوقع (الناجحون فقط)
             </h3>

             <div className="overflow-x-auto">
               <table className="w-full border-collapse border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                 <thead>
                   <tr className="bg-indigo-600 text-white">
                     <th className="p-4 border border-indigo-500 text-right w-1/3">فئة التوجيه المتوقع</th>
                     <th className="p-4 border border-indigo-500 text-center">العدد الإجمالي</th>
                     <th className="p-4 border border-indigo-500 text-center bg-blue-700">ذكور</th>
                     <th className="p-4 border border-indigo-500 text-center bg-pink-700">إناث</th>
                     <th className="p-4 border border-indigo-500 text-center">النسبة (%)</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm">
                   <tr className="hover:bg-indigo-50 transition-colors">
                     <td className="p-4 border border-gray-200">
                       <div className="flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                         <span className="font-bold text-indigo-900">جذع مشترك علوم وتكنولوجيا</span>
                       </div>
                     </td>
                     <td className="p-4 border border-gray-200 text-center font-black text-lg">{orientationData.stats.science}</td>
                     <td className="p-4 border border-gray-200 text-center text-blue-700 font-bold">{orientationData.stats.scienceMale}</td>
                     <td className="p-4 border border-gray-200 text-center text-pink-700 font-bold">{orientationData.stats.scienceFemale}</td>
                     <td className="p-4 border border-gray-200 text-center">
                        <div className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-black">
                           <ArrowUpRight size={14} />
                           {((orientationData.stats.science / (orientationData.stats.successfulCount || 1)) * 100).toFixed(1)}%
                        </div>
                     </td>
                   </tr>
                   <tr className="hover:bg-pink-50 transition-colors">
                     <td className="p-4 border border-gray-200">
                       <div className="flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                         <span className="font-bold text-pink-900">جذع مشترك آداب ولغات</span>
                       </div>
                     </td>
                     <td className="p-4 border border-gray-200 text-center font-black text-lg">{orientationData.stats.arts}</td>
                     <td className="p-4 border border-gray-200 text-center text-blue-700 font-bold">{orientationData.stats.artsMale}</td>
                     <td className="p-4 border border-gray-200 text-center text-pink-700 font-bold">{orientationData.stats.artsFemale}</td>
                     <td className="p-4 border border-gray-200 text-center">
                        <div className="inline-flex items-center gap-1 bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-black">
                           <ArrowUpRight size={14} />
                           {((orientationData.stats.arts / (orientationData.stats.successfulCount || 1)) * 100).toFixed(1)}%
                        </div>
                     </td>
                   </tr>
                   <tr className="bg-green-50/50 font-black border-y-2 border-green-200">
                     <td className="p-4 border border-gray-200 text-right text-green-800">إجمالي الموجهين (الناجحين)</td>
                     <td className="p-4 border border-gray-200 text-center text-xl text-green-900">{orientationData.stats.successfulCount}</td>
                     <td className="p-4 border border-gray-200 text-center text-blue-800">{orientationData.stats.successfulMale}</td>
                     <td className="p-4 border border-gray-200 text-center text-pink-800">{orientationData.stats.successfulFemale}</td>
                     <td className="p-4 border border-gray-200 text-center text-green-700">100%</td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800 mb-6">
              <UserCheck size={20} className="text-green-600" />
              سجل التوجيه الفردي المفصل
            </h3>
            
            <div className="overflow-x-auto max-h-[600px] custom-scrollbar border rounded-2xl shadow-inner">
              <table className="w-full text-right border-collapse text-[11px]">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-indigo-600 text-white">
                    <th className="p-4 border border-indigo-500 font-black text-right w-[250px]">بيانات التلميذ</th>
                    <th className="p-4 border border-indigo-500 text-center w-[120px]">تاريخ الميلاد</th>
                    <th className="p-4 border border-indigo-500 text-center bg-yellow-500 text-indigo-900 font-black w-[100px]">المعدل السنوي</th>
                    <th className="p-4 border border-indigo-500 text-center bg-blue-700 font-bold w-[100px]">معدل العلوم</th>
                    <th className="p-4 border border-indigo-500 text-center bg-pink-700 font-bold w-[100px]">معدل الآداب</th>
                    <th className="p-4 border border-indigo-500 text-center font-black">التوجيه المستحق</th>
                  </tr>
                </thead>
                <tbody>
                  {orientationData.results.map((r, i) => (
                    <tr key={i} className={`border-b hover:bg-indigo-50 transition-colors ${r.currentYearAvg < 10 ? 'bg-gray-50/50 opacity-60 grayscale' : ''}`}>
                      <td className="p-4 border-l border-gray-100">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`p-1 rounded-md ${r.gender === 'ذكر' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                              <User size={14} />
                            </span>
                            <span className="font-black text-gray-900 text-[12px]">{r.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-500 mt-1">
                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-bold">القسم: {r.section}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${r.gender === 'ذكر' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>{r.gender}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center border-l border-gray-100">
                        <div className="flex items-center justify-center gap-1 text-gray-600 font-bold">
                           <CalendarDays size={12} className="text-gray-400" />
                           {r.birthDate || 'غير متوفر'}
                        </div>
                      </td>
                      <td className={`p-4 text-center font-black text-sm border-l border-gray-100 ${r.currentYearAvg >= 10 ? 'text-green-700 bg-yellow-50/30' : 'text-red-500 bg-red-50/30'}`}>
                        {r.currentYearAvg.toFixed(2)}
                      </td>
                      <td className="p-4 text-center font-black border-l border-gray-100 text-indigo-700 bg-blue-50/20">
                        {r.scienceGroupAvg.toFixed(2)}
                      </td>
                      <td className="p-4 text-center font-black border-l border-gray-100 text-pink-700 bg-pink-50/20">
                        {r.artsGroupAvg.toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-3 py-1.5 rounded-xl font-black text-[10px] shadow-sm border ${
                          r.currentYearAvg < 10 ? 'bg-gray-100 text-gray-400 border-gray-200' :
                          r.prediction.includes('علوم') ? 'bg-indigo-600 text-white border-indigo-700' :
                          r.prediction.includes('آداب') ? 'bg-pink-600 text-white border-pink-700' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {r.prediction}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrientationPredictions;
