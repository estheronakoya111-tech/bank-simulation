import React, { useLayoutEffect, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import * as THREE from "three";
import { ArrowLeft, Phone, Mail, ShieldCheck, ChevronDown, Search } from "lucide-react";

const Support = ({ onBack }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // --- STATE FOR INTERACTIVE ACCORDIONS ---
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  // --- FAQS DATABASE ---
  const faqData = [
    {
      id: 1,
      question: "When will the platform upgrade be complete?",
      answer: "Our engine optimization is scheduled to finish within the standard maintenance window. Core ledger channels and balance databases remain secure during this intermission."
    },
    {
      id: 2,
      question: "Are my funds and balances safe?",
      answer: "Absolutely. All capital, assets, and transactional processing logs are completely isolated inside our encrypted offline ledger nodes. No account data is affected by this upgrade."
    },
    {
      id: 3,
      question: "How do I process an emergency wire transfer?",
      answer: "For immediate, mission-critical processing, please connect with our priority Voice Desk directly. Our team can authenticate your session over secure phone lines."
    },
    {
      id: 4,
      question: "Will my banking mobile app sync automatically?",
      answer: "Yes. Once the core infrastructure upgrade goes live, your customer app will safely establish a handshake protocol with the updated secure gateway without requiring re-installation."
    }
  ];

  const filteredFaqs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  // --- THREE.JS: 30 PERFORMANCE-SAFE FLOATING SILVER NODES (SCATTERED EVERYWHERE) ---
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(1); // Baseline optimization cap for 4GB RAM safeguards
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 6;

    // Generate exactly 30 floating silver banking abstract wireframe geometries scattered everywhere
    const iconCount = 30;
    const iconGroup = new THREE.Group();

    for (let i = 0; i < iconCount; i++) {
      // High-performance lightweight math vectors
      const shape = new THREE.OctahedronGeometry(0.14, 0);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x9ca3af, // Liquid Silver wireframes
        wireframe: true,
        transparent: true,
        opacity: 0.15
      });

      const mesh = new THREE.Mesh(shape, mat);

      // Expanded coordinate matrix scatter bounds to distribute nodes everywhere across the entire page canvas
      mesh.position.x = (Math.random() - 0.5) * 14;
      mesh.position.y = (Math.random() - 0.5) * 12;
      mesh.position.z = (Math.random() - 0.5) * 4;

      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.012,
        rotSpeedY: (Math.random() - 0.5) * 0.012,
        seed: Math.random() * 100
      };

      iconGroup.add(mesh);
    }
    scene.add(iconGroup);

    // Dynamic Window Resizing Logic Matrix
    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", resize);
    resize();

    // Ultra-lightweight loop updates only 30 matrix coordinates (Zero frame lag)
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();

      iconGroup.children.forEach((child) => {
        child.rotation.x += child.userData.rotSpeedX;
        child.rotation.y += child.userData.rotSpeedY;
        // Natural low-frequency vertical drift pattern
        child.position.y += Math.sin(time + child.userData.seed) * 0.0006;
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
      iconGroup.children.forEach((child) => {
        child.geometry.dispose();
        child.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  // --- GSAP PRECISE LAYOUT ENTRANCE ---
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from("[data-animate-header]", {
        opacity: 0,
        y: -15,
        duration: 0.8,
        ease: "power2.out"
      });

      gsap.from("[data-animate-title]", {
        opacity: 0,
        y: 25,
        duration: 1,
        ease: "power3.out",
        delay: 0.1
      });

      gsap.from("[data-animate-grid]", {
        opacity: 0,
        y: 30,
        duration: 1.2,
        stagger: 0.1,
        ease: "power4.out",
        delay: 0.3,
        clearProps: "all"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full min-h-screen h-auto bg-[#010204] text-white relative flex flex-col items-center font-sans select-none overflow-y-visible overflow-x-hidden"
    >
      {/* BACKGROUND GRAPHICS BLOCK CANVAS */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 block" />
      
      {/* MINIMAL ATMOSPHERIC COBALT BACKLIGHTING FILL */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(10,35,80,0.1)_0%,rgba(1,2,4,1)_75%)] pointer-events-none z-0" />

      {/* CORE SECURE STRUCTURAL CONTAINER CONTAINER */}
      <div className="w-full max-w-6xl z-10 px-6 py-8 md:py-12 flex flex-col h-full">
        
        {/* HEADER BRAND BLOCK */}
        <header data-animate-header className="w-full flex justify-between items-center mb-16 shrink-0">
          <button 
            onClick={onBack} 
            aria-label="Go back"
            className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all duration-300 group backdrop-blur-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
          </button>
          <span className="text-[10px] font-mono tracking-[0.4em] text-white/40 uppercase">
            Estra // Support Terminal
          </span>
        </header>

        {/* HERO HEADER PLATFORM SECTION */}
        <div className="text-center max-w-2xl mx-auto mb-16 shrink-0">
          <h1 data-animate-title className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-5 text-white">
            Hello, How can we help you?
          </h1>
          
          {/* SILVER OPTIMIZED SYSTEM ALERT NOTICE */}
          <p data-animate-title className="text-sm sm:text-base text-neutral-400 font-normal max-w-lg mx-auto mb-8 leading-relaxed">
            Please bear with us as our systems undergo an essential maintenance upgrade. 
            <span className="block text-neutral-300 font-semibold mt-1.5 text-xs uppercase tracking-wider">
              ESTRA Core Infrastructure optimization is actively underway.
            </span>
          </p>

          {/* DYNAMIC SEARCH INTERFACE CONTAINER */}
          <div data-animate-title className="w-full max-w-xl mx-auto relative group">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Ask a question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 bg-[#070b12]/80 border border-white/10 rounded-2xl pl-14 pr-6 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:bg-[#090f1a] transition-all backdrop-blur-md shadow-2xl"
            />
          </div>
        </div>

        {/* FUNCTIONAL CONTENT DASHBOARD MATRIX */}
        <div data-animate-grid className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          
          {/* ACCORDION SYSTEM COLUMNS MODULE */}
          <div className="col-span-1 lg:col-span-7 space-y-3 w-full">
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-500 mb-4">
              Frequently Asked Questions ({filteredFaqs.length})
            </h2>

            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <div 
                  key={faq.id}
                  className={`w-full rounded-2xl border transition-all duration-300 overflow-hidden ${
                    openFaq === faq.id 
                      ? "bg-[#080d16] border-white/20 shadow-xl" 
                      : "bg-[#04060b]/40 border-white/[0.04] hover:border-white/10"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-5 flex justify-between items-center text-left font-semibold text-sm sm:text-base text-neutral-200 hover:text-white transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown 
                      size={18} 
                      className={`text-neutral-500 transition-transform duration-300 shrink-0 ml-4 ${
                        openFaq === faq.id ? "rotate-180 text-white" : ""
                      }`} 
                    />
                  </button>
                  
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      openFaq === faq.id ? "max-h-40 border-t border-white/[0.05]" : "max-h-0"
                    }`}
                  >
                    <p className="p-5 text-xs sm:text-sm text-neutral-400 leading-relaxed bg-[#05080f]/50">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 border border-white/[0.04] rounded-2xl text-center text-sm text-neutral-500">
                No matching terminal solutions found for "{searchQuery}"
              </div>
            )}
          </div>

          {/* RIGHT SIDE FLOATING TELEMETRY TERMINAL CARD */}
          <div className="col-span-1 lg:col-span-5 w-full lg:sticky lg:top-8">
            <div className="w-full bg-gradient-to-b from-[#060b14] to-[#030509] border border-white/[0.06] rounded-[28px] p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.8)] text-center relative">
              
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/10 mx-auto flex items-center justify-center mb-5 text-neutral-400 shadow-inner">
                <ShieldCheck size={20} />
              </div>

              <h3 className="text-lg font-bold text-neutral-100 tracking-tight mb-2">
                You still have a question?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mx-auto mb-6 leading-relaxed">
                If you can't find structural answers here, reach our priority support network instantly. We respond in real time.
              </p>

              {/* DIRECT CONNECTION LINKS NODE GRID */}
              <div className="space-y-3 text-left">
                
                <a 
                  href="tel:09072334109"
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:border-white/15 hover:bg-white/[0.02] transition-all duration-300 group cursor-pointer active:scale-[0.99]"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-neutral-400 group-hover:text-white transition-all shrink-0">
                    <Phone size={14} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[8px] font-mono tracking-widest text-neutral-500 uppercase mb-0.5">Priority Desk</span>
                    <span className="block text-xs sm:text-sm font-semibold text-neutral-200 group-hover:text-white transition-colors">09072334109</span>
                  </div>
                </a>

                <a 
                  href="mailto:estheronakoya111@gmail.com"
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:border-white/15 hover:bg-white/[0.02] transition-all duration-300 group cursor-pointer min-w-0 active:scale-[0.99]"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-neutral-400 group-hover:text-white transition-all shrink-0">
                    <Mail size={14} />
                  </div>
                  <div className="min-w-0 w-full">
                    <span className="block text-[8px] font-mono tracking-widest text-neutral-500 uppercase mb-0.5">Secure Network</span>
                    <span className="block text-xs sm:text-sm font-semibold text-neutral-200 truncate group-hover:text-white transition-colors">estheronakoya111@gmail.com</span>
                  </div>
                </a>

              </div>
            </div>
          </div>

        </div>

        {/* SYSTEM FOOTER STAMP */}
        <footer className="w-full flex flex-col sm:flex-row justify-between items-center gap-2 text-[9px] font-mono text-white/20 tracking-[0.3em] uppercase mt-24 pt-8 border-t border-white/[0.02] shrink-0">
          <div>SYS_STATUS // MAINTENANCE_MODE</div>
          <div>ESTRA PLATFORMS © 2026</div>
        </footer>

      </div>
    </div>
  );
};

export default Support;