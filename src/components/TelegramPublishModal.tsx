import React, { useState, useEffect, useMemo } from 'react';
import { Recipe } from '../types/brewing';
import {
  Send,
  Bot,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Settings,
  X,
  FileText,
  Calendar,
  Tag,
  User,
  MessageSquare,
  Link2,
  Radio,
  ArrowRight,
  Info
} from 'lucide-react';
import {
  TelegramPostStyle,
  TelegramConfig,
  generateTelegramPost,
  getTelegramShareUrl,
  sendToTelegramBot,
  testTelegramBot,
  detectTelegramChats,
  DetectedTelegramChat,
  loadTelegramConfig,
  saveTelegramConfig,
  parseTelegramChannel
} from '../services/telegramService';

interface Props {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramPublishModal: React.FC<Props> = ({ recipe, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'share' | 'bot'>('share');
  const [config, setConfig] = useState<TelegramConfig>(loadTelegramConfig);
  const [channelInput, setChannelInput] = useState<string>(config.channelLink || config.chatId || '');
  const [style, setStyle] = useState<TelegramPostStyle>(config.defaultStyle || 'craft_release');
  const [includeHashtags, setIncludeHashtags] = useState<boolean>(config.includeHashtags);
  const [includeAuthorContact, setIncludeAuthorContact] = useState<boolean>(config.includeAuthorContact);
  const [authorContact, setAuthorContact] = useState<string>(config.authorContact || recipe.author || '');
  const [customNote, setCustomNote] = useState<string>('');
  const [readyDate, setReadyDate] = useState<string>('');
  const [brewDate, setBrewDate] = useState<string>(new Date().toLocaleDateString('ru-RU'));

  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; botUsername?: string } | null>(null);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string; chatTitle?: string } | null>(null);
  const [actionNotice, setActionNotice] = useState<{
    type: 'share' | 'open_channel' | 'copied';
    title: string;
    description: string;
    channelUrl?: string;
  } | null>(null);
  const [showBotHelp, setShowBotHelp] = useState(false);
  const [detectedChats, setDetectedChats] = useState<DetectedTelegramChat[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectStatus, setDetectStatus] = useState<string | null>(null);

  // Разбор введенной ссылки на канал
  const parsedChannel = useMemo(() => {
    return parseTelegramChannel(channelInput);
  }, [channelInput]);

  // Синхронизация сохранения настроек
  const updateConfig = (patch: Partial<TelegramConfig>) => {
    const next = { ...config, ...patch };
    setConfig(next);
    saveTelegramConfig(next);
  };

  // Обновление ссылки на канал
  const handleChannelInputChange = (val: string) => {
    setChannelInput(val);
    const parsed = parseTelegramChannel(val);
    updateConfig({
      channelLink: val,
      chatId: parsed.chatId || val
    });
    setActionNotice(null);
  };

  // Сохранение канала в список недавних
  const saveRecentChannel = (rawLink: string) => {
    if (!rawLink.trim()) return;
    const existing = config.recentChannels || [];
    const updated = [rawLink.trim(), ...existing.filter(c => c !== rawLink.trim())].slice(0, 5);
    updateConfig({ recentChannels: updated });
  };

  // Сгенерированный пост
  const post = useMemo(() => {
    return generateTelegramPost(recipe, {
      style,
      includeHashtags,
      includeAuthorContact,
      authorContact,
      customNote,
      brewDate,
      readyDate
    });
  }, [recipe, style, includeHashtags, includeAuthorContact, authorContact, customNote, brewDate, readyDate]);

  if (!isOpen) return null;

  // Копирование в буфер
  const handleCopy = () => {
    navigator.clipboard.writeText(post.plainText);
    setCopied(true);
    setActionNotice({
      type: 'copied',
      title: 'Текст скопирован в буфер обмена!',
      description: 'Теперь вы можете вставить его в любой чат, канал или заметку.'
    });
    setTimeout(() => setCopied(false), 2500);
  };

