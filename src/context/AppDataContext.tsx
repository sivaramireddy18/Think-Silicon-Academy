import React, { createContext, useContext, useState, useEffect } from 'react';

// --- TS Types ---
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'trainer' | 'placement' | 'admin';
  mobile?: string;
  skills?: string[];
  resumeName?: string;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'code' | 'lab';
  duration: string;
  content: string; // text description or video/pdf link simulator
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'programming' | 'embedded' | 'linux' | 'validation' | 'protocols';
  modules: Module[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Lab {
  id: string;
  title: string;
  category: 'C' | 'Embedded C' | 'Protocols' | 'Linux';
  description: string;
  starterCode: string;
  testCases: { input: string; expected: string; description: string }[];
}

export interface LabSubmission {
  id: string;
  labId: string;
  studentId: string;
  studentName: string;
  code: string;
  report: string;
  status: 'pending' | 'passed' | 'failed';
  score?: number;
  feedback?: string;
  submittedAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  requirements: string[];
  description: string;
  status: 'active' | 'closed';
}

export interface JobApplication {
  id: string;
  jobId: string;
  studentId: string;
  status: 'Applied' | 'Reviewing' | 'Interviewing' | 'Offered' | 'Rejected';
  appliedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  author: string;
}

interface AppDataContextType {
  currentUser: User | null;
  courses: Course[];
  labs: Lab[];
  submissions: LabSubmission[];
  jobs: Job[];
  applications: JobApplication[];
  blogs: BlogPost[];
  enrolledCourses: string[]; // Course IDs
  completedLessons: Record<string, string[]>; // CourseID -> LessonIDs[]
  mockInterviewResults: { topic: string; score: number; feedback: string; date: string }[];
  
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
  // Actions
  login: (email: string, role: User['role']) => boolean;
  logout: () => void;
  enrollInCourse: (courseId: string) => void;
  toggleLessonComplete: (courseId: string, lessonId: string) => void;
  submitLab: (labId: string, code: string, report: string) => void;
  gradeSubmission: (submissionId: string, status: 'passed' | 'failed', score: number, feedback: string) => void;
  applyForJob: (jobId: string) => void;
  uploadResume: (fileName: string) => void;
  addMockInterviewResult: (topic: string, score: number, feedback: string) => void;
  
  // Admin / Trainer CRUD helpers
  addCourse: (course: Course) => void;
  addJob: (job: Job) => void;
  addBlog: (blog: BlogPost) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

// --- Initial Mock Data ---

const INITIAL_COURSES: Course[] = [
  {
    id: 'c-embedded',
    title: 'Advanced C Programming for Embedded Systems',
    description: 'Master pointers, memory layouts, register-level bitwise manipulation, structures, dynamic allocation, and optimization strategies for microcontrollers.',
    category: 'programming',
    difficulty: 'Intermediate',
    modules: [
      {
        id: 'c-mod-1',
        title: 'Module 1: Pointer Manipulation & Memory Architecture',
        lessons: [
          { id: 'c-l1', title: 'Understanding ARM Memory Maps', type: 'video', duration: '15 mins', content: 'In this video, we explore how memory is structured in ARM Cortex-M microcontrollers. We discuss code space, SRAM, peripheral registers, and how the linker script allocates these spaces.' },
          { id: 'c-l2', title: 'Pointer Arithmetic and Pointer Types', type: 'code', duration: '20 mins', content: 'Detailed code examples showing double pointers, void pointers, function pointers, and volatile pointer declarations for memory-mapped I/O.' },
          { id: 'c-l3', title: 'Lab: Dynamic Memory vs Static Allocation', type: 'lab', duration: '45 mins', content: 'Write a safe heap allocator buffer implementation and compile it in our Virtual Lab.' }
        ]
      },
      {
        id: 'c-mod-2',
        title: 'Module 2: Structures, Unions & Bit Fields',
        lessons: [
          { id: 'c-l4', title: 'Structure Padding and Packing', type: 'pdf', duration: '10 pages', content: 'Explains compiler alignment rules, the performance cost of unaligned access, and the use of #pragma pack(1) or __attribute__((packed)).' },
          { id: 'c-l5', title: 'Register Mapping using Structs and Bitfields', type: 'code', duration: '30 mins', content: 'Example of mapping hardware peripheral registers directly into C structures for clean API controls (e.g. GPIO configuration).' }
        ]
      }
    ]
  },
  {
    id: 'embedded-systems',
    title: 'Bare-Metal ARM Cortex-M & STM32 Development',
    description: 'Learn GPIO drivers, timer architectures, interrupts (NVIC), DMA controllers, and communication protocols by writing direct register-level code.',
    category: 'embedded',
    difficulty: 'Advanced',
    modules: [
      {
        id: 'emb-mod-1',
        title: 'Module 1: GPIO & Nested Vector Interrupt Controller (NVIC)',
        lessons: [
          { id: 'emb-l1', title: 'STM32 Clock Control (RCC) & GPIO Config', type: 'video', duration: '25 mins', content: 'Step-by-step register programming for enabling peripheral clocks and configuring GPIO modes (Input, Output, Alternate Function, Analog).' },
          { id: 'emb-l2', title: 'Understanding NVIC and ISR vectors', type: 'pdf', duration: '15 pages', content: 'Deep dive into ARM Cortex interrupt entry/exit sequences, priorities, preemption, and writing interrupt service routines.' },
          { id: 'emb-l3', title: 'Lab: Interrupt-Driven Led Blinking', type: 'lab', duration: '60 mins', content: 'Configure GPIO external interrupts (EXTI) and toggle LEDs when a virtual button is pressed.' }
        ]
      }
    ]
  },
  {
    id: 'embedded-linux',
    title: 'Embedded Linux Systems & Device Drivers',
    description: 'Build your own bootloader, kernel, and RootFS using Yocto and Buildroot. Write Linux character drivers and interface with GPIO, I2C, and SPI.',
    category: 'linux',
    difficulty: 'Advanced',
    modules: [
      {
        id: 'lin-mod-1',
        title: 'Module 1: Embedded Linux Toolchains & Bring-up',
        lessons: [
          { id: 'lin-l1', title: 'Cross Compiling for ARM Targets', type: 'video', duration: '18 mins', content: 'Setting up toolchains, configuring makefiles, and cross-compiling custom C code for target boards.' },
          { id: 'lin-l2', title: 'U-Boot Bootloader & Device Trees', type: 'pdf', duration: '20 pages', content: 'The booting sequence of Linux, boot arguments, and how Device Trees (.dts) describe peripheral mappings to the kernel.' }
        ]
      },
      {
        id: 'lin-mod-2',
        title: 'Module 2: Custom Linux Kernel Modules',
        lessons: [
          { id: 'lin-l3', title: 'Writing Your First Character Device Driver', type: 'code', duration: '40 mins', content: 'Code template for a character driver with open, read, write, and release system call hooks.' },
          { id: 'lin-l4', title: 'Lab: GPIO Kernel Driver', type: 'lab', duration: '90 mins', content: 'Write a kernel module that exposes GPIO pins to user space via sysfs.' }
        ]
      }
    ]
  },
  {
    id: 'silicon-val',
    title: 'Silicon Validation & Post-Silicon Bring-up',
    description: 'Examine post-silicon validation workflows, writing test suites, debugging lockups (DMA, clocks), clock domain crossings, and using logic analyzers.',
    category: 'validation',
    difficulty: 'Advanced',
    modules: [
      {
        id: 'val-mod-1',
        title: 'Module 1: Validation Methodologies & Test Planning',
        lessons: [
          { id: 'val-l1', title: 'Pre-Silicon vs Post-Silicon Validation', type: 'video', duration: '20 mins', content: 'Differences in environments, costs, and defect escape rates. Introduction to boardbring-up workflows.' },
          { id: 'val-l2', title: 'Writing a Silicon Validation Test Plan', type: 'pdf', duration: '12 pages', content: 'Defining scope, clock frequencies, power rails, test matrix, and register read/write sweep strategies.' }
        ]
      },
      {
        id: 'val-mod-2',
        title: 'Module 2: Root-Cause Debug Case Studies',
        lessons: [
          { id: 'val-l3', title: 'Debugging Clock Domain Crossing Glitches', type: 'code', duration: '30 mins', content: 'Analysing trace files to identify metastability and data corruption in asynchronous FIFO bounds.' },
          { id: 'val-l4', title: 'Lab: DMA Interrupt Conflict Resolution', type: 'lab', duration: '60 mins', content: 'Isolate why a DMA transaction hangs when high priority interrupts are enabled concurrently.' }
        ]
      }
    ]
  }
];

const INITIAL_LABS: Lab[] = [
  {
    id: 'lab-pointers',
    title: 'Safe Pointer Offset Configuration',
    category: 'C',
    description: 'Implement a function `uint8_t* get_reg_offset(uint32_t base_addr, uint16_t offset)` that returns a pointer to the memory address. Ensure alignment validation: return `NULL` if base_addr + offset is not 4-byte aligned.',
    starterCode: `#include <stdio.h>
#include <stdint.h>

uint8_t* get_reg_offset(uint32_t base_addr, uint16_t offset) {
    // Write your code here
    
    return NULL;
}`,
    testCases: [
      { input: 'base_addr = 0x40020000, offset = 4', expected: 'pointer offset returned successfully', description: 'Checks aligned addresses' },
      { input: 'base_addr = 0x40020000, offset = 3', expected: 'NULL', description: 'Checks alignment rejection' }
    ]
  },
  {
    id: 'lab-gpio',
    title: 'Register-Level GPIO Toggle Config',
    category: 'Embedded C',
    description: 'Write register configurations in C. You need to enable the output driver on Port A pin 5 (connected to user LED) by setting the bit field. Modifying GPIOA_MODER registers: bits [11:10] must be `01` for output mode. GPIOA_ODR bits [5] toggles output.',
    starterCode: `#include <stdint.h>

// Registers mapped definitions
#define GPIOA_MODER  (*((volatile uint32_t*)0x40020000))
#define GPIOA_ODR    (*((volatile uint32_t*)0x40020014))

void configure_led_output() {
    // Set MODER bits [11:10] to 01 (clear them first, then set)
    
}

void toggle_led(uint8_t state) {
    // If state is 1, set ODR bit 5. If 0, clear it.
    
}`,
    testCases: [
      { input: 'configure_led_output()', expected: 'GPIOA_MODER correctly configured', description: 'Verifies correct bit shifts for Mode register' },
      { input: 'toggle_led(1)', expected: 'GPIOA_ODR bit 5 high', description: 'Verifies write to ODR register' }
    ]
  },
  {
    id: 'lab-i2c',
    title: 'I2C Master Transmit Packetizer',
    category: 'Protocols',
    description: 'Write a helper function `uint8_t create_i2c_frame(uint8_t addr, uint8_t is_read, uint8_t* data, uint8_t len, uint8_t* out_frame)` that packs I2C payload. The out_frame should start with Address byte shifted left + R/W bit, followed by data bytes. Return total length of frame (len + 1).',
    starterCode: `#include <stdint.h>

uint8_t create_i2c_frame(uint8_t addr, uint8_t is_read, uint8_t* data, uint8_t len, uint8_t* out_frame) {
    // Write your code here
    
    return 0;
}`,
    testCases: [
      { input: 'addr = 0x50, is_read = 0, len = 2', expected: 'out_frame[0] = 0xA0', description: 'Verifies write-shifted address byte' }
    ]
  }
];

const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Embedded Software Engineer',
    company: 'Silicon Technologies Inc.',
    location: 'Bangalore, India (Hybrid)',
    salary: '₹12,00,000 - ₹18,00,000 / year',
    requirements: ['ARM Cortex-M Programming', 'Bare metal firmware development', 'SPI/I2C Device Drivers', 'C Programming'],
    description: 'We are seeking an Embedded Systems Engineer to write microcode and boot firmware for our next-generation automotive sensor nodes. You will interface directly with validation teams to debug early silicon.',
    status: 'active'
  },
  {
    id: 'job-2',
    title: 'Post-Silicon Validation Engineer',
    company: 'Nvidia Corporation',
    location: 'Hyderabad, India',
    salary: '₹18,00,000 - ₹25,00,000 / year',
    requirements: ['Post-Silicon Bringup', 'Logic Analyzer operation', 'PCIe protocol validation', 'Python automation testing'],
    description: 'Join the ASIC validation group. You will write test scripts to validate high-speed PCIe, DDR5, and USB interfaces. Core tasks include debugging early board lockups and performance tuning.',
    status: 'active'
  },
  {
    id: 'job-3',
    title: 'Linux Kernel Developer',
    company: 'Qualcomm India',
    location: 'Bangalore, India',
    salary: '₹15,00,000 - ₹22,00,000 / year',
    requirements: ['Linux Device Drivers', 'Kernel compilation', 'DMA Controller configuration', 'ARM64 architecture'],
    description: 'Work on Android board support packages (BSP). You will develop and optimize kernel-level device drivers for DMA engines and camera interfaces.',
    status: 'active'
  }
];

