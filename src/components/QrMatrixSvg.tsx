import React from 'react';

interface QrMatrixSvgProps {
  value: string;
  size?: number;
  className?: string;
}

export const QrMatrixSvg: React.FC<QrMatrixSvgProps> = ({ value, size = 112, className = '' }) => {
  const modules = 21;
  const cells: boolean[][] = Array.from({ length: modules }, () => Array(modules).fill(false));

  const drawFinder = (startR: number, startC: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        cells[startR + r][startC + c] = isBorder || isCenter;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, modules - 7);
  drawFinder(modules - 7, 0);

  // Timing patterns
  for (let i = 8; i < modules - 8; i++) {
    cells[6][i] = i % 2 === 0;
    cells[i][6] = i % 2 === 0;
  }

  // Deterministic hash-seeded data modules
  let seed = 2166136261;
  for (let i = 0; i < value.length; i++) {
    seed ^= value.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }

  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= modules - 8;
      const inBottomLeft = r >= modules - 8 && c < 8;
      const isTiming = r === 6 || c === 6;
      if (inTopLeft || inTopRight || inBottomLeft || isTiming) continue;
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      cells[r][c] = (Math.abs(seed) % 10) < 5;
    }
  }

  const cellSize = 100 / modules;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`bg-white p-1.5 rounded-lg border border-slate-300 ${className}`}
      aria-label={`QR Code for ${value}`}
    >
      <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
      {cells.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.12}
              height={cellSize + 0.12}
              fill="#0f172a"
            />
          ) : null
        )
      )}
    </svg>
  );
};
