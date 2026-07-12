import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import html2canvas from "html2canvas";

const Transfer = ({ onBack }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 
  const [receiverAcc, setReceiverAcc] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [refCode, setRefCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [timestamp, setTimestamp] = useState(""); 

  const cardRef = useRef(null);
  const contentRef = useRef(null);
  const receiptRef = useRef(null);
  const starsRef = useRef(null);

  // --- 1. DYNAMIC GALAXY ---
  useEffect(() => {
    const canvas = starsRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];
    let animationFrame;

    const initCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < 3000; i++) particles.push(new Particle());
    };

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5;
        this.speed = Math.random() * 0.4 + 0.1;
        this.opacity = Math.random() * 0.8 + 0.2;
      }
      update() {
        this.y -= this.speed;
        if (this.y < 0) this.y = canvas.height;
      }
      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", initCanvas);
    initCanvas();
    animate();

    gsap.fromTo(cardRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2, ease: "power4.out" });
    
    gsap.to(".bg-icon", {
      y: "random(-40, 40)",
      rotation: "random(-90, 90)",
      duration: "random(4, 7)",
      repeat: -1, yoyo: true, ease: "sine.inOut"
    });

    return () => {
      window.removeEventListener("resize", initCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  // --- 2. STEP MOTION ---
  useEffect(() => {
    gsap.fromTo(contentRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4 });
  }, [step]);

  // --- 3. BACKEND LOOKUP ---
  useEffect(() => {
    if (receiverAcc.length === 10) handleLookup();
    else { setReceiverName(""); setStatus(""); }
  }, [receiverAcc]);

  const handleLookup = async () => {
    setIsLoading(true); setStatus("SCANNING DATABASE...");
    try {
      const token = sessionStorage.getItem("estra_token");
      const res = await fetch(`${import.meta.env.VITE_BANK_BACKEND_URL}/search_account/${receiverAcc}`, { 
        headers: { "Authorization": `Bearer ${token}` } 
      });
      const data = await res.json();
      if (res.ok) {
        setReceiverName(data.username); 
        setStatus("");
      } else {
        setReceiverName("");
        setStatus("INVALID RECIPIENT ID");
      }
    } catch (e) { setStatus("SYSTEM OFFLINE"); } finally { setIsLoading(false); }
  };

  const handlePay = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("estra_token");
      const res = await fetch(`${import.meta.env.VITE_BANK_BACKEND_URL}/transfer`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_acc: receiverAcc, amount: amount })
      });
      const data = await res.json();
      if (res.ok) { 
        setRefCode(data.ref); 
        const now = new Date();
        const timeString = now.toLocaleString('en-US', { 
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: '2-digit', month: 'short', year: 'numeric'
        });
        setTimestamp(timeString);
        setStep(4); 
      } 
      else { setStatus(data.message.toUpperCase()); }
    } catch (e) { setStatus("TRANSFER FAILED"); } finally { setIsLoading(false); }
  };

  // --- 4. FIX: TOAST GUARD ---
  const triggerToast = (msg) => {
    if (toast) return; 
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // --- 5. FIX: DOWNLOAD PROOF ENGINE ---
  const shareReceipt = async () => {
    const element = receiptRef.current;
    if (!element) return;
    
    triggerToast("Capturing Proof...");
    
    // Add 800ms delay to ensure heavy glassmorphism styles are fully calculated
    setTimeout(async () => {
        try {
            const canvas = await html2canvas(element, { 
                backgroundColor: "#0a0a0a", // Explicitly set to match receipt slab
                scale: 2, // Scale 2 is safer for 4GB RAM than Scale 3
                useCORS: true,
                logging: false,
                allowTaint: true,
                onclone: (clonedDoc) => {
                  // Ensure cloned receipt is visible during snapshot
                  clonedDoc.querySelector('.receipt-slab').style.overflow = "visible";
                }
            });
            
            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `ESTRA_TXN_${refCode || 'RECEIPT'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            triggerToast("Proof Downloaded!");
        } catch (err) {
            console.error("Snapshot Error:", err);
            triggerToast("Download Error");
        }
    }, 800);
  };

  const bgIcons = ['pi-shield', 'pi-bolt', 'pi-lock', 'pi-verified', 'pi-wallet', 'pi-database', 'pi-chart-line', 'pi-money-bill', 'pi-globe', 'pi-key', 'pi-briefcase', 'pi-building', 'pi-percentage', 'pi-star-fill', 'pi-eye-slash'];

  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden font-sans flex items-center justify-center">
      <canvas ref={starsRef} className="absolute inset-0 z-0 bg-black" />

      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.07]">
        {bgIcons.map((icon, i) => (
          <i key={i} className={`pi ${icon} bg-icon text-white text-4xl lg:text-6xl absolute`} 
             style={{ top: `${Math.random() * 90}%`, left: `${Math.random() * 90}%` }} 
          />
        ))}
      </div>

      <main 
        ref={cardRef} 
        className={`relative z-10 w-[90%] sm:w-[440px] lg:w-[480px] p-6 md:p-10 
                   bg-white/[0.01] backdrop-blur-[100px] border border-white/20 rounded-[60px] 
                   shadow-[0_50px_120px_rgba(0,0,0,1)] flex flex-col items-center gap-6 border-t-white/30 
                   max-h-[90vh] overflow-y-auto no-scrollbar`}
      >
        
        <div className="shrink-0 w-12 h-12 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center shadow-xl">
            <i className="pi pi-lock text-white/60 text-lg" />
        </div>

        <div ref={contentRef} className="w-full">
            {step === 1 && (
            <div className="space-y-6 flex flex-col items-center animate-in fade-in">
                <h2 className="text-white/40 text-[11px] tracking-[0.6em] uppercase font-black">Choose Method</h2>
                <button onClick={() => setStep(2)} className="w-full p-8 bg-white/[0.05] border border-white/30 rounded-[35px] flex items-center justify-between hover:bg-white/[0.1] transition-all group">
                    <div className="flex items-center gap-6">
                        <i className="pi pi-bolt text-white text-3xl group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                            <p className="text-white text-sm font-bold tracking-wide">Secure Transfer</p>
                            <p className="text-white/30 text-[8px] uppercase font-black">Internal | $0 Fees</p>
                        </div>
                    </div>
                    <i className="pi pi-chevron-right text-white/40 text-xs" />
                </button>
                <button onClick={() => triggerToast("Service Locked")} className="w-full p-8 bg-white/[0.01] border border-white/10 rounded-[35px] flex items-center justify-between opacity-30 cursor-not-allowed">
                    <div className="flex items-center gap-6">
                        <i className="pi pi-credit-card text-white text-2xl" />
                        <p className="text-white text-sm">Credit Card</p>
                    </div>
                    <span className="text-white/20 text-[7px] font-black">LOCKED</span>
                </button>
                <button onClick={onBack} className="mt-4 text-white/30 text-[10px] font-black tracking-widest uppercase hover:text-white transition-all">Abort</button>
            </div>
            )}

            {step === 2 && (
            <div className="space-y-12 flex flex-col items-center">
                <h2 className="text-white/60 text-[11px] tracking-[0.6em] uppercase font-black">Recipient Account</h2>
                <div className="w-full bg-white/[0.03] border border-white/30 rounded-[35px] p-1 shadow-inner">
                    <input 
                      maxLength="10" placeholder="0000000000" value={receiverAcc}
                      onChange={(e) => setReceiverAcc(e.target.value)}
                      className="w-full bg-transparent p-6 text-white text-center text-4xl font-light tracking-[0.3em] outline-none placeholder:text-white/5"
                    />
                </div>
                {receiverName && (
                <div className="text-center">
                    <p className="text-white/20 text-[8px] uppercase tracking-widest mb-2 font-black">Verified Receiver</p>
                    <h3 className="text-white text-3xl font-normal silver-text italic drop-shadow-2xl">{receiverName}</h3>
                </div>
                )}
                <p className="text-white/30 text-[9px] uppercase tracking-widest h-2 font-bold">{status}</p>
                <div className="w-full flex gap-5 pt-4">
                    <button onClick={() => setStep(1)} className="flex-1 py-5 border border-white/20 text-white/60 text-[11px] font-black rounded-3xl">BACK</button>
                    <button onClick={() => setStep(3)} disabled={!receiverName || isLoading} className="flex-[2] py-5 bg-white text-black text-[11px] font-black tracking-widest uppercase rounded-3xl disabled:opacity-20 active:scale-95 transition-all">NEXT</button>
                </div>
            </div>
            )}

            {step === 3 && (
            <div className="space-y-12 flex flex-col items-center">
                <div className="text-center">
                    <p className="text-white/40 text-[10px] font-black mb-2 uppercase italic">Sending To: {receiverName}</p>
                    <h2 className="text-white text-[12px] tracking-[0.8em] uppercase font-black silver-text">Input Value</h2>
                </div>
                <div className="w-full bg-white/[0.04] border border-white/30 rounded-[45px] p-12 flex items-center justify-center gap-4">
                    <span className="text-white/40 text-5xl font-thin">$</span>
                    <input 
                    type="number" placeholder="0.00" value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-transparent w-full text-center text-7xl font-light text-white outline-none"
                    />
                </div>
                <p className="text-white/30 text-[9px] uppercase tracking-widest h-2 font-bold">{status}</p>
                <div className="w-full flex gap-5">
                    <button onClick={() => setStep(2)} className="flex-1 py-5 border border-white/20 text-white/60 text-[11px] font-black rounded-3xl">BACK</button>
                    <button onClick={handlePay} disabled={!amount || isLoading} className="flex-[2] py-5 bg-white text-black text-[11px] font-black tracking-widest uppercase rounded-3xl shadow-white/10 shadow-2xl active:scale-95">CONFIRM</button>
                </div>
            </div>
            )}

            {step === 4 && (
            <div className="w-full flex flex-col items-center gap-6 overflow-hidden">
                <div 
                  ref={receiptRef} 
                  className="receipt-slab w-full p-8 bg-[#0a0a0a] border border-white/10 rounded-[40px] shadow-2xl relative"
                >
                    <div className="flex justify-between items-start mb-8">
                        <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-inner">
                            <i className="pi pi-bolt text-white text-lg" />
                        </div>
                        <div className="text-right">
                            <span className="text-[7px] text-green-400 font-bold border border-green-400/30 px-3 py-1.5 rounded-full uppercase tracking-widest bg-green-400/5">
                                <i className="pi pi-verified mr-1 text-[7px]" /> Transaction Verified
                            </span>
                        </div>
                    </div>

                    <div className="text-center space-y-6">
                        <h1 className="text-white/30 text-[9px] font-black uppercase tracking-[0.6em]">Payment Proof</h1>
                        
                        <div className="py-2">
                            <p className="text-white text-3xl font-normal silver-text italic tracking-wide uppercase leading-tight">{receiverName}</p>
                            <p className="text-white text-5xl font-black tracking-tighter mt-3">${amount}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 text-left border-t border-white/5 pt-6">
                            <div>
                                <p className="text-white/20 text-[7px] uppercase font-bold tracking-widest mb-1">Captured On</p>
                                <p className="text-white text-[9px] font-medium">{timestamp}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-white/20 text-[7px] uppercase font-bold tracking-widest mb-1">Status</p>
                                <p className="text-green-400 text-[9px] font-black italic">SUCCESSFUL</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                                <p className="text-white/20 text-[6px] uppercase font-bold tracking-[0.3em] mb-2">Authorization Token</p>
                                <p className="text-white/60 text-[8px] font-mono break-all leading-relaxed tracking-tighter">{refCode}</p>
                            </div>
                            <div className="flex items-center justify-center gap-2 opacity-30">
                                <i className="pi pi-shield text-[9px] text-white" />
                                <p className="text-white text-[7px] font-medium tracking-widest uppercase italic">Safe & Secured by Estra Protocol</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full flex flex-col gap-3">
                    <button onClick={shareReceipt} className="w-full py-5 bg-white text-black text-[11px] font-black tracking-widest uppercase rounded-[25px] shadow-white/20 shadow-xl active:scale-95 transition-all">
                        <i className="pi pi-download mr-2" /> Download Proof
                    </button>
                    <button onClick={onBack} className="text-white/40 text-[10px] font-black tracking-widest uppercase hover:text-white transition-all py-4">
                        Terminate Session
                    </button>
                </div>
            </div>
            )}
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-12 z-[100] px-12 py-5 bg-white text-black rounded-full shadow-2xl animate-bounce">
           <p className="text-[11px] font-black uppercase tracking-widest">{toast}</p>
        </div>
      )}

      <style>{`
        .silver-text { background: linear-gradient(to bottom, #ffffff 0%, #a1a1a1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      <link rel="stylesheet" href="https://unpkg.com/primeicons/primeicons.css" />
    </div>
  );
};

export default Transfer;