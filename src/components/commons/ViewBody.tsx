interface IViewBodyProps {
  children: React.ReactNode;
  className?: string; // 추가 스타일 옵션
}
export default function ViewBody({ children, className = "" }: IViewBodyProps) {
  return <div className={`flex flex-col gap-4 ${className}`}>{children}</div>;
}
