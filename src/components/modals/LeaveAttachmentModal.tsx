import React, { useState } from 'react';
import {
  X,
  FileText,
  FileCheck2,
  ExternalLink,
  Download,
  Calendar,
  User,
  ShieldCheck,
  FolderOpen,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { PermisoAusencia } from '../../types';

interface LeaveAttachmentModalProps {
  permiso: PermisoAusencia | null;
  onClose: () => void;
}

export const LeaveAttachmentModal: React.FC<LeaveAttachmentModalProps> = ({
  permiso,
  onClose
}) => {
  if (!permiso || !permiso.soporteUrl) return null;

  const fileName = permiso.soporteUrl.split('/').pop() || permiso.soporteUrl;
  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);
  const isPdf = /\.pdf$/i.test(fileName);

  // Extraer ID de archivo en Google Drive si está presente
  let driveFileId = '';
  if (permiso.driveUrl) {
    const match = permiso.driveUrl.match(/id=([a-zA-Z0-9_-]+)/) || permiso.driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      driveFileId = match[1];
    }
  }

  // Fuentes ordenadas para visualización embebida:
  // 1. Copia local servida por Vite (sin bloqueos CORS ni cookies de terceros)
  // 2. CDN de Google lh3 si existe driveFileId
  // 3. URL directa de driveUrl
  const localUrl = `/uploads/talento_humano/${fileName}`;
  const googleCdnUrl = driveFileId ? `https://lh3.googleusercontent.com/d/${driveFileId}` : '';
  const externalDriveUrl = permiso.driveUrl || '';

  const candidateUrls: string[] = [
    localUrl,
    googleCdnUrl,
    externalDriveUrl
  ].filter((u): u is string => Boolean(u && u.trim()));

  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [loadError, setLoadError] = useState(false);

  const currentDisplayUrl = candidateUrls[currentUrlIndex] || localUrl;
  const openExternalUrl = externalDriveUrl || localUrl;

  const rutaDrive =
    permiso.rutaDrive ||
    `Samanya/Talento_humano/${permiso.idTrabajador}_DOC/${fileName}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-[#DEDBD1] shadow-2xl max-w-3xl w-full overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-[#182F28] text-white flex items-center justify-between border-b border-[#274A3F] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#068591]/20 flex items-center justify-center text-[#068591] border border-[#068591]/40 shrink-0">
              {isImage ? (
                <ImageIcon className="w-5 h-5 text-[#88E4EB]" />
              ) : (
                <FileText className="w-5 h-5 text-[#88E4EB]" />
              )}
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#F7F6F2] leading-tight">
                Soporte Adjunto de Novedad Laboral
              </h3>
              <p className="text-xs text-[#E1DCD2]">
                {permiso.nombreTrabajador} • {permiso.tipo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ficha de Metadatos y Trazabilidad */}
        <div className="p-4 bg-[#F7F6F2] border-b border-[#DEDBD1] grid grid-cols-1 md:grid-cols-2 gap-3 text-xs shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[#5C6058]">
              <User className="w-3.5 h-3.5 text-[#7A4F9E]" />
              <span className="font-bold text-[#182F28]">Colaborador:</span>
              <span>{permiso.nombreTrabajador} ({permiso.area})</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#5C6058]">
              <Calendar className="w-3.5 h-3.5 text-[#B3803F]" />
              <span className="font-bold text-[#182F28]">Vigencia:</span>
              <span>{permiso.fechaInicio} al {permiso.fechaFin}</span>
            </div>
            <div className="text-[11px] text-[#5C6058]">
              <strong>Motivo:</strong> {permiso.motivo}
            </div>
          </div>

          <div className="space-y-1 p-2.5 bg-white rounded-xl border border-[#DEDBD1] text-[11px]">
            <div className="flex items-center gap-1.5 text-[#274A3F] font-mono font-semibold truncate">
              <FolderOpen className="w-3.5 h-3.5 text-[#068591] shrink-0" />
              <span className="truncate" title={rutaDrive}>
                {rutaDrive}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#7A745F] font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E7A4C]" />
                Tabla: <strong>SMY_ARCHIVOS</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-[#DFF3E7] text-[#1E7A4C] font-bold">
                {permiso.estado}
              </span>
            </div>
          </div>
        </div>

        {/* Área del Visor de Archivo */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#26241F]/5 flex flex-col items-center justify-center min-h-[320px]">
          {isImage ? (
            !loadError ? (
              <div className="max-w-full max-h-[500px] rounded-2xl overflow-hidden shadow-lg border border-[#DEDBD1] bg-white p-2">
                <img
                  src={currentDisplayUrl}
                  alt={fileName}
                  className="max-h-[460px] w-auto object-contain mx-auto rounded-xl"
                  onError={() => {
                    if (currentUrlIndex + 1 < candidateUrls.length) {
                      setCurrentUrlIndex((prev) => prev + 1);
                    } else {
                      setLoadError(true);
                    }
                  }}
                />
              </div>
            ) : (
              <div className="text-center p-8 bg-white rounded-2xl border border-[#DEDBD1] shadow-xs space-y-3 max-w-md w-full">
                <div className="w-16 h-16 rounded-2xl bg-[#068591]/10 text-[#068591] flex items-center justify-center mx-auto">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[#182F28]">
                    {fileName}
                  </h4>
                  <p className="text-xs text-[#5C6058] mt-1">
                    Archivo gráfico respaldado en Google Drive. Pulse el botón inferior para abrirlo en tamaño completo.
                  </p>
                </div>
              </div>
            )
          ) : isPdf ? (
            <div className="w-full h-[450px] bg-white rounded-2xl border border-[#DEDBD1] shadow-xs flex flex-col overflow-hidden">
              <div className="px-4 py-2 bg-[#F7F6F2] border-b border-[#DEDBD1] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-mono text-[#182F28] font-bold">
                  <FileText className="w-4 h-4 text-[#A4453A]" />
                  <span>{fileName}</span>
                </div>
                <span className="text-[11px] text-[#5C6058]">Documento PDF</span>
              </div>
              <iframe
                src={`${driveFileId ? `https://drive.google.com/file/d/${driveFileId}/preview` : localUrl}#toolbar=0`}
                title={fileName}
                className="w-full flex-1 border-0"
              />
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-2xl border border-[#DEDBD1] shadow-xs space-y-3 max-w-md w-full">
              <div className="w-16 h-16 rounded-2xl bg-[#068591]/10 text-[#068591] flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-[#182F28]">
                  {fileName}
                </h4>
                <p className="text-xs text-[#5C6058] mt-1">
                  Archivo de soporte adjuntado y respaldado en Google Drive y tabla SMY_ARCHIVOS
                </p>
              </div>
              <div className="p-2.5 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] text-[11px] font-mono text-[#274A3F] text-left">
                📁 {rutaDrive}
              </div>
            </div>
          )}
        </div>

        {/* Pie del Modal con Acciones */}
        <div className="px-6 py-4 bg-white border-t border-[#DEDBD1] flex items-center justify-between shrink-0">
          <div className="text-xs font-mono text-[#5C6058]">
            Archivo: <strong className="text-[#182F28]">{fileName}</strong>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={openExternalUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#068591] hover:bg-[#056f7a] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Archivo Completo</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#DEDBD1] text-xs font-bold text-[#5C6058] hover:bg-[#F7F6F2] rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
