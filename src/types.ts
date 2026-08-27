export type TabType = 'calendar' | 'offdays' | 'categories' | 'employees' | 'dashboard' | 'my_schedule';

export interface DutyCategory {
  id: string;
  name: string;
  icon: string;
  color: string; // Hex or CSS color string
  description?: string;
}

export interface DutyAssignment {
  id: string;
  date: string; // YYYY-MM-DD
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  assignedEmployeeRole?: string;
  assignedEmployeeAvatar?: string;
  notes?: string;
  
  // Proof & Completion fields
  status?: 'upcoming' | 'completed';
  proofImage?: string;
  completedAt?: string;
  completionNotes?: string;

  // Admin Penalty fields
  adminNotes?: string;
  penaltyStatus?: 'penalty' | 'normal';
  fineAmount?: number; // Fine amount in VND (e.g., 50000)
  penaltyImage?: string; // Proof image of dirty/uncleaned area uploaded by Admin
}

export type OffDayStatus = 'approved' | 'pending' | 'rejected';

export interface OffDayRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  employeeRole?: string;
  date: string; // YYYY-MM-DD
  dayFormatted: string; // e.g. "Thứ 6, 04/10/2024"
  reason?: string;
  status: OffDayStatus;
  createdAt: string;
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatar?: string;
  initials?: string;
  accentColor: 'primary' | 'secondary' | 'tertiary';
  shiftsCompleted: number;
  offDaysUsed: number;
  maxOffDaysPerMonth: number;
  skills: string[];
  isActive: boolean;
  username?: string;
  password?: string;
  faceDescriptor?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'shift' | 'offday' | 'system';
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isManager: boolean;
  roleType: 'admin' | 'user';
  employeeId?: string;
}
