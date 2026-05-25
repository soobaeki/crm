"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import ViewBody from "@/components/commons/ViewBody";
import ViewCol from "@/components/commons/ViewCol";
import ViewContainer from "@/components/commons/ViewContainer";
import ViewTitle from "@/components/commons/ViewTitle";
import SignupModal from "@/components/logins/SignupModal";
import { loginInfo } from "@/lib/login/login.api";

export default function page() {
  const [adminName, setAdminName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const loginMutation = useMutation({
    mutationFn: () => loginInfo(adminName, password, ""),
    onSuccess: (data) => {
      if (data.loginId !== adminName) {
        setError("로그인 정보가 일치하지 않습니다.");
        return;
      }
      login(adminName);
      window.location.href = "/dashboard";
    },
    onError: () => {
      setError("서버 오류가 발생했습니다.");
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    loginMutation.mutate();
  };

  return (
    <ViewContainer className="my-auto min-h-[90vh] max-w-xl justify-center sm:p-8">
      <ViewTitle>로그인</ViewTitle>

      <ViewBody className="w-full">
        <ViewCol className="w-full px-1">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 px-0.5 py-0.5">
              <label className="text-muted-foreground text-xs font-semibold">
                아이디
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="form-input w-full"
                placeholder="아이디를 입력하세요"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5 px-0.5 py-0.5">
              <label className="text-muted-foreground text-xs font-semibold">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input w-full"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            {error && (
              <p className="text-destructive bg-destructive/10 mt-1 rounded-lg px-3 py-2 text-center text-xs font-semibold">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-base btn-primary mt-2 flex w-full items-center justify-center gap-2"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          {/* 중간 구분선 */}
          <div className="relative flex w-full items-center justify-center">
            <div className="border-border w-full border-t"></div>
            <span className="bg-background text-muted-foreground absolute px-3 text-[11px] tracking-wider uppercase"></span>
          </div>

          {/* 회원가입 버튼 (Form 외부 배치) */}
          <button
            onClick={() => setIsSignupOpen(true)} // 👈 클릭 시 로그인 창으로 이동
            className="btn-base btn-outline flex w-full items-center justify-center gap-2"
          >
            <span>회원가입</span>
          </button>
        </ViewCol>

        {isSignupOpen && (
          <SignupModal
            isOpen={isSignupOpen}
            onClose={() => setIsSignupOpen(false)}
            mode={"create"}
            onRefresh={() => {}}
          />
        )}
      </ViewBody>
    </ViewContainer>
  );
}
