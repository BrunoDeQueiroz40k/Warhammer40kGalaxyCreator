"use client";
import { useEffect } from "react";

export default function GalaxyComponent() {
   useEffect(() => {
      // Dynamically import the main logic to ensure it runs only on the client
      import("./main");
   }, []);

   return (
      <canvas id="canvas" style={{ width: "100vw", height: "100vh", display: "block" }} />
   );
}
