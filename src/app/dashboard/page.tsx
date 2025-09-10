import DashBoardClient from "./DashBoardClient";

export default function page() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-start justify-start px-4 py-4 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold">📊 매출 대시보드</h1>
      <DashBoardClient />
    </div>
  );
}
