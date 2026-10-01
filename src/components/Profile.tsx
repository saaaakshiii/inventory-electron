import { useEffect, useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { getStockRegister } from '../services/stockRegister';
import type { User } from '../types';

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

interface StockMovementProps {
  user: User;
}

interface Movement {
  id: string;
  date: string;
  itemName: string;
  type: 'received' | 'issued';
  quantity: number;
  rate: number;
  amount: number;
  updatedBy: string;
}

export default function StockMovement({ user }: StockMovementProps) {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMovements() {
      try {
        setLoading(true);
        setError('');

        const response = await getStockRegister(user.role, {
          limit: 200,
          offset: 0,
        });

        const derivedMovements: Movement[] = [];

        response.items.forEach((item) => {
          const date = new Date(item.date_of_entry).toLocaleDateString(
            'en-GB',
          );

          if (item.received.qty > 0) {
            derivedMovements.push({
              id: `${item.id}-received`,
              date,
              itemName: item.article_name,
              type: 'received',
              quantity: item.received.qty,
              rate: item.received.rate,
              amount: item.received.amt,
              updatedBy: item.operator_id || '—',
            });
          }

          if (item.issued.qty > 0) {
            derivedMovements.push({
              id: `${item.id}-issued`,
              date,
              itemName: item.article_name,
              type: 'issued',
              quantity: item.issued.qty,
              rate: item.issued.rate,
              amount: item.issued.amt,
              updatedBy: item.operator_id || '—',
            });
          }
        });

        setMovements(derivedMovements);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load stock movement data.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadMovements();
  }, [user.role]);

  const totalReceived = movements
    .filter((m) => m.type === 'received')
    .reduce((sum, m) => sum + m.amount, 0);

  const totalIssued = movements
    .filter((m) => m.type === 'issued')
    .reduce((sum, m) => sum + m.amount, 0);

  const chartData = useMemo(() => {
    return [
      {
        name: 'Received',
        amount: totalReceived,
      },
      {
        name: 'Issued',
        amount: totalIssued,
      },
    ];
  }, [totalReceived, totalIssued]);

  const typeConfig = {
    received: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    issued: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      icon: <TrendingDown className="w-4 h-4" />,
    },
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500">
            Loading stock movement...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">
          <p className="font-semibold">Unable to load stock movement</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Stock Movement
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Movement summary derived from the current stock register
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500">
            Total Received
          </p>
          <p className="text-2xl font-bold mono mt-1 text-emerald-700">
            {fmt(totalReceived)}
          </p>
        </div>

        <div className="bg-orange-50 rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500">
            Total Issued
          </p>
          <p className="text-2xl font-bold mono mt-1 text-orange-700">
            {fmt(totalIssued)}
          </p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500">
            Movement Records
          </p>
          <p className="text-2xl font-bold mono mt-1 text-blue-700">
            {movements.length}
          </p>
        </div>
      </div>

      {/* Chart */}
      {movements.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            Stock Movement Summary
          </h3>

          <p className="text-xs text-slate-500 mb-4">
            Values derived from current stock-register entries
          </p>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
              />

              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
              />

              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(value) =>
                  '₹' + Number(value / 1000).toFixed(1) + 'k'
                }
              />

              <Tooltip
                formatter={(value) => [
                  fmt(Number(value ?? 0)),
                  'Amount',
                ]}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                }}
              />

              <Legend />

              <Bar
                dataKey="amount"
                name="Amount"
                fill="#1d4ed8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Transaction table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">
            Movement Records
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            These records are derived from received and issued quantities
            in the stock register.
          </p>
        </div>

        {movements.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">
              No stock movement data available
            </p>
            <p className="text-sm mt-1">
              Add stock records with received or issued quantities.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[
                    'Date',
                    'Item',
                    'Type',
                    'Quantity',
                    'Rate',
                    'Amount',
                    'Operator',
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
                {movements.map((movement) => {
                  const config = typeConfig[movement.type];

                  return (
                    <tr
                      key={movement.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-3 mono text-xs text-slate-600 whitespace-nowrap">
                        {movement.date}
                      </td>

                      <td className="px-5 py-3 font-medium text-slate-800">
                        {movement.itemName}
                      </td>

                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${config.bg} ${config.text}`}
                        >
                          {config.icon}
                          {movement.type}
                        </span>
                      </td>

                      <td className="px-5 py-3 mono font-semibold text-slate-800">
                        {movement.quantity}
                      </td>

                      <td className="px-5 py-3 mono text-slate-600">
                        {fmt(movement.rate)}
                      </td>

                      <td className="px-5 py-3 mono font-bold text-slate-800">
                        {fmt(movement.amount)}
                      </td>

                      <td className="px-5 py-3 text-slate-600 text-xs">
                        {movement.updatedBy}
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
  );
}