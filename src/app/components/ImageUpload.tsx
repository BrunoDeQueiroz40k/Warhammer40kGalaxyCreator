import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { X, Image as ImageIcon, RotateCcw } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
   value?: string;
   onChange: (imageData: string | null) => void;
   label?: string;
}

interface ImagePosition {
   x: number;
   y: number;
   scale: number;
}

export function ImageUpload({ value, onChange, label = "Imagem" }: ImageUploadProps) {
   const [preview, setPreview] = useState<string | null>(value || null);
   const [position, setPosition] = useState<ImagePosition>({ x: 0, y: 0, scale: 1 });
   const [isDragging, setIsDragging] = useState(false);
   const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
   const fileInputRef = useRef<HTMLInputElement>(null);
   const containerRef = useRef<HTMLDivElement>(null);

   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
         // Verificar se é uma imagem válida
         const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
         if (!validTypes.includes(file.type)) {
            alert('Por favor, selecione apenas arquivos de imagem (JPEG, PNG, GIF, WebP).');
            return;
         }

         // Verificar tamanho (máximo 5MB)
         if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB.');
            return;
         }

         const reader = new FileReader();
         reader.onload = (e) => {
            const result = e.target?.result as string;
            setPreview(result);
            setPosition({ x: 0, y: 0, scale: 1 }); // Reset position for new image
            onChange(result);
         };
         reader.readAsDataURL(file);
      }
   };

   const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
         x: 0, // Não usado para movimento horizontal
         y: e.clientY - position.y,
      });
   };

   // const handleMouseMove = (e: React.MouseEvent) => {
   //    if (!isDragging) return;
   //    e.preventDefault();

   //    const newY = e.clientY - dragStart.y;
   //    const containerHeight = containerRef.current?.clientHeight || 128;
   //    const maxY = containerHeight / 2;
   //    const minY = -maxY;
   //    const clampedY = Math.max(minY, Math.min(maxY, newY));

   //    setPosition({
   //       x: 0, 
   //       y: clampedY,
   //       scale: 1,
   //    });
   // };

   const handleMouseUp = () => {
      setIsDragging(false);
   };

   // Removida a função de scroll/zoom

   const resetPosition = () => {
      setPosition({ x: 0, y: 0, scale: 1 });
   };

   const handleRemove = () => {
      setPreview(null);
      onChange(null);
      if (fileInputRef.current) {
         fileInputRef.current.value = '';
      }
   };

   const handleClick = () => {
      fileInputRef.current?.click();
   };

   return (
      <div className="space-y-2 mt-2">
         <Label>{label}:</Label>

         {preview ? (
            <div className="relative">
               <div
                  ref={containerRef}
                  className="relative w-full h-32 rounded-lg overflow-hidden border border-amber-500/30 bg-gray-900 mt-1"
                  // onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
               >
                  <div
                     className="absolute cursor-move select-none flex items-center justify-center"
                     onMouseDown={handleMouseDown}
                     style={{
                        width: '100%',
                        height: '100%',
                        transform: `translateY(${position.y}px)`,
                        transformOrigin: 'center center',
                        transition: isDragging ? 'none' : 'transform 0.1s ease',
                     }}
                  >
                     <Image
                        src={preview}
                        alt="Preview"
                        width={400}
                        height={300}
                        className="w-full h-full object-cover"
                        draggable={false}
                     />
                  </div>

                  {/* Controles */}
                  <div className="absolute top-2 left-2 flex gap-1">
                     <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={resetPosition}
                        className="bg-black/50 hover:bg-black/70 text-white w-8 h-8 p-0 min-w-8"
                        title="Resetar posição"
                     >
                        <RotateCcw className="w-4 h-4" />
                     </Button>
                  </div>

                  <Button
                     type="button"
                     variant="ghost"
                     size="sm"
                     onClick={handleRemove}
                     className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 p-0 min-w-8"
                  >
                     <X className="w-4 h-4" />
                  </Button>

                  {/* Instruções */}
                  {/* <div className="absolute bottom-2 left-2 right-2 text-center">
                     <p className="text-xs text-white/70 bg-black/50 px-2 py-1 rounded">
                        Arraste verticalmente para posicionar
                     </p>
                  </div> */}
               </div>
            </div>
         ) : (
            <div
               onClick={handleClick}
               className="w-full mt-1 h-32 border-2 border-dashed border-amber-500/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-colors"
            >
               <ImageIcon className="w-8 h-8 text-amber-400 mb-2" />
               <p className="text-sm text-amber-400 font-medium">Clique para selecionar uma imagem</p>
               <p className="text-xs text-slate-400 mt-1">JPEG, PNG, GIF, WebP até 5MB</p>
            </div>
         )}

         <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="hidden"
         />
      </div>
   );
}
