import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// 🌟 HIGH-CONTRASS PREMIUM ENTRY PORTAL WITH INTEGRATED MARKETING HUB
function AuthPage() {
  // Toggle state to switch between showing Login or Register form cleanly
  const [authMode, setAuthMode] = useState('login');

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 flex flex-col lg:flex-row antialiased">
      
      {/* 🧭 LEFT SIDE: COMPREHENSIVE PLATFORM INFO & BRANDING MARKETING HUB */}
      <div className="lg:w-7/12 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
        
        {/* Subtle background glow effect anchors */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-12 lg:mb-0">
          <span className="text-3xl lg:text-4xl bg-indigo-500/20 p-2.5 rounded-2xl border border-indigo-500/30 shadow-inner">🚀</span>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">CollabHub</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">The Student Network</p>
          </div>
        </div>

        {/* Core Platform Presentation Content Section */}
        <div className="max-w-xl my-auto space-y-6 lg:space-y-8">
          <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Connect, Collaborate, & Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400">Your Dream Team</span>
          </h2>
          
          <p className="text-base lg:text-lg text-slate-400 leading-relaxed font-medium">
            CollabHub is a specialized, real-time workspace crafted exclusively for college campuses. Stop scrambling to find team members for hackathons, group projects, and research papers.
          </p>

          {/* Feature Breakdown Rows */}
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-4 group">
              <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold p-2 rounded-xl mt-1 group-hover:bg-indigo-500/20 transition-all">⚡</div>
              <div>
                <h4 className="text-sm lg:text-base font-bold text-slate-200">Instant Live Announcements</h4>
                <p className="text-xs lg:text-sm text-slate-400 mt-0.5">Catch newly posted opportunities immediately through secure, built-in websocket pipes.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold p-2 rounded-xl mt-1 group-hover:bg-emerald-500/20 transition-all">📅</div>
              <div>
                <h4 className="text-sm lg:text-base font-bold text-slate-200">Strict Deadline Management</h4>
                <p className="text-xs lg:text-sm text-slate-400 mt-0.5">Track application deadlines clearly. Past opportunities are filtered out automatically.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-bold p-2 rounded-xl mt-1 group-hover:bg-sky-500/20 transition-all">🔗</div>
              <div>
                <h4 className="text-sm lg:text-base font-bold text-slate-200">LinkedIn Integrated Applications</h4>
                <p className="text-xs lg:text-sm text-slate-400 mt-0.5">Apply seamlessly by sharing your specialized profile and a tailored developer introduction pitch.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Metrics Showcase Dashboard Segment */}
        <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-8 mt-12 lg:mt-0 max-w-md">
          <div>
            <p className="text-xl lg:text-2xl font-black text-white">100%</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">Campus Exclusive</p>
          </div>
          <div>
            <p className="text-xl lg:text-2xl font-black text-indigo-400">Live</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">Socket Feeds</p>
          </div>
          <div>
            <p className="text-xl lg:text-2xl font-black text-emerald-400">Verified</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">Profiles</p>
          </div>
        </div>
      </div>

      {/* 🔐 RIGHT SIDE: DYNAMIC AUTH CONTROLLER PANEL */}
      <div className="lg:w-5/12 bg-slate-950 p-6 lg:p-12 flex flex-col justify-center items-center relative">
        <div className="w-full max-w-md space-y-8">
          
          {/* Controller Header Tab Selector */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-white tracking-tight sm:text-2xl">Get Started</h3>
            <p className="text-xs text-slate-500 mt-1">Access the internal student developer workspace.</p>

            {/* Premium Capsule Form Switcher Selector */}
            <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl mt-6 shadow-inner">
              <button 
                onClick={() => setAuthMode('login')} 
                className={`flex-1 text-center py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${authMode === 'login' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                🔐 Sign In Account
              </button>
              <button 
                onClick={() => setAuthMode('register')} 
                className={`flex-1 text-center py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${authMode === 'register' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                📝 Register Account
              </button>
            </div>
          </div>

          {/* Render Active Form Container With Styling Overrides */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 lg:p-8 shadow-2xl relative group hover:border-slate-800 transition-all">
            {authMode === 'login' ? (
              <div>
                <div className="mb-4 text-center sm:hidden">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Account Login</span>
                </div>
                <Login />
              </div>
            ) : (
              <div>
                <div className="mb-4 text-center sm:hidden">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Create Account</span>
                </div>
                <Register />
              </div>
            )}
          </div>

          <p className="text-center text-[11px] text-slate-600 font-medium">
            Protected by internal token authorization protocols. For student security verification, always use your assigned platform credentials.
          </p>
        </div>
      </div>

    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
