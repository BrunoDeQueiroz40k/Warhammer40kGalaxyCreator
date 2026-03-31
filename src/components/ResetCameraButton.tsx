import { RefreshCcw } from "lucide-react";

import { Button } from "./ui/button";
import { GalaxyNavigator } from "@/lib/galaxyNavigator";

export function ResetCameraButton() {
  const handleResetCamera = () => {
    GalaxyNavigator.resetCamera();
  };

  return (
    <Button
      onClick={handleResetCamera}
      className="p-2"
      title="Retornar câmera para posição inicial"
    >
      <RefreshCcw className="!w-6 !h-6" />
    </Button>
  );
}
