import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  X,
  Package,
  ClipboardList,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  User,
  Info,
  Clock,
  Trash2,
  Plus,
  ShoppingBag,
  Check
} from 'lucide-react';
import { ResidentAvatar } from '../common/ResidentAvatar';
import { Residente, ElementoDotacionCatalogo, SolicitudDotacionPayload, ArticuloSolicitudDotacion } from '../../types';

export const SolicitarDotacionModal: React.FC = () => {
  const {
    isSolicitarDotacionOpen,
    setIsSolicitarDotacionOpen,
    solicitarDotacionResidentePreseleccionado,
    residentes,
    catalogoDotacion,
    registrarSolicitudDotacion,
    activeSede
  } = useAdmin();

  // Estados de selección de residente
  const [selectedResId, setSelectedResId] = useState<number | null>(null);
  const [origenArticulo, setOrigenArticulo] = useState<'catalogo' | 'personalizado'>('catalogo');
  const [busquedaCatalogo, setBusquedaCatalogo] = useState<string>('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('TODAS');

  // Lista de artículos a solicitar (múltiples artículos)
  const [articulosSolicitados, setArticulosSolicitados] = useState<ArticuloSolicitudDotacion[]>([]);

  // Campos para artículo personalizado adicional
  const [nombrePersonalizado, setNombrePersonalizado] = useState<string>('');
  const [categoriaPersonalizada, setCategoriaPersonalizada] = useState<string>('Lencería y Ropa de Cama');
  const [cantidadPersonalizada, setCantidadPersonalizada] = useState<number>(1);
  const [frecuenciaPersonalizada, setFrecuenciaPersonalizada] = useState<number | null>(12);
  const [especificacionesPersonalizadas, setEspecificacionesPersonalizadas] = useState<string>('');

  // Parámetros generales de la solicitud
  const [prioridad, setPrioridad] = useState<'Normal' | 'Alta' | 'Urgente'>('Normal');
  const [motivoSolicitud, setMotivoSolicitud] = useState<string>('Reposición por desgaste natural');
  const [fechaRequerida, setFechaRequerida] = useState<string>('');
  const [notasGenerales, setNotasGenerales] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  // Inicializar residente seleccionado al abrir
  useEffect(() => {
    if (isSolicitarDotacionOpen) {
      if (solicitarDotacionResidentePreseleccionado) {
        setSelectedResId(solicitarDotacionResidentePreseleccionado.id);
      } else if (residentes.length > 0 && !selectedResId) {
        setSelectedResId(residentes[0].id);
      }
      // Fecha requerida por defecto (en 3 días)
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setFechaRequerida(d.toISOString().split('T')[0]);
      setErrorValidacion(null);
    }
  }, [isSolicitarDotacionOpen, solicitarDotacionResidentePreseleccionado, residentes]);

  if (!isSolicitarDotacionOpen) return null;

  const residenteActual: Residente | undefined = residentes.find((r) => r.id === selectedResId);

  // Categorías disponibles en el catálogo
  const categoriasCatalogo = ['TODAS', ...Array.from(new Set(catalogoDotacion.map((c) => c.categoria)))];

  // Elementos del catálogo filtrados
  const catalogoFiltrado = catalogoDotacion.filter((item) => {
    if (item.estado === 'Inactivo') return false;
    if (categoriaSeleccionada !== 'TODAS' && item.categoria !== categoriaSeleccionada) return false;
    if (busquedaCatalogo.trim()) {
      const q = busquedaCatalogo.toLowerCase().trim();
      return (
        item.nombreElemento.toLowerCase().includes(q) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Alternar selección de un artículo del catálogo (agregar o remover)
  const handleToggleArticuloCatalogo = (item: ElementoDotacionCatalogo) => {
    const existe = articulosSolicitados.find((a) => a.idElementoCatalogo === item.id);
    if (existe) {
      setArticulosSolicitados(articulosSolicitados.filter((a) => a.idElementoCatalogo !== item.id));
    } else {
      const nuevo: ArticuloSolicitudDotacion = {
        idElementoCatalogo: item.id,
        nombreElemento: item.nombreElemento,
        categoria: item.categoria,
        cantidad: item.cantidadDefecto || 1,
        frecuenciaCambioMeses: item.frecuenciaCambioMeses ?? 12,
        especificaciones: '',
        notas: ''
      };
      setArticulosSolicitados([...articulosSolicitados, nuevo]);
    }
    setErrorValidacion(null);
  };

  // Modificar cantidad de un artículo de la lista
  const handleCambiarCantidad = (index: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      handleEliminarArticulo(index);
      return;
    }
    setArticulosSolicitados(
      articulosSolicitados.map((a, i) => (i === index ? { ...a, cantidad: nuevaCantidad } : a))
    );
  };

  // Modificar especificaciones de un artículo de la lista
  const handleCambiarEspecificacion = (index: number, espec: string) => {
    setArticulosSolicitados(
      articulosSolicitados.map((a, i) => (i === index ? { ...a, especificaciones: espec } : a))
    );
  };

  // Eliminar artículo de la lista
  const handleEliminarArticulo = (index: number) => {
    setArticulosSolicitados(articulosSolicitados.filter((_, i) => i !== index));
  };

  // Agregar artículo personalizado a la lista
  const handleAgregarPersonalizado = () => {
    if (!nombrePersonalizado.trim()) {
      setErrorValidacion('Por favor ingrese el nombre del artículo personalizado.');
      return;
    }

    const nuevo: ArticuloSolicitudDotacion = {
      idElementoCatalogo: null,
      nombreElemento: nombrePersonalizado.trim(),
      categoria: categoriaPersonalizada,
      cantidad: Math.max(1, cantidadPersonalizada),
      frecuenciaCambioMeses: frecuenciaPersonalizada,
      especificaciones: especificacionesPersonalizadas.trim() || undefined,
      notas: ''
    };

    setArticulosSolicitados([...articulosSolicitados, nuevo]);
    setNombrePersonalizado('');
    setEspecificacionesPersonalizadas('');
    setCantidadPersonalizada(1);
    setErrorValidacion(null);
  };

  // Enviar formulario multi-artículo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion(null);

    if (!selectedResId) {
      setErrorValidacion('Por favor seleccione un residente destinatario.');
      return;
    }

    if (articulosSolicitados.length === 0) {
      setErrorValidacion('Debe seleccionar o agregar al menos un artículo para registrar la solicitud.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: SolicitudDotacionPayload = {
        idResidente: selectedResId,
        prioridad,
        motivoSolicitud,
        fechaRequerida: fechaRequerida || undefined,
        notas: notasGenerales.trim() || undefined,
        articulos: articulosSolicitados
      };

      await registrarSolicitudDotacion(payload);
      handleClose();
    } catch (err: any) {
      setErrorValidacion(err?.message || 'Error al registrar la solicitud de dotación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSolicitarDotacionOpen(false);
    setArticulosSolicitados([]);
    setNombrePersonalizado('');
    setEspecificacionesPersonalizadas('');
    setNotasGenerales('');
    setErrorValidacion(null);
  };

  const totalUnidades = articulosSolicitados.reduce((acc, it) => acc + (it.cantidad || 1), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 modal-backdrop animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal Institucional */}
        <div className="p-5 sm:p-6 bg-[#182F28] text-white flex items-center justify-between border-b border-[#274A3F]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#274A3F] border border-[#DCB87F]/40 flex items-center justify-center text-[#DCB87F] shadow-inner">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white tracking-wide">
                  Solicitud de Dotación para Residente
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#DCB87F] text-[#182F28]">
                  MULTI-ARTÍCULO
                </span>
              </div>
              <p className="text-xs text-[#DCB87F] mt-0.5">
                Seleccione uno o varios artículos para tramitar la dotación de {activeSede?.nombre || 'la Sede'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-[#CFC9B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">
          {/* Alerta de Error de Validación */}
          {errorValidacion && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-700 text-xs font-semibold animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorValidacion}</span>
            </div>
          )}

          {/* 1. SELECCIÓN DE RESIDENTE DESTINATARIO */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#182F28] uppercase font-mono flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#B3803F]" />
                <span>1. Residente Destinatario de la Dotación *</span>
              </label>
              {residenteActual && (
                <span className="text-[11px] text-[#5C6058] font-mono">
                  Habitación: <strong>{residenteActual.habitacion}</strong> (Cama {residenteActual.cama})
                </span>
              )}
            </div>

            {residenteActual ? (
              <div className="p-3.5 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <ResidentAvatar
                    fotoUrl={residenteActual.fotoUrl}
                    nombres={residenteActual.nombres}
                    apellidos={residenteActual.apellidos}
                    nombreCompleto={residenteActual.nombreCompleto}
                    sizeClass="w-11 h-11"
                    roundedClass="rounded-xl"
                    textClass="text-base"
                    className="border border-[#DCB87F]"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-[#182F28] truncate">
                        {residenteActual.nombreCompleto}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white text-[#182F28] font-bold border border-[#DEDBD1]">
                        {residenteActual.codigoExpediente}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5C6058] truncate">
                      {residenteActual.tipoIdentificacion} {residenteActual.identificacion} • Movilidad: {residenteActual.nivelMovilidad || 'Estándar'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <select
                    value={selectedResId || ''}
                    onChange={(e) => setSelectedResId(Number(e.target.value))}
                    className="text-xs font-semibold px-2.5 py-1.5 bg-white border border-[#DEDBD1] rounded-xl text-[#182F28] hover:border-[#182F28] focus:outline-none cursor-pointer"
                  >
                    {residentes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombreCompleto} (Hab. {r.habitacion})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                No hay residentes registrados actualmente.
              </div>
            )}
          </div>

          {/* 2. SELECCIÓN DE ARTÍCULOS (CATÁLOGO O LIBRE) */}
          <div className="space-y-3 pt-2 border-t border-[#DEDBD1]/60">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[#182F28] uppercase font-mono flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#B3803F]" />
                  <span>2. Artículos de Dotación a Solicitar (Seleccione uno o más) *</span>
                </label>
                <p className="text-[11px] text-[#7A745F] mt-0.5">
                  Haga clic en los artículos que necesita para agregarlos o quitarlos de la solicitud
                </p>
              </div>

              {/* Selector de modo: Catálogo o Personalizado */}
              <div className="flex items-center bg-[#F2EFE9] p-0.5 rounded-xl border border-[#DEDBD1]">
                <button
                  type="button"
                  onClick={() => setOrigenArticulo('catalogo')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    origenArticulo === 'catalogo'
                      ? 'bg-white text-[#182F28] shadow-2xs'
                      : 'text-[#7A745F] hover:text-[#182F28]'
                  }`}
                >
                  Desde Catálogo
                </button>
                <button
                  type="button"
                  onClick={() => setOrigenArticulo('personalizado')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    origenArticulo === 'personalizado'
                      ? 'bg-white text-[#182F28] shadow-2xs'
                      : 'text-[#7A745F] hover:text-[#182F28]'
                  }`}
                >
                  Artículo Libre / Personalizado
                </button>
              </div>
            </div>

            {/* Catálogo de Artículos con Selección Múltiple */}
            {origenArticulo === 'catalogo' ? (
              <div className="p-3.5 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#7A745F]" />
                    <input
                      type="text"
                      placeholder="Buscar en catálogo (sábanas, toallas, cobijas, pañales, menaje...)"
                      value={busquedaCatalogo}
                      onChange={(e) => setBusquedaCatalogo(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#DEDBD1] rounded-xl text-xs text-[#182F28] placeholder-[#9C9889] focus:outline-none focus:border-[#182F28]"
                    />
                  </div>
                  <select
                    value={categoriaSeleccionada}
                    onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-[#DEDBD1] rounded-xl text-xs font-semibold text-[#182F28] focus:outline-none"
                  >
                    {categoriasCatalogo.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grid interactivo con toggle múltiple */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {catalogoFiltrado.map((item) => {
                    const articuloSeleccionado = articulosSolicitados.find((a) => a.idElementoCatalogo === item.id);
                    const isSelected = !!articuloSeleccionado;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleArticuloCatalogo(item)}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2.5 select-none ${
                          isSelected
                            ? 'bg-[#182F28] text-white border-[#182F28] shadow-sm'
                            : 'bg-white hover:bg-[#F2EFE9] border-[#DEDBD1] text-[#182F28]'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs truncate flex items-center gap-1.5">
                            <span>{item.nombreElemento}</span>
                          </div>
                          <span
                            className={`text-[10px] font-semibold block mt-0.5 ${
                              isSelected ? 'text-[#DCB87F]' : 'text-[#7A745F]'
                            }`}
                          >
                            {item.categoria} {item.frecuenciaCambioMeses ? `• Recambio: ${item.frecuenciaCambioMeses}m` : ''}
                          </span>
                        </div>

                        {isSelected ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#274A3F] text-[#DCB87F] border border-[#DCB87F]/30">
                              Cant: {articuloSeleccionado.cantidad}
                            </span>
                            <div className="w-6 h-6 rounded-full bg-[#DCB87F] text-[#182F28] flex items-center justify-center font-bold">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-[#DEDBD1] text-[#7A745F] flex items-center justify-center shrink-0">
                            <Plus className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {catalogoFiltrado.length === 0 && (
                    <div className="col-span-full py-4 text-center text-xs text-[#7A745F]">
                      No se encontraron artículos con ese criterio. Puede ingresar uno personalizado arriba.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Agregar Artículo Libre / Personalizado */
              <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] space-y-3">
                <span className="text-xs font-bold text-[#182F28] uppercase font-mono block">
                  Registrar Artículo Personalizado a la Solicitud
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#5C6058] mb-1">
                      Nombre del Artículo *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Cojín antiescaras especial, Pijama abrigada, Bastón 4 apoyos"
                      value={nombrePersonalizado}
                      onChange={(e) => setNombrePersonalizado(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#DEDBD1] rounded-xl text-xs text-[#182F28] font-semibold focus:outline-none focus:border-[#182F28]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5C6058] mb-1">
                      Categoría
                    </label>
                    <select
                      value={categoriaPersonalizada}
                      onChange={(e) => setCategoriaPersonalizada(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#DEDBD1] rounded-xl text-xs text-[#182F28] focus:outline-none"
                    >
                      <option value="Lencería y Ropa de Cama">Lencería y Ropa de Cama</option>
                      <option value="Aseo y Cuidado Personal">Aseo y Cuidado Personal</option>
                      <option value="Menaje y Alimentación">Menaje y Alimentación</option>
                      <option value="Ayudas Técnicas y Movilidad">Ayudas Técnicas</option>
                      <option value="Prendas de Vestir y Calzado">Prendas de Vestir</option>
                      <option value="Insumos Clínicos y Curación">Insumos Clínicos</option>
                      <option value="Dotación General">Dotación General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5C6058] mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={cantidadPersonalizada}
                      onChange={(e) => setCantidadPersonalizada(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 bg-white border border-[#DEDBD1] rounded-xl text-xs text-[#182F28] font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#5C6058] mb-1">
                      Especificaciones / Talla / Características
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Talla L, Algodón hipoalergénico, Cama sencilla 1.00m"
                      value={especificacionesPersonalizadas}
                      onChange={(e) => setEspecificacionesPersonalizadas(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#DEDBD1] rounded-xl text-xs text-[#182F28] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5C6058] mb-1">
                      Ciclo de Reposición
                    </label>
                    <select
                      value={frecuenciaPersonalizada ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseInt(e.target.value);
                        setFrecuenciaPersonalizada(val);
                      }}
                      className="w-full px-3 py-2 bg-white border border-[#DEDBD1] rounded-xl text-xs text-[#182F28] focus:outline-none"
                    >
                      <option value="">Entrega única</option>
                      <option value="3">Cada 3 meses</option>
                      <option value="6">Cada 6 meses</option>
                      <option value="12">Cada 12 meses (1 año)</option>
                      <option value="24">Cada 24 meses (2 años)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAgregarPersonalizado}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#182F28] hover:bg-[#274A3F] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#DCB87F]" />
                    <span>Agregar a la Solicitud</span>
                  </button>
                </div>
              </div>
            )}

            {/* BANDEJA / LISTADO DE ARTÍCULOS SELECCIONADOS */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#B3803F]" />
                  <span className="text-xs font-bold text-[#182F28] uppercase font-mono">
                    Artículos en la Solicitud ({articulosSolicitados.length} artículos • {totalUnidades} unidades)
                  </span>
                </div>
                {articulosSolicitados.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setArticulosSolicitados([])}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                  >
                    Limpiar selección
                  </button>
                )}
              </div>

              {articulosSolicitados.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {articulosSolicitados.map((art, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-2xl border border-[#DEDBD1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-[#DCB87F] transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-[#182F28]">
                            {art.nombreElemento}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DCB87F]/30 text-[#694819]">
                            {art.categoria}
                          </span>
                          {art.frecuenciaCambioMeses && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F7F6F2] text-[#5C6058] border border-[#DEDBD1]">
                              Ciclo: {art.frecuenciaCambioMeses}m
                            </span>
                          )}
                        </div>

                        {/* Input opcional de especificaciones o talla por artículo */}
                        <div className="mt-1.5">
                          <input
                            type="text"
                            placeholder="Especificaciones o talla para este artículo (opcional)"
                            value={art.especificaciones || ''}
                            onChange={(e) => handleCambiarEspecificacion(idx, e.target.value)}
                            className="w-full px-2.5 py-1 bg-[#F7F6F2] border border-[#DEDBD1] rounded-lg text-[11px] text-[#182F28] focus:bg-white focus:outline-none focus:border-[#182F28]"
                          />
                        </div>
                      </div>

                      {/* Controles de cantidad y botón eliminar */}
                      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                        <div className="flex items-center border border-[#DEDBD1] rounded-xl overflow-hidden bg-white">
                          <button
                            type="button"
                            onClick={() => handleCambiarCantidad(idx, art.cantidad - 1)}
                            className="w-7 h-7 bg-[#F7F6F2] hover:bg-[#EAE6DD] text-[#182F28] font-bold text-xs flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-9 text-center text-xs font-bold text-[#182F28]">
                            {art.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCambiarCantidad(idx, art.cantidad + 1)}
                            className="w-7 h-7 bg-[#F7F6F2] hover:bg-[#EAE6DD] text-[#182F28] font-bold text-xs flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleEliminarArticulo(idx)}
                          className="w-7 h-7 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Quitar artículo de la solicitud"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-[#FEF7EE] rounded-2xl border border-dashed border-[#DCB87F] text-center text-xs text-[#9A5B12]">
                  No has agregado artículos a la solicitud. Haz clic en las tarjetas del catálogo arriba o usa la pestaña de artículo personalizado.
                </div>
              )}
            </div>
          </div>

          {/* 3. PARÁMETROS GENERALES DE LA SOLICITUD */}
          <div className="space-y-4 pt-2 border-t border-[#DEDBD1]/60">
            <label className="text-xs font-bold text-[#182F28] uppercase font-mono flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#B3803F]" />
              <span>3. Parámetros Generales de la Solicitud</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Nivel de Prioridad */}
              <div>
                <label className="block text-[11px] font-bold text-[#5C6058] mb-1">
                  Prioridad de Solicitud *
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setPrioridad('Normal')}
                    className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      prioridad === 'Normal'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold shadow-2xs'
                        : 'bg-white text-[#5C6058] border-[#DEDBD1] hover:bg-[#F7F6F2]'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrioridad('Alta')}
                    className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      prioridad === 'Alta'
                        ? 'bg-amber-50 text-amber-800 border-amber-300 font-extrabold shadow-2xs'
                        : 'bg-white text-[#5C6058] border-[#DEDBD1] hover:bg-[#F7F6F2]'
                    }`}
                  >
                    Alta
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrioridad('Urgente')}
                    className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      prioridad === 'Urgente'
                        ? 'bg-rose-50 text-rose-800 border-rose-300 font-extrabold shadow-2xs'
                        : 'bg-white text-[#5C6058] border-[#DEDBD1] hover:bg-[#F7F6F2]'
                    }`}
                  >
                    Urgente
                  </button>
                </div>
              </div>

              {/* Motivo de la Solicitud */}
              <div>
                <label className="block text-[11px] font-bold text-[#5C6058] mb-1">
                  Motivo de la Solicitud *
                </label>
                <select
                  value={motivoSolicitud}
                  onChange={(e) => setMotivoSolicitud(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DEDBD1] rounded-xl text-xs text-[#182F28] font-semibold focus:outline-none focus:border-[#182F28]"
                >
                  <option value="Nuevo ingreso al centro">Nuevo ingreso al centro</option>
                  <option value="Reposición por desgaste natural">Reposición por desgaste natural</option>
                  <option value="Deterioro imprevisto o rotura">Deterioro imprevisto o rotura</option>
                  <option value="Prescripción o indicación médica">Prescripción médica / fisioterapia</option>
                  <option value="Solicitud del acudiente / familiar">Solicitud del familiar / acudiente</option>
                  <option value="Cambio de estación o clima">Cambio de clima / temporada</option>
                  <option value="Otro requerimiento">Otro requerimiento operativo</option>
                </select>
              </div>

              {/* Fecha Requerida / Estimada */}
              <div>
                <label className="block text-[11px] font-bold text-[#5C6058] mb-1">
                  Fecha Estimada / Requerida
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#7A745F]" />
                  <input
                    type="date"
                    value={fechaRequerida}
                    onChange={(e) => setFechaRequerida(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#DEDBD1] rounded-xl text-xs text-[#182F28] font-semibold focus:outline-none focus:border-[#182F28]"
                  />
                </div>
              </div>
            </div>

            {/* Observaciones generales para almacén */}
            <div>
              <label className="block text-[11px] font-bold text-[#5C6058] mb-1">
                Observaciones Generales para Almacén / Compras
              </label>
              <input
                type="text"
                placeholder="Observaciones generales para compras o personal de almacén/enfermería"
                value={notasGenerales}
                onChange={(e) => setNotasGenerales(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DEDBD1] rounded-xl text-xs text-[#182F28] focus:outline-none focus:border-[#182F28]"
              />
            </div>
          </div>

          {/* Resumen Informativo */}
          <div className="p-3.5 bg-[#FEF7EE] rounded-2xl border border-[#DCB87F]/40 flex items-start gap-3">
            <Info className="w-4 h-4 text-[#9A5B12] shrink-0 mt-0.5" />
            <div className="text-xs text-[#694819] leading-relaxed">
              <p className="font-bold text-[#9A5B12]">
                Flujo Operativo de Solicitud Multi-Artículo:
              </p>
              <p className="mt-0.5 text-[11px]">
                Se crearán <strong>{articulosSolicitados.length} registro(s)</strong> de dotación con estado <strong>SOLICITADO</strong> en una única transacción controlada. Cada artículo mantendrá su propia cantidad, especificación y ciclo de recambio independiente en el expediente del residente.
              </p>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-3 border-t border-[#DEDBD1] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-xs text-[#5C6058] font-bold hover:bg-[#F2EFE9] rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !selectedResId || articulosSolicitados.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#182F28] hover:bg-[#274A3F] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ClipboardList className="w-4 h-4 text-[#DCB87F]" />
              <span>
                {isSubmitting
                  ? 'Registrando...'
                  : `Registrar Solicitud (${articulosSolicitados.length} artículo${articulosSolicitados.length === 1 ? '' : 's'})`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
