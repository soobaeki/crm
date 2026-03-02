import AdminPage from "./AdminPage";

export default function page({ children }: { children: React.ReactNode }) {
  return (
    <div className="flxed h-full gap-6">
      <AdminPage children={children} />
    </div>
  );
}
