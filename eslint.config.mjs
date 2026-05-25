import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 1. 기본 Next.js 및 TypeScript 설정
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // 2. 추가 규칙들 (compat.config를 사용하여 플러그인 호환성 해결)
  ...compat.config({
    files: ["**/*.tsx", "**/*.jsx", "**/*.ts", "**/*d.ts"],
    plugins: ["import"],
    rules: {
      "react/jsx-sort-props": [
        "error",
        {
          callbacksLast: true,
          shorthandFirst: true,
          noSortAlphabetically: false,
          reservedFirst: true,
        },
      ],
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "no-unused-vars": "warn",
    },
  }),
];

export default eslintConfig;
