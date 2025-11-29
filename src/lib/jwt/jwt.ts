import jwt from "jsonwebtoken";

// JWT 발급
const token = jwt.sign(
  { id: 123, role: "superadmin" }, // payload
  process.env.ENCRYPT_SECRET_KEY, // 비밀 키
  { expiresIn: "2h" }, // 만료 시간
);

console.log(token);

// JWT 검증
const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log(decoded); // { id: 123, role: 'superadmin', iat: ..., exp: ... }
