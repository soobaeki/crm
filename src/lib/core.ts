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

  if (!res.ok || !json.success) {
    throw new Error(json?.message || "API 요청 실패");
  }

  return json;
}

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};
