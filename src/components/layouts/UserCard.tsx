"use client";

import { useAuthStore } from "@/store/useAuthStore";
import {
  ArrowLeftStartOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useMutation } from "@tanstack/react-query";
import { logoutInfo } from "@/lib/login/login.api";

function UserCard() {
  const { isLogin, adminName, logout } = useAuthStore();

  const logoutMutation = useMutation({
    mutationFn: () => logoutInfo(),
    onSuccess: (data) => {
      logout();
      sessionStorage.clear();
      window.location.href = "/login";
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const handleLogout = async () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      logoutMutation.mutate();
    }
  };

  return (
    <div className="mt-auto px-4 py-4">
      {isLogin && (
        <div className="hover:bg-nav-hover-bg flex items-center gap-3 rounded-xl transition-colors">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
            <UserCircleIcon className="text-primary h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-semibold">
              {adminName}님
            </p>
            <p className="text-muted-foreground truncate text-xs">
              sample@gmail.com
            </p>
          </div>
          {/* 로그아웃 버튼 */}
          <button
            onClick={handleLogout}
            title="로그아웃"
            className="text-muted-foreground hover:text-danger hover:bg-nav-hover-bg cursor-pointer rounded-lg p-2 transition-colors duration-200"
          >
            <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <p className="text-muted-foreground px-2 pt-2 text-[10px] font-medium">
        © Devs Corp. All rights reserved.
      </p>
    </div>
  );
}

export default UserCard;
