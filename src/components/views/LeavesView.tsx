import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  User,
  AlertCircle,
  PlusCircle,
  Search,
  Filter,
  Paperclip,
  Eye,
  FolderOpen,
  ExternalLink,
  FileText
} from 'lucide-react';
import { LeaveAttachmentModal } from '../modals/LeaveAttachmentModal';
import { PermisoAusencia } from '../../types';

export const LeavesView: React.FC = () => {
  const {
    permisos,
    aprobarPermiso,
    rechazarPermiso,
    activeSede,
    setIsRegisterLeaveOpen
  } = useAdmin();

  const [selectedPermisoId, setSelectedPermisoId] = useState<number | null>(null);
  const [comentario, setComentario] = useState('');
  const [actionType, setActionType] = useState<'aprobar' | 'rechazar' | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'Todos' | 'Pendiente' | 'Aprobado' | 'Rechazado'>('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [selectedPermisoAttachment, setSelectedPermisoAttachment] = useState<PermisoAusencia | null>(null);

  const permisosFiltrados = permisos.filter((permiso) => {
    if (filtroEstado !== 'Todos' && permiso.estado !== filtroEstado) {
      return false;
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      const matchNombre = permiso.nombreTrabajador.toLowerCase().includes(q);
      const matchTipo = permiso.tipo.toLowerCase().includes(q);
      const matchMotivo = permiso.motivo.toLowerCase().includes(q);
      const matchArea = permiso.area.toLowerCase().includes(q);
      return matchNombre || matchTipo || matchMotivo || matchArea;
    }
    return true;
  });

  const handleAction = async () => {
    if (!selectedPermisoId || !actionType) return;

    try {
      if (actionType === 'aprobar') {
        await aprobarPermiso(selectedPermisoId, comentario || 'Aprobado por administración.');
      } else {
        if (!comentario.trim()) {
          alert('Por favor especifique el motivo del rechazo.');
          return;
        }
        await rechazarPermiso(selectedPermisoId, comentario.trim());
      }
    } catch (err) {
      console.error('Error al procesar acción de permiso:', err);
    } finally {
      setSelectedPermisoId(null);
      setActionType(null);
      setComentario('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con Botón de Registro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-2xl text-[#182F28]">
            Permisos, Vacaciones & Incapacidades
          </h2>
          <p className="text-xs text-[#5C6058] mt-1">
            Gestión administrativa de novedades laborales, aprobaciones y trazabilidad documental para Talento Humano en {activeSede.nombre}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRegisterLeaveOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#068591] hover:bg-[#056f7a] text-white font-bold rounded-2xl text-xs transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Registrar Permiso / Incapacidad</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#DEDBD1]">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-[#7A745F]" />
          <input
            type="text"
            placeholder="Buscar por colaborador, área, tipo o motivo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full text-xs text-[#182F28] bg-transparent focus:outline-none placeholder:text-[#9A917A]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#7A745F]" />
          <span className="text-xs font-bold text-[#182F28] font-mono">ESTADO:</span>
          <div className="flex items-center gap-1">
            {(['Todos', 'Pendiente', 'Aprobado', 'Rechazado'] as const).map((est) => (
              <button
                key={est}
                type="button"
                onClick={() => setFiltroEstado(est)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filtroEstado === est
                    ? 'bg-[#182F28] text-[#F7F6F2]'
                    : 'bg-[#F7F6F2] text-[#5C6058] hover:bg-[#EAE7DC]'
                }`}
              >
                {est}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Solicitudes */}
      <div className="space-y-3">
        {permisosFiltrados.map((permiso) => (
          <div
            key={permiso.id}
            className="admin-card p-5 space-y-3 hover:border-[#068591]/50 hover:shadow-md transition-all group"
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
                {permiso.soporteUrl && (
                  <div className="relative group/soporte">
                    <button
                      type="button"
                      onClick={() => setSelectedPermisoAttachment(permiso)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#068591]/10 hover:bg-[#068591] text-[#068591] hover:text-white border border-[#068591]/30 hover:border-[#068591] text-xs font-bold transition-all shadow-xs cursor-pointer"
                      title="Ver soporte adjunto"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>Soporte Adjunto</span>
                      <Eye className="w-3 h-3 ml-0.5" />
                    </button>

                    {/* Popover flotante al pararse sobre el botón de soporte */}
                    <div className="absolute right-0 top-full mt-2 w-80 p-3 bg-white rounded-2xl shadow-xl border border-[#DEDBD1] z-30 hidden group-hover/soporte:block pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-2 border-b border-[#DEDBD1] text-[11px]">
                        <span className="font-bold text-[#182F28] flex items-center gap-1">
                          <Paperclip className="w-3 h-3 text-[#068591]" />
                          Archivo Adjunto
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#068591]/10 text-[#068591] font-semibold">
                          SMY_ARCHIVOS
                        </span>
                      </div>

                      <div className="py-2 space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 font-mono font-bold text-[#182F28] truncate">
                          <FileText className="w-4 h-4 text-[#068591] shrink-0" />
                          <span className="truncate" title={permiso.soporteUrl.split('/').pop() || permiso.soporteUrl}>
                            {permiso.soporteUrl.split('/').pop() || permiso.soporteUrl}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#5C6058] font-mono truncate" title={permiso.rutaDrive}>
                          📁 {permiso.rutaDrive || `Samanya/Talento_humano/${permiso.idTrabajador}_DOC`}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#DEDBD1] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPermisoAttachment(permiso);
                          }}
                          className="flex-1 py-1.5 bg-[#068591] hover:bg-[#056f7a] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Soporte</span>
                        </button>
                        {permiso.driveUrl && (
                          <a
                            href={permiso.driveUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 border border-[#DEDBD1] hover:bg-[#F7F6F2] text-[#5C6058] rounded-lg transition-colors cursor-pointer"
                            title="Abrir en Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

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
                {permiso.soporteUrl ? (
                  <div className="pt-2">
                    <div
                      onClick={() => setSelectedPermisoAttachment(permiso)}
                      className="group/attach flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-[#068591]/5 hover:bg-[#068591]/15 border border-[#068591]/25 hover:border-[#068591] transition-all cursor-pointer shadow-xs"
                      title="Haga clic para previsualizar el documento completo"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#068591]/15 group-hover/attach:bg-[#068591] flex items-center justify-center text-[#068591] group-hover/attach:text-white transition-colors shrink-0">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#068591] group-hover/attach:underline truncate">
                              {permiso.soporteUrl.split('/').pop()}
                            </span>
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-[#068591] border border-[#068591]/30">
                              SMY_ARCHIVOS
                            </span>
                          </div>
                          <span className="text-[10px] text-[#5C6058] font-mono block truncate mt-0.5">
                            📁 {permiso.rutaDrive || `Samanya/Talento_humano/${permiso.idTrabajador}_DOC`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#068591]/30 text-xs font-bold text-[#068591] group-hover/attach:bg-[#068591] group-hover/attach:text-white transition-all shadow-xs">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Archivo</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-1 text-[11px] text-[#9A917A] italic flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#9A917A]/60" />
                    <span>Sin documento o soporte adjunto</span>
                  </div>
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
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      placeholder={
                        actionType === 'aprobar'
                          ? 'Opcional: agregue notas sobre turnos de refuerzo...'
                          : 'Indique por qué se rechaza la solicitud...'
                      }
                      className="w-full px-3 py-1.5 bg-white border border-[#DEDBD1] rounded-lg text-xs focus:outline-none focus:border-[#B3803F]"
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedPermisoId(null)}
                        className="px-3 py-1.5 text-xs text-[#5C6058] hover:text-[#182F28] font-semibold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleAction}
                        className={`px-4 py-1.5 text-white font-bold rounded-lg text-xs cursor-pointer ${
                          actionType === 'aprobar'
                            ? 'bg-[#1E7A4C] hover:bg-[#165a38]'
                            : 'bg-[#A4453A] hover:bg-[#85372e]'
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

      {/* Modal visor de soporte adjunto */}
      {selectedPermisoAttachment && (
        <LeaveAttachmentModal
          permiso={selectedPermisoAttachment}
          onClose={() => setSelectedPermisoAttachment(null)}
        />
      )}
    </div>
  );
};
