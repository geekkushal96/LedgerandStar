import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_BY_ROLE = {
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/stores', label: 'Stores' },
    { to: '/admin/users', label: 'Users' },
    { to: '/account/password', label: 'Password' },
  ],
  user: [
    { to: '/stores', label: 'Browse Stores' },
    { to: '/account/password', label: 'Password' },
  ],
  store_owner: [
    { to: '/owner/dashboard', label: 'My Store' },
    { to: '/account/password', label: 'Password' },
  ],
};

const ROLE_LABEL = {
  admin: 'System Administrator',
  user: 'Normal User',
  store_owner: 'Store Owner',
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const links = NAV_BY_ROLE[user?.role] || [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          
          <span className="brand-name">StoreTrust </span>
        </div>

        <nav className="nav-links">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <strong>{user?.name}</strong>
            {user?.email}
            <div className="role-tag">{ROLE_LABEL[user?.role] || user?.role}</div>
          </div>
          <button className="logout-btn" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
