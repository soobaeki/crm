import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createAdminAccount, loginInfo } from "@/lib/login/login.server";

export async function POST(req: NextRequest) {
  try {
    const { loginId, password, role } = await req.json();

    if (!loginId || !password) {
      return NextResponse.json(
        { success: false, message: "아이디와 비밀번호를 모두 입력해주세요." },
        { status: 400 },
      );
    }

    let admin = await loginInfo(loginId, password, role);
    let isNewUser = false;

    if (admin) {
      const isPasswordMatch = await bcrypt.compare(
        password,
        admin.password_hash,
      );

      if (!isPasswordMatch) {
        return NextResponse.json(
          { success: false, message: "비밀번호가 일치하지 않습니다." },
          { status: 401 },
        );
      }

      console.log("기존 관리자 로그인 성공: ", admin.admin_name);
    } else {
      console.log("존재하지 않는 계정입니다. 회원가입을 진행합니다.");

      const hashedPassword = await bcrypt.hash(password, 10);

      admin = await createAdminAccount(loginId, hashedPassword, role);

      isNewUser = true;
    }

    const currentAdminId = admin.admin_name;
    const currentAdminRole = admin.role;

    // 2. 가입 완료되었으니 즉시 자동 로그인을 위한 JWT 토큰 생성
    const token = jwt.sign(
      { id: currentAdminId, role: currentAdminRole },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }, // 토큰 유효기간 1일
    );

    // 3. 클라이언트에 보낼 기본 JSON 응답 생성
    const response = NextResponse.json(
      {
        success: true,
        message: isNewUser
          ? "회원가입 및 로그인에 성공했습니다."
          : "로그인에 성공했습니다.",
        data: {
          loginId: currentAdminId,
          role: currentAdminRole,
        },
      },
      { status: 200 },
    );

    // response 객체에 보안 쿠키(HttpOnly) 세팅
    response.cookies.set("token", token, {
      httpOnly: true, // 자바스크립트로 쿠키 탈취 불가능하게 방어 (보안 필수)
      secure: process.env.NODE_ENV === "production", // 프로덕션(HTTPS)에서만 true, 로컬은 false 가능
      sameSite: "lax", // CSRF 공격 방어
      path: "/", // 전체 경로에서 쿠키 접근 가능
      maxAge: 60 * 60 * 24, // 쿠키 수명: 1일 (초 단위)
    });

    return response;
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: "서버 내부 오류" }, { status: 500 });
  }
}
