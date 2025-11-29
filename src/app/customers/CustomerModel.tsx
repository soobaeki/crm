"use client";

//////////////////////
// import
//////////////////////
import React from "react";
import { Customer } from "@/types/customer";
import Modal from "@/components/commons/Modal";

//////////////////////
// types / interfaces
//////////////////////
interface IProps {
  customer: Customer | null;
  onClose: () => void;
}

//////////////////////
// component start
//////////////////////
export default function CustomerModal({ customer, onClose }: IProps) {
  if (!customer) return null;

  //////////////////////
  // data
  //////////////////////
  const fields = [
    ["고객명", customer.customerName],
    ["닉네임", customer.nickName || "-"],
    ["전화번호", customer.homePhone || "-"],
    ["휴대전화번호", customer.mobilePhone],
    ["주소", customer.address || "-"],
    [
      "가입일",
      customer.createdAt
        ? new Date(customer.createdAt).toLocaleDateString()
        : "-",
    ],
  ];

  //////////////////////
  // render (JSX)
  //////////////////////
  return (
    <Modal
      type="customer"
      isOpen={!!customer}
      title={`${customer.customerName} 고객 세부정보`}
      onClose={onClose}
    >
      {/* 여기 내용만 교체 가능 */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[15px] leading-6 text-gray-700">
        {fields.map(([label, value]) => (
          <React.Fragment key={label}>
            <dt className="font-semibold text-gray-600">{label}</dt>
            <dd>{value}</dd>
          </React.Fragment>
        ))}
      </dl>
    </Modal>
  );
}
