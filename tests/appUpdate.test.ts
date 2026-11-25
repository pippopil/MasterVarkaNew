import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isNewerVersion, fetchLatestReleaseInfo, CURRENT_APP_VERSION } from '../src/services/appUpdateService';

describe('App In-App Update Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('isNewerVersion semver comparison', () => {
    it('detects newer minor and patch versions', () => {
      expect(isNewerVersion('1.0.32', '1.0.30')).toBe(true);
      expect(isNewerVersion('v1.0.32', '1.0.30')).toBe(true);
      expect(isNewerVersion('1.1.0', '1.0.30')).toBe(true);
      expect(isNewerVersion('2.0.0', '1.0.30')).toBe(true);
    });

    it('returns false for same or older versions', () => {
      expect(isNewerVersion('1.0.30', '1.0.30')).toBe(false);
      expect(isNewerVersion('v1.0.30', '1.0.30')).toBe(false);
      expect(isNewerVersion('1.0.28', '1.0.30')).toBe(false);
      expect(isNewerVersion('0.9.99', '1.0.30')).toBe(false);
    });
  });

  describe('fetchLatestReleaseInfo', () => {
    // Dynamically calculate newer and current versions based on CURRENT_APP_VERSION
    const currentVersionClean = (CURRENT_APP_VERSION || '1.0.34').replace(/^v/, '');
    const versionParts = currentVersionClean.split('.').map(n => parseInt(n, 10) || 0);
    const newerVersion = `${versionParts[0] || 1}.${(versionParts[1] || 0) + 1}.0`;

    it('successfully extracts release and APK information from backend proxy when update is available', async () => {
      const mockBackendResponse = {
        success: true,
        repo: 'pippopil/mastervarka',
        tagName: `v${newerVersion}`,
        version: newerVersion,
        name: `🍺 МастерВарка v${newerVersion} (Сборка #999)`,
        body: 'Официальный релиз',
        publishedAt: '2026-10-13T15:00:00Z',
        htmlUrl: `https://github.com/pippopil/mastervarka/releases/tag/v${newerVersion}`,
        apk: {
          name: `mastervarka-v${newerVersion}.apk`,
          downloadUrl: `https://github.com/pippopil/mastervarka/releases/download/v${newerVersion}/mastervarka-v${newerVersion}.apk`,
          sizeMb: 3.7
        }
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockBackendResponse
      } as Response);

      const info = await fetchLatestReleaseInfo();
      expect(info).not.toBeNull();
      expect(info?.version).toBe(newerVersion);
      expect(info?.hasUpdate).toBe(true);
      expect(info?.apk.name).toBe(`mastervarka-v${newerVersion}.apk`);
      expect(info?.apk.downloadUrl).toContain('pippopil/mastervarka/releases');
    });

    it('correctly reports hasUpdate: false when installed version is up to date', async () => {
      const mockCurrentResponse = {
        success: true,
        repo: 'pippopil/mastervarka',
        tagName: `v${currentVersionClean}`,
        version: currentVersionClean,
        name: `🍺 МастерВарка v${currentVersionClean}`,
        body: 'Текущий установленный релиз',
        publishedAt: '2026-10-13T14:45:57Z',
        htmlUrl: `https://github.com/pippopil/mastervarka/releases/tag/v${currentVersionClean}`,
        apk: {
          name: `mastervarka-v${currentVersionClean}.apk`,
          downloadUrl: `https://github.com/pippopil/mastervarka/releases/download/v${currentVersionClean}/mastervarka-v${currentVersionClean}.apk`,
          sizeMb: 3.7
        }
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockCurrentResponse
      } as Response);

      const info = await fetchLatestReleaseInfo();
      expect(info).not.toBeNull();
      expect(info?.version).toBe(currentVersionClean);
      expect(info?.hasUpdate).toBe(false);
    });

    it('falls back to direct GitHub API if backend proxy fails', async () => {
      const mockGhRelease = {
        tag_name: `v${newerVersion}`,
        name: `🍺 МастерВарка v${newerVersion}`,
        body: 'Прямой релиз из GitHub',
        published_at: '2026-10-13T15:00:00Z',
        html_url: `https://github.com/pippopil/mastervarka/releases/tag/v${newerVersion}`,
        assets: [
          {
            name: `mastervarka-v${newerVersion}.apk`,
            browser_download_url: `https://github.com/pippopil/mastervarka/releases/download/v${newerVersion}/mastervarka-v${newerVersion}.apk`,
            size: 3901959
          }
        ]
      };

      vi.spyOn(globalThis, 'fetch')
        .mockRejectedValueOnce(new Error('Proxy offline'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGhRelease
        } as Response);

      const info = await fetchLatestReleaseInfo();
      expect(info).not.toBeNull();
      expect(info?.version).toBe(newerVersion);
      expect(info?.hasUpdate).toBe(true);
      expect(info?.apk.name).toBe(`mastervarka-v${newerVersion}.apk`);
      expect(info?.apk.sizeMb).toBe(3.7);
    });
  });
});
