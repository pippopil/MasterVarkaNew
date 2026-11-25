/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BreweryModelId, BreweryModelSpec, UserBrewery } from '../types/breweryDevice';
import { UniholicProbeResult } from '../types/uniholic';

/**
 * Каталог пивоварен с Wi-Fi модулями на рынке РФ:
 * Детальный анализ способов подключения со смартфона, протоколов и стандартных адресов.
 */
export const RUSSIAN_MARKET_BREWERIES: BreweryModelSpec[] = [
  {
    id: 'uniholic',
    name: 'Uniholic (Юнихолик 3.0 / 4.0 Pro)',
    shortName: 'Юнихолик',
    manufacturer: 'Uniholic Lab / Россия',
    country: 'Россия',
    marketShareRu: 'Лидер среди модулей автоматизации РФ (~40%)',
    description: 'Самый распространенный открытый блок автоматизации в РФ на базе ESP32/ESP8266. Устанавливается на любые сусловарочные котлы, клоны Braumeister и самодельные пивоварни.',
    defaultIp: '192.168.4.1',
    defaultPort: 80,
    defaultSsid: 'Uniholic',
    defaultPassword: '',
    defaultHeaterWatt: 3000,
    defaultBoilPowerPercent: 85,
    protocols: ['http_rest', 'websocket'],
    endpoints: {
      status: '/status',
      control: '/control',
      recipe: '/recipe'
    },
    phoneConnectionGuide: {
      apSsid: 'Uniholic или Uniholic_XXXXXX',
      apPassword: 'Без пароля (или 12345678)',
      defaultIp: '192.168.4.1',
      androidTips: [
        'Android отобразит уведомление «Точка Wi-Fi без доступа в интернет». Обязательно нажмите «Оставаться подключенным» (Keep Wi-Fi connection).',
        'Если связь пропадает, временно отключите «Мобильные данные» (4G/LTE) в верхней шторке телефона, чтобы трафик шел в Wi-Fi пивоварни.'
      ],
      iosTips: [
        'При подключении к сети «Uniholic» в настройках Wi-Fi iPhone подтвердите «Использовать без интернета».',
        'Отключите функцию «Помощь с Wi-Fi» в настройках сотовой связи iOS, если телефон переключается на LTE.'
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Включите питание блока Юнихолик',
          desc: 'Вставьте кабель 220В и включите сетевой тумблер. Подождите 15–20 секунд для старта Wi-Fi модуля ESP.'
        },
        {
          stepNumber: 2,
          title: 'Подключите смартфон к Wi-Fi сети блока',
          desc: 'Откройте настройки Wi-Fi телефона и выберите сеть «Uniholic» (или «Uniholic_XXXX»). Пароль не требуется.',
          important: true
        },
        {
          stepNumber: 3,
          title: 'Подтвердите «Оставаться подключенным»',
          desc: 'На Android/iOS подтвердите работу с сетью без доступа в интернет. Это критично, иначе телефон сбросит соединение.',
          important: true
        },
        {
          stepNumber: 4,
          title: 'Управляйте варкой в МастерВарке',
          desc: 'Вернитесь в приложение — статус станет зеленым («Подключено», пинг ~12 мс). Все паузы и нагрев синхронизируются автоматически.'
        }
      ]
    }
  },
  {
    id: 'bavaria',
    name: 'Бавария (Bavaria Brewery Wi-Fi)',
    shortName: 'Бавария',
    manufacturer: 'Spirit Lab / Бавария (Россия)',
    country: 'Россия',
    marketShareRu: 'Топ-2 в РФ среди моноблоков с насосом (~25%)',
    description: 'Отечественная автоматическая пивоварня с циркуляционным насосом Vortex/Wilo и электронным Wi-Fi блоком управления с поддержкой рецептов и пауз.',
    defaultIp: '192.168.4.1',
    defaultPort: 80,
    defaultSsid: 'Bavaria_Brewery',
    defaultPassword: 'bavaria_brewery',
    defaultHeaterWatt: 2500,
    defaultBoilPowerPercent: 80,
    protocols: ['http_rest'],
    endpoints: {
      status: '/api/data',
      control: '/api/set',
      recipe: '/api/recipe'
    },
    phoneConnectionGuide: {
      apSsid: 'Bavaria_Brewery или Bavaria_XXXX',
      apPassword: 'bavaria_brewery (или 12345678)',
      defaultIp: '192.168.4.1',
      androidTips: [
        'В настройках Wi-Fi найдите «Bavaria_Brewery». Пароль по умолчанию: 12345678 или указан в паспорте.',
        'При запросе «Интернет недоступен. Подключаться всегда?» выберите «Да».'
      ],
      iosTips: [
        'В настройках Wi-Fi подключитесь к Bavaria. После успешного подключения откройте МастерВарку.'
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Включите пивоварню Бавария',
          desc: 'Включите автомат на блоке. Светодиод Wi-Fi начнет равномерно мигать, оповещая о создании точки доступа.'
        },
        {
          stepNumber: 2,
          title: 'Подключите телефон к сети Bavaria',
          desc: 'В списке Wi-Fi сетей выберите «Bavaria_Brewery» и введите пароль по умолчанию (12345678).'
        },
        {
          stepNumber: 3,
          title: 'Сохраните подключение без интернета',
          desc: 'Разрешите телефону использовать сеть Bavaria несмотря на отсутствие внешнего интернета.'
        },
        {
          stepNumber: 4,
          title: 'Готово к запуску',
          desc: 'Адрес блока 192.168.4.1. В МастерВарке доступны контроль ТЭНа, рециркуляция насоса и мониторинг температуры сусла.'
        }
      ]
    }
  },
  {
    id: 'easybrew',
    name: 'EasyBrew Wi-Fi Master (30/40/50/70л)',
    shortName: 'EasyBrew',
    manufacturer: 'EasyBrew / МирБир',
    country: 'Россия / КНР',
    marketShareRu: 'Самая продаваемая бюджетная сусловарня в РФ (~20%)',
    description: 'Сусловарочные котлы EasyBrew с новым блоком автоматики Wi-Fi, сенсорным экраном, памятью на 10 рецептов и встроенным веб-сервером.',
    defaultIp: '192.168.4.1',
    defaultPort: 80,
    defaultSsid: 'EasyBrew',
    defaultPassword: 'easybrew123',
    defaultHeaterWatt: 2500,
    defaultBoilPowerPercent: 85,
    protocols: ['http_rest'],
    endpoints: {
      status: '/status',
      control: '/cmd',
      recipe: '/loadrecipe'
    },
    phoneConnectionGuide: {
      apSsid: 'EasyBrew_XXXX',
      apPassword: 'easybrew123 (или без пароля)',
      defaultIp: '192.168.4.1',
      androidTips: [
        'Для перехода в режим точки доступа зажмите кнопку Settings на блоке EasyBrew на 5 секунд до появления символа AP на экране.',
        'Подключитесь к сети EasyBrew_XXXX со смартфона.'
      ],
      iosTips: [
        'Подключитесь к сети EasyBrew в меню «Настройки -> Wi-Fi». Не закрывайте МастерВарку во время варки.'
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Активируйте режим AP на EasyBrew',
          desc: 'Включите блок. Если сеть не видна, зажмите кнопку сопряжения/Settings на 5 секунд.'
        },
        {
          stepNumber: 2,
          title: 'Подключитесь со смартфона',
          desc: 'Найдите сеть «EasyBrew_XXXX» и подключитесь к ней с паролем easybrew123.'
        },
        {
          stepNumber: 3,
          title: 'Подтвердите сопряжение в приложении',
          desc: 'Нажмите кнопку «Проверить связь» в МастерВарке: температура и статус ТЭНа отобразятся в реальном времени.'
        }
      ]
    }
  },
  {
    id: 'brewzilla_rapt',
    name: 'Brewzilla / Robobrew (RAPT Gen 4)',
    shortName: 'Brewzilla RAPT',
    manufacturer: 'KegLand / Доктор Губер / МирБир',
    country: 'Австралия / РФ',
    marketShareRu: 'Премиум-сегмент сусловарен в РФ (~8%)',
    description: 'Пивоварня Brewzilla Gen 4 с цветным контроллером RAPT, встроенным модулем Wi-Fi/Bluetooth, расширенным ПИД-регулированием и телеметрией.',
    defaultIp: '192.168.4.1',
    defaultPort: 80,
    defaultSsid: 'RAPT-Brewzilla',
    defaultPassword: '',
    defaultHeaterWatt: 3400,
    defaultBoilPowerPercent: 85,
    protocols: ['http_rest', 'rapt_cloud'],
    endpoints: {
      status: '/api/telemetry',
      control: '/api/control',
      recipe: '/api/profile'
    },
    phoneConnectionGuide: {
      apSsid: 'RAPT-XXXX',
      apPassword: 'Без пароля',
      defaultIp: '192.168.4.1',
      androidTips: [
        'Контроллер RAPT создает сеть RAPT-XXXX для первоначальной настройки и прямого локального управления.',
        'Если вы подключили контроллер к домашнему роутеру, введите IP-адрес пивоварни из меню RAPT -> Settings -> Network.'
      ],
      iosTips: [
        'Для локального управления по Wi-Fi отключите VPN на iPhone.'
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Откройте меню Wi-Fi на экране RAPT',
          desc: 'В меню контроллера перейдите в раздел Network -> Access Point mode (или проверьте IP в домашней сети).'
        },
        {
          stepNumber: 2,
          title: 'Подключитесь к сети RAPT',
          desc: 'Подключите смартфон к сети «RAPT-XXXX» или убедитесь, что телефон и пивоварня в одной сети Wi-Fi.'
        },
        {
          stepNumber: 3,
          title: 'Контроль телеметрии',
          desc: 'МастерВарка опрашивает контроллер и отображает данные всех независимых ТЭНов и магнитного насоса.'
        }
      ]
    }
  },
  {
    id: 'grainfather',
    name: 'Grainfather Connect (G30 / G40 / G70)',
    shortName: 'Grainfather',
    manufacturer: 'The Grainfather / Импорт в РФ',
    country: 'Новая Зеландия / ЕС',
    marketShareRu: 'Популярная европейская система в крафтовых клубах РФ (~5%)',
    description: 'Интеллектуальный контроллер Grainfather Connect со шлюзом Wi-Fi, многоступенчатыми паузами и высокоточным датчиком сусла.',
    defaultIp: '192.168.4.1',
    defaultPort: 8080,
    defaultSsid: 'Grainfather_Connect',
    defaultPassword: '',
    defaultHeaterWatt: 2000,
    defaultBoilPowerPercent: 85,
    protocols: ['http_rest', 'websocket'],
    endpoints: {
      status: '/controller/status',
      control: '/controller/action',
      recipe: '/controller/recipe'
    },
    phoneConnectionGuide: {
      apSsid: 'Grainfather_XXXX',
      apPassword: 'Без пароля',
      defaultIp: '192.168.4.1',
      androidTips: [
        'В режиме прямого соединения IP адрес порта контроллера: 192.168.4.1:8080.'
      ],
      iosTips: [
        'Разрешите поиск устройств в локальной сети в настройках конфиденциальности iOS.'
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Включите контроллер Grainfather',
          desc: 'Нажмите кнопку питания, удерживайте кнопку Reset/Pair для входа в режим сопряжения.'
        },
        {
          stepNumber: 2,
          title: 'Подключитесь к Wi-Fi сети',
          desc: 'Выберите сеть Grainfather на смартфоне.'
        },
        {
          stepNumber: 3,
          title: 'Загрузка профиля затирания',
          desc: 'Рецепт из МастерВарки экспортируется напрямую в температурный контроллер.'
        }
      ]
    }
  },
  {
    id: 'guten_ardbir',
    name: 'Guten / SmartBoil (Open ArdBir Wi-Fi)',
    shortName: 'Guten / ArdBir',
    manufacturer: 'Guten / ArdBir Community',
    country: 'КНР / Открытый проект',
    marketShareRu: 'Широко распространена среди крафтовиков-самодельщиков (~4%)',
    description: 'Пивоварни Guten 40-70л и кастомные клоны на прошивке Open ArdBir с ESP Wi-Fi шилдом. Надежный алгоритм ПИД и ступенчатое осахаривание.',
    defaultIp: '192.168.4.1',
    defaultPort: 80,
    defaultSsid: 'ArdBir_WiFi',
    defaultPassword: 'ardbir_wifi_pass',
    defaultHeaterWatt: 2500,
    defaultBoilPowerPercent: 80,
    protocols: ['http_rest'],
    endpoints: {
      status: '/getparams',
      control: '/setparams',
      recipe: '/loadstages'
    },
    phoneConnectionGuide: {
      apSsid: 'ArdBir_WiFi',
      apPassword: 'ardbir_wifi_pass',
      defaultIp: '192.168.4.1',
      androidTips: [
        'Подключитесь к сети ArdBir_WiFi. Пароль стандартный: ardbir_wifi_pass или 12345678.',
        'Нажмите «Оставаться подключенным» при предупреждении об отсутствии выхода в интернет.'
      ],
      iosTips: [
        'Подключите iPhone к Wi-Fi сети контроллера ArdBir.'
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Включение контроллера Guten / ArdBir',
          desc: 'Подайте питание 220В. На дисплее отобразится заставка Open ArdBir.'
        },
        {
          stepNumber: 2,
          title: 'Подключение со смартфона',
          desc: 'Подключитесь к сети «ArdBir_WiFi» с паролем по умолчанию.'
        },
        {
          stepNumber: 3,
          title: 'Старт процесса затирания',
          desc: 'В МастерВарке нажмите «Проверить связь» и управляйте паузами со смартфона.'
        }
      ]
    }
  },
  {
    id: 'craftbeerpi',
    name: 'CraftBeerPi (CBPi 3 / 4 на Raspberry Pi / Orange Pi)',
    shortName: 'CraftBeerPi',
    manufacturer: 'CraftBeerPi / Custom Pro',
    country: 'Международный / РФ сообщество',
    marketShareRu: 'Выбор профессиональных домашних пивоварен 50-300л (~2%)',
    description: 'Мощная система автоматизации на одноплатных микрокомпьютерах Raspberry Pi / Orange Pi с веб-сервером, поддержкой нескольких ТЭНов, клапанов и насосов.',
    defaultIp: '192.168.1.100',
    defaultPort: 5000,
    defaultSsid: 'Домашняя сеть Wi-Fi',
    defaultPassword: '',
    defaultHeaterWatt: 3500,
    defaultBoilPowerPercent: 90,
    protocols: ['cbpi_api', 'http_rest', 'websocket'],
    endpoints: {
      status: '/api/kettle',
      control: '/api/actor',
      recipe: '/api/recipe'
    },
    phoneConnectionGuide: {
      apSsid: 'Работает в домашней Wi-Fi сети (STA)',
      apPassword: 'Ваш пароль от домашнего роутера',
      defaultIp: '192.168.1.xxx:5000',
      androidTips: [
        'Смартфон и микрокомпьютер Raspberry Pi должны быть подключены к одному домашнему Wi-Fi роутеру.',
        'Укажите IP адрес Raspberry Pi (например 192.168.1.105) и порт 5000.'
      ],
      iosTips: [
        'Убедитесь, что iPhone подключен к той же Wi-Fi сети (2.4 или 5 ГГц), что и микрокомпьютер.'
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Запустите сервер CraftBeerPi',
          desc: 'Убедитесь, что сервис cbpi запущен на микрокомпьютере и подключен к вашему роутеру.'
        },
        {
          stepNumber: 2,
          title: 'Узнайте IP адрес в домашней сети',
          desc: 'Посмотрите адрес в панели роутера или командой `hostname -I` (например 192.168.1.100).'
        },
        {
          stepNumber: 3,
          title: 'Введите IP в настройках пивоварни',
          desc: 'Укажите адрес и порт 5000 в МастерВарке — данные варки подтянутся по REST API.'
        }
      ]
    }
  },
  {
    id: 'custom_esp',
    name: 'Кастомный контроллер (ESP32 / ESP8266 / Arduino Wi-Fi)',
    shortName: 'Кастом ESP',
    manufacturer: 'Индивидуальная сборка пивовара',
    country: 'Любая',
    marketShareRu: 'Собственные блоки автоматики на Wemos D1, NodeMCU, Tasmota (~6%)',
    description: 'Универсальный режим для самодельных блоков автоматики на микроконтроллерах ESP32, ESP8266, Arduino с Wi-Fi шилдом, прошивками Tasmota, ESPHome или кастомным скетчем.',
    defaultIp: '192.168.4.1',
    defaultPort: 80,
    defaultSsid: 'MyBrewery_ESP',
    defaultPassword: '',
    defaultHeaterWatt: 3000,
    defaultBoilPowerPercent: 85,
    protocols: ['http_rest', 'websocket'],
    endpoints: {
      status: '/status',
      control: '/control',
      recipe: '/recipe'
    },
    phoneConnectionGuide: {
      apSsid: 'Кастомный SSID контроллера или домашний роутер',
      apPassword: 'Ваш пароль',
      defaultIp: '192.168.4.1 или локальный IP',
      androidTips: [
        'Поддерживаются любые IP-адреса и порты (например, 192.168.4.1:80 или 192.168.1.200:8080).',
        'В Android APK приложении «МастерВарка» локальные HTTP запросы разрешены без ограничений.'
      ],
      iosTips: [
        'Для локальных IP адресов обеспечьте нахождение смартфона в одной подсети.'
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Подайте питание на контроллер ESP',
          desc: 'Убедитесь, что микроконтроллер загрузил прошивку и поднял точку доступа либо подключился к роутеру.'
        },
        {
          stepNumber: 2,
          title: 'Укажите сетевые параметры в МастерВарке',
          desc: 'Введите IP-адрес, порт и мощность установленного ТЭНа.'
        },
        {
          stepNumber: 3,
          title: 'Тест связи',
          desc: 'Нажмите «Проверить связь» для замера времени отклика контроллера.'
        }
      ]
    }
  }
];

