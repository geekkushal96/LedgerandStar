import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">Overview</div>
        <h1>Administrator dashboard</h1>
        <p>Platform-wide totals across users, stores, and ratings.</p>
      </div>

      {error && <div className="banner-error">{error}</div>}

      {stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="label">Total users</div>
            <div className="value">{stats.totalUsers}</div>
          </div>
          <div className="stat-card">
            <div className="label">Total stores</div>
            <div className="value">{stats.totalStores}</div>
          </div>
          <div className="stat-card">
            <div className="label">Total ratings submitted</div>
            <div className="value">{stats.totalRatings}</div>
          </div>
        </div>
      )}
    </div>
  );
}
