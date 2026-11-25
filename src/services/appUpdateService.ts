import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

declare const __APP_VERSION__: string | undefined;
declare const __BUILD_NUMBER__: number | undefined;

export const CURRENT_APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.34';
export const CURRENT_BUILD_NUMBER = typeof __BUILD_NUMBER__ !== 'undefined' ? __BUILD_NUMBER__ : 34;

let cachedAppVersion = CURRENT_APP_VERSION;
let cachedBuildNumber = CURRENT_BUILD_NUMBER;
let isNativeInfoLoaded = false;

/**
 * Получает актуальную версию приложения и номер сборки.
 * На Android (Capacitor) опрашивает нативную ОС через @capacitor/app App.getInfo(),
 * что гарантирует получение реальной установленной версии APK даже при кэшировании веб-ассетов.
 */
export async function getCurrentAppVersionInfo(): Promise<{ version: string; buildNumber: number }> {
  if (Capacitor.isNativePlatform() && !isNativeInfoLoaded) {
    try {
      const info = await App.getInfo();
      if (info?.version) {
        cachedAppVersion = info.version.trim();
        const parsedBuild = parseInt(info.build, 10);
        if (!isNaN(parsedBuild) && parsedBuild > 0) {
          cachedBuildNumber = parsedBuild;
        } else {
          const lastNum = parseInt(cachedAppVersion.split('.').pop() || '', 10);
          if (!isNaN(lastNum)) cachedBuildNumber = lastNum;
        }
        isNativeInfoLoaded = true;
      }
    } catch (e) {
      console.warn('[Updater] Could not retrieve native Capacitor app info:', e);
    }
  }
  return { version: cachedAppVersion, buildNumber: cachedBuildNumber };
}

export interface AppReleaseInfo {
  version: string;
  tagName: string;
  name: string;
  body: string;
  publishedAt: string;
  htmlUrl: string;
  apk: {
    name: string;
    downloadUrl: string;
    sizeMb: number | null;
  };
  hasUpdate: boolean;
}

// Список репозиториев для проверки релизов (в порядке приоритета)
const GITHUB_REPOS = [
  'pippopil/mastervarka',
  'pippopil/-'
];

/**
 * Сравнение версий semver / номеров сборок
 * Возвращает true, если remoteVersion новее, чем currentVersion
 */
