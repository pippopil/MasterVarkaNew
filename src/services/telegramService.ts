import { Recipe } from '../types/brewing';

export type TelegramPostStyle = 'craft_release' | 'tech_card' | 'teaser';

export interface TelegramConfig {
  channelLink: string;
  botToken: string;
  chatId: string;
  defaultStyle: TelegramPostStyle;
  includeHashtags: boolean;
  includeAuthorContact: boolean;
  authorContact: string;
  recentChannels?: string[];
}

export interface TelegramPublishOptions {
  style: TelegramPostStyle;
  includeHashtags?: boolean;
  includeAuthorContact?: boolean;
  authorContact?: string;
  customNote?: string;
  brewDate?: string;
  readyDate?: string;
}

export interface TelegramSendResult {
  success: boolean;
  messageId?: number;
  chatTitle?: string;
  error?: string;
  warning?: string;
}

export interface TelegramTestResult {
  success: boolean;
  botUsername?: string;
  botFirstName?: string;
  chatTitle?: string;
  message?: string;
  error?: string;
}

const STORAGE_KEY = 'mastervarka_telegram_config';

export const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  channelLink: '',
  botToken: '',
  chatId: '',
  defaultStyle: 'craft_release',
  includeHashtags: true,
  includeAuthorContact: false,
  authorContact: '',
  recentChannels: []
};

/**
 * Загрузка сохраненных настроек Telegram из localStorage
 */
export function loadTelegramConfig(): TelegramConfig {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_TELEGRAM_CONFIG, ...parsed };
      }
    }
  } catch (e) {
    console.error('Failed to load telegram config:', e);
  }
  return DEFAULT_TELEGRAM_CONFIG;
}

/**
 * Сохранение настроек Telegram в localStorage
 */
export function saveTelegramConfig(config: TelegramConfig): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
  } catch (e) {
    console.error('Failed to save telegram config:', e);
  }
}

/**
 * Безопасное экранирование специальных символов для Telegram HTML
 */
