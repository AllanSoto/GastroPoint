import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import {
  UtensilsCrossed,
  Coffee,
  ChefHat,
  Users,
  Receipt,
  UserCheck,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  HelpCircle,
  UserPlus,
} from 'lucide-react';

export default function Navbar({ onOpenRegister, onOpenCart, onOpenWelcomePage }) {
  const {
    businessType,
    setBusinessType,
    currentRole,
    setCurrentRole,
    currentUser,
    orders,
    cart,
    resetDemoData,
    getTableById,
    selectedTableId,
    selectedSeat,
  } = useRestaurant();

  const [showInfo, setShowInfo] = useState(false);

  const pendingKitchenOrders = orders.filter(
    (o) => o.status === 'pendiente' || o.status === 'en_preparacion'
  ).length;

  const readyToServeOrders = orders.filter((o) => o.status === 'listo').length;

  const activeTable = getTableById(selectedTableId);
  const isCafe = businessType === 'cafeteria';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 text-stone-900 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          
          {/* Izquierda: Logo + Selector Compacto Restaurante / Cafetería */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              onClick={onOpenWelcomePage}
              className="flex items-center gap-2 cursor-pointer group"
              title="Ir a la portada de Registro de Clientes"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105 ${
                  isCafe ? 'bg-teal-800' : 'bg-amber-800'
                }`}
              >
                {isCafe ? (
                  <Coffee className="w-4 h-4" />
                ) : (
                  <UtensilsCrossed className="w-4 h-4" />
                )}
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-stone-900">
                GastroPoint
              </span>
            </div>

            {/* Switch Integrado Restaurante vs Cafetería */}
            <div className="hidden sm:flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200/80">
              <button
                type="button"
                onClick={() => setBusinessType('restaurante')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  !isCafe
                    ? 'bg-white text-amber-900 shadow-2xs border border-stone-200/60'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <UtensilsCrossed className="w-3 h-3" />
                <span>Restaurante</span>
              </button>
              <button
                type="button"
                onClick={() => setBusinessType('cafeteria')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  isCafe
                    ? 'bg-white text-teal-900 shadow-2xs border border-stone-200/60'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Coffee className="w-3 h-3" />
                <span>Cafetería</span>
              </button>
            </div>
          </div>

          {/* Centro: Los 4 Pasos del Flujo Principal (Sin Reservas aquí adentro) */}
          <nav className="flex items-center bg-stone-100/90 p-1 rounded-2xl border border-stone-200/80 gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setCurrentRole('cliente')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                currentRole === 'cliente'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>1. Mesas y Menú</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentRole('cocina')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                currentRole === 'cocina'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>2. Cocina (KDS)</span>
              {pendingKitchenOrders > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 text-[10px] font-extrabold rounded-full bg-amber-600 text-white tabular-nums">
                  {pendingKitchenOrders}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCurrentRole('mesero')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                currentRole === 'mesero'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>3. Mesero</span>
              {readyToServeOrders > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 text-[10px] font-extrabold rounded-full bg-emerald-600 text-white tabular-nums">
                  {readyToServeOrders}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCurrentRole('facturacion')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                currentRole === 'facturacion'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>4. Facturación</span>
            </button>
          </nav>

          {/* Derecha: Usuario Activo, Comanda y Controles */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenRegister}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs transition"
              title="Registrar nuevo cliente o cambiar de asiento"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[11px] shrink-0 ${
                  isCafe ? 'bg-teal-700' : 'bg-amber-700'
                }`}
              >
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div className="text-left hidden md:block">
                <div className="font-bold text-stone-800 leading-tight truncate max-w-[100px]">
                  {currentUser?.name || 'Cliente'}
                </div>
                <div className="text-[10px] text-stone-500 font-medium">
                  {activeTable?.name} • <span className="text-amber-800 font-bold">Pos. #{selectedSeat}</span>
                </div>
              </div>
              <UserPlus className="w-3.5 h-3.5 text-stone-400 hidden md:block" />
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition shadow-xs ${
                isCafe
                  ? 'bg-teal-800 hover:bg-teal-900'
                  : 'bg-amber-800 hover:bg-amber-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Comanda</span>
              {cart.length > 0 && (
                <span className="bg-white text-stone-900 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold tabular-nums">
                  {cart.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowInfo(true)}
              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
              title="Ver guía de uso"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={resetDemoData}
              className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-stone-100 rounded-xl transition"
              title="Restaurar datos de ejemplo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Modal de Guía del Sistema */}
      {showInfo && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-700" />
                <h3 className="font-display font-bold text-lg text-stone-900">
                  ¿Cómo funciona GastroPoint?
                </h3>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="text-stone-400 hover:text-stone-700 text-sm px-2 py-1 rounded-lg hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-stone-600">
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex gap-3.5">
                <span className="w-6 h-6 rounded-full bg-amber-800 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-stone-900 block font-bold">
                    Mesas, Posiciones y Menú
                  </strong>
                  Selecciona la mesa, elige la <strong>Posición</strong> del cliente y solicita platillos del menú. Desde el panel de mesas también puedes gestionar <strong>Áreas</strong> y <strong>Reservaciones</strong>.
                </div>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex gap-3.5">
                <span className="w-6 h-6 rounded-full bg-amber-800 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-stone-900 block font-bold">
                    Cocina (KDS)
                  </strong>
                  El cocinero recibe la orden viendo exactamente la <strong>Mesa</strong> y la <strong>Posición</strong> que solicitó cada platillo.
                </div>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex gap-3.5">
                <span className="w-6 h-6 rounded-full bg-amber-800 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-stone-900 block font-bold">
                    Mesero
                  </strong>
                  El mesero recibe alertas de los platillos listos para entregarlos en el asiento exacto.
                </div>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex gap-3.5">
                <span className="w-6 h-6 rounded-full bg-amber-800 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <strong className="text-stone-900 block font-bold">
                    Facturación
                  </strong>
                  Todo se monta en la factura mostrando Mesa y Posición, permitiendo <strong>unificar</strong> o <strong>separar</strong> las deudas e imprimir el ticket.
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  setShowInfo(false);
                  onOpenWelcomePage();
                }}
                className="flex-1 py-2.5 px-4 border border-stone-300 hover:bg-stone-100 font-semibold text-stone-700 rounded-xl text-xs transition"
              >
                Ir a Portada de Registro
              </button>
              <button
                onClick={() => setShowInfo(false)}
                className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 font-bold text-white rounded-xl text-xs transition"
              >
                Continuar en el Sistema
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
