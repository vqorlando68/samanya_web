import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  Building2,
  ChevronDown,
  Search,
  Plus,
  UserPlus,
  HeartHandshake,
  UserCheck,
  Bell,
  CheckCircle2,
  Edit3
} from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const {
    sedes,
    activeSedeId,
    activeSede,
    setActiveSedeId,
    searchQuery,
    setSearchQuery,
    setIsRegisterResidentOpen,
    setIsRegisterFamilyOpen,
    setIsRegisterWorkerOpen,
    setIsEditSedeOpen,
    metrics
  } = useAdmin();

  const [isSedeDropdownOpen, setIsSedeDropdownOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-[#DEDBD1] px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* 1. Sede Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsSedeDropdownOpen(!isSedeDropdownOpen)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#F7F6F2] hover:bg-[#ECE7DB] text-[#182F28] font-semibold text-sm transition-all border border-[#DEDBD1] cursor-pointer"
        >
          <Building2 className="w-4 h-4 text-[#B3803F]" />
          <span className="font-serif font-bold text-sm truncate max-w-[200px] md:max-w-xs">
            {activeSede.nombre}
          </span>
          <ChevronDown className="w-4 h-4 text-[#5C6058]" />
        </button>

        {isSedeDropdownOpen && (
          <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#DEDBD1] py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 text-[11px] font-mono uppercase text-[#7A745F] font-bold border-b border-[#DEDBD1]/60">
              Seleccionar Sede del Centro
            </div>
            {sedes.map((sede) => (
              <button
                key={sede.id}
                type="button"
                onClick={() => {
                  setActiveSedeId(sede.id);
                  setIsSedeDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-[#F7F6F2] transition-colors cursor-pointer ${
                  sede.id === activeSedeId ? 'bg-[#F7F6F2] font-bold text-[#182F28]' : 'text-[#4B4636]'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">{sede.nombre}</div>
                  <div className="text-xs text-[#7A745F]">{sede.ciudad} • Cap: {sede.capacidadTotal}</div>
                </div>
                {sede.id === activeSedeId && (
                  <CheckCircle2 className="w-4 h-4 text-[#1E7A4C]" />
                )}
              </button>
            ))}

            <div className="p-2 border-t border-[#DEDBD1]/60 mt-1">
              <button
                type="button"
                onClick={() => {
                  setIsSedeDropdownOpen(false);
                  setIsEditSedeOpen(true);
                }}
                className="w-full px-3 py-2 text-xs font-bold text-[#9A5B12] hover:bg-[#FEF7EE] rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#DCB87F]"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Sede y Capacidad de Camas</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Global Search Bar */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-[#7A745F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, documento o habitación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F7F6F2] border border-[#DEDBD1] text-sm text-[#26241F] placeholder:text-[#9A917A] focus:outline-none focus:border-[#B3803F] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* 3. Action Buttons & Admin Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Action Button Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#274A3F] hover:bg-[#182F28] text-white rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Registro</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {isQuickActionOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#DEDBD1] py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setIsRegisterResidentOpen(true);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F7F6F2] flex items-center gap-2.5 text-[#182F28] font-medium cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#274A3F]/10 text-[#274A3F] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">Registrar Residente</div>
                  <div className="text-[11px] text-[#7A745F]">Nueva admisión y ficha</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setIsRegisterFamilyOpen(true);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F7F6F2] flex items-center gap-2.5 text-[#182F28] font-medium cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#B3803F]/10 text-[#B3803F] flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">Registrar Familiar</div>
                  <div className="text-[11px] text-[#7A745F]">Contacto y acudiente</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setIsRegisterWorkerOpen(true);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F7F6F2] flex items-center gap-2.5 text-[#182F28] font-medium cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#7A4F9E]/10 text-[#7A4F9E] flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">Registrar Trabajador</div>
                  <div className="text-[11px] text-[#7A745F]">Colaborador / Personal</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="w-10 h-10 rounded-xl bg-[#F7F6F2] hover:bg-[#ECE7DB] border border-[#DEDBD1] flex items-center justify-center text-[#4B4636] relative transition-colors cursor-pointer"
            title="Notificaciones Operativas"
          >
            <Bell className="w-4 h-4" />
            {metrics.alertasCriticas > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#A4453A] absolute top-2 right-2 ring-2 ring-white" />
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#DEDBD1] p-3 z-40 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-xs font-mono font-bold text-[#7A745F] uppercase mb-2">
                Avisos del Centro
              </div>
              <div className="space-y-2">
                <div className="p-2.5 bg-[#FEF7EE] border border-[#DCB87F] rounded-xl text-xs text-[#26241F]">
                  <div className="font-bold text-[#9A5B12]">Turno Tarde por iniciar</div>
                  <p className="mt-0.5 text-[#4B4636]">Revisar cobertura de cuidadores asignados.</p>
                </div>
                <div className="p-2.5 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl text-xs text-[#26241F]">
                  <div className="font-bold text-[#182F28]">2 Solicitudes de permiso</div>
                  <p className="mt-0.5 text-[#4B4636]">Pendientes de aprobación por coordinación.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-[#DEDBD1]">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
            alt="Admin"
            className="w-9 h-9 rounded-full object-cover border border-[#B3803F]/40 shadow-2xs"
          />
          <div className="hidden lg:block text-left leading-tight">
            <div className="text-xs font-bold text-[#182F28]">Dra. Elena Valenzuela</div>
            <div className="text-[11px] text-[#7A745F]">Directora Administrativa</div>
          </div>
        </div>
      </div>
    </header>
  );
};
