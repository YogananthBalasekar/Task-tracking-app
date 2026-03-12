import React from 'react'
import useNetworkStatus from '../services/useNetworkStatus';

const Toolbar = ({ toggleMenu }) => {
    const isOnline = useNetworkStatus();
  return (
    <header className="dashboard-toolbar d-flex align-items-center justify-content-between">
      <span  className="menu-toggle" onClick={toggleMenu}>
        <i className="fas fa-bars"></i>
      </span>
          <div className="toolbar-status">
        {isOnline ? (
          <span className="badge bg-success">✅ Online</span>
        ) : (
          <span className="badge bg-warning">⚠ Offline</span>
        )}
      </div>
    </header>
  );
};

export default Toolbar;
