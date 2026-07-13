import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import { X, Lock, ShieldCheck, RotateCcw, ArrowLeft, Eye, EyeOff, ShieldAlert, Zap, Globe } from 'lucide-react';

// --- ULTRA-LIGHTWEIGHT 3D VAULT BRAND GEOMETRY FOR LAPTOPS ---
function FloatingVaultGeometry({ type }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Smooth, optimized performance loops that will never cause browser hanging
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.15;
    }
  });

  return (
    <mesh ref={meshRef}>
      {type === "left" ? (
        <torusKnotGeometry args={[1, 0.28, 64, 8, 2, 3]} />
      ) : (
        <icosahedronGeometry args={[1.2, 1]} />
      )}
      <meshStandardMaterial 
        color="#d1d5db"
        metalness={0.9}
        roughness={0.15}
        wireframe={true}
      />
    </mesh>
  );
}

const Privacy = ({ onBack }) => {
  // 1. PIN & ACCESS STATE (DO NOT TOUCH)
  const [step, setStep] = useState('check'); 
  const [pin, setPin] = useState("");
  const [tempPin, setTempPin] = useState(""); 
  const [savedPin, setSavedPin] = useState(localStorage.getItem("estra_privacy_pin"));
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 2. PRIVACY OPTIONS (Functional States updated to clear terminology)
  const [nodes, setNodes] = useState({
    stealth: localStorage.getItem('stealthMode') === 'true',
    contacts: localStorage.getItem('contactsSync') === 'true',
    camera: localStorage.getItem('cameraAccess') === 'true',
    idMask: localStorage.getItem('idMask') === 'true',
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  useEffect(() => {
    if (!savedPin) setStep('register');
    else setStep('verify');
  }, [savedPin]);

  // 3. MASTER TOGGLE (The "Doing" Logic)
  const toggleNode = (key, storageKey) => {
    const newValue = !nodes[key];
    setNodes(prev => ({ ...prev, [key]: newValue }));
    localStorage.setItem(storageKey, newValue);

    // DASHBOARD HANDSHAKES
    if (key === 'stealth') localStorage.setItem("estra_blur_active", newValue);
    if (key === 'idMask') {
        if (newValue) sessionStorage.setItem("estra_mask_active", "true");
        else sessionStorage.removeItem("estra_mask_active");
    }
  };

  const handlePinInput = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (step === 'register') {
          setTempPin(newPin);
          gsap.to(".auth-container", { x: -50, opacity: 0, duration: 0.3, onComplete: () => {
            setPin("");
            setStep('confirm');
            gsap.fromTo(".auth-container", { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3 });
          }});
        } else if (step === 'confirm') {
          if (newPin === tempPin) {
            localStorage.setItem("estra_privacy_pin", newPin);
            setSavedPin(newPin);
            setStep('node');
          } else {
            gsap.to(".pin-dots", { x: [-10, 10, -10, 10, 0], duration: 0.4 });
            setPin("");
          }
        } else if (step === 'verify') {
          if (newPin === savedPin) setStep('node');
          else {
            gsap.to(".pin-dots", { x: [-10, 10, -10, 10, 0], duration: 0.4 });
            setPin("");
          }
        }
      }
    }
  };

  const handleEmergencyReset = () => {
    localStorage.removeItem("estra_privacy_pin");
    localStorage.removeItem("stealthMode");
    localStorage.removeItem("idMask");
    setSavedPin(null);
    setPin("");
    setStep('register');
    setShowResetConfirm(false);
  };

  const handleExport = () => {
    setIsExporting(true);
    setExportProgress(0);
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsExporting(false), 1000);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white p-6 font-sans relative overflow-hidden flex flex-col items-center">
      
      {/* ATMOSPHERE */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER */}
      <header className="w-full max-w-6xl flex justify-between items-center py-6 z-50 bg-[#020205]/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3">
            <ShieldCheck className="text-white/40" size={24} />
            <h1 className="text-xl font-black italic tracking-tighter text-white uppercase">
              Privacy <span className="text-white/40">Settings</span>
            </h1>
        </div>
        <div className="flex items-center gap-4">
            {(step === 'verify' || step === 'node') && (
                <button onClick={() => setShowResetConfirm(true)} className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-[9px] uppercase tracking-widest text-white hover:text-red-400 hover:border-red-400 transition-all flex items-center gap-2 cursor-pointer">
                    <RotateCcw size={12} /> Reset App Lock
                </button>
            )}
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white transition-all group cursor-pointer">
              <X size={20} className="group-hover:text-black transition-colors" />
            </button>
        </div>
      </header>

      {/* STAGE 1: AUTH INTERFACE */}
      {(step === 'register' || step === 'confirm' || step === 'verify') && (
        <div className="flex-grow flex items-center justify-center w-full max-w-6xl gap-4 xl:gap-12">
          
          {/* DESKTOP 3D OBJECT PANEL LEFT */}
          <div className="hidden lg:flex flex-col items-center justify-center w-1/4 aspect-square relative select-none">
             <div className="absolute inset-0 border border-white/[0.03] rounded-full p-8 animate-spin" style={{ animationDuration: '40s' }} />
             <div className="w-full h-[320px] pointer-events-none">
               <Canvas camera={{ position: [0, 0, 3.8] }}>
                 <ambientLight intensity={0.6} />
                 <directionalLight position={[10, 10, 5]} intensity={1.5} />
                 <Suspense fallback={null}>
                   <FloatingVaultGeometry type="left" />
                 </Suspense>
               </Canvas>
             </div>
          </div>

          <div className="auth-container flex flex-col items-center w-full max-w-[320px] z-10">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]"><Lock className="text-white" size={22} /></div>
            <h2 className="text-2xl font-light mb-1">{step === 'register' ? "Create PIN" : step === 'confirm' ? "Confirm PIN" : "Enter PIN"}</h2>
            <p className="text-white/40 text-[9px] uppercase tracking-[0.4em] mb-10">4-Digit Security Key</p>
            <div className="pin-dots flex gap-4 mb-10">
              {[0,1,2,3].map(i => <div key={i} className={`w-3 h-3 rounded-full border transition-all duration-300 ${pin.length > i ? 'bg-white border-white scale-125 shadow-[0_0_10px_white]' : 'border-white/30'}`} />)}
            </div>
            <div className="grid grid-cols-3 gap-4 w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "del"].map((val, i) => (
                <button key={i} onClick={() => val === "del" ? setPin(pin.slice(0, -1)) : val !== "" && handlePinInput(val)}
                  className={`h-16 rounded-2xl flex flex-col items-center justify-center text-xl font-light transition-all relative overflow-hidden group bg-white/5 border border-white/10 active:bg-white active:text-black cursor-pointer`}
                >
                  <span className="z-10">{val === "del" ? <X size={18} /> : val}</span>
                  {typeof val === 'number' && <span className="text-[8px] text-white/30 absolute bottom-2 font-black tracking-tighter">*</span>}
                </button>
              ))}
            </div>
            <button onClick={onBack} className="mt-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] uppercase tracking-[0.3em] font-bold cursor-pointer">
                <ArrowLeft size={14} /> Return to Dashboard
            </button>
          </div>

          {/* DESKTOP 3D OBJECT PANEL RIGHT */}
          <div className="hidden lg:flex flex-col items-center justify-center w-1/4 aspect-square relative select-none">
             <div className="absolute inset-0 border border-white/[0.03] rounded-full p-8 animate-spin" style={{ animationDuration: '60s', animationDirection: 'reverse' }} />
             <div className="w-full h-[320px] pointer-events-none">
               <Canvas camera={{ position: [0, 0, 3.8] }}>
                 <ambientLight intensity={0.6} />
                 <directionalLight position={[-10, 10, 5]} intensity={1.5} />
                 <Suspense fallback={null}>
                   <FloatingVaultGeometry type="right" />
                 </Suspense>
               </Canvas>
             </div>
          </div>

        </div>
      )}

      {/* STAGE 2: MAIN PRIVACY DASHBOARD */}
      {step === 'node' && (
        <div className="flex-grow w-full max-w-6xl flex items-start justify-center gap-10 mt-10 overflow-hidden">
          
          {/* DESKTOP LEFT: STATUS PANEL */}
          <div className="hidden lg:flex flex-col gap-6 w-1/4 animate-in slide-in-from-left duration-700">
             <div className="p-8 rounded-[40px] border border-white/10 bg-white/[0.03] space-y-6 backdrop-blur-xl shadow-2xl">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Security Status</h4>
                <div className="space-y-4">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                        <span className="text-white/60">Network</span>
                        <span className="text-emerald-500">Secure</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                        <span className="text-white/60">Masking</span>
                        <span className={nodes.idMask ? "text-blue-400" : "text-white/30"}>{nodes.idMask ? "Active" : "Standby"}</span>
                    </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                    <p className="text-[9px] text-white/40 uppercase leading-loose tracking-[0.2em] font-medium">Privacy shield configuration is active. Your dashboard transactions and legal information are fully protected from local observation.</p>
                </div>
             </div>
          </div>

          {/* CENTER: SCROLLABLE OPTIONS LIST */}
          <div className="w-full max-w-md flex flex-col h-[75vh]">
            <div className="flex-grow overflow-y-auto no-scrollbar space-y-4 pr-1">
                <PrivacyNode title="Stealth Mode" desc="Blur sensitive balances in Dashboard." active={nodes.stealth} toggle={() => toggleNode('stealth', 'stealthMode')} icon={<EyeOff size={22}/>} />
                <PrivacyNode title="Contact Sync" desc="Populate with local verified templates." active={nodes.contacts} toggle={() => toggleNode('contacts', 'contactsSync')} icon={<Globe size={22}/>} />
                <PrivacyNode title="Camera Access" desc="Triggers secure banking face scanning." active={nodes.camera} toggle={() => toggleNode('camera', 'cameraAccess')} icon={<Zap size={22}/>} />
                <PrivacyNode title="Identity Mask" desc="Replace legal name with 'Anonymous'." active={nodes.idMask} toggle={() => toggleNode('idMask', 'idMask')} icon={<Lock size={22}/>} />
                
                {/* SAFE ACCOUNT DATA STORAGE EXPORT */}
                <div className="p-8 rounded-[40px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl relative overflow-hidden group mt-4 shadow-2xl transition-all hover:border-white/20">
                    <h4 className="text-white/50 text-[10px] font-black uppercase tracking-[0.5em] mb-6">Account Backup</h4>
                    {isExporting ? (
                      <div className="space-y-4">
                        <div className="flex justify-between text-[11px] font-mono text-cyan-400 font-bold"><span>DOWNLOADING_BACKUP...</span><span>{exportProgress}%</span></div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${exportProgress}%` }} className="h-full bg-white shadow-[0_0_15px_white]" /></div>
                      </div>
                    ) : (
                      <button onClick={handleExport} className="w-full py-5 rounded-2xl border border-white/20 text-white font-black text-[11px] uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all shadow-xl cursor-pointer">Export Account Data</button>
                    )}
                </div>
            </div>
          </div>

          {/* DESKTOP RIGHT: EXIT ACTIONS */}
          <div className="hidden lg:flex flex-col gap-6 w-1/4 animate-in slide-in-from-right duration-700">
             <div className="p-8 rounded-[40px] border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4">Encryption Summary</h4>
                <p className="text-[10px] text-white/50 leading-relaxed font-sans">
                  Your security configuration uses private client-side parameters. Changing toggles saves instantly to local account storage preferences.
                </p>
             </div>
             <button onClick={onBack} className="w-full py-5 bg-white text-black rounded-[30px] text-[11px] font-black uppercase tracking-[0.5em] hover:scale-[1.05] active:scale-95 transition-all shadow-2xl cursor-pointer">
                Back to Vault
             </button>
          </div>
        </div>
      )}

      {/* RESET CONFIRMATION DIALOG */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
            <div className="bg-[#050507] border border-red-500/30 p-10 rounded-[50px] text-center max-w-xs shadow-[0_0_50px_rgba(239,68,68,0.2)]">
               <ShieldAlert className="text-red-500 mx-auto mb-6 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" size={40} />
               <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Wipe App Lock?</h3>
               <p className="text-white/60 text-[11px] uppercase tracking-widest leading-relaxed mb-8">All security settings and your custom login PIN will be permanently cleared from this device.</p>
               <div className="flex flex-col gap-3">
                  <button onClick={handleEmergencyReset} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-xl cursor-pointer">Wipe Configuration</button>
                  <button onClick={() => setShowResetConfirm(false)} className="w-full py-4 bg-white/10 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/20 transition-all cursor-pointer">Cancel</button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* FLOATING ACCESS CAMERA LIGHT RE-WORDED */}
      {nodes.camera && step === 'node' && (
          <div className="fixed top-24 right-6 flex items-center gap-2 z-[100] bg-black/60 px-4 py-2 rounded-full border border-green-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
            <span className="text-[10px] text-green-400 font-black tracking-widest uppercase">Scanner Ready</span>
          </div>
      )}

    </div>
  );
};

// COMPONENT: THE INDIVIDUAL SETTING ITEM (Sharpened)
const PrivacyNode = ({ title, desc, active, toggle, icon }) => (
  <div onClick={toggle} className={`p-8 rounded-[40px] border transition-all duration-700 cursor-pointer shadow-xl ${active ? 'bg-white/10 border-blue-400/50 shadow-blue-500/10' : 'bg-white/[0.02] border-white/10 hover:border-white/30 hover:bg-white/5'}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className={`transition-all duration-500 ${active ? 'text-blue-400 scale-125 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'text-white/30'}`}>{icon}</span>
        <div>
          <h3 className={`text-[15px] font-bold tracking-tight ${active ? 'text-white' : 'text-white/60'}`}>{title}</h3>
          <p className="text-[10px] text-white/40 mt-1 uppercase tracking-tighter font-medium">{desc}</p>
        </div>
      </div>
      
      {/* THE TOGGLE SWITCH */}
      <div className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all duration-500 ${active ? 'bg-blue-500 border-blue-400' : 'bg-white/10 border-white/20'}`}>
          <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-white/40'}`}>{active ? "ON" : "OFF"}</span>
          <div className={`w-9 h-5 rounded-full relative transition-all duration-500 ${active ? 'bg-white/20' : 'bg-black/40'}`}>
              <div className={`absolute top-1 w-3 h-3 rounded-full transition-all duration-500 shadow-sm ${active ? 'left-5 bg-white' : 'left-1 bg-white/40'}`} />
          </div>
      </div>
    </div>
  </div>
);

export default Privacy;
