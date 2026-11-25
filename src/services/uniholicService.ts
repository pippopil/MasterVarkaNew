/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Recipe } from '../types/brewing';
import {
  UniholicDeviceInfo,
  UniholicBrewSettings,
  UniholicPauseItem,
  UniholicHopTimer,
  UniholicLiveTelemetry,
  UniholicBrewStatus,
  UniholicProbeResult,
  UniholicTroubleshootStep,
  UniholicConnectionStatus
} from '../types/uniholic';

export const DEFAULT_UNIHOLIC_DEVICE: UniholicDeviceInfo = {
  model: 'Uniholic',
  version: '3.0',
  firmware: '3.1.32',
  ipAp: '192.168.4.1',
  ipSta: '0.0.0.0',
  macAp: 'F6:CF:A2:F6:02:74',
  macSta: 'F4:CF:A2:F6:02:74',
  uptime: '00:02:30',
  activeIp: '192.168.4.1',
  connectionMode: 'simulator',
  isConnected: true,
  connectionStatus: 'connected',
  lastPingMs: 14,
  lastCheckedAt: new Date().toISOString()
};

export const DEFAULT_UNIHOLIC_SETTINGS: UniholicBrewSettings = {
  heaterPowerWatt: 3000,
  boilPowerPercent: 85,
  pumpRestMinutes: 1,
  pumpWorkMinutes: 14,
  tempSensorOffsetC: 0.0,
  pidKp: 25.0,
  pidKi: 1.2,
  pidKd: 5.0,
  soundAlerts: true,
  autoAdvancePauses: true
};

/**
 * Преобразование рецепта в список пауз для блока управления Uniholic 3.0
 */
export function convertRecipeToUniholicPauses(recipe?: Recipe): UniholicPauseItem[] {
  const pauses: UniholicPauseItem[] = [];
  if (!recipe) {
    return [
      {
        id: 'pause_strike',
        name: 'Нагрев воды под засыпь',
        targetTempC: 68,
        durationMin: 0,
        pumpEnabled: true,
        isCompleted: false,
        type: 'strike'
      },
      {
        id: 'pause_mash_1',
        name: 'Осахаривание (66°C)',
        targetTempC: 66,
        durationMin: 60,
        pumpEnabled: true,
        isCompleted: false,
        type: 'mash'
      },
      {
        id: 'pause_boil',
        name: 'Кипячение сусла',
        targetTempC: 100,
        durationMin: 60,
        pumpEnabled: false,
        isCompleted: false,
        type: 'boil'
      }
    ];
  }

  // 1. Пауза первого налива и нагрева до засыпи солода (Strike Water)
  const mashSchedule = Array.isArray(recipe.mashSchedule) ? recipe.mashSchedule : [];
  const firstMashTemp = mashSchedule[0]?.tempC || 65;
  const strikeTemp = Math.round(recipe.calculated?.strikeTempC || (firstMashTemp + 2.5));
  pauses.push({
    id: 'pause_strike',
    name: 'Нагрев воды до засыпи солода',
    targetTempC: strikeTemp,
    durationMin: 0, // Нагрев до достижения целевой температуры
    pumpEnabled: true,
    isCompleted: false,
    type: 'strike'
  });

  // 2. Температурные паузы затирания из рецепта
  if (mashSchedule.length > 0) {
    mashSchedule.forEach((m, idx) => {
      pauses.push({
        id: `pause_mash_${idx + 1}`,
        name: m.name || `Пауза ${m.tempC}°C`,
        targetTempC: m.tempC,
        durationMin: m.timeMin,
        pumpEnabled: m.type !== 'mashout' ? true : false,
        isCompleted: false,
        type: m.type === 'mashout' ? 'mashout' : 'mash'
      });
    });
  } else {
    // Дефолтная однопаузная схема, если расписание пустое
    pauses.push({
      id: 'pause_mash_1',
      name: 'Осахаривание (Мальтозная пауза)',
      targetTempC: 66,
      durationMin: 60,
      pumpEnabled: true,
      isCompleted: false,
      type: 'mash'
    });
    pauses.push({
      id: 'pause_mashout',
      name: 'Мэшаут',
      targetTempC: 78,
      durationMin: 10,
      pumpEnabled: false,
      isCompleted: false,
      type: 'mashout'
    });
  }

  // 3. Кипячение сусла
  pauses.push({
    id: 'pause_boil',
    name: 'Кипячение сусла (Варка)',
    targetTempC: 100,
    durationMin: recipe.boilTimeMin || 60,
    pumpEnabled: false,
    isCompleted: false,
    type: 'boil'
  });

  // 4. Осаждение бруха (Вирпул) и охлаждение
  pauses.push({
    id: 'pause_whirlpool',
    name: 'Вирпул и охлаждение сусла',
    targetTempC: 20,
    durationMin: 15,
    pumpEnabled: true,
    isCompleted: false,
    type: 'whirlpool'
  });

  return pauses;
}

