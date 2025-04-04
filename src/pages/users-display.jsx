import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "./firebaseConfig";

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.warn("No authenticated user found.");
        setLoading(false);
        return;
      }

      // Fetch Firebase custom claims (if using custom claims)
      const idTokenResult = await user.getIdTokenResult();
      if (user.email === "iolabs.au.ops@gmail.com") {
        setIsAdmin(true);
      } else {
        console.warn("User is not an admin.");
        setLoading(false);
        return;
      }

      try {
        const querySnapshot = await getDocs(
          query(collection(db, "users"), orderBy("lastLogin", "desc"))
        );
        const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!isAdmin) return <p>Access Denied. Only admins can view this page.</p>;

  return (
    <div className="mt-10 mx-44 flex flex-col justify-center ">
      <h2 className="text-2xl font-spaceGrotesk text-black font-bold mb-4">Registered Users</h2>
      <table className="min-w-full rounded  bg-white rounded-md shadow-lg ">
        <thead>
          <tr className="bg-gray-300">
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">First Name</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Email</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.length === 0 ? (
            <tr>
              <td colSpan="3" className="px-4 py-2 text-center text-gray-500">No registered users found.</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                {/* <td className="px-4 py-2 text-sm text-gray-900">{user.id}</td> */}
                <td className="px-4 py-2 text-sm text-gray-900">{user.firstName || "N/A"}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{user.lastName || "N/A"}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{user.email || "N/A"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
