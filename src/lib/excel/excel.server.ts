import { RowData, SkippedRow } from "@/types/excel";
import { IExcelSearchFilter } from "@/types/filter";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/utils/formatters";
import { decryptGCM, encryptGCM } from "../crypto/crypto";

export async function postUploadExcelServer(rows: RowData[]) {
  const skippedRows: SkippedRow[] = [];
  let successCount = 0;

  // =================================================================
  // 🧼 [1단계 전처리] 엑셀 자체에서 중복되는 고객 '동일인' 필터링 (비동기 꼬임 원천 차단)
  // =================================================================
  const uniqueRowsMap = new Map<string, RowData>();
  for (const row of rows) {
    if (!row.customerName || !row.mobilePhone) continue;
    const cleanName = row.customerName.trim();
    const cleanMobile = row.mobilePhone.replace(/[^0-9]/g, "");
    const key = `${cleanName}_${cleanMobile}`;

    // 엑셀에 동일인이 아무리 많아도 고객 정보는 최초 1번만 기준 삼음
    if (!uniqueRowsMap.has(key)) {
      uniqueRowsMap.set(key, row);
    }
  }

  // =================================================================
  // 💾 [2단계 DB 트랜잭션]
  // =================================================================
  await prisma.$transaction(async (tx) => {
    // 과거 DB에 있던 유저들 싹 긁어와서 복호화 매칭 맵 생성
    const dbCustomers = await tx.customers.findMany();
    const decryptedDbCustomerMap = new Map<string, any>();

    for (const dbCust of dbCustomers) {
      try {
        const decryptedName = decryptGCM(dbCust.customer_name).trim();
        const decryptedMobile = decryptGCM(dbCust.mobile_phone).replace(
          /[^0-9]/g,
          "",
        );
        decryptedDbCustomerMap.set(
          `${decryptedName}_${decryptedMobile}`,
          dbCust,
        );
      } catch (error) {
        continue;
      }
    }

    // 👑 이번 트랜잭션 안에서 생성 완료된 고객들을 담을 최종 저장소
    const activeCustomerMap = new Map<string, any>();

    // 🔄 2-1. [고객 먼저 일괄 처리] 중복 없는 고유 고객 리스트만 먼저 싹 생성/조회 해둡니다.
    for (const [customerKey, row] of uniqueRowsMap.entries()) {
      const cleanName = row.customerName!.trim();
      const cleanMobile = row.mobilePhone!.replace(/[^0-9]/g, "");

      // 과거 DB에 있던 사람인지 확인
      let customer = decryptedDbCustomerMap.get(customerKey);

      // 없다면 여기서 단 한 번만 생성! (강명자가 3번 연속 와도 여기서 딱 1번만 빌드됨)
      if (!customer) {
        customer = await tx.customers.create({
          data: {
            customer_name: encryptGCM(cleanName),
            nick_name: encryptGCM(row.payer?.trim() || cleanName),
            mobile_phone: encryptGCM(cleanMobile),
            home_phone: encryptGCM(row.homePhone?.replace(/[^0-9]/g, "") || ""),
            address: encryptGCM(row.address?.trim() || ""),
          },
        });
      }

      // 활성화된 고객 저장소에 완벽히 킵!
      activeCustomerMap.set(customerKey, customer);
    }

    // =================================================================
    // 🔄 2-2. [주문서 일괄 생성] 이제 진짜 엑셀 원본 rows를 돌며 orders를 만듭니다!
    // =================================================================
    for (const row of rows) {
      try {
        if (!row.customerName || !row.mobilePhone) {
          skippedRows.push({
            rowId: row.id ?? null,
            reason: "고객 정보 누락",
            row,
          });
          continue;
        }

        const cleanName = row.customerName.trim();
        const cleanMobile = row.mobilePhone.replace(/[^0-9]/g, "");
        const customerKey = `${cleanName}_${cleanMobile}`;

        // 👑 위에서 이미 완벽하게 준비된 고유 고객 객체를 낚아챕니다. (절대 비동기가 안 꼬임)
        const customer = activeCustomerMap.get(customerKey);
        if (!customer) {
          skippedRows.push({
            rowId: row.id ?? null,
            reason: "고객 매칭 실패",
            row,
          });
          continue;
        }

        if (!row.weight) {
          skippedRows.push({
            rowId: row.id ?? null,
            reason: "상품 무게 없음",
            row,
          });
          continue;
        }

        // 상품 조회
        const product = await tx.products.findFirst({
          where: {
            name: { contains: row.item ?? "" },
            weight: row.weight,
          },
        });

        if (!product) {
          skippedRows.push({
            rowId: row.id ?? null,
            reason: `상품 없음: ${row.item} / ${row.weight}kg`,
            row,
          });
          continue;
        }

        const calculatedTotal = (row.quantity ?? 0) * product.price;
        const totalAmount = row.paymentAmount ?? calculatedTotal;

        let safeOrderDate = new Date();
        if (row.orderDate && typeof row.orderDate === "string") {
          const parts = row.orderDate.split("-").map(Number);
          if (parts.length === 3) {
            const [y, m, d] = parts;
            safeOrderDate = new Date(y, m - 1, d, 12, 0, 0);
          }
        }

        // 👑 주문 생성 쿼리 (이제 정상적으로 찍힐 것입니다!)
        const order = await tx.orders.create({
          data: {
            customer_id: customer.id,
            order_date: safeOrderDate,
            orderer_name: encryptGCM(cleanName),
            total_amount: totalAmount,
          },
        });

        // 주문 상세 생성
        await tx.order_items.create({
          data: {
            order_id: order.id,
            product_id: product.id,
            product_name_snapshot: product.name,
            unit_price_snapshot: product.price,
            quantity: row.quantity || 0,
            line_total: totalAmount,
            discount: 0,
            tax: 0,
          },
        });

        // 배송지 생성
        await tx.shipping_address.create({
          data: {
            order_id: order.id,
            recipient_name: encryptGCM(cleanName),
            recipient_phone: encryptGCM(cleanMobile),
            address_line1: row.address ?? "",
          },
        });

        // 고객 요청사항 생성
        if (row.notes) {
          await tx.customer_requests.create({
            data: {
              customer_id: customer.id,
              content: row.notes,
            },
          });
        }

        successCount++;
      } catch (error: any) {
        skippedRows.push({
          rowId: row.id ?? null,
          reason:
            error.code === "P2000"
              ? "DB 컬럼 길이 초과"
              : (error?.message ?? "알 수 없는 오류"),
          row,
        });
        continue;
      }
    }
  });

  return {
    total: rows.length,
    successCount,
    skippedCount: skippedRows.length,
    skippedRows,
  };
}

