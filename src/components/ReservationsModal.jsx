import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Armchair,
  CheckCircle2,
  XCircle,
  UserCheck,
  Sparkles,
  Phone,
  MessageSquare,
} from 'lucide-react';

export default function ReservationsModal({ isOpen, onClose, preselectedTableId = null, isEmbedded = false }) {
  const {
    tables,
    zones,
    reservations,
    addReservation,
    cancelReservation,
    checkInReservation,
    getTableAvailability,
    businessType,
  } = useRestaurant();

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    date: todayStr,
    time: '19:30',
    guestsCount: 4,
    selectedZone: 'Todas',
    tableId: preselectedTableId || tables[0]?.id || 'M-1',
    notes: '',
  });

  const isCafe = businessType === 'cafeteria';

  // Filtrar mesas sugeridas según el área y la capacidad para la cantidad de personas
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchZone =
        formData.selectedZone === 'Todas' || t.zone === formData.selectedZone;
      return matchZone;
    });
  }, [tables, formData.selectedZone]);

  if (!isOpen && !isEmbedded) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.tableId) return;

    addReservation({
      tableId: formData.tableId,
      customerName: formData.customerName,
      phone: formData.phone,
      email: formData.email,
      date: formData.date,
      time: formData.time,
      guestsCount: Number(formData.guestsCount),
      notes: formData.notes,
    });

    setFormData((prev) => ({
      ...prev,
      customerName: '',
      phone: '',
      email: '',
      notes: '',
    }));

    if (!isEmbedded && onClose) {
      onClose();
    }
  };

  const activeReservations = reservations.filter((r) => r.status === 'confirmada');

  const content = (
    <div
      className={`bg-white border border-stone-200/90 rounded-3xl w-full p-5 sm:p-8 shadow-xl space-y-6 ${
        isEmbedded ? '' : 'max-w-5xl my-auto max-h-[92vh] overflow-y-auto'
      }`}
    >
      {/* Cabecera */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3.5">
          <div
            className={`p-3 rounded-2xl text-white ${
              isCafe ? 'bg-teal-800' : 'bg-amber-800'
            }`}
          >
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-stone-900">
              Reservación de Mesas por Fecha, Hora y Personas
            </h2>
            <p className="text-xs text-stone-500">
              Agenda una mesa seleccionando el día, horario, cantidad de comensales y área del establecimiento
            </p>
          </div>
        </div>

        {!isEmbedded && (
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-800 p-2 rounded-xl hover:bg-stone-100"
          >
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Columna Izquierda: Formulario de Nueva Reservación (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            1. Datos del Cliente y Horario de Reserva
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Nombre de quien reserva *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Roberto Castañeda / Familia Mora"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                Teléfono / WhatsApp
              </label>
              <input
                type="tel"
                placeholder="+52 55 1234 5678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="cliente@correo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          {/* Selección de Fecha, Hora y Cantidad de Personas */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-800" />
                  <span>Fecha *</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-800" />
                  <span>Hora *</span>
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-800" />
                  <span>Personas *</span>
                </label>
                <select
                  value={formData.guestsCount}
                  onChange={(e) =>
                    setFormData({ ...formData, guestsCount: Number(e.target.value) })
                  }
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-900"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Persona' : 'Personas'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Horarios sugeridos rápidos */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-stone-500 font-medium mr-1">
                Horarios rápidos:
              </span>
              {['13:30', '14:30', '16:00', '19:30', '20:30', '21:30'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({ ...formData, time: t })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                    formData.time === t
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Selección de Área y Mesa */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-800" />
                <span>2. Selecciona el Área y la Mesa a Reservar:</span>
              </label>

              <div className="flex items-center gap-1 flex-wrap">
                {['Todas', ...zones].map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setFormData({ ...formData, selectedZone: z })}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                      formData.selectedZone === z
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {filteredTables.map((t) => {
                const isSelected = formData.tableId === t.id;
                const avail = getTableAvailability(t.id);
                const fitsGuests = t.seatsCount >= formData.guestsCount;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, tableId: t.id })}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? isCafe
                          ? 'bg-teal-800 text-white border-teal-800 shadow-sm'
                          : 'bg-amber-800 text-white border-amber-800 shadow-sm'
                        : 'bg-stone-50 border-stone-200 text-stone-800 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs">{t.name}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          isSelected
                            ? 'bg-black/25 text-white'
                            : avail === 'disponible'
                            ? 'bg-emerald-100 text-emerald-900'
                            : avail === 'reservada'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {avail}
                      </span>
                    </div>

                    <div
                      className={`text-[11px] mt-1 ${
                        isSelected ? 'text-white/85' : 'text-stone-500'
                      }`}
                    >
                      {t.zone} • {t.seatsCount} pos.
                    </div>

                    {!fitsGuests && (
                      <div
                        className={`text-[10px] mt-1 font-semibold ${
                          isSelected ? 'text-amber-200' : 'text-amber-700'
                        }`}
                      >
                        Capacidad: {t.seatsCount} asientos
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notas de Reservación */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Notas especiales (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Celebración de cumpleaños, silla alta para bebé, alergias..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-stone-900"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 ${
              isCafe ? 'bg-teal-800 hover:bg-teal-900' : 'bg-amber-800 hover:bg-amber-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>
              Confirmar Reservación ({formData.guestsCount} pers. • {formData.date} a las{' '}
              {formData.time})
            </span>
          </button>
        </form>

        {/* Columna Derecha: Lista de Reservaciones Activas (5 cols) */}
        <div className="lg:col-span-5 bg-stone-50 border border-stone-200/90 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-display font-bold text-base text-stone-900">
                Agenda de Mesas Reservadas
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200 tabular-nums">
                {activeReservations.length} activa(s)
              </span>
            </div>

            {activeReservations.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Calendar className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-xs font-semibold text-stone-600">
                  No hay mesas reservadas en este momento
                </p>
                <p className="text-[11px] text-stone-400">
                  Usa el formulario para programar una nueva reservación.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {activeReservations.map((res) => (
                  <div
                    key={res.id}
                    className="bg-white border border-stone-200/90 rounded-2xl p-4 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200 font-bold text-[11px]">
                            {res.tableName} • {res.zone}
                          </span>
                          <span className="text-[11px] font-bold text-stone-500 tabular-nums">
                            {res.guestsCount} personas
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-stone-900 mt-1.5">
                          {res.customerName}
                        </h4>
                        {res.phone && (
                          <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {res.phone}
                          </div>
                        )}
                      </div>

                      <div className="text-right tabular-nums bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200">
                        <span className="text-xs font-extrabold text-stone-900 block">
                          {res.time} hrs
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          {res.date}
                        </span>
                      </div>
                    </div>

                    {res.notes && (
                      <div className="text-[11px] text-amber-900 bg-amber-50/80 border border-amber-200/70 rounded-lg px-2.5 py-1.5">
                        Nota: "{res.notes}"
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => checkInReservation(res.id)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition"
                        title="Marcar llegada del cliente y asignarlo a la mesa"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Recibir en Mesa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => cancelReservation(res.id)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 border border-stone-200 text-xs font-semibold transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Liberar Mesa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {content}
    </div>
  );
}

