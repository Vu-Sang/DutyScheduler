import { Employee, DutyCategory, DutyAssignment, OffDayRequest, NotificationItem, UserProfile } from '../types';

export const CURRENT_USER: UserProfile = {
  id: 'admin-1',
  name: 'Quản trị viên',
  role: 'Admin Phân công',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwzmS2tLHrDw7gYxfSc72nGSgCDVFG5oCFAbV5nePBUJGqRoTPqsAPSPye_Q8b6TlsDA_2dl5T0H_oekSJun8azXQSGFudLDHF8iiom5NTsoQRbK4SGwbABk-MghyowTRKrZuJViy_ESEdatQRcRx_qR5mCpBMPpS2Dtyk5qX6Z0OfxQjvAPB4Ecxu-geEjEeuG3O0BndcLXF8Pnlb33b0BxyneLde8CA9eZ45Yqks4cxb9wLQ7c0r',
  isManager: true,
  roleType: 'admin',
};

// EMPTY BLANK DATA
export const INITIAL_CATEGORIES: DutyCategory[] = [];
export const INITIAL_EMPLOYEES: Employee[] = [];
export const INITIAL_OFF_DAYS: OffDayRequest[] = [];
export const INITIAL_ASSIGNMENTS: DutyAssignment[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
