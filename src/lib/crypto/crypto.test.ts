import dotenv from "dotenv";
import { decrypt, encrypt } from "../crypto/crypto";

dotenv.config();

test("암호화-복호화 테스트", () => {
  const plain = "홍길동";
  const encrypted = encrypt(plain, process.env.ENCRYPT_SECRET_KEY ?? "");
  console.log("encrypted", encrypted);
  const decrypted = decrypt(encrypted, process.env.ENCRYPT_SECRET_KEY ?? "");
  console.log("decrypted", decrypted);

  expect(decrypted).toBe(plain);
});
