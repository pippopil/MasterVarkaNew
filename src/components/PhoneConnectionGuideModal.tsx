/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Wifi,
  AlertTriangle,
  CheckCircle2,
  Info,
  Radio,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { UserBrewery } from '../types/breweryDevice';
import { getBreweryModelSpec, RUSSIAN_MARKET_BREWERIES } from '../services/breweryModels';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  brewery: UserBrewery;
  onSwitchBrewery?: (breweryId: string) => void;
}

export const PhoneConnectionGuideModal: React.FC<Props> = ({
  isOpen,
  onClose,
  brewery
}) => {
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios'>('android');
  const spec = getBreweryModelSpec(brewery.modelId);
  const guide = spec.phoneConnectionGuide;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Хедер */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 dark:text-white leading-tight">
                Подключение со смартфона к «{brewery.name}»
              </h2>
              <p className="text-xs text-stone-500">
                Инструкция для модели {spec.name} ({spec.country})
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

        {/* Тело */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Сводка реквизитов подключения */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 dark:border-amber-800/80 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Реквизиты Wi-Fi контроллера
              </div>
              <div className="text-sm font-extrabold text-stone-900 dark:text-white mt-0.5">
                Сеть (SSID): <span className="font-mono text-amber-600 dark:text-amber-400">{guide.apSsid}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-bold text-stone-700 dark:text-stone-300">
                IP: {brewery.ip}:{brewery.port}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-white font-bold">
                {guide.apPassword ? `Пароль: ${guide.apPassword}` : 'Без пароля'}
              </span>
            </div>
          </div>

          {/* Переключатель платформы: Android / iPhone */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-stone-100 dark:bg-stone-800 w-fit">
            <button
              type="button"
              onClick={() => setActivePlatform('android')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activePlatform === 'android'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              🤖 Для Android (Samsung, Xiaomi, etc.)
            </button>
            <button
              type="button"
              onClick={() => setActivePlatform('ios')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activePlatform === 'ios'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              🍏 Для Apple iPhone (iOS)
            </button>
          </div>

          {/* Критическое предупреждение об удержании сети Wi-Fi */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Главная особенность управления со смартфона:</span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              Точка доступа пивоварни — это автономный контроллер локальной сети, у которого <b>нет выхода в интернет</b>.
              Смартфоны при подключении выдают предупреждение: «Сеть Wi-Fi без доступа в интернет».
            </p>
            <div className="pt-1 text-[11px] font-semibold text-stone-800 dark:text-stone-200">
              {activePlatform === 'android' ? (
                <ul className="list-disc list-inside space-y-1">
                  {guide.androidTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  {guide.iosTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Пошаговая инструкция */}
          <div className="space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Пошаговый процесс подключения:
            </div>

            <div className="space-y-2.5">
              {guide.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors ${
                    step.important
                      ? 'bg-amber-500/5 border-amber-300 dark:border-amber-800/80'
                      : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {step.stepNumber}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-extrabold text-stone-900 dark:text-white">
                      {step.title}
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      {step.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Способ прямого открытия в браузере */}
          <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-stone-800 dark:text-stone-200">
                Прямой доступ к веб-панели пивоварни:
              </div>
              <div className="text-[11px] text-stone-500">
                Вы также можете открыть оригинальный веб-интерфейс в браузере телефона
              </div>
            </div>
            <a
              href={`http://${brewery.ip}:${brewery.port}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 border border-stone-300 dark:border-stone-600 text-stone-900 dark:text-white font-bold inline-flex items-center gap-1.5 transition-colors shrink-0"
            >
              <span>Открыть http://{brewery.ip}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Футер */}
        <div className="px-5 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Понятно, закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
