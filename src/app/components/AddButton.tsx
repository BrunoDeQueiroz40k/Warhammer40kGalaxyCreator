import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useState, useEffect } from "react";
import { planetTypes } from "./icons/icons";
import { GiRingedPlanet } from "react-icons/gi";
import * as Dialog from "@radix-ui/react-dialog";
import { PlanetIcon } from "@phosphor-icons/react";
import { ArrowDownToLine, Plus } from "lucide-react";
import { PlanetData, Planet } from "./galaxyComponent/objects/planet";

const planetColors = [
  { name: "Azul", text: "text-blue-500" },
  { name: "Verde", text: "text-emerald-500" },
  { name: "Vermelho", text: "text-red-500" },
  { name: "Amarelo", text: "text-amber-500" },
  { name: "Roxo", text: "text-purple-500" },
];

interface GalaxyInstance {
  addPlanet: (planetData: PlanetData) => void;
  getPlanetInEditMode: () => Planet | null;
  confirmPlanetPosition: (planet: Planet) => void;
}

export function AddButton() {
  const [planetData, setPlanetData] = useState<PlanetData>({
    name: "",
    faction: "",
    planetType: "",
    description: "",
    position: { x: 0, y: 0, z: 0 },
  });
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [planetInEditMode, setPlanetInEditMode] = useState<Planet | null>(null);

  const handleCreatePlanet = () => {
    // Access the global galaxy instance
    const galaxyInstance = (window as { galaxyInstance?: GalaxyInstance })
      .galaxyInstance;
    if (galaxyInstance && galaxyInstance.addPlanet) {
      // Create planet at position (0,0,0) - it will enter edit mode automatically
      const planetDataWithDefaultPosition = {
        ...planetData,
        color: selectedColor,
        position: { x: 0, y: 0, z: 0 },
      };

      galaxyInstance.addPlanet(planetDataWithDefaultPosition);
      console.log(
        "Planeta criado em modo de edição:",
        planetDataWithDefaultPosition
      );

      // Reset form
      setPlanetData({
        name: "",
        faction: "",
        planetType: "",
        description: "",
        position: { x: 0, y: 0, z: 0 },
      });
      setSelectedColor("");

      // Close dialog
      setOpen(false);

      // Check for planet in edit mode
      setTimeout(() => {
        checkPlanetInEditMode();
      }, 100);
    } else {
      console.error("Galaxy instance not found");
    }
  };

  const checkPlanetInEditMode = () => {
    const galaxyInstance = (window as { galaxyInstance?: GalaxyInstance })
      .galaxyInstance;
    if (galaxyInstance && galaxyInstance.getPlanetInEditMode) {
      const planet = galaxyInstance.getPlanetInEditMode();
      setPlanetInEditMode(planet);
    }
  };

  const handleConfirmPosition = () => {
    if (planetInEditMode) {
      const galaxyInstance = (window as { galaxyInstance?: GalaxyInstance })
        .galaxyInstance;
      if (galaxyInstance && galaxyInstance.confirmPlanetPosition) {
        galaxyInstance.confirmPlanetPosition(planetInEditMode);
        setPlanetInEditMode(null);
        console.log("Posição do planeta confirmada!");
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(checkPlanetInEditMode, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <Button className="fixed bottom-3.5 left-3.5 z-20 p-2 px-4 text-lg">
            <Plus className="!w-5 !h-5" />
            <p>Adicionar planeta</p>
          </Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Dialog.Content className="bg-black/90 rounded-md border border-amber-500/30 p-6 w-full max-w-md text-white">
              <Dialog.Title className="text-xl font-semibold mb-4">
                Crie o seu planeta!
              </Dialog.Title>

              <Label>Nome:</Label>
              <Input
                type="text"
                placeholder="Digite o nome do planeta"
                value={planetData.name}
                onChange={(e) =>
                  setPlanetData({ ...planetData, name: e.target.value })
                }
              />
              <Label>Facção:</Label>
              <Select
                onValueChange={(value) =>
                  setPlanetData({ ...planetData, faction: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a facção do planeta" />
                </SelectTrigger>
                <SelectContent className="">
                  <SelectItem value="Imperium">Imperium</SelectItem>
                  <SelectItem value="Necrons">Necrons</SelectItem>
                  <SelectItem value="Caos">Caos</SelectItem>
                  <SelectItem value="Orks">Orks</SelectItem>
                  <SelectItem value="Xenos">Xenos</SelectItem>
                  <SelectItem value="Tau">Tau</SelectItem>
                  <SelectItem value="Aeldari">Aeldari</SelectItem>
                </SelectContent>
              </Select>
              <Label>Tipo do planeta:</Label>
              <Select
                onValueChange={(value) =>
                  setPlanetData({ ...planetData, planetType: value })
                }
              >
                <SelectTrigger
                  className="w-full"
                  placeholderIcon={<PlanetIcon className="w-5 h-5" />}
                >
                  <SelectValue placeholder="Selecione o tipo do planeta" />
                </SelectTrigger>
                <SelectContent className="max-h-[250px]">
                  {planetTypes.map((planetType) => (
                    <SelectItem
                      key={planetType.value}
                      value={planetType.value}
                      icon={<planetType.icon className="w-4 h-4" />}
                    >
                      {planetType.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-3">
                  <p className="text-amber-400 text-sm font-medium mb-2">📍 Modo de Edição</p>
                  <p className="text-slate-300 text-xs">
                    Após criar o planeta, ele aparecerá na posição (0,0,0) com um indicador verde.
                    Clique e arraste para posicioná-lo onde desejar, depois use o botão &quot;Posicionar Planeta&quot; para confirmar.
                  </p>
                </div> */}
              <Label>Descrição:</Label>
              <Textarea
                placeholder="Descreva o planeta"
                value={planetData.description}
                onChange={(e) =>
                  setPlanetData({
                    ...planetData,
                    description: e.target.value,
                  })
                }
              />
              <Label>Selecione a cor do planeta:</Label>
              <div className="flex justify-between mt-2">
                {planetColors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    className={`
                        py-5 px-3 rounded-md border text-amber-400 border-amber-500/30 transition-all duration-100 hover:bg-amber-500/15 cursor-pointer
                        ${
                          selectedColor === color.name
                            ? "text-amber-400 bg-amber-500/20 border border-amber-500/30"
                            : "hover:bg-amber-500/20"
                        }
                        ${color.text}
                      `}
                    title={color.name}
                  >
                    <div>
                      <GiRingedPlanet className="w-12 h-12" />
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <Dialog.Close asChild>
                  <Button variant="cancel" className="px-4 py-2">
                    Cancelar
                  </Button>
                </Dialog.Close>
                <Button
                  variant="accept"
                  className="px-4 py-2"
                  onClick={handleCreatePlanet}
                >
                  Criar Planeta
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Botão para posicionar planeta quando estiver em modo de edição */}
      {planetInEditMode && (
        <Button
          variant="white"
          onClick={handleConfirmPosition}
          className="fixed bottom-3.5 left-60 z-20 p-2 px-4 text-lg"
        >
          <ArrowDownToLine className="!w-5 !h-5" />
          <span>Posicionar Planeta</span>
        </Button>
      )}
    </>
  );
}
