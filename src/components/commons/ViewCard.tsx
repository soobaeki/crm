"use client";

interface IProps {
  title: string;
  value: string | number;
  className?: string;
}

export default function ViewCard({ title, value, className = "" }: IProps) {
  return (
    <div className={`rounded-lg bg-white p-4 shadow ${className}`}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
