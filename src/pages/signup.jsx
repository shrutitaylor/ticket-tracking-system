import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import navigation
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigation

  // const handleSignup = async (e) => {
  //   e.preventDefault();
  //   try {
  //     await createUserWithEmailAndPassword(auth, email, password);
  //     alert("Signup successful! Please log in.");
  //     navigate("/login"); // Redirect to login page
  //   } catch (err) {
  //     setError(err.message);
  //   }
  // };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Save user to Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: email,
        firstName: firstName || "", // get name from a signup form input
        lastName:lastName,
        createdAt: new Date(),
        lastLogin: new Date()
      });
  
      alert("Signup successful! Please log in.");
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Signup error:", error.message);
    }
  };
  return (
    <div className="flex flex-col font-spaceGrotesk items-center min-h-[80vh] justify-center">
      <form onSubmit={handleSignup} className="flex flex-col shadow-lg rounded-lg p-10 mt-24 min-w-96">
        <h1 className="text-2xl font-bold text-left">Signup</h1>

        <label htmlFor="firstName" className="mt-4 text-left">First Name</label>
        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="rounded-lg p-2 bg-gray-200" />

        <label htmlFor="lastName" className="mt-4 text-left">Last Name</label>
        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="rounded-lg p-2 bg-gray-200" />

        <label htmlFor="email" className="mt-4 text-left">Email</label>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-lg p-2 bg-gray-200" />

        <label htmlFor="password" className="mt-4 text-left">Password</label>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-lg p-2 bg-gray-200" />

        <button type="submit" className="rounded-lg mt-10 font-aoMono uppercase pt-3 pb-2 bg-black text-white hover:scale-105 transition-all duration-300">
          Signup
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default Signup;
