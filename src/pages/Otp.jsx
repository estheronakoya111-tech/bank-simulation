import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowLeft, KeyRound, Clock, ShieldCheck } from "lucide-react";

const Otp = ({ username, onAuthSuccess, onBack, userEmail }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(300); // 5-minute initial code expiration
  const [resendCooldown, setResendCooldown] = useState(0); // 30-second rate limiter tracking
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

  // Main 5-minute countdown clock effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setStatusMsg("Code expired. Please request a new one.");
      setOtp(new Array(6).fill("")); // Clean old inputs so they don't trigger backend loops
    }
  }, [timer]);

  // Rate-limiting 30-second resend restriction tracker
  useEffect(() => {
    if (resendCooldown > 0) {
      const interval = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendCooldown]);

  useEffect(() => {
    // Only execute network verify if all fields are populated and timer is actively valid
    if (otp.every(digit => digit !== "") && statusMsg !== "Verifying Code..." && timer > 0) {
      handleVerify();
    }
  }, [otp]);

  // --- BACKEND LOGIC (OPTIMIZED) ---
  const handleVerify = async () => {
    const otpCode = otp.join("");
    setStatusMsg("Verifying Code...");
    try {
      const response = await fetch(`${import.meta.env.VITE_BANK_BACKEND_URL}/verify`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code: otpCode }), 
      });
      const data = await response.json();
      if (response.ok) {
        setStatusMsg("Login Successful!");
        
        // FIXED: Strips stringified quotes from the token payload to preserve dashboard sessions
        const cleanToken = data.token.replace(/^"|"$/g, '');
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
        setStatusMsg(data.message ? data.message : "Incorrect verification code."); 
        setOtp(new Array(6).fill(""));
        if(inputRefs.current[0]) inputRefs.current[0].focus();
      }
    } catch (error) {
      setStatusMsg("Connection failed. Check your network.");
    }
  };

  // --- HANDLER FOR RESENDING VERIFICATION CODE ---
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setStatusMsg("Sending new code...");
    
    try {
      // Pull backup registration parameters or username identities cleanly
      const targetEmail = userEmail || sessionStorage.getItem("pending_email") || username;
      const response = await fetch(`${import.meta.env.VITE_BANK_BACKEND_URL}/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }) 
      });
      
      const data = await response.json();
      if (response.ok) {
        setStatusMsg("A new code has been sent!");
        setTimer(300); // Reset primary countdown window
        setResendCooldown(30); // Impose 30-second server safety lock
        setOtp(new Array(6).fill(""));
        if(inputRefs.current[0]) inputRefs.current[0].focus();
      } else {
        setStatusMsg(data.message || "Failed to resend code.");
      }
    } catch (error) {
      setStatusMsg("Connection error. Could not request new code.");
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
          className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all duration-300 group backdrop-blur-md cursor-pointer focus:outline-none hover:scale-105"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
        </button>
        <span className="text-[10px] font-mono tracking-[0.4em] text-white/40 uppercase">
          Estra // Secure Gate
        </span>
      </header>

      <div className="w-full max-w-2xl mx-auto my-auto z-10 flex flex-col items-center text-center py-8 shrink-0">
        <div window-animate-otp="true" data-animate-otp className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center text-neutral-400 mb-8">
          <KeyRound size={20} className="animate-pulse" />
        </div>

        <h1 data-animate-otp className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3 text-white">
          Enter Security Code
        </h1>
        
        <p data-animate-otp className="text-sm tracking-wide text-neutral-400 max-w-md leading-relaxed mb-12 normal-case font-medium">
          A 6-digit verification code has been sent to your registered email address.
        </p>

        {statusMsg && (
          <div data-animate-otp className="mb-6 text-xs font-semibold bg-white/[0.02] border border-white/5 px-5 py-2.5 rounded-xl text-blue-400 animate-pulse normal-case">
            {statusMsg}
          </div>
        )}

        <div data-animate-otp className="flex justify-center gap-3 sm:gap-4 mb-8 relative w-full">
          {otp.map((data, index) => (
            <input 
              key={index} 
              ref={(el) => (inputRefs.current[index] = el)} 
              type="text" 
              maxLength="1" 
              value={data} 
              disabled={timer === 0}
              onPaste={handlePaste} 
              onChange={(e) => handleChange(e.target, index)} 
              onKeyDown={(e) => handleNextInput(e, index)}
              className="w-11 h-16 sm:w-16 sm:h-24 bg-[#05070a]/60 border border-white/10 text-white text-3xl sm:text-5xl font-light text-center focus:border-white/40 focus:bg-[#070913] outline-none transition-all duration-300 rounded-2xl font-mono shadow-2xl backdrop-blur-md disabled:opacity-30 disabled:cursor-not-allowed"
            />
          ))}
        </div>

        {/* RESEND CODE FALLBACK ACTION INTERACTIVE LINK */}
        <div data-animate-otp className="mb-10 text-center">
          <button
            type="button"
            disabled={resendCooldown > 0}
            onClick={handleResendOtp}
            className={`text-sm font-bold tracking-wide transition-all uppercase cursor-pointer ${
              resendCooldown > 0 
                ? "text-neutral-600 cursor-not-allowed" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            {resendCooldown > 0 ? `Resend Code in (${resendCooldown}s)` : "Didn't receive a code? Resend"}
          </button>
        </div>

        <div data-animate-otp className="w-full max-w-md flex flex-col gap-3 border-t border-white/[0.03] pt-8">
          <div className="h-[2px] w-full bg-white/[0.03] relative overflow-hidden rounded-full">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-neutral-400 shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
              style={{ width: `${(timer / 300) * 100}%`, transition: 'width 1s linear' }} 
            />
          </div>
          
          <div className="flex justify-between w-full text-xs font-semibold tracking-wide text-neutral-500">
            <span className="flex items-center gap-1.5"><Clock size={12} /> Code Expiration</span>
            <span className="text-neutral-300 font-bold">{Math.floor(timer/60)}:{(timer%60).toString().padStart(2,'0')}</span>
          </div>
        </div>

        <div data-animate-otp className="mt-12 text-xs text-neutral-500 flex items-center gap-2 font-medium">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Securing profile access for: {username}</span>
        </div>
      </div>

      <footer className="w-full flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-white/20 tracking-[0.20em] font-medium uppercase select-none mt-auto shrink-0 pt-4 border-t border-white/[0.01]">
        <div>ESTRA SECURITY TERMINAL</div>
        <div>ESTRA BANKING SYSTEMS © 2026</div>
      </footer>
    </div>
  );
};

export default Otp;
