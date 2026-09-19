import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  Stethoscope,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Clock,
  User,
  HeartHandshake
} from 'lucide-react';

export const ClinicalSupervisionView: React.FC = () => {
  const { incidentes, activeSede } = useAdmin();

  const sedeIncidentes = incidentes.filter((i) => i.idCentro === activeSede.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Sección */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#182F28]">
          Supervisión Clínica & Gestión de Incidentes
        </h2>
        <p className="text-xs text-[#5C6058] mt-0.5">
          Trazabilidad de eventos adversos, caídas, descompensaciones y alertas a familiares en {activeSede.nombre}
        </p>
      </div>

      {/* Grid de Incidentes */}
      <div className="space-y-4">
        {sedeIncidentes.map((inc) => (
          <div
            key={inc.id}
            className="admin-card p-5 space-y-3 hover:border-[#B3803F] transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DEDBD1] pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    inc.severidad === 'Crítica' || inc.severidad === 'Alta'
                      ? 'bg-[#FBE8E6] text-[#A4453A] border border-[#A4453A]/30'
                      : 'bg-[#FEF7EE] text-[#9A5B12] border border-[#DCB87F]/40'
                  }`}
                >
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif font-bold text-base text-[#182F28]">
                      {inc.nombreResidente}
                    </h4>
                    <span className="text-xs text-[#5C6058]">
                      (Habitación {inc.habitacion})
                    </span>
                  </div>
                  <div className="text-xs text-[#7A745F]">
                    Reportado por: <strong>{inc.reportadoPor}</strong> • {inc.fechaHora}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    inc.severidad === 'Alta' || inc.severidad === 'Crítica'
                      ? 'bg-[#FBE8E6] text-[#A4453A]'
                      : 'bg-[#FEF7EE] text-[#9A5B12]'
                  }`}
                >
                  Severidad {inc.severidad}
                </span>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    inc.estado === 'Cerrado'
                      ? 'bg-[#DFF3E7] text-[#1E7A4C]'
                      : 'bg-[#FEF7EE] text-[#9A5B12]'
                  }`}
                >
                  {inc.estado}
                </span>
              </div>
            </div>

            {/* Descripción y Acciones Tomadas */}
            <div className="space-y-2 text-xs text-[#26241F]">
              <div>
                <span className="font-mono text-[#7A745F] uppercase font-bold block mb-0.5">
                  Descripción del Evento:
                </span>
                <p className="font-medium bg-[#F7F6F2] p-3 rounded-xl border border-[#DEDBD1]">
                  {inc.descripcion}
                </p>
              </div>

              <div>
                <span className="font-mono text-[#7A745F] uppercase font-bold block mb-0.5">
                  Acciones Tomadas / Protocolo Activado:
                </span>
                <p className="font-medium bg-[#E8F1EC] p-3 rounded-xl border border-[#1E7A4C]/20 text-[#182F28]">
                  {inc.accionesTomadas}
                </p>
              </div>
            </div>

            {/* Estado de Notificación a Familiares */}
            <div className="pt-2 border-t border-[#DEDBD1]/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-[#B3803F]" />
                <span className="text-[#5C6058]">Notificación a Acudiente:</span>
                {inc.notificadoFamiliar ? (
                  <span className="text-[#1E7A4C] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Notificado inmediatamente
                  </span>
                ) : (
                  <span className="text-[#7A745F] italic">No requerida / Pendiente</span>
                )}
              </div>

              <span className="text-[11px] font-mono text-[#7A745F]">
                Tipo: {inc.tipo}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
