import { useState } from "react";
import { Bell, User, LogOut, Settings } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function StaffHeader({ staffName }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-blue-400 text-white shadow-md px-6 py-12 flex justify-between items-center">
      
      {/* Logo / Title */}
      <h1 className="text-3xl font-semibold tracking-wide">
       Welcome to Staff Dashboard
      </h1>

      <div className="flex items-center gap-6">
        
        {/* Notification Icon */}
        <div className="relative cursor-pointer hover:text-gray-200">
          <Bell size={22} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs px-1 rounded-full">
            3
          </span>
        </div>

        {/* Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="w-10 h-10 rounded-full bg-white text-blue-600 font-bold flex items-center justify-center hover:scale-95 transition"
          >
            {staffName?.charAt(0).toUpperCase() || "S"}
          </button>

          {/* Dropdown Menu */}
          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 shadow-lg rounded-lg p-2 text-sm z-30">
              <button className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full">
                <User size={16} /> Profile
              </button>
              <button className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full">
                <Settings size={16} /> Settings
              </button>
              <button
                className="flex items-center gap-2 p-2 hover:bg-gray-100 text-red-600 w-full"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  localStorage.removeItem("role");
                  window.location.href = "/";
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
