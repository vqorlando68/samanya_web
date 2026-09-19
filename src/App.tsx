import React from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { AdminHeader } from './components/layout/AdminHeader';
import { ToastNotification } from './components/common/ToastNotification';

// Views
import { DashboardView } from './components/views/DashboardView';
import { ResidentsView } from './components/views/ResidentsView';
import { FamilyMembersView } from './components/views/FamilyMembersView';
import { WorkersView } from './components/views/WorkersView';
import { ShiftsView } from './components/views/ShiftsView';
import { LeavesView } from './components/views/LeavesView';
import { ClinicalSupervisionView } from './components/views/ClinicalSupervisionView';

// Modals
import { RegisterResidentModal } from './components/modals/RegisterResidentModal';
import { RegisterFamilyModal } from './components/modals/RegisterFamilyModal';
import { RegisterWorkerModal } from './components/modals/RegisterWorkerModal';
import { ResidentDetailModal } from './components/modals/ResidentDetailModal';
import { EditResidentModal } from './components/modals/EditResidentModal';
import { EditWorkerModal } from './components/modals/EditWorkerModal';
import { EditFamilyModal } from './components/modals/EditFamilyModal';
import { EditSedeModal } from './components/modals/EditSedeModal';

const AdminLayout: React.FC = () => {
  const { activeTab } = useAdmin();

  return (
    <div className="flex min-h-screen bg-[#F7F6F2] text-[#26241F]">
      {/* Barra lateral de navegación */}
      <AdminSidebar />

      {/* Área de contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'residentes' && <ResidentsView />}
          {activeTab === 'familiares' && <FamilyMembersView />}
          {activeTab === 'trabajadores' && <WorkersView />}
          {activeTab === 'turnos' && <ShiftsView />}
          {activeTab === 'permisos' && <LeavesView />}
          {activeTab === 'clinico' && <ClinicalSupervisionView />}
        </main>
      </div>

      {/* Modales de Registro y Detalle */}
      <RegisterResidentModal />
      <RegisterFamilyModal />
      <RegisterWorkerModal />
      <ResidentDetailModal />

      {/* Modales de Edición */}
      <EditResidentModal />
      <EditWorkerModal />
      <EditFamilyModal />
      <EditSedeModal />

      {/* Notificaciones Flotantes */}
      <ToastNotification />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AdminProvider>
      <AdminLayout />
    </AdminProvider>
  );
};

export default App;
