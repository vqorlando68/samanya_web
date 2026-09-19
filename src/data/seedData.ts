import {
  SedeCentro,
  Residente,
  FamiliarAcudiente,
  TrabajadorEmpleado,
  TurnoAsignado,
  PermisoAusencia,
  IncidenteOperativo
} from '../types';

export const SEED_SEDES: SedeCentro[] = [
  {
    id: 1,
    nombre: 'Sede Principal Santa Bárbara',
    codigo: 'SEDE-BOG-01',
    ciudad: 'Bogotá D.C.',
    direccion: 'Calle 122 # 18-35, Usaquén',
    telefono: '+57 (601) 745-8900',
    capacidadTotal: 40,
    esSedePrincipal: true
  },
  {
    id: 2,
    nombre: 'Sede Campestre El Nogal',
    codigo: 'SEDE-CHIA-02',
    ciudad: 'Chía, Cundinamarca',
    direccion: 'Vereda La Balsa, Km 3 Vía Guaymaral',
    telefono: '+57 (601) 862-4400',
    capacidadTotal: 28,
    esSedePrincipal: false
  }
];

export const SEED_FAMILIARES: FamiliarAcudiente[] = [
  {
    id: 101,
    tipoIdentificacion: 'CC',
    identificacion: '52.489.120',
    nombres: 'Claudia Patricia',
    apellidos: 'Restrepo Gómez',
    nombreCompleto: 'Claudia Patricia Restrepo Gómez',
    telefonoPrincipal: '310 845 9921',
    telefonoSecundario: '300 214 7890',
    email: 'claudia.restrepo@gmail.com',
    direccion: 'Carrera 15 # 106-25 Apto 402',
    ciudad: 'Bogotá D.C.',
    canalNotificacionPref: 'WhatsApp',
    residentesAsociados: [
      {
        idResidente: 1,
        nombreResidente: 'Blanca Gómez de Restrepo',
        parentesco: 'Hija',
        esPrincipal: true,
        autorizadoSalidas: true,
        responsablePago: true
      }
    ]
  },
  {
    id: 102,
    tipoIdentificacion: 'CC',
    identificacion: '79.345.889',
    nombres: 'Mauricio Andrés',
    apellidos: 'Restrepo Gómez',
    nombreCompleto: 'Mauricio Andrés Restrepo Gómez',
    telefonoPrincipal: '315 678 1234',
    email: 'mauricio.restrepo@empresa.com',
    direccion: 'Calle 134 # 9-45',
    ciudad: 'Bogotá D.C.',
    canalNotificacionPref: 'Correo',
    residentesAsociados: [
      {
        idResidente: 1,
        nombreResidente: 'Blanca Gómez de Restrepo',
        parentesco: 'Hijo',
        esPrincipal: false,
        autorizadoSalidas: true,
        responsablePago: false
      }
    ]
  },
  {
    id: 103,
    tipoIdentificacion: 'CC',
    identificacion: '41.980.231',
    nombres: 'Sonia Esperanza',
    apellidos: 'Daza Morales',
    nombreCompleto: 'Sonia Esperanza Daza Morales',
    telefonoPrincipal: '312 450 7812',
    email: 'sonia.daza@outlook.com',
    direccion: 'Calle 142 # 19-30',
    ciudad: 'Bogotá D.C.',
    canalNotificacionPref: 'WhatsApp',
    residentesAsociados: [
      {
        idResidente: 2,
        nombreResidente: 'Carlos Julio Daza',
        parentesco: 'Hija',
        esPrincipal: true,
        autorizadoSalidas: true,
        responsablePago: true
      }
    ]
  },
  {
    id: 104,
    tipoIdentificacion: 'CC',
    identificacion: '80.123.654',
    nombres: 'Fernando Alberto',
    apellidos: 'Vargas Silva',
    nombreCompleto: 'Fernando Alberto Vargas Silva',
    telefonoPrincipal: '318 901 2345',
    email: 'fernando.vargas@yahoo.com',
    direccion: 'Carrera 7 # 115-60',
    ciudad: 'Bogotá D.C.',
    canalNotificacionPref: 'Llamada',
    residentesAsociados: [
      {
        idResidente: 3,
        nombreResidente: 'Lucila Silva de Vargas',
        parentesco: 'Hijo',
        esPrincipal: true,
        autorizadoSalidas: true,
        responsablePago: true
      }
    ]
  },
  {
    id: 105,
    tipoIdentificacion: 'CC',
    identificacion: '19.456.789',
    nombres: 'Alejandro',
    apellidos: 'Bermúdez Castro',
    nombreCompleto: 'Alejandro Bermúdez Castro',
    telefonoPrincipal: '320 334 5566',
    email: 'abermudez@hotmail.com',
    direccion: 'Calle 127 # 53A-12',
    ciudad: 'Bogotá D.C.',
    canalNotificacionPref: 'WhatsApp',
    residentesAsociados: [
      {
        idResidente: 4,
        nombreResidente: 'Hernando Bermúdez',
        parentesco: 'Hermano',
        esPrincipal: true,
        autorizadoSalidas: false,
        responsablePago: true
      }
    ]
  }
];

