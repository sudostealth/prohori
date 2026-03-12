/**
 * lib/encryption.ts
 * AES-256-GCM encryption using Node.js built-in crypto module.
 * Replaces the weak XOR cipher previously used for Wazuh password storage.
 *
 * IMPORTANT: Set WAZUH_ENCRYPTION_KEY in .env.local to a strong 32+ char secret.
 * Existing records encrypted with the old XOR cipher must be re-saved.
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;     // 128-bit IV
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TAG_LENGTH = 16;    // 128-bit auth tag (reserved for future use)

function getKey(): Buffer {
  const raw = process.env.WAZUH_ENCRYPTION_KEY || 'prohori-default-encryption-key-change-me!';
  // Pad / truncate to exactly 32 bytes for AES-256
  return Buffer.from(raw.padEnd(32, '0').slice(0, 32), 'utf8');
}

/**
 * Encrypts plaintext using AES-256-GCM.
 * @returns base64-encoded string in format: `iv:authTag:ciphertext`
 */
export function encrypt(text: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

/**
 * Decrypts a value produced by `encrypt()`.
 * Falls back gracefully for legacy XOR-encrypted values (returns empty string).
 */
export function decrypt(encryptedValue: string): string {
  try {
    const parts = encryptedValue.split(':');

    // Legacy XOR format: only one colon-separated segment (base64 has no colons)
    if (parts.length !== 3) {
      console.warn('[encryption] Legacy XOR-encrypted value detected — returning empty string. Re-save the connection to upgrade encryption.');
      return '';
    }

    const [ivB64, tagB64, dataB64] = parts;
    const key = getKey();
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(tagB64, 'base64');
    const encryptedData = Buffer.from(dataB64, 'base64');

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (err) {
    console.error('[encryption] Failed to decrypt value:', err);
    return '';
  }
}
