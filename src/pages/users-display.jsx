import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { TrashIcon } from "@heroicons/react/16/solid";

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
   
  const handleDelete = async () => {
    if (!userToDelete) return;
  
    try {
      console.log("Deleting user:", userToDelete);
      console.log("User ID to delete:", userToDelete?.id);

      await deleteDoc(doc(db, "users", userToDelete.id));
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setShowModal(false);
      setUserToDelete(null);
      alert(`${userToDelete.firstName} was deleted successfully!`);
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };
  
  
  

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
        const userList = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id, // make sure this is included
          ...docSnap.data()
        }));        
        
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
    <div className="min-h-[80vh]">
    <div className="mt-10  mx-44 flex flex-col justify-center font-aoMono uppercase">
      <h2 className="text-3xl font-aoMono uppercase text-black font-bold mb-4">Registered Users</h2>
      <table className="min-w-full rounded  bg-white rounded-md shadow-lg ">
        <thead>
          <tr className="bg-gray-300">
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">First Name</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">lAST LOGIN</th>
            <th className="px-4 py-2 text-left text-sm text-center font-medium text-gray-500 uppercase tracking-wider">Actions</th>

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
                <td className="px-4 py-2 text-sm text-gray-900">
                  {user.lastLogin?.toDate
                    ? user.lastLogin.toDate().toLocaleString() // or toLocaleDateString(), toLocaleTimeString()
                    : "N/A"}
                </td>

                <td className="px-4 py-2 text-sm text-red-600 text-center">
                    <button
                      onClick={() => {
                        setUserToDelete(user);
                        setShowModal(true);
                      }}
                      className="text-red-600 hover:bg-red-100 p-2"
                    >
                      <TrashIcon className="w-4 h-4 inline"  />
                    </button>
                  </td>

              </tr>
            ))
          )}
        </tbody>
      </table>
      {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
              <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
              <p className="mb-6">
                Are you sure you want to delete{" "}
                <span className="font-bold">{userToDelete?.firstName} {userToDelete?.lastName}</span>?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 pt-1  bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 pt-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

    </div>
    </div>
    
  );
}
