export interface Column<T> {
  key: keyof T;
  label: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  width?: string;
  render?: (row: T) => React.ReactNode;
}