function escapeHtml(text: string): string {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Генерация красивого, структурированного и оригинального сообщения для Telegram
 */
export function generateTelegramPost(
  recipe: Recipe,
  options: TelegramPublishOptions
): { html: string; plainText: string } {
  const {
    style = 'craft_release',
    includeHashtags = true,
    includeAuthorContact = false,
    authorContact = '',
    customNote = '',
    brewDate = '',
    readyDate = ''
  } = options;

  const abv = Number(recipe.calculated?.abv || 5.0).toFixed(1);
  const ibu = Math.round(Number(recipe.calculated?.ibu || 30));
  const ogSg = Number(recipe.calculated?.ogSg || 1.050).toFixed(3);
  const fgSg = Number(recipe.calculated?.fgSg || 1.010).toFixed(3);
  const ogPlato = Number(recipe.calculated?.ogPlato || 12.5).toFixed(1);
  const fgPlato = Number(recipe.calculated?.fgPlato || 2.8).toFixed(1);
  const ebc = Math.round(Number(recipe.calculated?.ebc || 12));
  const batchSize = recipe.batchSizeL || 20;

  // Расчет суммарного веса засыпи
  const totalGrainKg = recipe.grains.reduce((sum, g) => sum + (Number(g.weightKg) || 0), 0);

  // Хештеги
  const styleTag = (recipe.style || 'craft')
    .toLowerCase()
    .replace(/[^a-zа-я0-9]/gi, '_')
    .replace(/^_+|_+$/g, '');
  const hashtags = [
    '#МастерВарка',
    '#ДомашнееПиво',
    '#КрафтовоеПивоварение',
    `#${styleTag}`,
    recipe.isCustom ? '#АвторскийРецепт' : '#BJCP'
  ].filter(Boolean).join(' ');

  // 1. СТИЛЬ: «КРАФТОВЫЙ РЕЛИЗ & ДЕГУСТАЦИЯ»
  if (style === 'craft_release') {
    const titleEmoji = recipe.calculated?.ebc > 45 ? '🌑' : recipe.calculated?.ebc > 25 ? '琥' : '🍺';
    const lines: string[] = [];

    lines.push(`${titleEmoji} <b>«${escapeHtml(recipe.name)}»</b>`);
    lines.push(`<i>Стиль: ${escapeHtml(recipe.style)} ${recipe.category ? `(${escapeHtml(recipe.category)})` : ''}</i>`);
    lines.push('');

    // Легенда / Описание сорта
    if (recipe.description) {
      lines.push(`📜 <b>Концепция и история сорта:</b>`);
      lines.push(`<i>${escapeHtml(recipe.description)}</i>`);
      lines.push('');
    }

    // ТТХ
    lines.push('📊 <b>Характеристики напитка (ТТХ):</b>');
    lines.push(`▫️ Плотность (OG): <b>${ogPlato}°P</b> (${ogSg}) ➔ КП: <b>${fgPlato}°P</b> (${fgSg})`);
    lines.push(`▫️ Крепость (ABV): <b>${abv}% об.</b>`);
    lines.push(`▫️ Горечь (IBU): <b>${ibu}</b> | Цветность (EBC): <b>${ebc}</b>`);
    lines.push(`▫️ Объем партии: <b>${batchSize} л</b> | Варка: <b>${recipe.boilTimeMin} мин</b>`);
    lines.push('');

    // Солодовая база
    if (recipe.grains.length > 0) {
      lines.push('🌾 <b>Солодовая засыпь:</b>');
      recipe.grains.forEach(g => {
        const pct = totalGrainKg > 0 ? ((g.weightKg / totalGrainKg) * 100).toFixed(0) : '0';
        lines.push(`• <b>${escapeHtml(g.name)}</b> — ${g.weightKg} кг <i>(${pct}%)</i>`);
      });
      lines.push('');
    }

    // Хмель
    if (recipe.hops.length > 0) {
      lines.push('🌿 <b>Профиль охмеления:</b>');
      recipe.hops.forEach(h => {
        const timing = h.use === 'dry_hop'
          ? `Сухое охмеление (${h.boilTimeMin || 3} дн)`
          : h.use === 'whirlpool'
          ? `Вирпул (${h.boilTimeMin} мин)`
          : h.boilTimeMin === 0
          ? 'На выключение'
          : `Кипячение ${h.boilTimeMin} мин`;
        lines.push(`• <b>${escapeHtml(h.name)}</b> (${h.alphaAcid}% α) — ${h.weightG} г <i>[${timing}]</i>`);
      });
      lines.push('');
    }

    // Дрожжи
    lines.push(`🧪 <b>Дрожжи:</b> ${escapeHtml(recipe.yeast.name)} <i>(${escapeHtml(recipe.yeast.type || 'Элевые')})</i>`);

    // Пользовательская заметка / дата
    if (customNote) {
      lines.push('');
      lines.push(`💡 <b>Заметка пивовара:</b>`);
      lines.push(`<i>${escapeHtml(customNote)}</i>`);
    }

    if (brewDate || readyDate) {
      lines.push('');
      lines.push('📅 <b>График созревания:</b>');
      if (brewDate) lines.push(`• Дата варки: <b>${escapeHtml(brewDate)}</b>`);
      if (readyDate) lines.push(`• Готовность к розливу / дегустации: <b>${escapeHtml(readyDate)}</b> 🍻`);
    }

    if (includeAuthorContact && authorContact) {
      lines.push('');
      lines.push(`👨‍🍳 <b>Автор / Пивовар:</b> ${escapeHtml(authorContact)}`);
    }

    if (includeHashtags) {
      lines.push('');
      lines.push(hashtags);
    }

    lines.push('');
    lines.push('<i>Сварено и рассчитано в приложении МастерВарка 🍺</i>');

    const html = lines.join('\n');
    const plainText = html.replace(/<[^>]+>/g, '');
    return { html, plainText };
  }

  // 2. СТИЛЬ: «ТЕХНИЧЕСКАЯ КАРТА ВАРКИ»
  if (style === 'tech_card') {
    const lines: string[] = [];

    lines.push(`🛠 <b>ТЕХНИЧЕСКАЯ КАРТА ВАРКИ</b>`);
    lines.push(`🍺 <b>${escapeHtml(recipe.name)}</b> [${escapeHtml(recipe.style)}]`);
    lines.push('━━━━━━━━━━━━━━━━━━━━');
    lines.push(`🎯 <b>ЦЕЛЕВЫЕ ПОКАЗАТЕЛИ:</b>`);
    lines.push(`• OG: <code>${ogSg}</code> (${ogPlato}°P) | FG: <code>${fgSg}</code> (${fgPlato}°P)`);
    lines.push(`• ABV: <code>${abv}%</code> | IBU: <code>${ibu}</code> | EBC: <code>${ebc}</code>`);
    lines.push(`• Объем сусла: <code>${batchSize} л</code> | Эффективность: <code>${recipe.efficiencyPercent}%</code>`);
    lines.push(`• Кипячение: <code>${recipe.boilTimeMin} мин</code>`);
    lines.push('');

    // Засыпь
    lines.push(`🌾 <b>ЗАСЫПЬ (Всего ${totalGrainKg.toFixed(2)} кг):</b>`);
    recipe.grains.forEach((g, idx) => {
      const pct = totalGrainKg > 0 ? ((g.weightKg / totalGrainKg) * 100).toFixed(1) : '0';
      lines.push(`${idx + 1}. ${escapeHtml(g.name)} — <b>${g.weightKg} кг</b> (${pct}%)`);
    });
    lines.push('');

    // Паузы затирания
    if (recipe.mashSchedule && recipe.mashSchedule.length > 0) {
      lines.push(`⏱ <b>ТЕМПЕРАТУРНЫЕ ПАУЗЫ ЗАТИРАНИЯ:</b>`);
      recipe.mashSchedule.forEach((step, idx) => {
        lines.push(`• Пауза ${idx + 1}: <b>${step.tempC}°C</b> — <b>${step.timeMin} мин</b> <i>(${escapeHtml(step.name)})</i>`);
      });
      lines.push('');
    }

    // Хмель
    if (recipe.hops.length > 0) {
      lines.push(`🌿 <b>ОХМЕЛЕНИЕ:</b>`);
      recipe.hops.forEach(h => {
        const stage = h.use === 'dry_hop'
          ? `Сухое охмеление (${h.boilTimeMin || 3} дн)`
          : h.use === 'whirlpool'
          ? `Вирпул (${h.boilTimeMin} мин)`
          : `Варка ${h.boilTimeMin} мин`;
        lines.push(`• ${escapeHtml(h.name)} [${h.alphaAcid}% α] — <b>${h.weightG} г</b> ➔ ${stage}`);
      });
      lines.push('');
    }

    // Дрожжи и брожение
    const fermentTemp = recipe.yeast.tempRange ? `${recipe.yeast.tempRange[0]}–${recipe.yeast.tempRange[1]}°C` : '18–20°C';
    lines.push(`🧪 <b>ДРОЖЖИ & БРОЖЕНИЕ:</b>`);
    lines.push(`• Штамм: <b>${escapeHtml(recipe.yeast.name)}</b>`);
    lines.push(`• Температура брожения: <b>${fermentTemp}</b>`);

    // Другие добавки
    if (recipe.otherIngredients && recipe.otherIngredients.length > 0) {
      lines.push('');
      lines.push(`✨ <b>СПЕЦИИ И ДОБАВКИ:</b>`);
      recipe.otherIngredients.forEach(o => {
        lines.push(`• ${escapeHtml(o.name)} — ${o.amount} ${o.unit} <i>(${escapeHtml(o.stage)})</i>`);
      });
    }

    if (customNote) {
      lines.push('');
      lines.push(`📝 <b>ПРИМЕЧАНИЯ:</b> <i>${escapeHtml(customNote)}</i>`);
    }

    if (includeAuthorContact && authorContact) {
      lines.push('');
      lines.push(`👨‍🍳 <b>Технолог / Пивовар:</b> ${escapeHtml(authorContact)}`);
    }

    if (includeHashtags) {
      lines.push('');
      lines.push(hashtags);
    }

    const html = lines.join('\n');
    const plainText = html.replace(/<[^>]+>/g, '');
    return { html, plainText };
  }

  // 3. СТИЛЬ: «КРАТКИЙ АНОНС ДЛЯ ДРУЗЕЙ И КАНАЛА»
  const lines: string[] = [];
  lines.push(`📢 <b>Новая варка: «${escapeHtml(recipe.name)}»!</b>`);
  lines.push('');
  lines.push(`Сварили партию отменного <b>${escapeHtml(recipe.style)}</b> (${batchSize} л).`);
  lines.push(`Плотность <b>${ogPlato}°P</b>, расчетная крепость <b>${abv}%</b>, благородная горечь <b>${ibu} IBU</b>.`);
  
  if (recipe.hops.length > 0) {
    const hopStr = recipe.hops.slice(0, 3).map(h => h.name).join(', ');
    lines.push(`В аромате солируют яркие хмели: <i>${escapeHtml(hopStr)}</i> 🌿`);
  }

  if (readyDate) {
    lines.push('');
    lines.push(`🗓 <b>Ориентир готовности:</b> ${escapeHtml(readyDate)}.`);
    lines.push('Готовьте бокалы, скоро дегустация! 🍻');
  } else {
    lines.push('');
    lines.push('Скоро разольем по бутылкам — следите за анонсом! 🍻');
  }

  if (customNote) {
    lines.push('');
    lines.push(`<i>«${escapeHtml(customNote)}»</i>`);
  }

  if (includeHashtags) {
    lines.push('');
    lines.push(hashtags);
  }

  const html = lines.join('\n');
  const plainText = html.replace(/<[^>]+>/g, '');
  return { html, plainText };
}

/**
 * Создание ссылки для быстрого открытия в клиенте Telegram (Share Link)
 */
export function getTelegramShareUrl(text: string, url: string = ''): string {
  const cleanText = text.replace(/<[^>]+>/g, '');
  const params = new URLSearchParams();
  if (url) params.append('url', url);
  params.append('text', cleanText);
  return `https://t.me/share/url?${params.toString()}`;
}

/**
 * Отправка сообщения в Telegram через локальный backend proxy (/api/telegram/send)
 */
export async function sendToTelegramBot(params: {
  botToken: string;
  chatId: string;
  message: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}): Promise<TelegramSendResult> {
  try {
    const res = await fetch('/api/telegram/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Ошибка отправки в Telegram'
      };
    }

    return {
      success: true,
      messageId: data.messageId,
      chatTitle: data.chatTitle,
      warning: data.warning
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Ошибка сети: ${err.message || 'Сервер недоступен'}`
    };
  }
}

/**
 * Проверка подключения бота к Telegram через /api/telegram/test
 */
export async function testTelegramBot(params: {
  botToken: string;
  chatId?: string;
}): Promise<TelegramTestResult> {
  try {
    const res = await fetch('/api/telegram/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        botUsername: data.botUsername,
        error: data.error || 'Ошибка проверки Telegram бота'
      };
    }

    return {
      success: true,
      botUsername: data.botUsername,
      botFirstName: data.botFirstName,
      chatTitle: data.chatTitle,
      message: data.message
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Ошибка сети: ${err.message || 'Сервер недоступен'}`
    };
  }
}

