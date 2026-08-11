import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MovementListResponse, StockMovement } from '../types/inventory';
import { Product, ProductListResponse } from '../types/product';

const inputClass = 'w-full rounded-md border border-[#E5E5E2] bg-white px-3 py-2 text-xs text-[#252525] outline-none placeholder:text-[#6B6B6B]/60 focus:border-[#2F3437]';
const formatDate = (value: string) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export const InventoryPage: React.FC = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [type, setType] = useState('');
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError(null);
    try {
      const response = await api.get<MovementListResponse>('/inventory/movements', { params: { page, pageSize: 10, ...(type ? { type } : {}), ...(productId ? { productId } : {}) } });
      setMovements(response.data.data);
      setPagination(response.data.pagination);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Unable to load stock movements.');
    } finally {
      setLoading(false);
    }
  }, [type, productId]);

  useEffect(() => { load(1); }, [load]);
  useEffect(() => { api.get<ProductListResponse>('/products', { params: { pageSize: 50 } }).then((response) => setProducts(response.data.data)).catch(() => undefined); }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-6 font-sans">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#252525]">Inventory Movements</h2>
          <p className="mt-0.5 text-xs text-[#6B6B6B]">Review stock history and record manual IN/OUT adjustments.</p>
        </div>
        {canManage && (
          <button onClick={() => setRecording(true)} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2F3437] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1F2326] transition shadow-2xs">
            <Plus className="h-3.5 w-3.5" /> Record Movement
          </button>
        )}
      </div>

      <div className="grid gap-3 rounded-lg border border-[#E5E5E2] bg-white p-4 md:grid-cols-2 shadow-2xs">
        <select value={type} onChange={(event) => setType(event.target.value)} className={inputClass}>
          <option value="">All movement types</option>
          <option value="IN">IN</option>
          <option value="OUT">OUT</option>
        </select>
        <select value={productId} onChange={(event) => setProductId(event.target.value)} className={inputClass}>
          <option value="">All products</option>
          {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>)}
        </select>
      </div>

      {error && <div className="rounded-md border border-[#F5C6C6] bg-[#FDF2F2] p-4 text-xs font-medium text-[#B84A4A]">{error}</div>}

      <div className="overflow-hidden rounded-lg border border-[#E5E5E2] bg-white shadow-2xs">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-xs text-[#6B6B6B]"><Loader2 className="h-4 w-4 animate-spin text-[#2F3437]" />Loading movements...</div>
        ) : movements.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center text-xs text-[#6B6B6B]">No stock movements found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-xs">
                <thead className="border-b border-[#E5E5E2] bg-[#F7F7F5] text-[11px] uppercase tracking-wider text-[#6B6B6B]">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Created by</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E2]">
                  {movements.map((movement) => (
                    <tr key={movement.id} className="text-[#252525] hover:bg-[#F7F7F5]/60">
                      <td className="px-4 py-3.5 text-[#6B6B6B] text-[11px]">{formatDate(movement.createdAt)}</td>
                      <td className="px-4 py-3.5 font-medium">{movement.product?.name || 'N/A'}</td>
                      <td className="px-4 py-3.5 font-mono text-[#6B6B6B]">{movement.product?.sku || 'N/A'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${movement.type === 'IN' ? 'bg-[#EAF4EF] text-[#2F7D5B] border-[#C4E3D4]' : 'bg-[#FDF2F2] text-[#B84A4A] border-[#F5C6C6]'}`}>
                          {movement.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold">{movement.type === 'OUT' ? `-${movement.quantity}` : `+${movement.quantity}`}</td>
                      <td className="px-4 py-3.5 text-[#6B6B6B]">{movement.reason}</td>
                      <td className="px-4 py-3.5">{movement.user?.name || 'User'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-[#E5E5E2] px-4 py-3 text-xs text-[#6B6B6B]">
              <span>{pagination.total} movements</span>
              <div className="flex gap-3 items-center">
                <button disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)} className="disabled:opacity-40 hover:text-[#252525]">Previous</button>
                <span>Page {pagination.page} of {pagination.totalPages}</span>
                <button disabled={pagination.page >= pagination.totalPages} onClick={() => load(pagination.page + 1)} className="disabled:opacity-40 hover:text-[#252525]">Next</button>
              </div>
            </div>
          </>
        )}
      </div>

      {recording && <MovementForm products={products} onClose={() => setRecording(false)} onSaved={() => { setRecording(false); load(1); }} />}
    </div>
  );
};

const MovementForm: React.FC<{ products: Product[]; onClose: () => void; onSaved: () => void }> = ({ products, onClose, onSaved }) => {
  const [productId, setProductId] = useState('');
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!productId || quantity <= 0 || !reason.trim()) { setError('Product, a positive quantity, and reason are required.'); return; }
    setSubmitting(true); setError(null);
    try {
      await api.post('/inventory/movements', { productId, type, quantity, reason });
      onSaved();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Unable to record movement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-black/40 p-4 flex items-center justify-center">
      <div className="mx-auto w-full max-w-lg rounded-lg border border-[#E5E5E2] bg-white p-6 shadow-md text-xs text-[#252525]">
        <div className="flex items-start justify-between border-b border-[#E5E5E2] pb-3">
          <div><h3 className="text-base font-bold">Record Stock Movement</h3></div>
          <button onClick={onClose} disabled={submitting} className="rounded p-1 text-[#6B6B6B] hover:bg-[#F7F7F5]"><X className="h-4 w-4" /></button>
        </div>
        {error && <div className="mt-3 rounded border border-[#F5C6C6] bg-[#FDF2F2] p-3 text-xs text-[#B84A4A]">{error}</div>}
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block"><span className="mb-1 block text-[10px] font-bold uppercase text-[#6B6B6B]">Product *</span><select value={productId} onChange={(e) => setProductId(e.target.value)} className={inputClass}><option value="">Select product</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku}) — stock {p.currentStock}</option>)}</select></label>
          <label className="block"><span className="mb-1 block text-[10px] font-bold uppercase text-[#6B6B6B]">Type *</span><select value={type} onChange={(e) => setType(e.target.value as 'IN' | 'OUT')} className={inputClass}><option value="IN">IN (Stock addition)</option><option value="OUT">OUT (Stock reduction)</option></select></label>
          <label className="block"><span className="mb-1 block text-[10px] font-bold uppercase text-[#6B6B6B]">Quantity *</span><input type="number" min="1" step="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className={inputClass} /></label>
          <label className="block"><span className="mb-1 block text-[10px] font-bold uppercase text-[#6B6B6B]">Reason *</span><textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className={inputClass} placeholder="e.g. Received shipment, Damaged goods adjustment..." /></label>
          <div className="flex justify-end gap-2 border-t border-[#E5E5E2] pt-3">
            <button type="button" onClick={onClose} className="rounded border border-[#E5E5E2] px-3 py-1.5 text-xs text-[#252525]">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded bg-[#2F3437] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1F2326] disabled:opacity-50">{submitting ? 'Recording...' : 'Record Movement'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
