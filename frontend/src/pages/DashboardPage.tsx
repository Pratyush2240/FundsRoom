import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Package,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { api } from '../services/api';
import { CustomerListResponse } from '../types/customer';
import { Product, ProductListResponse } from '../types/product';
import { ChallanListItem, ChallanListResponse } from '../types/challan';
import { MovementListResponse, StockMovement } from '../types/inventory';

const currency = (val: number | string) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(
    Number(val)
  );

const formatDate = (val: string) =>
  new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(val));

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ customers: 0, products: 0, lowStock: 0, challans: 0 });
  const [recentChallans, setRecentChallans] = useState<ChallanListItem[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<StockMovement[]>([]);
  const [systemHealth, setSystemHealth] = useState({ api: 'Operational', db: 'Connected' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [custRes, prodRes, lowStockRes, challanRes, recentChallanRes, inventoryRes, healthRes] =
        await Promise.all([
          api.get<CustomerListResponse>('/customers', { params: { pageSize: 1 } }),
          api.get<ProductListResponse>('/products', { params: { pageSize: 1 } }),
          api.get<ProductListResponse>('/products', { params: { lowStock: true, pageSize: 5 } }),
          api.get<ChallanListResponse>('/challans', { params: { pageSize: 1 } }),
          api.get<ChallanListResponse>('/challans', { params: { pageSize: 5 } }),
          api.get<MovementListResponse>('/inventory/movements', { params: { pageSize: 5 } }).catch(() => null),
          api.get('/health').catch(() => null),
        ]);

      setStats({
        customers: custRes.data.pagination.total,
        products: prodRes.data.pagination.total,
        lowStock: lowStockRes.data.pagination.total,
        challans: challanRes.data.pagination.total,
      });
      setLowStockProducts(lowStockRes.data.data);
      setRecentChallans(recentChallanRes.data.data);

      if (inventoryRes?.data?.data) {
        setInventoryMovements(inventoryRes.data.data);
      }

      if (healthRes?.data) {
        const dbState = healthRes.data.database === 'connected' ? 'Connected' : 'Disconnected';
        setSystemHealth({ api: 'Operational', db: dbState });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-6 font-sans">
      {error && (
        <div className="rounded-md border border-[#F5C6C6] bg-[#FDF2F2] p-4 text-xs font-medium text-[#B84A4A]">
          {error}
        </div>
      )}

      {/* Metric Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Customers */}
        <div
          onClick={() => navigate('/customers')}
          className="cursor-pointer rounded-lg border border-[#E5E5E2] bg-white p-4 shadow-2xs transition hover:border-[#6B6B6B]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">Customers</span>
            <div className="rounded-md bg-[#F0F2F1] p-2 text-[#5B6B63]">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-[#252525]">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-[#6B6B6B]" /> : stats.customers}
            </p>
            <p className="mt-1 text-xs text-[#6B6B6B]">Active customers &amp; leads</p>
          </div>
        </div>

        {/* Total Products */}
        <div
          onClick={() => navigate('/products')}
          className="cursor-pointer rounded-lg border border-[#E5E5E2] bg-white p-4 shadow-2xs transition hover:border-[#6B6B6B]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">Products</span>
            <div className="rounded-md bg-[#F0F2F1] p-2 text-[#5B6B63]">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-[#252525]">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-[#6B6B6B]" /> : stats.products}
            </p>
            <p className="mt-1 text-xs text-[#6B6B6B]">Catalog items</p>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div
          onClick={() => navigate('/products')}
          className="cursor-pointer rounded-lg border border-[#E5E5E2] bg-white p-4 shadow-2xs transition hover:border-[#B7791F]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">Low Stock</span>
            <div className="rounded-md bg-[#FDF8F0] p-2 text-[#B7791F]">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-[#B84A4A]">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-[#6B6B6B]" /> : stats.lowStock}
            </p>
            <p className="mt-1 text-xs text-[#6B6B6B]">Items at or below minimum</p>
          </div>
        </div>

        {/* Total Sales Challans */}
        <div
          onClick={() => navigate('/challans')}
          className="cursor-pointer rounded-lg border border-[#E5E5E2] bg-white p-4 shadow-2xs transition hover:border-[#6B6B6B]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">Sales Challans</span>
            <div className="rounded-md bg-[#F0F2F1] p-2 text-[#5B6B63]">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-[#252525]">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-[#6B6B6B]" /> : stats.challans}
            </p>
            <p className="mt-1 text-xs text-[#6B6B6B]">Confirmed dispatches</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Challans & Low Stock */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Recent Sales Challans */}
        <div className="lg:col-span-7 flex flex-col rounded-lg border border-[#E5E5E2] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E2]">
            <h3 className="font-bold text-[#252525] text-sm">Recent Sales Challans</h3>
            <button
              onClick={() => navigate('/challans')}
              className="text-xs font-semibold text-[#252525] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="flex-1 pt-4">
            {loading ? (
              <div className="flex min-h-52 items-center justify-center gap-2 text-xs text-[#6B6B6B]">
                <Loader2 className="h-4 w-4 animate-spin text-[#2F3437]" /> Loading recent challans...
              </div>
            ) : recentChallans.length === 0 ? (
              <div className="flex min-h-52 flex-col items-center justify-center text-center p-6">
                <div className="rounded-lg bg-[#F7F7F5] p-3 text-[#6B6B6B]">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-bold text-[#252525]">No sales challans recorded yet.</p>
                <p className="mt-1 text-xs text-[#6B6B6B] max-w-xs">
                  Create a new challan to track dispatches and update inventory levels.
                </p>
                <button
                  onClick={() => navigate('/challans')}
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#2F3437] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#1F2326] transition"
                >
                  Create Challan
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E5E5E2] text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B] bg-[#F7F7F5]">
                      <th className="py-2 px-3">Challan No.</th>
                      <th className="py-2 px-3">Customer</th>
                      <th className="py-2 px-3">Items</th>
                      <th className="py-2 px-3">Total</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E2]">
                    {recentChallans.map((challan) => (
                      <tr key={challan.id} className="text-[#252525] hover:bg-[#F7F7F5]/60">
                        <td className="py-2.5 px-3 font-mono font-medium text-[#252525]">
                          {challan.challanNumber}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[#252525]">
                          {challan.customer.name}
                        </td>
                        <td className="py-2.5 px-3 text-[#6B6B6B]">{challan.itemCount || 1}</td>
                        <td className="py-2.5 px-3 font-medium text-[#252525]">{currency(challan.totalAmount)}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                              challan.status === 'CONFIRMED'
                                ? 'bg-[#EAF4EF] text-[#2F7D5B] border border-[#C4E3D4]'
                                : 'bg-[#FDF8F0] text-[#B7791F] border border-[#F3E2C7]'
                            }`}
                          >
                            {challan.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-[11px] text-[#6B6B6B]">
                          {formatDate(challan.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Items Alert */}
        <div className="lg:col-span-5 flex flex-col rounded-lg border border-[#E5E5E2] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E2]">
            <h3 className="font-bold text-[#252525] text-sm">Low Stock Items</h3>
            <span className="rounded bg-[#FDF2F2] px-2 py-0.5 text-[10px] font-bold text-[#B84A4A] border border-[#F5C6C6] uppercase tracking-wider">
              Action Req
            </span>
          </div>

          <div className="flex-1 pt-4">
            {loading ? (
              <div className="flex min-h-52 items-center justify-center gap-2 text-xs text-[#6B6B6B]">
                <Loader2 className="h-4 w-4 animate-spin text-[#2F3437]" /> Loading stock alerts...
              </div>
            ) : lowStockProducts.length === 0 ? (
              <div className="flex min-h-52 items-center justify-center text-xs text-[#2F7D5B] font-medium">
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> All products have healthy stock levels.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E5E5E2] text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B] bg-[#F7F7F5]">
                      <th className="py-2 px-3">Product / SKU</th>
                      <th className="py-2 px-3 text-center">Stock</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E2]">
                    {lowStockProducts.map((product) => (
                      <tr key={product.id} className="text-[#252525] hover:bg-[#F7F7F5]/60">
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-[#252525] block">{product.name}</span>
                          <span className="font-mono text-[10px] text-[#6B6B6B] uppercase">{product.sku}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-bold text-[#252525]">{product.currentStock}</span>
                          <span className="text-[10px] text-[#6B6B6B] block">Min: {product.minimumStock}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="rounded border border-[#F3E2C7] bg-[#FDF8F0] px-2 py-0.5 text-[10px] font-semibold text-[#B7791F]">
                            Low stock
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Inventory Activity */}
      <div className="rounded-lg border border-[#E5E5E2] bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E2]">
          <h3 className="font-bold text-[#252525] text-sm">Recent Inventory Activity</h3>
          <button className="text-[#6B6B6B] hover:text-[#252525] transition">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="pt-4">
          {loading ? (
            <div className="flex min-h-36 items-center justify-center gap-2 text-xs text-[#6B6B6B]">
              <Loader2 className="h-4 w-4 animate-spin text-[#2F3437]" /> Loading inventory activity...
            </div>
          ) : inventoryMovements.length === 0 ? (
            <div className="flex min-h-36 items-center justify-center text-xs text-[#6B6B6B]">
              No recent inventory activity recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E5E2] text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B] bg-[#F7F7F5]">
                    <th className="py-2 px-3">Product</th>
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3">Movement</th>
                    <th className="py-2 px-3">Qty</th>
                    <th className="py-2 px-3">Reason</th>
                    <th className="py-2 px-3">Created By</th>
                    <th className="py-2 px-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E2]">
                  {inventoryMovements.map((movement) => {
                    const initials = movement.user?.name
                      ? movement.user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'US';
                    return (
                      <tr key={movement.id} className="text-[#252525] hover:bg-[#F7F7F5]/60">
                        <td className="py-2.5 px-3 font-semibold text-[#252525]">{movement.product?.name || 'N/A'}</td>
                        <td className="py-2.5 px-3 font-mono text-[#6B6B6B] text-[11px]">{movement.product?.sku || 'N/A'}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                              movement.type === 'OUT'
                                ? 'bg-[#FDF2F2] text-[#B84A4A] border border-[#F5C6C6]'
                                : 'bg-[#EAF4EF] text-[#2F7D5B] border border-[#C4E3D4]'
                            }`}
                          >
                            {movement.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[#252525]">
                          {movement.type === 'OUT' ? `-${movement.quantity}` : `+${movement.quantity}`}
                        </td>
                        <td className="py-2.5 px-3 text-[#6B6B6B]">{movement.reason}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-[#E9ECEB] text-[9px] font-bold text-[#252525]">
                              {initials}
                            </span>
                            <span className="text-[#252525] font-medium">{movement.user?.name || 'User'}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right text-[11px] text-[#6B6B6B]">
                          {formatDate(movement.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* System Health Status Indicator */}
      <div className="flex items-center justify-end gap-6 pt-2 pb-4 text-xs font-medium text-[#6B6B6B]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#2F7D5B]" />
          <span>
            API: <strong className="font-semibold text-[#252525]">{systemHealth.api}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#2F7D5B]" />
          <span>
            Database: <strong className="font-semibold text-[#252525]">{systemHealth.db}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
