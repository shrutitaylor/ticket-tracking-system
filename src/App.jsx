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
import { UserProvider } from './contexts/UserContext';
import { LoaderProvider } from './contexts/LoaderContext';
import Loader from './components/loader';
import Layout from './components/layout';
import Report from './pages/report';
import ActiveBoard from './pages/activeBoard';



function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // Add loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false); // Mark auth check complete
    });

    return () => unsubscribe();
  }, []);


  return (

     <LoaderProvider>
      <UserProvider>
        <Router>
          <Loader />
          <Navbar user={user} />
          <Layout>
            <Routes>
              <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/transactions" element={user ? <Transactions /> : <Navigate to="/login" />} />
              <Route path="/users" element={<UsersTable />} />
              <Route path="/report" element={<Report />} />
              <Route path="/active" element={<ActiveBoard />} /> 
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            </Routes>
          </Layout>
          <Footer />
        </Router>
      </UserProvider>
      </LoaderProvider>



  );
}

export default App;
