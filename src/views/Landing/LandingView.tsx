import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { Cpu, Layers, ShieldCheck, ChevronRight, Play, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';

interface LandingViewProps {
  setView: (view: string) => void;
  setSelectedCourseId: (courseId: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ setView, setSelectedCourseId }) => {
  const { courses, enrollInCourse, currentUser } = useAppData();
  const [activeCategory, setActiveCategory] = useState<'all' | 'programming' | 'embedded' | 'linux' | 'validation' | 'protocols'>('all');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoForm, setDemoForm] = useState({ name: '', email: '', phone: '', slots: 'tomorrow-evening' });
  const [demoBooked, setDemoBooked] = useState(false);

  const stats = [
    { value: '98%', label: 'Placement Rate' },
    { value: '150+', label: 'Hiring Partners' },
    { value: '34 LPA', label: 'Highest Package' },
    { value: '100% ', label: 'Real Hardware Labs' }
  ];

  const categories = [
    { id: 'all', label: 'All Fields' },
    { id: 'programming', label: 'Programming' },
    { id: 'embedded', label: 'Embedded C / ARM' },
    { id: 'linux', label: 'Embedded Linux' },
    { id: 'validation', label: 'Silicon Validation' },
    { id: 'protocols', label: 'Protocols' }
  ];

  const handleEnroll = (courseId: string) => {
    enrollInCourse(courseId);
    setSelectedCourseId(courseId);
    setView(currentUser ? 'lms' : 'auth');
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoBooked(true);
    setTimeout(() => {
      setShowDemoModal(false);
      setDemoBooked(false);
      setDemoForm({ name: '', email: '', phone: '', slots: 'tomorrow-evening' });
    }, 2500);
  };

  const filteredCourses = activeCategory === 'all' 
    ? courses 
    : courses.filter(c => c.category === activeCategory);

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      {/* Hero Section */}
      <section style={{
        padding: '100px 24px 80px 24px',
        background: 'radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.12), transparent 40%), radial-gradient(circle at 10% 80%, rgba(59, 130, 246, 0.08), transparent 40%), var(--bg-main)',
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="float-element" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(6, 182, 212, 0.06)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: '9999px',
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--primary)',
            marginBottom: '28px',
            letterSpacing: '0.5px'
          }}>
            <Cpu size={14} /> SEMICONDUCTOR & EMBEDDED SYSTEMS CAREER BOOTCAMP
          </div>

          <h1 style={{
            fontSize: 'calc(2rem + 2vw)',
            lineHeight: 1.15,
            fontWeight: 800,
            marginBottom: '20px',
            letterSpacing: '-0.03em'
          }}>
            Master Embedded Systems, <br />
            <span className="gradient-text">Embedded Linux & Silicon Validation</span>
          </h1>

          <p style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            maxWidth: '650px',
            margin: '0 auto 40px auto',
            lineHeight: 1.6
          }}>
            Transform into an industry-ready hardware systems engineer. Learn with ARM Cortex MCUs, write custom device drivers, validate Silicon IPs, and secure premium placements.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => {
              const element = document.getElementById('courses-section');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }} className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>
              Explore Courses <ChevronRight size={16} />
            </button>
            <button onClick={() => setShowDemoModal(true)} className="btn btn-outline" style={{ padding: '14px 28px', fontSize: '15px' }}>
              <Play size={15} fill="var(--primary)" /> Book Free Demo
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '20px',
          maxWidth: '1000px',
          margin: '80px auto 0 auto',
          padding: '24px',
          backgroundColor: 'rgba(18, 24, 38, 0.5)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          backdropFilter: 'blur(8px)'
        }}>
          {stats.map((stat, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 800,
                color: 'var(--primary)',
                fontFamily: 'var(--font-header)',
                marginBottom: '4px'
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Founder Message Section */}
      <section style={{ padding: '80px 24px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center' }}>
          <div style={{
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            aspectRatio: '4/3',
            background: 'radial-gradient(circle at center, #1e293b, var(--bg-card))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Visual simulation of a premium silicon testing lab */}
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Cpu size={80} color="var(--primary)" style={{ opacity: 0.15, marginBottom: '16px' }} />
              <div style={{ fontStyle: 'italic', fontSize: '14px', color: 'var(--text-secondary)' }}>
                "Post-Silicon Logic & Protocol Sweep Lab Setup"
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                <span className="badge badge-success">I2C</span>
                <span className="badge badge-info">SPI</span>
                <span className="badge badge-warning">PCIe</span>
                <span className="badge badge-error">ARM EXTI</span>
              </div>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Founder & Director Message
            </span>
            <h2 style={{ fontSize: '30px', marginTop: '8px', marginBottom: '20px' }}>
              Silicon Careers Require Practical Hardware Practice
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '15px' }}>
              "Most university engineering programs leave graduates stranded in purely theoretical worlds. At Think Silicon Academy, we believe in bare-metal coding. We run direct registers, compile real Linux kernel drivers, and analyze physical protocol waveforms.
            </p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '15px' }}>
              Our simulator engines and lab guides model the exact debugging cycles you will encounter on silicon chips in production environments at companies like Qualcomm, Nvidia, and ARM."
            </p>
            <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>Siva Rami Reddy</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Founder, Think Silicon Academy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={{ padding: '80px 24px', backgroundColor: '#0b0f19', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Core Methodology
          </span>
          <h2 style={{ fontSize: '32px', marginTop: '8px', marginBottom: '16px' }}>
            Built for Real-World Engineering Competency
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 60px auto' }}>
            We do not teach abstract code. Our curriculum is mapped directly to hardware specifications, boot vectors, and signal diagnostics.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="card">
              <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><Cpu size={36} /></div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>ARM Cortex Bare-Metal</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Write direct registers values, manage NVIC registers, configure RCC clocks, and control STM32 peripheral buses from scratch.
              </p>
            </div>
            <div className="card">
              <div style={{ color: 'var(--secondary)', marginBottom: '16px' }}><Layers size={36} /></div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Kernel Device Drivers</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Develop custom character driver files, allocate platform resources, process interrupts, and construct ring buffer registers.
              </p>
            </div>
            <div className="card">
              <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><ShieldCheck size={36} /></div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Silicon Validation Tracks</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Run Post-Silicon bring-up tests. Isolate clock domain crossing issues, analyze DMA failures, and test validation matrices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Course Catalog */}
      <section id="courses-section" style={{ padding: '80px 24px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Academic Paths
            </span>
            <h2 style={{ fontSize: '32px', marginTop: '8px', marginBottom: '16px' }}>
              Syllabus Engineered for Industry Roles
            </h2>
            
            {/* Category Filter Tab bar */}
            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: '24px'
            }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`btn ${activeCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '20px' }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {filteredCourses.map(course => (
              <div key={course.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span className="badge badge-info">{course.category}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{course.difficulty}</span>
                  </div>
                  <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>{course.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
                    {course.description}
                  </p>
                  <div style={{ borderTop: '1px solid var(--border-color)', padding: '14px 0', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      <CheckCircle2 size={14} color="var(--primary)" /> Include Real Hardware Labs
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                      <CheckCircle2 size={14} color="var(--primary)" /> Certificate of Completion
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleEnroll(course.id)}
                  className="btn btn-outline"
                  style={{ width: '100%', marginTop: '20px' }}
                >
                  {currentUser ? 'Go to Classroom' : 'Enroll / Start Learning'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Salary & Placements Section */}
      <section style={{ padding: '80px 24px', backgroundColor: '#0b0f19', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Career Impact
            </span>
            <h2 style={{ fontSize: '30px', marginTop: '8px', marginBottom: '20px' }}>
              Silicon Validation Salary Growth Trend
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '15px' }}>
              Embedded Systems and ASIC/FPGA validation roles command a significant premium due to the deep engineering expertise required.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: 'var(--bg-card)', borderRadius: '8px' }}>
                <span style={{ fontWeight: 600 }}>Fresh Graduate (LMS Core)</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>₹6.5 - ₹9 LPA</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: 'var(--bg-card)', borderRadius: '8px' }}>
                <span style={{ fontWeight: 600 }}>Embedded Dev (2+ Yrs Experience)</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>₹12 - ₹18 LPA</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: 'var(--bg-card)', borderRadius: '8px' }}>
                <span style={{ fontWeight: 600 }}>Validation Specialist (5+ Yrs Experience)</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>₹25 - ₹40 LPA</span>
              </div>
            </div>
            <button onClick={() => setView('placement')} className="btn btn-secondary">
              Go to Placement Portal
            </button>
          </div>

          {/* SVG Chart */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Salary Trend (Semiconductor vs IT)</h3>
            <svg viewBox="0 0 400 200" className="waveform-svg" style={{ height: '180px' }}>
              {/* Grid Lines */}
              <line x1="50" y1="20" x2="380" y2="20" className="waveform-grid" />
              <line x1="50" y1="70" x2="380" y2="70" className="waveform-grid" />
              <line x1="50" y1="120" x2="380" y2="120" className="waveform-grid" />
              <line x1="50" y1="170" x2="380" y2="170" className="waveform-grid" />
              
              {/* Y Axis Labels */}
              <text x="10" y="25" fill="var(--text-secondary)" fontSize="10">40 LPA</text>
              <text x="10" y="75" fill="var(--text-secondary)" fontSize="10">20 LPA</text>
              <text x="10" y="125" fill="var(--text-secondary)" fontSize="10">10 LPA</text>
              <text x="10" y="175" fill="var(--text-secondary)" fontSize="10">4 LPA</text>

              {/* Silicon Trend Curve */}
              <path d="M 50 170 Q 150 140 250 80 T 380 30" fill="none" stroke="var(--primary)" strokeWidth="3" />
              {/* General IT Trend Curve */}
              <path d="M 50 170 Q 150 150 250 120 T 380 90" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="3" />

              {/* X Axis Labels */}
              <text x="50" y="195" fill="var(--text-secondary)" fontSize="10">Grad</text>
              <text x="200" y="195" fill="var(--text-secondary)" fontSize="10">3 Yrs</text>
              <text x="350" y="195" fill="var(--text-secondary)" fontSize="10">6+ Yrs</text>
            </svg>
            <div style={{ display: 'flex', gap: '20px', fontSize: '11px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '4px', backgroundColor: 'var(--primary)', display: 'inline-block' }}></span>
                Think Silicon Engineers
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '4px', backgroundColor: 'var(--text-muted)', display: 'inline-block' }}></span>
                Generic Software Developers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Google Map placeholder */}
      <section style={{ padding: '80px 24px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
          <div>
            <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Need Guidance? Let's Talk.</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
              Have questions about course modules, lab hardware, or placement terms? Send us an inquiry or reach out directly on WhatsApp.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Phone size={20} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Phone Call</div>
                  <div style={{ fontWeight: 600 }}>+91 98765 43210</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Mail size={20} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Support Email</div>
                  <div style={{ fontWeight: 600 }}>admissions@thinksilicon.com</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <MapPin size={20} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Campus HQ</div>
                  <div style={{ fontWeight: 600 }}>Tech Park, Ring Road, Bangalore, India</div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={e => { e.preventDefault(); alert('Inquiry successfully logged! Our academic advisor will contact you within 2 hours.'); }} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" placeholder="John Doe" required className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" placeholder="john@example.com" required className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input type="tel" placeholder="+91 XXXXX XXXXX" required className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Field of Interest</label>
              <select className="form-input" style={{ backgroundColor: 'var(--bg-input)' }}>
                <option>Embedded C & STM32</option>
                <option>Embedded Linux & Driver Development</option>
                <option>ASIC / Post Silicon Validation</option>
                <option>General Career Advice</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px' }}>
              Submit Inquiry
            </button>
          </form>
        </div>
      </section>

      {/* Demo Booking Modal */}
      {showDemoModal && (
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
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', position: 'relative' }}>
            <h3 style={{ fontSize: '22px', marginBottom: '8px' }}>Book Free Demo Session</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
              Join a live session demonstrating direct register manipulation on an STM32 board and oscilloscope probe bring-up.
            </p>

            {demoBooked ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <CheckCircle2 size={48} color="var(--success)" style={{ marginBottom: '16px' }} />
                <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>Demo Booked Successfully!</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  We have sent the calendar invite and Zoom link to your email. See you there!
                </p>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    required
                    value={demoForm.name}
                    onChange={e => setDemoForm(prev => ({ ...prev, name: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    required
                    value={demoForm.email}
                    onChange={e => setDemoForm(prev => ({ ...prev, email: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    required
                    value={demoForm.phone}
                    onChange={e => setDemoForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Select Slot</label>
                  <select
                    value={demoForm.slots}
                    onChange={e => setDemoForm(prev => ({ ...prev, slots: e.target.value }))}
                    className="form-input"
                    style={{ backgroundColor: 'var(--bg-input)' }}
                  >
                    <option value="tomorrow-evening">Tomorrow (5:00 PM - 6:00 PM)</option>
                    <option value="wednesday-morning">Wednesday (11:00 AM - 12:00 PM)</option>
                    <option value="saturday-workshop">Saturday Hardware Workshop (2:00 PM)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowDemoModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
