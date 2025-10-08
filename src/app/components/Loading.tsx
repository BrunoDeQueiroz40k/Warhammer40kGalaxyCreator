"use client";

import { useEffect, useRef } from 'react';

interface LoadingProps {
   size?: number; // Tamanho base (calcula width e height automaticamente)
   width?: number; // Largura do canvas (sobrescreve o cálculo automático)
   height?: number; // Altura do canvas (sobrescreve o cálculo automático)
   animationSpeed?: number; // Velocidade da animação (pixels por frame)
   className?: string; // Classes CSS adicionais
}

export function Loading({
   size,
   width,
   height,
   animationSpeed = 5,
   className = ""
}: LoadingProps) {
   // Calcular dimensões automaticamente se size for fornecido
   // Usar o bounding box real do path para eliminar espaços desnecessários
   const pathAspectRatio = 250 / 155; // width/height do path real
   const finalWidth = size ? size * pathAspectRatio : (width || 400);
   const finalHeight = size ? size : (height || 200);
   const canvasRef = useRef<HTMLCanvasElement>(null);

   useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const canvasWidth = finalWidth;
      const canvasHeight = finalHeight;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Path data combinado (original + espelhado deslocado)
      const pathData = "M93.531 94.429C93.554 94.4 93.644 94.05 93.381 93.992L.371 48.124C.294 48.124.058 48.147-.006 48.459L3.457 61.617 72.457 91.029 72.463 91.308 71.331 92.591 70.923 92.594 5.211 66.583C5.122 66.601 4.883 66.712 4.878 66.915L10.046 79.963 68.253 95.772 68.253 96.082 66.526 98.534 66.134 98.553 13.134 86.672C13.035 86.679 12.792 86.722 12.818 86.977L17.29 98.551 65.334 102.225 65.119 104.909 20.461 104.923C20.394 104.91 20.131 105.034 20.17 105.32L26.513 116.508 64.592 108.933 65.126 108.903 65.486 111.303 30.124 122.008C29.971 122.071 29.794 122.219 30.014 122.541L36.249 130.248 66.77 117.032 67.191 117.034 67.976 118.39 67.979 118.701 39.733 134.404C39.675 134.407 39.501 134.65 39.66 134.867L47.751 141.283 70.95 121.998 71.172 121.998 72.451 122.992 72.451 123.152 42.012 153.155C42.061 153.331 41.761 153.57 42.159 153.683L55.932 152.024 76.094 125.09 76.558 125.085 77.902 125.447 77.902 125.735 63.485 149.707C63.421 149.764 63.455 150.189 63.756 150.174L74.584 147.916 81.918 126.337 83.932 126.261 78.959 146.147C78.916 146.235 79.097 146.679 79.514 146.419L88.842 137.307 88.839 126.803 90.864 126.459 90.861 134.826 91.403 134.946 96.338 129.161 96.043 125.37 97.7 124.931 98.113 124.926 99.591 128.315 99.588 128.62 74.409 156.178C74.252 156.342 74.162 156.769 74.598 156.842L94.939 158.026 116.868 122.111C116.926 122.026 117.058 121.704 116.841 121.495L110.711 112.319C110.65 112.229 110.369 112.068 110.167 112.316 80.751 136.019 58.914 96.35 92.151 97.185M117.919 119.415 109.732 107.349C109.594 107.108 109.689 106.951 109.769 106.863L115.037 101.133 115.315 100.921 117.943 100.933 123.717 110.118C123.762 110.185 123.756 110.375 123.712 110.429L118.424 119.395C118.41 119.44 118.154 119.684 117.919 119.415M104.822 103.611 102.347 100.158 98.361 100.164C93.822 102.751 91.545 103.617 92.927 105.454L96.433 108.984C96.63 109.243 96.883 109.196 97.026 109.017 98.516 103.037 103.892 104.148 104.606 104.017 104.81 103.927 104.854 103.701 104.821 103.611M108.148 105.303C108.451 105.752 108.576 105.498 108.762 105.309L114.389 99.478 118.09 99.469 121.73 95.36C121.85 95.228 121.869 94.843 121.464 94.845L103.496 94.849C103.286 94.827 103.043 94.877 102.88 95.092L100.207 97.622C100.089 97.724 99.958 98.05 100.248 98.196L100.81 98.626 103.177 98.64M101.394 154.07 95.581 163.948 87.259 163.744C87.038 163.744 86.721 163.786 86.844 164.271L87.945 168.853C88.177 169.369 88.398 169.065 88.537 168.847L88.987 167.272 92.379 167.551 92.385 167.847 85.82 177.91C85.7 178.131 85.635 178.454 85.991 178.514L94.795 180.276C95.127 180.149 95.038 179.812 94.931 179.732L91.355 175.675 91.349 175.545 96.76 169.914 97.062 169.902 101.827 174.273 101.833 174.628 98.682 179.365C98.433 179.729 98.847 180.007 98.969 179.91L106.065 176.232C106.263 176.08 106.117 175.875 106.035 175.757L100.125 166.767 100.113 166.434 105.669 157.947 102.237 153.927C102.061 153.752 101.745 153.416 101.395 154.069M125.496 113.176C125.316 112.65 124.839 112.305 124.437 113.25L102.392 150.548C102.273 150.725 102.158 150.908 102.406 151.208L107.644 157.52 107.717 157.702 107.711 158.199 102.506 166.484 104.152 168.819C104.322 169.089 104.52 169.097 104.732 168.828L109.822 161.107 110.083 161.095 110.507 161.693 110.502 161.984 105.437 170.117C105.325 170.275 105.173 170.381 105.424 170.717L106.988 173.555C107.265 173.855 107.447 173.848 107.632 173.537L112.04 163.868 112.327 163.828 112.733 164.398 112.74 164.779 108.228 175.266C108.084 175.498 108.016 175.779 108.249 176.026L111.757 182.527C111.827 182.759 112.109 183.064 112.373 182.634L121.501 163.825 121.696 163.806 122.465 164.696 122.463 165.032 114.138 184.622C114.055 184.827 113.938 185.061 114.152 185.259L124.195 200.842C124.669 201.57 124.939 202.737 125.826 200.802L135.862 185.262C135.912 185.215 136.114 184.978 135.859 184.59L127.529 165.069 127.522 164.695 128.321 163.833 128.504 163.834 137.55 182.524C137.806 183.103 138.09 182.897 138.239 182.548L141.814 175.906C141.854 175.834 141.988 175.681 141.812 175.402L137.288 164.78 137.273 164.416 137.658 163.841 137.929 163.824 142.304 173.462C142.542 173.996 142.891 173.807 143.077 173.456L144.597 170.668C144.655 170.589 144.815 170.385 144.566 170.112L139.515 162.022 139.496 161.668 139.909 161.124 140.17 161.106 145.201 168.742C145.468 169.182 145.752 169.028 145.909 168.731L147.309 166.738C147.39 166.641 147.545 166.482 147.295 166.144L142.316 158.216 142.298 157.594 147.533 151.262C147.62 151.215 147.899 150.881 147.551 150.497M147.716 153.983 144.518 157.755C144.399 157.837 144.372 158.115 144.568 158.302L149.879 166.44 149.885 166.749 144.03 175.668 144.088 176.332 150.894 179.818C151.369 180.066 151.536 179.545 151.279 179.282L148.171 174.648 148.174 174.253 152.915 169.923 153.25 169.922 158.614 175.506 158.614 175.708 155.152 179.644C154.693 180.031 155.331 180.35 155.382 180.259L164.001 178.501C164.276 178.474 164.47 178.285 164.014 177.721L157.604 167.844 157.604 167.541 161.005 167.254 161.479 168.893C161.731 169.369 161.949 169.133 162.085 168.85L163.122 164.366C163.318 163.773 162.662 163.68 162.454 163.759L154.386 163.954 148.562 153.983C148.328 153.633 148.049 153.539 147.716 153.982M132.317 100.93C132.158 100.934 131.996 101.034 131.806 101.333L126.431 109.894C126.405 109.956 126.078 110.219 126.426 110.644L131.476 119.214C131.765 119.767 131.97 119.524 132.221 119.212L140.156 107.481C140.313 107.311 140.424 107.052 140.158 106.801L134.745 100.926M128.591 94.844C127.981 94.806 128.203 95.412 128.42 95.541L131.929 99.477 135.622 99.481 141.231 105.308C141.464 105.677 141.713 105.539 141.845 105.329L146.831 98.615 149.173 98.638 149.634 98.286C149.688 98.256 150.251 97.962 149.627 97.453L146.824 94.848M147.614 100.152 145.427 103.208C145.229 103.453 145.005 103.882 145.42 104.039 150.719 103.624 152.191 106.484 152.904 108.744 153.053 109.481 153.451 109.152 153.699 108.871L157.069 105.44C157.463 105.118 157.895 104.025 156.438 102.931L151.606 100.165M156.897 93.848C156.743 93.951 156.151 94.071 156.613 94.669L157.875 97.173C191.931 97.288 167.533 135.792 140.048 112.516 139.86 112.362 139.561 111.87 139.159 112.522L133.253 121.386 133.253 122.291 155.068 158.014 175.357 156.836C175.784 156.709 175.909 156.416 175.303 155.892L150.403 128.625 150.4 128.317 151.891 124.945 152.319 124.939 153.944 125.368 153.675 129.161 158.471 134.784C158.832 135.27 159.114 135.019 159.143 134.675L159.14 126.463 161.14 126.829 161.143 137.291 170.39 146.29C170.878 146.803 171.108 146.131 170.943 145.857L166.102 126.692 166.096 126.263 168.085 126.346 175.436 147.917 185.978 150.122C186.719 150.373 186.553 149.632 186.311 149.348L172.108 125.746 172.114 125.423 173.423 125.069 173.94 125.065 194.121 152.068 207.707 153.647C208.209 153.662 208.148 153.299 207.786 152.986L177.547 123.166 177.549 122.97 178.811 122.003 179.073 122 202.222 141.299 210.15 134.989C210.36 134.867 210.556 134.568 210.078 134.301L182.053 118.718 182.058 118.357 182.789 117.041 183.248 117.036 213.737 130.27 219.888 122.602C220.088 122.354 220.165 122.145 219.729 121.989L184.604 111.336 184.522 110.836 184.891 108.917 185.399 108.917 223.475 116.502 229.709 105.541C229.868 105.326 229.865 104.933 229.451 104.916L184.913 104.917 184.661 102.223 232.713 98.562 237.123 87.114C237.182 86.862 237.066 86.617 236.649 86.732L183.9 98.505 183.482 98.538 181.746 96.097 181.737 95.785 239.984 79.938 245.025 67.134C245.093 66.928 245.041 66.49 244.541 66.713L179.163 92.569 178.653 92.556 177.561 91.33 177.574 90.973 246.507 61.603 249.91 48.792C249.978 48.408 250.108 47.951 249.336 48.273Z";

      // Bounding box do path (coordenadas aproximadas baseadas no path)
      const pathBounds = {
         minX: -1,
         minY: 48,
         maxX: 249,
         maxY: 203
      };

      // Calcular dimensões reais do path
      const pathWidth = pathBounds.maxX - pathBounds.minX;
      const pathHeight = pathBounds.maxY - pathBounds.minY;

      const path = new Path2D(pathData);

      let shinePosition = -200;
      let animationId: number;

      const animate = () => {
         ctx.clearRect(0, 0, canvasWidth, canvasHeight);

         // Calcular escala e posição para centralizar o path no canvas
         const scaleX = canvasWidth / pathWidth;
         const scaleY = canvasHeight / pathHeight;
         const scale = Math.min(scaleX, scaleY);

         const offsetX = (canvasWidth - pathWidth * scale) / 2;
         const offsetY = (canvasHeight - pathHeight * scale) / 2;

         // Aplicar transformação para centralizar e escalar o path
         ctx.save();
         ctx.translate(offsetX, offsetY);
         ctx.scale(scale, scale);
         ctx.translate(-pathBounds.minX, -pathBounds.minY);

         const eagleGradient = ctx.createLinearGradient(0, 0, pathWidth, pathHeight);
         eagleGradient.addColorStop(0, '#8B6914'); // Darker gold
         eagleGradient.addColorStop(0.3, '#B8860B'); // DarkGoldenRod
         eagleGradient.addColorStop(0.5, '#CD853F'); // Peru (darker gold)
         eagleGradient.addColorStop(0.7, '#B8860B'); // DarkGoldenRod
         eagleGradient.addColorStop(1, '#8B6914'); // Darker gold

         // Desenhar sombra da águia
         ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
         ctx.shadowBlur = 8;
         ctx.shadowOffsetX = 2;
         ctx.shadowOffsetY = 2;
         ctx.fillStyle = '#654321';
         ctx.fill(path);

         // Desenhar a águia com gradiente dourado
         ctx.fillStyle = eagleGradient;
         ctx.fill(path);

         // Criar máscara para o brilho
         ctx.save();
         ctx.clip(path);

         // Ajustar posição do brilho para o sistema de coordenadas transformado
         const transformedShinePosition = (shinePosition - offsetX) / scale + pathBounds.minX;

         // Criar gradiente de brilho dourado mais realista
         const shineGradient = ctx.createLinearGradient(transformedShinePosition - 80, 0, transformedShinePosition + 80, 0);
         shineGradient.addColorStop(0, 'rgba(255, 215, 0, 0)'); // Gold transparent
         shineGradient.addColorStop(0.2, 'rgba(255, 215, 0, 0.3)'); // Gold semi-transparent
         shineGradient.addColorStop(0.4, 'rgba(255, 255, 0, 0.4)'); // Yellow highlight
         shineGradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.7)'); // Bright yellow center
         shineGradient.addColorStop(0.6, 'rgba(255, 255, 0, 0.4)'); // Yellow highlight
         shineGradient.addColorStop(0.8, 'rgba(255, 215, 0, 0.3)'); // Gold semi-transparent
         shineGradient.addColorStop(1, 'rgba(255, 215, 0, 0)'); // Gold transparent

         // Adicionar brilho secundário dourado para mais realismo
         const secondaryShine = ctx.createLinearGradient(transformedShinePosition - 40, 0, transformedShinePosition + 40, 0);
         secondaryShine.addColorStop(0, 'rgba(255, 215, 0, 0)');
         secondaryShine.addColorStop(0.3, 'rgba(255, 255, 0, 0.2)');
         secondaryShine.addColorStop(0.5, 'rgba(255, 255, 0, 0.5)');
         secondaryShine.addColorStop(0.7, 'rgba(255, 255, 0, 0.2)');
         secondaryShine.addColorStop(1, 'rgba(255, 215, 0, 0)');

         // Aplicar brilho principal
         ctx.fillStyle = shineGradient;
         ctx.fillRect(pathBounds.minX, pathBounds.minY, pathWidth, pathHeight);

         // Aplicar brilho secundário para mais intensidade
         ctx.fillStyle = secondaryShine;
         ctx.fillRect(pathBounds.minX, pathBounds.minY, pathWidth, pathHeight);

         ctx.restore();
         ctx.restore(); // Restaurar transformações

         // Atualizar posição do brilho
         shinePosition += animationSpeed;
         if (shinePosition > canvasWidth + 100) {
            shinePosition = -200;
         }

         animationId = requestAnimationFrame(animate);
      };

      animate();

      return () => {
         if (animationId) {
            cancelAnimationFrame(animationId);
         }
      };
   }, [finalWidth, finalHeight, animationSpeed]);

   return (
      <canvas
         ref={canvasRef}
         className={`select-none pointer-events-none ${className}`}
         style={{ width: `${finalWidth}px`, height: `${finalHeight}px` }}
      />
   )
}
