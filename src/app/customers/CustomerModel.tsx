import { Customer } from "@/types/customer";
import Modal from "@/components/commons/Modal";

interface CustomerModalProps {
  customer: Customer | null;
  onClose: () => void;
}

export default function CustomerModal({
  customer,
  onClose,
}: CustomerModalProps) {
  if (!customer) return null;
  console.log("customer", customer);
  return (
    <Modal
      isOpen={!!customer}
      title={`${customer.customerName} 고객 세부정보`}
      onClose={onClose}
    >
      {/* 여기 내용만 교체 가능 */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[15px] leading-6 text-gray-700">
        <dt className="font-semibold text-gray-600">고객명</dt>
        <dd>{customer.customerName}</dd>

        <dt className="font-semibold text-gray-600">닉네임</dt>
        <dd>{customer.nickName || "-"}</dd>

        <dt className="font-semibold text-gray-600">전화번호</dt>
        <dd>{customer.homePhone || "-"}</dd>

        <dt className="font-semibold text-gray-600">휴대전화번호</dt>
        <dd>{customer.mobilePhone}</dd>

        <dt className="font-semibold text-gray-600">주소</dt>
        <dd className="break-words">{customer.address || "-"}</dd>

        <dt className="font-semibold text-gray-600">가입일</dt>
        <dd>{new Date(customer.createdAt).toLocaleDateString()}</dd>
      </dl>
    </Modal>
  );
}
