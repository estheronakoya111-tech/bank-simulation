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
  const [selectedTransaction, setSelectedTransaction] = useState(null);
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

  // Modified to show only integers during loading animation
  const countUpAnimation = (element, targetValue, duration = 0.6) => {
    if (!element) return;
    const numericTarget = parseInt(targetValue.replace(/[^0-9]/g, ''));
    let start = 0;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = Math.floor(progress * numericTarget);
      
      element.innerText = currentValue.toString();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.innerText = targetValue;
      }
    };
    
    requestAnimationFrame(animate);
  };

  const fetchHistory = async () => {
    try {
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
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        setHistory([
          {
            id: "INIT-001",
            type: "Deposit",
            amount: "1000.00",
            timestamp: "Initial Balance",
            sender: "System Account",
            note: "Welcome bonus"
          }
        ]);
      } else {
        const mappedData = data.map((item, index) => {
          const isDeposit = item.type?.toLowerCase().includes('deposit') || 
                             item.type?.toLowerCase().includes('received');
          
          return {
            id: `TXN-${1000 + index}`,
            type: isDeposit ? "Deposit" : "Withdrawal",
            amount: item.amount || "0.00",
            timestamp: item.timestamp || "Today",
            sender: isDeposit ? "External" : "Your Account",
            note: item.type || "Standard Transaction"
          };
        });
        setHistory(mappedData);
      }
    } catch (err) {
      console.error("Fetch failed", err);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Setup logic for 3D canvas remains standard
  }, []);

  useEffect(() => {
    if (!loading) {
      const cards = document.querySelectorAll(".amount-counter");
      cards.forEach((card, index) => {
        const finalValue = card.getAttribute("data-final-value");
        setTimeout(() => {
          countUpAnimation(card, finalValue);
        }, index * 100);
      });
    }
  }, [loading, filter]);

  return (
    <div ref={mainContainerRef} className="min-h-screen w-full bg-[#020408] text-white flex flex-col items-center">
      <canvas ref={threeCanvasRef} className="absolute inset-0 z-0" />
      
      <header className="w-full max-w-7xl flex justify-between items-center px-8 py-8 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">Transaction History</h1>
            <p className="text-xs text-neutral-500 uppercase">View your account activity</p>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          {['all', 'deposit', 'withdrawal'].map((f) => (
            <button 
              key={f} 
              onClick={() => setFilter(f)} 
              className={`px-6 py-2 rounded-lg text-xs font-bold uppercase ${filter === f ? 'bg-white text-black' : 'text-white/50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <main className="w-full max-w-7xl px-8 py-6 z-10 flex flex-col gap-6">
        {loading ? (
          <div className="text-center">Loading transactions...</div>
        ) : (
          history.map((txn, index) => (
            <div key={txn.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between items-center hover:border-white/20 transition-all">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${txn.type === 'Deposit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white'}`}>
                  {txn.type === 'Deposit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                  <h3 className="font-bold">{txn.type}</h3>
                  <p className="text-xs text-neutral-400">{txn.sender} • {txn.timestamp}</p>
                </div>
              </div>
              <div 
                className={`text-xl font-mono amount-counter ${isStealthActive ? 'blur-sm' : ''}`}
                data-final-value={`${txn.type === 'Deposit' ? "+" : "-"}${txn.amount}`}
              >
                0
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default Activity;
