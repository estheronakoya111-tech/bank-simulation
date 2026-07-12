import React, { useEffect, useRef } from 'react';
import { Shield, Mail, Database, Lock, Eye, CheckCircle, Cookie, Globe, UserX, Phone, ArrowLeft } from 'lucide-react';
import gsap from 'gsap';

const PrivacyPolicy = ({ onBack }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Smooth GSAP load-in animations
    const tl = gsap.timeline();
    tl.fromTo('.policy-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.policy-card', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, '-=0.3');

    // ==========================================
    // 3D NEBULA & 40 SHARP SILVER PARTICLES CANVAS
    // ==========================================
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class SilverParticle {
      constructor() {
        this.reset();
        // Distribute randomly across the screen initially
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 20;
        this.size = Math.random() * 3 + 1.5; // Sharp definition sizes
        this.speedY = -(Math.random() * 0.4 + 0.1); // Smooth slow floating upward
        this.speedX = Math.random() * 0.2 - 0.1;
        this.opacity = Math.random() * 0.5 + 0.25;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = Math.random() * 0.01 - 0.005;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.angle += this.spin;

        // Reset particle if it floats off-screen
        if (this.y < -20 || this.x < -20 || this.x > canvas.width + 20) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        
        // Render geometric sharp diamond/triangle shapes to simulate sharp silver shards
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size * 0.6, this.size * 0.6);
        ctx.lineTo(-this.size * 0.6, this.size * 0.6);
        ctx.closePath();

        // Metallic Silver color fill gradient profiles
        const gradient = ctx.createLinearGradient(-this.size, -this.size, this.size, this.size);
        gradient.addColorStop(0, `rgba(230, 235, 245, ${this.opacity})`);
        gradient.addColorStop(0.5, `rgba(140, 150, 165, ${this.opacity * 0.4})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${this.opacity * 0.9})`);
        
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(200, 215, 235, 0.3)";
        ctx.fill();
        ctx.restore();
      }
    }

    const initEngine = () => {
      resizeCanvas();
      particles = [];
      // Exactly 40 particles optimized loop
      for (let i = 0; i < 40; i++) {
        particles.push(new SilverParticle());
      }
    };

    const renderLoop = () => {
      // Clear canvas to process frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render Ambient Cosmic Nebula Glow Base
      const nebulaGlow = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.4, 10,
        canvas.width * 0.5, canvas.height * 0.4, Math.max(canvas.width, canvas.height) * 0.8
      );
      nebulaGlow.addColorStop(0, 'rgba(31, 40, 51, 0.12)');
      nebulaGlow.addColorStop(0.5, 'rgba(21, 27, 36, 0.04)');
      nebulaGlow.addColorStop(1, 'rgba(11, 12, 16, 0)');
      ctx.fillStyle = nebulaGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and paint sharp elements
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener('resize', resizeCanvas);
    initEngine();
    renderLoop();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#C5C6C7] font-sans px-4 py-16 md:px-8 relative overflow-hidden selection:bg-[#4E5154] selection:text-white">
      {/* Interactive Background Particle Layer */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Sleek Silver/Metallic Background Ambient Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-[#1F2833]/20 to-transparent rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-tl from-[#1F2833]/15 to-transparent rounded-full blur-[150px] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Back To Home Button Implementation */}
        <div className="w-full flex justify-start mb-6">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-slate-400 bg-[#151B24]/40 hover:bg-[#1F2833]/40 border border-white/5 hover:border-white/10 rounded-xl transition-all duration-300 backdrop-blur-md cursor-pointer group active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Header Section */}
        <div className="policy-header text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-[#1F2833]/40 rounded-full mb-4 text-white shadow-inner">
            <Shield className="w-8 h-8 text-slate-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3 bg-gradient-to-r from-white via-slate-300 to-slate-500 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-sm font-medium text-slate-500 tracking-wider uppercase">
            Last Updated: July 12, 2026
          </p>
        </div>

        {/* Introduction Panel */}
        <div className="policy-card bg-gradient-to-b from-[#1F2833]/40 to-[#151B24]/40 backdrop-blur-md rounded-2xl p-6 md:p-8 mb-8 shadow-2xl">
          <p className="text-lg text-slate-300 leading-relaxed">
            Welcome to Estra. Your privacy is structurally vital to us. This Privacy Policy explains exactly how we collect, use, and shield your information when processing transactions and active operations across our application infrastructure.
          </p>
        </div>

        {/* Content Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Information We Collect */}
          <div className="policy-card bg-[#151B24]/50 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-white">
              <Eye className="w-5 h-5 text-slate-400" />
              <h2 className="text-xl font-bold tracking-wide">Information We Collect</h2>
            </div>
            <ul className="space-y-3 text-slate-400">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0" />
                <span>Name <span className="text-xs text-slate-600">(if explicitly provided)</span></span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0" />
                <span>Email address communication endpoints</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0" />
                <span className="text-slate-300 font-medium">Account credentials (stored via cryptographic hashing)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0" />
                <span>Dynamic session parameters provided during banking platform interactions</span>
              </li>
            </ul>
          </div>

          {/* How We Use Your Information */}
          <div className="policy-card bg-[#151B24]/50 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-white">
              <CheckCircle className="w-5 h-5 text-slate-400" />
              <h2 className="text-xl font-bold tracking-wide">How We Use Your Information</h2>
            </div>
            <ul className="space-y-3 text-slate-400">
              {[
                "Deploy, scale, and manage user financial account pipelines",
                "Execute identity validation protocols via secure email verification links or One-Time Passwords (OTP)",
                "Optimize core processing logic paths and enhance transaction interface speeds",
                "Process backend diagnostic feedback and system error support workflows",
                "Enforce multi-layered perimeter security measures on system logins"
              ].map((text, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cookies and Local Storage */}
        <div className="policy-card bg-[#151B24]/50 backdrop-blur-md rounded-2xl p-6 md:p-8 mb-8 shadow-xl">
          <div className="flex items-center gap-3 mb-4 text-white">
            <Cookie className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-bold tracking-wide">Cookies and Local Storage</h2>
          </div>
          <p className="text-slate-400 leading-relaxed mb-3">
            We utilize secure JSON Web Tokens (JWT) and browser browser-side local storage mechanisms to retain your active authentication state. This prevents you from needing to re-authenticate during every state transition. 
          </p>
          <p className="text-sm text-slate-500">
            You can modify your hardware device parameters to block session storage tokens; however, this will entirely disrupt the authorization layer of your account.
          </p>
        </div>

        {/* Data Storage & Security */}
        <div className="policy-card bg-[#151B24]/50 backdrop-blur-md rounded-2xl p-6 md:p-8 mb-8 shadow-xl">
          <div className="flex items-center gap-3 mb-4 text-white">
            <Lock className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-bold tracking-wide">Data Storage and Security</h2>
          </div>
          <p className="text-slate-400 leading-relaxed">
            We maintain isolated encryption barriers and security mechanisms designed to secure your analytical inputs against illicit access, degradation, or structural exploitation. While we constantly enforce baseline parameters to protect your data matrix, no transit engine over the internet or cold database system is completely absolute.
          </p>
        </div>

        {/* Third-Party Architectures */}
        <div className="policy-card bg-[#151B24]/50 backdrop-blur-md rounded-2xl p-6 md:p-8 mb-8 shadow-xl">
          <h2 className="text-xl font-bold tracking-wide text-white mb-6">Trusted Infrastructure Integration</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Supabase Card */}
            <div className="p-4 bg-[#1F2833]/20 rounded-xl flex items-start gap-4">
              <div className="p-2 bg-[#1A222D] rounded-lg text-slate-400 mt-1">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-md">Supabase</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Cloud database engine providing continuous isolation layers for data tables.
                </p>
              </div>
            </div>

            {/* Google Gmail Card */}
            <div className="p-4 bg-[#1F2833]/20 rounded-xl flex items-start gap-4">
              <div className="p-2 bg-[#1A222D] rounded-lg text-slate-400 mt-1">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-md">Google Gmail System</h3>
                <p className="text-xs text-slate-500 mt-1">
                  SMTP node architecture processing transmission arrays for authorization paths and One-Time Passwords (OTP).
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Global Rights and Sharing Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="policy-card bg-[#151B24]/50 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2 tracking-wide">Data Sharing</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              We operate under absolute zero-monetization storage protocols. We never sell, broadcast, or lease user parameter profiles to external entities unless explicitly required for infrastructure processing loops or runtime legal warrants.
            </p>
          </div>
          
          <div className="policy-card bg-[#151B24]/50 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2 tracking-wide">Your Technical Rights</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              You retain strict root controls over your database record profile. You have full structural rights to query access parameters, initiate data schema overrides, or trigger complete, destructive account erasure commands at any point.
            </p>
          </div>
        </div>

        {/* Data Transfers & Children Privacy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="policy-card bg-[#151B24]/50 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-2.5 mb-3 text-white">
              <Globe className="w-4 h-4 text-slate-400" />
              <h3 className="text-lg font-bold tracking-wide">Cross-Border Transfers</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your data parameters may be processed outside your home administrative district through our Supabase cluster nodes. By registering a profile inside this framework, you consent to this encrypted routing sequence.
            </p>
          </div>
          
          <div className="policy-card bg-[#151B24]/50 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-2.5 mb-3 text-white">
              <UserX className="w-4 h-4 text-slate-400" />
              <h3 className="text-lg font-bold tracking-wide">Children's Privacy Protection</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Our operations do not target users under the age of 13. If we intercept data packets suggesting a profile belongs to an unverified minor without authorization, the record matrix will be scrubbed instantly.
            </p>
          </div>
        </div>

        {/* Footer System & Secure Contact Node */}
        <div className="policy-card bg-gradient-to-r from-[#151B24]/70 via-[#1F2833]/20 to-[#151B24]/70 backdrop-blur-md rounded-2xl p-6 text-center shadow-xl">
          <h3 className="text-md font-bold text-white mb-2">Policy Updates & Contact Nodes</h3>
          <p className="text-xs text-slate-500 max-w-xl mx-auto mb-4 leading-relaxed">
            We reserve the option to modify this protection architecture dynamically. System alterations will display automatically on this endpoint interface alongside updated tracking metadata.
          </p>
          
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent my-4" />
          
          {/* Official Contact Nodes */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-4 text-sm text-slate-300">
            <a href="mailto:estradigitalbanking@gmail.com" className="flex items-center gap-2 group transition-colors duration-200 hover:text-white">
              <Mail className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
              <span>estheronakoya111@gmail.com</span>
            </a>
            <div className="hidden sm:block w-1.5 h-1.5 bg-slate-700 rounded-full" />
            <a href="tel:+2349072334109" className="flex items-center gap-2 group transition-colors duration-200 hover:text-white">
              <Phone className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
              <span>+2349072334109</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;