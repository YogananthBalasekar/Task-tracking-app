import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';

const Layout = () => {
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [mobileShow, setMobileShow] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // 'media', 'users', 'payments' or null

  // Close mobile sidebar when screen grows above mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992 && mobileShow) {
        setMobileShow(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileShow]);

  const toggleMenu = () => {
    if (window.innerWidth <= 992) {
      setMobileShow(prev => !prev);
    } else {
      setSidebarCompact(prev => !prev);
    }
  };

  const handleDropdownToggle = (dropdown) => {
    setOpenDropdown(prev => (prev === dropdown ? null : dropdown));
  };

  return (
    <div className={`dashboard ${sidebarCompact ? 'dashboard-compact' : ''}`}>
      <Sidebar
        mobileShow={mobileShow}
        toggleMenu={toggleMenu}
        openDropdown={openDropdown}
        onDropdownToggle={handleDropdownToggle}
      />
      <div className="dashboard-app">
        <Toolbar toggleMenu={toggleMenu} />
        <div className="dashboard-content">
          <div className="container">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;