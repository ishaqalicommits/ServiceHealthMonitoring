import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ pageTitle = 'ServiceWatch Monitoring' }) => {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('servicewatch-theme') || 'light');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('servicewatch-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <header className="top-navbar">
      <div className="d-flex align-items-center gap-2">
        <h5 className="mb-0 text-dark fw-bold">{pageTitle}</h5>
      </div>
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={toggleTheme}
          title="Toggle Light/Dark Theme"
        >
          <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars'}`}></i>
        </button>

        <div className="dropdown position-relative">
          <button
            className="btn btn-sm btn-light border dropdown-toggle d-flex align-items-center gap-2"
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <i className="bi bi-person-circle"></i>
            <span>{user ? user.username || user.email : 'Account'}</span>
          </button>
          {dropdownOpen && (
            <ul
              className="dropdown-menu dropdown-menu-end shadow-sm show"
              style={{ position: 'absolute', right: 0, top: '100%', zIndex: 1050 }}
            >
              <li>
                <Link
                  className="dropdown-item"
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                >
                  <i className="bi bi-person me-2"></i>Profile
                </Link>
              </li>
              <li>
                <Link
                  className="dropdown-item"
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                >
                  <i className="bi bi-gear me-2"></i>Settings
                </Link>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button className="dropdown-item text-danger" onClick={logout}>
                  <i className="bi bi-box-arrow-right me-2"></i>Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};
