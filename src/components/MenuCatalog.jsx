import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Search, Plus, Clock, Armchair, MessageSquare } from 'lucide-react';

export default function MenuCatalog() {
  const {
    businessType,
    menuItems,
    selectedTableId,
    selectedSeat,
    getTableById,
    addToCart,
    customers,
  } = useRestaurant();

  const [activeCategory, setActiveCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const [customNotes, setCustomNotes] = useState('');
  const [targetSeat, setTargetSeat] = useState(selectedSeat);

  const currentTable = getTableById(selectedTableId);
  const tableSeats = Array.from({ length: currentTable?.seatsCount || 4 }, (_, i) => i + 1);
  const isCafe = businessType === 'cafeteria';

  const currentBusinessItems = useMemo(() => {
    return menuItems.filter((item) => item.businessType === businessType);
  }, [menuItems, businessType]);

  const categories = useMemo(() => {
    const set = new Set(currentBusinessItems.map((i) => i.category));
    return ['Todas', ...Array.from(set)];
  }, [currentBusinessItems]);

  const filteredItems = useMemo(() => {
    return currentBusinessItems.filter((item) => {
      const matchCat = activeCategory === 'Todas' || item.category === activeCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchCat && matchSearch;
    });
  }, [currentBusinessItems, activeCategory, searchQuery]);

  const handleOpenAddModal = (item) => {
    setSelectedItemForModal(item);
    setTargetSeat(selectedSeat);
    setCustomNotes('');
  };

  const handleConfirmAdd = () => {
    if (!selectedItemForModal) return;
    addToCart(selectedItemForModal, targetSeat, customNotes);
    setSelectedItemForModal(null);
  };

  const handleQuickAdd = (e, item) => {
    e.stopPropagation();
    addToCart(item, selectedSeat, '');
  };

  const activeCustomerInSeat = customers.find(
    (c) => c.tableId === selectedTableId && Number(c.seatPosition) === Number(selectedSeat)
  );

  return (
    <div className="space-y-6">
      {/* Cabecera de Menú y Filtros */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-display text-xl font-bold text-stone-900">
                Carta de {isCafe ? 'Cafetería & Brunch' : 'Restaurante'}
              </h2>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  isCafe
                    ? 'bg-teal-50 text-teal-900 border-teal-200'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}
              >
                Ordenando para: {currentTable?.name} • Posición #{selectedSeat}
                {activeCustomerInSeat ? ` (${activeCustomerInSeat.name.split(' ')[0]})` : ''}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Haz clic en un platillo para personalizar notas de cocina o elegir a qué posición de la mesa se enviará
            </p>
          </div>

          {/* Buscador */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar platillo o ingrediente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 transition"
            />
          </div>
        </div>

        {/* Pestañas de Categorías */}
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catálogo de Platillos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleOpenAddModal(item)}
            className="group bg-white border border-stone-200/90 rounded-2xl overflow-hidden hover:border-stone-400 hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer"
          >
            {/* Imagen */}
            <div className="relative h-44 w-full overflow-hidden bg-stone-100">
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                }}
              />

              {/* Etiquetas */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                {item.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-stone-800 shadow-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Tiempo estimado */}
              <div className="absolute bottom-2.5 right-3 flex items-center gap-1 text-[11px] font-semibold text-stone-800 bg-white/95 backdrop-blur-sm px-2.5 py-0.5 rounded-full shadow-xs">
                <Clock className="w-3 h-3 text-amber-700" />
                <span>{item.timeMinutes} min</span>
              </div>
            </div>

            {/* Información */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {item.category}
                </span>
                <h3 className="font-bold text-base text-stone-900 group-hover:text-amber-800 transition-colors mt-0.5">
                  {item.name}
                </h3>
                <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Precio y Botón de Asignación Directa */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                    Precio
                  </span>
                  <span className="text-lg font-extrabold text-stone-900 tabular-nums">
                    ${item.price.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={(e) => handleQuickAdd(e, item)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-bold transition shadow-xs ${
                    isCafe
                      ? 'bg-teal-800 hover:bg-teal-900'
                      : 'bg-amber-800 hover:bg-amber-900'
                  }`}
                  title={`Asignar directamente a ${currentTable?.name} - Posición #${selectedSeat}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Posición #{selectedSeat}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
          <p className="text-stone-500 text-sm">
            No encontramos platillos que coincidan con tu búsqueda.
          </p>
        </div>
      )}

      {/* Modal para Personalizar Posición y Notas */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            
            <div className="flex items-start gap-3.5 pb-3 border-b border-stone-100">
              <img
                src={selectedItemForModal.image}
                alt={selectedItemForModal.name}
                className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-stone-200"
              />
              <div className="flex-1">
                <h3 className="font-display font-bold text-base text-stone-900">
                  {selectedItemForModal.name}
                </h3>
                <span className="text-amber-800 font-extrabold text-sm block mt-0.5 tabular-nums">
                  ${selectedItemForModal.price.toFixed(2)}
                </span>
                <span className="text-xs text-stone-500">
                  {currentTable?.name} ({currentTable?.zone})
                </span>
              </div>
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            {/* Selección de Asiento / Posición */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Armchair className="w-4 h-4 text-amber-800" />
                  ¿Qué posición de la mesa solicita este platillo?
                </span>
              </label>

              <div className="grid grid-cols-4 gap-2">
                {tableSeats.map((seatNum) => {
                  const isTarget = targetSeat === seatNum;
                  const cust = customers.find(
                    (c) => c.tableId === selectedTableId && Number(c.seatPosition) === seatNum
                  );
                  return (
                    <button
                      key={seatNum}
                      type="button"
                      onClick={() => setTargetSeat(seatNum)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-0.5 ${
                        isTarget
                          ? isCafe
                            ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                            : 'bg-amber-800 text-white border-amber-800 shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <Armchair className="w-3.5 h-3.5" />
                      <span>Pos. #{seatNum}</span>
                      <span
                        className={`text-[9px] font-medium truncate max-w-full ${
                          isTarget ? 'text-white/85' : 'text-stone-400'
                        }`}
                      >
                        {cust ? cust.name.split(' ')[0] : 'Libre'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notas Especiales */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                Instrucciones para cocina (opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Término medio, sin cebolla, leche de almendras..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 transition"
              />
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAdd}
                className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-sm transition ${
                  isCafe ? 'bg-teal-800 hover:bg-teal-900' : 'bg-amber-800 hover:bg-amber-900'
                }`}
              >
                Agregar a Posición #{targetSeat}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
