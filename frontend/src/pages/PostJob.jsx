import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const PostJob = ({ editJobId, setCurrentPage }) => {
  const { user, token, API_URL } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Full-time');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [skillsText, setSkillsText] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch job details if in edit mode
  useEffect(() => {
    if (editJobId) {
      setFetching(true);
      fetch(`${API_URL}/jobs/${editJobId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const j = data.job;
            setTitle(j.title);
            setLocation(j.location);
            setType(j.type);
            setSalary(j.salary || '');
            setDescription(j.description);
            setRequirementsText(j.requirements ? j.requirements.join('\n') : '');
            setSkillsText(j.skillsRequired ? j.skillsRequired.join(', ') : '');
          }
          setFetching(false);
        })
        .catch((err) => {
          console.error(err);
          setFetching(false);
        });
    }
  }, [editJobId, API_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !location || !description) {
      setErrorMsg('Job Title, Location, and Description are required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    // Format requirements (each line is a requirement)
    const requirements = requirementsText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    // Format skills (comma-separated)
    const skillsRequired = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const jobData = {
      title,
      location,
      type,
      salary,
      description,
      requirements,
      skillsRequired,
    };

    const method = editJobId ? 'PUT' : 'POST';
    const endpoint = editJobId ? `${API_URL}/jobs/${editJobId}` : `${API_URL}/jobs`;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      });

      const data = await res.json();
      if (data.success) {
        setCurrentPage('employer-dashboard');
      } else {
        setErrorMsg(data.message || 'Failed to submit job listing');
      }
    } catch (err) {
      setErrorMsg('An error occurred. Please check server status.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="container flex-center" style={{ minHeight: '300px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ padding: '3rem 1.5rem 5rem 1.5rem', maxWidth: '800px' }}>
      <div className="card glass-panel" style={{ padding: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
          {editJobId ? 'Edit Job Posting' : 'Publish New Job Posting'}
        </h1>
        <p style={{ marginBottom: '2rem' }}>
          {editJobId
            ? 'Make changes to your active listing'
            : 'Fill in details to post your position to our dev network'}
        </p>

        {errorMsg && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', textTransform: 'none', letterSpacing: 'normal', fontSize: '0.85rem' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="title">Job Title *</label>
              <input
                type="text"
                id="title"
                className="form-control"
                placeholder="Senior Full Stack Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location (City, Country or Remote) *</label>
              <input
                type="text"
                id="location"
                className="form-control"
                placeholder="San Francisco, CA or Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="type">Job Type</label>
              <select
                id="type"
                className="form-control"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="salary">Salary Range (Optional)</label>
              <input
                type="text"
                id="salary"
                className="form-control"
                placeholder="$120k - $150k / year"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Job Description *</label>
            <textarea
              id="description"
              className="form-control"
              rows="8"
              placeholder="Outline the responsibilities, project scopes, and work environment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ resize: 'vertical' }}
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="requirementsText">Requirements (One qualification per line)</label>
            <textarea
              id="requirementsText"
              className="form-control"
              rows="4"
              placeholder="e.g. 5+ years of experience with React/Node.js&#10;e.g. Bachelor's Degree in Computer Science"
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
              style={{ resize: 'vertical' }}
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="skillsText">Required Skills (Comma separated)</label>
            <input
              type="text"
              id="skillsText"
              className="form-control"
              placeholder="React, Express, Node.js, Mongoose, Jest"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flexGrow: 2, padding: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Submitting Listing...' : editJobId ? 'Save Changes' : 'Post Listing'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flexGrow: 1 }}
              onClick={() => setCurrentPage('employer-dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
