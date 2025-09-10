"use client";

import { postCustomer } from "@/lib/customers/customer.api";
import { CustomerFormInput } from "@/types/customer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function CustomerForm() {
  const queryClient = useQueryClient();

  // 고객 등록
  const mutation = useMutation({
    mutationFn: postCustomer,
    onSuccess: () => {
      alert("고객 등록 성공!");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error) => {
      alert(`고객 등록 실패: ${error.message}`);
    },
  });

  const [form, setForm] = useState<CustomerFormInput>();
  const [customerName, setCustomerName] = useState(form?.customerName ?? "");
  const [homePhone, setHomePhone] = useState(form?.homePhone ?? "");
  const [mobilePhone, setMobilePhone] = useState(form?.mobilePhone ?? "");

  // func
  const processors: Record<string, (val: string) => string> = {
    customer_name: (val) => val.replace(/[^ㄱ-ㅎ가-힣]/g, ""), // 고객명: 한글 아닌 문자 제거
    home_phone: (val) => {
      if (val.startsWith("02")) val = val.slice(0, 10);
      return val.replace(/[^0-9]/g, "");
    }, // 집번호: 숫자만 허용
    mobile_phone: (val) => val.replace(/[^0-9]/g, ""), // 휴대번호: 숫자만 허용
  };

  // change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const processor = processors[name];
    const cleaned = processor ? processor(value) : value;

    if (name === "customer_name") setCustomerName(cleaned);
    if (name === "home_phone") setHomePhone(cleaned);
    if (name === "mobile_phone") setMobilePhone(cleaned);

    setForm((prev) => ({ ...prev, [name]: cleaned }) as CustomerFormInput);
  };

  // insert
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { customerName, homePhone, mobilePhone, address } =
      form as CustomerFormInput;

    // 이름 필수, 1~4글자 한글/영문만 허용
    if (!customerName || !/^[ㄱ-ㅎ가-힣a-zA-Z]{1,4}$/.test(customerName)) {
      alert("이름은 한글 또는 영문 1~4글자만 입력하세요.");
      return;
    }

    // 집전화: 10자리 또는 11자리 숫자만 허용
    if (homePhone && !/^\d{10,11}$/.test(homePhone)) {
      alert("집전화는 숫자 10자리 또는 11자리로 입력하세요.");
      return;
    }

    // 휴대폰: 필수, 10자리 또는 11자리 숫자만 허용
    if (!mobilePhone || !/^\d{10,11}$/.test(mobilePhone)) {
      alert("휴대폰은 필수이며 숫자 10자리 또는 11자리로 입력하세요.");
      return;
    }

    if (!address) {
      alert("주소를 입력하세요.");
      return;
    }

    // useMutation 호출
    mutation.mutate(form as CustomerFormInput);
  };

  return (
    <div>
      <input
        maxLength={4}
        name="customer_name"
        placeholder="이름"
        title="한글만 입력가능합니다."
        value={customerName}
        onChange={handleChange}
      />
      <input
        inputMode="numeric"
        maxLength={11}
        name="home_phone"
        placeholder="집전화"
        title="숫자만 입력가능합니다."
        value={homePhone}
        onChange={handleChange}
      />
      <input
        inputMode="numeric"
        maxLength={11}
        name="mobile_phone"
        placeholder="휴대폰"
        title="숫자만 입력가능합니다."
        value={mobilePhone}
        onChange={handleChange}
      />
      <input name="address" placeholder="주소" onChange={handleChange} />
      <button onClick={handleSubmit}>등록</button>
    </div>
  );
}
