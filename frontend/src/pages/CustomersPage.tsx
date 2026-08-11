import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Loader2, Plus, Search, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Customer, CustomerListResponse, CustomerPayload, CustomerStatus, CustomerType } from '../types/customer';

const customerTypes: CustomerType[] = ['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'];
const customerStatuses: CustomerStatus[] = ['LEAD', 'ACTIVE', 'INACTIVE'];
const emptyForm: CustomerPayload = { name: '', mobile: '', email: '', businessName: '', gstNumber: '', customerType: 'RETAIL', address: '', status: 'LEAD', followUpDate: null, notes: '' };

const badgeClass: Record<CustomerStatus, string> = {
  LEAD: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  ACTIVE: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  INACTIVE: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
};

const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value)) : '—';
const inputClass = 'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-indigo-500';

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

  useEffect(() => { loadCustomers(1); }, [search, status, customerType]); // Filters always reset to the first page.

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
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Customer CRM</h2>
          <p className="mt-1 text-sm text-slate-400">Search, review, and maintain customer records.</p>
        </div>
        {canManage && <button onClick={() => setFormCustomer(null)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"><Plus className="h-4 w-4" />Add Customer</button>}
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-3">
        <label className="relative md:col-span-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, business, mobile..." className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-100 outline-none focus:border-indigo-500" /></label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}><option value="">All statuses</option>{customerStatuses.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <select value={customerType} onChange={(event) => setCustomerType(event.target.value)} className={inputClass}><option value="">All customer types</option>{customerTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      </div>

      {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">{error}</div>}

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        {loading ? <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-400"><Loader2 className="h-5 w-5 animate-spin" />Loading customers...</div> : customers.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center text-slate-400"><UserRound className="h-8 w-8" /><p>No customers match these filters.</p>{canManage && <button onClick={() => setFormCustomer(null)} className="text-sm text-indigo-400 hover:text-indigo-300">Add the first customer</button>}</div> : <><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="border-b border-slate-800 bg-slate-950/50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Business</th><th className="px-5 py-3">Mobile</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Follow-up</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-800">{customers.map((customer) => <tr key={customer.id} className="text-slate-300 hover:bg-slate-800/40"><td className="px-5 py-4 font-medium text-slate-100">{customer.name}</td><td className="px-5 py-4">{customer.businessName || '—'}</td><td className="px-5 py-4">{customer.mobile || '—'}</td><td className="px-5 py-4">{customer.customerType}</td><td className="px-5 py-4"><span className={`rounded-full border px-2 py-1 text-xs font-medium ${badgeClass[customer.status]}`}>{customer.status}</span></td><td className="px-5 py-4">{formatDate(customer.followUpDate)}</td><td className="px-5 py-4 text-right"><button onClick={() => openDetail(customer)} className="text-indigo-400 hover:text-indigo-300">View</button>{canManage && <button onClick={() => setFormCustomer(customer)} className="ml-4 text-slate-300 hover:text-white">Edit</button>}</td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-slate-800 px-5 py-3 text-sm text-slate-400"><span>{pagination.total} customer{pagination.total === 1 ? '' : 's'}</span><div className="flex items-center gap-3"><button disabled={pagination.page <= 1} onClick={() => loadCustomers(pagination.page - 1)} className="disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span>Page {pagination.page} of {pagination.totalPages}</span><button disabled={pagination.page >= pagination.totalPages} onClick={() => loadCustomers(pagination.page + 1)} className="disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div></>}
      </div>

      {selected && <CustomerDetail customer={selected} canManage={canManage} onClose={closePanels} onEdit={() => { setFormCustomer(selected); setSelected(null); }} />}
      {formCustomer !== undefined && <CustomerForm customer={formCustomer} onClose={closePanels} onSaved={afterSaved} />}
    </div>
  );
};

const CustomerDetail: React.FC<{ customer: Customer; canManage: boolean; onClose: () => void; onEdit: () => void }> = ({ customer, canManage, onClose, onEdit }) => <div className="fixed inset-0 z-30 flex justify-end bg-slate-950/70"><section className="h-full w-full max-w-xl overflow-y-auto border-l border-slate-800 bg-slate-900 p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-wider text-indigo-400">Customer details</p><h3 className="mt-1 text-xl font-bold text-white">{customer.name}</h3></div><button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"><X className="h-5 w-5" /></button></div><div className="mt-6 grid grid-cols-2 gap-4 text-sm">{[['Business', customer.businessName], ['Mobile', customer.mobile], ['Email', customer.email], ['GST Number', customer.gstNumber], ['Customer Type', customer.customerType], ['Status', customer.status], ['Follow-up date', formatDate(customer.followUpDate)], ['Address', customer.address]].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-800 bg-slate-950 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 break-words text-slate-200">{value || '—'}</p></div>)}</div><div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm"><p className="text-xs text-slate-500">Notes</p><p className="mt-1 whitespace-pre-wrap text-slate-200">{customer.notes || 'No notes added.'}</p></div>{canManage && <button onClick={onEdit} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"><Edit3 className="h-4 w-4" />Edit customer</button>}</section></div>;

const CustomerForm: React.FC<{ customer: Customer | null; onClose: () => void; onSaved: (customer: Customer) => void }> = ({ customer, onClose, onSaved }) => {
  const [form, setForm] = useState<CustomerPayload>(customer ? { name: customer.name, mobile: customer.mobile, email: customer.email ?? '', businessName: customer.businessName, gstNumber: customer.gstNumber ?? '', customerType: customer.customerType, address: customer.address, status: customer.status, followUpDate: customer.followUpDate?.slice(0, 10) ?? null, notes: customer.notes ?? '' } : emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const set = (key: keyof CustomerPayload, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!form.name.trim()) { setError('Customer name is required.'); return; } setSubmitting(true); setError(null); try { const payload = { ...form, email: form.email || null, gstNumber: form.gstNumber || null, notes: form.notes || null, followUpDate: form.followUpDate || null }; const response = customer ? await api.patch<{ data: Customer }>(`/customers/${customer.id}`, payload) : await api.post<{ data: Customer }>('/customers', payload); onSaved(response.data.data); } catch (requestError: any) { setError(requestError?.response?.data?.message || 'Unable to save customer.'); } finally { setSubmitting(false); } };
  return <div className="fixed inset-0 z-30 overflow-y-auto bg-slate-950/70 p-4"><div className="mx-auto my-8 w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-wider text-indigo-400">Customer CRM</p><h3 className="mt-1 text-xl font-bold text-white">{customer ? 'Edit customer' : 'Add customer'}</h3></div><button onClick={onClose} disabled={submitting} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"><X className="h-5 w-5" /></button></div>{error && <div className="mt-5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>}<form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">{[['name', 'Name *'], ['mobile', 'Mobile'], ['email', 'Email'], ['businessName', 'Business Name'], ['gstNumber', 'GST Number'], ['address', 'Address']].map(([key, label]) => <label key={key} className={key === 'address' ? 'md:col-span-2' : ''}><span className="mb-1 block text-xs font-medium text-slate-400">{label}</span><input type={key === 'email' ? 'email' : 'text'} value={(form[key as keyof CustomerPayload] as string) ?? ''} onChange={(event) => set(key as keyof CustomerPayload, event.target.value)} className={inputClass} /></label>)}<label><span className="mb-1 block text-xs font-medium text-slate-400">Customer Type *</span><select value={form.customerType} onChange={(event) => set('customerType', event.target.value)} className={inputClass}>{customerTypes.map((item) => <option key={item}>{item}</option>)}</select></label><label><span className="mb-1 block text-xs font-medium text-slate-400">Status *</span><select value={form.status} onChange={(event) => set('status', event.target.value)} className={inputClass}>{customerStatuses.map((item) => <option key={item}>{item}</option>)}</select></label><label><span className="mb-1 block text-xs font-medium text-slate-400">Follow-up Date</span><input type="date" value={form.followUpDate ?? ''} onChange={(event) => set('followUpDate', event.target.value)} className={inputClass} /></label><label className="md:col-span-2"><span className="mb-1 block text-xs font-medium text-slate-400">Notes</span><textarea value={form.notes ?? ''} onChange={(event) => set('notes', event.target.value)} rows={4} className={inputClass} /></label><div className="flex justify-end gap-3 md:col-span-2"><button type="button" onClick={onClose} disabled={submitting} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Cancel</button><button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60">{submitting && <Loader2 className="h-4 w-4 animate-spin" />}{submitting ? 'Saving...' : 'Save customer'}</button></div></form></div></div>;
};
