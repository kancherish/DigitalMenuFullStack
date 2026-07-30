// backend/src/storage/adapter.ts
export interface StorageAdapter {
  upload(buffer: Buffer, key: string): Promise<void>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}

