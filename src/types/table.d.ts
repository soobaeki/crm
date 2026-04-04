export interface Column<T> {
  key: keyof T;
  label: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  width?: string;
  hide?: boolean;
  render?: (row: T) => React.ReactNode;
}
