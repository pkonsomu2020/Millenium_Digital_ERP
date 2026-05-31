import { StockCategoryPage } from "../components/stock/StockCategoryPage";

export function CategoryDetails() {
  return <StockCategoryPage listPath="/dashboard/stock-management" readOnly={false} />;
}
