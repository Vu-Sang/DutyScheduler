import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';
import {
  TabType,
  Employee,
  DutyCategory,
  DutyAssignment,
  OffDayRequest,
  NotificationItem,
  UserProfile,
} from '../types';
import {
  CURRENT_USER,
  INITIAL_EMPLOYEES,
  INITIAL_CATEGORIES,
  INITIAL_ASSIGNMENTS,
  INITIAL_OFF_DAYS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

interface DutyContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  categories: DutyCategory[];
  employees: Employee[];
  assignments: DutyAssignment[];
  offDays: OffDayRequest[];
  notifications: NotificationItem[];

  // Authentication & Role
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  loginAsAdmin: () => void;
  loginAsEmployee: (empId: string) => void;
  logout: () => void;
  
  selectedMonth: number; // 0-11
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;

  // Category Actions
  addCategory: (cat: Omit<DutyCategory, 'id'>) => void;
  updateCategory: (cat: DutyCategory) => void;
  deleteCategory: (id: string) => void;

  // Duty Assignment Actions
  addAssignment: (assignment: Omit<DutyAssignment, 'id'>) => void;
  updateAssignment: (assignment: DutyAssignment) => void;
  deleteAssignment: (id: string) => void;
  clearMonthAssignments: (month: number, year: number) => Promise<void>;
  completeDutyWithProof: (assignmentId: string, proofImage: string, notes?: string) => void;
  autoScheduleDuty: (month: number, year: number) => Promise<{ count: number; error?: string }>;
  
  // Off Day Actions (Admin flow)
  toggleEmployeeOffDay: (employeeId: string, dateStr: string, reason?: string) => void;
  approveOffDay: (id: string) => void;
  rejectOffDay: (id: string) => void;

  // Employee Actions
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;

  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Modal States
  createAssignmentModalOpen: boolean;
  setCreateAssignmentModalOpen: (open: boolean) => void;
  createAssignmentPreselectedDate: string | null;
  setCreateAssignmentPreselectedDate: (date: string | null) => void;
  
  selectedAssignmentForDetail: DutyAssignment | null;
  setSelectedAssignmentForDetail: (assignment: DutyAssignment | null) => void;

  employeeModalOpen: boolean;
  setEmployeeModalOpen: (open: boolean) => void;
  editingEmployee: Employee | null;
  setEditingEmployee: (emp: Employee | null) => void;

  categoryModalOpen: boolean;
  setCategoryModalOpen: (open: boolean) => void;
  editingCategory: DutyCategory | null;
  setEditingCategory: (cat: DutyCategory | null) => void;

  autoScheduleModalOpen: boolean;
  setAutoScheduleModalOpen: (open: boolean) => void;

  proofModalOpen: boolean;
  setProofModalOpen: (open: boolean) => void;
  dutyForProof: DutyAssignment | null;
  setDutyForProof: (duty: DutyAssignment | null) => void;
}

const DutyContext = createContext<DutyContextType | undefined>(undefined);

