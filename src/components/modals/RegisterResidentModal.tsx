import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  X,
  UserPlus,
  HeartHandshake,
  Stethoscope,
  AlertTriangle,
  Camera,
  Pill,
  Plus,
  Trash2,
  Clock,
  Calendar
} from 'lucide-react';
import { MedicamentoPrescrito } from '../../types';
import { obtenerIniciales } from '../../utils/avatarUtils';

export const RegisterResidentModal: React.FC = () => {
  const { isRegisterResidentOpen, setIsRegisterResidentOpen, registrarResidente, activeSede, catalogoDotacion } = useAdmin();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | undefined>(undefined);

  // Lista de Dotación de Ingreso (Catálogo Sugerido + Personalización)
  const [itemsDotacion, setItemsDotacion] = useState<
    Array<{
      idElementoCatalogo?: number | null;
      nombreElemento: string;
      categoria: string;
      cantidad: number;
      frecuenciaCambioMeses?: number | null;
      condicionEntrega: string;
      notas: string;
      incluido: boolean;
    }>
  >(() => {
    return (catalogoDotacion || [])
      .filter((c) => c.esSugeridoIngreso && c.estado === 'Activo')
      .map((c) => ({
        idElementoCatalogo: c.id,
        nombreElemento: c.nombreElemento,
        categoria: c.categoria,
        cantidad: c.cantidadDefecto || 1,
        frecuenciaCambioMeses: c.frecuenciaCambioMeses,
        condicionEntrega: 'Nuevo',
        notas: '',
        incluido: true
      }));
  });

  const [nuevoItemDotacion, setNuevoItemDotacion] = useState({
    nombreElemento: '',
    categoria: 'Lencería y Ropa de Cama',
    cantidad: 1,
    frecuenciaCambioMeses: 12 as number | null
  });

  // Lista de Medicamentos Prescritos
  const [medicamentos, setMedicamentos] = useState<MedicamentoPrescrito[]>([]);
  const [nuevoMed, setNuevoMed] = useState<MedicamentoPrescrito>({
    medicamento: '',
    cantidad: '',
    frecuencia: '',
    fechaFin: '',
    indicaciones: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    tipoIdentificacion: 'CC',
    identificacion: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    genero: 'F' as 'M' | 'F' | 'OTRO',
    eps: 'Sanitas EPS',
    planComplementario: '',
    tipoSangre: 'O+',
    habitacion: '',
    cama: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    estado: 'Activo' as 'Activo' | 'En Observación' | 'Hospitalizado' | 'Egresado',
    nivelMovilidad: 'Independiente' as const,
    tipoDieta: 'Normal / General' as const,
    alertasClinicas: '',
    // Acudiente en el mismo flujo
    incluirAcudiente: true,
    acudienteNombres: '',
    acudienteApellidos: '',
    acudienteIdentificacion: '',
    acudienteParentesco: 'Hijo/a',
    acudienteTelefono: '',
    acudienteEmail: ''
  });

  if (!isRegisterResidentOpen) return null;

  const handleAgregarMedicamento = () => {
    if (!nuevoMed.medicamento.trim() || !nuevoMed.cantidad.trim() || !nuevoMed.frecuencia.trim()) {
      alert('Por favor ingrese el nombre del medicamento, la cantidad/dosis y la frecuencia.');
      return;
    }
    setMedicamentos((prev) => [...prev, { ...nuevoMed }]);
    setNuevoMed({
      medicamento: '',
      cantidad: '',
      frecuencia: '',
      fechaFin: '',
      indicaciones: ''
    });
  };

  const handleEliminarMedicamento = (index: number) => {
    setMedicamentos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombres || !formData.apellidos || !formData.identificacion || !formData.habitacion) {
      alert('Por favor complete los campos obligatorios del residente.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registrarResidente({
        idCentro: activeSede.id,
        tipoIdentificacion: formData.tipoIdentificacion,
        identificacion: formData.identificacion,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        nombreCompleto: `${formData.nombres} ${formData.apellidos}`.trim(),
        fechaNacimiento: formData.fechaNacimiento || '1945-01-01',
        genero: formData.genero,
        habitacion: formData.habitacion,
        cama: formData.cama || `${formData.habitacion}-A`,
        eps: formData.eps,
        planComplementario: formData.planComplementario,
        tipoSangre: formData.tipoSangre,
        nivelMovilidad: formData.nivelMovilidad,
        tipoDieta: formData.tipoDieta,
        alertasClinicas: formData.alertasClinicas,
        fechaIngreso: formData.fechaIngreso,
        estado: formData.estado,
        fotoUrl: fotoPreview,
        medicamentos: medicamentos.length > 0 ? medicamentos : undefined,
        acudientes: [],
        dotacionInicial: itemsDotacion
          .filter((it) => it.incluido && it.nombreElemento.trim())
          .map((it) => ({
            idElementoCatalogo: it.idElementoCatalogo,
            nombreElemento: it.nombreElemento,
            categoria: it.categoria,
            cantidad: it.cantidad,
            frecuenciaCambioMeses: it.frecuenciaCambioMeses,
            condicionEntrega: it.condicionEntrega,
            notas: it.notas
          })),
        familiarContacto: formData.incluirAcudiente && formData.acudienteNombres ? {
          nombres: formData.acudienteNombres,
          apellidos: formData.acudienteApellidos,
          identificacion: formData.acudienteIdentificacion,
          parentesco: formData.acudienteParentesco,
          telefono: formData.acudienteTelefono,
          email: formData.acudienteEmail
        } : undefined
      });

      setIsRegisterResidentOpen(false);
      setFotoPreview(undefined);
      setMedicamentos([]);
      setStep(1);
      setNuevoMed({
        medicamento: '',
        cantidad: '',
        frecuencia: '',
        fechaFin: '',
        indicaciones: ''
      });
      // Reset form
      setFormData({
        tipoIdentificacion: 'CC',
        identificacion: '',
        nombres: '',
        apellidos: '',
        fechaNacimiento: '',
        genero: 'F',
        eps: 'Sanitas EPS',
        planComplementario: '',
        tipoSangre: 'O+',
        habitacion: '',
        cama: '',
        fechaIngreso: new Date().toISOString().split('T')[0],
        estado: 'Activo' as const,
        nivelMovilidad: 'Independiente',
        tipoDieta: 'Normal / General',
        alertasClinicas: '',
        incluirAcudiente: true,
        acudienteNombres: '',
        acudienteApellidos: '',
        acudienteIdentificacion: '',
        acudienteParentesco: 'Hijo/a',
        acudienteTelefono: '',
        acudienteEmail: ''
      });
      setStep(1);
    } catch (err: any) {
      console.warn('[RegisterResidentModal] El registro no pudo completarse en Oracle:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-6 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#274A3F] flex items-center justify-center text-[#DCB87F] border border-[#DCB87F]/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                Admisión y Registro de Residente
              </h3>
              <p className="text-xs text-[#DCB87F]">
                {activeSede.nombre} • Creación de ficha clínica e institucional
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsRegisterResidentOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#CFC9B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Indicator */}
        <div className="flex border-b border-[#DEDBD1] bg-[#F7F6F2] px-6 py-2.5 text-xs font-semibold text-[#5C6058] overflow-x-auto gap-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg cursor-pointer shrink-0 ${
              step === 1 ? 'bg-[#274A3F] text-white font-bold' : 'hover:text-[#182F28]'
            }`}
          >
            <span>1. Datos Personales</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg cursor-pointer shrink-0 ${
              step === 2 ? 'bg-[#274A3F] text-white font-bold' : 'hover:text-[#182F28]'
            }`}
          >
            <span>2. Cuidado & Dieta</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg cursor-pointer shrink-0 ${
              step === 3 ? 'bg-[#274A3F] text-white font-bold' : 'hover:text-[#182F28]'
            }`}
          >
            <span>3. Medicamentos (Opcional)</span>
            {medicamentos.length > 0 && (
              <span className="text-[10px] bg-[#DCB87F] text-[#182F28] px-1.5 py-0.2 rounded-full font-bold">
                {medicamentos.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setStep(4)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg cursor-pointer shrink-0 ${
              step === 4 ? 'bg-[#274A3F] text-white font-bold' : 'hover:text-[#182F28]'
            }`}
          >
            <span>4. Acudiente Responsable</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(5)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg cursor-pointer shrink-0 ${
              step === 5 ? 'bg-[#274A3F] text-white font-bold' : 'hover:text-[#182F28]'
            }`}
          >
            <span>5. Dotación & Entregas</span>
            <span className="text-[10px] bg-[#DCB87F] text-[#182F28] px-1.5 py-0.2 rounded-full font-bold">
              {itemsDotacion.filter((i) => i.incluido).length}
            </span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* STEP 1: DATOS PERSONALES */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Foto Opcional del Residente */}
              <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] flex items-center gap-4">
                <div className="relative">
                  {fotoPreview ? (
                    <img
                      src={fotoPreview}
                      alt="Vista previa residente"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#274A3F] shadow-xs"
                    />
                  ) : (
                    (() => {
                      const ini = obtenerIniciales(formData.nombres, formData.apellidos);
                      if (formData.nombres.trim() || formData.apellidos.trim()) {
                        return (
                          <div className="w-16 h-16 rounded-2xl bg-[#182F28] text-[#DCB87F] border border-[#DCB87F]/40 font-serif font-bold text-xl flex items-center justify-center shrink-0 shadow-inner">
                            {ini}
                          </div>
                        );
                      }
                      return (
                        <div className="w-16 h-16 rounded-2xl bg-[#E8E4D9] flex items-center justify-center text-[#7A745F] border border-[#DEDBD1]">
                          <Camera className="w-7 h-7 text-[#9A917A]" />
                        </div>
                      );
                    })()
                  )}
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Foto del Residente <span className="text-[#7A745F] font-normal">(Opcional)</span>
                  </label>
                  <p className="text-[11px] text-[#7A745F] mb-2">
                    Foto tipo documento o carné para la ficha médica e institucional.
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 bg-white hover:bg-[#ECE7DB] border border-[#DEDBD1] rounded-xl text-xs font-semibold text-[#182F28] cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-2xs">
                      <Camera className="w-3.5 h-3.5 text-[#274A3F]" />
                      <span>{fotoPreview ? 'Cambiar Foto' : 'Seleccionar Archivo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {fotoPreview && (
                      <button
                        type="button"
                        onClick={() => setFotoPreview(undefined)}
                        className="px-2.5 py-1.5 text-xs text-[#A4453A] hover:bg-[#FBE8E6] rounded-xl transition-colors cursor-pointer"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Blanca Leonor"
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Gómez de Restrepo"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Tipo Doc.
                  </label>
                  <select
                    value={formData.tipoIdentificacion}
                    onChange={(e) => setFormData({ ...formData, tipoIdentificacion: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
                  >
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="PA">Pasaporte</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 24.312.890"
                    value={formData.identificacion}
                    onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Fecha Nacimiento
                  </label>
                  <input
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Género
                  </label>
                  <select
                    value={formData.genero}
                    onChange={(e) => setFormData({ ...formData, genero: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
                  >
                    <option value="F">Femenino</option>
                    <option value="M">Masculino</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Grupo Sanguíneo
                  </label>
                  <select
                    value={formData.tipoSangre}
                    onChange={(e) => setFormData({ ...formData, tipoSangre: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Entidad de Salud (EPS)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Sanitas EPS"
                    value={formData.eps}
                    onChange={(e) => setFormData({ ...formData, eps: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Prepagada / Plan Complementario
                  </label>
                  <input
                    type="text"
                    placeholder="Opcional: Colmédica, Colsanitas..."
                    value={formData.planComplementario}
                    onChange={(e) => setFormData({ ...formData, planComplementario: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CUIDADO Y DIETA */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Habitación Asignada *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 104, 201..."
                    value={formData.habitacion}
                    onChange={(e) => setFormData({ ...formData, habitacion: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Cama / Unidad
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 104-A"
                    value={formData.cama}
                    onChange={(e) => setFormData({ ...formData, cama: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#274A3F]" />
                    <span>Fecha de Ingreso *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaIngreso}
                    onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Estado del Residente *
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
                  >
                    <option value="Activo">Activo (En sede)</option>
                    <option value="En Observación">En Observación</option>
                    <option value="Hospitalizado">Hospitalizado (Externo)</option>
                    <option value="Egresado">Egresado / Alta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Nivel de Movilidad
                  </label>
                  <select
                    value={formData.nivelMovilidad}
                    onChange={(e) => setFormData({ ...formData, nivelMovilidad: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
                  >
                    <option value="Independiente">Independiente</option>
                    <option value="Asistencia Leve">Asistencia Leve</option>
                    <option value="Asistencia Moderada">Asistencia Moderada</option>
                    <option value="Dependiente Total">Dependiente Total (Silla/Cama)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Tipo de Dieta Prescrita
                  </label>
                  <select
                    value={formData.tipoDieta}
                    onChange={(e) => setFormData({ ...formData, tipoDieta: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
                  >
                    <option value="Normal / General">Normal / General</option>
                    <option value="Hiposódica">Hiposódica (Baja en sal)</option>
                    <option value="Diabética">Diabética / Control Glucemia</option>
                    <option value="Blanda">Blanda / Fácil Masticación</option>
                    <option value="Licuada / Papilla">Licuada / Papilla</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#182F28] mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#A4453A]" />
                  <span>Alergias o Alertas Clínicas Relevantes</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Ej. Alérgica a Penicilina. Riesgo de caídas nocturnas. Hipertensión..."
                  value={formData.alertasClinicas}
                  onChange={(e) => setFormData({ ...formData, alertasClinicas: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F] focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* STEP 3: MEDICAMENTOS Y FARMACOTERAPIA (OPCIONAL) */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-[#F2F8F5] rounded-2xl border border-[#BDE0D0] flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#DFF3E7] text-[#1E7A4C] flex items-center justify-center shrink-0 mt-0.5">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#182F28]">
                    Plan Farmacoterapéutico Inicial <span className="text-[#5C6058] font-normal">(Opcional)</span>
                  </h4>
                  <p className="text-xs text-[#5C6058] mt-0.5">
                    Puede registrar los medicamentos, dosis, frecuencia y fecha límite prescritos si dispone de ellos en la admisión.
                  </p>
                </div>
              </div>

              {/* Formulario para agregar medicamento */}
              <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-mono font-bold uppercase text-[#7A745F]">
                    Agregar Medicamento
                  </h5>
                  <span className="text-[11px] text-[#7A745F]">
                    Todos los campos con (*) son requeridos para agregar
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#182F28] mb-1">
                      Medicamento *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Losartán 50mg, Enoxaparina..."
                      value={nuevoMed.medicamento}
                      onChange={(e) => setNuevoMed({ ...nuevoMed, medicamento: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs focus:outline-none focus:border-[#B3803F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#182F28] mb-1">
                      Cantidad / Dosis *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 1 tableta, 10 ml, 500 mg..."
                      value={nuevoMed.cantidad}
                      onChange={(e) => setNuevoMed({ ...nuevoMed, cantidad: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs focus:outline-none focus:border-[#B3803F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#182F28] mb-1">
                      Frecuencia *
                    </label>
                    <input
                      type="text"
                      list="frecuencias-sugeridas-reg"
                      placeholder="Ej. Cada 8 horas, En el desayuno..."
                      value={nuevoMed.frecuencia}
                      onChange={(e) => setNuevoMed({ ...nuevoMed, frecuencia: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs focus:outline-none focus:border-[#B3803F]"
                    />
                    <datalist id="frecuencias-sugeridas-reg">
                      <option value="Cada 8 horas" />
                      <option value="Cada 12 horas" />
                      <option value="Cada 24 horas (Mañana)" />
                      <option value="Cada 24 horas (Noche)" />
                      <option value="Con el desayuno" />
                      <option value="Antes de dormir" />
                      <option value="Según necesidad / SOS" />
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#182F28] mb-1">
                      Hasta qué fecha <span className="text-[#7A745F] font-normal">(Vacío = Continuo)</span>
                    </label>
                    <input
                      type="date"
                      value={nuevoMed.fechaFin}
                      onChange={(e) => setNuevoMed({ ...nuevoMed, fechaFin: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs focus:outline-none focus:border-[#B3803F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#182F28] mb-1">
                    Indicaciones Especiales <span className="text-[#7A745F] font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Tomar en ayunas con abundante agua..."
                    value={nuevoMed.indicaciones}
                    onChange={(e) => setNuevoMed({ ...nuevoMed, indicaciones: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs focus:outline-none focus:border-[#B3803F]"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAgregarMedicamento}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#274A3F] hover:bg-[#182F28] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Medicamento</span>
                  </button>
                </div>
              </div>

              {/* Lista de Medicamentos Agregados */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-[#7A745F]">
                    Medicamentos Agregados ({medicamentos.length})
                  </span>
                  {medicamentos.length === 0 && (
                    <span className="text-[11px] text-[#7A745F] italic">
                      Ninguno agregado aún. Puedes continuar sin ingresar medicamentos.
                    </span>
                  )}
                </div>

                {medicamentos.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-[#DEDBD1] flex items-center justify-between gap-3 shadow-2xs hover:border-[#1E7A4C]/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#DFF3E7] text-[#1E7A4C] flex items-center justify-center shrink-0">
                        <Pill className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#182F28] flex items-center gap-2">
                          <span>{m.medicamento}</span>
                          <span className="text-[10px] bg-[#FEF7EE] text-[#9A5B12] px-1.5 py-0.5 rounded font-medium border border-[#DCB87F]/30">
                            Dosis: {m.cantidad}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#5C6058] flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#068591]" />
                            {m.frecuencia}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#B3803F]" />
                            Hasta: {m.fechaFin ? m.fechaFin : 'Continuo'}
                          </span>
                        </div>
                        {m.indicaciones && (
                          <div className="text-[10px] text-[#7A745F] italic mt-0.5">
                            {m.indicaciones}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleEliminarMedicamento(idx)}
                      className="w-7 h-7 rounded-lg bg-[#FBE8E6] text-[#A4453A] hover:bg-[#f7d6d3] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title="Eliminar medicamento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: VINCULACIÓN DE ACUDIENTE */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-[#FEF7EE] border border-[#DCB87F] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <HeartHandshake className="w-5 h-5 text-[#B3803F]" />
                  <span className="text-xs font-bold text-[#182F28]">
                    Registrar familiar responsable en este momento
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.incluirAcudiente}
                  onChange={(e) => setFormData({ ...formData, incluirAcudiente: e.target.checked })}
                  className="w-4 h-4 text-[#274A3F] rounded accent-[#274A3F] cursor-pointer"
                />
              </div>

              {formData.incluirAcudiente && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#182F28] mb-1">
                        Nombres Familiar *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Claudia Patricia"
                        value={formData.acudienteNombres}
                        onChange={(e) => setFormData({ ...formData, acudienteNombres: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#182F28] mb-1">
                        Apellidos Familiar
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Restrepo Gómez"
                        value={formData.acudienteApellidos}
                        onChange={(e) => setFormData({ ...formData, acudienteApellidos: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#182F28] mb-1">
                        Documento Acudiente
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. 52.489.120"
                        value={formData.acudienteIdentificacion}
                        onChange={(e) => setFormData({ ...formData, acudienteIdentificacion: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#182F28] mb-1">
                        Parentesco
                      </label>
                      <select
                        value={formData.acudienteParentesco}
                        onChange={(e) => setFormData({ ...formData, acudienteParentesco: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
                      >
                        <option value="Hijo/a">Hijo / Hija</option>
                        <option value="Cónyuge">Cónyuge / Esposo(a)</option>
                        <option value="Hermano/a">Hermano / Hermana</option>
                        <option value="Nieto/a">Nieto / Nieta</option>
                        <option value="Sobrino/a">Sobrino / Sobrina</option>
                        <option value="Apoderado Legal">Apoderado Legal</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#182F28] mb-1">
                        Teléfono / WhatsApp *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. 310 845 9921"
                        value={formData.acudienteTelefono}
                        onChange={(e) => setFormData({ ...formData, acudienteTelefono: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#182F28] mb-1">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        placeholder="claudia@gmail.com"
                        value={formData.acudienteEmail}
                        onChange={(e) => setFormData({ ...formData, acudienteEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-sm focus:outline-none focus:border-[#B3803F]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: DOTACIÓN Y ELEMENTOS DE INGRESO */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-[#FEF7EE] rounded-2xl border border-[#DCB87F]/40 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#DCB87F]/30 text-[#9A5B12] flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#182F28]">
                    Control de Dotación y Elementos Entregados al Residente
                  </h4>
                  <p className="text-xs text-[#5C6058] mt-0.5 leading-relaxed">
                    Personalice la lista de elementos entregados al residente. Puede <strong>excluir</strong> artículos
                    desmarcando la casilla, <strong>aumentar cantidades</strong> o <strong>agregar nuevos artículos</strong> personalizados.
                    Los artículos con periodicidad tendrán alertas visuales de recambio automático en la ficha.
                  </p>
                </div>
              </div>

              {/* Agregar artículo adicional o ad-hoc */}
              <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] space-y-3">
                <span className="text-xs font-bold text-[#182F28] uppercase font-mono block">
                  + Agregar Artículo Extra o Personalizado
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-bold text-[#5C6058] mb-1">Nombre Artículo</label>
                    <input
                      type="text"
                      placeholder="Ej. Almohada extra, Cojín antireflujo"
                      value={nuevoItemDotacion.nombreElemento}
                      onChange={(e) => setNuevoItemDotacion({ ...nuevoItemDotacion, nombreElemento: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs text-[#182F28] focus:outline-none focus:border-[#182F28]"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-[#5C6058] mb-1">Categoría</label>
                    <select
                      value={nuevoItemDotacion.categoria}
                      onChange={(e) => setNuevoItemDotacion({ ...nuevoItemDotacion, categoria: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs text-[#182F28] focus:outline-none focus:border-[#182F28]"
                    >
                      <option value="Lencería y Ropa de Cama">Lencería</option>
                      <option value="Aseo y Cuidado Personal">Aseo Personal</option>
                      <option value="Menaje">Menaje</option>
                      <option value="Ayudas Técnicas">Ayudas Técnicas</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#5C6058] mb-1">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      value={nuevoItemDotacion.cantidad}
                      onChange={(e) => setNuevoItemDotacion({ ...nuevoItemDotacion, cantidad: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs text-[#182F28] focus:outline-none focus:border-[#182F28]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#5C6058] mb-1">Periodicidad</label>
                    <select
                      value={nuevoItemDotacion.frecuenciaCambioMeses ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseInt(e.target.value);
                        setNuevoItemDotacion({ ...nuevoItemDotacion, frecuenciaCambioMeses: val });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-white text-xs text-[#182F28] focus:outline-none focus:border-[#182F28]"
                    >
                      <option value="">Única vez</option>
                      <option value="6">6 meses</option>
                      <option value="12">12 meses</option>
                      <option value="24">24 meses</option>
                    </select>
                  </div>
                  <div className="sm:col-span-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (!nuevoItemDotacion.nombreElemento.trim()) {
                          alert('Ingrese el nombre del artículo.');
                          return;
                        }
                        setItemsDotacion((prev) => [
                          ...prev,
                          {
                            nombreElemento: nuevoItemDotacion.nombreElemento.trim(),
                            categoria: nuevoItemDotacion.categoria,
                            cantidad: nuevoItemDotacion.cantidad,
                            frecuenciaCambioMeses: nuevoItemDotacion.frecuenciaCambioMeses,
                            condicionEntrega: 'Nuevo',
                            notas: 'Artículo adicional agregado durante admisión',
                            incluido: true
                          }
                        ]);
                        setNuevoItemDotacion({
                          nombreElemento: '',
                          categoria: 'Lencería y Ropa de Cama',
                          cantidad: 1,
                          frecuenciaCambioMeses: 12
                        });
                      }}
                      className="w-full py-2 bg-[#182F28] hover:bg-[#274A3F] text-white text-xs font-bold rounded-xl flex items-center justify-center cursor-pointer"
                      title="Agregar a la lista"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Lista editable de dotación sugerida */}
              <div className="border border-[#DEDBD1] rounded-2xl overflow-hidden bg-white">
                <div className="p-3 bg-[#F7F6F2] border-b border-[#DEDBD1] flex items-center justify-between text-xs font-bold text-[#182F28]">
                  <span>Artículos Propuestos para Entrega Física</span>
                  <span className="font-mono text-[#7A745F]">
                    {itemsDotacion.filter((i) => i.incluido).length} de {itemsDotacion.length} incluidos
                  </span>
                </div>

                <div className="divide-y divide-[#DEDBD1]/60 max-h-[300px] overflow-y-auto">
                  {itemsDotacion.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                        item.incluido ? 'bg-white' : 'bg-gray-50/70 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={item.incluido}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setItemsDotacion((prev) =>
                              prev.map((it, i) => (i === idx ? { ...it, incluido: checked } : it))
                            );
                          }}
                          className="w-4 h-4 rounded border-[#DEDBD1] text-[#182F28] focus:ring-[#182F28] cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#182F28]">
                              {item.nombreElemento}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DCB87F]/30 text-[#694819]">
                              {item.categoria}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-[#7A745F] mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#B3803F]" />
                              {item.frecuenciaCambioMeses
                                ? `Recambio cada ${item.frecuenciaCambioMeses} meses (calculado automáticamente)`
                                : 'Entrega única (sin ciclo de recambio)'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <label className="text-xs text-[#5C6058] font-bold">Cant:</label>
                        <input
                          type="number"
                          min="1"
                          disabled={!item.incluido}
                          value={item.cantidad}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setItemsDotacion((prev) =>
                              prev.map((it, i) => (i === idx ? { ...it, cantidad: val } : it))
                            );
                          }}
                          className="w-16 px-2 py-1 rounded-lg border border-[#DEDBD1] text-xs font-bold text-center focus:outline-none focus:border-[#182F28]"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            setItemsDotacion((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar de la lista"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-[#DEDBD1] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#5C6058] hover:bg-[#F7F6F2] transition-colors cursor-pointer"
              >
                Anterior
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsRegisterResidentOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#5C6058] hover:bg-[#F7F6F2] transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              {step < 5 ? (
                <button
                  type="button"
                  onClick={() => setStep((step + 1) as any)}
                  className="px-5 py-2.5 bg-[#274A3F] hover:bg-[#182F28] text-white font-bold rounded-xl text-sm shadow-xs transition-all cursor-pointer"
                >
                  Continuar
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white font-bold rounded-xl text-sm shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando en Base de Datos...' : 'Completar Admisión & Dotación'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
