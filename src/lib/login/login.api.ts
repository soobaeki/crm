import { Admin, AdminFormInput } from "@/types/admin";
import { callApi } from "../core";

/**
 * 로그인
 *
 * @param loginId  로그인아이디
 * @param password 패스워드
 * @returns
 */
export async function loginInfo(
  loginId: string,
  password: string,
  role?: string,
): Promise<{
  loginId: string;
  password: string;
  role: string;
}> {
  const res = await callApi<
    {
      loginId: string;
      password: string;
      role: string;
    },
    {
      loginId: string;
      password: string;
      role: string;
    }
  >("/api/admin/login", "POST", { loginId, password, role: role || "" });

  return res.data!;
}

/**
 * 로그인
 *
 * @param loginId  로그인아이디
 * @param password 패스워드
 * @returns
 */
export async function logoutInfo() {
  const res = await callApi<null, null>("/api/admin/logout", "POST");
  return res.data!;
}

/**
 * 회원가입
 *
 * @param loginId 로그인ID
 * @param password 패스워드
 * @param role 역할
 * @returns
 */
export async function signupAdmin(
  loginId: string,
  password: string,
  role: string,
) {
  const res = await callApi<
    {
      loginId: string;
      password: string;
      role: string;
    },
    Admin
  >("/api/admin/signup", "POST", { loginId, password, role });

  return res;
}

/**
 * 회원수정
 *
 * @param formData 회원정보
 * @returns
 */
export async function updateAdmin(formData: Admin) {
  const res = await callApi<AdminFormInput, Admin>(
    `/api/admin/${formData.id}`,
    "PATCH",
    formData,
  );

  return res;
}
