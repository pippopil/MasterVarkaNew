import { Router, Request, Response } from 'express';

export const telegramRouter = Router();

interface TelegramSendRequest {
  botToken?: string;
  chatId?: string;
  message?: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disableWebPagePreview?: boolean;
}

interface TelegramTestRequest {
  botToken?: string;
  chatId?: string;
}

// Регулярное выражение для проверки формата токена бота Telegram (например, 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)
const BOT_TOKEN_REGEX = /^\d{6,12}:[A-Za-z0-9_-]{30,50}$/;

/**
 * Проверка подключения бота к Telegram API и отправка тестового сообщения
 */
telegramRouter.post('/test', async (req: Request<{}, {}, TelegramTestRequest>, res: Response) => {
  const { botToken, chatId } = req.body;

  const rawToken = botToken?.trim() || process.env.TELEGRAM_BOT_TOKEN?.trim() || '';
  if (!rawToken) {
    return res.status(400).json({
      success: false,
      error: 'Не указан токен Telegram-бота'
    });
  }

  const cleanToken = rawToken;
  if (!BOT_TOKEN_REGEX.test(cleanToken)) {
    return res.status(400).json({
      success: false,
      error: 'Некорректный формат токена бота (ожидается числовой ID и секретный хеш через двоеточие, например: 123456789:ABCdef...)'
    });
  }

  try {
    // 1. Проверяем валидность бота через getMe
    const getMeRes = await fetch(`https://api.telegram.org/bot${cleanToken}/getMe`, {
      method: 'GET',
      signal: AbortSignal.timeout(8000)
    });

    const getMeData = await getMeRes.json();
    if (!getMeRes.ok || !getMeData.ok) {
      return res.status(400).json({
        success: false,
        error: getMeData.description || 'Не удалось авторизовать бота. Проверьте правильность токена.'
      });
    }

    const botUser = getMeData.result;

    // 2. Если указан chatId, проверяем отправку сообщения
    if (chatId && typeof chatId === 'string') {
      let cleanChatId = chatId.trim();
      const urlMatch = cleanChatId.match(/(?:t\.me|telegram\.me)\/(?:s\/)?([a-zA-Z0-9_]{3,})/i);
      if (urlMatch && urlMatch[1]) {
        cleanChatId = `@${urlMatch[1]}`;
      } else if (/^[a-zA-Z0-9_]{3,}$/.test(cleanChatId) && !cleanChatId.startsWith('@')) {
        cleanChatId = `@${cleanChatId}`;
      }

      const testText = `🍺 <b>Тестовое сообщение от МастерВарки!</b>\n\n✅ Бот <i>@${botUser.username}</i> успешно подключен к каналу/чату.\nТеперь вы можете публиковать созданные рецепты в один клик!`;

      const sendRes = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cleanChatId,
          text: testText,
          parse_mode: 'HTML'
        }),
        signal: AbortSignal.timeout(8000)
      });

      const sendData = await sendRes.json();
      if (!sendRes.ok || !sendData.ok) {
        const isChatNotFound = sendData.description && sendData.description.includes('chat not found');
        const errorDetail = isChatNotFound
          ? `Бот найден (@${botUser.username}), но чат «${cleanChatId}» не найден (Bad Request: chat not found). Если вы добавили бота в группу или частный канал (ссылка с +), Telegram требует числовой ID группы (-100...) вместо ссылки-приглашения. Нажмите кнопку «Определить чаты бота», чтобы автоматически найти ID!`
          : `Бот найден (@${botUser.username}), но не смог отправить сообщение в чат: ${sendData.description || 'Ошибка доступа'}. Убедитесь, что бот добавлен в канал/группу и назначен администратором с правом публикации.`;

        return res.status(400).json({
          success: false,
          botUsername: botUser.username,
          error: errorDetail
        });
      }

      return res.json({
        success: true,
        botUsername: botUser.username,
        botFirstName: botUser.first_name,
        chatTitle: sendData.result?.chat?.title || sendData.result?.chat?.username || cleanChatId,
        message: `Бот @${botUser.username} проверен и успешно отправил тестовое сообщение в ${cleanChatId}!`
      });
    }

    // Если chatId не указан, просто возвращаем инфо о боте
    return res.json({
      success: true,
      botUsername: botUser.username,
      botFirstName: botUser.first_name,
      message: `Бот @${botUser.username} активен и готов к работе. Укажите @имя_канала или Chat ID для публикации.`
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: `Ошибка соединения с Telegram API: ${err.message || 'Таймаут сети'}`
    });
  }
});

