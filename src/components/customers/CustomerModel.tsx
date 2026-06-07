"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Customer, CustomerFormInput } from "@/types/customer";
import { OrderItemRow } from "@/types/order";
import { Column } from "@/types/table";
import {
  createCustomer,
  getCustomerOrderHistory,
  updateCustomer,
} from "@/lib/customer/customer.api";
import { updateOrder } from "@/lib/order/order.api";
import { formatNumber, formatPhone } from "@/utils/formatters";
import ViewModal from "../commons/ViewModal";
import ViewTable from "../commons/ViewTable";

interface IProps {
  mode: "create" | "update";
  customer?: Customer;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const emptyCustomer: Partial<Customer> = {
  customerName: "", // 고객 이름
  nickName: "", // 닉네임 (옵셔널)
  homePhone: "", // 집 전화번호 (옵셔널)
  mobilePhone: "", // 휴대폰 번호 (유니크)
  address: "", // 주소
};

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
    render: (row: OrderItemRow) =>
      row.unitPriceSnapshot ? formatNumber(row.unitPriceSnapshot) + "원" : "-",
  },
  {
    key: "quantity",
    label: "수량",
    width: "70px",
    align: "right" as const,
    render: (row: OrderItemRow) =>
      row.quantity ? formatNumber(row.quantity) + "개" : "-",
  },
  {
    key: "lineTotal",
    label: "금액",
    width: "120px",
    align: "right" as const,
    render: (row: OrderItemRow) =>
      row.lineTotal ? formatNumber(row.lineTotal) + "원" : "-",
  },
] satisfies Column<OrderItemRow>[];