export async function getSearchExcelListServer(params: IExcelSearchFilter) {
  return await prisma.$transaction(async (tx) => {
    const orders = await tx.orders.findMany({
      where: {
        AND: [
          params.startDate
            ? {
                order_date: {
                  gte: new Date(params.startDate + "T00:00:00.000Z"),
                },
              }
            : {},
          params.endDate
            ? {
                order_date: {
                  lte: new Date(params.endDate + "T23:59:59.999Z"),
                },
              }
            : {},
          params.searchText
            ? {
                OR: [
                  {
                    customer: {
                      customer_name: { contains: params.searchText },
                    },
                  },
                  { customer: { nick_name: { contains: params.searchText } } },
                  { orderer_name: { contains: params.searchText } },
                  { customer: { address: { contains: params.searchText } } },
                ],
              }
            : {},
          params.item
            ? {
                order_items: {
                  some: { product_name_snapshot: { contains: params.item } },
                },
              }
            : {},
          params.weight
            ? {
                order_items: {
                  some: { products: { weight: params.weight } },
                },
              }
            : {},
        ],
      },
      include: {
        customer: true,
        order_items: { include: { products: true } },
      },
    });

    // order_items별로 RowData 생성
    const rowData: RowData[] = [];

    // orders.forEach((order) => {
    //   order.order_items.forEach((item) => {
    //     rowData.push({
    //       id: order.id,
    //       orderDate: formatDate(order.order_date),
    //       item: item.product_name_snapshot,
    //       weight: item.products?.weight ?? null,
    //       quantity: item.quantity,
    //       address: order.customer.address,
    //       homePhone: order.customer.home_phone,
    //       mobilePhone: order.customer.mobile_phone,
    //       customerName: order.customer.customer_name,
    //       paymentAmount: order.total_amount,
    //       paymentDate: formatDate(order.updated_at),
    //       payer: order.customer.nick_name,
    //       notes: order.customer.address,
    //     });
    //   });
    // });

    orders.forEach((order) => {
      try {
        // 암호화된 컬럼들 완전 해제(복호화)
        const decCustomerName = decryptGCM(order.customer.customer_name);
        const decNickName = decryptGCM(order.customer.nick_name || "");
        const decAddress = decryptGCM(order.customer.address || "");
        const decOrdererName = decryptGCM(order.orderer_name || "");
        const decMobile = decryptGCM(order.customer.mobile_phone || "");
        const decHome = decryptGCM(order.customer.home_phone || "");

        // 🔍 사용자가 검색 텍스트를 친 경우 필터링 검사
        if (params.searchText) {
          const search = params.searchText.trim();
          const matchName = decCustomerName.includes(search);
          const matchNick = decNickName.includes(search);
          const matchOrderer = decOrdererName.includes(search);
          const matchAddress = decAddress.includes(search);

          // 하나도 일치하는 필드가 없다면 화면 목록에서 제외(스킵)합니다.
          if (!matchName && !matchNick && !matchOrderer && !matchAddress) {
            return;
          }
        }

        // 복호화가 끝난 이쁜 데이터를 엑셀 UI 규격 배열에 주입
        order.order_items.forEach((item) => {
          // 상품명 필터
          if (
            params.item &&
            !item.product_name_snapshot.includes(params.item)
          ) {
            return;
          }
          // 무게 필터
          if (params.weight && item.products?.weight !== params.weight) {
            return;
          }

          rowData.push({
            id: order.id,
            orderDate: formatDate(order.order_date),
            item: item.product_name_snapshot,
            weight: item.products?.weight ?? null,
            quantity: item.quantity,
            // 👑 화면단에 깨끗한 평문으로 복호화된 결과물을 전달합니다!
            address: decAddress,
            homePhone: decHome,
            mobilePhone: decMobile,
            customerName: decCustomerName,
            paymentAmount: order.total_amount,
            paymentDate: formatDate(order.updated_at),
            payer: decNickName,
            notes: decAddress,
          });
        });
      } catch (error) {
        console.error("데이터 조회 복호화 중 에러 발생:", error);
      }
    });

    return rowData;
  });
}

