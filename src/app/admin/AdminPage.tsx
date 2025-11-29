import ViewBody from "@/components/commons/ViewBody";
import ViewContainer from "@/components/commons/ViewContainer";
import ViewTitle from "@/components/commons/ViewTitle";

function AdminPage() {
  return (
    <ViewContainer>
      {/* 제목 */}
      <ViewTitle>관리자</ViewTitle>

      {/* 본문 */}
      <ViewBody>aa</ViewBody>
    </ViewContainer>
  );
}

export default AdminPage;
