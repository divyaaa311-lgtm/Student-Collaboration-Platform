import React, { useState } from 'react';

import axios from 'axios'; // Import Axios link tool
import { useNavigate } from 'react-router-dom';


function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    try {
      // Send data straight to our backend API login route
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password
      });

      // Grab the secure token coming from our backend
      const token = response.data.token;
      
      // Save the token inside the browser's temporary storage locker
      localStorage.setItem('studentToken', token);
      localStorage.setItem('studentName', response.data.user.name); 
      localStorage.setItem('studentId', response.data.user.id);


      alert(`Login successful! Welcome back, ${response.data.user.name}.`);
      navigate('/dashboard');

      // Clear the form fields
      setEmail('');
      setPassword('');
    } catch (error) {
      // Display the exact mismatch error coming from our backend logic
      alert(`Error: ${error.response?.data?.message || "Login failed"}`);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '30px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Account Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>College Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Sign In</button>
      </form>
    </div>
  );
}

export default Login;

// import React, { useState } from 'react';

// function Login() {
//   // Login only needs email and password to verify the user
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault(); // Stop page reload
//     console.log("Login submitted with:", { email, password });
//     alert(`Attempting login for ${email}!`);
//   };

//   return (
//     <div style={{ maxWidth: '400px', margin: '30px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
//       <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Account Login</h2>
//       <form onSubmit={handleSubmit}>
//         <div style={{ marginBottom: '15px' }}>
//           <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>College Email:</label>
//           <input 
//             type="email" 
//             value={email} 
//             onChange={(e) => setEmail(e.target.value)} 
//             required 
//             style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
//           />
//         </div>
//         <div style={{ marginBottom: '20px' }}>
//           <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password:</label>
//           <input 
//             type="password" 
//             value={password} 
//             onChange={(e) => setPassword(e.target.value)} 
//             required 
//             style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
//           />
//         </div>
//         <button type="submit" style={{ width: '100%', padding: '12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
//           Sign In
//         </button>
//       </form>
//     </div>
//   );
// }

// export default Login;
