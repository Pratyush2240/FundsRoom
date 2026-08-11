import React, { useCallback, useEffect, useState } from 'react';
import { Eye, Loader2, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ChallanDetail, ChallanListItem, ChallanListResponse } from '../types/challan';
import { Customer, CustomerListResponse } from '../types/customer';
import { Product, ProductListResponse } from '../types/product';

const inputClass = 'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500';
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
      .get<CustomerListResponse>('/customers', { params: { pageSize: 100 } })
      .then((res) => setCustomers(res.data.data))
      .catch(() => undefined);
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">Sales Challans</h2>
          <p className="mt-1 text-sm text-slate-400">Issue delivery challans and manage outbound product dispatch.</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" /> Create Challan
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-2">
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
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading sales challans...
          </div>
        ) : challans.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-slate-400">
            No sales challans found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-950/50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Challan No.</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Items</th>
                    <th className="px-5 py-3">Total Amount</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Created Date</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {challans.map((challan) => (
                    <tr key={challan.id} className="text-slate-300 hover:bg-slate-800/40">
                      <td className="px-5 py-4 font-mono font-medium text-indigo-400">
                        {challan.challanNumber}
                      </td>
                      <td className="px-5 py-4 font-medium text-white">
                        {challan.customer.name}
                        <span className="block text-xs font-normal text-slate-400">
                          {challan.customer.businessName}
                        </span>
                      </td>
                      <td className="px-5 py-4">{challan.itemCount} line(s)</td>
                      <td className="px-5 py-4 font-medium text-white">
                        {currency(challan.totalAmount)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            challan.status === 'CONFIRMED'
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              : challan.status === 'CANCELLED'
                              ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          }`}
                        >
                          {challan.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs">{formatDate(challan.createdAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedChallanId(challan.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-indigo-400 hover:bg-slate-700"
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
            <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3 text-sm text-slate-400">
              <span>{pagination.total} sales challan(s)</span>
              <div className="flex gap-3">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => load(pagination.page - 1)}
                  className="disabled:opacity-40"
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => load(pagination.page + 1)}
                  className="disabled:opacity-40"
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
      .get<ProductListResponse>('/products', { params: { pageSize: 100 } })
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

  // Grand total estimated calculation
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

    // Check duplicate products
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
    <div className="fixed inset-0 z-30 overflow-y-auto bg-slate-950/75 p-4">
      <div className="mx-auto my-8 w-full max-w-3xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-indigo-400">Sales Challan</p>
            <h3 className="mt-1 text-xl font-bold">Create Sales Challan</h3>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-6">
          {/* Customer */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Customer <span className="text-rose-400">*</span>
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

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-400">
                Challan Items <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                <Plus className="h-3.5 w-3.5" /> Add Product Item
              </button>
            </div>

            <div className="space-y-3">
              {rows.map((row, index) => {
                const selectedProd = productMap.get(row.productId);
                const unitPrice = selectedProd ? Number(selectedProd.unitPrice) : 0;
                const lineTotal = unitPrice * (row.quantity || 0);

                return (
                  <div
                    key={index}
                    className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3.5 sm:flex-row sm:items-center"
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

                    <div className="w-full sm:w-28">
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

                    <div className="w-full text-right sm:w-32">
                      <span className="block text-[10px] uppercase text-slate-500">Line Total</span>
                      <span className="text-sm font-semibold text-white">{currency(lineTotal)}</span>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        disabled={rows.length === 1}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-rose-400 disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grand Total Summary */}
          <div className="flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4">
            <span className="text-sm font-semibold text-slate-300">Estimated Grand Total</span>
            <span className="text-xl font-bold text-indigo-400">{currency(grandTotal)}</span>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Creating Challan...' : 'Confirm & Deduct Stock'}
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
    <div className="fixed inset-0 z-30 overflow-y-auto bg-slate-950/75 p-4">
      <div className="mx-auto my-8 w-full max-w-3xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-indigo-400">Sales Challan Details</p>
            <h3 className="mt-1 text-xl font-mono font-bold text-white">
              {challan?.challanNumber || 'Loading...'}
            </h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading details...
          </div>
        ) : error ? (
          <div className="my-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            {error}
          </div>
        ) : challan ? (
          <div className="mt-6 space-y-6">
            {/* Header info grid */}
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:grid-cols-4">
              <div>
                <span className="block text-xs text-slate-500">Customer</span>
                <span className="text-sm font-semibold text-white">{challan.customer.name}</span>
                <span className="block text-xs text-slate-400">{challan.customer.businessName}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-500">Status</span>
                <span className="inline-block mt-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                  {challan.status}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-500">Created Date</span>
                <span className="text-xs font-medium text-slate-300">{formatDate(challan.createdAt)}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-500">Created By</span>
                <span className="text-xs font-medium text-slate-300">{challan.createdBy?.name || 'N/A'}</span>
              </div>
            </div>

            {/* Line items table */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-slate-300">Itemized Products</h4>
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-800 bg-slate-950/50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5">Product</th>
                      <th className="px-4 py-2.5">SKU</th>
                      <th className="px-4 py-2.5 text-right">Quantity</th>
                      <th className="px-4 py-2.5 text-right">Unit Price</th>
                      <th className="px-4 py-2.5 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {challan.items.map((item) => (
                      <tr key={item.id} className="text-slate-300">
                        <td className="px-4 py-3 font-medium text-white">{item.productName}</td>
                        <td className="px-4 py-3 font-mono text-xs">{item.sku}</td>
                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">{currency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-white">
                          {currency(item.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-4">
              <span className="text-sm font-semibold text-slate-300">Grand Total</span>
              <span className="text-xl font-bold text-indigo-400">{currency(challan.totalAmount)}</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="rounded-lg border border-slate-700 px-5 py-2 text-sm text-slate-300 hover:bg-slate-800"
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
