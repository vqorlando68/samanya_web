import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { X, HeartHandshake, Phone, Mail, User, ShieldAlert, Sparkles, Building2, Edit3 } from 'lucide-react';

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
            <img
              src={
                selectedResidente.fotoUrl ||
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
              }
              alt={selectedResidente.nombreCompleto}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#DCB87F]"
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
