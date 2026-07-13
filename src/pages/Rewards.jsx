import React, { useState, useEffect, useLayoutEffect, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { ShieldCheck, Copy, AlertCircle, ArrowLeft, Users, Coins, TrendingUp, Layers, Cpu } from "lucide-react";

// --- ULTRA-LIGHTWEIGHT THREE.JS DUAL-DRIFT REWARDS DUST FIELD ---
function FloatingRewardsDust() {
  const upwardDustRef = useRef();
  const downwardSnowRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Tiny, sharp crystalline dust matrices floating gently upwards
    if (upwardDustRef.current) {
      const upwardPositions = upwardDustRef.current.geometry.attributes.position.array;
      for (let i = 1; i < upwardPositions.length; i += 3) {
        upwardPositions[i] += 0.012; // Slow upwards drift
        if (upwardPositions[i] > 15) upwardPositions[i] = -15; // Loop back at top boundary
      }
      upwardDustRef.current.geometry.attributes.position.needsUpdate = true;
      upwardDustRef.current.rotation.y = time * 0.02;
    }

    // Little silver dropping snow matrices wandering slowly downwards
    if (downwardSnowRef.current) {
      const downwardPositions = downwardSnowRef.current.geometry.attributes.position.array;
      for (let i = 1; i < downwardPositions.length; i += 3) {
        downwardPositions[i] -= 0.008; // Calm downwards fall
        if (downwardPositions[i] < -15) downwardPositions[i] = 15; // Loop back at bottom boundary
      }
      downwardSnowRef.current.geometry.attributes.position.needsUpdate = true;
      downwardSnowRef.current.rotation.y = -time * 0.015;
    }
  });

  // Dynamic particle scaling for zero desktop or mobile lagging
  const isMobile = window.innerWidth < 1024;
  const upwardCount = isMobile ? 25 : 65;
  const downwardCount = isMobile ? 15 : 35;

  const [upwardGeo] = useState(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(upwardCount * 3);
    for (let i = 0; i < upwardCount * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 25;
      pos[i + 1] = (Math.random() - 0.5) * 30;
      pos[i + 2] = (Math.random() - 0.5) * 15;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  });

  const [downwardGeo] = useState(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(downwardCount * 3);
    for (let i = 0; i < downwardCount * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 25;
      pos[i + 1] = (Math.random() - 0.5) * 30;
      pos[i + 2] = (Math.random() - 0.5) * 15;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  });

  return (
    <group>
      {/* Sharp Crystalline Upward Points Matrix */}
      <points ref={upwardDustRef} geometry={upwardGeo}>
        <pointsMaterial color="#e2e8f0" size={isMobile ? 0.08 : 0.05} transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </points>
      {/* Soft Silver Downward Dropping Snow Matrix */}
      <points ref={downwardSnowRef} geometry={downwardGeo}>
        <pointsMaterial color="#94a3b8" size={isMobile ? 0.12 : 0.08} transparent opacity={0.25} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

const Rewards = ({ onBack }) => {
  const containerRef = useRef(null);
  const [maintenanceActive, setMaintenanceActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [floatingIcons, setFloatingIcons] = useState([]);

  // --- ARRANGE 20 FLOATING SILVER LAYOUT ICONS ---
  useEffect(() => {
    const iconTypes = [Coins, TrendingUp, Layers, Cpu];
    const generated = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      Type: iconTypes[i % iconTypes.length],
      top: Math.random() * 90 + 5,
      left: Math.random() * 90 + 5,
      scale: Math.random() * 0.3 + 0.5, 
      duration: Math.random() * 15 + 15,
      delay: Math.random() * -20
    }));
    setFloatingIcons(generated);
  }, []);

  // --- ACCELERATED GSAP TIMELINE REVEAL ---
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from("[data-animate-reward]", {
        opacity: 0,
        y: 25,
        duration: 1.1,
        stagger: 0.12,
        ease: "power4.out",
        clearProps: "all"
      });
      
      gsap.from("[data-animate-icon]", {
        opacity: 0,
        scale: 0,
        duration: 1.5,
        stagger: 0.05,
        ease: "power2.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("ESTRA-773X");
    setCopied(true);
    setMaintenanceActive(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleInviteClick = () => {
    setMaintenanceActive(true);
  };

  return (
    <div 
      ref={containerRef}
      className="w-full min-h-screen h-auto bg-[#010204] text-white relative flex flex-col items-center font-sans select-none overflow-y-visible overflow-x-hidden p-6 sm:p-12"
    >
      
      {/* INTERACTIVE WEIGHTLESS 3D SYSTEM LAYER */}
      <div className="fixed inset-0 pointer-events-none z-10 block">
        <Canvas camera={{ position: [0, 0, 8] }} dpr={[1, 1.5]}>
          <Suspense fallback={null}>
            <FloatingRewardsDust />
          </Suspense>
        </Canvas>
      </div>

      {/* 20 FLOATING GEOMETRIC SILVER ICONS SCATTERED EVERYWHERE */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {floatingIcons.map((item) => {
          const IconComponent = item.Type;
          return (
            <div
              key={item.id}
              data-animate-icon
              className="absolute text-neutral-600/20 animate-pulse pointer-events-none"
              style={{
                top: `${item.top}%`,
                left: `${item.left}%`,
                transform: `scale(${item.scale})`,
                animationDuration: `${item.duration / 3}s`
              }}
            >
              <IconComponent size={28} />
            </div>
          );
        })}
      </div>

      {/* MINIMAL ATMOSPHERIC COBALT AURA CORE */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(10,35,80,0.12)_0%,rgba(1,2,4,1)_70%)] pointer-events-none z-0" />

      {/* SECURE BLOCK WRAPPER */}
      <div className="w-full max-w-4xl z-20 flex flex-col h-full relative">
        
        {/* HEADER SECTION PANEL */}
        <header data-animate-reward className="w-full flex justify-between items-center mb-12 shrink-0">
          <button 
            onClick={onBack} 
            aria-label="Go back"
            className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all duration-300 group backdrop-blur-md cursor-pointer focus:outline-none"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
          </button>
          <span className="text-[10px] font-mono tracking-[0.4em] text-white/40 uppercase">
            Estra // Rewards Portal
          </span>
        </header>

        {/* SYSTEM INLINE FINE-BORDERED MAINTENANCE NOTICE */}
        {maintenanceActive && (
          <div className="w-full bg-[#05070a] border border-[#121824] rounded-2xl p-4 mb-8 flex items-center gap-4 animate-fadeIn shadow-2xl z-30">
            <AlertCircle size={18} className="text-neutral-500 shrink-0" />
            <div className="text-left">
              <span className="block text-[9px] font-mono tracking-widest text-neutral-500 uppercase mb-0.5">System Status</span>
              <p className="text-xs sm:text-sm text-neutral-300 font-medium">
                Referral system optimization underway. Invitation settings are currently active in system updates mode.
              </p>
            </div>
          </div>
        )}

        {/* CENTRAL MILESTONE DISPLAY PANEL */}
        <div className="w-full flex flex-col items-center text-center my-auto py-6 shrink-0">
          
          <div data-animate-reward className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center text-neutral-400 mb-6 shadow-inner">
            <ShieldCheck size={22} />
          </div>

          <h1 data-animate-reward className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-2 text-white">
            Wow! That's a new record!
          </h1>
          <p data-animate-reward className="text-xs sm:text-sm text-neutral-400 uppercase tracking-[0.2em] font-mono mb-6">
            Sign-up Reward Credit
          </p>

          {/* MASSIVE PREMIUM BALANCE TYPOGRAPHY DISPLAY */}
          <div data-animate-reward className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter bg-gradient-to-b from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent mb-12 drop-shadow-[0_2px_15px_rgba(255,255,255,0.05)]">
            $1000.00
          </div>

          {/* REAL BANKING SYSTEM LEDGER TABLE BLOCK */}
          <div data-animate-reward className="w-full max-w-xl bg-[#04060b]/40 border border-white/[0.04] rounded-2xl p-5 mb-8 text-left space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex justify-between items-center border-b border-white/[0.04] pb-3">
              <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Transaction Type</span>
              <span className="text-xs sm:text-sm font-semibold text-neutral-200">Welcome Bonus Credit</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/[0.04] pb-3">
              <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Availability Status</span>
              <span className="text-xs sm:text-sm font-semibold text-neutral-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" /> Settled // Available
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Unique Reward Code</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-neutral-300">ESTRA-773X</span>
                <button 
                  onClick={handleCopyLink}
                  className="p-1 hover:bg-white/10 rounded transition-colors text-neutral-500 hover:text-white cursor-pointer"
                  title="Copy referral code"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* REFERRAL ACTIVE DATABASE TRACKING HUB */}
          <div data-animate-reward className="w-full max-w-xl text-left border-t border-white/[0.02] pt-8 mb-12">
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-500 mb-4">
              Active Referrals (0)
            </h2>
            <div className="w-full p-6 border border-dashed border-white/[0.04] rounded-2xl text-center text-xs sm:text-sm text-neutral-500 flex flex-col items-center justify-center gap-2">
              <Users size={18} className="text-neutral-600" />
              <span>Your referral history is completely clear. Invite your friends to start earning bonus credit.</span>
            </div>
          </div>

          {/* DUAL CORE CONTROLS SYSTEM */}
          <div data-animate-reward className="w-full max-w-md flex flex-col sm:flex-row gap-4 justify-center items-center">
            
            {/* VIRAL ENGAGEMENT ACTION BUTTON */}
            <button
              onClick={handleInviteClick}
              className="w-full py-4.5 bg-[#05070a] border border-[#121824] hover:border-neutral-700 rounded-full transition-all duration-300 cursor-pointer text-xs font-bold uppercase tracking-[0.2em] text-[#d1d5db] hover:text-white shadow-2xl active:scale-[0.98]"
            >
              Invite a friend
            </button>

            {/* DIRECT ACTION PORTAL RETURN ANCHOR */}
            <button
              onClick={onBack}
              className="w-full py-4.5 bg-transparent border border-white/10 hover:border-white/30 rounded-full transition-all duration-300 cursor-pointer text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-white active:scale-[0.98]"
            >
              Go to Dashboard
            </button>

          </div>

          {/* SYSTEM SECURITIES FOOTER STAMP */}
          <p data-animate-reward className="text-[9px] font-mono text-white/20 tracking-widest uppercase mt-12">
            Bonus balance is immediately active for internal account operations and balance calculations.
          </p>

        </div>

        {/* ACCOUNT IDENTITY FOOTER */}
        <footer className="w-full flex flex-col sm:flex-row justify-between items-center gap-2 text-[9px] font-mono text-white/10 tracking-[0.3em] uppercase mt-16 pt-8 border-t border-white/[0.02] shrink-0">
          <div>Security System // Account Rewards</div>
          <div>ESTRA PLATFORMS © 2026</div>
        </footer>

      </div>
    </div>
  );
};

export default Rewards;
