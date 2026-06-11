import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const JobDetails = ({ jobId, setCurrentPage, setEditJobId }) => {
  const { user, token, API_URL } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [appStatus, setAppStatus] = useState('');
  
  // Apply Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch job details and check application status
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const res = await fetch(`${API_URL}/jobs/${jobId}`);
        const data = await res.json();
        if (data.success) {
          setJob(data.job);
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
      } finally {
        setLoading(false);
      }
    };

    const checkApplicationStatus = async () => {
      if (!token || user?.role !== 'seeker') return;

      try {
        const res = await fetch(`${API_URL}/applications/seeker`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const applied = data.applications.find((app) => app.job?._id === jobId);
          if (applied) {
            setHasApplied(true);
            setAppStatus(applied.status);
          }
        }
      } catch (err) {
        console.error('Error checking application status:', err);
      }
    };

    if (jobId) {
      fetchJobDetails();
      checkApplicationStatus();
    }
  }, [jobId, token, user]);

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setErrorMsg('Please select a resume file (PDF or Word)');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('coverLetter', coverLetter);
    formData.append('resume', resumeFile);

    try {
      const res = await fetch(`${API_URL}/applications/apply/${jobId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setHasApplied(true);
        setAppStatus('Pending');
        setShowApplyModal(false);
        setCoverLetter('');
        setResumeFile(null);
      } else {
        setErrorMsg(data.message || 'Failed to submit application');
      }
    } catch (err) {
      setErrorMsg('Server error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCurrentPage('employer-dashboard');
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

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '400px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Job Listing Not Found</h2>
        <p>The job you are looking for may have been removed or does not exist.</p>
        <button className="btn btn-primary" onClick={() => setCurrentPage('home')}>
          Back to Browse
        </button>
      </div>
    );
  }

  const isOwner = user && user.role === 'employer' && job.employer?._id === user.id;

  return (
    <div className="container fade-in" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
      <button
        className="btn btn-secondary"
        style={{ marginBottom: '2rem' }}
        onClick={() => {
          if (user?.role === 'employer') {
            setCurrentPage('employer-dashboard');
          } else if (user?.role === 'seeker') {
            setCurrentPage('seeker-dashboard');
          } else {
            setCurrentPage('home');
          }
        }}
      >
        ⬅️ Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr', gap: '2rem' }}>
        
        {/* Main Details */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
                {job.type}
              </span>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{job.title}</h1>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🏢 {job.companyName}
              </h3>
            </div>
            {job.salary && (
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  SALARY RANGE
                </span>
                <h2 style={{ color: 'var(--color-success)', fontSize: '1.75rem', fontWeight: 800 }}>
                  {job.salary}
                </h2>
              </div>
            )}
          </div>

          <hr style={{ border: 0, borderTop: '1px solid var(--color-light-border)', margin: '1.5rem 0' }} />

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Description</h3>
            <div style={{ color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
              {job.description}
            </div>
          </div>

          {job.requirements && job.requirements.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Requirements</h3>
              <ul style={{ paddingLeft: '1.5rem', color: 'var(--color-text-secondary)' }}>
                {job.requirements.map((req, idx) => (
                  <li key={idx} style={{ marginBottom: '0.5rem' }}>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.skillsRequired && job.skillsRequired.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Required Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {job.skillsRequired.map((skill, idx) => (
                  <span key={idx} className="skill-tag" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Panel / Company Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Action Card */}
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Apply for this Job</h3>
            
            {user ? (
              user.role === 'seeker' ? (
                hasApplied ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div className={`badge status-${appStatus.toLowerCase()}`} style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}>
                      Application Status: {appStatus}
                    </div>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                      You have already applied for this job listing.
                    </p>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => setShowApplyModal(true)}
                  >
                    Apply Now
                  </button>
                )
              ) : isOwner ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => {
                      setEditJobId(jobId);
                      setCurrentPage('post-job');
                    }}
                  >
                    ✏️ Edit Listing
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ width: '100%' }}
                    onClick={handleDeleteJob}
                  >
                    🗑️ Delete Listing
                  </button>
                </div>
              ) : (
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  You are logged in as an Employer. Switching to a Job Seeker profile allows applying.
                </p>
              )
            ) : (
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                  Sign in as a Job Seeker to apply for this job.
                </p>
                <button
                  className="btn btn-outline"
                  style={{ width: '100%' }}
                  onClick={() => setCurrentPage('login')}
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* Location & Quick Details */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-light-border)', paddingBottom: '0.5rem' }}>
              Quick Info
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div>
                <strong>📍 Location:</strong> {job.location}
              </div>
              <div>
                <strong>💼 Type:</strong> {job.type}
              </div>
              <div>
                <strong>📅 Posted:</strong> {formatDate(job.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowApplyModal(false)}>
              &times;
            </button>
            <h3 style={{ marginBottom: '1.5rem' }}>Submit Application</h3>

            {errorMsg && (
              <div className="badge badge-danger" style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: 'var(--radius-md)', textTransform: 'none', letterSpacing: 'normal', fontSize: '0.85rem' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleApplySubmit}>
              <div className="form-group">
                <label htmlFor="coverLetter">Cover Letter / Pitch</label>
                <textarea
                  id="coverLetter"
                  className="form-control"
                  rows="5"
                  placeholder="Explain why you are the perfect fit for this job role..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  style={{ resize: 'vertical' }}
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="resume">Resume Document (PDF, DOC, DOCX)*</label>
                <input
                  type="file"
                  id="resume"
                  className="form-control"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  required
                />
                <small style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                  Max file size: 5MB
                </small>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.5rem' }}
                disabled={submitting}
              >
                {submitting ? 'Submitting Application...' : 'Send Application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
