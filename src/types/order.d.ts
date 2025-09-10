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

export type OrderFormInput = Omit<Customer, "id" | "createdAt" | "updatedAt">;

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

export type OrderItemFormInput = Omit<Customer, "id" | "createdAt">;

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

export type ShippingAddressFormInput = Omit<Customer, "id" | "createdAt">;
