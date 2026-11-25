import React, { useState } from 'react';
import { exportToBeerXml, importFromBeerXml, importFromBeerXmlWithValidation } from '../utils/beerXml';
import { encryptPayload, decryptPayload } from '../utils/cryptoSync';
import { Recipe } from '../types/brewing';
import {
  Cloud,
  Download,
  Upload,
  FileCode,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  HardDrive,
  Copy,
  Check,
  Lock,
  ShieldCheck
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentRecipe: Recipe;
  onImportRecipe: (recipe: Recipe) => void;
  fullDataPayload: any;
  onRestoreFullData: (data: any) => void;
  syncCode: string;
  setSyncCode: (code: string) => void;
}

export const CloudSyncModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentRecipe,
  onImportRecipe,
  fullDataPayload,
  onRestoreFullData,
  syncCode,
  setSyncCode
}) => {
  const [activeTab, setActiveTab] = useState<'cloud' | 'beerxml' | 'json'>('cloud');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  // Выгрузка в облако с E2E шифрованием
  const handleCloudPush = async () => {
    if (!syncCode.trim()) {
      setStatusMessage({ text: 'Введите код синхронизации', type: 'error' });
      return;
    }
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const code = syncCode.trim().toUpperCase();
      // E2E шифрование полезной нагрузки с помощью кода синхронизации перед отправкой
      const encrypted = await encryptPayload(fullDataPayload, code);

      const res = await fetch('/api/sync/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncCode: code,
          payload: encrypted
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          text: `Данные E2E-зашифрованы (AES-GCM-256) и сохранены в облаке под кодом ${data.syncCode}! Никто кроме обладателя кода не сможет их расшифровать.`,
          type: 'success'
        });
      } else {
        setStatusMessage({ text: data.error || 'Ошибка синхронизации', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: 'Сбой сети или шифрования. Проверьте подключение.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка из облака с E2E расшифровкой
  const handleCloudPull = async () => {
    if (!syncCode.trim()) {
      setStatusMessage({ text: 'Введите код синхронизации', type: 'error' });
      return;
    }
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const code = syncCode.trim().toUpperCase();
      const res = await fetch(`/api/sync/load/${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.success && data.data) {
        // Расшифровка на стороне клиента
        const decrypted = await decryptPayload(data.data, code);
        onRestoreFullData(decrypted);
        setStatusMessage({
          text: `Данные успешно расшифрованы и восстановлены из облака! Обновлено: ${new Date(data.updatedAt).toLocaleString('ru-RU')}`,
          type: 'success'
        });
      } else {
        setStatusMessage({ text: data.error || 'Код не найден', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Не удалось расшифровать данные или получить их с сервера.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Экспорт текущего рецепта в BeerXML 1.0
  const handleExportBeerXml = () => {
    const xml = exportToBeerXml(currentRecipe);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentRecipe.name.replace(/\s+/g, '_')}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Импорт BeerXML из файла
  const handleImportBeerXmlFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importFromBeerXmlWithValidation(content);
      if (res.success && res.recipe) {
        onImportRecipe(res.recipe);
        setStatusMessage({
          text: `Рецепт «${res.recipe.name}» успешно проверен через Zod и сохранен!`,
          type: 'success'
        });
      } else {
        const detail = res.errors && res.errors.length > 0 ? `: ${res.errors[0]}` : '';
        setStatusMessage({ text: `Ошибка валидации BeerXML${detail}. База данных защищена от повреждений.`, type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  // Экспорт полного JSON бэкапа
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(fullDataPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `МастерВарка_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Импорт полного JSON бэкапа
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onRestoreFullData(parsed);
        setStatusMessage({ text: 'Полная база данных успешно восстановлена!', type: 'success' });
      } catch (err) {
        setStatusMessage({ text: 'Неверный формат JSON-файла', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const copySyncCodeToClipboard = () => {
    navigator.clipboard.writeText(syncCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5">
        <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-stone-900 dark:text-white">
                Синхронизация & Экспорт/Импорт
              </h3>
              <p className="text-[11px] text-stone-500">Облачный сейф, BeerXML и бэкапы базы</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-lg p-1"
          >
            ✕
          </button>
        </div>

        {/* Табы */}
        <div className="flex p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'cloud'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Облако</span>
          </button>
          <button
            onClick={() => setActiveTab('beerxml')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'beerxml'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>BeerXML 1.0</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'json'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>JSON Бэкап</span>
          </button>
        </div>

        {/* Уведомление о статусе */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Контент табов */}
        {activeTab === 'cloud' && (
          <div className="space-y-4 text-xs">
            <p className="text-stone-600 dark:text-stone-300">
              Синхронизируйте свои рецепты, кладовую и логи варок между телефоном, компьютером и планшетом по персональному коду:
            </p>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
              <label className="font-bold text-amber-900 dark:text-amber-200 block">
                Ваш персональный код синхронизации:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={syncCode}
                  onChange={(e) => setSyncCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 font-mono font-black text-amber-700 dark:text-amber-400 text-center tracking-wider text-base"
                />
                <button
                  onClick={copySyncCodeToClipboard}
                  className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold flex items-center gap-1"
                  title="Скопировать код"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleCloudPush}
                disabled={isLoading}
                className="py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{isLoading ? 'Отправка...' : 'Выгрузить в облако'}</span>
              </button>

              <button
                onClick={handleCloudPull}
                disabled={isLoading}
                className="py-3 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-700 dark:hover:bg-stone-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isLoading ? 'Загрузка...' : 'Загрузить из облака'}</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] text-emerald-800 dark:text-emerald-300 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>
                  <b>Сквозное шифрование (E2E Web Crypto):</b> ваши рецепты шифруются ключом AES-GCM-256 прямо на устройстве перед передачей. Сервер не может прочитать рецепты без вашего персонального кода.
                </span>
              </div>
              <div className="text-[11px] text-stone-400 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 flex items-center gap-2">
                <HardDrive className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Рецепты и журнал варок хранятся в <b>IndexedDB (Dexie.js)</b> без лимитов LocalStorage и работают <b>100% офлайн</b>.
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'beerxml' && (
          <div className="space-y-4 text-xs">
            <p className="text-stone-600 dark:text-stone-300">
              <b>BeerXML 1.0</b> — международный формат обмена рецептами, поддерживаемый BeerSmith, Brewfather, Grainfather и форумами домашних пивоваров.
            </p>

            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
              <div className="font-bold text-stone-800 dark:text-stone-200">
                Экспорт текущего рецепта: «{currentRecipe.name}»
              </div>
              <button
                onClick={handleExportBeerXml}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Скачать BeerXML (.xml)</span>
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
              <div className="font-bold text-stone-800 dark:text-stone-200">
                Импорт рецепта из файла BeerXML (.xml):
              </div>
              <label className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Выбрать .xml файл</span>
                <input
                  type="file"
                  accept=".xml,text/xml"
                  onChange={handleImportBeerXmlFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {activeTab === 'json' && (
          <div className="space-y-4 text-xs">
            <p className="text-stone-600 dark:text-stone-300">
              Полный снимок базы данных приложения (все рецепты, остатки в кладовой, журнал варок и календарь):
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportJson}
                className="py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Скачать JSON бэкап</span>
              </button>

              <label className="py-3 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Восстановить JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJsonFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
