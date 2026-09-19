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
    success: 'bg-[#DFF3E7] border-[#1E7A4C]/30 text-[#15462D]',
    alert: 'bg-[#FBE8E6] border-[#A4453A]/30 text-[#6B241C]',
    info: 'bg-[#E3F4F6] border-[#068591]/30 text-[#07474E]'
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-md ${
          bgStyles[toast.type]
        }`}
      >
        {icons[toast.type]}
        <p className="text-sm font-semibold">{toast.message}</p>
      </div>
    </div>
  );
};
