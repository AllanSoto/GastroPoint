import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { CheckCircle2, AlertCircle, Info, Bell, X } from 'lucide-react';

export default function NotificationToast() {
  const { toasts, removeToast } = useRestaurant();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-stone-200 bg-white text-stone-900';
        let IconComponent = Info;
        let iconColor = 'text-stone-700';

        if (toast.type === 'success') {
          borderClass = 'border-emerald-200 bg-white text-stone-900';
          IconComponent = CheckCircle2;
          iconColor = 'text-emerald-700';
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-200 bg-white text-stone-900';
          IconComponent = Bell;
          iconColor = 'text-amber-700';
        } else if (toast.type === 'error') {
          borderClass = 'border-red-200 bg-white text-stone-900';
          IconComponent = AlertCircle;
          iconColor = 'text-red-700';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg transition-all duration-200 ${borderClass}`}
          >
            <IconComponent className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs text-stone-900 leading-tight">
                {toast.title}
              </h4>
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
