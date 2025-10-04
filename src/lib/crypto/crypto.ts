import crypto from "crypto";
import CryptoJS from "crypto-js";
import { isAes256Cipher } from "@/utils/crypto";

// 랜덤 32바이트 (256비트) 키 생성
// const randomKey CryptoJS.lib.WordArray.random(32);
// const SECRET_KEY = randomKey.toString(CryptoJS.enc.Hex);
// const SECRET_KEY = process.env.ENCRYPT_SECRET_KEY ?? "";

// 랜덤 16바이트 (128비트) IV 생성
const randomIv = CryptoJS.lib.WordArray.random(16);
const IV = randomIv.toString(CryptoJS.enc.Hex);

// AES-256 CBC 암호화
export function encrypt(text: string, key: string): string {
  if (key.trim() === "")
    throw new Error("환경변수 ENCRYPT_SECRET_KEY가 필요합니다.");

  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv: CryptoJS.enc.Utf8.parse(IV),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString();
}

// 복호화
export function decrypt(cipherText: string, key: string): string {
  if (cipherText.trim() === "") throw new Error("암호화된 값이 없습니다.");

  // 암호문 여부 확인
  if (!isAes256Cipher(cipherText)) {
    return cipherText;
  }

  const decrypted = CryptoJS.AES.decrypt(cipherText, key, {
    iv: CryptoJS.enc.Utf8.parse(IV),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}

// AES-256-GCM 상수
const KEY_LENGTH = 32; // 32 bytes = 256 bits
const IV_LENGTH = 12; // 12 bytes recommended for GCM
const TAG_LENGTH = 16; // 16 bytes auth tag

/**
 * AES-256-GCM 암호화
 * @param plainText - 암호화할 문자열
 * @param key - 32바이트 Buffer
 * @param keyVersion - 키 버전 (디폴트 1)
 * @returns base64 인코딩된 암호문
 */
export function encryptGCM(
  plainText: string,
  key: Buffer,
  keyVersion = 1,
): string {
  if (!Buffer.isBuffer(key) || key.length !== KEY_LENGTH) {
    throw new Error("Key must be a 32-byte Buffer");
  }

  // IV 생성
  const iv = crypto.randomBytes(IV_LENGTH);

  // 암호화
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv, {
    authTagLength: TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  // 저장 포맷: [1 byte keyVersion][12 bytes IV][16 bytes TAG][ciphertext]
  const header = Buffer.from([keyVersion & 0xff]);
  const payload = Buffer.concat([header, iv, tag, encrypted]);

  return payload.toString("base64");
}

/**
 * AES-256-GCM 복호화
 * @param payloadB64 - encryptGCM로 암호화된 문자열
 * @param getKeyByVersion - keyVersion으로 key를 가져오는 함수
 * @returns 복호화된 문자열
 */
export function decryptGCM(
  payloadB64: string,
  getKeyByVersion: (version: number) => Buffer | null,
): string {
  // Base64 -> Buffer
  const payload = Buffer.from(payloadB64, "base64");

  // 최소 길이 검증
  if (payload.length < 1 + IV_LENGTH + TAG_LENGTH) {
    throw new Error("Invalid payload: too short");
  }

  // payload 분리
  const keyVersion = payload.readUInt8(0);
  const iv = Buffer.from(payload.subarray(1, 1 + IV_LENGTH));
  const tag = Buffer.from(
    payload.subarray(1 + IV_LENGTH, 1 + IV_LENGTH + TAG_LENGTH),
  );
  const ciphertext = Buffer.from(payload.subarray(1 + IV_LENGTH + TAG_LENGTH));

  // key 가져오기
  const key = getKeyByVersion(keyVersion);
  if (!key || key.length !== 32) {
    throw new Error(
      `Key for version ${keyVersion} not found or invalid length`,
    );
  }

  // 복호화
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv, {
    authTagLength: TAG_LENGTH,
  });
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
