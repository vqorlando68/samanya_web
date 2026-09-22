import React, { useState } from 'react';
import { obtenerIniciales, resolverAvatarUrl } from '../../utils/avatarUtils';

interface ResidentAvatarProps {
  fotoUrl?: string;
  nombres?: string;
  apellidos?: string;
  nombreCompleto?: string;
  className?: string;
  sizeClass?: string;
  roundedClass?: string;
  textClass?: string;
  alt?: string;
}

export const ResidentAvatar: React.FC<ResidentAvatarProps> = ({
  fotoUrl,
  nombres,
  apellidos,
  nombreCompleto,
  className = '',
  sizeClass = 'w-12 h-12',
  roundedClass = 'rounded-xl',
  textClass = 'text-sm',
  alt
}) => {
  const [hasError, setHasError] = useState(false);
  const iniciales = obtenerIniciales(nombres, apellidos, nombreCompleto);

  // Si tiene URL de foto válida y no ha fallado
  if (fotoUrl && fotoUrl.trim() !== '' && !hasError) {
    return (
      <img
        src={resolverAvatarUrl(fotoUrl, iniciales)}
        alt={alt || nombreCompleto || 'Foto residente'}
        onError={() => setHasError(true)}
        className={`${sizeClass} ${roundedClass} object-cover border border-[#DEDBD1] shrink-0 ${className}`}
      />
    );
  }

  // Si no tiene foto o falló la carga, mostramos las iniciales con diseño de alta gama
  return (
    <div
      title={nombreCompleto || 'Residente'}
      className={`${sizeClass} ${roundedClass} bg-[#182F28] text-[#DCB87F] border border-[#DCB87F]/40 font-serif font-bold ${textClass} flex items-center justify-center shrink-0 shadow-inner select-none tracking-wider ${className}`}
    >
      {iniciales}
    </div>
  );
};
