import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Package,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

import {
  getStockRegisterById,
  type StockRegisterItem,
} from '../services/stockRegister';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

interface StockDetailProps {
  stockId: string;
  role: string;
  onBack: () => void;
}

export default function StockDetail({
  stockId,
  role,
  onBack,
}: StockDetailProps) {
  const [item, setItem] =
    useState<StockRegisterItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadItem() {
      setLoading(true);
      setError('');

      try {
        const result =
          await getStockRegisterById(
            role,
            stockId,
          );

        if (!cancelled) {
          setItem(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load stock item.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (stockId) {
      loadItem();
    } else {
      setLoading(false);
      setError('No stock item was selected.');
    }

    return () => {
      cancelled = true;
    };
  }, [stockId, role]);

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[500px] text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mb-3" />
        <p className="font-medium">
          Loading stock details...
        </p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[500px] text-center">
        <Package className="w-16 h-16 mb-4 text-slate-300" />

        <p className="font-medium text-slate-700">
          {error || 'Item not found'}
        </p>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button
          onClick={onBack}
          className="mt-5 text-blue-700 text-sm font-semibold hover:text-blue-800"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  const isOutOfStock =
    item.balance.qty === 0;

  const statusBg = isOutOfStock
    ? 'bg-red-100 text-red-700'
    : 'bg-emerald-100 text-emerald-700';

  const statusLabel = isOutOfStock
    ? 'OUT OF STOCK'
    : 'IN STOCK';

  /*
   * This chart represents the values available in the
   * current stock-register record.
   *
   * It is intentionally NOT called a historical trend
   * because the current backend does not expose a
   * movement-history endpoint.
   */
  const chartData = [
    {
      name: 'Received',
      quantity: item.received.qty,
      amount: item.received.amt,
    },
    {
      name: 'Issued',
      quantity: item.issued.qty,
      amount: item.issued.amt,
    },
    {
      name: 'Balance',
      quantity: item.balance.qty,
      amount: item.balance.amt,
    },
  ];

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {item.article_name}
          </h1>

          <p className="text-sm text-slate-500">
            {item.item_type}
            {item.indent_number
              ? ` · Indent ${item.indent_number}`
              : ''}
          </p>
        </div>

        <span
          className={`ml-auto text-xs font-bold px-3 py-1.5 rounded-full ${statusBg}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Particulars */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <p className="text-xs font-medium text-slate-500 mb-1">
          Particulars
        </p>

        <p className="text-sm font-semibold text-slate-800">
          {item.particulars}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 mb-1">
            Current Balance
          </p>

          <p className="text-2xl font-bold mono text-blue-700">
            {item.balance.qty}
          </p>

          <p className="text-xs text-slate-400 mt-1 mono">
            {fmt(item.balance.amt)}
          </p>
        </div>

        <div className="bg-emerald-50 rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 mb-1">
            Total Received
          </p>

          <p className="text-2xl font-bold mono text-emerald-700">
            {item.received.qty}
          </p>

          <p className="text-xs text-slate-400 mt-1 mono">
            {fmt(item.received.amt)}
          </p>
        </div>

        <div className="bg-orange-50 rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 mb-1">
            Total Issued
          </p>

          <p className="text-2xl font-bold mono text-orange-700">
            {item.issued.qty}
          </p>

          <p className="text-xs text-slate-400 mt-1 mono">
            {fmt(item.issued.amt)}
          </p>
        </div>
      </div>

      {/* Information + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">
            Item Information
          </h3>

          <dl className="space-y-3">
            {[
              [
                'Item Type',
                item.item_type,
              ],
              [
                'Indent Number',
                item.indent_number || '—',
              ],
              [
                'Order Number',
                item.order_number || '—',
              ],
              [
                'Bill Number',
                item.bill_number || '—',
              ],
              [
                'Issued To',
                item.issued_to?.length
                  ? item.issued_to.join(', ')
                  : '—',
              ],
              [
                'Received Rate',
                fmt(item.received.rate),
              ],
              [
                'Issued Rate',
                fmt(item.issued.rate),
              ],
              [
                'Status',
                item.status,
              ],
              [
                'Date Added',
                new Date(
                  item.date_of_entry,
                ).toLocaleString('en-IN'),
              ],
              [
                'Last Modified',
                new Date(
                  item.date_of_modification,
                ).toLocaleString('en-IN'),
              ],
              [
                'Operator ID',
                item.operator_id || '—',
              ],
            ].map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between gap-4"
              >
                <dt className="text-xs text-slate-500 font-medium">
                  {key}
                </dt>

                <dd className="text-xs text-slate-800 font-semibold text-right break-all">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Stock Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            Stock Summary
          </h3>

          <p className="text-xs text-slate-500 mb-4">
            Quantity and value from the current register entry
          </p>

          <ResponsiveContainer
            width="100%"
            height={240}
          >
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
              />

              <XAxis
                dataKey="name"
                tick={{
                  fontSize: 11,
                  fill: '#64748b',
                }}
              />

              <YAxis
                tick={{
                  fontSize: 11,
                  fill: '#64748b',
                }}
              />

              <Tooltip
                formatter={(
                  value,
                  name,
                ) => [
                  name === 'amount'
                    ? fmt(Number(value))
                    : value,
                  name === 'amount'
                    ? 'Amount'
                    : 'Quantity',
                ]}
                contentStyle={{
                  borderRadius: 8,
                  border:
                    '1px solid #e2e8f0',
                  fontSize: 12,
                }}
              />

              <Bar
                dataKey="quantity"
                name="Quantity"
                fill="#1d4ed8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">
            Stock Transaction Details
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Values stored for this stock register entry
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {[
                  'Type',
                  'Quantity',
                  'Rate',
                  'Amount',
                ].map((heading) => (
                  <th
                    key={heading}
                    className="text-left px-5 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-700">
                    Received
                  </span>
                </td>

                <td className="px-5 py-3 mono font-semibold text-slate-800">
                  {item.received.qty}
                </td>

                <td className="px-5 py-3 mono text-slate-600">
                  {fmt(item.received.rate)}
                </td>

                <td className="px-5 py-3 mono font-bold text-slate-800">
                  {fmt(item.received.amt)}
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-orange-100 text-orange-700">
                    Issued
                  </span>
                </td>

                <td className="px-5 py-3 mono font-semibold text-slate-800">
                  {item.issued.qty}
                </td>

                <td className="px-5 py-3 mono text-slate-600">
                  {fmt(item.issued.rate)}
                </td>

                <td className="px-5 py-3 mono font-bold text-slate-800">
                  {fmt(item.issued.amt)}
                </td>
              </tr>

              <tr className="bg-slate-50">
                <td className="px-5 py-3 font-bold text-slate-700">
                  Balance
                </td>

                <td className="px-5 py-3 mono font-bold text-emerald-700">
                  {item.balance.qty}
                </td>

                <td className="px-5 py-3">
                  —
                </td>

                <td className="px-5 py-3 mono font-bold text-emerald-700">
                  {fmt(item.balance.amt)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Dates */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4">
          Record Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500">
              Date of Entry
            </p>

            <p className="text-sm font-semibold text-slate-800 mt-1">
              {new Date(
                item.date_of_entry,
              ).toLocaleString('en-IN')}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Date of Modification
            </p>

            <p className="text-sm font-semibold text-slate-800 mt-1">
              {new Date(
                item.date_of_modification,
              ).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}