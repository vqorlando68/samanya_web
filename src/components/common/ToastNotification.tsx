import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { toast } = useAdmin();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#1E7A4C] shrink-0" />,
    alert: <AlertCircle className="w-5 h-5 text-[#A4453A] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#068591] shrink-0" />
  };

  const bgStyles = {
    success: 'bg-[#DFF3E7]/95 border-[#1E7A4C]/40 text-[#15462D]',
    alert: 'bg-[#FBE8E6]/95 border-[#A4453A]/40 text-[#6B241C]',
    info: 'bg-[#E3F4F6]/95 border-[#068591]/40 text-[#07474E]'
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-200 pointer-events-auto">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl max-w-md backdrop-blur-md ${
          bgStyles[toast.type]
        }`}
      >
        {icons[toast.type]}
        <p className="text-sm font-semibold leading-snug whitespace-pre-line">{toast.message}</p>
      </div>
    </div>
  );
};
