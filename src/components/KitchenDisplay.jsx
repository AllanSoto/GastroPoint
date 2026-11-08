import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import {
  ChefHat,
  Clock,
  Armchair,
  CheckCircle,
  PlayCircle,
  Utensils,
  AlertTriangle,
  Flame,
} from 'lucide-react';

export default function KitchenDisplay() {
  const { orders, updateOrderStatus } = useRestaurant();
  const [filterStatus, setFilterStatus] = useState('activos');

  const filteredOrders = orders.filter((order) => {
    if (order.status === 'cobrado') return false;
    if (filterStatus === 'activos') {
      return (
        order.status === 'pendiente' ||
        order.status === 'en_preparacion' ||
        order.status === 'listo'
      );
    }
    if (filterStatus === 'todos') return true;
    return order.status === filterStatus;
  });

  const getElapsedMinutes = (dateString) => {
    const elapsedMs = Date.now() - new Date(dateString).getTime();
    return Math.max(1, Math.floor(elapsedMs / 60000));
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pendiente':
        return {
          label: 'En Cola',
          pillClass: 'bg-amber-50 text-amber-900 border-amber-200',
          topBarClass: 'border-t-4 border-t-amber-500',
          icon: Clock,
        };
      case 'en_preparacion':
        return {
          label: 'En Preparación',
          pillClass: 'bg-orange-50 text-orange-900 border-orange-200',
          topBarClass: 'border-t-4 border-t-orange-600',
          icon: Flame,
        };
      case 'listo':
        return {
          label: 'Listo p/ Servir',
          pillClass: 'bg-emerald-50 text-emerald-900 border-emerald-200',
          topBarClass: 'border-t-4 border-t-emerald-600',
          icon: CheckCircle,
        };
      case 'servido':
        return {
          label: 'Servido en Mesa',
          pillClass: 'bg-sky-50 text-sky-900 border-sky-200',
          topBarClass: 'border-t-4 border-t-sky-600',
          icon: Utensils,
        };
      default:
        return {
          label: status,
          pillClass: 'bg-stone-100 text-stone-700 border-stone-200',
          topBarClass: 'border-t-4 border-t-stone-400',
          icon: Clock,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera KDS */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-stone-900 rounded-2xl text-white shadow-xs">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-xl font-bold text-stone-900">
                Monitor de Cocina (KDS)
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200 font-bold tabular-nums">
                {filteredOrders.length} comandas
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Cada tarjeta muestra la <strong>Mesa</strong> y la <strong>Posición exacta del asiento</strong> que solicitó el platillo
            </p>
          </div>
        </div>

        {/* Filtros de Estado */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'activos', label: 'Activos en Cocina' },
            { id: 'pendiente', label: 'En Cola' },
            { id: 'en_preparacion', label: 'Cocinando' },
            { id: 'listo', label: 'Listos p/ Mesero' },
            { id: 'todos', label: 'Todos (Incl. Servidos)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterStatus === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Tickets de Cocina */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredOrders.map((order) => {
          const cfg = getStatusConfig(order.status);
          const elapsed = getElapsedMinutes(order.createdAt);
          const isLate = elapsed >= 12 && order.status !== 'servido';

          return (
            <div
              key={order.id}
              className={`bg-white rounded-2xl border border-stone-200/90 ${cfg.topBarClass} flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all`}
            >
              {/* Encabezado del Ticket: MESA y POSICIÓN */}
              <div className="p-4 bg-stone-50/80 border-b border-stone-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-stone-900 text-white font-bold text-xs">
                    {order.tableName}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100/90 border border-amber-300 text-amber-950 font-extrabold text-xs">
                    <Armchair className="w-3.5 h-3.5 text-amber-800" />
                    Posición #{order.seatPosition}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md tabular-nums ${
                    isLate
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'text-stone-500 bg-white border border-stone-200/80'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>{elapsed} min</span>
                </div>
              </div>

              {/* Cuerpo del Ticket */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-stone-900 leading-snug">
                    {order.name}
                  </h3>
                  <div className="text-xs text-stone-500 mt-1">
                    Cliente: <strong className="text-stone-800">{order.customerName}</strong>
                  </div>

                  {/* Notas de preparación */}
                  {order.notes ? (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-amber-800">
                          Nota de preparación:
                        </span>
                        <span className="font-medium">"{order.notes}"</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2.5 text-[11px] text-stone-400 italic">
                      Sin modificaciones en receta
                    </div>
                  )}
                </div>

                {/* Pie de Ticket y Botón de Acción */}
                <div className="pt-3 border-t border-stone-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400 font-medium">Estado actual:</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${cfg.pillClass}`}
                    >
                      <cfg.icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>

                  <div>
                    {order.status === 'pendiente' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'en_preparacion')}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 font-bold text-white text-xs shadow-xs transition"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Iniciar Preparación</span>
                      </button>
                    )}

                    {order.status === 'en_preparacion' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'listo')}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 font-bold text-white text-xs shadow-xs transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Marcar Listo p/ Servir</span>
                      </button>
                    )}

                    {order.status === 'listo' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'servido')}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 font-bold text-white text-xs shadow-xs transition"
                      >
                        <Utensils className="w-4 h-4" />
                        <span>Entregar en Posición #{order.seatPosition}</span>
                      </button>
                    )}

                    {order.status === 'servido' && (
                      <div className="text-center py-1.5 text-xs text-sky-800 font-semibold bg-sky-50 border border-sky-100 rounded-xl">
                        ✓ Servido en {order.tableName} (Pos. #{order.seatPosition})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-700">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h3 className="font-display font-bold text-stone-900 text-lg">
            Sin órdenes pendientes en esta vista
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Todas las comandas están al día. Cuando un cliente o mesero envíe un pedido desde el menú, aparecerá aquí con su mesa y posición.
          </p>
        </div>
      )}
    </div>
  );
}
