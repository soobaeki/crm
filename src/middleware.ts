import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // 1. 저장된 토큰(쿠키) 가져오기
  const token = request.cookies.get("token")?.value;

  // 2. 현재 요청이 어디로 가는지 확인
  const { pathname } = request.nextUrl;

  console.log("이동하려는 주소:", pathname, "토큰 상태:", !!token);

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/customers") ||
    pathname.startsWith("/admin");

  // 3. 로그인이 안 됐는데 대시보드 등 보호된 페이지로 가려고 할 때
  // (로그인 페이지 자체나 API 경로는 제외해야 무한 루프에 안빠짐)
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. 이미 로그인이 됐는데 로그인 페이지로 가려고 할 때
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// 미들웨어가 실행될 경로 지정
export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/products/:path*",
    "/customers/:path*",
    "/admin/:path*",
    "/login",
  ],
};
