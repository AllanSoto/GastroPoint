import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Armchair, CheckCircle2, ChefHat, Calendar, Users } from 'lucide-react';

export default function InteractiveTable2D() {
  const {
    selectedTableId,
    selectedSeat,
    setSelectedSeat,
    getTableById,
    getTableAvailability,
    reservations,
    orders,
    customers,
    businessType,
  } = useRestaurant();

  const table = getTableById(selectedTableId);
  if (!table) return null;

  const isCafe = businessType === 'cafeteria';
  const seats = Array.from({ length: table.seatsCount }, (_, i) => i + 1);
  const availStatus = getTableAvailability(table.id);
  const activeRes = reservations.find(
    (r) => r.tableId === table.id && r.status === 'confirmada'
  );

  const getSeatData = (seatNum) => {
    const customer = customers.find(
      (c) => c.tableId === table.id && Number(c.seatPosition) === seatNum
    );
    const seatOrders = orders.filter(
      (o) => o.tableId === table.id && Number(o.seatPosition) === seatNum && o.status !== 'cobrado'
    );
    const total = seatOrders.reduce((acc, o) => acc + o.price, 0);
    const hasReady = seatOrders.some((o) => o.status === 'listo');
    const hasCooking = seatOrders.some(
      (o) => o.status === 'pendiente' || o.status === 'en_preparacion'
    );

    return {
      customer,
      orders: seatOrders,
      total,
      hasReady,
      hasCooking,
    };
  };

  // Posicionar sillas visualmente alrededor de la mesa
  const getSeatPositionStyle = (index, total, shape) => {
    if (shape === 'bar') {
      const step = 100 / (total + 1);
      return {
        left: `${step * (index + 1)}%`,
        bottom: '15%',
        transform: 'translateX(-50%)',
      };
    }

    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radiusX = shape === 'rectangle' ? 38 : 34;
    const radiusY = shape === 'rectangle' ? 33 : 34;
    const left = 50 + radiusX * Math.cos(angle);
    const top = 50 + radiusY * Math.sin(angle);

    return {
      left: `${left}%`,
      top: `${top}%`,
      transform: 'translate(-50%, -50%)',
    };
  };

  return (
    <div className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-bold text-stone-900">
              Plano 2D: {table.name}
            </h3>
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
          <p className="text-xs text-stone-500 mt-0.5">
            {table.zone} • Selecciona una silla alrededor de la mesa
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${
            isCafe
              ? 'bg-teal-50 border-teal-200 text-teal-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          Pos. #{selectedSeat}
        </span>
      </div>

      {/* Si tiene reserva confirmada, mostrar aviso en el plano */}
      {availStatus === 'reservada' && activeRes && (
        <div className="mt-3 px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between text-xs text-purple-950">
          <span className="font-bold flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 text-purple-700 shrink-0" />
            Reserva: {activeRes.customerName}
          </span>
          <span className="font-semibold text-[11px] shrink-0 flex items-center gap-1">
            <Users className="w-3 h-3" /> {activeRes.guestsCount}p • {activeRes.time}
          </span>
        </div>
      )}

      {/* Lienzo Arquitectónico 2D de la Mesa */}
      <div className="relative w-full h-72 my-3 bg-[#F6F4F0] rounded-2xl border border-stone-200/80 overflow-hidden flex items-center justify-center">
        {/* Retícula sutil */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#A8A29E 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />

        {/* Tablero de la Mesa Central */}
        <div
          className={`relative z-10 flex flex-col items-center justify-center border-2 shadow-md transition-all px-2 text-center ${
            table.shape === 'round'
              ? 'w-28 h-28 sm:w-32 sm:h-32 rounded-full'
              : table.shape === 'rectangle'
              ? 'w-44 h-24 sm:w-52 sm:h-28 rounded-3xl'
              : table.shape === 'bar'
              ? 'w-3/4 h-14 rounded-2xl -top-12'
              : 'w-28 h-28 sm:w-32 sm:h-32 rounded-2xl'
          } ${
            availStatus === 'reservada'
              ? 'bg-purple-100/70 border-purple-300'
              : 'bg-[#EDE8E0] border-stone-300'
          }`}
        >
          <span className="font-display font-bold text-xs text-stone-800 tracking-wide truncate max-w-full">
            {table.name}
          </span>
          <span className="text-[10px] text-stone-500 font-medium truncate max-w-full">
            {table.zone}
          </span>
        </div>

        {/* Sillas / Posiciones Alrededor */}
        {seats.map((seatNum, idx) => {
          const isSelected = selectedSeat === seatNum;
          const info = getSeatData(seatNum);
          const posStyle = getSeatPositionStyle(idx, seats.length, table.shape);

          return (
            <button
              key={seatNum}
              type="button"
              onClick={() => setSelectedSeat(seatNum)}
              style={posStyle}
              className={`absolute z-20 flex flex-col items-center justify-center px-2.5 py-1.5 rounded-2xl border transition-all duration-200 min-w-[74px] ${
                isSelected
                  ? isCafe
                    ? 'bg-teal-800 text-white border-teal-900 shadow-md scale-105'
                    : 'bg-amber-800 text-white border-amber-900 shadow-md scale-105'
                  : info.orders.length > 0
                  ? 'bg-white text-stone-900 border-stone-300 shadow-sm hover:border-stone-500'
                  : 'bg-white/90 text-stone-600 border-stone-200/90 hover:border-stone-400 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-1 text-xs font-bold">
                <Armchair className="w-3.5 h-3.5" />
                <span>Pos. #{seatNum}</span>
              </div>

              <span
                className={`text-[10px] font-medium truncate max-w-[64px] leading-tight mt-0.5 ${
                  isSelected ? 'text-white/90' : 'text-stone-500'
                }`}
              >
                {info.customer ? info.customer.name.split(' ')[0] : 'Disponible'}
              </span>

              {info.total > 0 && (
                <span
                  className={`mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold tabular-nums ${
                    isSelected
                      ? 'bg-black/25 text-white'
                      : 'bg-stone-100 text-stone-800 border border-stone-200'
                  }`}
                >
                  ${info.total.toFixed(2)}
                </span>
              )}

              {/* Estado del pedido en ese asiento */}
              {info.hasReady && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm"
                  title="Platillo listo para entregar"
                >
                  <CheckCircle2 className="w-2.5 h-2.5" />
                </span>
              )}
              {!info.hasReady && info.hasCooking && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-sm"
                  title="Cocinando"
                >
                  <ChefHat className="w-2.5 h-2.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Pie con información del puesto activo */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
        {(() => {
          const activeInfo = getSeatData(selectedSeat);
          return (
            <>
              <span className="truncate">
                Asiento <strong>#{selectedSeat}</strong>:{' '}
                <strong className="text-stone-900">
                  {activeInfo.customer ? activeInfo.customer.name : 'Libre'}
                </strong>
              </span>
              <span className="font-bold text-stone-900 tabular-nums shrink-0">
                {activeInfo.orders.length} platillo(s) • ${activeInfo.total.toFixed(2)}
              </span>
            </>
          );
        })()}
      </div>
    </div>
  );
}
