import { SedeCentro, Residente, FamiliarAcudiente, TrabajadorEmpleado, TurnoAsignado, PermisoAusencia, IncidenteOperativo, AdminDashboardMetrics } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AppOperationalContext {
  activeSede: SedeCentro;
  sedes: SedeCentro[];
  residentes: Residente[];
  familiares: FamiliarAcudiente[];
  trabajadores: TrabajadorEmpleado[];
  turnos: TurnoAsignado[];
  permisos: PermisoAusencia[];
  incidentes: IncidenteOperativo[];
  metrics: AdminDashboardMetrics;
}

/**
 * Obtiene la fecha en formato YYYY-MM-DD para la zona horaria de Bogotá (UTC-5)
 */
function getFechaBogota(offsetDays = 0): { fechaStr: string; diaSemana: string; fechaLegible: string } {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);

  const formatter = new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const parts = formatter.formatToParts(d);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '';

  const diaNum = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);

  return {
    fechaStr: diaNum, // YYYY-MM-DD
    diaSemana: getPart('weekday'),
    fechaLegible: formatter.format(d)
  };
}

/**
 * Construye el System Prompt con todo el contexto operativo dinámico
 */
function buildSystemPrompt(context: AppOperationalContext): string {
  const hoy = getFechaBogota(0);
  const manana = getFechaBogota(1);
  const ayer = getFechaBogota(-1);

  // Filtrado ESTRICTO y EXCLUSIVO por la sede activa
  const sedeId = context.activeSede?.id;
  const sedeNombre = context.activeSede?.nombre || 'Sede Principal';

  const turnosSede = context.turnos.filter((t) => t.idCentro === sedeId);
  const residentesSede = context.residentes.filter((r) => r.idCentro === sedeId);
  const trabajadoresSede = context.trabajadores.filter((t) => t.idCentro === sedeId);
  const idsTrabajadoresSede = new Set(trabajadoresSede.map((t) => t.id));
  const permisosSede = context.permisos.filter((p) => idsTrabajadoresSede.has(p.idTrabajador));
  const incidentesSede = context.incidentes.filter((i) => i.idCentro === sedeId);

  // Turnos organizados por fechas relevantes en esta sede
  const turnosHoy = turnosSede.filter((t) => t.fecha === hoy.fechaStr);
  const turnosManana = turnosSede.filter((t) => t.fecha === manana.fechaStr);

  const formatTurno = (t: TurnoAsignado) => {
    const personal = (t.trabajadoresAsignados || [])
      .map((w) => `${w.nombre} (${w.cargo} - ${w.area})`)
      .join(', ');
    return `  - [${t.tipo}] ${t.nombre} | Horario: ${t.horario} | Estado: ${t.estado} | Personal (${t.trabajadoresAsignados?.length || 0}): ${personal || 'Sin personal asignado'}`;
  };

  const listaTurnosProximos = turnosSede
    .slice(0, 25)
    .map((t) => `• Fecha ${t.fecha} (${t.tipo}): ${t.nombre} | ${t.horario} | Asignados: ${(t.trabajadoresAsignados || []).map((w) => `${w.nombre} [${w.cargo}]`).join(', ') || 'Ninguno'}`)
    .join('\n');

  // Trabajadores de esta sede
  const trabajadoresInfo = trabajadoresSede
    .slice(0, 30)
    .map((w) => `- ${w.nombreCompleto} | Cargo: ${w.cargo} | Área: ${w.area} | Estado: ${w.estado} | Turno Habitual: ${w.turnoHabitual || 'Rotativo'}`)
    .join('\n');

  // Residentes de esta sede con consideraciones clínicas y diagnósticos
  const residentesInfo = residentesSede
    .slice(0, 50)
    .map((r) => {
      const alertas = r.alertasClinicas ? ` | Alertas y Consideraciones Clínicas: "${r.alertasClinicas}"` : ' | Sin alertas clínicas reportadas';
      const meds = r.medicamentos && r.medicamentos.length > 0
        ? ` | Medicamentos: ${r.medicamentos.map((m) => `${m.medicamento} (${m.cantidad}, ${m.frecuencia})`).join(', ')}`
        : '';
      const acuds = r.acudientes && r.acudientes.length > 0
        ? ` | Acudiente: ${r.acudientes[0].nombreCompleto} (${r.acudientes[0].parentesco})`
        : '';
      return `- ${r.nombreCompleto} (Expediente: ${r.codigoExpediente}, ${r.edad} años, Habitación ${r.habitacion} Cama ${r.cama}) | Estado: ${r.estado} | Movilidad: ${r.nivelMovilidad} | Dieta: ${r.tipoDieta} | EPS: ${r.eps}${alertas}${meds}${acuds}`;
    })
    .join('\n');

  // Permisos pendientes de colaboradores de esta sede
  const permisosPendientes = permisosSede
    .filter((p) => p.estado === 'Pendiente')
    .map((p) => `- ${p.nombreTrabajador} (${p.tipo}) del ${p.fechaInicio} al ${p.fechaFin}: ${p.motivo}`)
    .join('\n');

  // Capacidad y Ocupación de Camas de la Sede Activa
  const capacidadCamasSede = context.activeSede?.capacidadTotal || 28;
  const residentesActivosSede = residentesSede.filter((r) => r.estado === 'Activo').length;
  const camasOcupadas = residentesActivosSede;
  const camasDisponibles = Math.max(0, capacidadCamasSede - camasOcupadas);
  const porcentajeOcupacionSede = Math.round((camasOcupadas / capacidadCamasSede) * 100);
  const porcentajeExactoSede = ((camasOcupadas / capacidadCamasSede) * 100).toFixed(1);
  const metricaDashboard = context.metrics;

  // Incidentes recientes de esta sede
  const incidentesRecientes = incidentesSede
    .slice(0, 5)
    .map((i) => `- [${i.severidad}] ${i.tipo} en ${i.nombreResidente} (Hab ${i.habitacion}): ${i.descripcion} (${i.estado})`)
    .join('\n');

  return `Eres el Asistente Inteligente de Samanya OS (portal integral de administración y supervisión geriátrica / médica).
Tu misión es asistir al administrador con respuestas operativas exactas, claras y bien redactadas basadas en la información viva del sistema.

=== REGLA ESTRICTA DE ÁMBITO Y AISLAMIENTO DE SEDE ===
Tu alcance operativo y de respuesta está EXCLUSIVA Y ÚNICAMENTE RESTRINGIDO a la sede donde estás ubicado:
📍 Sede: "${sedeNombre}" (ID Centro: ${sedeId}).

DIRECTRICES OBLIGATORIAS DE AISLAMIENTO:
1. SOLO puedes responder preguntas, consultar turnos, residentes, empleados, permisos o incidentes pertenecientes a "${sedeNombre}".
2. NO tienes visibilidad ni autorización para responder acerca de otras sedes del sistema.
3. Si el usuario te pregunta por cualquier otra sede distinta a "${sedeNombre}" o solicita información general de otros centros, debes responder de manera cortés y firme indicando que como asistente estás asignado exclusivamente a la sede "${sedeNombre}", y sugerirle seleccionar la otra sede desde el selector superior de la aplicación.
4. Cualquier pregunta sobre "¿quién está de turno mañana?", "¿qué turnos hay hoy?", residentes, capacidad o personal asistencial se entiende SIEMPRE y SIN EXCEPCIÓN referida a la sede "${sedeNombre}".

=== INFORMACIÓN TEMPORAL Y SEDE (BOGOTÁ, COLOMBIA) ===
- Fecha y Hora de Referencia: Hoy es ${hoy.diaSemana} ${hoy.fechaStr} (${hoy.fechaLegible}).
- Mañana es: ${manana.diaSemana} ${manana.fechaStr} (${manana.fechaLegible}).
- Ayer fue: ${ayer.diaSemana} ${ayer.fechaStr} (${ayer.fechaLegible}).
- Sede Activa: ${sedeNombre} (Ciudad: ${context.activeSede?.ciudad || 'N/A'}, Dirección: ${context.activeSede?.direccion || 'N/A'}).

=== CAPACIDAD Y OCUPACIÓN DE CAMAS EN ${sedeNombre.toUpperCase()} ===
- Total de Camas Habilitadas (Aforo Censable): ${capacidadCamasSede} camas
- Camas Ocupadas por Residentes Activos: ${camasOcupadas} camas
- Camas Libres / Disponibles: ${camasDisponibles} camas
- Porcentaje de Ocupación de Camas de la Sede: ${porcentajeOcupacionSede}% (exacto: ${porcentajeExactoSede}%, calculado como ${camasOcupadas} de ${capacidadCamasSede} camas)
${metricaDashboard ? `- Métrica en Dashboard: ${metricaDashboard.porcentajeOcupacion}% (${metricaDashboard.totalResidentes} de ${metricaDashboard.capacidadTotal} camas totales registradas)` : ''}

=== TURNOS DE HOY EN ${sedeNombre.toUpperCase()} (${hoy.fechaStr}) ===
${turnosHoy.length > 0 ? turnosHoy.map(formatTurno).join('\n') : `No hay turnos registrados para hoy en la sede ${sedeNombre}.`}

=== TURNOS DE MAÑANA EN ${sedeNombre.toUpperCase()} (${manana.fechaStr}) ===
${turnosManana.length > 0 ? turnosManana.map(formatTurno).join('\n') : `No hay turnos registrados para mañana en la sede ${sedeNombre}.`}

=== OTROS TURNOS PROGRAMADOS EN ${sedeNombre.toUpperCase()} ===
${listaTurnosProximos || `No hay más turnos programados en la sede ${sedeNombre}.`}

=== PERSONAL / TRABAJADORES DE ${sedeNombre.toUpperCase()} (Total: ${trabajadoresSede.length}) ===
${trabajadoresInfo || `No hay trabajadores registrados en la sede ${sedeNombre}.`}

=== RESIDENTES Y EXPEDIENTES CLÍNICOS EN ${sedeNombre.toUpperCase()} (Total: ${residentesSede.length}) ===
${residentesInfo || `No hay residentes registrados en la sede ${sedeNombre}.`}

=== PERMISOS Y AUSENCIAS PENDIENTES EN ${sedeNombre.toUpperCase()} ===
${permisosPendientes || `No hay permisos pendientes en la sede ${sedeNombre}.`}

=== INCIDENTES OPERATIVOS RECIENTES EN ${sedeNombre.toUpperCase()} ===
${incidentesRecientes || `Sin incidentes reportados en la sede ${sedeNombre}.`}

=== INSTRUCCIONES DE RESPUESTA ===
1. Responde SIEMPRE en español de forma cordial, profesional, ejecutiva y directa.
2. Si el usuario pregunta por la capacidad, camas ocupadas, camas libres o porcentaje de ocupación:
   - Indica con claridad que la sede "${sedeNombre}" tiene **${capacidadCamasSede} camas habilitadas**, de las cuales **${camasOcupadas} están ocupadas** y **${camasDisponibles} están disponibles**.
   - El porcentaje de ocupación de camas de la sede es del **${porcentajeOcupacionSede}%** (${camasOcupadas} de ${capacidadCamasSede} camas). Si en el panel se visualiza el indicador consolidado (${metricaDashboard?.porcentajeOcupacion}%), puedes mencionarlo como dato institucional complementario.
   - NUNCA digas que la ocupación es del 100% a menos que el número de residentes activos sea igual al total de camas habilitadas (${capacidadCamasSede}).
3. Si el usuario pregunta por la salud, diagnósticos, patologías, condiciones médicas o antecedentes de un residente (por ejemplo: "¿Blanca Nieves tiene Artritis?", "¿qué enfermedades tiene X residente?"):
   - Revisa de inmediato el campo "Alertas y Consideraciones Clínicas" del residente en cuestión.
   - Si en sus alertas clínicas se menciona la condición o patología (por ejemplo: "Artritis reumatoide seropositiva en deformidad en ráfaga cubital", etc.), CONFÍRMALO explícitamente y con certeza, citando las consideraciones clínicas registradas en su expediente, su habitación, edad y estado general.
4. Si el usuario pregunta "¿quién está de turno mañana?", revisa la sección de turnos de mañana (${manana.fechaStr}) de la sede "${sedeNombre}". Menciona claramente el nombre del turno, el horario y cada uno de los colaboradores asignados con su respectivo cargo y área.
5. Si no hay turnos programados para la fecha consultada en esta sede, indícalo con precisión y sugiere amablemente programarlos desde la pestaña "Turnos" usando la opción "Programar Turnos".
6. Utiliza negritas (**texto**), listas con viñetas (•) y separaciones limpias para facilitar la lectura.
7. Recuerda: NUNCA respondas sobre información de otras sedes.
`;
}

