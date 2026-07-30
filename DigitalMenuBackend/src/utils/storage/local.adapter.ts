// backend/src/storage/local.adapter.ts
import fs from 'fs/promises';
import path from 'path';
import { UPLOAD_ROOT,UPLOAD_PUBLIC_BASE } from '../../env';
import { StorageAdapter } from './adapter.js';

export class LocalStorageAdapter implements StorageAdapter {
  async upload(buffer: Buffer, key: string): Promise<void> {
    const dest = path.join(UPLOAD_ROOT || "", key);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, buffer);
  }

  async delete(key: string): Promise<void> {
    key = key.replace(UPLOAD_PUBLIC_BASE || "","")
    await fs.unlink(path.join(UPLOAD_ROOT || "", key)).catch(() => {});
  }

  getPublicUrl(key: string): string {
    const base = UPLOAD_PUBLIC_BASE?.endsWith('/') ? UPLOAD_PUBLIC_BASE.slice(0, -1) : UPLOAD_PUBLIC_BASE;
    const clean = key.startsWith('/') ? key.slice(1) : key;
    return `${base}/${clean}`;
  }
}