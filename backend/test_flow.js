const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();

const API_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('--- STARTING END-TO-END BACKEND API VERIFICATION TESTS ---');

  try {
    // 1. Connect to MongoDB to clear test data
    console.log('Connecting to database to clear test records...');
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear collections
    await mongoose.connection.db.collection('users').deleteMany({});
    await mongoose.connection.db.collection('jobs').deleteMany({});
    await mongoose.connection.db.collection('applications').deleteMany({});
    console.log('Database collections cleared successfully.');
    await mongoose.disconnect();

    // 2. Register Employer
    console.log('\n2. Registering employer...');
    const empRegRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Employer',
        email: 'employer@test.com',
        password: 'password123',
        role: 'employer',
        profile: {
          companyName: 'Apex Tech',
          companyDesc: 'Building tomorrow\'s AI tech.',
          website: 'https://apex.tech',
        },
      }),
    });
    const empRegData = await empRegRes.json();
    if (!empRegData.success) throw new Error(`Employer registration failed: ${empRegData.message}`);
    console.log('Employer registered successfully. Token received.');
    const employerToken = empRegData.token;

    // 3. Register Seeker
    console.log('\n3. Registering job seeker...');
    const seekerRegRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Seeker',
        email: 'seeker@test.com',
        password: 'password123',
        role: 'seeker',
        profile: {
          skills: ['Node.js', 'Express', 'React', 'MongoDB'],
          bio: 'Full stack developer with 3 years experience.',
        },
      }),
    });
    const seekerRegData = await seekerRegRes.json();
    if (!seekerRegData.success) throw new Error(`Seeker registration failed: ${seekerRegData.message}`);
    console.log('Seeker registered successfully. Token received.');
    const seekerToken = seekerRegData.token;

    // 4. Post a Job as Employer
    console.log('\n4. Posting a job listing as Employer...');
    const postJobRes = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employerToken}`,
      },
      body: JSON.stringify({
        title: 'Senior Node Developer',
        location: 'Remote (US)',
        type: 'Remote',
        salary: '$120,000 - $140,000',
        description: 'We are looking for a Senior Node.js developer experienced in Express and MongoDB.',
        requirements: [
          '3+ years of experience with Node.js',
          'Strong understanding of Mongoose',
          'Experience building RESTful APIs',
        ],
        skillsRequired: ['Node.js', 'Express', 'MongoDB'],
      }),
    });
    const postJobData = await postJobRes.json();
    if (!postJobData.success) throw new Error(`Job posting failed: ${postJobData.message}`);
    const jobId = postJobData.job._id;
    console.log(`Job posted successfully! Job ID: ${jobId}`);

    // 5. Get all jobs (Public Route)
    console.log('\n5. Fetching all available jobs...');
    const getJobsRes = await fetch(`${API_URL}/jobs`);
    const getJobsData = await getJobsRes.json();
    if (!getJobsData.success) throw new Error('Fetching jobs failed.');
    console.log(`Successfully fetched jobs. Total found: ${getJobsData.count}`);
    const foundJob = getJobsData.jobs.find((j) => j._id === jobId);
    if (!foundJob) throw new Error('Posted job was not found in the listings.');
    console.log(`Verified: Posted job "${foundJob.title}" is in public listings.`);

    // 6. Apply for the Job as Seeker (Multer multipart form data)
    console.log('\n6. Submitting job application as Seeker...');
    const formData = new FormData();
    formData.append('coverLetter', 'I would love to join Apex Tech as a Node Developer!');
    
    // Create a mock resume file using Blob
    const resumeBlob = new Blob(['Mock PDF Resume Content'], { type: 'application/pdf' });
    formData.append('resume', resumeBlob, 'resume.pdf');

    const applyRes = await fetch(`${API_URL}/applications/apply/${jobId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${seekerToken}`,
      },
      body: formData,
    });
    const applyData = await applyRes.json();
    if (!applyData.success) throw new Error(`Application failed: ${applyData.message}`);
    const applicationId = applyData.application._id;
    console.log(`Application submitted successfully! Application ID: ${applicationId}`);

    // 7. Get seeker applications
    console.log('\n7. Verifying seeker dashboard applications...');
    const seekerAppsRes = await fetch(`${API_URL}/applications/seeker`, {
      headers: { Authorization: `Bearer ${seekerToken}` },
    });
    const seekerAppsData = await seekerAppsRes.json();
    if (!seekerAppsData.success) throw new Error('Failed to get seeker applications');
    const myApp = seekerAppsData.applications.find((app) => app._id === applicationId);
    if (!myApp) throw new Error('Submitted application not found on seeker dashboard');
    console.log(`Verified: Seeker has application for "${myApp.job.title}" with status: "${myApp.status}"`);

    // 8. Employer gets incoming applications
    console.log('\n8. Checking employer dashboard incoming applications...');
    const empAppsRes = await fetch(`${API_URL}/applications/employer`, {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    const empAppsData = await empAppsRes.json();
    if (!empAppsData.success) throw new Error('Failed to get employer applications');
    const receivedApp = empAppsData.applications.find((app) => app._id === applicationId);
    if (!receivedApp) throw new Error('Incoming application not found on employer console');
    console.log(`Verified: Employer received application from "${receivedApp.seeker.name}" for "${receivedApp.job.title}"`);

    // 9. Employer updates application status to Shortlisted
    console.log('\n9. Employer shortlisting the candidate...');
    const statusUpdateRes = await fetch(`${API_URL}/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employerToken}`,
      },
      body: JSON.stringify({ status: 'Shortlisted' }),
    });
    const statusUpdateData = await statusUpdateRes.json();
    if (!statusUpdateData.success) throw new Error(`Status update failed: ${statusUpdateData.message}`);
    console.log('Status updated successfully on backend.');

    // 10. Seeker checks their applications again to verify update
    console.log('\n10. Seeker verifying the updated status...');
    const verifyAppRes = await fetch(`${API_URL}/applications/seeker`, {
      headers: { Authorization: `Bearer ${seekerToken}` },
    });
    const verifyAppData = await verifyAppRes.json();
    const updatedApp = verifyAppData.applications.find((app) => app._id === applicationId);
    if (updatedApp.status !== 'Shortlisted') {
      throw new Error(`Status mismatch. Expected "Shortlisted" but got "${updatedApp.status}"`);
    }
    console.log(`Verified: Seeker application status is now "${updatedApp.status}"`);

    console.log('\n--- ALL END-TO-END FLOW VERIFICATIONS PASSED SUCCESSFULLY ---');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
};

runTests();
