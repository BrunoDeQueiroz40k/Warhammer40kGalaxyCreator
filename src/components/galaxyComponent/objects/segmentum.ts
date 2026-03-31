import * as THREE from "three";

export interface SegmentumData {
  id: string;
  name: string;
  color: string;
  selectedColor: string;
  path: string;
  textPosition: { x: number; y: number };
}

export const segmentums: SegmentumData[] = [
  {
    id: "solar",
    name: "Segmentum Solar",
    color: "rgba(220, 38, 38, 0.6)", // Vermelho escuro
    selectedColor: "rgba(220, 38, 38, 0.9)",
    path: "M-127.44-128.025-145.485-153.45C-218.475-89.37-209.295-2.79-178.2 49.545L-205.65 68.13C-150.975 166.725-21.51 165.96 46.26 115.74L27.18 89.055C44.685 77.805 126.81-.135 61.425-122.58L84.465-139.05C76.95-152.145 49.14-180.63 27.18-188.775L1.8-139.05C-9.99-144.54-70.92-175.95-126.9-127.035",
    textPosition: { x: 650, y: 550 },
  },
  {
    id: "pacificus",
    name: "Segmentum Pacificus",
    color: "rgba(251, 146, 60, 0.6)", // Laranja
    selectedColor: "rgba(251, 146, 60, 0.9)",
    path: "M-264.465-326.13C-403.65-220.86-481.005-22.59-366.705 176.085L-178.785 49.86C-221.4-18.18-203.175-107.64-146.34-154.53",
    textPosition: { x: 400, y: 490 },
  },
  {
    id: "tempestus",
    name: "Segmentum Tempestus",
    color: "rgba(6, 182, 212, 0.6)", // Azul-petróleo
    selectedColor: "rgba(6, 182, 212, 0.9)",
    path: "M-390.78 194.31C-359.505 260.55-290.16 329.085-251.37 358.74L-264.6 376.335C-231.84 410.985-142.11 452.025-108.36 460.665L-115.29 493.695C-57.6 506.7 116.865 518.76 255.825 407.07L45.45 115.65C8.82 152.28-126.405 189.135-206.46 69.885",
    textPosition: { x: 600, y: 830 },
  },
  {
    id: "obscurus",
    name: "Segmentum Obscurus",
    color: "rgba(163, 230, 53, 0.6)", // Amarelo-esverdeado
    selectedColor: "rgba(163, 230, 53, 0.9)",
    path: "M354.33-322.74C273.6-422.505 188.82-466.515 109.845-489.87L100.125-467.55C61.515-477.945-41.535-505.17-174.645-464.31L-186.705-483.255C-239.22-469.575-301.455-425.115-322.785-409.635L-127.26-128.79C-70.02-173.835-14.04-148.455 1.62-139.815L26.73-190.575C53.415-177.21 82.71-144.27 84.15-138.96",
    textPosition: { x: 700, y: 250 },
  },
  {
    id: "ultima",
    name: "Ultima Segmentum",
    color: "rgba(147, 51, 234, 0.6)", // Azul-púrpura
    selectedColor: "rgba(147, 51, 234, 0.9)",
    path: "M61.2-121.185l537.255-364.86c23.895 31.59 48.735 61.785 66.24 98.82l-66.375 32.625c42.975 81.675 66.24 159.66 80.82 243.855l75.105-7.155c12.465 98.55 10.305 241.65-40.86 367.335l-38.16-11.7c-29.385 75.105-76.005 163.26-132.705 225.675l26.82 24.84c-46.305 50.715-98.685 97.02-160.74 130.14L26.055 89.73c33.615-18.54 98.235-111.195 34.47-210.78",
    textPosition: { x: 1100, y: 575 },
  },
];

export class Segmentum {
  public obj: THREE.Group;
  public data: SegmentumData;
  private isVisible: boolean = false;

  fatorEscala = 1.5;
  largura = 800 * this.fatorEscala;
  altura = 600 * this.fatorEscala;

