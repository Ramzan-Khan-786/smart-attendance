import React, {useState} from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const navigate = useNavigate();

  const submit = async () => {
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      if (res.data.user.role === 'admin') navigate('/admin');
      else navigate('/employee');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={{padding:20}}>
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} /><br/>
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /><br/>
      <button onClick={submit}>Login</button>
    </div>
  );
}
