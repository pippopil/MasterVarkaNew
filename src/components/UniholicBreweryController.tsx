/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Recipe } from '../types/brewing';
import {
  UniholicDeviceInfo,
  UniholicBrewSettings,
  UniholicPauseItem,
  UniholicHopTimer,
  UniholicLiveTelemetry,
  UniholicBrewStatus
} from '../types/uniholic';
import {
  DEFAULT_UNIHOLIC_DEVICE,
  DEFAULT_UNIHOLIC_SETTINGS,
  convertRecipeToUniholicPauses,
  convertRecipeToUniholicHops,
  playControllerBeep,
  probeUniholicConnection,
  getUniholicTroubleshootGuide
} from '../services/uniholicService';
import { UserBrewery, BreweryModelId } from '../types/breweryDevice';
import {
  loadUserBreweries,
  saveUserBreweries,
  getActiveBrewery,
  setActiveBreweryId,
  getBreweryModelSpec,
  RUSSIAN_MARKET_BREWERIES,
  probeBreweryConnection
} from '../services/breweryModels';
import { AddBreweryModal } from './AddBreweryModal';
import { PhoneConnectionGuideModal } from './PhoneConnectionGuideModal';
import { BleHydrometerWidget } from './BleHydrometerWidget';
import {
  Cpu,
  Flame,
  Play,
  Pause,
  Square,
  SkipForward,
  Wifi,
  WifiOff,
  Sliders,
  Bell,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Thermometer,
  Layers,
  Settings,
  QrCode,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2,
  Clock,
  Volume2,
  VolumeX,
  Radio,
  Wrench,
  ExternalLink,
  HelpCircle,
  Activity,
  Check,
  ShieldAlert,
  Zap,
  Smartphone,
  Edit3,
  ChevronDown
} from 'lucide-react';

interface Props {
  recipe: Recipe;
  allRecipes: Recipe[];
  onSelectRecipe: (r: Recipe) => void;
  onOpenRecipeBuilder: () => void;
}

