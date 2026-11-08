import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import {
  UtensilsCrossed,
  Coffee,
  UserCheck,
  Armchair,
  ChefHat,
  Receipt,
  ArrowRight,
  MapPin,
  Calendar,
} from 'lucide-react';

export default function WelcomeRegistrationPage({ onComplete, onOpenReservations }) {
  const {
    businessType,
    setBusinessType,
    tables,
    registerCustomer,
    customers,
    loginAsCustomer,
    getTableById,
    reservations,
  } = useRestaurant();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    tableId: 'M-1',
    seatPosition: 3,
  });

  const selectedTable = getTableById(formData.tableId);
  const seats = Array.from({ length: selectedTable?.seatsCount || 4 }, (_, i) => i + 1);
  const isCafe = businessType === 'cafeteria';
  const activeReservationsCount = reservations.filter(
    (r) => r.status === 'confirmada'
  ).length;

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    registerCustomer(formData);
    onComplete();
  };

  const handleQuickDemoCustomer = (cust) => {
    loginAsCustomer(cust);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-stone-900 flex flex-col justify-between p-4 sm:p-8 lg:p-12">
      <div className="max-w-6xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Columna Izquierda: Propuesta de Valor y Acceso Rápido */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm text-stone-700 text-xs font-semibold">
            <span className={`w-2 h-2 rounded-full ${isCafe ? 'bg-teal-700' : 'bg-amber-700'}`} />
            <span>Experiencia Digital para Restaurantes y Cafeterías</span>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold text-stone-900 tracking-tight leading-[1.15]">
              Regístrate en tu mesa, elige tu asiento y ordena a tu gusto.
            </h1>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Con <strong>GastroPoint</strong> cada comensal registra su posición en la mesa para que cocina y meseros entreguen cada platillo en el lugar exacto y la factura pueda unificarse o dividirse sin esfuerzo.
            </p>
          </div>

          {/* 3 Pilares del Flujo */}
          <div className="space-y-3 pt-1">
            <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex items-start gap-3.5">
              <div className={`p-2.5 rounded-xl shrink-0 ${isCafe ? 'bg-teal-50 text-teal-800' : 'bg-amber-50 text-amber-800'}`}>
                <Armchair className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">
                  1. Mesas y Posiciones Enumeradas
                </h3>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Visualiza todas las mesas disponibles y selecciona tu asiento exacto (Posición #1, #2, #3...) antes de pedir.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex items-start gap-3.5">
              <div className={`p-2.5 rounded-xl shrink-0 ${isCafe ? 'bg-teal-50 text-teal-800' : 'bg-amber-50 text-amber-800'}`}>
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">
                  2. Conexión en Vivo con Cocina y Meseros
                </h3>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  La comanda llega a cocina indicando en qué mesa y posición está cada platillo solicitado para un servicio impecable.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex items-start gap-3.5">
              <div className={`p-2.5 rounded-xl shrink-0 ${isCafe ? 'bg-teal-50 text-teal-800' : 'bg-amber-50 text-amber-800'}`}>
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">
                  3. Facturación Unificada o Separada
                </h3>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Todo se monta en la factura detallando Mesa y Posición, permitiendo pagar toda la mesa junta o separar las cuentas por cliente.
                </p>
              </div>
            </div>
          </div>

          {/* Botón Independiente para Reservar una Mesa para otra Fecha / Hora */}
          {onOpenReservations && (
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-700" />
                  <span>¿Deseas programar una Reservación?</span>
                </h4>
                <p className="text-[11px] text-purple-800 mt-0.5">
                  Agenda una mesa por fecha, hora y cantidad de personas ({activeReservationsCount} activas)
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenReservations}
                className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shrink-0 transition shadow-xs"
              >
                Reservar Mesa
              </button>
            </div>
          )}

          {/* Perfiles de Prueba Rápidos */}
          <div className="p-4 rounded-2xl bg-stone-200/50 border border-stone-300/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700">
                Ingresar con clientes de prueba ya sentados:
              </span>
              <span className="text-[11px] text-stone-500">Acceso en 1 clic</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {customers.slice(0, 4).map((c) => {
                const t = getTableById(c.tableId);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleQuickDemoCustomer(c)}
                    className="p-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200/90 shadow-sm text-left text-xs transition flex items-center justify-between group"
                  >
                    <div className="truncate pr-2">
                      <div className="font-bold text-stone-900 group-hover:text-amber-800 transition truncate">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {t?.name} • <span className="font-semibold text-stone-700">Posición #{c.seatPosition}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 shrink-0 transition" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta Principal de Registro */}
        <div className="lg:col-span-7 bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-9 shadow-xl shadow-stone-900/5 space-y-6">
          
          {/* Selector de Ambiente: Restaurante o Cafetería */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
              Elige la modalidad del establecimiento:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBusinessType('restaurante')}
                className={`p-3.5 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                  !isCafe
                    ? 'bg-amber-50/70 border-amber-800 text-stone-900 shadow-sm'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl ${
                    !isCafe ? 'bg-amber-800 text-white' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-stone-900">Restaurante</div>
                  <div className="text-[11px] text-stone-500">Gourmet, Cortes y Vinos</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBusinessType('cafeteria')}
                className={`p-3.5 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                  isCafe
                    ? 'bg-teal-50/70 border-teal-800 text-stone-900 shadow-sm'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl ${
                    isCafe ? 'bg-teal-800 text-white' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-stone-900">Cafetería</div>
                  <div className="text-[11px] text-stone-500">Especialidad, Panadería y Brunch</div>
                </div>
              </button>
            </div>
          </div>

          {/* Formulario de Registro */}
          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Valeria Montes"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Correo Electrónico (Para factura)
                </label>
                <input
                  type="email"
                  placeholder="valeria@correo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Teléfono / Contacto
                </label>
                <input
                  type="tel"
                  placeholder="+52 55 0000 0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 transition"
                />
              </div>
            </div>

            {/* Selección de Mesa y Posición */}
            <div className="pt-3 border-t border-stone-200 space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-800" />
                  <span>Paso 1: Selecciona tu Mesa</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {tables.map((t) => {
                    const isTableSel = formData.tableId === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, tableId: t.id, seatPosition: 1 })}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          isTableSel
                            ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        <div className="text-xs font-bold">{t.name}</div>
                        <div
                          className={`text-[11px] ${
                            isTableSel ? 'text-stone-300' : 'text-stone-500'
                          }`}
                        >
                          {t.zone} • {t.seatsCount} pos.
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-bold text-stone-700 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Armchair className="w-3.5 h-3.5 text-amber-800" />
                    <span>Paso 2: Elige tu Posición en {selectedTable?.name}</span>
                  </span>
                  <span className="text-[11px] font-medium text-stone-500">
                    Asientos numerados del 1 al {selectedTable?.seatsCount}
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {seats.map((seatNum) => {
                    const isSeatSel = Number(formData.seatPosition) === seatNum;
                    const existingCust = customers.find(
                      (c) => c.tableId === formData.tableId && Number(c.seatPosition) === seatNum
                    );
                    return (
                      <button
                        key={seatNum}
                        type="button"
                        onClick={() => setFormData({ ...formData, seatPosition: seatNum })}
                        className={`p-2.5 rounded-xl border transition flex flex-col items-center justify-center gap-0.5 ${
                          isSeatSel
                            ? isCafe
                              ? 'bg-teal-800 text-white border-teal-800 shadow-sm'
                              : 'bg-amber-800 text-white border-amber-800 shadow-sm'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        <Armchair className="w-4 h-4" />
                        <span className="text-xs font-bold">Posición #{seatNum}</span>
                        <span
                          className={`text-[10px] truncate max-w-full ${
                            isSeatSel ? 'text-white/85' : 'text-stone-500'
                          }`}
                        >
                          {existingCust ? existingCust.name.split(' ')[0] : 'Disponible'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className={`flex-1 py-3.5 px-6 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 ${
                  isCafe
                    ? 'bg-teal-800 hover:bg-teal-900'
                    : 'bg-amber-800 hover:bg-amber-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Completar Registro y Ver Menú</span>
              </button>

              <button
                type="button"
                onClick={onComplete}
                className="py-3.5 px-5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 font-semibold text-xs rounded-xl transition"
              >
                Explorar Sistema Directamente
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
