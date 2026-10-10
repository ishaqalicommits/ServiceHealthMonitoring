import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <aside className="app-sidebar d-flex flex-column flex-shrink-0">
      <Link to="/dashboard" className="sidebar-brand text-decoration-none">
        <i className="bi bi-shield-check text-primary fs-4"></i>
        <span>ServiceWatch</span>
      </Link>
      <ul className="sidebar-nav flex-grow-1">
        <li className="nav-item">
          <NavLink to="/dashboard" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-speedometer2"></i>
            <span>Overview</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/monitors" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-activity"></i>
            <span>Monitors</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/incidents" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-exclamation-octagon"></i>
            <span>Incidents</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-graph-up"></i>
            <span>Analytics</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-bell"></i>
            <span>Notifications</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/maintenance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-calendar-event"></i>
            <span>Maintenance</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/status-pages" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-broadcast"></i>
            <span>Status Pages</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <a href="/" target="_blank" rel="noopener noreferrer" className="nav-link text-info">
            <i className="bi bi-globe"></i>
            <span>Landing Page</span>
          </a>
        </li>
        {isAdmin && (
          <>
            <li className="nav-item">
              <NavLink to="/team" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="bi bi-people"></i>
                <span>Team Members</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="bi bi-sliders"></i>
                <span>Settings</span>
              </NavLink>
            </li>
          </>
        )}
      </ul>
      <div className="p-3 border-top border-secondary border-opacity-25">
        <button
          onClick={logout}
          className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
