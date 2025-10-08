"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
   isOpen: boolean;
   onClose: () => void;
   onConfirm: () => void;
   title: string;
   message: string;
   confirmText?: string;
   cancelText?: string;
   variant?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
   isOpen,
   onClose,
   onConfirm,
   title,
   message,
   confirmText = "Confirmar",
   cancelText = "Cancelar",
   variant = "danger"
}: ConfirmDialogProps) {
   const handleConfirm = () => {
      onConfirm();
      onClose();
   };

   const getVariantStyles = () => {
      switch (variant) {
         case "danger":
            return {
               icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
               confirmButton: "bg-red-600 hover:bg-red-700 text-white py-2 px-3",
               titleColor: "text-red-400"
            };
         case "warning":
            return {
               icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
               confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white",
               titleColor: "text-yellow-400"
            };
         case "info":
            return {
               icon: <AlertTriangle className="w-8 h-8 text-blue-500" />,
               confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
               titleColor: "text-blue-400"
            };
      }
   };

   const styles = getVariantStyles();

   return (
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
         <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[200]" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/95 border border-amber-500/30 rounded-lg p-6 w-full max-w-md z-[200]">
               <div className="flex items-center gap-4 mb-4">
                  {styles.icon}
                  <Dialog.Title className={`text-xl font-semibold ${styles.titleColor}`}>
                     {title}
                  </Dialog.Title>
               </div>

               <div className="mb-6">
                  <p className="text-gray-300 leading-relaxed">
                     {message}
                  </p>
               </div>

               <div className="flex justify-end gap-3">
                  <Dialog.Close asChild>
                     <Button variant="cancel" onClick={onClose} className="py-2 px-3">
                        {cancelText}
                     </Button>
                  </Dialog.Close>
                  <Button
                     onClick={handleConfirm}
                     className={styles.confirmButton}
                  >
                     {confirmText}
                  </Button>
               </div>
            </Dialog.Content>
         </Dialog.Portal>
      </Dialog.Root>
   );
}
