import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';

export const LeavesView: React.FC = () => {
  const { permisos, aprobarPermiso, rechazarPermiso, activeSede } = useAdmin();

  const [selectedPermisoId, setSelectedPermisoId] = useState<number | null>(null);
  const [comentario, setComentario] = useState('');
  const [actionType, setActionType] = useState<'aprobar' | 'rechazar' | null>(null);

  const handleAction = async () => {
    if (!selectedPermisoId || !actionType) return;

    if (actionType === 'aprobar') {
      await aprobarPermiso(selectedPermisoId, comentario || 'Aprobado por administración.');
    } else {
      if (!comentario) {
        alert('Por favor especifique el motivo del rechazo.');
        return;
      }
      await rechazarPermiso(selectedPermisoId, comentario);
    }

    setSelectedPermisoId(null);
    setComentario('');
    setActionType(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Sección */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#182F28]">
          Permisos, Vacaciones & Incapacidades
        </h2>
        <p className="text-xs text-[#5C6058] mt-0.5">
          Flujo de aprobación y registro de novedades de personal para {activeSede.nombre}
        </p>
      </div>

      {/* Lista de Solicitudes */}
      <div className="space-y-3">
        {permisos.map((permiso) => (
          <div
            key={permiso.id}
            className="admin-card p-5 space-y-3 hover:border-[#274A3F] transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DEDBD1] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7A4F9E]/15 flex items-center justify-center text-[#7A4F9E] border border-[#7A4F9E]/30 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[#182F28]">
                    {permiso.nombreTrabajador}
                  </h4>
                  <div className="text-xs text-[#5C6058]">
                    Área: <span className="font-bold text-[#274A3F]">{permiso.area}</span> • Solicitado el {permiso.fechaSolicitud}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#F7F6F2] border border-[#DEDBD1] text-[#182F28]">
                  {permiso.tipo}
                </span>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    permiso.estado === 'Aprobado'
                      ? 'bg-[#DFF3E7] text-[#1E7A4C]'
                      : permiso.estado === 'Pendiente'
                      ? 'bg-[#FEF7EE] text-[#9A5B12]'
                      : 'bg-[#FBE8E6] text-[#A4453A]'
                  }`}
                >
                  {permiso.estado}
                </span>
              </div>
            </div>

            {/* Motivo y Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="col-span-2 space-y-1">
                <span className="text-[#7A745F] font-mono uppercase font-bold">Motivo / Justificación:</span>
                <p className="text-[#26241F] font-medium">{permiso.motivo}</p>
                {permiso.soporteUrl && (
                  <span className="text-[11px] text-[#068591] font-semibold block">
                    📎 Soporte adjunto: {permiso.soporteUrl}
                  </span>
                )}
                {permiso.comentariosAdmin && (
                  <div className="mt-2 p-2 bg-[#F7F6F2] rounded-lg border border-[#DEDBD1] text-[11px] text-[#5C6058]">
                    <strong>Nota administración:</strong> {permiso.comentariosAdmin}
                  </div>
                )}
              </div>

              <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] flex flex-col justify-center space-y-1">
                <div className="flex items-center gap-2 text-[#182F28] font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-[#B3803F]" />
                  <span>Desde: <strong>{permiso.fechaInicio}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-[#182F28] font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-[#B3803F]" />
                  <span>Hasta: <strong>{permiso.fechaFin}</strong></span>
                </div>
              </div>
            </div>

            {/* Acciones de Aprobación */}
            {permiso.estado === 'Pendiente' && (
              <div className="pt-3 border-t border-[#DEDBD1] flex flex-wrap items-center justify-end gap-3">
                {selectedPermisoId === permiso.id ? (
                  <div className="w-full space-y-2 p-3 bg-[#F7F6F2] rounded-xl border border-[#B3803F]">
                    <label className="block text-xs font-bold text-[#182F28]">
                      {actionType === 'aprobar' ? 'Comentarios de aprobación:' : 'Motivo del rechazo *:'}
                    </label>
                    <input
                      type="text"
                      placeholder={actionType === 'aprobar' ? 'Opcional...' : 'Especifique la razón...'}
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#DEDBD1] bg-white text-xs focus:outline-none"
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPermisoId(null);
                          setActionType(null);
                        }}
                        className="px-3 py-1 text-xs text-[#5C6058] hover:bg-white rounded-lg cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleAction}
                        className={`px-4 py-1.5 text-white font-bold rounded-lg text-xs cursor-pointer ${
                          actionType === 'aprobar'
                            ? 'bg-[#1E7A4C] hover:bg-[#165a37]'
                            : 'bg-[#A4453A] hover:bg-[#85342a]'
                        }`}
                      >
                        Confirmar {actionType === 'aprobar' ? 'Aprobación' : 'Rechazo'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPermisoId(permiso.id);
                        setActionType('rechazar');
                        setComentario('');
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FBE8E6] hover:bg-[#f6d2ce] text-[#A4453A] font-bold rounded-xl text-xs transition-colors cursor-pointer border border-[#A4453A]/30"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Rechazar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPermisoId(permiso.id);
                        setActionType('aprobar');
                        setComentario('');
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#DFF3E7] hover:bg-[#cdecd8] text-[#1E7A4C] font-bold rounded-xl text-xs transition-colors cursor-pointer border border-[#1E7A4C]/30"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Aprobar Permiso</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {permisos.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#DEDBD1] space-y-2">
            <FileCheck2 className="w-8 h-8 text-[#9A917A] mx-auto" />
            <h4 className="font-serif font-bold text-base text-[#182F28]">
              No hay solicitudes de permiso registradas
            </h4>
          </div>
        )}
      </div>
    </div>
  );
};