const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'An In-Depth Guide to Debugging Clock domain Crossings',
    excerpt: 'Metastability is a silent killer in custom silicon. Discover how logic validation engineers isolate clock synchronization errors.',
    content: 'Clock Domain Crossing (CDC) occurs when data is transferred from a clock domain running at frequency A to another running at frequency B. If setup or hold times are violated at the destination register, the flip-flop can enter a metastable state. To validate this in post-silicon, we employ sweep tests, scanning temperature and voltage rails to force the metastability to manifest, and then analyze waveform traces with high-bandwidth oscilloscopes. Key fixes include using 2-stage synchronizers, handshake protocols, or asynchronous FIFOs.',
    category: 'Silicon Validation',
    date: 'June 01, 2026',
    author: 'Narayana Raju S (Founder)'
  },
  {
    id: 'blog-2',
    title: 'Volatile Keyword in Embedded C: When and Why to Use It',
    excerpt: 'Why does the compiler optimize away your register loops? Learn how volatile stops compiler assumptions.',
    content: 'The volatile keyword tells the C compiler that a variable can be modified by hardware outside of the program control. This prevents the compiler from optimizing out repeated reads or writes. For example, if you are polling a hardware register (e.g. while(*status_register == 0)), the compiler might load the value into a CPU register once and loop infinitely. Declaring it as volatile force-reads the memory address on every single iteration.',
    category: 'C Programming',
    date: 'May 28, 2026',
    author: 'Deepak V (Embedded Lead)'
  }
];