/**
 * Преобразование хмелей рецепта в список таймеров внесения для Uniholic
 */
export function convertRecipeToUniholicHops(recipe?: Recipe): UniholicHopTimer[] {
  if (!recipe || !Array.isArray(recipe.hops) || recipe.hops.length === 0) return [];

  return recipe.hops
    .slice()
    .sort((a, b) => (b.boilTimeMin || 0) - (a.boilTimeMin || 0))
    .map((h, idx) => ({
      id: h.id || `hop_${idx}`,
      name: h.name,
      weightG: h.weightG,
      alphaAcid: h.alphaAcid,
      timeRemainingMin: h.boilTimeMin,
      isAdded: false
    }));
}

/**
 * Синтез звукового сигнала контроллера через Web Audio API
 */
export function playControllerBeep(freq = 1800, duration = 0.15, count = 1) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    for (let i = 0; i < count; i++) {
      const startTime = ctx.currentTime + i * (duration + 0.1);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square'; // Характерный чистый зуммер микроконтроллера
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    }
  } catch (e) {
    // Web Audio может быть заблокирован до пользовательского жеста
  }
}

/**
 * Проверка реального или эмулированного Wi-Fi соединения с блоком Uniholic
 */
export async function probeUniholicConnection(
  ip: string,
  mode: 'real' | 'simulator' = 'real',
  timeoutMs = 3500
): Promise<UniholicProbeResult> {
  const timestamp = new Date().toISOString();

  // Режим интерактивного симулятора
  if (mode === 'simulator') {
    if (ip === '0.0.0.0' || ip === 'offline' || ip.toLowerCase() === 'error') {
      return {
        success: false,
        failureReason: 'unreachable',
        error: 'Симуляция сбоя связи: указан тестовый недействительный адрес.',
        timestamp
      };
    }
    const simulatedPing = Math.floor(Math.random() * 10) + 12; // 12..22 мс
    return {
      success: true,
      pingMs: simulatedPing,
      statusCode: 200,
      timestamp
    };
  }

  // Физический режим проверки блока по Wi-Fi
  const cleanIp = ip.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!cleanIp || cleanIp === '0.0.0.0') {
    return {
      success: false,
      failureReason: 'unreachable',
      error: 'Указан пустой или недействительный IP-адрес блока (0.0.0.0).',
      timestamp
    };
  }

  const startTime = performance.now();
  const url = `http://${cleanIp}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Делаем no-cors запрос к эндпоинту статуса контроллера Uniholic
    const response = await fetch(`${url}/status`, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-cache',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const duration = Math.round(performance.now() - startTime);

    return {
      success: true,
      pingMs: Math.max(5, duration),
      statusCode: response.status || 200,
      timestamp
    };
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      return {
        success: false,
        failureReason: 'timeout',
        error: `Превышено время ожидания ответа (${(timeoutMs / 1000).toFixed(1)} сек) от блока ${cleanIp}. Блок не отвечает по Wi-Fi.`,
        timestamp
      };
    }

    // Вторая попытка: корневой адрес '/'
    try {
      const pingController = new AbortController();
      const pingTimeout = setTimeout(() => pingController.abort(), 2000);
      const rootRes = await fetch(`${url}/`, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-cache',
        signal: pingController.signal
      });
      clearTimeout(pingTimeout);
      const duration = Math.round(performance.now() - startTime);
      return {
        success: true,
        pingMs: Math.max(5, duration),
        statusCode: rootRes.status || 200,
        timestamp
      };
    } catch {
      const isMixedContent =
        typeof window !== 'undefined' &&
        window.location.protocol === 'https:' &&
        cleanIp.startsWith('192.168.');

      const failureReason = isMixedContent ? 'mixed_content' : 'unreachable';
      const errorMsg = isMixedContent
        ? `Браузер блокирует прямое HTTP-подключение к локальному IP ${cleanIp} из HTTPS веб-сессии. В Android APK приложении «МастерВарка» ограничение снято. Также можно открыть http://${cleanIp} в браузере напрямую.`
        : `Не удалось связаться с блоком по адресу ${cleanIp}. Убедитесь, что ваш смартфон/ПК подключен к Wi-Fi сети «Uniholic».`;

      return {
        success: false,
        failureReason,
        error: errorMsg,
        timestamp
      };
    }
  }
}

