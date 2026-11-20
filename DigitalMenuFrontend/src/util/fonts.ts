export type MenuFont =
  | 'sans'
  | 'serif'
  | 'display'
  | 'inter'
  | 'poppins'
  | 'montserrat'
  | 'nunito'
  | 'playfair'
  | 'lora'
  | 'merriweather';

export const FONT_OPTIONS: { value: MenuFont; label: string }[] = [
  { value: 'sans', label: 'Sans (System)' },
  { value: 'inter', label: 'Inter' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'montserrat', label: 'Montserrat' },
  { value: 'nunito', label: 'Nunito' },
  { value: 'serif', label: 'Serif (Fraunces)' },
  { value: 'display', label: 'Display (Fraunces)' },
  { value: 'playfair', label: 'Playfair Display' },
  { value: 'lora', label: 'Lora' },
  { value: 'merriweather', label: 'Merriweather' },
];

export function fontClass(font?: string | null): string {
  switch (font) {
    case 'serif':
      return 'font-serif';
    case 'display':
      return 'font-display';
    case 'inter':
      return 'font-inter';
    case 'poppins':
      return 'font-poppins';
    case 'montserrat':
      return 'font-montserrat';
    case 'nunito':
      return 'font-nunito';
    case 'playfair':
      return 'font-playfair';
    case 'lora':
      return 'font-lora';
    case 'merriweather':
      return 'font-merriweather';
    case 'sans':
    default:
      return 'font-sans';
  }
}
