import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SedeCentro,
  Residente,
  FamiliarAcudiente,
  TrabajadorEmpleado,
  TurnoAsignado,
  PermisoAusencia,
  IncidenteOperativo,
  AdminDashboardMetrics
} from '../types';
import {
  SEED_SEDES,
  SEED_RESIDENTES,
  SEED_FAMILIARES,
  SEED_TRABAJADORES,
  SEED_TURNOS,
  SEED_PERMISOS,
  SEED_INCIDENTES
} from '../data/seedData';
import { adminApi } from '../services/api';

export type AdminTab =
  | 'dashboard'
  | 'residentes'
  | 'familiares'
  | 'trabajadores'
  | 'turnos'
  | 'permisos'
  | 'clinico';

interface AdminContextType {
  // Navegación y Sedes
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  sedes: SedeCentro[];
  activeSedeId: number;
  activeSede: SedeCentro;
  setActiveSedeId: (id: number) => void;

  // Datos principales
  residentes: Residente[];
  familiares: FamiliarAcudiente[];
  trabajadores: TrabajadorEmpleado[];
  turnos: TurnoAsignado[];
  permisos: PermisoAusencia[];
  incidentes: IncidenteOperativo[];
  metrics: AdminDashboardMetrics;

  // Búsqueda global
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Modales
  isRegisterResidentOpen: boolean;
  setIsRegisterResidentOpen: (open: boolean) => void;
  isRegisterFamilyOpen: boolean;
  setIsRegisterFamilyOpen: (open: boolean) => void;
  isRegisterWorkerOpen: boolean;
  setIsRegisterWorkerOpen: (open: boolean) => void;
  isRegisterLeaveOpen: boolean;
  setIsRegisterLeaveOpen: (open: boolean) => void;
  isAssignShiftOpen: boolean;
  setIsAssignShiftOpen: (open: boolean) => void;
  selectedResidente: Residente | null;
  setSelectedResidente: (res: Residente | null) => void;
  isResidenteDetailOpen: boolean;
  setIsResidenteDetailOpen: (open: boolean) => void;

  // Modales de Edición
  editingResidente: Residente | null;
  setEditingResidente: (res: Residente | null) => void;
  isEditResidenteOpen: boolean;
  setIsEditResidenteOpen: (open: boolean) => void;
  editingTrabajador: TrabajadorEmpleado | null;
  setEditingTrabajador: (t: TrabajadorEmpleado | null) => void;
  isEditTrabajadorOpen: boolean;
  setIsEditTrabajadorOpen: (open: boolean) => void;
  editingFamiliar: FamiliarAcudiente | null;
  setEditingFamiliar: (f: FamiliarAcudiente | null) => void;
  isEditFamiliarOpen: boolean;
  setIsEditFamiliarOpen: (open: boolean) => void;
  isEditSedeOpen: boolean;
  setIsEditSedeOpen: (open: boolean) => void;

  // Acciones de Negocio (sin DML en el front)
  registrarResidente: (data: Omit<Residente, 'id' | 'codigoExpediente' | 'edad'> & {
    fechaIngreso?: string;
    familiarContacto?: {
      nombres: string;
      apellidos: string;
      identificacion: string;
      parentesco: string;
      telefono: string;
      email: string;
    };
  }) => Promise<void>;

  actualizarResidente: (idResidente: number, data: Partial<Residente>) => Promise<void>;
  sincronizarResidentes: () => Promise<void>;

  registrarFamiliar: (data: Omit<FamiliarAcudiente, 'id' | 'nombreCompleto'> & {
    idResidenteVinculado?: number;
    parentesco?: string;
    esPrincipal?: boolean;
    fotoUrl?: string;
  }) => Promise<void>;

  actualizarFamiliar: (idFamiliar: number, data: Partial<FamiliarAcudiente> & { esPrincipal?: boolean }) => Promise<void>;

  eliminarFamiliar: (idFamiliar: number) => Promise<void>;

  actualizarSede: (idCentro: number, data: Partial<SedeCentro>) => Promise<void>;

  registrarTrabajador: (data: Omit<TrabajadorEmpleado, 'id' | 'nombreCompleto' | 'fechaContratacion'>) => Promise<void>;

  actualizarTrabajador: (idTrabajador: number, data: Partial<TrabajadorEmpleado>) => Promise<void>;

  actualizarEstadoTrabajador: (idTrabajador: number, nuevoEstado: 'Activo' | 'En Permiso' | 'Inactivo') => Promise<void>;

  asignarTrabajadorATurno: (idTurno: number, idTrabajador: number) => Promise<void>;

  aprobarPermiso: (idPermiso: number, comentarios: string) => Promise<void>;
  rechazarPermiso: (idPermiso: number, comentarios: string) => Promise<void>;
  registrarPermiso: (nuevoPermiso: Omit<PermisoAusencia, 'id' | 'fechaSolicitud'> & { fechaSolicitud?: string }) => Promise<void>;

  // Notificaciones Toast
  toast: { message: string; type: 'success' | 'alert' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'alert' | 'info') => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Sedes
  const [sedes, setSedes] = useState<SedeCentro[]>(() => {
    const saved = localStorage.getItem('samanya_admin_sedes');
    return saved ? JSON.parse(saved) : SEED_SEDES;
  });

