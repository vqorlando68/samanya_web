import React, { useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export const SamanyaAlertModal: React.FC = () => {
  const { alertModal, closeAlert } = useAdmin();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!alertModal?.isOpen) return;
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        if (alertModal.onConfirm) {
          alertModal.onConfirm();
        }
        closeAlert();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [alertModal, closeAlert]);

  if (!alertModal?.isOpen) return null;

  const type = alertModal.type || 'alert';

  const typeConfig = {
    alert: {
      icon: <AlertCircle className="w-7 h-7 text-[#A4453A]" />,
      iconBg: 'bg-[#FBE8E6] border border-[#A4453A]/20',
      titleDefault: 'Atención requerida',
      badge: 'Alerta',
      badgeColor: 'bg-[#FBE8E6] text-[#A4453A] border-[#A4453A]/30',
      accentColor: 'border-l-4 border-l-[#A4453A]'
    },
    warning: {
      icon: <AlertTriangle className="w-7 h-7 text-[#B3803F]" />,
      iconBg: 'bg-[#FDF6E8] border border-[#B3803F]/20',
      titleDefault: 'Información incompleta',
      badge: 'Aviso',
      badgeColor: 'bg-[#FDF6E8] text-[#B3803F] border-[#B3803F]/30',
      accentColor: 'border-l-4 border-l-[#B3803F]'
    },
    info: {
      icon: <Info className="w-7 h-7 text-[#068591]" />,
      iconBg: 'bg-[#E3F4F6] border border-[#068591]/20',
      titleDefault: 'Información del sistema',
      badge: 'Información',
      badgeColor: 'bg-[#E3F4F6] text-[#068591] border-[#068591]/30',
      accentColor: 'border-l-4 border-l-[#068591]'
    },
    success: {
      icon: <CheckCircle2 className="w-7 h-7 text-[#1E7A4C]" />,
      iconBg: 'bg-[#DFF3E7] border border-[#1E7A4C]/20',
      titleDefault: 'Operación exitosa',
      badge: 'Completado',
      badgeColor: 'bg-[#DFF3E7] text-[#1E7A4C] border-[#1E7A4C]/30',
      accentColor: 'border-l-4 border-l-[#1E7A4C]'
    }
  };

  const config = typeConfig[type];

  const handleConfirm = () => {
    if (alertModal.onConfirm) {
      alertModal.onConfirm();
    }
    closeAlert();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#182F28]/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={handleConfirm}
    >
      <div
        className={`bg-white rounded-3xl max-w-md w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 ${config.accentColor}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente institucional */}
        <div className="px-6 py-4 bg-[#182F28] text-white flex items-center justify-between border-b border-[#274A3F]">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-serif font-bold tracking-wider text-[#DCB87F] uppercase">
              Samanya OS • Ficha Clínica
            </span>
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-[#CFC9B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido principal */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${config.iconBg}`}>
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.badgeColor}`}>
                  {config.badge}
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#182F28] leading-tight">
                {alertModal.title || config.titleDefault}
              </h3>
            </div>
          </div>

          <div className="bg-[#F7F6F2] p-4 rounded-2xl border border-[#DEDBD1]">
            <p className="text-sm text-[#454A42] leading-relaxed whitespace-pre-line font-medium">
              {alertModal.message}
            </p>
          </div>
        </div>

        {/* Footer con botón de acción con estilo Samanya */}
        <div className="px-6 py-4 bg-[#FAF9F5] border-t border-[#DEDBD1] flex justify-end items-center gap-3">
          <button
            type="button"
            autoFocus
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#182F28] hover:bg-[#274A3F] text-[#DCB87F] font-bold rounded-xl shadow-md border border-[#DCB87F]/30 hover:border-[#DCB87F]/60 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <span>{alertModal.confirmText || 'Aceptar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
