import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import introVideo from '../assets/Intro.mp4';

const Intro = ({ onFinish }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  // Force video execution to bypass strict browser media-blocking engines
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Video auto-play context prevented. Retrying...", error);
          setTimeout(() => {
            videoRef.current?.play();
          }, 100);
        });
      }
    }
  }, []);

  // --- GSAP STREAMLINED CINEMATIC ENTRANCE ---
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Smooth fade and slight slide up for headers and text blocks
      gsap.from("[data-animate-text]", {
        opacity: 0,
        y: 30,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out"
      });

      // Smooth fade in for structural frame pieces
      gsap.from("[data-animate-frame]", {
        opacity: 0,
        duration: 1,
        ease: "linear",
        delay: 0.4
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-screen bg-[#010204] text-white relative overflow-hidden font-sans select-none flex flex-col justify-between p-8 sm:p-12 md:p-16"
    >
      
      {/* HARDWARE-ACCELERATED VIDEO BACKDROP (Zero lag optimization) */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-50 pointer-events-none"
      >
        <source src={introVideo} type="video/mp4" />
        <source src="/src/assets/Intro.mp4" type="video/mp4" />
      </video>

      {/* THE BRUTALIST VEIL */}
      <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,35,80,0.2)_0%,rgba(1,2,4,0.7)_80%)] z-10 pointer-events-none" />

      {/* TOP LINE BRAND FRAME BLOCK */}
      <header data-animate-frame className="w-full flex justify-between items-center z-20 shrink-0">
        <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-neutral-400">
          ESTRA // NET
        </span>
        <span className="text-[9px] font-mono tracking-widest text-neutral-600 uppercase">
          SYS_READY
        </span>
      </header>

      {/* CENTRAL MINIMALIST MESSAGE SUITE - CENTER OF ATTRACTION LAYOUT */}
      <div className="z-20 text-center max-w-5xl mx-auto my-auto flex flex-col items-center justify-center">
        
        {/* BIGGER WHITE AND CRISP CHROMIUM SILVER-BLACK MIXED HIGH-END TITLES */}
        <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter uppercase mb-2 leading-[0.92]">
          <span data-animate-text className="bg-gradient-to-b from-white to-neutral-300 bg-clip-text text-transparent block">
            WELCOME TO{" "}
          </span>
          <span data-animate-text className="bg-gradient-to-b from-neutral-100 via-white to-neutral-800 bg-clip-text text-transparent block mt-1 filter drop-shadow-[0_4px_30px_rgba(255,255,255,0.08)]">
            ESTRA BANKING
          </span>
        </h1>

        {/* SUB-MANIFESTO CAPTION - POSITIONED MUCH CLOSER WITH PERFECT CAPS SPECIFICATION */}
        <p data-animate-text className="text-base sm:text-lg md:text-xl font-serif italic tracking-wide text-neutral-400 mt-1">
          Redefining Financial Flow
        </p>

      </div>

      {/* FOOTER NAV INTERACTIVE MODULE */}
      <footer data-animate-frame className="w-full z-20 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
        
        {/* SHARP VISIBLE DISCLAIMER */}
        <div className="max-w-md text-left">
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.1em] border-l-2 border-neutral-700 pl-4">
            Disclaimer: This is a student project simulation. No real money or financial services are provided. Not affiliated with any real financial institution.
          </p>
        </div>
        
        {/* CUSTOM ROUNDED BUTTON */}
        <button
          onClick={onFinish}
          className="group flex items-center justify-between gap-8 pl-6 pr-4 py-4 bg-[#05070a] border border-[#121824] hover:border-neutral-700 rounded-full transition-all duration-300 cursor-pointer active:scale-[0.98] shadow-2xl"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#d1d5db] group-hover:text-white transition-colors">
            Get Started
          </span>
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black transition-transform duration-300 group-hover:rotate-45 group-hover:bg-blue-600 group-hover:text-white">
            <ArrowUpRight size={14} />
          </div>
        </button>

      </footer>

    </div>
  );
};

export default Intro;
