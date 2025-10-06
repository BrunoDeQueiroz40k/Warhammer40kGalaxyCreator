import { PlanetData } from "./galaxyComponent/objects/planet";

interface PlanetLabelProps {
  planet: PlanetData;
  position: { x: number; y: number };
  isVisible: boolean;
}

export function PlanetLabel({ planet, position, isVisible }: PlanetLabelProps) {
  if (!isVisible) return null;

  // Verificar se a posição está dentro dos limites da tela
  const isWithinScreen = position.x > 0 && position.x < window.innerWidth && 
                        position.y > 0 && position.y < window.innerHeight;

  if (!isWithinScreen) return null;

  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{
        left: Math.max(10, Math.min(position.x, window.innerWidth - 10)), // Limitar dentro da tela
        top: Math.max(10, position.y - 30), // Posicionar acima do planeta, mas não sair da tela
        transform: 'translateX(-50%)', // Centralizar horizontalmente
        maxWidth: '200px', // Limitar largura máxima
        overflow: 'hidden', // Evitar overflow
      }}
    >
      <div className="bg-black/70 border border-amber-500/50 rounded-md px-2 py-1 text-xs text-amber-200 whitespace-nowrap backdrop-blur-sm truncate">
        {planet.name}
      </div>
    </div>
  );
}
