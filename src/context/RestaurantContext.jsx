import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_ZONES,
  INITIAL_TABLES,
  INITIAL_RESERVATIONS,
  MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
} from '../data/mockData';

const RestaurantContext = createContext();

export function RestaurantProvider({ children }) {
  // Configuración de Negocio: 'restaurante' o 'cafeteria'
  const [businessType, setBusinessType] = useState(() => {
    return localStorage.getItem('gastro_business_type') || 'restaurante';
  });

  // Rol activo: 'cliente' | 'reservaciones' | 'cocina' | 'mesero' | 'facturacion'
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('gastro_current_role') || 'cliente';
  });

  // Usuario/Cliente actual registrado
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('gastro_current_user');
    return saved
      ? JSON.parse(saved)
      : {
          id: 'CUST-1',
          name: 'Carlos Mendoza',
          email: 'carlos@ejemplo.com',
          phone: '+52 55 1234 5678',
          tableId: 'M-1',
          seatPosition: 1,
          isRegistered: true,
        };
  });

  // Clientes registrados
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('gastro_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  // Áreas / Zonas editables
  const [zones, setZones] = useState(() => {
    const saved = localStorage.getItem('gastro_zones');
    return saved ? JSON.parse(saved) : INITIAL_ZONES;
  });

  // Mesas editables
  const [tables, setTables] = useState(() => {
    const saved = localStorage.getItem('gastro_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [selectedTableId, setSelectedTableId] = useState('M-1');
  const [selectedSeat, setSelectedSeat] = useState(1);

  // Reservaciones de mesas
  const [reservations, setReservations] = useState(() => {
    const saved = localStorage.getItem('gastro_reservations');
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });

  // Pedidos activos y pasados
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('gastro_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Carrito provisional antes de mandar a cocina
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('gastro_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Historial de facturas pagadas en la sesión
  const [paidInvoices, setPaidInvoices] = useState(() => {
    const saved = localStorage.getItem('gastro_paid_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  // Notificaciones Toast
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem('gastro_business_type', businessType);
  }, [businessType]);

  useEffect(() => {
    localStorage.setItem('gastro_current_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('gastro_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('gastro_zones', JSON.stringify(zones));
  }, [zones]);

  useEffect(() => {
    localStorage.setItem('gastro_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('gastro_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('gastro_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('gastro_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('gastro_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('gastro_paid_invoices', JSON.stringify(paidInvoices));
  }, [paidInvoices]);

  // Sincronización multi-pestaña
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'gastro_orders' && e.newValue) setOrders(JSON.parse(e.newValue));
      if (e.key === 'gastro_cart' && e.newValue) setCart(JSON.parse(e.newValue));
      if (e.key === 'gastro_tables' && e.newValue) setTables(JSON.parse(e.newValue));
      if (e.key === 'gastro_zones' && e.newValue) setZones(JSON.parse(e.newValue));
      if (e.key === 'gastro_reservations' && e.newValue) setReservations(JSON.parse(e.newValue));
      if (e.key === 'gastro_paid_invoices' && e.newValue) setPaidInvoices(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addToast = (title, message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getTableById = (tableId) => {
    return tables.find((t) => t.id === tableId) || tables[0];
  };

  // --- GESTIÓN DE ÁREAS / ZONAS ---
  const addZone = (zoneName) => {
    const trimmed = zoneName.trim();
    if (!trimmed) return false;
    if (zones.some((z) => z.toLowerCase() === trimmed.toLowerCase())) {
      addToast('Área existente', `El área "${trimmed}" ya existe.`, 'warning');
      return false;
    }
    setZones((prev) => [...prev, trimmed]);
    addToast('Área Creada', `Se agregó el área "${trimmed}".`, 'success');
    return true;
  };

  const renameZone = (oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed || oldName === trimmed) return false;
    setZones((prev) => prev.map((z) => (z === oldName ? trimmed : z)));
    setTables((prev) =>
      prev.map((t) => (t.zone === oldName ? { ...t, zone: trimmed } : t))
    );
    setReservations((prev) =>
      prev.map((r) => (r.zone === oldName ? { ...r, zone: trimmed } : r))
    );
    addToast(
      'Área Renombrada',
      `El área "${oldName}" ahora se llama "${trimmed}".`,
      'success'
    );
    return true;
  };

  // --- GESTIÓN DE MESAS ---
  const addTable = ({ name, zone, seatsCount = 4, shape = 'square', availability = 'disponible' }) => {
    const nextNumber =
      tables.reduce((max, t) => Math.max(max, Number(t.number) || 0), 0) + 1;
    const tableName = name?.trim() || `Mesa ${nextNumber}`;
    const targetZone = zone || zones[0] || 'Salón Principal';

    const newTable = {
      id: `M-${Date.now()}`,
      number: nextNumber,
      name: tableName,
      zone: targetZone,
      seatsCount: Math.max(1, Math.min(16, Number(seatsCount) || 4)),
      shape: shape || 'square',
      availability: availability || 'disponible',
    };

    setTables((prev) => [...prev, newTable]);
    setSelectedTableId(newTable.id);
    setSelectedSeat(1);

    addToast(
      'Mesa Agregada',
      `Se creó "${newTable.name}" en el área "${newTable.zone}" con ${newTable.seatsCount} posiciones.`,
      'success'
    );
    return newTable;
  };

  const updateTable = (tableId, updates) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            ...updates,
            seatsCount:
              updates.seatsCount !== undefined
                ? Math.max(1, Math.min(16, Number(updates.seatsCount)))
                : t.seatsCount,
          };
        }
        return t;
      })
    );

    // Sincronizar nombre de mesa en órdenes activas y reservaciones si cambió el nombre
    if (updates.name || updates.zone) {
      setOrders((prev) =>
        prev.map((o) =>
          o.tableId === tableId
            ? { ...o, tableName: updates.name || o.tableName }
            : o
        )
      );
      setReservations((prev) =>
        prev.map((r) =>
          r.tableId === tableId
            ? {
                ...r,
                tableName: updates.name || r.tableName,
                zone: updates.zone || r.zone,
              }
            : r
        )
      );
    }

    addToast('Mesa Actualizada', 'Los cambios de la mesa han sido guardados.', 'success');
  };

  // Determinar estado real de la mesa ('disponible' | 'ocupada' | 'reservada')
  const getTableAvailability = (tableId) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return 'disponible';

    const activeOrders = orders.some(
      (o) => o.tableId === tableId && o.status !== 'cobrado'
    );
    if (activeOrders) return 'ocupada';

    const hasActiveReservation = reservations.some(
      (r) => r.tableId === tableId && r.status === 'confirmada'
    );
    if (hasActiveReservation || table.availability === 'reservada') {
      return 'reservada';
    }

    return table.availability || 'disponible';
  };

  // --- GESTIÓN DE RESERVACIONES ---
  const addReservation = (data) => {
    const targetTable = getTableById(data.tableId);
    const newRes = {
      id: `RES-${Date.now().toString().slice(-4)}`,
      tableId: targetTable.id,
      tableName: targetTable.name,
      zone: targetTable.zone,
      customerName: data.customerName.trim(),
      phone: data.phone || 'Sin teléfono',
      email: data.email || '',
      date: data.date,
      time: data.time,
      guestsCount: Number(data.guestsCount) || 2,
      notes: data.notes || '',
      status: 'confirmada',
    };

    setReservations((prev) => [newRes, ...prev]);
    setTables((prev) =>
      prev.map((t) =>
        t.id === targetTable.id ? { ...t, availability: 'reservada' } : t
      )
    );

    addToast(
      'Reservación Confirmada',
      `${targetTable.name} (${targetTable.zone}) reservada para ${newRes.customerName} (${newRes.guestsCount} personas) el ${newRes.date} a las ${newRes.time}.`,
      'success'
    );
    return newRes;
  };

  const cancelReservation = (resId) => {
    const res = reservations.find((r) => r.id === resId);
    setReservations((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, status: 'cancelada' } : r))
    );
    if (res) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === res.tableId ? { ...t, availability: 'disponible' } : t
        )
      );
      addToast(
        'Reservación Liberada',
        `Se liberó la reserva de ${res.tableName}. Ahora está Disponible.`,
        'info'
      );
    }
  };

  const checkInReservation = (resId) => {
    const res = reservations.find((r) => r.id === resId);
    if (!res) return;

    setReservations((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, status: 'en_mesa' } : r))
    );
    setTables((prev) =>
      prev.map((t) =>
        t.id === res.tableId ? { ...t, availability: 'ocupada' } : t
      )
    );

    registerCustomer({
      name: res.customerName,
      phone: res.phone,
      email: res.email,
      tableId: res.tableId,
      seatPosition: 1,
    });
  };

  // Registrar cliente y asignarlo a su mesa y posición
  const registerCustomer = (data) => {
    const seatNum = Number(data.seatPosition) || 1;
    const tId = data.tableId || selectedTableId;
    const newCust = {
      id: `CUST-${Date.now()}`,
      name: data.name.trim(),
      email: data.email || 'cliente@gastropoint.com',
      phone: data.phone || 'Sin teléfono',
      tableId: tId,
      seatPosition: seatNum,
      isRegistered: true,
    };

    setCustomers((prev) => [
      ...prev.filter((c) => !(c.tableId === tId && Number(c.seatPosition) === seatNum)),
      newCust,
    ]);
    setCurrentUser(newCust);
    setSelectedTableId(tId);
    setSelectedSeat(seatNum);

    const targetTable = getTableById(tId);
    addToast(
      'Registro Completado',
      `Bienvenido(a) ${newCust.name}. Ubicado en ${targetTable?.name}, Posición #${seatNum}.`,
      'success'
    );
  };

  const loginAsCustomer = (cust) => {
    setCurrentUser(cust);
    setSelectedTableId(cust.tableId);
    setSelectedSeat(Number(cust.seatPosition));
    const targetTable = getTableById(cust.tableId);
    addToast(
      'Comensal Activo',
      `${cust.name} — ${targetTable?.name} (Posición #${cust.seatPosition})`,
      'info'
    );
  };

  // Agregar al carrito por posición específica
  const addToCart = (menuItem, seatPosition = selectedSeat, notes = '') => {
    const targetTable = getTableById(selectedTableId);
    const seatNum = Number(seatPosition);
    const seatCustomer = customers.find(
      (c) => c.tableId === selectedTableId && Number(c.seatPosition) === seatNum
    );

    const newCartItem = {
      cartId: `CART-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      itemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      image: menuItem.image,
      category: menuItem.category,
      timeMinutes: menuItem.timeMinutes,
      tableId: selectedTableId,
      tableNumber: targetTable.number,
      tableName: targetTable.name,
      seatPosition: seatNum,
      customerName:
        seatCustomer?.name ||
        (currentUser?.tableId === selectedTableId && currentUser?.seatPosition === seatNum
          ? currentUser.name
          : `Comensal Puesto #${seatNum}`),
      notes: notes.trim(),
    };

    setCart((prev) => [...prev, newCartItem]);
    addToast(
      'Platillo agregado a la comanda',
      `${menuItem.name} → ${targetTable.name}, Posición #${seatNum}`,
      'success'
    );
  };

  const removeFromCart = (cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Enviar comanda a la cocina
  const sendCartToKitchen = () => {
    if (cart.length === 0) return;

    const now = new Date().toISOString();
    const newOrders = cart.map((item, idx) => ({
      id: `ORD-${Date.now()}-${idx}`,
      tableId: item.tableId,
      tableNumber: item.tableNumber,
      tableName: item.tableName,
      seatPosition: item.seatPosition,
      customerName: item.customerName,
      itemId: item.itemId,
      name: item.name,
      price: item.price,
      notes: item.notes,
      status: 'pendiente',
      createdAt: now,
      businessType: businessType,
    }));

    setOrders((prev) => [...prev, ...newOrders]);
    // Asegurar que la mesa figure como ocupada
    const tableIdsOrdered = [...new Set(newOrders.map((o) => o.tableId))];
    setTables((prev) =>
      prev.map((t) =>
        tableIdsOrdered.includes(t.id) ? { ...t, availability: 'ocupada' } : t
      )
    );
    setCart([]);

    addToast(
      'Comanda enviada a Cocina',
      `${newOrders.length} platillo(s) recibidos en cocina con su Mesa y Posición.`,
      'success'
    );
  };

  // Cambiar estado de un platillo en cocina o mesero
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return { ...ord, status: newStatus };
        }
        return ord;
      })
    );

    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      if (newStatus === 'listo') {
        addToast(
          'Platillo Listo para Servir',
          `${ord.name} (${ord.tableName} • Posición #${ord.seatPosition}) está listo en barra de cocina.`,
          'warning'
        );
      } else if (newStatus === 'servido') {
        addToast(
          'Entregado en Mesa',
          `${ord.name} servido en ${ord.tableName} • Posición #${ord.seatPosition}.`,
          'info'
        );
      }
    }
  };

  // Reasignar un platillo a otra posición de la misma mesa
  const reassignOrderSeat = (orderId, newSeatPosition) => {
    const seatNum = Number(newSeatPosition);
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;

    const custInNewSeat = customers.find(
      (c) => c.tableId === ord.tableId && Number(c.seatPosition) === seatNum
    );

    setOrders((prev) =>
      prev.map((item) => {
        if (item.id === orderId) {
          return {
            ...item,
            seatPosition: seatNum,
            customerName: custInNewSeat?.name || `Comensal Posición #${seatNum}`,
          };
        }
        return item;
      })
    );

    addToast(
      'Posición Actualizada',
      `${ord.name} fue movido a la Posición #${seatNum} de ${ord.tableName}.`,
      'info'
    );
  };

  // Marcar ordenes de una mesa como cobradas y guardar en el historial de facturas
  const closeBillForTable = (tableId, seatPositions = null, invoiceMeta = null) => {
    const seatsArray =
      seatPositions === null
        ? null
        : Array.isArray(seatPositions)
        ? seatPositions.map(Number)
        : [Number(seatPositions)];

    const targetTable = getTableById(tableId);
    const paidItems = orders.filter(
      (ord) =>
        ord.tableId === tableId &&
        ord.status !== 'cobrado' &&
        (seatsArray === null || seatsArray.includes(Number(ord.seatPosition)))
    );

    let createdInvoice = null;

    if (paidItems.length > 0) {
      const subtotal = paidItems.reduce((s, i) => s + i.price, 0);
      const tax = subtotal * 0.16;
      const tipPct = invoiceMeta?.tipPercentage ?? 10;
      const tip = (subtotal * tipPct) / 100;
      const total = subtotal + tax + tip;

      createdInvoice = {
        id: `FAC-${Date.now().toString().slice(-5)}`,
        tableId,
        tableName: targetTable.name,
        zone: targetTable.zone,
        modeLabel:
          invoiceMeta?.modeLabel ||
          (seatsArray === null
            ? 'Factura Unificada de Mesa'
            : seatsArray.length === 1
            ? `Cuenta Individual (Posición #${seatsArray[0]})`
            : `Posiciones Unidas (#${seatsArray.join(', #')})`),
        seatsPaid: seatsArray,
        itemsCount: paidItems.length,
        items: paidItems,
        subtotal,
        tax,
        tip,
        tipPercentage: tipPct,
        total: invoiceMeta?.payableAmount ?? total,
        paymentMethod: invoiceMeta?.paymentMethod || 'tarjeta',
        cashGiven: invoiceMeta?.cashGiven || 0,
        changeDue: invoiceMeta?.changeDue || 0,
        paidAt: new Date().toISOString(),
      };

      setPaidInvoices((prev) => [createdInvoice, ...prev]);
    }

    setOrders((prev) =>
      prev.map((ord) => {
        if (
          ord.tableId === tableId &&
          (seatsArray === null || seatsArray.includes(Number(ord.seatPosition)))
        ) {
          return { ...ord, status: 'cobrado' };
        }
        return ord;
      })
    );

    // Si ya no quedan órdenes sin cobrar en la mesa, liberarla a 'disponible'
    const remainingOrders = orders.filter(
      (ord) =>
        ord.tableId === tableId &&
        ord.status !== 'cobrado' &&
        !(seatsArray === null || seatsArray.includes(Number(ord.seatPosition)))
    );

    if (remainingOrders.length === 0) {
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, availability: 'disponible' } : t))
      );
    }

    if (seatsArray !== null) {
      addToast(
        'Cuenta Liquidada por Posición',
        `Se cobró la deuda de ${targetTable.name} — Posición(es): #${seatsArray.join(', #')}.`,
        'success'
      );
    } else {
      addToast(
        'Cuenta Unificada Pagada',
        `Se ha liquidado el total completo de ${targetTable.name}. Mesa disponible.`,
        'success'
      );
    }

    return createdInvoice;
  };

  const resetDemoData = () => {
    setZones(INITIAL_ZONES);
    setTables(INITIAL_TABLES);
    setReservations(INITIAL_RESERVATIONS);
    setOrders(INITIAL_ORDERS);
    setCart([]);
    setCustomers(INITIAL_CUSTOMERS);
    setPaidInvoices([]);
    addToast(
      'Datos Restaurados',
      'Se han restablecido las áreas, mesas, reservaciones y comandas de demostración.',
      'info'
    );
  };

  return (
    <RestaurantContext.Provider
      value={{
        businessType,
        setBusinessType,
        currentRole,
        setCurrentRole,
        currentUser,
        setCurrentUser,
        customers,
        registerCustomer,
        loginAsCustomer,
        zones,
        addZone,
        renameZone,
        tables,
        addTable,
        updateTable,
        getTableAvailability,
        selectedTableId,
        setSelectedTableId,
        selectedSeat,
        setSelectedSeat,
        getTableById,
        reservations,
        addReservation,
        cancelReservation,
        checkInReservation,
        menuItems: MENU_ITEMS,
        orders,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        sendCartToKitchen,
        updateOrderStatus,
        reassignOrderSeat,
        closeBillForTable,
        paidInvoices,
        resetDemoData,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant debe usarse dentro de RestaurantProvider');
  }
  return context;
}
