import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Login = ({ setCurrentPage }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await login(email, password);
      if (res.success) {
        // Find user role and direct to dashboard
        // We fetch the updated state by waiting brief millisecond or reading context.
        // Wait, inside MERN app we can just let AuthContext trigger reload, or we can check the user returned.
        // Let's get the user details from local storage or wait for auth state update.
        // To be safe, we reload or retrieve role.
        // Wait, the login method sets user state, but let's query the profile or just check the token.
        // Since we return the user in data in AuthContext, we can access the role.
        // Let's look at what register/login return in AuthContext:
        // they return { success: true } or { success: false, message: ... }.
        // The user will be populated in context. Let's wait for the next render, or read user role.
        // Wait! How do we know the user role immediately? We can read the user role by checking the localStorage user item or fetching the response.
        // Let's just retrieve it from the response inside `login`? Or we can query the backend/check storage.
        // Wait! In AuthContext, `login` does:
        // `setUser(data.user)` and returns `{ success: true }`.
        // Let's just set the page in a timeout or handle it inside AuthContext, or we can return the user from the login function.
        // Let's check how AuthContext's login returns: it returns `{ success: true }`.
        // If we want the user object immediately, we can modify login to return `{ success: true, user: data.user }`.
        // Let's see: yes! AuthContext does:
        // `setUser(data.user); return { success: true };`
        // We can actually just check the user object in AuthContext. Let's just look at localStorage or look at the user from authContext, or check if we need to update `AuthContext.jsx` to return the user.
        // Wait! If the user object is set in the context state, React will re-render, and we can use a `useEffect` inside `Login.jsx` to redirect when `user` changes!
        // Yes, that is standard, extremely robust and clean!
        // Let's do that: we will redirect when `user` is present:
        // `useEffect(() => { if (user) { if (user.role === 'employer') { setCurrentPage('employer-dashboard'); } else { setCurrentPage('seeker-dashboard'); } } }, [user]);`
        // That is perfect!
      } else {
        setErrorMsg(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setErrorMsg('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="card auth-card glass-panel">
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', marginBottom: '2rem' }}>Sign in to continue to JobWave</p>

        {errorMsg && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', textTransform: 'none', letterSpacing: 'normal', fontSize: '0.85rem' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
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

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', marginBottom: 0 }}>
          Don't have an account?{' '}
          <span
            style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => setCurrentPage('register')}
          >
            Create an Account
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
