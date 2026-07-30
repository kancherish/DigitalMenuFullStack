export function assetUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  const base = import.meta.env.VITE_ASSET_BASE_URL || '/uploads';
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const k = key.startsWith('/') ? key.slice(1) : key;
  return `${b}/${k}`;
}