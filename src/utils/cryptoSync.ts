/**
 * E2E (End-to-End) шифрование данных синхронизации с использованием Web Crypto API (AES-GCM-256 + PBKDF2).
 * Данные шифруются на клиенте перед отправкой в облако. Сервер видит только зашифрованный ciphertext и IV.
 */

// Генерация производного ключа AES-256 из кода синхронизации (PBKDF2)
async function deriveKey(passcode: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passcode),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Зашифровать полезную нагрузку
 */
export async function encryptPayload(data: any, passcode: string): Promise<{ ciphertext: string; iv: string; salt: string; isEncrypted: boolean }> {
  try {
    if (!window.crypto || !window.crypto.subtle) {
      console.warn('Web Crypto API is not available, falling back to unencrypted transport');
      return { ciphertext: JSON.stringify(data), iv: '', salt: '', isEncrypted: false };
    }

    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passcode, salt);

    const enc = new TextEncoder();
    const encodedData = enc.encode(JSON.stringify(data));

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    const ciphertext = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
    const ivStr = btoa(String.fromCharCode(...iv));
    const saltStr = btoa(String.fromCharCode(...salt));

    return {
      ciphertext,
      iv: ivStr,
      salt: saltStr,
      isEncrypted: true
    };
  } catch (err) {
    console.error('Failed to encrypt payload:', err);
    return { ciphertext: JSON.stringify(data), iv: '', salt: '', isEncrypted: false };
  }
}

/**
 * Расшифровать полезную нагрузку
 */
export async function decryptPayload(encryptedContainer: any, passcode: string): Promise<any> {
  // Если данные пришли в незашифрованном виде (обратная совместимость)
  if (!encryptedContainer || !encryptedContainer.isEncrypted || !encryptedContainer.ciphertext) {
    return encryptedContainer?.ciphertext ? JSON.parse(encryptedContainer.ciphertext) : encryptedContainer;
  }

  try {
    const salt = Uint8Array.from(atob(encryptedContainer.salt), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(encryptedContainer.iv), c => c.charCodeAt(0));
    const cipherBytes = Uint8Array.from(atob(encryptedContainer.ciphertext), c => c.charCodeAt(0));

    const key = await deriveKey(passcode, salt);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipherBytes
    );

    const dec = new TextDecoder();
    const jsonString = dec.decode(decryptedBuffer);
    return JSON.parse(jsonString);
  } catch (err) {
    console.error('Failed to decrypt payload:', err);
    throw new Error('Неверный код доступа или поврежденные зашифрованные данные');
  }
}
