
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
    },
    {
      username: 'gosp03',
      password: 'gosp2025b',
      role: 'user',
      fullName: 'ليلى بن يوسف',
      position: 'مستشارة التوجيه المدرسي',
      employeeId: 'GSP-2025-014',
      email: 'l.benyoussef@edu-analytics.dz',
      joinDate: '2024-02-20',
      isActive: true
    },
    {
      username: 'gosp04',
      password: 'gosp2020b',
      role: 'user',
      fullName: 'ليلى بن يوسف',
      position: 'مستشارة التوجيه المدرسي',
      employeeId: 'GSP-2025-015',
      email: 'l.benyoussef@edu-analytics.dz',
      joinDate: '2024-02-20',
      isActive: true
    },
    {
      username: 'gosp05',
      password: 'gosp2024c',
      role: 'user',
      fullName: 'ليلى بن يوسف',
      position: 'مستشارة التوجيه المدرسي',
      employeeId: 'GSP-2025-016',
      email: 'l.benyoussef@edu-analytics.dz',
      joinDate: '2024-02-20',
      isActive: true
    },
    {
      username: 'gosp06',
      password: 'gosp2025f',
      role: 'user',
      fullName: 'أحمد الطيب',
      position: 'مستشار التوجيه المدرسي',
      employeeId: 'GSP-2025-017',
      email: 'a.tayeb@edu-analytics.dz',
      joinDate: '2025-12-01',
      isActive: true
    }
  ];
}
{
  username: 'gosp05',
  password: 'gosp2024c',
  role: 'user',
  fullName: 'ليلى بن يوسف',
  position: 'مستشارة التوجيه المدرسي',
  employeeId: 'GSP-2025-016',
  email: 'l.benyoussef@edu-analytics.dz',
  joinDate: '2024-02-20',
  isActive: true
}







];
