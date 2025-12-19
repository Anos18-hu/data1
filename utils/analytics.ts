
import { Student, SubjectStats } from '../types';
import * as XLSX from 'xlsx';

export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
};

export const calculateStandardDeviation = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const avg = calculateAverage(numbers);
  const squareDiffs = numbers.map(n => Math.pow(n - avg, 2));
  const avgSquareDiff = calculateAverage(squareDiffs);
  return Math.sqrt(avgSquareDiff);
};

export const calculateMode = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const frequency: Record<number, number> = {};
  let maxFreq = 0;
  let mode = numbers[0];

  for (const num of numbers) {
    frequency[num] = (frequency[num] || 0) + 1;
    if (frequency[num] > maxFreq) {
      maxFreq = frequency[num];
      mode = num;
    }
  }
  return mode;
};

export const analyzeSubject = (students: Student[], subjectName: string, classGlobalAverage: number): SubjectStats => {
  const grades = students
    .map(s => s.grades[subjectName])
    .filter(g => typeof g === 'number' && !isNaN(g));

  const average = calculateAverage(grades);
  const stdDev = calculateStandardDeviation(grades);
  const cv = average !== 0 ? (stdDev / average) * 100 : 0;
  const mode = calculateMode(grades);
  
  const countBelow8 = grades.filter(g => g < 8).length;
  const count8to9 = grades.filter(g => g >= 8 && g < 9).length;
  const count9to10 = grades.filter(g => g >= 9 && g < 10).length;
  const count10to12 = grades.filter(g => g >= 10 && g < 12).length;
  const count12to14 = grades.filter(g => g >= 12 && g < 14).length;
  const count14to16 = grades.filter(g => g >= 14 && g < 16).length;
  const count16to18 = grades.filter(g => g >= 16 && g < 18).length;
  const countAbove18 = grades.filter(g => g >= 18).length;

  const countAbove10 = grades.filter(g => g >= 10).length;
  const passPercentage = grades.length > 0 ? (countAbove10 / grades.length) * 100 : 0;

  const comparison = average > classGlobalAverage 
    ? 'أعلى من المعدل العام' 
    : average < classGlobalAverage 
      ? 'أقل من المعدل العام' 
      : 'مساوي للمعدل العام';

  return {
    name: subjectName,
    average,
    passPercentage,
    stdDev,
    cv,
    mode,
    countBelow8,
    count8to9,
    count9to10,
    count10to12,
    count12to14,
    count14to16,
    count16to18,
    countAbove18,
    countAbove10,
    comparison
  };
};

/**
 * وظيفة تصدير البيانات إلى ملف Excel بتنسيق احترافي يدعم اللغة العربية
 */
export const exportToExcel = (data: any[], fileName: string, sheetName: string = "التقرير") => {
  if (!data || data.length === 0) return;

  // إنشاء ورقة العمل من البيانات
  const ws = XLSX.utils.json_to_sheet(data);

  // 1. ضبط اتجاه الورقة من اليمين إلى اليسار (RTL)
  // 5. تجميد الصف الأول (الترويسة)
  ws['!views'] = [
    {
      RTL: true,
      state: 'frozen',
      ySplit: 1,
      activePane: 'bottomRight'
    }
  ];

  const range = XLSX.utils.decode_range(ws['!ref'] || "A1");
  
  // 4. تعريف نمط الحدود لكافة الخلايا
  const borderStyle = {
    top: { style: 'thin', color: { rgb: "000000" } },
    bottom: { style: 'thin', color: { rgb: "000000" } },
    left: { style: 'thin', color: { rgb: "000000" } },
    right: { style: 'thin', color: { rgb: "000000" } }
  };

  // 3. نمط الترويسة: خط عريض، خلفية رمادية فاتحة، محاذاة لليمين، خط Arial
  const headerStyle = {
    font: { name: 'Arial', bold: true, sz: 12, color: { rgb: "000000" } },
    fill: { fgColor: { rgb: "F2F2F2" } },
    alignment: { horizontal: 'right', vertical: 'center', readingOrder: 2 },
    border: borderStyle
  };

  // 2. نمط الخلايا العادية: محاذاة لليمين، خط Arial
  const cellStyle = {
    font: { name: 'Arial', sz: 11 },
    alignment: { horizontal: 'right', vertical: 'center', readingOrder: 2 },
    border: borderStyle
  };

  // تطبيق التنسيقات على كافة الخلايا في النطاق
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellRef]) {
        ws[cellRef] = { t: 's', v: '' }; // ضمان وجود الخلية لتطبيق الحدود
      }
      ws[cellRef].s = R === 0 ? headerStyle : cellStyle;
    }
  }

  // 6. حساب وعرض الأعمدة تلقائياً
  const objectMaxLength: number[] = [];
  const keys = Object.keys(data[0]);
  
  keys.forEach((key, i) => {
    let max = key.toString().length;
    data.forEach(row => {
      const val = row[key];
      if (val != null) {
        const len = val.toString().length;
        if (len > max) max = len;
      }
    });
    // إضافة مساحة إضافية للخطوط العربية لأنها غالباً ما تكون أعرض
    objectMaxLength[i] = max + 10;
  });

  ws['!cols'] = objectMaxLength.map(w => ({ wch: w }));

  // إنشاء مصنف العمل وحفظ الملف
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};
