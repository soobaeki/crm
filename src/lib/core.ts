export async function callApi<TReq = unknown, TRes = unknown>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  body?: TReq,
): Promise<ApiResponse<TRes>> {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  // GET body 사용 X
  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);

  let json: ApiResponse<TRes>;
  try {
    json = await res.json();
  } catch {
    throw new Error("서버 응답 파싱 실패");
  }

  // 👑 핵심 수정: res.ok가 아닐 때 서버가 준 에러 메시지를 우선 사용!
  if (!res.ok) {
    // 서버가 { error: "수정 권한이 없습니다." } 라고 보내면 그걸 그대로 던집니다.
    const errorMessage = json?.error || json?.message || "API 요청 실패";
    const error = new Error(errorMessage);
    (error as any).status = res.status; // 👈 상태 코드(403 등)를 에러 객체에 부착
    throw error;
  }

  if (!json.success) {
    throw new Error(json?.message || "API 요청 실패");
  }

  return json;
}

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
  error?: string;
};
