import dayjs from "dayjs";

export function getStockKeepingUnit() {
  const prefix = "GY";
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const shortUUID = crypto.randomUUID().split("-")[0]; // 앞 8자리만 사용
  return `${prefix}${datePart}-${shortUUID.toUpperCase()}`;
}

export function getCurrentTimestamp() {
  return dayjs().toISOString();
}
