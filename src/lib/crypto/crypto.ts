//////////////////////
// import
//////////////////////
import crypto from "crypto";

/* -------------------------------------------------------------------------- */
/*                               GCM CONSTANTS                                */
/* -------------------------------------------------------------------------- */

const KEY_LENGTH = 32; // 32 bytes = 256 bits
const IV_LENGTH = 12; // 권장 GCM nonce size
const TAG_LENGTH = 16; // Auth Tag length (128bit)

/* -------------------------------------------------------------------------- */
/*                             Key Rotation Map                               */
/* -------------------------------------------------------------------------- */

const KEY_MAP: Record<number, Buffer> = {
  1: Buffer.from(process.env.ENCRYPT_KEY_V1!, "base64"),
  2: Buffer.from(process.env.ENCRYPT_KEY_V2!, "base64"),
  3: Buffer.from(process.env.ENCRYPT_KEY_V3!, "base64"),
  4: Buffer.from(process.env.ENCRYPT_KEY_V4!, "base64"),
  5: Buffer.from(process.env.ENCRYPT_KEY_V5!, "base64"),
} as const;

const CURRENT_KEY_VERSION = Number(process.env.CURRENT_KEY_VERSION ?? 3);
if (!KEY_MAP[CURRENT_KEY_VERSION]) {
  throw new Error(
    `Current key version ${CURRENT_KEY_VERSION} not found in KEY_MAP`,
  );
}

export function getKeyByVersion(version: number): Buffer | null {
  return KEY_MAP[version] ?? null;
}

/* -------------------------------------------------------------------------- */
/*                             AES-256-GCM: Encrypt                           */
/* -------------------------------------------------------------------------- */

/**
 * AES-256-GCM 암호화
 * - Node.js crypto 기반
 * - 인증 태그(Auth Tag) 포함 (무결성 검증)
 * - 저장 포맷: [1 byte keyVersion][12 bytes IV][16 bytes TAG][ciphertext]
 *
 * @param plainText 암호화할 문자열
 * @returns Base64 인코딩된 payload
 * @throws {Error} 키가 없거나 길이가 32바이트가 아닐 경우
 */
export function encryptGCM(plainText: string): string {
  // 현재 버전 키 가져오기
  const key = getKeyByVersion(CURRENT_KEY_VERSION);
  if (!Buffer.isBuffer(key) || key.length !== KEY_LENGTH) {
    throw new Error("Key must be a 32-byte Buffer");
  }

  // IV 생성 (12바이트, GCM 권장)
  const iv = crypto.randomBytes(IV_LENGTH);

  // 암호화
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv, {
    authTagLength: TAG_LENGTH,
  });
  const ciphertext = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  // 인증 태그 추출
  const authTag = cipher.getAuthTag();

  // payload 구성: [keyVersion][IV][AuthTag][Ciphertext]
  const header = Buffer.from([CURRENT_KEY_VERSION & 0xff]); // keyVersion은 1바이트
  const payload = Buffer.concat([header, iv, authTag, ciphertext]);

  // Base64로 인코딩하여 반환
  return payload.toString("base64");
}

/* -------------------------------------------------------------------------- */
/*                             AES-256-GCM: Decrypt                           */
/* -------------------------------------------------------------------------- */

/**
 * AES-256-GCM 복호화
 * -  payload의 keyVersion을 기준으로 키를 검색
 * - 인증 태그(Auth Tag) 검증 → 데이터 위조 감지 가능
 * - payload 포맷: [1 byte keyVersion][12 bytes IV][16 bytes AuthTag][ciphertext]
 *
 * @param payloadB64 encryptGCM 결과(Base64 문자열)
 * @returns 복호화된 문자열
 * @throws {Error} payload 형식 오류, 키 미존재, 인증 태그 검증 실패 등
 */
export function decryptGCM(payloadB64: string): string {
  // Base64 → Buffer 변환
  const payload = Buffer.from(payloadB64, "base64");

  // 최소 길이 검증  (keyVersion 1 + IV 12 + Tag 16)
  if (payload.length < 1 + IV_LENGTH + TAG_LENGTH) {
    throw new Error("Invalid payload: too short");
  }

  // payload 분리
  const keyVersion = payload.readUInt8(0); // 첫 바이트 = keyVersion
  const iv = Buffer.from(payload.subarray(1, 1 + IV_LENGTH)); // 12바이트 IV
  const authTag = Buffer.from(
    payload.subarray(1 + IV_LENGTH, 1 + IV_LENGTH + TAG_LENGTH),
  ); // 16바이트 인증 태그
  const ciphertext = Buffer.from(payload.subarray(1 + IV_LENGTH + TAG_LENGTH)); // 나머지 = 암호문

  // keyVersion 기반 키 조회
  const key = getKeyByVersion(keyVersion);
  if (!key || key.length !== KEY_LENGTH) {
    throw new Error(
      `Key for version ${keyVersion} not found or invalid length`,
    );
  }

  // 복호화
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv, {
    authTagLength: TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/* -------------------------------------------------------------------------- */
/*                             AES-256: 미사용 25.11.29                        */
/* -------------------------------------------------------------------------- */
// 랜덤 32바이트 (256비트) 키 생성
// const randomKey CryptoJS.lib.WordArray.random(32);
// const SECRET_KEY = randomKey.toString(CryptoJS.enc.Hex);
// const SECRET_KEY = process.env.ENCRYPT_SECRET_KEY ?? "";

// /**
//  * CBC 모드에서 사용할 IV.
//  * - 랜덤 16바이트 (128비트) IV 생성
//  * - 프로세스 시작 시 1회 생성됨
//  * - CBC 특성상 정적 IV는 보안상 위험할 수 있음 (필요 시 개선 필요)
//  */
// const IV = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);

// /**
//  * AES-256-CBC 암호화
//  * - 간단한 데이터 암호화 용도로 사용
//  * - CryptoJS 기반
//  * @throws key가 비어 있을 경우
//  */
// export function encrypt(text: string, key: string): string {
//   if (!key.trim()) {
//     throw new Error("환경변수 ENCRYPT_SECRET_KEY가 필요합니다.");
//   }

//   const encrypted = CryptoJS.AES.encrypt(text, key, {
//     iv: CryptoJS.enc.Utf8.parse(IV),
//     mode: CryptoJS.mode.CBC,
//     padding: CryptoJS.pad.Pkcs7,
//   });

//   return encrypted.toString();
// }

// /**
//  * AES-256-CBC 복호화
//  * - 암호문 형식이 아니면 그대로 반환 (idempotent)
//  * @throws cipherText가 비어 있을 경우
//  */
// export function decrypt(cipherText: string, key: string): string {
//   if (!cipherText.trim()) {
//     throw new Error("암호화된 값이 없습니다.");
//   }

//   // 암호문 여부 확인
//   if (!isAes256Cipher(cipherText)) {
//     return cipherText;
//   }

//   const decrypted = CryptoJS.AES.decrypt(cipherText, key, {
//     iv: CryptoJS.enc.Utf8.parse(IV),
//     mode: CryptoJS.mode.CBC,
//     padding: CryptoJS.pad.Pkcs7,
//   });

//   return decrypted.toString(CryptoJS.enc.Utf8);
// }
