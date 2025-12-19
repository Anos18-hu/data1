
export interface Student {
  id: string;
  name: string;
  birthDate?: string;
  gender: string; // 'ذكر' or 'أنثى' or 'غير محدد'
  isRepeater: boolean; // هل التلميذ معيد للسنة؟
  level: string; // السنة الأولى متوسط، السنة الثانية، الخ
  section: string; // رقم القسم (1، 2، 3...)
  grades: Record<string, number>;
}

export interface FollowUpNote {
  id: string;
  studentId: string;
  date: string;
  content: string;
  category: 'تحصيل' | 'سلوك' | 'مواظبة' | 'ملاحظة عامة';
  author: string;
}

export interface SubjectStats {
  name: string;
  average: number;
  passPercentage: number;
  stdDev: number;
  cv: number; // Coefficient of Variation
  mode: number;
  countBelow8: number;
  count8to9: number;
  count9to10: number;
  count10to12: number;
  count12to14: number;
  count14to16: number;
  count16to18: number;
  countAbove18: number;
  countAbove10: number;
  comparison: string; // Compared to class average of all subjects
}

export interface CategoryStats {
  totalStudents: number;
  totalFemales: number;
  amazighStudents: number;
  artStudents: number;
  musicStudents: number;
  successfulStudents: number;
  successfulFemales: number;
  successfulMales: number;
}

// --- نظام الإرشاد المدرسي ---

export type CaseType = 'تربوية' | 'سلوكية' | 'نفسية' | 'اجتماعية' | 'أخرى';
export type CaseStatus = 'قيد الدراسة' | 'متابعة نشطة' | 'مستقرة' | 'تم الحل' | 'محالة لجهة خارجية';
export type ReferralSource = 'أستاذ' | 'إدارة' | 'ولي أمر' | 'تلقائي';

export interface CommitteeDecision {
  id: string;
  date: string;
  decisionText: string;
  interventionType: 'وقائي' | 'علاجي' | 'توجيهي';
  expectedDuration: string;
}

export interface FollowUpSession {
  id: string;
  date: string;
  observations: string;
  progress: 'تحسن' | 'استقرار' | 'تراجع';
}

export interface CounselingCase {
  id: string;
  studentId: string;
  studentName: string;
  level: string;
  section: string;
  type: CaseType;
  referralSource: ReferralSource;
  referralReason: string;
  description: string;
  status: CaseStatus;
  createdAt: string;
  decisions: CommitteeDecision[];
  sessions: FollowUpSession[];
  isArchived: boolean;
}
