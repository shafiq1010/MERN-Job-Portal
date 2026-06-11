import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const EmployerDashboard = ({ setCurrentPage, setSelectedJobId, setEditJobId }) => {
  const { token, API_URL } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(true);
  
  // Modal state for cover letter
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Stats
  const totalJobs = jobs.length;
  const totalApps = applications.length;
  const pendingApps = applications.filter((app) => app.status === 'Pending').length;
  const shortlistApps = applications.filter((app) => app.status === 'Shortlisted').length;

  const fetchData = async () => {
    try {
      // Fetch jobs
      const jobsRes = await fetch(`${API_URL}/jobs/employer/myjobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jobsData = await jobsRes.json();
      if (jobsData.success) {
        setJobs(jobsData.jobs);
      }
      setLoadingJobs(false);

      // Fetch applications
      const appsRes = await fetch(`${API_URL}/applications/employer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const appsData = await appsRes.json();
      if (appsData.success) {
        setApplications(appsData.applications);
      }
      setLoadingApps(false);
    } catch (err) {
      console.error('Error fetching employer dashboard data:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Update applicant status
  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
        );
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating application status:', err);
    }
  };

  // Delete Job Listing
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing? This will also remove any application records linked to it.')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        // Remove job locally
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
        // Remove applications locally
        setApplications((prev) => prev.filter((app) => app.job?._id !== jobId));
      } else {
        alert(data.message || 'Failed to delete job');
      }
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleOpenCoverLetter = (app) => {
    setSelectedApp(app);
    setShowModal(true);
  };

  return (
    <div className="container fade-in" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      <div className="dashboard-header space-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Employer Console</h1>
          <p>Manage your company job postings and evaluate candidate applications</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditJobId(null);
            setCurrentPage('post-job');
          }}
        >
          ➕ Post New Job
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-num">{totalJobs}</span>
          <span className="stat-label">Active Job Listings</span>
        </div>
        <div className="stat-card">
          <span className="stat-num" style={{ color: 'var(--color-primary)' }}>
            {totalApps}
          </span>
          <span className="stat-label">Total Applications</span>
        </div>
        <div className="stat-card">
          <span className="stat-num" style={{ color: 'var(--color-warning)' }}>
            {pendingApps}
          </span>
          <span className="stat-label">Pending Review</span>
        </div>
        <div className="stat-card">
          <span className="stat-num" style={{ color: 'var(--color-success)' }}>
            {shortlistApps}
          </span>
          <span className="stat-label">Shortlisted Candidates</span>
        </div>
      </div>

      {/* Grid of Jobs & Applications */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        {/* Posted Jobs Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Active Job Listings</h2>
          {loadingJobs ? (
            <div className="flex-center" style={{ minHeight: '100px' }}>
              <div className="spinner"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <p>You haven't posted any jobs yet.</p>
              <button
                className="btn btn-outline"
                style={{ marginTop: '0.5rem' }}
                onClick={() => {
                  setEditJobId(null);
                  setCurrentPage('post-job');
                }}
              >
                Post Your First Job
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Type</th>
                    <th>Posted On</th>
                    <th>Location</th>
                    <th>Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td>
                        <strong>{job.title}</strong>
                      </td>
                      <td>
                        <span className="badge badge-primary">{job.type}</span>
                      </td>
                      <td>📅 {formatDate(job.createdAt)}</td>
                      <td>📍 {job.location}</td>
                      <td>💰 {job.salary || 'Not specified'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                            onClick={() => {
                              setEditJobId(job._id);
                              setCurrentPage('post-job');
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                            onClick={() => handleDeleteJob(job._id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Incoming Applications Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Incoming Applications</h2>
          {loadingApps ? (
            <div className="flex-center" style={{ minHeight: '120px' }}>
              <div className="spinner"></div>
            </div>
          ) : applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <p>No applications received yet.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Applied Position</th>
                    <th>Submitted Date</th>
                    <th>Status</th>
                    <th>Resume</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <strong>{app.seeker?.name || 'Applicant'}</strong>
                        <br />
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          {app.seeker?.email}
                        </span>
                      </td>
                      <td>
                        {app.job?.title ? (
                          <strong>{app.job.title}</strong>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>Removed Position</span>
                        )}
                      </td>
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
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                            onClick={() => handleOpenCoverLetter(app)}
                          >
                            👁️ Cover Letter
                          </button>
                          
                          {app.status === 'Pending' && (
                            <>
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                onClick={() => handleStatusUpdate(app._id, 'Shortlisted')}
                              >
                                Shortlist
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                onClick={() => handleStatusUpdate(app._id, 'Rejected')}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          
                          {app.status === 'Shortlisted' && (
                            <>
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', background: 'var(--color-success)' }}
                                onClick={() => handleStatusUpdate(app._id, 'Accepted')}
                              >
                                Accept Candidate
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                onClick={() => handleStatusUpdate(app._id, 'Rejected')}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {(app.status === 'Accepted' || app.status === 'Rejected') && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                              onClick={() => handleStatusUpdate(app._id, 'Pending')}
                            >
                              Re-evaluate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Cover Letter Modal */}
      {showModal && selectedApp && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              &times;
            </button>
            <h3 style={{ marginBottom: '0.5rem' }}>Cover Letter Details</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Submitted by <strong>{selectedApp.seeker?.name}</strong> for{' '}
              <strong>{selectedApp.job?.title}</strong>
            </p>
            
            <div
              className="card"
              style={{
                backgroundColor: 'var(--color-light-bg)',
                whiteSpace: 'pre-wrap',
                padding: '1.25rem',
                maxHeight: '250px',
                overflowY: 'auto',
                fontSize: '0.95rem',
                border: '1px solid var(--color-light-border)',
                marginBottom: '1.5rem',
              }}
            >
              {selectedApp.coverLetter || 'No cover letter was submitted with this application.'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <a
                href={`http://localhost:5000/${selectedApp.resumePath}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
              >
                📄 View Resume
              </a>
              <button className="btn btn-primary" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
