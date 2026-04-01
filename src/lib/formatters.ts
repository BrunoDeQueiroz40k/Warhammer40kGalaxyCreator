import { BadgeVariant } from "@/types/interfaces";

export function getFactionVariant(faction: string): BadgeVariant {
  switch (faction) {
    case "Imperium":
      return "imperium";
    case "Necrons":
      return "necrons";
    case "Caos":
      return "caos";
    case "Orks":
      return "orks";
    case "Xenos":
      return "xenos";
    case "Tau":
      return "tau";
    case "Aeldari":
      return "aeldari";
    default:
      return "normal";
  }
}

export function formatPopulation(value: number): string {
  if (value === 0) return "0";

  const absValue = Math.abs(value);
  if (absValue >= 1e12) {
    const trillions = Math.floor(absValue / 1e12);
    return trillions === 1 ? "1 trilhão" : `${trillions} trilhões`;
  }
  if (absValue >= 1e9) {
    const billions = Math.floor(absValue / 1e9);
    return billions === 1 ? "1 bilhão" : `${billions} bilhões`;
  }
  if (absValue >= 1e6) {
    const millions = Math.floor(absValue / 1e6);
    return millions === 1 ? "1 milhão" : `${millions} milhões`;
  }
  if (absValue >= 1e3) {
    const thousands = Math.floor(absValue / 1e3);
    return `${thousands} mil`;
  }
  return value.toString();
}

export async function fileToBase64(file: File): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Falha ao ler imagem."));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

export function getHostnameFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
