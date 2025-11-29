"use client";

//////////////////////
// types / interfaces
//////////////////////
interface IProps {
  title: string;
  value: string | number;
  className?: string;
}

//////////////////////
// component start
//////////////////////
export default function ViewCard({ title, value, className = "" }: IProps) {
  //////////////////////
  // render (JSX)
  //////////////////////
  return (
    <div className={`rounded-lg bg-white p-4 shadow ${className}`}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
