import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import RatingSeal from '../components/RatingSeal';
import SortableHeader from '../components/SortableHeader';
import { validateName, validateAddress, validateEmail } from '../utils/validators';

function AddStoreModal({ onClose, onCreated }) {
  const [owners, setOwners] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get('/admin/users', { params: { role: 'store_owner' } })
      .then((res) => setOwners(res.data.users))
      .catch(() => {});
  }, []);

  const validate = () => {
    const e = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
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
      await api.post('/admin/stores', {
        ...form,
        ownerId: form.ownerId || undefined,
      });
      onCreated();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 16 }}>Add a new store</h3>
        {apiError && <div className="banner-error">{apiError}</div>}
        <form onSubmit={submit} noValidate>
          <div className="form-group">
            <label>Store name</label>
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
            <label>Store owner (optional)</label>
            <select
              value={form.ownerId}
              onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
            >
              <option value="">— No owner assigned yet —</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.email})
                </option>
              ))}
            </select>
            <div className="form-hint">
              Only users already created with the "Store Owner" role appear here.
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, sortBy, order };
      const { data } = await api.get('/admin/stores', { params });
      setStores(data.stores);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stores');
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, order]);

  useEffect(() => {
    const t = setTimeout(fetchStores, 300);
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
          <h1>Stores</h1>
          <p>All stores registered on the platform.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add store
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
      </div>

      {loading ? (
        <div className="empty-state">Loading stores…</div>
      ) : stores.length === 0 ? (
        <div className="empty-state">No stores found.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <SortableHeader label="Name" field="name" sortBy={sortBy} order={order} onSort={toggleSort} />
              <SortableHeader label="Email" field="email" sortBy={sortBy} order={order} onSort={toggleSort} />
              <SortableHeader label="Address" field="address" sortBy={sortBy} order={order} onSort={toggleSort} />
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.address}</td>
                <td>
                  <RatingSeal value={s.averageRating} size="small" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <AddStoreModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            fetchStores();
          }}
        />
      )}
    </div>
  );
}
