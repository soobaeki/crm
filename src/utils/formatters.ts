import dayjs from "dayjs";

export function formatPhone(phone: string): string {
  // 숫자만 남기기
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("02")) {
    // 서울 전화번호: 02-123-4567, 02-1234-5678
    return digits.length === 9
      ? digits.replace(/(\d{2})(\d{3})(\d{4})/, "$1-$2-$3")
      : digits.replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3");
  } else {
    // 일반 전화 or 휴대전화
    return digits.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3");
  }
}

// YYYYMMDD → YYYY-MM-DD
export const yyyymmddToDashed = (yyyymmdd: string) => {
  return dayjs(yyyymmdd, "YYYYMMDD").format("YYYY-MM-DD");
};

// YYYY-MM-DD → YYYYMMDD
export const dashedToYyyymmdd = (dashedDate: string) => {
  return dayjs(dashedDate, "YYYY-MM-DD").format("YYYYMMDD");
};

// XXXXX -> XX,XXX
export function formatNumber(
  value: number | string | undefined | null,
): string {
  if (value == null || value === "") return "-"; // 값 없으면 "-" 표시
  const num = typeof value === "number" ? value : Number(value);
  if (isNaN(num)) return "-"; // 숫자로 변환 불가면 "-"
  return num.toLocaleString("ko-KR");
}

// Date -> YYYY-MM-DD
export function formatDate(date?: Date | null) {
  return date ? date.toISOString().split("T")[0] : null;
}

// XXX-XXXX-XXXX -> XXXXXXXXXXX
export function removeDash(value: number | string | undefined | null): string {
  if (value === null || value === undefined) return "";

  const str = typeof value === "string" ? value : String(value);

  // 숫자만 남기기
  const digits = str.replace(/\D/g, "");

  return digits;
}

// 행안부 API 응답 및 최종 리턴을 위한 주소 결과 인터페이스 정의
export interface JusoResult {
  roadAddress: string; // 정제 및 상세주소(호수)가 결합된 최종 도로명 주소
  jibunAddress: string; // 행안부 공식 지번 주소
  zipCode: string; // 5자리 우편번호
}

/**
 * [주소명 변환 및 상세주소 결합 함수]
 * 원본 날것의 주소를 받아 행안부 API로 도로명 주소를 찾고,
 * 원본에 있던 동·호수(상세주소)를 안전하게 추출하여 뒤에 합쳐서 반환합니다.
 * * @param address 원본 주소 (예: "서울시 서대문구 연희동 200번지 101호")
 * @returns {Promise<JusoResult | null>} 정제된 주소 객체 또는 null
 */
export async function convertToRoadAddress(
  keyword: string,
): Promise<JusoResult | null> {
  try {
    const confirmKey = process.env.JUSO_CONFIRM_KEY;

    if (!confirmKey) {
      throw new Error(
        "행안부 API 승인키(JUSO_CONFIRM_KEY)가 .env에 설정되지 않았습니다.",
      );
    }

    if (!keyword || keyword.trim() === "") {
      return null;
    }

    // =================================================================
    // 🧼 [1단계] 행안부 API가 헤매지 않도록 검색어 키워드 전처리
    // =================================================================
    const rawAddress = keyword.trim();
    const words = rawAddress.split(/\s+/);

    // 주소 뒤쪽에 붙은 상세주소 때문에 검색 실패하는 것을 막기 위해
    // 앞자리 4단어(시/구/동/번지)만 떼서 검색어로 사용합니다.
    const searchKeyword =
      words.length > 4 ? words.slice(0, 4).join(" ") : rawAddress;

    // =================================================================
    // 📡 [2단계] 행안부 API 백엔드 대 백엔드(Server-to-Server) 호출
    // =================================================================
    const url = new URL("https://business.juso.go.kr/addrlink/addrLinkApi.do");
    url.searchParams.append("confmKey", confirmKey);
    url.searchParams.append("currentPage", "1");
    url.searchParams.append("countPerPage", "1"); // 가장 정확한 매칭 1건만 요청
    url.searchParams.append("keyword", searchKeyword);
    url.searchParams.append("resultType", "json");

    const response = await fetch(url.toString(), { method: "GET" });

    if (!response.ok) {
      throw new Error(`행안부 API 응답 에러: ${response.status}`);
    }

    const data = await response.json();
    const jusoList = data.results?.juso;

    // =================================================================
    // ✂️ [3단계] 검색 성공 시 상세주소(동·호수) 추출 및 최종 도로명 조합
    // =================================================================
    if (jusoList && jusoList.length > 0) {
      const roadAddress = jusoList[0].roadAddr; // 예: "서울특별시 서대문구 연희로25길 3"
      const jibunAddress = jusoList[0].jibunAddr || searchKeyword; // 예: "서울특별시 서대문구 연희동 200"
      const zipCode = jusoList[0].zipNo; // 우편번호

      let detailAddress = rawAddress;
      const jibunWords = jibunAddress.split(/\s+/);

      // ① 공식 지번 주소에 포함된 단어들을 원본 주소에서 싹 도려냅니다.
      jibunWords.forEach((word: string) => {
        detailAddress = detailAddress.replace(word, "");

        // '번지' 글자가 붙어있거나 쪼개져 있을 때를 대비한 누수 방지 제거
        const cleanWord = word.replace(/번지/g, "");
        if (cleanWord) {
          detailAddress = detailAddress.replace(cleanWord, "");
        }
      });

      // 특수문자 및 불필요한 '번지' 텍스트 찌꺼기 청소
      detailAddress = detailAddress.replace(/[,.-]/g, "").replace(/번지/g, "");

      // ② 👑 [안전장치] 글자가 과하게 지워져서 호수가 증발한 경우 예외 처리
      // 원본에는 '호'나 '층'이 있었는데 detailAddress가 비어버렸다면 맨 뒷단어를 강제로 복구합니다.
      if (
        !detailAddress &&
        (rawAddress.includes("호") || rawAddress.includes("층"))
      ) {
        const rawWords = rawAddress.split(/\s+/);
        const lastWord = rawWords[rawWords.length - 1];

        // 맨 마지막 단어가 지번 주소에 포함되지 않은 독립된 호수 문자열인지 검증
        if (
          lastWord.endsWith("호") ||
          lastWord.endsWith("층") ||
          !jibunAddress.includes(lastWord)
        ) {
          detailAddress = lastWord;
        }
      }

      // ③ 최종 완성: 공식 도로명 주소 뒤에 살아남은 상세 주소(호수)가 있다면 예쁘게 한 칸 띄고 결합
      const finalRoadAddress =
        detailAddress && detailAddress !== roadAddress
          ? `${roadAddress} ${detailAddress}`
          : roadAddress;

      return {
        roadAddress: finalRoadAddress,
        jibunAddress: jibunAddress,
        zipCode: zipCode,
      };
    }

    // 행안부 검색 결과가 아예 없는 경우 null 반환
    return null;
  } catch (error) {
    console.error(`[주소 변환 에러] 원본주소: ${keyword} ->`, error);
    return null;
  }
}
