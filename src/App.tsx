import { useState } from 'react';
import './App.css';
import { AppDataProvider } from './context/AppDataContext';
import { Navbar } from './components/Navbar';
import { LandingView } from './views/Landing/LandingView';
import { AuthView } from './views/Auth/AuthView';
import { LMSView } from './views/LMS/LMSView';
import { LabsView } from './views/Labs/LabsView';
import { SimulatorsView } from './views/Simulators/SimulatorsView';
import { SiliconValidation } from './views/Validation/SiliconValidation';
import { PlacementView } from './views/Placement/PlacementView';
import { AIView } from './views/AI/AIView';
import { AdminView } from './views/Admin/AdminView';
import { Cpu, Terminal, BookOpen, ShieldCheck, Mail, Phone } from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const renderActiveView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <LandingView 
            setView={setCurrentView} 
            setSelectedCourseId={setSelectedCourseId} 
          />
        );
      case 'auth':
        return <AuthView setView={setCurrentView} />;
      case 'simulators':
        return <SimulatorsView />;
      case 'labs':
        return <LabsView />;
      case 'validation':
        return <SiliconValidation />;
      case 'placement':
        return <PlacementView setView={setCurrentView} />;
      case 'ai':
        return <AIView />;
      case 'lms':
        return (
          <LMSView 
            setView={setCurrentView} 
            selectedCourseId={selectedCourseId} 
            setSelectedCourseId={setSelectedCourseId} 
          />
        );
      case 'admin':
        return <AdminView />;
      default:
        return (
          <LandingView 
            setView={setCurrentView} 
            setSelectedCourseId={setSelectedCourseId} 
          />
        );
    }
  };

  return (
    <>
      <Navbar currentView={currentView} setView={setCurrentView} />
      
      {/* Active Sub View Container */}
      <main style={{ flexGrow: 1 }}>
        {renderActiveView()}
      </main>

      {/* Premium Dark Theme Footer */}
      <footer style={{
        backgroundColor: '#05070a',
        borderTop: '1px solid var(--border-color)',
        padding: '50px 24px 30px 24px',
        color: 'var(--text-secondary)'
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '30px',
          marginBottom: '40px'
        }}>
          {/* Logo and Tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={20} color="var(--primary)" />
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                THINK SILICON ACADEMY
              </span>
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.5 }}>
              Building Industry-Ready Embedded Engineers. Providing hardware-level virtual labs, register simulators, and post-silicon validation tracks.
            </p>
          </div>

          {/* Site Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Ecosystem
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <a href="#simulators" onClick={(e) => { e.preventDefault(); setCurrentView('simulators'); }}>Protocol Simulators</a>
              <a href="#labs" onClick={(e) => { e.preventDefault(); setCurrentView('labs'); }}>C & Embedded Labs</a>
              <a href="#validation" onClick={(e) => { e.preventDefault(); setCurrentView('validation'); }}>Validation Case Studies</a>
              <a href="#placement" onClick={(e) => { e.preventDefault(); setCurrentView('placement'); }}>Placement Board</a>
            </div>
          </div>

          {/* AI Training Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              AI Learning Aids
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <a href="#ai" onClick={(e) => { e.preventDefault(); setCurrentView('ai'); }}>AI Register Mentor</a>
              <a href="#ai" onClick={(e) => { e.preventDefault(); setCurrentView('ai'); }}>AI Interviewer Trainer</a>
              <a href="#auth" onClick={(e) => { e.preventDefault(); setCurrentView('auth'); }}>Bypass Login Panel</a>
            </div>
          </div>

          {/* Contact details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Admissions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} color="var(--primary)" /> admissions@thinksilicon.com
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="var(--primary)" /> +91 98765 43210
              </div>
            </div>
          </div>
        </div>

        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '11px'
        }}>
          <span>&copy; {new Date().getFullYear()} Think Silicon Academy. All rights reserved.</span>
          <span style={{ display: 'flex', gap: '16px' }}>
            <a href="#privacy" style={{ color: 'var(--text-muted)' }}>Privacy Policy</a>
            <a href="#terms" style={{ color: 'var(--text-muted)' }}>Terms of Service</a>
          </span>
        </div>
      </footer>
    </>
  );
}

function App() {
  return (
    <AppDataProvider>
      <AppContent />
    </AppDataProvider>
  );
}

export default App;