export const STORAGE_KEY_USER_BREWERIES = 'mastervarka_user_breweries_v1';
export const STORAGE_KEY_ACTIVE_BREWERY_ID = 'mastervarka_active_brewery_id_v1';

/**
 * Стартовая пивоварня по умолчанию для новых пользователей
 */
export const DEFAULT_USER_BREWERY: UserBrewery = {
  id: 'brewery_default_uniholic',
  name: 'Моя пивоварня (Юнихолик 3.0)',
  modelId: 'uniholic',
  connectionMode: 'simulator',
  ip: '192.168.4.1',
  port: 80,
  ssid: 'Uniholic',
  heaterPowerWatt: 3000,
  boilPowerPercent: 85,
  pumpWorkMinutes: 14,
  pumpRestMinutes: 1,
  tempSensorOffsetC: 0.0,
  isDefault: true,
  notes: 'Основной варочный блок автоматики',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

/**
 * Получение спецификации модели по ID
 */
export function getBreweryModelSpec(modelId: BreweryModelId): BreweryModelSpec {
  const found = RUSSIAN_MARKET_BREWERIES.find(m => m.id === modelId);
  return found || RUSSIAN_MARKET_BREWERIES[0];
}

/**
 * Загрузка списка пивоварен пользователя из локального хранилища
 */
export function loadUserBreweries(): UserBrewery[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_BREWERIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[BreweryStore] Не удалось загрузить пивоварни из localStorage:', e);
  }
  return [DEFAULT_USER_BREWERY];
}

