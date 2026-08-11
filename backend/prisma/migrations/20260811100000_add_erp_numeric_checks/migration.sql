-- Preserve basic ERP data integrity even when records are written outside the API.
ALTER TABLE "products"
  ADD CONSTRAINT "products_current_stock_nonnegative"
  CHECK ("current_stock" >= 0),
  ADD CONSTRAINT "products_minimum_stock_nonnegative"
  CHECK ("minimum_stock" >= 0);

ALTER TABLE "stock_movements"
  ADD CONSTRAINT "stock_movements_quantity_positive"
  CHECK ("quantity" > 0);

ALTER TABLE "challan_items"
  ADD CONSTRAINT "challan_items_quantity_positive"
  CHECK ("quantity" > 0);
