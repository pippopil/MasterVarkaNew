import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateTelegramPost,
  getTelegramShareUrl,
  loadTelegramConfig,
  saveTelegramConfig,
  DEFAULT_TELEGRAM_CONFIG,
  parseTelegramChannel,
  submitBugReportDirectly
} from '../src/services/telegramService';
import { Recipe } from '../src/types/brewing';

const mockRecipe: Recipe = {
  id: 'test_recipe_tg_1',
  name: 'Байкальский Шаман',
  style: 'Russian Imperial Stout',
  category: 'Тёмные эли',
  description: 'Мощный смолистый стаут с нотами кедрового ореха и темного шоколада.',
  author: 'Шеф-Пивовар',
  batchSizeL: 25,
  boilTimeMin: 90,
  efficiencyPercent: 75,
  grainRatioLPerKg: 3.5,
  grainTempC: 20,
  targetCarbonationVol: 2.2,
  beerTempAtBottlingC: 18,
  grains: [
    { id: 'g1', name: 'Курский Пилснер', weightKg: 6.0, type: 'base', colorEbc: 3.5, potentialSg: 1.037 },
    { id: 'g2', name: 'Курский Шоколадный', weightKg: 1.0, type: 'caramel', colorEbc: 900, potentialSg: 1.028 },
    { id: 'g3', name: 'Жженый ячмень', weightKg: 0.5, type: 'roasted', colorEbc: 1200, potentialSg: 1.025 }
  ],
  hops: [
    { id: 'h1', name: 'Northern Brewer', weightG: 50, boilTimeMin: 60, alphaAcid: 8.5, use: 'boil' },
    { id: 'h2', name: 'Cascade', weightG: 30, boilTimeMin: 15, alphaAcid: 6.0, use: 'boil' }
  ],
  mashSchedule: [
    { id: 'm1', name: 'Осахаривание', tempC: 67, timeMin: 60, type: 'maltose' },
    { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
  ],
  yeast: {
    name: 'SafAle US-05',
    lab: 'Fermentis',
    form: 'dry',
    type: 'ale',
    cellsPerGramOrVial: 20,
    attenuationPercent: 80,
    tempRange: [18, 22]
  },
  calculated: {
    ogSg: 1.085,
    fgSg: 1.018,
    ogPlato: 20.5,
    fgPlato: 4.6,
    abv: 8.8,
    ibu: 65,
    srm: 48,
    ebc: 95,
    buGuRatio: 0.76,
    totalGrainWeightKg: 7.5,
    strikeWaterL: 26.2,
    spargeWaterL: 12.0,
    totalWaterL: 38.2,
    strikeTempC: 72,
    dryYeastGramsNeeded: 15,
    yeastPacksNeeded: 2,
    dextroseGrams: 140,
    sucroseGrams: 152,
    dmeGrams: 180,
    speiseMl: 1500,
    caloriesPer500ml: 280
  },
  tags: ['stout', 'imperial', 'craft'],
  createdAt: '2026-10-19T00:00:00Z',
  updatedAt: '2026-10-19T00:00:00Z'
};

const storageMap = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => storageMap.get(key) || null,
  setItem: (key: string, val: string) => storageMap.set(key, val),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear()
};
(globalThis as any).localStorage = mockLocalStorage;

