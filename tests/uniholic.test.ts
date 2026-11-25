/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  convertRecipeToUniholicPauses,
  convertRecipeToUniholicHops,
  DEFAULT_UNIHOLIC_DEVICE,
  DEFAULT_UNIHOLIC_SETTINGS,
  probeUniholicConnection,
  getUniholicTroubleshootGuide
} from '../src/services/uniholicService';
import { INITIAL_RECIPES } from '../src/data/defaultData';
import { Recipe } from '../src/types/brewing';

describe('Uniholic 3.0 Brewery Automation Service', () => {
  it('correctly maps default Uniholic 3.0 device credentials matching hardware', () => {
    expect(DEFAULT_UNIHOLIC_DEVICE.model).toBe('Uniholic');
    expect(DEFAULT_UNIHOLIC_DEVICE.version).toBe('3.0');
    expect(DEFAULT_UNIHOLIC_DEVICE.firmware).toBe('3.1.32');
    expect(DEFAULT_UNIHOLIC_DEVICE.ipAp).toBe('192.168.4.1');
    expect(DEFAULT_UNIHOLIC_DEVICE.macAp).toBe('F6:CF:A2:F6:02:74');
  });

  it('converts recipe into full Uniholic pauses sequence', () => {
    const testRecipe: Recipe = {
      ...INITIAL_RECIPES[0],
      mashSchedule: [
        { id: 'm1', name: 'Белковая пауза', tempC: 52, timeMin: 15, type: 'protein' },
        { id: 'm2', name: 'Осахаривание', tempC: 66, timeMin: 55, type: 'maltose' },
        { id: 'm3', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
      ],
      boilTimeMin: 60
    };

    const pauses = convertRecipeToUniholicPauses(testRecipe);
    // 1 (Strike) + 3 (Mash Schedule) + 1 (Boil) + 1 (Whirlpool) = 6
    expect(pauses.length).toBe(6);

    // 1. Strike water pause
    expect(pauses[0].type).toBe('strike');
    expect(pauses[0].targetTempC).toBeGreaterThanOrEqual(52);
    expect(pauses[0].pumpEnabled).toBe(true);

    // 2. Protein pause
    expect(pauses[1].targetTempC).toBe(52);
    expect(pauses[1].durationMin).toBe(15);

    // 3. Maltose pause
    expect(pauses[2].targetTempC).toBe(66);
    expect(pauses[2].durationMin).toBe(55);

    // 4. Mashout
    expect(pauses[3].targetTempC).toBe(78);
    expect(pauses[3].type).toBe('mashout');

    // 5. Boil pause
    expect(pauses[4].type).toBe('boil');
    expect(pauses[4].targetTempC).toBe(100);
    expect(pauses[4].durationMin).toBe(60);

    // 6. Whirlpool/cooling
    expect(pauses[5].type).toBe('whirlpool');
  });

  it('correctly extracts and sorts hop timers for boil additions', () => {
    const testRecipe: Recipe = {
      ...INITIAL_RECIPES[0],
      hops: [
        { id: 'h1', name: 'Aroma Cascade', weightG: 30, alphaAcid: 6.0, boilTimeMin: 10, use: 'boil' },
        { id: 'h2', name: 'Bitter Magnum', weightG: 20, alphaAcid: 14.0, boilTimeMin: 60, use: 'boil' },
        { id: 'h3', name: 'Flavor Centennial', weightG: 25, alphaAcid: 9.5, boilTimeMin: 20, use: 'boil' }
      ]
    };

    const hops = convertRecipeToUniholicHops(testRecipe);
    expect(hops.length).toBe(3);
    // Должны быть отсортированы по времени кипячения (60 мин -> 20 мин -> 10 мин)
    expect(hops[0].name).toBe('Bitter Magnum');
    expect(hops[0].timeRemainingMin).toBe(60);
    expect(hops[1].name).toBe('Flavor Centennial');
    expect(hops[1].timeRemainingMin).toBe(20);
    expect(hops[2].name).toBe('Aroma Cascade');
    expect(hops[2].timeRemainingMin).toBe(10);
  });

  describe('Wi-Fi Connection and Troubleshooting Diagnostics', () => {
    it('initializes default device with connected status', () => {
      expect(DEFAULT_UNIHOLIC_DEVICE.isConnected).toBe(true);
      expect(DEFAULT_UNIHOLIC_DEVICE.connectionStatus).toBe('connected');
      expect(DEFAULT_UNIHOLIC_DEVICE.activeIp).toBe('192.168.4.1');
    });

    it('probes simulator connection successfully with ping measurement', async () => {
      const result = await probeUniholicConnection('192.168.4.1', 'simulator');
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.pingMs).toBeGreaterThan(0);
    });

    it('reports failure when simulator probe receives invalid test IP', async () => {
      const result = await probeUniholicConnection('0.0.0.0', 'simulator');
      expect(result.success).toBe(false);
      expect(result.failureReason).toBe('unreachable');
      expect(result.error).toBeDefined();
    });

    it('generates complete 5-step troubleshooting guide for Wi-Fi malfunctions', () => {
      const guide = getUniholicTroubleshootGuide('unreachable', '192.168.4.1');
      expect(guide.length).toBe(5);

      const stepIds = guide.map(g => g.id);
      expect(stepIds).toContain('step_power');
      expect(stepIds).toContain('step_wifi_network');
      expect(stepIds).toContain('step_ip_address');
      expect(stepIds).toContain('step_browser_direct');
      expect(stepIds).toContain('step_simulator_fallback');

      // Проверяем критически важную подсказку для Android про удержание соединения
      const wifiStep = guide.find(g => g.id === 'step_wifi_network');
      expect(wifiStep).toBeDefined();
      expect(wifiStep?.details.some(d => d.includes('Оставаться подключенным'))).toBe(true);
    });
  });

  describe('Russian Market Wi-Fi Breweries Catalog & Device Management', () => {
    it('contains all major Russian market Wi-Fi brewery models', async () => {
      const { RUSSIAN_MARKET_BREWERIES, getBreweryModelSpec } = await import('../src/services/breweryModels');
      expect(RUSSIAN_MARKET_BREWERIES.length).toBeGreaterThanOrEqual(8);

      const modelIds = RUSSIAN_MARKET_BREWERIES.map(m => m.id);
      expect(modelIds).toContain('uniholic');
      expect(modelIds).toContain('bavaria');
      expect(modelIds).toContain('easybrew');
      expect(modelIds).toContain('brewzilla_rapt');
      expect(modelIds).toContain('grainfather');
      expect(modelIds).toContain('guten_ardbir');
      expect(modelIds).toContain('craftbeerpi');
      expect(modelIds).toContain('custom_esp');

      // Проверка спецификации Баварии
      const bavaria = getBreweryModelSpec('bavaria');
      expect(bavaria.name).toContain('Бавария');
      expect(bavaria.defaultIp).toBe('192.168.4.1');
      expect(bavaria.defaultPort).toBe(80);
      expect(bavaria.phoneConnectionGuide.steps.length).toBeGreaterThanOrEqual(3);

      // Проверка спецификации EasyBrew
      const easybrew = getBreweryModelSpec('easybrew');
      expect(easybrew.name).toContain('EasyBrew');
      expect(easybrew.phoneConnectionGuide.androidTips.length).toBeGreaterThanOrEqual(1);

      // Проверка спецификации Brewzilla RAPT
      const rapt = getBreweryModelSpec('brewzilla_rapt');
      expect(rapt.name).toContain('Brewzilla');
      expect(rapt.endpoints.status).toBe('/api/telemetry');
    });

    it('probes user brewery connection in simulator mode successfully', async () => {
      const { probeBreweryConnection, DEFAULT_USER_BREWERY } = await import('../src/services/breweryModels');
      const result = await probeBreweryConnection(DEFAULT_USER_BREWERY);
      expect(result.success).toBe(true);
      expect(result.pingMs).toBeGreaterThan(0);
      expect(result.statusCode).toBe(200);
    });

    it('detects unreachable IP in brewery probe', async () => {
      const { probeBreweryConnection, DEFAULT_USER_BREWERY } = await import('../src/services/breweryModels');
      const offlineBrewery = {
        ...DEFAULT_USER_BREWERY,
        ip: '0.0.0.0',
        connectionMode: 'simulator' as const
      };
      const result = await probeBreweryConnection(offlineBrewery);
      expect(result.success).toBe(false);
      expect(result.failureReason).toBe('unreachable');
    });
  });
});

