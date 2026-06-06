import React, { useState, useRef } from 'react';
import { useAppData, Course, Lesson, Module } from '../../context/AppDataContext';
import { BookOpen, CheckCircle, Circle, ArrowLeft, Play, FileText, Code, Award, ExternalLink, HelpCircle } from 'lucide-react';

interface LMSViewProps {
  setView: (view: string) => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (courseId: string | null) => void;
}

export const LMSView: React.FC<LMSViewProps> = ({ setView, selectedCourseId, setSelectedCourseId }) => {
  const { 
    currentUser, 
    courses, 
    enrolledCourses, 
    completedLessons, 
    toggleLessonComplete,
    submissions
  } = useAppData();

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Return to landing page if not signed in
  if (!currentUser) {
    return (
      <div className="auth-layout">
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ marginBottom: '16px' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Please log in to view your learning dashboard.</p>
          <button onClick={() => setView('auth')} className="btn btn-primary">Go to Sign In</button>
        </div>
      </div>
    );
  }

  const activeCourse = courses.find(c => c.id === selectedCourseId);

  // Helper calculation for progress
  const getCourseProgress = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return 0;
    const completed = completedLessons[courseId] || [];
    const totalLessons = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
    if (totalLessons === 0) return 0;
    return Math.round((completed.length / totalLessons) * 100);
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    const course = courses.find(c => c.id === courseId);
    if (course && course.modules.length > 0 && course.modules[0].lessons.length > 0) {
      setActiveModule(course.modules[0]);
      setActiveLesson(course.modules[0].lessons[0]);
      setQuizSubmitted(false);
      setQuizScore(null);
      setSelectedAnswers({});
    }
  };

  const handleLessonSelect = (mod: Module, les: Lesson) => {
    setActiveModule(mod);
    setActiveLesson(les);
    setQuizSubmitted(false);
    setQuizScore(null);
    setSelectedAnswers({});
  };

  // Mock quiz questions for active lesson
  const mockQuizQuestions = [
    {
      q: 'Which C keyword prevents compiler optimization for memory-mapped hardware registers?',
      options: ['static', 'volatile', 'register', 'const'],
      correct: 1,
      explanation: 'volatile tells the compiler that the value can change outside program scope, forcing register re-reads.'
    },
    {
      q: 'For 4-byte address boundaries alignment, the hexadecimal address must end in which digit?',
      options: ['Any digit', '0, 4, 8, or C', '0, 2, 4, 6, 8', 'Even numbers only'],
      correct: 1,
      explanation: '4-byte alignment requires addresses to be multiples of 4 (ends in 0, 4, 8, or C in hex).'
    }
  ];

  const handleQuizAnswer = (qIdx: number, optIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const submitQuiz = () => {
    let score = 0;
    mockQuizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) {
        score += 50;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    if (score === 100 && activeCourse && activeLesson) {
      toggleLessonComplete(activeCourse.id, activeLesson.id);
    }
  };

  // Canvas Certificate Generator
  const downloadCertificate = (courseTitle: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, 800, 600);

    // Decorative Borders
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 10;
    ctx.strokeRect(15, 15, 770, 570);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(25, 25, 750, 550);

    // Header Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 36px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THINK SILICON ACADEMY', 400, 100);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText('POST-SILICON ENGINEERING & BARE-METAL CREDENTIAL', 400, 130);

    // Main Certificate Body
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'italic 20px Georgia, serif';
    ctx.fillText('This is to certify that', 400, 210);

    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 32px Poppins, sans-serif';
    ctx.fillText(currentUser.name, 400, 270);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'italic 20px Georgia, serif';
    ctx.fillText('has successfully compiled all modules and passed validation tests for', 400, 330);

    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 24px Poppins, sans-serif';
    ctx.fillText(courseTitle, 400, 380);

    // Signatures / QR Code section
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('Date: ' + new Date().toLocaleDateString(), 200, 480);
    ctx.fillText('Verification Code: TSA-' + Math.floor(Math.random() * 89999 + 10000), 200, 510);

    // Simple QR Code Representation
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(520, 430, 90, 90);
    ctx.fillStyle = '#0b0f19';
    // Draw dummy QR code blocks
    ctx.fillRect(530, 440, 25, 25);
    ctx.fillRect(575, 440, 25, 25);
    ctx.fillRect(530, 485, 25, 25);
    ctx.fillRect(560, 470, 15, 15);
    ctx.fillRect(575, 485, 10, 10);
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Scan to Verify', 565, 535);

    // Trigger download
    const link = document.createElement('a');
    link.download = `${currentUser.name.replace(/\s+/g, '_')}_Certificate.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="dashboard-layout">
      {/* Hidden canvas for certificate download */}
      <canvas ref={canvasRef} width="800" height="600" style={{ display: 'none' }} />

      {!selectedCourseId ? (
        // --- STUDENT DASHBOARD VIEW ---
        <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px' }}>Welcome, {currentUser.name}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Track your progress, access your courses, or launch register simulators.</p>
          </div>

          {/* Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
                <BookOpen size={24} />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Enrolled Courses</div>
                <div style={{ fontSize: '24px', fontWeight: 700 }}>{enrolledCourses.length}</div>
              </div>
            </div>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--success)' }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Completed Lessons</div>
                <div style={{ fontSize: '24px', fontWeight: 700 }}>
                  {Object.values(completedLessons).reduce((sum, list) => sum + list.length, 0)}
                </div>
              </div>
            </div>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--warning)' }}>
                <Award size={24} />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Earned Certificates</div>
                <div style={{ fontSize: '24px', fontWeight: 700 }}>
                  {enrolledCourses.filter(cid => getCourseProgress(cid) === 100).length}
                </div>
              </div>
            </div>
          </div>

          {/* Enrolled Courses Grid */}
          <div>
            <h2 style={{ fontSize: '22px', marginBottom: '16px' }}>Your Courses</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {courses.filter(c => enrolledCourses.includes(c.id)).map(course => {
                const progress = getCourseProgress(course.id);
                return (
                  <div key={course.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <span className="badge badge-info" style={{ marginBottom: '8px' }}>{course.category}</span>
                      <h3 style={{ fontSize: '18px' }}>{course.title}</h3>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button onClick={() => handleSelectCourse(course.id)} className="btn btn-primary" style={{ flex: 1 }}>
                        Open Classroom
                      </button>
                      {progress === 100 && (
                        <button onClick={() => downloadCertificate(course.title)} className="btn btn-secondary" title="Download Certificate">
                          <Award size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shortcuts for Labs & Simulators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05), transparent)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '18px' }}>Launch Protocol Simulators</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Practice bus transfers, debugging CAN frame conflicts, SPI polarity configurations, or watch register shifts on MCU timers.
              </p>
              <button onClick={() => setView('simulators')} className="btn btn-outline" style={{ alignSelf: 'flex-start' }}>
                Open Simulators Dashboard
              </button>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), transparent)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '18px' }}>C & Embedded Virtual Labs</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Submit laboratory reports, write pointer arithmetic code, or test device driver templates on virtual register hardware.
              </p>
              <button onClick={() => setView('labs')} className="btn btn-outline" style={{ alignSelf: 'flex-start' }}>
                Open Virtual Labs
              </button>
            </div>
          </div>
        </div>
      ) : (
        // --- COURSE LEARNING PLAYER MODE ---
        <div style={{ display: 'flex', width: '100%', minHeight: 'calc(100vh - 70px)' }}>
          
          {/* Sidebar Navigation */}
          <div style={{
            width: '320px',
            borderRight: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-accent)',
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <button onClick={() => setSelectedCourseId(null)} className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '13px' }}>
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
            
            <h2 style={{ fontSize: '16px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Course Syllabus
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeCourse?.modules.map(mod => (
                <div key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>{mod.title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {mod.lessons.map(les => {
                      const isCompleted = (completedLessons[activeCourse.id] || []).includes(les.id);
                      const isSelected = activeLesson?.id === les.id;
                      return (
                        <button
                          key={les.id}
                          onClick={() => handleLessonSelect(mod, les)}
                          style={{
                            background: isSelected ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                            border: '1px solid ' + (isSelected ? 'rgba(6, 182, 212, 0.3)' : 'transparent'),
                            color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px'
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isCompleted ? <CheckCircle size={14} color="var(--success)" /> : <Circle size={14} color="var(--text-muted)" />}
                            {les.title}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{les.duration}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Pane */}
          <div style={{ flexGrow: 1, padding: '40px', overflowY: 'auto' }}>
            {activeLesson ? (
              <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <span className="badge badge-info" style={{ marginBottom: '8px' }}>{activeLesson.type.toUpperCase()} LESSON</span>
                  <h1 style={{ fontSize: '28px' }}>{activeLesson.title}</h1>
                </div>

                {/* Simulated Content Player */}
                {activeLesson.type === 'video' && (
                  <div style={{
                    aspectRatio: '16/9',
                    backgroundColor: '#000',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: 'pointer'
                  }}>
                    {/* Simulated Player Controls overlay */}
                    <div style={{
                      backgroundColor: 'rgba(6, 182, 212, 0.15)',
                      border: '1px solid var(--primary)',
                      borderRadius: '50%',
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-neon)'
                    }}>
                      <Play size={32} fill="var(--primary)" color="var(--primary)" />
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '20px',
                      left: '20px',
                      right: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>0:00 / {activeLesson.duration}</span>
                      <div style={{ flexGrow: 1, height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px' }}>
                        <div style={{ width: '0%', height: '100%', backgroundColor: 'var(--primary)' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                {activeLesson.type === 'pdf' && (
                  <div className="card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
                      <FileText size={28} />
                      <span style={{ fontWeight: 600 }}>Syllabus PDF Reading Notes</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      This reading document details compiler register maps and architecture. Read through the PDF sections inside the workspace.
                    </p>
                    <div style={{ padding: '16px', backgroundColor: 'var(--bg-input)', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                      Section 3.2: Volatile peripheral assignments<br />
                      Section 3.3: System Configuration registers modes
                    </div>
                  </div>
                )}

                {activeLesson.type === 'code' && (
                  <div className="code-editor">
                    <div className="code-editor-header">
                      <div className="code-editor-dots">
                        <span className="code-editor-dot"></span>
                        <span className="code-editor-dot"></span>
                        <span className="code-editor-dot"></span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>stm32_gpio.c</span>
                    </div>
                    <div className="code-editor-body">
                      <pre style={{ margin: 0, color: '#10b981', fontSize: '13px' }}>
                        {`// Pointer memory mapping example
#define GPIOA_BASE  0x40020000
#define GPIO_MODER  (*((volatile uint32_t*)(GPIOA_BASE + 0x00)))
#define GPIO_ODR    (*((volatile uint32_t*)(GPIOA_BASE + 0x14)))

void setup() {
    // Select Output mode (01) for Pin 5
    GPIO_MODER &= ~(3 << 10);
    GPIO_MODER |=  (1 << 10);
}`}
                      </pre>
                    </div>
                  </div>
                )}

                {activeLesson.type === 'lab' && (
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '18px' }}>Launch Lab Environment</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      This lesson requires submitting code in the Virtual Lab. Click the button below to switch to the workspace.
                    </p>
                    <button onClick={() => setView('labs')} className="btn btn-outline" style={{ alignSelf: 'flex-start' }}>
                      Go to Virtual Labs <ExternalLink size={14} />
                    </button>
                  </div>
                )}

                {/* Lesson Description */}
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Lesson Overview</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{activeLesson.content}</p>
                </div>

                {/* Assessment Quiz Engine */}
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '30px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <HelpCircle size={22} color="var(--primary)" />
                    <h3 style={{ fontSize: '20px' }}>Assessment Quiz</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {mockQuizQuestions.map((question, qIdx) => (
                      <div key={qIdx} className="card" style={{ padding: '20px', backgroundColor: 'var(--bg-accent)' }}>
                        <div style={{ fontWeight: 600, marginBottom: '14px', fontSize: '15px' }}>
                          Q{qIdx + 1}: {question.q}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {question.options.map((option, optIdx) => {
                            const isSelected = selectedAnswers[qIdx] === optIdx;
                            const isCorrect = question.correct === optIdx;
                            return (
                              <button
                                key={optIdx}
                                disabled={quizSubmitted}
                                onClick={() => handleQuizAnswer(qIdx, optIdx)}
                                style={{
                                  background: isSelected 
                                    ? (quizSubmitted 
                                        ? (isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)')
                                        : 'rgba(6, 182, 212, 0.1)')
                                    : (quizSubmitted && isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'transparent'),
                                  border: '1px solid ' + (
                                    isSelected 
                                      ? (quizSubmitted 
                                          ? (isCorrect ? 'var(--success)' : 'var(--error)')
                                          : 'var(--primary)')
                                      : (quizSubmitted && isCorrect ? 'var(--success)' : 'var(--border-color)')
                                  ),
                                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                                  padding: '12px 16px',
                                  borderRadius: '8px',
                                  cursor: quizSubmitted ? 'not-allowed' : 'pointer',
                                  textAlign: 'left',
                                  fontSize: '14px',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                        {quizSubmitted && (
                          <div style={{
                            marginTop: '14px',
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                            padding: '8px 12px',
                            borderRadius: '6px'
                          }}>
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px', alignItems: 'center' }}>
                    {!quizSubmitted ? (
                      <button onClick={submitQuiz} className="btn btn-primary">
                        Submit Answers
                      </button>
                    ) : (
                      <>
                        <div style={{ fontSize: '15px', fontWeight: 600 }}>
                          Your Score: <span style={{ color: quizScore === 100 ? 'var(--success)' : 'var(--error)' }}>{quizScore}%</span>
                        </div>
                        {quizScore === 100 ? (
                          <span style={{ fontSize: '13px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={14} /> Lesson unlocked and completed!
                          </span>
                        ) : (
                          <button onClick={() => { setQuizSubmitted(false); setSelectedAnswers({}); }} className="btn btn-secondary">
                            Try Again
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Mark Lesson Complete Button if not quiz */}
                {activeLesson.type !== 'lab' && quizScore !== 100 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button
                      onClick={() => activeCourse && toggleLessonComplete(activeCourse.id, activeLesson.id)}
                      className={`btn ${
                        activeCourse && (completedLessons[activeCourse.id] || []).includes(activeLesson.id)
                          ? 'btn-secondary'
                          : 'btn-outline'
                      }`}
                    >
                      {activeCourse && (completedLessons[activeCourse.id] || []).includes(activeLesson.id)
                        ? 'Completed (Click to toggle)'
                        : 'Mark Lesson Complete'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                <h3>Select a lesson from the syllabus sidebar to begin studying.</h3>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
