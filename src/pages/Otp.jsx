import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowLeft, KeyRound, Clock, ShieldCheck } from "lucide-react";

const Otp = ({ username, onAuthSuccess, onBack }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(300);
  const [statusMsg, setStatusMsg] = useState("");
  const inputRefs = useRef([]);
  const containerRef = useRef(null);
  const bgRef = useRef(null);

  // --- HARDWARE PROTECTED METRIC BACKGROUND ENGINE (60 DUST LOOPS) ---
  useEffect(() => {
    gsap.fromTo("[data-animate-otp]", {
      opacity: 0,
      y: 20
    }, {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out"
    });

    const canvas = bgRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    let particles = [];
    const particleCount = 60; 

    const resize = () => { 
      if (canvas) {
        canvas.width = window.innerWidth; 
        canvas.height = window.innerHeight;
      }
    };

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.size = Math.random() * 1.5 + 0.5; 
        this.speedY = -(Math.random() * 0.15 + 0.05); 
        this.opacity = Math.random() * 0.25 + 0.05;
      }
      update() {
        this.y += this.speedY;
        if (this.y < -10) this.reset();
      }
      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(163, 163, 163, ${this.opacity})`; 
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    let animationId;
    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    resize();
    animate();
    
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    if (otp.every(digit => digit !== "") && statusMsg !== "SYNCHRONIZING...") {
      handleVerify();
    }
  }, [otp]);

  // --- BACKEND LOGIC (OPTIMIZED) ---
  const handleVerify = async () => {
    const otpCode = otp.join("");
    setStatusMsg("SYNCHRONIZING...");
    try {
      const response = await fetch(`${import.meta.env.VITE_BANK_BACKEND_URL}/verify`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code: otpCode }), 
      });
      const data = await response.json();
      if (response.ok) {
        setStatusMsg("ACCESS GRANTED.");
        
        // FIXED: Strips any unwanted stringified quotation marks from the token 
        // string before passing it up to App.jsx to prevent 422 errors on /history.
        const cleanToken = data.token.replace(/^"|"$/g, '');

        // SAFETY FALLBACK: Capture the profile access claims if provided directly by response
        const userRole = data.role || (username.toLowerCase().includes("admin") ? "admin" : "user");
        sessionStorage.setItem('estra_role', userRole);

        setTimeout(() => {
          onAuthSuccess({ 
            username, 
            token: cleanToken, 
            account_number: data.account_number,
            role: userRole
          });
        }, 1200);
      } else {
        setStatusMsg(data.message ? data.message.toUpperCase() : "VERIFICATION FAILED"); 
        setOtp(new Array(6).fill(""));
        if(inputRefs.current[0]) inputRefs.current[0].focus();
      }
    } catch (error) {
      setStatusMsg("CONNECTION FAILED.");
    }
  };

  const handleChange = (element, index) => {
    const value = element.value.replace(/[^0-9]/g, ""); 
    if (!value && element.value !== "") return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); 
    setOtp(newOtp);
    if (value && index < 5) { inputRefs.current[index + 1].focus(); }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\s/g, '').slice(0, 6).split("");
    const newOtp = [...otp];
    pasteData.forEach((char, index) => { if (index < 6 && !isNaN(char)) { newOtp[index] = char; } });
    setOtp(newOtp);
    const nextIndex = pasteData.length >= 6 ? 5 : pasteData.length;
    if(inputRefs.current[nextIndex]) inputRefs.current[nextIndex].focus();
  };

  const handleNextInput = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) { 
      inputRefs.current[index - 1].focus(); 
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full min-h-screen bg-[#010204] text-white relative flex flex-col justify-between p-6 sm:p-12 md:p-16 select-none overflow-hidden font-sans"
    >
      <canvas ref={bgRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(10,35,80,0.15)_0%,rgba(1,2,4,1)_75%)] pointer-events-none z-0" />

      <header data-animate-otp className="w-full flex justify-between items-center z-10 shrink-0">
        <button 
          onClick={onBack} 
          aria-label="Return to login layout"
          className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all duration-300 group backdrop-blur-md cursor-pointer focus:outline-none"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
        </button>
        <span className="text-[10px] font-mono tracking-[0.4em] text-white/40 uppercase">
          Estra // Secure Gate
        </span>
      </header>

      <div className="w-full max-w-2xl mx-auto my-auto z-10 flex flex-col items-center text-center py-8 shrink-0">
        <div data-animate-otp className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center text-neutral-400 mb-8">
          <KeyRound size={20} className="animate-pulse" />
        </div>

        <h1 data-animate-otp className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3 text-white">
          Verification Required
        </h1>
        
        <p data-animate-otp className="text-xs sm:text-sm font-mono tracking-wider text-neutral-500 uppercase max-w-md leading-relaxed mb-12">
          A security protocol code has been routed to your Gmail instance for validation.
        </p>

        {statusMsg && (
          <div data-animate-otp className="mb-6 text-[10px] font-mono tracking-[0.3em] bg-white/[0.02] border border-white/5 px-4 py-2 rounded-full text-blue-400 animate-pulse uppercase">
            // {statusMsg}
          </div>
        )}

        <div data-animate-otp className="flex justify-center gap-3 sm:gap-4 mb-12 relative w-full">
          {otp.map((data, index) => (
            <input 
              key={index} 
              ref={(el) => (inputRefs.current[index] = el)} 
              type="text" 
              maxLength="1" 
              value={data} 
              onPaste={handlePaste} 
              onChange={(e) => handleChange(e.target, index)} 
              onKeyDown={(e) => handleNextInput(e, index)}
              className="w-11 h-16 sm:w-16 sm:h-24 bg-[#05070a]/60 border border-white/10 text-white text-3xl sm:text-5xl font-light text-center focus:border-neutral-400 focus:bg-[#070913] outline-none transition-all duration-300 rounded-2xl font-mono shadow-2xl backdrop-blur-md"
            />
          ))}
        </div>

        <div data-animate-otp className="w-full max-w-md flex flex-col gap-3 border-t border-white/[0.03] pt-8">
          <div className="h-[2px] w-full bg-white/[0.03] relative overflow-hidden rounded-full">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-neutral-400 shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
              style={{ width: `${(timer / 300) * 100}%`, transition: 'width 1s linear' }} 
            />
          </div>
          
          <div className="flex justify-between w-full text-[9px] font-mono tracking-widest uppercase text-neutral-500">
            <span className="flex items-center gap-1.5"><Clock size={10} /> Syncing Window</span>
            <span className="text-neutral-300 font-bold">{Math.floor(timer/60)}:{(timer%60).toString().padStart(2,'0')}</span>
          </div>
        </div>

        <div data-animate-otp className="mt-12 text-[10px] font-mono text-neutral-600 flex items-center gap-2">
          <ShieldCheck size={12} />
          <span>Active Identity Scope: {username}</span>
        </div>
      </div>

      <footer className="w-full flex flex-col sm:flex-row justify-between items-center gap-2 text-[9px] font-mono text-white/10 tracking-[0.3em] uppercase mt-auto shrink-0 pt-4 border-t border-white/[0.01]">
        <div>SYS_AUTH // VERIFICATION_NODE</div>
        <div>ESTRA CONSOLE SYSTEMS © 2026</div>
      </footer>
    </div>
  );
};

export default Otp;