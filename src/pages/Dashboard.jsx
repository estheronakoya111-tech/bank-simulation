import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

const Dashboard = ({ onLogout, triggerTransfer, triggerBills, triggerPrivacy, triggerPrivacyPolicy, triggerActivity, triggerSupport, triggerSettings, triggerRewards, triggerDeposit }) => { 
  const navigate = useNavigate();
  
  // ==========================================
  // APP STATE MANAGEMENT
  // ==========================================
  const [balance, setBalance] = useState(0); 
  const balanceRef = useRef(0); // Memory to prevent unnecessary state updates
  
  // State for Balance Privacy (Eye Icon)
  const [showBalance, setShowBalance] = useState(true);

  const [showWelcome, setShowWelcome] = useState(!localStorage.getItem("estra_bonus_seen"));
  const [username] = useState(sessionStorage.getItem("estra_username") || "EstherAdmin");
  const [accountNumber] = useState(sessionStorage.getItem("estra_acc_num") || "1029384756");
  
  const [creditAlert, setCreditAlert] = useState(null);
  const lastSeenTxnRef = useRef(null); 

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [comingSoonToast, setComingSoonToast] = useState("");
  const [showAllMobileServices, setShowAllMobileServices] = useState(false); 

  // New state tracking variable for the full-page maintenance page illusion
  const [showFullMaintenance, setShowFullMaintenance] = useState(false);

  // Functional Privacy Checks
  const isStealthActive = localStorage.getItem("estra_blur_active") === "true";
  const isMaskActive = sessionStorage.getItem("estra_mask_active") === "true";

  const bgRef = useRef(null);
  const mainRef = useRef(null);
  const drawerRef = useRef(null);
  const backdropRef = useRef(null);
  const welcomeRef = useRef(null);
  const alertRef = useRef(null); 

  const services = [
    { n: 'Transfer', i: 'pi-send' },
    { n: 'Pay Bills', i: 'pi-wallet' },
    { n: 'Deposit', i: 'pi-clone' }, // REMAPPED: Changed 'Pay Piles' to 'Deposit'
    { n: 'Invest', i: 'pi-chart-line' },
    { n: 'Airtime', i: 'pi-mobile' },
    { n: 'Data', i: 'pi-database' },
    { n: 'Rewards', i: 'pi-gift' }, // CONNECTED: Linked with triggerRewards mapping
    { n: 'Support', i: 'pi-headphones' },
    { n: 'Security', i: 'pi-shield' },
    { n: 'Privacy', i: 'pi-eye-slash' },
    { n: 'Charts', i: 'pi-chart-bar' },
    { n: 'Activity', i: 'pi-history' },
    { n: 'Cards', i: 'pi-credit-card' }
  ];

  // ==========================================
  // CORE BACKEND LOGIC: SYNC & BALANCE
  // ==========================================
  const fetchBalance = async () => {
    const token = sessionStorage.getItem("estra_token");
    
    // STRICT SECURITY GUARD: Ensure token exists, isn't a string literal error, 
    // and contains a fully complete 3-part JWT structure (header.payload.signature)
    if (!token || 
        token === "null" || 
        token === "undefined" || 
        token.trim() === "" || 
        token.split('.').length !== 3) {
      return;
    }

    try {
      // FIXED: Removed "Content-Type" header because GET requests don't have bodies. 
      // This stops strict backends from failing with a 422 validation error.
      const response = await fetch(`${import.meta.env.VITE_BANK_BACKEND_URL}/history`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        sessionStorage.clear();
        onLogout();
        navigate("/");
        return;
      }

      const data = await response.json();
      let total = 1000.00; 

      if (data && Array.isArray(data) && data.length > 0 && !data[0].message) {
        let calculatedMovements = 0;
        data.forEach(txn => {
            const amt = parseFloat(txn.amount);
            const type = txn.type ? txn.type.toLowerCase() : "";
            if (type.includes("received") || type.includes("deposit")) {
                calculatedMovements += amt;
            } else if (type.includes("sent") || type.includes("withdrawal")) {
                calculatedMovements -= amt;
            }
        });
        
        total = 1000.00 + calculatedMovements;

        const latest = data[0];
        const txnId = latest.timestamp + latest.amount; 
        
        const seenTxnsString = sessionStorage.getItem("estra_seen_txns") || "[]";
        const seenTxnsArray = JSON.parse(seenTxnsString);

        if (latest.type && latest.type.toLowerCase().includes("received") && txnId !== lastSeenTxnRef.current && !seenTxnsArray.includes(txnId)) {
            lastSeenTxnRef.current = txnId; 
            
            seenTxnsArray.push(txnId);
            sessionStorage.setItem("estra_seen_txns", JSON.stringify(seenTxnsArray));

            setCreditAlert(latest);
            setTimeout(() => setCreditAlert(null), 6000);
        }
      } else {
        total = 1000.00;

        if (!localStorage.getItem("estra_bonus_seen") && lastSeenTxnRef.current !== "GENESIS") {
            lastSeenTxnRef.current = "GENESIS"; 
            setCreditAlert({
              amount: "1,000.00",
              type: "Initial Vault Credit"
            });
            setTimeout(() => setCreditAlert(null), 8000);
        }
      }

      if (Math.abs(total - balanceRef.current) > 0.01) {
          const obj = { val: balanceRef.current };
          gsap.to(obj, {
            val: total, 
            duration: 2.5,
            ease: "power3.out",
            onUpdate: () => {
                setBalance(obj.val);
                balanceRef.current = obj.val;
            }
          });
      }

    } catch (error) {
      console.error("Vault Connection Offline");
    }
  };

  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem("estra_token");
      await fetch(`${import.meta.env.VITE_BANK_BACKEND_URL}/logout`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });
    } catch (error) {
      console.log("Session force cleared");
    } finally {
      sessionStorage.clear();
      onLogout(); 
      navigate("/");
    }
  };

  // ==========================================
  // SIDE EFFECTS: POLLING & UI EFFECTS
  // ==========================================
  useEffect(() => {
    const poll = setInterval(fetchBalance, 10000); 
    
    gsap.fromTo(mainRef.current, 
      { opacity: 0, scale: 0.99 }, 
      { opacity: 1, scale: 1, duration: 1.2, ease: "power4.out" }
    );

    if (showWelcome) {
      gsap.fromTo(welcomeRef.current, 
        { scale: 0.9, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 1, ease: "back.out(1.7)" }
      );

      setTimeout(() => {
        if (welcomeRef.current) {
          gsap.to(welcomeRef.current, { 
            opacity: 0, y: -30, duration: 1, 
            onComplete: () => {
              setShowWelcome(false);
              localStorage.setItem("estra_bonus_seen", "true");
              fetchBalance(); 
            }
          });
        }
      }, 3500);
    } else {
      fetchBalance();
    }

    const canvas = bgRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];

    const initParticles = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < 2000; i++) particles.push(new Particle());
    };

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.2 + 0.4;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.speed = Math.random() * 0.15 + 0.05;
      }
      update() {
        this.y -= this.speed;
        if (this.y < -10) this.y = canvas.height + 10;
      }
      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    };

    window.addEventListener("resize", initParticles); 
    initParticles();
    animate();

    return () => { 
      window.removeEventListener("resize", initParticles); 
      clearInterval(poll); 
    };
  }, []); 

  useEffect(() => {
    if (creditAlert) {
      gsap.fromTo(alertRef.current, { y: -100, opacity: 0 }, { y: 20, opacity: 1, duration: 0.8, ease: "expo.out" });
    }
  }, [creditAlert]);

  const toggleDrawer = () => {
    if (!isDrawerOpen) {
      setIsDrawerOpen(true);
      gsap.to(drawerRef.current, { x: 0, opacity: 1, duration: 0.5, ease: "expo.out" });
      gsap.to(backdropRef.current, { opacity: 1, pointerEvents: "auto", duration: 0.5 });
    } else {
      setIsDrawerOpen(false);
      gsap.to(drawerRef.current, { x: "100%", opacity: 0, duration: 0.4 });
      gsap.to(backdropRef.current, { opacity: 0, pointerEvents: "none", duration: 0.5 });
    }
  };

  const showComingSoon = (name) => {
    setShowFullMaintenance(true);
  };

  // ==========================================
  // NEW INTERACTIVE LAYER: UNDER MAINTENANCE SWAP VIEW ILLUSION
  // ==========================================
  if (showFullMaintenance) {
    return (
      <div className="relative h-screen w-full flex flex-col bg-[#000102] overflow-hidden text-white items-center justify-between p-8 sm:p-12 md:p-16">
        <canvas ref={bgRef} className="fixed inset-0 z-0 pointer-events-none opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(10,35,80,0.15)_0%,rgba(0,1,2,1)_85%)] pointer-events-none z-0" />
        
        {/* TOP COMPACT BAR NAV PANEL */}
        <header className="w-full flex justify-between items-center z-10 shrink-0">
          <button 
            onClick={() => setShowFullMaintenance(false)} 
            className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all duration-300 group backdrop-blur-md cursor-pointer"
          >
            <i className="pi pi-arrow-left text-white group-hover:-translate-x-1 transition-transform" />
          </button>
          <span className="text-[9px] font-mono tracking-[0.4em] text-white/30 uppercase">Estra System Server</span>
        </header>

        {/* CENTRAL HERO COMPONENT UNIT */}
        <div className="z-10 text-center max-w-xl mx-auto my-auto flex flex-col items-center justify-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center text-white/40 mb-2">
            <i className="pi pi-cog text-xl animate-spin" style={{ animationDuration: "8s" }} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            Coming Soon
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-sm tracking-wide leading-relaxed">
            Estra Banking is currently undergoing maintenance.
          </p>
          <button 
            onClick={() => setShowFullMaintenance(false)}
            className="mt-6 px-8 py-3.5 bg-[#05070a] border border-[#121824] hover:border-zinc-700 text-zinc-300 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all active:scale-95 cursor-pointer shadow-xl"
          >
            Back to Dashboard
          </button>
        </div>

        {/* BOTTOM INDEX BRAND DETAILS */}
        <footer className="w-full flex flex-col sm:flex-row justify-between items-center gap-2 text-[8px] font-mono text-white/10 tracking-[0.3em] uppercase shrink-0 pt-4 border-t border-white/[0.01] z-10">
          <div>Status // Optimization Node</div>
          <div>© 2026 ESTRA LABS</div>
        </footer>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full flex flex-col bg-[#000102] overflow-hidden text-white">
      <canvas ref={bgRef} className="fixed inset-0 z-0 pointer-events-none" />

      {/* ALERT POPUP */}
      {creditAlert && (
        <div ref={alertRef} className="fixed top-0 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-[400px]">
          <div className="bg-white/5 backdrop-blur-3xl border border-white/20 p-5 rounded-[30px] flex items-center gap-5 shadow-2xl">
            <div className="w-12 h-12 bg-green-500/20 border border-green-500/40 rounded-2xl flex items-center justify-center">
              <i className="pi pi-arrow-down-left text-green-400 text-xl" />
            </div>
            <div className="flex-grow">
              <p className="text-white/40 text-[8px] uppercase tracking-widest font-black">Account Alert</p>
              <p className="text-white text-[11px] font-bold mt-1">Confirmed <span className="text-green-400">+${creditAlert.amount}</span></p>
              <p className="text-white/20 text-[9px] italic mt-0.5">{creditAlert.type}</p>
            </div>
            <button onClick={() => setCreditAlert(null)} className="text-white/20 hover:text-white"><i className="pi pi-times text-xs" /></button>
          </div>
        </div>
      )}

      {/* WELCOME SPLASH */}
      {showWelcome && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
          <div ref={welcomeRef} className="w-full max-w-[380px] p-10 bg-white/[0.02] backdrop-blur-[100px] border border-white/10 rounded-[50px] text-center shadow-2xl">
            <div className="mb-4 inline-flex w-12 h-12 bg-white/5 rounded-full items-center justify-center border border-white/10">
                <i className="pi pi-gift text-white text-xl animate-bounce" />
            </div>
            <h2 className="text-white text-xl font-light mb-1 uppercase tracking-[0.2em]">Vault Unlocked</h2>
            <p className="text-white/40 text-[9px] uppercase tracking-widest mb-4">Welcome, {isMaskActive ? "Anonymous Node" : username}</p>
            <div className="text-white text-5xl font-thin tracking-tighter mb-4 drop-shadow-[0_0_15px_white]">+$1,000.00</div>
            <div className="h-[1px] w-16 bg-white/10 mx-auto mb-4"></div>
            <p className="text-white/20 text-[7px] tracking-[0.5em] uppercase">Genesis Bonus Applied</p>
          </div>
        </div>
      )}

      <div ref={mainRef} className="relative z-10 flex flex-col w-full h-full overflow-y-auto no-scrollbar">
        
        <header className="w-full flex justify-between items-center px-6 lg:px-12 py-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              <i className="pi pi-bolt text-white text-xs" />
            </div>
            <h2 className="text-white tracking-[0.6em] text-[9px] font-bold uppercase opacity-50">Estra Dashboard</h2>
          </div>
          <button onClick={toggleDrawer} className="text-white/60 hover:text-white transition-all select-none cursor-pointer">
            <i className="pi pi-align-right text-xl" />
          </button>
        </header>

        <main className="flex-grow flex flex-col items-center px-6 lg:px-12 pb-6">
          
          <div className="w-full max-w-[480px] aspect-[1.8/1] bg-white/[0.02] border border-white/10 backdrop-blur-[50px] rounded-[35px] lg:rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center relative overflow-hidden my-4 lg:my-6 shrink-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
            <p className="text-white/20 text-[7px] lg:text-[8px] tracking-[0.8em] uppercase mb-3 opacity-40 font-black">Secure Capital Access</p>
            <div className="flex flex-col items-center relative">
              <h1 className={`text-white text-4xl lg:text-6xl font-extralight tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-700 ${isStealthActive ? 'blur-xl hover:blur-none cursor-pointer' : ''}`}>
                {showBalance ? `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "****"}
              </h1>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="absolute -right-10 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors p-2 cursor-pointer"
              >
                <i className={`pi ${showBalance ? 'pi-eye' : 'pi-eye-slash'} text-xs`} />
              </button>

              <div className="mt-4 flex flex-col items-center gap-1 group cursor-default">
                 <p className={`text-white/40 font-mono text-[8px] tracking-[0.5em] uppercase font-bold transition-all duration-700 ${isStealthActive ? 'blur-md' : ''}`}>
                    ID: {isMaskActive ? "EST-****-****" : accountNumber}
                 </p>
              </div>
            </div>
            <div className="absolute bottom-6 lg:bottom-8 left-8 text-white/10 text-[8px] tracking-[0.2em] uppercase font-mono">{isMaskActive ? "Anonymous Node" : username}</div>
            <div className="absolute top-6 right-8 opacity-10"><i className="pi pi-wifi text-[8px] text-white rotate-90" /></div>
          </div>

          <div className="hidden lg:grid grid-cols-7 gap-4 w-full max-w-[900px] mb-8 mt-4">
            {services.map((item) => (
              <button key={item.n} onClick={() => {
                if (item.n === 'Transfer') triggerTransfer();
                else if (item.n === 'Pay Bills') triggerBills();
                else if (item.n === 'Deposit') triggerDeposit(); 
                else if (item.n === 'Rewards') triggerRewards(); 
                else if (item.n === 'Privacy') triggerPrivacy(); 
                else if (item.n === 'Activity') triggerActivity(); 
                else if (item.n === 'Support') triggerSupport();
                else showComingSoon(item.n);
              }} className="h-24 bg-white/[0.01] border border-white/5 rounded-[20px] flex flex-col items-center justify-center gap-2 hover:bg-white/[0.05] hover:border-white/10 transition-all group cursor-pointer">
                <i className={`pi ${item.i} text-white/60 text-base group-hover:text-white group-hover:scale-110 transition-transform`} />
                <span className="text-white/30 text-[7px] tracking-[0.1em] uppercase group-hover:text-white">{item.n}</span>
              </button>
            ))}
          </div>

          <div className="lg:hidden w-full max-w-[420px] flex flex-col gap-8 mt-4 mb-4">
            <div className="grid grid-cols-4 gap-y-6 gap-x-3">
              {(showAllMobileServices ? services : services.slice(0, 7)).map(x => (
                <div key={x.n} onClick={() => {
                  if (x.n === 'Transfer') triggerTransfer();
                  else if (x.n === 'Pay Bills') triggerBills();
                  else if (x.n === 'Deposit') triggerDeposit(); 
                  else if (x.n === 'Rewards') triggerRewards(); 
                  else if (x.n === 'Privacy') triggerPrivacy(); 
                  else if (x.n === 'Activity') triggerActivity(); 
                  else if (x.n === 'Support') triggerSupport();
                  else showComingSoon(x.n);
                }} className="flex flex-col items-center gap-2 cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center active:scale-90 transition">
                    <i className={`pi ${x.i} text-white/80 text-lg`} />
                  </div>
                  <span className="text-white/30 text-[8px] uppercase tracking-wider text-center">{x.n}</span>
                </div>
              ))}
              {!showAllMobileServices && (
                <div onClick={() => setShowAllMobileServices(true)} className="flex flex-col items-center gap-2 cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.01] border border-dashed border-white/10 flex items-center justify-center active:scale-95 transition">
                    <i className="pi pi-ellipsis-h text-white/20 text-lg" />
                  </div>
                  <span className="text-white/20 text-[8px] uppercase tracking-wider">More</span>
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-col items-center gap-8 pb-12">
              <div className="p-8 w-full bg-white/[0.005] border border-white/[0.03] rounded-[30px] text-center italic">
                <p className="text-[9px] hide-scrollbar leading-relaxed tracking-[0.2em]">"At <strong>Estra</strong>, we give you the best services.<br/>Seamless. Secure. Superior."</p>
              </div>
              <p className="text-white text-[7px] uppercase tracking-[0.8em]">© 2026 Estra Vault</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-10 px-8 py-3 bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-full shadow-xl mb-6">
            {['Home', 'Analytics', 'Cards', 'Activity', 'Settings'].map((item, idx) => (
              <button key={item} 
                onClick={() => {
                   if (item === 'Analytics' || item === 'Activity') triggerActivity();
                   else if (item === 'Settings') triggerSettings(); 
                   else showComingSoon(item);
                }}
                className={`flex flex-col items-center gap-1 group ${idx === 0 ? 'text-white' : 'text-white/30'} cursor-pointer`}
              >
                <i className={`pi pi-${idx === 0 ? 'home' : (item === 'Analytics' ? 'chart-bar' : (item === 'Activity' ? 'history' : (item === 'Settings' ? 'cog' : 'stop')))} text-[10px]`} />
                <span className="text-[8px] uppercase tracking-widest group-hover:text-white transition-colors">{item}</span>
              </button>
            ))}
          </nav>
        </main>
      </div>

      <div ref={backdropRef} onClick={toggleDrawer} className="fixed inset-0 bg-black/80 z-[600] opacity-0 pointer-events-none transition-opacity cursor-pointer" />
      
      <div ref={drawerRef} className="fixed top-0 right-0 h-full w-[80%] max-w-[320px] z-[700] bg-[#030303] border-l border-white/10 p-10 translate-x-full">
         <div className="flex flex-col h-full justify-between">
            <div className="space-y-10">
              <div className="flex flex-col gap-1">
                <p className="font-light text-xl tracking-tight">{isMaskActive ? "Anonymous Node" : username}</p>
                <p className="text-white/20 text-[8px] uppercase tracking-[0.3em]">Premium Access</p>
              </div>
              <div className="flex flex-col gap-6">
                 <h3 className="text-white/10 text-[9px] uppercase tracking-[0.5em] mb-1">Vault Control</h3>
                 {[
                   {n: 'Account Settings', i: 'pi-cog'}, 
                   {n: 'Privacy Node', i: 'pi-eye-slash'}, 
                   {n: 'Privacy Policy', i: 'pi-shield'},
                   {n: 'Support Link', i: 'pi-headphones'}
                 ].map(item => (
                   <div key={item.n} onClick={() => {
                     if (item.n === 'Privacy Node') { toggleDrawer(); triggerPrivacy(); } 
                     else if (item.n === 'Privacy Policy') { toggleDrawer(); triggerPrivacyPolicy(); }
                     else if (item.n === 'Support Link') { toggleDrawer(); triggerSupport(); }
                     else if (item.n === 'Account Settings') { toggleDrawer(); triggerSettings(); } 
                     else showComingSoon(item.n);
                   }} className="flex items-center gap-4 group cursor-pointer opacity-60 hover:opacity-100 transition-all">
                     <i className={`pi ${item.i} text-white/30 group-hover:text-white text-sm`} />
                     <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] group-hover:text-white">{item.n}</p>
                   </div>
                 ))}
              </div>
            </div>
            <button onClick={handleLogout} className="w-full py-4 border border-red-500/10 text-red-500/40 text-[9px] tracking-[1em] uppercase rounded-xl hover:bg-red-500/5 transition-all font-black cursor-pointer">Terminate</button>
         </div>
      </div>

      <link rel="stylesheet" href="https://unpkg.com/primeicons/primeicons.css" />
    </div>
  );
};

export default Dashboard;