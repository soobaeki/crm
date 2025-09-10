import { Customer } from "@/types/customer";
import dayjs from "dayjs";

// 예시용 주문내역 더미

const orders = [
  {
    id: "o1001",
    orderDate: "20240701",
    itemName: "배추 A급",
    quantity: 3,
    address: "서울 강남구 역삼동 456-7",
    contactPhone: "010-9876-5432",
    paymentAmount: 45000,
    paymentDate: "20240702",
    note: "배송 전 연락 요망",
  },
  {
    id: "o1002",
    orderDate: "20240615",
    itemName: "알타리(5kg)",
    quantity: 2,
    address: "서울 강남구 역삼동 456-7",
    contactPhone: "010-9876-5432",
    paymentAmount: 36000,
    paymentDate: "20240616",
    note: "",
  },
  {
    id: "o1003",
    orderDate: "20240520",
    itemName: "배추 B급(못난이)",
    quantity: 1,
    address: "서울 강남구 논현동 123-4",
    contactPhone: "02-1234-5678",
    paymentAmount: 12000,
    paymentDate: "20240521",
    note: "포장 꼼꼼히 부탁드립니다.",
  },
];

export default function CustomerModal({
  customer,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  return (
    <div className="bg-opacity-0.5 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-7xl flex-col rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-200">
        {/* 상단: 고객 정보 */}
        <div className="mb-6 max-h-[32vh] overflow-auto">
          <h2 className="mb-6 border-b border-gray-200 pb-3 text-2xl font-semibold text-gray-800">
            {customer.name} 고객 세부정보
          </h2>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[15px] leading-6 text-gray-700">
            <dt className="font-semibold text-gray-600">고객명</dt>
            <dd>{customer.name}</dd>

            {/* <dt className="font-semibold text-gray-600">생년월일</dt> */}
            {/* <dd>{customer.birthDate || "-"}</dd> */}

            {/* <dt className="font-semibold text-gray-600">성별</dt> */}
            {/* <dd>{customer.gender || "-"}</dd> */}

            <dt className="font-semibold text-gray-600">전화번호</dt>
            <dd>{customer.phone || "-"}</dd>

            {/* <dt className="font-semibold text-gray-600">이메일</dt> */}
            {/* <dd>{customer.email || "-"}</dd> */}

            <dt className="font-semibold text-gray-600">주소</dt>
            <dd className="break-words">{customer.address || "-"}</dd>

            {/*  <dt className="font-semibold text-gray-600">회원가입일</dt> */}
            {/* <dd>{customer.joinDate || "-"}</dd> */}

            {/* <dt className="font-semibold text-gray-600">최근 주문일</dt> */}
            {/* <dd>{customer.lastOrderDate || "-"}</dd> */}

            {/* <dt className="font-semibold text-gray-600">상태</dt> */}
            {/* <dd>{customer.status || "-"}</dd> */}

            <dt className="font-semibold text-gray-600">메모</dt>
            <dd className="whitespace-pre-wrap">{customer.note || "-"}</dd>
          </dl>
        </div>

        {/* 하단: 주문 내역 */}
        <div className="flex-1 overflow-auto border-t border-gray-200 pt-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            주문 내역
          </h3>

          {orders.length === 0 ? (
            <p className="text-center text-gray-500">주문 내역이 없습니다.</p>
          ) : (
            <table className="w-full table-auto border border-gray-200 text-[14px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="min-w-[50px] border px-3 py-2">순번</th>
                  <th className="min-w-[90px] border px-3 py-2">주문일자</th>
                  <th className="min-w-[150px] border px-3 py-2">품목</th>
                  <th className="min-w-[60px] border px-3 py-2">수량</th>
                  <th className="min-w-[200px] border px-3 py-2">배달주소</th>
                  <th className="min-w-[110px] border px-3 py-2">연락처</th>
                  <th className="min-w-[90px] border px-3 py-2">입금액</th>
                  <th className="min-w-[90px] border px-3 py-2">입금일</th>
                  <th className="min-w-[120px] border px-3 py-2">특이사항</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr key={order.id || idx} className="hover:bg-gray-50">
                    <td className="border px-3 py-2 text-center">{idx + 1}</td>
                    <td className="border px-3 py-2">
                      {dayjs(order.orderDate, "YYYYMMDD").format("YYYY-MM-DD")}
                    </td>
                    <td className="border px-3 py-2">{order.itemName}</td>
                    <td className="border px-3 py-2 text-center">
                      {order.quantity}
                    </td>
                    <td className="border px-3 py-2">{order.address}</td>
                    <td className="border px-3 py-2">
                      {order.contactPhone || "-"}
                    </td>
                    <td className="border px-3 py-2 text-right">
                      {order.paymentAmount.toLocaleString()} 원
                    </td>
                    <td className="border px-3 py-2">
                      {order.paymentDate
                        ? dayjs(order.paymentDate, "YYYYMMDD").format(
                            "YYYY-MM-DD",
                          )
                        : "-"}
                    </td>
                    <td className="border px-3 py-2">{order.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* 하단 버튼 */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-blue-700"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
