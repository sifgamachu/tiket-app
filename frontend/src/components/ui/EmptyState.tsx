import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-8 py-12">
      <div className="w-16 h-16 rounded-full bg-tiket-warm-cream flex items-center justify-center mb-4 text-ink-500">
        {icon}
      </div>
      <h3 className="text-base font-bold text-ink-900">{title}</h3>
      {message && <p className="text-sm text-ink-500 mt-1 max-w-xs">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
