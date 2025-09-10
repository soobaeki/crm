import dayjs from "dayjs";

export function formatPhone(phone: string): string {
  // 숫자만 남기기
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("02")) {
    // 서울 전화번호: 02-123-4567, 02-1234-5678
    return digits.length === 9
      ? digits.replace(/(\d{2})(\d{3})(\d{4})/, "$1-$2-$3")
      : digits.replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3");
  } else {
    // 일반 전화 or 휴대전화
    return digits.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3");
  }
}

// YYYYMMDD → YYYY-MM-DD
export const yyyymmddToDashed = (yyyymmdd: string) => {
  return dayjs(yyyymmdd, "YYYYMMDD").format("YYYY-MM-DD");
};

// YYYY-MM-DD → YYYYMMDD
export const dashedToYyyymmdd = (dashedDate: string) => {
  return dayjs(dashedDate, "YYYY-MM-DD").format("YYYYMMDD");
};