describe('Telegram Recipe Publishing Service', () => {
  beforeEach(() => {
    storageMap.clear();
  });

  it('generates craft_release style post with rich formatting and escaped characters', () => {
    const post = generateTelegramPost(mockRecipe, {
      style: 'craft_release',
      includeHashtags: true,
      includeAuthorContact: true,
      authorContact: '@craft_master',
      customNote: 'Выдержка в дубовой бочке 3 месяца',
      brewDate: '19.10.2026',
      readyDate: '01.01.2027'
    });

    expect(post.html).toContain('<b>«Байкальский Шаман»</b>');
    expect(post.html).toContain('Russian Imperial Stout');
    expect(post.html).toContain('8.8% об.');
    expect(post.html).toContain('65'); // IBU
    expect(post.html).toContain('Курский Пилснер');
    expect(post.html).toContain('Northern Brewer');
    expect(post.html).toContain('Выдержка в дубовой бочке');
    expect(post.html).toContain('@craft_master');
    expect(post.html).toContain('#МастерВарка');
    expect(post.html).toContain('#russian_imperial_stout');

    // Plain text should have no HTML tags
    expect(post.plainText).not.toContain('<b>');
    expect(post.plainText).not.toContain('</b>');
    expect(post.plainText).toContain('Байкальский Шаман');
  });

  it('generates tech_card style with mash schedule and precise boil steps', () => {
    const post = generateTelegramPost(mockRecipe, {
      style: 'tech_card',
      includeHashtags: false
    });

    expect(post.html).toContain('ТЕХНИЧЕСКАЯ КАРТА ВАРКИ');
    expect(post.html).toContain('Осахаривание');
    expect(post.html).toContain('67°C');
    expect(post.html).toContain('Мэшаут');
    expect(post.html).toContain('Northern Brewer');
    expect(post.html).toContain('Варка 60 мин');
  });

  it('generates teaser style post suitable for social announcements', () => {
    const post = generateTelegramPost(mockRecipe, {
      style: 'teaser',
      readyDate: 'В новогоднюю ночь'
    });

    expect(post.html).toContain('Новая варка: «Байкальский Шаман»!');
    expect(post.html).toContain('В новогоднюю ночь');
    expect(post.html).toContain('8.8%');
    expect(post.html).toContain('65 IBU');
  });

  it('generates valid Telegram share link', () => {
    const shareUrl = getTelegramShareUrl('Привет от МастерВарки!', 'https://mastervarka.app');
    expect(shareUrl).toContain('https://t.me/share/url');
    expect(decodeURIComponent(shareUrl)).toContain('Привет');
    expect(shareUrl).toContain('mastervarka.app');
  });

  it('correctly loads and saves Telegram configuration in localStorage', () => {
    expect(loadTelegramConfig()).toEqual(DEFAULT_TELEGRAM_CONFIG);

    const updated = {
      ...DEFAULT_TELEGRAM_CONFIG,
      botToken: '123456789:ABC_TEST_TOKEN_XYZ_1234567890',
      chatId: '@my_test_brewery'
    };
    saveTelegramConfig(updated);

    expect(loadTelegramConfig().botToken).toBe('123456789:ABC_TEST_TOKEN_XYZ_1234567890');
    expect(loadTelegramConfig().chatId).toBe('@my_test_brewery');
  });

  it('correctly parses various formats of Telegram channel links and handles', () => {
    // 1. Полный URL
    const urlRes = parseTelegramChannel('https://t.me/craft_beer_spb');
    expect(urlRes.isValid).toBe(true);
    expect(urlRes.channelUrl).toBe('https://t.me/craft_beer_spb');
    expect(urlRes.chatId).toBe('@craft_beer_spb');
    expect(urlRes.displayHandle).toBe('@craft_beer_spb');

    // 2. Короткий URL
    const shortRes = parseTelegramChannel('t.me/my_brewery');
    expect(shortRes.isValid).toBe(true);
    expect(shortRes.channelUrl).toBe('https://t.me/my_brewery');
    expect(shortRes.chatId).toBe('@my_brewery');

    // 3. Юзернейм с собачкой
    const handleRes = parseTelegramChannel('@hop_and_malt');
    expect(handleRes.isValid).toBe(true);
    expect(handleRes.channelUrl).toBe('https://t.me/hop_and_malt');
    expect(handleRes.chatId).toBe('@hop_and_malt');

    // 4. Числовой ID приватного чата
    const idRes = parseTelegramChannel('-1001928374829');
    expect(idRes.isValid).toBe(true);
    expect(idRes.chatId).toBe('-1001928374829');
    expect(idRes.displayHandle).toBe('Chat ID: -1001928374829');

    // 5. Простое имя без префикса
    const plainRes = parseTelegramChannel('russian_craft');
    expect(plainRes.isValid).toBe(true);
    expect(plainRes.channelUrl).toBe('https://t.me/russian_craft');
    expect(plainRes.chatId).toBe('@russian_craft');

    // 6. Пустая строка
    const emptyRes = parseTelegramChannel('   ');
    expect(emptyRes.isValid).toBe(false);
  });

  it('submits bug reports directly or safely reports missing token', async () => {
    // Мокируем глобальный fetch для проверки вызова API
    const originalFetch = global.fetch;
    try {
      global.fetch = async (url: any, opts: any) => {
        expect(url).toBe('/api/telegram/send-bug-report');
        expect(opts.method).toBe('POST');
        const body = JSON.parse(opts.body);
        expect(body.category).toBe('bug');
        expect(body.subject).toBe('Тестовый баг');
        return {
          ok: true,
          json: async () => ({
            success: true,
            messageId: 42,
            channel: '@mastervarka'
          })
        } as any;
      };

      const res = await submitBugReportDirectly({
        category: 'bug',
        subject: 'Тестовый баг',
        description: 'Шаги воспроизведения ошибки',
        channelUsername: '@mastervarka'
      });

      expect(res.success).toBe(true);
      expect(res.messageId).toBe(42);
      expect(res.channel).toBe('@mastervarka');
    } finally {
      global.fetch = originalFetch;
    }
  });
});