export function isNewerVersion(remoteVersion: string, currentVersion: string = cachedAppVersion): boolean {
  const cleanRemote = remoteVersion.replace(/^v/, '').trim();
  const cleanCurrent = (currentVersion || cachedAppVersion || CURRENT_APP_VERSION).replace(/^v/, '').trim();

  if (cleanRemote === cleanCurrent) return false;

  const remoteParts = cleanRemote.split('.').map(p => parseInt(p, 10) || 0);
  const currentParts = cleanCurrent.split('.').map(p => parseInt(p, 10) || 0);

  const len = Math.max(remoteParts.length, currentParts.length);
  for (let i = 0; i < len; i++) {
    const r = remoteParts[i] || 0;
    const c = currentParts[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }

  return false;
}

/**
 * Проверка наличия обновлений на GitHub
 * @param forceRefresh Если true, принудительно обходит серверный кэш
 */
export async function fetchLatestReleaseInfo(forceRefresh = false): Promise<AppReleaseInfo | null> {
  let data: any = null;

  // 1. Попытка запроса через backend-прокси приложения (/api/updates/latest)
  try {
    const proxyUrl = forceRefresh ? '/api/updates/latest?force=1' : '/api/updates/latest';
    const proxyRes = await fetch(proxyUrl);
    const ct = proxyRes.headers.get('content-type') || '';
    if (proxyRes.ok && ct.includes('application/json')) {
      const json = await proxyRes.json();
      if (json && json.success) {
        data = json;
      }
    }
  } catch (err) {
    console.warn('[Updater] Backend proxy updates fetch skipped:', err);
  }

  // 2. Если бэкенд недоступен (например, в PWA/Android офлайн или при статическом хостинге),
  // выполняем прямой запрос к GitHub API по известным репозиториям проекта
  if (!data) {
    for (const repo of GITHUB_REPOS) {
      try {
        const ghRes = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        if (ghRes.ok) {
          const ghJson = await ghRes.json();
          const assets = Array.isArray(ghJson.assets) ? ghJson.assets : [];
          const apkAsset = assets.find((a: any) => typeof a.name === 'string' && a.name.endsWith('.apk'));

          const tagName = ghJson.tag_name || 'latest';
          const cleanVer = tagName.replace(/^v/, '');

          data = {
            success: true,
            tagName,
            version: cleanVer,
            name: ghJson.name || `МастерВарка ${tagName}`,
            body: ghJson.body || '',
            publishedAt: ghJson.published_at || new Date().toISOString(),
            htmlUrl: ghJson.html_url || `https://github.com/${repo}/releases`,
            apk: apkAsset ? {
              name: apkAsset.name,
              downloadUrl: apkAsset.browser_download_url,
              sizeMb: apkAsset.size ? Number((apkAsset.size / (1024 * 1024)).toFixed(1)) : null
            } : {
              name: `mastervarka-${tagName}.apk`,
              downloadUrl: `https://github.com/${repo}/releases/download/${tagName}/mastervarka-${tagName}.apk`,
              sizeMb: 3.7
            }
          };
          break; // Успешно получен релиз из первого подходящего репозитория
        }
      } catch (ghErr) {
        console.warn(`[Updater] Direct GitHub API fetch for ${repo} skipped:`, ghErr);
      }
    }
  }

  const currentInfo = await getCurrentAppVersionInfo();

  // Сохраняем время последней проверки
  try {
    localStorage.setItem('mastervarka_last_update_check', Date.now().toString());
  } catch {}

  if (!data) {
    return {
      version: currentInfo.version,
      tagName: `v${currentInfo.version}`,
      name: `МастерВарка v${currentInfo.version}`,
      body: 'Установлена актуальная версия приложения. Дополнительных обновлений не требуется.',
      publishedAt: new Date().toISOString(),
      htmlUrl: 'https://github.com/pippopil/mastervarka/releases',
      apk: {
        name: `mastervarka-v${currentInfo.version}.apk`,
        downloadUrl: `https://github.com/pippopil/mastervarka/releases`,
        sizeMb: 3.7
      },
      hasUpdate: false
    };
  }

  const remoteVer = (data.version || data.tagName || '').replace(/^v/, '');
  const hasUpdate = isNewerVersion(remoteVer, currentInfo.version);
  const primaryRepo = data.repo || 'pippopil/mastervarka';

  return {
    version: remoteVer,
    tagName: data.tagName || `v${remoteVer}`,
    name: data.name || `МастерВарка v${remoteVer}`,
    body: data.body || '',
    publishedAt: data.publishedAt || new Date().toISOString(),
    htmlUrl: data.htmlUrl || `https://github.com/${primaryRepo}/releases`,
    apk: {
      name: data.apk?.name || `mastervarka-v${remoteVer}.apk`,
      downloadUrl: data.apk?.downloadUrl || `https://github.com/${primaryRepo}/releases/download/v${remoteVer}/mastervarka-v${remoteVer}.apk`,
      sizeMb: data.apk?.sizeMb ?? null
    },
    hasUpdate
  };
}

/**
 * Инициация скачивания и установки обновления APK
 */
export function startApkDownload(downloadUrl: string): void {
  try {
    // В нативном Android WebView (Capacitor) или браузере открываем прямую ссылку
    if (Capacitor.isNativePlatform()) {
      // Открываем URL в системном обработчике загрузок/браузере
      window.open(downloadUrl, '_system');
    } else {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = downloadUrl.split('/').pop() || 'mastervarka-update.apk';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch {
    window.location.href = downloadUrl;
  }
}
