"use client";

import { Customer } from "@/types/customer";

export default function CustomerModal({ customer }: { customer: Customer }) {
  const fields = [
    { label: "고객명", value: customer.customerName },
    { label: "닉네임", value: customer.nickName || "-" },
    { label: "전화번호", value: customer.homePhone || "-" },
    { label: "휴대전화", value: customer.mobilePhone },
    { label: "주소", value: customer.address || "-" },
    {
      label: "가입일",
      value: customer.createdAt
        ? new Date(customer.createdAt).toLocaleDateString()
        : "-",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 기본 정보 섹션 */}
      <dl className="border-border grid grid-cols-2 gap-x-6 gap-y-4 border-b pb-6">
        {fields.map((field) => (
          <div key={field.label} className="form-field">
            <dt className="form-label text-muted-foreground!">{field.label}</dt>
            <dd className="text-foreground font-medium">{field.value}</dd>
          </div>
        ))}
      </dl>

      {/* 여기에 나중에 주문 히스토리 테이블을 추가하기 딱 좋습니다! */}
      <div className="mt-4">
        <h4 className="mb-3 text-sm font-bold">최근 주문 내역</h4>
        {/* <ViewTable columns={...} data={...} /> */}
        <div className="bg-muted-bg/30 text-muted-foreground rounded-xl py-8 text-center text-sm">
          주문 내역이 없습니다.
        </div>
      </div>
    </div>
  );
}
