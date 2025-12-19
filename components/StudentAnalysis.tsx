
import React, { useState, useMemo, useEffect } from 'react';
import { Student, FollowUpNote } from '../types';
import { calculateAverage, exportToExcel } from '../utils/analytics';
import { 
  Download, 
  Printer, 
  User, 
  ClipboardList, 
  PlusCircle, 
  Trash2, 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  Save, 
  BarChart4, 
  Zap, 
  Target, 
  BrainCircuit,
  Layers
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell
} from 'recharts';

interface StudentAnalysisProps {
  students: Student[];
  subjects: string[];
}

const StudentAnalysis: React.FC<StudentAnalysisProps> = ({ students, subjects }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [activeView, setActiveView] = useState<'grades' | 'followup' | 'deep_analytics'>('grades');
  const [newNote, setNewNote] = useState({ content: '', category: 'ملاحظة عامة' as FollowUpNote['category'] });
  
  const [allNotes, setAllNotes] = useState<FollowUpNote[]>(() => {
    const saved = localStorage.getItem('student_followup_notes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('student_followup_notes', JSON.stringify(allNotes));
  }, [allNotes]);

  const lastSubjectKey = subjects.length > 0 ? subjects[subjects.length - 1] : '';
  const actualSubjects = useMemo(() => subjects.slice(0, -1), [subjects]);

  const classAverages = useMemo(() => {
    const avgs: Record<string, number> = {};
    subjects.forEach(subject => {
      const grades = students
        .map(s => s.grades[subject])
        .filter(g => typeof g === 'number');
      avgs[subject] = calculateAverage(grades);
    });
    return avgs;
  }, [students, subjects]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const studentNotes = useMemo(() => {
    return allNotes.filter(n => n.studentId === selectedStudentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allNotes, selectedStudentId]);

  const studentGeneralAvg = useMemo(() => {
    if (!selectedStudent || !lastSubjectKey) return 0;
    return selectedStudent.grades[lastSubjectKey] || 0;
  }, [selectedStudent, lastSubjectKey]);

  const deepAnalyticsData = useMemo(() => {
    if (!selectedStudent) return null;
    const groups = [
      { name: 'اللغات', subjects: ['العربية', 'الفرنسية', 'الإنجليزية', 'الأمازيغية'] },
      { name: 'العلوم والرياضيات', subjects: ['الرياضيات', 'فيزياء', 'طبيعة', 'تكنولوجيا'] },
      { name: 'العلوم الإنسانية', subjects: ['التاريخ', 'الجغرافيا', 'الإسلامية', 'المدنية'] },
      { name: 'المواد الفنية والبدنية', subjects: ['تشكيلية', 'موسيقية', 'بدنية', 'رياضية', 'معلوماتية'] }
    ];
    const radarData = groups.map(group => {
      const relevantGrades = actualSubjects
        .filter(s => group.subjects.some(keyword => s.includes(keyword)))
        .map(s => selectedStudent.grades[s] || 0);
      const avg = relevantGrades.length > 0 ? calculateAverage(relevantGrades) : 0;
      return { subject: group.name, A: avg, fullMark: 20 };
    });
    const subjectVariances = actualSubjects.map(s => ({
      name: s,
      grade: selectedStudent.grades[s] || 0,
      classAvg: classAverages[s] || 0,
      variance: (selectedStudent.grades[s] || 0) - (classAverages[s] || 0)
    })).sort((a, b) => b.variance - a.variance);
    return { radarData, subjectVariances };
  }, [selectedStudent, actualSubjects, classAverages]);

  const handleAddNote = () => {
    if (!newNote.content.trim() || !selectedStudentId) return;
    const note: FollowUpNote = {
      id: `note-${Date.now()}`,
      studentId: selectedStudentId,
      date: new Date().toISOString().split('T')[0],
      content: newNote.content.trim(),
      category: newNote.category,
      author: 'مستشار التوجيه'
    };
    setAllNotes(prev => [note, ...prev]);
    setNewNote({ content: '', category: 'ملاحظة عامة' });
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الملاحظة؟")) {
      setAllNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const handleExport = () => {
    if (!selectedStudent) return;
    const data = actualSubjects.map(subject => ({
      'المادة': subject,
      'معدل التلميذ': selectedStudent.grades[subject] ?? '-',
      'متوسط الفصل': classAverages[subject].toFixed(2),
      'الملاحظات': (selectedStudent.grades[subject] ?? 0) > classAverages[subject] ? 'أداء جيد' : 'تحسين مطلوب'
    }));
    exportToExcel(data, `نتائج_التلميذ_${selectedStudent.name}`, "كشف النتائج");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Selector Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 print:hidden">
        <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Layers size={22} /></div>
          مركز تحليل التلاميذ الفردي
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full pr-12 p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none bg-gray-50 font-black text-gray-700 transition-all appearance-none"
            >
              <option value="">-- اختر تلميذ من القائمة للتحليل --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} (قسم: {s.section})</option>
              ))}
            </select>
          </div>
          {selectedStudent && (
            <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200 shadow-inner">
              <button 
                onClick={() => setActiveView('grades')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeView === 'grades' ? 'bg-white text-blue-600 shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <BookOpen size={16} /> كشف النقاط
              </button>
              <button 
                onClick={() => setActiveView('followup')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeView === 'followup' ? 'bg-white text-blue-600 shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <ClipboardList size={16} /> سجل المتابعة
              </button>
              <button 
                onClick={() => setActiveView('deep_analytics')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeView === 'deep_analytics' ? 'bg-white text-purple-600 shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <BrainCircuit size={16} /> التحليلات المعمقة
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedStudent && activeView === 'grades' && (
        <div className="animate-fade-in">
          {/* Screen View */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 print:hidden">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg border-2 border-white">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                   <h3 className="text-2xl font-black text-gray-800 leading-none">{selectedStudent.name}</h3>
                   <p className="text-sm text-blue-600 font-bold mt-1">{selectedStudent.level} - القسم {selectedStudent.section}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleExport} className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-2xl text-xs font-bold shadow-lg hover:bg-green-700 transition-all active:scale-95">
                  <Download size={16} /> تصدير Excel
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-2xl text-xs font-bold shadow-lg hover:bg-black transition-all active:scale-95">
                  <Printer size={16} /> طباعة الكشف
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border-2 border-black rounded-3xl overflow-hidden">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="p-5 border border-gray-700 text-sm font-black">المادة التعليمية</th>
                    <th className="p-5 border border-gray-700 text-center text-sm font-black">المعدل الفردي</th>
                    <th className="p-5 border border-gray-700 text-center text-sm font-black">متوسط القسم</th>
                    <th className="p-5 border border-gray-700 text-center text-sm font-black">الوضعية النسبية</th>
                  </tr>
                </thead>
                <tbody>
                  {actualSubjects.map((subject, idx) => (
                    <tr key={subject} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="p-5 border border-gray-100 font-bold text-gray-700">{subject}</td>
                      <td className="p-5 border border-gray-100 text-center font-black text-xl text-gray-900">{(selectedStudent.grades[subject] || 0).toFixed(2)}</td>
                      <td className="p-5 border border-gray-100 text-center text-gray-400 font-bold">{(classAverages[subject] || 0).toFixed(2)}</td>
                      <td className="p-5 border border-gray-100 text-center">
                         <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${(selectedStudent.grades[subject] || 0) >= classAverages[subject] ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {(selectedStudent.grades[subject] || 0) >= classAverages[subject] ? 'فوق المتوسط' : 'تحت المتوسط'}
                         </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-blue-600 text-white">
                    <td className="p-6 text-xl font-black">المعدل العام الفصلي</td>
                    <td className="p-6 text-center text-4xl font-black" colSpan={3}>{studentGeneralAvg.toFixed(2)} / 20</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* OFFICIAL PRINT TEMPLATE (Hidden on screen, Visible on print) */}
          <div className="hidden print:block bg-white text-black p-4" dir="rtl">
            <style>{`
              @media print {
                @page { size: A4; margin: 1cm; }
                .print-container { width: 100%; font-family: 'Tajawal', sans-serif; color: black; }
                .print-header { display: flex; justify-content: space-between; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 15px; font-size: 10pt; font-weight: bold; }
                .print-title-box { border: 4px solid black; padding: 10px 40px; border-radius: 15px; display: inline-block; margin: 20px auto; font-size: 22pt; font-weight: 900; }
                .student-info-grid { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12pt; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                .official-table { width: 100%; border-collapse: collapse; border: 2px solid black; }
                .official-table th { background-color: #f2f2f2; border: 1px solid black; padding: 10px; font-size: 11pt; font-weight: 800; }
                .official-table td { border: 1px solid black; padding: 8px; text-align: center; font-size: 11pt; font-weight: bold; }
                .avg-row { background-color: #f9f9f9; font-weight: 900; }
                .final-avg-box { border: 3px solid black; margin-top: 15px; display: flex; align-items: center; }
                .final-avg-label { flex: 2; padding: 15px; border-left: 3px solid black; background-color: #f2f2f2; font-size: 14pt; font-weight: 900; text-align: right; }
                .final-avg-value { flex: 1; padding: 15px; font-size: 20pt; font-weight: 900; text-align: center; }
                .signatures { display: flex; justify-content: space-between; margin-top: 40px; font-size: 10pt; font-weight: bold; }
              }
            `}</style>
            
            <div className="print-container">
              <div className="print-header">
                <div className="text-right">
                  <p>الجمهورية الجزائرية الديمقراطية الشعبية</p>
                  <p>وزارة التربية الوطنية</p>
                </div>
                <div className="text-left">
                  <p>السنة الدراسية: 2024/2025</p>
                </div>
              </div>

              <div className="text-center">
                <div className="print-title-box">كشف نتائج الفصل</div>
              </div>

              <div className="student-info-grid">
                <p><strong>الاسم واللقب:</strong> {selectedStudent.name}</p>
                <p><strong>القسم:</strong> {selectedStudent.level} - {selectedStudent.section}</p>
              </div>

              <table className="official-table">
                <thead>
                  <tr>
                    <th style={{ width: '40%', textAlign: 'right' }}>المادة</th>
                    <th style={{ width: '20%' }}>معدل التلميذ</th>
                    <th style={{ width: '20%' }}>متوسط القسم</th>
                    <th style={{ width: '20%' }}>الملاحظات (مقارنة بالقسم)</th>
                  </tr>
                </thead>
                <tbody>
                  {actualSubjects.map((subject) => (
                    <tr key={subject}>
                      <td style={{ textAlign: 'right', paddingRight: '15px' }}>{subject}</td>
                      <td>{(selectedStudent.grades[subject] || 0).toFixed(2)}</td>
                      <td style={{ color: '#666' }}>{(classAverages[subject] || 0).toFixed(2)}</td>
                      <td style={{ fontSize: '9pt' }}>
                        {(selectedStudent.grades[subject] || 0) >= (classAverages[subject] || 0) ? 'أداء جيد' : 'متوسط القسم أفضل'}
                      </td>
                    </tr>
                  ))}
                  <tr className="avg-row">
                    <td style={{ textAlign: 'right', paddingRight: '15px' }}>معدل الفصل</td>
                    <td>{studentGeneralAvg.toFixed(2)}</td>
                    <td>{calculateAverage(Object.values(classAverages)).toFixed(2)}</td>
                    <td>أداء عام</td>
                  </tr>
                </tbody>
              </table>

              <div className="final-avg-box">
                <div className="final-avg-label">المعدل العام للفصل</div>
                <div className="final-avg-value">20 / {studentGeneralAvg.toFixed(2)}</div>
              </div>

              <div className="signatures">
                <div className="text-center">
                  <p className="underline mb-12">توقيع الولي:</p>
                  <p>........................</p>
                </div>
                <div className="text-center">
                  <p className="underline mb-12">ملاحظة مستشار التوجيه:</p>
                  <p>........................</p>
                </div>
                <div className="text-center">
                  <p className="underline mb-12">ختم وتوقيع المدير:</p>
                  <p>........................</p>
                </div>
              </div>

              <div className="mt-20 pt-4 border-t border-gray-200 text-[8pt] text-gray-400 text-center">
                 تم استخراج هذا الكشف آلياً عبر نظام تحليل البيانات المتقدمة - المبرمج عمار بولطيف © 2025
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedStudent && activeView === 'followup' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in print:hidden">
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                 <h4 className="text-lg font-black mb-6 flex items-center gap-3 text-blue-600">
                    <PlusCircle size={22} /> تدوين ملاحظة ميدانية
                 </h4>
                 <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-2">
                       {(['تحصيل', 'سلوك', 'مواظبة', 'ملاحظة عامة'] as const).map(cat => (
                          <button 
                             key={cat}
                             onClick={() => setNewNote({ ...newNote, category: cat })}
                             className={`py-2.5 rounded-xl text-[10px] font-black border-2 transition-all ${newNote.category === cat ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-white'}`}
                          >
                             {cat}
                          </button>
                       ))}
                    </div>
                    <textarea 
                       rows={5}
                       className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 text-sm font-bold transition-all"
                       placeholder="اكتب ملاحظاتك عن وضعية التلميذ وسلوكه..."
                       value={newNote.content}
                       onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    ></textarea>
                    <button 
                       onClick={handleAddNote}
                       disabled={!newNote.content.trim()}
                       className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all transform active:scale-95"
                    >
                       <Save size={20} /> حفظ الملاحظة
                    </button>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[500px]">
              <h4 className="text-xl font-black flex items-center gap-3 text-gray-800 mb-8">
                 <ClipboardList size={24} className="text-orange-500" />
                 سجل المتابعة البيداغوجي المرقمن
              </h4>
              <div className="space-y-4">
                 {studentNotes.map((note) => (
                    <div key={note.id} className="p-5 bg-gray-50/50 rounded-2xl border-2 border-gray-100 relative group animate-slide-up">
                       <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                             <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                                note.category === 'سلوك' ? 'bg-red-100 text-red-600' :
                                note.category === 'تحصيل' ? 'bg-green-100 text-green-600' :
                                note.category === 'مواظبة' ? 'bg-purple-100 text-purple-600' :
                                'bg-blue-100 text-blue-600'
                             }`}>
                                {note.category}
                             </div>
                             <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold">
                                <Calendar size={14} /> {note.date}
                             </div>
                          </div>
                          <button 
                             onClick={() => handleDeleteNote(note.id)}
                             className="p-2 text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all print:hidden"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                       <p className="text-sm text-gray-700 leading-relaxed font-bold whitespace-pre-wrap">{note.content}</p>
                    </div>
                 ))}
                 {studentNotes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                       <MessageSquare size={64} className="opacity-10 mb-4" />
                       <p className="text-sm font-bold">لا توجد ملاحظات مسجلة حالياً</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {selectedStudent && activeView === 'deep_analytics' && deepAnalyticsData && (
        <div className="space-y-8 animate-fade-in print:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h4 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
                <Target size={24} className="text-purple-600" />
                تحليل التوازن الأكاديمي (الرادار)
              </h4>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={deepAnalyticsData.radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 800 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 20]} tick={{ fontSize: 10 }} />
                    <Radar
                      name={selectedStudent.name}
                      dataKey="A"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                    />
                    <RechartsTooltip contentStyle={{ borderRadius: '15px', border: 'none', fontWeight: 'bold' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                <h4 className="text-sm font-black text-gray-400 uppercase mb-6 tracking-widest">مصفوفة نقاط القوة</h4>
                <div className="space-y-3">
                  {deepAnalyticsData.subjectVariances.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                      <div>
                        <p className="text-xs font-black text-green-900">{item.name}</p>
                        <p className="text-[10px] text-green-600 font-bold">فوق متوسط القسم بـ {item.variance.toFixed(2)} نقطة</p>
                      </div>
                      <div className="text-xl font-black text-green-700">{item.grade.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                <h4 className="text-sm font-black text-gray-400 uppercase mb-6 tracking-widest">فرص التحسين (الضعف)</h4>
                <div className="space-y-3">
                  {deepAnalyticsData.subjectVariances.slice(-3).reverse().map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                      <div>
                        <p className="text-xs font-black text-red-900">{item.name}</p>
                        <p className="text-[10px] text-red-600 font-bold">تحت متوسط القسم بـ {Math.abs(item.variance).toFixed(2)} نقطة</p>
                      </div>
                      <div className="text-xl font-black text-red-700">{item.grade.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
             <h4 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
                <BarChart4 size={24} className="text-blue-600" />
                تحليل الانحراف المعياري الفردي
             </h4>
             <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={deepAnalyticsData.subjectVariances}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
                   <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} />
                   <YAxis />
                   <RechartsTooltip />
                   <Bar dataKey="grade" name="معدل التلميذ" radius={[5, 5, 0, 0]}>
                     {deepAnalyticsData.subjectVariances.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.grade >= entry.classAvg ? '#10b981' : '#ef4444'} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAnalysis;
