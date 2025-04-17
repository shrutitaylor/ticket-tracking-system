import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { useUser } from "../contexts/UserContext";
import { doc, getDoc } from "firebase/firestore";
import { useLoader } from "../contexts/LoaderContext";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { setFirstName } = useUser();
  const { setLoading } = useLoader();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
  
    try {
      // Step 1: Sign in via Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Step 2: Check if user exists in the Firestore 'users' collection
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        const name = userDocSnap.data().firstName || "";
        setFirstName(name);
        setLoading(false);
      } else {
        // Step 3: If no Firestore profile, log them out and show error
        await auth.signOut();
        console.warn("User authenticated but not found in Firestore users collection.");
        setError("Access denied. User not registered in the system.");
        setLoading(false);
      }
  
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col font-spaceGrotesk items-center min-h-[80vh] justify-center ">
      <form onSubmit={handleLogin} className="flex flex-col shadow-lg rounded-lg p-10 mt-24 min-w-96">
        <h1 className="text-2xl font-bold text-left ">Login</h1>
        <label htmlFor="email" className="mt-4 text-left">Email</label>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-lg p-2 bg-gray-200" />
        <label htmlFor="password" className="mt-4 text-left">Password</label>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-lg p-2 bg-gray-200" />
        <button type="submit" className="rounded-lg font-aoMono mt-10 uppercase pt-3 pb-2 bg-black text-white hover:scale-105 transition-all duration-300">
          Login
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default Login;
