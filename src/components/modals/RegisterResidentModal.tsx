import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { X, UserPlus, HeartHandshake, Stethoscope, AlertTriangle, Camera } from 'lucide-react';

export const RegisterResidentModal: React.FC = () => {
  const { isRegisterResidentOpen, setIsRegisterResidentOpen, registrarResidente, activeSede } = useAdmin();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | undefined>(undefined);

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
        estado: 'Activo',
        fotoUrl: fotoPreview,
        acudientes: [],
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
        <div className="flex border-b border-[#DEDBD1] bg-[#F7F6F2] px-6 py-2.5 text-xs font-semibold text-[#5C6058]">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg cursor-pointer ${
              step === 1 ? 'bg-[#274A3F] text-white font-bold' : 'hover:text-[#182F28]'
            }`}
          >
            <span>1. Datos Personales</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg cursor-pointer ${
              step === 2 ? 'bg-[#274A3F] text-white font-bold' : 'hover:text-[#182F28]'
            }`}
          >
            <span>2. Cuidado & Dieta</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg cursor-pointer ${
              step === 3 ? 'bg-[#274A3F] text-white font-bold' : 'hover:text-[#182F28]'
            }`}
          >
            <span>3. Acudiente Responsable</span>
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
                    <div className="w-16 h-16 rounded-2xl bg-[#E8E4D9] flex items-center justify-center text-[#7A745F] border border-[#DEDBD1]">
                      <Camera className="w-7 h-7 text-[#9A917A]" />
                    </div>
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

          {/* STEP 3: VINCULACIÓN DE ACUDIENTE */}
          {step === 3 && (
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

              {step < 3 ? (
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
                  {isSubmitting ? 'Guardando en Base de Datos...' : 'Completar Admisión'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
