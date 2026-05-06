import React from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export function Sheet({ open, onClose, title, children, maxHeight = '85vh' }: SheetProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div
        className="absolute bottom-0 left-0 right-0 bg-tiket-cream rounded-t-3xl flex flex-col animate-tk-sheet-up safe-bottom"
        style={{ maxHeight }}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          {title && <h3 className="text-base font-bold text-ink-900">{title}</h3>}
          <button onClick={onClose} className="ml-auto -mr-2 p-2" aria-label="Close">
            <X size={18} className="text-ink-500" />
          </button>
        </div>
        <div className="px-5 pb-5 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
