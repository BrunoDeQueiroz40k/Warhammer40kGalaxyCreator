import JSZip from "jszip";
import { saveAs } from "file-saver";
import { PlanetData } from "../app/components/galaxyComponent/objects/planet";

export interface ExportablePlanetData extends PlanetData {
  color?: string;
  segmentum?: string;
  vrchatUrl?: string;
}

export interface GalaxyExportData {
  planets: ExportablePlanetData[];
  exportDate: string;
  version: string;
}

export class GalaxyExporter {
  private static readonly VERSION = "1.0.0";

  static async exportGalaxy(planets: ExportablePlanetData[]): Promise<void> {
    try {
      const zip = new JSZip();

      // Criar pasta para imagens
      const imagesFolder = zip.folder("Imagens dos Planetas");

      // Preparar dados para exportação
      const exportData: GalaxyExportData = {
        planets: planets.map((planet) => ({
          ...planet,
          // Remover a imagem do JSON, pois será salva separadamente
          image: planet.image
            ? `Imagens dos Planetas/${planet.name}/imagem.png`
            : undefined,
        })),
        exportDate: new Date().toISOString(),
        version: this.VERSION,
      };

      // Adicionar JSON principal
      zip.file("galaxy_data.json", JSON.stringify(exportData, null, 2));

      // Processar imagens dos planetas
      for (const planet of planets) {
        if (planet.image) {
          try {
            // Criar pasta para o planeta
            const planetFolder = imagesFolder?.folder(planet.name);

            // Converter base64 para blob
            const imageBlob = await this.base64ToBlob(planet.image);

            // Adicionar imagem à pasta do planeta
            planetFolder?.file("imagem.png", imageBlob);
          } catch (error) {
            console.warn(
              `Erro ao processar imagem do planeta ${planet.name}:`,
              error
            );
          }
        }
      }

      // Gerar e baixar o arquivo ZIP
      const content = await zip.generateAsync({ type: "blob" });
      const fileName = `galaxy_export_${
        new Date().toISOString().split("T")[0]
      }.zip`;
      saveAs(content, fileName);

      console.log("Galáxia exportada com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar galáxia:", error);
      throw error;
    }
  }

  static async importGalaxy(file: File): Promise<ExportablePlanetData[]> {
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);

      // Ler o arquivo JSON principal
      const jsonFile = zipContent.file("galaxy_data.json");
      if (!jsonFile) {
        throw new Error("Arquivo galaxy_data.json não encontrado no ZIP");
      }

      const jsonContent = await jsonFile.async("text");
      const exportData: GalaxyExportData = JSON.parse(jsonContent);

      // Processar imagens dos planetas
      const processedPlanets: ExportablePlanetData[] = [];

      for (const planet of exportData.planets) {
        const processedPlanet = { ...planet };

        // Se o planeta tem uma imagem, carregar do ZIP
        if (planet.image && planet.image.startsWith("Imagens dos Planetas/")) {
          try {
            const imagePath = planet.image;
            const imageFile = zipContent.file(imagePath);

            if (imageFile) {
              const imageBlob = await imageFile.async("blob");
              const base64Image = await this.blobToBase64(imageBlob);
              processedPlanet.image = base64Image;
            }
          } catch (error) {
            console.warn(
              `Erro ao carregar imagem do planeta ${planet.name}:`,
              error
            );
          }
        }

        processedPlanets.push(processedPlanet);
      }

      console.log("Galáxia importada com sucesso!");
      return processedPlanets;
    } catch (error) {
      console.error("Erro ao importar galáxia:", error);
      throw error;
    }
  }

  private static async base64ToBlob(base64: string): Promise<Blob> {
    const response = await fetch(base64);
    return response.blob();
  }

  private static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Erro ao converter blob para base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  static async validateGalaxyFile(file: File): Promise<boolean> {
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);

      // Verificar se contém o arquivo JSON principal
      const jsonFile = zipContent.file("galaxy_data.json");
      if (!jsonFile) {
        return false;
      }

      // Verificar se o JSON é válido
      const jsonContent = await jsonFile.async("text");
      const exportData: GalaxyExportData = JSON.parse(jsonContent);

      // Verificar se tem a estrutura esperada
      return exportData.planets && Array.isArray(exportData.planets);
    } catch (error) {
      console.error("Erro ao validar arquivo de galáxia:", error);
      return false;
    }
  }
}
