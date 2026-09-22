/**
 * Servicio de Almacenamiento y Jerarquía en Google Drive (Talento Humano)
 * 
 * Reglas de almacenamiento:
 * 1. Carpeta Raíz: "Talento_humano" (si no existe, se asegura su creación).
 * 2. Subcarpeta por Colaborador: "{id_usuario}_{identificacion}" (donde id_usuario corresponde a smy_usuarios.id).
 * 3. Archivo Hasheado: "{hash_sha256}.{extension}"
 * 4. Persistencia obligatoria de metadatos en la tabla SMY_ARCHIVOS.
 * 5. Actualización obligatoria del campo AVATAR_URL en SMY_USUARIOS.
 */

import { adminApi } from './api';

export interface UploadFotoTalentoParams {
  file: File;
  idUsuario: number;
  identificacion: string;
  idCentro?: number;
  idEmpleado?: number;
  idTrabajador?: number;
  nombreCompleto?: string;
}

export interface UploadFotoTalentoResult {
  success: boolean;
  avatarUrl: string;
  nombreAlmacenado: string;
  hash: string;
  rutaRelativa: string;
  directorioRaiz: string;
  directorioUsuario: string;
  idArchivo?: number;
  mensaje?: string;
}

/**
 * Calcula el Hash SHA-256 criptográfico de un archivo File en el navegador
 */
export async function calcularSha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Sanitiza identificaciones o cadenas para nombres de carpeta seguros
 */
export function sanitizarIdentificador(cadena: string): string {
  if (!cadena) return 'SIN_DOC';
  return cadena
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9_\-]/g, '_')
    .replace(/_+/g, '_');
}

/**
 * Normaliza la extensión del archivo (con punto inicial)
 */
export function normalizarExtension(nombreArchivo: string): string {
  if (!nombreArchivo) return '.jpg';
  const lastDot = nombreArchivo.lastIndexOf('.');
  if (lastDot >= 0) {
    return nombreArchivo.substring(lastDot).toLowerCase();
  }
  return '.jpg';
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64String = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Flujo completo de carga de foto de Talento Humano a Google Drive y Oracle SMY_ARCHIVOS
 */
export async function subirFotoTalentoHumano(
  params: UploadFotoTalentoParams
): Promise<UploadFotoTalentoResult> {
  const { file, idUsuario, identificacion, idCentro = 1, idEmpleado, idTrabajador } = params;

  try {
    const hash = await calcularSha256(file);
    const extension = normalizarExtension(file.name);
    const docSanitizado = sanitizarIdentificador(identificacion);
    const fileBase64 = await fileToBase64(file);

    // Despacho al servicio backend de Google Drive y Oracle
    const response = await fetch('/api/drive/subir-foto-talento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileBase64,
        idUsuario,
        idEmpleado: idEmpleado || idTrabajador || idUsuario,
        identificacion: docSanitizado,
        nombreOriginal: file.name,
        nombreCompleto: params.nombreCompleto || `Colaborador ${idUsuario}`,
        tipoMime: file.type || 'image/jpeg',
        idCentro
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Error en servidor (${response.status}): ${errText}`);
    }

    const resJson = await response.json();
    if (!resJson.success) {
      throw new Error(resJson.error || 'Error subiendo fotografía a Google Drive y Oracle');
    }

    return {
      success: true,
      avatarUrl: resJson.avatarUrl,
      nombreAlmacenado: resJson.nombreAlmacenado || `${hash}${extension}`,
      hash: resJson.hash || hash,
      rutaRelativa: resJson.rutaRelativa || `Samanya/Talento_humano/${idUsuario}_${docSanitizado}`,
      directorioRaiz: resJson.directorioRaiz || 'Samanya/Talento_humano',
      directorioUsuario: resJson.directorioUsuario || `${idUsuario}_${docSanitizado}`,
      idArchivo: resJson.idArchivo || Date.now(),
      mensaje: resJson.mensaje || 'Fotografía almacenada en Google Drive y registrada en Oracle con éxito'
    };
  } catch (error: any) {
    console.error('Error al subir fotografía de talento humano a Google Drive:', error);
    throw error;
  }
}

export interface UploadSoportePermisoParams {
  file: File;
  idEmpleado: number;
  identificacion: string;
  idCentro?: number;
  nombreCompleto?: string;
  idSolicitudPermiso?: number;
}

export interface UploadSoportePermisoResult {
  success: boolean;
  driveUrl: string;
  nombreArchivo: string;
  nombreAlmacenado: string;
  hash: string;
  rutaRelativa: string;
  idArchivo?: number;
  fileId?: string;
  mensaje?: string;
}

/**
 * Carga de Documento de Soporte (Incapacidad, Vacaciones o Permiso) a Google Drive:
 * Ruta: Samanya/Talento_humano/{id}_{identificacion}/{archivo}
 * y registro en la tabla SMY_ARCHIVOS vía PKGLN_ARCHIVOS.PR_REGISTRAR_SOPORTE_TALENTO_HUMANO
 */
export async function subirSoportePermiso(
  params: UploadSoportePermisoParams
): Promise<UploadSoportePermisoResult> {
  const { file, idEmpleado, identificacion, idCentro = 1, nombreCompleto, idSolicitudPermiso } = params;

  try {
    const hash = await calcularSha256(file);
    const extension = normalizarExtension(file.name);
    const docSanitizado = sanitizarIdentificador(identificacion);
    const fileBase64 = await fileToBase64(file);

    const response = await fetch('/api/drive/subir-soporte-talento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileBase64,
        idEmpleado,
        idUsuario: idEmpleado,
        identificacion: docSanitizado,
        nombreOriginal: file.name,
        nombreCompleto: nombreCompleto || `Colaborador ${idEmpleado}`,
        tipoMime: file.type || (extension === '.pdf' ? 'application/pdf' : 'application/octet-stream'),
        tipoDocumento: 'soporte',
        idCentro,
        idSolicitudPermiso
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Error en servidor (${response.status}): ${errText}`);
    }

    const resJson = await response.json();
    if (!resJson.success) {
      throw new Error(resJson.error || 'Error subiendo soporte a Google Drive y Oracle');
    }

    return {
      success: true,
      driveUrl: resJson.driveUrl || '',
      nombreArchivo: file.name,
      nombreAlmacenado: resJson.nombreAlmacenado || file.name,
      hash: resJson.hash || hash,
      rutaRelativa: resJson.rutaRelativa || `Samanya/Talento_humano/${idEmpleado}_${docSanitizado}`,
      idArchivo: resJson.idArchivo || Date.now(),
      fileId: resJson.fileId,
      mensaje: resJson.mensaje || 'Soporte adjunto subido exitosamente a Google Drive y registrado en SMY_ARCHIVOS'
    };
  } catch (error: any) {
    console.error('Error al subir soporte de permiso a Google Drive:', error);
    throw error;
  }
}

