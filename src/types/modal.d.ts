export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "max-w-md", // 삭제 확인, 단순 알림
  md: "max-w-xl", // 상품 등록/수정 기본 폼
  lg: "max-w-4xl", // 조금 복잡한 설정
  xl: "max-w-7xl h-[90vh]", // 고객 히스토리, 통계 테이블
  full: "max-w-full h-screen rounded-none", // 전체 화면
};
