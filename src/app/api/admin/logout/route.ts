import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    {
      success: true,
      message: "로그아웃 되었습니다.",
    },
    { status: 200 },
  );

  // response 객체에 보안 쿠키(HttpOnly) 세팅
  response.cookies.set("token", "", {
    httpOnly: true, // 자바스크립트로 쿠키 탈취 불가능하게 방어 (보안 필수)
    secure: process.env.NODE_ENV === "production", // 프로덕션(HTTPS)에서만 true, 로컬은 false 가능
    sameSite: "lax", // CSRF 공격 방어
    path: "/", // 전체 경로에서 쿠키 접근 가능
    maxAge: 0, // 0으로 만들어서 로그아웃 시키기
  });

  return response;
}
