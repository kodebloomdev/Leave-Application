import { useEffect, useState } from "react";
import axios from "axios";


import Header from "./Header";
import Sidebar from "./Sidebar";

export default function LeaveHistory() {
  const [leaves, setLeaves] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  console.log({ user });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/staff/leaves/${user.id}`
      );
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
          {/* Sidebar */}
          <Sidebar />
    
          {/* Main Content */}
          <div className="flex-1 ml-64">
            <Header />
    
            <div className="p-6">
              {/* Purple Banner */}
              <div className="bg-blue-400 text-white p-6 rounded-xl mb-6 flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-90">Attendance Overview</p>
                  <h2 className="text-2xl font-semibold">
                    Monitor daily attendance across classes
                  </h2>
                  
                </div>
                </div>
                </div>
    

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-left">From</th>
                <th className="p-3 text-left">To</th>
                <th className="p-3 text-left">Purpose</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l._id} className="border-t">
                  <td className="p-3">{l.student?.name}</td>
                  <td className="p-3">
                    {new Date(l.departureDate).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    {new Date(l.returnDate).toLocaleDateString()}
                  </td>
                  <td className="p-3">{l.purpose}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        l.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : l.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}

              {leaves.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No leave history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
