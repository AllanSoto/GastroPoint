import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import InteractiveTable2D from './InteractiveTable2D';
import {
  Armchair,
  CheckCircle2,
  Clock,
  ChefHat,
  Plus,
  Edit3,
  Calendar,
  MapPin,
  Users,
  UserCheck,
  XCircle,
} from 'lucide-react';

export default function TableSelector({ onOpenReservationModal }) {
  const {
    zones,
    addZone,
    renameZone,
    tables,
    addTable,
    updateTable,
    getTableAvailability,
    reservations,
    checkInReservation,
    cancelReservation,
    selectedTableId,
    setSelectedTableId,
    selectedSeat,
    setSelectedSeat,
    orders,
    customers,
    businessType,
  } = useRestaurant();

  const [activeZone, setActiveZone] = useState('Todas');
  const isCafe = businessType === 'cafeteria';

  // Modales locales para Gestión de Áreas y Mesas
  const [isAddZoneOpen, setIsAddZoneOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');

  const [isRenameZoneOpen, setIsRenameZoneOpen] = useState(false);
  const [zoneToRename, setZoneToRename] = useState('');
  const [renamedZoneValue, setRenamedZoneValue] = useState('');

  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [newTableData, setNewTableData] = useState({
    name: '',
    zone: zones[0] || 'Salón Principal',
    seatsCount: 4,
    shape: 'square',
    availability: 'disponible',
  });

  const [editingTable, setEditingTable] = useState(null);

  const allZoneTabs = ['Todas', ...zones];

  const filteredTables =
    activeZone === 'Todas' ? tables : tables.filter((t) => t.zone === activeZone);

  const getSeatInfo = (tableId, seatNum) => {
    const seatCustomer = customers.find(
      (c) => c.tableId === tableId && Number(c.seatPosition) === seatNum
    );

    const seatOrders = orders.filter(
      (o) => o.tableId === tableId && Number(o.seatPosition) === seatNum && o.status !== 'cobrado'
    );

    const hasReady = seatOrders.some((o) => o.status === 'listo');
    const hasCooking = seatOrders.some(
      (o) => o.status === 'pendiente' || o.status === 'en_preparacion'
    );
    const hasServed = seatOrders.length > 0 && seatOrders.every((o) => o.status === 'servido');

    let status = 'disponible';
    if (hasReady) status = 'listo';
    else if (hasCooking) status = 'cocinando';
    else if (hasServed) status = 'servido';
    else if (seatCustomer) status = 'ocupado';

    return {
      customer: seatCustomer,
      orderCount: seatOrders.length,
      status,
    };
  };

  // Handlers de Áreas
  const handleCreateZone = (e) => {
    e.preventDefault();
    if (addZone(newZoneName)) {
      setActiveZone(newZoneName.trim());
      setNewZoneName('');
      setIsAddZoneOpen(false);
    }
  };

  const handleRenameZoneSubmit = (e) => {
    e.preventDefault();
    if (renameZone(zoneToRename, renamedZoneValue)) {
      if (activeZone === zoneToRename) {
        setActiveZone(renamedZoneValue.trim());
      }
      setIsRenameZoneOpen(false);
    }
  };

  // Handlers de Mesas
  const handleOpenAddTable = () => {
    const nextNum = tables.length + 1;
    setNewTableData({
      name: `Mesa ${nextNum}`,
      zone: activeZone !== 'Todas' ? activeZone : zones[0] || 'Salón Principal',
      seatsCount: 4,
      shape: 'square',
      availability: 'disponible',
    });
    setIsAddTableOpen(true);
  };

  const handleCreateTableSubmit = (e) => {
    e.preventDefault();
    addTable(newTableData);
    setIsAddTableOpen(false);
  };

  const handleEditTableSubmit = (e) => {
    e.preventDefault();
    if (!editingTable) return;
    updateTable(editingTable.id, {
      name: editingTable.name,
      zone: editingTable.zone,
      seatsCount: Number(editingTable.seatsCount),
      shape: editingTable.shape,
      availability: editingTable.availability,
    });
    setEditingTable(null);
  };

  const getAvailabilityBadge = (availStatus) => {
    switch (availStatus) {
      case 'disponible':
        return {
          label: 'Disponible',
          className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dotClass: 'bg-emerald-600',
        };
      case 'reservada':
        return {
          label: 'Reservada',
          className: 'bg-purple-50 text-purple-900 border-purple-200',
          dotClass: 'bg-purple-600',
        };
      case 'ocupada':
      default:
        return {
          label: 'Ocupada',
          className: 'bg-amber-50 text-amber-900 border-amber-200',
          dotClass: 'bg-amber-600',
        };
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Selector de Mesas, Áreas y Posiciones (8 columnas en desktop) */}
        <div className="lg:col-span-8 bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
          
          {/* Encabezado y Acciones de Gestión de Mesas / Áreas / Reservas */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <h2 className="font-display text-lg font-bold text-stone-900">
                Áreas, Mesas y Posiciones Numeradas
              </h2>
              <p className="text-xs text-stone-500">
                Administra tus áreas, agrega o edita mesas, consulta disponibilidad y asigna pedidos por posición
              </p>
            </div>

            {/* Botones de Acción Rápida: Agregar Mesa, Agregar Área, Reservar */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleOpenAddTable}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-bold shadow-xs transition ${
                  isCafe ? 'bg-teal-800 hover:bg-teal-900' : 'bg-amber-800 hover:bg-amber-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Mesa</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddZoneOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs font-semibold transition"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-800" />
                <span>+ Área</span>
              </button>

              {onOpenReservationModal && (
                <button
                  type="button"
                  onClick={() => onOpenReservationModal(selectedTableId)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Reservar Mesa</span>
                </button>
              )}
            </div>
          </div>

          {/* Barra de Filtro por Área / Zona + Botón Renombrar Área */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {allZoneTabs.map((zone) => (
                <button
                  key={zone}
                  onClick={() => setActiveZone(zone)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    activeZone === zone
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>

            {activeZone !== 'Todas' && (
              <button
                type="button"
                onClick={() => {
                  setZoneToRename(activeZone);
                  setRenamedZoneValue(activeZone);
                  setIsRenameZoneOpen(true);
                }}
                className="flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 px-2.5 py-1 rounded-lg transition"
              >
                <Edit3 className="w-3 h-3" />
                <span>Renombrar área "{activeZone}"</span>
              </button>
            )}
          </div>

          {/* Grid de Mesas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTables.map((table) => {
              const isTableSelected = selectedTableId === table.id;
              const tableOrders = orders.filter(
                (o) => o.tableId === table.id && o.status !== 'cobrado'
              );
              const seats = Array.from({ length: table.seatsCount }, (_, i) => i + 1);
              const availStatus = getTableAvailability(table.id);
              const availBadge = getAvailabilityBadge(availStatus);

              // Buscar si tiene reservación activa confirmada
              const activeRes = reservations.find(
                (r) => r.tableId === table.id && r.status === 'confirmada'
              );

              return (
                <div
                  key={table.id}
                  className={`rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                    isTableSelected
                      ? isCafe
                        ? 'bg-teal-50/30 border-teal-800 ring-1 ring-teal-800/20 shadow-sm'
                        : 'bg-amber-50/30 border-amber-800 ring-1 ring-amber-800/20 shadow-sm'
                      : 'bg-stone-50/60 border-stone-200/90 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div>
                    {/* Cabecera de Mesa con Estado (Disponible / Reservada / Ocupada) y Botón Editar */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div
                        onClick={() => {
                          setSelectedTableId(table.id);
                          setSelectedSeat(1);
                        }}
                        className="flex items-center gap-2.5 cursor-pointer"
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition shrink-0 ${
                            isTableSelected
                              ? isCafe
                                ? 'bg-teal-800 text-white'
                                : 'bg-amber-800 text-white'
                              : 'bg-stone-200/80 text-stone-700'
                          }`}
                        >
                          M{table.number}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm text-stone-900">{table.name}</h3>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTable({
                                  ...table,
                                  availability: availStatus,
                                });
                              }}
                              className="p-1 text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 rounded-md transition"
                              title="Cambiar nombre de la mesa, área, capacidad o estado"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-[11px] text-stone-500 block">
                            {table.zone} • {table.seatsCount} posiciones
                          </span>
                        </div>
                      </div>

                      {/* Estado de la Mesa (Disponible / Reservada / Ocupada) */}
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${availBadge.className}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${availBadge.dotClass}`} />
                          {availBadge.label}
                        </span>

                        {tableOrders.length > 0 && (
                          <span className="text-[10px] font-semibold text-stone-500 tabular-nums">
                            {tableOrders.length} platillo(s)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Si la mesa está RESERVADA, mostrar tarjeta con los detalles de la reserva */}
                    {availStatus === 'reservada' && activeRes && (
                      <div className="mb-3 p-2.5 rounded-xl bg-purple-50/90 border border-purple-200 text-xs space-y-2">
                        <div className="flex items-center justify-between text-purple-950">
                          <span className="font-bold flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-purple-700" />
                            Reserva: {activeRes.customerName}
                          </span>
                          <span className="font-extrabold tabular-nums">
                            {activeRes.time} hrs
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-purple-800">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {activeRes.guestsCount} personas •{' '}
                            {activeRes.date}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => checkInReservation(activeRes.id)}
                              className="px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] transition"
                              title="Marcar llegada y ocupar mesa"
                            >
                              Recibir
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelReservation(activeRes.id)}
                              className="px-2 py-0.5 rounded bg-white hover:bg-red-50 text-stone-700 hover:text-red-700 border border-purple-200 font-semibold text-[10px] transition"
                              title="Liberar mesa"
                            >
                              Liberar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Posiciones Enumeradas de la Mesa */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {seats.map((seatNum) => {
                        const isSeatSelected = isTableSelected && selectedSeat === seatNum;
                        const seatInfo = getSeatInfo(table.id, seatNum);

                        let statusPill = null;
                        if (seatInfo.status === 'listo') {
                          statusPill = (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Listo
                            </span>
                          );
                        } else if (seatInfo.status === 'cocinando') {
                          statusPill = (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              <ChefHat className="w-2.5 h-2.5" /> Cocina ({seatInfo.orderCount})
                            </span>
                          );
                        } else if (seatInfo.status === 'servido') {
                          statusPill = (
                            <span className="inline-flex items-center text-[10px] text-sky-800 font-semibold bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                              Servido ({seatInfo.orderCount})
                            </span>
                          );
                        }

                        return (
                          <button
                            key={seatNum}
                            type="button"
                            onClick={() => {
                              setSelectedTableId(table.id);
                              setSelectedSeat(seatNum);
                            }}
                            className={`p-2 rounded-xl text-left border transition flex flex-col justify-between ${
                              isSeatSelected
                                ? isCafe
                                  ? 'bg-teal-800 text-white border-teal-800 shadow-sm'
                                  : 'bg-amber-800 text-white border-amber-800 shadow-sm'
                                : seatInfo.status !== 'disponible'
                                ? 'bg-white border-stone-200/90 text-stone-800 hover:border-stone-400 shadow-2xs'
                                : 'bg-white/60 border-stone-200/60 text-stone-500 hover:bg-white hover:text-stone-800'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="flex items-center gap-1 text-xs font-bold">
                                <Armchair className="w-3 h-3" />
                                Pos. #{seatNum}
                              </span>
                            </div>

                            <div className="mt-0.5 text-[11px] truncate">
                              {seatInfo.customer ? (
                                <span
                                  className={
                                    isSeatSelected
                                      ? 'text-white font-semibold'
                                      : 'text-stone-700 font-medium'
                                  }
                                >
                                  {seatInfo.customer.name.split(' ')[0]}
                                </span>
                              ) : (
                                <span
                                  className={
                                    isSeatSelected ? 'text-white/80' : 'text-stone-400'
                                  }
                                >
                                  Libre
                                </span>
                              )}
                            </div>

                            {statusPill && !isSeatSelected && (
                              <div className="mt-1">{statusPill}</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plano 2D Interactivo de la Mesa Seleccionada (4 columnas en desktop) */}
        <div className="lg:col-span-4">
          <InteractiveTable2D />
        </div>
      </div>

      {/* MODAL 1: Agregar Nueva Área / Zona */}
      {isAddZoneOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateZone}
            className="bg-white border border-stone-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-display font-bold text-base text-stone-900">
                Agregar Nueva Área
              </h3>
              <button
                type="button"
                onClick={() => setIsAddZoneOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Nombre del Área / Zona *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Jardín Interior, Terraza Norte, Salón Privado..."
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddZoneOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold"
              >
                Guardar Área
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: Renombrar Área Existente */}
      {isRenameZoneOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleRenameZoneSubmit}
            className="bg-white border border-stone-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-display font-bold text-base text-stone-900">
                Cambiar Nombre del Área
              </h3>
              <button
                type="button"
                onClick={() => setIsRenameZoneOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Nuevo nombre para "{zoneToRename}" *
              </label>
              <input
                type="text"
                required
                value={renamedZoneValue}
                onChange={(e) => setRenamedZoneValue(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRenameZoneOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold"
              >
                Actualizar Nombre
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Agregar Nueva Mesa en Área */}
      {isAddTableOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTableSubmit}
            className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-display font-bold text-lg text-stone-900">
                Agregar Nueva Mesa
              </h3>
              <button
                type="button"
                onClick={() => setIsAddTableOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nombre de la Mesa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Mesa 7, Mesa Jardín 1, Barra Norte..."
                  value={newTableData.name}
                  onChange={(e) =>
                    setNewTableData({ ...newTableData, name: e.target.value })
                  }
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Área / Ubicación
                  </label>
                  <select
                    value={newTableData.zone}
                    onChange={(e) =>
                      setNewTableData({ ...newTableData, zone: e.target.value })
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-900"
                  >
                    {zones.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Cantidad de Posiciones
                  </label>
                  <select
                    value={newTableData.seatsCount}
                    onChange={(e) =>
                      setNewTableData({
                        ...newTableData,
                        seatsCount: Number(e.target.value),
                      })
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-900"
                  >
                    {[2, 4, 6, 8, 10, 12].map((num) => (
                      <option key={num} value={num}>
                        {num} Posiciones (Asientos)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Diseño de Mesa (Plano 2D)
                  </label>
                  <select
                    value={newTableData.shape}
                    onChange={(e) =>
                      setNewTableData({ ...newTableData, shape: e.target.value })
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-900"
                  >
                    <option value="square">Cuadrada</option>
                    <option value="round">Redonda</option>
                    <option value="rectangle">Rectangular</option>
                    <option value="bar">Barra Lineal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={newTableData.availability}
                    onChange={(e) =>
                      setNewTableData({
                        ...newTableData,
                        availability: e.target.value,
                      })
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-900"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="reservada">Reservada</option>
                    <option value="ocupada">Ocupada</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsAddTableOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold ${
                  isCafe ? 'bg-teal-800 hover:bg-teal-900' : 'bg-amber-800 hover:bg-amber-900'
                }`}
              >
                Crear Mesa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: Editar Mesa (Cambiar nombre, área, asientos o estado Disponible/Reservada) */}
      {editingTable && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleEditTableSubmit}
            className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-display font-bold text-lg text-stone-900">
                Configurar Mesa: {editingTable.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTable(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nombre de la Mesa *
                </label>
                <input
                  type="text"
                  required
                  value={editingTable.name}
                  onChange={(e) =>
                    setEditingTable({ ...editingTable, name: e.target.value })
                  }
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Área / Ubicación
                  </label>
                  <select
                    value={editingTable.zone}
                    onChange={(e) =>
                      setEditingTable({ ...editingTable, zone: e.target.value })
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-900"
                  >
                    {zones.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Cantidad de Posiciones
                  </label>
                  <select
                    value={editingTable.seatsCount}
                    onChange={(e) =>
                      setEditingTable({
                        ...editingTable,
                        seatsCount: Number(e.target.value),
                      })
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-900"
                  >
                    {[2, 4, 6, 8, 10, 12].map((num) => (
                      <option key={num} value={num}>
                        {num} Posiciones
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Forma en Plano 2D
                  </label>
                  <select
                    value={editingTable.shape}
                    onChange={(e) =>
                      setEditingTable({ ...editingTable, shape: e.target.value })
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-900"
                  >
                    <option value="square">Cuadrada</option>
                    <option value="round">Redonda</option>
                    <option value="rectangle">Rectangular</option>
                    <option value="bar">Barra Lineal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Estado de Disponibilidad
                  </label>
                  <select
                    value={editingTable.availability}
                    onChange={(e) =>
                      setEditingTable({
                        ...editingTable,
                        availability: e.target.value,
                      })
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-900"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="reservada">Reservada</option>
                    <option value="ocupada">Ocupada</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setEditingTable(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
