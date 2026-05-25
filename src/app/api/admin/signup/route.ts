import { NextRequest, NextResponse } from "next/server";
import { createAdminAccount } from "@/lib/login/login.server";

export async function POST(req: NextRequest) {
  try {
    const { loginId, password, role } = await req.json();

    // 1. 필수값 체크
    if (!loginId || !password) {
      return NextResponse.json(
        { success: false, message: "아이디와 비밀번호를 입력해주세요." },
        { status: 400 },
      );
    }

    // 2. 중복 아이디 확인 (이미 있는 관리자인지)
    const existingAdmin = await createAdminAccount(loginId, password, role);

    return NextResponse.json({
      success: true,
      message: "관리자 계정이 성공적으로 생성되었습니다.",
      data: { id: existingAdmin.id, name: existingAdmin.admin_name },
    });
  } catch (error: any) {
    console.log(`[POST] ${req.url} : `, error);

    return NextResponse.json(
      { success: false, message: error.message || "서버 내부 오류" },
      { status: 500 },
    );
  }
}
