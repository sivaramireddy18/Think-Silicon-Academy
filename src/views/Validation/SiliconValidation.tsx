import React, { useState } from 'react';
import { ShieldCheck, Cpu, AlertTriangle, CheckCircle, RefreshCw, BarChart2, Eye } from 'lucide-react';

interface CaseStudy {
  id: string;
  title: string;
  difficulty: 'Medium' | 'Critical';
  summary: string;
  dump: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'case-cdc',
    title: 'Clock Domain Crossing Metastability',
    difficulty: 'Critical',
    summary: 'A custom ASIC utilizes an asynchronous FIFO to transmit telemetry data from a 100MHz clock domain to a 24MHz clock domain. During high-temperature validation runs, data packets occasionally suffer single-bit errors or FIFO write pointer corruptions. The board remains functional at room temperatures.',
    dump: `[CLOCK REGISTER VALUES]
CLK_A_FREQ = 100.000 MHz (PLL_A locked)
CLK_B_FREQ =  24.000 MHz (PLL_B locked)
TEMP_DIAGNOSTIC = +85 C (Ambient +65 C)

[FIFO REGISTER DUMP]
FIFO_CTRL_REG  = 0x00000101 (FIFO enable, Sync mode = NONE)
FIFO_WPTR_REG  = 0x0000004F (Write Pointer)
FIFO_RPTR_REG  = 0x0000004C (Read Pointer)
FIFO_STATUS    = 0x00000004 (OVERRUN_ERROR flag is HIGH)`,
    options: [
      'PLL A clock drift exceeding specs due to temperature expansion.',
      'Missing multi-stage synchronization flip-flops in the clock boundary crossing (FIFO_CTRL_REG Sync mode = NONE), causing pointer metastability.',
      'Power delivery network voltage droop on the Core VDD rails.',
      'SRAM byte write alignment failure in the FIFO buffer register.'
    ],
    correctAnswer: 1,
    explanation: 'Asynchronous boundaries must utilize multi-stage synchronizers (2-stage or 3-stage flip-flops) to resolve pointer value metastability. Selecting Sync mode = NONE causes direct setup/hold time violations at 85°C.'
  },
  {
    id: 'case-dma',
    title: 'DMA Bus Priority Lockup',
    difficulty: 'Critical',
    summary: 'A validation board containing an ARM Cortex-M4 microcontroller hangs completely when running high-speed SPI transactions. Analysis with a logic analyzer shows the SPI lines stop pulsing, and the MCU ceases execution of all background tasks. Only a physical hardware reset restores board function.',
    dump: `[DMA CONTROL BLOCK MAP]
DMA_CR_CH1     = 0x0012C0B1 (CH1 enabled, Priority = VERY HIGH, Burst = SINGLE)
DMA_CR_CH2     = 0x00020081 (CH2 enabled, Priority = LOW, Burst = SINGLE)
SPI1_CR1       = 0x00000344 (DMA Tx enabled, Baud = DIV4)

[NVIC INTERRUPT CORE STATUS]
NVIC_ISER      = 0x00000002 (SPI1 Interrupt vector pending flag HIGH)
CPU_CORE_STATE = LOCKUP (DMA controller holds bus master lock indefinitely)`,
    options: [
      'SPI1 baud rate too high for standard GPIO lines.',
      'High-priority DMA transaction locks out low-priority CPU interrupts from finishing the SPI packet transmission sequence, resulting in a bus master lockup.',
      'Electromagnetic noise on the SPI clock lines causing line termination lock.',
      'NVIC registers suffer parity memory corruption during DMA burst operations.'
    ],
    correctAnswer: 1,
    explanation: 'The DMA Controller was configured with VERY HIGH bus priority, holding the bus matrix while waiting for SPI status updates that are processed by lower-priority CPU interrupts. This results in a priority inversion lockup.'
  },
  {
    id: 'case-mem',
    title: 'GPIO Interrupt Stack Corruption',
    difficulty: 'Medium',
    summary: 'When compiling a sensor controller, triggering a button interrupt (connected to GPIO PA0) causes the system to sporadically branch to random memory addresses, leading to HardFault exceptions. Debug registers indicate stack pointer overflow.',
    dump: `[HARDFAULT REGISTERS]
NVIC_HFSR = 0x40000000 (FORCED HardFault)
NVIC_CFSR = 0x00000400 (STKERR Stack pointer entry violation)

[ISR SOURCE snippet]
void EXTI0_IRQHandler() {
    int buffer[512]; // Local buffer defined on stack!
    read_sensor_registers(buffer);
    EXTI_ClearFlag(0);
}`,
    options: [
      'The button suffers physical switch bounce, triggering the EXTI handler too fast.',
      'Declaring a large array (buffer[512] = 2048 bytes) locally inside an Interrupt Service Routine (ISR) overflows the limited MCU interrupt stack size.',
      'The volatile keyword was missing on the sensor register read array pointer.',
      'The NVIC external button interrupt vector was incorrectly assigned to Channel 0.'
    ],
    correctAnswer: 1,
    explanation: 'Interrupt service handlers execute within a very small stack size (often less than 1KB on Cortex-M targets). Declaring 2KB arrays locally inside the EXTI handler crashes the stack frame, corrupting the return address.'
  }
];