  const [activeSedeId, setActiveSedeIdState] = useState<number>(() => {
    const saved = localStorage.getItem('samanya_active_sede_id');
    return saved ? Number(saved) : 1;
  });

  const setActiveSedeId = (id: number) => {
    setActiveSedeIdState(id);
    localStorage.setItem('samanya_active_sede_id', String(id));
  };

  const activeSede = sedes.find((s) => s.id === activeSedeId) || sedes[0];

  // 2. Tab activo
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // 3. Estados con persistencia local
  const [residentes, setResidentes] = useState<Residente[]>(() => {
    const saved = localStorage.getItem('samanya_admin_residentes');
    return saved ? JSON.parse(saved) : SEED_RESIDENTES;
  });

  const [familiares, setFamiliares] = useState<FamiliarAcudiente[]>(() => {
    const saved = localStorage.getItem('samanya_admin_familiares');
    return saved ? JSON.parse(saved) : SEED_FAMILIARES;
  });

  const [trabajadores, setTrabajadores] = useState<TrabajadorEmpleado[]>(() => {
    const saved = localStorage.getItem('samanya_admin_trabajadores');
    return saved ? JSON.parse(saved) : SEED_TRABAJADORES;
  });

  const [turnos, setTurnos] = useState<TurnoAsignado[]>(() => {
    const saved = localStorage.getItem('samanya_admin_turnos');
    return saved ? JSON.parse(saved) : SEED_TURNOS;
  });

  const [permisos, setPermisos] = useState<PermisoAusencia[]>(() => {
    const saved = localStorage.getItem('samanya_admin_permisos');
    return saved ? JSON.parse(saved) : SEED_PERMISOS;
  });

  const [incidentes, setIncidentes] = useState<IncidenteOperativo[]>(() => {
    const saved = localStorage.getItem('samanya_admin_incidentes');
    return saved ? JSON.parse(saved) : SEED_INCIDENTES;
  });

  // Guardado en localStorage al mutar
  useEffect(() => {
    localStorage.setItem('samanya_admin_sedes', JSON.stringify(sedes));
  }, [sedes]);

  useEffect(() => {
    localStorage.setItem('samanya_admin_residentes', JSON.stringify(residentes));
  }, [residentes]);

  useEffect(() => {
    localStorage.setItem('samanya_admin_familiares', JSON.stringify(familiares));
  }, [familiares]);

  useEffect(() => {
    localStorage.setItem('samanya_admin_trabajadores', JSON.stringify(trabajadores));
  }, [trabajadores]);

  useEffect(() => {
    localStorage.setItem('samanya_admin_turnos', JSON.stringify(turnos));
  }, [turnos]);

  useEffect(() => {
    localStorage.setItem('samanya_admin_permisos', JSON.stringify(permisos));
  }, [permisos]);

  useEffect(() => {
    localStorage.setItem('samanya_admin_incidentes', JSON.stringify(incidentes));
  }, [incidentes]);

  // Sincronizar en caliente los trabajadores asignados en turnos con la lista maestra de trabajadores
  useEffect(() => {
    setTurnos((prevTurnos) => {
      let changed = false;
      const synced = prevTurnos.map((turno) => {
        let turnoChanged = false;
        const updatedWorkers = turno.trabajadoresAsignados.map((w) => {
          const master = trabajadores.find((t) => t.id === w.idTrabajador);
          if (!master) return w;
          const masterName = master.nombreCompleto || `${master.nombres} ${master.apellidos}`.trim();
          if (
            w.nombre !== masterName ||
            (master.avatarUrl && w.avatarUrl !== master.avatarUrl) ||
            (master.cargo && w.cargo !== master.cargo) ||
            (master.area && w.area !== master.area)
          ) {
            turnoChanged = true;
            return {
              ...w,
              nombre: masterName,
              avatarUrl: master.avatarUrl || w.avatarUrl,
              cargo: master.cargo || w.cargo,
              area: master.area || w.area
            };
          }
          return w;
        });

        if (turnoChanged) {
          changed = true;
          return { ...turno, trabajadoresAsignados: updatedWorkers };
        }
        return turno;
      });

      return changed ? synced : prevTurnos;
    });
  }, [trabajadores]);

