"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import ViewBody from "@/components/commons/ViewBody";
import ViewCard from "@/components/commons/ViewCard";
import ViewContainer from "@/components/commons/ViewContainer";
import ViewTitle from "@/components/commons/ViewTitle";
import {
  getCustomerIssues,
  getCustomerStats,
  getRegionCustomerCounts,
} from "@/lib/customers/customer.api";
import { getTodaysOrdersCustomers } from "@/lib/orders/order.api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function DashBoardPage() {
  const { data: customerStats, isLoading } = useQuery<{
    total: number;
    recent30Days: number;
  }>({
    queryKey: ["customerStats"],
    queryFn: getCustomerStats,
  });

  const { data: regionCounts } = useQuery<{ region: string; count: number }[]>({
    queryKey: ["regionCustomerCounts"],
    queryFn: getRegionCustomerCounts,
  });

  const { data: todaysOrdersCustomers } = useQuery<
    {
      customerName: string;
      address: string;
      orderDate: string;
      productName: string;
      quantity: number;
      totalPrice: number;
    }[]
  >({
    queryKey: ["getTodaysOrdersCustomers"],
    queryFn: getTodaysOrdersCustomers,
  });

  const { data: customerIssues } = useQuery<
    {
      customerName: string;
      content: string;
      createdAt: string;
      status: string;
      priority: string;
      handledBy: number;
      handledAt: string;
      handlerNote: string;
    }[]
  >({
    queryKey: ["getCustomerIssues"],
    queryFn: getCustomerIssues,
  });

  const barRegionData = {
    labels: regionCounts?.map((rc) => rc.region) ?? [],
    datasets: [
      {
        label: "고객 수",
        data: regionCounts?.map((rc) => rc.count) ?? [],
        backgroundColor: "#34D399",
      },
    ],
  };

  const todayOrdersColumns = [
    { key: "orderDate", label: "주문일자" },
    { key: "customerName", label: "이름" },
    { key: "productName", label: "상품명" },
    { key: "quantity", label: "수량" },
    { key: "totalPrice", label: "총 금액" },
    { key: "address", label: "주소" },
  ];

  const customerIssuesColumns = [
    { key: "customerName", label: "고객명" },
    { key: "content", label: "요청사항" },
    { key: "createdAt", label: "요청일시" },
    { key: "status", label: "진행상태" },
    { key: "priority", label: "요청 우선순위" },
    { key: "handledBy", label: "처리 담당자" },
    { key: "handledAt", label: "처리 완료 시각" },
    { key: "handlerNote", label: "담당자 메모" },
  ];

  if (isLoading) return <p>Loading...</p>;

  return (
    <ViewContainer>
      {/* 제목 */}
      <ViewTitle>대시보드</ViewTitle>

      {/* 본문 */}
      <ViewBody>
        {/* 첫 문단 */}
        <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* 전체 고객 수 */}
          <ViewCard
            title={"전체 고객 수"}
            value={`${(customerStats?.total ?? 0).toLocaleString()}명`}
          />

          {/* 신규 고객 수 (최근 30일) */}
          <ViewCard
            title={"신규 고객 수 (최근 30일)"}
            value={`${(customerStats?.recent30Days ?? 0).toLocaleString()}명`}
          />

          {/* 재구매율 카드 예시 */}
          <ViewCard title={"재구매율"} value={"72%"} />

          {/* 기타 통계 카드 예시 */}
          <ViewCard title={"총 주문 수"} value={"1,234건"} />
        </div>

        {/* 두번째 문단 */}
        <div className="grid grid-cols-1">
          <div className="rounded-xl bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">지역별 고객 분포</h3>
            <Bar data={barRegionData} />
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">최근 고객 목록</h3>
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                {todayOrdersColumns.map((col) => {
                  return (
                    <th key={col.key} className="border px-3 py-2 text-center">
                      {col.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {todaysOrdersCustomers?.map((c, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {todayOrdersColumns.map((col) => {
                    return (
                      <td
                        key={col.key}
                        className={`border px-3 py-2 ${typeof c[col.key as keyof typeof c] === "number" ? "text-right" : "text-left"}`}
                      >
                        {c[col.key as keyof typeof c]}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">고객 문의/이슈</h3>
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                {customerIssuesColumns.map((col) => {
                  return (
                    <th key={col.key} className="border px-3 py-2 text-center">
                      {col.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {customerIssues?.map((issue, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {customerIssuesColumns.map((col) => {
                    return (
                      <td
                        key={col.key}
                        className={`border px-3 py-2 ${typeof issue[col.key as keyof typeof issue] === "number" ? "text-right" : "text-left"}`}
                      >
                        {issue[col.key as keyof typeof issue]}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ViewBody>
    </ViewContainer>
  );
}
