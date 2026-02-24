import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  setMode,
  resetCopticNumberMessage,
  transliterateSentence,
  getKeyMapping,
  getMultiCharMapping,
  getDictionaryEntries
} from './lib/transliterator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Copy,
  Bookmark,
  ArrowLeft,
  Trash2,
  BookOpen,
  X,
  Check,
  History,
  Sparkles,
  Moon
} from 'lucide-react';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

// Types
interface HistoryItem {
  id: string;
  mode: string;
  input: string;
  output: string;
  timestamp: number;
}

// Malay Pattern SVG Component
const MalayPattern = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    className={className}
    style={style}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M50 5L55 20L70 15L60 30L75 40L55 45L50 60L45 45L25 40L40 30L30 15L45 20L50 5Z"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    <circle cx="50" cy="50" r="8" stroke="currentColor" strokeWidth="1" fill="none" />
    <path
      d="M50 20 Q65 35 50 50 Q35 35 50 20"
      stroke="currentColor"
      strokeWidth="0.5"
      fill="none"
    />
    <path
      d="M20 50 Q35 35 50 50 Q35 65 20 50"
      stroke="currentColor"
      strokeWidth="0.5"
      fill="none"
    />
    <path
      d="M50 80 Q35 65 50 50 Q65 65 50 80"
      stroke="currentColor"
      strokeWidth="0.5"
      fill="none"
    />
    <path
      d="M80 50 Q65 65 50 50 Q65 35 80 50"
      stroke="currentColor"
      strokeWidth="0.5"
      fill="none"
    />
  </svg>
);

// Coptic Cross SVG Component
const CopticCross = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    className={className}
    style={style}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M50 10 L50 90 M10 50 L90 50"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M50 15 L55 25 L50 30 L45 25 Z"
      fill="currentColor"
    />
    <path
      d="M50 85 L55 75 L50 70 L45 75 Z"
      fill="currentColor"
    />
    <path
      d="M15 50 L25 55 L30 50 L25 45 Z"
      fill="currentColor"
    />
    <path
      d="M85 50 L75 55 L70 50 L75 45 Z"
      fill="currentColor"
    />
    <circle cx="50" cy="50" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

// Ankh Symbol (Coptic/Egyptian)
const AnkhSymbol = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    className={className}
    style={style}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M35 25 C35 15 45 10 50 10 C55 10 65 15 65 25 C65 35 55 40 52 42 L52 55 L68 55 L68 65 L52 65 L52 90 L48 90 L48 65 L32 65 L32 55 L48 55 L48 42 C45 40 35 35 35 25Z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="50" cy="25" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

