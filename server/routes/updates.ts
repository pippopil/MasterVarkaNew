import { Router, Request, Response } from 'express';

export const updatesRouter = Router();

interface CachedRelease {
  data: any;
  cachedAt: number;
}

let cachedRelease: CachedRelease | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 минута TTL кэша

// Репозитории GitHub для проверки обновлений в порядке приоритета
const GITHUB_REPOS = [
  'pippopil/mastervarka',
  'pippopil/-'
];

/**
 * Получение информации о последнем опубликованном релизе с GitHub
 */
updatesRouter.get('/latest', async (req: Request, res: Response) => {
  const now = Date.now();
  const force = req.query.force === 'true' || req.query.force === '1' || req.query.refresh === '1';

  // Если есть свежий кэш и не запрошен принудительный сброс
  if (!force && cachedRelease && now - cachedRelease.cachedAt < CACHE_TTL_MS) {
    return res.json(cachedRelease.data);
  }

  for (const repo of GITHUB_REPOS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const ghRes = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'MasterVarka-App-Updater/1.0'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (ghRes.ok) {
        const data: any = await ghRes.json();
        const assets = Array.isArray(data.assets) ? data.assets : [];
        const apkAsset = assets.find((a: any) => typeof a.name === 'string' && a.name.endsWith('.apk'));

        const tagName = data.tag_name || '';
        const cleanVersion = tagName.replace(/^v/, '');

        const formatted = {
          success: true,
          repo,
          tagName,
          version: cleanVersion,
          name: data.name || `МастерВарка ${tagName}`,
          body: data.body || '',
          publishedAt: data.published_at || new Date().toISOString(),
          htmlUrl: data.html_url || `https://github.com/${repo}/releases`,
          apk: apkAsset ? {
            name: apkAsset.name,
            downloadUrl: apkAsset.browser_download_url,
            sizeMb: apkAsset.size ? Number((apkAsset.size / (1024 * 1024)).toFixed(1)) : null
          } : {
            name: `mastervarka-${tagName || 'latest'}.apk`,
            downloadUrl: `https://github.com/${repo}/releases/download/${tagName || 'latest'}/mastervarka-${tagName || 'latest'}.apk`,
            sizeMb: 3.9
          }
        };

        cachedRelease = {
          data: formatted,
          cachedAt: now
        };

        return res.json(formatted);
      }
    } catch (err) {
      console.warn(`[Updates] Не удалось получить релиз из репозитория ${repo}:`, err);
    }
  }

  // Если запрос не удался, но есть предыдущий кэш
  if (cachedRelease) {
    return res.json(cachedRelease.data);
  }

  return res.status(503).json({
    success: false,
    message: 'Не удалось получить информацию о релизах с GitHub. Проверьте подключение к сети.'
  });
});
