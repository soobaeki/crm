import { Prisma, customers } from "@prisma/client/edge";
import { Customer, CustomerFormInput } from "@/types/customer";
import { encrypt } from "@/lib/crypto/crypto";
import { prisma } from "@/lib/prisma";
import { safeDecrypt } from "@/utils/crypto";

// GET 메서드: 고객 목록 조회
export async function getCustomers(
  startDate?: string,
  endDate?: string,
): Promise<Customer[]> {
  const where: Prisma.customersWhereInput = {
    created_at: {
      ...(startDate ? { gte: new Date(startDate) } : {}),
      ...(endDate ? { lte: new Date(endDate) } : {}),
    },
  };

  const customers: customers[] = await prisma.customers.findMany({ where });

  // 복호화 처리
  return customers.map((customer) => ({
    id: customer.id,
    customerName: safeDecrypt(customer.customer_name) ?? "",
    nickName: customer.nick_name ?? "",
    homePhone: safeDecrypt(customer.home_phone) ?? "",
    mobilePhone: safeDecrypt(customer.mobile_phone) ?? "",
    address: customer.address ?? "",
    createdAt: customer.created_at?.toISOString() ?? "",
  }));
}

// POST 메서드: 고객 등록
export async function postCustomer(data: CustomerFormInput) {
  const { customerName, homePhone, mobilePhone, address } = data;
  return await prisma.customers.create({
    data: {
      customer_name: encrypt(
        customerName,
        process.env.ENCRYPT_SECRET_KEY ?? "",
      ),
      nick_name: customerName,
      home_phone: homePhone,
      // home_phone: encrypt(homePhone, process.env.ENCRYPT_SECRET_KEY ?? ""),
      mobile_phone: mobilePhone,
      // mobile_phone: encrypt(
      //   mobilePhone,
      //   process.env.ENCRYPT_SECRET_KEY ?? "",
      // ),
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
    createdAt: issue.created_at?.toLocaleDateString("ko-KR"),
    status: issue.status,
    priority: issue.priority,
    handledBy: issue.handled_by,
    handledAt: issue.handled_at?.toLocaleDateString("ko-KR"),
    handlerNote: issue.handler_note,
  }));

  return result;
}
