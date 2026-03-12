import { NavLink } from 'react-router-dom';

const Sidebar = ({ mobileShow, toggleMenu, openDropdown, onDropdownToggle }) => {
    const closeSidebarOnMobile = () => {
        if (window.innerWidth <= 992) {
            toggleMenu(); // this will set mobileShow to false
        }
    };

    return (
        <div className={`dashboard-nav ${mobileShow ? 'mobile-show' : ''}`}>
            <header>
                <a href="#!" className="menu-toggle" onClick={toggleMenu}>
                    <i className="fas fa-bars"></i>
                </a>
                <a href="/" className="brand-logo">
                    <i className="fas fa-anchor"></i> <span>BRAND</span>
                </a>
            </header>
            <nav className="dashboard-nav-list">
                <NavLink
                    to="/dashboard"
                    end
                    className={({ isActive }) =>
                        "dashboard-nav-item" + (isActive ? " active" : "")
                    }
                    onClick={closeSidebarOnMobile}
                >
                    <i className="fas fa-chart-line"></i> Dashboard
                </NavLink>

                <NavLink
                    to="/tasks"
                    className={({ isActive }) =>
                        "dashboard-nav-item" + (isActive ? " active" : "")
                    }
                    onClick={closeSidebarOnMobile}
                >
                    <i className="fas fa-tasks"></i> Tasks
                </NavLink>
                <NavLink
                    to="/"

                    className={({ isActive }) => 'dashboard-nav-item' + (isActive ? ' active' : '')}
                    onClick={closeSidebarOnMobile}
                >
                    <i className="fas fa-sign-out-alt"></i> Logout
                </NavLink>

            </nav>
        </div>
    );
};

export default Sidebar;