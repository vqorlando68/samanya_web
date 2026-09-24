import React, { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  CalendarPlus,
  X,
  Clock,
  Users,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Search,
  Sparkles,
  ShieldCheck,
  Check,
  Building
} from 'lucide-react';
import { resolverAvatarUrl, DEFAULT_AVATAR } from '../../utils/avatarUtils';

const PLANTILLAS_PREDEFINIDAS = [
  {
    tipo: 'Mañana' as const,
    nombre: 'Turno Mañana (Asistencial & Cuidados)',
    horario: '07:00 - 15:00',
    coberturaMinima: 3,
    idTurnoPlantilla: 301,
    color: 'border-amber-400 bg-amber-50/50 text-amber-900',
    activeColor: 'ring-2 ring-[#B3803F] bg-amber-100/60'
  },
  {
    tipo: 'Tarde' as const,
    nombre: 'Turno Tarde (Acompañamiento & Medicación)',
    horario: '14:00 - 22:00',
    coberturaMinima: 2,
    idTurnoPlantilla: 302,
    color: 'border-sky-400 bg-sky-50/50 text-sky-900',
    activeColor: 'ring-2 ring-sky-600 bg-sky-100/60'
  },
  {
    tipo: 'Noche' as const,
    nombre: 'Turno Noche (Vigilancia & Emergencias)',
    horario: '21:00 - 07:00',
    coberturaMinima: 2,
    idTurnoPlantilla: 303,
    color: 'border-purple-400 bg-purple-50/50 text-purple-900',
    activeColor: 'ring-2 ring-purple-600 bg-purple-100/60'
  },
  {
    tipo: '24 Horas' as const,
    nombre: 'Guardia 24 Horas / Refuerzo Clínico',
    horario: '07:00 - 07:00 (+1)',
    coberturaMinima: 1,
    idTurnoPlantilla: 304,
    color: 'border-rose-400 bg-rose-50/50 text-rose-900',
    activeColor: 'ring-2 ring-rose-600 bg-rose-100/60'
  }
];

const DIAS_SEMANA_OPCIONES = [
  { valor: 1, label: 'Lun', nombre: 'Lunes' },
  { valor: 2, label: 'Mar', nombre: 'Martes' },
  { valor: 3, label: 'Mié', nombre: 'Miércoles' },
  { valor: 4, label: 'Jue', nombre: 'Jueves' },
  { valor: 5, label: 'Vie', nombre: 'Viernes' },
  { valor: 6, label: 'Sáb', nombre: 'Sábado' },
  { valor: 0, label: 'Dom', nombre: 'Domingo' }
];