  // 1. Открытие Share-диалога в Telegram (Telegram сам открывает окно со вставленным текстом)
  const handleOpenTelegramShare = () => {
    saveRecentChannel(channelInput);
    // Копируем текст на всякий случай
    navigator.clipboard.writeText(post.plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    const shareUrl = getTelegramShareUrl(post.plainText);
    window.open(shareUrl, '_blank', 'noopener,noreferrer');

    setActionNotice({
      type: 'share',
      title: 'Окно Telegram Share открыто!',
      description: `Telegram открылся с готовым текстом рецепта. Выберите ваш канал ${parsedChannel.displayHandle ? `(${parsedChannel.displayHandle})` : ''} в появившемся списке Telegram и нажмите кнопку «Отправить» ✈️`
    });
  };

  // 2. Прямое открытие указанного канала в Telegram с копированием сообщения в буфер
  const handleOpenTargetChannel = () => {
    saveRecentChannel(channelInput);
    // 1. Копируем красиво отформатированный текст в буфер
    navigator.clipboard.writeText(post.plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    // 2. Открываем целевой канал в Telegram
    const targetUrl = parsedChannel.channelUrl || `https://t.me/${parsedChannel.chatId.replace(/^@/, '')}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');

    setActionNotice({
      type: 'open_channel',
      title: 'Текст рецепта скопирован, канал открыт!',
      description: 'Текст уже в буфере обмена. В открывшемся канале Telegram кликните в поле ввода сообщения, нажмите «Вставить» (Ctrl+V или долгое нажатие на телефоне) и отправьте рецепт 🚀',
      channelUrl: targetUrl
    });
  };

  // Тест подключения бота
  const handleTestBot = async () => {
    if (!config.botToken.trim()) {
      setTestResult({
        success: false,
        message: 'Введите токен бота (получается у @BotFather)'
      });
      return;
    }

    const targetChatId = parsedChannel.chatId || config.chatId;

    setIsTesting(true);
    setTestResult(null);

    const res = await testTelegramBot({
      botToken: config.botToken,
      chatId: targetChatId
    });

    setIsTesting(false);
    if (res.success) {
      if (channelInput) saveRecentChannel(channelInput);
      setTestResult({
        success: true,
        message: res.message || 'Бот успешно подключен!',
        botUsername: res.botUsername
      });
    } else {
      setTestResult({
        success: false,
        message: res.error || 'Ошибка проверки бота'
      });
    }
  };

  // Автоматический поиск чатов бота через getUpdates
  const handleDetectChats = async () => {
    if (!config.botToken.trim()) {
      setDetectStatus('Сначала укажите токен Telegram-бота от @BotFather');
      return;
    }

    setIsDetecting(true);
    setDetectStatus(null);

    const res = await detectTelegramChats(config.botToken);
    setIsDetecting(false);

    if (res.success && res.chats && res.chats.length > 0) {
      setDetectedChats(res.chats);
      if (res.chats.length === 1) {
        const chat = res.chats[0];
        handleChannelInputChange(chat.id);
        setDetectStatus(`✅ Найдена группа: «${chat.title}» (ID: ${chat.id}). ID автоматически подставлен в поле чата! Теперь нажмите «Проверить связь с каналом».`);
      } else {
        setDetectStatus(`Найдено групп/каналов: ${res.chats.length}. Нажмите на нужную группу ниже, чтобы выбрать:`);
      }
    } else {
      setDetectStatus('Пока бот не получил сообщений из группы. Отправьте любое сообщение (например, «тест» или «1») в вашу группу в Telegram и нажмите эту кнопку еще раз!');
    }
  };

  // Отправка через бота
  const handleSendViaBot = async () => {
    if (!config.botToken.trim()) {
      setActiveTab('bot');
      setSendResult({
        success: false,
        message: 'Для автоматической публикации укажите токен Telegram-бота (создается за 30 сек у @BotFather) или используйте вкладку «Быстрый репост»'
      });
      return;
    }

    const targetChatId = parsedChannel.chatId || config.chatId;
    if (!targetChatId.trim()) {
      setSendResult({
        success: false,
        message: 'Укажите ссылку на канал или @имя_канала (например https://t.me/my_brewery)'
      });
      return;
    }

    setIsSending(true);
    setSendResult(null);
    setActionNotice(null);

    const res = await sendToTelegramBot({
      botToken: config.botToken,
      chatId: targetChatId,
      message: post.html,
      parseMode: 'HTML'
    });

    setIsSending(false);
    if (res.success) {
      if (channelInput) saveRecentChannel(channelInput);
      setSendResult({
        success: true,
        message: `Рецепт «${recipe.name}» успешно опубликован в канале! 🎉`,
        chatTitle: res.chatTitle
      });
    } else {
      setSendResult({
        success: false,
        message: res.error || 'Не удалось отправить сообщение в канал'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Шапка модалки */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner shrink-0">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black flex items-center gap-2">
                <span>Публикация рецепта в Telegram</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider hidden sm:inline">
                  Крафт & ТТХ
                </span>
              </h2>
              <p className="text-xs text-sky-100">
                Оригинальное оформление для вашего Telegram-канала, бота или чата
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Навигационные табы: Быстрый репост vs Бот */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'share'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400 bg-white dark:bg-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Быстрый репост в Telegram (без бота)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bot')}
            className={`flex-1 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'bot'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400 bg-white dark:bg-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Автопубликация через Telegram-бота (в 1 клик)</span>
          </button>
        </div>

        {/* Основной контент (Grid с настройками слева и Telegram Live Preview справа) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Левая колонка: Настройки публикации */}
          <div className="lg:col-span-6 space-y-4">

            {/* БЛОК ВЫБОРА TELEGRAM-КАНАЛА ПОЛЬЗОВАТЕЛЕМ ПО ССЫЛКЕ */}
            <div className="p-4 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-sky-950 dark:text-sky-200 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Ваш Telegram-канал или чат:</span>
                </label>
                {parsedChannel.isValid && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    {parsedChannel.displayHandle}
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={channelInput}
                  onChange={(e) => handleChannelInputChange(e.target.value)}
                  placeholder="https://t.me/my_craft_channel или @my_craft_channel"
                  className="w-full bg-white dark:bg-stone-900 border border-sky-300 dark:border-sky-700/80 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono pr-20"
                />
                {parsedChannel.channelUrl && (
                  <a
                    href={parsedChannel.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-2 top-2 px-2 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 dark:bg-sky-900/60 dark:hover:bg-sky-800 text-[10px] font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1 transition-colors"
                    title="Проверить ссылку в Telegram"
                  >
                    <span>Открыть</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                <span>Поддерживаются ссылки <code>https://t.me/...</code>, <code>@канал</code> или <code>Chat ID</code></span>
              </div>

              {/* Недавние каналы пользователя */}
              {config.recentChannels && config.recentChannels.length > 0 && (
                <div className="pt-1.5 border-t border-sky-200/60 dark:border-sky-800/50 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold">Недавние:</span>
                  {config.recentChannels.map((rc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChannelInputChange(rc)}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 text-[10px] font-mono text-sky-700 dark:text-sky-300 hover:border-sky-400 cursor-pointer transition-colors"
                    >
                      {rc.replace('https://t.me/', '@')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Выбор стиля оформления поста */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Стиль оформления сообщения:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStyle('craft_release');
                    updateConfig({ defaultStyle: 'craft_release' });
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    style === 'craft_release'
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 shadow-2xs font-bold'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                  }`}
                >
                  <div className="text-xs">🍺 Крафт-релиз</div>
                  <div className="text-[10px] opacity-75 font-normal">Эмодзи, карточка, хмель</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStyle('tech_card');
                    updateConfig({ defaultStyle: 'tech_card' });
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    style === 'tech_card'
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 shadow-2xs font-bold'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                  }`}
                >
                  <div className="text-xs">📊 Технический</div>
                  <div className="text-[10px] opacity-75 font-normal">OG, FG, IBU, засыпь</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStyle('teaser');
                    updateConfig({ defaultStyle: 'teaser' });
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    style === 'teaser'
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 shadow-2xs font-bold'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                  }`}
                >
                  <div className="text-xs">📢 Анонс</div>
                  <div className="text-[10px] opacity-75 font-normal">Коротко для друзей</div>
                </button>
              </div>
            </div>

            {/* Дополнительные параметры публикации */}
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-3">
              <div>
                <label className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1 mb-1">
                  <MessageSquare className="w-3 h-3 text-sky-500" />
                  <span>Личный комментарий / заметка к посту:</span>
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Например: Сварено на родниковой воде, сухое охмеление Citra + Mosaic"
                  className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3 text-emerald-500" />
                    <span>Дата варки:</span>
                  </label>
                  <input
                    type="text"
                    value={brewDate}
                    onChange={(e) => setBrewDate(e.target.value)}
                    placeholder="19.10.2026"
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3 text-amber-500" />
                    <span>Ориентир готовности:</span>
                  </label>
                  <input
                    type="text"
                    value={readyDate}
                    onChange={(e) => setReadyDate(e.target.value)}
                    placeholder="Через 3 недели"
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1 border-t border-stone-200/60 dark:border-stone-700/60">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 dark:text-stone-300">
                  <input
                    type="checkbox"
                    checked={includeHashtags}
                    onChange={(e) => {
                      setIncludeHashtags(e.target.checked);
                      updateConfig({ includeHashtags: e.target.checked });
                    }}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Добавить пивные хэштеги (#МастерВарка, #{recipe.style})</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 dark:text-stone-300">
                  <input
                    type="checkbox"
                    checked={includeAuthorContact}
                    onChange={(e) => {
                      setIncludeAuthorContact(e.target.checked);
                      updateConfig({ includeAuthorContact: e.target.checked });
                    }}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Указать автора / контакт в посте</span>
                </label>

                {includeAuthorContact && (
                  <input
                    type="text"
                    value={authorContact}
                    onChange={(e) => {
                      setAuthorContact(e.target.value);
                      updateConfig({ authorContact: e.target.value });
                    }}
                    placeholder="@пивовар или имя пивоварни"
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-900 dark:text-white mt-1"
                  />
                )}
              </div>
            </div>

            {/* Вкладка 2: Настройки Telegram-бота */}
            {activeTab === 'bot' && (
              <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-sky-950 dark:text-sky-200 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>Пошаговое подключение Telegram-бота</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBotHelp(!showBotHelp)}
                    className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>{showBotHelp ? 'Скрыть инструкцию' : 'Показать инструкцию'}</span>
                  </button>
                </div>

                {/* Интерактивная карточка 3 шагов */}
                {showBotHelp && (
                  <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-stone-900/95 border border-sky-300/80 dark:border-sky-700 text-xs text-stone-700 dark:text-stone-200 space-y-3 shadow-xs">
                    <div className="font-bold text-sky-900 dark:text-sky-300 flex items-center justify-between">
                      <span>Настройка за 3 простых шага:</span>
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300">
                        ~1 минута (только 1 раз)
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {/* Шаг 1 */}
                      <div className="flex items-start gap-2.5 p-2 rounded-xl bg-sky-50/60 dark:bg-stone-850 border border-sky-100 dark:border-stone-800">
                        <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          1
                        </span>
                        <div className="space-y-1 flex-1">
                          <div className="text-[11px] font-bold text-stone-900 dark:text-stone-100">
                            Создайте бота в Telegram
                          </div>
                          <div className="text-[11px] text-stone-600 dark:text-stone-400">
                            Откройте официального бота <b>@BotFather</b> и отправьте команду <code>/newbot</code>.
                          </div>
                          <div className="pt-1 flex flex-wrap gap-1.5">
                            <a
                              href="https://t.me/BotFather"
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-[10px] inline-flex items-center gap-1 transition-colors"
                            >
                              <span>Открыть @BotFather ↗</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('/newbot');
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className="px-2 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-[10px] font-mono cursor-pointer hover:border-sky-400"
                            >
                              {copied ? '✓ Скопировано' : 'Скопировать /newbot'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Шаг 2 */}
                      <div className="flex items-start gap-2.5 p-2 rounded-xl bg-sky-50/60 dark:bg-stone-850 border border-sky-100 dark:border-stone-800">
                        <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          2
                        </span>
                        <div className="space-y-1 flex-1">
                          <div className="text-[11px] font-bold text-stone-900 dark:text-stone-100">
                            Скопируйте HTTP API токен
                          </div>
                          <div className="text-[11px] text-stone-600 dark:text-stone-400">
                            BotFather пришлет вам ключ вида <code>123456789:ABCdefGHIjklMNO...</code>. Вставьте его в поле ниже.
                          </div>
                        </div>
                      </div>

                      {/* Шаг 3 */}
                      <div className="flex items-start gap-2.5 p-2 rounded-xl bg-sky-50/60 dark:bg-stone-850 border border-sky-100 dark:border-stone-800">
                        <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          3
                        </span>
                        <div className="space-y-1 flex-1">
                          <div className="text-[11px] font-bold text-stone-900 dark:text-stone-100">
                            Добавьте бота в канал как Администратора
                          </div>
                          <div className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                            В Telegram откройте ваш канал {parsedChannel.displayHandle ? <b>{parsedChannel.displayHandle}</b> : ''} ➔ <b>Управление каналом</b> ➔ <b>Администраторы</b> ➔ <b>Добавить администратора</b> ➔ найдите созданного бота по юзернейму ➔ разрешите право <b>«Публикация сообщений»</b>.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                      Токен бота (Bot Token от @BotFather):
                    </label>
                    <input
                      type="password"
                      value={config.botToken}
                      onChange={(e) => updateConfig({ botToken: e.target.value })}
                      placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz..."
                      className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestBot}
                      disabled={isTesting || !config.botToken}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer shadow-2xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-sky-500' : 'text-stone-500'}`} />
                      <span>{isTesting ? 'Проверка связи с чатом...' : 'Проверить связь с чатом'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDetectChats}
                      disabled={isDetecting || !config.botToken}
                      className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/60 border border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-300 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer shadow-2xs"
                      title="Автоматически определить ID группы или канала, куда добавлен бот"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin text-sky-500' : 'text-sky-600 dark:text-sky-400'}`} />
                      <span>{isDetecting ? 'Ищу чаты бота...' : '🔍 Найти ID группы/канала'}</span>
                    </button>
                  </div>

                  {/* Статус автоопределения чата */}
                  {detectStatus && (
                    <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200 space-y-2">
                      <div className="leading-relaxed text-[11px]">{detectStatus}</div>
                      {detectedChats.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {detectedChats.map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                handleChannelInputChange(c.id);
                                handleTestBot();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-sky-300 dark:border-sky-600 text-sky-700 dark:text-sky-300 font-bold text-[11px] hover:bg-sky-500 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span>{c.type === 'channel' ? '📢' : '👥'} {c.title} ({c.id})</span>
                              <span className="text-[9px] bg-sky-100 dark:bg-sky-900/60 px-1 py-0.5 rounded">Выбрать</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {testResult && (
                    <div
                      className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 ${
                        testResult.success
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                          : 'bg-rose-500/15 border border-rose-500/30 text-rose-900 dark:text-rose-200'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <div className="font-bold">{testResult.message}</div>
                        {testResult.botUsername && (
                          <div className="text-[11px] opacity-85">
                            Бот: <b>@{testResult.botUsername}</b> {testResult.success && '— авторизован'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Действия: Кнопки отправки / копирования */}
            <div className="pt-2 space-y-2.5">
              {activeTab === 'share' ? (
                <div className="space-y-2.5">
                  {/* Главная кнопка: Telegram Share с ПРЕДЗАПОЛНЕННЫМ текстом рецепта */}
                  <button
                    type="button"
                    onClick={handleOpenTelegramShare}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-98 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Отправить через Telegram Share (готовый текст) 🚀</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Кнопка прямого перехода в целевой канал (с копированием в буфер) */}
                    {parsedChannel.channelUrl ? (
                      <button
                        type="button"
                        onClick={handleOpenTargetChannel}
                        className="py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-sky-200 dark:border-sky-800 cursor-pointer transition-colors"
                        title="Скопировать текст и перейти в ваш канал"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Скопировать и в канал {parsedChannel.displayHandle}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                        <span>{copied ? 'Скопировано!' : 'Скопировать текст'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleCopy}
                      className={`py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 cursor-pointer ${
                        !parsedChannel.channelUrl ? 'hidden' : ''
                      }`}
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                      <span>{copied ? 'Скопировано!' : 'Скопировать текст'}</span>
                    </button>
                  </div>

                  {/* Быстрый переход на бота для автоотправки */}
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-300 flex items-center justify-between">
                    <span>Нужна <b>автоматическая отправка</b> в канал без открытия Telegram?</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('bot')}
                      className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-[10px] cursor-pointer transition-colors"
                    >
                      Включить бота
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleSendViaBot}
                    disabled={isSending}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-sky-600 hover:from-emerald-600 hover:to-sky-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Send className={`w-4 h-4 ${isSending ? 'animate-bounce' : ''}`} />
                    <span>
                      {isSending
                        ? 'Отправляю в Telegram через API...'
                        : `Опубликовать в ${parsedChannel.displayHandle || 'канал'} прямо сейчас 🚀`}
                    </span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleOpenTelegramShare}
                      className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Telegram Share</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                      <span>{copied ? 'Скопировано!' : 'Скопировать текст'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Уведомление о действии (подсказка как завершить публикацию) */}
              {actionNotice && (
                <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-950 dark:text-sky-200 text-xs space-y-1 animate-fadeIn">
                  <div className="font-bold flex items-center gap-1.5 text-sky-700 dark:text-sky-300">
                    <Info className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>{actionNotice.title}</span>
                  </div>
                  <div className="text-[11px] leading-relaxed opacity-90">
                    {actionNotice.description}
                  </div>
                  {actionNotice.channelUrl && (
                    <div className="pt-1">
                      <a
                        href={actionNotice.channelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        <span>Перейти в канал в Telegram</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Результат отправки через бота */}
              {sendResult && (
                <div
                  className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                    sendResult.success
                      ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-500/15 border border-rose-500/40 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  {sendResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1.5 flex-1">
                    <div className="font-bold">{sendResult.message}</div>
                    {sendResult.chatTitle && (
                      <div className="text-[11px] opacity-80">Канал: <b>{sendResult.chatTitle}</b></div>
                    )}
                    {sendResult.success && parsedChannel.channelUrl && (
                      <div className="pt-1">
                        <a
                          href={parsedChannel.channelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                        >
                          <span>Посмотреть пост в канале Telegram ↗</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка: Реалистичный Telegram Live Preview */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="text-xs font-bold text-stone-600 dark:text-stone-300 flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-sky-500" />
                <span>Живой предпросмотр в Telegram:</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {post.plainText.length} симв.
              </span>
            </div>

            {/* Контейнер в стиле окна Telegram */}
            <div className="flex-1 rounded-2xl bg-[#0f172a] p-4 text-stone-100 font-sans border border-stone-800 shadow-inner flex flex-col justify-between overflow-hidden relative min-h-[380px]">
              <div className="absolute inset-0 bg-radial from-sky-950/20 via-transparent to-transparent pointer-events-none" />

              {/* Telegram Message Bubble */}
              <div className="relative z-10 bg-[#1e293b] rounded-2xl rounded-tl-sm p-4 border border-stone-700/80 shadow-md text-xs space-y-2.5 max-w-full">
                {/* Заголовок отправителя в Telegram */}
                <div className="flex items-center justify-between border-b border-stone-700/60 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-[10px] font-black text-stone-950 shadow-xs">
                      🍺
                    </div>
                    <div>
                      <div className="font-bold text-sky-400 text-xs flex items-center gap-1">
                        <span>{parsedChannel.displayHandle ? `${parsedChannel.displayHandle}` : 'МастерВарка'}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-300">
                          {activeTab === 'bot' ? 'автопост' : 'канал'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Тело сообщения с поддержкой HTML тегов Telegram */}
                <div
                  className="telegram-rendered-content text-stone-200 leading-relaxed font-sans text-xs space-y-1.5 max-h-[360px] overflow-y-auto pr-1"
                  dangerouslySetInnerHTML={{ __html: post.html.replace(/\n/g, '<br/>') }}
                />

                {/* Подвал пузыря с временем и галочками */}
                <div className="pt-2 flex items-center justify-end gap-1 text-[10px] text-stone-400 border-t border-stone-700/40">
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-sky-400 font-bold">✓✓</span>
                </div>
              </div>

              {/* Подсказка внизу */}
              <div className="mt-3 text-center text-[11px] text-stone-500">
                Текст подготовлен с учетом всех правил форматирования Telegram (HTML / Markdown).
              </div>
            </div>
          </div>
        </div>

        {/* Подвал */}
        <div className="p-3 bg-stone-50 dark:bg-stone-850 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0 text-xs text-stone-500">
          <span>Рецепт: <b>«{recipe.name}»</b> ({recipe.style})</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 font-bold cursor-pointer transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
