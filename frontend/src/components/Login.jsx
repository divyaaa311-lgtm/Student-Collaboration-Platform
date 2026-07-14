import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://student-collaboration-platform.vercel.app';
      const response = await axios.post(`${API_BASE}/api/login`, { email, password });
      
      localStorage.setItem('studentToken', response.data.token);
      localStorage.setItem('studentName', response.data.user.name);
      localStorage.setItem('studentId', response.data.user.id);
      
      alert(`Login successful! Welcome back, ${response.data.user.name}.`);~
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || "Invalid credentials.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Account Login</h3>
      
      {/* INSERT HIGH-CONTRAST EMAIL CODE HERE */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          College Email
        </label>
        <input 
          type="email" 
          placeholder="Enter your college email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner font-medium"
        />
      </div>

      {/*  INSERT HIGH-CONTRAST PASSWORD CODE HERE */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          Password
        </label>
        <input 
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner font-medium"
        />
      </div>

      <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all cursor-pointer shadow-md mt-4">
        Sign In
      </button>
    </form>
  );
}

export default Login;

