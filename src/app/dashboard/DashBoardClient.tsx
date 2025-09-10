"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { useMemo } from "react";

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

export default function DashBoardClient() {
  const totalCustomers = 1264;
  const newCustomers = 132;

  const lineData = useMemo(
    () => ({
      labels: ["2021", "2022", "2023", "2024"],
      datasets: [
        {
          label: "매출액 (만원)",
          data: [7500, 12000, 15500, 18000],
          borderColor: "#4F46E5",
          backgroundColor: "#4F46E5",
          tension: 0.3,
          fill: false,
        },
      ],
    }),
    [],
  );

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "연도별 매출 추이" },
    },
  };

  const doughnutData = {
    labels: ["재구매 고객", "1회 구매 고객"],
    datasets: [
      {
        data: [72, 28],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" as const },
      title: { display: true, text: "재구매율" },
    },
  };

  const barRegionData = {
    labels: ["서울", "부산", "대구", "인천", "경기", "기타"],
    datasets: [
      {
        label: "고객 수",
        data: [350, 200, 150, 120, 300, 144],
        backgroundColor: "#34D399",
      },
    ],
  };

  const barGenderAgeData = {
    labels: [
      "남성 20대",
      "여성 20대",
      "남성 30대",
      "여성 30대",
      "남성 40대",
      "여성 40대",
    ],
    datasets: [
      {
        label: "고객 수",
        data: [50, 80, 100, 120, 70, 90],
        backgroundColor: "#60A5FA",
      },
    ],
  };

  const customerIssues = [
    {
      id: 1,
      name: "홍길동",
      issue: "배송 지연 문의",
      date: "2024-07-02",
      status: "처리 중",
    },
    {
      id: 2,
      name: "김영희",
      issue: "환불 요청",
      date: "2024-07-01",
      status: "완료",
    },
    {
      id: 3,
      name: "박철수",
      issue: "상품 불량",
      date: "2024-06-29",
      status: "대기",
    },
  ];

  const recentCustomers = [
    {
      name: "홍길동",
      phone: "010-1234-5678",
      region: "서울",
      orderDate: "2024-07-01",
    },
    {
      name: "김영희",
      phone: "010-2222-3333",
      region: "부산",
      orderDate: "2024-06-28",
    },
    {
      name: "박철수",
      phone: "010-9999-0000",
      region: "대구",
      orderDate: "2024-06-25",
    },
    {
      name: "이민정",
      phone: "010-5555-6666",
      region: "인천",
      orderDate: "2024-06-21",
    },
  ];

  return (
    <div className="w-full space-y-8 p-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-500">전체 고객 수</p>
          <p className="text-2xl font-semibold">
            {totalCustomers.toLocaleString()}명
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-500">신규 고객 수 (최근 30일)</p>
          <p className="text-2xl font-semibold">
            {newCustomers.toLocaleString()}명
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow">
          <Line data={lineData} options={lineOptions} />
        </div>
        <div className="rounded-xl bg-white p-6 shadow">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">지역별 고객 분포</h3>
          <Bar data={barRegionData} />
        </div>
        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">연령대 / 성별 분포</h3>
          <Bar data={barGenderAgeData} />
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold">최근 고객 목록</h3>
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">이름</th>
              <th className="border px-3 py-2 text-left">전화번호</th>
              <th className="border px-3 py-2 text-left">지역</th>
              <th className="border px-3 py-2 text-left">주문일자</th>
            </tr>
          </thead>
          <tbody>
            {recentCustomers.map((c, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{c.name}</td>
                <td className="border px-3 py-2">{c.phone}</td>
                <td className="border px-3 py-2">{c.region}</td>
                <td className="border px-3 py-2">{c.orderDate}</td>
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
              <th className="border px-3 py-2 text-left">고객명</th>
              <th className="border px-3 py-2 text-left">문의 내용</th>
              <th className="border px-3 py-2 text-left">접수일</th>
              <th className="border px-3 py-2 text-left">상태</th>
            </tr>
          </thead>
          <tbody>
            {customerIssues.map((issue) => (
              <tr key={issue.id} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{issue.name}</td>
                <td className="border px-3 py-2">{issue.issue}</td>
                <td className="border px-3 py-2">{issue.date}</td>
                <td className="border px-3 py-2">{issue.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
