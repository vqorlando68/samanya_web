import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  CalendarDays,
  LayoutGrid,
  Clock,
  Users,
  AlertTriangle,
  UserPlus,
  CheckCircle2,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  X,
  Trash2,
  Calendar as CalendarIcon,
  ShieldAlert,
  Sparkles,
  Building,
  ListTodo
} from 'lucide-react';
import { resolverAvatarUrl, DEFAULT_AVATAR } from '../../utils/avatarUtils';
import { TurnoAsignado } from '../../types';

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA_HEADERS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const ShiftsView: React.FC = () => {
  const {
    turnos,
    trabajadores,
    asignarTrabajadorATurno,
    desasignarTrabajadorDeTurno,
    activeSede,
    setIsProgramarTurnosOpen,
    setTurnoModalFechaInicial
  } = useAdmin();

  // Modo de visualización principal: 'calendario' o 'cuadrantes'
  const [modoVista, setModoVista] = useState<'calendario' | 'cuadrantes'>('calendario');

  // Sub-vista dentro del Calendario: 'mes' | 'dia' | 'agenda'
  const [subVistaCalendario, setSubVistaCalendario] = useState<'mes' | 'dia' | 'agenda'>('mes');

  // Fecha seleccionada para la sub-vista Día
  const [fechaDiaVista, setFechaDiaVista] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Datos para el hover popover de turno en el calendario
  const [hoveredTurnoData, setHoveredTurnoData] = useState<{
    turno: TurnoAsignado;
    top: number;
    left: number;
  } | null>(null);

  // Control del mes en el calendario
  const hoy = new Date();
  const [currentYear, setCurrentYear] = useState<number>(hoy.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(hoy.getMonth()); // 0-11

  // Filtros del calendario
  const [filtroTipoTurno, setFiltroTipoTurno] = useState<string>('TODOS');
  const [filtroTrabajadorId, setFiltroTrabajadorId] = useState<number>(0);
  const [filtroCobertura, setFiltroCobertura] = useState<string>('TODOS');

  // Inspección de un día específico
  const [diaSeleccionadoStr, setDiaSeleccionadoStr] = useState<string | null>(null);

  // Asignación rápida en vista cuadrantes o día
  const [selectedTurnoId, setSelectedTurnoId] = useState<number | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number>(0);

  // Turnos pertenecientes a la sede activa
  const sedeTurnos = useMemo(() => {
    return turnos.filter((t) => t.idCentro === activeSede.id);
  }, [turnos, activeSede.id]);

  // Turnos filtrados
  const turnosFiltrados = useMemo(() => {
    return sedeTurnos.filter((t) => {
      const matchTipo = filtroTipoTurno === 'TODOS' || t.tipo === filtroTipoTurno;
      const matchTrabajador =
        filtroTrabajadorId === 0 ||
        t.trabajadoresAsignados.some((w) => w.idTrabajador === filtroTrabajadorId);
      const personalCount = t.trabajadoresAsignados.length;
      const cumple = personalCount >= t.coberturaMinimaRequerida;
      const matchCobertura =
        filtroCobertura === 'TODOS' ||
        (filtroCobertura === 'COMPLETA' && cumple) ||
        (filtroCobertura === 'ALERTA' && !cumple);

      return matchTipo && matchTrabajador && matchCobertura;
    });
  }, [sedeTurnos, filtroTipoTurno, filtroTrabajadorId, filtroCobertura]);

  // Mapa de turnos por fecha YYYY-MM-DD
  const turnosPorFecha = useMemo(() => {
    const map: Record<string, TurnoAsignado[]> = {};
    for (const t of turnosFiltrados) {
      if (!map[t.fecha]) {
        map[t.fecha] = [];
      }
      map[t.fecha].push(t);
    }
    return map;
  }, [turnosFiltrados]);

  // Navegación de meses
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  // Fechas ordenadas para la vista Agenda
  const fechasConTurnosAgenda = useMemo(() => {
    return Object.keys(turnosPorFecha).sort();
  }, [turnosPorFecha]);

  // Navegación de la sub-vista Día
  const handlePrevDay = () => {
    const [y, m, d] = fechaDiaVista.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    const yStr = date.getFullYear();
    const mStr = String(date.getMonth() + 1).padStart(2, '0');
    const dStr = String(date.getDate()).padStart(2, '0');
    setFechaDiaVista(`${yStr}-${mStr}-${dStr}`);
  };

  const handleNextDay = () => {
    const [y, m, d] = fechaDiaVista.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    const yStr = date.getFullYear();
    const mStr = String(date.getMonth() + 1).padStart(2, '0');
    const dStr = String(date.getDate()).padStart(2, '0');
    setFechaDiaVista(`${yStr}-${mStr}-${dStr}`);
  };

  const handleGoToTodayDay = () => {
    setFechaDiaVista(new Date().toISOString().split('T')[0]);
  };

  // Formateo de fecha en español (ej: "Lunes, 22 de Septiembre de 2026")
  const formatearFechaLarga = (fechaStr: string) => {
    if (!fechaStr) return '';
    const partes = fechaStr.split('-');
    if (partes.length !== 3) return fechaStr;
    const d = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
    return d.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Control del hover popover para ver personas asignadas
  const handleTurnoMouseEnter = (e: React.MouseEvent, turno: TurnoAsignado) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const popoverWidth = 330;
    const popoverEstimatedHeight = 240;

    let left = rect.left;
    let top = rect.bottom + 8;

    if (left + popoverWidth > window.innerWidth - 16) {
      left = window.innerWidth - popoverWidth - 16;
    }
    if (top + popoverEstimatedHeight > window.innerHeight - 16) {
      top = Math.max(16, rect.top - popoverEstimatedHeight - 8);
    }

    setHoveredTurnoData({
      turno,
      top,
      left
    });
  };

  const handleTurnoMouseLeave = () => {
    setHoveredTurnoData(null);
  };

  // Construcción de la matriz de días para el calendario
  const calendarDays = useMemo(() => {
    const primerDiaMes = new Date(currentYear, currentMonth, 1);
    const ultimoDiaMes = new Date(currentYear, currentMonth + 1, 0);

    // En JS: 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    // Queremos que la semana inicie en Lunes (0 en nuestra matriz)
    let diaInicioSemana = primerDiaMes.getDay() - 1;
    if (diaInicioSemana === -1) diaInicioSemana = 6; // Domingo pasa a ser 6

    const totalDiasMes = ultimoDiaMes.getDate();

    // Días del mes anterior para rellenar
    const mesAnteriorUltimoDia = new Date(currentYear, currentMonth, 0).getDate();
    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    // Días previos
    for (let i = diaInicioSemana - 1; i >= 0; i--) {
      const d = mesAnteriorUltimoDia - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const mStr = String(prevMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${prevYear}-${mStr}-${dStr}`;

      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Días del mes actual
    const todayStr = new Date().toISOString().split('T')[0];
    for (let d = 1; d <= totalDiasMes; d++) {
      const mStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${mStr}-${dStr}`;

      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr
      });
    }

    // Días siguientes para completar múltiplos de 7 (hasta 35 o 42 celdas)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const mStr = String(nextMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${nextYear}-${mStr}-${dStr}`;

      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Manejo de asignación rápida en vista cuadrantes o modal
  const handleAsignar = async (turnoId: number) => {
    if (!selectedWorkerId) {
      alert('Seleccione un colaborador para asignar.');
      return;
    }
    await asignarTrabajadorATurno(turnoId, selectedWorkerId);
    setSelectedTurnoId(null);
    setSelectedWorkerId(0);
  };

  // Abrir modal con fecha preseleccionada
  const handleProgramarEnFecha = (fecha: string) => {
    setTurnoModalFechaInicial(fecha);
    setIsProgramarTurnosOpen(true);
  };

  // Color de badge de turno
  const getBadgeStyle = (tipo: TurnoAsignado['tipo']) => {
    switch (tipo) {
      case 'Mañana':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Tarde':
        return 'bg-sky-100 text-sky-900 border-sky-300';
      case 'Noche':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case '24 Horas':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Principal con Controles y Acciones */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#DEDBD1] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase font-bold text-[#B3803F] tracking-wider">
              Recursos Asistenciales & Cuadrantes
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#182F28] mt-0.5">
            Turnos & Control de Cobertura
          </h2>
          <p className="text-xs text-[#5C6058] mt-1 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#B3803F]" />
            <span>Sede actual: <strong>{activeSede.nombre}</strong> ({activeSede.ciudad})</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de Vista: Calendario vs Cuadrantes */}
          <div className="flex items-center bg-[#F7F6F2] p-1 rounded-2xl border border-[#DEDBD1]">
            <button
              type="button"
              onClick={() => setModoVista('calendario')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                modoVista === 'calendario'
                  ? 'bg-[#274A3F] text-white shadow-xs'
                  : 'text-[#5C6058] hover:text-[#182F28]'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Vista Calendario</span>
            </button>

            <button
              type="button"
              onClick={() => setModoVista('cuadrantes')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                modoVista === 'cuadrantes'
                  ? 'bg-[#274A3F] text-white shadow-xs'
                  : 'text-[#5C6058] hover:text-[#182F28]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Vista Tarjetas ({sedeTurnos.length})</span>
            </button>
          </div>

          {/* Botón Principal: Programar por Rango */}
          <button
            type="button"
            onClick={() => {
              setTurnoModalFechaInicial(undefined);
              setIsProgramarTurnosOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white font-bold rounded-2xl text-xs shadow-xs transition-all cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Programar Turnos por Rango</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#DEDBD1]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#182F28]">
            <Filter className="w-3.5 h-3.5 text-[#B3803F]" />
            <span>FILTROS:</span>
          </div>

          {/* Filtro por Tipo */}
          <select
            value={filtroTipoTurno}
            onChange={(e) => setFiltroTipoTurno(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
          >
            <option value="TODOS">Todos los Tipos de Turno</option>
            <option value="Mañana">Mañana (07:00 - 15:00)</option>
            <option value="Tarde">Tarde (14:00 - 22:00)</option>
            <option value="Noche">Noche (21:00 - 07:00)</option>
            <option value="24 Horas">24 Horas / Guardia</option>
          </select>

          {/* Filtro por Colaborador */}
          <select
            value={filtroTrabajadorId}
            onChange={(e) => setFiltroTrabajadorId(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none max-w-xs truncate"
          >
            <option value={0}>Todos los Colaboradores</option>
            {trabajadores
              .filter((t) => t.estado === 'Activo')
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombreCompleto} ({t.cargo})
                </option>
              ))}
          </select>

          {/* Filtro por Cobertura */}
          <select
            value={filtroCobertura}
            onChange={(e) => setFiltroCobertura(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
          >
            <option value="TODOS">Todas las Coberturas</option>
            <option value="COMPLETA">✓ Cobertura Cumplida</option>
            <option value="ALERTA">⚠️ Alerta Cobertura Deficitaria</option>
          </select>
        </div>

        <div className="text-xs text-[#5C6058] font-mono">
          Mostrando <strong>{turnosFiltrados.length}</strong> turno(s) programado(s)
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODO 1: VISTA CALENDARIO (MES / DÍA / AGENDA) */}
      {/* ============================================================== */}
      {modoVista === 'calendario' && (
        <div className="space-y-4">
          {/* Sub-barra de Vistas del Calendario */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-[#DEDBD1]">
            <div className="flex items-center bg-[#F7F6F2] p-1 rounded-xl border border-[#DEDBD1] gap-1">
              <button
                type="button"
                onClick={() => setSubVistaCalendario('mes')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  subVistaCalendario === 'mes'
                    ? 'bg-[#274A3F] text-white shadow-xs'
                    : 'text-[#5C6058] hover:text-[#182F28]'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Mes</span>
              </button>

              <button
                type="button"
                onClick={() => setSubVistaCalendario('dia')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  subVistaCalendario === 'dia'
                    ? 'bg-[#274A3F] text-white shadow-xs'
                    : 'text-[#5C6058] hover:text-[#182F28]'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Día</span>
              </button>

              <button
                type="button"
                onClick={() => setSubVistaCalendario('agenda')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  subVistaCalendario === 'agenda'
                    ? 'bg-[#274A3F] text-white shadow-xs'
                    : 'text-[#5C6058] hover:text-[#182F28]'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>Agenda</span>
              </button>
            </div>

            <div className="text-xs text-[#5C6058]">
              {subVistaCalendario === 'mes' && (
                <span>Ubica el ratón sobre un turno para ver los colaboradores asignados.</span>
              )}
              {subVistaCalendario === 'dia' && (
                <span>Gestión detallada de cuadrante y colaboradores para el día seleccionado.</span>
              )}
              {subVistaCalendario === 'agenda' && (
                <span>Relación cronológica ordenada de todos los turnos asistenciales.</span>
              )}
            </div>
          </div>

          {/* SUB-VISTA 1: MES */}
          {subVistaCalendario === 'mes' && (
            <div className="bg-white rounded-3xl border border-[#DEDBD1] shadow-xs overflow-hidden">
              {/* Cabecera del Mes & Navegación */}
              <div className="p-5 border-b border-[#DEDBD1] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF9F5]">
                <div className="flex items-center gap-3">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#182F28] capitalize">
                    {NOMBRES_MESES[currentMonth]} {currentYear}
                  </h3>
                  <button
                    type="button"
                    onClick={handleGoToToday}
                    className="px-2.5 py-1 text-xs font-bold text-[#274A3F] bg-white border border-[#DEDBD1] rounded-lg hover:bg-[#274A3F] hover:text-white transition-colors cursor-pointer"
                  >
                    Hoy
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-2 rounded-xl border border-[#DEDBD1] bg-white text-[#182F28] hover:bg-[#F7F6F2] transition-colors cursor-pointer"
                    title="Mes anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-2 rounded-xl border border-[#DEDBD1] bg-white text-[#182F28] hover:bg-[#F7F6F2] transition-colors cursor-pointer"
                    title="Mes siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Días de la Semana (Headers) */}
              <div className="grid grid-cols-7 border-b border-[#DEDBD1] bg-[#F7F6F2] text-center text-xs font-mono font-bold text-[#7A745F] py-2.5">
                {DIAS_SEMANA_HEADERS.map((dia) => (
                  <div key={dia} className="uppercase tracking-wider">
                    {dia}
                  </div>
                ))}
              </div>

              {/* Matriz del Calendario */}
              <div className="grid grid-cols-7 divide-x divide-y divide-[#DEDBD1] bg-white">
                {calendarDays.map((dia, idx) => {
                  const turnosDelDia = turnosPorFecha[dia.dateStr] || [];
                  const tieneTurnos = turnosDelDia.length > 0;
                  const hayAlertaCobertura = turnosDelDia.some(
                    (t) => t.trabajadoresAsignados.length < t.coberturaMinimaRequerida
                  );

                  return (
                    <div
                      key={idx}
                      onClick={() => setDiaSeleccionadoStr(dia.dateStr)}
                      className={`min-h-[125px] p-2 flex flex-col justify-between transition-colors cursor-pointer group relative ${
                        dia.isCurrentMonth ? 'bg-white hover:bg-[#FEFBF6]' : 'bg-[#FAFAFA] text-[#A39E93]'
                      } ${dia.isToday ? 'ring-2 ring-inset ring-[#B3803F]' : ''}`}
                    >
                      {/* Número del día y acciones rápidas */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                            dia.isToday
                              ? 'bg-[#B3803F] text-white'
                              : dia.isCurrentMonth
                              ? 'text-[#182F28]'
                              : 'text-[#CFC9B8]'
                          }`}
                        >
                          {dia.dayNumber}
                        </span>

                        <div className="flex items-center gap-1">
                          {hayAlertaCobertura && (
                            <span
                              title="Alerta de cobertura deficitaria en este día"
                              className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                            />
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProgramarEnFecha(dia.dateStr);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#274A3F] hover:text-white text-[#7A745F] rounded-md transition-all cursor-pointer"
                            title="Programar turnos en esta fecha"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Badges de Turnos del Día */}
                      <div className="space-y-1 overflow-y-auto flex-1 max-h-[85px]">
                        {turnosDelDia.map((t) => {
                          const totalWorkers = t.trabajadoresAsignados.length;
                          const cumple = totalWorkers >= t.coberturaMinimaRequerida;

                          return (
                            <div
                              key={t.id}
                              onMouseEnter={(e) => handleTurnoMouseEnter(e, t)}
                              onMouseLeave={handleTurnoMouseLeave}
                              className={`px-1.5 py-1 rounded-lg border text-[10px] leading-tight flex items-center justify-between transition-transform hover:scale-[1.02] shadow-2xs cursor-pointer ${getBadgeStyle(
                                t.tipo
                              )}`}
                            >
                              <div className="truncate font-semibold flex items-center gap-1">
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{
                                    backgroundColor: cumple ? '#1E7A4C' : '#D97706'
                                  }}
                                />
                                <span className="truncate">{t.tipo}</span>
                              </div>

                              <span className="font-mono text-[9px] font-bold shrink-0 ml-1">
                                {totalWorkers}/{t.coberturaMinimaRequerida}
                              </span>
                            </div>
                          );
                        })}

                        {!tieneTurnos && dia.isCurrentMonth && (
                          <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 text-[10px] text-[#A39E93]">
                            + Programar
                          </div>
                        )}
                      </div>

                      {/* Resumen inferior de cuidadores si hay turnos */}
                      {tieneTurnos && (
                        <div className="pt-1 mt-1 border-t border-[#DEDBD1]/40 flex items-center justify-between text-[10px] text-[#7A745F]">
                          <span className="flex items-center gap-1 font-mono">
                            <Users className="w-2.5 h-2.5 text-[#B3803F]" />
                            <span>
                              {turnosDelDia.reduce((acc, t) => acc + t.trabajadoresAsignados.length, 0)}
                            </span>
                          </span>

                          <span className="text-[9px] text-[#274A3F] font-bold">
                            {turnosDelDia.length} turno(s)
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUB-VISTA 2: DÍA */}
          {subVistaCalendario === 'dia' && (
            <div className="bg-white rounded-3xl border border-[#DEDBD1] shadow-xs overflow-hidden">
              {/* Cabecera del Día */}
              <div className="p-5 border-b border-[#DEDBD1] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF9F5]">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={handlePrevDay}
                    className="p-2 rounded-xl border border-[#DEDBD1] bg-white text-[#182F28] hover:bg-[#F7F6F2] transition-colors cursor-pointer"
                    title="Día anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-[#B3803F] tracking-wider">
                      Cuadrante Asistencial Diario
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#182F28] capitalize">
                      {formatearFechaLarga(fechaDiaVista)}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextDay}
                    className="p-2 rounded-xl border border-[#DEDBD1] bg-white text-[#182F28] hover:bg-[#F7F6F2] transition-colors cursor-pointer"
                    title="Día siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleGoToTodayDay}
                    className="px-2.5 py-1 text-xs font-bold text-[#274A3F] bg-white border border-[#DEDBD1] rounded-lg hover:bg-[#274A3F] hover:text-white transition-colors cursor-pointer ml-1"
                  >
                    Hoy
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="date"
                    value={fechaDiaVista}
                    onChange={(e) => e.target.value && setFechaDiaVista(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-[#DEDBD1] bg-white text-xs font-bold text-[#182F28] focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => handleProgramarEnFecha(fechaDiaVista)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#274A3F] hover:bg-[#182F28] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-[#DCB87F]" />
                    <span>Programar en Este Día</span>
                  </button>
                </div>
              </div>

              {/* Contenido del Día */}
              <div className="p-6">
                {turnosPorFecha[fechaDiaVista] && turnosPorFecha[fechaDiaVista].length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {turnosPorFecha[fechaDiaVista].map((turno) => {
                      const personalCount = turno.trabajadoresAsignados.length;
                      const cumple = personalCount >= turno.coberturaMinimaRequerida;

                      return (
                        <div
                          key={turno.id}
                          className="p-5 bg-white rounded-2xl border border-[#DEDBD1] space-y-4 shadow-2xs"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${getBadgeStyle(turno.tipo)}`}>
                                  {turno.tipo}
                                </span>
                                <h4 className="font-serif font-bold text-base text-[#182F28]">
                                  {turno.nombre}
                                </h4>
                              </div>
                              <div className="text-xs text-[#075158] font-bold mt-1.5 flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{turno.horario}</span>
                                {turno.area && <span className="text-[#7A745F] font-normal">• {turno.area}</span>}
                              </div>
                            </div>

                            <span
                              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                                cumple
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {personalCount} / Mín. {turno.coberturaMinimaRequerida}
                            </span>
                          </div>

                          {turno.observaciones && (
                            <p className="text-xs text-[#5C6058] italic bg-[#FEFBF6] p-2 rounded-lg border border-[#DEDBD1]/60">
                              "{turno.observaciones}"
                            </p>
                          )}

                          {/* Lista de Colaboradores Asignados en este turno */}
                          <div className="space-y-2 pt-2 border-t border-[#DEDBD1]">
                            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#7A745F]">
                              <span>PERSONAS ASIGNADAS ({personalCount}):</span>
                            </div>

                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {turno.trabajadoresAsignados.map((worker) => {
                                const master = trabajadores.find((t) => t.id === worker.idTrabajador);
                                const nombre = master?.nombreCompleto || worker.nombre;
                                const cargo = master?.cargo || worker.cargo;
                                const area = master?.area || worker.area;
                                const avatar = master?.avatarUrl || worker.avatarUrl;

                                return (
                                  <div
                                    key={worker.idTrabajador}
                                    className="p-2.5 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <img
                                        src={resolverAvatarUrl(avatar)}
                                        alt={nombre}
                                        onError={(e) => {
                                          e.currentTarget.onerror = null;
                                          e.currentTarget.src = DEFAULT_AVATAR;
                                        }}
                                        className="w-8 h-8 rounded-full object-cover border border-[#DEDBD1]"
                                      />
                                      <div>
                                        <div className="text-xs font-bold text-[#182F28]">{nombre}</div>
                                        <div className="text-[11px] text-[#5C6058]">{cargo} • {area}</div>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => desasignarTrabajadorDeTurno(turno.id, worker.idTrabajador)}
                                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Quitar de este turno"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                );
                              })}

                              {personalCount === 0 && (
                                <div className="p-4 text-center text-xs text-[#9A5B12] bg-[#FEF7EE] rounded-xl border border-dashed border-[#DCB87F]">
                                  ⚠️ Sin personal asignado para este turno.
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Asignación rápida de personal */}
                          <div className="pt-2 border-t border-[#DEDBD1]/60">
                            {selectedTurnoId === turno.id ? (
                              <div className="space-y-2 p-3 bg-[#F7F6F2] rounded-xl border border-[#B3803F]">
                                <label className="block text-xs font-bold text-[#182F28]">
                                  Seleccionar colaborador activo:
                                </label>
                                <select
                                  value={selectedWorkerId}
                                  onChange={(e) => setSelectedWorkerId(Number(e.target.value))}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#DEDBD1] bg-white text-xs focus:outline-none"
                                >
                                  <option value={0}>Seleccionar colaborador...</option>
                                  {trabajadores
                                    .filter(
                                      (t) =>
                                        t.estado === 'Activo' &&
                                        !turno.trabajadoresAsignados.some((w) => w.idTrabajador === t.id)
                                    )
                                    .map((t) => (
                                      <option key={t.id} value={t.id}>
                                        {t.nombreCompleto} ({t.cargo} - {t.area})
                                      </option>
                                    ))}
                                </select>

                                <div className="flex items-center justify-end gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedTurnoId(null)}
                                    className="px-2.5 py-1 text-xs text-[#5C6058] hover:bg-white rounded-lg cursor-pointer"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAsignar(turno.id)}
                                    className="px-3 py-1 bg-[#274A3F] hover:bg-[#182F28] text-white font-bold rounded-lg text-xs cursor-pointer"
                                  >
                                    Confirmar Asignación
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTurnoId(turno.id);
                                  setSelectedWorkerId(0);
                                }}
                                className="w-full py-2 px-3 bg-[#F7F6F2] hover:bg-[#ECE7DB] text-[#182F28] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#DEDBD1]"
                              >
                                <UserPlus className="w-3.5 h-3.5 text-[#B3803F]" />
                                <span>Asignar Colaborador Adicional</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center bg-[#FAF9F5] rounded-3xl border border-dashed border-[#DEDBD1] space-y-4 max-w-lg mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-[#D9F0F1] text-[#075158] mx-auto flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-lg text-[#182F28]">
                        Sin Turnos Programados para Este Día
                      </h4>
                      <p className="text-xs text-[#7A745F] mt-1">
                        No hay turnos registrados en la sede para el {formatearFechaLarga(fechaDiaVista)}.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleProgramarEnFecha(fechaDiaVista)}
                      className="px-4 py-2 bg-[#274A3F] text-white font-bold text-xs rounded-xl hover:bg-[#182F28] cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-[#DCB87F]" />
                      <span>Programar Turno en Este Día</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-VISTA 3: AGENDA */}
          {subVistaCalendario === 'agenda' && (
            <div className="space-y-6">
              {fechasConTurnosAgenda.length > 0 ? (
                fechasConTurnosAgenda.map((fecha) => {
                  const turnosFecha = turnosPorFecha[fecha] || [];
                  const totalAsistentes = turnosFecha.reduce(
                    (acc, t) => acc + t.trabajadoresAsignados.length,
                    0
                  );
                  const hayAlerta = turnosFecha.some(
                    (t) => t.trabajadoresAsignados.length < t.coberturaMinimaRequerida
                  );

                  return (
                    <div
                      key={fecha}
                      className="bg-white rounded-3xl border border-[#DEDBD1] shadow-xs overflow-hidden"
                    >
                      {/* Header de la Fecha */}
                      <div className="p-4 sm:p-5 bg-[#FAF9F5] border-b border-[#DEDBD1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#274A3F] text-white flex flex-col items-center justify-center shrink-0">
                            <span className="text-[11px] uppercase font-mono font-bold leading-none">
                              {fecha.split('-')[2]}
                            </span>
                            <span className="text-[8px] font-bold text-[#DCB87F] uppercase mt-0.5">
                              {NOMBRES_MESES[Number(fecha.split('-')[1]) - 1]?.slice(0, 3)}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-serif font-bold text-base sm:text-lg text-[#182F28] capitalize">
                              {formatearFechaLarga(fecha)}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-[#5C6058] mt-0.5 font-mono">
                              <span>{turnosFecha.length} turno(s)</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-[#B3803F]" />
                                {totalAsistentes} personas asignadas
                              </span>
                              {hayAlerta && (
                                <span className="text-amber-700 font-bold flex items-center gap-1">
                                  • ⚠️ Cobertura pendiente
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setFechaDiaVista(fecha);
                              setSubVistaCalendario('dia');
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-[#274A3F] bg-white border border-[#DEDBD1] rounded-xl hover:bg-[#274A3F] hover:text-white transition-colors cursor-pointer"
                          >
                            Ver en Día
                          </button>

                          <button
                            type="button"
                            onClick={() => handleProgramarEnFecha(fecha)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-[#B3803F] hover:bg-[#9a6c32] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" />
                            <span>+ Turno</span>
                          </button>
                        </div>
                      </div>

                      {/* Listado de Turnos en esa Fecha */}
                      <div className="p-4 sm:p-5 divide-y divide-[#DEDBD1]">
                        {turnosFecha.map((turno) => {
                          const totalWorkers = turno.trabajadoresAsignados.length;
                          const cumple = totalWorkers >= turno.coberturaMinimaRequerida;

                          return (
                            <div
                              key={turno.id}
                              className="py-4 first:pt-0 last:pb-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                            >
                              <div className="space-y-1 lg:max-w-xs">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getBadgeStyle(turno.tipo)}`}>
                                    {turno.tipo}
                                  </span>
                                  <h5 className="font-serif font-bold text-sm text-[#182F28]">
                                    {turno.nombre}
                                  </h5>
                                </div>
                                <div className="text-xs text-[#075158] font-bold flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{turno.horario}</span>
                                  {turno.area && (
                                    <span className="text-[#7A745F] font-normal">• {turno.area}</span>
                                  )}
                                </div>
                                <span
                                  className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-md mt-1 ${
                                    cumple
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : 'bg-amber-50 text-amber-800 border border-amber-300'
                                  }`}
                                >
                                  Cobertura: {totalWorkers} / Mín. {turno.coberturaMinimaRequerida}
                                </span>
                              </div>

                              {/* Personas Asignadas */}
                              <div className="flex-1">
                                <div className="text-[10px] font-mono font-bold text-[#7A745F] uppercase mb-1.5">
                                  Personas Asignadas ({totalWorkers}):
                                </div>

                                {totalWorkers > 0 ? (
                                  <div className="flex flex-wrap items-center gap-2">
                                    {turno.trabajadoresAsignados.map((worker) => {
                                      const master = trabajadores.find((t) => t.id === worker.idTrabajador);
                                      const nombre = master?.nombreCompleto || worker.nombre;
                                      const cargo = master?.cargo || worker.cargo;
                                      const area = master?.area || worker.area;
                                      const avatar = master?.avatarUrl || worker.avatarUrl;

                                      return (
                                        <div
                                          key={worker.idTrabajador}
                                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#F7F6F2] border border-[#DEDBD1]"
                                        >
                                          <img
                                            src={resolverAvatarUrl(avatar)}
                                            alt={nombre}
                                            onError={(e) => {
                                              e.currentTarget.onerror = null;
                                              e.currentTarget.src = DEFAULT_AVATAR;
                                            }}
                                            className="w-6 h-6 rounded-full object-cover border border-[#DEDBD1]"
                                          />
                                          <div className="text-left">
                                            <div className="text-xs font-bold text-[#182F28] leading-tight">
                                              {nombre}
                                            </div>
                                            <div className="text-[10px] text-[#5C6058] leading-tight">
                                              {cargo} {area ? `• ${area}` : ''}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-xs text-[#9A5B12] bg-[#FEF7EE] px-3 py-2 rounded-xl border border-dashed border-[#DCB87F] inline-block">
                                    ⚠️ Sin colaboradores asignados para este turno
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center bg-white rounded-3xl border border-[#DEDBD1] space-y-3 max-w-lg mx-auto shadow-xs">
                  <Clock className="w-10 h-10 text-[#A39E93] mx-auto" />
                  <h4 className="font-serif font-bold text-lg text-[#182F28]">
                    Sin Turnos en la Agenda
                  </h4>
                  <p className="text-xs text-[#7A745F]">
                    No hay turnos que coincidan con los filtros de búsqueda actuales.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODO 2: VISTA TARJETAS / CUADRANTES */}
      {/* ============================================================== */}
      {modoVista === 'cuadrantes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {turnosFiltrados.map((turno) => {
            const personalCount = turno.trabajadoresAsignados.length;
            const cumpleCobertura = personalCount >= turno.coberturaMinimaRequerida;

            return (
              <div
                key={turno.id}
                className={`admin-card p-6 space-y-4 border-t-4 transition-all hover:shadow-md ${
                  turno.estado === 'Activo'
                    ? 'border-t-[#1E7A4C]'
                    : cumpleCobertura
                    ? 'border-t-[#274A3F]'
                    : 'border-t-[#B3803F]'
                }`}
              >
                {/* Cabecera Turno */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono uppercase font-bold text-[#7A745F]">
                      {turno.tipo} • {turno.area || 'Asistencial'}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-[#182F28]">
                      {turno.nombre}
                    </h3>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      turno.estado === 'Activo'
                        ? 'bg-[#DFF3E7] text-[#1E7A4C]'
                        : cumpleCobertura
                        ? 'bg-[#F7F6F2] text-[#274A3F] border border-[#DEDBD1]'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {cumpleCobertura ? turno.estado : 'Alerta Cobertura'}
                  </span>
                </div>

                {/* Franja Horaria y Fecha */}
                <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#075158] font-bold">
                    <Clock className="w-4 h-4" />
                    <span>{turno.horario}</span>
                  </div>
                  <span className="text-[#5C6058] font-mono flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#B3803F]" />
                    <span>{turno.fecha}</span>
                  </span>
                </div>

                {/* Observaciones si las hay */}
                {turno.observaciones && (
                  <p className="text-xs text-[#5C6058] italic bg-[#FEFBF6] p-2 rounded-lg border border-[#DEDBD1]/60">
                    "{turno.observaciones}"
                  </p>
                )}

                {/* Alerta de Cobertura */}
                {!cumpleCobertura && (
                  <div className="p-3 bg-[#FEF7EE] rounded-xl border border-[#DCB87F] flex items-center gap-2 text-xs text-[#9A5B12] font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      Faltan {turno.coberturaMinimaRequerida - personalCount} persona(s) para la cobertura mínima requerida.
                    </span>
                  </div>
                )}

                {/* Lista de Personal Asignado */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#7A745F] font-mono">
                    <span>PERSONAL ASIGNADO</span>
                    <span className="font-bold text-[#182F28]">
                      {personalCount} / Mín. {turno.coberturaMinimaRequerida}
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {turno.trabajadoresAsignados.map((worker) => {
                      const master = trabajadores.find((t) => t.id === worker.idTrabajador);
                      const nombre = master?.nombreCompleto || worker.nombre;
                      const cargo = master?.cargo || worker.cargo;
                      const area = master?.area || worker.area;
                      const avatar = master?.avatarUrl || worker.avatarUrl;

                      return (
                        <div
                          key={worker.idTrabajador}
                          className="p-2.5 bg-white rounded-xl border border-[#DEDBD1] flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={resolverAvatarUrl(avatar)}
                              alt={nombre}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = DEFAULT_AVATAR;
                              }}
                              className="w-8 h-8 rounded-full object-cover border border-[#DEDBD1]"
                            />
                            <div>
                              <div className="text-xs font-bold text-[#182F28]">{nombre}</div>
                              <div className="text-[11px] text-[#5C6058]">{cargo}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F7F6F2] text-[#274A3F]">
                              {area}
                            </span>
                            <button
                              type="button"
                              onClick={() => desasignarTrabajadorDeTurno(turno.id, worker.idTrabajador)}
                              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Desasignar de este turno"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {personalCount === 0 && (
                      <div className="p-4 text-center text-xs text-[#7A745F] bg-[#F7F6F2] rounded-xl border border-dashed border-[#DEDBD1]">
                        Sin colaboradores asignados aún para esta fecha.
                      </div>
                    )}
                  </div>
                </div>

                {/* Asignar Personal Adicional */}
                <div className="pt-3 border-t border-[#DEDBD1]/60">
                  {selectedTurnoId === turno.id ? (
                    <div className="space-y-2 p-3 bg-[#F7F6F2] rounded-xl border border-[#B3803F]">
                      <label className="block text-xs font-bold text-[#182F28]">
                        Seleccione colaborador activo:
                      </label>
                      <select
                        value={selectedWorkerId}
                        onChange={(e) => setSelectedWorkerId(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#DEDBD1] bg-white text-xs focus:outline-none"
                      >
                        <option value={0}>Seleccionar colaborador...</option>
                        {trabajadores
                          .filter(
                            (t) =>
                              t.estado === 'Activo' &&
                              !turno.trabajadoresAsignados.some((w) => w.idTrabajador === t.id)
                          )
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.nombreCompleto} ({t.cargo} - {t.area})
                            </option>
                          ))}
                      </select>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedTurnoId(null)}
                          className="px-2.5 py-1 text-xs text-[#5C6058] hover:bg-white rounded-lg cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAsignar(turno.id)}
                          className="px-3 py-1 bg-[#274A3F] hover:bg-[#182F28] text-white font-bold rounded-lg text-xs cursor-pointer"
                        >
                          Confirmar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTurnoId(turno.id);
                        setSelectedWorkerId(0);
                      }}
                      className="w-full py-2 px-3 bg-[#F7F6F2] hover:bg-[#ECE7DB] text-[#182F28] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#DEDBD1]"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#B3803F]" />
                      <span>Asignar Colaborador al Turno</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {turnosFiltrados.length === 0 && (
            <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-[#DEDBD1] space-y-4 max-w-xl mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#D9F0F1] text-[#075158] mx-auto flex items-center justify-center">
                <Clock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-lg text-[#182F28]">
                  Sin Turnos con los Filtros Seleccionados
                </h4>
                <p className="text-xs text-[#7A745F] max-w-md mx-auto leading-relaxed">
                  No se registran cuadrantes asistenciales que coincidan con los filtros aplicados.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFiltroTipoTurno('TODOS');
                  setFiltroTrabajadorId(0);
                  setFiltroCobertura('TODOS');
                }}
                className="px-4 py-2 bg-[#F7F6F2] text-[#182F28] font-bold text-xs rounded-xl hover:bg-[#ECE7DB] cursor-pointer"
              >
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL / DRAWER DE INSPECCIÓN DE DÍA SELECCIONADO EN CALENDARIO */}
      {/* ============================================================== */}
      {diaSeleccionadoStr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header del Día */}
            <div className="p-6 bg-[#182F28] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#274A3F] flex items-center justify-center text-[#DCB87F] border border-[#DCB87F]/30">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    Cuadrante del Día: {diaSeleccionadoStr}
                  </h3>
                  <p className="text-xs text-[#DCB87F]">
                    {activeSede.nombre} • Personal asignado y cobertura de guardia
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDiaSeleccionadoStr(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#CFC9B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido del Día */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Botón rápido para programar en esta fecha */}
              <div className="flex items-center justify-between p-3.5 bg-[#FEF7EE] rounded-2xl border border-[#DCB87F]">
                <div className="text-xs text-[#9A5B12]">
                  <strong>¿Desea agregar un turno a esta fecha?</strong>
                  <div className="text-[11px] text-[#5C6058] mt-0.5">
                    Se abrirá el programador con la fecha {diaSeleccionadoStr} pre-seleccionada.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFechaDiaVista(diaSeleccionadoStr);
                      setSubVistaCalendario('dia');
                      setDiaSeleccionadoStr(null);
                    }}
                    className="px-3.5 py-1.5 bg-white hover:bg-[#F7F6F2] text-[#182F28] font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-[#DEDBD1] transition-colors"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-[#B3803F]" />
                    <span>Ver en Vista Día</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleProgramarEnFecha(diaSeleccionadoStr);
                      setDiaSeleccionadoStr(null);
                    }}
                    className="px-3.5 py-1.5 bg-[#274A3F] hover:bg-[#182F28] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-[#DCB87F]" />
                    <span>Programar Turno</span>
                  </button>
                </div>
              </div>

              {/* Lista de Turnos de esa fecha */}
              {turnosPorFecha[diaSeleccionadoStr] && turnosPorFecha[diaSeleccionadoStr].length > 0 ? (
                <div className="space-y-4">
                  {turnosPorFecha[diaSeleccionadoStr].map((turno) => {
                    const personalCount = turno.trabajadoresAsignados.length;
                    const cumple = personalCount >= turno.coberturaMinimaRequerida;

                    return (
                      <div
                        key={turno.id}
                        className="p-4 bg-white rounded-2xl border border-[#DEDBD1] space-y-3 shadow-2xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getBadgeStyle(turno.tipo)}`}>
                                {turno.tipo}
                              </span>
                              <span className="text-xs font-bold text-[#182F28]">
                                {turno.nombre}
                              </span>
                            </div>
                            <div className="text-xs text-[#075158] font-bold mt-1 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{turno.horario}</span>
                              {turno.area && (
                                <span className="text-[#7A745F] font-normal">• {turno.area}</span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                cumple
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {personalCount} / Mín. {turno.coberturaMinimaRequerida}
                            </span>
                          </div>
                        </div>

                        {/* Lista de personal asignado */}
                        <div className="space-y-1.5 pt-2 border-t border-[#DEDBD1]">
                          <div className="text-[10px] font-mono font-bold text-[#7A745F] uppercase">
                            Colaboradores en turno ({personalCount}):
                          </div>

                          {turno.trabajadoresAsignados.map((worker) => {
                            const master = trabajadores.find((t) => t.id === worker.idTrabajador);
                            const nombre = master?.nombreCompleto || worker.nombre;
                            const cargo = master?.cargo || worker.cargo;
                            const avatar = master?.avatarUrl || worker.avatarUrl;

                            return (
                              <div
                                key={worker.idTrabajador}
                                className="p-2 bg-[#F7F6F2] rounded-xl flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <img
                                    src={resolverAvatarUrl(avatar)}
                                    alt={nombre}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = DEFAULT_AVATAR;
                                    }}
                                    className="w-7 h-7 rounded-full object-cover border border-[#DEDBD1]"
                                  />
                                  <div>
                                    <div className="text-xs font-bold text-[#182F28]">{nombre}</div>
                                    <div className="text-[10px] text-[#5C6058]">{cargo}</div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => desasignarTrabajadorDeTurno(turno.id, worker.idTrabajador)}
                                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Quitar colaborador"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}

                          {personalCount === 0 && (
                            <div className="p-3 text-center text-xs text-[#7A745F]">
                              No hay cuidadores asignados a este turno.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-[#F7F6F2] rounded-2xl border border-dashed border-[#DEDBD1] space-y-2">
                  <Clock className="w-8 h-8 text-[#A39E93] mx-auto" />
                  <div className="text-xs font-bold text-[#182F28]">
                    No hay turnos programados para el {diaSeleccionadoStr}
                  </div>
                  <p className="text-[11px] text-[#7A745F]">
                    Puede programar una franja horaria individual o masiva para esta fecha.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Modal de Inspección */}
            <div className="p-4 bg-[#F7F6F2] border-t border-[#DEDBD1] flex justify-end">
              <button
                type="button"
                onClick={() => setDiaSeleccionadoStr(null)}
                className="px-4 py-2 bg-[#274A3F] text-white font-bold text-xs rounded-xl hover:bg-[#182F28] cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* POPOVER FLOTANTE EN HOVER: PERSONAS ASIGNADAS AL TURNO */}
      {/* ============================================================== */}
      {hoveredTurnoData && (
        <div
          style={{
            position: 'fixed',
            top: hoveredTurnoData.top,
            left: hoveredTurnoData.left,
            zIndex: 9999
          }}
          className="w-80 bg-white rounded-2xl border border-[#DEDBD1] shadow-2xl p-4 space-y-3 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Cabecera del Turno */}
          <div className="border-b border-[#DEDBD1]/60 pb-2">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getBadgeStyle(
                  hoveredTurnoData.turno.tipo
                )}`}
              >
                {hoveredTurnoData.turno.tipo}
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                  hoveredTurnoData.turno.trabajadoresAsignados.length >=
                  hoveredTurnoData.turno.coberturaMinimaRequerida
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {hoveredTurnoData.turno.trabajadoresAsignados.length} / Mín.{' '}
                {hoveredTurnoData.turno.coberturaMinimaRequerida}
              </span>
            </div>

            <h5 className="font-serif font-bold text-sm text-[#182F28] mt-1.5 leading-snug">
              {hoveredTurnoData.turno.nombre}
            </h5>

            <div className="text-[11px] text-[#075158] font-bold mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{hoveredTurnoData.turno.horario}</span>
              {hoveredTurnoData.turno.area && (
                <span className="text-[#7A745F] font-normal">• {hoveredTurnoData.turno.area}</span>
              )}
            </div>
          </div>

          {/* Lista de Personas Asignadas */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono font-bold text-[#7A745F] uppercase flex items-center gap-1">
              <Users className="w-3 h-3 text-[#B3803F]" />
              <span>
                Personas Asignadas ({hoveredTurnoData.turno.trabajadoresAsignados.length}):
              </span>
            </div>

            {hoveredTurnoData.turno.trabajadoresAsignados.length > 0 ? (
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {hoveredTurnoData.turno.trabajadoresAsignados.map((worker) => {
                  const master = trabajadores.find((t) => t.id === worker.idTrabajador);
                  const nombre = master?.nombreCompleto || worker.nombre;
                  const cargo = master?.cargo || worker.cargo;
                  const area = master?.area || worker.area;
                  const avatar = master?.avatarUrl || worker.avatarUrl;

                  return (
                    <div
                      key={worker.idTrabajador}
                      className="flex items-center gap-2.5 p-1.5 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1]"
                    >
                      <img
                        src={resolverAvatarUrl(avatar)}
                        alt={nombre}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_AVATAR;
                        }}
                        className="w-7 h-7 rounded-full object-cover border border-[#DEDBD1] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#182F28] truncate">{nombre}</div>
                        <div className="text-[10px] text-[#5C6058] truncate">
                          {cargo} {area ? `• ${area}` : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-2.5 bg-[#FEF7EE] rounded-xl border border-dashed border-[#DCB87F] text-[11px] text-[#9A5B12] text-center font-medium">
                ⚠️ Sin colaboradores asignados a este turno
              </div>
            )}
          </div>

          <div className="text-[10px] text-[#7A745F] text-center pt-1 border-t border-[#DEDBD1]/40">
            💡 Clic en el día para ver opciones completas
          </div>
        </div>
      )}
    </div>
  );
};
