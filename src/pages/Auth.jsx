import React, { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { Shield, Lock, Landmark, Wallet, CheckCircle2, User, Mail, Eye, EyeOff, ArrowRight, Activity, Cpu, Globe, Zap } from "lucide-react";

// --- 1. NEBULA BACKGROUND ---
function NebulaDust() {
  const ref = useRef();
  const [points] = useState(() => {
    const p = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000 * 3; i++) p[i] = (Math.random() - 0.5) * 10;
    return p;
  });
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.05;
      ref.current.rotation.x += delta * 0.02;
    }
  });
  return (
    <Points ref={ref} positions={points} stride={3}>
      <PointMaterial transparent color="#4a90e2" size={0.02} sizeAttenuation opacity={0.3} blending={THREE.AdditiveBlending} />
    </Points>
  );
}

const Auth = ({ onAuthSuccess }) => {
  // --- BACKEND & UI STATE ---
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1); 
  const [isTicked, setIsTicked] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  
  // PASSWORD VISIBILITY SEPARATE TOGGLES
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: ""
  });

  const capsuleRef = useRef(null);
  const iconRef = useRef([]);

  // --- CAPTURE INPUT BUG FIX ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- SECURITY VALIDATION GUARDS ---
  const isLoginValid = formData.username.trim() !== "" && formData.password.trim() !== "";
  const isSignupStep1Valid = formData.fullName.trim() !== "" && formData.email.trim().includes("@");
  const isSignupStep2Valid = formData.username.trim() !== "" && formData.password.length >= 8 && isTicked;

  // --- HANDLERS (BACKEND INTEGRATION) ---
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setStatusMsg("Synchronizing...");
    
    const endpoint = mode === "login" ? "/login" : "/register";
    
    try {
      // Updated to use the environment variable
      const response = await fetch(`${import.meta.env.VITE_BANK_BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (mode === "login") {
          // Add token persistence if returned
          if (data.token) sessionStorage.setItem("estra_token", data.token);
          
          if (formData.username === "EstherAdmin") {
            setStatusMsg("Admin Identity Detected. Awaiting OTP...");
          } else {
            setStatusMsg("Security Code Sent to Email...");
          }
          setTimeout(() => { onAuthSuccess(formData.username); }, 1500);
        } else {
          setStatusMsg("Access Created. Switching to Login...");
          setTimeout(() => {
            setMode("login");
            setStep(1);
            setStatusMsg("");
          }, 2000);
        }
      } else {
        setStatusMsg(data.message || "Access Denied.");
      }
    } catch (error) {
      setStatusMsg("Connection Failed.");
    }
  };

  // --- UI ANIMATIONS ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(capsuleRef.current, 
        { scale: 0.95, opacity: 0, y: 30 }, 
        { scale: 1, opacity: 1, y: 0, duration: 1.5, ease: "expo.out" }
      );
      iconRef.current.forEach((el, i) => {
        if (el) {
          gsap.to(el, {
            y: "random(-30, 30)",
            x: "random(-30, 30)",
            duration: "random(4, 7)",
            repeat: -1, yoyo: true, ease: "sine.inOut"
          });
        }
      });
    });
    return () => ctx.revert();
  }, [mode]);

  const handleNextSlide = () => {
    if (!isSignupStep1Valid) return;
    gsap.to(".input-group", {
      opacity: 0, y: -10, duration: 0.3,
      onComplete: () => {
        setStep(2);
        gsap.fromTo(".input-group", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 });
      }
    });
  };

  const toggleAuth = () => {
    setMode(mode === "login" ? "signup" : "login");
    setStep(1);
    setIsTicked(false);
    setStatusMsg("");
    setShowLoginPassword(false);
    setShowSignupPassword(false);
    setFormData({ username: "", password: "", email: "", fullName: "" });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#010206] text-white selection:bg-silver/30 overflow-hidden font-sans">
      
      {/* 3D BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <Suspense fallback={null}><NebulaDust /></Suspense>
        </Canvas>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/20 via-transparent to-black" />
      </div>

      {/* FLOATING ICONS (MOBILE/MEDIUM) */}
      <div className="lg:hidden absolute inset-0 z-5 pointer-events-none">
        {[Shield, Lock, Activity, Cpu, Globe, Zap, Wallet, Landmark].map((Icon, idx) => (
          <div 
            key={idx}
            ref={el => iconRef.current[idx] = el}
            className="absolute opacity-30 text-silver/80 drop-shadow-[0_0_8px_rgba(74,144,226,0.3)]"
            style={{ top: `${15 + (idx * 10)}%`, left: `${(idx % 2 === 0 ? 10 : 80)}%` }}
          >
            <Icon size={idx % 2 === 0 ? 25 : 40} strokeWidth={1} />
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row h-screen w-full">
        
        {/* --- DESKTOP 60% SIDE --- */}
        <div className="hidden lg:flex w-3/5 relative flex-col justify-center items-center p-12">
          <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 800 600">
            <path d="M 150 200 Q 400 120 650 200" stroke="silver" fill="none" strokeWidth="0.5" strokeDasharray="4,4" />
            <path d="M 150 400 Q 400 480 650 400" stroke="silver" fill="none" strokeWidth="0.5" strokeDasharray="4,4" />
          </svg>

          <div className="relative flex flex-col items-center text-center">
            <div className="absolute -top-32 animate-pulse"><Lock className="text-silver/60 drop-shadow-[0_0_10px_silver]" size={35} /></div>
            <div className="absolute -left-56 top-0"><Shield className="text-silver/60 drop-shadow-[0_0_10px_silver]" size={35} /></div>
            <div className="absolute -right-56 top-0"><Wallet className="text-silver/60 drop-shadow-[0_0_10px_silver]" size={35} /></div>
            <div className="absolute -bottom-24 -left-20"><Landmark className="text-silver/60 drop-shadow-[0_0_10px_silver]" size={35} /></div>
            <div className="absolute -bottom-24 -right-20"><Activity className="text-silver/60 drop-shadow-[0_0_10px_silver]" size={35} /></div>

            <h1 className="text-[10rem] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-silver to-gray-700 drop-shadow-[0_10px_40px_rgba(255,255,255,0.25)]">
              ESTRA
            </h1>
            <p className="mt-4 text-silver/40 tracking-[0.7em] uppercase text-xs font-bold font-mono">Enhancing Financial Flows</p>
          </div>
        </div>

        {/* --- 40% ACTION SIDE --- */}
        <div className="w-full lg:w-2/5 flex items-center justify-center p-6 md:p-12 min-h-screen">
          
          <div 
            ref={capsuleRef} 
            className="w-full max-w-[420px] bg-gradient-to-br from-white/[0.12] via-blue-900/[0.04] to-white/[0.02] backdrop-blur-[60px] border border-white/20 rounded-[60px] p-10 lg:p-14 shadow-2xl relative overflow-hidden group"
          >
            <div className="flex flex-col items-center mb-10">
               <h1 className="text-4xl font-black tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-b from-white via-silver to-gray-500 italic">ESTRA</h1>
               <div className="flex items-center gap-3 w-full mt-3">
                 <div className="h-[0.5px] flex-1 bg-gradient-to-r from-transparent to-silver/40" />
                 <p className="text-[7px] tracking-[0.3em] text-silver/60 uppercase font-black whitespace-nowrap">Redefining Financial Flows</p>
                 <div className="h-[0.5px] flex-1 bg-gradient-to-l from-transparent to-silver/40" />
               </div>
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-8">
              <div className="space-y-1 text-center lg:text-left">
                {statusMsg && (
                  <p className="text-[9px] text-[#4a90e2] font-black uppercase tracking-widest mb-2 animate-pulse">{statusMsg}</p>
                )}
                <h2 className="text-2xl font-black tracking-[0.2em] bg-gradient-to-r from-white via-silver to-gray-600 bg-clip-text text-transparent uppercase">
                  {mode === "login" ? "WELCOME" : step === 1 ? "INITIALIZE" : "FINALIZE"}
                </h2>
                <p className="text-gray-600 text-[8px] tracking-[0.4em] uppercase font-bold">Neural Protocol: Active</p>
              </div>

              {/* INPUT FIELDS WITH EYE TOGGLE MODIFICATIONS */}
              <div className="input-group flex flex-col gap-4">
                {mode === "login" ? (
                  <>
                    <div className="relative"><User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={14} /><input key="login-user" name="username" value={formData.username} onChange={handleChange} type="text" placeholder="VAULT ID" className="w-full bg-black/40 border border-white/10 rounded-full pl-14 pr-6 py-4 outline-none focus:border-silver/40 focus:bg-black/60 transition-all text-[10px] tracking-widest placeholder:text-gray-700" required /></div>
                    <div className="relative">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                      <input key="login-pass" name="password" value={formData.password} onChange={handleChange} type={showLoginPassword ? "text" : "password"} placeholder="KEY PHRASE" className="w-full bg-black/40 border border-white/10 rounded-full pl-14 pr-14 py-4 outline-none focus:border-silver/40 focus:bg-black/60 transition-all text-[10px] tracking-widest placeholder:text-gray-700" required />
                      <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer focus:outline-none">
                        {showLoginPassword ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {step === 1 ? (
                      <>
                        <div className="relative"><User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={14} /><input key="signup-name" name="fullName" value={formData.fullName} onChange={handleChange} type="text" placeholder="FULL NAME" className="w-full bg-black/40 border border-white/10 rounded-full pl-14 pr-6 py-4 outline-none focus:border-silver/40 focus:bg-black/60 transition-all text-[10px] tracking-widest placeholder:text-gray-700" required /></div>
                        <div className="relative"><Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={14} /><input key="signup-email" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="EMAIL ADDRESS" className="w-full bg-black/40 border border-white/10 rounded-full pl-14 pr-6 py-4 outline-none focus:border-silver/40 focus:bg-black/60 transition-all text-[10px] tracking-widest placeholder:text-gray-700" required /></div>
                      </>
                    ) : (
                      <>
                        <div className="relative"><User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={14} /><input key="signup-user" name="username" value={formData.username} onChange={handleChange} type="text" placeholder="NEW VAULT ID" className="w-full bg-black/40 border border-white/10 rounded-full pl-14 pr-8 py-4 outline-none focus:border-silver/40 focus:bg-black/60 transition-all text-[10px] tracking-widest placeholder:text-gray-700" required /></div>
                        <div className="relative">
                          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                          <input key="signup-pass" name="password" value={formData.password} onChange={handleChange} type={showSignupPassword ? "text" : "password"} placeholder="NEW KEY PHRASE (MIN 8)" className="w-full bg-black/40 border border-white/10 rounded-full pl-14 pr-14 py-4 outline-none focus:border-silver/40 focus:bg-black/60 transition-all text-[10px] tracking-widest placeholder:text-gray-700" required />
                          <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer focus:outline-none">
                            {showSignupPassword ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* TICK BOX */}
              {mode === "signup" && step === 2 && (
                <div className="flex items-center gap-4 px-2 cursor-pointer group/tick" onClick={() => setIsTicked(!isTicked)}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isTicked ? 'bg-white border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-white/20 group-hover/tick:border-white/50'}`}>
                    {isTicked && <CheckCircle2 size={12} className="text-black" />}
                  </div>
                  <span className={`text-[8px] font-bold uppercase tracking-[0.2em] transition-colors ${isTicked ? 'text-white' : 'text-gray-500'}`}>
                    Confirm Protocol Agreement (18+)
                  </span>
                </div>
              )}

              {/* ACTION BUTTON WITH SECURITY PROTOCOLS */}
              <div className="space-y-6">
                <button 
                  type={mode === "signup" && step === 1 ? "button" : "submit"}
                  onClick={mode === "signup" && step === 1 ? handleNextSlide : undefined}
                  disabled={
                    (mode === "login" && !isLoginValid) ||
                    (mode === "signup" && step === 1 && !isSignupStep1Valid) ||
                    (mode === "signup" && step === 2 && !isSignupStep2Valid)
                  }
                  className={`w-full py-5 rounded-full font-black uppercase tracking-[0.3em] text-[10px] transition-all duration-700 relative overflow-hidden group/btn
                  ${((mode === "login" && !isLoginValid) || (mode === "signup" && step === 1 && !isSignupStep1Valid) || (mode === "signup" && step === 2 && !isSignupStep2Valid)) 
                    ? 'bg-white/5 text-gray-700 cursor-not-allowed opacity-50' 
                    : 'bg-white text-black hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-[1.03]'}`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {mode === "login" ? "ACCESS VAULT" : step === 1 ? "NEXT STEP" : "AUTHORIZE"} <ArrowRight size={14} />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2.5s_infinite]" />
                </button>

                <button 
                  type="button"
                  onClick={toggleAuth}
                  className="w-full text-center text-[8px] tracking-[0.5em] text-gray-600 uppercase hover:text-white transition-all font-bold"
                >
                  {mode === "login" ? "// ESTABLISH NEW ACCESS" : "// RETURN TO LOGIN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{` @keyframes shimmer { 100% { transform: translateX(100%); } } `}</style>
    </div>
  );
};

export default Auth;