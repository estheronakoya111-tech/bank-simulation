import React, { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import * as THREE from "three";
import { 
  ArrowLeft, Cpu, ArrowUpRight, ArrowDownLeft, 
  X, AlertCircle, Fingerprint, Database,
  ShieldCheck, Zap, Layers, Activity as ActivityIcon
} from "lucide-react";

// --- WEIGHTLESS SILVER CRYSTALLINE DUST ENGINE ---
function FloatingActivityDust() {
  const meshRef = useRef();
  const isMobile = window.innerWidth < 1024;
  const count = isMobile ? 25 : 55;

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 40;
    return pos;
  });

  useFrame((state) => {
    if (meshRef.current) {
      const pos = meshRef.current.geometry.attributes.position.array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] += 0.015; // Slow upward drift
        if (pos[i] > 20) pos[i] = -20;
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color="#d1d5db" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </points>
  );
}

const Activity = ({ onBack }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [filter, setFilter] = useState("all");

  const isStealthActive = localStorage.getItem("estra_blur_active") === "true";
  const isMaskActive = sessionStorage.getItem("estra_mask_active") === "true";
  
  const mainContainerRef = useRef(null);
  const scrollContainerRef = useRef(null);
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

  const scrambleText = (element, targetText, duration = 0.6) => {
    if (!element) return;
    const chars = "0123456789.+$"; // Only numbers for loading animation
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
      setLoading(true);
      const token = sessionStorage.getItem("estra_token");
      const response = await fetch(`${import.meta.env.VITE_BANK_BACKEND_URL}/history`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });
      const data = await response.json();
      
      if (!data || !Array.isArray(data) || data.length === 0 || data.message) {
        setHistory([{
          id: "TXN-001",
          type: "Money Received",
          amount: "1000.00",
          timestamp: "Account Opened",
          sender: "Estra Bank",
          note: "Welcome credit deposited to your account."
        }]);
      } else {
        const mappedData = data.map((item, index) => {
          const rawType = item.type || "";
          const isIncoming = rawType.toLowerCase().includes('received') || rawType.toLowerCase().includes('deposit');
          return {
            id: `TXN-${index}-${Math.floor(Math.random()*1000)}`,
            type: isIncoming ? "Money Received" : "Money Sent",
            amount: item.amount || "0.00",
            timestamp: item.timestamp || "Today",
            sender: isIncoming ? "Bank Transfer" : "Account Transfer",
            note: item.type || "Transaction successful."
          };
        });
        setHistory(mappedData);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    gsap.fromTo(".intel-panel, .audit-panel", { opacity: 0 }, { opacity: 1, duration: 0.6 });
  }, []);

  useEffect(() => {
    if (!loading && filteredHistory.length > 0) {
      const cards = document.querySelectorAll(".txn-amount-text");
      cards.forEach((card) => {
        const finalValue = card.getAttribute("data-final-value");
        scrambleText(card, finalValue, 0.5);
      });
    }
  }, [loading, filter, history]);

  const handleCardMouseMove = (e, index) => {
    const card = cardRefs.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const angleX = (rect.height / 2 - y) / 20;
    const angleY = (x - rect.width / 2) / 20;
    gsap.to(card, { transform: `perspective(600px) rotateX(${angleX}deg) rotateY(${angleY}deg)`, duration: 0.3 });
  };

  const handleCardMouseLeave = (index) => {
    const card = cardRefs.current[index];
    if (!card) return;
    gsap.to(card, { transform: "perspective(600px) rotateX(0deg) rotateY(0deg)", duration: 0.4 });
  };

  const filteredHistory = history.filter(item => {
    if (filter === "all") return true;
    if (filter === "received") return item.type === "Money Received";
    if (filter === "sent") return item.type === "Money Sent";
    return true;
  });

  return (
    <div ref={mainContainerRef} className="min-h-screen w-full bg-[#020408] text-white flex flex-col items-center relative overflow-hidden font-sans z-10">
      
      {/* WEIGHTLESS THREE.JS BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <Suspense fallback={null}><FloatingActivityDust /></Suspense>
        </Canvas>
      </div>

      <header className="w-full max-w-7xl flex gap-4 justify-between items-center px-6 py-8 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 cursor-pointer">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-xl font-bold uppercase tracking-widest">Transactions</h1>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl">
          {['all', 'received', 'sent'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase ${filter === f ? 'bg-white text-black' : 'text-white/50'}`}>
              {f}
            </button>
          ))}
        </div>
      </header>

      <main className="w-full max-w-7xl flex flex-grow gap-6 px-6 py-6 z-20">
        <section className="w-full lg:flex-grow space-y-3">
          {loading ? <div className="text-center">Syncing...</div> : filteredHistory.map((txn, index) => (
            <div key={txn.id} ref={(el) => (cardRefs.current[index] = el)} onMouseMove={(e) => handleCardMouseMove(e, index)} onMouseLeave={() => handleCardMouseLeave(index)} onClick={() => setSelectedTxn(txn)} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex justify-between items-center cursor-pointer hover:bg-white/10 transition-all">
               <div>
                 <p className="text-[10px] text-white/50">{txn.timestamp}</p>
                 <h3 className="text-sm font-bold">{txn.sender}</h3>
               </div>
               <p className="text-sm font-mono txn-amount-text" data-final-value={`${txn.type === 'Money Received' ? "+" : "-"}${txn.amount}`}>{txn.amount}</p>
            </div>
          ))}
        </section>
      </main>

      {selectedTxn && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
           <div className="w-full max-w-sm bg-[#03050a] p-8 rounded-[40px] border border-white/10">
              <h2 className="text-2xl font-bold mb-4">{selectedTxn.amount}</h2>
              <p className="text-white/50 mb-6">{selectedTxn.note}</p>
              <button onClick={() => setSelectedTxn(null)} className="w-full py-3 bg-white text-black rounded-xl font-bold text-xs uppercase">Close</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Activity;
