/**
 * Безопасный парсинг, санация и восстановление JSON из ответов ИИ-моделей (Google Gemini).
 * Предотвращает ошибки SyntaxError при обрезке токенов, markdown-разметке,
 * висячих запятых и неэкранированных символах.
 */

export function cleanJsonString(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let str = raw.trim();

  // Удаляем Markdown-блоки кодовой разметки (```json ... ``` или ``` ...)
  str = str.replace(/^```(?:json)?\s*/i, '');
  str = str.replace(/\s*```$/i, '');

  const fenceMatch = str.match(/```(?:json)?([\s\S]*?)```/i);
  if (fenceMatch) {
    str = fenceMatch[1].trim();
  }

  // Находим первую '{' или '['
  const firstBrace = str.indexOf('{');
  const firstBracket = str.indexOf('[');
  let startIdx = -1;
  let endChar = '';

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endChar = '}';
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endChar = ']';
  }

  if (startIdx !== -1) {
    const lastEnd = str.lastIndexOf(endChar);
    if (lastEnd > startIdx) {
      str = str.substring(startIdx, lastEnd + 1);
    } else {
      str = str.substring(startIdx);
    }
  }

  return str.trim();
}

/**
 * Восстанавливает синтаксис JSON при обрыве потока генерации (truncation by maxOutputTokens)
 * или наличии частых синтаксических погрешностей языковых моделей.
 */
export function repairJsonString(input: string): string {
  let s = cleanJsonString(input);
  if (!s) return '{}';

  // 1. Удаляем висячие запятые перед закрывающими фигурными и квадратными скобками
  s = s.replace(/,\s*([\]}])/g, '$1');

  // 2. Отслеживаем незакрытые строки и баланс скобок
  let inString = false;
  let isEscaped = false;
  const stack: ('{' | '[')[] = [];

  for (let i = 0; i < s.length; i++) {
    const char = s[i];

    if (inString) {
      if (char === '\\' && !isEscaped) {
        isEscaped = true;
      } else if (char === '"' && !isEscaped) {
        inString = false;
      } else {
        isEscaped = false;
      }
    } else {
      if (char === '"') {
        inString = true;
      } else if (char === '{' || char === '[') {
        stack.push(char);
      } else if (char === '}') {
        if (stack.length > 0 && stack[stack.length - 1] === '{') {
          stack.pop();
        }
      } else if (char === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === '[') {
          stack.pop();
        }
      }
    }
  }

  // Если строка осталась незакрытой (оборвана на полуслове)
  if (inString) {
    s += '"';
  }

  // Убираем висячие двоеточия или незаконченные значения в конце
  s = s.replace(/:\s*$/, ': null');
  // Убираем висячие запятые в конце
  s = s.replace(/,\s*$/, '');

  // Закрываем все незакрытые скобки в обратном порядке
  while (stack.length > 0) {
    const openChar = stack.pop();
    if (openChar === '{') s += '}';
    else if (openChar === '[') s += ']';
  }

  // Повторно очищаем возможные висячие запятые после добавления скобок
  s = s.replace(/,\s*([\]}])/g, '$1');

  return s;
}

/**
 * Безопасно парсит ответ модели, выполняя многоуровневое восстановление структуры.
 * Никогда не выбрасывает исключение SyntaxError наружу.
 */
export function safeParseAiJson<T>(raw: string, fallback: T): T {
  if (!raw || typeof raw !== 'string') {
    return fallback;
  }

  // Уровень 1: Стандартный парсинг очищенной строки
  const cleaned = cleanJsonString(raw);
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object') {
      return parsed as T;
    }
  } catch {
    // Переход ко второму уровню
  }

  // Уровень 2: Парсинг после восстановления синтаксиса и балансировки скобок
  try {
    const repaired = repairJsonString(raw);
    const parsed = JSON.parse(repaired);
    if (parsed && typeof parsed === 'object') {
      return parsed as T;
    }
  } catch {
    // Переход к третьему уровню
  }

  // Уровень 3: Обрезка до последней известной запятой и восстановление
  try {
    let truncated = cleaned;
    const lastComma = truncated.lastIndexOf(',');
    if (lastComma > 0) {
      truncated = truncated.substring(0, lastComma);
      const repaired = repairJsonString(truncated);
      const parsed = JSON.parse(repaired);
      if (parsed && typeof parsed === 'object') {
        return parsed as T;
      }
    }
  } catch {
    // Не удалось восстановить
  }

  return fallback;
}
