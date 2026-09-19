import React from 'react';
import { useAdmin, AdminTab } from '../../context/AdminContext';
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  UserCheck,
  CalendarDays,
  FileCheck2,
  Stethoscope,
  Building2,
  ShieldCheck
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { activeTab, setActiveTab, residentes, familiares, trabajadores, permisos, activeSede } = useAdmin();

  const sedeResidentesCount = residentes.filter(r => r.idCentro === activeSede.id).length;
  const permisosPendientesCount = permisos.filter(p => p.estado === 'Pendiente').length;

  const navItems: Array<{
    tab: AdminTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    {
      tab: 'dashboard',
      label: 'Resumen General',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      tab: 'residentes',
      label: 'Residentes & Fichas',
      icon: <Users className="w-5 h-5" />,
      badge: sedeResidentesCount
    },
    {
      tab: 'familiares',
      label: 'Familiares & Acudientes',
      icon: <HeartHandshake className="w-5 h-5" />,
      badge: familiares.length
    },
    {
      tab: 'trabajadores',
      label: 'Talento Humano',
      icon: <UserCheck className="w-5 h-5" />,
      badge: trabajadores.length
    },
    {
      tab: 'turnos',
      label: 'Turnos & Cuadrantes',
      icon: <CalendarDays className="w-5 h-5" />
    },
    {
      tab: 'permisos',
      label: 'Permisos & Bajas',
      icon: <FileCheck2 className="w-5 h-5" />,
      badge: permisosPendientesCount > 0 ? permisosPendientesCount : undefined,
      badgeColor: 'bg-[#A4453A] text-white'
    },
    {
      tab: 'clinico',
      label: 'Supervisión Clínica',
      icon: <Stethoscope className="w-5 h-5" />
    }
  ];

  return (
    <aside className="w-64 bg-[#182F28] text-[#ECE7DB] flex flex-col shrink-0 h-screen sticky top-0 border-r border-[#0E1F1A] select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#274A3F] flex items-center justify-center text-[#DCB87F] shadow-sm border border-[#DCB87F]/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="font-serif text-lg font-bold text-white tracking-wide leading-tight">
              Samanya Care
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#DCB87F] font-mono font-semibold">
              Portal Médico Admin
            </div>
          </div>
        </div>

        {/* Role Badge */}
        <div className="mt-4 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#7A4F9E]/25 border border-[#7A4F9E]/40 text-[#DCB87F] text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#D8B4F8]" />
          <span className="text-[#EAD7FD]">Administrador de Centro</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#274A3F] text-white shadow-xs font-bold border-l-4 border-[#B3803F]'
                  : 'text-[#CFC9B8] hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-[#DCB87F]' : 'text-[#9A917A]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono font-semibold ${
                    item.badgeColor || 'bg-white/10 text-[#ECE7DB]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Sede */}
      <div className="p-4 border-t border-white/10 bg-[#0E1F1A]/60">
        <div className="text-xs text-[#9A917A] mb-1 font-mono">SEDE ACTIVA</div>
        <div className="text-sm font-semibold text-white truncate">
          {activeSede.nombre}
        </div>
        <div className="text-xs text-[#DCB87F]/80 truncate">
          {activeSede.ciudad}
        </div>
      </div>
    </aside>
  );
};