/**
 * Автоопределение доступных чатов, групп и каналов бота через getUpdates
 */
telegramRouter.post('/detect-chats', async (req: Request, res: Response) => {
  const { botToken } = req.body;
  const rawToken = botToken?.trim() || process.env.TELEGRAM_BOT_TOKEN?.trim() || '';

  if (!rawToken || !BOT_TOKEN_REGEX.test(rawToken)) {
    return res.status(400).json({
      success: false,
      error: 'Не указан корректный токен бота (например 123456789:ABCdef...)'
    });
  }

  try {
    const updatesRes = await fetch(`https://api.telegram.org/bot${rawToken}/getUpdates?limit=100`, {
      method: 'GET',
      signal: AbortSignal.timeout(8000)
    });

    const updatesData = await updatesRes.json();
    if (!updatesRes.ok || !updatesData.ok) {
      return res.status(400).json({
        success: false,
        error: updatesData.description || 'Не удалось получить обновления от Telegram API'
      });
    }

    const chatsMap = new Map<string, { id: string; title: string; type: string; username?: string }>();

    for (const update of updatesData.result || []) {
      const chat =
        update.message?.chat ||
        update.channel_post?.chat ||
        update.my_chat_member?.chat ||
        update.chat_member?.chat;

      if (chat && chat.id) {
        const idStr = String(chat.id);
        chatsMap.set(idStr, {
          id: idStr,
          title: chat.title || (chat.username ? `@${chat.username}` : (chat.first_name ? `${chat.first_name} ${chat.last_name || ''}`.trim() : `Чат ${idStr}`)),
          type: chat.type, // 'channel' | 'group' | 'supergroup' | 'private'
          username: chat.username ? `@${chat.username}` : undefined
        });
      }
    }

    const detectedChats = Array.from(chatsMap.values());

    return res.json({
      success: true,
      chats: detectedChats,
      count: detectedChats.length
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: `Ошибка соединения с Telegram API: ${err.message || 'Таймаут сети'}`
    });
  }
});

/**
 * Публикация оформленного рецепта в Telegram-канал или чат
 */
telegramRouter.post('/send', async (req: Request<{}, {}, TelegramSendRequest>, res: Response) => {
  const { botToken, chatId, message, parseMode = 'HTML', disableWebPagePreview = true } = req.body;
  const rawToken = botToken?.trim() || process.env.TELEGRAM_BOT_TOKEN?.trim() || '';
  let cleanChatId = (chatId || '').trim();

  // Автоматическая нормализация формата chatId для Telegram Bot API:
  // 1. Извлекаем юзернейм из ссылок https://t.me/username или t.me/username
  const urlMatch = cleanChatId.match(/(?:t\.me|telegram\.me)\/(?:s\/)?([a-zA-Z0-9_]{3,})/i);
  if (urlMatch && urlMatch[1]) {
    cleanChatId = `@${urlMatch[1]}`;
  } else if (/^[a-zA-Z0-9_]{3,}$/.test(cleanChatId) && !cleanChatId.startsWith('@')) {
    // Если ввели имя без @ и это не числовой ID
    cleanChatId = `@${cleanChatId}`;
  }

  if (!rawToken) {
    return res.status(400).json({ success: false, error: 'Токен Telegram-бота не указан' });
  }

  if (!cleanChatId) {
    return res.status(400).json({ success: false, error: 'Имя канала или Chat ID не указан (например, @my_brewery или https://t.me/my_brewery)' });
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Текст публикации пуст' });
  }

  const cleanToken = rawToken;

  if (!BOT_TOKEN_REGEX.test(cleanToken)) {
    return res.status(400).json({
      success: false,
      error: 'Некорректный формат токена бота (например 123456789:ABCdef...)'
    });
  }

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: message.trim(),
        parse_mode: parseMode,
        disable_web_page_preview: disableWebPagePreview
      }),
      signal: AbortSignal.timeout(10000)
    });

    const data = await telegramRes.json();

    if (!telegramRes.ok || !data.ok) {
      // Если ошибка парсинга HTML, пробуем повторить как обычный текст
      if (data.description && data.description.includes('can\'t parse entities')) {
        const plainTextFallback = message.replace(/<[^>]+>/g, '');
        const fallbackRes = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: cleanChatId,
            text: plainTextFallback,
            disable_web_page_preview: disableWebPagePreview
          }),
          signal: AbortSignal.timeout(8000)
        });

        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok && fallbackData.ok) {
          return res.json({
            success: true,
            messageId: fallbackData.result?.message_id,
            chatTitle: fallbackData.result?.chat?.title || fallbackData.result?.chat?.username || cleanChatId,
            warning: 'Сообщение отправлено в текстовом режиме из-за специфических символов в разметке.'
          });
        }
      }

      return res.status(400).json({
        success: false,
        error: data.description || 'Не удалось отправить сообщение в Telegram'
      });
    }

    return res.json({
      success: true,
      messageId: data.result?.message_id,
      chatTitle: data.result?.chat?.title || data.result?.chat?.username || cleanChatId,
      chatType: data.result?.chat?.type,
      sentAt: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: `Ошибка отправки в Telegram: ${err.message || 'Таймаут соединения'}`
    });
  }
});

