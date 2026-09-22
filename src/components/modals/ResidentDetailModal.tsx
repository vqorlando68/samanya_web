import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { X, HeartHandshake, Phone, Mail, User, ShieldAlert, Sparkles, Building2, Edit3, Pill, Clock, Calendar } from 'lucide-react';
import { ResidentAvatar } from '../common/ResidentAvatar';

export const ResidentDetailModal: React.FC = () => {
  const {
    isResidenteDetailOpen,
    setIsResidenteDetailOpen,
    selectedResidente,
    activeSede,
    setEditingResidente,
    setIsEditResidenteOpen,
    familiares,
    setEditingFamiliar,
    setIsEditFamiliarOpen
  } = useAdmin();

  if (!isResidenteDetailOpen || !selectedResidente) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-6 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ResidentAvatar
              fotoUrl={selectedResidente.fotoUrl}
              nombres={selectedResidente.nombres}
              apellidos={selectedResidente.apellidos}
              nombreCompleto={selectedResidente.nombreCompleto}
              sizeClass="w-14 h-14"
              roundedClass="rounded-2xl"
              textClass="text-xl"
              className="border-2 border-[#DCB87F]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl font-bold text-white">
                  {selectedResidente.nombreCompleto}
                </h3>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#274A3F] text-[#DCB87F] border border-[#DCB87F]/30">
                  {selectedResidente.codigoExpediente}
                </span>
              </div>
              <p className="text-xs text-[#DCB87F] mt-0.5">
                {selectedResidente.edad} años • Habitación {selectedResidente.habitacion} (Cama {selectedResidente.cama}) • {activeSede.nombre}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsResidenteDetailOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#CFC9B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Alertas Clínicas */}
          {selectedResidente.alertasClinicas && (
            <div className="p-4 bg-[#FEF7EE] border-l-4 border-[#B3803F] rounded-r-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-[#9A5B12] uppercase font-mono">
                <ShieldAlert className="w-4 h-4" />
                <span>Alertas y Consideraciones Clínicas</span>
              </div>
              <p className="text-sm font-semibold text-[#26241F] mt-1">
                {selectedResidente.alertasClinicas}
              </p>
            </div>
          )}

          {/* Grid de Datos Generales */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
              <span className="text-[11px] font-mono text-[#7A745F] uppercase block">Identificación</span>
              <span className="text-sm font-bold text-[#182F28]">
                {selectedResidente.tipoIdentificacion} {selectedResidente.identificacion}
              </span>
            </div>

            <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
              <span className="text-[11px] font-mono text-[#7A745F] uppercase block">Nivel Movilidad</span>
              <span className="text-sm font-bold text-[#182F28]">
                {selectedResidente.nivelMovilidad}
              </span>
            </div>

            <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
              <span className="text-[11px] font-mono text-[#7A745F] uppercase block">Tipo de Dieta</span>
              <span className="text-sm font-bold text-[#182F28]">
                {selectedResidente.tipoDieta}
              </span>
            </div>

            <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
              <span className="text-[11px] font-mono text-[#7A745F] uppercase block">EPS / Salud</span>
              <span className="text-sm font-bold text-[#182F28]">
                {selectedResidente.eps}
              </span>
            </div>

            <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
              <span className="text-[11px] font-mono text-[#7A745F] uppercase block">Grupo Sanguíneo</span>
              <span className="text-sm font-bold text-[#182F28]">
                {selectedResidente.tipoSangre}
              </span>
            </div>

            <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]">
              <span className="text-[11px] font-mono text-[#7A745F] uppercase block">Fecha Ingreso</span>
              <span className="text-sm font-bold text-[#182F28]">
                {selectedResidente.fechaIngreso}
              </span>
            </div>
          </div>

          {/* Farmacoterapia & Medicamentos Prescritos */}
          <div className="border border-[#DEDBD1] rounded-2xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#DFF3E7] text-[#1E7A4C] flex items-center justify-center">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#182F28]">
                    Farmacoterapia & Medicamentos Prescritos
                  </h4>
                  <p className="text-[11px] text-[#7A745F]">
                    Plan terapéutico activo del residente
                  </p>
                </div>
              </div>
              <span className="text-xs text-[#1E7A4C] font-mono font-bold bg-[#DFF3E7] px-2 py-0.5 rounded-full">
                {selectedResidente.medicamentos?.length || 0} medicamento(s)
              </span>
            </div>

            {selectedResidente.medicamentos && selectedResidente.medicamentos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedResidente.medicamentos.map((med, idx) => (
                  <div
                    key={med.id || idx}
                    className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] flex flex-col justify-between space-y-2 hover:border-[#1E7A4C]/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-[#182F28] block">
                          {med.medicamento}
                        </span>
                        <span className="text-[11px] text-[#7A4F9E] font-semibold">
                          Cantidad / Dosis: {med.cantidad}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-[#DEDBD1] text-[#182F28] font-bold">
                        Rx #{idx + 1}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-[#DEDBD1]/60 text-[11px] text-[#5C6058] space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#068591]" />
                        <span>Frecuencia: <strong className="text-[#182F28]">{med.frecuencia}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#B3803F]" />
                        <span>
                          Hasta:{' '}
                          <strong className="text-[#182F28]">
                            {med.fechaFin ? med.fechaFin : 'Tratamiento Continuo'}
                          </strong>
                        </span>
                      </div>
                      {med.indicaciones && (
                        <p className="text-[10px] text-[#7A745F] italic mt-1 bg-white/70 p-1.5 rounded-md">
                          {med.indicaciones}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-[#F7F6F2] rounded-xl text-center text-xs text-[#7A745F]">
                No tiene medicamentos registrados actualmente.
              </div>
            )}
          </div>

          {/* Familiares y Acudientes Responsables */}
          <div className="border border-[#DEDBD1] rounded-2xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-[#B3803F]" />
                <h4 className="font-serif font-bold text-sm text-[#182F28]">
                  Familiares & Acudientes Vinculados
                </h4>
              </div>
              <span className="text-xs text-[#7A745F] font-mono">
                {selectedResidente.acudientes.length} registrado(s)
              </span>
            </div>

            {selectedResidente.acudientes.length > 0 ? (
              <div className="space-y-2.5">
                {selectedResidente.acudientes.map((acu) => (
                    <div
                      key={acu.id}
                      className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#182F28]">{acu.nombreCompleto}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#DCB87F]/30 text-[#694819] font-semibold">
                            {acu.parentesco}
                          </span>
                          {acu.esPrincipal && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1E7A4C] text-white font-bold">
                              Principal
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[#5C6058] mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-[#068591]" />
                            {acu.telefono}
                          </span>
                          {acu.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-[#068591]" />
                              {acu.email}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const fam = familiares.find((f) => f.id === acu.id);
                          if (fam) {
                            setEditingFamiliar(fam);
                            setIsEditFamiliarOpen(true);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF7EE] hover:bg-[#fcecd7] text-[#9A5B12] font-bold rounded-xl text-xs transition-colors cursor-pointer border border-[#DCB87F] shrink-0"
                        title="Editar información del familiar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-[#F7F6F2] rounded-xl text-center text-xs text-[#7A745F]">
                No tiene acudientes registrados. Puedes vincular uno desde la sección de Familiares.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DEDBD1] bg-[#F7F6F2] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setEditingResidente(selectedResidente);
              setIsEditResidenteOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FEF7EE] hover:bg-[#fcecd7] text-[#9A5B12] font-bold rounded-xl text-xs transition-colors cursor-pointer border border-[#DCB87F]"
          >
            <Edit3 className="w-4 h-4" />
            <span>Editar Información</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResidenteDetailOpen(false)}
            className="px-5 py-2.5 bg-[#182F28] hover:bg-[#274A3F] text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
