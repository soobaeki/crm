"use client";

//////////////////////
// import
//////////////////////
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
import { TodaysOrdersCustomers } from "@/types/order";
import ViewBody from "@/components/commons/ViewBody";
import ViewCard from "@/components/commons/ViewCard";
import ViewContainer from "@/components/commons/ViewContainer";
import ViewRow from "@/components/commons/ViewRow";
import ViewTable from "@/components/commons/ViewTable";
import ViewTitle from "@/components/commons/ViewTitle";
import {
  getCustomerIssues,
  getCustomerStats,
  getRegionCustomerCounts,
} from "@/lib/customer/customer.api";
import { getTodaysOrdersCustomers } from "@/lib/order/order.api";

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

//////////////////////
// component start
//////////////////////
export default function DashBoardPage() {
  //////////////////////
  // state & router & query
  //////////////////////
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

  const { data: todaysOrdersCustomers } = useQuery<TodaysOrdersCustomers[]>({
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

  ////////////////////////
  // variable
  ////////////////////////
  const barRegionData = {
    labels: regionCounts?.map((rc) => rc.region) ?? [],
    datasets: [
      {
        label: "고객 수",
        data: regionCounts?.map((rc) => rc.count) ?? [],
        backgroundColor: "#10b981", // Emerald-500: 조금 더 모던한 색상
        borderRadius: 6, // 막대 끝을 부드럽게
      },
    ],
  };

  const todayOrdersColumns = [
    { key: "orderDate", label: "주문일자" },
    { key: "customerName", label: "이름" },
    { key: "productName", label: "상품명" },
    { key: "quantity", label: "수량", align: "right" as const },
    { key: "totalPrice", label: "총 금액", align: "right" as const },
    { key: "address", label: "주소" },
  ];

  const customerIssuesColumns = [
    { key: "customerName", label: "고객명" },
    { key: "content", label: "요청사항" },
    { key: "createdAt", label: "요청일시" },
    { key: "status", label: "진행상태", align: "center" as const },
    { key: "priority", label: "요청 우선순위", align: "center" as const },
    { key: "handledBy", label: "처리 담당자" },
    { key: "handledAt", label: "처리 완료 시각" },
    { key: "handlerNote", label: "담당자 메모" },
  ];

  if (isLoading)
    return <div className="text-centertext-gray-400 p-10">Loading...</div>;

  //////////////////////
  // render (JSX)
  //////////////////////
  return (
    <ViewContainer>
      {/* 제목 */}
      <ViewTitle>대시보드</ViewTitle>

      {/* 본문 */}
      <ViewBody>
        {/* 상단 통계 카드 섹션: ViewRow를 사용하여 반응형 자동 조절 */}
        <ViewRow cols={4}>
          {/* 전체 고객 수 */}
          <ViewCard
            title="전체 고객 수"
            value={`${(customerStats?.total ?? 0).toLocaleString()}명`}
            trend="+2.5%"
          />

          {/* 신규 고객 수 (최근 30일) */}
          <ViewCard
            title="신규 고객 수 (최근 30일)"
            value={`${(customerStats?.recent30Days ?? 0).toLocaleString()}명`}
            trend="+10%"
          />

          {/* 재구매율 카드 예시 */}
          <ViewCard title="재구매율" value="72%" trend="-1.2%" />

          {/* 기타 통계 카드 예시 */}
          <ViewCard
            title="오늘 주문 건수"
            value="24건"
            trendLabel="어제 대비"
            trend="+4%"
          />
        </ViewRow>

        {/* 중간 차트 및 주요 지표 */}
        <ViewRow cols={2}>
          <ViewCard title="지역별 고객 분포">
            <div className="mt-4 h-[300px] w-full">
              <Bar
                data={barRegionData}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }, // 범례 숨김으로 더 깔끔하게
                }}
              />
            </div>
          </ViewCard>

          {/* 최근 고객 목록: 표가 너무 크지 않게 내부 스크롤 적용 */}
          <ViewCard title="최근 고객 목록">
            {/* max-h 설정을 통해 카드 크기가 무한정 커지는 것 방지 */}
            <div className="mt-2 max-h-[300px] overflow-auto">
              <ViewTable
                columns={todayOrdersColumns}
                data={todaysOrdersCustomers?.slice(0, 5) ?? []}
              />
            </div>
          </ViewCard>
        </ViewRow>

        {/* 하단 이슈 리스트: 전체 폭 사용 */}
        <ViewRow cols={1}>
          <ViewCard title="미해결 고객 이슈">
            <ViewTable
              columns={customerIssuesColumns}
              data={customerIssues ?? []}
            />
          </ViewCard>
        </ViewRow>
      </ViewBody>
    </ViewContainer>
  );
}
