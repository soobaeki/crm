/** @type {import("prettier").Config} */
module.exports = {
  plugins: [
    "prettier-plugin-tailwindcss",
    "@trivago/prettier-plugin-sort-imports",
  ],
  importOrder: [
    // 1. React & Next
    "^react$",
    "^next/.*$",

    // 2. 외부 라이브러리
    "<THIRD_PARTY_MODULES>",

    // 3. 타입
    "^@/types/(.*)$",

    // 4. 공통 컴포넌트
    "^@/components/(.*)$",

    // 5. 페이지, 앱 관련
    "^@/apps/(.*)$",

    // 6. 훅
    "^@/hooks/(.*)$",

    // 7. lib / utils
    "^@/lib/(.*)$",
    "^@/utils/(.*)$",

    // 8. 스타일
    "^@/styles/(.*)$",

    // 9. 같은 레벨 파일 import
    "^[./]",
  ],
  importOrderSortSpecifiers: true, // import {...} 내부 정렬
};
