import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowLeft, Copy, Check, Landmark, Wallet, QrCode, ArrowDownToLine, ShieldCheck } from "lucide-react";

const Deposit = ({ onBack }) => {
  const containerRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [floatingIcons, setFloatingIcons] = useState([]);

  // --- NATIVE PROFILE PERSISTENCE STORAGE STRINGS ---
  const username = sessionStorage.getItem("estra_username") || "Valued Account Owner";
  const accountNumber = sessionStorage.getItem("estra_acc_num") || "8823091104";

  // --- ARRANGE 20 FLOATING SILVER LAYOUT ICONS ---
  useEffect(() => {
    const iconTypes = [Landmark, Wallet, QrCode, ArrowDownToLine];
    const generated = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      Type: iconTypes[i % iconTypes.length],
      top: Math.random() * 90 + 5,
      left: Math.random() * 90 + 5,
      scale: Math.random() * 0.3 + 0.5, // Subtle sizing matrix
      duration: Math.random() * 15 + 15,
      delay: Math.random() * -20
    }));
    setFloatingIcons(generated);
  }, []);

  // --- ULTRA-LIGHTWEIGHT ACCELERATED GSAP ENTRANCE ---
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from("[data-animate-deposit]", {
        opacity: 0,
        y: 25,
        duration: 1,
        stagger: 0.12,
        ease: "power4.out",
        clearProps: "all"
      });

      gsap.from("[data-animate-icon]", {
        opacity: 0,
        scale: 0,
        duration: 1.4,
        stagger: 0.04,
        ease: "power2.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to map string value to native system clip matrix.", err);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full min-h-screen h-auto bg-[#010204] text-white relative flex flex-col items-center font-sans select-none overflow-y-visible overflow-x-hidden p-6 sm:p-12"
    >
      
      {/* 20 FLOATING GEOMETRIC SILVER ICONS SCATTERED EVERYWHERE */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {floatingIcons.map((item) => {
          const IconComponent = item.Type;
          return (
            <div
              key={item.id}
              data-animate-icon
              className="absolute text-neutral-600/15 animate-pulse pointer-events-none"
              style={{
                top: `${item.top}%`,
                left: `${item.left}%`,
                transform: `scale(${item.scale})`,
                animationDuration: `${item.duration / 3}s`
              }}
            >
              <IconComponent size={26} />
            </div>
          );
        })}
      </div>

      {/* MINIMAL ATMOSPHERIC COBALT AURA CORE */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(10,35,80,0.12)_0%,rgba(1,2,4,1)_70%)] pointer-events-none z-0" />

      {/* SECURE OPEN FRAMEWORK CONTAINER */}
      <div className="w-full max-w-4xl z-10 flex flex-col h-full relative">
        
        {/* HEADER SECTION TERMINAL BAR */}
        <header data-animate-deposit className="w-full flex justify-between items-center mb-16 shrink-0">
          <button 
            onClick={onBack} 
            aria-label="Go back to dashboard"
            className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all duration-300 group backdrop-blur-md cursor-pointer focus:outline-none"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
          </button>
          <span className="text-[10px] font-mono tracking-[0.4em] text-white/40 uppercase">
            Estra // Deposit Protocol
          </span>
        </header>

        {/* CENTRAL SPREAD INTENT PANEL (Zero clutter, wide spacing framework) */}
        <div className="w-full flex flex-col items-center text-center my-auto py-4 shrink-0">
          
          <div data-animate-deposit className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center text-neutral-400 mb-6 shadow-inner">
            <ArrowDownToLine size={22} className="animate-pulse" />
          </div>

          <h1 data-animate-deposit className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3 text-white">
            Inbound Account Routing
          </h1>
          
          <p data-animate-deposit className="text-xs sm:text-sm text-neutral-400 uppercase tracking-[0.2em] font-mono mb-16">
            ESTRA Bank Wire Network Logs
          </p>

          {/* SPREAD STRUCTURAL ROWS MATRIX (Completely open architecture) */}
          <div className="w-full max-w-xl text-left space-y-10 mb-16">
            
            {/* ROW 1: USER IDENTIFIER OVERLAY */}
            <div data-animate-deposit className="w-full border-b border-white/[0.05] pb-6 flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
                Beneficiary Owner
              </span>
              <span className="text-xl sm:text-2xl font-bold text-neutral-200 tracking-wide">
                {username}
              </span>
            </div>

            {/* ROW 2: MASSIVE CLIPBOARD VALUE COMPONENT */}
            <div data-animate-deposit className="w-full border-b border-white/[0.05] pb-6 flex flex-col gap-2 relative group/copy">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
                Account Routing Number
              </span>
              
              <div className="flex items-center justify-between gap-6 mt-1">
                <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-[0.15em]">
                  {accountNumber}
                </span>

                {/* SHARP ACCENT REVENUE ACTION ANCHOR */}
                <button
                  onClick={handleCopyClipboard}
                  className={`p-3 rounded-xl border transition-all duration-300 active:scale-95 cursor-pointer flex items-center justify-center shrink-0 ${
                    copied 
                      ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                      : "bg-[#05070a] border-[#121824] hover:border-neutral-700 text-neutral-400 hover:text-white"
                  }`}
                  title="Copy Account Code"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

              {/* FLOATING CLIPBOARD VERIFICATION BANNER */}
              {copied && (
                <span className="absolute right-16 top-0 text-[9px] font-mono tracking-widest uppercase text-neutral-300 animate-fadeIn">
                  // Copied Securely
                </span>
              )}
            </div>

          </div>

          {/* ACCORDION BOTTOM SAFETY CARD ELEMENT */}
          <div data-animate-deposit className="w-full max-w-xl text-left border border-dashed border-white/[0.04] rounded-2xl p-5 flex items-start gap-4 bg-[#04060b]/20 shadow-sm">
            <ShieldCheck size={18} className="text-neutral-500 shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-400 leading-relaxed">
              Deposits routed through this standard ledger channel settle automatically. Wire transfers execute securely via local clearing protocols across core asset layers.
            </p>
          </div>

          {/* BACK TO CONSOLE CONTROL BUTTON */}
          <div data-animate-deposit className="w-full max-w-xs mt-12">
            <button
              onClick={onBack}
              className="w-full py-4.5 bg-[#05070a] border border-[#121824] hover:border-neutral-700 rounded-full transition-all duration-300 cursor-pointer text-xs font-bold uppercase tracking-[0.2em] text-[#d1d5db] hover:text-white shadow-2xl active:scale-[0.98]"
            >
              Return to Dashboard
            </button>
          </div>

        </div>

        {/* SYSTEM AUDIT FOOTER METRICS */}
        <footer className="w-full flex flex-col sm:flex-row justify-between items-center gap-2 text-[9px] font-mono text-white/10 tracking-[0.3em] uppercase mt-24 pt-8 border-t border-white/[0.02] shrink-0">
          <div>SYS_AUTH // DEPOSIT_ROUTER</div>
          <div>ESTRA PLATFORMS © 2026</div>
        </footer>

      </div>
    </div>
  );
};

export default Deposit;