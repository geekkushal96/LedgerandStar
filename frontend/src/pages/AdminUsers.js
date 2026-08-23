import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import RatingSeal from '../components/RatingSeal';
import SortableHeader from '../components/SortableHeader';
import { validateName, validateAddress, validateEmail, validatePassword } from '../utils/validators';

function AddUserModal({ onClose, onCreated }) {
  const [stores, setStores] = useState([]);
  const [form, setForm] = useState({
    name: '', email: '', address: '', password: '', role: 'user', storeId: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (form.role === 'store_owner') {
      api.get('/admin/stores').then((res) => setStores(res.data.stores)).catch(() => {});
    }
  }, [form.role]);

  const validate = () => {
    const e = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
    };
    setErrors(e);
    return Object.values(e).every((v) => !v);
  };

  const submit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/admin/users', { ...form, storeId: form.storeId || undefined });
      onCreated();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 16 }}>Add a new user</h3>
        {apiError && <div className="banner-error">{apiError}</div>}
        <form onSubmit={submit} noValidate>
          <div className="form-group">
            <label>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="20–60 characters"
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            {errors.address && <div className="form-error">{errors.address}</div>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="8–16 chars, 1 uppercase, 1 special"
            />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="user">Normal User</option>
              <option value="admin">System Administrator</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>
          {form.role === 'store_owner' && (
            <div className="form-group">
              <label>Link to store (optional)</label>
              <select value={form.storeId} onChange={(e) => setForm({ ...form, storeId: e.target.value })}>
                <option value="">— No store linked yet —</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create user'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserDetailModal({ userId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/admin/users/${userId}`)
      .then((res) => setDetail(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load user'));
  }, [userId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {error && <div className="banner-error">{error}</div>}
        {detail && (
          <>
            <h3 style={{ marginBottom: 4 }}>{detail.user.name}</h3>
            <span className={`tag tag-${detail.user.role}`}>{detail.user.role.replace('_', ' ')}</span>
            <div style={{ marginTop: 16, fontSize: 14, lineHeight: 1.8 }}>
              <div><strong>Email:</strong> {detail.user.email}</div>
              <div><strong>Address:</strong> {detail.user.address}</div>
              {detail.user.role === 'store_owner' && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <strong>Store rating:</strong> <RatingSeal value={detail.rating} size="small" />
                </div>
              )}
            </div>
          </>
        )}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, sortBy, order };
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, order]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortBy, order]);

  const toggleSort = (field) => {
    if (sortBy === field) setOrder(order === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="eyebrow">Directory</div>
          <h1>Users</h1>
          <p>Normal users, store owners, and administrators.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + Add user
        </button>
      </div>

      {error && <div className="banner-error">{error}</div>}

      <div className="filter-bar">
        <input
          placeholder="Filter by name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          placeholder="Filter by email"
          value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
        />
        <input
          placeholder="Filter by address"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
        />
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All roles</option>
          <option value="user">Normal User</option>
          <option value="admin">System Administrator</option>
          <option value="store_owner">Store Owner</option>
        </select>
      </div>

      {loading ? (
        <div className="empty-state">Loading users…</div>
      ) : users.length === 0 ? (
        <div className="empty-state">No users found.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <SortableHeader label="Name" field="name" sortBy={sortBy} order={order} onSort={toggleSort} />
              <SortableHeader label="Email" field="email" sortBy={sortBy} order={order} onSort={toggleSort} />
              <SortableHeader label="Address" field="address" sortBy={sortBy} order={order} onSort={toggleSort} />
              <SortableHeader label="Role" field="role" sortBy={sortBy} order={order} onSort={toggleSort} />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} onClick={() => setDetailId(u.id)} style={{ cursor: 'pointer' }}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.address}</td>
                <td><span className={`tag tag-${u.role}`}>{u.role.replace('_', ' ')}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            fetchUsers();
          }}
        />
      )}

      {detailId && <UserDetailModal userId={detailId} onClose={() => setDetailId(null)} />}
    </div>
  );
}
