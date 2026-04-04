"use client";

import ViewBody from "@/components/commons/ViewBody";
import ViewContainer from "@/components/commons/ViewContainer";
import ViewTitle from "@/components/commons/ViewTitle";

export default function page() {
  return (
    <ViewContainer>
      {/* 제목 */}
      <ViewTitle>주문 관리</ViewTitle>

      {/* 본문 */}
      <ViewBody>
        <div>준비중</div>
      </ViewBody>
    </ViewContainer>
  );
}
