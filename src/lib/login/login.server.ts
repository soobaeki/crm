import bcrypt from "bcrypt";
import { AdminFormInput } from "@/types/admin";
import { prisma } from "@/lib/prisma";

// 로그인 정보
export async function loginInfo(
  loginId: string,
  password: string,
  role?: string,
) {
  const admin = await prisma.admins.findUnique({
    where: { admin_name: loginId },
  });

  if (!admin) return null;

  return admin;
}

// id 중복확인
export async function createAdminAccount(
  loginId: string,
  password: string,
  role: string = "staff",
) {
  // 1. 중복확인
  const existing = await prisma.admins.findUnique({
    where: { admin_name: loginId },
  });

  if (existing) {
    throw new Error("이미 존재하는 아이디입니다.");
  }

  // 2. 비밀번호 암호화
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. DB 저장
  return await prisma.admins.create({
    data: {
      admin_name: loginId,
      password_hash: hashedPassword,
      role: role as any,
    },
  });
}

// PATCH 메서드: 회원 수정
export async function updateAdmin(data: AdminFormInput) {
  const { id, adminName, password, role } = data;

  // 1. 업데이트할 데이터를 담을 객체 생성
  const updateData: any = {
    admin_name: adminName,
    role: role,
  };

  // 2. 비밀번호가 입력되었다면 암호화 처리
  if (password && password.trim() !== "") {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    updateData.password_hash = hashedPassword;
  }

  return await prisma.admins.update({
    where: { id: id },
    data: updateData,
  });
}
