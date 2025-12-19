
import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { calculateAverage, exportToExcel } from '../utils/analytics';
import { Download, Printer, UserPlus, Filter, CheckSquare, Square, BookOpen, Table as TableIcon } from 'lucide-react';

interface RemedialAnalysisProps {
  students: Student[];
  subjects: string[];
}

const RemedialAnalysis: React.FC<RemedialAnalysisProps> = ({ students, subjects }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const levels = useMemo(() => Array.from(new Set(students.map(s => s.level))), [students]);
  const sections = useMemo(() => {
    const relevantStudents = selectedLevel === 'all' ? students : students.filter(s => s.level === selectedLevel);
    return Array.from(new Set(relevantStudents.map(s => s.section))).sort();
  }, [students, selectedLevel]);

  const toggleStudent = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const currentLevelStudents = useMemo(() => {
    return students.filter(s => {
      const levelMatch = selectedLevel === 'all' || s.level === selectedLevel;
      const sectionMatch = selectedSection === 'all' || s.section === selectedSection;
      return levelMatch && sectionMatch;
    });
  }, [students, selectedLevel, selectedSection]);

  const filteredStudents = useMemo(() => {
    return currentLevelStudents.filter(s => s.name.includes(searchTerm));
  }, [currentLevelStudents, searchTerm]);

  const groupAnalysis = useMemo(() => {
    const group = students.filter(s => selectedIds.has(s.id));
    const groupGrades = group.map(s => {
        const grades = Object.values(s.grades).filter((g): g is number => typeof g === 'number');
        return calculateAverage(grades);
    });
    const totalStudents = group.length;
    const globalAverage = calculateAverage(groupGrades);

    // تحليل المواد للمجموعة المختارة
    const detailedSubjectStats = subjects.map(subject => {
      const grades = group.map(s => s.grades[subject]).filter((g): g is number => typeof g === 'number');
      const countAbove10 = grades.filter(g => g >= 10).length;
      const average = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;
      const passPercentage = grades.length > 0 ? (countAbove10 / grades.length) * 100 : 0;
      
      return { 
        name: subject, 
        countAbove10, 
        passPercentage, 
        average 
      };
    }).filter(s => s.average > 0 || s.countAbove10 > 0);

    const subjectFailures = detailedSubjectStats
      .map(s => ({ subject: s.name, count: group.length - s.countAbove10, percentage: 100 - s.passPercentage }))
      .filter(s => s.count > 0)
      .sort((a, b) => b.count - a.count);

    return { group, totalStudents, globalAverage, subjectFailures, detailedSubjectStats };
  }, [students, selectedIds, subjects]);

  const handleExportStats = () => {
    const data = groupAnalysis.detailedSubjectStats.map(s => ({
      'المادة التعليمية': s.name,
      'عدد المتحصلين على معدل ≥ 10': s.countAbove10,
      'نسبة عدد المتحصلين على معدل ≥ 10': `${s.passPercentage.toFixed(1)}%`,
      'معدل المادة': s.average.toFixed(2)
    }));
    exportToExcel(data, 'تحليل_مواد_المجموعة_المستهدفة', 'تحليل مواد المجموعة');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center print:hidden">
        <div className="flex items-center gap-2 text-blue-600 font-bold"><Filter size={18} /><span>تصفية الاختيار:</span></div>
        <select value={selectedLevel} onChange={(e) => {setSelectedLevel(e.target.value); setSelectedSection('all');}} className="p-2 border border-gray-300 rounded-lg text-sm">
           <option value="all">كل المستويات</option>
           {levels.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="p-2 border border-gray-300 rounded-lg text-sm">
           <option value="all">كل الأقسام</option>
           {sections.map(s => <option key={s} value={s}>القسم {s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col print:hidden">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><UserPlus size={20} />اختيار التلاميذ</h3>
          <input type="text" placeholder="بحث باسم التلميذ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg mb-4 outline-none text-sm"/>
          <div className="flex-grow overflow-y-auto space-y-2 custom-scrollbar">
            {filteredStudents.map(student => {
               const isSelected = selectedIds.has(student.id);
               return (
                <div key={student.id} onClick={() => toggleStudent(student.id)} className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-3">{isSelected ? <CheckSquare className="text-blue-600" size={18} /> : <Square className="text-gray-300" size={18} />}<span className="text-xs">{student.name}</span></div>
                </div>
               );
            })}
          </div>
          <button onClick={() => setSelectedIds(new Set())} className="mt-4 text-[10px] text-red-500 font-bold hover:underline">إلغاء تحديد الكل</button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 print:hidden">
            <div className="bg-white p-4 rounded-xl border text-center shadow-sm">
              <p className="text-xs text-gray-500">العدد المختار</p>
              <p className="text-2xl font-bold">{groupAnalysis.totalStudents}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border text-center shadow-sm">
              <p className="text-xs text-gray-500">المعدل الجماعي</p>
              <p className="text-2xl font-bold text-blue-600">{groupAnalysis.globalAverage.toFixed(2)}</p>
            </div>
          </div>

          {/* جدول تحليل المواد للمستدركين */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 print:p-0 print:border-none">
            <div className="flex justify-between items-center mb-6 print:hidden">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <TableIcon className="text-blue-600" size={24} />
                تحليل المواد للمجموعة المختارة
              </h3>
              <div className="flex gap-2">
                <button onClick={handleExportStats} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-2 shadow"><Download size={14} /> تصدير</button>
                <button onClick={() => window.print()} className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-2 shadow"><Printer size={14} /> طباعة</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-2 border-black border-collapse">
                <thead>
                  <tr className="bg-white">
                    <th rowSpan={2} className="p-3 border-2 border-black font-extrabold text-sm w-1/3">المواد التعليمية</th>
                    <th className="p-2 border-2 border-black bg-yellow-400 font-bold text-[11px]">عدد المتحصلين على معدل ≥ 10</th>
                    <th className="p-2 border-2 border-black bg-yellow-400 font-bold text-[11px]">نسبة عدد المتحصلين على معدل ≥ 10</th>
                    <th className="p-2 border-2 border-black bg-yellow-400 font-bold text-[11px]">معدل المادة</th>
                  </tr>
                  <tr className="bg-yellow-400">
                    <th className="p-1 border-2 border-black text-[10px] font-bold">10</th>
                    <th className="p-1 border-2 border-black text-[10px] font-bold">10</th>
                    <th className="p-1 border-2 border-black"></th>
                  </tr>
                </thead>
                <tbody>
                  {groupAnalysis.detailedSubjectStats.length > 0 ? (
                    groupAnalysis.detailedSubjectStats.map((stats) => (
                      <tr key={stats.name} className="hover:bg-gray-50 transition-colors">
                        <td className="p-2 border-2 border-black font-bold text-right pr-4 text-xs">{stats.name}</td>
                        <td className="p-2 border-2 border-black text-sm font-medium">{stats.countAbove10}</td>
                        <td className="p-2 border-2 border-black text-sm font-medium">{stats.passPercentage.toFixed(1)}%</td>
                        <td className={`p-2 border-2 border-black font-bold text-sm ${stats.average >= 10 ? 'bg-green-50' : 'bg-red-50'}`}>{stats.average.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-gray-400 italic text-sm">قم باختيار التلاميذ لعرض تحليل المواد</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 print:p-0 print:border-none">
            <div className="flex justify-between items-center mb-6 print:hidden">
              <h3 className="text-xl font-bold">قائمة التلاميذ المختارين</h3>
              <button onClick={() => window.print()} className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm">طباعة</button>
            </div>
            {groupAnalysis.totalStudents > 0 ? (
              <table className="w-full text-right border-collapse text-sm">
                <thead><tr className="bg-gray-100 print:bg-gray-200"><th className="p-3 border">الاسم واللقب</th><th className="p-3 border">القسم</th><th className="p-3 border text-center">المعدل</th></tr></thead>
                <tbody>{groupAnalysis.group.map(s => {
                  const grades = Object.values(s.grades).filter((g): g is number => typeof g === 'number');
                  const avg = calculateAverage(grades);
                  return (<tr key={s.id} className="border-b"><td className="p-3 font-medium">{s.name}</td><td className="p-3 text-center">{s.section}</td><td className={`p-3 font-bold text-center ${avg < 10 ? 'text-red-600' : 'text-green-600'}`}>{avg.toFixed(2)}</td></tr>);
                })}</tbody>
              </table>
            ) : (<p className="text-center py-10 text-gray-400 italic">قم باختيار التلاميذ من القائمة الجانبية</p>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemedialAnalysis;
