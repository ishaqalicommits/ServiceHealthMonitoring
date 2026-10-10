import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Layout = ({ pageTitle }) => {
  return (
    <div className="d-flex w-100 min-vh-100">
      <Sidebar />
      <div className="app-content">
        <Navbar pageTitle={pageTitle} />
        <main className="p-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
