import type { jsPDF } from 'jspdf';
import type { MenuFont } from './fonts';

const FONT_FILES: Record<MenuFont, string> = {
  sans: 'inter',
  serif: 'fraunces',
  display: 'fraunces',
  inter: 'inter',
  poppins: 'poppins',
  montserrat: 'montserrat',
  nunito: 'nunito',
  playfair: 'playfair',
  lora: 'lora',
  merriweather: 'merriweather',
};

const FALLBACKS: Record<MenuFont, string> = {
  sans: 'helvetica',
  serif: 'times',
  display: 'times',
  inter: 'helvetica',
  poppins: 'helvetica',
  montserrat: 'helvetica',
  nunito: 'helvetica',
  playfair: 'times',
  lora: 'times',
  merriweather: 'times',
};

export interface PdfFonts {
  resolve(font: MenuFont | undefined): string;
  embedded: boolean;
}

const dataCache = new Map<string, Promise<string | null>>();

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function loadFontData(file: string): Promise<string | null> {
  const cached = dataCache.get(file);
  if (cached) return cached;
  const request = fetch(`${import.meta.env.BASE_URL}pdf-fonts/${file}.ttf`)
    .then((response) => (response.ok ? response.arrayBuffer() : Promise.reject()))
    .then((buffer) => toBase64(buffer))
    .catch(() => null);
  dataCache.set(file, request);
  return request;
}

export async function registerPdfFonts(doc: jsPDF, fonts: (MenuFont | undefined)[]): Promise<PdfFonts> {
  const files = [...new Set(fonts.map((font) => FONT_FILES[font ?? 'sans'] ?? 'inter'))];
  const loaded = await Promise.all(
    files.map(async (file) => {
      const [regular, bold] = await Promise.all([
        loadFontData(`${file}-regular`),
        loadFontData(`${file}-bold`),
      ]);
      if (!regular || !bold) return null;
      const family = `MenuPDF-${file}`;
      doc.addFileToVFS(`${family}-regular.ttf`, regular);
      doc.addFont(`${family}-regular.ttf`, family, 'normal');
      doc.addFileToVFS(`${family}-bold.ttf`, bold);
      doc.addFont(`${family}-bold.ttf`, family, 'bold');
      return { file, family };
    }),
  );

  const families = new Map(loaded.filter((item): item is { file: string; family: string } => item !== null).map((item) => [item.file, item.family]));

  return {
    embedded: families.size > 0,
    resolve(font) {
      const file = FONT_FILES[font ?? 'sans'] ?? 'inter';
      return families.get(file) ?? FALLBACKS[font ?? 'sans'];
    },
  };
}