  // Sincronización en tiempo real con la base de datos Oracle
  const sincronizarResidentes = async (silencioso = false) => {
    try {
      const resp = await adminApi.residentes.consultarCenso(activeSede.id);
      if (resp && resp.success && Array.isArray(resp.data)) {
        const rows = resp.data;
        const mapped: Residente[] = rows.map((r: any) => {
          let estadoVal: Residente['estado'] = 'Activo';
          const est = String(r.estado || '').toUpperCase();
          if (est.includes('OBSERVACION') || est.includes('OBSERVACIÓN')) estadoVal = 'En Observación';
          else if (est.includes('HOSPITAL')) estadoVal = 'Hospitalizado';
          else if (est.includes('EGRESADO')) estadoVal = 'Egresado';

          let movVal: Residente['nivelMovilidad'] = 'Independiente';
          const mov = String(r.nivel_movilidad || '').toLowerCase();
          if (mov.includes('leve') || mov.includes('asistida')) movVal = 'Asistencia Leve';
          else if (mov.includes('moderada') || mov.includes('silla')) movVal = 'Asistencia Moderada';
          else if (mov.includes('dependiente') || mov.includes('encamado')) movVal = 'Dependiente Total';

          return {
            id: Number(r.id),
            idCentro: Number(r.id_centro) || activeSede.id,
            codigoExpediente: r.codigo_expediente || `RES-${r.id}`,
            tipoIdentificacion: 'CC',
            identificacion: String(r.identificacion || ''),
            nombres: r.nombres || '',
            apellidos: r.apellidos || '',
            nombreCompleto: r.nombre_completo || `${r.nombres || ''} ${r.apellidos || ''}`.trim(),
            fechaNacimiento: r.fecha_nacimiento ? String(r.fecha_nacimiento).slice(0, 10) : '1945-01-01',
            edad: Number(r.edad) || 75,
            genero: 'M',
            fotoUrl: r.foto_url,
            habitacion: String(r.habitacion || '101'),
            cama: String(r.cama || 'A'),
            eps: 'Sanitas EPS',
            planComplementario: '',
            tipoSangre: 'O+',
            nivelMovilidad: movVal,
            tipoDieta: (r.tipo_dieta as any) || 'Normal / General',
            alertasClinicas: r.alertas_clinicas || '',
            estado: estadoVal,
            fechaIngreso: r.fecha_ingreso ? String(r.fecha_ingreso).slice(0, 10) : '2024-01-10',
            medicamentos: [],
            acudientes: []
          };
        });

        setResidentes(mapped);
        localStorage.setItem('samanya_admin_residentes', JSON.stringify(mapped));
        if (!silencioso) {
          showToast(`✅ Sincronizados ${mapped.length} residentes desde la base de datos Oracle`, 'success');
        }
      }
    } catch (err: any) {
      console.error('[AdminContext] Error al sincronizar residentes con Oracle:', err);
      if (!silencioso) {
        showToast(`❌ Error al conectar con Oracle: ${err.message || 'Error de conexión'}`, 'alert');
      }
    }
  };

  // Sincronizar automáticamente con Oracle al cargar o cambiar sede
  useEffect(() => {
    sincronizarResidentes(true);
  }, [activeSede.id]);

  // Búsqueda
  const [searchQuery, setSearchQuery] = useState('');

  // Modales
  const [isRegisterResidentOpen, setIsRegisterResidentOpen] = useState(false);
  const [isRegisterFamilyOpen, setIsRegisterFamilyOpen] = useState(false);
  const [isRegisterWorkerOpen, setIsRegisterWorkerOpen] = useState(false);
  const [isRegisterLeaveOpen, setIsRegisterLeaveOpen] = useState(false);
  const [isAssignShiftOpen, setIsAssignShiftOpen] = useState(false);
  const [selectedResidente, setSelectedResidente] = useState<Residente | null>(null);
  const [isResidenteDetailOpen, setIsResidenteDetailOpen] = useState(false);

