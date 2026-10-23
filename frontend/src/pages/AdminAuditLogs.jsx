import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import {
  ScrollText,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  ShieldCheck,
  RefreshCw,
  XCircle
} from 'lucide-react';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (actionFilter) params.action = actionFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/audit-logs', { params });
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Error fetching audit trail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, statusFilter]);

  const handleExportCsv = async () => {
    try {
      const res = await api.get('/audit-logs/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ExamVault_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export audit report.');
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.details && l.details.toLowerCase().includes(search.toLowerCase())) ||
      (l.ip_address && l.ip_address.includes(search))
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> SUCCESS
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold">
            <AlertTriangle className="w-3 h-3 text-amber-500" /> BLOCKED (TIME-LOCK)
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-bold">
            <ShieldAlert className="w-3 h-3 text-rose-600 animate-pulse" /> TAMPER WARNING
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-[10px] font-bold">
            <XCircle className="w-3 h-3 text-slate-500" /> FAILED
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Forensic Security & Access Audit Trail
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immutable forensic ledger tracking logins, cryptographic operations, tamper detections, and policy enforcement.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-sm shadow-md transition self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Forensic CSV Report</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, action, details or IP..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="">All Action Categories</option>
          <option value="LOGIN">Authentication & 2FA</option>
          <option value="PAPER_UPLOAD">Upload & Encryption</option>
          <option value="PAPER_DECRYPT">Decryption & Verification</option>
          <option value="TIMELOCK">Time-Lock Block Events</option>
          <option value="TAMPER">Tampering Alerts</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="">All Statuses</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="BLOCKED">BLOCKED</option>
          <option value="WARNING">WARNING (Tamper)</option>
          <option value="FAILED">FAILED</option>
        </select>

        <button
          onClick={fetchLogs}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          title="Refresh Logs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Logs Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Querying forensic audit ledger...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ScrollText className="w-10 h-10 mx-auto mb-3 text-slate-400 opacity-60" />
            <p className="text-sm font-semibold">No audit entries found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Timestamp (UTC)</th>
                  <th className="px-6 py-4">User & Role</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4">Action Event</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Cryptographic Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    
                    {/* Timestamp */}
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(log.timestamp).toISOString().replace('T', ' ').slice(0, 19)}
                    </td>

                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="font-sans font-bold text-slate-900 dark:text-white">
                        {log.user}
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                        {log.role}
                      </span>
                    </td>

                    {/* IP */}
                    <td className="px-6 py-4 text-slate-500">
                      {log.ip_address || '127.0.0.1'}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {log.action}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4 font-sans">
                      {getStatusBadge(log.status)}
                    </td>

                    {/* Details */}
                    <td className="px-6 py-4 text-slate-500 font-sans text-xs max-w-xs truncate" title={log.details}>
                      {log.details || '-'}
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
};

export default AdminAuditLogs;
