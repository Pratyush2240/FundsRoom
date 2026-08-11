export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface ChallanListItem {
  id: string;
  challanNumber: string;
  customer: { id: string; name: string; businessName: string };
  status: ChallanStatus;
  itemCount: number;
  totalAmount: number;
  createdBy: { id: string; name: string };
  createdAt: string;
}

export interface ChallanItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ChallanDetail {
  id: string;
  challanNumber: string;
  customer: { id: string; name: string; businessName: string; mobile: string };
  status: ChallanStatus;
  items: ChallanItem[];
  totalAmount: number;
  createdBy: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface ChallanListResponse {
  data: ChallanListItem[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface ChallanDetailResponse {
  data: ChallanDetail;
}

export interface CreateChallanPayload {
  customerId: string;
  items: { productId: string; quantity: number }[];
}
