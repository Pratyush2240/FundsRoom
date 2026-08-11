import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Loader2, Plus, Search, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Customer, CustomerListResponse, CustomerPayload, CustomerStatus, CustomerType } from '../types/customer';

const customerTypes: CustomerType[] = ['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'];
const customerStatuses: CustomerStatus[] = ['LEAD', 'ACTIVE', 'INACTIVE'];
const emptyForm: CustomerPayload = { name: '', mobile: '', email: '', businessName: '', gstNumber: '', customerType: 'RETAIL', address: '', status: 'LEAD', followUpDate: null, notes: '' };

const badgeClass: Record<CustomerStatus, string> = {
  LEAD: 'bg-[#FDF8F0] text-[#B7791F] border border-[#F3E2C7]',
  ACTIVE: 'bg-[#EAF4EF] text-[#2F7D5B] border border-[#C4E3D4]',
  INACTIVE: 'bg-[#F0F0EE] text-[#6B6B6B] border border-[#E5E5E2]',
};

const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value)) : '—';
const inputClass = 'w-full rounded-md border border-[#E5E5E2] bg-white px-3 py-2 text-xs text-[#252525] outline-none placeholder:text-[#6B6B6B]/60 focus:border-[#2F3437]';

export const CustomersPage: React.FC = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'SALES';
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [formCustomer, setFormCustomer] = useState<Customer | null | undefined>(undefined);

  const loadCustomers = useCallback(async (page = pagination.page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<CustomerListResponse>('/customers', { params: { page, pageSize: 10, ...(search ? { search } : {}), ...(status ? { status } : {}), ...(customerType ? { customerType } : {}) } });
      setCustomers(response.data.data);
      setPagination(response.data.pagination);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Unable to load customers.');
    } finally {
      setLoading(false);
    }
  }, [search, status, customerType, pagination.page]);

  useEffect(() => { loadCustomers(1); }, [search, status, customerType]);

  const openDetail = async (customer: Customer) => {
    setError(null);
    try {
      const response = await api.get<{ data: Customer }>(`/customers/${customer.id}`);
      setSelected(response.data.data);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Unable to load customer details.');
    }
  };

  const closePanels = () => { setSelected(null); setFormCustomer(undefined); };
  const afterSaved = (customer: Customer) => { closePanels(); setSelected(customer); loadCustomers(1); };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-6 font-sans">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#252525]">Customer CRM</h2>
          <p className="mt-0.5 text-xs text-[#6B6B6B]">Search accounts, manage contact details, and update sales pipeline status.</p>
        </div>
        {canManage && (
          <button onClick={() => setFormCustomer(null)} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2F3437] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1F2326] transition shadow-2xs">
            <Plus className="h-3.5 w-3.5" /> Add Customer
          </button>
        )}
      </div>

      <div className="grid gap-3 rounded-lg border border-[#E5E5E2] bg-white p-4 md:grid-cols-3 shadow-2xs">
        <label className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6B6B6B]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, mobile, business..." className="w-full rounded-md border border-[#E5E5E2] bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-[#2F3437]" />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
          <option value="">All statuses</option>
          {customerStatuses.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={customerType} onChange={(e) => setCustomerType(e.target.value)} className={inputClass}>
          <option value="">All customer types</option>
          {customerTypes.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      {error && <div className="rounded-md border border-[#F5C6C6] bg-[#FDF2F2] p-4 text-xs font-medium text-[#B84A4A]">{error}</div>}

      <div className="overflow-hidden rounded-lg border border-[#E5E5E2] bg-white shadow-2xs">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-xs text-[#6B6B6B]"><Loader2 className="h-4 w-4 animate-spin text-[#2F3437]" />Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center text-xs text-[#6B6B6B]">No customers match these filters.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-xs">
                <thead className="border-b border-[#E5E5E2] bg-[#F7F7F5] text-[11px] uppercase tracking-wider text-[#6B6B6B]">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Business</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Follow-up</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E2]">
                  {customers.map((c) => (
                    <tr key={c.id} className="text-[#252525] hover:bg-[#F7F7F5]/60">
                      <td className="px-4 py-3 font-medium">{c.name}<div className="text-[11px] text-[#6B6B6B]">{c.mobile}</div></td>
                      <td className="px-4 py-3">{c.businessName || '—'}</td>
                      <td className="px-4 py-3">{c.customerType}</td>
                      <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-[10px] font-bold ${badgeClass[c.status]}`}>{c.status}</span></td>
                      <td className="px-4 py-3 text-[11px] text-[#6B6B6B]">{formatDate(c.followUpDate)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openDetail(c)} className="rounded border border-[#E5E5E2] px-2.5 py-1 text-xs text-[#252525] hover:bg-[#F7F7F5]">View</button>
                          {canManage && <button onClick={() => setFormCustomer(c)} className="rounded border border-[#E5E5E2] px-2 py-1 text-xs text-[#252525] hover:bg-[#F7F7F5]"><Edit3 className="h-3.5 w-3.5" /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-[#E5E5E2] px-4 py-3 text-xs text-[#6B6B6B]">
              <span>{pagination.total} records</span>
              <div className="flex gap-3 items-center">
                <button disabled={pagination.page <= 1} onClick={() => loadCustomers(pagination.page - 1)} className="disabled:opacity-40 hover:text-[#252525]">Previous</button>
                <span>Page {pagination.page} of {pagination.totalPages}</span>
                <button disabled={pagination.page >= pagination.totalPages} onClick={() => loadCustomers(pagination.page + 1)} className="disabled:opacity-40 hover:text-[#252525]">Next</button>
              </div>
            </div>
          </>
        )}
      </div>

      {selected && <CustomerDetail customer={selected} canManage={canManage} onClose={closePanels} onEdit={() => setFormCustomer(selected)} />}
      {formCustomer !== undefined && <CustomerForm customer={formCustomer} onClose={closePanels} onSaved={afterSaved} />}
    </div>
  );
};

const CustomerDetail: React.FC<{ customer: Customer; canManage: boolean; onClose: () => void; onEdit: () => void }> = ({ customer, canManage, onClose, onEdit }) => (
  <div className="fixed inset-0 z-30 overflow-y-auto bg-black/40 p-4 flex items-center justify-center">
    <div className="mx-auto w-full max-w-lg rounded-lg border border-[#E5E5E2] bg-white p-6 shadow-md text-xs text-[#252525]">
      <div className="flex items-start justify-between border-b border-[#E5E5E2] pb-3">
        <div><h3 className="text-base font-bold">{customer.name}</h3><p className="text-[#6B6B6B]">{customer.businessName || 'No business name'}</p></div>
        <button onClick={onClose} className="rounded p-1 text-[#6B6B6B] hover:bg-[#F7F7F5]"><X className="h-4 w-4" /></button>
      </div>
      <div className="grid gap-3 py-4 grid-cols-2">
        <div><span className="text-[#6B6B6B] block text-[10px] uppercase font-bold">Mobile</span>{customer.mobile}</div>
        <div><span className="text-[#6B6B6B] block text-[10px] uppercase font-bold">Email</span>{customer.email || '—'}</div>
        <div><span className="text-[#6B6B6B] block text-[10px] uppercase font-bold">Type</span>{customer.customerType}</div>
        <div><span className="text-[#6B6B6B] block text-[10px] uppercase font-bold">Status</span><span className={`rounded px-2 py-0.5 text-[10px] font-bold ${badgeClass[customer.status]}`}>{customer.status}</span></div>
        <div><span className="text-[#6B6B6B] block text-[10px] uppercase font-bold">GST</span>{customer.gstNumber || '—'}</div>
        <div><span className="text-[#6B6B6B] block text-[10px] uppercase font-bold">Follow-up</span>{formatDate(customer.followUpDate)}</div>
        <div className="col-span-2"><span className="text-[#6B6B6B] block text-[10px] uppercase font-bold">Address</span>{customer.address || '—'}</div>
        <div className="col-span-2"><span className="text-[#6B6B6B] block text-[10px] uppercase font-bold">Notes</span>{customer.notes || '—'}</div>
      </div>
      <div className="flex justify-end gap-2 border-t border-[#E5E5E2] pt-3">
        <button onClick={onClose} className="rounded border border-[#E5E5E2] px-3 py-1.5 text-xs text-[#252525]">Close</button>
        {canManage && <button onClick={onEdit} className="rounded bg-[#2F3437] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1F2326]">Edit Customer</button>}
      </div>
    </div>
  </div>
);

const CustomerForm: React.FC<{ customer: Customer | null; onClose: () => void; onSaved: (customer: Customer) => void }> = ({ customer, onClose, onSaved }) => {
  const [form, setForm] = useState<CustomerPayload>(customer ? { name: customer.name, mobile: customer.mobile, email: customer.email || '', businessName: customer.businessName || '', gstNumber: customer.gstNumber || '', customerType: customer.customerType, address: customer.address || '', status: customer.status, followUpDate: customer.followUpDate ? customer.followUpDate.slice(0, 10) : null, notes: customer.notes || '' } : emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const update = (key: keyof CustomerPayload, value: any) => setForm((c) => ({ ...c, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile?.trim()) { setError('Name and mobile are required.'); return; }
    setSubmitting(true); setError(null);
    try {
      const response = customer ? await api.patch<{ data: Customer }>(`/customers/${customer.id}`, form) : await api.post<{ data: Customer }>('/customers', form);
      onSaved(response.data.data);
    } catch (err: any) { setError(err?.response?.data?.message || 'Unable to save customer.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-black/40 p-4 flex items-center justify-center">
      <div className="mx-auto w-full max-w-lg rounded-lg border border-[#E5E5E2] bg-white p-6 shadow-md text-xs text-[#252525]">
        <div className="flex items-start justify-between border-b border-[#E5E5E2] pb-3">
          <h3 className="text-base font-bold">{customer ? 'Edit Customer' : 'Add Customer'}</h3>
          <button onClick={onClose} className="rounded p-1 text-[#6B6B6B] hover:bg-[#F7F7F5]"><X className="h-4 w-4" /></button>
        </div>
        {error && <div className="mt-3 rounded border border-[#F5C6C6] bg-[#FDF2F2] p-3 text-xs text-[#B84A4A]">{error}</div>}
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label><span className="block text-[10px] font-bold uppercase text-[#6B6B6B] mb-1">Name *</span><input value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} required /></label>
            <label><span className="block text-[10px] font-bold uppercase text-[#6B6B6B] mb-1">Mobile *</span><input value={form.mobile} onChange={(e) => update('mobile', e.target.value)} className={inputClass} required /></label>
            <label><span className="block text-[10px] font-bold uppercase text-[#6B6B6B] mb-1">Email</span><input type="email" value={form.email || ''} onChange={(e) => update('email', e.target.value)} className={inputClass} /></label>
            <label><span className="block text-[10px] font-bold uppercase text-[#6B6B6B] mb-1">Business Name</span><input value={form.businessName || ''} onChange={(e) => update('businessName', e.target.value)} className={inputClass} /></label>
            <label><span className="block text-[10px] font-bold uppercase text-[#6B6B6B] mb-1">Type</span><select value={form.customerType} onChange={(e) => update('customerType', e.target.value as CustomerType)} className={inputClass}>{customerTypes.map((t) => <option key={t}>{t}</option>)}</select></label>
            <label><span className="block text-[10px] font-bold uppercase text-[#6B6B6B] mb-1">Status</span><select value={form.status} onChange={(e) => update('status', e.target.value as CustomerStatus)} className={inputClass}>{customerStatuses.map((s) => <option key={s}>{s}</option>)}</select></label>
            <label><span className="block text-[10px] font-bold uppercase text-[#6B6B6B] mb-1">GST Number</span><input value={form.gstNumber || ''} onChange={(e) => update('gstNumber', e.target.value)} className={inputClass} /></label>
            <label><span className="block text-[10px] font-bold uppercase text-[#6B6B6B] mb-1">Follow-up Date</span><input type="date" value={form.followUpDate || ''} onChange={(e) => update('followUpDate', e.target.value || null)} className={inputClass} /></label>
          </div>
          <label className="block"><span className="block text-[10px] font-bold uppercase text-[#6B6B6B] mb-1">Address</span><input value={form.address || ''} onChange={(e) => update('address', e.target.value)} className={inputClass} /></label>
          <label className="block"><span className="block text-[10px] font-bold uppercase text-[#6B6B6B] mb-1">Notes</span><textarea value={form.notes || ''} onChange={(e) => update('notes', e.target.value)} rows={2} className={inputClass} /></label>
          <div className="flex justify-end gap-2 border-t border-[#E5E5E2] pt-3">
            <button type="button" onClick={onClose} className="rounded border border-[#E5E5E2] px-3 py-1.5 text-xs text-[#252525]">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded bg-[#2F3437] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1F2326] disabled:opacity-50">{submitting ? 'Saving...' : 'Save Customer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
