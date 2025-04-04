import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './pages/firebaseConfig';
import Dashboard from './pages/dashboard';
import Signup from './pages/signup';
import Login from './pages/login';
import Footer from './components/footer';
import Navbar from './components/navbar';
import './index.css';
import UsersTable from './pages/users-display';
import Transactions from './pages/transactions';


function App() {
    const [user, setUser] = useState(null);
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    }, []);
  return (
    <Router>
      <div className='font-spaceGrotesk min-h-screen flex flex-col'>
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/transactions" element={user ? <Transactions /> : <Navigate to="/login" />} />
          <Route path="/users" element={<UsersTable />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        </Routes>
        
      </div>
      <Footer />
    </Router>
  );
}

export default App;