export const ProgramarTurnosModal: React.FC = () => {
  const {
    isProgramarTurnosOpen,
    setIsProgramarTurnosOpen,
    turnoModalFechaInicial,
    trabajadores,
    programarTurnosRango,
    activeSede
  } = useAdmin();

  // Estados del formulario
  const [tipoSeleccionado, setTipoSeleccionado] = useState<'Mañana' | 'Tarde' | 'Noche' | '24 Horas'>('Mañana');
  const [nombreTurno, setNombreTurno] = useState('Turno Mañana (Asistencial & Cuidados)');
  const [horario, setHorario] = useState('07:00 - 15:00');
  const [coberturaMinima, setCoberturaMinima] = useState(3);
  const [area, setArea] = useState('Enfermería & Cuidado');
  const [observaciones, setObservaciones] = useState('');

  // Rango de fechas
  const hoyStr = new Date().toISOString().split('T')[0];
  const [fechaInicio, setFechaInicio] = useState(hoyStr);
  const [fechaFin, setFechaFin] = useState(hoyStr);

  // Días de la semana seleccionados (1=Lun ... 0=Dom)
  const [diasSeleccionados, setDiasSeleccionados] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);

  // Selección de colaboradores
  const [selectedTrabajadores, setSelectedTrabajadores] = useState<number[]>([]);
  const [searchWorker, setSearchWorker] = useState('');
  const [filtroArea, setFiltroArea] = useState('TODOS');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar fecha cuando el modal se abre con fecha preseleccionada
  useEffect(() => {
    if (turnoModalFechaInicial) {
      setFechaInicio(turnoModalFechaInicial);
      setFechaFin(turnoModalFechaInicial);
    } else {
      const hoy = new Date();
      const en7Dias = new Date();
      en7Dias.setDate(hoy.getDate() + 6);
      setFechaInicio(hoy.toISOString().split('T')[0]);
      setFechaFin(en7Dias.toISOString().split('T')[0]);
    }
  }, [turnoModalFechaInicial, isProgramarTurnosOpen]);

  // Trabajadores activos
  const trabajadoresActivos = trabajadores.filter((t) => t.estado === 'Activo');

  // Filtrado de trabajadores
  const trabajadoresFiltrados = trabajadoresActivos.filter((t) => {
    const coincideTexto =
      t.nombreCompleto.toLowerCase().includes(searchWorker.toLowerCase()) ||
      t.cargo.toLowerCase().includes(searchWorker.toLowerCase()) ||
      t.area.toLowerCase().includes(searchWorker.toLowerCase());
    const coincideArea = filtroArea === 'TODOS' || t.area === filtroArea;
    return coincideTexto && coincideArea;
  });

  const areasDisponibles = Array.from(new Set(trabajadoresActivos.map((t) => t.area)));

  // Manejar cambio de plantilla predefinida
  const handleSeleccionarPlantilla = (p: typeof PLANTILLAS_PREDEFINIDAS[0]) => {
    setTipoSeleccionado(p.tipo);
    setNombreTurno(p.nombre);
    setHorario(p.horario);
    setCoberturaMinima(p.coberturaMinima);
  };

  // Toggle día de la semana
  const handleToggleDia = (dia: number) => {
    setDiasSeleccionados((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  // Toggle trabajador
  const handleToggleTrabajador = (id: number) => {
    setSelectedTrabajadores((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Seleccionar atajos de días
  const handleAtajoDias = (tipoAtajo: 'todos' | 'laborales' | 'finDeSemana') => {
    if (tipoAtajo === 'todos') {
      setDiasSeleccionados([1, 2, 3, 4, 5, 6, 0]);
    } else if (tipoAtajo === 'laborales') {
      setDiasSeleccionados([1, 2, 3, 4, 5]);
    } else if (tipoAtajo === 'finDeSemana') {
      setDiasSeleccionados([6, 0]);
    }
  };

  // Atajos de rango de fechas
  const handleAtajoRango = (dias: number) => {
    const inicio = new Date();
    const fin = new Date();
    fin.setDate(inicio.getDate() + dias - 1);
    setFechaInicio(inicio.toISOString().split('T')[0]);
    setFechaFin(fin.toISOString().split('T')[0]);
  };

  // Cálculo en vivo de fechas impactadas
  const fechasImpactadas = useMemo(() => {
    if (!fechaInicio || !fechaFin) return [];
    const [y1, m1, d1] = fechaInicio.split('-').map(Number);
    const [y2, m2, d2] = fechaFin.split('-').map(Number);
    const start = new Date(y1, m1 - 1, d1);
    const end = new Date(y2, m2 - 1, d2);
    if (start > end) return [];

    const lista: string[] = [];
    const curr = new Date(start);
    while (curr <= end) {
      if (diasSeleccionados.includes(curr.getDay())) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, '0');
        const d = String(curr.getDate()).padStart(2, '0');
        lista.push(`${y}-${m}-${d}`);
      }
      curr.setDate(curr.getDate() + 1);
    }
    return lista;
  }, [fechaInicio, fechaFin, diasSeleccionados]);

  const totalAsignacionesCalculadas = fechasImpactadas.length * selectedTrabajadores.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fechaInicio || !fechaFin) {
      alert('Por favor especifique la fecha de inicio y de fin.');
      return;
    }
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      alert('La fecha de inicio no puede ser posterior a la fecha final.');
      return;
    }
    if (diasSeleccionados.length === 0) {
      alert('Debe seleccionar al menos un día de la semana.');
      return;
    }
    if (fechasImpactadas.length === 0) {
      alert('No hay fechas en el rango que coincidan con los días de la semana seleccionados.');
      return;
    }
    if (selectedTrabajadores.length === 0) {
      alert('Por favor seleccione al menos un colaborador para asignar a los turnos.');
      return;
    }

    setIsSubmitting(true);
    try {
      const plantilla = PLANTILLAS_PREDEFINIDAS.find((p) => p.tipo === tipoSeleccionado);
      await programarTurnosRango({
        idCentro: activeSede.id,
        idTurnoPlantilla: plantilla?.idTurnoPlantilla,
        nombreTurno,
        tipo: tipoSeleccionado,
        horario,
        coberturaMinimaRequerida: Number(coberturaMinima) || 2,
        idsTrabajadores: selectedTrabajadores,
        fechaInicio,
        fechaFin,
        diasSemana: diasSeleccionados,
        area,
        observaciones: observaciones.trim() || undefined
      });

      setIsProgramarTurnosOpen(false);
      setSelectedTrabajadores([]);
      setObservaciones('');
    } catch (err: any) {
      alert(`Error al programar turnos:\n${err.message || 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isProgramarTurnosOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#274A3F] flex items-center justify-center text-[#DCB87F] border border-[#DCB87F]/30 shadow-inner">
              <CalendarPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Programación de Turnos por Rango</span>
                <span className="text-[10px] font-mono uppercase bg-[#B3803F]/30 text-[#DCB87F] px-2 py-0.5 rounded-full border border-[#DCB87F]/30">
                  Cuadrantes
                </span>
              </h3>
              <p className="text-xs text-[#DCB87F] flex items-center gap-1.5 mt-0.5">
                <Building className="w-3.5 h-3.5" />
                <span>{activeSede.nombre} • Asignación masiva y control de cobertura</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsProgramarTurnosOpen(false)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-[#CFC9B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECCIÓN 1: TIPO DE TURNO & HORARIO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase font-bold text-[#182F28] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#B3803F]" />
                1. Seleccionar Franja Horaria de Turno
              </label>
              <span className="text-[11px] text-[#7A745F]">Plantillas estándar del centro</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PLANTILLAS_PREDEFINIDAS.map((plantilla) => {
                const isSelected = tipoSeleccionado === plantilla.tipo;
                return (
                  <button
                    key={plantilla.tipo}
                    type="button"
                    onClick={() => handleSeleccionarPlantilla(plantilla)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? `${plantilla.activeColor} border-[#274A3F] shadow-sm`
                        : `${plantilla.color} border-[#DEDBD1] hover:border-[#B3803F]`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-serif">{plantilla.tipo}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#274A3F]" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-[#182F28]">{plantilla.horario}</div>
                    <div className="text-[10px] text-[#5C6058] mt-1">
                      Mínimo {plantilla.coberturaMinima} cuidadores
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#182F28] mb-1">
                  Nombre descriptivo del Turno
                </label>
                <input
                  type="text"
                  value={nombreTurno}
                  onChange={(e) => setNombreTurno(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#182F28] mb-1">
                  Cobertura Mínima (Personal)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={coberturaMinima}
                  onChange={(e) => setCoberturaMinima(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: RANGO DE FECHAS & DÍAS DE LA SEMANA */}
          <div className="p-4 sm:p-5 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-mono uppercase font-bold text-[#182F28] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#B3803F]" />
                2. Rango de Fechas & Días a Programar
              </label>

              {/* Atajos de rango */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-[#5C6058] mr-1">Rápido:</span>
                <button
                  type="button"
                  onClick={() => handleAtajoRango(7)}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-white border border-[#DEDBD1] text-[#182F28] hover:bg-[#274A3F] hover:text-white transition-colors cursor-pointer font-medium"
                >
                  7 días
                </button>
                <button
                  type="button"
                  onClick={() => handleAtajoRango(15)}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-white border border-[#DEDBD1] text-[#182F28] hover:bg-[#274A3F] hover:text-white transition-colors cursor-pointer font-medium"
                >
                  15 días
                </button>
                <button
                  type="button"
                  onClick={() => handleAtajoRango(30)}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-white border border-[#DEDBD1] text-[#182F28] hover:bg-[#274A3F] hover:text-white transition-colors cursor-pointer font-medium"
                >
                  30 días (Mes)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#182F28] mb-1">
                  Fecha Inicio (Desde) *
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#182F28] mb-1">
                  Fecha Fin (Hasta) *
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  min={fechaInicio}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                  required
                />
              </div>
            </div>

            {/* Selector de días de la semana */}
            <div className="space-y-2 pt-1 border-t border-[#DEDBD1]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#182F28]">
                  Días de la semana incluidos:
                </span>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleAtajoDias('todos')}
                    className="text-[#B3803F] hover:underline font-bold cursor-pointer"
                  >
                    Todos
                  </button>
                  <span className="text-[#DEDBD1]">|</span>
                  <button
                    type="button"
                    onClick={() => handleAtajoDias('laborales')}
                    className="text-[#B3803F] hover:underline font-bold cursor-pointer"
                  >
                    Lun - Vie
                  </button>
                  <span className="text-[#DEDBD1]">|</span>
                  <button
                    type="button"
                    onClick={() => handleAtajoDias('finDeSemana')}
                    className="text-[#B3803F] hover:underline font-bold cursor-pointer"
                  >
                    Fines de Semana
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {DIAS_SEMANA_OPCIONES.map((dia) => {
                  const isActivo = diasSeleccionados.includes(dia.valor);
                  return (
                    <button
                      key={dia.valor}
                      type="button"
                      onClick={() => handleToggleDia(dia.valor)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                        isActivo
                          ? 'bg-[#274A3F] text-white border-[#274A3F] shadow-xs'
                          : 'bg-white text-[#5C6058] border-[#DEDBD1] hover:border-[#B3803F]'
                      }`}
                    >
                      <div>{dia.label}</div>
                      <div className="text-[9px] opacity-75 hidden sm:block">{dia.nombre}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: SELECCIÓN DE COLABORADORES */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-mono uppercase font-bold text-[#182F28] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#B3803F]" />
                3. Asignar Colaboradores al Turno ({selectedTrabajadores.length} seleccionados)
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTrabajadores(trabajadoresFiltrados.map((t) => t.id))}
                  className="text-xs text-[#274A3F] font-bold hover:underline cursor-pointer"
                >
                  Seleccionar filtrados
                </button>
                <span className="text-[#DEDBD1]">|</span>
                <button
                  type="button"
                  onClick={() => setSelectedTrabajadores([])}
                  className="text-xs text-[#7A745F] hover:underline cursor-pointer"
                >
                  Desmarcar todos
                </button>
              </div>
            </div>

            {/* Barra de Filtro de Trabajadores */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#7A745F] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar colaborador por nombre, cargo o especialidad..."
                  value={searchWorker}
                  onChange={(e) => setSearchWorker(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                />
              </div>

              <select
                value={filtroArea}
                onChange={(e) => setFiltroArea(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
              >
                <option value="TODOS">Todas las Áreas</option>
                {areasDisponibles.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Lista Scrollable de Trabajadores */}
            <div className="max-h-56 overflow-y-auto rounded-2xl border border-[#DEDBD1] divide-y divide-[#DEDBD1] bg-white">
              {trabajadoresFiltrados.map((colab) => {
                const isSelected = selectedTrabajadores.includes(colab.id);
                return (
                  <div
                    key={colab.id}
                    onClick={() => handleToggleTrabajador(colab.id)}
                    className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#FEF7EE]' : 'hover:bg-[#F7F6F2]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-[#274A3F] rounded accent-[#274A3F] cursor-pointer"
                      />
                      <img
                        src={resolverAvatarUrl(colab.avatarUrl)}
                        alt={colab.nombreCompleto}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_AVATAR;
                        }}
                        className="w-8 h-8 rounded-full object-cover border border-[#DEDBD1]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#182F28] flex items-center gap-2">
                          <span>{colab.nombreCompleto}</span>
                          {colab.turnoHabitual && (
                            <span className="text-[10px] text-[#7A745F] font-normal hidden sm:inline">
                              • Habitual: {colab.turnoHabitual}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#5C6058]">{colab.cargo}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F7F6F2] text-[#274A3F]">
                        {colab.area}
                      </span>
                    </div>
                  </div>
                );
              })}

              {trabajadoresFiltrados.length === 0 && (
                <div className="p-6 text-center text-xs text-[#5C6058]">
                  No se encontraron colaboradores activos con el filtro ingresado.
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 4: DETALLES & RESUMEN DE IMPACTO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                Área de Cobertura / Sector del Centro
              </label>
              <input
                type="text"
                placeholder="Ej. Ala Norte - Piso 2 o UCI Geriátrica"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#182F28] mb-1">
                Observaciones / Indicaciones Especiales
              </label>
              <input
                type="text"
                placeholder="Ej. Ronda de medicación nocturna y cambio postural"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
              />
            </div>
          </div>

          {/* Banner de Resumen de Impacto */}
          <div className="p-4 bg-[#FEF7EE] rounded-2xl border border-[#DCB87F] flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-[#DCB87F]/30 text-[#9A5B12] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs text-[#182F28] space-y-1">
              <div className="font-bold font-serif text-sm text-[#9A5B12]">
                Resumen de Programación en Cuadrante
              </div>
              <p className="leading-relaxed text-[#5C6058]">
                Se programarán <strong>{fechasImpactadas.length} día(s) de turnos</strong> ({tipoSeleccionado}, {horario})
                con <strong>{selectedTrabajadores.length} colaborador(es)</strong> asignados por fecha,
                generando un total de <strong>{totalAsignacionesCalculadas} asignaciones de turno</strong> en la base de datos de {activeSede.nombre}.
              </p>
              {selectedTrabajadores.length > 0 && selectedTrabajadores.length < coberturaMinima && (
                <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1.5 pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>
                    Aviso: La cobertura mínima configurada es de {coberturaMinima} personas. Los turnos quedarán en estado 'Alerta Cobertura'.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer del Modal */}
          <div className="pt-4 border-t border-[#DEDBD1] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsProgramarTurnosOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#5C6058] hover:bg-[#F7F6F2] transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || fechasImpactadas.length === 0 || selectedTrabajadores.length === 0}
              className="px-6 py-2.5 bg-[#274A3F] hover:bg-[#182F28] text-white font-bold rounded-xl text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <CalendarPlus className="w-4 h-4 text-[#DCB87F]" />
              <span>
                {isSubmitting
                  ? 'Guardando en Base de Datos...'
                  : `Confirmar y Programar ${fechasImpactadas.length} Día(s)`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
