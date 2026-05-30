import { Prisma, customers } from "@prisma/client/edge";
import { Customer, CustomerFormInput } from "@/types/customer";
import { prisma } from "@/lib/prisma";
import { safeDecryptGCM } from "@/utils/crypto";
import { formatDate, formatPhone } from "@/utils/formatters";
import {
  maskAddress,
  maskCreateAt,
  maskName,
  maskPhone,
} from "@/utils/masking";
import { encryptGCM } from "../crypto/crypto";

// GET 메서드: 고객 목록 조회
export async function getCustomers(
  startDate?: string,
  endDate?: string,
  searchText?: string,
): Promise<Customer[]> {
  const onlyNumberText = searchText?.replace(/[^0-9]/g, "");

  let dateFilter = null;
  if (onlyNumberText?.length === 8) {
    const year = onlyNumberText.substring(0, 4);
    const month = onlyNumberText.substring(4, 6);
    const day = onlyNumberText.substring(6, 8);

    dateFilter = {
      gte: new Date(`${year}-${month}-${day}T00:00:00.000Z`),
      lte: new Date(`${year}-${month}-${day}T23:59:59.999Z`),
    };
  }

  const where: Prisma.customersWhereInput = {
    ...((startDate || endDate) && {
      created_at: {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      },
    }),
    ...(searchText && {
      OR: [
        { customer_name: { contains: searchText } },
        { nick_name: { contains: searchText } },
        { home_phone: { contains: formatPhone(searchText) } },
        { mobile_phone: { contains: formatPhone(searchText) } },
        { address: { contains: searchText } },
        ...(dateFilter ? [{ created_at: dateFilter }] : []),
      ].filter(Boolean) as Prisma.customersWhereInput[],
    }),
  };

  const customers: customers[] = await prisma.customers.findMany({ where });

  // 복호화 처리
  return customers.map((customer, index) => ({
    index: index + 1,
    id: customer.id,
    customerName: maskName(safeDecryptGCM(customer.customer_name) ?? ""),
    nickName: maskName(customer.nick_name ?? ""),
    homePhone: maskPhone(
      formatPhone(safeDecryptGCM(customer.home_phone) ?? ""),
    ),
    mobilePhone: maskPhone(
      formatPhone(safeDecryptGCM(customer.mobile_phone) ?? ""),
    ),
    address: maskAddress(customer.address ?? ""),
    createdAt: maskCreateAt(formatDate(customer.created_at) ?? ""),
  }));
}

// POST 메서드: 고객 등록
export async function postCustomer(data: CustomerFormInput) {
  const { customerName, nickName, homePhone, mobilePhone, address } = data;

  return await prisma.customers.create({
    data: {
      customer_name: encryptGCM(customerName),
      nick_name: nickName,
      home_phone: homePhone ? encryptGCM(homePhone) : "",
      mobile_phone: mobilePhone ? encryptGCM(mobilePhone) : "",
      address,
    },
  });
}

// 총 고객 수, 30일 이내 가입자 수 조회
export async function getCustomerStats() {
  const total = await prisma.customers.count();
  const recent30Days = await prisma.customers.count({
    where: {
      created_at: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  return { total, recent30Days };
}

// 고객 기준, 주소별 고객 수
export async function getRegionCustomerCounts() {
  const regions = [
    "서울",
    "대전",
    "부산",
    "대구",
    "광주",
    "울산",
    "인천",
    "세종",
    "경기",
    "강원",
    "충북",
    "충남",
    "전북",
    "전남",
    "경북",
    "경남",
    "제주",
  ];

  const counts = await Promise.all(
    regions.map(async (region) => {
      const count = await prisma.customers.count({
        where: {
          address: { contains: region },
        },
      });
      return { region, count };
    }),
  );

  const total = await prisma.customers.count();
  const knownTotal = counts.reduce((sum, r) => sum + r.count, 0);
  const others = total - knownTotal;

  return [...counts, { region: "기타", count: others }];
}

// 고객 문의사항
export async function getCustomerIssues() {
  const issues = await prisma.customer_requests.findMany({
    include: {
      customers: true,
    },
  });

  const result = issues.map((issue) => ({
    customerName: issue.customers.customer_name,
    content: issue.content,
    createdAt: formatDate(issue.created_at),
    status: issue.status,
    priority: issue.priority,
    handledBy: issue.handled_by,
    handledAt: formatDate(issue.handled_at),
    handlerNote: issue.handler_note,
  }));

  return result;
}

// 고객의 주문 목록
export async function getCustomerOrderHistory(customerId: number) {
  const customerData = await prisma.customers.findUnique({
    where: {
      id: customerId,
    },
    include: {
      orders: {
        orderBy: {
          created_at: "desc",
        },
        include: {
          order_items: true,
        },
      },
      customer_requests: {
        orderBy: {
          created_at: "desc",
        },
      },
    },
  });

  if (!customerData) return [];

  return customerData.orders.flatMap((order) =>
    order.order_items.map((item) => ({
      id: item.id,
      orderId: order.id,
      productId: item.product_id,
      proudctNameSnapshot: item.product_name_snapshot,
      unitPriceSnapshot: item.unit_price_snapshot,
      quantity: item.quantity,
      lineTotal: item.line_total,
      discount: item.discount,
      tax: item.tax,
      createdAt: formatDate(item.created_at),
      status: order.status,
      orderDate: formatDate(order.order_date),
    })),
  );
}

// 고객 정보 수정
export async function updateCustomer(data: Partial<Customer>) {
  return await prisma.customers.update({
    where: {
      id: data.id,
    },
    data: {
      nick_name: data.nickName,
      home_phone: data.homePhone,
      mobile_phone: data.mobilePhone,
      address: data.address,
      updated_at: new Date(),
    },
  });
}
