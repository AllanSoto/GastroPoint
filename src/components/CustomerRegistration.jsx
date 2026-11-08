import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { UserCheck, MapPin, Armchair, ShieldCheck, ArrowRight } from 'lucide-react';

export default function CustomerRegistration({ isOpen, onClose }) {
  const {
    tables,
    selectedTableId,
    selectedSeat,
    registerCustomer,
    currentUser,
    customers,
    loginAsCustomer,
    getTableById,
    businessType,
  } = useRestaurant();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    tableId: selectedTableId,
    seatPosition: selectedSeat,
  });

  if (!isOpen) return null;

  const currentTable = getTableById(formData.tableId);
  const availableSeats = Array.from({ length: currentTable?.seatsCount || 4 }, (_, i) => i + 1);
  const isCafe = businessType === 'cafeteria';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    registerCustomer({
      ...formData,
      seatPosition: Number(formData.seatPosition),
    });
    setFormData({ ...formData, name: '', email: '', phone: '' });
    onClose();
  };

  const handleQuickLogin = (cust) => {
    loginAsCustomer(cust);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl ${
                isCafe ? 'bg-teal-50 text-teal-800' : 'bg-amber-50 text-amber-800'
              }`}
            >
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">
                Registro y Selección de Comensal
              </h2>
              <p className="text-xs text-stone-500">
                Asigna tu nombre a una mesa y posición para ordenar y dividir cuentas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-800 p-2 rounded-lg hover:bg-stone-100 transition"
          >
            ✕
          </button>
        </div>

        {/* Cambio Rápido entre Comensales Registrados */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-stone-700">
            <span>Comensales registrados actualmente:</span>
            <span className="text-[11px] font-normal text-stone-500">Clic para activar</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {customers.map((cust) => {
              const t = getTableById(cust.tableId);
              const isCurrent = currentUser?.id === cust.id;
              return (
                <button
                  key={cust.id}
                  type="button"
                  onClick={() => handleQuickLogin(cust)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition flex items-center justify-between ${
                    isCurrent
                      ? 'bg-stone-900 border-stone-900 text-white font-semibold shadow-sm'
                      : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                  }`}
                >
                  <div className="truncate">
                    <div className="font-bold truncate">{cust.name}</div>
                    <div className={`text-[11px] ${isCurrent ? 'text-stone-300' : 'text-stone-500'}`}>
                      {t?.name} • Posición #{cust.seatPosition}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 ml-2 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Formulario de Nuevo Registro */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            O registra un nuevo comensal en la mesa:
          </h4>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Nombre Completo o Alias *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Sofía Ramírez"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="sofia@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                Teléfono
              </label>
              <input
                type="tel"
                placeholder="+52 55 0000 0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 transition"
              />
            </div>
          </div>

          {/* Selección de Mesa y Posición */}
          <div className="pt-3 border-t border-stone-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Mesa Asignada
                </label>
                <select
                  value={formData.tableId}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      tableId: e.target.value,
                      seatPosition: 1,
                    });
                  }}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.zone}) - {t.seatsCount} Posiciones
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Posición / Asiento en Mesa
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {availableSeats.map((seatNum) => {
                    const isSelected = Number(formData.seatPosition) === seatNum;
                    return (
                      <button
                        key={seatNum}
                        type="button"
                        onClick={() => setFormData({ ...formData, seatPosition: seatNum })}
                        className={`flex-1 min-w-[52px] py-2 rounded-xl text-xs font-bold border transition flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? isCafe
                              ? 'bg-teal-800 text-white border-teal-800 shadow-sm'
                              : 'bg-amber-800 text-white border-amber-800 shadow-sm'
                            : 'bg-stone-50 text-stone-700 border-stone-300 hover:border-stone-500'
                        }`}
                      >
                        <Armchair className="w-3.5 h-3.5" />
                        <span>Pos. #{seatNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <span>
                Los platillos ordenados quedarán registrados en <strong>{currentTable?.name} — Posición #{formData.seatPosition}</strong> para cocina, meseros y facturación.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 text-white rounded-xl text-xs font-bold shadow-sm transition ${
                isCafe ? 'bg-teal-800 hover:bg-teal-900' : 'bg-amber-800 hover:bg-amber-900'
              }`}
            >
              Registrar en Posición #{formData.seatPosition}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
