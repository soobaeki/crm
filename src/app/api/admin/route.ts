import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/core";
import { updateAdmin } from "@/lib/login/login.server";

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();

    const patchAdmin = await updateAdmin(data);

    const response: ApiResponse<typeof patchAdmin> = {
      success: true,
      message: "회원 수정 성공했습니다.",
      data: patchAdmin,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(`[PATCH] ${request.url} : `, error);

    const response: ApiResponse<null> = {
      success: false,
      message: "회원 수정 실패했습니다.",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
