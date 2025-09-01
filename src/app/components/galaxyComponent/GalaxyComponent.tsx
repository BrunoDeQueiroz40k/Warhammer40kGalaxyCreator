"use client";
import { useEffect } from "react";

export default function GalaxyComponent() {
   useEffect(() => {
      import("./main");
   }, []);

   return (
      <canvas id="canvas" className="w-full h-full block" />
   );
}
