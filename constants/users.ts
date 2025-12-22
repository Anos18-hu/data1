export interface UserAccount {
  username: string;
  password: string;
  role: 'admin' | 'user';
  fullName: string;
  position: string;
  employeeId: string;
  email: string;
  joinDate: string;
  isActive: boolean;
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
    position: 'مستشارة التوجيه المدرسي',
    employeeId: 'GSP-2025-011',
    email: 's.ahmadi@edu-analytics.dz',
    joinDate: '2022-01-15',
    isActive: true
  },

  {
    username: 'gosp02',
    password: 'gosp202221a',
    role: 'user',
    fullName: 'محمد بن سالم',
    position: 'مستشار التوجيه والإرشاد',
    employeeId: 'GSP-2025-012',
    email: 'm.salem@edu-analytics.dz',
    joinDate: '2023-11-10',
    isActive: true
  },

  {
    username: 'gosp03',
    password: 'gosp2025b',
    role: 'user',
    fullName: 'ليلى بن يوسف',
    position: 'مستشارة التوجيه المدرسي',
    employeeId: 'GSP-2025-013',
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
    employeeId: 'GSP-2025-014',
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
    employeeId: 'GSP-2025-015',
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
    employeeId: 'GSP-2025-016',
    email: 'a.tayeb@edu-analytics.dz',
    joinDate: '2025-01-10',
    isActive: true
  },

  {
    username: 'gosp07',
    password: 'gosp2025g',
    role: 'user',
    fullName: 'سميرة قادري',
    position: 'مستشارة التوجيه المدرسي',
    employeeId: 'GSP-2025-017',
    email: 's.kadri@edu-analytics.dz',
    joinDate: '2025-01-12',
    isActive: true
  },

  {
    username: 'gosp08',
    password: 'gosp2025h',
    role: 'user',
    fullName: 'نذير بوقرة',
    position: 'مستشار التوجيه المدرسي',
    employeeId: 'GSP-2025-018',
    email: 'n.bougra@edu-analytics.dz',
    joinDate: '2025-01-15',
    isActive: true
  },

  {
    username: 'gosp09',
    password: 'gosp2025i',
    role: 'user',
    fullName: 'إيمان شريف',
    position: 'مستشارة التوجيه المدرسي',
    employeeId: 'GSP-2025-019',
    email: 'i.cherif@edu-analytics.dz',
    joinDate: '2025-01-18',
    isActive: true
  },

  {
    username: 'gosp10',
    password: 'gosp2025j',
    role: 'user',
    fullName: 'عبد الرحمن عياد',
    position: 'مستشار التوجيه المدرسي',
    employeeId: 'GSP-2025-020',
    email: 'a.ayad@edu-analytics.dz',
    joinDate: '2025-01-20',
    isActive: true
  },

  {
    username: 'gosp11',
    password: 'gosp2025k',
    role: 'user',
    fullName: 'مريم زروقي',
    position: 'مستشارة التوجيه المدرسي',
    employeeId: 'GSP-2025-021',
    email: 'm.zrouki@edu-analytics.dz',
    joinDate: '2025-01-22',
    isActive: true
  },

  {
    username: 'gosp12',
    password: 'gosp2025l',
    role: 'user',
    fullName: 'كمال بن يوسف',
    position: 'مستشار التوجيه المدرسي',
    employeeId: 'GSP-2025-022',
    email: 'k.benyoussef@edu-analytics.dz',
    joinDate: '2025-01-25',
    isActive: true
  },

  {
    username: 'gosp13',
    password: 'gosp2025m',
    role: 'user',
    fullName: 'فاطمة بلقاسم',
    position: 'مستشارة التوجيه المدرسي',
    employeeId: 'GSP-2025-023',
    email: 'f.belkacem@edu-analytics.dz',
    joinDate: '2025-01-28',
    isActive: true
  },

  {
    username: 'gosp14',
    password: 'gosp2025n',
    role: 'user',
    fullName: 'يوسف حميدي',
    position: 'مستشار التوجيه المدرسي',
    employeeId: 'GSP-2025-024',
    email: 'y.hamidi@edu-analytics.dz',
    joinDate: '2025-02-01',
    isActive: true
  }
];







];