/**
 * Сохранение списка пивоварен пользователя в локальное хранилище
 */
export function saveUserBreweries(breweries: UserBrewery[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER_BREWERIES, JSON.stringify(breweries));
  } catch (e) {
    console.error('[BreweryStore] Ошибка сохранения пивоварен в localStorage:', e);
  }
}

/**
 * Получение ID активной выбранной пивоварни
 */
export function getActiveBreweryId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEY_ACTIVE_BREWERY_ID);
    if (id) return id;
  } catch {}
  return DEFAULT_USER_BREWERY.id;
}

/**
 * Установка активной пивоварни
 */
export function setActiveBreweryId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_BREWERY_ID, id);
  } catch {}
}

/**
 * Получение текущей активной пивоварни
 */
export function getActiveBrewery(): UserBrewery {
  const all = loadUserBreweries();
  const activeId = getActiveBreweryId();
  const found = all.find(b => b.id === activeId);
  return found || all[0] || DEFAULT_USER_BREWERY;
}

/**
 * Проверка связи с пивоварней (универсальный пинг для любой модели РФ)
 */
export async function probeBreweryConnection(
  brewery: UserBrewery,
  timeoutMs = 3500
): Promise<UniholicProbeResult> {
  const timestamp = new Date().toISOString();

  // Режим интерактивного симулятора
  if (brewery.connectionMode === 'simulator') {
    if (brewery.ip === '0.0.0.0' || brewery.ip.toLowerCase() === 'offline') {
      return {
        success: false,
        failureReason: 'unreachable',
        error: 'Симуляция ошибки: указан недопустимый адрес 0.0.0.0',
        timestamp
      };
    }
    const simulatedPing = Math.floor(Math.random() * 12) + 10; // 10..22 мс
    return {
      success: true,
      pingMs: simulatedPing,
      statusCode: 200,
      timestamp
    };
  }

  // Физический режим проверки реального Wi-Fi соединения
  const cleanHost = brewery.ip.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!cleanHost || cleanHost === '0.0.0.0') {
    return {
      success: false,
      failureReason: 'unreachable',
      error: 'Указан пустой или недействительный адрес контроллера пивоварни.',
      timestamp
    };
  }

  const spec = getBreweryModelSpec(brewery.modelId);
  const port = brewery.port || spec.defaultPort || 80;
  const targetUrl = `http://${cleanHost}:${port}${spec.endpoints.status || '/'}`;

  const startTime = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(targetUrl, {
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
      statusCode: res.status || 200,
      timestamp
    };
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      return {
        success: false,
        failureReason: 'timeout',
        error: `Превышено время ожидания ответа (${(timeoutMs / 1000).toFixed(1)} сек) от пивоварни «${brewery.name}» (${cleanHost}:${port}).`,
        timestamp
      };
    }

    // Вторая попытка: корневой адрес '/'
    try {
      const pingController = new AbortController();
      const pingTimeout = setTimeout(() => pingController.abort(), 2000);
      const rootRes = await fetch(`http://${cleanHost}:${port}/`, {
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
        cleanHost.startsWith('192.168.');

      const failureReason = isMixedContent ? 'mixed_content' : 'unreachable';
      const errorMsg = isMixedContent
        ? `Браузер блокирует прямой HTTP запрос к локальному IP ${cleanHost} из защищенной HTTPS сессии. В Android APK приложении «МастерВарка» ограничение снято. Либо откройте http://${cleanHost}:${port} в браузере напрямую.`
        : `Не удалось связаться с пивоварней «${brewery.name}» по адресу ${cleanHost}:${port}. Убедитесь, что смартфон подключен к Wi-Fi сети «${spec.phoneConnectionGuide.apSsid}».`;

      return {
        success: false,
        failureReason,
        error: errorMsg,
        timestamp
      };
    }
  }
}
