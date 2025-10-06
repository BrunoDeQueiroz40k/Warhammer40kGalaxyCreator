import { Button } from "./ui/button";
import { RefreshCcw } from "lucide-react";
import { GalaxyNavigator } from "../../lib/GalaxyNavigator";

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
