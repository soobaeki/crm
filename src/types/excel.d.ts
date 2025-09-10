export type ParsedOrderRow = {
  orderDate: string;
  items: {
    [productName: string]: number;
  };
  customer: {
    name: string;
    nickName: string;
    address: string;
    homePhone?: string;
    mobilePhone: string;
  };
  depositor: string;
  totalAmount: number;
  memo: string;
};

// 추후 productName은 enum으로 관리 가능
export const PRODUCT_COLUMNS: { [key: string]: string } = {
  "배추 A급": "baechu_a",
  "배추 B급": "baechu_b",
  "알타리 5kg": "altari_5kg",
  "알타리 10kg": "altari_10kg",
};
