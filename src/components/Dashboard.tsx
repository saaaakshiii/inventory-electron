import { useEffect, useMemo, useState } from "react";
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { getStockRegister } from "../services/stockRegister";
import type { User } from "../types";

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

interface DashboardProps {
  user: User;
  onNavigate: (page: string, id?: string) => void;
}

export default function Dashboard({ user, onNavigate }: DashboardProps) {
  const [chartRange, setChartRange] = useState<"week" | "month">("month");
  const [records, setRecords] = useState<
    Awaited<ReturnType<typeof getStockRegister>>["items"]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await getStockRegister(user.role, {
          limit: 200,
          offset: 0,
        });

        setRecords(response.items);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user.role]);

  const totalItems = records.length;

  const totalQty = records.reduce((sum, r) => sum + r.balance.qty, 0);

  const totalValue = records.reduce((sum, r) => sum + r.balance.amt, 0);

  const receivedThisMonth = records.reduce((sum, r) => sum + r.received.qty, 0);

  const issuedThisMonth = records.reduce((sum, r) => sum + r.issued.qty, 0);

  const totalReceivedAmount = records.reduce(
    (sum, r) => sum + r.received.amt,
    0,
  );

  const totalIssuedAmount = records.reduce((sum, r) => sum + r.issued.amt, 0);

  const chartData = [
    {
      name: "Received",
      received: totalReceivedAmount,
      issued: 0,
    },
    {
      name: "Issued",
      received: 0,
      issued: totalIssuedAmount,
    },
  ];

  const chartKey = "name";

  const categoryData = useMemo(() => {
    const consumable = records.filter(
      (r) => r.item_type === "CONSUMABLE",
    ).length;

    const nonConsumable = records.filter(
      (r) => r.item_type === "NONCONSUMABLE",
    ).length;

    const total = consumable + nonConsumable;

    if (!total) return [];

    return [
      {
        name: "Consumable",
        value: Math.round((consumable / total) * 100),
        color: "#2563eb",
      },
      {
        name: "Non-Consumable",
        value: Math.round((nonConsumable / total) * 100),
        color: "#7c3aed",
      },
    ].filter((item) => item.value > 0);
  }, [records]);

  const recentActivity = useMemo(() => {
    return records
      .flatMap((record) => {
        const date = new Date(record.date_of_entry).toLocaleDateString("en-GB");

        const activities = [];

        if (record.received.qty > 0) {
          activities.push({
            id: `${record.id}-received`,
            type: "received" as const,
            quantity: record.received.qty,
            itemName: record.article_name,
            date,
            amount: record.received.amt,
            updatedBy: record.operator_id || "—",
          });
        }

        if (record.issued.qty > 0) {
          activities.push({
            id: `${record.id}-issued`,
            type: "issued" as const,
            quantity: record.issued.qty,
            itemName: record.article_name,
            date,
            amount: record.issued.amt,
            updatedBy: record.operator_id || "—",
          });
        }

        return activities;
      })
      .slice(0, 6);
  }, [records]);

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome back, {user.name.split(" ")[0]}. Here's today's inventory
            overview.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Last updated: 29-09-2026 09:30 AM</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          {
            label: "Total Items",
            value: totalItems.toLocaleString(),
            sub: "Unique stock items",
            icon: <Package className="w-5 h-5" />,
            color: "text-blue-700",
            bg: "bg-blue-50",
          },
          {
            label: "Total Stock",
            value: totalQty.toLocaleString(),
            sub: "Units across all items",
            icon: <Package className="w-5 h-5" />,
            color: "text-violet-700",
            bg: "bg-violet-50",
          },
          {
            label: "Stock Value",
            value: fmt(totalValue),
            sub: "Current total valuation",
            icon: <TrendingUp className="w-5 h-5" />,
            color: "text-emerald-700",
            bg: "bg-emerald-50",
          },
          {
            label: "Received",
            value: "+" + receivedThisMonth.toLocaleString(),
            sub: "Units this month",
            icon: <ArrowUpRight className="w-5 h-5" />,
            color: "text-emerald-700",
            bg: "bg-emerald-50",
          },
          {
            label: "Issued",
            value: "-" + issuedThisMonth.toLocaleString(),
            sub: "Units this month",
            icon: <ArrowDownRight className="w-5 h-5" />,
            color: "text-orange-700",
            bg: "bg-orange-50",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`${card.bg} ${card.color} p-2 rounded-lg`}>
                {card.icon}
              </div>
            </div>
            <p className={`text-xl font-bold ${card.color} mono`}>
              {card.value}
            </p>
            <p className="text-xs font-semibold text-slate-700 mt-1">
              {card.label}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Movement Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Stock Movement
              </h3>
              <p className="text-xs text-slate-500">
                Received vs Issued by {chartRange}
              </p>
            </div>
            <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
              {(["week", "month"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${chartRange === r ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {r === "week" ? "Week" : "Month"}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartData}
              margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey={chartKey}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(v) => "₹" + v / 1000 + "k"}
              />
              <Tooltip
                formatter={(value: any) => [
                  "₹" + value.toLocaleString("en-IN"),
                  "",
                ]}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="received"
                name="Received"
                fill="#1d4ed8"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="issued"
                name="Issued"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            Category Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">By stock percentage</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: any) => [`${v}%`, ""]}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 11,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-3">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: c.color }}
                  />
                  <span className="text-[11px] text-slate-600">{c.name}</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-700 mono">
                  {c.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Recent Stock Activity
              </h3>
              <p className="text-xs text-slate-500">Latest transactions</p>
            </div>
            <button
              onClick={() => onNavigate("stock-movement")}
              className="text-xs text-blue-700 font-semibold hover:text-blue-800"
            >
              View All →
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentActivity.map((mv) => {
              const typeConfig = {
                received: {
                  bg: "bg-emerald-100",
                  text: "text-emerald-700",
                  label: "Received",
                },
                issued: {
                  bg: "bg-orange-100",
                  text: "text-orange-700",
                  label: "Issued",
                },
              }[mv.type];

              return (
                <div key={mv.id} className="flex items-center gap-3 px-5 py-3">
                  <div
                    className={`w-8 h-8 rounded-full ${typeConfig.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    {mv.type === "received" ? (
                      <TrendingUp
                        className={`w-3.5 h-3.5 ${typeConfig.text}`}
                      />
                    ) : (
                      <TrendingDown
                        className={`w-3.5 h-3.5 ${typeConfig.text}`}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">
                      <span className={`font-semibold ${typeConfig.text}`}>
                        {mv.quantity} {typeConfig.label.toLowerCase()}
                      </span>
                      {" · "}
                      {mv.itemName}
                    </p>

                    <p className="text-[11px] text-slate-400">
                      {mv.date} · {mv.updatedBy}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-slate-700 mono">
                      {fmt(mv.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
            {/* return (
                <div key={mv.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`w-8 h-8 rounded-full ${typeConfig.bg} flex items-center justify-center flex-shrink-0`}>
                    {mv.type === 'received' ? <TrendingUp className={`w-3.5 h-3.5 ${typeConfig.text}`} /> :
                     mv.type === 'issued' ? <TrendingDown className={`w-3.5 h-3.5 ${typeConfig.text}`} /> :
                     <RefreshCw className={`w-3.5 h-3.5 ${typeConfig.text}`} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">
                      <span className={`font-semibold ${typeConfig.text}`}>{mv.quantity} {mv.type === 'received' ? 'received' : mv.type === 'issued' ? 'issued' : 'adjusted'}</span>
                      {' · '}{mv.itemName}
                    </p>
                    <p className="text-[11px] text-slate-400">{mv.date} · {mv.updatedBy}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-slate-700 mono">{fmt(mv.amount)}</p>
                  </div>
                </div>
              );
            })} */}
          </div>
        </div>
      </div>
    </div>
  );
}