/**
 * Руководство по устранению неполадок подключения к пивоварне Uniholic
 */
export function getUniholicTroubleshootGuide(
  failureReason?: string,
  activeIp: string = '192.168.4.1'
): UniholicTroubleshootStep[] {
  return [
    {
      id: 'step_power',
      stepNumber: 1,
      title: 'Проверьте питание и индикатор блока',
      shortDesc: 'Убедитесь, что блок включен в 220В и загрузился.',
      details: [
        'Проверьте сетевой кабель 220В и тумблер включения на корпусе Uniholic 3.0.',
        'Дисплей контроллера или индикатор питания должен светиться.',
        'После включения подождите 15–20 секунд: модулю ESP требуется время для старта встроенной Wi-Fi точки доступа.'
      ],
      actionType: 'retry',
      actionLabel: 'Проверить связь снова',
      badge: 'Питание'
    },
    {
      id: 'step_wifi_network',
      stepNumber: 2,
      title: 'Проверьте сеть Wi-Fi на смартфоне («Uniholic»)',
      shortDesc: 'Телефон должен быть подключен именно к сети контроллера.',
      details: [
        'Откройте Настройки Wi-Fi на телефоне/планшете и подключитесь к сети «Uniholic».',
        '⚠️ ГЛАВНАЯ ПРИЧИНА СБОЯ НА ANDROID И IPHONE: Так как точка доступа блока не имеет выхода в интернет, телефон показывает предупреждение «Сеть Wi-Fi без доступа в интернет». Обязательно выберите «Оставаться подключенным» (Keep connection)!',
        'Если не нажать «Оставаться подключенным», операционная система смартфона автоматически отключит Wi-Fi пивоварни и переключит вас на сотовую сеть (4G/LTE), из-за чего связь пропадёт.',
        'Рекомендация: временно отключите «Мобильные данные» (передачу мобильного интернета) в шторке смартфона.'
      ],
      badge: 'Критично для Android'
    },
    {
      id: 'step_ip_address',
      stepNumber: 3,
      title: 'Проверьте IP-адрес подключения',
      shortDesc: `Текущий адрес: ${activeIp}. В режиме точки доступа (AP) адрес: 192.168.4.1.`,
      details: [
        'По умолчанию в режиме собственной точки доступа блока (AP) IP всегда: 192.168.4.1.',
        'Если вы подключили блок к домашнему Wi-Fi роутеру (режим STA), проверьте выданный роутером адрес (например, 192.168.1.xxx) на экране блока или в панели роутера.',
        'Если сомневаетесь, нажмите кнопку ниже для сброса адреса на стандартный заводской 192.168.4.1.'
      ],
      actionType: 'reset_ip',
      actionLabel: 'Сбросить IP на 192.168.4.1 (AP)',
      badge: 'IP / Маршрут'
    },
    {
      id: 'step_browser_direct',
      stepNumber: 4,
      title: 'Прямая проверка через веб-браузер',
      shortDesc: `Откройте http://${activeIp} напрямую в новой вкладке.`,
      details: [
        `Перейдите по ссылке http://${activeIp} в браузере Chrome или Safari.`,
        'Если там открывается оригинальный интерфейс контроллера Uniholic, значит блок полностью исправен и находится в вашей локальной сети.',
        'В установленном Android APK приложении «МастерВарка» локальные HTTP запросы разрешены через networkSecurityConfig.'
      ],
      actionType: 'open_direct',
      actionLabel: `Открыть http://${activeIp} ↗`,
      badge: 'Прямой тест'
    },
    {
      id: 'step_simulator_fallback',
      stepNumber: 5,
      title: 'Запасной вариант: Режим симулятора',
      shortDesc: 'Продолжайте варку по рецепту без физического блока!',
      details: [
        'Если связь временно недоступна, не останавливайте варку!',
        'Переключитесь в «Интерактивный симулятор» одним нажатием: вы сможете отслеживать все паузы, таймеры хмелей, получать звуковые сигналы и вести журнал варки.',
        'Физическим ТЭНом и насосом при этом можно управлять вручную кнопками на лицевой панели блока.'
      ],
      actionType: 'switch_simulator',
      actionLabel: 'Переключить в симулятор',
      badge: 'Бесперебойная варка'
    }
  ];
}

