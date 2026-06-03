import { NextRequest, NextResponse } from "next/server";
import { RowData } from "@/types/excel";
import { ApiResponse } from "@/lib/core";
import { convertToRoadAddress } from "@/lib/excel/excel.server";

// 클린 주소 변환
export async function POST(request: NextRequest) {
  try {
    const rows: RowData[] = await request.json();

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json(
        { success: false, message: "올바른 배열 형식이 아닙니다.", data: null },
        { status: 400 },
      );
    }

    /* ================================================================= */
    /* 👑 [수정] 배열을 반복문 돌면서 server.ts의 단일 변환 함수를 호출합니다. */
    /* ================================================================= */
    const excelUpload: RowData[] = await Promise.all(
      rows.map(async (row) => {
        // 엑셀 행에 주소 값이 없으면 변환하지 않고 그대로 반환
        if (!row.address) return row;

        // 원본 주소 임시 보관 (예: "서울시 서대문구 연희동 200번지 101호")
        const rawAddress = row.address.trim();

        // 1. 단어들을 공백 기준으로 쪼갭니다. ["서울시", "서대문구", "연희동", "200번지", "101호"]
        const words = rawAddress.split(/\s+/);

        // 2. 행안부 API가 상세주소 때문에 헷갈려하지 않도록, 앞의 4단어(시/구/동/번지)만 떼서 검색어로 씁니다.
        // 만약 전체 단어가 4개보다 적으면 원본 그대로 씁니다.
        const searchKeyword =
          words.length > 4 ? words.slice(0, 4).join(" ") : rawAddress;

        // 3. server.ts에 만든 함수 호출 (정제용 키워드 전송)
        const result = await convertToRoadAddress(searchKeyword);

        // 💡 result가 존재하고, 최소한 roadAddress가 잘 내려왔는지 체크
        if (result && result.roadAddress) {
          const roadAddress = result.roadAddress;

          // 백엔드 함수가 jibunAddress를 안 줄 경우를 대비해 안전장치 채우기
          // 만약 없으면 검색어로 썼던 키워드를 대용으로 씁니다.
          const jibunAddress = (result as any).jibunAddress || searchKeyword;
          // roadAddress : "서울특별시 서대문구 연희로25길 3"
          // jibunAddress: "서울특별시 서대문구 연희동 200"

          // 4. 🔥 [핵심] 원본 주소에서 행안부가 준 지번 주소(시/구/동/번지) 부분을 통째로 지워버립니다.
          // 지우고 남은 찌꺼기 글자가 바로 "101호" 또는 "다인빌 102호" 같은 상세 주소가 됩니다!
          // 3. 🔥 원본 주소에서 검색에 사용된 구역(지번) 단어들을 제거하여 상세주소만 추출
          let detailAddress = rawAddress;
          const jibunWords = jibunAddress.split(/\s+/);

          jibunWords.forEach((word: string) => {
            const cleanWord = word.replace(/번지/g, "");
            detailAddress = detailAddress
              .replace(word, "")
              .replace(cleanWord, "");
          });

          // 앞뒤 공백 및 불필요한 '번지' 텍스트 청소
          detailAddress = detailAddress.replace(/번지/g, "").trim();

          // 5. 최종 완성: 공식 도로명 주소 뒤에 살아남은 상세 주소를 합쳐줍니다.
          const finalAddress = detailAddress
            ? `${roadAddress} ${detailAddress}`
            : roadAddress;

          return {
            ...row,
            address: finalAddress, // 👑 "서울시 서대문구 연희로25길 3 101호" 완성!
          };
        }

        // 행안부 검색에 아예 실패했다면 원본 데이터를 유지합니다.
        return row;
      }),
    );

    // 최종 정제 완료된 배열(excelUpload)을 응답 데이터에 실어 보냅니다.
    const response: ApiResponse<RowData[]> = {
      success: true,
      message: "엑셀 주소 최신화에 성공했습니다.",
      data: excelUpload,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.log(`[POST] ${request.url} : `, error);

    const response: ApiResponse<null> = {
      success: false,
      message: "엑셀 주소 최신화에 실패했습니다.",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