function App() {
  // State
  const [mode, setModeState] = useState<'high' | 'low'>('high');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [showNumberMessage, setShowNumberMessage] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showKeyMap, setShowKeyMap] = useState(false);
  const [copied, setCopied] = useState(false);

  // Refs for animations
  const heroRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const historySectionRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const outputScrollRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mrcs-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('mrcs-history', JSON.stringify(history));
  }, [history]);

  // Initialize GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance animation (auto-play on load)
      const heroTl = gsap.timeline();
      heroTl
        .fromTo(
          '.pattern-bg-1',
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 0.15, duration: 1.2, ease: 'power2.out' }
        )
        .fromTo(
          '.pattern-bg-2',
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 0.12, duration: 1.2, ease: 'power2.out' },
          '<'
        )
        .fromTo(
          '.hero-title span',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.04, ease: 'power2.out' },
          0.3
        )
        .fromTo(
          '.hero-subtitle',
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
          0.5
        )
        .fromTo(
          '.mode-card',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
          0.6
        )
        .fromTo(
          '.scroll-hint',
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          1
        );

      // Hero scroll-driven exit animation
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: '+=130%',
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          const progress = self.progress;
          if (progress > 0.7) {
            const exitProgress = (progress - 0.7) / 0.3;
            gsap.set('.hero-content', {
              y: -18 * exitProgress + 'vh',
              opacity: 1 - exitProgress * 0.75
            });
            gsap.set('.mode-card', {
              y: -10 * exitProgress + 'vh',
              opacity: 1 - exitProgress * 0.75
            });
          }
        }
      });

      // Input section scroll animation
      ScrollTrigger.create({
        trigger: inputRef.current,
        start: 'top top',
        end: '+=130%',
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          const progress = self.progress;

          // Entrance (0-30%)
          if (progress <= 0.3) {
            const entranceProgress = progress / 0.3;
            gsap.set('.input-prompt', {
              x: -12 * (1 - entranceProgress) + 'vw',
              opacity: entranceProgress
            });
            gsap.set('.input-card', {
              y: 18 * (1 - entranceProgress) + 'vh',
              scale: 0.98 + 0.02 * entranceProgress,
              opacity: entranceProgress
            });
            gsap.set('.input-cta', {
              y: 10 * (1 - entranceProgress) + 'vh',
              opacity: entranceProgress
            });
          }
          // Settle (30-70%)
          else if (progress <= 0.7) {
            gsap.set('.input-prompt', { x: 0, opacity: 1 });
            gsap.set('.input-card', { y: 0, scale: 1, opacity: 1 });
            gsap.set('.input-cta', { y: 0, opacity: 1 });
          }
          // Exit (70-100%)
          else {
            const exitProgress = (progress - 0.7) / 0.3;
            gsap.set('.input-card', {
              x: -18 * exitProgress + 'vw',
              opacity: 1 - exitProgress * 0.75
            });
            gsap.set('.input-cta', {
              y: 8 * exitProgress + 'vh',
              opacity: 1 - exitProgress * 0.75
            });
            gsap.set('.input-prompt', {
              opacity: Math.max(0.3, 1 - exitProgress * 0.7)
            });
          }
        }
      });

      // Output section scroll animation
      ScrollTrigger.create({
        trigger: outputRef.current,
        start: 'top top',
        end: '+=130%',
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          const progress = self.progress;

          // Entrance (0-30%)
          if (progress <= 0.3) {
            const entranceProgress = progress / 0.3;
            gsap.set('.output-card', {
              x: 18 * (1 - entranceProgress) + 'vw',
              opacity: entranceProgress
            });
            gsap.set('.output-label', {
              x: -8 * (1 - entranceProgress) + 'vw',
              opacity: entranceProgress
            });
            gsap.set('.output-actions', {
              y: 10 * (1 - entranceProgress) + 'vh',
              opacity: entranceProgress
            });
          }
          // Settle (30-70%)
          else if (progress <= 0.7) {
            gsap.set('.output-card', { x: 0, opacity: 1 });
            gsap.set('.output-label', { x: 0, opacity: 1 });
            gsap.set('.output-actions', { y: 0, opacity: 1 });
          }
          // Exit (70-100%)
          else {
            const exitProgress = (progress - 0.7) / 0.3;
            gsap.set('.output-card', {
              y: -12 * exitProgress + 'vh',
              opacity: 1 - exitProgress * 0.75
            });
            gsap.set('.output-actions', {
              y: 8 * exitProgress + 'vh',
              opacity: 1 - exitProgress * 0.75
            });
            gsap.set('.output-label', {
              opacity: Math.max(0.3, 1 - exitProgress * 0.7)
            });
          }
        }
      });

      // History section flowing animation
      gsap.fromTo(
        '.history-header',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: historySectionRef.current,
            start: 'top 80%',
            end: 'top 50%',
            scrub: true
          }
        }
      );

      // Footer flowing animation
      gsap.fromTo(
        '.keymap-panel',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 80%',
            end: 'top 50%',
            scrub: true
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  // Handle mode change
  const handleModeChange = (newMode: 'high' | 'low') => {
    setModeState(newMode);
    setMode(newMode === 'high');
  };

  // Handle transliteration
  const handleTransliterate = () => {
    if (!input.trim()) {
      toast.error('Please enter some text to transliterate');
      return;
    }

    resetCopticNumberMessage();
    const { result, showNumberMessage: showMsg } = transliterateSentence(input);
    setOutput(result);
    setShowNumberMessage(showMsg);

    // Scroll to output section
    if (outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle copy
  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  // Handle save to history
  const handleSaveToHistory = () => {
    if (!output || !input) return;
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      mode: mode === 'high' ? 'High-Class Coptic' : 'Low-Class Coptic',
      input: input.slice(0, 100) + (input.length > 100 ? '...' : ''),
      output: output.slice(0, 100) + (output.length > 100 ? '...' : ''),
      timestamp: Date.now()
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 19)]);
    toast.success('Saved to history!');
  };

  // Handle clear history
  const handleClearHistory = () => {
    setHistory([]);
    toast.success('History cleared!');
  };

  // Handle delete history item
  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // Handle copy from history
  const handleCopyFromHistory = (outputText: string) => {
    navigator.clipboard.writeText(outputText);
    toast.success('Copied to clipboard!');
  };

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleTransliterate();
      }
      if (e.key === 'Escape') {
        setShowKeyMap(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input]);

  const keyMapping = getKeyMapping();
  const multiCharMapping = getMultiCharMapping();
  const dictionaryEntries = getDictionaryEntries();

  return (
    <div className="min-h-screen text-[#f4e4bc] font-sans overflow-x-hidden relative">
      {/* Base gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#0a1628]" />
      
      {/* Background Symbols - Crescent Moon, Cross, and Ankh */}
      {/* Large Cross - Top Right */}
      <CopticCross className="pattern-bg-1 fixed -right-24 -top-24 w-[450px] h-[450px] text-[#d4af37] opacity-0 animate-pulse-glow pointer-events-none" />
      
      {/* Large Ankh - Bottom Left */}
      <AnkhSymbol className="pattern-bg-2 fixed -left-20 -bottom-20 w-[400px] h-[400px] text-[#d4af37] opacity-0 animate-float pointer-events-none" />
      
      {/* Crescent Moons - Distributed */}
      <Moon className="fixed left-[8%] top-[18%] w-16 h-16 text-[#d4af37] opacity-15 animate-float pointer-events-none" />
      <Moon className="fixed right-[15%] top-[55%] w-12 h-12 text-[#d4af37] opacity-12 animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
      <Moon className="fixed left-[20%] bottom-[25%] w-10 h-10 text-[#d4af37] opacity-10 animate-float pointer-events-none" style={{ animationDelay: '2s' }} />
      <Moon className="fixed right-[10%] bottom-[15%] w-14 h-14 text-[#d4af37] opacity-13 animate-pulse pointer-events-none" style={{ animationDelay: '0.5s' }} />
      
      {/* Small Crosses - Distributed */}
      <CopticCross className="fixed left-[12%] top-[45%] w-10 h-10 text-[#d4af37] opacity-12 animate-float pointer-events-none" style={{ animationDelay: '1.5s' }} />
      <CopticCross className="fixed right-[18%] top-[22%] w-8 h-8 text-[#d4af37] opacity-10 animate-pulse pointer-events-none" style={{ animationDelay: '0.8s' }} />
      <CopticCross className="fixed left-[25%] bottom-[40%] w-6 h-6 text-[#d4af37] opacity-8 animate-float pointer-events-none" style={{ animationDelay: '2.5s' }} />
      <CopticCross className="fixed right-[22%] bottom-[30%] w-9 h-9 text-[#d4af37] opacity-11 animate-pulse pointer-events-none" style={{ animationDelay: '1.2s' }} />
      
      {/* Small Ankhs - Distributed */}
      <AnkhSymbol className="fixed left-[18%] top-[30%] w-8 h-8 text-[#d4af37] opacity-10 animate-pulse pointer-events-none" style={{ animationDelay: '0.3s' }} />
      <AnkhSymbol className="fixed right-[12%] top-[40%] w-10 h-10 text-[#d4af37] opacity-12 animate-float pointer-events-none" style={{ animationDelay: '1.8s' }} />
      <AnkhSymbol className="fixed left-[30%] bottom-[20%] w-7 h-7 text-[#d4af37] opacity-9 animate-pulse pointer-events-none" style={{ animationDelay: '2.2s' }} />
      <AnkhSymbol className="fixed right-[25%] bottom-[45%] w-9 h-9 text-[#d4af37] opacity-11 animate-float pointer-events-none" style={{ animationDelay: '0.7s' }} />

      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          mixBlendMode: 'overlay'
        }}
      />

      {/* Persistent Header */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex justify-between items-center bg-gradient-to-b from-[#0a1628] to-transparent">
        <div className="flex items-center gap-3">
          <CopticCross className="w-8 h-8 text-[#d4af37]" />
          <div className="font-serif text-2xl font-semibold tracking-tight text-[#d4af37]">MRCS</div>
        </div>
        <button
          onClick={() => setShowKeyMap(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a3050]/80 backdrop-blur-sm rounded-md border border-[#d4af37]/30 hover:border-[#d4af37] hover:bg-[#1a3050] transition-all"
        >
          <BookOpen className="w-4 h-4 text-[#d4af37]" />
          <span className="text-sm font-medium text-[#f4e4bc]">Key Map</span>
        </button>
      </header>

      {/* Section 1: Hero + Mode Switch */}
      <section
        ref={heroRef}
        className="relative h-screen w-full flex items-center justify-center overflow-hidden"
        style={{ zIndex: 10 }}
      >
        <div className="hero-content relative z-10 text-center px-4">
          {/* Decorative border */}
          <div className="absolute inset-0 -m-20 border border-[#d4af37]/20 rounded-lg pointer-events-none" />
          <div className="absolute inset-0 -m-16 border border-[#d4af37]/10 rounded-lg pointer-events-none" />
          
          <h1 className="hero-title font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-[#d4af37] drop-shadow-lg">
            {'MRCS Transliterator'.split(' ').map((word, i) => (
              <span key={i} className="inline-block mr-4">
                {word}
              </span>
            ))}
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-[#f4e4bc]/80 max-w-xl mx-auto mb-12">
            Malay to Coptic script. Two modes. Instant results.
          </p>

          {/* Mode Switch Card */}
          <div className="mode-card bg-[#0f1f3a]/90 backdrop-blur-sm rounded-lg shadow-xl p-6 max-w-md mx-auto border-2 border-[#d4af37]/40">
            <p className="text-sm text-[#f4e4bc]/60 mb-4">Choose transliteration mode</p>
            <div className="flex gap-2 p-1 bg-[#0a1628] rounded-md border border-[#d4af37]/20">
              <button
                onClick={() => handleModeChange('low')}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  mode === 'low'
                    ? 'bg-[#d4af37] text-[#0a1628]'
                    : 'text-[#f4e4bc]/70 hover:text-[#f4e4bc]'
                }`}
              >
                Low-Class Coptic
              </button>
              <button
                onClick={() => handleModeChange('high')}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  mode === 'high'
                    ? 'bg-[#d4af37] text-[#0a1628]'
                    : 'text-[#f4e4bc]/70 hover:text-[#f4e4bc]'
                }`}
              >
                High-Class Coptic
              </button>
            </div>
          </div>
        </div>

        <div className="scroll-hint absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-[#f4e4bc]/60 flex items-center gap-2">
          <span>Scroll to begin</span>
          <div className="w-4 h-4 border-b-2 border-r-2 border-[#d4af37] rotate-45 animate-bounce" />
        </div>
      </section>

      {/* Section 2: Transliterator Input */}
      <section
        ref={inputRef}
        className="relative h-screen w-full flex items-center justify-center overflow-hidden"
        style={{ zIndex: 20 }}
      >
        <div className="w-full max-w-5xl mx-auto px-4">
          {/* Top bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <CopticCross className="w-6 h-6 text-[#d4af37]" />
              <div className="font-serif text-xl font-semibold text-[#d4af37]">MRCS</div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0f1f3a] rounded-full border border-[#d4af37]/30">
              <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
              <span className="text-sm text-[#f4e4bc]">
                {mode === 'high' ? 'High-Class Coptic' : 'Low-Class Coptic'}
              </span>
            </div>
          </div>

          {/* Prompt */}
          <p className="input-prompt text-lg text-[#f4e4bc]/70 mb-4 flex items-center gap-2">
            <MalayPattern className="w-5 h-5 text-[#d4af37]" />
            Type in Malay
          </p>

          {/* Input Card */}
          <div className="input-card bg-[#0f1f3a]/90 backdrop-blur-sm rounded-lg shadow-xl border-2 border-[#d4af37]/30 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#d4af37] via-[#f4e4bc] to-[#d4af37]" />
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Selamat pagi. Apa khabar?"
              className="w-full min-h-[35vh] p-6 text-lg bg-transparent border-0 resize-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#f4e4bc]/30 text-[#f4e4bc]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          </div>

          {/* CTA */}
          <div className="input-cta mt-8 flex flex-col items-center gap-3">
            <Button
              onClick={handleTransliterate}
              className="px-8 py-6 text-lg bg-[#d4af37] hover:bg-[#f4e4bc] text-[#0a1628] rounded-md transition-all hover:-translate-y-0.5 active:scale-[0.98] font-semibold shadow-lg shadow-[#d4af37]/20"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Transliterate
            </Button>
            <p className="text-sm text-[#f4e4bc]/60">
              Numbers 1–1,000,000 are converted to Coptic numerals.
            </p>
            <p className="text-xs text-[#f4e4bc]/40">Press Ctrl+Enter to transliterate</p>
          </div>
        </div>
      </section>

      {/* Section 3: Result + Copy */}
      <section
        ref={outputRef}
        className="relative h-screen w-full flex items-center justify-center overflow-hidden"
        style={{ zIndex: 30 }}
      >
        <div className="w-full max-w-5xl mx-auto px-4">
          {/* Top bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <CopticCross className="w-6 h-6 text-[#d4af37]" />
              <div className="font-serif text-xl font-semibold text-[#d4af37]">MRCS</div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0f1f3a] rounded-full border border-[#d4af37]/30">
              <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
              <span className="text-sm text-[#f4e4bc]">
                {mode === 'high' ? 'High-Class Coptic' : 'Low-Class Coptic'}
              </span>
            </div>
          </div>

          {/* Label */}
          <p className="output-label text-lg text-[#f4e4bc]/70 mb-4 flex items-center gap-2">
            <AnkhSymbol className="w-5 h-5 text-[#d4af37]" />
            Coptic output
          </p>

          {/* Result Card - Now with scroll */}
          <div className="output-card bg-[#0f1f3a]/90 backdrop-blur-sm rounded-lg shadow-xl border-2 border-[#d4af37]/30 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#d4af37] via-[#f4e4bc] to-[#d4af37]" />
            <div
              ref={outputScrollRef}
              className="w-full min-h-[35vh] max-h-[35vh] p-6 overflow-y-auto"
            >
              {output ? (
                <>
                  <p
                    className="text-lg leading-relaxed break-words whitespace-pre-wrap"
                    style={{ fontFamily: "'Noto Sans Coptic', 'Inter', sans-serif" }}
                  >
                    {output}
                  </p>
                  {showNumberMessage && (
                    <p className="mt-4 text-sm text-[#f4e4bc]/60 italic border-t border-[#d4af37]/20 pt-3">
                      Note: The number of bars above each Coptic letter is indicated by the numbers
                      next to the letter (e.g., 1 indicates 1 bar, i.e., ⲁ̅, and so on).
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[#f4e4bc]/30 text-lg italic">
                  Your transliteration will appear here.
                </p>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="output-actions mt-8 flex flex-wrap justify-center gap-3">
            <Button
              onClick={handleCopy}
              disabled={!output}
              variant="outline"
              className="px-6 py-5 border-[#d4af37]/40 bg-[#0f1f3a]/50 hover:border-[#d4af37] hover:bg-[#d4af37]/10 text-[#f4e4bc] transition-all"
            >
              {copied ? <Check className="w-4 h-4 mr-2 text-[#d4af37]" /> : <Copy className="w-4 h-4 mr-2 text-[#d4af37]" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              onClick={handleSaveToHistory}
              disabled={!output}
              variant="outline"
              className="px-6 py-5 border-[#d4af37]/40 bg-[#0f1f3a]/50 hover:border-[#d4af37] hover:bg-[#d4af37]/10 text-[#f4e4bc] transition-all"
            >
              <Bookmark className="w-4 h-4 mr-2 text-[#d4af37]" />
              Save to History
            </Button>
            <Button
              onClick={() => inputRef.current?.scrollIntoView({ behavior: 'smooth' })}
              variant="outline"
              className="px-6 py-5 border-[#d4af37]/40 bg-[#0f1f3a]/50 hover:border-[#d4af37] hover:bg-[#d4af37]/10 text-[#f4e4bc] transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2 text-[#d4af37]" />
              Back to Edit
            </Button>
          </div>
        </div>
      </section>

      {/* Section 4: History */}
      <section
        ref={historySectionRef}
        className="relative py-20 px-4"
        style={{ zIndex: 40 }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="history-header flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <History className="w-8 h-8 text-[#d4af37]" />
              <div>
                <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-2 text-[#d4af37]">
                  Recent conversions
                </h2>
                <div className="w-24 h-0.5 bg-gradient-to-r from-[#d4af37] to-transparent" />
              </div>
            </div>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-2 text-sm text-[#f4e4bc]/60 hover:text-[#d4af37] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear history
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-16 bg-[#0f1f3a]/50 rounded-lg border border-[#d4af37]/20">
              <History className="w-12 h-12 mx-auto text-[#d4af37]/30 mb-4" />
              <p className="text-[#f4e4bc]/60">No history yet. Try transliterating a sentence.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-[#0f1f3a]/80 backdrop-blur-sm rounded-lg shadow-lg border border-[#d4af37]/20 p-5 hover:border-[#d4af37]/40 hover:shadow-xl transition-all"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-[#0a1628] rounded text-xs text-[#d4af37] border border-[#d4af37]/30">
                      {item.mode}
                    </span>
                    <span className="text-xs text-[#f4e4bc]/40">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 items-center">
                    <div>
                      <p className="text-sm text-[#f4e4bc]/50 mb-1">Input:</p>
                      <p className="text-[#f4e4bc]">{item.input}</p>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-[#f4e4bc]/50 mb-1">Output:</p>
                        <p
                          className="text-lg text-[#d4af37]"
                          style={{ fontFamily: "'Noto Sans Coptic', sans-serif" }}
                        >
                          {item.output}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyFromHistory(item.output)}
                          className="p-2 hover:bg-[#d4af37]/10 rounded-md transition-colors"
                          title="Copy output"
                        >
                          <Copy className="w-4 h-4 text-[#d4af37]" />
                        </button>
                        <button
                          onClick={() => handleDeleteHistoryItem(item.id)}
                          className="p-2 hover:bg-red-500/10 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-[#f4e4bc]/60 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 5: Footer / Key Map */}
      <footer ref={footerRef} className="relative py-20 px-4 bg-[#0a1628] border-t border-[#d4af37]/20" style={{ zIndex: 50 }}>
        {/* Decorative patterns */}
        <MalayPattern className="absolute top-10 left-10 w-24 h-24 text-[#d4af37] opacity-10" />
        <CopticCross className="absolute top-10 right-10 w-20 h-20 text-[#d4af37] opacity-10" />
        
        <div className="max-w-4xl mx-auto relative">
          <div className="keymap-panel bg-[#0f1f3a] rounded-lg p-8 mb-12 border-2 border-[#d4af37]/30">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-[#d4af37]" />
              <h2 className="font-serif text-3xl font-semibold text-[#d4af37]">Key Map</h2>
            </div>
            <p className="text-[#f4e4bc]/60 mb-6">Malay letters → Coptic symbols</p>

            {/* Single character mappings */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-[#d4af37] mb-3 uppercase tracking-wider">
                Single Characters
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {keyMapping.map(({ key, value }) => (
                  <div
                    key={key}
                    className="flex flex-col items-center p-3 bg-[#0a1628] rounded-md border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-colors"
                  >
                    <span className="text-lg font-medium text-[#f4e4bc]">{key}</span>
                    <span className="text-xl text-[#d4af37]" style={{ fontFamily: "'Noto Sans Coptic', sans-serif" }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Multi-character mappings */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-[#d4af37] mb-3 uppercase tracking-wider">
                Multi-Character (High-Class only)
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {multiCharMapping.map(({ key, value }) => (
                  <div
                    key={key}
                    className="flex flex-col items-center p-3 bg-[#0a1628] rounded-md border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-colors"
                  >
                    <span className="text-lg font-medium text-[#f4e4bc]">{key}</span>
                    <span className="text-xl text-[#d4af37]" style={{ fontFamily: "'Noto Sans Coptic', sans-serif" }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dictionary entries */}
            <div>
              <h3 className="text-sm font-medium text-[#d4af37] mb-3 uppercase tracking-wider">
                Special Dictionary Entries
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {dictionaryEntries.map(({ key, value }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-[#0a1628] rounded-md border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-colors"
                  >
                    <span className="text-lg font-medium text-[#f4e4bc]">{key}</span>
                    <span className="text-xl text-[#d4af37]" style={{ fontFamily: "'Noto Sans Coptic', sans-serif" }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-[#f4e4bc]/40">
            <p className="flex items-center justify-center gap-2">
              <MalayPattern className="w-4 h-4 text-[#d4af37]" />
              Built with React + GSAP + Tailwind CSS
              <CopticCross className="w-4 h-4 text-[#d4af37]" />
            </p>
            <p className="mt-2 text-[#d4af37]">MRCS Transliterator Pro</p>
          </div>
        </div>
      </footer>

      {/* Key Map Slide-out Panel */}
      {showKeyMap && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowKeyMap(false)}
          />
          <div className="w-full max-w-2xl bg-[#0a1628] h-full overflow-auto shadow-2xl border-l border-[#d4af37]/30">
            <div className="sticky top-0 bg-[#0a1628] border-b border-[#d4af37]/30 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-[#d4af37]" />
                <h2 className="font-serif text-2xl font-semibold text-[#d4af37]">Key Map</h2>
              </div>
              <button
                onClick={() => setShowKeyMap(false)}
                className="p-2 hover:bg-[#d4af37]/10 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-[#f4e4bc]" />
              </button>
            </div>
            <div className="p-6">
              {/* Single character mappings */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-[#d4af37] mb-3 uppercase tracking-wider">
                  Single Characters
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {keyMapping.map(({ key, value }) => (
                    <div
                      key={key}
                      className="flex flex-col items-center p-3 bg-[#0f1f3a] rounded-md border border-[#d4af37]/20"
                    >
                      <span className="text-lg font-medium text-[#f4e4bc]">{key}</span>
                      <span
                        className="text-2xl text-[#d4af37]"
                        style={{ fontFamily: "'Noto Sans Coptic', sans-serif" }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-character mappings */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-[#d4af37] mb-3 uppercase tracking-wider">
                  Multi-Character (High-Class only)
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {multiCharMapping.map(({ key, value }) => (
                    <div
                      key={key}
                      className="flex flex-col items-center p-3 bg-[#0f1f3a] rounded-md border border-[#d4af37]/20"
                    >
                      <span className="text-lg font-medium text-[#f4e4bc]">{key}</span>
                      <span
                        className="text-2xl text-[#d4af37]"
                        style={{ fontFamily: "'Noto Sans Coptic', sans-serif" }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dictionary entries */}
              <div>
                <h3 className="text-sm font-medium text-[#d4af37] mb-3 uppercase tracking-wider">
                  Special Dictionary Entries
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dictionaryEntries.map(({ key, value }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 bg-[#0f1f3a] rounded-md border border-[#d4af37]/20"
                    >
                      <span className="text-lg font-medium text-[#f4e4bc]">{key}</span>
                      <span
                        className="text-2xl text-[#d4af37]"
                        style={{ fontFamily: "'Noto Sans Coptic', sans-serif" }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
