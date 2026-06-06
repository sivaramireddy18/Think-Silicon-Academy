import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { MessageSquare, Sparkles, Send, Play, CheckCircle2, AlertTriangle, ShieldCheck, ChevronRight, User, RefreshCw } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  code?: string;
}

export const AIView: React.FC = () => {
  const { addMockInterviewResult, currentUser } = useAppData();

  // --- AI MENTOR STATE ---
  const [mentorChat, setMentorChat] = useState<ChatMessage[]>([
    { sender: 'ai', text: 'Hello! I am your AI Embedded Mentor. Ask me any register-level questions about ARM Cortex peripherals, DMA configurations, Linux device drivers, or PCIe validations.' }
  ]);
  const [mentorInput, setMentorInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // --- AI INTERVIEWER STATE ---
  const [interviewTopic, setInterviewTopic] = useState<'C' | 'Embedded C' | 'Linux Drivers' | 'ASIC Validation' | null>(null);
  const [interviewStep, setInterviewStep] = useState(0); // 0 = start, 1 = Q1 active, 2 = Q2 active, 3 = summary
  const [userAnswer, setUserAnswer] = useState('');
  const [interviewLogs, setInterviewLogs] = useState<{ question: string; answer: string; score: number; feedback: string }[]>([]);
  const [interviewGrading, setInterviewGrading] = useState(false);

  // Mock Mentor Responses Database
  const MOCK_ANSWERS: Record<string, { text: string; code?: string }> = {
    dma: {
      text: 'A Direct Memory Access (DMA) controller allows peripherals to transfer data directly to/from SRAM without CPU intervention. This frees up core processing bandwidth. Key register steps for ARM Cortex include enabling DMA clocks (RCC), configuring source/destination address registers (DMA_CPAR/DMA_CMAR), specifying buffer sizes (DMA_CNDTR), and assigning bus priority settings (DMA_CCR).',
      code: `// DMA1 Channel 5 configuration for UART Rx
void init_dma_uart() {
    DMA1_Channel5->CPAR = (uint32_t)&(USART1->DR); // Src address
    DMA1_Channel5->CMAR = (uint32_t)rx_buffer;      // Dest address
    DMA1_Channel5->CNDTR = 64;                      // Buffer length
    DMA1_Channel5->CCR |= DMA_CCR_MINC | DMA_CCR_CIRC; // Increment mem
    DMA1_Channel5->CCR |= DMA_CCR_EN;               // Enable DMA
}`
    },
    i2c: {
      text: 'I2C is a synchronous, multi-master, open-drain bus using two lines: Serial Clock (SCL) and Serial Data (SDA). Pull-up resistors keep the lines high. Communication starts when a Master asserts SDA low while SCL is high. Standard frames send a 7-bit target address shifted left by 1 bit, where the LSB indicates Write (0) or Read (1). An ACK bit must be returned by the target slave for transmission to continue.',
      code: `// Simulating I2C Master address write phase
#define I2C_CR1_START  (1 << 8)
#define I2C_DR_REG     (*((volatile uint32_t*)0x40005410))

void transmit_address(uint8_t slave_addr) {
    I2C1->CR1 |= I2C_CR1_START; // Generate START signal
    while (!(I2C1->SR1 & I2C_SR1_SB)); // Wait for Start bit flag
    I2C_DR_REG = (slave_addr << 1) | 0; // Transmit address + Write
}`
    },
    pcie: {
      text: 'PCI Express (PCIe) is a high-speed serial computer expansion bus standard. In Post-Silicon validation, verifying Link Training (LTSSM - Link Training and Status State Machine) is critical. LTSSM coordinates interface width, lane polarity, speed upgrades (Gen1 to Gen5), and equalizations. Common validation checks inspect the LTSSM state registers for DETECT -> POLLING -> CONFIG -> L0 (active transmission state).',
      code: `// Mock checking PCIe link state register 
#define PCIE_LTSSM_REG  (*((volatile uint32_t*)0x50004080))
#define PCIE_L0_STATE   0x11

uint8_t verify_pcie_link_active() {
    uint32_t state = PCIE_LTSSM_REG & 0x7F;
    if (state == PCIE_L0_STATE) {
        return 1; // Link trained to Gen5 L0 success
    }
    return 0; // Link in recovery/config loop
}`
    }
  };

  const handleMentorSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorInput.trim()) return;

    const userText = mentorInput;
    setMentorChat(prev => [...prev, { sender: 'user', text: userText }]);
    setMentorInput('');
    setIsThinking(true);

    setTimeout(() => {
      // Simple lookup key matches
      const query = userText.toLowerCase();
      let response: { text: string; code?: string } = {
        text: 'I parsed your query but did not locate a direct register-level match. Try asking about "DMA", "I2C", or "PCIe" registers to see code configurations.',
        code: undefined
      };

      if (query.includes('dma')) response = MOCK_ANSWERS.dma;
      else if (query.includes('i2c')) response = MOCK_ANSWERS.i2c;
      else if (query.includes('pcie') || query.includes('express')) response = MOCK_ANSWERS.pcie;

      setMentorChat(prev => [...prev, { sender: 'ai', text: response.text, code: response.code }]);
      setIsThinking(false);
    }, 1200);
  };

  // --- AI INTERVIEW QUESTIONS ---
  const INTERVIEW_QUESTIONS = {
    'C': [
      'Explain how declaring a pointer volatile affects register read loops in GCC compilers.',
      'Detail the stack/frame layout changes when a function is called, and how variables are allocated.'
    ],
    'Embedded C': [
      'How does the Nested Vector Interrupt Controller (NVIC) resolve preemption when two interrupts fire simultaneously?',
      'Explain RCC register configurations and how APB/AHB bus prescalers partition MCU clock cycles.'
    ],
    'Linux Drivers': [
      'Explain the difference between platform drivers and character device drivers in the Linux kernel.',
      'How does a Linux kernel driver interface with hardware interrupts using tasklets or threaded ISRs?'
    ],
    'ASIC Validation': [
      'Explain what Clock Domain Crossing (CDC) metastability is, and how multi-stage synchronizers mitigate it.',
      'Detail the steps to perform post-silicon board bring-up validation on a newly fabricated chip.'
    ]
  };

  const handleStartInterview = (topic: typeof interviewTopic) => {
    setInterviewTopic(topic);
    setInterviewStep(1);
    setUserAnswer('');
    setInterviewLogs([]);
  };

  const handleAnswerSubmit = () => {
    if (!interviewTopic) return;
    setInterviewGrading(true);

    setTimeout(() => {
      const qText = INTERVIEW_QUESTIONS[interviewTopic][interviewStep - 1];
      const ansLength = userAnswer.trim().length;
      
      // Heuristic grading score based on length and core technical keyword matching
      let score = 30 + Math.min(ansLength / 6, 45); // length contribution
      const lowerAns = userAnswer.toLowerCase();
      
      // Keywords checks
      if (lowerAns.includes('volatile') || lowerAns.includes('pointer') || lowerAns.includes('register') || lowerAns.includes('preempt') || lowerAns.includes('interrupt') || lowerAns.includes('sync') || lowerAns.includes('dma') || lowerAns.includes('clock') || lowerAns.includes('probe')) {
        score += 20;
      }
      
      const finalScore = Math.min(Math.round(score), 100);
      
      let feedback = 'Good effort. Your answer outlines some correct constructs, but lacks specific register names, flag checks, or hardware mechanics details. Consider adding more context regarding bitmasks or compiler optimization details.';
      if (finalScore >= 80) {
        feedback = 'Excellent response! You demonstrated a clear register-level understanding of hardware mechanics, volatile behavior, or vector priorities. Appropriate terminology was utilized successfully.';
      } else if (finalScore >= 60) {
        feedback = 'Decent understanding. You captured the overall protocol concept. Try to detail the exact control register registers or setup timings next time.';
      }

      setInterviewLogs(prev => [...prev, {
        question: qText,
        answer: userAnswer,
        score: finalScore,
        feedback
      }]);

      setInterviewGrading(false);
      setUserAnswer('');

      if (interviewStep < 2) {
        setInterviewStep(2);
      } else {
        // Compute final score average
        const avg = Math.round(
          (interviewLogs.reduce((sum, item) => sum + item.score, 0) + finalScore) / 2
        );
        addMockInterviewResult(interviewTopic, avg, 'AI assessment completed for ' + interviewTopic);
        setInterviewStep(3);
      }
    }, 1800);
  };

  return (
    <div className="dashboard-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '30px' }}>
      
      {/* LEFT MODULE: AI EMBEDDED MENTOR CHAT */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)', minHeight: '500px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
          <div style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', padding: '8px', borderRadius: '8px', color: 'var(--primary)' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px' }}>AI Embedded Mentor</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Online • Register-level support</span>
          </div>
        </div>

        {/* Message Feed */}
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '6px', marginBottom: '16px' }}>
          {mentorChat.map((msg, idx) => (
            <div key={idx} style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              display: 'flex',
              gap: '10px',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{
                backgroundColor: msg.sender === 'user' ? 'rgba(6, 182, 212, 0.1)' : 'var(--bg-input)',
                border: '1px solid ' + (msg.sender === 'user' ? 'var(--primary)' : 'var(--border-color)'),
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                color: 'var(--text-primary)',
                lineHeight: 1.5
              }}>
                <div>{msg.text}</div>
                {msg.code && (
                  <pre style={{
                    marginTop: '10px',
                    backgroundColor: '#05070c',
                    padding: '10px',
                    borderRadius: '6px',
                    color: '#a5f3fc',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    overflowX: 'auto'
                  }}>
                    {msg.code}
                  </pre>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={12} className="pulse-glow" style={{ animation: 'spin 2s linear infinite' }} />
              AI Mentor is loading register data sheets...
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {['Explain DMA', 'Explain I2C bus', 'Explain PCIe registers'].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setMentorInput(chip);
              }}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '9999px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input area */}
        <form onSubmit={handleMentorSend} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={mentorInput}
            onChange={e => setMentorInput(e.target.value)}
            placeholder="Ask AI Mentor (e.g. explain DMA clocks)..."
            className="form-input"
            style={{ flexGrow: 1, borderRadius: '24px' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '10px', borderRadius: '50%' }}>
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* RIGHT MODULE: AI INTERVIEWER SIMULATOR */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)', minHeight: '500px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
          <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: '8px', borderRadius: '8px', color: 'var(--accent-purple)' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px' }}>AI Technical Interview Trainer</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Diagnostic Mock Assessments</span>
          </div>
        </div>

        {/* Step 0: Topic Selector */}
        {interviewStep === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <MessageSquare size={40} color="var(--text-muted)" />
            <div>
              <h4 style={{ fontSize: '18px', marginBottom: '6px' }}>Start Graded Assessment Run</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '300px' }}>
                Select a topic to answer two critical technical questions. Your grade will be logged to your placement portal.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
              {(['C', 'Embedded C', 'Linux Drivers', 'ASIC Validation'] as const).map(topic => (
                <button
                  key={topic}
                  onClick={() => handleStartInterview(topic)}
                  className="btn btn-secondary"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  {topic} <ChevronRight size={14} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 & 2: Active Questions */}
        {(interviewStep === 1 || interviewStep === 2) && interviewTopic && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-info">{interviewTopic} Track</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Question {interviewStep} of 2</span>
            </div>

            <div className="card" style={{ padding: '20px', backgroundColor: 'var(--bg-accent)' }}>
              <h4 style={{ fontSize: '15px', lineHeight: 1.5 }}>
                {INTERVIEW_QUESTIONS[interviewTopic][interviewStep - 1]}
              </h4>
            </div>

            <div className="form-group" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="form-label">Type your response below (C code, registers, or text):</label>
              <textarea
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                placeholder="Include registers, compiler commands, or logic diagnostics to score higher..."
                className="form-input"
                style={{ flexGrow: 1, minHeight: '140px', resize: 'none' }}
                disabled={interviewGrading}
              />
            </div>

            {interviewGrading ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--primary)', fontSize: '13px' }}>
                <RefreshCw size={14} className="pulse-glow" style={{ animation: 'spin 2s linear infinite' }} />
                AI Interviewer is grading response constructs...
              </div>
            ) : (
              <button
                onClick={handleAnswerSubmit}
                disabled={userAnswer.trim().length < 10}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                Submit Response
              </button>
            )}
          </div>
        )}

        {/* Step 3: Interview Summary Scorecard */}
        {interviewStep === 3 && interviewTopic && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1, overflowY: 'auto' }}>
            <div style={{ textAlign: 'center' }}>
              <CheckCircle2 size={44} color="var(--success)" style={{ marginBottom: '10px' }} />
              <h4 style={{ fontSize: '20px' }}>Interview Completed!</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Your results have been sync'd to your Placement Profile.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {interviewLogs.map((log, idx) => (
                <div key={idx} className="card" style={{ padding: '14px', backgroundColor: 'var(--bg-input)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '13px' }}>Question {idx + 1} Score</strong>
                    <span className={`badge ${log.score >= 80 ? 'badge-success' : 'badge-warning'}`}>{log.score}%</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Q: {log.question}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}><strong>AI Feedback:</strong> {log.feedback}</div>
                </div>
              ))}
            </div>

            <button onClick={() => setInterviewStep(0)} className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              Done / Start Another Track
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
