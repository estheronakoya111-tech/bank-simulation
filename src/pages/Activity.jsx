import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import * as THREE from "three";
import { 
  ArrowLeft, Cpu, ArrowUpRight, ArrowDownLeft, 
  X, AlertCircle, Fingerprint, Database,
  ShieldCheck, Zap, Layers, Activity as ActivityIcon
} from "lucide-react";

const Activity = ({ onBack }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [filter, setFilter] = useState("all");

  const isStealthActive = localStorage.getItem("estra_blur_active") === "true";
  const isMaskActive = sessionStorage.getItem("estra_mask_active") === "true";
  
  const mainContainerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const threeCanvasRef = useRef(null);
  const cardRefs = useRef([]);

  const floatingIconsConfig = [
    { Icon: ActivityIcon, left: "5%", size: 28, delay: 0, duration: 25 },
    { Icon: Layers, left: "15%", size: 32, delay: 4, duration: 28 },
    { Icon: Zap, left: "25%", size: 24, delay: 2, duration: 22 },
    { Icon: ShieldCheck, left: "35%", size: 36, delay: 7, duration: 32 },
    { Icon: Cpu, left: "45%", size: 26, delay: 1, duration: 24 },
    { Icon: ActivityIcon, left: "55%", size: 30, delay: 9, duration: 30 },
    { Icon: Layers, left: "65%", size: 24, delay: 3, duration: 20 },
    { Icon: Zap, left: "75%", size: 34, delay: 11, duration: 35 },
    { Icon: ShieldCheck, left: "85%", size: 28, delay: 5, duration: 27 },
    { Icon: Cpu, left: "92%", size: 32, delay: 8, duration: 31 },
    { Icon: ActivityIcon, left: "10%", size: 22, delay: 13, duration: 23 },
    { Icon: Layers, left: "30%", size: 28, delay: 6, duration: 29 },
    { Icon: Zap, left: "50%", size: 32, delay: 10, duration: 26 },
    { Icon: ShieldCheck, left: "70%", size: 24, delay: 14, duration: 21 },
    { Icon: Cpu, left: "80%", size: 30, delay: 12, duration: 33 }
  ];

  // Scramble only with digits for a clean numeric loading effect
  const scrambleText = (element, targetText, duration = 0.6) => {
    if (!element) return;
    const chars = "0123456789";
    let iterations = 0;
    const intervalTime = (duration * 1000) / targetText.length;
    
    const interval = setInterval(() => {
      element.innerText = targetText
        .split("")
        .map((char, index) => {
          if (index < iterations) return targetText[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
      
      if (iterations >= targetText.length) {
        clearInterval(interval);
        element.innerText = targetText;
      }
      iterations += 1 / 3;
    }, intervalTime);
  };

  const fetchHistory = async () => {
    try {
      setHistory([]);
      setLoading(true);
      const token = sessionStorage.getItem("estra_token");
      const response = await fetch(`${import.meta.env.VITE_BANK_BACKEND_URL}/history`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      const data = await response.json();
      
      if (!data || !Array.isArray(data) || data.length === 0 || data.message || (data[0] && data[0].message)) {
        setHistory([
          {
            id: "EST-TXN-INIT-SYSTEM-CORE",
            type: "Incoming Flux",
            amount: "1000", // Changed to integer string
            timestamp: "SYSTEM_INIT",
            sender: "ESTRA_CORE_NODE",
            note: "Welcome Bonus Allocation Locked to Node Architecture"
          }
        ]);
      } else {
        const mappedData = data.map((item, index) => {
          const rawType = item.type || "transfer";
          const isIncoming = rawType.toLowerCase().includes('received') || 
                             rawType.toLowerCase().includes('deposit') || 
                             rawType.toLowerCase().includes('credit');
          
          return {
            id: `EST-TXN-${index}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            type: isIncoming ? "Incoming Flux" : "Outgoing Flux",
            amount: Math.floor(parseFloat(item.amount || "0")).toString(), // Ensuring integer
            timestamp: item.timestamp || "Live Sync",
            sender: isIncoming ? "External Node" : "ESTRA_VAULT_CORE",
            note: item.type || "Secure Vault Transmission Verified"
          };
        });
        setHistory(mappedData);
      }
      setLoading(false);
    } catch (err) {
      console.error("Connection Error:", err);
      setHistory([
        {
          id: "EST-TXN-INIT-SYSTEM-CORE",
          type: "Incoming Flux",
          amount: "1000",
          timestamp: "SYSTEM_INIT",
          sender: "ESTRA_CORE_NODE",
          note: "Welcome Bonus Allocation Locked to Node Architecture"
        }
      ]);
      setLoading(false);
    }
  };

  // Simplified Dust Particle Effect
  useEffect(() => {
    if (!threeCanvasRef.current || !mainContainerRef.current) return;

    const container = mainContainerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: threeCanvasRef.current, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);

    const geometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 300; i++) {
      positions.push((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({ size: 0.1, color: 0xffffff, transparent: true, opacity: 0.2 });
    const dust = new THREE.Points(geometry, material);
    scene.add(dust);
    camera.position.z = 50;

    const animate = () => {
      requestAnimationFrame(animate);
      dust.rotation.y += 0.0005;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    fetchHistory();
    gsap.fromTo(".intel-panel", { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" });
    gsap.fromTo(".audit-panel", { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" });
  }, []);

  useEffect(() => {
    if (!loading && filteredHistory.length > 0) {
      const cards = document.querySelectorAll(".txn-amount-text");
      cards.forEach((card, index) => {
        const finalValue = card.getAttribute("data-final-value");
        setTimeout(() => {
          scrambleText(card, finalValue, 0.5);
        }, index * 40);
      });
    }
  }, [loading, filter, history]);

  const handleCardMouseMove = (e, index) => {
    const card = cardRefs.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const angleX = (yc - y) / 20; 
    const angleY = (x - xc) / 20;

    gsap.to(card, {
      transform: `perspective(600px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.005, 1.005, 1.005)`,
      borderColor: "rgba(255,255,255,0.2)",
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleCardMouseLeave = (index) => {
    const card = cardRefs.current[index];
    if (!card) return;
    gsap.to(card, {
      transform: "perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      borderColor: "rgba(255,255,255,0.03)",
      duration: 0.4,
      ease: "power2.out"
    });
  };

  const filteredHistory = history.filter(item => {
    if (filter === "all") return true;
    if (filter === "received") return item.type === "Incoming Flux";
    if (filter === "sent") return item.type === "Outgoing Flux";
    return true;
  });

  return (
    <div ref={mainContainerRef} className="min-h-screen w-full bg-[#020408] text-white flex flex-col items-center relative overflow-x-hidden font-sans selection:bg-white/10 selection:text-white z-10">
      
      <canvas ref={threeCanvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 block" />

      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen select-none">
        {floatingIconsConfig.map(({ Icon, left, size, delay, duration }, idx) => (
          <motion.div
            key={idx}
            className="absolute text-neutral-400 drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]"
            style={{ left, bottom: "-10%" }}
            animate={{
              y: ["0vh", "-120vh"],
              rotate: [0, 360],
              opacity: [0, 0.09, 0.09, 0]
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              delay: delay,
              ease: "linear"
            }}
          >
            <Icon size={size} strokeWidth={0.7} />
          </motion.div>
        ))}
      </div>

      <header className="w-full max-w-7xl flex flex-col sm:flex-row gap-4 justify-between items-center px-4 sm:px-8 py-6 sm:py-8 z-50 sticky top-0 bg-[#020408]/60 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button onClick={onBack} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/[0.01] border border-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all duration-300 group shadow-lg shrink-0">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,255,255,0.35)]">
              Transaction <span className="text-neutral-400 font-light font-sans not-italic">History</span>
            </h1>
            <p className="text-[8px] text-neutral-300 font-mono tracking-[0.4em] uppercase mt-0.5">SECURE_NETWORK_SYNC</p>
          </div>
        </div>

        <div className="flex bg-white/[0.02] p-1 rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-md w-full sm:w-auto justify-between sm:justify-start">
          {['all', 'received', 'sent'].map((f) => (
            <button 
              key={f} 
              onClick={() => setFilter(f)} 
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg sm:rounded-xl text-[9px] uppercase font-black tracking-widest transition-all duration-300 ${
                filter === f 
                  ? 'bg-gradient-to-b from-white via-neutral-100 to-neutral-300 text-black shadow-[0_0_20px_rgba(255,255,255,0.25)]' 
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {f === 'all' ? 'All' : f === 'received' ? 'Inflow' : 'Outflow'}
            </button>
          ))}
        </div>
      </header>

      <main className="w-full max-w-7xl flex flex-col lg:flex-row flex-grow gap-6 px-4 sm:px-8 py-6 z-10 overflow-hidden">
        
        <aside className="intel-panel w-full lg:w-1/4 flex flex-col gap-4 sm:gap-6 shrink-0">
          <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[35px] border border-white/[0.04] bg-gradient-to-b from-white/[0.02] to-transparent backdrop-blur-3xl space-y-4 sm:space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="flex items-center gap-4 text-neutral-300">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Cpu size={14} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">System Status</span>
            </div>
            
            <div className="space-y-3 text-[11px] font-bold font-mono">
              <div className="flex justify-between items-center">
                <span className="text-white/30 uppercase tracking-wider">Connection</span>
                <span className="text-emerald-400 flex items-center gap-1.5 bg-emerald-500/5 px-2.5 py-1 rounded-md border border-emerald-500/10 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/30 uppercase tracking-wider">Privacy Mode</span>
                <span className={`px-2.5 py-1 rounded-md text-[10px] border ${isMaskActive ? "text-neutral-200 bg-white/10 border-white/30" : "text-white/20 bg-white/5 border-white/5"}`}>
                  {isMaskActive ? "ENABLED" : "DISABLED"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[35px] border border-white/[0.03] bg-black/30 flex flex-col justify-between shadow-2xl lg:h-full">
             <p className="text-[10px] text-white/40 uppercase font-mono leading-relaxed tracking-wider space-y-1">
               • Real-time synchronization active<br/>
               • Secure encryption layer verified<br/>
               • System stability optimal
             </p>
             <div className="w-2 h-2 rounded-full bg-white/30 animate-pulse self-end mt-4 hidden lg:block" />
          </div>
        </aside>

        <section className="w-full lg:flex-grow flex flex-col min-h-[40vh] lg:h-full relative">
          <div ref={scrollContainerRef} className="flex-grow overflow-y-auto no-scrollbar space-y-3 sm:space-y-4 pb-24 lg:max-h-[calc(100vh-240px)]">
            {loading ? (
              <div className="h-48 lg:h-full flex items-center justify-center">
                <div className="w-8 h-8 border border-white/10 border-t-white rounded-full animate-spin" />
              </div>
            ) : filteredHistory.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-48 sm:h-[55vh] flex flex-col items-center justify-center border border-white/5 bg-white/[0.01] rounded-[24px] sm:rounded-[40px] p-6 text-center backdrop-blur-sm">
                <AlertCircle size={20} className="text-white/20 mb-2" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">No records found</h3>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredHistory.map((txn, index) => {
                  const isIncoming = txn.type === 'Incoming Flux';
                  return (
                    <motion.div 
                      key={txn.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.4 }}
                      onClick={() => setSelectedTxn(txn)}
                      className="relative block cursor-pointer group"
                    >
                      <div 
                        ref={(el) => (cardRefs.current[index] = el)}
                        onMouseMove={(e) => handleCardMouseMove(e, index)}
                        onMouseLeave={() => handleCardMouseLeave(index)}
                        className="p-5 sm:p-7 rounded-[20px] sm:rounded-[30px] bg-[#03060c]/30 border border-white/[0.04] backdrop-blur-xl transition-all duration-300 shadow-xl relative overflow-hidden"
                        style={{ transformStyle: "preserve-3d" }}
                      >
                         <div className="absolute top-0 left-12 w-[150px] h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                         
                         <div className="flex items-center justify-between pointer-events-none gap-4" style={{ transform: "translateZ(10px)" }}>
                           <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                              <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center border shrink-0 ${
                                isIncoming 
                                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                                  : 'bg-white/5 border-white/10 text-neutral-300'
                              }`}>
                                 {isIncoming ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                              </div>
                              
                              <div className="min-w-0">
                                <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] mb-0.5 font-mono truncate">{txn.timestamp}</p>
                                <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white/90 uppercase truncate">
                                  {isMaskActive ? "Hidden Data" : txn.sender}
                                </h3>
                              </div>
                           </div>

                           <div className="text-right shrink-0">
                              <p 
                                className={`text-xl sm:text-2xl font-light font-mono tracking-tighter txn-amount-text ${isStealthActive ? 'blur-lg select-none' : ''} ${
                                  isIncoming ? 'text-emerald-400' : 'text-neutral-300'
                                }`}
                                data-final-value={`${isIncoming ? "+" : "-"}${txn.amount}`}
                              >
                                --
                              </p>
                              <p className="text-[7px] sm:text-[8px] text-white/20 uppercase tracking-widest mt-0.5 font-mono">Confirmed</p>
                           </div>
                         </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#020408] to-transparent pointer-events-none z-10" />
        </section>

        <aside className="audit-panel w-full lg:w-1/4 flex flex-col shrink-0 hidden lg:flex">
          <div className="p-8 rounded-[35px] border border-white/[0.04] bg-gradient-to-b from-white/[0.01] to-transparent backdrop-blur-3xl h-full flex flex-col justify-between shadow-2xl relative">
             <div className="flex-grow flex flex-col">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8 flex items-center gap-2 border-b border-white/[0.04] pb-4">
                 <Fingerprint size={14} className="text-white/50" /> Transaction Summary
               </h4>
               
               <AnimatePresence mode="wait">
                 {selectedTxn ? (
                   <motion.div 
                     key={selectedTxn.id}
                     initial={{ opacity: 0, x: 10 }} 
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -10 }}
                     transition={{ duration: 0.25 }}
                     className="space-y-6"
                   >
                      <div className="space-y-1.5">
                         <p className="text-[9px] uppercase tracking-widest text-white/30 font-mono">Reference</p>
                         <p className="text-[11px] font-mono text-white break-all uppercase bg-white/5 p-2 rounded-xl border border-white/10 leading-normal">{selectedTxn.id}</p>
                      </div>
                      <div className="space-y-1.5">
                         <p className="text-[9px] uppercase tracking-widest text-white/30 font-mono">Category</p>
                         <p className={`text-[11px] font-mono font-bold uppercase tracking-wider ${selectedTxn.type === 'Incoming Flux' ? 'text-emerald-400' : 'text-neutral-300'}`}>
                           {selectedTxn.type === 'Incoming Flux' ? 'Inflow' : 'Outflow'}
                         </p>
                      </div>
                      <div className="space-y-1.5">
                         <p className="text-[9px] uppercase tracking-widest text-white/30 font-mono">Notes</p>
                         <p className="text-[11px] text-white/60 font-sans leading-relaxed border-l border-white/20 pl-3 py-0.5 bg-white/[0.005]">
                           {selectedTxn.note}
                         </p>
                      </div>
                   </motion.div>
                 ) : (
                   <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/10 rounded-3xl opacity-50">
                      <Database className="text-white/20 mb-3" size={24} />
                      <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-mono">Select a record</p>
                   </div>
                 )}
               </AnimatePresence>
             </div>

             <button onClick={onBack} className="w-full py-4 bg-gradient-to-b from-white via-neutral-200 to-neutral-400 text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:brightness-110 active:scale-[0.99] transition-all shadow-xl shadow-black/40 mt-6">
               Return
             </button>
          </div>
        </aside>
      </main>

      <AnimatePresence>
        {selectedTxn && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl lg:hidden">
             <motion.div initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} className="w-full max-w-sm bg-[#03050a] border border-white/15 p-6 sm:p-8 rounded-[30px] sm:rounded-[40px] relative shadow-2xl">
                <button onClick={() => setSelectedTxn(null)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <X size={14} />
                </button>
                
                <div className="text-center mb-6 sm:mb-8">
                   <h2 className={`text-2xl sm:text-3xl font-light font-mono tracking-tighter mb-1 ${selectedTxn.type === 'Incoming Flux' ? 'text-emerald-400' : 'text-neutral-300'}`}>
                     {selectedTxn.type === 'Incoming Flux' ? "+" : "-"}{selectedTxn.amount}
                   </h2>
                   <p className="text-white/40 text-[8px] uppercase tracking-[0.3em] font-mono">{selectedTxn.type === 'Incoming Flux' ? 'Inflow' : 'Outflow'}</p>
                </div>

                <div className="space-y-4 border-t border-white/5 pt-5 mb-6 sm:mb-8 text-[11px] font-mono">
                   <div className="flex justify-between items-center gap-4"><span className="text-white/30 text-[9px] uppercase shrink-0">Reference</span><span className="text-white/70 truncate">{selectedTxn.id}</span></div>
                   <div className="flex justify-between items-center gap-4"><span className="text-white/30 text-[9px] uppercase shrink-0">Sender</span><span className="text-white/90 truncate">{isMaskActive ? "Hidden" : selectedTxn.sender}</span></div>
                   <div className="flex flex-col gap-1 border-t border-white/5 pt-3"><span className="text-white/30 text-[9px] uppercase">Notes</span><span className="text-white/70 font-sans leading-relaxed">{selectedTxn.note}</span></div>
                </div>
                
                <button onClick={() => setSelectedTxn(null)} className="w-full py-3.5 bg-white/5 border border-white/10 rounded-xl font-bold text-[10px] text-white uppercase tracking-[0.2em]">
                  Dismiss
                </button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Activity;