  // Modales de Edición
  const [editingResidente, setEditingResidente] = useState<Residente | null>(null);
  const [isEditResidenteOpen, setIsEditResidenteOpen] = useState(false);
  const [editingTrabajador, setEditingTrabajador] = useState<TrabajadorEmpleado | null>(null);
  const [isEditTrabajadorOpen, setIsEditTrabajadorOpen] = useState(false);
  const [editingFamiliar, setEditingFamiliar] = useState<FamiliarAcudiente | null>(null);
  const [isEditFamiliarOpen, setIsEditFamiliarOpen] = useState(false);
  const [isEditSedeOpen, setIsEditSedeOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  // Cálculo de Métricas del Dashboard
  const sedeResidentes = residentes.filter((r) => r.idCentro === activeSedeId);
  const residentesActivos = sedeResidentes.filter((r) => r.estado === 'Activo').length;
  const porcentajeOcupacion = Math.round((residentesActivos / (activeSede?.capacidadTotal || 40)) * 100);

  const turnoActual = turnos.find((t) => t.idCentro === activeSedeId && t.estado === 'Activo');
  const personalActivo = turnoActual ? turnoActual.trabajadoresAsignados.length : 3;
  const permisosPendientesCount = permisos.filter((p) => p.estado === 'Pendiente').length;
  const incidentesActivosCount = incidentes.filter(
    (i) => i.idCentro === activeSedeId && (i.estado === 'Abierto' || i.estado === 'En Seguimiento')
  ).length;

  const metrics: AdminDashboardMetrics = {
    totalResidentes: residentesActivos,
    capacidadTotal: activeSede?.capacidadTotal || 40,
    porcentajeOcupacion,
    personalActivoTurno: personalActivo,
    tareasCumplimiento: 88,
    incidentesActivos: incidentesActivosCount,
    permisosPendientes: permisosPendientesCount,
    alertasCriticas: incidentesActivosCount > 0 ? 1 : 0
  };

  // =========================================================================
  // ACCIONES DE NEGOCIO (Despacho JSON hacia la lógica de negocio)
  // =========================================================================

  // 1. Registrar Residente (Flujo de Admisión)
  const registrarResidente = async (
    data: Omit<Residente, 'id' | 'codigoExpediente' | 'edad'> & {
      fechaIngreso?: string;
      familiarContacto?: {
        nombres: string;
        apellidos: string;
        identificacion: string;
        parentesco: string;
        telefono: string;
        email: string;
      };
    }
  ) => {
    // Cálculo de edad
    const birth = new Date(data.fechaNacimiento);
    const today = new Date();
    let edad = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      edad--;
    }

    const newId = Date.now();
    const codigoExpediente = `RES-2025-${String(residentes.length + 1).padStart(3, '0')}`;
    const fechaIngreso = data.fechaIngreso || new Date().toISOString().split('T')[0];

    // Mapeo a IDs de catálogo requeridos por Oracle
    const idTipoIdentificacion = data.tipoIdentificacion === 'CC' ? 1 : data.tipoIdentificacion === 'CE' ? 2 : 3;
    const idGenero = data.genero === 'M' ? 1 : data.genero === 'F' ? 2 : 3;
    const idNivelMovilidad =
      data.nivelMovilidad === 'Independiente' ? 1 :
      data.nivelMovilidad === 'Asistencia Leve' ? 2 :
      data.nivelMovilidad === 'Asistencia Moderada' ? 3 : 4;
    const idTipoDieta =
      data.tipoDieta === 'Normal / General' ? 1 :
      data.tipoDieta === 'Blanda' ? 2 :
      data.tipoDieta === 'Hiposódica' ? 3 :
      data.tipoDieta === 'Diabética' ? 4 : 5;
    const idEstadoResidente =
      data.estado === 'Activo' ? 1 :
      data.estado === 'En Observación' ? 2 :
      data.estado === 'Hospitalizado' ? 3 : 4;

    // Payload para el paquete Oracle PKGLN_ADMISION_RESIDENTE
    const payload = {
      idCentro: data.idCentro || activeSedeId,
      idTipoIdentificacion,
      tipoIdentificacion: data.tipoIdentificacion,
      identificacion: data.identificacion,
      nombres: data.nombres,
      apellidos: data.apellidos,
      fechaNacimiento: data.fechaNacimiento,
      idGenero,
      genero: data.genero,
      habitacion: data.habitacion,
      cama: data.cama,
      eps: data.eps,
      planComplementario: data.planComplementario,
      tipoSangre: data.tipoSangre,
      idNivelMovilidad,
      nivelMovilidad: data.nivelMovilidad,
      idTipoDieta,
      tipoDieta: data.tipoDieta,
      idEstadoResidente,
      fechaIngreso,
      alertasClinicas: data.alertasClinicas,
      medicamentos: data.medicamentos,
      acudienteAsociado: data.familiarContacto
        ? {
            ...data.familiarContacto,
            esPrincipal: true
          }
        : undefined
    };

    try {
      // Despacho a API Oracle
      await adminApi.residentes.registrarResidente(payload);

      // Si se incluyó acudiente en el formulario, registrarlo en la lista de familiares
      let acudientesAsociados = [...data.acudientes];
      if (data.familiarContacto && data.familiarContacto.nombres.trim()) {
        const nuevoFamiliarId = Date.now() + 1;
        const nuevoFamiliar: FamiliarAcudiente = {
          id: nuevoFamiliarId,
          tipoIdentificacion: 'CC',
          identificacion: data.familiarContacto.identificacion,
          nombres: data.familiarContacto.nombres,
          apellidos: data.familiarContacto.apellidos,
          nombreCompleto: `${data.familiarContacto.nombres} ${data.familiarContacto.apellidos}`.trim(),
          telefonoPrincipal: data.familiarContacto.telefono,
          email: data.familiarContacto.email,
          direccion: activeSede.direccion,
          ciudad: activeSede.ciudad,
          canalNotificacionPref: 'WhatsApp',
          residentesAsociados: [
            {
              idResidente: newId,
              nombreResidente: `${data.nombres} ${data.apellidos}`.trim(),
              parentesco: data.familiarContacto.parentesco,
              esPrincipal: true,
              autorizadoSalidas: true,
              responsablePago: true
            }
          ]
        };

        setFamiliares((prev) => [nuevoFamiliar, ...prev]);

        acudientesAsociados.push({
          id: nuevoFamiliarId,
          nombreCompleto: nuevoFamiliar.nombreCompleto,
          parentesco: data.familiarContacto.parentesco,
          telefono: data.familiarContacto.telefono,
          email: data.familiarContacto.email,
          esPrincipal: true
        });
      }

      const nuevoResidente: Residente = {
        ...data,
        id: newId,
        codigoExpediente,
        edad,
        fechaIngreso,
        estado: data.estado || 'Activo',
        acudientes: acudientesAsociados
      };

      setResidentes((prev) => [nuevoResidente, ...prev]);
      showToast(`✅ Residente ${nuevoResidente.nombreCompleto} guardado exitosamente en la base de datos Oracle`, 'success');
    } catch (err: any) {
      console.error('[Error registrarResidente Oracle]:', err);
      showToast(`❌ Error al guardar en base de datos Oracle: ${err.message || 'No se pudo completar la operación'}`, 'alert');
      throw err;
    }
  };

