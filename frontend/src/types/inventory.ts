import { Product } from './product';

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  type: 'IN' | 'OUT';
  reason: string;
  createdBy: string;
  createdAt: string;
  product: Pick<Product, 'id' | 'name' | 'sku'>;
  user: { id: string; name: string; email: string };
}

export interface MovementListResponse {
  data: StockMovement[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}
