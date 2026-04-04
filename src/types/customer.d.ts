export interface Customer {
  index: number; // 채번
  id: number; // 자동 증가하는 고유 ID
  customerName: string; // 고객 이름
  nickName?: string | null; // 닉네임 (옵셔널)
  homePhone?: string | null; // 집 전화번호 (옵셔널)
  mobilePhone: string; // 휴대폰 번호 (유니크)
  address: string | null; // 주소
  createdAt: string; // 생성일시 (ISO 문자열)
}

export type CustomerFormInput = Omit<Customer, "id" | "createdAt">;

// 고객 요청사항
export interface CustomerRequest {
  id: number;
  customerId: number;
  content?: string;
  createdAt?: string;
}

export type CustomerRequestFormInput = Omit<Customer, "id" | "createdAt">;

export interface CustomerStats {
  total: number;
  recent30Days: number;
}

export interface RegionCustomerCount {
  region: string;
  count: number;
}

export interface CustomerIssue {
  customerName: string;
  content: string;
  createdAt: string;
  status: string;
  priority: string;
  handledBy: number;
  handledAt: string;
  handlerNote: string;
}

// 1. 모달의 상태 타입을 정의합니다.
// 실무에서는 보통 '등록(CREATE)', '상세보기(READ)', '수정(UPDATE)' 정도로 나눕니다.
export type CustomerModalMode = "CREATE" | "READ" | "UPDATE";
