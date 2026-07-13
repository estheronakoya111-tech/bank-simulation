import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import introVideo from '../assets/Intro.mp4';

const Intro = ({ onFinish }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          setTimeout(() => videoRef.current?.play(), 100);
        });
      }
    }
  }, []);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from("[data-animate-text]", {
        opacity: 0,
        y: 40,
        duration: 1.2,
        stagger: 0.2,
        ease: "power3.out"
      });

      gsap.from("[data-animate-frame]", {
        opacity: 0,
        duration: 1,
        ease: "linear",
        delay: 0.5
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-screen bg-[#010204] text-white relative overflow-hidden font-sans select-none flex flex-col justify-between p-8 sm:p-12 md:p-16"
    >
      
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 pointer-events-none"
      >
        <source src={introVideo} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,35,80,0.15)_0%,rgba(1,2,4,0.8)_80%)] z-10 pointer-events-none" />

      <header data-animate-frame className="w-full flex justify-between items-center z-20 shrink-0">
        <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-neutral-300">
          Estra Financial
        </span>
        <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
          System Active
        </span>
      </header>

      <div className="z-20 text-center max-w-6xl mx-auto my-auto flex flex-col items-center justify-center">
        
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase mb-6 leading-[0.9]">
          <span data-animate-text className="text-white block">
            Welcome to
          </span>
          <span data-animate-text className="block mt-2 bg-gradient-to-b from-[#1a1a1a] to-black bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(255,255,255,0.2)]">
            Estra Banking
          </span>
        </h1>

        <p data-animate-text className="text-lg sm:text-xl font-light italic tracking-widest text-neutral-300">
          Redefining Financial Flow
        </p>

      </div>

      <footer data-animate-frame className="w-full z-20 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
        
        <div className="max-w-md text-left">
          <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-[0.1em] border-l-2 border-neutral-800 pl-4">
            Disclaimer: This platform is for demonstration purposes only. It is not affiliated with any real financial institution.
          </p>
        </div>
        
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