interface BugReportBody {
  botToken?: string;
  category?: string;
  subject?: string;
  description?: string;
  testerContact?: string;
  diagnostics?: {
    appVersion?: string;
    screen?: string;
    os?: string;
    isMobile?: boolean;
    online?: string;
    time?: string;
    brewery?: string;
  };
  channelUsername?: string;
}

interface StoredBugReport {
  id: string;
  createdAt: string;
  category: string;
  subject: string;
  description: string;
  testerContact?: string;
  diagnostics?: any;
  telegramSent: boolean;
  telegramMessageId?: number;
  telegramError?: string;
}

const recentBugReports: StoredBugReport[] = [];

/**
 * Автоматическая отправка багрепорта напрямую в официальный канал @mastervarka
 */
telegramRouter.post('/send-bug-report', async (req: Request<{}, {}, BugReportBody>, res: Response) => {
  const {
    botToken,
    category = 'bug',
    subject = '',
    description = '',
    testerContact = '',
    diagnostics,
    channelUsername = '@mastervarka'
  } = req.body;

  if (!description && !subject) {
    return res.status(400).json({
      success: false,
      error: 'Необходимо указать тему или описание проблемы'
    });
  }

  // Нормализация имени канала (по умолчанию @mastervarka)
  let cleanChatId = channelUsername.trim();
  const urlMatch = cleanChatId.match(/(?:t\.me|telegram\.me)\/(?:s\/)?([a-zA-Z0-9_]{3,})/i);
  if (urlMatch && urlMatch[1]) {
    cleanChatId = `@${urlMatch[1]}`;
  } else if (/^[a-zA-Z0-9_]{3,}$/.test(cleanChatId) && !cleanChatId.startsWith('@')) {
    cleanChatId = `@${cleanChatId}`;
  }

  const categoryIcons: Record<string, { label: string; icon: string }> = {
    bug: { label: 'Ошибка / Баг', icon: '🐞' },
    feature: { label: 'Идея / Предложение', icon: '💡' },
    brewery: { label: 'Пивоварня & Wi-Fi', icon: '⚡' },
    ingredients: { label: 'Ингредиенты / Солода', icon: '🌾' },
    other: { label: 'Обратная связь', icon: '💬' }
  };

  const catMeta = categoryIcons[category] || { label: 'Обратная связь', icon: '💬' };

  const escapeHtml = (text: string) => {
    return (text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  // Формирование структурированного сообщения в формате HTML для Telegram
  let htmlMessage = `🍺 <b>[МастерВарка Бета] ${catMeta.icon} ${catMeta.label}</b>\n\n`;

  if (subject.trim()) {
    htmlMessage += `📌 <b>Тема:</b> ${escapeHtml(subject.trim())}\n\n`;
  }

  htmlMessage += `📝 <b>Описание:</b>\n${escapeHtml(description.trim() || 'Описание не заполнено')}\n\n`;

  if (testerContact.trim()) {
    htmlMessage += `👤 <b>Контакт тестера:</b> ${escapeHtml(testerContact.trim())}\n\n`;
  }

  if (diagnostics) {
    htmlMessage += `📱 <b>Диагностика устройства:</b>\n`;
    if (diagnostics.appVersion) htmlMessage += `• Версия: <code>${escapeHtml(diagnostics.appVersion)}</code>\n`;
    if (diagnostics.os) htmlMessage += `• ОС: <code>${escapeHtml(diagnostics.os)}</code> (${diagnostics.isMobile ? 'мобильное' : 'десктоп'})\n`;
    if (diagnostics.screen) htmlMessage += `• Экран: <code>${escapeHtml(diagnostics.screen)}</code>\n`;
    if (diagnostics.online) htmlMessage += `• Сеть: <code>${escapeHtml(diagnostics.online)}</code>\n`;
    if (diagnostics.brewery) htmlMessage += `• Автоматика: <code>${escapeHtml(diagnostics.brewery)}</code>\n`;
    if (diagnostics.time) htmlMessage += `• Время: <code>${escapeHtml(diagnostics.time)}</code>\n`;
    htmlMessage += `\n`;
  }

  htmlMessage += `<i>Отправлено автоматически через МастерВарка v1.0.34</i>\n`;
  htmlMessage += `#багрепорт #бетатест #v1_0_34`;

  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const storedRecord: StoredBugReport = {
    id: reportId,
    createdAt: new Date().toISOString(),
    category,
    subject,
    description,
    testerContact,
    diagnostics,
    telegramSent: false
  };

  const rawToken = botToken?.trim() || process.env.TELEGRAM_BOT_TOKEN?.trim() || '';

  // Если токен бота не задан, сохраняем локально на сервере и возвращаем понятную инструкцию
  if (!rawToken) {
    recentBugReports.unshift(storedRecord);
    if (recentBugReports.length > 100) recentBugReports.pop();

    return res.json({
      success: false,
      savedLocally: true,
      needToken: true,
      reportId,
      error: 'Для автоматической публикации требуется токен Telegram-бота (от @BotFather). Добавьте бота администратором в канал @mastervarka с правом публикации сообщений.'
    });
  }

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${rawToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: htmlMessage,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
      signal: AbortSignal.timeout(10000)
    });

    const data = await telegramRes.json();

    if (!telegramRes.ok || !data.ok) {
      storedRecord.telegramError = data.description || 'Ошибка Telegram API';
      recentBugReports.unshift(storedRecord);
      if (recentBugReports.length > 100) recentBugReports.pop();

      return res.status(400).json({
        success: false,
        savedLocally: true,
        reportId,
        telegramError: data.description,
        error: `Telegram отклонил отправку в ${cleanChatId}: ${data.description || 'Ошибка доступа'}. Убедитесь, что бот добавлен в канал @mastervarka как администратор с правом публикации.`
      });
    }

    storedRecord.telegramSent = true;
    storedRecord.telegramMessageId = data.result?.message_id;
    recentBugReports.unshift(storedRecord);
    if (recentBugReports.length > 100) recentBugReports.pop();

    return res.json({
      success: true,
      savedLocally: true,
      reportId,
      messageId: data.result?.message_id,
      channel: cleanChatId,
      channelTitle: data.result?.chat?.title || cleanChatId,
      sentAt: new Date().toISOString()
    });
  } catch (err: any) {
    storedRecord.telegramError = err.message || 'Сетевой таймаут';
    recentBugReports.unshift(storedRecord);
    if (recentBugReports.length > 100) recentBugReports.pop();

    return res.status(500).json({
      success: false,
      savedLocally: true,
      reportId,
      error: `Ошибка сети при связи с Telegram: ${err.message || 'Таймаут соединения'}`
    });
  }
});

/**
 * Получение последних сохраненных багрепортов
 */
telegramRouter.get('/bug-reports', (_req: Request, res: Response) => {
  res.json({
    success: true,
    count: recentBugReports.length,
    reports: recentBugReports
  });
});

