import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  Search, ChevronRight, Zap, GraduationCap, Globe, 
  Trophy, X, Tv, Car, ShieldCheck, Landmark, CreditCard, ArrowLeft 
} from 'lucide-react';

const Bills = ({ onBack }) => { 
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const containerRef = useRef(null);
  const starsRef = useRef(null);
  const headerRef = useRef(null); // Ref for Holographic Header
  const billerRefs = useRef([]); // Ref array for Magnetic Billers

  const billers = [
    { id: 1, name: "Lau Bros Bill", category: "Utilities", icon: <Zap size={18}/> },
    { id: 2, name: "Ikeja Electric (IKEDC)", category: "Power", icon: <Zap size={18}/> },
    { id: 3, name: "Eko Electric (EKEDC)", category: "Power", icon: <Zap size={18}/> },
    { id: 4, name: "LAWMA Waste", category: "Utilities", icon: <Zap size={18}/> },
    { id: 5, name: "School Fees Portal", category: "Education", icon: <GraduationCap size={18}/> },
    { id: 6, name: "JAMB / WAEC Pins", category: "Education", icon: <GraduationCap size={18}/> },
    { id: 7, name: "UNILAG / LASU / OAU", category: "University", icon: <GraduationCap size={18}/> },
    { id: 8, name: "MTN Data & Airtime", category: "Telecom", icon: <Globe size={18}/> },
    { id: 9, name: "Airtel Data & Airtime", category: "Telecom", icon: <Globe size={18}/> },
    { id: 10, name: "Glo / 9mobile", category: "Telecom", icon: <Globe size={18}/> },
    { id: 11, name: "FiberOne / iPNX", category: "Internet", icon: <Globe size={18}/> },
    { id: 12, name: "Remita (RRR)", category: "Government", icon: <Landmark size={18}/> },
    { id: 13, name: "LCC Toll (E-Tag)", category: "Transport", icon: <Car size={18}/> },
    { id: 14, name: "State Tax / LIRS", category: "Government", icon: <ShieldCheck size={18}/> },
    { id: 15, name: "DStv / GOtv", category: "Cable TV", icon: <Tv size={18}/> },
    { id: 16, name: "SportyBet Top-up", category: "Betting", icon: <Trophy size={18}/> },
    { id: 17, name: "Bet9ja Wallet", category: "Betting", icon: <Trophy size={18}/> },
    { id: 18, name: "Showmax / Netflix", category: "Streaming", icon: <Tv size={18}/> },
    { id: 19, name: "Credit Card Repayment", category: "Finance", icon: <CreditCard size={18}/> },
    { id: 20, name: "Insurance Premium", category: "Finance", icon: <ShieldCheck size={18}/> }
  ];

  const filteredBillers = billers.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  // --- HOLOGRAPHIC TILT FOR HEADER ---
  const handleHeaderTilt = (e) => {
    const header = headerRef.current;
    if (!header) return;
    const rect = header.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;

    gsap.to(header, {
      rotateX: rotateX,
      rotateY: rotateY,
      duration: 0.6,
      ease: "power2.out",
      transformPerspective: 1000
    });
  };

  const resetHeader = () => {
    gsap.to(headerRef.current, { rotateX: 0, rotateY: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
  };

  // --- MAGNETIC BILLER CARDS ---
  const handleMagnetic = (e, index) => {
    const item = billerRefs.current[index];
    if (!item) return;
    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    gsap.to(item, {
      x: x * 0.2,
      y: y * 0.2,
      duration: 0.4,
      ease: "power2.out"
    });
  };

  const resetMagnetic = (index) => {
    gsap.to(billerRefs.current[index], { x: 0, y: 0, duration: 0.6, ease: "power4.out" });
  };

  useEffect(() => {
    // 1. ADVANCED INTERACTIVE NEURAL BACKGROUND
    const canvas = starsRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];

    const initParticles = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < 120; i++) particles.push(new NeuralNode());
    };

    class NeuralNode {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
      }
      draw() {
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(); particles[i].draw();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 - dist/800})`;
            ctx.lineWidth = 0.5; ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    };

    initParticles(); animate();
    window.addEventListener("resize", initParticles);

    // 2. ENTRANCE STAGGER
    const tl = gsap.timeline();
    tl.fromTo(".page-header", { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 1, ease: "power4.out" })
      .fromTo(".search-container", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8 }, "-=0.6")
      .fromTo(".biller-item", 
        { opacity: 0, y: 20, filter: "blur(10px)" }, 
        { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.04, duration: 0.7, ease: "back.out(1.2)" }, "-=0.5"
      );

    return () => window.removeEventListener("resize", initParticles);
  }, []);

  const triggerComingSoon = () => {
    setShowModal(true);
    gsap.fromTo(".modal-box", 
      { scale: 0.85, opacity: 0, y: 30 }, 
      { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
    );
  };

  return (
    <div ref={containerRef} className="h-screen bg-[#030303] text-white p-6 relative overflow-y-auto no-scrollbar font-sans scroll-smooth">
      
      {/* 3D NEURAL BACKGROUND */}
      <canvas ref={starsRef} className="fixed inset-0 z-0 pointer-events-none" />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-900/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto">
        
        {/* HOLOGRAPHIC HEADER */}
        <header 
          ref={headerRef}
          onMouseMove={handleHeaderTilt}
          onMouseLeave={resetHeader}
          className="page-header mb-8 pt-6 flex justify-between items-start cursor-default"
        >
          <div>
            <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-b from-white via-gray-300 to-gray-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              Payments
            </h1>
            <p className="text-gray-500 text-[10px] tracking-[0.4em] uppercase mt-2 font-medium opacity-60">ESTRA Secure Gateway</p>
          </div>
          
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-90 shadow-2xl"
          >
            <X size={20} />
          </button>
        </header>

        {/* HIGH-END GLASS SEARCH */}
        <div className="search-container mb-10 group">
          <div className="flex items-center bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[25px] px-6 py-5 group-focus-within:border-blue-500/30 transition-all shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            <Search className="text-gray-600 group-focus-within:text-white transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search billers or services..." 
              className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-700 text-sm ml-4 font-light tracking-widest"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* MAGNETIC LIST */}
        <div className="space-y-4 pb-20">
          {filteredBillers.length > 0 ? (
            filteredBillers.map((biller, idx) => (
              <div 
                key={biller.id}
                ref={el => billerRefs.current[idx] = el}
                onMouseMove={(e) => handleMagnetic(e, idx)}
                onMouseLeave={() => resetMagnetic(idx)}
                onClick={triggerComingSoon}
                className="biller-item group flex items-center justify-between p-5 rounded-[22px] bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer backdrop-blur-md"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border border-white/5 flex items-center justify-center text-white/50 group-hover:text-white group-hover:scale-110 group-hover:border-blue-500/40 transition-all duration-500 shadow-xl">
                    {biller.icon}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-medium text-gray-300 group-hover:text-white transition-colors">{biller.name}</h3>
                    <p className="text-[9px] text-gray-600 uppercase tracking-[0.2em] mt-1">{biller.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                   <span className="text-[9px] text-blue-500 font-black uppercase tracking-tighter">Encrypted</span>
                   <ChevronRight size={16} className="text-gray-500" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-gray-700 text-[10px] tracking-widest uppercase italic">Node match not found.</div>
          )}
        </div>
      </div>

      {/* COMING SOON MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
          <div className="modal-box relative bg-[#050507] border border-white/5 p-12 rounded-[3.5rem] text-center max-w-sm shadow-[0_0_100px_rgba(30,58,138,0.1)]">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-8 right-8 text-gray-600 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="w-20 h-20 bg-blue-500/5 rounded-full flex items-center justify-center mx-auto mb-10 border border-blue-500/10">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4 tracking-tighter">System Upgrade</h2>
            <p className="text-gray-500 text-[11px] leading-relaxed mb-10 px-2 tracking-wide">
              OUR NEURAL NETWORK IS CURRENTLY ENCRYPTING THIS PAYMENT NODE. ACCESS WILL BE RESTORED SHORTLY.
            </p>
            
            <button 
              onClick={() => setShowModal(false)}
              className="w-full py-5 bg-white text-black rounded-[20px] font-black text-[10px] uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-white/10 shadow-2xl"
            >
              Return to Terminal
            </button>
          </div>
        </div>
      )}

      {/* KINETIC FOOTER */}
      <div className="text-center pb-12 opacity-30 text-[10px] tracking-[1.5em] uppercase animate-pulse select-none cursor-default hover:tracking-[1.8em] transition-all duration-1000">
        ESTRA 3.0 // Neural Ledger
      </div>
    </div>
  );
};

export default Bills;