export const SiliconValidation: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submittedCases, setSubmittedCases] = useState<Record<string, boolean>>({});

  const handleSelectCase = (cs: CaseStudy) => {
    setSelectedCase(cs);
  };

  const handleAnswerSubmit = (caseId: string) => {
    if (userAnswers[caseId] === undefined) return;
    setSubmittedCases(prev => ({ ...prev, [caseId]: true }));
  };

  return (
    <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck color="var(--primary)" /> Silicon Validation Academy
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Audit debug case studies from actual silicon bring-ups, verify register dumps, and identify logic failures.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        
        {/* Learning Tracks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05), transparent)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={20} color="var(--primary)" /> 1. Bring-up Track
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
              Master early-stage silicon power rails initialization, boot sequence diagnostics, PLL clock multipliers stabilization, and basic GPIO debug toggling.
            </p>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), transparent)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={20} color="var(--secondary)" /> 2. IP Protocol Track
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
              Validate serial logic gates (I2C address acknowledgment sweeps, SPI clock phase shifts, CAN timing syncs, and PCIe lane link training status).
            </p>
          </div>
        </div>

        {/* Debug Case Studies */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color="var(--warning)" /> Bring-up Debug Challenges
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Select a post-silicon case study to inspect physical registers and choose the correct root-cause debugging recommendation.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {CASE_STUDIES.map(cs => {
              const isSelected = selectedCase?.id === cs.id;
              const isSubmitted = submittedCases[cs.id];
              const isCorrect = userAnswers[cs.id] === cs.correctAnswer;
              
              return (
                <button
                  key={cs.id}
                  onClick={() => handleSelectCase(cs)}
                  style={{
                    background: isSelected ? 'rgba(6, 182, 212, 0.1)' : 'var(--bg-input)',
                    border: '1px solid ' + (
                      isSelected 
                        ? 'var(--primary)' 
                        : (isSubmitted ? (isCorrect ? 'var(--success)' : 'var(--error)') : 'var(--border-color)')
                    ),
                    color: 'var(--text-primary)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Eye size={14} color="var(--text-muted)" />
                    {cs.title}
                  </span>
                  <span className={`badge ${cs.difficulty === 'Critical' ? 'badge-error' : 'badge-warning'}`} style={{ fontSize: '9px' }}>
                    {cs.difficulty}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Case Study Details Drawer / Pane */}
      {selectedCase && (
        <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginTop: '20px' }}>
          
          {/* Debug Scenario & Registers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '20px', color: 'var(--primary)' }}>{selectedCase.title} Scenario</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
              {selectedCase.summary}
            </p>
            
            <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Logic Analyzer Register Dump
            </h4>
            <pre style={{
              backgroundColor: '#05070c',
              border: '1px solid var(--border-color)',
              padding: '14px',
              borderRadius: '8px',
              color: '#a5f3fc',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.5,
              overflowX: 'auto'
            }}>
              {selectedCase.dump}
            </pre>
          </div>

          {/* Diagnostic Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '18px' }}>Root Cause Diagnosis</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedCase.options.map((opt, idx) => {
                const isSelected = userAnswers[selectedCase.id] === idx;
                const isSubmitted = submittedCases[selectedCase.id];
                const isCorrect = selectedCase.correctAnswer === idx;
                return (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => setUserAnswers(prev => ({ ...prev, [selectedCase.id]: idx }))}
                    style={{
                      background: isSelected 
                        ? (isSubmitted 
                            ? (isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)')
                            : 'rgba(6, 182, 212, 0.1)')
                        : (isSubmitted && isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'transparent'),
                      border: '1px solid ' + (
                        isSelected 
                          ? (isSubmitted 
                              ? (isCorrect ? 'var(--success)' : 'var(--error)')
                              : 'var(--primary)')
                          : (isSubmitted && isCorrect ? 'var(--success)' : 'var(--border-color)')
                      ),
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      padding: '12px',
                      borderRadius: '8px',
                      cursor: isSubmitted ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      fontSize: '13px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {!submittedCases[selectedCase.id] ? (
                <button
                  onClick={() => handleAnswerSubmit(selectedCase.id)}
                  disabled={userAnswers[selectedCase.id] === undefined}
                  className="btn btn-primary"
                >
                  Submit Diagnostic Analysis
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: userAnswers[selectedCase.id] === selectedCase.correctAnswer ? 'var(--success)' : 'var(--error)' }}>
                    {userAnswers[selectedCase.id] === selectedCase.correctAnswer ? (
                      <><CheckCircle size={18} /> DIAGNOSIS CORRECT</>
                    ) : (
                      <><AlertTriangle size={18} /> DIAGNOSIS INCORRECT</>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                    <strong>Root Cause Analysis:</strong> {selectedCase.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
