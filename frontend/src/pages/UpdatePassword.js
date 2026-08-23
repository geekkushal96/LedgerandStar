import { useState } from 'react';
import api from '../api/axios';
import { validatePassword } from '../utils/validators';

export default function UpdatePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const pwError = validatePassword(form.newPassword);
    if (pwError) {
      setError(pwError);
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/update-password', form);
      setSuccess('Password updated successfully.');
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">Account</div>
        <h1>Update password</h1>
        <p>Change the password used to sign in to your account.</p>
      </div>

      <div className="card" style={{ maxWidth: 420 }}>
        {error && <div className="banner-error">{error}</div>}
        {success && <div className="banner-success">{success}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Current password</label>
            <input
              type="password"
              required
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>New password</label>
            <input
              type="password"
              required
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            />
            <div className="form-hint">8–16 characters, at least one uppercase letter and one special character.</div>
          </div>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving…' : 'Save new password'}
          </button>
        </form>
      </div>
    </div>
  );
}
