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

export type CustomerFormInput = Omit<Customer, "index" | "id" | "createdAt">;

// 고객 요청사항
export interface CustomerRequest {
  id: number;
  customerId: number;
  content?: string;
  createdAt?: string;
}

export type CustomerRequestFormInput = Omit<Customer, "id" | "createdAt">;

export interface CustomerStats {
  customerTotal: number;
  customerTotalTrend: number; // 전일 대비 증가율 (%)

  // 2. 신규 고객 수 관련 (최근 30일)
  customerRecent30Days: number;
  customerRecentTrend: number; // 기존 고정 컴포넌트 데이터 유지용 가상 트렌드

  // 3. 오늘 주문 건수 관련
  todayOrderCount: number;
  orderTrend: number; // 어제 대비 주문 증감률 (%)

  // 4. 재구매율 관련
  retentionRate: number; // 퍼센트 단위 데이터 (예: 72.5)
  retentionTrend: number; // 재구매율 추이 트렌드
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
