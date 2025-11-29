import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

test("zzz", () => {
  const secretKeyHex = process.env.ENCRYPT_SECRET_KEY;
  if (!secretKeyHex) throw new Error("ENCRYPT_SECRET_KEY 필요");

  const key = Buffer.from(secretKeyHex, "hex"); // 32바이트여야 함

  // JWT 발급
  const token = jwt.sign(
    { id: 123, role: "superadmin" }, // payload
    key, // 비밀 키
    { expiresIn: "2h" }, // 만료 시간
  );

  console.log(token);

  // JWT 검증
  const decoded = jwt.verify(token, key);
  console.log(decoded); // { id: 123, role: 'superadmin', iat: ..., exp: ... }
});
