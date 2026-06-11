import React from 'react';

const Footer = ({ setCurrentPage }) => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="footer-logo" onClick={() => setCurrentPage('home')}>
            <span className="logo-icon">🚀</span>
            <span className="logo-text">JobWave</span>
          </div>
          <p>Connecting elite developers with global opportunities. Built on MERN.</p>
        </div>
        <div className="footer-links-group">
          <div className="footer-col">
            <h4>For Seekers</h4>
            <ul>
              <li onClick={() => setCurrentPage('home')}>Browse Jobs</li>
              <li onClick={() => setCurrentPage('seeker-dashboard')}>Dashboard</li>
              <li onClick={() => setCurrentPage('profile')}>My Profile</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>For Employers</h4>
            <ul>
              <li onClick={() => setCurrentPage('post-job')}>Post a Job</li>
              <li onClick={() => setCurrentPage('employer-dashboard')}>Dashboard</li>
              <li onClick={() => setCurrentPage('profile')}>Company Profile</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} JobWave Portal. All rights reserved. Created by Antigravity.</p>
      </div>
    </footer>
  );
};

export default Footer;
