import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import {
  Bell,
  CheckCircle2,
  Armchair,
  Receipt,
  Utensils,
  PlusCircle,
  Calendar,
  Users,
} from 'lucide-react';

export default function WaiterView({ onOpenOrderModal, onOpenBilling }) {
  const {
    tables,
    orders,
    customers,
    reservations,
    getTableAvailability,
    checkInReservation,
    cancelReservation,
    updateOrderStatus,
    setSelectedTableId,
    setSelectedSeat,
    businessType,
  } = useRestaurant();

  const isCafe = businessType === 'cafeteria';
  const readyOrders = orders.filter((o) => o.status === 'listo');
  const inKitchenOrders = orders.filter(
    (o) => o.status === 'pendiente' || o.status === 'en_preparacion'
  );

  const handleDeliver = (orderId) => {
    updateOrderStatus(orderId, 'servido');
  };

  const handleTakeOrderAtTable = (tableId, seatNum = 1) => {
    setSelectedTableId(tableId);
    setSelectedSeat(seatNum);
    onOpenOrderModal();
  };

  const handleBillTable = (tableId) => {
    setSelectedTableId(tableId);
    onOpenBilling();
  };

  return (
    <div className="space-y-6">
      {/* Alerta Prioritaria de Platillos Listos para Servir */}
      {readyOrders.length > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-700 text-white shadow-xs">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-bold text-stone-900">
                    Platillos Listos para Entregar en Mesa
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-700 text-white font-bold tabular-nums">
                    {readyOrders.length}
                  </span>
                </div>
                <p className="text-xs text-stone-600">
                  Verifica la mesa y la posición indicada para entregar cada platillo directamente a su comensal:
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white border border-emerald-200/90 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-stone-900 text-white font-bold text-xs">
                      {ord.tableName}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-extrabold text-xs border border-emerald-200">
                      <Armchair className="w-3.5 h-3.5 text-emerald-700" />
                      Posición #{ord.seatPosition}
                    </span>
                  </div>

                  <h4 className="font-bold text-stone-900 text-base mt-2.5">{ord.name}</h4>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Comensal: <strong className="text-stone-800">{ord.customerName}</strong>
                  </div>

                  {ord.notes && (
                    <div className="text-[11px] text-amber-900 font-medium mt-2 bg-amber-50 p-2 rounded-lg border border-amber-200/80">
                      Nota: "{ord.notes}"
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDeliver(ord.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-700 hover:bg-emerald-800 font-bold text-white text-xs rounded-xl shadow-xs transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Entrega en Posición #{ord.seatPosition}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control General de Mesas para el Mesero */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <h2 className="font-display text-xl font-bold text-stone-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-800" />
              <span>Control de Salón y Servicio de Meseros</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Supervisa la disponibilidad de cada mesa, atiende reservaciones, toma pedidos por posición y abre cuentas
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-stone-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> {inKitchenOrders.length} en preparación
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> {readyOrders.length} por servir
            </span>
          </div>
        </div>

        {/* Grid de Mesas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tables.map((table) => {
            const tableOrders = orders.filter(
              (o) => o.tableId === table.id && o.status !== 'cobrado'
            );
            const tableReady = tableOrders.filter((o) => o.status === 'listo');
            const tableCooking = tableOrders.filter(
              (o) => o.status === 'pendiente' || o.status === 'en_preparacion'
            );
            const tableServed = tableOrders.filter((o) => o.status === 'servido');
            const tableDiners = customers.filter((c) => c.tableId === table.id);
            const tableTotal = tableOrders.reduce((sum, o) => sum + o.price, 0);
            const availStatus = getTableAvailability(table.id);
            const activeRes = reservations.find(
              (r) => r.tableId === table.id && r.status === 'confirmada'
            );

            return (
              <div
                key={table.id}
                className="bg-stone-50/70 border border-stone-200/90 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-stone-300 transition shadow-2xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-xl bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        M{table.number}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-stone-900 text-base">{table.name}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              availStatus === 'disponible'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : availStatus === 'reservada'
                                ? 'bg-purple-50 text-purple-900 border-purple-200'
                                : 'bg-amber-50 text-amber-900 border-amber-200'
                            }`}
                          >
                            {availStatus}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-500">
                          {table.zone} • {table.seatsCount} posiciones
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                        Consumo
                      </span>
                      <span className="text-sm font-extrabold text-stone-900 tabular-nums">
                        ${tableTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Si está reservada, mostrar datos de la reserva */}
                  {availStatus === 'reservada' && activeRes && (
                    <div className="mt-3 p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-purple-950 font-bold">
                        <span className="flex items-center gap-1 truncate">
                          <Calendar className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                          {activeRes.customerName}
                        </span>
                        <span className="tabular-nums">{activeRes.time} hrs</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-purple-800">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {activeRes.guestsCount} pers. • {activeRes.date}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => checkInReservation(activeRes.id)}
                            className="px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px]"
                          >
                            Recibir
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelReservation(activeRes.id)}
                            className="px-2 py-0.5 rounded bg-white text-stone-700 border border-purple-200 font-semibold text-[10px]"
                          >
                            Liberar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contadores por Estado */}
                  <div className="grid grid-cols-3 gap-2 mt-3.5 text-center text-[11px] font-bold">
                    <div className="bg-white p-2 rounded-xl border border-stone-200/80">
                      <span className="text-stone-400 block font-medium text-[10px]">Cocina</span>
                      <span className="text-amber-800 text-xs tabular-nums">{tableCooking.length}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-stone-200/80">
                      <span className="text-stone-400 block font-medium text-[10px]">Listos</span>
                      <span className="text-emerald-700 text-xs tabular-nums">{tableReady.length}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-stone-200/80">
                      <span className="text-stone-400 block font-medium text-[10px]">Servidos</span>
                      <span className="text-sky-700 text-xs tabular-nums">{tableServed.length}</span>
                    </div>
                  </div>

                  {/* Posiciones de la Mesa */}
                  <div className="mt-3.5 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">
                      Posiciones de la mesa (clic para ordenar):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from({ length: table.seatsCount }, (_, i) => i + 1).map((sNum) => {
                        const diner = tableDiners.find((d) => Number(d.seatPosition) === sNum);
                        const seatHasOrders = tableOrders.some(
                          (o) => Number(o.seatPosition) === sNum
                        );

                        return (
                          <button
                            key={sNum}
                            onClick={() => handleTakeOrderAtTable(table.id, sNum)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition flex items-center gap-1 ${
                              seatHasOrders
                                ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold'
                                : diner
                                ? 'bg-white border-stone-300 text-stone-800'
                                : 'bg-white/70 border-stone-200 text-stone-500 hover:text-stone-900'
                            }`}
                            title={`Agregar platillo a ${table.name} - Posición #${sNum}`}
                          >
                            <Armchair className="w-3 h-3" />
                            <span>Pos. #{sNum}</span>
                            {diner && (
                              <span className="opacity-75">({diner.name.split(' ')[0]})</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-200/80">
                  <button
                    onClick={() => handleTakeOrderAtTable(table.id, 1)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 text-xs font-bold transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-800" />
                    <span>Tomar Pedido</span>
                  </button>

                  <button
                    onClick={() => handleBillTable(table.id)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-white text-xs font-bold transition shadow-xs ${
                      isCafe
                        ? 'bg-teal-800 hover:bg-teal-900'
                        : 'bg-stone-900 hover:bg-stone-800'
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Ver Factura</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
