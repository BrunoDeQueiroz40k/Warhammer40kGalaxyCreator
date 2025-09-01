import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState, useEffect } from "react";
import { PlanetData, Planet } from "./galaxyComponent/objects/planet";

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
    position: { x: 0, y: 0, z: 0 }
  });
  const [open, setOpen] = useState(false);
  const [planetInEditMode, setPlanetInEditMode] = useState<Planet | null>(null);

  const handleCreatePlanet = () => {
    // Access the global galaxy instance
    const galaxyInstance = (window as { galaxyInstance?: GalaxyInstance }).galaxyInstance;
    if (galaxyInstance && galaxyInstance.addPlanet) {
      // Create planet at position (0,0,0) - it will enter edit mode automatically
      const planetDataWithDefaultPosition = {
        ...planetData,
        position: { x: 0, y: 0, z: 0 }
      };

      galaxyInstance.addPlanet(planetDataWithDefaultPosition);
      console.log("Planeta criado em modo de edição:", planetDataWithDefaultPosition);

      // Reset form
      setPlanetData({
        name: "",
        faction: "",
        planetType: "",
        description: "",
        position: { x: 0, y: 0, z: 0 }
      });

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
    const galaxyInstance = (window as { galaxyInstance?: GalaxyInstance }).galaxyInstance;
    if (galaxyInstance && galaxyInstance.getPlanetInEditMode) {
      const planet = galaxyInstance.getPlanetInEditMode();
      setPlanetInEditMode(planet);
    }
  };

  const handleConfirmPosition = () => {
    if (planetInEditMode) {
      const galaxyInstance = (window as { galaxyInstance?: GalaxyInstance }).galaxyInstance;
      if (galaxyInstance && galaxyInstance.confirmPlanetPosition) {
        galaxyInstance.confirmPlanetPosition(planetInEditMode);
        setPlanetInEditMode(null);
        console.log("Posição do planeta confirmada!");
      }
    }
  };

  // Check for planet in edit mode periodically
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
              <Dialog.Description>
                <Label>Nome:</Label>
                <Input
                  type="text"
                  placeholder="Digite o nome do planeta"
                  value={planetData.name}
                  onChange={(e) => setPlanetData({ ...planetData, name: e.target.value })}
                />
                <Label>Facção:</Label>
                <Select onValueChange={(value) => setPlanetData({ ...planetData, faction: value })}>
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
                <Select onValueChange={(value) => setPlanetData({ ...planetData, planetType: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo do planeta" />
                  </SelectTrigger>
                  <SelectContent className="">
                    <SelectItem value="Mundos Feudais">Mundos Feudais</SelectItem>
                    <SelectItem value="Mundos Forjas">Mundos Forjas</SelectItem>
                    <SelectItem value="Mundos Colmeias">Mundos Colmeias</SelectItem>
                    <SelectItem value="Mundos Selvagens">Mundos Selvagens</SelectItem>
                    <SelectItem value="Mundos Arsenais">Mundos Arsenais</SelectItem>
                    <SelectItem value="Mundos Cavaleiros">Mundos Cavaleiros</SelectItem>
                    <SelectItem value="Mundos Santuários">Mundos Santuários</SelectItem>
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
                  onChange={(e) => setPlanetData({ ...planetData, description: e.target.value })}
                />
              </Dialog.Description>
              <div className="flex gap-3 justify-end">
                <Dialog.Close asChild>
                  <Button variant="cancel" className="px-4 py-2">
                    Cancelar
                  </Button>
                </Dialog.Close>
                <Button variant="accept" className="px-4 py-2" onClick={handleCreatePlanet}>
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
          onClick={handleConfirmPosition}
          className="fixed bottom-3.5 left-48 z-20 p-2 px-4 text-lg bg-green-600 hover:bg-green-700"
        >
          <span className="text-white">📍 Posicionar Planeta</span>
        </Button>
      )}
    </>
  );
}
