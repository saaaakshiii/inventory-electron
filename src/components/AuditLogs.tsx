import { ClipboardList, Shield, User, Eye } from 'lucide-react';
import { MOCK_AUDIT_LOGS } from '../data/mockData';
import type { UserRole } from '../types';

const ROLE_STYLES: Record<UserRole, { bg: string; text: string; label: string }> = {
  admin: { bg: 'bg-red-100', text: 'text-red-700', label: 'Admin' },
  operator: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Operator' },
  viewer: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Viewer' },
};

const ACTION_STYLES: Record<string, { bg: string; text: string }> = {
  'Added': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Received': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Issued': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Updated': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Deleted': { bg: 'bg-red-100', text: 'text-red-700' },
  'Generated': { bg: 'bg-violet-100', text: 'text-violet-700' },
  'Adjustment': { bg: 'bg-amber-100', text: 'text-amber-700' },
};

function getActionStyle(action: string) {
  const key = Object.keys(ACTION_STYLES).find(k => action.includes(k));
  return key ? ACTION_STYLES[key] : { bg: 'bg-slate-100', text: 'text-slate-600' };
}

export default function AuditLogs() {
  return (
    <div className="p-6 space-y-6 fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-0.5">Complete activity trail for accountability</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Actions', count: MOCK_AUDIT_LOGS.length, color: 'text-slate-700', bg: 'bg-slate-50' },
          { label: 'Admin Actions', count: MOCK_AUDIT_LOGS.filter(l => l.role === 'admin').length, color: 'text-red-700', bg: 'bg-red-50' },
          { label: 'Operator Actions', count: MOCK_AUDIT_LOGS.filter(l => l.role === 'operator').length, color: 'text-blue-700', bg: 'bg-blue-50' },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-xl p-4 border border-slate-200`}>
            <p className="text-xs font-medium text-slate-500">{c.label}</p>
            <p className={`text-3xl font-bold mono mt-1 ${c.color}`}>{c.count}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['User', 'Role', 'Action', 'Record', 'Date', 'Time', 'Details'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_AUDIT_LOGS.map(log => {
              const roleCfg = ROLE_STYLES[log.role];
              const actionCfg = getActionStyle(log.action);
              return (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-blue-700 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {log.user.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="font-semibold text-slate-800 text-xs">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleCfg.bg} ${roleCfg.text}`}>{roleCfg.label}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${actionCfg.bg} ${actionCfg.text}`}>{log.action}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-700 text-xs font-medium">{log.record}</td>
                  <td className="px-5 py-3 mono text-xs text-slate-500">{log.date}</td>
                  <td className="px-5 py-3 mono text-xs text-slate-500">{log.time}</td>
                  <td className="px-5 py-3 text-xs text-slate-400">{log.details || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
