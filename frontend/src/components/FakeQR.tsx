interface FakeQRProps {
  id: string;
  size?: number;
  fg?: string;
  bg?: string;
}

export function FakeQR({ id, size = 160, fg = '#0E1411', bg = 'white' }: FakeQRProps) {
  const grid = 25;
  const cell = size / grid;

  // Hash the id deterministically into a grid pattern
  const hash = (s: string): number => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = (h ^ s.charCodeAt(i)) * 16777619;
    return h >>> 0;
  };

  // Use multiple hash positions to produce a varied pattern
  const isFilled = (r: number, c: number): boolean => {
    const seed = hash(`${id}-${r}-${c}`);
    return (seed % 3) === 0;
  };

  // Always fill the three corner finder patterns
  const isCorner = (r: number, c: number): boolean => {
    const inFinder = (br: number, bc: number) =>
      r >= br && r < br + 7 && c >= bc && c < bc + 7;
    if (!(inFinder(0, 0) || inFinder(0, grid - 7) || inFinder(grid - 7, 0))) return false;
    // Within finder pattern: outer ring + inner block
    const localR = r - (inFinder(grid - 7, 0) ? grid - 7 : 0);
    const localC = c - (inFinder(0, grid - 7) ? grid - 7 : 0);
    if (localR === 0 || localR === 6 || localC === 0 || localC === 6) return true;
    if (localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4) return true;
    return false;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <rect width={size} height={size} fill={bg} />
      {Array.from({ length: grid }).map((_, r) =>
        Array.from({ length: grid }).map((_, c) => {
          if (isCorner(r, c)) return <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={fg} />;
          // Skip the finder pattern areas
          const inFinderArea = (r < 8 && c < 8) || (r < 8 && c >= grid - 8) || (r >= grid - 8 && c < 8);
          if (inFinderArea) return null;
          return isFilled(r, c) ? (
            <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={fg} />
          ) : null;
        })
      )}
    </svg>
  );
}
