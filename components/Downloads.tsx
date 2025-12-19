
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { DownloadCloud, Upload, FileCheck, FileX, Loader2, AlertCircle, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { Student, SubjectStats } from '../types';
import { analyzeSubject, calculateAverage } from '../utils/analytics';

interface DownloadsProps {
  students: Student[];
  subjects: string[];
}

const STAT_KEYWORDS: Record<string, keyof SubjectStats> = {
  'معدل': 'average',
  'المعدل': 'average',
  'نسبة': 'passPercentage',
  'النسبة': 'passPercentage',
  'ناجح': 'countAbove10',
  'الناجحين': 'countAbove10',
  'المتحصلين': 'countAbove10',
  'معدل المادة': 'average',
  'نسبة النجاح': 'passPercentage'
};

const Downloads: React.FC<DownloadsProps> = ({ students, subjects }) => {
  const [templateWorkbook, setTemplateWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploaded' | 'filling' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultWorkbook, setResultWorkbook] = useState<XLSX.WorkBook | null>(null);

  const allSubjectStats = useMemo(() => {
    const globalAvg = calculateAverage(students.flatMap(s => Object.values(s.grades)).filter(g => typeof g === 'number'));
    return subjects.reduce((acc, sub) => {
      acc[sub] = analyzeSubject(students, sub, globalAvg);
      return acc;
    }, {} as Record<string, SubjectStats>);
  }, [students, subjects]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('idle');
    setErrorMessage(null);
    setTemplateFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array', cellStyles: true });
        setTemplateWorkbook(wb);
        setStatus('uploaded');
      } catch (err: any) {
        setStatus('error');
        setErrorMessage("فشل في قراءة ملف Excel.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const fillTemplateLogic = () => {
    if (!templateWorkbook) return;
    setStatus('filling');

    setTimeout(() => {
      try {
        const wb = JSON.parse(JSON.stringify(templateWorkbook));
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
        
        const subjectLocations: { r: number, c: number, name: string }[] = [];
        const statLocations: { r: number, c: number, key: keyof SubjectStats }[] = [];

        for (let r = range.s.r; r <= range.e.r; r++) {
          for (let c = range.s.c; c <= range.e.c; c++) {
            const cellAddress = XLSX.utils.encode_cell({ r, c });
            const cell = ws[cellAddress];
            if (!cell || !cell.v) continue;

            const val = String(cell.v).trim();
            const matchedSubject = subjects.find(s => val === s || s.includes(val) || val.includes(s));
            if (matchedSubject) {
              subjectLocations.push({ r, c, name: matchedSubject });
            }

            for (const [keyword, key] of Object.entries(STAT_KEYWORDS)) {
              if (val.includes(keyword)) {
                statLocations.push({ r, c, key });
                break;
              }
            }
          }
        }

        subjectLocations.forEach(subLoc => {
          statLocations.forEach(statLoc => {
            const targetR = subLoc.r;
            const targetC = statLoc.c;
            const targetAddr = XLSX.utils.encode_cell({ r: targetR, c: targetC });
            
            if (!ws[targetAddr] || ws[targetAddr].v === undefined || ws[targetAddr].v === null || ws[targetAddr].v === "") {
              const value = allSubjectStats[subLoc.name][statLoc.key];
              ws[targetAddr] = { 
                t: typeof value === 'number' ? 'n' : 's', 
                v: typeof value === 'number' ? Number(value.toFixed(2)) : value 
              };
            }
          });
        });

        statLocations.forEach(statLoc => {
          subjectLocations.forEach(subLoc => {
            const targetR = statLoc.r;
            const targetC = subLoc.c;
            const targetAddr = XLSX.utils.encode_cell({ r: targetR, c: targetC });

            if (!ws[targetAddr] || ws[targetAddr].v === undefined || ws[targetAddr].v === null || ws[targetAddr].v === "") {
              const value = allSubjectStats[subLoc.name][statLoc.key];
              ws[targetAddr] = { 
                t: typeof value === 'number' ? 'n' : 's', 
                v: typeof value === 'number' ? Number(value.toFixed(2)) : value 
              };
            }
          });
        });

        setResultWorkbook(wb);
        setStatus('ready');
      } catch (err) {
        setStatus('error');
        setErrorMessage("حدث خطأ أثناء معالجة النموذج.");
      }
    }, 800);
  };

  const downloadResult = () => {
    if (!resultWorkbook) return;
    XLSX.writeFile(resultWorkbook, `التقرير_المعبأ_${Date.now()}.xlsx`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <DownloadCloud size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">تعبئة النماذج الذكية</h2>
            <p className="text-gray-500 text-sm">ارفع ملف Excel لتعبئة البيانات تلقائياً.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">1. اختيار النموذج الأصلي</label>
            <div className="relative group">
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={status === 'filling'}
              />
              <div className={`p-8 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 ${
                status === 'uploaded' || status === 'ready' ? 'bg-green-50 border-green-300' : 
                status === 'error' ? 'bg-red-50 border-red-300' : 
                'bg-gray-50 border-gray-300 group-hover:border-blue-400'
              }`}>
                {status === 'uploaded' || status === 'ready' ? (
                  <CheckCircle2 className="text-green-600" size={48} />
                ) : status === 'error' ? (
                  <FileX className="text-red-500" size={48} />
                ) : (
                  <Upload className="text-gray-400 group-hover:text-blue-500" size={48} />
                )}
                <div className="text-center">
                  <span className="block text-sm font-bold text-gray-700">
                    {templateFile ? templateFile.name : "اسحب النموذج هنا"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
            <button
              onClick={fillTemplateLogic}
              disabled={status !== 'uploaded' && status !== 'ready'}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-sm transition-all ${
                status === 'uploaded' || status === 'ready'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {status === 'filling' ? <Loader2 className="animate-spin" size={20} /> : <FileCheck size={20} />}
              تعبئة الخلايا
            </button>

            <button
              onClick={downloadResult}
              disabled={status !== 'ready'}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-sm transition-all ${
                status === 'ready' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              <DownloadCloud size={20} />
              تحميل الملف
            </button>
          </div>
        </div>

        {status === 'error' && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="text-sm font-bold">{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Downloads;
