import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { Briefcase, Upload, ShieldAlert, Award, FileText, CheckCircle2, ChevronRight, Play } from 'lucide-react';

interface PlacementViewProps {
  setView: (view: string) => void;
}

export const PlacementView: React.FC<PlacementViewProps> = ({ setView }) => {
  const { 
    currentUser, 
    jobs, 
    applications, 
    applyForJob, 
    uploadResume,
    mockInterviewResults 
  } = useAppData();

  const [uploading, setUploading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<typeof jobs[0] | null>(null);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      const name = e.target.files[0].name;
      setTimeout(() => {
        uploadResume(name);
        setUploading(false);
      }, 1500);
    }
  };

  const handleApply = (jobId: string) => {
    if (!currentUser) {
      alert('Please sign in to apply for job openings.');
      setView('auth');
      return;
    }
    if (!currentUser.resumeName) {
      alert('Please upload your resume before submitting job applications.');
      return;
    }
    applyForJob(jobId);
    alert('Application submitted successfully! Silicon Technologies hiring managers will review your profile.');
  };

  return (
    <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Briefcase color="var(--primary)" /> Industry Placement Portal
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Submit applications to top-tier semiconductor hiring partners, manage your resume credentials, and mock-test core skills.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        {/* Left Side: Student Credentials, Resumes, and Application status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Resume Upload Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--primary)" /> Resume Credentials
            </h3>
            
            {currentUser?.resumeName ? (
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid var(--success)',
                padding: '12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '13px', color: 'var(--success)' }}>
                  📄 {currentUser.resumeName}
                </span>
                <span className="badge badge-success" style={{ fontSize: '9px' }}>Active</span>
              </div>
            ) : (
              <div style={{
                border: '2px dashed var(--border-color)',
                padding: '24px',
                borderRadius: '8px',
                textAlign: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
                <Upload size={24} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{uploading ? 'Uploading credentials...' : 'Upload PDF Resume'}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Max file size 5MB</div>
              </div>
            )}
            
            {!currentUser && (
              <span style={{ fontSize: '11px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldAlert size={12} /> Log in to manage job credentials.
              </span>
            )}
          </div>

          {/* Job Applications Tracker Table */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '18px' }}>Active Applications Tracker</h3>
            
            {applications.length === 0 ? (
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>You have not submitted any applications yet.</span>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => {
                      const job = jobs.find(j => j.id === app.jobId);
                      return (
                        <tr key={app.id}>
                          <td style={{ fontSize: '13px' }}>
                            <div style={{ fontWeight: 600 }}>{job?.title}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{job?.company}</div>
                          </td>
                          <td>
                            <span className="badge badge-success" style={{ fontSize: '9px' }}>{app.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Mock Interview Results history */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '18px' }}>Interview Scorecard History</h3>
            {mockInterviewResults.length === 0 ? (
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No mock interviews recorded. Complete your first test in AI section.</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {mockInterviewResults.map((res, idx) => (
                  <div key={idx} style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{res.topic} Interview</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{res.date}</div>
                    </div>
                    <span className={`badge ${res.score >= 80 ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '10px' }}>
                      {res.score}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Job Openings board */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '20px', color: 'var(--primary)' }}>Semiconductor Industry Job Board</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {jobs.map(job => {
                const hasApplied = applications.some(app => app.jobId === job.id && app.studentId === currentUser?.id);
                return (
                  <div key={job.id} style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: 'var(--bg-input)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    cursor: 'pointer'
                  }} onClick={() => setSelectedJob(job)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 600 }}>{job.title}</h4>
                        <div style={{ fontSize: '13px', color: 'var(--primary)' }}>{job.company}</div>
                      </div>
                      <span className="badge badge-info" style={{ fontSize: '10px' }}>{job.location}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <strong>Required Skills:</strong> {job.requirements.join(', ')}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>{job.salary}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleApply(job.id); }}
                        disabled={hasApplied}
                        className={`btn ${hasApplied ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        {hasApplied ? 'Applied' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Practice Interview Module Link */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), transparent)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '18px' }}>Launch AI Skill Mock Assessments</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
              Pass mock testing runs to boost your resume credibility on the recruitment databases.
            </p>
            <button onClick={() => setView('ai')} className="btn btn-outline" style={{ alignSelf: 'flex-start' }}>
              <Play size={12} fill="var(--primary)" /> Launch AI Interview Trainer
            </button>
          </div>
        </div>

      </div>

      {/* Selected Job Detailed Modal */}
      {selectedJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%' }}>
            <h3 style={{ fontSize: '22px', marginBottom: '4px' }}>{selectedJob.title}</h3>
            <div style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '16px' }}>{selectedJob.company}</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div>
                <strong>Location:</strong> <span style={{ color: 'var(--text-secondary)' }}>{selectedJob.location}</span>
              </div>
              <div>
                <strong>Salary Scale:</strong> <span style={{ color: 'var(--success)' }}>{selectedJob.salary}</span>
              </div>
              <div>
                <strong>Key Responsibilities:</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', lineHeight: 1.5 }}>
                  {selectedJob.description}
                </p>
              </div>
              <div>
                <strong>Requirements:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {selectedJob.requirements.map((r, idx) => (
                    <span key={idx} className="badge badge-info" style={{ fontSize: '10px' }}>{r}</span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setSelectedJob(null)} className="btn btn-secondary" style={{ flex: 1 }}>Close Details</button>
              <button
                onClick={() => { handleApply(selectedJob.id); setSelectedJob(null); }}
                disabled={applications.some(app => app.jobId === selectedJob.id && app.studentId === currentUser?.id)}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Apply for Position
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