  // 2. Registrar Familiar / Acudiente
  const registrarFamiliar = async (
    data: Omit<FamiliarAcudiente, 'id' | 'nombreCompleto'> & {
      idResidenteVinculado?: number;
      parentesco?: string;
      esPrincipal?: boolean;
      fotoUrl?: string;
    }
  ) => {
    const newId = Date.now();
    const nombreCompleto = `${data.nombres} ${data.apellidos}`.trim();
    const esPrincipal = data.esPrincipal ?? true;

    let residentesAsociados = [...data.residentesAsociados];
    if (data.idResidenteVinculado && data.parentesco) {
      const res = residentes.find((r) => r.id === data.idResidenteVinculado);
      if (res) {
        residentesAsociados.push({
          idResidente: res.id,
          nombreResidente: res.nombreCompleto,
          parentesco: data.parentesco,
          esPrincipal,
          autorizadoSalidas: true,
          responsablePago: true
        });

        // Actualizar el residente con el acudiente
        setResidentes((prev) =>
          prev.map((r) =>
            r.id === res.id
              ? {
                  ...r,
                  acudientes: [
                    ...r.acudientes,
                    {
                      id: newId,
                      nombreCompleto,
                      parentesco: data.parentesco || 'Familiar',
                      telefono: data.telefonoPrincipal,
                      email: data.email,
                      esPrincipal
                    }
                  ]
                }
              : r
          )
        );
      }
    }

    // Mapeo de catálogos requeridos por Oracle PKGLN_GESTION_FAMILIARES
    const idTipoIdentificacion = data.tipoIdentificacion === 'CC' ? 1 : data.tipoIdentificacion === 'CE' ? 2 : 3;
    const idCanalNotifPref =
      data.canalNotificacionPref === 'Correo' ? 2 :
      data.canalNotificacionPref === 'Push App' ? 3 :
      data.canalNotificacionPref === 'Llamada' ? 4 : 1;

    let idParentesco = 1;
    const par = (data.parentesco || '').toLowerCase();
    if (par.includes('cónyuge') || par.includes('conyuge')) idParentesco = 2;
    else if (par.includes('herman')) idParentesco = 3;
    else if (par.includes('tutor')) idParentesco = 4;
    else if (par.includes('sobrin')) idParentesco = 5;
    else if (par.includes('otro')) idParentesco = 6;
    else idParentesco = 1;

    // Solo enviar idResidente si es un ID válido de la base de datos (< 1000000)
    const validIdResidente =
      data.idResidenteVinculado && Number(data.idResidenteVinculado) < 1000000
        ? Number(data.idResidenteVinculado)
        : undefined;

    // Payload para el paquete Oracle PKGLN_GESTION_FAMILIARES
    const payload = {
      idTipoIdentificacion,
      tipoIdentificacion: data.tipoIdentificacion,
      identificacion: data.identificacion,
      nombres: data.nombres,
      apellidos: data.apellidos,
      telefonoPrincipal: data.telefonoPrincipal,
      telefonoSecundario: data.telefonoSecundario,
      email: data.email,
      direccion: data.direccion,
      ciudad: data.ciudad,
      idCanalNotifPref,
      canalNotificacionPref: data.canalNotificacionPref,
      idResidente: validIdResidente,
      idParentesco,
      parentesco: data.parentesco,
      esPrincipal: esPrincipal ? 1 : 0,
      autorizadoSalidas: 1,
      responsablePago: 1
    };

    try {
      await adminApi.familiares.registrarFamiliar(payload);

      const nuevoFamiliar: FamiliarAcudiente = {
        ...data,
        id: newId,
        nombreCompleto,
        residentesAsociados,
        fotoUrl: data.fotoUrl
      };

      setFamiliares((prev) => [nuevoFamiliar, ...prev]);
      showToast(`✅ Familiar ${nombreCompleto} registrado exitosamente en la base de datos Oracle`, 'success');
    } catch (err: any) {
      console.error('[Error registrarFamiliar Oracle]:', err);
      showToast(`❌ Error al registrar familiar en Oracle: ${err.message || 'Fallo de inserción'}`, 'alert');
      throw err;
    }
  };

  // 3. Registrar Trabajador / Empleado
  const registrarTrabajador = async (
    data: Omit<TrabajadorEmpleado, 'id' | 'nombreCompleto' | 'fechaContratacion'>
  ) => {
    const newId = Date.now();
    const nombreCompleto = `${data.nombres} ${data.apellidos}`.trim();
    const fechaContratacion = new Date().toISOString().split('T')[0];

    // Payload para el paquete Oracle PKGLN_TALENTO_HUMANO
    const payload = {
      idCentro: data.idCentro || activeSedeId,
      tipoIdentificacion: data.tipoIdentificacion,
      identificacion: data.identificacion,
      nombres: data.nombres,
      apellidos: data.apellidos,
      cargo: data.cargo,
      area: data.area,
      unidadAsignada: data.unidadAsignada,
      telefono: data.telefono,
      emailCorp: data.email,
      fechaContratacion,
      tipoContrato: data.tipoContrato,
      eps: data.eps,
      arl: data.arl,
      turnoHabitual: data.turnoHabitual
    };

    await adminApi.trabajadores.registrarTrabajador(payload);

    const nuevoTrabajador: TrabajadorEmpleado = {
      ...data,
      id: newId,
      nombreCompleto,
      fechaContratacion
    };

    setTrabajadores((prev) => [nuevoTrabajador, ...prev]);
    showToast(`Colaborador ${nombreCompleto} registrado en Talento Humano`, 'success');
  };

