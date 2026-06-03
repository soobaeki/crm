// 홍길동 -> 홍*동
export function maskName(name: string, role: string): string {
  if (role === "admin") return name;
  if (!name) return "";
  if (name.length <= 2) {
    return name.charAt(0) + "*";
  }
  return name.charAt(0) + "*".repeat(name.length - 2) + name.slice(-1);
}

// 010-1234-5678 => 010-****-5678, 02-***-4567
export function maskPhone(phone: string, role: string): string {
  if (role === "admin") return phone;
  if (!phone) return "";

  const parts = phone.split("-");
  if (parts.length === 3) {
    return `${parts[0]}-${"*".repeat(parts[1].length)}-${"*".repeat(parts[2].length - 1)}${parts[2].slice(-1)}`;
  }

  return phone;
}

// 서울시 강남구 테헤란로... -> 서울시 강남구 ****
export function maskAddress(address: string, role: string): string {
  if (role === "admin") return address;
  if (!address) return "";

  const parts = address.split(" ");

  if (parts.length > 2) {
    const visible = parts.slice(0, 1).join(" ");
    const remaining = parts.slice(2).join(" ");
    return `${visible} ${"*".repeat(remaining.length)}`;
  }

  return address;
}

// 2026-01-01 => 20**-0*-0*
export function maskCreateAt(createAt: string, role: string): string {
  if (role === "admin") return createAt;
  if (!createAt) return "";

  const parts = createAt.split("-");

  return `${parts[0].slice(0, 2)}${"*".repeat(parts[0].length - 2)}-${parts[1].charAt(0).concat("*")}-${parts[2].charAt(0).concat("*")}`;
}
