import React, { useState, useEffect } from 'react';
import {
  Download,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  X,
  FileCode,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import {
  CURRENT_APP_VERSION,
  CURRENT_BUILD_NUMBER,
  AppReleaseInfo,
  fetchLatestReleaseInfo,
  startApkDownload,
  getCurrentAppVersionInfo
} from '../services/appUpdateService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialReleaseInfo?: AppReleaseInfo | null;
}

export const AppUpdateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialReleaseInfo
}) => {
  const [releaseInfo, setReleaseInfo] = useState<AppReleaseInfo | null>(initialReleaseInfo || null);
  const [installedVersion, setInstalledVersion] = useState(CURRENT_APP_VERSION);
  const [installedBuildNumber, setInstalledBuildNumber] = useState(CURRENT_BUILD_NUMBER);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentAppVersionInfo().then(info => {
      setInstalledVersion(info.version);
      setInstalledBuildNumber(info.buildNumber);
    });
  }, []);

  const checkUpdates = async (force = true) => {
    setIsLoading(true);
    setError(null);
    try {
      const info = await fetchLatestReleaseInfo(force);
      if (info) {
        setReleaseInfo(info);
      } else {
        setError('Не удалось получить информацию о релизах. Проверьте интернет-соединение.');
      }
    } catch {
      setError('Ошибка при проверке обновлений.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setDownloadStarted(false);
      checkUpdates(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!releaseInfo) return;
    setDownloadStarted(true);
    startApkDownload(releaseInfo.apk.downloadUrl);
  };

  const handleCopyApkUrl = () => {
    if (!releaseInfo) return;
    navigator.clipboard?.writeText(releaseInfo.apk.downloadUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const hasUpdate = releaseInfo?.hasUpdate;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Заголовок модального окна */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-850/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
                Обновление «МастерВарка»
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                  Установлена: <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">v{installedVersion}</span> (сборка #{installedBuildNumber})
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Тело модального окна */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Статус проверки */}
          {isLoading && (
            <div className="p-8 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex flex-col items-center justify-center text-center gap-3">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300">
                Проверяем свежие релизы на GitHub...
              </p>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-start gap-3 text-xs sm:text-sm text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
                <button
                  type="button"
                  onClick={() => checkUpdates(true)}
                  className="mt-2 text-xs font-bold text-rose-700 dark:text-rose-300 underline hover:opacity-80 cursor-pointer"
                >
                  Попробовать снова
                </button>
              </div>
            </div>
          )}

          {/* Карточка обновления */}
          {releaseInfo && !isLoading && (
            <>
              {hasUpdate ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-500/40 dark:border-amber-500/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-black uppercase tracking-wider shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                      Новая версия доступна
                    </span>
                    <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                      {formatDate(releaseInfo.publishedAt)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-stone-900 dark:text-stone-100">
                      {releaseInfo.name}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                      Файл: <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{releaseInfo.apk.name}</span>
                      {releaseInfo.apk.sizeMb && <span> • ~{releaseInfo.apk.sizeMb} МБ</span>}
                    </p>
                  </div>

                  {/* Кнопка мгновенной загрузки */}
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-sm shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-5 h-5 animate-bounce" />
                    <span>Скачать и установить (.apk)</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-emerald-900 dark:text-emerald-200">
                      У вас установлена последняя версия!
                    </h4>
                    <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                      Приложение «МастерВарка» v{installedVersion} (сборка #{installedBuildNumber}) актуально. Все новые функции и исправления уже работают на вашем устройстве.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Скачать APK повторно</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => checkUpdates(true)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold border border-stone-200 dark:border-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Проверить снова</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Уведомление о старте скачивания */}
              {downloadStarted && (
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
                  <Smartphone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
                    <p className="font-bold">Загрузка запущена в шторке уведомлений Android!</p>
                    <p className="text-[11px] leading-relaxed text-blue-800/80 dark:text-blue-300/80">
                      Когда APK скачается, потяните шторку вниз и нажмите на файл. Система Android автоматически обновит «МастерВарка» поверх установленного приложения без потери ваших рецептов.
                    </p>
                  </div>
                </div>
              )}

              {/* Описание изменений (Changelog) */}
              {releaseInfo.body && (
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                      Что нового в этом выпуске:
                    </span>
                  </div>
                  <div className="text-xs text-stone-600 dark:text-stone-300 max-h-36 overflow-y-auto whitespace-pre-wrap font-sans leading-relaxed pr-1 no-scrollbar">
                    {releaseInfo.body}
                  </div>
                </div>
              )}

              {/* Гарантия совместимости и отсутствия конфликтов */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-stone-700 dark:text-stone-300 space-y-1">
                  <p className="font-bold text-stone-900 dark:text-stone-100">
                    Установка без удаления старой версии
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                    Все сборки теперь подписываются единым постоянным цифровым ключом (RSA-2048). Предыдущую версию больше не нужно удалять — обновление устанавливается гладко поверх старой, а все ваши авторские рецепты, журнал варок и склад сохраняются на 100%.
                  </p>
                </div>
              </div>

              {/* Дополнительные ссылки и действия */}
              <div className="pt-2 flex items-center justify-between text-xs text-stone-500 gap-2">
                <button
                  type="button"
                  onClick={handleCopyApkUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Ссылка скопирована' : 'Скопировать ссылку на APK'}</span>
                </button>

                <a
                  href={releaseInfo.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Релиз на GitHub</span>
                </a>
              </div>
            </>
          )}
        </div>

        {/* Футер */}
        <div className="p-3.5 sm:p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850/60 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => checkUpdates(true)}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Проверить сейчас</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
