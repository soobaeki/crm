export interface Admin {
  id?: number;
  loginId: string;
  password?: string;
  role: "admin" | "guest";
  adminName?: string;
  createdAt?: string;
}

export type AdminFormInput = Omit<Admin, "createdAt">;
