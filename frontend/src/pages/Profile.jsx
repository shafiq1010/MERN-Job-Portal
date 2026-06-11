import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [name, setName] = useState('');
  
  // Seeker profile states
  const [bio, setBio] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [educationText, setEducationText] = useState('');
  const [experienceText, setExperienceText] = useState('');

  // Employer profile states
  const [companyName, setCompanyName] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');
  const [website, setWebsite] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      if (user.role === 'seeker') {
        setBio(user.profile?.bio || '');
        setSkillsText(user.profile?.skills ? user.profile.skills.join(', ') : '');
        setEducationText(user.profile?.education ? user.profile.education.join(', ') : '');
        setExperienceText(user.profile?.experience ? user.profile.experience.join(', ') : '');
      } else if (user.role === 'employer') {
        setCompanyName(user.profile?.companyName || '');
        setCompanyDesc(user.profile?.companyDesc || '');
        setWebsite(user.profile?.website || '');
      }
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    let profileData = { name };

    if (user.role === 'seeker') {
      profileData = {
        ...profileData,
        bio,
        skills: skillsText.split(',').map((s) => s.trim()).filter(Boolean),
        education: educationText.split(',').map((ed) => ed.trim()).filter(Boolean),
        experience: experienceText.split(',').map((ex) => ex.trim()).filter(Boolean),
      };
    } else if (user.role === 'employer') {
      profileData = {
        ...profileData,
        companyName,
        companyDesc,
        website,
      };
    }

    try {
      const res = await updateProfile(profileData);
      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
      } else {
        setErrorMsg(res.message || 'Failed to update profile');
      }
    } catch (err) {
      setErrorMsg('An error occurred during save.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container fade-in" style={{ padding: '3rem 1.5rem 5rem 1.5rem', maxWidth: '800px' }}>
      <div className="card glass-panel" style={{ padding: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
          {user?.role === 'employer' ? 'Company Settings' : 'My Seeker Profile'}
        </h1>
        <p style={{ marginBottom: '2.5rem' }}>
          Configure details displayed on your applications and job postings
        </p>

        {successMsg && (
          <div className="badge badge-success" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', textTransform: 'none', letterSpacing: 'normal', fontSize: '0.85rem' }}>
            ✅ {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', textTransform: 'none', letterSpacing: 'normal', fontSize: '0.85rem' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Contact Name *</label>
            <input
              type="text"
              id="name"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {user?.role === 'seeker' ? (
            <>
              <div className="form-group">
                <label htmlFor="bio">Professional Summary / Bio</label>
                <textarea
                  id="bio"
                  className="form-control"
                  rows="4"
                  placeholder="Tell employers about your tech background and goals..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{ resize: 'vertical' }}
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="skills">Technical Skills (Comma separated)</label>
                <input
                  type="text"
                  id="skills"
                  className="form-control"
                  placeholder="e.g. JavaScript, Python, React, AWS"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="experience">Experience Milestones (Comma separated)</label>
                <input
                  type="text"
                  id="experience"
                  className="form-control"
                  placeholder="e.g. Senior Dev at Google (3 yrs), Software Engineer at Stripe (2 yrs)"
                  value={experienceText}
                  onChange={(e) => setExperienceText(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="education">Education (Comma separated)</label>
                <input
                  type="text"
                  id="education"
                  className="form-control"
                  placeholder="e.g. MS in CS from Stanford, BSc in Software Engineering from MIT"
                  value={educationText}
                  onChange={(e) => setEducationText(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="companyName">Company Name *</label>
                <input
                  type="text"
                  id="companyName"
                  className="form-control"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Company Website URL</label>
                <input
                  type="url"
                  id="website"
                  className="form-control"
                  placeholder="https://company.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="companyDesc">Company Description</label>
                <textarea
                  id="companyDesc"
                  className="form-control"
                  rows="5"
                  placeholder="Describe your company culture, core product, and vision..."
                  value={companyDesc}
                  onChange={(e) => setCompanyDesc(e.target.value)}
                  style={{ resize: 'vertical' }}
                ></textarea>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Saving Changes...' : 'Save Profile Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
