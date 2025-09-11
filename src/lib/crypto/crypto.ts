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

  console.log("decrypted11", decrypted);

  return decrypted.toString(CryptoJS.enc.Utf8);
}
