import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Home = ({ setCurrentPage, setSelectedJobId }) => {
  const { API_URL } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');

  // Fetch jobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      let query = '';
      const params = [];
      if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
      if (location) params.push(`location=${encodeURIComponent(location)}`);
      if (type) params.push(`type=${encodeURIComponent(type)}`);

      if (params.length > 0) {
        query = `?${params.join('&')}`;
      }

      const res = await fetch(`${API_URL}/jobs${query}`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleClearFilters = () => {
    setKeyword('');
    setLocation('');
    setType('');
    // Trigger fetch immediately with cleared state
    setTimeout(() => {
      fetch(`${API_URL}/jobs`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setJobs(data.jobs);
        });
    }, 50);
  };

  return (
    <div className="home-page fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-text-content">
            <h1 className="hero-title">
              Find Your Dream Job <br />
              <span className="text-gradient">Shape Your Destiny</span>
            </h1>
            <p className="hero-subtitle">
              Discover verified tech jobs posted by elite employers. Apply in seconds with our MERN-powered rapid application engine.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="container">
        <form className="search-panel" onSubmit={handleSearchSubmit}>
          <div className="search-input-wrapper">
            <span className="search-icon-input">🔍</span>
            <input
              type="text"
              placeholder="Job title, company, keyword..."
              className="form-control search-control"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="search-input-wrapper">
            <span className="search-icon-input">📍</span>
            <input
              type="text"
              placeholder="City, country or remote..."
              className="form-control search-control"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <select
              className="form-control"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            {(keyword || location || type) && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClearFilters}
                title="Clear Filters"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Job Listings Grid */}
      <section className="container job-listings-section" style={{ paddingBottom: '4rem' }}>
        <div className="section-header space-between" style={{ marginBottom: '2rem' }}>
          <h2>Available Listings ({jobs.length})</h2>
        </div>

        {loading ? (
          <div className="flex-center" style={{ minHeight: '200px' }}>
            <div className="spinner"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem 2rem' }}>
            <h3>No Jobs Found</h3>
            <p>We couldn't find any job listings matching your search. Try adjusting your keywords or filters!</p>
            <button className="btn btn-outline" onClick={handleClearFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-3">
            {jobs.map((job) => (
              <div key={job._id} className="card job-card fade-in">
                <div className="job-card-header">
                  <span className="badge badge-primary">{job.type}</span>
                  {job.salary && <span className="job-salary">{job.salary}</span>}
                </div>
                
                <h3 className="job-card-title">{job.title}</h3>
                <h4 className="job-card-company">🏢 {job.companyName}</h4>
                <p className="job-card-location">📍 {job.location}</p>
                
                <p className="job-card-desc">
                  {job.description.length > 140
                    ? `${job.description.substring(0, 140)}...`
                    : job.description}
                </p>

                <div className="job-card-skills">
                  {job.skillsRequired && job.skillsRequired.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>

                <button
                  className="btn btn-outline btn-block"
                  style={{ width: '100%', marginTop: '1rem' }}
                  onClick={() => {
                    setSelectedJobId(job._id);
                    setCurrentPage('job-details');
                  }}
                >
                  View Application Details
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
