import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://student-collaboration-platform.vercel.app';
      await axios.post(`${API_BASE}/api/register`, { name, email, password });
      alert("Registration successful! You can now sign in.");
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Create Account</h3>
      
      {/* HIGH-CONTRAST NAME FIELD */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          Full Name
        </label>
        <input 
          type="text" 
          placeholder="Enter your name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required 
          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner font-medium"
        />
      </div>

      {/* HIGH-CONTRAST EMAIL FIELD */}
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

      {/* HIGH-CONTRAST PASSWORD FIELD */}
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

      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all cursor-pointer shadow-md mt-4">
        Register Account
      </button>
    </form>
  );
}

export default Register;
