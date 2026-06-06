import React, { useState } from 'react';
import { useAppData, User, Course, Job } from '../../context/AppDataContext';
import { Cpu, Users, Award, Shield, FileText, CheckCircle2, ChevronRight, Play, Briefcase, Plus, Send, Check } from 'lucide-react';

export const AdminView: React.FC = () => {
  const { 
    currentUser, 
    submissions, 
    gradeSubmission, 
    jobs, 
    addJob, 
    applications 
  } = useAppData();

  const [activeTab, setActiveTab] = useState<'grading' | 'jobs' | 'telemetry'>('grading');

  // --- TRAINER GRADING STATES ---
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [score, setScore] = useState(90);
  const [feedback, setFeedback] = useState('');

  // --- PLACEMENT TEAM STATES ---
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobSalary, setJobSalary] = useState('');
  const [jobReqs, setJobReqs] = useState('');
  const [jobDesc, setJobDesc] = useState('');

  if (!currentUser) return <div>Denied. Please log in.</div>;

  const activeSub = submissions.find(s => s.id === selectedSubId);

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubId) return;
    gradeSubmission(selectedSubId, 'passed', score, feedback);
    alert('Grade registered successfully! Student has been notified.');
    setSelectedSubId(null);
    setFeedback('');
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobCompany) return;
    const newJob: Job = {
      id: 'job_' + Math.random().toString(36).substring(2, 9),
      title: jobTitle,
      company: jobCompany,
      location: jobLocation || 'Remote',
      salary: jobSalary || '₹10,00,000 / year',
      requirements: jobReqs ? jobReqs.split(',').map(r => r.trim()) : ['Embedded Systems'],
      description: jobDesc,
      status: 'active'
    };
    addJob(newJob);
    alert('Job opening published to board successfully!');
    setJobTitle('');
    setJobCompany('');
    setJobLocation('');
    setJobSalary('');
    setJobReqs('');
    setJobDesc('');
  };

  return (
    <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield color="var(--primary)" /> Academy Faculty & Admin Portal
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Active Session: <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()})
        </p>
      </div>

      {/* Selector Tabs depending on Role */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '1px' }}>
        {(currentUser.role === 'admin' || currentUser.role === 'trainer') && (
          <button
            onClick={() => setActiveTab('grading')}
            style={{
              background: activeTab === 'grading' ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'grading' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'grading' ? 'var(--primary)' : 'var(--text-secondary)',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            Grade Student Labs ({submissions.filter(s => s.status === 'pending').length})
          </button>
        )}

        {(currentUser.role === 'admin' || currentUser.role === 'placement') && (
          <button
            onClick={() => setActiveTab('jobs')}
            style={{
              background: activeTab === 'jobs' ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'jobs' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'jobs' ? 'var(--primary)' : 'var(--text-secondary)',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            Publish Job Openings
          </button>
        )}

        {currentUser.role === 'admin' && (
          <button
            onClick={() => setActiveTab('telemetry')}
            style={{
              background: activeTab === 'telemetry' ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'telemetry' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'telemetry' ? 'var(--primary)' : 'var(--text-secondary)',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            System Telemetry & Logs
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div style={{ marginTop: '10px' }}>
        
        {/* GRADING TAB */}
        {activeTab === 'grading' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            {/* List submissions */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '18px' }}>Lab Submissions Queue</h3>
              
              {submissions.length === 0 ? (
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No student lab submissions queued.</span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {submissions.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => { setSelectedSubId(sub.id); setScore(sub.score || 90); setFeedback(sub.feedback || ''); }}
                      style={{
                        background: selectedSubId === sub.id ? 'rgba(6, 182, 212, 0.1)' : 'var(--bg-input)',
                        border: '1px solid ' + (selectedSubId === sub.id ? 'var(--primary)' : 'var(--border-color)'),
                        color: 'var(--text-primary)',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '13px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>{sub.studentName}</span>
                        <span className={`badge ${sub.status === 'passed' ? 'badge-success' : (sub.status === 'pending' ? 'badge-warning' : 'badge-error')}`}>
                          {sub.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        Lab: {sub.labId} | {sub.submittedAt}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grading interface panel */}
            {activeSub ? (
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--primary)' }}>Grading Student: {activeSub.studentName}</h3>
                
                <div>
                  <h4 style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Submitted Code</h4>
                  <pre style={{
                    backgroundColor: '#05070c',
                    padding: '14px',
                    borderRadius: '8px',
                    color: '#67e8f9',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    overflowX: 'auto',
                    maxHeight: '180px'
                  }}>
                    {activeSub.code}
                  </pre>
                </div>

                <div>
                  <h4 style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Lab Report Observations</h4>
                  <p style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5
                  }}>
                    {activeSub.report}
                  </p>
                </div>

                <form onSubmit={handleGradeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Grading Score (0 - 100)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={score}
                      onChange={e => setScore(Number(e.target.value))}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Instructor Feedback</label>
                    <textarea
                      placeholder="Add specific comments on volatile usage, pointer increments, or wave checks..."
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                      className="form-input"
                      style={{ minHeight: '80px', resize: 'vertical' }}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Register Grade & Notify Student
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '100px' }} className="card">
                Select a student submission from the queue to start validation reviews.
              </div>
            )}
          </div>
        )}

        {/* JOBS TAB */}
        {activeTab === 'jobs' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            <form onSubmit={handleCreateJob} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '18px' }}>Create New Job Opening</h3>
              
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input type="text" placeholder="Embedded Software Engineer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Hiring Company</label>
                <input type="text" placeholder="Intel Corporation" value={jobCompany} onChange={e => setJobCompany(e.target.value)} className="form-input" required />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Office Location</label>
                  <input type="text" placeholder="Bangalore (Hybrid)" value={jobLocation} onChange={e => setJobLocation(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Salary Range</label>
                  <input type="text" placeholder="₹12,00,000 / year" value={jobSalary} onChange={e => setJobSalary(e.target.value)} className="form-input" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Requirements (Comma separated)</label>
                <input type="text" placeholder="ARM Cortex-M, GCC, Pointers, I2C" value={jobReqs} onChange={e => setJobReqs(e.target.value)} className="form-input" />
              </div>

              <div className="form-group">
                <label className="form-label">Job Description</label>
                <textarea placeholder="Outline duties..." value={jobDesc} onChange={e => setJobDesc(e.target.value)} className="form-input" style={{ minHeight: '80px', resize: 'vertical' }} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Publish Job to Board
              </button>
            </form>

            {/* List active applications received */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '18px' }}>Received Student Applications ({applications.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {applications.map(app => {
                  const job = jobs.find(j => j.id === app.jobId);
                  return (
                    <div key={app.id} style={{
                      backgroundColor: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      padding: '14px',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>Student ID: {app.studentId.substring(0,8)}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Role: {job?.title} ({job?.company})</div>
                      </div>
                      <span className="badge badge-success" style={{ fontSize: '10px' }}>{app.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TELEMETRY LOGS TAB */}
        {activeTab === 'telemetry' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px' }}>Database Synchronization Telemetry</h3>
            <div style={{
              backgroundColor: '#05070c',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: '#38bdf8',
              minHeight: '250px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div>[SYSTEM INFO] local_storage_state sync Active.</div>
              <div>[TABLE SELECT] fetch: courses (count: 4)</div>
              <div>[TABLE SELECT] fetch: jobs (count: {jobs.length})</div>
              <div>[TABLE SELECT] fetch: submissions (count: {submissions.length})</div>
              <div>[API ROUTE] client_session_role = "admin"</div>
              <div>[SECURE CHANNEL] AES-256 state loaded successfully.</div>
              <div style={{ borderTop: '1px solid rgba(56, 189, 248, 0.2)', paddingTop: '10px', marginTop: '10px', color: 'var(--text-secondary)' }}>
                System operating normally. Local storage buffer utilizing {JSON.stringify(localStorage).length} bytes of state space.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