export const SEED_RESIDENTES: Residente[] = [
  {
    id: 1,
    idCentro: 1,
    codigoExpediente: 'RES-2025-001',
    tipoIdentificacion: 'CC',
    identificacion: '24.312.890',
    nombres: 'Blanca',
    apellidos: 'Gómez de Restrepo',
    nombreCompleto: 'Blanca Gómez de Restrepo',
    fechaNacimiento: '1942-05-14',
    edad: 83,
    genero: 'F',
    fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    habitacion: '104',
    cama: '104-A',
    eps: 'Sanitas EPS',
    planComplementario: 'Medicina Prepagada Colmédica',
    tipoSangre: 'O+',
    nivelMovilidad: 'Asistencia Leve',
    tipoDieta: 'Hiposódica',
    alertasClinicas: 'Alérgica a la Penicilina. Riesgo leve de caídas nocturnas.',
    estado: 'Activo',
    fechaIngreso: '2024-02-10',
    acudientes: [
      {
        id: 101,
        nombreCompleto: 'Claudia Patricia Restrepo Gómez',
        parentesco: 'Hija',
        telefono: '310 845 9921',
        email: 'claudia.restrepo@gmail.com',
        esPrincipal: true
      },
      {
        id: 102,
        nombreCompleto: 'Mauricio Andrés Restrepo Gómez',
        parentesco: 'Hijo',
        telefono: '315 678 1234',
        email: 'mauricio.restrepo@empresa.com',
        esPrincipal: false
      }
    ]
  },
  {
    id: 2,
    idCentro: 1,
    codigoExpediente: 'RES-2025-002',
    tipoIdentificacion: 'CC',
    identificacion: '17.150.902',
    nombres: 'Carlos Julio',
    apellidos: 'Daza Morales',
    nombreCompleto: 'Carlos Julio Daza Morales',
    fechaNacimiento: '1939-11-20',
    edad: 86,
    genero: 'M',
    fotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    habitacion: '108',
    cama: '108-B',
    eps: 'Compensar EPS',
    tipoSangre: 'A+',
    nivelMovilidad: 'Asistencia Moderada',
    tipoDieta: 'Diabética',
    alertasClinicas: 'Diabetes Mellitus Tipo II. Control glucometría preprandial.',
    estado: 'Activo',
    fechaIngreso: '2024-05-18',
    acudientes: [
      {
        id: 103,
        nombreCompleto: 'Sonia Esperanza Daza Morales',
        parentesco: 'Hija',
        telefono: '312 450 7812',
        email: 'sonia.daza@outlook.com',
        esPrincipal: true
      }
    ]
  },
  {
    id: 3,
    idCentro: 1,
    codigoExpediente: 'RES-2025-003',
    tipoIdentificacion: 'CC',
    identificacion: '28.904.551',
    nombres: 'Lucila',
    apellidos: 'Silva de Vargas',
    nombreCompleto: 'Lucila Silva de Vargas',
    fechaNacimiento: '1945-08-03',
    edad: 80,
    genero: 'F',
    fotoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80',
    habitacion: '201',
    cama: '201-A',
    eps: 'Sura EPS',
    planComplementario: 'Plan Élite Sura',
    tipoSangre: 'B+',
    nivelMovilidad: 'Independiente',
    tipoDieta: 'Normal / General',
    alertasClinicas: 'Hipertensión controlada con Losartán 50mg.',
    estado: 'Activo',
    fechaIngreso: '2024-08-01',
    acudientes: [
      {
        id: 104,
        nombreCompleto: 'Fernando Alberto Vargas Silva',
        parentesco: 'Hijo',
        telefono: '318 901 2345',
        email: 'fernando.vargas@yahoo.com',
        esPrincipal: true
      }
    ]
  },
  {
    id: 4,
    idCentro: 1,
    codigoExpediente: 'RES-2025-004',
    tipoIdentificacion: 'CC',
    identificacion: '19.231.870',
    nombres: 'Hernando',
    apellidos: 'Bermúdez Castro',
    nombreCompleto: 'Hernando Bermúdez Castro',
    fechaNacimiento: '1937-01-29',
    edad: 89,
    genero: 'M',
    fotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    habitacion: '205',
    cama: '205-A',
    eps: 'Famisanar EPS',
    tipoSangre: 'O-',
    nivelMovilidad: 'Dependiente Total',
    tipoDieta: 'Blanda',
    alertasClinicas: 'Movilización en silla de ruedas asistida. Cuidados de piel por decúbito.',
    estado: 'Activo',
    fechaIngreso: '2023-11-15',
    acudientes: [
      {
        id: 105,
        nombreCompleto: 'Alejandro Bermúdez Castro',
        parentesco: 'Hermano',
        telefono: '320 334 5566',
        email: 'abermudez@hotmail.com',
        esPrincipal: true
      }
    ]
  },
  {
    id: 5,
    idCentro: 1,
    codigoExpediente: 'RES-2025-005',
    tipoIdentificacion: 'CC',
    identificacion: '32.654.120',
    nombres: 'Esperanza',
    apellidos: 'Montoya Cuéllar',
    nombreCompleto: 'Esperanza Montoya Cuéllar',
    fechaNacimiento: '1947-09-12',
    edad: 78,
    genero: 'F',
    fotoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    habitacion: '210',
    cama: '210-A',
    eps: 'Nueva EPS',
    tipoSangre: 'A-',
    nivelMovilidad: 'Asistencia Leve',
    tipoDieta: 'Hiposódica',
    alertasClinicas: 'Dificultad leve para deglutir sólidos grandes.',
    estado: 'En Observación',
    fechaIngreso: '2025-01-10',
    acudientes: []
  },
  {
    id: 6,
    idCentro: 1,
    codigoExpediente: 'RES-2025-006',
    tipoIdentificacion: 'CC',
    identificacion: '14.890.334',
    nombres: 'Guillermo',
    apellidos: 'Ospina Rincón',
    nombreCompleto: 'Guillermo Ospina Rincón',
    fechaNacimiento: '1940-03-22',
    edad: 85,
    genero: 'M',
    fotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    habitacion: '212',
    cama: '212-B',
    eps: 'Sanitas EPS',
    tipoSangre: 'O+',
    nivelMovilidad: 'Independiente',
    tipoDieta: 'Normal / General',
    alertasClinicas: 'Ninguna alergia conocida.',
    estado: 'Activo',
    fechaIngreso: '2024-09-05',
    acudientes: []
  }
];

