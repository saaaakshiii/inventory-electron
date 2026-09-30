import { useEffect, useMemo, useState } from 'react';
import {
  FileBarChart,
  Download,
  Eye,
  Printer,
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
import type { StockRegisterItem } from '../services/stockRegister';
import type { User } from '../types';

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

interface ReportsProps {
  user: User;
}

export default function Reports({ user }: ReportsProps) {
  const [records, setRecords] = useState<StockRegisterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const [itemType, setItemType] = useState('All');

  async function loadReportData() {
    try {
      setLoading(true);
      setError('');

      const response = await getStockRegister(user.role, {
        limit: 200,
        offset: 0,
      });

      setRecords(response.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load report data',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReportData();
  }, [user.role]);

  const filteredRecords = useMemo(() => {
    if (itemType === 'All') {
      return records;
    }

    return records.filter(
      record => record.item_type === itemType,
    );
  }, [records, itemType]);

  const totals = useMemo(() => {
    return filteredRecords.reduce(
      (acc, record) => {
        acc.receivedQty += record.received.qty;
        acc.receivedAmount += record.received.amt;

        acc.issuedQty += record.issued.qty;
        acc.issuedAmount += record.issued.amt;

        acc.balanceQty += record.balance.qty;
        acc.balanceAmount += record.balance.amt;

        return acc;
      },
      {
        receivedQty: 0,
        receivedAmount: 0,
        issuedQty: 0,
        issuedAmount: 0,
        balanceQty: 0,
        balanceAmount: 0,
      },
    );
  }, [filteredRecords]);

  const chartData = [
    {
      name: 'Received',
      amount: totals.receivedAmount,
    },
    {
      name: 'Issued',
      amount: totals.issuedAmount,
    },
    {
      name: 'Balance',
      amount: totals.balanceAmount,
    },
  ];

  if (loading) {
    return (
      <div className="p-6 fade-in">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 text-blue-600 animate-spin" />
            <p className="text-sm text-slate-500">
              Loading report data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 fade-in">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="font-semibold text-red-700">
            Failed to load report
          </p>
          <p className="text-sm text-red-600 mt-2">{error}</p>

          <button
            onClick={loadReportData}
            className="mt-4 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (preview) {
    return (
      <ReportPreview
        user={user}
        records={filteredRecords}
        totals={totals}
        itemType={itemType}
        onClose={() => setPreview(false)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Reports
          </h1>

          <p className="text-sm text-slate-500 mt-0.5">
            Inventory report generated from the current stock register
          </p>
        </div>

        <button
          onClick={loadReportData}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4">
          Report Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Item Type
            </label>

            <select
              value={itemType}
              onChange={e => setItemType(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              <option value="CONSUMABLE">Consumable</option>
              <option value="NONCONSUMABLE">
                Non-Consumable
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Records
            </label>

            <div className="border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-700">
              {filteredRecords.length}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Report Source
            </label>

            <div className="border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-700">
              Current Stock Register
            </div>
          </div>

        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={() => setPreview(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition shadow-sm"
          >
            <Eye className="w-4 h-4" />
            Preview Report
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <SummaryCard
          label="Records"
          value={filteredRecords.length.toLocaleString('en-IN')}
          icon={<Package className="w-5 h-5" />}
          color="text-slate-700"
          bg="bg-slate-50"
        />

        <SummaryCard
          label="Total Received"
          value={fmt(totals.receivedAmount)}
          icon={<FileBarChart className="w-5 h-5" />}
          color="text-blue-700"
          bg="bg-blue-50"
        />

        <SummaryCard
          label="Total Issued"
          value={fmt(totals.issuedAmount)}
          icon={<FileBarChart className="w-5 h-5" />}
          color="text-orange-700"
          bg="bg-orange-50"
        />

        <SummaryCard
          label="Current Stock Value"
          value={fmt(totals.balanceAmount)}
          icon={<Package className="w-5 h-5" />}
          color="text-emerald-700"
          bg="bg-emerald-50"
        />

      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">

        <h3 className="text-sm font-bold text-slate-800">
          Inventory Value Summary
        </h3>

        <p className="text-xs text-slate-500 mt-1 mb-5">
          Values calculated from the current stock register
        </p>

        <ResponsiveContainer width="100%" height={280}>
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
              tickFormatter={value =>
                `₹${(value / 1000).toLocaleString('en-IN')}k`
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
              name="Inventory Value"
              fill="#1d4ed8"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

      </div>

      {/* Real records */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-800">
            Stock Register Report
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            {filteredRecords.length} records from the backend
          </p>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">
              No stock records found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">
                    Date
                  </th>

                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">
                    Particulars
                  </th>

                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">
                    Type
                  </th>

                  <th className="text-right px-4 py-3 text-xs font-bold text-blue-600">
                    Received
                  </th>

                  <th className="text-right px-4 py-3 text-xs font-bold text-orange-600">
                    Issued
                  </th>

                  <th className="text-right px-4 py-3 text-xs font-bold text-emerald-600">
                    Balance
                  </th>

                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredRecords.map(record => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50"
                  >

                    <td className="px-4 py-3 text-xs text-slate-600">
                      {new Date(
                        record.date_of_entry,
                      ).toLocaleDateString('en-GB')}
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">
                        {record.article_name}
                      </p>

                      <p className="text-xs text-slate-400">
                        {record.particulars}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-xs">
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold">
                        {record.item_type}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-blue-700">
                        {record.received.qty}
                      </p>

                      <p className="text-xs text-slate-400">
                        {fmt(record.received.amt)}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-orange-700">
                        {record.issued.qty}
                      </p>

                      <p className="text-xs text-slate-400">
                        {fmt(record.issued.amt)}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <p className="font-bold text-emerald-700">
                        {record.balance.qty}
                      </p>

                      <p className="text-xs text-slate-400">
                        {fmt(record.balance.amt)}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          record.status === 'SUBMITTED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {record.status}
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
  );
}

function SummaryCard({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <div
      className={`${bg} rounded-xl p-4 border border-slate-200`}
    >
      <div className={`${color} mb-2`}>
        {icon}
      </div>

      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className={`text-xl font-bold mono mt-1 ${color}`}>
        {value}
      </p>
    </div>
  );
}

interface ReportPreviewProps {
  user: User;
  records: StockRegisterItem[];
  totals: {
    receivedQty: number;
    receivedAmount: number;
    issuedQty: number;
    issuedAmount: number;
    balanceQty: number;
    balanceAmount: number;
  };
  itemType: string;
  onClose: () => void;
}

function ReportPreview({
  user,
  records,
  totals,
  itemType,
  onClose,
}: ReportPreviewProps) {
  return (
    <div className="p-6 fade-in">

      <div className="flex items-center justify-between mb-5">

        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Report Preview
          </h1>

          <p className="text-sm text-slate-500 mt-0.5">
            Current Inventory Report
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg"
          >
            Close
          </button>

        </div>

      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center border-b border-slate-200 p-8">

          <div className="w-16 h-16 bg-blue-700 rounded-full mx-auto mb-3 flex items-center justify-center">
            <FileBarChart className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-xl font-bold text-slate-800 uppercase">
            Stock Pilot
          </h2>

          <p className="text-slate-500 text-sm mt-1">
            Department of Inventory Management
          </p>

          <div className="mt-4 inline-block bg-blue-50 border border-blue-200 rounded-lg px-6 py-2">
            <p className="text-sm font-bold text-blue-800 uppercase tracking-widest">
              Current Inventory Report
            </p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-4 text-sm">

            <div className="text-left">
              <p className="text-slate-500 text-xs">
                Report Type
              </p>

              <p className="font-semibold text-slate-800">
                Current Stock Register
              </p>
            </div>

            <div className="text-center">
              <p className="text-slate-500 text-xs">
                Generated By
              </p>

              <p className="font-semibold text-slate-800">
                {user.email}
              </p>
            </div>

            <div className="text-right">
              <p className="text-slate-500 text-xs">
                Generated On
              </p>

              <p className="font-semibold text-slate-800">
                {new Date().toLocaleString('en-IN')}
              </p>
            </div>

          </div>

        </div>

        {/* Summary */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">

          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
            Summary
          </h3>

          <div className="grid grid-cols-4 gap-4">

            <ReportValue
              label="Stock Received"
              value={fmt(totals.receivedAmount)}
              color="text-blue-700"
            />

            <ReportValue
              label="Stock Issued"
              value={fmt(totals.issuedAmount)}
              color="text-orange-700"
            />

            <ReportValue
              label="Current Stock"
              value={fmt(totals.balanceAmount)}
              color="text-emerald-700"
            />

            <ReportValue
              label="Records"
              value={records.length.toLocaleString('en-IN')}
              color="text-slate-700"
            />

          </div>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">

          <table className="w-full text-xs">

            <thead className="bg-slate-800 text-white">

              <tr>
                <th className="text-left px-4 py-3">
                  Date
                </th>

                <th className="text-left px-4 py-3">
                  Article
                </th>

                <th className="text-left px-4 py-3">
                  Type
                </th>

                <th className="text-right px-4 py-3">
                  Received Qty
                </th>

                <th className="text-right px-4 py-3">
                  Received Amount
                </th>

                <th className="text-right px-4 py-3">
                  Issued Qty
                </th>

                <th className="text-right px-4 py-3">
                  Issued Amount
                </th>

                <th className="text-right px-4 py-3">
                  Balance Qty
                </th>

                <th className="text-right px-4 py-3">
                  Balance Amount
                </th>
              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {records.map(record => (
                <tr key={record.id}>

                  <td className="px-4 py-3">
                    {new Date(
                      record.date_of_entry,
                    ).toLocaleDateString('en-GB')}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    {record.article_name}
                  </td>

                  <td className="px-4 py-3">
                    {record.item_type}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {record.received.qty}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {fmt(record.received.amt)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {record.issued.qty}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {fmt(record.issued.amt)}
                  </td>

                  <td className="px-4 py-3 text-right font-bold">
                    {record.balance.qty}
                  </td>

                  <td className="px-4 py-3 text-right font-bold">
                    {fmt(record.balance.amt)}
                  </td>

                </tr>
              ))}

            </tbody>

            <tfoot className="bg-slate-100 border-t-2 border-slate-300">

              <tr className="font-bold">

                <td
                  colSpan={3}
                  className="px-4 py-3"
                >
                  TOTAL
                </td>

                <td className="px-4 py-3 text-right">
                  {totals.receivedQty}
                </td>

                <td className="px-4 py-3 text-right">
                  {fmt(totals.receivedAmount)}
                </td>

                <td className="px-4 py-3 text-right">
                  {totals.issuedQty}
                </td>

                <td className="px-4 py-3 text-right">
                  {fmt(totals.issuedAmount)}
                </td>

                <td className="px-4 py-3 text-right">
                  {totals.balanceQty}
                </td>

                <td className="px-4 py-3 text-right">
                  {fmt(totals.balanceAmount)}
                </td>

              </tr>

            </tfoot>

          </table>

        </div>

        <div className="p-8 border-t border-slate-200">

          <div className="grid grid-cols-3 gap-8 mt-8">

            {[
              'Data Entry Operator',
              'Inventory Officer',
              'Administrator',
            ].map(role => (
              <div
                key={role}
                className="text-center"
              >
                <div className="border-t border-slate-400 pt-3">
                  <p className="text-xs font-semibold text-slate-600">
                    {role}
                  </p>

                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Signature & Date
                  </p>
                </div>
              </div>
            ))}

          </div>

        </div>

      </div>
    </div>
  );
}

function ReportValue({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </p>

      <p className={`text-sm font-bold mono mt-1 ${color}`}>
        {value}
      </p>
    </div>
  );
}