import { useEffect, useState } from 'react';
import api from '../api/axios';
import RatingSeal from '../components/RatingSeal';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/store-owner/dashboard')
      .then((res) => {
        setData(res.data)
        // console.log(data)
        }
      )
      .catch((err) => {setError(err.response?.data?.message || 'Failed to load dashboard')
        // console.log(err)
        }
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state">Loading…</div>;

  if (error) {
    return (
      <div>
        <div className="page-header">
          <div className="eyebrow">Store Owner</div>
          <h1>My store</h1>
        </div>
        <div className="banner-error">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">Store Owner</div>
        <h1>{data.store.name}</h1>
        <p>{data.store.address}</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Average rating</div>
          <div style={{ marginTop: 4 }}>
            <RatingSeal value={data.averageRating} />
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Total ratings</div>
          <div className="value">{data.raters.length}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16, fontSize: 20 }}>Customers who rated your store</h3>
        {data.raters.length === 0 ? (
          <div className="empty-state">No ratings submitted yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {data.raters.map((r) => (
                <tr key={r.userId}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>
                    <RatingSeal value={r.rating} size="small" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
