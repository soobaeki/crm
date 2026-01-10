/**
 * 객체를 URL QueryString 형태로 변환하는 유틸 함수
 *
 * - undefined / null / "" 값은 자동으로 제외
 * - 배열 값은 key=value1&key=value2 형태로 변환
 *
 * @param params 쿼리 파라미터로 변환할 객체
 * @returns URLSearchParams 문자열 (ex: "a=1&b=2")
 */
export function toQueryString(params: Record<string, any>) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    // 값이 없으면 (undefined, null, empty) 파라미터 제외
    if (value === undefined || value === null || value === "") return;

    // 배열이면 동일 key로 여러 값 append
    if (Array.isArray(value)) {
      value.forEach((v) => search.append(key, String(v)));
    } else {
      // 단일 값은 그대로 append
      search.append(key, String(value));
    }
  });

  return search.toString();
}
