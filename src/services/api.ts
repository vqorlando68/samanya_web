import { MedicamentoPrescrito } from '../types';

/**
 * Capa de Servicios API para el Portal de Administradores
 * 
 * Regla arquitectónica:
 * - CERO instrucciones DML en el frontend.
 * - Toda interacción de escritura/lectura se realiza a través de contratos JSON
 *   que mapean 1:1 con los paquetes de lógica de negocio Oracle (PKGLN_).
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function postToPackage<T>(endpoint: string, jsonPayload: Record<string, any>): Promise<T> {
  // Si existe backend configurado, despacha la petición HTTP
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('samanya_admin_token') || ''}`,
        'x-centro-id': localStorage.getItem('samanya_active_centro_id') || '1'
      },
      body: JSON.stringify(jsonPayload)
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.success === false) {
        console.error(`[Samanya Oracle API Error] en ${endpoint}:`, data.error);
        throw new Error(data.error || 'Error en base de datos Oracle');
      }
      return data;
    } else {
      let errorMsg = `Error HTTP ${response.status}`;
      try {
        const errJson = await response.json();
        errorMsg = errJson.error || errorMsg;
      } catch {
        const errText = await response.text();
        if (errText) errorMsg = errText;
      }
      console.error(`[Samanya Oracle API HTTP Error ${response.status}] en ${endpoint}:`, errorMsg);
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.warn(`[Samanya Oracle API] Despacho a ${endpoint}:`, error);
    throw error;
  }
}

export const adminApi = {
  // 1. Métricas e Incidentes (PKGLN_DASHBOARD_ADMINISTRADOR)
  dashboard: {
    async obtenerMetricas(idCentro: number) {
      return postToPackage('/pkgln_dashboard_administrador/pr_obtener_metricas', { idCentro });
    }
  },

  // 2. Admisión y Ficha de Residentes (PKGLN_ADMISION_RESIDENTE)
  residentes: {
    async registrarResidente(payload: {
      idCentro: number;
      tipoIdentificacion?: string;
      idTipoIdentificacion?: number;
      identificacion: string;
      nombres: string;
      apellidos: string;
      fechaNacimiento: string;
      genero?: string;
      idGenero?: number;
      habitacion: string;
      cama: string;
      eps: string;
      planComplementario?: string;
      tipoSangre: string;
      nivelMovilidad?: string;
      idNivelMovilidad?: number;
      tipoDieta?: string;
      idTipoDieta?: number;
      idEstadoResidente?: number;
      fechaIngreso?: string;
      alertasClinicas?: string;
      medicamentos?: MedicamentoPrescrito[];
      acudienteAsociado?: {
        nombres: string;
        apellidos: string;
        identificacion: string;
        parentesco: string;
        telefono: string;
        email: string;
        esPrincipal: boolean;
      };
    }) {
      return postToPackage('/pkgln_admision_residente/pr_registrar_residente', payload);
    },

    async actualizarResidente(payload: {
      idResidente: number;
      nombres?: string;
      apellidos?: string;
      identificacion?: string;
      idTipoIdentificacion?: number;
      fechaNacimiento?: string;
      idGenero?: number;
      eps?: string;
      planComplementario?: string;
      tipoSangre?: string;
      habitacion?: string;
      cama?: string;
      idNivelMovilidad?: number;
      idTipoDieta?: number;
      alertasClinicas?: string;
      medicamentos?: MedicamentoPrescrito[];
      idEstadoResidente?: number;
      fechaIngreso?: string;
    }) {
      return postToPackage('/pkgln_admision_residente/pr_actualizar_residente', payload);
    },

    async consultarCenso(idCentro?: number): Promise<{ success: boolean; data?: any[]; count?: number }> {
      return postToPackage('/pkgca_residentes/p_consultar_censo', { idCentro });
    }
  },

  // 3. Gestión de Familiares y Acudientes (PKGLN_GESTION_FAMILIARES)
  familiares: {
    async registrarFamiliar(payload: {
      idTipoIdentificacion?: number;
      tipoIdentificacion: string;
      identificacion: string;
      nombres: string;
      apellidos: string;
      telefonoPrincipal: string;
      telefonoSecundario?: string;
      email: string;
      direccion: string;
      ciudad: string;
      idCanalNotifPref?: number;
      canalNotificacionPref: string;
      idResidente?: number;
      idParentesco?: number;
      parentesco?: string;
      esPrincipal?: boolean | number;
      autorizadoSalidas?: boolean | number;
      responsablePago?: boolean | number;
    }) {
      return postToPackage('/pkgln_gestion_familiares/pr_registrar_familiar', payload);
    },

    async actualizarFamiliar(payload: {
      idAcudiente: number;
      nombres?: string;
      apellidos?: string;
      identificacion?: string;
      idTipoIdentificacion?: number;
      telefonoPrincipal?: string;
      telefonoSecundario?: string;
      email?: string;
      direccion?: string;
      ciudad?: string;
      idCanalNotifPref?: number;
    }) {
      return postToPackage('/pkgln_gestion_familiares/pr_actualizar_familiar', payload);
    },

    async eliminarFamiliar(payload: { idAcudiente: number }) {
      return postToPackage('/pkgln_gestion_familiares/pr_eliminar_familiar', payload);
    },

    async vincularFamiliarResidente(payload: {
      idAcudiente: number;
      idResidente: number;
      idParentesco: number;
      esPrincipal: boolean;
      autorizadoSalidas: boolean;
      responsablePago: boolean;
    }) {
      return postToPackage('/pkgln_gestion_familiares/pr_vincular_familiar_residente', payload);
    }
  },

  // 4. Talento Humano y Trabajadores (PKGLN_TALENTO_HUMANO)
  trabajadores: {
    async registrarTrabajador(payload: {
      idCentro: number;
      tipoIdentificacion: string;
      identificacion: string;
      nombres: string;
      apellidos: string;
      cargo: string;
      area: string;
      unidadAsignada?: string;
      telefono: string;
      emailCorp: string;
      fechaContratacion: string;
      tipoContrato: string;
      eps: string;
      arl: string;
      turnoHabitual?: string;
    }) {
      return postToPackage('/pkgln_talento_humano/pr_registrar_trabajador', payload);
    },

    async actualizarTrabajador(payload: {
      idTrabajador: number;
      nombres?: string;
      apellidos?: string;
      identificacion?: string;
      idTipoIdentificacion?: number;
      idCargoEmpleado?: number;
      idAreaEmpleado?: number;
      unidadAsignada?: string;
      telefono?: string;
      emailCorp?: string;
      idEstadoEmpleado?: number;
    }) {
      return postToPackage('/pkgln_talento_humano/pr_actualizar_trabajador', payload);
    },

    async actualizarEstadoTrabajador(payload: {
      idTrabajador: number;
      idEstadoEmpleado: number;
      motivo?: string;
    }) {
      return postToPackage('/pkgln_talento_humano/pr_actualizar_estado_trabajador', payload);
    }
  },

  // 5. Cuadrantes y Turnos (PKGLN_CUADRANTES_TURNOS)
  turnos: {
    async asignarTurno(payload: {
      idCentro: number;
      idTrabajador: number;
      idTurno: number;
      fechaTurno: string;
    }) {
      return postToPackage('/pkgln_cuadrantes_turnos/pr_asignar_turno_trabajador', payload);
    }
  },

  // 6. Permisos y Ausencias (PKGLN_PERMISOS_AUSENCIAS)
  permisos: {
    async registrarPermiso(payload: {
      idTrabajador: number;
      idTipoPermiso: number;
      fechaInicio: string;
      fechaFin: string;
      motivo: string;
      urlSoporte?: string;
      idEstadoPermiso?: number;
      observacionesAdmin?: string;
    }) {
      return postToPackage('/pkgln_permisos_ausencias/pr_registrar_permiso', payload);
    },

    async gestionarSolicitud(payload: {
      idSolicitud: number;
      idEstadoPermiso: number; // 2 = Aprobado, 3 = Rechazado
      comentariosAdmin: string;
    }) {
      return postToPackage('/pkgln_permisos_ausencias/pr_gestionar_solicitud_permiso', payload);
    }
  },

  // 7. Configuración de Sedes (SMY_CENTROS)
  sedes: {
    async actualizarSede(payload: {
      idCentro: number;
      capacidadTotal?: number;
      nombre?: string;
      direccion?: string;
      telefono?: string;
    }) {
      return postToPackage('/pkgsmy_centros_dao/p_actualizar', payload);
    }
  },

  // 8. Gestión de Archivos y Google Drive (PKGLN_ARCHIVOS)
  archivos: {
    async prepararCargaFotoTalento(payload: {
      idUsuario: number;
      identificacion: string;
      nombreOriginal: string;
      idCentro?: number;
    }) {
      return postToPackage('/pkgln_archivos/pr_preparar_carga_foto_talento', payload);
    },

    async registrarFotoTalentoHumano(payload: {
      id?: number;
      idUsuario: number;
      idEmpleado?: number;
      idTrabajador?: number;
      identificacion: string;
      nombreArchivo: string;
      nombreArchivoAlmacenado: string;
      hashArchivo: string;
      rutaRelativa: string;
      rutaCompletaAlmacenamiento: string;
      avatarUrl: string;
      tamanoBytes?: number;
      extension?: string;
      tipoMime?: string;
      idCentro?: number;
      idUsuarioCreacion?: number;
    }) {
      return postToPackage('/pkgln_archivos/pr_registrar_foto_talento_humano', payload);
    },

    async subirFotoTalentoHumano(payload: Record<string, any>) {
      return postToPackage('/pkgln_archivos/pr_subir_foto_talento_humano', payload);
    }
  }
};

