import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FiClock,
  FiCheckCircle,
  FiUsers,
  FiAlertTriangle,
  FiPlus,
} from "react-icons/fi";

import Header from "./Header";          // SAME header as Principal
import Sidebar from "./Sidebar";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    processing: 0,
    emergency: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/leave/dashboard-stats"
      );
      setStats(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">

      {/* Sidebar */}
      <Sidebar />

      {/* Right content */}
      <div className="flex-1 ml-64 flex flex-col">

        {/* Header */}
        <Header principalName={user?.name} />

        {/* Page content */}
        <div className="p-6">

          {/* Title + Button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">
              Staff Dashboard
            </h1>

            <button
              onClick={() => navigate("/leave-request")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow"
            >
              <FiPlus />
              New Leave Request
            </button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            <StatCard
              icon={<FiClock />}
              label="Pending Requests"
              value={stats.pending}
              color="text-purple-600"
              bg="bg-purple-100"
            />

            <StatCard
              icon={<FiCheckCircle />}
              label="Approved Today"
              value={stats.approved}
              color="text-green-600"
              bg="bg-green-100"
            />

            <StatCard
              icon={<FiUsers />}
              label="Processing"
              value={stats.processing}
              color="text-yellow-600"
              bg="bg-yellow-100"
            />

            <StatCard
              icon={<FiAlertTriangle />}
              label="Emergency"
              value={stats.emergency}
              color="text-red-600"
              bg="bg-red-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- CARD COMPONENT ---------------- */
function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow flex items-center gap-4">
      <div className={`p-3 rounded-lg text-3xl ${bg} ${color}`}>
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-semibold">{value}</h2>
        <p className="text-gray-600 text-sm">{label}</p>
      </div>
    </div>
  );
}
