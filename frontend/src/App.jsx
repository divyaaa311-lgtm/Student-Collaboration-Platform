import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard'; // Import Dashboard

// We create a clean workspace component for the entry gate (Login + Register)
function AuthPage() {
  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', backgroundColor: '#ffffff', padding: '20px', borderBottom: '1px solid #e3e6f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h1 style={{ margin: '0', color: '#4e73df', fontSize: '2rem' }}>🎓 Student Collaboration Platform</h1>
        <p style={{ margin: '5px 0 0 0', color: '#858796' }}>Connect, Collaborate, Build Teams</p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px', padding: '20px' }}>
        <Register />
        <Login />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Route 1: The default home page shows login/register */}
        <Route path="/" element={<AuthPage />} />
        
        {/* Route 2: The dashboard path */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;

// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <section id="center">
//         <div className="hero">
//           <img src={heroImg} className="base" width="170" height="179" alt="" />
//           <img src={reactLogo} className="framework" alt="React logo" />
//           <img src={viteLogo} className="vite" alt="Vite logo" />
//         </div>
//         <div>
//           <h1>Get started</h1>
//           <p>
//             Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
//           </p>
//         </div>
//         <button
//           type="button"
//           className="counter"
//           onClick={() => setCount((count) => count + 1)}
//         >
//           Count is {count}
//         </button>
//       </section>

//       <div className="ticks"></div>

//       <section id="next-steps">
//         <div id="docs">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#documentation-icon"></use>
//           </svg>
//           <h2>Documentation</h2>
//           <p>Your questions, answered</p>
//           <ul>
//             <li>
//               <a href="https://vite.dev/" target="_blank">
//                 <img className="logo" src={viteLogo} alt="" />
//                 Explore Vite
//               </a>
//             </li>
//             <li>
//               <a href="https://react.dev/" target="_blank">
//                 <img className="button-icon" src={reactLogo} alt="" />
//                 Learn more
//               </a>
//             </li>
//           </ul>
//         </div>
//         <div id="social">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#social-icon"></use>
//           </svg>
//           <h2>Connect with us</h2>
//           <p>Join the Vite community</p>
//           <ul>
//             <li>
//               <a href="https://github.com/vitejs/vite" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#github-icon"></use>
//                 </svg>
//                 GitHub
//               </a>
//             </li>
//             <li>
//               <a href="https://chat.vite.dev/" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#discord-icon"></use>
//                 </svg>
//                 Discord
//               </a>
//             </li>
//             <li>
//               <a href="https://x.com/vite_js" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#x-icon"></use>
//                 </svg>
//                 X.com
//               </a>
//             </li>
//             <li>
//               <a href="https://bsky.app/profile/vite.dev" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#bluesky-icon"></use>
//                 </svg>
//                 Bluesky
//               </a>
//             </li>
//           </ul>
//         </div>
//       </section>

//       <div className="ticks"></div>
//       <section id="spacer"></section>
//     </>
//   )
// }

// export default App
// import React from 'react';

// function App() {
//   return (
//     <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
//       <h1>Student Collaboration Platform</h1>
//       <p>Welcome to Day 2! Our React workspace is clean and ready.</p>
//     </div>
//   );
// }

// export default App;
// import React from 'react';
// import Register from './components/Register'; // Import our new registration block

// function App() {
//   return (
//     <div style={{ fontFamily: 'sans-serif' }}>
//       <div style={{ textAlign: 'center', backgroundColor: '#f8f9fa', padding: '10px', borderBottom: '1px solid #ddd' }}>
//         <h1>Student Collaboration Platform</h1>
//       </div>
      
//       {/* Show the registration form components below */}
//       <Register />
//     </div>
//   );
// }

// export default App;
// import React from 'react';
// import Register from './components/Register';
// import Login from './components/Login'; // 1. Import our new login block

// function App() {
//   return (
//     <div style={{ fontFamily: 'sans-serif', margin: '0', padding: '0', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
//       {/* Top Main Header Banner */}
//       <div style={{ textAlign: 'center', backgroundColor: '#ffffff', padding: '20px', borderBottom: '1px solid #e3e6f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
//         <h1 style={{ margin: '0', color: '#4e73df', fontSize: '2rem' }}>🎓 Student Collaboration Platform</h1>
//         <p style={{ margin: '5px 0 0 0', color: '#858796' }}>Day 2: Interface Forms Workspace</p>
//       </div>
      
//       {/* Container to position forms on the page */}
//       <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px', padding: '20px' }}>
//         <Register />
//         <Login />
//       </div>
//     </div>
//   );
// }

// export default App;


