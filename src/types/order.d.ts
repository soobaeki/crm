export interface Order {
  id: number; // INT(11) AUTO_INCREMENT
  customerId: number; // INT(11) NOT NULL
  orderDate: Date | null; // DATE NULL
  ordererName: string | null; // VARCHAR(100) NULL
  totalAmount: number; // INT(11) DEFAULT 0
  status: string; // VARCHAR(32) DEFAULT 'PENDING'
  createdAt: Date; // DATETIME DEFAULT CURRENT_TIMESTAMP
  updatedAt: Date | null; // DATETIME NULL ON UPDATE
}

// 👑 Customer가 아니라 실제 Order 인터페이스를 기준으로 제외해야 합니다!
export type OrderFormInput = Omit<
  Order,
  "id" | "totalAmount" | "createdAt" | "updatedAt"
>;

export interface OrderItem {
  id: number; // INT(11) AUTO_INCREMENT
  orderId: number; // INT(11) NOT NULL (FK → orders.id)
  productId: number | null; // INT(11) NULL
  productNameSnapshot: string; // VARCHAR(255) NOT NULL
  unitPriceSnapshot: number; // INT(11) NOT NULL
  quantity: number; // INT(11) NOT NULL
  lineTotal: number; // INT(11) NOT NULL
  discount: number | null; // INT(11) DEFAULT 0
  tax: number | null; // INT(11) DEFAULT 0
  createdAt: Date; // DATETIME DEFAULT CURRENT_TIMESTAMP
}

// 👑 Customer가 아니라 실제 OrderItem 인터페이스를 기준으로 제외해야 합니다!
export type OrderItemFormInput = Omit<
  OrderItem,
  "id" | "lineTotal" | "createdAt"
>;

export type OrderWithItems = Order & { orderItems: OrderItem[] };

// 배송지/수령인 정보
export interface ShippingAddress {
  id: number;
  orderId: number;
  recipientName?: string;
  recipientPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  createdAt?: string;
}

// 👑 Customer가 아니라 실제 ShippingAddress 인터페이스를 기준으로 제외해야 합니다!
export type ShippingAddressFormInput = Omit<
  ShippingAddress,
  "id" | "createdAt"
>;

export interface TodaysOrdersCustomers {
  customerName: string;
  address: string;
  orderDate: string;
  productName: string;
  quantity: number;
  totalPrice: number;
}

/**
 * 주문 상품별로 한 줄씩 보여주기 위한 타입
 */
export interface OrderItemRow extends OrderItem {
  status: string;
  orderDate: Date | null;
  ordererName: string | null;
  actions?: string; // UI 가상 키
}
