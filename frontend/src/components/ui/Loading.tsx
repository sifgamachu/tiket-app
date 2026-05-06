interface LoadingProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({ label, size = 'md' }: LoadingProps) {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-10 w-10 border-[3px]' };
  return (
    <div className="flex flex-col items-center justify-center py-12 text-ink-500">
      <div className={`${sizes[size]} border-tiket-green border-t-transparent rounded-full animate-spin`} />
      {label && <p className="text-xs mt-3">{label}</p>}
    </div>
  );
}
