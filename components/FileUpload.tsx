
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, AlertCircle, Files } from 'lucide-react';
import { Student } from '../types';

interface FileUploadProps {
  onDataLoaded: (students: Student[], subjects: string[]) => void;
  isAppending?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, isAppending = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatExcelDate = (val: any): string => {
    if (val === undefined || val === null || val === '') return '';
    
    let numericDate = NaN;
    if (typeof val === 'number') {
      numericDate = val;
    } else if (typeof val === 'string' && !isNaN(parseFloat(val))) {
      numericDate = parseFloat(val);
    }

    // Excel dates are usually between 20000 and 60000
    if (!isNaN(numericDate) && numericDate > 10000 && numericDate < 100000) {
      const date = new Date(Math.round((numericDate - 25569) * 86400 * 1000));
      const d = date.getDate().toString().padStart(2, '0');
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const y = date.getFullYear();
      return `${d}/${m}/${y}`;
    }
    
    return String(val).trim();
  };

  const extractLevelAndSection = (allRows: any[], ws: XLSX.WorkSheet): { level: string, section: string } => {
    let level = 'غير محدد';
    let section = 'الكل';

    const regex = /الفصل\s+(الأول|الثاني|الثالث)\s+(\d{4}-\d{4})\s+(أولى|ثانية|ثالثة|رابعة)\s+متوسط\s+(\d+)/;
    const levelMap: Record<string, string> = {
      'أولى': 'السنة الأولى متوسط',
      'ثانية': 'السنة الثانية متوسط',
      'ثالثة': 'السنة الثالثة متوسط',
      'رابعة': 'السنة الرابعة متوسط'
    };

    for (let i = 0; i < Math.min(allRows.length, 6); i++) {
      const row = allRows[i];
      if (!Array.isArray(row)) continue;

      for (const cell of row) {
        if (typeof cell !== 'string') continue;
        const match = cell.match(regex);
        if (match) {
          level = levelMap[match[3]] || `السنة ${match[3]} متوسط`;
          section = match[4].padStart(2, '0');
          return { level, section };
        }
      }
    }
    return { level, section };
  };

  const processFile = (file: File): Promise<{ students: Student[], subjects: string[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'array' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];

          const allRows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
          const { level, section } = extractLevelAndSection(allRows, ws);

          const range = XLSX.utils.decode_range(ws['!ref'] || "A1");
          range.s.r = 5; 
          ws['!ref'] = XLSX.utils.encode_range(range);

          const jsonData = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
          if (jsonData.length === 0) {
            resolve({ students: [], subjects: [] });
            return;
          }

          const headerRow = jsonData[0];
          const subjects = headerRow.slice(5).filter((s): s is string => typeof s === 'string' && s.trim().length > 0);
          const studentRows = jsonData.length > 2 ? jsonData.slice(1, -1) : jsonData.slice(1);

          const timestamp = Date.now();
          const students: Student[] = studentRows.map((row, idx) => {
            const col1 = row[1]; // اللقب أو الاسم الكامل
            const col2 = row[2]; // الاسم أو تاريخ الميلاد (في حال كان رقماً)
            
            let name = String(col1 || '').trim();
            let birthDate = '';
            
            // ذكاء اصطناعي بسيط: إذا كان العمود الثاني رقماً (Excel Date Serial)
            if (typeof col2 === 'number' || (typeof col2 === 'string' && !isNaN(Number(col2)) && Number(col2) > 20000)) {
              birthDate = formatExcelDate(col2);
            } else {
              // إذا لم يكن تاريخاً، نعتبره الاسم ونضيفه للقب
              const p2 = String(col2 || '').trim();
              if (p2) name = `${name} ${p2}`;
              // نبحث عن التاريخ في عمود آخر لاحق إذا لزم الأمر، لكن عادة col2 هو التاريخ في ملفات الرقمنة
            }

            // العمود الرابع هو index 3 للجنس
            let rawGender = String(row[3] || '').trim();
            let gender = 'غير محدد';
            if (rawGender.includes('ذكر')) gender = 'ذكر';
            else if (rawGender.includes('أنثى') || rawGender.includes('انثى')) gender = 'أنثى';

            const repeaterVal = row[4];
            const isRepeater = typeof repeaterVal === 'string' && (repeaterVal.trim() === 'نعم' || repeaterVal.trim() === 'م');

            const grades: Record<string, number> = {};
            subjects.forEach((subj, sIdx) => {
              const val = row[5 + sIdx];
              if (typeof val === 'number') grades[subj] = val;
              else if (typeof val === 'string' && !isNaN(parseFloat(val))) grades[subj] = parseFloat(val);
            });

            return {
              id: `s-${timestamp}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
              name,
              birthDate,
              gender,
              level,
              section,
              isRepeater,
              grades
            };
          }).filter(s => s.name && s.name.trim() !== "" && !s.name.includes('المجموع'));

          resolve({ students, subjects });
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setLoading(true);
    setError(null);
    try {
      // Fix: Explicitly cast the iterator item as 'File' to resolve TypeScript 'unknown' assignment error.
      const allResults = await Promise.all(Array.from(files).map((f: File) => processFile(f)));
      const combinedStudents: Student[] = [];
      const combinedSubjects = new Set<string>();
      allResults.forEach(res => {
        combinedStudents.push(...res.students);
        res.subjects.forEach(s => combinedSubjects.add(s));
      });
      onDataLoaded(combinedStudents, Array.from(combinedSubjects));
    } catch (err: any) {
      setError(err.message || "فشل تحليل الملفات.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center max-w-2xl mx-auto ${isAppending ? 'mt-4' : 'mt-10 animate-fade-in'}`}>
      <div className="mb-4 flex justify-center text-blue-600">
        {isAppending ? <Files size={48} strokeWidth={1.5} /> : <FileSpreadsheet size={64} strokeWidth={1.5} />}
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">نافذة تحميل الملفات</h2>
      <div className="relative group">
        <input type="file" accept=".xlsx, .xls" multiple onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={loading} />
        <div className={`flex items-center justify-center gap-3 px-6 py-4 rounded-lg border-2 border-dashed transition-all ${loading ? 'bg-gray-50 border-gray-300' : 'bg-blue-50 border-blue-300 hover:bg-blue-100'}`}>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-700 font-medium">جاري معالجة البيانات...</span>
            </div>
          ) : (
            <><Upload className="text-blue-600" size={24} /><span className="text-blue-700 font-bold">رفع ملفات الكشوف (معالجة تلقائية للتاريخ)</span></>
          )}
        </div>
      </div>
      {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm"><AlertCircle size={20} className="inline ml-2"/>{error}</div>}
    </div>
  );
};

export default FileUpload;
