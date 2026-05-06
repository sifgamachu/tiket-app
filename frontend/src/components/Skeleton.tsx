import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Skeleton({ className = '', width, height, rounded = 'md' }: SkeletonProps) {
  const r = { sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl', full: 'rounded-full' }[rounded];
  return (
    <span
      aria-hidden="true"
      className={`inline-block bg-ink-100 ${r} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '40% 100%',
        animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
      }}
    />
  );
}

// Bus result card skeleton
export function BusCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-3 border border-ink-100 shadow-sm">
      <div className="flex items-center gap-2.5 mb-2">
        <Skeleton width={36} height={36} rounded="md" />
        <div className="flex-1">
          <Skeleton width="60%" height={11} className="mb-1.5" />
          <Skeleton width="40%" height={9} />
        </div>
        <Skeleton width={50} height={14} />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Skeleton width={36} height={18} />
        <div className="flex-1 px-2 flex items-center gap-1">
          <Skeleton width="100%" height={2} />
        </div>
        <Skeleton width={36} height={18} />
      </div>
      <div className="flex justify-between pt-2 border-t border-ink-100">
        <Skeleton width={80} height={11} />
        <Skeleton width={60} height={11} />
      </div>
    </div>
  );
}

// Train + 3 classes skeleton
export function TrainCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
      <div className="px-3 py-2.5 flex items-center gap-2.5 bg-ink-100">
        <Skeleton width={36} height={36} rounded="md" />
        <div className="flex-1">
          <Skeleton width="40%" height={9} className="mb-1.5" />
          <Skeleton width="65%" height={11} />
        </div>
      </div>
      <div className="p-3 grid grid-cols-3 gap-1.5">
        <Skeleton height={64} rounded="lg" />
        <Skeleton height={64} rounded="lg" />
        <Skeleton height={64} rounded="lg" />
      </div>
    </div>
  );
}

// Event card skeleton
export function EventCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-ink-100 shadow-sm overflow-hidden">
      <Skeleton width="100%" height={96} rounded="sm" />
      <div className="p-3">
        <div className="flex gap-3 mb-2">
          <Skeleton width="40%" height={9} />
          <Skeleton width="35%" height={9} />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton width={80} height={20} />
          <Skeleton width={120} height={6} className="flex-1 mx-3" />
        </div>
      </div>
    </div>
  );
}
