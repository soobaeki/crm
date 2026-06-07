"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Admin } from "@/types/admin";
import { signupAdmin, updateAdmin } from "@/lib/login/login.api";
import ViewModal from "../commons/ViewModal";

interface IProps {
  mode: "create" | "update";
  user?: Admin;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

// 초기값 설정
const initialForm: Admin = {
  loginId: "",
  password: "",
  adminName: "",
  role: "guest",
};

export default function SignupModal({
  mode,
  user,
  isOpen,
  onClose,
  onRefresh,
}: IProps) {
  const [formData, setFormData] = useState<Admin>(initialForm);

  const queryClient = useQueryClient();

  // 모달이 열릴 때 데이터 셋팅
  useEffect(() => {
    if (mode === "update" && user) {
      setFormData({ ...user, password: "" });
    } else {
      setFormData(initialForm);
    }
  }, [isOpen, mode, user]);

  // 계정 생성 Mutation
  const { mutate: handleCreate } = useMutation({
    mutationFn: () =>
      signupAdmin(formData.loginId, formData.password!, formData.role),
    onSuccess: (res) => {
      alert(res.message);
      queryClient.invalidateQueries({ queryKey: ["adminList"] });
      onClose();
      onRefresh();
    },
    onError: (err: any) => alert(err.message),
  });

  // 계정 수정 Mutation
  const { mutate: handleUpdate } = useMutation({
    mutationFn: () => updateAdmin(formData),
    onSuccess: (res) => {
      alert("계정 정보가 수정되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["adminList"] });
      onClose();
      onRefresh();
    },
    onError: (err: any) => alert(err.message),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onConfirmAction = () => {
    if (!formData.loginId) return alert("아이디를 입력해주세요.");
    if (mode === "create" && !formData.password)
      return alert("비밀번호를 입력해주세요.");

    if (mode === "update") {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  return (
    <ViewModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirmAction}
      title={
        mode === "create" ? "관리자 등록" : `${formData.adminName}님 정보 수정`
      }
      size="md"
      confirmLabel={mode === "create" ? "등록" : "수정"}
    >
      <div className="flex flex-col gap-6">
        <section className="space-y-4">
          {/* 아이디 필드 */}
          <div className="form-field">
            <dt className="form-label">관리자 아이디</dt>
            <input
              type="text"
              name="loginId"
              value={formData.loginId}
              onChange={handleChange}
              disabled={mode === "update"} // 수정 시 아이디 변경 불가
              className="form-input w-full"
              placeholder="아이디를 입력하세요."
            />
          </div>

          {/* 비밀번호 필드 */}
          <div className="form-field">
            <dt className="form-label">
              {mode === "update"
                ? "비밀번호 변경 (미입력 시 유지)"
                : "비밀번호"}
            </dt>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input w-full"
              placeholder="비밀번호를 입력하세요."
            />
          </div>

          {/* 권한 선택 필드 */}
          <div className="form-field">
            <dt className="form-label">권한 등급</dt>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-input w-full"
            >
              {/* <option value="admin">Admin (관리자)</option> */}
              <option value="guest">Guest (둘러보기)</option>
            </select>
          </div>

          {mode === "update" && (
            <div className="form-field">
              <dt className="form-label">생성일</dt>
              <dd className="form-display text-sm text-gray-500">
                {formData.createdAt
                  ? new Date(formData.createdAt).toLocaleString()
                  : "-"}
              </dd>
            </div>
          )}
        </section>
      </div>
    </ViewModal>
  );
}