export interface DetectedTelegramChat {
  id: string;
  title: string;
  type: string;
  username?: string;
}

/**
 * Автоматическое обнаружение групп и каналов, куда добавлен бот (через getUpdates)
 */
export async function detectTelegramChats(botToken: string): Promise<{
  success: boolean;
  chats?: DetectedTelegramChat[];
  error?: string;
}> {
  try {
    const res = await fetch('/api/telegram/detect-chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ botToken })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Не удалось получить список чатов'
      };
    }

    return {
      success: true,
      chats: data.chats || []
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Ошибка сети: ${err.message || 'Сервер недоступен'}`
    };
  }
}

export interface ParsedTelegramChannel {
  rawInput: string;
  channelUrl: string;
  chatId: string;
  displayHandle: string;
  isChannelUrl: boolean;
  isValid: boolean;
}

/**
 * Интеллектуальный разбор ссылки или имени Telegram-канала / чата
 * Поддерживает форматы:
 * - https://t.me/channel_name
 * - t.me/channel_name
 * - @channel_name
 * - channel_name
 * - -100123456789 (ID приватного чата)
 * - https://t.me/+joinhash
 */
export function parseTelegramChannel(input: string): ParsedTelegramChannel {
  const trimmed = (input || '').trim();
  if (!trimmed) {
    return {
      rawInput: '',
      channelUrl: '',
      chatId: '',
      displayHandle: '',
      isChannelUrl: false,
      isValid: false
    };
  }

  // 1. Полная веб-ссылка t.me/username или telegram.me/username
  const urlMatch = trimmed.match(/^(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.me)\/(?:s\/)?([a-zA-Z0-9_]{3,})$/i);
  if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith('+') && !urlMatch[1].startsWith('joinchat')) {
    const username = urlMatch[1];
    return {
      rawInput: trimmed,
      channelUrl: `https://t.me/${username}`,
      chatId: `@${username}`,
      displayHandle: `@${username}`,
      isChannelUrl: true,
      isValid: true
    };
  }

  // 2. Ссылка-приглашение (t.me/+... или t.me/joinchat/...)
  if (trimmed.includes('t.me/+') || trimmed.includes('t.me/joinchat')) {
    const fullUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    return {
      rawInput: trimmed,
      channelUrl: fullUrl,
      chatId: trimmed,
      displayHandle: 'Приватный канал (ссылка)',
      isChannelUrl: true,
      isValid: true
    };
  }

  // 3. Юзернейм с @: @my_brewery
  if (trimmed.startsWith('@')) {
    const handle = trimmed.slice(1);
    return {
      rawInput: trimmed,
      channelUrl: `https://t.me/${handle}`,
      chatId: trimmed,
      displayHandle: trimmed,
      isChannelUrl: false,
      isValid: handle.length >= 3
    };
  }

  // 4. Числовой ID чата: -1001234567890
  if (/^-?\d+$/.test(trimmed)) {
    return {
      rawInput: trimmed,
      channelUrl: '',
      chatId: trimmed,
      displayHandle: `Chat ID: ${trimmed}`,
      isChannelUrl: false,
      isValid: true
    };
  }

  // 5. Простое имя канала без @: my_channel
  if (/^[a-zA-Z0-9_]{3,}$/.test(trimmed)) {
    return {
      rawInput: trimmed,
      channelUrl: `https://t.me/${trimmed}`,
      chatId: `@${trimmed}`,
      displayHandle: `@${trimmed}`,
      isChannelUrl: false,
      isValid: true
    };
  }

  return {
    rawInput: trimmed,
    channelUrl: trimmed.startsWith('http') ? trimmed : `https://${trimmed}`,
    chatId: trimmed,
    displayHandle: trimmed,
    isChannelUrl: trimmed.includes('t.me'),
    isValid: trimmed.length > 2
  };
}