export default function CustomerModal({
  mode,
  customer,
  isOpen,
  onClose,
  onRefresh,
}: IProps) {
  const [formData, setFormData] = useState<Partial<Customer>>(
    mode === "create" ? emptyCustomer : { ...customer },
  );
  // 👑 [인라인 수정용 상태] 현재 어떤 주문을 수정 중인지 id를 기록하고, 임시 입력값을 담습니다.
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [editOrderDate, setEditOrderDate] = useState<string>(""); // 💡 날짜 수정용
  const [editProductName, setEditProductName] = useState<string>(""); // 💡 상품명 수정용

  const queryClient = useQueryClient();

  // 고객 주문 목록 조회
  const {
    data: orderItems = [],
    refetch,
    isFetching,
    isLoading,
  } = useQuery<OrderItemRow[]>({
    queryKey: ["orderItems", formData.id],
    queryFn: () => {
      if (!formData.id) return [];

      return getCustomerOrderHistory(formData.id);
    },
    enabled: !!formData.id, // ID가 있을 때만 실행
  });

  // 👑 [주문 수정용 Mutation]
  const { mutate: handleOrderUpdate } = useMutation({
    mutationFn: ({
      orderId,
      item,
    }: {
      orderId: number;
      item: OrderItemRow; // 👈 여기 있던 quantity: number; 를 삭제!
    }) => {
      // 1️⃣ 첫 번째 인자: orderData 규격 맞추기
      const orderForm = {
        id: orderId, // 💡 백엔드 상에서 어떤 주문을 고칠지 ID 포함
        customerId: formData.id!,
        orderDate: new Date(editOrderDate), // 💡 인라인에서 수정한 날짜 적용!
        ordererName: formData.customerName!,
        status: item.status,
      };

      // 2️⃣ 두 번째 인자: itemsData 규격 맞추기 (배열이 아닌 '단일 객체'로 보냅니다)
      const itemForm = {
        orderId: orderId,
        productId: item.productId,
        productNameSnapshot: editProductName, // 💡 인라인에서 수정한 상품명 적용!
        unitPriceSnapshot: item.unitPriceSnapshot,
        quantity: editQuantity, // 💡 인라인에서 수정한 수량 적용!
        lineTotal: item.unitPriceSnapshot * editQuantity, // 수정된 수량에 맞게 총액 재계산
        discount: item.discount,
        tax: item.tax,
      };

      // 👑 실제 api 파일에 정의된 updateOrder(orderData, itemsData)를 호출!
      return updateOrder(orderForm, itemForm);
    },
    onSuccess: () => {
      alert("주문이 수정되었습니다.");
      setEditingItemId(null); // 편집 모드 종료
      refetch(); // 테이블 데이터 새로고침
    },
    onError: (error) => {
      // 👑 드디어 서버 메시지가 들어옵니다!
      console.log("에러 객체 확인:", error);

      // API에서 던진 Error(errorMessage)의 message가 바로 '수정 권한이 없습니다.' 입니다.
      alert(error.message);
    },
  });

  // 고객 정보 등록
  const { mutate: handleCreate } = useMutation({
    mutationFn: (data: Partial<CustomerFormInput> & { customerName: string }) =>
      createCustomer(data as CustomerFormInput),
    onSuccess: () => {
      alert("등록되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      onClose();
      onRefresh();
    },
  });

  // 고객 정보 수정
  const { mutate: handleUpdate } = useMutation<
    Customer,
    Error,
    Partial<Customer>
  >({
    mutationFn: () => updateCustomer(formData),
    onSuccess: (data) => {
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

  // 실제 확인 버튼 클릭 시 실행할 함수
  const onConfirmAction = () => {
    if (mode === "update") {
      handleUpdate(formData);
    } else {
      handleCreate(formData as CustomerFormInput);
    }
  };

  // =================================================================
  // 👑 테이블 컬럼 정의 (인라인 수정을 위해 내부에서 동적으로 렌더링하도록 맵핑)
  // =================================================================
  const orderColumns = [
    { key: "id", label: "순번", width: "70px" },
    {
      key: "orderDate",
      label: "주문일자",
      width: "160px",
      render: (row: OrderItemRow) => {
        if (editingItemId === row.id) {
          return (
            <input
              type="date"
              value={editOrderDate}
              onChange={(e) => setEditOrderDate(e.target.value)}
              className="focus:outline-primary w-full rounded border border-gray-300 px-2 py-0.5 text-xs text-black"
            />
          );
        }
        return row.orderDate
          ? new Date(row.orderDate).toLocaleDateString("ko-KR")
          : "-";
      },
    },
    {
      key: "productNameSnapshot",
      label: "상품명",
      align: "left" as const,
      render: (row: OrderItemRow) => {
        if (editingItemId === row.id) {
          return (
            <input
              type="text"
              value={editProductName}
              onChange={(e) => setEditProductName(e.target.value)}
              className="focus:outline-primary w-full rounded border border-gray-300 px-2 py-0.5 text-sm text-black"
            />
          );
        }
        return row.productNameSnapshot;
      },
    },
    {
      key: "unitPriceSnapshot",
      label: "품목가격",
      width: "120px",
      align: "right" as const,
      render: (row: OrderItemRow) => `${formatNumber(row.unitPriceSnapshot)}원`,
    },
    {
      key: "quantity",
      label: "수량",
      width: "110px",
      align: "center" as const,
      render: (row: OrderItemRow) => {
        // 현재 이 행이 내가 '수정' 버튼을 누른 행이라면 input 박스를 보여줍니다!
        if (editingItemId === row.id) {
          return (
            <input
              type="number"
              min={1}
              value={editQuantity}
              onChange={(e) => setEditQuantity(Number(e.target.value))}
              className="focus:outline-primary w-16 rounded border border-gray-300 px-2 py-0.5 text-center text-black"
            />
          );
        }
        return `${formatNumber(row.quantity)}개`;
      },
    },
    {
      key: "lineTotal",
      label: "금액",
      width: "120px",
      align: "right" as const,
      render: (row: OrderItemRow) => {
        // 수정 중일 때는 타이핑에 맞춰 실시간으로 가상 금액 계산
        if (editingItemId === row.id) {
          return `${formatNumber(row.unitPriceSnapshot * editQuantity)}원`;
        }
        return `${formatNumber(row.lineTotal)}원`;
      },
    },
    {
      key: "actions",
      label: "관리",
      width: "100px",
      align: "center" as const,
      render: (row: OrderItemRow) => {
        if (editingItemId === row.id) {
          return (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => {
                  const targetOrderId = row.orderId || (row as any).order_id;

                  console.log(
                    "====== 💻 프론트엔드 클릭 시점 데이터 검증 💻 ======",
                  );
                  console.log("row전체 데이터:", row);
                  console.log("추출된 targetOrderId:", targetOrderId);
                  console.log("고객 정보 ID (formData.id):", formData.id);
                  console.log(
                    "==================================================",
                  );

                  if (
                    !targetOrderId ||
                    Number(targetOrderId) === Number(formData.id)
                  ) {
                    alert(
                      `오류: 가져온 주문 고유번호(${targetOrderId})가 고객번호(${formData.id})와 같거나 비어있습니다. 데이터를 가져오는 백엔드 GET 쿼리를 확인해야 합니다.`,
                    );
                    return;
                  }
                  handleOrderUpdate({ orderId: row.orderId, item: row });
                }}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                저장
              </button>
              <button
                onClick={() => setEditingItemId(null)}
                className="text-xs font-bold text-gray-400 hover:underline"
              >
                취소
              </button>
            </div>
          );
        }
        return (
          <button
            onClick={() => {
              setEditingItemId(row.id);
              setEditQuantity(row.quantity);
              setEditProductName(row.productNameSnapshot);
              // 날짜형식(Date)을 <input type="date">가 읽을 수 있는 "YYYY-MM-DD" 형태로 파싱하여 주입
              const rawDate = row.orderDate
                ? new Date(row.orderDate)
                : new Date();
              const formattedDate = rawDate.toISOString().split("T")[0];
              setEditOrderDate(formattedDate);
            }}
            className="text-primary text-xs font-bold hover:underline"
          >
            수정
          </button>
        );
      },
    },
  ] satisfies Column<OrderItemRow>[];

  const fields = [
    {
      label: "고객명",
      name: "customerName",
      value: formData.customerName,
      readOnly: mode === "update",
    },
    { label: "닉네임", name: "nickName", value: formData.nickName },
    {
      label: "전화번호",
      name: "homePhone",
      value: formData.homePhone,
    },
    { label: "휴대전화", name: "mobilePhone", value: formData.mobilePhone },
    ...(mode === "update"
      ? [
          {
            label: "가입일",
            name: "createdAt",
            value: formData.createdAt
              ? new Date(formData.createdAt).toLocaleDateString()
              : "-",
            readOnly: true,
          },
        ]
      : []),
    {
      label: "주소",
      name: "address",
      value: formData.address || "",
      fullWidth: true,
    },
  ];

  return (
    <ViewModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirmAction}
      title={
        mode === "create"
          ? "신규 고객 등록"
          : `${formData.customerName} 님 정보`
      }
      size={mode === "create" ? "md" : "xl"}
      confirmLabel={mode === "create" ? "등록" : "수정"}
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
        {mode === "update" && (
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
        )}
      </div>
    </ViewModal>
  );
}
