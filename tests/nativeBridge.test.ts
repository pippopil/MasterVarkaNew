import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  sgToPlato,
  platoToSg,
  getNativeHardwareStatus,
  scheduleExactBrewAlarm,
  cancelExactBrewAlarm,
  startHydrometerScan,
  stopHydrometerScan,
  triggerHapticFeedback
} from '../src/services/nativeBridge';

describe('NativeBridge: Density Math (SG & Plato conversions)', () => {
  it('converts pure water 1.000 SG to 0.0 °P', () => {
    const plato = sgToPlato(1.000);
    expect(plato).toBe(0);
  });

  it('converts standard wort SG to Plato within expected brewing tolerance', () => {
    // 1.040 is ~10.0 °P
    const p40 = sgToPlato(1.040);
    expect(p40).toBeGreaterThanOrEqual(9.9);
    expect(p40).toBeLessThanOrEqual(10.1);

    // 1.050 is ~12.3 - 12.5 °P
    const p50 = sgToPlato(1.050);
    expect(p50).toBeGreaterThanOrEqual(12.3);
    expect(p50).toBeLessThanOrEqual(12.5);

    // 1.080 is ~19.2 - 19.5 °P
    const p80 = sgToPlato(1.080);
    expect(p80).toBeGreaterThanOrEqual(19.2);
    expect(p80).toBeLessThanOrEqual(19.5);
  });

  it('handles edge cases in sgToPlato for SG < 1.0', () => {
    expect(sgToPlato(0.995)).toBe(0);
    expect(sgToPlato(-1)).toBe(0);
  });

  it('converts Plato back to Specific Gravity (Lincoln formula)', () => {
    expect(platoToSg(0)).toBe(1.000);
    const sg10 = platoToSg(10.0);
    expect(sg10).toBe(1.04);
    const sg12 = platoToSg(12.0);
    expect(sg12).toBe(1.048);
  });
});

describe('NativeBridge: Hardware status & web fallback', () => {
  it('returns web hardware status when running in browser test environment', async () => {
    const status = await getNativeHardwareStatus();
    expect(status.isNative).toBe(false);
    expect(status.platform).toBe('web');
  });

  it('rejects scheduling alarm in the past', async () => {
    const pastDate = new Date(Date.now() - 5000);
    const result = await scheduleExactBrewAlarm(1234, 'Тест', 'Прошедшее время', pastDate);
    expect(result).toBe(false);
  });

  it('schedules future alarm and cancels it cleanly in web mode', async () => {
    const futureDate = new Date(Date.now() + 60000);
    const result = await scheduleExactBrewAlarm(5678, 'Пауза 68°C', 'Время вышло', futureDate);
    expect(result).toBe(true);

    const cancelResult = await cancelExactBrewAlarm(5678);
    expect(cancelResult).toBe(true);
  });

  it('triggers haptic feedback without crashing in test/web environment', async () => {
    await expect(triggerHapticFeedback(50)).resolves.not.toThrow();
  });

  it('runs hydrometer scan in simulation mode for browser and triggers callback', async () => {
    const readings: any[] = [];
    const scan = await startHydrometerScan((reading) => {
      readings.push(reading);
    });

    expect(scan.success).toBe(true);
    expect(readings.length).toBeGreaterThanOrEqual(1);
    expect(readings[0].specificGravity).toBeGreaterThan(1.0);
    expect(readings[0].tempC).toBeGreaterThan(0);
    expect(readings[0].type).toBe('simulation');

    await stopHydrometerScan();
  });
});
