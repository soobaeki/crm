import { decrypt } from "@/lib/crypto/crypto";

/**
 * AES256 복호화 함수
 * @param value 복호화할 암호문
 * @returns
 */
export function safeDecrypt(value: string | null): string | null {
  if (!value) return null;
  try {
    return decrypt(value, process.env.ENCRYPT_SECRET_KEY!);
  } catch {
    return value; // 이미 복호화 되어 있거나 잘못된 값
  }
}

/**
 * AES256 암호문인지 판별하는 함수
 * @param value 확인할 문자열
 * @param key 암호화 키 (256bit, 32글자)
 * @param iv 초기화 벡터 (옵션, CBC 모드일 때 필요)
 */
export function isAes256Cipher(value: string): boolean {
  if (!value || typeof value !== "string") return false;

  // base64 형식 검사
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  if (!base64Regex.test(value)) return false;

  try {
    const decoded = CryptoJS.enc.Base64.parse(value);
    // AES 블록 크기(16 byte)의 배수인지 체크
    return decoded.sigBytes % 16 === 0;
  } catch {
    return false;
  }
}
