import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { ShoppingBag, Trash2, Send, Armchair, CheckCircle2 } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, removeFromCart, clearCart, sendCartToKitchen, businessType } = useRestaurant();

  if (!isOpen) return null;

  const isCafe = businessType === 'cafeteria';

  // Agrupar platillos por Asiento / Posición
  const groupedBySeat = cart.reduce((acc, item) => {
    const key = `Mesa ${item.tableNumber} - Posición ${item.seatPosition}`;
    if (!acc[key]) {
      acc[key] = {
        title: key,
        tableName: item.tableName,
        seatPosition: item.seatPosition,
        customerName: item.customerName,
        items: [],
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {});

  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  const handleSend = () => {
    sendCartToKitchen();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-stone-200 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  isCafe ? 'bg-teal-50 text-teal-800' : 'bg-amber-50 text-amber-800'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-stone-900">
                  Comanda por Enviar
                </h2>
                <p className="text-xs text-stone-500">
                  {cart.length} platillo(s) clasificados por posición
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-100"
            >
              ✕
            </button>
          </div>

          {/* Lista de Platillos agrupados por Posición */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-stone-100 flex items-center justify-center text-stone-400">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="font-display font-bold text-stone-900 text-base">
                  Tu comanda está vacía
                </h3>
                <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                  Selecciona platillos del menú indicando a qué posición de la mesa corresponde cada uno.
                </p>
              </div>
            ) : (
              Object.values(groupedBySeat).map((group) => (
                <div
                  key={group.title}
                  className="bg-stone-50 rounded-2xl p-4 border border-stone-200/90 space-y-3"
                >
                  {/* Encabezado de la Posición */}
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                      <Armchair className="w-4 h-4 text-amber-800" />
                      <span>
                        {group.tableName} • Posición #{group.seatPosition}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-stone-500">
                      {group.customerName}
                    </span>
                  </div>

                  {/* Items del asiento */}
                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <div
                        key={item.cartId}
                        className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-white border border-stone-200/80 text-xs shadow-2xs"
                      >
                        <div className="flex-1">
                          <div className="font-bold text-stone-900 text-sm">{item.name}</div>
                          {item.notes ? (
                            <div className="text-[11px] text-amber-800 font-medium mt-0.5">
                              Nota: "{item.notes}"
                            </div>
                          ) : (
                            <div className="text-[10px] text-stone-400">Preparación estándar</div>
                          )}
                        </div>

                        <div className="text-right flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm tabular-nums">
                            ${item.price.toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.cartId)}
                            className="text-stone-400 hover:text-red-600 p-1 rounded transition"
                            title="Quitar platillo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer con Total y Envío a Cocina */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-600 font-medium">Subtotal de comanda:</span>
                <span className="text-xl font-extrabold text-stone-900 tabular-nums">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-800" />
                <span>
                  Al confirmar, el cocinero y el mesero verán cada platillo con su mesa y posición exacta.
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={clearCart}
                  className="px-3.5 py-3 rounded-xl border border-stone-300 hover:bg-stone-200/60 text-stone-600 hover:text-red-700 text-xs font-semibold transition"
                  title="Vaciar comanda"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSend}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 font-bold text-white text-sm rounded-xl shadow-sm transition ${
                    isCafe
                      ? 'bg-teal-800 hover:bg-teal-900'
                      : 'bg-amber-800 hover:bg-amber-900'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar a Cocina ({cart.length})</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
