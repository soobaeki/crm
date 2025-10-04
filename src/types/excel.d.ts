/**
 * 엑셀/CSV 업로드용 RowData 타입
 * 실제 DB 컬럼과 매칭, null 가능
 */
export type RowData = {
  id: number | null; // 순번 (order_items.id)
  orderDate: string | null; // 주문일자 (orders.order_date)
  item: string | null; // 품목 (products.name / product_name_snapshot)
  weight: number | null; // 무게 (products.weight)
  quantity: number; // 수량 (order_items.quantity)
  address: string | null; // 주소 (shipping_address.address_line1 + address_line2)
  homePhone: string | null; // 집전화 (customers.home_phone)
  mobilePhone: string | null; // 휴대전화 (customers.mobile_phone)
  customerName: string | null; // 주문자 (orders.orderer_name / customers.customer_name)
  paymentAmount: number | null; // 입금액 (orders.total_amount / order_items.line_total)
  paymentDate: string | null; // 입금일 (orders.created_at or 별도 입금일)
  payer: string | null; // 입금자 (orders.payer)
  notes: string | null; // 특이사항 (customer_requests.content)
};
