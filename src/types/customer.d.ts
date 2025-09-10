export interface Customer {
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
