import { randomBytes } from "crypto";
import dotenv from "dotenv";

dotenv.config();

test("Generated Base64 GCM Key", () => {
  const key = randomBytes(32);

  // key가 Buffer인지 확인
  expect(Buffer.isBuffer(key)).toBe(true);

  // 길이가 32바이트인지 확인
  expect(key.length).toBe(32);

  // Base64 변환 가능 확인
  const keyBase64 = key.toString("base64");
  expect(typeof keyBase64).toBe("string");
  expect(keyBase64.length).toBeGreaterThan(0);

  console.log("Generated Base64 GCM Key:", keyBase64);
});

// test("암호화-복호화 테스트", () => {
//   const plain = "홍길동";
//   const encrypted = encrypt(plain, process.env.ENCRYPT_SECRET_KEY ?? "");
//   console.log("encrypted", encrypted);
//   const decrypted = decrypt(encrypted, process.env.ENCRYPT_SECRET_KEY ?? "");
//   console.log("decrypted", decrypted);

//   expect(decrypted).toBe(plain);
// });

// test("GCM 테스트 with ENV KEY", () => {
//   // 환경변수에서 키 가져오기
//   const secretKeyHex = process.env.ENCRYPT_SECRET_KEY;
//   if (!secretKeyHex) throw new Error("ENCRYPT_SECRET_KEY 필요");

//   const key = Buffer.from(secretKeyHex, "hex"); // 32바이트여야 함

//   const secret = "민감데이터";

//   // 암호화
//   const encrypted = encryptGCM(secret, key, 1);

//   // 복호화
//   const decrypted = decryptGCM(encrypted, (version) =>
//     version === 1 ? key : null,
//   );

//   expect(decrypted).toBe(secret);
// });
