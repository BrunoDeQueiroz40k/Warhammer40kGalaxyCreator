import { readdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const wallpapersDir = path.join(
      process.cwd(),
      "public",
      "assets",
      "imgs",
      "loading",
      "loadingWallpapers"
    );

    const files = await readdir(wallpapersDir);
    const backgrounds = files
      .map((file) => {
        const match = file.match(/^w(\d+)\.(png|jpg|jpeg|webp)$/i);
        return match ? Number(match[1]) : null;
      })
      .filter((value): value is number => value !== null)
      .sort((a, b) => a - b);

    return NextResponse.json({ backgrounds });
  } catch {
    return NextResponse.json({ backgrounds: [1] });
  }
}