// --- Context Provider Component ---

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('tsa_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'dark';
  });

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('tsa_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [enrolledCourses, setEnrolledCourses] = useState<string[]>(() => {
    const saved = localStorage.getItem('tsa_enrolled');
    return saved ? JSON.parse(saved) : ['c-embedded']; // Enroll in C course by default
  });

  const [completedLessons, setCompletedLessons] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('tsa_completed');
    return saved ? JSON.parse(saved) : { 'c-embedded': ['c-l1'] };
  });

  const [submissions, setSubmissions] = useState<LabSubmission[]>(() => {
    const saved = localStorage.getItem('tsa_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const saved = localStorage.getItem('tsa_applications');
    return saved ? JSON.parse(saved) : [];
  });

  const [mockInterviewResults, setMockInterviewResults] = useState<{ topic: string; score: number; feedback: string; date: string }[]>(() => {
    const saved = localStorage.getItem('tsa_interviews');
    return saved ? JSON.parse(saved) : [];
  });

  // Base tables (can be appended to via mock CRUD)
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('tsa_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('tsa_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });
  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem('tsa_blogs');
    return saved ? JSON.parse(saved) : INITIAL_BLOGS;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('tsa_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tsa_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('tsa_enrolled', JSON.stringify(enrolledCourses));
  }, [enrolledCourses]);

  useEffect(() => {
    localStorage.setItem('tsa_completed', JSON.stringify(completedLessons));
  }, [completedLessons]);

  useEffect(() => {
    localStorage.setItem('tsa_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('tsa_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('tsa_interviews', JSON.stringify(mockInterviewResults));
  }, [mockInterviewResults]);

  useEffect(() => {
    localStorage.setItem('tsa_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('tsa_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('tsa_blogs', JSON.stringify(blogs));
  }, [blogs]);

  // Actions
  const login = (email: string, role: User['role']): boolean => {
    let name = 'Student User';
    if (role === 'trainer') name = 'Lead Instructor';
    if (role === 'placement') name = 'Placement Director';
    if (role === 'admin') name = 'Super Administrator';
    
    const mockUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name,
      email,
      role,
      skills: role === 'student' ? ['C Programming', 'Pointers'] : []
    };
    setCurrentUser(mockUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const enrollInCourse = (courseId: string) => {
    if (!enrolledCourses.includes(courseId)) {
      setEnrolledCourses(prev => [...prev, courseId]);
      setCompletedLessons(prev => ({ ...prev, [courseId]: [] }));
    }
  };

  const toggleLessonComplete = (courseId: string, lessonId: string) => {
    setCompletedLessons(prev => {
      const list = prev[courseId] || [];
      const updated = list.includes(lessonId)
        ? list.filter(id => id !== lessonId)
        : [...list, lessonId];
      return { ...prev, [courseId]: updated };
    });
  };

  const submitLab = (labId: string, code: string, report: string) => {
    if (!currentUser) return;
    const newSubmission: LabSubmission = {
      id: 'sub_' + Math.random().toString(36).substring(2, 9),
      labId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      code,
      report,
      status: 'pending',
      submittedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSubmissions(prev => [newSubmission, ...prev]);

    // Automatically grade after 2 seconds for a seamless mock experience
    setTimeout(() => {
      setSubmissions(prevSub => 
        prevSub.map(s => {
          if (s.id === newSubmission.id) {
            // Simple heuristic to mock checks
            const hasCorrectKeywords = code.includes('NULL') || code.includes('base_addr') || code.includes('MODER') || code.includes('ODR');
            const passed = hasCorrectKeywords && report.length > 20;
            return {
              ...s,
              status: passed ? 'passed' : 'failed',
              score: passed ? 85 + Math.floor(Math.random() * 16) : 40 + Math.floor(Math.random() * 20),
              feedback: passed 
                ? 'Excellent work! Pointers align correctly, register masks are properly set, and code has been optimized.' 
                : 'Code failed test cases. Check bitwise shifts, volatile syntax, or ensure your report submission details the debugging findings.'
            };
          }
          return s;
        })
      );
    }, 2000);
  };

  const gradeSubmission = (submissionId: string, status: 'passed' | 'failed', score: number, feedback: string) => {
    setSubmissions(prev => 
      prev.map(sub => sub.id === submissionId ? { ...sub, status, score, feedback } : sub)
    );
  };

  const applyForJob = (jobId: string) => {
    if (!currentUser) return;
    const applied = applications.some(app => app.jobId === jobId && app.studentId === currentUser.id);
    if (!applied) {
      const newApp: JobApplication = {
        id: 'app_' + Math.random().toString(36).substring(2, 9),
        jobId,
        studentId: currentUser.id,
        status: 'Applied',
        appliedAt: new Date().toLocaleDateString()
      };
      setApplications(prev => [...prev, newApp]);
    }
  };

  const uploadResume = (fileName: string) => {
    if (!currentUser) return;
    setCurrentUser(prev => prev ? { ...prev, resumeName: fileName } : null);
  };

  const addMockInterviewResult = (topic: string, score: number, feedback: string) => {
    const result = {
      topic,
      score,
      feedback,
      date: new Date().toLocaleDateString()
    };
    setMockInterviewResults(prev => [result, ...prev]);
  };

  const addCourse = (course: Course) => {
    setCourses(prev => [...prev, course]);
  };

  const addJob = (job: Job) => {
    setJobs(prev => [job, ...prev]);
  };

  const addBlog = (blog: BlogPost) => {
    setBlogs(prev => [blog, ...prev]);
  };

  return (
    <AppDataContext.Provider value={{
      currentUser,
      theme,
      toggleTheme,
      courses,
      labs: INITIAL_LABS,
      submissions,
      jobs,
      applications,
      blogs,
      enrolledCourses,
      completedLessons,
      mockInterviewResults,
      login,
      logout,
      enrollInCourse,
      toggleLessonComplete,
      submitLab,
      gradeSubmission,
      applyForJob,
      uploadResume,
      addMockInterviewResult,
      addCourse,
      addJob,
      addBlog
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within an AppDataProvider');
  return context;
};
