import { RowData } from "@/types/excel";
import { IExcelSearchFilter } from "@/types/filter";
import { prisma } from "@/lib/prisma";

export async function postUploadExcelServer(rows: RowData[]) {
  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      // 고객 조회 또는 생성
      if (!row.customerName || !row.mobilePhone) {
        throw new Error(
          `고객 정보 부족: 주문자와 휴대전화는 필수입니다. row id=${row.id}`,
        );
      }

      let customer = await tx.customers.findUnique({
        where: { mobile_phone: row.mobilePhone },
      });

      if (!customer) {
        customer = await tx.customers.create({
          data: {
            customer_name: row.customerName,
            mobile_phone: row.mobilePhone,
            home_phone: row.homePhone ?? null,
            address: row.address ?? null,
          },
        });
      }

      if (!row.weight) {
        throw new Error(`상품 무게 없음: ${row.item}`);
      }

      // 상품 조회
      const product = await tx.products.findFirst({
        where: {
          name: {
            contains: row.item ?? "",
          },
          weight: row.weight,
        },
      });

      if (!product) throw new Error(`상품 없음: ${row.item} / ${row.weight}kg`);

      // DB 기준 계산 금액
      const calculatedTotal = (row.quantity ?? 0) * product.price;

      // 최종 금액 확정
      const totalAmount = row.paymentAmount ?? calculatedTotal;

      // 주문 생성
      const order = await tx.orders.create({
        data: {
          customer_id: customer.id,
          order_date: row.orderDate ? new Date(row.orderDate) : new Date(),
          orderer_name: row.customerName ?? customer.customer_name,
          total_amount: totalAmount,
        },
      });

      // 주문 상세(order_items) 생성
      await tx.order_items.create({
        data: {
          order_id: order.id,
          product_id: product.id,
          product_name_snapshot: product.name, // snapshot
          unit_price_snapshot: product.price,
          quantity: row.quantity,
          line_total: totalAmount,
          discount: 0,
          tax: 0,
        },
      });

      // 배송지 생성
      await tx.shipping_address.create({
        data: {
          order_id: order.id,
          recipient_name: row.customerName ?? customer.customer_name,
          recipient_phone: row.mobilePhone ?? customer.mobile_phone,
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
    }
  });
}

export async function getSearchExcelListServer(params: IExcelSearchFilter) {
  return await prisma.$transaction(async (tx) => {
    const orders = await tx.orders.findMany({
      where: {
        AND: [
          params.startDate
            ? { order_date: { gte: new Date(params.startDate) } }
            : {},
          params.endDate
            ? { order_date: { lte: new Date(params.endDate) } }
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
      order.order_items.forEach((item) => {
        rowData.push({
          id: order.id,
          orderDate: order.order_date?.toISOString().split("T")[0] ?? null,
          item: item.product_name_snapshot,
          weight: item.products?.weight ?? null,
          quantity: item.quantity,
          address: order.customer.address,
          homePhone: order.customer.home_phone,
          mobilePhone: order.customer.mobile_phone,
          customerName: order.customer.customer_name,
          paymentAmount: order.total_amount,
          paymentDate:
            order.updated_at?.toISOString().split("T")[0] ??
            new Date().toISOString().split("T")[0],
          payer: order.customer.nick_name,
          notes: order.customer.address,
        });
      });
    });

    return rowData;
  });
}
