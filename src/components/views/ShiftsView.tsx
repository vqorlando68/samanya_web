import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  CalendarDays,
  Clock,
  Users,
  AlertTriangle,
  UserPlus,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { resolverAvatarUrl, DEFAULT_AVATAR } from '../../utils/avatarUtils';

export const ShiftsView: React.FC = () => {
  const { turnos, trabajadores, asignarTrabajadorATurno, activeSede } = useAdmin();

  const [selectedTurnoId, setSelectedTurnoId] = useState<number | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number>(0);

  const sedeTurnos = turnos.filter((t) => t.idCentro === activeSede.id);

  const handleAsignar = async (turnoId: number) => {
    if (!selectedWorkerId) {
      alert('Seleccione un trabajador para asignar.');
      return;
    }

    await asignarTrabajadorATurno(turnoId, selectedWorkerId);
    setSelectedTurnoId(null);
    setSelectedWorkerId(0);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#182F28]">
            Turnos & Control de Cobertura Asistencial
          </h2>
          <p className="text-xs text-[#5C6058] mt-0.5">
            Supervisión de cuadrantes, horarios y personal de ronda en {activeSede.nombre}
          </p>
        </div>
      </div>

      {/* Grid de Turnos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sedeTurnos.map((turno) => {
          const personalCount = turno.trabajadoresAsignados.length;
          const cumpleCobertura = personalCount >= turno.coberturaMinimaRequerida;

          return (
            <div
              key={turno.id}
              className={`admin-card p-6 space-y-4 border-t-4 ${
                turno.estado === 'Activo'
                  ? 'border-t-[#1E7A4C]'
                  : cumpleCobertura
                  ? 'border-t-[#274A3F]'
                  : 'border-t-[#B3803F]'
              }`}
            >
              {/* Cabecera Turno */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase font-bold text-[#7A745F]">
                    {turno.tipo}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-[#182F28]">
                    {turno.nombre}
                  </h3>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    turno.estado === 'Activo'
                      ? 'bg-[#DFF3E7] text-[#1E7A4C]'
                      : 'bg-[#F7F6F2] text-[#5C6058] border border-[#DEDBD1]'
                  }`}
                >
                  {turno.estado}
                </span>
              </div>

              {/* Franja Horaria */}
              <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#075158] font-bold">
                  <Clock className="w-4 h-4" />
                  <span>{turno.horario}</span>
                </div>
                <span className="text-[#5C6058]">Fecha: {turno.fecha}</span>
              </div>

              {/* Alerta de Cobertura */}
              {!cumpleCobertura && (
                <div className="p-3 bg-[#FEF7EE] rounded-xl border border-[#DCB87F] flex items-center gap-2 text-xs text-[#9A5B12] font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Faltan {turno.coberturaMinimaRequerida - personalCount} persona(s) para la cobertura mínima requerida.</span>
                </div>
              )}

              {/* Lista de Personal Asignado */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#7A745F] font-mono">
                  <span>PERSONAL ASIGNADO</span>
                  <span className="font-bold text-[#182F28]">
                    {personalCount} / Mín. {turno.coberturaMinimaRequerida}
                  </span>
                </div>

                {turno.trabajadoresAsignados.map((worker) => (
                  <div
                    key={worker.idTrabajador}
                    className="p-2.5 bg-white rounded-xl border border-[#DEDBD1] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={resolverAvatarUrl(worker.avatarUrl)}
                        alt={worker.nombre}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_AVATAR;
                        }}
                        className="w-8 h-8 rounded-full object-cover border border-[#DEDBD1]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#182F28]">{worker.nombre}</div>
                        <div className="text-[11px] text-[#5C6058]">{worker.cargo}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F7F6F2] text-[#274A3F]">
                      {worker.area}
                    </span>
                  </div>
                ))}
              </div>

              {/* Asignar Personal Adicional */}
              <div className="pt-3 border-t border-[#DEDBD1]/60">
                {selectedTurnoId === turno.id ? (
                  <div className="space-y-2 p-3 bg-[#F7F6F2] rounded-xl border border-[#B3803F]">
                    <label className="block text-xs font-bold text-[#182F28]">
                      Seleccione trabajador activo:
                    </label>
                    <select
                      value={selectedWorkerId}
                      onChange={(e) => setSelectedWorkerId(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#DEDBD1] bg-white text-xs focus:outline-none"
                    >
                      <option value={0}>Seleccionar colaborador...</option>
                      {trabajadores
                        .filter(
                          (t) =>
                            t.estado === 'Activo' &&
                            !turno.trabajadoresAsignados.some((w) => w.idTrabajador === t.id)
                        )
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nombreCompleto} ({t.cargo} - {t.area})
                          </option>
                        ))}
                    </select>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedTurnoId(null)}
                        className="px-2.5 py-1 text-xs text-[#5C6058] hover:bg-white rounded-lg cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAsignar(turno.id)}
                        className="px-3 py-1 bg-[#274A3F] hover:bg-[#182F28] text-white font-bold rounded-lg text-xs cursor-pointer"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTurnoId(turno.id);
                      setSelectedWorkerId(0);
                    }}
                    className="w-full py-2 px-3 bg-[#F7F6F2] hover:bg-[#ECE7DB] text-[#182F28] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#DEDBD1]"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#B3803F]" />
                    <span>Asignar Colaborador al Turno</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
