import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ setCurrentPage }) => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (page) => {
    setCurrentPage(page);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <div className="nav-logo" onClick={() => handleNavClick('home')}>
          <span className="logo-icon">🚀</span>
          <span className="logo-text">JobWave</span>
        </div>

        <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <span className="nav-item" onClick={() => handleNavClick('home')}>
            Browse Jobs
          </span>

          {user ? (
            <>
              {user.role === 'seeker' ? (
                <>
                  <span className="nav-item" onClick={() => handleNavClick('seeker-dashboard')}>
                    My Dashboard
                  </span>
                  <span className="nav-item" onClick={() => handleNavClick('profile')}>
                    My Profile
                  </span>
                </>
              ) : (
                <>
                  <span className="nav-item" onClick={() => handleNavClick('employer-dashboard')}>
                    Employer Console
                  </span>
                  <span className="nav-item" onClick={() => handleNavClick('post-job')}>
                    Post a Job
                  </span>
                  <span className="nav-item" onClick={() => handleNavClick('profile')}>
                    Company Profile
                  </span>
                </>
              )}
              <div className="user-badge-nav">
                Hi, <strong>{user.name}</strong> ({user.role === 'employer' ? 'Employer' : 'Seeker'})
              </div>
              <button className="btn btn-secondary btn-sm btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => handleNavClick('login')}>
                Sign In
              </button>
              <button className="btn btn-primary" onClick={() => handleNavClick('register')}>
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
