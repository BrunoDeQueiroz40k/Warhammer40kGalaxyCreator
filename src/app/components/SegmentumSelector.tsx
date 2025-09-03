export interface Segmentum {
  id: string;
  name: string;
  color: string;
  selectedColor: string;
  path: string;
  textPosition: { x: number; y: number };
}

const segmentums: Segmentum[] = [
  {
    id: "solar",
    name: "Segmentum Solar",
    color: "rgba(220, 38, 38, 0.6)", // Vermelho escuro
    selectedColor: "rgba(220, 38, 38, 0.9)",
    path: "M 200 150 Q 180 120 200 100 Q 220 80 250 90 Q 280 100 300 120 Q 320 140 300 160 Q 280 180 250 170 Q 220 160 200 150 Z",
    textPosition: { x: 250, y: 140 },
  },
  {
    id: "pacificus",
    name: "Segmentum Pacificus",
    color: "rgba(251, 146, 60, 0.6)", // Laranja
    selectedColor: "rgba(251, 146, 60, 0.9)",
    path: "M 200 150 Q 180 120 150 130 Q 120 140 100 160 Q 80 180 100 200 Q 120 220 150 210 Q 180 200 200 180 Q 200 165 200 150 Z",
    textPosition: { x: 150, y: 180 },
  },
  {
    id: "tempestus",
    name: "Segmentum Tempestus",
    color: "rgba(6, 182, 212, 0.6)", // Azul-petróleo
    selectedColor: "rgba(6, 182, 212, 0.9)",
    path: "M 200 150 Q 220 160 250 170 Q 280 180 300 160 Q 320 140 340 160 Q 360 180 340 200 Q 320 220 300 200 Q 280 180 250 190 Q 220 200 200 180 Q 200 165 200 150 Z",
    textPosition: { x: 280, y: 180 },
  },
  {
    id: "obscurus",
    name: "Segmentum Obscurus",
    color: "rgba(163, 230, 53, 0.6)", // Amarelo-esverdeado
    selectedColor: "rgba(163, 230, 53, 0.9)",
    path: "M 200 150 Q 180 120 150 100 Q 120 80 100 60 Q 80 40 60 60 Q 40 80 60 100 Q 80 120 100 100 Q 120 80 150 90 Q 180 100 200 120 Q 200 135 200 150 Z",
    textPosition: { x: 120, y: 80 },
  },
  {
    id: "ultima",
    name: "Ultima Tempestus",
    color: "rgba(147, 51, 234, 0.6)", // Azul-púrpura
    selectedColor: "rgba(147, 51, 234, 0.9)",
    path: "M 200 150 Q 220 160 250 170 Q 280 180 300 160 Q 320 140 360 120 Q 400 100 420 80 Q 440 60 420 40 Q 400 20 360 40 Q 320 60 300 80 Q 280 100 250 90 Q 220 80 200 100 Q 200 125 200 150 Z",
    textPosition: { x: 350, y: 100 },
  },
];

interface SegmentumSelectorProps {
  selectedSegmentum: string | null;
  onSegmentumSelect: (segmentumId: string) => void;
}

export function SegmentumSelector({
  selectedSegmentum,
  onSegmentumSelect,
}: SegmentumSelectorProps) {
  return (
    <div className="w-full h-64 mt-2 bg-black/20 border border-amber-500/30 rounded-lg p-4 relative overflow-hidden">
      {/* Background galaxy effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 rounded-lg"></div>

      {/* SVG with segmentums */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 480 240"
        className="relative z-10"
      >
        {/* Galaxy background pattern */}
        <defs>
          <radialGradient id="galaxyGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.1)" />
            <stop offset="50%" stopColor="rgba(147, 51, 234, 0.1)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0.3)" />
          </radialGradient>
          <pattern
            id="stars"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="10" r="0.5" fill="rgba(255, 255, 255, 0.3)" />
          </pattern>
        </defs>

        {/* Galaxy background */}
        <rect width="100%" height="100%" fill="url(#galaxyGradient)" />
        <rect width="100%" height="100%" fill="url(#stars)" />

        {/* Segmentum borders */}
        <g stroke="rgba(34, 197, 94, 0.8)" strokeWidth="2" fill="none">
          {segmentums.map((segmentum) => (
            <path key={`border-${segmentum.id}`} d={segmentum.path} />
          ))}
        </g>

        {/* Segmentums */}
        {segmentums.map((segmentum) => {
          const isSelected = selectedSegmentum === segmentum.id;
          const fillColor = isSelected
            ? segmentum.selectedColor
            : segmentum.color;

          return (
            <g key={segmentum.id}>
              <path
                d={segmentum.path}
                fill={fillColor}
                stroke="rgba(34, 197, 94, 0.8)"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:opacity-80"
                onClick={() => onSegmentumSelect(segmentum.id)}
              />
              <text
                x={segmentum.textPosition.x}
                y={segmentum.textPosition.y}
                textAnchor="middle"
                className="fill-white text-xs font-semibold pointer-events-none select-none"
                style={{ fontSize: "10px" }}
              >
                {segmentum.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Selection indicator */}
      {selectedSegmentum && (
        <div className="absolute top-2 right-2 bg-amber-500/90 text-black px-2 py-1 rounded text-xs font-semibold">
          {segmentums.find((s) => s.id === selectedSegmentum)?.name}
        </div>
      )}
    </div>
  );
}