export const SEED_TRABAJADORES: TrabajadorEmpleado[] = [
  {
    id: 201,
    idCentro: 1,
    tipoIdentificacion: 'CC',
    identificacion: '1.020.789.456',
    nombres: 'Mariana',
    apellidos: 'Cifuentes Rojas',
    nombreCompleto: 'Mariana Cifuentes Rojas',
    cargo: 'Jefa de Enfermería',
    area: 'Enfermería',
    unidadAsignada: 'Piso 1 y 2 Asistencial',
    telefono: '313 789 4512',
    email: 'm.cifuentes@samanyacare.com',
    fechaContratacion: '2023-01-15',
    tipoContrato: 'Término Indefinido',
    eps: 'Sura EPS',
    arl: 'Sura ARL',
    estado: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    turnoHabitual: 'Mañana (07:00 - 15:00)'
  },
  {
    id: 202,
    idCentro: 1,
    tipoIdentificacion: 'CC',
    identificacion: '1.014.230.987',
    nombres: 'Laura Viviana',
    apellidos: 'Mora Peña',
    nombreCompleto: 'Laura Viviana Mora Peña',
    cargo: 'Auxiliar de Enfermería',
    area: 'Enfermería',
    unidadAsignada: 'Piso 1',
    telefono: '311 234 5678',
    email: 'l.mora@samanyacare.com',
    fechaContratacion: '2023-06-01',
    tipoContrato: 'Término Indefinido',
    eps: 'Sanitas EPS',
    arl: 'Positiva ARL',
    estado: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813590-7815d9b68c2d?w=150&auto=format&fit=crop&q=80',
    turnoHabitual: 'Mañana (07:00 - 15:00)'
  },
  {
    id: 203,
    idCentro: 1,
    tipoIdentificacion: 'CC',
    identificacion: '80.765.432',
    nombres: 'José Daniel',
    apellidos: 'Quiroga León',
    nombreCompleto: 'José Daniel Quiroga León',
    cargo: 'Cuidador Gerontológico',
    area: 'Cuidado Asistencial',
    unidadAsignada: 'Piso 2',
    telefono: '318 456 7890',
    email: 'j.quiroga@samanyacare.com',
    fechaContratacion: '2023-09-10',
    tipoContrato: 'Término Fijo',
    eps: 'Compensar EPS',
    arl: 'Sura ARL',
    estado: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    turnoHabitual: 'Tarde (14:00 - 22:00)'
  },
  {
    id: 204,
    idCentro: 1,
    tipoIdentificacion: 'CC',
    identificacion: '53.120.456',
    nombres: 'Sandra Milena',
    apellidos: 'Torres Beltrán',
    nombreCompleto: 'Sandra Milena Torres Beltrán',
    cargo: 'Cuidadora Asistencial',
    area: 'Cuidado Asistencial',
    unidadAsignada: 'Piso 1 y Ronda',
    telefono: '316 789 0123',
    email: 's.torres@samanyacare.com',
    fechaContratacion: '2024-02-01',
    tipoContrato: 'Término Indefinido',
    eps: 'Famisanar EPS',
    arl: 'Positiva ARL',
    estado: 'En Permiso',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    turnoHabitual: 'Mañana (07:00 - 15:00)'
  },
  {
    id: 205,
    idCentro: 1,
    tipoIdentificacion: 'CC',
    identificacion: '1.032.456.789',
    nombres: 'Dr. Camilo',
    apellidos: 'Serrano Vega',
    nombreCompleto: 'Dr. Camilo Serrano Vega',
    cargo: 'Médico General Evaluador',
    area: 'Medicina / Especialistas',
    unidadAsignada: 'Consultorio Clínico',
    telefono: '315 890 1234',
    email: 'c.serrano@samanyacare.com',
    fechaContratacion: '2023-04-15',
    tipoContrato: 'Prestación de Servicios',
    eps: 'Sanitas EPS',
    arl: 'Sura ARL',
    estado: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
    turnoHabitual: 'Visita Diurna (08:00 - 12:00)'
  },
  {
    id: 206,
    idCentro: 1,
    tipoIdentificacion: 'CC',
    identificacion: '41.890.654',
    nombres: 'Nohora',
    apellidos: 'Cárdenas Prieto',
    nombreCompleto: 'Nohora Cárdenas Prieto',
    cargo: 'Nutricionista Dietista',
    area: 'Nutrición / Cocina',
    unidadAsignada: 'Área de Dietas y Comedor',
    telefono: '312 345 6789',
    email: 'n.cardenas@samanyacare.com',
    fechaContratacion: '2023-08-20',
    tipoContrato: 'Término Fijo',
    eps: 'Compensar EPS',
    arl: 'Sura ARL',
    estado: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    turnoHabitual: 'Mañana (07:30 - 16:00)'
  }
];

