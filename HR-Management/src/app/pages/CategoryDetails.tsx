import { StockCategoryPage } from "../components/stock/StockCategoryPage";

export function CategoryDetails() {
  return <StockCategoryPage listPath="/stock-management" readOnly={false} />;
}
