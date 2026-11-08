import React, { useState, useMemo, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { printInvoiceTicket } from '../utils/printInvoice';
import confetti from 'canvas-confetti';
import {
  Receipt,
  Armchair,
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  CheckCircle2,
  Users,
  Divide,
  Layers,
  Percent,
  CheckSquare,
  History,
  ArrowRightLeft,
} from 'lucide-react';

export default function BillingModal({ isOpen, onClose, isEmbedded = false }) {
  const {
    tables,
    selectedTableId,
    setSelectedTableId,
    orders,
    customers,
    closeBillForTable,
    reassignOrderSeat,
    paidInvoices,
    getTableById,
    businessType,
  } = useRestaurant();

  // Todos los hooks al inicio
  const [billingMode, setBillingMode] = useState('unificada'); // 'unificada' | 'separada' | 'agrupar' | 'equitativa'
  const [activeSeatFilter, setActiveSeatFilter] = useState(null);
  const [groupedSeats, setGroupedSeats] = useState([]);
  const [tipPercentage, setTipPercentage] = useState(10);
  const [paymentMethod, setPaymentMethod] = useState('tarjeta');
  const [cashGiven, setCashGiven] = useState('');
  const [splitCount, setSplitCount] = useState(2);
  const [isSuccessPaid, setIsSuccessPaid] = useState(false);
  const [lastPaidInvoice, setLastPaidInvoice] = useState(null);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);

  const currentTable = getTableById(selectedTableId);
  const isCafe = businessType === 'cafeteria';
  const tableSeatsList = useMemo(
    () => Array.from({ length: currentTable?.seatsCount || 4 }, (_, i) => i + 1),
    [currentTable]
  );

  // Órdenes activas de la mesa seleccionada
  const tableOrders = useMemo(() => {
    return orders.filter((o) => o.tableId === selectedTableId && o.status !== 'cobrado');
  }, [orders, selectedTableId]);

  // Agrupar órdenes por Posición / Asiento
  const ordersBySeat = useMemo(() => {
    const grouped = {};
    tableOrders.forEach((ord) => {
      const seat = Number(ord.seatPosition) || 1;
      if (!grouped[seat]) {
        const cust = customers.find(
          (c) => c.tableId === selectedTableId && Number(c.seatPosition) === seat
        );
        grouped[seat] = {
          seatNumber: seat,
          customerName: cust?.name || ord.customerName || `Comensal Posición #${seat}`,
          items: [],
          subtotal: 0,
        };
      }
      grouped[seat].items.push(ord);
      grouped[seat].subtotal += ord.price;
    });
    return grouped;
  }, [tableOrders, selectedTableId, customers]);

  const availableSeatNumbers = useMemo(
    () => Object.keys(ordersBySeat).map(Number),
    [ordersBySeat]
  );

  // Sincronizar asiento seleccionado al cambiar de modo o de mesa
  useEffect(() => {
    if (billingMode === 'separada' && availableSeatNumbers.length > 0) {
      if (!activeSeatFilter || !availableSeatNumbers.includes(activeSeatFilter)) {
        setActiveSeatFilter(availableSeatNumbers[0]);
      }
    }
    if (
      billingMode === 'agrupar' &&
      availableSeatNumbers.length > 0 &&
      groupedSeats.length === 0
    ) {
      setGroupedSeats(availableSeatNumbers.slice(0, 2));
    }
  }, [billingMode, availableSeatNumbers, activeSeatFilter, groupedSeats.length]);

  // Subtotal según modalidad elegida
  const activeSubtotal = useMemo(() => {
    if (billingMode === 'separada' && activeSeatFilter && ordersBySeat[activeSeatFilter]) {
      return ordersBySeat[activeSeatFilter].subtotal;
    }
    if (billingMode === 'agrupar') {
      return groupedSeats.reduce(
        (sum, sNum) => sum + (ordersBySeat[sNum]?.subtotal || 0),
        0
      );
    }
    return tableOrders.reduce((sum, o) => sum + o.price, 0);
  }, [billingMode, activeSeatFilter, groupedSeats, ordersBySeat, tableOrders]);

  // Platillos que se muestran en el ticket según el modo
  const itemsToDisplayInReceipt = useMemo(() => {
    if (billingMode === 'separada' && activeSeatFilter && ordersBySeat[activeSeatFilter]) {
      return ordersBySeat[activeSeatFilter].items;
    }
    if (billingMode === 'agrupar') {
      return tableOrders.filter((o) => groupedSeats.includes(Number(o.seatPosition)));
    }
    return tableOrders;
  }, [billingMode, activeSeatFilter, groupedSeats, ordersBySeat, tableOrders]);

  const taxAmount = activeSubtotal * 0.16;
  const tipAmount = (activeSubtotal * tipPercentage) / 100;
  const activeTotalWithTaxAndTip = activeSubtotal + taxAmount + tipAmount;

  const currentPayable =
    billingMode === 'equitativa'
      ? activeTotalWithTaxAndTip / Math.max(1, splitCount)
      : activeTotalWithTaxAndTip;

  const cashGivenNum = parseFloat(cashGiven) || 0;
  const changeDue = Math.max(0, cashGivenNum - currentPayable);

  if (!isOpen && !isEmbedded) return null;

  const currentModeLabel =
    billingMode === 'separada'
      ? `Cuenta Individual (Posición #${activeSeatFilter})`
      : billingMode === 'agrupar'
      ? `Posiciones Unidas (#${groupedSeats.join(', #')})`
      : billingMode === 'equitativa'
      ? `División Equitativa (${splitCount} partes)`
      : 'Factura Unificada de Mesa';

  const toggleSeatInGroup = (seatNum) => {
    setGroupedSeats((prev) =>
      prev.includes(seatNum) ? prev.filter((s) => s !== seatNum) : [...prev, seatNum]
    );
  };

  const handleProcessPayment = () => {
    const meta = {
      tipPercentage,
      paymentMethod,
      payableAmount: currentPayable,
      cashGiven: cashGivenNum,
      changeDue,
      modeLabel: currentModeLabel,
    };

    let createdInv = null;
    if (billingMode === 'separada' && activeSeatFilter) {
      createdInv = closeBillForTable(selectedTableId, [activeSeatFilter], meta);
    } else if (billingMode === 'agrupar' && groupedSeats.length > 0) {
      createdInv = closeBillForTable(selectedTableId, groupedSeats, meta);
      setGroupedSeats([]);
    } else {
      createdInv = closeBillForTable(selectedTableId, null, meta);
    }

    if (createdInv) {
      setLastPaidInvoice(createdInv);
    }

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignorar si no está disponible
    }

    setIsSuccessPaid(true);
  };

  // Imprimir factura actual (antes de pagar o pre-cuenta)
  const handlePrintCurrentSelection = () => {
    printInvoiceTicket({
      businessType,
      invoiceId: `PRE-${Date.now().toString().slice(-4)}`,
      tableName: currentTable.name,
      zone: currentTable.zone,
      modeLabel: currentModeLabel,
      items: itemsToDisplayInReceipt,
      subtotal: activeSubtotal,
      tax: taxAmount,
      tip: tipAmount,
      tipPercentage,
      total: currentPayable,
      paymentMethod,
      cashGiven: cashGivenNum,
      changeDue,
      paidStatus: 'PRE-CUENTA / POR LIQUIDAR',
    });
  };

  // Imprimir una factura ya pagada (recién cobrada o del historial)
  const handlePrintSavedInvoice = (inv) => {
    if (!inv) return;
    printInvoiceTicket({
      businessType,
      invoiceId: inv.id,
      tableName: inv.tableName,
      zone: inv.zone,
      modeLabel: inv.modeLabel,
      items: inv.items || [],
      subtotal: inv.subtotal,
      tax: inv.tax,
      tip: inv.tip,
      tipPercentage: inv.tipPercentage ?? 10,
      total: inv.total,
      paymentMethod: inv.paymentMethod,
      cashGiven: inv.cashGiven || 0,
      changeDue: inv.changeDue || 0,
      paidStatus: 'PAGADO',
    });
  };

  const handleResetModal = () => {
    setIsSuccessPaid(false);
    setLastPaidInvoice(null);
    setShowReceiptPreview(false);
    setActiveSeatFilter(null);
    setGroupedSeats([]);
    setCashGiven('');
  };

  const content = (
    <div
      className={`bg-white border border-stone-200/90 rounded-3xl w-full p-5 sm:p-8 shadow-xl space-y-6 ${
        isEmbedded ? '' : 'max-w-5xl my-auto max-h-[92vh] flex flex-col justify-between'
      }`}
    >
      {/* Cabecera de Facturación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 shrink-0">
        <div className="flex items-center gap-3.5">
          <div
            className={`p-3 rounded-2xl text-white ${
              isCafe ? 'bg-teal-800' : 'bg-stone-900'
            }`}
          >
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-stone-900">
              Factura de Mesa y Gestión de Deudas por Posición
            </h2>
            <p className="text-xs text-stone-500">
              Unifica toda la mesa o separa las deudas por posición según lo solicite el cliente
            </p>
          </div>
        </div>

        {/* Selector de Mesa */}
        <div className="flex items-center gap-2.5">
          <label className="text-xs font-bold text-stone-600">Mesa a facturar:</label>
          <select
            value={selectedTableId}
            onChange={(e) => {
              setSelectedTableId(e.target.value);
              handleResetModal();
            }}
            className="bg-stone-50 border border-stone-300 text-stone-900 text-xs font-bold rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-stone-900"
          >
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.zone})
              </option>
            ))}
          </select>

          {!isEmbedded && (
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-800 p-2 hover:bg-stone-100 rounded-xl"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Confirmación de Pago Exitoso */}
      {isSuccessPaid ? (
        <div className="text-center py-8 space-y-5 my-auto">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-stone-900">
              ¡Pago Registrado Correctamente!
            </h3>
            <p className="text-sm text-stone-600 mt-1 max-w-md mx-auto">
              Se procesó el cobro de <strong>{lastPaidInvoice?.modeLabel || currentTable.name}</strong> por{' '}
              <strong className="text-stone-900">${(lastPaidInvoice?.total || 0).toFixed(2)}</strong>.
              {tableOrders.length > 0
                ? ` Aún quedan ${tableOrders.length} platillo(s) pendientes por cobrar en otras posiciones de esta mesa.`
                : ' Todas las posiciones de esta mesa han quedado saldadas.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handlePrintSavedInvoice(lastPaidInvoice)}
              className="flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl text-xs font-bold transition border border-stone-300 shadow-2xs"
            >
              <Printer className="w-4 h-4 text-amber-800" />
              <span>Imprimir Comprobante Pagado</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleResetModal();
                if (!isEmbedded && tableOrders.length === 0) onClose();
              }}
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              {tableOrders.length > 0 ? 'Cobrar Resto de Posiciones' : 'Continuar'}
            </button>
          </div>
        </div>
      ) : tableOrders.length === 0 ? (
        <div className="text-center py-14 space-y-3 my-auto bg-stone-50/60 rounded-2xl border border-stone-200/80">
          <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="font-display font-bold text-stone-900 text-base">
            {currentTable.name} no tiene deudas pendientes
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Todas las posiciones de esta mesa han sido liquidadas o aún no tienen platillos registrados. Puedes cambiar de mesa en el selector superior.
          </p>
        </div>
      ) : (
        <div className="space-y-6 overflow-y-auto pr-1">
          
          {/* Selector de Modalidad de Cuenta */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
              ¿Cómo desea el cliente gestionar la factura de la mesa?
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Unificar Toda la Mesa */}
              <button
                type="button"
                onClick={() => setBillingMode('unificada')}
                className={`p-3.5 rounded-2xl border-2 text-left transition flex items-start gap-3 ${
                  billingMode === 'unificada'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400'
                }`}
              >
                <Layers className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-xs sm:text-sm">1. Unificar Todo</div>
                  <div
                    className={`text-[11px] leading-snug mt-0.5 ${
                      billingMode === 'unificada' ? 'text-stone-300' : 'text-stone-500'
                    }`}
                  >
                    Toda la mesa en una sola factura general.
                  </div>
                </div>
              </button>

              {/* 2. Separar por Posición Individual */}
              <button
                type="button"
                onClick={() => setBillingMode('separada')}
                className={`p-3.5 rounded-2xl border-2 text-left transition flex items-start gap-3 ${
                  billingMode === 'separada'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400'
                }`}
              >
                <Armchair className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-xs sm:text-sm">2. Por Posición</div>
                  <div
                    className={`text-[11px] leading-snug mt-0.5 ${
                      billingMode === 'separada' ? 'text-stone-300' : 'text-stone-500'
                    }`}
                  >
                    Cada posición paga solo sus platillos.
                  </div>
                </div>
              </button>

              {/* 3. Agrupar Posiciones Específicas */}
              <button
                type="button"
                onClick={() => setBillingMode('agrupar')}
                className={`p-3.5 rounded-2xl border-2 text-left transition flex items-start gap-3 ${
                  billingMode === 'agrupar'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400'
                }`}
              >
                <CheckSquare className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-xs sm:text-sm">3. Unir Posiciones</div>
                  <div
                    className={`text-[11px] leading-snug mt-0.5 ${
                      billingMode === 'agrupar' ? 'text-stone-300' : 'text-stone-500'
                    }`}
                  >
                    Elige qué asientos juntar en una cuenta.
                  </div>
                </div>
              </button>

              {/* 4. Partes Iguales */}
              <button
                type="button"
                onClick={() => setBillingMode('equitativa')}
                className={`p-3.5 rounded-2xl border-2 text-left transition flex items-start gap-3 ${
                  billingMode === 'equitativa'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400'
                }`}
              >
                <Divide className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-xs sm:text-sm">4. Partes Iguales</div>
                  <div
                    className={`text-[11px] leading-snug mt-0.5 ${
                      billingMode === 'equitativa' ? 'text-stone-300' : 'text-stone-500'
                    }`}
                  >
                    Divide el total en partes exactas.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Panel de Selección de Posición (Modo 2: Separada) */}
          {billingMode === 'separada' && (
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                <span>Selecciona la posición de la mesa que desea pagar su cuenta:</span>
                <span className="text-stone-500 font-normal">
                  {availableSeatNumbers.length} posición(es) con consumo
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {Object.values(ordersBySeat).map((seatGroup) => {
                  const isSelected = activeSeatFilter === seatGroup.seatNumber;
                  return (
                    <button
                      key={seatGroup.seatNumber}
                      type="button"
                      onClick={() => setActiveSeatFilter(seatGroup.seatNumber)}
                      className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                        isSelected
                          ? isCafe
                            ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                            : 'bg-amber-800 text-white border-amber-800 shadow-xs'
                          : 'bg-white border-stone-200 text-stone-800 hover:border-stone-400'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1">
                          <Armchair className="w-3.5 h-3.5" />
                          <span>Posición #{seatGroup.seatNumber}</span>
                        </div>
                        <div
                          className={`text-[11px] font-medium truncate max-w-[130px] ${
                            isSelected ? 'text-white/90' : 'text-stone-500'
                          }`}
                        >
                          {seatGroup.customerName}
                        </div>
                      </div>

                      <div className="text-right tabular-nums">
                        <span className="text-sm font-extrabold block">
                          ${seatGroup.subtotal.toFixed(2)}
                        </span>
                        <span
                          className={`text-[10px] ${
                            isSelected ? 'text-white/80' : 'text-stone-400'
                          }`}
                        >
                          {seatGroup.items.length} platillo(s)
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Panel de Agrupación Personalizada (Modo 3: Unir Posiciones) */}
          {billingMode === 'agrupar' && (
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                <span>
                  Marca las posiciones que desean unificar su deuda en una misma factura:
                </span>
                <span className="text-amber-800">
                  {groupedSeats.length} seleccionada(s)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {Object.values(ordersBySeat).map((seatGroup) => {
                  const isChecked = groupedSeats.includes(seatGroup.seatNumber);
                  return (
                    <button
                      key={seatGroup.seatNumber}
                      type="button"
                      onClick={() => toggleSeatInGroup(seatGroup.seatNumber)}
                      className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                        isChecked
                          ? 'bg-amber-50 border-amber-800 text-stone-900 ring-1 ring-amber-800'
                          : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 accent-amber-800 rounded"
                        />
                        <div>
                          <div className="text-xs font-bold">
                            Posición #{seatGroup.seatNumber}
                          </div>
                          <div className="text-[11px] text-stone-500 truncate max-w-[115px]">
                            {seatGroup.customerName}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-stone-900 tabular-nums">
                        ${seatGroup.subtotal.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Panel de División Equitativa (Modo 4: Partes Iguales) */}
          {billingMode === 'equitativa' && (
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-amber-800" />
                <div>
                  <span className="text-xs font-bold text-stone-900 block">
                    ¿Entre cuántas personas se divide el total de la mesa?
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Cálculo exacto por comensal incluyendo impuestos y propina
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {[2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSplitCount(num)}
                    className={`w-9 h-9 rounded-xl font-bold text-xs border transition ${
                      splitCount === num
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cuerpo de la Factura: Desglose Izquierda + Resumen Financiero Derecha */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Columna Izquierda: Platillos con su MESA, POSICIÓN y opción de mover de posición */}
            <div className="lg:col-span-7 bg-stone-50/70 border border-stone-200/90 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                <span>Detalle por Mesa y Posición</span>
                <span>Mover Posición / Importe</span>
              </div>

              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {Object.values(ordersBySeat)
                  .filter((seatGroup) => {
                    if (billingMode === 'separada') {
                      return seatGroup.seatNumber === activeSeatFilter;
                    }
                    if (billingMode === 'agrupar') {
                      return groupedSeats.includes(seatGroup.seatNumber);
                    }
                    return true;
                  })
                  .map((seatGroup) => (
                    <div
                      key={seatGroup.seatNumber}
                      className="bg-white rounded-xl border border-stone-200/90 p-3.5 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100 flex-wrap gap-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                          <span className="px-2 py-0.5 rounded bg-stone-900 text-white text-[10px]">
                            {currentTable.name}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-200 text-[10px]">
                            Posición #{seatGroup.seatNumber}
                          </span>
                          <span className="text-stone-600 font-medium">
                            ({seatGroup.customerName})
                          </span>
                        </span>
                        <span className="text-xs font-extrabold text-stone-900 tabular-nums">
                          Subtotal Posición: ${seatGroup.subtotal.toFixed(2)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {seatGroup.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-2 text-xs py-1 text-stone-700"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-stone-900 block truncate">
                                {item.name}
                              </span>
                              {item.notes && (
                                <span className="text-[11px] text-stone-400 italic block">
                                  Nota: "{item.notes}"
                                </span>
                              )}
                            </div>

                            {/* Selector para cambiar el platillo a otra posición si el cliente lo pide */}
                            <div className="flex items-center gap-2 shrink-0">
                              <div
                                className="flex items-center gap-1 bg-stone-100 border border-stone-200 rounded-lg px-2 py-0.5 text-[10px] text-stone-600"
                                title="Reasignar este platillo a otra posición de la mesa"
                              >
                                <ArrowRightLeft className="w-2.5 h-2.5 text-stone-400" />
                                <select
                                  value={item.seatPosition}
                                  onChange={(e) =>
                                    reassignOrderSeat(item.id, Number(e.target.value))
                                  }
                                  className="bg-transparent font-bold text-stone-800 focus:outline-none cursor-pointer"
                                >
                                  {tableSeatsList.map((s) => (
                                    <option key={s} value={s}>
                                      Pos. #{s}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <span className="font-bold text-stone-900 tabular-nums w-16 text-right">
                                ${item.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Columna Derecha: Totales, Propina y Pago */}
            <div className="lg:col-span-5 bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              
              {/* Propina */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-amber-800" /> Propina voluntaria:
                  </span>
                  <span className="tabular-nums">${tipAmount.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTipPercentage(pct)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        tipPercentage === pct
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {pct === 0 ? '0%' : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desglose Fiscal */}
              <div className="space-y-2 pt-3 border-t border-stone-200 text-xs tabular-nums">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Subtotal de consumo:</span>
                  <span className="font-semibold text-stone-900">
                    ${activeSubtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-stone-600">
                  <span>IVA (16%):</span>
                  <span className="font-semibold text-stone-900">
                    ${taxAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-stone-600">
                  <span>Servicio / Propina ({tipPercentage}%):</span>
                  <span className="font-semibold text-stone-900">
                    ${tipAmount.toFixed(2)}
                  </span>
                </div>

                {billingMode === 'equitativa' && (
                  <div className="flex items-center justify-between text-amber-900 font-bold pt-2 border-t border-stone-200">
                    <span>Total por persona ({splitCount}):</span>
                    <span>${currentPayable.toFixed(2)} c/u</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2.5 border-t border-stone-300 text-base">
                  <span className="font-bold text-stone-900">Total a Pagar:</span>
                  <span className="text-xl font-extrabold text-stone-900">
                    ${currentPayable.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Método de Pago */}
              <div className="space-y-2.5 pt-3 border-t border-stone-200">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Método de pago:
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
                    { id: 'efectivo', label: 'Efectivo', icon: Banknote },
                    { id: 'qr', label: 'Transferencia', icon: QrCode },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-1 ${
                        paymentMethod === m.id
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <m.icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>

                {paymentMethod === 'efectivo' && (
                  <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2 text-xs tabular-nums">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600 font-medium">Efectivo recibido $:</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={cashGiven}
                        onChange={(e) => setCashGiven(e.target.value)}
                        className="w-28 bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1 text-right text-stone-900 font-bold focus:outline-none focus:border-stone-900"
                      />
                    </div>
                    {cashGivenNum > 0 && (
                      <div className="flex items-center justify-between text-emerald-800 font-bold pt-1.5 border-t border-stone-100">
                        <span>Cambio a entregar:</span>
                        <span>${changeDue.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Vista Previa del Ticket en Pantalla */}
          <div>
            <button
              type="button"
              onClick={() => setShowReceiptPreview(!showReceiptPreview)}
              className="text-xs text-stone-600 hover:text-stone-900 font-bold flex items-center gap-1.5 underline underline-offset-4"
            >
              <Printer className="w-3.5 h-3.5" />
              {showReceiptPreview
                ? 'Ocultar vista previa del ticket en pantalla'
                : 'Ver vista previa del ticket en pantalla (con Mesa y Posición)'}
            </button>

            {showReceiptPreview && (
              <div className="mt-4 p-6 bg-white text-stone-900 rounded-2xl shadow-md max-w-sm mx-auto font-mono text-xs border border-stone-300 space-y-3 tabular-nums">
                <div className="text-center space-y-1">
                  <h4 className="font-bold text-sm uppercase">
                    {isCafe ? 'GASTROPOINT CAFÉ & BRUNCH' : 'GASTROPOINT RESTAURANTE'}
                  </h4>
                  <p className="text-[10px] text-stone-500">RFC: GPO-240815-XYZ • TEL: 55-1234-5678</p>
                  <div className="border-b border-dashed border-stone-400 my-2" />
                </div>

                <div className="space-y-0.5 text-[11px]">
                  <div className="flex justify-between">
                    <span>FECHA: {new Date().toLocaleDateString()}</span>
                    <span>HORA: {new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="font-bold">
                    MESA: {currentTable.name} ({currentTable.zone})
                  </div>
                  <div className="font-bold">MODALIDAD: {currentModeLabel.toUpperCase()}</div>
                </div>

                <div className="border-b border-dashed border-stone-400 my-2" />

                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-[10px] text-stone-500">
                    <span>PLATILLO (MESA / POSICIÓN)</span>
                    <span>IMPORTE</span>
                  </div>

                  {itemsToDisplayInReceipt.map((ord) => (
                    <div key={ord.id} className="flex justify-between text-[11px]">
                      <span className="truncate max-w-[210px]">
                        1x {ord.name} ({currentTable.name}-Pos#{ord.seatPosition})
                      </span>
                      <span className="font-bold">${ord.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-b border-dashed border-stone-400 my-2" />

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>SUBTOTAL:</span>
                    <span>${activeSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (16%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PROPINA ({tipPercentage}%):</span>
                    <span>${tipAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-1 border-t border-stone-900">
                    <span>TOTAL:</span>
                    <span>${currentPayable.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botones Finales */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={handlePrintCurrentSelection}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-800 hover:bg-stone-100 text-xs font-bold transition shadow-2xs"
            >
              <Printer className="w-4 h-4 text-amber-800" />
              <span>Imprimir Ticket / Pre-Cuenta</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!isEmbedded && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:text-stone-900 text-xs font-semibold transition"
                >
                  Cancelar
                </button>
              )}

              <button
                type="button"
                disabled={billingMode === 'agrupar' && groupedSeats.length === 0}
                onClick={handleProcessPayment}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-40 ${
                  isCafe
                    ? 'bg-teal-800 hover:bg-teal-900'
                    : 'bg-amber-800 hover:bg-amber-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="tabular-nums">
                  {billingMode === 'separada' && activeSeatFilter
                    ? `Cobrar Posición #${activeSeatFilter} ($${currentPayable.toFixed(2)})`
                    : billingMode === 'agrupar'
                    ? `Cobrar Posiciones Unidas ($${currentPayable.toFixed(2)})`
                    : `Liquidar Factura ($${currentPayable.toFixed(2)})`}
                </span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Historial de Facturas Emitidas en el Turno con Botón de Reimpresión */}
      {paidInvoices && paidInvoices.length > 0 && (
        <div className="pt-5 border-t border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-amber-800" />
              <span>Facturas Cobradas en el Turno ({paidInvoices.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paidInvoices.slice(0, 6).map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/90 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{inv.id}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[10px]">
                      Pagado • {inv.paymentMethod.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-stone-700 font-medium truncate">
                    {inv.tableName} ({inv.zone}) — {inv.modeLabel}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    {inv.itemsCount} platillo(s) • {new Date(inv.paidAt).toLocaleTimeString()}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-sm font-extrabold text-stone-900 tabular-nums">
                    ${inv.total.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePrintSavedInvoice(inv)}
                    className="p-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 hover:text-stone-900 transition shadow-2xs"
                    title="Imprimir este comprobante de factura"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