  // 4. Actualizar Estado de Trabajador
  const actualizarEstadoTrabajador = async (
    idTrabajador: number,
    nuevoEstado: 'Activo' | 'En Permiso' | 'Inactivo'
  ) => {
    const estadoId = nuevoEstado === 'Activo' ? 1 : nuevoEstado === 'En Permiso' ? 2 : 3;

    await adminApi.trabajadores.actualizarEstadoTrabajador({
      idTrabajador,
      idEstadoEmpleado: estadoId
    });

    setTrabajadores((prev) =>
      prev.map((t) => (t.id === idTrabajador ? { ...t, estado: nuevoEstado } : t))
    );

    showToast(`Estado del trabajador actualizado a ${nuevoEstado}`, 'info');
  };

  // 5. Asignar Trabajador a Turno
  const asignarTrabajadorATurno = async (idTurno: number, idTrabajador: number) => {
    const trabajador = trabajadores.find((t) => t.id === idTrabajador);
    if (!trabajador) return;

    await adminApi.turnos.asignarTurno({
      idCentro: activeSedeId,
      idTrabajador,
      idTurno,
      fechaTurno: new Date().toISOString().split('T')[0]
    });

    setTurnos((prev) =>
      prev.map((t) => {
        if (t.id !== idTurno) return t;
        const yaExiste = t.trabajadoresAsignados.some((w) => w.idTrabajador === idTrabajador);
        if (yaExiste) return t;

        const updatedWorkers = [
          ...t.trabajadoresAsignados,
          {
            idTrabajador: trabajador.id,
            nombre: trabajador.nombreCompleto,
            cargo: trabajador.cargo,
            area: trabajador.area,
            avatarUrl: trabajador.avatarUrl
          }
        ];

        // Verificar cobertura
        const cumpleCobertura = updatedWorkers.length >= t.coberturaMinimaRequerida;

        return {
          ...t,
          trabajadoresAsignados: updatedWorkers,
          alertas: cumpleCobertura ? undefined : t.alertas
        };
      })
    );

    showToast(`${trabajador.nombreCompleto} asignado al turno exitosamente`, 'success');
  };

  // 6. Gestionar Permisos
  const aprobarPermiso = async (idPermiso: number, comentarios: string) => {
    await adminApi.permisos.gestionarSolicitud({
      idSolicitud: idPermiso,
      idEstadoPermiso: 2, // Aprobado
      comentariosAdmin: comentarios
    });

    const permiso = permisos.find((p) => p.id === idPermiso);
    if (permiso) {
      // Actualizar estado del trabajador a 'En Permiso'
      setTrabajadores((prev) =>
        prev.map((t) => (t.id === permiso.idTrabajador ? { ...t, estado: 'En Permiso' } : t))
      );
    }

    setPermisos((prev) =>
      prev.map((p) =>
        p.id === idPermiso ? { ...p, estado: 'Aprobado', comentariosAdmin: comentarios } : p
      )
    );

    showToast('Solicitud de permiso aprobada', 'success');
  };

  const rechazarPermiso = async (idPermiso: number, comentarios: string) => {
    await adminApi.permisos.gestionarSolicitud({
      idSolicitud: idPermiso,
      idEstadoPermiso: 3, // Rechazado
      comentariosAdmin: comentarios
    });

    setPermisos((prev) =>
      prev.map((p) =>
        p.id === idPermiso ? { ...p, estado: 'Rechazado', comentariosAdmin: comentarios } : p
      )
    );

    showToast('Solicitud de permiso rechazada', 'alert');
  };

  const registrarPermiso = async (
    nuevoPermiso: Omit<PermisoAusencia, 'id' | 'fechaSolicitud'> & { fechaSolicitud?: string }
  ) => {
    const newId = Math.max(0, ...permisos.map((p) => p.id)) + 1;
    const fechaSolicitud = nuevoPermiso.fechaSolicitud || new Date().toISOString().split('T')[0];

    const registroCompleto: PermisoAusencia = {
      ...nuevoPermiso,
      id: newId,
      fechaSolicitud
    };

    // Mapeo a IDs de catálogo requeridos por Oracle
    const tipoMap: Record<string, number> = {
      'Vacaciones': 1,
      'Incapacidad Médica': 2,
      'Permiso Personal': 3,
      'Licencia': 5
    };

    const idTipoPermiso = tipoMap[nuevoPermiso.tipo] || 3;
    const idEstadoPermiso =
      nuevoPermiso.estado === 'Aprobado' ? 2 : nuevoPermiso.estado === 'Rechazado' ? 3 : 1;

    try {
      await adminApi.permisos.registrarPermiso({
        idTrabajador: nuevoPermiso.idTrabajador,
        idTipoPermiso,
        fechaInicio: nuevoPermiso.fechaInicio,
        fechaFin: nuevoPermiso.fechaFin,
        motivo: nuevoPermiso.motivo,
        urlSoporte: nuevoPermiso.soporteUrl,
        idEstadoPermiso,
        observacionesAdmin: nuevoPermiso.comentariosAdmin
      });
    } catch (err) {
      console.warn('Registro de permiso en backend Oracle no completado (modo local/offline activo):', err);
    }

    // Si se crea en estado 'Aprobado', cambiar estado del colaborador a 'En Permiso'
    if (nuevoPermiso.estado === 'Aprobado') {
      setTrabajadores((prev) =>
        prev.map((t) => (t.id === nuevoPermiso.idTrabajador ? { ...t, estado: 'En Permiso' } : t))
      );
    }

    setPermisos((prev) => [registroCompleto, ...prev]);
    showToast('Novedad de personal registrada exitosamente', 'success');
  };