export const UniholicBreweryController: React.FC<Props> = ({
  recipe,
  allRecipes,
  onSelectRecipe,
  onOpenRecipeBuilder
}) => {
  // Список пивоварен пользователя и активная пивоварня
  const [userBreweries, setUserBreweries] = useState<UserBrewery[]>(() => loadUserBreweries());
  const [activeBrewery, setActiveBrewery] = useState<UserBrewery>(() => getActiveBrewery());
  const [addBreweryModalOpen, setAddBreweryModalOpen] = useState(false);
  const [editingBrewery, setEditingBrewery] = useState<UserBrewery | null>(null);
  const [phoneGuideModalOpen, setPhoneGuideModalOpen] = useState(false);
  const [breweryDropdownOpen, setBreweryDropdownOpen] = useState(false);

  // Настройки устройства и подключения
  const [device, setDevice] = useState<UniholicDeviceInfo>(() => {
    try {
      const saved = localStorage.getItem('uniholic_device_config');
      const initial = saved ? JSON.parse(saved) : DEFAULT_UNIHOLIC_DEVICE;
      const initialBrewery = getActiveBrewery();
      const spec = getBreweryModelSpec(initialBrewery?.modelId || 'uniholic');
      return {
        ...DEFAULT_UNIHOLIC_DEVICE,
        ...initial,
        model: spec?.name || 'Uniholic',
        activeIp: initialBrewery?.ip || '192.168.4.1',
        connectionMode: initialBrewery?.connectionMode === 'simulator' ? 'simulator' : 'real'
      };
    } catch {
      return DEFAULT_UNIHOLIC_DEVICE;
    }
  });

  const [settings, setSettings] = useState<UniholicBrewSettings>(() => {
    try {
      const saved = localStorage.getItem('uniholic_brew_settings');
      const initial = saved ? JSON.parse(saved) : DEFAULT_UNIHOLIC_SETTINGS;
      const initialBrewery = getActiveBrewery();
      return {
        ...DEFAULT_UNIHOLIC_SETTINGS,
        ...initial,
        heaterPowerWatt: initialBrewery?.heaterPowerWatt || 3000,
        boilPowerPercent: initialBrewery?.boilPowerPercent || 85,
        pumpWorkMinutes: initialBrewery?.pumpWorkMinutes || 14,
        pumpRestMinutes: initialBrewery?.pumpRestMinutes || 1
      };
    } catch {
      return DEFAULT_UNIHOLIC_SETTINGS;
    }
  });

  // Паузы и хмели для текущей варки
  const [pauses, setPauses] = useState<UniholicPauseItem[]>(() =>
    convertRecipeToUniholicPauses(recipe)
  );

  const [hopTimers, setHopTimers] = useState<UniholicHopTimer[]>(() =>
    convertRecipeToUniholicHops(recipe)
  );

  // Телеметрия варочного процесса (ТЭН 1 — верхняя кнопка, Насос — нижняя кнопка)
  const [telemetry, setTelemetry] = useState<UniholicLiveTelemetry>(() => {
    const initialPauses = recipe ? convertRecipeToUniholicPauses(recipe) : [];
    return {
      currentTempC: 21.4,
      targetTempC: initialPauses[0]?.targetTempC || 65,
      heaterActive: false,
      heaterPwmPercent: 0,
      pumpActive: false,
      status: 'idle',
      currentPauseIndex: 0,
      currentPauseName: initialPauses[0]?.name || 'Ожидание старта',
      pauseRemainingSeconds: (initialPauses[0]?.durationMin || 0) * 60,
      totalElapsedSeconds: 0,
      loadedRecipeId: recipe?.id || '',
      loadedRecipeName: recipe?.name || 'Рецепт',
      activeAlert: null
    };
  });

  // Модальные окна и диагностика Wi-Fi связи
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [troubleshootModalOpen, setTroubleshootModalOpen] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [wifiSuccessBanner, setWifiSuccessBanner] = useState<string | null>(null);
  const [wifiErrorBanner, setWifiErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [activeHopAlert, setActiveHopAlert] = useState<UniholicHopTimer | null>(null);
  const [showMaltAlert, setShowMaltAlert] = useState(false);

  // Сохранение настроек в localStorage
  useEffect(() => {
    localStorage.setItem('uniholic_device_config', JSON.stringify(device));
  }, [device]);

  useEffect(() => {
    localStorage.setItem('uniholic_brew_settings', JSON.stringify(settings));
  }, [settings]);

  // Функция проверки Wi-Fi соединения с контроллером
  const handleCheckConnection = async (
    forcedIp?: string,
    forcedMode?: 'real' | 'simulator',
    showNotification = true
  ) => {
    const targetIp = forcedIp ?? device.activeIp;
    const targetMode = forcedMode ?? device.connectionMode;

    setIsTestingConnection(true);
    setDevice(prev => ({ ...prev, connectionStatus: 'connecting' }));

    const result = await probeUniholicConnection(targetIp, targetMode);
    setIsTestingConnection(false);

    if (result.success) {
      setDevice(prev => ({
        ...prev,
        isConnected: true,
        connectionStatus: 'connected',
        lastPingMs: result.pingMs,
        lastCheckedAt: result.timestamp,
        lastErrorMessage: undefined,
        failureReason: undefined
      }));
      if (showNotification) {
        if (settings.soundAlerts) playControllerBeep(1800, 0.08, 2);
        setWifiSuccessBanner(
          `Подключение к пивоварне через Wi-Fi успешно установлено! (IP: ${targetIp}, задержка ${result.pingMs} мс). Связь стабильна.`
        );
        setWifiErrorBanner(null);
        setTimeout(() => setWifiSuccessBanner(null), 5000);
      }
    } else {
      setDevice(prev => ({
        ...prev,
        isConnected: false,
        connectionStatus: 'failed',
        lastErrorMessage: result.error,
        failureReason: result.failureReason,
        lastCheckedAt: result.timestamp
      }));
      if (settings.soundAlerts) playControllerBeep(650, 0.2, 1);
      setWifiErrorBanner(
        result.error || `Сбой подключения к пивоварне через Wi-Fi по адресу ${targetIp}`
      );
    }
  };

  // Переключение активной пивоварни
  const handleSelectBrewery = (brewery: UserBrewery) => {
    setActiveBrewery(brewery);
    setActiveBreweryId(brewery.id);
    setBreweryDropdownOpen(false);

    const spec = getBreweryModelSpec(brewery.modelId);
    setDevice(prev => ({
      ...prev,
      model: spec.name,
      activeIp: brewery.ip,
      connectionMode: brewery.connectionMode === 'simulator' ? 'simulator' : 'real'
    }));
    setSettings(prev => ({
      ...prev,
      heaterPowerWatt: brewery.heaterPowerWatt,
      boilPowerPercent: brewery.boilPowerPercent,
      pumpWorkMinutes: brewery.pumpWorkMinutes,
      pumpRestMinutes: brewery.pumpRestMinutes
    }));

    handleCheckConnection(
      brewery.ip,
      brewery.connectionMode === 'simulator' ? 'simulator' : 'real',
      true
    );
  };

  // Сохранение новой или отредактированной пивоварни
  const handleSaveUserBrewery = (saved: UserBrewery) => {
    const existingIdx = userBreweries.findIndex(b => b.id === saved.id);
    let updated: UserBrewery[];
    if (existingIdx >= 0) {
      updated = userBreweries.map(b => (b.id === saved.id ? saved : b));
    } else {
      updated = [...userBreweries, saved];
    }
    setUserBreweries(updated);
    saveUserBreweries(updated);
    handleSelectBrewery(saved);
  };

  // Удаление пивоварни
  const handleDeleteUserBrewery = (id: string) => {
    const filtered = userBreweries.filter(b => b.id !== id);
    if (filtered.length === 0) return;
    setUserBreweries(filtered);
    saveUserBreweries(filtered);
    if (activeBrewery.id === id) {
      handleSelectBrewery(filtered[0]);
    }
  };

  // Первичная проверка связи при монтировании если включен физический Wi-Fi блок
  useEffect(() => {
    if (device.connectionMode === 'real') {
      handleCheckConnection(device.activeIp, 'real', false);
    }
  }, []);

  // При изменении выбранного рецепта пересчитываем паузы
  const handleLoadRecipeIntoController = (newRecipe: Recipe) => {
    const newPauses = convertRecipeToUniholicPauses(newRecipe);
    const newHops = convertRecipeToUniholicHops(newRecipe);
    setPauses(newPauses);
    setHopTimers(newHops);
    setTelemetry(prev => ({
      ...prev,
      status: 'idle',
      currentPauseIndex: 0,
      currentPauseName: newPauses[0]?.name || 'Ожидание',
      targetTempC: newPauses[0]?.targetTempC || 65,
      pauseRemainingSeconds: (newPauses[0]?.durationMin || 0) * 60,
      heaterActive: false,
      heaterPwmPercent: 0,
      pumpActive: false,
      loadedRecipeId: newRecipe.id,
      loadedRecipeName: newRecipe.name,
      activeAlert: null
    }));
    playControllerBeep(1500, 0.1, 2);
    setSuccessBanner(`Рецепт «${newRecipe.name}» успешно загружен в блок Uniholic! Паузы и хмель синхронизированы.`);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  // 1-секундный таймер симуляции / физической синхронизации варки
  useEffect(() => {
    if (telemetry.status === 'idle' || telemetry.status === 'paused' || telemetry.status === 'finished') {
      return;
    }

    const interval = setInterval(() => {
      setTelemetry(prev => {
        let currentTemp = prev.currentTempC;
        const currentPause = pauses[prev.currentPauseIndex];
        const targetTemp = currentPause ? currentPause.targetTempC : prev.targetTempC;

        let status = prev.status;
        let pIndex = prev.currentPauseIndex;
        let remSeconds = prev.pauseRemainingSeconds;
        let h = prev.heaterActive;
        let pwm = prev.heaterPwmPercent;
        let pump = prev.pumpActive;
        let alertText = prev.activeAlert;

        // Физическая термодинамика нагрева сусла:
        // ТЭН 3000 Вт при объеме ~30 л нагревает ~1°C за ~40 секунд (в симуляторе делаем комфортную скорость)
        const isHeating = currentTemp < targetTemp - 0.2;
        const isNearTarget = Math.abs(currentTemp - targetTemp) <= 0.5;

        if (isHeating) {
          pwm = 100;
          h = true;
          // Скорость нагрева в режиме симулятора (~0.4°C в секунду для наглядности процесса)
          currentTemp = Math.min(targetTemp, currentTemp + 0.4);
        } else if (isNearTarget) {
          pwm = targetTemp >= 98 ? settings.boilPowerPercent : 35; // ПИД-поддержание
          h = true;
          // Колебания вокруг целевой
          currentTemp = Number((targetTemp + (Math.random() * 0.2 - 0.1)).toFixed(1));
        } else {
          // Остывание
          pwm = 0;
          h = false;
          currentTemp = Math.max(targetTemp, currentTemp - 0.1);
        }

        // Логика состояний этапов варки
        if (status === 'heating_strike') {
          pump = true;
          if (currentTemp >= targetTemp) {
            status = 'wait_malt_add';
            h = false;
            pwm = 0;
            pump = false;
            setShowMaltAlert(true);
            alertText = 'Температура первого налива достигнута! Засыпьте солод.';
            if (settings.soundAlerts) playControllerBeep(1200, 0.25, 4);
          }
        } else if (status === 'mashing') {
          pump = currentPause?.pumpEnabled ?? true;
          if (remSeconds > 0) {
            remSeconds -= 1;
          } else {
            // Пауза завершена! Переходим к следующей паузе
            if (settings.soundAlerts) playControllerBeep(2000, 0.15, 3);
            if (pIndex + 1 < pauses.length) {
              const nextIdx = pIndex + 1;
              const nextP = pauses[nextIdx];
              pIndex = nextIdx;
              remSeconds = (nextP.durationMin || 0) * 60;
              if (nextP.type === 'boil') {
                status = 'heating_boil';
              } else if (nextP.type === 'mashout') {
                status = 'mash_out';
              }
            } else {
              status = 'finished';
              h = false;
              pump = false;
            }
          }
        } else if (status === 'mash_out') {
          pump = false;
          if (remSeconds > 0) {
            remSeconds -= 1;
          } else {
            status = 'wait_sparge';
            h = false;
            pwm = 0;
            alertText = 'Мэшаут завершен! Промойте дробину и включите нагрев на кипячение.';
            if (settings.soundAlerts) playControllerBeep(1800, 0.2, 3);
          }
        } else if (status === 'heating_boil') {
          pump = false;
          if (currentTemp >= 99.5) {
            status = 'boiling';
            alertText = 'Сусло закипело! Запущен таймер кипячения и охмеления.';
            if (settings.soundAlerts) playControllerBeep(2200, 0.2, 3);
          }
        } else if (status === 'boiling') {
          pump = false;
          pwm = settings.boilPowerPercent;
          if (remSeconds > 0) {
            remSeconds -= 1;

            // Проверка добавления хмелей по оставшимся минутам кипячения
            const boilRemainingMin = Math.ceil(remSeconds / 60);
            hopTimers.forEach(hop => {
              if (!hop.isAdded && hop.timeRemainingMin === boilRemainingMin && remSeconds % 60 === 0) {
                setActiveHopAlert(hop);
                if (settings.soundAlerts) playControllerBeep(1500, 0.25, 3);
              }
            });
          } else {
            status = 'whirlpool';
            remSeconds = 15 * 60;
            pump = true;
            h = false;
            pwm = 0;
            alertText = 'Кипячение завершено! Включен вирпул и охлаждение.';
            if (settings.soundAlerts) playControllerBeep(2400, 0.2, 4);
          }
        } else if (status === 'whirlpool') {
          pump = true;
          currentTemp = Math.max(20, currentTemp - 0.3); // Охлаждение чиллером
          if (remSeconds > 0) {
            remSeconds -= 1;
          } else {
            status = 'finished';
            pump = false;
            alertText = 'Варка полностью завершена! Сусло охлаждено и готово к переливу на брожение.';
            if (settings.soundAlerts) playControllerBeep(2000, 0.3, 5);
          }
        }

        return {
          ...prev,
          currentTempC: Number(currentTemp.toFixed(1)),
          targetTempC: pauses[pIndex]?.targetTempC || targetTemp,
          heaterActive: h,
          heaterPwmPercent: pwm,
          pumpActive: pump,
          status,
          currentPauseIndex: pIndex,
          currentPauseName: pauses[pIndex]?.name || 'Варка',
          pauseRemainingSeconds: remSeconds,
          totalElapsedSeconds: prev.totalElapsedSeconds + 1,
          activeAlert: alertText
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [telemetry.status, pauses, hopTimers, settings]);

  // Управление процессом
  const handleStartBrew = () => {
    playControllerBeep(1800, 0.15, 2);
    setTelemetry(prev => ({
      ...prev,
      status: prev.status === 'wait_malt_add' ? 'mashing' : 'heating_strike',
      heaterActive: true,
      heaterPwmPercent: 100
    }));
    setShowMaltAlert(false);
  };

  const handlePauseBrew = () => {
    playControllerBeep(1200, 0.15, 1);
    setTelemetry(prev => ({
      ...prev,
      status: 'paused',
      heaterActive: false,
      heaterPwmPercent: 0,
      pumpActive: false
    }));
  };

  const handleStopBrew = () => {
    playControllerBeep(800, 0.3, 1);
    setTelemetry(prev => ({
      ...prev,
      status: 'idle',
      heaterActive: false,
      heaterPwmPercent: 0,
      pumpActive: false,
      currentPauseIndex: 0,
      pauseRemainingSeconds: (pauses[0]?.durationMin || 0) * 60
    }));
  };

  const handleSkipToNextStage = () => {
    playControllerBeep(1500, 0.1, 2);
    setTelemetry(prev => {
      const nextIdx = Math.min(pauses.length - 1, prev.currentPauseIndex + 1);
      const nextP = pauses[nextIdx];
      let newStatus: UniholicBrewStatus = 'mashing';
      if (nextP.type === 'boil') newStatus = 'boiling';
      if (nextP.type === 'whirlpool') newStatus = 'whirlpool';

      return {
        ...prev,
        currentPauseIndex: nextIdx,
        currentPauseName: nextP.name,
        targetTempC: nextP.targetTempC,
        pauseRemainingSeconds: (nextP.durationMin || 0) * 60,
        status: newStatus
      };
    });
  };

  // Ручное переключение ТЭНа (Верхняя кнопка на блоке управления — ТЭН 1)
  const handleToggleHeater = () => {
    playControllerBeep(1600, 0.08, 1);
    setTelemetry(prev => {
      const active = !prev.heaterActive;
      return {
        ...prev,
        heaterActive: active,
        heaterPwmPercent: active ? 100 : 0
      };
    });
  };

  // Ручное переключение Насоса (Нижняя кнопка на блоке управления — НАСОС)
  const handleTogglePump = () => {
    playControllerBeep(1400, 0.08, 1);
    setTelemetry(prev => ({
      ...prev,
      pumpActive: !prev.pumpActive
    }));
  };

  // Форматирование секунд в ММ:СС
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-6xl mx-auto pb-12 overflow-x-hidden min-w-0">
      {/* Верхний статус-бар контроллера с переключателем пивоварен РФ */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-md border border-stone-200 dark:border-stone-800 space-y-3 sm:space-y-4 w-full min-w-0 max-w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4 w-full min-w-0">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3.5 w-full min-w-0 flex-1">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20 shrink-0">
              <Cpu className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="relative min-w-0">
                <button
                  type="button"
                  onClick={() => setBreweryDropdownOpen(!breweryDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 group text-left cursor-pointer max-w-full"
                  title="Нажмите для переключения между вашими пивоварнями"
                >
                  <h2 className="text-base sm:text-2xl font-black text-stone-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors break-words line-clamp-2 leading-tight">
                    {activeBrewery.name}
                  </h2>
                  <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-stone-400 shrink-0 transition-transform ${breweryDropdownOpen ? 'rotate-180 text-amber-500' : ''}`} />
                </button>

                {/* Выпадающий список добавленных пивоварен пользователя */}
                {breweryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 z-40 w-[min(22rem,calc(100vw-2.5rem))] max-w-[calc(100vw-2.5rem)] bg-white dark:bg-stone-800 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-stone-400 flex justify-between items-center border-b border-stone-100 dark:border-stone-700">
                      <span>Мои пивоварни ({userBreweries.length})</span>
                      <span className="text-amber-500">Wi-Fi модуль</span>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1 py-1">
                      {userBreweries.map(b => {
                        const isCur = b.id === activeBrewery.id;
                        const bSpec = getBreweryModelSpec(b.modelId);
                        return (
                          <div
                            key={b.id}
                            className={`p-2.5 rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer ${
                              isCur
                                ? 'bg-amber-500/10 border border-amber-500/40 text-stone-900 dark:text-white'
                                : 'hover:bg-stone-100 dark:hover:bg-stone-700/60 text-stone-700 dark:text-stone-300'
                            }`}
                            onClick={() => handleSelectBrewery(b)}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isCur ? 'bg-amber-500 ring-4 ring-amber-500/20' : 'bg-stone-300 dark:bg-stone-600'}`} />
                              <div className="min-w-0">
                                <div className="font-extrabold text-xs truncate">
                                  {b.name}
                                </div>
                                <div className="text-[10px] text-stone-500 font-mono">
                                  {bSpec.shortName} • {b.ip}:{b.port} ({b.connectionMode === 'simulator' ? 'Симулятор' : 'Wi-Fi'})
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingBrewery(b);
                                setAddBreweryModalOpen(true);
                                setBreweryDropdownOpen(false);
                              }}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
                              title="Редактировать параметры"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-stone-100 dark:border-stone-700">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBrewery(null);
                          setAddBreweryModalOpen(true);
                          setBreweryDropdownOpen(false);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Добавить еще одну пивоварню с Wi-Fi</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  {getBreweryModelSpec(activeBrewery.modelId).name}
                </span>
                <span className="text-xs text-stone-500">
                  ТЭН {activeBrewery.heaterPowerWatt} Вт • Насос {activeBrewery.pumpWorkMinutes}/{activeBrewery.pumpRestMinutes} мин
                </span>
              </div>

              {/* Индикация состояния Wi-Fi подключения к пивоварне */}
              <div className="mt-2 flex items-center gap-2 flex-wrap text-xs">
                {device.connectionStatus === 'connected' ? (
                  <button
                    type="button"
                    onClick={() => handleCheckConnection(activeBrewery.ip, activeBrewery.connectionMode === 'simulator' ? 'simulator' : 'real', true)}
                    disabled={isTestingConnection}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors cursor-pointer"
                    title="Wi-Fi связь активна. Нажмите для повторного пинга"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Wi-Fi Подключено</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200/80 dark:bg-emerald-800/80 font-mono font-black text-emerald-900 dark:text-emerald-100">
                      {device.lastPingMs || 14} мс
                    </span>
                  </button>
                ) : device.connectionStatus === 'connecting' || isTestingConnection ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                    <span>Проверка Wi-Fi связи...</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTroubleshootModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-700 font-black hover:bg-rose-200 transition-colors cursor-pointer animate-pulse"
                    title="Нажмите для просмотра способов устранения сбоя"
                  >
                    <WifiOff className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Сбой связи</span>
                    <span className="text-[10px] bg-rose-200 dark:bg-rose-900 px-1.5 py-0.5 rounded font-bold underline">
                      Диагностика 🛠️
                    </span>
                  </button>
                )}

                <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  <span>IP: <b className="font-mono">{activeBrewery.ip}:{activeBrewery.port}</b></span>
                  <span>•</span>
                  <span>Режим: <b>{activeBrewery.connectionMode === 'simulator' ? 'Интерактивный симулятор' : activeBrewery.connectionMode === 'ap' ? 'Прямая точка доступа (AP)' : 'Домашняя сеть (STA)'}</b></span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center sm:flex-wrap gap-2 w-full lg:w-auto min-w-0">
            {/* Кнопка добавления новой пивоварни */}
            <button
              type="button"
              onClick={() => {
                setEditingBrewery(null);
                setAddBreweryModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 truncate"
              title="Добавить еще одну пивоварню с модулем Wi-Fi"
            >
              <Plus className="w-4 h-4 stroke-[3] shrink-0" />
              <span className="truncate">Добавить пивоварню</span>
            </button>

            {/* Инструкция со смартфона для выбранной модели */}
            <button
              type="button"
              onClick={() => setPhoneGuideModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer truncate"
              title="Пошаговая инструкция подключения смартфона для этой модели"
            >
              <Smartphone className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="truncate">Инструкция Wi-Fi</span>
            </button>

            {/* Проверка связи */}
            <button
              type="button"
              onClick={() => handleCheckConnection(activeBrewery.ip, activeBrewery.connectionMode === 'simulator' ? 'simulator' : 'real', true)}
              disabled={isTestingConnection}
              className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 truncate"
              title="Замерить отклик контроллера прямо сейчас"
            >
              <Activity className={`w-4 h-4 shrink-0 ${isTestingConnection ? 'animate-spin' : ''}`} />
              <span className="truncate">{isTestingConnection ? 'Пинг...' : 'Проверить связь'}</span>
            </button>

            {/* Редактировать пивоварню + переход в калькулятор */}
            <div className="flex items-center gap-1.5 min-w-0">
              <button
                type="button"
                onClick={() => {
                  setEditingBrewery(activeBrewery);
                  setAddBreweryModalOpen(true);
                }}
                className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
                title="Настроить параметры пивоварни"
              >
                <Settings className="w-4 h-4 text-stone-600 dark:text-stone-300" />
              </button>

              <button
                type="button"
                onClick={onOpenRecipeBuilder}
                className="flex-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer truncate"
              >
                <span className="truncate">Калькулятор</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* УВЕДОМЛЕНИЕ: Удачное подключение к пивоварне через Wi-Fi */}
      {wifiSuccessBanner && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border-2 border-emerald-400 dark:border-emerald-600 text-emerald-950 dark:text-emerald-50 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-md animate-fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 shadow-sm shadow-emerald-600/30">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <div className="font-black text-emerald-950 dark:text-emerald-50 text-sm flex items-center gap-2">
                <span>Успешное подключение к пивоварне через Wi-Fi!</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-950 dark:text-emerald-100 font-mono font-bold">
                  {device.lastPingMs || 14} мс
                </span>
              </div>
              <p className="text-emerald-800 dark:text-emerald-200 text-xs mt-0.5">
                {wifiSuccessBanner}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setWifiSuccessBanner(null)}
            className="px-2.5 py-1 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50 text-xs font-bold cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* УВЕДОМЛЕНИЕ: Сбой подключения к пивоварне через Wi-Fi с быстрым доступом к устранению */}
      {(wifiErrorBanner || device.connectionStatus === 'failed') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border-2 border-rose-400 dark:border-rose-600 text-rose-950 dark:text-rose-100 shadow-lg space-y-3 animate-fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0 shadow-sm shadow-rose-600/30">
                <WifiOff className="w-5 h-5" />
              </div>
              <div>
                <div className="font-black text-base text-rose-950 dark:text-rose-50 flex items-center gap-2 flex-wrap">
                  <span>Сбой подключения к пивоварне через Wi-Fi!</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 border border-rose-300">
                    IP: {device.activeIp}
                  </span>
                </div>
                <p className="text-xs text-rose-800 dark:text-rose-200 mt-1 leading-relaxed">
                  {device.lastErrorMessage || `Блок управления Uniholic не отвечает по адресу ${device.activeIp}. Смартфон может быть не подключен к сети «Uniholic», отключено питание или блокируется локальный трафик.`}
                </p>
              </div>
            </div>
            {wifiErrorBanner && (
              <button
                type="button"
                onClick={() => setWifiErrorBanner(null)}
                className="text-rose-400 hover:text-rose-600 text-sm p-1 cursor-pointer shrink-0"
                title="Скрыть предупреждение"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-200 dark:border-rose-800/80">
            <button
              type="button"
              onClick={() => setTroubleshootModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>Способы устранения неисправности</span>
            </button>

            <button
              type="button"
              disabled={isTestingConnection}
              onClick={() => handleCheckConnection(device.activeIp, device.connectionMode, true)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-900 dark:text-white font-bold text-xs flex items-center gap-1.5 border border-rose-300 dark:border-rose-700 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin' : ''}`} />
              <span>{isTestingConnection ? 'Проверка...' : 'Повторить попытку'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDevice(prev => ({ ...prev, activeIp: '192.168.4.1' }));
                handleCheckConnection('192.168.4.1', device.connectionMode, true);
              }}
              className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold cursor-pointer"
              title="Сбросить IP на заводской 192.168.4.1 (режим точки доступа)"
            >
              Сброс на 192.168.4.1
            </button>

            <button
              type="button"
              onClick={() => {
                setDevice(prev => ({
                  ...prev,
                  connectionMode: 'simulator',
                  isConnected: true,
                  connectionStatus: 'connected'
                }));
                setWifiErrorBanner(null);
                playControllerBeep(1600, 0.1, 1);
              }}
              className="px-3 py-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 hover:bg-blue-200 dark:hover:bg-blue-900 text-blue-900 dark:text-blue-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer sm:ml-auto"
            >
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Включить симулятор (продолжить варку)</span>
            </button>
          </div>
        </div>
      )}

      {/* Уведомление об успешной загрузке рецепта */}
      {successBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Панель быстрого выбора рецепта для загрузки на варку (адаптирована под мобильные экраны и светлую тему) */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-3.5 sm:p-4 border border-stone-200 dark:border-stone-800 flex flex-col gap-3 w-full max-w-full overflow-hidden min-w-0 shadow-xs">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0 w-full overflow-hidden">
          <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0 mt-0.5 sm:mt-0">
            <Flame className="w-4 h-4" />
          </span>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="text-[10px] sm:text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider truncate">
              Рецепт на блоке автоматики:
            </div>
            <div className="text-xs sm:text-base font-black text-stone-900 dark:text-white break-words leading-snug" title={`${recipe.name} (${recipe.style}) • ${recipe.batchSizeL} л`}>
              <span>{recipe.name}</span>{' '}
              <span className="font-semibold text-stone-500 dark:text-stone-400 text-[11px] sm:text-xs">
                ({recipe.style})
              </span>{' '}
              • <span className="text-amber-600 dark:text-amber-400 font-bold whitespace-nowrap">{recipe.batchSizeL} л</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full min-w-0 overflow-hidden">
          <div className="w-full sm:flex-1 min-w-0 overflow-hidden">
            <select
              value={recipe.id}
              onChange={(e) => {
                const selected = allRecipes.find(r => r.id === e.target.value);
                if (selected) {
                  onSelectRecipe(selected);
                  handleLoadRecipeIntoController(selected);
                }
              }}
              className="w-full max-w-full min-w-0 px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-hidden truncate block cursor-pointer"
            >
              {allRecipes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.batchSizeL} л)
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => handleLoadRecipeIntoController(recipe)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shrink-0"
            title="Заново перезагрузить этот рецепт в контроллер"
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
            <span>Загрузить на варку</span>
          </button>
        </div>
      </div>

      {/* ГЛАВНЫЙ ЭКРАН: Точная визуальная реплика контроллера Uniholic 3.0 с фото пользователя */}
      <div className="bg-gradient-to-b from-stone-400 via-stone-300 to-stone-400 dark:from-stone-800 dark:via-stone-700 dark:to-stone-800 p-2.5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 border-stone-500/40 relative w-full max-w-full overflow-hidden min-w-0">
        {/* 4 винта по углам корпуса как на реальном контроллере */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-stone-300 dark:bg-stone-600 border border-stone-500 shadow-inner flex items-center justify-center text-[9px] sm:text-[10px] text-stone-600 font-bold select-none">+</div>
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-stone-300 dark:bg-stone-600 border border-stone-500 shadow-inner flex items-center justify-center text-[9px] sm:text-[10px] text-stone-600 font-bold select-none">+</div>
        <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-stone-300 dark:bg-stone-600 border border-stone-500 shadow-inner flex items-center justify-center text-[9px] sm:text-[10px] text-stone-600 font-bold select-none">+</div>
        <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-stone-300 dark:bg-stone-600 border border-stone-500 shadow-inner flex items-center justify-center text-[9px] sm:text-[10px] text-stone-600 font-bold select-none">+</div>

        {/* Рамка экрана LCD с улучшенной эргономикой и высокой читаемостью */}
        <div className="bg-[#0b101b] p-2 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 border-stone-800/90 max-w-3xl mx-auto ring-1 ring-white/10 w-full min-w-0">
          <div className="flex flex-col gap-2.5 sm:gap-3.5 select-none font-sans w-full min-w-0">
            
            {/* 1. Верхний блок монитора: Дисплей показаний (слева) + Приводы ТЭН 1 и Насос (справа) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 w-full min-w-0">
              {/* Главный экран температуры и телеметрии (Занимает 2 колонки) */}
              <div className="md:col-span-2 bg-gradient-to-br from-[#07254a] via-[#0b3366] to-[#041a38] rounded-2xl p-3 sm:p-5 flex flex-col justify-between border-2 border-blue-500/40 shadow-inner relative overflow-hidden min-w-0">
                {/* Фоновая технологическая сетка */}
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Верхняя строка статуса */}
                <div className="flex items-center justify-between gap-1.5 sm:gap-2 border-b border-white/10 pb-2 sm:pb-2.5 z-10 min-w-0 w-full">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      telemetry.status === 'idle'
                        ? 'bg-stone-400'
                        : telemetry.status === 'paused'
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-emerald-400 animate-pulse'
                    }`} />
                    <span className="truncate font-black text-xs sm:text-sm text-cyan-200 uppercase tracking-wide min-w-0" title={telemetry.currentPauseName}>
                      {telemetry.currentPauseName}
                    </span>
                  </div>

                  <div className="px-2 py-1 rounded-lg bg-black/40 border border-amber-400/40 text-amber-300 text-[11px] sm:text-xs font-black shrink-0 flex items-center gap-1 shadow-xs">
                    <span className="text-[10px] text-amber-400/70">ЦЕЛЬ</span>
                    <span>{telemetry.targetTempC.toFixed(1)}°C</span>
                  </div>
                </div>

                {/* Центральная зона: Огромная текущая температура */}
                <div className="my-3 sm:my-6 flex flex-col items-center justify-center z-10">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-5xl sm:text-7xl font-black tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,100,255,0.4)]">
                      {telemetry.currentTempC.toFixed(1)}
                    </span>
                    <span className="text-2xl sm:text-4xl font-bold text-cyan-300">
                      °C
                    </span>
                  </div>

                  {/* Индикатор динамики нагрева */}
                  <div className="text-[11px] font-bold mt-1 text-blue-200/90 flex items-center gap-1.5">
                    {telemetry.heaterActive ? (
                      <span className="text-rose-300 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 animate-bounce" /> Нагрев сусла (+0.4°C/с)
                      </span>
                    ) : telemetry.status === 'mashing' || telemetry.status === 'boiling' ? (
                      <span className="text-amber-300">● Поддержание температуры</span>
                    ) : (
                      <span className="text-stone-300">Ожидание команды</span>
                    )}
                  </div>
                </div>

                {/* Нижняя строка: Крупный таймер паузы и мощность ТЭНа */}
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 bg-black/40 p-2 sm:p-2.5 rounded-xl border border-white/10 z-10 text-xs font-mono w-full min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-cyan-300 font-bold min-w-0">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-cyan-400" />
                    <div className="min-w-0">
                      <div className="text-[9px] sm:text-[10px] text-cyan-400/70 font-sans font-semibold uppercase truncate">Осталось:</div>
                      <div className="text-xs sm:text-sm font-black truncate">{formatTime(telemetry.pauseRemainingSeconds)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 sm:gap-2 text-amber-300 font-bold text-right min-w-0">
                    <div className="min-w-0">
                      <div className="text-[9px] sm:text-[10px] text-amber-400/70 font-sans font-semibold uppercase truncate">Мощность ТЭНа:</div>
                      <div className="text-xs sm:text-sm font-black truncate">
                        {telemetry.heaterPwmPercent}% ({Math.round((settings.heaterPowerWatt * telemetry.heaterPwmPercent) / 100)} Вт)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Правая панель приводов: ТЭН 1 (верхняя кнопка) и Насос (нижняя кнопка) */}
              <div className="flex flex-row md:flex-col gap-2 sm:gap-2.5 w-full min-w-0">
                {/* Верхняя кнопка: ТЭН 1 */}
                <button
                  type="button"
                  onClick={handleToggleHeater}
                  className={`flex-1 rounded-2xl border-2 p-2.5 sm:p-3 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group select-none min-w-0 ${
                    telemetry.heaterActive
                      ? 'bg-gradient-to-br from-red-600 via-rose-600 to-red-700 border-red-300 text-white shadow-xl shadow-red-600/50 scale-[1.02]'
                      : 'bg-[#091e38] hover:bg-[#0e2a4e] border-blue-500/30 text-blue-200'
                  }`}
                  title="Верхняя кнопка блока: переключить ТЭН 1"
                >
                  <div className="flex items-center justify-between w-full min-w-0">
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider truncate">
                      ТЭН 1
                    </span>
                    <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                      telemetry.heaterActive
                        ? 'bg-white text-red-700 font-black'
                        : 'bg-black/30 text-blue-300'
                    }`}>
                      {telemetry.heaterActive ? 'ВКЛ' : 'ВЫКЛ'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 my-1.5 sm:my-2 min-w-0">
                    <div className={`p-1.5 sm:p-2.5 rounded-xl border shrink-0 ${
                      telemetry.heaterActive
                        ? 'bg-red-700 border-red-400 animate-pulse text-white'
                        : 'bg-black/30 border-blue-400/20 text-blue-300'
                    }`}>
                      <Flame className="w-5 h-5 sm:w-8 sm:h-8" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <div className="text-xs sm:text-base font-black truncate">
                        {telemetry.heaterActive ? 'НАГРЕВ' : 'ОТКЛЮЧЕН'}
                      </div>
                      <div className="text-[10px] sm:text-[11px] opacity-80 font-bold truncate">
                        {telemetry.heaterActive ? `${telemetry.heaterPwmPercent}% • ${Math.round((settings.heaterPowerWatt * telemetry.heaterPwmPercent) / 100)} Вт` : '0 Вт'}
                      </div>
                    </div>
                  </div>

                  <div className="text-[9px] sm:text-[10px] opacity-70 text-left font-medium truncate">
                    Ручное переключение
                  </div>
                </button>

                {/* Нижняя кнопка: НАСОС */}
                <button
                  type="button"
                  onClick={handleTogglePump}
                  className={`flex-1 rounded-2xl border-2 p-2.5 sm:p-3 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group select-none min-w-0 ${
                    telemetry.pumpActive
                      ? 'bg-gradient-to-br from-cyan-600 via-teal-600 to-blue-700 border-cyan-300 text-white shadow-xl shadow-cyan-600/50 scale-[1.02]'
                      : 'bg-[#091e38] hover:bg-[#0e2a4e] border-blue-500/30 text-blue-200'
                  }`}
                  title="Нижняя кнопка блока: переключить Насос циркуляции"
                >
                  <div className="flex items-center justify-between w-full min-w-0">
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider truncate">
                      НАСОС
                    </span>
                    <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                      telemetry.pumpActive
                        ? 'bg-white text-cyan-800 font-black'
                        : 'bg-black/30 text-blue-300'
                    }`}>
                      {telemetry.pumpActive ? 'РАБОТАЕТ' : 'ВЫКЛ'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 my-1.5 sm:my-2 min-w-0">
                    <div className={`p-1.5 sm:p-2.5 rounded-xl border shrink-0 ${
                      telemetry.pumpActive
                        ? 'bg-cyan-700 border-cyan-400 text-white'
                        : 'bg-black/30 border-blue-400/20 text-blue-300'
                    }`}>
                      <RotateCcw className={`w-5 h-5 sm:w-8 sm:h-8 ${telemetry.pumpActive ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <div className="text-xs sm:text-base font-black truncate">
                        {telemetry.pumpActive ? 'ЦИРКУЛЯЦИЯ' : 'ОСТАНОВЛЕН'}
                      </div>
                      <div className="text-[10px] sm:text-[11px] opacity-80 font-bold truncate">
                        {telemetry.pumpActive ? `${settings.pumpWorkMinutes}/${settings.pumpRestMinutes} мин` : 'Помпа выкл'}
                      </div>
                    </div>
                  </div>

                  <div className="text-[9px] sm:text-[10px] opacity-70 text-left font-medium truncate">
                    Переключение помпы
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Нижняя панель действий монитора: Четкие, удобные, контрастные кнопки с читаемым текстом */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-1 border-t border-blue-900/60 w-full min-w-0">
              {/* Главная кнопка: Старт / Пауза */}
              <button
                type="button"
                onClick={telemetry.status === 'idle' || telemetry.status === 'paused' ? handleStartBrew : handlePauseBrew}
                className={`py-2.5 sm:py-3 px-2 sm:px-3.5 rounded-xl border flex items-center justify-center gap-1.5 sm:gap-2 font-black text-xs sm:text-sm transition-transform active:scale-95 cursor-pointer shadow-md min-w-0 truncate ${
                  telemetry.status === 'idle' || telemetry.status === 'paused'
                    ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white shadow-emerald-700/40'
                    : 'bg-amber-600 hover:bg-amber-500 border-amber-400 text-white shadow-amber-700/40'
                }`}
                title={telemetry.status === 'idle' || telemetry.status === 'paused' ? 'Запуск варки' : 'Пауза процесса'}
              >
                {telemetry.status === 'idle' || telemetry.status === 'paused' ? (
                  <>
                    <Play className="w-5 h-5 fill-white shrink-0" />
                    <span>СТАРТ ВАРКИ</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-5 h-5 fill-white shrink-0" />
                    <span>ПАУЗА</span>
                  </>
                )}
              </button>

              {/* Кнопка 2: Настройки пивоварни */}
              <button
                type="button"
                onClick={() => setSettingsModalOpen(true)}
                className="py-2.5 sm:py-3 px-1.5 sm:px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 border border-amber-300 transition-transform active:scale-95 cursor-pointer shadow-md shadow-amber-500/20 min-w-0 truncate"
                title="Параметры ТЭНа, датчиков и ПИД"
              >
                <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-stone-950" />
                <span className="truncate">НАСТРОЙКИ</span>
              </button>

              {/* Кнопка 3: Wi-Fi и статус подключения */}
              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                className={`py-2.5 sm:py-3 px-1.5 sm:px-3 rounded-xl text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 border transition-all active:scale-95 cursor-pointer shadow-md min-w-0 truncate ${
                  device.connectionStatus === 'connected'
                    ? 'bg-emerald-700 hover:bg-emerald-600 border-emerald-400/50 shadow-emerald-700/30'
                    : device.connectionStatus === 'failed'
                    ? 'bg-rose-700 hover:bg-rose-600 border-rose-400 shadow-rose-700/40 animate-pulse'
                    : 'bg-blue-700 hover:bg-blue-600 border-blue-400/40 shadow-blue-700/30'
                }`}
                title={
                  device.connectionStatus === 'connected'
                    ? `Wi-Fi подключен к ${device.activeIp} (${device.lastPingMs || 14} мс)`
                    : device.connectionStatus === 'failed'
                    ? `Сбой связи с ${device.activeIp} — нажмите для устранения`
                    : 'Связь с физическим блоком по Wi-Fi'
                }
              >
                {device.connectionStatus === 'failed' ? (
                  <WifiOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-rose-200" />
                ) : (
                  <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-cyan-200" />
                )}
                <span className="truncate">
                  {device.connectionStatus === 'connected'
                    ? 'WI-FI: ОК'
                    : device.connectionStatus === 'failed'
                    ? 'WI-FI: СБОЙ'
                    : 'WI-FI'}
                </span>
                {device.connectionStatus === 'connected' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5 shrink-0" />
                )}
              </button>

              {/* Кнопка 4: Сброс / Стоп варки */}
              <button
                type="button"
                onClick={handleStopBrew}
                className="py-2.5 sm:py-3 px-1.5 sm:px-3 rounded-xl bg-red-950/80 hover:bg-red-800 text-red-200 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 border border-red-500/40 transition-transform active:scale-95 cursor-pointer shadow-md min-w-0 truncate"
                title="Остановить варочный процесс и сбросить таймеры"
              >
                <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">СТОП</span>
              </button>
            </div>
          </div>
        </div>

        {/* Индикатор статуса процесса под дисплеем */}
        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-stone-700 dark:text-stone-300 font-bold px-2">
          <div className="flex items-center gap-2">
            <span>Статус варки:</span>
            <span className="px-2 py-0.5 rounded-lg bg-black/10 dark:bg-black/30 font-black text-blue-800 dark:text-blue-300">
              {telemetry.status === 'idle' && 'Ожидание запуска'}
              {telemetry.status === 'heating_strike' && 'Нагрев до засыпи солода...'}
              {telemetry.status === 'wait_malt_add' && '⚠️ Требуется засыпь солода!'}
              {telemetry.status === 'mashing' && 'Идут паузы затирания...'}
              {telemetry.status === 'mash_out' && 'Мэшаут (78°C)'}
              {telemetry.status === 'wait_sparge' && 'Фильтрация и промывка'}
              {telemetry.status === 'heating_boil' && 'Нагрев до кипения...'}
              {telemetry.status === 'boiling' && 'Кипячение и внесение хмелей'}
              {telemetry.status === 'whirlpool' && 'Вирпул и охлаждение'}
              {telemetry.status === 'finished' && '🎉 Варка завершена!'}
              {telemetry.status === 'paused' && 'Пауза'}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            {telemetry.status !== 'idle' && (
              <button
                type="button"
                onClick={handleSkipToNextStage}
                className="px-2.5 py-1 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold flex items-center gap-1 hover:opacity-90 cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>След. пауза</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSettings(s => ({ ...s, soundAlerts: !s.soundAlerts }));
              }}
              className="p-1 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300"
              title={settings.soundAlerts ? 'Звук включен' : 'Звук выключен'}
            >
              {settings.soundAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Звуковое всплывающее оповещение: Засыпь солода */}
      {showMaltAlert && (
        <div className="p-4 rounded-3xl bg-amber-500 text-stone-950 font-bold shadow-xl border-2 border-amber-300 flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 shrink-0" />
            <div>
              <div className="text-base font-black">Вода нагрета! Пора засыпать солод!</div>
              <div className="text-xs opacity-90">Засыпьте зерно в корзину/заторный чан, тщательно перемешайте и нажмите «Продолжить варку».</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleStartBrew}
            className="px-4 py-2 rounded-xl bg-stone-950 text-white font-black text-xs hover:bg-stone-900 shrink-0 cursor-pointer"
          >
            Солод засыпан ▶
          </button>
        </div>
      )}

      {/* Оповещение о внесении хмеля */}
      {activeHopAlert && (
        <div className="p-4 rounded-3xl bg-emerald-600 text-white font-bold shadow-xl border-2 border-emerald-400 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 shrink-0 animate-wiggle" />
            <div>
              <div className="text-base font-black">Время внесения хмеля!</div>
              <div className="text-xs text-emerald-100">
                Внесите <b>{activeHopAlert.name}</b> — <b>{activeHopAlert.weightG} г</b> ({activeHopAlert.timeRemainingMin} мин до конца кипения).
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setHopTimers(timers =>
                timers.map(h => (h.id === activeHopAlert.id ? { ...h, isAdded: true } : h))
              );
              setActiveHopAlert(null);
            }}
            className="px-4 py-2 rounded-xl bg-white text-emerald-950 font-black text-xs hover:bg-emerald-50 shrink-0 cursor-pointer"
          >
            Хмель внесен ✓
          </button>
        </div>
      )}

      {/* Список температурных пауз и график процесса */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка: Профиль температурных пауз (2/3) */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 shadow-md border border-stone-200 dark:border-stone-800 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base sm:text-lg font-black text-stone-950 dark:text-white">
                Программа варки и паузы затирания
              </h3>
            </div>
            <span className="text-xs text-stone-500 font-semibold">
              {pauses.length} этапов
            </span>
          </div>

          <div className="space-y-2.5">
            {pauses.map((p, idx) => {
              const isActive = telemetry.currentPauseIndex === idx && telemetry.status !== 'idle' && telemetry.status !== 'finished';
              const isPast = telemetry.currentPauseIndex > idx || telemetry.status === 'finished';

              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-sm'
                      : isPast
                      ? 'bg-stone-50/70 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 opacity-70'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white animate-pulse'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                    }`}>
                      {isPast ? '✓' : idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-2">
                        <span>Насос: {p.pumpEnabled ? 'ВКЛ 🔄' : 'ВЫКЛ ⏸'}</span>
                        {isActive && (
                          <span className="text-blue-600 dark:text-blue-400 font-black">
                            • Осталось {formatTime(telemetry.pauseRemainingSeconds)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400">
                        {p.targetTempC}°C
                      </div>
                      <div className="text-[11px] text-stone-500 font-semibold">
                        {p.durationMin > 0 ? `${p.durationMin} мин` : 'До нагрева'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Правая колонка: Охмеление и таймеры добавок (1/3) */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 shadow-md border border-stone-200 dark:border-stone-800 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base sm:text-lg font-black text-stone-950 dark:text-white">
                Таймеры охмеления
              </h3>
            </div>
            <span className="text-xs text-stone-500 font-semibold">
              Кипячение {recipe.boilTimeMin} мин
            </span>
          </div>

          {hopTimers.length === 0 ? (
            <div className="p-6 text-center text-xs text-stone-500">
              В рецепте нет хмелей с кипячением
            </div>
          ) : (
            <div className="space-y-2.5">
              {hopTimers.map(h => (
                <div
                  key={h.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 ${
                    h.isAdded
                      ? 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 opacity-60'
                      : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                      {h.name}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {h.weightG} г • альфа {h.alphaAcid}%
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-xs font-black">
                      {h.timeRemainingMin} мин
                    </span>
                    <div className="text-[10px] text-stone-400 mt-0.5">
                      {h.isAdded ? 'Внесен ✓' : 'Ждет времени'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Памятка по оборудованию пивовара */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 space-y-1.5">
            <div className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-blue-500" />
              <span>Параметры котла:</span>
            </div>
            <div>• ТЭН: {settings.heaterPowerWatt} Вт (кип: {settings.boilPowerPercent}%)</div>
            <div>• Насос: {settings.pumpWorkMinutes} мин качает / {settings.pumpRestMinutes} мин пауза</div>
            <div>• Защита от перегрева: включена</div>
          </div>
        </div>
      </div>

      {/* Аппаратный BLE мост: Цифровой ареометр (Tilt / iSpindel) и системные службы */}
      <BleHydrometerWidget />

      {/* МОДАЛЬНОЕ ОКНО: Настройки пивоварни Uniholic 3.0 */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-stone-900 dark:text-white">
                    Параметры пивоварни Uniholic 3.0
                  </h3>
                  <p className="text-[11px] text-stone-500">Технические настройки ТЭНа, насоса и ПИД</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettingsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  IP адрес подключения к блоку:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={device.activeIp}
                    onChange={(e) => setDevice({ ...device, activeIp: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-sm"
                    placeholder="192.168.4.1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setDevice({ ...device, activeIp: '192.168.4.1' });
                    }}
                    className="px-3 py-2 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold"
                  >
                    Сброс (AP)
                  </button>
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  По умолчанию в режиме точки доступа контроллера: <b>192.168.4.1</b>. Если подключен к домашнему роутеру, укажите IP STA.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Мощность ТЭНа (Вт):
                  </label>
                  <input
                    type="number"
                    value={settings.heaterPowerWatt}
                    onChange={(e) => setSettings({ ...settings, heaterPowerWatt: Number(e.target.value) || 3000 })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Мощность кипения (%):
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="100"
                    value={settings.boilPowerPercent}
                    onChange={(e) => setSettings({ ...settings, boilPowerPercent: Number(e.target.value) || 85 })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Работа насоса (мин):
                  </label>
                  <input
                    type="number"
                    value={settings.pumpWorkMinutes}
                    onChange={(e) => setSettings({ ...settings, pumpWorkMinutes: Number(e.target.value) || 15 })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Пауза насоса (мин):
                  </label>
                  <input
                    type="number"
                    value={settings.pumpRestMinutes}
                    onChange={(e) => setSettings({ ...settings, pumpRestMinutes: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Калибровка датчика DS18B20 (°C):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.tempSensorOffsetC}
                  onChange={(e) => setSettings({ ...settings, tempSensorOffsetC: parseFloat(e.target.value) || 0.0 })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSettingsModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs cursor-pointer shadow-sm"
                >
                  Применить параметры
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО: Связь с блоком Uniholic, Wi-Fi и диагностика */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4 my-8 animate-fade-in">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-stone-900 dark:text-white">
                    Связь с пивоварней Uniholic 3.0
                  </h3>
                  <p className="text-[11px] text-stone-500">Wi-Fi подключение, проверка пинга и параметры</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Карточка текущего статуса подключения */}
            <div className={`p-4 rounded-2xl border ${
              device.connectionStatus === 'connected'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                : device.connectionStatus === 'connecting' || isTestingConnection
                ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700'
                : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl text-white shrink-0 ${
                    device.connectionStatus === 'connected'
                      ? 'bg-emerald-600'
                      : device.connectionStatus === 'connecting' || isTestingConnection
                      ? 'bg-amber-600'
                      : 'bg-rose-600'
                  }`}>
                    {device.connectionStatus === 'connected' ? (
                      <Wifi className="w-5 h-5 animate-pulse" />
                    ) : device.connectionStatus === 'connecting' || isTestingConnection ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <WifiOff className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-black text-sm text-stone-900 dark:text-white flex items-center gap-2">
                      <span>
                        {device.connectionStatus === 'connected'
                          ? 'Связь с блоком активна'
                          : device.connectionStatus === 'connecting' || isTestingConnection
                          ? 'Проверка соединения...'
                          : 'Сбой подключения по Wi-Fi'}
                      </span>
                      {device.connectionStatus === 'connected' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-mono font-bold">
                          {device.lastPingMs || 14} мс
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                      {device.connectionStatus === 'connected'
                        ? `Успешный отклик от http://${device.activeIp}. Данные телеметрии и рецепта синхронизируются.`
                        : device.lastErrorMessage || `Нет ответа от ${device.activeIp}. Проверьте подключение смартфона к Wi-Fi сети «Uniholic».`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isTestingConnection}
                  onClick={() => handleCheckConnection(device.activeIp, device.connectionMode, true)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-800 dark:text-stone-200 shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Выполнить пинг прямо сейчас"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin' : ''}`} />
                  <span>{isTestingConnection ? 'Проверка...' : 'Пинг'}</span>
                </button>
              </div>

              {device.connectionStatus === 'failed' && (
                <div className="mt-3 pt-3 border-t border-rose-200 dark:border-rose-800/80 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                    Возникли проблемы с подключением?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setQrModalOpen(false);
                      setTroubleshootModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Устранить неисправность ➔</span>
                  </button>
                </div>
              )}
            </div>

            {/* Выбор режима работы */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-stone-700 dark:text-stone-300 block">
                Режим работы приложения:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDevice(prev => ({ ...prev, connectionMode: 'real' }));
                    handleCheckConnection(device.activeIp, 'real', true);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    device.connectionMode === 'real'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-950 dark:text-blue-100 ring-2 ring-blue-500/20'
                      : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 opacity-75'
                  }`}
                >
                  <Radio className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-black text-xs">Реальный блок по Wi-Fi</div>
                    <div className="text-[11px] opacity-75 mt-0.5">Связь с физическим ESP блоком Uniholic 3.0</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDevice(prev => ({
                      ...prev,
                      connectionMode: 'simulator',
                      isConnected: true,
                      connectionStatus: 'connected'
                    }));
                    setWifiErrorBanner(null);
                    playControllerBeep(1600, 0.1, 1);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    device.connectionMode === 'simulator'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-950 dark:text-blue-100 ring-2 ring-blue-500/20'
                      : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 opacity-75'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-black text-xs">Интерактивный симулятор</div>
                    <div className="text-[11px] opacity-75 mt-0.5">Тестирование варки без физического контроллера</div>
                  </div>
                </button>
              </div>
            </div>

            {/* IP-адрес блока */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-stone-700 dark:text-stone-300 block">
                IP адрес контроллера Uniholic:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={device.activeIp}
                  onChange={(e) => setDevice({ ...device, activeIp: e.target.value })}
                  placeholder="192.168.4.1"
                  className="flex-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setDevice(prev => ({ ...prev, activeIp: '192.168.4.1' }));
                    handleCheckConnection('192.168.4.1', device.connectionMode, true);
                  }}
                  className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-bold border border-stone-200 dark:border-stone-700 cursor-pointer"
                  title="Сбросить на стандартный 192.168.4.1"
                >
                  Сброс (192.168.4.1)
                </button>
              </div>
              <p className="text-[11px] text-stone-400">
                Заводской адрес точки доступа: <b>192.168.4.1</b>. Если блок подключен к домашнему роутеру, укажите локальный STA IP (например, 192.168.1.55).
              </p>
            </div>

            {/* Инструкция подключения */}
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 space-y-2">
              <div className="font-bold text-stone-900 dark:text-white flex items-center justify-between">
                <span>Инструкция подключения:</span>
                <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400">SSID: Uniholic</span>
              </div>
              <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                <li>Включите блок управления Uniholic 3.0 в сеть 220В.</li>
                <li>На телефоне откройте Wi-Fi и выберите сеть <b>Uniholic</b>.</li>
                <li><b>Внимание на Android:</b> при вопросе «Сеть без доступа в интернет» обязательно нажмите <b>«Оставаться подключенным»</b>!</li>
                <li>Откройте приложение — связь установится автоматически по <b>http://192.168.4.1</b>.</li>
              </ol>
            </div>

            {/* Кнопки действий */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setQrModalOpen(false);
                  setTroubleshootModalOpen(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-rose-500" />
                <span>Устранение неполадок</span>
              </button>

              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-black text-xs cursor-pointer"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО: Мастер устранения неполадок Wi-Fi подключения к пивоварне */}
      {troubleshootModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5 my-8 animate-fade-in">
            {/* Хедер модалки сбоя */}
            <div className="flex justify-between items-start border-b border-stone-100 dark:border-stone-800 pb-3.5">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-600/30 shrink-0">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-stone-950 dark:text-white flex items-center gap-2">
                    <span>Устранение неполадок подключения по Wi-Fi</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Пошаговые способы восстановления связи с блоком Uniholic 3.0
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTroubleshootModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Карточка текущей ошибки */}
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700/80 text-xs text-rose-950 dark:text-rose-100 space-y-1.5">
              <div className="font-black text-rose-800 dark:text-rose-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Диагностика сбоя:</span>
              </div>
              <p className="leading-relaxed font-medium">
                {device.lastErrorMessage || `Нет сетевого отклика от блока по адресу http://${device.activeIp}.`}
              </p>
              <div className="text-[11px] text-rose-700 dark:text-rose-300 flex items-center gap-3 pt-1">
                <span>Целевой IP: <b className="font-mono">{device.activeIp}</b></span>
                <span>•</span>
                <span>Статус: <b>{device.connectionStatus === 'failed' ? 'Нет связи' : device.connectionStatus}</b></span>
              </div>
            </div>

            {/* 5 пошаговых способов решения проблемы */}
            <div className="space-y-3 text-xs">
              <h4 className="font-black text-stone-900 dark:text-white uppercase tracking-wider text-[11px]">
                Пошаговый план устранения неисправности:
              </h4>

              {getUniholicTroubleshootGuide(device.failureReason, device.activeIp).map((step) => (
                <div
                  key={step.id}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 space-y-2.5 transition-colors hover:border-blue-400 dark:hover:border-blue-600"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {step.stepNumber}
                      </span>
                      <span className="font-bold text-stone-900 dark:text-white text-sm">
                        {step.title}
                      </span>
                    </div>
                    {step.badge && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                        {step.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-stone-600 dark:text-stone-300 text-xs leading-relaxed">
                    {step.shortDesc}
                  </p>

                  <ul className="space-y-1 pl-4 list-disc text-[11px] text-stone-500 dark:text-stone-400">
                    {step.details.map((detail, dIdx) => (
                      <li key={dIdx} className={detail.includes('⚠️') ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}>
                        {detail}
                      </li>
                    ))}
                  </ul>

                  {/* Интерактивное действие для этого шага */}
                  {step.actionType && (
                    <div className="pt-1.5 flex justify-end">
                      {step.actionType === 'retry' && (
                        <button
                          type="button"
                          disabled={isTestingConnection}
                          onClick={() => handleCheckConnection(device.activeIp, device.connectionMode, true)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin' : ''}`} />
                          <span>{isTestingConnection ? 'Проверка...' : 'Проверить связь'}</span>
                        </button>
                      )}

                      {step.actionType === 'reset_ip' && (
                        <button
                          type="button"
                          onClick={() => {
                            setDevice(prev => ({ ...prev, activeIp: '192.168.4.1' }));
                            handleCheckConnection('192.168.4.1', device.connectionMode, true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Сбросить IP на 192.168.4.1</span>
                        </button>
                      )}

                      {step.actionType === 'open_direct' && (
                        <a
                          href={`http://${device.activeIp || '192.168.4.1'}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-900 dark:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Открыть http://{device.activeIp || '192.168.4.1'} ↗</span>
                        </a>
                      )}

                      {step.actionType === 'switch_simulator' && (
                        <button
                          type="button"
                          onClick={() => {
                            setDevice(prev => ({
                              ...prev,
                              connectionMode: 'simulator',
                              isConnected: true,
                              connectionStatus: 'connected'
                            }));
                            setWifiErrorBanner(null);
                            setTroubleshootModalOpen(false);
                            playControllerBeep(1600, 0.1, 1);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Включить симулятор (продолжить варку)</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Нижняя панель действий */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                disabled={isTestingConnection}
                onClick={() => handleCheckConnection(device.activeIp, device.connectionMode, true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isTestingConnection ? 'animate-spin' : ''}`} />
                <span>{isTestingConnection ? 'Выполняется проверка...' : 'Повторить проверку связи'}</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setDevice(prev => ({
                      ...prev,
                      connectionMode: 'simulator',
                      isConnected: true,
                      connectionStatus: 'connected'
                    }));
                    setWifiErrorBanner(null);
                    setTroubleshootModalOpen(false);
                  }}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs cursor-pointer"
                >
                  В симулятор
                </button>

                <button
                  type="button"
                  onClick={() => setTroubleshootModalOpen(false)}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-black text-xs cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления/настройки пивоварни с модулем Wi-Fi */}
      <AddBreweryModal
        isOpen={addBreweryModalOpen}
        onClose={() => {
          setAddBreweryModalOpen(false);
          setEditingBrewery(null);
        }}
        onSaveBrewery={handleSaveUserBrewery}
        onDeleteBrewery={handleDeleteUserBrewery}
        editingBrewery={editingBrewery}
        existingBreweriesCount={userBreweries.length}
      />

      {/* Модальное окно пошагового подключения со смартфона */}
      <PhoneConnectionGuideModal
        isOpen={phoneGuideModalOpen}
        onClose={() => setPhoneGuideModalOpen(false)}
        brewery={activeBrewery}
      />
    </div>
  );
};
