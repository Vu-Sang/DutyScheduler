import React, { useState } from 'react';
import { DutyProvider, useDuty } from './context/DutyContext';
import { LoginPage } from './components/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { DashboardView } from './components/dashboard/DashboardView';
import { MonthlyCalendarView } from './components/calendar/MonthlyCalendarView';
import { OffDayRegistrationView } from './components/offdays/OffDayRegistrationView';
import { CategoryManagementView } from './components/categories/CategoryManagementView';
import { EmployeeManagementView } from './components/employees/EmployeeManagementView';
import { UserPortalView } from './components/user/UserPortalView';
import { UserSummaryView } from './components/user/UserSummaryView';

import { CreateShiftModal } from './components/modals/CreateShiftModal';
import { ShiftDetailModal } from './components/modals/ShiftDetailModal';
import { EmployeeModal } from './components/modals/EmployeeModal';
import { CategoryModal } from './components/modals/CategoryModal';
import { AutoScheduleModal } from './components/modals/AutoScheduleModal';
import { ProofUploadModal } from './components/modals/ProofUploadModal';

const MainAppContent: React.FC = () => {
  const { isLoggedIn, activeTab } = useDuty();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        {/* Top Header */}
        <TopHeader onToggleMobileMenu={() => setMobileSidebarOpen(prev => !prev)} />

        {/* Dynamic View Body */}
        <main className="flex-1 mt-16 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {activeTab === 'my_schedule' && <UserPortalView />}
          {activeTab === 'my_summary' && <UserSummaryView />}
          {activeTab === 'calendar' && <MonthlyCalendarView />}
          {activeTab === 'offdays' && <OffDayRegistrationView />}
          {activeTab === 'categories' && <CategoryManagementView />}
          {activeTab === 'employees' && <EmployeeManagementView />}
          {activeTab === 'dashboard' && <DashboardView />}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <CreateShiftModal />
      <ShiftDetailModal />
      <EmployeeModal />
      <CategoryModal />
      <AutoScheduleModal />
      <ProofUploadModal />
    </div>
  );
};

export function App() {
  return (
    <DutyProvider>
      <MainAppContent />
    </DutyProvider>
  );
}

export default App;
