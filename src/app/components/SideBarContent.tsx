import { Star, Settings, HelpCircle, Palette, Download } from "lucide-react";

interface SideBarContentProps {
  onItemClick?: (item: string) => void;
}

export function SideBarContent({ onItemClick }: SideBarContentProps) {
  const menuItems = [
    {
      id: "galaxy",
      label: "Galáxia",
      icon: Star,
      color: "bg-blue-500",
      description: "Configurar galáxia",
    },
    {
      id: "settings",
      label: "Configurações",
      icon: Settings,
      color: "bg-green-500",
      description: "Ajustes gerais",
    },
    {
      id: "colors",
      label: "Cores",
      icon: Palette,
      color: "bg-purple-500",
      description: "Paleta de cores",
    },
    {
      id: "export",
      label: "Exportar",
      icon: Download,
      color: "bg-orange-500",
      description: "Salvar galáxia",
    },
    {
      id: "help",
      label: "Ajuda",
      icon: HelpCircle,
      color: "bg-gray-500",
      description: "Documentação",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Card de Boas-vindas */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
        <h3 className="font-medium text-blue-900">
          Bem-vindo ao Galaxy Creator!
        </h3>
        <p className="text-sm text-blue-700 mt-1">
          Crie sua galáxia personalizada do universo Warhammer 40k
        </p>
      </div>

      {/* Menu de Navegação */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 transition-all duration-200 group"
            >
              <div className={cn("w-2 h-2 rounded-full", item.color)}></div>
              <IconComponent className="h-4 w-4 text-gray-600 group-hover:text-gray-800" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {item.label}
                </span>
                <span className="text-xs text-gray-500">
                  {item.description}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Warhammer 40k Galaxy Creator
        </p>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
