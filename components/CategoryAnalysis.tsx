
import React, { useState, useMemo, useEffect } from 'react';
import { Student, CategoryStats, SubjectStats } from '../types';
import { calculateAverage, analyzeSubject, exportToExcel } from '../utils/analytics';
import { Download, Printer, Filter, ChevronUp, ChevronDown, ArrowUpDown, SortAsc, LayoutList, GripVertical, MoveUp, MoveDown } from 'lucide-react';

interface CategoryAnalysisProps {
  students: Student[];
  subjects: string[];
}

type SortKey = keyof SubjectStats | 'displayName' | 'official' | 'manual';

const OFFICIAL_ORDER = [
  "اللغة العربية",
  "اللغة الأمازيغية",
  "الرياضيات",
  "اللغة الفرنسية",
  "اللغة الإنجليزية",
  "التربية الإسلامية",
  "التاريخ والجغرافيا",
  "التربية المدنية",
  "ع الفيزيائية والتكنولوجيا",
  "ع الطبيعة والحياة",
  "التربية التشكيلية",
  "التربية الموسيقية",
  "ت البدنية والرياضية",
  "المعلوماتية",
  "معدل الفصل 1"
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

const CategoryAnalysis: React.FC<CategoryAnalysisProps> = ({ students, subjects }) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [manualOrder, setManualOrder] = useState<string[]>([]);
  
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
    key: 'displayName',
    direction: 'asc',
  });

  const levels = useMemo(() => Array.from(new Set(students.map(s => s.level))), [students]);
  
  const filteredStudents = useMemo(() => {
    return students.filter(s => selectedLevel === 'all' || s.level === selectedLevel);
  }, [students, selectedLevel]);

  const baseData = useMemo(() => {
    return OFFICIAL_ORDER.map((officialName, index) => {
      const rawKey = matchSubject(officialName, subjects);
      if (!rawKey) return null;
      const stats = analyzeSubject(filteredStudents, rawKey, 0);
      return { ...stats, displayName: officialName, officialIndex: index };
    }).filter((item): item is (SubjectStats & { displayName: string, officialIndex: number }) => item !== null);
  }, [filteredStudents, subjects]);

  useEffect(() => {
    if (manualOrder.length === 0 && baseData.length > 0) {
      setManualOrder(baseData.map(d => d.displayName));
    }
  }, [baseData]);

  const subjectDistributions = useMemo(() => {
    let data = [...baseData];

    if (sortConfig.key === 'manual' && manualOrder.length > 0) {
      data.sort((a, b) => {
        const indexA = manualOrder.indexOf(a.displayName);
        const indexB = manualOrder.indexOf(b.displayName);
        return indexA - indexB;
      });
    } else {
      data.sort((a, b) => {
        if (sortConfig.key === 'official') {
          return sortConfig.direction === 'asc' 
            ? a.officialIndex - b.officialIndex 
            : b.officialIndex - a.officialIndex;
        }

        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue, 'ar') 
            : bValue.localeCompare(aValue, 'ar');
        }

        if ((aValue as any) < (bValue as any)) return sortConfig.direction === 'asc' ? -1 : 1;
        if ((aValue as any) > (bValue as any)) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [baseData, sortConfig, manualOrder]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...manualOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setManualOrder(newOrder);
    if (sortConfig.key !== 'manual') setSortConfig({ key: 'manual', direction: 'asc' });
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={12} className="opacity-30" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const handleExportDistribution = () => {
    const data = subjectDistributions.map(stat => ({
      'المادة': stat.displayName,
      'اقل من 8': stat.countBelow8,
      '8.00-8.99': stat.count8to9,
      '9.00-9.99': stat.count9to10,
      '10.00-11.99': stat.count10to12,
      '12.00-13.99': stat.count12to14,
      '14.00-15.99': stat.count14to16,
      '16.00-17.99': stat.count16to18,
      '18.00 فما فوق': stat.countAbove18,
      'المعدل': stat.average.toFixed(2),
      'نسبة النجاح': `${stat.passPercentage.toFixed(1)}%`
    }));
    exportToExcel(data, 'توزيع_الدرجات_حسب_الفئات', 'توزيع درجات الفئات');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-6 items-center print:hidden">
        <div className="flex items-center gap-4 border-l border-gray-200 pl-6">
          <div className="flex items-center gap-2 text-purple-600 font-bold"><Filter size={18} /><span>المستوى:</span></div>
          <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500 min-w-[150px]">
             <option value="all">كل المستويات</option>
             {levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold"><SortAsc size={18} /><span>ترتيب حسب:</span></div>
          <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
            <button onClick={() => setSortConfig({ key: 'official', direction: 'asc' })} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${sortConfig.key === 'official' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><LayoutList size={12} /> الترتيب الرسمي</button>
            <button onClick={() => setSortConfig({ key: 'manual', direction: 'asc' })} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${sortConfig.key === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><GripVertical size={12} /> يدوي</button>
            <button onClick={() => setSortConfig({ key: 'displayName', direction: 'asc' })} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${sortConfig.key === 'displayName' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>أبجدي</button>
            <button onClick={() => setSortConfig({ key: 'passPercentage', direction: 'desc' })} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${sortConfig.key === 'passPercentage' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>نسبة النجاح</button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 print:p-0 print:border-none">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h3 className="text-xl font-bold text-gray-800">توزيع الدرجات حسب الفئات المعتمدة</h3>
          <button onClick={handleExportDistribution} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-2 shadow hover:bg-green-700 transition-all"><Download size={16} /> تصدير Excel</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-[9px]">
            <thead>
              <tr className="bg-blue-600 text-white print:bg-gray-200 print:text-black">
                {sortConfig.key === 'manual' && <th className="p-1 border w-8 print:hidden">#</th>}
                <th className={`p-2 border cursor-pointer hover:bg-blue-700 transition-colors select-none ${sortConfig.key === 'displayName' ? 'bg-blue-800' : ''}`} onClick={() => handleSort('displayName')}>المادة {getSortIcon('displayName')}</th>
                <th className="p-2 border bg-red-600 print:bg-gray-200">اقل من 8</th>
                <th className="p-2 border bg-orange-500 print:bg-gray-200">8.00-8.99</th>
                <th className="p-2 border bg-yellow-500 print:bg-gray-200">9.00-9.99</th>
                <th className="p-2 border bg-blue-500 print:bg-gray-200">10.00-11.99</th>
                <th className="p-2 border bg-blue-600 print:bg-gray-200">12.00-13.99</th>
                <th className="p-2 border bg-green-500 print:bg-gray-200">14.00-15.99</th>
                <th className="p-2 border bg-green-600 print:bg-gray-200">16.00-17.99</th>
                <th className="p-2 border bg-green-800 print:bg-gray-200">18.00 فما فوق</th>
                <th className="p-2 border bg-gray-700 print:bg-gray-200 cursor-pointer" onClick={() => handleSort('average')}>المعدل {getSortIcon('average')}</th>
                <th className="p-2 border bg-gray-700 print:bg-gray-200 cursor-pointer" onClick={() => handleSort('passPercentage')}>النسبة {getSortIcon('passPercentage')}</th>
              </tr>
            </thead>
            <tbody>
              {subjectDistributions.map((stat, idx) => (
                <tr key={stat.displayName} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-purple-50 transition-colors group`}>
                  {sortConfig.key === 'manual' && (
                    <td className="p-1 border print:hidden">
                      <div className="flex flex-col gap-0.5 opacity-30 group-hover:opacity-100">
                        <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0} className="hover:text-blue-600 disabled:opacity-10"><MoveUp size={10} /></button>
                        <button onClick={() => moveItem(idx, 'down')} disabled={idx === subjectDistributions.length - 1} className="hover:text-blue-600 disabled:opacity-10"><MoveDown size={10} /></button>
                      </div>
                    </td>
                  )}
                  <td className="p-2 border font-bold text-right bg-blue-50/20">{stat.displayName}</td>
                  <td className="p-2 border font-bold text-red-600">{stat.countBelow8}</td>
                  <td className="p-2 border text-orange-600">{stat.count8to9}</td>
                  <td className="p-2 border text-yellow-600 font-medium">{stat.count9to10}</td>
                  <td className="p-2 border text-blue-700">{stat.count10to12}</td>
                  <td className="p-2 border text-blue-800">{stat.count12to14}</td>
                  <td className="p-2 border text-green-700">{stat.count14to16}</td>
                  <td className="p-2 border text-green-800">{stat.count16to18}</td>
                  <td className="p-2 border font-bold text-green-900 bg-green-50">{stat.countAbove18}</td>
                  <td className="p-2 border font-bold bg-gray-50">{stat.average.toFixed(2)}</td>
                  <td className="p-2 border font-bold bg-gray-50 text-blue-700">{stat.passPercentage.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoryAnalysis;
