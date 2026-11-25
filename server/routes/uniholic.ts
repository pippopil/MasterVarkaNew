/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';

export const uniholicRouter = Router();

// Активное состояние варки в памяти сервера (синхронизируется с блоком или эмулятором)
let activeBrewSession: {
  recipeName: string;
  recipeId: string;
  targetIp: string;
  isBrewing: boolean;
  status: string;
  currentTemp: number;
  targetTemp: number;
  lastUpdated: string;
} | null = null;

function isValidLocalDeviceIp(ipStr: string): boolean {
  if (!ipStr || typeof ipStr !== 'string') return false;
  const clean = ipStr.trim().toLowerCase();
  if (
    clean.includes('169.254') ||
    clean.includes('metadata') ||
    clean.includes('localhost') ||
    clean.includes('127.0.0') ||
    clean.includes('0.0.0.0') ||
    clean.includes('::') ||
    clean.includes('@') ||
    clean.startsWith('http:') ||
    clean.startsWith('https:')
  ) {
    return false;
  }
  const ipPattern = /^(?:192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|[a-zA-Z0-9.-]+\.local)(?::\d{1,5})?$/;
  return ipPattern.test(clean);
}

/**
 * Проверка статуса связи с блоком Uniholic
 */
uniholicRouter.get('/status', async (req, res) => {
  const targetIp = (req.query.ip as string) || '192.168.4.1';
  let isHardwareReachable = false;
  let deviceTelemetry = null;

  if (!isValidLocalDeviceIp(targetIp)) {
    return res.status(400).json({
      success: false,
      error: 'Недопустимый адрес контроллера (разрешены только локальные IP-адреса пивоварен 192.168.x.x / 10.x.x.x)',
      isHardwareReachable: false
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);

    const pingRes = await fetch(`http://${targetIp}/status`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (pingRes.ok) {
      isHardwareReachable = true;
      deviceTelemetry = await pingRes.json().catch(() => null);
    }
  } catch (e) {
    // Контроллер недоступен по сети (работаем в режиме эмулятора / офлайн)
    isHardwareReachable = false;
  }

  res.json({
    success: true,
    targetIp,
    isHardwareReachable,
    deviceTelemetry,
    activeBrewSession,
    timestamp: new Date().toISOString()
  });
});

/**
 * Передача рецепта и пауз в блок Uniholic
 */
uniholicRouter.post('/send-recipe', async (req, res) => {
  const { targetIp = '192.168.4.1', recipe, pauses, hops, settings } = req.body;

  if (!recipe) {
    return res.status(400).json({ success: false, error: 'Recipe payload required' });
  }

  activeBrewSession = {
    recipeName: recipe.name,
    recipeId: recipe.id,
    targetIp,
    isBrewing: false,
    status: 'idle',
    currentTemp: 20.0,
    targetTemp: pauses?.[0]?.targetTempC || 65,
    lastUpdated: new Date().toISOString()
  };

  // Попытка передать на физический блок, если он на связи
  let transmittedToHardware = false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    const hwRes = await fetch(`http://${targetIp}/api/recipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipeName: recipe.name,
        pauses,
        hops,
        settings
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (hwRes.ok) {
      transmittedToHardware = true;
    }
  } catch (e) {
    transmittedToHardware = false;
  }

  res.json({
    success: true,
    message: transmittedToHardware
      ? `Рецепт «${recipe.name}» успешно передан в память физического блока Uniholic 3.0 (${targetIp})!`
      : `Рецепт «${recipe.name}» успешно загружен в приложение и готов к варке (режим симулятора / Wi-Fi прямое соединение)!`,
    transmittedToHardware,
    session: activeBrewSession
  });
});

/**
 * Отправка команды управления (Старт / Пауза / Стоп / След. пауза)
 */
uniholicRouter.post('/command', async (req, res) => {
  const { targetIp = '192.168.4.1', action } = req.body;

  if (activeBrewSession) {
    if (action === 'start') {
      activeBrewSession.isBrewing = true;
      activeBrewSession.status = 'heating_strike';
    } else if (action === 'pause') {
      activeBrewSession.status = 'paused';
    } else if (action === 'stop') {
      activeBrewSession.isBrewing = false;
      activeBrewSession.status = 'idle';
    }
    activeBrewSession.lastUpdated = new Date().toISOString();
  }

  // Трансляция на физический контроллер
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);

    await fetch(`http://${targetIp}/api/cmd?action=${encodeURIComponent(action)}`, {
      method: 'POST',
      signal: controller.signal
    });
    clearTimeout(timeout);
  } catch (e) {
    // Офлайн или контроллер в режиме точки доступа
  }

  res.json({
    success: true,
    action,
    session: activeBrewSession
  });
});
