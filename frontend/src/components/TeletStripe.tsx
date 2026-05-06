interface TeletStripeProps {
  height?: number;
  className?: string;
}

export function TeletStripe({ height = 4, className = '' }: TeletStripeProps) {
  return (
    <div
      className={className}
      style={{
        height,
        background: 'linear-gradient(90deg, #1A6B3A 0% 33.33%, #D4A33B 33.33% 66.66%, #DC2626 66.66% 100%)',
      }}
    />
  );
}