  // Controles universais simples
  private static offsetPosicao = new THREE.Vector3(-20, -50, 0);
  private static offsetRotacao = new THREE.Euler(0, 0, 0);

  constructor(data: SegmentumData, scene: THREE.Scene) {
    this.data = data;
    this.obj = new THREE.Group();
    this.createSegmentumFromPath();
    this.obj.visible = false;
    scene.add(this.obj);
  }

  private createSegmentumFromPath() {
    // Create SVG element exactly like SegmentumSelector
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", "-200 -200 1600 1200");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    // Create group with transform
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("transform", "translate(450, 350)");

    // Create path element exactly like SegmentumSelector
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", this.data.path);
    path.setAttribute("fill", this.data.color);
    path.setAttribute("stroke", "rgba(34, 197, 94, 0.8)");
    path.setAttribute("stroke-width", "5");

    group.appendChild(path);
    svg.appendChild(group);

    // Set SVG size
    svg.style.width = `${this.largura}px`; // Smaller size
    svg.style.height = `${this.altura}px`; // Smaller size

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.width = `${this.largura}px`;
    container.style.height = `${this.altura}px`;
    container.style.pointerEvents = "none";
    container.appendChild(svg);

    document.body.appendChild(container);

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = this.largura;
      canvas.height = this.altura;

      // Draw the SVG image
      context.drawImage(img, 0, 0, this.largura, this.altura);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      // Create plane geometry
      const geometry = new THREE.PlaneGeometry(this.largura, this.altura);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 0, 0);
      mesh.lookAt(0, 0, 1);

      this.obj.add(mesh);
      // this.createTextLabel();

      document.body.removeChild(container);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }

  // private createTextLabel() {
  //   const canvas = document.createElement("canvas");
  //   const context = canvas.getContext("2d");
  //   if (!context) return;

  //   canvas.width = 512;
  //   canvas.height = 128;

  //   context.fillStyle = "white";
  //   context.font = "bold 32px Arial";
  //   context.textAlign = "center";
  //   context.textBaseline = "middle";

  //   const nameParts = this.data.name.split(" ");
  //   const firstLine = nameParts[0];
  //   const secondLine = nameParts.slice(1).join(" ");

  //   context.fillText(firstLine, 256, 40);
  //   context.fillText(secondLine, 256, 88);

  //   const texture = new THREE.CanvasTexture(canvas);
  //   const material = new THREE.SpriteMaterial({
  //     map: texture,
  //     transparent: true,
  //     opacity: 0.9,
  //   });

  //   const sprite = new THREE.Sprite(material);
  //   sprite.scale.set(200, 50, 1);
  //   sprite.position.set(
  //     (this.data.textPosition.x - 700) * 0.1,
  //     (this.data.textPosition.y - 580) * 0.1,
  //     10
  //   );

  //   this.obj.add(sprite);
  // }

  public toggleVisibility(show: boolean) {
    this.isVisible = show;
    this.obj.visible = show;
  }

  public updateVisibility(camera: THREE.Camera) {
    // Check if camera is within the range 0-5000 for X, Y, Z
    const pos = camera.position;
    const isInRange =
      pos.x >= -5000 &&
      pos.x <= 5000 &&
      pos.y >= -5000 &&
      pos.y <= 5000 &&
      pos.z >= -5000 &&
      pos.z <= 5000;

    this.obj.visible = this.isVisible && isInRange;

    // Aplicar controles universais
    this.obj.position.copy(Segmentum.offsetPosicao);
    this.obj.rotation.copy(Segmentum.offsetRotacao);
  }

  // Funções simples para controlar todos os segmentos
  public static setPosicao(x: number, y: number, z: number) {
    Segmentum.offsetPosicao.set(x, y, z);
  }

  public static setRotacao(angulo: number) {
    // Rotação apenas no eixo Z (como ponteiro de relógio)
    Segmentum.offsetRotacao.set(0, 0, angulo, "XYZ");
  }
}
