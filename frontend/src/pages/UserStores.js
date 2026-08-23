import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import RatingSeal from '../components/RatingSeal';
import StarInput from '../components/StarInput';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.name) params.name = filters.name;
      if (filters.address) params.address = filters.address;
      const { data } = await api.get('/stores', { params });
      setStores(data.stores);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stores');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(fetchStores, 300); // debounce search
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const rate = async (storeId, rating) => {
    setSavingId(storeId);
    try {
      await api.post(`/stores/${storeId}/rating`, { rating });
      setStores((prev) =>
        prev.map((s) => (s.id === storeId ? { ...s, userRating: rating } : s))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">Directory</div>
        <h1>Browse stores</h1>
        <p>Search registered stores and submit or update your rating.</p>
      </div>

      {error && <div className="banner-error">{error}</div>}

      <div className="filter-bar">
        <input
          placeholder="Search by name…"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          placeholder="Search by address…"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
        />
      </div>

      {loading ? (
        <div className="empty-state">Loading stores…</div>
      ) : stores.length === 0 ? (
        <div className="empty-state">No stores match your search.</div>
      ) : (
        <div className="store-grid">
          {stores.map((store) => (
            <div className="store-card" key={store.id}>
              <div className="store-card-top">
                <div>
                  <h3>{store.name}</h3>
                  <div className="address">{store.address}</div>
                </div>
                <RatingSeal value={store.overallRating} />
              </div>

              <div className="divider" />

              <div className="your-rating-label">
                {store.userRating ? 'Your rating — tap to change' : 'Tap to rate this store'}
              </div>
              <StarInput
                value={store.userRating || 0}
                disabled={savingId === store.id}
                onChange={(n) => rate(store.id, n)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
