// Login.js
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[80vh] justify-center ">
      
      <form onSubmit={handleLogin}
      className="flex flex-col shadow-lg rounded-lg p-10 mt-24 min-w-96"
      >
        <h1 className="text-2xl font-bold text-left">Login</h1>
        <label htmlFor="email" className="mt-4 text-left">Email</label>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
        className="rounded-lg  p-2 bg-gray-200"
         />
          <label htmlFor="password" className="mt-4 text-left">Password</label>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
        className="rounded-lg p-2 bg-gray-200"
         />
        <button type="submit"
        className="rounded-lg mt-10 p-2 bg-black text-white hover:scale-105 transition-all duration-300"
        >Login</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Login;
