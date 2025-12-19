
export interface UserAccount {
  username: string;
  password: string;
  role: 'admin' | 'user';
  fullName: string;
  position: string;
  employeeId: string;
  email: string;
  joinDate: string;
  isActive: boolean; // خاصية التحكم في تفعيل الحساب
}

export const USERS_DATA: UserAccount[] = [
  { 
    username: 'admin', 
    password: '2020admin', 
    role: 'admin', 
    fullName: 'أ. عمار بولطيف', 
    position: 'مدير النظام / مستشار رئيسي', 
    employeeId: 'ADM-2025-001', 
    email: 'admin@edu-analytics.dz',
    joinDate: '2020-09-01',
    isActive: true
  },
  { 
    username: 'gosp01', 
    password: 'gosp20250a', 
    role: 'user', 
    fullName: 'سعاد أحمدي', 
    position: 'مستشار التوجيه المدرسي', 
    employeeId: 'GSP-2025-012', 
    email: 's.ahmadi@edu-analytics.dz',
    joinDate: '2022-01-15',
    isActive: true
  },
  { 
    username: 'gosp02', 
    password: 'gosp202221a', 
    role: 'user', 
    fullName: 'محمد بن سالم', 
    position: 'مستشار التوجيه والارشاد', 
    employeeId: 'GSP-2025-013', 
    email: 'm.salem@edu-analytics.dz',
    joinDate: '2023-11-10',
    isActive: true
  }
];