export const DutyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('duty_is_logged_in') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('duty_current_user_v3');
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });
  
  // Dynamic current real date & time initialization
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());

  // Core Data States
  const [categories, setCategories] = useState<DutyCategory[]>(INITIAL_CATEGORIES);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [assignments, setAssignments] = useState<DutyAssignment[]>(INITIAL_ASSIGNMENTS);
  const [offDays, setOffDays] = useState<OffDayRequest[]>(INITIAL_OFF_DAYS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Modal controllers
  const [createAssignmentModalOpen, setCreateAssignmentModalOpen] = useState(false);
  const [createAssignmentPreselectedDate, setCreateAssignmentPreselectedDate] = useState<string | null>(null);
  const [selectedAssignmentForDetail, setSelectedAssignmentForDetail] = useState<DutyAssignment | null>(null);
  
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DutyCategory | null>(null);

  const [autoScheduleModalOpen, setAutoScheduleModalOpen] = useState(false);

  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [dutyForProof, setDutyForProof] = useState<DutyAssignment | null>(null);

  // Sync with Supabase on mount
  useEffect(() => {
    const fetchSupabaseData = async () => {
      try {
        // Fetch Categories
        const { data: catData } = await supabase.from('duty_categories').select('*');
        if (catData && catData.length > 0) {
          setCategories(catData.map(c => ({
            id: c.id,
            name: c.name,
            icon: c.icon,
            color: c.color,
            description: c.description,
          })));
        }

        // Fetch Employees
        const { data: empData } = await supabase.from('employees').select('*');
        if (empData && empData.length > 0) {
          setEmployees(empData.map(e => ({
            id: e.id,
            name: e.name,
            role: e.role,
            department: e.department,
            email: e.email || '',
            phone: e.phone || '',
            avatar: e.avatar,
            initials: e.initials,
            accentColor: (e.accent_color as any) || 'primary',
            shiftsCompleted: e.shifts_completed || 0,
            offDaysUsed: e.off_days_used || 0,
            maxOffDaysPerMonth: e.max_off_days_per_month || 4,
            skills: ['Quét nhà', 'Lau nhà'],
            isActive: e.is_active !== false,
          })));
        }

        // Fetch Off Days
        const { data: offData } = await supabase.from('off_days').select('*');
        if (offData && offData.length > 0) {
          setOffDays(offData.map(o => ({
            id: o.id,
            employeeId: o.employee_id,
            employeeName: o.employee_name,
            employeeAvatar: o.employee_avatar,
            employeeRole: o.employee_role,
            date: o.date,
            dayFormatted: o.day_formatted || o.date,
            reason: o.reason,
            status: o.status || 'approved',
            createdAt: o.created_at,
          })));
        }

        // Fetch Duty Assignments
        const { data: assignData } = await supabase.from('duty_assignments').select('*');
        if (assignData && assignData.length > 0) {
          setAssignments(assignData.map(a => ({
            id: a.id,
            date: a.date,
            categoryId: a.category_id,
            categoryName: a.category_name,
            categoryIcon: a.category_icon,
            categoryColor: a.category_color,
            assignedEmployeeId: a.assigned_employee_id,
            assignedEmployeeName: a.assigned_employee_name,
            assignedEmployeeRole: a.assigned_employee_role,
            assignedEmployeeAvatar: a.assigned_employee_avatar,
            notes: a.notes,
            status: a.status || 'upcoming',
            proofImage: a.proof_image,
            completedAt: a.completed_at,
            completionNotes: a.completion_notes,
            adminNotes: a.admin_notes,
            penaltyStatus: a.penalty_status,
            fineAmount: a.fine_amount,
            penaltyImage: a.penalty_image,
          })));
        }
      } catch (err) {
        console.warn('Supabase fetch error, fallback to local state', err);
      }
    };

    fetchSupabaseData();
  }, []);

  useEffect(() => {
    localStorage.setItem('duty_is_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('duty_current_user_v3', JSON.stringify(currentUser));
  }, [currentUser]);

  // Auth Helpers
  const loginAsAdmin = () => {
    const adminUser: UserProfile = {
      id: 'admin-1',
      name: 'Quản trị viên',
      role: 'Admin Phân công',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwzmS2tLHrDw7gYxfSc72nGSgCDVFG5oCFAbV5nePBUJGqRoTPqsAPSPye_Q8b6TlsDA_2dl5T0H_oekSJun8azXQSGFudLDHF8iiom5NTsoQRbK4SGwbABk-MghyowTRKrZuJViy_ESEdatQRcRx_qR5mCpBMPpS2Dtyk5qX6Z0OfxQjvAPB4Ecxu-geEjEeuG3O0BndcLXF8Pnlb33b0BxyneLde8CA9eZ45Yqks4cxb9wLQ7c0r',
      isManager: true,
      roleType: 'admin',
    };
    setCurrentUser(adminUser);
    setIsLoggedIn(true);
    setActiveTab('calendar');
  };

  const loginAsEmployee = (empId: string) => {
    const emp = employees.find(e => e.id === empId) || employees[0];
    const userProfile: UserProfile = {
      id: emp ? emp.id : 'emp-guest',
      name: emp ? emp.name : 'Nhân viên',
      role: emp ? emp.role : 'Nhân viên trực nhật',
      avatar: emp ? emp.avatar || '' : '',
      isManager: false,
      roleType: 'user',
      employeeId: emp ? emp.id : 'emp-guest',
    };
    setCurrentUser(userProfile);
    setIsLoggedIn(true);
    setActiveTab('my_schedule');
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  // Category Actions
  const addCategory = async (data: Omit<DutyCategory, 'id'>) => {
    const newCat: DutyCategory = {
      ...data,
      id: `cat-${Date.now()}`,
    };
    setCategories(prev => [...prev, newCat]);

    try {
      await supabase.from('duty_categories').insert({
        id: newCat.id,
        name: newCat.name,
        icon: newCat.icon,
        color: newCat.color,
        description: newCat.description,
      });
    } catch {
      // fallback
    }
  };

  const updateCategory = async (updated: DutyCategory) => {
    setCategories(prev => prev.map(c => (c.id === updated.id ? updated : c)));

    try {
      await supabase.from('duty_categories').update({
        name: updated.name,
        icon: updated.icon,
        color: updated.color,
        description: updated.description,
      }).eq('id', updated.id);
    } catch {
      // fallback
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));

    try {
      await supabase.from('duty_categories').delete().eq('id', id);
    } catch {
      // fallback
    }
  };

  // Duty Assignment Actions
  const addAssignment = async (newDutyData: Omit<DutyAssignment, 'id'>) => {
    const newAssignment: DutyAssignment = {
      ...newDutyData,
      status: 'upcoming',
      id: `assign-${Date.now()}`,
    };
    setAssignments(prev => [newAssignment, ...prev]);

    try {
      await supabase.from('duty_assignments').insert({
        id: newAssignment.id,
        date: newAssignment.date,
        category_id: newAssignment.categoryId,
        category_name: newAssignment.categoryName,
        category_icon: newAssignment.categoryIcon,
        category_color: newAssignment.categoryColor,
        assigned_employee_id: newAssignment.assignedEmployeeId,
        assigned_employee_name: newAssignment.assignedEmployeeName,
        assigned_employee_role: newAssignment.assignedEmployeeRole,
        assigned_employee_avatar: newAssignment.assignedEmployeeAvatar,
        notes: newAssignment.notes,
        status: newAssignment.status,
        admin_notes: newAssignment.adminNotes,
        penalty_status: newAssignment.penaltyStatus,
        fine_amount: newAssignment.fineAmount,
        penalty_image: newAssignment.penaltyImage,
      });
    } catch {
      // fallback
    }
  };

  const updateAssignment = async (updated: DutyAssignment) => {
    setAssignments(prev => prev.map(a => (a.id === updated.id ? updated : a)));

    try {
      await supabase.from('duty_assignments').update({
        assigned_employee_id: updated.assignedEmployeeId,
        assigned_employee_name: updated.assignedEmployeeName,
        assigned_employee_role: updated.assignedEmployeeRole,
        assigned_employee_avatar: updated.assignedEmployeeAvatar,
        notes: updated.notes,
        status: updated.status,
        proof_image: updated.proofImage,
        completed_at: updated.completedAt,
        completion_notes: updated.completionNotes,
        admin_notes: updated.adminNotes,
        penalty_status: updated.penaltyStatus,
        fine_amount: updated.fineAmount,
        penalty_image: updated.penaltyImage,
      }).eq('id', updated.id);
    } catch {
      // fallback
    }
  };

  const deleteAssignment = async (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));

    try {
      await supabase.from('duty_assignments').delete().eq('id', id);
    } catch {
      // fallback
    }
  };

  const clearMonthAssignments = async (month: number, year: number) => {
    const monthAssigns = assignments.filter(a => {
      const [sYear, sMonth] = a.date.split('-').map(Number);
      return sYear === year && sMonth === month + 1;
    });

    setAssignments(prev => prev.filter(a => {
      const [sYear, sMonth] = a.date.split('-').map(Number);
      return !(sYear === year && sMonth === month + 1);
    }));

    try {
      for (const a of monthAssigns) {
        await supabase.from('duty_assignments').delete().eq('id', a.id);
      }
    } catch {
      // fallback
    }
  };

  // Complete duty with proof photo uploaded by User
  const completeDutyWithProof = async (assignmentId: string, proofImage: string, notes = '') => {
    const target = assignments.find(a => a.id === assignmentId);
    if (!target) return;

    const completedAt = new Date().toLocaleString('vi-VN');
    const updated: DutyAssignment = {
      ...target,
      status: 'completed',
      proofImage,
      completionNotes: notes,
      completedAt,
    };

    setAssignments(prev => prev.map(a => (a.id === assignmentId ? updated : a)));

    try {
      await supabase.from('duty_assignments').update({
        status: 'completed',
        proof_image: proofImage,
        completion_notes: notes,
        completed_at: completedAt,
      }).eq('id', assignmentId);
    } catch {
      // fallback
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Hoàn thành trực nhật',
        message: `${target.assignedEmployeeName} đã cập nhật ảnh minh chứng hoàn thành (${target.categoryName}).`,
        time: 'Vừa xong',
        read: false,
        type: 'shift',
      },
      ...prev,
    ]);
  };

  // CROSS-MONTH PERFECT EQUAL BALANCING ALGORITHM
  const autoScheduleDuty = async (month: number, year: number): Promise<{ count: number; error?: string }> => {
    return new Promise(resolve => {
      setTimeout(async () => {
        const activeEmps = employees.filter(e => e.isActive);
        if (activeEmps.length === 0) {
          resolve({ count: 0, error: 'Chưa có nhân viên trong hệ thống! Vui lòng thêm nhân viên tại mục "Quản lý nhân viên" trước.' });
          return;
        }

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const generatedAssignments: DutyAssignment[] = [];

        // Track off days
        const offDayMap = new Map<string, Set<string>>();
        offDays
          .filter(o => o.status === 'approved')
          .forEach(o => {
            if (!offDayMap.has(o.date)) {
              offDayMap.set(o.date, new Set());
            }
            offDayMap.get(o.date)!.add(o.employeeId);
          });

        // Dynamic categories created by Admin
        const dutyRoles = categories.length > 0 ? categories.map(cat => ({
          catId: cat.id,
          catName: cat.name,
          icon: cat.icon || 'task_alt',
          color: cat.color || '#003d9b',
          notes: cat.description || cat.name,
        })) : [
          {
            catId: 'cat-1',
            catName: 'Trực nhật tổng hợp',
            icon: 'cleaning_services',
            color: '#003d9b',
            notes: 'Công việc trực nhật & vệ sinh',
          },
        ];

        const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        // 1. CALCULATE PREVIOUS MONTH SHIFT COUNTS TO BALANCE CROSS-MONTH!
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;

        const prevMonthShiftCounts = new Map<string, number>();
        assignments.forEach(a => {
          const [sYear, sMonth] = a.date.split('-').map(Number);
          if (sYear === prevYear && sMonth === prevMonth + 1) {
            prevMonthShiftCounts.set(a.assignedEmployeeId, (prevMonthShiftCounts.get(a.assignedEmployeeId) || 0) + 1);
          }
        });

        // Find max shift count in previous month
        let maxPrevShifts = 0;
        activeEmps.forEach(e => {
          const cnt = prevMonthShiftCounts.get(e.id) || 0;
          if (cnt > maxPrevShifts) maxPrevShifts = cnt;
        });

        // 2. INITIALIZE SHIFT COUNTER MAP WITH CROSS-MONTH DEFICIT OFFSET:
        // Employees who got FEWER shifts last month start with a NEGATIVE count so they get prioritized 1st in the new month!
        const dutyCountMap = new Map<string, number>();
        activeEmps.forEach(e => {
          const prevCount = prevMonthShiftCounts.get(e.id) || 0;
          const deficit = maxPrevShifts > 0 ? (maxPrevShifts - prevCount) : 0;
          dutyCountMap.set(e.id, -deficit); // e.g. -1 for someone who got 7 ca while others got 8 ca last month
        });

        // 3. DAY BY DAY BALANCED ASSIGNMENT
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const offSetForDay = offDayMap.get(dateStr) || new Set();

          // Filter employees available today (not on OFF)
          let availableEmps = activeEmps.filter(e => !offSetForDay.has(e.id));
          if (availableEmps.length === 0) {
            availableEmps = [...activeEmps]; // fallback if everyone is OFF
          }

          // SORT BY FEWEST SHIFTS ASSIGNED (LEAST ASSIGNED FIRST)
          availableEmps.sort((a, b) => {
            const countA = dutyCountMap.get(a.id) || 0;
            const countB = dutyCountMap.get(b.id) || 0;
            if (countA !== countB) {
              return countA - countB; // Ascending: smallest count first
            }
            return a.id.localeCompare(b.id);
          });

          const assignedEmpsForDay: Employee[] = [];

          // Pick 1st employee (has lowest cumulative count including last month's deficit)
          const emp1 = availableEmps[0];
          assignedEmpsForDay.push(emp1);

          // Pick 2nd employee (2nd lowest cumulative count)
          if (availableEmps.length > 1) {
            const emp2 = availableEmps[1];
            assignedEmpsForDay.push(emp2);
          } else {
            assignedEmpsForDay.push(emp1);
          }

          dutyRoles.forEach((role, idx) => {
            const empIdx = idx % assignedEmpsForDay.length;
            const emp = assignedEmpsForDay[empIdx];
            
            dutyCountMap.set(emp.id, (dutyCountMap.get(emp.id) || 0) + 1);

            const partners = assignedEmpsForDay.filter(e => e.id !== emp.id);
            const partnerNames = Array.from(new Set(partners.map(p => p.name)));
            const partnerText = partnerNames.length > 0 ? ` (Cùng trực với ${partnerNames.join(', ')})` : '';
            const isPastDay = dateStr < todayDateStr;

            generatedAssignments.push({
              id: `auto-${year}-${month + 1}-${day}-${idx}-${Date.now()}`,
              date: dateStr,
              categoryId: role.catId,
              categoryName: role.catName,
              categoryIcon: role.icon,
              categoryColor: role.color,
              assignedEmployeeId: emp.id,
              assignedEmployeeName: emp.name,
              assignedEmployeeRole: emp.role,
              assignedEmployeeAvatar: emp.avatar,
              notes: `${role.notes}${partnerText}`,
              status: isPastDay ? 'completed' : 'upcoming',
            });
          });
        }

        setAssignments(prev => {
          const filtered = prev.filter(a => {
            const [sYear, sMonth] = a.date.split('-').map(Number);
            return !(sYear === year && sMonth === month + 1);
          });
          return [...filtered, ...generatedAssignments];
        });

        // Sync batch to Supabase
        try {
          const rowsToInsert = generatedAssignments.map(a => ({
            id: a.id,
            date: a.date,
            category_id: a.categoryId,
            category_name: a.categoryName,
            category_icon: a.categoryIcon,
            category_color: a.categoryColor,
            assigned_employee_id: a.assignedEmployeeId,
            assigned_employee_name: a.assignedEmployeeName,
            assigned_employee_role: a.assignedEmployeeRole,
            assigned_employee_avatar: a.assignedEmployeeAvatar,
            notes: a.notes,
            status: a.status,
            admin_notes: a.adminNotes,
            penalty_status: a.penaltyStatus,
            fine_amount: a.fineAmount,
            penalty_image: a.penaltyImage,
          }));
          await supabase.from('duty_assignments').insert(rowsToInsert);
        } catch {
          // fallback
        }

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }

        resolve({ count: generatedAssignments.length });
      }, 500);
    });
  };

  const toggleEmployeeOffDay = async (employeeId: string, dateStr: string, reason = 'Admin xếp lịch nghỉ') => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const existing = offDays.find(
      o => o.employeeId === employeeId && o.date === dateStr
    );

    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayFormatted = `${dayNames[dateObj.getDay()]}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;

    if (existing) {
      setOffDays(prev => prev.filter(o => o.id !== existing.id));
      try {
        await supabase.from('off_days').delete().eq('id', existing.id);
      } catch {
        // fallback
      }
    } else {
      const newRequest: OffDayRequest = {
        id: `off-${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.name,
        employeeRole: emp.role,
        employeeAvatar: emp.avatar,
        date: dateStr,
        dayFormatted,
        status: 'approved',
        reason,
        createdAt: new Date().toISOString(),
      };
      setOffDays(prev => [newRequest, ...prev]);

      try {
        await supabase.from('off_days').insert({
          id: newRequest.id,
          employee_id: newRequest.employeeId,
          employee_name: newRequest.employeeName,
          employee_avatar: newRequest.employeeAvatar,
          employee_role: newRequest.employeeRole,
          date: newRequest.date,
          day_formatted: newRequest.dayFormatted,
          reason: newRequest.reason,
          status: newRequest.status,
        });
      } catch {
        // fallback
      }
    }
  };

  const approveOffDay = (id: string) => {
    setOffDays(prev =>
      prev.map(o => (o.id === id ? { ...o, status: 'approved' } : o))
    );
  };

  const rejectOffDay = (id: string) => {
    setOffDays(prev =>
      prev.map(o => (o.id === id ? { ...o, status: 'rejected' } : o))
    );
  };

  const addEmployee = async (data: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...data,
      id: `emp-${Date.now()}`,
    };
    setEmployees(prev => [newEmp, ...prev]);

    try {
      await supabase.from('employees').insert({
        id: newEmp.id,
        name: newEmp.name,
        role: newEmp.role,
        department: newEmp.department,
        email: newEmp.email,
        phone: newEmp.phone,
        avatar: newEmp.avatar,
        accent_color: newEmp.accentColor,
        is_active: newEmp.isActive,
      });
    } catch {
      // fallback
    }
  };

  const updateEmployee = async (updated: Employee) => {
    setEmployees(prev => prev.map(e => (e.id === updated.id ? updated : e)));

    try {
      await supabase.from('employees').update({
        name: updated.name,
        role: updated.role,
        department: updated.department,
        email: updated.email,
        phone: updated.phone,
        avatar: updated.avatar,
        is_active: updated.isActive,
      }).eq('id', updated.id);
    } catch {
      // fallback
    }
  };

  const deleteEmployee = async (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));

    try {
      await supabase.from('employees').delete().eq('id', id);
    } catch {
      // fallback
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <DutyContext.Provider
      value={{
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        categories,
        employees,
        assignments,
        offDays,
        notifications,
        isLoggedIn,
        setIsLoggedIn,
        currentUser,
        setCurrentUser,
        loginAsAdmin,
        loginAsEmployee,
        logout,
        selectedMonth,
        setSelectedMonth,
        selectedYear,
        setSelectedYear,

        addCategory,
        updateCategory,
        deleteCategory,

        addAssignment,
        updateAssignment,
        deleteAssignment,
        clearMonthAssignments,
        completeDutyWithProof,
        autoScheduleDuty,

        toggleEmployeeOffDay,
        approveOffDay,
        rejectOffDay,

        addEmployee,
        updateEmployee,
        deleteEmployee,

        markNotificationAsRead,
        clearAllNotifications,

        createAssignmentModalOpen,
        setCreateAssignmentModalOpen,
        createAssignmentPreselectedDate,
        setCreateAssignmentPreselectedDate,
        selectedAssignmentForDetail,
        setSelectedAssignmentForDetail,
        employeeModalOpen,
        setEmployeeModalOpen,
        editingEmployee,
        setEditingEmployee,
        categoryModalOpen,
        setCategoryModalOpen,
        editingCategory,
        setEditingCategory,
        autoScheduleModalOpen,
        setAutoScheduleModalOpen,

        proofModalOpen,
        setProofModalOpen,
        dutyForProof,
        setDutyForProof,
      }}
    >
      {children}
    </DutyContext.Provider>
  );
};

export const useDuty = () => {
  const context = useContext(DutyContext);
  if (!context) {
    throw new Error('useDuty must be used within a DutyProvider');
  }
  return context;
};
