import { Employee, DutyCategory, DutyAssignment, OffDayRequest, NotificationItem, UserProfile } from '../types';

export const CURRENT_USER: UserProfile = {
  id: 'admin-1',
  name: 'Quản trị viên',
  role: 'Admin Phân công',
  avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23003d9b"/><circle cx="50" cy="38" r="22" fill="%23ffffff"/><path d="M 20,88 C 20,64 32,54 50,54 C 68,54 80,64 80,88 Z" fill="%23ffffff"/></svg>',
  isManager: true,
  roleType: 'admin',
};

// EMPTY BLANK DATA
export const INITIAL_CATEGORIES: DutyCategory[] = [];
export const INITIAL_EMPLOYEES: Employee[] = [];
export const INITIAL_OFF_DAYS: OffDayRequest[] = [];
export const INITIAL_ASSIGNMENTS: DutyAssignment[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
