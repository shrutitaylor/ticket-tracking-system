// Signup.js
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Signup successful!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center ">
      
      <form onSubmit={handleSignup}
      className="flex flex-col shadow-lg rounded-lg p-10 mt-24  min-w-96"
      >
        <h1 className="text-2xl font-bold text-left">Signup</h1>
        <label htmlFor="firstName" className="mt-4 text-left">First Name</label>
        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required
        className="rounded-lg  p-2 bg-gray-200"
         />
          <label htmlFor="lastName" className="mt-4 text-left">Last Name</label>
        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required
        className="rounded-lg  p-2 bg-gray-200"
         />
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
        >Signup</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Signup;