export interface BugReportPayload {
  botToken?: string;
  category: 'bug' | 'feature' | 'brewery' | 'ingredients' | 'other';
  subject: string;
  description: string;
  testerContact?: string;
  diagnostics?: {
    appVersion: string;
    screen: string;
    os: string;
    isMobile: boolean;
    online: string;
    time: string;
    brewery: string;
  };
  channelUsername?: string;
}

export interface SendBugReportResult {
  success: boolean;
  messageId?: number;
  channel?: string;
  channelTitle?: string;
  savedLocally?: boolean;
  needToken?: boolean;
  error?: string;
  telegramError?: string;
}

// Вшитый по умолчанию токен бота МастерВарка для публикации багрепортов в 1 клик
export const BUILTIN_TELEGRAM_BOT_TOKEN = '';

/**
 * Прямая автоматическая отправка багрепорта в официальный канал @mastervarka без ручного перехода.
 * Поддерживает как серверный роут (/api/telegram/send-bug-report), так и автономный клиентский вызов
 * для мобильного APK на телефоне.
 */
export async function submitBugReportDirectly(payload: BugReportPayload): Promise<SendBugReportResult> {
  const tokenToUse = payload.botToken?.trim() || BUILTIN_TELEGRAM_BOT_TOKEN;

  // 1. Попытка отправки через серверный прокси-роут
  try {
    const res = await fetch('/api/telegram/send-bug-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        botToken: tokenToUse || undefined
      })
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
    
    // Если сервер вернул ошибку с явным указанием needToken, проверим прямой вызов
    const errData = await res.json().catch(() => null);
    if (errData && !errData.needToken) {
      return errData;
    }
  } catch {
    // В мобильном APK без Node.js или в офлайне переходим к клиентской отправке
  }

  // 2. Автономная прямая отправка с клиента в Telegram API (работает в мобильном приложении)
  if (tokenToUse) {
    try {
      const channel = payload.channelUsername || '@mastervarka';
      const cleanChatId = channel.startsWith('@') ? channel : `@${channel}`;

      const categoryLabels: Record<string, { label: string; icon: string }> = {
        bug: { label: 'Ошибка / Баг', icon: '🐞' },
        feature: { label: 'Идея / Предложение', icon: '💡' },
        brewery: { label: 'Пивоварня & Wi-Fi', icon: '⚡' },
        ingredients: { label: 'Ингредиенты / Солода', icon: '🌾' },
        other: { label: 'Обратная связь', icon: '💬' }
      };
      const cat = categoryLabels[payload.category] || { label: 'Обратная связь', icon: '💬' };

      let htmlMessage = `🍺 <b>[МастерВарка Бета] ${cat.icon} ${cat.label}</b>\n\n`;
      if (payload.subject?.trim()) {
        htmlMessage += `📌 <b>Тема:</b> ${escapeHtml(payload.subject.trim())}\n\n`;
      }
      htmlMessage += `📝 <b>Описание:</b>\n${escapeHtml(payload.description.trim() || 'Описание не заполнено')}\n\n`;
      if (payload.testerContact?.trim()) {
        htmlMessage += `👤 <b>Контакт:</b> ${escapeHtml(payload.testerContact.trim())}\n\n`;
      }
      if (payload.diagnostics) {
        htmlMessage += `📱 <b>Диагностика устройства:</b>\n`;
        htmlMessage += `• ОС: <code>${escapeHtml(payload.diagnostics.os)}</code> (${payload.diagnostics.isMobile ? 'моб' : 'пк'})\n`;
        htmlMessage += `• Версия: <code>${escapeHtml(payload.diagnostics.appVersion)}</code>\n`;
        htmlMessage += `• Экран: <code>${escapeHtml(payload.diagnostics.screen)}</code>\n`;
        htmlMessage += `• Сеть: <code>${escapeHtml(payload.diagnostics.online)}</code>\n\n`;
      }
      htmlMessage += `#багрепорт #бетатест`;

      const tgRes = await fetch(`https://api.telegram.org/bot${tokenToUse}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cleanChatId,
          text: htmlMessage,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });

      const tgData = await tgRes.json();
      if (tgData.ok) {
        return {
          success: true,
          messageId: tgData.result?.message_id,
          channel: cleanChatId
        };
      } else {
        return {
          success: false,
          error: `Telegram: ${tgData.description || 'Не удалось отправить сообщение'}`
        };
      }
    } catch (e: any) {
      return {
        success: false,
        error: `Не удалось связаться с Telegram: ${e.message || 'Ошибка сети'}`
      };
    }
  }

  return {
    success: false,
    needToken: true,
    error: 'Для отправки в 1 клик необходим вшитый токен бота. Сообщение готово к отправке!'
  };
}

