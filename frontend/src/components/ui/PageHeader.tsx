import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function PageHeader({ title, subtitle, onBack, right }: PageHeaderProps) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <div className="px-4 py-3 sticky top-0 z-10 bg-tiket-cream border-b border-ink-100 flex items-center gap-3">
      <button onClick={handleBack} className="-ml-2 p-2 text-ink-900" aria-label="Back">
        <ChevronLeft size={20} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-ink-900 truncate">{title}</div>
        {subtitle && <div className="text-[11px] text-ink-500 truncate">{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}
