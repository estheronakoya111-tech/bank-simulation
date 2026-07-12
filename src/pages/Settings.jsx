import React, { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { Shield, Lock, Landmark, Wallet, CheckCircle2, User, Mail, Eye, EyeOff, ArrowLeft, ArrowRight, Activity, Cpu, Globe, Zap, Users } from "lucide-react";

// --- 1. LIGHTWEIGHT NEBULA BACKGROUND (Fixed component structure to prevent WebGL crash) ---
function NebulaDust() {
  const ref = useRef();
  const [points] = useState(() => {
    const p = new Float32Array(750 * 3);
    for (let i = 0; i < 750 * 3; i++) p[i] = (Math.random() - 0.5) * 10;
    return p;
  });
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.03;
      ref.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#3b82f6"
        size={0.04}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

const Settings = ({ onBack }) => {
  // --- APPLICATION STATE ---
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Admin toggle visibility state for the registered users table matrix
  const [showAdminTable, setShowAdminTable] = useState(false);

  // PASSWORD VISIBILITY STATE TOGGLES
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // API Bound Payload States
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '' });
  const [history, setHistory] = useState([]);
  const [searchAccNum, setSearchAccNum] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);

  // Base URL from env
  const API_BASE = import.meta.env.VITE_BANK_BACKEND_URL;

  // --- GSAP ANIMATION REFS ---
  const viewContainerRef = useRef(null);
  const sidebarRef = useRef(null);
  const paneContentRef = useRef(null);

  // --- BACKEND INTEGRATION HELPERS ---
  const getAuthToken = () => sessionStorage.getItem('estra_token');
  const getUserRole = () => sessionStorage.getItem('estra_role'); 

  // Dynamic header factory invocation helper ensuring active token capture
  const getRequestHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
  });

  const triggerNotification = (text, type = 'success') => {
    setMessage({ text, type });
    gsap.fromTo('.system-banner', 
      { y: -20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // --- GSAP TIMELINE ORCHESTRATION ---
  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(sidebarRef.current, 
        { x: -40, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 0.7 }
      ).fromTo(paneContentRef.current, 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.7 }, 
        '-=0.4'
      );
    }, viewContainerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo('.tab-view-panel', 
        { opacity: 0, x: 15, scale: 0.99 }, 
        { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: 'power2.out' }
      );

      if (document.querySelectorAll('.ledger-row').length > 0) {
        gsap.fromTo('.ledger-row', 
          { opacity: 0, y: 12 }, 
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.03, ease: 'power1.out', clearProps: 'all' }
        );
      }
    }, paneContentRef);

    if (activeTab === 'history') fetchLedgerHistory();
    if (activeTab === 'admin' && getUserRole() === 'admin') {
      fetchAdminMetrics();
    }

    return () => ctx.revert();
  }, [activeTab]);

  // --- BACKEND API INTERACTION HANDLERS ---
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/change_password`, {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify(passwordData)
      });
      const data = await response.json();
      
      if (response.ok) {
        triggerNotification(data.message || 'Password updated successfully.');
        setPasswordData({ old_password: '', new_password: '' });
      } else {
        triggerNotification(data.message || 'Verification rejected.', 'error');
      }
    } catch (err) {
      triggerNotification('Failed connection to authorization terminal.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLedgerHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/history`, { method: 'GET', headers: getRequestHeaders() });
      const data = await response.json();
      if (response.ok) {
        setHistory(data);
      } else {
        triggerNotification('Failed syncing historical logs.', 'error');
      }
    } catch (err) {
      triggerNotification('Protocol validation timeout error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDirectoryQuery = async (e) => {
    e.preventDefault();
    if (!searchAccNum) return;
    setLoading(true);
    setSearchResult(null);
    try {
      const response = await fetch(`${API_BASE}/search_account/${searchAccNum}`, { method: 'GET', headers: getRequestHeaders() });
      const data = await response.json();
      if (response.ok) {
        setSearchResult({ success: true, username: data.username });
      } else {
        setSearchResult({ success: false, message: data.message || 'Account not found.' });
      }
    } catch (err) {
      triggerNotification('Directory lookup connection failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const executeAccountDecommission = async () => {
    const fullyConfirm = window.confirm("CRITICAL WARNING: Deleting your account is permanent! You will lose all your money, balances, and history from the ESTRA ledger core. Do you wish to proceed?");
    if (!fullyConfirm) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/delete_account`, { method: 'DELETE', headers: getRequestHeaders() });
      const data = await response.json();
      if (response.ok) {
        triggerNotification(data.message || 'Account deleted successfully. Logging out...');
        setTimeout(() => {
          sessionStorage.clear();
          window.location.href = '/login';
        }, 2000);
      } else {
        triggerNotification(data.message || 'System core rejected request.', 'error');
      }
    } catch (err) {
      triggerNotification('Purge execution error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/users`, { method: 'GET', headers: getRequestHeaders() });
      const data = await response.json();
      if (response.ok) {
        setAdminUsers(data);
      } else {
        triggerNotification(data.message || 'Access Forbidden: Invalid Administrative Claims.', 'error');
      }
    } catch (err) {
      triggerNotification('Failed connection to administrative database nodes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={viewContainerRef} className="min-h-screen w-full bg-[#010206] text-zinc-300 font-sans antialiased selection:bg-blue-500/20 selection:text-blue-300 overflow-y-auto scroll-smooth">
      
      {/* REDUCED 3D NEBULA CANVAS LAYER */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <Suspense fallback={null}>
            <NebulaDust />
          </Suspense>
        </Canvas>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/20 via-transparent to-black" />
      </div>

      {/* FIXED CONTAINER TOP GAP HEIGHT */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-2 pb-12 sm:pt-4 lg:pt-6">
        
        {/* TOP ROW HEADER BAR */}
        <div className="w-full flex justify-between items-center mb-6 shrink-0">
          <button 
            onClick={onBack} 
            aria-label="Go back to dashboard"
            className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all duration-300 group backdrop-blur-md cursor-pointer focus:outline-none shadow-xl relative z-20"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300 text-white" />
          </button>
          <span className="text-[10px] font-mono tracking-[0.4em] text-white/40 uppercase">
            Estra // System Settings
          </span>
        </div>

        {/* RESPONSIVE LAYOUT MATRIX */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* NAVIGATION BAR PANEL */}
          <div 
            ref={sidebarRef} 
            className="w-full lg:w-80 bg-[#0a0d18]/70 border border-zinc-800/50 p-4 sm:p-6 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between lg:block mb-0 lg:mb-8">
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-500 bg-clip-text text-transparent">Control Panel</h2>
                <p className="text-xs text-zinc-500 hidden lg:block mt-1">Manage your account preferences</p>
              </div>
              
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="lg:hidden flex items-center px-3 py-2 rounded-xl border border-zinc-800 bg-[#0f1324] text-zinc-300 text-xs font-semibold tracking-wide active:scale-95 transition-transform"
              >
                {mobileMenuOpen ? 'Close Menu' : 'View Tabs'}
              </button>
            </div>

            <nav className={`flex-col gap-1.5 mt-4 lg:mt-0 ${mobileMenuOpen ? 'flex' : 'hidden lg:flex'}`}>
              <button
                onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:scale-[1.01] ${
                  activeTab === 'profile'
                    ? 'bg-[#12162b] text-white border-l-4 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'
                }`}
              >
                <span className="text-sm">🛡️</span> Security Profile
              </button>

              <button
                onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:scale-[1.01] ${
                  activeTab === 'history'
                    ? 'bg-[#12162b] text-white border-l-4 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'
                }`}
              >
                <span className="text-sm">📜</span> Account History
              </button>

              <button
                onClick={() => { setActiveTab('search'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:scale-[1.01] ${
                  activeTab === 'search'
                    ? 'bg-[#12162b] text-white border-l-4 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'
                }`}
              >
                <span className="text-sm">🔍</span> Find Account
              </button>

              {getUserRole() === 'admin' && (
                <div className="pt-4 mt-3 border-t border-zinc-800/60">
                  <button
                    onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 hover:scale-[1.01] ${
                      activeTab === 'admin'
                        ? 'bg-purple-950/30 text-purple-200 border-l-4 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.15)]'
                        : 'text-purple-400/70 hover:text-purple-300 hover:bg-purple-950/10'
                    }`}
                  >
                    <span className="text-sm">👑</span> Admin Master Panel
                  </button>
                </div>
              )}
            </nav>
          </div>

          {/* DYNAMIC VIEWPANE CONTENT AREA */}
          <div 
            ref={paneContentRef} 
            className="flex-1 w-full bg-[#0a0d18]/30 border border-zinc-800/40 p-5 sm:p-8 lg:p-10 rounded-2xl shadow-xl backdrop-blur-sm min-h-[520px]"
          >
            {/* NOTIFICATION ALERTS BANNER */}
            {message.text && (
              <div className={`system-banner mb-6 p-4 rounded-xl text-xs sm:text-sm font-semibold border backdrop-blur-md shadow-lg flex items-center gap-3 ${
                message.type === 'error'
                  ? 'bg-red-950/20 border-red-900/40 text-red-400 shadow-red-950/10'
                  : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400 shadow-emerald-950/10'
              }`}>
                <span className="text-base">{message.type === 'error' ? '⚡' : '✨'}</span>
                {message.text}
              </div>
            )}

            {loading && (
              <div className="text-[11px] font-bold text-blue-400 tracking-widest uppercase mb-6 flex items-center gap-2 bg-blue-950/10 border border-blue-900/20 w-fit px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                Updating settings context...
              </div>
            )}

            {/* SECURITY PROFILE Tab View */}
            {activeTab === 'profile' && (
              <div className="tab-view-panel">
                <h3 className="text-xl font-bold tracking-tight text-white mb-1">Change Password</h3>
                <p className="text-xs sm:text-sm text-zinc-500 mb-8">Update your digital security credentials here.</p>

                <form onSubmit={handlePasswordUpdate} className="max-w-md space-y-5 mb-10">
                  <div className="relative">
                    <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-2.5">Current Password</label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? "text" : "password"}
                        required
                        value={passwordData.old_password}
                        onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                        className="w-full bg-[#04060d] border border-zinc-800 focus:border-blue-500/40 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white font-mono outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(59,130,246,0.08)]"
                      />
                      <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer focus:outline-none">
                        {showOldPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-2.5">New Secure Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        className="w-full bg-[#04060d] border border-zinc-800 focus:border-blue-500/40 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white font-mono outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(59,130,246,0.08)]"
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer focus:outline-none">
                        {showNewPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs tracking-wider uppercase rounded-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-white/5 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </form>

                {/* DESTRUCTIVE OPERATIONS PANEL */}
                <div className="border border-red-950 bg-red-950/10 p-5 sm:p-6 rounded-2xl max-w-xl mt-12">
                  <h4 className="text-red-400 font-bold tracking-tight text-sm sm:text-base mb-1">Danger Zone</h4>
                  <p className="text-xs text-zinc-500 mb-5 leading-relaxed">Deleting your account is permanent. All your transaction configurations, balances, and historical logs will be completely cleared from our network system database.</p>
                  
                  <button
                    onClick={executeAccountDecommission}
                    className="w-full sm:w-auto px-5 py-3 bg-red-600/10 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-400 text-xs font-bold tracking-widest uppercase rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(220,38,38,0.15)] cursor-pointer"
                  >
                    Delete My Account
                  </button>
                </div>
              </div>
            )}

            {/* TRANSACTIONS HISTORY Tab View */}
            {activeTab === 'history' && (
              <div className="tab-view-panel">
                <h3 className="text-xl font-bold tracking-tight text-white mb-1">Account History Statement</h3>
                <p className="text-xs sm:text-sm text-zinc-500 mb-8">Audited records generated from your live financial activities.</p>

                {history.length > 0 && history[0].message ? (
                  <div className="p-6 bg-[#04060d] border border-zinc-800/80 rounded-2xl max-w-xl shadow-inner">
                    <p className="text-xs sm:text-sm text-zinc-400 italic">"{history[0].message}"</p>
                    <div className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase mt-3">Active Account Scope: {history[0].user}</div>
                  </div>
                ) : history.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-zinc-800/50 bg-[#04060d]/40">
                    <table className="w-full border-collapse text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800/80 bg-[#070912]/80 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                          <th className="px-5 py-4">Transaction Type</th>
                          <th className="px-5 py-4">Amount</th>
                          <th className="px-5 py-4">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/60 text-zinc-300 font-mono">
                        {history.map((t, idx) => (
                          <tr key={idx} className="ledger-row hover:bg-zinc-900/10 transition-colors duration-150">
                            <td className="px-5 py-4 font-sans font-semibold tracking-wide">
                              <span className={`inline-block px-2.5 py-1 text-[9px] uppercase font-bold rounded-md tracking-wider ${
                                t.type.toLowerCase().includes('received') || t.type.toLowerCase().includes('deposit')
                                  ? 'bg-emerald-500/5 text-emerald-400 border border-emerald-500/10'
                                  : 'bg-blue-500/5 text-blue-400 border border-blue-500/10'
                              }`}>{t.type}</span>
                            </td>
                            <td className="px-5 py-4 text-white font-bold">${parseFloat(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="px-5 py-4 text-xs text-zinc-500">{t.timestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  !loading && <p className="text-xs sm:text-sm text-zinc-600 italic">No previous transaction entries found.</p>
                )}
              </div>
            )}

            {/* GLOBAL FIND ACCOUNT Tab View */}
            {activeTab === 'search' && (
              <div className="tab-view-panel">
                <h3 className="text-xl font-bold tracking-tight text-white mb-1">Find Customer Account</h3>
                <p className="text-xs sm:text-sm text-zinc-500 mb-8">Search network records to instantly verify user identity tokens.</p>

                <form onSubmit={handleAccountDirectoryQuery} className="flex flex-col sm:flex-row gap-3 max-w-lg mb-8">
                  <input
                    type="text"
                    maxLength="10"
                    placeholder="Enter 10-Digit Account Number..."
                    value={searchAccNum}
                    onChange={(e) => setSearchAccNum(e.target.value)}
                    className="w-full bg-[#04060d] border border-zinc-800 focus:border-blue-500/40 rounded-xl px-4 py-3.5 text-sm text-white font-mono tracking-widest outline-none transition-all duration-300"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all duration-300 shadow-md shadow-blue-950/40 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    Search Directory
                  </button>
                </form>

                {searchResult && (
                  <div className="max-w-lg p-5 rounded-xl border border-zinc-800/80 bg-[#04060d]/80 shadow-md">
                    {searchResult.success ? (
                      <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Verified Account Holder: <span className="text-white font-black font-mono ml-1 text-sm">{searchResult.username}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-red-400">
                        <span>❌</span> Search Error: {searchResult.message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ADMIN CONSOLE Tab View */}
            {activeTab === 'admin' && getUserRole() === 'admin' && (
              <div className="tab-view-panel">
                <h3 className="text-xl font-bold tracking-tight text-purple-300 mb-1">Global System Registry</h3>
                <p className="text-xs sm:text-sm text-zinc-500 mb-6">Administrative overview console panel. Review systemic performance matrix states below.</p>

                {/* INTERACTIVE TOGGLE BUTTON TO REVEAL TOTAL REGISTERED USERS COUNT & MATRIX */}
                <div className="mb-8">
                  <button
                    type="button"
                    onClick={() => setShowAdminTable(!showAdminTable)}
                    className="flex items-center gap-3 px-5 py-3.5 bg-purple-900/20 hover:bg-purple-900/40 border border-purple-500/30 text-purple-200 text-xs font-bold tracking-wider uppercase rounded-xl transition-all duration-300 active:scale-[0.99] cursor-pointer shadow-xl"
                  >
                    <Users size={14} />
                    {showAdminTable ? "Hide System Database" : `Reveal System Users Grid (${adminUsers.length})`}
                  </button>
                </div>

                {showAdminTable ? (
                  adminUsers.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-purple-900/20 bg-[#04060d]/50 animate-fadeIn">
                      <table className="w-full border-collapse text-left text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-purple-900/20 bg-purple-950/5 text-[10px] font-bold uppercase tracking-widest text-purple-400">
                            <th className="px-5 py-4">Username</th>
                            <th className="px-5 py-4">Email Address</th>
                            <th className="px-5 py-4">Account Number</th>
                            <th className="px-5 py-4">Available Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-950/10 text-zinc-300 font-mono">
                          {adminUsers.map((u, idx) => (
                            <tr key={idx} className="ledger-row hover:bg-purple-950/5 transition-colors duration-150">
                              <td className="px-5 py-4 font-sans font-bold text-white">{u.username}</td>
                              <td className="px-5 py-4 text-zinc-500 text-xs font-sans">{u.email}</td>
                              <td className="px-5 py-4 text-zinc-400 tracking-wider text-xs">{u.acc}</td>
                              <td className="px-5 py-4 font-bold text-emerald-400">${parseFloat(u.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-600 italic px-2">No active profile logs stored inside the registry core arrays.</p>
                  )
                ) : (
                  <div className="p-8 border border-dashed border-purple-900/10 rounded-2xl bg-purple-950/[0.02] text-center text-xs text-zinc-500 max-w-xl">
                    User directory database is securely shielded. Trigger the override button above to read operational node data rows.
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;