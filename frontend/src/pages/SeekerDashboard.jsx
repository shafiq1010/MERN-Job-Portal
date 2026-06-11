import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const SeekerDashboard = ({ setCurrentPage, setSelectedJobId }) => {
  const { token, API_URL } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats calculation
  const totalApps = applications.length;
  const pendingApps = applications.filter((app) => app.status === 'Pending').length;
  const shortlistedApps = applications.filter((app) => app.status === 'Shortlisted').length;
  const acceptedApps = applications.filter((app) => app.status === 'Accepted').length;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch(`${API_URL}/applications/seeker`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setApplications(data.applications);
        }
      } catch (err) {
        console.error('Error fetching seeker applications:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchApplications();
    }
  }, [token]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container fade-in" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Seeker Dashboard</h1>
        <p>Track all your active job applications and review status updates</p>
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-num">{totalApps}</span>
          <span className="stat-label">Total Applied</span>
        </div>
        <div className="stat-card">
          <span className="stat-num" style={{ color: 'var(--color-warning)' }}>
            {pendingApps}
          </span>
          <span className="stat-label">Pending Review</span>
        </div>
        <div className="stat-card">
          <span className="stat-num" style={{ color: 'var(--color-primary)' }}>
            {shortlistedApps}
          </span>
          <span className="stat-label">Shortlisted</span>
        </div>
        <div className="stat-card">
          <span className="stat-num" style={{ color: 'var(--color-success)' }}>
            {acceptedApps}
          </span>
          <span className="stat-label">Offers Accepted</span>
        </div>
      </div>

      {/* Applications Table */}
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>My Applications</h2>

        {loading ? (
          <div className="flex-center" style={{ minHeight: '150px' }}>
            <div className="spinner"></div>
          </div>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>You haven't applied to any jobs yet.</p>
            <button className="btn btn-primary" onClick={() => setCurrentPage('home')}>
              Browse Jobs Now
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Resume</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <strong>{app.job?.title || 'Unknown Position'}</strong>
                      <br />
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        📍 {app.job?.location}
                      </span>
                    </td>
                    <td>🏢 {app.job?.companyName || 'Unknown Company'}</td>
                    <td>📅 {formatDate(app.appliedAt)}</td>
                    <td>
                      <span className={`badge status-${app.status.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <a
                        href={`http://localhost:5000/${app.resumePath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        📄 Download
                      </a>
                    </td>
                    <td>
                      {app.job?._id ? (
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                          onClick={() => {
                            setSelectedJobId(app.job._id);
                            setCurrentPage('job-details');
                          }}
                        >
                          View Job Details
                        </button>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                          Listing Removed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeekerDashboard;
