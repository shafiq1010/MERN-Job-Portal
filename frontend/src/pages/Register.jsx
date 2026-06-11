import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Register = ({ setCurrentPage }) => {
  const { register } = useContext(AuthContext);
  const [role, setRole] = useState('seeker'); // default seeker
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    if (role === 'employer' && !companyName) {
      setErrorMsg('Company Name is required for employers');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    // Prepare profile details
    let profile = {};
    if (role === 'seeker') {
      profile = {
        skills: skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        education: [],
        experience: [],
        resumePath: '',
        bio: '',
      };
    } else if (role === 'employer') {
      profile = {
        companyName,
        companyDesc: '',
        website: '',
      };
    }

    try {
      const res = await register(name, email, password, role, profile);
      if (res.success) {
        // Redirection is handled in the main component or via React context update.
      } else {
        setErrorMsg(res.message || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="card auth-card glass-panel">
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Create Account</h2>
        <p style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Join the JobWave platform today</p>

        {errorMsg && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', textTransform: 'none', letterSpacing: 'normal', fontSize: '0.85rem' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Role Toggle */}
        <div className="role-toggle-group">
          <div
            className={`role-btn ${role === 'seeker' ? 'active' : ''}`}
            onClick={() => setRole('seeker')}
          >
            Job Seeker
          </div>
          <div
            className={`role-btn ${role === 'employer' ? 'active' : ''}`}
            onClick={() => setRole('employer')}
          >
            Employer / Admin
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              className="form-control"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {role === 'employer' && (
            <div className="form-group">
              <label htmlFor="companyName">Company Name</label>
              <input
                type="text"
                id="companyName"
                className="form-control"
                placeholder="Tech Corp Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
          )}

          {role === 'seeker' && (
            <div className="form-group">
              <label htmlFor="skills">Skills (comma separated)</label>
              <input
                type="text"
                id="skills"
                className="form-control"
                placeholder="React, Node.js, Express, MongoDB"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password (min 6 chars)</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register Now'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', marginBottom: 0 }}>
          Already have an account?{' '}
          <span
            style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => setCurrentPage('login')}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
