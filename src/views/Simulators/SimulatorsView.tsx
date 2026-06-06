import React, { useState, useEffect } from 'react';
import { Cpu, Terminal, Zap, Award, HelpCircle, Activity, Settings, RefreshCw, Layers } from 'lucide-react';

export const SimulatorsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'i2c' | 'spi' | 'uart' | 'can' | 'mcu'>('i2c');

  // --- I2C SIMULATOR STATE ---
  const [i2cAddr, setI2cAddr] = useState('0x50');
  const [i2cData, setI2cData] = useState('0xAA');
  const [i2cRW, setI2cRW] = useState<'write' | 'read'>('write');
  const [i2cBusState, setI2cBusState] = useState<'Idle' | 'Start' | 'Address' | 'RW' | 'Ack1' | 'Data' | 'Ack2' | 'Stop'>('Idle');
  const [i2cLogs, setI2cLogs] = useState<string[]>([]);
  const [i2cAnimationStep, setI2cAnimationStep] = useState(-1);

  // --- SPI SIMULATOR STATE ---
  const [spiCPOL, setSpiCPOL] = useState<0 | 1>(0);
  const [spiCPHA, setSpiCPHA] = useState<0 | 1>(0);
  const [spiMasterByte, setSpiMasterByte] = useState('A');
  const [spiSlaveByte, setSpiSlaveByte] = useState('5');
  const [spiMasterReg, setSpiMasterReg] = useState<string>('01000001'); // ASCII 'A'
  const [spiSlaveReg, setSpiSlaveReg] = useState<string>('00110101');  // ASCII '5'
  const [spiShiftStep, setSpiShiftStep] = useState(0);
  const [spiLogs, setSpiLogs] = useState<string[]>([]);

  // --- UART SIMULATOR STATE ---
  const [uartChar, setUartChar] = useState('S');
  const [uartBaud, setUartBaud] = useState('9600');
  const [uartParity, setUartParity] = useState<'none' | 'even' | 'odd'>('none');
  const [uartNoise, setUartNoise] = useState(false);
  const [uartFrame, setUartFrame] = useState<{ label: string; val: number }[]>([]);
  const [uartTransmissionLog, setUartTransmissionLog] = useState<string[]>([]);
  const [uartTransmitting, setUartTransmitting] = useState(false);

  // --- CAN SIMULATOR STATE ---
  const [canIdA, setCanIdA] = useState('0x1A4'); // 00110100100 (dominant 0s win)
  const [canIdB, setCanIdB] = useState('0x1AB'); // 00110101011
  const [canArbitrationStep, setCanArbitrationStep] = useState(-1);
  const [canWinner, setCanWinner] = useState<string | null>(null);
  const [canLogs, setCanLogs] = useState<string[]>([]);

  // --- MCU REGISTER SIMULATOR STATE ---
  const [mcuModer, setMcuModer] = useState<number>(0x00000000); // 16 GPIO ports, 2 bits each
  const [mcuOdr, setMcuOdr] = useState<number>(0x00000000);   // Pin output states
  const [mcuIdr, setMcuIdr] = useState<number>(0x00000020);   // Input state (pin 5 mock switch)
  const [timerCR1, setTimerCR1] = useState(false); // Timer status (on/off)
  const [timerCNT, setTimerCNT] = useState(0);
  const [nvicISPR, setNvicISPR] = useState(false); // Interrupt pending register status

  // --- I2C SIMULATION TRIGGER ---
  const runI2cSimulation = () => {
    setI2cLogs(['[Bus Request] Master asserts SDA LOW while SCL is HIGH (START Condition)']);
    setI2cBusState('Start');
    setI2cAnimationStep(0);
  };

  useEffect(() => {
    if (i2cAnimationStep < 0) return;
    const timer = setTimeout(() => {
      const step = i2cAnimationStep;
      if (step === 0) {
        setI2cBusState('Address');
        setI2cLogs(prev => [...prev, `[Address Sweep] Broadcasting Slave address ${i2cAddr}`]);
        setI2cAnimationStep(1);
      } else if (step === 1) {
        setI2cBusState('RW');
        setI2cLogs(prev => [...prev, `[R/W State] Transmitting Direction bit: ${i2cRW === 'write' ? '0 (WRITE)' : '1 (READ)'}`]);
        setI2cAnimationStep(2);
      } else if (step === 2) {
        setI2cBusState('Ack1');
        setI2cLogs(prev => [...prev, '[ACK Response] Target Slave pulls SDA line LOW to acknowledge address receipt']);
        setI2cAnimationStep(3);
      } else if (step === 3) {
        setI2cBusState('Data');
        setI2cLogs(prev => [...prev, `[Data Payload] Sending Byte data ${i2cData}`]);
        setI2cAnimationStep(4);
      } else if (step === 4) {
        setI2cBusState('Ack2');
        setI2cLogs(prev => [...prev, '[ACK Response] Slave acknowledges data byte completion']);
        setI2cAnimationStep(5);
      } else if (step === 5) {
        setI2cBusState('Stop');
        setI2cLogs(prev => [...prev, '[Bus Release] Master releases SDA HIGH while SCL is HIGH (STOP Condition)']);
        setI2cAnimationStep(6);
      } else {
        setI2cBusState('Idle');
        setI2cLogs(prev => [...prev, 'Bus returned to IDLE state.']);
        setI2cAnimationStep(-1);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [i2cAnimationStep]);

  // --- SPI SIMULATION TRIGGER ---
  const resetSpi = () => {
    // Re-initialize registers based on character bytes
    const mByte = spiMasterByte.charCodeAt(0) || 0;
    const sByte = spiSlaveByte.charCodeAt(0) || 0;
    setSpiMasterReg(mByte.toString(2).padStart(8, '0'));
    setSpiSlaveReg(sByte.toString(2).padStart(8, '0'));
    setSpiShiftStep(0);
    setSpiLogs(['SPI Bus Reset. Ready for full-duplex synchronous transmission.']);
  };

  const stepSpiShift = () => {
    if (spiShiftStep >= 8) {
      setSpiLogs(prev => [...prev, 'SPI Transfer Complete! Registers fully exchanged.']);
      return;
    }
    const masterBit = spiMasterReg[0];
    const slaveBit = spiSlaveReg[0];

    const newMaster = spiMasterReg.substring(1) + slaveBit;
    const newSlave = spiSlaveReg.substring(1) + masterBit;

    setSpiMasterReg(newMaster);
    setSpiSlaveReg(newSlave);
    setSpiShiftStep(prev => prev + 1);

    setSpiLogs(prev => [
      ...prev,
      `Step ${spiShiftStep + 1}: Shifted Master Out MOSI: ${masterBit} | Shifted Slave Out MISO: ${slaveBit}`
    ]);
  };

  // --- UART SIMULATION TRIGGER ---
  const triggerUartTx = () => {
    setUartTransmitting(true);
    setUartTransmissionLog(['Setting line TX state active...']);
    const ascii = (uartChar.charCodeAt(0) || 0) & 0xFF;
    const bits: number[] = [];
    
    // LSB first
    for (let i = 0; i < 8; i++) {
      bits.push((ascii >> i) & 1);
    }
    
    // Calculate Parity
    let parityBit = 0;
    const bitCount = bits.filter(b => b === 1).length;
    if (uartParity === 'even') {
      parityBit = bitCount % 2 !== 0 ? 1 : 0;
    } else if (uartParity === 'odd') {
      parityBit = bitCount % 2 === 0 ? 1 : 0;
    }

    // Construct Frame
    const finalFrame = [
      { label: 'Idle', val: 1 },
      { label: 'Start', val: 0 },
      ...bits.map((b, i) => ({ label: `Bit ${i}`, val: b })),
    ];
    if (uartParity !== 'none') {
      finalFrame.push({ label: 'Parity', val: parityBit });
    }
    if (uartNoise) {
      // Inject noise at Bit 4
      finalFrame[6].val = finalFrame[6].val === 1 ? 0 : 1;
    }
    finalFrame.push({ label: 'Stop', val: 1 });
    setUartFrame(finalFrame);

    setTimeout(() => {
      let logs = [
        `UART Tx Init: Char '${uartChar}' -> Binary (LSB first) ${bits.join('')}`,
        'Line pulled LOW for 1 baud period (Start Bit)',
        ...bits.map((b, i) => `Sending Data Bit ${i}: ${b}`),
      ];
      if (uartParity !== 'none') {
        logs.push(`Sending ${uartParity} parity bit: ${parityBit}`);
      }
      if (uartNoise) {
        logs.push('WARNING: Frame corruption detected! Line noise toggled bit 4.');
      }
      logs.push('Line pulled HIGH for 1 baud period (Stop Bit)');
      if (uartNoise && uartParity !== 'none') {
        logs.push('DECODER ERROR: Parity checksum mismatch! Frame dropped.');
      } else {
        logs.push('SUCCESS: Frame received and verified by receiver UART core.');
      }
      setUartTransmissionLog(logs);
      setUartTransmitting(false);
    }, 1000);
  };

  // --- CAN SIMULATION TRIGGER ---
  const runCanArbitration = () => {
    setCanLogs(['CAN Bus Arbitration: Node A and Node B transmit concurrently...']);
    setCanArbitrationStep(0);
    setCanWinner(null);
  };

  useEffect(() => {
    if (canArbitrationStep < 0) return;
    const timer = setTimeout(() => {
      const step = canArbitrationStep;
      if (step >= 11) {
        setCanArbitrationStep(-1);
        return;
      }
      
      const idABin = (parseInt(canIdA, 16) || 0).toString(2).padStart(11, '0');
      const idBBin = (parseInt(canIdB, 16) || 0).toString(2).padStart(11, '0');
      const bitA = idABin[step];
      const bitB = idBBin[step];

      if (bitA === '0' && bitB === '1') {
        setCanWinner('Node A');
        setCanLogs(prev => [
          ...prev,
          `Bit ${step}: Node A sends 0 (DOMINANT) | Node B sends 1 (RECESSIVE). Node B loses arbitration and shifts to RECEIVE mode.`,
          'WINNER: Node A controls the bus lines.'
        ]);
        setCanArbitrationStep(-1);
      } else if (bitB === '0' && bitA === '1') {
        setCanWinner('Node B');
        setCanLogs(prev => [
          ...prev,
          `Bit ${step}: Node B sends 0 (DOMINANT) | Node A sends 1 (RECESSIVE). Node A loses arbitration and shifts to RECEIVE mode.`,
          'WINNER: Node B controls the bus lines.'
        ]);
        setCanArbitrationStep(-1);
      } else {
        setCanLogs(prev => [
          ...prev,
          `Bit ${step}: Node A sends ${bitA} | Node B sends ${bitB} -> Tied. Continuing arbitration...`
        ]);
        setCanArbitrationStep(prev => prev + 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [canArbitrationStep]);

  // --- MCU TIMER SIMULATOR LOOP ---
  useEffect(() => {
    let interval: any;
    if (timerCR1) {
      interval = setInterval(() => {
        setTimerCNT(prev => {
          if (prev >= 15) {
            setNvicISPR(true); // overflow triggers interrupt flag
            return 0;
          }
          return prev + 1;
        });
      }, 500);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerCR1]);

  const toggleModerBit = (portIdx: number, bitOffset: number) => {
    // Mode has 2 bits per port pin
    const shift = portIdx * 2 + bitOffset;
    setMcuModer(prev => prev ^ (1 << shift));
  };

  const toggleOdrBit = (pinIdx: number) => {
    setMcuOdr(prev => prev ^ (1 << pinIdx));
  };

  const toggleIdrBit = (pinIdx: number) => {
    setMcuIdr(prev => prev ^ (1 << pinIdx));
  };

  return (
    <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Terminal color="var(--primary)" /> Embedded Protocol Simulator Suite
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Visualize physical waveforms, address arbitration sweeps, CPOL timing alignments, and register map logic.
        </p>
      </div>

      {/* Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '1px', flexWrap: 'wrap' }}>
        {[
          { id: 'i2c', label: 'I2C Wave Bus' },
          { id: 'spi', label: 'SPI Full-Duplex' },
          { id: 'uart', label: 'UART Frame Tx' },
          { id: 'can', label: 'CAN Arbitration' },
          { id: 'mcu', label: 'MCU Core Registers' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              background: activeTab === tab.id ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
              border: '1px solid transparent',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '6px 6px 0 0'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="grid-layout">
        
        {/* --- I2C SIMULATOR --- */}
        {activeTab === 'i2c' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
            {/* Controls */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '18px' }}>I2C Bus Configuration</h3>
              
              <div className="form-group">
                <label className="form-label">Slave Address (7-bit Hex)</label>
                <input type="text" value={i2cAddr} onChange={e => setI2cAddr(e.target.value)} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Data Byte (Hex)</label>
                <input type="text" value={i2cData} onChange={e => setI2cData(e.target.value)} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Direction</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setI2cRW('write')} className={`btn ${i2cRW === 'write' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>WRITE</button>
                  <button onClick={() => setI2cRW('read')} className={`btn ${i2cRW === 'read' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>READ</button>
                </div>
              </div>

              <button onClick={runI2cSimulation} disabled={i2cAnimationStep >= 0} className="btn btn-outline" style={{ marginTop: '10px' }}>
                <RefreshCw size={14} /> Transmit I2C Packet
              </button>
              
              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                <strong>State Decoder:</strong> <span className="badge badge-success">{i2cBusState}</span>
              </div>
            </div>

            {/* Visual Screen & Waves */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '14px' }}>Oscilloscope Real-Time Bus Decode</h3>
                
                {/* SVG wave drawing */}
                <svg viewBox="0 0 400 120" className="waveform-svg" style={{ height: '140px' }}>
                  <line x1="10" y1="30" x2="390" y2="30" className="waveform-grid" />
                  <line x1="10" y1="80" x2="390" y2="80" className="waveform-grid" />
                  
                  {/* SCL Wave */}
                  <path 
                    d="M 10 30 L 40 30 L 50 80 L 70 80 L 80 30 L 110 30 L 120 80 L 140 80 L 150 30 L 180 30 L 190 80 L 210 80 L 220 30 L 250 30 L 260 80 L 280 80 L 290 30 L 320 30 L 330 80 L 350 80 L 360 30 L 390 30" 
                    className="waveform-line waveform-scl" 
                  />
                  {/* SDA Wave changes depending on simulation steps */}
                  <path 
                    d={`M 10 30 L ${i2cBusState === 'Start' || i2cAnimationStep > 0 ? '30 30 L 35 80' : '45 30'} L 100 80 L 150 ${i2cRW === 'write' ? '80' : '30'} L 250 ${i2cBusState === 'Ack1' ? '80' : '30'} L 350 ${i2cBusState === 'Stop' ? '370 80 L 380 30' : '30'}`} 
                    className="waveform-line waveform-sda" 
                  />

                  <text x="12" y="24" fill="#ef4444" fontSize="9" fontWeight="bold">SCL (Clock)</text>
                  <text x="12" y="74" fill="#06b6d4" fontSize="9" fontWeight="bold">SDA (Data)</text>
                </svg>
              </div>

              {/* Logs */}
              <div style={{
                backgroundColor: '#05070c',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: '#67e8f9',
                minHeight: '140px'
              }}>
                {i2cLogs.map((log, idx) => (
                  <div key={idx} style={{ marginBottom: '4px' }}>&gt; {log}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- SPI SIMULATOR --- */}
        {activeTab === 'spi' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '18px' }}>SPI Master/Slave Transfer</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">CPOL (Clock Polarity)</label>
                  <select value={spiCPOL} onChange={e => setSpiCPOL(Number(e.target.value) as any)} className="form-input">
                    <option value="0">0 (SCL low when idle)</option>
                    <option value="1">1 (SCL high when idle)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">CPHA (Clock Phase)</label>
                  <select value={spiCPHA} onChange={e => setSpiCPHA(Number(e.target.value) as any)} className="form-input">
                    <option value="0">0 (Sample on first edge)</option>
                    <option value="1">1 (Sample on second edge)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Master Tx Char</label>
                  <input type="text" maxLength={1} value={spiMasterByte} onChange={e => setSpiMasterByte(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Slave Tx Char</label>
                  <input type="text" maxLength={1} value={spiSlaveByte} onChange={e => setSpiSlaveByte(e.target.value)} className="form-input" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={resetSpi} className="btn btn-secondary" style={{ flex: 1 }}>Initialize Registers</button>
                <button onClick={stepSpiShift} className="btn btn-primary" style={{ flex: 1 }}>Step 1-Bit Shift</button>
              </div>

              {/* Register Bit Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Master Shift Register (MOSI out)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px' }}>
                    {spiMasterReg.split('').map((bit, idx) => (
                      <span key={idx} style={{
                        textAlign: 'center',
                        padding: '6px',
                        borderRadius: '4px',
                        backgroundColor: idx === 0 ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-input)',
                        border: '1px solid ' + (idx === 0 ? 'var(--error)' : 'var(--border-color)'),
                        fontSize: '13px',
                        fontFamily: 'var(--font-mono)'
                      }}>{bit}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Slave Shift Register (MISO out)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px' }}>
                    {spiSlaveReg.split('').map((bit, idx) => (
                      <span key={idx} style={{
                        textAlign: 'center',
                        padding: '6px',
                        borderRadius: '4px',
                        backgroundColor: idx === 0 ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-input)',
                        border: '1px solid ' + (idx === 0 ? 'var(--error)' : 'var(--border-color)'),
                        fontSize: '13px',
                        fontFamily: 'var(--font-mono)'
                      }}>{bit}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Waves & Terminal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card">
                <h3 style={{ fontSize: '16px', marginBottom: '14px' }}>4-Wire SPI Physical Lines Waveform</h3>
                <svg viewBox="0 0 400 130" className="waveform-svg" style={{ height: '140px' }}>
                  <path d="M 10 20 L 390 20" className="waveform-grid" />
                  <path d="M 10 50 L 390 50" className="waveform-grid" />
                  <path d="M 10 80 L 390 80" className="waveform-grid" />
                  <path d="M 10 110 L 390 110" className="waveform-grid" />

                  {/* CS Line (Asserted low) */}
                  <path d="M 10 25 L 30 25 L 35 15 L 380 15 L 385 25 L 390 25" className="waveform-line waveform-cs" />
                  
                  {/* SCL (Clock depending on CPOL) */}
                  <path 
                    d={spiCPOL === 0
                      ? "M 10 45 L 60 45 L 65 35 L 75 35 L 80 45 L 110 45 L 115 35 L 125 35 L 130 45" 
                      : "M 10 35 L 60 35 L 65 45 L 75 45 L 80 35 L 110 35 L 115 45 L 125 45 L 130 35"
                    } 
                    className="waveform-line waveform-scl" 
                  />

                  {/* MOSI & MISO */}
                  <path d="M 10 75 L 60 75 L 70 65 L 120 65 L 130 75" className="waveform-line waveform-mosi" />
                  <path d="M 10 105 L 60 105 L 70 95 L 120 105 L 130 105" className="waveform-line waveform-miso" />

                  <text x="12" y="15" fill="#f43f5e" fontSize="8" fontWeight="bold">/CS</text>
                  <text x="12" y="45" fill="#e11d48" fontSize="8" fontWeight="bold">SCK</text>
                  <text x="12" y="75" fill="#d97706" fontSize="8" fontWeight="bold">MOSI</text>
                  <text x="12" y="105" fill="#8b5cf6" fontSize="8" fontWeight="bold">MISO</text>
                </svg>
              </div>

              <div style={{
                backgroundColor: '#05070c',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: '#34d399',
                minHeight: '130px'
              }}>
                {spiLogs.map((log, idx) => (
                  <div key={idx}>&gt; {log}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- UART SIMULATOR --- */}
        {activeTab === 'uart' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '18px' }}>Asynchronous UART Transmitter</h3>
              
              <div className="form-group">
                <label className="form-label">ASCII Character to Send</label>
                <input type="text" maxLength={1} value={uartChar} onChange={e => setUartChar(e.target.value)} className="form-input" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Baud Rate (bps)</label>
                  <select value={uartBaud} onChange={e => setUartBaud(e.target.value)} className="form-input">
                    <option value="9600">9600</option>
                    <option value="115200">115200</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Parity Bit Mode</label>
                  <select value={uartParity} onChange={e => setUartParity(e.target.value as any)} className="form-input">
                    <option value="none">None</option>
                    <option value="even">Even Parity</option>
                    <option value="odd">Odd Parity</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0' }}>
                <input type="checkbox" checked={uartNoise} onChange={e => setUartNoise(e.target.checked)} id="noise" style={{ cursor: 'pointer' }} />
                <label htmlFor="noise" style={{ fontSize: '13px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  Inject Line Noise (forces bit corruption)
                </label>
              </div>

              <button onClick={triggerUartTx} disabled={uartTransmitting} className="btn btn-primary">
                Transmit UART Serial Frame
              </button>
            </div>

            {/* Frame view & Logs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '15px', marginBottom: '14px' }}>Serial Bits Construction (Active-High Line)</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {uartFrame.map((bit, idx) => (
                    <div key={idx} style={{
                      flex: 1,
                      minWidth: '36px',
                      textAlign: 'center',
                      padding: '8px 4px',
                      borderRadius: '6px',
                      backgroundColor: bit.val === 1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid ' + (bit.val === 1 ? 'var(--success)' : 'var(--error)')
                    }}>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{bit.label}</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{bit.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                backgroundColor: '#05070c',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: '#34d399',
                minHeight: '140px'
              }}>
                {uartTransmissionLog.map((log, idx) => (
                  <div key={idx}>&gt; {log}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- CAN SIMULATOR --- */}
        {activeTab === 'can' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '18px' }}>CAN Bus Multi-Master Arbitration</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Node A ID (Hex, 11-bit)</label>
                  <input type="text" value={canIdA} onChange={e => setCanIdA(e.target.value)} className="form-input" />
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Binary: {(parseInt(canIdA, 16) || 0).toString(2).padStart(11, '0')}
                  </span>
                </div>
                <div className="form-group">
                  <label className="form-label">Node B ID (Hex, 11-bit)</label>
                  <input type="text" value={canIdB} onChange={e => setCanIdB(e.target.value)} className="form-input" />
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Binary: {(parseInt(canIdB, 16) || 0).toString(2).padStart(11, '0')}
                  </span>
                </div>
              </div>

              <button onClick={runCanArbitration} className="btn btn-primary" style={{ marginTop: '10px' }}>
                Trigger Arbitration Sweep
              </button>

              {canWinner && (
                <div style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid var(--success)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '13px'
                }}>
                  🏆 <strong>Arbitration Winner:</strong> {canWinner} won because its ID had a dominant `0` bit earlier than the competitor!
                </div>
              )}
            </div>

            {/* Arbitration log */}
            <div style={{
              backgroundColor: '#05070c',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: '#34d399',
              minHeight: '220px'
            }}>
              {canLogs.map((log, idx) => (
                <div key={idx} style={{ marginBottom: '4px' }}>&gt; {log}</div>
              ))}
            </div>
          </div>
        )}

        {/* --- MCU REGISTER SIMULATOR --- */}
        {activeTab === 'mcu' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
            {/* Registers Matrix */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '18px' }}>Cortex Register-Level Peripherals</h3>

              {/* GPIO_MODER */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span>GPIOA_MODER (Mode Register)</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                    0x{mcuModer.toString(16).toUpperCase().padStart(8, '0')}
                  </span>
                </div>
                {/* 16 Pins, 2-bit selectors */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px' }}>
                  {Array.from({ length: 8 }).map((_, pinIdx) => {
                    const pin = 7 - pinIdx;
                    const val = (mcuModer >> (pin * 2)) & 3;
                    return (
                      <div key={pin} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button
                          onClick={() => toggleModerBit(pin, 0)}
                          style={{
                            padding: '4px',
                            fontSize: '9px',
                            backgroundColor: val & 1 ? 'var(--primary)' : 'var(--bg-input)',
                            border: '1px solid var(--border-color)',
                            color: val & 1 ? '#000' : 'var(--text-secondary)',
                            cursor: 'pointer'
                          }}
                        >
                          P{pin}.0
                        </button>
                        <button
                          onClick={() => toggleModerBit(pin, 1)}
                          style={{
                            padding: '4px',
                            fontSize: '9px',
                            backgroundColor: val & 2 ? 'var(--primary)' : 'var(--bg-input)',
                            border: '1px solid var(--border-color)',
                            color: val & 2 ? '#000' : 'var(--text-secondary)',
                            cursor: 'pointer'
                          }}
                        >
                          P{pin}.1
                        </button>
                      </div>
                    );
                  })}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Modes: 00 = Input, 01 = Output (Green LED), 10 = Alternate, 11 = Analog
                </span>
              </div>

              {/* GPIO_ODR */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span>GPIOA_ODR (Output Data Register)</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                    0x{mcuOdr.toString(16).toUpperCase().padStart(8, '0')}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px' }}>
                  {Array.from({ length: 8 }).map((_, pinIdx) => {
                    const pin = 7 - pinIdx;
                    const bit = (mcuOdr >> pin) & 1;
                    return (
                      <button
                        key={pin}
                        onClick={() => toggleOdrBit(pin)}
                        style={{
                          padding: '8px 4px',
                          fontSize: '11px',
                          backgroundColor: bit ? 'var(--primary)' : 'var(--bg-input)',
                          border: '1px solid var(--border-color)',
                          color: bit ? '#000' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        {bit}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* GPIO_IDR */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span>GPIOA_IDR (Input Data Register)</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                    0x{mcuIdr.toString(16).toUpperCase().padStart(8, '0')}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px' }}>
                  {Array.from({ length: 8 }).map((_, pinIdx) => {
                    const pin = 7 - pinIdx;
                    const bit = (mcuIdr >> pin) & 1;
                    return (
                      <button
                        key={pin}
                        onClick={() => toggleIdrBit(pin)}
                        style={{
                          padding: '8px 4px',
                          fontSize: '11px',
                          backgroundColor: bit ? 'var(--warning)' : 'var(--bg-input)',
                          border: '1px solid var(--border-color)',
                          color: bit ? '#000' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        {bit}
                      </button>
                    );
                  })}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Toggle bits to simulate hardware switch logic.
                </span>
              </div>
            </div>

            {/* Hardware View & Timer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Virtual Breadboard */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#182030' }}>
                <h3 style={{ fontSize: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  Virtual STM32 Board LEDs
                </h3>
                
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                  {Array.from({ length: 8 }).map((_, pinIdx) => {
                    const pin = 7 - pinIdx;
                    const mode = (mcuModer >> (pin * 2)) & 3;
                    const odrVal = (mcuOdr >> pin) & 1;
                    const ledLit = mode === 1 && odrVal === 1; // Output mode & high ODR
                    return (
                      <div key={pin} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: ledLit ? '#10b981' : '#374151',
                          border: ledLit ? '2px solid #34d399' : '2px solid #4b5563',
                          boxShadow: ledLit ? '0 0 10px #10b981' : 'none',
                          transition: 'all 0.2s ease'
                        }} />
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>PA{pin}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TIM2 Counter & NVIC */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h3 style={{ fontSize: '16px' }}>TIM2 Control Registers (Timer)</h3>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button
                    onClick={() => setTimerCR1(!timerCR1)}
                    className={`btn ${timerCR1 ? 'btn-danger' : 'btn-primary'}`}
                    style={{ padding: '6px 14px', fontSize: '12px' }}
                  >
                    {timerCR1 ? 'Stop Clock' : 'Start Clock'}
                  </button>
                  <div style={{ fontSize: '14px' }}>
                    TIM2_CNT: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{timerCNT}</strong> / 15
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '13px' }}>
                    NVIC_ISPR Pending Interrupt (TIM2 Update Event)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${nvicISPR ? 'badge-error' : 'badge-success'}`}>
                      {nvicISPR ? 'INTERRUPT PENDING' : 'CLEAR'}
                    </span>
                    {nvicISPR && (
                      <button
                        onClick={() => setNvicISPR(false)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '10px' }}
                      >
                        Clear ISR
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