  // 7. Actualizar Residente
  const actualizarResidente = async (idResidente: number, data: Partial<Residente>) => {
    const payload = {
      idResidente,
      nombres: data.nombres,
      apellidos: data.apellidos,
      identificacion: data.identificacion,
      idTipoIdentificacion: data.tipoIdentificacion === 'CC' ? 1 : 2,
      fechaNacimiento: data.fechaNacimiento,
      idGenero: data.genero === 'F' ? 2 : 1,
      eps: data.eps,
      planComplementario: data.planComplementario,
      tipoSangre: data.tipoSangre,
      habitacion: data.habitacion,
      cama: data.cama,
      idNivelMovilidad: data.nivelMovilidad
        ? data.nivelMovilidad === 'Independiente'
          ? 1
          : data.nivelMovilidad === 'Asistencia Leve'
          ? 2
          : data.nivelMovilidad === 'Asistencia Moderada'
          ? 3
          : 4
        : undefined,
      idTipoDieta: data.tipoDieta
        ? data.tipoDieta === 'Normal / General'
          ? 1
          : data.tipoDieta === 'Blanda'
          ? 2
          : data.tipoDieta === 'Hiposódica'
          ? 3
          : data.tipoDieta === 'Diabética'
          ? 4
          : 5
        : undefined,
      alertasClinicas: data.alertasClinicas,
      fechaIngreso: data.fechaIngreso,
      idEstadoResidente: data.estado
        ? data.estado === 'Activo'
          ? 1
          : data.estado === 'En Observación'
          ? 2
          : data.estado === 'Hospitalizado'
          ? 3
          : 4
        : undefined,
      medicamentos: data.medicamentos
    };

    try {
      await adminApi.residentes.actualizarResidente(payload);

      setResidentes((prev) =>
        prev.map((r) => {
          if (r.id !== idResidente) return r;
          const nombreCompleto =
            data.nombres && data.apellidos
              ? `${data.nombres} ${data.apellidos}`.trim()
              : data.nombres || data.apellidos
              ? `${data.nombres || r.nombres} ${data.apellidos || r.apellidos}`.trim()
              : r.nombreCompleto;

          let edad = r.edad;
          if (data.fechaNacimiento) {
            const birth = new Date(data.fechaNacimiento);
            const today = new Date();
            edad = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
              edad--;
            }
          }

          return {
            ...r,
            ...data,
            nombreCompleto,
            edad,
            fechaIngreso: data.fechaIngreso || r.fechaIngreso,
            estado: data.estado || r.estado,
            medicamentos: data.medicamentos !== undefined ? data.medicamentos : r.medicamentos
          };
        })
      );

      setSelectedResidente((prev) => {
        if (!prev || prev.id !== idResidente) return prev;
        const nombreCompleto =
          data.nombres && data.apellidos
            ? `${data.nombres} ${data.apellidos}`.trim()
            : prev.nombreCompleto;
        return { ...prev, ...data, nombreCompleto };
      });

      showToast('✅ Cambios del residente guardados exitosamente en Oracle', 'success');
    } catch (err: any) {
      console.error('[Error actualizarResidente Oracle]:', err);
      showToast(`❌ Error al actualizar en base de datos Oracle: ${err.message || 'Fallo de actualización'}`, 'alert');
      throw err;
    }
  };

  // 8. Actualizar Trabajador
  const actualizarTrabajador = async (idTrabajador: number, data: Partial<TrabajadorEmpleado>) => {
    const payload = {
      idTrabajador,
      nombres: data.nombres,
      apellidos: data.apellidos,
      identificacion: data.identificacion,
      idTipoIdentificacion: data.tipoIdentificacion === 'CC' ? 1 : 2,
      idCargoEmpleado: 1,
      idAreaEmpleado: 1,
      unidadAsignada: data.unidadAsignada,
      telefono: data.telefono,
      emailCorp: data.email,
      idEstadoEmpleado: data.estado === 'Activo' ? 1 : data.estado === 'En Permiso' ? 2 : 3
    };

    await adminApi.trabajadores.actualizarTrabajador(payload);

    let updatedNombreCompleto = '';

    setTrabajadores((prev) =>
      prev.map((t) => {
        if (t.id !== idTrabajador) return t;
        const nombreCompleto =
          data.nombres && data.apellidos
            ? `${data.nombres} ${data.apellidos}`.trim()
            : data.nombres || data.apellidos
            ? `${data.nombres || t.nombres} ${data.apellidos || t.apellidos}`.trim()
            : t.nombreCompleto;
        updatedNombreCompleto = nombreCompleto;
        return {
          ...t,
          ...data,
          nombreCompleto
        };
      })
    );

    // Sincronizar de inmediato los turnos donde este trabajador esté asignado
    setTurnos((prevTurnos) =>
      prevTurnos.map((turno) => ({
        ...turno,
        trabajadoresAsignados: turno.trabajadoresAsignados.map((w) => {
          if (w.idTrabajador !== idTrabajador) return w;
          return {
            ...w,
            nombre: updatedNombreCompleto || (data.nombres ? `${data.nombres} ${data.apellidos || ''}`.trim() : w.nombre),
            cargo: data.cargo || w.cargo,
            area: data.area || w.area,
            avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : w.avatarUrl
          };
        })
      }))
    );

    showToast('Información del colaborador actualizada exitosamente', 'success');
  };

  // 9. Actualizar Familiar
  const actualizarFamiliar = async (
    idFamiliar: number,
    data: Partial<FamiliarAcudiente> & { esPrincipal?: boolean }
  ) => {
    const payload = {
      idAcudiente: idFamiliar,
      nombres: data.nombres,
      apellidos: data.apellidos,
      identificacion: data.identificacion,
      idTipoIdentificacion: data.tipoIdentificacion === 'CC' ? 1 : 2,
      telefonoPrincipal: data.telefonoPrincipal,
      telefonoSecundario: data.telefonoSecundario,
      email: data.email,
      direccion: data.direccion,
      ciudad: data.ciudad,
      idCanalNotifPref:
        data.canalNotificacionPref === 'WhatsApp'
          ? 1
          : data.canalNotificacionPref === 'Correo'
          ? 2
          : data.canalNotificacionPref === 'Llamada'
          ? 3
          : 4
    };

    await adminApi.familiares.actualizarFamiliar(payload);

    const nombreCompleto =
      data.nombres && data.apellidos
        ? `${data.nombres} ${data.apellidos}`.trim()
        : data.nombres || data.apellidos
        ? `${data.nombres || ''} ${data.apellidos || ''}`.trim()
        : undefined;

    setFamiliares((prev) =>
      prev.map((f) => {
        if (f.id !== idFamiliar) return f;
        const updatedResidentesAsociados =
          data.esPrincipal !== undefined
            ? f.residentesAsociados.map((ra) => ({ ...ra, esPrincipal: data.esPrincipal! }))
            : f.residentesAsociados;

        return {
          ...f,
          ...data,
          residentesAsociados: updatedResidentesAsociados,
          nombreCompleto:
            nombreCompleto ||
            (data.nombres || data.apellidos
              ? `${data.nombres || f.nombres} ${data.apellidos || f.apellidos}`.trim()
              : f.nombreCompleto)
        };
      })
    );

    setResidentes((prev) =>
      prev.map((r) => ({
        ...r,
        acudientes: r.acudientes.map((a) => {
          if (a.id !== idFamiliar) return a;
          return {
            ...a,
            nombreCompleto: nombreCompleto || a.nombreCompleto,
            telefono: data.telefonoPrincipal || a.telefono,
            email: data.email || a.email,
            esPrincipal: data.esPrincipal !== undefined ? data.esPrincipal : a.esPrincipal
          };
        })
      }))
    );

    showToast('Información del familiar/acudiente actualizada exitosamente', 'success');
  };

  // 10. Eliminar Familiar
  const eliminarFamiliar = async (idFamiliar: number) => {
    await adminApi.familiares.eliminarFamiliar({ idAcudiente: idFamiliar });

    setFamiliares((prev) => prev.filter((f) => f.id !== idFamiliar));
    setResidentes((prev) =>
      prev.map((r) => ({
        ...r,
        acudientes: r.acudientes.filter((a) => a.id !== idFamiliar)
      }))
    );

    showToast('Familiar / Acudiente eliminado exitosamente', 'info');
  };

  // 11. Actualizar Sede y Camas
  const actualizarSede = async (idCentro: number, data: Partial<SedeCentro>) => {
    await adminApi.sedes.actualizarSede({
      idCentro,
      capacidadTotal: data.capacidadTotal,
      nombre: data.nombre,
      direccion: data.direccion,
      telefono: data.telefono
    });

    setSedes((prev) =>
      prev.map((s) => (s.id === idCentro ? { ...s, ...data } : s))
    );

    showToast('Configuración de la sede y camas actualizada exitosamente', 'success');
  };

  return (
    <AdminContext.Provider
      value={{
        activeTab,
        setActiveTab,
        sedes,
        activeSedeId,
        activeSede,
        setActiveSedeId,
        residentes,
        familiares,
        trabajadores,
        turnos,
        permisos,
        incidentes,
        metrics,
        searchQuery,
        setSearchQuery,
        isRegisterResidentOpen,
        setIsRegisterResidentOpen,
        isRegisterFamilyOpen,
        setIsRegisterFamilyOpen,
        isRegisterWorkerOpen,
        setIsRegisterWorkerOpen,
        isRegisterLeaveOpen,
        setIsRegisterLeaveOpen,
        isAssignShiftOpen,
        setIsAssignShiftOpen,
        selectedResidente,
        setSelectedResidente,
        isResidenteDetailOpen,
        setIsResidenteDetailOpen,
        editingResidente,
        setEditingResidente,
        isEditResidenteOpen,
        setIsEditResidenteOpen,
        editingTrabajador,
        setEditingTrabajador,
        isEditTrabajadorOpen,
        setIsEditTrabajadorOpen,
        editingFamiliar,
        setEditingFamiliar,
        isEditFamiliarOpen,
        setIsEditFamiliarOpen,
        isEditSedeOpen,
        setIsEditSedeOpen,
        registrarResidente,
        actualizarResidente,
        sincronizarResidentes,
        registrarFamiliar,
        actualizarFamiliar,
        eliminarFamiliar,
        actualizarSede,
        registrarTrabajador,
        actualizarTrabajador,
        actualizarEstadoTrabajador,
        asignarTrabajadorATurno,
        aprobarPermiso,
        rechazarPermiso,
        registrarPermiso,
        toast,
        showToast
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin debe utilizarse dentro de un AdminProvider');
  }
  return context;
};
