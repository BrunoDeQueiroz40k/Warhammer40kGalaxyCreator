import { Button } from "./ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import { CircleQuestionMark } from "lucide-react";

export function HelpButton() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button className="p-2">
          <CircleQuestionMark className="!w-6 !h-6" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Dialog.Content className="bg-black/90 rounded-md border border-amber-500/30 p-6 w-full max-w-md text-white">
            <Dialog.Title className="text-xl font-semibold mb-4">
              Sobre este projeto
            </Dialog.Title>
            <Dialog.Description></Dialog.Description>
            <div className="flex gap-3 justify-end">
              <Dialog.Close asChild>
                <Button variant="blue" className="px-4 py-2">
                  Ok
                </Button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