export const SEED_TURNOS: TurnoAsignado[] = [
  {
    id: 301,
    idCentro: 1,
    nombre: 'Turno Mañana (Asistencial & Cuidados)',
    tipo: 'Mañana',
    horario: '07:00 - 15:00',
    fecha: new Date().toISOString().split('T')[0],
    coberturaMinimaRequerida: 3,
    estado: 'Activo',
    trabajadoresAsignados: [
      {
        idTrabajador: 201,
        nombre: 'Mariana Cifuentes Rojas',
        cargo: 'Jefa de Enfermería',
        area: 'Enfermería',
        avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
      },
      {
        idTrabajador: 202,
        nombre: 'Laura Viviana Mora Peña',
        cargo: 'Auxiliar de Enfermería',
        area: 'Enfermería',
        avatarUrl: 'https://images.unsplash.com/photo-1594824813590-7815d9b68c2d?w=150&auto=format&fit=crop&q=80'
      },
      {
        idTrabajador: 206,
        nombre: 'Nohora Cárdenas Prieto',
        cargo: 'Nutricionista Dietista',
        area: 'Nutrición / Cocina',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 302,
    idCentro: 1,
    nombre: 'Turno Tarde (Acompañamiento y Medicación)',
    tipo: 'Tarde',
    horario: '14:00 - 22:00',
    fecha: new Date().toISOString().split('T')[0],
    coberturaMinimaRequerida: 2,
    estado: 'Programado',
    trabajadoresAsignados: [
      {
        idTrabajador: 203,
        nombre: 'José Daniel Quiroga León',
        cargo: 'Cuidador Gerontológico',
        area: 'Cuidado Asistencial',
        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
      }
    ],
    alertas: 'Alerta: Se requiere 1 auxiliar adicional para cumplir cobertura mínima.'
  },
  {
    id: 303,
    idCentro: 1,
    nombre: 'Turno Noche (Vigilancia y Emergencias)',
    tipo: 'Noche',
    horario: '21:00 - 07:00',
    fecha: new Date().toISOString().split('T')[0],
    coberturaMinimaRequerida: 2,
    estado: 'Programado',
    trabajadoresAsignados: [
      {
        idTrabajador: 202,
        nombre: 'Laura Viviana Mora Peña',
        cargo: 'Auxiliar de Enfermería',
        area: 'Enfermería',
        avatarUrl: 'https://images.unsplash.com/photo-1594824813590-7815d9b68c2d?w=150&auto=format&fit=crop&q=80'
      }
    ]
  }
];

export const SEED_PERMISOS: PermisoAusencia[] = [
  {
    id: 401,
    idTrabajador: 204,
    nombreTrabajador: 'Sandra Milena Torres Beltrán',
    area: 'Cuidado Asistencial',
    tipo: 'Incapacidad Médica',
    fechaInicio: '2025-02-18',
    fechaFin: '2025-02-21',
    motivo: 'Cuadro de lumbago mecánico certificado por EPS Sanitas.',
    soporteUrl: 'incapacidad_sandra_torres.pdf',
    estado: 'Aprobado',
    comentariosAdmin: 'Aprobada incapacidad de 3 días. Turnos reasignados a cuidador de refuerzo.',
    fechaSolicitud: '2025-02-17'
  },
  {
    id: 402,
    idTrabajador: 203,
    nombreTrabajador: 'José Daniel Quiroga León',
    area: 'Cuidado Asistencial',
    tipo: 'Permiso Personal',
    fechaInicio: '2025-02-25',
    fechaFin: '2025-02-25',
    motivo: 'Cita en juzgado para diligencia familiar improrrogable.',
    estado: 'Pendiente',
    fechaSolicitud: '2025-02-18'
  }
];

export const SEED_INCIDENTES: IncidenteOperativo[] = [
  {
    id: 501,
    idCentro: 1,
    idResidente: 2,
    nombreResidente: 'Carlos Julio Daza Morales',
    habitacion: '108',
    tipo: 'Caída',
    severidad: 'Media',
    descripcion: 'Pérdida de equilibrio al intentar levantarse sin apoyo hacia el baño. Caída controlada a nivel.',
    accionesTomadas: 'Valoración inmediata por enfermería. Sin traumatismo craneal ni signos de fractura. Se notificó a familiar y se reforzó timbre de auxilio.',
    reportadoPor: 'Mariana Cifuentes Rojas',
    fechaHora: 'Hoy 09:30 AM',
    estado: 'En Seguimiento',
    notificadoFamiliar: true
  },
  {
    id: 502,
    idCentro: 1,
    idResidente: 5,
    nombreResidente: 'Esperanza Montoya Cuéllar',
    habitacion: '210',
    tipo: 'Alteración de Signos',
    severidad: 'Baja',
    descripcion: 'Episodio de presión arterial elevada (150/95 mmHg) durante control matutino.',
    accionesTomadas: 'Reposo en cama durante 30 minutos y administración de dosis indicada según protocolo. Presión estabilizada a 130/85 mmHg.',
    reportadoPor: 'Laura Viviana Mora Peña',
    fechaHora: 'Ayer 11:15 AM',
    estado: 'Cerrado',
    notificadoFamiliar: false
  }
];
