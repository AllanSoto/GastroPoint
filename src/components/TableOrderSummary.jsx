import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import {
  ChefHat,
  CheckCircle2,
  Clock,
  Utensils,
  Armchair,
  Receipt,
  Flame,
} from 'lucide-react';

export default function TableOrderSummary({ onOpenBilling }) {
  const {
    selectedTableId,
    getTableById,
    orders,
    customers,
    businessType,
  } = useRestaurant();

  const currentTable = getTableById(selectedTableId);
  const isCafe = businessType === 'cafeteria';

  // Órdenes enviadas a cocina para la mesa seleccionada que aún no han sido cobradas
  const activeTableOrders = orders.filter(
    (o) => o.tableId === selectedTableId && o.status !== 'cobrado'
  );

  if (activeTableOrders.length === 0) return null;

  // Agrupar por posición
  const groupedBySeat = activeTableOrders.reduce((acc, ord) => {
    const seat = Number(ord.seatPosition) || 1;
    if (!acc[seat]) {
      const cust = customers.find(
        (c) => c.tableId === selectedTableId && Number(c.seatPosition) === seat
      );
      acc[seat] = {
        seatNumber: seat,
        customerName: cust?.name || ord.customerName || `Posición #${seat}`,
        items: [],
        subtotal: 0,
      };
    }
    acc[seat].items.push(ord);
    acc[seat].subtotal += ord.price;
    return acc;
  }, {});

  const totalTableConsumption = activeTableOrders.reduce((s, o) => s + o.price, 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pendiente':
        return {
          label: 'En Cola',
          className: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: Clock,
        };
      case 'en_preparacion':
        return {
          label: 'Cocinando',
          className: 'bg-orange-50 text-orange-800 border-orange-200',
          icon: Flame,
        };
      case 'listo':
        return {
          label: 'Listo p/ Servir',
          className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: CheckCircle2,
        };
      case 'servido':
        return {
          label: 'Servido en Posición',
          className: 'bg-sky-50 text-sky-800 border-sky-200',
          icon: Utensils,
        };
      default:
        return {
          label: status,
          className: 'bg-stone-100 text-stone-700 border-stone-200',
          icon: Clock,
        };
    }
  };

  return (
    <div className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              isCafe ? 'bg-teal-50 text-teal-800' : 'bg-amber-50 text-amber-800'
            }`}
          >
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base sm:text-lg font-bold text-stone-900">
                Estado en Vivo de Pedidos en {currentTable?.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-800 border border-stone-200 tabular-nums">
                {activeTableOrders.length} platillo(s)
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Seguimiento en tiempo real de cada platillo solicitado según su posición en la mesa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right tabular-nums">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">
              Acumulado Mesa
            </span>
            <span className="text-base font-extrabold text-stone-900">
              ${totalTableConsumption.toFixed(2)}
            </span>
          </div>

          <button
            onClick={onOpenBilling}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition ${
              isCafe ? 'bg-teal-800 hover:bg-teal-900' : 'bg-stone-900 hover:bg-stone-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Unificar o Separar Cuenta</span>
          </button>
        </div>
      </div>

      {/* Tarjetas por Posición de la Mesa */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(groupedBySeat).map((group) => (
          <div
            key={group.seatNumber}
            className="bg-stone-50/80 border border-stone-200/90 rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-stone-900 text-white text-xs font-bold">
                  <Armchair className="w-3 h-3" />
                  Posición #{group.seatNumber}
                </span>
                <span className="text-xs font-bold text-stone-800 truncate max-w-[120px]">
                  {group.customerName}
                </span>
              </div>
              <span className="text-xs font-extrabold text-stone-900 tabular-nums">
                ${group.subtotal.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2">
              {group.items.map((item) => {
                const badge = getStatusBadge(item.status);
                const Icon = badge.icon;
                return (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-white border border-stone-200/80 flex items-center justify-between gap-2 text-xs shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-stone-900 block truncate">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-stone-500 tabular-nums">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${badge.className}`}
                    >
                      <Icon className="w-3 h-3" />
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

