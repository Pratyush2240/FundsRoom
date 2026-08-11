import React, { useCallback, useEffect, useState } from 'react';
import { Eye, Loader2, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ChallanDetail, ChallanListItem, ChallanListResponse } from '../types/challan';
import { Customer, CustomerListResponse } from '../types/customer';
import { Product, ProductListResponse } from '../types/product';

const inputClass =
  'w-full rounded-md border border-[#E5E5E2] bg-white px-3 py-2 text-xs text-[#252525] outline-none placeholder:text-[#6B6B6B]/60 focus:border-[#2F3437]';
const currency = (value: number | string) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value));
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

interface CreateItemRow {
  productId: string;
  quantity: number;
}

export const ChallansPage: React.FC = () => {
  const { user } = useAuth();
  const canCreate = user?.role === 'ADMIN' || user?.role === 'SALES';

  const [challans, setChallans] = useState<ChallanListItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [selectedChallanId, setSelectedChallanId] = useState<string | null>(null);

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<ChallanListResponse>('/challans', {
          params: {
            page,
            pageSize: 10,
            ...(statusFilter ? { status: statusFilter } : {}),
            ...(customerFilter ? { customerId: customerFilter } : {}),
          },
        });
        setChallans(response.data.data);
        setPagination(response.data.pagination);
      } catch (requestError: any) {
        setError(requestError?.response?.data?.message || 'Unable to load sales challans.');
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, customerFilter]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  useEffect(() => {
    api
      .get<CustomerListResponse>('/customers', { params: { pageSize: 50 } })
      .then((res) => setCustomers(res.data.data))
      .catch(() => undefined);
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-6 font-sans">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#252525]">Sales Challans</h2>
          <p className="mt-0.5 text-xs text-[#6B6B6B]">Issue delivery challans and manage outbound product dispatch.</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2F3437] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1F2326] transition shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" /> Create Challan
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid gap-3 rounded-lg border border-[#E5E5E2] bg-white p-4 md:grid-cols-2 shadow-2xs">
        <select
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
          className={inputClass}
        >
          <option value="">All customers</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.businessName})
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={inputClass}
        >
          <option value="">All statuses</option>
          <option value="DRAFT">DRAFT</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {error && (
        <div className="rounded-md border border-[#F5C6C6] bg-[#FDF2F2] p-4 text-xs font-medium text-[#B84A4A]">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-[#E5E5E2] bg-white shadow-2xs">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-xs text-[#6B6B6B]">
            <Loader2 className="h-4 w-4 animate-spin text-[#2F3437]" /> Loading sales challans...
          </div>
        ) : challans.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center text-xs text-[#6B6B6B]">
            No sales challans found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-xs">
                <thead className="border-b border-[#E5E5E2] bg-[#F7F7F5] text-[11px] uppercase tracking-wider text-[#6B6B6B]">
                  <tr>
                    <th className="px-4 py-3">Challan No.</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Total Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E2]">
                  {challans.map((challan) => (
                    <tr key={challan.id} className="text-[#252525] hover:bg-[#F7F7F5]/60">
                      <td className="px-4 py-3.5 font-mono font-medium text-[#252525]">
                        {challan.challanNumber}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-[#252525]">
                        {challan.customer.name}
                        <span className="block text-[11px] font-normal text-[#6B6B6B]">
                          {challan.customer.businessName}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[#6B6B6B]">{challan.itemCount} line(s)</td>
                      <td className="px-4 py-3.5 font-medium text-[#252525]">
                        {currency(challan.totalAmount)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                            challan.status === 'CONFIRMED'
                              ? 'bg-[#EAF4EF] text-[#2F7D5B] border-[#C4E3D4]'
                              : challan.status === 'CANCELLED'
                              ? 'bg-[#FDF2F2] text-[#B84A4A] border-[#F5C6C6]'
                              : 'bg-[#FDF8F0] text-[#B7791F] border-[#F3E2C7]'
                          }`}
                        >
                          {challan.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-[#6B6B6B]">{formatDate(challan.createdAt)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedChallanId(challan.id)}
                          className="inline-flex items-center gap-1 rounded border border-[#E5E5E2] px-2.5 py-1 text-xs text-[#252525] hover:bg-[#F7F7F5]"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-[#E5E5E2] px-4 py-3 text-xs text-[#6B6B6B]">
              <span>{pagination.total} sales challan(s)</span>
              <div className="flex gap-3 items-center">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => load(pagination.page - 1)}
                  className="disabled:opacity-40 hover:text-[#252525]"
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => load(pagination.page + 1)}
                  className="disabled:opacity-40 hover:text-[#252525]"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {creating && (
        <CreateChallanForm
          customers={customers}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            load(1);
          }}
        />
      )}

      {selectedChallanId && (
        <ChallanDetailModal
          id={selectedChallanId}
          onClose={() => setSelectedChallanId(null)}
        />
      )}
    </div>
  );
};

/* ─── CREATE CHALLAN MODAL ─── */
const CreateChallanForm: React.FC<{
  customers: Customer[];
  onClose: () => void;
  onSaved: () => void;
}> = ({ customers, onClose, onSaved }) => {
  const [customerId, setCustomerId] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [rows, setRows] = useState<CreateItemRow[]>([{ productId: '', quantity: 1 }]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get<ProductListResponse>('/products', { params: { pageSize: 50 } })
      .then((res) => setProducts(res.data.data))
      .catch(() => undefined);
  }, []);

  const productMap = new Map(products.map((p) => [p.id, p]));

  const addRow = () => {
    setRows((prev) => [...prev, { productId: '', quantity: 1 }]);
  };

  const removeRow = (index: number) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof CreateItemRow, value: any) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const grandTotal = rows.reduce((sum, row) => {
    const prod = productMap.get(row.productId);
    if (!prod) return sum;
    return sum + Number(prod.unitPrice) * (row.quantity || 0);
  }, 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError('Please select a customer.');
      return;
    }

    if (rows.length === 0) {
      setError('At least one product item is required.');
      return;
    }

    for (const [index, row] of rows.entries()) {
      if (!row.productId) {
        setError(`Please select a product for line item ${index + 1}.`);
        return;
      }
      if (!row.quantity || row.quantity <= 0) {
        setError(`Quantity for line item ${index + 1} must be greater than zero.`);
        return;
      }
      const prod = productMap.get(row.productId);
      if (prod && row.quantity > prod.currentStock) {
        setError(
          `Insufficient stock for "${prod.name}" (Available: ${prod.currentStock}, Requested: ${row.quantity})`
        );
        return;
      }
    }

    const selectedIds = rows.map((r) => r.productId);
    if (new Set(selectedIds).size !== selectedIds.length) {
      setError('Duplicate products selected. Please merge quantities into a single line item.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post('/challans', {
        customerId,
        items: rows.map((r) => ({ productId: r.productId, quantity: Number(r.quantity) })),
      });
      onSaved();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Unable to create sales challan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-black/40 p-4 flex items-center justify-center">
      <div className="mx-auto my-8 w-full max-w-2xl rounded-lg border border-[#E5E5E2] bg-white p-6 shadow-md text-xs text-[#252525]">
        <div className="flex items-start justify-between border-b border-[#E5E5E2] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#252525]">Create Sales Challan</h3>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded p-1 text-[#6B6B6B] hover:bg-[#F7F7F5]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded border border-[#F5C6C6] bg-[#FDF2F2] p-3 text-xs text-[#B84A4A]">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-[#6B6B6B]">
              Customer *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.businessName} ({c.customerType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold uppercase text-[#6B6B6B]">
                Challan Line Items *
              </label>
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#252525] hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add Line Item
              </button>
            </div>

            <div className="space-y-2.5">
              {rows.map((row, index) => {
                const selectedProd = productMap.get(row.productId);
                const unitPrice = selectedProd ? Number(selectedProd.unitPrice) : 0;
                const lineTotal = unitPrice * (row.quantity || 0);

                return (
                  <div
                    key={index}
                    className="flex flex-col gap-2 rounded-md border border-[#E5E5E2] bg-[#F7F7F5]/50 p-3 sm:flex-row sm:items-center"
                  >
                    <div className="flex-1">
                      <select
                        value={row.productId}
                        onChange={(e) => updateRow(index, 'productId', e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Select product...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku}) — Stock: {p.currentStock} — {currency(p.unitPrice)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-24">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Qty"
                        value={row.quantity}
                        onChange={(e) => updateRow(index, 'quantity', Number(e.target.value))}
                        className={inputClass}
                      />
                    </div>

                    <div className="w-full text-right sm:w-28">
                      <span className="block text-[9px] uppercase text-[#6B6B6B]">Total</span>
                      <span className="text-xs font-semibold text-[#252525]">{currency(lineTotal)}</span>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        disabled={rows.length === 1}
                        className="rounded p-1 text-[#6B6B6B] hover:text-[#B84A4A] disabled:opacity-30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-[#E5E5E2] bg-[#F7F7F5] p-3">
            <span className="text-xs font-semibold text-[#6B6B6B]">Estimated Total</span>
            <span className="text-base font-bold text-[#252525]">{currency(grandTotal)}</span>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#E5E5E2] pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-[#E5E5E2] px-3 py-1.5 text-xs text-[#252525]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-[#2F3437] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1F2326] disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Confirm & Issue Challan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── CHALLAN DETAIL MODAL ─── */
const ChallanDetailModal: React.FC<{ id: string; onClose: () => void }> = ({ id, onClose }) => {
  const [challan, setChallan] = useState<ChallanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get<{ data: ChallanDetail }>(`/challans/${id}`)
      .then((res) => setChallan(res.data.data))
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load challan details.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-black/40 p-4 flex items-center justify-center">
      <div className="mx-auto my-8 w-full max-w-2xl rounded-lg border border-[#E5E5E2] bg-white p-6 shadow-md text-xs text-[#252525]">
        <div className="flex items-start justify-between border-b border-[#E5E5E2] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#6B6B6B]">Sales Challan</span>
            <h3 className="text-base font-mono font-bold text-[#252525]">
              {challan?.challanNumber || 'Loading...'}
            </h3>
          </div>
          <button onClick={onClose} className="rounded p-1 text-[#6B6B6B] hover:bg-[#F7F7F5]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-xs text-[#6B6B6B]">
            <Loader2 className="h-4 w-4 animate-spin text-[#2F3437]" /> Loading details...
          </div>
        ) : error ? (
          <div className="my-4 rounded border border-[#F5C6C6] bg-[#FDF2F2] p-3 text-xs text-[#B84A4A]">
            {error}
          </div>
        ) : challan ? (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 rounded-md border border-[#E5E5E2] bg-[#F7F7F5] p-3 sm:grid-cols-4">
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#6B6B6B]">Customer</span>
                <span className="font-semibold text-[#252525]">{challan.customer.name}</span>
                <span className="block text-[11px] text-[#6B6B6B]">{challan.customer.businessName}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#6B6B6B]">Status</span>
                <span className="inline-block mt-0.5 rounded border border-[#C4E3D4] bg-[#EAF4EF] px-2 py-0.5 text-[10px] font-bold text-[#2F7D5B]">
                  {challan.status}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#6B6B6B]">Created Date</span>
                <span className="text-[#6B6B6B] text-[11px]">{formatDate(challan.createdAt)}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#6B6B6B]">Created By</span>
                <span className="text-[#6B6B6B] text-[11px]">{challan.createdBy?.name || 'N/A'}</span>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold text-[#252525]">Line Items</h4>
              <div className="overflow-x-auto rounded-md border border-[#E5E5E2]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#E5E5E2] bg-[#F7F7F5] text-[11px] uppercase tracking-wider text-[#6B6B6B]">
                    <tr>
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2">SKU</th>
                      <th className="px-3 py-2 text-right">Quantity</th>
                      <th className="px-3 py-2 text-right">Unit Price</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E2]">
                    {challan.items.map((item) => (
                      <tr key={item.id} className="text-[#252525]">
                        <td className="px-3 py-2 font-medium">{item.productName}</td>
                        <td className="px-3 py-2 font-mono text-[11px] text-[#6B6B6B]">{item.sku}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">{currency(item.unitPrice)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-[#252525]">
                          {currency(item.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border border-[#E5E5E2] bg-[#F7F7F5] p-3">
              <span className="text-xs font-semibold text-[#6B6B6B]">Grand Total</span>
              <span className="text-base font-bold text-[#252525]">{currency(challan.totalAmount)}</span>
            </div>

            <div className="flex justify-end border-t border-[#E5E5E2] pt-3">
              <button
                onClick={onClose}
                className="rounded border border-[#E5E5E2] px-4 py-1.5 text-xs text-[#252525]"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
