import React, { useState, useEffect } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import Navbar from './components/Navbar';
import WelcomeRegistrationPage from './components/WelcomeRegistrationPage';
import CustomerRegistration from './components/CustomerRegistration';
import TableSelector from './components/TableSelector';
import TableOrderSummary from './components/TableOrderSummary';
import MenuCatalog from './components/MenuCatalog';
import CartDrawer from './components/CartDrawer';
import KitchenDisplay from './components/KitchenDisplay';
import WaiterView from './components/WaiterView';
import BillingModal from './components/BillingModal';
import ReservationsModal from './components/ReservationsModal';
import NotificationToast from './components/NotificationToast';
import {
  Users,
  Receipt,
  UserPlus,
  Armchair,
  Calendar,
} from 'lucide-react';

function MainApp() {
  const {
    currentRole,
    setCurrentRole,
    currentUser,
    selectedTableId,
    getTableById,
    selectedSeat,
    businessType,
    reservations,
  } = useRestaurant();

  const [showWelcomePage, setShowWelcomePage] = useState(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [resTableId, setResTableId] = useState(null);

  // Asegurar que currentRole siempre sea uno de los 4 pasos del flujo principal
  useEffect(() => {
    if (!['cliente', 'cocina', 'mesero', 'facturacion'].includes(currentRole)) {
      setCurrentRole('cliente');
    }
  }, [currentRole, setCurrentRole]);

  const currentTable = getTableById(selectedTableId);
  const isCafe = businessType === 'cafeteria';
  const activeReservationsCount = reservations.filter(
    (r) => r.status === 'confirmada'
  ).length;

  const handleOpenReservation = (tableId = null) => {
    setResTableId(tableId || selectedTableId);
    setIsReservationOpen(true);
  };

  if (showWelcomePage) {
    return (
      <>
        <WelcomeRegistrationPage
          onComplete={() => setShowWelcomePage(false)}
          onOpenReservations={() => handleOpenReservation(selectedTableId)}
        />
        <ReservationsModal
          isOpen={isReservationOpen}
          onClose={() => setIsReservationOpen(false)}
          preselectedTableId={resTableId}
          isEmbedded={false}
        />
        <NotificationToast />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-stone-900 flex flex-col font-sans">
      {/* Barra de Navegación Superior (1 sola fila limpia con los 4 pasos del flujo) */}
      <Navbar
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWelcomePage={() => setShowWelcomePage(true)}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Barra de Contexto y Acciones Independientes (Reservaciones, Cambio de Cliente, Portada) */}
        <div className="bg-white border border-stone-200/90 rounded-2xl px-5 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                isCafe
                  ? 'bg-teal-50 text-teal-900 border-teal-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              <Armchair className="w-3.5 h-3.5" />
              {currentTable?.name} ({currentTable?.zone}) • Posición #{selectedSeat}
            </span>

            <span className="text-xs text-stone-600">
              Comensal activo:{' '}
              <strong className="text-stone-900 font-bold">
                {currentUser?.name || 'Invitado'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
            <button
              onClick={() => handleOpenReservation(selectedTableId)}
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100/80 text-purple-950 border border-purple-200 transition flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-purple-700" />
              <span>Reservaciones</span>
              {activeReservationsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-700 text-white text-[10px] font-extrabold tabular-nums">
                  {activeReservationsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsRegisterOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-700 transition flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Cambiar Posición / Cliente</span>
            </button>

            <button
              onClick={() => setShowWelcomePage(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-700 transition flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Portada de Registro</span>
            </button>

            {currentRole !== 'facturacion' && (
              <button
                onClick={() => setIsBillingOpen(true)}
                className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white transition flex items-center gap-1.5 shadow-2xs"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Factura de Mesa</span>
              </button>
            )}
          </div>
        </div>

        {/* Vistas de los 4 Pasos del Flujo Operativo */}
        {currentRole === 'cliente' && (
          <div className="space-y-6">
            <TableSelector onOpenReservationModal={handleOpenReservation} />
            <TableOrderSummary onOpenBilling={() => setIsBillingOpen(true)} />
            <MenuCatalog />
          </div>
        )}

        {currentRole === 'cocina' && <KitchenDisplay />}

        {currentRole === 'mesero' && (
          <WaiterView
            onOpenOrderModal={() => setCurrentRole('cliente')}
            onOpenBilling={() => setIsBillingOpen(true)}
          />
        )}

        {currentRole === 'facturacion' && (
          <div className="space-y-6">
            <BillingModal isOpen={true} onClose={() => {}} isEmbedded={true} />
          </div>
        )}

      </main>

      {/* Pie de Página */}
      <footer className="mt-12 border-t border-stone-200/80 bg-white py-5 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-stone-800">GastroPoint</span>
            <span>—</span>
            <span>Sistema de Gestión para Restaurantes y Cafeterías</span>
          </div>
          <div className="flex items-center gap-4 text-stone-400 font-medium">
            <span>Áreas y Mesas Configurables</span>
            <span>•</span>
            <span>Reservaciones</span>
            <span>•</span>
            <span>Comandas KDS</span>
            <span>•</span>
            <span>Facturación Imprimible</span>
          </div>
        </div>
      </footer>

      {/* Modales */}
      <CustomerRegistration
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {currentRole !== 'facturacion' && (
        <BillingModal
          isOpen={isBillingOpen}
          onClose={() => setIsBillingOpen(false)}
          isEmbedded={false}
        />
      )}

      <ReservationsModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        preselectedTableId={resTableId}
        isEmbedded={false}
      />

      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <RestaurantProvider>
      <MainApp />
    </RestaurantProvider>
  );
}