/**
 * Envía la conversación al endpoint local /api/chat o directamente a OpenRouter
 */
export async function sendChatMessage(
  history: ChatMessage[],
  context: AppOperationalContext,
  model = 'openai/gpt-4o-mini'
): Promise<string> {
  const systemPrompt = buildSystemPrompt(context);

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({
      role: m.role,
      content: m.content
    }))
  ];

  // Intento 1: Llamar al endpoint local de Vite /api/chat
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: apiMessages,
        temperature: 0.2
      })
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        return content.trim();
      }
    }
  } catch (err) {
    console.warn('Fallo en proxy /api/chat, intentando conexión directa...', err);
  }

  // Intento 2: Llamada directa a OpenRouter API (Fallback)
  const openRouterKey = (import.meta as any).env?.VITE_OPENROUTER_API_KEY || '';

  const directRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openRouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin || 'http://localhost:3000',
      'X-Title': 'Samanya OS Web'
    },
    body: JSON.stringify({
      model,
      messages: apiMessages,
      temperature: 0.2
    })
  });

  if (!directRes.ok) {
    const errorText = await directRes.text();
    throw new Error(`Error de OpenRouter (${directRes.status}): ${errorText}`);
  }

  const directData = await directRes.json();
  const directContent = directData.choices?.[0]?.message?.content;
  if (!directContent) {
    throw new Error('No se recibió contenido en la respuesta de la IA.');
  }

  return directContent.trim();
}
