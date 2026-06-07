import { RowData, SkippedRow } from "@/types/excel";
import { IExcelSearchFilter } from "@/types/filter";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPhone } from "@/utils/formatters";
import { decryptGCM, encryptGCM } from "../crypto/crypto";

export async function postUploadExcelServer(rows: RowData[]) {
  const skippedRows: SkippedRow[] = [];
  let successCount = 0;

  console.log(
    `\n============ 🚀 엑셀 업로드 시작 (총 ${rows.length}개 행) ============`,
  );

  // =================================================================
  // 🧼 [1단계] 엑셀 자체에서 중복되는 고객 '동일인' 필터링
  // =================================================================
  const uniqueRowsMap = new Map<string, RowData>();
  for (const row of rows) {
    if (!row.customerName || !row.mobilePhone) continue;
    const cleanName = row.customerName.trim();
    const cleanMobile = row.mobilePhone.replace(/[^0-9]/g, "");
    const key = `${cleanName}_${cleanMobile}`;

    if (!uniqueRowsMap.has(key)) {
      uniqueRowsMap.set(key, row);
    }
  }

  // =================================================================
  // 💾 [2단계 DB 트랜잭션]
  // 👑 타임아웃을 30초로 늘려 대량 암복호화 시 터지는 현상을 방지합니다.
  // =================================================================
  await prisma.$transaction(
    async (tx) => {
      // 과거 DB 유저 긁어오기
      const dbCustomers = await tx.customers.findMany();
      const decryptedDbCustomerMap = new Map<string, any>();

      for (const dbCust of dbCustomers) {
        try {
          const decryptedName = decryptGCM(dbCust.customer_name ?? "").trim();
          const decryptedMobile = decryptGCM(dbCust.mobile_phone ?? "").replace(
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

      const activeCustomerMap = new Map<string, any>();

      // 🔄 2-1. 고객 먼저 일괄 처리
      for (const [customerKey, row] of uniqueRowsMap.entries()) {
        const cleanName = row.customerName!.trim();
        const cleanMobile = row.mobilePhone!.replace(/[^0-9]/g, "");

        let customer = decryptedDbCustomerMap.get(customerKey);

        if (!customer) {
          customer = await tx.customers.create({
            data: {
              customer_name: encryptGCM(cleanName),
              nick_name: row.payer?.trim() || cleanName,
              mobile_phone: encryptGCM(cleanMobile),
              home_phone: encryptGCM(
                row.homePhone?.replace(/[^0-9]/g, "") || "",
              ),
              address: encryptGCM(row.address?.trim() || ""),
            },
          });
        }
        activeCustomerMap.set(customerKey, customer);
      }

      // =================================================================
      // 🔄 2-2. [주문서 일괄 생성] 엑셀 원본 순회
      // =================================================================
      let index = 0;
      for (const row of rows) {
        index++;
        try {
          if (!row.customerName || !row.mobilePhone) {
            skippedRows.push({
              rowId: row.id ?? null,
              reason: "고객 정보 누락",
              row,
            });
            console.log(
              `❌ [${index}번째 행] 패스 이유: 고객 이름 또는 폰번호 누락`,
            );
            continue;
          }

          const cleanName = row.customerName.trim();
          const cleanMobile = row.mobilePhone.replace(/[^0-9]/g, "");
          const customerKey = `${cleanName}_${cleanMobile}`;

          const customer = activeCustomerMap.get(customerKey);
          if (!customer) {
            skippedRows.push({
              rowId: row.id ?? null,
              reason: "고객 매칭 실패",
              row,
            });
            console.log(
              `❌ [${index}번째 행] 패스 이유: 내부 맵에서 고객 매칭 실패 (${cleanName})`,
            );
            continue;
          }

          if (row.weight === undefined || row.weight === null) {
            skippedRows.push({
              rowId: row.id ?? null,
              reason: "상품 무게 정보 누락",
              row,
            });
            console.log(
              `❌ [${index}번째 행] 패스 이유: 엑셀에 무게(weight)가 기입되지 않음`,
            );
            continue;
          }

          if (!row.item) {
            skippedRows.push({
              rowId: row.id ?? null,
              reason: "상품명 미기입",
              row,
            });
            console.log(
              `❌ [${index}번째 행] 패스 이유: 엑셀에 상품명(item)이 기입되지 않음`,
            );
            continue;
          }

          // =================================================================
          // 🔍 [개선된 상품 매칭 엔진 + 디버그 로그 수집]
          // =================================================================
          const excelItemRaw = row.item.trim();
          const cleanExcelItem = excelItemRaw.replace(/[()_+\-]/g, " ");
          const itemKeywords = cleanExcelItem.split(/\s+/).filter(Boolean);

          // DB에서 해당 무게를 가진 상품 전량 수집
          const sameWeightProducts = await tx.products.findMany({
            where: {
              weight: Number(row.weight),
              is_active: true,
            },
          });

          // 이름 매칭 시도
          const product = sameWeightProducts.find((p) => {
            const dbName = p.name.toLowerCase();

            return itemKeywords.some((keyword) => {
              const cleanKeyword = keyword.toLowerCase();

              // 1. 완벽하게 일치하거나 한쪽이 포함되면 무조건 패스
              if (
                dbName.includes(cleanKeyword) ||
                cleanKeyword.includes(dbName)
              ) {
                return true;
              }

              // 2. "배추A"를 "배A"로 줄여 쓴 경우 보정
              if (cleanKeyword[0] === dbName[0]) {
                const excelSuffix = cleanKeyword.slice(1);
                const dbSuffix = dbName.slice(1);

                if (excelSuffix && dbSuffix.includes(excelSuffix)) {
                  return true;
                }
              }

              return false;
            });
          });

          if (!product) {
            const dbProductNames = sameWeightProducts
              .map((p) => p.name)
              .join(", ");
            skippedRows.push({
              rowId: row.id ?? null,
              reason: `상품 매칭 실패 (무게는 맞으나 이름 불일치)`,
              row,
            });
            console.log(`❌ [${index}번째 행] 상품 매칭 실패!`);
            console.log(
              `   └─ 사용자가 엑셀에 쓴 품목명: "${excelItemRaw}" (무게: ${row.weight}kg)`,
            );
            console.log(
              `   └─ DB에 등록된 ${row.weight}kg짜리 상품 목록: [${dbProductNames || "없음"}]`,
            );
            continue;
          }
          // =================================================================

          // 금액 계산
          const calculatedTotal = (row.quantity ?? 0) * product.price;
          const totalAmount = row.paymentAmount ?? calculatedTotal;

          // 날짜 처리
          let safeOrderDate = new Date();
          if (row.orderDate && typeof row.orderDate === "string") {
            const parts = row.orderDate.split("-").map(Number);
            if (parts.length === 3) {
              const [y, m, d] = parts;
              safeOrderDate = new Date(y, m - 1, d, 12, 0, 0);
            }
          }

          // 👑 [수정 포인트] 안쪽의 중복 prisma.$transaction을 완전 걷어내고
          // 상위 바구니인 `tx`를 그대로 사용하여 외래키 위반(P2003) 에러를 원천 차단합니다.

          // 주문 생성
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

          // 요청사항 생성
          if (row.notes) {
            await tx.customer_requests.create({
              data: {
                customer_id: customer.id,
                content: row.notes,
              },
            });
          }

          successCount++;
          console.log(
            `✅ [${index}번째 행] DB 저장 완료 -> 주문번호: ${order.id} / 고객: ${cleanName} / 상품: ${product.name}`,
          );
        } catch (error: any) {
          console.error(`💥 [${index}번째 행] 예상치 못한 크래시 발생!`, error);
          skippedRows.push({
            rowId: row.id ?? null,
            reason:
              error.code === "P2000"
                ? "DB 컬럼 길이 초과"
                : (error?.message ?? "알 수 없는 에러"),
            row,
          });
          continue;
        }
      }
    },
    {
      timeout: 30000, // 👑 [수정 포인트] 큰 트랜잭션 바구니의 만료 시간을 30초로 넉넉하게 확장!
    },
  );

  console.log(
    `\n============ 🏁 업로드 종료 (성공: ${successCount}개 / 실패: ${skippedRows.length}개) ============`,
  );

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

    orders.forEach((order) => {
      try {
        // 암호화된 컬럼들 완전 해제(복호화)
        const decCustomerName = decryptGCM(order.customer.customer_name || "");
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
            homePhone: formatPhone(decHome),
            mobilePhone: formatPhone(decMobile),
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
