import React, { useState, useEffect } from 'react';
import Intro from './pages/Intro';
import Auth from './pages/Auth'; 
import Otp from './pages/Otp';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import Bills from './pages/Bills'; 
import Privacy from './pages/Privacy'; 
import Privacypolicy from './pages/Privacypolicy'; 
import Activity from './pages/Activity'; 
import Support from './pages/Support'; 
import Settings from './pages/Settings'; 
import Rewards from './pages/Rewards';   
import Deposit from './pages/Deposit';   

const App = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentStep, setCurrentStep] = useState('login');
  const [userToVerify, setUserToVerify] = useState("");
  const [activeView, setActiveView] = useState('dashboard');

  useEffect(() => {
    const introSeen = localStorage.getItem("estra_intro_seen");
    if (introSeen) { setShowIntro(false); }
    
    const token = sessionStorage.getItem("estra_token");
    if (token) {
      setIsAuthorized(true);
      setIsAdmin(sessionStorage.getItem("estra_role") === 'admin');
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    setIsAuthorized(false);
    setIsAdmin(false);
    setShowIntro(true); 
    setCurrentStep('login');
    setActiveView('dashboard');
  };

  const handleFinishIntro = () => {
    localStorage.setItem("estra_intro_seen", "true");
    setShowIntro(false);
  };

  const handleLoginDone = (username) => {
    setUserToVerify(username);
    setCurrentStep('otp');
  };

  const handleFinalSuccess = (userData) => {
    // Write tokens cleanly to storage first
    sessionStorage.setItem("estra_token", userData.token);
    sessionStorage.setItem("estra_role", userData.role);
    sessionStorage.setItem("estra_username", userToVerify); 
    sessionStorage.setItem("estra_acc_num", userData.account_number); 
    
    // Defer state authorization by a split frame to guarantee sessionStorage is readable by children
    setTimeout(() => {
      setIsAuthorized(true);
      setIsAdmin(userData.role === 'admin');
      setCurrentStep('login'); 
    }, 10);
  };

  return (
    <main className="w-full min-h-screen bg-[#000102] overflow-y-auto scroll-smooth">
      {showIntro ? (
        <Intro onFinish={handleFinishIntro} />
      ) : (
        <>
          {isAuthorized ? (
            <>
              {activeView === 'dashboard' && (
                <Dashboard 
                  onLogout={handleLogout} 
                  isAdmin={isAdmin} 
                  triggerTransfer={() => setActiveView('transfer')} 
                  triggerBills={() => setActiveView('bills')} 
                  triggerPrivacy={() => setActiveView('privacy')} 
                  triggerPrivacyPolicy={() => setActiveView('privacypolicy')} // New click trigger for sidebar
                  triggerActivity={() => setActiveView('activity')} 
                  triggerSupport={() => setActiveView('support')} 
                  triggerSettings={() => setActiveView('settings')} 
                  triggerRewards={() => setActiveView('rewards')}   
                  triggerDeposit={() => setActiveView('deposit')}   
                />
              )}
              {activeView === 'transfer' && (
                <Transfer onBack={() => setActiveView('dashboard')} />
              )}
              {activeView === 'bills' && (
                <Bills onBack={() => setActiveView('dashboard')} />
              )}
              {activeView === 'privacy' && ( 
                <Privacy onBack={() => setActiveView('dashboard')} />
              )}
              {activeView === 'privacypolicy' && ( // Added independent view handler
                <Privacypolicy onBack={() => setActiveView('dashboard')} />
              )}
              {activeView === 'activity' && ( 
                <Activity onBack={() => setActiveView('dashboard')} />
              )}
              {activeView === 'support' && ( 
                <Support onBack={() => setActiveView('dashboard')} />
              )}
              {activeView === 'settings' && ( 
                <Settings onBack={() => setActiveView('dashboard')} isAdmin={isAdmin} />
              )}
              {activeView === 'rewards' && (  
                <Rewards onBack={() => setActiveView('dashboard')} />
              )}
              {activeView === 'deposit' && (  
                <Deposit onBack={() => setActiveView('dashboard')} />
              )}
            </>
          ) : (
            <>
              {currentStep === 'login' ? (
                <Auth onAuthSuccess={handleLoginDone} />
              ) : (
                <Otp 
                  username={userToVerify} 
                  onAuthSuccess={handleFinalSuccess} 
                  onBack={() => setCurrentStep('login')} 
                />
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}

export default App;