import { prisma } from "@/lib/prisma";
import type { customers, Prisma } from "@prisma/client";
import { Customer, CustomerFormInput } from "@/types/customer";
import { encrypt } from "@/lib/crypto/crypto";
import { safeDecrypt } from "@/utils/crypto";

// GET 메서드: 고객 목록 조회
export async function getCustomers(
  startDate?: string,
  endDate?: string,
): Promise<Customer[]> {
  const where: Prisma.customersWhereInput = {};
  where.created_at = {};

  if (startDate) where.created_at.gte = new Date(startDate);
  if (endDate) where.created_at.lte = new Date(endDate);

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
