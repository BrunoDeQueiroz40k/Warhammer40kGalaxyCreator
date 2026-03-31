import { PlanetLabelProps } from "@/types/interfaces";

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
      <div className="bg-black/75 border border-amber-500/60 rounded-md px-2.5 py-1 text-xs text-amber-100 whitespace-nowrap backdrop-blur-sm truncate font-semibold tracking-wide">
        {planet.name?.toUpperCase?.() ?? "PLANETA SEM NOME"}
      </div>
    </div>
  );
}
