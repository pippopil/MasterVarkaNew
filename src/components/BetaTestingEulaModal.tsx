import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  X,
  ExternalLink,
  Beer,
  Sparkles
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  isFirstLaunchPrompt?: boolean;
}

export const BetaTestingEulaModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAccept,
  isFirstLaunchPrompt = false
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    localStorage.setItem('mastervarka_beta_eula_accepted', 'true');
    localStorage.setItem('mastervarka_beta_eula_date', new Date().toISOString());
    if (onAccept) onAccept();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-5 sm:p-7 text-stone-900 dark:text-white shadow-2xl space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Шапка модального окна */}
        <div className="flex items-start justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700/60 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300/40">
                  Закрытый Бета-Тест
                </span>
                <span className="text-[10px] font-mono text-stone-400">v1.0.34</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white mt-0.5 leading-snug truncate">
                Условия тестирования и лицензия
              </h3>
            </div>
          </div>

          {!isFirstLaunchPrompt && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Информационный текст условий */}
        <div className="space-y-3 text-xs text-stone-600 dark:text-stone-300 max-h-72 sm:max-h-80 overflow-y-auto pr-1">
          <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5">
            <Beer className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <b className="text-amber-950 dark:text-amber-200">МастерВарка</b> — это авторский программный комплекс для крафтового домашнего пивоварения. Вы участвуете в программе закрытого тестирования для проверки стабильности расчетов и работы с пивоварнями.
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 space-y-1">
              <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 text-[11px]">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>1. Защита интеллектуальной собственности</span>
              </div>
              <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-400">
                Все права на исходный код, уникальные формулы баланса BU:GU, эквиваленты курских солодов, алгоритмы замены хмеля и дизайн интерфейса принадлежат правообладателю (All Rights Reserved © 2026).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 space-y-1">
              <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>2. Запрет на копирование и декомпиляцию</span>
              </div>
              <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-400">
                Категорически запрещено копировать, распространять, сдавать в аренду, декомпилировать или производить реверс-инжиниринг сборок (.apk, web-бандлов) и баз данных без согласия автора.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 space-y-1">
              <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>3. Конфиденциальность ваших рецептов</span>
              </div>
              <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-400">
                Все созданные вами рецепты, склад и записи журнала варок сохраняются в вашем браузере/телефоне (IndexedDB). Они не передаются третьим лицам.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 space-y-1">
              <div className="font-bold text-sky-950 dark:text-sky-200 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">📢</span>
                  <span>4. Канал багрепортов и обновлений</span>
                </div>
                <a
                  href="https://t.me/mastervarka"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                >
                  <span>@mastervarka</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-400">
                Все замечания, ошибки и обсуждения принимаются в официальном Telegram-канале: <a href="https://t.me/mastervarka" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer">https://t.me/mastervarka</a>.
              </p>
            </div>
          </div>
        </div>

        {/* Чекбокс подтверждения при первом входе */}
        {isFirstLaunchPrompt ? (
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-3">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-amber-600 border-stone-300 focus:ring-amber-500 cursor-pointer shrink-0"
              />
              <span className="text-stone-700 dark:text-stone-300 font-medium">
                Я подтверждаю участие в закрытом бета-тесте, принимаю условия авторской лицензии и обязуюсь не передавать сборку третьим лицам.
              </span>
            </label>

            <button
              type="button"
              disabled={!agreedToTerms}
              onClick={handleConfirm}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 active:scale-98 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Принять условия и начать тестирование</span>
            </button>
          </div>
        ) : (
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer transition-colors"
            >
              Понятно
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
