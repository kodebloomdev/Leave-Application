import { useState, useEffect } from "react";

export default function PrincipalDashboard() {
  const [time, setTime] = useState(new Date());

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateString = time.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timeString = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="w-full">

      {/* Welcome Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome back, <span className="text-blue-400">Dr. Sarah Thompson</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Principal Dashboard Overview
          </p>
        </div>

        <div className="text-right text-gray-700">
          <p className="text-sm font-medium">{dateString}</p>
          <p className="text-xs">{timeString}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition cursor-pointer">
          <h3 className="text-gray-500 text-sm">Overall Attendance Rate</h3>
          <p className="text-3xl font-bold mt-2 text-purple-600">95%</p>
          <p className="text-xs text-green-600 mt-1">+2.4% from last week</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition cursor-pointer">
          <h3 className="text-gray-500 text-sm">Pending Leave Requests</h3>
          <p className="text-3xl font-bold mt-2 text-yellow-600">08</p>
          <p className="text-xs text-gray-500 mt-1">Requires approval</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition cursor-pointer">
          <h3 className="text-gray-500 text-sm">Total Leave Requests</h3>
          <p className="text-3xl font-bold mt-2 text-blue-600">26</p>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </div>

      </div>

      {/* Recent Leave Requests */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Leave Requests</h3>
        
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Student</th>
              <th>Class</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="py-3">Amit Sharma</td>
              <td>8 A</td>
              <td>03 Feb 2025</td>
              <td><span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Pending</span></td>
            </tr>

            <tr className="border-b">
              <td className="py-3">Neha Patel</td>
              <td>9 B</td>
              <td>03 Feb 2025</td>
              <td><span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Approved</span></td>
            </tr>

            <tr>
              <td className="py-3">Rahul Verma</td>
              <td>10 C</td>
              <td>02 Feb 2025</td>
              <td><span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs">Rejected</span></td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}
    