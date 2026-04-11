"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Customer } from "@/types/customer";
import { OrderItemRow } from "@/types/order";
import { Column } from "@/types/table";
import {
  getCustomerOrderHistory,
  updateCustomer,
} from "@/lib/customer/customer.api";
import { formatPhone } from "@/utils/formatters";
import ViewModal from "../commons/ViewModal";
import ViewTable from "../commons/ViewTable";

interface IProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const orderColumns = [
  { key: "id", label: "순번", width: "70px" },
  { key: "orderId", label: "주문번호", width: "70px", hide: true },
  {
    key: "orderDate",
    label: "주문일자",
    width: "120px",
  },
  {
    key: "productNameSnapshot",
    label: "상품명",
    align: "left" as const,
  },
  {
    key: "unitPriceSnapshot",
    label: "품목가격",
    width: "120px",
    align: "right" as const,
  },
  {
    key: "quantity",
    label: "수량",
    width: "70px",
    align: "right" as const,
  },
  {
    key: "lineTotal",
    label: "금액",
    width: "120px",
    align: "right" as const,
  },
] satisfies Column<OrderItemRow>[];

export default function CustomerModal({
  customer,
  isOpen,
  onClose,
  onRefresh,
}: IProps) {
  const [formData, setFormData] = useState(customer);

  const queryClient = useQueryClient();

  // 고객 주문 목록 조회
  const {
    data: orderItems = [],
    refetch,
    isFetching,
    isLoading,
  } = useQuery<OrderItemRow[]>({
    queryKey: ["orderItems", formData.id],
    queryFn: () => getCustomerOrderHistory(formData.id),
    enabled: !!formData.id, // ID가 있을 때만 실행
  });

  // 고객 정보 수정
  const { mutate: handleUpdate } = useMutation<
    Customer,
    Error,
    Partial<Customer>
  >({
    mutationFn: () => updateCustomer(formData),
    onSuccess: (data) => {
      console.log("수정된 데이터", data);
      // 1. 성공 알림
      alert("수정되었습니다.");
      // 2. 부모 리스트 쿼리 무효화 (자동 리프레시)
      // 'customers' 키를 가진 모든 조회를 다시 불러오게 시킵니다.
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      // 3. 모달 닫기
      onClose();
      // 4. 부모창 refresh
      onRefresh();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === "homePhone" || name === "mobilePhone") {
      // 숫자만 남기기
      const onlyNums = value.replace(/[^0-9]/g, "");

      // 숫자가 11자가 넘어가면 그 뒤는 무시
      const slicedNums = onlyNums.slice(0, 11);

      // 자른 숫자로 다시 포맷팅
      finalValue = formatPhone(slicedNums);
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const fields = [
    {
      label: "고객명",
      name: "customerName",
      value: formData.customerName,
      readOnly: true,
    },
    { label: "닉네임", name: "nickName", value: formData.nickName },
    {
      label: "전화번호",
      name: "homePhone",
      value: formData.homePhone,
    },
    { label: "휴대전화", name: "mobilePhone", value: formData.mobilePhone },
    {
      label: "가입일",
      name: "createdAt",
      value: formData.createdAt
        ? new Date(formData.createdAt).toLocaleDateString()
        : "-",
      readOnly: true,
    },
    {
      label: "주소",
      name: "address",
      value: formData.address || "-",
      fullWidth: true,
    },
  ];

  return (
    <ViewModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => handleUpdate(formData)}
      title={formData.customerName ? `${formData.customerName} 님 정보` : ""}
      size="xl"
      confirmLabel="수정"
    >
      <div className="flex h-full flex-col gap-8">
        {/* 기본 정보 섹션 */}
        <section>
          <h4 className="text-primary/80 mb-5 text-sm font-bold tracking-wider uppercase">
            기본 정보
          </h4>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
            {fields.map((field) => (
              <div
                key={field.label}
                className={`form-field ${field.fullWidth ? "col-span-2" : ""}`}
              >
                <dt className="form-label">{field.label}</dt>
                {field.readOnly ? (
                  <dd className="form-display">{field.value}</dd>
                ) : (
                  <input
                    type="text"
                    name={field.name}
                    value={formData[field.name as keyof Customer] ?? ""}
                    onChange={handleChange}
                    className="form-input w-full"
                  />
                )}
              </div>
            ))}
          </dl>
        </section>

        {/* 하단 내역 섹션 */}
        <section className="flex flex-1 flex-col">
          <h4 className="text-primary/80 mb-4 text-sm font-bold tracking-wider uppercase">
            최근 주문 내역
          </h4>
          {isFetching ? (
            // 1. 로딩 상태: 사용자가 기다리고 있음을 알려줌
            <div className="flex h-60 items-center justify-center">
              <span className="text-muted-foreground animate-pulse text-sm">
                주문 내역 조회 중...
              </span>
            </div>
          ) : orderItems.length > 0 ? (
            // 데이터가 있을 때
            <ViewTable columns={orderColumns} data={orderItems} />
          ) : (
            //  데이터가 없을 때
            <div className="form-empty-state">
              <div className="mb-3 text-3xl opacity-20">📦</div>
              <p className="text-muted-foreground text-sm font-medium">
                최근 주문 내역이 존재하지 않습니다.
              </p>
            </div>
          )}
        </section>
      </div>
    </ViewModal>
  );
}
