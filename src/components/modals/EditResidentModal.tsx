import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { X, Save, User, Bed, HeartPulse, ShieldAlert, Camera } from 'lucide-react';
import { Residente } from '../../types';

export const EditResidentModal: React.FC = () => {
  const {
    editingResidente,
    setEditingResidente,
    isEditResidenteOpen,
    setIsEditResidenteOpen,
    actualizarResidente
  } = useAdmin();

  const [formData, setFormData] = useState<Partial<Residente>>({});
  const [fotoPreview, setFotoPreview] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingResidente) {
      setFormData({
        nombres: editingResidente.nombres,
        apellidos: editingResidente.apellidos,
        tipoIdentificacion: editingResidente.tipoIdentificacion,
        identificacion: editingResidente.identificacion,
        fechaNacimiento: editingResidente.fechaNacimiento,
        genero: editingResidente.genero,
        habitacion: editingResidente.habitacion,
        cama: editingResidente.cama,
        eps: editingResidente.eps,
        planComplementario: editingResidente.planComplementario || '',
        tipoSangre: editingResidente.tipoSangre,
        nivelMovilidad: editingResidente.nivelMovilidad,
        tipoDieta: editingResidente.tipoDieta,
        alertasClinicas: editingResidente.alertasClinicas || '',
        estado: editingResidente.estado,
        fotoUrl: editingResidente.fotoUrl
      });
      setFotoPreview(editingResidente.fotoUrl);
    }
  }, [editingResidente]);

  if (!isEditResidenteOpen || !editingResidente) return null;

  const handleClose = () => {
    setIsEditResidenteOpen(false);
    setEditingResidente(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await actualizarResidente(editingResidente.id, {
        ...formData,
        fotoUrl: fotoPreview
      });
      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-6 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B3803F]/30 flex items-center justify-center text-[#DCB87F]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                Editar Información del Residente
              </h3>
              <p className="text-xs text-[#DCB87F]">
                {editingResidente.codigoExpediente} • {editingResidente.nombreCompleto}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#CFC9B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Foto Opcional del Residente */}
          <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] flex items-center gap-4">
            <div className="relative">
              {fotoPreview ? (
                <img
                  src={fotoPreview}
                  alt={editingResidente.nombreCompleto}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#B3803F] shadow-xs"
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
                Actualice la foto de perfil o carné de identificación.
              </p>
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 bg-white hover:bg-[#ECE7DB] border border-[#DEDBD1] rounded-xl text-xs font-semibold text-[#182F28] cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-2xs">
                  <Camera className="w-3.5 h-3.5 text-[#B3803F]" />
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

          {/* 1. Datos Personales */}
          <div>
            <h4 className="text-xs font-bold font-mono text-[#182F28] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#B3803F]" />
              1. Identificación y Datos Personales
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Nombres *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombres || ''}
                  onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Apellidos *
                </label>
                <input
                  type="text"
                  required
                  value={formData.apellidos || ''}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">
                    Tipo Doc
                  </label>
                  <select
                    value={formData.tipoIdentificacion || 'CC'}
                    onChange={(e) => setFormData({ ...formData, tipoIdentificacion: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
                  >
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="TI">TI</option>
                    <option value="PAS">PAS</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">
                    Número Identificación *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.identificacion || ''}
                    onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">
                    Fecha Nacimiento
                  </label>
                  <input
                    type="date"
                    value={formData.fechaNacimiento || ''}
                    onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4B4636] mb-1">
                    Género
                  </label>
                  <select
                    value={formData.genero || 'F'}
                    onChange={(e) => setFormData({ ...formData, genero: e.target.value as 'M' | 'F' | 'OTRO' })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
                  >
                    <option value="F">Femenino</option>
                    <option value="M">Masculino</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Ubicación y Cuidado */}
          <div className="pt-4 border-t border-[#DEDBD1]">
            <h4 className="text-xs font-bold font-mono text-[#182F28] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-[#B3803F]" />
              2. Habitación y Cuidados Asistenciales
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Habitación *
                </label>
                <input
                  type="text"
                  required
                  value={formData.habitacion || ''}
                  onChange={(e) => setFormData({ ...formData, habitacion: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Cama Asignada *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cama || ''}
                  onChange={(e) => setFormData({ ...formData, cama: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Estado Administrativo
                </label>
                <select
                  value={formData.estado || 'Activo'}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'Activo' | 'En Observación' | 'Hospitalizado' })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
                >
                  <option value="Activo">Activo</option>
                  <option value="En Observación">En Observación</option>
                  <option value="Hospitalizado">Hospitalizado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Nivel de Movilidad
                </label>
                <select
                  value={formData.nivelMovilidad || 'Independiente'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nivelMovilidad: e.target.value as
                        | 'Independiente'
                        | 'Asistencia Leve'
                        | 'Asistencia Moderada'
                        | 'Dependiente Total'
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
                >
                  <option value="Independiente">Independiente</option>
                  <option value="Asistencia Leve">Asistencia Leve</option>
                  <option value="Asistencia Moderada">Asistencia Moderada</option>
                  <option value="Dependiente Total">Dependiente Total</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Tipo de Dieta
                </label>
                <select
                  value={formData.tipoDieta || 'Normal / General'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipoDieta: e.target.value as
                        | 'Normal / General'
                        | 'Blanda'
                        | 'Hiposódica'
                        | 'Diabética'
                        | 'Licuada / Papilla'
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
                >
                  <option value="Normal / General">Normal / General</option>
                  <option value="Blanda">Blanda</option>
                  <option value="Hiposódica">Hiposódica</option>
                  <option value="Diabética">Diabética</option>
                  <option value="Licuada / Papilla">Licuada / Papilla</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Salud y Alertas */}
          <div className="pt-4 border-t border-[#DEDBD1]">
            <h4 className="text-xs font-bold font-mono text-[#182F28] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-[#B3803F]" />
              3. Cobertura de Salud y Alertas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  EPS
                </label>
                <input
                  type="text"
                  value={formData.eps || ''}
                  onChange={(e) => setFormData({ ...formData, eps: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Plan Complementario
                </label>
                <input
                  type="text"
                  value={formData.planComplementario || ''}
                  onChange={(e) => setFormData({ ...formData, planComplementario: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B4636] mb-1">
                  Grupo Sanguíneo
                </label>
                <select
                  value={formData.tipoSangre || 'O+'}
                  onChange={(e) => setFormData({ ...formData, tipoSangre: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none"
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

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-[#4B4636] mb-1 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#B3803F]" />
                  Alertas Clínicas y Alergias
                </label>
                <textarea
                  rows={2}
                  value={formData.alertasClinicas || ''}
                  onChange={(e) => setFormData({ ...formData, alertasClinicas: e.target.value })}
                  placeholder="Ej. Alergia a la penicilina, antecedentes de caídas, hipertenso controlado"
                  className="w-full px-3 py-2 rounded-xl border border-[#DEDBD1] bg-[#F7F6F2] text-xs font-semibold text-[#182F28] focus:outline-none focus:border-[#B3803F]"
                />
              </div>
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-[#DEDBD1] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-bold text-[#7A745F] hover:text-[#182F28] rounded-xl cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
