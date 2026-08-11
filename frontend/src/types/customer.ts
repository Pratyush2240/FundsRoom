export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  businessName: string;
  gstNumber: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPayload {
  name: string;
  mobile?: string;
  email?: string | null;
  businessName?: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address?: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
}

export interface CustomerListResponse {
  data: Customer[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}
