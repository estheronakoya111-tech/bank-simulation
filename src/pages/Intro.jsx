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
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 pointer-events-none"
      >
        <source src={introVideo} type="video/mp4" />
        <source src="/src/assets/Intro.mp4" type="video/mp4" />
      </video>

      {/* THE BRUTALIST VEIL */}
      <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,35,80,0.15)_0%,rgba(1,2,4,0.8)_80%)] z-10 pointer-events-none" />

      {/* TOP LINE BRAND FRAME BLOCK */}
      <header data-animate-frame className="w-full flex justify-between items-center z-20 shrink-0">
        <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-neutral-300">
          Estra Financial
        </span>
        <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
          System Active
        </span>
      </header>

      {/* CENTRAL MINIMALIST MESSAGE SUITE */}
      <div className="z-20 text-center max-w-5xl mx-auto my-auto flex flex-col items-center justify-center">
        
        {/* SOPHISTICATED TITLES */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight uppercase mb-4 leading-[1.1]">
          <span data-animate-text className="bg-gradient-to-b from-slate-200 to-white bg-clip-text text-transparent block">
            Banking Designed{" "}
          </span>
          <span data-animate-text className="bg-gradient-to-b from-slate-300 to-white bg-clip-text text-transparent block mt-1">
            For Your Future
          </span>
        </h1>

        {/* SUB-MANIFESTO CAPTION */}
        <p data-animate-text className="text-sm sm:text-base md:text-lg font-light tracking-wide text-neutral-300 mt-2">
          Secure, simple, and tailored to you.
        </p>

      </div>

      {/* FOOTER NAV INTERACTIVE MODULE */}
      <footer data-animate-frame className="w-full z-20 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
        
        {/* SHARP VISIBLE DISCLAIMER */}
        <div className="max-w-md text-left">
          <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-[0.1em] border-l-2 border-neutral-800 pl-4">
            Disclaimer: This platform is for demonstration purposes only. It is not affiliated with any real financial institution.
          </p>
        </div>
        
        {/* CUSTOM ROUNDED BUTTON */}
        <button
          onClick={onFinish}
          className="group flex items-center justify-between gap-8 pl-8 pr-4 py-4 bg-white hover:bg-neutral-200 rounded-full transition-all duration-300 cursor-pointer active:scale-[0.98] shadow-2xl"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-black">
            Get Started
          </span>
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white transition-transform duration-300 group-hover:rotate-45">
            <ArrowUpRight size={14} />
          </div>
        </button>

      </footer>

    </div>
  );
};

export default Intro;