interface JusoResult {
  roadAddress: string; // 정제된 도로명 주소
  zipCode: string; // 우편번호
}

// 주소명 변환
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
    // 💡 행안부 API가 요구하는 필수 파라미터 조립 (JSON 반환 요청)
    const url = new URL("https://business.juso.go.kr/addrlink/addrLinkApi.do");
    url.searchParams.append("confmKey", confirmKey);
    url.searchParams.append("currentPage", "1");
    url.searchParams.append("countPerPage", "1"); // 가장 정확한 딱 1건만 필요
    url.searchParams.append("keyword", keyword);
    url.searchParams.append("resultType", "json");

    // 백엔드 대 백엔드로 행안부 서버 호출
    const response = await fetch(url.toString(), { method: "GET" });

    if (!response.ok) {
      throw new Error(`행안부 API 응답 에러: ${response.status}`);
    }

    const data = await response.json();
    const jusoList = data.results?.juso;

    // 검색 결과가 존재하면 매칭률이 가장 높은 첫 번째 주소 정보 반환
    if (jusoList && jusoList.length > 0) {
      return {
        roadAddress: jusoList[0].roadAddr, // 전체 도로명 주소
        zipCode: jusoList[0].zipNo, // 우편번호 (5자리)
      };
    }

    // 검색 결과가 없는 경우
    return null;
  } catch (error) {
    console.error(`[주소 변환 에러] 키워드: ${keyword} ->`, error);
    return null;
  }
}
