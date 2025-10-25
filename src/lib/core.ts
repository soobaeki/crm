export async function callApi<TReq = unknown>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: TReq,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.message || "API 요청 실패");
  }

  return res;
}
