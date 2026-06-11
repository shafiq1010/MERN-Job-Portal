import React, { useState, useContext, useEffect } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SeekerDashboard from './pages/SeekerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import JobDetails from './pages/JobDetails';
import PostJob from './pages/PostJob';
import Profile from './pages/Profile';

// Import Stylesheets
import './styles/global.css';
import './styles/components.css';

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [editJobId, setEditJobId] = useState(null);
  const { user, loading } = useContext(AuthContext);

  // Handle auto-redirects on login/logout
  useEffect(() => {
    if (user) {
      if (currentPage === 'login' || currentPage === 'register') {
        if (user.role === 'employer') {
          setCurrentPage('employer-dashboard');
        } else {
          setCurrentPage('seeker-dashboard');
        }
      }
    } else {
      if (
        currentPage === 'seeker-dashboard' ||
        currentPage === 'employer-dashboard' ||
        currentPage === 'post-job' ||
        currentPage === 'profile'
      ) {
        setCurrentPage('home');
      }
    }
  }, [user, currentPage]);

  const renderPage = () => {
    if (loading) {
      return (
        <div className="flex-center" style={{ minHeight: '80vh' }}>
          <div className="spinner"></div>
        </div>
      );
    }

    switch (currentPage) {
      case 'home':
        return (
          <Home
            setCurrentPage={setCurrentPage}
            setSelectedJobId={setSelectedJobId}
          />
        );
      case 'login':
        return <Login setCurrentPage={setCurrentPage} />;
      case 'register':
        return <Register setCurrentPage={setCurrentPage} />;
      case 'seeker-dashboard':
        return (
          <SeekerDashboard
            setCurrentPage={setCurrentPage}
            setSelectedJobId={setSelectedJobId}
          />
        );
      case 'employer-dashboard':
        return (
          <EmployerDashboard
            setCurrentPage={setCurrentPage}
            setSelectedJobId={setSelectedJobId}
            setEditJobId={setEditJobId}
          />
        );
      case 'job-details':
        return (
          <JobDetails
            jobId={selectedJobId}
            setCurrentPage={setCurrentPage}
            setEditJobId={setEditJobId}
          />
        );
      case 'post-job':
        return (
          <PostJob
            editJobId={editJobId}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'profile':
        return <Profile />;
      default:
        return (
          <Home
            setCurrentPage={setCurrentPage}
            setSelectedJobId={setSelectedJobId}
          />
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar setCurrentPage={setCurrentPage} />
      <main style={{ flexGrow: 1 }}>{renderPage()}</main>
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
