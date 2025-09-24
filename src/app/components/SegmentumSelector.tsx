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
    path: "M-127.44-128.025-145.485-153.45C-218.475-89.37-209.295-2.79-178.2 49.545L-205.65 68.13C-150.975 166.725-21.51 165.96 46.26 115.74L27.18 89.055C44.685 77.805 126.81-.135 61.425-122.58L84.465-139.05C76.95-152.145 49.14-180.63 27.18-188.775L1.8-139.05C-9.99-144.54-70.92-175.95-126.9-127.035",
    textPosition: { x: 650, y: 550 },
  },
  {
    id: "pacificus",
    name: "Segmentum Pacificus",
    color: "rgba(251, 146, 60, 0.6)", // Laranja
    selectedColor: "rgba(251, 146, 60, 0.9)",
    path: "M-264.465-326.13C-403.65-220.86-481.005-22.59-366.705 176.085L-178.785 49.86C-221.4-18.18-203.175-107.64-146.34-154.53",
    textPosition: { x: 400, y: 490 },
  },
  {
    id: "tempestus",
    name: "Segmentum Tempestus",
    color: "rgba(6, 182, 212, 0.6)", // Azul-petróleo
    selectedColor: "rgba(6, 182, 212, 0.9)",
    path: "M-390.78 194.31C-359.505 260.55-290.16 329.085-251.37 358.74L-264.6 376.335C-231.84 410.985-142.11 452.025-108.36 460.665L-115.29 493.695C-57.6 506.7 116.865 518.76 255.825 407.07L45.45 115.65C8.82 152.28-126.405 189.135-206.46 69.885",
    textPosition: { x: 600, y: 830 },
  },
  {
    id: "obscurus",
    name: "Segmentum Obscurus",
    color: "rgba(163, 230, 53, 0.6)", // Amarelo-esverdeado
    selectedColor: "rgba(163, 230, 53, 0.9)",
    path: "M354.33-322.74C273.6-422.505 188.82-466.515 109.845-489.87L100.125-467.55C61.515-477.945-41.535-505.17-174.645-464.31L-186.705-483.255C-239.22-469.575-301.455-425.115-322.785-409.635L-127.26-128.79C-70.02-173.835-14.04-148.455 1.62-139.815L26.73-190.575C53.415-177.21 82.71-144.27 84.15-138.96",
    textPosition: { x: 700, y: 250 },
  },
  {
    id: "ultima",
    name: "Ultima Segmentum",
    color: "rgba(147, 51, 234, 0.6)", // Azul-púrpura
    selectedColor: "rgba(147, 51, 234, 0.9)",
    path: "M61.2-121.185l537.255-364.86c23.895 31.59 48.735 61.785 66.24 98.82l-66.375 32.625c42.975 81.675 66.24 159.66 80.82 243.855l75.105-7.155c12.465 98.55 10.305 241.65-40.86 367.335l-38.16-11.7c-29.385 75.105-76.005 163.26-132.705 225.675l26.82 24.84c-46.305 50.715-98.685 97.02-160.74 130.14L26.055 89.73c33.615-18.54 98.235-111.195 34.47-210.78",
    textPosition: { x: 1100, y: 575 },
  },
];

// Tamanhos de texto específicos para cada segmento
const segmentumTextSizes: Record<string, number> = {
  solar: 40,
  pacificus: 35,
  tempestus: 60,
  obscurus: 65,
  ultima: 75,
};

interface SegmentumSelectorProps {
  selectedSegmentum: string | null;
  onSegmentumSelect: (segmentumId: string) => void;
}

export function SegmentumSelector({
  selectedSegmentum,
  onSegmentumSelect,
}: SegmentumSelectorProps) {
  return (
    <div className="w-full h-96 mt-2 bg-black/20 border border-amber-500/30 rounded-lg relative overflow-visible">
      {/* Background galaxy image */}
      <div
        className="absolute inset-0 rounded-lg bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/assets/imgs/galaxy.webp)" }}
      ></div>

      {/* SVG with segmentums */}
      <svg
        width="100%"
        height="100%"
        viewBox="-200 -200 1600 1200"
        className="relative z-10"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grupo com transformação para centralizar todos os segmentos */}
        <g transform="translate(450, 350)">
          {/* Segmentum borders */}
          <g stroke="rgba(34, 197, 94, 0.8)" strokeWidth="2" fill="none">
            {segmentums.map((segmentum) => (
              <path key={`border-${segmentum.id}`} d={segmentum.path} />
            ))}
          </g>

          {/* Segmentums - apenas os paths */}
          {segmentums.map((segmentum) => {
            const isSelected = selectedSegmentum === segmentum.id;
            const fillColor = isSelected
              ? segmentum.selectedColor
              : segmentum.color;

            return (
              <path
                key={segmentum.id}
                d={segmentum.path}
                fill={fillColor}
                stroke="rgba(34, 197, 94, 0.8)"
                strokeWidth="5"
                className="cursor-pointer transition-all duration-200 hover:opacity-80"
                onClick={() => onSegmentumSelect(segmentum.id)}
              />
            );
          })}

          {/* Textos dos segmentos - renderizados por último para ficarem por cima */}
          {segmentums.map((segmentum) => {
            const nameParts = segmentum.name.split(" ");
            const firstLine = nameParts[0];
            const secondLine = nameParts.slice(1).join(" ");
            const fontSize = segmentumTextSizes[segmentum.id] || 24;

            return (
              <text
                key={`text-${segmentum.id}`}
                x={segmentum.textPosition.x - 700}
                y={segmentum.textPosition.y - 580}
                textAnchor="middle"
                className="fill-white text-xs font-semibold pointer-events-none select-none"
                style={{ fontSize: `${fontSize}px` }}
              >
                <tspan
                  x={segmentum.textPosition.x - 700}
                  dy="0"
                  style={{ lineHeight: `${fontSize * 0.5}px` }}
                >
                  {firstLine}
                </tspan>
                <tspan
                  x={segmentum.textPosition.x - 700}
                  dy={`${fontSize * 1}`}
                  style={{ lineHeight: `${fontSize * 1}px` }}
                >
                  {secondLine}
                </tspan>
              </text>
            );
          })}
        </g>
      </svg>

      {/* Selection indicator */}
      {selectedSegmentum && (
        <div className="absolute top-2 right-2 bg-amber-500/20 border border-amber-500/40 text-white px-2 py-1 rounded text-xs font-semibold">
          {segmentums.find((s) => s.id === selectedSegmentum)?.name}
        </div>
      )}
    </div>
  );
}
