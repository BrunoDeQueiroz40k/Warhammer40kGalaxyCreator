import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

export function AddButton() {
  return (
    <Dialog.Root>
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
            <Dialog.Description className="mb-4">
              <Label>Nome:</Label>
              <Input type="text" placeholder="Digite o nome do planeta" />
              <Label>Descrição:</Label>
              <Textarea />
            </Dialog.Description>
            <div className="flex gap-3 justify-end">
              <Dialog.Close asChild>
                <Button variant="cancel" className="px-4 py-2">
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button variant="accept" className="px-4 py-2">
                Criar Planeta
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
