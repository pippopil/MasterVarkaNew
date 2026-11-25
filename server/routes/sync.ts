import { Router, Request, Response } from 'express';
import { SyncSaveRequest } from '../types/api.js';

export const syncRouter = Router();

interface SyncStoreEntry {
  data: any;
  updatedAt: string;
  expiresAt: number;
}

// Хранилище облачной синхронизации между устройствами (в памяти процесса)
const cloudSyncStore = new Map<string, SyncStoreEntry>();
const MAX_STORED_ROOMS = 1000;
const ROOM_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 дней
const MAX_PAYLOAD_BYTES = 2 * 1024 * 1024; // 2 МБ

// Периодическая очистка устаревших комнат раз в 30 минут
setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of cloudSyncStore.entries()) {
    if (entry.expiresAt <= now) {
      cloudSyncStore.delete(code);
    }
  }
}, 30 * 60 * 1000);

// Сохранение данных
syncRouter.post('/save', (req: Request<{}, {}, SyncSaveRequest>, res: Response) => {
  const { syncCode, payload } = req.body;
  if (!syncCode || !payload) {
    return res.status(400).json({ error: 'syncCode and payload are required' });
  }

  const cleanCode = String(syncCode).trim().toUpperCase();
  if (cleanCode.length < 4 || cleanCode.length > 32 || !/^[A-Z0-9\-_]+$/.test(cleanCode)) {
    return res.status(400).json({ error: 'Неверный формат кода синхронизации (от 4 до 32 символов A-Z, 0-9, -, _)' });
  }

  // Защита от переполнения памяти
  try {
    const serialized = JSON.stringify(payload);
    if (serialized.length > MAX_PAYLOAD_BYTES) {
      return res.status(413).json({ error: 'Размер данных превышает лимит (макс. 2 МБ)' });
    }
  } catch {
    return res.status(400).json({ error: 'Некорректный формат данных' });
  }

  if (cloudSyncStore.size >= MAX_STORED_ROOMS && !cloudSyncStore.has(cleanCode)) {
    // Удаляем старейшую запись при превышении лимита комнат
    const oldestKey = cloudSyncStore.keys().next().value;
    if (oldestKey) cloudSyncStore.delete(oldestKey);
  }

  cloudSyncStore.set(cleanCode, {
    data: payload,
    updatedAt: new Date().toISOString(),
    expiresAt: Date.now() + ROOM_TTL_MS
  });

  return res.json({ success: true, syncCode: cleanCode, message: 'Данные успешно сохранены в облаке' });
});

// Загрузка данных по коду
syncRouter.get('/load/:code', (req: Request<{ code: string }>, res: Response) => {
  const cleanCode = String(req.params.code).trim().toUpperCase();
  const entry = cloudSyncStore.get(cleanCode);
  if (!entry || entry.expiresAt <= Date.now()) {
    if (entry) cloudSyncStore.delete(cleanCode);
    return res.status(404).json({ error: 'Синхронизационный код не найден или устарел' });
  }
  return res.json({ success: true, syncCode: cleanCode, data: entry.data, updatedAt: entry.updatedAt });
});

