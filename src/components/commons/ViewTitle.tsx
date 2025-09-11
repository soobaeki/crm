interface ViewTitleProps {
  children: React.ReactNode;
  className?: string; // 추가 스타일 옵션
}

export default function ViewTitle({
  children,
  className = "",
}: ViewTitleProps) {
  return <h2 className={`px-4 text-xl font-bold ${className}`}>{children}</h2>;
}
