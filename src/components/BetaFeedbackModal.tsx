import React, { useState } from 'react';
import {
  MessageSquarePlus,
  Bug,
  Lightbulb,
  Cpu,
  Wheat,
  Send,
  Copy,
  Check,
  Download,
  X,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Key,
  Sparkles
} from 'lucide-react';
import { submitBugReportDirectly } from '../services/telegramService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeBreweryName?: string;
  activeIp?: string;
}

type FeedbackCategory = 'bug' | 'feature' | 'brewery' | 'ingredients' | 'other';

export const BetaFeedbackModal: React.FC<Props> = ({
  isOpen,
  onClose,
  activeBreweryName,
  activeIp
}) => {
  const [category, setCategory] = useState<FeedbackCategory>('bug');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [testerContact, setTesterContact] = useState('');
  const [copied, setCopied] = useState(false);
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);

  // Состояние автоматической прямой отправки в канал
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ messageId?: number; channel?: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [botToken, setBotToken] = useState(() => {
    return localStorage.getItem('mastervarka_telegram_bot_token') || '';
  });
  const [showTokenSettings, setShowTokenSettings] = useState(false);

  if (!isOpen) return null;

  // Безопасная системная диагностика без персональных данных
  const getDiagnosticInfo = () => {
    const isMobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
    const os = /Android/i.test(navigator.userAgent)
      ? 'Android'
      : /iPhone|iPad/i.test(navigator.userAgent)
      ? 'iOS'
      : /Windows/i.test(navigator.userAgent)
      ? 'Windows'
      : /Macintosh/i.test(navigator.userAgent)
      ? 'macOS'
      : 'Linux';

    return {
      appVersion: 'v1.0.34 (Build 34)',
      screen: `${window.innerWidth}x${window.innerHeight} (dpr: ${window.devicePixelRatio || 1})`,
      os,
      isMobile,
      online: navigator.onLine ? 'Онлайн' : 'Офлайн',
      time: new Date().toLocaleString('ru-RU'),
      brewery: activeBreweryName ? `${activeBreweryName} (${activeIp || 'IP n/a'})` : 'Не выбрана'
    };
  };

  const diag = getDiagnosticInfo();

  const categoryLabels: Record<FeedbackCategory, { label: string; icon: string }> = {
    bug: { label: 'Ошибка / Баг', icon: '🐞' },
    feature: { label: 'Идея / Предложение', icon: '💡' },
    brewery: { label: 'Пивоварня & Wi-Fi', icon: '⚡' },
    ingredients: { label: 'Ингредиенты / Солода', icon: '🌾' },
    other: { label: 'Другое', icon: '💬' }
  };

  const generateReportText = () => {
    let report = `🍺 [МастерВарка Бета-Тест] ${categoryLabels[category].icon} ${categoryLabels[category].label}\n`;
    if (subject.trim()) report += `Тема: ${subject.trim()}\n`;
    report += `\nОписание:\n${description.trim() || 'Описание не заполнено'}\n`;

    if (testerContact.trim()) {
      report += `\nКонтакт тестера: ${testerContact.trim()}\n`;
    }

    if (includeDiagnostics) {
      report += `\n--- 📱 Диагностика устройства ---\n`;
      report += `Версия приложения: ${diag.appVersion}\n`;
      report += `ОС и устройство: ${diag.os} (${diag.isMobile ? 'Мобильное' : 'Десктоп'})\n`;
      report += `Разрешение экрана: ${diag.screen}\n`;
      report += `Сеть: ${diag.online}\n`;
      report += `Пивоварня: ${diag.brewery}\n`;
      report += `Время: ${diag.time}\n`;
    }

    report += `\n📢 Официальный канал багрепортов: https://t.me/mastervarka\n`;

    return report;
  };

  // Автоматическая прямая отправка в Telegram-канал без перехода
  const handleDirectSubmit = async () => {
    if (!description.trim() && !subject.trim()) {
      setSubmitError('Пожалуйста, заполните краткую тему или описание проблемы.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const res = await submitBugReportDirectly({
        botToken: botToken.trim() || undefined,
        category,
        subject: subject.trim(),
        description: description.trim(),
        testerContact: testerContact.trim() || undefined,
        diagnostics: includeDiagnostics ? diag : undefined,
        channelUsername: '@mastervarka'
      });

      if (res.success) {
        setSubmitSuccess(true);
        setSubmitResult({
          messageId: res.messageId,
          channel: res.channel || '@mastervarka'
        });
        if (botToken.trim()) {
          localStorage.setItem('mastervarka_telegram_bot_token', botToken.trim());
        }
      } else {
        if (res.needToken) {
          setShowTokenSettings(true);
        }
        setSubmitError(res.error || 'Не удалось отправить отчёт в Telegram');
      }
    } catch (e: any) {
      setSubmitError(e.message || 'Ошибка соединения с сервером');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    const text = generateReportText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendTelegram = () => {
    const text = generateReportText();
    // Автоматически копируем отчет в буфер перед переходом в канал, чтобы тестер мог сразу вставить его в комментарии или чат
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    const encoded = encodeURIComponent(text);
    // Открытие официального канала багрепортов МастерВарки
    window.open(`https://t.me/mastervarka`, '_blank');
  };

  const handleShareTelegram = () => {
    const text = generateReportText();
    const encoded = encodeURIComponent(text);
    window.open(`https://t.me/share/url?url=https://t.me/mastervarka&text=${encoded}`, '_blank');
  };

  const handleDownloadLog = () => {
    const text = generateReportText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `МастерВарка_багрепорт_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-5 sm:p-7 text-stone-900 dark:text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Шапка */}
        <div className="flex items-start justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700/60 shrink-0">
              <MessageSquarePlus className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300/40">
                  Обратная связь
                </span>
                <span className="text-[10px] font-mono text-stone-400">Бета v1.0.34</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white mt-0.5 leading-snug truncate">
                Сообщить об ошибке или идее
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Форма отчета */}
        <div className="space-y-3.5 text-xs">
          {/* Выбор категории */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1.5">
              Категория обращения:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {(Object.keys(categoryLabels) as FeedbackCategory[]).map((catKey) => {
                const info = categoryLabels[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                    }`}
                  >
                    <span>{info.icon}</span>
                    <span className="truncate">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Тема */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
              Краткая тема:
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Напр., Неверный расчет горечи IBU при хмеле на 0 мин"
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Подробное описание */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
              Подробное описание проблемы или предложения:
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите, что произошло, на каком экране или при каком действии. Чем подробнее, тем быстрее автор исправит проблему!"
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-3 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
            />
          </div>

          {/* Контакт тестера */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
              Ваш Telegram или Email для ответа (необязательно):
            </label>
            <input
              type="text"
              value={testerContact}
              onChange={(e) => setTesterContact(e.target.value)}
              placeholder="@username в Telegram или почта"
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Чекбокс включения технической диагностики */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeDiagnostics}
                onChange={(e) => setIncludeDiagnostics(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-amber-600 border-stone-300 focus:ring-amber-500"
              />
              <span className="font-bold text-stone-800 dark:text-stone-200 text-[11px]">
                Прикрепить системную диагностику устройства
              </span>
            </label>
            {includeDiagnostics && (
              <div className="text-[10px] text-stone-500 dark:text-stone-400 font-mono pl-5.5 space-y-0.5">
                <div>Версия: {diag.appVersion} • {diag.os} ({diag.screen})</div>
                <div>Пивоварня: {diag.brewery}</div>
              </div>
            )}
          </div>
        </div>

        {/* Уведомление об успешной автоматической отправке */}
        {submitSuccess ? (
          <div className="py-6 px-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-stone-900 dark:text-white">
                Багрепорт успешно опубликован! 🍺
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 max-w-sm mx-auto leading-relaxed">
                Ваш отчёт отправлен напрямую в официальный канал <b>@mastervarka</b>{submitResult?.messageId ? ` (сообщение #${submitResult.messageId})` : ''}. Разработчики уже получили уведомление.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center max-w-xs mx-auto">
              <a
                href="https://t.me/mastervarka"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Открыть пост в канале ↗</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setSubject('');
                  setDescription('');
                  setSubmitSuccess(false);
                  setSubmitResult(null);
                  setSubmitError(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Отправить ещё
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Сообщение об ошибке отправки или отсутствии токена */}
            {submitError && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-stone-900 dark:text-stone-100 text-xs space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="font-bold text-[11px] leading-tight text-amber-950 dark:text-amber-200">{submitError}</div>
                    <p className="text-[10px] text-stone-600 dark:text-stone-400">
                      Вы можете отправить отчёт прямо сейчас в Telegram-канал в один клик:
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href="https://t.me/mastervarka"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      navigator.clipboard?.writeText(generateReportText());
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Скопировать и открыть @mastervarka ↗</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowTokenSettings(!showTokenSettings)}
                    className="py-2 px-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-semibold cursor-pointer shrink-0"
                    title="Настройка для разработчика"
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            )}

            {/* Настройка токена Telegram бота (для прямой публикации) */}
            {showTokenSettings && (
              <div className="p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950 dark:text-amber-200 text-[11px]">
                    <Key className="w-3.5 h-3.5 text-amber-600" />
                    <span>Токен Telegram-бота для автопубликации:</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTokenSettings(false)}
                    className="text-stone-400 hover:text-stone-600 text-[10px] font-bold"
                  >
                    Закрыть
                  </button>
                </div>
                <p className="text-[10px] text-stone-600 dark:text-stone-400 leading-relaxed">
                  Создайте бота в <b>@BotFather</b> и добавьте его администратором в канал <a href="https://t.me/mastervarka" target="_blank" rel="noopener noreferrer" className="font-bold underline text-sky-600">@mastervarka</a> с правом отправки сообщений. Токен сохраняется локально.
                </p>
                <input
                  type="password"
                  value={botToken}
                  onChange={(e) => {
                    setBotToken(e.target.value);
                    localStorage.setItem('mastervarka_telegram_bot_token', e.target.value.trim());
                  }}
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz..."
                  className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-stone-900 dark:text-stone-100"
                />
              </div>
            )}

            {/* Прямая ссылка на официальный канал багрепортов */}
            <a
              href="https://t.me/mastervarka"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-gradient-to-r from-sky-500/10 to-blue-500/10 hover:from-sky-500/20 hover:to-blue-500/20 border border-sky-400/30 flex items-center justify-between text-sky-700 dark:text-sky-300 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Send className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-black leading-tight flex items-center gap-1.5 flex-wrap">
                    <span>Канал багрепортов и обновлений</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-800 dark:text-sky-200 font-mono font-bold">
                      https://t.me/mastervarka
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                    Официальный канал для отслеживания исправлений и обновлений
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold shrink-0 ml-2 text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                <span>Канал</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </a>

            {/* Кнопки действий */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2">
              {/* Главная кнопка: Прямая автоматическая отправка в канал без перехода */}
              <button
                type="button"
                onClick={handleDirectSubmit}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                title="Отправить багрепорт автоматически в канал @mastervarka без ручного перехода"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Отправка в @mastervarka...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>🚀 Отправить автоматически в канал @mastervarka</span>
                  </>
                )}
              </button>

              {/* Вспомогательные действия */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendTelegram}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-[11px] flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 cursor-pointer"
                  title="Скопировать отчет и открыть Telegram-канал вручную"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                  <span>Открыть канал ↗</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-[11px] flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 cursor-pointer shrink-0"
                  title="Скопировать готовый отчет в буфер обмена"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
                  <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadLog}
                  className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold text-xs flex items-center justify-center cursor-pointer border border-stone-200 dark:border-stone-700 shrink-0"
                  title="Сохранить файл отчета (.txt)"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowTokenSettings(!showTokenSettings)}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                    showTokenSettings
                      ? 'bg-amber-500 text-stone-950 border-amber-600'
                      : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                  }`}
                  title="Настройка токена Telegram-бота"
                >
                  <Key className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
