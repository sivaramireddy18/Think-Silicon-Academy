import React, { useState } from 'react';
import { useAppData, Lab } from '../../context/AppDataContext';
import { Layers, Terminal as TermIcon, FileText, CheckCircle2, AlertTriangle, Play, ChevronRight, CornerDownRight } from 'lucide-react';

export const LabsView: React.FC = () => {
  const { labs, submissions, submitLab, currentUser } = useAppData();
  const [selectedLab, setSelectedLab] = useState<Lab | null>(labs[0]);
  const [code, setCode] = useState(labs[0]?.starterCode || '');
  const [report, setReport] = useState('');
  
  // Terminal log simulation states
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'passed' | 'failed'>('idle');

  const handleSelectLab = (lab: Lab) => {
    setSelectedLab(lab);
    setCode(lab.starterCode);
    setReport('');
    setTerminalLogs([]);
    setTestStatus('idle');
  };

  const runCodeValidation = () => {
    if (!selectedLab) return;
    setIsCompiling(true);
    setTestStatus('running');
    setTerminalLogs([
      'arm-none-eabi-gcc -Wall -Wextra -O2 -c main.c -o main.o',
      'Compiling target hardware image...'
    ]);

    setTimeout(() => {
      let passed = false;
      const logs = [...terminalLogs];

      // Safe Pointer Lab validation
      if (selectedLab.id === 'lab-pointers') {
        const hasBaseOffset = code.includes('base_addr') && code.includes('offset');
        const hasAlignmentCheck = code.includes('% 4') || code.includes('& 3') || code.includes('& 0x03');
        const hasNullReturn = code.includes('NULL') || code.includes('0');

        if (hasBaseOffset && hasAlignmentCheck && hasNullReturn) {
          passed = true;
          logs.push(
            'main.c: In function \'get_reg_offset\':',
            'Compilation successful. 0 warnings, 0 errors.',
            'Executing hardware sweeps...',
            '[TEST 1] base_addr = 0x40020000, offset = 4 -> Base+Offset = 0x40020004 (Aligned) -> PASSED',
            '[TEST 2] base_addr = 0x40020000, offset = 3 -> Base+Offset = 0x40020003 (Unaligned) -> NULL returned -> PASSED',
            'SUCCESS: All test suites executed without error!'
          );
        } else {
          logs.push(
            'main.c: In function \'get_reg_offset\':',
            'WARNING: check alignment of base address + offset. Memory boundary access violation risk.',
            'Executing hardware sweeps...',
            '[TEST 1] base_addr = 0x40020000, offset = 4 -> Failed (Unexpected return)',
            '[TEST 2] base_addr = 0x40020000, offset = 3 -> Failed (Unaligned address did not return NULL)',
            'ERROR: Test suites failed. Ensure logic blocks unaligned accesses.'
          );
        }
      } 
      // GPIO Register Configuration Lab
      else if (selectedLab.id === 'lab-gpio') {
        const hasMODER = code.includes('GPIOA_MODER') && (code.includes('<< 10') || code.includes('0x400'));
        const hasODR = code.includes('GPIOA_ODR') && (code.includes('<< 5') || code.includes('0x20'));

        if (hasMODER && hasODR) {
          passed = true;
          logs.push(
            'main.c: Peripheral mapping compiled successfully.',
            'Executing pin state verification...',
            '[TEST 1] configure_led_output() -> MODER bits [11:10] set to 0x01 -> PASSED',
            '[TEST 2] toggle_led(1) -> ODR bit 5 set HIGH -> PASSED',
            '[TEST 3] toggle_led(0) -> ODR bit 5 cleared LOW -> PASSED',
            'SUCCESS: LED port control successfully validated on Virtual Cortex-M core!'
          );
        } else {
          logs.push(
            'main.c: Register pointer binding verified.',
            'Executing pin state verification...',
            '[TEST 1] configure_led_output() -> GPIOA_MODER value unexpected (LED pin mode not set to output) -> FAILED',
            '[TEST 2] toggle_led(1) -> GPIOA_ODR bit 5 did not toggle -> FAILED',
            'ERROR: Ensure registers are declared volatile, and correct bits are masked.'
          );
        }
      } 
      // Default I2C frame packing check
      else {
        const hasAddressShift = code.includes('<< 1') || code.includes('* 2') || code.includes('addr');
        const hasReadWriteMask = code.includes('is_read') || code.includes('|');

        if (hasAddressShift && hasReadWriteMask) {
          passed = true;
          logs.push(
            'main.c: I2C frame assembler compiled.',
            'Verifying serial framing protocols...',
            '[TEST 1] addr = 0x50, R/W = 0 (Write) -> frame[0] = 0xA0 -> PASSED',
            '[TEST 2] addr = 0x50, R/W = 1 (Read)  -> frame[0] = 0xA1 -> PASSED',
            'SUCCESS: Serial byte sequence matches I2C standard specification!'
          );
        } else {
          logs.push(
            'main.c: Incomplete byte packaging logic.',
            'Verifying serial framing protocols...',
            '[TEST 1] addr = 0x50, R/W = 0 -> Expected out_frame[0] to be shifted -> FAILED',
            'ERROR: I2C frames require address shifted left by 1 bit, with LSB carrying R/W state.'
          );
        }
      }

      setTerminalLogs(logs);
      setTestStatus(passed ? 'passed' : 'failed');
      setIsCompiling(false);
    }, 1500);
  };

  const handleReportSubmit = () => {
    if (!currentUser) {
      alert('Please sign in to submit report grades.');
      return;
    }
    if (!selectedLab) return;
    if (report.length < 15) {
      alert('Please write a detailed report describing your register results or findings (minimum 15 characters).');
      return;
    }

    submitLab(selectedLab.id, code, report);
    alert('Lab report submitted successfully! Instructor grading has been queued (graded automatically in 2s).');
  };

  // Find user's existing submission status for the current lab
  const currentSubmission = submissions.find(s => s.labId === selectedLab?.id && s.studentId === currentUser?.id);

  return (
    <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers color="var(--primary)" /> Virtual Embedded Laboratories
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Compile C driver routines, load register values, and submit detailed reports.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* Left Sidebar: Lab List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Available Labs
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {labs.map(lab => {
              const isSelected = selectedLab?.id === lab.id;
              const sub = submissions.find(s => s.labId === lab.id && s.studentId === currentUser?.id);
              return (
                <button
                  key={lab.id}
                  onClick={() => handleSelectLab(lab)}
                  style={{
                    background: isSelected ? 'rgba(6, 182, 212, 0.1)' : 'var(--bg-card)',
                    border: '1px solid ' + (isSelected ? 'var(--primary)' : 'var(--border-color)'),
                    color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '13px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxShadow: isSelected ? 'var(--shadow-neon)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {lab.title}
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span className="badge badge-info" style={{ fontSize: '9px' }}>{lab.category}</span>
                    {sub && (
                      <span className={`badge ${sub.status === 'passed' ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '9px' }}>
                        {sub.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Area: Interactive Editor & Lab Details */}
        {selectedLab ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            
            {/* Left Column: Lab Description & Report Submission */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card">
                <h3 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--primary)' }}>{selectedLab.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
                  {selectedLab.description}
                </p>

                <h4 style={{ fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="var(--primary)" /> Expected Test Cases
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {selectedLab.testCases.map((tc, idx) => (
                    <div key={idx} style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      borderLeft: '3px solid var(--primary)'
                    }}>
                      <strong>{tc.description}:</strong> Input: `{tc.input}` <br /> Expected: `{tc.expected}`
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab Report Submission Box */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="var(--primary)" /> Submit Lab Report
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Describe the steps you took to configure the registers, write down key values, and document validation wave analysis.
                </p>
                <textarea
                  placeholder="Type register dump analysis, logic analyzer observations, or proof of functionality here..."
                  value={report}
                  onChange={e => setReport(e.target.value)}
                  className="form-input"
                  style={{ minHeight: '120px', resize: 'vertical' }}
                  disabled={!!currentSubmission}
                />
                
                {currentSubmission ? (
                  <div style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid var(--success)',
                    padding: '16px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '14px' }}>
                        SUBMISSION REGISTERED ({currentSubmission.status.toUpperCase()})
                      </span>
                      <span className="badge badge-success">Score: {currentSubmission.score}/100</span>
                    </div>
                    {currentSubmission.feedback && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        <strong>Instructor Feedback:</strong> {currentSubmission.feedback}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    disabled={testStatus !== 'passed'}
                    onClick={handleReportSubmit}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    Submit Lab Report
                  </button>
                )}
                {testStatus !== 'passed' && !currentSubmission && (
                  <span style={{ fontSize: '11px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                    <AlertTriangle size={12} /> Run compilation tests successfully before submitting report.
                  </span>
                )}
              </div>
            </div>

            {/* Right Column: Code Editor & Compiler Output Console */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="code-editor" style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
                <div className="code-editor-header">
                  <div className="code-editor-dots">
                    <span className="code-editor-dot"></span>
                    <span className="code-editor-dot"></span>
                    <span className="code-editor-dot"></span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>main.c</span>
                </div>
                <div style={{ flexGrow: 1, display: 'flex', padding: '12px', overflow: 'hidden' }}>
                  <textarea
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="code-editor-textarea"
                    style={{
                      width: '100%',
                      height: '100%',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      backgroundColor: 'transparent',
                      color: '#67e8f9',
                      border: 'none',
                      outline: 'none',
                      resize: 'none'
                    }}
                    disabled={!!currentSubmission}
                  />
                </div>
                <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(30, 41, 59, 0.2)' }}>
                  <button
                    onClick={runCodeValidation}
                    disabled={isCompiling || !!currentSubmission}
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: '12px' }}
                  >
                    <Play size={12} fill="#000" /> Run Compilation
                  </button>
                </div>
              </div>

              {/* Green Terminal Console */}
              <div style={{
                backgroundColor: '#05070c',
                border: '1px solid #1e293b',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: '#34d399', // retro green
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                overflowY: 'auto'
              }}>
                <div style={{ borderBottom: '1px solid rgba(52, 211, 153, 0.2)', paddingBottom: '6px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TermIcon size={14} /> compiler_output_console
                </div>
                {terminalLogs.length === 0 ? (
                  <span style={{ color: 'var(--text-muted)' }}>Console idle. Click "Run Compilation" above to execute tests.</span>
                ) : (
                  terminalLogs.map((log, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--text-muted)' }}><ChevronRight size={12} style={{ marginTop: '2px' }} /></span>
                      <span style={{ whiteSpace: 'pre-line' }}>{log}</span>
                    </div>
                  ))
                )}
                {isCompiling && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--primary)' }}>
                    <span>Linking libraries... [████████████░░░] 80%</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '100px' }}>Select a laboratory assignment to start compile sweeps.</div>
        )}
      </div>

    </div>
  );
};
