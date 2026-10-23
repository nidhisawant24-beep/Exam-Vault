import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  XCircle,
  Mail,
  Lock,
  Phone,
  Building,
  KeyRound,
  X,
  Search,
  Clock,
  UserCheck
} from 'lucide-react';

const AdminFacultyManager = () => {
  const [faculty, setFaculty] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Computer Engineering');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [facRes, pendRes] = await Promise.all([
        api.get('/admin/faculty'),
        api.get('/admin/pending-registrations')
      ]);
      setFaculty(facRes.data.faculty || []);
      setPendingUsers(pendRes.data.pending || []);
    } catch (err) {
      console.error('Failed to load faculty & pending users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (userId, userName) => {
    try {
      const res = await api.post(`/admin/pending-registrations/${userId}/approve`);
      alert(res.data.message || `Approved ${userName}!`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve registration.');
    }
  };

  const handleReject = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to reject registration request for ${userEmail}?`)) return;
    try {
      const res = await api.post(`/admin/pending-registrations/${userId}/reject`);
      alert(res.data.message || 'Registration rejected.');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject registration.');
    }
  };

  const handleToggleStatus = async (facultyId) => {
    try {
      await api.put(`/admin/faculty/${facultyId}/toggle-status`);
      fetchData();
    } catch (err) {
      alert('Failed to update faculty status.');
    }
  };

  const handleDelete = async (facultyId, facultyEmail) => {
    if (!window.confirm(`Are you sure you want to delete faculty member ${facultyEmail}?`)) return;
    try {
      await api.delete(`/admin/faculty/${facultyId}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete faculty member.');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      await api.post('/admin/faculty', {
        name,
        email,
        phone,
        password,
        department,
      });
      setShowAddModal(false);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create faculty member.');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredFaculty = faculty.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      (f.phone && f.phone.includes(search)) ||
      f.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Faculty Access & User Governance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review self-registration requests, approve academic accounts, and manage role-based privileges.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision Faculty Manually</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* PENDING SELF-REGISTRATION APPROVALS SECTION          */}
      {/* ---------------------------------------------------- */}
      <div className="bg-amber-50/50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-800/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-amber-200 dark:border-amber-800/60">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-base text-amber-950 dark:text-amber-200">
              Pending Self-Registration Approvals
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 text-xs font-extrabold">
              {pendingUsers.length} Pending
            </span>
          </div>
          <span className="text-xs text-amber-800 dark:text-amber-400 font-medium">
            Administrative Approval Required for Login
          </span>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="py-6 text-center text-xs text-amber-800 dark:text-amber-400">
            No pending registration requests at this time. All user registrations have been resolved.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingUsers.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-900 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                      {p.role}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Registered: {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {p.name}
                  </h3>
                  <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400 font-mono">
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.email}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.phone || 'No phone provided'}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-sans">{p.department}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(p.id, p.name)}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Registry</span>
                  </button>
                  <button
                    onClick={() => handleReject(p.id, p.email)}
                    className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold text-xs transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* APPROVED FACULTY ROSTER TABLE                        */}
      {/* ---------------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white">
            Approved Faculty Roster ({filteredFaculty.length})
          </h2>

          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-500">Retrieving faculty directory...</p>
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Users className="w-10 h-10 mx-auto mb-3 text-slate-400 opacity-60" />
              <p className="text-sm font-semibold">No faculty members found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Faculty Member</th>
                    <th className="px-6 py-4">Contact (Email / Phone)</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">PKI Status</th>
                    <th className="px-6 py-4">Account Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredFaculty.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0">
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">
                              {item.name}
                            </p>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                              Approved Faculty
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-[11px] space-y-0.5">
                        <p className="text-slate-700 dark:text-slate-300">{item.email}</p>
                        <p className="text-slate-400">{item.phone || 'No phone'}</p>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                        {item.department}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold text-blue-700 dark:text-blue-300 font-mono">
                          <KeyRound className="w-3 h-3" /> RSA-2048 Ready
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(item.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border transition ${
                            item.is_active
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                          }`}
                        >
                          {item.is_active ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Suspended</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(item.id, item.email)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                          title="Delete Faculty Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Manual Provision Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Manual Faculty Provisioning
                </h3>
                <p className="text-xs text-slate-500">
                  Pre-approved account with generated RSA-2048 keypair
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Ada Lovelace"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="lovelace@examvault.edu"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition disabled:opacity-50"
                >
                  {formLoading ? 'Generating RSA Keys...' : 'Register Faculty'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminFacultyManager;
