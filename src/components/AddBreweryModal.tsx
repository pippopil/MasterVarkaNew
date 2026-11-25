/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Cpu,
  Wifi,
  Radio,
  Check,
  Activity,
  AlertTriangle,
  Flame,
  Info,
  Server,
  Smartphone,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { BreweryModelId, BreweryConnectionMode, UserBrewery } from '../types/breweryDevice';
import {
  RUSSIAN_MARKET_BREWERIES,
  getBreweryModelSpec,
  probeBreweryConnection
} from '../services/breweryModels';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveBrewery: (brewery: UserBrewery) => void;
  onDeleteBrewery?: (breweryId: string) => void;
  editingBrewery?: UserBrewery | null;
  existingBreweriesCount?: number;
}

export const AddBreweryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaveBrewery,
  onDeleteBrewery,
  editingBrewery,
  existingBreweriesCount = 1
}) => {
  const [selectedModelId, setSelectedModelId] = useState<BreweryModelId>('uniholic');
  const [name, setName] = useState('');
  const [connectionMode, setConnectionMode] = useState<BreweryConnectionMode>('simulator');
  const [ip, setIp] = useState('192.168.4.1');
  const [port, setPort] = useState(80);
  const [ssid, setSsid] = useState('Uniholic');
  const [heaterPowerWatt, setHeaterPowerWatt] = useState(3000);
  const [boilPowerPercent, setBoilPowerPercent] = useState(85);
  const [pumpWorkMinutes, setPumpWorkMinutes] = useState(14);
  const [pumpRestMinutes, setPumpRestMinutes] = useState(1);
  const [notes, setNotes] = useState('');

  // Состояние проверки пинга
  const [isProbing, setIsProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<{
    success: boolean;
    pingMs?: number;
    error?: string;
  } | null>(null);

  const selectedSpec = getBreweryModelSpec(selectedModelId);

  // Инициализация при открытии
  useEffect(() => {
    if (editingBrewery) {
      setSelectedModelId(editingBrewery.modelId);
      setName(editingBrewery.name);
      setConnectionMode(editingBrewery.connectionMode);
      setIp(editingBrewery.ip);
      setPort(editingBrewery.port);
      setSsid(editingBrewery.ssid || getBreweryModelSpec(editingBrewery.modelId).defaultSsid);
      setHeaterPowerWatt(editingBrewery.heaterPowerWatt);
      setBoilPowerPercent(editingBrewery.boilPowerPercent);
      setPumpWorkMinutes(editingBrewery.pumpWorkMinutes);
      setPumpRestMinutes(editingBrewery.pumpRestMinutes);
      setNotes(editingBrewery.notes || '');
    } else {
      const defaultSpec = getBreweryModelSpec('uniholic');
      setSelectedModelId('uniholic');
      setName('Моя пивоварня (Юнихолик)');
      setConnectionMode('simulator');
      setIp(defaultSpec.defaultIp);
      setPort(defaultSpec.defaultPort);
      setSsid(defaultSpec.defaultSsid);
      setHeaterPowerWatt(defaultSpec.defaultHeaterWatt);
      setBoilPowerPercent(defaultSpec.defaultBoilPowerPercent);
      setPumpWorkMinutes(14);
      setPumpRestMinutes(1);
      setNotes('');
    }
    setProbeResult(null);
  }, [editingBrewery, isOpen]);

  // При смене модели обновляем дефолтные параметры
  const handleModelChange = (modelId: BreweryModelId) => {
    setSelectedModelId(modelId);
    const spec = getBreweryModelSpec(modelId);

    if (!editingBrewery) {
      setName(`Пивоварня ${spec.shortName}`);
    }
    setIp(spec.defaultIp);
    setPort(spec.defaultPort);
    setSsid(spec.defaultSsid);
    setHeaterPowerWatt(spec.defaultHeaterWatt);
    setBoilPowerPercent(spec.defaultBoilPowerPercent);
    setProbeResult(null);
  };

  // Проверка связи
  const handleTestConnection = async () => {
    setIsProbing(true);
    setProbeResult(null);

    const testBrewery: UserBrewery = {
      id: editingBrewery?.id || 'temp',
      name,
      modelId: selectedModelId,
      connectionMode,
      ip,
      port,
      ssid,
      heaterPowerWatt,
      boilPowerPercent,
      pumpWorkMinutes,
      pumpRestMinutes,
      tempSensorOffsetC: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const res = await probeBreweryConnection(testBrewery);
    setIsProbing(false);
    setProbeResult({
      success: res.success,
      pingMs: res.pingMs,
      error: res.error
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const savedBrewery: UserBrewery = {
      id: editingBrewery?.id || `brewery_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      modelId: selectedModelId,
      connectionMode,
      ip: ip.trim(),
      port: Number(port) || 80,
      ssid: ssid.trim(),
      heaterPowerWatt: Number(heaterPowerWatt) || 3000,
      boilPowerPercent: Number(boilPowerPercent) || 85,
      pumpWorkMinutes: Number(pumpWorkMinutes) || 14,
      pumpRestMinutes: Number(pumpRestMinutes) || 1,
      tempSensorOffsetC: editingBrewery?.tempSensorOffsetC || 0,
      notes: notes.trim(),
      isDefault: editingBrewery?.isDefault || false,
      createdAt: editingBrewery?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveBrewery(savedBrewery);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Хедер модального окна */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 dark:text-white leading-tight">
                {editingBrewery ? 'Настройка пивоварни с Wi-Fi' : 'Добавить пивоварню с Wi-Fi'}
              </h2>
              <p className="text-xs text-stone-500">
                Поддержка всех моделей пивоварен и блоков управления на рынке РФ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-700/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Форма добавления */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* 1. Выбор модели пивоварни из каталога рынка РФ */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center justify-between">
              <span>1. Выберите модель пивоварни или блок автоматики:</span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                Рынок РФ ({RUSSIAN_MARKET_BREWERIES.length} моделей)
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {RUSSIAN_MARKET_BREWERIES.map(model => {
                const isSelected = selectedModelId === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => handleModelChange(model.id)}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/30'
                        : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                    <div>
                      <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block line-clamp-1">
                        {model.manufacturer}
                      </span>
                      <div className="font-extrabold text-xs text-stone-900 dark:text-white mt-0.5 leading-snug">
                        {model.shortName}
                      </div>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-stone-200/50 dark:border-stone-700/50 text-[10px] text-stone-500 font-mono">
                      {model.defaultIp}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Карточка с деталями выбранной модели */}
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800 flex items-start gap-3">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-stone-800 dark:text-stone-200">
                  {selectedSpec.name} — {selectedSpec.marketShareRu}
                </div>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-[11px]">
                  {selectedSpec.description}
                </p>
                <div className="flex flex-wrap gap-2 text-[10px] pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-700 font-mono">
                    Wi-Fi SSID: <b>{selectedSpec.phoneConnectionGuide.apSsid}</b>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-700 font-mono">
                    IP по умолч.: <b>{selectedSpec.defaultIp}:{selectedSpec.defaultPort}</b>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Название пивоварни */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
              Понятное название вашей пивоварни:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Моя Бавария 50л, EasyBrew на кухне, Котёл Юнихолик..."
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-sm font-bold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* 3. Режим подключения со смартфона */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
              Режим подключения со смартфона:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {
                  id: 'ap',
                  label: 'Точка доступа (AP)',
                  desc: 'Прямой Wi-Fi пивоварни (192.168.4.1)',
                  icon: Wifi
                },
                {
                  id: 'sta',
                  label: 'Домашняя сеть (STA)',
                  desc: 'Через домашний Wi-Fi роутер',
                  icon: Server
                },
                {
                  id: 'simulator',
                  label: 'Интерактивный симулятор',
                  desc: 'Безопасный тест без физ. котла',
                  icon: Radio
                }
              ].map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    const m = mode.id as BreweryConnectionMode;
                    setConnectionMode(m);
                    if (m === 'ap') {
                      setIp(selectedSpec.defaultIp);
                      setPort(selectedSpec.defaultPort);
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    connectionMode === mode.id
                      ? 'bg-amber-500/10 border-amber-500 text-stone-900 dark:text-white ring-1 ring-amber-500'
                      : 'bg-white dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <mode.icon className="w-3.5 h-3.5 text-amber-500" />
                    <span>{mode.label}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1 leading-snug">
                    {mode.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Сетевые настройки (IP, Порт, SSID) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400">
                IP-адрес / Хост:
              </label>
              <input
                type="text"
                required
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="192.168.4.1"
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-stone-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400">
                Порт (HTTP):
              </label>
              <input
                type="number"
                required
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                placeholder="80"
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-stone-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400">
                Имя сети Wi-Fi (SSID):
              </label>
              <input
                type="text"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                placeholder={selectedSpec.defaultSsid}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-900 dark:text-white"
              />
            </div>
          </div>

          {/* 5. Мощность ТЭНа и параметры насоса */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                <span>ТЭН (Вт):</span>
              </label>
              <input
                type="number"
                step="100"
                value={heaterPowerWatt}
                onChange={(e) => setHeaterPowerWatt(Number(e.target.value))}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-stone-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400">
                Кипение (%):
              </label>
              <input
                type="number"
                min="30"
                max="100"
                value={boilPowerPercent}
                onChange={(e) => setBoilPowerPercent(Number(e.target.value))}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-stone-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400">
                Насос вкл (мин):
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={pumpWorkMinutes}
                onChange={(e) => setPumpWorkMinutes(Number(e.target.value))}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-stone-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400">
                Пауза насоса (мин):
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={pumpRestMinutes}
                onChange={(e) => setPumpRestMinutes(Number(e.target.value))}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-stone-900 dark:text-white"
              />
            </div>
          </div>

          {/* Кнопка «Проверить связь» */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Проверка доступности блока по Wi-Fi</span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                Замер времени отклика (Ping) и проверка доступности порта контроллера
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isProbing}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                {isProbing ? 'Опрос...' : 'Проверить связь'}
              </button>
            </div>
          </div>

          {/* Результат проверки связи */}
          {probeResult && (
            <div
              className={`p-3 rounded-2xl border text-xs font-medium animate-in fade-in ${
                probeResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {probeResult.success ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Связь установлена успешно! Пинг: {probeResult.pingMs} мс</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Блок не ответил: {probeResult.error}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Заметки */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400">
              Заметки пивовара (опционально):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Например: Объем котла 45л, датчик DS18B20 в гильзе на сливе..."
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-900 dark:text-white"
            />
          </div>

          {/* Кнопка удаления для редактируемой пивоварни */}
          {editingBrewery && onDeleteBrewery && existingBreweriesCount > 1 && (
            <div className="pt-2 border-t border-red-200 dark:border-red-900/40 flex justify-between items-center">
              <span className="text-xs text-stone-500">Удалить эту пивоварню из списка?</span>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Удалить пивоварню «${editingBrewery.name}»?`)) {
                    onDeleteBrewery(editingBrewery.id);
                    onClose();
                  }
                }}
                className="px-3 py-1 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Удалить пивоварню</span>
              </button>
            </div>
          )}

          {/* Кнопки футера */}
          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer active:scale-95"
            >
              {editingBrewery ? 'Сохранить изменения' : '+ Добавить пивоварню'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
