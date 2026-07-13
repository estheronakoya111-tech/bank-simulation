import React, { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { Shield, Lock, Landmark, Wallet, CheckCircle2, User, Mail, Eye, EyeOff, ArrowRight, Activity, Cpu, Globe, Zap, Key } from "lucide-react";

// --- 1. RESPONSIVE NEBULA BACKGROUND ---
function NebulaDust() {
  const ref = useRef();
  const { size } = useThree();
  
  const [points] = useState(() => {
    const count = size.width < 768 ? 600 : 2000;
    const p = new Float32Array(count * 3);
    const spread = size.width < 768 ? 7 : 10;
    for (let i = 0; i < count * 3; i++) {
      p[i] = (Math.random() - 0.5) * spread;
    }
    return p;
  });

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.03;
      ref.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <Points ref={ref} positions={points} stride={3}>
      <PointMaterial 
        transparent 
        color="#a0aec0" 
        size={size.width < 768 ? 0.03 : 0.015} 
        sizeAttenuation 
        opacity={size.width < 768 ? 0.4 : 0.25} 
        blending={THREE.AdditiveBlending} 
      />
    </Points>
  );
}

const Auth = ({ onAuthSuccess }) => {
  // --- BACKEND & UI STATE ---
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot"
  const [step, setStep] = useState(1); 
  const [isTicked, setIsTicked] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  
  // PASSWORD VISIBILITY SEPARATE TOGGLES
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    otpCode: "",
    newPassword: ""
  });

  const containerRef = useRef(null);
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
  const isForgotStep1Valid = formData.email.trim().includes("@");
  const isForgotStep2Valid = formData.otpCode.trim() !== "" && formData.newPassword.length >= 8;

  // --- PREMIUM STATIONARY DISSOLVE TIMELINE ---
  const handleTransitionFade = (stateUpdateCallback) => {
    gsap.to(".input-group, .form-header-labels", {
      opacity: 0,
      y: -5,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        stateUpdateCallback();
        gsap.to(".input-group, .form-header-labels", {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });
  };

  // --- HANDLERS (BACKEND INTEGRATION) ---
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setStatusMsg("Connecting...");
    
    let endpoint = "";
    let payload = {};

    if (mode === "login") {
      endpoint = "/login";
      payload = { username: formData.username, password: formData.password };
    } else if (mode === "signup") {
      endpoint = "/register";
      payload = { username: formData.username, email: formData.email, password: formData.password };
    } else if (mode === "forgot" && step === 1) {
      endpoint = "/forgot-password";
      payload = { email: formData.email };
    } else if (mode === "forgot" && step === 2) {
      endpoint = "/reset-password";
      payload = { email: formData.email, code: formData.otpCode, new_password: formData.newPassword };
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BANK_BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (mode === "login") {
          if (data.token) sessionStorage.setItem("estra_token", data.token);
          
          if (formData.username === "EstherAdmin") {
            setStatusMsg("Admin profile verified. Checking your code...");
          } else {
            setStatusMsg("Signing you in... Checking your code...");
          }
          setTimeout(() => { onAuthSuccess(formData.username); }, 1500);
        } else if (mode === "signup") {
          setStatusMsg("Account created successfully! Loading sign in view...");
          setTimeout(() => {
            handleTransitionFade(() => {
              setMode("login");
              setStep(1);
              setStatusMsg("");
            });
          }, 1500);
        } else if (mode === "forgot" && step === 1) {
          setStatusMsg("Sending your code... Check your email.");
          setTimeout(() => {
            handleTransitionFade(() => {
              setStep(2);
              setStatusMsg("");
            });
          }, 1500);
        } else if (mode === "forgot" && step === 2) {
          setStatusMsg("Password updated successfully!");
          setTimeout(() => {
            handleTransitionFade(() => {
              setMode("login");
              setStep(1);
              setStatusMsg("");
            });
          }, 1500);
        }
      } else {
        setStatusMsg(data.message || "Invalid details. Please try again.");
      }
    } catch (error) {
      setStatusMsg("Connection lost. Please check your network.");
    }
  };

  // --- UI KINETIC GSAP DRIFT SYSTEMS ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(capsuleRef.current, 
        { scale: 0.98, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.8, ease: "power3.out" }
      );

      iconRef.current.forEach((el, i) => {
        if (el) {
          gsap.to(el, {
            y: "random(-20, 20)",
            x: "random(-20, 20)",
            duration: "random(6, 9)",
            repeat: -1, yoyo: true, ease: "sine.inOut"
          });
        }
      });
    });

    return () => ctx.revert();
  }, []);

  const handleNextSlide = () => {
    if (!isSignupStep1Valid) return;
    handleTransitionFade(() => {
      setStep(2);
    });
  };

  const toggleAuth = () => {
    handleTransitionFade(() => {
      setMode(mode === "login" ? "signup" : "login");
      setStep(1);
      setIsTicked(false);
      setStatusMsg("");
      setShowLoginPassword(false);
      setShowSignupPassword(false);
      setShowResetPassword(false);
      setFormData({ username: "", password: "", email: "", fullName: "" , otpCode: "", newPassword: "" });
    });
  };

  const switchToForgot = () => {
    handleTransitionFade(() => {
      setMode("forgot");
      setStep(1);
      setStatusMsg("");
      setFormData({ username: "", password: "", email: "", fullName: "", otpCode: "", newPassword: "" });
    });
  };

  return (
    <div ref={containerRef} className="smooth-scroll-container relative min-h-screen w-full bg-[#010206] text-white selection:bg-white/20 overflow-x-hidden font-sans">
      
      {/* 3D BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <Suspense fallback={null}><NebulaDust /></Suspense>
        </Canvas>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/30 via-transparent to-black" />
      </div>

      {/* 16 FLOWING ATMOSPHERIC SILVER DECORATIONS */}
      <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
        {[
          Shield, Lock, Activity, Cpu, Globe, Zap, Wallet, Landmark,
          Shield, Lock, Activity, Cpu, Globe, Zap, Wallet, Landmark
        ].map((Icon, idx) => (
          <div 
            key={idx}
            ref={el => iconRef.current[idx] = el}
            className="absolute opacity-10 lg:opacity-20 text-slate-400 drop-shadow-[0_0_6px_rgba(255,255,255,0.15)] transition-opacity"
            style={{ 
              top: `${6 + (idx * 5.8)}%`, 
              left: `${(idx % 2 === 0 ? 3 + (idx * 0.4) : 93 - (idx * 0.4))}%` 
            }}
          >
            <Icon size={idx % 3 === 0 ? 24 : idx % 3 === 1 ? 32 : 40} strokeWidth={1.2} />
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen w-full">
        
        {/* --- DESKTOP HERO SIDE (Dynamic Responsive layout for Standard Laptops) --- */}
        <div className="hidden lg:flex lg:w-[55%] xl:w-3/5 relative flex-col justify-center items-center p-6 xl:p-12 select-none">
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 800 600">
            <path d="M 150 200 Q 400 120 650 200" stroke="silver" fill="none" strokeWidth="0.75" strokeDasharray="6,6" />
            <path d="M 150 400 Q 400 480 650 400" stroke="silver" fill="none" strokeWidth="0.75" strokeDasharray="6,6" />
          </svg>

          <div className="relative flex flex-col items-center text-center">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-7xl xl:text-[9rem] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-300 to-slate-600 drop-shadow-[0_15px_40px_rgba(255,255,255,0.15)]">
              ESTRA
            </h1>
            <p className="mt-4 xl:mt-6 text-slate-400 tracking-[0.4em] xl:tracking-[0.6em] uppercase text-xs xl:text-sm font-black font-mono px-4 xl:px-6 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
              Enhancing Financial Flows
            </p>
          </div>
        </div>

        {/* --- DYNAMIC ACTION PANEL (Optimized container spaces for Medium Screens / Small Laptops) --- */}
        <div className="w-full lg:w-[45%] xl:w-2/5 flex items-center justify-center p-4 sm:p-8 md:p-12 min-h-screen">
          
          <div 
            ref={capsuleRef} 
            className="w-full max-w-[420px] sm:max-w-[450px] lg:max-w-[410px] xl:max-w-[460px] bg-gradient-to-br from-white/[0.08] via-slate-950/[0.4] to-white/[0.01] backdrop-blur-[35px] border border-white/15 rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 lg:p-10 xl:p-12 shadow-2xl relative overflow-hidden transition-all"
          >
            {/* Top Brand Identity */}
            <div className="flex flex-col items-center mb-6 sm:mb-8 lg:mb-6 xl:mb-10">
               <h1 className="text-4xl sm:text-5xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-300 to-slate-500 italic">ESTRA</h1>
               <div className="flex items-center gap-3 w-full mt-3">
                 <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
                 <p className="text-[10px] tracking-[0.25em] text-slate-400 uppercase font-extrabold whitespace-nowrap">Secure Banking Gateway</p>
                 <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
               </div>
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-5 sm:gap-6 xl:gap-7">
              <div className="form-header-labels space-y-1 text-center lg:text-left">
                {statusMsg && (
                  <div className="bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2 mb-2">
                    <p className="text-[13px] text-slate-300 font-extrabold tracking-wide text-center lg:text-left">{statusMsg}</p>
                  </div>
                )}
                <h2 className="text-2xl sm:text-3xl lg:text-2xl xl:text-3xl font-black tracking-[0.12em] bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent uppercase">
                  {mode === "login" ? "Sign In" : mode === "signup" ? (step === 1 ? "Create Account" : "Set Details") : "Reset Password"}
                </h2>
                <p className="text-slate-400 text-xs tracking-wide font-medium">Please enter your details below.</p>
              </div>

              {/* INPUT FIELDS AREA */}
              <div className="input-group flex flex-col gap-3.5 xl:gap-4">
                {mode === "login" && (
                  <>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input key="login-user" name="username" value={formData.username} onChange={handleChange} type="text" placeholder="Username" className="w-full bg-black/60 border border-white/10 rounded-xl pl-12 pr-5 py-3 xl:py-3.5 outline-none focus:border-white/40 transition-all text-[15px] font-medium text-white placeholder:text-slate-500 shadow-inner" required />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input key="login-pass" name="password" value={formData.password} onChange={handleChange} type={showLoginPassword ? "text" : "password"} placeholder="Password" className="w-full bg-black/60 border border-white/10 rounded-xl pl-12 pr-12 py-3 xl:py-3.5 outline-none focus:border-white/40 transition-all text-[15px] font-medium text-white placeholder:text-slate-500 shadow-inner" required />
                      <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer focus:outline-none">
                        {showLoginPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </>
                )}

                {mode === "signup" && (
                  <>
                    {step === 1 ? (
                      <>
                        <div className="relative">
                          <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input key="signup-name" name="fullName" value={formData.fullName} onChange={handleChange} type="text" placeholder="Full Name" className="w-full bg-black/60 border border-white/10 rounded-xl pl-12 pr-5 py-3 xl:py-3.5 outline-none focus:border-white/40 transition-all text-[15px] font-medium text-white placeholder:text-slate-500 shadow-inner" required />
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input key="signup-email" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Email Address" className="w-full bg-black/60 border border-white/10 rounded-xl pl-12 pr-5 py-3 xl:py-3.5 outline-none focus:border-white/40 transition-all text-[15px] font-medium text-white placeholder:text-slate-500 shadow-inner" required />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative">
                          <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input key="signup-user" name="username" value={formData.username} onChange={handleChange} type="text" placeholder="Choose Username" className="w-full bg-black/60 border border-white/10 rounded-xl pl-12 pr-5 py-3 xl:py-3.5 outline-none focus:border-white/40 transition-all text-[15px] font-medium text-white placeholder:text-slate-500 shadow-inner" required />
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input key="signup-pass" name="password" value={formData.password} onChange={handleChange} type={showSignupPassword ? "text" : "password"} placeholder="Password (Minimum 8 Characters)" className="w-full bg-black/60 border border-white/10 rounded-xl pl-12 pr-12 py-3 xl:py-3.5 outline-none focus:border-white/40 transition-all text-[15px] font-medium text-white placeholder:text-slate-500 shadow-inner" required />
                          <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer focus:outline-none">
                            {showSignupPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {mode === "forgot" && (
                  <>
                    {step === 1 ? (
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input key="forgot-email" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Enter Registered Email" className="w-full bg-black/60 border border-white/10 rounded-xl pl-12 pr-5 py-3 xl:py-3.5 outline-none focus:border-white/40 transition-all text-[15px] font-medium text-white placeholder:text-slate-500 shadow-inner" required />
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input key="forgot-code" name="otpCode" value={formData.otpCode} onChange={handleChange} type="text" placeholder="6-Digit Verification Code" className="w-full bg-black/60 border border-white/10 rounded-xl pl-12 pr-5 py-3 xl:py-3.5 outline-none focus:border-white/40 transition-all text-[15px] font-medium text-white placeholder:text-slate-500 shadow-inner" required />
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input key="forgot-newpass" name="newPassword" value={formData.newPassword} onChange={handleChange} type={showResetPassword ? "text" : "password"} placeholder="Enter New Password" className="w-full bg-black/60 border border-white/10 rounded-xl pl-12 pr-12 py-3 xl:py-3.5 outline-none focus:border-white/40 transition-all text-[15px] font-medium text-white placeholder:text-slate-500 shadow-inner" required />
                          <button type="button" onClick={() => setShowResetPassword(!showResetPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer focus:outline-none">
                            {showResetPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* FORGOT PASSWORD EXTRA ACTION LINK */}
              {mode === "login" && (
                <div className="text-right px-1 -mt-1">
                  <button type="button" onClick={switchToForgot} className="text-sm font-bold text-slate-400 hover:text-white transition-colors cursor-pointer">
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* PROTOCOLS TICK BOX */}
              {mode === "signup" && step === 2 && (
                <div className="flex items-start gap-3 px-1 cursor-pointer group/tick select-none" onClick={() => setIsTicked(!isTicked)}>
                  <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${isTicked ? 'bg-white border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'border-white/20 group-hover/tick:border-white/40'}`}>
                    {isTicked && <CheckCircle2 size={14} className="text-black" />}
                  </div>
                  <span className={`text-[12px] font-bold tracking-wide transition-colors leading-tight ${isTicked ? 'text-white' : 'text-slate-400'}`}>
                    I agree to the Terms of Service and Privacy Policy.
                  </span>
                </div>
              )}

              {/* ACTION EXECUTION SUBMIT BUTTON */}
              <div className="space-y-3 pt-1">
                <button 
                  type={(mode === "signup" && step === 1) ? "button" : "submit"}
                  onClick={(mode === "signup" && step === 1) ? handleNextSlide : undefined}
                  disabled={
                    (mode === "login" && !isLoginValid) ||
                    (mode === "signup" && step === 1 && !isSignupStep1Valid) ||
                    (mode === "signup" && step === 2 && !isSignupStep2Valid) ||
                    (mode === "forgot" && step === 1 && !isForgotStep1Valid) ||
                    (mode === "forgot" && step === 2 && !isForgotStep2Valid)
                  }
                  className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-[14px] transition-all duration-300 relative overflow-hidden group/btn cursor-pointer
                  ${((mode === "login" && !isLoginValid) || (mode === "signup" && step === 1 && !isSignupStep1Valid) || (mode === "signup" && step === 2 && !isSignupStep2Valid) || (mode === "forgot" && step === 1 && !isForgotStep1Valid) || (mode === "forgot" && step === 2 && !isForgotStep2Valid)) 
                    ? 'bg-white/5 text-slate-600 cursor-not-allowed opacity-40' 
                    : 'bg-white text-black hover:scale-[1.015]'}`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {mode === "login" ? "Login to Vault" : mode === "signup" ? (step === 1 ? "Next Step" : "Complete Registration") : (step === 1 ? "Send Reset Code" : "Confirm New Password")} <ArrowRight size={16} />
                  </span>
                </button>

                <button 
                  type="button"
                  onClick={toggleAuth}
                  className="w-full text-center text-sm tracking-wider text-slate-400 hover:text-white transition-all font-bold uppercase py-1 cursor-pointer"
                >
                  {mode === "login" ? "Don't have an account? Sign Up" : "Back to Login Screen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* STYLING RULES & SMOOTH SCROLL BEHAVIOR SETUP */}
      <style>{`
        html {
          scroll-behavior: smooth;
        }
        .smooth-scroll-container {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
};

export default Auth;
